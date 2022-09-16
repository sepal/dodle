import os
import random
import jax
import logging
import jax.numpy as jnp
from flax.jax_utils import replicate
from dalle_mini import DalleBart, DalleBartProcessor
from transformers import CLIPProcessor, FlaxCLIPModel
from vqgan_jax.modeling_flax_vqgan import VQModel
from functools import partial
from dalle_mini import DalleBartProcessor
from flax.training.common_utils import shard_prng_key
import numpy as np
from PIL import Image

os.environ['WANDB_MODE'] = "offline"

# can be wandb artifact or 🤗 Hub or local folder or google bucket
DALLE_MODEL = "dalle-mini/dalle-mini/mega-1-fp16:latest"
DALLE_COMMIT_ID = None

# VQGAN model
VQGAN_REPO = "dalle-mini/vqgan_imagenet_f16_16384"
VQGAN_COMMIT_ID = "e93a26e7707683d349bf5d5c41c5b0ef69b677a9"

# CLIP model
CLIP_REPO = "openai/clip-vit-base-patch32"
CLIP_COMMIT_ID = None

model = DalleBart.from_pretrained(DALLE_MODEL, revision=DALLE_COMMIT_ID)
vqgan = VQModel.from_pretrained(VQGAN_REPO, revision=VQGAN_COMMIT_ID)
clip = FlaxCLIPModel.from_pretrained(CLIP_REPO, revision=CLIP_COMMIT_ID)
clip_processor = CLIPProcessor.from_pretrained(
    CLIP_REPO, revision=CLIP_COMMIT_ID)

model._params = replicate(model.params)
vqgan._params = replicate(vqgan.params)
clip._params = replicate(clip.params)

words = np.load("./assets/words.npy", allow_pickle=True)
used_words = np.load("./assets/used_words.npy", allow_pickle=True)
adjectives = np.load("./assets/adjectives.npy", allow_pickle=True)
colors = np.load("./assets/colors.npy", allow_pickle=True)
words[~np.isin(words, used_words)]

if len(words) <= 0:
    print("No words left!!")
    raise SystemExit(1)

@partial(jax.pmap, axis_name="batch", static_broadcasted_argnums=(3, 4, 5, 6))
def p_generate(
    tokenized_prompt, key, params, top_k, top_p, temperature, condition_scale
):
    """
    Model inference.
    """
    return model.generate(
        **tokenized_prompt,
        prng_key=key,
        params=params,
        top_k=top_k,
        top_p=top_p,
        temperature=temperature,
        condition_scale=condition_scale,
    )

# decode image


@partial(jax.pmap, axis_name="batch")
def p_decode(indices, params):
    return vqgan.decode_code(indices, params=params)

# score images


@partial(jax.pmap, axis_name="batch")
def p_clip(inputs, params):
    logits = clip(params=params, **inputs).logits_per_image
    return logits


def generate_prompt(doodle=True):
    item = np.random.choice(words)
    color = np.random.choice(colors)
    adj = np.random.choice(adjectives)

    prompt = f"{adj} {color} {item}"
    if doodle:
        prompt += " doodle"

    words = words[np.where(words != item)]
    np.save("./assets/words.npy", words)

    return item, prompt


def draw_sketch(prompt, n_predictions=5):
    # create a random key
    seed = random.randint(0, 2**32 - 1)
    key = jax.random.PRNGKey(seed)

    # Load the text processor and create a tokenized text.
    processor = DalleBartProcessor.from_pretrained(
        DALLE_MODEL, revision=DALLE_COMMIT_ID)
    tokenized_prompt = processor([prompt])
    tokenized_prompt = replicate(tokenized_prompt)

    # We can customize top_k/top_p used for generating samples
    gen_top_k = None
    gen_top_p = None
    temperature = 0.85
    cond_scale = 3.0

    # generate images
    images = []
    for i in range(max(n_predictions // jax.device_count(), 1)):
        # get a new key
        key, subkey = jax.random.split(key)
        # generate images
        encoded_images = p_generate(
            tokenized_prompt,
            shard_prng_key(subkey),
            model.params,
            gen_top_k,
            gen_top_p,
            temperature,
            cond_scale,
        )
        # remove BOS
        encoded_images = encoded_images.sequences[..., 1:]
        # decode images
        decoded_images = p_decode(encoded_images, vqgan.params)
        decoded_images = decoded_images.clip(
            0.0, 1.0).reshape((-1, 256, 256, 3))
        for img in decoded_images:
            images.append(Image.fromarray(
                np.asarray(img * 255, dtype=np.uint8)))

        from flax.training.common_utils import shard

    # get clip scores
    clip_inputs = clip_processor(
        text=[prompt] * jax.device_count(),
        images=images,
        return_tensors="np",
        padding="max_length",
        max_length=77,
        truncation=True,
    ).data
    logits = p_clip(shard(clip_inputs), clip.params)
    logits = logits.squeeze().flatten()

    indices = logits.argsort()
    sorted_images = [images[idx] for idx in indices]
    sorted_score = logits[indices]
    return prompt, sorted_images, sorted_score


if __name__ == "__main__":
    item, prompt = generate_prompt()
    n_prompt, images, score = draw_sketch(prompt, 5)

    print(item)
    print(n_prompt)
    for i in range(len(images)):
        print(score[i])
        images[i].save(f"{item}{i}.png", format="png")
