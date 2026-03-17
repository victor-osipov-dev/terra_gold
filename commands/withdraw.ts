import { Telegraf, Scenes, session } from "telegraf";
import { withdrawScene } from "../scenes/withdraw.scene";
import { prisma } from "../api";

export default function withdrawCommands(bot: Telegraf<any>) {
    const stage = new Scenes.Stage([withdrawScene]);


    bot.use(stage.middleware());

    // 🚀 старт вывода
    bot.command("withdraw", (ctx) => {
        ctx.scene.enter("withdraw_scene");
    });

    const ADMIN_ID = Number(process.env.ADMIN_ID);

    // ✅ принять
    bot.action(/approve_(.+)/, async (ctx) => {
        if (ctx.from.id !== ADMIN_ID) return;

        const id = ctx.match[1];

        const request = await prisma.withdrawalRequest.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!request || request.status !== "PENDING") {
            return ctx.answerCbQuery("Уже обработано");
        }

        // 💸 списываем с reserved и balance
        await prisma.user.update({
            where: { id: request.user_id },
            data: {
                reserved_balance: {
                    decrement: request.amount,
                },
                balance: {
                    decrement: request.amount,
                },
            },
        });

        await prisma.withdrawalRequest.update({
            where: { id },
            data: {
                status: "APPROVED",
                processed_at: new Date(),
            },
        });

        await ctx.editMessageText("✅ Заявка принята");

        // 📩 уведомление пользователю
        await ctx.telegram.sendMessage(
            Number(request.user.id),
            `✅ Ваша заявка на ${request.amount} USDT выполнена`,
        );

        await ctx.answerCbQuery();
    });

    // ❌ отклонить
    bot.action(/reject_(.+)/, async (ctx) => {
        if (ctx.from.id !== ADMIN_ID) return;

        const id = ctx.match[1];

        const request = await prisma.withdrawalRequest.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!request || request.status !== "PENDING") {
            return ctx.answerCbQuery("Уже обработано");
        }

        // 🔓 возвращаем резерв
        await prisma.user.update({
            where: { id: request.user_id },
            data: {
                reserved_balance: {
                    decrement: request.amount,
                },
            },
        });

        await prisma.withdrawalRequest.update({
            where: { id },
            data: {
                status: "REJECTED",
                processed_at: new Date(),
            },
        });

        await ctx.editMessageText("❌ Заявка отклонена");

        // 📩 уведомление
        await ctx.telegram.sendMessage(
            Number(request.user.id),
            `❌ Ваша заявка на ${request.amount} USDT отклонена`,
        );

        await ctx.answerCbQuery();
    });
}
