import { Context, Markup, Telegraf } from "telegraf";
import { MyContext } from "../types";

export default function startCommand(bot: Telegraf<MyContext>) {
    bot.command("start", async (ctx) => {
        const user = ctx.from;

        const message = 
`🎉 Привет, ${user.first_name || 'друг'}! Добро пожаловать в Terra Gold Bot 🌟

💎 Здесь ты можешь:
- 📦 Развивать свой чат и управлять ресурсами
- 💰 Зарабатывать USDT на активности своего чата
- 🔧 Крафтить инструменты и улучшать своих сотрудников
- 🚀 Прокачивать свой чат до новых высот

Добавь нашего бота в свой чат и начинай зарабатывать прямо сейчас! 
t.me/Terra_Gold_Bot/terragold`;

        ctx.reply(
            message,
            Markup.inlineKeyboard([
                Markup.button.url("🚀 Открыть приложение", "t.me/Terra_Gold_Bot/terragold"),
            ]),
        );
    });
}