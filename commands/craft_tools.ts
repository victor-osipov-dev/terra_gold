import { Context, Markup, Telegraf } from "telegraf";
import { MyContext } from "../types";
import { prisma } from "../api";

export default function startCommand(bot: Telegraf<MyContext>) {
    bot.command('craft_tools', async (ctx) => {
        try {
            const telegramId = ctx.from.id;

            // получаем пользователя
            const user = await prisma.user.findUnique({
                where: { id: BigInt(telegramId) }
            });

            if (!user) {
                return ctx.reply('❌ Пользователь не найден');
            }

            // получаем чат (предполагаем 1 активный чат)
            const userChat = await prisma.userChat.findFirst({
                where: { user_id: user.id },
                include: { chat: true }
            });

            if (!userChat) {
                return ctx.reply('❌ Чат не найден');
            }

            const chat = userChat.chat;

            // сколько крафтить
            const args = ctx.message.text.split(' ');
            const amount = parseInt(args[1]) || 1;

            if (amount <= 0) {
                return ctx.reply('❌ Укажи корректное количество');
            }

            const requiredMaterials = amount * 2;

            if (chat.materials < requiredMaterials) {
                return ctx.reply(
                    `❌ Недостаточно материалов\nНужно: ${requiredMaterials}\nЕсть: ${chat.materials}`
                );
            }

            // обновляем ресурсы
            await prisma.chat.update({
                where: { id: chat.id },
                data: {
                    materials: {
                        decrement: requiredMaterials
                    },
                    tools: {
                        increment: amount
                    }
                }
            });

            return ctx.reply(
                `✅ Создано инструментов: ${amount}\n` +
                `🔧 Использовано материалов: ${requiredMaterials}`
            );

        } catch (error) {
            console.error(error);
            return ctx.reply('❌ Ошибка при создании инструментов');
        }
    });
}
