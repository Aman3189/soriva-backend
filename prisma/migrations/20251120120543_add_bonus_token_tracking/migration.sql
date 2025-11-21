-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "bonusTokensLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bonusTokensUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "monthlyTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tokensUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usageResetDay" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "UserUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokensUsedMonthly" INTEGER NOT NULL DEFAULT 0,
    "tokensUsedDaily" INTEGER NOT NULL DEFAULT 0,
    "requestsThisMinute" INTEGER NOT NULL DEFAULT 0,
    "requestsThisHour" INTEGER NOT NULL DEFAULT 0,
    "voiceMinutesUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "studioCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyResetAt" TIMESTAMP(3) NOT NULL,
    "dailyResetAt" TIMESTAMP(3) NOT NULL,
    "minuteResetAt" TIMESTAMP(3) NOT NULL,
    "hourResetAt" TIMESTAMP(3) NOT NULL,
    "lastRequestAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserUsage_userId_key" ON "UserUsage"("userId");

-- CreateIndex
CREATE INDEX "UserUsage_userId_idx" ON "UserUsage"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_lastResetAt_idx" ON "subscriptions"("lastResetAt");

-- AddForeignKey
ALTER TABLE "UserUsage" ADD CONSTRAINT "UserUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
