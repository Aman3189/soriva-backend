-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "sessionAgeGroup" "AgeGroup" NOT NULL DEFAULT 'NOT_SPECIFIED',
ADD COLUMN     "sessionGender" "Gender" NOT NULL DEFAULT 'NOT_SPECIFIED',
ADD COLUMN     "sessionName" TEXT DEFAULT 'User';

-- CreateIndex
CREATE INDEX "chat_sessions_sessionGender_idx" ON "chat_sessions"("sessionGender");

-- CreateIndex
CREATE INDEX "chat_sessions_sessionAgeGroup_idx" ON "chat_sessions"("sessionAgeGroup");
