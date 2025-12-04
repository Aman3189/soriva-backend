// src/modules/document/services/document-usage.service.ts

/**
 * ==========================================
 * DOCUMENT USAGE SERVICE
 * ==========================================
 * Created: November 23, 2025
 * Updated: December 4, 2025 - Plan-based limits integration
 * 
 * FEATURES:
 * - ⭐ NEW: Plan-based limits (STARTER/PLUS/PRO/APEX)
 * - Monthly/Daily/Hourly usage tracking
 * - Auto-reset functionality
 * - Storage tracking
 * - Rate limiting
 * - Max pages/file size per plan
 * 
 * ALIGNED WITH:
 * - Prisma schema (DocumentUsage model)
 * - abuse-limits.ts (DOCUMENT_HARD_LIMITS)
 * - documentLimits.ts
 */

import { prisma } from '@/config/prisma';
import { OperationType, PlanType, OperationStatus } from '@prisma/client';
import {
  UsageCheckResult,
  LimitsEnforcementResult,
  UsageStatsResponse,
  DocumentIntelligenceError,
  ERROR_CODES,
} from '../interfaces/document-intelligence.types';
import {
  DOCUMENT_LIMITS,
  OPERATION_METADATA,
  isOperationAllowed,
  isOperationFree,
  formatFileSize,
} from '@/constants/documentLimits';

// ⭐ NEW: Import plan-based limits
import { DOCUMENT_HARD_LIMITS } from '@/constants/abuse-limits';

// ⭐ NEW: Plan limits type
type PlanLimits = {
  docsPerDay: number;
  maxPages: number;
  maxSizeMB: number;
  maxSizeBytes: number;
  concurrent: number;
};

export class DocumentUsageService {

  // ==========================================
  // ⭐ NEW: PLAN-BASED LIMITS
  // ==========================================

  /**
   * Get user's plan type
   */
  private async getUserPlanType(userId: string): Promise<PlanType> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });
    return user?.planType || PlanType.STARTER;
  }

  /**
   * Get plan-based document limits
   */
  private getPlanLimits(planType: PlanType): PlanLimits {
    const limits = DOCUMENT_HARD_LIMITS[planType as keyof typeof DOCUMENT_HARD_LIMITS];
    
    if (!limits) {
      // Default to STARTER (no access)
      return {
        docsPerDay: 0,
        maxPages: 0,
        maxSizeMB: 0,
        maxSizeBytes: 0,
        concurrent: 0,
      };
    }

    return {
      docsPerDay: limits.docsPerDay,
      maxPages: limits.maxPagesPerDoc,
      maxSizeMB: limits.maxFileSizeMB,
      maxSizeBytes: limits.maxFileSizeMB * 1024 * 1024,
      concurrent: limits.maxConcurrentParsing,
    };
  }

  /**
   * Check if plan has document intelligence access
   */
  private hasPlanAccess(planType: PlanType): boolean {
    // STARTER has no document intelligence access
    return planType !== PlanType.STARTER;
  }

  /**
   * Get documents processed today count
   */
  private async getDocsProcessedToday(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.documentOperation.count({
      where: {
        userId,
        createdAt: { gte: today },
        status: { in: [OperationStatus.SUCCESS, OperationStatus.PROCESSING] },
      },
    });

    return count;
  }

  /**
   * Get concurrent processing count
   */
  private async getConcurrentProcessingCount(userId: string): Promise<number> {
    const count = await prisma.documentOperation.count({
      where: {
        userId,
        status: OperationStatus.PROCESSING,
      },
    });

    return count;
  }

  // ==========================================
  // USAGE RECORD MANAGEMENT
  // ==========================================

  /**
   * Get or create usage record for user
   */
  async getOrCreateUsage(userId: string) {
    let usage = await prisma.documentUsage.findUnique({
      where: { userId },
    });

    if (!usage) {
      const now = new Date();
      const cycleEnd = new Date(now);
      cycleEnd.setMonth(cycleEnd.getMonth() + 1);

      // Get user's plan for initial limits
      const planType = await this.getUserPlanType(userId);
      const planLimits = this.getPlanLimits(planType);
      const isPaid = this.hasPlanAccess(planType);

      usage = await prisma.documentUsage.create({
        data: {
          userId,
          // Monthly tracking
          documentsThisMonth: 0,
          operationsThisMonth: 0,
          tokensUsedThisMonth: 0,
          costThisMonth: 0,
          freeOpsThisMonth: 0,
          paidOpsThisMonth: 0,
          
          // Limits based on plan
          documentLimit: isPaid ? DOCUMENT_LIMITS.PAID.documentsPerMonth : DOCUMENT_LIMITS.FREE.documentsPerMonth,
          operationLimit: isPaid ? DOCUMENT_LIMITS.PAID.totalOperationsPerMonth : DOCUMENT_LIMITS.FREE.totalOperationsPerMonth,
          isPaidUser: isPaid,
          
          // Storage
          totalStorageUsed: BigInt(0),
          storageLimit: BigInt(isPaid ? DOCUMENT_LIMITS.PAID.totalStorageLimit : DOCUMENT_LIMITS.FREE.totalStorageLimit),
          
          // Cycle dates
          lastMonthlyReset: now,
          cycleStartDate: now,
          cycleEndDate: cycleEnd,
          
          // Hourly tracking
          operationsThisHour: 0,
          lastHourlyReset: now,
          hourlyLimit: isPaid ? DOCUMENT_LIMITS.PAID.operationsPerHour : DOCUMENT_LIMITS.FREE.operationsPerHour,
          
          // Daily tracking
          operationsToday: 0,
          lastDailyReset: now,
        },
      });
    }

    return usage;
  }

  // ==========================================
  // AUTO-RESET FUNCTIONALITY
  // ==========================================

  /**
   * Check and reset usage if needed (monthly/daily/hourly)
   */
  async checkAndResetIfNeeded(userId: string) {
    const usage = await this.getOrCreateUsage(userId);
    const now = new Date();
    const updates: Record<string, unknown> = {};

    // Check MONTHLY reset
    if (now > usage.cycleEndDate) {
      const newCycleEnd = new Date(now);
      newCycleEnd.setMonth(newCycleEnd.getMonth() + 1);

      Object.assign(updates, {
        documentsThisMonth: 0,
        operationsThisMonth: 0,
        tokensUsedThisMonth: 0,
        costThisMonth: 0,
        freeOpsThisMonth: 0,
        paidOpsThisMonth: 0,
        lastMonthlyReset: now,
        cycleStartDate: now,
        cycleEndDate: newCycleEnd,
      });
    }

    // Check DAILY reset
    const hoursSinceDaily = (now.getTime() - usage.lastDailyReset.getTime()) / (1000 * 60 * 60);
    if (hoursSinceDaily >= 24) {
      Object.assign(updates, {
        operationsToday: 0,
        lastDailyReset: now,
      });
    }

    // Check HOURLY reset
    const hoursSinceHourly = (now.getTime() - usage.lastHourlyReset.getTime()) / (1000 * 60 * 60);
    if (hoursSinceHourly >= 1) {
      Object.assign(updates, {
        operationsThisHour: 0,
        lastHourlyReset: now,
      });
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await prisma.documentUsage.update({
        where: { userId },
        data: updates,
      });
    }

    // Return fresh usage data
    return this.getOrCreateUsage(userId);
  }

  // ==========================================
  // ⭐ ENHANCED: DOCUMENT UPLOAD CHECKS
  // ==========================================

  /**
   * Check if user can upload a document (with plan-based limits)
   */
  async canUploadDocument(
    userId: string, 
    fileSize: number,
    pageCount?: number
  ): Promise<LimitsEnforcementResult> {
    // Get user's plan
    const planType = await this.getUserPlanType(userId);
    const planLimits = this.getPlanLimits(planType);

    // ⭐ Check plan access
    if (!this.hasPlanAccess(planType)) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.OPERATION_NOT_ALLOWED,
        errorMessage: 'Document Intelligence is not available on Starter plan. Please upgrade to Plus or higher.',
        upgradeRequired: true,
      };
    }

    // ⭐ Check daily document limit (plan-based)
    const docsToday = await this.getDocsProcessedToday(userId);
    if (docsToday >= planLimits.docsPerDay) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.DAILY_LIMIT_REACHED,
        errorMessage: `Daily document limit reached (${planLimits.docsPerDay}/day for ${planType} plan). Resets at midnight.`,
        upgradeRequired: planType !== PlanType.APEX,
      };
    }

    // ⭐ Check file size limit (plan-based)
    if (fileSize > planLimits.maxSizeBytes) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.FILE_TOO_LARGE,
        errorMessage: `File size (${formatFileSize(fileSize)}) exceeds ${planType} plan limit of ${planLimits.maxSizeMB}MB.`,
        upgradeRequired: planType !== PlanType.APEX,
      };
    }

    // ⭐ Check page count limit (plan-based)
    if (pageCount && pageCount > planLimits.maxPages) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.FILE_TOO_LARGE,
        errorMessage: `Document has ${pageCount} pages, exceeding ${planType} plan limit of ${planLimits.maxPages} pages.`,
        upgradeRequired: planType !== PlanType.APEX,
      };
    }

    // ⭐ Check concurrent processing limit
    const concurrent = await this.getConcurrentProcessingCount(userId);
    if (concurrent >= planLimits.concurrent) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        errorMessage: `Maximum concurrent documents (${planLimits.concurrent}) being processed. Please wait for current processing to complete.`,
        upgradeRequired: false,
      };
    }

    // Legacy checks (storage, monthly limits)
    const usage = await this.checkAndResetIfNeeded(userId);
    const limits = usage.isPaidUser ? DOCUMENT_LIMITS.PAID : DOCUMENT_LIMITS.FREE;

    // Check monthly document limit
    if (usage.documentsThisMonth >= limits.documentsPerMonth) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.DOCUMENT_LIMIT_REACHED,
        errorMessage: `Monthly document limit reached (${limits.documentsPerMonth}/month). ${
          usage.isPaidUser ? 'Please wait for next billing cycle.' : 'Upgrade for more documents.'
        }`,
        upgradeRequired: !usage.isPaidUser,
      };
    }

    // Check storage limit
    const currentStorage = Number(usage.totalStorageUsed);
    const storageLimit = Number(usage.storageLimit);
    if (currentStorage + fileSize > storageLimit) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.STORAGE_LIMIT_REACHED,
        errorMessage: `Storage limit reached (${formatFileSize(storageLimit)}). Delete old documents or upgrade for more storage.`,
        upgradeRequired: !usage.isPaidUser,
      };
    }

    return { canProceed: true };
  }

  // ==========================================
  // ⭐ ENHANCED: OPERATION CHECKS
  // ==========================================

  /**
   * Check if user can perform an operation (with plan-based limits)
   */
  async canPerformOperation(
    userId: string,
    operationType: OperationType
  ): Promise<LimitsEnforcementResult> {
    // Get user's plan
    const planType = await this.getUserPlanType(userId);

    // ⭐ Check plan access
    if (!this.hasPlanAccess(planType)) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.OPERATION_NOT_ALLOWED,
        errorMessage: 'Document Intelligence is not available on Starter plan. Please upgrade to Plus or higher.',
        upgradeRequired: true,
      };
    }

    const usage = await this.checkAndResetIfNeeded(userId);
    const limits = usage.isPaidUser ? DOCUMENT_LIMITS.PAID : DOCUMENT_LIMITS.FREE;

    // Check if operation is allowed for plan
    if (!isOperationAllowed(operationType, usage.isPaidUser)) {
      const opMeta = OPERATION_METADATA[operationType];
      return {
        canProceed: false,
        errorCode: ERROR_CODES.OPERATION_NOT_ALLOWED,
        errorMessage: `"${opMeta?.name || operationType}" requires Document Intelligence addon (₹149/month).`,
        upgradeRequired: true,
      };
    }

    // Check monthly operation limit (skip for unlimited plans)
    if (limits.totalOperationsPerMonth !== -1) {
      if (usage.operationsThisMonth >= limits.totalOperationsPerMonth) {
        return {
          canProceed: false,
          errorCode: ERROR_CODES.OPERATION_LIMIT_REACHED,
          errorMessage: `Monthly operation limit reached (${limits.totalOperationsPerMonth}/month). Upgrade for unlimited operations.`,
          upgradeRequired: !usage.isPaidUser,
        };
      }
    }

    // Check daily operation limit
    if (usage.operationsToday >= limits.operationsPerDay) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.DAILY_LIMIT_REACHED,
        errorMessage: `Daily limit reached (${limits.operationsPerDay}/day). Try again tomorrow or upgrade for higher limits.`,
        upgradeRequired: !usage.isPaidUser,
      };
    }

    // Check hourly rate limit
    if (usage.operationsThisHour >= usage.hourlyLimit) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        errorMessage: `Rate limit exceeded (${usage.hourlyLimit}/hour). Please wait a few minutes.`,
        upgradeRequired: false,
      };
    }

    return { canProceed: true };
  }

  // ==========================================
  // ⭐ NEW: GET PLAN-BASED LIMITS STATUS
  // ==========================================

  /**
   * Get plan-based document limits status (for UI)
   */
  async getPlanLimitsStatus(userId: string) {
    const planType = await this.getUserPlanType(userId);
    const planLimits = this.getPlanLimits(planType);
    const hasAccess = this.hasPlanAccess(planType);

    if (!hasAccess) {
      return {
        success: false,
        hasAccess: false,
        planType,
        message: 'Document Intelligence is not available on Starter plan. Please upgrade to Plus or higher.',
      };
    }

    const docsToday = await this.getDocsProcessedToday(userId);
    const concurrent = await this.getConcurrentProcessingCount(userId);

    return {
      success: true,
      hasAccess: true,
      planType,
      limits: {
        docsPerDay: {
          used: docsToday,
          limit: planLimits.docsPerDay,
          remaining: Math.max(0, planLimits.docsPerDay - docsToday),
        },
        maxPages: planLimits.maxPages,
        maxSizeMB: planLimits.maxSizeMB,
        concurrent: {
          current: concurrent,
          limit: planLimits.concurrent,
        },
      },
      resetsAt: this.getNextDailyReset(),
    };
  }

  private getNextDailyReset(): Date {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  // ==========================================
  // USAGE TRACKING
  // ==========================================

  /**
   * Track document upload
   */
  async trackDocumentUpload(userId: string, fileSize: number) {
    const usage = await this.checkAndResetIfNeeded(userId);

    return prisma.documentUsage.update({
      where: { userId },
      data: {
        documentsThisMonth: usage.documentsThisMonth + 1,
        totalStorageUsed: BigInt(Number(usage.totalStorageUsed) + fileSize),
      },
    });
  }

  /**
   * Track operation execution
   */
  async trackOperation(
    userId: string,
    operationType: OperationType,
    tokens: number,
    cost: number
  ) {
    const usage = await this.checkAndResetIfNeeded(userId);
    const isFree = isOperationFree(operationType);

    return prisma.documentUsage.update({
      where: { userId },
      data: {
        operationsThisMonth: usage.operationsThisMonth + 1,
        operationsThisHour: usage.operationsThisHour + 1,
        operationsToday: usage.operationsToday + 1,
        tokensUsedThisMonth: usage.tokensUsedThisMonth + tokens,
        costThisMonth: usage.costThisMonth + cost,
        freeOpsThisMonth: isFree ? usage.freeOpsThisMonth + 1 : usage.freeOpsThisMonth,
        paidOpsThisMonth: !isFree ? usage.paidOpsThisMonth + 1 : usage.paidOpsThisMonth,
      },
    });
  }

  /**
   * Track document deletion (reduce storage)
   */
  async trackDocumentDeletion(userId: string, fileSize: number) {
    const usage = await this.getOrCreateUsage(userId);
    const currentStorage = Number(usage.totalStorageUsed);
    const newStorage = Math.max(0, currentStorage - fileSize);

    return prisma.documentUsage.update({
      where: { userId },
      data: {
        totalStorageUsed: BigInt(newStorage),
      },
    });
  }

  // ==========================================
  // USAGE STATISTICS
  // ==========================================

  /**
   * Get usage statistics for user
   */
  async getUsageStats(userId: string): Promise<UsageCheckResult> {
    const usage = await this.checkAndResetIfNeeded(userId);
    const limits = usage.isPaidUser ? DOCUMENT_LIMITS.PAID : DOCUMENT_LIMITS.FREE;

    const currentStorage = Number(usage.totalStorageUsed);
    const storageLimit = Number(usage.storageLimit);

    return {
      allowed: true,
      current: {
        documents: usage.documentsThisMonth,
        operations: usage.operationsThisMonth,
        storage: currentStorage,
        operationsThisHour: usage.operationsThisHour,
      },
      limits: {
        documents: limits.documentsPerMonth,
        operations: limits.totalOperationsPerMonth,
        storage: storageLimit,
        operationsPerHour: limits.operationsPerHour,
      },
      remaining: {
        documents: Math.max(0, limits.documentsPerMonth - usage.documentsThisMonth),
        operations: limits.totalOperationsPerMonth === -1 
          ? -1 
          : Math.max(0, limits.totalOperationsPerMonth - usage.operationsThisMonth),
        storage: Math.max(0, storageLimit - currentStorage),
      },
    };
  }

  /**
   * Get detailed usage stats response for API
   */
  async getDetailedUsageStats(userId: string): Promise<UsageStatsResponse> {
    const usage = await this.checkAndResetIfNeeded(userId);
    const limits = usage.isPaidUser ? DOCUMENT_LIMITS.PAID : DOCUMENT_LIMITS.FREE;

    // ⭐ NEW: Include plan-based limits
    const planType = await this.getUserPlanType(userId);
    const planLimits = this.getPlanLimits(planType);
    const docsToday = await this.getDocsProcessedToday(userId);

    const currentStorage = Number(usage.totalStorageUsed);
    const storageLimit = Number(usage.storageLimit);

    // Get recent documents
    const recentDocs = await prisma.document.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        filename: true,
        uploadedAt: true,
        _count: {
          select: { operations: true },
        },
      },
    });

    // Get recent operations
    const recentOps = await prisma.documentOperation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        operationType: true,
        status: true,
        createdAt: true,
        document: {
          select: { filename: true },
        },
      },
    });

    return {
      period: 'month',
      isPaidUser: usage.isPaidUser,
      usage: {
        documents: {
          usedThisMonth: usage.documentsThisMonth,
          limitPerMonth: limits.documentsPerMonth,
          percentage: Math.round((usage.documentsThisMonth / limits.documentsPerMonth) * 100),
        },
        operations: {
          usedThisMonth: usage.operationsThisMonth,
          limitPerMonth: limits.totalOperationsPerMonth,
          usedToday: usage.operationsToday,
          limitPerDay: limits.operationsPerDay,
          percentage: limits.totalOperationsPerMonth === -1 
            ? 0 
            : Math.round((usage.operationsThisMonth / limits.totalOperationsPerMonth) * 100),
        },
        storage: {
          used: currentStorage,
          limit: storageLimit,
          percentage: Math.round((currentStorage / storageLimit) * 100),
          formattedUsed: formatFileSize(currentStorage),
          formattedLimit: formatFileSize(storageLimit),
        },
        cost: {
          thisMonth: Math.round(usage.costThisMonth * 100) / 100,
          average: usage.operationsThisMonth > 0 
            ? Math.round((usage.costThisMonth / usage.operationsThisMonth) * 100) / 100 
            : 0,
        },
      },
      // ⭐ Plan-based limits (additional info)
      planInfo: {
        planType,
        docsUsedToday: docsToday,
        docsLimitPerDay: planLimits.docsPerDay,
        maxPages: planLimits.maxPages,
        maxSizeMB: planLimits.maxSizeMB,
        concurrent: planLimits.concurrent,
      },
      recentDocuments: recentDocs.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        uploadedAt: doc.uploadedAt,
        operationCount: doc._count.operations,
      })),
      recentOperations: recentOps.map(op => ({
        id: op.id,
        operationType: op.operationType,
        documentName: op.document?.filename || 'Unknown',
        status: op.status,
        createdAt: op.createdAt,
      })),
    } as UsageStatsResponse & { planInfo: any };
  }

  // ==========================================
  // PLAN MANAGEMENT
  // ==========================================

  /**
   * Upgrade user to paid plan
   */
  async upgradeToPaid(userId: string) {
    const limits = DOCUMENT_LIMITS.PAID;

    return prisma.documentUsage.upsert({
      where: { userId },
      update: {
        isPaidUser: true,
        documentLimit: limits.documentsPerMonth,
        operationLimit: limits.totalOperationsPerMonth,
        storageLimit: BigInt(limits.totalStorageLimit),
        hourlyLimit: limits.operationsPerHour,
      },
      create: {
        userId,
        isPaidUser: true,
        documentLimit: limits.documentsPerMonth,
        operationLimit: limits.totalOperationsPerMonth,
        storageLimit: BigInt(limits.totalStorageLimit),
        hourlyLimit: limits.operationsPerHour,
        documentsThisMonth: 0,
        operationsThisMonth: 0,
        tokensUsedThisMonth: 0,
        costThisMonth: 0,
        freeOpsThisMonth: 0,
        paidOpsThisMonth: 0,
        totalStorageUsed: BigInt(0),
        lastMonthlyReset: new Date(),
        cycleStartDate: new Date(),
        cycleEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        operationsThisHour: 0,
        lastHourlyReset: new Date(),
        operationsToday: 0,
        lastDailyReset: new Date(),
      },
    });
  }

  /**
   * Downgrade user to free plan
   */
  async downgradeToFree(userId: string) {
    const limits = DOCUMENT_LIMITS.FREE;

    return prisma.documentUsage.update({
      where: { userId },
      data: {
        isPaidUser: false,
        documentLimit: limits.documentsPerMonth,
        operationLimit: limits.totalOperationsPerMonth,
        storageLimit: BigInt(limits.totalStorageLimit),
        hourlyLimit: limits.operationsPerHour,
      },
    });
  }

  /**
   * Sync user's document limits with their current plan
   */
  async syncWithPlan(userId: string) {
    const planType = await this.getUserPlanType(userId);
    const isPaid = this.hasPlanAccess(planType);
    const limits = isPaid ? DOCUMENT_LIMITS.PAID : DOCUMENT_LIMITS.FREE;

    return prisma.documentUsage.update({
      where: { userId },
      data: {
        isPaidUser: isPaid,
        documentLimit: limits.documentsPerMonth,
        operationLimit: limits.totalOperationsPerMonth,
        storageLimit: BigInt(limits.totalStorageLimit),
        hourlyLimit: limits.operationsPerHour,
      },
    });
  }

  /**
   * Check if user is paid
   */
  async isPaidUser(userId: string): Promise<boolean> {
    const usage = await this.getOrCreateUsage(userId);
    return usage.isPaidUser;
  }

  // ==========================================
  // ANALYTICS
  // ==========================================

  /**
   * Get usage breakdown by operation type
   */
  async getOperationBreakdown(userId: string) {
    const breakdown = await prisma.documentOperation.groupBy({
      by: ['operationType'],
      where: { userId },
      _count: { operationType: true },
      _sum: { cost: true, totalTokens: true },
      orderBy: { _count: { operationType: 'desc' } },
    });

    return breakdown.map(item => ({
      operationType: item.operationType,
      operationName: OPERATION_METADATA[item.operationType]?.name || item.operationType,
      category: OPERATION_METADATA[item.operationType]?.category || 'unknown',
      count: item._count.operationType,
      totalCost: item._sum.cost || 0,
      totalTokens: item._sum.totalTokens || 0,
    }));
  }

  /**
   * Get daily usage for the past N days
   */
  async getDailyUsage(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const operations = await prisma.documentOperation.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        cost: true,
        totalTokens: true,
      },
    });

    // Group by date
    const dailyStats: Record<string, { count: number; cost: number; tokens: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats[dateKey] = { count: 0, cost: 0, tokens: 0 };
    }

    operations.forEach(op => {
      const dateKey = op.createdAt.toISOString().split('T')[0];
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].count++;
        dailyStats[dateKey].cost += op.cost;
        dailyStats[dateKey].tokens += op.totalTokens;
      }
    });

    return Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        ...stats,
        cost: Math.round(stats.cost * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

// Export singleton instance
export default new DocumentUsageService();