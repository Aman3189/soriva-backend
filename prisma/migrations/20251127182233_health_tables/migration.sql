-- CreateEnum
CREATE TYPE "HealthPlan" AS ENUM ('FREE', 'BASIC', 'PRO', 'FAMILY');

-- CreateEnum
CREATE TYPE "HealthSubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('BLOOD_TEST', 'URINE_TEST', 'LIPID_PROFILE', 'LIVER_FUNCTION', 'KIDNEY_FUNCTION', 'THYROID', 'DIABETES', 'VITAMIN', 'HORMONE', 'CARDIAC', 'IMAGING', 'OTHER');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('NORMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OrganSystem" AS ENUM ('CARDIOVASCULAR', 'RESPIRATORY', 'DIGESTIVE', 'NERVOUS', 'ENDOCRINE', 'IMMUNE', 'MUSCULOSKELETAL', 'URINARY', 'REPRODUCTIVE', 'INTEGUMENTARY', 'LYMPHATIC', 'HEPATIC', 'RENAL', 'HEMATOLOGICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "HealthAlertType" AS ENUM ('CRITICAL_VALUE', 'TREND_WARNING', 'CHECKUP_REMINDER', 'MEDICATION_REMINDER', 'LIFESTYLE_TIP');

-- CreateEnum
CREATE TYPE "HealthAlertPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

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
    "bloodGroup" TEXT,
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chronicConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentMedications" TEXT[] DEFAULT ARRAY[]::TEXT[],
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
    "originalFileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filePublicId" TEXT,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "ocrText" TEXT,
    "ocrConfidence" DOUBLE PRECISION,
    "ocrProcessedAt" TIMESTAMP(3),
    "isAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "analysisJson" JSONB,
    "overallRiskLevel" "RiskLevel" NOT NULL DEFAULT 'NORMAL',
    "healthScore" INTEGER,
    "keyFindings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_biomarkers" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "refMin" DOUBLE PRECISION,
    "refMax" DOUBLE PRECISION,
    "refRange" TEXT,
    "status" "RiskLevel" NOT NULL DEFAULT 'NORMAL',
    "deviation" DOUBLE PRECISION,
    "interpretation" TEXT,
    "organSystem" "OrganSystem",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_biomarkers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_organ_breakdowns" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "organSystem" "OrganSystem" NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL,
    "findings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedBiomarkers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_organ_breakdowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_comparisons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "report1Id" TEXT NOT NULL,
    "report2Id" TEXT NOT NULL,
    "comparisonJson" JSONB NOT NULL,
    "improvementAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "worseningAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stableAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "overallTrend" TEXT NOT NULL,
    "insights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_chats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyMemberId" TEXT,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "referencedReportIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "model" TEXT,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_summaries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "pdfPublicId" TEXT,
    "summaryJson" JSONB NOT NULL,
    "doctorNotes" TEXT,
    "visitDate" TIMESTAMP(3),
    "doctorName" TEXT,
    "hospitalName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "type" "HealthAlertType" NOT NULL,
    "priority" "HealthAlertPriority" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "actionText" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "health_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "reportsUploaded" INTEGER NOT NULL DEFAULT 0,
    "chatsUsed" INTEGER NOT NULL DEFAULT 0,
    "comparisonsUsed" INTEGER NOT NULL DEFAULT 0,
    "summariesGenerated" INTEGER NOT NULL DEFAULT 0,
    "dailyChatsUsed" INTEGER NOT NULL DEFAULT 0,
    "lastChatDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_saved_providers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "notes" TEXT,
    "lastVisited" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_saved_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_emergency_contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_emergency_contacts_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "health_reports_overallRiskLevel_idx" ON "health_reports"("overallRiskLevel");

-- CreateIndex
CREATE INDEX "health_reports_createdAt_idx" ON "health_reports"("createdAt");

-- CreateIndex
CREATE INDEX "health_biomarkers_reportId_idx" ON "health_biomarkers"("reportId");

-- CreateIndex
CREATE INDEX "health_biomarkers_name_idx" ON "health_biomarkers"("name");

-- CreateIndex
CREATE INDEX "health_biomarkers_status_idx" ON "health_biomarkers"("status");

-- CreateIndex
CREATE INDEX "health_biomarkers_organSystem_idx" ON "health_biomarkers"("organSystem");

-- CreateIndex
CREATE INDEX "health_organ_breakdowns_reportId_idx" ON "health_organ_breakdowns"("reportId");

-- CreateIndex
CREATE INDEX "health_organ_breakdowns_organSystem_idx" ON "health_organ_breakdowns"("organSystem");

-- CreateIndex
CREATE INDEX "health_organ_breakdowns_riskLevel_idx" ON "health_organ_breakdowns"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "health_organ_breakdowns_reportId_organSystem_key" ON "health_organ_breakdowns"("reportId", "organSystem");

-- CreateIndex
CREATE INDEX "health_comparisons_userId_idx" ON "health_comparisons"("userId");

-- CreateIndex
CREATE INDEX "health_comparisons_report1Id_idx" ON "health_comparisons"("report1Id");

-- CreateIndex
CREATE INDEX "health_comparisons_report2Id_idx" ON "health_comparisons"("report2Id");

-- CreateIndex
CREATE INDEX "health_comparisons_createdAt_idx" ON "health_comparisons"("createdAt");

-- CreateIndex
CREATE INDEX "health_chats_userId_idx" ON "health_chats"("userId");

-- CreateIndex
CREATE INDEX "health_chats_sessionId_idx" ON "health_chats"("sessionId");

-- CreateIndex
CREATE INDEX "health_chats_familyMemberId_idx" ON "health_chats"("familyMemberId");

-- CreateIndex
CREATE INDEX "health_chats_createdAt_idx" ON "health_chats"("createdAt");

-- CreateIndex
CREATE INDEX "health_summaries_userId_idx" ON "health_summaries"("userId");

-- CreateIndex
CREATE INDEX "health_summaries_reportId_idx" ON "health_summaries"("reportId");

-- CreateIndex
CREATE INDEX "health_summaries_createdAt_idx" ON "health_summaries"("createdAt");

-- CreateIndex
CREATE INDEX "health_alerts_userId_idx" ON "health_alerts"("userId");

-- CreateIndex
CREATE INDEX "health_alerts_reportId_idx" ON "health_alerts"("reportId");

-- CreateIndex
CREATE INDEX "health_alerts_type_idx" ON "health_alerts"("type");

-- CreateIndex
CREATE INDEX "health_alerts_priority_idx" ON "health_alerts"("priority");

-- CreateIndex
CREATE INDEX "health_alerts_isRead_idx" ON "health_alerts"("isRead");

-- CreateIndex
CREATE INDEX "health_alerts_createdAt_idx" ON "health_alerts"("createdAt");

-- CreateIndex
CREATE INDEX "health_usage_userId_idx" ON "health_usage"("userId");

-- CreateIndex
CREATE INDEX "health_usage_month_year_idx" ON "health_usage"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "health_usage_userId_month_year_key" ON "health_usage"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "health_saved_providers_userId_idx" ON "health_saved_providers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "health_saved_providers_userId_providerId_providerType_key" ON "health_saved_providers"("userId", "providerId", "providerType");

-- CreateIndex
CREATE INDEX "health_emergency_contacts_userId_idx" ON "health_emergency_contacts"("userId");

-- AddForeignKey
ALTER TABLE "health_subscriptions" ADD CONSTRAINT "health_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_family_members" ADD CONSTRAINT "health_family_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_family_members" ADD CONSTRAINT "health_family_members_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "health_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_reports" ADD CONSTRAINT "health_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_reports" ADD CONSTRAINT "health_reports_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "health_family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_biomarkers" ADD CONSTRAINT "health_biomarkers_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "health_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_organ_breakdowns" ADD CONSTRAINT "health_organ_breakdowns_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "health_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_comparisons" ADD CONSTRAINT "health_comparisons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_comparisons" ADD CONSTRAINT "health_comparisons_report1Id_fkey" FOREIGN KEY ("report1Id") REFERENCES "health_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_comparisons" ADD CONSTRAINT "health_comparisons_report2Id_fkey" FOREIGN KEY ("report2Id") REFERENCES "health_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_chats" ADD CONSTRAINT "health_chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_chats" ADD CONSTRAINT "health_chats_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "health_family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_summaries" ADD CONSTRAINT "health_summaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_summaries" ADD CONSTRAINT "health_summaries_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "health_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_alerts" ADD CONSTRAINT "health_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_alerts" ADD CONSTRAINT "health_alerts_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "health_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_usage" ADD CONSTRAINT "health_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_saved_providers" ADD CONSTRAINT "health_saved_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_emergency_contacts" ADD CONSTRAINT "health_emergency_contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
