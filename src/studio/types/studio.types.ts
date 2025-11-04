// src/modules/studio/types/studio.types.ts
// ✅ FINAL UPDATE: 1₹ = 5 credits | Base 30% margin | Preview 10% margin | No free preview

import { StudioFeatureType, StudioBoosterType, GenerationStatus } from '@prisma/client';

// ==========================================
// FEATURE PRICING CONFIGURATION
// ==========================================

export interface FeaturePricing {
  featureType: StudioFeatureType;
  name: string;
  description: string;
  baseCredits: number; // Base generation cost (30% margin)
  previewCredits: number; // Preview/regeneration cost (10% margin)
  maxFreeRetries: number; // No free previews
  estimatedApiCost: number; // Actual GPU/API cost in INR
  processingTime: string; // Estimated processing time
  outputType: 'image' | 'video' | 'text' | 'json';
}

export const FEATURE_PRICING: Record<StudioFeatureType, FeaturePricing> = {
  IMAGE_GENERATION_512: {
    featureType: 'IMAGE_GENERATION_512',
    name: 'AI Image (512×512)',
    description: 'Generate AI images in standard quality',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.25,
    processingTime: '3-5 seconds',
    outputType: 'image',
  },
  IMAGE_GENERATION_1024: {
    featureType: 'IMAGE_GENERATION_1024',
    name: 'AI Image (1024×1024)',
    description: 'Generate AI images in high quality',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.40,
    processingTime: '5-8 seconds',
    outputType: 'image',
  },
  BACKGROUND_REMOVAL: {
    featureType: 'BACKGROUND_REMOVAL',
    name: 'Background Removal',
    description: 'Remove background from images with AI',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.15,
    processingTime: '2-3 seconds',
    outputType: 'image',
  },
  IMAGE_UPSCALE_2X: {
    featureType: 'IMAGE_UPSCALE_2X',
    name: 'Image Upscale (2×)',
    description: 'Upscale images to 2× resolution',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.25,
    processingTime: '3-5 seconds',
    outputType: 'image',
  },
  IMAGE_UPSCALE_4X: {
    featureType: 'IMAGE_UPSCALE_4X',
    name: 'Image Upscale (4×)',
    description: 'Upscale images to 4× resolution',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.40,
    processingTime: '5-8 seconds',
    outputType: 'image',
  },
  TEXT_TO_SPEECH: {
    featureType: 'TEXT_TO_SPEECH',
    name: 'Text to Speech',
    description: 'Convert text to natural human speech',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.05,
    processingTime: '1 second',
    outputType: 'text',
  },
  VOICE_CLONE: {
    featureType: 'VOICE_CLONE',
    name: 'Voice Cloning',
    description: 'Clone any voice with AI',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.10,
    processingTime: '1-2 seconds',
    outputType: 'text',
  },
  VIDEO_5SEC: {
    featureType: 'VIDEO_5SEC',
    name: 'AI Video (5 seconds)',
    description: 'Generate short AI-powered videos',
    baseCredits: 40,
    previewCredits: 35,
    maxFreeRetries: 0,
    estimatedApiCost: 6.0,
    processingTime: '1-2 minutes',
    outputType: 'video',
  },
  VIDEO_15SEC: {
    featureType: 'VIDEO_15SEC',
    name: 'AI Video (15 seconds)',
    description: 'Generate AI-powered videos',
    baseCredits: 80,
    previewCredits: 65,
    maxFreeRetries: 0,
    estimatedApiCost: 12.0,
    processingTime: '3-4 minutes',
    outputType: 'video',
  },
  VIDEO_30SEC: {
    featureType: 'VIDEO_30SEC',
    name: 'AI Video (30 seconds)',
    description: 'Generate long AI-powered videos',
    baseCredits: 155,
    previewCredits: 130,
    maxFreeRetries: 0,
    estimatedApiCost: 24.0,
    processingTime: '6-8 minutes',
    outputType: 'video',
  },
};

// ==========================================
// BOOSTER CONFIGURATION
// ==========================================

export interface BoosterConfig {
  type: StudioBoosterType;
  name: string;
  credits: number;
  price: number; // Price in INR
  validityDays: number;
  valueInRupees: number; // Actual usage value user gets
}

export const BOOSTER_CONFIGS: Record<StudioBoosterType, BoosterConfig> = {
  LITE: {
    type: 'LITE',
    name: 'Studio Lite',
    credits: 300,
    price: 99,
    validityDays: 30,
    valueInRupees: 60, // 300 credits ÷ 5 = ₹60
  },
  PRO: {
    type: 'PRO',
    name: 'Studio Pro',
    credits: 1250,
    price: 399,
    validityDays: 30,
    valueInRupees: 250, // 1250 credits ÷ 5 = ₹250
  },
  MAX: {
    type: 'MAX',
    name: 'Studio Max',
    credits: 2250,
    price: 599,
    validityDays: 30,
    valueInRupees: 450, // 2250 credits ÷ 5 = ₹450
  },
};

// ==========================================
// PLAN BONUS CREDITS
// ==========================================

export const PLAN_BONUS_CREDITS: Record<string, number> = {
  STARTER: 0,
  PLUS: 125, // ₹149 plan → ₹25 bonus → 25 × 5 = 125 credits
  PRO: 500, // ₹399 plan → ₹100 bonus → 100 × 5 = 500 credits
  EDGE: 0, // Future launch
  LIFE: 0, // Future launch
};

// ==========================================
// CREDIT CONVERSION CONSTANTS
// ==========================================

export const CREDIT_CONVERSION = {
  CREDITS_PER_RUPEE: 5, // ✅ CHANGED: 1 rupee = 5 credits
  RUPEES_PER_CREDIT: 0.20, // ✅ CHANGED: 1 credit = ₹0.20
} as const;

// ==========================================
// PREVIEW LOGIC CONSTANTS
// ==========================================

export const PREVIEW_LOGIC = {
  FREE_PREVIEW_COUNT: 0, // ✅ No free preview
  PREVIEW_DISCOUNT_PERCENT: 10, // ✅ 10% margin (vs 30% base)
} as const;

// ==========================================
// MARGIN CONSTANTS
// ==========================================

export const MARGIN_CONFIG = {
  BASE_MARGIN_PERCENT: 30, // Base creation margin
  PREVIEW_MARGIN_PERCENT: 10, // Preview margin (looks like discount to user)
  BOOSTER_MARGIN_PERCENT: 39, // Average booster margin
} as const;

// ==========================================
// RESPONSE TYPES
// ==========================================

export interface CreditsBalance {
  total: number;
  used: number;
  remaining: number;
  carryForward: number;
  lastReset: Date;
  nextReset: Date;
}

export interface CreditTransaction {
  amount: number;
  type: 'deduct' | 'add' | 'reset' | 'carryforward';
  reason: string;
  timestamp: Date;
}

export interface GenerationCostBreakdown {
  baseCredits: number;
  previewCredits: number;
  totalCredits: number;
  estimatedApiCost: number;
  isFreePreview: boolean;
}