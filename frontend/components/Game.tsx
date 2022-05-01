import { useState } from "react";
import styled from "styled-components";
import Canvas from "../components/Canvas";
import Board from "../components/guesses";
import Input from "../components/Input";

enum PlayState {
  playing,
  success,
  fail,
}

const gameData = {
  word: "toad",
  prompt: "delicate orange toad doodle",
  scores: [
    19.11056137084961, 24.723907470703125, 26.59560775756836,
    27.740201950073242, 28.941102981567383,
  ],
  files: [
    "/game/toad0.png",
    "/game/toad1.png",
    "/game/toad2.png",
    "/game/toad3.png",
    "/game/toad4.png",
  ],
};

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

const Game = () => {
  const [guesses, setGuesses] = useState([]);
  const [playState, setPlayState] = useState(PlayState.playing);

  let image = gameData.files[guesses.length > 4 ? 4 : guesses.length];

  let message = "";

  switch (playState) {
    case PlayState.success:
      message = "🎉 Yay, you're correct! Congrats! 🍾";
      break;
    case PlayState.fail:
      message = `🥺 Sorry, you're wrong. The correct word is "${gameData.word}"`;
  }


  return (
      <GameFrame>
        <Canvas image={image} />
        {guesses.length > 0 && <Board guesses={guesses} />}
        {(playState == PlayState.playing) ? 
          <Input guessHandler={(guess) => {
            if (guess.toLowerCase() != gameData.word) {
              guess += " ❌";
              if (guesses.length >= 4) {
                setPlayState(PlayState.fail)
              }
            }
            else {
              guess += " ✔️";
              setPlayState(PlayState.success)
            }
            setGuesses([...guesses, guess]);
          }} />
          :
          <EndMessage>{message}</EndMessage>
        }
      </GameFrame>
  )
};

export default Game;