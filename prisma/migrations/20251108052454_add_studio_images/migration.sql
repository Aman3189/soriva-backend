-- AlterTable
ALTER TABLE "users" ADD COLUMN     "studioImagesRemaining" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "studioImagesUsed" INTEGER NOT NULL DEFAULT 0;
