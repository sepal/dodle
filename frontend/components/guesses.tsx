import styled from "styled-components"
import Input from "./Input"

type GuessesProps = {
    guesses: Array<string>
};

const BoardFrame = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.border};

    max-width: 512px;
    margin: 1.5em auto 0 auto;
`

const Guess = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.5em 1.5em;
    letter-spacing: 0.25em;
`

const Guesses =({guesses} : GuessesProps) => {

    const GuessesComps = guesses.map((guess, i) => (
        <Guess key={i}>{i+1}: {guess}</Guess>
    ));

    return (
        <BoardFrame>
            {GuessesComps}
        </BoardFrame>
    )
}

export default Guesses;