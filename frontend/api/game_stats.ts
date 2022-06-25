import {PlayState} from "../models/game"
import {GlobalStats} from "../models/stats"


export function calcStats(lastStats: GlobalStats, guesses: number,  state: PlayState) : GlobalStats {
    let stats = {...lastStats};
    stats.played++;
    stats.histogram[guesses]++;

    switch (state) {
        case PlayState.fail:
            stats.failed++;
            stats.currentStreak = 0;
            break;
        case PlayState.success:
            stats.solved++;
            stats.currentStreak++;
            break;
    }
    
    if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
    }

    return stats;
}