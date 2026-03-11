import { Context, Telegraf } from "telegraf";
import { prisma } from "../api";
import { MyContext } from "../types";

export default function startCommand(bot: Telegraf<MyContext>) {
    bot.action(/deposit_custom/, async (ctx) => {
        await ctx.answerCbQuery();
        const chat = ctx.chat;

        ctx.session = {
            state: {
                type: 'deposit'
            }
        }
        

        await ctx.editMessageText(
            `📩Укажите число`,
        );
    });
}
