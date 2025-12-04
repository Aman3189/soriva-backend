// src/constants/plans.ts

/**
 * ==========================================
 * SORIVA V3 - FINALIZED PLANS CONFIGURATION
 * ==========================================
 * Complete pricing, token allocation, and booster strategy
 * Last Updated: November 30, 2025 - PRODUCTION READY v6.0
 *
 * ==========================================
 * MAJOR UPDATE v6.0 CHANGELOG:
 * ==========================================
 * ✅ EDGE + LIFE merged into single APEX plan
 * ✅ PRO price updated: ₹699 → ₹799 (clean ₹400 gap)
 * ✅ APEX India: ₹1,199 with 1.6M tokens
 * ✅ APEX International: $49.99 with 3.2M tokens + Claude Sonnet 4.5!
 * ✅ Clean 4-tier structure: Starter → Plus → Pro → Apex
 * ✅ Booster pricing updated for all plans
 * ✅ Removed EDGE and LIFE plan types
 *
 * ==========================================
 * APEX PLAN HIGHLIGHTS:
 * ==========================================
 * INDIA (₹1,199):
 * - Monthly Tokens: 1,600,000
 * - Routing: Flash 26.4% | Kimi K2 33.4% | G3 Pro 9.4% | GPT-5.1 21.5% | Sonnet 9.4%
 * - Studio Credits: 1,200
 * - Voice Minutes: 60
 * - Memory Days: 30
 * - NEW: Claude Sonnet 4.5 access (150K tokens)!
 *
 * INTERNATIONAL ($49.99):
 * - Monthly Tokens: 3,200,000 (2× India)
 * - Routing: Kimi K2 38.4% | GPT-5.1 26.6% | Flash 18.8% | Claude Sonnet 5.9% | G3 Pro 4.1%
 * - Studio Credits: 3,000
 * - EXCLUSIVE: Claude Sonnet 4.5 access (not available in India plan)
 *
 * ==========================================
 * PRICING STRUCTURE:
 * ==========================================
 * ┌───────────┬──────────┬──────────────┬─────────────┐
 * │ Plan      │ India    │ International│ Gap         │
 * ├───────────┼──────────┼──────────────┼─────────────┤
 * │ Starter   │ Free     │ Free         │ -           │
 * │ Plus      │ ₹399     │ $15.99       │ Base        │
 * │ Pro       │ ₹799     │ $29.99       │ +₹400       │
 * │ Apex      │ ₹1,199   │ $49.99       │ +₹400       │
 * └───────────┴──────────┴──────────────┴─────────────┘
 *
 * ==========================================
 * MARGIN TARGETS (Conservative 10:90 ratio):
 * ==========================================
 * - Starter: Loss leader (acquisition)
 * - Plus India: ~55% margin
 * - Plus International: ~65% margin
 * - Pro India: ~47% margin
 * - Pro International: ~55% margin
 * - Apex India: ~27% margin (with Sonnet quality boost) 
 * - Apex International: ~63% margin
 * - Cooldown Boosters: 97%+ margin (uses own tokens)
 * - Addon Boosters: 85%+ margin
 * - Studio Boosters: 83-88% margin
 *
 * ==========================================
 * BOOSTER PRICING SUMMARY:
 * ==========================================
 * COOLDOWN (Instant daily limit unlock, 97%+ margin):
 * - Starter: ₹15 (10K tokens)
 * - Plus: ₹15 / $1 (50K tokens)
 * - Pro: ₹25 / $1 (73K tokens)
 * - Apex: ₹35 / $1 (113K tokens)
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
 * - Gemini 2.5 Flash: ₹32.56
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
 * - Real-world margins expected 5-10% higher
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
  GROQ = 'groq',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  OPENAI = 'openai',
  MOONSHOT = 'moonshot',
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

/**
 * Currency enumeration
 * Supported currencies for billing
 */
export enum Currency {
  INR = 'INR',
  USD = 'USD',
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
 * Updated: November 2025
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
 * Updated: November 2025
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
    inputPer1M: 0.10,
    outputPer1M: 0.40,
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

  // Kimi K2 - Cost-effective reasoning (replaces Claude Haiku)
  'moonshotai/kimi-k2-thinking': {
    inputPer1M: 0.60,
    outputPer1M: 2.50,
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
  'gemini-2.5-flash': calculateEffectiveCost('gemini-2.5-flash'),             // ~₹32.56
  'claude-sonnet-4-5': calculateEffectiveCost('claude-sonnet-4-5'),           // ~₹1,217.87
  'gemini-2.5-pro': calculateEffectiveCost('gemini-2.5-pro'),                 // ~₹810.27
  'gemini-3-pro': calculateEffectiveCost('gemini-3-pro'),                     // ~₹982.03
  'gpt-5.1': calculateEffectiveCost('gpt-5.1'),                               // ~₹810.27
  'moonshotai/kimi-k2-thinking': calculateEffectiveCost('moonshotai/kimi-k2-thinking'), // ~₹206.58
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
  perPaidPlan: 45,
} as const;

/**
 * Studio credit cost (INR per credit)
 * Based on GPU compute costs
 */
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
  /** Tokens unlocked instantly */
  tokensUnlocked: number;
  /** Words equivalent unlocked */
  wordsUnlocked: number;
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
  /** Cost breakdown */
  costs: {
    ai: number;
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
  /** Total tokens in package */
  totalTokens: number;
  /** Daily boost amount (totalTokens / validity) */
  dailyBoost: number;
  /** Validity in days */
  validity: number;
  /** Distribution logic explanation */
  distributionLogic: string;
  /** Maximum purchases per month */
  maxPerMonth: number;
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
  /** Cost breakdown */
  costs: {
    ai: number;
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
  /** Studio feature limits */
  studio: StudioLimits;
  /** Studio credits allocation */
  studioCredits?: number;
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
  /** Monthly word limit for documents */
  monthlyWords: number;
  /** Maximum workspaces allowed */
  maxWorkspaces: number;
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
export interface Plan {
  /** Plan type enum value */
  id: PlanType;
  /** Internal plan name */
  name: string;
  /** Display name for UI */
  displayName: string;
  /** Marketing tagline */
  tagline: string;
  /** Plan description */
  description: string;
  /** Price in INR */
  price: number;
  /** Price in USD */
  priceUSD?: number;
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
  /** Usage limits (India) */
  limits: UsageLimits;
  /** Usage limits (International) */
  limitsInternational?: UsageLimits;
  /** Bonus limits configuration */
  bonusLimits?: BonusLimits;
  /** Available AI models */
  aiModels: AIModel[];
  /** Token routing distribution (India) */
  routing?: Record<string, number>;
  /** Token routing distribution (International) */
  routingInternational?: Record<string, number>;
  /** Whether plan uses hybrid routing */
  isHybrid: boolean;
  /** Whether smart routing is enabled */
  hasSmartRouting: boolean;
  /** Whether dynamic daily limits are enabled */
  hasDynamicDailyLimits: boolean;
  /** Whether unused tokens expire */
  tokenExpiryEnabled: boolean;
  /** Cooldown booster configuration */
  cooldownBooster?: CooldownBooster;
  /** Addon booster configuration */
  addonBooster?: AddonBooster;
  /** Document intelligence configuration */
  documentation?: DocumentIntelligence;
  /** Feature flags */
  features: {
    studio: boolean;
    documentIntelligence: boolean;
    fileUpload: boolean;
    prioritySupport: boolean;
    smartRouting: boolean;
    multiModel: boolean;
  };
  /** Cost breakdown (India) */
  costs: PlanCosts;
  /** Cost breakdown (International) */
  costsInternational?: PlanCosts;
  /** Payment gateway plan IDs */
  paymentGateway?: {
    cashfree?: string;
    razorpay?: string;
    stripe?: string;
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

    // ──────────────────────────────────────
    // USAGE LIMITS - INDIA
    // ──────────────────────────────────────
    limits: {
      monthlyTokens: 150000,
      monthlyWords: 100000,
      dailyTokens: 5000,
      dailyWords: 3333,
      botResponseLimit: 150,
      memoryDays: 5,
      contextMemory: 5,
      responseDelay: 5,
      voiceMinutes: 0,
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
      monthlyTokens: 150000,
      monthlyWords: 100000,
      dailyTokens: 5000,
      dailyWords: 3333,
      botResponseLimit: 150,
      memoryDays: 5,
      contextMemory: 5,
      responseDelay: 5,
      voiceMinutes: 0,
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
    // Single model for simplicity and cost
    // ──────────────────────────────────────
    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash-lite',
        displayName: 'Gemini Flash Lite',
        percentage: 100,
      },
    ],

    // ──────────────────────────────────────
    // TOKEN ROUTING
    // 100% to Flash Lite
    // ──────────────────────────────────────
    routing: {
      'gemini-2.5-flash-lite': 1.0,
    },

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
    // ₹15 for 10K tokens (97.7% margin)
    // Max 5 per calendar month
    // ──────────────────────────────────────
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Starter Instant Unlock',
      description: 'Unlock 10,000 tokens instantly when you hit your daily limit',
      price: 15,
      tokensUnlocked: 10000,
      wordsUnlocked: 6667,
      logic: 'Uses own monthly tokens, deducts from remaining pool',
      duration: 0,
      maxPerPlanPeriod: 5,
      resetOn: 'calendar',
      costs: {
        ai: 0,
        gateway: 0.35,
        total: 0.35,
        profit: 14.65,
        margin: 97.7,
      },
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
    // Loss leader: -₹9.88 per user
    // ──────────────────────────────────────
    costs: {
      aiCostPremium: calculateModelCost('gemini-2.5-flash-lite', 150000),
      aiCostTotal: calculateModelCost('gemini-2.5-flash-lite', 150000),
      studioCostTotal: 0,
      gatewayCost: 0,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      voiceCost: 0,
      totalCost: calculateModelCost('gemini-2.5-flash-lite', 150000) + INFRASTRUCTURE_COSTS.starter,
      revenue: 0,
      profit: -(calculateModelCost('gemini-2.5-flash-lite', 150000) + INFRASTRUCTURE_COSTS.starter),
      margin: -100,
    },

    // ──────────────────────────────────────
    // COST ANALYSIS - INTERNATIONAL
    // Same as India for free tier
    // ──────────────────────────────────────
    costsInternational: {
      aiCostPremium: calculateModelCost('gemini-2.5-flash-lite', 150000),
      aiCostTotal: calculateModelCost('gemini-2.5-flash-lite', 150000),
      studioCostTotal: 0,
      gatewayCost: 0,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      voiceCost: 0,
      totalCost: calculateModelCost('gemini-2.5-flash-lite', 150000) + INFRASTRUCTURE_COSTS.starter,
      revenue: 0,
      profit: -(calculateModelCost('gemini-2.5-flash-lite', 150000) + INFRASTRUCTURE_COSTS.starter),
      margin: -100,
    },
  },

  // ==========================================
  // ⚡ PLUS PLAN (₹399 / $15.99)
  // ==========================================
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
    description: 'Smart AI routing + 750K tokens + Studio access',
    price: 399,
    priceUSD: 15.99,
    enabled: true,
    popular: true,
    hero: true,
    order: 2,
    personality: 'Versatile, productivity-oriented, balanced',

    // ──────────────────────────────────────
    // USAGE LIMITS - INDIA
    // 750K tokens, 350 studio credits
    // ──────────────────────────────────────
    limits: {
      monthlyTokens: 750000,
      monthlyWords: 500000,
      dailyTokens: 25000,
      dailyWords: 16667,
      botResponseLimit: 150,
      memoryDays: 10,
      contextMemory: 10,
      responseDelay: 3,
      voiceMinutes: 30,
      studioCredits: 350,
      studio: {
        images: 35,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // ──────────────────────────────────────
    // USAGE LIMITS - INTERNATIONAL
    // 2× India: 1.5M tokens, 875 studio credits
    // ──────────────────────────────────────
    limitsInternational: {
      monthlyTokens: 1500000,
      monthlyWords: 1000000,
      dailyTokens: 50000,
      dailyWords: 33333,
      botResponseLimit: 150,
      memoryDays: 10,
      contextMemory: 10,
      responseDelay: 3,
      voiceMinutes: 30,
      studioCredits: 875,
      studio: {
        images: 87,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // ──────────────────────────────────────
    // AI MODELS
    // 3-model routing: Flash + Kimi K2 + G2.5 Pro
    // ──────────────────────────────────────
    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash',
        displayName: 'Gemini Flash',
        tier: RoutingTier.CASUAL,
        percentage: 62,
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
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        tier: RoutingTier.MEDIUM,
        percentage: 13,
      },
    ],

    // ──────────────────────────────────────
    // TOKEN ROUTING - INDIA
    // Flash-heavy for cost efficiency
    // ──────────────────────────────────────
    routing: {
      'gemini-2.5-flash': 0.617,              // 462,750 tokens
      'moonshotai/kimi-k2-thinking': 0.250,   // 187,500 tokens
      'gemini-2.5-pro': 0.133,                // 99,750 tokens
    },

    // ──────────────────────────────────────
    // TOKEN ROUTING - INTERNATIONAL
    // Adds GPT-5.1 for premium users
    // ──────────────────────────────────────
    routingInternational: {
      'gemini-2.5-flash': 0.40,               // 600,000 tokens
      'moonshotai/kimi-k2-thinking': 0.2667,  // 400,050 tokens
      'gemini-2.5-pro': 0.1833,               // 274,950 tokens
      'gpt-5.1': 0.15,                        // 225,000 tokens
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
    // ₹15 / $1 for 50K tokens (97.7% margin)
    // ──────────────────────────────────────
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Plus Instant Boost',
      description: 'Double your daily limit instantly - perfect for urgent work!',
      price: 15,
      priceUSD: 1,
      tokensUnlocked: 50000,
      wordsUnlocked: 33333,
      logic: 'Deducts 2× daily limit from monthly pool',
      duration: 0,
      maxPerPlanPeriod: 1,
      resetOn: 'plan_renewal',
      costs: {
        ai: 0,
        gateway: 0.35,
        total: 0.35,
        profit: 14.65,
        margin: 97.7,
      },
    },

    // ──────────────────────────────────────
    // ADDON BOOSTER
    // ₹79 / $2.99 for 100K Flash tokens
    // 7-day validity, separate pool
    // ──────────────────────────────────────
    addonBooster: {
      type: 'ADDON',
      name: 'Plus Weekly Power Boost',
      description: '100K bonus tokens spread over 7 days',
      price: 79,
      priceUSD: 2.99,
      premiumTokens: 0,
      flashTokens: 100000,
      totalTokens: 100000,
      dailyBoost: 14285,
      validity: 7,
      distributionLogic: 'Daily spread: 100K ÷ 7 = 14,285 tokens/day',
      maxPerMonth: 2,
      queueingAllowed: true,
      separatePool: true,
      costs: (() => {
        const aiCost = calculateModelCost('gemini-2.5-flash', 100000);
        const gateway = 79 * (GATEWAY_FEE_PERCENTAGE / 100);
        const total = aiCost + gateway;
        return {
          ai: aiCost,
          gateway,
          total,
          profit: 79 - total,
          margin: ((79 - total) / 79) * 100,
        };
      })(),
    },

    // ──────────────────────────────────────
    // DOCUMENT INTELLIGENCE
    // Standard tier with basic features
    // ──────────────────────────────────────
    documentation: {
      enabled: true,
      tier: 'standard',
      displayName: 'Document Intelligence',
      badge: '✨',
      tagline: 'Smart documentation for everyday needs',
      monthlyWords: 5000,
      maxWorkspaces: 10,
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
    // Revenue: ₹399 | Margin: ~55%
    // ──────────────────────────────────────
    costs: (() => {
      const aiCost = calculateRoutingCost(750000, {
        'gemini-2.5-flash': 0.617,
        'moonshotai/kimi-k2-thinking': 0.250,
        'gemini-2.5-pro': 0.133,
      });
      const studioCost = 350 * STUDIO_CREDIT_COST;
      const gateway = 399 * (GATEWAY_FEE_PERCENTAGE / 100);
      const voice = VOICE_COSTS.perPaidPlan;
      const totalCost = aiCost + studioCost + gateway + INFRASTRUCTURE_COSTS.paid + voice;

      return {
        aiCostPremium: aiCost,
        aiCostTotal: aiCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
        voiceCost: voice,
        totalCost,
        revenue: 399,
        profit: 399 - totalCost,
        margin: ((399 - totalCost) / 399) * 100,
      };
    })(),

    // ──────────────────────────────────────
    // COST ANALYSIS - INTERNATIONAL
    // Revenue: $15.99 (₹1,428.51) | Margin: ~65%
    // ──────────────────────────────────────
    costsInternational: (() => {
      const aiCost = calculateRoutingCost(1500000, {
        'gemini-2.5-flash': 0.40,
        'moonshotai/kimi-k2-thinking': 0.2667,
        'gemini-2.5-pro': 0.1833,
        'gpt-5.1': 0.15,
      });
      const studioCost = 875 * STUDIO_CREDIT_COST;
      const revenueINR = 15.99 * USD_TO_INR_RATE;
      const gateway = revenueINR * (GATEWAY_FEE_STRIPE_PERCENTAGE / 100) + (GATEWAY_FEE_STRIPE_FIXED_USD * USD_TO_INR_RATE);
      const voice = VOICE_COSTS.perPaidPlan;
      const totalCost = aiCost + studioCost + gateway + INFRASTRUCTURE_COSTS.paid + voice;

      return {
        aiCostPremium: aiCost,
        aiCostTotal: aiCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
        voiceCost: voice,
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
      stripe: 'price_plus_monthly_usd',
    },
  },

  // ==========================================
  // 🚀 PRO PLAN (₹799 / $29.99)
  // ==========================================
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
    description: 'Smart AI + 1.1M tokens + Full Studio + GPT-5.1',
    price: 799,
    priceUSD: 29.99,
    enabled: true,
    order: 3,
    personality: 'Professional, insightful, detailed',

    // ──────────────────────────────────────
    // USAGE LIMITS - INDIA
    // 1.1M tokens, 650 studio credits
    // ──────────────────────────────────────
    limits: {
      monthlyTokens: 1100000,
      monthlyWords: 733333,
      dailyTokens: 36667,
      dailyWords: 24445,
      botResponseLimit: 300,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 2.5,
      voiceMinutes: 45,
      studioCredits: 650,
      studio: {
        images: 65,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // ──────────────────────────────────────
    // USAGE LIMITS - INTERNATIONAL
    // 2× India: 2.2M tokens, 1625 studio credits
    // ──────────────────────────────────────
    limitsInternational: {
      monthlyTokens: 2500000,
      monthlyWords: 1666667,
      dailyTokens: 83333,
      dailyWords: 55556,
      botResponseLimit: 300,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 2.5,
      voiceMinutes: 45,
      studioCredits: 1625,
      studio: {
        images: 162,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // ──────────────────────────────────────
    // AI MODELS
    // 4-model routing with GPT-5.1 access
    // ──────────────────────────────────────
    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash',
        displayName: 'Gemini Flash',
        tier: RoutingTier.CASUAL,
        percentage: 45,
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
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        tier: RoutingTier.MEDIUM,
        percentage: 17,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 13,
      },
    ],

    // ──────────────────────────────────────
    // TOKEN ROUTING - INDIA
    // Balanced distribution with GPT-5.1
    // ──────────────────────────────────────
    routing: {
      'gemini-2.5-flash': 0.45,               // 495,000 tokens
      'moonshotai/kimi-k2-thinking': 0.25,    // 275,000 tokens
      'gemini-2.5-pro': 0.17,                 // 187,000 tokens
      'gpt-5.1': 0.13,                        // 143,000 tokens
    },

    // ──────────────────────────────────────
    // TOKEN ROUTING - INTERNATIONAL
    // Higher GPT-5.1 allocation
    // ──────────────────────────────────────
    routingInternational: {
      'gemini-2.5-flash': 0.41,               // 924,000 tokens
      'moonshotai/kimi-k2-thinking': 0.278,  // 496,100 tokens
      'gemini-2.5-pro': 0.136,               // 339,900 tokens
      'gpt-5.1': 0.176,                        // 440,000 tokens
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
    // ₹25 / $1 for 73K tokens (97.6% margin)
    // ──────────────────────────────────────
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Pro Instant Boost',
      description: 'Double your daily limit - get back to work immediately!',
      price: 25,
      priceUSD: 1,
      tokensUnlocked: 73334,
      wordsUnlocked: 48889,
      logic: 'Uses own monthly tokens',
      duration: 0,
      maxPerPlanPeriod: 1,
      resetOn: 'plan_renewal',
      costs: {
        ai: 0,
        gateway: 0.59,
        total: 0.59,
        profit: 24.41,
        margin: 97.6,
      },
    },

    // ──────────────────────────────────────
    // ADDON BOOSTER
    // ₹139 / $4.99 for 170K tokens
    // 50K premium + 120K Flash
    // ──────────────────────────────────────
    addonBooster: {
      type: 'ADDON',
      name: 'Pro Weekly Power Boost',
      description: '170K tokens (50K premium + 120K Flash) over 7 days',
      price: 139,
      priceUSD: 4.99,
      premiumTokens: 50000,
      flashTokens: 120000,
      totalTokens: 170000,
      dailyBoost: 24285,
      validity: 7,
      distributionLogic: 'Daily spread: 50K premium + 120K Flash ÷ 7 days',
      maxPerMonth: 2,
      queueingAllowed: true,
      separatePool: true,
      costs: (() => {
        const premiumCost = calculateRoutingCost(50000, {
          'gemini-2.5-flash': 0.45,
          'moonshotai/kimi-k2-thinking': 0.25,
          'gemini-2.5-pro': 0.17,
          'gpt-5.1': 0.13,
        });
        const flashCost = calculateModelCost('gemini-2.5-flash', 120000);
        const gateway = 139 * (GATEWAY_FEE_PERCENTAGE / 100);
        const total = premiumCost + flashCost + gateway;

        return {
          ai: premiumCost + flashCost,
          gateway,
          total,
          profit: 139 - total,
          margin: ((139 - total) / 139) * 100,
        };
      })(),
    },

    // ──────────────────────────────────────
    // DOCUMENT INTELLIGENCE
    // Pro tier with templates and more formats
    // ──────────────────────────────────────
    documentation: {
      enabled: true,
      tier: 'pro',
      displayName: 'Document Intelligence Pro',
      badge: '🚀 PRO',
      tagline: 'Professional-grade documentation workspace',
      monthlyWords: 15000,
      maxWorkspaces: 50,
      exportFormats: ['pdf', 'docx', 'markdown', 'html'],
      templates: true,
      versionHistory: 0,
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
    // Revenue: ₹799 | Margin: ~47%
    // ──────────────────────────────────────
    costs: (() => {
      const aiCost = calculateRoutingCost(1100000, {
        'gemini-2.5-flash': 0.45,
        'moonshotai/kimi-k2-thinking': 0.25,
        'gemini-2.5-pro': 0.17,
        'gpt-5.1': 0.13,
      });
      const studioCost = 650 * STUDIO_CREDIT_COST;
      const gateway = 799 * (GATEWAY_FEE_PERCENTAGE / 100);
      const voice = VOICE_COSTS.perPaidPlan;
      const totalCost = aiCost + studioCost + gateway + INFRASTRUCTURE_COSTS.paid + voice;

      return {
        aiCostPremium: aiCost,
        aiCostTotal: aiCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
        voiceCost: voice,
        totalCost,
        revenue: 799,
        profit: 799 - totalCost,
        margin: ((799 - totalCost) / 799) * 100,
      };
    })(),

    // ──────────────────────────────────────
    // COST ANALYSIS - INTERNATIONAL
    // Revenue: $29.99 (₹1,964.13) | Margin: ~55%
    // ──────────────────────────────────────
    costsInternational: (() => {
      const aiCost = calculateRoutingCost(2500000, {
        'gemini-2.5-flash': 0.41,
        'moonshotai/kimi-k2-thinking': 0.278,
        'gemini-2.5-pro': 0.136,
        'gpt-5.1': 0.176,
      });
      const studioCost = 1625 * STUDIO_CREDIT_COST;
      const revenueINR = 29.99 * USD_TO_INR_RATE;
      const gateway = revenueINR * (GATEWAY_FEE_STRIPE_PERCENTAGE / 100) + (GATEWAY_FEE_STRIPE_FIXED_USD * USD_TO_INR_RATE);
      const voice = VOICE_COSTS.perPaidPlan;
      const totalCost = aiCost + studioCost + gateway + INFRASTRUCTURE_COSTS.paid + voice;

      return {
        aiCostPremium: aiCost,
        aiCostTotal: aiCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
        voiceCost: voice,
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
      stripe: 'price_pro_monthly_usd',
    },
  },

  // ==========================================
  // 👑 APEX PLAN (₹1,199 / $49.99)
  // ==========================================
  // MERGED: EDGE + LIFE plans combined
  // Ultimate tier with all premium features
  // Business Intelligence + Emotional Intelligence
  // Claude Sonnet 4.5 access (International only)
  // ==========================================
  [PlanType.APEX]: {
    id: PlanType.APEX,
    name: 'apex',
    displayName: 'Soriva Apex',
    tagline: 'The pinnacle of AI.',
    description: 'Ultimate AI experience - 1.6M tokens + All Models + Full Suite',
    price: 1199,
    priceUSD: 49.99,
    enabled: true,
    order: 4,
    personality: 'Premium companion with business intelligence and emotional depth',

    // ──────────────────────────────────────
    // USAGE LIMITS - INDIA
    // 1.6M tokens, 1200 studio credits
    // 30-day memory, 60 voice minutes
    // ──────────────────────────────────────
    limits: {
      monthlyTokens: 1600000,
      monthlyWords: 1066667,
      dailyTokens: 53333,
      dailyWords: 35556,
      botResponseLimit: 500,
      memoryDays: 30,
      contextMemory: 20,
      responseDelay: 1.5,
      voiceMinutes: 60,
      studioCredits: 1200,
      studio: {
        images: 120,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // ──────────────────────────────────────
    // USAGE LIMITS - INTERNATIONAL
    // 2× India: 3.2M tokens, 3000 studio credits
    // EXCLUSIVE: Claude Sonnet 4.5 access!
    // ──────────────────────────────────────
    limitsInternational: {
      monthlyTokens: 3200000,
      monthlyWords: 2133333,
      dailyTokens: 106667,
      dailyWords: 71111,
      botResponseLimit: 500,
      memoryDays: 30,
      contextMemory: 20,
      responseDelay: 1.5,
      voiceMinutes: 60,
      studioCredits: 3000,
      studio: {
        images: 300,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // ──────────────────────────────────────
    // AI MODELS - INDIA
    // 4-model routing (no Claude due to cost)
    // ──────────────────────────────────────
    // ──────────────────────────────────────
    // AI MODELS - INDIA
    // 5-model routing with Claude Sonnet 4.5!
    // ──────────────────────────────────────
    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash',
        displayName: 'Gemini Flash',
        tier: RoutingTier.CASUAL,
        percentage: 26.375,
      },
      {
        provider: AIProvider.MOONSHOT,
        modelId: 'moonshotai/kimi-k2-thinking',
        displayName: 'Kimi K2',
        tier: RoutingTier.SIMPLE,
        percentage: 33.375,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-3-pro',
        displayName: 'Gemini 3 Pro',
        tier: RoutingTier.MEDIUM,
        percentage: 9.375,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 21.5,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4-5',
        displayName: 'Claude Sonnet 4.5',
        tier: RoutingTier.COMPLEX,
        percentage: 9.375,
      },
    ],

    // ──────────────────────────────────────
    // TOKEN ROUTING - INDIA (1.6M tokens)
    // Optimized for cost with G3 Pro under 200K
    // ──────────────────────────────────────
      routing: {
      'gemini-2.5-flash': 0.26375,            // 422,000 tokens (-50K)
      'moonshotai/kimi-k2-thinking': 0.33375, // 534,000 tokens (-50K)
      'gemini-3-pro': 0.09375,                // 150,000 tokens (-42K, under 200K!)
      'gpt-5.1': 0.215,                       // 344,000 tokens (-8K)
      'claude-sonnet-4-5': 0.09375,           // 150,000 tokens (NEW! under 200K!)
    },

    // ──────────────────────────────────────
    // TOKEN ROUTING - INTERNATIONAL (3.2M tokens)
    // INCLUDES Claude Sonnet 4.5!
    // All premium models kept under 200K for tier pricing
    // 200K buffer for surge protection
    // ──────────────────────────────────────
    routingInternational: {
      'moonshotai/kimi-k2-thinking': 0.384,   // 1,230,000 tokens
      'gpt-5.1': 0.266,                       // 850,000 tokens
      'gemini-2.5-flash': 0.188,              // 600,000 tokens
      'claude-sonnet-4-5': 0.059,             // 190,000 tokens (under 200K!)
      'gemini-3-pro': 0.041,                  // 130,000 tokens (under 200K!)
      // Buffer: 200,000 tokens (6.2%) for surge protection
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
    // ₹35 / $1 for 113K tokens (97.6% margin)
    // ──────────────────────────────────────
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Apex Instant Boost',
      description: 'Double your daily limit - unlimited feel',
      price: 35,
      priceUSD: 1,
      tokensUnlocked: 106667,
      wordsUnlocked: 71111,
      logic: 'Uses own monthly tokens',
      duration: 0,
      maxPerPlanPeriod: 1,
      resetOn: 'plan_renewal',
      costs: {
        ai: 0,
        gateway: 0.83,
        total: 0.83,
        profit: 34.17,
        margin: 97.6,
      },
    },

    // ──────────────────────────────────────
    // ADDON BOOSTER
    // ₹299 / $7.99 for 300K tokens
    // 150K premium + 150K Flash
    // ──────────────────────────────────────
    addonBooster: {
      type: 'ADDON',
      name: 'Apex Weekly Power Boost',
      description: '300K tokens (150K premium + 150K Flash) over 7 days',
      price: 299,
      priceUSD: 7.99,
      premiumTokens: 150000,
      flashTokens: 150000,
      totalTokens: 300000,
      dailyBoost: 42857,
      validity: 7,
      distributionLogic: 'Daily spread: 150K premium + 150K Flash ÷ 7 days',
      maxPerMonth: 2,
      queueingAllowed: true,
      separatePool: true,
      costs: (() => {
        const premiumCost = calculateRoutingCost(150000, {
          'gemini-2.5-flash': 0.295,
          'moonshotai/kimi-k2-thinking': 0.365,
          'gemini-3-pro': 0.12,
          'gpt-5.1': 0.22,
        });
        const flashCost = calculateModelCost('gemini-2.5-flash', 150000);
        const gateway = 299 * (GATEWAY_FEE_PERCENTAGE / 100);
        const total = premiumCost + flashCost + gateway;

        return {
          ai: premiumCost + flashCost,
          gateway,
          total,
          profit: 299 - total,
          margin: ((299 - total) / 299) * 100,
        };
      })(),
    },

    // ──────────────────────────────────────
    // DOCUMENT INTELLIGENCE - APEX
    // MERGED: Business Intelligence + Emotional Intelligence
    // All advanced features from EDGE + LIFE
    // ──────────────────────────────────────
    documentation: {
      enabled: true,
      tier: 'apex',
      displayName: 'Apex Intelligence Suite',
      badge: '👑 APEX',
      tagline: 'Business intelligence meets emotional depth',
      monthlyWords: 25000,
      maxWorkspaces: 100,
      exportFormats: ['pdf', 'docx', 'markdown', 'html', 'pptx', 'xlsx'],
      templates: true,
      versionHistory: 0,
      collaboration: true,
      advancedFeatures: {
        // ════════════════════════════════════
        // BUSINESS INTELLIGENCE (from EDGE)
        // ════════════════════════════════════
        /** Smart workflow automation */
        smartWorkflow: true,
        /** AI-powered document tagging */
        aiTagging: true,
        /** Decision snapshot capture */
        decisionSnapshot: true,
        /** Legal and finance document analysis */
        legalFinanceLens: true,
        /** Multi-format document fusion */
        multiformatFusion: true,
        /** Business context memory */
        businessContextMemory: true,

        // ════════════════════════════════════
        // EMOTIONAL INTELLIGENCE (from LIFE)
        // ════════════════════════════════════
        /** Emotional context summarizer */
        emotionalContextSummarizer: true,
        /** Memory capsule creation */
        memoryCapsule: true,
        /** Companion notes feature */
        companionNotes: true,
        /** Thought organizer */
        thoughtOrganizer: true,
        /** AI scrapbook */
        aiScrapbook: true,
        /** Life reflection insights */
        lifeReflectionInsights: true,
      },
    },

    // ──────────────────────────────────────
    // FEATURES
    // All features unlocked
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
    // Revenue: ₹1,199 | Margin: ~27% (with Sonnet)
    // Quality boost: Claude Sonnet 4.5 access!
    // ──────────────────────────────────────
    costs: (() => {
      const aiCost = calculateRoutingCost(1600000, {
        'gemini-2.5-flash': 0.26375,
        'moonshotai/kimi-k2-thinking': 0.33375,
        'gemini-3-pro': 0.09375,
        'gpt-5.1': 0.215,
        'claude-sonnet-4-5': 0.09375,
      });
      const studioCost = 1200 * STUDIO_CREDIT_COST;
      const gateway = 1199 * (GATEWAY_FEE_PERCENTAGE / 100);
      const voice = VOICE_COSTS.perPaidPlan;
      const totalCost = aiCost + studioCost + gateway + INFRASTRUCTURE_COSTS.paid + voice;

      return {
        aiCostPremium: aiCost,
        aiCostTotal: aiCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
        voiceCost: voice,
        totalCost,
        revenue: 1199,
        profit: 1199 - totalCost,
        margin: ((1199 - totalCost) / 1199) * 100,
      };
    })(),
    // ──────────────────────────────────────
    // COST ANALYSIS - INTERNATIONAL
    // Revenue: $49.99 (₹4,466.50) | Margin: ~63%
    // Includes Claude Sonnet 4.5 + Buffer
    // ──────────────────────────────────────
    costsInternational: (() => {
      // Main routing cost (3M tokens)
      const aiCost = calculateRoutingCost(3000000, {
        'moonshotai/kimi-k2-thinking': 0.41,
        'gpt-5.1': 0.283,
        'gemini-2.5-flash': 0.20,
        'claude-sonnet-4-5': 0.063,
        'gemini-3-pro': 0.044,
      });
      // Buffer cost (200K tokens split between Flash and GPT)
      const bufferCost = calculateModelCost('gemini-2.5-flash', 100000) + calculateModelCost('gpt-5.1', 100000);
      const totalAiCost = aiCost + bufferCost;

      const studioCost = 3000 * STUDIO_CREDIT_COST;
      const revenueINR = 49.99 * USD_TO_INR_RATE;
      const gateway = revenueINR * (GATEWAY_FEE_STRIPE_PERCENTAGE / 100) + (GATEWAY_FEE_STRIPE_FIXED_USD * USD_TO_INR_RATE);
      const voice = VOICE_COSTS.perPaidPlan;
      const totalCost = totalAiCost + studioCost + gateway + INFRASTRUCTURE_COSTS.paid + voice;

      return {
        aiCostPremium: totalAiCost,
        aiCostTotal: totalAiCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
        voiceCost: voice,
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
      stripe: 'price_apex_monthly_usd',
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
    price: 399,
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
 * Hinglish uses more tokens but provides cost savings
 */
export const HINGLISH_TOKEN_SAVINGS = 0.5;

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