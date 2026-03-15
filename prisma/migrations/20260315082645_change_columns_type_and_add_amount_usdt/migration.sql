/*
  Warnings:

  - You are about to alter the column `amount` on the `TonTransaction` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,3)`.
  - Added the required column `amount_usdt` to the `TonTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TonTransaction" ADD COLUMN     "amount_usdt" DECIMAL(10,3) NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,3);
