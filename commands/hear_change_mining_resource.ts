import { Context, Telegraf } from "telegraf";
import { prisma } from "../api";

export default function startCommand(bot: Telegraf<Context>) {
    bot.action(/btn_cnange_resource_(\d+)/, async (ctx) => {
        const resource_id = Number(ctx.match[1]);
        await ctx.answerCbQuery();
        const chat = ctx.chat;

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
