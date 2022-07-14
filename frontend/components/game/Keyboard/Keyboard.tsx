import { getGuessesLetterStates } from "lib/letter_status"
import { LetterStatus } from "models/game"
import { RefObject, useEffect } from "react"
import styled from "styled-components"
import { Key } from "./Key"

interface Props {
    onChar: (letter: string) => void
    onDelete: () => void
    onEnter: () => void
    guesses: Array<string>
    word: string
}

const Wrapper = styled.div`
max-width: 512px;
margin: 0 auto;
`

const Row = styled.div`
    display: flex;
    max-width: 100%;
    justify-content: center;
    margin: 0;
`

export function Keyboard({
    onChar,
    onDelete,
    onEnter,
    guesses,
    word
}: Props) {
    const letterStates = getGuessesLetterStates(word, guesses);
    const handleKeyEvent = (key: string) => {
        if (key === 'backspace' || key === 'delete') {
            onDelete();
        } else if (key === 'enter') {
            onEnter();
        } else if (key.length === 1) {
            if (key >= 'a' && key <= 'z') {
                onChar(key);
            }
        }
    }

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            handleKeyEvent(event.key.toLocaleLowerCase());
        }

        window.addEventListener('keydown', listener);
        return () => {
            window.removeEventListener('keydown', listener);
        };
    }, [onChar, onDelete, onEnter, handleKeyEvent]);

    return (
        <Wrapper data-event-component="keyboard">
            <Row>
                {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((v) => (
                    <Key 
                        type={letterStates[v] ?? LetterStatus.INPUT} 
                        key={v} 
                        onClick={handleKeyEvent}
                        keyValue={v}>{v}</Key>
                ))}
            </Row>
            <Row>
                {["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((v) => (
                    <Key 
                    type={letterStates[v] ?? LetterStatus.INPUT} 
                        key={v} 
                        onClick={handleKeyEvent}
                        keyValue={v}>{v}</Key>
                ))}
            </Row>
            <Row>
                {["Enter", "z", "x", "c", "v", "b", "n", "m", "Delete"].map((v) => (
                    <Key 
                    type={letterStates[v] ?? LetterStatus.INPUT} 
                        key={v} 
                        keyValue={v}
                        isSpecial={v.length > 1}
                        onClick={handleKeyEvent}>{v}</Key>
                ))}
            </Row>
        </Wrapper>
    )
}