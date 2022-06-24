interface SigleStatProps {
    label: string
    value: number
    is_percentage?: boolean
}

export default function SingleStat({ label, value, is_percentage = false }: SigleStatProps) {
    return (
        <div>
            <div>{label}</div>
            <div>{value}{is_percentage ?? " %"}</div>
        </div>
    )
}