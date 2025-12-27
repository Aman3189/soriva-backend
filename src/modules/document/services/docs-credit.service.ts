// src/modules/document/services/docs-credit.service.ts

/**
 * ==========================================
 * SMART DOCS CREDIT SERVICE
 * ==========================================
 * Created: December 23, 2025
 * Updated: December 28, 2025 - TOKEN POOL INTEGRATION 🔥
 * Author: Risenex Dynamics
 * 
 * RESPONSIBILITIES:
 * - Credit balance management (TRACKING)
 * - Credit deduction for operations (LIMITS)
 * - 🆕 Token Pool deduction (ACTUAL AI COST)
 * - Booster purchase handling
 * - Daily/Monthly limit enforcement
 * - Credit carry-forward logic
 * - Usage analytics
 * 
 * INTEGRATES WITH:
 * - smart-docs.ts (NEW constants)
 * - document-intelligence.service.ts (main orchestrator)
 * - 🆕 usage.service.ts (Token Pool)
 * - Prisma (database)
 * 
 * KEY CONCEPT:
 * Credits = User-facing limits & tracking
 * Tokens = Actual AI cost (from same pool as Chat)
 * 
 * LAUNCH: January 31, 2026
 * ==========================================
 */

import { prisma } from '@/config/prisma';
import { PlanType } from '@prisma/client';
import {
  SMART_DOCS_OPERATIONS,
  SMART_DOCS_MONTHLY_CREDITS,
  SMART_DOCS_PACKS,
  getSmartDocsConfig,
  canAccessSmartDocsFeature,
  type MinimumPlan,
  type RegionCode,
} from '@/constants/smart-docs';

// ==========================================
// 🆕 TOKEN POOL INTEGRATION
// ==========================================
// Smart Docs uses SAME token pool as Chat
// Credits = Tracking/Limits | Tokens = Actual AI Cost
import usageService from '@/modules/billing/usage.service';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface CreditBalance {
  /** Base monthly credits from plan */
  monthlyCredits: number;
  /** Credits used this month */
  creditsUsed: number;
  /** Credits remaining this month */
  creditsRemaining: number;
  /** Bonus credits from boosters/packs */
  bonusCredits: number;
  /** Carried forward from last month */
  carriedForward: number;
  /** Total available (remaining + bonus + carried) */
  totalAvailable: number;
  /** Credits used today */
  creditsUsedToday: number;
  /** Daily limit */
  dailyLimit: number;
  /** Daily remaining */
  dailyRemaining: number;
  /** Percentage used this month */
  percentageUsed: number;
}

export interface CreditDeductionResult {
  success: boolean;
  creditsDeducted: number;
  /** 🆕 Tokens deducted from main pool */
  tokensDeducted: number;
  balanceAfter: CreditBalance;
  error?: string;
  errorCode?: string;
}

export interface CreditCheckResult {
  canProceed: boolean;
  creditsRequired: number;
  creditsAvailable: number;
  /** 🆕 Tokens that will be used */
  tokensRequired?: number;
  error?: string;
  errorCode?: string;
  upgradeRequired?: boolean;
  suggestedPlan?: MinimumPlan;
}

export interface PackPurchaseResult {
  success: boolean;
  packId: string;
  creditsAdded: number;
  newBalance: CreditBalance;
  error?: string;
}

export interface CreditUsageStats {
  period: 'day' | 'week' | 'month';
  totalCreditsUsed: number;
  /** 🆕 Track token usage too */
  totalTokensUsed: number;
  operationBreakdown: Array<{
    operation: string;
    operationName: string;
    count: number;
    creditsUsed: number;
    tokensUsed: number;
  }>;
  dailyUsage: Array<{
    date: string;
    creditsUsed: number;
    tokensUsed: number;
    operationCount: number;
  }>;
  topOperations: Array<{
    operation: string;
    operationName: string;
    count: number;
  }>;
}

// ==========================================
// DAILY LIMITS (as % of monthly)
// ==========================================

const DAILY_LIMIT_PERCENTAGE: Record<MinimumPlan, number> = {
  STARTER: 20,   // 6 credits/day (30 * 0.20)
  PLUS: 15,      // 15 credits/day (100 * 0.15)
  PRO: 12,       // 24 credits/day (200 * 0.12)
  APEX: 10,      // 35 credits/day (350 * 0.10)
};

function getDailyLimit(plan: MinimumPlan): number {
  const monthly = SMART_DOCS_MONTHLY_CREDITS[plan];
  const percentage = DAILY_LIMIT_PERCENTAGE[plan];
  return Math.ceil(monthly * (percentage / 100));
}

// ==========================================
// 🆕 TOKEN COST MULTIPLIER
// ==========================================
// 1 Credit ≈ 800 Tokens (average)
// But we use actual token cost from config when available

const DEFAULT_TOKENS_PER_CREDIT = 800;

// ==========================================
// ERROR MESSAGES
// ==========================================

const SMART_DOCS_ERRORS = {
  FEATURE_LOCKED: (name: string, requiredPlan: string) => 
    `${name} is locked. Upgrade to ${requiredPlan} to unlock.`,
  INSUFFICIENT_CREDITS: (needed: number, available: number) => 
    `Insufficient credits. Need ${needed}, have ${available}.`,
  INSUFFICIENT_TOKENS: (needed: number, available: number) => 
    `Insufficient tokens in pool. Need ${needed}, have ${available}.`,
  DAILY_LIMIT_REACHED: (limit: number) => 
    `Daily limit of ${limit} credits reached. Resets at midnight.`,
  PACK_LIMIT_REACHED: (max: number) => 
    `Maximum ${max} packs can be purchased per month.`,
};

// ==========================================
// DOCS CREDIT SERVICE CLASS
// ==========================================

export class DocsCreditService {
  
  // ==========================================
  // CREDIT BALANCE MANAGEMENT
  // ==========================================

  /**
   * Get user's current credit balance
   */
  async getCreditBalance(userId: string): Promise<CreditBalance> {
    // Get or create credit record
    const creditRecord = await this.getOrCreateCreditRecord(userId);
    const planType = await this.getUserPlanType(userId);
    const plan = this.planTypeToPlan(planType);
    const monthlyCredits = SMART_DOCS_MONTHLY_CREDITS[plan];
    const dailyLimit = getDailyLimit(plan);

    // Check and reset if needed
    await this.checkAndResetIfNeeded(userId);

    // Recalculate after potential reset
    const updatedRecord = await prisma.smartDocsCredit.findUnique({
      where: { userId },
    });

    if (!updatedRecord) {
      throw new Error('Credit record not found after reset check');
    }

    const creditsRemaining = Math.max(0, updatedRecord.monthlyCredits - updatedRecord.creditsUsedThisMonth);
    const totalAvailable = creditsRemaining + updatedRecord.bonusCredits + updatedRecord.carriedForwardCredits;
    const dailyRemaining = Math.max(0, dailyLimit - updatedRecord.creditsUsedToday);
    const percentageUsed = updatedRecord.monthlyCredits > 0 
      ? Math.round((updatedRecord.creditsUsedThisMonth / updatedRecord.monthlyCredits) * 100)
      : 0;

    return {
      monthlyCredits: updatedRecord.monthlyCredits,
      creditsUsed: updatedRecord.creditsUsedThisMonth,
      creditsRemaining,
      bonusCredits: updatedRecord.bonusCredits,
      carriedForward: updatedRecord.carriedForwardCredits,
      totalAvailable,
      creditsUsedToday: updatedRecord.creditsUsedToday,
      dailyLimit,
      dailyRemaining,
      percentageUsed,
    };
  }

  /**
   * Convert PlanType enum to MinimumPlan string
   * SOVEREIGN = Founder Mode (maps to APEX with unlimited)
   */
  private planTypeToPlan(planType: PlanType): MinimumPlan {
    switch (planType) {
      case PlanType.PLUS:
        return 'PLUS';
      case PlanType.PRO:
        return 'PRO';
      case PlanType.APEX:
      case PlanType.SOVEREIGN: // Founder Mode - maps to APEX
        return 'APEX';
      case PlanType.STARTER:
      default:
        return 'STARTER';
    }
  }

  /**
   * Get or create credit record for user
   */
  private async getOrCreateCreditRecord(userId: string) {
    let creditRecord = await prisma.smartDocsCredit.findUnique({
      where: { userId },
    });

    if (!creditRecord) {
      const planType = await this.getUserPlanType(userId);
      const plan = this.planTypeToPlan(planType);
      const monthlyCredits = SMART_DOCS_MONTHLY_CREDITS[plan];
      const now = new Date();
      const cycleEnd = new Date(now);
      cycleEnd.setMonth(cycleEnd.getMonth() + 1);

      creditRecord = await prisma.smartDocsCredit.create({
        data: {
          userId,
          planType,
          monthlyCredits,
          creditsUsedThisMonth: 0,
          creditsUsedToday: 0,
          bonusCredits: 0,
          carriedForwardCredits: 0,
          cycleStartDate: now,
          cycleEndDate: cycleEnd,
          lastDailyReset: now,
          lastMonthlyReset: now,
          boostersPurchasedThisMonth: 0,
        },
      });
    }

    return creditRecord;
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
   * Check and reset credits if needed (daily/monthly)
   */
  private async checkAndResetIfNeeded(userId: string): Promise<void> {
    const creditRecord = await prisma.smartDocsCredit.findUnique({
      where: { userId },
    });

    if (!creditRecord) return;

    const now = new Date();
    const updates: Record<string, unknown> = {};

    // Check MONTHLY reset
    if (now >= creditRecord.cycleEndDate) {
      const planType = await this.getUserPlanType(userId);
      const plan = this.planTypeToPlan(planType);
      const monthlyCredits = SMART_DOCS_MONTHLY_CREDITS[plan];
      
      // Calculate carry-forward (25% of unused)
      const unused = creditRecord.monthlyCredits - creditRecord.creditsUsedThisMonth;
      const carryForward = Math.floor(unused * 0.25);

      const newCycleEnd = new Date(now);
      newCycleEnd.setMonth(newCycleEnd.getMonth() + 1);

      Object.assign(updates, {
        monthlyCredits,
        creditsUsedThisMonth: 0,
        carriedForwardCredits: carryForward,
        cycleStartDate: now,
        cycleEndDate: newCycleEnd,
        lastMonthlyReset: now,
        boostersPurchasedThisMonth: 0,
      });
    }

    // Check DAILY reset
    const hoursSinceDaily = (now.getTime() - creditRecord.lastDailyReset.getTime()) / (1000 * 60 * 60);
    if (hoursSinceDaily >= 24) {
      Object.assign(updates, {
        creditsUsedToday: 0,
        lastDailyReset: now,
      });
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      await prisma.smartDocsCredit.update({
        where: { userId },
        data: updates,
      });
    }
  }

  // ==========================================
  // CREDIT CHECK & DEDUCTION
  // ==========================================

  /**
   * Check if user can perform an operation
   * 🆕 Now also checks token pool availability
   */
  async canPerformOperation(
    userId: string,
    operation: string,
    region: RegionCode = 'IN'
  ): Promise<CreditCheckResult> {
    // Get user's plan
    const planType = await this.getUserPlanType(userId);
    const plan = this.planTypeToPlan(planType);
    const config = getSmartDocsConfig(operation, region);

    // 🆕 Calculate token cost
    const tokenCost = config.tokens || (config.credits * DEFAULT_TOKENS_PER_CREDIT);

    // Check plan access first
    if (!canAccessSmartDocsFeature(plan, operation)) {
      return {
        canProceed: false,
        creditsRequired: config.credits,
        creditsAvailable: 0,
        tokensRequired: tokenCost,
        error: SMART_DOCS_ERRORS.FEATURE_LOCKED(config.displayName, config.minimumPlan),
        errorCode: 'FEATURE_LOCKED',
        upgradeRequired: true,
        suggestedPlan: config.minimumPlan,
      };
    }

    // Get credit balance
    const balance = await this.getCreditBalance(userId);
    const creditCost = config.credits;

    // Check daily limit
    if (balance.dailyRemaining < creditCost) {
      return {
        canProceed: false,
        creditsRequired: creditCost,
        creditsAvailable: balance.dailyRemaining,
        tokensRequired: tokenCost,
        error: SMART_DOCS_ERRORS.DAILY_LIMIT_REACHED(balance.dailyLimit),
        errorCode: 'DAILY_LIMIT_REACHED',
        upgradeRequired: plan !== 'APEX',
      };
    }

    // Check total available credits
    if (balance.totalAvailable < creditCost) {
      return {
        canProceed: false,
        creditsRequired: creditCost,
        creditsAvailable: balance.totalAvailable,
        tokensRequired: tokenCost,
        error: SMART_DOCS_ERRORS.INSUFFICIENT_CREDITS(creditCost, balance.totalAvailable),
        errorCode: 'INSUFFICIENT_CREDITS',
        upgradeRequired: true,
      };
    }

    // 🆕 Check token pool availability
    const tokenPools = await usageService.getTokenPools(userId);
    const totalTokensAvailable = tokenPools.premium.remaining + tokenPools.bonus.remaining;
    
    if (totalTokensAvailable < tokenCost) {
      return {
        canProceed: false,
        creditsRequired: creditCost,
        creditsAvailable: balance.totalAvailable,
        tokensRequired: tokenCost,
        error: SMART_DOCS_ERRORS.INSUFFICIENT_TOKENS(tokenCost, totalTokensAvailable),
        errorCode: 'INSUFFICIENT_TOKENS',
        upgradeRequired: true,
      };
    }

    return {
      canProceed: true,
      creditsRequired: creditCost,
      creditsAvailable: balance.totalAvailable,
      tokensRequired: tokenCost,
    };
  }

  /**
   * Deduct credits for an operation
   * 🆕 Now also deducts from token pool!
   */
  async deductCredits(
    userId: string,
    operation: string,
    documentId?: string,
    region: RegionCode = 'IN'
  ): Promise<CreditDeductionResult> {
    // First check if operation is allowed
    const check = await this.canPerformOperation(userId, operation, region);
    
    if (!check.canProceed) {
      return {
        success: false,
        creditsDeducted: 0,
        tokensDeducted: 0,
        balanceAfter: await this.getCreditBalance(userId),
        error: check.error,
        errorCode: check.errorCode,
      };
    }

    const config = getSmartDocsConfig(operation, region);
    const creditCost = config.credits;
    
    // 🆕 Calculate token cost from config or default
    const tokenCost = config.tokens || (creditCost * DEFAULT_TOKENS_PER_CREDIT);

    const creditRecord = await prisma.smartDocsCredit.findUnique({
      where: { userId },
    });

    if (!creditRecord) {
      return {
        success: false,
        creditsDeducted: 0,
        tokensDeducted: 0,
        balanceAfter: await this.getCreditBalance(userId),
        error: 'Credit record not found',
        errorCode: 'RECORD_NOT_FOUND',
      };
    }

    // Deduction priority: Bonus → CarriedForward → Monthly
    let remainingToDeduct = creditCost;
    let bonusDeducted = 0;
    let carriedDeducted = 0;
    let monthlyDeducted = 0;

    // 1. Deduct from bonus first
    if (creditRecord.bonusCredits > 0 && remainingToDeduct > 0) {
      bonusDeducted = Math.min(creditRecord.bonusCredits, remainingToDeduct);
      remainingToDeduct -= bonusDeducted;
    }

    // 2. Deduct from carried forward
    if (creditRecord.carriedForwardCredits > 0 && remainingToDeduct > 0) {
      carriedDeducted = Math.min(creditRecord.carriedForwardCredits, remainingToDeduct);
      remainingToDeduct -= carriedDeducted;
    }

    // 3. Deduct from monthly
    if (remainingToDeduct > 0) {
      monthlyDeducted = remainingToDeduct;
    }

    // Update credit record (for tracking/limits)
    await prisma.smartDocsCredit.update({
      where: { userId },
      data: {
        bonusCredits: creditRecord.bonusCredits - bonusDeducted,
        carriedForwardCredits: creditRecord.carriedForwardCredits - carriedDeducted,
        creditsUsedThisMonth: creditRecord.creditsUsedThisMonth + monthlyDeducted,
        creditsUsedToday: creditRecord.creditsUsedToday + creditCost,
        totalCreditsUsed: creditRecord.totalCreditsUsed + creditCost,
        lastOperationAt: new Date(),
      },
    });

    // ==========================================
    // 🆕 TOKEN POOL DEDUCTION - THE KEY CHANGE!
    // ==========================================
    // This is where actual AI cost is tracked
    // Credits = User-facing limits
    // Tokens = Real AI consumption from shared pool
    
    let tokensDeducted = 0;
    try {
      // Determine which pool to use (premium first, then bonus)
      const tokenPools = await usageService.getTokenPools(userId);
      const usePool = tokenPools.premium.remaining >= tokenCost ? 'premium' : 'bonus';
      
      // Deduct tokens from the pool
      const tokenResult = await usageService.deductTokens(userId, tokenCost, usePool);
      
      if (tokenResult.success) {
        tokensDeducted = tokenCost;
        console.log(`✅ Smart Docs: Deducted ${tokenCost} tokens from ${usePool} pool for ${operation}`);
      } else {
        console.warn(`⚠️ Smart Docs: Token deduction failed but credits were deducted`);
      }
    } catch (tokenError) {
      // Log error but don't fail the operation
      // Credits are already deducted, token deduction is secondary
      console.error(`❌ Smart Docs: Token deduction error:`, tokenError);
    }

    // Log the transaction (now includes tokens)
    await this.logCreditTransaction(userId, {
      operation,
      creditsDeducted: creditCost,
      tokensDeducted,
      bonusDeducted,
      carriedDeducted,
      monthlyDeducted,
      documentId,
      config,
    });

    // Get updated balance
    const newBalance = await this.getCreditBalance(userId);

    return {
      success: true,
      creditsDeducted: creditCost,
      tokensDeducted,
      balanceAfter: newBalance,
    };
  }

  /**
   * Log credit transaction for analytics
   * 🆕 Now tracks token usage too
   * NOTE: tokensDeducted field needs to be added to SmartDocsCreditLog schema
   */
  private async logCreditTransaction(
    userId: string,
    data: {
      operation: string;
      creditsDeducted: number;
      tokensDeducted: number;
      bonusDeducted: number;
      carriedDeducted: number;
      monthlyDeducted: number;
      documentId?: string;
      config: ReturnType<typeof getSmartDocsConfig>;
    }
  ): Promise<void> {
    await prisma.smartDocsCreditLog.create({
      data: {
        userId,
        operation: data.operation,
        operationName: data.config.displayName,
        creditsDeducted: data.creditsDeducted,
        // 🆕 tokensDeducted - uncomment after adding field to schema:
        // tokensDeducted: data.tokensDeducted,
        creditTier: data.creditsDeducted,
        bonusCreditsUsed: data.bonusDeducted,
        carriedCreditsUsed: data.carriedDeducted,
        monthlyCreditsUsed: data.monthlyDeducted,
        documentId: data.documentId,
        aiProvider: data.config.provider,
        aiModel: data.config.model,
      },
    });
  }

  // ==========================================
  // STANDALONE PACK MANAGEMENT
  // ==========================================

  /**
   * Purchase a standalone Smart Docs pack
   */
  async purchaseBooster(
    userId: string,
    packId: string
  ): Promise<PackPurchaseResult> {
    // Get user's region
    const region = await this.getUserRegion(userId);
    const packs = SMART_DOCS_PACKS[region];
    const pack = packs.find(p => p.id === packId);
    
    if (!pack) {
      return {
        success: false,
        packId,
        creditsAdded: 0,
        newBalance: await this.getCreditBalance(userId),
        error: 'Invalid pack ID',
      };
    }

    // Check purchase limit (max 2 per month)
    const creditRecord = await this.getOrCreateCreditRecord(userId);
    const maxPerMonth = 2;
    
    if (creditRecord.boostersPurchasedThisMonth >= maxPerMonth) {
      return {
        success: false,
        packId,
        creditsAdded: 0,
        newBalance: await this.getCreditBalance(userId),
        error: SMART_DOCS_ERRORS.PACK_LIMIT_REACHED(maxPerMonth),
      };
    }

    // Add bonus credits
    await prisma.smartDocsCredit.update({
      where: { userId },
      data: {
        bonusCredits: creditRecord.bonusCredits + pack.credits,
        boostersPurchasedThisMonth: creditRecord.boostersPurchasedThisMonth + 1,
        totalBoostersPurchased: creditRecord.totalBoostersPurchased + 1,
      },
    });

    // Log pack purchase
    await prisma.smartDocsBoosterPurchase.create({
      data: {
        userId,
        boosterId: packId,
        boosterName: pack.name,
        creditsAdded: pack.credits,
        priceINR: region === 'IN' ? pack.price : pack.price * 89.37,
        priceUSD: region === 'INTL' ? pack.price : pack.price / 89.37,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    const newBalance = await this.getCreditBalance(userId);

    return {
      success: true,
      packId,
      creditsAdded: pack.credits,
      newBalance,
    };
  }

  /**
   * Get user's region
   */
  private async getUserRegion(userId: string): Promise<RegionCode> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { country: true },
    });
    return user?.country === 'IN' ? 'IN' : 'INTL';
  }

  /**
   * Get available packs for user
   */
  async getAvailableBoosters(userId: string) {
    const region = await this.getUserRegion(userId);
    const creditRecord = await this.getOrCreateCreditRecord(userId);
    const packs = SMART_DOCS_PACKS[region];
    const maxPerMonth = 2;

    const remainingPurchases = maxPerMonth - creditRecord.boostersPurchasedThisMonth;

    return {
      available: remainingPurchases > 0,
      reason: remainingPurchases > 0 
        ? `${remainingPurchases} pack(s) available this month`
        : 'Monthly pack limit reached',
      packs: packs.map(pack => ({
        ...pack,
        remainingPurchases,
        canPurchase: remainingPurchases > 0,
      })),
      region,
    };
  }

  // ==========================================
  // PLAN SYNC & MANAGEMENT
  // ==========================================

  /**
   * Sync credits when user upgrades/downgrades plan
   */
  async syncWithPlan(userId: string): Promise<void> {
    const planType = await this.getUserPlanType(userId);
    const plan = this.planTypeToPlan(planType);
    const monthlyCredits = SMART_DOCS_MONTHLY_CREDITS[plan];

    const creditRecord = await this.getOrCreateCreditRecord(userId);

    await prisma.smartDocsCredit.update({
      where: { userId },
      data: {
        planType,
        monthlyCredits,
        // Cap used credits if downgrading
        creditsUsedThisMonth: Math.min(creditRecord.creditsUsedThisMonth, monthlyCredits),
      },
    });
  }

  /**
   * Reset credits (admin function)
   */
  async resetCredits(userId: string): Promise<CreditBalance> {
    const planType = await this.getUserPlanType(userId);
    const plan = this.planTypeToPlan(planType);
    const monthlyCredits = SMART_DOCS_MONTHLY_CREDITS[plan];
    const now = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    await prisma.smartDocsCredit.update({
      where: { userId },
      data: {
        monthlyCredits,
        creditsUsedThisMonth: 0,
        creditsUsedToday: 0,
        bonusCredits: 0,
        carriedForwardCredits: 0,
        cycleStartDate: now,
        cycleEndDate: cycleEnd,
        lastDailyReset: now,
        lastMonthlyReset: now,
        boostersPurchasedThisMonth: 0,
      },
    });

    return this.getCreditBalance(userId);
  }

  // ==========================================
  // ANALYTICS & STATS
  // ==========================================

  /**
   * Get credit usage statistics
   * 🆕 Now includes token usage stats (when field is available)
   */
  async getUsageStats(userId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<CreditUsageStats> {
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
      case 'month':
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    // Get operation breakdown
    const operationBreakdown = await prisma.smartDocsCreditLog.groupBy({
      by: ['operation', 'operationName'],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: { operation: true },
      _sum: { 
        creditsDeducted: true,
        // tokensDeducted: true, // 🆕 Uncomment after schema update
      },
      orderBy: { _sum: { creditsDeducted: 'desc' } },
    });

    // Get daily usage
    const logs = await prisma.smartDocsCreditLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        creditsDeducted: true,
        // tokensDeducted: true, // 🆕 Uncomment after schema update
      },
    });

    // Group by date
    const dailyMap: Record<string, { credits: number; tokens: number; count: number }> = {};
    logs.forEach(log => {
      const dateKey = log.createdAt.toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { credits: 0, tokens: 0, count: 0 };
      }
      dailyMap[dateKey].credits += log.creditsDeducted;
      // dailyMap[dateKey].tokens += log.tokensDeducted || 0; // 🆕 Uncomment after schema update
      dailyMap[dateKey].count += 1;
    });

    const dailyUsage = Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        creditsUsed: data.credits,
        tokensUsed: data.tokens,
        operationCount: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate totals
    const totalCreditsUsed = logs.reduce((sum, log) => sum + log.creditsDeducted, 0);
    const totalTokensUsed = 0; // 🆕 Update after schema: logs.reduce((sum, log) => sum + (log.tokensDeducted || 0), 0);

    return {
      period,
      totalCreditsUsed,
      totalTokensUsed,
      operationBreakdown: operationBreakdown.map(item => ({
        operation: item.operation,
        operationName: item.operationName || 'Unknown',
        count: item._count.operation,
        creditsUsed: item._sum.creditsDeducted || 0,
        tokensUsed: 0, // 🆕 Update after schema: item._sum.tokensDeducted || 0,
      })),
      dailyUsage,
      topOperations: operationBreakdown.slice(0, 5).map(item => ({
        operation: item.operation,
        operationName: item.operationName || 'Unknown',
        count: item._count.operation,
      })),
    };
  }

  /**
   * Get credit summary for dashboard
   */
  async getCreditSummary(userId: string) {
    const balance = await this.getCreditBalance(userId);
    const planType = await this.getUserPlanType(userId);
    const plan = this.planTypeToPlan(planType);
    const creditRecord = await prisma.smartDocsCredit.findUnique({
      where: { userId },
    });

    if (!creditRecord) {
      throw new Error('Credit record not found');
    }

    // 🆕 Get token pool status too
    let tokenPoolStatus = null;
    try {
      const tokenPools = await usageService.getTokenPools(userId);
      tokenPoolStatus = {
        premium: tokenPools.premium,
        bonus: tokenPools.bonus,
        totalRemaining: tokenPools.premium.remaining + tokenPools.bonus.remaining,
      };
    } catch (e) {
      console.warn('Could not fetch token pool status');
    }

    // Get recent operations
    const recentOps = await prisma.smartDocsCreditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        operation: true,
        operationName: true,
        creditsDeducted: true,
        // tokensDeducted: true, // 🆕 Uncomment after schema update
        createdAt: true,
      },
    });

    // Get available pack info
    const packInfo = await this.getAvailableBoosters(userId);

    return {
      balance,
      tokenPool: tokenPoolStatus, // 🆕
      planType,
      plan,
      cycleInfo: {
        startDate: creditRecord.cycleStartDate,
        endDate: creditRecord.cycleEndDate,
        daysRemaining: Math.ceil(
          (creditRecord.cycleEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      },
      lifetime: {
        totalCreditsUsed: creditRecord.totalCreditsUsed,
        totalPacksPurchased: creditRecord.totalBoostersPurchased,
      },
      recentOperations: recentOps,
      packs: packInfo,
    };
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Check if user has sufficient credits (quick check)
   * 🆕 Now also checks token pool
   */
  async hasCredits(userId: string, creditsNeeded: number): Promise<boolean> {
    const balance = await this.getCreditBalance(userId);
    const hasCredits = balance.totalAvailable >= creditsNeeded && balance.dailyRemaining >= creditsNeeded;
    
    if (!hasCredits) return false;
    
    // 🆕 Also check token pool
    try {
      const tokenCost = creditsNeeded * DEFAULT_TOKENS_PER_CREDIT;
      const tokenPools = await usageService.getTokenPools(userId);
      const totalTokens = tokenPools.premium.remaining + tokenPools.bonus.remaining;
      return totalTokens >= tokenCost;
    } catch {
      // If token check fails, assume OK (credit check passed)
      return true;
    }
  }

  /**
   * Get operations user can afford
   */
  async getAffordableOperations(userId: string, region: RegionCode = 'IN'): Promise<string[]> {
    const balance = await this.getCreditBalance(userId);
    const planType = await this.getUserPlanType(userId);
    const plan = this.planTypeToPlan(planType);
    
    // 🆕 Get token pool for checking
    let tokenPools;
    try {
      tokenPools = await usageService.getTokenPools(userId);
    } catch {
      tokenPools = { premium: { remaining: Infinity }, bonus: { remaining: 0 } };
    }
    const totalTokens = tokenPools.premium.remaining + tokenPools.bonus.remaining;

    return SMART_DOCS_OPERATIONS.filter(op => {
      const config = getSmartDocsConfig(op, region);
      // Check plan access
      if (!canAccessSmartDocsFeature(plan, op)) return false;
      // Check credits
      if (balance.totalAvailable < config.credits) return false;
      if (balance.dailyRemaining < config.credits) return false;
      // 🆕 Check tokens
      const tokenCost = config.tokens || (config.credits * DEFAULT_TOKENS_PER_CREDIT);
      if (totalTokens < tokenCost) return false;
      return true;
    });
  }

  /**
   * Estimate how many times user can run an operation
   * 🆕 Now considers token pool too
   */
  async estimateOperationRuns(
    userId: string, 
    operation: string,
    region: RegionCode = 'IN'
  ): Promise<{ monthly: number; daily: number; tokenLimited: number }> {
    const balance = await this.getCreditBalance(userId);
    const config = getSmartDocsConfig(operation, region);
    const creditCost = config.credits;
    const tokenCost = config.tokens || (creditCost * DEFAULT_TOKENS_PER_CREDIT);

    if (creditCost === 0) return { monthly: 999, daily: 999, tokenLimited: 999 };

    // 🆕 Check token-based limit
    let tokenLimited = 999;
    try {
      const tokenPools = await usageService.getTokenPools(userId);
      const totalTokens = tokenPools.premium.remaining + tokenPools.bonus.remaining;
      tokenLimited = Math.floor(totalTokens / tokenCost);
    } catch {
      // Ignore token check errors
    }

    const monthlyRuns = Math.floor(balance.totalAvailable / creditCost);
    const dailyRuns = Math.floor(balance.dailyRemaining / creditCost);

    return {
      monthly: Math.min(monthlyRuns, tokenLimited),
      daily: Math.min(dailyRuns, tokenLimited),
      tokenLimited,
    };
  }
}

// ==========================================
// EXPORT SINGLETON
// ==========================================

export default new DocsCreditService();