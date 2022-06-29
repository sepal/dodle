import type { NextPage } from "next";
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


const HelpSection = styled.section`
    max-width: 512px;
`

const ExampleBoard = styled.div`
display: grid;
grid-gap: 3px;
grid-template-columns: repeat(5, 1fr);
grid-auto-flow: row;
font-weight: bold;
margin: 0 auto;
width: ${2.1 * 5}em;
`

const Help: NextPage = () => {
    const { data, error } = useSWR<GameData>('/api/game', fetcher);
    const router = useRouter();

    const [allowTracking, setAllowTracking] = useLocalStorage<boolean>("event_tracking", true);

    return (
        <div>
            <Head>
                <title>Dodle</title>
                <meta name="description" content="Dodle help page." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />

            <main>
                <Modal isOpen={true} onClose={() => router.push("/")}>
                    <ModalHeader>How to play</ModalHeader>
                    <HelpSection>
                        <p>
                            Guess what an A.I. tried to <b>doodle</b> in 5 tries!
                        </p>
                        <p>
                            The goal of the game is to try to guess what an A.I. tried to draw.
                            With each guess you get a new image, that represents the <b>same</b>
                            &nbsp;word. Each new image <i>should</i> be better then the
                            previous one and thus theoretically make it clearer what the word
                            to guess is.<br />
                            Unfortunately the A.I. is sometimes kind of a abstract artist and thus
                            a new image might not make clearer it 😄.
                        </p>
                        <p>
                            With each guess the tiles will also change color as an additional hint,
                            which indicates which letters were correct.
                        </p>
                        <h3>Examples</h3>
                        <div>
                            <ExampleBoard>
                                <EmptyBoardRow wordLen={5} currentGuess="dodle" />
                                <CompletedBoardRow solution="dodle" guess="wordl" />
                            </ExampleBoard>
                            <ul>
                                <li>
                                    Green means an exact match.
                                </li>
                                <li>
                                    Yellow means the letter is present in the word to guess but at
                                    another position.
                                </li>
                                <li>
                                    Gray means the letter is absent in the solution.
                                </li>
                            </ul>
                        </div>
                        <p>
                            A game can be played once a day. Normally every day there should be a
                            new image to guess. Since the game is WIP that might currently not
                            happen.
                        </p>
                        <div>
                            The game tracks the following <b>anonymous</b> stats in order to improve it:
                            <ul>
                                <li>If was completed and if it was successful</li>
                                <li>Stats from the stats page</li>
                                <li>The entered guesses per game</li>
                            </ul>
                            No private or identifiable data is tracked.
                            You can still opt out by clicking though:
                        </div>
                        <form>
                            <input
                                type="checkbox"
                                id="tracking"
                                name="tracking"
                                checked={allowTracking}
                                onChange={(e) => setAllowTracking(e.target.checked)}
                            />
                            <label htmlFor="tracking">
                                Allow to track game statistics.
                            </label>
                        </form>
                        <hr/>
                        <p>
                            Created by&nbsp;
                            <a href="https://twitter.com/sepgil" 
                            target="_blank" rel="noreferrer">@sepgil</a><br/>
                            Code can be found on&nbsp;
                            <a href="https://github.com/sepal/dodle"
                            target="_blank" rel="noreferrer">github/sepal/dodle</a>
                        </p>

                    </HelpSection>
                </Modal>

                {error && "Sorry, couldn't load game."}
                {data && <Game game={data} />}
            </main>
        </div>
    );
}

export default Help;