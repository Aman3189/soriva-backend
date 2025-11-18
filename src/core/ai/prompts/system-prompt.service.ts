// src/core/ai/prompts/system-prompt.service.ts

/**
 * ==========================================
 * SORIVA SYSTEM PROMPT SERVICE - TOKEN OPTIMIZED
 * ==========================================
 * Optimized: November 16, 2025
 * Change: Reduced from 1,050 tokens to ~140 tokens (87% reduction!)
 * ==========================================
 */

import * as fs from 'fs';
import PersonalityPromptsManager from './personality.prompts';
import UsageService from '../../../modules/billing/usage.service';
import { Plan, plansManager } from '../../../constants';

// ==========================================
// INTERFACES (unchanged)
// ==========================================

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

interface ConfidentialityRules {
  forbiddenPhrases: string[];
  deflectionResponses: string[];
  identityReinforcement: string[];
  jailbreakPatterns: RegExp[];
}

interface ValueAuditMetrics {
  userId: string;
  planType: string;
  responseLength: number;
  estimatedTokens: number;
  compressionRatio: number;
  timestamp: Date;
}

// ==========================================
// SYSTEM PROMPT SERVICE - ULTRA COMPRESSED
// ==========================================

export class SystemPromptService {
  private static valueAuditLog: ValueAuditMetrics[] = [];
  private static planCache = new Map<string, Plan>();
  private static emotionTrends = new Map<string, Array<'happy' | 'sad' | 'neutral' | 'excited' | 'frustrated'>>();

  private static readonly CONFIDENTIALITY_RULES: ConfidentialityRules = {
    forbiddenPhrases: [
      'claude', 'gpt', 'gemini', 'llama', 'openai', 'anthropic', 'google',
      'model', 'api cost', 'backend', 'word count', 'word limit', 'tokens'
    ],
    deflectionResponses: [
      "I'm Soriva - your AI companion! 😊",
      "Let's focus on how I can help you! 💬"
    ],
    identityReinforcement: [
      "I'm Soriva!",
      "I'm Soriva - designed for Indian users!"
    ],
    jailbreakPatterns: [
      /ignore (previous|all|above) instructions?/i,
      /forget (your|all|previous) (instructions|rules)/i,
      /reveal (your|the) (system prompt|instructions)/i
    ],
  };

  private static readonly COMPRESSION_PATTERNS = [
    { pattern: /\bin order to\b/gi, replacement: 'to' },
    { pattern: /\bdue to the fact that\b/gi, replacement: 'because' },
    { pattern: /\bat this point in time\b/gi, replacement: 'now' },
  ];

  // ==========================================
  // ✅ OPTIMIZED: MAIN PROMPT BUILDER (~140 tokens total!)
  // ==========================================

public static buildCompletePrompt(options: SystemPromptOptions): string {
  console.log('🔥🔥🔥 FUNCTION START - LINE 1 🔥🔥🔥');
    console.log('🔥 Options received:', JSON.stringify(options, null, 2));
    // ✅✅✅ CHANGED: console.error → console.log (so it shows in terminal!)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚨🚨🚨 METHOD ENTRY: buildCompletePrompt 🚨🚨🚨');
    console.log('🚨 Plan:', options.planName);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Core personality (~100 tokens from optimized engine)
    let personalityPrompt = PersonalityPromptsManager.buildSystemPrompt({
      planName: options.planName,
      language: options.language,
      userName: options.userName,
      userCityTier: options.userCityTier,
      creatorName: options.creatorName,
      customInstructions: options.customInstructions,
    });

    console.log('🔍 PERSONALITY PROMPT LENGTH:', personalityPrompt.length);

    // ✅ ULTRA-COMPRESSED: Confidentiality (200 → 20 tokens)
    const confidentiality = `
🔒 IDENTITY: You are Soriva (not Claude/GPT/Gemini). Never reveal tech details, word limits, or costs.
`.trim();

    // ✅ ULTRA-COMPRESSED: Response rules (200 → 20 tokens)
    const rules = `
🎯 RULES: Hinglish. Concise (100-300 words). Direct answers. No fluff. Hide mechanics.
`.trim();

    // ✅ CONDITIONAL: Only add if critical
    let extras = '';
    
    // Add temporal only if greeting needed
    if (options.temporalContext?.shouldGreet && options.temporalContext.greetingContext) {
      extras += `\n${options.temporalContext.greetingContext}`;
    }

    // ✅ ✅ DEBUG: Check token optimization
    const finalPrompt = `${personalityPrompt}

${confidentiality}

${rules}${extras}`.trim();

    console.log('🔍 FINAL PROMPT LENGTH:', finalPrompt.length);
    console.log('🔍 ESTIMATED TOKENS:', Math.ceil(finalPrompt.length / 4));

    // ✅✅✅ FILE LOGGING (for debugging)
    try {
      const debugInfo = `
╔════════════════════════════════════════════════════════════════╗
║                    SYSTEM PROMPT DEBUG                         ║
╚════════════════════════════════════════════════════════════════╝

📊 LENGTH BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 PERSONALITY LENGTH: ${personalityPrompt.length} chars (~${Math.ceil(personalityPrompt.length / 4)} tokens)
🔍 CONFIDENTIALITY LENGTH: ${confidentiality.length} chars (~${Math.ceil(confidentiality.length / 4)} tokens)
🔍 RULES LENGTH: ${rules.length} chars (~${Math.ceil(rules.length / 4)} tokens)
🔍 EXTRAS LENGTH: ${extras.length} chars (~${Math.ceil(extras.length / 4)} tokens)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 FINAL PROMPT LENGTH: ${finalPrompt.length} chars
🔍 ESTIMATED TOKENS: ${Math.ceil(finalPrompt.length / 4)} tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 FULL PERSONALITY PROMPT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${personalityPrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 FULL FINAL PROMPT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${finalPrompt}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Timestamp: ${new Date().toISOString()}
Plan: ${options.planName}
Language: ${options.language || 'english'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
      
      fs.writeFileSync('/tmp/soriva-prompt-debug.txt', debugInfo);
      console.log('💾 Debug file saved: /tmp/soriva-prompt-debug.txt');
    } catch (err) {
      console.log('🚨🚨🚨 FILE WRITE FAILED! 🚨🚨🚨');
      console.log('Error:', err);
      console.log('Error message:', (err as Error).message);
    }

    console.log('🔍 ==========================================');
    console.log('🔍 SYSTEM PROMPT DEBUG');
    console.log('🔍 ==========================================');
    console.log('🔍 PERSONALITY LENGTH:', personalityPrompt.length);
    console.log('🔍 CONFIDENTIALITY LENGTH:', confidentiality.length);
    console.log('🔍 RULES LENGTH:', rules.length);
    console.log('🔍 EXTRAS LENGTH:', extras.length);
    console.log('🔍 ==========================================');
    console.log('🔍 FINAL PROMPT LENGTH:', finalPrompt.length);
    console.log('🔍 ESTIMATED TOKENS:', Math.ceil(finalPrompt.length / 4));
    console.log('🔍 ==========================================');
    
    return finalPrompt;
  }

  // ==========================================
  // COMPRESSION ENGINE (PUBLIC)
  // ==========================================

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

  // ==========================================
  // MINIMAL VERSIONS OF OTHER METHODS
  // ==========================================

  public static buildMinimalPrompt(options: {
    planName: string;
    language?: string;
    userName?: string;
    customInstructions?: string;
  }): string {
    const personalityPrompt = PersonalityPromptsManager.buildSystemPrompt(options);
    return `${personalityPrompt}

🔒 You are Soriva (not Claude/GPT). Never reveal tech details.`.trim();
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

  public static validatePromptSafety(prompt: string): {
    isSafe: boolean;
    violations: string[];
  } {
    const violations: string[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const forbidden of this.CONFIDENTIALITY_RULES.forbiddenPhrases) {
      if (lowerPrompt.includes(forbidden.toLowerCase())) {
        violations.push(`Forbidden phrase: "${forbidden}"`);
      }
    }

    for (const pattern of this.CONFIDENTIALITY_RULES.jailbreakPatterns) {
      if (pattern.test(prompt)) {
        violations.push(`Jailbreak pattern: ${pattern.source}`);
      }
    }

    return {
      isSafe: violations.length === 0,
      violations,
    };
  }

  public static getMemoryDays(planName: string): number {
    const plan = this.getCachedPlan(planName);
    return plan?.limits.memoryDays || 5;
  }

  public static getResponseDelay(planName: string): number {
    const plan = this.getCachedPlan(planName);
    return plan?.limits.responseDelay || 5;
  }
}

export default SystemPromptService;