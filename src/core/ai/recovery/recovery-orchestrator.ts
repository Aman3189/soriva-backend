// src/core/ai/recovery/recovery-orchestrator.ts
// ============================================================================
// SORIVA V2 - RECOVERY ORCHESTRATOR v1.1 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Central controller for offense/misalignment recovery
// PHILOSOPHY: One mistake allowed. Doubling down = fatal.
//
// THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR:
// - Recovery flow control
// - Cooldown management (3 turns after recovery)
// - Friction level determination (ONLY HERE - not in other files)
// - Promise inclusion decision
// - System prompt injection
// - Response validation (pre-send)
//
// RECOVERY FLOW (7 Steps):
// 1. DETECT    → misalignment-detector.ts
// 2. FREEZE    → escalation-guard.ts (inject into SYSTEM)
// 3. ACKNOWLEDGE → acknowledgement-templates.ts
// 4. OWNERSHIP → (part of acknowledgement)
// 5. RESET     → context-reset.ts
// 6. PROMISE   → promise-generator.ts (if high friction)
// 7. RESUME    → Continue naturally
//
// CRITICAL RULES:
// ⚠️ Guard prompt → SYSTEM message only
// ⚠️ Violation check → BEFORE sending (pre-send)
// ⚠️ Cooldown → 3 turns after recovery
// ⚠️ Promise cooldown → No promise if one given recently
// ⚠️ Recovery fires ONCE, then normal mode
// ⚠️ Friction detection → ONLY in this file (single source of truth)
//
// TOKEN BUDGET:
// - Detection: 0 (code-based)
// - Recovery response: Max 80-100 tokens
// - No stacking: Recovery fires once
//
// KEY PRINCIPLE:
// "Offense is not a prediction problem. It is a repair problem."
// "Most AIs try to avoid mistakes. Good AIs learn to repair mistakes."
//
// CHANGELOG:
// v1.1 - Fixed: Friction detection centralized (single source of truth)
//      - Fixed: Renamed isActive → recoveryTriggeredThisTurn
//      - Fixed: Better state mutation documentation
//      - Fixed: Promise logic simplified (no getPromiseWithDecision)
// v1.0 - Initial release
// ============================================================================

// ============================================================================
// IMPORTS
// ============================================================================

import {
  detectMisalignment,
  isMisaligned,
  MisalignmentResult,
  MisalignmentCategory,
} from './misalignment-detector';

import {
  getEscalationGuard,
  getInactiveGuard,
  checkResponseViolation,
  trimToRecoveryLimit,
  getGuardTokenEstimate,
  EscalationGuardResult,
  ViolationCheckResult,
} from './escalation-guard';

import {
  getAcknowledgement,
  getAcknowledgementText,
  getDefaultAcknowledgement,
  AcknowledgementResult,
} from './acknowledgement-templates';

import {
  getContextReset,
  getInternalDirective,
  updateContext,
  createInitialContext,
  markRecoveryTriggered,
  isComplaintMessage,
  ConversationContext,
  ContextResetResult,
} from './context-reset';

import {
  forceGetPromise,
  PromiseResult,
} from './promise-generator';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Friction level - ONLY determined by orchestrator
 * This is the SINGLE SOURCE OF TRUTH for friction
 */
export type FrictionLevel = 'low' | 'medium' | 'high';

export interface RecoveryState {
  /**
   * Whether recovery was triggered on THIS turn
   * 
   * ⚠️ NOTE: This is NOT "ongoing recovery mode"
   * It means: "recovery fired on the current turn"
   * Next turn, this will be false again
   */
  recoveryTriggeredThisTurn: boolean;
  
  /**
   * Turns remaining before next recovery is allowed
   * 0 = recovery can trigger
   * >0 = recovery on cooldown
   */
  cooldownTurnsRemaining: number;
  
  /**
   * How many turns since last recovery
   * 
   * Timeline:
   * - Recovery fires → set to 0
   * - Next turn (advanceTurn) → becomes 1
   * - Next turn → becomes 2
   * - etc.
   */
  turnsSinceLastRecovery: number;
  
  /**
   * How many turns since last promise was given
   * Used for promise cooldown
   */
  turnsSinceLastPromise: number;
  
  /**
   * Category of last recovery (for debugging)
   */
  lastRecoveryCategory: MisalignmentCategory | null;
  
  /**
   * Conversation context for intent tracking
   */
  conversationContext: ConversationContext;
}

export interface RecoveryDecision {
  shouldRecover: boolean;
  reason: string;
  misalignmentResult: MisalignmentResult | null;
}

export interface RecoveryResponse {
  // User-facing response prefix
  acknowledgement: string;
  resetStatement: string;
  promise: string;
  fullRecoveryPrefix: string;
  
  // System prompt injection
  systemPromptInjection: string;
  
  // Metadata
  category: MisalignmentCategory | null;
  frictionLevel: FrictionLevel;
  tokenEstimate: number;
}

export interface OrchestratorResult {
  decision: RecoveryDecision;
  response: RecoveryResponse | null;
  updatedState: RecoveryState;
  guard: EscalationGuardResult;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Cooldown: How many turns to wait before allowing another recovery
  RECOVERY_COOLDOWN_TURNS: 3,
  
  // Promise cooldown: How many turns before allowing another promise
  PROMISE_COOLDOWN_TURNS: 5,
  
  // Max recovery response length
  MAX_RECOVERY_LINES: 6,
  MAX_RECOVERY_TOKENS: 120,
  
  // Retry limit for violation fix
  MAX_REGENERATION_ATTEMPTS: 1,
};

// ============================================================================
// FRICTION DETECTION - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Detect friction level from user message
 * 
 * ⚠️ THIS IS THE ONLY PLACE FRICTION IS DETERMINED
 * Other files (context-reset, promise-generator) should NOT detect friction
 * They should receive friction as a parameter from orchestrator
 * 
 * @param message - User message
 * @returns FrictionLevel
 */
function detectFrictionLevel(message: string): FrictionLevel {
  const msg = message.toLowerCase();

  // HIGH friction indicators (strong frustration)
  const highFrictionPatterns = [
    /!{2,}/,                          // Multiple exclamation marks
    /\?{2,}/,                         // Multiple question marks
    /kya (bakwas|faltu)/i,            // Strong Hindi frustration
    /what the/i,
    /are you (even|serious)/i,
    /baar[- ]?baar/i,                 // Repeated complaints
    /kitni baar/i,
  ];

  if (highFrictionPatterns.some(p => p.test(msg))) {
    return 'high';
  }

  // LOW friction indicators (mild correction)
  const lowFrictionPatterns = [
    /^(no|nope|nahi),?\s/i,           // Simple "no" start
    /not (quite|exactly)/i,           // Soft correction
    /that'?s not quite/i,
    /i meant/i,                        // Clarification, not complaint
    /actually,?\s/i,
  ];

  if (lowFrictionPatterns.some(p => p.test(msg))) {
    return 'low';
  }

  return 'medium';
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Create initial recovery state
 * Call this at conversation start
 * 
 * NOTE: conversationContext starts empty (no user message yet)
 */
export function createInitialState(): RecoveryState {
  return {
    recoveryTriggeredThisTurn: false,
    cooldownTurnsRemaining: 0,
    turnsSinceLastRecovery: 0,
    turnsSinceLastPromise: 0,
    lastRecoveryCategory: null,
    conversationContext: createInitialContext(),
  };
}

/**
 * Update state for new user turn (no recovery triggered)
 * 
 * State changes:
 * - recoveryTriggeredThisTurn → false
 * - cooldownTurnsRemaining → decrement (min 0)
 * - turnsSinceLastRecovery → increment
 * - turnsSinceLastPromise → increment
 * - conversationContext → updated with new message
 */
export function advanceTurn(state: RecoveryState, userMessage: string): RecoveryState {
  return {
    ...state,
    recoveryTriggeredThisTurn: false,
    cooldownTurnsRemaining: Math.max(0, state.cooldownTurnsRemaining - 1),
    turnsSinceLastRecovery: state.turnsSinceLastRecovery + 1,
    turnsSinceLastPromise: state.turnsSinceLastPromise + 1,
    conversationContext: updateContext(state.conversationContext, userMessage),
  };
}

/**
 * Update state after recovery triggered
 * 
 * State changes:
 * - recoveryTriggeredThisTurn → true (only for this turn)
 * - cooldownTurnsRemaining → set to RECOVERY_COOLDOWN_TURNS
 * - turnsSinceLastRecovery → reset to 0
 * - turnsSinceLastPromise → reset to 0 IF promise was included
 * - lastRecoveryCategory → set to current category
 * - conversationContext → marked as recovery triggered
 * 
 * @param state - Current state
 * @param category - Misalignment category
 * @param promiseIncluded - Whether a promise was given
 */
function activateRecovery(
  state: RecoveryState,
  category: MisalignmentCategory,
  promiseIncluded: boolean
): RecoveryState {
  return {
    ...state,
    recoveryTriggeredThisTurn: true,
    cooldownTurnsRemaining: CONFIG.RECOVERY_COOLDOWN_TURNS,
    turnsSinceLastRecovery: 0,  // Reset: this IS the recovery turn
    turnsSinceLastPromise: promiseIncluded ? 0 : state.turnsSinceLastPromise,
    lastRecoveryCategory: category,
    conversationContext: markRecoveryTriggered(state.conversationContext),
  };
}

// ============================================================================
// COOLDOWN CHECKS
// ============================================================================

/**
 * Check if recovery is allowed (cooldown expired)
 */
export function isRecoveryAllowed(state: RecoveryState): boolean {
  return state.cooldownTurnsRemaining === 0;
}

/**
 * Check if promise is allowed (promise cooldown expired)
 */
export function isPromiseAllowed(state: RecoveryState): boolean {
  return state.turnsSinceLastPromise >= CONFIG.PROMISE_COOLDOWN_TURNS;
}

/**
 * Get cooldown status for debugging
 */
export function getCooldownStatus(state: RecoveryState): {
  recoveryAllowed: boolean;
  promiseAllowed: boolean;
  turnsUntilRecoveryAllowed: number;
  turnsUntilPromiseAllowed: number;
} {
  return {
    recoveryAllowed: isRecoveryAllowed(state),
    promiseAllowed: isPromiseAllowed(state),
    turnsUntilRecoveryAllowed: state.cooldownTurnsRemaining,
    turnsUntilPromiseAllowed: Math.max(0, CONFIG.PROMISE_COOLDOWN_TURNS - state.turnsSinceLastPromise),
  };
}

// ============================================================================
// RECOVERY DECISION
// ============================================================================

/**
 * Decide if recovery should trigger
 * 
 * Logic:
 * 1. Detect misalignment
 * 2. Check cooldown
 * 3. Return decision
 */
export function shouldTriggerRecovery(
  userMessage: string,
  state: RecoveryState
): RecoveryDecision {
  // Step 1: Detect misalignment
  const misalignmentResult = detectMisalignment(userMessage);
  
  // No misalignment detected
  if (!misalignmentResult.detected) {
    return {
      shouldRecover: false,
      reason: 'No misalignment detected',
      misalignmentResult,
    };
  }
  
  // Step 2: Check cooldown
  if (!isRecoveryAllowed(state)) {
    return {
      shouldRecover: false,
      reason: `Recovery on cooldown (${state.cooldownTurnsRemaining} turns remaining)`,
      misalignmentResult,
    };
  }
  
  // Step 3: Recovery should trigger
  return {
    shouldRecover: true,
    reason: `Misalignment detected: ${misalignmentResult.category}`,
    misalignmentResult,
  };
}

// ============================================================================
// RESET STATEMENT DECISION
// ============================================================================

/**
 * Decide if reset statement should be included
 * 
 * Based on friction level:
 * - Low friction: No reset statement (acknowledgement is enough)
 * - Medium/High friction: Include reset statement
 */
function shouldIncludeResetStatement(frictionLevel: FrictionLevel): boolean {
  return frictionLevel !== 'low';
}

// ============================================================================
// RECOVERY RESPONSE GENERATION
// ============================================================================

/**
 * Generate complete recovery response
 * 
 * Assembles:
 * - Acknowledgement (always)
 * - Reset statement (if medium/high friction)
 * - Promise (if high friction AND promise cooldown expired)
 * - System prompt injection
 */
function generateRecoveryResponse(
  category: MisalignmentCategory,
  userMessage: string,
  state: RecoveryState
): RecoveryResponse {
  // ⚠️ FRICTION DETECTION - SINGLE SOURCE OF TRUTH
  const frictionLevel = detectFrictionLevel(userMessage);
  
  // Get acknowledgement (always included)
  const ackResult = getAcknowledgement(category, userMessage);
  const acknowledgement = ackResult.template;
  
  // Get reset statement (based on friction)
  const includeReset = shouldIncludeResetStatement(frictionLevel);
  const resetResult = getContextReset(category, userMessage);
  const resetStatement = includeReset ? resetResult.resetStatement : '';
  
  // ⚠️ PROMISE DECISION - Orchestrator is source of truth
  // Promise only if: high friction AND promise cooldown expired
  const shouldIncludePromise = frictionLevel === 'high' && isPromiseAllowed(state);
  const promise = shouldIncludePromise ? forceGetPromise(category, userMessage) : '';
  
  // Build full recovery prefix (user-facing)
  const parts = [acknowledgement];
  if (resetStatement) {
    parts.push(resetStatement);
  }
  if (promise) {
    parts.push(promise);
  }
  const fullRecoveryPrefix = parts.join(' ');
  
  // Build system prompt injection
  // ⚠️ THIS MUST GO INTO SYSTEM MESSAGE ONLY
  const guard = getEscalationGuard(category);
  const internalDirective = getInternalDirective(category);
  const systemPromptInjection = `${guard.guardPrompt}\n\n${internalDirective}`;
  
  // Calculate token estimate
  const tokenEstimate = 
    ackResult.tokenEstimate + 
    (resetStatement ? resetResult.tokenEstimate : 0) + 
    (promise ? 15 : 0) + 
    getGuardTokenEstimate(category);
  
  return {
    acknowledgement,
    resetStatement,
    promise,
    fullRecoveryPrefix,
    systemPromptInjection,
    category,
    frictionLevel,
    tokenEstimate,
  };
}

// ============================================================================
// MAIN ORCHESTRATOR FUNCTION
// ============================================================================

/**
 * Main orchestrator - process user message and decide recovery
 * 
 * This is the main entry point. Call this for every user message.
 * 
 * @param userMessage - Current user message
 * @param state - Current recovery state
 * @returns OrchestratorResult with decision, response, and updated state
 * 
 * @example
 * // In your message handler:
 * const result = orchestrateRecovery(userMessage, currentState);
 * 
 * if (result.decision.shouldRecover) {
 *   // Inject into system prompt
 *   systemPrompt = baseSystemPrompt + "\n\n" + result.response.systemPromptInjection;
 *   
 *   // Prefix response with recovery
 *   responsePrefix = result.response.fullRecoveryPrefix;
 * }
 * 
 * // Update state for next turn
 * currentState = result.updatedState;
 */
export function orchestrateRecovery(
  userMessage: string,
  state: RecoveryState
): OrchestratorResult {
  // Step 1: Decide if recovery should trigger
  const decision = shouldTriggerRecovery(userMessage, state);
  
  // No recovery needed
  if (!decision.shouldRecover) {
    return {
      decision,
      response: null,
      updatedState: advanceTurn(state, userMessage),
      guard: getInactiveGuard(),
    };
  }
  
  // Step 2: Generate recovery response
  const category = decision.misalignmentResult!.category!;
  const response = generateRecoveryResponse(category, userMessage, state);
  
  // Step 3: Get guard for response validation
  const guard = getEscalationGuard(category);
  
  // Step 4: Update state (activate recovery, set cooldown)
  const promiseIncluded = response.promise !== '';
  const updatedState = activateRecovery(state, category, promiseIncluded);
  
  return {
    decision,
    response,
    updatedState,
    guard,
  };
}

// ============================================================================
// RESPONSE VALIDATION (PRE-SEND)
// ============================================================================

/**
 * Validate LLM response before sending
 * 
 * ⚠️ MUST RUN BEFORE SENDING TO USER
 * 
 * @param draftResponse - LLM's drafted response (not yet sent)
 * @param isRecoveryActive - Is this a recovery response?
 * @returns Object with validation result and fixed response
 */
export function validateResponse(
  draftResponse: string,
  isRecoveryActive: boolean
): {
  valid: boolean;
  response: string;
  needsRegeneration: boolean;
  violations: string[];
} {
  // Skip validation if not in recovery mode
  if (!isRecoveryActive) {
    return {
      valid: true,
      response: draftResponse,
      needsRegeneration: false,
      violations: [],
    };
  }
  
  // Check for violations
  const check = checkResponseViolation(draftResponse);
  
  // No violations
  if (!check.violates) {
    return {
      valid: true,
      response: draftResponse,
      needsRegeneration: false,
      violations: [],
    };
  }
  
  // Handle violations silently
  if (check.action === 'trim') {
    return {
      valid: true,
      response: trimToRecoveryLimit(draftResponse),
      needsRegeneration: false,
      violations: check.reasons,
    };
  }
  
  // Needs regeneration
  return {
    valid: false,
    response: draftResponse,
    needsRegeneration: true,
    violations: check.reasons,
  };
}

// ============================================================================
// SYSTEM PROMPT BUILDER
// ============================================================================

/**
 * Build system prompt with recovery injection
 * 
 * ⚠️ CRITICAL: Recovery prompts MUST be in SYSTEM message
 */
export function buildSystemPrompt(
  baseSystemPrompt: string,
  orchestratorResult: OrchestratorResult
): string {
  if (!orchestratorResult.decision.shouldRecover || !orchestratorResult.response) {
    return baseSystemPrompt;
  }
  
  return `${baseSystemPrompt}\n\n${orchestratorResult.response.systemPromptInjection}`;
}

/**
 * Get response prefix (user-facing recovery message)
 */
export function getResponsePrefix(orchestratorResult: OrchestratorResult): string {
  if (!orchestratorResult.decision.shouldRecover || !orchestratorResult.response) {
    return '';
  }
  
  return orchestratorResult.response.fullRecoveryPrefix;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get recovery stats for debugging/logging
 */
export function getRecoveryStats(state: RecoveryState): {
  recoveryTriggeredThisTurn: boolean;
  cooldownStatus: ReturnType<typeof getCooldownStatus>;
  lastCategory: MisalignmentCategory | null;
  turnsSinceRecovery: number;
  conversationHasOriginalIntent: boolean;
} {
  return {
    recoveryTriggeredThisTurn: state.recoveryTriggeredThisTurn,
    cooldownStatus: getCooldownStatus(state),
    lastCategory: state.lastRecoveryCategory,
    turnsSinceRecovery: state.turnsSinceLastRecovery,
    conversationHasOriginalIntent: state.conversationContext.originalIntent !== null,
  };
}

/**
 * Force reset state (for testing or manual intervention)
 */
export function forceResetState(state: RecoveryState): RecoveryState {
  return {
    ...createInitialState(),
    conversationContext: state.conversationContext,
  };
}

/**
 * Check if current message is a complaint (for external use)
 */
export function isCurrentMessageComplaint(userMessage: string): boolean {
  return isComplaintMessage(userMessage);
}

/**
 * Get friction level for external use
 * 
 * ⚠️ This is the ONLY exported friction detection
 */
export function getFrictionLevel(userMessage: string): FrictionLevel {
  return detectFrictionLevel(userMessage);
}

/**
 * Get configuration (for debugging)
 */
export function getConfig(): typeof CONFIG {
  return { ...CONFIG };
}

/**
 * Update configuration (for testing)
 * ⚠️ Use with caution
 */
export function updateConfig(updates: Partial<typeof CONFIG>): void {
  Object.assign(CONFIG, updates);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  MisalignmentResult,
  MisalignmentCategory,
  EscalationGuardResult,
  ViolationCheckResult,
  AcknowledgementResult,
  ContextResetResult,
  PromiseResult,
  ConversationContext,
  
  detectMisalignment,
  isMisaligned,
  checkResponseViolation,
  trimToRecoveryLimit,
};

export default orchestrateRecovery;