import { Telegraf } from "telegraf";
import { readdirSync } from "fs";
import path from "path";
import crypto from "crypto";
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

export function verifyTelegramInitData(initData) {
    const urlParams = new URLSearchParams(initData);

    const hash = urlParams.get("hash");
    urlParams.delete("hash");

    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckString = keys
        .map((key) => `${key}=${urlParams.get(key)}`)
        .join("\n");

    const secretKey = crypto
        .createHmac("sha256", "WebAppData")
        .update(process.env.BOT_TOKEN)
        .digest();

    const hmac = crypto
        .createHmac("sha256", secretKey)
        .update(dataCheckString)
        .digest("hex");

    return hmac === hash;
}
