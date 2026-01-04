/**
 * SORIVA AI PROVIDERS - OPENROUTER
 * Created by: Amandeep, Punjab, India
 * Purpose: OpenRouter provider for multi-model access (Kimi K2, etc.)
 * Model: moonshotai/kimi-k2-thinking (Primary for SIMPLE tier)
 * Updated: November 26, 2025 - Initial implementation
 * 
 * OpenRouter provides unified access to 400+ models via OpenAI-compatible API
 * Used for: Kimi K2 Thinking (Normal Mode) - replaces Claude Haiku 4.5
 * 
 * IMPORTANT: For Kimi K2 Normal mode, do NOT send thinking_budget parameter
 * This keeps costs at $0.60/$2.50 instead of Heavy mode $1.50/$7.00
 */

import axios, { AxiosInstance } from 'axios';
import { AIProviderBase } from './base/AIProvider';
import {
  AIProvider,
  AIModel,
  AIRequestConfig,
  AIResponse,
  ProviderConfig,
  TokenUsage,
  MessageRole,
  createAIProvider,
} from './base/types';
import {
  ApiKeyMissingError,
  ProviderError,
  ProviderTimeoutError,
  ProviderRateLimitError,
  ProviderAuthError,
  ProviderInvalidResponseError,
} from './base/errors';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPENROUTER PROVIDER CONSTANT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const OPENROUTER_PROVIDER = 'OPENROUTER' as AIProvider;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPENROUTER API TYPES (OpenAI-compatible)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  // NOTE: Do NOT include extra_body or thinking_budget for Normal mode
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenRouterStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPENROUTER PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class OpenRouterProvider extends AIProviderBase {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string = 'https://openrouter.ai/api/v1';

  /**
   * Constructor with optional fallback provider
   * @param config - Provider configuration
   * @param fallbackProvider - Optional fallback provider
   *
   * Usage:
   * - SIMPLE tier: Kimi K2 Thinking (primary) → Gemini Flash (fallback)
   */
  constructor(config: ProviderConfig, fallbackProvider?: AIProviderBase) {
    // Pass fallback to base class
    super(config, fallbackProvider);

    // Validate API key
    if (!config.apiKey) {
      throw new ApiKeyMissingError(OPENROUTER_PROVIDER);
    }

    // Initialize OpenRouter client (OpenAI-compatible API)
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://soriva.in',  // Required by OpenRouter
        'X-Title': 'Soriva AI',               // App name for OpenRouter dashboard
      },
      timeout: config.timeout || 60000, // 60s default
    });

    // Validate configuration
    this.validateConfig();

    console.log(`[OpenRouterProvider] Initialized with model: ${this.model}`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ABSTRACT METHODS IMPLEMENTATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate OpenRouter-specific configuration
   * Supports: Kimi K2 and other OpenRouter models
   */
  protected validateConfig(): void {
    const validModels = [
      // Kimi K2 Thinking (Moonshot AI)
      'moonshotai/kimi-k2-thinking',
      
      // Other popular OpenRouter models (for future use)
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-haiku',
      'google/gemini-pro',
      'google/gemini-flash-1.5',
      'meta-llama/llama-3.1-70b-instruct',
      'mistralai/mixtral-8x7b-instruct',
      'openai/gpt-4-turbo',
      'openai/gpt-4o',
      'qwen/qwen-2-72b-instruct',
    ];

    // Allow any model that follows provider/model format
    const modelStr = this.model as string;
    const isValidFormat = modelStr.includes('/');
    
    if (!isValidFormat && !validModels.includes(modelStr)) {
      console.warn(
        `[OpenRouterProvider] Model "${this.model}" not in known list, proceeding anyway`
      );
    }
  }

  /**
   * Send request to OpenRouter API
   * CRITICAL: For Kimi K2, do NOT send thinking_budget to stay in Normal mode
   */
  protected async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Transform messages to OpenRouter format (OpenAI-compatible)
      const openrouterMessages = this.transformMessages(config.messages);

      // Build OpenRouter request
      // IMPORTANT: No extra_body or thinking_budget for Kimi K2 Normal mode!
      const openrouterRequest: OpenRouterRequest = {
        model: this.model as string,
        messages: openrouterMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2048,
        top_p: config.topP ?? 1.0,
        frequency_penalty: config.frequencyPenalty ?? 0,
        presence_penalty: config.presencePenalty ?? 0,
        stream: false,
      };

      console.log(`[OpenRouterProvider] Sending request to ${this.model}`);

      // Make API call
      const response = await this.client.post<OpenRouterResponse>(
        '/chat/completions',
        openrouterRequest
      );

      // Update rate limits from headers
      this.updateRateLimitFromHeaders(response.headers);

      // Validate response
      this.validateResponse(response.data);

      // Transform to standard response
      return this.transformResponse(response.data, startTime);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Stream response from OpenRouter API
   */
  protected async *sendStreamRequest(
    config: AIRequestConfig
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Transform messages to OpenRouter format
      const openrouterMessages = this.transformMessages(config.messages);

      // Build OpenRouter streaming request
      // IMPORTANT: No extra_body or thinking_budget for Kimi K2 Normal mode!
      const openrouterRequest: OpenRouterRequest = {
        model: this.model as string,
        messages: openrouterMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2048,
        top_p: config.topP ?? 1.0,
        frequency_penalty: config.frequencyPenalty ?? 0,
        presence_penalty: config.presencePenalty ?? 0,
        stream: true,
      };

      console.log(`[OpenRouterProvider] Starting stream for ${this.model}`);

      // Make streaming API call
      const response = await this.client.post('/chat/completions', openrouterRequest, {
        responseType: 'stream',
      });

      // Process stream
      for await (const chunk of response.data) {
        const lines = chunk
          .toString()
          .split('\n')
          .filter((line: string) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed: OpenRouterStreamChunk = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;

              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRANSFORMATION METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Transform standard messages to OpenRouter format (OpenAI-compatible)
   */
  private transformMessages(messages: any[]): OpenRouterMessage[] {
    return messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));
  }

  /**
   * Transform OpenRouter response to standard format
   */
  private transformResponse(openrouterResponse: OpenRouterResponse, startTime: number): AIResponse {
    const choice = openrouterResponse.choices[0];

    if (!choice || !choice.message) {
      throw new ProviderInvalidResponseError(
        OPENROUTER_PROVIDER,
        this.model,
        'No valid choice in response'
      );
    }

    const usage: TokenUsage = {
      promptTokens: openrouterResponse.usage?.prompt_tokens || 0,
      completionTokens: openrouterResponse.usage?.completion_tokens || 0,
      totalTokens: openrouterResponse.usage?.total_tokens || 0,
    };

    return {
      content: choice.message.content,
      model: this.model,
      provider: OPENROUTER_PROVIDER,
      usage,
      metadata: {
        requestId: openrouterResponse.id,
        latencyMs: Date.now() - startTime,
        cached: false,
        fallbackUsed: false,
        provider: OPENROUTER_PROVIDER,
      },
      timestamp: new Date(),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION & ERROR HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate OpenRouter response structure
   */
  private validateResponse(response: OpenRouterResponse): void {
    if (!response.choices || response.choices.length === 0) {
      throw new ProviderInvalidResponseError(
        OPENROUTER_PROVIDER,
        this.model,
        'Empty choices array'
      );
    }

    if (!response.choices[0].message) {
      throw new ProviderInvalidResponseError(
        OPENROUTER_PROVIDER,
        this.model,
        'Missing message in choice'
      );
    }

    // Note: Some models don't return usage, so we don't throw for missing usage
    if (!response.usage) {
      console.warn('[OpenRouterProvider] Missing usage information in response');
    }
  }

  /**
   * Handle OpenRouter API errors with comprehensive categorization
   */
  private handleError(error: any): Error {
    // Axios error
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data?.error;
      const message = errorData?.message || error.message;
      const errorType = errorData?.type;
      const errorCode = errorData?.code;

      // Timeout
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new ProviderTimeoutError(
          OPENROUTER_PROVIDER,
          this.model,
          this.config.timeout || 60000
        );
      }

      // Rate limit (429)
      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after'];
        return new ProviderRateLimitError(
          OPENROUTER_PROVIDER,
          this.model,
          retryAfter ? parseInt(retryAfter) : undefined,
          error
        );
      }

      // Authentication (401)
      if (status === 401) {
        return new ProviderAuthError(OPENROUTER_PROVIDER, this.model, error);
      }

      // Permission denied / No credits (402)
      if (status === 402) {
        return new ProviderError(
          `OpenRouter: Insufficient credits - ${message}`,
          OPENROUTER_PROVIDER,
          this.model,
          undefined,
          false,
          error
        );
      }

      // Permission denied (403)
      if (status === 403) {
        return new ProviderError(
          `OpenRouter permission denied: ${message}`,
          OPENROUTER_PROVIDER,
          this.model,
          undefined,
          false,
          error
        );
      }

      // Model not found (404)
      if (status === 404) {
        return new ProviderError(
          `Model not found on OpenRouter: ${this.model}`,
          OPENROUTER_PROVIDER,
          this.model,
          undefined,
          false,
          error
        );
      }

      // Content filter (400 with content_filter)
      if (status === 400 && (errorType === 'content_filter' || errorCode === 'content_policy_violation')) {
        return new ProviderError(
          'Content filtered by safety system',
          OPENROUTER_PROVIDER,
          this.model,
          undefined,
          false,
          error
        );
      }

      // Invalid request (400)
      if (status === 400) {
        return new ProviderError(
          `OpenRouter invalid request: ${message}`,
          OPENROUTER_PROVIDER,
          this.model,
          undefined,
          false,
          error
        );
      }

      // Service unavailable (500, 502, 503, 504)
      if (status && status >= 500) {
        return new ProviderError(
          `OpenRouter service unavailable: ${message}`,
          OPENROUTER_PROVIDER,
          this.model,
          undefined,
          true, // Retryable
          error
        );
      }

      // Other errors
      return new ProviderError(
        `OpenRouter API error: ${message}`,
        OPENROUTER_PROVIDER,
        this.model,
        undefined,
        false,
        error
      );
    }

    // Unknown error
    return new ProviderError(
      error.message || 'Unknown OpenRouter error',
      OPENROUTER_PROVIDER,
      this.model,
      undefined,
      false,
      error
    );
  }

  /**
   * Update rate limit info from OpenRouter response headers
   */
  private updateRateLimitFromHeaders(headers: any): void {
    const remaining = headers['x-ratelimit-remaining-requests'];
    const resetTime = headers['x-ratelimit-reset-requests'];

    if (remaining !== undefined && resetTime) {
      const resetDate = new Date(resetTime);
      this.updateRateLimit(parseInt(remaining), resetDate);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get OpenRouter API status
   */
  public async getApiStatus(): Promise<{ healthy: boolean; latency: number }> {
    const startTime = Date.now();
    try {
      await this.healthCheck();
      return {
        healthy: true,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Get model-specific context window size
   */
  public getContextWindow(): number {
    const model = this.model as string;

    // Kimi K2 Thinking
    if (model.includes('kimi-k2')) {
      return 131072; // 128k tokens
    }

    // Default for unknown models
    return 32000;
  }

  /**
   * Get model pricing (per 1M tokens) in USD
   * IMPORTANT: Using Normal mode pricing for Kimi K2
   */
  public getPricing(): { input: number; output: number } {
    const model = this.model as string;

    // Kimi K2 Thinking (Normal Mode - no thinking_budget sent)
    if (model.includes('kimi-k2-thinking')) {
      return {
        input: 0.60,   // $0.60 per 1M input tokens (Normal mode via OpenRouter)
        output: 2.50,  // $2.50 per 1M output tokens (Normal mode via OpenRouter)
      };
    }

    // Default pricing for unknown models
    return {
      input: 1.0,
      output: 3.0,
    };
  }

  /**
   * Get provider information
   */
  public getProviderInfo(): {
    provider: AIProvider;
    model: AIModel;
    hasFallback: boolean;
    contextWindow: number;
    pricing: { input: number; output: number };
    planConfig?: any;
  } {
    return {
      provider: OPENROUTER_PROVIDER,
      model: this.model,
      hasFallback: !!this.fallbackProvider,
      contextWindow: this.getContextWindow(),
      pricing: this.getPricing(),
      planConfig: this.getPlanConfig(),
    };
  }

  /**
   * Check if model is Kimi K2
   */
  public isKimiK2(): boolean {
    return (this.model as string).includes('kimi-k2');
  }

  /**
   * Check if model is Kimi K2 Thinking
   */
  public isKimiK2Thinking(): boolean {
    return (this.model as string).includes('kimi-k2-thinking');
  }
}