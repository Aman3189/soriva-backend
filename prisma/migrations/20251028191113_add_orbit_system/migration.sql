-- CreateTable
CREATE TABLE "orbits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT DEFAULT '🌌',
    "color" TEXT DEFAULT '#6366f1',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orbits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orbit_conversations" (
    "id" TEXT NOT NULL,
    "orbitId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "orbit_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orbit_tags" (
    "id" TEXT NOT NULL,
    "orbitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#8b5cf6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orbit_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "orbits_userId_idx" ON "orbits"("userId");

-- CreateIndex
CREATE INDEX "orbits_userId_isDefault_idx" ON "orbits"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "orbits_userId_isPinned_idx" ON "orbits"("userId", "isPinned");

-- CreateIndex
CREATE INDEX "orbit_conversations_orbitId_idx" ON "orbit_conversations"("orbitId");

-- CreateIndex
CREATE INDEX "orbit_conversations_conversationId_idx" ON "orbit_conversations"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "orbit_conversations_orbitId_conversationId_key" ON "orbit_conversations"("orbitId", "conversationId");

-- CreateIndex
CREATE INDEX "orbit_tags_orbitId_idx" ON "orbit_tags"("orbitId");

-- CreateIndex
CREATE UNIQUE INDEX "orbit_tags_orbitId_name_key" ON "orbit_tags"("orbitId", "name");

-- AddForeignKey
ALTER TABLE "orbits" ADD CONSTRAINT "orbits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orbit_conversations" ADD CONSTRAINT "orbit_conversations_orbitId_fkey" FOREIGN KEY ("orbitId") REFERENCES "orbits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orbit_tags" ADD CONSTRAINT "orbit_tags_orbitId_fkey" FOREIGN KEY ("orbitId") REFERENCES "orbits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
