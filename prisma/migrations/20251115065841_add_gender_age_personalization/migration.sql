-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('YOUNG', 'MIDDLE', 'SENIOR', 'NOT_SPECIFIED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "defaultAgeGroup" "AgeGroup" DEFAULT 'NOT_SPECIFIED',
ADD COLUMN     "defaultGender" "Gender" DEFAULT 'NOT_SPECIFIED';

-- CreateIndex
CREATE INDEX "users_defaultGender_idx" ON "users"("defaultGender");

-- CreateIndex
CREATE INDEX "users_defaultAgeGroup_idx" ON "users"("defaultAgeGroup");
