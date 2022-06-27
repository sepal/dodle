import { Guess, PlayState } from "./game"

export interface GlobalStats {
    played: number
    solved: number
    failed: number
    histogram: Array<number>
    currentStreak: number
    longestStreak: number
}

export interface GameEvent {
    event: string
    game_id: number
    played: number
    solved: number
    failed: number
    current_streak: number
    longest_streak: number
    guesses: Array<string>
    state: string
}