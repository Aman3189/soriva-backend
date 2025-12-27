// src/core/ai/prompts/system-prompt.service.ts

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SYSTEM PROMPT SERVICE — UTILITIES ONLY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Updated: December 24, 2025
 * 
 * SIMPLIFIED:
 * - Primary prompts → soriva.personality.ts
 * - This file → Utilities only (compression, caching, analytics)
 * - No duplicate identity protection code
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import UsageService from '../../../modules/billing/usage.service';
import { Plan, plansManager } from '../../../constants';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ValueAuditMetrics {
  userId: string;
  planType: string;
  responseLength: number;
  estimatedTokens: number;
  compressionRatio: number;
  timestamp: Date;
}

interface ContextSummaryOptions {
  planName: string;
  userContext: {
    userId: string;
    plan: Plan;
    usage: {
      monthlyLimit: number;
      wordsUsed: number;
      remainingWords: number;
      dailyLimit: number;
      dailyWordsUsed: number;
    };
    boosters: {
      cooldownToday: number;
      activeAddons: number;
    };
  };
  temporalContext?: {
    sessionCount: number;
    activityPattern?: 'regular' | 'irregular' | 'declining' | 'increasing';
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYSTEM PROMPT SERVICE — UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class SystemPromptService {
  private static valueAuditLog: ValueAuditMetrics[] = [];
  private static planCache = new Map<string, Plan>();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PLAN CACHE UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public static getMemoryDays(planName: string): number {
    const plan = this.getCachedPlan(planName);
    return plan?.limits.memoryDays || 5;
  }

  public static getResponseDelay(planName: string): number {
    const plan = this.getCachedPlan(planName);
    return plan?.limits.responseDelay || 5;
  }

  private static getCachedPlan(planName: string): Plan | undefined {
    const cached = this.planCache.get(planName);
    if (cached) return cached;

    const plan = plansManager.getPlanByName(planName);
    if (plan) {
      this.planCache.set(planName, plan);
    }
    return plan;
  }

  public static clearPlanCache(): void {
    this.planCache.clear();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESPONSE COMPRESSION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private static readonly COMPRESSION_PATTERNS = [
    { pattern: /\bin order to\b/gi, replacement: 'to' },
    { pattern: /\bdue to the fact that\b/gi, replacement: 'because' },
    { pattern: /\bat this point in time\b/gi, replacement: 'now' },
    { pattern: /\bfor the purpose of\b/gi, replacement: 'for' },
    { pattern: /\bin the event that\b/gi, replacement: 'if' },
    { pattern: /\bwith regard to\b/gi, replacement: 'about' },
  ];

  public static compressResponse(
    response: string,
    userId: string,
    planType: string
  ): { compressed: string; metrics: ValueAuditMetrics; score: number } {
    const originalLength = response.length;
    let compressed = response;

    // Apply compression patterns
    for (const { pattern, replacement } of this.COMPRESSION_PATTERNS) {
      compressed = compressed.replace(pattern, replacement);
    }

    // Clean whitespace
    compressed = compressed
      .replace(/  +/g, ' ')
      .replace(/\n\n\n+/g, '\n\n')
      .trim();

    const compressedLength = compressed.length;
    const estimatedTokens = Math.ceil(compressedLength / 4);
    const compressionRatio = originalLength > 0 ? originalLength / compressedLength : 1;

    const metrics: ValueAuditMetrics = {
      userId,
      planType,
      responseLength: compressedLength,
      estimatedTokens,
      compressionRatio,
      timestamp: new Date(),
    };

    this.logValueAudit(metrics);
    const score = this.scoreResponse(compressed, originalLength);

    return { compressed, metrics, score };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INPUT SANITIZATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public static sanitizeInput(input: string): string {
    // Keep ASCII + emojis, remove potentially harmful unicode
    return input.replace(/[^\x00-\x7F\u{1F300}-\u{1F9FF}]/gu, '');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALUE AUDIT & ANALYTICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public static logValueAudit(metrics: ValueAuditMetrics): void {
    this.valueAuditLog.push(metrics);
    // Keep last 1000 entries
    if (this.valueAuditLog.length > 1000) {
      this.valueAuditLog = this.valueAuditLog.slice(-1000);
    }
  }

  public static scoreResponse(text: string, originalLength?: number): number {
    const currentLength = text.length;
    let score = Math.max(0, 100 - currentLength / 4);

    if (originalLength && originalLength > currentLength) {
      const compressionRatio = originalLength / currentLength;
      const compressionBonus = Math.min(40, (compressionRatio - 1) * 40);
      score += compressionBonus;
    }

    return Math.min(100, Math.round(score));
  }

  public static getValueAuditAnalytics(planType?: string): {
    avgResponseLength: number;
    avgTokens: number;
    avgCompressionRatio: number;
    totalResponses: number;
  } {
    let logs = this.valueAuditLog;
    if (planType) {
      logs = logs.filter((log) => log.planType === planType);
    }

    if (logs.length === 0) {
      return { avgResponseLength: 0, avgTokens: 0, avgCompressionRatio: 0, totalResponses: 0 };
    }

    const totalLength = logs.reduce((sum, log) => sum + log.responseLength, 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.estimatedTokens, 0);
    const totalCompression = logs.reduce((sum, log) => sum + log.compressionRatio, 0);

    return {
      avgResponseLength: Math.round(totalLength / logs.length),
      avgTokens: Math.round(totalTokens / logs.length),
      avgCompressionRatio: totalCompression / logs.length,
      totalResponses: logs.length,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONTEXT SUMMARY (For debugging/admin)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public static getContextSummary(options: ContextSummaryOptions): {
    plan: string;
    memoryDays: number;
    monthlyUsage: string;
    dailyStatus: string;
    cooldownAvailable: boolean;
    addonAvailable: boolean;
    upsellOpportunity: string;
    statusLevel: string;
    temporalStatus?: string;
  } {
    const { userContext, temporalContext } = options;

    const monthlyPercentage = Math.round(
      (userContext.usage.wordsUsed / userContext.usage.monthlyLimit) * 100
    );
    const dailyPercentage = Math.round(
      (userContext.usage.dailyWordsUsed / userContext.usage.dailyLimit) * 100
    );

    const calculatedStatus = UsageService.calculateStatusFromPercentage(
      dailyPercentage,
      monthlyPercentage
    );

    const dailyRemaining = userContext.usage.dailyLimit - userContext.usage.dailyWordsUsed;

    // Determine upsell opportunity
    let upsellType = 'none';
    if (calculatedStatus.status === 'empty') {
      upsellType = userContext.boosters.cooldownToday > 0 ? 'addon_cooldown_used' : 'cooldown_or_addon';
    } else if (calculatedStatus.status === 'red') {
      upsellType = 'proactive_critical';
    } else if (calculatedStatus.status === 'orange') {
      upsellType = 'proactive_heads_up';
    }

    const summary: any = {
      plan: userContext.plan.displayName,
      memoryDays: userContext.plan.limits.memoryDays,
      monthlyUsage: `${monthlyPercentage}% (${userContext.usage.remainingWords} words remaining)`,
      dailyStatus: dailyRemaining > 0 ? `${dailyRemaining} words available` : 'Limit reached',
      cooldownAvailable: userContext.boosters.cooldownToday === 0,
      addonAvailable: true,
      upsellOpportunity: upsellType,
      statusLevel: calculatedStatus.status.toUpperCase(),
    };

    if (temporalContext) {
      summary.temporalStatus = `${temporalContext.sessionCount} sessions, ${temporalContext.activityPattern || 'unknown'} pattern`;
    }

    return summary;
  }
}

export default SystemPromptService;