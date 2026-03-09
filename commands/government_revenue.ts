import { bot, prisma } from "../api";

bot.command("government", async (ctx) => {
    const msg = ctx.message;
    const user = msg.from;
    const chat = msg.chat;

    let response = `🏰Об этом государстве.\n\n`;

    const currentChat = await prisma.chat.findFirst({
        where: { id: chat.id * -1 },
    });
    
    response +=
        `Заработано: ${currentChat?.budget} ₽\n` +
        `Еда: ${currentChat?.food} ед.\n` +
        `Материалы: ${currentChat?.materials} ед.\n` +
        `Уровень работников: ${currentChat?.level_workers}`;


    ctx.reply(response);
});
