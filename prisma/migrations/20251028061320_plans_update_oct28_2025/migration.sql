/*
  Warnings:

  - You are about to drop the column `maxPerDay` on the `boosters` table. All the data in the column will be lost.
  - The `status` column on the `subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `planStatus` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `securityStatus` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `activityTrend` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `planType` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[gatewayOrderId]` on the table `boosters` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `boosterCategory` on the `boosters` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('STARTER', 'PLUS', 'PRO', 'EDGE', 'LIFE');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING', 'TRIAL');

-- CreateEnum
CREATE TYPE "BoosterCategory" AS ENUM ('COOLDOWN', 'ADDON');

-- CreateEnum
CREATE TYPE "SecurityStatus" AS ENUM ('TRUSTED', 'FLAGGED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ActivityTrend" AS ENUM ('NEW', 'INCREASING', 'STABLE', 'DECLINING', 'IRREGULAR');

-- DropIndex
DROP INDEX "public"."boosters_gatewayPaymentId_key";

-- AlterTable
ALTER TABLE "boosters" DROP COLUMN "maxPerDay",
ADD COLUMN     "distributionLogic" TEXT,
ADD COLUMN     "docsBonus" INTEGER,
ADD COLUMN     "maxPerPlanPeriod" INTEGER DEFAULT 2,
ADD COLUMN     "priceMultiplier" DOUBLE PRECISION,
ADD COLUMN     "purchaseNumber" INTEGER,
ADD COLUMN     "resetOn" TEXT DEFAULT 'plan_renewal',
DROP COLUMN "boosterCategory",
ADD COLUMN     "boosterCategory" "BoosterCategory" NOT NULL,
ALTER COLUMN "cooldownDuration" SET DEFAULT 0,
ALTER COLUMN "validity" SET DEFAULT 10;

-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "personality" TEXT;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "aiProvider" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "status",
ADD COLUMN     "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "trialDays" SET DEFAULT 14;

-- AlterTable
ALTER TABLE "usages" ALTER COLUMN "monthlyLimit" SET DEFAULT 42000,
ALTER COLUMN "dailyLimit" SET DEFAULT 3000,
ALTER COLUMN "remainingWords" SET DEFAULT 42000;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cooldownPurchasesThisPeriod" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cooldownResetDate" TIMESTAMP(3),
ADD COLUMN     "lastCooldownPurchaseAt" TIMESTAMP(3),
ADD COLUMN     "trialDaysUsed" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "subscriptionPlan" SET DEFAULT 'starter',
DROP COLUMN "planStatus",
ADD COLUMN     "planStatus" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "securityStatus",
ADD COLUMN     "securityStatus" "SecurityStatus" NOT NULL DEFAULT 'TRUSTED',
DROP COLUMN "activityTrend",
ADD COLUMN     "activityTrend" "ActivityTrend" NOT NULL DEFAULT 'NEW',
DROP COLUMN "planType",
ADD COLUMN     "planType" "PlanType" NOT NULL DEFAULT 'STARTER';

-- CreateIndex
CREATE UNIQUE INDEX "boosters_gatewayOrderId_key" ON "boosters"("gatewayOrderId");

-- CreateIndex
CREATE INDEX "boosters_boosterCategory_idx" ON "boosters"("boosterCategory");

-- CreateIndex
CREATE INDEX "boosters_purchaseNumber_idx" ON "boosters"("purchaseNumber");

-- CreateIndex
CREATE INDEX "chat_sessions_personality_idx" ON "chat_sessions"("personality");

-- CreateIndex
CREATE INDEX "messages_aiProvider_idx" ON "messages"("aiProvider");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "users_planStatus_idx" ON "users"("planStatus");

-- CreateIndex
CREATE INDEX "users_securityStatus_idx" ON "users"("securityStatus");

-- CreateIndex
CREATE INDEX "users_activityTrend_idx" ON "users"("activityTrend");

-- CreateIndex
CREATE INDEX "users_planType_idx" ON "users"("planType");

-- CreateIndex
CREATE INDEX "users_cooldownResetDate_idx" ON "users"("cooldownResetDate");
