import { Telegraf, Markup } from "telegraf";
import { MyContext } from "../types";
import { prisma } from "../api";

export default function startCommand(bot: Telegraf<MyContext>) {

    // 📌 Основная команда
    bot.command('craft_tools', async (ctx) => {
        try {
            const telegramId = ctx.from.id;

            const user = await prisma.user.findUnique({
                where: { id: BigInt(telegramId) }
            });

            if (!user) {
                return ctx.reply('❌ Пользователь не найден');
            }

            const chat = await prisma.chat.findUnique({
                where: { id: ctx.chat.id },
            });

            if (!chat) {
                return ctx.reply('❌ Чат не найден');
            }

            const args = ctx.message.text.split(' ');
            const amount = parseInt(args[1]);

            // 👉 ЕСЛИ аргумента нет — показываем кнопки
            if (!amount) {
                const maxCraft = Math.floor(chat.materials / 2);

                if (maxCraft <= 0) {
                    return ctx.reply(`❌ Недостаточно материалов (${chat.materials})`);
                }

                return ctx.reply(
                    `🔧 Выбери сколько создать\nМатериалы: ${chat.materials}`,
                    Markup.inlineKeyboard([
                        [
                            Markup.button.callback('🔧 1', 'craft_tools:1'),
                            Markup.button.callback(`🔧 MAX (${maxCraft})`, `craft_tools:${maxCraft}`)
                        ]
                    ])
                );
            }

            if (amount <= 0) {
                return ctx.reply('❌ Укажи корректное количество');
            }

            const requiredMaterials = amount * 2;

            if (chat.materials < requiredMaterials) {
                return ctx.reply(
                    `❌ Недостаточно материалов\nНужно: ${requiredMaterials}\nЕсть: ${chat.materials}`
                );
            }

            await prisma.chat.update({
                where: { id: ctx.chat.id },
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

    // 📌 Обработка inline кнопок
    bot.action(/craft_tools:(\d+)/, async (ctx) => {
        try {
            const amount = parseInt(ctx.match[1]);
            const telegramId = ctx.from.id;

            const user = await prisma.user.findUnique({
                where: { id: BigInt(telegramId) }
            });

            if (!user) {
                return ctx.answerCbQuery('❌ Пользователь не найден');
            }

            const chat = await prisma.chat.findUnique({
                where: { id: ctx.chat?.id },
            });

            if (!chat) {
                return ctx.answerCbQuery('❌ Чат не найден');
            }

            const requiredMaterials = amount * 2;

            if (chat.materials < requiredMaterials) {
                return ctx.answerCbQuery('❌ Не хватает материалов');
            }

            await prisma.chat.update({
                where: { id: chat.id },
                data: {
                    materials: { decrement: requiredMaterials },
                    tools: { increment: amount }
                }
            });

            await ctx.answerCbQuery(`✅ Создано: ${amount}`);
            await ctx.reply(`🔧 +${amount} инструментов`);

        } catch (error) {
            console.error(error);
            ctx.answerCbQuery('❌ Ошибка');
        }
    });
}