import { Context, Telegraf } from "telegraf";
import { bot, prisma } from "../api";

export default function startCommand(bot: Telegraf<Context>) {
    bot.command("government", async (ctx) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;

        let response = `🏰Об этом государстве.\n\n`;

        const currentChat = await prisma.chat.findFirst({
            where: { id: chat.id },
            include: { resource: true },
        });

        response +=
            `Заработано: $${currentChat?.budget}\n` +
            `Еда: ${currentChat?.food} ед.\n` +
            `Материалы: ${currentChat?.materials} ед.\n` +
            `Инструменты: ${currentChat?.tools} ед.\n` +
            `Добываемый ресурс: ${currentChat?.resource.name}\n` +
            `Уровень работников: ${currentChat?.level_workers}`;

        ctx.reply(response);
    });
}
