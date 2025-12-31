// ============================================
// SORIVA HEALTH - PLAN LIMITS CONFIGURATION
// Path: src/config/health-plans.config.ts
// ============================================
// V4 - REFOCUSED: Safe Features Only
// NO: Scores, Risk, Predictions, Medical Claims
// YES: Storage, Organization, Education, Q&A
// ============================================

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGAL DISCLAIMER (IMPORTANT!)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Soriva Health is NOT a medical device or diagnostic tool.
// It helps users ORGANIZE and UNDERSTAND their health reports.
// It does NOT provide: diagnoses, scores, predictions, or recommendations.
// Users must ALWAYS consult qualified healthcare professionals.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type HealthPlan = 'FREE' | 'PERSONAL' | 'FAMILY';
export type HealthRegion = 'IN' | 'INTERNATIONAL';

// SAFE FEATURES ONLY - No medical claims
export interface HealthFeatureFlags {
  // Storage & Organization
  uploadReport: boolean;
  reportsList: boolean;
  downloadPDF: boolean;
  familyMembers: boolean;
  
  // Educational & Q&A (with disclaimers)
  healthChat: boolean;              // Q&A about reports
  termExplanation: boolean;         // "What does this term mean?"
  questionGenerator: boolean;       // "Questions to ask your doctor"
  
  // Comparison (side-by-side view, NO analysis)
  compareReports: boolean;
  
  // Timeline & Notes
  healthTimeline: boolean;          // Organize by date
  reportNotes: boolean;             // User's own notes
  
  // Reminders (non-medical)
  followUpReminders: boolean;       // "You have a follow-up due"
  
  // Utility
  nearbyHospitals: boolean;
}

export interface HealthPlanPricing {
  // India Monthly
  priceINR: number;
  priceInPaise: number;
  // India Yearly (2 months free)
  yearlyPriceINR: number;
  yearlyPriceInPaise: number;
  // International Monthly
  priceUSD: number;
  priceUSDInCents: number;
  // International Yearly (2 months free)
  yearlyPriceUSD: number;
  yearlyPriceUSDInCents: number;
}

export interface RegionLimits {
  pagesPerMonth: number;
  monthlyTokens: number;
  comparisonsPerMonth: number;
}

export interface HealthPlanConfig {
  pricing: HealthPlanPricing;
  india: RegionLimits;
  international: RegionLimits;
  maxFamilyMembers: number;
  historyMonths: number;            // How long to keep reports
  chatEnabled: boolean;
  usesTokenPool: boolean;
  features: HealthFeatureFlags;
}

export interface HealthUsageState {
  pagesUploaded: number;
  tokensUsed: number;
  comparisonsUsed: number;
  lastResetDate: Date;
}

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  remaining: number;
  limit: number;
  percentUsed: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const INTERNATIONAL_MULTIPLIER = 2.5;

export const TOKEN_ESTIMATES = {
  CHAT_SIMPLE: 500,
  CHAT_DETAILED: 1500,
  TERM_EXPLANATION: 800,
  QUESTION_GENERATOR: 1000,
  COMPARISON_VIEW: 2000,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LLM CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HEALTH_LLM_CONFIG = {
  CHAT: {
    MODEL: 'gemini-2.0-flash-lite',
    PROVIDER: 'gemini',
    MAX_TOKENS: 1500,
    TEMPERATURE: 0.7,
    COST_PER_1M_INR: 31,
  },
  EXPLANATION: {
    MODEL: 'gemini-2.0-flash',
    PROVIDER: 'gemini',
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.5,
    COST_PER_1M_INR: 62,
  },
  FALLBACK: {
    MODEL: 'gemini-2.0-flash-lite',
    PROVIDER: 'gemini',
    MAX_TOKENS: 1200,
    TEMPERATURE: 0.5,
  },
};

export type HealthLLMOperation = 'CHAT' | 'EXPLANATION' | 'QUESTIONS';

export function getHealthLLMConfig(operation: HealthLLMOperation) {
  switch (operation) {
    case 'CHAT':
      return HEALTH_LLM_CONFIG.CHAT;
    case 'EXPLANATION':
    case 'QUESTIONS':
      return HEALTH_LLM_CONFIG.EXPLANATION;
    default:
      return HEALTH_LLM_CONFIG.CHAT;
  }
}

export const SOFT_WARNINGS = {
  TOKENS_80_PERCENT: 0.8,
  TOKENS_95_PERCENT: 0.95,
  PAGES_80_PERCENT: 0.8,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN CONFIGURATIONS - SAFE FEATURES ONLY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HEALTH_PLAN_LIMITS: Record<HealthPlan, HealthPlanConfig> = {
  
  // ══════════════════════════════════════════════════════
  // FREE PLAN - For Soriva subscribers
  // ══════════════════════════════════════════════════════
  FREE: {
    pricing: {
      priceINR: 0,
      priceInPaise: 0,
      yearlyPriceINR: 0,
      yearlyPriceInPaise: 0,
      priceUSD: 0,
      priceUSDInCents: 0,
      yearlyPriceUSD: 0,
      yearlyPriceUSDInCents: 0,
    },
    
    india: {
      pagesPerMonth: 5,
      monthlyTokens: 0,           // Uses Soriva pool
      comparisonsPerMonth: 0,
    },
    
    international: {
      pagesPerMonth: 5,
      monthlyTokens: 0,
      comparisonsPerMonth: 0,
    },
    
    maxFamilyMembers: 1,
    historyMonths: 3,             // 3 months history
    chatEnabled: true,
    usesTokenPool: true,
    
    features: {
      uploadReport: true,
      reportsList: true,
      downloadPDF: false,
      familyMembers: false,
      healthChat: true,
      termExplanation: true,
      questionGenerator: false,
      compareReports: false,
      healthTimeline: false,
      reportNotes: false,
      followUpReminders: false,
      nearbyHospitals: true,
    },
  },

  // ══════════════════════════════════════════════════════
  // PERSONAL PLAN - ₹149/month | $4.99/month
  // ══════════════════════════════════════════════════════
  PERSONAL: {
    pricing: {
      priceINR: 149,
      priceInPaise: 14900,
      yearlyPriceINR: 1499,
      yearlyPriceInPaise: 149900,
      priceUSD: 4.99,
      priceUSDInCents: 499,
      yearlyPriceUSD: 49.99,
      yearlyPriceUSDInCents: 4999,
    },
    
    india: {
      pagesPerMonth: 25,
      monthlyTokens: 1000000,
      comparisonsPerMonth: 3,
    },
    
    international: {
      pagesPerMonth: 60,
      monthlyTokens: 2500000,
      comparisonsPerMonth: 7,
    },
    
    maxFamilyMembers: 2,
    historyMonths: 12,            // 1 year history
    chatEnabled: true,
    usesTokenPool: false,
    
    features: {
      uploadReport: true,
      reportsList: true,
      downloadPDF: true,
      familyMembers: true,
      healthChat: true,
      termExplanation: true,
      questionGenerator: true,
      compareReports: true,
      healthTimeline: true,
      reportNotes: true,
      followUpReminders: true,
      nearbyHospitals: true,
    },
  },

  // ══════════════════════════════════════════════════════
  // FAMILY PLAN - ₹299/month | $9.99/month
  // ══════════════════════════════════════════════════════
  FAMILY: {
    pricing: {
      priceINR: 299,
      priceInPaise: 29900,
      yearlyPriceINR: 2999,
      yearlyPriceInPaise: 299900,
      priceUSD: 9.99,
      priceUSDInCents: 999,
      yearlyPriceUSD: 99.99,
      yearlyPriceUSDInCents: 9999,
    },
    
    india: {
      pagesPerMonth: 100,
      monthlyTokens: 3000000,
      comparisonsPerMonth: 10,
    },
    
    international: {
      pagesPerMonth: 250,
      monthlyTokens: 7500000,
      comparisonsPerMonth: 25,
    },
    
    maxFamilyMembers: 5,
    historyMonths: 0,             // 0 = Unlimited history
    chatEnabled: true,
    usesTokenPool: false,
    
    features: {
      uploadReport: true,
      reportsList: true,
      downloadPDF: true,
      familyMembers: true,
      healthChat: true,
      termExplanation: true,
      questionGenerator: true,
      compareReports: true,
      healthTimeline: true,
      reportNotes: true,
      followUpReminders: true,
      nearbyHospitals: true,
    },
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getHealthRegion(countryCode: string): HealthRegion {
  return countryCode === 'IN' ? 'IN' : 'INTERNATIONAL';
}

export function getPlanLimits(plan: HealthPlan, region: HealthRegion = 'IN') {
  const planConfig = HEALTH_PLAN_LIMITS[plan];
  const limits = region === 'IN' ? planConfig.india : planConfig.international;
  
  return {
    ...limits,
    maxFamilyMembers: planConfig.maxFamilyMembers,
    historyMonths: planConfig.historyMonths,
    chatEnabled: planConfig.chatEnabled,
    usesTokenPool: planConfig.usesTokenPool,
    features: planConfig.features,
  };
}

export function getPlanPricing(
  plan: HealthPlan, 
  region: HealthRegion = 'IN',
  billing: 'monthly' | 'yearly' = 'monthly'
) {
  const { pricing } = HEALTH_PLAN_LIMITS[plan];
  
  if (region === 'IN') {
    const price = billing === 'yearly' ? pricing.yearlyPriceINR : pricing.priceINR;
    const priceSmall = billing === 'yearly' ? pricing.yearlyPriceInPaise : pricing.priceInPaise;
    const period = billing === 'yearly' ? '/year' : '/month';
    const savings = billing === 'yearly' ? Math.round(pricing.priceINR * 2) : 0;
    
    return {
      price,
      priceInSmallestUnit: priceSmall,
      currency: 'INR',
      symbol: '₹',
      billing,
      display: price === 0 ? 'Free' : `₹${price}${period}`,
      savings: savings > 0 ? `Save ₹${savings}` : null,
    };
  }
  
  const price = billing === 'yearly' ? pricing.yearlyPriceUSD : pricing.priceUSD;
  const priceSmall = billing === 'yearly' ? pricing.yearlyPriceUSDInCents : pricing.priceUSDInCents;
  const period = billing === 'yearly' ? '/year' : '/month';
  const savings = billing === 'yearly' ? (pricing.priceUSD * 2).toFixed(2) : '0';
  
  return {
    price,
    priceInSmallestUnit: priceSmall,
    currency: 'USD',
    symbol: '$',
    billing,
    display: price === 0 ? 'Free' : `$${price}${period}`,
    savings: parseFloat(savings) > 0 ? `Save $${savings}` : null,
  };
}

export function isFeatureAvailable(
  plan: HealthPlan,
  feature: keyof HealthFeatureFlags
): boolean {
  return HEALTH_PLAN_LIMITS[plan].features[feature];
}

export function canUploadPages(
  plan: HealthPlan,
  usage: HealthUsageState,
  pagesToUpload: number,
  region: HealthRegion = 'IN'
): UsageCheckResult {
  const limits = getPlanLimits(plan, region);
  const remaining = limits.pagesPerMonth - usage.pagesUploaded;

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `Monthly page limit reached (${limits.pagesPerMonth} pages)`,
      remaining: 0,
      limit: limits.pagesPerMonth,
      percentUsed: 100,
    };
  }

  if (pagesToUpload > remaining) {
    return {
      allowed: false,
      reason: `Not enough pages remaining. You have ${remaining} pages left.`,
      remaining,
      limit: limits.pagesPerMonth,
      percentUsed: (usage.pagesUploaded / limits.pagesPerMonth) * 100,
    };
  }

  return {
    allowed: true,
    remaining: remaining - pagesToUpload,
    limit: limits.pagesPerMonth,
    percentUsed: ((usage.pagesUploaded + pagesToUpload) / limits.pagesPerMonth) * 100,
  };
}

export function canSendChat(
  plan: HealthPlan,
  usage: HealthUsageState,
  region: HealthRegion = 'IN',
  estimatedTokens: number = TOKEN_ESTIMATES.CHAT_DETAILED
): UsageCheckResult & { showWarning?: boolean; warningType?: 'soft' | 'urgent' } {
  const limits = getPlanLimits(plan, region);

  if (!limits.chatEnabled) {
    return {
      allowed: false,
      reason: 'Health Chat not available',
      remaining: 0,
      limit: 0,
      percentUsed: 100,
    };
  }

  if (limits.usesTokenPool) {
    return {
      allowed: true,
      remaining: 0,
      limit: 0,
      percentUsed: 0,
    };
  }

  const tokensRemaining = limits.monthlyTokens - usage.tokensUsed;
  const percentUsed = (usage.tokensUsed / limits.monthlyTokens) * 100;

  if (tokensRemaining < estimatedTokens) {
    return {
      allowed: false,
      reason: 'Monthly token limit reached. Your quota resets next month.',
      remaining: tokensRemaining,
      limit: limits.monthlyTokens,
      percentUsed: Math.min(percentUsed, 100),
    };
  }

  let showWarning = false;
  let warningType: 'soft' | 'urgent' | undefined;

  if (percentUsed >= SOFT_WARNINGS.TOKENS_95_PERCENT * 100) {
    showWarning = true;
    warningType = 'urgent';
  } else if (percentUsed >= SOFT_WARNINGS.TOKENS_80_PERCENT * 100) {
    showWarning = true;
    warningType = 'soft';
  }

  return {
    allowed: true,
    remaining: tokensRemaining,
    limit: limits.monthlyTokens,
    percentUsed,
    showWarning,
    warningType,
  };
}

export function canCompareReports(
  plan: HealthPlan,
  usage: HealthUsageState,
  region: HealthRegion = 'IN'
): UsageCheckResult {
  const limits = getPlanLimits(plan, region);
  const planConfig = HEALTH_PLAN_LIMITS[plan];

  if (!planConfig.features.compareReports) {
    return {
      allowed: false,
      reason: 'Report Comparison not available on FREE plan. Upgrade to Personal or Family.',
      remaining: 0,
      limit: 0,
      percentUsed: 100,
    };
  }

  const remaining = limits.comparisonsPerMonth - usage.comparisonsUsed;

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `Monthly comparison limit reached (${limits.comparisonsPerMonth})`,
      remaining: 0,
      limit: limits.comparisonsPerMonth,
      percentUsed: 100,
    };
  }

  return {
    allowed: true,
    remaining,
    limit: limits.comparisonsPerMonth,
    percentUsed: (usage.comparisonsUsed / limits.comparisonsPerMonth) * 100,
  };
}

export function calculateTokensUsed(
  inputTokens: number,
  outputTokens: number
): number {
  return inputTokens + outputTokens;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISPLAY INFO (For Frontend)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HEALTH_PLAN_DISPLAY: Record<HealthPlan, {
  name: string;
  tagline: string;
  description: string;
  badge: string | null;
  color: string;
  icon: string;
}> = {
  FREE: {
    name: 'Health Free',
    tagline: 'Organize your reports',
    description: 'For Soriva subscribers - basic report storage',
    badge: 'INCLUDED',
    color: '#6B7280',
    icon: '📋',
  },
  PERSONAL: {
    name: 'Health Personal',
    tagline: 'For you + 1 family member',
    description: 'Full organization, timeline, and Q&A features',
    badge: 'POPULAR',
    color: '#10B981',
    icon: '💚',
  },
  FAMILY: {
    name: 'Health Family',
    tagline: 'For the whole family',
    description: 'Unlimited history, 5 members, priority support',
    badge: 'BEST VALUE',
    color: '#6366F1',
    icon: '👨‍👩‍👧‍👦',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEATURE COMPARISON (For Pricing Page) - SAFE ONLY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getFeatureComparison(region: HealthRegion = 'IN') {
  const freeLimits = getPlanLimits('FREE', region);
  const personalLimits = getPlanLimits('PERSONAL', region);
  const familyLimits = getPlanLimits('FAMILY', region);
  
  const personalPricing = getPlanPricing('PERSONAL', region);
  const familyPricing = getPlanPricing('FAMILY', region);

  return [
    {
      feature: 'Monthly Report Pages',
      free: `${freeLimits.pagesPerMonth} pages`,
      personal: `${personalLimits.pagesPerMonth} pages`,
      family: `${familyLimits.pagesPerMonth} pages`,
    },
    {
      feature: 'AI Questions',
      free: 'Uses Soriva quota',
      personal: `${(personalLimits.monthlyTokens / 1000000).toFixed(1)}M tokens`,
      family: `${(familyLimits.monthlyTokens / 1000000).toFixed(1)}M tokens`,
    },
    {
      feature: 'Family Members',
      free: '1 (Self)',
      personal: `${personalLimits.maxFamilyMembers} members`,
      family: `${familyLimits.maxFamilyMembers} members`,
    },
    {
      feature: 'Report Comparisons',
      free: '❌',
      personal: `${personalLimits.comparisonsPerMonth}/month`,
      family: `${familyLimits.comparisonsPerMonth}/month`,
    },
    {
      feature: 'Report History',
      free: '3 months',
      personal: '12 months',
      family: 'Unlimited',
    },
    {
      feature: 'Health Timeline',
      free: '❌',
      personal: '✅',
      family: '✅',
    },
    {
      feature: 'Term Explanations',
      free: '✅',
      personal: '✅',
      family: '✅',
    },
    {
      feature: 'Doctor Question Generator',
      free: '❌',
      personal: '✅',
      family: '✅',
    },
    {
      feature: 'Follow-up Reminders',
      free: '❌',
      personal: '✅',
      family: '✅',
    },
    {
      feature: 'PDF Download',
      free: '❌',
      personal: '✅',
      family: '✅',
    },
    {
      feature: 'Price',
      free: 'Free',
      personal: personalPricing.display,
      family: familyPricing.display,
    },
  ];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COST & MARGIN ANALYSIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HEALTH_COSTS = {
  LLM_COST_PER_1M_INR: 31,
  OCR_COST_PER_1000_PAGES_USD: 1.50,
  INFRA_COST_INR: 10,
  GATEWAY_PERCENT: 2.5,
  
  PERSONAL_INDIA: {
    MONTHLY_TOKENS: 1000000,
    LLM_COST_INR: 31,
    OCR_COST_INR: 2,
    INFRA_COST_INR: 10,
    GATEWAY_COST_INR: 3.7,
    TOTAL_COST_INR: 46.7,
    REVENUE_INR: 149,
    PROFIT_INR: 102.3,
    MARGIN_PERCENT: 69,
  },
  
  PERSONAL_INTERNATIONAL: {
    MONTHLY_TOKENS: 2500000,
    LLM_COST_INR: 77.5,
    OCR_COST_INR: 5,
    INFRA_COST_INR: 10,
    GATEWAY_COST_INR: 10.4,
    TOTAL_COST_INR: 102.9,
    REVENUE_INR: 415,           // $4.99 @ ₹83
    PROFIT_INR: 312.1,
    MARGIN_PERCENT: 75,
  },
  
  FAMILY_INDIA: {
    MONTHLY_TOKENS: 3000000,
    LLM_COST_INR: 93,
    OCR_COST_INR: 8,
    INFRA_COST_INR: 15,
    GATEWAY_COST_INR: 7.5,
    TOTAL_COST_INR: 123.5,
    REVENUE_INR: 299,
    PROFIT_INR: 175.5,
    MARGIN_PERCENT: 59,
  },
  
  FAMILY_INTERNATIONAL: {
    MONTHLY_TOKENS: 7500000,
    LLM_COST_INR: 232.5,
    OCR_COST_INR: 20,
    INFRA_COST_INR: 15,
    GATEWAY_COST_INR: 29,
    TOTAL_COST_INR: 296.5,
    REVENUE_INR: 829,           // $9.99 @ ₹83
    PROFIT_INR: 532.5,
    MARGIN_PERCENT: 64,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WARNING MESSAGES (Friendly, not medical)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const WARNING_MESSAGES = {
  TOKENS_80: {
    title: "You're making great progress!",
    message: "You've used 80% of your monthly questions. Keep organizing!",
  },
  TOKENS_95: {
    title: "Almost there!",
    message: "You've used 95% of your monthly questions. Consider upgrading for more.",
  },
  PAGES_80: {
    title: "Active month!",
    message: "You've uploaded 80% of your monthly pages. Great job staying organized!",
  },
  LIMIT_REACHED: {
    title: "Monthly limit reached",
    message: "Your quota resets on the 1st of next month. Upgrade anytime for more.",
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISCLAIMER CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HEALTH_DISCLAIMERS = {
  MAIN: `This feature helps you organize and understand information in your health reports. It does not provide medical diagnoses, scores, predictions, or recommendations. Always consult a qualified healthcare professional for medical advice.`,
  
  CHAT: `I can help explain medical terms and suggest questions for your doctor, but I'm not a medical professional. Please consult your healthcare provider for medical advice.`,
  
  COMPARISON: `This comparison shows your reports side-by-side for reference. It does not analyze or interpret the medical significance of any changes. Please discuss any concerns with your doctor.`,
  
  QUESTIONS: `These are suggested questions to help you prepare for your doctor's appointment. Your doctor can provide personalized medical advice based on your complete health history.`,
};