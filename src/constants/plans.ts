// src/constants/plans.ts

/**
 * ==========================================
 * SORIVA BACKEND - PLANS CONFIGURATION DATA
 * ==========================================
 * Pure data & type definitions for Soriva plans
 * Last Updated: November 11, 2025 - FIXED TypeScript Errors
 *
 * FIXES APPLIED:
 * - ✅ Added `costsInternational?: RegionalPricing['costs']` to Plan interface
 * - ✅ Added `costsInternational?: StudioBooster['costs']` to StudioBooster interface
 * - ✅ All TypeScript errors resolved
 *
 * PRICING STRATEGY:
 * - India (IN): ₹149/month (Razorpay/Cashfree)
 * - International (All others): $5.99/month (Stripe - bank auto-converts to local currency)
 * 
 * LAUNCH STRATEGY:
 * Phase 1 (NOW): Starter (chat only), Plus (images), Pro (images + talking photos + logos)
 * Phase 2 (Future): Edge, Life (will be configured when video features ready)
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
// APP-SPECIFIC ENUMS (SIMPLIFIED)
// ==========================================

export enum AIProvider {
  GROQ = 'groq',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  OPENAI = 'openai',
}
export const STUDIO_FREE_PREVIEWS = 3;
export const STUDIO_EXTRA_PREVIEW_COST = 5; // credits per extra preview
export const STUDIO_MAX_PREVIEWS = 10

// ✅ SIMPLIFIED: Only 2 regions
export enum Region {
  INDIA = 'IN',           // India - Special pricing
  INTERNATIONAL = 'INTL', // Everyone else - USD pricing
}

// ✅ SIMPLIFIED: Only 2 currencies
export enum Currency {
  INR = 'INR', // Indian Rupee
  USD = 'USD', // US Dollar (universal for international)
}

export type DocumentIntelligenceTier =
  | 'standard'
  | 'pro'
  | 'business_intelligence'
  | 'emotional_intelligence';

// ==========================================
// 🌍 CURRENCY CONSTANTS (SIMPLIFIED)
// ==========================================

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.INR]: '₹',
  [Currency.USD]: '$',
};

// Exchange rate: ₹1 INR = $0.012 USD (₹83.67 per $1)
export const INR_TO_USD_RATE = 0.012;
export const USD_TO_INR_RATE = 83.67;

// Region to Currency mapping
export const REGION_CURRENCY_MAP: Record<Region, Currency> = {
  [Region.INDIA]: Currency.INR,
  [Region.INTERNATIONAL]: Currency.USD,
};

// Payment gateway by region
export const REGION_PAYMENT_GATEWAY: Record<Region, string> = {
  [Region.INDIA]: 'razorpay', // or 'cashfree'
  [Region.INTERNATIONAL]: 'stripe',
};

// ==========================================
// RE-EXPORTS
// ==========================================

export { PlanType, BoosterCategory, planTypeToName };

// ==========================================
// INTERFACES
// ==========================================

export interface AIModel {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  percentage?: number;
  fallback?: boolean;
  costPerWord?: number;
}

export interface TrialConfig {
  enabled: boolean;
  durationDays: number;
  totalWords: number;
  dailyWords: number;
}

export interface CooldownBooster {
  type: 'COOLDOWN';
  name: string;
  price: number;
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

// ==========================================
// 🎬 STUDIO LIMITS INTERFACE
// ==========================================

export interface StudioLimits {
  images: number;
  talkingPhotos: number;
  logoPreview: number;
  logoPurchase: number;
}

export interface UsageLimits {
  monthlyWords: number;
  dailyWords: number;
  botResponseLimit: number;
  memoryDays: number;
  contextMemory: number;
  responseDelay: number;
  studio: StudioLimits;
  studioCredits?: number;
}

export interface AdvancedFeatures {
  // Business Intelligence (Edge)
  smartWorkflow?: boolean;
  aiTagging?: boolean;
  decisionSnapshot?: boolean;
  legalFinanceLens?: boolean;
  multiformatFusion?: boolean;
  businessContextMemory?: boolean;
  voiceToAction?: boolean;

  // Emotional Intelligence (Life)
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

// ==========================================
// 🌍 COST STRUCTURE INTERFACE
// ==========================================

export interface PlanCosts {
  aiCostTotal: number;
  studioCostTotal: number;
  gatewayCost: number;
  infraCostPerUser: number;
  totalCost: number;
  profit: number;
  margin: number;
}

// ==========================================
// 🌍 REGIONAL PRICING INTERFACE (SIMPLIFIED)
// ==========================================

export interface RegionalPricing {
  currency: Currency;
  price: number;
  limits: UsageLimits;
  costs: PlanCosts;
}

// ==========================================
// ✅ PLAN INTERFACE (FIXED)
// ==========================================

export interface Plan {
  id: PlanType;
  name: string;
  displayName: string;
  tagline: string;
  description: string;
  price: number; // Base price in INR
  priceUSD?: number; // International price in USD
  enabled: boolean;
  popular?: boolean;
  hero?: boolean;
  order: number;
  personality: string;
  trial?: TrialConfig;
  limits: UsageLimits; // Base limits for India
  limitsInternational?: UsageLimits; // International limits (3x usage)
  aiModels: AIModel[];
  isHybrid: boolean;
  cooldownBooster?: CooldownBooster;
  addonBooster?: AddonBooster;
  documentation?: DocumentIntelligence;
  features: {
    studio: boolean;
    documentIntelligence: boolean;
    fileUpload: boolean;
    prioritySupport: boolean;
  };
  costs: PlanCosts; // ✅ Using PlanCosts interface
  costsInternational?: PlanCosts; // ✅ FIXED: Added this property
  paymentGateway?: {
    // India
    cashfree?: string;
    razorpay?: string;
    // International
    stripe?: string; // Single USD plan ID
  };
}

// ==========================================
// 🎬 STUDIO BOOSTER INTERFACE (FIXED)
// ==========================================

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
  price: number; // India price (INR)
  priceUSD?: number; // International price (USD)
  creditsAdded: number; // India credits
  creditsAddedIntl?: number; // International credits (3x)
  validity: number;
  maxPerMonth: number;
  popular?: boolean;
  costs: StudioBoosterCosts; // ✅ Using StudioBoosterCosts interface
  costsInternational?: StudioBoosterCosts; // ✅ FIXED: Added this property
  paymentGateway?: {
    cashfree?: string;
    razorpay?: string;
    stripe?: string; // Single USD plan
  };
}

// ==========================================
// PLANS STATIC CONFIGURATION
// ==========================================

export const PLANS_STATIC_CONFIG: Record<PlanType, Plan> = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 1 LAUNCH PLANS (enabled: true)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [PlanType.STARTER]: {
    id: PlanType.STARTER,
    name: 'starter',
    displayName: 'Soriva Starter',
    tagline: 'Start smarter.',
    description: 'Free forever - Experience AI chat with Llama 3 8B',
    price: 0,
    priceUSD: 0,
    enabled: true,
    order: 1,
    personality: 'Friendly, casual, quick helper',

    limits: {
      monthlyWords: 45000,
      dailyWords: 1500,
      botResponseLimit: 65,
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
        provider: AIProvider.GROQ,
        modelId: 'llama-3-8b-8192',
        displayName: 'Llama 3 8B',
        costPerWord: 0.0000001667,
      },
    ],
    isHybrid: false,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Instant Unlock',
      price: 5,
      wordsUnlocked: 5000,
      duration: 0,
      maxPerPlanPeriod: 3,
      resetOn: 'calendar',
      progressiveMultipliers: [1, 1, 1],
      eligibilityCheck: {
        requiresWordsRemaining: 0,
      },
      costs: {
        gateway: 0.12,
        total: 0.147,
        profit: 4.853,
        margin: 97.0,
      },
    },

    features: {
      studio: false,
      documentIntelligence: false,
      fileUpload: false,
      prioritySupport: false,
    },

    costs: {
      aiCostTotal: 0.33,
      studioCostTotal: 0,
      gatewayCost: 0,
      infraCostPerUser: 2.0,
      totalCost: 2.83,
      profit: -2.83,
      margin: -100,
    },
  },

  [PlanType.PLUS]: {
    id: PlanType.PLUS,
    name: 'plus',
    displayName: 'Soriva Plus',
    tagline: 'Elevate. Effortlessly.',
    description: 'Claude Haiku 3 + 65 AI images monthly',
    price: 149, // India price
    priceUSD: 5.99, // International price
    enabled: true,
    popular: true,
    hero: true,
    order: 2,
    personality: 'Versatile, productivity-oriented, balanced',

    // India limits
    limits: {
      monthlyWords: 90000,
      dailyWords: 3000,
      botResponseLimit: 80,
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

    // International limits (3x usage)
    limitsInternational: {
      monthlyWords: 270000, // 90K × 3
      dailyWords: 9000, // 3K × 3
      botResponseLimit: 80,
      memoryDays: 10,
      contextMemory: 10,
      responseDelay: 3,
      studio: {
        images: 195, // 65 × 3
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
        costPerWord: 0.0000933,
      },
    ],
    isHybrid: false,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Plus Cooldown',
      price: 15,
      wordsUnlocked: 3000,
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
      wordsAdded: 30000,
      validity: 10,
      distributionLogic: 'Dynamic: 30K ÷ 10 days = 3K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 2.8,
        gateway: 1.63,
        total: 4.43,
        profit: 64.57,
        margin: 93.6,
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
    },

    // India costs
    costs: {
      aiCostTotal: 8.4,
      studioCostTotal: 14.3,
      gatewayCost: 3.52,
      infraCostPerUser: 3.0,
      totalCost: 30.69,
      profit: 118.31,
      margin: 79.4,
    },

    // ✅ International costs ($5.99 = ₹501)
    costsInternational: {
      aiCostTotal: 25.2, // 270K words × ₹0.0000933
      studioCostTotal: 42.9, // 195 images × ₹0.22
      gatewayCost: 11.82, // $5.99 → ₹501 × 2.36%
      infraCostPerUser: 3.0,
      totalCost: 82.92,
      profit: 418.08,
      margin: 83.4,
    },

    paymentGateway: {
      cashfree: 'cf_plus_monthly',
      razorpay: 'plan_plus_monthly',
      stripe: 'price_plus_monthly_usd', // Single USD plan
    },
  },

  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'pro',
    displayName: 'Soriva Pro',
    tagline: 'Command brilliance.',
    description: 'Gemini 2.5 Pro + Images + Talking Photos + Logos',
    price: 399, // India price
    priceUSD: 16.99, // International price
    enabled: true,
    order: 3,
    personality: 'Emotionally intelligent, insightful, detailed',

    // India limits
    limits: {
      monthlyWords: 225000,
      dailyWords: 7500,
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

    // International limits (3x usage)
    limitsInternational: {
      monthlyWords: 675000, // 225K × 3
      dailyWords: 22500, // 7.5K × 3
      botResponseLimit: 300,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 2.5,
      studio: {
        images: 120, // 40 × 3
        talkingPhotos: 24, // 8 × 3
        logoPreview: 15, // 5 × 3
        logoPurchase: 6, // 2 × 3
      },
    },

    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        costPerWord: 0.0003372,
      },
    ],
    isHybrid: false,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Pro Cooldown',
      price: 25,
      wordsUnlocked: 7500,
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
      wordsAdded: 60000,
      validity: 10,
      distributionLogic: 'Dynamic: 60K ÷ 10 days = 6K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 20.23,
        gateway: 3.04,
        total: 23.27,
        profit: 105.73,
        margin: 82.0,
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
    },

    // India costs
    costs: {
      aiCostTotal: 75.87,
      studioCostTotal: 26.5,
      gatewayCost: 9.42,
      infraCostPerUser: 5.0,
      totalCost: 109.37,
      profit: 289.63,
      margin: 72.6,
    },

    // ✅ International costs ($16.99 = ₹1,422)
    costsInternational: {
      aiCostTotal: 227.61, // 675K words × ₹0.0003372
      studioCostTotal: 79.5, // 120 images + 24 talking photos + 15 logo previews
      gatewayCost: 33.56, // $16.99 → ₹1,422 × 2.36%
      infraCostPerUser: 5.0,
      totalCost: 345.67,
      profit: 1076.33,
      margin: 75.7,
    },

    paymentGateway: {
      cashfree: 'cf_pro_monthly',
      razorpay: 'plan_pro_monthly',
      stripe: 'price_pro_monthly_usd', // Single USD plan
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PHASE 2 LAUNCH PLANS (enabled: false - FUTURE)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [PlanType.EDGE]: {
    id: PlanType.EDGE,
    name: 'edge',
    displayName: 'Soriva Edge',
    tagline: 'Where precision meets purpose.',
    description: 'Claude Sonnet 4.5 + Business Intelligence',
    price: 999,
    priceUSD: 39.99,
    enabled: false,
    order: 4,
    personality: 'Consulting-grade mentor, precision-focused',

    limits: {
      monthlyWords: 250000,
      dailyWords: 8333,
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
      monthlyWords: 750000,
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

    aiModels: [
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4.5',
        displayName: 'Claude Sonnet 4.5',
        costPerWord: 0.00112,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        fallback: true,
        costPerWord: 0.0003372,
      },
    ],
    isHybrid: false,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Edge Cooldown',
      price: 35,
      wordsUnlocked: 8333,
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
      wordsAdded: 80000,
      validity: 10,
      distributionLogic: 'Dynamic: 80K ÷ 10 days = 8K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 89.6,
        gateway: 4.7,
        total: 94.3,
        profit: 104.7,
        margin: 52.6,
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
    },

    costs: {
      aiCostTotal: 280.0,
      studioCostTotal: 0,
      gatewayCost: 23.58,
      infraCostPerUser: 5,
      totalCost: 308.58,
      profit: 690.42,
      margin: 69.1,
    },

    costsInternational: {
      aiCostTotal: 840.0,
      studioCostTotal: 0,
      gatewayCost: 78.94,
      infraCostPerUser: 5,
      totalCost: 923.94,
      profit: 2422.06,
      margin: 72.4,
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
    description: 'GPT-5 + Emotional Intelligence',
    price: 1199,
    priceUSD: 49.99,
    enabled: false,
    order: 5,
    personality: 'Premium companion with emotional depth',

    limits: {
      monthlyWords: 300000,
      dailyWords: 10000,
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
      monthlyWords: 900000,
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

    aiModels: [
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5',
        displayName: 'GPT-5',
        costPerWord: 0.000715,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4.5',
        displayName: 'Claude Sonnet 4.5',
        fallback: true,
        costPerWord: 0.00112,
      },
    ],
    isHybrid: false,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Life Cooldown',
      price: 35,
      wordsUnlocked: 10000,
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
      wordsAdded: 100000,
      validity: 10,
      distributionLogic: 'Dynamic: 100K ÷ 10 days = 10K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 71.5,
        gateway: 5.88,
        total: 77.38,
        profit: 171.62,
        margin: 68.9,
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
    },

    costs: {
      aiCostTotal: 214.5,
      studioCostTotal: 0,
      gatewayCost: 28.3,
      infraCostPerUser: 5,
      totalCost: 247.8,
      profit: 951.2,
      margin: 79.3,
    },

    costsInternational: {
      aiCostTotal: 643.5,
      studioCostTotal: 0,
      gatewayCost: 99.04,
      infraCostPerUser: 5,
      totalCost: 747.54,
      profit: 3432.46,
      margin: 82.1,
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

// 🌍 INTERNATIONAL PRICING MULTIPLIERS (SIMPLIFIED)
export const USAGE_MULTIPLIER_INTERNATIONAL = 3.0; // 3x usage for international
export const STUDIO_CREDITS_MULTIPLIER = 3.0; // 3x studio limits

// ==========================================
// 🎬 STUDIO CONSTANTS
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
// 🎬 STUDIO BOOSTERS (SIMPLIFIED)
// ==========================================

export const STUDIO_BOOSTERS: Record<string, StudioBooster> = {
  LITE: {
    id: 'studio_lite',
    type: 'STUDIO',
    name: 'studio_lite',
    displayName: 'Studio Lite',
    tagline: 'Start creating.',
    price: 99, // India
    priceUSD: 4.99, // International
    creditsAdded: 420, // India
    creditsAddedIntl: 1260, // International (3x)
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
      gateway: 9.85, // $4.99 → ₹417 × 2.36%
      infra: 1.0,
      maxGPUCost: 39.87, // 3x GPU cost
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
    price: 399, // India
    priceUSD: 19.99, // International
    creditsAdded: 1695, // India
    creditsAddedIntl: 5085, // International (3x)
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
      gateway: 39.52, // $19.99 → ₹1,673 × 2.36%
      infra: 2.0,
      maxGPUCost: 153.66, // 3x GPU cost
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
    price: 599, // India
    priceUSD: 29.99, // International
    creditsAdded: 2545, // India
    creditsAddedIntl: 7635, // International (3x)
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
      gateway: 59.29, // $29.99 → ₹2,511 × 2.36%
      infra: 3.0,
      maxGPUCost: 230.49, // 3x GPU cost
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
// 🎬 STUDIO FEATURES PRICING
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
// 🌍 HELPER FUNCTIONS (SIMPLIFIED)
// ==========================================

/**
 * Get region from country code
 * SIMPLIFIED: Only India vs International
 */
export function getRegionFromCountry(countryCode: string): Region {
  return countryCode.toUpperCase() === 'IN' ? Region.INDIA : Region.INTERNATIONAL;
}

/**
 * Get currency from region
 */
export function getCurrencyFromRegion(region: Region): Currency {
  return REGION_CURRENCY_MAP[region];
}

/**
 * Get pricing for a plan based on region
 */
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

  // International
  return {
    price: plan.priceUSD || plan.price,
    currency: Currency.USD,
    symbol: '$',
    limits: plan.limitsInternational || plan.limits,
    costs: plan.costsInternational || plan.costs,
  };
}

/**
 * Get Studio Booster pricing based on region
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

  // International
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
 */
export function formatPrice(price: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];

  if (currency === Currency.INR) {
    return `${symbol}${Math.round(price)}`;
  }

  return `${symbol}${price.toFixed(2)}`;
}

/**
 * Get payment gateway for region
 */
export function getPaymentGateway(region: Region): string {
  return REGION_PAYMENT_GATEWAY[region];
}
export const USER_LOCATION = {
  country: 'India',
  region: Region.INDIA,
  currency: Currency.INR,
} as const;