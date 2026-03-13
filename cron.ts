import cron from "node-cron";
import { prisma } from "./api";

async function resetStatisticsForHour() {
    await prisma.userChat.updateMany({
        data: {
            messages_per_hour: 0,
        },
    });
}

cron.schedule("0 * * * *", async () => {
    try {
        await resetStatisticsForHour();
        console.log("resetStatisticsForHour выполнена");
    } catch (error) {
        console.error("Ошибка при выполнении cron-задачи:", error);
    }
});
