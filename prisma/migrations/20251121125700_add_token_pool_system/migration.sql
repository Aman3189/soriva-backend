/*
  Warnings:

  - You are about to drop the `usages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."usages" DROP CONSTRAINT "usages_userId_fkey";

-- DropTable
DROP TABLE "public"."usages";

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "wordsUsed" INTEGER NOT NULL DEFAULT 0,
    "dailyWordsUsed" INTEGER NOT NULL DEFAULT 0,
    "remainingWords" INTEGER NOT NULL DEFAULT 0,
    "bonusWords" INTEGER NOT NULL DEFAULT 0,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 0,
    "dailyLimit" INTEGER NOT NULL DEFAULT 0,
    "premiumTokensTotal" INTEGER NOT NULL DEFAULT 0,
    "premiumTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "premiumTokensRemaining" INTEGER NOT NULL DEFAULT 0,
    "bonusTokensTotal" INTEGER NOT NULL DEFAULT 0,
    "bonusTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "bonusTokensRemaining" INTEGER NOT NULL DEFAULT 0,
    "dailyTokenLimit" INTEGER NOT NULL DEFAULT 0,
    "dailyTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "dailyTokensRemaining" INTEGER NOT NULL DEFAULT 0,
    "rolledOverTokens" INTEGER NOT NULL DEFAULT 0,
    "totalAvailableToday" INTEGER NOT NULL DEFAULT 0,
    "cycleStartDate" TIMESTAMP(3) NOT NULL,
    "cycleEndDate" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "lastDailyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMonthlyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usage_userId_key" ON "Usage"("userId");

-- CreateIndex
CREATE INDEX "Usage_userId_idx" ON "Usage"("userId");

-- CreateIndex
CREATE INDEX "Usage_lastDailyReset_idx" ON "Usage"("lastDailyReset");

-- CreateIndex
CREATE INDEX "Usage_cycleEndDate_idx" ON "Usage"("cycleEndDate");

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
