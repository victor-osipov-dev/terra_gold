
import express, { Request, Response } from "express";
import cors from "cors";
import { verifyTelegramInitData } from "./libs";
import { prisma } from "./api";
import { beginCell } from "@ton/core";

export const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    console.log(123);
    res.json({
        ok: true,
    });
});

app.post("/create-ton-payload", (req, res) => {
    try {
        const { comment } = req.body;
        if (!comment || typeof comment !== "string") {
            return res.status(400).json({ error: "comment is required" });
        }

        // 1️⃣ Создаём Cell с комментарем
        const cell = beginCell()
            .storeUint(0, 32)        // opcode = 0 (simple transfer)
            .storeStringTail(comment) // comment / payload
            .endCell();

        // 2️⃣ Конвертируем Cell в BOC и потом в Base64
        const boc = cell.toBoc(); // Uint8Array

        // В браузере Buffer может не быть, поэтому используем btoa
        // Здесь Node.js, поэтому можно через Buffer
        const payloadBase64 = Buffer.from(boc).toString("base64");

        return res.json({ payload: payloadBase64 });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Internal error" });
    }
});

app.post("/api/verify", async (req: Request, res: Response) => {
    const { initData } = req.body;

    if (!verifyTelegramInitData(initData)) {
        return res.status(403).json({ error: "Invalid Telegram data" });
    }

    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get("user") ?? '{}');
    const db_user = await prisma.user.findUnique({
        where: {
            id: user.id
        }
    })
    const all_chats_user_count = await prisma.userChatActivity.count({
        where: {
            user_id: user.id
        },
    })
    // const own_user_chats_count = await prisma.userChatActivity.count({
    //     where: {
    //         user_id: user.id,
    //     },
    // })

    res.json({
        ok: true,
        user: {
            ...user,
            balance: db_user?.balance,
            all_chats_user_count,
        },
    });
});
