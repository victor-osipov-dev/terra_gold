import { Context, Markup, Telegraf } from "telegraf";
import { MyContext } from "../types";

export default function startCommand(bot: Telegraf<MyContext>) {
    bot.command("test", async (ctx) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;

        ctx.reply(
            "https://ai-box-cars.ru/",
            Markup.inlineKeyboard([
                Markup.button.url("Пополнить", "https://ai-box-cars.ru/"),
            ]),
        );
    });
}
