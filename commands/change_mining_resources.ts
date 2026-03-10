import { Context, Markup, Telegraf } from "telegraf";
import { bot, prisma } from "../api";

export default function startCommand(bot: Telegraf<Context>) {
    bot.command("change_mining_resources", async (ctx) => {
        const msg = ctx.message;
        const user = msg.from;
        const chat = msg.chat;
        const resources = await prisma.resource.findMany();

        await ctx.reply(
            "⛏️Что следует добывать вашему государству?",
            Markup.inlineKeyboard([
                resources.map((resource) =>
                    Markup.button.callback(
                        resource.name,
                        "btn_cnange_resource_" + resource.id,
                    ),
                ),
            ]),
        );
    });
}
