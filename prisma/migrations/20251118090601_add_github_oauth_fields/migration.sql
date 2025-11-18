/*
  Warnings:

  - A unique constraint covering the columns `[githubId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "githubId" TEXT;

-- CreateTable
CREATE TABLE "personalization_suggestions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "detectedGender" "Gender",
    "detectedAgeGroup" "AgeGroup",
    "genderConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ageConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "personalization_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personalization_suggestions_sessionId_key" ON "personalization_suggestions"("sessionId");

-- CreateIndex
CREATE INDEX "personalization_suggestions_userId_idx" ON "personalization_suggestions"("userId");

-- CreateIndex
CREATE INDEX "personalization_suggestions_sessionId_idx" ON "personalization_suggestions"("sessionId");

-- CreateIndex
CREATE INDEX "personalization_suggestions_status_idx" ON "personalization_suggestions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");

-- AddForeignKey
ALTER TABLE "personalization_suggestions" ADD CONSTRAINT "personalization_suggestions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalization_suggestions" ADD CONSTRAINT "personalization_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
