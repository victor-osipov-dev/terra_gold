-- CreateEnum
CREATE TYPE "PartType" AS ENUM ('USDT', 'PART');

-- CreateTable
CREATE TABLE "ChatRevenueShare" (
    "id" BIGSERIAL NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "others" BOOLEAN NOT NULL DEFAULT false,
    "part" DECIMAL(10,2) NOT NULL,
    "part_type" "PartType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRevenueShare_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatRevenueShare" ADD CONSTRAINT "ChatRevenueShare_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRevenueShare" ADD CONSTRAINT "ChatRevenueShare_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
