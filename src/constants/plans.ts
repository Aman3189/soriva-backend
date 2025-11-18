// src/constants/plans.ts

/**
 * ==========================================
 * SORIVA BACKEND - PLANS CONFIGURATION DATA
 * ==========================================
 * Pure data & type definitions for Soriva plans
 * Last Updated: November 16, 2025 - FINAL PRODUCTION VERSION
 *
 * MAJOR UPDATES:
 * ✅ TOKEN CAPPING: Primary tracking via tokens (backend)
 * ✅ WORD CONVERSION: For internal planning calculations
 * ✅ 3X TOKENS: All PAID plans get 3x tokens (Starter unchanged)
 * ✅ SMART ROUTING: Quality-focused AI distribution
 * ✅ OPTIMIZED COSTS: Balanced quality + profitability
 * ✅ CLEAN LINEUP: 5 models (Gemma, Haiku, Sonnet, Gemini Pro, GPT-5.1)
 * ✅ 85% WARNING: User notification at 85% usage threshold
 *
 * ROUTING DISTRIBUTION:
 * STARTER: 100% Gemma
 * PLUS: 30% Gemma, 40% Haiku, 20% Gemini Pro, 10% Sonnet
 * PRO: 25% Gemma, 20% Haiku, 40% Gemini Pro, 10% Sonnet, 5% GPT-5.1
 * EDGE: 15% Gemma, 25% Haiku, 25% Gemini Pro, 35% Sonnet
 * LIFE: 10% Gemma, 15% Haiku, 20% Sonnet, 30% Gemini Pro, 25% GPT-5.1
 *
 * PRICING STRATEGY:
 * - India (IN): ₹149 Plus, ₹399 Pro, ₹999 Edge, ₹1199 Life
 * - International: $5.99 Plus, $16.99 Pro, $39.99 Edge, $49.99 Life
 * 
 * LAUNCH PHASES:
 * Phase 1 (NOW): Starter, Plus, Pro (enabled: true)
 * Phase 2 (FUTURE): Edge, Life (enabled: false)
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
export const USD_TO_INR_RATE = 83.67;

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

export const TOKEN_RATIOS = {
  'gemini-2.5-flash-lite': {  // ✅ NEW
    english: 1.3,
    hinglish: 1.5,
    average: 1.5,
  },
  'claude-3-haiku-20240307': {
    english: 1.2,
    hinglish: 1.3,
    average: 1.3,
  },
  'claude-sonnet-4-20250514': {  // ✅ Updated version
    english: 1.4,
    hinglish: 1.6,
    average: 1.6,
  },
  'gemini-2.5-pro': {
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

export const LLM_ROUTING_CONFIG = {
  [RoutingTier.CASUAL]: {
  model: 'gemini-2.5-flash-lite',  // ✅ NEW
  provider: AIProvider.GEMINI,  // ✅ NEW
  displayName: 'Gemini Flash Lite',
  tokenRatio: 1.5,
  costPerTokenInput: 0.075,
  costPerTokenOutput: 0.30,
},
  [RoutingTier.SIMPLE]: {
    model: 'claude-3-haiku-20240307',
    provider: AIProvider.CLAUDE,
    displayName: 'Claude 3 Haiku',
    tokenRatio: 1.3,
    costPerTokenInput: 4.25,
    costPerTokenOutput: 6.80,
  },
  [RoutingTier.MEDIUM]: {
    model: 'gemini-2.5-pro',
    provider: AIProvider.GEMINI,
    displayName: 'Gemini 2.5 Pro',
    tokenRatio: 1.5,
    costPerTokenInput: 6.37,
    costPerTokenOutput: 17.0,
  },
  [RoutingTier.COMPLEX]: {
    model: 'claude-sonnet-3.5',
    provider: AIProvider.CLAUDE,
    displayName: 'Claude Sonnet 3.5',
    tokenRatio: 1.6,
    costPerTokenInput: 42.0,
    costPerTokenOutput: 67.0,
  },
  [RoutingTier.EXPERT]: {
    model: 'gpt-5.1',
    provider: AIProvider.OPENAI,
    displayName: 'GPT-5.1',
    tokenRatio: 1.5,
    costPerTokenInput: 104.59,
    costPerTokenOutput: 836.70,
  },
} as const;

export { PlanType, BoosterCategory, planTypeToName };

// ==========================================
// INTERFACES
// ==========================================

export interface AIModel {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  tier?: RoutingTier;
  percentage?: number;
  fallback?: boolean;
  tokenRatio?: number;
  costPerTokenInput?: number;
  costPerTokenOutput?: number;
}

export interface TrialConfig {
  enabled: boolean;
  durationDays: number;
  totalTokens: number;
  totalWords: number;
  dailyTokens: number;
  dailyWords: number;
}

export interface CooldownBooster {
  type: 'COOLDOWN';
  name: string;
  price: number;
  tokensUnlocked: number;
  wordsUnlocked: number;
  duration: number;
  maxPerPlanPeriod: number;
  resetOn: 'plan_renewal' | 'calendar';
  progressiveMultipliers: number[];
  eligibilityCheck: {
    requiresWordsRemaining: number;
  };
  costs: {
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
}

export interface AddonBooster {
  type: 'ADDON';
  name: string;
  price: number;
  tokensAdded: number;
  wordsAdded: number;
  creditsAdded?: number;
  validity: number;
  distributionLogic: string;
  maxPerMonth: number;
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
  aiCostTotal: number;
  studioCostTotal: number;
  gatewayCost: number;
  infraCostPerUser: number;
  totalCost: number;
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
  aiModels: AIModel[];
  isHybrid: boolean;
  hasSmartRouting: boolean;
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
    description: 'Free forever - Fast AI chat with Gemma 2-9B',
    price: 0,
    priceUSD: 0,
    enabled: true,
    order: 1,
    personality: 'Friendly, casual, quick helper',

    limits: {
      monthlyTokens: 60000,
      monthlyWords: 45000,
      dailyTokens: 2000,
      dailyWords: 1500,
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

    aiModels: [
      {
        provider: AIProvider.GEMINI,      
        modelId: 'gemini-2.5-flash-lite',
        displayName: 'Gemini Flash',
        percentage: 100,              
        tokenRatio: 1.5,
        costPerTokenInput: 0.075,
        costPerTokenOutput: 0.30,
      },
    ],
    isHybrid: false,
    hasSmartRouting: false,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Instant Unlock',
      price: 5,
      tokensUnlocked: 15000,
      wordsUnlocked: 10000,
      duration: 0,
      maxPerPlanPeriod: 3,
      resetOn: 'calendar',
      progressiveMultipliers: [1, 1, 1],
      eligibilityCheck: {
        requiresWordsRemaining: 0,
      },
      costs: {
        gateway: 0.12,
        total: 0.12,
        profit: 4.88,
        margin: 97.6,
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
      aiCostTotal: 0.05,
      studioCostTotal: 0,
      gatewayCost: 0,
      infraCostPerUser: 2.0,
      totalCost: 2.05,
      profit: -2.05,
      margin: -100,
    },
  },

  [PlanType.PLUS]: {
    id: PlanType.PLUS,
    name: 'plus',
    displayName: 'Soriva Plus',
    tagline: 'Elevate. Effortlessly.',
    description: 'Smart AI routing + 270K words + 65 AI images',
    price: 149,
    priceUSD: 5.99,
    enabled: true,
    popular: true,
    hero: true,
    order: 2,
    personality: 'Versatile, productivity-oriented, balanced',

    limits: {
      monthlyTokens: 351000,
      monthlyWords: 270000,
      dailyTokens: 11700,
      dailyWords: 9000,
      botResponseLimit: 150,
      memoryDays: 10,
      contextMemory: 10,
      responseDelay: 3,
      studioCredits: 420,
      studio: {
        images: 65,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsInternational: {
      monthlyTokens: 1053000,
      monthlyWords: 810000,
      dailyTokens: 35100,
      dailyWords: 27000,
      botResponseLimit: 150,
      memoryDays: 10,
      contextMemory: 10,
      responseDelay: 3,
      studioCredits: 1260,
      studio: {
        images: 195,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    aiModels: [
  {
    provider: AIProvider.GEMINI,       // ✅ Google (was Groq)
    modelId: 'gemini-2.5-flash-lite',      // ✅ Flash (was Gemma)
    displayName: 'Gemini Flash',
    tier: RoutingTier.CASUAL,
    percentage: 30,
    tokenRatio: 1.5,
  },
  {
    provider: AIProvider.CLAUDE,
    modelId: 'claude-3-haiku-20240307',
    displayName: 'Claude 3 Haiku',
    tier: RoutingTier.SIMPLE,
    percentage: 50,
    tokenRatio: 1.3,
  },
  {
    provider: AIProvider.GEMINI,
    modelId: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    tier: RoutingTier.MEDIUM,
    percentage: 20,
    tokenRatio: 1.5,
  },
],
    isHybrid: false,
    hasSmartRouting: true,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Plus Cooldown',
      price: 15,
      tokensUnlocked: 9000,
      wordsUnlocked: 7000,
      duration: 0,
      maxPerPlanPeriod: 3,
      resetOn: 'plan_renewal',
      progressiveMultipliers: [1, 1, 1],
      eligibilityCheck: {
        requiresWordsRemaining: 0,
      },
      costs: {
        gateway: 0.35,
        total: 0.35,
        profit: 14.65,
        margin: 97.7,
      },
    },

    addonBooster: {
      type: 'ADDON',
      name: 'Plus Power Boost',
      price: 69,
      tokensAdded: 90000,
      wordsAdded: 70000,
      validity: 10,
      distributionLogic: 'Dynamic: 90K tokens ÷ 10 days = 9K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 3.99,
        gateway: 1.63,
        total: 5.62,
        profit: 63.38,
        margin: 91.9,
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

    costs: {
      aiCostTotal: 3.99,
      studioCostTotal: 14.3,
      gatewayCost: 3.52,
      infraCostPerUser: 3.0,
      totalCost: 24.81,
      profit: 124.19,
      margin: 83.3,
    },

    costsInternational: {
      aiCostTotal: 11.96,
      studioCostTotal: 42.9,
      gatewayCost: 11.82,
      infraCostPerUser: 3.0,
      totalCost: 69.68,
      profit: 431.32,
      margin: 86.1,
    },

    paymentGateway: {
      cashfree: 'cf_plus_monthly',
      razorpay: 'plan_plus_monthly',
      stripe: 'price_plus_monthly_usd',
    },
  },

  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'pro',
    displayName: 'Soriva Pro',
    tagline: 'Command brilliance.',
    description: 'Smart AI + 675K words + Full Studio + GPT-5.1',
    price: 399,
    priceUSD: 16.99,
    enabled: true,
    order: 3,
    personality: 'Professional, insightful, detailed',

    limits: {
      monthlyTokens: 1012500,
      monthlyWords: 675000,
      dailyTokens: 33750,
      dailyWords: 22500,
      botResponseLimit: 300,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 2.5,
      studioCredits: 850,
      studio: {
        images: 40,
        talkingPhotos: 8,
        logoPreview: 5,
        logoPurchase: 2,
      },
    },

    limitsInternational: {
      monthlyTokens: 3037500,
      monthlyWords: 2025000,
      dailyTokens: 101250,
      dailyWords: 67500,
      botResponseLimit: 300,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 2.5,
      studioCredits: 2550,
      studio: {
        images: 120,
        talkingPhotos: 24,
        logoPreview: 15,
        logoPurchase: 6,
      },
    },

    aiModels: [
  {
    provider: AIProvider.GEMINI,       // ✅ Google (was Groq)
    modelId: 'gemini-2.5-flash-lite',      // ✅ Flash (was Gemma)
    displayName: 'Gemini Flash',
    tier: RoutingTier.CASUAL,
    percentage: 10,
  },
  {
    provider: AIProvider.CLAUDE,
    modelId: 'claude-3-haiku-20240307',
    displayName: 'Claude 3 Haiku',
    tier: RoutingTier.SIMPLE,
    percentage: 20,
  },
  {
    provider: AIProvider.GEMINI,
    modelId: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    tier: RoutingTier.MEDIUM,
    percentage: 35,
  },
  
    {
    provider: AIProvider.CLAUDE,
    modelId: 'claude-sonnet-4-20250514',      // ✅ Claude 4 Sonnet (latest)
    displayName: 'Claude Sonnet 4.5',          // ✅ Correct!
    tier: RoutingTier.COMPLEX,
    percentage: 30,
  },
  {
    provider: AIProvider.OPENAI,
    modelId: 'gpt-5.1',
    displayName: 'GPT-5.1',
    tier: RoutingTier.EXPERT,
    percentage: 5,
  },
],
    isHybrid: false,
    hasSmartRouting: true,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Pro Cooldown',
      price: 25,
      tokensUnlocked: 22500,
      wordsUnlocked: 15000,
      duration: 0,
      maxPerPlanPeriod: 3,
      resetOn: 'plan_renewal',
      progressiveMultipliers: [1, 1, 1],
      eligibilityCheck: {
        requiresWordsRemaining: 0,
      },
      costs: {
        gateway: 0.59,
        total: 0.59,
        profit: 24.41,
        margin: 97.6,
      },
    },

    addonBooster: {
      type: 'ADDON',
      name: 'Pro Power Boost',
      price: 129,
      tokensAdded: 180000,
      wordsAdded: 120000,
      validity: 10,
      distributionLogic: 'Dynamic: 180K tokens ÷ 10 days = 18K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 44.28,
        gateway: 3.04,
        total: 47.32,
        profit: 81.68,
        margin: 63.3,
      },
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

    costs: {
      aiCostTotal: 44.28,
      studioCostTotal: 26.5,
      gatewayCost: 9.42,
      infraCostPerUser: 5.0,
      totalCost: 85.20,
      profit: 313.80,
      margin: 78.6,
    },

    costsInternational: {
      aiCostTotal: 132.83,
      studioCostTotal: 79.5,
      gatewayCost: 33.56,
      infraCostPerUser: 5.0,
      totalCost: 250.89,
      profit: 1170.11,
      margin: 82.3,
    },

    paymentGateway: {
      cashfree: 'cf_pro_monthly',
      razorpay: 'plan_pro_monthly',
      stripe: 'price_pro_monthly_usd',
    },
  },

  [PlanType.EDGE]: {
    id: PlanType.EDGE,
    name: 'edge',
    displayName: 'Soriva Edge',
    tagline: 'Where precision meets purpose.',
    description: 'Smart AI + 750K words + Business Intelligence',
    price: 999,
    priceUSD: 39.99,
    enabled: false,
    order: 4,
    personality: 'Consulting-grade mentor, precision-focused',

    limits: {
      monthlyTokens: 1200000,
      monthlyWords: 750000,
      dailyTokens: 40000,
      dailyWords: 25000,
      botResponseLimit: 500,
      memoryDays: 25,
      contextMemory: 15,
      responseDelay: 2,
      studio: {
        images: 0,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsInternational: {
      monthlyTokens: 3600000,
      monthlyWords: 2250000,
      dailyTokens: 120000,
      dailyWords: 75000,
      botResponseLimit: 500,
      memoryDays: 25,
      contextMemory: 15,
      responseDelay: 2,
      studio: {
        images: 0,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    aiModels: [
      {
        provider: AIProvider.GEMINI,       // ✅ Google (was Groq)
        modelId: 'gemini-2.5-flash-lite',      // ✅ Flash (was Gemma)
        displayName: 'Gemini Flash',
        tier: RoutingTier.CASUAL,
        percentage: 15,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-3-haiku-20240307',
        displayName: 'Claude 3 Haiku',
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
      provider: AIProvider.CLAUDE,
      modelId: 'claude-sonnet-4-20250514',      // ✅ Claude 4 Sonnet (latest)
      displayName: 'Claude Sonnet 4.5',          // ✅ Correct!
      tier: RoutingTier.COMPLEX,
      percentage: 35,
    }
    ],
    isHybrid: false,
    hasSmartRouting: true,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Edge Cooldown',
      price: 35,
      tokensUnlocked: 25000,
      wordsUnlocked: 16000,
      duration: 0,
      maxPerPlanPeriod: 3,
      resetOn: 'plan_renewal',
      progressiveMultipliers: [1, 1, 1],
      eligibilityCheck: {
        requiresWordsRemaining: 0,
      },
      costs: {
        gateway: 0.83,
        total: 0.83,
        profit: 34.17,
        margin: 97.6,
      },
    },

    addonBooster: {
      type: 'ADDON',
      name: 'Edge Power Boost',
      price: 199,
      tokensAdded: 240000,
      wordsAdded: 150000,
      validity: 10,
      distributionLogic: 'Dynamic: 240K tokens ÷ 10 days = 24K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 31.09,
        gateway: 4.70,
        total: 35.79,
        profit: 163.21,
        margin: 82.0,
      },
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
        voiceToAction: false,
      },
    },

    features: {
      studio: false,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
      smartRouting: true,
      multiModel: true,
    },

    costs: {
      aiCostTotal: 31.09,
      studioCostTotal: 0,
      gatewayCost: 23.58,
      infraCostPerUser: 5.0,
      totalCost: 59.67,
      profit: 939.33,
      margin: 94.0,
    },

    costsInternational: {
      aiCostTotal: 93.26,
      studioCostTotal: 0,
      gatewayCost: 79.15,
      infraCostPerUser: 5.0,
      totalCost: 177.41,
      profit: 3168.59,
      margin: 94.7,
    },

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
    description: 'Smart AI + 900K words + Emotional Intelligence',
    price: 1199,
    priceUSD: 49.99,
    enabled: false,
    order: 5,
    personality: 'Premium companion with emotional depth',

    limits: {
      monthlyTokens: 1350000,
      monthlyWords: 900000,
      dailyTokens: 45000,
      dailyWords: 30000,
      botResponseLimit: 500,
      memoryDays: 30,
      contextMemory: 20,
      responseDelay: 1.5,
      studio: {
        images: 0,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    limitsInternational: {
      monthlyTokens: 4050000,
      monthlyWords: 2700000,
      dailyTokens: 135000,
      dailyWords: 90000,
      botResponseLimit: 500,
      memoryDays: 30,
      contextMemory: 20,
      responseDelay: 1.5,
      studio: {
        images: 0,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
      },
    },

    aiModels: [
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-3-haiku-20240307',
        displayName: 'Claude 3 Haiku',
        tier: RoutingTier.SIMPLE,
        percentage: 20,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        tier: RoutingTier.MEDIUM,
        percentage: 30,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4-20250514',      // ✅ Claude 4 Sonnet (latest)
        displayName: 'Claude Sonnet 4.5',          // ✅ Correct!
        tier: RoutingTier.COMPLEX,
        percentage: 35,
      },
            {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5.1',
        displayName: 'GPT-5.1',
        tier: RoutingTier.EXPERT,
        percentage: 15,
      },
    ],
    isHybrid: false,
    hasSmartRouting: true,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Life Cooldown',
      price: 35,
      tokensUnlocked: 30000,
      wordsUnlocked: 20000,
      duration: 0,
      maxPerPlanPeriod: 3,
      resetOn: 'plan_renewal',
      progressiveMultipliers: [1, 1, 1],
      eligibilityCheck: {
        requiresWordsRemaining: 0,
      },
      costs: {
        gateway: 0.83,
        total: 0.83,
        profit: 34.17,
        margin: 97.6,
      },
    },

    addonBooster: {
      type: 'ADDON',
      name: 'Life Power Boost',
      price: 249,
      tokensAdded: 300000,
      wordsAdded: 200000,
      validity: 10,
      distributionLogic: 'Dynamic: 300K tokens ÷ 10 days = 30K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 34.25,
        gateway: 5.88,
        total: 40.13,
        profit: 208.87,
        margin: 83.9,
      },
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
        handwritingEmotionReader: false,
      },
    },

    features: {
      studio: false,
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
      smartRouting: true,
      multiModel: true,
    },

    costs: {
      aiCostTotal: 154.13,
      studioCostTotal: 0,
      gatewayCost: 28.30,
      infraCostPerUser: 5.0,
      totalCost: 187.43,
      profit: 1011.57,
      margin: 84.4,
    },

    costsInternational: {
      aiCostTotal: 462.38,
      studioCostTotal: 0,
      gatewayCost: 98.98,
      infraCostPerUser: 5.0,
      totalCost: 566.36,
      profit: 3616.64,
      margin: 86.5,
    },

    paymentGateway: {
      cashfree: 'cf_life_monthly',
      razorpay: 'plan_life_monthly',
      stripe: 'price_life_monthly_usd',
    },
  },
};

// ==========================================
// CONSTANTS
// ==========================================

export const GATEWAY_FEE_PERCENTAGE = 2.36;
export const HINGLISH_TOKEN_SAVINGS = 0.5;
export const COOLDOWN_DURATION_HOURS = 0;
export const COOLDOWN_MAX_PER_PERIOD = 3;
export const ADDON_MAX_PER_MONTH = 2;
export const TRIAL_MAX_DAYS = 14;
export const FALLBACK_TRIGGER_RATE = 0.5;
export const USAGE_WARNING_THRESHOLD = 85;

export const USAGE_MULTIPLIER_INTERNATIONAL = 3.0;
export const STUDIO_CREDITS_MULTIPLIER = 3.0;

export const ROUTING_DISTRIBUTION = {
  STARTER: {
    CASUAL: 1.0,
  },
  PLUS: {
    CASUAL: 0.30,
    SIMPLE: 0.40,
    MEDIUM: 0.20,
    COMPLEX: 0.10,
  },
  PRO: {
    CASUAL: 0.25,
    SIMPLE: 0.20,
    MEDIUM: 0.40,
    COMPLEX: 0.10,
    EXPERT: 0.05,
  },
  EDGE: {
    CASUAL: 0.15,
    SIMPLE: 0.25,
    MEDIUM: 0.25,
    COMPLEX: 0.35,
  },
  LIFE: {
    SIMPLE: 0.20,   // 20% Haiku
    MEDIUM: 0.40,   // 40% Gemini Pro
    COMPLEX: 0.25,  // 25% Sonnet
    EXPERT: 0.15,   // 15% GPT-5.1
  },
} as const;

// ==========================================
// STUDIO CONSTANTS
// ==========================================

export const STUDIO_CREDIT_VALUE = 0.2;
export const STUDIO_CREDITS_PER_RUPEE = 5;
export const STUDIO_BOOSTER_MAX_PER_MONTH = 3;

export const STUDIO_FEATURE_COSTS = {
  IMAGE_GENERATION: 0.22,
  TALKING_PHOTO_5SEC: 1.85,
  TALKING_PHOTO_10SEC: 1.9,
  LOGO_PREVIEW_SET: 0.58,
  LOGO_FINAL: 10.12,
} as const;

// ==========================================
// STUDIO BOOSTERS
// ==========================================

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
    creditsAddedIntl: 1260,
    validity: 30,
    maxPerMonth: 3,
    costs: {
      gateway: 2.34,
      infra: 1.0,
      maxGPUCost: 13.29,
      total: 16.63,
      profit: 82.37,
      margin: 83.2,
    },
    costsInternational: {
      gateway: 9.85,
      infra: 1.0,
      maxGPUCost: 39.87,
      total: 50.72,
      profit: 366.28,
      margin: 87.8,
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
    creditsAddedIntl: 5085,
    validity: 30,
    maxPerMonth: 2,
    popular: true,
    costs: {
      gateway: 9.42,
      infra: 2.0,
      maxGPUCost: 51.22,
      total: 62.64,
      profit: 336.36,
      margin: 84.3,
    },
    costsInternational: {
      gateway: 39.52,
      infra: 2.0,
      maxGPUCost: 153.66,
      total: 195.18,
      profit: 1477.82,
      margin: 88.3,
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
    creditsAddedIntl: 7635,
    validity: 30,
    maxPerMonth: 2,
    costs: {
      gateway: 14.13,
      infra: 3.0,
      maxGPUCost: 76.83,
      total: 93.96,
      profit: 505.04,
      margin: 84.3,
    },
    costsInternational: {
      gateway: 59.29,
      infra: 3.0,
      maxGPUCost: 230.49,
      total: 292.78,
      profit: 2218.22,
      margin: 88.3,
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
      costs: plan.costs,
    };
  }

  return {
    price: plan.priceUSD || plan.price,
    currency: Currency.USD,
    symbol: '$',
    limits: plan.limitsInternational || plan.limits,
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
  const ratio = TOKEN_RATIOS[modelId as keyof typeof TOKEN_RATIOS]?.average || 1.3;
  return Math.floor(tokens / ratio);
}

export function wordsToTokens(words: number, modelId: string): number {
  const ratio = TOKEN_RATIOS[modelId as keyof typeof TOKEN_RATIOS]?.average || 1.3;
  return Math.floor(words * ratio);
}

export const USER_LOCATION = {
  country: 'India',
  region: Region.INDIA,
  currency: Currency.INR,
} as const;