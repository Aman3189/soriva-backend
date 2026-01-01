// src/core/ai/prompts/apex-routing.ts
// ============================================================================
// SORIVA APEX ROUTING v1.0 - January 2026
// ============================================================================
// Purpose: Intent-based model routing for Apex (premium) plan
// MULTI-MODEL ORCHESTRATION - The WOW factor!
//
// Routing Logic:
// - INSTANT     → Flash / Kimi (fast response)
// - ANALYTICAL  → GPT-5.1 / Gemini Pro (deep thinking)
// - STRATEGIC   → GPT-5.1 primary (business advisor)
// - CREATIVE    → Claude Sonnet / Gemini 3 Pro (originality)
// - MULTI_DOMAIN → Multi-model chain (orchestration)
//
// Key Difference from Pro:
// - Pro: Single model per request (cost protection)
// - Apex: Multi-model orchestration (premium experience)
//
// No GPT caps for Apex - they're paying premium!
// ============================================================================

import { ApexIntent, classifyApexIntent, ApexIntentResult } from './apex-intent-classifier';
import { getApexDelta } from './apex-delta';

// ============================================================================
// TYPES
// ============================================================================

export type Region = 'IN' | 'INTL';

export interface ApexRoutingResult {
  model: string;
  modelDisplayName: string;
  intent: ApexIntent;
  deltaPrompt: string;
  isMultiModel: boolean;
  multiModelChain?: MultiModelStep[];
  requiresTools: boolean;
  isFollowUp: boolean;
  metadata: {
    depthScore: number;
    routingHash: number;
    processingTimeMs: number;
  };
}

export interface MultiModelStep {
  step: number;
  model: string;
  modelDisplayName: string;
  purpose: string;
  outputType: 'analysis' | 'synthesis' | 'creative' | 'validation';
}

export interface ApexRoutingOptions {
  region: Region;
  turnNumber?: number;
  sessionIntent?: ApexIntent;
  sessionIntentLocked?: boolean;
  userId?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Model IDs
 */
export const MODELS = {
  // Fast models
  GEMINI_FLASH: 'gemini-2.5-flash',
  KIMI_K2: 'moonshotai/kimi-k2-thinking',
  
  // Deep thinking models
  GPT_51: 'gpt-5.1',
  GEMINI_PRO: 'gemini-2.5-pro',
  
  // Premium models (Apex exclusive)
  CLAUDE_SONNET: 'claude-sonnet-4-5',
  GEMINI_3_PRO: 'gemini-3-pro',
};

/**
 * Model Display Names
 */
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  [MODELS.GEMINI_FLASH]: 'Gemini Flash',
  [MODELS.KIMI_K2]: 'Kimi K2',
  [MODELS.GPT_51]: 'GPT-5.1',
  [MODELS.GEMINI_PRO]: 'Gemini Pro',
  [MODELS.CLAUDE_SONNET]: 'Claude Sonnet 4.5',
  [MODELS.GEMINI_3_PRO]: 'Gemini 3 Pro',
};

/**
 * Region-specific model availability
 * India doesn't have Claude Sonnet in routing
 */
const REGION_MODELS = {
  IN: {
    fast: [MODELS.GEMINI_FLASH, MODELS.KIMI_K2],
    deep: [MODELS.GPT_51, MODELS.GEMINI_PRO],
    creative: [MODELS.GEMINI_3_PRO, MODELS.GPT_51], // No Claude for India
    multiModel: [MODELS.KIMI_K2, MODELS.GPT_51, MODELS.GEMINI_PRO],
  },
  INTL: {
    fast: [MODELS.GEMINI_FLASH, MODELS.KIMI_K2],
    deep: [MODELS.GPT_51, MODELS.GEMINI_PRO],
    creative: [MODELS.CLAUDE_SONNET, MODELS.GEMINI_3_PRO],
    multiModel: [MODELS.KIMI_K2, MODELS.GPT_51, MODELS.CLAUDE_SONNET],
  },
};

// ============================================================================
// HASH-BASED ROUTING (Deterministic)
// ============================================================================

/**
 * Generate deterministic hash for routing
 * Same input = same output (no randomness)
 */
function generateRoutingHash(message: string, userId?: string): number {
  const input = userId ? `${userId}:${message}` : message;
  
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash) % 100;
}

/**
 * Select model from array based on hash
 */
function selectModelByHash(hash: number, models: string[]): string {
  const index = hash % models.length;
  return models[index];
}

// ============================================================================
// MULTI-MODEL ORCHESTRATION
// ============================================================================

/**
 * Build multi-model chain for MULTI_DOMAIN intent
 * This is the WOW factor - multiple models working together
 * 
 * Chain structure:
 * 1. Kimi K2: Initial analysis & structure
 * 2. GPT-5.1: Deep reasoning & strategy
 * 3. Claude/Gemini 3: Synthesis & polish (region-specific)
 */
function buildMultiModelChain(region: Region): MultiModelStep[] {
  const models = REGION_MODELS[region];
  
  return [
    {
      step: 1,
      model: MODELS.KIMI_K2,
      modelDisplayName: MODEL_DISPLAY_NAMES[MODELS.KIMI_K2],
      purpose: 'Initial analysis, structure, and domain mapping',
      outputType: 'analysis',
    },
    {
      step: 2,
      model: MODELS.GPT_51,
      modelDisplayName: MODEL_DISPLAY_NAMES[MODELS.GPT_51],
      purpose: 'Deep reasoning, trade-offs, and strategic insights',
      outputType: 'analysis',
    },
    {
      step: 3,
      model: region === 'INTL' ? MODELS.CLAUDE_SONNET : MODELS.GEMINI_PRO,
      modelDisplayName: region === 'INTL' 
        ? MODEL_DISPLAY_NAMES[MODELS.CLAUDE_SONNET] 
        : MODEL_DISPLAY_NAMES[MODELS.GEMINI_PRO],
      purpose: 'Synthesis into unified mental model with actionable output',
      outputType: 'synthesis',
    },
  ];
}

/**
 * Build creative chain for enhanced CREATIVE intent
 * Optional: Can be used for high-stakes creative work
 */
function buildCreativeChain(region: Region): MultiModelStep[] {
  return [
    {
      step: 1,
      model: region === 'INTL' ? MODELS.CLAUDE_SONNET : MODELS.GEMINI_3_PRO,
      modelDisplayName: region === 'INTL'
        ? MODEL_DISPLAY_NAMES[MODELS.CLAUDE_SONNET]
        : MODEL_DISPLAY_NAMES[MODELS.GEMINI_3_PRO],
      purpose: 'Generate creative directions and concepts',
      outputType: 'creative',
    },
    {
      step: 2,
      model: MODELS.GPT_51,
      modelDisplayName: MODEL_DISPLAY_NAMES[MODELS.GPT_51],
      purpose: 'Validate feasibility and refine concepts',
      outputType: 'validation',
    },
  ];
}

// ============================================================================
// MAIN ROUTING FUNCTION
// ============================================================================

/**
 * Resolve model for Apex plan message
 * Supports multi-model orchestration for premium experience
 * 
 * @param message - User's message
 * @param options - Routing options
 * @returns ApexRoutingResult with model(s), delta, and metadata
 * 
 * @example
 * const result = resolveApexModel('Compare AWS vs GCP vs Azure for our startup', {
 *   region: 'INTL',
 *   userId: 'user_123',
 * });
 * // Returns multi-model chain for MULTI_DOMAIN intent
 */
export function resolveApexModel(
  message: string,
  options: ApexRoutingOptions
): ApexRoutingResult {
  const startTime = Date.now();
  const {
    region,
    turnNumber = 1,
    sessionIntent,
    sessionIntentLocked = false,
    userId,
  } = options;

  // Generate deterministic routing hash
  const routingHash = generateRoutingHash(message, userId);

  // Classify intent
  const intentResult = classifyApexIntent(message);
  const { intent, metadata: intentMetadata } = intentResult;

  // Use session intent if locked (conversation continuity)
  const effectiveIntent = (sessionIntentLocked && sessionIntent) ? sessionIntent : intent;

  // Determine if this is a follow-up turn
  const isFollowUp = turnNumber > 1 && sessionIntentLocked;

  // Select model(s) based on intent
  const routingResult = selectModelForIntent(
    effectiveIntent,
    region,
    routingHash
  );

  // Get delta prompt
  const deltaPrompt = getApexDelta(effectiveIntent, { isFollowUp });

  return {
    model: routingResult.primaryModel,
    modelDisplayName: MODEL_DISPLAY_NAMES[routingResult.primaryModel] || routingResult.primaryModel,
    intent: effectiveIntent,
    deltaPrompt,
    isMultiModel: routingResult.isMultiModel,
    multiModelChain: routingResult.multiModelChain,
    requiresTools: intentMetadata.requiresTools,
    isFollowUp,
    metadata: {
      depthScore: intentMetadata.depthScore,
      routingHash,
      processingTimeMs: Date.now() - startTime,
    },
  };
}

// ============================================================================
// MODEL SELECTION
// ============================================================================

/**
 * Select model(s) based on intent
 */
function selectModelForIntent(
  intent: ApexIntent,
  region: Region,
  routingHash: number
): {
  primaryModel: string;
  isMultiModel: boolean;
  multiModelChain?: MultiModelStep[];
} {
  const models = REGION_MODELS[region];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INSTANT → Fast models (Flash / Kimi)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'INSTANT') {
    return {
      primaryModel: selectModelByHash(routingHash, models.fast),
      isMultiModel: false,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANALYTICAL → Deep thinking models (GPT-5.1 / Gemini Pro)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'ANALYTICAL') {
    return {
      primaryModel: selectModelByHash(routingHash, models.deep),
      isMultiModel: false,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STRATEGIC → GPT-5.1 primary (business advisor)
  // India gets Gemini Pro fallback for operational safety
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'STRATEGIC') {
    return {
      primaryModel:
        region === 'IN'
          ? selectModelByHash(routingHash, [MODELS.GPT_51, MODELS.GEMINI_PRO])
          : MODELS.GPT_51,
      isMultiModel: false,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CREATIVE → Claude Sonnet / Gemini 3 Pro (region-specific)
  // 30% get premium creative chain, 70% get fast single model
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'CREATIVE' && routingHash < 30) {
    // 30% premium creative chaining
    const chain = buildCreativeChain(region);
    return {
      primaryModel: chain[0].model,
      isMultiModel: true,
      multiModelChain: chain,
    };
  }

  if (intent === 'CREATIVE') {
    // 70% fast creative
    return {
      primaryModel: selectModelByHash(routingHash, models.creative),
      isMultiModel: false,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MULTI_DOMAIN → Multi-model orchestration 🔥
  // Classifier guarantees MULTI_DOMAIN = orchestration needed
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (intent === 'MULTI_DOMAIN') {
    const chain = buildMultiModelChain(region);
    return {
      primaryModel: chain[0].model,
      isMultiModel: true,
      multiModelChain: chain,
    };
  }

  // Default fallback
  return {
    primaryModel: MODELS.GEMINI_FLASH,
    isMultiModel: false,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if multi-model orchestration is needed
 */
export function needsOrchestration(message: string): boolean {
  const result = classifyApexIntent(message);
  return result.intent === 'MULTI_DOMAIN' && result.metadata.requiresMultipleModels;
}

/**
 * Get multi-model chain for a message
 */
export function getMultiModelChain(message: string, region: Region): MultiModelStep[] | null {
  if (!needsOrchestration(message)) {
    return null;
  }
  return buildMultiModelChain(region);
}

/**
 * Get model cost per 1M tokens (for analytics)
 */
export function getModelCostPer1M(model: string): number {
  const costs: Record<string, number> = {
    [MODELS.GEMINI_FLASH]: 210,       // ₹210 per 1M
    [MODELS.KIMI_K2]: 207,            // ₹207 per 1M
    [MODELS.GPT_51]: 810,             // ₹810 per 1M
    [MODELS.GEMINI_PRO]: 810,         // ₹810 per 1M
    [MODELS.CLAUDE_SONNET]: 1218,     // ₹1218 per 1M
    [MODELS.GEMINI_3_PRO]: 982,       // ₹982 per 1M
  };

  return costs[model] || 500;
}

/**
 * Estimate cost for multi-model chain
 */
export function estimateChainCost(
  chain: MultiModelStep[],
  estimatedTokensPerStep: number = 1000
): number {
  let totalCost = 0;
  for (const step of chain) {
    const costPer1M = getModelCostPer1M(step.model);
    totalCost += (estimatedTokensPerStep / 1000000) * costPer1M;
  }
  return totalCost;
}

/**
 * Get available models for region
 */
export function getAvailableModels(region: Region): string[] {
  const models = REGION_MODELS[region];
  return [
    ...models.fast,
    ...models.deep,
    ...models.creative,
  ].filter((v, i, a) => a.indexOf(v) === i); // Unique
}

// ============================================================================
// APEX HANDLER (Combined convenience function)
// ============================================================================

/**
 * Handle Apex message - combines classification, routing, and delta
 * This is the main entry point for Apex plan message handling
 * 
 * @param message - User's message
 * @param options - Routing options
 * @returns Complete routing result
 * 
 * @example
 * const result = handleApexMessage(message, {
 *   region: user.region,
 *   turnNumber: chat.turnNumber,
 *   sessionIntent: chat.lockedIntent,
 *   sessionIntentLocked: chat.intentLocked,
 *   userId: user.id,
 * });
 * 
 * if (result.isMultiModel) {
 *   // Execute multi-model chain
 *   for (const step of result.multiModelChain) {
 *     const response = await callModel(step.model, {...});
 *   }
 * } else {
 *   // Single model call
 *   const response = await callModel(result.model, {...});
 * }
 */
export function handleApexMessage(
  message: string,
  options: ApexRoutingOptions
): ApexRoutingResult {
  return resolveApexModel(message, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  buildMultiModelChain,
  buildCreativeChain,
};

export default handleApexMessage;