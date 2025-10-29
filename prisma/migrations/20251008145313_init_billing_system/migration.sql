/*
  Warnings:

  - You are about to drop the column `title` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the `file_uploads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `studio_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usage_logs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `message` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `response` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `chats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."file_uploads" DROP CONSTRAINT "file_uploads_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."studio_jobs" DROP CONSTRAINT "studio_jobs_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."usage_logs" DROP CONSTRAINT "usage_logs_userId_fkey";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "response" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "tokens" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "planEndDate" TIMESTAMP(3),
ADD COLUMN     "planStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."file_uploads";

-- DropTable
DROP TABLE "public"."messages";

-- DropTable
DROP TABLE "public"."studio_jobs";

-- DropTable
DROP TABLE "public"."usage_logs";

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planPrice" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "paymentGateway" TEXT,
    "gatewaySubscriptionId" TEXT,
    "gatewayCustomerId" TEXT,
    "gatewayMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "wordsUsed" INTEGER NOT NULL DEFAULT 0,
    "dailyWordsUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyLimit" INTEGER NOT NULL,
    "dailyLimit" INTEGER NOT NULL,
    "lastDailyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMonthlyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boosters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boosterType" TEXT NOT NULL,
    "boosterPrice" INTEGER NOT NULL,
    "multiplier" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'active',
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "wordsUsed" INTEGER NOT NULL DEFAULT 0,
    "wordsLimit" INTEGER NOT NULL,
    "paymentGateway" TEXT,
    "gatewayPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boosters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalCredits" INTEGER NOT NULL DEFAULT 0,
    "usedCredits" INTEGER NOT NULL DEFAULT 0,
    "remainingCredits" INTEGER NOT NULL DEFAULT 0,
    "planName" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "lastReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "planName" TEXT,
    "boosterType" TEXT,
    "creditsAdded" INTEGER,
    "paymentGateway" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewayOrderId" TEXT,
    "gatewaySignature" TEXT,
    "gatewayMetadata" JSONB,
    "description" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_gatewaySubscriptionId_key" ON "subscriptions"("gatewaySubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_planName_idx" ON "subscriptions"("planName");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "usages_userId_idx" ON "usages"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "usages_userId_month_year_key" ON "usages"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "boosters_userId_idx" ON "boosters"("userId");

-- CreateIndex
CREATE INDEX "boosters_status_idx" ON "boosters"("status");

-- CreateIndex
CREATE INDEX "credits_userId_idx" ON "credits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "credits_userId_month_year_key" ON "credits"("userId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_gatewayPaymentId_key" ON "transactions"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "chats_userId_idx" ON "chats"("userId");

-- CreateIndex
CREATE INDEX "chats_sessionId_idx" ON "chats"("sessionId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_googleId_idx" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_subscriptionPlan_idx" ON "users"("subscriptionPlan");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usages" ADD CONSTRAINT "usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boosters" ADD CONSTRAINT "boosters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
