import {PlayState} from "../models/game"
import {GlobalStats} from "../models/stats"


export function calcStats(lastStats: GlobalStats, guesses: number,  state: PlayState) : GlobalStats {
    let stats = {...lastStats};
    stats.played++;

    switch (state) {
        case PlayState.fail:
            stats.failed++;
            stats.currentStreak = 0;
            break;
        case PlayState.success:
            stats.solved++;
            stats.currentStreak++;
    
            stats.histogram[guesses]++;
            if (stats.currentStreak > stats.longestStreak) {
                stats.longestStreak = stats.currentStreak;
            }
            break;
    }

    return stats;
}