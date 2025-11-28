// ============================================
// SORIVA HEALTH - SERVICE
// Path: src/modules/health/health.service.ts
// Updated: Integrated OCR + AI Health Services
// ============================================

import { PrismaClient, HealthPlan, ReportType, RiskLevel } from '@prisma/client';

import {
  HEALTH_PLAN_LIMITS,
  canUploadReport,
  canSendChat,
  canCompareReports,
  canGenerateSummary,
  HealthUsageState,
} from '../../config/health-plans.config';
import {
  UploadReportRequest,
  HealthChatRequest,
  CompareReportsRequest,
  GenerateSummaryRequest,
  AddFamilyMemberRequest,
  ReportAnalysisResponse,
  HealthChatResponse,
  ComparisonResponse,
  DashboardStatsResponse,
  UsageResponse,
  HealthError,
  HEALTH_ERROR_CODES,
} from './health.types';
import { ERROR_MESSAGES, FILE_LIMITS, validateFileMagicBytes, HEALTH_DISCLAIMER } from './health.constants';

// Import services
import { ocrService } from './services/ocr.service';
import { aiHealthService } from './services/ai-health.service';

// Import PlanType for AI routing
import { PlanType } from '../../constants';
import { cloudinaryService } from './services/cloudinary.service';

const prisma = new PrismaClient();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN MAPPING (Health Plan → Soriva Plan for AI)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HEALTH_TO_SORIVA_PLAN: Record<HealthPlan, PlanType> = {
  FREE: PlanType.STARTER,
  BASIC: PlanType.PLUS,
  PRO: PlanType.PRO,
  FAMILY: PlanType.PRO,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class HealthService {
  // ════════════════════════════════════════════════════
  // SUBSCRIPTION & USAGE
  // ════════════════════════════════════════════════════

  async getOrCreateSubscription(userId: string) {
    let subscription = await prisma.healthSubscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await prisma.healthSubscription.create({
        data: {
          userId,
          plan: 'FREE',
          status: 'ACTIVE',
        },
      });
    }

    return subscription;
  }

  async getCurrentUsage(userId: string): Promise<HealthUsageState> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let usage = await prisma.healthUsage.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
    });

    if (!usage) {
      usage = await prisma.healthUsage.create({
        data: { userId, month, year },
      });
    }

    const today = now.toDateString();
    const lastChatDay = usage.lastChatDate?.toDateString();

    if (lastChatDay !== today) {
      usage = await prisma.healthUsage.update({
        where: { id: usage.id },
        data: { dailyChatsUsed: 0 },
      });
    }

    return {
      reportsUploaded: usage.reportsUploaded,
      dailyChatsUsed: usage.dailyChatsUsed,
      comparisonsUsed: usage.comparisonsUsed,
      summariesGenerated: usage.summariesGenerated,
    };
  }

  async getUsageResponse(userId: string): Promise<UsageResponse> {
    const subscription = await this.getOrCreateSubscription(userId);
    const usage = await this.getCurrentUsage(userId);
    const limits = HEALTH_PLAN_LIMITS[subscription.plan];

    const familyCount = await prisma.healthFamilyMember.count({
      where: { userId, isActive: true },
    });

    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      plan: subscription.plan,
      usage: {
        reports: {
          used: usage.reportsUploaded,
          limit: limits.reportsPerMonth,
          remaining: Math.max(0, limits.reportsPerMonth - usage.reportsUploaded),
        },
        chats: {
          used: usage.dailyChatsUsed,
          limit: limits.chatsPerDay,
          remaining: Math.max(0, limits.chatsPerDay - usage.dailyChatsUsed),
        },
        comparisons: {
          used: usage.comparisonsUsed,
          limit: limits.comparisonsPerMonth,
          remaining: Math.max(0, limits.comparisonsPerMonth - usage.comparisonsUsed),
        },
        summaries: {
          used: usage.summariesGenerated,
          limit: limits.summariesPerMonth,
          remaining: Math.max(0, limits.summariesPerMonth - usage.summariesGenerated),
        },
      },
      familyMembers: {
        count: familyCount,
        limit: limits.maxFamilyMembers,
      },
      resetDate,
    };
  }

  // ════════════════════════════════════════════════════
  // REPORT MANAGEMENT (OCR + AI INTEGRATED)
  // ════════════════════════════════════════════════════

  async uploadReport(
    userId: string,
    file: Express.Multer.File,
    data: UploadReportRequest
  ): Promise<ReportAnalysisResponse> {
    const subscription = await this.getOrCreateSubscription(userId);
    const usage = await this.getCurrentUsage(userId);

    const canUpload = canUploadReport(subscription.plan, usage);
    if (!canUpload.allowed) {
      throw new HealthError(canUpload.reason!, HEALTH_ERROR_CODES.LIMIT_EXCEEDED, 403);
    }

    if (!FILE_LIMITS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new HealthError(ERROR_MESSAGES.INVALID_FILE, HEALTH_ERROR_CODES.INVALID_FILE);
    }

    if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
      throw new HealthError(ERROR_MESSAGES.FILE_TOO_LARGE, HEALTH_ERROR_CODES.INVALID_FILE);
    }
    // Magic bytes validation (basic malware check)
    if (!validateFileMagicBytes(file.buffer, file.mimetype)) {
  throw new HealthError(ERROR_MESSAGES.INVALID_FILE_CONTENT, HEALTH_ERROR_CODES.INVALID_FILE);
}

    // TODO: Cloudinary upload
    // ═══════════════════════════════════════════════════
// CLOUDINARY UPLOAD
// ═══════════════════════════════════════════════════
let fileUrl = '';
let filePublicId = '';

try {
  console.log('[Health] Uploading to Cloudinary...');
  const uploadResult = await cloudinaryService.uploadReport(
    file.buffer,
    userId,
    file.originalname
  );
  fileUrl = uploadResult.secureUrl;
  filePublicId = uploadResult.publicId;
  console.log(`[Health] Upload complete: ${filePublicId}`);
} catch (uploadError) {
  console.error('[Health] Cloudinary upload failed:', uploadError);
  // Continue without cloud storage - file will be processed but not stored
}

    // ═══════════════════════════════════════════════════
    // OCR PROCESSING (DYNAMIC)
    // ═══════════════════════════════════════════════════
    let ocrText = '';
    let ocrConfidence = 0;

    try {
      console.log('[Health] Starting OCR processing...');
      const ocrResult = await ocrService.extractTextFromBuffer(file.buffer, file.mimetype);
      ocrText = ocrService.normalizeText(ocrResult.text);
      ocrConfidence = ocrResult.confidence;
      console.log(`[Health] OCR complete. Confidence: ${ocrConfidence}%`);
    } catch (ocrError) {
      console.error('[Health] OCR failed:', ocrError);
    }

    // Auto-detect report type
    let reportType = data.reportType as ReportType;
    if (!reportType || reportType === 'OTHER') {
      reportType = aiHealthService.detectReportType(ocrText);
      console.log(`[Health] Auto-detected report type: ${reportType}`);
    }

    const report = await prisma.healthReport.create({
      data: {
        userId,
        familyMemberId: data.familyMemberId,
        title: data.title,
        reportType,
        reportDate: data.reportDate ? new Date(data.reportDate) : new Date(),
        labName: data.labName,
        doctorName: data.doctorName,
        originalFileName: file.originalname,
        fileUrl,
        filePublicId,
        fileSize: file.size,
        mimeType: file.mimetype,
        ocrText,
        ocrConfidence,
        ocrProcessedAt: new Date(),
      },
    });

    // ═══════════════════════════════════════════════════
    // AI ANALYSIS (DYNAMIC - Uses ProviderFactory)
    // ═══════════════════════════════════════════════════
    const analysisResult = await this.analyzeReport(report.id, ocrText, subscription.plan);

    await this.incrementUsage(userId, 'reports');

    return analysisResult;
  }

  async analyzeReport(
    reportId: string,
    ocrText: string,
    healthPlan: HealthPlan = 'FREE'
  ): Promise<ReportAnalysisResponse> {
    const sorivaPlan = HEALTH_TO_SORIVA_PLAN[healthPlan];

    const report = await prisma.healthReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new HealthError(ERROR_MESSAGES.REPORT_NOT_FOUND, HEALTH_ERROR_CODES.REPORT_NOT_FOUND, 404);
    }

    if (!ocrText || ocrText.trim().length < 50) {
      console.warn('[Health] Insufficient OCR text for AI analysis');

      await prisma.healthReport.update({
        where: { id: reportId },
        data: {
          isAnalyzed: false,
          healthScore: null,
          overallRiskLevel: 'NORMAL',
          keyFindings: ['Unable to extract text from report. Please ensure the image is clear.'],
          recommendations: ['Try uploading a clearer image of your report.'],
        },
      });

      return {
        reportId,
        healthScore: 0,
        overallRiskLevel: 'NORMAL',
        keyFindings: ['Unable to extract text from report'],
        recommendations: ['Please upload a clearer image'],
        biomarkers: [],
        organBreakdowns: [],
        disclaimer: HEALTH_DISCLAIMER.ANALYSIS,
      };
    }

    try {
      console.log(`[Health] Starting AI analysis with plan: ${sorivaPlan}`);

      const aiAnalysis = await aiHealthService.analyzeReport(
        { ocrText, reportType: report.reportType },
        sorivaPlan
      );

      console.log(`[Health] AI analysis complete. Health Score: ${aiAnalysis.healthScore}`);

      const updatedReport = await prisma.healthReport.update({
        where: { id: reportId },
        data: {
          isAnalyzed: true,
          healthScore: aiAnalysis.healthScore,
          overallRiskLevel: aiAnalysis.riskLevel,
          keyFindings: aiAnalysis.keyFindings,
          recommendations: aiAnalysis.recommendations,
          analysisJson: aiAnalysis as any,
        },
      });

      if (aiAnalysis.biomarkers?.length > 0) {
        await prisma.healthBiomarker.createMany({
          data: aiAnalysis.biomarkers.map((b) => ({
            reportId,
            name: b.name,
            value: b.value,
            unit: b.unit,
            status: b.status,
            referenceRange: b.refRange,
            interpretation: b.interpretation,
            organSystem: (b.organSystem as any) || 'OTHER',
          })),
        });
      }

      if (aiAnalysis.organBreakdowns?.length > 0) {
        for (const organ of aiAnalysis.organBreakdowns) {
          await prisma.healthOrganBreakdown.upsert({
            where: { reportId_organSystem: { reportId, organSystem: organ.organSystem } },
            update: {
              healthScore: organ.healthScore,
              riskLevel: organ.riskLevel,
              status: organ.status,
              findings: organ.findings,
              recommendations: organ.recommendations,
            },
            create: {
              reportId,
              organSystem: organ.organSystem,
              healthScore: organ.healthScore,
              riskLevel: organ.riskLevel,
              status: organ.status,
              findings: organ.findings,
              recommendations: organ.recommendations,
            },
          });
        }
      }

      return {
        reportId: updatedReport.id,
        healthScore: aiAnalysis.healthScore,
        overallRiskLevel: aiAnalysis.riskLevel,
        keyFindings: aiAnalysis.keyFindings,
        recommendations: aiAnalysis.recommendations,
        biomarkers: aiAnalysis.biomarkers,
        organBreakdowns: aiAnalysis.organBreakdowns,
        disclaimer: HEALTH_DISCLAIMER.ANALYSIS,

      };
    } catch (error) {
      console.error('[Health] AI analysis failed:', error);

      await prisma.healthReport.update({
        where: { id: reportId },
        data: {
          isAnalyzed: false,
          keyFindings: ['Analysis temporarily unavailable. Please try again later.'],
          recommendations: [],
        },
      });

      throw new HealthError(ERROR_MESSAGES.ANALYSIS_FAILED, HEALTH_ERROR_CODES.ANALYSIS_FAILED, 500);
    }
  }

  async getReports(userId: string, familyMemberId?: string) {
    return prisma.healthReport.findMany({
      where: { userId, ...(familyMemberId && { familyMemberId }) },
      orderBy: { createdAt: 'desc' },
      include: { familyMember: true },
    });
  }

  async getReportById(userId: string, reportId: string) {
    const report = await prisma.healthReport.findFirst({
      where: { id: reportId, userId },
      include: { biomarkers: true, organBreakdowns: true, familyMember: true },
    });

    if (!report) {
      throw new HealthError(ERROR_MESSAGES.REPORT_NOT_FOUND, HEALTH_ERROR_CODES.REPORT_NOT_FOUND, 404);
    }

    return report;
  }

  async deleteReport(userId: string, reportId: string) {
    const report = await prisma.healthReport.findFirst({
      where: { id: reportId, userId },
    });

    if (!report) {
      throw new HealthError(ERROR_MESSAGES.REPORT_NOT_FOUND, HEALTH_ERROR_CODES.REPORT_NOT_FOUND, 404);
    }

    await prisma.healthReport.delete({ where: { id: reportId } });

    return { success: true };
  }

  // ════════════════════════════════════════════════════
  // HEALTH CHAT (DYNAMIC - Uses ProviderFactory)
  // ════════════════════════════════════════════════════

  async sendChatMessage(userId: string, data: HealthChatRequest): Promise<HealthChatResponse> {
    const subscription = await this.getOrCreateSubscription(userId);
    const usage = await this.getCurrentUsage(userId);

    const canChat = canSendChat(subscription.plan, usage);
    if (!canChat.allowed) {
      throw new HealthError(canChat.reason!, HEALTH_ERROR_CODES.LIMIT_EXCEEDED, 403);
    }

    const sorivaPlan = HEALTH_TO_SORIVA_PLAN[subscription.plan];
    const sessionId = data.sessionId || crypto.randomUUID();

    // Emergency check
    if (aiHealthService.isEmergencyMessage(data.message)) {
      const emergencyResponse = aiHealthService.getEmergencyResponse();

      await prisma.healthChat.create({
        data: {
          userId,
          sessionId,
          familyMemberId: data.familyMemberId,
          role: 'user',
          content: data.message,
          referencedReportIds: data.referencedReportIds || [],
        },
      });

      const assistantMessage = await prisma.healthChat.create({
        data: {
          userId,
          sessionId,
          familyMemberId: data.familyMemberId,
          role: 'assistant',
          content: emergencyResponse,
          model: 'emergency',
          tokensUsed: 0,
        },
      });

      return { messageId: assistantMessage.id, sessionId, content: emergencyResponse };
    }

    await prisma.healthChat.create({
      data: {
        userId,
        sessionId,
        familyMemberId: data.familyMemberId,
        role: 'user',
        content: data.message,
        referencedReportIds: data.referencedReportIds || [],
      },
    });

    const history = await prisma.healthChat.findMany({
      where: { userId, sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const conversationHistory = history.map((h) => ({ role: h.role, content: h.content }));

    let reportContext: string | undefined;
    if (data.referencedReportIds?.length) {
      const reports = await prisma.healthReport.findMany({
        where: { id: { in: data.referencedReportIds }, userId },
        select: { title: true, reportType: true, healthScore: true, keyFindings: true },
      });

      if (reports.length) {
        reportContext = reports
          .map((r) => `Report: ${r.title} (${r.reportType})\nHealth Score: ${r.healthScore}\nFindings: ${r.keyFindings.join(', ')}`)
          .join('\n\n');
      }
    }

    try {
      console.log(`[Health] Chat request with plan: ${sorivaPlan}`);

      const aiResponse = await aiHealthService.chat(data.message, conversationHistory, sorivaPlan, reportContext);

      console.log(`[Health] Chat response received. Tokens: ${aiResponse.tokensUsed}`);

      const assistantMessage = await prisma.healthChat.create({
        data: {
          userId,
          sessionId,
          familyMemberId: data.familyMemberId,
          role: 'assistant',
          content: aiResponse.response,
          model: sorivaPlan,
          tokensUsed: aiResponse.tokensUsed,
        },
      });

      await this.incrementUsage(userId, 'chats');

      return { messageId: assistantMessage.id, sessionId, content: aiResponse.response, disclaimer: HEALTH_DISCLAIMER.CHAT };
    } catch (error) {
      console.error('[Health] Chat failed:', error);

      const fallbackResponse = "I'm sorry, I'm having trouble responding right now. Please try again.";

      const assistantMessage = await prisma.healthChat.create({
        data: {
          userId,
          sessionId,
          familyMemberId: data.familyMemberId,
          role: 'assistant',
          content: fallbackResponse,
          model: 'fallback',
          tokensUsed: 0,
        },
      });

      return { messageId: assistantMessage.id, sessionId, content: fallbackResponse, disclaimer: HEALTH_DISCLAIMER.CHAT };
    }
  }

  async getChatHistory(userId: string, sessionId?: string) {
    return prisma.healthChat.findMany({
      where: { userId, ...(sessionId && { sessionId }) },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ════════════════════════════════════════════════════
  // REPORT COMPARISON
  // ════════════════════════════════════════════════════

  async compareReports(userId: string, data: CompareReportsRequest): Promise<ComparisonResponse> {
    const subscription = await this.getOrCreateSubscription(userId);
    const usage = await this.getCurrentUsage(userId);

    const canCompare = canCompareReports(subscription.plan, usage);
    if (!canCompare.allowed) {
      throw new HealthError(canCompare.reason!, HEALTH_ERROR_CODES.LIMIT_EXCEEDED, 403);
    }

    const [report1, report2] = await Promise.all([
      this.getReportById(userId, data.report1Id),
      this.getReportById(userId, data.report2Id),
    ]);

    let overallTrend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
    const score1 = report1.healthScore || 0;
    const score2 = report2.healthScore || 0;

    if (score2 > score1 + 5) overallTrend = 'IMPROVING';
    else if (score2 < score1 - 5) overallTrend = 'DECLINING';

    const comparison = await prisma.healthComparison.create({
      data: {
        userId,
        report1Id: report1.id,
        report2Id: report2.id,
        comparisonJson: { report1Score: score1, report2Score: score2 },
        overallTrend,
        improvementAreas: [],
        worseningAreas: [],
        stableAreas: [],
        insights: [`Health score changed from ${score1} to ${score2}`],
        recommendations: [],
      },
    });

    await this.incrementUsage(userId, 'comparisons');

    return {
      comparisonId: comparison.id,
      report1: { id: report1.id, title: report1.title, reportDate: report1.reportDate, healthScore: score1, riskLevel: report1.overallRiskLevel },
      report2: { id: report2.id, title: report2.title, reportDate: report2.reportDate, healthScore: score2, riskLevel: report2.overallRiskLevel },
      overallTrend,
      improvementAreas: [],
      worseningAreas: [],
      stableAreas: [],
      insights: [`Health score changed from ${score1} to ${score2}`],
      recommendations: [],
    };
  }

  // ════════════════════════════════════════════════════
  // DOCTOR SUMMARY
  // ════════════════════════════════════════════════════

  async generateSummary(userId: string, data: GenerateSummaryRequest) {
    const subscription = await this.getOrCreateSubscription(userId);
    const usage = await this.getCurrentUsage(userId);

    const canGenerate = canGenerateSummary(subscription.plan, usage);
    if (!canGenerate.allowed) {
      throw new HealthError(canGenerate.reason!, HEALTH_ERROR_CODES.LIMIT_EXCEEDED, 403);
    }

    const report = await this.getReportById(userId, data.reportId);

    // TODO: PDF generation
    const pdfUrl = '';

    const summary = await prisma.healthSummary.create({
      data: {
        userId,
        reportId: report.id,
        title: `Summary - ${report.title}`,
        pdfUrl,
        summaryJson: { healthScore: report.healthScore, findings: report.keyFindings, recommendations: report.recommendations },
        doctorName: data.doctorName,
        hospitalName: data.hospitalName,
        visitDate: data.visitDate ? new Date(data.visitDate) : null,
      },
    });

    await this.incrementUsage(userId, 'summaries');

    return summary;
  }

  // ════════════════════════════════════════════════════
  // DASHBOARD & STATS
  // ════════════════════════════════════════════════════

  async getDashboardStats(userId: string): Promise<DashboardStatsResponse> {
    const [totalReports, latestReport, alerts] = await Promise.all([
      prisma.healthReport.count({ where: { userId } }),
      prisma.healthReport.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.healthAlert.findMany({ where: { userId, isRead: false, isDismissed: false }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    const recentReports = await prisma.healthReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, reportDate: true, healthScore: true, overallRiskLevel: true },
    });

    let overallTrend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';
    if (recentReports.length >= 2) {
      const scores = recentReports.filter((r) => r.healthScore !== null).map((r) => r.healthScore!);
      if (scores.length >= 2) {
        const latest = scores[0];
        const previous = scores[1];
        if (latest > previous + 5) overallTrend = 'IMPROVING';
        else if (latest < previous - 5) overallTrend = 'DECLINING';
        else overallTrend = 'STABLE';
      }
    }

    return {
      totalReports,
      latestHealthScore: latestReport?.healthScore || null,
      overallTrend,
      riskAreas: [],
      upcomingReminders: alerts.map((a) => ({ id: a.id, type: a.type, priority: a.priority, title: a.title, message: a.message, createdAt: a.createdAt })),
      recentReports: recentReports.map((r) => ({ id: r.id, title: r.title, reportDate: r.reportDate, healthScore: r.healthScore || 0, riskLevel: r.overallRiskLevel })),
    };
  }

  // ════════════════════════════════════════════════════
  // FAMILY MEMBERS
  // ════════════════════════════════════════════════════

  async addFamilyMember(userId: string, data: AddFamilyMemberRequest) {
    const subscription = await this.getOrCreateSubscription(userId);
    const limits = HEALTH_PLAN_LIMITS[subscription.plan];

    const currentCount = await prisma.healthFamilyMember.count({ where: { userId, isActive: true } });

    if (currentCount >= limits.maxFamilyMembers) {
      throw new HealthError(ERROR_MESSAGES.FAMILY_LIMIT_REACHED, HEALTH_ERROR_CODES.FAMILY_MEMBER_LIMIT, 403);
    }

    return prisma.healthFamilyMember.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        name: data.name,
        relation: data.relation,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        allergies: data.allergies || [],
        chronicConditions: data.chronicConditions || [],
        currentMedications: data.currentMedications || [],
      },
    });
  }

  async getFamilyMembers(userId: string) {
    return prisma.healthFamilyMember.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: 'asc' } });
  }

  // ════════════════════════════════════════════════════
  // ALERTS
  // ════════════════════════════════════════════════════

  async getAlerts(userId: string, unreadOnly = false) {
    return prisma.healthAlert.findMany({
      where: { userId, ...(unreadOnly && { isRead: false, isDismissed: false }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAlertRead(userId: string, alertId: string) {
    return prisma.healthAlert.updateMany({ where: { id: alertId, userId }, data: { isRead: true, readAt: new Date() } });
  }

  // ════════════════════════════════════════════════════
  // HELPER METHODS
  // ════════════════════════════════════════════════════

  private async incrementUsage(userId: string, type: 'reports' | 'chats' | 'comparisons' | 'summaries') {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const updateData: any = {};

    switch (type) {
      case 'reports':
        updateData.reportsUploaded = { increment: 1 };
        break;
      case 'chats':
        updateData.dailyChatsUsed = { increment: 1 };
        updateData.chatsUsed = { increment: 1 };
        updateData.lastChatDate = now;
        break;
      case 'comparisons':
        updateData.comparisonsUsed = { increment: 1 };
        break;
      case 'summaries':
        updateData.summariesGenerated = { increment: 1 };
        break;
    }

    await prisma.healthUsage.upsert({
      where: { userId_month_year: { userId, month, year } },
      update: updateData,
      create: {
        userId,
        month,
        year,
        ...Object.fromEntries(Object.entries(updateData).map(([k, v]) => [k, typeof v === 'object' ? 1 : v])),
      },
    });
  }
}

export const healthService = new HealthService();