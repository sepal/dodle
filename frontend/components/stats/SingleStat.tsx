import styled from "styled-components"

interface SigleStatProps {
    label: string
    value: number
    unit?: string
}


const Wrapper = styled.div`
    margin: 0 0.5em;
`

const Value = styled.div`
    font-size: 1.5em;
    margin: 0 auto;
`

export default function SingleStat({ label, value, unit }: SigleStatProps) {
    return (
        <Wrapper>
            <Value>{value}{unit  ?? ""}</Value>
            <div>{label}</div>
        </Wrapper>
    )
}