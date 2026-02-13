/**
 * SORIVA AI PROVIDERS - DYNAMIC BASE TYPES
 * Created by: Amandeep, Punjab, India
 * Purpose: Core type definitions for AI provider system (100% DYNAMIC)
 *
 * ARCHITECTURE:
 * - Brand Types: Type-safe string branding for compile-time safety
 * - Const Objects: Common values for easy access in code
 * - Helper Functions: Dynamic creation for database-loaded values
 * 
 * CHANGE LOG:
 * - Feb 2026: Mistral Large 3: mistral-large-latest ($0.50/$1.50 per 1M tokens)
 * - Feb 2026: European provider, Apache 2.0 license, no Chinese dependency
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BRAND TYPES (Type-safe string branding)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

declare const __brand: unique symbol;
type Brand<T, TBrand> = T & { [__brand]: TBrand };

/**
 * Subscription Tier - Loaded dynamically from database
 * Examples: 'VIBE_FREE', 'VIBE_PAID', 'SPARK', 'APEX', 'PERSONA'
 */
export type SubscriptionTier = Brand<string, 'SubscriptionTier'>;

/**
 * AI Provider - Loaded dynamically from database
 * Examples: 'GROQ', 'ANTHROPIC', 'GOOGLE', 'OPENAI', 'MISTRAL', 'OPENROUTER'
 */
export type AIProvider = Brand<string, 'AIProvider'>;

/**
 * AI Model - Loaded dynamically from database
 * Examples: 'llama3-70b-8192', 'claude-3-haiku-20240307', 'mistral-large-latest'
 */
export type AIModel = Brand<string, 'AIModel'>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE HELPERS (Runtime creation of branded types)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createSubscriptionTier = (tier: string): SubscriptionTier => tier as SubscriptionTier;

export const createAIProvider = (provider: string): AIProvider => provider as AIProvider;

export const createAIModel = (model: string): AIModel => model as AIModel;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONST OBJECTS FOR COMMON VALUES (Easy access in code)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Common AI Providers - Use these in code for type safety
 * These are loaded from database, but defined here for convenience
 */
export const Providers = {
  GROQ: createAIProvider('GROQ'),
  ANTHROPIC: createAIProvider('ANTHROPIC'),
  GOOGLE: createAIProvider('GOOGLE'),
  OPENAI: createAIProvider('OPENAI'),
  MISTRAL: createAIProvider('MISTRAL'),         // Mistral Large 3 (European, Apache 2.0)
  COHERE: createAIProvider('COHERE'),
  OPENROUTER: createAIProvider('OPENROUTER'),

  // Legacy (kept for backward compatibility, do NOT use in new code)
  /** @deprecated Use MISTRAL instead - DeepSeek removed for sovereignty */
  DEEPSEEK: createAIProvider('DEEPSEEK'),
} as const;

/**
 * Common AI Models - Use these in code for type safety
 * These are loaded from database, but defined here for convenience
 * Updated: February 2026 - Replaced DeepSeek with Mistral Large 3
 */
export const Models = {
  // ── Groq Models ──────────────────────────────────────
  LLAMA3_70B: createAIModel('llama-3.3-70b-versatile'),
  LLAMA3_8B: createAIModel('llama3-8b-8192'),
  MIXTRAL_8X7B: createAIModel('mixtral-8x7b-32768'),
  GEMMA_7B: createAIModel('gemma-7b-it'),

  // ── Anthropic Models ─────────────────────────────────
  CLAUDE_3_OPUS: createAIModel('claude-3-opus-20240229'),
  CLAUDE_3_SONNET: createAIModel('claude-3-sonnet-20240229'),
  CLAUDE_3_HAIKU: createAIModel('claude-3-haiku-20240307'),
  CLAUDE_35_SONNET: createAIModel('claude-3-5-sonnet-20241022'),
  CLAUDE_SONNET_45: createAIModel('claude-sonnet-4-5'),
  CLAUDE_HAIKU_45: createAIModel('claude-haiku-4-5'),

  // ── Google Models ────────────────────────────────────
  GEMINI_15_PRO: createAIModel('gemini-1.5-pro-latest'),
  GEMINI_15_FLASH: createAIModel('gemini-1.5-flash-latest'),
  GEMINI_PRO: createAIModel('gemini-pro'),
  GEMINI_25_FLASH: createAIModel('gemini-2.5-flash'),
  GEMINI_25_PRO: createAIModel('gemini-2.5-pro'),
  GEMINI_3_PRO: createAIModel('gemini-3-pro'),
  GEMINI_25_FLASH_LITE: createAIModel('gemini-2.5-flash-lite'),

  // ── OpenAI Models ────────────────────────────────────
  GPT4_TURBO: createAIModel('gpt-4-turbo-preview'),
  GPT4: createAIModel('gpt-4'),
  GPT35_TURBO: createAIModel('gpt-3.5-turbo'),
  GPT_51: createAIModel('gpt-5.1'),

  // ── Mistral Models (Replaces DeepSeek) ───────────────
  // API: https://api.mistral.ai/v1
  // Pricing: $0.50/$1.50 per 1M tokens (input/output)
  MISTRAL_LARGE_3: createAIModel('mistral-large-latest'),     // Mistral Large 3 (December 2025)
  MISTRAL_LARGE_LATEST: createAIModel('mistral-large-latest'), // Alias for latest
  MAGISTRAL_MEDIUM: createAIModel('magistral-medium-latest'),  // Reasoning model

  // ── DeepSeek Models (LEGACY - Do NOT use in new code) ──
  /** @deprecated Replaced by MISTRAL_LARGE_3 - Chinese provider removed */
  DEEPSEEK_CHAT: createAIModel('deepseek-chat'),
  /** @deprecated Replaced by MAGISTRAL_MEDIUM */
  DEEPSEEK_REASONER: createAIModel('deepseek-reasoner'),
} as const;

/**
 * Common Subscription Tiers
 * Updated: November 26, 2025 - New plan names
 */
export const Tiers = {
  // Legacy names (for backward compatibility)
  VIBE_FREE: createSubscriptionTier('VIBE_FREE'),
  VIBE_PAID: createSubscriptionTier('VIBE_PAID'),
  SPARK: createSubscriptionTier('SPARK'),
  APEX: createSubscriptionTier('APEX'),
  PERSONA: createSubscriptionTier('PERSONA'),
  
  // New plan names
  STARTER: createSubscriptionTier('STARTER'),
  PLUS: createSubscriptionTier('PLUS'),
  PRO: createSubscriptionTier('PRO'),
  EDGE: createSubscriptionTier('EDGE'),
  LIFE: createSubscriptionTier('LIFE'),
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MESSAGE TYPES (Keep enum - standard across all AI systems)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface AIMessage {
  role: MessageRole;
  content: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUEST & RESPONSE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AIRequestConfig {
  model: AIModel;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  userId?: string;
  sessionId?: string;
  // ✅ NEW: Gemini Grounding (Google Search)
  enableGrounding?: boolean;
}

export interface AIResponse {
  content: string;
  model: AIModel;
  provider: AIProvider;
  usage: TokenUsage;
  metadata: ResponseMetadata;
  timestamp: Date;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ResponseMetadata {
  requestId: string;
  latencyMs: number;
  cached?: boolean;

  // ==================== FALLBACK TRACKING ====================
  provider?: AIProvider;
  usedFallback?: boolean;
  fallbackUsed?: boolean;       // Legacy name (backward compatible)
  fallbackProvider?: AIProvider;
  fallbackModel?: AIModel;
  originalProvider?: AIProvider;
  // ===========================================================

  securityFlags?: SecurityFlags;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECURITY & PROTECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SecurityFlags {
  jailbreakAttempt?: boolean;
  systemPromptExposure?: boolean;
  modelRevealAttempt?: boolean;
  maliciousContent?: boolean;
  blockedReason?: string;
}

/**
 * Jailbreak Pattern - Loaded dynamically from database
 */
export interface JailbreakPattern {
  id: string;
  pattern: RegExp | string;
  severity: SecuritySeverity;
  description: string;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Security Severity - Dynamic levels
 */
export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ProviderConfig {
  provider: AIProvider;
  model: AIModel;
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  metadata?: Record<string, any>;
}

export interface TierConfig {
  tier: SubscriptionTier;
  primaryProvider: AIProvider;
  primaryModel: AIModel;
  fallbackProvider?: AIProvider;
  fallbackModel?: AIModel;
  rateLimit?: RateLimit;
  features?: TierFeatures;
}

export interface TierFeatures {
  messageLimit?: number;
  prioritySupport?: boolean;
  customModels?: boolean;
  apiAccess?: boolean;
  teamFeatures?: boolean;
  [key: string]: any;
}

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  tokensPerMinute?: number;
  tokensPerHour?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FALLBACK & RETRY LOGIC (Make dynamic)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Failure Reason - Can be extended dynamically
 */
export type FailureReason =
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'SERVICE_UNAVAILABLE'
  | 'INVALID_REQUEST'
  | 'AUTHENTICATION_ERROR'
  | 'CONTENT_FILTER'
  | 'SECURITY_BLOCK'
  | 'UNKNOWN'
  | string;

export interface FallbackContext {
  originalProvider: AIProvider;
  originalModel: AIModel;
  failureReason: FailureReason;
  attemptNumber: number;
  error: Error;
  timestamp: Date;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  exponentialBackoff: boolean;
  retryableErrors?: FailureReason[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SYSTEM IDENTITY (LOCKED - Never reveal)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SystemIdentity {
  name: string;
  creator: string;
  location: string;
  description: string;
  version: string;
  secrets: {
    hideModels: boolean;
    hideProviders: boolean;
    protectSystemPrompt: boolean;
  };
}

/**
 * System Identity - Loaded from database, frozen at runtime
 * NEVER reveal in responses to users
 */
export const SORIVA_IDENTITY: SystemIdentity = Object.freeze({
  name: 'Soriva',
  creator: 'Amandeep',
  location: 'Punjab, India',
  description: 'Advanced AI Assistant',
  version: '1.0.0',
  secrets: {
    hideModels: true,
    hideProviders: true,
    protectSystemPrompt: true,
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASE PROVIDER INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface IAIProvider {
  readonly provider: AIProvider;
  readonly model: AIModel;

  /**
   * Send a chat completion request
   */
  chat(config: AIRequestConfig): Promise<AIResponse>;

  /**
   * Stream a chat completion response
   */
  streamChat(config: AIRequestConfig): AsyncGenerator<string, void, unknown>;

  /**
   * Validate provider configuration
   */
  validate(): Promise<boolean>;

  /**
   * Health check for provider
   */
  healthCheck(): Promise<boolean>;

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): Promise<RateLimitStatus>;
}

export interface RateLimitStatus {
  remaining: number;
  limit: number;
  resetAt: Date;
  retryAfter?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DYNAMIC CONFIGURATION TYPES (Loaded from database)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Provider Definition - Loaded from database
 */
export interface ProviderDefinition {
  id: string;
  provider: AIProvider;
  name: string;
  baseUrl: string;
  enabled: boolean;
  priority: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Model Definition - Loaded from database
 */
export interface ModelDefinition {
  id: string;
  model: AIModel;
  provider: AIProvider;
  name: string;
  displayName: string;
  maxTokens: number;
  costPer1kInput?: number;
  costPer1kOutput?: number;
  enabled: boolean;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tier Definition - Loaded from database
 */
export interface TierDefinition {
  id: string;
  tier: SubscriptionTier;
  name: string;
  displayName: string;
  price: number;
  currency: string;
  config: TierConfig;
  enabled: boolean;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ProviderConstructor = new (config: ProviderConfig) => IAIProvider;

export type FallbackStrategy = 'IMMEDIATE' | 'RETRY_THEN_FALLBACK' | 'NONE';

export interface LogContext {
  requestId: string;
  userId?: string;
  tier: SubscriptionTier;
  provider: AIProvider;
  model: AIModel;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface ProviderStatus {
  provider: AIProvider;
  model: AIModel;
  available: boolean;
  latencyMs?: number;
  usedFallback?: boolean;
  fallbackProvider?: string;
  fallbackModel?: string;
  errorRate?: number;
  lastChecked: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANALYTICS & MONITORING TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface UsageMetrics {
  userId: string;
  tier: SubscriptionTier;
  provider: AIProvider;
  model: AIModel;
  requestCount: number;
  tokenCount: number;
  costEstimate: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface ProviderMetrics {
  provider: AIProvider;
  model: AIModel;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number;
  lastUpdated: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE GUARDS (Runtime validation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const isValidSubscriptionTier = (tier: unknown): tier is SubscriptionTier => {
  return typeof tier === 'string' && tier.length > 0;
};

export const isValidAIProvider = (provider: unknown): provider is AIProvider => {
  return typeof provider === 'string' && provider.length > 0;
};

export const isValidAIModel = (model: unknown): model is AIModel => {
  return typeof model === 'string' && model.length > 0;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT ALL TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Re-export common types for convenience
 */
export type AIConfig = AIRequestConfig;
export type AIResult = AIResponse;
export type SecurityCheck = SecurityFlags;