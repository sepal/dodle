import Button from "components/atoms/Button";
import { getShareText } from "lib/share_results";
import { useState } from "react";
import ShareIcon from './icon--share.svg';


interface Props {
    solution: string
    guesses: string[]
    maxGuesses: number
    gameId: number
}

export default function ShareResult({solution, guesses, maxGuesses, gameId} : Props) {
    const [copied, setCopied] = useState<boolean>(false);

    const handleOnClick = () => {
        const result = getShareText(solution, guesses, maxGuesses, gameId);
        navigator.clipboard.writeText(result)
        setCopied(true);

        window.setTimeout(() => {
            setCopied(false);
        }, 1500);
    }

    const label = copied ? "Results copied to clip board!" : (
        <>Share results <ShareIcon style={{verticalAlign: "middle"}} /></>
    );

    return (
        <>
            <Button onClick={handleOnClick}>{label}</Button>
        </>
    )
}