import { LetterStatus } from "models/game"
import { ReactNode } from "react"
import styled from "styled-components"

interface Props {
    children: ReactNode
    keyValue: string
    type: LetterStatus
    isSpecial?: boolean
    onClick?: (val: string) => void
}

interface WrapperProps {
    type: LetterStatus
    isSpecial?: boolean
}

const Wrapper = styled.div<WrapperProps>`
    font-size: 1em;
    height: 3.5em;
    min-width: 2em;
}
    margin: 2px;

    @media (min-width: 700px) {
        margin: 6px;
    }
    
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    text-transform: capitalize;
    border-radius: 5px;
    user-select: none;

    &:active{
        box-shadow: 0px 0px 3px rgba(0,0,0,0.2) inset;
    }

    ${({ type }) => [
        `background: #f0f0f0;
        border: 1px solid #ddd;
        color: black;
        font-weight: normal;`,
        `background: #666`,
        `background: #67a760;`,
        `background: #c8b359;`
    ][type]}    

    ${({isSpecial}) => isSpecial && `flex: 1.5;`}
`

export function Key({children, keyValue, type, isSpecial, onClick} : Props) {
    const handleOnClick = () => {
        if (onClick) {
            onClick(keyValue.toLocaleLowerCase())
        }
    };
    return (
        <Wrapper type={type} isSpecial={isSpecial} onClick={handleOnClick} data-event-component="key">
            {children}
        </Wrapper>
    )
}