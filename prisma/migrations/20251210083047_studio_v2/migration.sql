/*
  Warnings:

  - The values [EDGE,LIFE] on the enum `PlanType` will be removed. If these variants are still used in the database, this will fail.
  - The values [IMAGE_GENERATION_512,IMAGE_GENERATION_1024,BACKGROUND_REMOVAL,IMAGE_UPSCALE_2X,IMAGE_UPSCALE_4X,VOICE_CLONE,VIDEO_5SEC,VIDEO_15SEC,VIDEO_30SEC,SCENE_WEAVER_5SEC,SCENE_WEAVER_10SEC,IMAGE_TO_VIDEO,MORPH_SEQUENCE,CHARACTER_DANCE] on the enum `StudioFeatureType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `studioDailyCreditsUsed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `studioDailyResetAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `studioImagesRemaining` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `studioImagesUsed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `Workspace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orbit_conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orbit_keywords` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orbit_suggestions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orbit_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orbits` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ForgeType" AS ENUM ('CODE', 'DOCUMENT', 'MARKDOWN', 'HTML', 'TABLE', 'JSON', 'CSV', 'DIAGRAM');

-- CreateEnum
CREATE TYPE "WorkspaceTool" AS ENUM ('RESUME', 'INVOICE', 'PORTFOLIO', 'CRM', 'CONTENT');

-- CreateEnum
CREATE TYPE "PowerPackTier" AS ENUM ('PLUS', 'PRO', 'APEX');

-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "PlanType_new" AS ENUM ('STARTER', 'PLUS', 'PRO', 'APEX');
ALTER TABLE "public"."users" ALTER COLUMN "planType" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "planType" TYPE "PlanType_new" USING ("planType"::text::"PlanType_new");
ALTER TYPE "PlanType" RENAME TO "PlanType_old";
ALTER TYPE "PlanType_new" RENAME TO "PlanType";
DROP TYPE "public"."PlanType_old";
ALTER TABLE "users" ALTER COLUMN "planType" SET DEFAULT 'STARTER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StudioFeatureType_new" AS ENUM ('TEXT_TO_IMAGE', 'LOGO_GENERATION', 'OBJECT_REMOVE', 'BACKGROUND_CHANGE', 'PORTRAIT_STUDIO', 'SKETCH_COMPLETE', 'PHOTO_ENHANCE', 'BACKGROUND_EXPAND', 'STYLE_TRANSFER', 'CELEBRITY_MERGE', 'BABY_PREDICTION', 'TALKING_PHOTO_5S', 'TALKING_PHOTO_10S', 'VIDEO_5S', 'VIDEO_10S');
ALTER TABLE "studio_generations" ALTER COLUMN "featureType" TYPE "StudioFeatureType_new" USING ("featureType"::text::"StudioFeatureType_new");
ALTER TYPE "StudioFeatureType" RENAME TO "StudioFeatureType_old";
ALTER TYPE "StudioFeatureType_new" RENAME TO "StudioFeatureType";
DROP TYPE "public"."StudioFeatureType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Workspace" DROP CONSTRAINT "Workspace_orbitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orbit_conversations" DROP CONSTRAINT "orbit_conversations_orbitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orbit_keywords" DROP CONSTRAINT "orbit_keywords_orbit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orbit_keywords" DROP CONSTRAINT "orbit_keywords_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orbit_suggestions" DROP CONSTRAINT "orbit_suggestions_selected_orbit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orbit_suggestions" DROP CONSTRAINT "orbit_suggestions_suggested_orbit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orbit_suggestions" DROP CONSTRAINT "orbit_suggestions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orbit_tags" DROP CONSTRAINT "orbit_tags_orbitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."orbits" DROP CONSTRAINT "orbits_userId_fkey";

-- DropIndex
DROP INDEX "public"."users_studioDailyResetAt_idx";

-- AlterTable
ALTER TABLE "UserUsage" ADD COLUMN     "extensionShownAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "studio_booster_purchases" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "studio_generations" ADD COLUMN     "apiProvider" TEXT,
ADD COLUMN     "featureCategory" TEXT,
ADD COLUMN     "inputImageUrl" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "studioDailyCreditsUsed",
DROP COLUMN "studioDailyResetAt",
DROP COLUMN "studioImagesRemaining",
DROP COLUMN "studioImagesUsed",
ADD COLUMN     "accidentalBoosterRefunds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "accountFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deviceFingerprint" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "flaggedReason" TEXT,
ADD COLUMN     "ipAddressHash" TEXT,
ADD COLUMN     "lastLoginIP" TEXT,
ADD COLUMN     "lastRefundAt" TIMESTAMP(3),
ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refundCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refundsThisYear" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "studioCreditsMonthly" SET DEFAULT 0;

-- DropTable
DROP TABLE "public"."Workspace";

-- DropTable
DROP TABLE "public"."orbit_conversations";

-- DropTable
DROP TABLE "public"."orbit_keywords";

-- DropTable
DROP TABLE "public"."orbit_suggestions";

-- DropTable
DROP TABLE "public"."orbit_tags";

-- DropTable
DROP TABLE "public"."orbits";

-- CreateTable
CREATE TABLE "blocked_devices" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedBy" TEXT NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signup_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "ipAddressHash" TEXT,
    "userAgent" TEXT,
    "screenResolution" TEXT,
    "timezone" TEXT,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "messageId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" "ForgeType" NOT NULL,
    "language" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "copyCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "forges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_power_packs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "PowerPackTier" NOT NULL,
    "packName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "region" "Region" NOT NULL DEFAULT 'IN',
    "resumeUsesTotal" INTEGER NOT NULL DEFAULT 5,
    "resumeUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "invoiceUsesTotal" INTEGER NOT NULL DEFAULT 5,
    "invoiceUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "portfolioUsesTotal" INTEGER NOT NULL DEFAULT 5,
    "portfolioUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "crmUsesTotal" INTEGER NOT NULL DEFAULT 5,
    "crmUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "contentUsesTotal" INTEGER NOT NULL DEFAULT 5,
    "contentUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "totalTokenBudget" INTEGER NOT NULL DEFAULT 125000,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "llmModel" TEXT NOT NULL,
    "llmProvider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "paymentGateway" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewayOrderId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_power_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_free_quotas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeUsesTotal" INTEGER NOT NULL DEFAULT 2,
    "resumeUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "invoiceUsesTotal" INTEGER NOT NULL DEFAULT 3,
    "invoiceUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "portfolioUsesTotal" INTEGER NOT NULL DEFAULT 0,
    "portfolioUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "crmUsesTotal" INTEGER NOT NULL DEFAULT 0,
    "crmUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "contentUsesTotal" INTEGER NOT NULL DEFAULT 0,
    "contentUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionPlan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_free_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_generations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "powerPackId" TEXT,
    "tool" "WorkspaceTool" NOT NULL,
    "toolName" TEXT NOT NULL,
    "userInput" JSONB NOT NULL,
    "userPrompt" TEXT,
    "outputJson" JSONB,
    "outputHtml" TEXT,
    "pdfUrl" TEXT,
    "docxUrl" TEXT,
    "pngUrl" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "llmModel" TEXT,
    "llmProvider" TEXT,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "WorkspaceStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "processingTime" INTEGER,
    "isEdit" BOOLEAN NOT NULL DEFAULT false,
    "parentGenerationId" TEXT,
    "editNumber" INTEGER NOT NULL DEFAULT 0,
    "templateUsed" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "workspace_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocked_devices_fingerprint_key" ON "blocked_devices"("fingerprint");

-- CreateIndex
CREATE INDEX "blocked_devices_fingerprint_idx" ON "blocked_devices"("fingerprint");

-- CreateIndex
CREATE INDEX "signup_logs_userId_idx" ON "signup_logs"("userId");

-- CreateIndex
CREATE INDEX "signup_logs_deviceFingerprint_idx" ON "signup_logs"("deviceFingerprint");

-- CreateIndex
CREATE INDEX "signup_logs_ipAddressHash_idx" ON "signup_logs"("ipAddressHash");

-- CreateIndex
CREATE UNIQUE INDEX "forges_shareToken_key" ON "forges"("shareToken");

-- CreateIndex
CREATE INDEX "forges_userId_idx" ON "forges"("userId");

-- CreateIndex
CREATE INDEX "forges_sessionId_idx" ON "forges"("sessionId");

-- CreateIndex
CREATE INDEX "forges_contentType_idx" ON "forges"("contentType");

-- CreateIndex
CREATE INDEX "forges_shareToken_idx" ON "forges"("shareToken");

-- CreateIndex
CREATE INDEX "forges_createdAt_idx" ON "forges"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_power_packs_gatewayPaymentId_key" ON "workspace_power_packs"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "workspace_power_packs_userId_idx" ON "workspace_power_packs"("userId");

-- CreateIndex
CREATE INDEX "workspace_power_packs_tier_idx" ON "workspace_power_packs"("tier");

-- CreateIndex
CREATE INDEX "workspace_power_packs_status_idx" ON "workspace_power_packs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_free_quotas_userId_key" ON "workspace_free_quotas"("userId");

-- CreateIndex
CREATE INDEX "workspace_free_quotas_userId_idx" ON "workspace_free_quotas"("userId");

-- CreateIndex
CREATE INDEX "workspace_generations_userId_idx" ON "workspace_generations"("userId");

-- CreateIndex
CREATE INDEX "workspace_generations_powerPackId_idx" ON "workspace_generations"("powerPackId");

-- CreateIndex
CREATE INDEX "workspace_generations_tool_idx" ON "workspace_generations"("tool");

-- CreateIndex
CREATE INDEX "workspace_generations_status_idx" ON "workspace_generations"("status");

-- CreateIndex
CREATE INDEX "workspace_generations_parentGenerationId_idx" ON "workspace_generations"("parentGenerationId");

-- CreateIndex
CREATE INDEX "studio_generations_apiProvider_idx" ON "studio_generations"("apiProvider");

-- CreateIndex
CREATE INDEX "subscriptions_billingCycle_idx" ON "subscriptions"("billingCycle");

-- CreateIndex
CREATE INDEX "users_deviceFingerprint_idx" ON "users"("deviceFingerprint");

-- CreateIndex
CREATE INDEX "users_ipAddressHash_idx" ON "users"("ipAddressHash");

-- CreateIndex
CREATE INDEX "users_emailVerified_idx" ON "users"("emailVerified");

-- CreateIndex
CREATE INDEX "users_mobileVerified_idx" ON "users"("mobileVerified");

-- CreateIndex
CREATE INDEX "users_accountFlagged_idx" ON "users"("accountFlagged");

-- AddForeignKey
ALTER TABLE "signup_logs" ADD CONSTRAINT "signup_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forges" ADD CONSTRAINT "forges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_power_packs" ADD CONSTRAINT "workspace_power_packs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_free_quotas" ADD CONSTRAINT "workspace_free_quotas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_generations" ADD CONSTRAINT "workspace_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_generations" ADD CONSTRAINT "workspace_generations_powerPackId_fkey" FOREIGN KEY ("powerPackId") REFERENCES "workspace_power_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_generations" ADD CONSTRAINT "workspace_generations_parentGenerationId_fkey" FOREIGN KEY ("parentGenerationId") REFERENCES "workspace_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
