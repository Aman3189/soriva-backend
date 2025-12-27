// src/constants/plans.ts

/**
 * ==========================================
 * SORIVA V3 - FINALIZED PLANS CONFIGURATION
 * ==========================================
 * Complete pricing, token allocation, and booster strategy
 * Last Updated: December 19, 2025 - PRODUCTION READY v8.0 *
 * ==========================================
 * v7.3 CHANGELOG (December 13, 2025):
 * ==========================================
 * ✅ GEMINI 2.5 FLASH PRICING FIX:
 *    - Old: $0.10/$0.40 → New: $0.30/$2.50 (6.5x increase)
 *
 * ✅ INDIA ROUTING CHANGES:
 *    - PLUS Monthly: Flash-Lite 60% + Kimi 40%
 *    - PRO Yearly: Flash 60% + Haiku 40% (Premium!)
 *    - APEX Yearly: Flash 50% + Haiku 40% + GPT 10%
 *
 * ✅ INTERNATIONAL CHANGES:
 *    - PLUS: Removed GPT-5.1, added to Haiku (33%)
 *    - Voice 2x: PLUS 60min, PRO 90min, APEX 120min
 *
 * ✅ CAMERA FEATURE (OnAir):
 *    - India: PLUS 5min, PRO 6min, APEX 10min
 *    - International: PLUS 10min, PRO 12min, APEX 20min
 *
 * ✅ YEARLY TOKEN STRATEGY:
 *    - 11 months tokens + 12 months platform access
 *    - Marketing: "2 Months FREE!"
 *
 * ==========================================
 * MAJOR UPDATE v7.0 CHANGELOG:
 * ==========================================
 * ✅ NEW MARGIN STRUCTURE (Market Building Focus):
 *    - India PLUS/PRO: 25% margin (was ~55%/47%)
 *    - India APEX: 15% margin (was ~27%)
 *    - International ALL: 35% margin (was ~53-63%)
 *
 * ✅ MASSIVE TOKEN INCREASES:
 *    - PLUS India: 750K → 1.18M (+57%)
 *    - PRO India: 1.1M → 1.6M (+45%)
 *    - APEX India: 1.6M → 2.47M (+54%)
 *    - PLUS Intl: 1.5M → 2.25M (+50%)
 *    - PRO Intl: 2.5M → 4.65M (+86%)
 *    - APEX Intl: 3.2M → 6.2M (+94%)
 *
 * ✅ CLAUDE SONNET 4.5 STRATEGY:
 *    - REMOVED from India APEX (cost optimization)
 *    - KEPT in International APEX (premium USP)
 *
 * ✅ PROMPT TOKEN BUFFER:
 *    - 100 tokens system prompt = 0.05-0.25% daily impact
 *    - Safe limit: 200-500 tokens depending on plan
 *
 * ✅ STARTER PROTECTION:
 *    - Added abuse protection constants
 *    - Rate limiting, IP throttling configs
 *
 * ==========================================
 * APEX PLAN HIGHLIGHTS:
 * ==========================================
 * INDIA (₹1,299) - v8.0:
 * - Monthly Tokens: 2,750,000 (was 2.47M)
 * - Routing: Flash 41.1% | Kimi K2 41.1% | Gemini Pro 6.9% | GPT-5.1 10.9%
 * - Claude Sonnet: REMOVED (redistributed to cheaper models)
 * - Studio Credits: 1000
 * - Voice Minutes: 60
 * - Seek Searches: 50
 * - Memory Days: 30
 * - Margin: 16%
 *
 * INTERNATIONAL ($69.99) - v8.0:
 * - Monthly Tokens: 6,769,400 (was 6.2M)
 * - Routing: Kimi K2 35.2% | GPT-5.1 32.8% | Flash 17.2% | Claude Sonnet 7.4% | Gemini 3 Pro 7.4%
 * - Studio Credits: 3,000
 * - Seek Searches: 250
 * - EXCLUSIVE: Claude Sonnet 4.5 + Gemini 3 Pro access!
 * - Margin: 25%
 *
 * ==========================================
 * PRICING STRUCTURE:
 * ==========================================
 * ┌───────────┬──────────┬──────────────┬──────────────────┐
 * │ Plan      │ India    │ Intl Monthly │ Intl Yearly      │
 * ├───────────┼──────────┼──────────────┼──────────────────┤
 * │ Starter   │ Free     │ Free         │ -                │
 * │ Plus      │ ₹299     │ $13.99       │ $139.99 (17%off) │
 * │ Pro       │ ₹799     │ $35.99       │ $359.99 (17%off) │
 * │ Apex      │ ₹1,299   │ $69.99       │ $699.99 (17%off) │
 * └───────────┴──────────┴──────────────┴──────────────────┘
 * ==========================================
 * MARGIN TARGETS (Conservative 10:90 ratio):
 * ==========================================
 * - Starter: Loss leader (acquisition)
 * - Plus India: 25% margin (locked)
 * - Plus International: 35% margin (locked)
 * - Pro India: 25% margin (locked)
 * - Pro International: 35% margin (locked)
 * - Apex India: 15% margin (locked, quality focus)
 * - Apex International: 35% margin (locked)
 * - Cooldown Boosters: 97%+ margin (uses own tokens)
 * - Addon Boosters: 85%+ margin
 * - Studio Boosters: 83-88% margin
 *
 * ==========================================
 * BOOSTER PRICING SUMMARY:
 * ==========================================
 * COOLDOWN (Instant daily limit unlock, 97%+ margin):
 * - Starter: ₹15 (10K tokens)
 * - Plus: ₹15 / $1 (78.6K tokens - 2× daily)
 * - Pro: ₹25 / $1 (106.6K tokens - 2× daily)
 * - Apex: ₹35 / $1 (164.6K tokens - 2× daily)
 *
 * ADDON (7-day validity, 85%+ margin):
 * - Plus: ₹79 / $2.99 (100K flash tokens)
 * - Pro: ₹139 / $4.99 (50K premium + 120K flash = 170K total)
 * - Apex: ₹299 / $7.99 (150K premium + 150K flash = 300K total)
 *
 * ==========================================
 * MODEL COSTS REFERENCE (INR per 1M @ 10:90):
 * ==========================================
 * - Gemini 2.5 Flash Lite: ₹32.56
 * - Gemini 2.5 Flash: ₹210.70 (UPDATED)
 * - Kimi K2: ₹206.58 (replaces Claude Haiku, 50% cheaper)
 * - Gemini 2.5 Pro: ₹810.27
 * - Gemini 3 Pro: ₹982.03
 * - GPT-5.1: ₹810.27 (FLAT pricing, no tiers)
 * - Claude Sonnet 4.5: ₹1,217.87 (base tier <200K)
 *
 * ==========================================
 * TECHNICAL NOTES:
 * ==========================================
 * - USD to INR rate: ₹89.33 (market rate)
 * - Gateway fees: Razorpay 2.36% | Stripe 2.9% + $0.30
 * - Infrastructure cost: ₹20/user for paid plans
 * - Voice cost: ₹45 for all paid plans (20:80 STT:TTS)
 * - Studio credit cost: ₹0.0408 per credit (GPU)
 * - All margins calculated at 10:90 input:output ratio
 * - Real-world margins expected 5-10% higher (20:80 actual)
 *
 * ==========================================
 * FUTURE: DYNAMIC BONUS SYSTEM (Phase 2)
 * ==========================================
 * - Track actual input:output ratios per user
 * - Users with higher input ratios get bonus tokens
 * - FOMO display ready for frontend
 */

// ==========================================
// IMPORTS FROM PRISMA ENUMS
// ==========================================

import {
  PlanType,
  BoosterCategory,
  planTypeToName,
} from '@shared/types/prisma-enums';

// ==========================================
// APP-SPECIFIC ENUMS
// ==========================================

/**
 * AI Provider enumeration
 * Defines all supported AI model providers
 */
export enum AIProvider {
  OPENROUTER = 'openrouter',  // ← Replace GROQ
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  OPENAI = 'openai',
  MOONSHOT = 'moonshot',
  KRUTRIM = 'krutrim',
}
/**
 * Studio preview configuration
 * Controls free preview limits and costs
 */
export const STUDIO_FREE_PREVIEWS = 3;
export const STUDIO_EXTRA_PREVIEW_COST = 5;
export const STUDIO_MAX_PREVIEWS = 10;

/**
 * Region enumeration
 * Used for pricing and feature differentiation
 */
export enum Region {
  INDIA = 'IN',
  INTERNATIONAL = 'INTL',
}
export enum VoiceTechnology {
  NONE = 'NONE',                    // No voice (Starter)
  ONAIR = 'ONAIR',                  // Gemini Live API (Pro/Apex)
}
/**
 * Currency enumeration
 * Supported currencies for billing
 */
export enum Currency {
  INR = 'INR',
  USD = 'USD',
}
export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
/**
 * Document Intelligence tier types
 * Defines available documentation feature tiers
 */
export type DocumentIntelligenceTier =
  | 'standard'
  | 'pro'
  | 'apex';

// ==========================================
// 🌍 CURRENCY CONSTANTS
// ==========================================

/**
 * Currency symbols for display
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.INR]: '₹',
  [Currency.USD]: '$',
};

/**
 * Exchange rates
 * Updated: December 2025
 * Source: Market rate (not hardcoded ₹82)
 */
export const INR_TO_USD_RATE = 0.0112;
export const USD_TO_INR_RATE = 89.33;

/**
 * Region to currency mapping
 */
export const REGION_CURRENCY_MAP: Record<Region, Currency> = {
  [Region.INDIA]: Currency.INR,
  [Region.INTERNATIONAL]: Currency.USD,
};

/**
 * Region to payment gateway mapping
 * India uses Razorpay, International uses Stripe
 */
export const REGION_PAYMENT_GATEWAY: Record<Region, string> = {
  [Region.INDIA]: 'razorpay',
  [Region.INTERNATIONAL]: 'stripe',
};

// ==========================================
// 🎯 TOKEN RATIO CONSTANTS
// ==========================================

/**
 * Token to word conversion ratios by model
 * Used for accurate usage tracking and display
 *
 * Ratios vary based on:
 * - Model tokenizer efficiency
 * - Language (English vs Hinglish)
 *
 * Lower ratio = more efficient tokenization
 */
export const TOKEN_RATIOS = {
  'gemini-2.5-flash-lite': {
    english: 1.3,
    hinglish: 1.5,
    average: 1.5,
  },
  'gemini-2.5-flash': {
    english: 1.3,
    hinglish: 1.5,
    average: 1.5,
  },
  'claude-sonnet-4-5': {
    english: 1.4,
    hinglish: 1.6,
    average: 1.6,
  },
  'gemini-2.5-pro': {
    english: 1.3,
    hinglish: 1.5,
    average: 1.5,
  },
  'gemini-3-pro': {
    english: 1.3,
    hinglish: 1.5,
    average: 1.5,
  },
  'gpt-5.1': {
    english: 1.3,
    hinglish: 1.5,
    average: 1.5,
  },
  'moonshotai/kimi-k2-thinking': {
    english: 1.2,
    hinglish: 1.4,
    average: 1.35,
  },
} as const;

/**
 * Get token ratio for a specific model
 * @param modelId - The model identifier
 * @returns Token ratio (default 1.3 if model not found)
 */
export function getTokenRatio(modelId: string): number {
  return TOKEN_RATIOS[modelId as keyof typeof TOKEN_RATIOS]?.average || 1.3;
}

// ==========================================
// 🤖 SMART ROUTING TIERS
// ==========================================

/**
 * Routing tier enumeration
 * Defines complexity levels for intelligent model selection
 *
 * CASUAL: Simple greetings, basic queries
 * SIMPLE: Straightforward questions, basic tasks
 * MEDIUM: Moderate complexity, some reasoning
 * COMPLEX: Advanced reasoning, analysis
 * EXPERT: Highest complexity, specialized tasks
 */
export enum RoutingTier {
  CASUAL = 'CASUAL',
  SIMPLE = 'SIMPLE',
  MEDIUM = 'MEDIUM',
  COMPLEX = 'COMPLEX',
  EXPERT = 'EXPERT',
}

// ==========================================
// 💵 AI MODEL PRICING (USD per 1M tokens)
// ==========================================

/**
 * AI Model Pricing Configuration
 * Updated: December 2025
 *
 * IMPORTANT NOTES:
 * 1. Using 10:90 input:output ratio for cost calculations
 *    This is conservative (worst-case) and ensures profitability
 *    Real-world usage is typically 20:80 to 30:70
 *
 * 2. Some models have tiered pricing (base vs >200K context)
 *    We keep allocations under 200K to use base tier pricing
 *
 * 3. GPT-5.1 has FLAT pricing (no context tiers)
 *
 * 4. Kimi K2 replaced Claude Haiku (50% cost reduction)
 */
export const MODEL_PRICING_USD = {
  // Gemini Flash Lite - Fastest, cheapest
  'gemini-2.5-flash-lite': {
    inputPer1M: 0.10,
    outputPer1M: 0.40,
  },

  // Gemini Flash - Fast, affordable
  'gemini-2.5-flash': {
  inputPer1M: 0.30,
  outputPer1M: 2.50,
  },

  // Claude Sonnet 4.5 - Premium reasoning (tiered pricing)
  'claude-sonnet-4-5': {
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    inputPer1MOver200K: 6.00,      // 2× base rate
    outputPer1MOver200K: 22.50,    // 1.5× base rate
  },

  // Gemini 2.5 Pro - Advanced reasoning (tiered pricing)
  'gemini-2.5-pro': {
    inputPer1M: 1.25,
    outputPer1M: 10.00,
    inputPer1MOver200K: 2.50,
    outputPer1MOver200K: 15.00,
  },

  // Gemini 3 Pro - Latest generation (tiered pricing)
  'gemini-3-pro': {
    inputPer1M: 2.00,
    outputPer1M: 12.00,
    inputPer1MOver200K: 4.00,
    outputPer1MOver200K: 18.00,
  },

  // GPT-5.1 - OpenAI flagship (FLAT pricing - no tiers!)
  'gpt-5.1': {
    inputPer1M: 1.25,
    outputPer1M: 10.00,
  },
  'claude-haiku-4-5': {
   inputPer1M: 1.00,
   outputPer1M: 5.00,
  },

  // Kimi K2 - Cost-effective reasoning (replaces Claude Haiku)
  'moonshotai/kimi-k2-thinking': {
    inputPer1M: 0.60,
    outputPer1M: 2.50,
  },
  // DeepSeek R1 8B via Krutrim - Ultra cheap for STARTER
  'deepseek-r1-8b': {
    inputPer1M: 0.0336,   // ₹3 per 1M = $0.0336
    outputPer1M: 0.0336,  // ₹3 per 1M = $0.0336
  },
} as const;

/**
 * Calculate effective cost per 1M tokens at 10:90 input:output ratio
 * This gives us worst-case cost estimation for margin calculations
 *
 * Formula: (inputCost × 0.1) + (outputCost × 0.9)
 *
 * @param modelId - The model identifier
 * @returns Cost in INR per 1M tokens
 */
function calculateEffectiveCost(modelId: string): number {
  const pricing = MODEL_PRICING_USD[modelId as keyof typeof MODEL_PRICING_USD];
  if (!pricing) return 0;

  // Calculate weighted cost at 10:90 ratio
  const effectiveCostUSD = (pricing.inputPer1M * 0.1) + (pricing.outputPer1M * 0.9);

  // Convert to INR
  return effectiveCostUSD * USD_TO_INR_RATE;
}

/**
 * Pre-calculated model costs in INR per 1M tokens
 * Using 10:90 input:output ratio (conservative)
 *
 * These values are used throughout the application
 * for cost calculations and margin analysis
 */
export const MODEL_COSTS_INR_PER_1M = {
  'gemini-2.5-flash-lite': calculateEffectiveCost('gemini-2.5-flash-lite'),   // ~₹32.56
  'gemini-2.5-flash': calculateEffectiveCost('gemini-2.5-flash'),             // ~₹203.67
  'claude-sonnet-4-5': calculateEffectiveCost('claude-sonnet-4-5'),           // ~₹1,217.87
  'gemini-2.5-pro': calculateEffectiveCost('gemini-2.5-pro'),                 // ~₹810.27
  'gemini-3-pro': calculateEffectiveCost('gemini-3-pro'),                     // ~₹982.03
  'gpt-5.1': calculateEffectiveCost('gpt-5.1'),                               // ~₹810.27
  'claude-haiku-4-5': calculateEffectiveCost('claude-haiku-4-5'),             // ~₹410.92
  'moonshotai/kimi-k2-thinking': calculateEffectiveCost('moonshotai/kimi-k2-thinking'), // ~₹206.58
  'deepseek-r1-8b': calculateEffectiveCost('deepseek-r1-8b'), 
} as const;

// ==========================================
// 🧠 LLM ROUTING CONFIGURATION
// ==========================================

/**
 * Default model routing by complexity tier
 * Maps each routing tier to its primary and fallback models
 *
 * Fallback chain ensures service continuity:
 * EXPERT → COMPLEX → MEDIUM → SIMPLE → CASUAL
 */
export const LLM_ROUTING_CONFIG = {
  [RoutingTier.CASUAL]: {
    model: 'gemini-2.5-flash',
    provider: AIProvider.GEMINI,
    displayName: 'Gemini Flash',
    fallbackModel: 'gemini-2.5-flash-lite',
  },
  [RoutingTier.SIMPLE]: {
    model: 'moonshotai/kimi-k2-thinking',
    provider: AIProvider.MOONSHOT,
    displayName: 'Kimi K2',
    fallbackModel: 'gemini-2.5-flash',
  },
  [RoutingTier.MEDIUM]: {
    model: 'gemini-2.5-pro',
    provider: AIProvider.GEMINI,
    displayName: 'Gemini 2.5 Pro',
    fallbackModel: 'moonshotai/kimi-k2-thinking',
  },
  [RoutingTier.COMPLEX]: {
    model: 'claude-sonnet-4-5',
    provider: AIProvider.CLAUDE,
    displayName: 'Claude Sonnet 4.5',
    fallbackModel: 'gemini-2.5-pro',
  },
  [RoutingTier.EXPERT]: {
    model: 'gpt-5.1',
    provider: AIProvider.OPENAI,
    displayName: 'GPT-5.1',
    fallbackModel: 'gemini-2.5-pro',
  },
} as const;

// Re-export Prisma enums for convenience
export { PlanType, BoosterCategory, planTypeToName };


// ==========================================
// 💰 COST CALCULATION HELPERS
// ==========================================

/**
 * Calculate AI cost for a specific model and token count
 *
 * @param modelId - The model identifier
 * @param tokens - Number of tokens
 * @returns Cost in INR
 */
function calculateModelCost(modelId: string, tokens: number): number {
  const costPer1M = MODEL_COSTS_INR_PER_1M[modelId as keyof typeof MODEL_COSTS_INR_PER_1M] || 0;
  return (tokens / 1_000_000) * costPer1M;
}

/**
 * Calculate total AI cost based on routing distribution
 *
 * @param premiumTokens - Total tokens to distribute
 * @param routing - Model routing percentages (must sum to 1.0)
 * @returns Total cost in INR
 *
 * @example
 * calculateRoutingCost(1000000, {
 *   'gemini-2.5-flash': 0.45,
 *   'gpt-5.1': 0.30,
 *   'gemini-2.5-pro': 0.25,
 * })
 */
function calculateRoutingCost(
  premiumTokens: number,
  routing: Record<string, number>
): number {
  let totalCost = 0;

  for (const [modelId, percentage] of Object.entries(routing)) {
    const tokensForModel = premiumTokens * percentage;
    totalCost += calculateModelCost(modelId, tokensForModel);
  }

  return totalCost;
}

// ==========================================
// 🏦 GATEWAY & INFRASTRUCTURE COSTS
// ==========================================

/**
 * Payment gateway fee percentages
 */
export const GATEWAY_FEE_PERCENTAGE = 2.36;           // Razorpay (India)
export const GATEWAY_FEE_STRIPE_PERCENTAGE = 2.9;    // Stripe (International)
export const GATEWAY_FEE_STRIPE_FIXED_USD = 0.30;    // Stripe fixed fee per transaction

/**
 * Infrastructure costs per user per month (INR)
 * Covers: servers, databases, CDN, monitoring, etc.
 */
export const INFRASTRUCTURE_COSTS = {
  starter: 5,    // Minimal for free users
  paid: 20,      // Full infrastructure for paid users
} as const;

/**
 * Voice feature costs per month (INR)
 * Based on 20:80 STT:TTS ratio
 */
export const VOICE_COSTS = {
  perPaidPlan: 45,  // Budget allocation per paid plan
  onair: {
    perMinute: 1.42,           // Gemini Live API (Audio only)
    description: 'Soriva OnAir - Real-time AI',
  },
  camera: {
    perMinute: 5.04,           // Gemini Live API (Audio + Video)
    description: 'Soriva OnAir Camera - Real-time vision',
  },
} as const;

export const SEEK_LIMITS = {
  IN: {
    STARTER: 0,
    PLUS: 10,
    PRO: 30,
    APEX: 50,
  },
  INTL: {
    STARTER: 0,
    PLUS: 150,  // "Unlimited" - Updated!
    PRO: 200,
    APEX: 250,
  },
  costPerSearch: 0.42,
} as const;

export const STUDIO_CREDIT_COST = 0.0408;
export const STUDIO_CREDIT_VALUE = STUDIO_CREDIT_COST;

// ==========================================
// 📋 INTERFACES & TYPE DEFINITIONS
// ==========================================

/**
 * AI Model configuration interface
 * Defines a single AI model with its routing properties
 */
export interface AIModel {
  /** AI provider (gemini, openai, claude, etc.) */
  provider: AIProvider;
  /** Model identifier string */
  modelId: string;
  /** Human-readable display name */
  displayName: string;
  /** Routing complexity tier */
  tier?: RoutingTier;
  /** Percentage of tokens allocated to this model (0-100) */
  percentage?: number;
  /** Whether this is a fallback model */
  fallback?: boolean;
}

/**
 * Trial configuration interface
 * Defines trial period settings for plans
 */
export interface TrialConfig {
  /** Whether trial is enabled */
  enabled: boolean;
  /** Trial duration in days */
  durationDays: number;
  /** Total tokens available during trial */
  totalTokens: number;
  /** Total words available during trial */
  totalWords: number;
  /** Daily token limit during trial */
  dailyTokens: number;
  /** Daily word limit during trial */
  dailyWords: number;
}

/**
 * Bonus limits interface
 * Defines bonus allocations for special models
 */
export interface BonusLimits {
  /** Bonus tokens allocated */
  bonusTokens: number;
  /** Model to use for bonus tokens */
  bonusModel: string;
  /** Provider for bonus model */
  bonusProvider: AIProvider;
  /** Description of bonus feature */
  description: string;
}

/**
 * Cooldown Booster interface
 * Instant daily limit unlock - uses user's own monthly tokens
 * 97%+ profit margin (only gateway fees as cost)
 */
/**
 * Cooldown Booster interface
 * Instant daily limit unlock
 */
export interface CooldownBooster {
  /** Booster type identifier */
  type: 'COOLDOWN';
  /** Internal name */
  name: string;
  /** User-facing description */
  description: string;
  /** Price in INR */
  price: number;
  /** Price in USD (international) */
  priceUSD?: number;
  /** Tokens unlocked instantly (India) */
  tokensUnlocked: number;
  /** Tokens unlocked instantly (International) */
  tokensUnlockedInternational?: number;
  /** Extra tokens for international (separate from pool) */
  extraTokensInternational?: number;
  /** Whether international tokens are extra (not from pool) */
  isExtraInternational?: boolean;
  /** Ideogram images for international booster */
  ideogramImagesInternational?: number;
  /** Validity hours (India) */
  validityHours?: number;
  /** Validity hours (International) */
  validityHoursInternational?: number;
  /** Activation window in hours - time to start using booster */
  activationWindow?: number;
  /** Whether unused tokens carry forward till plan end */
  carryForward?: boolean;
  /** Expiry logic - when tokens expire */
  expiryLogic?: 'plan_renewal' | 'strict_expiry';
  /** Words equivalent unlocked (India) */
  wordsUnlocked: number;
  /** Words equivalent unlocked (International) */
  wordsUnlockedInternational?: number;
  /** Logic explanation */
  logic: string;
  /** Duration in hours (0 = instant) */
  duration: number;
  /** Maximum purchases per plan period */
  maxPerPlanPeriod: number;
  /** When the counter resets */
  resetOn: 'plan_renewal' | 'calendar';
  /** Progressive pricing multipliers (optional) */
  progressiveMultipliers?: number[];
  /** Cost breakdown (India) */
  costs: {
    ai: number;
    buffer?: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
  /** Cost breakdown (International) */
  costsInternational?: {
    ai: number;
    buffer?: number;
    ideogram?: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
}

/**
 * Addon Booster interface
 * Additional token packages with 7-day validity
 * 85%+ profit margin
 */
/**
 * Addon Booster interface
 * Additional token packages with validity period
 * Separate pool for extra tokens
 */
/**
 * Addon Booster interface
 * Additional token packages with validity period
 * Separate pool for extra tokens
 */
export interface AddonBooster {
  /** Booster type identifier */
  type: 'ADDON';
  /** Internal name */
  name: string;
  /** User-facing description */
  description: string;
  /** Price in INR */
  price: number;
  /** Price in USD (international) */
  priceUSD?: number;
  /** Premium model tokens included */
  premiumTokens: number;
  /** Flash model tokens included */
  flashTokens: number;
  /** Total tokens in package (India) */
  totalTokens: number;
  /** Total tokens in package (International) */
  totalTokensInternational?: number;
  /** Studio credits (India) */
  studioCredits?: number;
  /** Studio credits (International) */
  studioCreditsInternational?: number;
  /** Seek searches (India) */
  seekSearches?: number;
  /** Seek searches (International) */
  seekSearchesInternational?: number;
  /** Voice minutes (International) */
  voiceMinutesInternational?: number; // ✅ NEW
  /** Daily boost amount (totalTokens / validity) */
  dailyBoost: number;
  /** Validity in days (India) */
  validity: number;
  /** Validity in days (International) */
  validityInternational?: number;
  /** Validity logic explanation */
  validityLogic?: string;
  /** Distribution logic explanation */
  distributionLogic: string;
  /** Maximum purchases per month (India) */
  maxPerMonth: number;
  /** Maximum purchases per month (International) */
  maxPerMonthInternational?: number;
  /** Whether multiple boosters can be queued */
  queueingAllowed: boolean;
  /** Whether tokens go to separate pool */
  separatePool: boolean;
  /** Words added (optional) */
  wordsAdded?: number;
  /** Tokens added (optional) */
  tokensAdded?: number;
  /** Credits added (optional) */
  creditsAdded?: number;
  /** Cost breakdown (India) */
  costs: {
    ai: number;
    buffer?: number;
    seek?: number;
    studioCredits?: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
  /** Cost breakdown (International) */
  costsInternational?: {
    ai: number;
    studioCredits?: number;
    seek?: number;
    voice?: number; // ✅ NEW
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
}

/**
 * Studio feature limits interface
 * Defines limits for each studio feature type
 */
export interface StudioLimits {
  /** AI image generation limit */
  images: number;
  /** Talking photo generation limit */
  talkingPhotos: number;
  /** Logo preview generations */
  logoPreview: number;
  /** Logo final purchase limit */
  logoPurchase: number;
}

/**
 * Usage limits interface
 * Comprehensive usage limits for a plan
 */
export interface UsageLimits {
  /** Monthly token allocation */
  monthlyTokens: number;
  /** Monthly word equivalent */
  monthlyWords: number;
  /** Daily token limit */
  dailyTokens: number;
  /** Daily word equivalent */
  dailyWords: number;
  /** Maximum bot response length */
  botResponseLimit: number;
  /** Memory retention in days */
  memoryDays: number;
  /** Context memory messages */
  contextMemory: number;
  /** Response delay in seconds */
  responseDelay: number;
  /** Voice minutes per month */
  voiceMinutes: number;
  /** Camera minutes per month (from voice pool) */
  cameraMinutes: number;
  /** Voice technology type */
  voiceTechnology?: VoiceTechnology;
  /** Studio feature limits */
  studio: StudioLimits;
  /** Studio credits allocation */
  studioCredits?: number;
  /** Monthly seek searches allowed */
  seekSearches?: number; // ✅ NEW
  /** Whether unused tokens carry forward */
  carryForward?: boolean;
  /** Percentage of unused tokens to carry forward */
  carryForwardPercent?: number;
  /** Maximum months tokens can accumulate */
  carryForwardMaxMonths?: number;
}

/**
 * Advanced features interface
 * Premium features for APEX plan (merged EDGE + LIFE)
 */
export interface AdvancedFeatures {
  // Business Intelligence (from EDGE)
  /** Smart workflow automation */
  smartWorkflow?: boolean;
  /** AI-powered document tagging */
  aiTagging?: boolean;
  /** Decision snapshot capture */
  decisionSnapshot?: boolean;
  /** Legal and finance document analysis */
  legalFinanceLens?: boolean;
  /** Multi-format document fusion */
  multiformatFusion?: boolean;
  /** Business context memory */
  businessContextMemory?: boolean;
  /** Voice to action conversion */
  voiceToAction?: boolean;

  // Emotional Intelligence (from LIFE)
  /** Emotional context summarizer */
  emotionalContextSummarizer?: boolean;
  /** Memory capsule creation */
  memoryCapsule?: boolean;
  /** Companion notes feature */
  companionNotes?: boolean;
  /** Thought organizer */
  thoughtOrganizer?: boolean;
  /** AI scrapbook */
  aiScrapbook?: boolean;
  /** Life reflection insights */
  lifeReflectionInsights?: boolean;
  /** Handwriting emotion reader */
  handwritingEmotionReader?: boolean;
}

/**
 * Document Intelligence interface
 * Documentation workspace features per tier
 */
export interface DocumentIntelligence {
  /** Whether feature is enabled */
  enabled: boolean;
  /** Feature tier level */
  tier: DocumentIntelligenceTier;
  /** Display name for UI */
  displayName: string;
  /** Badge emoji/text */
  badge: string;
  /** Marketing tagline */
  tagline?: string;
  /** Monthly Smart Docs credits (India) */
  monthlyCredits?: number;
  /** Monthly Smart Docs credits (International) */
  monthlyCreditsInternational?: number;
  /** Monthly word limit for documents (legacy) */
  monthlyWords: number;
  /** Maximum workspaces allowed */
  maxWorkspaces: number;
  /** Maximum file size in MB */
  maxFileSizeMB?: number;
  /** Number of features unlocked */
  featuresUnlocked?: number;
  /** Primary model for Smart Docs */
  model?: string;
  /** Premium model for advanced features */
  modelPremium?: string;
  /** Expert model (region-specific for APEX) */
  modelExpert?: string | { IN: string; INTL: string };
  /** Supported export formats */
  exportFormats: string[];
  /** Templates available */
  templates: boolean;
  /** Version history depth (0 = unlimited) */
  versionHistory: number;
  /** Collaboration enabled */
  collaboration: boolean;
  /** Advanced features (APEX only) */
  advancedFeatures?: AdvancedFeatures;
}

/**
 * Plan costs interface
 * Complete cost breakdown for margin analysis
 */
export interface PlanCosts {
  /** AI cost for premium models */
  aiCostPremium: number;
  /** Total AI cost */
  aiCostTotal: number;
  /** Studio feature cost */
  studioCostTotal: number;
  /** Payment gateway cost */
  gatewayCost: number;
  /** Infrastructure cost per user */
  infraCostPerUser: number;
  /** Voice feature cost */
  voiceCost: number;
  /** Total cost */
  totalCost: number;
  /** Revenue (plan price) */
  revenue: number;
  /** Profit (revenue - totalCost) */
  profit: number;
  /** Margin percentage */
  margin: number;
}

/**
 * Main Plan interface
 * Complete plan configuration
 */
/**
 * Plan interface
 * Complete plan configuration with all features
 */
export interface Plan {
  /** Plan type enum value */
  id: PlanType;
  /** Internal plan name */
  name: string;
  /** Display name for UI */
  displayName: string;
  /** AI models for International users */
  aiModelsInternational?: AIModel[];
  /** Marketing tagline */
  tagline: string;
  /** Plan description */
  description: string;
  /** Price in INR */
  price: number;
  /** Price in USD */
  priceUSD?: number;
  /** Yearly price in INR */
  priceYearly?: number;
  /** Yearly price in USD */
  priceYearlyUSD?: number;
  /** Yearly discount percentage (India) */
  yearlyDiscount?: number;
  /** Yearly discount percentage (International) */
  yearlyDiscountInternational?: number;
  /** Whether plan is enabled */
  enabled: boolean;
  /** Whether to show "Popular" badge */
  popular?: boolean;
  /** Whether this is the hero/featured plan */
  hero?: boolean;
  /** Display order (1-4) */
  order: number;
  /** AI personality description */
  personality: string;
  /** Trial configuration */
  trial?: TrialConfig;
  /** Usage limits (India Monthly) */
  limits: UsageLimits;
  /** Usage limits (International Monthly) */
  limitsInternational?: UsageLimits;
  /** Usage limits (India Yearly) */
  limitsYearly?: UsageLimits;
  /** Usage limits (International Yearly) */
  limitsYearlyInternational?: UsageLimits;
  /** Bonus tokens for backup pool (activates when premium exhausted) */
  bonusTokens: number;
  /** Bonus limits configuration */
  bonusLimits?: BonusLimits;
  /** Available AI models (India) */
  aiModels: AIModel[];
  
  // ──────────────────────────────────────
  // TOKEN ROUTING - INDIA
  // ──────────────────────────────────────
  /** Token routing distribution (India Monthly) */
  routing?: Record<string, number>;
  /** Token routing distribution (India Yearly) */
  routingYearly?: Record<string, number>;
  
  // ──────────────────────────────────────
  // BUFFER ROUTING - INDIA
  // ──────────────────────────────────────
  /** Buffer routing for conditional activation (India) */
  bufferRouting?: Record<string, number>;
  /** Total buffer tokens available (India) */
  bufferTokens?: number;
  /** When buffer activates (India) */
  bufferActivation?: 'on_booster_purchase' | 'always';
  /** Buffer tokens per booster purchase (India) */
  bufferTokensPerBooster?: number;
  
  // ──────────────────────────────────────
  // TOKEN ROUTING - INTERNATIONAL
  // ──────────────────────────────────────
  /** Token routing distribution (International Monthly) */
  routingInternational?: Record<string, number>;
  /** Token routing distribution (International Yearly) */
  routingInternationalYearly?: Record<string, number>;
  
  // ──────────────────────────────────────
  // BUFFER ROUTING - INTERNATIONAL
  // ──────────────────────────────────────
  /** Buffer routing for conditional activation (International) */
  bufferRoutingInternational?: Record<string, number>;
  /** Total buffer tokens available (International) */
  bufferTokensInternational?: number;
  /** When buffer activates (International) */
  bufferActivationInternational?: 'on_booster_purchase' | 'always';
  /** Buffer tokens per booster purchase (International) */
  bufferTokensPerBoosterInternational?: number;
  
  // ──────────────────────────────────────
  // PLAN FLAGS
  // ──────────────────────────────────────
  /** Whether plan uses hybrid routing */
  isHybrid: boolean;
  /** Whether smart routing is enabled */
  hasSmartRouting: boolean;
  /** Whether dynamic daily limits are enabled */
  hasDynamicDailyLimits: boolean;
  /** Whether unused tokens expire */
  tokenExpiryEnabled: boolean;
  
  // ──────────────────────────────────────
  // BOOSTERS
  // ──────────────────────────────────────
  /** Cooldown booster configuration */
  cooldownBooster?: CooldownBooster;
  /** Addon booster configuration */
  addonBooster?: AddonBooster;
  
  // ──────────────────────────────────────
  // DOCUMENT INTELLIGENCE
  // ──────────────────────────────────────
  /** Document intelligence configuration */
  documentation?: DocumentIntelligence;
  
  // ──────────────────────────────────────
  // FEATURES
  // ──────────────────────────────────────
  /** Feature flags */
  features: {
    studio: boolean;
    documentIntelligence: boolean;
    fileUpload: boolean;
    prioritySupport: boolean;
    smartRouting: boolean;
    multiModel: boolean;
  };
  
  // ──────────────────────────────────────
  // COSTS
  // ──────────────────────────────────────
  /** Cost breakdown (India) */
  costs: PlanCosts;
  /** Cost breakdown (International) */
  costsInternational?: PlanCosts;
  
  // ──────────────────────────────────────
  // PAYMENT GATEWAY
  // ──────────────────────────────────────
  /** Payment gateway plan IDs */
  paymentGateway?: {
    cashfree?: string;
    razorpay?: string;
    razorpayYearly?: string;
    stripe?: string;
    stripeYearly?: string;
  };
}

/**
 * Studio booster costs interface
 */
export interface StudioBoosterCosts {
  /** Gateway fee */
  gateway: number;
  /** Infrastructure cost */
  infra: number;
  /** Maximum GPU cost */
  maxGPUCost: number;
  /** Total cost */
  total: number;
  /** Profit */
  profit: number;
  /** Margin percentage */
  margin: number;
}

/**
 * Studio Booster interface
 * Additional studio credits packages
 */
export interface StudioBooster {
  /** Unique identifier */
  id: string;
  /** Booster type */
  type: 'STUDIO';
  /** Internal name */
  name: string;
  /** Display name */
  displayName: string;
  /** Marketing tagline */
  tagline: string;
  /** Price in INR */
  price: number;
  /** Price in USD */
  priceUSD?: number;
  /** Credits added (India) */
  creditsAdded: number;
  /** Credits added (International) */
  creditsAddedIntl?: number;
  /** Validity in days */
  validity: number;
  /** Maximum purchases per month */
  maxPerMonth: number;
  /** Whether to show "Popular" badge */
  popular?: boolean;
  /** Cost breakdown (India) */
  costs: StudioBoosterCosts;
  /** Cost breakdown (International) */
  costsInternational?: StudioBoosterCosts;
  /** Payment gateway IDs */
  paymentGateway?: {
    cashfree?: string;
    razorpay?: string;
    stripe?: string;
  };
}

// ==========================================
// 📊 PLANS STATIC CONFIGURATION
// ==========================================

export const PLANS_STATIC_CONFIG: Record<PlanType, Plan> = {

  // ==========================================
  // 🌟 STARTER PLAN (FREE)
  // ==========================================
  // Acquisition tier - loss leader for user growth
  // Single model (Flash Lite) for cost efficiency
  // Limited features to encourage upgrades
  // ==========================================
  // ==========================================
// 🌟 STARTER PLAN (FREE)
// ==========================================
// v8.0 UPDATE (December 19, 2025):
// - Monthly Tokens: 300K (was 500K)
// - Daily Limit: 10K (was 16.6K)
// - Routing: 100% Flash-Lite (was DeepSeek 90%)
// - Buffer: 60K DeepSeek (conditional on booster)
// - India Booster: ₹15 → 30K tokens (same day)
// - International Booster: $2.99 → 130K tokens + 10 images (48hrs)
// ==========================================
[PlanType.STARTER]: {
  id: PlanType.STARTER,
  name: 'starter',
  displayName: 'Soriva Starter',
  tagline: 'Start smarter.',
  description: 'Free forever - Fast AI chat with Flash Lite',
  price: 0,
  priceUSD: 0,
  enabled: true,
  order: 1,
  personality: 'Friendly, casual, quick helper',
  bonusTokens: 0,

  // ──────────────────────────────────────
  // USAGE LIMITS - INDIA
  // 300K tokens, 10K daily, ~20 messages/day
  // ──────────────────────────────────────
  limits: {
    monthlyTokens: 300000,
    monthlyWords: 200000,
    dailyTokens: 10000,
    dailyWords: 6667,
    botResponseLimit: 150,
    memoryDays: 5,
    contextMemory: 5,
    responseDelay: 5,
    voiceMinutes: 0,
    cameraMinutes: 0,
    voiceTechnology: VoiceTechnology.NONE,
    studioCredits: 0,
    studio: {
      images: 0,
      talkingPhotos: 0,
      logoPreview: 0,
      logoPurchase: 0,
    },
  },

  // ──────────────────────────────────────
  // USAGE LIMITS - INTERNATIONAL
  // Same as India for free tier
  // ──────────────────────────────────────
  limitsInternational: {
    monthlyTokens: 300000,
    monthlyWords: 200000,
    dailyTokens: 10000,
    dailyWords: 6667,
    botResponseLimit: 150,
    memoryDays: 5,
    contextMemory: 5,
    responseDelay: 5,
    voiceMinutes: 0,
    cameraMinutes: 0,
    voiceTechnology: VoiceTechnology.NONE,
    studioCredits: 0,
    studio: {
      images: 0,
      talkingPhotos: 0,
      logoPreview: 0,
      logoPurchase: 0,
    },
  },

  // ──────────────────────────────────────
  // AI MODELS
  // Flash-Lite: 100% main usage
  // DeepSeek: 0% (buffer - activates on booster)
  // ──────────────────────────────────────
 // ✅ AFTER (OpenRouter - already integrated!)
      aiModels: [
        {
          provider: AIProvider.GEMINI,
          modelId: 'gemini-2.5-flash-lite',
          displayName: 'Gemini Flash Lite',
          percentage: 100,
        },
        {
          provider: AIProvider.OPENROUTER,        // ✅ Changed
          modelId: 'deepseek/deepseek-chat',      // ✅ Changed
          displayName: 'DeepSeek V3',             // ✅ Changed
          percentage: 0,
          fallback: true,
        },
      ],
  // ──────────────────────────────────────
  // TOKEN ROUTING - INDIA
  // 100% Flash-Lite for main usage
  // ──────────────────────────────────────
  routing: {
    'gemini-2.5-flash-lite': 1.0,
  },

  // ──────────────────────────────────────
  // BUFFER ROUTING - INDIA ONLY
  // DeepSeek buffer activates on booster purchase
  // 30K per booster, max 60K (2 boosters)
  // ──────────────────────────────────────
  bufferRouting: {
    'deepseek/deepseek-chat': 1.0,
  },
  bufferTokens: 60000,
  bufferActivation: 'on_booster_purchase',
  bufferTokensPerBooster: 30000,

  // ──────────────────────────────────────
  // TOKEN ROUTING - INTERNATIONAL
  // 100% Flash-Lite (no buffer needed)
  // ──────────────────────────────────────
  routingInternational: {
    'gemini-2.5-flash-lite': 1.0,
  },

  // ──────────────────────────────────────
  // PLAN FLAGS
  // ──────────────────────────────────────
  isHybrid: false,
  hasSmartRouting: false,
  hasDynamicDailyLimits: true,
  tokenExpiryEnabled: true,

  // ──────────────────────────────────────
  // COOLDOWN BOOSTER
  // India: ₹15 → 30K tokens (same day, from pool)
  // International: $2.99 → 130K tokens + 10 images (48hrs)
  // Max 2 per month
  // ──────────────────────────────────────
  cooldownBooster: {
    type: 'COOLDOWN',
    name: 'Starter Instant Unlock',
    description: 'Unlock extra tokens instantly when you hit your daily limit',
    price: 15,
    priceUSD: 2.99,
    // India: 30K from pool (same day)
    tokensUnlocked: 30000,
    wordsUnlocked: 20000,
    // International: 30K pool + 100K extra + 10 images (48hrs)
    tokensUnlockedInternational: 130000,
    wordsUnlockedInternational: 86667,
    extraTokensInternational: 100000,
    ideogramImagesInternational: 10,
    validityHoursInternational: 48,
    logic: 'India: 30K from pool (same day) | International: 30K pool + 100K extra Flash-Lite + 10 Ideogram images (48hrs)',
    duration: 0,
    maxPerPlanPeriod: 2,
    resetOn: 'plan_renewal',
    // India costs (97.7% margin)
    costs: {
      ai: 0,
      gateway: 0.35,
      total: 0.35,
      profit: 14.65,
      margin: 97.7,
    },
    // International costs (79.5% margin)
    costsInternational: {
      ai: 3.31,
      ideogram: 17.00,
      gateway: 34.55,
      total: 54.86,
      profit: 212.24,
      margin: 79.5,
    },
  },

// ──────────────────────────────────────
// SMART DOCS
// 30 credits/month (~24K tokens, 8% of pool)
// Features: 7 (STARTER level only)
// Model: Flash-Lite
// ──────────────────────────────────────
documentation: {
  enabled: true,
  tier: 'starter' as DocumentIntelligenceTier,
  displayName: 'Smart Docs Basic',
  badge: '📄',
  tagline: 'Essential document tools',
  monthlyCredits: 30,
  monthlyCreditsInternational: 30,
  monthlyWords: 0,
  maxWorkspaces: 1,
  maxFileSizeMB: 10,
  featuresUnlocked: 7,
  model: 'gemini-2.5-flash-lite',
  exportFormats: ['pdf', 'markdown'],
  templates: false,
  versionHistory: 0,
  collaboration: false,
},
  // ──────────────────────────────────────
  // FEATURES
  // All disabled for free tier
  // ──────────────────────────────────────
  features: {
    studio: false,
    documentIntelligence: false,
    fileUpload: false,
    prioritySupport: false,
    smartRouting: false,
    multiModel: false,
  },

  // ──────────────────────────────────────
  // COST ANALYSIS - INDIA
  // 300K Flash-Lite = ₹9.92 AI cost
  // Total loss: ~₹14.92 per user
  // Buffer cost only when booster purchased
  // ──────────────────────────────────────
  costs: (() => {
    const aiCost = calculateRoutingCost(300000, {
      'gemini-2.5-flash-lite': 1.0,
    });
    return {
      aiCostPremium: aiCost,
      aiCostTotal: aiCost,
      studioCostTotal: 0,
      gatewayCost: 0,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      voiceCost: 0,
      totalCost: aiCost + INFRASTRUCTURE_COSTS.starter,
      revenue: 0,
      profit: -(aiCost + INFRASTRUCTURE_COSTS.starter),
      margin: -100,
    };
  })(),

  // ──────────────────────────────────────
  // COST ANALYSIS - INTERNATIONAL
  // Same as India for free tier base
  // Booster costs different (see costsInternational in cooldownBooster)
  // ──────────────────────────────────────
  costsInternational: (() => {
    const aiCost = calculateRoutingCost(300000, {
      'gemini-2.5-flash-lite': 1.0,
    });
    return {
      aiCostPremium: aiCost,
      aiCostTotal: aiCost,
      studioCostTotal: 0,
      gatewayCost: 0,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      voiceCost: 0,
      totalCost: aiCost + INFRASTRUCTURE_COSTS.starter,
      revenue: 0,
      profit: -(aiCost + INFRASTRUCTURE_COSTS.starter),
      margin: -100,
    };
  })(),
},
  // ==========================================
  // ⚡ PLUS PLAN (₹299 / $13.99)
  // ==========================================
  // v7.0: 1.18M tokens India @ 25% margin
  // v7.0: 2.25M tokens International @ 35% margin
  // Entry-level paid tier
  // Smart routing with 3 models
  // Studio access included
  // Best value for casual users
  // ==========================================
  [PlanType.PLUS]: {
  id: PlanType.PLUS,
  name: 'plus',
  displayName: 'Soriva Plus',
  tagline: 'Elevate. Effortlessly.',
  description: 'Smart AI routing + 1.18M tokens + Studio access',
  price: 299,
  priceUSD: 13.99,
  priceYearly: 2999,
  priceYearlyUSD: 139.99,
  yearlyDiscount: 16,
  yearlyDiscountInternational: 17,
  enabled: true,
  popular: true,
  hero: true,
  order: 2,
  personality: 'Versatile, productivity-oriented, balanced',
  bonusTokens: 100000,

  // ──────────────────────────────────────
  // USAGE LIMITS - INDIA
  // 1.18M tokens, 350 studio credits
  // Voice: 30 min total (including 5 min camera)
  // ──────────────────────────────────────
  limits: {
  monthlyTokens: 1180000,
  monthlyWords: 786667,
  dailyTokens: 39333,
  dailyWords: 26222,
  botResponseLimit: 150,
  memoryDays: 10,
  contextMemory: 10,
  responseDelay: 3,
  voiceMinutes: 30,
  cameraMinutes: 5,
  voiceTechnology: VoiceTechnology.ONAIR,
  studioCredits: 350,
  seekSearches: 10, // ✅ ADD THIS
  studio: {
    images: 0,
    talkingPhotos: 0,
    logoPreview: 0,
    logoPurchase: 0,
  },
},
limitsYearly: {
  // Tokens - Monthly bounded (hidden from user)
  monthlyTokens: 1081667,
  monthlyWords: 721111,
  dailyTokens: 36056,
  dailyWords: 24037,
  botResponseLimit: 150,
  memoryDays: 10,
  contextMemory: 10,
  responseDelay: 3,
  
  // Visible features - LUMP SUM (user feels value!)
  voiceMinutes: 360,           // 30 × 12 
  cameraMinutes: 60,           // 5 × 12
  studioCredits: 4200,         // 350 × 12
  seekSearches: 120,           // 10 × 12
  
  voiceTechnology: VoiceTechnology.ONAIR,
  studio: {
    images: 0,
    talkingPhotos: 0,
    logoPreview: 0,
    logoPurchase: 0,
  },
  
  // Carry forward - Only for TOKENS
  carryForward: true,
  carryForwardPercent: 75,
  carryForwardMaxMonths: 1,
},
  // ──────────────────────────────────────
  // USAGE LIMITS - INTERNATIONAL
  // 2.25M tokens, 1750 studio credits (5x India)
  // Voice: 90 min total (including 15 min camera)
  // Seek: 150 searches
  // ──────────────────────────────────────
  limitsInternational: {
    monthlyTokens: 2250000,
    monthlyWords: 1500000,
    dailyTokens: 75000,
    dailyWords: 50000,
    botResponseLimit: 150,
    memoryDays: 10,
    contextMemory: 10,
    responseDelay: 3,
    voiceMinutes: 90,
    cameraMinutes: 15,
    voiceTechnology: VoiceTechnology.ONAIR,
    studioCredits: 1750,
    seekSearches: 150,
    studio: {
      images: 0,
      talkingPhotos: 0,
      logoPreview: 0,
      logoPurchase: 0,
    },
  },
 limitsYearlyInternational: {
  // Tokens - Monthly bounded (11 months)
  monthlyTokens: 2062500,      // 2.25M × 11 ÷ 12 ✅
  monthlyWords: 1375000,       // 1500000 × 11 ÷ 12 ✅
  dailyTokens: 68750,          // 2,062,500 ÷ 30 ✅
  dailyWords: 45833,           // 1,375,000 ÷ 30 ✅
  botResponseLimit: 150,
  memoryDays: 10,
  contextMemory: 10,
  responseDelay: 3,
  
  // Visible features - LUMP SUM (12×)
  voiceMinutes: 1080,          // 90 × 12 ✅ UPDATED
  cameraMinutes: 180,          // 15 × 12 ✅ UPDATED
  studioCredits: 21000,        // 1750 × 12 ✅ UPDATED
  seekSearches: 1800,          // 150 × 12 ✅ UPDATED
  
  voiceTechnology: VoiceTechnology.ONAIR,
  studio: {
    images: 0,
    talkingPhotos: 0,
    logoPreview: 0,
    logoPurchase: 0,
  },
  carryForward: true,
  carryForwardPercent: 75,
  carryForwardMaxMonths: 1,
},

  // ──────────────────────────────────────
  // AI MODELS
  // India: Flash-Lite + Kimi K2
  // International: Flash + Kimi K2
  // ──────────────────────────────────────
  aiModels: [
    {
      provider: AIProvider.GEMINI,
      modelId: 'gemini-2.5-flash-lite',
      displayName: 'Gemini Flash Lite',
      tier: RoutingTier.CASUAL,
      percentage: 60,
    },
    {
      provider: AIProvider.MOONSHOT,
      modelId: 'moonshotai/kimi-k2-thinking',
      displayName: 'Kimi K2',
      tier: RoutingTier.SIMPLE,
      percentage: 40,
    },
  ],

  aiModelsInternational: [
    {
      provider: AIProvider.GEMINI,
      modelId: 'gemini-2.5-flash',
      displayName: 'Gemini Flash',
      tier: RoutingTier.CASUAL,
      percentage: 60,
    },
    {
      provider: AIProvider.MOONSHOT,
      modelId: 'moonshotai/kimi-k2-thinking',
      displayName: 'Kimi K2',
      tier: RoutingTier.SIMPLE,
      percentage: 40,
    },
  ],

  // ──────────────────────────────────────
  // TOKEN ROUTING - INDIA
  // Flash-Lite 60% + Kimi K2 40%
  // ──────────────────────────────────────
  routing: {
    'gemini-2.5-flash-lite': 0.60,
    'moonshotai/kimi-k2-thinking': 0.40,
  },

  routingYearly: {
    'gemini-2.5-flash-lite': 0.60,
    'moonshotai/kimi-k2-thinking': 0.40,
  },

  // ──────────────────────────────────────
  // BUFFER ROUTING - INDIA (for Cooldown Booster)
  // 100K DeepSeek buffer activates on booster purchase
  // ──────────────────────────────────────
  bufferRouting: {
    'gemini-2.5-flash-lite': 1.0,
  },
  bufferTokens: 100000,
  bufferActivation: 'on_booster_purchase',
  bufferTokensPerBooster: 100000,

  // ──────────────────────────────────────
  // TOKEN ROUTING - INTERNATIONAL
  // Flash 60% + Kimi K2 40%
  // ──────────────────────────────────────
  routingInternational: {
    'gemini-2.5-flash': 0.60,
    'moonshotai/kimi-k2-thinking': 0.40,
  },

  routingInternationalYearly: {
    'gemini-2.5-flash': 0.60,
    'moonshotai/kimi-k2-thinking': 0.40,
  },

  // ──────────────────────────────────────
  // PLAN FLAGS
  // ──────────────────────────────────────
  isHybrid: false,
  hasSmartRouting: true,
  hasDynamicDailyLimits: true,
  tokenExpiryEnabled: true,

  // ──────────────────────────────────────
  // COOLDOWN BOOSTER
  // India: ₹35 → 100K (pool) + 100K DeepSeek buffer, 24hrs, max 1
  // International: $3.99 → 500K extra, 48hrs, max 1
  // ──────────────────────────────────────
  cooldownBooster: {
  type: 'COOLDOWN',
  name: 'Plus Instant Boost',
  description: 'Unlock extra tokens instantly when you hit your daily limit',
  price: 35,
  priceUSD: 3.99,
  tokensUnlocked: 100000,
  tokensUnlockedInternational: 500000,
  wordsUnlocked: 66667,
  wordsUnlockedInternational: 333333,
  isExtraInternational: true,
  validityHours: 48,
  validityHoursInternational: 48,
  activationWindow: 48, // hours to start using
  carryForward: true, // unused tokens persist till plan end
  expiryLogic: 'plan_renewal',
  logic: 'India: 100K from pool + 100K Flash-Lite buffer | International: 500K extra tokens | 48hrs activation window, carry forward till plan end',
  duration: 0,
  maxPerPlanPeriod: 1,
  resetOn: 'plan_renewal',
  costs: {
    ai: 0,
    buffer: 3.31,  // Flash-Lite
    gateway: 0.83,
    total: 4.14,
    profit: 30.86,
    margin: 88.2,
  },
  costsInternational: {
    ai: 102.38,
    gateway: 37.52,
    total: 139.90,
    profit: 216.51,
    margin: 60.7,
  },
},

  // ──────────────────────────────────────
  // ADDON BOOSTER
  // India: ₹79 → 300K (Flash-Lite 60% + Kimi 40%), 14 days/month end, max 2
  // International: $8.99 → 1M + 300 credits, 7 days/plan end, max 2
  // ──────────────────────────────────────
  addonBooster: {
    type: 'ADDON',
    name: 'Plus Power Boost',
    description: 'Extra tokens for extended usage',
    price: 79,
    priceUSD: 8.99,
    premiumTokens: 0,
    flashTokens: 300000,
    totalTokens: 300000,
    totalTokensInternational: 1000000,
    studioCreditsInternational: 300,
    dailyBoost: 21428,
    validity: 14,
    validityInternational: 7,
    validityLogic: 'India: 14 days or month end | International: 7 days or plan end (whichever first)',
    distributionLogic: 'India: 300K (Flash-Lite 60% + Kimi 40%) | International: 1M (Flash 60% + Kimi 40%) + 300 studio credits',
    maxPerMonth: 2,
    queueingAllowed: true,
    separatePool: true,
    costs: {
      ai: 30.72,
      gateway: 1.86,
      total: 32.58,
      profit: 46.42,
      margin: 58.8,
    },
    costsInternational: {
      ai: 204.69,
      studioCredits: 12.24,
      gateway: 50.04,
      total: 266.97,
      profit: 536.10,
      margin: 66.7,
    },
  },

  // ──────────────────────────────────────
// SMART DOCS
// 100 credits/month (~80K tokens, 7% of pool)
// Features: 13 (STARTER + PLUS level)
// Model: Kimi K2
// ──────────────────────────────────────
documentation: {
  enabled: true,
  tier: 'standard',
  displayName: 'Document Intelligence',
  badge: '✨',
  tagline: 'Smart documentation for everyday needs',
  monthlyCredits: 100,
  monthlyCreditsInternational: 100,
  monthlyWords: 0,
  maxWorkspaces: 10,
  maxFileSizeMB: 25,
  featuresUnlocked: 13,
  model: 'moonshotai/kimi-k2-thinking',
  exportFormats: ['pdf', 'markdown'],
  templates: false,
  versionHistory: 3,
  collaboration: false,
},

  // ──────────────────────────────────────
  // FEATURES
  // ──────────────────────────────────────
  features: {
    studio: true,
    documentIntelligence: true,
    fileUpload: false,
    prioritySupport: false,
    smartRouting: true,
    multiModel: true,
  },

  // ──────────────────────────────────────
  // COST ANALYSIS - INDIA
  // Revenue: ₹299 | Margin: ~24%
  // Voice: 30 min total (25 voice + 5 camera worst case)
  // ──────────────────────────────────────
  costs: (() => {
    const aiCost = calculateRoutingCost(1180000, {
      'gemini-2.5-flash-lite': 0.60,
      'moonshotai/kimi-k2-thinking': 0.40,
    });
    const studioCost = 350 * STUDIO_CREDIT_COST;
    const seekCost = 10 * SEEK_LIMITS.costPerSearch;
    const gateway = 299 * (GATEWAY_FEE_PERCENTAGE / 100);
    const voiceCost = (25 * VOICE_COSTS.onair.perMinute) + (5 * VOICE_COSTS.camera.perMinute);
    const totalCost = aiCost + studioCost + seekCost + gateway + INFRASTRUCTURE_COSTS.paid + voiceCost;

    return {
      aiCostPremium: aiCost,
      aiCostTotal: aiCost,
      studioCostTotal: studioCost,
      seekCostTotal: seekCost,
      gatewayCost: gateway,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      voiceCost: voiceCost,
      totalCost,
      revenue: 299,
      profit: 299 - totalCost,
      margin: ((299 - totalCost) / 299) * 100,
    };
  })(),

  // ──────────────────────────────────────
  // COST ANALYSIS - INTERNATIONAL
  // Revenue: $13.99 (₹1,250) | Margin: ~29.5%
  // Voice: 90 min total (75 voice + 15 camera worst case)
  // Seek: 200 searches
  // ──────────────────────────────────────
  costsInternational: (() => {
    const aiCost = calculateRoutingCost(2250000, {
      'gemini-2.5-flash': 0.60,
      'moonshotai/kimi-k2-thinking': 0.40,
    });
    const studioCost = 1750 * STUDIO_CREDIT_COST;
    const seekCost = 150 * SEEK_LIMITS.costPerSearch;
    const revenueINR = 13.99 * USD_TO_INR_RATE;
    const gateway = revenueINR * (GATEWAY_FEE_STRIPE_PERCENTAGE / 100) + (GATEWAY_FEE_STRIPE_FIXED_USD * USD_TO_INR_RATE);
    const voiceCost = (75 * VOICE_COSTS.onair.perMinute) + (15 * VOICE_COSTS.camera.perMinute);
    const totalCost = aiCost + studioCost + seekCost + gateway + INFRASTRUCTURE_COSTS.paid + voiceCost;

    return {
      aiCostPremium: aiCost,
      aiCostTotal: aiCost,
      studioCostTotal: studioCost,
      seekCostTotal: seekCost,
      gatewayCost: gateway,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      voiceCost: voiceCost,
      totalCost,
      revenue: revenueINR,
      profit: revenueINR - totalCost,
      margin: ((revenueINR - totalCost) / revenueINR) * 100,
    };
  })(),

  // ──────────────────────────────────────
  // PAYMENT GATEWAY IDs
  // ──────────────────────────────────────
  paymentGateway: {
    razorpay: 'plan_plus_monthly',
    razorpayYearly: 'plan_plus_yearly',
    stripe: 'price_plus_monthly_usd',
    stripeYearly: 'price_plus_yearly_usd',
  },
},

  // ==========================================
  // 🚀 PRO PLAN (₹799 / $35.99)
  // ==========================================
  // v7.0: 1.6M tokens India @ 25% margin
  // v7.0: 4.65M tokens International @ 35% margin
  // Professional tier for power users
  // 4-model routing including GPT-5.1
  // Full studio access + file uploads
  // Priority support included
  // ==========================================
  [PlanType.PRO]: {
  id: PlanType.PRO,
  name: 'pro',
  displayName: 'Soriva Pro',
  tagline: 'Command brilliance.',
  description: 'Premium AI + 1.3M tokens + Full Studio + GPT-5.1 access',
  price: 799,
  priceUSD: 35.99,
  priceYearly: 7999,
  priceYearlyUSD: 359.99,
  yearlyDiscount: 17,
  yearlyDiscountInternational: 17,
  enabled: true,
  order: 3,
  personality: 'Professional, insightful, detailed',
  bonusTokens: 100000,

  // ──────────────────────────────────────
  // USAGE LIMITS - INDIA
  // 1.3M tokens, 650 studio credits
  // Voice: 45 min total (including 6 min camera)
  // ──────────────────────────────────────
  limits: {
  monthlyTokens: 1300000,
  monthlyWords: 866667,
  dailyTokens: 43333,
  dailyWords: 28889,
  botResponseLimit: 300,
  memoryDays: 15,
  contextMemory: 12,
  responseDelay: 2.5,
  voiceMinutes: 45,
  cameraMinutes: 6,
  voiceTechnology: VoiceTechnology.ONAIR,
  studioCredits: 650,
  seekSearches: 30, // ✅ ADD THIS
  studio: {
    images: 0,
    talkingPhotos: 0,
    logoPreview: 0,
    logoPurchase: 0,
  },
},
limitsYearly: {
  // Tokens - Monthly bounded (11 months)
  monthlyTokens: 1191667,      // 1.3M × 11 ÷ 12 ✅
  monthlyWords: 794444,        // 866667 × 11 ÷ 12 ✅
  dailyTokens: 39722,          // 1,191,667 ÷ 30 ✅
  dailyWords: 26481,           // 794,444 ÷ 30 ✅
  botResponseLimit: 300,
  memoryDays: 15,
  contextMemory: 12,
  responseDelay: 2.5,
  
  // Visible features - LUMP SUM (12×)
  voiceMinutes: 540,           // 45 × 12 ✅ UPDATED
  cameraMinutes: 72,           // 6 × 12 ✅ UPDATED
  studioCredits: 7800,         // 650 × 12 ✅ UPDATED
  seekSearches: 360,           // 30 × 12 ✅ UPDATED
  
  voiceTechnology: VoiceTechnology.ONAIR,
  studio: {
    images: 0,
    talkingPhotos: 0,
    logoPreview: 0,
    logoPurchase: 0,
  },
  carryForward: true,
  carryForwardPercent: 75,
  carryForwardMaxMonths: 1,
},
  // ──────────────────────────────────────
  // USAGE LIMITS - INTERNATIONAL
  // 4.65M tokens, 3000 studio credits
  // Voice: 90 min total (including 12 min camera)
  // ──────────────────────────────────────
limitsInternational: {
  monthlyTokens: 4650000,
  monthlyWords: 3100000,
  dailyTokens: 155000,
  dailyWords: 103333,
  botResponseLimit: 300,
  memoryDays: 15,
  contextMemory: 12,
  responseDelay: 2.5,
  voiceMinutes: 90,
  cameraMinutes: 12,
  voiceTechnology: VoiceTechnology.ONAIR,
  studioCredits: 3000,
  seekSearches: 200,
  studio: {
    images: 0,
    talkingPhotos: 0,
    logoPreview: 0,
    logoPurchase: 0,
  },
},
limitsYearlyInternational: {
  // Tokens - Monthly bounded (11 months)
  monthlyTokens: 4262500,      // 4.65M × 11 ÷ 12 ✅
  monthlyWords: 2841667,       // 3100000 × 11 ÷ 12 ✅
  dailyTokens: 142083,         // 4,262,500 ÷ 30 ✅
  dailyWords: 94722,           // 2,841,667 ÷ 30 ✅
  botResponseLimit: 300,
  memoryDays: 15,
  contextMemory: 12,
  responseDelay: 2.5,
  
  // Visible features - LUMP SUM (12×)
  voiceMinutes: 1080,          // 90 × 12 ✅ UPDATED
  cameraMinutes: 144,          // 12 × 12 ✅ UPDATED
  studioCredits: 36000,        // 3000 × 12 ✅ UPDATED
  seekSearches: 2400,          // 200 × 12 ✅ UPDATED
  
  voiceTechnology: VoiceTechnology.ONAIR,
  studio: {
    images: 0,
    talkingPhotos: 0,
    logoPreview: 0,
    logoPurchase: 0,
  },
  carryForward: true,
  carryForwardPercent: 75,
  carryForwardMaxMonths: 1,
},
  // ──────────────────────────────────────
  // AI MODELS - INDIA
  // Flash 60% + Kimi 20% + GPT-5.1 20%
  // ──────────────────────────────────────
  aiModels: [
  {
    provider: AIProvider.GEMINI,
    modelId: 'gemini-2.5-flash',
    displayName: 'Gemini Flash',
    tier: RoutingTier.MEDIUM,
    percentage: 60,
  },
  {
    provider: AIProvider.MOONSHOT,
    modelId: 'moonshotai/kimi-k2-thinking',
    displayName: 'Kimi K2',
    tier: RoutingTier.MEDIUM,
    percentage: 20,
  },
  {
    provider: AIProvider.OPENAI,
    modelId: 'gpt-5.1',
    displayName: 'GPT-5.1',
    tier: RoutingTier.EXPERT,
    percentage: 20,
  },
],

  // ──────────────────────────────────────
  // AI MODELS - INTERNATIONAL
  // Flash 43.1% + Kimi 30% + Pro 9.3% + GPT 17.6%
  // ──────────────────────────────────────
  aiModelsInternational: [
  {
    provider: AIProvider.GEMINI,
    modelId: 'gemini-2.5-flash',
    displayName: 'Gemini Flash',
    tier: RoutingTier.MEDIUM,
    percentage: 43.1,
  },
  {
    provider: AIProvider.MOONSHOT,
    modelId: 'moonshotai/kimi-k2-thinking',
    displayName: 'Kimi K2',
    tier: RoutingTier.MEDIUM,
    percentage: 30,
  },
  {
    provider: AIProvider.GEMINI,
    modelId: 'gemini-2.5-pro',
    displayName: 'Gemini Pro',
    tier: RoutingTier.COMPLEX,
    percentage: 9.3,
  },
  {
    provider: AIProvider.OPENAI,
    modelId: 'gpt-5.1',
    displayName: 'GPT-5.1',
    tier: RoutingTier.EXPERT,
    percentage: 17.6,
  },
],

  // ──────────────────────────────────────
  // TOKEN ROUTING - INDIA
  // Flash 60% + Kimi 20% + GPT-5.1 20%
  // ──────────────────────────────────────
  routing: {
    'gemini-2.5-flash': 0.60,
    'moonshotai/kimi-k2-thinking': 0.20,
    'gpt-5.1': 0.20,
  },

  routingYearly: {
    'gemini-2.5-flash': 0.60,
    'moonshotai/kimi-k2-thinking': 0.20,
    'gpt-5.1': 0.20,
  },

  // ──────────────────────────────────────
  // BUFFER ROUTING - INDIA (for Cooldown Booster)
  // 150K Flash-Lite buffer activates on booster purchase
  // ──────────────────────────────────────
  bufferRouting: {
    'gemini-2.5-flash': 1.0,
  },
  bufferTokens: 150000,
  bufferActivation: 'on_booster_purchase',
  bufferTokensPerBooster: 150000,

  // ──────────────────────────────────────
  // TOKEN ROUTING - INTERNATIONAL
  // Flash 43.1% + Kimi 30% + Pro 9.3% + GPT 17.6%
  // ──────────────────────────────────────
  routingInternational: {
    'gemini-2.5-flash': 0.431,
    'moonshotai/kimi-k2-thinking': 0.30,
    'gemini-2.5-pro': 0.093,
    'gpt-5.1': 0.176,
  },

  routingInternationalYearly: {
    'gemini-2.5-flash': 0.431,
    'moonshotai/kimi-k2-thinking': 0.30,
    'gemini-2.5-pro': 0.093,
    'gpt-5.1': 0.176,
  },

  // ──────────────────────────────────────
  // BUFFER ROUTING - INTERNATIONAL (for Cooldown Booster)
  // 310K Flash buffer activates on booster purchase
  // ──────────────────────────────────────
  bufferRoutingInternational: {
    'gemini-2.5-flash': 1.0,
  },
  bufferTokensInternational: 310000,
  bufferActivationInternational: 'on_booster_purchase',
  bufferTokensPerBoosterInternational: 310000,

  // ──────────────────────────────────────
  // PLAN FLAGS
  // ──────────────────────────────────────
  isHybrid: false,
  hasSmartRouting: true,
  hasDynamicDailyLimits: true,
  tokenExpiryEnabled: true,

  // ──────────────────────────────────────
  // COOLDOWN BOOSTER
  // India: ₹59 → 150K (pool) + 150K Flash-Lite buffer, 24hrs, max 1
  // International: $4.99 → 310K (pool) + 310K Flash buffer, 48hrs, max 1
  // ──────────────────────────────────────
  cooldownBooster: {
  type: 'COOLDOWN',
  name: 'Pro Instant Boost',
  description: 'Unlock extra tokens instantly when you hit your daily limit',
  price: 59,
  priceUSD: 4.99,
  tokensUnlocked: 150000,
  tokensUnlockedInternational: 310000,
  wordsUnlocked: 100000,
  wordsUnlockedInternational: 206667,
  isExtraInternational: false,
  validityHours: 48,
  validityHoursInternational: 48,
  activationWindow: 48, // hours to start using
  carryForward: true, // unused tokens persist till plan end
  expiryLogic: 'plan_renewal',
  logic: 'India: 150K from pool + 150K Flash buffer | International: 310K from pool + 310K Flash buffer | 48hrs activation window, carry forward till plan end',
  duration: 0,
  maxPerPlanPeriod: 1,
  resetOn: 'plan_renewal',
  costs: {
    ai: 0,
    buffer: 30.55,  // Flash
    gateway: 1.39,
    total: 31.94,
    profit: 27.06,
    margin: 45.9,
  },
  costsInternational: {
    ai: 0,
    buffer: 63.14,
    gateway: 39.31,
    total: 102.45,
    profit: 343.31,
    margin: 77.0,
  },
},

  // ──────────────────────────────────────
  // ADDON BOOSTER
  // India: ₹169 → 250K (Flash 40% + Kimi 40% + GPT 20%) + 10 Seek + 50 credits
  //        14 days/month end, max 2
  // International: $11.99 → 1M (Flash 50% + Kimi 40% + GPT 10%) + 500 credits
  //                7 days/plan end, max 1
  // ──────────────────────────────────────
  addonBooster: {
    type: 'ADDON',
    name: 'Pro Power Boost',
    description: 'Extra tokens + studio credits for extended usage',
    price: 169,
    priceUSD: 11.99,
    premiumTokens: 50000,
    flashTokens: 200000,
    totalTokens: 250000,
    totalTokensInternational: 1000000,
    studioCredits: 50,
    studioCreditsInternational: 500,
    seekSearches: 10,
    seekSearchesInternational: 0,
    dailyBoost: 17857,
    validity: 14,
    validityInternational: 7,
    validityLogic: 'India: 14 days or month end | International: 7 days or plan end (whichever first)',
    distributionLogic: 'India: 250K (Flash 40% + Kimi 40% + GPT 20%) + 10 Seek + 50 credits | International: 1M (Flash 50% + Kimi 40% + GPT 10%) + 500 credits',
    maxPerMonth: 2,
    maxPerMonthInternational: 1,
    queueingAllowed: true,
    separatePool: true,
    costs: {
      ai: 81.77,
      seek: 4.20,
      studioCredits: 2.04,
      gateway: 3.99,
      total: 92.00,
      profit: 77.00,
      margin: 45.6,
    },
    costsInternational: {
      ai: 265.90,
      studioCredits: 20.40,
      gateway: 57.82,
      total: 344.12,
      profit: 727.00,
      margin: 67.9,
    },
  },

  // ──────────────────────────────────────
// SMART DOCS
// 200 credits/month (~160K tokens, 12% of pool)
// Features: 21 (STARTER + PLUS + PRO level)
// Model: Kimi K2 / GPT-5.1
// ──────────────────────────────────────
documentation: {
  enabled: true,
  tier: 'pro',
  displayName: 'Document Intelligence Pro',
  badge: '🚀 PRO',
  tagline: 'Professional-grade documentation workspace',
  monthlyCredits: 200,                    // India
  monthlyCreditsInternational: 200,       // International (same)
  monthlyWords: 15000,
  maxWorkspaces: 50,
  maxFileSizeMB: 50,
  featuresUnlocked: 21,
  model: 'moonshotai/kimi-k2-thinking',
  modelPremium: 'gpt-5.1',
  exportFormats: ['pdf', 'docx', 'markdown', 'html'],
  templates: true,
  versionHistory: 10,
  collaboration: false,
},

  // ──────────────────────────────────────
  // FEATURES
  // Full feature access
  // ──────────────────────────────────────
  features: {
    studio: true,
    documentIntelligence: true,
    fileUpload: true,
    prioritySupport: true,
    smartRouting: true,
    multiModel: true,
  },

  // ──────────────────────────────────────
  // COST ANALYSIS - INDIA
  // Revenue: ₹799 | Margin: ~27%
  // Voice: 45 min total (39 voice + 6 camera worst case)
  // ──────────────────────────────────────
  costs: (() => {
    const aiCost = calculateRoutingCost(1300000, {
      'gemini-2.5-flash': 0.60,
      'moonshotai/kimi-k2-thinking': 0.20,
      'gpt-5.1': 0.20,
    });
    const studioCost = 650 * STUDIO_CREDIT_COST;
    const seekCost = 30 * SEEK_LIMITS.costPerSearch;
    const gateway = 799 * (GATEWAY_FEE_PERCENTAGE / 100);
    const voiceCost = (39 * VOICE_COSTS.onair.perMinute) + (6 * VOICE_COSTS.camera.perMinute);
    const totalCost = aiCost + studioCost + seekCost + gateway + INFRASTRUCTURE_COSTS.paid + voiceCost;

    return {
      aiCostPremium: aiCost,
      aiCostTotal: aiCost,
      studioCostTotal: studioCost,
      seekCostTotal: seekCost,
      gatewayCost: gateway,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      voiceCost: voiceCost,
      totalCost,
      revenue: 799,
      profit: 799 - totalCost,
      margin: ((799 - totalCost) / 799) * 100,
    };
  })(),

  // ──────────────────────────────────────
  // COST ANALYSIS - INTERNATIONAL
  // Revenue: $35.99 (₹3,215) | Margin: ~31%
  // Voice: 90 min total (78 voice + 12 camera worst case)
  // ──────────────────────────────────────
  costsInternational: (() => {
    const aiCost = calculateRoutingCost(4650000, {
      'gemini-2.5-flash': 0.431,
      'moonshotai/kimi-k2-thinking': 0.30,
      'gemini-2.5-pro': 0.093,
      'gpt-5.1': 0.176,
    });
    const studioCost = 3000 * STUDIO_CREDIT_COST;
    const seekCost = 200 * SEEK_LIMITS.costPerSearch;
    const revenueINR = 35.99 * USD_TO_INR_RATE;
    const gateway = revenueINR * (GATEWAY_FEE_STRIPE_PERCENTAGE / 100) + (GATEWAY_FEE_STRIPE_FIXED_USD * USD_TO_INR_RATE);
    const voiceCost = (78 * VOICE_COSTS.onair.perMinute) + (12 * VOICE_COSTS.camera.perMinute);
    const totalCost = aiCost + studioCost + seekCost + gateway + INFRASTRUCTURE_COSTS.paid + voiceCost;

    return {
      aiCostPremium: aiCost,
      aiCostTotal: aiCost,
      studioCostTotal: studioCost,
      seekCostTotal: seekCost,
      gatewayCost: gateway,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      voiceCost: voiceCost,
      totalCost,
      revenue: revenueINR,
      profit: revenueINR - totalCost,
      margin: ((revenueINR - totalCost) / revenueINR) * 100,
    };
  })(),

  // ──────────────────────────────────────
  // PAYMENT GATEWAY IDs
  // ──────────────────────────────────────
  paymentGateway: {
    razorpay: 'plan_pro_monthly',
    razorpayYearly: 'plan_pro_yearly',
    stripe: 'price_pro_monthly_usd',
    stripeYearly: 'price_pro_yearly_usd',
  },
},

// ==========================================
  // 👑 APEX PLAN (₹1,299 / $69.99)
  // ==========================================
  // v7.0: 2.47M tokens India @ 15% margin (NO CLAUDE!)
  // v7.0: 6.2M tokens International @ 35% margin (WITH CLAUDE!)
  // MERGED: EDGE + LIFE plans combined
  // Ultimate tier with all premium features
  // Business Intelligence + Emotional Intelligence
  // ==========================================
  [PlanType.APEX]: {
  id: PlanType.APEX,
  name: 'apex',
  displayName: 'Soriva Apex',
  tagline: 'Unleash the extraordinary.',
  description: 'Ultimate AI experience + 5 Premium Models + Full Studio + Voice + Unlimited Seek',
  price: 1299,
  priceUSD: 69.99,
  priceYearly: 12999,
  priceYearlyUSD: 699.99,
  yearlyDiscount: 17,
  yearlyDiscountInternational: 17,
  enabled: true,
  order: 4,
  personality: 'Elite, comprehensive, visionary',
  bonusTokens: 100000,

  // ──────────────────────────────────────
  // USAGE LIMITS - INDIA
  // 2.75M tokens, 1000 studio credits
  // Voice: 60 min total (including 10 min camera)
  // Seek: 50 searches
  // ──────────────────────────────────────
  limits: {
    monthlyTokens: 2750000,
    monthlyWords: 1833333,
    dailyTokens: 91667,
    dailyWords: 61111,
    botResponseLimit: 500,
    memoryDays: 30,
    contextMemory: 15,
    responseDelay: 2,
    voiceMinutes: 60,
    cameraMinutes: 10,
    voiceTechnology: VoiceTechnology.ONAIR,
    studioCredits: 1000,
    seekSearches: 50,
    studio: {
      images: 0,
      talkingPhotos: 0,
      logoPreview: 0,
      logoPurchase: 0,
    },
  },
limitsYearly: {
  // Tokens - Monthly bounded (10 months for APEX)
  monthlyTokens: 2291667,      // 2.75M × 10 ÷ 12 ✅
  monthlyWords: 1527778,       // 1833333 × 10 ÷ 12 ✅
  dailyTokens: 76389,          // 2,291,667 ÷ 30 ✅
  dailyWords: 50926,           // 1,527,778 ÷ 30 ✅
  botResponseLimit: 500,
  memoryDays: 30,
  contextMemory: 15,
  responseDelay: 2,
  
  // Visible features - LUMP SUM (12×)
  voiceMinutes: 720,           // 60 × 12 ✅ UPDATED
  cameraMinutes: 120,          // 10 × 12 ✅ UPDATED
  studioCredits: 12000,        // 1000 × 12 ✅ UPDATED
  seekSearches: 600,           // 50 × 12 ✅ UPDATED
  
  voiceTechnology: VoiceTechnology.ONAIR,
  studio: {
    images: 0,
    talkingPhotos: 0,
    logoPreview: 0,
    logoPurchase: 0,
  },
  carryForward: true,
  carryForwardPercent: 75,
  carryForwardMaxMonths: 1,
},
  // ──────────────────────────────────────
  // USAGE LIMITS - INTERNATIONAL
  // 6.77M tokens, 3000 studio credits
  // Voice: 120 min total (including 20 min camera)
  // Seek: 250 searches ("Unlimited" feel)
  // ──────────────────────────────────────
limitsYearlyInternational: {
  // Tokens - Monthly bounded (10 months for APEX)
  monthlyTokens: 5641167,      // 6.77M × 10 ÷ 12 ✅
  monthlyWords: 3760778,       // 4512933 × 10 ÷ 12 ✅
  dailyTokens: 188039,         // 5,641,167 ÷ 30 ✅
  dailyWords: 125359,          // 3,760,778 ÷ 30 ✅
  botResponseLimit: 500,
  memoryDays: 30,
  contextMemory: 15,
  responseDelay: 2,
  
  // Visible features - LUMP SUM (12×)
  voiceMinutes: 1440,          // 120 × 12 ✅ UPDATED
  cameraMinutes: 240,          // 20 × 12 ✅ UPDATED
  studioCredits: 36000,        // 3000 × 12 ✅ UPDATED
  seekSearches: 3000,          // 250 × 12 ✅ UPDATED
  
  voiceTechnology: VoiceTechnology.ONAIR,
  studio: {
    images: 0,
    talkingPhotos: 0,
    logoPreview: 0,
    logoPurchase: 0,
  },
  carryForward: true,
  carryForwardPercent: 75,
  carryForwardMaxMonths: 1,
},

  // ──────────────────────────────────────
  // AI MODELS - INDIA
  // Flash 41.1% + Kimi K2 41.1% + Gemini Pro 6.9% + GPT-5.1 10.9%
  // ──────────────────────────────────────
  aiModels: [
    {
      provider: AIProvider.GEMINI,
      modelId: 'gemini-2.5-flash',
      displayName: 'Gemini Flash',
      tier: RoutingTier.MEDIUM,
      percentage: 41.1,
    },
    {
      provider: AIProvider.MOONSHOT,
      modelId: 'moonshotai/kimi-k2-thinking',
      displayName: 'Kimi K2',
      tier: RoutingTier.MEDIUM,
      percentage: 41.1,
    },
    {
      provider: AIProvider.GEMINI,
      modelId: 'gemini-2.5-pro',
      displayName: 'Gemini Pro',
      tier: RoutingTier.COMPLEX,
      percentage: 6.9,
    },
    {
      provider: AIProvider.OPENAI,
      modelId: 'gpt-5.1',
      displayName: 'GPT-5.1',
      tier: RoutingTier.EXPERT,
      percentage: 10.9,
    },
  ],

  // ──────────────────────────────────────
  // AI MODELS - INTERNATIONAL
  // Kimi K2 35.2% + GPT-5.1 32.8% + Flash 17.2% + Sonnet 4.5 7.4% + Gemini 3 Pro 7.4%
  // ──────────────────────────────────────
  aiModelsInternational: [
  {
    provider: AIProvider.MOONSHOT,
    modelId: 'moonshotai/kimi-k2-thinking',
    displayName: 'Kimi K2',
    tier: RoutingTier.MEDIUM,
    percentage: 35.2,
  },
  {
    provider: AIProvider.OPENAI,
    modelId: 'gpt-5.1',
    displayName: 'GPT-5.1',
    tier: RoutingTier.EXPERT,
    percentage: 32.8,
  },
  {
    provider: AIProvider.GEMINI,
    modelId: 'gemini-2.5-flash',
    displayName: 'Gemini Flash',
    tier: RoutingTier.MEDIUM,
    percentage: 17.2,
  },
  {
    provider: AIProvider.CLAUDE,  // ✅ FIXED
    modelId: 'claude-sonnet-4-5',
    displayName: 'Claude Sonnet 4.5',
    tier: RoutingTier.EXPERT,
    percentage: 7.4,
  },
  {
    provider: AIProvider.GEMINI,
    modelId: 'gemini-3-pro',
    displayName: 'Gemini 3 Pro',
    tier: RoutingTier.EXPERT,
    percentage: 7.4,
  },
],

  // ──────────────────────────────────────
  // TOKEN ROUTING - INDIA
  // Flash 41.1% + Kimi 41.1% + Pro 6.9% + GPT 10.9%
  // ──────────────────────────────────────
  routing: {
    'gemini-2.5-flash': 0.411,
    'moonshotai/kimi-k2-thinking': 0.411,
    'gemini-2.5-pro': 0.069,
    'gpt-5.1': 0.109,
  },

  routingYearly: {
    'gemini-2.5-flash': 0.411,
    'moonshotai/kimi-k2-thinking': 0.411,
    'gemini-2.5-pro': 0.069,
    'gpt-5.1': 0.109,
  },

  // ──────────────────────────────────────
  // BUFFER ROUTING - INDIA (for Cooldown Booster)
  // 200K Flash buffer activates on booster purchase
  // ──────────────────────────────────────
  bufferRouting: {
    'gemini-2.5-flash': 1.0,
  },
  bufferTokens: 200000,
  bufferActivation: 'on_booster_purchase',
  bufferTokensPerBooster: 200000,

  // ──────────────────────────────────────
  // TOKEN ROUTING - INTERNATIONAL
  // Kimi 35.2% + GPT 32.8% + Flash 17.2% + Sonnet 7.4% + Gemini 3 Pro 7.4%
  // ──────────────────────────────────────
  routingInternational: {
    'moonshotai/kimi-k2-thinking': 0.352,
    'gpt-5.1': 0.328,
    'gemini-2.5-flash': 0.172,
    'claude-sonnet-4-5': 0.074,
    'gemini-3-pro': 0.074,
  },

  routingInternationalYearly: {
    'moonshotai/kimi-k2-thinking': 0.352,
    'gpt-5.1': 0.328,
    'gemini-2.5-flash': 0.172,
    'claude-sonnet-4-5': 0.074,
    'gemini-3-pro': 0.074,
  },

  // ──────────────────────────────────────
  // BUFFER ROUTING - INTERNATIONAL (for Cooldown Booster)
  // No buffer - International uses EXTRA tokens approach
  // ──────────────────────────────────────
  bufferRoutingInternational: {},
  bufferTokensInternational: 0,
  bufferActivationInternational: 'on_booster_purchase',
  bufferTokensPerBoosterInternational: 0,

  // ──────────────────────────────────────
  // PLAN FLAGS
  // ──────────────────────────────────────
  isHybrid: false,
  hasSmartRouting: true,
  hasDynamicDailyLimits: true,
  tokenExpiryEnabled: true,

  // ──────────────────────────────────────
  // COOLDOWN BOOSTER
  // India: ₹79 → 200K (pool) + 200K Flash buffer, 48hrs activation, carry forward
  // International: $5.99 → 500K extra tokens, 48hrs activation, carry forward
  // ──────────────────────────────────────
  cooldownBooster: {
    type: 'COOLDOWN',
    name: 'Apex Instant Boost',
    description: 'Unlock extra tokens instantly when you hit your daily limit',
    price: 79,
    priceUSD: 5.99,
    tokensUnlocked: 200000,
    tokensUnlockedInternational: 500000,
    wordsUnlocked: 133333,
    wordsUnlockedInternational: 333333,
    isExtraInternational: true,
    validityHours: 48,
    validityHoursInternational: 48,
    activationWindow: 48,
    carryForward: true,
    expiryLogic: 'plan_renewal',
    logic: 'India: 200K from pool + 200K Flash buffer | International: 500K extra tokens | 48hrs activation window, carry forward till plan end',
    duration: 0,
    maxPerPlanPeriod: 1,
    resetOn: 'plan_renewal',
    costs: {
      ai: 0,
      buffer: 40.73,
      gateway: 1.86,
      total: 42.59,
      profit: 36.41,
      margin: 46.1,
    },
    costsInternational: {
      ai: 250.06,
      buffer: 0,
      gateway: 42.32,
      total: 292.38,
      profit: 242.83,
      margin: 45.4,
    },
  },

  // ──────────────────────────────────────
  // ADDON BOOSTER
  // India: ₹299 → 350K (plan routing) + 15 Seek + 100 credits
  //        14 days/month end, max 2
  // International: $16.99 → 2M (plan routing) + 20 min voice + 50 seek
  //                7 days/month end, max 1
  // ──────────────────────────────────────
  addonBooster: {
    type: 'ADDON',
    name: 'Apex Power Boost',
    description: 'Massive token boost with voice and search extras',
    price: 299,
    priceUSD: 16.99,
    premiumTokens: 0,
    flashTokens: 350000,
    totalTokens: 350000,
    totalTokensInternational: 2000000,
    studioCredits: 100,
    studioCreditsInternational: 0,
    seekSearches: 15,
    seekSearchesInternational: 50,
    voiceMinutesInternational: 20,
    dailyBoost: 25000,
    validity: 14,
    validityInternational: 7,
    validityLogic: 'India: 14 days or month end | International: 7 days or month end (whichever first)',
    distributionLogic: 'India: 350K (Flash 41.1% + Kimi 41.1% + Pro 6.9% + GPT 10.9%) + 15 Seek + 100 credits | International: 2M (plan routing) + 20 min voice + 50 seek',
    maxPerMonth: 2,
    maxPerMonthInternational: 1,
    queueingAllowed: true,
    separatePool: true,
    costs: {
      ai: 109.78,
      seek: 6.30,
      studioCredits: 4.08,
      gateway: 7.06,
      total: 127.22,
      profit: 171.78,
      margin: 57.5,
    },
    costsInternational: {
      ai: 1000.26,
      voice: 40.56,
      seek: 21.00,
      gateway: 70.82,
      total: 1132.64,
      profit: 385.17,
      margin: 25.4,
    },
  },



  // ──────────────────────────────────────
  // DOCUMENT INTELLIGENCE - APEX INTELLIGENCE SUITE
  // Apex tier with Business + Emotional Intelligence features
  // ──────────────────────────────────────
  // ──────────────────────────────────────
// SMART DOCS
// 350 credits/month (~280K tokens, 10% of pool)
// Features: 25 (ALL features unlocked)
// Model: Kimi K2 / GPT-5.1 / Gemini Pro (IN) | Claude Sonnet (INTL)
// ──────────────────────────────────────
documentation: {
  enabled: true,
  tier: 'apex',
  displayName: 'Apex Intelligence Suite',
  badge: '👑 APEX',
  tagline: 'Business + Emotional Intelligence for visionary minds',
  monthlyCredits: 350,                    // India
  monthlyCreditsInternational: 350,       // International (same)
  monthlyWords: 25000,
  maxWorkspaces: 100,
  maxFileSizeMB: 100,
  featuresUnlocked: 25,
  model: 'moonshotai/kimi-k2-thinking',
  modelPremium: 'gpt-5.1',
  modelExpert: { IN: 'gemini-2.5-pro', INTL: 'claude-sonnet-4-5' },
  exportFormats: ['pdf', 'docx', 'markdown', 'html', 'pptx', 'xlsx'],
  templates: true,
  versionHistory: 30,
  collaboration: true,
  advancedFeatures: {
    // Business Intelligence
    smartWorkflow: true,
    aiTagging: true,
    decisionSnapshot: true,
    legalFinanceLens: true,
    multiformatFusion: true,
    businessContextMemory: true,
    voiceToAction: true,
    // Emotional Intelligence
    emotionalContextSummarizer: true,
    memoryCapsule: true,
    companionNotes: true,
    thoughtOrganizer: true,
    aiScrapbook: true,
    lifeReflectionInsights: true,
    handwritingEmotionReader: true,
  },
},

  // ──────────────────────────────────────
  // FEATURES
  // Full feature access + Apex exclusives
  // ──────────────────────────────────────
  features: {
    studio: true,
    documentIntelligence: true,
    fileUpload: true,
    prioritySupport: true,
    smartRouting: true,
    multiModel: true,
  },

  // ──────────────────────────────────────
  // COST ANALYSIS - INDIA
  // Revenue: ₹1,299 | Margin: 16%
  // Voice: 60 min total (50 voice + 10 camera worst case)
  // ──────────────────────────────────────
  costs: (() => {
    const aiCost = calculateRoutingCost(2750000, {
      'gemini-2.5-flash': 0.411,
      'moonshotai/kimi-k2-thinking': 0.411,
      'gemini-2.5-pro': 0.069,
      'gpt-5.1': 0.109,
    });
    const studioCost = 1000 * STUDIO_CREDIT_COST;
    const seekCost = 50 * SEEK_LIMITS.costPerSearch;
    const gateway = 1299 * (GATEWAY_FEE_PERCENTAGE / 100);
    const voiceCost = (50 * VOICE_COSTS.onair.perMinute) + (10 * VOICE_COSTS.camera.perMinute);
    const totalCost = aiCost + studioCost + seekCost + gateway + INFRASTRUCTURE_COSTS.paid + voiceCost;

    return {
      aiCostPremium: aiCost,
      aiCostTotal: aiCost,
      studioCostTotal: studioCost,
      seekCostTotal: seekCost,
      gatewayCost: gateway,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      voiceCost: voiceCost,
      totalCost,
      revenue: 1299,
      profit: 1299 - totalCost,
      margin: ((1299 - totalCost) / 1299) * 100,
    };
  })(),

  // ──────────────────────────────────────
  // COST ANALYSIS - INTERNATIONAL
  // Revenue: $69.99 (₹6,253.81) | Margin: 25%
  // Voice: 120 min total (100 voice + 20 camera worst case)
  // Seek: 250 searches
  // ──────────────────────────────────────
  costsInternational: (() => {
    const aiCost = 3992.01; // Pre-calculated with tiered Sonnet + Gemini 3 Pro pricing
    const studioCost = 3000 * STUDIO_CREDIT_COST;
    const seekCost = 250 * SEEK_LIMITS.costPerSearch;
    const revenueINR = 69.99 * USD_TO_INR_RATE;
    const gateway = revenueINR * (GATEWAY_FEE_STRIPE_PERCENTAGE / 100) + (GATEWAY_FEE_STRIPE_FIXED_USD * USD_TO_INR_RATE);
    const voiceCost = (100 * VOICE_COSTS.onair.perMinute) + (20 * VOICE_COSTS.camera.perMinute);
    const totalCost = aiCost + studioCost + seekCost + gateway + INFRASTRUCTURE_COSTS.paid + voiceCost;

    return {
      aiCostPremium: aiCost,
      aiCostTotal: aiCost,
      studioCostTotal: studioCost,
      seekCostTotal: seekCost,
      gatewayCost: gateway,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      voiceCost: voiceCost,
      totalCost,
      revenue: revenueINR,
      profit: revenueINR - totalCost,
      margin: ((revenueINR - totalCost) / revenueINR) * 100,
    };
  })(),

  // ──────────────────────────────────────
  // PAYMENT GATEWAY IDs
  // ──────────────────────────────────────
  paymentGateway: {
    razorpay: 'plan_apex_monthly',
    razorpayYearly: 'plan_apex_yearly',
    stripe: 'price_apex_monthly_usd',
    stripeYearly: 'price_apex_yearly_usd',
  },
},
  [PlanType.SOVEREIGN]: {
  id: PlanType.SOVEREIGN,
  name: 'sovereign',
  displayName: 'Soriva Sovereign',
  tagline: 'Unlimited founder access.',
  description: 'Internal access for Risenex founders - No limits',
  price: 0,
  priceUSD: 0,
  priceYearly: 0,
  priceYearlyUSD: 0,
  yearlyDiscount: 0,
  yearlyDiscountInternational: 0,
  enabled: true,
  order: 5,
  personality: 'Premium companion with full access - Founder Edition',
  bonusTokens: 999999999,

  // ──────────────────────────────────────
  // USAGE LIMITS - UNLIMITED
  // ──────────────────────────────────────
  limits: {
    monthlyTokens: 999999999,
    monthlyWords: 999999999,
    dailyTokens: 999999999,
    dailyWords: 999999999,
    botResponseLimit: 9999,
    memoryDays: 365,
    contextMemory: 100,
    responseDelay: 0,
    voiceMinutes: 999999,
    cameraMinutes: 999999,
    voiceTechnology: VoiceTechnology.ONAIR,
    studioCredits: 999999,
    studio: {
      images: 999999,
      talkingPhotos: 999999,
      logoPreview: 999999,
      logoPurchase: 999999,
    },
  },

  // ──────────────────────────────────────
  // USAGE LIMITS - INTERNATIONAL (same as India for Sovereign)
  // ──────────────────────────────────────
  limitsInternational: {
    monthlyTokens: 999999999,
    monthlyWords: 999999999,
    dailyTokens: 999999999,
    dailyWords: 999999999,
    botResponseLimit: 9999,
    memoryDays: 365,
    contextMemory: 100,
    responseDelay: 0,
    voiceMinutes: 999999,
    cameraMinutes: 999999,
    voiceTechnology: VoiceTechnology.ONAIR,
    studioCredits: 999999,
    studio: {
      images: 999999,
      talkingPhotos: 999999,
      logoPreview: 999999,
      logoPurchase: 999999,
    },
  },

  // ──────────────────────────────────────
  // AI MODELS - ALL MODELS ACCESS
  // ──────────────────────────────────────
  aiModels: [
    {
      provider: AIProvider.GEMINI,
      modelId: 'gemini-2.5-flash',
      displayName: 'Gemini Flash',
      tier: RoutingTier.CASUAL,
      percentage: 25,
    },
    {
      provider: AIProvider.MOONSHOT,
      modelId: 'moonshotai/kimi-k2-thinking',
      displayName: 'Kimi K2',
      tier: RoutingTier.SIMPLE,
      percentage: 25,
    },
    {
      provider: AIProvider.GEMINI,
      modelId: 'gemini-3-pro',
      displayName: 'Gemini 3 Pro',
      tier: RoutingTier.MEDIUM,
      percentage: 15,
    },
    {
      provider: AIProvider.OPENAI,
      modelId: 'gpt-5.1',
      displayName: 'GPT-5.1',
      tier: RoutingTier.EXPERT,
      percentage: 20,
    },
    {
      provider: AIProvider.CLAUDE,
      modelId: 'claude-sonnet-4-5',
      displayName: 'Claude Sonnet 4.5',
      tier: RoutingTier.EXPERT,
      percentage: 15,
    },
  ],

  // ──────────────────────────────────────
  // TOKEN ROUTING - SOVEREIGN
  // ──────────────────────────────────────
  routing: {
    'gemini-2.5-flash': 0.25,
    'moonshotai/kimi-k2-thinking': 0.25,
    'gemini-3-pro': 0.15,
    'gpt-5.1': 0.20,
    'claude-sonnet-4-5': 0.15,
  },

  routingInternational: {
    'gemini-2.5-flash': 0.25,
    'moonshotai/kimi-k2-thinking': 0.25,
    'gemini-3-pro': 0.15,
    'gpt-5.1': 0.20,
    'claude-sonnet-4-5': 0.15,
  },

  // ──────────────────────────────────────
  // PLAN FLAGS
  // ──────────────────────────────────────
  isHybrid: false,
  hasSmartRouting: true,
  hasDynamicDailyLimits: false,
  tokenExpiryEnabled: false,

  // ──────────────────────────────────────
  // NO BOOSTERS NEEDED FOR SOVEREIGN
  // ──────────────────────────────────────
  cooldownBooster: undefined,
  addonBooster: undefined,

  // ──────────────────────────────────────
  // DOCUMENT INTELLIGENCE - FULL ACCESS
  // ──────────────────────────────────────
  documentation: {
    enabled: true,
    tier: 'apex',
    displayName: 'Sovereign Intelligence Suite',
    badge: '👑 SOVEREIGN',
    tagline: 'Unlimited document intelligence',
    monthlyWords: 999999999,
    maxWorkspaces: 9999,
    exportFormats: ['pdf', 'docx', 'markdown', 'html', 'pptx', 'xlsx'],
    templates: true,
    versionHistory: 365,
    collaboration: true,
    advancedFeatures: {
      smartWorkflow: true,
      aiTagging: true,
      decisionSnapshot: true,
      legalFinanceLens: true,
      multiformatFusion: true,
      businessContextMemory: true,
      emotionalContextSummarizer: true,
      memoryCapsule: true,
      companionNotes: true,
      thoughtOrganizer: true,
      aiScrapbook: true,
      lifeReflectionInsights: true,
    },
  },

  // ──────────────────────────────────────
  // FEATURES - ALL ENABLED
  // ──────────────────────────────────────
  features: {
    studio: true,
    documentIntelligence: true,
    fileUpload: true,
    prioritySupport: true,
    smartRouting: true,
    multiModel: true,
  },

  // ──────────────────────────────────────
  // COSTS - FREE (Internal use)
  // ──────────────────────────────────────
  costs: {
    aiCostPremium: 0,
    aiCostTotal: 0,
    studioCostTotal: 0,
    gatewayCost: 0,
    infraCostPerUser: 0,
    voiceCost: 0,
    totalCost: 0,
    revenue: 0,
    profit: 0,
    margin: 0,
  },

  costsInternational: {
    aiCostPremium: 0,
    aiCostTotal: 0,
    studioCostTotal: 0,
    gatewayCost: 0,
    infraCostPerUser: 0,
    voiceCost: 0,
    totalCost: 0,
    revenue: 0,
    profit: 0,
    margin: 0,
  },

  // ──────────────────────────────────────
  // NO PAYMENT GATEWAY (Free internal)
  // ──────────────────────────────────────
  paymentGateway: {
  razorpay: '',
  razorpayYearly: '',
  stripe: '',
  stripeYearly: '',
},
},
};

// ==========================================
// 🎨 STUDIO CONSTANTS & BOOSTERS
// ==========================================

/**
 * Studio credits conversion rate
 * How many credits per rupee spent
 */
export const STUDIO_CREDITS_PER_RUPEE = 5;

/**
 * Maximum studio booster purchases per month
 */
export const STUDIO_BOOSTER_MAX_PER_MONTH = 3;

/**
 * Individual studio feature GPU costs (INR)
 * Based on actual compute costs
 */
export const STUDIO_FEATURE_COSTS = {
  /** Single AI image generation */
  IMAGE_GENERATION: 0.22,
  /** 5-second talking photo */
  TALKING_PHOTO_5SEC: 1.85,
  /** 10-second talking photo */
  TALKING_PHOTO_10SEC: 1.9,
  /** Logo preview set (3 variations) */
  LOGO_PREVIEW_SET: 0.58,
  /** Final HD logo generation */
  LOGO_FINAL: 10.12,
} as const;

// ==========================================
// 🎨 STUDIO BOOSTERS CONFIGURATION
// ==========================================

/**
 * Studio credit booster packages
 * Additional credits for power users
 * 83-88% profit margins
 */
export const STUDIO_BOOSTERS: Record<string, StudioBooster> = {

  // ──────────────────────────────────────
  // STUDIO LITE - Entry level
  // ₹99 / $4.99 for 420/1050 credits
  // ──────────────────────────────────────
  LITE: {
    id: 'studio_lite',
    type: 'STUDIO',
    name: 'studio_lite',
    displayName: 'Studio Lite',
    tagline: 'Start creating.',
    price: 99,
    priceUSD: 4.99,
    creditsAdded: 420,
    creditsAddedIntl: 1050,
    validity: 30,
    maxPerMonth: 3,
    costs: {
      gateway: 2.34,
      infra: 1.0,
      maxGPUCost: 420 * STUDIO_CREDIT_COST,
      total: 3.34 + (420 * STUDIO_CREDIT_COST),
      profit: 99 - (3.34 + (420 * STUDIO_CREDIT_COST)),
      margin: ((99 - (3.34 + (420 * STUDIO_CREDIT_COST))) / 99) * 100,
    },
    costsInternational: {
      gateway: 9.85,
      infra: 1.0,
      maxGPUCost: 1050 * STUDIO_CREDIT_COST,
      total: 10.85 + (1050 * STUDIO_CREDIT_COST),
      profit: (4.99 * USD_TO_INR_RATE) - (10.85 + (1050 * STUDIO_CREDIT_COST)),
      margin: (((4.99 * USD_TO_INR_RATE) - (10.85 + (1050 * STUDIO_CREDIT_COST))) / (4.99 * USD_TO_INR_RATE)) * 100,
    },
    paymentGateway: {
      razorpay: 'plan_studio_lite',
      stripe: 'price_studio_lite_usd',
    },
  },

  // ──────────────────────────────────────
  // STUDIO PRO - Most popular
  // ₹399 / $19.99 for 1695/4237 credits
  // ──────────────────────────────────────
  PRO: {
    id: 'studio_pro',
    type: 'STUDIO',
    name: 'studio_pro',
    displayName: 'Studio Pro',
    tagline: 'Create more. Create better.',
    price: 299,
    priceUSD: 19.99,
    creditsAdded: 1695,
    creditsAddedIntl: 4237,
    validity: 30,
    maxPerMonth: 2,
    popular: true,
    costs: {
      gateway: 9.42,
      infra: 2.0,
      maxGPUCost: 1695 * STUDIO_CREDIT_COST,
      total: 11.42 + (1695 * STUDIO_CREDIT_COST),
      profit: 399 - (11.42 + (1695 * STUDIO_CREDIT_COST)),
      margin: ((399 - (11.42 + (1695 * STUDIO_CREDIT_COST))) / 399) * 100,
    },
    costsInternational: {
      gateway: 39.52,
      infra: 2.0,
      maxGPUCost: 4237 * STUDIO_CREDIT_COST,
      total: 41.52 + (4237 * STUDIO_CREDIT_COST),
      profit: (19.99 * USD_TO_INR_RATE) - (41.52 + (4237 * STUDIO_CREDIT_COST)),
      margin: (((19.99 * USD_TO_INR_RATE) - (41.52 + (4237 * STUDIO_CREDIT_COST))) / (19.99 * USD_TO_INR_RATE)) * 100,
    },
    paymentGateway: {
      razorpay: 'plan_studio_pro',
      stripe: 'price_studio_pro_usd',
    },
  },

  // ──────────────────────────────────────
  // STUDIO MAX - Power users
  // ₹599 / $29.99 for 2545/6362 credits
  // ──────────────────────────────────────
  MAX: {
    id: 'studio_max',
    type: 'STUDIO',
    name: 'studio_max',
    displayName: 'Studio Max',
    tagline: 'Unlimited creativity.',
    price: 599,
    priceUSD: 29.99,
    creditsAdded: 2545,
    creditsAddedIntl: 6362,
    validity: 30,
    maxPerMonth: 2,
    costs: {
      gateway: 14.13,
      infra: 3.0,
      maxGPUCost: 2545 * STUDIO_CREDIT_COST,
      total: 17.13 + (2545 * STUDIO_CREDIT_COST),
      profit: 599 - (17.13 + (2545 * STUDIO_CREDIT_COST)),
      margin: ((599 - (17.13 + (2545 * STUDIO_CREDIT_COST))) / 599) * 100,
    },
    costsInternational: {
      gateway: 59.29,
      infra: 3.0,
      maxGPUCost: 6362 * STUDIO_CREDIT_COST,
      total: 62.29 + (6362 * STUDIO_CREDIT_COST),
      profit: (29.99 * USD_TO_INR_RATE) - (62.29 + (6362 * STUDIO_CREDIT_COST)),
      margin: (((29.99 * USD_TO_INR_RATE) - (62.29 + (6362 * STUDIO_CREDIT_COST))) / (29.99 * USD_TO_INR_RATE)) * 100,
    },
    paymentGateway: {
      razorpay: 'plan_studio_max',
      stripe: 'price_studio_max_usd',
    },
  },
};

// ==========================================
// 🎨 STUDIO FEATURES CONFIGURATION
// ==========================================

/**
 * Studio feature interface
 * Defines individual creative features
 */
export interface StudioFeature {
  /** Unique feature identifier */
  id: string;
  /** Display name */
  name: string;
  /** Feature category */
  category: 'image' | 'video' | 'audio';
  /** Credits required */
  credits: number;
  /** Preview credits (if different) */
  previewCredits?: number;
  /** Whether free preview is available */
  freePreview?: boolean;
  /** Maximum previews allowed */
  maxPreviews?: number;
  /** Output resolution */
  resolution?: string;
  /** Duration in seconds (for video) */
  duration?: number;
  /** Expected processing time */
  processingTime: string;
  /** Output file format */
  outputFormat: string;
  /** GPU compute cost (INR) */
  gpuCost: number;
  /** Profit margin */
  margin: number;
}

/**
 * Available studio features
 * Each feature with full configuration
 */
export const STUDIO_FEATURES = {

  // ──────────────────────────────────────
  // IMAGE GENERATION - 512×512
  // Basic resolution, fastest generation
  // ──────────────────────────────────────
  IMAGE_512: {
    id: 'IMAGE_512',
    name: 'AI Image (512×512)',
    category: 'image' as const,
    resolution: '512x512',
    credits: 10,
    previewCredits: 10,
    processingTime: '3-5 seconds',
    outputFormat: 'PNG',
    gpuCost: 0.22,
    margin: 0.89,
  },

  // ──────────────────────────────────────
  // IMAGE GENERATION - 1024×1024
  // High resolution, standard quality
  // ──────────────────────────────────────
  IMAGE_1024: {
    id: 'IMAGE_1024',
    name: 'AI Image (1024×1024)',
    category: 'image' as const,
    resolution: '1024x1024',
    credits: 10,
    previewCredits: 10,
    processingTime: '5-8 seconds',
    outputFormat: 'PNG',
    gpuCost: 0.22,
    margin: 0.89,
  },

  // ──────────────────────────────────────
  // TALKING PHOTO - 5 SECONDS
  // Short animated avatar video
  // ──────────────────────────────────────
  TALKING_PHOTO_5SEC: {
    id: 'TALKING_PHOTO_5SEC',
    name: 'Talking Photo (5 seconds)',
    category: 'video' as const,
    duration: 5,
    resolution: '720p',
    credits: 75,
    processingTime: '10-30 seconds',
    outputFormat: 'MP4',
    gpuCost: 1.85,
    margin: 0.877,
  },

  // ──────────────────────────────────────
  // TALKING PHOTO - 10 SECONDS
  // Longer animated avatar video
  // ──────────────────────────────────────
  TALKING_PHOTO_10SEC: {
    id: 'TALKING_PHOTO_10SEC',
    name: 'Talking Photo (10 seconds)',
    category: 'video' as const,
    duration: 10,
    resolution: '720p',
    credits: 125,
    processingTime: '10-30 seconds',
    outputFormat: 'MP4',
    gpuCost: 1.9,
    margin: 0.924,
  },

  // ──────────────────────────────────────
  // LOGO PREVIEW
  // 3 logo variations for selection
  // ──────────────────────────────────────
  LOGO_PREVIEW: {
    id: 'LOGO_PREVIEW',
    name: 'Logo Preview Set (3 previews)',
    category: 'image' as const,
    credits: 15,
    previewCredits: 15,
    processingTime: '5-10 seconds per preview',
    outputFormat: 'PNG',
    gpuCost: 0.58,
    margin: 0.807,
  },

  // ──────────────────────────────────────
  // LOGO FINAL
  // High-resolution final logo
  // ──────────────────────────────────────
  LOGO_FINAL: {
    id: 'LOGO_FINAL',
    name: 'Final HD Logo',
    category: 'image' as const,
    resolution: 'HD (high quality)',
    credits: 145,
    processingTime: '30-60 seconds',
    outputFormat: 'PNG (high resolution)',
    gpuCost: 10.12,
    margin: 0.651,
  },
} as const;

// ==========================================
// 📚 DOCUMENT INTELLIGENCE TIERS
// ==========================================

/**
 * Document Intelligence tier configurations
 * Display information for each tier
 */
export const DOC_INTELLIGENCE_TIERS = {
  standard: {
    displayName: 'Document Intelligence',
    badge: '✨',
    description: 'Smart documentation for everyday needs',
  },
  pro: {
    displayName: 'Document Intelligence Pro',
    badge: '🚀 PRO',
    description: 'Professional-grade documentation workspace',
  },
  apex: {
    displayName: 'Apex Intelligence Suite',
    badge: '👑 APEX',
    description: 'Business intelligence meets emotional depth',
  },
} as const;

/**
 * Export formats available by tier
 */
export const EXPORT_FORMATS_BY_TIER = {
  standard: ['pdf', 'markdown'],
  pro: ['pdf', 'docx', 'markdown', 'html'],
  apex: ['pdf', 'docx', 'markdown', 'html', 'pptx', 'xlsx'],
} as const;

// ==========================================
// ⚙️ HELPER CONSTANTS
// ==========================================

/**
 * Hinglish token savings multiplier
 * Conservative estimate - Hinglish can be unpredictable with tokenizers
 * Will be adjusted based on real analytics in Phase 2
 */
export const HINGLISH_TOKEN_SAVINGS = 0.1;

/**
 * Cooldown booster configuration
 */
export const COOLDOWN_DURATION_HOURS = 0;        // Instant unlock
export const COOLDOWN_MAX_PER_PERIOD = 1;        // Max per plan period (paid)
export const COOLDOWN_MAX_STARTER = 5;           // Max for starter (calendar month)

/**
 * Addon booster configuration
 */
export const ADDON_MAX_PER_MONTH = 2;            // Max addon purchases per month
export const ADDON_VALIDITY_DAYS = 7;            // Addon validity period

/**
 * Yearly subscription token strategy
 * 11 months tokens + 12 months platform access = "2 Months FREE" marketing
 */
export const YEARLY_TOKEN_MONTHS = 11;           // Tokens for 11 months, not 12
export const YEARLY_PLATFORM_MONTHS = 12;        // Full 12 months access

/**
 * Trial configuration
 */
export const TRIAL_MAX_DAYS = 14;                // Maximum trial duration

/**
 * Fallback trigger rate
 * Percentage of requests that trigger fallback models
 */
export const FALLBACK_TRIGGER_RATE = 0.5;

/**
 * Usage warning threshold
 * Show warning when usage exceeds this percentage
 */
export const USAGE_WARNING_THRESHOLD = 85;

/**
 * International usage multiplier
 * International users get 2× the tokens/credits
 */
export const USAGE_MULTIPLIER_INTERNATIONAL = 2.0;
// ==========================================
// 🎯 TOKEN CONTROL LOGIC (Daily Limit Management)
// ==========================================
/**
 * Smart token control for tool/document generation
 * 
 * LOGIC:
 * - User < 80% daily limit → Normal flow, hardLimit applies
 * - User > 80% + Tool request → Complete task + 500 buffer → STOP
 * - User > 100% → Block immediately
 * 
 * This ensures tool tasks ALWAYS complete, never fail mid-way
 */
export const TOKEN_CONTROL_LOGIC = {
  [PlanType.STARTER]: {
    softLimitPercent: 80,
    softLimit: 8000,               // 80% of 16,666
    hardLimit: 10000,
    postToolBuffer: 300,
    maxToolCost: 5000,
  },
  [PlanType.PLUS]: {
    softLimitPercent: 80,
    softLimit: 31466,               // 80% of 39,333
    hardLimit: 39333,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.PRO]: {
    softLimitPercent: 80,
    softLimit: 34666,               // 80% of 43,333
    hardLimit: 43333,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.APEX]: {
    softLimitPercent: 80,
    softLimit: 73334,               // 80% of 91,667
    hardLimit: 91667,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.SOVEREIGN]: {
    softLimitPercent: 100,
    softLimit: 999999999,
    hardLimit: 999999999,
    postToolBuffer: 999999,
    maxToolCost: 999999,
  },
} as const;

// International token limits (2x India for paid plans)
export const TOKEN_CONTROL_LOGIC_INTL = {
  [PlanType.STARTER]: TOKEN_CONTROL_LOGIC[PlanType.STARTER], // Same as India
  [PlanType.PLUS]: {
    softLimitPercent: 80,
    softLimit: 60000,               // 80% of 75,000
    hardLimit: 75000,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.PRO]: {
    softLimitPercent: 80,
    softLimit: 124000,              // 80% of 155,000
    hardLimit: 155000,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.APEX]: {
    softLimitPercent: 80,
    softLimit: 180518,              // 80% of 225,647
    hardLimit: 225647,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.SOVEREIGN]: TOKEN_CONTROL_LOGIC[PlanType.SOVEREIGN], // Same
} as const;
// ==========================================
// 🛡️ STARTER PLAN ABUSE PROTECTION
// ==========================================
/**
 * Protection against free tier abuse
 * Critical for controlling acquisition costs
 */
export const STARTER_PROTECTION = {
  // Hard Caps (Non-negotiable)
  dailyTokenCap: 16666,             // Strict 16.6K daily limit
  monthlyTokenCap: 500000,          // 500K monthly max
  maxMessagesPerHour: 20,           // Rate limiting
  maxMessagesPerDay: 100,           // Daily message cap
  
  // IP Throttling
  maxAccountsPerIP: 2,              // Max 2 accounts per IP
  ipCooldownHours: 24,              // 24hr cooldown for new accounts from same IP
  
  // Abuse Detection Triggers
  enableCaptchaAfterMessages: 10,   // Show captcha after 10 messages/session
  suspiciousPatternBlock: true,     // Auto-block bot-like patterns
  maxRequestsPerMinute: 5,          // Burst protection
  
  // Cost Protection
  maxMonthlyLossPerUser: 15,        // ₹15 max loss per free user
  autoRestrictOnAbuse: true,        // Auto-restrict abusive accounts
  
  // Response Limitations
  maxResponseTokens: 500,           // Shorter responses for free tier
  responseDelaySeconds: 5,          // 5 second delay between responses
} as const;

// ==========================================
// 🛠️ HELPER FUNCTIONS
// ==========================================

/**
 * Get region from country code
 * @param countryCode - ISO country code (e.g., 'IN', 'US')
 * @returns Region enum value
 */
export function getRegionFromCountry(countryCode: string): Region {
  return countryCode.toUpperCase() === 'IN' ? Region.INDIA : Region.INTERNATIONAL;
}

/**
 * Get currency from region
 * @param region - Region enum value
 * @returns Currency enum value
 */
export function getCurrencyFromRegion(region: Region): Currency {
  return REGION_CURRENCY_MAP[region];
}

/**
 * Get plan pricing for a specific region
 * Returns appropriate price, limits, routing, and costs
 *
 * @param planType - Plan type enum value
 * @param region - Region (default: India)
 * @returns Plan pricing configuration
 */
export function getPlanPricing(planType: PlanType, region: Region = Region.INDIA) {
  const plan = PLANS_STATIC_CONFIG[planType];

  if (region === Region.INDIA) {
    return {
      price: plan.price,
      currency: Currency.INR,
      symbol: '₹',
      limits: plan.limits,
      routing: plan.routing,
      costs: plan.costs,
    };
  }

  return {
    price: plan.priceUSD || plan.price,
    currency: Currency.USD,
    symbol: '$',
    limits: plan.limitsInternational || plan.limits,
    routing: plan.routingInternational || plan.routing,
    costs: plan.costsInternational || plan.costs,
  };
}

/**
 * Get studio booster pricing for a specific region
 *
 * @param boosterType - Booster type (LITE, PRO, MAX)
 * @param region - Region (default: India)
 * @returns Booster pricing configuration
 */
export function getStudioBoosterPricing(
  boosterType: string,
  region: Region = Region.INDIA
) {
  const booster = STUDIO_BOOSTERS[boosterType];

  if (region === Region.INDIA) {
    return {
      price: booster.price,
      currency: Currency.INR,
      symbol: '₹',
      credits: booster.creditsAdded,
      costs: booster.costs,
    };
  }

  return {
    price: booster.priceUSD || booster.price,
    currency: Currency.USD,
    symbol: '$',
    credits: booster.creditsAddedIntl || booster.creditsAdded,
    costs: booster.costsInternational || booster.costs,
  };
}

/**
 * Format price with currency symbol
 *
 * @param price - Numeric price value
 * @param currency - Currency type
 * @returns Formatted price string (e.g., "₹399" or "$15.99")
 */
export function formatPrice(price: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];

  if (currency === Currency.INR) {
    return `${symbol}${Math.round(price)}`;
  }

  return `${symbol}${price.toFixed(2)}`;
}

/**
 * Get payment gateway for a region
 *
 * @param region - Region enum value
 * @returns Payment gateway name
 */
export function getPaymentGateway(region: Region): string {
  return REGION_PAYMENT_GATEWAY[region];
}

/**
 * Convert tokens to words using model-specific ratio
 *
 * @param tokens - Token count
 * @param modelId - Model identifier
 * @returns Approximate word count
 */
export function tokensToWords(tokens: number, modelId: string): number {
  const ratio = getTokenRatio(modelId);
  return Math.floor(tokens / ratio);
}

/**
 * Convert words to tokens using model-specific ratio
 *
 * @param words - Word count
 * @param modelId - Model identifier
 * @returns Approximate token count
 */
export function wordsToTokens(words: number, modelId: string): number {
  const ratio = getTokenRatio(modelId);
  return Math.floor(words * ratio);
}

/**
 * Calculate dynamic daily limit based on remaining allocation
 * Ensures even distribution of remaining tokens across remaining days
 *
 * @param remainingTokens - Tokens remaining in period
 * @param remainingDays - Days remaining in period
 * @returns Daily token limit
 */
export function calculateDynamicDailyLimit(
  remainingTokens: number,
  remainingDays: number
): number {
  if (remainingDays <= 0) return 0;
  return Math.floor(remainingTokens / remainingDays);
}

/**
 * Get plan routing configuration for a region
 *
 * @param planType - Plan type enum value
 * @param region - Region (default: India)
 * @returns Routing configuration object
 */
export function getPlanRouting(planType: PlanType, region: Region = Region.INDIA) {
  const plan = PLANS_STATIC_CONFIG[planType];
  if (region === Region.INTERNATIONAL && plan.routingInternational) {
    return plan.routingInternational;
  }
  return plan.routing || {};
}

/**
 * Get all enabled plans
 *
 * @returns Array of enabled plans
 */
export function getEnabledPlans(): Plan[] {
  return Object.values(PLANS_STATIC_CONFIG).filter(plan => plan.enabled);
}

/**
 * Get plan by name
 *
 * @param name - Plan name (e.g., 'starter', 'plus', 'pro', 'apex')
 * @returns Plan configuration or undefined
 */
export function getPlanByName(name: string): Plan | undefined {
  return Object.values(PLANS_STATIC_CONFIG).find(
    plan => plan.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get plans sorted by order
 *
 * @returns Array of plans sorted by display order
 */
export function getPlansSorted(): Plan[] {
  return Object.values(PLANS_STATIC_CONFIG).sort((a, b) => a.order - b.order);
}

/**
 * Check if a plan has a specific feature
 *
 * @param planType - Plan type enum value
 * @param feature - Feature name
 * @returns Boolean indicating feature availability
 */
export function planHasFeature(
  planType: PlanType,
  feature: keyof Plan['features']
): boolean {
  const plan = PLANS_STATIC_CONFIG[planType];
  return plan?.features?.[feature] ?? false;
}

/**
 * Get cooldown booster for a plan
 *
 * @param planType - Plan type enum value
 * @returns Cooldown booster configuration or undefined
 */
export function getCooldownBooster(planType: PlanType): CooldownBooster | undefined {
  return PLANS_STATIC_CONFIG[planType]?.cooldownBooster;
}

/**
 * Get addon booster for a plan
 *
 * @param planType - Plan type enum value
 * @returns Addon booster configuration or undefined
 */
export function getAddonBooster(planType: PlanType): AddonBooster | undefined {
  return PLANS_STATIC_CONFIG[planType]?.addonBooster;
}

/**
 * Calculate usage percentage
 *
 * @param used - Amount used
 * @param total - Total allocation
 * @returns Percentage (0-100)
 */
export function calculateUsagePercentage(used: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

/**
 * Check if usage is above warning threshold
 *
 * @param used - Amount used
 * @param total - Total allocation
 * @returns Boolean indicating if warning should be shown
 */
export function isUsageWarning(used: number, total: number): boolean {
  return calculateUsagePercentage(used, total) >= USAGE_WARNING_THRESHOLD;
}
/**
 * Get effective token limit based on usage and request type
 * Implements smart tool completion logic
 *
 * @param planType - User's plan
 * @param currentUsage - Tokens used today
 * @param isToolRequest - Is this a tool/document request
 * @param region - User's region (default: India)
 * @returns Token limit decision object
 */
export function getEffectiveTokenLimit(
  planType: PlanType,
  currentUsage: number,
  isToolRequest: boolean,
  region: Region = Region.INDIA
) {
  const config = region === Region.INDIA 
    ? TOKEN_CONTROL_LOGIC[planType]
    : TOKEN_CONTROL_LOGIC_INTL[planType];
  
  // Case 1: Over hard limit already → Block
  if (currentUsage >= config.hardLimit) {
    return {
      canProceed: false,
      extendedMode: false,
      limitAfterTask: true,
      remaining: 0,
      postBuffer: 0,
      message: 'Daily limit reached. Kal milte hain! 🙏'
    };
  }
  
  // Case 2: Over soft limit (80%) + Tool request → Complete task, then STOP
  if (currentUsage >= config.softLimit && isToolRequest) {
    return {
      canProceed: true,
      extendedMode: true,
      limitAfterTask: true,
      remaining: 0,
      postBuffer: config.postToolBuffer,
      message: null  // Show after task completes
    };
  }
  
  // Case 3: Normal flow → Under limits
  return {
    canProceed: true,
    extendedMode: false,
    limitAfterTask: false,
    remaining: config.hardLimit - currentUsage,
    postBuffer: 0,
    message: null
  };
}

/**
 * Mark user's daily limit as exceeded after tool completion
 * Call this after tool task finishes in extended mode
 *
 * @param postBuffer - Remaining buffer tokens for minor chat
 * @returns Limit exceeded state
 */
export function createLimitExceededState(postBuffer: number) {
  return {
    limitExceeded: true,
    bufferRemaining: postBuffer,
    exceededAt: new Date().toISOString(),
    message: 'Aaj ki limit complete ho gayi! Kal fresh quota milega. 🙏'
  };
}
/**
 * Get studio feature by ID
 *
 * @param featureId - Feature identifier
 * @returns Studio feature configuration or undefined
 */
export function getStudioFeature(featureId: string): typeof STUDIO_FEATURES[keyof typeof STUDIO_FEATURES] | undefined {
  return STUDIO_FEATURES[featureId as keyof typeof STUDIO_FEATURES];
}

/**
 * Calculate studio credits needed for a feature
 *
 * @param featureId - Feature identifier
 * @param quantity - Number of generations
 * @returns Total credits needed
 */
export function calculateStudioCredits(featureId: string, quantity: number = 1): number {
  const feature = getStudioFeature(featureId);
  if (!feature) return 0;
  return feature.credits * quantity;
}

// ==========================================
// 🌍 USER LOCATION DEFAULTS
// ==========================================

/**
 * Default user location configuration
 * Used when location cannot be determined
 */
export const USER_LOCATION = {
  country: 'India',
  region: Region.INDIA,
  currency: Currency.INR,
} as const;

// ==========================================
// 📊 PLAN COMPARISON HELPERS
// ==========================================

/**
 * Get upgrade path for a plan
 *
 * @param currentPlan - Current plan type
 * @returns Array of available upgrade plans
 */
export function getUpgradePath(currentPlan: PlanType): Plan[] {
  const currentOrder = PLANS_STATIC_CONFIG[currentPlan]?.order || 0;
  return getPlansSorted().filter(plan => plan.order > currentOrder && plan.enabled);
}

/**
 * Get downgrade path for a plan
 *
 * @param currentPlan - Current plan type
 * @returns Array of available downgrade plans
 */
export function getDowngradePath(currentPlan: PlanType): Plan[] {
  const currentOrder = PLANS_STATIC_CONFIG[currentPlan]?.order || 0;
  return getPlansSorted().filter(plan => plan.order < currentOrder && plan.enabled);
}

/**
 * Calculate price difference between plans
 *
 * @param fromPlan - Source plan type
 * @param toPlan - Target plan type
 * @param region - Region for pricing
 * @returns Price difference (positive for upgrade, negative for downgrade)
 */
export function calculatePriceDifference(
  fromPlan: PlanType,
  toPlan: PlanType,
  region: Region = Region.INDIA
): number {
  const fromPricing = getPlanPricing(fromPlan, region);
  const toPricing = getPlanPricing(toPlan, region);
  return toPricing.price - fromPricing.price;
}

/**
 * Get token increase percentage when upgrading
 *
 * @param fromPlan - Source plan type
 * @param toPlan - Target plan type
 * @param region - Region for limits
 * @returns Percentage increase in tokens
 */
export function getTokenIncreasePercentage(
  fromPlan: PlanType,
  toPlan: PlanType,
  region: Region = Region.INDIA
): number {
  const fromPricing = getPlanPricing(fromPlan, region);
  const toPricing = getPlanPricing(toPlan, region);

  const fromTokens = fromPricing.limits.monthlyTokens;
  const toTokens = toPricing.limits.monthlyTokens;

  if (fromTokens <= 0) return 100;
  return Math.round(((toTokens - fromTokens) / fromTokens) * 100);
}

/**
 * Get plan pricing for a specific billing cycle
 *
 * @param planType - Plan type enum value
 * @param region - Region (default: India)
 * @param billingCycle - Monthly or Yearly
 * @returns Plan pricing configuration
 */
export function getPlanPricingByCycle(
  planType: PlanType,
  region: Region = Region.INDIA,
  billingCycle: BillingCycle = BillingCycle.MONTHLY
) {
  const plan = PLANS_STATIC_CONFIG[planType];
  const isYearly = billingCycle === BillingCycle.YEARLY;

  // Calculate yearly tokens (11 months worth)
  const getYearlyLimits = (baseLimits: UsageLimits): UsageLimits => ({
    ...baseLimits,
    monthlyTokens: Math.floor(baseLimits.monthlyTokens * YEARLY_TOKEN_MONTHS),
    monthlyWords: Math.floor(baseLimits.monthlyWords * YEARLY_TOKEN_MONTHS),
  });

  if (region === Region.INDIA) {
    return {
      price: isYearly ? (plan.priceYearly || plan.price * 12) : plan.price,
      priceMonthly: plan.price,
      currency: Currency.INR,
      symbol: '₹',
      billingCycle,
      discount: isYearly ? (plan.yearlyDiscount || 0) : 0,
      limits: isYearly ? getYearlyLimits(plan.limits) : plan.limits,
      routing: isYearly ? (plan.routingYearly || plan.routing) : plan.routing,
      costs: plan.costs,
      gatewayPlanId: isYearly 
        ? plan.paymentGateway?.razorpayYearly 
        : plan.paymentGateway?.razorpay,
    };
  }

  // International
  const intlLimits = plan.limitsInternational || plan.limits;
  return {
    price: isYearly ? (plan.priceYearlyUSD || (plan.priceUSD || 0) * 12) : (plan.priceUSD || 0),
    priceMonthly: plan.priceUSD || 0,
    currency: Currency.USD,
    symbol: '$',
    billingCycle,
    discount: isYearly ? (plan.yearlyDiscountInternational || plan.yearlyDiscount || 0) : 0,
    limits: isYearly ? getYearlyLimits(intlLimits) : intlLimits,
    routing: isYearly 
      ? (plan.routingInternationalYearly || plan.routingInternational || plan.routing) 
      : (plan.routingInternational || plan.routing),
    costs: plan.costsInternational || plan.costs,
    gatewayPlanId: isYearly 
      ? plan.paymentGateway?.stripeYearly 
      : plan.paymentGateway?.stripe,
  };
}

/**
 * Calculate yearly savings
 *
 * @param planType - Plan type enum value
 * @param region - Region (default: India)
 * @returns Savings object with amount and percentage
 */
export function calculateYearlySavings(planType: PlanType, region: Region = Region.INDIA) {
  const plan = PLANS_STATIC_CONFIG[planType];
  
  if (region === Region.INDIA) {
    const monthlyTotal = plan.price * 12;
    const yearlyPrice = plan.priceYearly || monthlyTotal;
    const savings = monthlyTotal - yearlyPrice;
    
    return {
      monthlyTotal,
      yearlyPrice,
      savings,
      savingsPercentage: plan.yearlyDiscount || Math.round((savings / monthlyTotal) * 100),
      freeMonths: 2,  // Marketing: "2 Months FREE"
      tokenMonths: YEARLY_TOKEN_MONTHS,  // Actual: 11 months tokens
      platformMonths: YEARLY_PLATFORM_MONTHS,  // Full: 12 months access
      currency: Currency.INR,
      symbol: '₹',
    };
  }

  const monthlyTotal = (plan.priceUSD || 0) * 12;
  const yearlyPrice = plan.priceYearlyUSD || monthlyTotal;
  const savings = monthlyTotal - yearlyPrice;

  return {
    monthlyTotal,
    yearlyPrice,
    savings,
    savingsPercentage: plan.yearlyDiscountInternational || plan.yearlyDiscount || Math.round((savings / monthlyTotal) * 100),
    freeMonths: 2,  // Marketing: "2 Months FREE"
    tokenMonths: YEARLY_TOKEN_MONTHS,  // Actual: 11 months tokens
    platformMonths: YEARLY_PLATFORM_MONTHS,  // Full: 12 months access
    currency: Currency.USD,
    symbol: '$',
  };
}