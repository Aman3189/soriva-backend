// src/core/ai/utils/budget-pressure.ts
// ============================================================================
// SORIVA BUDGET PRESSURE SYSTEM v1.1 - January 2026
// ============================================================================
//
// 🎯 PHILOSOPHY: Save tokens WITHOUT hurting user experience
//
// 4 SAFETY VALVES (in priority order):
// 1. Model Downgrade     - GPT→Gemini→Kimi→Flash (invisible)
// 2. Orchestration Off   - Multi-model → Single (invisible)
// 3. Reasoning Collapse  - Deep CoT → Direct answer (invisible)
// 4. Format Compact      - Paragraphs → Bullets (subtle)
//
// 🔥 KEY PRINCIPLE:
// User gets SAME quality answer, we spend LESS tokens
// They never know. They never feel limited. They stay happy.
//
// v1.1 UPDATES:
// - Intent-aware reasoning collapse (never for LEARNING/PERSONAL)
// - Session-level pressure caching (no micro-fluctuations)
// - APEX orchestration override (only suppress at CRITICAL)
//
// ============================================================================

import { PlanType } from '../../../constants';

// ============================================================================
// TYPES
// ============================================================================

export type PressureLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Intent types that should NEVER have reasoning collapsed
export type ProtectedIntent = 'LEARNING' | 'PERSONAL';

export interface BudgetPressureResult {
  level: PressureLevel;
  usageRatio: number;
  
  // Safety valve decisions
  valves: {
    modelDowngrade: boolean;
    suppressOrchestration: boolean;
    collapseReasoning: boolean;
    compactFormat: boolean;
  };
  
  // Instructions to append to delta
  formatDelta: string;
  reasoningDelta: string;
}

export interface PressureConfig {
  lowThreshold: number;      // When to start light optimizations
  mediumThreshold: number;   // When to suppress orchestration
  highThreshold: number;     // When to downgrade models
  criticalThreshold: number; // When to use all valves
}

export interface PressureOptions {
  plan: PlanType;
  intent?: string;           // For intent-aware decisions
  sessionPressureLevel?: PressureLevel; // Cached session pressure
}

// ============================================================================
// PLAN-SPECIFIC PRESSURE CONFIGS
// ============================================================================

const PRESSURE_CONFIGS: Record<PlanType, PressureConfig> = {
  [PlanType.STARTER]: {
    lowThreshold: 0.5,       // Start early for free users
    mediumThreshold: 0.7,
    highThreshold: 0.85,
    criticalThreshold: 0.95,
  },
  [PlanType.PLUS]: {
    lowThreshold: 0.6,
    mediumThreshold: 0.75,
    highThreshold: 0.88,
    criticalThreshold: 0.95,
  },
  [PlanType.PRO]: {
    lowThreshold: 0.65,
    mediumThreshold: 0.8,
    highThreshold: 0.9,
    criticalThreshold: 0.96,
  },
  [PlanType.APEX]: {
    lowThreshold: 0.75,      // Very late for premium
    mediumThreshold: 0.85,
    highThreshold: 0.92,
    criticalThreshold: 0.97,
  },
  [PlanType.SOVEREIGN]: {
    lowThreshold: 1.0,       // Never trigger
    mediumThreshold: 1.0,
    highThreshold: 1.0,
    criticalThreshold: 1.0,
  },
};

// ============================================================================
// PROTECTED INTENTS - Never collapse reasoning for these
// ============================================================================

const PROTECTED_INTENTS: string[] = ['LEARNING', 'PERSONAL'];

/**
 * Check if intent should be protected from reasoning collapse
 * Teaching without reasoning = broken
 * Emotional advice without reflection = cold
 */
function isProtectedIntent(intent?: string): boolean {
  if (!intent) return false;
  return PROTECTED_INTENTS.includes(intent.toUpperCase());
}

// ============================================================================
// PRESSURE LEVEL CALCULATOR
// ============================================================================

/**
 * Calculate budget pressure level
 */
export function calculatePressureLevel(
  usageRatio: number,
  plan: PlanType
): PressureLevel {
  const config = PRESSURE_CONFIGS[plan];
  
  if (usageRatio >= config.criticalThreshold) return 'CRITICAL';
  if (usageRatio >= config.highThreshold) return 'HIGH';
  if (usageRatio >= config.mediumThreshold) return 'MEDIUM';
  if (usageRatio >= config.lowThreshold) return 'LOW';
  return 'NONE';
}

/**
 * Get or cache session pressure level
 * Prevents micro-fluctuations within a session
 * 
 * Usage:
 * session.pressureLevel ??= calculatePressureLevel(...)
 * Then reuse for entire session
 */
export function getSessionPressureLevel(
  usageRatio: number,
  plan: PlanType,
  cachedLevel?: PressureLevel
): PressureLevel {
  // If already cached, reuse it (prevents inconsistent feel)
  if (cachedLevel !== undefined) {
    return cachedLevel;
  }
  
  return calculatePressureLevel(usageRatio, plan);
}

// ============================================================================
// SAFETY VALVE #1: MODEL DOWNGRADE CHAIN
// ============================================================================

/**
 * Model downgrade chain (user never notices)
 * GPT-5.1 → Gemini Pro → Mistral Large 3 → Flash
 */
const MODEL_DOWNGRADE_CHAIN: Record<string, string> = {
  'gpt-5.1': 'gemini-2.5-pro',
  'claude-sonnet-4-5': 'gemini-2.5-pro',
  'gemini-3-pro': 'gemini-2.5-pro',
  'gemini-2.5-pro': 'mistral-large-3',
  'magistral-medium': 'mistral-large-3',
  'mistral-large-3': 'gemini-2.5-flash',
  'gemini-2.5-flash': 'gemini-2.5-flash-lite',
};

/**
 * Get downgraded model based on pressure
 */
export function getDowngradedModel(
  originalModel: string,
  pressureLevel: PressureLevel
): string {
  if (pressureLevel === 'NONE' || pressureLevel === 'LOW') {
    return originalModel;
  }
  
  let model = originalModel;
  const steps = pressureLevel === 'CRITICAL' ? 2 : 1;
  
  for (let i = 0; i < steps; i++) {
    const downgrade = MODEL_DOWNGRADE_CHAIN[model];
    if (downgrade) {
      model = downgrade;
    }
  }
  
  return model;
}

// ============================================================================
// SAFETY VALVE #2: ORCHESTRATION SUPPRESSION
// ============================================================================

/**
 * Should suppress multi-model orchestration?
 * 
 * APEX OVERRIDE: Multi-model is APEX selling point!
 * Only suppress at CRITICAL for APEX users
 */
export function shouldSuppressOrchestration(
  pressureLevel: PressureLevel,
  plan: PlanType
): boolean {
  // APEX special treatment - orchestration is their selling point
  // Only suppress at CRITICAL level
  if (plan === PlanType.APEX) {
    return pressureLevel === 'CRITICAL';
  }
  
  // Other plans: suppress at MEDIUM and above
  return pressureLevel === 'MEDIUM' || 
         pressureLevel === 'HIGH' || 
         pressureLevel === 'CRITICAL';
}

// ============================================================================
// SAFETY VALVE #3: REASONING COLLAPSE
// ============================================================================

/**
 * Should collapse reasoning?
 * 
 * PROTECTED INTENTS: Never collapse for LEARNING/PERSONAL
 * - Teaching without reasoning feels broken
 * - Emotional advice without reflection feels cold
 */
export function shouldCollapseReasoning(
  pressureLevel: PressureLevel,
  intent?: string
): boolean {
  // Never collapse for protected intents
  if (isProtectedIntent(intent)) {
    return false;
  }
  
  // Collapse at MEDIUM and above (for non-protected intents)
  return pressureLevel !== 'NONE' && pressureLevel !== 'LOW';
}

/**
 * Reasoning collapse instructions
 * Tells model to skip deep chain-of-thought, give direct answer
 */
const REASONING_DELTAS: Record<PressureLevel, string> = {
  NONE: '',
  LOW: '',
  MEDIUM: `Focus on the final answer. Minimal internal deliberation.`,
  HIGH: `Give direct answer. Skip extended reasoning. Be decisive.`,
  CRITICAL: `Answer directly and concisely. No deliberation needed.`,
};

/**
 * Get reasoning collapse delta
 * Returns empty string for protected intents
 */
export function getReasoningDelta(
  pressureLevel: PressureLevel,
  intent?: string
): string {
  // Never collapse reasoning for protected intents
  if (isProtectedIntent(intent)) {
    return '';
  }
  
  return REASONING_DELTAS[pressureLevel];
}

// ============================================================================
// SAFETY VALVE #4: FORMAT COMPACTION
// ============================================================================

/**
 * Format modes for response styling
 */
export type FormatMode = 'RICH' | 'BALANCED' | 'COMPACT';

/**
 * Map pressure level to format mode
 */
function pressureToFormatMode(level: PressureLevel): FormatMode {
  switch (level) {
    case 'NONE':
    case 'LOW':
      return 'RICH';
    case 'MEDIUM':
      return 'BALANCED';
    case 'HIGH':
    case 'CRITICAL':
      return 'COMPACT';
  }
}

/**
 * Format instructions - progressively tighter
 * RICH: Natural flowing response
 * BALANCED: Organized, concise
 * COMPACT: Bullets, zero redundancy
 */
const FORMAT_INSTRUCTIONS: Record<FormatMode, string> = {
  RICH: '', // No constraint - natural response
  
  BALANCED: `Be clear and organized.
Use short paragraphs.
Avoid unnecessary elaboration.
Get to the point, then support it.`,
  
  COMPACT: `Format for maximum clarity:
• Use bullets for any list
• Use headings for sections
• Zero redundancy - say it once
• Tight phrasing - no filler words
• Complete info, minimal tokens`,
};

/**
 * Format deltas mapped to pressure levels
 */
const FORMAT_DELTAS: Record<PressureLevel, string> = {
  NONE: FORMAT_INSTRUCTIONS.RICH,
  LOW: FORMAT_INSTRUCTIONS.RICH,
  MEDIUM: FORMAT_INSTRUCTIONS.BALANCED,
  HIGH: FORMAT_INSTRUCTIONS.COMPACT,
  CRITICAL: FORMAT_INSTRUCTIONS.COMPACT,
};

/**
 * Get format compaction delta
 */
export function getFormatDelta(pressureLevel: PressureLevel): string {
  return FORMAT_DELTAS[pressureLevel];
}

/**
 * Get format mode for pressure level
 */
export function getFormatMode(pressureLevel: PressureLevel): FormatMode {
  return pressureToFormatMode(pressureLevel);
}

// ============================================================================
// MAIN FUNCTION: EVALUATE BUDGET PRESSURE
// ============================================================================

/**
 * Evaluate budget pressure and return all safety valve decisions
 * 
 * @param dailyUsed - Tokens used today
 * @param dailyLimit - Daily token limit
 * @param options - Plan, intent, and session cache options
 * @returns Complete pressure analysis with valve decisions
 * 
 * @example
 * const pressure = evaluateBudgetPressure(45000, 50000, {
 *   plan: PlanType.PLUS,
 *   intent: 'LEARNING',  // Won't collapse reasoning
 *   sessionPressureLevel: cachedLevel  // Reuse if exists
 * });
 */
export function evaluateBudgetPressure(
  dailyUsed: number,
  dailyLimit: number,
  options: PressureOptions
): BudgetPressureResult {
  const { plan, intent, sessionPressureLevel } = options;
  
  const usageRatio = dailyLimit > 0 ? dailyUsed / dailyLimit : 0;
  
  // Use cached session level if available (prevents micro-fluctuations)
  const level = getSessionPressureLevel(usageRatio, plan, sessionPressureLevel);
  
  // Calculate valve decisions with guards
  const shouldDowngrade = level === 'HIGH' || level === 'CRITICAL';
  const shouldSuppress = shouldSuppressOrchestration(level, plan);
  const shouldCollapse = shouldCollapseReasoning(level, intent);
  const shouldCompact = level === 'HIGH' || level === 'CRITICAL';
  
  return {
    level,
    usageRatio,
    valves: {
      modelDowngrade: shouldDowngrade,
      suppressOrchestration: shouldSuppress,
      collapseReasoning: shouldCollapse,
      compactFormat: shouldCompact,
    },
    formatDelta: getFormatDelta(level),
    reasoningDelta: getReasoningDelta(level, intent),
  };
}

// ============================================================================
// HELPER: APPLY PRESSURE TO MODEL SELECTION
// ============================================================================

/**
 * Apply budget pressure to model selection
 * Use in smart-routing.service.ts
 */
export function applyPressureToModel(
  selectedModel: string,
  dailyUsed: number,
  dailyLimit: number,
  options: PressureOptions
): {
  model: string;
  wasDowngraded: boolean;
  pressure: BudgetPressureResult;
} {
  const pressure = evaluateBudgetPressure(dailyUsed, dailyLimit, options);
  
  if (!pressure.valves.modelDowngrade) {
    return {
      model: selectedModel,
      wasDowngraded: false,
      pressure,
    };
  }
  
  const downgradedModel = getDowngradedModel(selectedModel, pressure.level);
  
  return {
    model: downgradedModel,
    wasDowngraded: downgradedModel !== selectedModel,
    pressure,
  };
}

// ============================================================================
// HELPER: GET PRESSURE-AWARE DELTA
// ============================================================================

/**
 * Append pressure-aware instructions to delta
 * Use in delta builders
 */
export function appendPressureDelta(
  baseDelta: string,
  pressure: BudgetPressureResult
): string {
  const additions: string[] = [];
  
  if (pressure.reasoningDelta) {
    additions.push(pressure.reasoningDelta);
  }
  
  if (pressure.formatDelta) {
    additions.push(pressure.formatDelta);
  }
  
  if (additions.length === 0) {
    return baseDelta;
  }
  
  return `${baseDelta}\n\n${additions.join('\n')}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  PRESSURE_CONFIGS,
  MODEL_DOWNGRADE_CHAIN,
};

export default evaluateBudgetPressure;