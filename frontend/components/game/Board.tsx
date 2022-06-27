import { Guess } from "models/game";
import styled from "styled-components";
import {Tile, TileType} from "./Tile";

interface BoardProps {
    word: string
    guesses: Array<Guess>
    input: string
}

interface BoardWrapperProps {
    length: number
}

const BoardWrapper = styled.div<BoardWrapperProps>`
    display: grid;
    grid-gap: 3px;
    grid-template-columns: repeat(10, 1fr);
    grid-auto-flow: row;
    font-weight: bold;

    ${({ length }) => `width: ${2.1*length}em`};
    margin: 0 auto;
`

function getTileType(word: string, letter: string, pos: number): TileType {
    if (word.toLowerCase()[pos] == letter.toLowerCase()) {
        return TileType.CORRECT;
    } else if (word.toLowerCase().includes(letter.toLowerCase()) && letter != "") {
        return TileType.PARTLY;
    }
    return TileType.WRONG;
}

export default function Board({ word, guesses, input }: BoardProps) {
    const word_array = Array.from(word);

    const rows = guesses.map((guess, i) => {
        const tiles = word_array.map((_, i) => {
            const letter = guess.word[i] ?? "";

            const type = getTileType(word, letter, i);

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
    
    const inputTiles = word_array.map((_, i) => {
        const letter = i < input.length ? input[i] : "";
        return (
        <Tile letter={letter} key={i} type={TileType.INPUT} />
        )
    });

    return (
        <BoardWrapper  length={word.length}>
            <>{rows}{inputTiles}</>
        </BoardWrapper>
    );
}