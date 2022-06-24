import type { NextPage } from "next";
import Head from "next/head";
import styled from "styled-components";
import Game from "../components/game/Game";
import Header from "../components/page/Header";
import Stats from "../components/stats/Stats";
import { GameData } from "../models/game_manager";


type HomeProps = {
  game: GameData;
};

const Home: NextPage<HomeProps> = ({ game }: HomeProps) => {
  return (
    <div>
      <Head>
        <title>Dodle</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        <Game game={game} />
        {/* <Stats game={game} /> */}
      </main>
    </div>
  );
};

export async function getServerSideProps() {
  const url = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${url}/api/game/`);
  const game = await res.json();

  return { props: { game: game } };
}

export default Home;
