import { Context, Telegraf } from "telegraf";
import { prisma } from "../api";

export default function startCommand(bot: Telegraf<Context>) {
    bot.on("callback_query", async (ctx) => {
        const chat = ctx.chat;

        const callbackData = ctx.callbackQuery.data;
        const resource_id = callbackData.split("_").at(-1);
        const resource = await prisma.resource.findUnique({
            where: {
                id: resource_id,
            },
        });

        if (chat?.id) {
            await prisma.chat.update({
                where: { id: chat.id },
                data: {
                    resource_id: resource_id,
                },
            });
        }

        await ctx.editMessageText(
            `🆕Добываемый ресурс сменён на "${resource?.name}"`,
        );
    });
}
