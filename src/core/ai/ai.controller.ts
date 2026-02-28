// src/core/ai/ai.controller.ts
// SORIVA Backend - AI Controller (CLEAN & LEAN 🔥)
// 100% Dynamic | Class-Based | Modular | Future-Proof | Secured | 10/10 Quality
// CLEANED: Feb 28, 2026 - Removed dead code (pipeline, router, graceful)

import { Request, Response, NextFunction } from 'express';
import { plansManager } from '../../constants/plansManager';
import { ProviderFactory } from './providers/provider.factory';
import { PlanType } from '../../constants/plans';
import type { AuthUser } from './middlewares/admin.middleware';
import UsageService from '../../modules/billing/usage.service';
import { cleanResponse } from './soriva-delta-engine';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TYPE DEFINITIONS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CONFIGURATION (100% Dynamic - ENV Driven)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

interface AIControllerConfiguration {
  defaultTemperature: number;
  maxRetries: number;
  requestTimeout: number;
  enableLogging: boolean;
  enableCache: boolean;
  enableMetrics: boolean;
  enableTokenTracking: boolean;
}

class AIControllerConfig {
  private static instance: AIControllerConfig;
  private config: AIControllerConfiguration;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  public static getInstance(): AIControllerConfig {
    if (!AIControllerConfig.instance) {
      AIControllerConfig.instance = new AIControllerConfig();
    }
    return AIControllerConfig.instance;
  }

  private loadConfiguration(): AIControllerConfiguration {
    return {
      defaultTemperature: parseFloat(process.env.AI_DEFAULT_TEMPERATURE || '0.7'),
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
      requestTimeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '30000', 10),
      enableLogging: process.env.AI_ENABLE_LOGGING !== 'false',
      enableCache: process.env.AI_ENABLE_CACHE !== 'false',
      enableMetrics: process.env.AI_ENABLE_METRICS !== 'false',
      enableTokenTracking: process.env.AI_ENABLE_TOKEN_TRACKING !== 'false',
    };
  }

  public get(): AIControllerConfiguration {
    return this.config;
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * INTERFACES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

interface AuthRequest extends Request {
  user?: AuthUser;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  metadata?: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * LOGGER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class Logger {
  private static prefix = '[AIController]';

  public static info(message: string, data?: any): void {
    const config = AIControllerConfig.getInstance().get();
    if (config.enableLogging) {
      console.log(`${this.prefix} ${message}`, data ? data : '');
    }
  }

  public static error(message: string, error?: any): void {
    console.error(`${this.prefix} ❌ ${message}`, error || '');
  }

  public static warn(message: string, data?: any): void {
    console.warn(`${this.prefix} ⚠️ ${message}`, data || '');
  }

  public static success(message: string, data?: any): void {
    const config = AIControllerConfig.getInstance().get();
    if (config.enableLogging) {
      console.log(`${this.prefix} ✅ ${message}`, data || '');
    }
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RESPONSE FORMATTER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class ResponseFormatter {
  public static success<T>(data: T, metadata?: Record<string, any>): StandardResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  public static error(message: string, error?: any): StandardResponse {
    return {
      success: false,
      message,
      error: error instanceof Error ? error.message : String(error),
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * REQUEST VALIDATOR
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class RequestValidator {
  public static validateMessage(message: any): void {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Message is required and must be a non-empty string');
    }
    if (message.length > 10000) {
      throw new Error('Message is too long (max 10000 characters)');
    }
  }

  public static validateTemperature(temperature?: number): void {
    if (temperature !== undefined) {
      if (typeof temperature !== 'number' || temperature < 0 || temperature > 2) {
        throw new Error('Temperature must be a number between 0 and 2');
      }
    }
  }

  public static validateMaxTokens(maxTokens?: number): void {
    if (maxTokens !== undefined) {
      if (typeof maxTokens !== 'number' || maxTokens < 1 || maxTokens > 100000) {
        throw new Error('MaxTokens must be a number between 1 and 100000');
      }
    }
  }

  public static validateConversationHistory(history?: any[]): void {
    if (history !== undefined && !Array.isArray(history)) {
      throw new Error('ConversationHistory must be an array');
    }
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * HELPER FUNCTIONS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class AIHelper {
  public static getPlanType(user: AuthUser): PlanType {
    if ((user as any).planType) {
      const planType = (user as any).planType;
      if (Object.values(PlanType).includes(planType)) {
        return planType;
      }
      const planTypeString = String(planType).toUpperCase();
      const matchedPlan = Object.entries(PlanType).find(
        ([key, value]) =>
          key.toUpperCase() === planTypeString || String(value).toUpperCase() === planTypeString
      );
      if (matchedPlan) {
        return matchedPlan[1] as PlanType;
      }
    }
    return PlanType.STARTER;
  }

  public static extractMetadata(response: any): any {
    const metadata = response?.metadata || {};
    return {
      provider: metadata.provider,
      model: metadata.model || metadata.modelUsed,
      usedFallback: metadata.usedFallback,
      tokensUsed: metadata.tokensUsed || metadata.usage?.total,
    };
  }

  public static getGender(user: AuthUser): 'male' | 'female' {
    const gender = (user as any).gender;
    if (gender === 'female') return 'female';
    return 'male';
  }

  // Simple token estimation (~4 chars per token)
  public static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AI CONTROLLER CLASS (Singleton Pattern)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class AIController {
  private static instance: AIController;
  private providerFactory: ProviderFactory;
  private config: AIControllerConfig;
  private isInitialized: boolean = false;

  private constructor() {
    this.config = AIControllerConfig.getInstance();
    this.providerFactory = ProviderFactory.getInstance({
      googleApiKey: process.env.GOOGLE_API_KEY,
      mistralApiKey: process.env.MISTRAL_API_KEY,
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
    });
    this.isInitialized = true;
    Logger.info('AIController initialized successfully');
  }

  public static getInstance(): AIController {
    if (!AIController.instance) {
      AIController.instance = new AIController();
    }
    return AIController.instance;
  }

  /**
   * Health check endpoint
   */
  public health = async (req: Request, res: Response): Promise<void> => {
    try {
      const healthStatus = {
        status: this.isInitialized ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        providerFactory: this.providerFactory ? 'initialized' : 'not initialized',
        config: this.config.get(),
      };
      res.json(ResponseFormatter.success(healthStatus));
    } catch (error) {
      Logger.error('Health check failed', error);
      res.status(500).json(ResponseFormatter.error('Health check failed', error));
    }
  };

  /**
   * Get available AI tiers/plans
   */
  public getTiers = async (req: Request, res: Response): Promise<void> => {
    try {
      Logger.info('Get tiers request');
      const plans = plansManager.getEnabledPlans();

      const tiers = plans.map((plan) => {
        const planType = plan.name.toUpperCase() as PlanType;
        return {
          id: plan.id,
          name: plan.name,
          tier: plan.name,
          limits: {
            dailyMessages: plansManager.getDailyWordLimit(planType),
            messageCooldown: 0,
            botResponseLimit: plansManager.getBotResponseLimit(planType),
          },
          features: plan.features,
          aiModel: plan.aiModels[0]?.displayName || 'Unknown',
          hasCooldown: !!plan.cooldownBooster,
          hasAddon: !!plan.addonBooster,
        };
      });

      res.json(ResponseFormatter.success({ tiers, count: tiers.length }));
    } catch (error) {
      Logger.error('Get tiers error', error);
      res.status(500).json(ResponseFormatter.error('Failed to fetch tiers', error));
    }
  };

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * CHAT - CLEAN & SIMPLE (LLM is intelligent, we just guide)
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  public chat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ResponseFormatter.error('Authentication required'));
        return;
      }

      Logger.info(`Chat request from user: ${req.user.userId}`);

      const { message, conversationHistory, temperature, maxTokens }: ChatRequest = req.body;

      // Validate request
      RequestValidator.validateMessage(message);
      RequestValidator.validateTemperature(temperature);
      RequestValidator.validateMaxTokens(maxTokens);
      RequestValidator.validateConversationHistory(conversationHistory);

      const planType = AIHelper.getPlanType(req.user);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 1: TOKEN CHECK
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const tokenPools = await UsageService.getTokenPools(req.user.userId);
      const estimatedCost = AIHelper.estimateTokens(message);
      const totalAvailable = tokenPools.premium.remaining + tokenPools.bonus.remaining;
      
      const canAfford = {
        canAfford: totalAvailable >= estimatedCost,
        usePool: tokenPools.premium.remaining >= estimatedCost ? 'premium' : 'bonus'
      };

      if (!canAfford.canAfford) {
        Logger.warn(`Insufficient tokens for user ${req.user.userId}`);
        res.status(429).json(
          ResponseFormatter.error('Insufficient tokens. Please upgrade your plan or purchase boosters.', {
            needed: estimatedCost,
            available: { premium: tokenPools.premium.remaining, bonus: tokenPools.bonus.remaining },
          })
        );
        return;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 2: BUILD MESSAGES
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const messages: ChatMessage[] = [];

      if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
      }

      messages.push({ role: 'user', content: message });

      const botLimit = plansManager.getBotResponseLimit(planType);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 3: EXECUTE LLM REQUEST
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const response = await this.providerFactory.executeWithFallback(planType, {
        messages,
        temperature: temperature || this.config.get().defaultTemperature,
        maxTokens: maxTokens || botLimit,
      } as any);

      Logger.success('Chat response generated');

      const aiMetadata = AIHelper.extractMetadata(response);
      const tokensUsed = response.usage?.totalTokens || estimatedCost;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 4: DEDUCT TOKENS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      if (tokensUsed > 0 && this.config.get().enableTokenTracking) {
        try {
          const deductionResult = await UsageService.deductTokens(
            req.user.userId,
            tokensUsed,
            canAfford.usePool as 'premium' | 'bonus'
          );
          if (deductionResult.success) {
            Logger.success(`Deducted ${tokensUsed} tokens from ${canAfford.usePool as 'premium' | 'bonus'} pool`);
          }
        } catch (deductionError) {
          Logger.error('Token deduction error', deductionError);
        }
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // STEP 5: RETURN RESPONSE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const responseData = ResponseFormatter.success(
        {
          response: cleanResponse(response.content),
          metadata: {
            ...aiMetadata,
            tokensUsed,
            poolUsed: canAfford.usePool as 'premium' | 'bonus',
            estimatedCost,
          },
        },
        {
          tokenTrackingEnabled: this.config.get().enableTokenTracking,
        }
      );

      res.json(responseData);
    } catch (error) {
      Logger.error('Chat error', error);
      res.status(500).json(ResponseFormatter.error('Chat request failed', error));
    }
  };

  /**
   * Stream chat - WITH TOKEN POOL
   */
  public streamChat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ResponseFormatter.error('Authentication required'));
        return;
      }

      Logger.info(`Stream chat request from user: ${req.user.userId}`);

      const { message, conversationHistory, temperature, maxTokens }: ChatRequest = req.body;

      RequestValidator.validateMessage(message);
      RequestValidator.validateTemperature(temperature);
      RequestValidator.validateMaxTokens(maxTokens);
      RequestValidator.validateConversationHistory(conversationHistory);

      const planType = AIHelper.getPlanType(req.user);

      // Token check
      const tokenPools = await UsageService.getTokenPools(req.user.userId);
      const estimatedCost = AIHelper.estimateTokens(message);
      const totalAvailable = tokenPools.premium.remaining + tokenPools.bonus.remaining;
      
      const canAfford = {
        canAfford: totalAvailable >= estimatedCost,
        usePool: tokenPools.premium.remaining >= estimatedCost ? 'premium' : 'bonus'
      };

      if (!canAfford.canAfford) {
        res.status(429).json(ResponseFormatter.error('Insufficient tokens', {
          needed: estimatedCost,
          available: { premium: tokenPools.premium.remaining, bonus: tokenPools.bonus.remaining },
        }));
        return;
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Build messages
      const messages: ChatMessage[] = [];

      if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
      }

      messages.push({ role: 'user', content: message });

      const botLimit = plansManager.getBotResponseLimit(planType);

      // Stream response
      const stream = this.providerFactory.streamWithFallback(planType, {
        messages,
        temperature: temperature || this.config.get().defaultTemperature,
        maxTokens: maxTokens || botLimit,
      } as any);

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();

      // Deduct tokens
      if (this.config.get().enableTokenTracking) {
        try {
          await UsageService.deductTokens(req.user.userId, estimatedCost, canAfford.usePool as 'premium' | 'bonus');
          Logger.success(`Stream completed. Deducted ${estimatedCost} tokens`);
        } catch (deductionError) {
          Logger.error('Token deduction error after streaming', deductionError);
        }
      }

      Logger.success('Stream chat completed');
    } catch (error) {
      Logger.error('Stream chat error', error);

      if (!res.headersSent) {
        res.status(500).json(ResponseFormatter.error('Stream chat failed', error));
      } else {
        res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
        res.end();
      }
    }
  };

  /**
   * Get conversation suggestions
   */
  public getSuggestions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ResponseFormatter.error('Authentication required'));
        return;
      }

      const { context } = req.query as { context?: string };
      const count = parseInt(req.query.count as string) || 3;

      if (!context || typeof context !== 'string') {
        res.status(400).json(ResponseFormatter.error('Context is required'));
        return;
      }

      const planType = AIHelper.getPlanType(req.user);

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `Generate ${count} short, relevant follow-up questions or conversation starters based on the context. Return as JSON array of strings.`,
        },
        { role: 'user', content: `Context: ${context}` },
      ];

      const response = await this.providerFactory.executeWithFallback(planType, {
        messages,
        temperature: 0.8,
        maxTokens: 200,
      } as any);

      let suggestions: string[] = [];
      try {
        suggestions = JSON.parse(response.content);
        if (!Array.isArray(suggestions)) {
          suggestions = [response.content];
        }
      } catch {
        suggestions = response.content.split('\n').filter((s: string) => s.trim());
      }

      res.json(ResponseFormatter.success({ suggestions: suggestions.slice(0, count) }));
    } catch (error) {
      Logger.error('Get suggestions error', error);
      res.status(500).json(ResponseFormatter.error('Failed to generate suggestions', error));
    }
  };

  /**
   * Get service statistics
   */
  public getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      Logger.info('Stats request');

      const factoryStats = this.providerFactory.getStats();
      const perPlanStats = this.providerFactory.getStatsPerPlan();
      const cacheInfo = this.providerFactory.getCacheInfo();
      const enabledPlans = plansManager.getEnabledPlans();

      res.json(ResponseFormatter.success({
        factory: factoryStats,
        perPlan: perPlanStats,
        cache: cacheInfo,
        plans: { total: enabledPlans.length, enabled: enabledPlans.map((p) => p.name) },
      }));
    } catch (error) {
      Logger.error('Get stats error', error);
      res.status(500).json(ResponseFormatter.error('Failed to fetch stats', error));
    }
  };
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXPORT SINGLETON
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export const aiController = AIController.getInstance();