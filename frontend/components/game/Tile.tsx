import styled from "styled-components"

export enum TileType {
    INPUT,
    WRONG,
    CORRECT,
    PARTLY,
}

interface TileProps {
    letter: string
    type: TileType
}

interface TileWrapperProps {
    type: TileType
}

const TileWrapper = styled.div<TileWrapperProps>`
    display: inline-flex;
    justify-content: center;
    height: 2em;
    line-height: 2em;
    text-transform: capitalize;
    color: white;
    ${({ type }) => [
        `background: white;`,
        `background: #666`,
        `background: #67a760;`,
        `background: #c8b359;`
    ][type]}

    ${({type}) => type==TileType.INPUT && `border: 1px solid #ccc`}
`

export function Tile({letter, type} : TileProps) {
    return (
        <TileWrapper type={type}>
            {letter}
        </TileWrapper>
    )
}