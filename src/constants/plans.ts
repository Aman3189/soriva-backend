// src/constants/plans.ts

/**
 * ==========================================
 * SORIVA V3 - FINALIZED PLANS CONFIGURATION
 * ==========================================
 * Complete pricing, token allocation, and booster strategy
 * Last Updated: January 19, 2026 - PRODUCTION READY v10.3
 * ==========================================
 * v10.3 CHANGELOG (January 19, 2026):
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
 *    - STARTER: FREE, 300K Mistral 100%, 5 images
 *    - PLUS: ₹299, 1.25M Mistral 100%, 45 images (45 Schnell + 0 Dev)
 *    - PRO: ₹799, 2M (Mistral 65% + Haiku 35%), 100 images (60 Schnell + 40 Dev)
 *    - APEX: ₹1,299, 3.5M (Mistral 65% + Haiku 35%), 105 images (45 Schnell + 60 Dev)
 *
 * ✅ INTERNATIONAL PRICING & TOKENS:
 *    - STARTER: FREE, 300K Mistral 100%, 5 images
 *    - PLUS: $9.99, 2M (Mistral 65% + Haiku 35%), 160 images (140 Schnell + 20 Dev)
 *    - PRO: $29.99, 4.25M (Mistral 70% + GPT 5.1 30%), 260 images (160 Schnell + 100 Dev)
 *    - APEX: $59.99, 7M (Mistral 45% + Haiku 35% + Sonnet 20%), 290 images (130 Schnell + 160 Dev)
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
  OPENAI = 'openai',
  CLAUDE = 'claude',
  MISTRAL = 'mistral',
  GROQ = 'groq',
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
  'gemini-2.5-flash': 1.5,
  'gemini-2.5-pro': 1.5,
  'gemini-3-pro': 1.5,
  'gpt-5.1': 1.33,
  'gpt-4o': 1.33,
  'gpt-4o-mini': 1.33,
  'claude-haiku-4-5': 1.4,
  'claude-sonnet-4-5': 1.4,
  'mistral-large-3-2512': 1.5,
  'magistral-medium': 1.5,
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
}

// ==========================================
// 💰 MODEL PRICING (USD per 1M tokens)
// ==========================================

export const MODEL_PRICING_USD = {
  'mistral-large-3-2512': {
    input: 2,
    output: 6,
    blended_1_3: 5,
  },
  'claude-haiku-4-5': {
    input: 0.80,
    output: 4,
    blended_1_3: 3.20,
  },
  'gemini-2.0-flash': {
    input: 0.10,
    output: 0.40,
    blended_1_3: 0.325,
  },
  'gemini-2.5-flash': {
    input: 0.15,
    output: 0.60,
    blended_1_3: 0.4875,
  },
  'gemini-2.5-pro': {
    input: 1.25,
    output: 5,
    blended_1_3: 4.0625,
  },
  'gpt-5.1': {
    input: 2.50,
    output: 10,
    blended_1_3: 8.125,
  },
  'claude-sonnet-4-5': {
    input: 3,
    output: 15,
    blended_1_3: 12,
  },
} as const;

// ==========================================
// 🖼️ IMAGE COSTS (INR)
// ==========================================

export const IMAGE_COSTS = {
  schnell: {
    costPerImage: 0.25,
    displayName: 'Flux Schnell',
    internalModel: 'fal-ai/flux/schnell',
    description: 'Fast general image generation',
  },
  klein9b: {
    costPerImage: 1.26,
    displayName: 'Flux Klein 9B',
    internalModel: 'black-forest-labs/FLUX.2-klein-9b',
    description: 'Good quality text & general images',
  },
  nanoBanana: {
    costPerImage: 3.26,
    displayName: 'Nano Banana',
    internalModel: 'nano-banana/image-gen',
    description: 'Premium quality - Deities, Logos, Cards, Posters',
  },
  fluxKontext: {
    costPerImage: 3.35,
    displayName: 'Flux Kontext Pro',
    internalModel: 'flux-kontext/pro',
    description: 'Style transfer - GTA, Anime, Cartoon styles',
  },
} as const;


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
  'mistral-large-3-2512': 104.6,
  'claude-haiku-4-5': 334.8,
  'gemini-2.0-flash': 27.2,
  'gemini-2.5-flash': 40.8,
  'gemini-2.5-pro': 340.0,
  'gpt-5.1': 653.7,
  'claude-sonnet-4-5': 1004.0,
} as const;

// ==========================================
// 🔀 LLM ROUTING CONFIG
// ==========================================

export const LLM_ROUTING_CONFIG = {
  [RoutingTier.SIMPLE]: {
    model: 'mistral-large-3-2512',
    provider: AIProvider.MISTRAL,
    displayName: 'Mistral Large 3',
    fallbackModel: 'gemini-2.0-flash',
  },
  [RoutingTier.CASUAL]: {
    model: 'gemini-2.0-flash',
    provider: AIProvider.GEMINI,
    displayName: 'Gemini 2.0 Flash',
    fallbackModel: 'mistral-large-3-2512',
  },
  [RoutingTier.MEDIUM]: {
    model: 'mistral-large-3-2512',
    provider: AIProvider.MISTRAL,
    displayName: 'Mistral Large 3',
    fallbackModel: 'gemini-2.0-flash',
  },
  [RoutingTier.COMPLEX]: {
    model: 'claude-haiku-4-5',
    provider: AIProvider.CLAUDE,
    displayName: 'Claude Haiku 4.5',
    fallbackModel: 'mistral-large-3-2512',
  },
  [RoutingTier.EXPERT]: {
    model: 'gpt-5.1',
    provider: AIProvider.OPENAI,
    displayName: 'GPT-5.1',
    fallbackModel: 'mistral-large-3-2512',
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
  human: 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
  nonHuman: 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
  text: 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
  deities: 'blocked' | 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
  logos?: 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
  posters?: 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
  cards?: 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
  styleTransfer?: 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
  cartoon?: 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
  anime?: 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
  default: 'klein' | 'schnell' | 'nanoBanana' | 'fluxKontext';
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
  totalTokens: number;
  totalTokensInternational?: number;
  klein9bImages: number;
  klein9bImagesInternational?: number;
  schnellImages?: number;              // 👈 ADD THIS
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

// 🖼️ IMAGE BOOSTER (V2 - 4 Premium Models)
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
    klein: number;
    nanoBanana: number;
    fluxKontext: number;
    total: number;
  };
  imagesInternational: {
    schnell: number;
    klein: number;
    nanoBanana: number;
    fluxKontext: number;
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
  klein9bImages: number;
  nanoBananaImages?: number;
  fluxKontextImages?: number;
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
  klein9bCost: number;
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
    gpt51Tokens?: number;
    gpt51TokensInternational?: number;
    sonnetTokensInternational?: number;
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
        klein9bImages: 0,
        nanoBananaImages: 0,
        fluxKontextImages: 0,
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
        klein9bImages: 0,
        nanoBananaImages: 0,
        fluxKontextImages: 0,
        totalImages: 4,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 💰 PAID LIMITS - INDIA (₹149/month)
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
        klein9bImages: 4,
        nanoBananaImages: 10,
        fluxKontextImages: 2,
        totalImages: 35,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 💰 PAID LIMITS - INTERNATIONAL ($3.99/month)
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
        klein9bImages: 7,
        nanoBananaImages: 21,
        fluxKontextImages: 4,
        totalImages: 70,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 🤖 AI MODELS
    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
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
        modelId: 'mistral-large-3-2512',
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

    routing: { 'mistral-large-3-2512': 0.5, 'gemini-2.0-flash': 0.5 },
    routingInternational: { 'mistral-large-3-2512': 0.5, 'gemini-2.0-flash': 0.5 },
    fallbackModel: undefined,
    fallbackTokens: 0,

    isHybrid: false,
    hasSmartRouting: false,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,
    hasIntentGuard: true,
    intentGuardLevel: 'starter',

    // 🖼️ IMAGE ROUTING
    imageRouting: {
      human: 'schnell',
      nonHuman: 'schnell',
      text: 'schnell',
      deities: 'blocked',
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
      klein9bImages: 0,
      klein9bImagesInternational: 0,
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

    // 🖼️ IMAGE BOOSTER (₹99 / $2.99) - V2 Premium Models
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
        klein: 0,              // Not included
        nanoBanana: 15,        // ₹3.26 × 15 = ₹48.90
        fluxKontext: 5,        // ₹3.35 × 5 = ₹16.75
        total: 45,
      },
      imagesInternational: {
        schnell: 50,           // ₹0.25 × 50 = ₹12.50
        klein: 24,             // ₹1.26 × 24 = ₹30.24
        nanoBanana: 35,        // ₹3.26 × 35 = ₹114.10
        fluxKontext: 10,       // ₹3.35 × 10 = ₹33.50
        total: 119,
      },
      costs: {
        images: 71.90,         // 6.25 + 0 + 48.90 + 16.75
        gateway: 2.34,
        total: 74.24,
        profit: 24.76,
        margin: 25.0,
      },
      costsInternational: {
        images: 190.34,        // 12.50 + 30.24 + 114.10 + 33.50
        gateway: 11.13,
        total: 201.47,
        profit: 69.93,
        margin: 25.8,
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
      model: 'mistral-large-3-2512',
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
      klein9bCost: 0,
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
      klein9bCost: 0,
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

    // 💰 COSTS - PAID INDIA (₹99/month)
    costs: {
      aiCostPrimary: 52.73,
      aiCostFallback: 0,
      aiCostTotal: 52.73,
      klein9bCost: 0,
      schnellCost: 10.00,
      imageCostTotal: 10.00,
      voiceCost: 0,
      cameraCost: 0,
      gatewayCost: 2.34,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      totalCost: 70.07,
      revenue: 99,
      profit: 28.93,
      margin: 29.2,
    },

    // 💰 COSTS - PAID INTERNATIONAL ($2.99/month)
    costsInternational: {
      aiCostPrimary: 117.19,
      aiCostFallback: 0,
      aiCostTotal: 117.19,
      klein9bCost: 0,
      schnellCost: 20.00,
      imageCostTotal: 20.00,
      voiceCost: 0,
      cameraCost: 0,
      gatewayCost: 7.51,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      totalCost: 149.70,
      revenue: 250.26,
      profit: 100.56,
      margin: 40.2,
    },

    // 💳 PAYMENT GATEWAY
    paymentGateway: {
      razorpay: 'plan_starter_monthly',
      stripe: 'price_starter_monthly_usd',
    },
  },
  // ==========================================
// 💡 LITE PLAN (₹149 / $4.99)
// ==========================================
// ==========================================
  // 💡 LITE PLAN (₹199 / $4.99)
  // ==========================================
  // Updated: January 29, 2026
  // India: ₹199, 7L tokens, 65 images (15 Klein + 50 Schnell)
  // Intl: $4.99, 14L tokens, 130 images (30 Klein + 100 Schnell)
  // ==========================================
    // ==========================================
  // 💡 LITE PLAN (₹199 / $4.99)
  // ==========================================
  // Updated: January 29, 2026
  // India: ₹199, 7L tokens, 65 images (15 Klein + 50 Schnell)
  // Intl: $4.99, 14L tokens, 130 images (30 Klein + 100 Schnell)
  // ==========================================
  [PlanType.LITE]: {
    id: PlanType.LITE,
    name: 'lite',
    displayName: 'Soriva Lite',
    displayNameFrontend: 'Soriva Lite',
    tagline: 'Affordable AI with premium images.',
    description: 'Best value AI with Klein images for daily use',
    price: 299,
    priceUSD: 5.99,
    priceYearly: 2990,
    priceYearlyUSD: 59.90,
    yearlyDiscount: 20,
    yearlyDiscountInternational: 17,
    enabled: true,
    order: 2,
    personality: 'Friendly, helpful, efficient',
    bonusTokens: 0,

    // 💰 PAID LIMITS - INDIA (₹299/month)
    limits: {
      monthlyTokens: 980000,
      promptTokenPool: 500000,
      monthlyWords: 653333,
      dailyTokens: 32667,
      dailyWords: 21778,
      botResponseLimit: 4096,
      memoryDays: 5,
      contextMemory: 6,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 28,
        klein9bImages: 5,
        nanoBananaImages: 15,
        fluxKontextImages: 2,
        totalImages: 50,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 💰 PAID LIMITS - INTERNATIONAL ($5.99/month)
    limitsInternational: {
      monthlyTokens: 1960000,
      promptTokenPool: 1000000,
      monthlyWords: 1306667,
      dailyTokens: 65333,
      dailyWords: 43556,
      botResponseLimit: 4096,
      memoryDays: 5,
      contextMemory: 6,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 55,
        klein9bImages: 10,
        nanoBananaImages: 30,
        fluxKontextImages: 5,
        totalImages: 100,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 📅 YEARLY LIMITS - INDIA (10 months tokens, 12 months access)
    limitsYearly: {
      monthlyTokens: 980000,
      promptTokenPool: 500000,
      monthlyWords: 653333,
      dailyTokens: 32667,
      dailyWords: 21778,
      botResponseLimit: 4096,
      memoryDays: 5,
      contextMemory: 6,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 28,
        klein9bImages: 5,
        nanoBananaImages: 15,
        fluxKontextImages: 2,
        totalImages: 50,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 1,
    },

    // 📅 YEARLY LIMITS - INTERNATIONAL
    limitsYearlyInternational: {
      monthlyTokens: 1960000,
      promptTokenPool: 1000000,
      monthlyWords: 1306667,
      dailyTokens: 65333,
      dailyWords: 43556,
      botResponseLimit: 4096,
      memoryDays: 5,
      contextMemory: 6,
      responseDelay: 2,
      voiceMinutes: 0,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.NONE,
      flashFallbackTokens: 0,
      images: {
        schnellImages: 55,
        klein9bImages: 10,
        nanoBananaImages: 30,
        fluxKontextImages: 5,
        totalImages: 100,
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
        modelId: 'mistral-large-3-2512',
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
        modelId: 'mistral-large-3-2512',
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

    routing: { 'mistral-large-3-2512': 0.5, 'gemini-2.0-flash': 0.5 },
    routingYearly: { 'mistral-large-3-2512': 0.5, 'gemini-2.0-flash': 0.5 },
    routingInternational: { 'mistral-large-3-2512': 0.5, 'gemini-2.0-flash': 0.5 },
    routingInternationalYearly: { 'mistral-large-3-2512': 0.5, 'gemini-2.0-flash': 0.5 },
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
      text: 'klein',
      deities: 'blocked',
      logos: 'nanoBanana',
      posters: 'nanoBanana',
      cards: 'nanoBanana',
      styleTransfer: 'fluxKontext',
      cartoon: 'fluxKontext',
      anime: 'fluxKontext',
      default: 'schnell',
    },

    // ⚡ COOLDOWN BOOSTER (₹25 / $0.99)
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Daily Unlock',
      description: 'Aaj ki limit khatam? Daily cap unlock karo.',
      price: 25,
      priceUSD: 0.99,
      tokensUnlocked: 23333,
      tokensUnlockedInternational: 46667,
      wordsUnlocked: 15556,
      wordsUnlockedInternational: 31111,
      duration: 0,
      validityHours: 24,
      validityHoursInternational: 24,
      activationWindow: 24,
      maxPerDay: 1,
      maxPerPlanPeriod: 5,
      resetOn: 'calendar',
      bypassDailyLimit: true,
      useMonthlyPool: false,
      carryForward: false,
      expiryLogic: 'strict_expiry',
      logic: 'Unlocks daily cap for 24 hours.',
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

    // 📦 ADDON BOOSTER (₹69 / $2.49)
    addonBooster: {
      type: 'ADDON',
      name: 'Lite Boost',
      description: 'Extra tokens + images for the week!',
      price: 69,
      priceUSD: 2.49,
      mistralTokens: 300000,
      totalTokens: 300000,
      totalTokensInternational: 700000,
      klein9bImages: 10,
      klein9bImagesInternational: 20,
      schnellImages: 35,
      schnellImagesInternational: 70,
      totalImages: 45,
      totalImagesInternational: 90,
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
        ai: 31.38,
        images: 21.35,
        gateway: 1.63,
        total: 54.36,
        profit: 14.64,
        margin: 21.2,
      },
      costsInternational: {
        ai: 73.22,
        images: 42.70,
        gateway: 6.25,
        total: 122.17,
        profit: 86.20,
        margin: 41.4,
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

    // 🖼️ IMAGE BOOSTER (₹99 / $2.99) - V2 Premium Models
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
        klein: 0,
        nanoBanana: 15,
        fluxKontext: 5,
        total: 45,
      },
      imagesInternational: {
        schnell: 50,
        klein: 24,
        nanoBanana: 35,
        fluxKontext: 10,
        total: 119,
      },
      costs: {
        images: 71.90,
        gateway: 2.34,
        total: 74.24,
        profit: 24.76,
        margin: 25.0,
      },
      costsInternational: {
        images: 190.34,
        gateway: 11.13,
        total: 201.47,
        profit: 69.93,
        margin: 25.8,
      },
    },

    // 📄 DOCUMENTATION
    documentation: {
      enabled: true,
      tier: 'starter' as DocumentIntelligenceTier,
      displayName: 'Smart Docs Lite',
      badge: '📄',
      tagline: 'Basic document tools',
      monthlyCredits: 0,
      monthlyCreditsInternational: 0,
      docAITokens: 200000,
      docAITokensInternational: 400000,
      monthlyWords: 0,
      maxWorkspaces: 2,
      maxFileSizeMB: 15,
      featuresUnlocked: 8,
      model: 'mistral-large-3-2512',
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
      klein9bCost: 18.90,
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
      klein9bCost: 37.80,
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
  [PlanType.PLUS]: {
    id: PlanType.PLUS,
    name: 'plus',
    displayName: 'Soriva Plus',
    displayNameFrontend: 'Soriva Plus',
    tagline: 'Smart AI for everyday brilliance.',
    description: 'Premium AI with voice, images, and intelligent assistance',
    price: 399,
    priceUSD: 9.99,
    priceYearly: 3990,
    priceYearlyUSD: 99.90,
    yearlyDiscount: 17,
    yearlyDiscountInternational: 17,
    enabled: true,
    popular: true,
    hero: true,
    order: 3,
    personality: 'Patient, structured, concept-first, encourages thinking',
    bonusTokens: 50000,

    // 💰 PAID LIMITS - INDIA (₹399/month)
    limits: {
      monthlyTokens: 2100000,
      promptTokenPool: 1000000,
      monthlyWords: 1400000,
      dailyTokens: 70000,
      dailyWords: 46667,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 15,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 41,
        klein9bImages: 8,
        nanoBananaImages: 22,
        fluxKontextImages: 4,
        totalImages: 75,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 📅 YEARLY LIMITS - INDIA (10 months tokens, 12 months access)
    limitsYearly: {
      monthlyTokens: 2100000,
      promptTokenPool: 1000000,
      monthlyWords: 1400000,
      dailyTokens: 70000,
      dailyWords: 46667,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 15,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 41,
        klein9bImages: 8,
        nanoBananaImages: 22,
        fluxKontextImages: 4,
        totalImages: 75,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 1,
    },

    // 💰 PAID LIMITS - INTERNATIONAL ($9.99/month)
    limitsInternational: {
      monthlyTokens: 3120000,
      promptTokenPool: 1500000,
      monthlyWords: 2080000,
      dailyTokens: 104000,
      dailyWords: 69333,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 25,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 82,
        klein9bImages: 15,
        nanoBananaImages: 45,
        fluxKontextImages: 8,
        totalImages: 150,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 📅 YEARLY LIMITS - INTERNATIONAL (10 months tokens, 12 months access)
    limitsYearlyInternational: {
      monthlyTokens: 3120000,
      promptTokenPool: 1500000,
      monthlyWords: 2080000,
      dailyTokens: 104000,
      dailyWords: 69333,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 25,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        schnellImages: 82,
        klein9bImages: 15,
        nanoBananaImages: 45,
        fluxKontextImages: 8,
        totalImages: 150,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 1,
    },

    // 🤖 AI MODELS - INDIA (Mistral 100%)
    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
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

    // 🤖 AI MODELS - INTERNATIONAL (Mistral 39% + Gemini 39% + Haiku 22%)
    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 39,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 39,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.MEDIUM,
        percentage: 22,
      },
    ],

    routing: { 'mistral-large-3-2512': 0.5, 'gemini-2.0-flash': 0.5 },
    routingYearly: { 'mistral-large-3-2512': 0.5, 'gemini-2.0-flash': 0.5 },
    routingInternational: { 'mistral-large-3-2512': 0.39, 'gemini-2.0-flash': 0.39, 'claude-haiku-4-5': 0.22 },
    routingInternationalYearly: { 'mistral-large-3-2512': 0.39, 'gemini-2.0-flash': 0.39, 'claude-haiku-4-5': 0.22 },
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
      text: 'klein',
      deities: 'blocked',
      logos: 'nanoBanana',
      posters: 'nanoBanana',
      cards: 'nanoBanana',
      styleTransfer: 'fluxKontext',
      cartoon: 'fluxKontext',
      anime: 'fluxKontext',
      default: 'schnell',
    },

    // ⚡ COOLDOWN BOOSTER (₹35 / $1.49)
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Extra Session',
      description: 'Aaj ki limit khatam? Daily cap unlock karo.',
      price: 35,
      priceUSD: 1.49,
      tokensUnlocked: 50000,
      tokensUnlockedInternational: 66667,
      wordsUnlocked: 33333,
      wordsUnlockedInternational: 44444,
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
      logic: 'Unlocks daily cap. Uses monthly pool + fallback available.',
      costs: {
        ai: 0,
        gateway: 0.83,
        total: 0.83,
        profit: 34.17,
        margin: 97.6,
      },
      costsInternational: {
        ai: 0,
        gateway: 3.74,
        total: 3.74,
        profit: 120.97,
        margin: 97.0,
      },
    },

    // 📦 ADDON BOOSTER (₹99 / $3.99)
    addonBooster: {
      type: 'ADDON',
      name: 'Plus Boost',
      description: 'Extra tokens + images for the week!',
      price: 99,
      priceUSD: 3.99,
      mistralTokens: 500000,
      totalTokens: 500000,
      totalTokensInternational: 750000,
      klein9bImages: 10,
      klein9bImagesInternational: 20,
      schnellImages: 30,
      schnellImagesInternational: 60,
      totalImages: 40,
      totalImagesInternational: 80,
      dailyBoost: 0,
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted, no daily cap',
      distributionLogic: 'Separate pool, same routing as plan',
      maxPerMonth: 5,
      maxPerMonthInternational: 5,
      queueingAllowed: true,
      separatePool: true,
      costs: {
        ai: 52.30,
        images: 20.10,
        gateway: 2.34,
        total: 74.74,
        profit: 24.26,
        margin: 24.5,
      },
      costsInternational: {
        ai: 131.84,
        images: 40.20,
        gateway: 10.02,
        total: 182.06,
        profit: 151.90,
        margin: 45.5,
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

    // 🖼️ IMAGE BOOSTER (₹99 / $2.99) - V2 Premium Models
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
        klein: 0,
        nanoBanana: 15,
        fluxKontext: 5,
        total: 45,
      },
      imagesInternational: {
        schnell: 50,
        klein: 24,
        nanoBanana: 35,
        fluxKontext: 10,
        total: 119,
      },
      costs: {
        images: 71.90,
        gateway: 2.34,
        total: 74.24,
        profit: 24.76,
        margin: 25.0,
      },
      costsInternational: {
        images: 190.34,
        gateway: 11.13,
        total: 201.47,
        profit: 69.93,
        margin: 25.8,
      },
    },

    // 📄 DOCUMENTATION
    documentation: {
      enabled: true,
      tier: 'standard' as DocumentIntelligenceTier,
      displayName: 'Smart Docs Plus',
      badge: '📄',
      tagline: 'Enhanced document tools',
      monthlyCredits: 0,
      monthlyCreditsInternational: 0,
      docAITokens: 400000,
      docAITokensInternational: 800000,
      monthlyWords: 0,
      maxWorkspaces: 5,
      maxFileSizeMB: 25,
      featuresUnlocked: 10,
      model: 'mistral-large-3-2512',
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

    // 💰 COSTS - INDIA (₹349/month)
    costs: {
      aiCostPrimary: 156.90,
      aiCostFallback: 13.60,
      aiCostTotal: 170.50,
      klein9bCost: 25.20,
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

    // 💰 COSTS - INTERNATIONAL ($9.99/month)
    costsInternational: {
      aiCostPrimary: 421.24,
      aiCostFallback: 13.60,
      aiCostTotal: 365.18,
      klein9bCost: 37.80,
      schnellCost: 25.00,
      imageCostTotal: 62.80,
      voiceCost: 35.50,
      cameraCost: 25.10,
      gatewayCost: 49.56,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 627.80,
      revenue: 836.16,
      profit: 208.36,
      margin: 24.9,
    },

    // 💳 PAYMENT GATEWAY
    paymentGateway: {
      razorpay: 'plan_plus_monthly',
      razorpayYearly: 'plan_plus_yearly',
      stripe: 'price_plus_monthly_usd',
      stripeYearly: 'price_plus_yearly_usd',
    },
  },


  // ==========================================
  // 🚀 PRO PLAN (₹799 / $29.99)
  // ==========================================
  // ==========================================
  // 🚀 PRO PLAN (₹849 / $19.99)
  // ==========================================
  // Updated: January 29, 2026
  // India: ₹849, 20L tokens, 7L prompt pool, 125 images, 30 min voice, 5 min camera
  // Intl: $19.99, 42.5L tokens, 15L prompt pool, 375 images, 60 min voice, 10 min camera
  // ==========================================
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'pro',
    displayName: 'Soriva Pro',
    displayNameFrontend: 'Soriva Pro',
    tagline: 'Command brilliance.',
    description: 'Premium AI with GPT-5.1, advanced images, and full voice suite',
    price: 799,
    priceUSD: 29.99,
    priceYearly: 7990,
    priceYearlyUSD: 299.90,
    yearlyDiscount: 17,
    yearlyDiscountInternational: 17,
    enabled: true,
    order: 4,
    personality: 'Professional, insightful, detailed, analytical',
    bonusTokens: 100000,

    // 💰 PAID LIMITS - INDIA (₹799/month)
    limits: {
      monthlyTokens: 2310000,
      promptTokenPool: 1200000,
      monthlyWords: 1540000,
      dailyTokens: 77000,
      dailyWords: 51333,
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
        klein9bImages: 10,
        nanoBananaImages: 30,
        fluxKontextImages: 5,
        totalImages: 100,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 📅 YEARLY LIMITS - INDIA (10 months tokens, 12 months access)
    limitsYearly: {
      monthlyTokens: 2310000,
      promptTokenPool: 1200000,
      monthlyWords: 1540000,
      dailyTokens: 77000,
      dailyWords: 51333,
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
        klein9bImages: 10,
        nanoBananaImages: 30,
        fluxKontextImages: 5,
        totalImages: 100,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 2,
    },

    // 💰 PAID LIMITS - INTERNATIONAL ($29.99/month)
    limitsInternational: {
      monthlyTokens: 5440000,
      promptTokenPool: 2500000,
      monthlyWords: 3626667,
      dailyTokens: 181333,
      dailyWords: 120889,
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
        klein9bImages: 20,
        nanoBananaImages: 60,
        fluxKontextImages: 10,
        totalImages: 200,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    // 📅 YEARLY LIMITS - INTERNATIONAL (10 months tokens, 12 months access)
    limitsYearlyInternational: {
      monthlyTokens: 5440000,
      promptTokenPool: 2500000,
      monthlyWords: 3626667,
      dailyTokens: 181333,
      dailyWords: 120889,
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
        klein9bImages: 20,
        nanoBananaImages: 60,
        fluxKontextImages: 10,
        totalImages: 200,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 2,
    },

    // 🤖 AI MODELS - INDIA (Mistral 65% + Haiku 35%)
    // 🤖 AI MODELS - INDIA (Mistral 39% + Gemini 39% + Haiku 22%)
    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 39,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 39,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.MEDIUM,
        percentage: 22,
      },
    ],

    // 🤖 AI MODELS - INTERNATIONAL (Mistral 38% + Gemini 38% + GPT 24%)
    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 38,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 38,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 24,
      },
    ],

    routing: { 'mistral-large-3-2512': 0.39, 'gemini-2.0-flash': 0.39, 'claude-haiku-4-5': 0.22 },
    routingYearly: { 'mistral-large-3-2512': 0.39, 'gemini-2.0-flash': 0.39, 'claude-haiku-4-5': 0.22 },
    routingInternational: { 'mistral-large-3-2512': 0.38, 'gemini-2.0-flash': 0.38, 'gpt-5.1': 0.24 },
    routingInternationalYearly: { 'mistral-large-3-2512': 0.38, 'gemini-2.0-flash': 0.38, 'gpt-5.1': 0.24 },
    fallbackModel: 'gemini-2.0-flash',
    fallbackTokens: 500000,

    premiumCap: {
      gpt51TokensInternational: 1275000,
      fallbackModel: 'mistral-large-3-2512',
      safeThreshold: 50000,
    },

    isHybrid: true,
    hasSmartRouting: true,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,
    hasIntentBasedRouting: true,
    hasPremiumCap: true,

    // 🖼️ IMAGE ROUTING
    imageRouting: {
      human: 'schnell',
      nonHuman: 'schnell',
      text: 'klein',
      deities: 'blocked',
      logos: 'nanoBanana',
      posters: 'nanoBanana',
      cards: 'nanoBanana',
      styleTransfer: 'fluxKontext',
      cartoon: 'fluxKontext',
      anime: 'fluxKontext',
      default: 'schnell',
    },

    // ⚡ COOLDOWN BOOSTER (₹45 / $1.99)
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
        gateway: 5.00,
        total: 5.00,
        profit: 161.55,
        margin: 97.0,
      },
    },

    // 📦 ADDON BOOSTER (₹199 / $5.99)
    addonBooster: {
      type: 'ADDON',
      name: 'Pro Boost',
      description: 'Power pack for demanding projects!',
      price: 199,
      priceUSD: 5.99,
      mistralTokens: 500000,
      totalTokens: 500000,
      totalTokensInternational: 1000000,
      klein9bImages: 15,
      klein9bImagesInternational: 25,
      schnellImages: 35,
      schnellImagesInternational: 60,
      totalImages: 50,
      totalImagesInternational: 85,
      dailyBoost: 0,
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted, no daily cap',
      distributionLogic: 'Separate pool, same routing as plan',
      maxPerMonth: 5,
      maxPerMonthInternational: 5,
      queueingAllowed: true,
      separatePool: true,
      costs: {
        ai: 87.90,
        images: 27.65,
        gateway: 4.70,
        total: 120.25,
        profit: 78.75,
        margin: 39.6,
      },
      costsInternational: {
        ai: 198.62,
        images: 46.50,
        gateway: 15.02,
        total: 260.14,
        profit: 241.22,
        margin: 48.1,
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

    // 🖼️ IMAGE BOOSTER (₹99 / $2.99) - V2 Premium Models
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
        klein: 0,
        nanoBanana: 15,
        fluxKontext: 5,
        total: 45,
      },
      imagesInternational: {
        schnell: 50,
        klein: 24,
        nanoBanana: 35,
        fluxKontext: 10,
        total: 119,
      },
      costs: {
        images: 71.90,
        gateway: 2.34,
        total: 74.24,
        profit: 24.76,
        margin: 25.0,
      },
      costsInternational: {
        images: 190.34,
        gateway: 11.13,
        total: 201.47,
        profit: 69.93,
        margin: 25.8,
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
      model: 'mistral-large-3-2512',
      modelPremium: 'claude-haiku-4-5',
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
      premiumCap: true,
    },

    // 💰 COSTS - INDIA (₹849/month)
    costs: {
      aiCostPrimary: 301.75,
      aiCostFallback: 13.60,
      aiCostTotal: 315.35,
      klein9bCost: 63.00,
      schnellCost: 18.75,
      imageCostTotal: 81.75,
      voiceCost: 42.60,
      cameraCost: 25.20,
      gatewayCost: 20.04,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 504.94,
      revenue: 849,
      profit: 344.06,
      margin: 40.5,
    },

    // 💰 COSTS - INTERNATIONAL ($19.99/month)
    costsInternational: {
      aiCostPrimary: 703.11,
      aiCostFallback: 13.60,
      aiCostTotal: 716.71,
      klein9bCost: 189.00,
      schnellCost: 56.25,
      imageCostTotal: 245.25,
      voiceCost: 85.20,
      cameraCost: 50.20,
      gatewayCost: 50.19,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 1167.55,
      revenue: 1673.16,
      profit: 505.61,
      margin: 30.2,
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
  [PlanType.APEX]: {
    id: PlanType.APEX,
    name: 'apex',
    displayName: 'Soriva Apex',
    tagline: 'Unleash the extraordinary.',
    description: 'Ultimate AI with GPT 5.1, Claude Sonnet, maximum tokens, and full creative suite',
    price: 1599,
    priceUSD: 59.99,
    priceYearly: 15990,
    priceYearlyUSD: 599.90,
    yearlyDiscount: 17,
    yearlyDiscountInternational: 17,
    enabled: true,
    order: 5,
    personality: 'Elite, comprehensive, visionary, emotionally intelligent',
    bonusTokens: 150000,

    // ──────────────────────────────────────
    // USAGE LIMITS - INDIA
    // 44.6L tokens (Mistral 15.93L + Gemini 15.93L + Haiku 8.56L + GPT 4.18L)
    // Images: 150 (Schnell 82 + Klein 15 + Nano 45 + Flux 8)
    // Voice: 60 min, Camera: 25 min
    // Margin: 22%
    // ──────────────────────────────────────
    limits: {
      monthlyTokens: 4460000,
      promptTokenPool: 2200000,
      monthlyWords: 2973333,
      dailyTokens: 148667,
      dailyWords: 99111,
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
        klein9bImages: 15,
        nanoBananaImages: 45,
        fluxKontextImages: 8,
        totalImages: 150,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsYearly: {
      monthlyTokens: 4460000,
      promptTokenPool: 2200000,
      monthlyWords: 2973333,
      dailyTokens: 148667,
      dailyWords: 99111,
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
        klein9bImages: 15,
        nanoBananaImages: 45,
        fluxKontextImages: 8,
        totalImages: 150,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 75,
      carryForwardMaxMonths: 2,
    },

    // ──────────────────────────────────────
    // USAGE LIMITS - INTERNATIONAL
    // 78L tokens (Mistral 22.06L + Gemini 22.06L + Haiku 17.15L + GPT 7L + Sonnet 9.8L)
    // Images: 300 (Schnell 165 + Klein 30 + Nano 90 + Flux 15)
    // Voice: 90 min, Camera: 35 min
    // Margin: 39%
    // ──────────────────────────────────────
    limitsInternational: {
      monthlyTokens: 7800000,
      promptTokenPool: 4000000,
      monthlyWords: 5200000,
      dailyTokens: 260000,
      dailyWords: 173333,
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
        klein9bImages: 30,
        nanoBananaImages: 90,
        fluxKontextImages: 15,
        totalImages: 300,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsYearlyInternational: {
      monthlyTokens: 7800000,
      promptTokenPool: 4000000,
      monthlyWords: 5200000,
      dailyTokens: 260000,
      dailyWords: 173333,
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
        klein9bImages: 30,
        nanoBananaImages: 90,
        fluxKontextImages: 15,
        totalImages: 300,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 75,
      carryForwardMaxMonths: 2,
    },

    // ──────────────────────────────────────
    // AI MODELS - INDIA (3 Models with GPT 5.1)
    // Mistral Large 3: 55.5% (22.75L)
    // Claude Haiku 4.5: 29.9% (12.25L)
    // GPT 5.1: 14.6% (6L)
    // ──────────────────────────────────────
    // ──────────────────────────────────────
    // AI MODELS - INDIA (Mistral 36% + Gemini 36% + Haiku 19% + GPT 9%)
    // Mistral: 15.93L, Gemini: 15.93L, Haiku: 8.56L, GPT: 4.18L
    // ──────────────────────────────────────
    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 36,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 36,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.MEDIUM,
        percentage: 19,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT 5.1',
        tier: RoutingTier.EXPERT,
        percentage: 9,
      },
    ],

    // ──────────────────────────────────────
    // AI MODELS - INTERNATIONAL (Mistral 28% + Gemini 28% + Haiku 22% + GPT 9% + Sonnet 13%)
    // Mistral: 22.06L, Gemini: 22.06L, Haiku: 17.15L, GPT: 7L, Sonnet: 9.8L
    // ──────────────────────────────────────
    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.COMPLEX,
        percentage: 28,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash',
        displayName: 'Gemini Flash 2.0',
        tier: RoutingTier.SIMPLE,
        percentage: 28,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.MEDIUM,
        percentage: 22,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT 5.1',
        tier: RoutingTier.EXPERT,
        percentage: 9,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4-5',
        displayName: 'Claude Sonnet 4.5',
        tier: RoutingTier.EXPERT,
        percentage: 13,
      },
    ],

    routing: { 'mistral-large-3-2512': 0.36, 'gemini-2.0-flash': 0.36, 'claude-haiku-4-5': 0.19, 'gpt-5.1': 0.09 },
    routingYearly: { 'mistral-large-3-2512': 0.36, 'gemini-2.0-flash': 0.36, 'claude-haiku-4-5': 0.19, 'gpt-5.1': 0.09 },
    routingInternational: { 'mistral-large-3-2512': 0.28, 'gemini-2.0-flash': 0.28, 'claude-haiku-4-5': 0.22, 'gpt-5.1': 0.09, 'claude-sonnet-4-5': 0.13 },
    routingInternationalYearly: { 'mistral-large-3-2512': 0.28, 'gemini-2.0-flash': 0.28, 'claude-haiku-4-5': 0.22, 'gpt-5.1': 0.09, 'claude-sonnet-4-5': 0.13 },
    fallbackModel: 'gemini-2.0-flash',
    fallbackTokens: 500000,

    premiumCap: {
      sonnetTokensInternational: 1400000,
      fallbackModel: 'claude-haiku-4-5',
      safeThreshold: 100000,
    },

    orchestration: {
      enabled: true,
      multiDomainChain: {
        IN: ['mistral-large-3-2512', 'claude-haiku-4-5', 'gpt-5.1'],
        INTL: ['mistral-large-3-2512', 'claude-haiku-4-5', 'claude-sonnet-4-5', 'gpt-5.1'],
      },
      creativeChain: {
        IN: ['gpt-5.1', 'claude-haiku-4-5'],
        INTL: ['claude-sonnet-4-5', 'gpt-5.1', 'claude-haiku-4-5'],
      },
      creativeChainProbability: 30,
    },

    isHybrid: true,
    hasSmartRouting: true,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,
    hasIntentBasedRouting: true,
    hasPremiumCap: true,
    hasMultiModelOrchestration: true,
    hasCreativeChaining: true,

    // ──────────────────────────────────────
    // COOLDOWN BOOSTER (KEPT)
    // India: ₹49, International: $4.99
    // ──────────────────────────────────────
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
        gateway: 37.37,
        total: 37.37,
        profit: 380.25,
        margin: 91.1,
      },
    },

    // ──────────────────────────────────────
    // ADDON BOOSTER - REMOVED (not needed for APEX)
    // ──────────────────────────────────────

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

    // 🖼️ IMAGE BOOSTER (₹99 / $2.99) - V2 Premium Models
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
        klein: 0,
        nanoBanana: 15,
        fluxKontext: 5,
        total: 45,
      },
      imagesInternational: {
        schnell: 50,
        klein: 24,
        nanoBanana: 35,
        fluxKontext: 10,
        total: 119,
      },
      costs: {
        images: 71.90,
        gateway: 2.34,
        total: 74.24,
        profit: 24.76,
        margin: 25.0,
      },
      costsInternational: {
        images: 190.34,
        gateway: 11.13,
        total: 201.47,
        profit: 69.93,
        margin: 25.8,
      },
    },

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
      model: 'mistral-large-3-2512',
      modelPremium: 'claude-haiku-4-5',
      modelExpert: { IN: 'gpt-5.1', INTL: 'claude-sonnet-4-5' },
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
      premiumCap: true,
      multiModelOrchestration: true,
      creativeChaining: true,
    },

    // ──────────────────────────────────────
    // COSTS - INDIA (₹1,799)
    // AI: Mistral ₹238 + Haiku ₹183.70 + GPT 5.1 ₹460 + Fallback ₹13.60 = ₹895.30
    // Margin: 19.8%
    // ──────────────────────────────────────
    costs: {
      aiCostPrimary: 881.70,           // Mistral + Haiku + GPT 5.1
      aiCostFallback: 13.60,
      aiCostTotal: 895.30,
      klein9bCost: 126.00,             // 100 × ₹1.26
      schnellCost: 37.50,              // 150 × ₹0.25
      imageCostTotal: 163.50,          // 126.00 + 37.50
      voiceCost: 56.80,                // 40 × ₹1.42
      cameraCost: 37.80,               // 7.5 × ₹5.04
      gatewayCost: 42.46,              // 2.36%
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 1442.26,              // 895.30 + 163.50 + 56.80 + 37.80 + 42.46 + 20
      revenue: 1799,
      profit: 356.74,
      margin: 19.8,
    },

    // ──────────────────────────────────────
    // COSTS - INTERNATIONAL ($69.99)
    // AI: Mistral ₹330 + Haiku ₹367.50 + Sonnet ₹1625 + GPT 5.1 ₹766.50 + Fallback ₹13.60 = ₹3102.60
    // Margin: 30.5%
    // ──────────────────────────────────────
    costsInternational: {
      aiCostPrimary: 3089.00,          // Mistral + Haiku + Sonnet + GPT 5.1
      aiCostFallback: 13.60,
      aiCostTotal: 3102.60,
      klein9bCost: 252.00,             // 200 × ₹1.26
      schnellCost: 87.50,              // 350 × ₹0.25
      imageCostTotal: 339.50,          // 252.00 + 87.50
      voiceCost: 113.60,               // 80 × ₹1.42
      cameraCost: 75.30,               // 15 × ₹5.02
      gatewayCost: 199.89,             // 3.4%
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 4084.39,              // 3102.60 + 339.50 + 113.60 + 75.30 + 199.89 + 20
      revenue: 5879.16,                // $69.99 × ₹84
      profit: 1794.77,
      margin: 30.5,
    },

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
        klein9bImages: 999999,
        nanoBananaImages: 999999,
        fluxKontextImages: 999999,
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
        klein9bImages: 999999,
        nanoBananaImages: 999999,
        fluxKontextImages: 999999,
        totalImages: 999999,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

   aiModels: [
      { provider: AIProvider.MISTRAL, modelId: 'mistral-large-3-2512', displayName: 'Mistral Large 3', tier: RoutingTier.COMPLEX, percentage: 20 },
      { provider: AIProvider.GEMINI, modelId: 'gemini-2.0-flash', displayName: 'Gemini Flash 2.0', tier: RoutingTier.SIMPLE, percentage: 20 },
      { provider: AIProvider.CLAUDE, modelId: 'claude-haiku-4-5', displayName: 'Claude Haiku 4.5', tier: RoutingTier.MEDIUM, percentage: 20 },
      { provider: AIProvider.CLAUDE, modelId: 'claude-sonnet-4-5', displayName: 'Claude Sonnet 4.5', tier: RoutingTier.EXPERT, percentage: 20 },
      { provider: AIProvider.OPENAI, modelId: 'gpt-5.1', displayName: 'GPT-5.1', tier: RoutingTier.EXPERT, percentage: 20 },
    ],

    aiModelsInternational: [
      { provider: AIProvider.MISTRAL, modelId: 'mistral-large-3-2512', displayName: 'Mistral Large 3', tier: RoutingTier.COMPLEX, percentage: 20 },
      { provider: AIProvider.GEMINI, modelId: 'gemini-2.0-flash', displayName: 'Gemini Flash 2.0', tier: RoutingTier.SIMPLE, percentage: 20 },
      { provider: AIProvider.CLAUDE, modelId: 'claude-haiku-4-5', displayName: 'Claude Haiku 4.5', tier: RoutingTier.MEDIUM, percentage: 20 },
      { provider: AIProvider.CLAUDE, modelId: 'claude-sonnet-4-5', displayName: 'Claude Sonnet 4.5', tier: RoutingTier.EXPERT, percentage: 20 },
      { provider: AIProvider.OPENAI, modelId: 'gpt-5.1', displayName: 'GPT-5.1', tier: RoutingTier.EXPERT, percentage: 20 },
    ],

routing: { 'mistral-large-3-2512': 0.20, 'claude-haiku-4-5': 0.20, 'claude-sonnet-4-5': 0.20, 'gpt-5.1': 0.20, 'gemini-2.0-flash': 0.20 },
routingInternational: { 'mistral-large-3-2512': 0.20, 'claude-haiku-4-5': 0.20, 'claude-sonnet-4-5': 0.20, 'gpt-5.1': 0.20, 'gemini-2.0-flash': 0.20 },
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
      model: 'claude-sonnet-4-5',
      modelPremium: 'gpt-5.1',
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
      text: 'klein',
      deities: 'blocked',
      logos: 'nanoBanana',
      posters: 'nanoBanana',
      cards: 'nanoBanana',
      styleTransfer: 'fluxKontext',
      cartoon: 'fluxKontext',
      anime: 'fluxKontext',
      default: 'schnell',
    },

    costs: {
      aiCostPrimary: 0, aiCostFallback: 0, aiCostTotal: 0,
      klein9bCost: 0, schnellCost: 0, imageCostTotal: 0,
      voiceCost: 0, cameraCost: 0, gatewayCost: 0,
      infraCostPerUser: 0, totalCost: 0, revenue: 0, profit: 0, margin: 100,
    },

    costsInternational: {
      aiCostPrimary: 0, aiCostFallback: 0, aiCostTotal: 0,
      klein9bCost: 0, schnellCost: 0, imageCostTotal: 0,
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
// 🖼️ IMAGE HELPERS
// ==========================================

export function calculateKleinCost(klein9bCount: number): number {
  return klein9bCount * IMAGE_COSTS.klein9b.costPerImage;
}

export function calculateSchnellCost(schnellCount: number): number {
  return schnellCount * IMAGE_COSTS.schnell.costPerImage;
}

export function calculateTotalImageCost(klein9bCount: number, schnellCount: number): number {
  return calculateKleinCost(klein9bCount) + calculateSchnellCost(schnellCount);
}

// Legacy function for backward compatibility
export function calculateImageCost(klein9bCount: number): number {
  return klein9bCount * IMAGE_COSTS.klein9b.costPerImage;
}

export function getImageLimits(planType: PlanType, region: Region = Region.INDIA): ImageLimits {
  const plan = PLANS_STATIC_CONFIG[planType];
  const limits = region === Region.INDIA ? plan.limits : (plan.limitsInternational || plan.limits);
  return limits.images;
}