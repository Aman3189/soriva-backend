/*
  Warnings:

  - You are about to drop the column `voiceSttSecondsUsed` on the `Usage` table. All the data in the column will be lost.
  - You are about to drop the column `voiceTtsSecondsUsed` on the `Usage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usage" DROP COLUMN "voiceSttSecondsUsed",
DROP COLUMN "voiceTtsSecondsUsed",
ADD COLUMN     "voiceHourlyResetAt" TIMESTAMP(3),
ADD COLUMN     "voiceRequestsThisHour" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "voiceSecondsInput" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "voiceSecondsOutput" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "voiceUsageResetAt" TIMESTAMP(3);
