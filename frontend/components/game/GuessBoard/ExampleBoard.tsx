import { wrap } from "module";
import styled from "styled-components";

interface Props {
    wordLen?: number
}

export const ExampleBoard = styled.div<Props>`
display: grid;
grid-gap: 3px;

${({wordLen}) => `
grid-template-columns: repeat(${wordLen ?? 5}, 1fr);
width: ${2.1 * (wordLen ?? 5)}em;
` }

grid-auto-flow: row;
font-weight: bold;
margin: 0 auto;
`