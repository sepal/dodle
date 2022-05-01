import styled from "styled-components"
import Input from "./Input"

type GuessesProps = {
    guesses: Array<string>
};

const BoardFrame = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.border};

    max-width: 512px;
    margin: 1.5em auto;
`

const Guess = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.5em;
`

const Board =({guesses} : GuessesProps) => {

    const GuessesComps = guesses.map((guess, i) => (
        <Guess key={i}>{guess}</Guess>
    ));

    return (
        <BoardFrame>
            {GuessesComps}
        </BoardFrame>
    )
}

export default Board;