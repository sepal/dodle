import fs from "fs/promises";

type GameData = {
  word: string;
  prompt: string;
  scores: Array<number>;
  files: Array<string>;
};

export async function getGame(): Promise<GameData> {
  const buffer = await fs.readFile("./game/game.json");
  let game: GameData = JSON.parse(buffer.toString());

  game.files = game.files.map(f => `game/${f}`);

  return game;
}