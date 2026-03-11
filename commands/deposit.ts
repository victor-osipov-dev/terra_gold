import { Context, Markup, Telegraf } from "telegraf";
import { MyContext } from "../types";

export default function startCommand(bot: Telegraf<MyContext>) {
    bot.command("deposit", async (ctx) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;

        

        let response = `📩Полполнение USDT через Telegram кошелёк.\nВыберите сумму:\n`;

        await ctx.reply(
            response,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback("1", "deposit_1"),
                    Markup.button.callback("5", "deposit_5"),
                ],
                [
                    Markup.button.callback("10", "deposit_10"),
                    Markup.button.callback("Своя сумма", "deposit_custom"),
                ],
            ]),
        );
    });
}
