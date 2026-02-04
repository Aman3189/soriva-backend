-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('entertainment', 'sports', 'technology', 'business', 'general', 'science', 'health', 'politics', 'world', 'lifestyle');

-- CreateEnum
CREATE TYPE "HoroscopeSign" AS ENUM ('aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces');

-- CreateEnum
CREATE TYPE "HealthPlan" AS ENUM ('FREE', 'PERSONAL', 'FAMILY');

-- CreateEnum
CREATE TYPE "HealthSubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAUSED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('BLOOD_TEST', 'XRAY', 'MRI', 'CT_SCAN', 'ULTRASOUND', 'ECG', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'OTHER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('YOUNG', 'MIDDLE', 'SENIOR', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('STARTER', 'LITE', 'PLUS', 'PRO', 'APEX', 'SOVEREIGN');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING', 'TRIAL');

-- CreateEnum
CREATE TYPE "BoosterCategory" AS ENUM ('COOLDOWN', 'ADDON', 'DOC_AI');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SecurityStatus" AS ENUM ('TRUSTED', 'FLAGGED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ActivityTrend" AS ENUM ('NEW', 'INCREASING', 'STABLE', 'DECLINING', 'IRREGULAR');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('IN', 'INTL');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'USD');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('SUMMARY_SHORT', 'SUMMARY_LONG', 'SUMMARY_BULLET', 'KEYWORD_EXTRACT', 'DOCUMENT_CLEANUP', 'TRANSLATE_BASIC', 'FLASHCARDS', 'TEST_GENERATOR', 'NOTES_GENERATOR', 'TOPIC_BREAKDOWN', 'CROSS_PDF_COMPARE', 'TABLE_TO_CHARTS', 'SUMMARIES_ADVANCED', 'INSIGHTS_EXTRACTION', 'DOCUMENT_CLEANUP_ADVANCED', 'KEYWORD_INDEX_EXTRACTOR', 'WORKFLOW_CONVERSION', 'PRESENTATION_MAKER', 'QUESTION_BANK', 'FILL_IN_BLANKS', 'DOCUMENT_CHAT_MEMORY', 'TRANSLATE_SIMPLIFY_ADVANCED', 'DIAGRAM_INTERPRETATION', 'TREND_ANALYSIS', 'CONTRACT_LAW_SCAN', 'MULTI_DOC_REASONING', 'VOICE_MODE', 'REPORT_BUILDER', 'AI_DETECTION_REDACTION', 'EXPLAIN_SIMPLE', 'EXTRACT_DEFINITIONS', 'EXPLAIN_AS_TEACHER', 'QUIZ_TURBO', 'ELI5');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'TIMEOUT', 'CANCELLED', 'CACHED');

-- CreateEnum
CREATE TYPE "ForgeType" AS ENUM ('CODE', 'DOCUMENT', 'MARKDOWN', 'HTML', 'TABLE', 'JSON', 'CSV', 'DIAGRAM');

-- CreateEnum
CREATE TYPE "WorkspaceTool" AS ENUM ('RESUME', 'LETTER', 'INVOICE', 'RECEIPT', 'CERTIFICATE', 'AGREEMENT', 'MEMO', 'PROPOSAL', 'NEWSLETTER');

-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "UserUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokensUsedMonthly" INTEGER NOT NULL DEFAULT 0,
    "tokensUsedDaily" INTEGER NOT NULL DEFAULT 0,
    "requestsThisMinute" INTEGER NOT NULL DEFAULT 0,
    "requestsThisHour" INTEGER NOT NULL DEFAULT 0,
    "voiceMinutesUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyResetAt" TIMESTAMP(3) NOT NULL,
    "dailyResetAt" TIMESTAMP(3) NOT NULL,
    "minuteResetAt" TIMESTAMP(3) NOT NULL,
    "hourResetAt" TIMESTAMP(3) NOT NULL,
    "lastRequestAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "extensionShownAt" TIMESTAMP(3),
    "planName" TEXT NOT NULL DEFAULT 'STARTER',

    CONSTRAINT "UserUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "googleId" TEXT,
    "googleEmail" TEXT,
    "googleAvatar" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'email',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planEndDate" TIMESTAMP(3),
    "planStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avatar" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "trialEndDate" TIMESTAMP(3),
    "trialStartDate" TIMESTAMP(3),
    "trialUsed" BOOLEAN NOT NULL DEFAULT false,
    "documentWordsUsed" INTEGER NOT NULL DEFAULT 0,
    "jailbreakAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastSuspiciousActivity" TIMESTAMP(3),
    "suspiciousActivityCount" INTEGER NOT NULL DEFAULT 0,
    "trialExtended" BOOLEAN NOT NULL DEFAULT false,
    "averageSessionDuration" INTEGER,
    "lastGreetingAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "loginPattern" JSONB,
    "memoryDays" INTEGER NOT NULL DEFAULT 5,
    "preferredTimeSlots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "responseDelay" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "gender" TEXT DEFAULT 'other',
    "cooldownPurchasesThisPeriod" INTEGER NOT NULL DEFAULT 0,
    "cooldownResetDate" TIMESTAMP(3),
    "lastCooldownPurchaseAt" TIMESTAMP(3),
    "trialDaysUsed" INTEGER NOT NULL DEFAULT 0,
    "planStatus" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "securityStatus" "SecurityStatus" NOT NULL DEFAULT 'TRUSTED',
    "activityTrend" "ActivityTrend" NOT NULL DEFAULT 'NEW',
    "planType" "PlanType" NOT NULL DEFAULT 'STARTER',
    "region" "Region" NOT NULL DEFAULT 'IN',
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "country" TEXT DEFAULT 'IN',
    "detectedCountry" TEXT,
    "countryName" TEXT,
    "timezone" TEXT,
    "defaultAgeGroup" "AgeGroup" DEFAULT 'NOT_SPECIFIED',
    "defaultGender" "Gender" DEFAULT 'NOT_SPECIFIED',
    "githubId" TEXT,
    "accidentalBoosterRefunds" INTEGER NOT NULL DEFAULT 0,
    "accountFlagged" BOOLEAN NOT NULL DEFAULT false,
    "deviceFingerprint" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "flaggedReason" TEXT,
    "ipAddressHash" TEXT,
    "lastLoginIP" TEXT,
    "lastRefundAt" TIMESTAMP(3),
    "mobileNumber" TEXT,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "refundCount" INTEGER NOT NULL DEFAULT 0,
    "refundsThisYear" INTEGER NOT NULL DEFAULT 0,
    "homeCity" VARCHAR(255),
    "homeState" VARCHAR(255),
    "homeCountry" VARCHAR(255),
    "homeCountryCode" VARCHAR(10),
    "homeLatitude" DOUBLE PRECISION,
    "homeLongitude" DOUBLE PRECISION,
    "homeLocationSetAt" TIMESTAMP(6),
    "currentCity" VARCHAR(255),
    "currentState" VARCHAR(255),
    "currentCountry" VARCHAR(255),
    "currentCountryCode" VARCHAR(10),
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "currentLocationUpdatedAt" TIMESTAMP(6),
    "locationPermissionGranted" BOOLEAN DEFAULT false,
    "locationPermissionAskedAt" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_devices" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedBy" TEXT NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signup_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "ipAddressHash" TEXT,
    "userAgent" TEXT,
    "screenResolution" TEXT,
    "timezone" TEXT,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Horoscope" (
    "id" TEXT NOT NULL,
    "sign" "HoroscopeSign" NOT NULL,
    "prediction" TEXT NOT NULL,
    "predictionHi" TEXT,
    "mood" TEXT NOT NULL,
    "moodHi" TEXT,
    "luckyNumber" TEXT NOT NULL,
    "luckyColor" TEXT NOT NULL,
    "luckyTime" TEXT NOT NULL,
    "compatibility" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validFor" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Horoscope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "HealthPlan" NOT NULL DEFAULT 'FREE',
    "status" "HealthSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "price" INTEGER NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "region" "Region" NOT NULL DEFAULT 'IN',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "maxMembers" INTEGER NOT NULL DEFAULT 1,
    "paymentGateway" TEXT,
    "gatewaySubscriptionId" TEXT,
    "gatewayCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_family_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyMemberId" TEXT,
    "title" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL DEFAULT 'OTHER',
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "labName" TEXT,
    "doctorName" TEXT,
    "fileUrl" TEXT NOT NULL,
    "filePublicId" TEXT,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "extractedText" TEXT,
    "fileName" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "pageCount" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "userNotes" TEXT,

    CONSTRAINT "health_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_chats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyMemberId" TEXT,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencedReportId" TEXT,

    CONSTRAINT "health_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "comparisonsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pagesUploaded" INTEGER NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "health_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planPrice" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "paymentGateway" TEXT,
    "gatewaySubscriptionId" TEXT,
    "gatewayCustomerId" TEXT,
    "gatewayMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "trialDays" INTEGER DEFAULT 14,
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "region" "Region" NOT NULL DEFAULT 'IN',
    "bonusTokensLimit" INTEGER NOT NULL DEFAULT 0,
    "bonusTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monthlyTokens" INTEGER NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "usageResetDay" INTEGER NOT NULL DEFAULT 1,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "wordsUsed" INTEGER NOT NULL DEFAULT 0,
    "dailyWordsUsed" INTEGER NOT NULL DEFAULT 0,
    "remainingWords" INTEGER NOT NULL DEFAULT 0,
    "bonusWords" INTEGER NOT NULL DEFAULT 0,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 0,
    "dailyLimit" INTEGER NOT NULL DEFAULT 0,
    "premiumTokensTotal" INTEGER NOT NULL DEFAULT 0,
    "premiumTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "premiumTokensRemaining" INTEGER NOT NULL DEFAULT 0,
    "bonusTokensTotal" INTEGER NOT NULL DEFAULT 0,
    "bonusTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "bonusTokensRemaining" INTEGER NOT NULL DEFAULT 0,
    "dailyTokenLimit" INTEGER NOT NULL DEFAULT 0,
    "dailyTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "dailyTokensRemaining" INTEGER NOT NULL DEFAULT 0,
    "rolledOverTokens" INTEGER NOT NULL DEFAULT 0,
    "totalAvailableToday" INTEGER NOT NULL DEFAULT 0,
    "cycleStartDate" TIMESTAMP(3) NOT NULL,
    "cycleEndDate" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "lastDailyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMonthlyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastVoiceUsedAt" TIMESTAMP(3),
    "voiceMinutesUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voiceRequestCount" INTEGER NOT NULL DEFAULT 0,
    "voiceHourlyResetAt" TIMESTAMP(3),
    "voiceRequestsThisHour" INTEGER NOT NULL DEFAULT 0,
    "voiceSecondsInput" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voiceSecondsOutput" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voiceUsageResetAt" TIMESTAMP(3),
    "voiceActualCostThisMonth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voiceBonusMinutesEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voiceBonusMinutesUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voiceSavingsAccumulated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voiceTotalSavingsThisMonth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "promptPoolLimit" INTEGER DEFAULT 100000,
    "promptPoolUsed" INTEGER DEFAULT 0,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boosters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boosterType" TEXT NOT NULL,
    "boosterPrice" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "wordsUsed" INTEGER NOT NULL DEFAULT 0,
    "paymentGateway" TEXT,
    "gatewayPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooldownEnd" TIMESTAMP(3),
    "boosterName" TEXT NOT NULL,
    "cooldownDuration" INTEGER DEFAULT 0,
    "creditsAdded" INTEGER,
    "creditsRemaining" INTEGER,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "gatewayMetadata" JSONB,
    "gatewayOrderId" TEXT,
    "planName" TEXT NOT NULL,
    "validity" INTEGER DEFAULT 10,
    "wordsAdded" INTEGER,
    "wordsRemaining" INTEGER,
    "wordsUnlocked" INTEGER,
    "distributionLogic" TEXT,
    "docsBonus" INTEGER,
    "maxPerPlanPeriod" INTEGER DEFAULT 2,
    "priceMultiplier" DOUBLE PRECISION,
    "purchaseNumber" INTEGER,
    "resetOn" TEXT DEFAULT 'plan_renewal',
    "boosterCategory" "BoosterCategory" NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'INR',
    "region" "Region" NOT NULL DEFAULT 'IN',

    CONSTRAINT "boosters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalCredits" INTEGER NOT NULL DEFAULT 0,
    "usedCredits" INTEGER NOT NULL DEFAULT 0,
    "remainingCredits" INTEGER NOT NULL DEFAULT 0,
    "planName" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "lastReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "planName" TEXT,
    "boosterType" TEXT,
    "creditsAdded" INTEGER,
    "paymentGateway" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewayOrderId" TEXT,
    "gatewaySignature" TEXT,
    "gatewayMetadata" JSONB,
    "description" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "refundReason" TEXT,
    "region" "Region" NOT NULL DEFAULT 'IN',

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "aiModel" TEXT NOT NULL DEFAULT 'claude-sonnet-4',
    "brainMode" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "personality" TEXT,
    "sessionAgeGroup" "AgeGroup" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "sessionGender" "Gender" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "sessionName" TEXT DEFAULT 'User',

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "aiModel" TEXT,
    "tokens" INTEGER,
    "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
    "attachmentIds" TEXT[],
    "rating" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDocumentRequest" BOOLEAN NOT NULL DEFAULT false,
    "wordsUsed" INTEGER,
    "branchId" TEXT,
    "parentMessageId" TEXT,
    "metadata" JSONB,
    "aiProvider" TEXT,
    "encryptedContent" TEXT,
    "encryptionAuthTag" TEXT,
    "encryptionIV" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "inputData" JSONB NOT NULL,
    "outputData" JSONB,
    "aiModel" TEXT,
    "aiProvider" TEXT,
    "creditsUsed" INTEGER,
    "tokensUsed" INTEGER,
    "processingTime" INTEGER,
    "inputFileIds" TEXT[],
    "outputFileIds" TEXT[],
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'cloudinary',
    "storageUrl" TEXT NOT NULL,
    "storageKey" TEXT,
    "thumbnailUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "category" TEXT NOT NULL,
    "purpose" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isProcessed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

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
    "ragDocumentId" TEXT,
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

-- CreateTable
CREATE TABLE "personalization_suggestions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "detectedGender" "Gender",
    "detectedAgeGroup" "AgeGroup",
    "genderConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ageConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "personalization_suggestions_pkey" PRIMARY KEY ("id")
);

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
    "ocrGoogleUsed" INTEGER NOT NULL DEFAULT 0,
    "ocrTesseractUsed" INTEGER NOT NULL DEFAULT 0,
    "lastResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

-- CreateTable
CREATE TABLE "forges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "messageId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" "ForgeType" NOT NULL,
    "language" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "copyCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "forges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_free_quotas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeUsesTotal" INTEGER NOT NULL DEFAULT 2,
    "resumeUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "letterUsesTotal" INTEGER NOT NULL DEFAULT 2,
    "letterUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "invoiceUsesTotal" INTEGER NOT NULL DEFAULT 3,
    "invoiceUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "receiptUsesTotal" INTEGER NOT NULL DEFAULT 2,
    "receiptUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "certificateUsesTotal" INTEGER NOT NULL DEFAULT 0,
    "certificateUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "agreementUsesTotal" INTEGER NOT NULL DEFAULT 0,
    "agreementUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "memoUsesTotal" INTEGER NOT NULL DEFAULT 0,
    "memoUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "proposalUsesTotal" INTEGER NOT NULL DEFAULT 0,
    "proposalUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "newsletterUsesTotal" INTEGER NOT NULL DEFAULT 0,
    "newsletterUsesUsed" INTEGER NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionPlan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_free_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_generations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tool" "WorkspaceTool" NOT NULL,
    "toolSubType" TEXT,
    "toolName" TEXT NOT NULL,
    "userInput" JSONB NOT NULL,
    "userPrompt" TEXT,
    "outputJson" JSONB,
    "outputHtml" TEXT,
    "pdfUrl" TEXT,
    "docxUrl" TEXT,
    "pngUrl" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "llmModel" TEXT,
    "llmProvider" TEXT,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "WorkspaceStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "processingTime" INTEGER,
    "isEdit" BOOLEAN NOT NULL DEFAULT false,
    "parentGenerationId" TEXT,
    "editNumber" INTEGER NOT NULL DEFAULT 0,
    "templateUsed" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "workspace_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smart_docs_credits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL DEFAULT 'STARTER',
    "monthlyTokens" INTEGER NOT NULL DEFAULT 100000,
    "tokensUsedThisMonth" INTEGER NOT NULL DEFAULT 0,
    "tokensUsedToday" INTEGER NOT NULL DEFAULT 0,
    "bonusTokens" INTEGER NOT NULL DEFAULT 0,
    "boosterTokens" INTEGER NOT NULL DEFAULT 0,
    "monthlyCredits" INTEGER NOT NULL DEFAULT 0,
    "creditsUsedThisMonth" INTEGER NOT NULL DEFAULT 0,
    "creditsUsedToday" INTEGER NOT NULL DEFAULT 0,
    "bonusCredits" INTEGER NOT NULL DEFAULT 0,
    "carriedForwardCredits" INTEGER NOT NULL DEFAULT 0,
    "cycleStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cycleEndDate" TIMESTAMP(3) NOT NULL,
    "lastDailyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMonthlyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "boostersPurchasedThisMonth" INTEGER NOT NULL DEFAULT 0,
    "totalBoostersPurchased" INTEGER NOT NULL DEFAULT 0,
    "totalTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "totalCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "lastOperationAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "smart_docs_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smart_docs_credit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "operationName" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL DEFAULT 1,
    "tokensDeducted" INTEGER NOT NULL DEFAULT 0,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "bonusTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "boosterTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "creditTier" INTEGER NOT NULL DEFAULT 0,
    "creditsDeducted" INTEGER NOT NULL DEFAULT 0,
    "bonusCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "carriedCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "documentId" TEXT,
    "aiProvider" TEXT,
    "aiModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "smart_docs_credit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smart_docs_booster_purchases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boosterId" TEXT NOT NULL,
    "boosterName" TEXT NOT NULL,
    "tokensAdded" INTEGER NOT NULL DEFAULT 750000,
    "creditsAdded" INTEGER NOT NULL DEFAULT 0,
    "priceINR" DOUBLE PRECISION NOT NULL,
    "priceUSD" DOUBLE PRECISION NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "paymentId" TEXT,
    "paymentStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "smart_docs_booster_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserModelUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "tokensLimit" INTEGER NOT NULL DEFAULT 0,
    "periodType" TEXT NOT NULL DEFAULT 'monthly',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserModelUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "klein9bImagesUsed" INTEGER NOT NULL DEFAULT 0,
    "klein9bImagesLimit" INTEGER NOT NULL DEFAULT 0,
    "boosterKlein9bImages" INTEGER NOT NULL DEFAULT 0,
    "schnellImagesUsed" INTEGER NOT NULL DEFAULT 0,
    "schnellImagesLimit" INTEGER NOT NULL DEFAULT 0,
    "boosterSchnellImages" INTEGER NOT NULL DEFAULT 0,
    "totalImagesGenerated" INTEGER NOT NULL DEFAULT 0,
    "cycleStartDate" TIMESTAMP(3) NOT NULL,
    "cycleEndDate" TIMESTAMP(3) NOT NULL,
    "lastImageGeneratedAt" TIMESTAMP(3),
    "lastMonthlyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_generations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "optimizedPrompt" TEXT,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "costINR" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "generationTime" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserUsage_userId_key" ON "UserUsage"("userId");

-- CreateIndex
CREATE INDEX "UserUsage_userId_idx" ON "UserUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_googleId_idx" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_planStatus_idx" ON "users"("planStatus");

-- CreateIndex
CREATE INDEX "users_securityStatus_idx" ON "users"("securityStatus");

-- CreateIndex
CREATE INDEX "users_lastSeenAt_idx" ON "users"("lastSeenAt");

-- CreateIndex
CREATE INDEX "users_activityTrend_idx" ON "users"("activityTrend");

-- CreateIndex
CREATE INDEX "users_sessionCount_idx" ON "users"("sessionCount");

-- CreateIndex
CREATE INDEX "users_planType_idx" ON "users"("planType");

-- CreateIndex
CREATE INDEX "users_cooldownResetDate_idx" ON "users"("cooldownResetDate");

-- CreateIndex
CREATE INDEX "users_region_idx" ON "users"("region");

-- CreateIndex
CREATE INDEX "users_currency_idx" ON "users"("currency");

-- CreateIndex
CREATE INDEX "users_country_idx" ON "users"("country");

-- CreateIndex
CREATE INDEX "users_defaultGender_idx" ON "users"("defaultGender");

-- CreateIndex
CREATE INDEX "users_defaultAgeGroup_idx" ON "users"("defaultAgeGroup");

-- CreateIndex
CREATE INDEX "users_deviceFingerprint_idx" ON "users"("deviceFingerprint");

-- CreateIndex
CREATE INDEX "users_ipAddressHash_idx" ON "users"("ipAddressHash");

-- CreateIndex
CREATE INDEX "users_emailVerified_idx" ON "users"("emailVerified");

-- CreateIndex
CREATE INDEX "users_mobileVerified_idx" ON "users"("mobileVerified");

-- CreateIndex
CREATE INDEX "users_accountFlagged_idx" ON "users"("accountFlagged");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_devices_fingerprint_key" ON "blocked_devices"("fingerprint");

-- CreateIndex
CREATE INDEX "blocked_devices_fingerprint_idx" ON "blocked_devices"("fingerprint");

-- CreateIndex
CREATE INDEX "signup_logs_userId_idx" ON "signup_logs"("userId");

-- CreateIndex
CREATE INDEX "signup_logs_deviceFingerprint_idx" ON "signup_logs"("deviceFingerprint");

-- CreateIndex
CREATE INDEX "signup_logs_ipAddressHash_idx" ON "signup_logs"("ipAddressHash");

-- CreateIndex
CREATE INDEX "Horoscope_sign_idx" ON "Horoscope"("sign");

-- CreateIndex
CREATE INDEX "Horoscope_validFor_idx" ON "Horoscope"("validFor");

-- CreateIndex
CREATE UNIQUE INDEX "Horoscope_sign_validFor_key" ON "Horoscope"("sign", "validFor");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "health_subscriptions_userId_key" ON "health_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "health_subscriptions_gatewaySubscriptionId_key" ON "health_subscriptions"("gatewaySubscriptionId");

-- CreateIndex
CREATE INDEX "health_subscriptions_userId_idx" ON "health_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "health_subscriptions_status_idx" ON "health_subscriptions"("status");

-- CreateIndex
CREATE INDEX "health_subscriptions_plan_idx" ON "health_subscriptions"("plan");

-- CreateIndex
CREATE INDEX "health_family_members_userId_idx" ON "health_family_members"("userId");

-- CreateIndex
CREATE INDEX "health_family_members_subscriptionId_idx" ON "health_family_members"("subscriptionId");

-- CreateIndex
CREATE INDEX "health_reports_userId_idx" ON "health_reports"("userId");

-- CreateIndex
CREATE INDEX "health_reports_familyMemberId_idx" ON "health_reports"("familyMemberId");

-- CreateIndex
CREATE INDEX "health_reports_reportType_idx" ON "health_reports"("reportType");

-- CreateIndex
CREATE INDEX "health_reports_reportDate_idx" ON "health_reports"("reportDate");

-- CreateIndex
CREATE INDEX "health_reports_createdAt_idx" ON "health_reports"("createdAt");

-- CreateIndex
CREATE INDEX "health_chats_userId_idx" ON "health_chats"("userId");

-- CreateIndex
CREATE INDEX "health_chats_sessionId_idx" ON "health_chats"("sessionId");

-- CreateIndex
CREATE INDEX "health_chats_familyMemberId_idx" ON "health_chats"("familyMemberId");

-- CreateIndex
CREATE INDEX "health_chats_createdAt_idx" ON "health_chats"("createdAt");

-- CreateIndex
CREATE INDEX "health_usage_userId_idx" ON "health_usage"("userId");

-- CreateIndex
CREATE INDEX "health_usage_month_year_idx" ON "health_usage"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "health_usage_userId_month_year_key" ON "health_usage"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "health_reminders_userId_idx" ON "health_reminders"("userId");

-- CreateIndex
CREATE INDEX "health_reminders_reportId_idx" ON "health_reminders"("reportId");

-- CreateIndex
CREATE INDEX "health_reminders_reminderDate_idx" ON "health_reminders"("reminderDate");

-- CreateIndex
CREATE INDEX "health_reminders_isCompleted_idx" ON "health_reminders"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_gatewaySubscriptionId_key" ON "subscriptions"("gatewaySubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_planName_idx" ON "subscriptions"("planName");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_endDate_idx" ON "subscriptions"("endDate");

-- CreateIndex
CREATE INDEX "subscriptions_currency_idx" ON "subscriptions"("currency");

-- CreateIndex
CREATE INDEX "subscriptions_region_idx" ON "subscriptions"("region");

-- CreateIndex
CREATE INDEX "subscriptions_lastResetAt_idx" ON "subscriptions"("lastResetAt");

-- CreateIndex
CREATE INDEX "subscriptions_billingCycle_idx" ON "subscriptions"("billingCycle");

-- CreateIndex
CREATE UNIQUE INDEX "Usage_userId_key" ON "Usage"("userId");

-- CreateIndex
CREATE INDEX "Usage_userId_idx" ON "Usage"("userId");

-- CreateIndex
CREATE INDEX "Usage_lastDailyReset_idx" ON "Usage"("lastDailyReset");

-- CreateIndex
CREATE INDEX "Usage_cycleEndDate_idx" ON "Usage"("cycleEndDate");

-- CreateIndex
CREATE UNIQUE INDEX "boosters_gatewayOrderId_key" ON "boosters"("gatewayOrderId");

-- CreateIndex
CREATE INDEX "boosters_userId_idx" ON "boosters"("userId");

-- CreateIndex
CREATE INDEX "boosters_boosterCategory_idx" ON "boosters"("boosterCategory");

-- CreateIndex
CREATE INDEX "boosters_status_idx" ON "boosters"("status");

-- CreateIndex
CREATE INDEX "boosters_expiresAt_idx" ON "boosters"("expiresAt");

-- CreateIndex
CREATE INDEX "boosters_planName_idx" ON "boosters"("planName");

-- CreateIndex
CREATE INDEX "boosters_purchaseNumber_idx" ON "boosters"("purchaseNumber");

-- CreateIndex
CREATE INDEX "boosters_currency_idx" ON "boosters"("currency");

-- CreateIndex
CREATE INDEX "boosters_region_idx" ON "boosters"("region");

-- CreateIndex
CREATE INDEX "credits_userId_idx" ON "credits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "credits_userId_month_year_key" ON "credits"("userId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_gatewayPaymentId_key" ON "transactions"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_gatewayPaymentId_idx" ON "transactions"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "transactions_currency_idx" ON "transactions"("currency");

-- CreateIndex
CREATE INDEX "chat_sessions_userId_idx" ON "chat_sessions"("userId");

-- CreateIndex
CREATE INDEX "chat_sessions_isActive_idx" ON "chat_sessions"("isActive");

-- CreateIndex
CREATE INDEX "chat_sessions_isPinned_idx" ON "chat_sessions"("isPinned");

-- CreateIndex
CREATE INDEX "chat_sessions_isArchived_idx" ON "chat_sessions"("isArchived");

-- CreateIndex
CREATE INDEX "chat_sessions_lastMessageAt_idx" ON "chat_sessions"("lastMessageAt");

-- CreateIndex
CREATE INDEX "chat_sessions_personality_idx" ON "chat_sessions"("personality");

-- CreateIndex
CREATE INDEX "chat_sessions_sessionGender_idx" ON "chat_sessions"("sessionGender");

-- CreateIndex
CREATE INDEX "chat_sessions_sessionAgeGroup_idx" ON "chat_sessions"("sessionAgeGroup");

-- CreateIndex
CREATE INDEX "messages_userId_idx" ON "messages"("userId");

-- CreateIndex
CREATE INDEX "messages_sessionId_idx" ON "messages"("sessionId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_branchId_idx" ON "messages"("branchId");

-- CreateIndex
CREATE INDEX "messages_parentMessageId_idx" ON "messages"("parentMessageId");

-- CreateIndex
CREATE INDEX "messages_aiProvider_idx" ON "messages"("aiProvider");

-- CreateIndex
CREATE INDEX "jobs_userId_idx" ON "jobs"("userId");

-- CreateIndex
CREATE INDEX "jobs_category_idx" ON "jobs"("category");

-- CreateIndex
CREATE INDEX "jobs_feature_idx" ON "jobs"("feature");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_createdAt_idx" ON "jobs"("createdAt");

-- CreateIndex
CREATE INDEX "file_uploads_userId_idx" ON "file_uploads"("userId");

-- CreateIndex
CREATE INDEX "file_uploads_category_idx" ON "file_uploads"("category");

-- CreateIndex
CREATE INDEX "file_uploads_purpose_idx" ON "file_uploads"("purpose");

-- CreateIndex
CREATE INDEX "file_uploads_createdAt_idx" ON "file_uploads"("createdAt");

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

-- CreateIndex
CREATE INDEX "conversation_messages_userId_timestamp_idx" ON "conversation_messages"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "conversation_messages_conversationId_idx" ON "conversation_messages"("conversationId");

-- CreateIndex
CREATE INDEX "conversation_messages_userId_isImportant_idx" ON "conversation_messages"("userId", "isImportant");

-- CreateIndex
CREATE UNIQUE INDEX "personalization_suggestions_sessionId_key" ON "personalization_suggestions"("sessionId");

-- CreateIndex
CREATE INDEX "personalization_suggestions_userId_idx" ON "personalization_suggestions"("userId");

-- CreateIndex
CREATE INDEX "personalization_suggestions_sessionId_idx" ON "personalization_suggestions"("sessionId");

-- CreateIndex
CREATE INDEX "personalization_suggestions_status_idx" ON "personalization_suggestions"("status");

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

-- CreateIndex
CREATE UNIQUE INDEX "forges_shareToken_key" ON "forges"("shareToken");

-- CreateIndex
CREATE INDEX "forges_userId_idx" ON "forges"("userId");

-- CreateIndex
CREATE INDEX "forges_sessionId_idx" ON "forges"("sessionId");

-- CreateIndex
CREATE INDEX "forges_contentType_idx" ON "forges"("contentType");

-- CreateIndex
CREATE INDEX "forges_shareToken_idx" ON "forges"("shareToken");

-- CreateIndex
CREATE INDEX "forges_createdAt_idx" ON "forges"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_free_quotas_userId_key" ON "workspace_free_quotas"("userId");

-- CreateIndex
CREATE INDEX "workspace_free_quotas_userId_idx" ON "workspace_free_quotas"("userId");

-- CreateIndex
CREATE INDEX "workspace_generations_userId_idx" ON "workspace_generations"("userId");

-- CreateIndex
CREATE INDEX "workspace_generations_tool_idx" ON "workspace_generations"("tool");

-- CreateIndex
CREATE INDEX "workspace_generations_status_idx" ON "workspace_generations"("status");

-- CreateIndex
CREATE INDEX "workspace_generations_parentGenerationId_idx" ON "workspace_generations"("parentGenerationId");

-- CreateIndex
CREATE UNIQUE INDEX "smart_docs_credits_userId_key" ON "smart_docs_credits"("userId");

-- CreateIndex
CREATE INDEX "smart_docs_credit_logs_userId_idx" ON "smart_docs_credit_logs"("userId");

-- CreateIndex
CREATE INDEX "smart_docs_credit_logs_userId_createdAt_idx" ON "smart_docs_credit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "smart_docs_credit_logs_operation_idx" ON "smart_docs_credit_logs"("operation");

-- CreateIndex
CREATE INDEX "smart_docs_booster_purchases_userId_idx" ON "smart_docs_booster_purchases"("userId");

-- CreateIndex
CREATE INDEX "smart_docs_booster_purchases_userId_createdAt_idx" ON "smart_docs_booster_purchases"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "smart_docs_booster_purchases_isExpired_idx" ON "smart_docs_booster_purchases"("isExpired");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_currency_key" ON "ExchangeRate"("currency");

-- CreateIndex
CREATE INDEX "UserModelUsage_userId_periodStart_idx" ON "UserModelUsage"("userId", "periodStart");

-- CreateIndex
CREATE INDEX "UserModelUsage_userId_modelId_idx" ON "UserModelUsage"("userId", "modelId");

-- CreateIndex
CREATE UNIQUE INDEX "UserModelUsage_userId_modelId_periodType_periodStart_key" ON "UserModelUsage"("userId", "modelId", "periodType", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "image_usage_userId_key" ON "image_usage"("userId");

-- CreateIndex
CREATE INDEX "image_usage_userId_idx" ON "image_usage"("userId");

-- CreateIndex
CREATE INDEX "image_usage_cycleEndDate_idx" ON "image_usage"("cycleEndDate");

-- CreateIndex
CREATE INDEX "image_generations_userId_idx" ON "image_generations"("userId");

-- CreateIndex
CREATE INDEX "image_generations_userId_createdAt_idx" ON "image_generations"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "image_generations_provider_idx" ON "image_generations"("provider");

-- CreateIndex
CREATE INDEX "image_generations_status_idx" ON "image_generations"("status");

-- AddForeignKey
ALTER TABLE "UserUsage" ADD CONSTRAINT "UserUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signup_logs" ADD CONSTRAINT "signup_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_subscriptions" ADD CONSTRAINT "health_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_family_members" ADD CONSTRAINT "health_family_members_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "health_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_family_members" ADD CONSTRAINT "health_family_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_reports" ADD CONSTRAINT "health_reports_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "health_family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_reports" ADD CONSTRAINT "health_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_chats" ADD CONSTRAINT "health_chats_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "health_family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_chats" ADD CONSTRAINT "health_chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_usage" ADD CONSTRAINT "health_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_reminders" ADD CONSTRAINT "health_reminders_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "health_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_reminders" ADD CONSTRAINT "health_reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boosters" ADD CONSTRAINT "boosters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_audits" ADD CONSTRAINT "usage_audits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_logs" ADD CONSTRAINT "security_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_embeddingId_fkey" FOREIGN KEY ("embeddingId") REFERENCES "document_embeddings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_embeddings" ADD CONSTRAINT "document_embeddings_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_embeddings" ADD CONSTRAINT "document_embeddings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_logs" ADD CONSTRAINT "query_logs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_logs" ADD CONSTRAINT "query_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_logs" ADD CONSTRAINT "export_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_queries" ADD CONSTRAINT "document_queries_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "user_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_queries" ADD CONSTRAINT "document_queries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalization_suggestions" ADD CONSTRAINT "personalization_suggestions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalization_suggestions" ADD CONSTRAINT "personalization_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_operations" ADD CONSTRAINT "document_operations_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_operations" ADD CONSTRAINT "document_operations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_usage" ADD CONSTRAINT "document_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forges" ADD CONSTRAINT "forges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_free_quotas" ADD CONSTRAINT "workspace_free_quotas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_generations" ADD CONSTRAINT "workspace_generations_parentGenerationId_fkey" FOREIGN KEY ("parentGenerationId") REFERENCES "workspace_generations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_generations" ADD CONSTRAINT "workspace_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_docs_credits" ADD CONSTRAINT "smart_docs_credits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_docs_credit_logs" ADD CONSTRAINT "smart_docs_credit_logs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_docs_credit_logs" ADD CONSTRAINT "smart_docs_credit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "smart_docs_booster_purchases" ADD CONSTRAINT "smart_docs_booster_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserModelUsage" ADD CONSTRAINT "UserModelUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_usage" ADD CONSTRAINT "image_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_generations" ADD CONSTRAINT "image_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
