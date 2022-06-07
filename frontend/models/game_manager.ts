export const URL = process.env.GAME_MANGER_URL;

export type GameImage = {
  id: number;
  level: number;
  score: number
}

export type GameData = {
  id: number;
  gameDate: number;
  word: string;
  prompt: string;
  images: Array<GameImage>;
  createdAt: number
};