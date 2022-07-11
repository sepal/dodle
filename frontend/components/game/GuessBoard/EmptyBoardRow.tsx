import { LetterStatus } from "models/game";
import { Tile } from "./Tile";

interface Props {
    wordLen: number
    currentGuess: string
    currentLetter?: number
    onClick?: (tile_index: number) => void
}

export default function EmptyBoardRow({ wordLen, currentGuess, currentLetter, onClick}: Props) {

    const tiles = Array.from({ length: wordLen }, (_, i) => {
        const letter = currentGuess[i] ?? "";
        return (
            <Tile 
                letter={letter} key={i} 
                type={LetterStatus.INPUT} 
                active={currentLetter===i}
                onClick={() => {
                    if (onClick) {
                        onClick(i);
                    }
                }} />
        );
    })


    return (
        <>
            {tiles}
        </>
    )
}