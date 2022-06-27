import { Guess } from "models/game";
import styled from "styled-components";
import { Tile, TileType } from "./Tile";

interface TileRowProps {
    guess: Guess
}

const RowWrapper = styled.div``

export default function TileRow( {guess} : TileRowProps ) {
    const tiles = Array.from(guess.word).map((letter, i) => {

        return (
            <Tile letter={letter} key={i} type={TileType.WRONG} />
        )
    });
    console.log(tiles);
    return (
        <RowWrapper>
            {tiles}
        </RowWrapper>
    )
}