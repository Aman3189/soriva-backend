// src/services/image/intentDetector.ts

/**
 * ==========================================
 * SORIVA IMAGE INTENT DETECTOR v12.0
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Detect if user message is an image generation request
 * Supports: Hindi, Hinglish, English
 * Last Updated: February 22, 2026
 * 
 * ==========================================
 * v12.0 CHANGELOG (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 *
 * ✅ REMOVED MODELS:
 *    - Klein 9B ❌ (replaced by GPT LOW)
 *    - Nano Banana ❌
 *    - Flux Kontext ❌
 *
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell (Fal.ai): ₹0.25/image - General images (scenery, nature, animals)
 *    - GPT LOW (OpenAI gpt-image-1.5): ₹1.18/image - Text, Ads, Festivals, Transforms
 *
 * ✅ ROUTING LOGIC:
 *    - General/Nature/Animals/People → Schnell (₹0.25)
 *    - Text/Ads/Festivals/Posters/Cards/Logos/Transforms → GPT LOW (₹1.18)
 *
 * ✅ PLAN ACCESS:
 *    - ALL PLANS: Both Schnell + GPT LOW available
 * 
 * v11.0 Changes (January 19, 2026): [SUPERSEDED]
 * - Dual Model Support (Klein 9B + Schnell)
 */

import {
  IntentDetectionResult,
  IntentDetectionInput,
  ImageIntentType,
  ImageProvider,
  IMAGE_INTENT_KEYWORDS,
  GPT_LOW_ROUTING_KEYWORDS,
  SCHNELL_ROUTING_KEYWORDS,
} from '../../types/image.types';

// ==========================================
// PROVIDER DISPLAY CONFIGURATION (v12.0)
// ==========================================

/**
 * Provider display info with cost details (v12.0 - 2 Models)
 */
export const IMAGE_PROVIDER_DISPLAY: Record<ImageProvider, {
  displayName: string;
  icon: string;
  tagline: string;
  description: string;
  costPerImage: number;
  costTier: 'premium' | 'budget';
  minPlan: string;
}> = {
  [ImageProvider.SCHNELL]: {
    displayName: 'Schnell',
    icon: '⚡',
    tagline: 'Fast & budget-friendly',
    description: 'Great for general images - nature, animals, scenery, people',
    costPerImage: 0.25,
    costTier: 'budget',
    minPlan: 'STARTER',
  },
  [ImageProvider.GPT_LOW]: {
    displayName: 'GPT Image',
    icon: '🎨',
    tagline: 'Premium quality with text rendering',
    description: 'Best for text, ads, festivals, posters, logos, style transforms',
    costPerImage: 1.18,
    costTier: 'premium',
    minPlan: 'STARTER',
  },
};

// ==========================================
// ROUTING KEYWORDS - GPT LOW PREFERRED (v12.0)
// ==========================================

/**
 * Keywords that should route to GPT LOW (premium)
 * These require higher quality or specific capabilities
 */
const GPT_LOW_PREFERRED_KEYWORDS = {
  // Text/Typography (GPT LOW has better text rendering)
  text: [
    'text', 'likhna', 'likho', 'typography', 'quote', 'naam', 'name', 'written',
    'letter', 'word', 'title', 'heading', 'caption', 'label', 'slogan',
    'लिखना', 'लिखो', 'नाम', 'शीर्षक',
  ],
  
  // Logo/Brand (precision required)
  logo: [
    'logo', 'brand', 'emblem', 'icon', 'symbol', 'monogram', 'badge',
    'trademark', 'company', 'business', 'corporate',
    'लोगो', 'ब्रांड',
  ],
  
  // Deity/Religious (cultural accuracy important)
  deity: [
    'god', 'goddess', 'deity', 'bhagwan', 'devi', 'devta', 'lord',
    'krishna', 'shiva', 'vishnu', 'ganesh', 'ganesha', 'durga', 'lakshmi',
    'hanuman', 'ram', 'rama', 'sita', 'radha', 'saraswati', 'kali',
    'jesus', 'christ', 'buddha', 'guru', 'saint',
    'भगवान', 'देवी', 'देवता', 'कृष्ण', 'शिव', 'विष्णु', 'गणेश', 'दुर्गा',
    'लक्ष्मी', 'हनुमान', 'राम', 'सीता', 'राधा', 'सरस्वती', 'काली',
    'mandir', 'temple', 'puja', 'aarti', 'prayer',
  ],
  
  // Festival/Occasion (cultural elements)
  festival: [
    'diwali', 'holi', 'navratri', 'durga puja', 'ganesh chaturthi',
    'raksha bandhan', 'rakhi', 'bhai dooj', 'karwa chauth', 'eid',
    'christmas', 'new year', 'birthday', 'anniversary', 'wedding',
    'दीवाली', 'होली', 'नवरात्रि', 'दशहरा', 'रक्षाबंधन',
    'festival', 'celebration', 'tyohar', 'त्योहार',
  ],
  
  // Cards/Invitations (text + design)
  cards: [
    'card', 'invitation', 'invite', 'greeting', 'wish', 'poster',
    'banner', 'flyer', 'certificate', 'diploma',
    'कार्ड', 'निमंत्रण', 'पोस्टर', 'बैनर',
  ],
  
  // Business/Professional
  business: [
    'visiting card', 'business card', 'letterhead', 'brochure',
    'presentation', 'infographic', 'chart', 'diagram',
  ],
  
  // Advertisements
  advertisements: [
    'ad', 'advertisement', 'vigyapan', 'promotion', 'marketing',
    'campaign', 'promotional', 'advertising',
  ],
  
  // Style Transformations (GTA, Anime, etc.)
  transformations: [
    'gta', 'gta style', 'grand theft auto', 'gta 5',
    'anime', 'manga', 'cartoon', 'pixar', 'disney',
    'convert to', 'transform', 'make it look like',
    'style of', 'in the style',
  ],
};

// ==========================================
// ROUTING KEYWORDS - SCHNELL PREFERRED
// ==========================================

/**
 * Keywords that can use Schnell (budget-friendly)
 * General images that don't need premium quality
 */
const SCHNELL_PREFERRED_KEYWORDS = {
  // People (general, not deity)
  people: [
    'person', 'man', 'woman', 'boy', 'girl', 'child', 'baby',
    'aadmi', 'aurat', 'ladka', 'ladki', 'baccha',
    'आदमी', 'औरत', 'लड़का', 'लड़की', 'बच्चा',
    'portrait', 'selfie', 'photo',
  ],
  
  // Animals
  animals: [
    'animal', 'dog', 'cat', 'bird', 'lion', 'tiger', 'elephant',
    'horse', 'cow', 'monkey', 'fish', 'butterfly', 'pet',
    'janwar', 'kutta', 'billi', 'chidiya', 'sher', 'hathi',
    'जानवर', 'कुत्ता', 'बिल्ली', 'चिड़िया', 'शेर', 'हाथी',
  ],
  
  // Nature/Landscape
  nature: [
    'nature', 'landscape', 'mountain', 'beach', 'forest', 'river',
    'ocean', 'sea', 'sky', 'sunset', 'sunrise', 'cloud', 'rain',
    'tree', 'flower', 'garden', 'park',
    'pahad', 'samundar', 'jungle', 'nadi', 'aasman', 'suraj',
    'पहाड़', 'समुंदर', 'जंगल', 'नदी', 'आसमान', 'सूरज',
  ],
  
  // Objects/Things
  objects: [
    'car', 'bike', 'house', 'building', 'food', 'fruit', 'vehicle',
    'phone', 'computer', 'furniture', 'clothes', 'shoes',
    'ghar', 'gaadi', 'khana',
    'घर', 'गाड़ी', 'खाना',
  ],
  
  // Abstract/Artistic
  abstract: [
    'abstract', 'pattern', 'texture', 'background', 'wallpaper',
    'art', 'artistic', 'creative', 'design',
  ],
};

// ==========================================
// INTENT DETECTOR CLASS (v12.0)
// ==========================================

export class ImageIntentDetector {
  private static instance: ImageIntentDetector;

  private constructor() {}

  public static getInstance(): ImageIntentDetector {
    if (!ImageIntentDetector.instance) {
      ImageIntentDetector.instance = new ImageIntentDetector();
    }
    return ImageIntentDetector.instance;
  }

  // ==========================================
  // MAIN DETECTION METHOD
  // ==========================================

  /**
   * Detect if message is an image generation request
   * Uses multi-layer detection:
   * 1. Keyword matching (fast)
   * 2. Pattern analysis
   * 3. Intent type classification
   * 4. Smart provider routing (GPT LOW vs Schnell)
   */
  public detect(input: IntentDetectionInput): IntentDetectionResult {
    const { message, userPlan } = input;
    const normalizedMessage = this.normalizeMessage(message);

    // Layer 1: Primary keyword detection
    const hasPrimaryKeyword = this.hasPrimaryImageKeyword(normalizedMessage);
    const hasActionKeyword = this.hasActionKeyword(normalizedMessage);

    // If no image-related keywords at all, return early
    if (!hasPrimaryKeyword && !hasActionKeyword) {
      return this.createNonImageResult(message, userPlan);
    }

    // Layer 2: Intent type classification
    const intentType = this.classifyIntentType(normalizedMessage);

    // Layer 3: Calculate confidence
    const confidence = this.calculateConfidence(normalizedMessage, hasPrimaryKeyword, hasActionKeyword);

    // If confidence is too low, treat as non-image request
    if (confidence < 0.4) {
      return this.createNonImageResult(message, userPlan);
    }

    // Layer 4: Smart provider routing (v12.0 - GPT LOW vs Schnell)
    const routingResult = this.determineProvider(normalizedMessage, intentType, userPlan);

    // Get display info for frontend
    const providerDisplay = IMAGE_PROVIDER_DISPLAY[routingResult.provider];

    return {
      isImageRequest: true,
      confidence,
      intentType,
      extractedPrompt: this.extractPrompt(message),
      suggestedProvider: routingResult.provider,
      suggestedProviderDisplay: {
        displayName: providerDisplay.displayName,
        icon: providerDisplay.icon,
        tagline: providerDisplay.tagline,
      },
      reasoning: routingResult.reasoning,
      canOverride: routingResult.canOverride,
      routingInfo: {
        suggestedProvider: routingResult.provider,
        alternativeProvider: routingResult.alternativeProvider,
        costEstimate: providerDisplay.costPerImage,
        routingReason: routingResult.routingReason,
        availableProviders: routingResult.availableProviders,
      },
    };
  }

  // ==========================================
  // SMART PROVIDER ROUTING (v12.0)
  // ==========================================

  /**
   * Determine the best provider based on content (v12.0 - 2 Models)
   * 
   * Content-based routing:
   * - Text/Logo/Deity/Festival/Ads/Transforms → GPT LOW
   * - General (nature, animals, people, objects) → Schnell
   */
  private determineProvider(
    message: string,
    intentType: ImageIntentType,
    userPlan?: string
  ): {
    provider: ImageProvider;
    alternativeProvider?: ImageProvider;
    reasoning: string;
    routingReason: string;
    canOverride: boolean;
    availableProviders: ImageProvider[];
  } {
    // v12.0: All plans have access to both models
    const availableProviders = [ImageProvider.SCHNELL, ImageProvider.GPT_LOW];
    
    // Calculate scores for both providers
    const scores = {
      gptLow: this.calculateGptLowScore(message, intentType),
      schnell: this.calculateSchnellScore(message),
    };

    // Find best provider
    let bestProvider = ImageProvider.SCHNELL;
    let routingReason = 'General image - cost-effective choice';

    // Check GPT LOW score
    if (scores.gptLow >= 2) {
      bestProvider = ImageProvider.GPT_LOW;
      routingReason = this.getGptLowReason(message, intentType);
    }

    // Get display info
    const providerDisplay = IMAGE_PROVIDER_DISPLAY[bestProvider];
    
    // Alternative provider
    const alternativeProvider = bestProvider === ImageProvider.SCHNELL 
      ? ImageProvider.GPT_LOW 
      : ImageProvider.SCHNELL;

    return {
      provider: bestProvider,
      alternativeProvider,
      reasoning: `${routingReason} - using ${providerDisplay.displayName} ${providerDisplay.icon}`,
      routingReason,
      canOverride: true, // All users can override in v12.0
      availableProviders,
    };
  }

  /**
   * Calculate score for GPT LOW preference (v12.0)
   */
  private calculateGptLowScore(message: string, intentType: ImageIntentType): number {
    let score = 0;

    // Intent type bonuses
    if (intentType === ImageIntentType.TEXT_BASED) score += 3;
    if (intentType === ImageIntentType.LOGO) score += 3;
    if (intentType === ImageIntentType.BANNER) score += 2;
    if (intentType === ImageIntentType.RELIGIOUS) score += 3;
    if (intentType === ImageIntentType.FESTIVAL) score += 2;
    if (intentType === ImageIntentType.ADVERTISEMENT) score += 3;
    if (intentType === ImageIntentType.TRANSFORMATION) score += 3;
    if (intentType === ImageIntentType.CARD) score += 2;

    // Keyword matching
    for (const [category, keywords] of Object.entries(GPT_LOW_PREFERRED_KEYWORDS)) {
      const matchCount = keywords.filter(kw => message.includes(kw.toLowerCase())).length;
      if (matchCount > 0) {
        score += matchCount * (category === 'deity' || category === 'text' || category === 'transformations' ? 2 : 1);
      }
    }

    // Quoted text detection (needs text rendering)
    if (/"[^"]+"|'[^']+'/.test(message)) {
      score += 2;
    }

    return score;
  }

  /**
   * Calculate score for Schnell preference
   */
  private calculateSchnellScore(message: string): number {
    let score = 0;

    for (const keywords of Object.values(SCHNELL_PREFERRED_KEYWORDS)) {
      const matchCount = keywords.filter(kw => message.includes(kw.toLowerCase())).length;
      score += matchCount;
    }

    return score;
  }

  /**
   * Get human-readable reason for GPT LOW routing (v12.0)
   */
  private getGptLowReason(message: string, intentType: ImageIntentType): string {
    // Check specific categories
    for (const kw of GPT_LOW_PREFERRED_KEYWORDS.text) {
      if (message.includes(kw.toLowerCase())) {
        return 'Text/typography detected - GPT Image has superior text rendering';
      }
    }

    for (const kw of GPT_LOW_PREFERRED_KEYWORDS.logo) {
      if (message.includes(kw.toLowerCase())) {
        return 'Logo/brand design detected - GPT Image for precision';
      }
    }

    for (const kw of GPT_LOW_PREFERRED_KEYWORDS.deity) {
      if (message.includes(kw.toLowerCase())) {
        return 'Deity/religious content detected - GPT Image for cultural accuracy';
      }
    }

    for (const kw of GPT_LOW_PREFERRED_KEYWORDS.festival) {
      if (message.includes(kw.toLowerCase())) {
        return 'Festival/occasion detected - GPT Image for detailed design';
      }
    }

    for (const kw of GPT_LOW_PREFERRED_KEYWORDS.cards) {
      if (message.includes(kw.toLowerCase())) {
        return 'Card/invitation detected - GPT Image for text + design';
      }
    }

    for (const kw of GPT_LOW_PREFERRED_KEYWORDS.transformations) {
      if (message.includes(kw.toLowerCase())) {
        return 'Style transformation detected - GPT Image for best results';
      }
    }

    for (const kw of GPT_LOW_PREFERRED_KEYWORDS.advertisements) {
      if (message.includes(kw.toLowerCase())) {
        return 'Advertisement detected - GPT Image for marketing quality';
      }
    }

    // Intent type fallback
    switch (intentType) {
      case ImageIntentType.TEXT_BASED:
        return 'Text in image required - GPT Image recommended';
      case ImageIntentType.LOGO:
        return 'Logo design - GPT Image for precision';
      case ImageIntentType.BANNER:
        return 'Banner/poster - GPT Image for quality';
      case ImageIntentType.RELIGIOUS:
        return 'Religious content - GPT Image for accuracy';
      case ImageIntentType.FESTIVAL:
        return 'Festival theme - GPT Image for vibrant colors';
      case ImageIntentType.ADVERTISEMENT:
        return 'Ad/promotion - GPT Image for marketing quality';
      case ImageIntentType.TRANSFORMATION:
        return 'Style transform - GPT Image for best results';
      case ImageIntentType.CARD:
        return 'Card design - GPT Image for text + design';
      default:
        return 'Premium quality recommended';
    }
  }

  // ==========================================
  // KEYWORD DETECTION METHODS
  // ==========================================

  /**
   * Check for primary image keywords
   */
  private hasPrimaryImageKeyword(message: string): boolean {
    return IMAGE_INTENT_KEYWORDS.primary.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check for action keywords
   */
  private hasActionKeyword(message: string): boolean {
    return IMAGE_INTENT_KEYWORDS.actions.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check for text-related keywords
   */
  private hasTextKeyword(message: string): boolean {
    return IMAGE_INTENT_KEYWORDS.textRelated.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check for logo-related keywords
   */
  private hasLogoKeyword(message: string): boolean {
    return IMAGE_INTENT_KEYWORDS.logoRelated.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check for banner/poster keywords
   */
  private hasBannerKeyword(message: string): boolean {
    return IMAGE_INTENT_KEYWORDS.bannerRelated.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  // ==========================================
  // INTENT CLASSIFICATION
  // ==========================================

  /**
   * Classify the type of image intent
   */
  private classifyIntentType(message: string): ImageIntentType {
    // Check for transformation styles first (GTA, anime, etc.)
    if (this.hasTransformationKeyword(message)) {
      return ImageIntentType.TRANSFORMATION;
    }

    // Check for logo (high priority)
    if (this.hasLogoKeyword(message)) {
      return ImageIntentType.LOGO;
    }

    // Check for religious/deity content
    if (this.hasDeityKeyword(message)) {
      return ImageIntentType.RELIGIOUS;
    }

    // Check for festival content
    if (this.hasFestivalKeyword(message)) {
      return ImageIntentType.FESTIVAL;
    }

    // Check for advertisement
    if (this.hasAdvertisementKeyword(message)) {
      return ImageIntentType.ADVERTISEMENT;
    }

    // Check for cards
    if (this.hasCardKeyword(message)) {
      return ImageIntentType.CARD;
    }

    // Check for text-based images
    if (this.hasTextKeyword(message) || this.hasBannerKeyword(message)) {
      return ImageIntentType.TEXT_BASED;
    }

    // Check for banner/poster
    if (this.hasBannerKeyword(message)) {
      return ImageIntentType.BANNER;
    }

    // Check for realistic/photorealistic
    if (this.isRealisticRequest(message)) {
      return ImageIntentType.REALISTIC;
    }

    // Default to general
    return ImageIntentType.GENERAL;
  }

  /**
   * Check for transformation keywords (GTA, anime, etc.)
   */
  private hasTransformationKeyword(message: string): boolean {
    return GPT_LOW_PREFERRED_KEYWORDS.transformations.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check for deity/religious keywords
   */
  private hasDeityKeyword(message: string): boolean {
    return GPT_LOW_PREFERRED_KEYWORDS.deity.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check for festival keywords
   */
  private hasFestivalKeyword(message: string): boolean {
    return GPT_LOW_PREFERRED_KEYWORDS.festival.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check for advertisement keywords
   */
  private hasAdvertisementKeyword(message: string): boolean {
    return GPT_LOW_PREFERRED_KEYWORDS.advertisements.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check for card keywords
   */
  private hasCardKeyword(message: string): boolean {
    return GPT_LOW_PREFERRED_KEYWORDS.cards.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  /**
   * Check if request is for realistic/photorealistic image
   */
  private isRealisticRequest(message: string): boolean {
    const realisticKeywords = [
      'realistic', 'photorealistic', 'real', 'photograph', 'photography',
      'natural', 'lifelike', '8k', '4k', 'hd', 'high quality',
      'professional photo', 'camera', 'dslr',
    ];

    return realisticKeywords.some(keyword => 
      message.includes(keyword.toLowerCase())
    );
  }

  // ==========================================
  // CONFIDENCE CALCULATION
  // ==========================================

  /**
   * Calculate confidence score (0-1)
   */
  private calculateConfidence(
    message: string, 
    hasPrimaryKeyword: boolean, 
    hasActionKeyword: boolean
  ): number {
    let score = 0;

    // Primary keyword: +0.4
    if (hasPrimaryKeyword) score += 0.4;

    // Action keyword: +0.3
    if (hasActionKeyword) score += 0.3;

    // Both together: +0.2 bonus
    if (hasPrimaryKeyword && hasActionKeyword) score += 0.2;

    // Specific intent keywords: +0.1
    if (this.hasTextKeyword(message) || this.hasLogoKeyword(message)) {
      score += 0.1;
    }

    // Pattern matching: "ek X banao" pattern
    if (this.matchesImagePattern(message)) {
      score += 0.15;
    }

    return Math.min(score, 1);
  }

  /**
   * Check for common image request patterns
   */
  private matchesImagePattern(message: string): boolean {
    const patterns = [
      /ek\s+.+\s+(banao|bana\s*do|dikhao)/i,           // "ek sunset banao"
      /mujhe\s+.+\s+(chahiye|dikhao)/i,                 // "mujhe photo chahiye"
      /(create|generate|make)\s+(a|an|me)?\s*(image|picture|photo)/i,
      /(image|photo|picture)\s+(of|for)\s+/i,
      /बना(ओ|इए|ना)/,                                    // Hindi verb patterns
    ];

    return patterns.some(pattern => pattern.test(message));
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Normalize message for consistent matching
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')           // Normalize spaces
      .replace(/[।॥]/g, '.');         // Hindi punctuation
  }

  /**
   * Extract the actual prompt from message
   */
  private extractPrompt(message: string): string {
    let prompt = message;

    // Remove common prefixes
    const prefixes = [
      /^(please\s+)?/i,
      /^(can you\s+)?/i,
      /^(could you\s+)?/i,
      /^(i want (you )?to\s+)?/i,
      /^(mujhe\s+)?/i,
      /^(kya aap\s+)?/i,
      /^(create|generate|make|draw)\s+(a|an|me)?\s*/i,
      /^(ek\s+)?/i,
    ];

    for (const prefix of prefixes) {
      prompt = prompt.replace(prefix, '');
    }

    // Remove action keywords at start
    const actionPrefixes = ['image of', 'photo of', 'picture of', 'tasveer of'];
    for (const ap of actionPrefixes) {
      if (prompt.toLowerCase().startsWith(ap)) {
        prompt = prompt.substring(ap.length);
      }
    }

    return prompt.trim();
  }

  /**
   * Create non-image result
   */
  private createNonImageResult(message: string, userPlan?: string): IntentDetectionResult {
    return {
      isImageRequest: false,
      confidence: 0,
      intentType: ImageIntentType.NONE,
      extractedPrompt: message,
      suggestedProvider: ImageProvider.SCHNELL,
      canOverride: false,
    };
  }
}

// ==========================================
// SINGLETON INSTANCE
// ==========================================

export const imageIntentDetector = ImageIntentDetector.getInstance();

// ==========================================
// EXPORTED STATIC FUNCTIONS
// ==========================================

/**
 * Main intent detection function
 */
export function detectImageIntent(input: IntentDetectionInput): IntentDetectionResult {
  return imageIntentDetector.detect(input);
}

/**
 * Check if message needs GPT LOW provider (v12.0)
 * Replaces old needsKleinProvider()
 */
export function needsGptLowProvider(message: string): boolean {
  const normalizedMessage = message.toLowerCase();
  
  for (const keywords of Object.values(GPT_LOW_PREFERRED_KEYWORDS)) {
    if (keywords.some(kw => normalizedMessage.includes(kw.toLowerCase()))) {
      return true;
    }
  }
  
  // Check for quoted text (needs text rendering)
  if (/"[^"]+"|'[^']+'/.test(message)) {
    return true;
  }
  
  return false;
}

/**
 * @deprecated Use needsGptLowProvider() instead
 * Backward compatibility wrapper
 */
export function needsKleinProvider(message: string): boolean {
  console.warn('[DEPRECATED] needsKleinProvider() is deprecated. Use needsGptLowProvider() instead.');
  return needsGptLowProvider(message);
}

/**
 * Quick provider recommendation without full detection (v12.0)
 */
export function getQuickProviderRecommendation(
  message: string,
  userPlan?: string
): {
  provider: ImageProvider;
  reason: string;
  availableProviders: ImageProvider[];
} {
  const normalizedMessage = message.toLowerCase();
  
  // v12.0: All plans have access to both models
  const availableProviders = [ImageProvider.SCHNELL, ImageProvider.GPT_LOW];

  // Check for GPT LOW triggers
  for (const [category, keywords] of Object.entries(GPT_LOW_PREFERRED_KEYWORDS)) {
    if (keywords.some(kw => normalizedMessage.includes(kw.toLowerCase()))) {
      return {
        provider: ImageProvider.GPT_LOW,
        reason: `${category} content detected - GPT Image recommended`,
        availableProviders,
      };
    }
  }

  // Check for quoted text
  if (/"[^"]+"|'[^']+'/.test(normalizedMessage)) {
    return {
      provider: ImageProvider.GPT_LOW,
      reason: 'Quoted text detected - GPT Image for text rendering',
      availableProviders,
    };
  }

  // Default: Schnell (cheaper)
  return {
    provider: ImageProvider.SCHNELL,
    reason: 'General image - Schnell for cost-effective generation',
    availableProviders,
  };
}

/**
 * Get available providers for a plan (v12.0 - All plans get both)
 */
export function getAvailableProvidersForPlan(userPlan?: string): ImageProvider[] {
  // v12.0: All plans have access to both models
  return [ImageProvider.SCHNELL, ImageProvider.GPT_LOW];
}

// ==========================================
// 🤖 AI-POWERED CLASSIFICATION (v12.0)
// ==========================================

/**
 * AI Classification Result interface
 */
export interface AIClassificationResult {
  provider: ImageProvider;
  confidence: number;
  reasoning: string;
  detectedIntent: string;
}

/**
 * Classify image request using AI when static detection is ambiguous
 * Uses Gemini Flash for intelligent routing
 */
export async function classifyWithAI(
  message: string,
  userPlan?: string
): Promise<AIClassificationResult> {
  try {
    const prompt = buildClassificationPrompt(message, userPlan);
    const response = await callGeminiFlash(prompt);
    return parseAIResponse(response, userPlan);
  } catch (error) {
    console.error('[ImageIntentDetector] AI classification failed, using fallback:', error);
    const fallback = getQuickProviderRecommendation(message, userPlan);
    return {
      provider: fallback.provider,
      confidence: 0.5,
      reasoning: 'AI classification failed, using static fallback',
      detectedIntent: 'general',
    };
  }
}

/**
 * Build prompt for AI classification (v12.0 - 2 Models)
 */
function buildClassificationPrompt(message: string, userPlan?: string): string {
  return `You are an image generation router. Classify this request into the best model.

AVAILABLE MODELS:
- SCHNELL: ₹0.25 - General images (nature, animals, scenery, objects, people without text)
- GPT_LOW: ₹1.18 - Premium (text in image, ads, festivals, posters, logos, style transforms, religious)

USER REQUEST: "${message}"

ROUTING RULES:
- SCHNELL: Nature, landscapes, animals, objects, simple people photos
- GPT_LOW: Text in images, logos, banners, posters, cards, festivals, deities, GTA/anime style, advertisements

Choose the most cost-effective option that meets quality needs.

Respond in JSON only:
{
  "provider": "SCHNELL" | "GPT_LOW",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "detectedIntent": "general" | "text_based" | "logo" | "festival" | "religious" | "transformation" | "advertisement"
}`;
}

/**
 * Call Gemini Flash for classification
 */
async function callGeminiFlash(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Parse AI response into classification result (v12.0)
 */
function parseAIResponse(response: string, userPlan?: string): AIClassificationResult {
  try {
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    // Map string to ImageProvider enum (v12.0)
    const providerMap: Record<string, ImageProvider> = {
      'SCHNELL': ImageProvider.SCHNELL,
      'GPT_LOW': ImageProvider.GPT_LOW,
    };
    
    const provider = providerMap[parsed.provider] || ImageProvider.SCHNELL;
    
    return {
      provider,
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
      reasoning: parsed.reasoning || 'AI classification',
      detectedIntent: parsed.detectedIntent || 'general',
    };
  } catch (error) {
    console.error('[ImageIntentDetector] Failed to parse AI response:', error);
    return {
      provider: ImageProvider.SCHNELL,
      confidence: 0.5,
      reasoning: 'Failed to parse AI response',
      detectedIntent: 'general',
    };
  }
}

// ==========================================
// 🚀 DYNAMIC PROVIDER RECOMMENDATION (AI-FIRST)
// ==========================================

/**
 * Get provider recommendation using AI-first approach
 * This is the PRIMARY function to use - always uses AI, static only as fallback
 */
export async function getDynamicProviderRecommendation(
  message: string,
  userPlan?: string
): Promise<{ 
  provider: ImageProvider; 
  reason: string; 
  availableProviders: ImageProvider[];
  confidence: number;
  detectedIntent: string;
}> {
  const startTime = Date.now();
  
  // v12.0: All plans have access to both models
  const availableProviders = [ImageProvider.SCHNELL, ImageProvider.GPT_LOW];

  try {
    console.log(`[IntentDetector] 🤖 AI routing for: "${message.substring(0, 50)}..."`);
    
    const aiResult = await classifyWithAI(message, userPlan);
    const latency = Date.now() - startTime;
    
    console.log(`[IntentDetector] ✅ AI result: ${aiResult.provider} (${aiResult.confidence.toFixed(2)}) - ${aiResult.reasoning} [${latency}ms]`);
    
    return {
      provider: aiResult.provider,
      reason: aiResult.reasoning,
      availableProviders,
      confidence: aiResult.confidence,
      detectedIntent: aiResult.detectedIntent,
    };
    
  } catch (error) {
    console.error('[IntentDetector] ❌ AI failed, using static fallback:', error);
    
    const staticResult = getQuickProviderRecommendation(message, userPlan);
    return {
      provider: staticResult.provider,
      reason: `[Fallback] ${staticResult.reason}`,
      availableProviders: staticResult.availableProviders,
      confidence: 0.5,
      detectedIntent: 'general',
    };
  }
}

// ==========================================
// 🎭 IMG2IMG STYLE CLASSIFICATION (v12.0)
// ==========================================

/**
 * Classify if the edit prompt is for character/anime style or general edit
 * v12.0: Uses GPT LOW for both (no Flux Kontext)
 */
export async function classifyImg2ImgStyle(
  prompt: string
): Promise<{ isCharacterStyle: boolean; reason: string }> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return fallbackStyleDetection(prompt);
    }

    const classificationPrompt = `You are an image editing classifier for img2img.

EDIT REQUEST: "${prompt}"

Determine if this is a CHARACTER/CARTOON style request or GENERAL edit.

CHARACTER STYLE (isCharacterStyle: true):
- Pixar, Disney, 3D animated looks
- Cartoon, anime, manga, comic style
- GTA style, video game character
- Caricature, chibi

GENERAL EDIT (isCharacterStyle: false):
- Paintings (oil, watercolor)
- Background changes
- Portrait enhancement
- Any general edits

Default to false when unsure.

Respond ONLY in JSON:
{
  "isCharacterStyle": true or false,
  "reason": "brief explanation"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: classificationPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('[classifyImg2ImgStyle] Gemini API error:', response.status);
      return fallbackStyleDetection(prompt);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const cleanedResponse = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    console.log(`[classifyImg2ImgStyle] AI result: ${parsed.isCharacterStyle ? 'CHARACTER' : 'GENERAL'} - ${parsed.reason}`);
    
    return {
      isCharacterStyle: parsed.isCharacterStyle === true,
      reason: parsed.reason || 'AI classification',
    };

  } catch (error) {
    console.error('[classifyImg2ImgStyle] Error:', error);
    return fallbackStyleDetection(prompt);
  }
}

/**
 * Fallback style detection when AI is unavailable
 */
function fallbackStyleDetection(prompt: string): { isCharacterStyle: boolean; reason: string } {
  const normalizedPrompt = prompt.toLowerCase();
  
  const characterKeywords = [
    'anime', 'cartoon', 'comic', 'manga', 'gta', 'pixar', 'disney', 'animated', 'chibi'
  ];
  
  const isCharacter = characterKeywords.some(kw => normalizedPrompt.includes(kw));
  
  return {
    isCharacterStyle: isCharacter,
    reason: isCharacter 
      ? '[Fallback] Cartoon/animated keyword detected' 
      : '[Fallback] Default - general edit',
  };
}

// ==========================================
// ✅ SMART DETECTION (Static + AI)
// ==========================================

/**
 * Smart detection - combines static + AI for best results
 * 
 * Flow:
 * 1. Run static detection (fast, free)
 * 2. If confidence 0.4-0.7 (ambiguous) → Use AI classification
 * 3. If confidence > 0.7 (certain) → Use static result
 * 4. If confidence < 0.4 → Not an image request
 */
export async function detectImageIntentSmart(
  input: IntentDetectionInput
): Promise<IntentDetectionResult> {
  // Step 1: Static detection
  const staticResult = detectImageIntent(input);
  
  // Step 2: Check if AI classification needed
  const needsAI = staticResult.isImageRequest && 
                  staticResult.confidence >= 0.4 && 
                  staticResult.confidence <= 0.7;
  
  if (!needsAI) {
    return staticResult;
  }
  
  // Step 3: AI classification for ambiguous cases
  console.log('[ImageIntentDetector] 🤖 Using AI classification for ambiguous request');
  const aiResult = await classifyWithAI(input.message, input.userPlan);
  
  // Step 4: Merge results
  const providerDisplay = IMAGE_PROVIDER_DISPLAY[aiResult.provider];
  
  return {
    ...staticResult,
    suggestedProvider: aiResult.provider,
    confidence: aiResult.confidence,
    reasoning: `🤖 AI: ${aiResult.reasoning}`,
    suggestedProviderDisplay: {
      displayName: providerDisplay.displayName,
      icon: providerDisplay.icon,
      tagline: providerDisplay.tagline,
    },
    routingInfo: {
      ...staticResult.routingInfo!,
      suggestedProvider: aiResult.provider,
      routingReason: aiResult.reasoning,
    },
  };
}