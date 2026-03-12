import { Context, Telegraf } from "telegraf";
import { findOrCreateChatAndUser, prisma } from "../api";
import { MyContext } from "../types";

export default function startCommand(bot: Telegraf<MyContext>) {
    bot.command(/.*/, async (ctx, next) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;

        findOrCreateChatAndUser({ user, chat });

        if (ctx.session?.state) ctx.session.state = undefined;

        await next(); // передаём управление конкретной команде
    });
}
