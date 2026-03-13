import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { Telegraf } from "telegraf";
import { MyContext } from "./types";
import { Chat, User } from "telegraf/types";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({
    adapter,
});

export const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);

export async function findOrCreateChatAndUser({
    user,
    chat,
}: {
    user: User;
    chat: Chat.PrivateChat | Chat.GroupChat | Chat.SupergroupChat;
}) {
    console.log("findOrCreateChatAndUser");

    const new_user = await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name ?? "",
            username: user.username ?? "",
        },
    });

    const new_chat = await prisma.chat.upsert({
        where: { id: chat.id },
        update: {},
        create: {
            id: chat.id,
            title: "title" in chat ? chat.title : "Chat",
        },
        include: { resource: true },
    });

    return { user: new_user, chat: new_chat };
}
