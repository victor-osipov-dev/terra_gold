import amqp from "amqplib";
import { prisma } from "./api";

const queue = "ton_payments";

type IMessage = {
    hash: string,
    amount_ton: number,
    amount_usdt: number,
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
        const arr_data = data.comment.split(':');

        console.log(123);
        
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
                        // id: 1655456736
                    },
                    data: {
                        balance: {
                            increment: data.amount_usdt
                        }
                    }
                })

                channel.ack(msg);
            } else {
                channel.ack(msg);
            }
        }

    });
}

consume();