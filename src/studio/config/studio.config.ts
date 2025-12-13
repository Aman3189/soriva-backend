// src/studio/config/studio.config.ts
// ============================================================================
// SORIVA STUDIO v2.0 - December 2025
// ============================================================================
// Centralized configuration for all Studio features
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
    // Plan-based monthly credits
    planCredits: {
      STARTER: 0,
      PLUS: 250,
      PRO: 500,
      APEX: 1500,
    },

    // Booster packages
    boosters: {
      LITE: { credits: 350, price: 99, validity: 60 },
      PRO: { credits: 1000, price: 249, validity: 60 },
      MAX: { credits: 2500, price: 499, validity: 60 },
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
    TEXT_TO_IMAGE: 10,
    LOGO_GENERATION: 10,
    OBJECT_REMOVE: 20,
    BACKGROUND_CHANGE: 20,
    PORTRAIT_STUDIO: 20,
    SKETCH_COMPLETE: 20,
    PHOTO_ENHANCE: 20,
    BACKGROUND_EXPAND: 20,
    STYLE_TRANSFER: 20,
    CELEBRITY_MERGE: 20,
    BABY_PREDICTION: 30,
    TALKING_PHOTO_5S: 40,
    TALKING_PHOTO_10S: 80,
    VIDEO_5S: 200,
    VIDEO_10S: 400,
  },

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

export function getFeatureCredits(featureType: keyof typeof STUDIO_CONFIG.featureCredits): number {
  return STUDIO_CONFIG.featureCredits[featureType] || 0;
}

export function getPlanCredits(planType: string): number {
  return STUDIO_CONFIG.credits.planCredits[planType as keyof typeof STUDIO_CONFIG.credits.planCredits] || 0;
}

export function getBoosterConfig(boosterType: 'LITE' | 'PRO' | 'MAX') {
  return STUDIO_CONFIG.credits.boosters[boosterType];
}

export function getAspectRatio(ratio: keyof typeof STUDIO_CONFIG.aspectRatios) {
  return STUDIO_CONFIG.aspectRatios[ratio];
}

export function getBananaEndpoint(feature: keyof typeof STUDIO_CONFIG.providers.bananaPro.endpoints): string {
  const baseUrl = STUDIO_CONFIG.providers.bananaPro.baseUrl;
  const endpoint = STUDIO_CONFIG.providers.bananaPro.endpoints[feature];
  return `${baseUrl}${endpoint}`;
}