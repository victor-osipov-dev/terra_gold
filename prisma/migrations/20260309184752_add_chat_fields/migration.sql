/*
  Warnings:

  - You are about to alter the column `number` on the `Resource` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(10,3)`.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "budget" DECIMAL(10,3) NOT NULL DEFAULT 0,
ADD COLUMN     "food" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "level_workers" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "materials" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Resource" ALTER COLUMN "number" SET DATA TYPE DECIMAL(10,3);
