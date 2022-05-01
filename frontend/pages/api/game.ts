import type { NextApiRequest, NextApiResponse } from 'next'
import { getGame } from '../../utils/game'


type GameData = {
  word: string,
  prompt: string,
  scores: Array<number>,
  files: Array<string>
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameData>
) {
  let game = await getGame();

  res.status(200).json(game);
}
