import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({
    adapter,
});

await prisma.resource.createMany({
    data: [
        { name: "Почва", number: process.env.INIT_RESOURCE_ANIMALS ?? 0 },
        { name: "Животные", number: process.env.INIT_RESOURCE_PLANTS ?? 0 },
        { name: "Фабрики", number: process.env.INIT_RESOURCE_FACTORIES ?? 0 },
    ],
});

console.log('Создание таблицы выполнено');
