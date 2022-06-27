import { Guess, PlayState } from 'models/game';
import { GlobalStats, GameEvent } from 'models/stats'

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

export default async function trackEvent(event: string,
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

    await fetch("/api/event", {
        method: "POST",
        body: JSON.stringify(data),
    });
}