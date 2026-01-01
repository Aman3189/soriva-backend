// src/studio/config/studio.config.ts
// ============================================================================
// SORIVA STUDIO v2.1 - January 2026
// ============================================================================
// Centralized configuration for all Studio features
// Updated: Plan-based feature access control
// ============================================================================

export const STUDIO_CONFIG = {
  // ==========================================================================
  // API PROVIDERS
  // ==========================================================================
  providers: {
    // IDEOGRAM - Text-to-Image & Logo
    ideogram: {
      enabled: true,
      apiKey: process.env.IDEOGRAM_API_KEY || '',
      baseUrl: 'https://api.ideogram.ai',
      version: 'v2',
      costPerGeneration: 1.70, // ₹1.70
    },

    // BANANA PRO - Photo Transform (8 features)
    bananaPro: {
      enabled: true,
      apiKey: process.env.BANANA_PRO_API_KEY || '',
      baseUrl: process.env.BANANA_PRO_URL || 'https://api.banana.dev/v1',
      costPerTransform: 3.30, // ₹3.30
      endpoints: {
        objectRemove: '/remove-object',
        backgroundChange: '/change-background',
        portraitStudio: '/portrait-enhance',
        sketchComplete: '/sketch-to-image',
        photoEnhance: '/enhance',
        backgroundExpand: '/expand-background',
        styleTransfer: '/style-transfer',
        celebrityMerge: '/face-merge',
        babyPrediction: '/baby-prediction',
      },
    },

    // HEDRA - Talking Photos
    hedra: {
      enabled: true,
      apiKey: process.env.HEDRA_API_KEY || '',
      baseUrl: process.env.HEDRA_URL || 'https://api.hedra.com/v1',
      cost5s: 6.00, // ₹6.00
      cost10s: 12.00, // ₹12.00
      maxPollAttempts: 60,
      pollIntervalMs: 2000,
    },

    // KLING - Video Generation (Coming Soon)
    kling: {
      enabled: false,
      apiKey: process.env.KLING_API_KEY || '',
      baseUrl: process.env.KLING_URL || 'https://api.kling.ai/v1',
      cost5s: 65.00, // ₹65.00
      cost10s: 127.00, // ₹127.00
    },

    // ANTHROPIC - Prompt Enhancement
    anthropic: {
      enabled: true,
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-3-5-haiku-20241022',
      maxTokens: 200,
      costPerEnhancement: 0.02,
    },
  },

  // ==========================================================================
  // CREDITS CONFIGURATION
  // ==========================================================================
  credits: {
    // Plan-based monthly credits - INDIA
    planCredits: {
      STARTER: 0,
      PLUS: 350,
      PRO: 650,
      APEX: 1000,
      SOVEREIGN: 2000,
    },

    // Plan-based monthly credits - INTERNATIONAL
    planCreditsInternational: {
      STARTER: 0,
      PLUS: 1750,
      PRO: 3000,
      APEX: 3000,
      SOVEREIGN: 5000,
    },

    // Booster packages (India pricing)
    boosters: {
      LITE: { credits: 350, price: 99, validity: 60 },
      PRO: { credits: 1000, price: 249, validity: 60 },
      MAX: { credits: 2500, price: 499, validity: 60 },
    },

    // Booster packages (International pricing)
    boostersInternational: {
      LITE: { credits: 1050, priceUSD: 4.99, validity: 60 },
      PRO: { credits: 4237, priceUSD: 19.99, validity: 60 },
      MAX: { credits: 6362, priceUSD: 29.99, validity: 60 },
    },

    // Carry forward rules
    carryForward: {
      enabled: true,
      maxPercent: 50, // Max 50% of plan credits
    },

    // Spending order
    spendingOrder: ['monthly', 'carryForward', 'booster'],
  },

  // ==========================================================================
  // FEATURE CREDITS
  // ==========================================================================
  featureCredits: {
    // Ideogram (Text-to-Image)
    TEXT_TO_IMAGE: 10,
    LOGO_GENERATION: 10,

    // Banana PRO (Photo Transform)
    OBJECT_REMOVE: 20,
    BACKGROUND_CHANGE: 20,
    PORTRAIT_STUDIO: 20,
    SKETCH_COMPLETE: 20,
    PHOTO_ENHANCE: 20,
    BACKGROUND_EXPAND: 20,
    STYLE_TRANSFER: 20,

    // Sensitive Features (PRO+ only)
    CELEBRITY_MERGE: 20,
    BABY_PREDICTION: 30,

    // Hedra (Talking Photos) - PRO+ only
    TALKING_PHOTO_5S: 40,
    TALKING_PHOTO_10S: 80,

    // Kling (Video) - Coming Soon
    VIDEO_5S: 200,
    VIDEO_10S: 400,
  },

  // ==========================================================================
  // PLAN FEATURE ACCESS (NEW)
  // ==========================================================================
  // PLUS = Images only (no talking photos, no sensitive features)
  // PRO/APEX/SOVEREIGN = Full access
  // ==========================================================================
  planFeatureAccess: {
    STARTER: [] as string[],

    PLUS: [
      'TEXT_TO_IMAGE',
      'LOGO_GENERATION',
      'OBJECT_REMOVE',
      'BACKGROUND_CHANGE',
      'PORTRAIT_STUDIO',
      'PHOTO_ENHANCE',
      'STYLE_TRANSFER',
      'BACKGROUND_EXPAND',
      'SKETCH_COMPLETE',
    ],

    PRO: 'ALL' as const,
    APEX: 'ALL' as const,
    SOVEREIGN: 'ALL' as const,
  },

  // Features excluded from PLUS (for reference)
  plusExcludedFeatures: [
    'TALKING_PHOTO_5S',
    'TALKING_PHOTO_10S',
    'CELEBRITY_MERGE',
    'BABY_PREDICTION',
    'VIDEO_5S',
    'VIDEO_10S',
  ],

  // ==========================================================================
  // FEATURE FLAGS
  // ==========================================================================
  features: {
    textToImage: true,
    logoGeneration: true,
    objectRemove: true,
    backgroundChange: true,
    portraitStudio: true,
    sketchComplete: true,
    photoEnhance: true,
    backgroundExpand: true,
    styleTransfer: true,
    celebrityMerge: true,
    babyPrediction: true,
    talkingPhoto5s: true,
    talkingPhoto10s: true,
    video5s: false, // Coming soon
    video10s: false, // Coming soon
    promptEnhancement: true,
  },

  // ==========================================================================
  // ASPECT RATIOS (Ideogram)
  // ==========================================================================
  aspectRatios: {
    square: { width: 1024, height: 1024 },
    landscape: { width: 1024, height: 768 },
    portrait: { width: 768, height: 1024 },
    wide: { width: 1024, height: 576 },
    tall: { width: 576, height: 1024 },
  },

  // ==========================================================================
  // VOICE STYLES (Hedra)
  // ==========================================================================
  voiceStyles: ['male', 'female', 'child'],

  // ==========================================================================
  // CRON SCHEDULES
  // ==========================================================================
  cron: {
    monthlyReset: '0 0 1 * *', // 1st of month, 00:00
    boosterExpiry: '0 1 * * *', // Daily at 01:00
    timezone: 'Asia/Kolkata',
  },
};

// ==========================================================================
// TYPE DEFINITIONS
// ==========================================================================

export type StudioFeature = keyof typeof STUDIO_CONFIG.featureCredits;
export type PlanType = keyof typeof STUDIO_CONFIG.planFeatureAccess;
export type Region = 'IN' | 'INTL';

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

export function isProviderEnabled(
  provider: 'ideogram' | 'bananaPro' | 'hedra' | 'kling' | 'anthropic'
): boolean {
  return STUDIO_CONFIG.providers[provider].enabled;
}

export function isFeatureEnabled(feature: keyof typeof STUDIO_CONFIG.features): boolean {
  return STUDIO_CONFIG.features[feature];
}

export function getFeatureCredits(featureType: StudioFeature): number {
  return STUDIO_CONFIG.featureCredits[featureType] || 0;
}

/**
 * Get plan credits based on region
 * @param planType - STARTER, PLUS, PRO, APEX, SOVEREIGN
 * @param region - 'IN' for India, 'INTL' for International
 * @returns Number of credits for the plan
 */
export function getPlanCredits(planType: string, region: Region = 'IN'): number {
  if (region === 'INTL') {
    return (
      STUDIO_CONFIG.credits.planCreditsInternational[
        planType as keyof typeof STUDIO_CONFIG.credits.planCreditsInternational
      ] || 0
    );
  }
  return (
    STUDIO_CONFIG.credits.planCredits[
      planType as keyof typeof STUDIO_CONFIG.credits.planCredits
    ] || 0
  );
}

/**
 * Get booster config based on region
 * @param boosterType - LITE, PRO, MAX
 * @param region - 'IN' for India, 'INTL' for International
 * @returns Booster configuration
 */
export function getBoosterConfig(
  boosterType: 'LITE' | 'PRO' | 'MAX',
  region: Region = 'IN'
) {
  if (region === 'INTL') {
    return STUDIO_CONFIG.credits.boostersInternational[boosterType];
  }
  return STUDIO_CONFIG.credits.boosters[boosterType];
}

export function getAspectRatio(ratio: keyof typeof STUDIO_CONFIG.aspectRatios) {
  return STUDIO_CONFIG.aspectRatios[ratio];
}

export function getBananaEndpoint(
  feature: keyof typeof STUDIO_CONFIG.providers.bananaPro.endpoints
): string {
  const baseUrl = STUDIO_CONFIG.providers.bananaPro.baseUrl;
  const endpoint = STUDIO_CONFIG.providers.bananaPro.endpoints[feature];
  return `${baseUrl}${endpoint}`;
}

// ==========================================================================
// PLAN FEATURE ACCESS FUNCTIONS (NEW)
// ==========================================================================

/**
 * Check if a plan can access a specific studio feature
 * @param planType - STARTER, PLUS, PRO, APEX, SOVEREIGN
 * @param feature - Studio feature to check
 * @returns boolean - true if plan can access the feature
 *
 * @example
 * canAccessStudioFeature('PLUS', 'TEXT_TO_IMAGE') // true
 * canAccessStudioFeature('PLUS', 'TALKING_PHOTO_5S') // false
 * canAccessStudioFeature('PRO', 'TALKING_PHOTO_5S') // true
 */
export function canAccessStudioFeature(
  planType: string,
  feature: StudioFeature
): boolean {
  const access =
    STUDIO_CONFIG.planFeatureAccess[
      planType as keyof typeof STUDIO_CONFIG.planFeatureAccess
    ];

  // No access defined = no features
  if (!access) return false;

  // Empty array = no features (STARTER)
  if (Array.isArray(access) && access.length === 0) return false;

  // 'ALL' = full access (PRO, APEX, SOVEREIGN)
  if (access === 'ALL') return true;

  // Check if feature is in allowed list (PLUS)
  return access.includes(feature);
}

/**
 * Get all accessible features for a plan
 * @param planType - STARTER, PLUS, PRO, APEX, SOVEREIGN
 * @returns Array of accessible feature names
 *
 * @example
 * getAccessibleFeatures('PLUS') // ['TEXT_TO_IMAGE', 'LOGO_GENERATION', ...]
 * getAccessibleFeatures('PRO') // All features
 */
export function getAccessibleFeatures(planType: string): StudioFeature[] {
  const access =
    STUDIO_CONFIG.planFeatureAccess[
      planType as keyof typeof STUDIO_CONFIG.planFeatureAccess
    ];

  // No access = empty
  if (!access) return [];

  // Empty array = no features
  if (Array.isArray(access) && access.length === 0) return [];

  // 'ALL' = all features
  if (access === 'ALL') {
    return Object.keys(STUDIO_CONFIG.featureCredits) as StudioFeature[];
  }

  // Return the specific list
  return access as StudioFeature[];
}

/**
 * Get excluded features for a plan
 * @param planType - Plan to check
 * @returns Array of excluded feature names
 *
 * @example
 * getExcludedFeatures('PLUS') // ['TALKING_PHOTO_5S', 'CELEBRITY_MERGE', ...]
 * getExcludedFeatures('PRO') // []
 */
export function getExcludedFeatures(planType: string): StudioFeature[] {
  const allFeatures = Object.keys(STUDIO_CONFIG.featureCredits) as StudioFeature[];
  const accessibleFeatures = getAccessibleFeatures(planType);

  return allFeatures.filter((f) => !accessibleFeatures.includes(f));
}

/**
 * Check if feature is a premium/sensitive feature
 * @param feature - Feature to check
 * @returns boolean - true if premium/sensitive
 */
export function isPremiumFeature(feature: StudioFeature): boolean {
  const premiumFeatures: StudioFeature[] = [
    'TALKING_PHOTO_5S',
    'TALKING_PHOTO_10S',
    'CELEBRITY_MERGE',
    'BABY_PREDICTION',
    'VIDEO_5S',
    'VIDEO_10S',
  ];

  return premiumFeatures.includes(feature);
}

/**
 * Get upgrade message for blocked feature
 * @param feature - Blocked feature
 * @param currentPlan - User's current plan
 * @returns Upgrade message string
 */
export function getUpgradeMessage(
  feature: StudioFeature,
  currentPlan: string
): string {
  const featureNames: Record<string, string> = {
    TALKING_PHOTO_5S: 'Talking Photos (5s)',
    TALKING_PHOTO_10S: 'Talking Photos (10s)',
    CELEBRITY_MERGE: 'Celebrity Merge',
    BABY_PREDICTION: 'Baby Prediction',
    VIDEO_5S: 'Video Generation (5s)',
    VIDEO_10S: 'Video Generation (10s)',
  };

  const featureName = featureNames[feature] || feature;

  if (currentPlan === 'STARTER') {
    return `${featureName} requires Soriva Plus or higher. Upgrade to unlock Studio features!`;
  }

  if (currentPlan === 'PLUS') {
    return `${featureName} is available on Soriva Pro and above. Upgrade to unlock all creative tools!`;
  }

  return `${featureName} is not available on your current plan.`;
}

/**
 * Validate feature access and return detailed result
 * @param planType - User's plan
 * @param feature - Feature to access
 * @param creditsRequired - Credits needed (optional, auto-calculated)
 * @param userCredits - User's available credits
 * @returns Validation result with details
 */
export function validateFeatureAccess(
  planType: string,
  feature: StudioFeature,
  userCredits: number,
  creditsRequired?: number
): {
  allowed: boolean;
  reason: string;
  creditsNeeded: number;
  upgradeRequired: boolean;
  message: string;
} {
  // Check plan access first
  if (!canAccessStudioFeature(planType, feature)) {
    return {
      allowed: false,
      reason: 'PLAN_RESTRICTED',
      creditsNeeded: 0,
      upgradeRequired: true,
      message: getUpgradeMessage(feature, planType),
    };
  }

  // Check credits
  const credits = creditsRequired ?? getFeatureCredits(feature);

  if (userCredits < credits) {
    return {
      allowed: false,
      reason: 'INSUFFICIENT_CREDITS',
      creditsNeeded: credits - userCredits,
      upgradeRequired: false,
      message: `You need ${credits - userCredits} more credits. Purchase a booster to continue!`,
    };
  }

  return {
    allowed: true,
    reason: 'OK',
    creditsNeeded: 0,
    upgradeRequired: false,
    message: 'Feature access granted',
  };
}