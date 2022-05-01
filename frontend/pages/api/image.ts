import type { NextApiRequest, NextApiResponse } from 'next'
import fs from "fs/promises"
import { getGame } from '../../utils/game'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let game = getGame();

  game.l

  res.writeHead(200, {
    "Content-Type": "image/png"
  })
}