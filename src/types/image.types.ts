// src/types/image.types.ts

/**
 * ==========================================
 * SORIVA IMAGE GENERATION - TYPE DEFINITIONS
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: TypeScript types for image generation system
 * 
 * ==========================================
 * v12.0 CHANGELOG (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 * 
 * ✅ REMOVED MODELS:
 *    - Klein 9B ❌
 *    - Nano Banana ❌  
 *    - Flux Kontext ❌
 *
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell (Fal.ai): ₹0.25/image - General images (scenery, nature, animals)
 *    - GPT LOW (OpenAI): ₹1.18/image - Text, Ads, Festivals, Transforms, Documents
 *
 * ✅ GPT Image 1.5 LOW Pricing (OpenAI Official):
 *    - Portrait (1024×1536): $0.013 = ₹1.18
 *    - Landscape (1536×1024): $0.013 = ₹1.18
 *    - Square (1024×1024): $0.009 = ₹0.82 [NOT USED - crops images]
 *
 * ✅ ROUTING LOGIC:
 *    - Scenery/Nature/Animals → Schnell (₹0.25)
 *    - Text/Ads/Festivals/Posters/Transforms/Documents → GPT LOW (₹1.18)
 * 
 * ==========================================
 * v10.5 (January 19, 2026): [SUPERSEDED by v12.0]
 * ==========================================
 * - Added userPlan in IntentDetectionInput
 * - Added routingInfo in IntentDetectionResult
 * - Added targetProvider in PromptOptimizationResult
 * 
 * Last Updated: February 22, 2026
 */

// ==========================================
// ENUMS
// ==========================================

/**
 * v12.0: Simplified to 2-model system
 * - Schnell: Fast & cheap for general images
 * - GPT LOW: Premium for text/ads/festivals/transforms
 */
export enum ImageProvider {
  SCHNELL = 'schnell',      // Flux Schnell - General/Nature/Animals, ₹0.25/image
  GPT_LOW = 'gptLow',       // GPT Image 1.5 LOW - Text/Ads/Festivals/Transforms, ₹1.18/image
}

export enum ImageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

/**
 * v12.0: Updated intent types for 2-model routing
 */
export enum ImageIntentType {
  NONE = 'none',                    // Not an image request
  GENERAL = 'general',              // General image (scenery, nature, animals) → Schnell
  TEXT_BASED = 'text_based',        // Contains text requirement → GPT LOW
  LOGO = 'logo',                    // Logo design → GPT LOW
  REALISTIC = 'realistic',          // Photorealistic image → Schnell
  BANNER = 'banner',                // Banner/poster with text → GPT LOW
  RELIGIOUS = 'religious',          // Deities/temples → GPT LOW
  FESTIVAL = 'festival',            // Festival greetings → GPT LOW
  ADVERTISEMENT = 'advertisement',  // Ads & promotions → GPT LOW
  TRANSFORMATION = 'transformation', // Style transforms (GTA, Anime, Pixar) → GPT LOW
  DOCUMENT = 'document',            // Document editing → GPT LOW
  CARD = 'card',                    // Cards (birthday, wedding, etc.) → GPT LOW
}

// ==========================================
// INTERFACES - PROVIDER DISPLAY
// ==========================================

/**
 * Display info for frontend naming
 * Used by intentDetector and other services
 */
export interface ProviderDisplayInfo {
  displayName: string;    // 'Schnell' or 'GPT LOW'
  icon: string;           // '⚡' or '🎨'
  tagline: string;        // Short description
  cost?: string;          // '₹0.25' or '₹1.18' (optional for backward compatibility)
  bestFor?: string;       // What it's best for (optional)
}

/**
 * Extended provider display for intentDetector
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
 * Input for intent detection
 */
export interface IntentDetectionInput {
  message: string;
  conversationContext?: string[];
  userPlan?: string;      // User's plan (STARTER, LITE, PLUS, PRO, APEX)
}

/**
 * Routing info for smart provider selection
 */
export interface RoutingInfo {
  suggestedProvider: ImageProvider;
  alternativeProvider?: ImageProvider;
  costEstimate: number;
  routingReason: string;
  isLitePlanRestricted?: boolean;
  availableProviders?: ImageProvider[];
}

/**
 * Result of intent detection
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
  routingInfo?: RoutingInfo;    // Detailed routing information
}

// ==========================================
// INTERFACES - PROMPT OPTIMIZATION
// ==========================================

/**
 * Result of prompt optimization
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
  isAdvertisement?: boolean;    // Is this an ad/promotion?
  isTransformation?: boolean;   // Is this a style transformation?
  isDocument?: boolean;         // Is this document editing?
  isCard?: boolean;             // Is this a card design?
  hasMultipleImages?: boolean;  // Does this require multiple images?
  negativePrompt?: string;      // Negative prompt for generation
  targetProvider?: ImageProvider;   // Target provider for optimization
  providerOptimized?: boolean;      // Was prompt optimized for specific provider?
}

// ==========================================
// INTERFACES - QUOTA MANAGEMENT (v12.0)
// ==========================================

/**
 * v12.0: Simplified quota check for 2-model system
 */
export interface QuotaCheckResult {
  hasQuota: boolean;
  provider: ImageProvider;
  // Individual quotas (plan remaining)
  availableSchnell: number;
  availableGptLow: number;
  totalAvailable: number;
  // Booster quotas
  boosterSchnell: number;
  boosterGptLow: number;
  // Status
  reason?: string;              // Reason if no quota
  canUseBooster: boolean;       // Can use booster images?
}

/**
 * v12.0: Simplified quota deduct for 2-model system
 */
export interface QuotaDeductResult {
  success: boolean;
  provider: ImageProvider;
  deducted: boolean;
  fromBooster: boolean;
  // Remaining after deduction
  remainingSchnell: number;
  remainingGptLow: number;
  totalRemaining: number;
  error?: string;
}

/**
 * v12.0: Simplified user quota for 2-model system
 */
export interface UserImageQuota {
  userId: string;
  planType: string;
  region: string;
  
  // Schnell (₹0.25)
  schnellLimit: number;
  schnellUsed: number;
  boosterSchnell: number;
  schnellRemaining: number;
  
  // GPT LOW (₹1.18)
  gptLowLimit: number;
  gptLowUsed: number;
  boosterGptLow: number;
  gptLowRemaining: number;
  
  // Total
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

/**
 * v12.0: Updated for 2-model routing
 */
export interface ProviderSelectionInput {
  intentType: ImageIntentType;
  containsText: boolean;
  containsLogo: boolean;
  isRealistic: boolean;
  isReligious: boolean;
  isFestival: boolean;
  isAdvertisement: boolean;
  isTransformation: boolean;
  isDocument: boolean;
  isCard: boolean;
  hasMultipleImages: boolean;
  quotaAvailable: boolean;
  userPlan?: string;
}

export interface ProviderSelectionResult {
  provider: ImageProvider;
  reason: string;
  cost: number;
  alternativeProvider?: ImageProvider;
  canOverride?: boolean;
}

// ==========================================
// INTERFACES - API RESPONSE (v12.0)
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
    schnellRemaining: number;
    gptLowRemaining: number;
    totalRemaining: number;
  };
  timestamp: string;
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
// INTERFACES - OPENAI GPT IMAGE API
// ==========================================

/**
 * v12.0: OpenAI GPT Image 1.5 LOW API input
 * Model: gpt-image-1.5 with quality: 'low'
 * Pricing: $0.013 (₹1.18) for Portrait/Landscape
 */
export interface GptImageInput {
  model: 'gpt-image-1.5';
  prompt: string;
  n?: number;                   // Number of images (default: 1)
  size?: '1024x1024' | '1024x1536' | '1536x1024';  // Square, Portrait, Landscape
  quality?: 'low' | 'medium' | 'high';  // We use 'low' for cost (₹1.18)
  response_format?: 'url' | 'b64_json';
}

/**
 * v12.0: OpenAI GPT Image API response
 */
export interface GptImageResult {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
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
// CONSTANTS - IMAGE COSTS (v12.0)
// ==========================================

/**
 * v12.0: Simplified 2-model cost structure
 */
export const IMAGE_COSTS = {
  schnell: {
    costPerImage: 0.25,           // ₹0.25 per image
    provider: 'fal-ai',
  },
  gptLow: {
    costPerImageSquare: 0.82,     // ₹0.82 (1024x1024) - NOT USED
    costPerImagePortrait: 1.18,   // ₹1.18 (1024x1536) - PRIMARY
    costPerImageLandscape: 1.18,  // ₹1.18 (1536x1024) - PRIMARY
    provider: 'openai',
  },
} as const;

/**
 * Legacy cost lookup by provider enum
 */
export const IMAGE_COST_BY_PROVIDER = {
  [ImageProvider.SCHNELL]: 0.25,
  [ImageProvider.GPT_LOW]: 1.18,  // Using portrait/landscape cost
} as const;

// ==========================================
// GPT IMAGE CENTRAL CONFIG (v12.0)
// ==========================================

/**
 * 🎯 SINGLE SOURCE OF TRUTH for GPT Image settings
 * Future changes? Just update here - no hunting across files!
 * 
 * Quality Options & Costs (Portrait/Landscape 1024x1536 or 1536x1024):
 * - 'low':    $0.013 = ₹1.18  ← CURRENT
 * - 'medium': $0.05  = ₹4.53
 * - 'high':   $0.2   = ₹18.12
 */
export const GPT_IMAGE_CONFIG = {
  model: 'gpt-image-1.5' as const,
  quality: 'low' as const,
  defaultSize: '1024x1536' as const,  // Portrait (recommended)
  alternateSize: '1536x1024' as const, // Landscape
  responseFormat: 'b64_json' as const,
  
  // Cost reference (INR) - update if quality changes
  costs: {
    low: { square: 0.82, portrait: 1.18, landscape: 1.18 },
    medium: { square: 3.08, portrait: 4.53, landscape: 4.53 },
    high: { square: 12.04, portrait: 18.12, landscape: 18.12 },
  },
  
  // Current active cost (based on quality setting above)
  get activeCost() {
    return this.costs[this.quality].portrait;
  },
} as const;

// ==========================================
// CONSTANTS - IMAGE MODELS (v12.0)
// ==========================================

export const IMAGE_MODELS = {
  [ImageProvider.SCHNELL]: 'fal-ai/flux/schnell',
  [ImageProvider.GPT_LOW]: 'gpt-image-1.5',  // OpenAI GPT Image 1.5 with quality: 'low'
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

/**
 * v12.0: GPT LOW supported sizes
 */
export const GPT_LOW_SIZES = {
  square: '1024x1024',      // ₹0.82 - NOT RECOMMENDED (crops)
  portrait: '1024x1536',    // ₹1.18 - RECOMMENDED
  landscape: '1536x1024',   // ₹1.18 - RECOMMENDED
} as const;

// ==========================================
// PROVIDER DISPLAY INFO (v12.0)
// ==========================================

export const PROVIDER_DISPLAY: Record<ImageProvider, ProviderDisplayInfo> = {
  [ImageProvider.SCHNELL]: {
    displayName: 'Schnell',
    icon: '⚡',
    tagline: 'Fast & affordable for general images',
    cost: '₹0.25',
    bestFor: 'Nature, Animals, Scenery, Simple Objects',
  },
  [ImageProvider.GPT_LOW]: {
    displayName: 'GPT Image',
    icon: '🎨',
    tagline: 'Premium quality for text & complex images',
    cost: '₹1.18',
    bestFor: 'Text, Ads, Festivals, Posters, Style Transforms',
  },
};

/**
 * Extended display info with cost details
 */
export const EXTENDED_PROVIDER_DISPLAY: Record<ImageProvider, ExtendedProviderDisplay> = {
  [ImageProvider.SCHNELL]: {
    displayName: 'Schnell',
    icon: '⚡',
    tagline: 'Fast & affordable for general images',
    cost: '₹0.25',
    bestFor: 'Nature, Animals, Scenery, Simple Objects',
    description: 'Lightning fast image generation for everyday use',
    costPerImage: 0.25,
    costTier: 'budget',
  },
  [ImageProvider.GPT_LOW]: {
    displayName: 'GPT Image',
    icon: '🎨',
    tagline: 'Premium quality for text & complex images',
    cost: '₹1.18',
    bestFor: 'Text, Ads, Festivals, Posters, Style Transforms',
    description: 'OpenAI powered for text-heavy and complex imagery',
    costPerImage: 1.18,
    costTier: 'premium',
  },
};

// ==========================================
// SMART ROUTING KEYWORDS (v12.0)
// ==========================================

/**
 * v12.0: Keywords that trigger GPT LOW routing
 * GPT LOW is used for: Text, Ads, Festivals, Posters, Transforms, Documents, Logos, Cards
 */
export const GPT_LOW_ROUTING_KEYWORDS = {
  // Text/Typography
  text: [
    'text', 'quote', 'quotes', 'typography', 'font', 'letter', 'word', 'message',
    'likha', 'likhna', 'likho', 'text likho', 'quote likho', 'caption',
    'heading', 'title', 'slogan', 'tagline', 'watermark',
  ],
  
  // Cards/Greetings
  cards: [
    'card', 'greeting', 'invitation', 'certificate', 'voucher', 'coupon',
    'birthday card', 'wedding card', 'anniversary', 'thank you card',
    'business card', 'visiting card', 'id card',
  ],
  
  // Advertisements & Promotions
  advertisements: [
    'ad', 'advertisement', 'promotion', 'promo', 'offer', 'sale', 'discount',
    'marketing', 'campaign', 'commercial', 'sponsored',
    'vigyapan', 'prachar',
  ],
  
  // Posters & Banners
  posters: [
    'poster', 'banner', 'flyer', 'pamphlet', 'brochure', 'hoarding',
    'billboard', 'signage', 'standee', 'backdrop',
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
    'new year', 'valentine', 'mother day', 'father day',
  ],
  
  // Indian Cultural
  cultural: [
    'rangoli', 'mehndi', 'henna', 'diya', 'deepak', 'aarti',
    'puja', 'pooja', 'mandala', 'om', 'swastik', 'kalash',
  ],
  
  // Style Transformations
  transformations: [
    'gta style', 'gta', 'grand theft auto',
    'anime', 'anime style', 'manga',
    'pixar', 'pixar style', 'disney',
    'cartoon', 'cartoonify', 'caricature',
    'oil painting', 'watercolor', 'sketch',
    'comic', 'comic book', 'marvel style',
    '3d render', 'clay render', 'plastic',
  ],
  
  // Document Editing
  documents: [
    'document', 'edit document', 'modify image',
    'change text', 'replace text', 'update text',
    'remove background', 'add element', 'merge images',
  ],
  
  // Logo Work
  logos: [
    'logo', 'brand logo', 'company logo', 'emblem',
    'icon', 'symbol', 'monogram', 'mascot',
  ],
  
  // Multi-image Work
  multiImage: [
    'combine', 'merge', 'collage', 'montage',
    'side by side', 'before after', 'comparison',
  ],
} as const;

/**
 * v12.0: Keywords that trigger Schnell routing
 * Schnell is used for: General scenery, nature, animals, simple objects
 */
export const SCHNELL_ROUTING_KEYWORDS = {
  // Nature & Scenery
  nature: [
    'nature', 'landscape', 'scenery', 'mountain', 'beach', 'forest',
    'river', 'lake', 'waterfall', 'sunset', 'sunrise', 'sky',
    'cloud', 'rain', 'snow', 'desert', 'valley', 'hill',
    'prakriti', 'pahad', 'samundar', 'jungle',
  ],
  
  // Animals
  animals: [
    'animal', 'dog', 'cat', 'bird', 'lion', 'tiger', 'elephant',
    'horse', 'cow', 'butterfly', 'fish', 'rabbit', 'deer',
    'janwar', 'kutta', 'billi', 'chidiya', 'sher', 'hathi',
  ],
  
  // Simple Objects
  objects: [
    'car', 'house', 'building', 'room', 'interior', 'furniture',
    'food', 'fruit', 'flower', 'tree', 'plant',
    'ghar', 'kamra', 'gaadi', 'phool', 'ped',
  ],
  
  // People (without text/special requirements)
  people: [
    'person', 'people', 'man', 'woman', 'child', 'girl', 'boy',
    'family', 'couple', 'portrait', 'face',
    'aadmi', 'aurat', 'bachcha', 'ladka', 'ladki',
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
  
  // Text-related keywords → GPT LOW
  textRelated: [
    // Hindi
    'टेक्स्ट', 'लिखावट', 'अक्षर',
    // Hinglish
    'text wala', 'text likhna', 'likha ho',
    // English
    'with text', 'text', 'writing', 'typography', 'lettering', 'words',
  ],
  
  // Logo-related keywords → GPT LOW
  logoRelated: [
    // Hindi
    'लोगो', 'ब्रांड',
    // Hinglish
    'logo', 'brand logo', 'company logo',
    // English
    'logo', 'brand', 'emblem', 'icon', 'symbol', 'monogram',
  ],
  
  // Banner/Poster keywords → GPT LOW
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
// PLAN IMAGE QUOTAS (v12.0)
// ==========================================

/**
 * v12.0: Image quotas per plan (India)
 * Reference values - actual values from plans.ts
 */
export const PLAN_IMAGE_QUOTAS_INDIA = {
  STARTER: { schnell: 19, gptLow: 26, total: 45 },
  LITE: { schnell: 28, gptLow: 50, total: 78 },
  PLUS: { schnell: 41, gptLow: 76, total: 117 },
  PRO: { schnell: 55, gptLow: 142, total: 197 },
  APEX: { schnell: 82, gptLow: 223, total: 305 },
} as const;

/**
 * v12.0: Image quotas per plan (International)
 * Reference values - actual values from plans.ts
 */
export const PLAN_IMAGE_QUOTAS_INTL = {
  STARTER: { schnell: 38, gptLow: 52, total: 90 },
  LITE: { schnell: 61, gptLow: 108, total: 169 },
  PLUS: { schnell: 88, gptLow: 152, total: 240 },
  PRO: { schnell: 118, gptLow: 284, total: 402 },
  APEX: { schnell: 149, gptLow: 446, total: 595 },
} as const;

// ==========================================
// LITE PLAN CONFIG (v12.0)
// ==========================================

/**
 * v12.0: LITE plan has access to both models
 */
export const LITE_PLAN_CONFIG = {
  allowedProviders: [ImageProvider.SCHNELL, ImageProvider.GPT_LOW],
  blockedProviders: [],
  schnellLimit: 28,
  gptLowLimit: 50,
  totalLimit: 78,
  message: 'LITE plan includes 28 Schnell + 50 GPT LOW images.',
} as const;

// ==========================================
// TYPE GUARDS
// ==========================================

export function isValidImageProvider(provider: string): provider is ImageProvider {
  return Object.values(ImageProvider).includes(provider as ImageProvider);
}

export function isGptLowIntent(intentType: ImageIntentType): boolean {
  const gptLowIntents: ImageIntentType[] = [
    ImageIntentType.TEXT_BASED,
    ImageIntentType.LOGO,
    ImageIntentType.BANNER,
    ImageIntentType.RELIGIOUS,
    ImageIntentType.FESTIVAL,
    ImageIntentType.ADVERTISEMENT,
    ImageIntentType.TRANSFORMATION,
    ImageIntentType.DOCUMENT,
    ImageIntentType.CARD,
  ];
  return gptLowIntents.includes(intentType);
}

export function isSchnellIntent(intentType: ImageIntentType): boolean {
  const schnellIntents: ImageIntentType[] = [
    ImageIntentType.GENERAL,
    ImageIntentType.REALISTIC,
  ];
  return schnellIntents.includes(intentType);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get cost for a provider
 */
export function getProviderCost(provider: ImageProvider): number {
  return IMAGE_COST_BY_PROVIDER[provider];
}

/**
 * Get display info for a provider
 */
export function getProviderDisplay(provider: ImageProvider): ProviderDisplayInfo {
  return PROVIDER_DISPLAY[provider];
}

/**
 * Get recommended provider based on intent
 */
export function getRecommendedProvider(intentType: ImageIntentType): ImageProvider {
  if (isGptLowIntent(intentType)) {
    return ImageProvider.GPT_LOW;
  }
  return ImageProvider.SCHNELL;
}