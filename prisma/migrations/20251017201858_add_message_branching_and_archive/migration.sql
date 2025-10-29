/*
  Warnings:

  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Document" DROP CONSTRAINT "Document_userId_fkey";

-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "parentMessageId" TEXT;

-- DropTable
DROP TABLE "public"."Document";

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'cloudinary',
    "storageKey" TEXT,
    "textContent" TEXT,
    "contentLanguage" TEXT DEFAULT 'en',
    "wordCount" INTEGER,
    "pageCount" INTEGER,
    "metadata" JSONB,
    "title" TEXT,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processingStage" TEXT,
    "errorMessage" TEXT,
    "chunkingMethod" TEXT NOT NULL DEFAULT 'fixed',
    "chunkSize" INTEGER NOT NULL DEFAULT 512,
    "chunkOverlap" INTEGER NOT NULL DEFAULT 50,
    "embeddingModel" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "totalChunks" INTEGER NOT NULL DEFAULT 0,
    "totalEmbeddings" INTEGER NOT NULL DEFAULT 0,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "sharedWith" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "processingTime" INTEGER,
    "indexingTime" INTEGER,
    "lastAccessedAt" TIMESTAMP(3),
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "indexedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "charCount" INTEGER NOT NULL,
    "startPosition" INTEGER,
    "endPosition" INTEGER,
    "pageNumber" INTEGER,
    "section" TEXT,
    "metadata" JSONB,
    "semanticGroup" TEXT,
    "hasEmbedding" BOOLEAN NOT NULL DEFAULT false,
    "embeddingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_embeddings" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openai',
    "metadata" JSONB,
    "generationTime" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "document_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "documentId" TEXT,
    "query" TEXT NOT NULL,
    "queryType" TEXT NOT NULL DEFAULT 'semantic',
    "queryTokens" INTEGER,
    "queryWords" INTEGER,
    "language" TEXT DEFAULT 'en',
    "topK" INTEGER NOT NULL DEFAULT 5,
    "threshold" DOUBLE PRECISION,
    "filters" JSONB,
    "resultsFound" INTEGER NOT NULL DEFAULT 0,
    "resultsReturned" INTEGER NOT NULL DEFAULT 0,
    "resultChunkIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "retrievalTime" INTEGER,
    "embeddingTime" INTEGER,
    "searchTime" INTEGER,
    "topScores" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "avgScore" DOUBLE PRECISION,
    "wasHelpful" BOOLEAN,
    "feedbackRating" INTEGER,
    "feedbackComment" TEXT,
    "sessionId" TEXT,
    "messageId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rag_configurations" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "scopeId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "allowedValues" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "previousValue" TEXT,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rag_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "documents"("userId");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_fileType_idx" ON "documents"("fileType");

-- CreateIndex
CREATE INDEX "documents_visibility_idx" ON "documents"("visibility");

-- CreateIndex
CREATE INDEX "documents_uploadedAt_idx" ON "documents"("uploadedAt");

-- CreateIndex
CREATE INDEX "documents_lastAccessedAt_idx" ON "documents"("lastAccessedAt");

-- CreateIndex
CREATE UNIQUE INDEX "document_chunks_embeddingId_key" ON "document_chunks"("embeddingId");

-- CreateIndex
CREATE INDEX "document_chunks_documentId_idx" ON "document_chunks"("documentId");

-- CreateIndex
CREATE INDEX "document_chunks_userId_idx" ON "document_chunks"("userId");

-- CreateIndex
CREATE INDEX "document_chunks_chunkIndex_idx" ON "document_chunks"("chunkIndex");

-- CreateIndex
CREATE INDEX "document_chunks_hasEmbedding_idx" ON "document_chunks"("hasEmbedding");

-- CreateIndex
CREATE UNIQUE INDEX "document_chunks_documentId_chunkIndex_key" ON "document_chunks"("documentId", "chunkIndex");

-- CreateIndex
CREATE UNIQUE INDEX "document_embeddings_chunkId_key" ON "document_embeddings"("chunkId");

-- CreateIndex
CREATE INDEX "document_embeddings_documentId_idx" ON "document_embeddings"("documentId");

-- CreateIndex
CREATE INDEX "document_embeddings_userId_idx" ON "document_embeddings"("userId");

-- CreateIndex
CREATE INDEX "document_embeddings_model_idx" ON "document_embeddings"("model");

-- CreateIndex
CREATE INDEX "document_embeddings_status_idx" ON "document_embeddings"("status");

-- CreateIndex
CREATE INDEX "query_logs_userId_idx" ON "query_logs"("userId");

-- CreateIndex
CREATE INDEX "query_logs_documentId_idx" ON "query_logs"("documentId");

-- CreateIndex
CREATE INDEX "query_logs_queryType_idx" ON "query_logs"("queryType");

-- CreateIndex
CREATE INDEX "query_logs_createdAt_idx" ON "query_logs"("createdAt");

-- CreateIndex
CREATE INDEX "query_logs_sessionId_idx" ON "query_logs"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "rag_configurations_configKey_key" ON "rag_configurations"("configKey");

-- CreateIndex
CREATE INDEX "rag_configurations_configKey_idx" ON "rag_configurations"("configKey");

-- CreateIndex
CREATE INDEX "rag_configurations_category_idx" ON "rag_configurations"("category");

-- CreateIndex
CREATE INDEX "rag_configurations_scope_idx" ON "rag_configurations"("scope");

-- CreateIndex
CREATE INDEX "rag_configurations_isActive_idx" ON "rag_configurations"("isActive");

-- CreateIndex
CREATE INDEX "chat_sessions_isPinned_idx" ON "chat_sessions"("isPinned");

-- CreateIndex
CREATE INDEX "chat_sessions_isArchived_idx" ON "chat_sessions"("isArchived");

-- CreateIndex
CREATE INDEX "messages_branchId_idx" ON "messages"("branchId");

-- CreateIndex
CREATE INDEX "messages_parentMessageId_idx" ON "messages"("parentMessageId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_embeddingId_fkey" FOREIGN KEY ("embeddingId") REFERENCES "document_embeddings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_embeddings" ADD CONSTRAINT "document_embeddings_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_embeddings" ADD CONSTRAINT "document_embeddings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_logs" ADD CONSTRAINT "query_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_logs" ADD CONSTRAINT "query_logs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
