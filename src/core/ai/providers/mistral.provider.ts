/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI PROVIDERS - MISTRAL v2.0 (Official Agent API)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * v2.0 CHANGES (February 14, 2026):
 * - Web Search now uses OFFICIAL Agent API + Conversations API
 * - Pre-created Agent with web_search tool
 * - Accurate search results with proper citations
 * - SMART ROUTING: Agent API only for search, Chat API for general
 * 
 * COST OPTIMIZATION:
 * - searchWeb() → Agent API (use only when search needed)
 * - sendRequest() → Chat Completions API (general queries)
 * 
 * Models:
 * - mistral-large-latest: General + Web Search
 * - devstral-medium-latest: Coding
 * 
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

// ✅ PRE-CREATED AGENT ID (with web_search tool)
// Created via: POST /v1/agents with tools: [{ type: "web_search" }]
const WEB_SEARCH_AGENT_ID = process.env.MISTRAL_WEBSEARCH_AGENT_ID || 'ag_019c5b390b997763b48f3a985df894e0';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ID MAPPING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MODEL_ID_MAP: Record<string, string> = {
  // Mistral Large (General + Search)
  'mistral-large-latest': 'mistral-large-latest',
  'mistral-large-2512': 'mistral-large-latest',

  // Devstral (Coding)
  'devstral-medium-latest': 'devstral-medium-latest',
  'devstral-medium-2512': 'devstral-medium-latest',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES - Chat Completions API (General Queries)
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
// TYPES - Agent API (Search Queries Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AgentConversationRequest {
  agent_id: string;
  inputs: string;
  store?: boolean;
}

interface AgentConversationResponse {
  object: string;
  conversation_id: string;
  outputs: Array<{
    object: string;
    type: 'tool.execution' | 'message.output';
    id: string;
    name?: string;
    arguments?: string;
    content?: Array<{
      type: 'text' | 'tool_reference';
      text?: string;
      tool?: string;
      title?: string;
      url?: string;
      description?: string;
    }>;
    model?: string;
    role?: string;
    created_at: string;
    completed_at: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    connectors?: {
      web_search?: number;
    };
  };
}

interface WebSearchResult {
  answer: string;
  sources: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timeMs: number;
}

export interface MistralRequestConfig extends AIRequestConfig {
  enableWebSearch?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MISTRAL PROVIDER CLASS v2.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class MistralProvider extends AIProviderBase {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string = 'https://api.mistral.ai/v1';
  private readonly webSearchAgentId: string;

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
      timeout: config.timeout || 90000,
    });

    this.webSearchAgentId = WEB_SEARCH_AGENT_ID;

    this.validateConfig();
    console.log(`[MistralProvider v2.0] Initialized: ${this.model} | WebSearch Agent: ${this.webSearchAgentId}`);
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
  // MAIN REQUEST (Chat Completions - GENERAL QUERIES)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USE THIS FOR: General chat, coding, creative, non-search queries
  // COST: Normal Mistral Large pricing
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

      console.log(`[Mistral v2.0] 💬 Chat Completions API (General Query)`);

      const response = await this.client.post<MistralResponse>(
        '/chat/completions',
        request
      );

      this.updateRateLimitFromHeaders(response.headers);

      return this.transformResponse(response.data, startTime);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WEB SEARCH v2.0 (Agent API - SEARCH QUERIES ONLY)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USE THIS FOR: News, current events, real-time data, factual queries
  // COST: Higher (Agent API + web_search connector)
  // CALL ONLY WHEN: searchNeeded = true from orchestrator
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Search the web using Mistral's official Agent API
   * ⚠️ USE ONLY FOR SEARCH QUERIES - Higher cost than chat completions
   * 
   * @param query - Search query
   * @returns WebSearchResult with answer, sources, and usage
   */
  public async searchWeb(query: string): Promise<WebSearchResult> {
    const startTime = Date.now();

    try {
      console.log(`[Mistral v2.0] 🔍 Agent API Web Search: "${query.substring(0, 50)}..."`);

      const request: AgentConversationRequest = {
        agent_id: this.webSearchAgentId,
        inputs: query,
        store: false,
      };

      const response = await this.client.post<AgentConversationResponse>(
        '/conversations',
        request
      );

      return this.parseAgentResponse(response.data, startTime);
    } catch (error) {
      console.error('[Mistral v2.0] ❌ Web Search failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Parse Agent API response and extract answer + sources
   */
  private parseAgentResponse(
    response: AgentConversationResponse,
    startTime: number
  ): WebSearchResult {
    let answer = '';
    const sources: Array<{ title: string; url: string; description?: string }> = [];

    const messageOutput = response.outputs.find(o => o.type === 'message.output');

    if (messageOutput?.content) {
      for (const chunk of messageOutput.content) {
        if (chunk.type === 'text' && chunk.text) {
          answer += chunk.text;
        } else if (chunk.type === 'tool_reference' && chunk.url) {
          sources.push({
            title: chunk.title || 'Source',
            url: chunk.url,
            description: chunk.description,
          });
        }
      }
    }

    const result: WebSearchResult = {
      answer: answer.trim(),
      sources,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      timeMs: Date.now() - startTime,
    };

    console.log(`[Mistral v2.0] ✅ Search complete:`, {
      answerLength: result.answer.length,
      sources: result.sources.length,
      tokens: result.usage.totalTokens,
      timeMs: result.timeMs,
    });

    return result;
  }

  /**
   * Legacy method - redirects to searchWeb for backward compatibility
   */
  public async searchWebLegacy(
    query: string,
    systemPrompt?: string
  ): Promise<{ answer: string; timeMs: number }> {
    const result = await this.searchWeb(query);
    return {
      answer: result.answer,
      timeMs: result.timeMs,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AGENT MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Create a new web search agent (run once, save the ID)
   */
  public async createWebSearchAgent(
    name: string = 'Soriva Search Agent',
    instructions: string = 'Search the web accurately. Always use EXACT dates and facts from sources. Never estimate.'
  ): Promise<string> {
    try {
      const response = await this.client.post('/agents', {
        model: 'mistral-large-latest',
        name,
        description: 'Web search agent for Soriva',
        instructions,
        tools: [{ type: 'web_search' }],
      });

      const agentId = response.data.id;
      console.log(`[Mistral v2.0] ✅ Created Web Search Agent: ${agentId}`);
      console.log(`[Mistral v2.0] 💡 Save this ID to MISTRAL_WEBSEARCH_AGENT_ID env variable`);

      return agentId;
    } catch (error) {
      console.error('[Mistral v2.0] ❌ Failed to create agent:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get current agent ID
   */
  public getWebSearchAgentId(): string {
    return this.webSearchAgentId;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STREAMING (Chat Completions - General)
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
      const message = error.response?.data?.error?.message || 
                      error.response?.data?.detail ||
                      error.message;

      if (error.code === 'ECONNABORTED') {
        return new ProviderTimeoutError(MISTRAL_PROVIDER, this.model, 90000);
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
    return true;
  }

  public isDevstral(): boolean {
    return this.getApiModelId() === 'devstral-medium-latest';
  }

  public getContextWindow(): number {
    return 131072;
  }

  public getPricing(): { input: number; output: number } {
    return { input: 0.5, output: 1.5 };
  }
}