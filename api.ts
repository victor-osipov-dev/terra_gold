import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { Telegraf } from "telegraf";
import { MyContext } from "./types";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({
    adapter,
});

export const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);