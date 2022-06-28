import { LetterStatus } from "models/game"
import { useEffect } from "react"
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
margin-top: 3em;
`

const Row = styled.div`
    display: flex;
    justify-content: center;
`

export function Keyboard({
    onChar,
    onDelete,
    onEnter,
    guesses,
    word
}: Props) {

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
    }, [onChar, onDelete, onEnter]);

    return (
        <Wrapper>
            <Row>
                {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((v) => (
                    <Key 
                        type={LetterStatus.INPUT} 
                        key={v} 
                        onClick={handleKeyEvent}
                        keyValue={v}>{v}</Key>
                ))}
            </Row>
            <Row>
                {["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((v) => (
                    <Key 
                        type={LetterStatus.INPUT} 
                        key={v} 
                        onClick={handleKeyEvent}
                        keyValue={v}>{v}</Key>
                ))}
            </Row>
            <Row>
                {["Enter", "z", "x", "c", "v", "b", "n", "m", "Enter"].map((v) => (
                    <Key 
                        type={LetterStatus.INPUT} 
                        key={v} 
                        keyValue={v}
                        isSpecial={v.length > 1}
                        onClick={handleKeyEvent}>{v}</Key>
                ))}
            </Row>
        </Wrapper>
    )
}