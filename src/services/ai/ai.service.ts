/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI SERVICE - PRODUCTION OPTIMIZED
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Optimized: December 2025
 * Updated: January 2026 - Outcome Gate Integration
 * Changes:
 *   - Brain Mode support (uses request.systemPrompt)
 *   - Removed debug logs for production
 *   - Token-optimized conversation history
 *   - Using soriva.personality.ts for system prompts
 *   - ✅ Observability integration (requestId, logging)
 *   - ✅ Kill-switch integration
 *   - ✅ High-stakes detection
 *   - ✅ Token-based limits (not word-based)
 *   - ✅ Outcome Gate - Consolidated decision point
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import {
  ProviderFactory,
  MessageRole,
  AIMessage,
  AIResponse,
  AIError,
  ErrorHandler,
  createAIModel,
} from '../../core/ai/providers';

import { getSystemPrompt, cleanAIResponse } from '../../core/ai/prompts/soriva.personality';
import type { PlanType as SorivaPlanType } from '../../core/ai/prompts/soriva.personality';
import usageService from '../../modules/billing/usage.service';
import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import { MemoryContext } from '../../modules/chat/memoryManager';
import { EmotionResult } from './emotion.detector';
import { gracefulMiddleware } from './graceful-response';

// ✅ Outcome Gate - Consolidated Decision Point
import {
  evaluateOutcome,
  getOutcomeMessage,
  OutcomeContext,
} from './outcome-gate.service';

import { smartRoutingService, RoutingDecision } from './smart-routing.service';

// ✅ Observability imports
import {
  generateRequestId,
  logRouting,
  logModelUsage,
  logFailure,
  logWarn,
} from '../../core/ai/utils/observability';

// ✅ Kill-switch imports
import {
  killSwitches,
  isModelAllowed,
  shouldForceFlash,
  isInMaintenance,
  getEffectivePressure,
} from '../../core/ai/utils/kill-switches';

// ✅ Failure-fallbacks imports
import {
  executeWithRecovery,
  RecoveryResult,
} from '../../core/ai/utils/failure-fallbacks';


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ChatRequest {
  message: string;
  conversationHistory?: AIMessage[];
  userId: string;
  planType: PlanType | string;
  temperature?: number;
  maxTokens?: number;
  language?: string;
  userName?: string;
  customInstructions?: string;
  memory?: MemoryContext | null;
  systemPrompt?: string;
  emotionalContext?: EmotionResult;
  region?: 'IN' | 'INTL';
}

export interface ChatResponse {
  message: string;
  conversationId?: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    wordsUsed: number;
  };
  metadata: {
    model: string;
    provider: string;
    fallbackUsed: boolean;
    latencyMs: number;
    responseDelay?: number;
    memoryDays?: number;
    regenerated?: boolean;
    highStakes?: boolean;
    recoveryUsed?: boolean;
    recoveryAction?: string;
    gracefulHandling?: {
      conflictDetected: boolean;
      conflictType: string | null;
      conflictSeverity: string | null;
      userIntent: string | null;
      validationScore: number;
      passedValidation: boolean;
      criticalViolations: number;
      suggestedAction: string | null;
      processingTimeMs: number;
    };
    smartRouting?: {
      selectedModel: string;
      complexity: string;
      expectedQuality: string;
      budgetPressure: number;
      reason: string;
    };
  };
  limits?: {
    dailyRemaining: number;
    monthlyRemaining: number;
    usagePercentage: number;
  };
}

export interface StreamChatRequest extends ChatRequest {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN NORMALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_TYPE_MAPPING: Record<string, PlanType> = {
  'starter': PlanType.STARTER,
  'plus': PlanType.PLUS,
  'pro': PlanType.PRO,
  'apex': PlanType.APEX,
  'sovereign': PlanType.SOVEREIGN,
  'STARTER': PlanType.STARTER,
  'PLUS': PlanType.PLUS,
  'PRO': PlanType.PRO,
  'APEX': PlanType.APEX,
  'SOVEREIGN': PlanType.SOVEREIGN,
};

// Token-based limits instead of word limits
const TOKEN_SOFT_LIMITS: Record<PlanType, number> = {
  [PlanType.STARTER]: 200,
  [PlanType.PLUS]: 500,
  [PlanType.PRO]: 1000,
  [PlanType.APEX]: 2000,
  [PlanType.SOVEREIGN]: 10000,
};

// Conversion ratio for consistent units
const WORD_TO_TOKEN_RATIO = 1.33;

// High-stakes detection patterns
const HIGH_STAKES_PATTERNS = /\b(legal|contract|agreement|medical|diagnosis|prescription|surgery|payment|invoice|gst|tax|court|lawsuit|lawyer|advocate|doctor|health\s*issue|disease|cancer|heart|blood|finance|loan|emi|insurance|policy|claim|refund|complaint|fir|police|emergency)\b/i;

function normalizePlanType(planType: PlanType | string): PlanType {
  return PLAN_TYPE_MAPPING[planType as string] || PlanType.STARTER;
}

function toSorivaPlan(planType: PlanType): SorivaPlanType {
  const mapping: Record<PlanType, SorivaPlanType> = {
    [PlanType.STARTER]: 'STARTER',
    [PlanType.PLUS]: 'PLUS',
    [PlanType.PRO]: 'PRO',
    [PlanType.APEX]: 'APEX',
    [PlanType.SOVEREIGN]: 'SOVEREIGN',
  };
  return mapping[planType] || 'STARTER';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVERSATION HISTORY LIMITS (Token Optimized)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HISTORY_LIMITS = {
  [PlanType.STARTER]: 2,
  [PlanType.PLUS]: 3,
  [PlanType.PRO]: 4,
  [PlanType.APEX]: 6,
  [PlanType.SOVEREIGN]: 50,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AIService {
  private static instance: AIService;
  private factory: ProviderFactory;

  private constructor() {
    this.factory = ProviderFactory.getInstance({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      googleApiKey: process.env.GOOGLE_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
    });

    console.log('[AIService] ✅ Initialized (Production Mode)');
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    const requestId = generateRequestId();

    try {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Maintenance Mode Check (Early Exit)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (isInMaintenance()) {
        return {
          message: killSwitches.getMaintenanceMessage(),
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, wordsUsed: 0 },
          metadata: {
            model: 'maintenance',
            provider: 'soriva',
            fallbackUsed: false,
            latencyMs: Date.now() - startTime,
          },
        };
      }

      const normalizedPlanType = normalizePlanType(request.planType);

      const user = await prisma.user.findUnique({
        where: { id: request.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const plan = plansManager.getPlan(normalizedPlanType);
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      // Get context data
      const usage = await prisma.usage.findUnique({
        where: { userId: request.userId },
      });

      // Limit conversation history
      const memoryDays = user.memoryDays || 5;
      const limitedHistory = this.limitConversationHistory(
        request.conversationHistory || [],
        memoryDays,
        normalizedPlanType
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // High-stakes detection
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const conversationText = limitedHistory.map(m => m.content).join(' ');
      const isHighStakesContext =
        HIGH_STAKES_PATTERNS.test(request.message) ||
        HIGH_STAKES_PATTERNS.test(conversationText);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Region Detection
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const userRegion: 'IN' | 'INTL' = request.region || 'IN';

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Token Calculations
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const monthlyUsedTokens = Math.ceil((usage?.wordsUsed || 0) * WORD_TO_TOKEN_RATIO);
      const monthlyLimitTokens = Math.ceil((usage?.monthlyLimit || plan.limits.monthlyTokens) * WORD_TO_TOKEN_RATIO);
      const dailyUsedTokens = Math.ceil((usage?.dailyWordsUsed || 0) * WORD_TO_TOKEN_RATIO);
      const dailyLimitTokens = Math.ceil((usage?.dailyLimit || plan.limits.dailyTokens) * WORD_TO_TOKEN_RATIO);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ✅ OUTCOME GATE - Consolidated Decision Point
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const outcomeContext: OutcomeContext = {
        userId: request.userId,
        planType: normalizedPlanType,
        message: request.message,
        monthlyUsedTokens,
        monthlyLimitTokens,
        dailyUsedTokens,
        dailyLimitTokens,
        sessionMessageCount: limitedHistory.length,
        isHighStakesContext,
      };

      const outcomeResult = evaluateOutcome(outcomeContext);

      // Handle non-ANSWER decisions
      if (outcomeResult.decision !== 'ANSWER') {
        const userMessage = getOutcomeMessage(outcomeResult);

        return {
          message: userMessage,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, wordsUsed: 0 },
          metadata: {
            model: outcomeResult.decision.toLowerCase(),
            provider: 'soriva',
            fallbackUsed: false,
            latencyMs: Date.now() - startTime,
          },
        };
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SMART ROUTING - Model Selection
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      let routingDecision: RoutingDecision = smartRoutingService.route({
        text: request.message,
        planType: normalizedPlanType,
        userId: request.userId,
        monthlyUsedTokens,
        monthlyLimitTokens,
        dailyUsedTokens,
        dailyLimitTokens,
        isHighStakesContext,
        conversationContext: conversationText.slice(0, 500),
        region: userRegion,
      });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Kill-switch overrides AFTER routing decision
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const originalModelId = routingDecision.modelId;
      let wasKillSwitched = false;

      // Check if should force Flash for this plan (BUT NOT for high-stakes!)
      if (!isHighStakesContext && shouldForceFlash(normalizedPlanType)) {
        routingDecision.modelId = 'gemini-2.5-flash' as any;
        wasKillSwitched = true;
      }

      // Check if selected model is allowed
      if (!isModelAllowed(routingDecision.modelId)) {
        routingDecision.modelId = this.findAllowedModel(normalizedPlanType, isHighStakesContext, userRegion) as any;
        wasKillSwitched = true;
      }

      // HARD GUARDRAIL: Ensure model is selected
      if (!routingDecision.modelId) {
        throw new Error('Routing failed: no model selected');
      }

      // Apply pressure override from kill-switches
      routingDecision.budgetPressure = getEffectivePressure(routingDecision.budgetPressure);

      // 📊 Log routing decision
      logRouting({
        requestId,
        userId: request.userId,
        plan: normalizedPlanType,
        intent: routingDecision.intentClassification?.intent || 'general',
        modelChosen: routingDecision.modelId,
        modelOriginal: wasKillSwitched ? originalModelId : undefined,
        wasDowngraded: wasKillSwitched || routingDecision.budgetPressure > 0.7,
        downgradeReason: wasKillSwitched
          ? 'kill-switch'
          : (routingDecision.budgetPressure > 0.7 ? routingDecision.reason : undefined),
        pressureLevel: routingDecision.budgetPressure > 0.8 ? 'HIGH' : routingDecision.budgetPressure > 0.5 ? 'MEDIUM' : 'LOW',
        tokensEstimated: Math.ceil(request.message.length / 4),
      });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SYSTEM PROMPT (Brain Mode + Delta Prompt Support)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      let systemPrompt: string;

      if (request.systemPrompt) {
        systemPrompt = request.systemPrompt;
      } else {
        systemPrompt = getSystemPrompt({
          message: request.message,
          plan: toSorivaPlan(normalizedPlanType),
          brain: 'friendly',
          userName: request.userName || user.name || undefined,
        });
      }

      // Append Delta Prompt from Intent Classifier
      if (routingDecision.intentClassification?.deltaPrompt) {
        systemPrompt += '\n\n' + routingDecision.intentClassification.deltaPrompt;
      }

      // Build messages
      const messages: AIMessage[] = [
        {
          role: MessageRole.SYSTEM,
          content: systemPrompt,
        },
        ...limitedHistory,
        {
          role: MessageRole.USER,
          content: request.message,
        },
      ];

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // EXECUTE AI REQUEST WITH FAILURE RECOVERY
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const recoveryResult: RecoveryResult = await executeWithRecovery({
        requestId,
        userId: request.userId,
        plan: normalizedPlanType,
        primaryModel: routingDecision.modelId,
        isHighStakes: isHighStakesContext,
        pressure: routingDecision.budgetPressure,
        language: (request.language as 'en' | 'hi' | 'hinglish') || 'en',
        region: userRegion,
        execute: async (modelId: string) => {
          return await this.factory.executeWithFallback(normalizedPlanType, {
            model: createAIModel(modelId as any),
            messages,
            temperature: request.temperature ?? 0.7,
            maxTokens: request.maxTokens ?? (normalizedPlanType === PlanType.STARTER ? 200 : 2048),
            userId: request.userId,
          });
        },
      });

      // Handle recovery result
      let response: AIResponse;
      let usedFallback = false;

      if (!recoveryResult.recovered && recoveryResult.finalModel === 'ultimate_fallback') {
        return {
          message: recoveryResult.response as string,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, wordsUsed: 0 },
          metadata: {
            model: 'ultimate_fallback',
            provider: 'soriva',
            fallbackUsed: true,
            latencyMs: Date.now() - startTime,
            memoryDays,
            gracefulHandling: undefined,
            regenerated: false,
            highStakes: isHighStakesContext,
            smartRouting: {
              selectedModel: routingDecision.displayName,
              complexity: routingDecision.complexity,
              expectedQuality: routingDecision.expectedQuality,
              budgetPressure: routingDecision.budgetPressure,
              reason: `failed:${recoveryResult.trace.action}`,
            },
          },
        };
      }

      if (recoveryResult.finalModel === 'budget_fallback') {
        return {
          message: recoveryResult.response as string,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, wordsUsed: 0 },
          metadata: {
            model: 'budget_fallback',
            provider: 'soriva',
            fallbackUsed: true,
            latencyMs: Date.now() - startTime,
            memoryDays,
            gracefulHandling: undefined,
            regenerated: false,
            highStakes: isHighStakesContext,
            smartRouting: {
              selectedModel: routingDecision.displayName,
              complexity: routingDecision.complexity,
              expectedQuality: routingDecision.expectedQuality,
              budgetPressure: routingDecision.budgetPressure,
              reason: 'budget_enforcement',
            },
          },
        };
      }

      // Success - extract response
      response = recoveryResult.response as AIResponse;
      usedFallback = recoveryResult.attemptsUsed > 1;

      // 📊 Log model usage
      logModelUsage({
        requestId,
        model: recoveryResult.finalModel !== 'ultimate_fallback' ? response.model : 'none',
        plan: normalizedPlanType,
        tokensEstimated: Math.ceil(request.message.length / 4),
        tokensActual: response.usage.totalTokens,
        costINR: this.calculateCostINR(response.model, response.usage.totalTokens),
        latencyMs: Date.now() - startTime,
        success: true,
        intent: routingDecision.intentClassification?.intent,
        highStakes: isHighStakesContext,
        fallbackUsed: usedFallback,
        recoveryAction: recoveryResult.action,
      } as any);

      // Escalate pressure when soft token limit breached
      const tokenSoftLimit = TOKEN_SOFT_LIMITS[normalizedPlanType] || 200;
      if (response.usage.completionTokens > tokenSoftLimit * 1.5) {
        const pressureIncrease = 0.1;

        logWarn('Response exceeded soft token limit - pressure escalated (local only)', {
          requestId,
          plan: normalizedPlanType,
          limit: tokenSoftLimit,
          actual: response.usage.completionTokens,
          pressureIncrease,
        });
      }

      // Graceful response handling
      const gracefulResult = await gracefulMiddleware.process(
        request.message,
        response.content
      );

      if (gracefulResult.needsRegeneration && gracefulResult.regenerationPrompts) {
        const { systemPrompt: regenSystem, userPrompt } = gracefulResult.regenerationPrompts;

        const regeneratedResponse = await this.factory.executeWithFallback(normalizedPlanType, {
          model: createAIModel(routingDecision.modelId),
          messages: [
            { role: MessageRole.SYSTEM, content: regenSystem },
            { role: MessageRole.USER, content: userPrompt },
          ],
          temperature: 0.3,
          maxTokens: 150,
          userId: request.userId,
        });

        response.content = regeneratedResponse.content;
        gracefulResult.wasModified = true;
      } else {
        response.content = gracefulResult.finalResponse;
      }

      // Clean response
      response.content = cleanAIResponse(response.content);

      // Usage tracking (still in words for backward compatibility)
      const inputWords = this.countWords(request.message);
      const outputWords = this.countWords(response.content);
      const totalWordsUsed = inputWords + outputWords;

      await usageService.deductWords(request.userId, totalWordsUsed);

      const updatedUsage = await usageService.getUsageStatsForPrompt(request.userId);
      const totalLatency = Date.now() - startTime;

      return {
        message: response.content,
        usage: {
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
          wordsUsed: totalWordsUsed,
        },
        metadata: {
          model: response.model,
          provider: response.provider,
          fallbackUsed: response.metadata.fallbackUsed || wasKillSwitched || usedFallback,
          latencyMs: totalLatency,
          memoryDays: memoryDays,
          gracefulHandling: gracefulResult.analytics,
          regenerated: gracefulResult.wasModified || false,
          highStakes: isHighStakesContext,
          recoveryUsed: usedFallback,
          recoveryAction: usedFallback ? recoveryResult.action : undefined,
          smartRouting: {
            selectedModel: routingDecision.displayName,
            complexity: routingDecision.complexity,
            expectedQuality: routingDecision.expectedQuality,
            budgetPressure: routingDecision.budgetPressure,
            reason: wasKillSwitched ? `kill-switch: ${routingDecision.reason}` : routingDecision.reason,
          },
        },
        limits: {
          dailyRemaining: updatedUsage.remainingDailyWords,
          monthlyRemaining: updatedUsage.remainingWords,
          usagePercentage: updatedUsage.usagePercentage,
        },
      };
    } catch (error) {
      logFailure({
        requestId,
        userId: request.userId,
        errorType: (error as any).code || 'UNKNOWN',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        recovered: false,
      });

      throw this.handleError(error);
    }
  }

  async streamChat(request: StreamChatRequest): Promise<void> {
    let fullResponse = '';
    const startTime = Date.now();
    const requestId = generateRequestId();

    try {
      // Maintenance Mode Check
      if (isInMaintenance()) {
        request.onChunk(killSwitches.getMaintenanceMessage());
        request.onComplete();
        return;
      }

      const normalizedPlanType = normalizePlanType(request.planType);

      const user = await prisma.user.findUnique({
        where: { id: request.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const plan = plansManager.getPlan(normalizedPlanType);
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      const usage = await prisma.usage.findUnique({ where: { userId: request.userId } });

      const memoryDays = user.memoryDays || 5;
      const limitedHistory = this.limitConversationHistory(
        request.conversationHistory || [],
        memoryDays,
        normalizedPlanType
      );

      // High-stakes detection
      const conversationText = limitedHistory.map(m => m.content).join(' ');
      const isHighStakesContext =
        HIGH_STAKES_PATTERNS.test(request.message) ||
        HIGH_STAKES_PATTERNS.test(conversationText);

      // Region detection
      const userRegion: 'IN' | 'INTL' = (request as any).region || 'IN';

      // Token calculations
      const monthlyUsedTokens = Math.ceil((usage?.wordsUsed || 0) * WORD_TO_TOKEN_RATIO);
      const monthlyLimitTokens = Math.ceil((usage?.monthlyLimit || plan.limits.monthlyTokens) * WORD_TO_TOKEN_RATIO);
      const dailyUsedTokens = Math.ceil((usage?.dailyWordsUsed || 0) * WORD_TO_TOKEN_RATIO);
      const dailyLimitTokens = Math.ceil((usage?.dailyLimit || plan.limits.dailyTokens) * WORD_TO_TOKEN_RATIO);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ✅ OUTCOME GATE - Consolidated Decision Point
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const outcomeContext: OutcomeContext = {
        userId: request.userId,
        planType: normalizedPlanType,
        message: request.message,
        monthlyUsedTokens,
        monthlyLimitTokens,
        dailyUsedTokens,
        dailyLimitTokens,
        sessionMessageCount: limitedHistory.length,
        isHighStakesContext,
      };

      const outcomeResult = evaluateOutcome(outcomeContext);

      // Handle non-ANSWER decisions
      if (outcomeResult.decision !== 'ANSWER') {
        const userMessage = getOutcomeMessage(outcomeResult);
        request.onChunk(userMessage);
        request.onComplete();
        return;
      }

      // Smart Routing
      let routingDecision: RoutingDecision = smartRoutingService.route({
        text: request.message,
        planType: normalizedPlanType,
        userId: request.userId,
        monthlyUsedTokens,
        monthlyLimitTokens,
        dailyUsedTokens,
        dailyLimitTokens,
        isHighStakesContext,
        region: userRegion,
      });

      // Kill-switch overrides (BUT NOT for high-stakes!)
      const originalModelId = routingDecision.modelId;
      let wasKillSwitched = false;

      if (!isHighStakesContext && shouldForceFlash(normalizedPlanType)) {
        routingDecision.modelId = 'gemini-2.5-flash' as any;
        wasKillSwitched = true;
      }

      if (!isModelAllowed(routingDecision.modelId)) {
        routingDecision.modelId = this.findAllowedModel(normalizedPlanType, isHighStakesContext, userRegion) as any;
        wasKillSwitched = true;
      }

      // HARD GUARDRAIL
      if (!routingDecision.modelId) {
        throw new Error('Routing failed: no model selected');
      }

      routingDecision.budgetPressure = getEffectivePressure(routingDecision.budgetPressure);

      // 📊 Log routing
      logRouting({
        requestId,
        userId: request.userId,
        plan: normalizedPlanType,
        intent: routingDecision.intentClassification?.intent || 'general',
        modelChosen: routingDecision.modelId,
        modelOriginal: wasKillSwitched ? originalModelId : undefined,
        wasDowngraded: wasKillSwitched || routingDecision.budgetPressure > 0.7,
        downgradeReason: wasKillSwitched ? 'kill-switch' : undefined,
        pressureLevel: routingDecision.budgetPressure > 0.8 ? 'HIGH' : routingDecision.budgetPressure > 0.5 ? 'MEDIUM' : 'LOW',
        tokensEstimated: Math.ceil(request.message.length / 4),
      });

      // System Prompt
      let systemPrompt: string;

      if (request.systemPrompt) {
        systemPrompt = request.systemPrompt;
      } else {
        systemPrompt = getSystemPrompt({
          message: request.message,
          plan: toSorivaPlan(normalizedPlanType),
          brain: 'friendly',
          userName: request.userName || user.name || undefined,
        });
      }

      if (routingDecision.intentClassification?.deltaPrompt) {
        systemPrompt += '\n\n' + routingDecision.intentClassification.deltaPrompt;
      }

      const messages: AIMessage[] = [
        { role: MessageRole.SYSTEM, content: systemPrompt },
        ...limitedHistory,
        { role: MessageRole.USER, content: request.message },
      ];

      const stream = this.factory.streamWithFallback(normalizedPlanType, {
        model: createAIModel(routingDecision.modelId),
        messages,
        temperature: request.temperature ?? 0.7,
        maxTokens: request.maxTokens ?? (normalizedPlanType === PlanType.STARTER ? 200 : 2048),
        userId: request.userId,
      });

      const responseDelay = user.responseDelay || 5;
      if (responseDelay > 0) {
        await this.delay(responseDelay * 1000);
      }

      for await (const chunk of stream) {
        fullResponse += chunk;
        request.onChunk(chunk);
      }

      // Clean final response
      fullResponse = cleanAIResponse(fullResponse);

      const inputWords = this.countWords(request.message);
      const outputWords = this.countWords(fullResponse);
      const totalWordsUsed = inputWords + outputWords;

      // 📊 Log model usage
      const estimatedOutputTokens = Math.ceil(outputWords * WORD_TO_TOKEN_RATIO);
      logModelUsage({
        requestId,
        model: routingDecision.modelId,
        plan: normalizedPlanType,
        tokensEstimated: Math.ceil(request.message.length / 4),
        tokensActual: estimatedOutputTokens,
        costINR: this.calculateCostINR(routingDecision.modelId, estimatedOutputTokens),
        latencyMs: Date.now() - startTime,
        success: true,
      });

      await usageService.deductWords(request.userId, totalWordsUsed);

      request.onComplete();
    } catch (error) {
      logFailure({
        requestId,
        userId: request.userId,
        errorType: (error as any).code || 'UNKNOWN',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        recovered: false,
      });

      request.onError(this.handleError(error));
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Find allowed model with PLAN ENTITLEMENTS + HIGH-STAKES check
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  private findAllowedModel(planType: PlanType, isHighStakes: boolean = false, region: 'IN' | 'INTL' = 'IN'): string {
    // INDIA fallbacks
    const planFallbacksIndia: Record<PlanType, string[]> = {
      [PlanType.STARTER]: [
        'gemini-2.5-flash-lite',
      ],
      [PlanType.PLUS]: isHighStakes
        ? ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking']
        : ['moonshotai/kimi-k2-thinking', 'gemini-2.5-flash'],
      [PlanType.PRO]: isHighStakes
        ? ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking']
        : ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking'],
      [PlanType.APEX]: isHighStakes
        ? ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking', 'gemini-2.5-pro']
        : ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking', 'gemini-2.5-pro'],
      [PlanType.SOVEREIGN]: [
        'gemini-2.5-flash',
        'moonshotai/kimi-k2-thinking',
        'gemini-3-pro',
        'gpt-5.1',
        'claude-sonnet-4-5'
      ],
    };

    // INTERNATIONAL fallbacks
    const planFallbacksIntl: Record<PlanType, string[]> = {
      [PlanType.STARTER]: [
        'gemini-2.5-flash-lite',
      ],
      [PlanType.PLUS]: [
        'gemini-2.5-flash',
        'moonshotai/kimi-k2-thinking'
      ],
      [PlanType.PRO]: isHighStakes
        ? ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking', 'gemini-2.5-pro']
        : ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking', 'gemini-2.5-pro'],
      [PlanType.APEX]: isHighStakes
        ? ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking', 'gemini-3-pro']
        : ['gemini-2.5-flash', 'moonshotai/kimi-k2-thinking', 'gemini-3-pro'],
      [PlanType.SOVEREIGN]: [
        'gemini-2.5-flash',
        'moonshotai/kimi-k2-thinking',
        'gemini-3-pro',
        'gpt-5.1',
        'claude-sonnet-4-5'
      ],
    };

    const planFallbacks = region === 'INTL' ? planFallbacksIntl : planFallbacksIndia;
    const fallbackOrder = planFallbacks[planType] || planFallbacks[PlanType.STARTER];

    for (const model of fallbackOrder) {
      if (isModelAllowed(model)) {
        return model;
      }
    }

    return planType === PlanType.STARTER ? 'gemini-2.5-flash-lite' : 'gemini-2.5-flash';
  }

  private limitConversationHistory(
    history: AIMessage[],
    memoryDays: number,
    planType: PlanType
  ): AIMessage[] {
    const maxMessages = HISTORY_LIMITS[planType] || 2;
    const limited = history.slice(-maxMessages);

    const truncated = limited.map((msg) => {
      const words = msg.content.trim().split(/\s+/);
      if (words.length > 100) {
        return {
          ...msg,
          content: words.slice(0, 100).join(' ') + '...',
        };
      }
      return msg;
    });

    return truncated;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private calculateCostINR(model: string, tokens: number): number {
    const costPer1MTokens: Record<string, number> = {
      'gemini-2.5-flash-lite': 32.56,
      'gemini-2.5-flash': 32.56,
      'gemini-2.5-pro': 810.27,
      'gemini-3-pro': 982.03,
      'moonshotai/kimi-k2-thinking': 206.58,
      'gpt-5.1': 810.27,
      'claude-sonnet-4-5': 1217.87,
    };

    const rate = costPer1MTokens[model] || 50;
    return (tokens / 1_000_000) * rate;
  }

  async getSuggestions(planType: PlanType, context: string): Promise<string[]> {
    try {
      const normalizedPlanType = normalizePlanType(planType);
      const plan = plansManager.getPlan(normalizedPlanType);
      if (!plan) return [];

      const aiModels = plansManager.getAIModels(normalizedPlanType);
      if (!aiModels || aiModels.length === 0) return [];

      const response = await this.factory.executeWithFallback(normalizedPlanType, {
        model: createAIModel(aiModels[0].modelId),
        messages: [
          {
            role: MessageRole.USER,
            content: `Given this context: "${context}", suggest 3 relevant follow-up questions. Return only the questions, one per line, without numbers.`,
          },
        ],
        temperature: 0.8,
        maxTokens: 150,
      });

      return response.content
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 3);
    } catch (error) {
      console.error('[AIService] Failed to generate suggestions:', error);
      return [];
    }
  }

  getAvailablePlans(): PlanType[] {
    return Object.values(PlanType);
  }

  getPlanInfo(planType: PlanType) {
    const normalizedPlanType = normalizePlanType(planType);
    const plan = plansManager.getPlan(normalizedPlanType);

    if (!plan) {
      throw new Error('Invalid plan type');
    }

    const aiModels = plansManager.getAIModels(normalizedPlanType);

    return {
      planType: normalizedPlanType,
      displayName: plan.displayName,
      primaryModel: aiModels?.[0]?.modelId || 'unknown',
      fallbackAvailable: aiModels && aiModels.length > 1,
      limits: plan.limits,
    };
  }

  getStats() {
    return this.factory.getStats();
  }

  async healthCheck() {
    try {
      const results = await this.factory.healthCheckAll();
      return {
        healthy: Object.values(results).every((status) => status === true),
        providers: results,
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof AIError) {
      const userMessage = error.getUserMessage();
      const serviceError = new Error(userMessage);
      (serviceError as any).code = error.code;
      (serviceError as any).statusCode = ErrorHandler.getHttpStatus(error);
      return serviceError;
    }

    if (error instanceof Error && (error as any).code === 'USAGE_LIMIT_EXCEEDED') {
      return error;
    }

    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export const aiService = AIService.getInstance();