export interface GlobalStats {
    played: number
    solved: number
    failed: number
    histogram: Array<number>
    currentStreak: number
    longestStreak: number
}

export interface GameStats {
    guesses: Array<string>
    attempts: number
    roundId: number
}