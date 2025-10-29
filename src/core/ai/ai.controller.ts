// src/controllers/ai.controller.ts
// SORIVA Backend - AI Controller (WITH PIPELINE ORCHESTRATOR INTEGRATION 🔥)
// 100% Dynamic | Class-Based | Modular | Future-Proof | Secured | 10/10 Quality

import { Request, Response, NextFunction } from 'express';
import { plansManager } from '../../constants/plansManager';
import { ProviderFactory } from './providers/provider.factory';
import { PlanType } from '../../constants/plans';
import type { AuthUser } from './middlewares/admin.middleware';
// ✅ NEW: Pipeline Orchestrator Integration
import { pipelineOrchestrator } from '../../services/pipeline.orchestrator';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TYPE DEFINITIONS (Compatible with existing types)
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
  enablePipeline: boolean; // ✅ NEW: Toggle pipeline on/off
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
      enablePipeline: process.env.AI_ENABLE_PIPELINE !== 'false', // ✅ NEW
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

interface SuggestionsRequest {
  context: string;
  count?: number;
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
 * LOGGER (Enhanced)
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
  /**
   * Get plan type safely (handles both string and enum)
   */
  public static getPlanType(user: AuthUser): PlanType {
    // If user has planType, use it
    if ((user as any).planType) {
      const planType = (user as any).planType;

      // If it's already a PlanType enum value, return it
      if (Object.values(PlanType).includes(planType)) {
        return planType;
      }

      // If it's a string, try to match to enum
      const planTypeString = String(planType).toUpperCase();
      const matchedPlan = Object.entries(PlanType).find(
        ([key, value]) =>
          key.toUpperCase() === planTypeString || String(value).toUpperCase() === planTypeString
      );

      if (matchedPlan) {
        return matchedPlan[1] as PlanType;
      }
    }

    // ✅ Default to STARTER (correct singular form!)
    return PlanType.STARTER;
  }

  /**
   * Safely access response metadata
   */
  public static extractMetadata(response: any): any {
    const metadata = response?.metadata || {};

    return {
      provider: metadata.provider,
      model: metadata.model || metadata.modelUsed,
      usedFallback: metadata.usedFallback,
      tokensUsed: metadata.tokensUsed || metadata.usage?.total,
    };
  }

  /**
   * ✅ NEW: Get user gender safely
   */
  public static getGender(user: AuthUser): 'male' | 'female' {
    const gender = (user as any).gender;
    if (gender === 'female') return 'female';
    return 'male'; // Default
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

    // Initialize ProviderFactory
    this.providerFactory = ProviderFactory.getInstance({
      groqApiKey: process.env.GROQ_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      googleApiKey: process.env.GOOGLE_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
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
   * GET /api/ai/health
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
   * GET /api/ai/tiers
   */
  public getTiers = async (req: Request, res: Response): Promise<void> => {
    try {
      Logger.info('Get tiers request');

      const plans = plansManager.getEnabledPlans();

      const tiers = plans.map((plan) => {
        // Get plan type from plan name (convert to PlanType enum)
        const planType = plan.name.toUpperCase() as PlanType;

        return {
          id: plan.id,
          name: plan.name,
          tier: plan.name, // Use plan name as tier identifier
          limits: {
            dailyMessages: plansManager.getDailyWordLimit(planType), // ✅ Correct method name
            messageCooldown: 0, // PlansManager doesn't expose this method, use default
            botResponseLimit: plansManager.getBotResponseLimit(planType),
          },
          features: plan.features,
          aiModel: plan.aiModels[0]?.displayName || 'Unknown',
          hasCooldown: !!plan.cooldownBooster,
          hasAddon: !!plan.addonBooster,
        };
      });

      const response = ResponseFormatter.success({
        tiers,
        count: tiers.length,
      });

      res.json(response);
    } catch (error) {
      Logger.error('Get tiers error', error);
      res.status(500).json(ResponseFormatter.error('Failed to fetch tiers', error));
    }
  };

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * PROTECTED ROUTES (WITH PIPELINE INTEGRATION 🔥)
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Send a chat message (non-streaming) - WITH PIPELINE ORCHESTRATOR
   * POST /api/ai/chat
   */
  public chat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate user authentication
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

      // Get user's plan type and gender
      const planType = AIHelper.getPlanType(req.user);
      const gender = AIHelper.getGender(req.user);
      const userName = (req.user as any).name || (req.user as any).username;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ✅ PIPELINE ORCHESTRATOR: Generate Dynamic System Prompt
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      let systemPrompt: string | undefined;
      let pipelineMetadata: any = {};

      if (this.config.get().enablePipeline) {
        try {
          const pipelineResult = await pipelineOrchestrator.execute({
            userId: req.user.userId,
            sessionId: (req as any).sessionID || `session_${Date.now()}`,
            userName,
            gender,
            planType,
            userMessage: message,
            conversationHistory,
          });

          // Check for abuse/inappropriate content
          if (pipelineResult.flags.isAbusive) {
            Logger.warn(`Abusive content detected from user: ${req.user.userId}`);
            res
              .status(400)
              .json(
                ResponseFormatter.error(
                  'Inappropriate content detected. Please keep the conversation respectful.'
                )
              );
            return;
          }

          // Use the dynamic system prompt
          systemPrompt = pipelineResult.systemPrompt;

          // Store pipeline metadata for response
          pipelineMetadata = {
            pipelineConfidence: pipelineResult.metrics.confidence,
            pipelineProcessingTime: pipelineResult.metrics.processingTimeMs,
            analyzersUsed: pipelineResult.metrics.analyzersUsed,
            detectedLanguage: pipelineResult.analysis.language.detection.primaryLanguage,
            queryType: pipelineResult.analysis.context.queryType,
            isEmotionalSupport: pipelineResult.flags.isEmotionalSupport,
            isTechnicalQuery: pipelineResult.flags.isTechnicalQuery,
          };

          Logger.success(`Pipeline generated system prompt (${systemPrompt.length} chars)`);
        } catch (pipelineError) {
          Logger.error('Pipeline execution failed, using default behavior', pipelineError);
          // Continue without pipeline if it fails
        }
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Build messages array with dynamic system prompt
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const messages: ChatMessage[] = [];

      // Add system prompt if generated by pipeline
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      // Add conversation history
      if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
      }

      // Add user message
      messages.push({
        role: 'user',
        content: message,
      });

      // Get bot response limit for the plan
      const botLimit = plansManager.getBotResponseLimit(planType);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Execute chat request with fallback
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      const response = await this.providerFactory.executeWithFallback(planType, {
        messages,
        temperature: temperature || this.config.get().defaultTemperature,
        maxTokens: maxTokens || botLimit,
      } as any);

      Logger.success('Chat response generated');

      const aiMetadata = AIHelper.extractMetadata(response);

      const responseData = ResponseFormatter.success(
        {
          response: response.content,
          metadata: {
            ...aiMetadata,
            ...pipelineMetadata, // Include pipeline metadata
          },
        },
        {
          pipelineEnabled: this.config.get().enablePipeline,
        }
      );

      res.json(responseData);
    } catch (error) {
      Logger.error('Chat error', error);
      res.status(500).json(ResponseFormatter.error('Chat request failed', error));
    }
  };

  /**
   * Stream a chat message (Server-Sent Events) - WITH PIPELINE ORCHESTRATOR
   * POST /api/ai/chat/stream
   */
  public streamChat = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate user authentication
      if (!req.user) {
        res.status(401).json(ResponseFormatter.error('Authentication required'));
        return;
      }

      Logger.info(`Stream chat request from user: ${req.user.userId}`);

      const { message, conversationHistory, temperature, maxTokens }: ChatRequest = req.body;

      // Validate request
      RequestValidator.validateMessage(message);
      RequestValidator.validateTemperature(temperature);
      RequestValidator.validateMaxTokens(maxTokens);
      RequestValidator.validateConversationHistory(conversationHistory);

      // Get user's plan type and gender
      const planType = AIHelper.getPlanType(req.user);
      const gender = AIHelper.getGender(req.user);
      const userName = (req.user as any).name || (req.user as any).username;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ✅ PIPELINE ORCHESTRATOR: Generate Dynamic System Prompt
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      let systemPrompt: string | undefined;

      if (this.config.get().enablePipeline) {
        try {
          const pipelineResult = await pipelineOrchestrator.execute({
            userId: req.user.userId,
            sessionId: (req as any).sessionID || `session_${Date.now()}`,
            userName,
            gender,
            planType,
            userMessage: message,
            conversationHistory,
          });

          // Check for abuse
          if (pipelineResult.flags.isAbusive) {
            Logger.warn(`Abusive content detected from user: ${req.user.userId}`);
            res.status(400).json(ResponseFormatter.error('Inappropriate content detected.'));
            return;
          }

          systemPrompt = pipelineResult.systemPrompt;
          Logger.success(`Pipeline generated system prompt for streaming`);
        } catch (pipelineError) {
          Logger.error('Pipeline failed for streaming, continuing without', pipelineError);
        }
      }

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Build messages array
      const messages: ChatMessage[] = [];

      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
      }

      messages.push({ role: 'user', content: message });

      // Get bot response limit
      const botLimit = plansManager.getBotResponseLimit(planType);

      // Stream the response
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
   * POST /api/ai/suggestions
   */
  public getSuggestions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate user authentication
      if (!req.user) {
        res.status(401).json(ResponseFormatter.error('Authentication required'));
        return;
      }

      Logger.info(`Suggestions request from user: ${req.user.userId}`);

      const { context } = req.query as { context?: string };
      const count = parseInt(req.query.count as string) || 3;

      // Validate request
      if (!context || typeof context !== 'string') {
        res.status(400).json(ResponseFormatter.error('Context is required'));
        return;
      }

      // Get user's plan type safely
      const planType = AIHelper.getPlanType(req.user);

      // Build messages array
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `Generate ${count} short, relevant follow-up questions or conversation starters based on the context. Return as JSON array of strings.`,
        },
        {
          role: 'user',
          content: `Context: ${context}`,
        },
      ];

      // Generate suggestions using AI
      const response = await this.providerFactory.executeWithFallback(planType, {
        messages,
        temperature: 0.8,
        maxTokens: 200,
      } as any);

      // Parse suggestions
      let suggestions: string[] = [];
      try {
        suggestions = JSON.parse(response.content);
        if (!Array.isArray(suggestions)) {
          suggestions = [response.content];
        }
      } catch {
        suggestions = response.content.split('\n').filter((s) => s.trim());
      }

      Logger.success('Suggestions generated');

      const responseData = ResponseFormatter.success({
        suggestions: suggestions.slice(0, count),
      });

      res.json(responseData);
    } catch (error) {
      Logger.error('Get suggestions error', error);
      res.status(500).json(ResponseFormatter.error('Failed to generate suggestions', error));
    }
  };

  /**
   * Get service statistics
   * GET /api/ai/stats
   */
  public getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      Logger.info('Stats request');

      // Get provider factory stats
      const factoryStats = this.providerFactory.getStats();
      const perPlanStats = this.providerFactory.getStatsPerPlan();
      const cacheInfo = this.providerFactory.getCacheInfo();

      // Get plans info
      const enabledPlans = plansManager.getEnabledPlans();

      // ✅ NEW: Get pipeline health status
      const pipelineHealth = pipelineOrchestrator.getHealthStatus();

      const responseData = ResponseFormatter.success({
        factory: factoryStats,
        perPlan: perPlanStats,
        cache: cacheInfo,
        plans: {
          total: enabledPlans.length,
          enabled: enabledPlans.map((p) => p.name),
        },
        pipeline: pipelineHealth, // ✅ NEW: Pipeline health
      });

      res.json(responseData);
    } catch (error) {
      Logger.error('Get stats error', error);
      res.status(500).json(ResponseFormatter.error('Failed to fetch stats', error));
    }
  };
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXPORT SINGLETON INSTANCE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export const aiController = AIController.getInstance();
