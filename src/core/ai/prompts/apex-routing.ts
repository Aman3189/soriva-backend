// src/core/ai/prompts/apex-routing.ts
// ============================================================================
// SORIVA APEX ROUTING v2.0 - January 2026
// ============================================================================
// Purpose: Intent-based model routing for Apex (premium) plan
// Premium experience - best models, smart routing
//
// Routing Logic:
// - QUICK      → Flash / Kimi (fast response)
// - ANALYTICAL → GPT-5.1 / Gemini Pro (deep thinking)
// - STRATEGIC  → GPT-5.1 primary (business advisor)
// - CREATIVE   → Claude Sonnet / Gemini 3 Pro (originality)
// - TECHNICAL  → GPT-5.1 / Claude Sonnet (code excellence)
// - LEARNING   → Claude Sonnet / Gemini Pro (teaching)
// - PERSONAL   → Claude Sonnet (emotional intelligence)
//
// No caps for Apex - they're paying premium!
// ============================================================================

import { ApexIntent } from './apex-delta';
import { classifyApexIntent } from './apex-intent-classifier';
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
  metadata: {
    routingHash: number;
  };
}

export interface ApexRoutingOptions {
  region: Region;
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
 */
const REGION_MODELS = {
  IN: {
    fast: [MODELS.GEMINI_FLASH, MODELS.KIMI_K2],
    deep: [MODELS.GPT_51, MODELS.GEMINI_PRO],
    creative: [MODELS.GEMINI_3_PRO, MODELS.GPT_51],
    technical: [MODELS.GPT_51, MODELS.GEMINI_PRO],
    learning: [MODELS.GEMINI_PRO, MODELS.GPT_51],
    personal: [MODELS.GEMINI_PRO], // Claude not available in India
  },
  INTL: {
    fast: [MODELS.GEMINI_FLASH, MODELS.KIMI_K2],
    deep: [MODELS.GPT_51, MODELS.GEMINI_PRO],
    creative: [MODELS.CLAUDE_SONNET, MODELS.GEMINI_3_PRO],
    technical: [MODELS.GPT_51, MODELS.CLAUDE_SONNET],
    learning: [MODELS.CLAUDE_SONNET, MODELS.GEMINI_PRO],
    personal: [MODELS.CLAUDE_SONNET], // Best for emotional intelligence
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
// MAIN ROUTING FUNCTION
// ============================================================================

/**
 * Resolve model for Apex plan message
 * Premium routing - best models for each intent
 */
export function resolveApexModel(
  message: string,
  options: ApexRoutingOptions
): ApexRoutingResult {
  const { region, userId } = options;

  // Generate deterministic routing hash
  const routingHash = generateRoutingHash(message, userId);

  // Classify intent (simple call now)
  const intent = classifyApexIntent(message);

  // Select model based on intent and region
  const selectedModel = selectModelForIntent(intent, region, routingHash);

  // Get delta prompt
  const deltaPrompt = getApexDelta(intent);

  return {
    model: selectedModel,
    modelDisplayName: MODEL_DISPLAY_NAMES[selectedModel] || selectedModel,
    intent,
    deltaPrompt,
    metadata: {
      routingHash,
    },
  };
}

// ============================================================================
// MODEL SELECTION
// ============================================================================

/**
 * Select model based on intent and region
 */
function selectModelForIntent(
  intent: ApexIntent,
  region: Region,
  routingHash: number
): string {
  const models = REGION_MODELS[region];

  switch (intent) {
    // QUICK → Fast models (Flash / Kimi)
    case 'QUICK':
      return selectModelByHash(routingHash, models.fast);

    // ANALYTICAL → Deep thinking models (GPT-5.1 / Gemini Pro)
    case 'ANALYTICAL':
      return selectModelByHash(routingHash, models.deep);

    // STRATEGIC → GPT-5.1 primary (business advisor)
    case 'STRATEGIC':
      return MODELS.GPT_51;

    // CREATIVE → Claude Sonnet / Gemini 3 Pro
    case 'CREATIVE':
      return selectModelByHash(routingHash, models.creative);

    // TECHNICAL → GPT-5.1 / Claude Sonnet (code excellence)
    case 'TECHNICAL':
      return selectModelByHash(routingHash, models.technical);

    // LEARNING → Claude Sonnet / Gemini Pro (teaching)
    case 'LEARNING':
      return selectModelByHash(routingHash, models.learning);

    // PERSONAL → Claude Sonnet (emotional intelligence)
    case 'PERSONAL':
      return models.personal[0];

    default:
      return MODELS.GEMINI_FLASH;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get model cost per 1M tokens (for analytics)
 */
export function getModelCostPer1M(model: string): number {
  const costs: Record<string, number> = {
    [MODELS.GEMINI_FLASH]: 210,
    [MODELS.KIMI_K2]: 207,
    [MODELS.GPT_51]: 810,
    [MODELS.GEMINI_PRO]: 810,
    [MODELS.CLAUDE_SONNET]: 1218,
    [MODELS.GEMINI_3_PRO]: 982,
  };
  return costs[model] || 500;
}

/**
 * Get available models for region
 */
export function getAvailableModels(region: Region): string[] {
  const models = REGION_MODELS[region];
  const allModels = [
    ...models.fast,
    ...models.deep,
    ...models.creative,
    ...models.technical,
    ...models.learning,
    ...models.personal,
  ];
  return [...new Set(allModels)];
}

/**
 * Check if intent needs premium model
 */
export function needsPremiumModel(intent: ApexIntent): boolean {
  return ['STRATEGIC', 'CREATIVE', 'TECHNICAL', 'PERSONAL'].includes(intent);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

/**
 * Handle Apex message - main entry point
 */
export function handleApexMessage(
  message: string,
  options: ApexRoutingOptions
): ApexRoutingResult {
  return resolveApexModel(message, options);
}

export default handleApexMessage;