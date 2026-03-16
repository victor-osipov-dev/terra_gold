import "dotenv/config";
import "./cron";
import { bot } from "./api";
import { applyCommands } from "./libs";
import hearAllCommands from "./middleware/hear_all_commands";
import hearAllMessages from "./middleware/hear_all_messages";
import { session } from "telegraf";
import { app } from "./server";
import './transaction_processing'

bot.use(session());
await hearAllCommands(bot);
await applyCommands(bot);
await hearAllMessages(bot);

bot.launch();
console.log("Bot started");
app.listen(8001, "0.0.0.0", () => {
    console.log("Listen 8001");
});

// корректное завершение
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
