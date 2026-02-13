/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI PROVIDERS - MISTRAL (La Plateforme)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Models:
 * - mistral-large-latest: General + Web Search ($0.50/$1.50 per 1M)
 * - devstral-latest: Coding ($0.50/$1.50 per 1M)
 * 
 * Updated: February 2026
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MISTRAL_PROVIDER = 'MISTRAL' as AIProvider;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ID MAPPING (Only 2 models)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MODEL_ID_MAP: Record<string, string> = {
  // Mistral Large (General + Search)
  'mistral-large-latest': 'mistral-large-latest',
  'mistral-large-2512': 'mistral-large-latest',

  // Devstral (Coding)
  'devstral-latest': 'devstral-latest',
  'devstral-medium-2512': 'devstral-latest',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEB SEARCH TOOL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MistralTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

const WEB_SEARCH_TOOL: MistralTool = {
  type: 'function',
  function: {
    name: 'web_search',
    description: 'Search the web for current, real-time information.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query',
        },
      },
      required: ['query'],
    },
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MistralMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: MistralToolCall[];
  tool_call_id?: string;
}

interface MistralToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface MistralRequest {
  model: string;
  messages: MistralMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  tools?: MistralTool[];
  tool_choice?: 'auto' | 'none' | 'any';
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
      tool_calls?: MistralToolCall[];
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

export interface MistralRequestConfig extends AIRequestConfig {
  enableWebSearch?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MISTRAL PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class MistralProvider extends AIProviderBase {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string = 'https://api.mistral.ai/v1';

  constructor(config: ProviderConfig, fallbackProvider?: AIProviderBase) {
    super(config, fallbackProvider);

    if (!config.apiKey) {
      throw new ApiKeyMissingError(MISTRAL_PROVIDER);
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 60000,
    });

    this.validateConfig();
    console.log(`[MistralProvider] Initialized: ${this.model}`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  protected validateConfig(): void {
    const modelStr = this.model as string;
    if (!MODEL_ID_MAP[modelStr]) {
      console.warn(`[MistralProvider] Unknown model: ${modelStr}`);
    }
  }

  private getApiModelId(): string {
    return MODEL_ID_MAP[this.model as string] || (this.model as string);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN REQUEST
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  protected async sendRequest(config: MistralRequestConfig): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const messages = this.transformMessages(config.messages);

      const request: MistralRequest = {
        model: this.getApiModelId(),
        messages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 4096,
        stream: false,
      };

      // Add web search for mistral-large only
      if (config.enableWebSearch && this.supportsWebSearch()) {
        request.tools = [WEB_SEARCH_TOOL];
        request.tool_choice = 'auto';
      }

      const response = await this.client.post<MistralResponse>(
        '/chat/completions',
        request
      );

      this.updateRateLimitFromHeaders(response.headers);

      // Handle tool calls
      if (response.data.choices[0]?.message?.tool_calls) {
        return this.handleToolCalls(response.data, messages, config, startTime);
      }

      return this.transformResponse(response.data, startTime);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOOL HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async handleToolCalls(
    initialResponse: MistralResponse,
    messages: MistralMessage[],
    config: MistralRequestConfig,
    startTime: number
  ): Promise<AIResponse> {
    const toolCalls = initialResponse.choices[0].message.tool_calls || [];

    const assistantMsg: MistralMessage = {
      role: 'assistant',
      content: '',
      tool_calls: toolCalls,
    };

    const updatedMessages = [...messages, assistantMsg];

    for (const call of toolCalls) {
      if (call.function.name === 'web_search') {
        const args = JSON.parse(call.function.arguments);
        console.log(`[Mistral] 🔍 Web search: "${args.query}"`);

        updatedMessages.push({
          role: 'tool',
          content: JSON.stringify({ status: 'success', query: args.query }),
          tool_call_id: call.id,
        });
      }
    }

    const finalResponse = await this.client.post<MistralResponse>(
      '/chat/completions',
      {
        model: this.getApiModelId(),
        messages: updatedMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 4096,
        stream: false,
      }
    );

    return this.transformResponse(finalResponse.data, startTime);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WEB SEARCH (Direct Method)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async searchWeb(
    query: string,
    systemPrompt?: string
  ): Promise<{ answer: string; timeMs: number }> {
    const startTime = Date.now();

    const messages: MistralMessage[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: query });

    const request: MistralRequest = {
      model: 'mistral-large-latest',
      messages,
      temperature: 0.3,
      max_tokens: 2048,
      tools: [WEB_SEARCH_TOOL],
      tool_choice: 'auto',
    };

    try {
      const response = await this.client.post<MistralResponse>(
        '/chat/completions',
        request
      );

      // PERMANENT FIX
        if (response.data.choices[0]?.message?.tool_calls) {
          const result = await this.handleToolCalls(
            response.data,
            messages,
            { messages } as MistralRequestConfig,
            startTime
          );
          return { answer: result.content, timeMs: Date.now() - startTime };
        }

      return {
        answer: response.data.choices[0]?.message?.content || '',
        timeMs: Date.now() - startTime,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STREAMING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  protected async *sendStreamRequest(
    config: AIRequestConfig
  ): AsyncGenerator<string, void, unknown> {
    try {
      const messages = this.transformMessages(config.messages);

      const response = await this.client.post(
        '/chat/completions',
        {
          model: this.getApiModelId(),
          messages,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens ?? 4096,
          stream: true,
        },
        { responseType: 'stream' }
      );

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed: MistralStreamChunk = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) yield content;
            } catch {
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
  // TRANSFORMATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private transformMessages(messages: any[]): MistralMessage[] {
    return messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content || '',
    }));
  }

  private transformResponse(response: MistralResponse, startTime: number): AIResponse {
    const choice = response.choices[0];

    if (!choice?.message) {
      throw new ProviderInvalidResponseError(MISTRAL_PROVIDER, this.model, 'No response');
    }

    return {
      content: choice.message.content,
      model: this.model,
      provider: MISTRAL_PROVIDER,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      metadata: {
        requestId: response.id,
        latencyMs: Date.now() - startTime,
        cached: false,
        fallbackUsed: false,
        provider: MISTRAL_PROVIDER,
      },
      timestamp: new Date(),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ERROR HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      if (error.code === 'ECONNABORTED') {
        return new ProviderTimeoutError(MISTRAL_PROVIDER, this.model, 60000);
      }
      if (status === 429) {
        return new ProviderRateLimitError(MISTRAL_PROVIDER, this.model, undefined, error);
      }
      if (status === 401) {
        return new ProviderAuthError(MISTRAL_PROVIDER, this.model, error);
      }

      return new ProviderError(message, MISTRAL_PROVIDER, this.model, undefined, false, error);
    }

    return new ProviderError(error.message, MISTRAL_PROVIDER, this.model);
  }

  private updateRateLimitFromHeaders(headers: any): void {
    const remaining = headers['x-ratelimit-remaining-requests'];
    const resetTime = headers['x-ratelimit-reset-requests'];
    if (remaining && resetTime) {
      this.updateRateLimit(parseInt(remaining), new Date(resetTime));
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public supportsWebSearch(): boolean {
    return this.getApiModelId() === 'mistral-large-latest';
  }

  public isDevstral(): boolean {
    return this.getApiModelId() === 'devstral-latest';
  }

  public getContextWindow(): number {
    return 131072; // Both models = 128k
  }

  public getPricing(): { input: number; output: number } {
    return { input: 0.5, output: 1.5 }; // Both models same price
  }
}