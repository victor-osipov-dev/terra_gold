import "dotenv/config";
import "./cron";
import { bot } from "./api";
import { applyCommands } from "./libs";
import hearAllCommands from "./middleware/hear_all_commands";
import hearAllMessages from "./middleware/hear_all_messages";
import { session } from "telegraf";

bot.use(session());
await hearAllCommands(bot);
await applyCommands(bot);
await hearAllMessages(bot);

bot.launch();
console.log("Bot started");

// корректное завершение
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
