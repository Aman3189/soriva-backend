// src/types/image.types.ts

/**
 * ==========================================
 * SORIVA IMAGE GENERATION - TYPE DEFINITIONS
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: TypeScript types for image generation system
 * 
 * v10.5 (January 19, 2026):
 * - ✅ ADDED: userPlan in IntentDetectionInput
 * - ✅ ADDED: routingInfo in IntentDetectionResult
 * - ✅ ADDED: targetProvider in PromptOptimizationResult
 * - ✅ FIXED: ProviderDisplayInfo for intentDetector compatibility
 * 
 * v10.4 (January 19, 2026):
 * - DUAL MODEL SYSTEM RESTORED
 * - Klein 9B (BFL): ₹1.26 - Text/Cards/Deities/Festivals
 * - Schnell (Fal.ai): ₹0.25 - General images (people, animals, objects)
 * - Smart routing based on prompt content
 * 
 * v10.2 (January 17, 2026):
 * - Replaced Schnell + Fast with single Klein 9B model
 * - Model: black-forest-labs/FLUX.2-klein-9b @ ₹1.26
 * - Simplified all interfaces for single model
 * 
 * Last Updated: January 19, 2026
 */

// ==========================================
// ENUMS
// ==========================================

export enum ImageProvider {
  KLEIN9B = 'klein9b',    // Flux Klein 9B - Text/Deities/Festivals, ₹1.26/image
  SCHNELL = 'schnell',    // Flux Schnell (Fal.ai) - General images, ₹0.25/image
}

export enum ImageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum ImageIntentType {
  NONE = 'none',                    // Not an image request
  GENERAL = 'general',              // General image (scenery, objects, etc.) → Schnell
  TEXT_BASED = 'text_based',        // Contains text requirement → Klein
  LOGO = 'logo',                    // Logo design → Klein
  REALISTIC = 'realistic',          // Photorealistic image → Schnell
  BANNER = 'banner',                // Banner/poster with text → Klein
  RELIGIOUS = 'religious',          // Deities/temples → Klein
  FESTIVAL = 'festival',            // Festival greetings → Klein
}

// ==========================================
// INTERFACES - PROVIDER DISPLAY
// ==========================================

/**
 * Display info for frontend naming
 * Used by intentDetector and other services
 */
export interface ProviderDisplayInfo {
  displayName: string;    // 'Klein 9B' or 'Schnell'
  icon: string;           // '🎨' or '⚡'
  tagline: string;        // Short description
  cost?: string;          // '₹1.26' or '₹0.25' (optional for backward compatibility)
  bestFor?: string;       // What it's best for (optional)
}

/**
 * ✅ NEW: Extended provider display for intentDetector
 * Includes cost info for smart routing
 */
export interface ExtendedProviderDisplay extends ProviderDisplayInfo {
  description: string;
  costPerImage: number;   // Cost in INR
  costTier: 'premium' | 'budget';
}

// ==========================================
// INTERFACES - INTENT DETECTION
// ==========================================

/**
 * ✅ UPDATED: Added userPlan for LITE plan routing
 */
export interface IntentDetectionInput {
  message: string;
  conversationContext?: string[];
  userPlan?: string;      // ✅ NEW: User's plan (STARTER, LITE, PLUS, PRO, APEX)
}

/**
 * ✅ NEW: Routing info for smart provider selection
 */
export interface RoutingInfo {
  suggestedProvider: ImageProvider;
  alternativeProvider?: ImageProvider;
  costEstimate: number;
  routingReason: string;
  isLitePlanRestricted?: boolean;
}

/**
 * ✅ UPDATED: Added routingInfo for smart routing
 */
export interface IntentDetectionResult {
  isImageRequest: boolean;
  confidence: number;           // 0-1 confidence score
  intentType: ImageIntentType;
  extractedPrompt: string;      // Original user prompt
  suggestedProvider: ImageProvider;
  suggestedProviderDisplay?: ProviderDisplayInfo;
  canOverride?: boolean;        // User can change provider selection
  reasoning?: string;
  routingInfo?: RoutingInfo;    // ✅ NEW: Detailed routing information
}

// ==========================================
// INTERFACES - PROMPT OPTIMIZATION
// ==========================================

/**
 * ✅ UPDATED: Added targetProvider for provider-specific optimization
 */
export interface PromptOptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  detectedLanguage: 'hindi' | 'hinglish' | 'english' | 'other';
  enhancements: string[];       // List of enhancements made
  containsText: boolean;        // Does prompt require text in image?
  containsLogo: boolean;        // Does prompt require logo?
  isRealistic: boolean;         // Does prompt require photorealism?
  isReligious?: boolean;        // Does prompt contain religious content?
  isFestival?: boolean;         // Does prompt contain festival content?
  targetProvider?: ImageProvider;   // ✅ NEW: Target provider for optimization
  providerOptimized?: boolean;      // ✅ NEW: Was prompt optimized for specific provider?
}

// ==========================================
// INTERFACES - QUOTA MANAGEMENT
// ==========================================

export interface QuotaCheckResult {
  hasQuota: boolean;
  provider: ImageProvider;
  availableKlein9b: number;
  availableSchnell: number;
  totalAvailable: number;
  reason?: string;              // Reason if no quota
  canUseBooster: boolean;       // Can use booster images?
  boosterKlein9b: number;
  boosterSchnell: number;
}

export interface QuotaDeductResult {
  success: boolean;
  provider: ImageProvider;
  deducted: boolean;
  fromBooster: boolean;
  remainingKlein9b: number;
  remainingSchnell: number;
  totalRemaining: number;
  error?: string;
}

export interface UserImageQuota {
  userId: string;
  planType: string;
  region: string;
  
  // Plan limits
  klein9bLimit: number;
  schnellLimit: number;
  
  // Current usage
  klein9bUsed: number;
  schnellUsed: number;
  
  // Booster images
  boosterKlein9b: number;
  boosterSchnell: number;
  
  // Computed
  klein9bRemaining: number;
  schnellRemaining: number;
  totalRemaining: number;
}

// ==========================================
// INTERFACES - IMAGE GENERATION
// ==========================================

export interface ImageGenerationInput {
  userId: string;
  prompt: string;
  provider?: ImageProvider;     // Optional - defaults based on smart routing
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
  isReligious: boolean;
  isFestival: boolean;
  quotaAvailable: boolean;
  userPlan?: string;            // ✅ NEW: For LITE plan routing
}

export interface ProviderSelectionResult {
  provider: ImageProvider;
  reason: string;
  cost: number;
  alternativeProvider?: ImageProvider;  // ✅ NEW
  canOverride?: boolean;                // ✅ NEW
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
  routing?: {
    provider: string;
    reason: string;
    cost: string;
  };
  error?: string;
  errorCode?: string;
  quota?: {
    klein9bRemaining: number;
    schnellRemaining: number;
    totalRemaining: number;
  };
  timestamp: string;
}

// ==========================================
// INTERFACES - BFL API (Black Forest Labs - Klein 9B)
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
// INTERFACES - FAL.AI API (Schnell)
// ==========================================

export interface FalInput {
  prompt: string;
  image_size?: string | { width: number; height: number };
  num_inference_steps?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  output_format?: string;
}

export interface FalResult {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings?: {
    inference: number;
  };
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt?: string;
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
  [ImageProvider.KLEIN9B]: 1.26,   // ₹1.26 per image
  [ImageProvider.SCHNELL]: 0.25,  // ₹0.25 per image
} as const;

export const IMAGE_MODELS = {
  [ImageProvider.KLEIN9B]: 'black-forest-labs/FLUX.2-klein-9b',
  [ImageProvider.SCHNELL]: 'fal-ai/flux/schnell',
} as const;

// Legacy export for backward compatibility
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
// PROVIDER DISPLAY INFO
// ==========================================

export const PROVIDER_DISPLAY: Record<ImageProvider, ProviderDisplayInfo> = {
  [ImageProvider.KLEIN9B]: {
    displayName: 'Klein 9B',
    icon: '🎨',
    tagline: 'Perfect for text & cultural content',
    cost: '₹1.26',
    bestFor: 'Text, Cards, Deities, Festivals',
  },
  [ImageProvider.SCHNELL]: {
    displayName: 'Schnell',
    icon: '⚡',
    tagline: 'Fast & affordable for general images',
    cost: '₹0.25',
    bestFor: 'People, Animals, Objects, Scenery',
  },
};

// ==========================================
// SMART ROUTING KEYWORDS
// ==========================================

export const KLEIN_ROUTING_KEYWORDS = {
  // Text/Typography
  text: [
    'text', 'quote', 'quotes', 'typography', 'font', 'letter', 'word', 'message',
    'likha', 'likhna', 'likho', 'text likho', 'quote likho', 'caption',
  ],
  
  // Cards/Greetings
  cards: [
    'card', 'greeting', 'invitation', 'poster', 'banner', 'flyer',
    'birthday card', 'wedding card', 'anniversary', 'certificate',
  ],
  
  // Religious/Deities
  religious: [
    'god', 'goddess', 'deity', 'temple', 'mandir', 'church', 'mosque',
    'krishna', 'shiva', 'ganesh', 'ganesha', 'durga', 'lakshmi', 'hanuman',
    'ram', 'rama', 'sita', 'vishnu', 'brahma', 'saraswati', 'kali',
    'jesus', 'buddha', 'guru', 'sikh', 'gurdwara',
    'bhagwan', 'devta', 'devi', 'prabhu', 'ishwar',
  ],
  
  // Festivals
  festivals: [
    'diwali', 'holi', 'navratri', 'durga puja', 'ganesh chaturthi',
    'raksha bandhan', 'rakhi', 'bhai dooj', 'karwa chauth',
    'eid', 'christmas', 'easter', 'guru purab',
    'basant panchami', 'makar sankranti', 'lohri', 'pongal', 'onam',
    'janmashtami', 'ram navami', 'mahashivratri', 'chhath',
    'festival', 'celebration', 'tyohar', 'parv',
  ],
  
  // Indian Cultural
  cultural: [
    'rangoli', 'mehndi', 'henna', 'diya', 'deepak', 'aarti',
    'puja', 'pooja', 'mandala', 'om', 'swastik', 'kalash',
  ],
} as const;

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
  
  // Text-related keywords → Klein
  textRelated: [
    // Hindi
    'टेक्स्ट', 'लिखावट', 'अक्षर',
    // Hinglish
    'text wala', 'text likhna', 'likha ho',
    // English
    'with text', 'text', 'writing', 'typography', 'lettering', 'words',
  ],
  
  // Logo-related keywords → Klein
  logoRelated: [
    // Hindi
    'लोगो', 'ब्रांड',
    // Hinglish
    'logo', 'brand logo', 'company logo',
    // English
    'logo', 'brand', 'emblem', 'icon', 'symbol', 'monogram',
  ],
  
  // Banner/Poster keywords → Klein
  bannerRelated: [
    'banner', 'poster', 'flyer', 'visiting card', 'business card',
    'pamphlet', 'brochure', 'advertisement', 'ad',
  ],
  
  // General image keywords → Schnell
  generalImage: [
    'person', 'people', 'man', 'woman', 'child', 'girl', 'boy',
    'animal', 'dog', 'cat', 'bird', 'nature', 'landscape',
    'scenery', 'mountain', 'beach', 'forest', 'city', 'building',
    'food', 'car', 'house', 'room', 'interior',
  ],
} as const;

// ==========================================
// ✅ NEW: LITE PLAN CONSTANTS
// ==========================================

export const LITE_PLAN_CONFIG = {
  allowedProviders: [ImageProvider.SCHNELL], // LITE only gets Schnell
  blockedProviders: [ImageProvider.KLEIN9B], // No Klein access
  schnellLimit: 15, // Monthly Schnell images for LITE
  message: 'LITE plan includes Schnell images only. Upgrade to PLUS for Klein 9B access.',
} as const;

// ==========================================
// ✅ NEW: PLAN IMAGE QUOTAS
// ==========================================

export const PLAN_IMAGE_QUOTAS = {
  STARTER: {
    klein9b: 0,
    schnell: 0,
  },
  LITE: {
    klein9b: 0,
    schnell: 15,
  },
  PLUS: {
    klein9b: 15,
    schnell: 30,
  },
  PRO: {
    klein9b: 40,
    schnell: 60,
  },
  APEX: {
    klein9b: 100,
    schnell: 150,
  },
} as const;