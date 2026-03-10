import { bot, prisma } from "../api";

bot.command("stats", async (ctx) => {
    const msg = ctx.message;
    const user = msg.from;
    const chat = msg.chat;
    // ctx — контекст сообщения
    const users_chats = await prisma.userChat.findMany({
        where: { chat_id: chat.id, NOT: { messages_per_hour: 0 } },
        include: { user: true },
    });

    let response = `👨‍💻Активность работников\nСколько сообщений отправлено за час. За работу больше ${process.env.MAX_NUMBER_CLICKS_PER_HOUR} доход не начисляется.\n\n`;

    const body = users_chats
        .map(
            (user_chat) =>
                `${user_chat.user.first_name + (user_chat.user.last_name ? " " + user_chat.user.last_name : "")}: ${user_chat.messages_per_hour}/${process.env.MAX_NUMBER_CLICKS_PER_HOUR} работы`,
        )
        .join("\n");
    response =
        response +
        (body.length === 0
            ? "😡 Работники бездельничают, пора их будить!"
            : body);

    ctx.reply(response);
});
