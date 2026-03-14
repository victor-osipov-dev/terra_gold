
import express, { Request, Response } from "express";
import cors from "cors";
import { verifyTelegramInitData } from "./libs";
import { prisma } from "./api";

export const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.json({
        ok: true,
    });
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
    const all_chats_user_count = await prisma.userChat.count({
        where: {
            user_id: user.id
        },
    })
    // const own_user_chats_count = await prisma.userChat.count({
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
