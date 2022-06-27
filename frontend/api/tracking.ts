import { Kafka } from 'kafkajs'
import { Guess, PlayState } from 'models/game';
import { GlobalStats } from 'models/stats'

interface GameEvent {
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

export default async function trackStats(event: string,
    gameId: number,
    stats: GlobalStats,
    finalState: PlayState,
    guesses?: Array<Guess>) {
    const state = getPlayState(finalState);
    const guesses_string = guesses?.map((value) => value.word);

    const data: GameEvent = {
        event: event,
        game_id: gameId,
        played: stats.played,
        solved: stats.solved,
        failed: stats.failed,
        current_streak: stats.currentStreak,
        longest_streak: stats.longestStreak,
        guesses: guesses_string ?? [],
        state: state,
    };

    await fetch("/api/track", {
        method: "POST",
        body: JSON.stringify(data),
    });
}