import { Guess, LetterType, PlayState } from "models/game";
import { GameData } from "models/game_manager";
import styled from "styled-components";
import {Tile} from "./Tile";

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
    ${({length}) => `grid-template-columns: repeat(${length}, 1fr);`}
    grid-auto-flow: row;
    font-weight: bold;

    ${({ length }) => `width: ${2.1*length}em`};
    margin: 0 auto;
`

function getTileType(word: string, letter: string, pos: number): LetterType {
    if (word.toLowerCase()[pos] == letter.toLowerCase()) {
        return LetterType.CORRECT;
    } else if (word.toLowerCase().includes(letter.toLowerCase()) && letter != "") {
        return LetterType.PARTLY;
    }
    return LetterType.WRONG;
}

export default function Board({ round, guesses, input, playstate }: BoardProps) {
    const word_array = Array.from(round.word);

    let rows = guesses.map((guess, i) => {
        const tiles = word_array.map((_, i) => {
            const letter = guess.word[i] ?? "";

            const type = getTileType(round.word, letter, i);

            return (
                <Tile letter={letter} key={i} type={type} />
            )
        });

       return (
        <>
        {tiles}
        </>
       )
    });
    
    if (guesses.length < round.images.length && playstate == PlayState.playing) {
        const inputTiles = word_array.map((_, i) => {
            const letter = i < input.length ? input[i] : "";
            return (
            <Tile letter={letter} key={i} type={LetterType.INPUT} />
            )
        });

        rows = [...rows, ...inputTiles];
    }

    return (
        <BoardWrapper  length={round.word.length}>
            <>{rows}</>
        </BoardWrapper>
    );
}