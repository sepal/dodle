import type { NextApiRequest, NextApiResponse } from 'next'
import https from "https";
import { URL } from "../../models/game_manager";

export default function handler(
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

  console.log(`/${process.env.GAME_MANAGER_STAGE}/game/image?level=${level}`);
  https.get({
    host: URL,
    path: `/${process.env.GAME_MANAGER_STAGE}/game/image?level=${level}`,
    method: "GET",
    headers: {
      "X-API-Key": process.env.GAME_MANAGER_API_KEY,
      Accept: "image/png",
    }
  },
  (resp) => {
    let content_len = resp.headers['content-length'];
    if (content_len != undefined) {
      let buffer = Buffer.alloc(0)
      resp.on("data", (data) => {
        buffer = Buffer.concat([buffer, data]);
      });
      resp.on("end", () => {
        res.setHeader("max-age", "86400")
        res.setHeader("Content-type", "image/png");
        res.setHeader("Content-Disposition", 'inline; filename="image.png"')
        res.status(200).send(buffer);
      })
    }

  })
}