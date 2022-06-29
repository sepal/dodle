import Board from "./GuessBoard/Board";
import { PlayState } from "models/game"
import styled from "styled-components";
import Canvas from "./Canvas/Canvas";
import { GameData } from "models/game_manager";
import { Keyboard } from "./Keyboard/Keyboard";
import EmptyBoardRow from "./GuessBoard/EmptyBoardRow";
import { ExampleBoard } from "./GuessBoard/ExampleBoard";

const GameFrame = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;


export default function GameLoadingScreen () {
    return (
        <GameFrame>
        <Canvas image={"/android-chrome-192x192.png"} />
        <ExampleBoard wordLen={12}>
            <EmptyBoardRow wordLen={12} currentGuess="loading game" />
        </ExampleBoard>
        <Keyboard
            onChar={() => {}}
            onDelete={() => {}}
            onEnter={() => {}}
            guesses={[]}
            word={""} />
        </GameFrame>
    )
}