import {Kafka} from 'kafkajs'
import { Guess, PlayState } from 'models/game';
import {GlobalStats} from 'models/stats'

interface Model {
    gameId: number
    played: number
    solved: number
    failed: number
    longestStreak: number
    guesses: Array<string>
    finalState: string
}

function getPlayState(state: PlayState): string {
    switch (state) {
        case PlayState.fail:
            return 'fail';
        case PlayState.success:
            return 'success';
        default:
            return 'playing';
    };
}

export default async function trackStats(gameId: number, stats: GlobalStats, finalState: PlayState, guesses?: Array<Guess>) {
    const state = getPlayState(finalState);
    const guesses_string = guesses?.map((value) => value.word);
    
    const data: Model = {
        gameId: gameId,
        played: stats.played,
        solved: stats.solved,
        failed: stats.failed,
        longestStreak: stats.longestStreak,
        guesses: guesses_string ?? [],
        finalState: state,
    };

    await fetch("/api/track", {
        method: "POST",
        body: JSON.stringify(data),
    });
}