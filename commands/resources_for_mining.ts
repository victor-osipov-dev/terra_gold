import { bot, prisma } from "../api";

bot.command("resources_for_mining", async (ctx) => {
    const msg = ctx.message;
    const user = msg.from;
    const chat = msg.chat;
    
    let response = `🌾Ресурсы, на которых можно заработать.\n\nЭто то, что дарует нам Бог. У каждого ресурса есть число, обозначающее, сколько всего можно добыть рублей на нём на данный момент.\n\n`;

    const resources = await prisma.resource.findMany()
    const body = resources
        .map(
            (resource) =>
                `${resource.name}: ${resource.number} ₽`,
        )
        .join("\n");

    response = response + body;


    ctx.reply(response);
});