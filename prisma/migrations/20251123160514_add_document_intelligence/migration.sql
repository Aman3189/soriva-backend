-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('SUMMARY_SHORT', 'SUMMARY_LONG', 'SUMMARY_BULLET', 'KEYWORD_EXTRACT', 'DOCUMENT_CLEANUP', 'TRANSLATE_BASIC', 'FLASHCARDS', 'TEST_GENERATOR', 'NOTES_GENERATOR', 'TOPIC_BREAKDOWN', 'CROSS_PDF_COMPARE', 'TABLE_TO_CHARTS', 'SUMMARIES_ADVANCED', 'INSIGHTS_EXTRACTION', 'DOCUMENT_CLEANUP_ADVANCED', 'KEYWORD_INDEX_EXTRACTOR', 'WORKFLOW_CONVERSION', 'PRESENTATION_MAKER', 'QUESTION_BANK', 'FILL_IN_BLANKS', 'DOCUMENT_CHAT_MEMORY', 'TRANSLATE_SIMPLIFY_ADVANCED', 'DIAGRAM_INTERPRETATION', 'TREND_ANALYSIS', 'CONTRACT_LAW_SCAN', 'MULTI_DOC_REASONING', 'VOICE_MODE', 'REPORT_BUILDER', 'AI_DETECTION_REDACTION');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'TIMEOUT', 'CANCELLED', 'CACHED');

-- CreateTable
CREATE TABLE "document_operations" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "operationName" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiProvider" TEXT,
    "aiModel" TEXT,
    "result" TEXT,
    "resultPreview" TEXT,
    "status" "OperationStatus" NOT NULL DEFAULT 'SUCCESS',
    "error" TEXT,
    "processingTime" INTEGER,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "cacheKey" TEXT,
    "fromCache" BOOLEAN NOT NULL DEFAULT false,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "operationsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "tokensUsedThisMonth" INTEGER NOT NULL DEFAULT 0,
    "costThisMonth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freeOpsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "paidOpsThisMonth" INTEGER NOT NULL DEFAULT 0,
    "documentLimit" INTEGER NOT NULL DEFAULT 5,
    "operationLimit" INTEGER NOT NULL DEFAULT 25,
    "isPaidUser" BOOLEAN NOT NULL DEFAULT false,
    "totalStorageUsed" BIGINT NOT NULL DEFAULT 0,
    "storageLimit" BIGINT NOT NULL DEFAULT 10485760,
    "lastMonthlyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cycleStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cycleEndDate" TIMESTAMP(3) NOT NULL,
    "operationsThisHour" INTEGER NOT NULL DEFAULT 0,
    "lastHourlyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hourlyLimit" INTEGER NOT NULL DEFAULT 10,
    "operationsToday" INTEGER NOT NULL DEFAULT 0,
    "lastDailyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_operations_userId_idx" ON "document_operations"("userId");

-- CreateIndex
CREATE INDEX "document_operations_documentId_idx" ON "document_operations"("documentId");

-- CreateIndex
CREATE INDEX "document_operations_operationType_idx" ON "document_operations"("operationType");

-- CreateIndex
CREATE INDEX "document_operations_category_idx" ON "document_operations"("category");

-- CreateIndex
CREATE INDEX "document_operations_createdAt_idx" ON "document_operations"("createdAt");

-- CreateIndex
CREATE INDEX "document_operations_cacheKey_idx" ON "document_operations"("cacheKey");

-- CreateIndex
CREATE UNIQUE INDEX "document_usage_userId_key" ON "document_usage"("userId");

-- CreateIndex
CREATE INDEX "document_usage_userId_idx" ON "document_usage"("userId");

-- CreateIndex
CREATE INDEX "document_usage_lastMonthlyReset_idx" ON "document_usage"("lastMonthlyReset");

-- CreateIndex
CREATE INDEX "document_usage_isPaidUser_idx" ON "document_usage"("isPaidUser");

-- AddForeignKey
ALTER TABLE "document_operations" ADD CONSTRAINT "document_operations_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_operations" ADD CONSTRAINT "document_operations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_usage" ADD CONSTRAINT "document_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
