/**
 * SORIVA AI PROVIDERS - GOOGLE GEMINI
 * Created by: Amandeep, Punjab, India
 * Purpose: Gemini provider for SPARK tier and fallback for APEX
 * Model: Gemini 2.5 Flash-Lite (Starter), Gemini 2.5 Pro (Advanced plans)
 * Updated: November 17, 2025 - Migrated from Groq to Google Gemini 2.5
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
// GEMINI API TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  systemInstruction?: {
    parts: GeminiPart[];
  };
  tools?: GeminiTool[];
}

// Grounding Tool Types
interface GeminiTool {
  googleSearch?: {};
  googleSearchRetrieval?: {
    dynamicRetrievalConfig?: {
      mode: 'MODE_DYNAMIC' | 'MODE_UNSPECIFIED';
      dynamicThreshold?: number;
    };
  };
}

interface GroundingMetadata {
  searchEntryPoint?: {
    renderedContent: string;
  };
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  groundingSupports?: Array<{
    segment: {
      startIndex: number;
      endIndex: number;
      text: string;
    };
    groundingChunkIndices: number[];
    confidenceScores: number[];
  }>;
  webSearchQueries?: string[];
}

interface GeminiCandidate {
  content: {
    parts: GeminiPart[];
    role: string;
  };
  finishReason: string;
  index: number;
  safetyRatings?: any[];
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  modelVersion?: string;
  groundingMetadata?: GroundingMetadata;
}

interface GeminiStreamChunk {
  candidates?: GeminiCandidate[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GEMINI PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class GeminiProvider extends AIProviderBase {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  /**
   * Constructor with optional fallback provider
   * @param config - Provider configuration
   * @param fallbackProvider - Optional fallback provider
   *
   * Usage:
   * - Spark: Gemini 2.5 Pro (primary) → Claude Haiku 3 (fallback)
   * - Apex: Claude Sonnet 4.5 (primary) → Gemini 2.5 Pro (fallback)
   */
  constructor(config: ProviderConfig, fallbackProvider?: AIProviderBase) {
    // Pass fallback to base class
    super(config, fallbackProvider);

    // Validate API key
    if (!config.apiKey) {
      throw new ApiKeyMissingError(Providers.GOOGLE);
    }

    // Initialize Gemini client
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 60000, // 60s for Gemini
    });

    // Validate configuration
    this.validateConfig();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ABSTRACT METHODS IMPLEMENTATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate Gemini-specific configuration
   * Supports: Gemini 2.5 Pro, Gemini 1.5 Pro, Gemini 1.5 Flash
   */
  protected validateConfig(): void {
     const validModels = [
      'gemini-2.0-flash',      // ✅ STARTER/PLUS - Fast & cheapest (₹21/1M)
      'gemini-2.5-flash-lite', // ✅ Lightest & fastest
      'gemini-2.5-flash',      // ✅ Production stable
      'gemini-2.5-pro',        // ✅ Most capable
      'gemini-1.5-pro-latest', // Fallback (if needed)
      'gemini-1.5-pro',        // Fallback (if needed)
      'gemini-pro',            // Legacy fallback
    ];
              if (!validModels.includes(this.model as string)) {
      throw new ProviderError(
        `Invalid model for Gemini: ${this.model}`,
        Providers.GOOGLE,
        this.model
      );
    }
  }

  /**
   * Send request to Gemini API
   * Note: Response delay and confidentiality handled by base class
   */
  protected async sendRequest(config: AIRequestConfig): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Transform messages to Gemini format
      const { systemInstruction, contents } = this.transformMessages(config.messages);

      // Build Gemini request
      const geminiRequest: GeminiRequest = {
        contents,
        generationConfig: {
          temperature: config.temperature ?? 0.7,
          topP: config.topP ?? 0.95,
          maxOutputTokens: config.maxTokens ?? 8192,
        },
      };

      // Add system instruction if exists
      if (systemInstruction) {
        geminiRequest.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      // Add grounding if enabled
      if ((config as any).enableGrounding) {
        geminiRequest.tools = [
          {
            googleSearch: {},
          },
        ];
      }

      // Build endpoint URL with API key
      const endpoint = `/models/${this.model}:generateContent?key=${this.config.apiKey}`;

      // Make API call
      const response = await this.client.post<GeminiResponse>(endpoint, geminiRequest);

      // Validate response
      this.validateResponse(response.data);

      // Transform to standard response
      return this.transformResponse(response.data, startTime, (config as any).enableGrounding);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Stream response from Gemini API
   * Note: Initial delay handled by base class
   */
  protected async *sendStreamRequest(
    config: AIRequestConfig
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Transform messages to Gemini format
      const { systemInstruction, contents } = this.transformMessages(config.messages);

      // Build Gemini streaming request
      const geminiRequest: GeminiRequest = {
        contents,
        generationConfig: {
          temperature: config.temperature ?? 0.7,
          topP: config.topP ?? 0.95,
          maxOutputTokens: config.maxTokens ?? 8192,
        },
      };

      // Add system instruction if exists
      if (systemInstruction) {
        geminiRequest.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      // Build streaming endpoint URL
      const endpoint = `/models/${this.model}:streamGenerateContent?key=${this.config.apiKey}&alt=sse`;

      // Make streaming API call
      const response = await this.client.post(endpoint, geminiRequest, {
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

            try {
              const parsed: GeminiStreamChunk = JSON.parse(data);

              // Extract text from candidates
              if (parsed.candidates && parsed.candidates.length > 0) {
                const candidate = parsed.candidates[0];
                if (candidate.content && candidate.content.parts) {
                  for (const part of candidate.content.parts) {
                    if (part.text) {
                      yield part.text;
                    }
                  }
                }
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
   * Transform standard messages to Gemini format
   *
   * Gemini-specific requirements:
   * 1. System instruction is separated from conversation
   * 2. Uses 'model' role instead of 'assistant'
   * 3. Messages are in 'contents' array with 'parts'
   */
  private transformMessages(messages: any[]): {
    systemInstruction: string | null;
    contents: GeminiContent[];
  } {
    let systemInstruction: string | null = null;
    const contents: GeminiContent[] = [];

    for (const msg of messages) {
      if (msg.role === MessageRole.SYSTEM) {
        // Gemini handles system instruction separately
        systemInstruction = msg.content;
      } else if (msg.role === MessageRole.USER) {
        contents.push({
          role: 'user',
          parts: [{ text: msg.content }],
        });
      } else if (msg.role === MessageRole.ASSISTANT) {
        contents.push({
          role: 'model', // Gemini uses 'model' instead of 'assistant'
          parts: [{ text: msg.content }],
        });
      }
    }

    return { systemInstruction, contents };
  }

  /**
   * Transform Gemini response to standard format
   */
  private transformResponse(geminiResponse: GeminiResponse, startTime: number, groundingEnabled?: boolean): AIResponse {
    const candidate = geminiResponse.candidates[0];

    if (!candidate || !candidate.content) {
      throw new ProviderInvalidResponseError(
        Providers.GOOGLE,
        this.model,
        'No valid candidate in response'
      );
    }

    // Extract text from parts
    const content = candidate.content.parts.map((part) => part.text).join('');

    if (!content) {
      throw new ProviderInvalidResponseError(
        Providers.GOOGLE,
        this.model,
        'No text content in response'
      );
    }

    const usage: TokenUsage = {
      promptTokens: geminiResponse.usageMetadata.promptTokenCount,
      completionTokens: geminiResponse.usageMetadata.candidatesTokenCount,
      totalTokens: geminiResponse.usageMetadata.totalTokenCount,
    };

    // Build metadata with grounding info if available
    const metadata: any = {
      requestId: `gemini_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      latencyMs: Date.now() - startTime,
      cached: false,
      fallbackUsed: false,
      provider: Providers.GOOGLE,
      groundingEnabled: groundingEnabled || false,
    };

    // Add grounding metadata if present
    if (geminiResponse.groundingMetadata) {
      metadata.grounding = {
        searchQueries: geminiResponse.groundingMetadata.webSearchQueries || [],
        sources: geminiResponse.groundingMetadata.groundingChunks?.map(chunk => ({
          url: chunk.web?.uri,
          title: chunk.web?.title,
        })) || [],
        searchEntryPoint: geminiResponse.groundingMetadata.searchEntryPoint?.renderedContent,
      };
    }

    return {
      content,
      model: this.model,
      provider: Providers.GOOGLE,
      usage,
      metadata,
      timestamp: new Date(),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION & ERROR HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Validate Gemini response structure
   */
  private validateResponse(response: GeminiResponse): void {
    if (!response.candidates || response.candidates.length === 0) {
      throw new ProviderInvalidResponseError(
        Providers.GOOGLE,
        this.model,
        'Empty candidates array'
      );
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      throw new ProviderInvalidResponseError(
        Providers.GOOGLE,
        this.model,
        'Missing content parts in candidate'
      );
    }

    if (!response.usageMetadata) {
      throw new ProviderInvalidResponseError(
        Providers.GOOGLE,
        this.model,
        'Missing usage metadata'
      );
    }
  }

  /**
   * Handle Gemini API errors with proper categorization
   */
  private handleError(error: any): Error {
    // Axios error
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data?.error;
      const message = errorData?.message || error.message;

      // Timeout
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return new ProviderTimeoutError(Providers.GOOGLE, this.model, this.config.timeout || 60000);
      }

      // Rate limit (429)
      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after'];
        return new ProviderRateLimitError(
          Providers.GOOGLE,
          this.model,
          retryAfter ? parseInt(retryAfter) : undefined,
          error
        );
      }

      // Authentication (401, 403)
      if (status === 401 || status === 403) {
        return new ProviderAuthError(Providers.GOOGLE, this.model, error);
      }

      // Bad Request (400) - Often means safety filter triggered or invalid input
      if (status === 400) {
        const reason = errorData?.details?.[0]?.reason || 'Invalid request';
        return new ProviderError(
          `Gemini request error: ${message} (${reason})`,
          Providers.GOOGLE,
          this.model,
          undefined,
          false, // Usually not retryable
          error
        );
      }

      // Service unavailable (500, 502, 503, 504)
      if (status && status >= 500) {
        return new ProviderError(
          `Gemini service unavailable: ${message}`,
          Providers.GOOGLE,
          this.model,
          undefined,
          true, // Retryable
          error
        );
      }

      // Other errors
      return new ProviderError(
        `Gemini API error: ${message}`,
        Providers.GOOGLE,
        this.model,
        undefined,
        false,
        error
      );
    }

    // Unknown error
    return new ProviderError(
      error.message || 'Unknown Gemini error',
      Providers.GOOGLE,
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
   * Get Gemini API status
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
   * Gemini 2.5 Pro has massive 2M token context (best in class)
   */
  public getContextWindow(): number {
  const model = this.model as string;

  // Gemini 2.5 has 2M context
  if (model.includes('gemini-2.5')) {
    return 2000000; // 2M tokens
  }

  // Gemini 2.0 Flash has 1M context
  if (model.includes('gemini-2.0')) {
    return 1000000; // 1M tokens
  }

  // Gemini 1.5 Pro has 1M context
  if (model.includes('gemini-1.5-pro')) {
    return 1000000; // 1M tokens
  }

  // Gemini 1.5 Flash has 1M context
  if (model.includes('gemini-1.5-flash')) {
    return 1000000; // 1M tokens
  }

  // Default for older models
  return 32000;
}

  /**
   * Check if content was blocked by safety filters
   */
  public wasBlockedBySafety(response: GeminiResponse): boolean {
    const candidate = response.candidates[0];
    return candidate?.finishReason === 'SAFETY';
  }

  /**
   * Get safety ratings from response
   */
  public getSafetyRatings(response: GeminiResponse): any[] | undefined {
    const candidate = response.candidates[0];
    return candidate?.safetyRatings;
  }

  /**
   * Get provider information
   */
  public getProviderInfo(): {
    provider: AIProvider;
    model: AIModel;
    hasFallback: boolean;
    contextWindow: number;
    planConfig?: any;
  } {
    return {
      provider: Providers.GOOGLE,
      model: this.model,
      hasFallback: !!this.fallbackProvider,
      contextWindow: this.getContextWindow(),
      planConfig: this.getPlanConfig(),
    };
  }

  /**
   * Check if model is Pro version (larger, more capable)
   */
  public isProModel(): boolean {
    return (this.model as string).includes('pro');
  }

  /**
   * Check if model is Flash version (faster, cheaper)
   */
  public isFlashModel(): boolean {
    return (this.model as string).includes('flash');
  }

  /**
   * Check if model is 2.5 generation (latest)
   */
  public is25Generation(): boolean {
    return (this.model as string).includes('2.5');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUNDING WITH GOOGLE SEARCH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate response with Google Search grounding
   * Use for real-time queries: news, weather, scores, prices, etc.
   * 
   * @param config - AI request configuration
   * @returns AIResponse with grounding metadata (sources, search queries)
   * 
   * FREE: 45,000 searches/month (1,500/day)
   * PAID: $35/1K queries (Gemini 2.x) or $14/1K (Gemini 3)
   */
  public async generateWithGrounding(config: AIRequestConfig): Promise<AIResponse> {
    // Enable grounding for this request
    const groundedConfig = {
      ...config,
      enableGrounding: true,
    };

    return this.chat(groundedConfig);
  }

  /**
   * Check if query needs grounding (real-time data)
   * Keywords that typically need fresh data from web
   */
  public static needsGrounding(query: string): boolean {
    const groundingKeywords = [
      // News & Current Events
      'news', 'khabar', 'latest', 'today', 'aaj', 'abhi', 'current', 'recent', 'breaking',
      // Weather
      'weather', 'mausam', 'temperature', 'barish', 'rain', 'forecast',
      // Sports
      'score', 'match', 'ipl', 'cricket', 'football', 'winner', 'result',
      // Finance
      'price', 'rate', 'stock', 'share', 'nifty', 'sensex', 'dollar', 'rupee', 'gold', 'petrol', 'diesel',
      // Trending
      'trending', 'viral', 'popular',
      // Local
      'near me', 'nearby', 'location',
      // Time-sensitive
      'election', 'live', 'update', 'happening',
    ];

    const lowerQuery = query.toLowerCase();
    return groundingKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Get grounding usage stats (for billing tracking)
   */
  public getGroundingInfo(): {
    freeQuotaDaily: number;
    freeQuotaMonthly: number;
    paidRatePer1K: number;
    model: string;
  } {
    return {
      freeQuotaDaily: 1500,
      freeQuotaMonthly: 45000,
      paidRatePer1K: (this.model as string).includes('gemini-3') ? 14 : 35, // USD
      model: this.model as string,
    };
  }
}
