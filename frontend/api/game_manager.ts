import { time } from "console";
import https from "https";
import {URLSearchParams} from "url"
import { GameData } from "../models/game_manager";

const url = process.env.GAME_MANGER_URL;
const environment = process.env.GAME_MANAGER_STAGE;
const api_key = process.env.GAME_MANAGER_API_KEY;

function get(
  rel_path: string,
  accept?: string,
  query?: URLSearchParams
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (accept == undefined) {
        accept = "application/json"
    }

    let query_string = query?.toString()

    if (query_string == undefined) {
        query_string = ""
    }

    let path = `/${environment}/${rel_path}?${query_string}`;

    https.get({
        host: url,
        path: path,
        method: "GET",
        headers: {
          "X-API-Key": api_key,
          "Accept": accept,
        },
    }, (resp) => {
        let buffer = Buffer.alloc(0);

        resp.on("data", (data) => {
            buffer = Buffer.concat([buffer, data]);
        });

        resp.on("end", () => {
            if (resp.statusCode != 200) {
                reject({statusCode: resp.statusCode, body: buffer.toJSON()})
            }

            resolve(buffer);
        });

        resp.on("error", (err) => {
            reject(err)
        })
    });
  });
}

export type ErrorResponse = {
    msg: string;
};
  

export async function getGameData(): Promise<GameData> {
    const epoch = Math.round(Date.now() / 1000);
    const query = new URLSearchParams({
        "time": epoch.toString()
    });
    let buffer = await get("game", "application/json", query);
    let game = JSON.parse(buffer.toString());
    return game;
}

export async function getImage(level = 1): Promise<Buffer> {
    const epoch = Math.round(Date.now() / 1000);
    const query = new URLSearchParams({
        "level": level.toString(),
        "time": epoch.toString(),
    });
    let buffer = await get("game/image", "image/png", query)
    return buffer
}
