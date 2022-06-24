import styled from "styled-components";
import Histogram from "../components/stats/Histogram"
import SingleStat from "../components/stats/SingleStat"
import { GlobalStats } from "../models/stats";
import { useLocalStorage } from "../utils/useLocalStorage";


const StatsWrapper = styled.main`
    margin: 1.5em auto;
    max-width: 600px;
    text-align: center;
`

const SingleStatsWrapper = styled.div`
    display: flex;
    text-align: center;
    justify-content: center;
`;

function Stats() {
    const [stats, setStats] = useLocalStorage<GlobalStats>("global_stats", {
        played: 0,
        solved: 0,
        failed: 0,
        histogram: [],
        currentStreak: 0,
        longestStreak: 0,
    });

    const solved = stats.played <= 0 ? 0 : stats.solved / stats.played * 100;

    return (
        <StatsWrapper>
            <h1>Statistics</h1>
            <SingleStatsWrapper>
                <SingleStat label="Games played" value={stats.played} />
                <SingleStat label="Games solved" value={solved} unit="%" />
                <SingleStat label="Current streak" value={stats.currentStreak} />
                <SingleStat label="Longest streak" value={stats.longestStreak} />
            </SingleStatsWrapper>
            <h2>Guess Distribution</h2>
            <Histogram label="Guess distribution" data={stats.histogram} />
        </StatsWrapper>
    );
}

export default Stats;