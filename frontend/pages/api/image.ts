import type { NextApiRequest, NextApiResponse } from 'next'
import https from "https";
import { URL } from "../../models/game_manager";
import { getImage } from '../../api/game_manager';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let level = 0;
  let n_str = req.query["level"];
  if (typeof n_str == "string") {
    let n = parseInt(n_str);
    if (n != undefined) {
      level = n
    }
  }

  let buffer = await getImage(level);
  res.setHeader("max-age", "86400")
  res.setHeader("Content-type", "image/png");
  res.setHeader("Content-Disposition", 'inline; filename="image.png"')
  res.status(200).send(buffer);
}