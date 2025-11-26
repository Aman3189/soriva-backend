/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI SERVICE - TOKEN OPTIMIZED
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Optimized: November 16, 2025
 * Change: Conversation history limited to 2-6 messages (was 50+)
 * Impact: 340 tokens saved per request
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

import SystemPromptService from '../../core/ai/prompts/system-prompt.service';
import usageService from '../../modules/billing/usage.service';
import BrainService from './brain.service';
import { prisma } from '../../config/prisma';
import { plansManager, PlanType } from '../../constants';
import { MemoryContext } from '../../modules/chat/memoryManager';
import { EmotionResult } from './emotion.detector';
import { gracefulMiddleware } from './graceful-response';

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
  'edge': PlanType.EDGE,
  'life': PlanType.LIFE,
  'STARTER': PlanType.STARTER,
  'PLUS': PlanType.PLUS,
  'PRO': PlanType.PRO,
  'EDGE': PlanType.EDGE,
  'LIFE': PlanType.LIFE,
};
const RESPONSE_WORD_LIMITS = {
  [PlanType.STARTER]: 80,
  [PlanType.PLUS]: 150,
  [PlanType.PRO]: 300,
  [PlanType.EDGE]: 500,
  [PlanType.LIFE]: 1000,
};
function normalizePlanType(planType: PlanType | string): PlanType {
  const normalized = PLAN_TYPE_MAPPING[planType as string] || PlanType.STARTER;
  console.log(`[AIService] Plan normalization: ${planType} → ${normalized}`);
  return normalized;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ OPTIMIZED: CONVERSATION HISTORY LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HISTORY_LIMITS = {
  [PlanType.STARTER]: 2,
  [PlanType.PLUS]: 3,
  [PlanType.PRO]: 4,
  [PlanType.EDGE]: 5,
  [PlanType.LIFE]: 6,
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

    console.log('✅ AI Service initialized with all providers & services');
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
        console.error('[AIService] Invalid plan:', request.planType, '→', normalizedPlanType);
        throw new Error('Invalid subscription plan');
      }

      const estimatedWords = Math.ceil(request.message.length / 5);
      const usageCheck = await this.checkUsageLimits(request.userId, estimatedWords);
      if (!usageCheck.canUse) {
        const error = new Error(usageCheck.naturalMessage || usageCheck.reason);
        (error as any).code = 'USAGE_LIMIT_EXCEEDED';
        (error as any).statusCode = 429;
        throw error;
      }

      const temporalContext = await BrainService.getTemporalContext(request.userId);
      const usage = await prisma.usage.findUnique({
        where: { userId: request.userId },
      });
      const boosterContext = await usageService.getBoosterContext(request.userId);

      const hasStudioAccess = (
        normalizedPlanType === PlanType.PRO ||
        normalizedPlanType === PlanType.EDGE ||
        normalizedPlanType === PlanType.LIFE
      );
      const credits = hasStudioAccess
        ? await usageService.checkStudioCredits(request.userId)
        : undefined;

      // 🔥 CRITICAL FIX: ALWAYS call buildCompletePrompt, ignore request.systemPrompt
      console.log('🚨🚨🚨 BEFORE buildCompletePrompt CALL 🚨🚨🚨');
      
      const systemPrompt = SystemPromptService.buildCompletePrompt({
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

      console.log('🚨🚨🚨 AFTER buildCompletePrompt CALL 🚨🚨🚨');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 SYSTEM PROMPT FULL ANALYSIS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 Total Length:', systemPrompt.length, 'chars');
      console.log('🔍 Estimated Tokens:', Math.ceil(systemPrompt.length / 4));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 FULL SYSTEM PROMPT:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(systemPrompt);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const memoryDays = user.memoryDays || 5;
      const limitedHistory = this.limitConversationHistory(
        request.conversationHistory || [],
        memoryDays,
        normalizedPlanType
      );

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
      // 🔍 DEBUG: Check actual messages being sent
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 MESSAGES BEING SENT TO AI:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
messages.forEach((msg, index) => {
  console.log(`Message ${index} (${msg.role}):`);
  console.log(`  Length: ${msg.content.length} chars`);
  console.log(`  Words: ${msg.content.split(/\s+/).length}`);
  console.log(`  Content preview: ${msg.content.substring(0, 100)}...`);
});
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const aiModels = plansManager.getAIModels(normalizedPlanType);
      if (!aiModels || aiModels.length === 0) {
        throw new Error('No AI models configured for this plan');
      }

      const response: AIResponse = await this.factory.executeWithFallback(normalizedPlanType, {
        model: createAIModel(aiModels[0].modelId),
        messages,
        temperature: request.temperature ?? 0.7,
        maxTokens: request.maxTokens ?? (normalizedPlanType === PlanType.STARTER ? 150 : 2048),       
        userId: request.userId,
        
      });
      
      const gracefulResult = await gracefulMiddleware.process(
        request.message,
        response.content
      );

      if (gracefulResult.needsRegeneration && gracefulResult.regenerationPrompts) {
        console.log('[AIService] 🔄 Regenerating response...');
        
        const { systemPrompt, userPrompt } = gracefulResult.regenerationPrompts;
        
        const regeneratedResponse = await this.factory.executeWithFallback(normalizedPlanType, {
          model: createAIModel(aiModels[0].modelId),
          messages: [
            {
              role: MessageRole.SYSTEM,
              content: systemPrompt,
            },
            {
              role: MessageRole.USER,
              content: userPrompt,
            },
          ],
          temperature: 0.3,
          maxTokens: 150,
          userId: request.userId,
        });
        
        console.log('[AIService] ✅ Response regenerated');
        response.content = regeneratedResponse.content;
        gracefulResult.wasModified = true;
      } else {
        response.content = gracefulResult.finalResponse;
      }
      const wordLimit = RESPONSE_WORD_LIMITS[normalizedPlanType] || 80;
      const responseWords = response.content.trim().split(/\s+/);
      if (responseWords.length > wordLimit) {
        response.content = responseWords.slice(0, wordLimit).join(' ') + '...';
        console.log(`[AIService] ⚠️ Truncated response: ${responseWords.length} → ${wordLimit} words`);
      }
      const responseDelay = user.responseDelay || 5;
      if (responseDelay > 0) {
        await this.delay(responseDelay * 1000);
      }

      const inputWords = this.countWords(request.message);
      const outputWords = this.countWords(response.content);
      const totalWordsUsed = inputWords + outputWords;

      const deductResult = await usageService.deductWords(request.userId, totalWordsUsed);

      if (!deductResult.success) {
        console.warn('[AIService] Failed to deduct words:', deductResult.message);
      }

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
          responseDelay: responseDelay,
          memoryDays: memoryDays,
          gracefulHandling: gracefulResult.analytics,
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

      const temporalContext = await BrainService.getTemporalContext(request.userId);
      const usage = await prisma.usage.findUnique({ where: { userId: request.userId } });
      const boosterContext = await usageService.getBoosterContext(request.userId);
      
      const hasStudioAccess = (
        normalizedPlanType === PlanType.PRO ||
        normalizedPlanType === PlanType.EDGE ||
        normalizedPlanType === PlanType.LIFE
      );
      const credits = hasStudioAccess
        ? await usageService.checkStudioCredits(request.userId)
        : undefined;

      // 🔥 CRITICAL FIX: ALWAYS call buildCompletePrompt, ignore request.systemPrompt
      const systemPrompt = SystemPromptService.buildCompletePrompt({
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

      const aiModels = plansManager.getAIModels(normalizedPlanType);
      if (!aiModels || aiModels.length === 0) {
        throw new Error('No AI models configured for this plan');
      }

      const stream = this.factory.streamWithFallback(normalizedPlanType, {
        model: createAIModel(aiModels[0].modelId),
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
  
  console.log(`[AIService] 📊 History: ${maxMessages} messages (plan: ${planType})`);
  
  // ✅ STEP 1: Get last N messages
  const limited = history.slice(-maxMessages);
  
  // ✅ STEP 2: Truncate each message to max 100 words
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
  
  const tokensSaved = (history.length - limited.length) * 60;
  if (tokensSaved > 0) {
    console.log(`[AIService] 💰 Saved ~${tokensSaved} tokens from message limit`);
  }
  
  console.log(`[AIService] 💰 Truncated ${limited.length} messages to max 100 words each`);
  
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
      console.error('Failed to generate suggestions:', error);
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