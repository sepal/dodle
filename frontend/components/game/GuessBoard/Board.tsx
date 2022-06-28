import { Guess, LetterStatus, PlayState } from "models/game";
import { GameData } from "models/game_manager";
import styled from "styled-components";
import CompletedBoardRow from "./CompletedBoardRow";
import EmptyBoardRow from "./EmptyBoardRow";

interface BoardProps {
    round: GameData
    guesses: Array<Guess>
    input: string
    playstate: PlayState
}

interface BoardWrapperProps {
    length: number
}

const BoardWrapper = styled.div<BoardWrapperProps>`
    display: grid;
    grid-gap: 3px;
    ${({ length }) => `grid-template-columns: repeat(${length}, 1fr);`}
    grid-auto-flow: row;
    font-weight: bold;
    ${({ length }) => `width: ${2.1 * length}em`};
    margin: 3em auto 0 auto;
`

export default function Board({ round, guesses, input, playstate }: BoardProps) {
    const completed = guesses.map((guess, i) => (
        <CompletedBoardRow solution={round.word} guess={guess.word} key={guess.word} />
    ));

    return (
        <BoardWrapper length={round.word.length}>
            {completed}
            {playstate == PlayState.playing && <EmptyBoardRow wordLen={round.word.length} currentGuess={input} />}
        </BoardWrapper>
    );
}