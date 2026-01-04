// src/core/ai/recovery/recovery-integration.service.ts
// ============================================================================
// SORIVA V2 - RECOVERY INTEGRATION SERVICE v1.1 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Plug & play integration for ai.controller.ts
// PHILOSOPHY: One import, one function call, recovery handled.
//
// ⚠️ IDEMPOTENCY GUARANTEE:
// - Same (userId, messageHash) → Same result
// - No double cooldown decrement
// - No duplicate recovery firing on retries
//
// USAGE IN ai.controller.ts:
// 
// import { RecoveryIntegrationService } from './recovery/recovery-integration.service';
// 
// // In chat() method:
// const recovery = RecoveryIntegrationService.getInstance();
// const recoveryResult = recovery.processMessage(userId, message, systemPrompt);
// 
// // Use recoveryResult.systemPrompt instead of original
// // Prepend recoveryResult.responsePrefix to LLM response
//
// CHANGELOG:
// v1.1 - Added idempotency protection (messageHash tracking)
// v1.0 - Initial release
// ============================================================================

import orchestrateRecovery, {
  createInitialState,
  advanceTurn,
  buildSystemPrompt,
  getResponsePrefix,
  validateResponse,
  RecoveryState,
  OrchestratorResult,
  getRecoveryStats,
  getCooldownStatus,
} from './recovery-orchestrator';

// ============================================================================
// TYPES
// ============================================================================

export interface RecoveryProcessResult {
  // Should recovery happen?
  shouldRecover: boolean;
  
  // Modified system prompt (includes guard if recovery active)
  systemPrompt: string;
  
  // Prefix to add before LLM response (acknowledgement + reset + promise)
  responsePrefix: string;
  
  // Category of misalignment (for logging)
  category: string | null;
  
  // Friction level (for logging)
  frictionLevel: string | null;
  
  // Token overhead from recovery
  tokenOverhead: number;
  
  // Reason for decision
  reason: string;
  
  // Was this a cached/replay result?
  fromCache: boolean;
}

export interface ValidationResult {
  // Is response valid?
  valid: boolean;
  
  // Fixed response (trimmed if needed)
  response: string;
  
  // Should regenerate?
  needsRegeneration: boolean;
  
  // What violations found
  violations: string[];
}

export interface UserRecoveryInfo {
  userId: string;
  state: RecoveryState;
  lastActivity: Date;
  
  // ✅ NEW: Idempotency tracking
  lastProcessedMessageHash: string | null;
  lastProcessedResult: RecoveryProcessResult | null;
}

// ============================================================================
// HASH FUNCTION (for idempotency)
// ============================================================================

/**
 * Generate fast hash for message
 * Used for idempotency check
 */
function generateMessageHash(userId: string, message: string): string {
  // Simple but effective hash: userId + message + length
  let hash = 0;
  const combined = `${userId}:${message}`;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `${Math.abs(hash).toString(36)}_${message.length}`;
}

// ============================================================================
// RECOVERY INTEGRATION SERVICE (Singleton)
// ============================================================================

export class RecoveryIntegrationService {
  private static instance: RecoveryIntegrationService;
  
  // Store recovery state per user (in-memory for now)
  // TODO: Move to Redis/DB for production persistence
  private userStates: Map<string, UserRecoveryInfo> = new Map();
  
  // Cleanup interval (remove stale states)
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  // Config
  private readonly STATE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  private readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.startCleanupInterval();
    console.log('[RecoveryService] ✅ Initialized with idempotency protection');
  }

  public static getInstance(): RecoveryIntegrationService {
    if (!RecoveryIntegrationService.instance) {
      RecoveryIntegrationService.instance = new RecoveryIntegrationService();
    }
    return RecoveryIntegrationService.instance;
  }

  // ============================================================================
  // MAIN INTEGRATION METHODS
  // ============================================================================

  /**
   * Process user message for recovery (IDEMPOTENT)
   * 
   * ⚠️ IDEMPOTENCY GUARANTEE:
   * - Same (userId, message) → Same result returned
   * - No double state updates on retries
   * - Safe to call multiple times for same message
   * 
   * Call this AFTER pipeline orchestrator, BEFORE building messages array.
   * 
   * @param userId - User ID for state tracking
   * @param userMessage - Current user message
   * @param baseSystemPrompt - System prompt from pipeline orchestrator
   * @param messageId - Optional explicit message ID (for extra safety)
   * @returns RecoveryProcessResult with modified system prompt and response prefix
   * 
   * @example
   * const recoveryResult = recovery.processMessage(
   *   req.user.userId,
   *   message,
   *   systemPrompt || ''
   * );
   * 
   * // Safe to retry - will return cached result
   */
  public processMessage(
    userId: string,
    userMessage: string,
    baseSystemPrompt: string,
    messageId?: string
  ): RecoveryProcessResult {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1: IDEMPOTENCY CHECK
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const messageHash = messageId || generateMessageHash(userId, userMessage);
    const existingInfo = this.userStates.get(userId);
    
    // Check if we already processed this exact message
    if (existingInfo && existingInfo.lastProcessedMessageHash === messageHash) {
      console.log(`[RecoveryService] ♻️ Returning cached result for user ${userId}`);
      
      // Return cached result with fromCache flag
      return {
        ...existingInfo.lastProcessedResult!,
        fromCache: true,
      };
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2: GET OR CREATE STATE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const state = this.getOrCreateState(userId);
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 3: RUN ORCHESTRATOR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const result = orchestrateRecovery(userMessage, state);
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 4: BUILD RESULT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let processResult: RecoveryProcessResult;
    
    if (result.decision.shouldRecover && result.response) {
      processResult = {
        shouldRecover: true,
        systemPrompt: buildSystemPrompt(baseSystemPrompt, result),
        responsePrefix: getResponsePrefix(result),
        category: result.response.category,
        frictionLevel: result.response.frictionLevel,
        tokenOverhead: result.response.tokenEstimate,
        reason: result.decision.reason,
        fromCache: false,
      };
    } else {
      processResult = {
        shouldRecover: false,
        systemPrompt: baseSystemPrompt,
        responsePrefix: '',
        category: null,
        frictionLevel: null,
        tokenOverhead: 0,
        reason: result.decision.reason,
        fromCache: false,
      };
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 5: UPDATE STATE WITH IDEMPOTENCY TRACKING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    this.updateState(userId, result.updatedState, messageHash, processResult);
    
    return processResult;
  }

  /**
   * Validate LLM response before sending
   * 
   * Call this AFTER LLM generates response, BEFORE sending to user.
   * Only validates if recovery was triggered for this message.
   * 
   * @param userId - User ID
   * @param draftResponse - LLM's response (not yet sent)
   * @returns ValidationResult with fixed response if needed
   */
  public validateBeforeSend(userId: string, draftResponse: string): ValidationResult {
    const userInfo = this.userStates.get(userId);
    
    // No state or recovery wasn't triggered
    if (!userInfo || !userInfo.state.recoveryTriggeredThisTurn) {
      return {
        valid: true,
        response: draftResponse,
        needsRegeneration: false,
        violations: [],
      };
    }
    
    // Validate
    return validateResponse(draftResponse, true);
  }

  /**
   * Combine response prefix with LLM response
   * 
   * Convenience method to properly format final response.
   * 
   * @param prefix - Recovery prefix (from processMessage)
   * @param llmResponse - LLM's response
   * @returns Combined response
   */
  public combineResponse(prefix: string, llmResponse: string): string {
    if (!prefix || prefix.trim() === '') {
      return llmResponse;
    }
    return `${prefix}\n\n${llmResponse}`;
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Get or create recovery state for user
   */
  private getOrCreateState(userId: string): RecoveryState {
    const existing = this.userStates.get(userId);
    
    if (existing) {
      return existing.state;
    }
    
    // Create new state
    return createInitialState();
  }

  /**
   * Update stored state for user (with idempotency tracking)
   */
  private updateState(
    userId: string,
    state: RecoveryState,
    messageHash: string,
    result: RecoveryProcessResult
  ): void {
    this.userStates.set(userId, {
      userId,
      state,
      lastActivity: new Date(),
      lastProcessedMessageHash: messageHash,
      lastProcessedResult: result,
    });
  }

  /**
   * Clear state for user (for testing or manual reset)
   */
  public clearUserState(userId: string): void {
    this.userStates.delete(userId);
  }

  /**
   * Force clear idempotency cache for user
   * Use when you WANT to reprocess the same message
   */
  public clearIdempotencyCache(userId: string): void {
    const userInfo = this.userStates.get(userId);
    if (userInfo) {
      userInfo.lastProcessedMessageHash = null;
      userInfo.lastProcessedResult = null;
    }
  }

  /**
   * Get user's recovery info (for debugging)
   */
  public getUserRecoveryInfo(userId: string): {
    hasState: boolean;
    state: RecoveryState | null;
    cooldownStatus: ReturnType<typeof getCooldownStatus> | null;
    stats: ReturnType<typeof getRecoveryStats> | null;
    lastMessageHash: string | null;
    hasCachedResult: boolean;
  } {
    const userInfo = this.userStates.get(userId);
    
    if (!userInfo) {
      return {
        hasState: false,
        state: null,
        cooldownStatus: null,
        stats: null,
        lastMessageHash: null,
        hasCachedResult: false,
      };
    }
    
    return {
      hasState: true,
      state: userInfo.state,
      cooldownStatus: getCooldownStatus(userInfo.state),
      stats: getRecoveryStats(userInfo.state),
      lastMessageHash: userInfo.lastProcessedMessageHash,
      hasCachedResult: userInfo.lastProcessedResult !== null,
    };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Start cleanup interval for stale states
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleStates();
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Remove states older than TTL
   */
  private cleanupStaleStates(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [userId, info] of this.userStates.entries()) {
      if (now - info.lastActivity.getTime() > this.STATE_TTL_MS) {
        this.userStates.delete(userId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[RecoveryService] 🧹 Cleaned ${cleaned} stale states`);
    }
  }

  /**
   * Stop cleanup interval (for shutdown)
   */
  public shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // ============================================================================
  // STATS & DEBUGGING
  // ============================================================================

  /**
   * Get service stats
   */
  public getServiceStats(): {
    activeUsers: number;
    totalStates: number;
    cachedResults: number;
    memoryUsageEstimate: string;
  } {
    const stateCount = this.userStates.size;
    let cachedCount = 0;
    
    for (const [, info] of this.userStates.entries()) {
      if (info.lastProcessedResult !== null) {
        cachedCount++;
      }
    }
    
    return {
      activeUsers: stateCount,
      totalStates: stateCount,
      cachedResults: cachedCount,
      memoryUsageEstimate: `~${Math.round(stateCount * 0.8)}KB`,
    };
  }
}

// ============================================================================
// CONVENIENCE EXPORT
// ============================================================================

/**
 * Get singleton instance
 * 
 * @example
 * import { getRecoveryService } from './recovery/recovery-integration.service';
 * 
 * const recovery = getRecoveryService();
 * const result = recovery.processMessage(userId, message, systemPrompt);
 * // Safe to call again - returns cached result
 */
export function getRecoveryService(): RecoveryIntegrationService {
  return RecoveryIntegrationService.getInstance();
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default RecoveryIntegrationService;