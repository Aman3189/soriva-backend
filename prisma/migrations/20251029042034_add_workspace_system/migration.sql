-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "orbitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "language" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "aiPrompt" TEXT,
    "generationProgress" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "statusMessage" TEXT,
    "lastExportedAt" TIMESTAMP(3),
    "exportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workspace_orbitId_idx" ON "Workspace"("orbitId");

-- CreateIndex
CREATE INDEX "Workspace_status_idx" ON "Workspace"("status");

-- CreateIndex
CREATE INDEX "Workspace_contentType_idx" ON "Workspace"("contentType");

-- CreateIndex
CREATE INDEX "Workspace_createdAt_idx" ON "Workspace"("createdAt");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_orbitId_fkey" FOREIGN KEY ("orbitId") REFERENCES "orbits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
