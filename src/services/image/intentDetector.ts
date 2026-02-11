// src/services/image/intentDetector.ts

/**
 * ==========================================
 * SORIVA IMAGE INTENT DETECTOR v12.0
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Detect if user message is an image generation request
 * Supports: Hindi, Hinglish, English
 * Last Updated: February 10, 2026
 * 
 * v12.0 Changes (February 10, 2026):
 * - ✅ UPGRADED: 4-Model System (Schnell, Klein, Nano Banana, Flux Kontext)
 * - ✅ ADDED: Style transfer routing to Flux Kontext
 * - ✅ ADDED: Ultra-premium routing to Nano Banana
 * - ✅ UPDATED: Plan-based model access restrictions
 * 
 * v11.0 Changes (January 19, 2026):
 * - ✅ ADDED: Dual Model Support (Klein 9B + Schnell)
 * - ✅ ADDED: Smart routing based on content type
 * - ✅ ADDED: Cost-aware provider suggestion
 * - ✅ ADDED: LITE plan Schnell-only routing
 * 
 * 4-MODEL SYSTEM:
 * - Schnell (Fal.ai): ₹0.25 - Fast, budget-friendly, general images
 * - Klein 9B (BFL): ₹1.26 - Premium quality, text rendering, logos, deities
 * - Nano Banana (Flux Pro 1.1): ₹3.26 - Ultra-premium, photorealistic, professional
 * - Flux Kontext: ₹3.35 - Style transfer, image editing, variations
 * 
 * ROUTING LOGIC:
 * - General/People/Animals → Schnell (cost-effective)
 * - Text/Typography/Logo → Klein 9B (text rendering)
 * - Deity/Festival → Klein 9B (cultural accuracy)
 * - Ultra-realistic/Professional → Nano Banana (PRO/APEX only)
 * - Style transfer/Edit existing → Flux Kontext (PRO/APEX only)
 * 
 * PLAN ACCESS:
 * - STARTER/LITE: Schnell only
 * - PLUS: Schnell + Klein
 * - PRO/APEX: All 4 models
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
  costTier: 'ultra-premium' | 'premium' | 'budget';
  minPlan: string;
}> = {
  [ImageProvider.SCHNELL]: {
    displayName: 'Schnell',
    icon: '⚡',
    tagline: 'Fast & budget-friendly',
    description: 'Great for general images, people, animals, objects',
    costPerImage: 0.25, // INR
    costTier: 'budget',
    minPlan: 'STARTER',
  },
  [ImageProvider.KLEIN9B]: {
    displayName: 'Klein 9B',
    icon: '🎨',
    tagline: 'Premium quality with text rendering',
    description: 'Best for text, logos, deities, festivals - excellent detail',
    costPerImage: 1.26, // INR
    costTier: 'premium',
    minPlan: 'PLUS',
  },
  [ImageProvider.NANO_BANANA]: {
    displayName: 'Nano Banana',
    icon: '🍌',
    tagline: 'Ultra-premium photorealistic',
    description: 'Professional quality, photorealistic, cinematic - best results',
    costPerImage: 3.26, // INR
    costTier: 'ultra-premium',
    minPlan: 'PRO',
  },
  [ImageProvider.FLUX_KONTEXT]: {
    displayName: 'Flux Kontext',
    icon: '✨',
    tagline: 'Style transfer & editing',
    description: 'Transform images, apply styles, create variations',
    costPerImage: 3.35, // INR
    costTier: 'ultra-premium',
    minPlan: 'PRO',
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
// ROUTING KEYWORDS - NANO BANANA PREFERRED
// ==========================================

/**
 * Keywords that should route to Nano Banana (ultra-premium)
 * Professional/photorealistic quality requirements
 */
const NANO_BANANA_PREFERRED_KEYWORDS = {
  // Photorealistic/Professional
  professional: [
    'photorealistic', 'hyperrealistic', 'ultra realistic', 'professional',
    'cinematic', 'studio quality', 'magazine', 'editorial', 'commercial',
    '8k', '4k uhd', 'hyper detailed', 'masterpiece',
    'प्रोफेशनल', 'सिनेमाटिक',
  ],
  
  // High-end portraits
  portraits: [
    'fashion', 'model', 'glamour', 'beauty shot', 'headshot',
    'portfolio', 'professional portrait', 'studio portrait',
  ],
  
  // Product/Commercial
  commercial: [
    'product photography', 'product shot', 'advertising', 'ad campaign',
    'marketing', 'e-commerce', 'catalog', 'packshot',
  ],
  
  // Architectural/Interior
  architecture: [
    'architectural', 'interior design', 'real estate', 'property',
    'luxury', 'premium', 'high-end',
  ],
};

// ==========================================
// ROUTING KEYWORDS - FLUX KONTEXT PREFERRED
// ==========================================

/**
 * Keywords that should route to Flux Kontext (style transfer)
 * Image editing/transformation requirements
 */
const FLUX_KONTEXT_PREFERRED_KEYWORDS = {
  // Style transfer
  style: [
    'style of', 'in the style', 'like', 'similar to', 'inspired by',
    'convert to', 'transform', 'make it look like',
    'जैसा', 'की तरह', 'स्टाइल',
  ],
  
  // Image editing
  editing: [
    'edit', 'modify', 'change', 'alter', 'adjust',
    'remove', 'add to', 'replace', 'swap',
    'बदलो', 'एडिट करो',
  ],
  
  // Variations
  variations: [
    'variation', 'version', 'alternative', 'different',
    'reimagine', 'reinterpret', 'remix',
  ],
  
  // Reference-based
  reference: [
    'based on', 'reference', 'use this', 'from this image',
    'इस इमेज से', 'इसके जैसा',
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
        availableProviders: routingResult.availableProviders,
      },
    };
  }

  // ==========================================
  // SMART PROVIDER ROUTING (NEW!)
  // ==========================================

  /**
   * Determine the best provider based on content and user plan
   * 
   * Priority (4-Model System):
   * 1. STARTER/LITE plan → Schnell only
   * 2. PLUS plan → Schnell + Klein
   * 3. PRO/APEX plan → All 4 models
   * 
   * Content-based routing:
   * - Style transfer/editing → Flux Kontext
   * - Professional/photorealistic → Nano Banana
   * - Text/Logo/Deity → Klein 9B
   * - General → Schnell
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
    availableProviders: ImageProvider[];
  } {
    // Get available providers based on plan
    const availableProviders = this.getAvailableProviders(userPlan);
    
    // Calculate scores for all providers
    const scores = {
      fluxKontext: this.calculateFluxKontextScore(message),
      nanoBanana: this.calculateNanoBananaScore(message),
      klein: this.calculateKleinScore(message, intentType),
      schnell: this.calculateSchnellScore(message),
    };

    // Find best provider from available ones
    let bestProvider = ImageProvider.SCHNELL;
    let bestScore = scores.schnell;
    let routingReason = 'General image - cost-effective choice';

    // Check Flux Kontext (highest priority if available)
    if (availableProviders.includes(ImageProvider.FLUX_KONTEXT) && scores.fluxKontext >= 2) {
      bestProvider = ImageProvider.FLUX_KONTEXT;
      bestScore = scores.fluxKontext;
      routingReason = this.getFluxKontextReason(message);
    }
    // Check Nano Banana
    else if (availableProviders.includes(ImageProvider.NANO_BANANA) && scores.nanoBanana >= 2) {
      bestProvider = ImageProvider.NANO_BANANA;
      bestScore = scores.nanoBanana;
      routingReason = this.getNanoBananaReason(message);
    }
    // Check Klein
    else if (availableProviders.includes(ImageProvider.KLEIN9B) && scores.klein >= 2) {
      bestProvider = ImageProvider.KLEIN9B;
      bestScore = scores.klein;
      routingReason = this.getKleinReason(message, intentType);
    }

    // Get display info
    const providerDisplay = IMAGE_PROVIDER_DISPLAY[bestProvider];
    
    // Find alternative provider
    const alternativeProvider = this.getAlternativeProvider(bestProvider, availableProviders);

    // Check if plan restricted
    const isRestricted = userPlan === 'STARTER' || userPlan === 'LITE';

    return {
      provider: bestProvider,
      alternativeProvider,
      reasoning: `${routingReason} - using ${providerDisplay.displayName} ${providerDisplay.icon}`,
      routingReason,
      canOverride: !isRestricted && availableProviders.length > 1,
      isLitePlanRestricted: isRestricted,
      availableProviders,
    };
  }

  /**
   * Get available providers based on user plan
   */
  private getAvailableProviders(userPlan?: string): ImageProvider[] {
    switch (userPlan?.toUpperCase()) {
      case 'STARTER':
      case 'LITE':
        return [ImageProvider.SCHNELL];
      case 'PLUS':
        return [ImageProvider.SCHNELL, ImageProvider.KLEIN9B];
      case 'PRO':
      case 'APEX':
      case 'SOVEREIGN':
        return [
          ImageProvider.SCHNELL,
          ImageProvider.KLEIN9B,
          ImageProvider.NANO_BANANA,
          ImageProvider.FLUX_KONTEXT,
        ];
      default:
        return [ImageProvider.SCHNELL]; // Default to basic
    }
  }

  /**
   * Get alternative provider for user choice
   */
  private getAlternativeProvider(
    current: ImageProvider,
    available: ImageProvider[]
  ): ImageProvider | undefined {
    // Filter out current and return next best
    const alternatives = available.filter(p => p !== current);
    return alternatives.length > 0 ? alternatives[0] : undefined;
  }

  /**
   * Calculate score for Flux Kontext (style transfer)
   */
  private calculateFluxKontextScore(message: string): number {
    let score = 0;
    
    for (const keywords of Object.values(FLUX_KONTEXT_PREFERRED_KEYWORDS)) {
      const matchCount = keywords.filter(kw => message.includes(kw.toLowerCase())).length;
      score += matchCount * 2; // Higher weight for style transfer
    }
    
    return score;
  }

  /**
   * Calculate score for Nano Banana (ultra-premium)
   */
  private calculateNanoBananaScore(message: string): number {
    let score = 0;
    
    for (const keywords of Object.values(NANO_BANANA_PREFERRED_KEYWORDS)) {
      const matchCount = keywords.filter(kw => message.includes(kw.toLowerCase())).length;
      score += matchCount * 1.5;
    }
    
    return score;
  }

  /**
   * Get reason for Flux Kontext routing
   */
  private getFluxKontextReason(message: string): string {
    for (const kw of FLUX_KONTEXT_PREFERRED_KEYWORDS.style) {
      if (message.includes(kw.toLowerCase())) {
        return 'Style transfer detected - Flux Kontext for best results';
      }
    }
    for (const kw of FLUX_KONTEXT_PREFERRED_KEYWORDS.editing) {
      if (message.includes(kw.toLowerCase())) {
        return 'Image editing detected - Flux Kontext recommended';
      }
    }
    return 'Image transformation - Flux Kontext recommended';
  }

  /**
   * Get reason for Nano Banana routing
   */
  private getNanoBananaReason(message: string): string {
    for (const kw of NANO_BANANA_PREFERRED_KEYWORDS.professional) {
      if (message.includes(kw.toLowerCase())) {
        return 'Professional/photorealistic quality - Nano Banana for best results';
      }
    }
    for (const kw of NANO_BANANA_PREFERRED_KEYWORDS.commercial) {
      if (message.includes(kw.toLowerCase())) {
        return 'Commercial/product photography - Nano Banana recommended';
      }
    }
    return 'Ultra-premium quality requested - Nano Banana recommended';
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
    const availableProviders = this.getAvailableProviders(userPlan);
    const defaultProvider = availableProviders[0]; // First available (Schnell for most)
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
        isLitePlanRestricted: userPlan === 'LITE' || userPlan === 'STARTER',
        availableProviders,
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
 * ✅ UPDATED: Get provider recommendation without full detection (4-model system)
 */
export function getQuickProviderRecommendation(
  message: string, 
  userPlan?: string
): { provider: ImageProvider; reason: string; availableProviders: ImageProvider[] } {
  const normalizedMessage = message.toLowerCase();
  
  // Determine available providers based on plan
  let availableProviders: ImageProvider[];
  switch (userPlan?.toUpperCase()) {
    case 'STARTER':
    case 'LITE':
      availableProviders = [ImageProvider.SCHNELL];
      break;
    case 'PLUS':
      availableProviders = [ImageProvider.SCHNELL, ImageProvider.KLEIN9B];
      break;
    case 'PRO':
    case 'APEX':
    case 'SOVEREIGN':
      availableProviders = [
        ImageProvider.SCHNELL,
        ImageProvider.KLEIN9B,
        ImageProvider.NANO_BANANA,
        ImageProvider.FLUX_KONTEXT,
      ];
      break;
    default:
      availableProviders = [ImageProvider.SCHNELL];
  }

  // STARTER/LITE plan always gets Schnell
  if (userPlan === 'LITE' || userPlan === 'STARTER') {
    return {
      provider: ImageProvider.SCHNELL,
      reason: `${userPlan} plan - Schnell only`,
      availableProviders,
    };
  }

  // Check for Flux Kontext keywords (PRO/APEX only)
  if (availableProviders.includes(ImageProvider.FLUX_KONTEXT)) {
    for (const keywords of Object.values(FLUX_KONTEXT_PREFERRED_KEYWORDS)) {
      if (keywords.some(kw => normalizedMessage.includes(kw.toLowerCase()))) {
        return {
          provider: ImageProvider.FLUX_KONTEXT,
          reason: 'Style transfer/editing detected',
          availableProviders,
        };
      }
    }
  }

  // Check for Nano Banana keywords (PRO/APEX only)
  if (availableProviders.includes(ImageProvider.NANO_BANANA)) {
    for (const keywords of Object.values(NANO_BANANA_PREFERRED_KEYWORDS)) {
      if (keywords.some(kw => normalizedMessage.includes(kw.toLowerCase()))) {
        return {
          provider: ImageProvider.NANO_BANANA,
          reason: 'Professional/photorealistic content detected',
          availableProviders,
        };
      }
    }
  }

  // Check if Klein is needed (PLUS and above)
  if (availableProviders.includes(ImageProvider.KLEIN9B) && needsKleinProvider(message)) {
    return {
      provider: ImageProvider.KLEIN9B,
      reason: 'Premium content detected (text/logo/deity)',
      availableProviders,
    };
  }

  // Default to Schnell for cost savings
  return {
    provider: ImageProvider.SCHNELL,
    reason: 'General content - cost-effective',
    availableProviders,
  };
}
// ==========================================
// AI-BASED DYNAMIC CLASSIFICATION (NEW!)
// ==========================================

/**
 * AI-based image provider classification
 * Uses Gemini Flash for intelligent routing when static keywords are ambiguous
 * 
 * Cost: ~₹0.01 per classification (very cheap)
 * Latency: ~200-500ms
 */
export interface AIClassificationResult {
  provider: ImageProvider;
  confidence: number;
  reasoning: string;
  detectedIntent: string;
}

/**
 * Classify image request using AI when static detection is ambiguous
 * This is called only when:
 * 1. Static confidence is between 0.4-0.7 (ambiguous zone)
 * 2. Multiple providers have similar scores
 * 
 * @param message - User's image generation request
 * @param userPlan - User's subscription plan
 * @returns AI classification result with provider recommendation
 */
export async function classifyWithAI(
  message: string,
  userPlan?: string
): Promise<AIClassificationResult> {
  try {
    // Build classification prompt
    const prompt = buildClassificationPrompt(message, userPlan);
    
    // Use Gemini Flash for cheap, fast classification
    const response = await callGeminiFlash(prompt);
    
    // Parse AI response
    return parseAIResponse(response, userPlan);
  } catch (error) {
    console.error('[ImageIntentDetector] AI classification failed, using fallback:', error);
    // Fallback to static detection
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
 * Build prompt for AI classification
 */
function buildClassificationPrompt(message: string, userPlan?: string): string {
  const availableModels = getAvailableModelsForPlan(userPlan);
  
  return `You are an image generation router. Classify this request into the best model.

AVAILABLE MODELS FOR THIS USER:
${availableModels.map(m => `- ${m.name}: ${m.description}`).join('\n')}

USER REQUEST: "${message}"

Analyze the request and respond in this exact JSON format:
{
  "provider": "SCHNELL" | "KLEIN9B" | "NANO_BANANA",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "detectedIntent": "general" | "text_based" | "logo" | "professional" | "deity" | "festival"
}

ROUTING RULES FOR TEXT-TO-IMAGE:
- SCHNELL: General images (animals, nature, objects, landscapes, scenes) - NO humans/people
- KLEIN9B: Humans, people, faces, portraits, selfies, person, man, woman, boy, girl, deities, festivals
- NANO_BANANA: Text in image, logos, banners, posters, branding, business graphics, professional, commercial, cards, invitations, certificates, flyers

IMPORTANT: NEVER choose FLUX_KONTEXT for text-to-image. FLUX_KONTEXT is ONLY for editing existing images (img2img).

Choose the most cost-effective option that meets quality needs.
Respond with JSON only, no other text.`;
}

/**
 * Get available models description for prompt
 * NOTE: FLUX_KONTEXT is NOT included here - it's only for img2img
 */
function getAvailableModelsForPlan(userPlan?: string): Array<{name: string; description: string}> {
  const models = [
    { name: 'SCHNELL', description: '₹0.25 - Fast, budget-friendly, general images' },
  ];
  
  if (userPlan === 'PLUS' || userPlan === 'PRO' || userPlan === 'APEX' || userPlan === 'SOVEREIGN') {
    models.push({ name: 'KLEIN9B', description: '₹1.26 - Premium, text rendering, logos, deities' });
  }
  
  if (userPlan === 'PRO' || userPlan === 'APEX' || userPlan === 'SOVEREIGN') {
    models.push({ name: 'NANO_BANANA', description: '₹3.26 - Ultra-premium, photorealistic, professional' });
    // NOTE: FLUX_KONTEXT not added - it's for img2img only, not text-to-image
  }
  
  return models;
}

/**
 * Call Gemini Flash for classification (cheap & fast)
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
          temperature: 0.1, // Low for consistent classification
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
 * Parse AI response into classification result
 */
function parseAIResponse(response: string, userPlan?: string): AIClassificationResult {
  try {
    // Clean response (remove markdown code blocks if present)
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    // Map string to ImageProvider enum
    const providerMap: Record<string, ImageProvider> = {
      'SCHNELL': ImageProvider.SCHNELL,
      'KLEIN9B': ImageProvider.KLEIN9B,
      'NANO_BANANA': ImageProvider.NANO_BANANA,
      'FLUX_KONTEXT': ImageProvider.FLUX_KONTEXT,
    };
    
    let provider = providerMap[parsed.provider] || ImageProvider.SCHNELL;
    
    // Validate provider is available for plan
    const quickRec = getQuickProviderRecommendation('', userPlan);
    if (!quickRec.availableProviders.includes(provider)) {
      // Downgrade to best available
      provider = quickRec.availableProviders[quickRec.availableProviders.length - 1];
    }
    
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
 * 
 * @param message - User's image generation request
 * @param userPlan - User's subscription plan
 * @returns Provider recommendation with confidence and reasoning
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
  
  // Get available providers for this plan
  const availableProviders = getAvailableProvidersForPlan(userPlan);
  
  // STARTER plan always gets Schnell (no AI needed)
  if (userPlan === 'STARTER' || userPlan === 'LITE') {
    return {
      provider: ImageProvider.SCHNELL,
      reason: `${userPlan} plan - Schnell only`,
      availableProviders,
      confidence: 1.0,
      detectedIntent: 'general',
    };
  }

  try {
    // 🤖 AI Classification (Primary)
    console.log(`[IntentDetector] 🤖 AI routing for: "${message.substring(0, 50)}..."`);
    
    const aiResult = await classifyWithAI(message, userPlan);
    const latency = Date.now() - startTime;
    
    console.log(`[IntentDetector] ✅ AI result: ${aiResult.provider} (${aiResult.confidence.toFixed(2)}) - ${aiResult.reasoning} [${latency}ms]`);
    
    // Validate provider is available for plan
    if (!availableProviders.includes(aiResult.provider)) {
      // Downgrade to best available
      const bestAvailable = availableProviders[availableProviders.length - 1];
      console.log(`[IntentDetector] ⚠️ ${aiResult.provider} not available, using ${bestAvailable}`);
      return {
        provider: bestAvailable,
        reason: `AI suggested ${aiResult.provider} but not in plan, using ${bestAvailable}`,
        availableProviders,
        confidence: aiResult.confidence * 0.8,
        detectedIntent: aiResult.detectedIntent,
      };
    }
    
    return {
      provider: aiResult.provider,
      reason: aiResult.reasoning,
      availableProviders,
      confidence: aiResult.confidence,
      detectedIntent: aiResult.detectedIntent,
    };
    
  } catch (error) {
    // 🔄 Fallback to static (only if AI fails)
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

/**
 * Get available providers array for a plan
 */
function getAvailableProvidersForPlan(userPlan?: string): ImageProvider[] {
  switch (userPlan?.toUpperCase()) {
    case 'STARTER':
    case 'LITE':
      return [ImageProvider.SCHNELL];
    case 'PLUS':
      return [ImageProvider.SCHNELL, ImageProvider.KLEIN9B];
    case 'PRO':
    case 'APEX':
    case 'SOVEREIGN':
      return [
        ImageProvider.SCHNELL,
        ImageProvider.KLEIN9B,
        ImageProvider.NANO_BANANA,
        ImageProvider.FLUX_KONTEXT,
      ];
    default:
      return [ImageProvider.SCHNELL];
  }
}
// ==========================================
// 🎭 IMG2IMG STYLE CLASSIFICATION (AI-based)
// ==========================================

/**
 * Classify if the edit prompt is for character/anime style or general edit
 * Uses AI to determine the best model for img2img
 */
export async function classifyImg2ImgStyle(
  prompt: string
): Promise<{ isCharacterStyle: boolean; reason: string }> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      // Fallback to simple detection if no API key
      return fallbackStyleDetection(prompt);
    }

    const classificationPrompt = `You are an image editing classifier for img2img. The user may write in English, Hindi, or Hinglish - understand all.

EDIT REQUEST: "${prompt}"

FLUX KONTEXT (isCharacterStyle: true) - Use ONLY for cartoon/animated styles:
- Pixar, Disney, 3D animated character looks
- Cartoon, anime, manga, comic book style
- GTA style, video game character
- Caricature, chibi

NANO BANANA (isCharacterStyle: false) - Use for EVERYTHING ELSE:
- Paintings (oil, watercolor, classical)
- Background changes
- Portrait enhancement
- Realistic style transformations
- Any general edits

IMPORTANT: Default to Nano Banana (false) when unsure - it preserves faces better.

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
    
    // Parse JSON response
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
 * Uses minimal keywords - AI handles Hindi/Hinglish naturally
 */
function fallbackStyleDetection(prompt: string): { isCharacterStyle: boolean; reason: string } {
  const normalizedPrompt = prompt.toLowerCase();
  
  // Minimal core keywords only - AI handles rest including Hindi
  const fluxCoreKeywords = [
    'anime', 'cartoon', 'comic', 'manga', 'gta', 'pixar', 'disney', 'animated', 'chibi'
  ];
  
  const isFlux = fluxCoreKeywords.some(kw => normalizedPrompt.includes(kw));
  
  // Default to Nano Banana (preserves face better)
  return {
    isCharacterStyle: isFlux,
    reason: isFlux 
      ? '[Fallback] Cartoon/animated keyword detected → Flux Kontext' 
      : '[Fallback] Default → Nano Banana (preserves face better)',
  };
}
/**
 * ✅ SMART DETECTION: Combines static + AI for best results
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
    // High confidence or not an image request - use static
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