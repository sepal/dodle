import { useEffect, useState } from "react";
import styled from "styled-components";
import Canvas from "./Canvas";
import { GameData } from "../../models/game_manager";
import { Guess, PlayState } from "../../models/game";
import { useLocalStorage } from "../../lib/useLocalStorage";
import { EndMessage } from "./Messages";
import { GlobalStats } from "../../models/stats";
import { calcStats } from "../../api/game_stats";
import trackEvent from "api/track_event";
import Board from "./Board";
import { Keyboard } from "./Keyboard";

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

function getLevel(game: GameData, guesses: Array<Guess>): number {
  const last_level = game.images[game.images.length - 1].level;
  if (guesses.length > 0
    && guesses[guesses.length - 1].correct 
    && guesses.length < last_level) {
    return guesses.length;
  }

  if (guesses.length >= last_level) {
    return last_level;
  }
  return guesses.length + 1;
}


const Game = ({ game }: GameProps) => {
  const [guesses, setGuesses] = useLocalStorage<Guess[]>("guesses", []);
  const [playState, setPlayState] = useLocalStorage<PlayState>(
    "playState",
    PlayState.playing
  );
  const [stats, setStats] = useLocalStorage<GlobalStats>("global_stats", {
    played: 0,
    solved: 0,
    failed: 0,
    histogram: new Array(game.images.length).fill(0),
    currentStreak: 0,
    longestStreak: 0,
  });
  const [currentGuess, setCurrentGuess] = useState<string>("");

  
  useEffect(() => {
    const lastGame = parseInt(window.localStorage.getItem("last_game") ?? "-1");
    if (lastGame != game.id) {
      setPlayState(PlayState.playing);
      setGuesses([]);
      window.localStorage.setItem("last_game", game.id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let message = <EndMessage {...game} state={playState} />;

  const level = getLevel(game, guesses)

  const handleGuess = () => {
    if (playState != PlayState.playing) {
      return;
    }

    let guess: Guess = {
      word: currentGuess,
      correct: currentGuess.toLowerCase() == game.word,
    };

    const nGuesses = [...guesses, guess];
    setGuesses(nGuesses);
    setCurrentGuess("");

    // If game has finished.
    if (nGuesses.length >= game.images.length || guess.correct) {
        const newState = guess.correct ? PlayState.success : PlayState.fail;
        const newStats = calcStats(stats, nGuesses.length, newState);
        
        setPlayState(newState);
        setStats(newStats);
        trackEvent("finishedGame", game.id, newStats, newState, nGuesses)
    } else if(nGuesses.length  == 1) {
      trackEvent("startedGame", game.id, stats, playState, nGuesses)
    };
  }

  const handleOnChar = (letter: string) => {
    if (playState == PlayState.playing)
      setCurrentGuess(currentGuess + letter);
  };

  const handleOnDelete = () => {
    if (playState == PlayState.playing)
      setCurrentGuess(currentGuess.slice(0, -1));
  };


  // This allows us to circumvent the browser image cache for each day.
  let today = new Date();
  let date = `date=${today.toISOString().split("T")[0]}`;
  const image_url = `/api/image?level=${level}&${date}`


  return (
    <GameFrame>
      <Canvas image={image_url} />
      <Board round={game} guesses={guesses} input={currentGuess} playstate={playState} />
      {playState == PlayState.playing ? (
        <Keyboard 
          onChar={handleOnChar} 
          onDelete={handleOnDelete} 
          onEnter={handleGuess}
          guesses={guesses.map((g) => g.word)}
          word={game.word} />
      ) : (
        <EndMessage state={playState} word={game.word} prompt={game.prompt} />
      )}
    </GameFrame>
  );
};

export default Game;
