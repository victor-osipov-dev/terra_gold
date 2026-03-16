import "dotenv/config";
import amqp from "amqplib";
import { Address, TonClient, Transaction, fromNano } from "@ton/ton";
import fs from "fs";
import path from "path";

// ─── Config ────────────────────────────────────────────────────────────────────

const WALLET_ADDRESS = process.env.WALLET_ADDRESS || "UQCtuLgvIXZ8z2cEosLKxKHsiPgcrepaK-VnBPaFZhTI1NZL";
const QUEUE_NAME = "ton_payments";
const LAST_TX_FILE = path.resolve("last_transaction_date.txt");
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || "10000"); // 15 seconds
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const TON_API_ENDPOINT = process.env.TON_API_ENDPOINT || "https://toncenter.com/api/v2/jsonRPC";
const TON_API_KEY = process.env.TON_API_KEY || ""; // optional, increases rate limits

// ─── TON Client ────────────────────────────────────────────────────────────────

const client = new TonClient({
    endpoint: TON_API_ENDPOINT,
    ...(TON_API_KEY ? { apiKey: TON_API_KEY } : {}),
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function readLastTransactionDate(): number {
    try {
        if (fs.existsSync(LAST_TX_FILE)) {
            const raw = fs.readFileSync(LAST_TX_FILE, "utf8").trim();
            const ts = parseInt(raw, 10);
            if (!isNaN(ts)) return ts;
        }
    } catch (err: any) {
        console.error("[state] Failed to read last_transaction_date.txt:", err.message);
    }
    return 0; // process all if no saved state
}

function saveLastTransactionDate(timestamp: number) {
    try {
        fs.writeFileSync(LAST_TX_FILE, String(timestamp), "utf8");
    } catch (err: any) {
        console.error("[state] Failed to write last_transaction_date.txt:", err.message);
    }
}

async function getTonPriceUSD() {
    const res = await fetch(
        "https://tonapi.io/v2/rates?tokens=ton&currencies=usd"
    );
    if (!res.ok) throw new Error(`tonapi HTTP ${res.status}`);
    const json = await res.json();
    return json?.rates?.TON?.prices?.USD ?? null;
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── RabbitMQ ──────────────────────────────────────────────────────────────────

let rabbitConnection = null;
let rabbitChannel: amqp.Channel | null = null;

async function getRabbitChannel() {
    if (rabbitChannel) return rabbitChannel;

    console.log("[rabbit] Connecting to RabbitMQ...");
    rabbitConnection = await amqp.connect(RABBITMQ_URL);
    rabbitChannel = await rabbitConnection.createChannel();
    await rabbitChannel.assertQueue(QUEUE_NAME, { durable: true });

    rabbitConnection.on("error", (err) => {
        console.error("[rabbit] Connection error:", err.message);
        rabbitChannel = null;
        rabbitConnection = null;
    });

    rabbitConnection.on("close", () => {
        console.warn("[rabbit] Connection closed, will reconnect on next send.");
        rabbitChannel = null;
        rabbitConnection = null;
    });

    console.log(`[rabbit] Connected. Queue: "${QUEUE_NAME}"`);
    return rabbitChannel;
}

type IPayload = {
    hash: string;
    amount_ton: string;
    amount_usdt: number | null;
    comment: string;
    created_at: number;
}

async function sendToQueue(data: IPayload) {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const ch = await getRabbitChannel();
            ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)), {
                persistent: true,
            });
            console.log("[rabbit] Message sent:", JSON.stringify(data));
            return;
        } catch (err: any) {
            console.error(`[rabbit] Send failed (attempt ${attempt}):`, err.message);
            rabbitChannel = null;
            rabbitConnection = null;
            if (attempt < 3) await delay(2000);
        }
    }
    console.error("[rabbit] Giving up on this message after 3 attempts.");
}

// ─── Transaction Processing ────────────────────────────────────────────────────

async function processTransactions() {
    const lastDate: number = readLastTransactionDate();
    const address = Address.parse(WALLET_ADDRESS);

    let transactions: Transaction[];
    try {
        transactions = await client.getTransactions(address, { limit: 20 });
    } catch (err: any) {
        console.error("[ton] Failed to fetch transactions:", err.message);
        return;
    }

    // Sort oldest → newest so we process in order
    const sorted = [...transactions].sort((a, b) => a.now - b.now);

    let newLastDate = lastDate;
    let tonPriceUSD = null;

    for (const tx of sorted) {
        const txTime = tx.now; // unix timestamp (seconds)

        // Skip already-processed transactions
        if (txTime <= lastDate) continue;

        const msg = tx.inMessage;
        if (!msg || msg.info.type !== "internal") {
            newLastDate = Math.max(newLastDate, txTime);
            continue;
        }

        const amountNano = msg.info.value.coins;
        const amountTon = fromNano(amountNano);
        const hash = tx.hash().toString("hex");

        // Parse comment (op=0 text comment)
        let comment = "";
        try {
            const body = msg.body.beginParse();
            if (body.remainingBits >= 32) {
                const op = body.loadUint(32);
                if (op === 0) {
                    comment = body.loadStringTail();
                }
            }
        } catch {
            // no comment or non-standard body
        }

        // Fetch TON price (once per poll cycle, cached)
        if (tonPriceUSD === null) {
            for (let i = 0; i < 3; i++) {
                try {
                    tonPriceUSD = await getTonPriceUSD();
                    console.log(`[price] TON/USD: ${tonPriceUSD}`);
                    break;
                } catch (err: any) {
                    console.error(`[price] Failed to get price (attempt ${i + 1}):`, err.message);
                    await delay(500);
                }
            }
        }



        const payload = {
            hash,
            amount_ton: amountTon,
            amount_usdt: tonPriceUSD != null ? Number(amountTon) * tonPriceUSD : null,
            comment,
            created_at: txTime * 1000, // to milliseconds, consistent with Date.now()
        };

        console.log(`[ton] New deposit: ${amountTon} TON | hash: ${hash} | comment: "${comment}"`);

        await sendToQueue(payload);

        newLastDate = Math.max(newLastDate, txTime);
    }

    if (newLastDate !== lastDate) {
        saveLastTransactionDate(newLastDate);
        console.log(`[state] Updated last processed time: ${new Date(newLastDate * 1000).toISOString()}`);
    }
}

// ─── Main loop ─────────────────────────────────────────────────────────────────

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  TON Wallet Monitor");
    console.log(`  Address : ${WALLET_ADDRESS}`);
    console.log(`  Queue   : ${QUEUE_NAME}`);
    console.log(`  Interval: ${POLL_INTERVAL_MS / 1000}s`);
    console.log("═══════════════════════════════════════════════");

    // Pre-connect to RabbitMQ at startup
    try {
        await getRabbitChannel();
    } catch (err: any) {
        console.error("[rabbit] Initial connection failed:", err.message);
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            await processTransactions();
        } catch (err: any) {
            console.error("[monitor] Unexpected error:", err.message);
        }
        await delay(POLL_INTERVAL_MS);
    }
}

main().catch((err) => {
    console.error("[fatal]", err);
    process.exit(1);
});