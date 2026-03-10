import "dotenv/config";
import cron from "node-cron";
import { bot, prisma } from "./api";
import "./commands";
import { Decimal } from "@prisma/client/runtime/client";

// слушаем ВСЕ типы сообщений
bot.on("message", async (ctx) => {
    const msg = ctx.message;
    const user = msg.from;
    const chat = msg.chat;

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

    let user_chat = await prisma.userChat.findFirst({
        where: { user_id: new_user.id, chat_id: new_chat.id },
    });

    if (user_chat) {
        user_chat = await prisma.userChat.update({
            where: {
                user_id_chat_id: { chat_id: new_chat.id, user_id: new_user.id },
            },
            data: {
                messages_per_hour: user_chat.messages_per_hour + 1,
                total_messages: user_chat.total_messages + 1,
            },
        });
    } else {
        user_chat = await prisma.userChat.create({
            data: {
                user_id: new_user.id,
                chat_id: new_chat.id,
                messages_per_hour: 1,
                total_messages: 1,
            },
        });
    }

    if (user_chat.messages_per_hour <= 3) {
        await prisma.$transaction(async (tx) => {
            let income = new Decimal(0.001 * new_chat.level_workers);

            const result = await tx.resource.updateMany({
                where: {
                    id: new_chat.resource_id,
                    number: { gte: income },
                },
                data: {
                    number: { decrement: income },
                },
            });

            if (result.count === 0) {
                const resource = await tx.resource.findUnique({
                    where: { id: new_chat.resource_id },
                });

                if (!resource || resource.number.eq(0)) {
                    return;
                }

                income = resource.number;

                await tx.resource.update({
                    where: { id: new_chat.resource_id },
                    data: {
                        number: { decrement: income },
                    },
                });
            }

            await tx.chat.update({
                where: { id: new_chat.id },
                data: {
                    budget: { increment: income },
                },
            });
        });

        if (
            new_chat.resource.name == "Растения" ||
            new_chat.resource.name == "Животные"
        ) {
            await prisma.chat.update({
                where: { id: new_chat.id },
                data: {
                    food: {
                        increment: 1,
                    },
                },
            });
        } else if (
            new_chat.resource.name == "Фабрики" ||
            new_chat.resource.name == "Шахты"
        ) {
            await prisma.chat.update({
                where: { id: new_chat.id },
                data: {
                    materials: {
                        increment: 2,
                    },
                },
            });
            await prisma.chat.update({
                where: { id: new_chat.id },
                data: {
                    food: {
                        decrement: 1,
                    },
                },
            });
        }
    }

    // ctx.sendMessage("Принято");
});

async function resetStatisticsForHour() {
    await prisma.userChat.updateMany({
        data: {
            messages_per_hour: 0,
        },
    });
}

cron.schedule("0 * * * *", async () => {
    try {
        console.log("Запуск часовой статистики...");
        await resetStatisticsForHour();
        console.log("resetStatisticsForHour выполнена");
    } catch (error) {
        console.error("Ошибка при выполнении cron-задачи:", error);
    }
});

bot.launch();

console.log("Bot started");

// корректное завершение
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
