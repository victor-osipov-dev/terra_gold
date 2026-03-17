import { Context, Markup, Telegraf } from "telegraf";
import { MyContext } from "../types";
import { prisma } from "../api";

const RECIPES = [
    {
        name: 'Инструменты',
        command: '/craft_tools',
        materialCost: 2,
        output: 1
    }
];

export default function startCommand(bot: Telegraf<MyContext>) {
    bot.command('craft_list', async (ctx) => {
        try {
            const telegramId = ctx.from.id;

            const user = await prisma.user.findUnique({
                where: { id: BigInt(telegramId) }
            });

            if (!user) {
                return ctx.reply('❌ Пользователь не найден');
            }

            const userChat = await prisma.userChat.findFirst({
                where: { user_id: user.id },
                include: { chat: true }
            });

            if (!userChat) {
                return ctx.reply('❌ Чат не найден');
            }

            const chat = userChat.chat;
            const materials = chat.materials;

            let response = `📦 Доступные крафты:\n\n`;
            let hasAny = false;

            for (const recipe of RECIPES) {
                const maxCraft = Math.floor(materials / recipe.materialCost);

                if (maxCraft > 0) {
                    hasAny = true;

                    response += `🔧 ${recipe.name}\n`;
                    response += `Стоимость: ${recipe.materialCost} 🧱\n`;

                    // готовые команды (кликабельные)
                    response += `Быстрые команды:\n`;
                    response += `${recipe.command} 1\n`;
                    response += `${recipe.command} ${maxCraft}\n\n`;
                }
            }

            if (!hasAny) {
                return ctx.reply(
                    `❌ Недостаточно материалов (${materials})`
                );
            }

            return ctx.reply(response);

        } catch (error) {
            console.error(error);
            return ctx.reply('❌ Ошибка');
        }
    });
}
