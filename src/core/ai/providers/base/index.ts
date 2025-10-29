/**
 * SORIVA AI PROVIDERS - BASE EXPORTS
 * Created by: Amandeep Singh, Punjab, India
 * Purpose: Barrel export for base provider types, errors, and classes
 * Location: src/core/ai/providers/base/index.ts
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  // Branded Types
  type SubscriptionTier,
  type AIProvider,
  type AIModel,

  // Type Helpers
  createSubscriptionTier,
  createAIProvider,
  createAIModel,

  // Enums
  MessageRole,

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
  type FailureReason,
  type RetryConfig,

  // Identity
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
} from './types';

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
} from './errors';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASE PROVIDER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { AIProviderBase } from './AIProvider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USAGE EXAMPLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Usage:
 * import { AIProviderBase, AIError, createAIProvider } from './base';
 */
