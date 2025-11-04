-- AlterTable
ALTER TABLE "users" ADD COLUMN     "studioCreditsBooster" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "studioCreditsMonthly" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "studioDailyCreditsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "studioDailyResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "conversation_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "emotion" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversation_messages_userId_timestamp_idx" ON "conversation_messages"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "conversation_messages_conversationId_idx" ON "conversation_messages"("conversationId");

-- CreateIndex
CREATE INDEX "conversation_messages_userId_isImportant_idx" ON "conversation_messages"("userId", "isImportant");

-- CreateIndex
CREATE INDEX "users_studioDailyResetAt_idx" ON "users"("studioDailyResetAt");

-- CreateIndex
CREATE INDEX "users_lastStudioReset_idx" ON "users"("lastStudioReset");

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
