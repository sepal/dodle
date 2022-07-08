import { LetterStatus } from "models/game"
import styled from "styled-components"


interface TileProps {
    letter: string
    type: LetterStatus
    onClick?: () => void
}

interface TileWrapperProps {
    type: LetterStatus
}

const TileWrapper = styled.div<TileWrapperProps>`
    display: inline-flex;
    justify-content: center;
    height: 2em;
    line-height: 2em;
    text-transform: capitalize;
    color: white;
    margin: 0;
    ${({ type }) => [
        `background: white;
        border: 1px solid #ccc;
        color: black;
        font-weight: normal;`,
        `background: #666`,
        `background: #67a760;`,
        `background: #c8b359;`
    ][type]}
`

export function Tile({letter, type, onClick} : TileProps) {
    return (
        <TileWrapper type={type} onClick={onClick}>
            {letter}
        </TileWrapper>
    )
}