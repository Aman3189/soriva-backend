// src/core/ai/prompts/apex-delta.ts
// ============================================================================
// SORIVA APEX DELTA PROMPTS v1.0 - January 2026
// ============================================================================
// Purpose: Intent-specific delta prompts for Apex (premium) plan
// NO policing - only empowerment and response optimization
//
// Delta Prompts:
// - INSTANT: Fast, decisive, no fluff
// - ANALYTICAL: Deep thinking, trade-offs, reasoning
// - STRATEGIC: Long-term lens, second-order effects
// - CREATIVE: Maximum originality, multiple directions
// - MULTI_DOMAIN: Cross-domain synthesis, structured output
//
// Key Difference from Pro:
// - Pro deltas: Control depth (cost protection)
// - Apex deltas: Maximize quality (premium experience)
//
// Token Cost: ~20-45 tokens per delta
// ============================================================================

import { ApexIntent } from './apex-intent-classifier';

// ============================================================================
// DELTA PROMPTS
// ============================================================================

/**
 * INSTANT Delta
 * Fast, direct, execution-focused
 * For short queries needing quick answers
 */
const APEX_INSTANT = `Respond immediately and decisively.
No fluff. Clear execution-focused answer.
Be direct and actionable.`;

/**
 * ANALYTICAL Delta
 * Deep thinking, reasoning, trade-offs
 * For queries needing thorough analysis
 */
const APEX_ANALYTICAL = `Think deeply and reason carefully.
Explain reasoning, trade-offs, and implications clearly.
Challenge assumptions where relevant.
Provide structured, well-supported conclusions.`;

/**
 * STRATEGIC Delta
 * Long-term focus, business/life planning
 * For high-stakes decision making
 */
const APEX_STRATEGIC = `Adopt a long-term strategic lens.
Consider second-order effects and future impact.
Think like a trusted advisor to a CEO.
Balance ambition with pragmatism.
Highlight risks and opportunities with equal weight.`;

/**
 * CREATIVE Delta
 * Maximum originality, multiple directions
 * For design, writing, ideation queries
 */
const APEX_CREATIVE = `Maximize originality and creative depth.
Offer multiple creative directions with clear rationale.
Push boundaries while staying purposeful.
Balance innovation with feasibility.
Make the output memorable and distinctive.`;

/**
 * MULTI_DOMAIN Delta
 * Cross-domain synthesis, structured thinking
 * For complex queries needing multiple perspectives
 */
const APEX_MULTI_DOMAIN = `Combine insights across multiple domains.
Synthesize perspectives into a unified mental model.
Structure your response with clear sections.
Highlight interconnections, dependencies, and tensions.
Provide actionable recommendations from each angle.`;

/**
 * MULTI_DOMAIN Followup Delta
 * For subsequent turns in multi-domain conversation
 */
const APEX_MULTI_DOMAIN_FOLLOWUP = `Continue the multi-domain analysis.
Build on previous insights without repetition.
Focus on new angles or deeper exploration.
Maintain structured synthesis approach.`;

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Get delta prompt for Apex plan based on intent
 * @param intent - Classified intent type
 * @param options - Optional configuration
 * @returns Delta prompt string
 *
 * @example
 * const delta = getApexDelta('STRATEGIC');
 * // Returns long-term strategic lens prompt
 *
 * const delta = getApexDelta('MULTI_DOMAIN', { isFollowUp: true });
 * // Returns compressed followup prompt
 */
export function getApexDelta(
  intent: ApexIntent,
  options?: {
    isFollowUp?: boolean;
  }
): string {
  const { isFollowUp = false } = options || {};

  switch (intent) {
    case 'INSTANT':
      return APEX_INSTANT;

    case 'ANALYTICAL':
      return APEX_ANALYTICAL;

    case 'STRATEGIC':
      return APEX_STRATEGIC;

    case 'CREATIVE':
      return APEX_CREATIVE;

    case 'MULTI_DOMAIN':
      return isFollowUp ? APEX_MULTI_DOMAIN_FOLLOWUP : APEX_MULTI_DOMAIN;

    default:
      return APEX_INSTANT;
  }
}

// ============================================================================
// TOKEN ESTIMATES
// ============================================================================

/**
 * Get token estimate for delta prompt
 * @param intent - Intent type
 * @param isFollowUp - Whether this is a follow-up turn
 * @returns Estimated token count
 */
export function getApexDeltaTokenEstimate(
  intent: ApexIntent,
  isFollowUp: boolean = false
): number {
  if (intent === 'MULTI_DOMAIN' && isFollowUp) {
    return 25; // Compressed followup
  }

  const estimates: Record<ApexIntent, number> = {
    INSTANT: 20,
    ANALYTICAL: 35,
    STRATEGIC: 40,
    CREATIVE: 40,
    MULTI_DOMAIN: 45,
  };

  return estimates[intent] || 25;
}

// ============================================================================
// RESPONSE GUIDELINES
// ============================================================================

/**
 * Get response length guidance for intent
 * Apex has NO hard limits - these are quality hints
 */
export function getResponseGuidance(intent: ApexIntent): {
  minLines: number;
  suggestedLines: number;
  maxTokens: number;
  style: string;
} {
  switch (intent) {
    case 'INSTANT':
      return {
        minLines: 2,
        suggestedLines: 5,
        maxTokens: 300,
        style: 'concise and direct',
      };

    case 'ANALYTICAL':
      return {
        minLines: 8,
        suggestedLines: 20,
        maxTokens: 1000,
        style: 'thorough and structured',
      };

    case 'STRATEGIC':
      return {
        minLines: 10,
        suggestedLines: 25,
        maxTokens: 1200,
        style: 'comprehensive and advisory',
      };

    case 'CREATIVE':
      return {
        minLines: 8,
        suggestedLines: 20,
        maxTokens: 1000,
        style: 'original and inspiring',
      };

    case 'MULTI_DOMAIN':
      return {
        minLines: 15,
        suggestedLines: 30,
        maxTokens: 1500,
        style: 'multi-perspective synthesis',
      };

    default:
      return {
        minLines: 3,
        suggestedLines: 10,
        maxTokens: 500,
        style: 'balanced',
      };
  }
}

// ============================================================================
// EXTENDED DELTAS (Context-specific enhancements)
// ============================================================================

/**
 * Extended delta prompts for specific sub-contexts
 * These APPEND to base delta for enhanced responses
 */
export const APEX_EXTENDED_DELTAS = {
  // STRATEGIC sub-types
  STRATEGIC_INVESTMENT: `Focus on ROI, risk-adjusted returns, and capital efficiency.
Consider market timing and competitive moats.`,

  STRATEGIC_GROWTH: `Prioritize sustainable growth over vanity metrics.
Consider customer acquisition cost and lifetime value.`,

  STRATEGIC_EXIT: `Think from acquirer/investor perspective.
Highlight value drivers and potential deal structures.`,

  // CREATIVE sub-types
  CREATIVE_BRAND: `Ensure brand consistency and emotional resonance.
Consider target audience psychology and market positioning.`,

  CREATIVE_CONTENT: `Optimize for engagement and shareability.
Balance creativity with platform-specific best practices.`,

  CREATIVE_PRODUCT: `Focus on user delight and differentiation.
Consider technical feasibility alongside innovation.`,

  // MULTI_DOMAIN sub-types
  MULTI_DOMAIN_TECH_BUSINESS: `Bridge technical depth with business impact.
Translate complexity into executive-friendly insights.`,

  MULTI_DOMAIN_DESIGN_ENGINEERING: `Balance user experience with engineering constraints.
Propose solutions that satisfy both perspectives.`,
};

/**
 * Get delta with context enhancement
 * @param intent - Classified intent type
 * @param context - Optional context for sub-type selection
 * @param options - Additional options
 * @returns Enhanced delta prompt
 */
export function getApexDeltaWithContext(
  intent: ApexIntent,
  context?: {
    isInvestment?: boolean;
    isGrowth?: boolean;
    isExit?: boolean;
    isBrand?: boolean;
    isContent?: boolean;
    isProduct?: boolean;
    isTechBusiness?: boolean;
    isDesignEngineering?: boolean;
  },
  options?: {
    isFollowUp?: boolean;
  }
): string {
  // Get base delta
  let delta = getApexDelta(intent, options);

  // Skip enhancement for followup or instant
  if (options?.isFollowUp || intent === 'INSTANT' || !context) {
    return delta;
  }

  // APPEND context-specific enhancement
  if (intent === 'STRATEGIC') {
    if (context.isInvestment) {
      delta = `${delta}\n${APEX_EXTENDED_DELTAS.STRATEGIC_INVESTMENT}`;
    } else if (context.isGrowth) {
      delta = `${delta}\n${APEX_EXTENDED_DELTAS.STRATEGIC_GROWTH}`;
    } else if (context.isExit) {
      delta = `${delta}\n${APEX_EXTENDED_DELTAS.STRATEGIC_EXIT}`;
    }
  } else if (intent === 'CREATIVE') {
    if (context.isBrand) {
      delta = `${delta}\n${APEX_EXTENDED_DELTAS.CREATIVE_BRAND}`;
    } else if (context.isContent) {
      delta = `${delta}\n${APEX_EXTENDED_DELTAS.CREATIVE_CONTENT}`;
    } else if (context.isProduct) {
      delta = `${delta}\n${APEX_EXTENDED_DELTAS.CREATIVE_PRODUCT}`;
    }
  } else if (intent === 'MULTI_DOMAIN') {
    if (context.isTechBusiness) {
      delta = `${delta}\n${APEX_EXTENDED_DELTAS.MULTI_DOMAIN_TECH_BUSINESS}`;
    } else if (context.isDesignEngineering) {
      delta = `${delta}\n${APEX_EXTENDED_DELTAS.MULTI_DOMAIN_DESIGN_ENGINEERING}`;
    }
  }

  return delta;
}

// ============================================================================
// ALL DELTAS (For debugging/admin)
// ============================================================================

/**
 * Get all delta prompts
 */
export function getAllApexDeltas(): Record<ApexIntent, string> {
  return {
    INSTANT: APEX_INSTANT,
    ANALYTICAL: APEX_ANALYTICAL,
    STRATEGIC: APEX_STRATEGIC,
    CREATIVE: APEX_CREATIVE,
    MULTI_DOMAIN: APEX_MULTI_DOMAIN,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  APEX_INSTANT,
  APEX_ANALYTICAL,
  APEX_STRATEGIC,
  APEX_CREATIVE,
  APEX_MULTI_DOMAIN,
  APEX_MULTI_DOMAIN_FOLLOWUP,
};

export default getApexDelta;