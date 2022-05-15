import argparse
import os
import dotenv
from typing import Callable, Iterable, Tuple, Sequence
from game import Game


class EnvDefault(argparse.Action):
    def __init__(self, envvar, required=True, default=None, **kwargs):
        if not default and envvar:
            if envvar in os.environ:
                default = os.environ[envvar]
        if required and default:
            required = False
        super(EnvDefault, self).__init__(default=default, required=required,
                                         **kwargs)

    def __call__(self, parser, namespace, values, option_string=None):
        setattr(namespace, self.dest, values)


def main():
    dotenv.load_dotenv()

    parser = argparse.ArgumentParser(description="Generate a dodle game")

    parser.add_argument("--bucket",
                        type=str,
                        action=EnvDefault,
                        envvar="BUCKET",
                        help="The bucket to which images should be uploaded",
                        metavar="bucket",
                        required=True)

    parser.add_argument("--sqs",
                        type=str,
                        action=EnvDefault,
                        envvar="SQS_URL",
                        help="The aws SQS url to which the new game data should be pushed",
                        metavar="sqs",
                        required=True)

    parser.add_argument("--n_images",
                        type=int,
                        default=5,
                        help="Number of images that should be generated for the given word",
                        metavar="n_images",
                        required=False)
    args = parser.parse_args()

    game = Game(args.n_images)
    game.generate_game()
    game.upload_files(args.bucket)
    game.push_game_data(args.sqs)


if __name__ == "__main__":
    main()
