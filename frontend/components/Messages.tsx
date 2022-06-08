import {FC} from 'react'
import styled from 'styled-components'
import { PlayState } from '../models/game'

type MessageProps = {
    state: PlayState 
    word: string
    prompt: string
}

const MessageWrapper = styled.div`
  text-align: center;
  margin-top: 1.5em;
  font-size: 1.5em;
`;

export const SuccessMessage: FC<MessageProps> = ({word, prompt} : MessageProps) => (
    <>🎉 Yay, you&apos;re correct! Congrats! 🍾</>
)

export const FailedMessage: FC<MessageProps> = ({word, prompt} : MessageProps) => (
    <>🥺 Sorry, you&apos;re wrong. The correct word is &quot;{word}&quot;</>
)

export const EndMessage: FC<MessageProps> = ({state, word, prompt} : MessageProps) => {
    const message = () => {
        switch (state) {
            case PlayState.success:
                return <SuccessMessage word={word} prompt={prompt} state={state} />
            case PlayState.fail:
                return <FailedMessage word={word} prompt={prompt} state={state} />
            default:
                return <></>
        }
    }

    return (
        <MessageWrapper>{message()}</MessageWrapper>
    )
}