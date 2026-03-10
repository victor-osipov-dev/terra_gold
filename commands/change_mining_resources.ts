import { Context, Markup, Telegraf } from "telegraf";
import { bot, prisma } from "../api";

export default function startCommand(bot: Telegraf<Context>) {
    bot.command("change_mining_resources", async (ctx) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;

        await ctx.reply(
            "Выберите действие:",
            Markup.inlineKeyboard([
                [
                    Markup.button.callback("Кнопка 1", "btn_1"),
                    Markup.button.callback("Кнопка 2", "btn_2"),
                ],
                [
                    Markup.button.callback("Кнопка 3", "btn_3"),
                    Markup.button.callback("Кнопка 4", "btn_4"),
                ],
            ]),
        );
    });
}
