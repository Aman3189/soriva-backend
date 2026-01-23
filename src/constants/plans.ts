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
 * │ Starter   │ Free     │ Free         │
 * │ Lite      │ ₹149     │ $4.99        │
 * │ Plus      │ ₹299     │ $9.99        │
 * │ Pro       │ ₹799     │ $29.99       │
 * │ Apex      │ ₹1,299   │ $59.99       │
 * └───────────┴──────────┴──────────────┘
 *
 * ==========================================
 * TOKEN ALLOCATION:
 * ==========================================
 * ┌───────────┬────────────┬──────────────┐
 * │ Plan      │ India      │ International│
 * ├───────────┼────────────┼──────────────┤
 * │ Starter   │ 150K       │ 150K         │
 * │ Lite      │ 500K       │ 1M           │
 * │ Plus      │ 1.25M      │ 2M           │
 * │ Pro       │ 2M         │ 4.25M        │
 * │ Apex      │ 3.5M       │ 7M           │
 * └───────────┴────────────┴──────────────┘
 *
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
  DEEPSEEK = 'deepseek',
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
export const USD_TO_INR_RATE = 83.7;

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
  'deepseek-v3': 1.6,
  'deepseek-r1': 1.6,
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
  klein9b: {
    costPerImage: 1.26,
    displayName: 'Flux Klein 9B',
    internalModel: 'black-forest-labs/FLUX.2-klein-9b',
    description: 'High quality AI image generation',
  },
    schnell: {
    costPerImage: 0.25,
    displayName: 'Flux Schnell',
    internalModel: 'fal-ai/flux/schnell',
    description: 'Fast general image generation',
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

export interface ImageLimits {
  klein9bImages: number;
  schnellImages: number;
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
  trial?: TrialConfig;
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
  [PlanType.STARTER]: {
    id: PlanType.STARTER,
    name: 'starter',
    displayName: 'Soriva Daily',
    tagline: 'Your everyday AI companion.',
    description: 'Free AI chat powered by Mistral Large 3',
    price: 0,
    priceUSD: 0,
    enabled: true,
    order: 1,
    personality: 'Friendly, casual, quick helper',
    bonusTokens: 0,

    limits: {
    monthlyTokens: 150000,
    promptTokenPool: 100_000,  // 1 Lakh (loss leader)
    monthlyWords: 100000,
    dailyTokens: 5000,
    dailyWords: 3333,
    dailyMessageCap: 20,
    botResponseLimit: 4096,
    memoryDays: 3,
    contextMemory: 5,
    responseDelay: 2,
    voiceMinutes: 0,
    cameraMinutes: 0,
    voiceTechnology: VoiceTechnology.NONE,
    flashFallbackTokens: 0,
    images: {
      klein9bImages: 1,
      schnellImages: 4,
      totalImages: 5,
      talkingPhotos: 0,
      logoPreview: 0,
      logoPurchase: 0,
    },
  },

  limitsInternational: {
    monthlyTokens: 150000,
    monthlyWords: 100000,
    dailyTokens: 5000,
    dailyWords: 3333,
    dailyMessageCap: 20,
    botResponseLimit: 4096,
    memoryDays: 3,
    contextMemory: 5,
    responseDelay: 2,
    voiceMinutes: 0,
    cameraMinutes: 0,
    voiceTechnology: VoiceTechnology.NONE,
    flashFallbackTokens: 0,
    images: {
      klein9bImages: 1,
      schnellImages: 4,
      totalImages: 5,
      talkingPhotos: 0,
      logoPreview: 0,
      logoPurchase: 0,
    },
  },

    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.SIMPLE,
        percentage: 100,
      },
    ],

    routing: { 'mistral-large-3-2512': 1.0 },
    routingInternational: { 'mistral-large-3-2512': 1.0 },
    fallbackModel: undefined,
    fallbackTokens: 0,

    isHybrid: false,
    hasSmartRouting: false,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,
    hasIntentGuard: true,
    intentGuardLevel: 'starter',

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Daily Unlock',
      description: 'Continue chatting today using your monthly tokens',
      price: 9,
      priceUSD: 0,
      tokensUnlocked: 0,
      wordsUnlocked: 0,
      tokensUnlockedInternational: 0,
      wordsUnlockedInternational: 0,
      duration: 0,
      validityHours: 24,
      validityHoursInternational: 24,
      activationWindow: 24,
      maxPerDay: 1,
      maxPerPlanPeriod: 1,
      resetOn: 'daily',
      bypassDailyLimit: true,
      useMonthlyPool: true,
      carryForward: false,
      expiryLogic: 'strict_expiry',
      logic: 'Resets daily cap, user continues with monthly pool tokens',
      costs: {
        ai: 0,
        gateway: 0.21,
        total: 0.21,
        profit: 8.79,
        margin: 97.7,
      },
      costsInternational: {
        ai: 0,
        gateway: 0,
        total: 0,
        profit: 0,
        margin: 0,
      },
    },

    addonBooster: {
      type: 'ADDON',
      name: 'Starter Boost',
      description: 'Extra tokens + images - separate pool!',
      price: 49,
      priceUSD: 1,
      mistralTokens: 300000,
      totalTokens: 300000,
      totalTokensInternational: 300000,
      klein9bImages: 25,
      klein9bImagesInternational: 25,
      totalImages: 25,
      totalImagesInternational: 25,
      dailyBoost: 42857,
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted',
      distributionLogic: 'Separate pool, no daily cap while active',
      maxPerMonth: 5,
      maxPerMonthInternational: 5,
      queueingAllowed: false,
      separatePool: true,
      costs: {
        ai: 31.38,
        images: 31.50,            // 25 × ₹1.26
        gateway: 1.16,
        total: 64.04,
        profit: -15.04,
        margin: -30.7,
      },
      costsInternational: {
        ai: 31.38,
        images: 31.50,            // 25 × ₹1.26
        gateway: 25.37,
        total: 88.25,
        profit: -4.55,
        margin: -5.4,
      },
    },

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
      model: 'mistral-large-3-2512',
      exportFormats: ['pdf', 'markdown'],
      templates: true,
      templatesCount: 9,
      templateCategories: [
        'cover-letter-classic',
        'cover-letter-minimal',
        'email-formal-professional',
        'email-formal-thank-you',
        'essay-narrative',
        'essay-descriptive',
        'invoice-standard',
        'resume-basic',
        'letter-formal-cover',
      ],
      versionHistory: 0,
      collaboration: false,
    },

    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: false,
      prioritySupport: false,
      smartRouting: false,
      multiModel: false,
      voice: false,
      camera: false,
      intentGuard: true,
    },

    costs: {
      aiCostPrimary: 17.58,      // 150K Mistral (was 31.38)
      aiCostFallback: 0,
      aiCostTotal: 17.58,
      klein9bCost: 1.26,          // 1 × ₹1.26
      schnellCost: 1.00,          // 4 × ₹0.25
      imageCostTotal: 2.26,       // was 6.30
      voiceCost: 0,
      cameraCost: 0,
      gatewayCost: 0,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      totalCost: 24.84,           // was 42.68
      revenue: 0,
      profit: -24.84,             // was -42.68
      margin: -100,
    },

    costsInternational: {
      aiCostPrimary: 17.58,
      aiCostFallback: 0,
      aiCostTotal: 17.58,
      klein9bCost: 1.26,
      schnellCost: 1.00,
      imageCostTotal: 2.26,
      voiceCost: 0,
      cameraCost: 0,
      gatewayCost: 0,
      infraCostPerUser: INFRASTRUCTURE_COSTS.starter,
      totalCost: 24.84,
      revenue: 0,
      profit: -24.84,
      margin: -100,
    },
  },
  // ==========================================
// 💡 LITE PLAN (₹149 / $4.99)
// ==========================================
[PlanType.LITE]: {
  id: PlanType.LITE,
  name: 'lite',
  displayName: 'Soriva Lite',
  displayNameFrontend: 'Soriva Lite',
  tagline: 'Cheapest AI for everyone.',
  description: 'Affordable AI with images for daily use',
  price: 149,
  priceUSD: 4.99,
  priceYearly: 1399,
  priceYearlyUSD: 49.99,
  yearlyDiscount: 22,
  yearlyDiscountInternational: 17,
  enabled: true,
  order: 2,
  personality: 'Friendly, helpful, efficient',
  bonusTokens: 0,

  limits: {
    monthlyTokens: 500000,
    promptTokenPool: 200_000,  // 2 Lakh
    monthlyWords: 333333,
    dailyTokens: 16667,
    dailyWords: 11111,
    dailyMessageCap: 50,
    botResponseLimit: 4096,
    memoryDays: 5,
    contextMemory: 6,
    responseDelay: 2,
    voiceMinutes: 0,
    cameraMinutes: 0,
    voiceTechnology: VoiceTechnology.NONE,
    flashFallbackTokens: 0,
    images: {
      klein9bImages: 20,
      schnellImages: 25,
      totalImages: 45,
      talkingPhotos: 0,
      logoPreview: 0,
      logoPurchase: 0,
    },
  },

  limitsInternational: {
    monthlyTokens: 1000000,
    monthlyWords: 666667,
    dailyTokens: 33333,
    dailyWords: 22222,
    dailyMessageCap: 75,
    botResponseLimit: 4096,
    memoryDays: 5,
    contextMemory: 6,
    responseDelay: 2,
    voiceMinutes: 0,
    cameraMinutes: 0,
    voiceTechnology: VoiceTechnology.NONE,
    flashFallbackTokens: 0,
    images: {
      klein9bImages: 30,
      schnellImages: 45,
      totalImages: 75,
      talkingPhotos: 0,
      logoPreview: 0,
      logoPurchase: 0,
    },
  },

  aiModels: [
    {
      provider: AIProvider.MISTRAL,
      modelId: 'mistral-large-3-2512',
      displayName: 'Mistral Large 3',
      tier: RoutingTier.SIMPLE,
      percentage: 100,
    },
  ],

  aiModelsInternational: [
    {
      provider: AIProvider.MISTRAL,
      modelId: 'mistral-large-3-2512',
      displayName: 'Mistral Large 3',
      tier: RoutingTier.SIMPLE,
      percentage: 100,
    },
  ],

  routing: { 'mistral-large-3-2512': 1.0 },
  routingYearly: { 'mistral-large-3-2512': 1.0 },
  routingInternational: { 'mistral-large-3-2512': 1.0 },
  routingInternationalYearly: { 'mistral-large-3-2512': 1.0 },
  fallbackModel: undefined,
  fallbackTokens: 0,

  isHybrid: false,
  hasSmartRouting: false,
  hasDynamicDailyLimits: true,
  tokenExpiryEnabled: true,

  documentation: {
    enabled: true,
    tier: 'starter' as DocumentIntelligenceTier,
    displayName: 'Smart Docs Lite',
    badge: '📄',
    tagline: 'Basic document tools',
    monthlyCredits: 40,
    monthlyCreditsInternational: 60,
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

  costs: {
    aiCostPrimary: 58.59,
    aiCostFallback: 0,
    aiCostTotal: 58.59,
    klein9bCost: 25.20,
    schnellCost: 6.25,
    imageCostTotal: 31.45,
    voiceCost: 0,
    cameraCost: 0,
    gatewayCost: 3.52,
    infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
    totalCost: 113.56,
    revenue: 149,
    profit: 35.44,
    margin: 23.8,
  },

  costsInternational: {
    aiCostPrimary: 117.18,
    aiCostFallback: 0,
    aiCostTotal: 117.18,
    klein9bCost: 37.80,
    schnellCost: 11.25,
    imageCostTotal: 49.05,
    voiceCost: 0,
    cameraCost: 0,
    gatewayCost: 37.11,
    infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
    totalCost: 223.34,
    revenue: 417.66,
    profit: 194.32,
    margin: 46.5,
  },

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
  [PlanType.PLUS]: {
    id: PlanType.PLUS,
    name: 'plus',
    displayName: 'Soriva Plus',
    tagline: 'Smart AI for everyday brilliance.',
    description: 'Premium AI with voice, images, and intelligent assistance',
    price: 299,
    priceUSD: 9.99,
    priceYearly: 2990,
    priceYearlyUSD: 99.99,
    yearlyDiscount: 17,
    yearlyDiscountInternational: 17,
    enabled: true,
    popular: true,
    hero: true,
    order: 3,
    personality: 'Patient, structured, concept-first, encourages thinking',
    bonusTokens: 50000,

    limits: {
      monthlyTokens: 1250000,
      promptTokenPool: 300_000,  // 5 Lakh
      monthlyWords: 833333,
      dailyTokens: 41667,
      dailyWords: 27778,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 15,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 30,
        schnellImages: 45,
        totalImages: 75,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsYearly: {
      monthlyTokens: 1145833,
      monthlyWords: 763889,
      dailyTokens: 38194,
      dailyWords: 25463,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 15,
      cameraMinutes: 0,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 30,
        schnellImages: 45,
        totalImages: 75,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 1,
    },

    limitsInternational: {
      monthlyTokens: 2000000,
      monthlyWords: 1333333,
      dailyTokens: 66667,
      dailyWords: 44444,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 40,
      cameraMinutes: 6,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 65,
        schnellImages: 100,
        totalImages: 165,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsYearlyInternational: {
      monthlyTokens: 1833333,
      monthlyWords: 1222222,
      dailyTokens: 61111,
      dailyWords: 40741,
      botResponseLimit: 4096,
      memoryDays: 7,
      contextMemory: 8,
      responseDelay: 2,
      voiceMinutes: 40,
      cameraMinutes: 6,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 65,
        schnellImages: 100,
        totalImages: 165,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 1,
    },

    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.MEDIUM,
        percentage: 100,
      },
    ],

    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.MEDIUM,
        percentage: 65,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.MEDIUM,
        percentage: 35,
      },
    ],

    routing: { 'mistral-large-3-2512': 1.0 },
    routingYearly: { 'mistral-large-3-2512': 1.0 },
    routingInternational: { 'mistral-large-3-2512': 0.65, 'claude-haiku-4-5': 0.35 },
    routingInternationalYearly: { 'mistral-large-3-2512': 0.65, 'claude-haiku-4-5': 0.35 },
    fallbackModel: 'gemini-2.0-flash',
    fallbackTokens: 500000,

    isHybrid: false,
    hasSmartRouting: false,
    hasDynamicDailyLimits: true,
    tokenExpiryEnabled: true,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Extra Session',
      description: 'Aaj ki limit khatam? Ek aur session unlock karo.',
      price: 29,
      priceUSD: 2.99,
      tokensUnlocked: 41667,
      tokensUnlockedInternational: 66667,
      wordsUnlocked: 27778,
      wordsUnlockedInternational: 44444,
      isExtraInternational: false,
      validityHours: 24,
      validityHoursInternational: 24,
      activationWindow: 24,
      carryForward: false,
      expiryLogic: 'strict_expiry',
      logic: 'Unlocks 1 extra daily quota. Must be used same day.',
      duration: 0,
      maxPerPlanPeriod: 5,
      resetOn: 'calendar',
      costs: {
        ai: 0,
        gateway: 0.68,
        total: 0.68,
        profit: 28.32,
        margin: 97.6,
      },
      costsInternational: {
        ai: 0,
        gateway: 32.54,
        total: 32.54,
        profit: 217.65,
        margin: 87.0,
      },
    },

    addonBooster: {
      type: 'ADDON',
      name: 'Plus Boost',
      description: 'Extra tokens + images for the week!',
      price: 79,
      priceUSD: 2.99,
      mistralTokens: 500000,
      totalTokens: 500000,
      totalTokensInternational: 500000,
      klein9bImages: 5,
      schnellImages: 20,
      klein9bImagesInternational: 25,
      totalImages: 25,
      totalImagesInternational: 25,
      dailyBoost: 71429,
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted',
      distributionLogic: 'Separate pool, same routing as plan',
      maxPerMonth: 3,
      maxPerMonthInternational: 3,
      queueingAllowed: true,
      separatePool: true,
      costs: {
        ai: 52.30,
        images: 11.30,            // 25 × ₹1.26
        gateway: 1.86,
        total: 65.46,
        profit: 13.54,
        margin: 17.1,
      },
      costsInternational: {
        ai: 52.30,
        images: 31.50,            // 25 × ₹1.26
        gateway: 32.54,
        total: 116.34,
        profit: 133.89,
        margin: 53.5,
      },
    },

    documentation: {
      enabled: true,
      tier: 'standard' as DocumentIntelligenceTier,
      displayName: 'Smart Docs Plus',
      badge: '📄',
      tagline: 'Enhanced document tools',
      monthlyCredits: 50,
      monthlyCreditsInternational: 100,
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

    features: {
      studio: true,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: false,
      smartRouting: false,
      multiModel: true,
      voice: true,
      camera: true,
    },

    costs: {
      aiCostPrimary: 130.75,
      aiCostFallback: 13.60,
      aiCostTotal: 144.35,
      klein9bCost: 37.80,         // 30 × ₹1.26
      schnellCost: 11.25,         // 45 × ₹0.25
      imageCostTotal: 49.05,      // 37.80 + 11.25
      voiceCost: 21.30,           // 15 × ₹1.42
      cameraCost: 0,              // 0 min
      gatewayCost: 7.06,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 241.76,          // 144.35 + 49.05 + 21.30 + 7.06 + 20
      revenue: 299,
      profit: 57.24,
      margin: 19.1,
    },

    costsInternational: {
      aiCostPrimary: 370.40,
      aiCostFallback: 13.60,
      aiCostTotal: 384.00,
      klein9bCost: 81.90,         // 65 × ₹1.26
      schnellCost: 25.00,         // 100 × ₹0.25
      imageCostTotal: 106.90,     // 81.90 + 25.00
      voiceCost: 56.80,           // 40 × ₹1.42
      cameraCost: 30.12,          // 6 × ₹5.02
      gatewayCost: 49.56,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 647.38,          // 384 + 106.90 + 56.80 + 30.12 + 49.56 + 20
      revenue: 836.16,
      profit: 188.78,
      margin: 22.6,
    },

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
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'pro',
    displayName: 'Soriva Pro',
    tagline: 'Command brilliance.',
    description: 'Premium AI with GPT-5.1, advanced images, and full voice suite',
    price: 799,
    priceUSD: 29.99,
    priceYearly: 7990,
    priceYearlyUSD: 299.99,
    yearlyDiscount: 17,
    yearlyDiscountInternational: 17,
    enabled: true,
    order: 4,
    personality: 'Professional, insightful, detailed, analytical',
    bonusTokens: 100000,

    limits: {
      monthlyTokens: 2000000,
      monthlyWords: 1333333,
      dailyTokens: 66667,
      dailyWords: 44444,
      botResponseLimit: 4096,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 1.5,
      voiceMinutes: 30,
      cameraMinutes: 5,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 50,
        schnellImages: 75,
        totalImages: 125,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsYearly: {
      monthlyTokens: 1833333,
      promptTokenPool: 500_000,  // 5 Lakh
      monthlyWords: 1222222,
      dailyTokens: 61111,
      dailyWords: 40741,
      botResponseLimit: 4096,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 1.5,
      voiceMinutes: 30,
      cameraMinutes: 5,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 50,
        schnellImages: 75,
        totalImages: 125,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 2,
    },

    limitsInternational: {
      monthlyTokens: 4250000,
      monthlyWords: 2833333,
      dailyTokens: 141667,
      dailyWords: 94444,
      botResponseLimit: 4096,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 1.5,
      voiceMinutes: 60,
      cameraMinutes: 10,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 150,
        schnellImages: 225,
        totalImages: 375,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsYearlyInternational: {
      monthlyTokens: 3895833,
      monthlyWords: 2597222,
      dailyTokens: 129861,
      dailyWords: 86574,
      botResponseLimit: 4096,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 1.5,
      voiceMinutes: 60,
      cameraMinutes: 10,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 150,
        schnellImages: 225,
        totalImages: 375,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 50,
      carryForwardMaxMonths: 2,
    },

    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.MEDIUM,
        percentage: 65,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.COMPLEX,
        percentage: 35,
      },
    ],

    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.MEDIUM,
        percentage: 70,
      },
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 30,
      },
    ],

    routing: { 'mistral-large-3-2512': 0.65, 'claude-haiku-4-5': 0.35 },
    routingYearly: { 'mistral-large-3-2512': 0.65, 'claude-haiku-4-5': 0.35 },
    routingInternational: { 'mistral-large-3-2512': 0.70, 'gpt-5.1': 0.30 },
    routingInternationalYearly: { 'mistral-large-3-2512': 0.70, 'gpt-5.1': 0.30 },
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

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Pro Session',
      description: 'Unlock another day of Pro-level access.',
      price: 39,
      priceUSD: 3.99,
      tokensUnlocked: 66667,
      tokensUnlockedInternational: 141667,
      wordsUnlocked: 44444,
      wordsUnlockedInternational: 94444,
      isExtraInternational: false,
      validityHours: 24,
      validityHoursInternational: 24,
      activationWindow: 24,
      carryForward: false,
      expiryLogic: 'strict_expiry',
      logic: 'Unlocks 1 extra daily quota. Must be used same day.',
      duration: 0,
      maxPerPlanPeriod: 10,
      resetOn: 'calendar',
      costs: {
        ai: 0,
        gateway: 0.92,
        total: 0.92,
        profit: 38.08,
        margin: 97.6,
      },
      costsInternational: {
        ai: 0,
        gateway: 35.21,
        total: 35.21,
        profit: 298.70,
        margin: 89.5,
      },
    },

    addonBooster: {
      type: 'ADDON',
      name: 'Pro Boost',
      description: 'Power pack for demanding projects!',
      price: 199,
      priceUSD: 5.99,
      mistralTokens: 750000,
      totalTokens: 750000,
      totalTokensInternational: 1000000,
      klein9bImages: 20,
      schnellImages: 25,
      klein9bImagesInternational: 15,
      schnellImagesInternational: 50,
      totalImages: 45,
      totalImagesInternational: 65,
      dailyBoost: 107143,
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted',
      distributionLogic: 'Separate pool, same routing as plan',
      maxPerMonth: 4,
      maxPerMonthInternational: 4,
      queueingAllowed: true,
      separatePool: true,
      costs: {
        ai: 78.45,
        images: 31.50,            // 25 × ₹1.26
        gateway: 4.70,
        total: 114.65,
        profit: 84.35,
        margin: 42.4,
      },
      costsInternational: {
        ai: 104.60,
        images: 31.50,            // 25 × ₹1.26
        gateway: 39.84,
        total: 175.94,
        profit: 325.45,
        margin: 64.9,
      },
    },

    documentation: {
      enabled: true,
      tier: 'pro' as DocumentIntelligenceTier,
      displayName: 'Smart Docs Pro',
      badge: '⚡',
      tagline: 'Professional document intelligence',
      monthlyCredits: 100,
      monthlyCreditsInternational: 200,
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

    costs: {
      aiCostPrimary: 370.40,
      aiCostFallback: 13.60,
      aiCostTotal: 384.00,
      klein9bCost: 63.00,         // 50 × ₹1.26
      schnellCost: 18.75,         // 75 × ₹0.25
      imageCostTotal: 81.75,      // 63.00 + 18.75
      voiceCost: 42.60,           // 30 × ₹1.42
      cameraCost: 25.20,          // 5 × ₹5.04
      gatewayCost: 18.86,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 572.41,          // 384 + 81.75 + 42.60 + 25.20 + 18.86 + 20
      revenue: 799,
      profit: 226.59,
      margin: 28.4,
    },

    costsInternational: {
      aiCostPrimary: 1144.00,
      aiCostFallback: 13.60,
      aiCostTotal: 1157.60,
      klein9bCost: 189.00,        // 150 × ₹1.26
      schnellCost: 56.25,         // 225 × ₹0.25
      imageCostTotal: 245.25,     // 189 + 56.25
      voiceCost: 85.20,           // 60 × ₹1.42
      cameraCost: 50.20,          // 10 × ₹5.02
      gatewayCost: 98.04,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 1696.29,         // 1157.60 + 245.25 + 85.20 + 50.20 + 98.04 + 60
      revenue: 2509.16,
      profit: 812.87,
      margin: 32.4,
    },

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
    description: 'Ultimate AI with Claude Sonnet, maximum tokens, and full creative suite',
    price: 1299,
    priceUSD: 59.99,
    priceYearly: 12990,
    priceYearlyUSD: 599.99,
    yearlyDiscount: 17,
    yearlyDiscountInternational: 17,
    enabled: true,
    order: 5,
    personality: 'Elite, comprehensive, visionary, emotionally intelligent',
    bonusTokens: 150000,

    limits: {
      monthlyTokens: 3500000,
      promptTokenPool: 750_000,  // 5 Lakh
      monthlyWords: 2333333,
      dailyTokens: 116667,
      dailyWords: 77778,
      botResponseLimit: 8192,
      memoryDays: 30,
      contextMemory: 15,
      responseDelay: 1,
      voiceMinutes: 40,
      cameraMinutes: 7.5,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 80,
        schnellImages: 120,
        totalImages: 200,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsYearly: {
      monthlyTokens: 3208333,
      monthlyWords: 2138889,
      dailyTokens: 106944,
      dailyWords: 71296,
      botResponseLimit: 8192,
      memoryDays: 30,
      contextMemory: 15,
      responseDelay: 1,
      voiceMinutes: 40,
      cameraMinutes: 7.5,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 80,
        schnellImages: 120,
        totalImages: 200,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 75,
      carryForwardMaxMonths: 2,
    },

    limitsInternational: {
      monthlyTokens: 7000000,
      monthlyWords: 4666667,
      dailyTokens: 233333,
      dailyWords: 155556,
      botResponseLimit: 8192,
      memoryDays: 30,
      contextMemory: 15,
      responseDelay: 1,
      voiceMinutes: 80,
      cameraMinutes: 15,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 190,
        schnellImages: 285,
        totalImages: 475,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsYearlyInternational: {
      monthlyTokens: 6416667,
      monthlyWords: 4277778,
      dailyTokens: 213889,
      dailyWords: 142593,
      botResponseLimit: 8192,
      memoryDays: 30,
      contextMemory: 15,
      responseDelay: 1,
      voiceMinutes: 80,
      cameraMinutes: 15,
      voiceTechnology: VoiceTechnology.ONAIR,
      flashFallbackTokens: 500000,
      images: {
        klein9bImages: 190,
        schnellImages: 285,
        totalImages: 475,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
      carryForward: true,
      carryForwardPercent: 75,
      carryForwardMaxMonths: 2,
    },

    aiModels: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.MEDIUM,
        percentage: 65,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.COMPLEX,
        percentage: 35,
      },
    ],

    aiModelsInternational: [
      {
        provider: AIProvider.MISTRAL,
        modelId: 'mistral-large-3-2512',
        displayName: 'Mistral Large 3',
        tier: RoutingTier.MEDIUM,
        percentage: 45,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-haiku-4-5',
        displayName: 'Claude Haiku 4.5',
        tier: RoutingTier.COMPLEX,
        percentage: 35,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4-5',
        displayName: 'Claude Sonnet 4.5',
        tier: RoutingTier.EXPERT,
        percentage: 20,
      },
    ],

    routing: { 'mistral-large-3-2512': 0.65, 'claude-haiku-4-5': 0.35 },
    routingYearly: { 'mistral-large-3-2512': 0.65, 'claude-haiku-4-5': 0.35 },
    routingInternational: { 'mistral-large-3-2512': 0.45, 'claude-haiku-4-5': 0.35, 'claude-sonnet-4-5': 0.20 },
    routingInternationalYearly: { 'mistral-large-3-2512': 0.45, 'claude-haiku-4-5': 0.35, 'claude-sonnet-4-5': 0.20 },
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
        IN: ['mistral-large-3-2512', 'claude-haiku-4-5'],
        INTL: ['mistral-large-3-2512', 'claude-haiku-4-5', 'claude-sonnet-4-5'],
      },
      creativeChain: {
        IN: ['mistral-large-3-2512', 'claude-haiku-4-5'],
        INTL: ['claude-sonnet-4-5', 'claude-haiku-4-5'],
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

    addonBooster: {
      type: 'ADDON',
      name: 'Apex Boost',
      description: 'Ultimate power pack for demanding projects!',
      price: 299,
      priceUSD: 9.99,
      mistralTokens: 1000000,
      totalTokens: 1000000,
      totalTokensInternational: 1500000,
      klein9bImages: 25,
      klein9bImagesInternational: 20,
      schnellImages: 45,
      schnellImagesInternational: 70,
      totalImages: 70,
      totalImagesInternational: 90,
      dailyBoost: 142857,
      validity: 7,
      validityInternational: 7,
      validityLogic: '7 days or until exhausted',
      distributionLogic: 'Separate pool, same routing as plan',
      maxPerMonth: 5,
      maxPerMonthInternational: 5,
      queueingAllowed: true,
      separatePool: true,
      costs: {
        ai: 104.60,
        images: 31.50,            // 25 × ₹1.26
        gateway: 7.06,
        total: 143.16,
        profit: 155.84,
        margin: 52.1,
      },
      costsInternational: {
        ai: 156.90,
        images: 31.50,            // 25 × ₹1.26
        gateway: 49.63,
        total: 238.03,
        profit: 598.09,
        margin: 71.5,
      },
    },
    documentation: {
      enabled: true,
      tier: 'apex' as DocumentIntelligenceTier,
      displayName: 'Apex Intelligence Suite',
      badge: '👑',
      tagline: 'Business + Emotional Intelligence',
      monthlyCredits: 200,
      monthlyCreditsInternational: 400,
      monthlyWords: 0,
      maxWorkspaces: 25,
      maxFileSizeMB: 100,
      featuresUnlocked: 25,
      model: 'mistral-large-3-2512',
      modelPremium: 'claude-haiku-4-5',
      modelExpert: { IN: 'claude-haiku-4-5', INTL: 'claude-sonnet-4-5' },
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

    costs: {
      aiCostPrimary: 648.10,
      aiCostFallback: 13.60,
      aiCostTotal: 661.70,
      klein9bCost: 100.80,        // 80 × ₹1.26
      schnellCost: 30.00,         // 120 × ₹0.25
      imageCostTotal: 130.80,     // 100.80 + 30.00
      voiceCost: 56.80,           // 40 × ₹1.42
      cameraCost: 37.80,          // 7.5 × ₹5.04
      gatewayCost: 30.66,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 937.76,          // 661.70 + 130.80 + 56.80 + 37.80 + 30.66 + 20
      revenue: 1299,
      profit: 361.24,
      margin: 27.8,
    },

    costsInternational: {
      aiCostPrimary: 2556.00,
      aiCostFallback: 13.60,
      aiCostTotal: 2569.60,
      klein9bCost: 239.40,        // 190 × ₹1.26
      schnellCost: 71.25,         // 285 × ₹0.25
      imageCostTotal: 310.65,     // 239.40 + 71.25
      voiceCost: 113.60,          // 80 × ₹1.42
      cameraCost: 75.30,          // 15 × ₹5.02
      gatewayCost: 171.07,
      infraCostPerUser: INFRASTRUCTURE_COSTS.paid,
      totalCost: 3260.22,         // 2569.60 + 310.65 + 113.60 + 75.30 + 171.07 + 20
      revenue: 5020.76,
      profit: 1760.54,
      margin: 35.1,
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
        klein9bImages: 999999,
        schnellImages: 999999,
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
        klein9bImages: 999999,
        schnellImages: 999999,
        totalImages: 999999,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    aiModels: [
      { provider: AIProvider.MISTRAL, modelId: 'mistral-large-3-2512', displayName: 'Mistral Large 3', tier: RoutingTier.MEDIUM, percentage: 20 },
      { provider: AIProvider.CLAUDE, modelId: 'claude-haiku-4-5', displayName: 'Claude Haiku 4.5', tier: RoutingTier.COMPLEX, percentage: 20 },
      { provider: AIProvider.CLAUDE, modelId: 'claude-sonnet-4-5', displayName: 'Claude Sonnet 4.5', tier: RoutingTier.EXPERT, percentage: 20 },
      { provider: AIProvider.OPENAI, modelId: 'gpt-5.1', displayName: 'GPT-5.1', tier: RoutingTier.EXPERT, percentage: 20 },
      { provider: AIProvider.GEMINI, modelId: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', tier: RoutingTier.CASUAL, percentage: 20 },
    ],

    routing: { 'mistral-large-3-2512': 0.20, 'claude-haiku-4-5': 0.20, 'claude-sonnet-4-5': 0.20, 'gpt-5.1': 0.20, 'gemini-2.0-flash': 0.20 },
    routingInternational: { 'mistral-large-3-2512': 0.20, 'claude-haiku-4-5': 0.20, 'claude-sonnet-4-5': 0.20, 'gpt-5.1': 0.20, 'gemini-2.0-flash': 0.20 },
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