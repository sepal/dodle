import type { NextApiRequest, NextApiResponse } from 'next'
import type { TrackinData } from 'models/stats'
import { Kafka } from 'kafkajs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const reqData: TrackinData = JSON.parse(req.body);

    const kafka = new Kafka({
      brokers: ['127.0.0.1:9092'],
    });

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