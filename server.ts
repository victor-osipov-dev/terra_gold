
import express, { Request, Response } from "express";
import cors from "cors";
import { verifyTelegramInitData } from "./libs";
import { bot, prisma } from "./api";
import { beginCell } from "@ton/core";

const FIVE_MINUTES = 5 * 60 * 1000;
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


app.get('/user/:user_id/admin-chats-live', async (req, res) => {
    try {
        const userId = BigInt(req.params.user_id)

        // 1. Берём все чаты пользователя из БД
        const userChats = await prisma.userChatActivity.findMany({
            where: {
                user_id: userId,
            },
            include: {
                chat: true,
            },
        })

        // 2. Проверяем роль в Telegram для каждого чата
        const results = []
        const updatedRoles = []

        for (const item of userChats) {

            if (!item.role || (Date.now() - +item.role_updated_at >= FIVE_MINUTES)) {
                try {
                    const member = await bot.telegram.getChatMember(
                        Number(item.chat_id),
                        Number(item.user_id)
                    )

                    updatedRoles.push({
                        user_id: item.user_id,
                        chat_id: item.chat.id,
                        title: item.chat.title,
                        role: member.status, // актуальная роль из Telegram
                    })
                    item.role = member.status
                } catch (err: any) {
                    console.warn(
                        `Не удалось получить роль для chat ${item.chat_id}:`,
                        err.description || err.message
                    )
                }
            };

            if (
                item.role === 'administrator' ||
                item.role === 'creator'
            ) {
                results.push({
                    chat_id: item.chat.id.toString(),
                    title: item.chat.title,
                    role: item.role,
                })
            }
        }


        // Генерируем значения с корректными одинарными кавычками
        const values = updatedRoles
            .map(({ user_id, chat_id, role }) => {
                return `(${user_id}, ${chat_id}, '${role}', NOW())`
            })
            .join(',')

        const sql = `
            INSERT INTO "UserChatActivity" 
            ("user_id", "chat_id", "role", "role_updated_at")
            VALUES ${values}
            ON CONFLICT ("user_id", "chat_id")
            DO UPDATE SET 
            role = EXCLUDED.role,
            role_updated_at = EXCLUDED.role_updated_at;
        `

        if (values.length >= 1)
            await prisma.$executeRawUnsafe(sql)

        res.json(results)
    } catch (error: any) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.get("/chats/:chatId/income-parts", async (req, res) => {
    try {
        const chatId = BigInt(req.params.chatId);

        const incomeParts = await prisma.chatRevenueShare.findMany({
            where: {
                chat_id: chatId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
            },
            orderBy: {
                created_at: "asc",
            },
        });

        console.log(123)

        res.json(
            incomeParts.map(item => ({
                ...item,
                id: item.id?.toString(),
                chat_id: item.chat_id?.toString(),
                user_id: item.user_id?.toString(),
                user: item.user
                    ? {
                        ...item.user,
                        id: item.user.id?.toString(),
                    }
                    : null,
            }))
        );
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch income parts",
        });
    }
});