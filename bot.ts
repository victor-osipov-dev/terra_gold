import { Telegraf } from "telegraf";
import "dotenv/config";

console.log(process.env.BOT_TOKEN);

const bot = new Telegraf(process.env.BOT_TOKEN!);

// слушаем ВСЕ типы сообщений
bot.on("message", (ctx) => {
    const msg = ctx.message;

    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const username = msg.from.username;
    
    if ("text" in msg) {
        const text = msg.text;
        console.log(text);
    }

    console.log(msg);
});

bot.launch();

console.log("Bot started");

// корректное завершение
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
