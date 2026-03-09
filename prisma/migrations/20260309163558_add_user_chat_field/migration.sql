/*
  Warnings:

  - You are about to drop the column `role` on the `UserChat` table. All the data in the column will be lost.
  - Added the required column `messages_per_hour` to the `UserChat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_messages` to the `UserChat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserChat" DROP COLUMN "role",
ADD COLUMN     "messages_per_hour" INTEGER NOT NULL,
ADD COLUMN     "total_messages" INTEGER NOT NULL;
