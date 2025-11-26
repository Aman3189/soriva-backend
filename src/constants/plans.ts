// src/constants/plans.ts

/**
 * ==========================================
 * SORIVA V2 - FINALIZED PLANS CONFIGURATION
 * ==========================================
 * Complete pricing, token allocation, and booster strategy
 * Last Updated: November 26, 2025 - PRODUCTION READY v5.1
 *
 * MAJOR UPDATE v5.1:
 * ✅ Kimi K2 Thinking (Normal Mode) replaces Claude Haiku 4.5
 * ✅ Cost savings: ₹377/M → ₹189/M (50% cheaper!)
 * ✅ STARTER International limits added (no discrimination)
 * ✅ THRESHOLD OPTIMIZATION: EDGE & LIFE Intl routing optimized
 *    - G3 Pro & Sonnet kept UNDER 200K threshold
 *    - Excess tokens moved to GPT-5.1 (FLAT pricing)
 *    - EDGE Intl: 47.6% → 57.8% margin (+10%!)
 *    - LIFE Intl: 47.2% → 61.3% margin (+14%!)
 *
 * FINALIZED STRUCTURE (After extensive planning):
 * ✅ PRICING: India (₹399-1199) | International ($15.99-57.99)
 * ✅ FLASH LITE: Only in STARTER (free tier)
 * ✅ PREMIUM MODELS: Smart routing for paid plans
 * ✅ ROUTING: Tier-safe with 200K threshold awareness
 * ✅ VOICE: 0/30/45/60/60 mins, ₹45 cost (20:80 STT:TTS)
 * ✅ STUDIO: Regional credits (Indian vs 2.5x International)
 * ✅ INFRASTRUCTURE: ₹5 (starter), ₹20 (paid)
 * ✅ GATEWAY: Razorpay 2.36% (India), Stripe 2.9%+$0.30 (Intl)
 *
 * KIMI K2 INTEGRATION (Normal Mode Only):
 * - Model: moonshotai/kimi-k2-thinking
 * - Mode: Normal only (NO thinking_budget parameter sent)
 * - Cost: $0.60/$2.50 per 1M (input/output)
 * - Effective: ₹189.42/M at 10:90 ratio
 * - Replaces: Claude Haiku 4.5 (₹377.20/M)
 * - Savings: ~50% on SIMPLE tier routing
 *
 * KEY DECISIONS:
 * - 10:90 input:output ratio for cost calculations (conservative)
 * - Flash Lite ONLY for STARTER (150K tokens)
 * - Kimi K2 Normal for SIMPLE tier (replaces Haiku)
 * - Gemini 2.5 Flash (paid) for PLUS onwards
 * - 200K tier pricing for Gemini 3 Pro, Gemini 2.5 Pro, Sonnet
 * - GPT-5.1 flat pricing (no tiers) - perfect for absorbing excess
 * - International: Deliberately cross tier limits for premium positioning
 * - Voice: ₹45 all paid plans with 20:80 STT:TTS split
 *
 * MARGIN STRATEGY:
 * - Indian Plans: 40-50% target margins (IMPROVED with Kimi!)
 * - International Plans: 50%+ target (IMPROVED with Kimi!)
 * - Cooldown: 97%+ margin (uses own monthly tokens)
 * - Addon: 55-90% margin (actual AI cost)
 * - Studio: 83-88% margin (GPU cost covered)
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

export enum AIProvider {
  GROQ = 'groq',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  OPENAI = 'openai',
  MOONSHOT = 'moonshot',  // NEW: Kimi K2 provider
}

export const STUDIO_FREE_PREVIEWS = 3;
export const STUDIO_EXTRA_PREVIEW_COST = 5;
export const STUDIO_MAX_PREVIEWS = 10;

export enum Region {
  INDIA = 'IN',
  INTERNATIONAL = 'INTL',
}

export enum Currency {
  INR = 'INR',
  USD = 'USD',
}

export type DocumentIntelligenceTier =
  | 'standard'
  | 'pro'
  | 'business_intelligence'
  | 'emotional_intelligence';

// ==========================================
// 🌍 CURRENCY CONSTANTS
// ==========================================

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.INR]: '₹',
  [Currency.USD]: '$',
};

export const INR_TO_USD_RATE = 0.012;
export const USD_TO_INR_RATE = 82.0;

export const REGION_CURRENCY_MAP: Record<Region, Currency> = {
  [Region.INDIA]: Currency.INR,
  [Region.INTERNATIONAL]: Currency.USD,
};

export const REGION_PAYMENT_GATEWAY: Record<Region, string> = {
  [Region.INDIA]: 'razorpay',
  [Region.INTERNATIONAL]: 'stripe',
};

// ==========================================
// 🎯 TOKEN RATIO CONSTANTS
// ==========================================

/**
 * Token-to-word ratios for different AI models
 * Used to convert between tokens and words for user-facing displays
 * Source: Empirical testing with English and Hinglish content
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
  'claude-haiku-4-5': {
    english: 1.2,
    hinglish: 1.3,
    average: 1.3,
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
  // NEW: Kimi K2 Thinking token ratios
  'moonshotai/kimi-k2-thinking': {
    english: 1.2,
    hinglish: 1.4,
    average: 1.35,
  },
} as const;

/**
 * Helper function to get token ratio for a model
 */
export function getTokenRatio(modelId: string): number {
  return TOKEN_RATIOS[modelId as keyof typeof TOKEN_RATIOS]?.average || 1.3;
}

// ==========================================
// 🤖 SMART ROUTING TIERS
// ==========================================

export enum RoutingTier {
  CASUAL = 'CASUAL',
  SIMPLE = 'SIMPLE',
  MEDIUM = 'MEDIUM',
  COMPLEX = 'COMPLEX',
  EXPERT = 'EXPERT',
}

/**
 * AI Model Pricing (USD per 1 million tokens)
 * Updated: November 2025
 * Source: Official provider pricing pages
 * 
 * IMPORTANT: Using 10:90 input:output ratio for cost calculations
 * This is conservative (worst-case) and ensures profitability
 * 
 * KIMI K2 THINKING (Normal Mode):
 * - Input: $0.60/M, Output: $2.50/M
 * - Normal mode = NO thinking_budget parameter sent
 * - Heavy mode NEVER used (we don't send thinking_budget)
 * 
 * CRITICAL: 200K context threshold for tier pricing!
 * - Gemini 3 Pro: $2/$12 (<200K), $4/$18 (≥200K)
 * - Gemini 2.5 Pro: $1.25/$10 (<200K), $2.50/$15 (≥200K)
 * - Sonnet 4.5: $3/$15 (<200K), $6/$22.50 (≥200K)
 * - GPT-5.1: FLAT pricing (no tiers)
 * - Kimi K2: FLAT pricing (no tiers)
 */
export const MODEL_PRICING_USD = {
  'gemini-2.5-flash-lite': {
    inputPer1M: 0.10,
    outputPer1M: 0.40,
  },
  'gemini-2.5-flash': {
    inputPer1M: 0.10,
    outputPer1M: 0.40,
  },
  'claude-haiku-4-5': {
    inputPer1M: 1.00,
    outputPer1M: 5.00,
  },
  'claude-sonnet-4-5': {
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    inputPer1MOver200K: 6.00,
    outputPer1MOver200K: 22.50,
  },
  'gemini-2.5-pro': {
    inputPer1M: 1.25,
    outputPer1M: 10.00,
    inputPer1MOver200K: 2.50,
    outputPer1MOver200K: 15.00,
  },
  'gemini-3-pro': {
    inputPer1M: 2.00,
    outputPer1M: 12.00,
    inputPer1MOver200K: 4.00,
    outputPer1MOver200K: 18.00,
  },
  'gpt-5.1': {
    inputPer1M: 1.25,
    outputPer1M: 10.00,
    // Note: FLAT pricing, no tiers! Perfect for absorbing excess tokens
  },
  // NEW: Kimi K2 Thinking (Normal Mode Only)
  'moonshotai/kimi-k2-thinking': {
    inputPer1M: 0.60,
    outputPer1M: 2.50,
    // Note: FLAT pricing, Normal mode only (NO thinking_budget sent)
    // Heavy mode NEVER used - we don't send thinking_budget parameter
  },
} as const;

/**
 * Calculate effective cost per 1M tokens at 10:90 input:output ratio
 * Formula: (inputRate × 0.1) + (outputRate × 0.9)
 * Uses base tier pricing (<200K)
 */
function calculateEffectiveCost(modelId: string): number {
  const pricing = MODEL_PRICING_USD[modelId as keyof typeof MODEL_PRICING_USD];
  if (!pricing) return 0;
  
  const effectiveCostUSD = (pricing.inputPer1M * 0.1) + (pricing.outputPer1M * 0.9);
  return effectiveCostUSD * USD_TO_INR_RATE;
}

/**
 * Pre-calculated effective costs (INR per 1M tokens at 10:90 ratio)
 * Base tier pricing (<200K context)
 */
export const MODEL_COSTS_INR_PER_1M = {
  'gemini-2.5-flash-lite': calculateEffectiveCost('gemini-2.5-flash-lite'), // ₹30.34
  'gemini-2.5-flash': calculateEffectiveCost('gemini-2.5-flash'),           // ₹30.34
  'claude-haiku-4-5': calculateEffectiveCost('claude-haiku-4-5'),           // ₹377.20
  'claude-sonnet-4-5': calculateEffectiveCost('claude-sonnet-4-5'),         // ₹1131.60
  'gemini-2.5-pro': calculateEffectiveCost('gemini-2.5-pro'),               // ₹748.25
  'gemini-3-pro': calculateEffectiveCost('gemini-3-pro'),                   // ₹898.20
  'gpt-5.1': calculateEffectiveCost('gpt-5.1'),                             // ₹748.25
  'moonshotai/kimi-k2-thinking': calculateEffectiveCost('moonshotai/kimi-k2-thinking'), // ₹189.42
} as const;

/**
 * LLM Routing Configuration
 * Maps complexity tiers to appropriate AI models
 * 
 * UPDATE v5.0: SIMPLE tier now uses Kimi K2 (replaces Haiku)
 * - Better quality (1T params backbone vs small Haiku model)
 * - 50% cheaper (₹189 vs ₹377 per 1M tokens)
 */
export const LLM_ROUTING_CONFIG = {
  [RoutingTier.CASUAL]: {
    model: 'gemini-2.5-flash',
    provider: AIProvider.GEMINI,
    displayName: 'Gemini Flash',
    fallbackModel: 'gemini-2.5-flash-lite',
  },
  [RoutingTier.SIMPLE]: {
    model: 'moonshotai/kimi-k2-thinking',  // CHANGED: Was claude-haiku-4-5
    provider: AIProvider.MOONSHOT,          // CHANGED: Was CLAUDE
    displayName: 'Kimi K2',                 // CHANGED: Was Claude Haiku 4.5
    fallbackModel: 'gemini-2.5-flash',
    // IMPORTANT: No thinking_budget sent = Normal mode (cheapest)
  },
  [RoutingTier.MEDIUM]: {
    model: 'gemini-2.5-pro',
    provider: AIProvider.GEMINI,
    displayName: 'Gemini 2.5 Pro',
    fallbackModel: 'moonshotai/kimi-k2-thinking',  // CHANGED: Fallback to Kimi
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

export { PlanType, BoosterCategory, planTypeToName };

// ==========================================
// 💰 COST CALCULATION HELPERS
// ==========================================

/**
 * Calculate AI cost for a specific number of tokens using a model
 */
function calculateModelCost(modelId: string, tokens: number): number {
  const costPer1M = MODEL_COSTS_INR_PER_1M[modelId as keyof typeof MODEL_COSTS_INR_PER_1M] || 0;
  return (tokens / 1000000) * costPer1M;
}

/**
 * Calculate cost for a routing distribution
 * Example: { 'flash': 0.55, 'kimi': 0.25, ... }
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
// GATEWAY & INFRASTRUCTURE COSTS
// ==========================================

export const GATEWAY_FEE_PERCENTAGE = 2.36; // Razorpay
export const GATEWAY_FEE_STRIPE_PERCENTAGE = 2.9; // Stripe
export const GATEWAY_FEE_STRIPE_FIXED_USD = 0.30;

export const INFRASTRUCTURE_COSTS = {
  starter: 5,         // Per user/month for free tier
  paid: 20,           // Per user/month for paid plans
} as const;

export const VOICE_COSTS = {
  perPaidPlan: 45,    // ₹45 for all paid plans (20:80 STT:TTS with buffer)
} as const;

export const STUDIO_CREDIT_COST = 0.0408; // Per credit (GPU cost)
export const STUDIO_CREDIT_VALUE = STUDIO_CREDIT_COST; // Backward compatibility alias

// ==========================================
// INTERFACES
// ==========================================

export interface AIModel {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  tier?: RoutingTier;
  percentage?: number;
  fallback?: boolean; // Backward compatibility
}

export interface TrialConfig {
  enabled: boolean;
  durationDays: number;
  totalTokens: number;
  totalWords: number;
  dailyTokens: number;
  dailyWords: number;
}

export interface BonusLimits {
  bonusTokens: number;
  bonusModel: string;
  bonusProvider: AIProvider;
  description: string;
}

export interface CooldownBooster {
  type: 'COOLDOWN';
  name: string;
  description: string;
  price: number;
  priceUSD?: number;
  tokensUnlocked: number;
  wordsUnlocked: number;
  logic: string;
  duration: number;
  maxPerPlanPeriod: number;
  resetOn: 'plan_renewal' | 'calendar';
  progressiveMultipliers?: number[]; // Backward compatibility
  costs: {
    ai: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
}

export interface AddonBooster {
  type: 'ADDON';
  name: string;
  description: string;
  price: number;
  priceUSD?: number;
  premiumTokens: number;
  flashTokens: number;
  totalTokens: number;
  dailyBoost: number;
  validity: number;
  distributionLogic: string;
  maxPerMonth: number;
  queueingAllowed: boolean;
  separatePool: boolean;
  // Backward compatibility properties
  wordsAdded?: number;
  tokensAdded?: number;
  creditsAdded?: number;
  costs: {
    ai: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
}

export interface StudioLimits {
  images: number;
  talkingPhotos: number;
  logoPreview: number;
  logoPurchase: number;
}

export interface UsageLimits {
  monthlyTokens: number;
  monthlyWords: number;
  dailyTokens: number;
  dailyWords: number;
  botResponseLimit: number;
  memoryDays: number;
  contextMemory: number;
  responseDelay: number;
  voiceMinutes: number;
  studio: StudioLimits;
  studioCredits?: number;
}

export interface AdvancedFeatures {
  smartWorkflow?: boolean;
  aiTagging?: boolean;
  decisionSnapshot?: boolean;
  legalFinanceLens?: boolean;
  multiformatFusion?: boolean;
  businessContextMemory?: boolean;
  voiceToAction?: boolean;
  emotionalContextSummarizer?: boolean;
  memoryCapsule?: boolean;
  companionNotes?: boolean;
  thoughtOrganizer?: boolean;
  aiScrapbook?: boolean;
  lifeReflectionInsights?: boolean;
  handwritingEmotionReader?: boolean;
}

export interface DocumentIntelligence {
  enabled: boolean;
  tier: DocumentIntelligenceTier;
  displayName: string;
  badge: string;
  tagline?: string;
  monthlyWords: number;
  maxWorkspaces: number;
  exportFormats: string[];
  templates: boolean;
  versionHistory: number;
  collaboration: boolean;
  advancedFeatures?: AdvancedFeatures;
}

export interface PlanCosts {
  aiCostPremium: number;
  aiCostTotal: number;
  studioCostTotal: number;
  gatewayCost: number;
  infraCostPerUser: number;
  voiceCost: number;
  totalCost: number;
  revenue: number;
  profit: number;
  margin: number;
}

export interface Plan {
  id: PlanType;
  name: string;
  displayName: string;
  tagline: string;
  description: string;
  price: number;
  priceUSD?: number;
  enabled: boolean;
  popular?: boolean;
  hero?: boolean;
  order: number;
  personality: string;
  trial?: TrialConfig;
  limits: UsageLimits;
  limitsInternational?: UsageLimits;
  bonusLimits?: BonusLimits;
  aiModels: AIModel[];
  routing?: Record<string, number>;
  routingInternational?: Record<string, number>;
  isHybrid: boolean;
  hasSmartRouting: boolean;
  hasDynamicDailyLimits: boolean;
  tokenExpiryEnabled: boolean;
  cooldownBooster?: CooldownBooster;
  addonBooster?: AddonBooster;
  documentation?: DocumentIntelligence;
  features: {
    studio: boolean;
    documentIntelligence: boolean;
    fileUpload: boolean;
    prioritySupport: boolean;
    smartRouting: boolean;
    multiModel: boolean;
  };
  costs: PlanCosts;
  costsInternational?: PlanCosts;
  paymentGateway?: {
    cashfree?: string;
    razorpay?: string;
    stripe?: string;
  };
}

export interface StudioBoosterCosts {
  gateway: number;
  infra: number;
  maxGPUCost: number;
  total: number;
  profit: number;
  margin: number;
}

export interface StudioBooster {
  id: string;
  type: 'STUDIO';
  name: string;
  displayName: string;
  tagline: string;
  price: number;
  priceUSD?: number;
  creditsAdded: number;
  creditsAddedIntl?: number;
  validity: number;
  maxPerMonth: number;
  popular?: boolean;
  costs: StudioBoosterCosts;
  costsInternational?: StudioBoosterCosts;
  paymentGateway?: {
    cashfree?: string;
    razorpay?: string;
    stripe?: string;
  };
}

// ==========================================
// PLANS STATIC CONFIGURATION
// ==========================================

export const PLANS_STATIC_CONFIG: Record<PlanType, Plan> = {
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

    limits: {
      monthlyTokens: 150000,      // Flash Lite only
      monthlyWords: 100000,
      dailyTokens: 5000,          // Dynamic (adjusts based on remaining)
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

    // NEW: International users get same free tier - no discrimination!
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

    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash-lite',
        displayName: 'Gemini Flash Lite',
        percentage: 100,
      },
    ],

    routing: {
      'gemini-2.5-flash-lite': 1.0,
    },

    // NEW: International routing same as Indian for STARTER
    routingInternational: {
      'gemini-2.5-flash-lite': 1.0,
    },

    isHybrid: false,
    hasSmartRouting: false,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,

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

    features: {
      studio: false,
      documentIntelligence: false,
      fileUpload: false,
      prioritySupport: false,
      smartRouting: false,
      multiModel: false,
    },

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

    // NEW: International costs same as Indian for FREE tier
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

    // UPDATED: Kimi K2 replaces Haiku
    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash',
        displayName: 'Gemini Flash',
        tier: RoutingTier.CASUAL,
        percentage: 62,  // OPTIMIZED: 61.7% rounded
      },
      {
        provider: AIProvider.MOONSHOT,  // CHANGED: Was CLAUDE
        modelId: 'moonshotai/kimi-k2-thinking',  // CHANGED: Was claude-haiku-4-5
        displayName: 'Kimi K2',  // CHANGED: Was Claude Haiku 4.5
        tier: RoutingTier.SIMPLE,
        percentage: 25,  // Same
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        tier: RoutingTier.MEDIUM,
        percentage: 13,  // OPTIMIZED: 13.3% rounded
      },
    ],

    // UPDATED: Kimi K2 replaces Haiku
    routing: {
      'gemini-2.5-flash': 0.617,   // 462.5K tokens (OPTIMIZED!)
      'moonshotai/kimi-k2-thinking': 0.250,   // 187.5K tokens (CHANGED: Was claude-haiku-4-5)
      'gemini-2.5-pro': 0.133,     // 100K tokens (OPTIMIZED - reduced from 150K)
    },

    // UPDATED: Kimi K2 replaces Haiku
    routingInternational: {
      'gemini-2.5-flash': 0.40,    // 600K tokens
      'moonshotai/kimi-k2-thinking': 0.2667,  // 400K tokens (CHANGED: Was claude-haiku-4-5)
      'gemini-2.5-pro': 0.1833,    // 275K tokens (OPTIMIZED - reduced from 375K)
      'gpt-5.1': 0.15,             // 225K tokens
    },

    isHybrid: false,
    hasSmartRouting: true,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,

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

    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: false,
      prioritySupport: false,
      smartRouting: true,
      multiModel: true,
    },

    // UPDATED: Costs with Kimi K2
    costs: (() => {
      const aiCost = calculateRoutingCost(750000, {
        'gemini-2.5-flash': 0.617,
        'moonshotai/kimi-k2-thinking': 0.250,  // CHANGED
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

    // UPDATED: Costs with Kimi K2
    costsInternational: (() => {
      const aiCost = calculateRoutingCost(1500000, {
        'gemini-2.5-flash': 0.40,
        'moonshotai/kimi-k2-thinking': 0.2667,  // CHANGED
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

    paymentGateway: {
      razorpay: 'plan_plus_monthly',
      stripe: 'price_plus_monthly_usd',
    },
  },

  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'pro',
    displayName: 'Soriva Pro',
    tagline: 'Command brilliance.',
    description: 'Smart AI + 1.1M tokens + Full Studio + GPT-5.1',
    price: 699,
    priceUSD: 21.99,
    enabled: true,
    order: 3,
    personality: 'Professional, insightful, detailed',

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

    limitsInternational: {
      monthlyTokens: 2200000,
      monthlyWords: 1466667,
      dailyTokens: 73333,
      dailyWords: 48889,
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

    // UPDATED: Kimi K2 replaces Haiku
    aiModels: [  // For Indian plan (International has different mix - no Sonnet)
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash',
        displayName: 'Gemini Flash',
        tier: RoutingTier.CASUAL,
        percentage: 45,
      },
      {
        provider: AIProvider.MOONSHOT,  // CHANGED: Was CLAUDE
        modelId: 'moonshotai/kimi-k2-thinking',  // CHANGED: Was claude-haiku-4-5
        displayName: 'Kimi K2',  // CHANGED: Was Claude Haiku 4.5
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

    // UPDATED: Kimi K2 replaces Haiku
    routing: {
      'gemini-2.5-flash': 0.45,    // 495K tokens
      'moonshotai/kimi-k2-thinking': 0.25,    // 275K tokens (CHANGED: Was claude-haiku-4-5)
      'gemini-2.5-pro': 0.17,      // 187K tokens (safe!)
      'gpt-5.1': 0.13,             // 143K tokens
    },

    // UPDATED: Kimi K2 replaces Haiku
    routingInternational: {
      'gemini-2.5-flash': 0.42,    // 924K tokens (OPTIMIZED!)
      'moonshotai/kimi-k2-thinking': 0.2255,  // 496K tokens (CHANGED: Was claude-haiku-4-5)
      'gemini-2.5-pro': 0.1545,    // 340K tokens (OPTIMIZED - replaced G3 Pro, reduced from 440K)
      'gpt-5.1': 0.20,             // 440K tokens
      // NO SONNET - Removed for PRO tier
    },

    isHybrid: false,
    hasSmartRouting: true,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,

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

    addonBooster: {
      type: 'ADDON',
      name: 'Pro Weekly Power Boost',
      description: '150K tokens (50K premium + 100K Flash) over 7 days',
      price: 139,
      priceUSD: 3.99,
      premiumTokens: 50000,
      flashTokens: 100000,
      totalTokens: 150000,
      dailyBoost: 21428,
      validity: 7,
      distributionLogic: 'Daily spread: 50K premium + 100K Flash ÷ 7 days',
      maxPerMonth: 2,
      queueingAllowed: true,
      separatePool: true,
      costs: (() => {
        // UPDATED: Kimi K2 in routing
        const premiumCost = calculateRoutingCost(50000, {
          'gemini-2.5-flash': 0.45,
          'moonshotai/kimi-k2-thinking': 0.25,  // CHANGED
          'gemini-2.5-pro': 0.17,
          'gpt-5.1': 0.13,
        });
        const flashCost = calculateModelCost('gemini-2.5-flash', 100000);
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

    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
      smartRouting: true,
      multiModel: true,
    },

    // UPDATED: Costs with Kimi K2
    costs: (() => {
      const aiCost = calculateRoutingCost(1100000, {
        'gemini-2.5-flash': 0.45,
        'moonshotai/kimi-k2-thinking': 0.25,  // CHANGED
        'gemini-2.5-pro': 0.17,
        'gpt-5.1': 0.13,
      });
      const studioCost = 650 * STUDIO_CREDIT_COST;
      const gateway = 699 * (GATEWAY_FEE_PERCENTAGE / 100);
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
        revenue: 699,
        profit: 699 - totalCost,
        margin: ((699 - totalCost) / 699) * 100,
      };
    })(),

    // UPDATED: Costs with Kimi K2
    costsInternational: (() => {
      const aiCost = calculateRoutingCost(2200000, {
        'gemini-2.5-flash': 0.42,
        'moonshotai/kimi-k2-thinking': 0.2255,  // CHANGED
        'gemini-2.5-pro': 0.1545,
        'gpt-5.1': 0.20,
      });
      const studioCost = 1625 * STUDIO_CREDIT_COST;
      const revenueINR = 21.99 * USD_TO_INR_RATE;
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

    paymentGateway: {
      razorpay: 'plan_pro_monthly',
      stripe: 'price_pro_monthly_usd',
    },
  },

  [PlanType.EDGE]: {
    id: PlanType.EDGE,
    name: 'edge',
    displayName: 'Soriva Edge',
    tagline: 'Where precision meets purpose.',
    description: 'Smart AI + 1.5M tokens + Business Intelligence',
    price: 999,
    priceUSD: 46.99,
    enabled: false,
    order: 4,
    personality: 'Consulting-grade mentor, precision-focused',

    limits: {
      monthlyTokens: 1500000,
      monthlyWords: 1000000,
      dailyTokens: 50000,
      dailyWords: 33333,
      botResponseLimit: 500,
      memoryDays: 25,
      contextMemory: 15,
      responseDelay: 2,
      voiceMinutes: 60,
      studioCredits: 900,
      studio: {
        images: 90,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsInternational: {
      monthlyTokens: 3000000,
      monthlyWords: 2000000,
      dailyTokens: 100000,
      dailyWords: 66667,
      botResponseLimit: 500,
      memoryDays: 25,
      contextMemory: 15,
      responseDelay: 2,
      voiceMinutes: 60,
      studioCredits: 2250,
      studio: {
        images: 225,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // UPDATED: Kimi K2 replaces Haiku
    aiModels: [  // For Indian plan (International adds Sonnet 9%)
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash',
        displayName: 'Gemini Flash',
        tier: RoutingTier.CASUAL,
        percentage: 55,
      },
      {
        provider: AIProvider.MOONSHOT,  // CHANGED: Was CLAUDE
        modelId: 'moonshotai/kimi-k2-thinking',  // CHANGED: Was claude-haiku-4-5
        displayName: 'Kimi K2',  // CHANGED: Was Claude Haiku 4.5
        tier: RoutingTier.SIMPLE,
        percentage: 22,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-3-pro',
        displayName: 'Gemini 3 Pro',
        tier: RoutingTier.COMPLEX,
        percentage: 13,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 10,
      },
    ],

    // UPDATED: Kimi K2 replaces Haiku
    routing: {
      'gemini-2.5-flash': 0.55,    // 825K tokens
      'moonshotai/kimi-k2-thinking': 0.22,    // 330K tokens (CHANGED: Was claude-haiku-4-5)
      'gemini-3-pro': 0.13,        // 195K tokens (safe!)
      'gpt-5.1': 0.10,             // 150K tokens
    },

    // OPTIMIZED v5.1: All premium models under 200K threshold!
    routingInternational: {
      'gemini-2.5-flash': 0.30,               // 900K tokens
      'moonshotai/kimi-k2-thinking': 0.22,    // 660K tokens (increased)
      'gemini-3-pro': 0.065,                  // 195K tokens ✅ UNDER 200K (was 550K!)
      'gpt-5.1': 0.35,                        // 1,050K tokens (increased - FLAT pricing!)
      'claude-sonnet-4-5': 0.065,             // 195K tokens ✅ UNDER 200K (was 260K!)
    },

    isHybrid: false,
    hasSmartRouting: true,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Edge Instant Boost',
      description: 'Double your daily limit for power users',
      price: 35,
      priceUSD: 1,
      tokensUnlocked: 100000,
      wordsUnlocked: 66667,
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

    addonBooster: {
      type: 'ADDON',
      name: 'Edge Weekly Power Boost',
      description: '250K tokens (100K premium + 150K Flash) over 7 days',
      price: 249,
      priceUSD: 5.99,
      premiumTokens: 100000,
      flashTokens: 150000,
      totalTokens: 250000,
      dailyBoost: 35714,
      validity: 7,
      distributionLogic: 'Daily spread: 100K premium + 150K Flash ÷ 7 days',
      maxPerMonth: 2,
      queueingAllowed: true,
      separatePool: true,
      costs: (() => {
        // UPDATED: Kimi K2 in routing
        const premiumCost = calculateRoutingCost(100000, {
          'gemini-2.5-flash': 0.55,
          'moonshotai/kimi-k2-thinking': 0.22,  // CHANGED
          'gemini-3-pro': 0.13,
          'gpt-5.1': 0.10,
        });
        const flashCost = calculateModelCost('gemini-2.5-flash', 150000);
        const gateway = 249 * (GATEWAY_FEE_PERCENTAGE / 100);
        const total = premiumCost + flashCost + gateway;
        
        return {
          ai: premiumCost + flashCost,
          gateway,
          total,
          profit: 249 - total,
          margin: ((249 - total) / 249) * 100,
        };
      })(),
    },

    documentation: {
      enabled: true,
      tier: 'business_intelligence',
      displayName: 'Business Intelligence',
      badge: '💼 BUSINESS',
      tagline: 'Transform documents into decisions',
      monthlyWords: 20000,
      maxWorkspaces: 50,
      exportFormats: ['pdf', 'docx', 'markdown', 'html', 'pptx', 'xlsx'],
      templates: true,
      versionHistory: 0,
      collaboration: true,
      advancedFeatures: {
        smartWorkflow: true,
        aiTagging: true,
        decisionSnapshot: true,
        legalFinanceLens: true,
        multiformatFusion: true,
        businessContextMemory: true,
      },
    },

    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
      smartRouting: true,
      multiModel: true,
    },

    // UPDATED: Costs with Kimi K2
    costs: (() => {
      const aiCost = calculateRoutingCost(1500000, {
        'gemini-2.5-flash': 0.55,
        'moonshotai/kimi-k2-thinking': 0.22,  // CHANGED
        'gemini-3-pro': 0.13,
        'gpt-5.1': 0.10,
      });
      const studioCost = 900 * STUDIO_CREDIT_COST;
      const gateway = 999 * (GATEWAY_FEE_PERCENTAGE / 100);
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
        revenue: 999,
        profit: 999 - totalCost,
        margin: ((999 - totalCost) / 999) * 100,
      };
    })(),

    // OPTIMIZED v5.1: Threshold-optimized routing for better margins
    costsInternational: (() => {
      const aiCost = calculateRoutingCost(3000000, {
        'gemini-2.5-flash': 0.30,
        'moonshotai/kimi-k2-thinking': 0.22,  // Increased from 15%
        'gemini-3-pro': 0.065,                // Reduced to under 200K threshold
        'gpt-5.1': 0.35,                      // Increased (FLAT pricing advantage)
        'claude-sonnet-4-5': 0.065,           // Reduced to under 200K threshold
      });
      const studioCost = 2250 * STUDIO_CREDIT_COST;
      const revenueINR = 46.99 * USD_TO_INR_RATE;
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

    paymentGateway: {
      razorpay: 'plan_edge_monthly',
      stripe: 'price_edge_monthly_usd',
    },
  },

  [PlanType.LIFE]: {
    id: PlanType.LIFE,
    name: 'life',
    displayName: 'Soriva Life',
    tagline: 'Not just AI — a reflection of you.',
    description: 'Smart AI + 1.7M tokens + Emotional Intelligence',
    price: 1199,
    priceUSD: 57.99,
    enabled: false,
    order: 5,
    personality: 'Premium companion with emotional depth',

    limits: {
      monthlyTokens: 1700000,
      monthlyWords: 1133333,
      dailyTokens: 56667,
      dailyWords: 37778,
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

    limitsInternational: {
      monthlyTokens: 3400000,
      monthlyWords: 2266667,
      dailyTokens: 113333,
      dailyWords: 75556,
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

    // UPDATED: Kimi K2 replaces Haiku
    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash',
        displayName: 'Gemini Flash',
        tier: RoutingTier.CASUAL,
        percentage: 45,
      },
      {
        provider: AIProvider.MOONSHOT,  // CHANGED: Was CLAUDE
        modelId: 'moonshotai/kimi-k2-thinking',  // CHANGED: Was claude-haiku-4-5
        displayName: 'Kimi K2',  // CHANGED: Was Claude Haiku 4.5
        tier: RoutingTier.SIMPLE,
        percentage: 19,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        tier: RoutingTier.MEDIUM,
        percentage: 11,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-3-pro',
        displayName: 'Gemini 3 Pro',
        tier: RoutingTier.COMPLEX,
        percentage: 8,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 17,
      },
    ],

    // UPDATED: Kimi K2 replaces Haiku
    routing: {
      'gemini-2.5-flash': 0.45,    // 765K tokens
      'moonshotai/kimi-k2-thinking': 0.19,    // 323K tokens (CHANGED: Was claude-haiku-4-5)
      'gemini-2.5-pro': 0.11,      // 187K tokens (safe!)
      'gemini-3-pro': 0.08,        // 136K tokens (safe!)
      'gpt-5.1': 0.17,             // 289K tokens
    },

    // OPTIMIZED v5.1: All premium models under 200K threshold!
    routingInternational: {
      'gemini-2.5-flash': 0.25,               // 850K tokens
      'moonshotai/kimi-k2-thinking': 0.29,    // 986K tokens (increased)
      'gemini-3-pro': 0.058,                  // 197K tokens ✅ UNDER 200K (was 600K!)
      'gpt-5.1': 0.344,                       // 1,170K tokens (increased - FLAT pricing!)
      'claude-sonnet-4-5': 0.058,             // 197K tokens ✅ UNDER 200K (was 510K!)
    },

    isHybrid: false,
    hasSmartRouting: true,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Life Instant Boost',
      description: 'Double your daily limit - unlimited feel',
      price: 35,
      priceUSD: 1,
      tokensUnlocked: 113334,
      wordsUnlocked: 75556,
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

    addonBooster: {
      type: 'ADDON',
      name: 'Life Weekly Power Boost',
      description: '300K tokens (150K premium + 150K Flash) over 7 days',
      price: 299,
      priceUSD: 6.99,
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
        // UPDATED: Kimi K2 in routing
        const premiumCost = calculateRoutingCost(150000, {
          'gemini-2.5-flash': 0.45,
          'moonshotai/kimi-k2-thinking': 0.19,  // CHANGED
          'gemini-2.5-pro': 0.11,
          'gemini-3-pro': 0.08,
          'gpt-5.1': 0.17,
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

    documentation: {
      enabled: true,
      tier: 'emotional_intelligence',
      displayName: 'Emotional Intelligence',
      badge: '💫 LIFE',
      tagline: 'Your documents, your story, your growth',
      monthlyWords: 20000,
      maxWorkspaces: 50,
      exportFormats: ['pdf', 'docx', 'markdown', 'html'],
      templates: true,
      versionHistory: 0,
      collaboration: false,
      advancedFeatures: {
        emotionalContextSummarizer: true,
        memoryCapsule: true,
        companionNotes: true,
        thoughtOrganizer: true,
        aiScrapbook: true,
        lifeReflectionInsights: true,
      },
    },

    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
      smartRouting: true,
      multiModel: true,
    },

    // UPDATED: Costs with Kimi K2
    costs: (() => {
      const aiCost = calculateRoutingCost(1700000, {
        'gemini-2.5-flash': 0.45,
        'moonshotai/kimi-k2-thinking': 0.19,  // CHANGED
        'gemini-2.5-pro': 0.11,
        'gemini-3-pro': 0.08,
        'gpt-5.1': 0.17,
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

    // OPTIMIZED v5.1: Threshold-optimized routing for better margins
    costsInternational: (() => {
      const aiCost = calculateRoutingCost(3400000, {
        'gemini-2.5-flash': 0.25,
        'moonshotai/kimi-k2-thinking': 0.29,  // Increased from 22.35%
        'gemini-3-pro': 0.058,                // Reduced to under 200K threshold
        'gpt-5.1': 0.344,                     // Increased (FLAT pricing advantage)
        'claude-sonnet-4-5': 0.058,           // Reduced to under 200K threshold
      });
      const studioCost = 3000 * STUDIO_CREDIT_COST;
      const revenueINR = 57.99 * USD_TO_INR_RATE;
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

    paymentGateway: {
      razorpay: 'plan_life_monthly',
      stripe: 'price_life_monthly_usd',
    },
  },
};

// ==========================================
// STUDIO CONSTANTS & BOOSTERS
// ==========================================

export const STUDIO_CREDITS_PER_RUPEE = 5;
export const STUDIO_BOOSTER_MAX_PER_MONTH = 3;

export const STUDIO_FEATURE_COSTS = {
  IMAGE_GENERATION: 0.22,
  TALKING_PHOTO_5SEC: 1.85,
  TALKING_PHOTO_10SEC: 1.9,
  LOGO_PREVIEW_SET: 0.58,
  LOGO_FINAL: 10.12,
} as const;

export const STUDIO_BOOSTERS: Record<string, StudioBooster> = {
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
// STUDIO FEATURES
// ==========================================

export interface StudioFeature {
  id: string;
  name: string;
  category: 'image' | 'video' | 'audio';
  credits: number;
  previewCredits?: number;
  freePreview?: boolean;
  maxPreviews?: number;
  resolution?: string;
  duration?: number;
  processingTime: string;
  outputFormat: string;
  gpuCost: number;
  margin: number;
}

export const STUDIO_FEATURES = {
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
// HELPER CONSTANTS
// ==========================================

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
  business_intelligence: {
    displayName: 'Business Intelligence',
    badge: '💼 BUSINESS',
    description: 'Transform documents into decisions',
  },
  emotional_intelligence: {
    displayName: 'Emotional Intelligence',
    badge: '💫 LIFE',
    description: 'Your documents, your story, your growth',
  },
} as const;

export const EXPORT_FORMATS_BY_TIER = {
  standard: ['pdf', 'markdown'],
  pro: ['pdf', 'docx', 'markdown', 'html'],
  business_intelligence: ['pdf', 'docx', 'markdown', 'html', 'pptx', 'xlsx'],
  emotional_intelligence: ['pdf', 'docx', 'markdown', 'html'],
} as const;

export const HINGLISH_TOKEN_SAVINGS = 0.5;
export const COOLDOWN_DURATION_HOURS = 0;
export const COOLDOWN_MAX_PER_PERIOD = 1;
export const COOLDOWN_MAX_STARTER = 5;
export const ADDON_MAX_PER_MONTH = 2;
export const ADDON_VALIDITY_DAYS = 7;
export const TRIAL_MAX_DAYS = 14;
export const FALLBACK_TRIGGER_RATE = 0.5;
export const USAGE_WARNING_THRESHOLD = 85;
export const USAGE_MULTIPLIER_INTERNATIONAL = 2.5;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getRegionFromCountry(countryCode: string): Region {
  return countryCode.toUpperCase() === 'IN' ? Region.INDIA : Region.INTERNATIONAL;
}

export function getCurrencyFromRegion(region: Region): Currency {
  return REGION_CURRENCY_MAP[region];
}

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

export function formatPrice(price: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];

  if (currency === Currency.INR) {
    return `${symbol}${Math.round(price)}`;
  }

  return `${symbol}${price.toFixed(2)}`;
}

export function getPaymentGateway(region: Region): string {
  return REGION_PAYMENT_GATEWAY[region];
}

export function tokensToWords(tokens: number, modelId: string): number {
  const ratio = getTokenRatio(modelId);
  return Math.floor(tokens / ratio);
}

export function wordsToTokens(words: number, modelId: string): number {
  const ratio = getTokenRatio(modelId);
  return Math.floor(words * ratio);
}

/**
 * Calculate dynamic daily limit based on remaining tokens and days
 * This is the core of our rollover strategy!
 */
export function calculateDynamicDailyLimit(
  remainingTokens: number,
  remainingDays: number
): number {
  if (remainingDays <= 0) return 0;
  return Math.floor(remainingTokens / remainingDays);
}

/**
 * Get model routing for a plan and region
 */
export function getPlanRouting(planType: PlanType, region: Region = Region.INDIA) {
  const plan = PLANS_STATIC_CONFIG[planType];
  if (region === Region.INTERNATIONAL && plan.routingInternational) {
    return plan.routingInternational;
  }
  return plan.routing || {};
}

export const USER_LOCATION = {
  country: 'India',
  region: Region.INDIA,
  currency: Currency.INR,
} as const;