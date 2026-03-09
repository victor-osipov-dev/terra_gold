import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { Telegraf } from "telegraf";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({
    adapter,
});

export const bot = new Telegraf(process.env.BOT_TOKEN!);