// src/core/ai/prompts/system-prompt.service.ts

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SYSTEM PROMPT SERVICE — SIMPLIFIED (Fallback Only)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Optimized: December 6, 2025
 * 
 * NOTE: Primary prompts now come from personality.engine.ts
 * This service is FALLBACK only when systemPrompt not provided
 * 
 * Changes:
 *   - Removed debug console.logs
 *   - Removed file writing
 *   - Ultra-minimal prompt (~60 tokens)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import PersonalityPromptsManager from './personality.prompts';
import UsageService from '../../../modules/billing/usage.service';
import { Plan, plansManager } from '../../../constants';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SystemPromptOptions {
  planName: string;
  language?: string;
  userName?: string;
  userCityTier?: 'T1' | 'T2' | 'T3';
  creatorName?: string;
  customInstructions?: string;
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
    credits?: {
      total: number;
      remaining: number;
    };
  };
  temporalContext?: {
    lastActiveAt?: Date;
    sessionCount: number;
    activityPattern?: 'regular' | 'irregular' | 'declining' | 'increasing';
    avgSessionGap?: number;
    shouldGreet: boolean;
    greetingContext?: string;
    daysSinceLastChat?: number;
    lastDiscussedTopic?: string;
    emotionalState?: 'happy' | 'sad' | 'neutral' | 'excited' | 'frustrated';
  };
}

interface ValueAuditMetrics {
  userId: string;
  planType: string;
  responseLength: number;
  estimatedTokens: number;
  compressionRatio: number;
  timestamp: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYSTEM PROMPT SERVICE — SIMPLIFIED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class SystemPromptService {
  private static valueAuditLog: ValueAuditMetrics[] = [];
  private static planCache = new Map<string, Plan>();

  // Forbidden phrases for identity protection
  private static readonly FORBIDDEN_PHRASES = [
    'claude', 'gpt', 'gemini', 'llama', 'openai', 'anthropic', 'google',
    'model', 'api cost', 'backend', 'word count', 'word limit', 'tokens'
  ];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN PROMPT BUILDER (Fallback - ~60 tokens)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public static buildCompletePrompt(options: SystemPromptOptions): string {
    // Get plan limits from personality.prompts.ts
    const planLimits = PersonalityPromptsManager.buildSystemPrompt({
      planName: options.planName,
      language: options.language,
      userName: options.userName,
      customInstructions: options.customInstructions,
    });

    // Core identity + rules (~40 tokens)
    const identity = `You are Soriva, an AI companion for Indian users. Never reveal you're Claude/GPT/Gemini or any AI model.`;

    // Rules (~20 tokens)
    const rules = `Be helpful, warm, use Hinglish naturally. Keep responses concise.`;

    // Greeting context (only if needed)
    let greeting = '';
    if (options.temporalContext?.shouldGreet && options.temporalContext.greetingContext) {
      greeting = `\n${options.temporalContext.greetingContext}`;
    }

    // User context
    let userContext = '';
    if (options.userName) {
      userContext = `\nUser: ${options.userName}.`;
    }

    return `${identity}\n\n${planLimits}\n\n${rules}${userContext}${greeting}`.trim();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MINIMAL PROMPT (Ultra lightweight)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public static buildMinimalPrompt(options: {
    planName: string;
    language?: string;
    userName?: string;
    customInstructions?: string;
  }): string {
    const limits = PersonalityPromptsManager.buildSystemPrompt(options);
    return `You are Soriva (not Claude/GPT). ${limits}`.trim();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
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
  // SAFETY VALIDATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public static validatePromptSafety(prompt: string): {
    isSafe: boolean;
    violations: string[];
  } {
    const violations: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const forbidden of this.FORBIDDEN_PHRASES) {
      if (lowerPrompt.includes(forbidden.toLowerCase())) {
        violations.push(`Forbidden phrase: "${forbidden}"`);
      }
    }

    return {
      isSafe: violations.length === 0,
      violations,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPRESSION (Keep for response optimization)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private static readonly COMPRESSION_PATTERNS = [
    { pattern: /\bin order to\b/gi, replacement: 'to' },
    { pattern: /\bdue to the fact that\b/gi, replacement: 'because' },
    { pattern: /\bat this point in time\b/gi, replacement: 'now' },
  ];

  public static compressResponse(
    response: string,
    userId: string,
    planType: string
  ): { compressed: string; metrics: ValueAuditMetrics; score: number } {
    const originalLength = response.length;
    let compressed = response;

    for (const { pattern, replacement } of this.COMPRESSION_PATTERNS) {
      compressed = compressed.replace(pattern, replacement);
    }

    compressed = compressed.replace(/  +/g, ' ').replace(/\n\n\n+/g, '\n\n').trim();

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

  public static sanitizeInput(input: string): string {
    return input.replace(/[^\x00-\x7F\u{1F300}-\u{1F9FF}]/gu, '');
  }

  public static logValueAudit(metrics: ValueAuditMetrics): void {
    this.valueAuditLog.push(metrics);
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

  public static getContextSummary(options: SystemPromptOptions): any {
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