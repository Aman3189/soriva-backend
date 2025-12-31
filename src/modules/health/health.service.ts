// ============================================
// SORIVA HEALTH - SERVICE LAYER
// Path: src/modules/health/health.service.ts
// ============================================
// REFOCUSED: Safe operations only
// NO: Diagnosis, Scores, Risk, Predictions
// YES: Storage, Organization, Education, Q&A
// ============================================

import { PrismaClient } from '@prisma/client';
import { 
  HealthPlan, 
  HealthRegion,
  HealthReport,
  HealthUsage,
  UploadReportRequest,
  UploadReportResponse,
  ListReportsRequest,
  ListReportsResponse,
  HealthChatRequest,
  HealthChatResponse,
  TermExplanationRequest,
  TermExplanationResponse,
  DoctorQuestionsRequest,
  DoctorQuestionsResponse,
  ReportComparisonRequest,
  ReportComparisonResponse,
  TimelineRequest,
  TimelineResponse,
  ReportType,
} from './health.types';
import { 
  DISCLAIMERS, 
  ERROR_MESSAGES,
  FORBIDDEN_PHRASES,
} from './health.constants';
import {
  getPlanLimits,
  canUploadPages,
  canSendChat,
  canCompareReports,
} from '../../config/health-plans.config';

// Import our services
import { healthAIService } from './services/health.ai.service';
import { healthUploadService, FileInput } from './services/health.upload.service';

const prisma = new PrismaClient();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class HealthService {
  
  // ═══════════════════════════════════════════════════════
  // USAGE TRACKING
  // ═══════════════════════════════════════════════════════

  /**
   * Get or create usage record for user (month/year based)
   */
  async getUsage(userId: string): Promise<HealthUsage> {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // Try to find existing usage for this month/year
    let usage = await prisma.healthUsage.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    // Create new usage record if not exists
    if (!usage) {
      usage = await prisma.healthUsage.create({
        data: {
          userId,
          month,
          year,
          pagesUploaded: 0,
          tokensUsed: 0,
          comparisonsUsed: 0,
        },
      });
    }

    return {
      userId: usage.userId,
      pagesUploaded: usage.pagesUploaded,
      tokensUsed: usage.tokensUsed,
      comparisonsUsed: usage.comparisonsUsed,
      periodStart: new Date(year, month - 1, 1),
      periodEnd: new Date(year, month, 0),
      lastUpdated: usage.updatedAt,
    };
  }

  /**
   * Update usage after operation
   */
  async updateUsage(
    userId: string, 
    update: { pages?: number; tokens?: number; comparisons?: number }
  ): Promise<void> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    await prisma.healthUsage.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      update: {
        pagesUploaded: { increment: update.pages || 0 },
        tokensUsed: { increment: update.tokens || 0 },
        comparisonsUsed: { increment: update.comparisons || 0 },
      },
      create: {
        userId,
        month,
        year,
        pagesUploaded: update.pages || 0,
        tokensUsed: update.tokens || 0,
        comparisonsUsed: update.comparisons || 0,
      },
    });
  }

  // ═══════════════════════════════════════════════════════
  // REPORT UPLOAD (With Cloudinary + OCR)
  // ═══════════════════════════════════════════════════════

  /**
   * Upload a health report with file processing
   */
  async uploadReportWithFile(
    userId: string,
    plan: HealthPlan,
    region: HealthRegion,
    file: FileInput,
    reportData: UploadReportRequest
  ): Promise<UploadReportResponse> {
    // First, upload file and extract text
    const uploadResult = await healthUploadService.uploadHealthReport(file, userId);

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || ERROR_MESSAGES.UPLOAD_FAILED,
        usage: {
          pagesUsed: 0,
          pagesRemaining: 0,
          percentUsed: 0,
        },
      };
    }

    // Now create the report with uploaded data
    return this.uploadReport(
      userId,
      plan,
      region,
      {
        fileName: uploadResult.fileName!,
        fileUrl: uploadResult.fileUrl!,
        fileSize: uploadResult.fileSize!,
        pageCount: uploadResult.pageCount || 1,
        mimeType: uploadResult.mimeType!,
        extractedText: uploadResult.extractedText,
        publicId: uploadResult.publicId,
      },
      reportData
    );
  }

  /**
   * Upload a health report (after file is processed)
   */
  async uploadReport(
    userId: string,
    plan: HealthPlan,
    region: HealthRegion,
    fileData: {
      fileName: string;
      fileUrl: string;
      fileSize: number;
      pageCount: number;
      mimeType: string;
      extractedText?: string;
      publicId?: string;
    },
    reportData: UploadReportRequest
  ): Promise<UploadReportResponse> {
    // Check usage limits
    const usage = await this.getUsage(userId);
    const usageState = {
      pagesUploaded: usage.pagesUploaded,
      tokensUsed: usage.tokensUsed,
      comparisonsUsed: usage.comparisonsUsed,
      lastResetDate: usage.periodStart,
    };

    const canUpload = canUploadPages(plan, usageState, fileData.pageCount, region);
    
    if (!canUpload.allowed) {
      // Delete uploaded file if limit exceeded
      if (fileData.publicId) {
        const resourceType = fileData.mimeType === 'application/pdf' ? 'raw' : 'image';
        await healthUploadService.deleteFile(fileData.publicId, resourceType);
      }

      return {
        success: false,
        error: canUpload.reason || ERROR_MESSAGES.LIMIT_EXCEEDED.pages,
        usage: {
          pagesUsed: usage.pagesUploaded,
          pagesRemaining: canUpload.remaining,
          percentUsed: canUpload.percentUsed,
        },
      };
    }

    // Create report record
    const report = await prisma.healthReport.create({
      data: {
        userId,
        familyMemberId: reportData.familyMemberId,
        title: reportData.title,
        reportType: reportData.reportType as any,
        reportDate: new Date(reportData.reportDate),
        fileName: fileData.fileName,
        fileUrl: fileData.fileUrl,
        filePublicId: fileData.publicId,
        fileSize: fileData.fileSize,
        pageCount: fileData.pageCount,
        mimeType: fileData.mimeType,
        extractedText: fileData.extractedText,
        labName: reportData.labName,
        doctorName: reportData.doctorName,
        userNotes: reportData.userNotes,
        tags: reportData.tags || [],
        isArchived: false,
      },
    });

    // Update usage
    await this.updateUsage(userId, { pages: fileData.pageCount });

    const updatedUsage = await this.getUsage(userId);
    const limits = getPlanLimits(plan, region);

    return {
      success: true,
      report: this.mapPrismaToReport(report),
      usage: {
        pagesUsed: updatedUsage.pagesUploaded,
        pagesRemaining: limits.pagesPerMonth - updatedUsage.pagesUploaded,
        percentUsed: (updatedUsage.pagesUploaded / limits.pagesPerMonth) * 100,
      },
    };
  }

  /**
   * List user's reports
   */
  async listReports(
    userId: string,
    request: ListReportsRequest
  ): Promise<ListReportsResponse> {
    const { familyMemberId, reportType, startDate, endDate, page = 1, limit = 20 } = request;

    const where: any = { userId, isArchived: false };

    if (familyMemberId) where.familyMemberId = familyMemberId;
    if (reportType) where.reportType = reportType;
    if (startDate || endDate) {
      where.reportDate = {};
      if (startDate) where.reportDate.gte = new Date(startDate);
      if (endDate) where.reportDate.lte = new Date(endDate);
    }

    const [reports, total] = await Promise.all([
      prisma.healthReport.findMany({
        where,
        orderBy: { reportDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.healthReport.count({ where }),
    ]);

    return {
      success: true,
      reports: reports.map(this.mapPrismaToReport),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single report by ID
   */
  async getReport(userId: string, reportId: string): Promise<HealthReport | null> {
    const report = await prisma.healthReport.findFirst({
      where: { id: reportId, userId },
    });

    return report ? this.mapPrismaToReport(report) : null;
  }

  /**
   * Delete a report (including Cloudinary file)
   */
  async deleteReport(userId: string, reportId: string): Promise<boolean> {
    // Get report first to get publicId
    const report = await prisma.healthReport.findFirst({
      where: { id: reportId, userId },
    });

    if (!report) return false;

    // Delete from Cloudinary
    if (report.filePublicId) {
      const resourceType = report.mimeType === 'application/pdf' ? 'raw' : 'image';
      await healthUploadService.deleteFile(report.filePublicId, resourceType);
    }

    // Delete from database
    const result = await prisma.healthReport.deleteMany({
      where: { id: reportId, userId },
    });

    return result.count > 0;
  }

  /**
   * Update report notes
   */
  async updateReportNotes(
    userId: string, 
    reportId: string, 
    notes: string
  ): Promise<boolean> {
    const result = await prisma.healthReport.updateMany({
      where: { id: reportId, userId },
      data: { userNotes: notes },
    });

    return result.count > 0;
  }

  // ═══════════════════════════════════════════════════════
  // HEALTH CHAT (Educational Q&A Only)
  // ═══════════════════════════════════════════════════════

  /**
   * Send chat message and get response
   * SAFE: Educational only, no diagnosis
   */
  async chat(
    userId: string,
    plan: HealthPlan,
    region: HealthRegion,
    request: HealthChatRequest
  ): Promise<HealthChatResponse> {
    // Check usage limits
    const usage = await this.getUsage(userId);
    const usageState = {
      pagesUploaded: usage.pagesUploaded,
      tokensUsed: usage.tokensUsed,
      comparisonsUsed: usage.comparisonsUsed,
      lastResetDate: usage.periodStart,
    };

    const canChat = canSendChat(plan, usageState, region);

    if (!canChat.allowed) {
      return {
        success: false,
        message: canChat.reason || ERROR_MESSAGES.LIMIT_EXCEEDED.tokens,
        disclaimer: DISCLAIMERS.CHAT,
        sessionId: request.sessionId || '',
        tokensUsed: 0,
        usage: {
          tokensUsed: usage.tokensUsed,
          tokensRemaining: canChat.remaining,
          percentUsed: canChat.percentUsed,
        },
      };
    }

    // Get report context if specified
    let reportContext: string | undefined;
    if (request.reportId) {
      const report = await this.getReport(userId, request.reportId);
      if (report && report.extractedText) {
        reportContext = `Report: ${report.title} (${report.reportType}, dated ${report.reportDate})\n${report.extractedText.substring(0, 3000)}`;
      }
    }

    // Get session history if continuing conversation
    let sessionHistory: { role: string; content: string }[] = [];
    if (request.sessionId) {
      const recentChats = await prisma.healthChat.findMany({
        where: { 
          userId, 
          sessionId: request.sessionId 
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      });
      sessionHistory = recentChats.reverse().map(chat => ({
        role: chat.role,
        content: chat.content,
      }));
    }

    // Call AI Service
    const aiResponse = await healthAIService.chat(
      request.message,
      reportContext,
      sessionHistory
    );

    if (!aiResponse.success) {
      return {
        success: false,
        message: aiResponse.content,
        disclaimer: DISCLAIMERS.CHAT,
        sessionId: request.sessionId || this.generateSessionId(),
        tokensUsed: 0,
        usage: {
          tokensUsed: usage.tokensUsed,
          tokensRemaining: canChat.remaining,
          percentUsed: canChat.percentUsed,
        },
      };
    }

    const sessionId = request.sessionId || this.generateSessionId();

    // Save chat messages to database
    await prisma.healthChat.createMany({
      data: [
        {
          userId,
          sessionId,
          role: 'user',
          content: request.message,
          referencedReportId: request.reportId,
        },
        {
          userId,
          sessionId,
          role: 'assistant',
          content: aiResponse.content,
          tokensUsed: aiResponse.tokensUsed,
        },
      ],
    });

    // Update usage
    await this.updateUsage(userId, { tokens: aiResponse.tokensUsed });

    const updatedUsage = await this.getUsage(userId);
    const limits = getPlanLimits(plan, region);

    return {
      success: true,
      message: aiResponse.content,
      disclaimer: DISCLAIMERS.CHAT,
      sessionId,
      tokensUsed: aiResponse.tokensUsed,
      usage: {
        tokensUsed: updatedUsage.tokensUsed,
        tokensRemaining: limits.usesTokenPool ? 0 : limits.monthlyTokens - updatedUsage.tokensUsed,
        percentUsed: limits.usesTokenPool ? 0 : (updatedUsage.tokensUsed / limits.monthlyTokens) * 100,
      },
    };
  }

  // ═══════════════════════════════════════════════════════
  // TERM EXPLANATION (Educational Only)
  // ═══════════════════════════════════════════════════════

  /**
   * Explain a medical term in plain English
   * SAFE: Educational only, no interpretation
   */
  async explainTerm(
    userId: string,
    plan: HealthPlan,
    region: HealthRegion,
    request: TermExplanationRequest
  ): Promise<TermExplanationResponse> {
    // Call AI Service
    const aiResponse = await healthAIService.explainTerm(
      request.term,
      request.context
    );

    // Update usage
    await this.updateUsage(userId, { tokens: aiResponse.tokensUsed });

    return {
      term: request.term,
      explanation: aiResponse.content,
      disclaimer: DISCLAIMERS.TERM_EXPLANATION,
      relatedTerms: [],
    };
  }

  // ═══════════════════════════════════════════════════════
  // DOCTOR QUESTIONS GENERATOR
  // ═══════════════════════════════════════════════════════

  /**
   * Generate questions to ask doctor
   * SAFE: Preparation help, not medical advice
   */
  async generateDoctorQuestions(
    userId: string,
    plan: HealthPlan,
    region: HealthRegion,
    request: DoctorQuestionsRequest
  ): Promise<DoctorQuestionsResponse> {
    // Check feature availability
    const limits = getPlanLimits(plan, region);
    if (!limits.features.questionGenerator) {
      return {
        questions: [],
        disclaimer: DISCLAIMERS.QUESTIONS,
        note: ERROR_MESSAGES.FEATURE_NOT_AVAILABLE,
      };
    }

    // Get report
    const report = await this.getReport(userId, request.reportId);
    if (!report) {
      return {
        questions: [],
        disclaimer: DISCLAIMERS.QUESTIONS,
        note: ERROR_MESSAGES.REPORT_NOT_FOUND,
      };
    }

    // Call AI Service
    const aiResponse = await healthAIService.generateDoctorQuestions(
      report.reportType,
      report.reportDate.toISOString(),
      report.extractedText,
      request.userConcerns
    );

    // Parse questions from response
    const questions = this.parseQuestions(aiResponse.content);

    // Update usage
    await this.updateUsage(userId, { tokens: aiResponse.tokensUsed });

    return {
      questions,
      disclaimer: DISCLAIMERS.QUESTIONS,
      note: 'These are suggested questions to help you prepare. Your doctor can provide personalized guidance.',
    };
  }

  // ═══════════════════════════════════════════════════════
  // REPORT COMPARISON (Side-by-Side View Only)
  // ═══════════════════════════════════════════════════════

  /**
   * Compare two reports side-by-side
   * SAFE: Factual summary only, NO analysis or interpretation
   */
  async compareReports(
    userId: string,
    plan: HealthPlan,
    region: HealthRegion,
    request: ReportComparisonRequest
  ): Promise<ReportComparisonResponse> {
    // Check usage limits
    const usage = await this.getUsage(userId);
    const usageState = {
      pagesUploaded: usage.pagesUploaded,
      tokensUsed: usage.tokensUsed,
      comparisonsUsed: usage.comparisonsUsed,
      lastResetDate: usage.periodStart,
    };

    const canCompare = canCompareReports(plan, usageState, region);

    if (!canCompare.allowed) {
      throw new Error(canCompare.reason || ERROR_MESSAGES.LIMIT_EXCEEDED.comparisons);
    }

    // Get both reports
    const [report1, report2] = await Promise.all([
      this.getReport(userId, request.reportId1),
      this.getReport(userId, request.reportId2),
    ]);

    if (!report1 || !report2) {
      throw new Error(ERROR_MESSAGES.REPORT_NOT_FOUND);
    }

    // Generate factual summaries using AI Service (NO interpretation)
    const [summary1Response, summary2Response] = await Promise.all([
      healthAIService.generateFactualSummary(
        report1.title,
        report1.reportType,
        report1.reportDate.toISOString(),
        report1.extractedText
      ),
      healthAIService.generateFactualSummary(
        report2.title,
        report2.reportType,
        report2.reportDate.toISOString(),
        report2.extractedText
      ),
    ]);

    // Update usage
    await this.updateUsage(userId, { 
      comparisons: 1,
      tokens: summary1Response.tokensUsed + summary2Response.tokensUsed,
    });

    return {
      report1: {
        id: report1.id,
        title: report1.title,
        date: report1.reportDate,
        summary: summary1Response.content,
      },
      report2: {
        id: report2.id,
        title: report2.title,
        date: report2.reportDate,
        summary: summary2Response.content,
      },
      disclaimer: DISCLAIMERS.COMPARISON,
      suggestion: 'If you notice any changes between reports, please discuss them with your doctor who can provide personalized interpretation.',
    };
  }

  // ═══════════════════════════════════════════════════════
  // TIMELINE (Organization)
  // ═══════════════════════════════════════════════════════

  /**
   * Get reports organized by timeline
   */
  async getTimeline(
    userId: string,
    request: TimelineRequest
  ): Promise<TimelineResponse> {
    const year = request.year || new Date().getFullYear();
    
    const reports = await prisma.healthReport.findMany({
      where: {
        userId,
        familyMemberId: request.familyMemberId,
        isArchived: false,
        reportDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
      orderBy: { reportDate: 'desc' },
      select: {
        id: true,
        title: true,
        reportType: true,
        reportDate: true,
      },
    });

    // Group by month
    const grouped: Map<string, any[]> = new Map();
    
    reports.forEach(report => {
      const monthKey = new Date(report.reportDate).toLocaleString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      
      grouped.get(monthKey)!.push({
        id: report.id,
        title: report.title,
        type: report.reportType as ReportType,
        date: report.reportDate,
      });
    });

    const timeline = Array.from(grouped.entries()).map(([month, reports]) => ({
      month,
      reports,
    }));

    return {
      success: true,
      timeline,
    };
  }

  // ═══════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════

  /**
   * Parse questions from AI response
   */
  private parseQuestions(response: string): string[] {
    const lines = response.split('\n').filter(line => line.trim());
    
    const questions = lines
      .map(line => line.replace(/^[\d\-\*\.\)]+\s*/, '').trim())
      .filter(line => line.length > 10 && line.includes('?'));
    
    return questions.slice(0, 7);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `health_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Map Prisma model to HealthReport type
   */
  private mapPrismaToReport(prismaReport: any): HealthReport {
    return {
      id: prismaReport.id,
      userId: prismaReport.userId,
      familyMemberId: prismaReport.familyMemberId,
      title: prismaReport.title,
      reportType: prismaReport.reportType as ReportType,
      reportDate: prismaReport.reportDate,
      uploadedAt: prismaReport.createdAt,
      fileName: prismaReport.fileName,
      fileUrl: prismaReport.fileUrl,
      fileSize: prismaReport.fileSize,
      pageCount: prismaReport.pageCount,
      mimeType: prismaReport.mimeType,
      extractedText: prismaReport.extractedText,
      userNotes: prismaReport.userNotes,
      tags: prismaReport.tags,
      labName: prismaReport.labName,
      doctorName: prismaReport.doctorName,
      isArchived: prismaReport.isArchived,
      createdAt: prismaReport.createdAt,
      updatedAt: prismaReport.updatedAt,
    };
  }
}

// Export singleton instance
export const healthService = new HealthService();