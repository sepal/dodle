import { GlobalStats } from 'models/stats'
import Link from 'next/link'
import {FC} from 'react'
import styled from 'styled-components'
import { PlayState } from '../../models/game'
import ShareResult from './ShareResult'

type FailedMessageProps = {
    word: string,
    prompt: string,
}

type MessageProps = {
    state: PlayState 
    word: string
    prompt: string
    guesses: string[]
    maxGuesses: number
    gameId: number
    currentStreak: number
}

const MessageWrapper = styled.div`
  font-size: 1.5em;
  margin: 0 auto 1.5em auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SuccessMessage: FC<MessageProps> = ({word, prompt, guesses, maxGuesses, gameId, currentStreak} : MessageProps) => (
    <>
        <span>🎉 Yay, you&apos;re correct! Congrats! 🍾</span>
        <Link href="/stats"><>Streak: {currentStreak} 🔥</></Link>
    </>
)

export const FailedMessage: FC<FailedMessageProps> = ({word, prompt} : FailedMessageProps) => (
    <>🥺 Sorry, you&apos;re wrong. The correct word is &quot;{word}&quot;</>
)

export const EndMessage: FC<MessageProps> = ({state, word, prompt, guesses, maxGuesses, gameId, currentStreak} : MessageProps) => {
    const message = () => {
        switch (state) {
            case PlayState.success:
                return <SuccessMessage 
                    word={word} 
                    prompt={prompt} 
                    state={state} 
                    gameId={gameId}  
                    guesses={guesses} 
                    maxGuesses={maxGuesses}
                    currentStreak={currentStreak}/>
            case PlayState.fail:
                return <FailedMessage word={word} prompt={prompt} />
            default:
                return <></>
        }
    }

    return (
        <MessageWrapper>
            {message()}
            <ShareResult solution={word} gameId={gameId}  guesses={guesses} maxGuesses={maxGuesses} />
        </MessageWrapper>
    )
}