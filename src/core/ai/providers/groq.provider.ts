/**
 * SORIVA AI PROVIDERS - GROQ (LLAMA 3)
 * Created by: Amandeep, Punjab, India
 * Purpose: Groq provider for VIBE_FREE and fallback for VIBE_PAID
 * Models: Llama 3 70B (Primary), Llama 3 8B (Fallback)
 * Updated: October 12, 2025 - Added fallback and plan support
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
// GROQ API TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface GroqResponse {
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

interface GroqStreamChunk {
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
// GROQ PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class GroqProvider extends AIProviderBase {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string = 'https://api.groq.com/openai/v1';

  /**
   * Constructor with optional fallback provider
   * @param config - Provider configuration
   * @param fallbackProvider - Optional fallback provider (for rare 0.5% cases)
   */
  constructor(config: ProviderConfig, fallbackProvider?: AIProviderBase) {
    console.log('🔍 [GROQ] Received model in config:', config.model);
    // Pass fallback to base class
    super(config, fallbackProvider);

    // Validate API key
    if (!config.apiKey) {
      throw new ApiKeyMissingError(Providers.GROQ);
    }

    // Initialize Groq client
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 30000, // 30s default
    });

    // Validate configuration
    this.validateConfig();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ABSTRACT METHODS IMPLEMENTATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate Groq-specific configuration
   */
  protected validateConfig(): void {
    // Valid Groq models
    const validModels = [
      'llama-3.3-70b-versatile', // Llama 3 70B (Vibe Free)
      'llama-3-70b-8192', // Alternative name
      'llama3-8b-8192', // Llama 3 8B (Fallback)
      'llama-3-8b-8192',
      'llama3-70b-8192', // Alternative name
      'mixtral-8x7b-32768', // Mixtral 8x7B
      'gemma-7b-it', // Gemma 7B
    ];

    if (!validModels.includes(this.model as string)) {
      throw new ProviderError(`Invalid model for Groq: ${this.model}`, Providers.GROQ, this.model);
    }
  }

  /**
   * Send request to Groq API
   * Note: Response delay and confidentiality handled by base class
   */
  protected async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Transform messages to Groq format
      const groqMessages = this.transformMessages(config.messages);

      // Build Groq request
      const groqRequest: GroqRequest = {
        model: this.model as string,
        messages: groqMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2048,
        top_p: config.topP ?? 1.0,
        stream: false,
      };

      // Make API call
      const response = await this.client.post<GroqResponse>('/chat/completions', groqRequest);

      // Validate response
      this.validateResponse(response.data);

      // Transform to standard response
      return this.transformResponse(response.data, startTime);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Stream response from Groq API
   * Note: Initial delay handled by base class
   */
  protected async *sendStreamRequest(
    config: AIRequestConfig
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Transform messages to Groq format
      const groqMessages = this.transformMessages(config.messages);

      // Build Groq streaming request
      const groqRequest: GroqRequest = {
        model: this.model as string,
        messages: groqMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2048,
        top_p: config.topP ?? 1.0,
        stream: true,
      };

      // Make streaming API call
      const response = await this.client.post('/chat/completions', groqRequest, {
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
              const parsed: GroqStreamChunk = JSON.parse(data);
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
   * Transform standard messages to Groq format
   */
  private transformMessages(messages: any[]): GroqMessage[] {
    return messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));
  }

  /**
   * Transform Groq response to standard format
   */
  private transformResponse(groqResponse: GroqResponse, startTime: number): AIResponse {
    const choice = groqResponse.choices[0];

    if (!choice || !choice.message) {
      throw new ProviderInvalidResponseError(
        Providers.GROQ,
        this.model,
        'No valid choice in response'
      );
    }

    const usage: TokenUsage = {
      promptTokens: groqResponse.usage.prompt_tokens,
      completionTokens: groqResponse.usage.completion_tokens,
      totalTokens: groqResponse.usage.total_tokens,
    };

    return {
      content: choice.message.content,
      model: this.model,
      provider: Providers.GROQ,
      usage,
      metadata: {
        requestId: groqResponse.id,
        latencyMs: Date.now() - startTime,
        cached: false,
        fallbackUsed: false,
        provider: Providers.GROQ,
      },
      timestamp: new Date(),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION & ERROR HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate Groq response structure
   */
  private validateResponse(response: GroqResponse): void {
    if (!response.choices || response.choices.length === 0) {
      throw new ProviderInvalidResponseError(Providers.GROQ, this.model, 'Empty choices array');
    }

    if (!response.choices[0].message) {
      throw new ProviderInvalidResponseError(
        Providers.GROQ,
        this.model,
        'Missing message in choice'
      );
    }

    if (!response.usage) {
      throw new ProviderInvalidResponseError(
        Providers.GROQ,
        this.model,
        'Missing usage information'
      );
    }
  }

  /**
   * Handle Groq API errors
   */
  private handleError(error: any): Error {
    // Axios error
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      // Timeout
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new ProviderTimeoutError(Providers.GROQ, this.model, this.config.timeout || 30000);
      }

      // Rate limit (429)
      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after'];
        return new ProviderRateLimitError(
          Providers.GROQ,
          this.model,
          retryAfter ? parseInt(retryAfter) : undefined,
          error
        );
      }

      // Authentication (401, 403)
      if (status === 401 || status === 403) {
        return new ProviderAuthError(Providers.GROQ, this.model, error);
      }

      // Service unavailable (500, 502, 503, 504)
      if (status && status >= 500) {
        return new ProviderError(
          `Groq service unavailable: ${message}`,
          Providers.GROQ,
          this.model,
          undefined,
          true,
          error
        );
      }

      // Other errors
      return new ProviderError(
        `Groq API error: ${message}`,
        Providers.GROQ,
        this.model,
        undefined,
        false,
        error
      );
    }

    // Unknown error
    return new ProviderError(
      error.message || 'Unknown Groq error',
      Providers.GROQ,
      this.model,
      undefined,
      false,
      error
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get Groq API status
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
   * Get provider information
   */
  public getProviderInfo(): {
    provider: AIProvider;
    model: AIModel;
    hasFallback: boolean;
    planConfig?: any;
  } {
    return {
      provider: Providers.GROQ,
      model: this.model,
      hasFallback: !!this.fallbackProvider,
      planConfig: this.getPlanConfig(),
    };
  }
}
