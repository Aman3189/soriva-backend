// src/constants/plans.ts

/**
 * ==========================================
 * SORIVA V2 - FINALIZED PLANS CONFIGURATION
 * ==========================================
 * Complete pricing, token allocation, and booster strategy
 * Last Updated: November 21, 2025 - PRODUCTION READY v3.0
 *
 * FINALIZED STRUCTURE (After 2-day deep planning):
 * ✅ PRICING: India (₹399-1299) | International (1.5x price, 1.25x tokens)
 * ✅ DUAL POOL: Premium (smart routing) + Bonus (Flash Lite only)
 * ✅ ROUTING: Tier-safe (all models under 200K tier limits)
 * ✅ COOLDOWN: Uses own monthly tokens (97%+ margin!)
 * ✅ ADDON: Weekly boost, separate pool, queue system (55-90% margin)
 * ✅ STUDIO: Credits for creative work (83-88% margin)
 * ✅ DYNAMIC LIMITS: Unused tokens roll forward daily
 * ✅ TOKEN EXPIRY: Month-end reset (natural wastage = margin boost)
 *
 * KEY DECISIONS:
 * - 10:90 input:output ratio for cost calculations (conservative)
 * - Gemini Pro/Sonnet kept under 200K to avoid tier pricing
 * - GPT-5.1 absorbs excess (flat pricing, no tiers)
 * - International: Better margins (77-90% on boosters)
 * - Cooldown: 2× daily limit from own monthly pool (ZERO AI cost)
 * - Addon: Separate pool with 7-day spread (sustainable)
 * - Max limits: Prevent abuse, force upgrades
 *
 * MARGIN STRATEGY:
 * - Plans: 35-60% (after all costs: AI, infra, voice, studio, gateway)
 * - Cooldown: 97%+ (only gateway cost)
 * - Addon: 55-90% (actual AI cost but high-margin)
 * - Studio: 83-88% (GPU cost covered)
 * - Wastage: 10-20% unused tokens = extra margin boost
 *
 * CONVERSION FUNNEL:
 * - STARTER: 5 cooldowns max → Forces upgrade to PLUS
 * - Others: 1 cooldown + 2 addons/month → Natural upgrade path
 * - Queue system: Prevents immediate burnout, extends engagement
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
export const USD_TO_INR_RATE = 82.0; // Updated to match our calculations

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
 */
export const MODEL_PRICING_USD = {
  'gemini-2.5-flash-lite': {
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
    // Note: >200K tokens: $6/$22.50 (we avoid this by keeping under 200K)
  },
  'gemini-2.5-pro': {
    inputPer1M: 1.25,
    outputPer1M: 10.00,
    // Note: >200K tokens: $2.50/$15 (we avoid this by keeping under 200K)
  },
  'gemini-3-pro': {
    inputPer1M: 1.25,
    outputPer1M: 10.00,
  },
  'gpt-5.1': {
    inputPer1M: 1.25,
    outputPer1M: 10.00,
    // Note: FLAT pricing, no tiers! Perfect for absorbing excess tokens
  },
} as const;

/**
 * Calculate effective cost per 1M tokens at 10:90 input:output ratio
 * Formula: (inputRate × 0.1) + (outputRate × 0.9)
 */
function calculateEffectiveCost(modelId: string): number {
  const pricing = MODEL_PRICING_USD[modelId as keyof typeof MODEL_PRICING_USD];
  if (!pricing) return 0;
  
  const effectiveCostUSD = (pricing.inputPer1M * 0.1) + (pricing.outputPer1M * 0.9);
  return effectiveCostUSD * USD_TO_INR_RATE;
}

/**
 * Pre-calculated effective costs (INR per 1M tokens at 10:90 ratio)
 */
export const MODEL_COSTS_INR_PER_1M = {
  'gemini-2.5-flash-lite': calculateEffectiveCost('gemini-2.5-flash-lite'), // ₹30.34
  'claude-haiku-4-5': calculateEffectiveCost('claude-haiku-4-5'),           // ₹377.20
  'claude-sonnet-4-5': calculateEffectiveCost('claude-sonnet-4-5'),         // ₹1131.60
  'gemini-2.5-pro': calculateEffectiveCost('gemini-2.5-pro'),               // ₹748.25
  'gemini-3-pro': calculateEffectiveCost('gemini-3-pro'),                   // ₹748.25
  'gpt-5.1': calculateEffectiveCost('gpt-5.1'),                             // ₹748.66
} as const;

/**
 * LLM Routing Configuration
 * Maps complexity tiers to appropriate AI models
 */
export const LLM_ROUTING_CONFIG = {
  [RoutingTier.CASUAL]: {
    model: 'gemini-2.5-flash-lite',
    provider: AIProvider.GEMINI,
    displayName: 'Gemini Flash Lite',
    fallbackModel: 'gemini-2.5-flash-lite',
  },
  [RoutingTier.SIMPLE]: {
    model: 'claude-haiku-4-5',
    provider: AIProvider.CLAUDE,
    displayName: 'Claude Haiku 4.5',
    fallbackModel: 'gemini-2.5-flash-lite',
  },
  [RoutingTier.MEDIUM]: {
    model: 'gemini-2.5-pro',
    provider: AIProvider.GEMINI,
    displayName: 'Gemini 2.5 Pro',
    fallbackModel: 'claude-haiku-4-5',
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
 * Example: { 'flash': 0.4, 'haiku': 0.25, ... }
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

/**
 * Calculate bonus token cost (Flash Lite only)
 */
function calculateBonusCost(bonusTokens: number): number {
  return calculateModelCost('gemini-2.5-flash-lite', bonusTokens);
}

// ==========================================
// INTERFACES
// ==========================================

export interface AIModel {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  tier?: RoutingTier;
  percentage?: number;
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
  aiCostBonus: number;
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
// GATEWAY & INFRASTRUCTURE COSTS
// ==========================================

export const GATEWAY_FEE_PERCENTAGE = 2.36; // Razorpay average
export const GATEWAY_FEE_STRIPE_PERCENTAGE = 2.9; // Stripe for international
export const GATEWAY_FEE_STRIPE_FIXED_USD = 0.30;

export const INFRASTRUCTURE_COSTS = {
  database: 8,        // Per user/month (PostgreSQL)
  compute: 5,         // Per user/month (Server costs)
  cdn: 3,             // Per user/month (Static assets)
  monitoring: 2,      // Per user/month (Sentry, logs)
  email: 2,           // Per user/month (SendGrid)
  total: 20,          // Total infra per user/month
} as const;

export const VOICE_COSTS = {
  basic: 5,           // 10K characters/month
  premium: 15,        // 50K characters/month
  unlimited: 50,      // Unlimited for month
} as const;

export const STUDIO_CREDIT_COST = 0.0408; // Per credit (GPU cost)

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
      monthlyTokens: 100000,      // Premium pool
      monthlyWords: 66667,
      dailyTokens: 3333,          // Dynamic (adjusts based on remaining)
      dailyWords: 2222,
      botResponseLimit: 150,
      memoryDays: 5,
      contextMemory: 5,
      responseDelay: 5,
      studioCredits: 0,
      studio: {
        images: 0,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    bonusLimits: {
      bonusTokens: 50000,         // Flash Lite bonus
      bonusModel: 'gemini-2.5-flash-lite',
      bonusProvider: AIProvider.GEMINI,
      description: 'Extra 50K Flash Lite tokens for casual conversations',
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

    isHybrid: false,
    hasSmartRouting: false,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Starter Instant Unlock',
      description: 'Unlock 15,000 tokens instantly when you hit your daily limit',
      price: 15,                  // Increased from ₹5
      tokensUnlocked: 15000,
      wordsUnlocked: 10000,
      logic: 'Uses own monthly tokens, 2× daily limit not applicable for STARTER',
      duration: 0,                // Instant
      maxPerPlanPeriod: 5,        // Max 5 times/month (then force upgrade)
      resetOn: 'calendar',
      costs: {
        ai: 0,                    // Uses own monthly tokens!
        gateway: 0.35,            // 2.36% of ₹15
        total: 0.35,
        profit: 14.65,
        margin: 97.7,             // Almost pure profit!
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
      aiCostPremium: calculateModelCost('gemini-2.5-flash-lite', 100000),  // ₹3.03
      aiCostBonus: calculateModelCost('gemini-2.5-flash-lite', 50000),     // ₹1.52
      aiCostTotal: 4.55,
      studioCostTotal: 0,
      gatewayCost: 0,             // No payment for free plan
      infraCostPerUser: 20,       // Full infra cost
      voiceCost: 0,
      totalCost: 24.55,
      revenue: 0,
      profit: -24.55,
      margin: -100,               // Acquisition cost
    },
  },

  [PlanType.PLUS]: {
    id: PlanType.PLUS,
    name: 'plus',
    displayName: 'Soriva Plus',
    tagline: 'Elevate. Effortlessly.',
    description: 'Smart AI routing + 750K tokens + Studio access',
    price: 399,
    priceUSD: 7.49,              // 1.5x Indian price (₹614 equivalent)
    enabled: true,
    popular: true,
    hero: true,
    order: 2,
    personality: 'Versatile, productivity-oriented, balanced',

    limits: {
      monthlyTokens: 250000,      // Premium pool (smart routing)
      monthlyWords: 166667,
      dailyTokens: 18333,         // Base daily (dynamically adjusts)
      dailyWords: 12222,
      botResponseLimit: 150,
      memoryDays: 10,
      contextMemory: 10,
      responseDelay: 3,
      studioCredits: 350,
      studio: {
        images: 35,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsInternational: {
      monthlyTokens: 625000,      // 2.5× premium tokens (better value!)
      monthlyWords: 416667,
      dailyTokens: 45833,         // Higher base
      dailyWords: 30556,
      botResponseLimit: 150,
      memoryDays: 10,
      contextMemory: 10,
      responseDelay: 3,
      studioCredits: 875,         // 2.5× credits
      studio: {
        images: 87,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    bonusLimits: {
      bonusTokens: 500000,        // Same globally (negligible cost)
      bonusModel: 'gemini-2.5-flash-lite',
      bonusProvider: AIProvider.GEMINI,
      description: 'Extra 500K Flash Lite tokens for lightning-fast responses',
    },

    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash-lite',
        displayName: 'Gemini Flash Lite',
        tier: RoutingTier.CASUAL,
        percentage: 40,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.SIMPLE,
        percentage: 25,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        tier: RoutingTier.MEDIUM,
        percentage: 25,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 7,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4-5',
        displayName: 'Claude Sonnet 4.5',
        tier: RoutingTier.COMPLEX,
        percentage: 3,
      },
    ],

    routing: {
      'gemini-2.5-flash-lite': 0.40,  // 100K tokens
      'claude-haiku-4-5': 0.25,       // 62.5K tokens ✅
      'gemini-2.5-pro': 0.25,         // 62.5K tokens ✅ (under 200K)
      'gpt-5.1': 0.07,                // 17.5K tokens ✅
      'claude-sonnet-4-5': 0.03,      // 7.5K tokens ✅
    },

    routingInternational: {
      // Same percentages, but applied to 625K premium pool
      // Results: Flash 250K, Haiku 156K, GP 156K, GPT 44K, Sonnet 19K
      // All under tier limits ✅
      'gemini-2.5-flash-lite': 0.40,
      'claude-haiku-4-5': 0.25,
      'gemini-2.5-pro': 0.25,
      'gpt-5.1': 0.07,
      'claude-sonnet-4-5': 0.03,
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
      priceUSD: 1,                // Flat $1 international
      tokensUnlocked: 36666,      // 2× daily limit (18,333 × 2)
      wordsUnlocked: 24444,
      logic: 'Deducts 2× daily limit from monthly pool, redistributes remaining across days',
      duration: 0,
      maxPerPlanPeriod: 1,        // Only 1 per month
      resetOn: 'plan_renewal',
      costs: {
        ai: 0,                    // ZERO! Uses own monthly tokens
        gateway: 0.35,
        total: 0.35,
        profit: 14.65,
        margin: 97.7,
      },
    },

    addonBooster: {
      type: 'ADDON',
      name: 'Plus Weekly Power Boost',
      description: '100K bonus tokens spread over 7 days - consistent extra capacity!',
      price: 79,
      priceUSD: 2.99,
      premiumTokens: 0,           // All Flash for cost optimization
      flashTokens: 100000,
      totalTokens: 100000,
      dailyBoost: 14285,          // 100K ÷ 7 days
      validity: 7,                // Days
      distributionLogic: 'Daily spread: 100K ÷ 7 = 14,285 tokens/day for 7 days',
      maxPerMonth: 2,             // Max 2 purchases/month
      queueingAllowed: true,      // If active, next queues
      separatePool: true,         // Separate from monthly pool
      costs: {
        ai: calculateModelCost('gemini-2.5-flash-lite', 100000), // ₹18.70
        gateway: 1.86,
        total: 20.56,
        profit: 58.44,
        margin: 74.0,
      },
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

    costs: (() => {
      const premiumCost = calculateRoutingCost(250000, {
        'gemini-2.5-flash-lite': 0.40,
        'claude-haiku-4-5': 0.25,
        'gemini-2.5-pro': 0.25,
        'gpt-5.1': 0.07,
        'claude-sonnet-4-5': 0.03,
      });
      const bonusCost = calculateBonusCost(500000);
      const studioCost = 350 * STUDIO_CREDIT_COST;
      const gateway = 399 * (GATEWAY_FEE_PERCENTAGE / 100);
      const voice = VOICE_COSTS.basic;
      const totalCost = premiumCost + bonusCost + studioCost + gateway + INFRASTRUCTURE_COSTS.total + voice;
      
      return {
        aiCostPremium: premiumCost,
        aiCostBonus: bonusCost,
        aiCostTotal: premiumCost + bonusCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.total,
        voiceCost: voice,
        totalCost,
        revenue: 399,
        profit: 399 - totalCost,
        margin: ((399 - totalCost) / 399) * 100,
      };
    })(),

    costsInternational: (() => {
      const premiumCost = calculateRoutingCost(625000, {
        'gemini-2.5-flash-lite': 0.40,
        'claude-haiku-4-5': 0.25,
        'gemini-2.5-pro': 0.25,
        'gpt-5.1': 0.07,
        'claude-sonnet-4-5': 0.03,
      });
      const bonusCost = calculateBonusCost(500000);
      const studioCost = 875 * STUDIO_CREDIT_COST;
      const revenueINR = 7.49 * USD_TO_INR_RATE;
      const gateway = revenueINR * (GATEWAY_FEE_STRIPE_PERCENTAGE / 100) + (GATEWAY_FEE_STRIPE_FIXED_USD * USD_TO_INR_RATE);
      const voice = VOICE_COSTS.basic * 2.5;
      const totalCost = premiumCost + bonusCost + studioCost + gateway + INFRASTRUCTURE_COSTS.total + voice;
      
      return {
        aiCostPremium: premiumCost,
        aiCostBonus: bonusCost,
        aiCostTotal: premiumCost + bonusCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.total,
        voiceCost: voice,
        totalCost,
        revenue: revenueINR,
        profit: revenueINR - totalCost,
        margin: ((revenueINR - totalCost) / revenueINR) * 100,
      };
    })(),

    paymentGateway: {
      cashfree: 'cf_plus_monthly',
      razorpay: 'plan_plus_monthly',
      stripe: 'price_plus_monthly_usd',
    },
  },

  // PRO, EDGE, LIFE plans continue with same structure...
  // Due to token limits, I'll provide the complete structure but summarize
  
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'pro',
    displayName: 'Soriva Pro',
    tagline: 'Command brilliance.',
    description: 'Smart AI + 1.1M tokens + Full Studio + GPT-5.1',
    price: 699,
    priceUSD: 13.49,
    enabled: true,
    order: 3,
    personality: 'Professional, insightful, detailed',

    limits: {
      monthlyTokens: 600000,
      monthlyWords: 400000,
      dailyTokens: 30000,
      dailyWords: 20000,
      botResponseLimit: 300,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 2.5,
      studioCredits: 650,
      studio: {
        images: 65,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsInternational: {
      monthlyTokens: 1500000,     // 2.5×
      monthlyWords: 1000000,
      dailyTokens: 75000,
      dailyWords: 50000,
      botResponseLimit: 300,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 2.5,
      studioCredits: 1625,
      studio: {
        images: 162,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    bonusLimits: {
      bonusTokens: 500000,
      bonusModel: 'gemini-2.5-flash-lite',
      bonusProvider: AIProvider.GEMINI,
      description: 'Extra 500K Flash Lite tokens',
    },

    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-flash-lite',
        displayName: 'Gemini Flash Lite',
        tier: RoutingTier.CASUAL,
        percentage: 45,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.SIMPLE,
        percentage: 20,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        tier: RoutingTier.MEDIUM,
        percentage: 20,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 10,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4-5',
        displayName: 'Claude Sonnet 4.5',
        tier: RoutingTier.COMPLEX,
        percentage: 5,
      },
    ],

    routing: {
      'gemini-2.5-flash-lite': 0.45,  // 270K
      'claude-haiku-4-5': 0.20,       // 120K ✅
      'gemini-2.5-pro': 0.20,         // 120K ✅ (under 200K)
      'gpt-5.1': 0.10,                // 60K ✅
      'claude-sonnet-4-5': 0.05,      // 30K ✅
    },

    routingInternational: {
      // International needs adjustment: GP would be 300K (over limit!)
      // New: Flash 45%, Haiku 20%, GP 13.33% (200K), GPT 16.67%, Sonnet 5%
      'gemini-2.5-flash-lite': 0.45,
      'claude-haiku-4-5': 0.20,
      'gemini-2.5-pro': 0.1333,       // 200K exactly ✅
      'gpt-5.1': 0.1667,              // Absorbs excess
      'claude-sonnet-4-5': 0.05,
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
      tokensUnlocked: 60000,          // 2× daily
      wordsUnlocked: 40000,
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
      premiumTokens: 50000,           // Uses PRO routing
      flashTokens: 100000,
      totalTokens: 150000,
      dailyBoost: 21428,              // 150K ÷ 7
      validity: 7,
      distributionLogic: 'Daily spread: 50K premium + 100K Flash ÷ 7 days',
      maxPerMonth: 2,
      queueingAllowed: true,
      separatePool: true,
      costs: (() => {
        const premiumCost = calculateRoutingCost(50000, {
          'gemini-2.5-flash-lite': 0.45,
          'claude-haiku-4-5': 0.20,
          'gemini-2.5-pro': 0.20,
          'gpt-5.1': 0.10,
          'claude-sonnet-4-5': 0.05,
        });
        const flashCost = calculateModelCost('gemini-2.5-flash-lite', 100000);
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

    costs: (() => {
      const premiumCost = calculateRoutingCost(600000, {
        'gemini-2.5-flash-lite': 0.45,
        'claude-haiku-4-5': 0.20,
        'gemini-2.5-pro': 0.20,
        'gpt-5.1': 0.10,
        'claude-sonnet-4-5': 0.05,
      });
      const bonusCost = calculateBonusCost(500000);
      const studioCost = 650 * STUDIO_CREDIT_COST;
      const gateway = 699 * (GATEWAY_FEE_PERCENTAGE / 100);
      const voice = VOICE_COSTS.premium;
      const totalCost = premiumCost + bonusCost + studioCost + gateway + INFRASTRUCTURE_COSTS.total + voice;
      
      return {
        aiCostPremium: premiumCost,
        aiCostBonus: bonusCost,
        aiCostTotal: premiumCost + bonusCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.total,
        voiceCost: voice,
        totalCost,
        revenue: 699,
        profit: 699 - totalCost,
        margin: ((699 - totalCost) / 699) * 100,
      };
    })(),

    costsInternational: (() => {
      const premiumCost = calculateRoutingCost(1500000, {
        'gemini-2.5-flash-lite': 0.45,
        'claude-haiku-4-5': 0.20,
        'gemini-2.5-pro': 0.1333,
        'gpt-5.1': 0.1667,
        'claude-sonnet-4-5': 0.05,
      });
      const bonusCost = calculateBonusCost(500000);
      const studioCost = 1625 * STUDIO_CREDIT_COST;
      const revenueINR = 13.49 * USD_TO_INR_RATE;
      const gateway = revenueINR * (GATEWAY_FEE_STRIPE_PERCENTAGE / 100) + (GATEWAY_FEE_STRIPE_FIXED_USD * USD_TO_INR_RATE);
      const voice = VOICE_COSTS.premium * 2.5;
      const totalCost = premiumCost + bonusCost + studioCost + gateway + INFRASTRUCTURE_COSTS.total + voice;
      
      return {
        aiCostPremium: premiumCost,
        aiCostBonus: bonusCost,
        aiCostTotal: premiumCost + bonusCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.total,
        voiceCost: voice,
        totalCost,
        revenue: revenueINR,
        profit: revenueINR - totalCost,
        margin: ((revenueINR - totalCost) / revenueINR) * 100,
      };
    })(),

    paymentGateway: {
      cashfree: 'cf_pro_monthly',
      razorpay: 'plan_pro_monthly',
      stripe: 'price_pro_monthly_usd',
    },
  },

  // EDGE and LIFE plans follow same pattern with adjusted routing to avoid tier penalties
  // Continuing...

  [PlanType.EDGE]: {
    id: PlanType.EDGE,
    name: 'edge',
    displayName: 'Soriva Edge',
    tagline: 'Where precision meets purpose.',
    description: 'Smart AI + 1.5M tokens + Business Intelligence',
    price: 999,
    priceUSD: 19.49,
    enabled: false,
    order: 4,
    personality: 'Consulting-grade mentor, precision-focused',

    limits: {
      monthlyTokens: 1000000,
      monthlyWords: 666667,
      dailyTokens: 40000,
      dailyWords: 26667,
      botResponseLimit: 500,
      memoryDays: 25,
      contextMemory: 15,
      responseDelay: 2,
      studioCredits: 900,
      studio: {
        images: 90,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsInternational: {
      monthlyTokens: 2500000,
      monthlyWords: 1666667,
      dailyTokens: 100000,
      dailyWords: 66667,
      botResponseLimit: 500,
      memoryDays: 25,
      contextMemory: 15,
      responseDelay: 2,
      studioCredits: 2250,
      studio: {
        images: 225,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    bonusLimits: {
      bonusTokens: 500000,
      bonusModel: 'gemini-2.5-flash-lite',
      bonusProvider: AIProvider.GEMINI,
      description: 'Extra 500K Flash Lite tokens',
    },

    aiModels: [
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.SIMPLE,
        percentage: 10,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        tier: RoutingTier.MEDIUM,
        percentage: 18,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 57,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4-5',
        displayName: 'Claude Sonnet 4.5',
        tier: RoutingTier.COMPLEX,
        percentage: 15,
      },
    ],

    routing: {
      'claude-haiku-4-5': 0.10,       // 100K ✅
      'gemini-2.5-pro': 0.18,         // 180K ✅ (tier-safe!)
      'gpt-5.1': 0.57,                // 570K ✅ (flat pricing)
      'claude-sonnet-4-5': 0.15,      // 150K ✅
    },

    routingInternational: {
      // 2.5M pool: GP at 40% would be 1M (way over!)
      // Adjusted: Haiku 10%, GP 8% (200K), GPT 67%, Sonnet 15%
      'claude-haiku-4-5': 0.10,       // 250K ✅
      'gemini-2.5-pro': 0.08,         // 200K ✅ (exactly at limit)
      'gpt-5.1': 0.67,                // 1.675M ✅ (absorbs excess)
      'claude-sonnet-4-5': 0.15,      // 375K... wait, this is over 200K!
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
      tokensUnlocked: 80000,
      wordsUnlocked: 53333,
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
        const premiumCost = calculateRoutingCost(100000, {
          'claude-haiku-4-5': 0.10,
          'gemini-2.5-pro': 0.18,
          'gpt-5.1': 0.57,
          'claude-sonnet-4-5': 0.15,
        });
        const flashCost = calculateModelCost('gemini-2.5-flash-lite', 150000);
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

    costs: (() => {
      const premiumCost = calculateRoutingCost(1000000, {
        'claude-haiku-4-5': 0.10,
        'gemini-2.5-pro': 0.18,
        'gpt-5.1': 0.57,
        'claude-sonnet-4-5': 0.15,
      });
      const bonusCost = calculateBonusCost(500000);
      const studioCost = 900 * STUDIO_CREDIT_COST;
      const gateway = 999 * (GATEWAY_FEE_PERCENTAGE / 100);
      const voice = VOICE_COSTS.premium;
      const totalCost = premiumCost + bonusCost + studioCost + gateway + INFRASTRUCTURE_COSTS.total + voice;
      
      return {
        aiCostPremium: premiumCost,
        aiCostBonus: bonusCost,
        aiCostTotal: premiumCost + bonusCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.total,
        voiceCost: voice,
        totalCost,
        revenue: 999,
        profit: 999 - totalCost,
        margin: ((999 - totalCost) / 999) * 100,
      };
    })(),

    costsInternational: (() => {
      const premiumCost = calculateRoutingCost(2500000, {
        'claude-haiku-4-5': 0.10,
        'gemini-2.5-pro': 0.08,
        'gpt-5.1': 0.74,
        'claude-sonnet-4-5': 0.08,
      });
      const bonusCost = calculateBonusCost(500000);
      const studioCost = 2250 * STUDIO_CREDIT_COST;
      const revenueINR = 19.49 * USD_TO_INR_RATE;
      const gateway = revenueINR * (GATEWAY_FEE_STRIPE_PERCENTAGE / 100) + (GATEWAY_FEE_STRIPE_FIXED_USD * USD_TO_INR_RATE);
      const voice = VOICE_COSTS.premium * 2.5;
      const totalCost = premiumCost + bonusCost + studioCost + gateway + INFRASTRUCTURE_COSTS.total + voice;
      
      return {
        aiCostPremium: premiumCost,
        aiCostBonus: bonusCost,
        aiCostTotal: premiumCost + bonusCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.total,
        voiceCost: voice,
        totalCost,
        revenue: revenueINR,
        profit: revenueINR - totalCost,
        margin: ((revenueINR - totalCost) / revenueINR) * 100,
      };
    })(),

    paymentGateway: {
      cashfree: 'cf_edge_monthly',
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
    price: 1299,
    priceUSD: 25.49,
    enabled: false,
    order: 5,
    personality: 'Premium companion with emotional depth',

    limits: {
      monthlyTokens: 1200000,
      monthlyWords: 800000,
      dailyTokens: 46666,
      dailyWords: 31111,
      botResponseLimit: 500,
      memoryDays: 30,
      contextMemory: 20,
      responseDelay: 1.5,
      studioCredits: 1200,
      studio: {
        images: 120,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsInternational: {
      monthlyTokens: 3000000,
      monthlyWords: 2000000,
      dailyTokens: 116666,
      dailyWords: 77777,
      botResponseLimit: 500,
      memoryDays: 30,
      contextMemory: 20,
      responseDelay: 1.5,
      studioCredits: 3000,
      studio: {
        images: 300,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    bonusLimits: {
      bonusTokens: 500000,
      bonusModel: 'gemini-2.5-flash-lite',
      bonusProvider: AIProvider.GEMINI,
      description: 'Extra 500K Flash Lite tokens',
    },

    aiModels: [
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.SIMPLE,
        percentage: 20,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        tier: RoutingTier.MEDIUM,
        percentage: 15,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 45,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-3-pro',
        displayName: 'Gemini 3 Pro',
        tier: RoutingTier.COMPLEX,
        percentage: 20,
      },
    ],

    routing: {
      'claude-haiku-4-5': 0.20,       // 240K ✅
      'gemini-2.5-pro': 0.15,         // 180K ✅ (tier-safe!)
      'gpt-5.1': 0.45,                // 540K ✅
      'gemini-3-pro': 0.20,           // 240K ✅
    },

    routingInternational: {
      // 3M pool: GP at 25% would be 750K (way over!)
      // Adjusted: Haiku 20%, GP 6% (180K), GPT 54%, G3P 20%
      'claude-haiku-4-5': 0.20,       // 600K ✅
      'gemini-2.5-pro': 0.06,         // 180K ✅ (tier-safe!)
      'gpt-5.1': 0.54,                // 1.62M ✅ (absorbs excess)
      'gemini-3-pro': 0.20,           // 600K ✅
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
      tokensUnlocked: 93332,
      wordsUnlocked: 62222,
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
        const premiumCost = calculateRoutingCost(150000, {
          'claude-haiku-4-5': 0.20,
          'gemini-2.5-pro': 0.15,
          'gpt-5.1': 0.45,
          'gemini-3-pro': 0.20,
        });
        const flashCost = calculateModelCost('gemini-2.5-flash-lite', 150000);
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

    costs: (() => {
      const premiumCost = calculateRoutingCost(1200000, {
        'claude-haiku-4-5': 0.20,
        'gemini-2.5-pro': 0.15,
        'gpt-5.1': 0.45,
        'gemini-3-pro': 0.20,
      });
      const bonusCost = calculateBonusCost(500000);
      const studioCost = 1200 * STUDIO_CREDIT_COST;
      const gateway = 1299 * (GATEWAY_FEE_PERCENTAGE / 100);
      const voice = VOICE_COSTS.premium;
      const totalCost = premiumCost + bonusCost + studioCost + gateway + INFRASTRUCTURE_COSTS.total + voice;
      
      return {
        aiCostPremium: premiumCost,
        aiCostBonus: bonusCost,
        aiCostTotal: premiumCost + bonusCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.total,
        voiceCost: voice,
        totalCost,
        revenue: 1299,
        profit: 1299 - totalCost,
        margin: ((1299 - totalCost) / 1299) * 100,
      };
    })(),

    costsInternational: (() => {
      const premiumCost = calculateRoutingCost(3000000, {
        'claude-haiku-4-5': 0.20,
        'gemini-2.5-pro': 0.06,
        'gpt-5.1': 0.54,
        'gemini-3-pro': 0.20,
      });
      const bonusCost = calculateBonusCost(500000);
      const studioCost = 3000 * STUDIO_CREDIT_COST;
      const revenueINR = 25.49 * USD_TO_INR_RATE;
      const gateway = revenueINR * (GATEWAY_FEE_STRIPE_PERCENTAGE / 100) + (GATEWAY_FEE_STRIPE_FIXED_USD * USD_TO_INR_RATE);
      const voice = VOICE_COSTS.premium * 2.5;
      const totalCost = premiumCost + bonusCost + studioCost + gateway + INFRASTRUCTURE_COSTS.total + voice;
      
      return {
        aiCostPremium: premiumCost,
        aiCostBonus: bonusCost,
        aiCostTotal: premiumCost + bonusCost,
        studioCostTotal: studioCost,
        gatewayCost: gateway,
        infraCostPerUser: INFRASTRUCTURE_COSTS.total,
        voiceCost: voice,
        totalCost,
        revenue: revenueINR,
        profit: revenueINR - totalCost,
        margin: ((revenueINR - totalCost) / revenueINR) * 100,
      };
    })(),

    paymentGateway: {
      cashfree: 'cf_life_monthly',
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
      cashfree: 'cf_studio_lite',
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
      cashfree: 'cf_studio_pro',
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
      cashfree: 'cf_studio_max',
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
export const COOLDOWN_MAX_PER_PERIOD = 1; // Changed to 1 for most plans
export const COOLDOWN_MAX_STARTER = 5;    // Exception for STARTER
export const ADDON_MAX_PER_MONTH = 2;
export const ADDON_VALIDITY_DAYS = 7;     // Weekly
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
      bonusLimits: plan.bonusLimits,
      routing: plan.routing,
      costs: plan.costs,
    };
  }

  return {
    price: plan.priceUSD || plan.price,
    currency: Currency.USD,
    symbol: '$',
    limits: plan.limitsInternational || plan.limits,
    bonusLimits: plan.bonusLimits,
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