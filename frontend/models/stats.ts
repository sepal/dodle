import { Guess, PlayState } from "./game"

export interface GlobalStats {
    played: number
    solved: number
    failed: number
    histogram: Array<number>
    currentStreak: number
    longestStreak: number
}

export interface TrackinData {
    gameId: number
    played: number
    solved: number
    failed: number
    longestStreak: number
    guesses: Array<Guess>
    finalState: PlayState
}