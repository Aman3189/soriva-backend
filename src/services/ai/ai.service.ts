/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI SERVICE (FULLY INTEGRATED) - SERVERLESS READY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Updated: November 4, 2025 (Serverless Architecture)
 * Purpose: Complete AI chat orchestration with all services integrated
 *
 * Integrations:
 * - Provider Factory (AI models)
 * - System Prompt Service (confidentiality + personality)
 * - Usage Service (word limits + credits)
 * - Brain Service (behavioral tracking)
 * - Context Builder (booster awareness)
 * - Response delays (plan-based)
 * - Memory days (conversation history)
 *
 * Changes (November 4, 2025):
 * - FIXED: Studio access check for correct plans (PRO, EDGE, LIFE only)
 * - FIXED: Removed hardcoded plan references
 * - FIXED: All LLM calls are on-demand (serverless ready)
 * - MAINTAINED: Class-based structure (100%)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// Import paths adjusted for src/services/ai.service.ts location
import {
  ProviderFactory,
  MessageRole,
  AIMessage,
  AIResponse,
  AIError,
  ErrorHandler,
  createAIModel,
} from '../../core/ai/providers';

import SystemPromptService from '../../core/ai/prompts/system-prompt.service';
import usageService from '../../modules/billing/usage.service';
import BrainService from './brain.service';
import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import { MemoryContext } from '../../modules/chat/memoryManager';
import { EmotionResult } from './emotion.detector';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ChatRequest {
  message: string;
  conversationHistory?: AIMessage[];
  userId: string;
  planType: PlanType;
  temperature?: number;
  maxTokens?: number;

  // Optional context
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
// AI SERVICE CLASS (FULLY INTEGRATED & SERVERLESS READY)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AIService {
  private static instance: AIService;
  private factory: ProviderFactory;

  private constructor() {
    // Initialize provider factory with API keys from environment
    // ✅ SERVERLESS READY: No persistent connections, clients created on-demand
    this.factory = ProviderFactory.getInstance({
      groqApiKey: process.env.GROQ_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      googleApiKey: process.env.GOOGLE_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
    });

    console.log('✅ AI Service initialized with all providers & services');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN CHAT METHOD (INTEGRATED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Send chat message (non-streaming) - FULLY INTEGRATED
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // ========================================
      // STEP 1: PRE-FLIGHT CHECKS
      // ========================================

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: request.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get plan details using plansManager
      const plan = plansManager.getPlan(request.planType);
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      // Estimate words (rough estimate: message length / 5)
      const estimatedWords = Math.ceil(request.message.length / 5);

      // Check usage limits
      const usageCheck = await this.checkUsageLimits(request.userId, estimatedWords);
      if (!usageCheck.canUse) {
        const error = new Error(usageCheck.naturalMessage || usageCheck.reason);
        (error as any).code = 'USAGE_LIMIT_EXCEEDED';
        (error as any).statusCode = 429;
        throw error;
      }

      // ========================================
      // STEP 2: BUILD SYSTEM PROMPT
      // ========================================

      // Get temporal context from brain service
      const temporalContext = await BrainService.getTemporalContext(request.userId);

      // Get usage data for context
      const usage = await prisma.usage.findUnique({
        where: { userId: request.userId },
      });

      // Get booster context
      const boosterContext = await usageService.getBoosterContext(request.userId);

      // ✅ FIXED: Check studio access for correct plans (PRO, EDGE, LIFE)
      const hasStudioAccess = (
        request.planType === PlanType.PRO ||
        request.planType === PlanType.EDGE ||
        request.planType === PlanType.LIFE
      );
      const credits = hasStudioAccess
        ? await usageService.checkStudioCredits(request.userId)
        : undefined;

      // Build complete system prompt
      const systemPrompt =
        request.systemPrompt ||
        SystemPromptService.buildCompletePrompt({
          planName: plan.name,
          language: request.language,
          userName: request.userName || user.name || undefined,
          customInstructions: request.customInstructions,

          userContext: {
            userId: request.userId,
            plan: plan,
            usage: {
              monthlyLimit: usage?.monthlyLimit || plan.limits.monthlyWords,
              wordsUsed: usage?.wordsUsed || 0,
              remainingWords: usage?.remainingWords || plan.limits.monthlyWords,
              dailyLimit: usage?.dailyLimit || plan.limits.dailyWords,
              dailyWordsUsed: usage?.dailyWordsUsed || 0,
            },
            boosters: boosterContext,
            credits: credits
              ? {
                  total: credits.totalCredits,
                  remaining: credits.remainingCredits,
                }
              : undefined,
          },

          temporalContext: temporalContext
            ? {
                lastActiveAt: temporalContext.lastActiveAt,
                sessionCount: temporalContext.sessionCount,
                activityPattern: temporalContext.activityPattern as
                  | 'regular'
                  | 'irregular'
                  | 'declining'
                  | 'increasing'
                  | undefined,
                avgSessionGap: temporalContext.avgSessionGap,
                shouldGreet: temporalContext.shouldGreet,
                greetingContext: temporalContext.greetingContext,
              }
            : undefined,
        });

      // ========================================
      // STEP 3: PREPARE CONVERSATION HISTORY
      // ========================================

      // Limit conversation history based on memory days
      const memoryDays = user.memoryDays || 5;
      const limitedHistory = this.limitConversationHistory(
        request.conversationHistory || [],
        memoryDays
      );

      // Build messages array with system prompt
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

      // ========================================
      // STEP 4: GET AI RESPONSE
      // ========================================

      // Get AI models using plansManager
      const aiModels = plansManager.getAIModels(request.planType);
      if (!aiModels || aiModels.length === 0) {
        throw new Error('No AI models configured for this plan');
      }

      // Execute with automatic fallback
      const response: AIResponse = await this.factory.executeWithFallback(request.planType, {
        model: createAIModel(aiModels[0].modelId),
        messages,
        temperature: request.temperature ?? 0.7,
        maxTokens: request.maxTokens ?? 2048,
        userId: request.userId,
      });

      // ========================================
      // STEP 5: APPLY RESPONSE DELAY
      // ========================================

      const responseDelay = user.responseDelay || 5; // seconds
      if (responseDelay > 0) {
        await this.delay(responseDelay * 1000); // Convert to ms
      }

      // ========================================
      // STEP 6: CALCULATE & DEDUCT WORDS
      // ========================================

      // Calculate actual words used (input + output)
      const inputWords = this.countWords(request.message);
      const outputWords = this.countWords(response.content);
      const totalWordsUsed = inputWords + outputWords;

      // Deduct words from usage
      const deductResult = await usageService.deductWords(request.userId, totalWordsUsed);

      if (!deductResult.success) {
        console.warn('[AIService] Failed to deduct words:', deductResult.message);
        // Non-critical - response was already generated
      }

      // ========================================
      // STEP 7: GET UPDATED LIMITS
      // ========================================

      const updatedUsage = await usageService.getUsageStatsForPrompt(request.userId);

      // ========================================
      // STEP 8: RETURN RESPONSE
      // ========================================

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
          responseDelay: responseDelay,
          memoryDays: memoryDays,
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STREAMING CHAT (INTEGRATED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Stream chat message (real-time) - FULLY INTEGRATED
   */
  async streamChat(request: StreamChatRequest): Promise<void> {
    let fullResponse = '';

    try {
      // ========================================
      // PRE-FLIGHT CHECKS (same as chat)
      // ========================================

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

      // ========================================
      // BUILD SYSTEM PROMPT (same as chat)
      // ========================================

      const plan = plansManager.getPlan(request.planType);
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      const temporalContext = await BrainService.getTemporalContext(request.userId);
      const usage = await prisma.usage.findUnique({ where: { userId: request.userId } });
      const boosterContext = await usageService.getBoosterContext(request.userId);
      
      // ✅ FIXED: Check studio access for correct plans (PRO, EDGE, LIFE)
      const hasStudioAccess = (
        request.planType === PlanType.PRO ||
        request.planType === PlanType.EDGE ||
        request.planType === PlanType.LIFE
      );
      const credits = hasStudioAccess
        ? await usageService.checkStudioCredits(request.userId)
        : undefined;

      const systemPrompt =
        request.systemPrompt ||
        SystemPromptService.buildCompletePrompt({
          planName: plan.name,
          language: request.language,
          userName: request.userName || user.name || undefined,
          customInstructions: request.customInstructions,
          userContext: {
            userId: request.userId,
            plan: plan,
            usage: {
              monthlyLimit: usage?.monthlyLimit || plan.limits.monthlyWords,
              wordsUsed: usage?.wordsUsed || 0,
              remainingWords: usage?.remainingWords || plan.limits.monthlyWords,
              dailyLimit: usage?.dailyLimit || plan.limits.dailyWords,
              dailyWordsUsed: usage?.dailyWordsUsed || 0,
            },
            boosters: boosterContext,
            credits: credits
              ? {
                  total: credits.totalCredits,
                  remaining: credits.remainingCredits,
                }
              : undefined,
          },
          temporalContext: temporalContext
            ? {
                lastActiveAt: temporalContext.lastActiveAt,
                sessionCount: temporalContext.sessionCount,
                activityPattern: temporalContext.activityPattern as
                  | 'regular'
                  | 'irregular'
                  | 'declining'
                  | 'increasing'
                  | undefined,
                avgSessionGap: temporalContext.avgSessionGap,
                shouldGreet: temporalContext.shouldGreet,
                greetingContext: temporalContext.greetingContext,
              }
            : undefined,
        });

      // Build messages
      const memoryDays = user.memoryDays || 5;
      const limitedHistory = this.limitConversationHistory(
        request.conversationHistory || [],
        memoryDays
      );

      const messages: AIMessage[] = [
        { role: MessageRole.SYSTEM, content: systemPrompt },
        ...limitedHistory,
        { role: MessageRole.USER, content: request.message },
      ];

      // ========================================
      // STREAM RESPONSE
      // ========================================

      const aiModels = plansManager.getAIModels(request.planType);
      if (!aiModels || aiModels.length === 0) {
        throw new Error('No AI models configured for this plan');
      }

      const stream = this.factory.streamWithFallback(request.planType, {
        model: createAIModel(aiModels[0].modelId),
        messages,
        temperature: request.temperature ?? 0.7,
        maxTokens: request.maxTokens ?? 2048,
        userId: request.userId,
      });

      // Apply response delay before streaming
      const responseDelay = user.responseDelay || 5;
      if (responseDelay > 0) {
        await this.delay(responseDelay * 1000);
      }

      // Process stream chunks
      for await (const chunk of stream) {
        fullResponse += chunk;
        request.onChunk(chunk);
      }

      // ========================================
      // POST-STREAM: DEDUCT WORDS
      // ========================================

      const inputWords = this.countWords(request.message);
      const outputWords = this.countWords(fullResponse);
      const totalWordsUsed = inputWords + outputWords;

      await usageService.deductWords(request.userId, totalWordsUsed);

      request.onComplete();
    } catch (error) {
      request.onError(this.handleError(error));
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check usage limits before chat
   */
  private async checkUsageLimits(
    userId: string,
    estimatedWords: number
  ): Promise<UsageCheckResult> {
    try {
      const result = await usageService.canUseWords(userId, estimatedWords);

      if (!result.canUse) {
        // Generate natural language message
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

  /**
   * Limit conversation history based on memory days
   */
  private limitConversationHistory(history: AIMessage[], memoryDays: number): AIMessage[] {
    // For now, just limit by message count
    // TODO: Implement date-based filtering when timestamps are added to messages
    const maxMessages = memoryDays * 10; // Rough estimate: 10 messages per day
    return history.slice(-maxMessages);
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SUGGESTIONS & UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get conversation suggestions based on plan
   */
  async getSuggestions(planType: PlanType, context: string): Promise<string[]> {
    try {
      const plan = plansManager.getPlan(planType);
      if (!plan) return [];

      const aiModels = plansManager.getAIModels(planType);
      if (!aiModels || aiModels.length === 0) return [];

      const response = await this.factory.executeWithFallback(planType, {
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
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  }

  /**
   * Get available plans
   */
  getAvailablePlans(): PlanType[] {
    return Object.values(PlanType);
  }

  /**
   * Get plan information
   */
  getPlanInfo(planType: PlanType) {
    const plan = plansManager.getPlan(planType);

    if (!plan) {
      throw new Error('Invalid plan type');
    }

    const aiModels = plansManager.getAIModels(planType);

    return {
      planType,
      displayName: plan.displayName,
      primaryModel: aiModels?.[0]?.modelId || 'unknown',
      fallbackAvailable: aiModels && aiModels.length > 1,
      limits: plan.limits,
    };
  }

  /**
   * Get service statistics
   */
  getStats() {
    return this.factory.getStats();
  }

  /**
   * Health check all providers
   */
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

  /**
   * Handle and transform errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof AIError) {
      const userMessage = error.getUserMessage();
      const serviceError = new Error(userMessage);
      (serviceError as any).code = error.code;
      (serviceError as any).statusCode = ErrorHandler.getHttpStatus(error);
      return serviceError;
    }

    if (error instanceof Error && (error as any).code === 'USAGE_LIMIT_EXCEEDED') {
      return error; // Already formatted with natural message
    }

    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const aiService = AIService.getInstance();