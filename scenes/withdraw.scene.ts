import { Scenes, Markup } from "telegraf";
import { prisma } from "../api";

export const withdrawScene = new Scenes.WizardScene(
    "withdraw_scene",

    // Шаг 1 — сумма
    async (ctx: any) => {
        await ctx.reply("💰 Введите сумму для вывода:");
        return ctx.wizard.next();
    },

    // Шаг 2 — проверка суммы
    async (ctx: any) => {
        const amount = Number(ctx.message.text);

        if (!amount || amount <= 0) {
            await ctx.reply("❌ Неверная сумма, попробуйте снова:");
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: BigInt(ctx.from.id) },
        });

        if (!user) {
            return await ctx.reply("❌ Ошибка, пользователь не найден");
        }

        const available =
            Number(user.balance) - Number(user.reserved_balance);

        if (available < amount) {
            await ctx.reply(
                `❌ Недостаточно средств\nДоступно: ${available}`,
            );
            return ctx.scene.leave();
        }

        ctx.wizard.state.amount = amount;

        await ctx.reply("🏦 Введите адрес кошелька:");
        return ctx.wizard.next();
    },

    // Шаг 3 — кошелек + создание заявки
    async (ctx: any) => {
        const wallet = ctx.message.text;
        const amount = ctx.wizard.state.amount;

        const user = await prisma.user.findUnique({
            where: { id: BigInt(ctx.from.id) },
        });

        if (!user) {
            return await ctx.reply("❌ Ошибка, пользователь не найден");
        }

        // 🔒 резервируем баланс
        await prisma.user.update({
            where: { id: user.id },
            data: {
                reserved_balance: {
                    increment: amount,
                },
            },
        });

        const request = await prisma.withdrawalRequest.create({
            data: {
                user_id: user.id,
                amount,
                wallet,
            },
        });

        await ctx.reply("✅ Заявка создана и отправлена на обработку");

        // 📢 админу
        await ctx.telegram.sendMessage(
            process.env.ADMIN_ID!,
            `📥 Новая заявка\n\n👤 @${user.username}\n💰 ${amount} USDT\n🏦 ${wallet}`,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "✅ Принять",
                        `approve_${request.id}`,
                    ),
                    Markup.button.callback(
                        "❌ Отклонить",
                        `reject_${request.id}`,
                    ),
                ],
            ]),
        );

        return ctx.scene.leave();
    },
);