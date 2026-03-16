import "dotenv/config";
import * as amqp from "amqplib";
import { bot, prisma } from "./api";

const queue = "ton_payments";
const queue_duplicates = "ton_payments_duplicates";
const queue_others = "ton_payments_others";

type IMessage = {
    hash: string,
    amount_ton: number,
    amount_usdt: number,
    comment: string,
    created_at: number
}



async function consume() {
    try {
        const connection = await amqp.connect(`amqp://${process.env.RABBITMQ_USER}:${encodeURIComponent(process.env.RABBITMQ_PASSWORD ?? '')}@${process.env.RABBITMQ_IP}:5672`);
        
        const channel = await connection.createChannel();
        await channel.assertQueue(queue, { durable: true });
        await channel.assertQueue(queue_duplicates, { durable: true });
        await channel.assertQueue(queue_others, { durable: true });

        channel.consume(queue, async (msg: any) => {
            if (!msg) return;



            const data: IMessage = JSON.parse(msg.content.toString());

            console.log("Received:", data);
            const comment = Buffer.from(data.comment, "base64").toString("utf-8");
            console.log(comment);

            const arr_data = comment.split(':');

            console.log(123, arr_data);

            if (arr_data[0] == 'user_id') {
                console.log(321);
                const user_id = arr_data[1]

                const tonTransaction = await prisma.tonTransaction.findUnique({
                    where: {
                        tx_hash: data.hash
                    }
                })

                if (!tonTransaction) {
                    await prisma.tonTransaction.create({
                        data: {
                            tx_hash: data.hash,
                            user_id: +user_id,
                            amount: data.amount_ton,
                            amount_usdt: data.amount_usdt
                        }
                    });

                    await prisma.user.update({
                        where: {
                            id: +user_id,
                        },
                        data: {
                            balance: {
                                increment: data.amount_usdt
                            }
                        }
                    })
                    await bot.telegram.sendMessage(user_id, `✅ Платеж получен (${data.amount_usdt} USDT)`);

                    channel.ack(msg);
                } else {
                    channel.sendToQueue(
                        queue_duplicates,
                        Buffer.from(msg.content)
                    );
                    channel.ack(msg);
                }
            } else {
                channel.sendToQueue(
                    queue_others,
                    Buffer.from(msg.content)
                );
                channel.ack(msg);
            }

        });
    } catch (err) {
        console.log('RabbitMQ err connection', err);
    }
}

consume();