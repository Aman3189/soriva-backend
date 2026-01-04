/**
 * SORIVA AI PROVIDERS - OPENAI GPT
 * Created by: Amandeep, Punjab, India
 * Purpose: GPT provider for PERSONA tier (Premium)
 * Model: GPT-5 (Primary for Persona)
 * Updated: October 12, 2025 - Added fallback support and plan configuration
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
  Providers,
  Models,
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
// OPENAI API TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

interface OpenAIResponse {
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

interface OpenAIStreamChunk {
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
// GPT PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class GPTProvider extends AIProviderBase {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string = 'https://api.openai.com/v1';

  /**
   * Constructor with optional fallback provider
   * @param config - Provider configuration
   * @param fallbackProvider - Optional fallback provider
   *
   * Usage:
   * - Persona: GPT-5 (primary) → Claude Sonnet 4.5 (fallback)
   */
  constructor(config: ProviderConfig, fallbackProvider?: AIProviderBase) {
    // Pass fallback to base class
    super(config, fallbackProvider);

    // Validate API key
    if (!config.apiKey) {
      throw new ApiKeyMissingError(Providers.OPENAI);
    }

    // Initialize OpenAI client
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 60000, // 60s for GPT
    });

    // Validate configuration
    this.validateConfig();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ABSTRACT METHODS IMPLEMENTATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate GPT-specific configuration
   * Supports: GPT-5, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
   */
  protected validateConfig(): void {
    const validModels = [
      'gpt-5', // GPT-5 (Persona)
      'gpt-4-turbo-preview', // GPT-4 Turbo
      'gpt-4-turbo', // GPT-4 Turbo (stable)
      'gpt-4', // GPT-4
      'gpt-4-32k', // GPT-4 32k
      'gpt-3.5-turbo', // GPT-3.5 Turbo
      'gpt-3.5-turbo-16k', // GPT-3.5 Turbo 16k
    ];

    if (!validModels.includes(this.model as string)) {
      throw new ProviderError(
        `Invalid model for OpenAI: ${this.model}`,
        Providers.OPENAI,
        this.model
      );
    }
  }

  /**
   * Send request to OpenAI API
   * Note: Response delay and confidentiality handled by base class
   */
  protected async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Transform messages to OpenAI format
      const openaiMessages = this.transformMessages(config.messages);

      // Build OpenAI request
      const openaiRequest: OpenAIRequest = {
        model: this.model as string,
        messages: openaiMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 4096,
        top_p: config.topP ?? 1.0,
        frequency_penalty: config.frequencyPenalty ?? 0,
        presence_penalty: config.presencePenalty ?? 0,
        stream: false,
      };

      // Make API call
      const response = await this.client.post<OpenAIResponse>('/chat/completions', openaiRequest);

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
   * Stream response from OpenAI API
   * Note: Initial delay handled by base class
   */
  protected async *sendStreamRequest(
    config: AIRequestConfig
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Transform messages to OpenAI format
      const openaiMessages = this.transformMessages(config.messages);

      // Build OpenAI streaming request
      const openaiRequest: OpenAIRequest = {
        model: this.model as string,
        messages: openaiMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 4096,
        top_p: config.topP ?? 1.0,
        frequency_penalty: config.frequencyPenalty ?? 0,
        presence_penalty: config.presencePenalty ?? 0,
        stream: true,
      };

      // Make streaming API call
      const response = await this.client.post('/chat/completions', openaiRequest, {
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
              const parsed: OpenAIStreamChunk = JSON.parse(data);
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
   * Transform standard messages to OpenAI format
   * OpenAI format is straightforward - no special handling needed
   */
  private transformMessages(messages: any[]): OpenAIMessage[] {
    return messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));
  }

  /**
   * Transform OpenAI response to standard format
   */
  private transformResponse(openaiResponse: OpenAIResponse, startTime: number): AIResponse {
    const choice = openaiResponse.choices[0];

    if (!choice || !choice.message) {
      throw new ProviderInvalidResponseError(
        Providers.OPENAI,
        this.model,
        'No valid choice in response'
      );
    }

    const usage: TokenUsage = {
      promptTokens: openaiResponse.usage.prompt_tokens,
      completionTokens: openaiResponse.usage.completion_tokens,
      totalTokens: openaiResponse.usage.total_tokens,
    };

    return {
      content: choice.message.content,
      model: this.model,
      provider: Providers.OPENAI,
      usage,
      metadata: {
        requestId: openaiResponse.id,
        latencyMs: Date.now() - startTime,
        cached: false,
        fallbackUsed: false,
        provider: Providers.OPENAI,
      },
      timestamp: new Date(),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION & ERROR HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate OpenAI response structure
   */
  private validateResponse(response: OpenAIResponse): void {
    if (!response.choices || response.choices.length === 0) {
      throw new ProviderInvalidResponseError(Providers.OPENAI, this.model, 'Empty choices array');
    }

    if (!response.choices[0].message) {
      throw new ProviderInvalidResponseError(
        Providers.OPENAI,
        this.model,
        'Missing message in choice'
      );
    }

    if (!response.usage) {
      throw new ProviderInvalidResponseError(
        Providers.OPENAI,
        this.model,
        'Missing usage information'
      );
    }
  }

  /**
   * Handle OpenAI API errors with comprehensive categorization
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
        return new ProviderTimeoutError(Providers.OPENAI, this.model, this.config.timeout || 60000);
      }

      // Rate limit (429)
      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after-ms'];
        return new ProviderRateLimitError(
          Providers.OPENAI,
          this.model,
          retryAfter ? parseInt(retryAfter) / 1000 : undefined,
          error
        );
      }

      // Authentication (401)
      if (status === 401) {
        return new ProviderAuthError(Providers.OPENAI, this.model, error);
      }

      // Permission denied (403)
      if (status === 403) {
        return new ProviderError(
          `OpenAI permission denied: ${message}`,
          Providers.OPENAI,
          this.model,
          undefined,
          false,
          error
        );
      }

      // Model not found (404)
      if (status === 404) {
        return new ProviderError(
          `Model not found: ${this.model}`,
          Providers.OPENAI,
          this.model,
          undefined,
          false,
          error
        );
      }

      // Content filter (400 with content_filter)
      if (
        status === 400 &&
        (errorType === 'content_filter' || errorCode === 'content_policy_violation')
      ) {
        return new ProviderError(
          'Content filtered by OpenAI safety system',
          Providers.OPENAI,
          this.model,
          undefined,
          false,
          error
        );
      }

      // Invalid request (400)
      if (status === 400) {
        return new ProviderError(
          `OpenAI invalid request: ${message}`,
          Providers.OPENAI,
          this.model,
          undefined,
          false,
          error
        );
      }

      // Service unavailable (500, 502, 503, 504)
      if (status && status >= 500) {
        return new ProviderError(
          `OpenAI service unavailable: ${message}`,
          Providers.OPENAI,
          this.model,
          undefined,
          true, // Retryable
          error
        );
      }

      // Other errors
      return new ProviderError(
        `OpenAI API error: ${message}`,
        Providers.OPENAI,
        this.model,
        undefined,
        false,
        error
      );
    }

    // Unknown error
    return new ProviderError(
      error.message || 'Unknown OpenAI error',
      Providers.OPENAI,
      this.model,
      undefined,
      false,
      error
    );
  }

  /**
   * Update rate limit info from OpenAI response headers
   */
  private updateRateLimitFromHeaders(headers: any): void {
    const remaining = headers['x-ratelimit-remaining-requests'];
    const resetTime = headers['x-ratelimit-reset-requests'];

    if (remaining !== undefined && resetTime) {
      // Parse reset time (format: "1h2m3s" or timestamp)
      const resetDate = this.parseResetTime(resetTime);
      this.updateRateLimit(parseInt(remaining), resetDate);
    }
  }

  /**
   * Parse OpenAI reset time format
   * Supports: "1h2m3s" duration format or ISO timestamp
   */
  private parseResetTime(resetTime: string): Date {
    // If it's a duration like "1h2m3s"
    if (resetTime.includes('h') || resetTime.includes('m') || resetTime.includes('s')) {
      const hours = parseInt(resetTime.match(/(\d+)h/)?.[1] || '0');
      const minutes = parseInt(resetTime.match(/(\d+)m/)?.[1] || '0');
      const seconds = parseInt(resetTime.match(/(\d+)s/)?.[1] || '0');

      const milliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
      return new Date(Date.now() + milliseconds);
    }

    // Otherwise, assume it's a timestamp
    return new Date(resetTime);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get OpenAI API status
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
   * GPT-5 and GPT-4 Turbo have large context windows
   */
  public getContextWindow(): number {
    const model = this.model as string;

    // GPT-5 context window
    if (model.includes('gpt-5')) {
      return 128000; // 128k tokens
    }

    // GPT-4 Turbo
    if (model.includes('gpt-4-turbo')) {
      return 128000; // 128k tokens
    }

    // GPT-4 32k
    if (model.includes('gpt-4-32k')) {
      return 32000; // 32k tokens
    }

    // GPT-4 standard
    if (model.includes('gpt-4')) {
      return 8192; // 8k tokens
    }

    // GPT-3.5 Turbo 16k
    if (model.includes('gpt-3.5-turbo-16k')) {
      return 16384; // 16k tokens
    }

    // GPT-3.5 Turbo standard
    if (model.includes('gpt-3.5-turbo')) {
      return 4096; // 4k tokens
    }

    // Default
    return 4096;
  }

  /**
   * Get model pricing (per 1M tokens) in USD
   * Note: Convert to INR at runtime based on current exchange rate
   */
  public getPricing(): { input: number; output: number } {
    const model = this.model as string;

    // GPT-5 pricing (example - adjust when official pricing released)
    if (model.includes('gpt-5')) {
      return {
        input: 10.0, // $10 per 1M input tokens
        output: 30.0, // $30 per 1M output tokens
      };
    }

    // GPT-4 Turbo
    if (model.includes('gpt-4-turbo')) {
      return {
        input: 10.0,
        output: 30.0,
      };
    }

    // GPT-4
    if (model.includes('gpt-4')) {
      return {
        input: 30.0,
        output: 60.0,
      };
    }

    // GPT-3.5 Turbo
    if (model.includes('gpt-3.5-turbo')) {
      return {
        input: 0.5,
        output: 1.5,
      };
    }

    // Default
    return {
      input: 10.0,
      output: 30.0,
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
      provider: Providers.OPENAI,
      model: this.model,
      hasFallback: !!this.fallbackProvider,
      contextWindow: this.getContextWindow(),
      pricing: this.getPricing(),
      planConfig: this.getPlanConfig(),
    };
  }

  /**
   * Check if model is GPT-5 (latest generation)
   */
  public isGPT5(): boolean {
    return (this.model as string).includes('gpt-5');
  }

  /**
   * Check if model is GPT-4 series
   */
  public isGPT4(): boolean {
    return (this.model as string).includes('gpt-4');
  }

  /**
   * Check if model is GPT-3.5 series
   */
  public isGPT35(): boolean {
    return (this.model as string).includes('gpt-3.5');
  }

  /**
   * Check if model supports function calling
   */
  public supportsFunctionCalling(): boolean {
    const model = this.model as string;
    // All GPT-4 and newer models support function calling
    return (
      model.includes('gpt-4') ||
      model.includes('gpt-5') ||
      model.includes('gpt-3.5-turbo-1106') ||
      model.includes('gpt-3.5-turbo-0125')
    );
  }
}
