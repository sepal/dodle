import { count } from "console";
import { getGameCountdown } from "lib/datetime";
import { useEffect, useState } from "react";
import styled from "styled-components"

const Wrapper = styled.div`
font-size: 1.5em;
margin: 0 auto;
text-align:center;
`

export default function CountDown() {
    const [countdown, setCountDown] = useState(getGameCountdown());

    useEffect(() => {
        const interval = setInterval(() => {
            setCountDown(getGameCountdown);
        }, 1000);
        return () => clearInterval(interval);
    }, [])

    return (
        <Wrapper>
            Next dodle in:<br />{countdown}
        </Wrapper>
    )
}