import { useEffect, useState } from "react";
import styled from "styled-components";
import Canvas from "../components/Canvas";
import Guesses from "./Guesses";
import Input from "../components/Input";
import { GameData } from "../models/game_manager";
import { Guess } from "../models/game";

enum PlayState {
  playing,
  success,
  fail,
}

const GameFrame = styled.div`
  max-width: 512px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const EndMessage = styled.div`
  text-align: center;
  margin-top: 1.5em;
  font-size: 1.5em;
`;

type GameProps = {
  game: GameData;
};

const Game = ({ game }: GameProps) => {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [playState, setPlayState] = useState(PlayState.playing);

  useEffect(() => {
    let data = localStorage.getItem("guesses");
    if (data != undefined) {
      let g: Guess[] = JSON.parse(data);
      setGuesses(g);

      console.log(g[g.length - 1]);
      if (g.length > 0 && g[g.length - 1].correct) {
        setPlayState(PlayState.success);
      } else if (g.length >= game.levels && !g[g.length - 1].correct) {
        setPlayState(PlayState.fail);
      }
    }
  }, []);

  let message = "";

  switch (playState) {
    case PlayState.success:
      message = "🎉 Yay, you're correct! Congrats! 🍾";
      break;
    case PlayState.fail:
      message = `🥺 Sorry, you're wrong. The correct word is "${game.word}"`;
  }

  let today = new Date();
  let date = `date=${today.toISOString().split("T")[0]}`;
  let canvas =
    guesses.length < game.levels ? (
      <Canvas image={`/api/image?level=${guesses.length}&${date}`} />
    ) : (
      <Canvas image={`/api/image?level=${game.levels - 1}}&${date}`} />
    );

  return (
    <GameFrame>
      {canvas}
      {guesses.length > 0 && <Guesses guesses={guesses} />}
      {playState == PlayState.playing ? (
        <Input
          guessHandler={(input) => {
            let guess: Guess = {
              word: input,
              correct: input.toLowerCase() == game.word,
            };

            if (guesses.length >= 4 && !guess.correct) {
              setPlayState(PlayState.fail);
            } else if (guess.correct) {
              setPlayState(PlayState.success);
            }
            let nGuesses = [...guesses, guess];
            setGuesses(nGuesses);

            localStorage.setItem("guesses", JSON.stringify(nGuesses));
          }}
        />
      ) : (
        <EndMessage>{message}</EndMessage>
      )}
    </GameFrame>
  );
};

export default Game;
