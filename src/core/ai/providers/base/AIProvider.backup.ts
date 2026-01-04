/**
 * SORIVA AI PROVIDERS - ABSTRACT BASE CLASS
 * Created by: Amandeep, Punjab, India
 * Philosophy: "LLMs are already perfect. Our duty is to make them even more perfect."
 * 
 * Purpose: Base class for all AI providers with security & minimal overhead
 * Updated: November 2025 - Ultra-minimal approach, trust pipeline system prompts
 * 
 * KEY CHANGES:
 * ✅ Removed double system prompt injection (trust pipeline)
 * ✅ Minimal security checks (only critical threats)
 * ✅ Token-optimized (no redundant instructions)
 * ✅ Clean, production-ready code
 */

import {
  AIProvider,
  AIModel,
  AIRequestConfig,
  AIResponse,
  IAIProvider,
  ProviderConfig,
  RateLimitStatus,
  RetryConfig,
  SecurityFlags,
  SORIVA_IDENTITY,
  MessageRole,
} from './types';

import {
  AIError,
  ProviderTimeoutError,
  ProviderRateLimitError,
  JailbreakError,
  SystemPromptExposureError,
  ModelRevealError,
  ErrorHandler,
} from './errors';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOCAL TYPES (For internal pattern matching)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SecurityPattern {
  pattern: RegExp;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

interface FallbackConfig {
  provider: AIProvider;
  model: AIModel;
  triggerRate: number; // 0.5% = 0.005
  enabled: boolean;
}

interface PlanConfig {
  planType: string; // STARTER, PLUS, PRO, EDGE, LIFE
  responseDelay: number; // Seconds (5/3/2.5/2/1.5)
  memoryDays: number; // Days (5/10/15/25/30)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ABSTRACT BASE PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export abstract class AIProviderBase implements IAIProvider {
  public readonly provider: AIProvider;
  public readonly model: AIModel;

  protected readonly config: ProviderConfig;
  protected readonly retryConfig: RetryConfig;

  // Fallback Support
  protected fallbackConfig?: FallbackConfig;
  protected fallbackProvider?: AIProviderBase;

  // Plan-based Configuration
  protected planConfig?: PlanConfig;

  // Rate limiting tracking
  private rateLimitRemaining: number = 1000;
  private rateLimitReset: Date = new Date();

  // Request tracking
  private requestCount: number = 0;
  private fallbackCount: number = 0;

  constructor(config: ProviderConfig, fallbackProvider?: AIProviderBase) {
    this.config = config;
    this.provider = config.provider;
    this.model = config.model;
    this.fallbackProvider = fallbackProvider;

    // Default retry configuration
    this.retryConfig = {
      maxAttempts: config.maxRetries || 3,
      baseDelayMs: config.retryDelay || 1000,
      maxDelayMs: 30000,
      exponentialBackoff: true,
    };

    // Default fallback configuration
    if (fallbackProvider) {
      this.fallbackConfig = {
        provider: fallbackProvider.provider,
        model: fallbackProvider.model,
        triggerRate: 0.005, // 0.5% trigger rate
        enabled: true,
      };
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PLAN CONFIGURATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Set plan-specific configuration (delay, memory)
   */
  public setPlanConfig(planConfig: PlanConfig): void {
    this.planConfig = planConfig;
  }

  /**
   * Get current plan configuration
   */
  public getPlanConfig(): PlanConfig | undefined {
    return this.planConfig;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ABSTRACT METHODS (Must be implemented by child classes)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Send request to provider's API
   * Each provider implements their own API call logic
   */
  protected abstract sendRequest(config: AIRequestConfig): Promise<AIResponse>;

  /**
   * Stream response from provider's API
   * Each provider implements their own streaming logic
   */
  protected abstract sendStreamRequest(
    config: AIRequestConfig
  ): AsyncGenerator<string, void, unknown>;

  /**
   * Validate provider-specific configuration
   */
  protected abstract validateConfig(): void;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC INTERFACE METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Main chat method with minimal security checks, retry logic & fallback
   * 
   * Philosophy: Trust the pipeline's system prompt (already optimized)
   * No double injection - saves 200-370 tokens per request!
   */
  public async chat(config: AIRequestConfig): Promise<AIResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Step 1: MINIMAL security checks (only critical threats)
      this.performSecurityChecks(config);

      // Step 2: ✅ NO SYSTEM PROMPT INJECTION
      // Pipeline already sent optimized prompt (35-50 tokens)
      // Trust the AI's training + pipeline's instructions
      const securedConfig = config; // Use as-is

      // Step 3: Execute with retry logic and fallback
      const response = await this.executeWithRetryAndFallback(securedConfig, requestId);

      // Step 4: Apply response delay (plan-based)
      await this.applyResponseDelay();

      // Step 5: Track metrics
      this.trackRequest();

      // Step 6: Add metadata
      return {
        ...response,
        metadata: {
          ...response.metadata,
          requestId,
          latencyMs: Date.now() - startTime,
          provider: this.provider,
          usedFallback: response.metadata?.usedFallback || false,
        },
      };
    } catch (error) {
      this.logError(error, requestId, config);
      throw ErrorHandler.normalizeError(error);
    }
  }

  /**
   * Stream chat with security and retry logic
   */
  public async *streamChat(config: AIRequestConfig): AsyncGenerator<string, void, unknown> {
    try {
      // Minimal security checks
      this.performSecurityChecks(config);

      // ✅ NO SYSTEM PROMPT INJECTION - Trust pipeline
      const securedConfig = config; // Use as-is

      // Apply initial delay for streaming
      await this.applyResponseDelay();

      // Stream response
      yield* this.sendStreamRequest(securedConfig);

      // Track request
      this.trackRequest();
    } catch (error) {
      this.logError(error, this.generateRequestId(), config);
      throw ErrorHandler.normalizeError(error);
    }
  }

  /**
   * Validate provider configuration
   */
  public async validate(): Promise<boolean> {
    try {
      this.validateConfig();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Health check - ping the provider
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const testConfig: AIRequestConfig = {
        model: this.model,
        messages: [
          {
            role: MessageRole.USER,
            content: 'ping',
          },
        ],
        maxTokens: 5,
      };

      await this.sendRequest(testConfig);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current rate limit status
   */
  public async getRateLimitStatus(): Promise<RateLimitStatus> {
    return {
      remaining: this.rateLimitRemaining,
      limit: 1000, // Default, can be overridden
      resetAt: this.rateLimitReset,
    };
  }

  /**
   * Get fallback statistics
   */
  public getFallbackStats(): {
    totalRequests: number;
    fallbackCount: number;
    fallbackRate: number;
  } {
    return {
      totalRequests: this.requestCount,
      fallbackCount: this.fallbackCount,
      fallbackRate: this.requestCount > 0 ? (this.fallbackCount / this.requestCount) * 100 : 0,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RESPONSE DELAY (PLAN-BASED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Apply plan-based response delay for premium differentiation
   * STARTER: 5s, PLUS: 3s, PRO: 2.5s, EDGE: 2s, LIFE: 1.5s
   */
  private async applyResponseDelay(): Promise<void> {
    if (!this.planConfig?.responseDelay) {
      return; // No delay if not configured
    }

    const delayMs = this.planConfig.responseDelay * 1000; // Convert to milliseconds
    await this.sleep(delayMs);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MINIMAL SECURITY LAYER (CRITICAL THREATS ONLY)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * MINIMAL security checks - only block critical threats
   * Trust AI's training for most cases
   */
  private performSecurityChecks(config: AIRequestConfig): void {
    const userMessages = config.messages
      .filter((m) => m.role === MessageRole.USER)
      .map((m) => m.content.toLowerCase());

    const fullText = userMessages.join(' ');

    // Only check CRITICAL security threats
    this.detectCriticalJailbreaks(fullText);
    
    // Note: Removed excessive checks for:
    // - System prompt exposure (AI trained to not reveal)
    // - Model reveal attempts (Pipeline handles identity)
    // - Confidentiality breaches (AI knows boundaries)
  }

  /**
   * Detect ONLY critical jailbreak attempts
   * Minimal patterns - trust AI's ethical training
   */
  private detectCriticalJailbreaks(text: string): void {
    const criticalPatterns: SecurityPattern[] = [
      {
        pattern: /(you are now|act as|pretend to be) (dan|evil|unrestricted)/i,
        severity: 'CRITICAL',
        description: 'DAN/Evil mode jailbreak',
      },
      {
        pattern: /disregard (all )?(previous|safety|ethical) (rules|guidelines)/i,
        severity: 'CRITICAL',
        description: 'Disregard safety rules',
      },
      {
        pattern: /bypass (safety|security|ethical) (filter|check)/i,
        severity: 'CRITICAL',
        description: 'Bypass safety filters',
      },
    ];

    for (const { pattern, severity, description } of criticalPatterns) {
      if (pattern.test(text)) {
        throw new JailbreakError(description, severity);
      }
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FALLBACK LOGIC (0.5% TRIGGER RATE)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Execute request with retry and fallback support
   * Fallback triggers only 0.5% of times (rare cases)
   */
  private async executeWithRetryAndFallback(
    config: AIRequestConfig,
    requestId: string
  ): Promise<AIResponse> {
    try {
      // Try primary provider with retry
      return await this.executeWithRetry(config);
    } catch (error) {
      // If primary fails and fallback is available
      if (this.shouldUseFallback(error)) {
        console.log(`[Fallback Triggered] ${requestId} - Using fallback provider`);
        this.fallbackCount++;

        try {
          const fallbackResponse = await this.fallbackProvider!.sendRequest(config);
          return {
            ...fallbackResponse,
            metadata: {
              ...fallbackResponse.metadata,
              usedFallback: true,
              fallbackProvider: this.fallbackConfig!.provider,
              fallbackModel: this.fallbackConfig!.model,
            },
          };
        } catch (fallbackError) {
          console.error(`[Fallback Failed] ${requestId}`, fallbackError);
          throw error; // Throw original error if fallback also fails
        }
      }

      throw error;
    }
  }

  /**
   * Determine if fallback should be used
   * Only triggers on provider errors (not security errors)
   */
  private shouldUseFallback(error: unknown): boolean {
    if (!this.fallbackConfig?.enabled || !this.fallbackProvider) {
      return false;
    }

    // Don't fallback on security errors
    if (
      error instanceof JailbreakError ||
      error instanceof SystemPromptExposureError ||
      error instanceof ModelRevealError
    ) {
      return false;
    }

    // Fallback on provider errors (timeout, rate limit, server errors)
    if (error instanceof ProviderTimeoutError || error instanceof ProviderRateLimitError) {
      return true;
    }

    // Random 0.5% fallback for other errors
    return Math.random() < this.fallbackConfig.triggerRate;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RETRY LOGIC
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Execute request with exponential backoff retry
   */
  private async executeWithRetry(config: AIRequestConfig): Promise<AIResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await this.sendRequest(config);
      } catch (error) {
        lastError = error as Error;

        // Don't retry if not retryable
        if (!ErrorHandler.isRetryable(lastError)) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === this.retryConfig.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateRetryDelay(attempt);
        await this.sleep(delay);
      }
    }

    throw lastError || new AIError('All retry attempts failed', 'AI_9999' as any);
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    if (!this.retryConfig.exponentialBackoff) {
      return this.retryConfig.baseDelayMs;
    }

    const delay = this.retryConfig.baseDelayMs * Math.pow(2, attempt - 1);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${this.provider}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Track successful request
   */
  private trackRequest(): void {
    this.requestCount++;
  }

  /**
   * Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log error with context
   */
  protected logError(error: unknown, requestId: string, config: AIRequestConfig): void {
    console.error('[AIProvider Error]', {
      requestId,
      provider: this.provider,
      model: this.model,
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get request count
   */
  public getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * Update rate limit info
   */
  protected updateRateLimit(remaining: number, resetAt: Date): void {
    this.rateLimitRemaining = remaining;
    this.rateLimitReset = resetAt;
  }
}