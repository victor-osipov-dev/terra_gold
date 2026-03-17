import { Telegraf, Markup } from "telegraf";
import { MyContext } from "../types";
import { prisma } from "../api";

const UPGRADE_COST_USDT = 1; // стоимость улучшения 1 уровня

export default function upgradeWorkersCommand(bot: Telegraf<MyContext>) {
    
    // Основная команда
    bot.command('upgrade_workers', async (ctx) => {
        try {
            const telegramId = ctx.from.id;

            // получаем пользователя
            const user = await prisma.user.findUnique({
                where: { id: BigInt(telegramId) }
            });

            if (!user) {
                return ctx.reply('❌ Пользователь не найден');
            }

            // получаем чат (1 активный)
            const chat = await prisma.chat.findUnique({
                where: { id: ctx.chat.id },
            });

            if (!chat) {
                return ctx.reply('❌ Чат не найден');
            }

            // если есть баланс — показываем кнопку для повышения
            if (user.balance.lt(UPGRADE_COST_USDT)) {
                return ctx.reply(`❌ Недостаточно USDT для улучшения уровня сотрудников\nНужно: ${UPGRADE_COST_USDT} USDT\nЕсть: ${user.balance}`);
            }

            return ctx.reply(
                `💼 Улучшение уровня сотрудников\nТекущий уровень: ${chat.level_workers}\nСтоимость: ${UPGRADE_COST_USDT} USDT`,
                Markup.inlineKeyboard([
                    Markup.button.callback('⬆️ Повысить уровень', 'upgrade_workers:1')
                ])
            );

        } catch (error) {
            console.error(error);
            return ctx.reply('❌ Ошибка при попытке улучшения сотрудников');
        }
    });

    // Обработка нажатий кнопки
    bot.action(/upgrade_workers:(\d+)/, async (ctx) => {
        try {
            const telegramId = ctx.from.id;
            const increment = parseInt(ctx.match[1]); // всегда 1

            const user = await prisma.user.findUnique({
                where: { id: BigInt(telegramId) }
            });

            if (!user) return ctx.answerCbQuery('❌ Пользователь не найден');

            const chat = await prisma.chat.findFirst({
                where: { id: ctx.chat?.id },
            });

            if (!chat) return ctx.answerCbQuery('❌ Чат не найден');

            if (user.balance.lt(UPGRADE_COST_USDT)) {
                return ctx.answerCbQuery('❌ Недостаточно USDT');
            }

            // списываем USDT и повышаем уровень сотрудников
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: user.id },
                    data: {
                        balance: { decrement: UPGRADE_COST_USDT }
                    }
                }),
                prisma.chat.update({
                    where: { id: chat.id },
                    data: {
                        level_workers: { increment }
                    }
                })
            ]);

            await ctx.answerCbQuery(`✅ Уровень сотрудников повышен на ${increment}`);
            await ctx.reply(`💼 Уровень сотрудников теперь: ${chat.level_workers + increment}\n💰 Списано: ${UPGRADE_COST_USDT} USDT`);

        } catch (error) {
            console.error(error);
            ctx.answerCbQuery('❌ Ошибка при повышении уровня сотрудников');
        }
    });
}