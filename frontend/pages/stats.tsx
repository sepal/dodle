import type { NextPage } from "next";
import Head from "next/head";
import useSWR from 'swr';
import Modal from '../components/page/GameModal'
import Game from "../components/game/Game";
import Header from "../components/page/Header";
import Stats from "../components/stats/Stats";
import { GameData } from "../models/game_manager";
import { useRouter } from "next/router";
import { fetcher } from "lib/fetcher";
import {ModalHeader} from 'components/atoms/headings';
import GameLoadingScreen from "components/game/LoadingGame";

const StatsPage: NextPage = () => {
    const { data, error } = useSWR<GameData>('/api/game', fetcher);
    const router = useRouter();

    return (
        <div>
            <Head>
                <title>Dodle</title>
                <meta name="description" content="Guess what the A.I. tried to draw." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />

            <main>
                <Modal isOpen={true} onClose={() => router.push("/")}>
                    <ModalHeader>Statistics</ModalHeader>
                    {data && <Stats game={data} />}
                </Modal>

                {error && "Sorry, couldn't load game."}
                {!data && <GameLoadingScreen />}
                {data && <Game game={data} />}
            </main>
        </div>
    );
};

export default StatsPage;
