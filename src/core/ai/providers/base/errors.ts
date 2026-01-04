/**
 * SORIVA AI PROVIDERS - ERROR HANDLING (FIXED)
 * Created by: Amandeep, Punjab, India
 * Purpose: Custom error classes for robust error handling
 * Fixed: Compatible with branded string types
 */

import { AIProvider, AIModel, FailureReason } from './types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR CODES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum AIErrorCode {
  // Provider Errors (1xxx)
  PROVIDER_UNAVAILABLE = 'AI_1001',
  PROVIDER_TIMEOUT = 'AI_1002',
  PROVIDER_RATE_LIMIT = 'AI_1003',
  PROVIDER_AUTH_FAILED = 'AI_1004',
  PROVIDER_INVALID_RESPONSE = 'AI_1005',

  // Request Errors (2xxx)
  INVALID_REQUEST = 'AI_2001',
  INVALID_MODEL = 'AI_2002',
  INVALID_MESSAGES = 'AI_2003',
  TOKEN_LIMIT_EXCEEDED = 'AI_2004',
  EMPTY_RESPONSE = 'AI_2005',

  // Security Errors (3xxx)
  JAILBREAK_DETECTED = 'AI_3001',
  SYSTEM_PROMPT_EXPOSURE = 'AI_3002',
  MODEL_REVEAL_ATTEMPT = 'AI_3003',
  MALICIOUS_CONTENT = 'AI_3004',
  CONTENT_FILTERED = 'AI_3005',

  // Fallback Errors (4xxx)
  FALLBACK_FAILED = 'AI_4001',
  ALL_PROVIDERS_FAILED = 'AI_4002',
  NO_FALLBACK_AVAILABLE = 'AI_4003',

  // Configuration Errors (5xxx)
  CONFIG_MISSING = 'AI_5001',
  CONFIG_INVALID = 'AI_5002',
  API_KEY_MISSING = 'AI_5003',
  API_KEY_INVALID = 'AI_5004',

  // Unknown
  UNKNOWN_ERROR = 'AI_9999',
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASE AI ERROR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AIErrorMetadata {
  provider?: AIProvider;
  model?: AIModel;
  requestId?: string;
  timestamp: Date;
  retryable: boolean;
  statusCode?: number;
  originalError?: Error;
  context?: Record<string, any>;
}

export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly metadata: AIErrorMetadata;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: AIErrorCode,
    metadata: Partial<AIErrorMetadata> = {},
    isOperational = true
  ) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.isOperational = isOperational;
    this.metadata = {
      timestamp: new Date(),
      retryable: false,
      ...metadata,
    };

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      metadata: this.metadata,
      stack: this.stack,
    };
  }

  /**
   * Get user-friendly error message (hides internal details)
   */
  getUserMessage(): string {
    // Never expose internal provider details to users
    const genericMessages: Record<string, string> = {
      [AIErrorCode.PROVIDER_UNAVAILABLE]: 'Soriva is temporarily unavailable. Please try again.',
      [AIErrorCode.PROVIDER_TIMEOUT]: 'Request timed out. Please try again.',
      [AIErrorCode.PROVIDER_RATE_LIMIT]: 'Too many requests. Please wait a moment.',
      [AIErrorCode.JAILBREAK_DETECTED]: 'Your request was blocked for security reasons.',
      [AIErrorCode.SYSTEM_PROMPT_EXPOSURE]: 'This type of request is not allowed.',
      [AIErrorCode.MODEL_REVEAL_ATTEMPT]: 'This information is not available.',
      [AIErrorCode.MALICIOUS_CONTENT]: 'Your request contains inappropriate content.',
      [AIErrorCode.CONTENT_FILTERED]: 'Content was filtered for safety.',
    };

    return genericMessages[this.code] || 'An error occurred. Please try again.';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER ERRORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ProviderError extends AIError {
  constructor(
    message: string,
    provider: AIProvider,
    model: AIModel,
    code: AIErrorCode = AIErrorCode.PROVIDER_UNAVAILABLE,
    retryable = true,
    originalError?: Error
  ) {
    super(message, code, {
      provider,
      model,
      retryable,
      originalError,
    });
    this.name = 'ProviderError';
  }
}

export class ProviderTimeoutError extends ProviderError {
  constructor(provider: AIProvider, model: AIModel, timeoutMs: number) {
    super(
      `Provider ${provider} timed out after ${timeoutMs}ms`,
      provider,
      model,
      AIErrorCode.PROVIDER_TIMEOUT,
      true
    );
    this.name = 'ProviderTimeoutError';
  }
}

export class ProviderRateLimitError extends ProviderError {
  public readonly retryAfter?: number;

  constructor(provider: AIProvider, model: AIModel, retryAfter?: number, originalError?: Error) {
    super(
      `Rate limit exceeded for ${provider}`,
      provider,
      model,
      AIErrorCode.PROVIDER_RATE_LIMIT,
      true,
      originalError
    );
    this.name = 'ProviderRateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ProviderAuthError extends ProviderError {
  constructor(provider: AIProvider, model: AIModel, originalError?: Error) {
    super(
      `Authentication failed for ${provider}`,
      provider,
      model,
      AIErrorCode.PROVIDER_AUTH_FAILED,
      false,
      originalError
    );
    this.name = 'ProviderAuthError';
  }
}

export class ProviderInvalidResponseError extends ProviderError {
  constructor(provider: AIProvider, model: AIModel, reason: string) {
    super(
      `Invalid response from ${provider}: ${reason}`,
      provider,
      model,
      AIErrorCode.PROVIDER_INVALID_RESPONSE,
      true
    );
    this.name = 'ProviderInvalidResponseError';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECURITY ERRORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class SecurityError extends AIError {
  public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public readonly blockedContent?: string;

  constructor(
    message: string,
    code: AIErrorCode,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    blockedContent?: string
  ) {
    super(message, code, {
      retryable: false,
      context: { severity, blockedContent },
    });
    this.name = 'SecurityError';
    this.severity = severity;
    this.blockedContent = blockedContent;
  }
}

export class JailbreakError extends SecurityError {
  constructor(detectedPattern: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') {
    super('Jailbreak attempt detected', AIErrorCode.JAILBREAK_DETECTED, severity, detectedPattern);
    this.name = 'JailbreakError';
  }
}

export class SystemPromptExposureError extends SecurityError {
  constructor(attemptedQuery: string) {
    super(
      'System prompt exposure attempt detected',
      AIErrorCode.SYSTEM_PROMPT_EXPOSURE,
      'HIGH',
      attemptedQuery
    );
    this.name = 'SystemPromptExposureError';
  }
}

export class ModelRevealError extends SecurityError {
  constructor(attemptedQuery: string) {
    super(
      'Model reveal attempt detected',
      AIErrorCode.MODEL_REVEAL_ATTEMPT,
      'MEDIUM',
      attemptedQuery
    );
    this.name = 'ModelRevealError';
  }
}

export class MaliciousContentError extends SecurityError {
  constructor(reason: string) {
    super(`Malicious content detected: ${reason}`, AIErrorCode.MALICIOUS_CONTENT, 'CRITICAL');
    this.name = 'MaliciousContentError';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUEST ERRORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class RequestError extends AIError {
  constructor(message: string, code: AIErrorCode, retryable = false) {
    super(message, code, { retryable });
    this.name = 'RequestError';
  }
}

export class InvalidRequestError extends RequestError {
  constructor(reason: string) {
    super(`Invalid request: ${reason}`, AIErrorCode.INVALID_REQUEST, false);
    this.name = 'InvalidRequestError';
  }
}

export class InvalidModelError extends RequestError {
  constructor(model: string) {
    super(`Invalid model: ${model}`, AIErrorCode.INVALID_MODEL, false);
    this.name = 'InvalidModelError';
  }
}

export class TokenLimitError extends RequestError {
  public readonly tokenCount: number;
  public readonly maxTokens: number;

  constructor(tokenCount: number, maxTokens: number) {
    super(
      `Token limit exceeded: ${tokenCount} > ${maxTokens}`,
      AIErrorCode.TOKEN_LIMIT_EXCEEDED,
      false
    );
    this.name = 'TokenLimitError';
    this.tokenCount = tokenCount;
    this.maxTokens = maxTokens;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FALLBACK ERRORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class FallbackError extends AIError {
  public readonly failureChain: FailureReason[];

  constructor(message: string, code: AIErrorCode, failureChain: FailureReason[] = []) {
    super(message, code, {
      retryable: false,
      context: { failureChain },
    });
    this.name = 'FallbackError';
    this.failureChain = failureChain;
  }
}

export class AllProvidersFailedError extends FallbackError {
  constructor(failureChain: FailureReason[]) {
    super('All providers failed to respond', AIErrorCode.ALL_PROVIDERS_FAILED, failureChain);
    this.name = 'AllProvidersFailedError';
  }
}

export class NoFallbackAvailableError extends FallbackError {
  constructor(provider: AIProvider) {
    super(`No fallback available for provider ${provider}`, AIErrorCode.NO_FALLBACK_AVAILABLE, []);
    this.name = 'NoFallbackAvailableError';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION ERRORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ConfigError extends AIError {
  constructor(message: string, code: AIErrorCode) {
    super(message, code, { retryable: false }, false);
    this.name = 'ConfigError';
  }
}

export class ConfigMissingError extends ConfigError {
  constructor(configKey: string) {
    super(`Missing configuration: ${configKey}`, AIErrorCode.CONFIG_MISSING);
    this.name = 'ConfigMissingError';
  }
}

export class ApiKeyMissingError extends ConfigError {
  constructor(provider: AIProvider) {
    super(`API key missing for provider: ${provider}`, AIErrorCode.API_KEY_MISSING);
    this.name = 'ApiKeyMissingError';
  }
}

export class ApiKeyInvalidError extends ConfigError {
  constructor(provider: AIProvider) {
    super(`Invalid API key for provider: ${provider}`, AIErrorCode.API_KEY_INVALID);
    this.name = 'ApiKeyInvalidError';
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ErrorHandler {
  /**
   * Check if error is retryable
   */
  static isRetryable(error: Error): boolean {
    if (error instanceof AIError) {
      return error.metadata.retryable;
    }
    return false;
  }

  /**
   * Check if error is operational (expected) or programming error
   */
  static isOperational(error: Error): boolean {
    if (error instanceof AIError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Convert any error to AIError
   */
  static normalizeError(error: unknown): AIError {
    if (error instanceof AIError) {
      return error;
    }

    if (error instanceof Error) {
      return new AIError(error.message, AIErrorCode.UNKNOWN_ERROR, { originalError: error });
    }

    return new AIError('An unknown error occurred', AIErrorCode.UNKNOWN_ERROR, {
      context: { rawError: error },
    });
  }

  /**
   * Determine failure reason from error
   * FIXED: Returns string values instead of enum references
   */
  static getFailureReason(error: Error): FailureReason {
    if (error instanceof ProviderTimeoutError) {
      return 'TIMEOUT' as FailureReason;
    }
    if (error instanceof ProviderRateLimitError) {
      return 'RATE_LIMIT' as FailureReason;
    }
    if (error instanceof ProviderAuthError) {
      return 'AUTHENTICATION_ERROR' as FailureReason;
    }
    if (error instanceof SecurityError) {
      return 'CONTENT_FILTER' as FailureReason;
    }
    if (error instanceof InvalidRequestError) {
      return 'INVALID_REQUEST' as FailureReason;
    }
    if (error instanceof ProviderError) {
      return 'SERVICE_UNAVAILABLE' as FailureReason;
    }
    return 'UNKNOWN' as FailureReason;
  }

  /**
   * Get HTTP status code for error
   */
  static getHttpStatus(error: AIError): number {
    const statusMap: Record<string, number> = {
      [AIErrorCode.INVALID_REQUEST]: 400,
      [AIErrorCode.PROVIDER_AUTH_FAILED]: 401,
      [AIErrorCode.JAILBREAK_DETECTED]: 403,
      [AIErrorCode.SYSTEM_PROMPT_EXPOSURE]: 403,
      [AIErrorCode.MODEL_REVEAL_ATTEMPT]: 403,
      [AIErrorCode.MALICIOUS_CONTENT]: 403,
      [AIErrorCode.PROVIDER_RATE_LIMIT]: 429,
      [AIErrorCode.PROVIDER_UNAVAILABLE]: 503,
      [AIErrorCode.PROVIDER_TIMEOUT]: 504,
    };

    return statusMap[error.code] || 500;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { AIError as default };
