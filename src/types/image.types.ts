// src/types/image.types.ts

/**
 * ==========================================
 * SORIVA IMAGE GENERATION - TYPE DEFINITIONS
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: TypeScript types for image generation system
 * 
 * v10.2 (January 17, 2026):
 * - Replaced Schnell + Fast with single Klein 9B model
 * - Model: black-forest-labs/FLUX.2-klein-9b @ ₹1.26
 * - Simplified all interfaces for single model
 * 
 * v10.1 (January 16, 2026):
 * - Renamed DEV → FAST throughout
 * - FAST = prunaai/flux-fast @ ₹0.42
 * 
 * Last Updated: January 17, 2026
 */

// ==========================================
// ENUMS
// ==========================================

export enum ImageProvider {
  KLEIN9B = 'klein9b',  // Flux Klein 9B - High quality, ₹1.26/image
}

export enum ImageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum ImageIntentType {
  NONE = 'none',                    // Not an image request
  GENERAL = 'general',              // General image (scenery, objects, etc.)
  TEXT_BASED = 'text_based',        // Contains text requirement
  LOGO = 'logo',                    // Logo design
  REALISTIC = 'realistic',          // Photorealistic image
  BANNER = 'banner',                // Banner/poster with text
}

// ==========================================
// INTERFACES - INTENT DETECTION
// ==========================================

/**
 * Display info for frontend naming
 */
export interface ProviderDisplayInfo {
  displayName: string;    // 'Klein 9B'
  icon: string;           // '🎨'
  tagline: string;        // Short description
}

export interface IntentDetectionResult {
  isImageRequest: boolean;
  confidence: number;           // 0-1 confidence score
  intentType: ImageIntentType;
  extractedPrompt: string;      // Original user prompt
  suggestedProvider: ImageProvider;
  suggestedProviderDisplay?: ProviderDisplayInfo;
  canOverride?: boolean;        // User can change provider selection
  reasoning?: string;
}

export interface IntentDetectionInput {
  message: string;
  conversationContext?: string[];
}

// ==========================================
// INTERFACES - PROMPT OPTIMIZATION
// ==========================================

export interface PromptOptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  detectedLanguage: 'hindi' | 'hinglish' | 'english' | 'other';
  enhancements: string[];       // List of enhancements made
  containsText: boolean;        // Does prompt require text in image?
  containsLogo: boolean;        // Does prompt require logo?
  isRealistic: boolean;         // Does prompt require photorealism?
}

// ==========================================
// INTERFACES - QUOTA MANAGEMENT
// ==========================================

export interface QuotaCheckResult {
  hasQuota: boolean;
  provider: ImageProvider;
  availableKlein9b: number;
  totalAvailable: number;
  reason?: string;              // Reason if no quota
  canUseBooster: boolean;       // Can use booster images?
  boosterKlein9b: number;
}

export interface QuotaDeductResult {
  success: boolean;
  provider: ImageProvider;
  deducted: boolean;
  fromBooster: boolean;
  remainingKlein9b: number;
  totalRemaining: number;
  error?: string;
}

export interface UserImageQuota {
  userId: string;
  planType: string;
  region: string;
  
  // Plan limits (Klein 9B - single model)
  klein9bLimit: number;
  
  // Current usage
  klein9bUsed: number;
  
  // Booster images
  boosterKlein9b: number;
  
  // Computed
  klein9bRemaining: number;
  totalRemaining: number;
}

// ==========================================
// INTERFACES - IMAGE GENERATION
// ==========================================

export interface ImageGenerationInput {
  userId: string;
  prompt: string;
  provider?: ImageProvider;     // Optional - defaults to KLEIN9B
  aspectRatio?: string;         // Default: '1:1'
  sessionId?: string;           // Chat session ID
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  provider: ImageProvider;
  prompt: string;
  optimizedPrompt: string;
  generationTimeMs: number;
  costINR: number;
  error?: string;
  errorCode?: string;
}

// ==========================================
// INTERFACES - PROVIDER SELECTION
// ==========================================

export interface ProviderSelectionInput {
  intentType: ImageIntentType;
  containsText: boolean;
  containsLogo: boolean;
  isRealistic: boolean;
  quotaAvailable: boolean;
}

export interface ProviderSelectionResult {
  provider: ImageProvider;
  reason: string;
}

// ==========================================
// INTERFACES - API RESPONSE
// ==========================================

export interface ImageApiResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    provider: ImageProvider;
    generationTimeMs: number;
  };
  error?: string;
  errorCode?: string;
  quota?: {
    klein9bRemaining: number;
    totalRemaining: number;
  };
  timestamp: string;
}

// ==========================================
// INTERFACES - BFL API (Black Forest Labs)
// ==========================================

export interface BFLInput {
  prompt: string;
  aspect_ratio?: string;
  num_outputs?: number;
  output_format?: string;
  output_quality?: number;
}

export interface BFLPrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
  metrics?: {
    predict_time: number;
  };
}

// ==========================================
// INTERFACES - IMAGE HISTORY
// ==========================================

export interface ImageGenerationRecord {
  id: string;
  userId: string;
  provider: ImageProvider;
  prompt: string;
  optimizedPrompt: string;
  imageUrl?: string;
  status: ImageStatus;
  costINR: number;
  generationTimeMs?: number;
  errorMessage?: string;
  createdAt: Date;
}

// ==========================================
// CONSTANTS
// ==========================================

export const IMAGE_COSTS = {
  [ImageProvider.KLEIN9B]: 1.26,  // ₹1.26 per image
} as const;

export const BFL_MODELS = {
  [ImageProvider.KLEIN9B]: 'black-forest-labs/FLUX.2-klein-9b',
} as const;

export const DEFAULT_ASPECT_RATIO = '1:1';

export const SUPPORTED_ASPECT_RATIOS = [
  '1:1',
  '16:9',
  '9:16',
  '4:3',
  '3:4',
  '3:2',
  '2:3',
] as const;

// ==========================================
// HINGLISH KEYWORDS FOR INTENT DETECTION
// ==========================================

export const IMAGE_INTENT_KEYWORDS = {
  // Primary image keywords (Hindi/Hinglish/English)
  primary: [
    // Hindi
    'तस्वीर', 'फोटो', 'चित्र', 'इमेज', 'पिक्चर',
    // Hinglish
    'photo', 'tasveer', 'chitra', 'pic',
    // English
    'image', 'picture', 'photo', 'illustration', 'artwork',
  ],
  
  // Action keywords
  actions: [
    // Hindi
    'बनाओ', 'बना दो', 'दिखाओ', 'जनरेट करो',
    // Hinglish  
    'banao', 'bana do', 'dikhao', 'generate karo', 'create karo',
    // English
    'create', 'generate', 'make', 'draw', 'design', 'show',
  ],
  
  // Text-related keywords
  textRelated: [
    // Hindi
    'टेक्स्ट', 'लिखावट', 'अक्षर',
    // Hinglish
    'text wala', 'text likhna', 'likha ho',
    // English
    'with text', 'text', 'writing', 'typography', 'lettering', 'words',
  ],
  
  // Logo-related keywords
  logoRelated: [
    // Hindi
    'लोगो', 'ब्रांड',
    // Hinglish
    'logo', 'brand logo', 'company logo',
    // English
    'logo', 'brand', 'emblem', 'icon', 'symbol', 'monogram',
  ],
  
  // Banner/Poster keywords
  bannerRelated: [
    'banner', 'poster', 'flyer', 'visiting card', 'business card',
    'pamphlet', 'brochure', 'advertisement', 'ad',
  ],
} as const;