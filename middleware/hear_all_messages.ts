import { Context, Telegraf } from "telegraf";
import { findOrCreateChatAndUser, prisma } from "../api";
import { Decimal } from "@prisma/client/runtime/client";
import { MyContext } from "../types";
import { randomInteger } from "../utils/random";

export default function startCommand(bot: Telegraf<MyContext>) {
    // слушаем ВСЕ типы сообщений
    bot.on("message", async (ctx) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;

        const { user: new_user, chat: new_chat } =
            await findOrCreateChatAndUser({ user, chat });

        let user_chat = await prisma.userChatActivity.findFirst({
            where: { user_id: new_user.id, chat_id: new_chat.id },
        });

        if (user_chat) {
            user_chat = await prisma.userChatActivity.update({
                where: {
                    user_id_chat_id: {
                        chat_id: new_chat.id,
                        user_id: new_user.id,
                    },
                },
                data: {
                    messages_per_hour: user_chat.messages_per_hour + 1,
                    total_messages: user_chat.total_messages + 1,
                },
            });
        } else {
            user_chat = await prisma.userChatActivity.create({
                data: {
                    user_id: new_user.id,
                    chat_id: new_chat.id,
                    messages_per_hour: 1,
                    total_messages: 1,
                },
            });
        }

        if (user_chat.messages_per_hour <= 3) {
            let chat_food = 0;
            let chat_materials = 0;
            let chat_tools = 0;

            if (
                new_chat.resource.name == "Растения" ||
                new_chat.resource.name == "Животные"
            ) {
                chat_food = 1;
            } else if (
                new_chat.resource.name == "Фабрики" ||
                new_chat.resource.name == "Шахты"
            ) {
                chat_materials = 1;
                chat_food = -1;
            }

            if (randomInteger(1, 10) <= 5) {
                chat_tools = -1;
            }

            await prisma.$transaction(async (tx) => {
                const income = new Decimal(0.001 * new_chat.level_workers);

                const [spent] = await tx.$queryRaw<{ spent: Decimal }[]>`
                    UPDATE "Resource"
                    SET number = number - LEAST(number, ${income})
                    WHERE id = ${new_chat.resource_id}
                    RETURNING LEAST(number, ${income}) as spent;
                `;

                await tx.chat.update({
                    where: { id: new_chat.id },
                    data: {
                        budget: { increment: spent.spent },
                        food: { increment: chat_food },
                        materials: { increment: chat_materials },
                        tools: { increment: chat_tools },
                    },
                });
            });
        }

        if (ctx.session?.state?.type === "deposit") {
            if ("text" in msg) {
                const amount = parseFloat(msg.text);
                ctx.reply(`Пополнение на ${amount}`);
            }
        }

        if (ctx.session?.state) ctx.session.state = undefined;
    });
}
