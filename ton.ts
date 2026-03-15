import "dotenv/config";
import express from "express";
import amqp from "amqplib";
import { Address, TonClient, fromNano } from "ton";
import { getTonPriceUSD } from "./libs";

const queue = "ton_payments";
const walletAddress = "UQCtuLgvIXZ8z2cEosLKxKHsiPgcrepaK-VnBPaFZhTI1NZL";
const client = new TonClient({ endpoint: "https://toncenter.com/api/v2/jsonRPC" });

const app = express();
app.use(express.json());

app.get("/ton-webhook", (req, res) => {
    res.sendStatus(200);
});

async function sendToQueue(data: any) {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );

    console.log("Message sent:", data);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


app.post("/ton-webhook", async (req, res) => {
    const data = req.body;
    const transactions = await client.getTransactions(Address.parse(walletAddress), { limit: 10 });

    for (let i = 0; i < 5; i++) {
        try {
            var ton_price_USD = await getTonPriceUSD();
            console.log("Цена TON:", ton_price_USD);
            break;
        } catch (err) {
            console.error("Ошибка получения курса, пробуем снова", i + 1);
            await delay(500)
        }
    }


    for (let tx of transactions) {
        const hash = tx.hash().toString("hex");

        if (hash === data.tx_hash) {
            console.log(hash, data.tx_hash);
            const msg = tx.inMessage;

            if (!msg) continue;

            if (msg.info.type === "internal") {
                console.log("Транзакция найдена:", msg.info.value);

                const amountTon = fromNano(msg.info.value.coins);
                console.log("Amount:", amountTon);

                const body = msg.body.beginParse();

                if (body.remainingBits >= 32) {
                    const op = body.loadUint(32);

                    if (op === 0) {
                        const comment = body.loadStringTail();
                        console.log("Comment:", comment);


                        const data = {
                            hash,
                            amount_ton: amountTon,
                            amount_usdt: amountTon * ton_price_USD,
                            comment,
                            created_at: Date.now()
                        }

                        sendToQueue(data)
                        break;
                    }
                }

            }
        }
    }
    // console.log("Новая транзакция:", data);

    res.sendStatus(200);
});

app.listen(process.env.TON_WEBHOOK_PORT, () => console.log("Webhook server running on port " + process.env.TON_WEBHOOK_PORT));