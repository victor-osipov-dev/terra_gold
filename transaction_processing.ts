import amqp from "amqplib";
import { prisma } from "./api";

const queue = "ton_payments";

type IMessage = {
    hash: string,
    amount_ton: number,
    comment: string,
    created_at: number
}

async function consume() {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg: any) => {
        if (!msg) return;

        const data: IMessage = JSON.parse(msg.content.toString());

        console.log("Received:", data);
        const user_id = data.comment.split(':')[1]
        await prisma.user.update({
            where: {
                id: +user_id,
                // id: 1655456736
            },
            data: {
                balance: {
                    increment: data.amount_ton
                }
            }
        })
        channel.ack(msg);
    });
}

consume();