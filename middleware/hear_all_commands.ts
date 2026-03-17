import { Context, Telegraf } from "telegraf";
import { findOrCreateChatAndUser, prisma } from "../api";
import { MyContext } from "../types";

export default function startCommand(bot: Telegraf<MyContext>) {
    bot.command(/.*/, async (ctx, next) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;

        findOrCreateChatAndUser({ user, chat });

	if ("text" in ctx.message && ctx.message.text.startsWith("/")) {
        	if (ctx.scene?.current) {
            		await ctx.scene.leave();
        	}

        	ctx.session = {}; // очищаем сессию
    	}

        if (ctx.session?.state) ctx.session.state = undefined;

        await next(); // передаём управление конкретной команде
    });
}
