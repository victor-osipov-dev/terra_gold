import "dotenv/config";
import "./cron";
import { bot } from "./api";
import { applyCommands } from "./libs";
import hearAllCommands from "./middleware/hear_all_commands";
import hearAllMessages from "./middleware/hear_all_messages";
import { session } from "telegraf";
import express from "express"

bot.use(session());
await hearAllCommands(bot);
await applyCommands(bot);
await hearAllMessages(bot);

bot.launch();
console.log("Bot started");



const app = express()

app.post("/pay", async (req,res)=>{
   // verify telegram initData
   // process TON tx
})

app.listen(8000)

// корректное завершение
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
