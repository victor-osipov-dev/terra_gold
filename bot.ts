import "dotenv/config";
import cron from "node-cron";
import { bot, prisma } from "./api";
import { applyCommands } from "./libs";
import hearAllCommands from "./middleware/hear_all_commands";
import hearAllMessages from "./middleware/hear_all_messages";

await hearAllCommands(bot);
await applyCommands(bot);
await hearAllMessages(bot);

async function resetStatisticsForHour() {
    await prisma.userChat.updateMany({
        data: {
            messages_per_hour: 0,
        },
    });
}

cron.schedule("0 * * * *", async () => {
    try {
        console.log("Запуск часовой статистики...");
        await resetStatisticsForHour();
        console.log("resetStatisticsForHour выполнена");
    } catch (error) {
        console.error("Ошибка при выполнении cron-задачи:", error);
    }
});

bot.launch();
console.log("Bot started");

// корректное завершение
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
