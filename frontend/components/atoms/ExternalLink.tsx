import { ReactNode } from "react"

interface Props {
    href: string
    children: ReactNode
}

export default function ExternalLink({ href, children }: Props) {
    return (
        <a
            href=""
            target="_blank"
            rel="nofollow">
            {children}
        </a>
    );
};