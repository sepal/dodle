import { getGuessLetterTypes, splitWord } from "lib/letter_status"
import { Tile } from "./Tile";

interface Props {
    solution: string
    guess: string
}

export default function CompletedBoardRow({ solution, guess }: Props) {
    const splitGuess = splitWord(guess);
    const letterTypes = getGuessLetterTypes(solution, guess);


    return (
        <>
            {splitGuess.map((letter, i) => <Tile letter={letter} key={i} type={letterTypes[i]} />)}
        </>
    )
} 