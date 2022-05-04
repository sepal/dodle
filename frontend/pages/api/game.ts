import { ClientRequest, IncomingMessage, RequestOptions } from "http";
import https from "https";
import type { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse, GameData, URL } from "../../models/game_manager";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameData | ErrorResponse>
) {
  https.get(
    {
      host: URL,
      path: `/${process.env.GAME_MANAGER_STAGE}/game`,
      method: "GET",
      headers: {
        "X-API-Key": process.env.GAME_MANAGER_API_KEY,
        Accept: "application/json",
      },
    },
    (resp) => {
      resp.setEncoding("utf-8");
      let body = "";
      resp.on("data", (data) => {
        body += data;
      });
      resp.on("end", () => {
        console.log(resp.statusCode);

        if (resp.statusCode != 200) {
          console.log(
            `Got ${resp.statusCode} error from game manager: ${body}`
          );
          res.status(500).json({ msg: "Internal server error." });
        } else {
          const game: GameData = JSON.parse(body);
          res.status(200).json(game);
        }
      });
    }
  );
}
