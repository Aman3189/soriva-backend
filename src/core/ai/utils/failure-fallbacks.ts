// src/core/ai/utils/failure-fallbacks.ts
// ============================================================================
// SORIVA FAILURE FALLBACKS v2.0 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Handle failures gracefully with STRICT rules
//
// 4 FAILURE CLASSES ONLY:
// 1. PROVIDER_FAILURE    → Next model in chain (once)
// 2. MODEL_REFUSAL       → Cheaper sibling same provider (once)
// 3. BUDGET_ENFORCEMENT  → Abort + graceful message (no retry)
// 4. ORCHESTRATION_FAILURE → Bypass routing, force default (no retry)
//
// STRICT RULES:
// ❌ No nested retries
// ❌ No retry same model twice
// ❌ No escalation (cheaper only)
// ❌ No retry high-stakes blindly
// ✅ Every failure logged with trace
//
// PHILOSOPHY:
// "Fail gracefully, recover safely, always leave a trace"
//
// ============================================================================

import { logFailure, logInfo, logWarn } from './observability';
import { isModelAllowed } from './kill-switches';

// ============================================================================
// TYPES
// ============================================================================

/**
 * 4 STRICT FAILURE CLASSES - Do not invent more
 */
export type FailureClass =
  | 'PROVIDER_FAILURE'       // timeout, 5xx, network error, SDK crash
  | 'MODEL_REFUSAL'          // safety block, empty response, content filtered
  | 'BUDGET_ENFORCEMENT'     // tokens exceeded, pressure breach mid-request
  | 'ORCHESTRATION_FAILURE'; // routing crash, delta prompt error, intent classifier throw

export interface FailureContext {
  requestId: string;
  userId: string;
  plan: string;
  model: string;
  isHighStakes: boolean;
  error: Error | any;
  tokensUsed?: number;
  tokensExpected?: number;
  pressure?: number;
}

export interface RecoveryResult {
  recovered: boolean;
  finalModel: string;
  response?: any;
  failureClass: FailureClass;
  action: string;
  attemptsUsed: number;
  trace: FailureTrace;
}

export interface FailureTrace {
  requestId: string;
  failureClass: FailureClass;
  originalModel: string;
  finalModel: string;
  recovered: boolean;
  action: string;
  errorMessage: string;
  timestamp: Date;
}

// ============================================================================
// CHEAPER SIBLING MAPPING (Same Provider, Lower Cost)
// ============================================================================

/**
 * For MODEL_REFUSAL: Try cheaper sibling from SAME provider
 * Never jump across providers on refusal
 * 
 * CORRECT MODEL UNIVERSE (January 2026 - v9.0):
 * - gemini-2.5-flash-lite, gemini-2.5-flash, gemini-2.5-pro, gemini-3-pro
 * - mistral-large-3-2512, magistral-medium
 * - gpt-5.1 (standalone)
 * - claude-sonnet-4-5 (standalone)
 */
const CHEAPER_SIBLINGS: Record<string, string | null> = {
  // Gemini family (cheaper direction only)
  'gemini-3-pro': 'gemini-2.5-pro',
  'gemini-2.5-pro': 'gemini-2.5-flash',
  'gemini-2.5-flash': 'gemini-2.5-flash-lite',
  'gemini-2.5-flash-lite': null,  // No cheaper
  
  // OpenAI family (only gpt-5.1 in our universe)
  'gpt-5.1': null,  // No cheaper sibling in our universe
  
  // Claude family (only claude-sonnet-4-5 in our universe)
  'claude-sonnet-4-5': null,  // No cheaper sibling in our universe
  
  // Mistral family (cheaper direction)
  'magistral-medium': 'mistral-large-3-2512',
  'mistral-large-3-2512': null,  // No cheaper sibling
};

// ============================================================================
// PLAN-SAFE DEFAULTS (For Orchestration Bypass)
// ============================================================================

/**
 * When orchestration fails, use these safe defaults
 * Must be models that plan actually has access to!
 * Choose most RELIABLE model per plan
 */
const PLAN_SAFE_DEFAULTS: Record<string, string> = {
  STARTER: 'gemini-2.0-flash',   // Only option with high reliability
  PLUS: 'gemini-2.5-flash',           // Flash is reliable
  PRO: 'gemini-2.5-flash',            // Flash is reliable
  APEX: 'gemini-2.5-flash',           // Flash is reliable
  SOVEREIGN: 'gemini-2.5-flash',      // Flash is reliable
};

// ============================================================================
// FALLBACK CHAINS (For Provider Failure - Cheaper Direction Only)
// ============================================================================

/**
 * Fallback chains - MUST MATCH plan entitlements from plans.ts
 * Separate chains for INDIA and INTERNATIONAL
 * Only models that plan has access to, cheaper/reliable direction
 * 
 * INDIA PLAN ENTITLEMENTS (v9.0):
 * STARTER: Gemini 2.0 Flash (100%)
 * PLUS:      mistral (65%), flash (35%)
 * PRO:       mistral (50%), flash (30%), gpt-5.1 (10%), magistral (10%)
 * APEX:      mistral (52.2%), flash (30%), gpt-5.1 (7.3%), 2.5-pro (6.9%), magistral (3.6%)
 * SOVEREIGN: mistral (25%), flash (15%), magistral (10%), 3-pro (15%), gpt-5.1 (20%), claude-sonnet-4-5 (15%)
 * 
 * INTERNATIONAL PLAN ENTITLEMENTS (v9.0):
 * STARTER: Gemini 2.0 Flash (100%)
 * PLUS:      mistral (65%), flash (35%)
 * PRO:       mistral (48.1%), flash (25%), gpt-5.1 (10%), magistral (10.9%), 2.5-pro (6%)
 * APEX:      mistral (37.4%), gpt-5.1 (22.8%), flash (15%), magistral (10%), claude-sonnet-4-5 (7.4%), 3-pro (7.4%)
 * SOVEREIGN: Same as India
 */

// INDIA fallback chains (cheaper/reliable first)
const FALLBACK_CHAINS_INDIA: Record<string, string[]> = {
  // STARTER: Gemini 2.0 Flash
  STARTER: [
    'mistral-large-3-2512',
    'gemini-2.5-flash-lite',
  ],
  
  // PLUS: mistral → flash
  PLUS: [
    'mistral-large-3-2512',
    'gemini-2.5-flash',
  ],
  
  // PRO: mistral → flash → magistral
  PRO: [
    'mistral-large-3-2512',
    'gemini-2.5-flash',
    'magistral-medium',
  ],
  
  // APEX: mistral → flash → magistral → 2.5-pro
  APEX: [
    'mistral-large-3-2512',
    'gemini-2.5-flash',
    'magistral-medium',
    'gemini-2.5-pro',
  ],
  
  // SOVEREIGN: mistral → flash → magistral → 3-pro
  SOVEREIGN: [
    'mistral-large-3-2512',
    'gemini-2.5-flash',
    'magistral-medium',
    'gemini-3-pro',
  ],
};

// INTERNATIONAL fallback chains (different routing)
const FALLBACK_CHAINS_INTL: Record<string, string[]> = {
  // STARTER: Gemini 2.0 Flash
  STARTER: [
    'mistral-large-3-2512',
    'gemini-2.5-flash-lite',
  ],
  
  // PLUS: mistral → flash
  PLUS: [
    'mistral-large-3-2512',
    'gemini-2.5-flash',
  ],
  
  // PRO: mistral → flash → magistral → 2.5-pro
  PRO: [
    'mistral-large-3-2512',
    'gemini-2.5-flash',
    'magistral-medium',
    'gemini-2.5-pro',
  ],
  
  // APEX: mistral → flash → magistral → 3-pro
  APEX: [
    'mistral-large-3-2512',
    'gemini-2.5-flash',
    'magistral-medium',
    'gemini-3-pro',
  ],
  
  // SOVEREIGN: mistral → flash → magistral → 3-pro
  SOVEREIGN: [
    'mistral-large-3-2512',
    'gemini-2.5-flash',
    'magistral-medium',
    'gemini-3-pro',
  ],
};

// Legacy export for backward compatibility
const FALLBACK_CHAINS = FALLBACK_CHAINS_INDIA;

// ============================================================================
// GRACEFUL MESSAGES (For Budget Enforcement)
// ============================================================================

const BUDGET_GRACEFUL_MESSAGES: Record<string, string> = {
  en: "I'll keep this response concise to stay within your plan limits. Let me know if you'd like me to elaborate on any specific part!",
  hi: "Main apna jawab chhota rakh raha hun aapke plan limits ke andar rehne ke liye. Agar kisi part pe detail chahiye toh batayein!",
  hinglish: "Bhai, thoda short mein bata raha hun limit ki wajah se. Kuch specific detail chahiye toh bol!",
};

// ============================================================================
// FAILURE CLASSIFIER
// ============================================================================

/**
 * Classify error into one of 4 failure classes
 * STRICT: Only these 4 classes, no invention
 */
export function classifyFailure(error: Error | any, context?: Partial<FailureContext>): FailureClass {
  const message = (error?.message || '').toLowerCase();
  const code = (error?.code || '').toLowerCase();
  const status = error?.status || error?.statusCode || 0;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. PROVIDER_FAILURE: timeout, 5xx, network, SDK crash
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (
    // Timeout
    message.includes('timeout') ||
    message.includes('timed out') ||
    code === 'etimedout' ||
    code === 'esockettimedout' ||
    // 5xx errors
    status >= 500 ||
    message.includes('internal server error') ||
    message.includes('bad gateway') ||
    message.includes('service unavailable') ||
    // Network errors
    code === 'econnrefused' ||
    code === 'enotfound' ||
    code === 'econnreset' ||
    message.includes('network') ||
    message.includes('fetch failed') ||
    message.includes('socket hang up') ||
    // SDK crash
    message.includes('sdk') ||
    message.includes('client error')
  ) {
    return 'PROVIDER_FAILURE';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. MODEL_REFUSAL: safety block, empty, content filtered
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (
    message.includes("i can't help") ||
    message.includes("i cannot help") ||
    message.includes("i'm not able") ||
    message.includes('content policy') ||
    message.includes('safety') ||
    message.includes('blocked') ||
    message.includes('filtered') ||
    message.includes('inappropriate') ||
    message.includes('harmful') ||
    message.includes('empty response') ||
    message.includes('no content') ||
    status === 400 && message.includes('content')
  ) {
    return 'MODEL_REFUSAL';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. BUDGET_ENFORCEMENT: tokens exceeded, pressure breach
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (
    message.includes('token') && (message.includes('limit') || message.includes('exceed')) ||
    message.includes('quota') ||
    message.includes('budget') ||
    message.includes('rate limit') ||
    status === 429 ||
    // Context-based: tokens way over expected
    (context?.tokensUsed && context?.tokensExpected && 
     context.tokensUsed > context.tokensExpected * 2) ||
    // Context-based: pressure too high
    (context?.pressure && context.pressure > 0.95)
  ) {
    return 'BUDGET_ENFORCEMENT';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. ORCHESTRATION_FAILURE: routing, delta, intent errors
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (
    message.includes('routing') ||
    message.includes('orchestration') ||
    message.includes('delta') ||
    message.includes('intent') ||
    message.includes('classifier') ||
    message.includes('smart routing') ||
    message.includes('model selection')
  ) {
    return 'ORCHESTRATION_FAILURE';
  }

  // Default: Treat unknown as provider failure (safest)
  return 'PROVIDER_FAILURE';
}

// ============================================================================
// CIRCUIT BREAKER (Simple, Per-Model)
// ============================================================================

class CircuitBreaker {
  private failures: Map<string, { count: number; lastFailure: number }> = new Map();
  private openCircuits: Map<string, number> = new Map(); // model → reopenTime

  private readonly FAILURE_THRESHOLD = 5;
  private readonly COOLDOWN_MS = 60000; // 1 minute

  /**
   * Record failure for a model
   */
  recordFailure(model: string): void {
    const current = this.failures.get(model) || { count: 0, lastFailure: 0 };
    current.count++;
    current.lastFailure = Date.now();
    this.failures.set(model, current);

    if (current.count >= this.FAILURE_THRESHOLD) {
      this.openCircuits.set(model, Date.now() + this.COOLDOWN_MS);
      logWarn(`Circuit OPEN for ${model}`, { failures: current.count, cooldownMs: this.COOLDOWN_MS });
    }
  }

  /**
   * Record success (reset failures)
   */
  recordSuccess(model: string): void {
    this.failures.delete(model);
    this.openCircuits.delete(model);
  }

  /**
   * Check if circuit is open
   */
  isOpen(model: string): boolean {
    const reopenTime = this.openCircuits.get(model);
    if (!reopenTime) return false;

    if (Date.now() >= reopenTime) {
      // Cooldown passed, close circuit
      this.openCircuits.delete(model);
      this.failures.delete(model);
      logInfo(`Circuit CLOSED for ${model} (cooldown passed)`);
      return false;
    }

    return true;
  }

  /**
   * Get status for monitoring
   */
  getStatus(): Record<string, { open: boolean; failures: number; reopenIn?: number }> {
    const status: Record<string, { open: boolean; failures: number; reopenIn?: number }> = {};
    
    for (const [model, data] of this.failures) {
      const reopenTime = this.openCircuits.get(model);
      status[model] = {
        open: reopenTime ? Date.now() < reopenTime : false,
        failures: data.count,
        reopenIn: reopenTime ? Math.max(0, reopenTime - Date.now()) : undefined,
      };
    }

    return status;
  }
}

// Singleton
const circuitBreaker = new CircuitBreaker();

// ============================================================================
// FAILURE HANDLERS (One per Class)
// ============================================================================

/**
 * Handle PROVIDER_FAILURE: Try next model in fallback chain (once)
 * Uses region-specific fallback chains
 */
function handleProviderFailure(
  context: FailureContext,
  attemptedModels: Set<string>,
  region: 'IN' | 'INTL' = 'IN'
): { nextModel: string | null; action: string } {
  // Select correct fallback chain based on region
  const chains = region === 'INTL' ? FALLBACK_CHAINS_INTL : FALLBACK_CHAINS_INDIA;
  const chain = chains[context.plan.toUpperCase()] || chains.STARTER;
  
  // Find next model we haven't tried and isn't circuit-broken
  for (const model of chain) {
    if (
      !attemptedModels.has(model) &&
      !circuitBreaker.isOpen(model) &&
      isModelAllowed(model)
    ) {
      return {
        nextModel: model,
        action: `provider_fallback:${context.model}→${model}`,
      };
    }
  }

  return { nextModel: null, action: 'provider_fallback:exhausted' };
}

/**
 * Handle MODEL_REFUSAL: Try cheaper sibling same provider (once)
 */
function handleModelRefusal(
  context: FailureContext,
  attemptedModels: Set<string>
): { nextModel: string | null; action: string } {
  const sibling = CHEAPER_SIBLINGS[context.model];

  if (
    sibling &&
    !attemptedModels.has(sibling) &&
    !circuitBreaker.isOpen(sibling) &&
    isModelAllowed(sibling)
  ) {
    return {
      nextModel: sibling,
      action: `refusal_sibling:${context.model}→${sibling}`,
    };
  }

  return { nextModel: null, action: 'refusal_sibling:none_available' };
}

/**
 * Handle BUDGET_ENFORCEMENT: No retry, return graceful message
 */
function handleBudgetEnforcement(
  context: FailureContext,
  language: 'en' | 'hi' | 'hinglish' = 'en'
): { response: string; action: string } {
  return {
    response: BUDGET_GRACEFUL_MESSAGES[language] || BUDGET_GRACEFUL_MESSAGES.en,
    action: 'budget_abort:graceful_response',
  };
}

/**
 * Handle ORCHESTRATION_FAILURE: Bypass routing, use safe default
 */
function handleOrchestrationFailure(
  context: FailureContext
): { nextModel: string; action: string } {
  const safeDefault = PLAN_SAFE_DEFAULTS[context.plan.toUpperCase()] || 'gemini-2.5-flash-lite';
  
  return {
    nextModel: safeDefault,
    action: `orchestration_bypass:${safeDefault}`,
  };
}

// ============================================================================
// MAIN RECOVERY FUNCTION
// ============================================================================

export interface RecoveryOptions {
  requestId: string;
  userId: string;
  plan: string;
  primaryModel: string;
  isHighStakes: boolean;
  execute: (model: string) => Promise<any>;
  language?: 'en' | 'hi' | 'hinglish';
  pressure?: number;
  region?: 'IN' | 'INTL';  // ← NEW: Region for correct fallback chain
}

/**
 * Execute with failure recovery
 * 
 * RULES:
 * - Max 2 attempts total (primary + 1 fallback)
 * - No retry same model twice
 * - No escalation (cheaper only)
 * - No retry high-stakes blindly
 * - Every failure traced
 */
export async function executeWithRecovery(options: RecoveryOptions): Promise<RecoveryResult> {
  const {
    requestId,
    userId,
    plan,
    primaryModel,
    isHighStakes,
    execute,
    language = 'en',
    pressure = 0,
    region = 'IN',  // ← Default to India
  } = options;

  const attemptedModels = new Set<string>();
  let currentModel = primaryModel;
  let lastError: Error | null = null;
  let lastFailureClass: FailureClass = 'PROVIDER_FAILURE';
  let finalAction = 'success';
  let attempts = 0;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAX 2 ATTEMPTS: Primary + 1 Fallback (strict)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const MAX_ATTEMPTS = 2;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    attemptedModels.add(currentModel);

    // Check circuit breaker
    if (circuitBreaker.isOpen(currentModel)) {
      logWarn(`Skipping ${currentModel} - circuit open`, { requestId });
      
      // Try to find alternative (pass region for correct fallback chain)
      const { nextModel } = handleProviderFailure(
        { requestId, userId, plan, model: currentModel, isHighStakes, error: new Error('circuit_open') },
        attemptedModels,
        region
      );
      
      if (nextModel) {
        currentModel = nextModel;
        continue;
      } else {
        break;
      }
    }

    try {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // EXECUTE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const response = await execute(currentModel);

      // Success!
      circuitBreaker.recordSuccess(currentModel);

      // Log recovery if not primary
      if (attempts > 1) {
        logInfo('Recovered via fallback', {
          requestId,
          from: primaryModel,
          to: currentModel,
          attempts,
        });
      }

      return {
        recovered: true,
        finalModel: currentModel,
        response,
        failureClass: lastFailureClass,
        action: attempts === 1 ? 'success' : finalAction,
        attemptsUsed: attempts,
        trace: createTrace(requestId, lastFailureClass, primaryModel, currentModel, true, finalAction, ''),
      };

    } catch (error: any) {
      lastError = error;
      circuitBreaker.recordFailure(currentModel);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // CLASSIFY FAILURE
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const failureClass = classifyFailure(error, { pressure });
      lastFailureClass = failureClass;

      const context: FailureContext = {
        requestId,
        userId,
        plan,
        model: currentModel,
        isHighStakes,
        error,
        pressure,
      };

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // LOG FAILURE (Every failure must trace)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      logFailure({
        requestId,
        userId,
        errorType: failureClass,
        errorMessage: error.message,
        model: currentModel,
        recovered: false,
      });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // HANDLE BY CLASS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      switch (failureClass) {
        case 'PROVIDER_FAILURE': {
          // ❌ No retry high-stakes blindly
          if (isHighStakes && attempts > 1) {
            finalAction = 'high_stakes_abort';
            break;
          }

          const { nextModel, action } = handleProviderFailure(context, attemptedModels, region);
          finalAction = action;

          if (nextModel) {
            currentModel = nextModel;
            continue; // Try next model
          }
          break;
        }

        case 'MODEL_REFUSAL': {
          const { nextModel, action } = handleModelRefusal(context, attemptedModels);
          finalAction = action;

          if (nextModel) {
            currentModel = nextModel;
            continue; // Try sibling
          }
          break;
        }

        case 'BUDGET_ENFORCEMENT': {
          // No retry - return graceful message immediately
          const { response, action } = handleBudgetEnforcement(context, language);
          finalAction = action;

          return {
            recovered: true, // Graceful = recovered
            finalModel: 'budget_fallback',
            response,
            failureClass,
            action: finalAction,
            attemptsUsed: attempts,
            trace: createTrace(requestId, failureClass, primaryModel, 'budget_fallback', true, finalAction, error.message),
          };
        }

        case 'ORCHESTRATION_FAILURE': {
          // Bypass routing, use safe default
          const { nextModel, action } = handleOrchestrationFailure(context);
          finalAction = action;

          if (!attemptedModels.has(nextModel)) {
            currentModel = nextModel;
            continue; // Try safe default
          }
          break;
        }
      }

      // If we reach here without continuing, break the loop
      break;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ALL ATTEMPTS FAILED
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logFailure({
    requestId,
    userId,
    errorType: 'ALL_ATTEMPTS_FAILED',
    errorMessage: `${attempts} attempts failed. Last: ${lastError?.message}`,
    model: primaryModel,
    fallbackUsed: 'ULTIMATE_FALLBACK',
    recovered: false,
  });

  return {
    recovered: false,
    finalModel: 'ultimate_fallback',
    response: getUltimateFallback(language),
    failureClass: lastFailureClass,
    action: 'ultimate_fallback',
    attemptsUsed: attempts,
    trace: createTrace(requestId, lastFailureClass, primaryModel, 'ultimate_fallback', false, 'ultimate_fallback', lastError?.message || 'Unknown'),
  };
}

// ============================================================================
// ULTIMATE FALLBACK (When ALL fails)
// ============================================================================

const ULTIMATE_FALLBACK_MESSAGES: Record<string, string> = {
  en: "I'm experiencing a brief moment of difficulty. Could you please try again? I want to give you my best response.",
  hi: "Mujhe abhi thodi dikkat aa rahi hai. Kya aap phir se try kar sakte hain? Main aapko best response dena chahta hun.",
  hinglish: "Ek second bhai, thoda issue aa gaya. Phir se try karo, main ready hun!",
};

export function getUltimateFallback(language: 'en' | 'hi' | 'hinglish' = 'en'): string {
  return ULTIMATE_FALLBACK_MESSAGES[language] || ULTIMATE_FALLBACK_MESSAGES.en;
}

// ============================================================================
// HELPERS
// ============================================================================

function createTrace(
  requestId: string,
  failureClass: FailureClass,
  originalModel: string,
  finalModel: string,
  recovered: boolean,
  action: string,
  errorMessage: string
): FailureTrace {
  return {
    requestId,
    failureClass,
    originalModel,
    finalModel,
    recovered,
    action,
    errorMessage,
    timestamp: new Date(),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  circuitBreaker,
  FALLBACK_CHAINS,
  FALLBACK_CHAINS_INDIA,
  FALLBACK_CHAINS_INTL,
  CHEAPER_SIBLINGS,
  PLAN_SAFE_DEFAULTS,
  BUDGET_GRACEFUL_MESSAGES,
  ULTIMATE_FALLBACK_MESSAGES,
};

// Convenience exports
export const getCircuitStatus = () => circuitBreaker.getStatus();

// Region-aware fallback chain getter
export const getFallbackChain = (plan: string, region: 'IN' | 'INTL' = 'IN') => {
  const chains = region === 'INTL' ? FALLBACK_CHAINS_INTL : FALLBACK_CHAINS_INDIA;
  return chains[plan.toUpperCase()] || chains.STARTER;
};

export const getSafeDefault = (plan: string) => PLAN_SAFE_DEFAULTS[plan.toUpperCase()] || 'gemini-2.5-flash-lite';

export default executeWithRecovery;