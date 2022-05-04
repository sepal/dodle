import { ClientRequest, IncomingMessage, RequestOptions } from "http";
import https from "https";
import type { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse, getGameData } from "../../api/game_manager";
import { GameData } from "../../models/game_manager";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameData | ErrorResponse>
) {
  let game = await getGameData();
  res.status(200).json(game);
}
