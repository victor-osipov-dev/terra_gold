import { Telegraf, Markup } from "telegraf";
import { MyContext } from "../types";
import { prisma } from "../api";

export default function userMarket(bot: Telegraf<MyContext>) {

    // Главное меню рынка
    bot.command('market', async (ctx) => {
        ctx.reply(
            '🛒 Пользовательский рынок\nВыберите действие:',
            Markup.inlineKeyboard([
                [Markup.button.callback('📃 Смотреть лоты', 'market_listings')],
                [Markup.button.callback('💰 Продать ресурс', 'market_sell')]
            ])
        );
    });

    // Просмотр всех лотов
    bot.action('market_listings', async (ctx) => {
        const listings = await prisma.marketListing.findMany({
            include: { seller: true },
            orderBy: { created_at: 'desc' },
            take: 10
        });

        if (listings.length === 0) return ctx.reply('❌ Лотов пока нет');

        const buttons = listings.map(l => [
            Markup.button.callback(
                `${l.resource} x${l.amount} за ${l.price_usdt} USDT (id:${l.id})`,
                `market_buy:${l.id}`
            )
        ]);

        ctx.editMessageText('📦 Доступные лоты:', Markup.inlineKeyboard(buttons));
    });

    // Покупка лота
    bot.action(/market_buy:(\d+)/, async (ctx) => {
        try {
            const listingId = parseInt(ctx.match[1]);
            const buyerId = ctx.from.id;

            const listing = await prisma.marketListing.findUnique({
                where: { id: BigInt(listingId) },
                include: { seller: true, chat: true }
            });

            if (!listing) return ctx.answerCbQuery('❌ Лот не найден');

            const buyer = await prisma.user.findUnique({ where: { id: BigInt(buyerId) } });
            if (!buyer) return ctx.answerCbQuery('❌ Пользователь не найден');

            const totalPrice = listing.price_usdt.mul(listing.amount);

            if (buyer.balance.lt(totalPrice)) {
                return ctx.answerCbQuery('❌ Недостаточно USDT');
            }

            // Транзакция покупки
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: listing.seller_id },
                    data: { balance: { increment: totalPrice } }
                }),
                prisma.user.update({
                    where: { id: buyer.id },
                    data: { balance: { decrement: totalPrice } }
                }),
                prisma.chat.update({
                    where: { id: listing.chat_id },
                    data: { [listing.resource]: { increment: listing.amount } }
                }),
                prisma.marketListing.delete({
                    where: { id: listing.id }
                })
            ]);

            ctx.answerCbQuery(`✅ Куплено ${listing.amount} ${listing.resource}`);
            ctx.reply(`💰 Вы купили ${listing.amount} ${listing.resource} за ${totalPrice} USDT`);

        } catch (e) {
            console.error(e);
            ctx.answerCbQuery('❌ Ошибка покупки');
        }
    });

    // Добавление лота на продажу
    bot.action('market_sell', async (ctx) => {
        ctx.reply(
            '💰 Чтобы продать ресурс, используй команду:\n' +
            '/sell <food|materials|tools> <кол-во> <цена за 1>'
        );
    });

    // Команда /sell
    bot.command('sell', async (ctx) => {
        try {
            const args = ctx.message.text.split(' ');
            const [_, resource, amountStr, priceStr] = args;
            const amount = parseInt(amountStr);
            const price = parseFloat(priceStr);
            const userId = ctx.from.id;

            if (!resource || !amount || !price || (resource !== 'food' && resource !== 'materials' && resource !== 'tools')) {
                return ctx.reply('❌ Используй: /sell <food|materials|tools> <кол-во> <цена>');
            }

            const chat = await prisma.chat.findUnique({
                where: { id: ctx.chat.id },
            });

            if (!chat) return ctx.reply('❌ Чат не найден');


            if (chat[resource] < amount) {
                return ctx.reply(`❌ Недостаточно ${resource} в чате`);
            }

            // Списываем ресурсы из чата
            await prisma.chat.update({
                where: { id: chat.id },
                data: { [resource]: { decrement: amount } }
            });

            // Создаём лот
            await prisma.marketListing.create({
                data: {
                    seller_id: BigInt(userId),
                    chat_id: chat.id,
                    resource,
                    amount,
                    price_usdt: price
                }
            });

            ctx.reply(`✅ Лот создан: ${amount} ${resource} за ${price} USDT за единицу`);

        } catch (e) {
            console.error(e);
            ctx.reply('❌ Ошибка создания лота');
        }
    });
}