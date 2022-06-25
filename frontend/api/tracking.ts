import { Guess, PlayState } from 'models/game';
import {GlobalStats} from 'models/stats'

interface Model {
    gameId: number
    played: number
    solved: number
    failed: number
    longestStreak: number
    guesses: Array<Guess>
    finalState: PlayState
}

export default function trackStats(gameId: number, stats: GlobalStats, finalState: PlayState, guesses?: Array<Guess>) {
    const data: Model = {
        played: stats.played,
        solved: stats.solved,
        failed: stats.failed,
        longestStreak: stats.longestStreak,
        guesses: guesses ?? [],
        finalState: finalState
    };
    console.log(JSON.stringify(data));
}