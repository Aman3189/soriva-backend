-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "planType" TEXT NOT NULL DEFAULT 'STARTER';

-- CreateTable
CREATE TABLE "export_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploading',
    "processedText" TEXT,
    "pageCount" INTEGER,
    "ragDocumentId" TEXT,
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "queryCount" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_queries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "relevantChunks" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "wordsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_queries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "export_logs_userId_idx" ON "export_logs"("userId");

-- CreateIndex
CREATE INDEX "export_logs_createdAt_idx" ON "export_logs"("createdAt");

-- CreateIndex
CREATE INDEX "user_documents_userId_idx" ON "user_documents"("userId");

-- CreateIndex
CREATE INDEX "user_documents_status_idx" ON "user_documents"("status");

-- CreateIndex
CREATE INDEX "document_queries_userId_idx" ON "document_queries"("userId");

-- CreateIndex
CREATE INDEX "document_queries_documentId_idx" ON "document_queries"("documentId");

-- AddForeignKey
ALTER TABLE "export_logs" ADD CONSTRAINT "export_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_queries" ADD CONSTRAINT "document_queries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_queries" ADD CONSTRAINT "document_queries_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "user_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
