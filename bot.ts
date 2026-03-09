import { Telegraf } from "telegraf";
import "dotenv/config";
// import { PrismaClient } from "@prisma/client/extension";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({
    adapter,
});

console.log(process.env.BOT_TOKEN);

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.command("stats", async (ctx) => {
    const msg = ctx.message;
    const user = msg.from;
    const chat = msg.chat;
    // ctx — контекст сообщения
    const users_chats = await prisma.userChat.findMany({
        where: { chat_id: chat.id * -1, NOT: { messages_per_hour: 0 } },
        include: { user: true },
    });

    let response = `👨‍💻Активность работников\n(Сколько сообщений отправлено за час)\n\n`;

    const body = users_chats
        .map(
            (user_chat) =>
                `${user_chat.user.first_name + (user_chat.user.last_name ? " " + user_chat.user.last_name : "")}: ${user_chat.messages_per_hour} работы`,
        )
        .join("\n\n");
    response = response + (body.length === 0 ? '😡 Работники бездельничают, пора их будить!' : body )

    ctx.reply(response);
});

// слушаем ВСЕ типы сообщений
bot.on("message", async (ctx) => {
    const msg = ctx.message;
    const user = msg.from;
    const chat = msg.chat;

    const new_user = await prisma.user.upsert({
        where: { id: user.id }, // уникальное поле для поиска
        update: {}, // если пользователь найден — ничего не делаем
        create: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name ?? "",
            username: user.username ?? "",
        }, // если нет — создаём нового
    });

    const new_chat = await prisma.chat.upsert({
        where: { id: chat.id * -1 }, // уникальное поле для поиска
        update: {}, // если пользователь найден — ничего не делаем
        create: {
            id: chat.id * -1,
            title: "title" in chat ? chat.title : "Chat",
        }, // если нет — создаём нового
    });

    let user_chat = await prisma.userChat.findFirst({
        where: { user_id: new_user.id, chat_id: new_chat.id },
    });

    if (user_chat) {
        user_chat = await prisma.userChat.update({
            where: {
                user_id_chat_id: { chat_id: new_chat.id, user_id: new_user.id },
            },
            data: {
                messages_per_hour: user_chat.messages_per_hour + 1,
                total_messages: user_chat.total_messages + 1,
            },
        });
    } else {
        user_chat = await prisma.userChat.create({
            data: {
                user_id: new_user.id,
                chat_id: new_chat.id,
                messages_per_hour: 1,
                total_messages: 1,
            },
        });
    }

    // ctx.sendMessage("Принято");
});

bot.launch();

console.log("Bot started");

// корректное завершение
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
