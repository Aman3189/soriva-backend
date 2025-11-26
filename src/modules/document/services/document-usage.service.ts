// src/modules/document/services/document-usage.service.ts

/**
 * ==========================================
 * DOCUMENT USAGE SERVICE
 * ==========================================
 * Created: November 23, 2025
 * Updated: November 24, 2025 - SIMPLIFIED VERSION
 * 
 * FEATURES:
 * - Monthly/Daily/Hourly usage tracking
 * - FREE vs PAID limits enforcement
 * - Auto-reset functionality
 * - Storage tracking
 * - Rate limiting
 * 
 * ALIGNED WITH:
 * - Prisma schema (DocumentUsage model)
 * - documentLimits.ts
 * - document-intelligence.types.ts
 */

import { prisma } from '@/config/prisma';
import { OperationType } from '@prisma/client';
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

export class DocumentUsageService {

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
          
          // Limits (FREE tier defaults)
          documentLimit: DOCUMENT_LIMITS.FREE.documentsPerMonth,
          operationLimit: DOCUMENT_LIMITS.FREE.totalOperationsPerMonth,
          isPaidUser: false,
          
          // Storage
          totalStorageUsed: BigInt(0),
          storageLimit: BigInt(DOCUMENT_LIMITS.FREE.totalStorageLimit),
          
          // Cycle dates
          lastMonthlyReset: now,
          cycleStartDate: now,
          cycleEndDate: cycleEnd,
          
          // Hourly tracking
          operationsThisHour: 0,
          lastHourlyReset: now,
          hourlyLimit: DOCUMENT_LIMITS.FREE.operationsPerHour,
          
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
  // DOCUMENT UPLOAD CHECKS
  // ==========================================

  /**
   * Check if user can upload a document
   */
  async canUploadDocument(
    userId: string, 
    fileSize: number
  ): Promise<LimitsEnforcementResult> {
    const usage = await this.checkAndResetIfNeeded(userId);
    const limits = usage.isPaidUser ? DOCUMENT_LIMITS.PAID : DOCUMENT_LIMITS.FREE;

    // Check monthly document limit
    if (usage.documentsThisMonth >= limits.documentsPerMonth) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.DOCUMENT_LIMIT_REACHED,
        errorMessage: `Monthly document limit reached (${limits.documentsPerMonth}/month). ${
          usage.isPaidUser ? 'Please wait for next billing cycle.' : 'Upgrade to Document Intelligence addon for 100 docs/month.'
        }`,
        upgradeRequired: !usage.isPaidUser,
      };
    }

    // Check file size limit
    if (fileSize > limits.maxFileSize) {
      return {
        canProceed: false,
        errorCode: ERROR_CODES.FILE_TOO_LARGE,
        errorMessage: `File size (${formatFileSize(fileSize)}) exceeds limit of ${limits.maxFileSizeMB}MB. ${
          usage.isPaidUser ? '' : 'Upgrade for 25MB file support.'
        }`,
        upgradeRequired: !usage.isPaidUser && fileSize <= DOCUMENT_LIMITS.PAID.maxFileSize,
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
  // OPERATION CHECKS
  // ==========================================

  /**
   * Check if user can perform an operation
   */
  async canPerformOperation(
    userId: string,
    operationType: OperationType
  ): Promise<LimitsEnforcementResult> {
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
    };
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