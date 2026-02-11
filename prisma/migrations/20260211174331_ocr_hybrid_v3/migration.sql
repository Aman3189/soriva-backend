/*
  Warnings:

  - You are about to drop the column `ocrTesseractUsed` on the `document_usage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "document_usage" DROP COLUMN "ocrTesseractUsed",
ADD COLUMN     "ocrMistralUsed" INTEGER NOT NULL DEFAULT 0;
