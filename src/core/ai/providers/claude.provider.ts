/**
 * SORIVA AI PROVIDERS - ANTHROPIC CLAUDE
 * Created by: Amandeep, Punjab, India
 * Purpose: Claude provider for Vibe Paid, Spark (fallback), Apex, Persona (fallback)
 * Models: Claude Haiku 3, Claude Sonnet 3.5
 * Updated: October 13, 2025
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
// CLAUDE API TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  system?: string;
  stream?: boolean;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface ClaudeStreamChunk {
  type: string;
  index?: number;
  delta?: {
    type: string;
    text?: string;
  };
  message?: {
    id: string;
    type: string;
    role: string;
    content: any[];
    model: string;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLAUDE PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ClaudeProvider extends AIProviderBase {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string = 'https://api.anthropic.com/v1';
  private readonly apiVersion: string = '2023-06-01';

  constructor(config: ProviderConfig, fallbackProvider?: AIProviderBase) {
    super(config, fallbackProvider);

    if (!config.apiKey) {
      throw new ApiKeyMissingError(Providers.ANTHROPIC);
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': this.apiVersion,
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 60000,
    });

    this.validateConfig();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ABSTRACT METHODS IMPLEMENTATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  protected validateConfig(): void {
    const validModels = [
      'claude-3-haiku-20240307', // Haiku (Vibe Paid, Spark fallback)
      'claude-3-5-sonnet-20241022', // Sonnet 3.5 (Apex, Persona fallback)
    ];

    if (!validModels.includes(this.model as string)) {
      throw new ProviderError(
        `Invalid model for Claude: ${this.model}`,
        Providers.ANTHROPIC,
        this.model
      );
    }
  }

  protected async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const { systemPrompt, claudeMessages } = this.transformMessages(config.messages);

      const claudeRequest: ClaudeRequest = {
        model: this.model as string,
        messages: claudeMessages,
        max_tokens: config.maxTokens ?? 4096,
        temperature: config.temperature ?? 0.7,
        top_p: config.topP ?? 1.0,
        stream: false,
      };

      if (systemPrompt) {
        claudeRequest.system = systemPrompt;
      }

      const response = await this.client.post<ClaudeResponse>('/messages', claudeRequest);

      this.updateRateLimitFromHeaders(response.headers);
      this.validateResponse(response.data);

      return this.transformResponse(response.data, startTime);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  protected async *sendStreamRequest(
    config: AIRequestConfig
  ): AsyncGenerator<string, void, unknown> {
    try {
      const { systemPrompt, claudeMessages } = this.transformMessages(config.messages);

      const claudeRequest: ClaudeRequest = {
        model: this.model as string,
        messages: claudeMessages,
        max_tokens: config.maxTokens ?? 4096,
        temperature: config.temperature ?? 0.7,
        top_p: config.topP ?? 1.0,
        stream: true,
      };

      if (systemPrompt) {
        claudeRequest.system = systemPrompt;
      }

      const response = await this.client.post('/messages', claudeRequest, {
        responseType: 'stream',
      });

      for await (const chunk of response.data) {
        const lines = chunk
          .toString()
          .split('\n')
          .filter((line: string) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            try {
              const parsed: ClaudeStreamChunk = JSON.parse(data);

              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                yield parsed.delta.text;
              }

              if (parsed.type === 'message_stop') {
                return;
              }
            } catch (e) {
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

  private transformMessages(messages: any[]): {
    systemPrompt: string | null;
    claudeMessages: ClaudeMessage[];
  } {
    let systemPrompt: string | null = null;
    const claudeMessages: ClaudeMessage[] = [];

    for (const msg of messages) {
      if (msg.role === MessageRole.SYSTEM) {
        systemPrompt = msg.content;
      } else if (msg.role === MessageRole.USER || msg.role === MessageRole.ASSISTANT) {
        claudeMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    if (claudeMessages.length > 0 && claudeMessages[0].role !== 'user') {
      claudeMessages.unshift({
        role: 'user',
        content: 'Hello',
      });
    }

    return { systemPrompt, claudeMessages };
  }

  private transformResponse(claudeResponse: ClaudeResponse, startTime: number): AIResponse {
    const content = claudeResponse.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    if (!content) {
      throw new ProviderInvalidResponseError(
        Providers.ANTHROPIC,
        this.model,
        'No text content in response'
      );
    }

    const usage: TokenUsage = {
      promptTokens: claudeResponse.usage.input_tokens,
      completionTokens: claudeResponse.usage.output_tokens,
      totalTokens: claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens,
    };

    return {
      content,
      model: this.model,
      provider: Providers.ANTHROPIC,
      usage,
      metadata: {
        requestId: claudeResponse.id,
        latencyMs: Date.now() - startTime,
        cached: false,
        fallbackUsed: false,
        provider: Providers.ANTHROPIC,
      },
      timestamp: new Date(),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION & ERROR HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private validateResponse(response: ClaudeResponse): void {
    if (!response.content || response.content.length === 0) {
      throw new ProviderInvalidResponseError(
        Providers.ANTHROPIC,
        this.model,
        'Empty content array'
      );
    }

    if (!response.usage) {
      throw new ProviderInvalidResponseError(
        Providers.ANTHROPIC,
        this.model,
        'Missing usage information'
      );
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data?.error;
      const message = errorData?.message || error.message;

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new ProviderTimeoutError(
          Providers.ANTHROPIC,
          this.model,
          this.config.timeout || 60000
        );
      }

      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after'];
        return new ProviderRateLimitError(
          Providers.ANTHROPIC,
          this.model,
          retryAfter ? parseInt(retryAfter) : undefined,
          error
        );
      }

      if (status === 401 || status === 403) {
        return new ProviderAuthError(Providers.ANTHROPIC, this.model, error);
      }

      if (status === 529) {
        return new ProviderError(
          'Claude is overloaded. Please retry.',
          Providers.ANTHROPIC,
          this.model,
          undefined,
          true,
          error
        );
      }

      if (status && status >= 500) {
        return new ProviderError(
          `Claude service unavailable: ${message}`,
          Providers.ANTHROPIC,
          this.model,
          undefined,
          true,
          error
        );
      }

      return new ProviderError(
        `Claude API error: ${message}`,
        Providers.ANTHROPIC,
        this.model,
        undefined,
        false,
        error
      );
    }

    return new ProviderError(
      error.message || 'Unknown Claude error',
      Providers.ANTHROPIC,
      this.model,
      undefined,
      false,
      error
    );
  }

  private updateRateLimitFromHeaders(headers: any): void {
    const remaining = headers['anthropic-ratelimit-requests-remaining'];
    const resetTime = headers['anthropic-ratelimit-requests-reset'];

    if (remaining !== undefined && resetTime) {
      this.updateRateLimit(parseInt(remaining), new Date(resetTime));
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

  public getContextWindow(): number {
    const model = this.model as string;

    if (model.includes('claude-3') || model.includes('claude-sonnet-4')) {
      return 200000;
    }

    return 100000;
  }

  public getProviderInfo(): {
    provider: AIProvider;
    model: AIModel;
    hasFallback: boolean;
    contextWindow: number;
    planConfig?: any;
  } {
    return {
      provider: Providers.ANTHROPIC,
      model: this.model,
      hasFallback: !!this.fallbackProvider,
      contextWindow: this.getContextWindow(),
      planConfig: this.getPlanConfig(),
    };
  }

  public isHaikuModel(): boolean {
    return (this.model as string).includes('haiku');
  }

  public isSonnetModel(): boolean {
    return (this.model as string).includes('sonnet');
  }
}
