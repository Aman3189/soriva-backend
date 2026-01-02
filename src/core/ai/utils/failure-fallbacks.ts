// src/core/ai/utils/failure-fallbacks.ts
// ============================================================================
// SORIVA FAILURE FALLBACKS v1.0 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: User should ALWAYS get something reasonable, NEVER an error
//
// HANDLES:
// - Model timeout
// - Provider outage (OpenAI, Google, etc.)
// - Orchestration step failure
// - Rate limiting
// - Unknown errors
//
// PHILOSOPHY:
// "Fail gracefully, recover silently, user never knows"
//
// ============================================================================

import { logFailure, logInfo } from './observability';

// ============================================================================
// TYPES
// ============================================================================

export type FailureType = 
  | 'MODEL_TIMEOUT'
  | 'PROVIDER_OUTAGE'
  | 'RATE_LIMITED'
  | 'ORCHESTRATION_FAILED'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface FallbackResult {
  success: boolean;
  model: string;
  response?: string;
  fallbackLevel: number;  // 1 = first fallback, 2 = second, etc.
  originalError: string;
}

export interface FallbackConfig {
  maxRetries: number;
  timeoutMs: number;
  fallbackChain: string[];
}

// ============================================================================
// FALLBACK CHAINS (Per Plan)
// ============================================================================

/**
 * Fallback model chains - try these in order when primary fails
 * Each plan has progressively cheaper fallbacks
 */
const FALLBACK_CHAINS: Record<string, string[]> = {
  // APEX: Premium → Mid → Budget
  APEX: [
    'claude-sonnet-4-5',
    'gpt-5.1',
    'gemini-2.5-pro',
    'moonshotai/kimi-k2-thinking',
    'gemini-2.5-flash',
  ],
  
  // PRO: Mid-Premium → Budget
  PRO: [
    'gpt-5.1',
    'gemini-2.5-pro',
    'moonshotai/kimi-k2-thinking',
    'gemini-2.5-flash',
  ],
  
  // PLUS: Mid → Budget
  PLUS: [
    'gemini-2.5-pro',
    'moonshotai/kimi-k2-thinking',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ],
  
  // STARTER: Budget only
  STARTER: [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'moonshotai/kimi-k2-thinking',
  ],
};

/**
 * Ultimate fallback response when ALL models fail
 * User-friendly, never shows technical error
 */
const ULTIMATE_FALLBACK_RESPONSES: Record<string, string> = {
  en: "I'm having a brief moment of reflection. Could you please try again in a few seconds? I want to give you my best response.",
  hi: "Main abhi thoda soch raha hun. Kya aap kuch seconds baad dubara try kar sakte hain? Main aapko best response dena chahta hun.",
  hinglish: "Ek second bhai, thoda load aa gaya. Try again karo, main ready hun!",
};

// ============================================================================
// ERROR DETECTION
// ============================================================================

/**
 * Detect failure type from error
 */
export function detectFailureType(error: Error | any): FailureType {
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code?.toLowerCase() || '';
  const status = error?.status || error?.statusCode || 0;

  // Timeout
  if (
    message.includes('timeout') ||
    message.includes('timed out') ||
    code === 'etimedout' ||
    code === 'esockettimedout'
  ) {
    return 'MODEL_TIMEOUT';
  }

  // Rate limiting
  if (
    status === 429 ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('quota exceeded')
  ) {
    return 'RATE_LIMITED';
  }

  // Provider outage
  if (
    status === 503 ||
    status === 502 ||
    status === 500 ||
    message.includes('service unavailable') ||
    message.includes('internal server error') ||
    message.includes('bad gateway')
  ) {
    return 'PROVIDER_OUTAGE';
  }

  // Network errors
  if (
    code === 'econnrefused' ||
    code === 'enotfound' ||
    code === 'econnreset' ||
    message.includes('network') ||
    message.includes('fetch failed')
  ) {
    return 'NETWORK_ERROR';
  }

  // Invalid response
  if (
    message.includes('invalid') ||
    message.includes('parse') ||
    message.includes('json') ||
    message.includes('unexpected')
  ) {
    return 'INVALID_RESPONSE';
  }

  return 'UNKNOWN';
}

/**
 * Check if error is retryable
 */
export function isRetryable(failureType: FailureType): boolean {
  const retryable: FailureType[] = [
    'MODEL_TIMEOUT',
    'RATE_LIMITED',
    'NETWORK_ERROR',
    'PROVIDER_OUTAGE',
  ];
  return retryable.includes(failureType);
}

/**
 * Get retry delay based on failure type
 */
export function getRetryDelay(failureType: FailureType, attempt: number): number {
  const baseDelays: Record<FailureType, number> = {
    MODEL_TIMEOUT: 1000,
    RATE_LIMITED: 2000,
    PROVIDER_OUTAGE: 1500,
    NETWORK_ERROR: 500,
    ORCHESTRATION_FAILED: 500,
    INVALID_RESPONSE: 0,
    UNKNOWN: 1000,
  };

  const base = baseDelays[failureType] || 1000;
  // Exponential backoff: 1s, 2s, 4s...
  return Math.min(base * Math.pow(2, attempt - 1), 10000);
}

// ============================================================================
// FALLBACK MANAGER
// ============================================================================

class FallbackManager {
  private failureCounts: Map<string, number> = new Map();
  private circuitBreakers: Map<string, { open: boolean; until: number }> = new Map();

  /**
   * Get next fallback model in chain
   */
  getNextFallback(
    currentModel: string,
    plan: string,
    attemptedModels: string[] = []
  ): string | null {
    const chain = FALLBACK_CHAINS[plan.toUpperCase()] || FALLBACK_CHAINS.STARTER;
    
    // Find models we haven't tried yet
    const available = chain.filter(
      model => !attemptedModels.includes(model) && !this.isCircuitOpen(model)
    );

    if (available.length === 0) {
      return null;
    }

    return available[0];
  }

  /**
   * Get fallback chain for a plan
   */
  getFallbackChain(plan: string): string[] {
    return FALLBACK_CHAINS[plan.toUpperCase()] || FALLBACK_CHAINS.STARTER;
  }

  /**
   * Get ultimate fallback response (when ALL models fail)
   */
  getUltimateFallback(language: 'en' | 'hi' | 'hinglish' = 'en'): string {
    return ULTIMATE_FALLBACK_RESPONSES[language] || ULTIMATE_FALLBACK_RESPONSES.en;
  }

  /**
   * Record a failure for circuit breaker
   */
  recordFailure(model: string): void {
    const count = (this.failureCounts.get(model) || 0) + 1;
    this.failureCounts.set(model, count);

    // Open circuit breaker after 5 consecutive failures
    if (count >= 5) {
      this.openCircuit(model, 60000); // 1 minute cooldown
      logInfo(`Circuit breaker opened for ${model}`, { failures: count });
    }
  }

  /**
   * Record a success (reset failure count)
   */
  recordSuccess(model: string): void {
    this.failureCounts.set(model, 0);
    this.closeCircuit(model);
  }

  /**
   * Check if circuit is open for a model
   */
  isCircuitOpen(model: string): boolean {
    const breaker = this.circuitBreakers.get(model);
    if (!breaker) return false;

    if (breaker.open && Date.now() > breaker.until) {
      // Auto-close after cooldown
      this.closeCircuit(model);
      return false;
    }

    return breaker.open;
  }

  /**
   * Open circuit breaker
   */
  private openCircuit(model: string, durationMs: number): void {
    this.circuitBreakers.set(model, {
      open: true,
      until: Date.now() + durationMs,
    });
  }

  /**
   * Close circuit breaker
   */
  private closeCircuit(model: string): void {
    this.circuitBreakers.delete(model);
    this.failureCounts.set(model, 0);
  }

  /**
   * Get circuit breaker status for all models
   */
  getCircuitStatus(): Record<string, { open: boolean; failureCount: number }> {
    const status: Record<string, { open: boolean; failureCount: number }> = {};
    
    for (const [model, breaker] of this.circuitBreakers) {
      status[model] = {
        open: breaker.open && Date.now() < breaker.until,
        failureCount: this.failureCounts.get(model) || 0,
      };
    }

    return status;
  }
}

// Singleton
const fallbackManager = new FallbackManager();

// ============================================================================
// MAIN FALLBACK EXECUTOR
// ============================================================================

export interface ExecuteWithFallbackOptions {
  requestId: string;           // 🆕 For end-to-end tracing
  userId: string;
  plan: string;
  primaryModel: string;
  execute: (model: string) => Promise<string>;
  maxAttempts?: number;
  language?: 'en' | 'hi' | 'hinglish';
}

/**
 * Execute with automatic fallback on failure
 * 
 * @example
 * const result = await executeWithFallback({
 *   requestId: 'req_abc123',
 *   userId: 'user_123',
 *   plan: 'PLUS',
 *   primaryModel: 'gpt-5.1',
 *   execute: async (model) => await callModel(model, message),
 * });
 */
export async function executeWithFallback(
  options: ExecuteWithFallbackOptions
): Promise<FallbackResult> {
  const {
    requestId,
    userId,
    plan,
    primaryModel,
    execute,
    maxAttempts = 3,
    language = 'en',
  } = options;

  const attemptedModels: string[] = [];
  let currentModel = primaryModel;
  let lastError: Error | null = null;
  let attempt = 0;

  // 🆕 Safety constant - max models to ever try
  const MAX_MODELS_SAFETY = 6;

  while (attempt < maxAttempts) {
    attempt++;
    attemptedModels.push(currentModel);

    // 🆕 Guard against infinite model cycling (belt-and-suspenders)
    if (attemptedModels.length > MAX_MODELS_SAFETY) {
      logInfo('Safety limit reached - stopping fallback chain', {
        requestId,
        userId,
        attemptedModels,
      });
      break;
    }

    try {
      // Check circuit breaker
      if (fallbackManager.isCircuitOpen(currentModel)) {
        throw new Error(`Circuit breaker open for ${currentModel}`);
      }

      // Execute
      const response = await execute(currentModel);

      // Success!
      fallbackManager.recordSuccess(currentModel);

      // 🆕 Log fallback recovery if not primary model
      if (attempt > 1) {
        logInfo('Recovered via fallback', {
          requestId,
          userId,
          plan,
          from: primaryModel,
          to: currentModel,
          fallbackLevel: attempt - 1,
          attemptedModels,
        });
      }

      return {
        success: true,
        model: currentModel,
        response,
        fallbackLevel: attempt === 1 ? 0 : attempt - 1,
        originalError: lastError?.message || '',
      };

    } catch (error: any) {
      lastError = error;
      const failureType = detectFailureType(error);

      // Record failure
      fallbackManager.recordFailure(currentModel);

      // 🆕 Log with requestId for tracing
      logFailure({
        requestId,
        userId,
        errorType: failureType,
        errorMessage: error.message,
        model: currentModel,
        fallbackUsed: undefined,
        recovered: false,
      });

      // Get next fallback
      const nextModel = fallbackManager.getNextFallback(currentModel, plan, attemptedModels);

      if (!nextModel) {
        // No more fallbacks available
        break;
      }

      // Wait before retry (if retryable)
      if (isRetryable(failureType)) {
        const delay = getRetryDelay(failureType, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      currentModel = nextModel;
    }
  }

  // All attempts failed - return ultimate fallback
  logFailure({
    requestId,
    userId,
    errorType: 'ORCHESTRATION_FAILED',
    errorMessage: `All ${attempt} attempts failed. Last error: ${lastError?.message}`,
    model: primaryModel,
    fallbackUsed: 'ULTIMATE_FALLBACK',
    recovered: true,
  });

  return {
    success: false,
    model: 'fallback',
    response: fallbackManager.getUltimateFallback(language),
    fallbackLevel: attempt,
    originalError: lastError?.message || 'Unknown error',
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  fallbackManager,
  FALLBACK_CHAINS,
  ULTIMATE_FALLBACK_RESPONSES,
};

export default executeWithFallback;