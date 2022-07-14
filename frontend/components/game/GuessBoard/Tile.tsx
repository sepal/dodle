import { LetterStatus } from "models/game"
import styled from "styled-components"


interface TileProps {
    letter: string
    type: LetterStatus
    active?: boolean
    onClick?: () => void
}

interface TileWrapperProps {
    type: LetterStatus
    active?: boolean
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
    ${({active}) => {
        if (active === true) {
            return `
            box-shadow: 0 0 3px #ddd inset;
            color: #333;
            animation: 1s blink step-end infinite;
            @keyframes "blink" {
                from, to {
                  color: transparent;
                }
                50% {
                  color: #333;
                }
              }
            `
        }
    }}
`

export function Tile({letter, type, active, onClick} : TileProps) {
    const content = (type == LetterStatus.INPUT && active) ? 
        "|" : letter;

    const component_name = type == LetterStatus.INPUT ? "board-tile--input" : "board-tile"; 

    return (
        <TileWrapper 
            type={type} 
            onClick={onClick} 
            active={active} 
            data-event-component={component_name}>
            {content}
        </TileWrapper>
    )
}