import { Context, Telegraf } from "telegraf";
import { prisma } from "../api";

export default function startCommand(bot: Telegraf<Context>) {
    bot.command(/.*/, async (ctx, next) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;

        const new_user = await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name ?? "",
                username: user.username ?? "",
            },
        });

        const new_chat = await prisma.chat.upsert({
            where: { id: chat.id },
            update: {},
            create: {
                id: chat.id,
                title: "title" in chat ? chat.title : "Chat",
            },
            include: { resource: true },
        });

        await next(); // передаём управление конкретной команде
    });
}
