import { useEffect } from "react";
import Histogram from "../components/stats/Histogram"
import SingleStat from "../components/stats/SingleStat"
import { GlobalStats } from "../models/stats";
import { useLocalStorage } from "../utils/useLocalStorage";

function Stats() {
    const [stats, setStats] = useLocalStorage<GlobalStats>("global_stats", {
        played: 0,
        solved: 0,
        failed: 0,
        histogram: [],
        currentStreak: 0,
        longestStreak: 0,
    });

    const solved = stats.played > 0 ? 0 : stats.solved/stats.played * 100;


    return (
        <div>
            <div>
                <SingleStat label="Games played" value={stats.played} />
                <SingleStat label="Games solved" value={solved} is_percentage={true} />
                <SingleStat label="Current streak" value={stats.currentStreak} />
                <SingleStat label="Longest streak" value={stats.longestStreak} />
            </div>
            <Histogram label="Guess distribution" data={stats.histogram} />
        </div>
    );
}

export default Stats;