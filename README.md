# Инцилизация
Настроить .env
docker compose up -d

npx prisma migrate dev
npx tsx init_resource_table.ts

# Во время разработки

## Vue для mini apps
npm run dev -- --host 0.0.0.0 --port 3000

## Bot node.js
npm run dev

