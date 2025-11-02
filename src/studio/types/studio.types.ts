// src/modules/studio/studio.types.ts

import { StudioFeatureType, StudioBoosterType, GenerationStatus } from '@prisma/client';

// ==========================================
// FEATURE PRICING CONFIGURATION
// ==========================================

export interface FeaturePricing {
  featureType: StudioFeatureType;
  name: string;
  description: string;
  baseCredits: number; // Base generation cost
  previewCredits: number; // Additional preview cost (after 1st free)
  maxFreeRetries: number; // Number of free retries/previews
  estimatedApiCost: number; // Actual GPU/API cost in INR
  processingTime: string; // Estimated processing time
  outputType: 'image' | 'video' | 'text' | 'json';
}

export const FEATURE_PRICING: Record<StudioFeatureType, FeaturePricing> = {
  IMAGE_GENERATION_512: {
    featureType: 'IMAGE_GENERATION_512',
    name: 'AI Image (512×512)',
    description: 'Generate AI images in standard quality',
    baseCredits: 3,
    previewCredits: 3, // 1st FREE, 2nd onwards 3 credits
    maxFreeRetries: 1, // Only 1 free retry
    estimatedApiCost: 0.25,
    processingTime: '3-5 seconds',
    outputType: 'image',
  },
  IMAGE_GENERATION_1024: {
    featureType: 'IMAGE_GENERATION_1024',
    name: 'AI Image (1024×1024)',
    description: 'Generate AI images in high quality',
    baseCredits: 3,
    previewCredits: 3,
    maxFreeRetries: 1,
    estimatedApiCost: 0.40,
    processingTime: '5-8 seconds',
    outputType: 'image',
  },
  BACKGROUND_REMOVAL: {
    featureType: 'BACKGROUND_REMOVAL',
    name: 'Background Removal',
    description: 'Remove background from images with AI',
    baseCredits: 3,
    previewCredits: 3,
    maxFreeRetries: 1,
    estimatedApiCost: 0.15,
    processingTime: '2-3 seconds',
    outputType: 'image',
  },
  IMAGE_UPSCALE_2X: {
    featureType: 'IMAGE_UPSCALE_2X',
    name: 'Image Upscale (2×)',
    description: 'Upscale images to 2× resolution',
    baseCredits: 3,
    previewCredits: 3,
    maxFreeRetries: 1,
    estimatedApiCost: 0.25,
    processingTime: '3-5 seconds',
    outputType: 'image',
  },
  IMAGE_UPSCALE_4X: {
    featureType: 'IMAGE_UPSCALE_4X',
    name: 'Image Upscale (4×)',
    description: 'Upscale images to 4× resolution',
    baseCredits: 3,
    previewCredits: 3,
    maxFreeRetries: 1,
    estimatedApiCost: 0.40,
    processingTime: '5-8 seconds',
    outputType: 'image',
  },
  TEXT_TO_SPEECH: {
    featureType: 'TEXT_TO_SPEECH',
    name: 'Text to Speech',
    description: 'Convert text to natural human speech',
    baseCredits: 3,
    previewCredits: 3,
    maxFreeRetries: 1,
    estimatedApiCost: 0.05,
    processingTime: '1 second',
    outputType: 'text',
  },
  VOICE_CLONE: {
    featureType: 'VOICE_CLONE',
    name: 'Voice Cloning',
    description: 'Clone any voice with AI',
    baseCredits: 3,
    previewCredits: 3,
    maxFreeRetries: 1,
    estimatedApiCost: 0.10,
    processingTime: '1-2 seconds',
    outputType: 'text',
  },
  VIDEO_5SEC: {
    featureType: 'VIDEO_5SEC',
    name: 'AI Video (5 seconds)',
    description: 'Generate short AI-powered videos',
    baseCredits: 18,
    previewCredits: 3, // 1st FREE, then 3 credits each
    maxFreeRetries: 1, // Only 1st preview free
    estimatedApiCost: 6.0,
    processingTime: '1-2 minutes',
    outputType: 'video',
  },
  VIDEO_15SEC: {
    featureType: 'VIDEO_15SEC',
    name: 'AI Video (15 seconds)',
    description: 'Generate AI-powered videos',
    baseCredits: 36,
    previewCredits: 3,
    maxFreeRetries: 1,
    estimatedApiCost: 12.0,
    processingTime: '3-4 minutes',
    outputType: 'video',
  },
  VIDEO_30SEC: {
    featureType: 'VIDEO_30SEC',
    name: 'AI Video (30 seconds)',
    description: 'Generate long AI-powered videos',
    baseCredits: 72,
    previewCredits: 3,
    maxFreeRetries: 1,
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
    credits: 180,
    price: 99,
    validityDays: 30,
    valueInRupees: 60, // 180 credits ÷ 3 = ₹60
  },
  PRO: {
    type: 'PRO',
    name: 'Studio Pro',
    credits: 750,
    price: 399,
    validityDays: 30,
    valueInRupees: 250, // 750 credits ÷ 3 = ₹250
  },
  MAX: {
    type: 'MAX',
    name: 'Studio Max',
    credits: 1350,
    price: 599,
    validityDays: 30,
    valueInRupees: 450, // 1350 credits ÷ 3 = ₹450
  },
};

// ==========================================
// PLAN BONUS CREDITS
// ==========================================

export const PLAN_BONUS_CREDITS: Record<string, number> = {
  STARTER: 0,
  PLUS: 25, // ₹149 plan - bonus credits
  PRO: 100, // ₹399 plan - bonus credits
  EDGE: 0, // Future launch
  LIFE: 0, // Future launch
};

// ==========================================
// CREDIT CONVERSION CONSTANTS
// ==========================================

export const CREDIT_CONVERSION = {
  CREDITS_PER_RUPEE: 3, // 1 rupee = 3 credits
  RUPEES_PER_CREDIT: 0.33, // 1 credit = ₹0.33
} as const;

// ==========================================
// PREVIEW LOGIC CONSTANTS
// ==========================================

export const PREVIEW_LOGIC = {
  FREE_PREVIEW_COUNT: 1, // Always 1 free preview for all features
  ADDITIONAL_PREVIEW_COST: 3, // Cost for each additional preview
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