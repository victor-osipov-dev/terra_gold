/*
  Warnings:

  - You are about to drop the column `telegram_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UserChat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserChat" DROP CONSTRAINT "UserChat_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "UserChat" DROP CONSTRAINT "UserChat_user_id_fkey";

-- DropIndex
DROP INDEX "User_telegram_id_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "telegram_id";

-- DropTable
DROP TABLE "UserChat";

-- CreateTable
CREATE TABLE "UserChatActivity" (
    "user_id" BIGINT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "total_messages" INTEGER NOT NULL,
    "messages_per_hour" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChatActivity_pkey" PRIMARY KEY ("user_id","chat_id")
);

-- AddForeignKey
ALTER TABLE "UserChatActivity" ADD CONSTRAINT "UserChatActivity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChatActivity" ADD CONSTRAINT "UserChatActivity_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
