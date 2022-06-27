import type { NextApiRequest, NextApiResponse } from 'next'
import type { GameEvent } from 'models/stats'
import { Kafka } from 'kafkajs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const reqData: GameEvent = JSON.parse(req.body);

    const broker = process.env['EVENT_BROKER'] ?? "localhost:9092";
    const ssl : boolean = process.env['EVENT_SSL'] == "1" ? true : false;
    const authorization = process.env["EVENT_AUTHORIZATION"];

    let config: any = {
      brokers: [broker],
    };

    if (ssl == true) {
      config['ssl'] = true; 
    }

    if (authorization) {
      const auth = JSON.parse(authorization);
      config = {...config, auth}
    }

    const kafka = new Kafka(config);

    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'dodle_user_event',
      messages: [
        { value: JSON.stringify(reqData) },
      ],
    });

    await producer.disconnect();
  }
}