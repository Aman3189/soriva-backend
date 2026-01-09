/**
 * SORIVA AI PROVIDERS - MISTRAL (La Plateforme)
 * Created by: Amandeep, Punjab, India
 * Purpose: Official Mistral AI provider for Mistral Large 3 & Magistral Medium
 * Updated: January 2026 - Initial implementation
 * 
 * Uses Official Mistral La Plateforme API (not OpenRouter)
 * Benefits: No markup, direct pricing, better reliability
 * 
 * Models:
 * - mistral-large-latest (Mistral Large 3): $2/$6 per 1M tokens
 * - magistral-medium-latest (Magistral Medium): $2/$5 per 1M tokens
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
// MISTRAL PROVIDER CONSTANT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MISTRAL_PROVIDER = 'MISTRAL' as AIProvider;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ID MAPPING (Our IDs → Mistral API IDs)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MODEL_ID_MAP: Record<string, string> = {
  'mistral-large-3': 'mistral-large-latest',
  'mistral-large-latest': 'mistral-large-latest',
  'magistral-medium': 'magistral-medium-latest',
  'magistral-medium-latest': 'magistral-medium-latest',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MISTRAL API TYPES (OpenAI-compatible)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralRequest {
  model: string;
  messages: MistralMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  safe_prompt?: boolean;
}

interface MistralResponse {
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

interface MistralStreamChunk {
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
// MISTRAL PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class MistralProvider extends AIProviderBase {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string = 'https://api.mistral.ai/v1';

  /**
   * Constructor with optional fallback provider
   * @param config - Provider configuration
   * @param fallbackProvider - Optional fallback provider
   */
  constructor(config: ProviderConfig, fallbackProvider?: AIProviderBase) {
    super(config, fallbackProvider);

    // Validate API key
    if (!config.apiKey) {
      throw new ApiKeyMissingError(MISTRAL_PROVIDER);
    }

    // Initialize Mistral client
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 60000,
    });

    // Validate configuration
    this.validateConfig();

    console.log(`[MistralProvider] Initialized with model: ${this.model}`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ABSTRACT METHODS IMPLEMENTATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate Mistral-specific configuration
   */
  protected validateConfig(): void {
    const validModels = [
      'mistral-large-3',
      'mistral-large-latest',
      'magistral-medium',
      'magistral-medium-latest',
      'mistral-small-latest',
      'codestral-latest',
    ];

    const modelStr = this.model as string;
    
    if (!validModels.includes(modelStr) && !MODEL_ID_MAP[modelStr]) {
      console.warn(
        `[MistralProvider] Model "${this.model}" not in known list, proceeding anyway`
      );
    }
  }

  /**
   * Get the actual Mistral API model ID
   */
  private getApiModelId(): string {
    const modelStr = this.model as string;
    return MODEL_ID_MAP[modelStr] || modelStr;
  }

  /**
   * Send request to Mistral API
   */
  protected async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Transform messages to Mistral format
      const mistralMessages = this.transformMessages(config.messages);

      // Build Mistral request
      const mistralRequest: MistralRequest = {
        model: this.getApiModelId(),
        messages: mistralMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2048,
        top_p: config.topP ?? 1.0,
        stream: false,
        safe_prompt: false, // We handle safety ourselves
      };

      console.log(`[MistralProvider] Sending request to ${this.getApiModelId()}`);

      // Make API call
      const response = await this.client.post<MistralResponse>(
        '/chat/completions',
        mistralRequest
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
   * Stream response from Mistral API
   */
  protected async *sendStreamRequest(
    config: AIRequestConfig
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Transform messages to Mistral format
      const mistralMessages = this.transformMessages(config.messages);

      // Build Mistral streaming request
      const mistralRequest: MistralRequest = {
        model: this.getApiModelId(),
        messages: mistralMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2048,
        top_p: config.topP ?? 1.0,
        stream: true,
        safe_prompt: false,
      };

      console.log(`[MistralProvider] Starting stream for ${this.getApiModelId()}`);

      // Make streaming API call
      const response = await this.client.post('/chat/completions', mistralRequest, {
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
              const parsed: MistralStreamChunk = JSON.parse(data);
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
   * Transform standard messages to Mistral format
   */
  private transformMessages(messages: any[]): MistralMessage[] {
    return messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));
  }

  /**
   * Transform Mistral response to standard format
   */
  private transformResponse(mistralResponse: MistralResponse, startTime: number): AIResponse {
    const choice = mistralResponse.choices[0];

    if (!choice || !choice.message) {
      throw new ProviderInvalidResponseError(
        MISTRAL_PROVIDER,
        this.model,
        'No valid choice in response'
      );
    }

    const usage: TokenUsage = {
      promptTokens: mistralResponse.usage?.prompt_tokens || 0,
      completionTokens: mistralResponse.usage?.completion_tokens || 0,
      totalTokens: mistralResponse.usage?.total_tokens || 0,
    };

    return {
      content: choice.message.content,
      model: this.model,
      provider: MISTRAL_PROVIDER,
      usage,
      metadata: {
        requestId: mistralResponse.id,
        latencyMs: Date.now() - startTime,
        cached: false,
        fallbackUsed: false,
        provider: MISTRAL_PROVIDER,
      },
      timestamp: new Date(),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION & ERROR HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate Mistral response structure
   */
  private validateResponse(response: MistralResponse): void {
    if (!response.choices || response.choices.length === 0) {
      throw new ProviderInvalidResponseError(
        MISTRAL_PROVIDER,
        this.model,
        'Empty choices array'
      );
    }

    if (!response.choices[0].message) {
      throw new ProviderInvalidResponseError(
        MISTRAL_PROVIDER,
        this.model,
        'Missing message in choice'
      );
    }

    if (!response.usage) {
      console.warn('[MistralProvider] Missing usage information in response');
    }
  }

  /**
   * Handle Mistral API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data?.error || error.response?.data;
      const message = errorData?.message || error.message;

      // Timeout
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new ProviderTimeoutError(
          MISTRAL_PROVIDER,
          this.model,
          this.config.timeout || 60000
        );
      }

      // Rate limit (429)
      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after'];
        return new ProviderRateLimitError(
          MISTRAL_PROVIDER,
          this.model,
          retryAfter ? parseInt(retryAfter) : undefined,
          error
        );
      }

      // Authentication (401)
      if (status === 401) {
        return new ProviderAuthError(MISTRAL_PROVIDER, this.model, error);
      }

      // Invalid request (400)
      if (status === 400) {
        return new ProviderError(
          `Mistral invalid request: ${message}`,
          MISTRAL_PROVIDER,
          this.model,
          undefined,
          false,
          error
        );
      }

      // Service unavailable (500+)
      if (status && status >= 500) {
        return new ProviderError(
          `Mistral service unavailable: ${message}`,
          MISTRAL_PROVIDER,
          this.model,
          undefined,
          true, // Retryable
          error
        );
      }

      return new ProviderError(
        `Mistral API error: ${message}`,
        MISTRAL_PROVIDER,
        this.model,
        undefined,
        false,
        error
      );
    }

    return new ProviderError(
      error.message || 'Unknown Mistral error',
      MISTRAL_PROVIDER,
      this.model,
      undefined,
      false,
      error
    );
  }

  /**
   * Update rate limit info from Mistral response headers
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
   * Get Mistral API status
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

    if (model.includes('mistral-large') || model.includes('magistral')) {
      return 131072; // 128k tokens
    }

    return 32000; // Default
  }

  /**
   * Get model pricing (per 1M tokens) in USD
   */
  public getPricing(): { input: number; output: number } {
    const model = this.model as string;

    // Mistral Large 3
    if (model.includes('mistral-large')) {
      return {
        input: 2.00,   // $2.00 per 1M input tokens
        output: 6.00,  // $6.00 per 1M output tokens
      };
    }

    // Magistral Medium
    if (model.includes('magistral-medium')) {
      return {
        input: 2.00,   // $2.00 per 1M input tokens
        output: 5.00,  // $5.00 per 1M output tokens
      };
    }

    // Default
    return {
      input: 2.00,
      output: 5.00,
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
      provider: MISTRAL_PROVIDER,
      model: this.model,
      hasFallback: !!this.fallbackProvider,
      contextWindow: this.getContextWindow(),
      pricing: this.getPricing(),
      planConfig: this.getPlanConfig(),
    };
  }

  /**
   * Check if model is Mistral Large
   */
  public isMistralLarge(): boolean {
    return (this.model as string).includes('mistral-large');
  }

  /**
   * Check if model is Magistral Medium
   */
  public isMagistralMedium(): boolean {
    return (this.model as string).includes('magistral-medium');
  }
}