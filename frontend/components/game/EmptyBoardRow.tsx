import { LetterType } from "models/game";
import { Tile } from "./Tile";

interface Props {
    wordLen: number
    currentGuess: string
}

export function EmptyBoardRow({ wordLen, currentGuess }: Props) {
    const tiles = Array.from({ length: wordLen }, (_, i) => {
        const letter = currentGuess[i] ?? ""
        return (
            <Tile letter={letter} key={i} type={LetterType.INPUT} />
        );
    })
    return (
        <>
            {tiles}
        </>
    )
}