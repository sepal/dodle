import { useEffect } from "react"

interface Props {
    onChar: (letter: string) => void
    onDelete: () => void
    onEnter: () => void 
    guesses: Array<string>
    word: string
}

export function Keyboard({
    onChar,
    onDelete,
    onEnter,
} : Props) {

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (event.key === 'Backspace') {
                onDelete();
            } else if (event.key === 'Enter') {
                onEnter();
            } else if (event.key.length === 1) {
                const key = event.key.toLocaleLowerCase();
                if (key >= 'a' && key <= 'z') {
                    onChar(key);
                }
            }
        }

        window.addEventListener('keydown', listener);
        return () => {
            window.removeEventListener('keydown', listener);
        };
    }, [ onChar, onDelete, onEnter]);

    return (
        <div>
            Keyboard
        </div>
    )
}