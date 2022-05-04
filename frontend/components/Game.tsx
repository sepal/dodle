import { useState } from "react";
import styled from "styled-components";
import Canvas from "../components/Canvas";
import Board from "../components/guesses";
import Input from "../components/Input";
import { GameData } from "../models/game_manager";

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

`

const EndMessage = styled.div`
    text-align: center;
    margin-top: 1.5em;
    font-size: 1.5em;
`

type GameProps = {
  game: GameData
};

const Game = ({game}: GameProps) => {
  const [guesses, setGuesses] = useState([]);
  const [playState, setPlayState] = useState(PlayState.playing);

  let message = "";

  switch (playState) {
    case PlayState.success:
      message = "🎉 Yay, you're correct! Congrats! 🍾";
      break;
    case PlayState.fail:
      message = `🥺 Sorry, you're wrong. The correct word is "${game.word}"`;
  }

  let today = new Date();
  let date = `date=${today.toISOString().split('T')[0]}`;
  let canvas = guesses.length < game.levels ? (
    <Canvas image={`/api/image?level=${guesses.length}&${date}`} />
  ) : (
    <Canvas image={`/api/image?level=${game.levels-1}}&${date}`} />
  )

  return (
      <GameFrame>
        {canvas}
        {guesses.length > 0 && <Board guesses={guesses} />}
        {(playState == PlayState.playing) ? 
          <Input guessHandler={(guess) => {
            if (guess.toLowerCase() != game.word) {
              guess += " ❌";
              if (guesses.length >= 4) {
                setPlayState(PlayState.fail)
              }
            }
            else {
              guess += " ✔️";
              setPlayState(PlayState.success)
            }
            setGuesses([...guesses, [guess]]);
          }} />
          :
          <EndMessage>{message}</EndMessage>
        }
      </GameFrame>
  )
};

export default Game;