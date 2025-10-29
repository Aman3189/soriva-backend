/*
  Warnings:

  - You are about to drop the column `multiplier` on the `boosters` table. All the data in the column will be lost.
  - You are about to drop the column `wordsLimit` on the `boosters` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gatewayPaymentId]` on the table `boosters` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `boosterCategory` to the `boosters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `boosterName` to the `boosters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planName` to the `boosters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "boosters" DROP COLUMN "multiplier",
DROP COLUMN "wordsLimit",
ADD COLUMN     "boosterCategory" TEXT NOT NULL,
ADD COLUMN     "boosterName" TEXT NOT NULL,
ADD COLUMN     "cooldownDuration" INTEGER,
ADD COLUMN     "creditsAdded" INTEGER,
ADD COLUMN     "creditsRemaining" INTEGER,
ADD COLUMN     "creditsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gatewayMetadata" JSONB,
ADD COLUMN     "gatewayOrderId" TEXT,
ADD COLUMN     "maxPerDay" INTEGER,
ADD COLUMN     "planName" TEXT NOT NULL,
ADD COLUMN     "validity" INTEGER,
ADD COLUMN     "wordsAdded" INTEGER,
ADD COLUMN     "wordsRemaining" INTEGER,
ADD COLUMN     "wordsUnlocked" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activityTrend" TEXT NOT NULL DEFAULT 'new',
ADD COLUMN     "averageSessionDuration" INTEGER,
ADD COLUMN     "lastGreetingAt" TIMESTAMP(3),
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "loginPattern" JSONB,
ADD COLUMN     "memoryDays" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "preferredTimeSlots" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "responseDelay" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "sessionCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "boosters_gatewayPaymentId_key" ON "boosters"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "boosters_boosterCategory_idx" ON "boosters"("boosterCategory");

-- CreateIndex
CREATE INDEX "boosters_planName_idx" ON "boosters"("planName");

-- CreateIndex
CREATE INDEX "users_lastSeenAt_idx" ON "users"("lastSeenAt");

-- CreateIndex
CREATE INDEX "users_activityTrend_idx" ON "users"("activityTrend");
