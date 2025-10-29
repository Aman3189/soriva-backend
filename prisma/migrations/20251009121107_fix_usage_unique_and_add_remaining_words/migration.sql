/*
  Warnings:

  - You are about to drop the column `month` on the `usages` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `usages` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `usages` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."usages_userId_month_year_key";

-- AlterTable
ALTER TABLE "usages" DROP COLUMN "month",
DROP COLUMN "year",
ADD COLUMN     "remainingWords" INTEGER NOT NULL DEFAULT 30000,
ALTER COLUMN "monthlyLimit" SET DEFAULT 30000,
ALTER COLUMN "dailyLimit" SET DEFAULT 1000;

-- CreateIndex
CREATE UNIQUE INDEX "usages_userId_key" ON "usages"("userId");
