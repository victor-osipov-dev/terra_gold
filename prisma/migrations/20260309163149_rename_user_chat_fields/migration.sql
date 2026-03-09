/*
  Warnings:

  - The primary key for the `UserChat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chatId` on the `UserChat` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserChat` table. All the data in the column will be lost.
  - Added the required column `chat_id` to the `UserChat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `UserChat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserChat" DROP CONSTRAINT "UserChat_chatId_fkey";

-- DropForeignKey
ALTER TABLE "UserChat" DROP CONSTRAINT "UserChat_userId_fkey";

-- AlterTable
ALTER TABLE "UserChat" DROP CONSTRAINT "UserChat_pkey",
DROP COLUMN "chatId",
DROP COLUMN "userId",
ADD COLUMN     "chat_id" BIGINT NOT NULL,
ADD COLUMN     "user_id" BIGINT NOT NULL,
ADD CONSTRAINT "UserChat_pkey" PRIMARY KEY ("user_id", "chat_id");

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
