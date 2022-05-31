import json
import io
import platform
import time
import logging

from matplotlib.cbook import get_sample_data
from dalle_sketch import generate_prompt, draw_sketch
import boto3
from botocore.exceptions import ClientError


class Image:
    def __init__(self, key, score) -> None:
        self.key = key
        self.score = score

class Game:

    def __init__(self, n_images=5) -> None:
        self.__word = ""
        self.__prompt = ""
        self.__files = []
        self.__images = []
        self.__n_images = n_images
        self.__prefix = None

    def generate_game(self):
        logging.info("Generating new game")
        self.__word, prompt = generate_prompt()
        logging.info("Drawing images for prompt %s" % prompt)
        self.__prompt, images, scores = draw_sketch(prompt, self.__n_images)

        self.__created_at = int(time.time())
        self.__prefix = f"inbox/{self.__created_at}"

        for i in range(self.__n_images):
            image = Image(f"{self.__prefix}/{i}.png", scores[i])
            self.__images.append(image)

            self.__files.append(io.BytesIO())
            images[i].save(self.__files[i], format="png")
            self.__files[i].seek(0)

        logging.info("Created game")

    @property
    def game_data(self):
        data = {
            "word": self.__word,
            "prompt": self.__prompt,
            "images": self.__images,
            "prefix": self.__prefix,
        }
        return json.dumps(data)


    def upload_files(self, bucket):
        s3_client = boto3.client('s3')

        for i in range(self.__n_images):
            # Upload image to s3
            s3_client.upload_fileobj(
                self.__files[i], # This is what i am trying to upload
                bucket,
                self.__images[i]
            )

        s3_client.put_object(
            Body=self.game_data,
            Bucket=bucket,
            Key=f"{self.__prefix}/game.json"
        )

    def push_game_data(self, queue_url):
        sqs = boto3.client("sqs")

        resp = sqs.send_message(
            QueueUrl=queue_url,
            MessageAttributes= {
                'Type': {
                    'DataType': 'String',
                    'StringValue': 'GameInbox',
                },
                'CreatedAt': {
                    'DataType': 'Number',
                    'StringValue': str(self.__created_at),
                },
                'CreatedBy': {
                    'DataType': 'String',
                    'StringValue': platform.node(),
                }

            },
            MessageBody=json.dumps(self.game_data),
            MessageGroupId="GameInbox",
            MessageDeduplicationId=str(self.__created_at),
        )

        data = self.game_data