import styled from "styled-components";
import Image from "next/image";
import Link from "next/link";
import StatsIcon from './icon--stats.svg'
import ALink from './../atoms/ALink'

const Title = styled.h1`
max-width: 256px;
font-size: 2em;
margin: 0 0 0 0;
color: #333;
text-align: center;
`;

const Wrapper = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 512px;
    margin: 0.5em auto;
`;

const Branding =  styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const A = styled.a`
color: #333;
cursor: pointer;
&:hover {
    color: #666;
}
`

export default function Header() {
    return (
        <Wrapper>
            <div></div>
            <Branding>
                <Image
                    src="/android-chrome-192x192.png"
                    alt="dodle"
                    width={24}
                    height={24}
                    layout="fixed"
                />
                <Title>Dodle</Title>
            </Branding>
            <div>
                <Link href="/stats">
                    <ALink aria-label="Statistics"><StatsIcon /></ALink>
                </Link>
            </div>
        </Wrapper>
    )
}