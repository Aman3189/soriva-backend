/**
 * SORIVA AI PROVIDERS - PUBLIC API (FIXED)
 * Created by: Amandeep Singh, Punjab, India
 * Purpose: Clean exports for AI provider system
 * Fixed: Correct type exports, removed non-existent provider classes
 *
 * Usage Example:
 * ```typescript
 * import { ProviderFactory, createSubscriptionTier } from '@/core/ai/providers';
 *
 * // Initialize factory
 * const factory = ProviderFactory.getInstance({
 *   groqApiKey: process.env.GROQ_API_KEY,
 *   anthropicApiKey: process.env.ANTHROPIC_API_KEY,
 *   googleApiKey: process.env.GOOGLE_API_KEY,
 *   openaiApiKey: process.env.OPENAI_API_KEY,
 * });
 *
 * await factory.initialize();
 *
 * // Execute request with automatic fallback
 * const response = await factory.executeWithFallback(
 *   createSubscriptionTier('SPARK'),
 *   {
 *     model: createAIModel('gemini-2.5-pro'),
 *     messages: [{ role: MessageRole.USER, content: 'Hello!' }],
 *   }
 * );
 * ```
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASE TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  // Branded Types (Dynamic from DB)
  type SubscriptionTier,
  type AIProvider,
  type AIModel,

  // Type Helpers (Create branded types)
  createSubscriptionTier,
  createAIProvider,
  createAIModel,

  // Enums (Standard)
  MessageRole,

  // Type Union (Dynamic)
  type FailureReason,

  // Core Interfaces
  type AIMessage,
  type AIRequestConfig,
  type AIResponse,
  type TokenUsage,
  type ResponseMetadata,
  type SecurityFlags,

  // Provider Configuration
  type ProviderConfig,
  type TierConfig,
  type RateLimit,
  type RateLimitStatus,
  type TierFeatures,

  // Security Types
  type JailbreakPattern,
  type SecuritySeverity,

  // Fallback & Retry
  type FallbackContext,
  type RetryConfig,

  // Identity (Read-only)
  SORIVA_IDENTITY,
  type SystemIdentity,

  // Base Provider Interface
  type IAIProvider,

  // Dynamic Configuration Types
  type ProviderDefinition,
  type ModelDefinition,
  type TierDefinition,

  // Utility Types
  type ProviderConstructor,
  type FallbackStrategy,
  type LogContext,
  type ValidationResult,
  type ProviderStatus,

  // Analytics Types
  type UsageMetrics,
  type ProviderMetrics,

  // Type Guards
  isValidSubscriptionTier,
  isValidAIProvider,
  isValidAIModel,

  // Re-exports
  type AIConfig,
  type AIResult,
  type SecurityCheck,
} from './base/types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR CLASSES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  // Error Codes
  AIErrorCode,

  // Base Error
  AIError,
  type AIErrorMetadata,

  // Provider Errors
  ProviderError,
  ProviderTimeoutError,
  ProviderRateLimitError,
  ProviderAuthError,
  ProviderInvalidResponseError,

  // Security Errors
  SecurityError,
  JailbreakError,
  SystemPromptExposureError,
  ModelRevealError,
  MaliciousContentError,

  // Request Errors
  RequestError,
  InvalidRequestError,
  InvalidModelError,
  TokenLimitError,

  // Fallback Errors
  FallbackError,
  AllProvidersFailedError,
  NoFallbackAvailableError,

  // Configuration Errors
  ConfigError,
  ConfigMissingError,
  ApiKeyMissingError,
  ApiKeyInvalidError,

  // Error Handler Utility
  ErrorHandler,
} from './base/errors';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASE PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { AIProviderBase } from './base/AIProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER IMPLEMENTATIONS (When created, uncomment these)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// TODO: Uncomment when provider classes are created
// export { GroqProvider } from './groq.provider';
// export { ClaudeProvider } from './claude.provider';
// export { GeminiProvider } from './gemini.provider';
// export { GPTProvider } from './gpt.provider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER FACTORY (Main Entry Point)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { ProviderFactory, type ProviderFactoryConfig } from './provider.factory';

// Import for internal use
import type { ProviderFactoryConfig } from './provider.factory';
import { ProviderFactory } from './provider.factory';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVENIENCE EXPORTS (Optional)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Quick initialization helper
 */
export const initializeProviders = async (config: ProviderFactoryConfig) => {
  const factory = ProviderFactory.getInstance(config);
  await factory.initialize();
  return factory;
};

/**
 * Version information
 */
export const VERSION = '1.0.0';

/**
 * System information
 */
export const SYSTEM_INFO = {
  name: 'Soriva AI Provider System',
  version: VERSION,
  creator: 'Amandeep Singh',
  location: 'Punjab, India',
  description: 'Enterprise-grade AI provider system with smart fallback logic',
} as const;
