import { getLetterTypes, splitWord } from "lib/words"
import { Tile } from "./Tile";

interface Props {
    solution: string
    guess: string
}

export default function CompletedBoardRow({ solution, guess }: Props) {
    const splitGuess = splitWord(guess);
    const letterTypes = getLetterTypes(solution, guess);


    return (
        <>
            {splitGuess.map((letter, i) => <Tile letter={letter} key={i} type={letterTypes[i]} />)}
        </>
    )
} 