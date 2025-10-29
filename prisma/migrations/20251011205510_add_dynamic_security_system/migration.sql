-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "isDocumentRequest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wordsUsed" INTEGER;

-- AlterTable
ALTER TABLE "usages" ADD COLUMN     "documentWordsUsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "documentWordsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jailbreakAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStudioReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSuspiciousActivity" TIMESTAMP(3),
ADD COLUMN     "securityStatus" TEXT NOT NULL DEFAULT 'trusted',
ADD COLUMN     "studioCreditsCarryForward" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "studioCreditsRemaining" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "studioCreditsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "suspiciousActivityCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trialExtended" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "usage_audits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "wordsUsed" INTEGER,
    "creditsUsed" INTEGER,
    "planName" TEXT NOT NULL,
    "sessionId" TEXT,
    "messageId" TEXT,
    "jobId" TEXT,
    "metadata" JSONB,
    "deductedFrom" TEXT,
    "balanceBefore" INTEGER,
    "balanceAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_patterns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'BLOCK',
    "description" TEXT NOT NULL,
    "examples" TEXT[],
    "falsePositives" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "blockCount" INTEGER NOT NULL DEFAULT 0,
    "lastMatched" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_configs" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
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

    CONSTRAINT "security_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_model_names" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "aliases" TEXT[],
    "provider" TEXT,
    "blockType" TEXT NOT NULL DEFAULT 'REMOVE',
    "replacement" TEXT DEFAULT 'Soriva',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "detectionCount" INTEGER NOT NULL DEFAULT 0,
    "lastDetected" TIMESTAMP(3),
    "reason" TEXT,
    "addedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocked_model_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_configurations" (
    "id" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "modelsConfig" JSONB NOT NULL,
    "baseUrl" TEXT,
    "apiVersion" TEXT,
    "timeout" INTEGER DEFAULT 30000,
    "retryAttempts" INTEGER DEFAULT 3,
    "supportsStreaming" BOOLEAN NOT NULL DEFAULT false,
    "supportsImages" BOOLEAN NOT NULL DEFAULT false,
    "supportsAudio" BOOLEAN NOT NULL DEFAULT false,
    "maxRequestsPerMinute" INTEGER,
    "maxTokensPerRequest" INTEGER,
    "isHealthy" BOOLEAN NOT NULL DEFAULT true,
    "lastHealthCheck" TIMESTAMP(3),
    "healthCheckUrl" TEXT,
    "configuredBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "requestPath" TEXT,
    "requestMethod" TEXT,
    "threatType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "matchedPatterns" TEXT[],
    "detectionMethod" TEXT[],
    "userInput" TEXT NOT NULL,
    "sanitizedInput" TEXT,
    "wasBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "aiResponse" TEXT,
    "sessionId" TEXT,
    "conversationContext" JSONB,
    "flags" JSONB,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learned_patterns" (
    "id" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "patternType" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 1,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "threatLevel" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceLogIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ANALYZING',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "promotedToPatternId" TEXT,
    "promotedAt" TIMESTAMP(3),
    "promotedBy" TEXT,
    "examples" TEXT[],
    "context" JSONB,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learned_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usage_audits_userId_idx" ON "usage_audits"("userId");

-- CreateIndex
CREATE INDEX "usage_audits_actionType_idx" ON "usage_audits"("actionType");

-- CreateIndex
CREATE INDEX "usage_audits_category_idx" ON "usage_audits"("category");

-- CreateIndex
CREATE INDEX "usage_audits_planName_idx" ON "usage_audits"("planName");

-- CreateIndex
CREATE INDEX "usage_audits_createdAt_idx" ON "usage_audits"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "security_patterns_name_key" ON "security_patterns"("name");

-- CreateIndex
CREATE INDEX "security_patterns_category_idx" ON "security_patterns"("category");

-- CreateIndex
CREATE INDEX "security_patterns_severity_idx" ON "security_patterns"("severity");

-- CreateIndex
CREATE INDEX "security_patterns_isActive_idx" ON "security_patterns"("isActive");

-- CreateIndex
CREATE INDEX "security_patterns_priority_idx" ON "security_patterns"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "security_configs_configKey_key" ON "security_configs"("configKey");

-- CreateIndex
CREATE INDEX "security_configs_configKey_idx" ON "security_configs"("configKey");

-- CreateIndex
CREATE INDEX "security_configs_category_idx" ON "security_configs"("category");

-- CreateIndex
CREATE INDEX "security_configs_isActive_idx" ON "security_configs"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_model_names_modelName_key" ON "blocked_model_names"("modelName");

-- CreateIndex
CREATE INDEX "blocked_model_names_modelName_idx" ON "blocked_model_names"("modelName");

-- CreateIndex
CREATE INDEX "blocked_model_names_provider_idx" ON "blocked_model_names"("provider");

-- CreateIndex
CREATE INDEX "blocked_model_names_isActive_idx" ON "blocked_model_names"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "provider_configurations_providerName_key" ON "provider_configurations"("providerName");

-- CreateIndex
CREATE INDEX "provider_configurations_providerName_idx" ON "provider_configurations"("providerName");

-- CreateIndex
CREATE INDEX "provider_configurations_isEnabled_idx" ON "provider_configurations"("isEnabled");

-- CreateIndex
CREATE INDEX "provider_configurations_priority_idx" ON "provider_configurations"("priority");

-- CreateIndex
CREATE INDEX "security_logs_userId_idx" ON "security_logs"("userId");

-- CreateIndex
CREATE INDEX "security_logs_threatType_idx" ON "security_logs"("threatType");

-- CreateIndex
CREATE INDEX "security_logs_severity_idx" ON "security_logs"("severity");

-- CreateIndex
CREATE INDEX "security_logs_riskScore_idx" ON "security_logs"("riskScore");

-- CreateIndex
CREATE INDEX "security_logs_wasBlocked_idx" ON "security_logs"("wasBlocked");

-- CreateIndex
CREATE INDEX "security_logs_reviewStatus_idx" ON "security_logs"("reviewStatus");

-- CreateIndex
CREATE INDEX "security_logs_createdAt_idx" ON "security_logs"("createdAt");

-- CreateIndex
CREATE INDEX "learned_patterns_patternType_idx" ON "learned_patterns"("patternType");

-- CreateIndex
CREATE INDEX "learned_patterns_frequency_idx" ON "learned_patterns"("frequency");

-- CreateIndex
CREATE INDEX "learned_patterns_riskScore_idx" ON "learned_patterns"("riskScore");

-- CreateIndex
CREATE INDEX "learned_patterns_status_idx" ON "learned_patterns"("status");

-- CreateIndex
CREATE INDEX "learned_patterns_reviewStatus_idx" ON "learned_patterns"("reviewStatus");

-- CreateIndex
CREATE INDEX "learned_patterns_lastSeenAt_idx" ON "learned_patterns"("lastSeenAt");

-- CreateIndex
CREATE INDEX "users_securityStatus_idx" ON "users"("securityStatus");

-- AddForeignKey
ALTER TABLE "usage_audits" ADD CONSTRAINT "usage_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_logs" ADD CONSTRAINT "security_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
