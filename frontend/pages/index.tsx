import type { GetStaticProps, NextPage } from "next";
import useSWR from 'swr';
import Head from "next/head";
import Game from "../components/game/Game";
import Header from "../components/page/Header";
import { GameData } from "../models/game_manager";
import { fetcher } from "lib/fetcher";
import GameLoadingScreen from "components/game/LoadingGame";
import PostHog from "components/scripts/posthog";

interface Props {
  host: string
}

const Home: NextPage<Props> = ({ host }: Props) => {
  const { data, error } = useSWR<GameData>('/api/game', fetcher);
  let today = new Date();
  let date = `date=${today.toISOString().split("T")[0]}`;
  const image_url = `${host}/api/image?${date}`

  return (
    <div>
      <Head>
        <title>dodle - The daily AI guessing game</title>
        <meta name="description" content="Guess what the dodle AI tried to draw." />
        <meta property="og:title" content="dodle - The daily AI guessing game" />
        <meta property="og:description" content="Guess what the dodle AI tried to draw in 5 tries. Every day the AI gives a you a new picture to guess." />
        <meta property="og:image" content={image_url} />
        <meta property="twitter:image" content={image_url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content="Guess what the dodle AI tried to draw in 5 tries. Every day the AI gives a you a new picture to guess." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>

        {error && "Sorry, couldn't load game."}
        {!data && <GameLoadingScreen />}
        {data && <Game game={data} />}
      </main>

      <PostHog />
    </div>
  );
};

export const getStaticProps: GetStaticProps<Props> =
  async context => ({ props: { host: process.env['HOST'] || "" } });

export default Home;
