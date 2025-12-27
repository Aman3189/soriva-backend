/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI SERVICE - PRODUCTION OPTIMIZED
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Optimized: December 2025
 * Changes:
 *   - Brain Mode support (uses request.systemPrompt)
 *   - Removed debug logs for production
 *   - Token-optimized conversation history
 *   - Using soriva.personality.ts for system prompts
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
import BrainService from './brain.service';
import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import { MemoryContext } from '../../modules/chat/memoryManager';
import { EmotionResult } from './emotion.detector';
import { gracefulMiddleware } from './graceful-response';
import { smartRoutingService, RoutingDecision } from './smart-routing.service';

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

interface UsageCheckResult {
  canUse: boolean;
  reason?: string;
  naturalMessage?: string;
  dailyRemaining?: number;
  monthlyRemaining?: number;
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

const RESPONSE_WORD_LIMITS = {
  [PlanType.STARTER]: 80,
  [PlanType.PLUS]: 150,
  [PlanType.PRO]: 300,
  [PlanType.APEX]: 500,
  [PlanType.SOVEREIGN]: 9999,
};

function normalizePlanType(planType: PlanType | string): PlanType {
  return PLAN_TYPE_MAPPING[planType as string] || PlanType.STARTER;
}

// Map PlanType enum to SorivaPlanType string
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

    try {
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

      // Usage check
      const estimatedWords = Math.ceil(request.message.length / 5);
      const usageCheck = await this.checkUsageLimits(request.userId, estimatedWords);
      if (!usageCheck.canUse) {
        const error = new Error(usageCheck.naturalMessage || usageCheck.reason);
        (error as any).code = 'USAGE_LIMIT_EXCEEDED';
        (error as any).statusCode = 429;
        throw error;
      }

      // Get context data
      const usage = await prisma.usage.findUnique({
        where: { userId: request.userId },
      });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SYSTEM PROMPT (Brain Mode Support)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      let systemPrompt: string;

      if (request.systemPrompt) {
        // ✅ Use personality.engine systemPrompt (with Brain Mode)
        systemPrompt = request.systemPrompt;
      } else {
        // ✅ Use soriva.personality.ts (ultra-minimal prompts)
        systemPrompt = getSystemPrompt({
          message: request.message,
          plan: toSorivaPlan(normalizedPlanType),
          brain: 'friendly',
          userName: request.userName || user.name || undefined,
        });
      }
      
      // Limit conversation history
      const memoryDays = user.memoryDays || 5;
      const limitedHistory = this.limitConversationHistory(
        request.conversationHistory || [],
        memoryDays,
        normalizedPlanType
      );

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
      // SMART ROUTING - Dynamic Model Selection
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const routingDecision: RoutingDecision = smartRoutingService.route({
        text: request.message,
        planType: normalizedPlanType,
        userId: request.userId,
        monthlyUsedTokens: usage?.wordsUsed || 0,
        monthlyLimitTokens: usage?.monthlyLimit || plan.limits.monthlyTokens,
        dailyUsedTokens: usage?.dailyWordsUsed || 0,
        dailyLimitTokens: usage?.dailyLimit || plan.limits.dailyTokens,
        isHighStakesContext: false,
        conversationContext: limitedHistory.map(m => m.content).join(' ').slice(0, 500),
      });

      // Execute AI request
      const response: AIResponse = await this.factory.executeWithFallback(normalizedPlanType, {
        model: createAIModel(routingDecision.modelId),
        messages,
        temperature: request.temperature ?? 0.7,
        maxTokens: request.maxTokens ?? (normalizedPlanType === PlanType.STARTER ? 150 : 2048),
        userId: request.userId,
      });

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

      // ✅ Clean response using soriva.personality
      response.content = cleanAIResponse(response.content);

      // Word limit enforcement
      const wordLimit = RESPONSE_WORD_LIMITS[normalizedPlanType] || 80;
      const responseWords = response.content.trim().split(/\s+/);
      if (responseWords.length > wordLimit) {
        response.content = responseWords.slice(0, wordLimit).join(' ') + '...';
      }

      // Usage tracking
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
          fallbackUsed: response.metadata.fallbackUsed || false,
          latencyMs: totalLatency,
          memoryDays: memoryDays,
          gracefulHandling: gracefulResult.analytics,
          smartRouting: {
            selectedModel: routingDecision.displayName,
            complexity: routingDecision.complexity,
            expectedQuality: routingDecision.expectedQuality,
            budgetPressure: routingDecision.budgetPressure,
            reason: routingDecision.reason,
          },
        },
        limits: {
          dailyRemaining: updatedUsage.remainingDailyWords,
          monthlyRemaining: updatedUsage.remainingWords,
          usagePercentage: updatedUsage.usagePercentage,
        },
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async streamChat(request: StreamChatRequest): Promise<void> {
    let fullResponse = '';

    try {
      const normalizedPlanType = normalizePlanType(request.planType);

      const user = await prisma.user.findUnique({
        where: { id: request.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const estimatedWords = Math.ceil(request.message.length / 5);
      const usageCheck = await this.checkUsageLimits(request.userId, estimatedWords);

      if (!usageCheck.canUse) {
        const error = new Error(usageCheck.naturalMessage || usageCheck.reason);
        (error as any).code = 'USAGE_LIMIT_EXCEEDED';
        throw error;
      }

      const plan = plansManager.getPlan(normalizedPlanType);
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      const usage = await prisma.usage.findUnique({ where: { userId: request.userId } });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SYSTEM PROMPT (Brain Mode Support)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      let systemPrompt: string;

      if (request.systemPrompt) {
        systemPrompt = request.systemPrompt;
      } else {
        // ✅ Use soriva.personality.ts (ultra-minimal prompts)
        systemPrompt = getSystemPrompt({
          message: request.message,
          plan: toSorivaPlan(normalizedPlanType),
          brain: 'friendly',
          userName: request.userName || user.name || undefined,
        });
      }

      const memoryDays = user.memoryDays || 5;
      const limitedHistory = this.limitConversationHistory(
        request.conversationHistory || [],
        memoryDays,
        normalizedPlanType
      );

      const messages: AIMessage[] = [
        { role: MessageRole.SYSTEM, content: systemPrompt },
        ...limitedHistory,
        { role: MessageRole.USER, content: request.message },
      ];

      // Smart Routing
      const routingDecision: RoutingDecision = smartRoutingService.route({
        text: request.message,
        planType: normalizedPlanType,
        userId: request.userId,
        monthlyUsedTokens: usage?.wordsUsed || 0,
        monthlyLimitTokens: usage?.monthlyLimit || plan.limits.monthlyTokens,
        dailyUsedTokens: usage?.dailyWordsUsed || 0,
        dailyLimitTokens: usage?.dailyLimit || plan.limits.dailyTokens,
        isHighStakesContext: false,
      });

      const stream = this.factory.streamWithFallback(normalizedPlanType, {
        model: createAIModel(routingDecision.modelId),
        messages,
        temperature: request.temperature ?? 0.7,
        maxTokens: request.maxTokens ?? (normalizedPlanType === PlanType.STARTER ? 150 : 2048),
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

      // ✅ Clean final response
      fullResponse = cleanAIResponse(fullResponse);

      const inputWords = this.countWords(request.message);
      const outputWords = this.countWords(fullResponse);
      const totalWordsUsed = inputWords + outputWords;

      await usageService.deductWords(request.userId, totalWordsUsed);

      request.onComplete();
    } catch (error) {
      request.onError(this.handleError(error));
    }
  }

  private async checkUsageLimits(
    userId: string,
    estimatedWords: number
  ): Promise<UsageCheckResult> {
    try {
      const result = await usageService.canUseWords(userId, estimatedWords);

      if (!result.canUse) {
        let naturalMessage = "You've reached your chat limit for now. ";

        if (result.reason?.includes('Daily')) {
          naturalMessage +=
            'Your daily limit has been reached. Try a Cooldown Booster to keep chatting today! 😊';
        } else if (result.reason?.includes('Monthly')) {
          naturalMessage +=
            'Your monthly limit has been reached. Check out our Add-on Booster for more capacity! 🚀';
        }

        return {
          canUse: false,
          reason: result.reason,
          naturalMessage,
          dailyRemaining: result.dailyRemaining,
          monthlyRemaining: result.monthlyRemaining,
        };
      }

      return {
        canUse: true,
        dailyRemaining: result.dailyRemaining,
        monthlyRemaining: result.monthlyRemaining,
      };
    } catch (error) {
      console.error('[AIService] Usage check failed:', error);
      return {
        canUse: false,
        reason: 'Failed to check usage limits',
        naturalMessage: 'Something went wrong. Please try again.',
      };
    }
  }

  private limitConversationHistory(
    history: AIMessage[],
    memoryDays: number,
    planType: PlanType
  ): AIMessage[] {
    const maxMessages = HISTORY_LIMITS[planType] || 2;

    // Get last N messages
    const limited = history.slice(-maxMessages);

    // Truncate each message to max 100 words
    const truncated = limited.map(msg => {
      const words = msg.content.trim().split(/\s+/);
      if (words.length > 100) {
        return {
          ...msg,
          content: words.slice(0, 100).join(' ') + '...'
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