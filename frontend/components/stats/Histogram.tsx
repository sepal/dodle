import styled from "styled-components";

interface HistogramProps {
    label: string
    data: Array<number>
    hightlight?: number
}

const Row = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    margin-bottom: 0.5em;
    text-align: left;
`

const Label = styled.div`
    margin-right: 0.5em;
`

interface ValueProps {
    active: boolean
    width: number
}

const Value = styled.div<ValueProps>`
    display: inline-block;
    padding: 0 0.75em;
    padding-left: 0.5em;
    min-width: 1.5em;
    background: #666;
    font-weight: bold;
    color: white;
    text-align: right;

    ${({ active }) => active && `
        background: rgb(50, 200, 100);
    `}

    ${({ width }) => `width: ${width}%`}
`

export default function Histogram({ label, data, hightlight }: HistogramProps) {
    const maxVal = Math.max(...data);
    const histogramData = data.map((value: number, index: number) => {
        const perc = value / maxVal;
        const guess_index = index + 1;
        return (
            <Row key={index}>
                <Label>{guess_index}</Label>
                <Value
                    active={guess_index === hightlight}
                    width={perc * 100}>
                    {value}
                </Value>
            </Row>
        )
    });
    
    return (
        <div>
            <div>
                {histogramData}
            </div>
        </div>
    )
};