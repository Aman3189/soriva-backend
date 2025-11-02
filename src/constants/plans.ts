// src/constants/plans.ts

/**
 * ==========================================
 * SORIVA BACKEND - PLANS CONFIGURATION DATA
 * ==========================================
 * Pure data & type definitions for Soriva plans
 * Last Updated: November 2, 2025 - Studio Feature Implementation
 *
 * LATEST CHANGES (November 2, 2025):
 * - ✅ ADDED Studio Credit System (₹1 = 3 credits)
 * - ✅ ADDED Universal Studio Boosters (independent of chat plans)
 * - ✅ ADDED Studio credits to all chat plans (0/45/75/150/225)
 * - ✅ ADDED Studio Boosters (LITE/PRO/MAX) - Available to ALL users
 * - ✅ ADDED Studio features pricing config
 * - ✅ ADDED Preview system (1 free + 3 credits per extra)
 * 
 * PREVIOUS CHANGES (November 1, 2025):
 * - ✅ Updated STARTER: Llama 3 8B, 1500 words/day (80 word replies)
 * - ✅ Updated PLUS: Claude Haiku 3, 3000 words/day
 * - ✅ Updated PRO: Gemini 2.5 Pro, 7500 words/day (300 word replies)
 * - ✅ Phase 2 plans (EDGE, LIFE) remain disabled for future launch
 *
 * LAUNCH STRATEGY:
 * Phase 1 (NOW): Starter, Plus, Pro (enabled: true)
 * Phase 2 (Day 45+): Edge, Life (enabled: false → true)
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

export type DocumentIntelligenceTier =
  | 'standard'
  | 'pro'
  | 'business_intelligence'
  | 'emotional_intelligence';

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
// 🎬 NEW: STUDIO BOOSTER INTERFACE
// ==========================================

export interface StudioBooster {
  id: string;
  type: 'STUDIO';
  name: string;
  displayName: string;
  tagline: string;
  price: number;
  creditsAdded: number;
  validity: number; // days
  maxPerMonth: number;
  popular?: boolean;
  costs: {
    gateway: number;
    infra: number;
    maxGPUCost: number; // Maximum GPU cost if all credits used
    total: number;
    profit: number;
    margin: number;
  };
  paymentGateway?: {
    cashfree?: string;
    razorpay?: string;
  };
}

export interface UsageLimits {
  monthlyWords: number;
  dailyWords: number;
  botResponseLimit: number;
  memoryDays: number;
  contextMemory: number;
  responseDelay: number;
  studioCredits: number; // 🎬 NEW: Monthly studio credits
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

export interface Plan {
  id: PlanType;
  name: string;
  displayName: string;
  tagline: string;
  description: string;
  price: number;
  enabled: boolean;
  popular?: boolean;
  hero?: boolean;
  order: number;
  personality: string;
  trial?: TrialConfig;
  limits: UsageLimits;
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
  costs: {
    aiCostTotal: number;
    gatewayCost: number;
    infraCostPerUser: number;
    totalCost: number;
    profit: number;
    margin: number;
  };
  paymentGateway?: {
    cashfree?: string;
    razorpay?: string;
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
    enabled: true,
    order: 1,
    personality: 'Friendly, casual, quick helper',

    // ❌ NO TRIAL - Forever free with daily limits
    
    limits: {
      monthlyWords: 45000, // 1500/day × 30 (for tracking)
      dailyWords: 1500, // Hard daily cap - resets at midnight
      botResponseLimit: 65, // Max words per reply (updated)
      memoryDays: 5,
      contextMemory: 5,
      responseDelay: 5,
      studioCredits: 0, // 🎬 NEW: No studio credits for free plan
    },

    aiModels: [
      {
        provider: AIProvider.GROQ,
        modelId: 'llama-3-8b-8192',
        displayName: 'Llama 3 8B',
        costPerWord: 0.0000001667, // Groq: $0.05 per 1M tokens
      },
    ],
    isHybrid: false,

    // ⚡ COOLDOWN BOOSTER - Instant unlock for same day
    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Instant Unlock',
      price: 5,
      wordsUnlocked: 5000, // 5000 extra words (same day only)
      duration: 0, // Instant, no cooldown period
      maxPerPlanPeriod: 3, // Can buy max 3 times per day
      resetOn: 'calendar', // Daily reset at midnight
      progressiveMultipliers: [1, 1, 1], // Same price each time
      eligibilityCheck: {
        requiresWordsRemaining: 0, // Can buy even at 0 words
      },
      costs: {
        gateway: 0.12, // ₹5 × 2.36%
        total: 0.147, // ₹0.027 AI + ₹0.12 gateway
        profit: 4.853,
        margin: 97.0,
      },
    },

    // ❌ NO ADDON BOOSTER - Doesn't make sense for free plan

    features: {
      studio: false, // 🎬 No studio access - but can buy Studio Boosters!
      documentIntelligence: false,
      fileUpload: false,
      prioritySupport: false,
    },

    costs: {
      aiCostTotal: 0.25, // 1500 words/day × 30 days × ₹0.0000001667
      gatewayCost: 0, // No gateway cost for free users
      infraCostPerUser: 2,
      totalCost: 2.25,
      profit: -2.25,
      margin: -100, // Loss leader for user acquisition
    },
  },

  [PlanType.PLUS]: {
    id: PlanType.PLUS,
    name: 'plus',
    displayName: 'Soriva Plus',
    tagline: 'Elevate. Effortlessly.',
    description: 'Claude Haiku 3 - Smart & affordable AI companion',
    price: 149,
    enabled: true,
    popular: true,
    hero: true,
    order: 2,
    personality: 'Versatile, productivity-oriented, balanced',

    limits: {
      monthlyWords: 90000, // 3000/day × 30
      dailyWords: 3000,
      botResponseLimit: 80,
      memoryDays: 10,
      contextMemory: 10,
      responseDelay: 3,
      studioCredits: 45, // 🎬 NEW: ₹15 value = 45 credits (bonus)
    },

    aiModels: [
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-3-haiku-20240307',
        displayName: 'Claude 3 Haiku',
        costPerWord: 0.0000933, // Input + Output averaged
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
      studio: true, // 🎬 NEW: Studio enabled with 45 bonus credits
      documentIntelligence: true,
      fileUpload: false,
      prioritySupport: false,
    },

    costs: {
      aiCostTotal: 8.4, // 90000 × ₹0.0000933
      gatewayCost: 3.52,
      infraCostPerUser: 3,
      totalCost: 14.92,
      profit: 134.08,
      margin: 90.0,
    },

    paymentGateway: {
      cashfree: 'cf_plus_monthly',
      razorpay: 'plan_plus_monthly',
    },
  },

  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'pro',
    displayName: 'Soriva Pro',
    tagline: 'Command brilliance.',
    description: 'Gemini 2.5 Pro - Advanced AI with deeper responses',
    price: 399,
    enabled: true,
    order: 3,
    personality: 'Emotionally intelligent, insightful, detailed',

    limits: {
      monthlyWords: 225000, // 7500/day × 30
      dailyWords: 7500,
      botResponseLimit: 300, // Longer replies allowed
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 2.5,
      studioCredits: 75, // 🎬 NEW: ₹25 value = 75 credits (bonus)
    },

    aiModels: [
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        costPerWord: 0.0003372, // Based on token pricing
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
      studio: true, // 🎬 NEW: Studio enabled with 75 bonus credits
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
    },

    costs: {
      aiCostTotal: 75.87, // 225000 × ₹0.0003372
      gatewayCost: 9.42,
      infraCostPerUser: 5,
      totalCost: 90.29,
      profit: 308.71,
      margin: 77.4,
    },

    paymentGateway: {
      cashfree: 'cf_pro_monthly',
      razorpay: 'plan_pro_monthly',
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
    enabled: false, // ⏳ FUTURE LAUNCH (Day 45+)
    order: 4,
    personality: 'Consulting-grade mentor, precision-focused',

    limits: {
      monthlyWords: 250000,
      dailyWords: 8333,
      botResponseLimit: 500,
      memoryDays: 25,
      contextMemory: 15,
      responseDelay: 2,
      studioCredits: 150, // 🎬 NEW: ₹50 value = 150 credits (bonus)
    },

    aiModels: [
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4.5',
        displayName: 'Claude Sonnet 4.5',
        costPerWord: 0.00112, // $3 input + $15 output
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
      studio: true, // 🎬 NEW: Studio enabled with 150 bonus credits
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
    },

    costs: {
      aiCostTotal: 280.0, // 250000 × ₹0.00112
      gatewayCost: 23.58,
      infraCostPerUser: 5,
      totalCost: 308.58,
      profit: 690.42,
      margin: 69.1,
    },

    paymentGateway: {
      cashfree: 'cf_edge_monthly',
      razorpay: 'plan_edge_monthly',
    },
  },

  [PlanType.LIFE]: {
    id: PlanType.LIFE,
    name: 'life',
    displayName: 'Soriva Life',
    tagline: 'Not just AI — a reflection of you.',
    description: 'GPT-5 + Emotional Intelligence',
    price: 1199,
    enabled: false, // ⏳ FUTURE LAUNCH (Day 45+)
    order: 5,
    personality: 'Premium companion with emotional depth',

    limits: {
      monthlyWords: 300000,
      dailyWords: 10000,
      botResponseLimit: 500,
      memoryDays: 30,
      contextMemory: 20,
      responseDelay: 1.5,
      studioCredits: 225, // 🎬 NEW: ₹75 value = 225 credits (bonus)
    },

    aiModels: [
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5',
        displayName: 'GPT-5',
        costPerWord: 0.000715, // $1.25 input + $10 output
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
      studio: true, // 🎬 NEW: Studio enabled with 225 bonus credits
      documentIntelligence: true,
      fileUpload: true,
      prioritySupport: true,
    },

    costs: {
      aiCostTotal: 214.5, // 300000 × ₹0.000715
      gatewayCost: 28.3,
      infraCostPerUser: 5,
      totalCost: 247.8,
      profit: 951.2,
      margin: 79.3,
    },

    paymentGateway: {
      cashfree: 'cf_life_monthly',
      razorpay: 'plan_life_monthly',
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

export const USER_LOCATION = {
  city: 'Ferozepur',
  state: 'Punjab',
  country: 'IN',
} as const;

// ==========================================
// 🎬 NEW: STUDIO CONSTANTS
// ==========================================

export const STUDIO_CREDIT_VALUE = 0.33; // ₹1 = 3 credits, so 1 credit = ₹0.33
export const STUDIO_CREDITS_PER_RUPEE = 3;
export const STUDIO_FREE_PREVIEWS = 1;
export const STUDIO_EXTRA_PREVIEW_COST = 3; // credits
export const STUDIO_MAX_PREVIEWS = 3;
export const STUDIO_BOOSTER_MAX_PER_MONTH = 3;

// ==========================================
// 🎬 NEW: UNIVERSAL STUDIO BOOSTERS
// Available to ALL users regardless of chat plan
// ==========================================

export const STUDIO_BOOSTERS: Record<string, StudioBooster> = {
  LITE: {
    id: 'studio_lite',
    type: 'STUDIO',
    name: 'studio_lite',
    displayName: 'Studio Lite',
    tagline: 'Start creating.',
    price: 99,
    creditsAdded: 180,
    validity: 30, // days
    maxPerMonth: 3,
    costs: {
      gateway: 2.34, // ₹99 × 2.36%
      infra: 1.0,
      maxGPUCost: 60, // Max if all credits used on expensive features
      total: 63.34,
      profit: 35.66,
      margin: 36.0,
    },
    paymentGateway: {
      cashfree: 'cf_studio_lite',
      razorpay: 'plan_studio_lite',
    },
  },
  
  PRO: {
    id: 'studio_pro',
    type: 'STUDIO',
    name: 'studio_pro',
    displayName: 'Studio Pro',
    tagline: 'Create more. Create better.',
    price: 399,
    creditsAdded: 750,
    validity: 30,
    maxPerMonth: 2,
    popular: true,
    costs: {
      gateway: 9.42, // ₹399 × 2.36%
      infra: 2.0,
      maxGPUCost: 250,
      total: 261.42,
      profit: 137.58,
      margin: 34.5,
    },
    paymentGateway: {
      cashfree: 'cf_studio_pro',
      razorpay: 'plan_studio_pro',
    },
  },
  
  MAX: {
    id: 'studio_max',
    type: 'STUDIO',
    name: 'studio_max',
    displayName: 'Studio Max',
    tagline: 'Unlimited creativity.',
    price: 599,
    creditsAdded: 1200,
    validity: 30,
    maxPerMonth: 2,
    costs: {
      gateway: 14.13, // ₹599 × 2.36%
      infra: 3.0,
      maxGPUCost: 400,
      total: 417.13,
      profit: 181.87,
      margin: 30.4,
    },
    paymentGateway: {
      cashfree: 'cf_studio_max',
      razorpay: 'plan_studio_max',
    },
  },
};

// ==========================================
// 🎬 NEW: STUDIO FEATURES PRICING
// ==========================================

export const STUDIO_FEATURES = {
  // Video Features (with 1 free preview)
  festivalVideo: {
    id: 'festival_video',
    name: 'Festival Video',
    category: 'video',
    duration: 15, // seconds
    resolution: '720p',
    credits: 15,
    gpuCost: 4.5, // with 1 preview
    margin: 0.4,
    freePreview: true,
    maxPreviews: 3,
  },
  talkingFace: {
    id: 'talking_face',
    name: 'Talking Face',
    category: 'video',
    duration: 15,
    resolution: '720p',
    credits: 15,
    gpuCost: 4.5,
    margin: 0.4,
    freePreview: true,
    maxPreviews: 3,
  },
  aiDance: {
    id: 'ai_dance',
    name: 'AI Dance Video',
    category: 'video',
    duration: 45,
    resolution: '1080p',
    credits: 40,
    gpuCost: 11.9,
    margin: 0.4,
    freePreview: true,
    maxPreviews: 3,
  },
  promptVideo: {
    id: 'prompt_video',
    name: 'Prompt-to-Video',
    category: 'video',
    duration: 45,
    resolution: '1080p',
    credits: 40,
    gpuCost: 11.9,
    margin: 0.4,
    freePreview: true,
    maxPreviews: 3,
  },
  spiritualTransform: {
    id: 'spiritual_transform',
    name: 'Spiritual Transform',
    category: 'video',
    duration: 45,
    resolution: '1080p',
    credits: 40,
    gpuCost: 11.9,
    margin: 0.4,
    freePreview: true,
    maxPreviews: 3,
  },
  
  // Image Features (instant, no preview needed)
  objectRemover: {
    id: 'object_remover',
    name: 'Object Remover',
    category: 'image',
    credits: 15,
    gpuCost: 3.5,
    margin: 0.4,
    freePreview: false,
  },
  backgroundChanger: {
    id: 'background_changer',
    name: 'Background Changer',
    category: 'image',
    credits: 18,
    gpuCost: 4.2,
    margin: 0.4,
    freePreview: false,
  },
  imageUpscaler: {
    id: 'image_upscaler',
    name: 'Image Upscaler',
    category: 'image',
    credits: 15,
    gpuCost: 3.5,
    margin: 0.4,
    freePreview: false,
  },
  objectAdder: {
    id: 'object_adder',
    name: 'Object Adder',
    category: 'image',
    credits: 18,
    gpuCost: 4.2,
    margin: 0.4,
    freePreview: false,
  },
  portraitEnhancer: {
    id: 'portrait_enhancer',
    name: 'Portrait Enhancer',
    category: 'image',
    credits: 15,
    gpuCost: 3.5,
    margin: 0.4,
    freePreview: false,
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