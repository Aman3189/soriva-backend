// src/modules/studio/types/studio.types.ts
// ✅ SORIVA STUDIO v2.0 - Complete Rewrite
// APIs: Ideogram (Text-to-Image) + Banana PRO (Photo Transform) + Hedra (Talking Photos)
// Video: Kling (Coming Soon)

import { StudioFeatureType, StudioBoosterType, GenerationStatus } from '@prisma/client';

// ==========================================
// API PROVIDERS
// ==========================================

export type StudioApiProvider = 'ideogram' | 'banana_pro' | 'hedra' | 'kling' | 'baby_prediction';

export type FeatureCategory = 'text_to_image' | 'photo_transform' | 'talking_photo' | 'video';

// ==========================================
// CREDIT SYSTEM
// ==========================================

export const STUDIO_CREDITS = {
  // Ideogram Features (10 credits each)
  TEXT_TO_IMAGE: 10,
  LOGO_GENERATION: 10,
  
  // Banana PRO Features (20 credits each)
  OBJECT_REMOVE: 20,
  BACKGROUND_CHANGE: 20,
  PORTRAIT_STUDIO: 20,
  SKETCH_COMPLETE: 20,
  PHOTO_ENHANCE: 20,
  BACKGROUND_EXPAND: 20,
  STYLE_TRANSFER: 20,
  CELEBRITY_MERGE: 20,
  BABY_PREDICTION: 30,

  
  // Talking Photos
  TALKING_PHOTO_5S: 40,
  TALKING_PHOTO_10S: 80,
  
  // Video (Coming Soon)
  VIDEO_5S: 200,
  VIDEO_10S: 400,
} as const;

// ==========================================
// API COSTS (in INR)
// ==========================================

export const API_COSTS = {
  // Ideogram
  IDEOGRAM_PER_IMAGE: 1.70,
  
  // Banana PRO
  BANANA_PRO_PER_TRANSFORM: 3.30,
  BABY_PREDICTION: 5.00,
  // Talking Photos (Hedra/D-ID)
  TALKING_PHOTO_5S: 6.00,
  TALKING_PHOTO_10S: 12.00,
  
  // Video (Kling) - Coming Soon
  VIDEO_5S: 65.00,
  VIDEO_10S: 127.00,
} as const;

// ==========================================
// FEATURE CONFIGURATION
// ==========================================

export interface FeatureConfig {
  featureType: StudioFeatureType;
  name: string;
  description: string;
  credits: number;
  apiProvider: StudioApiProvider;
  apiCost: number;
  category: FeatureCategory;
  requiresImage: boolean;
  availability: 'available' | 'coming_soon';
  examplePrompts: string[];
}

export const FEATURE_CONFIGS: Record<StudioFeatureType, FeatureConfig> = {
  // ==========================================
  // 🎨 IDEOGRAM FEATURES (10 credits)
  // ==========================================
  
  TEXT_TO_IMAGE: {
    featureType: 'TEXT_TO_IMAGE',
    name: 'Text to Image',
    description: 'Generate AI images from text prompts',
    credits: 10,
    apiProvider: 'ideogram',
    apiCost: 1.70,
    category: 'text_to_image',
    requiresImage: false,
    availability: 'available',
    examplePrompts: [
      'Sunset over Punjab fields',
      'Modern logo for tech startup',
      'Diwali greeting card design',
    ],
  },
  
  LOGO_GENERATION: {
    featureType: 'LOGO_GENERATION',
    name: 'Logo Generation',
    description: 'Create professional logos with AI',
    credits: 10,
    apiProvider: 'ideogram',
    apiCost: 1.70,
    category: 'text_to_image',
    requiresImage: false,
    availability: 'available',
    examplePrompts: [
      'Minimal logo for cafe named Chai Point',
      'Professional logo for law firm',
      'Playful logo for kids brand',
    ],
  },
  
  // ==========================================
  // 🍌 BANANA PRO FEATURES (20 credits)
  // ==========================================
  
  OBJECT_REMOVE: {
    featureType: 'OBJECT_REMOVE',
    name: 'Object Remove',
    description: 'Remove unwanted objects from photos',
    credits: 20,
    apiProvider: 'banana_pro',
    apiCost: 3.30,
    category: 'photo_transform',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Isko hatao photo se',
      'Remove the person in background',
      'Delete the car from image',
    ],
  },
  
  BACKGROUND_CHANGE: {
    featureType: 'BACKGROUND_CHANGE',
    name: 'Background Change',
    description: 'Change or replace photo backgrounds',
    credits: 20,
    apiProvider: 'banana_pro',
    apiCost: 3.30,
    category: 'photo_transform',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Mujhe Dubai mein dikha do',
      'Beach background lagao',
      'Office setting mein rakho',
    ],
  },
  
  PORTRAIT_STUDIO: {
    featureType: 'PORTRAIT_STUDIO',
    name: 'Portrait Studio',
    description: 'Transform photos into artistic styles (Comic, 3D, Cartoon)',
    credits: 20,
    apiProvider: 'banana_pro',
    apiCost: 3.30,
    category: 'photo_transform',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Mujhe cartoon banao',
      '3D avatar style mein convert karo',
      'Comic book style photo',
    ],
  },
  
  SKETCH_COMPLETE: {
    featureType: 'SKETCH_COMPLETE',
    name: 'Sketch Complete',
    description: 'Complete and enhance sketches with AI',
    credits: 20,
    apiProvider: 'banana_pro',
    apiCost: 3.30,
    category: 'photo_transform',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Ye sketch complete karo',
      'Drawing ko realistic banao',
      'Outline se full image banao',
    ],
  },
  
  PHOTO_ENHANCE: {
    featureType: 'PHOTO_ENHANCE',
    name: 'Photo Enhance',
    description: 'Enhance and improve photo quality (HD/Clear)',
    credits: 20,
    apiProvider: 'banana_pro',
    apiCost: 3.30,
    category: 'photo_transform',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Photo clear karo',
      'HD quality banao',
      'Purani photo enhance karo',
    ],
  },
  
  BACKGROUND_EXPAND: {
    featureType: 'BACKGROUND_EXPAND',
    name: 'Background Expand',
    description: 'Expand image boundaries with AI fill',
    credits: 20,
    apiProvider: 'banana_pro',
    apiCost: 3.30,
    category: 'photo_transform',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Image expand karo',
      'Background extend karo',
      'Photo ko wide banao',
    ],
  },
  
  STYLE_TRANSFER: {
    featureType: 'STYLE_TRANSFER',
    name: 'Style Transfer',
    description: 'Transform photos into different artistic styles',
    credits: 20,
    apiProvider: 'banana_pro',
    apiCost: 3.30,
    category: 'photo_transform',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Mujhe Rajput warrior banao',
      'Mughal emperor style',
      'Professional photo banao',
    ],
  },
  
  CELEBRITY_MERGE: {
    featureType: 'CELEBRITY_MERGE',
    name: 'Celebrity Merge',
    description: 'Stand with celebrities in photos',
    credits: 20,
    apiProvider: 'banana_pro',
    apiCost: 3.30,
    category: 'photo_transform',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Mujhe Salman ke saath khada karo',
      'Maa ko Shreya Ghoshal ke saath dikhao',
      'Photo with Virat Kohli',
    ],
  },

    BABY_PREDICTION: {
    featureType: 'BABY_PREDICTION',
    name: 'Baby Prediction',
    description: 'See your future baby! Upload Mom & Dad photos',
    credits: 30,
    apiProvider: 'baby_prediction',
    apiCost: 5.00,
    category: 'photo_transform',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Hamara baby kaisa dikhega?',
      'Future baby prediction',
      'Mom + Dad = Baby',
    ],
  },
    
  // ==========================================
  // 🎤 TALKING PHOTOS (40-80 credits)
  // ==========================================
  TALKING_PHOTO_5S: {
    featureType: 'TALKING_PHOTO_5S',
    name: 'Talking Photo (5 sec)',
    description: 'Make your photo talk with lip-sync',
    credits: 40,
    apiProvider: 'hedra',
    apiCost: 6.00,
    category: 'talking_photo',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Meri photo bolegi: Happy Birthday!',
      'Say hello in this photo',
      'Photo mein dialogue bolo',
    ],
  },
  
  TALKING_PHOTO_10S: {
    featureType: 'TALKING_PHOTO_10S',
    name: 'Talking Photo (10 sec)',
    description: 'Extended talking photo with lip-sync',
    credits: 80,
    apiProvider: 'hedra',
    apiCost: 12.00,
    category: 'talking_photo',
    requiresImage: true,
    availability: 'available',
    examplePrompts: [
      'Full message bolwao',
      'Longer dialogue for video',
      'Extended birthday wish',
    ],
  },
  
  // ==========================================
  // 🎬 VIDEO (Coming Soon)
  // ==========================================
  
  VIDEO_5S: {
    featureType: 'VIDEO_5S',
    name: 'AI Video (5 sec)',
    description: 'Generate 5 second AI video from image',
    credits: 200,
    apiProvider: 'kling',
    apiCost: 65.00,
    category: 'video',
    requiresImage: true,
    availability: 'coming_soon',
    examplePrompts: [
      'Photo ko animate karo',
      'Image se video banao',
      'Motion add karo',
    ],
  },
  
  VIDEO_10S: {
    featureType: 'VIDEO_10S',
    name: 'AI Video (10 sec)',
    description: 'Generate 10 second AI video from image',
    credits: 400,
    apiProvider: 'kling',
    apiCost: 127.00,
    category: 'video',
    requiresImage: true,
    availability: 'coming_soon',
    examplePrompts: [
      'Longer video animation',
      'Extended motion video',
      '10 second clip banao',
    ],
  },
};

// ==========================================
// PLAN CREDITS
// ==========================================

export const PLAN_STUDIO_CREDITS: Record<string, number> = {
  STARTER: 0,
  PLUS: 250,
  PRO: 450,
  APEX: 860,
};

// ==========================================
// BOOSTER CONFIGURATION
// ==========================================

export interface BoosterConfig {
  type: StudioBoosterType;
  name: string;
  credits: number;
  price: number;
  validityDays: number;
  ideogramImages: number;
  bananaTransforms: number;
}

export const BOOSTER_CONFIGS: Record<StudioBoosterType, BoosterConfig> = {
  LITE: {
    type: 'LITE',
    name: 'Studio Lite',
    credits: 350,
    price: 99,
    validityDays: 30,
    ideogramImages: 25,
    bananaTransforms: 5,
  },
  PRO: {
    type: 'PRO',
    name: 'Studio Pro',
    credits: 1500,
    price: 399,
    validityDays: 30,
    ideogramImages: 50,
    bananaTransforms: 50,
  },
  MAX: {
    type: 'MAX',
    name: 'Studio Max',
    credits: 2700,
    price: 599,
    validityDays: 30,
    ideogramImages: 90,
    bananaTransforms: 90,
  },
};

// ==========================================
// IDEOGRAM STYLE ROUTING
// ==========================================

export type IdeogramStyle = 'realistic' | 'design' | '3d' | 'anime' | 'auto';

export const IDEOGRAM_STYLE_KEYWORDS: Record<IdeogramStyle, string[]> = {
  realistic: ['realistic', 'real', 'photo', 'natural', 'lifelike'],
  design: ['logo', 'design', 'graphic', 'poster', 'banner', 'card'],
  '3d': ['3d', 'render', 'dimensional', 'model'],
  anime: ['anime', 'cartoon', 'animated', 'manga'],
  auto: [],
};

// ==========================================
// FEATURE AVAILABILITY HELPERS
// ==========================================

export const AVAILABLE_FEATURES = Object.values(FEATURE_CONFIGS)
  .filter(f => f.availability === 'available')
  .map(f => f.featureType);

export const COMING_SOON_FEATURES = Object.values(FEATURE_CONFIGS)
  .filter(f => f.availability === 'coming_soon')
  .map(f => f.featureType);

export const IDEOGRAM_FEATURES: StudioFeatureType[] = ['TEXT_TO_IMAGE', 'LOGO_GENERATION'];

export const BANANA_PRO_FEATURES: StudioFeatureType[] = [
  'OBJECT_REMOVE',
  'BACKGROUND_CHANGE',
  'PORTRAIT_STUDIO',
  'SKETCH_COMPLETE',
  'PHOTO_ENHANCE',
  'BACKGROUND_EXPAND',
  'STYLE_TRANSFER',
  'CELEBRITY_MERGE',
];

export const TALKING_PHOTO_FEATURES: StudioFeatureType[] = ['TALKING_PHOTO_5S', 'TALKING_PHOTO_10S'];

export const VIDEO_FEATURES: StudioFeatureType[] = ['VIDEO_5S', 'VIDEO_10S'];

// ==========================================
// REQUEST/RESPONSE TYPES
// ==========================================

export interface StudioGenerationRequest {
  featureType: StudioFeatureType;
  prompt: string;
  inputImageUrl?: string;
  options?: {
    style?: IdeogramStyle;
    aspectRatio?: keyof typeof ASPECT_RATIO_OPTIONS;
    negativePrompt?: string;
    voiceStyle?: 'male' | 'female' | 'child';
    text?: string;
    secondImageUrl?: string;      // For Baby Prediction (Dad's photo)
    babyGender?: 'boy' | 'girl' | 'random';  // For Baby Prediction
  };
}

export interface StudioGenerationResponse {
  id: string;
  status: GenerationStatus;
  outputUrl?: string;
  creditsUsed: number;
  apiCost: number;
  processingTime?: number;
  error?: string;
}

export interface CreditsBalance {
  total: number;
  used: number;
  remaining: number;
  monthlyCredits: number;
  boosterCredits: number;
  carryForward: number;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function getFeatureConfig(featureType: StudioFeatureType): FeatureConfig {
  return FEATURE_CONFIGS[featureType];
}

export function getCreditsRequired(featureType: StudioFeatureType): number {
  return STUDIO_CREDITS[featureType];
}

export function getApiProvider(featureType: StudioFeatureType): StudioApiProvider {
  return FEATURE_CONFIGS[featureType].apiProvider;
}

export function isFeatureAvailable(featureType: StudioFeatureType): boolean {
  return FEATURE_CONFIGS[featureType].availability === 'available';
}

export function requiresImage(featureType: StudioFeatureType): boolean {
  return FEATURE_CONFIGS[featureType].requiresImage;
}

export function detectIdeogramStyle(prompt: string): IdeogramStyle {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [style, keywords] of Object.entries(IDEOGRAM_STYLE_KEYWORDS)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return style as IdeogramStyle;
    }
  }
  
  return 'auto';
}

// ==========================================
// SUMMARY
// ==========================================

export const STUDIO_SUMMARY = {
  totalFeatures: 15,
  availableFeatures: 13,
  comingSoonFeatures: 2,
  
  byCategory: {
    text_to_image: 2,
    photo_transform: 9,
    talking_photo: 2,
    video: 2,
  },
  
  byApi: {
    ideogram: 2,
    banana_pro: 8,
    baby_prediction: 1,
    hedra: 2,
    kling: 2,
  },
} as const;
// ==========================================
// IMAGE RESOLUTION OPTIONS (Ideogram)
// ==========================================

export const ASPECT_RATIO_OPTIONS = {
  square: { width: 1024, height: 1024, label: '1:1 Square' },
  portrait: { width: 768, height: 1024, label: '3:4 Portrait' },
  landscape: { width: 1024, height: 768, label: '4:3 Landscape' },
  story: { width: 576, height: 1024, label: '9:16 Story' },
  wide: { width: 1024, height: 576, label: '16:9 Wide' },
} as const;

// ==========================================
// PLAN STUDIO BUDGET (Cost Control)
// ==========================================

export const PLAN_STUDIO_BUDGET = {
  PLUS: 40,   // ₹40 studio budget
  PRO: 70,    // ₹70 studio budget
  APEX: 120,  // ₹120 studio budget
} as const;

// ==========================================
// MARGIN CONSTANTS
// ==========================================

export const MARGIN_CONFIG = {
  PLUS_MARGIN_PERCENT: 23,
  PRO_MARGIN_PERCENT: 18,
  APEX_MARGIN_PERCENT: 14,
  LITE_BOOSTER_MARGIN: 40,
  PRO_BOOSTER_MARGIN: 37,
  MAX_BOOSTER_MARGIN: 25,
} as const;

// ==========================================
// INTERNATIONAL PRICING
// ==========================================

export const INTERNATIONAL_STUDIO_CREDITS = {
  PLUS: 500,
  PRO: 900,
  APEX: 1720,
} as const;