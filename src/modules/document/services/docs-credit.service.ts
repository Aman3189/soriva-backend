// src/modules/document/services/docs-credit.service.ts

/**
 * ==========================================
 * SORIVA DOC AI - TOKEN SERVICE
 * ==========================================
 * Created: December 23, 2025
 * Updated: January 31, 2026 - TOKEN-BASED SYSTEM
 * Author: Risenex Dynamics
 *
 * TOKEN SYSTEM:
 * - 1 Page = 5,000 tokens (estimated)
 * - AI: Mistral Large 3 (all operations)
 * - Separate pool from Chat tokens
 *
 * PLAN TOKENS (India / Intl):
 * - STARTER Trial: 25K / 50K
 * - STARTER Paid: 100K / 200K
 * - LITE: 200K / 400K
 * - PLUS: 400K / 800K
 * - PRO: 600K / 1.2M
 * - APEX: 850K / 1.7M
 *
 * BOOSTER: 750K @ ₹99 / $2.99
 * ==========================================
 */

import { prisma } from '@/config/prisma';
import { PlanType } from '@prisma/client';
import {
  SMART_DOCS_PLAN_TOKENS,
  SMART_DOCS_TOKEN_BOOSTER,
  SMART_DOCS_FEATURES,
  SmartDocsOperation,
  canPlanAccessOperation,
  hasPlanDocAIAccess,
} from '@/constants/smartDocsCredits';

// ==========================================
// CONSTANTS
// ==========================================

/** Tokens consumed per page of document */
const TOKENS_PER_PAGE = 5000;

// ==========================================
// TYPES
// ==========================================

export type MinimumPlanAccess = 'STARTER' | 'LITE' | 'PLUS' | 'PRO' | 'APEX';

export interface TokenBalance {
  monthlyTokens: number;
  tokensUsed: number;
  tokensRemaining: number;
  boosterTokens: number;
  totalAvailable: number;
  tokensUsedToday: number;
  percentageUsed: number;
  pagesRemaining: number;
}

export interface TokenDeductionResult {
  success: boolean;
  tokensDeducted: number;
  pagesProcessed: number;
  balanceAfter: TokenBalance;
  error?: string;
  errorCode?: string;
}

export interface TokenCheckResult {
  canProceed: boolean;
  tokensRequired: number;
  tokensAvailable: number;
  pagesCanProcess: number;
  error?: string;
  errorCode?: string;
  upgradeRequired?: boolean;
  suggestedPlan?: MinimumPlanAccess;
}

export interface BoosterPurchaseResult {
  success: boolean;
  boosterId: string;
  tokensAdded: number;
  newBalance: TokenBalance;
  error?: string;
}

// Legacy interfaces for backward compatibility
export interface CreditBalance extends TokenBalance {
  monthlyCredits: number;
  creditsUsed: number;
  creditsRemaining: number;
  bonusCredits: number;
  carriedForward: number;
  dailyLimit: number;
  dailyRemaining: number;
}

export interface CreditDeductionResult extends TokenDeductionResult {
  creditsDeducted: number;
  balanceAfter: CreditBalance;
}

// ==========================================
// ERROR MESSAGES
// ==========================================

const DOC_AI_ERRORS = {
  NO_ACCESS: () =>
    'Doc AI is not available on your plan. Upgrade to unlock!',
  FEATURE_LOCKED: (name: string, plan: string) =>
    `"${name}" requires ${plan} plan or higher.`,
  INSUFFICIENT_TOKENS: (needed: number, available: number) =>
    `Insufficient tokens. Need ${needed.toLocaleString()}, have ${available.toLocaleString()}.`,
  BOOSTER_LIMIT: (max: number) =>
    `Maximum ${max} boosters per month already purchased.`,
};

// ==========================================
// SERVICE CLASS
// ==========================================

export class DocsCreditService {
  // ==========================================
  // TOKEN BALANCE
  // ==========================================

  /**
   * Get user's Doc AI token balance
   */
  async getTokenBalance(userId: string): Promise<TokenBalance> {
    const record = await this.getOrCreateRecord(userId);
    await this.checkAndResetIfNeeded(userId);

    const updated = await prisma.smartDocsCredit.findUnique({
      where: { userId },
    });

    if (!updated) {
      throw new Error('Token record not found');
    }

    const tokensRemaining = Math.max(0, updated.monthlyTokens - updated.tokensUsedThisMonth);
    const totalAvailable = tokensRemaining + updated.boosterTokens;
    const percentageUsed = updated.monthlyTokens > 0
      ? Math.round((updated.tokensUsedThisMonth / updated.monthlyTokens) * 100)
      : 0;

    return {
      monthlyTokens: updated.monthlyTokens,
      tokensUsed: updated.tokensUsedThisMonth,
      tokensRemaining,
      boosterTokens: updated.boosterTokens,
      totalAvailable,
      tokensUsedToday: updated.tokensUsedToday,
      percentageUsed,
      pagesRemaining: Math.floor(totalAvailable / TOKENS_PER_PAGE),
    };
  }

  /**
   * Legacy: Get credit balance (maps to token balance)
   */
  async getCreditBalance(userId: string): Promise<CreditBalance> {
    const tokenBalance = await this.getTokenBalance(userId);

    return {
      ...tokenBalance,
      monthlyCredits: Math.floor(tokenBalance.monthlyTokens / TOKENS_PER_PAGE),
      creditsUsed: Math.floor(tokenBalance.tokensUsed / TOKENS_PER_PAGE),
      creditsRemaining: tokenBalance.pagesRemaining,
      bonusCredits: Math.floor(tokenBalance.boosterTokens / TOKENS_PER_PAGE),
      carriedForward: 0,
      dailyLimit: 999,
      dailyRemaining: tokenBalance.pagesRemaining,
    };
  }

  /**
   * Get or create token record
   */
  private async getOrCreateRecord(userId: string) {
    let record = await prisma.smartDocsCredit.findUnique({
      where: { userId },
    });

    if (!record) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, region: true, trialUsed: true },
      });

      const planType = user?.planType || PlanType.STARTER;
      const isIntl = user?.region === 'INTL';
      const isTrial = !user?.trialUsed && planType === PlanType.STARTER;

      const planConfig = SMART_DOCS_PLAN_TOKENS[planType];
      let monthlyTokens: number;

      if (isTrial && planConfig.monthlyTokensTrial) {
        monthlyTokens = isIntl
          ? (planConfig.monthlyTokensTrialInternational || planConfig.monthlyTokensTrial)
          : planConfig.monthlyTokensTrial;
      } else {
        monthlyTokens = isIntl
          ? planConfig.monthlyTokensInternational
          : planConfig.monthlyTokens;
      }

      const now = new Date();
      const cycleEnd = new Date(now);
      cycleEnd.setMonth(cycleEnd.getMonth() + 1);

      record = await prisma.smartDocsCredit.create({
        data: {
          userId,
          planType,
          monthlyTokens,
          tokensUsedThisMonth: 0,
          tokensUsedToday: 0,
          bonusTokens: 0,
          boosterTokens: 0,
          totalTokensUsed: 0,
          monthlyCredits: 0,
          creditsUsedThisMonth: 0,
          creditsUsedToday: 0,
          bonusCredits: 0,
          carriedForwardCredits: 0,
          totalCreditsUsed: 0,
          cycleStartDate: now,
          cycleEndDate: cycleEnd,
          lastDailyReset: now,
          lastMonthlyReset: now,
          boostersPurchasedThisMonth: 0,
          totalBoostersPurchased: 0,
        },
      });
    }

    return record;
  }

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
   * Convert PlanType to access string
   */
  private planToAccess(planType: PlanType): MinimumPlanAccess {
    switch (planType) {
      case PlanType.LITE: return 'LITE';
      case PlanType.PLUS: return 'PLUS';
      case PlanType.PRO: return 'PRO';
      case PlanType.APEX:
      case PlanType.SOVEREIGN: return 'APEX';
      default: return 'STARTER';
    }
  }

  /**
   * Check and reset if needed
   */
  private async checkAndResetIfNeeded(userId: string): Promise<void> {
    const record = await prisma.smartDocsCredit.findUnique({
      where: { userId },
    });

    if (!record) return;

    const now = new Date();
    const updates: Record<string, unknown> = {};

    // Monthly reset
    if (now >= record.cycleEndDate) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true, region: true },
      });

      const planType = user?.planType || PlanType.STARTER;
      const isIntl = user?.region === 'INTL';
      const planConfig = SMART_DOCS_PLAN_TOKENS[planType];

      const monthlyTokens = isIntl
        ? planConfig.monthlyTokensInternational
        : planConfig.monthlyTokens;

      const newCycleEnd = new Date(now);
      newCycleEnd.setMonth(newCycleEnd.getMonth() + 1);

      Object.assign(updates, {
        planType,
        monthlyTokens,
        tokensUsedThisMonth: 0,
        boosterTokens: 0,
        cycleStartDate: now,
        cycleEndDate: newCycleEnd,
        lastMonthlyReset: now,
        boostersPurchasedThisMonth: 0,
      });
    }

    // Daily reset
    const hoursSinceDaily = (now.getTime() - record.lastDailyReset.getTime()) / (1000 * 60 * 60);
    if (hoursSinceDaily >= 24) {
      Object.assign(updates, {
        tokensUsedToday: 0,
        lastDailyReset: now,
      });
    }

    if (Object.keys(updates).length > 0) {
      await prisma.smartDocsCredit.update({
        where: { userId },
        data: updates,
      });
    }
  }

  // ==========================================
  // TOKEN OPERATIONS
  // ==========================================

  /**
   * Check if user can perform operation
   */
  async canPerformOperation(
    userId: string,
    operation: string,
    pageCount: number = 1
  ): Promise<TokenCheckResult> {
    const planType = await this.getUserPlanType(userId);
    const plan = this.planToAccess(planType);

    // Check Doc AI access
    if (!hasPlanDocAIAccess(planType)) {
      return {
        canProceed: false,
        tokensRequired: 0,
        tokensAvailable: 0,
        pagesCanProcess: 0,
        error: DOC_AI_ERRORS.NO_ACCESS(),
        errorCode: 'NO_ACCESS',
        upgradeRequired: true,
        suggestedPlan: 'STARTER',
      };
    }

    // Check feature access
    const op = operation as SmartDocsOperation;
    if (!canPlanAccessOperation(planType, op)) {
      const feature = SMART_DOCS_FEATURES[op];
      return {
        canProceed: false,
        tokensRequired: 0,
        tokensAvailable: 0,
        pagesCanProcess: 0,
        error: DOC_AI_ERRORS.FEATURE_LOCKED(feature?.name || operation, feature?.minimumPlan || 'PLUS'),
        errorCode: 'FEATURE_LOCKED',
        upgradeRequired: true,
        suggestedPlan: (feature?.minimumPlan as MinimumPlanAccess) || 'PLUS',
      };
    }

    const tokenCost = pageCount * TOKENS_PER_PAGE;
    const balance = await this.getTokenBalance(userId);

    if (balance.totalAvailable < tokenCost) {
      return {
        canProceed: false,
        tokensRequired: tokenCost,
        tokensAvailable: balance.totalAvailable,
        pagesCanProcess: balance.pagesRemaining,
        error: DOC_AI_ERRORS.INSUFFICIENT_TOKENS(tokenCost, balance.totalAvailable),
        errorCode: 'INSUFFICIENT_TOKENS',
        upgradeRequired: true,
      };
    }

    return {
      canProceed: true,
      tokensRequired: tokenCost,
      tokensAvailable: balance.totalAvailable,
      pagesCanProcess: balance.pagesRemaining,
    };
  }

  /**
   * Deduct tokens for operation
   */
  async deductTokens(
    userId: string,
    operation: string,
    pageCount: number = 1,
    documentId?: string
  ): Promise<TokenDeductionResult> {
    const check = await this.canPerformOperation(userId, operation, pageCount);

    if (!check.canProceed) {
      return {
        success: false,
        tokensDeducted: 0,
        pagesProcessed: 0,
        balanceAfter: await this.getTokenBalance(userId),
        error: check.error,
        errorCode: check.errorCode,
      };
    }

    const tokenCost = pageCount * TOKENS_PER_PAGE;

    const record = await prisma.smartDocsCredit.findUnique({
      where: { userId },
    });

    if (!record) {
      return {
        success: false,
        tokensDeducted: 0,
        pagesProcessed: 0,
        balanceAfter: await this.getTokenBalance(userId),
        error: 'Record not found',
        errorCode: 'NOT_FOUND',
      };
    }

    // Deduct from booster first, then monthly
    let remaining = tokenCost;
    let boosterUsed = 0;
    let monthlyUsed = 0;

    if (record.boosterTokens > 0) {
      boosterUsed = Math.min(record.boosterTokens, remaining);
      remaining -= boosterUsed;
    }

    if (remaining > 0) {
      monthlyUsed = remaining;
    }

    // Update record
    await prisma.smartDocsCredit.update({
      where: { userId },
      data: {
        boosterTokens: record.boosterTokens - boosterUsed,
        tokensUsedThisMonth: record.tokensUsedThisMonth + monthlyUsed,
        tokensUsedToday: record.tokensUsedToday + tokenCost,
        totalTokensUsed: record.totalTokensUsed + tokenCost,
        lastOperationAt: new Date(),
      },
    });

    // Log transaction
    const feature = SMART_DOCS_FEATURES[operation as SmartDocsOperation];
    
    // Validate documentId exists before logging (prevent FK constraint violation)
    let validDocumentId: string | null = null;
    if (documentId) {
      const documentExists = await prisma.document.findUnique({
        where: { id: documentId },
        select: { id: true },
      });
      validDocumentId = documentExists ? documentId : null;
    }
    
    await prisma.smartDocsCreditLog.create({
      data: {
        userId,
        operation,
        operationName: feature?.name || operation,
        pageCount,
        tokensDeducted: tokenCost,
        inputTokens: Math.floor(tokenCost * 0.8),
        outputTokens: Math.floor(tokenCost * 0.2),
        boosterTokensUsed: boosterUsed,
        monthlyTokensUsed: monthlyUsed,
        bonusTokensUsed: 0,
        creditTier: 0,
        creditsDeducted: pageCount,
        bonusCreditsUsed: 0,
        carriedCreditsUsed: 0,
        monthlyCreditsUsed: 0,
        documentId: validDocumentId,
        aiProvider: 'mistral',
        aiModel: 'mistral-large-3-2512',
      },
    });

    console.log(`✅ Doc AI: ${tokenCost.toLocaleString()} tokens (${pageCount} pages) - ${operation}`);

    return {
      success: true,
      tokensDeducted: tokenCost,
      pagesProcessed: pageCount,
      balanceAfter: await this.getTokenBalance(userId),
    };
  }

  /**
   * Legacy: Deduct credits (calls deductTokens)
   */
  async deductCredits(
    userId: string,
    operation: string,
    documentId?: string,
    _region: string = 'IN'
  ): Promise<CreditDeductionResult> {
    const result = await this.deductTokens(userId, operation, 1, documentId);
    const creditBalance = await this.getCreditBalance(userId);

    return {
      ...result,
      creditsDeducted: result.pagesProcessed,
      balanceAfter: creditBalance,
    };
  }

  // ==========================================
  // BOOSTER
  // ==========================================

  /**
   * Purchase Doc AI booster
   */
  async purchaseBooster(userId: string): Promise<BoosterPurchaseResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { region: true, planType: true },
    });

    if (!hasPlanDocAIAccess(user?.planType || PlanType.STARTER)) {
      return {
        success: false,
        boosterId: 'DOC_AI_BOOSTER',
        tokensAdded: 0,
        newBalance: await this.getTokenBalance(userId),
        error: DOC_AI_ERRORS.NO_ACCESS(),
      };
    }

    const isIntl = user?.region === 'INTL';
    const record = await this.getOrCreateRecord(userId);
    const maxPerMonth = SMART_DOCS_TOKEN_BOOSTER.maxPerMonth;

    if (record.boostersPurchasedThisMonth >= maxPerMonth) {
      return {
        success: false,
        boosterId: 'DOC_AI_BOOSTER',
        tokensAdded: 0,
        newBalance: await this.getTokenBalance(userId),
        error: DOC_AI_ERRORS.BOOSTER_LIMIT(maxPerMonth),
      };
    }

    const tokensToAdd = isIntl
      ? SMART_DOCS_TOKEN_BOOSTER.tokensAddedInternational
      : SMART_DOCS_TOKEN_BOOSTER.tokensAdded;

    const price = isIntl
      ? SMART_DOCS_TOKEN_BOOSTER.priceUSD
      : SMART_DOCS_TOKEN_BOOSTER.price;

    await prisma.smartDocsCredit.update({
      where: { userId },
      data: {
        boosterTokens: record.boosterTokens + tokensToAdd,
        boostersPurchasedThisMonth: record.boostersPurchasedThisMonth + 1,
        totalBoostersPurchased: record.totalBoostersPurchased + 1,
      },
    });

    await prisma.smartDocsBoosterPurchase.create({
      data: {
        userId,
        boosterId: 'DOC_AI_BOOSTER',
        boosterName: SMART_DOCS_TOKEN_BOOSTER.name,
        tokensAdded: tokensToAdd,
        creditsAdded: 0,
        priceINR: isIntl ? price * 83.7 : price,
        priceUSD: isIntl ? price : price / 83.7,
        validUntil: new Date(Date.now() + SMART_DOCS_TOKEN_BOOSTER.validity * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`✅ Doc AI Booster: +${tokensToAdd.toLocaleString()} tokens for ${userId}`);

    return {
      success: true,
      boosterId: 'DOC_AI_BOOSTER',
      tokensAdded: tokensToAdd,
      newBalance: await this.getTokenBalance(userId),
    };
  }

  /**
   * Get booster info
   */
  async getBoosterInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { region: true, planType: true },
    });

    const isIntl = user?.region === 'INTL';
    const record = await this.getOrCreateRecord(userId);
    const hasAccess = hasPlanDocAIAccess(user?.planType || PlanType.STARTER);

    return {
      available: hasAccess,
      booster: {
        id: SMART_DOCS_TOKEN_BOOSTER.id,
        name: SMART_DOCS_TOKEN_BOOSTER.name,
        description: SMART_DOCS_TOKEN_BOOSTER.description,
        tokens: isIntl
          ? SMART_DOCS_TOKEN_BOOSTER.tokensAddedInternational
          : SMART_DOCS_TOKEN_BOOSTER.tokensAdded,
        price: isIntl
          ? SMART_DOCS_TOKEN_BOOSTER.priceUSD
          : SMART_DOCS_TOKEN_BOOSTER.price,
        currency: isIntl ? 'USD' : 'INR',
        validity: SMART_DOCS_TOKEN_BOOSTER.validity,
        maxPerMonth: SMART_DOCS_TOKEN_BOOSTER.maxPerMonth,
      },
      purchasedThisMonth: record.boostersPurchasedThisMonth,
      canPurchase: record.boostersPurchasedThisMonth < SMART_DOCS_TOKEN_BOOSTER.maxPerMonth,
      remaining: SMART_DOCS_TOKEN_BOOSTER.maxPerMonth - record.boostersPurchasedThisMonth,
    };
  }

  /**
   * Legacy: Get available boosters
   */
  async getAvailableBoosters(userId: string) {
    return this.getBoosterInfo(userId);
  }

  // ==========================================
  // STATS & SUMMARY
  // ==========================================

  /**
   * Get usage stats
   */
  async getUsageStats(userId: string, period: 'day' | 'week' | 'month' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const breakdown = await prisma.smartDocsCreditLog.groupBy({
      by: ['operation', 'operationName'],
      where: { userId, createdAt: { gte: startDate } },
      _count: { operation: true },
      _sum: { tokensDeducted: true, pageCount: true },
      orderBy: { _sum: { tokensDeducted: 'desc' } },
    });

    const logs = await prisma.smartDocsCreditLog.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true, tokensDeducted: true, pageCount: true },
    });

    const dailyMap: Record<string, { tokens: number; pages: number; count: number }> = {};
    logs.forEach((log) => {
      const dateKey = log.createdAt.toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { tokens: 0, pages: 0, count: 0 };
      }
      dailyMap[dateKey].tokens += log.tokensDeducted || 0;
      dailyMap[dateKey].pages += log.pageCount || 0;
      dailyMap[dateKey].count += 1;
    });

    return {
      period,
      totalTokensUsed: logs.reduce((s, l) => s + (l.tokensDeducted || 0), 0),
      totalPages: logs.reduce((s, l) => s + (l.pageCount || 0), 0),
      operationBreakdown: breakdown.map((b) => ({
        operation: b.operation,
        operationName: b.operationName || 'Unknown',
        count: b._count.operation,
        tokensUsed: b._sum.tokensDeducted || 0,
        pages: b._sum.pageCount || 0,
      })),
      dailyUsage: Object.entries(dailyMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  /**
   * Get summary for dashboard
   */
  async getSummary(userId: string) {
    const balance = await this.getTokenBalance(userId);
    const planType = await this.getUserPlanType(userId);
    const boosterInfo = await this.getBoosterInfo(userId);

    const record = await prisma.smartDocsCredit.findUnique({
      where: { userId },
    });

    if (!record) throw new Error('Record not found');

    const recentOps = await prisma.smartDocsCreditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        operation: true,
        operationName: true,
        tokensDeducted: true,
        pageCount: true,
        createdAt: true,
      },
    });

    return {
      balance,
      planType,
      hasAccess: hasPlanDocAIAccess(planType),
      cycle: {
        start: record.cycleStartDate,
        end: record.cycleEndDate,
        daysRemaining: Math.max(0, Math.ceil(
          (record.cycleEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )),
      },
      lifetime: {
        totalTokensUsed: record.totalTokensUsed,
        totalBoosters: record.totalBoostersPurchased,
      },
      recentOps,
      booster: boosterInfo,
    };
  }

  /**
   * Legacy: Get credit summary
   */
  async getCreditSummary(userId: string) {
    return this.getSummary(userId);
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  /**
   * Check if user has tokens
   */
  async hasTokens(userId: string, tokensNeeded: number): Promise<boolean> {
    const balance = await this.getTokenBalance(userId);
    return balance.totalAvailable >= tokensNeeded;
  }

  /**
   * Legacy: Check if user has credits
   */
  async hasCredits(userId: string, creditsNeeded: number): Promise<boolean> {
    return this.hasTokens(userId, creditsNeeded * TOKENS_PER_PAGE);
  }

  /**
   * Can process pages
   */
  async canProcessPages(userId: string, pageCount: number): Promise<boolean> {
    return this.hasTokens(userId, pageCount * TOKENS_PER_PAGE);
  }

  /**
   * Estimate pages remaining
   */
  async estimatePages(userId: string): Promise<number> {
    const balance = await this.getTokenBalance(userId);
    return balance.pagesRemaining;
  }

  /**
   * Get affordable operations
   */
  async getAffordableOperations(userId: string): Promise<string[]> {
    const planType = await this.getUserPlanType(userId);
    const balance = await this.getTokenBalance(userId);

    if (!hasPlanDocAIAccess(planType)) return [];

    return Object.values(SMART_DOCS_FEATURES)
      .filter((f) => {
        if (!canPlanAccessOperation(planType, f.id)) return false;
        if (balance.totalAvailable < TOKENS_PER_PAGE) return false;
        return true;
      })
      .map((f) => f.id);
  }

  /**
   * Sync plan tokens after upgrade/downgrade
   */
  async syncPlanTokens(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true, region: true, trialUsed: true },
    });

    if (!user) return;

    const planConfig = SMART_DOCS_PLAN_TOKENS[user.planType];
    const isIntl = user.region === 'INTL';
    const isTrial = !user.trialUsed && user.planType === PlanType.STARTER;

    let monthlyTokens: number;
    if (isTrial && planConfig.monthlyTokensTrial) {
      monthlyTokens = isIntl
        ? (planConfig.monthlyTokensTrialInternational || planConfig.monthlyTokensTrial)
        : planConfig.monthlyTokensTrial;
    } else {
      monthlyTokens = isIntl
        ? planConfig.monthlyTokensInternational
        : planConfig.monthlyTokens;
    }

    await prisma.smartDocsCredit.updateMany({
      where: { userId },
      data: { planType: user.planType, monthlyTokens },
    });

    console.log(`✅ Doc AI Sync: ${user.planType} - ${monthlyTokens.toLocaleString()} tokens`);
  }

  /**
   * Legacy: Sync with plan
   */
  async syncWithPlan(userId: string): Promise<void> {
    return this.syncPlanTokens(userId);
  }

  /**
   * Reset tokens (admin)
   */
  async resetTokens(userId: string): Promise<TokenBalance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true, region: true },
    });

    const planType = user?.planType || PlanType.STARTER;
    const isIntl = user?.region === 'INTL';
    const planConfig = SMART_DOCS_PLAN_TOKENS[planType];

    const monthlyTokens = isIntl
      ? planConfig.monthlyTokensInternational
      : planConfig.monthlyTokens;

    const now = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    await prisma.smartDocsCredit.update({
      where: { userId },
      data: {
        monthlyTokens,
        tokensUsedThisMonth: 0,
        tokensUsedToday: 0,
        boosterTokens: 0,
        cycleStartDate: now,
        cycleEndDate: cycleEnd,
        lastDailyReset: now,
        lastMonthlyReset: now,
        boostersPurchasedThisMonth: 0,
      },
    });

    return this.getTokenBalance(userId);
  }

  /**
   * Legacy: Reset credits
   */
  async resetCredits(userId: string): Promise<CreditBalance> {
    await this.resetTokens(userId);
    return this.getCreditBalance(userId);
  }
}

// ==========================================
// EXPORT
// ==========================================

const docsCreditService = new DocsCreditService();
export default docsCreditService;
export { docsCreditService };