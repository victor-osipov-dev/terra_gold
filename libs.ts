import { Telegraf } from "telegraf";
import { readdirSync } from "fs";
import path from "path";
import crypto from "crypto";
import type { MyContext } from "./types";
import { round } from "./utils/number";

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

type Member = {
    others: boolean,
    part: number,
    part_type: 'USDT' | 'PART',
    [key: string]: string | number | boolean
}

export function distributeProfits(budget: number, total_members: number, members: Member[]) {
    let parts_number: {
        [key: string]: number
    } = {};
    let others_number = total_members - members.length;
    members.forEach((member) => {
        //
        if (!parts_number[member["part_type"]])
            parts_number[member["part_type"]] = 0;

        if (member.others) {
            others_number += 1;
            parts_number[member["part_type"]] +=
                member.part * others_number;
        } else {
            parts_number[member["part_type"]] += member.part;
        }

        return member["part_type"];
    });

    const USDT_multiplier = parts_number["USDT"]
        ? Math.min(1, budget / parts_number["USDT"])
        : 0;
    const remaining_budget = Math.max(
        0,
        budget - parts_number["USDT"],
    );
    const part_multiplier = parts_number["PART"]
        ? remaining_budget / parts_number["PART"]
        : 0;

    return {
        USDT_multiplier: round(USDT_multiplier),
        part_multiplier: round(part_multiplier),
    };
}