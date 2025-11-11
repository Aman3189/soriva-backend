/*
  Warnings:

  - The values [TEXT_TO_SPEECH] on the enum `StudioFeatureType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StudioFeatureType_new" AS ENUM ('IMAGE_GENERATION_512', 'IMAGE_GENERATION_1024', 'BACKGROUND_REMOVAL', 'IMAGE_UPSCALE_2X', 'IMAGE_UPSCALE_4X', 'VOICE_CLONE', 'VIDEO_5SEC', 'VIDEO_15SEC', 'VIDEO_30SEC', 'SCENE_WEAVER_5SEC', 'SCENE_WEAVER_10SEC', 'IMAGE_TO_VIDEO', 'MORPH_SEQUENCE', 'CHARACTER_DANCE');
ALTER TABLE "studio_generations" ALTER COLUMN "featureType" TYPE "StudioFeatureType_new" USING ("featureType"::text::"StudioFeatureType_new");
ALTER TYPE "StudioFeatureType" RENAME TO "StudioFeatureType_old";
ALTER TYPE "StudioFeatureType_new" RENAME TO "StudioFeatureType";
DROP TYPE "public"."StudioFeatureType_old";
COMMIT;

-- AlterTable
ALTER TABLE "usages" ADD COLUMN     "bonusWords" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cycleEndDate" TIMESTAMP(3),
ADD COLUMN     "cycleStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "studioCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "studioCreditsUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "usages_cycleEndDate_idx" ON "usages"("cycleEndDate");

-- CreateIndex
CREATE INDEX "usages_lastDailyReset_idx" ON "usages"("lastDailyReset");
