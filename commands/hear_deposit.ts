import { Context, Telegraf } from "telegraf";
import { prisma } from "../api";

export default function startCommand(bot: Telegraf<Context>) {
    bot.action(/deposit_(\d+)/, async (ctx) => {
        const amount = Number(ctx.match[1]);
        await ctx.answerCbQuery();
        const chat = ctx.chat;
        console.log(amount);

        const response = await fetch(
            "https://pay.crypt.bot/api/createInvoice",
            {
                method: "POST",
                headers: {
                    "Crypto-Pay-API-Token": process.env.CRYPTO_BOT_TOKEN!,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    asset: "USDT",
                    amount: amount.toString(),
                    description: "Deposit",
                    payload: "user_id:" + ctx.from.id,
                }),
            },
        );
        const json = await response.json();

        console.log(json);

        await ctx.editMessageText(
            `Пополнение на ${amount} по ссылке: ${json.result.pay_url}`,
        );
    });
}
