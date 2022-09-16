import argparse
import os
import dotenv
from typing import Callable, Iterable, Tuple, Sequence
from game import Game
import pandas as pd

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


    parser.add_argument("--from-csv",
                        type=str,
                        action=EnvDefault,
                        default=None,
                        envvar="FROM_CSV",
                        help="Load a list of prompts and guess words from a csv",
                        metavar="from_csv",
                        required=False)    
    args = parser.parse_args()

    if args.from_csv:
        df = pd.read_csv(args.from_csv)
        for index, row in df.iterrows():
            if row['used'] == False or row['used'] == 'No':
                df.iloc[index]['used'] = 'Used';
                game = Game(n_images=5, word=row["word"], prompt=row["prompt"])
                game.generate_game()
                game.save_game()
            break;

        df.to_csv(args.from_csv)    
    else:
        game = Game(args.n_images)
        game.generate_game()
        game.upload_files(args.bucket)
        game.push_game_data(args.sqs)


if __name__ == "__main__":
    main()
