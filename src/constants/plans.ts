// src/constants/plans.ts

/**
 * ==========================================
 * SORIVA V3 - FINALIZED PLANS CONFIGURATION
 * ==========================================
 * Complete pricing, token allocation, and booster strategy
 * Last Updated: February 22, 2026 - PRODUCTION READY v12.0
 * ==========================================
 * v12.0 CHANGELOG (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 * 
 * ✅ REMOVED MODELS:
 *    - Klein 9B ❌
 *    - Nano Banana ❌  
 *    - Flux Kontext ❌
 *    - GPT Image 1.5 Medium ❌
 *
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell: ₹0.25/image - General images (scenery, nature, animals)
 *    - GPT LOW: ₹1.18/image - Everything else (ads, festivals, transforms, documents)
 *
 * ✅ GPT Image 1.5 LOW Pricing (OpenAI Official):
 *    - Portrait (1024×1536): $0.013 = ₹1.18
 *    - Landscape (1536×1024): $0.013 = ₹1.18
 *    - Square (1024×1024): $0.009 = ₹0.82 [NOT USED - crops images]
 *
 * ✅ IMAGE ALLOCATION INCREASE (Same cost, more images!):
 *    | Plan    | Schnell | GPT LOW | Total IN | Total INTL | % Increase |
 *    |---------|---------|---------|----------|------------|------------|
 *    | STARTER |   19    |   26    |    45    |     90     |   +55%     |
 *    | LITE    |   28    |   50    |    78    |    169     |   +63%     |
 *    | PLUS    |   41    |   76    |   117    |    240     |   +65%     |
 *    | PRO     |   55    |  142    |   197    |    402     |   +79%     |
 *    | APEX    |   82    |  223    |   305    |    595     |   +80%     |
 *
 * ✅ ROUTING LOGIC:
 *    - Scenery/Nature/Animals → Schnell (₹0.25)
 *    - Text/Ads/Festivals/Posters/Transforms/Documents → GPT LOW (₹1.18)
 *
 * ==========================================
 * v10.3 CHANGELOG (January 19, 2026): [SUPERSEDED by v12.0]
 * ==========================================
 * ✅ DUAL IMAGE MODEL SYSTEM:
 *    - Klein 9B (BFL): ₹1.26/image - Text/Cards/Deities/Festivals
 *    - Schnell (Fal.ai): ₹0.25/image - General images (people, animals, objects)
 *    - Smart routing based on prompt keywords
 *
 * ✅ NEW LITE PLAN ADDED (₹149/$4.99):
 *    - 500K tokens (India) / 1M tokens (Intl)
 *    - 45 images (20 Klein + 25 Schnell) India
 *    - 75 images (30 Klein + 45 Schnell) Intl
 *    - Mistral Large 3 only
 *    - No voice/camera
 *
 * ✅ UPDATED IMAGE ALLOCATION (Dual Model):
 *    | Plan    | Klein | Schnell | Total (India) | Total (Intl) |
 *    |---------|-------|---------|---------------|--------------|
 *    | STARTER |   1   |    4    |       5       |       5      |
 *    | LITE    |  20   |   25    |      45       |      75      |
 *    | PLUS    |  30   |   45    |      75       |     165      |
 *    | PRO     |  50   |   75    |     125       |     375      |
 *    | APEX    |  80   |  120    |     200       |     475      |
 *
 * ✅ REMOVED FEATURES (All Plans):
 *    - talkingPhotos → 0
 *    - logoPreview → 0
 *    - logoPurchase → 0
 *
 * ✅ UPDATED MARGINS (with Schnell addition):
 *    - PLUS India: 19.1% | PLUS Intl: 22.6%
 *    - PRO India: 28.4% | PRO Intl: 32.4%
 *    - APEX India: 27.8% | APEX Intl: 35.1%
 *
 * ==========================================
 * v10.2 CHANGELOG (January 17, 2026): [SUPERSEDED by v10.3]
 * ==========================================
 * NOTE: v10.2 used Klein-only. v10.3 restored dual model (Klein + Schnell)
 *
 * ✅ IMAGE MODEL UPDATE:
 *    - Replaced Schnell + Fast with single FLUX Klein 9B (BFL Official)
 *    - Model: black-forest-labs/FLUX.2-klein-9b @ ₹1.26/image
 *    - Permanent URLs (no expiry issues)
 *    - Better quality for Indian cultural content
 *
 * ✅ OLD IMAGE ALLOCATION (Klein-only):
 *    - STARTER: 5 images (India & International)
 *    - PLUS India: 30 images | International: 65 images
 *    - PRO India: 50 images | International: 150 images
 *    - APEX India: 70 images | International: 190 images
 *
 * ✅ PLUS INDIA VOICE/CAMERA UPDATE:
 *    - Voice: 20 min → 15 min
 *    - Camera: 3 min → 0 min (Camera starts from PRO)
 *
 * ✅ NEW MARGINS:
 *    - PLUS India: 22.9% | PLUS Intl: 22.5%
 *    - PRO India: ~30% | PRO Intl: ~35%
 *    - APEX India: ~31% | APEX Intl: ~36%
 *
 * ==========================================
 * v10.1 CHANGELOG (January 16, 2026):
 * ==========================================
 * ✅ IMAGE MODEL UPDATE:
 *    - Replaced Flux Dev with Flux Fast (prunaai)
 *    - dev → fast (renamed throughout)
 *    - devImages → fastImages
 *    - devCost → fastCost
 *
 * ✅ IMAGE MODELS:
 *    - schnell: black-forest-labs/FLUX.1-schnell @ ₹0.25
 *    - fast: prunaai/flux-fast @ ₹0.42
 *
 * ✅ FRONTEND MAPPING:
 *    - Spark ⚡ → schnell
 *    - Nova ✨ → fast
 *
 * ✅ MARGIN IMPROVEMENTS (flux-fast vs old flux-dev):
 *    - PLUS India: 16.8% → 23.8%
 *    - PRO India: 25.9% → 34.6%
 *    - APEX India: 26.6% → 35.1%
 *
 * ==========================================
 * v10.0 CHANGELOG (January 15, 2026):
 * ==========================================
 * ✅ COMPLETE PLAN RESTRUCTURE:
 *    - Based on India Plans V2 & International Plans V3 FINAL Excel
 *    - All margins recalculated with new token allocations
 *    - Studio Credits REMOVED - Direct image counts now
 *
 * ✅ INDIA PRICING & TOKENS:
 *    - STARTER: FREE, 300K Gemini 100%, 5 images
 *    - PLUS: ₹299, 1.25M (Mistral 50% + Gemini 35% + Devstral 15%), 45 images
 *    - PRO: ₹799, 2M (Mistral 50% + Gemini 35% + Devstral 15%), 100 images
 *    - APEX: ₹1,299, 3.5M (Mistral 50% + Gemini 35% + Devstral 15%), 105 images
 *
 * ✅ INTERNATIONAL PRICING & TOKENS:
 *    - STARTER: FREE, 300K Gemini 100%, 5 images
 *    - PLUS: $15.99, 2M (Mistral 50% + Gemini 35% + Devstral 15%), 160 images
 *    - PRO: $29.99, 4.25M (Mistral 50% + Gemini 35% + Devstral 15%), 260 images
 *    - APEX: $49.99, 7M (Mistral 50% + Gemini 35% + Devstral 15%), 290 images
 *
 * ✅ VOICE & CAMERA (OnAir):
 *    - INDIA: PLUS 20min/3min, PRO 30min/5min, APEX 40min/7.5min
 *    - INTERNATIONAL: PLUS 40min/6min, PRO 60min/10min, APEX 80min/15min
 *
 * ✅ FLASH 2.0 FALLBACK:
 *    - 500K tokens for PLUS/PRO/APEX (query completion only)
 *    - Emergency buffer when primary exhausted
 *
 * ✅ ADDON BOOSTERS (7-day validity):
 *    - STARTER: ₹49/$1, 300K Mistral, 10/20 Schnell
 *    - PLUS: ₹79/$2.99, 500K Mistral, 5/35 Schnell + 0/5 Dev
 *    - PRO: ₹199/$5.99, 750K Mistral, 25/75 Schnell + 5/20 Dev
 *
 * ✅ MARGIN TARGETS:
 *    - INDIA: PLUS 26%, PRO 31%, APEX 30%
 *    - INTERNATIONAL: PLUS 33%, PRO 39%, APEX 39%
 *
 * ==========================================
 * PRICING STRUCTURE:
 * ==========================================
 * ┌───────────┬──────────┬──────────────┐
 * │ Plan      │ India    │ International│
 * ├───────────┼──────────┼──────────────┤
 * │ Starter   │ ₹149     │ $3.99        │
 * │ Lite      │ ₹299     │ $5.99        │
 * │ Plus      │ ₹399     │ $9.99        │
 * │ Pro       │ ₹799     │ $29.99       │
 * │ Apex      │ ₹1,599   │ $59.99       │
 * └───────────┴──────────┴──────────────┘
```
 * ==========================================
 * TOKEN ALLOCATION:
 * ==========================================
 * ┌─────────────────┬────────────┬──────────────┐
 * │ Plan            │ India      │ International│
 * ├─────────────────┼────────────┼──────────────┤
 * │ Starter Free    │ 3.5L       │ 3.5L         │
 * │ Starter Paid    │ 6.3L       │ 14L          │
 * │ Lite            │ 9.8L       │ 19.6L        │
 * │ Plus            │ 21L        │ 31.2L        │
 * │ Pro             │ 23.1L      │ 54.4L        │
 * │ Apex            │ 44.6L      │ 78L          │
 * └─────────────────┴────────────┴──────────────┘
 * ==========================================
 * MODEL COSTS REFERENCE (INR per 1M @ 1:3 ratio):
 * ==========================================
 * - Mistral Large 3: ₹104.6/1M (blended)
 * - Claude Haiku 4.5: ₹334.8/1M (blended)
 * - Gemini 2.0 Flash: ₹27.2/1M (fallback)
 * - GPT-5.1: ₹653.7/1M (blended)
 * - Claude Sonnet 4.5: ₹1,004/1M (blended)
 * - Flux Klein 9B: ₹1.26/img (text/deities/festivals)
 * - Flux Schnell: ₹0.25/img (general images)
 * - Voice (OnAir): ₹1.42/min
 * - Camera: ₹5.04/min (India), ₹5.02/min (International)
 *
 * ==========================================
 * TECHNICAL NOTES:
 * ==========================================
 * - USD to INR rate: ₹83.7 (from Excel)
 * - Gateway fees: Razorpay 2.36% | Stripe 2.9% + $0.30
 * - All costs use 1:3 input:output ratio (blended)
 * - Flash 2.0 Fallback: Emergency buffer only
 * - Docs/Tools/Health: From token pool (no separate limit)
 */

// ==========================================
// IMPORTS FROM PRISMA ENUMS
// ==========================================

import {
  PlanType,
  BoosterCategory,
} from '@prisma/client';

/**
 * Helper function to convert plan type enum to string name
 */
export function planTypeToName(planType: PlanType): string {
  const names: Record<PlanType, string> = {
    [PlanType.STARTER]: 'starter',
    [PlanType.LITE]: 'lite',
    [PlanType.PLUS]: 'plus',
    [PlanType.PRO]: 'pro',
    [PlanType.APEX]: 'apex',
    [PlanType.SOVEREIGN]: 'sovereign',
  };
  return names[planType] || 'starter';
}

// Re-export Prisma enums for convenience
export { PlanType, BoosterCategory };

// ==========================================
// 🤖 AI PROVIDERS & CORE ENUMS
// ==========================================

export enum AIProvider {
  GEMINI = 'gemini',
  MISTRAL = 'mistral',
}

// ==========================================
// 🌍 REGION & CURRENCY ENUMS
// ==========================================

export enum Region {
  INDIA = 'IN',
  INTERNATIONAL = 'INTL',
}

export enum VoiceTechnology {
  NONE = 'none',
  BASIC = 'basic',
  ONAIR = 'onair',
  PREMIUM = 'premium',
}

export enum Currency {
  INR = 'INR',
  USD = 'USD',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export type DocumentIntelligenceTier =
  | 'starter'
  | 'standard'
  | 'pro'
  | 'apex';

// ==========================================
// 💱 CURRENCY CONFIGURATION
// ==========================================

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.INR]: '₹',
  [Currency.USD]: '$',
};

export const INR_TO_USD_RATE = 0.01195;
export const USD_TO_INR_RATE = 90.77;

export const REGION_CURRENCY_MAP: Record<Region, Currency> = {
  [Region.INDIA]: Currency.INR,
  [Region.INTERNATIONAL]: Currency.USD,
};

export const REGION_PAYMENT_GATEWAY: Record<Region, string> = {
  [Region.INDIA]: 'razorpay',
  [Region.INTERNATIONAL]: 'stripe',
};

// ==========================================
// 🔢 TOKEN RATIOS (Words per Token)
// ==========================================

export const TOKEN_RATIOS = {
  'gemini-2.0-flash': 1.5,
  'mistral-large-latest': 1.5,
  'devstral-medium-latest': 1.5,
  default: 1.5,
} as const;

export function getTokenRatio(modelId: string): number {
  return TOKEN_RATIOS[modelId as keyof typeof TOKEN_RATIOS] || TOKEN_RATIOS.default;
}

// ==========================================
// 🎯 ROUTING TIERS
// ==========================================

export enum RoutingTier {
  SIMPLE = 'simple',
  CASUAL = 'casual',
  MEDIUM = 'medium',
  COMPLEX = 'complex',
  EXPERT = 'expert',
  CODING = 'coding',
}

// ==========================================
// 💰 MODEL PRICING (USD per 1M tokens)
// ==========================================

export const MODEL_PRICING_USD = {
  'mistral-large-latest': {
    input: 0.5,
    output: 1.5,
    blended_1_3: 1.25,
  },
  'gemini-2.0-flash': {
    input: 0.10,
    output: 0.40,
    blended_1_3: 0.325,
  },
  'devstral-medium-latest': {
    input: 0.4,
    output: 2,
    blended_1_3: 1.6,
  },
} as const;

// ==========================================
// 🖼️ IMAGE COSTS (INR)
// ==========================================
// v12.0 UPDATE (February 22, 2026):
// - SIMPLIFIED TO 2 MODELS ONLY
// - Removed: Klein 9B, Flux Kontext, Nano Banana, GPT Medium
// - Schnell: ₹0.25 - General/scenery images
// - GPT LOW: ₹1.18 - Everything else (ads, festivals, transforms, documents)
// 
// GPT Image 1.5 LOW Pricing (OpenAI Official):
// - Square 1024x1024: $0.009 = ₹0.82 (NOT USED - crops images)
// - Portrait 1024x1536: $0.013 = ₹1.18
// - Landscape 1536x1024: $0.013 = ₹1.18
//
// NOTE: Square removed due to image cropping issues

export const IMAGE_COSTS = {
  schnell: {
    costPerImage: 0.25,
    displayName: 'Flux Schnell',
    internalModel: 'fal-ai/flux/schnell',
    description: 'Fast general image generation - scenery, nature, animals',
    supportedSizes: ['1:1', '16:9', '9:16', '4:3', '3:4'],
  },
  gptLow: {
    costPerImagePortrait: 1.18,
    costPerImageLandscape: 1.18,
    displayName: 'GPT Image 1.5 LOW',
    internalModel: 'openai/gpt-image-1.5',
    quality: 'low',
    description: 'Premium images - ads, festivals, transforms, documents, posters',
    supportedSizes: ['portrait', 'landscape'],  // 1024x1536, 1536x1024
    resolutions: {
      portrait: { width: 1024, height: 1536 },   // 9:16 ratio
      landscape: { width: 1536, height: 1024 },  // 16:9 ratio
    },
  },
} as const;

// Legacy alias for backward compatibility
export const GPT_LOW_COST = 1.18;


// ==========================================
// 🎤 VOICE COSTS (INR)
// ==========================================

export const VOICE_COSTS = {
  onair: {
    perMinute: 1.42,
    displayName: 'OnAir Voice',
    description: 'High-quality voice synthesis',
  },
  camera: {
    perMinuteIndia: 5.04,
    perMinuteInternational: 5.02,
    displayName: 'Camera Vision',
    description: 'Real-time camera analysis',
  },
} as const;

// ==========================================
// 💵 MODEL COSTS (INR per 1M tokens @ 1:3 ratio)
// ==========================================

export const MODEL_COSTS_INR_PER_1M = {
  'mistral-large-latest': 113.2,
  'gemini-2.0-flash': 29.4,
  'devstral-medium-latest': 144.9,
} as const;

// ==========================================
// 🔀 LLM ROUTING CONFIG
// ==========================================

export const LLM_ROUTING_CONFIG = {
  [RoutingTier.SIMPLE]: {
    model: 'mistral-large-latest',
    provider: AIProvider.MISTRAL,
    displayName: 'Mistral Large 3',
    fallbackModel: 'gemini-2.0-flash',
  },
  [RoutingTier.CASUAL]: {
    model: 'gemini-2.0-flash',
    provider: AIProvider.GEMINI,
    displayName: 'Gemini 2.0 Flash',
    fallbackModel: 'mistral-large-latest',
  },
  [RoutingTier.MEDIUM]: {
    model: 'mistral-large-latest',
    provider: AIProvider.MISTRAL,
    displayName: 'Mistral Large 3',
    fallbackModel: 'gemini-2.0-flash',
  },
  [RoutingTier.COMPLEX]: {
    model: 'mistral-large-latest',
    provider: AIProvider.MISTRAL,
    displayName: 'Mistral Large 3',
    fallbackModel: 'gemini-2.0-flash',
  },
  [RoutingTier.EXPERT]: {
    model: 'mistral-large-latest',
    provider: AIProvider.MISTRAL,
    displayName: 'Mistral Large 3',
    fallbackModel: 'gemini-2.0-flash',
  },
} as const;

// ==========================================
// 💰 COST CALCULATION HELPERS
// ==========================================

function calculateModelCost(modelId: string, tokens: number): number {
  const costPer1M = MODEL_COSTS_INR_PER_1M[modelId as keyof typeof MODEL_COSTS_INR_PER_1M] || 0;
  return (tokens / 1_000_000) * costPer1M;
}

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

export const GATEWAY_FEE_PERCENTAGE = 2.36;
export const GATEWAY_FEE_STRIPE_PERCENTAGE = 2.9;
export const GATEWAY_FEE_STRIPE_FIXED_USD = 0.30;

export const INFRASTRUCTURE_COSTS = {
  starter: 5,
  paid: 20,
} as const;

// ==========================================
// 📅 YEARLY SUBSCRIPTION CONSTANTS
// ==========================================

export const YEARLY_TOKEN_MONTHS = 11;
export const YEARLY_PLATFORM_MONTHS = 12;
export const YEARLY_DISCOUNT_MARKETING = '2 Months FREE!';


// ==========================================
// 📋 INTERFACES & TYPE DEFINITIONS
// ==========================================

export interface AIModel {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  tier?: RoutingTier;
  percentage?: number;
  fallback?: boolean;
  monthlyCap?: number;
}

export interface TrialConfig {
  enabled: boolean;
  durationDays: number;
  description?: string;
}

export interface ImageRouting {
  human: 'schnell' | 'gptLow';
  nonHuman: 'schnell' | 'gptLow';
  text: 'schnell' | 'gptLow';
  deities: 'blocked' | 'schnell' | 'gptLow';
  logos?: 'schnell' | 'gptLow';
  posters?: 'schnell' | 'gptLow';
  cards?: 'schnell' | 'gptLow';
  styleTransfer?: 'schnell' | 'gptLow';
  cartoon?: 'schnell' | 'gptLow';
  anime?: 'schnell' | 'gptLow';
  transformation?: 'schnell' | 'gptLow';
  festivals?: 'schnell' | 'gptLow';
  ads?: 'schnell' | 'gptLow';
  documents?: 'schnell' | 'gptLow';
  default: 'schnell' | 'gptLow';
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
  tokensUnlockedInternational?: number;
  extraTokensInternational?: number;
  isExtraInternational?: boolean;
  validityHours?: number;
  validityHoursInternational?: number;
  activationWindow?: number;
  carryForward?: boolean;
  expiryLogic?: 'plan_renewal' | 'strict_expiry';
  wordsUnlocked: number;
  wordsUnlockedInternational?: number;
  bypassDailyLimit?: boolean;
  useMonthlyPool?: boolean;
  logic?: string;
  duration: number;
  maxPerDay?: number;
  maxPerPlanPeriod: number;
  resetOn: 'plan_renewal' | 'calendar' | 'daily';
  progressiveMultipliers?: number[];
  costs: {
    ai: number;
    buffer?: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
  costsInternational?: {
    ai: number;
    buffer?: number;
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
  mistralTokens: number;
  geminiTokens?: number;
  devstralTokens?: number; 
  totalTokens: number;
  totalTokensInternational?: number;
  gptLowImages: number;
  gptLowImagesInternational?: number;
  schnellImages?: number;
  schnellImagesInternational?: number;
  totalImages: number;
  totalImagesInternational?: number;
  voiceMinutesInternational?: number;
  dailyBoost: number;
  validity: number;
  validityInternational?: number;
  validityLogic?: string;
  distributionLogic: string;
  maxPerMonth: number;
  maxPerMonthInternational?: number;
  queueingAllowed: boolean;
  separatePool: boolean;
  costs: {
    ai: number;
    images?: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
  costsInternational?: {
    ai: number;
    images?: number;
    voice?: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
}

export interface DocAIBooster {
  type: 'DOC_AI';
  name: string;
  description: string;
  price: number;
  priceUSD: number;
  tokens: number;
  tokensInternational: number;
  validity: number;
  maxPerMonth: number;
  costs: {
    ai: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
  costsInternational: {
    ai: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
}

// 🖼️ IMAGE BOOSTER (V12.0 - 2 Models: Schnell + GPT LOW)
export interface ImageBooster {
  type: 'IMAGE';
  name: string;
  description: string;
  price: number;
  priceUSD: number;
  validity: number;
  maxPerMonth: number;
  images: {
    schnell: number;
    gptLow: number;
    total: number;
  };
  imagesInternational: {
    schnell: number;
    gptLow: number;
    total: number;
  };
  costs: {
    images: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
  costsInternational: {
    images: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
}

export interface ImageLimits {
  schnellImages: number;
  gptLowImages: number;
  totalImages: number;
  talkingPhotos: number;
  logoPreview: number;
  logoPurchase: number;
}

export interface UsageLimits {
  monthlyTokens: number;
  monthlyWords: number;
  dailyTokens: number;
  dailyWords: number;
  dailyMessageCap?: number;
  botResponseLimit: number;
  memoryDays: number;
  contextMemory: number;
  responseDelay: number;
  voiceMinutes: number;
  cameraMinutes: number;
  voiceTechnology?: VoiceTechnology;
  images: ImageLimits;
  flashFallbackTokens?: number;
  carryForward?: boolean;
  carryForwardPercent?: number;
  carryForwardMaxMonths?: number;
  talkingPhotosLimit?: number;
  promptTokenPool?: number;
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
  monthlyCredits?: number;
  monthlyCreditsInternational?: number;
  docAITokens?: number;
  docAITokensTrial?: number;
  docAITokensInternational?: number;
  docAITokensTrialInternational?: number;
  monthlyWords: number;
  maxWorkspaces: number;
  maxFileSizeMB?: number;
  featuresUnlocked?: number;
  model?: string;
  templatesCount?: number;
  templateCategories?: string[];
  modelPremium?: string;
  modelExpert?: string | { IN: string; INTL: string };
  exportFormats: string[];
  templates: boolean;
  versionHistory: number;
  collaboration: boolean;
  advancedFeatures?: AdvancedFeatures;
  modelPremiumCondition?: string;
}

export interface PlanCosts {
  aiCostPrimary: number;
  aiCostFallback: number;
  aiCostTotal: number;
  gptLowCost: number;
  schnellCost: number;
  imageCostTotal: number;
  voiceCost: number;
  cameraCost: number;
  gatewayCost: number;
  infraCostPerUser: number;
  totalCost: number;
  revenue: number;
  profit: number;
  margin: number;
}

export interface Plan {
  id: PlanType;
  name: string;
  displayName: string;
  displayNameFrontend?: string;
  aiModelsInternational?: AIModel[];
  tagline: string;
  description: string;
  price: number;
  priceUSD?: number;
  priceYearly?: number;
  priceYearlyUSD?: number;
  yearlyDiscount?: number;
  yearlyDiscountInternational?: number;
  enabled: boolean;
  popular?: boolean;
  hero?: boolean;
  order: number;
  personality: string;
  
  // 🎁 TRIAL SYSTEM
  trial?: TrialConfig;
  limitsTrial?: UsageLimits;
  limitsTrialInternational?: UsageLimits;
  costsTrial?: PlanCosts;
  costsTrialInternational?: PlanCosts;
  
  limits: UsageLimits;
  limitsInternational?: UsageLimits;
  limitsYearly?: UsageLimits;
  limitsYearlyInternational?: UsageLimits;
  bonusTokens: number;
  bonusLimits?: BonusLimits;
  aiModels: AIModel[];
  routing?: Record<string, number>;
  routingYearly?: Record<string, number>;
  fallbackModel?: string;
  fallbackTokens?: number;
  routingInternational?: Record<string, number>;
  routingInternationalYearly?: Record<string, number>;
  premiumCap?: {
    fallbackModel: string;
    safeThreshold: number;
  };
  orchestration?: {
    enabled: boolean;
    multiDomainChain: { IN: string[]; INTL: string[] };
    creativeChain: { IN: string[]; INTL: string[] };
    creativeChainProbability: number;
  };
  
  // 🖼️ IMAGE ROUTING
  imageRouting?: ImageRouting;
  
  isHybrid: boolean;
  hasSmartRouting: boolean;
  hasDynamicDailyLimits: boolean;
  tokenExpiryEnabled: boolean;
  hasIntentBasedRouting?: boolean;
  hasPremiumCap?: boolean;
  hasIntentGuard?: boolean;
  intentGuardLevel?: 'starter' | 'plus' | 'pro';
  hasMultiModelOrchestration?: boolean;
  hasCreativeChaining?: boolean;
  cooldownBooster?: CooldownBooster;
  addonBooster?: AddonBooster;
  docAIBooster?: DocAIBooster;
  imageBooster?: ImageBooster;
  documentation?: DocumentIntelligence;
  features: {
    studio: boolean;
    documentIntelligence: boolean;
    fileUpload: boolean;
    prioritySupport: boolean;
    smartRouting: boolean;
    multiModel: boolean;
    voice?: boolean;
    camera?: boolean;
    intentBasedRouting?: boolean;
    premiumCap?: boolean;
    intentGuard?: boolean;
    multiModelOrchestration?: boolean;
    creativeChaining?: boolean;
  };
  costs: PlanCosts;
  costsInternational?: PlanCosts;
  paymentGateway?: {
    cashfree?: string;
    razorpay?: string;
    razorpayYearly?: string;
    stripe?: string;
    stripeYearly?: string;
  };
}


// ==========================================
// 📊 PLANS STATIC CONFIGURATION
// ==========================================

export const PLANS_STATIC_CONFIG: Record<PlanType, Plan> = {

  // ==========================================
  // 🌟 STARTER PLAN (FREE)
  // ==========================================
  // ==========================================
  // 🌟 STARTER PLAN (FREE 3 MONTHS → ₹99/$2.99)
  // ==========================================
 // ==========================================
  // 🌟 STARTER PLAN (FREE 3 MONTHS → ₹99/$2.99)
  // ==========================================
  // Updated: January 29, 2026
  // FREE Trial: 3 months, 2.5L tokens, 4 Schnell
  // PAID India: ₹99/month, 4.5L tokens, 40 Schnell
  // PAID Intl: $2.99/month, 10L tokens, 80 Schnell
  // ==========================================
  [PlanType.STARTER]: {
    id: PlanType.STARTER,
    name: 'starter',
    displayName: 'Soriva Starter',
    displayNameFrontend: 'Soriva Starter',
    tagline: '3 months FREE, then just ₹149/month',
    description: 'Your everyday AI companion with generous limits',
    price: 149,
    priceUSD: 3.99,
    enabled: true,
    order: 1,
    personality: 'Friendly, casual, quick helper',
    bonusTokens: 0,

    // 🎁 TRIAL CONFIG
    trial: {
      enabled: true,
      durationDays: 90,
      description: '3 months FREE trial',
    },

    // 🆓 FREE TRIAL LIMITS - INDIA
    limitsTrial: {
      monthlyTokens: 350000,
      promptTokenPool: 150000,
      monthlyWords: 233333,
      dailyTokens: 11667,
      dailyWords: 7778,
      botResponseLimit: 4096,
      memoryDays: 3,
      contextMemory: 5,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 4,
        gptLowImages: 0,
        totalImages: 4,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 🆓 FREE TRIAL LIMITS - INTERNATIONAL
    limitsTrialInternational: {
      monthlyTokens: 350000,
      promptTokenPool: 150000,
      monthlyWords: 233333,
      dailyTokens: 11667,
      dailyWords: 7778,
      botResponseLimit: 4096,
      memoryDays: 3,
      contextMemory: 5,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 4,
        gptLowImages: 0,
        totalImages: 4,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 💰 PAID LIMITS - INDIA (₹149/month)
    // v12.0: Old GPT Medium (5 × ₹2.86 = ₹14.30) + Banana (5 × ₹3.26 = ₹16.30) = ₹30.60
    // New: ₹30.60 ÷ ₹1.18 = 26 GPT LOW images
    limits: {
      monthlyTokens: 630000,
      promptTokenPool: 300000,
      monthlyWords: 420000,
      dailyTokens: 21000,
      dailyWords: 14000,
      botResponseLimit: 4096,
      memoryDays: 3,
      contextMemory: 5,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 19,
        gptLowImages: 26,
        totalImages: 45,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 💰 PAID LIMITS - INTERNATIONAL ($3.99/month)
    // v12.0: Old GPT Medium (10 × ₹2.86 = ₹28.60) + Banana (10 × ₹3.26 = ₹32.60) = ₹61.20
    // New: ₹61.20 ÷ ₹1.18 = 52 GPT LOW images
    limitsInternational: {
      monthlyTokens: 1400000,
      promptTokenPool: 700000,
      monthlyWords: 933333,
      dailyTokens: 46667,
      dailyWords: 31111,
      botResponseLimit: 4096,
      memoryDays: 3,
      contextMemory: 5,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 38,
        gptLowImages: 52,
        totalImages: 90,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 🤖 AI MODELS
    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-latest',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 50,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 50,
      },
    ],

    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-latest',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 50,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 50,
      },
    ],

    routing: { 'mistral-large-latest': 0.5, 'gemini-2.0-flash': 0.5 },
    routingInternational: { 'mistral-large-latest': 0.5, 'gemini-2.0-flash': 0.5 },
    fallbackModel: undefined,
    fallbackTokens: 0,

    isHybrid: false,
    hasSmartRouting: false,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,
    hasIntentGuard: true,
    intentGuardLevel: 'starter',

    // 🖼️ IMAGE ROUTING (v12.0 - 2 Models)
    imageRouting: {
      human: 'schnell',
      nonHuman: 'schnell',
      text: 'gptLow',
      deities: 'blocked',
      festivals: 'gptLow',
      ads: 'gptLow',
      posters: 'gptLow',
      transformation: 'gptLow',
      documents: 'gptLow',
      default: 'schnell',
    },

    // ⚡ COOLDOWN BOOSTER (INDIA ONLY - PAID ONLY)
    // International mein cooldown nahi hai
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Daily Unlock',
      description: 'Aaj ki limit khatam? Daily cap unlock karo.',
      price: 19,
      priceUSD: 0,                // Not available internationally
      tokensUnlocked: 15000,
      tokensUnlockedInternational: 0,
      wordsUnlocked: 10000,
      wordsUnlockedInternational: 0,
      duration: 0,
      validityHours: 24,
      validityHoursInternational: 0,
      activationWindow: 24,
      maxPerDay: 1,
      maxPerPlanPeriod: 5,
      resetOn: 'calendar',
      bypassDailyLimit: true,
      useMonthlyPool: false,
      carryForward: false,
      expiryLogic: 'strict_expiry',
      logic: 'Unlocks daily cap. India PAID only.',
      costs: {
        ai: 0,
        gateway: 0.45,
        total: 0.45,
        profit: 18.55,
        margin: 97.6,
      },
      costsInternational: {
        ai: 0,
        gateway: 0,
        total: 0,
        profit: 0,
        margin: 0,
      },
    },

    // 📦 ADDON BOOSTER (BOTH INDIA & INTERNATIONAL)
    // Available in FREE trial and PAID both
    addonBooster: {
      type: 'ADDON',
      name: 'Starter Boost',
      description: 'Extra tokens for the week - no daily cap!',
      price: 49,
      priceUSD: 1.99,
      mistralTokens: 200000,
      totalTokens: 200000,
      totalTokensInternational: 500000,
      gptLowImages: 0,
      gptLowImagesInternational: 0,
      schnellImages: 20,
      schnellImagesInternational: 40,
      totalImages: 20,
      totalImagesInternational: 40,
      dailyBoost: 0,              // No daily cap - use all at once if wanted
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted, no daily cap',
      distributionLogic: 'Separate pool, no daily cap while active',
      maxPerMonth: 5,
      maxPerMonthInternational: 5,
      queueingAllowed: false,
      separatePool: true,
      costs: {
        ai: 20.92,
        images: 5.00,
        gateway: 1.16,
        total: 27.08,
        profit: 21.92,
        margin: 44.7,
      },
      costsInternational: {
        ai: 52.30,
        images: 10.00,
        gateway: 5.10,
        total: 67.40,
        profit: 99.13,
        margin: 59.5,
      },
    },

    // 🔥 DOC AI BOOSTER (₹99 / $2.99)
    docAIBooster: {
      type: 'DOC_AI',
      name: 'Doc AI Boost',
      description: '750K extra tokens for document AI',
      price: 99,
      priceUSD: 2.99,
      tokens: 750000,
      tokensInternational: 1500000,
      validity: 30,
      maxPerMonth: 5,
      costs: {
        ai: 44,
        gateway: 2.34,
        total: 46.34,
        profit: 52.66,
        margin: 53.2,
      },
      costsInternational: {
        ai: 88,
        gateway: 7.56,
        total: 95.56,
        profit: 154.77,
        margin: 61.8,
      },
    },

    // 🖼️ IMAGE BOOSTER (₹99 / $2.99) - V12.0 (2 Models: Schnell + GPT LOW)
    // Old cost: 6.25 + 28.60 + 32.60 = ₹67.45
    // New: Keep same budget, convert to GPT LOW
    // Schnell: 25 × ₹0.25 = ₹6.25
    // GPT LOW: ₹61.20 ÷ ₹1.18 = 52 images
    imageBooster: {
      type: 'IMAGE',
      name: 'Image Boost Pack',
      description: 'Premium image generation credits',
      price: 99,
      priceUSD: 2.99,
      validity: 30,
      maxPerMonth: 10,
      images: {
        schnell: 25,           // ₹0.25 × 25 = ₹6.25
        gptLow: 52,            // ₹1.18 × 52 = ₹61.36
        total: 77,
      },
      imagesInternational: {
        schnell: 50,           // ₹0.25 × 50 = ₹12.50
        gptLow: 104,           // ₹1.18 × 104 = ₹122.72
        total: 154,
      },
      costs: {
        images: 67.61,         // 6.25 + 61.36
        gateway: 2.34,
        total: 69.95,
        profit: 29.05,
        margin: 29.3,
      },
      costsInternational: {
        images: 135.22,        // 12.50 + 122.72
        gateway: 11.13,
        total: 146.35,
        profit: 125.05,
        margin: 46.1,
      },
    },

    // 📄 DOCUMENTATION (Enabled - Taste)
    documentation: {
      enabled: true,
      tier: 'starter' as DocumentIntelligenceTier,
      displayName: 'Smart Docs Starter',
      badge: '📄',
      tagline: 'Try document AI features',
      monthlyCredits: 0,
      monthlyCreditsInternational: 0,
      docAITokens: 100000,
      docAITokensTrial: 25000,
      docAITokensInternational: 200000,
      docAITokensTrialInternational: 25000,
      monthlyWords: 0,
      maxWorkspaces: 1,
      maxFileSizeMB: 10,
      featuresUnlocked: 5,
      model: 'mistral-large-latest',
      exportFormats: ['pdf', 'markdown'],
      templates: false,
      templatesCount: 0,
      versionHistory: 0,
      collaboration: false,
    },

    // ✨ FEATURES
    features: {
      studio: false,
      documentIntelligence: true,
      fileUpload: false,
      prioritySupport: false,
      smartRouting: false,
      multiModel: false,
      voice: false,
      camera: false,
      intentGuard: true,
    },

    // 💰 COSTS - FREE TRIAL (India)
    costsTrial: {
      aiCostPrimary: 29.30,
      aiCostFallback: 0,
      aiCostTotal: 29.30,
      gptLowCost: 0,
      schnellCost: 1.00,
      imageCostTotal: 1.00,
      voiceCost: 0,
      cameraCost: 0,
      gatewayCost: 0,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      totalCost: 35.30,
      revenue: 0,
      profit: -35.30,
      margin: -100,
    },

    // 💰 COSTS - FREE TRIAL (International)
    costsTrialInternational: {
      aiCostPrimary: 29.30,
      aiCostFallback: 0,
      aiCostTotal: 29.30,
      gptLowCost: 0,
      schnellCost: 1.00,
      imageCostTotal: 1.00,
      voiceCost: 0,
      cameraCost: 0,
      gatewayCost: 0,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      totalCost: 35.30,
      revenue: 0,
      profit: -35.30,
      margin: -100,
    },

    // 💰 COSTS - PAID INDIA (₹149/month)
    // v12.0: Schnell 19 × ₹0.25 = ₹4.75, GPT LOW 26 × ₹1.18 = ₹30.68
    costs: {
      aiCostPrimary: 52.73,
      aiCostFallback: 0,
      aiCostTotal: 52.73,
      gptLowCost: 30.68,
      schnellCost: 4.75,
      imageCostTotal: 35.43,
      voiceCost: 0,
      cameraCost: 0,
      gatewayCost: 3.52,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      totalCost: 96.68,
      revenue: 149,
      profit: 52.32,
      margin: 35.1,
    },

    // 💰 COSTS - PAID INTERNATIONAL ($3.99/month)
    // v12.0: Schnell 38 × ₹0.25 = ₹9.50, GPT LOW 52 × ₹1.18 = ₹61.36
    costsInternational: {
      aiCostPrimary: 117.19,
      aiCostFallback: 0,
      aiCostTotal: 117.19,
      gptLowCost: 61.36,
      schnellCost: 9.50,
      imageCostTotal: 70.86,
      voiceCost: 0,
      cameraCost: 0,
      gatewayCost: 10.47,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      totalCost: 203.52,
      revenue: 362.47,
      profit: 158.95,
      margin: 43.9,
    },

    // 💳 PAYMENT GATEWAY
    paymentGateway: {
      razorpay: 'plan_starter_monthly',
      stripe: 'price_starter_monthly_usd',
    },
  },
  // ==========================================
// ==========================================
  // 💡 LITE PLAN (₹299 / $7.99)
  // ==========================================
  // Updated: February 23, 2026
  // India: ₹299, 2M tokens, 100 images (50 Schnell + 50 GPT LOW), Margin: 29.5%
  // Intl: $7.99, 5.5M tokens, 200 images (100 Schnell + 100 GPT LOW), Margin: 27.6%
  // LLM Ratio: Mistral 50% + Gemini 35% + Devstral 15%
  // ==========================================
  [PlanType.LITE]: {
    id: PlanType.LITE,
    name: 'lite',
    displayName: 'Soriva Lite',
    displayNameFrontend: 'Soriva Lite',
    tagline: 'Affordable AI with premium images.',
    description: 'Best value AI with GPT LOW images for daily use',
    price: 299,
    priceUSD: 7.99,
    priceYearly: 2990,
    priceYearlyUSD: 79.90,
    yearlyDiscount: 17,
    yearlyDiscountInternational: 17,
    enabled: true,
    order: 2,
    personality: 'Friendly, helpful, efficient',
    bonusTokens: 0,

    // 💰 PAID LIMITS - INDIA (₹299/month)
    // Token Cost: Mistral 1M (₹104.6) + Gemini 700K (₹19.04) + Devstral 300K (₹15.69) = ₹139.33
    // Image Cost: 50 Schnell (₹12.50) + 50 GPT LOW (₹59) = ₹71.50
    // Total Cost: ₹210.83 | Margin: 29.5%
    limits: {
      monthlyTokens: 2000000,
      promptTokenPool: 1000000,
      monthlyWords: 1333333,
      dailyTokens: 66667,
      dailyWords: 44444,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 50,
        gptLowImages: 50,
        totalImages: 100,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 💰 PAID LIMITS - INTERNATIONAL ($7.99/month)
    // Token Cost: Mistral 2.75M (₹287.65) + Gemini 1.925M (₹52.36) + Devstral 825K (₹43.15) = ₹383.16
    // Image Cost: 100 Schnell (₹25) + 100 GPT LOW (₹118) = ₹143
    // Total Cost: ₹526.16 | Revenue: ₹727 | Margin: 27.6%
    limitsInternational: {
      monthlyTokens: 5500000,
      promptTokenPool: 2750000,
      monthlyWords: 3666667,
      dailyTokens: 183333,
      dailyWords: 122222,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 100,
        gptLowImages: 100,
        totalImages: 200,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 📅 YEARLY LIMITS - INDIA (₹2,990/year - 10 months price, 12 months access)
    limitsYearly: {
      monthlyTokens: 2000000,
      promptTokenPool: 1000000,
      monthlyWords: 1333333,
      dailyTokens: 66667,
      dailyWords: 44444,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 50,
        gptLowImages: 50,
        totalImages: 100,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 1,
    },

    // 📅 YEARLY LIMITS - INTERNATIONAL ($79.90/year - 10 months price, 12 months access)
    limitsYearlyInternational: {
      monthlyTokens: 5500000,
      promptTokenPool: 2750000,
      monthlyWords: 3666667,
      dailyTokens: 183333,
      dailyWords: 122222,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 100,
        gptLowImages: 100,
        totalImages: 200,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 1,
    },

    // 🤖 AI MODELS
    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-latest',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 50,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 50,
      },
    ],

    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-latest',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 50,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 50,
      },
    ],

    routing: { 'mistral-large-latest': 0.5, 'gemini-2.0-flash': 0.5 },
    routingYearly: { 'mistral-large-latest': 0.5, 'gemini-2.0-flash': 0.5 },
    routingInternational: { 'mistral-large-latest': 0.5, 'gemini-2.0-flash': 0.5 },
    routingInternationalYearly: { 'mistral-large-latest': 0.5, 'gemini-2.0-flash': 0.5 },
    fallbackModel: undefined,
    fallbackTokens: 0,

    isHybrid: false,
    hasSmartRouting: false,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,

    // 🖼️ IMAGE ROUTING
    imageRouting: {
      human: 'schnell',
      nonHuman: 'schnell',
      text: 'gptLow',
      deities: 'blocked',
      logos: 'gptLow',
      posters: 'gptLow',
      cards: 'gptLow',
      styleTransfer: 'gptLow',
      cartoon: 'gptLow',
      anime: 'gptLow',
      default: 'schnell',
    },

    // ⚡ COOLDOWN BOOSTER (₹25 / $0.99)
    // 2x daily limit, deducted from monthly pool
    // India: 133,334 tokens (2x of 66,667 daily)
    // Intl: 366,666 tokens (2x of 183,333 daily)
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Daily Unlock',
      description: 'Aaj ki limit khatam? Daily cap unlock karo.',
      price: 25,
      priceUSD: 0.99,
      tokensUnlocked: 133334,
      tokensUnlockedInternational: 366666,
      wordsUnlocked: 88889,
      wordsUnlockedInternational: 244444,
      duration: 0,
      validityHours: 24,
      validityHoursInternational: 24,
      activationWindow: 24,
      maxPerDay: 1,
      maxPerPlanPeriod: 5,
      resetOn: 'calendar',
      bypassDailyLimit: true,
      useMonthlyPool: true,
      carryForward: false,
      expiryLogic: 'strict_expiry',
      logic: 'Unlocks 2x daily limit for 24 hours, deducted from monthly pool.',
      costs: {
        ai: 0,
        gateway: 0.59,
        total: 0.59,
        profit: 24.41,
        margin: 97.6,
      },
      costsInternational: {
        ai: 0,
        gateway: 2.49,
        total: 2.49,
        profit: 80.37,
        margin: 97.0,
      },
    },

    // 📦 ADDON BOOSTER (₹99 / $2.49)
    // India: 1M tokens + 20 images (15 Schnell + 5 GPT LOW), Margin: 17.5%
    // Intl: 1.5M tokens + 50 images (40 Schnell + 10 GPT LOW), Margin: 36.3%
    addonBooster: {
      type: 'ADDON',
      name: 'Lite Boost',
      description: 'Extra tokens + images for the week!',
      price: 99,
      priceUSD: 2.49,
      mistralTokens: 500000,
      totalTokens: 1000000,
      totalTokensInternational: 1500000,
      gptLowImages: 5,
      gptLowImagesInternational: 10,
      schnellImages: 15,
      schnellImagesInternational: 40,
      totalImages: 20,
      totalImagesInternational: 50,
      dailyBoost: 0,
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted, no daily cap',
      distributionLogic: 'Separate pool, no daily cap while active',
      maxPerMonth: 5,
      maxPerMonthInternational: 5,
      queueingAllowed: false,
      separatePool: true,
      costs: {
        ai: 69.67,
        images: 9.65,
        gateway: 2.34,
        total: 81.66,
        profit: 17.34,
        margin: 17.5,
      },
      costsInternational: {
        ai: 104.50,
        images: 21.80,
        gateway: 6.24,
        total: 132.54,
        profit: 75.46,
        margin: 36.3,
      },
    },

    // 🔥 DOC AI BOOSTER (₹39 / $1) - Gemini Flash 2.0
    // Plan includes 1M IN / 2M INTL Doc AI tokens
    // This booster adds extra 750K/1.5M tokens if needed
    docAIBooster: {
      type: 'DOC_AI',
      name: 'Doc AI Boost',
      description: 'Extra 750K tokens for document AI',
      price: 39,
      priceUSD: 1,
      tokens: 750000,
      tokensInternational: 1500000,
      validity: 30,
      maxPerMonth: 5,
      costs: {
        ai: 11.95,
        gateway: 0.92,
        total: 12.87,
        profit: 26.13,
        margin: 67.0,
      },
      costsInternational: {
        ai: 23.90,
        gateway: 2.73,
        total: 26.63,
        profit: 64.37,
        margin: 70.7,
      },
    },

    // 🖼️ IMAGE BOOSTER - DISABLED for LITE
    // Plan already includes 100 IN / 200 INTL images
    // Heavy users should upgrade to PLUS
    imageBooster: {
      type: 'IMAGE',
      name: 'Image Boost Pack',
      description: 'Not available - upgrade to PLUS for more images',
      price: 0,
      priceUSD: 0,
      validity: 0,
      maxPerMonth: 0,
      images: {
        schnell: 0,
        gptLow: 0,
        total: 0,
      },
      imagesInternational: {
        schnell: 0,
        gptLow: 0,
        total: 0,
      },
      costs: {
        images: 0,
        gateway: 0,
        total: 0,
        profit: 0,
        margin: 0,
      },
      costsInternational: {
        images: 0,
        gateway: 0,
        total: 0,
        profit: 0,
        margin: 0,
      },
    },

    // 📄 DOCUMENTATION (Gemini Flash 2.0)
    // India: 1M tokens/month (₹15.93 max cost)
    // Intl: 2M tokens/month (₹31.86 max cost)
    documentation: {
      enabled: true,
      tier: 'starter' as DocumentIntelligenceTier,
      displayName: 'Smart Docs Lite',
      badge: '📄',
      tagline: 'Basic document tools',
      monthlyCredits: 0,
      monthlyCreditsInternational: 0,
      docAITokens: 1000000,
      docAITokensInternational: 2000000,
      monthlyWords: 0,
      maxWorkspaces: 2,
      maxFileSizeMB: 15,
      featuresUnlocked: 8,
      model: 'gemini-2.0-flash',
      exportFormats: ['pdf', 'markdown'],
      templates: true,
      templatesCount: 12,
      versionHistory: 3,
      collaboration: false,
    },

    // ✨ FEATURES
    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: false,
      smartRouting: false,
      multiModel: false,
      voice: false,
      camera: false,
    },

    // 💰 COSTS - INDIA (₹199/month)
    costs: {
      aiCostPrimary: 73.22,
      aiCostFallback: 0,
      aiCostTotal: 73.22,
      gptLowCost: 18.90,
      schnellCost: 12.50,
      imageCostTotal: 31.40,
      voiceCost: 0,
      cameraCost: 0,
      gatewayCost: 4.70,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 129.32,
      revenue: 199,
      profit: 69.68,
      margin: 35.0,
    },

    // 💰 COSTS - INTERNATIONAL ($4.99/month)
    costsInternational: {
      aiCostPrimary: 146.44,
      aiCostFallback: 0,
      aiCostTotal: 146.44,
      gptLowCost: 37.80,
      schnellCost: 25.00,
      imageCostTotal: 62.80,
      voiceCost: 0,
      cameraCost: 0,
      gatewayCost: 37.11,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 266.35,
      revenue: 417.66,
      profit: 151.31,
      margin: 36.2,
    },

    // 💳 PAYMENT GATEWAY
    paymentGateway: {
      razorpay: 'plan_lite_monthly',
      razorpayYearly: 'plan_lite_yearly',
      stripe: 'price_lite_monthly_usd',
      stripeYearly: 'price_lite_yearly_usd',
    },
  },
  // ==========================================
  // ⚡ PLUS PLAN (₹299 / $9.99)
  // ==========================================
 // ==========================================
  // ⭐ PLUS PLAN (₹349 / $9.99)
  // ==========================================
  // Updated: January 29, 2026
  // India: ₹349, 15L tokens, 80 images, 10 min voice
  // Intl: $9.99, 20L tokens, 130 images, 25 min voice, 5 min camera
  // ==========================================
  // ==========================================
  // ⭐ PLUS PLAN (₹349 / $9.99)
  // ==========================================
  // Updated: January 29, 2026
  // India: ₹349, 15L tokens, 80 images, 10 min voice
  // Intl: $9.99, 20L tokens, 130 images, 25 min voice, 5 min camera
  // ==========================================
// ==========================================
  // ⭐ PLUS PLAN (₹399 / $9.99)
  // ==========================================
  // Updated: February 15, 2026
  // India: ₹399, 21L tokens, 75 images, 15 min voice (65/35 Mistral/Gemini)
  // Intl: $9.99, 40L tokens, 150 images, 25 min voice (55/35/10 Mistral/Gemini/Devstral)
  // ==========================================
  [PlanType.PLUS]: {
    id: PlanType.PLUS,
    name: 'plus',
    displayName: 'Soriva Plus',
    displayNameFrontend: 'Soriva Plus',
    tagline: 'Smart AI for everyday brilliance.',
    description: 'Premium AI with voice, images, and intelligent assistance',
    price: 599,
    priceUSD: 14.99,
    priceYearly: 5990,
    priceYearlyUSD: 149.90,
    yearlyDiscount: 17,
    yearlyDiscountInternational: 17,
    enabled: true,
    popular: true,
    hero: true,
    order: 3,
    personality: 'Patient, structured, concept-first, encourages thinking',
    bonusTokens: 50000,

    // 💰 PAID LIMITS - INDIA (₹599/month)
    // Tokens: 3M (65% Mistral + 35% Gemini)
    // Images: 180 (100 GPT LOW + 80 Schnell)
    // Voice: 25 min (Gemini Audio @ ₹1.02/min)
    // Margin: 24.7%
    limits: {
      monthlyTokens: 3000000,
      promptTokenPool: 1500000,
      monthlyWords: 2000000,
      dailyTokens: 100000,
      dailyWords: 66667,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 25,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 80,
        gptLowImages: 100,
        totalImages: 180,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 📅 YEARLY LIMITS - INDIA (₹5990/year)
    // Same as monthly, with carryForward
    limitsYearly: {
      monthlyTokens: 3000000,
      promptTokenPool: 1500000,
      monthlyWords: 2000000,
      dailyTokens: 100000,
      dailyWords: 66667,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 25,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 80,
        gptLowImages: 100,
        totalImages: 180,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 1,
    },

    // 💰 PAID LIMITS - INTERNATIONAL ($14.99/month)
    // Tokens: 7M (65% Mistral + 35% Gemini)
    // Images: 310 (175 GPT LOW + 135 Schnell)
    // Voice: 55 min (Gemini Audio @ ₹1.02/min)
    // Margin: 30.7%
    limitsInternational: {
      monthlyTokens: 7000000,
      promptTokenPool: 3500000,
      monthlyWords: 4666667,
      dailyTokens: 233333,
      dailyWords: 155556,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 55,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 135,
        gptLowImages: 175,
        totalImages: 310,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 📅 YEARLY LIMITS - INTERNATIONAL ($149.90/year)
    // Same as monthly, with carryForward
    limitsYearlyInternational: {
      monthlyTokens: 7000000,
      promptTokenPool: 3500000,
      monthlyWords: 4666667,
      dailyTokens: 233333,
      dailyWords: 155556,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 55,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 135,
        gptLowImages: 175,
        totalImages: 310,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 1,
    },

    // 🤖 AI MODELS - INDIA (65% Mistral + 35% Gemini)
    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-latest',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 65,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 35,
      },
    ],

    // 🤖 AI MODELS - INTERNATIONAL - ✅ UPDATED (Haiku removed, Devstral added)
    // Devstral shares same token pool - used for coding queries
    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-latest',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 55,              // ✅ 39% → 55%
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 35,              // ✅ 39% → 35%
      },
      {
        provider: AIProvider.MISTRAL,
        modelId: 'devstral-medium-latest',
        displayName: 'Devstral (Coding)',
        tier: RoutingTier.CODING,
        percentage: 10,
      },
    ],

    routing: { 'mistral-large-latest': 0.65, 'gemini-2.0-flash': 0.35 },
    routingYearly: { 'mistral-large-latest': 0.65, 'gemini-2.0-flash': 0.35 },
    routingInternational: { 'mistral-large-latest': 0.55, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.10 },
    routingInternationalYearly: { 'mistral-large-latest': 0.55, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.10 },
    fallbackModel: 'gemini-2.0-flash',
    fallbackTokens: 500000,

    isHybrid: false,
    hasSmartRouting: false,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,

    // 🖼️ IMAGE ROUTING
    imageRouting: {
      human: 'schnell',
      nonHuman: 'schnell',
      text: 'gptLow',
      deities: 'blocked',
      logos: 'gptLow',
      posters: 'gptLow',
      cards: 'gptLow',
      styleTransfer: 'gptLow',
      cartoon: 'gptLow',
      anime: 'gptLow',
      default: 'schnell',
    },
// ⚡ COOLDOWN BOOSTER (₹35 / $1.49)
    // 2x daily limit, deducted from monthly pool
    // India: 200,000 tokens (2x of 100,000 daily)
    // Intl: 466,666 tokens (2x of 233,333 daily)
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Daily Unlock',
      description: 'Aaj ki limit khatam? Daily cap unlock karo.',
      price: 35,
      priceUSD: 1.49,
      tokensUnlocked: 200000,
      tokensUnlockedInternational: 466666,
      wordsUnlocked: 133333,
      wordsUnlockedInternational: 311111,
      duration: 0,
      validityHours: 24,
      validityHoursInternational: 24,
      activationWindow: 24,
      maxPerDay: 1,
      maxPerPlanPeriod: 5,
      resetOn: 'calendar',
      bypassDailyLimit: true,
      useMonthlyPool: true,
      carryForward: false,
      expiryLogic: 'strict_expiry',
      logic: 'Unlocks 2x daily limit for 24 hours, deducted from monthly pool.',
      costs: {
        ai: 0,
        gateway: 0.84,
        total: 0.84,
        profit: 34.16,
        margin: 97.6,
      },
      costsInternational: {
        ai: 0,
        gateway: 4.47,
        total: 4.47,
        profit: 131.09,
        margin: 96.7,
      },
    },

    // 📦 ADDON BOOSTER (₹199 / $4.99)
    // India: 1.5M tokens + 30 images | Intl: 3.5M tokens + 70 images
    // Routing: 65% Mistral + 35% Gemini (same as plan)
    // Margin: 26.1% IN / 23.1% INTL
    addonBooster: {
      type: 'ADDON',
      name: 'Plus Boost',
      description: 'Extra tokens + images for the week!',
      price: 199,
      priceUSD: 4.99,
      mistralTokens: 975000,
      geminiTokens: 525000,
      devstralTokens: 0,
      totalTokens: 1500000,
      totalTokensInternational: 3500000,
      gptLowImages: 20,
      gptLowImagesInternational: 50,
      schnellImages: 10,
      schnellImagesInternational: 20,
      totalImages: 30,
      totalImagesInternational: 70,
      dailyBoost: 0,
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted, no daily cap',
      distributionLogic: 'Separate pool, same routing as plan (65/35)',
      maxPerMonth: 5,
      maxPerMonthInternational: 5,
      queueingAllowed: true,
      separatePool: true,
      costs: {
        ai: 116.28,
        images: 26.10,
        gateway: 4.78,
        total: 147.16,
        profit: 51.84,
        margin: 26.1,
      },
      costsInternational: {
        ai: 271.32,
        images: 64.00,
        gateway: 13.62,
        total: 348.94,
        profit: 105.06,
        margin: 23.1,
      },
    },

    // 🔥 DOC AI BOOSTER (₹49 / $1.49) - Gemini Flash 2.0
    // India: 1M tokens | Intl: 2.25M tokens
    // Margin: 65.1% IN / 70.6% INTL
    docAIBooster: {
      type: 'DOC_AI',
      name: 'Doc AI Boost',
      description: 'Extra 1M tokens for document AI',
      price: 49,
      priceUSD: 1.49,
      tokens: 1000000,
      tokensInternational: 2250000,
      validity: 30,
      maxPerMonth: 5,
      costs: {
        ai: 15.93,
        gateway: 1.18,
        total: 17.11,
        profit: 31.89,
        margin: 65.1,
      },
      costsInternational: {
        ai: 35.84,
        gateway: 4.08,
        total: 39.92,
        profit: 96.08,
        margin: 70.6,
      },
    },

    // 🖼️ IMAGE BOOSTER - DISABLED for PLUS
    // Plan already includes 180 IN / 310 INTL images
    // Heavy users should upgrade to PRO
    imageBooster: {
      type: 'IMAGE',
      name: 'Image Boost Pack',
      description: 'Not available - upgrade to PRO for more images',
      price: 0,
      priceUSD: 0,
      validity: 0,
      maxPerMonth: 0,
      images: {
        schnell: 0,
        gptLow: 0,
        total: 0,
      },
      imagesInternational: {
        schnell: 0,
        gptLow: 0,
        total: 0,
      },
      costs: {
        images: 0,
        gateway: 0,
        total: 0,
        profit: 0,
        margin: 0,
      },
      costsInternational: {
        images: 0,
        gateway: 0,
        total: 0,
        profit: 0,
        margin: 0,
      },
    },
    // 📄 DOCUMENTATION (Gemini Flash 2.0)
    // India: 1M tokens/month (₹15.93 max cost)
    // Intl: 2.25M tokens/month (₹35.84 max cost)
    documentation: {
      enabled: true,
      tier: 'standard' as DocumentIntelligenceTier,
      displayName: 'Smart Docs Plus',
      badge: '📄',
      tagline: 'Enhanced document tools',
      monthlyCredits: 0,
      monthlyCreditsInternational: 0,
      docAITokens: 1000000,
      docAITokensInternational: 2250000,
      monthlyWords: 0,
      maxWorkspaces: 5,
      maxFileSizeMB: 25,
      featuresUnlocked: 10,
      model: 'gemini-2.0-flash',
      exportFormats: ['pdf', 'markdown', 'docx'],
      templates: true,
      templatesCount: 15,
      versionHistory: 5,
      collaboration: false,
    },

    // ✨ FEATURES
    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: false,
      smartRouting: false,
      multiModel: true,
      voice: true,
      camera: false,
    },

    // 💰 COSTS - INDIA (₹399/month)
    costs: {
      aiCostPrimary: 156.90,
      aiCostFallback: 13.60,
      aiCostTotal: 170.50,
      gptLowCost: 25.20,
      schnellCost: 15.00,
      imageCostTotal: 40.20,
      voiceCost: 14.20,
      cameraCost: 0,
      gatewayCost: 8.24,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 253.14,
      revenue: 349,
      profit: 95.86,
      margin: 27.5,
    },
  
    // 💰 COSTS - INTERNATIONAL ($9.99/month) - ✅ UPDATED
    // AI: 40L tokens (Mistral 55% + Gemini 35% + Devstral 10%)
    // Haiku removed, Devstral added for coding
    costsInternational: {
      aiCostPrimary: 335.40,        // Mistral 22L (₹230.12) + Gemini 14L (₹38.08) + Devstral 4L (₹67.20)
      aiCostFallback: 0,
      aiCostTotal: 335.40,
      gptLowCost: 18.90,           // 15 images × ₹1.26
      schnellCost: 20.50,           // 82 images × ₹0.25
      imageCostTotal: 212.90,       // Total 150 images (includes Banana ₹146.70 + Kontext ₹26.80)
      voiceCost: 35.50,             // 25 min × ₹1.42
      cameraCost: 0,
      gatewayCost: 29.26,           // 3.5% Stripe
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 638.06,
      revenue: 836.16,
      profit: 198.10,
      margin: 23.7,
    },
    
  },

  // ==========================================
  // 🚀 PRO PLAN (₹799 / $24.99)
  // ==========================================
  // Updated: February 15, 2026
  // India: ₹799, 30L tokens, 120 images (50 Banana), 35 min voice, 10 min camera (50/35/15 Mistral/Gemini/Devstral)
  // Intl: $24.99, 84.4L tokens, 265 images (125 Banana), 60 min voice, 15 min camera (50/35/15 Mistral/Gemini/Devstral)
  // Haiku & GPT removed, Devstral added for coding
  // ==========================================
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'pro',
    displayName: 'Soriva Pro',
    displayNameFrontend: 'Soriva Pro',
    tagline: 'Command brilliance.',
    description: 'Premium AI with Devstral coding, advanced images, and full voice suite',
    price: 799,
    priceUSD: 24.99,
    priceYearly: 7990,
    priceYearlyUSD: 249.90,
    yearlyDiscount: 17,
    yearlyDiscountInternational: 17,
    enabled: true,
    order: 4,
    personality: 'Professional, insightful, detailed, analytical',
    bonusTokens: 100000,

    // 💰 PAID LIMITS - INDIA (₹799/month) - Updated Feb 15, 2026
    limits: {
      monthlyTokens: 3000000,
      promptTokenPool: 1500000,
      monthlyWords: 2000000,
      dailyTokens: 100000,
      dailyWords: 66667,
      botResponseLimit: 4096,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 1.5,
      voiceMinutes: 35,
      cameraMinutes: 10,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 55,
        gptLowImages: 30,
        totalImages: 110,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 📅 YEARLY LIMITS - INDIA (10 months tokens, 12 months access)
    limitsYearly: {
      monthlyTokens: 3000000,
      promptTokenPool: 1500000,
      monthlyWords: 2000000,
      dailyTokens: 100000,
      dailyWords: 66667,
      botResponseLimit: 4096,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 1.5,
      voiceMinutes: 35,
      cameraMinutes: 10,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 55,
        gptLowImages: 30,
        totalImages: 110,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 2,
    },

    // 💰 PAID LIMITS - INTERNATIONAL ($24.99/month) - ✅ v11.0 IMAGE UPDATE
    limitsInternational: {
      monthlyTokens: 8440000,
      promptTokenPool: 4000000,
      monthlyWords: 5626667,
      dailyTokens: 281333,
      dailyWords: 187556,
      botResponseLimit: 4096,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 1.5,
      voiceMinutes: 60,
      cameraMinutes: 15,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 110,
        gptLowImages: 50,
        totalImages: 222,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 📅 YEARLY LIMITS - INTERNATIONAL (10 months tokens, 12 months access)
    limitsYearlyInternational: {
      monthlyTokens: 8440000,
      promptTokenPool: 4000000,
      monthlyWords: 5626667,
      dailyTokens: 281333,
      dailyWords: 187556,
      botResponseLimit: 4096,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 1.5,
      voiceMinutes: 60,
      cameraMinutes: 15,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 110,
        gptLowImages: 50,
        totalImages: 222,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 2,
    },

    // 🤖 AI MODELS - INDIA (Mistral 50% + Gemini 35% + Devstral 15%)
    // Devstral shares same token pool - used for coding queries
    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-latest',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 50,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 35,
      },
      {
        provider: AIProvider.MISTRAL,
        modelId: 'devstral-medium-latest',
        displayName: 'Devstral (Coding)',
        tier: RoutingTier.CODING,
        percentage: 15,
      },
    ],

    // 🤖 AI MODELS - INTERNATIONAL (Mistral 50% + Gemini 35% + Devstral 15%)
    // Devstral shares same token pool - used for coding queries
    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-latest',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 50,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 35,
      },
      {
        provider: AIProvider.MISTRAL,
        modelId: 'devstral-medium-latest',
        displayName: 'Devstral (Coding)',
        tier: RoutingTier.CODING,
        percentage: 15,
      },
    ],

    routing: { 'mistral-large-latest': 0.50, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.15 },
    routingYearly: { 'mistral-large-latest': 0.50, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.15 },
    routingInternational: { 'mistral-large-latest': 0.50, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.15 },
    routingInternationalYearly: { 'mistral-large-latest': 0.50, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.15 },
    fallbackModel: 'gemini-2.0-flash',
    fallbackTokens: 500000,

    // premiumCap removed - no more GPT/Haiku caps needed

    isHybrid: true,
    hasSmartRouting: true,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,
    hasIntentBasedRouting: true,
    hasPremiumCap: false,

    // 🖼️ IMAGE ROUTING
    imageRouting: {
      human: 'schnell',
      nonHuman: 'schnell',
      text: 'gptLow',
      deities: 'blocked',
      logos: 'gptLow',
      posters: 'gptLow',
      cards: 'gptLow',
      styleTransfer: 'gptLow',
      cartoon: 'gptLow',
      anime: 'gptLow',
      default: 'schnell',
    },

  // ⚡ COOLDOWN BOOSTER (₹45 / $1.99) - NO CHANGE
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Pro Session',
      description: 'Unlock another day of Pro-level access.',
      price: 45,
      priceUSD: 1.99,
      tokensUnlocked: 66667,
      tokensUnlockedInternational: 141667,
      wordsUnlocked: 44444,
      wordsUnlockedInternational: 94444,
      duration: 0,
      validityHours: 24,
      validityHoursInternational: 24,
      activationWindow: 24,
      maxPerDay: 1,
      maxPerPlanPeriod: 10,
      resetOn: 'calendar',
      bypassDailyLimit: true,
      useMonthlyPool: true,
      carryForward: false,
      expiryLogic: 'strict_expiry',
      logic: 'Unlocks daily cap. Uses monthly pool + fallback available.',
      costs: {
        ai: 0,
        gateway: 1.06,
        total: 1.06,
        profit: 43.94,
        margin: 97.6,
      },
      costsInternational: {
        ai: 0,
        gateway: 5.82,
        total: 5.82,
        profit: 160.73,
        margin: 96.5,
      },
    },

    // 📦 ADDON BOOSTER (₹149 / $4.99) - ✅ v11.0 IMAGE UPDATE
    // India: ₹199 → ₹149, Tokens 5L → 7.5L
    // Intl: $5.99 → $4.99, Tokens 10L → 15L
    // Routing: 50% Mistral + 35% Gemini + 15% Devstral (same as plan)
    addonBooster: {
      type: 'ADDON',
      name: 'Pro Boost',
      description: 'Power pack for demanding projects!',
      price: 149,
      priceUSD: 4.99,
      mistralTokens: 375000,
      geminiTokens: 262500,
      devstralTokens: 112500,
      totalTokens: 750000,
      totalTokensInternational: 1500000,
      gptLowImages: 15,
      gptLowImagesInternational: 30,
      schnellImages: 35,
      schnellImagesInternational: 70,
      totalImages: 50,
      totalImagesInternational: 100,
      dailyBoost: 0,
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted, no daily cap',
      distributionLogic: 'Separate pool, same routing as plan (50/35/15)',
      maxPerMonth: 5,
      maxPerMonthInternational: 5,
      queueingAllowed: true,
      separatePool: true,
      costs: {
        ai: 65.26,
        images: 51.65,
        gateway: 3.52,
        total: 120.43,
        profit: 28.57,
        margin: 19.2,
      },
      costsInternational: {
        ai: 130.53,
        images: 103.30,
        gateway: 14.61,
        total: 248.44,
        profit: 169.21,
        margin: 40.5,
      },
    },

    // ❌ DOC AI BOOSTER - REMOVED (consolidated pool, no separate doc tokens)

    // 🖼️ IMAGE BOOSTER (₹99 / $2.99) - ✅ v11.0 IMAGE UPDATE
    imageBooster: {
      type: 'IMAGE',
      name: 'Image Boost Pack',
      description: 'Premium image generation credits',
      price: 99,
      priceUSD: 2.99,
      validity: 30,
      maxPerMonth: 10,
      images: {
        schnell: 25,
        gptLow: 10,
        total: 45,
      },
      imagesInternational: {
        schnell: 50,
        gptLow: 20,
        total: 90,
      },
      costs: {
        images: 67.70,
        gateway: 2.34,
        total: 70.04,
        profit: 28.96,
        margin: 29.3,
      },
      costsInternational: {
        images: 135.40,
        gateway: 8.76,
        total: 144.16,
        profit: 105.84,
        margin: 42.4,
      },
    },
    // 📄 DOCUMENTATION
    documentation: {
      enabled: true,
      tier: 'pro' as DocumentIntelligenceTier,
      displayName: 'Smart Docs Pro',
      badge: '⚡',
      tagline: 'Professional document intelligence',
      monthlyCredits: 0,
      monthlyCreditsInternational: 0,
      docAITokens: 600000,
      docAITokensInternational: 1200000,
      monthlyWords: 0,
      maxWorkspaces: 10,
      maxFileSizeMB: 50,
      featuresUnlocked: 15,
      model: 'mistral-large-latest',
      modelPremium: 'devstral-medium-latest',
      exportFormats: ['pdf', 'markdown', 'docx', 'xlsx'],
      templates: true,
      templatesCount: 25,
      versionHistory: 10,
      collaboration: true,
    },

    // ✨ FEATURES
    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
      smartRouting: true,
      multiModel: true,
      voice: true,
      camera: true,
      intentBasedRouting: true,
      premiumCap: false,
    },

    // 💰 COSTS - INDIA (₹799/month) - Updated Feb 15, 2026
    // AI: 30L tokens (Mistral 50% + Gemini 35% + Devstral 15%)
    // Haiku removed, Devstral added for coding
    costs: {
      aiCostPrimary: 261.06,
      aiCostFallback: 0,
      aiCostTotal: 261.06,
      gptLowCost: 12.60,
      schnellCost: 13.75,
      imageCostTotal: 206.10,
      voiceCost: 49.70,
      cameraCost: 50.40,
      gatewayCost: 18.86,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 616.12,
      revenue: 799,
      profit: 182.88,
      margin: 22.9,
    },

    // 💰 COSTS - INTERNATIONAL ($24.99/month) - Updated Feb 15, 2026
    // AI: 84.4L tokens (Mistral 50% + Gemini 35% + Devstral 15%)
    // GPT removed, Devstral added for coding
    costsInternational: {
      aiCostPrimary: 734.45,
      aiCostFallback: 0,
      aiCostTotal: 734.45,
      gptLowCost: 25.20,
      schnellCost: 27.50,
      imageCostTotal: 493.70,
      voiceCost: 85.20,
      cameraCost: 75.60,
      gatewayCost: 73.22,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 1497.17,
      revenue: 2091.41,
      profit: 594.24,
      margin: 28.4,
    },

    // 💳 PAYMENT GATEWAY
    paymentGateway: {
      razorpay: 'plan_pro_monthly',
      razorpayYearly: 'plan_pro_yearly',
      stripe: 'price_pro_monthly_usd',
      stripeYearly: 'price_pro_yearly_usd',
    },
  },


  // ==========================================
  // 👑 APEX PLAN (₹1,299 / $59.99)
  // ==========================================
  // ==========================================
  // 👑 APEX PLAN (₹1,599 / $39.99)
  // ==========================================
  // Updated: February 15, 2026
  // India: ₹1,599, 74.6L tokens, 180 images (75 Banana), 60 min voice, 25 min camera (50/35/15 Mistral/Gemini/Devstral)
  // Intl: $39.99, 150L (15M) tokens, 365 images (155 Banana), 90 min voice, 35 min camera (50/35/15 Mistral/Gemini/Devstral)
  // Haiku, GPT & Sonnet removed, Devstral added for coding
  // ==========================================
  [PlanType.APEX]: {
    id: PlanType.APEX,
    name: 'apex',
    displayName: 'Soriva Apex',
    tagline: 'Unleash the extraordinary.',
    description: 'Ultimate AI with Devstral coding, maximum tokens, and full creative suite',
    price: 1599,
    priceUSD: 39.99,
    priceYearly: 15990,
    priceYearlyUSD: 399.90,
    yearlyDiscount: 17,
    yearlyDiscountInternational: 17,
    enabled: true,
    order: 5,
    personality: 'Elite, comprehensive, visionary, emotionally intelligent',
    bonusTokens: 150000,

    // ──────────────────────────────────────
    // USAGE LIMITS - INDIA (Updated Feb 15, 2026)
    // 74.6L tokens (Mistral 50% + Gemini 35% + Devstral 15%)
    // Images: 180 (Schnell 82 + Klein 15 + Banana 75 + Kontext 8)
    // Voice: 60 min, Camera: 25 min
    // Margin: 21.9%
    // ──────────────────────────────────────
    limits: {
      monthlyTokens: 7460000,
      promptTokenPool: 3700000,
      monthlyWords: 4973333,
      dailyTokens: 248667,
      dailyWords: 165778,
      botResponseLimit: 8192,
      memoryDays: 30,
      contextMemory: 15,
      responseDelay: 1,
      voiceMinutes: 60,
      cameraMinutes: 25,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 82,
        gptLowImages: 50,
        totalImages: 169,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsYearly: {
      monthlyTokens: 7460000,
      promptTokenPool: 3700000,
      monthlyWords: 4973333,
      dailyTokens: 248667,
      dailyWords: 165778,
      botResponseLimit: 8192,
      memoryDays: 30,
      contextMemory: 15,
      responseDelay: 1,
      voiceMinutes: 60,
      cameraMinutes: 25,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 82,
        gptLowImages: 50,
        totalImages: 169,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 75,
      carryForwardMaxMonths: 2,
    },

    // ──────────────────────────────────────
    // USAGE LIMITS - INTERNATIONAL - ✅ v11.0 IMAGE UPDATE
    // Images: 330 (Schnell 165 + GPT 75 + Banana 90)
    // Voice: 90 min, Camera: 35 min
    // ──────────────────────────────────────
    limitsInternational: {
      monthlyTokens: 15000000,
      promptTokenPool: 7500000,
      monthlyWords: 10000000,
      dailyTokens: 500000,
      dailyWords: 333333,
      botResponseLimit: 8192,
      memoryDays: 30,
      contextMemory: 15,
      responseDelay: 1,
      voiceMinutes: 90,
      cameraMinutes: 35,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 165,
        gptLowImages: 75,
        totalImages: 330,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsYearlyInternational: {
      monthlyTokens: 15000000,
      promptTokenPool: 7500000,
      monthlyWords: 10000000,
      dailyTokens: 500000,
      dailyWords: 333333,
      botResponseLimit: 8192,
      memoryDays: 30,
      contextMemory: 15,
      responseDelay: 1,
      voiceMinutes: 90,
      cameraMinutes: 35,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 165,
        gptLowImages: 75,
        totalImages: 330,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 75,
      carryForwardMaxMonths: 2,
    },

    // ──────────────────────────────────────
    // AI MODELS - INDIA (Mistral 50% + Gemini 35% + Devstral 15%)
    // Devstral shares same token pool - used for coding queries
    // ──────────────────────────────────────
    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-latest',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 50,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 35,
      },
      {
        provider: AIProvider.MISTRAL,
        modelId: 'devstral-medium-latest',
        displayName: 'Devstral (Coding)',
        tier: RoutingTier.CODING,
        percentage: 15,
      },
    ],

    // ──────────────────────────────────────
    // AI MODELS - INTERNATIONAL (Mistral 50% + Gemini 35% + Devstral 15%)
    // Devstral shares same token pool - used for coding queries
    // ──────────────────────────────────────
    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-latest',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 50,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 35,
      },
      {
        provider: AIProvider.MISTRAL,
        modelId: 'devstral-medium-latest',
        displayName: 'Devstral (Coding)',
        tier: RoutingTier.CODING,
        percentage: 15,
      },
    ],

    routing: { 'mistral-large-latest': 0.50, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.15 },
    routingYearly: { 'mistral-large-latest': 0.50, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.15 },
    routingInternational: { 'mistral-large-latest': 0.50, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.15 },
    routingInternationalYearly: { 'mistral-large-latest': 0.50, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.15 },
    fallbackModel: 'gemini-2.0-flash',
    fallbackTokens: 500000,

    // premiumCap removed - no more GPT/Haiku/Sonnet caps needed

    orchestration: {
      enabled: true,
      multiDomainChain: {
        IN: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
        INTL: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
      },
      creativeChain: {
        IN: ['mistral-large-latest', 'gemini-2.0-flash'],
        INTL: ['mistral-large-latest', 'gemini-2.0-flash'],
      },
      creativeChainProbability: 30,
    },

    isHybrid: true,
    hasSmartRouting: true,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,
    hasIntentBasedRouting: true,
    hasPremiumCap: false,
    hasMultiModelOrchestration: true,
    hasCreativeChaining: true,

    // 🖼️ IMAGE ROUTING
    imageRouting: {
      human: 'schnell',
      nonHuman: 'schnell',
      text: 'gptLow',
      deities: 'blocked',
      logos: 'gptLow',
      posters: 'gptLow',
      cards: 'gptLow',
      styleTransfer: 'gptLow',
      cartoon: 'gptLow',
      anime: 'gptLow',
      default: 'schnell',
    },

    // ──────────────────────────────────────
    // COOLDOWN BOOSTER
    // India: ₹49, International: $4.99
    // ──────────────────────────────────────
    // ⚡ COOLDOWN BOOSTER (₹49 / $4.99) - NO CHANGE
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Apex Session',
      description: 'Unlock another day of Apex-level access.',
      price: 49,
      priceUSD: 4.99,
      tokensUnlocked: 116667,
      tokensUnlockedInternational: 233333,
      wordsUnlocked: 77778,
      wordsUnlockedInternational: 155556,
      isExtraInternational: false,
      validityHours: 24,
      validityHoursInternational: 24,
      activationWindow: 24,
      carryForward: false,
      expiryLogic: 'strict_expiry',
      logic: 'Unlocks 1 extra daily quota. Must be used same day.',
      duration: 0,
      maxPerPlanPeriod: 15,
      resetOn: 'calendar',
      costs: {
        ai: 0,
        gateway: 1.16,
        total: 1.16,
        profit: 47.84,
        margin: 97.6,
      },
      costsInternational: {
        ai: 0,
        gateway: 14.61,
        total: 14.61,
        profit: 402.99,
        margin: 96.5,
      },
    },

    // 📦 ADDON BOOSTER (₹199 / $5.99) - ✅ v11.0 IMAGE UPDATE
    // India: 10L tokens, Intl: 20L tokens
    // Routing: 50% Mistral + 35% Gemini + 15% Devstral (same as plan)
    addonBooster: {
      type: 'ADDON',
      name: 'Apex Boost',
      description: 'Ultimate power pack for maximum productivity!',
      price: 199,
      priceUSD: 5.99,
      mistralTokens: 500000,
      geminiTokens: 350000,
      devstralTokens: 150000,
      totalTokens: 1000000,
      totalTokensInternational: 2000000,
      gptLowImages: 20,
      gptLowImagesInternational: 40,
      schnellImages: 45,
      schnellImagesInternational: 85,
      totalImages: 75,
      totalImagesInternational: 150,
      dailyBoost: 0,
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted, no daily cap',
      distributionLogic: 'Separate pool, same routing as plan (50/35/15)',
      maxPerMonth: 5,
      maxPerMonthInternational: 5,
      queueingAllowed: true,
      separatePool: true,
      costs: {
        ai: 87.02,
        images: 100.85,
        gateway: 4.70,
        total: 192.57,
        profit: 6.43,
        margin: 3.2,
      },
      costsInternational: {
        ai: 174.04,
        images: 216.20,
        gateway: 17.54,
        total: 407.78,
        profit: 93.39,
        margin: 18.6,
      },
    },

    // ❌ DOC AI BOOSTER - REMOVED (consolidated pool, no separate doc tokens)

    // 🖼️ IMAGE BOOSTER (₹99 / $2.99) - ✅ v11.0 IMAGE UPDATE
    imageBooster: {
      type: 'IMAGE',
      name: 'Image Boost Pack',
      description: 'Premium image generation credits',
      price: 99,
      priceUSD: 2.99,
      validity: 30,
      maxPerMonth: 10,
      images: {
        schnell: 25,
        gptLow: 10,
        total: 45,
      },
      imagesInternational: {
        schnell: 50,
        gptLow: 20,
        total: 90,
      },
      costs: {
        images: 67.70,
        gateway: 2.34,
        total: 70.04,
        profit: 28.96,
        margin: 29.3,
      },
      costsInternational: {
        images: 135.40,
        gateway: 8.76,
        total: 144.16,
        profit: 105.84,
        margin: 42.4,
      },
    },
    // 📄 DOCUMENTATION
    documentation: {
      enabled: true,
      tier: 'apex' as DocumentIntelligenceTier,
      displayName: 'Apex Intelligence Suite',
      badge: '👑',
      tagline: 'Business + Emotional Intelligence',
      monthlyCredits: 0,
      monthlyCreditsInternational: 0,
      docAITokens: 850000,
      docAITokensInternational: 1700000,
      monthlyWords: 0,
      maxWorkspaces: 25,
      maxFileSizeMB: 100,
      featuresUnlocked: 25,
      model: 'mistral-large-latest',
      modelPremium: 'devstral-medium-latest',
      exportFormats: ['pdf', 'markdown', 'docx', 'xlsx', 'pptx'],
      templates: true,
      templatesCount: 50,
      versionHistory: 30,
      collaboration: true,
      advancedFeatures: {
        smartWorkflow: true,
        aiTagging: true,
        decisionSnapshot: true,
        legalFinanceLens: true,
        multiformatFusion: true,
        businessContextMemory: true,
        voiceToAction: true,
        emotionalContextSummarizer: true,
        memoryCapsule: true,
        companionNotes: true,
        thoughtOrganizer: true,
        aiScrapbook: true,
        lifeReflectionInsights: true,
        handwritingEmotionReader: true,
      },
    },

    // ✨ FEATURES
    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
      smartRouting: true,
      multiModel: true,
      voice: true,
      camera: true,
      intentBasedRouting: true,
      premiumCap: false,
      multiModelOrchestration: true,
      creativeChaining: true,
    },

    // ──────────────────────────────────────
    // COSTS - INDIA (₹1,599) - Updated Feb 15, 2026
    // AI: 74.6L tokens (Mistral 50% + Gemini 35% + Devstral 15%)
    // Haiku & GPT removed, Devstral added for coding
    // Margin: 21.9%
    // ──────────────────────────────────────
    costs: {
      aiCostPrimary: 649.18,
      aiCostFallback: 0,
      aiCostTotal: 649.18,
      gptLowCost: 18.90,
      schnellCost: 20.50,
      imageCostTotal: 310.70,
      voiceCost: 85.20,
      cameraCost: 126.00,
      gatewayCost: 37.74,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 1248.82,
      revenue: 1599,
      profit: 350.18,
      margin: 21.9,
    },

    // ──────────────────────────────────────
    // COSTS - INTERNATIONAL ($39.99) - Updated Feb 15, 2026
    // AI: 150L (15M) tokens (Mistral 50% + Gemini 35% + Devstral 15%)
    // Haiku, GPT & Sonnet removed, Devstral added for coding
    // Margin: 27.9%
    // ──────────────────────────────────────
    costsInternational: {
      aiCostPrimary: 1305.30,
      aiCostFallback: 0,
      aiCostTotal: 1305.30,
      gptLowCost: 37.80,
      schnellCost: 41.25,
      imageCostTotal: 634.60,
      voiceCost: 127.80,
      cameraCost: 176.40,
      gatewayCost: 117.12,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 2411.22,
      revenue: 3346.04,
      profit: 934.82,
      margin: 27.9,
    },

    // 💳 PAYMENT GATEWAY
    paymentGateway: {
      razorpay: 'plan_apex_monthly',
      razorpayYearly: 'plan_apex_yearly',
      stripe: 'price_apex_monthly_usd',
      stripeYearly: 'price_apex_yearly_usd',
    },
  },
  // ==========================================
  // 🏛️ SOVEREIGN PLAN (Internal - Founders Only)
  // ==========================================
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
    order: 6,
    personality: 'Premium companion with full access - Founder Edition',
    bonusTokens: 999999999,

    limits: {
      monthlyTokens: 999999999,
      promptTokenPool: 2_000_000,
      monthlyWords: 999999999,
      dailyTokens: 999999999,
      dailyWords: 999999999,
      botResponseLimit: 16384,
      memoryDays: 365,
      contextMemory: 100,
      responseDelay: 0,
      voiceMinutes: 999999,
      cameraMinutes: 999999,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 999999999,
      images: {
        schnellImages: 999999,
        gptLowImages: 999999,
        totalImages: 999999,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsInternational: {
      monthlyTokens: 999999999,
      monthlyWords: 999999999,
      dailyTokens: 999999999,
      dailyWords: 999999999,
      botResponseLimit: 16384,
      memoryDays: 365,
      contextMemory: 100,
      responseDelay: 0,
      voiceMinutes: 999999,
      cameraMinutes: 999999,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 999999999,
      images: {
        schnellImages: 999999,
        gptLowImages: 999999,
        totalImages: 999999,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 🤖 AI MODELS - Same as paid plans (50/35/15)
    aiModels: [
      { provider: AIProvider.MISTRAL, modelId: 'mistral-large-latest', displayName: 'Mistral Large 3', tier: RoutingTier.COMPLEX, percentage: 50 },
      { provider: AIProvider.GEMINI, modelId: 'gemini-2.0-flash', displayName: 'Gemini Flash 2.0', tier: RoutingTier.SIMPLE, percentage: 35 },
      { provider: AIProvider.MISTRAL, modelId: 'devstral-medium-latest', displayName: 'Devstral (Coding)', tier: RoutingTier.CODING, percentage: 15 },
    ],

    aiModelsInternational: [
      { provider: AIProvider.MISTRAL, modelId: 'mistral-large-latest', displayName: 'Mistral Large 3', tier: RoutingTier.COMPLEX, percentage: 50 },
      { provider: AIProvider.GEMINI, modelId: 'gemini-2.0-flash', displayName: 'Gemini Flash 2.0', tier: RoutingTier.SIMPLE, percentage: 35 },
      { provider: AIProvider.MISTRAL, modelId: 'devstral-medium-latest', displayName: 'Devstral (Coding)', tier: RoutingTier.CODING, percentage: 15 },
    ],

    routing: { 'mistral-large-latest': 0.50, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.15 },
    routingInternational: { 'mistral-large-latest': 0.50, 'gemini-2.0-flash': 0.35, 'devstral-medium-latest': 0.15 },
    fallbackModel: 'gemini-2.0-flash',
    fallbackTokens: 999999999,

    isHybrid: true,
    hasSmartRouting: true,
    hasDynamicDailyLimits: false,
    tokenExpiryEnabled: false,
    hasIntentBasedRouting: true,
    hasPremiumCap: false,
    hasMultiModelOrchestration: true,
    hasCreativeChaining: true,

    documentation: {
      enabled: true,
      tier: 'apex' as DocumentIntelligenceTier,
      displayName: 'Sovereign Suite',
      badge: '🏛️',
      tagline: 'Unlimited everything',
      monthlyCredits: 999999,
      monthlyCreditsInternational: 999999,
      monthlyWords: 999999999,
      maxWorkspaces: 999,
      maxFileSizeMB: 500,
      featuresUnlocked: 999,
      model: 'mistral-large-latest',
      modelPremium: 'devstral-medium-latest',
      exportFormats: ['pdf', 'markdown', 'docx', 'xlsx', 'pptx', 'html'],
      templates: true,
      templatesCount: 999,
      versionHistory: 999,
      collaboration: true,
    },

    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
      smartRouting: true,
      multiModel: true,
      voice: true,
      camera: true,
      intentBasedRouting: true,
      premiumCap: false,
      multiModelOrchestration: true,
      creativeChaining: true,
    },

    imageRouting: {
      human: 'schnell',
      nonHuman: 'schnell',
      text: 'gptLow',
      deities: 'blocked',
      logos: 'gptLow',
      posters: 'gptLow',
      cards: 'gptLow',
      styleTransfer: 'gptLow',
      cartoon: 'gptLow',
      anime: 'gptLow',
      default: 'schnell',
    },

    costs: {
      aiCostPrimary: 0, aiCostFallback: 0, aiCostTotal: 0,
      gptLowCost: 0, schnellCost: 0, imageCostTotal: 0,
      voiceCost: 0, cameraCost: 0, gatewayCost: 0,
      infraCostPerUser: 0, totalCost: 0, revenue: 0, profit: 0, margin: 100,
    },

    costsInternational: {
      aiCostPrimary: 0, aiCostFallback: 0, aiCostTotal: 0,
      gptLowCost: 0, schnellCost: 0, imageCostTotal: 0,
      voiceCost: 0, cameraCost: 0, gatewayCost: 0,
      infraCostPerUser: 0, totalCost: 0, revenue: 0, profit: 0, margin: 100,
    },
  },
};

// ==========================================
// 📚 DOCUMENT INTELLIGENCE TIERS
// ==========================================

export const DOC_INTELLIGENCE_TIERS = {
  starter: {
    displayName: 'Smart Docs Basic',
    badge: '📄',
    description: 'Essential document tools',
  },
  standard: {
    displayName: 'Document Intelligence',
    badge: '✨',
    description: 'Smart documentation for everyday needs',
  },
  pro: {
    displayName: 'Document Intelligence Pro',
    badge: '⚡',
    description: 'Professional-grade documentation workspace',
  },
  apex: {
    displayName: 'Apex Intelligence Suite',
    badge: '👑',
    description: 'Business intelligence meets emotional depth',
  },
} as const;

export const EXPORT_FORMATS_BY_TIER = {
  starter: ['pdf', 'markdown'],
  standard: ['pdf', 'markdown'],
  pro: ['pdf', 'docx', 'markdown', 'html'],
  apex: ['pdf', 'docx', 'markdown', 'html', 'pptx', 'xlsx'],
} as const;

// ==========================================
// ⚙️ HELPER CONSTANTS
// ==========================================

export const HINGLISH_TOKEN_SAVINGS = 0.1;
export const COOLDOWN_DURATION_HOURS = 0;
export const COOLDOWN_MAX_PER_PERIOD = 1;
export const COOLDOWN_MAX_STARTER = 5;
export const ADDON_MAX_PER_MONTH = 2;
export const ADDON_VALIDITY_DAYS = 7;
export const TRIAL_MAX_DAYS = 14;
export const FALLBACK_TRIGGER_RATE = 0.5;
export const USAGE_WARNING_THRESHOLD = 85;
export const USAGE_MULTIPLIER_INTERNATIONAL = 2.0;

// ==========================================
// 🎯 TOKEN CONTROL LOGIC
// ==========================================

export const TOKEN_CONTROL_LOGIC = {
  [PlanType.STARTER]: {
    softLimitPercent: 80,
    softLimit: 8000,
    hardLimit: 10000,
    postToolBuffer: 300,
    maxToolCost: 5000,
  },
  [PlanType.LITE]: {
    softLimitPercent: 80,
    softLimit: 13333,
    hardLimit: 16667,
    postToolBuffer: 400,
    maxToolCost: 8000,
  },
  [PlanType.PLUS]: {
    softLimitPercent: 80,
    softLimit: 33333,
    hardLimit: 41667,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.PRO]: {
    softLimitPercent: 80,
    softLimit: 53333,
    hardLimit: 66667,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.APEX]: {
    softLimitPercent: 80,
    softLimit: 93333,
    hardLimit: 116667,
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

export const TOKEN_CONTROL_LOGIC_INTL = {
  [PlanType.STARTER]: TOKEN_CONTROL_LOGIC[PlanType.STARTER],
  [PlanType.LITE]: {
    softLimitPercent: 80,
    softLimit: 26667,
    hardLimit: 33333,
    postToolBuffer: 400,
    maxToolCost: 8000,
  },
  [PlanType.PLUS]: {
    softLimitPercent: 80,
    softLimit: 53333,
    hardLimit: 66667,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.PRO]: {
    softLimitPercent: 80,
    softLimit: 113333,
    hardLimit: 141667,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.APEX]: {
    softLimitPercent: 80,
    softLimit: 186667,
    hardLimit: 233333,
    postToolBuffer: 500,
    maxToolCost: 10000,
  },
  [PlanType.SOVEREIGN]: TOKEN_CONTROL_LOGIC[PlanType.SOVEREIGN],
} as const;

// ==========================================
// 🛡️ STARTER PLAN ABUSE PROTECTION
// ==========================================

export const STARTER_PROTECTION = {
  dailyTokenCap: 10000,
  monthlyTokenCap: 300000,
  maxMessagesPerHour: 20,
  maxMessagesPerDay: 100,
  maxAccountsPerIP: 2,
  ipCooldownHours: 24,
  enableCaptchaAfterMessages: 10,
  suspiciousPatternBlock: true,
  maxRequestsPerMinute: 5,
  maxMonthlyLossPerUser: 15,
  autoRestrictOnAbuse: true,
  maxResponseTokens: 500,
  responseDelaySeconds: 5,
} as const;

// ==========================================
// 🛠️ HELPER FUNCTIONS
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

export function calculateDynamicDailyLimit(
  remainingTokens: number,
  remainingDays: number
): number {
  if (remainingDays <= 0) return 0;
  return Math.floor(remainingTokens / remainingDays);
}

export function getPlanRouting(planType: PlanType, region: Region = Region.INDIA) {
  const plan = PLANS_STATIC_CONFIG[planType];
  if (region === Region.INTERNATIONAL && plan.routingInternational) {
    return plan.routingInternational;
  }
  return plan.routing || {};
}

export function getEnabledPlans(): Plan[] {
  return Object.values(PLANS_STATIC_CONFIG).filter(plan => plan.enabled);
}

export function getPlanByName(name: string): Plan | undefined {
  return Object.values(PLANS_STATIC_CONFIG).find(
    plan => plan.name.toLowerCase() === name.toLowerCase()
  );
}

export function getPlansSorted(): Plan[] {
  return Object.values(PLANS_STATIC_CONFIG).sort((a, b) => a.order - b.order);
}

export function planHasFeature(
  planType: PlanType,
  feature: keyof Plan['features']
): boolean {
  const plan = PLANS_STATIC_CONFIG[planType];
  return plan?.features?.[feature] ?? false;
}

export function getCooldownBooster(planType: PlanType): CooldownBooster | undefined {
  return PLANS_STATIC_CONFIG[planType]?.cooldownBooster;
}

export function getAddonBooster(planType: PlanType): AddonBooster | undefined {
  return PLANS_STATIC_CONFIG[planType]?.addonBooster;
}

export function calculateUsagePercentage(used: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

export function isUsageWarning(used: number, total: number): boolean {
  return calculateUsagePercentage(used, total) >= USAGE_WARNING_THRESHOLD;
}

export function getEffectiveTokenLimit(
  planType: PlanType,
  currentUsage: number,
  isToolRequest: boolean,
  region: Region = Region.INDIA
) {
  const config = region === Region.INDIA
    ? TOKEN_CONTROL_LOGIC[planType]
    : TOKEN_CONTROL_LOGIC_INTL[planType];

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

  if (currentUsage >= config.softLimit && isToolRequest) {
    return {
      canProceed: true,
      extendedMode: true,
      limitAfterTask: true,
      remaining: 0,
      postBuffer: config.postToolBuffer,
      message: null
    };
  }

  return {
    canProceed: true,
    extendedMode: false,
    limitAfterTask: false,
    remaining: config.hardLimit - currentUsage,
    postBuffer: 0,
    message: null
  };
}

export function createLimitExceededState(postBuffer: number) {
  return {
    limitExceeded: true,
    bufferRemaining: postBuffer,
    exceededAt: new Date().toISOString(),
    message: 'Aaj ki limit complete ho gayi! Kal fresh quota milega. 🙏'
  };
}

// ==========================================
// 🌍 USER LOCATION DEFAULTS
// ==========================================

export const USER_LOCATION = {
  country: 'India',
  region: Region.INDIA,
  currency: Currency.INR,
} as const;

// ==========================================
// 📊 PLAN COMPARISON HELPERS
// ==========================================

export function getUpgradePath(currentPlan: PlanType): Plan[] {
  const currentOrder = PLANS_STATIC_CONFIG[currentPlan]?.order || 0;
  return getPlansSorted().filter(plan => plan.order > currentOrder && plan.enabled);
}

export function getDowngradePath(currentPlan: PlanType): Plan[] {
  const currentOrder = PLANS_STATIC_CONFIG[currentPlan]?.order || 0;
  return getPlansSorted().filter(plan => plan.order < currentOrder && plan.enabled);
}

export function calculatePriceDifference(
  fromPlan: PlanType,
  toPlan: PlanType,
  region: Region = Region.INDIA
): number {
  const fromPricing = getPlanPricing(fromPlan, region);
  const toPricing = getPlanPricing(toPlan, region);
  return toPricing.price - fromPricing.price;
}

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

export function getPlanPricingByCycle(
  planType: PlanType,
  region: Region = Region.INDIA,
  billingCycle: BillingCycle = BillingCycle.MONTHLY
) {
  const plan = PLANS_STATIC_CONFIG[planType];
  const isYearly = billingCycle === BillingCycle.YEARLY;

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
      freeMonths: 2,
      tokenMonths: YEARLY_TOKEN_MONTHS,
      platformMonths: YEARLY_PLATFORM_MONTHS,
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
    freeMonths: 2,
    tokenMonths: YEARLY_TOKEN_MONTHS,
    platformMonths: YEARLY_PLATFORM_MONTHS,
    currency: Currency.USD,
    symbol: '$',
  };
}

// ==========================================
// 🖼️ IMAGE HELPERS (v12.0 - 2 Model System)
// ==========================================

export function calculateGptLowCost(gptLowCount: number): number {
  return gptLowCount * IMAGE_COSTS.gptLow.costPerImagePortrait;  // Using portrait cost (₹1.18)
}

export function calculateSchnellCost(schnellCount: number): number {
  return schnellCount * IMAGE_COSTS.schnell.costPerImage;
}

export function calculateTotalImageCost(schnellCount: number, gptLowCount: number): number {
  return calculateSchnellCost(schnellCount) + calculateGptLowCost(gptLowCount);
}

// Legacy function for backward compatibility
export function calculateImageCost(gptLowCount: number): number {
  return calculateGptLowCost(gptLowCount);
}

export function getImageLimits(planType: PlanType, region: Region = Region.INDIA): ImageLimits {
  const plan = PLANS_STATIC_CONFIG[planType];
  const limits = region === Region.INDIA ? plan.limits : (plan.limitsInternational || plan.limits);
  return limits.images;
}