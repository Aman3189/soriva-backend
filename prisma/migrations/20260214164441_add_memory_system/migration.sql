-- CreateTable
CREATE TABLE "ConversationMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "systemMemory" JSONB NOT NULL DEFAULT '{}',
    "rollingSummary" TEXT NOT NULL DEFAULT '',
    "summaryTokens" INTEGER NOT NULL DEFAULT 0,
    "lastSummarizedAt" TIMESTAMP(3),
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMessage" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "messageIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationMemory_userId_idx" ON "ConversationMemory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMemory_userId_conversationId_key" ON "ConversationMemory"("userId", "conversationId");

-- CreateIndex
CREATE INDEX "RawMessage_memoryId_messageIndex_idx" ON "RawMessage"("memoryId", "messageIndex");

-- AddForeignKey
ALTER TABLE "ConversationMemory" ADD CONSTRAINT "ConversationMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMessage" ADD CONSTRAINT "RawMessage_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "ConversationMemory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
