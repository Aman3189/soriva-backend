-- AlterTable
ALTER TABLE "image_usage" ADD COLUMN     "boosterFluxKontextImages" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "boosterNanoBananaImages" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fluxKontextImagesLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fluxKontextImagesUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nanoBananaImagesLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nanoBananaImagesUsed" INTEGER NOT NULL DEFAULT 0;
