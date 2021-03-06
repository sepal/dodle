import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import Head from "next/head";
import useSWR from 'swr';
import Modal from '../components/page/GameModal'
import Game from "../components/game/Game";
import Header from "../components/page/Header";
import { GameData } from "models/game_manager";
import { fetcher } from "lib/fetcher";
import styled from "styled-components";
import CompletedBoardRow from "components/game/GuessBoard/CompletedBoardRow";
import EmptyBoardRow from "components/game/GuessBoard/EmptyBoardRow";
import { LetterStatus } from "models/game";
import { useLocalStorage } from "lib/useLocalStorage";
import { ModalHeader } from "components/atoms/headings";
import { ExampleBoard } from "components/game/GuessBoard/ExampleBoard";
import GameLoadingScreen from "components/game/LoadingGame";


const HelpSection = styled.section`
    max-width: 512px;
`

const Center = styled.div`
    text-align: center;
`



const Help: NextPage = () => {
    const { data, error } = useSWR<GameData>('/api/game', fetcher);
    const router = useRouter();

    const [allowTracking, setAllowTracking] = useLocalStorage<boolean>("event_tracking", true);

    return (
        <div>
            <Head>
                <title>dodle help</title>
                <meta name="description" content="How to play the dodle guessing game." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />

            <main>
                <Modal isOpen={true} onClose={() => router.push("/")}>
                    <ModalHeader>How to play</ModalHeader>
                    <HelpSection>
                        <p>
                            Guess what an <b>AI</b> tried to <b>doodle</b> in 5 tries!
                        </p>
                        <Center>
                            <Image
                                alt="A.I. drawing"
                                src={"/toad0.png"}
                                quality={100}
                                width={256}
                                height={256}
                                />
                        </Center>
                        <div>
                            <ExampleBoard>
                                <CompletedBoardRow solution="toads" guess="frogs" />
                            </ExampleBoard>
                        </div>
                        <p>
                            After each guess, a new picture appears for the same word. 
                            Additionally, the colors of the tiles will change to indicate
                            how close you are to the solution.
                            <ul>
                                <li>
                                    Green means an exact match.
                                </li>
                                <li>
                                    Yellow means the letter is present in the word to guess,
                                    but at another position.
                                </li>
                                <li>
                                    Gray means the letter is absent in the solution.
                                </li>
                            </ul>
                        </p>
                        <form>
                            <input
                                type="checkbox"
                                id="tracking"
                                name="tracking"
                                checked={allowTracking}
                                onChange={(e) => setAllowTracking(e.target.checked)}
                            />
                            <label htmlFor="tracking">
                                Allow to track guesses to improve the game.
                            </label>
                        </form>
                    </HelpSection>
                </Modal>

                {error && "Sorry, couldn't load game."}
                {data && <GameLoadingScreen />}
            </main>
        </div>
    );
}

export default Help;