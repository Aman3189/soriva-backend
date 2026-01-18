// src/services/image/intentDetector.ts

/**
 * ==========================================
 * SORIVA IMAGE INTENT DETECTOR
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: Detect if user message is an image generation request
 * Supports: Hindi, Hinglish, English
 * Last Updated: January 17, 2026
 * 
 * v10.2 Changes:
 * - Replaced Schnell/Fast (Spark/Nova) with single Klein 9B model
 * - Simplified provider selection (only one model now)
 * 
 * LOGIC:
 * - Uses keyword matching + LLM verification for complex cases
 * - Detects intent type (general, text-based, logo, realistic)
 * - All requests use Klein 9B (single model)
 */

import {
  IntentDetectionResult,
  IntentDetectionInput,
  ImageIntentType,
  ImageProvider,
  IMAGE_INTENT_KEYWORDS,
} from '../../types/image.types';

// ==========================================
// KLEIN 9B DISPLAY CONFIGURATION
// ==========================================

/**
 * Display names for frontend
 * Internal: klein9b (backend)
 * Display: Klein 9B (frontend)
 */
export const IMAGE_PROVIDER_DISPLAY = {
  [ImageProvider.KLEIN9B]: {
    displayName: 'Klein 9B',
    icon: '🎨',
    tagline: 'High quality image generation',
    description: 'Premium AI image generation with excellent detail and text rendering',
  },
} as const;

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
   */
  public detect(input: IntentDetectionInput): IntentDetectionResult {
    const { message } = input;
    const normalizedMessage = this.normalizeMessage(message);

    // Layer 1: Primary keyword detection
    const hasPrimaryKeyword = this.hasPrimaryImageKeyword(normalizedMessage);
    const hasActionKeyword = this.hasActionKeyword(normalizedMessage);

    // If no image-related keywords at all, return early
    if (!hasPrimaryKeyword && !hasActionKeyword) {
      return this.createNonImageResult(message);
    }

    // Layer 2: Intent type classification
    const intentType = this.classifyIntentType(normalizedMessage);

    // Layer 3: Calculate confidence
    const confidence = this.calculateConfidence(normalizedMessage, hasPrimaryKeyword, hasActionKeyword);

    // Layer 4: Provider is always Klein 9B (single model)
    const suggestedProvider = ImageProvider.KLEIN9B;

    // If confidence is too low, treat as non-image request
    if (confidence < 0.4) {
      return this.createNonImageResult(message);
    }

    // Get display info for frontend
    const providerDisplay = IMAGE_PROVIDER_DISPLAY[suggestedProvider];

    return {
      isImageRequest: true,
      confidence,
      intentType,
      extractedPrompt: this.extractPrompt(message),
      suggestedProvider,
      // Frontend display properties
      suggestedProviderDisplay: {
        displayName: providerDisplay.displayName,
        icon: providerDisplay.icon,
        tagline: providerDisplay.tagline,
      },
      reasoning: this.generateReasoning(intentType),
      canOverride: false, // Single model - no override needed
    };
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
  private createNonImageResult(message: string): IntentDetectionResult {
    const defaultProvider = ImageProvider.KLEIN9B;
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
    };
  }

  /**
   * Generate reasoning for the detection
   */
  private generateReasoning(intentType: ImageIntentType): string {
    const providerDisplay = IMAGE_PROVIDER_DISPLAY[ImageProvider.KLEIN9B];
    
    const reasons: Record<ImageIntentType, string> = {
      [ImageIntentType.NONE]: 'No image intent detected',
      [ImageIntentType.GENERAL]: `General image request - using ${providerDisplay.displayName} ${providerDisplay.icon}`,
      [ImageIntentType.TEXT_BASED]: `Text in image detected - using ${providerDisplay.displayName} ${providerDisplay.icon} for excellent text rendering`,
      [ImageIntentType.LOGO]: `Logo design detected - using ${providerDisplay.displayName} ${providerDisplay.icon} for precision`,
      [ImageIntentType.REALISTIC]: `Realistic image request - using ${providerDisplay.displayName} ${providerDisplay.icon}`,
      [ImageIntentType.BANNER]: `Banner/poster detected - using ${providerDisplay.displayName} ${providerDisplay.icon} for quality`,
    };

    return reasons[intentType] || 'Image generation request detected';
  }
}

// ==========================================
// EXPORT SINGLETON & HELPER
// ==========================================

export const imageIntentDetector = ImageIntentDetector.getInstance();

export function detectImageIntent(input: IntentDetectionInput): IntentDetectionResult {
  return imageIntentDetector.detect(input);
}