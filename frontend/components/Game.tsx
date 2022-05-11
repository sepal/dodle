import { useEffect, useState } from "react";
import styled from "styled-components";
import Canvas from "../components/Canvas";
import Guesses from "./Guesses";
import Input from "../components/Input";
import { GameData } from "../models/game_manager";
import { Guess, PlayState } from "../models/game";
import { useLocalStorage } from "../utils/useLocalStorage";
import { get_date } from "../utils/datetime";
import { EndMessage, FailedMessage, SuccessMessage } from "./Messages";

const GameFrame = styled.div`
  max-width: 512px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

type GameProps = {
  game: GameData;
};

const Game = ({ game }: GameProps) => {
  const [guesses, setGuesses] = useLocalStorage<Guess[]>("guesses", []);
  const [playState, setPlayState] = useLocalStorage<PlayState>(
    "playState",
    PlayState.playing
  );

  useEffect(() => {
    const currentDate = get_date();
    const lastDate = localStorage.getItem("last_played");

    if (lastDate == null || (lastDate && lastDate < currentDate)) {
      setPlayState(PlayState.playing);
      setGuesses([]);
      localStorage.setItem("last_played", currentDate);
    }
  }, []);

  let message = <EndMessage {...game} state={playState} />;


  // This allows us to circumvent the browser image cache for each day.
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
          }}
        />
      ) : (
        <EndMessage state={playState} word={game.word} prompt={game.prompt} /> 
      )}
    </GameFrame>
  );
};

export default Game;
