/*
  Warnings:

  - The primary key for the `orbit_keywords` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `orbit_suggestions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `weight` on table `orbit_keywords` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `orbit_keywords` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `orbit_keywords` required. This step will fail if there are existing NULL values in that column.
  - Made the column `confidence` on table `orbit_suggestions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `orbit_suggestions` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "StudioFeatureType" AS ENUM ('HINGLISH_CAPTIONS', 'MEME_FACE_SWAP', 'AUDIO_MATCHER', 'FESTIVAL_GRAPHICS', 'TREND_PREDICTOR', 'CROSS_PLATFORM', 'BRAND_KIT', 'THUMBNAIL_TESTER', 'STORY_TO_REEL', 'AI_DANCE_VIDEO');

-- CreateEnum
CREATE TYPE "StudioBoosterType" AS ENUM ('LITE', 'PRO', 'MAX');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "public"."orbit_keywords" DROP CONSTRAINT "fk_orbit_keywords_orbit";

-- DropForeignKey
ALTER TABLE "public"."orbit_keywords" DROP CONSTRAINT "fk_orbit_keywords_user";

-- DropForeignKey
ALTER TABLE "public"."orbit_suggestions" DROP CONSTRAINT "fk_orbit_suggestions_orbit";

-- DropForeignKey
ALTER TABLE "public"."orbit_suggestions" DROP CONSTRAINT "fk_orbit_suggestions_selected_orbit";

-- DropForeignKey
ALTER TABLE "public"."orbit_suggestions" DROP CONSTRAINT "fk_orbit_suggestions_user";

-- AlterTable
ALTER TABLE "orbit_keywords" DROP CONSTRAINT "orbit_keywords_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "orbit_id" SET DATA TYPE TEXT,
ALTER COLUMN "weight" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "orbit_keywords_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "orbit_suggestions" DROP CONSTRAINT "orbit_suggestions_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "conversation_id" SET DATA TYPE TEXT,
ALTER COLUMN "suggested_orbit_id" SET DATA TYPE TEXT,
ALTER COLUMN "confidence" SET NOT NULL,
ALTER COLUMN "selected_orbit_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "orbit_suggestions_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "studio_generations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureType" "StudioFeatureType" NOT NULL,
    "featureName" TEXT NOT NULL,
    "userPrompt" TEXT NOT NULL,
    "parameters" JSONB,
    "creditsUsed" INTEGER NOT NULL,
    "previewCredits" INTEGER NOT NULL DEFAULT 1,
    "generationCredits" INTEGER NOT NULL,
    "apiCost" DOUBLE PRECISION,
    "gpuCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "profitMargin" DOUBLE PRECISION,
    "status" "GenerationStatus" NOT NULL DEFAULT 'PENDING',
    "outputUrl" TEXT,
    "outputType" TEXT,
    "metadata" JSONB,
    "processingTime" INTEGER,
    "modelUsed" TEXT,
    "errorMessage" TEXT,
    "hasWatermark" BOOLEAN NOT NULL DEFAULT true,
    "watermarkRemoved" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studio_previews" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "previewNumber" INTEGER NOT NULL,
    "previewUrl" TEXT NOT NULL,
    "previewType" TEXT NOT NULL,
    "resolution" TEXT,
    "duration" INTEGER,
    "fileSize" INTEGER,
    "creditsCost" INTEGER NOT NULL DEFAULT 0,
    "apiCost" DOUBLE PRECISION,
    "gpuCost" DOUBLE PRECISION,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "regenerated" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "studio_previews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studio_booster_purchases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boosterType" "StudioBoosterType" NOT NULL,
    "boosterName" TEXT NOT NULL,
    "creditsAdded" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "validityDays" INTEGER NOT NULL DEFAULT 30,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "gatewayCost" DOUBLE PRECISION,
    "netRevenue" DOUBLE PRECISION,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "creditsRemaining" INTEGER NOT NULL,
    "metadata" JSONB,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_booster_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "studio_generations_userId_idx" ON "studio_generations"("userId");

-- CreateIndex
CREATE INDEX "studio_generations_featureType_idx" ON "studio_generations"("featureType");

-- CreateIndex
CREATE INDEX "studio_generations_status_idx" ON "studio_generations"("status");

-- CreateIndex
CREATE INDEX "studio_generations_createdAt_idx" ON "studio_generations"("createdAt");

-- CreateIndex
CREATE INDEX "studio_previews_generationId_idx" ON "studio_previews"("generationId");

-- CreateIndex
CREATE INDEX "studio_previews_userId_idx" ON "studio_previews"("userId");

-- CreateIndex
CREATE INDEX "studio_previews_previewNumber_idx" ON "studio_previews"("previewNumber");

-- CreateIndex
CREATE UNIQUE INDEX "studio_booster_purchases_paymentId_key" ON "studio_booster_purchases"("paymentId");

-- CreateIndex
CREATE INDEX "studio_booster_purchases_userId_idx" ON "studio_booster_purchases"("userId");

-- CreateIndex
CREATE INDEX "studio_booster_purchases_boosterType_idx" ON "studio_booster_purchases"("boosterType");

-- CreateIndex
CREATE INDEX "studio_booster_purchases_active_idx" ON "studio_booster_purchases"("active");

-- CreateIndex
CREATE INDEX "studio_booster_purchases_expiresAt_idx" ON "studio_booster_purchases"("expiresAt");

-- CreateIndex
CREATE INDEX "studio_booster_purchases_paymentId_idx" ON "studio_booster_purchases"("paymentId");

-- CreateIndex
CREATE INDEX "studio_booster_purchases_purchasedAt_idx" ON "studio_booster_purchases"("purchasedAt");

-- AddForeignKey
ALTER TABLE "orbit_suggestions" ADD CONSTRAINT "orbit_suggestions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orbit_suggestions" ADD CONSTRAINT "orbit_suggestions_suggested_orbit_id_fkey" FOREIGN KEY ("suggested_orbit_id") REFERENCES "orbits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orbit_suggestions" ADD CONSTRAINT "orbit_suggestions_selected_orbit_id_fkey" FOREIGN KEY ("selected_orbit_id") REFERENCES "orbits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orbit_keywords" ADD CONSTRAINT "orbit_keywords_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orbit_keywords" ADD CONSTRAINT "orbit_keywords_orbit_id_fkey" FOREIGN KEY ("orbit_id") REFERENCES "orbits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_generations" ADD CONSTRAINT "studio_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_previews" ADD CONSTRAINT "studio_previews_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "studio_generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_previews" ADD CONSTRAINT "studio_previews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_booster_purchases" ADD CONSTRAINT "studio_booster_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_orbit_keywords_keyword" RENAME TO "orbit_keywords_keyword_idx";

-- RenameIndex
ALTER INDEX "idx_orbit_keywords_user_orbit" RENAME TO "orbit_keywords_user_id_orbit_id_idx";

-- RenameIndex
ALTER INDEX "unique_user_orbit_keyword" RENAME TO "orbit_keywords_user_id_orbit_id_keyword_key";

-- RenameIndex
ALTER INDEX "idx_orbit_suggestions_choice" RENAME TO "orbit_suggestions_user_choice_idx";

-- RenameIndex
ALTER INDEX "idx_orbit_suggestions_conversation" RENAME TO "orbit_suggestions_conversation_id_idx";

-- RenameIndex
ALTER INDEX "idx_orbit_suggestions_user" RENAME TO "orbit_suggestions_user_id_idx";
