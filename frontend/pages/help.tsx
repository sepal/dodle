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
import { Tile } from "components/game/GuessBoard/Tile";
import { LetterStatus } from "models/game";


const HelpSection = styled.section`
    max-width: 512px;
`

const ExampleBoard = styled.div`
display: grid;
grid-gap: 3px;
grid-template-columns: repeat(5, 1fr);
grid-auto-flow: row;
font-weight: bold;
margin: 3em auto 0 auto;
width: ${2.1*5}em;
`

const Help: NextPage = () => {
    const { data, error } = useSWR<GameData>('/api/game', fetcher);
    const router = useRouter();

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
                    <h2>How to play</h2>
                    <HelpSection>
                        <p>
                        Guess what an A.I. tried to <b>doodle</b> in 5 tries!
                        </p>
                        <p>
                            The goal of the game is to try to guess what an A.I. tried to draw.
                            With each guess you get a new image, that represents the <b>same</b>
                            &nbsp;word. Each new image <i>should</i> be better then the 
                            previous one and thus theoratically make it clearer what the word 
                            to guess is.<br/>
                            Unfortunatelly the A.I. is sometimes kind of a abstract artist and thus
                            a new image might not make clearer it 😄.
                        </p>
                        <p>
                            With each guess the tiles will also change color as an additional hint,
                            which indicates which letters were correct.
                        </p>
                        <h3>Examples</h3>
                        <p>
                            <ExampleBoard>
                                <EmptyBoardRow wordLen={5} currentGuess="dodle" />
                                <CompletedBoardRow solution="dodle" guess="wordl" />
                            </ExampleBoard>
                            <ul>
                                <li>
                                    Green means an exact match.
                                </li>
                                <li>
                                    Yellow means the letter is pressent in the word to guess.
                                </li>
                                <li>
                                    Gray means the letter is absent in the solution.
                                </li>
                            </ul>
                        </p>
                        <p>
                            A game can be played once a day. Normally every day there should be a 
                            new image to guess. Since the game is WIP that might currently not 
                            happen.
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