import json
import io
import time
import logging
from dalle_sketch import generate_prompt, draw_sketch
import boto3
from botocore.exceptions import ClientError

class Game:

    def __init__(self, n_images=5, game_time=None) -> None:
        self.__item = ""
        self.__prompt = ""
        self.__scores = ""
        self.__images = []
        self.__files = []
        self.__n_images = n_images
        self.__time = game_time

    def generate_game(self):
        logging.info("Generating new game")
        self.__item, prompt = generate_prompt()
        logging.info("Drawing images for prompt %s" % prompt)
        self.__prompt, images, self.__scores = draw_sketch(prompt, self.__n_images)

        for i in range(self.__n_images):
            self.__files.append(f"{self.__item}{i}.png")

            self.__images.append(io.BytesIO())
            images[i].save(self.__images[i], format="png")
            self.__images[i].seek(0)

        logging.info("Created game")

    @property
    def game_data(self):
        data = {
            "word": self.__item,
            "prompt": self.__prompt,
            "scores": self.__scores.tolist(),
            "files": self.__files, 
        }
        return json.dumps(data)

    def upload_game(self, bucket):
        s3_client = boto3.client('s3')
        if self.__time==None:
            epoch_time = int(time.time())

        base_key = f"game/{epoch_time}"

        for i in range(self.__n_images):
            key = f"{base_key}/{self.__files[i]}"
            # Upload image to s3
            s3_client.upload_fileobj(
                self.__images[i], # This is what i am trying to upload
                bucket,
                key
            )

        data = self.game_data

        s3_client.put_object(
            Body=data,
            Bucket=bucket,
            Key=f"{base_key}/game.json"
        )


if __name__ == "__main__":
    game = Game()
    game.generate_game()
    game.upload_game("dodle")