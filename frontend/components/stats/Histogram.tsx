import styled from "styled-components";

interface HistogramProps {
    label: string
    data: Array<number>
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

const Value = styled.div`
    display: inline-block;
    padding: 0;
    padding-left: 0.5em;
    min-width: 1.5em;
    background: #666;
    font-weight: bold;
    color: white;
`

export default function Histogram({ label, data }: HistogramProps) {
    const maxVal = Math.max(...data);
    const histogramData = data.map((value: number, index: number) => {
        const perc = value / maxVal;
        return (
            <Row>
                <Label>{index}</Label>
                <Value
                    style={{
                        width: `${perc * 100}%`
                    }}>
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