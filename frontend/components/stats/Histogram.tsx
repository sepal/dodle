interface HistogramProps {
    label: string
    data: Array<number>
}

export default function Histogram({ label, data }: HistogramProps) {
    const histogramData = data.map((value: number, index: number) => (
        <div>
            <span>{index}:</span>
            <span>{value}</span>
        </div>

    ));
    return (
        <div>
            <div>{label}</div>
            <div>
                {histogramData}
            </div>
        </div>
    )
};