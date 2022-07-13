import type { NextPage } from "next";
import useSWR from 'swr';
import Head from "next/head";
import Game from "../components/game/Game";
import Header from "../components/page/Header";
import { GameData } from "../models/game_manager";
import { fetcher } from "lib/fetcher";
import GameLoadingScreen from "components/game/LoadingGame";
import PostHog from "components/scripts/posthog";



const Home: NextPage = () => {
  const { data, error } = useSWR<GameData>('/api/game', fetcher);
  let today = new Date();
  let date = `date=${today.toISOString().split("T")[0]}`;
  const image_url = `/api/image?${date}`

  return (
    <div>
      <Head>
        <title>dodle</title>
        <meta name="description" content="Guess what the dodle AI tried to draw." />
        <meta property="og:image" content={image_url} />
        <meta property="twitter:image" content={image_url} />
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

export default Home;
