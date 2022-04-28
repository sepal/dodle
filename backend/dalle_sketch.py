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

DALLE_MODEL = "dalle-mini/dalle-mini/wzoooa1c:latest"  # can be wandb artifact or 🤗 Hub or local folder or google bucket
DALLE_COMMIT_ID = None

# VQGAN model
VQGAN_REPO = "dalle-mini/vqgan_imagenet_f16_16384"
VQGAN_COMMIT_ID = "e93a26e7707683d349bf5d5c41c5b0ef69b677a9"

# CLIP model
CLIP_REPO = "openai/clip-vit-large-patch14"
CLIP_COMMIT_ID = None

class DalleSketcher:

    def __init__(self) -> None:

        self.__model = DalleBart.from_pretrained(DALLE_MODEL, revision=DALLE_COMMIT_ID)
        self.__vqgan = VQModel.from_pretrained(VQGAN_REPO, revision=VQGAN_COMMIT_ID)
        self.__clip = FlaxCLIPModel.from_pretrained(CLIP_REPO, revision=CLIP_COMMIT_ID)
        self.__clip_processor = CLIPProcessor.from_pretrained(CLIP_REPO, revision=CLIP_COMMIT_ID)
        
        self.__model._params = replicate(self.__model.params)
        self.__vqgan._params = replicate(self.__vqgan.params)
        self.__clip._params = replicate(self.__clip.params)

        self.__words = np.load("./words.npy", allow_pickle=True)
        self.__adjectives = np.load("./adjectives.npy", allow_pickle=True)
        self.__colors = np.load("./colors.npy", allow_pickle=True)

    @partial(jax.pmap, axis_name="batch", static_broadcasted_argnums=(3, 4, 5, 6))
    def p_generate(
        self, tokenized_prompt, key, params, top_k, top_p, temperature, condition_scale
    ):
        """
        Model inference.
        """
        return self.__model.generate(
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
    def p_decode(self, indices, params):
        return self.__vqgan.decode_code(indices, params=params)

    # score images

    @partial(jax.pmap, axis_name="batch")
    def p_clip(self, inputs, params):
        logits = self.__clip(params=params, **inputs).logits_per_image
        return logits

    def generate_prompt(self, doodle=True):
        item = np.random.choice(self.__words)
        color = np.random.choice(self.__colors)
        adj = np.random.choice(self.__adjectives)

        prompt = f"{adj} {color} {item}"
        if doodle:
            prompt += " doodle"

        return item, prompt

    def draw_sketch(self, prompt, n_predictions=5):
        # create a random key
        seed = random.randint(0, 2**32 - 1)
        key = jax.random.PRNGKey(seed)

        # Load the text processor and create a tokenized text.
        processor = DalleBartProcessor.from_pretrained(DALLE_MODEL, revision=DALLE_COMMIT_ID)
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
            encoded_images = self.p_generate(
                tokenized_prompt,
                shard_prng_key(subkey),
                self.__model.params,
                gen_top_k,
                gen_top_p,
                temperature,
                cond_scale,
            )
            # remove BOS
            encoded_images = encoded_images.sequences[..., 1:]
            # decode images
            decoded_images = self.p_decode(encoded_images, self.__vqgan.params)
            decoded_images = decoded_images.clip(0.0, 1.0).reshape((-1, 256, 256, 3))
            for img in decoded_images:
                images.append(Image.fromarray(np.asarray(img * 255, dtype=np.uint8)))

            from flax.training.common_utils import shard

        # get clip scores
        clip_inputs = self.__clip_processor(
            text=[prompt] * jax.device_count(),
            images=images,
            return_tensors="np",
            padding="max_length",
            max_length=77,
            truncation=True,
        ).data
        logits = self.p_clip(shard(clip_inputs), self.__clip.params)
        logits = logits.squeeze().flatten()

        indices = logits.argsort()
        sorted_images = [images[idx] for idx in indices]
        sorted_score = logits[indices]
        return prompt, sorted_images, sorted_score