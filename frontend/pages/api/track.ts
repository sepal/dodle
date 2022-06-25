import type { NextApiRequest, NextApiResponse } from 'next'
import type { TrackinData } from 'models/stats'
import { Kafka } from 'kafkajs'
import { config } from 'process';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const reqData: TrackinData = JSON.parse(req.body);

    const broker = process.env['TRACK_BROKER'] ?? "localhost:9092";
    const ssl : boolean = process.env['TRACK_SSL'] == "1" ? true : false;
    const authorization = process.env["TRACK_AUTHORIZATION"];

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
      topic: 'dodle_tracking',
      messages: [
        { value: JSON.stringify(reqData) },
      ],
    });

    await producer.disconnect();
  }
}