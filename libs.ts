import { Telegraf } from "telegraf";
import { readdirSync } from "fs";
import path from "path";
import { MyContext } from "./types";

export async function applyCommands(bot: Telegraf<MyContext>) {
    const commandsPath = path.resolve("commands");
    const commandFiles = readdirSync(commandsPath).filter((f) =>
        f.endsWith(".ts"),
    );

    for (const file of commandFiles) {
        const command = await import(`./commands/${file}`);
        if (command.default) command.default(bot);
    }
}
