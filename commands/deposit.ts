import { Context, Markup, Telegraf } from "telegraf";
import { MyContext } from "../types";

export default function startCommand(bot: Telegraf<MyContext>) {
    bot.command("deposit", async (ctx) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;

        // if (ctx.chat?.type !== "private") {
        //     return ctx.reply("❗ Откройте бота в личных сообщениях для пополнения.");
        // }

        ctx.reply(
            "Запустить приложение t.me/Terra_Gold_Bot/terragold_deposit",
            Markup.inlineKeyboard([
                // Markup.button.webApp(
                // "📩 Пополнить",
                // "https://ai-box-cars.ru"
                // )
                Markup.button.url(
  "💳 Пополнить",
//   "https://t.me/YOUR_BOT_USERNAME?start=deposit"
  "t.me/Terra_Gold_Bot/terragold_deposit"
)
            ])
        );
    });
}
