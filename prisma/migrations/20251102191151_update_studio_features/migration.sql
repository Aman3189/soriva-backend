/*
  Warnings:

  - The values [HINGLISH_CAPTIONS,MEME_FACE_SWAP,AUDIO_MATCHER,FESTIVAL_GRAPHICS,TREND_PREDICTOR,CROSS_PLATFORM,BRAND_KIT,THUMBNAIL_TESTER,STORY_TO_REEL,AI_DANCE_VIDEO] on the enum `StudioFeatureType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StudioFeatureType_new" AS ENUM ('IMAGE_GENERATION_512', 'IMAGE_GENERATION_1024', 'BACKGROUND_REMOVAL', 'IMAGE_UPSCALE_2X', 'IMAGE_UPSCALE_4X', 'TEXT_TO_SPEECH', 'VOICE_CLONE', 'VIDEO_5SEC', 'VIDEO_15SEC', 'VIDEO_30SEC');
ALTER TABLE "studio_generations" ALTER COLUMN "featureType" TYPE "StudioFeatureType_new" USING ("featureType"::text::"StudioFeatureType_new");
ALTER TYPE "StudioFeatureType" RENAME TO "StudioFeatureType_old";
ALTER TYPE "StudioFeatureType_new" RENAME TO "StudioFeatureType";
DROP TYPE "public"."StudioFeatureType_old";
COMMIT;
