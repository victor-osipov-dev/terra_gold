import { Telegraf } from "telegraf";
import { readdirSync } from "fs";
import path from "path";
import crypto from "crypto";
import type { MyContext } from "./types";

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

export function verifyTelegramInitData(initData: any) {
    const urlParams = new URLSearchParams(initData);

    const hash = urlParams.get("hash");
    urlParams.delete("hash");

    const keys = Array.from(urlParams.keys()).sort();
    const dataCheckString = keys
        .map((key) => `${key}=${urlParams.get(key)}`)
        .join("\n");

    if (!process.env.BOT_TOKEN) {
        throw new Error("BOT_TOKEN is not defined");
    }

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


export async function getTonPriceUSD() {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd");
    const data = await res.json();
    return data["the-open-network"].usd;
}