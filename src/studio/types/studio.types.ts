// src/modules/studio/types/studio.types.ts
// ✅ PRODUCTION UPDATE: Logo + Talking Photos + Prompt Enhancement
// ✅ Available Now: Image Gen, Logo Creation, Talking Photos
// ✅ Being Crafted: 11 remaining features

import { StudioFeatureType, StudioBoosterType, GenerationStatus } from '@prisma/client';

// ==========================================
// IMAGE GENERATION OPTIONS
// ==========================================

export type ImageResolution = '512x512' | '1024x1024' | '768x1024' | '1024x768';
export type AspectRatio = 'square' | 'portrait' | 'landscape';
export type UpscaleMultiplier = '2x' | '4x';

export interface ImageGenerationOptions {
  resolution: ImageResolution;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  credits: number;
  estimatedCost: number;
}

export const IMAGE_RESOLUTION_OPTIONS: Record<ImageResolution, ImageGenerationOptions> = {
  '512x512': {
    resolution: '512x512',
    aspectRatio: 'square',
    width: 512,
    height: 512,
    credits: 5,
    estimatedCost: 0.17,
  },
  '1024x1024': {
    resolution: '1024x1024',
    aspectRatio: 'square',
    width: 1024,
    height: 1024,
    credits: 5,
    estimatedCost: 0.17,
  },
  '768x1024': {
    resolution: '768x1024',
    aspectRatio: 'portrait',
    width: 768,
    height: 1024,
    credits: 5,
    estimatedCost: 0.17,
  },
  '1024x768': {
    resolution: '1024x768',
    aspectRatio: 'landscape',
    width: 1024,
    height: 768,
    credits: 5,
    estimatedCost: 0.17,
  },
};

// ==========================================
// UPSCALE OPTIONS (ADDED)
// ==========================================

export const UPSCALE_OPTIONS = {
  '2x': {
    multiplier: 2,
    estimatedCost: 0.4,
    description: '2× upscaling',
  },
  '4x': {
    multiplier: 4,
    estimatedCost: 0.8,
    description: '4× upscaling',
  },
} as const;

// ==========================================
// LOGO GENERATION OPTIONS (NEW)
// ==========================================

export type LogoStyle = 'modern' | 'minimal' | 'vintage' | 'playful' | 'elegant' | 'professional';
export type LogoPreviewStatus = 'generating' | 'ready' | 'failed';
export type LogoModel = 'sdxl' | 'stable_ultra';

export interface LogoPreviewOptions {
  count: 3; // Always 3 previews
  model: 'sdxl'; // Previews use SDXL
  includeText: false; // No text in previews
  estimatedCost: number; // ₹0.51 for 3 previews
}

export interface LogoFinalOptions {
  model: 'stable_ultra'; // Final uses Ultra
  includeText: true; // Perfect text rendering
  price: number; // ₹29
  estimatedCost: number; // ₹7-10
}

export const LOGO_PRICING = {
  preview: {
    count: 3,
    totalCost: 0.51, // ₹0.17 × 3
    model: 'sdxl' as LogoModel,
    includeText: false,
  },
  final: {
    price: 29, // User pays ₹29
    estimatedCost: 10, // Our cost ₹7-10 (taking max)
    model: 'stable_ultra' as LogoModel,
    includeText: true,
  },
} as const;

export interface LogoGenerationRequest {
  prompt: string; // User's original prompt (can be Hinglish)
  enhancedPrompt?: string; // Haiku-enhanced prompt
  businessName?: string; // For text rendering
  tagline?: string; // Optional tagline
  style?: LogoStyle;
}

export interface LogoPreviewResponse {
  previews: Array<{
    id: string;
    url: string;
    style: string;
    status: LogoPreviewStatus;
  }>;
  totalCost: number;
  previewCount: number;
}

export interface LogoFinalRequest {
  selectedPreviewId: string;
  businessName: string;
  tagline?: string;
  enhancedPrompt: string;
}

// ==========================================
// TALKING PHOTOS OPTIONS (NEW)
// ==========================================

export type TalkingPhotoType = 'real_photo' | 'ai_baby';
export type TalkingDuration = '5sec' | '10sec';
export type VoiceStyle = 'male' | 'female' | 'child';

// AI Baby Customization
export type BabyAge = 'newborn' | '6months' | '1year' | '2years';
export type SkinTone = 'fair' | 'wheatish' | 'dark';
export type HairColor = 'black' | 'brown' | 'blonde' | 'light_brown';
export type EyeColor = 'black' | 'brown' | 'blue' | 'green' | 'hazel';
export type BabyExpression = 'smiling' | 'laughing' | 'curious' | 'happy' | 'peaceful';
export type BabyOutfit = 'traditional' | 'modern' | 'casual' | 'festive';

export interface AIBabyCustomization {
  age: BabyAge;
  skinTone: SkinTone;
  hairColor: HairColor;
  eyeColor: EyeColor;
  expression: BabyExpression;
  outfit: BabyOutfit;
  additionalDetails?: string;
}

export interface TalkingPhotoOptions {
  type: TalkingPhotoType;
  duration: TalkingDuration;
  voiceStyle: VoiceStyle;
  price: number;
  estimatedCost: number;
}

export const TALKING_PHOTO_PRICING = {
  real_photo: {
    '5sec': {
      price: 19,
      estimatedCost: 6, // Max cost ₹4-6
      duration: 5,
      features: ['Upload photo', 'Lip-sync', '5s video'],
    },
    '10sec': {
      price: 29,
      estimatedCost: 12, // Max cost ₹8-12
      duration: 10,
      features: ['Upload photo', 'Lip-sync', '10s video'],
    },
  },
  ai_baby: {
    '5sec': {
      price: 29, // +₹10 for AI generation
      estimatedCost: 6.17, // Image (₹0.17) + Animation (₹6)
      duration: 5,
      features: ['AI baby generation', 'Customization', 'Lip-sync', '5s video'],
    },
    '10sec': {
      price: 39, // +₹10 for AI generation
      estimatedCost: 12.17, // Image (₹0.17) + Animation (₹12)
      duration: 10,
      features: ['AI baby generation', 'Customization', 'Lip-sync', '10s video'],
    },
  },
} as const;

export interface TalkingPhotoRequest {
  type: TalkingPhotoType;
  duration: TalkingDuration;
  text: string; // What the photo should say
  voiceStyle: VoiceStyle;
  
  // For real photo
  imageUrl?: string; // If type is 'real_photo'
  
  // For AI baby
  babyCustomization?: AIBabyCustomization; // If type is 'ai_baby'
}

export interface TalkingPhotoResponse {
  videoUrl: string;
  duration: number;
  cost: number;
  type: TalkingPhotoType;
  status: 'processing' | 'completed' | 'failed';
  estimatedTime: string; // "30-60 seconds"
}

// ==========================================
// PROMPT ENHANCEMENT (NEW)
// ==========================================

export type PromptLanguage = 'hinglish' | 'hindi' | 'english' | 'punjabi';

export interface PromptEnhancementRequest {
  originalPrompt: string;
  language: PromptLanguage;
  context: 'image' | 'logo' | 'baby' | 'general';
  culturalContext?: string; // For Indian-specific content
}

export interface PromptEnhancementResponse {
  originalPrompt: string;
  enhancedPrompt: string;
  language: PromptLanguage;
  improvements: string[];
  cost: number; // ₹0.02 per enhancement
  model: 'claude-haiku';
}

export const PROMPT_ENHANCEMENT_COST = {
  perRequest: 0.02, // ₹0.02 using Claude Haiku
  model: 'claude-3-5-haiku-20241022',
} as const;

// ==========================================
// FEATURE AVAILABILITY STATUS
// ==========================================

export type FeatureAvailability = 'available' | 'coming_soon';

export interface FeatureStatus {
  isAvailable: boolean;
  launchDate?: string;
  comingSoonMessage?: string;
}

// ==========================================
// FEATURE PRICING CONFIGURATION (UPDATED)
// ==========================================

export interface FeaturePricing {
  featureType: StudioFeatureType;
  name: string;
  description: string;
  baseCredits: number;
  previewCredits: number;
  maxFreeRetries: number;
  estimatedApiCost: number;
  processingTime: string;
  outputType: 'image' | 'video' | 'audio';
  category: 'images' | 'videos' | 'audio' | 'creative';
  availability: FeatureAvailability;
  featureStatus: FeatureStatus;
}

export const FEATURE_PRICING: Record<StudioFeatureType, FeaturePricing> = {
  // ==========================================
  // 📸 IMAGES (5 features)
  // ==========================================
  
  // ✅ AVAILABLE - AI Image Generation
  IMAGE_GENERATION_512: {
    featureType: 'IMAGE_GENERATION_512',
    name: 'AI Image Generation',
    description: 'Generate AI images with Hinglish support',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.19, // ₹0.17 + ₹0.02 (prompt enhancement)
    processingTime: '3-5 seconds',
    outputType: 'image',
    category: 'images',
    availability: 'available',
    featureStatus: {
      isAvailable: true,
    },
  },
  IMAGE_GENERATION_1024: {
    featureType: 'IMAGE_GENERATION_1024',
    name: 'AI Image Generation (HD)',
    description: 'High quality image generation with Hinglish',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.19, // ₹0.17 + ₹0.02 (prompt enhancement)
    processingTime: '5-8 seconds',
    outputType: 'image',
    category: 'images',
    availability: 'available',
    featureStatus: {
      isAvailable: true,
    },
  },

  // 🔬 COMING SOON
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
    category: 'images',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'Q1 2026',
      comingSoonMessage: 'AI-powered background removal',
    },
  },

  // ❌ REMOVED - Upscaling (not essential)
  IMAGE_UPSCALE_2X: {
    featureType: 'IMAGE_UPSCALE_2X',
    name: 'Image Upscale',
    description: 'Enhance image quality with 2× upscaling',
    baseCredits: 3,
    previewCredits: 3,
    maxFreeRetries: 0,
    estimatedApiCost: 0.19,
    processingTime: '3-5 seconds',
    outputType: 'image',
    category: 'images',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'TBD',
      comingSoonMessage: 'Quality enhancement',
    },
  },
  IMAGE_UPSCALE_4X: {
    featureType: 'IMAGE_UPSCALE_4X',
    name: 'Image Upscale (4×)',
    description: 'Maximum quality 4× upscaling',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.39,
    processingTime: '5-8 seconds',
    outputType: 'image',
    category: 'images',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'TBD',
      comingSoonMessage: 'Ultra HD upscaling',
    },
  },

  // ==========================================
  // 🎬 VIDEOS (3 features) - ALL COMING SOON
  // ==========================================
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
    category: 'videos',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'Q2 2026',
      comingSoonMessage: 'Text-to-video AI generation',
    },
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
    category: 'videos',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'Q2 2026',
      comingSoonMessage: 'Extended video generation',
    },
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
    category: 'videos',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'Q2 2026',
      comingSoonMessage: 'Long-form video generation',
    },
  },

  // ==========================================
  // 🎨 CREATIVE (5 features)
  // ==========================================
  
  SCENE_WEAVER_5SEC: {
    featureType: 'SCENE_WEAVER_5SEC',
    name: 'SceneWeaver (5 sec)',
    description: 'Text to cinematic mini-film with music & voiceover',
    baseCredits: 50,
    previewCredits: 45,
    maxFreeRetries: 0,
    estimatedApiCost: 7.5,
    processingTime: '60-90 seconds',
    outputType: 'video',
    category: 'creative',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'Q3 2026',
      comingSoonMessage: 'Cinematic AI films',
    },
  },
  SCENE_WEAVER_10SEC: {
    featureType: 'SCENE_WEAVER_10SEC',
    name: 'SceneWeaver (10 sec)',
    description: 'Extended cinematic film with music & voiceover',
    baseCredits: 80,
    previewCredits: 70,
    maxFreeRetries: 0,
    estimatedApiCost: 12.0,
    processingTime: '90-120 seconds',
    outputType: 'video',
    category: 'creative',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'Q3 2026',
      comingSoonMessage: 'Extended cinematic films',
    },
  },

  // ❌ REMOVED - Image to Video (replaced by Talking Photos)
  IMAGE_TO_VIDEO: {
    featureType: 'IMAGE_TO_VIDEO',
    name: 'Image to Video',
    description: 'Animate static images into videos',
    baseCredits: 20,
    previewCredits: 18,
    maxFreeRetries: 0,
    estimatedApiCost: 3.0,
    processingTime: '30-45 seconds',
    outputType: 'video',
    category: 'creative',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'Q2 2026',
      comingSoonMessage: 'Photo animation',
    },
  },

  MORPH_SEQUENCE: {
    featureType: 'MORPH_SEQUENCE',
    name: 'Morph Sequence',
    description: 'Smooth transformation between 2-5 images',
    baseCredits: 30,
    previewCredits: 27,
    maxFreeRetries: 0,
    estimatedApiCost: 4.5,
    processingTime: '45-60 seconds',
    outputType: 'video',
    category: 'creative',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'Q2 2026',
      comingSoonMessage: 'Smooth image transitions',
    },
  },
  CHARACTER_DANCE: {
    featureType: 'CHARACTER_DANCE',
    name: 'Character Dance',
    description: 'Make any portrait dance with AI motion',
    baseCredits: 25,
    previewCredits: 23,
    maxFreeRetries: 0,
    estimatedApiCost: 3.75,
    processingTime: '30-45 seconds',
    outputType: 'video',
    category: 'creative',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'Q2 2026',
      comingSoonMessage: 'AI-powered dance animations',
    },
  },

  // ==========================================
  // 🎤 AUDIO (1 feature)
  // ==========================================
  VOICE_CLONE: {
    featureType: 'VOICE_CLONE',
    name: 'Voice Cloning',
    description: 'Clone any voice with AI',
    baseCredits: 5,
    previewCredits: 5,
    maxFreeRetries: 0,
    estimatedApiCost: 0.10,
    processingTime: '1-2 seconds',
    outputType: 'audio',
    category: 'audio',
    availability: 'coming_soon',
    featureStatus: {
      isAvailable: false,
      launchDate: 'Q3 2026',
      comingSoonMessage: 'Professional voice synthesis',
    },
  },
};

// ==========================================
// FEATURE CATEGORIES WITH AVAILABILITY (UPDATED)
// ==========================================

export const AVAILABLE_FEATURES = {
  imageGeneration: ['IMAGE_GENERATION_512', 'IMAGE_GENERATION_1024'],
  logoCreation: ['LOGO_GENERATION'], // NEW - Not in Prisma enum yet
  talkingPhotos: ['TALKING_PHOTO_REAL', 'TALKING_PHOTO_AI_BABY'], // NEW - Not in Prisma enum yet
} as const;

export const COMING_SOON_FEATURES = {
  images: ['BACKGROUND_REMOVAL', 'IMAGE_UPSCALE_2X', 'IMAGE_UPSCALE_4X'],
  videos: ['VIDEO_5SEC', 'VIDEO_15SEC', 'VIDEO_30SEC'],
  creative: ['SCENE_WEAVER_5SEC', 'SCENE_WEAVER_10SEC', 'IMAGE_TO_VIDEO', 'MORPH_SEQUENCE', 'CHARACTER_DANCE'],
  audio: ['VOICE_CLONE'],
} as const;

// ==========================================
// NEW FEATURES SUMMARY
// ==========================================

export const NEW_FEATURES_INFO = {
  logo: {
    name: 'Logo Creation',
    pricing: LOGO_PRICING,
    availability: 'available',
    workflow: '3 SDXL previews → Select → Ultra final with text',
  },
  talkingPhotos: {
    name: 'Talking Photos',
    pricing: TALKING_PHOTO_PRICING,
    availability: 'available',
    types: ['real_photo', 'ai_baby'],
    workflow: 'Upload/Generate → Add text → Choose voice → Animate',
  },
  promptEnhancement: {
    name: 'Prompt Enhancement',
    cost: PROMPT_ENHANCEMENT_COST,
    availability: 'available',
    languages: ['hinglish', 'hindi', 'english', 'punjabi'],
    workflow: 'User prompt (any language) → Haiku enhancement → API call',
  },
} as const;

// ==========================================
// BOOSTER CONFIGURATION
// ==========================================

export interface BoosterConfig {
  type: StudioBoosterType;
  name: string;
  credits: number;
  price: number;
  validityDays: number;
  valueInRupees: number;
}

export const BOOSTER_CONFIGS: Record<StudioBoosterType, BoosterConfig> = {
  LITE: {
    type: 'LITE',
    name: 'Studio Lite',
    credits: 300,
    price: 99,
    validityDays: 30,
    valueInRupees: 60,
  },
  PRO: {
    type: 'PRO',
    name: 'Studio Pro',
    credits: 1250,
    price: 399,
    validityDays: 30,
    valueInRupees: 250,
  },
  MAX: {
    type: 'MAX',
    name: 'Studio Max',
    credits: 2250,
    price: 599,
    validityDays: 30,
    valueInRupees: 450,
  },
};

// ==========================================
// PLAN BONUS CREDITS
// ==========================================

export const PLAN_BONUS_CREDITS: Record<string, number> = {
  STARTER: 0,
  PLUS: 125,
  PRO: 500,
  EDGE: 0,
  LIFE: 0,
};

// ==========================================
// CREDIT CONVERSION CONSTANTS
// ==========================================

export const CREDIT_CONVERSION = {
  CREDITS_PER_RUPEE: 5,
  RUPEES_PER_CREDIT: 0.20,
} as const;

// ==========================================
// PREVIEW LOGIC CONSTANTS
// ==========================================

export const PREVIEW_LOGIC = {
  FREE_PREVIEW_COUNT: 0,
  PREVIEW_DISCOUNT_PERCENT: 10,
} as const;

// ==========================================
// MARGIN CONSTANTS
// ==========================================

export const MARGIN_CONFIG = {
  BASE_MARGIN_PERCENT: 30,
  PREVIEW_MARGIN_PERCENT: 10,
  BOOSTER_MARGIN_PERCENT: 39,
  LOGO_MARGIN_PERCENT: 65, // NEW - ₹18-21 profit on ₹29
  TALKING_PHOTO_MARGIN_PERCENT: 68, // NEW - ₹13-27 profit
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

// ==========================================
// FEATURE SUMMARY (UPDATED)
// ==========================================

export const STUDIO_FEATURES_SUMMARY = {
  total: 14,
  available: 3, // Image Gen, Logo Creation, Talking Photos
  comingSoon: 11,
  byCategory: {
    images: 5,
    videos: 3,
    creative: 5,
    audio: 1,
  },
  availableFeatures: [
    'AI Image Generation',
    'Logo Creation',
    'Talking Photos (Real + AI Baby)',
  ],
} as const;

// ==========================================
// TOTAL COST ESTIMATES (NEW)
// ==========================================

export const TOTAL_COST_ESTIMATES = {
  imageGeneration: 0.19, // With prompt enhancement
  logoCreation: 10.51, // 3 previews + 1 final
  talkingPhotoReal5s: 6,
  talkingPhotoReal10s: 12,
  talkingPhotoAI5s: 6.17,
  talkingPhotoAI10s: 12.17,
  promptEnhancement: 0.02,
} as const;