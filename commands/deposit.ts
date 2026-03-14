import { Context, Markup, Telegraf } from "telegraf";
import { type MyContext } from "../types";

export default function startCommand(bot: Telegraf<MyContext>) {
    bot.command("deposit", async (ctx) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;

        // if (ctx.chat?.type !== "private") {
        //     return ctx.reply("❗ Откройте бота в личных сообщениях для пополнения.");
        // }

        ctx.reply(
            "➡️ Пополнение в приложени t.me/Terra_Gold_Bot/terragold_deposit",
            Markup.inlineKeyboard([
                Markup.button.url(
                    "💳 Пополнить",
                    "t.me/Terra_Gold_Bot/terragold_deposit",
                ),
            ]),
        );
    });
}
