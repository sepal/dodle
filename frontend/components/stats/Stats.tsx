import styled from "styled-components";
import Histogram from "./Histogram"
import SingleStat from "./SingleStat"
import { Guess } from "../../models/game";
import { GlobalStats } from "../../models/stats";
import { useLocalStorage } from "../../lib/useLocalStorage";
import { GameData } from "../../models/game_manager";
import { useEffect, useState } from "react";


const StatsWrapper = styled.main`
    max-width: 600px;
    text-align: center;
`

const SingleStatsWrapper = styled.div`
    display: flex;
    text-align: center;
    justify-content: center;
`;

const H1 = styled.h1`
    margin-top: 0;
    margin-bottom: 1.5em
`

interface StatsProps {
    game: GameData
}

function Stats({ game }: StatsProps) {
    const [histoHighlight, setHistoHighlight] = useState<number|undefined>(undefined);
    const [guesses, setGuesses] = useLocalStorage<Guess[]>("guesses", []);
    const [stats, setStats] = useLocalStorage<GlobalStats>("global_stats", {
        played: 0,
        solved: 0,
        failed: 0,
        histogram: [],
        currentStreak: 0,
        longestStreak: 0,
    });

    useEffect(() => {
        const lastGame = parseInt(window.localStorage.getItem("last_game") ?? "-1");
        if (lastGame == game.id) {
            setHistoHighlight(guesses.length)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    });

    const solved = stats.played <= 0 ? 0 : stats.solved / stats.played * 100;

    return (
        <StatsWrapper>
            <H1>Statistics</H1>
            <SingleStatsWrapper>
                <SingleStat label="Games played" value={stats.played} />
                <SingleStat label="Games solved" value={solved} unit="%" />
                <SingleStat label="Current streak" value={stats.currentStreak} />
                <SingleStat label="Longest streak" value={stats.longestStreak} />
            </SingleStatsWrapper>
            <h2>Guess Distribution</h2>
            <Histogram label="Guess distribution" data={stats.histogram} hightlight={histoHighlight} />
        </StatsWrapper>
    );
}

export default Stats;