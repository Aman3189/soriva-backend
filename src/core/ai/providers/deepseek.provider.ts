/**
 * SORIVA AI PROVIDERS - DEEPSEEK (V3.2)
 * Created by: Amandeep, Punjab, India
 * Purpose: DeepSeek V3.2 provider with intent-based thinking mode
 * Created: February 2026 - Replaces Mistral in Sovereign plan
 *
 * Uses Official DeepSeek API (https://api.deepseek.com)
 * 
 * Models:
 * - deepseek-chat (V3.2 Non-thinking): Default mode, fast responses
 * - deepseek-reasoner (V3.2 Thinking): CoT reasoning for complex queries
 *
 * Pricing (per 1M tokens):
 * - Input (cache hit):  $0.028
 * - Input (cache miss): $0.28
 * - Output:             $0.42
 *
 * KEY FEATURE: Intent-based thinking mode
 * - Default: Non-thinking (deepseek-chat) — fast, cost-effective
 * - Complex queries: Auto-switches to thinking (deepseek-reasoner) — CoT reasoning
 * - Detection: Pattern-based intent analysis on user messages
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
  createAIModel,
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
// DEEPSEEK PROVIDER CONSTANT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEEPSEEK_PROVIDER = 'DEEPSEEK' as AIProvider;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ID MAPPING (Our IDs → DeepSeek API IDs)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MODEL_ID_MAP: Record<string, string> = {
  'deepseek-chat': 'deepseek-chat',
  'deepseek-reasoner': 'deepseek-reasoner',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTENT-BASED THINKING MODE DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Patterns that indicate a query needs deep reasoning (thinking mode)
 * 
 * Categories:
 * 1. Math & Logic: calculations, proofs, equations
 * 2. Code Complexity: debugging, architecture, algorithms
 * 3. Analysis: comparison, evaluation, strategy
 * 4. Multi-step: planning, step-by-step, workflows
 * 5. Explicit: user asks to "think deeply" or "reason through"
 */
const THINKING_INTENT_PATTERNS: Array<{
  pattern: RegExp;
  weight: number;
  category: string;
}> = [
  // ── Math & Logic (high confidence) ─────────────────
  {
    pattern: /\b(solve|calculate|compute|derive|prove|equation|integral|derivative|factorial)\b/i,
    weight: 0.8,
    category: 'math',
  },
  {
    pattern: /\b(math|algebra|calculus|trigonometry|statistics|probability)\b/i,
    weight: 0.7,
    category: 'math',
  },
  {
    pattern: /\d+\s*[\+\-\*\/\^%]\s*\d+/,
    weight: 0.6,
    category: 'math',
  },

  // ── Code Complexity (high confidence) ──────────────
  {
    pattern: /\b(debug|fix this bug|refactor|optimize|algorithm|data structure|complexity)\b/i,
    weight: 0.7,
    category: 'code',
  },
  {
    pattern: /\b(system design|architecture|design pattern|scalab(le|ility)|microservice)\b/i,
    weight: 0.8,
    category: 'code',
  },
  {
    pattern: /\b(time complexity|space complexity|big[\s-]?o|O\(n)/i,
    weight: 0.8,
    category: 'code',
  },

  // ── Analysis & Strategy (medium confidence) ────────
  {
    pattern: /\b(compare|contrast|analyze|evaluate|pros?\s+and\s+cons|trade[\s-]?offs?)\b/i,
    weight: 0.6,
    category: 'analysis',
  },
  {
    pattern: /\b(strategy|strategic|business plan|market analysis|competitive analysis)\b/i,
    weight: 0.6,
    category: 'analysis',
  },
  {
    pattern: /\b(why does|how does|explain why|reason for|root cause)\b/i,
    weight: 0.5,
    category: 'analysis',
  },

  // ── Multi-step & Planning (medium confidence) ──────
  {
    pattern: /\b(step[\s-]?by[\s-]?step|plan|roadmap|workflow|pipeline|breakdown)\b/i,
    weight: 0.5,
    category: 'planning',
  },
  {
    pattern: /\b(how (can|should|would|do) (i|we|you)|what('s| is) the best (way|approach))\b/i,
    weight: 0.4,
    category: 'planning',
  },

  // ── Explicit Thinking Requests (highest confidence) ─
  {
    pattern: /\b(think (deeply|carefully|through|hard)|reason (through|about|step))\b/i,
    weight: 0.9,
    category: 'explicit',
  },
  {
    pattern: /\b(chain[\s-]?of[\s-]?thought|detailed (analysis|reasoning|explanation))\b/i,
    weight: 0.9,
    category: 'explicit',
  },

  // ── Research & Academic (medium confidence) ────────
  {
    pattern: /\b(research|paper|thesis|hypothesis|empirical|peer[\s-]?review)\b/i,
    weight: 0.6,
    category: 'research',
  },

  // ── Logic Puzzles & Brain Teasers ──────────────────
  {
    pattern: /\b(puzzle|riddle|brain[\s-]?teaser|logic[\s-]?problem|paradox)\b/i,
    weight: 0.7,
    category: 'logic',
  },
];

/**
 * Threshold score to activate thinking mode
 * 0.6 = medium confidence needed to switch to thinking
 */
const THINKING_THRESHOLD = 0.6;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEEPSEEK API TYPES (OpenAI-compatible with thinking extensions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      reasoning_content?: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
  };
}

interface DeepSeekStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
      reasoning_content?: string;
    };
    finish_reason: string | null;
  }>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEEPSEEK PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class DeepSeekProvider extends AIProviderBase {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  // Thinking mode tracking
  private thinkingModeRequests: number = 0;
  private nonThinkingRequests: number = 0;

  constructor(config: ProviderConfig, fallbackProvider?: AIProviderBase) {
    super(config, fallbackProvider);

    if (!config.apiKey) {
      throw new ApiKeyMissingError(DEEPSEEK_PROVIDER);
    }

    this.baseUrl = config.baseUrl || DEEPSEEK_BASE_URL;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 90000,
    });

    this.validateConfig();

    console.log(`[DeepSeekProvider] Initialized with model: ${this.model} | base: ${this.baseUrl}`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ABSTRACT METHODS IMPLEMENTATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  protected validateConfig(): void {
    const validModels = [
      'deepseek-chat',
      'deepseek-reasoner',
    ];

    const modelStr = this.model as string;

    if (!validModels.includes(modelStr) && !MODEL_ID_MAP[modelStr]) {
      console.warn(
        `[DeepSeekProvider] Model "${this.model}" not in known list, proceeding anyway`
      );
    }
  }

  private getApiModelId(useThinking: boolean): string {
    if (useThinking) {
      return 'deepseek-reasoner';
    }
    return 'deepseek-chat';
  }

  protected async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const useThinking = this.shouldUseThinking(config);
      const apiModel = this.getApiModelId(useThinking);

      const deepseekMessages = this.transformMessages(config.messages);

      const deepseekRequest: DeepSeekRequest = {
        model: apiModel,
        messages: deepseekMessages,
        stream: false,
        ...(useThinking
          ? {
              max_tokens: config.maxTokens ?? 32768,
            }
          : {
              temperature: config.temperature ?? 0.7,
              max_tokens: config.maxTokens ?? 4096,
              top_p: config.topP ?? 1.0,
              frequency_penalty: config.frequencyPenalty ?? 0,
              presence_penalty: config.presencePenalty ?? 0,
            }),
      };

      console.log(
        `[DeepSeekProvider] Request → model: ${apiModel} | thinking: ${useThinking}`
      );

      const response = await this.client.post<DeepSeekResponse>(
        '/chat/completions',
        deepseekRequest
      );

      this.updateRateLimitFromHeaders(response.headers);
      this.validateResponse(response.data);

      if (useThinking) {
        this.thinkingModeRequests++;
      } else {
        this.nonThinkingRequests++;
      }

      return this.transformResponse(response.data, startTime, useThinking);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  protected async *sendStreamRequest(
    config: AIRequestConfig
  ): AsyncGenerator<string, void, unknown> {
    try {
      const useThinking = this.shouldUseThinking(config);
      const apiModel = this.getApiModelId(useThinking);

      const deepseekMessages = this.transformMessages(config.messages);

      const deepseekRequest: DeepSeekRequest = {
        model: apiModel,
        messages: deepseekMessages,
        stream: true,
        ...(useThinking
          ? { max_tokens: config.maxTokens ?? 32768 }
          : {
              temperature: config.temperature ?? 0.7,
              max_tokens: config.maxTokens ?? 4096,
              top_p: config.topP ?? 1.0,
              frequency_penalty: config.frequencyPenalty ?? 0,
              presence_penalty: config.presencePenalty ?? 0,
            }),
      };

      console.log(
        `[DeepSeekProvider] Stream → model: ${apiModel} | thinking: ${useThinking}`
      );

      const response = await this.client.post('/chat/completions', deepseekRequest, {
        responseType: 'stream',
      });

      if (useThinking) {
        this.thinkingModeRequests++;
      } else {
        this.nonThinkingRequests++;
      }

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
              const parsed: DeepSeekStreamChunk = JSON.parse(data);
              const delta = parsed.choices[0]?.delta;

              if (!delta) continue;

              // In thinking mode: skip reasoning_content, only yield content
              if (delta.reasoning_content) {
                continue;
              }

              if (delta.content) {
                yield delta.content;
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
  // INTENT-BASED THINKING MODE DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private shouldUseThinking(config: AIRequestConfig): boolean {
    const modelStr = this.model as string;
    if (modelStr === 'deepseek-reasoner') {
      return true;
    }

    const userMessages = config.messages.filter((m) => m.role === 'user');
    if (userMessages.length === 0) return false;

    const lastMessage = userMessages[userMessages.length - 1].content;
    const analysis = this.analyzeThinkingIntent(lastMessage);

    if (analysis.shouldThink) {
      console.log(
        `[DeepSeekProvider] Thinking mode activated → score: ${analysis.score.toFixed(2)} | ` +
        `category: ${analysis.topCategory} | trigger: "${analysis.topMatch}"`
      );
    }

    return analysis.shouldThink;
  }

  private analyzeThinkingIntent(message: string): {
    shouldThink: boolean;
    score: number;
    topCategory: string;
    topMatch: string;
    matchedPatterns: number;
  } {
    let maxWeight = 0;
    let topCategory = 'none';
    let topMatch = '';
    let matchedPatterns = 0;

    for (const { pattern, weight, category } of THINKING_INTENT_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        matchedPatterns++;
        if (weight > maxWeight) {
          maxWeight = weight;
          topCategory = category;
          topMatch = match[0];
        }
      }
    }

    if (matchedPatterns > 0 && message.length > 500) {
      maxWeight = Math.min(maxWeight + 0.1, 1.0);
    }

    if (matchedPatterns >= 3) {
      maxWeight = Math.min(maxWeight + 0.15, 1.0);
    }

    return {
      shouldThink: maxWeight >= THINKING_THRESHOLD,
      score: maxWeight,
      topCategory,
      topMatch,
      matchedPatterns,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRANSFORMATION METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private transformMessages(messages: any[]): DeepSeekMessage[] {
    return messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));
  }

  private transformResponse(
    deepseekResponse: DeepSeekResponse,
    startTime: number,
    usedThinking: boolean
  ): AIResponse {
    const choice = deepseekResponse.choices[0];

    if (!choice || !choice.message) {
      throw new ProviderInvalidResponseError(
        DEEPSEEK_PROVIDER,
        this.model,
        'No valid choice in response'
      );
    }

    const usage: TokenUsage = {
      promptTokens: deepseekResponse.usage?.prompt_tokens || 0,
      completionTokens: deepseekResponse.usage?.completion_tokens || 0,
      totalTokens: deepseekResponse.usage?.total_tokens || 0,
    };

    return {
      content: choice.message.content,
      model: usedThinking ? createAIModel('deepseek-reasoner') : this.model,
      provider: DEEPSEEK_PROVIDER,
      usage,
      metadata: {
        requestId: deepseekResponse.id,
        latencyMs: Date.now() - startTime,
        cached: false,
        fallbackUsed: false,
        provider: DEEPSEEK_PROVIDER,
      },
      timestamp: new Date(),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION & ERROR HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private validateResponse(response: DeepSeekResponse): void {
    if (!response.choices || response.choices.length === 0) {
      throw new ProviderInvalidResponseError(
        DEEPSEEK_PROVIDER,
        this.model,
        'Empty choices array'
      );
    }

    if (!response.choices[0].message) {
      throw new ProviderInvalidResponseError(
        DEEPSEEK_PROVIDER,
        this.model,
        'Missing message in choice'
      );
    }

    if (!response.usage) {
      console.warn('[DeepSeekProvider] Missing usage information in response');
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data?.error || error.response?.data;
      const message = errorData?.message || error.message;

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new ProviderTimeoutError(
          DEEPSEEK_PROVIDER,
          this.model,
          this.config.timeout || 90000
        );
      }

      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after'];
        return new ProviderRateLimitError(
          DEEPSEEK_PROVIDER,
          this.model,
          retryAfter ? parseInt(retryAfter) : undefined,
          error
        );
      }

      if (status === 401) {
        return new ProviderAuthError(DEEPSEEK_PROVIDER, this.model, error);
      }

      if (status === 400) {
        return new ProviderError(
          `DeepSeek invalid request: ${message}`,
          DEEPSEEK_PROVIDER,
          this.model,
          undefined,
          false,
          error
        );
      }

      if (status === 402) {
        return new ProviderError(
          `DeepSeek insufficient balance: ${message}`,
          DEEPSEEK_PROVIDER,
          this.model,
          undefined,
          false,
          error
        );
      }

      if (status && status >= 500) {
        return new ProviderError(
          `DeepSeek service unavailable: ${message}`,
          DEEPSEEK_PROVIDER,
          this.model,
          undefined,
          true,
          error
        );
      }

      return new ProviderError(
        `DeepSeek API error: ${message}`,
        DEEPSEEK_PROVIDER,
        this.model,
        undefined,
        false,
        error
      );
    }

    return new ProviderError(
      error.message || 'Unknown DeepSeek error',
      DEEPSEEK_PROVIDER,
      this.model,
      undefined,
      false,
      error
    );
  }

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
    return 131072; // 128K tokens
  }

  public getPricing(): {
    inputCacheHit: number;
    inputCacheMiss: number;
    output: number;
  } {
    return {
      inputCacheHit: 0.028,
      inputCacheMiss: 0.28,
      output: 0.42,
    };
  }

  public getThinkingStats(): {
    thinkingRequests: number;
    nonThinkingRequests: number;
    thinkingRate: number;
    totalRequests: number;
  } {
    const total = this.thinkingModeRequests + this.nonThinkingRequests;
    return {
      thinkingRequests: this.thinkingModeRequests,
      nonThinkingRequests: this.nonThinkingRequests,
      thinkingRate: total > 0 ? (this.thinkingModeRequests / total) * 100 : 0,
      totalRequests: total,
    };
  }

  public analyzeMessage(message: string): {
    wouldUseThinking: boolean;
    score: number;
    category: string;
    trigger: string;
    matchedPatterns: number;
  } {
    const analysis = this.analyzeThinkingIntent(message);
    return {
      wouldUseThinking: analysis.shouldThink,
      score: analysis.score,
      category: analysis.topCategory,
      trigger: analysis.topMatch,
      matchedPatterns: analysis.matchedPatterns,
    };
  }

  public getProviderInfo(): {
    provider: AIProvider;
    model: AIModel;
    hasFallback: boolean;
    contextWindow: number;
    pricing: { inputCacheHit: number; inputCacheMiss: number; output: number };
    thinkingStats: ReturnType<DeepSeekProvider['getThinkingStats']>;
    planConfig?: any;
  } {
    return {
      provider: DEEPSEEK_PROVIDER,
      model: this.model,
      hasFallback: !!this.fallbackProvider,
      contextWindow: this.getContextWindow(),
      pricing: this.getPricing(),
      thinkingStats: this.getThinkingStats(),
      planConfig: this.getPlanConfig(),
    };
  }

  public isChatMode(): boolean {
    return (this.model as string) === 'deepseek-chat';
  }

  public isReasonerMode(): boolean {
    return (this.model as string) === 'deepseek-reasoner';
  }
}