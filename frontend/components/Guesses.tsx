import styled from "styled-components"
import {Guess} from "../models/game"

type GuessesProps = {
    guesses: Guess[]
};

const BoardFrame = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.border};

    max-width: 512px;
    margin: 1.5em auto 0 auto;
`

const GuessWrapper = styled.div`
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.5em 1.5em;
    letter-spacing: 0.25em;
`

const Guesses =({guesses} : GuessesProps) => {

    const GuessesComps = guesses.map((guess, i) => (
        <GuessWrapper key={i}>{i+1}: {guess.word} {guess.correct ? "✔️" : "❌" }</GuessWrapper>
    ));

    return (
        <BoardFrame>
            {GuessesComps}
        </BoardFrame>
    )
}

export default Guesses;