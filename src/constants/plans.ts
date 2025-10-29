// src/constants/plans.ts

/**
 * ==========================================
 * SORIVA BACKEND - PLANS CONFIGURATION DATA
 * ==========================================
 * Pure data & type definitions for Soriva plans
 * Last Updated: October 29, 2025 - Complete Document Intelligence System
 *
 * ARCHITECTURE: OPTION B (Pure Class-Based) + 100% DYNAMIC
 * ├── Data Layer: plans.ts (THIS FILE - Pure data only)
 * └── Logic Layer: plansManager.ts (All business logic in class)
 *
 * THIS FILE CONTAINS:
 * ✅ Interfaces (Plan, AIModel, UsageLimits, etc.)
 * ✅ Static configuration data (PLANS_STATIC_CONFIG)
 * ✅ Constants (Gateway fees, limits, etc.)
 * ❌ NO ENUMS - Using Prisma enums from prisma-enums.ts
 * ❌ NO FUNCTIONS - All logic moved to PlansManager class
 * ❌ NO CLASSES - Pure data only
 * ❌ NO DUPLICATES - Single source of truth!
 *
 * LATEST CHANGES (October 29, 2025 - Evening):
 * - ✅ Complete Document Intelligence tier system
 * - ✅ Plus: Standard tier (5K words, basic features)
 * - ✅ Pro: Pro tier (15K words, advanced features)
 * - ✅ Edge: Business Intelligence tier (20K words, business automation)
 * - ✅ Life: Emotional Intelligence tier (20K words, personal growth)
 * - ✅ Advanced features interface for tier-specific capabilities
 * - ✅ Edge & Life: enabled: false (future launch)
 *
 * LAUNCH STRATEGY:
 * Phase 1 (NOW): Starter, Plus, Pro (enabled: true)
 * Phase 2 (3-6 months): Edge, Life (enabled: false → true)
 *
 * PREVIOUS CHANGES:
 * - ✅ REMOVED duplicate PlanType enum (now uses Prisma enum)
 * - ✅ RENAMED BoosterType → BoosterCategory (matches Prisma)
 * - ✅ Kept AIProvider enum (not in Prisma, app-specific)
 * - ✅ Plan config keys now use PlanType enum values
 * - ✅ All type safety maintained
 * - Added 'personality' field to each plan (for dynamic system prompts)
 * - Plan names updated: VIBE_FREE → STARTER, VIBE_PAID → PLUS, SPARK → PRO
 *
 * RESULT: 100% DYNAMIC - Change here, updates everywhere!
 */

// ==========================================
// IMPORTS FROM PRISMA ENUMS
// ==========================================

// ✅ Use Prisma-generated enums for consistency
import {
  PlanType,
  BoosterCategory,
  planTypeToName,
  PLAN_TYPE_TO_NAME,
} from '@shared/types/prisma-enums';
// ==========================================
// APP-SPECIFIC ENUMS (Not in Prisma)
// ==========================================

/**
 * AI Provider enum - app-specific, not stored in database
 */
export enum AIProvider {
  GROQ = 'groq',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  OPENAI = 'openai',
}

/**
 * Document Intelligence Tier enum
 */
export type DocumentIntelligenceTier =
  | 'standard' // Plus: Basic features
  | 'pro' // Pro: Advanced features
  | 'business_intelligence' // Edge: Business automation
  | 'emotional_intelligence'; // Life: Personal growth

// ==========================================
// RE-EXPORTS FOR CONVENIENCE
// ==========================================

// Re-export Prisma enums so other files can import from here
export { PlanType, BoosterCategory };

// Export helper to get plan name string from enum
export { planTypeToName };

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
  docsBonus?: number;
  validity: number;
  distributionLogic: string;
  maxPerMonth: number;
  costs: {
    ai: number;
    studio?: number;
    gateway: number;
    total: number;
    profit: number;
    margin: number;
  };
}

export interface UsageLimits {
  monthlyWords: number;
  dailyWords: number;
  botResponseLimit: number;
  memoryDays: number;
  contextMemory: number;
  responseDelay: number;
}

/**
 * ✨ Advanced Features for Document Intelligence tiers
 * Tier-specific capabilities that differentiate plans
 */
export interface AdvancedFeatures {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BUSINESS INTELLIGENCE FEATURES (Edge Plan)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Phase 1 (MVP)
  smartWorkflow?: boolean; // Auto-generate "Next steps", "Key dates", "Pending items"
  aiTagging?: boolean; // Auto-tag: "invoice", "proposal", "legal", "client data"
  decisionSnapshot?: boolean; // 1-click PPT/Excel "Decision Brief" export

  // Phase 2 (Enhanced)
  legalFinanceLens?: boolean; // Detect clauses, invoice mismatches, compliance flags
  multiformatFusion?: boolean; // PDF + Excel + Image → single analyzed view
  businessContextMemory?: boolean; // Remembers industry context (e.g., real estate vs tech)

  // Phase 3 (Advanced)
  voiceToAction?: boolean; // Voice commands: "Summarize in 5 points"

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMOTIONAL INTELLIGENCE FEATURES (Life Plan)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Phase 1 (MVP)
  emotionalContextSummarizer?: boolean; // Understands emotional tone of letters/diaries
  memoryCapsule?: boolean; // Highlights: "Your first job offer", "Notes from mom"
  companionNotes?: boolean; // Heartfelt AI responses to emotional documents

  // Phase 2 (Enhanced)
  thoughtOrganizer?: boolean; // Categories: "Dreams", "Goals", "Reflections", "Memories"
  aiScrapbook?: boolean; // Visual collage: "Your Growth Journey" PDF
  lifeReflectionInsights?: boolean; // Deep analysis: "You've mentioned 'hope' 47 times"

  // Phase 3 (Advanced)
  handwritingEmotionReader?: boolean; // Detects stress, positivity from writing style
}

/**
 * ✨ Complete Document Intelligence configuration
 * Supports 4 tiers: standard, pro, business_intelligence, emotional_intelligence
 */
export interface DocumentIntelligence {
  enabled: boolean;
  tier: DocumentIntelligenceTier;
  displayName: string;
  badge: string;
  tagline?: string; // Marketing tagline for the tier
  monthlyWords: number;
  maxWorkspaces: number;
  exportFormats: string[];
  templates: boolean;
  versionHistory: number; // 0 = unlimited
  collaboration: boolean;
  advancedFeatures?: AdvancedFeatures; // Tier-specific features
}

export interface CreditConfig {
  monthlyCredits: number;
  costToProvide: number;
  rollover: boolean;
}

export interface StudioFeature {
  id: string;
  name: string;
  displayName: string;
  creditCost: number;
  apiCost: number;
  description: string;
  provider?: string;
  model?: string;
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
  credits?: CreditConfig;
  features: {
    studio: boolean;
    documentIntelligence: boolean;
    fileUpload: boolean;
    prioritySupport: boolean;
  };
  costs: {
    aiCostTotal: number;
    studioCostTotal: number;
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
// STUDIO FEATURES CONFIGURATION
// ==========================================

export const STUDIO_FEATURES_CONFIG: StudioFeature[] = [
  {
    id: 'dream_craft',
    name: 'dream_craft',
    displayName: 'Dream Craft',
    creditCost: 8,
    apiCost: 2.1,
    description: 'Image Generator - FLUX 1.1 Dev',
    provider: 'Replicate',
    model: 'FLUX 1.1 Dev',
  },
  {
    id: 'brand_soul',
    name: 'brand_soul',
    displayName: 'Brand Soul',
    creditCost: 23,
    apiCost: 6.6,
    description: 'Logo Maker - Ideogram v2.0',
    provider: 'Ideogram',
    model: 'Ideogram v2.0',
  },
  {
    id: 'fun_forge',
    name: 'fun_forge',
    displayName: 'Fun Forge',
    creditCost: 2,
    apiCost: 0,
    description: 'Meme Generator - Templates',
    provider: 'Internal',
    model: 'Templates',
  },
  {
    id: 'glow_up',
    name: 'glow_up',
    displayName: 'Glow Up',
    creditCost: 2,
    apiCost: 0.4,
    description: 'Photo Enhancer - Real-ESRGAN',
    provider: 'Replicate',
    model: 'Real-ESRGAN',
  },
  {
    id: 'pure_view',
    name: 'pure_view',
    displayName: 'Pure View',
    creditCost: 2,
    apiCost: 0.25,
    description: 'Background Remover - RMBG 2.0',
    provider: 'Replicate',
    model: 'RMBG 2.0',
  },
  {
    id: 'clean_slate',
    name: 'clean_slate',
    displayName: 'Clean Slate',
    creditCost: 2,
    apiCost: 0.25,
    description: 'Object Remover - LaMa',
    provider: 'Replicate',
    model: 'LaMa',
  },
  {
    id: 'face_animation',
    name: 'face_animation',
    displayName: 'Face Animation',
    creditCost: 21,
    apiCost: 6,
    description: 'Video Animation - LivePortrait',
    provider: 'Replicate',
    model: 'LivePortrait',
  },
];

// ==========================================
// PLANS STATIC CONFIGURATION (FULLY DYNAMIC!)
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
    description: '14-day free trial - Experience AI chat with Llama 3.3 70B',
    price: 0,
    enabled: true, // ✅ LAUNCH PLAN
    order: 1,
    personality: 'Vibe - fun, casual, entertaining companion',

    trial: {
      enabled: true,
      durationDays: 14,
      totalWords: 42000,
      dailyWords: 3000,
    },

    limits: {
      monthlyWords: 42000,
      dailyWords: 3000,
      botResponseLimit: 60,
      memoryDays: 5,
      contextMemory: 5,
      responseDelay: 5,
    },

    aiModels: [
      {
        provider: AIProvider.GROQ,
        modelId: 'llama-3.3-70b-versatile',
        displayName: 'Llama 3.3 70B',
        costPerWord: 0,
      },
    ],
    isHybrid: false,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Starter Cooldown',
      price: 5,
      wordsUnlocked: 6000,
      duration: 0,
      maxPerPlanPeriod: 2,
      resetOn: 'plan_renewal',
      progressiveMultipliers: [2, 1.5],
      eligibilityCheck: {
        requiresWordsRemaining: 6000,
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
      documentIntelligence: false, // ❌ Not available
      fileUpload: false,
      prioritySupport: false,
    },

    costs: {
      aiCostTotal: 0,
      studioCostTotal: 0,
      gatewayCost: 0,
      infraCostPerUser: 2,
      totalCost: 2,
      profit: -2,
      margin: -100,
    },
  },

  [PlanType.PLUS]: {
    id: PlanType.PLUS,
    name: 'plus',
    displayName: 'Soriva Plus',
    tagline: 'Elevate. Effortlessly.',
    description: 'Hybrid AI + Studio + Document Intelligence',
    price: 149,
    enabled: true, // ✅ LAUNCH PLAN (Hero)
    popular: true,
    hero: true,
    order: 2,
    personality: 'Vibe+ - versatile, productivity-oriented companion',

    limits: {
      monthlyWords: 75000,
      dailyWords: 2500,
      botResponseLimit: 90,
      memoryDays: 10,
      contextMemory: 10,
      responseDelay: 3,
    },

    aiModels: [
      {
        provider: AIProvider.GROQ,
        modelId: 'llama-3.3-70b-versatile',
        displayName: 'Llama 3.3 70B',
        percentage: 30,
        costPerWord: 0,
      },
      {
        provider: AIProvider.GEMINI,
        modelId: 'gemini-2.0-flash-lite',
        displayName: 'Gemini 2.0 Flash',
        percentage: 70,
        costPerWord: 0.00002618,
      },
    ],
    isHybrid: true,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Plus Cooldown',
      price: 15,
      wordsUnlocked: 5000,
      duration: 0,
      maxPerPlanPeriod: 2,
      resetOn: 'plan_renewal',
      progressiveMultipliers: [2, 1.5],
      eligibilityCheck: {
        requiresWordsRemaining: 5000,
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
      wordsAdded: 40000,
      creditsAdded: 50,
      validity: 10,
      distributionLogic: 'Dynamic: 40K ÷ 10 days = 4K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 0.78,
        studio: 14,
        gateway: 1.63,
        total: 16.41,
        profit: 52.59,
        margin: 76.2,
      },
    },

    // ✨ DOCUMENT INTELLIGENCE - STANDARD TIER
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
      versionHistory: 3, // Keep last 3 versions
      collaboration: false,
      // No advanced features in standard tier
    },

    credits: {
      monthlyCredits: 40,
      costToProvide: 11.2,
      rollover: false,
    },

    features: {
      studio: true,
      documentIntelligence: true, // ✅ Enabled
      fileUpload: false,
      prioritySupport: false,
    },

    costs: {
      aiCostTotal: 14.56,
      studioCostTotal: 0,
      gatewayCost: 3.52,
      infraCostPerUser: 3,
      totalCost: 21.08,
      profit: 127.92,
      margin: 85.9,
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
    description: 'Gemini 2.5 Pro + Document Intelligence Pro',
    price: 399,
    enabled: true, // ✅ LAUNCH PLAN
    order: 3,
    personality: 'Spark - emotionally intelligent, insightful guide',

    limits: {
      monthlyWords: 300000,
      dailyWords: 10000,
      botResponseLimit: 120,
      memoryDays: 15,
      contextMemory: 12,
      responseDelay: 2.5,
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
      wordsUnlocked: 20000,
      duration: 0,
      maxPerPlanPeriod: 2,
      resetOn: 'plan_renewal',
      progressiveMultipliers: [2, 1.5],
      eligibilityCheck: {
        requiresWordsRemaining: 20000,
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
      wordsAdded: 120000,
      docsBonus: 15000,
      validity: 10,
      distributionLogic: 'Dynamic: 120K ÷ 10 days = 12K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 40.46,
        gateway: 3.04,
        total: 43.5,
        profit: 85.5,
        margin: 66.3,
      },
    },

    // ✨ DOCUMENT INTELLIGENCE - PRO TIER
    documentation: {
      enabled: true,
      tier: 'pro',
      displayName: 'Document Intelligence Pro',
      badge: '🚀 PRO',
      tagline: 'Professional-grade documentation workspace',
      monthlyWords: 15000,
      maxWorkspaces: 50,
      exportFormats: ['pdf', 'docx', 'markdown', 'html'],
      templates: true, // Access to 20+ templates
      versionHistory: 0, // Unlimited version history
      collaboration: false,
      // No advanced features in pro tier (reserved for Edge/Life)
    },

    features: {
      studio: false,
      documentIntelligence: true, // ✅ Enabled (Pro tier)
      fileUpload: true,
      prioritySupport: true,
    },

    costs: {
      aiCostTotal: 101.16,
      studioCostTotal: 0,
      gatewayCost: 9.42,
      infraCostPerUser: 5,
      totalCost: 115.58,
      profit: 283.42,
      margin: 71.0,
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
    enabled: false, // ⏳ FUTURE LAUNCH
    order: 4,
    personality: 'Apex - consulting-grade mentor and productivity partner',

    limits: {
      monthlyWords: 250000,
      dailyWords: 8333,
      botResponseLimit: 150,
      memoryDays: 25,
      contextMemory: 15,
      responseDelay: 2,
    },

    aiModels: [
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4.5',
        displayName: 'Claude Sonnet 4.5',
        costPerWord: 0.00104,
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
      wordsUnlocked: 16666,
      duration: 0,
      maxPerPlanPeriod: 2,
      resetOn: 'plan_renewal',
      progressiveMultipliers: [2, 1.5],
      eligibilityCheck: {
        requiresWordsRemaining: 16666,
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
      wordsAdded: 120000,
      docsBonus: 20000,
      validity: 10,
      distributionLogic: 'Dynamic: 120K ÷ 10 days = 12K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 124.8,
        gateway: 4.7,
        total: 129.5,
        profit: 69.5,
        margin: 34.9,
      },
    },

    // ✨ DOCUMENT INTELLIGENCE - BUSINESS INTELLIGENCE TIER
    documentation: {
      enabled: true,
      tier: 'business_intelligence',
      displayName: 'Document Intelligence - Business Edition',
      badge: '💼 BUSINESS',
      tagline: 'Transform documents into decisions',
      monthlyWords: 20000,
      maxWorkspaces: 50,
      exportFormats: ['pdf', 'docx', 'markdown', 'html', 'pptx', 'xlsx'],
      templates: true,
      versionHistory: 0, // Unlimited
      collaboration: true,

      // ✨ BUSINESS-SPECIFIC ADVANCED FEATURES
      advancedFeatures: {
        // Phase 1 (MVP)
        smartWorkflow: true, // Auto next steps, key dates, pending items
        aiTagging: true, // Auto categorization
        decisionSnapshot: true, // PPT/Excel export

        // Phase 2 (Enhanced)
        legalFinanceLens: true, // Clause detection, compliance flags
        multiformatFusion: true, // PDF + Excel + Image analysis
        businessContextMemory: true, // Industry-aware context

        // Phase 3 (Advanced)
        voiceToAction: false, // Voice commands (future)
      },
    },

    features: {
      studio: false,
      documentIntelligence: true, // ✅ Enabled (Business tier)
      fileUpload: true,
      prioritySupport: true,
    },

    costs: {
      aiCostTotal: 260.0,
      studioCostTotal: 0,
      gatewayCost: 23.58,
      infraCostPerUser: 5,
      totalCost: 288.58,
      profit: 710.42,
      margin: 71.1,
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
    enabled: false, // ⏳ FUTURE LAUNCH
    order: 5,
    personality: 'Persona - premium companion with emotional depth',

    limits: {
      monthlyWords: 250000,
      dailyWords: 8333,
      botResponseLimit: 150,
      memoryDays: 25,
      contextMemory: 15,
      responseDelay: 2,
    },

    aiModels: [
      {
        provider: AIProvider.OPENAI,
        modelId: 'gpt-5',
        displayName: 'GPT-5',
        costPerWord: 0.000607,
      },
      {
        provider: AIProvider.CLAUDE,
        modelId: 'claude-sonnet-4.5',
        displayName: 'Claude Sonnet 4.5',
        fallback: true,
        costPerWord: 0.00104,
      },
    ],
    isHybrid: false,

    cooldownBooster: {
      type: 'COOLDOWN',
      name: 'Life Cooldown',
      price: 35,
      wordsUnlocked: 16666,
      duration: 0,
      maxPerPlanPeriod: 2,
      resetOn: 'plan_renewal',
      progressiveMultipliers: [2, 1.5],
      eligibilityCheck: {
        requiresWordsRemaining: 16666,
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
      wordsAdded: 120000,
      validity: 10,
      distributionLogic: 'Dynamic: 120K ÷ 10 days = 12K/day boost',
      maxPerMonth: 2,
      costs: {
        ai: 72.84,
        gateway: 5.88,
        total: 78.72,
        profit: 170.28,
        margin: 68.4,
      },
    },

    // ✨ DOCUMENT INTELLIGENCE - EMOTIONAL INTELLIGENCE TIER
    documentation: {
      enabled: true,
      tier: 'emotional_intelligence',
      displayName: 'Document Intelligence - Life Edition',
      badge: '💫 LIFE',
      tagline: 'Your documents, your story, your growth',
      monthlyWords: 20000,
      maxWorkspaces: 50,
      exportFormats: ['pdf', 'docx', 'markdown', 'html'],
      templates: true,
      versionHistory: 0, // Unlimited
      collaboration: false, // Not needed for personal docs

      // ✨ EMOTIONAL-SPECIFIC ADVANCED FEATURES
      advancedFeatures: {
        // Phase 1 (MVP)
        emotionalContextSummarizer: true, // Understands emotional tone
        memoryCapsule: true, // Highlights meaningful moments
        companionNotes: true, // Heartfelt AI responses

        // Phase 2 (Enhanced)
        thoughtOrganizer: true, // Dreams, Goals, Reflections
        aiScrapbook: true, // Visual growth journey
        lifeReflectionInsights: true, // Deep pattern analysis

        // Phase 3 (Advanced)
        handwritingEmotionReader: false, // Handwriting analysis (future)
      },
    },

    features: {
      studio: false,
      documentIntelligence: true, // ✅ Enabled (Emotional tier)
      fileUpload: true,
      prioritySupport: true,
    },

    costs: {
      aiCostTotal: 151.73,
      studioCostTotal: 0,
      gatewayCost: 28.3,
      infraCostPerUser: 5,
      totalCost: 185.03,
      profit: 1013.97,
      margin: 84.6,
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
export const COOLDOWN_MAX_PER_PERIOD = 2;
export const ADDON_MAX_PER_MONTH = 2;
export const MINIMUM_CREDITS = 2;
export const CREDITS_PER_RUPEE = 5;
export const CREDIT_FORMULA_MULTIPLIER = 3.5;
export const TRIAL_MAX_DAYS = 14;
export const FALLBACK_TRIGGER_RATE = 0.5;

export const USER_LOCATION = {
  city: 'Ferozepur',
  state: 'Punjab',
  country: 'IN',
} as const;

// ==========================================
// HELPER CONSTANTS FOR DOCUMENT INTELLIGENCE
// ==========================================

/**
 * Document Intelligence tier display info
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
  business_intelligence: {
    displayName: 'Document Intelligence - Business Edition',
    badge: '💼 BUSINESS',
    description: 'Transform documents into decisions',
  },
  emotional_intelligence: {
    displayName: 'Document Intelligence - Life Edition',
    badge: '💫 LIFE',
    description: 'Your documents, your story, your growth',
  },
} as const;

/**
 * Export formats supported per tier
 */
export const EXPORT_FORMATS_BY_TIER = {
  standard: ['pdf', 'markdown'],
  pro: ['pdf', 'docx', 'markdown', 'html'],
  business_intelligence: ['pdf', 'docx', 'markdown', 'html', 'pptx', 'xlsx'],
  emotional_intelligence: ['pdf', 'docx', 'markdown', 'html'],
} as const;
