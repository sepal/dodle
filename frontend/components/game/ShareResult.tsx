import Button from "components/atoms/Button";
import { getShareText } from "lib/share_results";

interface Props {
    solution: string
    guesses: string[]
    maxGuesses: number
    gameId: number
}

export default function ShareResult({solution, guesses, maxGuesses, gameId} : Props) {
    const handleOnClick = () => {
        const result = getShareText(solution, guesses, maxGuesses, gameId);
        navigator.clipboard.writeText(result)
    }


    return (
        <>
            <Button onClick={handleOnClick}>Share result!</Button>
        </>
    )
}