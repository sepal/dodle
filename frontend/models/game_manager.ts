export const URL = process.env.GAME_MANGER_URL;

export type GameData = {
  word: string;
  levels: number;
  scores: [number];
  prompt: string;
};

export type ErrorResponse = {
  msg: string;
};
