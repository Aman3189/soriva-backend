/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA OUTCOME GATE SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created: January 3, 2026
 * 
 * Purpose: Consolidated decision point BEFORE LLM call
 * 
 * Previously scattered across:
 * - kill-switches.ts (maintenance, model blocks)
 * - failure-fallbacks.ts (budget enforcement)
 * - smart-routing.service.ts (budget pressure)
 * - starter-intent-guard.ts (intent decisions)
 * - ai.service.ts (orchestration)
 * 
 * Now: ONE place for "Do we answer, ask back, pause, or decline?"
 * 
 * Philosophy: "SORIVA EXCELLENCE"
 * - We ALWAYS try to help
 * - Decline only for safety/harmful content
 * - Pause only for system issues (maintenance, budget)
 * - Ask back only when genuinely unclear
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../constants';
import {
  killSwitches,
  isInMaintenance,
  getEffectivePressure,
} from '../../core/ai/utils/kill-switches';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type OutcomeDecision = 'ANSWER' | 'ASK_BACK' | 'PAUSE' | 'DECLINE';

export type DeclineReason = 
  | 'HARMFUL_CONTENT'
  | 'ILLEGAL_REQUEST'
  | 'PRIVACY_VIOLATION'
  | 'JAILBREAK_ATTEMPT';

export type PauseReason = 
  | 'MAINTENANCE_MODE'
  | 'BUDGET_EXHAUSTED'
  | 'RATE_LIMITED'
  | 'ALL_MODELS_DOWN';

export type AskBackReason = 
  | 'UNCLEAR_INTENT'
  | 'MISSING_CONTEXT'
  | 'AMBIGUOUS_REQUEST';

export interface OutcomeContext {
  // User & Plan
  userId: string;
  planType: PlanType;
  
  // Query
  message: string;
  intent?: string;
  
  // Usage
  monthlyUsedTokens: number;
  monthlyLimitTokens: number;
  dailyUsedTokens: number;
  dailyLimitTokens: number;
  
  // Session
  sessionMessageCount?: number;
  isHighStakesContext?: boolean;
  
  // Optional flags
  bypassBudgetCheck?: boolean;
}

export interface OutcomeResult {
  decision: OutcomeDecision;
  reason: string;
  
  // For PAUSE/DECLINE - user-facing message
  userMessage?: string;
  
  // For ASK_BACK - clarification prompt
  clarificationPrompt?: string;
  
  // Metadata
  metadata: {
    checksPassed: string[];
    checksFailed: string[];
    budgetPressure?: number;
    timestamp: string;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HARMFUL CONTENT DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HARMFUL_PATTERNS = {
  // Illegal activities
  illegal: [
    /how\s+to\s+(make|create|build)\s+(bomb|explosive|weapon)/i,
    /how\s+to\s+(hack|breach|break\s+into)/i,
    /how\s+to\s+(steal|forge|counterfeit)/i,
  ],
  
  // Privacy violations
  privacy: [
    /give\s+me\s+(someone's|his|her)\s+(address|phone|ssn|password)/i,
    /dox(x)?ing/i,
    /find\s+(personal|private)\s+information\s+about/i,
  ],
  
  // Self-harm (handle with care, not decline)
  selfHarm: [
    /how\s+to\s+(kill|hurt)\s+(myself|yourself)/i,
    /suicide\s+methods/i,
  ],
  
  // Jailbreak attempts
  jailbreak: [
    /ignore\s+(previous|all)\s+(instructions|prompts)/i,
    /you\s+are\s+now\s+(dan|evil|unrestricted)/i,
    /pretend\s+you\s+(have\s+no|don't\s+have)\s+(rules|restrictions)/i,
    /bypass\s+(your|the)\s+(safety|content)\s+(filter|restrictions)/i,
  ],
};

function detectHarmfulContent(message: string): { 
  isHarmful: boolean; 
  reason?: DeclineReason;
  category?: string;
} {
  const lowerMessage = message.toLowerCase();
  
  // Check illegal
  for (const pattern of HARMFUL_PATTERNS.illegal) {
    if (pattern.test(lowerMessage)) {
      return { isHarmful: true, reason: 'ILLEGAL_REQUEST', category: 'illegal' };
    }
  }
  
  // Check privacy
  for (const pattern of HARMFUL_PATTERNS.privacy) {
    if (pattern.test(lowerMessage)) {
      return { isHarmful: true, reason: 'PRIVACY_VIOLATION', category: 'privacy' };
    }
  }
  
  // Check jailbreak
  for (const pattern of HARMFUL_PATTERNS.jailbreak) {
    if (pattern.test(lowerMessage)) {
      return { isHarmful: true, reason: 'JAILBREAK_ATTEMPT', category: 'jailbreak' };
    }
  }
  
  // Self-harm: Don't decline, but flag for careful handling
  // We help, not block - connect to resources
  for (const pattern of HARMFUL_PATTERNS.selfHarm) {
    if (pattern.test(lowerMessage)) {
      // Return NOT harmful - we handle this with care, not rejection
      return { isHarmful: false, category: 'self_harm_care_needed' };
    }
  }
  
  return { isHarmful: false };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUDGET CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function checkBudget(context: OutcomeContext): {
  exhausted: boolean;
  pressure: number;
  message?: string;
} {
  if (context.bypassBudgetCheck) {
    return { exhausted: false, pressure: 0 };
  }
  
  const monthlyPressure = context.monthlyLimitTokens > 0 
    ? context.monthlyUsedTokens / context.monthlyLimitTokens 
    : 0;
    
  const dailyPressure = context.dailyLimitTokens > 0 
    ? context.dailyUsedTokens / context.dailyLimitTokens 
    : 0;
  
  const rawPressure = Math.max(monthlyPressure, dailyPressure);
  const effectivePressure = getEffectivePressure(rawPressure);
  
  // Exhausted = 100%+ usage
  if (effectivePressure >= 1.0) {
    const isDaily = dailyPressure > monthlyPressure;
    return {
      exhausted: true,
      pressure: effectivePressure,
      message: isDaily
        ? "You've reached today's limit. Resets at midnight IST. 🌙"
        : "Monthly limit reached. Resets on the 1st. Consider upgrading for more! ✨",
    };
  }
  
  return { exhausted: false, pressure: effectivePressure };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLARITY CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function checkClarity(message: string, sessionMessageCount?: number): {
  needsClarification: boolean;
  reason?: AskBackReason;
  prompt?: string;
} {
  const trimmed = message.trim();
  
  // Too short (but allow short replies in ongoing conversation)
  if (trimmed.length < 3 && (!sessionMessageCount || sessionMessageCount <= 1)) {
    return {
      needsClarification: true,
      reason: 'UNCLEAR_INTENT',
      prompt: "Kuch aur batao - main help karne ke liye ready hoon! 🙂",
    };
  }
  
  // Single character or just punctuation
  if (/^[.!?,;:]+$/.test(trimmed)) {
    return {
      needsClarification: true,
      reason: 'UNCLEAR_INTENT',
      prompt: "Hmm, kya poochna chahte ho? Main sun raha hoon! 👂",
    };
  }
  
  // Just "help" or "hi" without context (first message only)
  if (sessionMessageCount && sessionMessageCount <= 1) {
    if (/^(help|hi|hello|hey|hlo|hii)\.?$/i.test(trimmed)) {
      // Don't ask back - just greet and offer help
      return { needsClarification: false };
    }
  }
  
  return { needsClarification: false };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRACEFUL MESSAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DECLINE_MESSAGES: Record<DeclineReason, string> = {
  HARMFUL_CONTENT: "I can't help with that request. Let's talk about something else! 🙂",
  ILLEGAL_REQUEST: "That's not something I can assist with. How else can I help you today?",
  PRIVACY_VIOLATION: "I can't help find private information about others. Is there something else I can help with?",
  JAILBREAK_ATTEMPT: "Nice try! 😄 But I'm happy being helpful Soriva. What can I actually help you with?",
};

const PAUSE_MESSAGES: Record<PauseReason, string> = {
  MAINTENANCE_MODE: "Soriva is taking a quick breather for maintenance. Back soon! 🔧",
  BUDGET_EXHAUSTED: "You've used up your quota for now. Resets soon! ✨",
  RATE_LIMITED: "Whoa, slow down! Give me a moment to catch up. 😅",
  ALL_MODELS_DOWN: "All our AI friends are busy right now. Please try again in a moment! 🙏",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN OUTCOME GATE FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function evaluateOutcome(context: OutcomeContext): OutcomeResult {
  const checksPassed: string[] = [];
  const checksFailed: string[] = [];
  
  // ─────────────────────────────────────────────────────────────
  // CHECK 1: Maintenance Mode
  // ─────────────────────────────────────────────────────────────
  if (isInMaintenance()) {
    checksFailed.push('maintenance');
    return {
      decision: 'PAUSE',
      reason: 'MAINTENANCE_MODE',
      userMessage: PAUSE_MESSAGES.MAINTENANCE_MODE,
      metadata: {
        checksPassed,
        checksFailed,
        timestamp: new Date().toISOString(),
      },
    };
  }
  checksPassed.push('maintenance');
  
  // ─────────────────────────────────────────────────────────────
  // CHECK 2: Harmful Content
  // ─────────────────────────────────────────────────────────────
  const harmCheck = detectHarmfulContent(context.message);
  if (harmCheck.isHarmful && harmCheck.reason) {
    checksFailed.push(`harmful:${harmCheck.category}`);
    return {
      decision: 'DECLINE',
      reason: harmCheck.reason,
      userMessage: DECLINE_MESSAGES[harmCheck.reason],
      metadata: {
        checksPassed,
        checksFailed,
        timestamp: new Date().toISOString(),
      },
    };
  }
  checksPassed.push('harmful_content');
  
  // ─────────────────────────────────────────────────────────────
  // CHECK 3: Budget
  // ─────────────────────────────────────────────────────────────
  const budgetCheck = checkBudget(context);
  if (budgetCheck.exhausted) {
    checksFailed.push('budget');
    return {
      decision: 'PAUSE',
      reason: 'BUDGET_EXHAUSTED',
      userMessage: budgetCheck.message || PAUSE_MESSAGES.BUDGET_EXHAUSTED,
      metadata: {
        checksPassed,
        checksFailed,
        budgetPressure: budgetCheck.pressure,
        timestamp: new Date().toISOString(),
      },
    };
  }
  checksPassed.push('budget');
  
  // ─────────────────────────────────────────────────────────────
  // CHECK 4: Clarity (only if needed)
  // ─────────────────────────────────────────────────────────────
  const clarityCheck = checkClarity(context.message, context.sessionMessageCount);
  if (clarityCheck.needsClarification) {
    checksFailed.push('clarity');
    return {
      decision: 'ASK_BACK',
      reason: clarityCheck.reason || 'UNCLEAR_INTENT',
      clarificationPrompt: clarityCheck.prompt,
      metadata: {
        checksPassed,
        checksFailed,
        budgetPressure: budgetCheck.pressure,
        timestamp: new Date().toISOString(),
      },
    };
  }
  checksPassed.push('clarity');
  
  // ─────────────────────────────────────────────────────────────
  // ALL CHECKS PASSED → ANSWER
  // ─────────────────────────────────────────────────────────────
  return {
    decision: 'ANSWER',
    reason: 'all_checks_passed',
    metadata: {
      checksPassed,
      checksFailed,
      budgetPressure: budgetCheck.pressure,
      timestamp: new Date().toISOString(),
    },
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUICK HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Quick check - should we proceed to LLM?
 */
export function shouldProceedToLLM(context: OutcomeContext): boolean {
  const result = evaluateOutcome(context);
  return result.decision === 'ANSWER';
}

/**
 * Get user-facing message for non-ANSWER decisions
 */
export function getOutcomeMessage(result: OutcomeResult): string {
  if (result.decision === 'ANSWER') {
    return ''; // No message needed
  }
  
  if (result.decision === 'ASK_BACK') {
    return result.clarificationPrompt || "Could you tell me more?";
  }
  
  return result.userMessage || "Something went wrong. Please try again.";
}

/**
 * Check if message needs special care (self-harm detection)
 */
export function needsSpecialCare(message: string): boolean {
  for (const pattern of HARMFUL_PATTERNS.selfHarm) {
    if (pattern.test(message.toLowerCase())) {
      return true;
    }
  }
  return false;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default {
  evaluateOutcome,
  shouldProceedToLLM,
  getOutcomeMessage,
  needsSpecialCare,
};