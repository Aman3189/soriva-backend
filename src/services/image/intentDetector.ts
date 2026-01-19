// src/services/image/intentDetector.ts

/**
 * ==========================================
 * SORIVA IMAGE INTENT DETECTOR v11.0
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Detect if user message is an image generation request
 * Supports: Hindi, Hinglish, English
 * Last Updated: January 19, 2026
 * 
 * v11.0 Changes (January 19, 2026):
 * - ✅ ADDED: Dual Model Support (Klein 9B + Schnell)
 * - ✅ ADDED: Smart routing based on content type
 * - ✅ ADDED: Cost-aware provider suggestion
 * - ✅ ADDED: LITE plan Schnell-only routing
 * 
 * DUAL MODEL SYSTEM:
 * - Klein 9B (BFL): ₹1.26 - Premium quality, text rendering, logos, deities, festivals
 * - Schnell (Fal.ai): ₹0.25 - Fast, budget-friendly, general images
 * 
 * ROUTING LOGIC:
 * - Text/Typography → Klein 9B (better text rendering)
 * - Logo/Brand → Klein 9B (precision required)
 * - Deity/Festival → Klein 9B (cultural accuracy)
 * - General/People/Animals → Schnell (cost-effective)
 * - LITE Plan users → Schnell only (no Klein access)
 */

import {
  IntentDetectionResult,
  IntentDetectionInput,
  ImageIntentType,
  ImageProvider,
  IMAGE_INTENT_KEYWORDS,
} from '../../types/image.types';

// ==========================================
// DUAL MODEL DISPLAY CONFIGURATION
// ==========================================

/**
 * Display names for frontend
 * Both models have distinct purposes
 */
/**
 * Provider display info with cost details
 * Used for frontend display and routing decisions
 */
export const IMAGE_PROVIDER_DISPLAY: Record<ImageProvider, {
  displayName: string;
  icon: string;
  tagline: string;
  description: string;
  costPerImage: number;
  costTier: 'premium' | 'budget';
}> = {
  [ImageProvider.KLEIN9B]: {
    displayName: 'Klein 9B',
    icon: '🎨',
    tagline: 'Premium quality with text rendering',
    description: 'Best for text, logos, deities, festivals - excellent detail',
    costPerImage: 1.26, // INR
    costTier: 'premium',
  },
  [ImageProvider.SCHNELL]: {
    displayName: 'Schnell',
    icon: '⚡',
    tagline: 'Fast & budget-friendly',
    description: 'Great for general images, people, animals, objects',
    costPerImage: 0.25, // INR
    costTier: 'budget',
  },
};

// ==========================================
// ROUTING KEYWORDS - KLEIN 9B PREFERRED
// ==========================================

/**
 * Keywords that should route to Klein 9B (premium)
 * These require higher quality or specific capabilities
 */
const KLEIN_PREFERRED_KEYWORDS = {
  // Text/Typography (Klein has better text rendering)
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
// INTENT DETECTOR CLASS
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
   * 4. Smart provider routing (Klein vs Schnell)
   * 
   * @param input - Detection input with message and optional user plan
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

    // Layer 4: Smart provider routing (Klein vs Schnell)
    const routingResult = this.determineProvider(normalizedMessage, intentType, userPlan);

    // Get display info for frontend
    const providerDisplay = IMAGE_PROVIDER_DISPLAY[routingResult.provider];

    return {
      isImageRequest: true,
      confidence,
      intentType,
      extractedPrompt: this.extractPrompt(message),
      suggestedProvider: routingResult.provider,
      // Frontend display properties
      suggestedProviderDisplay: {
        displayName: providerDisplay.displayName,
        icon: providerDisplay.icon,
        tagline: providerDisplay.tagline,
      },
      reasoning: routingResult.reasoning,
      canOverride: routingResult.canOverride,
      // ✅ NEW: Additional routing info
      routingInfo: {
        suggestedProvider: routingResult.provider,
        alternativeProvider: routingResult.alternativeProvider,
        costEstimate: providerDisplay.costPerImage,
        routingReason: routingResult.routingReason,
        isLitePlanRestricted: routingResult.isLitePlanRestricted,
      },
    };
  }

  // ==========================================
  // SMART PROVIDER ROUTING (NEW!)
  // ==========================================

  /**
   * Determine the best provider based on content and user plan
   * 
   * Priority:
   * 1. LITE plan → Always Schnell (no Klein access)
   * 2. Text/Logo/Deity/Festival → Klein 9B (quality needed)
   * 3. General images → Schnell (cost-effective)
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
    isLitePlanRestricted: boolean;
  } {
    const kleinDisplay = IMAGE_PROVIDER_DISPLAY[ImageProvider.KLEIN9B];
    const schnellDisplay = IMAGE_PROVIDER_DISPLAY[ImageProvider.SCHNELL];

    // ✅ LITE Plan Check - Schnell only
    if (userPlan === 'LITE') {
      return {
        provider: ImageProvider.SCHNELL,
        alternativeProvider: undefined, // No alternative for LITE
        reasoning: `LITE plan - using ${schnellDisplay.displayName} ${schnellDisplay.icon}`,
        routingReason: 'LITE plan has Schnell images only. Upgrade to PLUS for Klein 9B access.',
        canOverride: false, // Cannot override on LITE
        isLitePlanRestricted: true,
      };
    }

    // ✅ Check for Klein-preferred content
    const kleinScore = this.calculateKleinScore(message, intentType);
    const schnellScore = this.calculateSchnellScore(message);

    // Decision logic
    if (kleinScore > schnellScore || kleinScore >= 2) {
      // Klein 9B recommended
      const reason = this.getKleinReason(message, intentType);
      return {
        provider: ImageProvider.KLEIN9B,
        alternativeProvider: ImageProvider.SCHNELL,
        reasoning: `${reason} - using ${kleinDisplay.displayName} ${kleinDisplay.icon}`,
        routingReason: reason,
        canOverride: true, // Paid users can switch to Schnell to save cost
        isLitePlanRestricted: false,
      };
    } else {
      // Schnell recommended (cost-effective)
      return {
        provider: ImageProvider.SCHNELL,
        alternativeProvider: ImageProvider.KLEIN9B,
        reasoning: `General image - using ${schnellDisplay.displayName} ${schnellDisplay.icon} (cost-effective)`,
        routingReason: 'General image content - Schnell is recommended for cost savings',
        canOverride: true, // Can switch to Klein for higher quality
        isLitePlanRestricted: false,
      };
    }
  }

  /**
   * Calculate score for Klein 9B preference
   */
  private calculateKleinScore(message: string, intentType: ImageIntentType): number {
    let score = 0;

    // Intent type bonuses
    if (intentType === ImageIntentType.TEXT_BASED) score += 3;
    if (intentType === ImageIntentType.LOGO) score += 3;
    if (intentType === ImageIntentType.BANNER) score += 2;

    // Keyword matching
    for (const [category, keywords] of Object.entries(KLEIN_PREFERRED_KEYWORDS)) {
      const matchCount = keywords.filter(kw => message.includes(kw.toLowerCase())).length;
      if (matchCount > 0) {
        score += matchCount * (category === 'deity' || category === 'text' ? 2 : 1);
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
   * Get human-readable reason for Klein routing
   */
  private getKleinReason(message: string, intentType: ImageIntentType): string {
    // Check specific categories
    for (const kw of KLEIN_PREFERRED_KEYWORDS.text) {
      if (message.includes(kw.toLowerCase())) {
        return 'Text/typography detected - Klein 9B has superior text rendering';
      }
    }

    for (const kw of KLEIN_PREFERRED_KEYWORDS.logo) {
      if (message.includes(kw.toLowerCase())) {
        return 'Logo/brand design detected - Klein 9B for precision';
      }
    }

    for (const kw of KLEIN_PREFERRED_KEYWORDS.deity) {
      if (message.includes(kw.toLowerCase())) {
        return 'Deity/religious content detected - Klein 9B for cultural accuracy';
      }
    }

    for (const kw of KLEIN_PREFERRED_KEYWORDS.festival) {
      if (message.includes(kw.toLowerCase())) {
        return 'Festival/occasion detected - Klein 9B for detailed design';
      }
    }

    for (const kw of KLEIN_PREFERRED_KEYWORDS.cards) {
      if (message.includes(kw.toLowerCase())) {
        return 'Card/invitation detected - Klein 9B for text + design';
      }
    }

    // Intent type fallback
    switch (intentType) {
      case ImageIntentType.TEXT_BASED:
        return 'Text in image required - Klein 9B recommended';
      case ImageIntentType.LOGO:
        return 'Logo design - Klein 9B for precision';
      case ImageIntentType.BANNER:
        return 'Banner/poster - Klein 9B for quality';
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
    // Check for logo first (highest priority)
    if (this.hasLogoKeyword(message)) {
      return ImageIntentType.LOGO;
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
      .replace(/\s+/g, ' ');
  }

  /**
   * Extract the actual prompt from message
   * Removes intent keywords to get clean prompt
   */
  private extractPrompt(message: string): string {
    let prompt = message;

    // Remove common prefixes
    const prefixPatterns = [
      /^(please\s+)?/i,
      /^(can you\s+)?/i,
      /^(mujhe\s+)?/i,
      /^(ek\s+)?/i,
      /^(create|generate|make|draw|design)\s+(a|an|me)?\s*/i,
      /^(banao|bana do|dikhao)\s*/i,
    ];

    prefixPatterns.forEach(pattern => {
      prompt = prompt.replace(pattern, '');
    });

    // Remove common suffixes
    const suffixPatterns = [
      /\s*(banao|bana do|dikhao|generate karo|create karo)$/i,
      /\s*(please|pls)$/i,
    ];

    suffixPatterns.forEach(pattern => {
      prompt = prompt.replace(pattern, '');
    });

    return prompt.trim();
  }

  /**
   * Create result for non-image requests
   */
  private createNonImageResult(message: string, userPlan?: string): IntentDetectionResult {
    // Default provider based on plan
    const defaultProvider = userPlan === 'LITE' ? ImageProvider.SCHNELL : ImageProvider.KLEIN9B;
    const providerDisplay = IMAGE_PROVIDER_DISPLAY[defaultProvider];
    
    return {
      isImageRequest: false,
      confidence: 0,
      intentType: ImageIntentType.NONE,
      extractedPrompt: message,
      suggestedProvider: defaultProvider,
      suggestedProviderDisplay: {
        displayName: providerDisplay.displayName,
        icon: providerDisplay.icon,
        tagline: providerDisplay.tagline,
      },
      reasoning: 'No image generation intent detected',
      canOverride: false,
      routingInfo: {
        suggestedProvider: defaultProvider,
        costEstimate: providerDisplay.costPerImage,
        routingReason: 'No image intent',
        isLitePlanRestricted: userPlan === 'LITE',
      },
    };
  }
}

// ==========================================
// EXPORT SINGLETON & HELPER
// ==========================================

export const imageIntentDetector = ImageIntentDetector.getInstance();

/**
 * Detect image intent with smart provider routing
 * @param input - Message and optional user plan
 */
export function detectImageIntent(input: IntentDetectionInput): IntentDetectionResult {
  return imageIntentDetector.detect(input);
}

/**
 * ✅ NEW: Quick check if content needs Klein 9B
 * Useful for validation before image generation
 */
export function needsKleinProvider(message: string): boolean {
  const normalizedMessage = message.toLowerCase();
  
  for (const keywords of Object.values(KLEIN_PREFERRED_KEYWORDS)) {
    if (keywords.some(kw => normalizedMessage.includes(kw.toLowerCase()))) {
      return true;
    }
  }
  
  // Check for quoted text
  if (/"[^"]+"|'[^']+'/.test(message)) {
    return true;
  }
  
  return false;
}

/**
 * ✅ NEW: Get provider recommendation without full detection
 */
export function getQuickProviderRecommendation(
  message: string, 
  userPlan?: string
): { provider: ImageProvider; reason: string } {
  // LITE plan always gets Schnell
  if (userPlan === 'LITE') {
    return {
      provider: ImageProvider.SCHNELL,
      reason: 'LITE plan - Schnell only',
    };
  }

  // Check if Klein is needed
  if (needsKleinProvider(message)) {
    return {
      provider: ImageProvider.KLEIN9B,
      reason: 'Premium content detected',
    };
  }

  // Default to Schnell for cost savings
  return {
    provider: ImageProvider.SCHNELL,
    reason: 'General content - cost-effective',
  };
}