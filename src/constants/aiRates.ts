// src/constants/aiRates.ts
// Phase 1: AI Rates Manager (Class-based architecture)

/**
 * ============================================
 * INTERFACES & TYPES
 * ============================================
 */
export interface DocumentType {
  type: string;
  keywords: string[];
  averageWords: number;
  maxWords: number;
  description: string;
}

export interface PlanLimits {
  planName: string;
  totalWords: number;
  chatWords: number; // 90% for normal chat
  documentWords: number; // 10% for document generation
  maxDocumentWords: number; // Max words per single document
  dailyChatWords: number;
  studioCredits: number;
  responseDelay: number; // in seconds
}

export interface StudioFeature {
  featureName: string;
  displayName: string;
  credits: number;
  apiCost: number; // Approximate cost in rupees
  category: string;
}

export interface DocumentDetectionResult {
  isDocument: boolean;
  documentType?: string;
  detectedKeywords?: string[];
}

export interface DocumentGenerationCheck {
  canGenerate: boolean;
  reason?: string;
  remaining?: number;
}

export interface StudioFeatureCheck {
  canUse: boolean;
  reason?: string;
  creditsNeeded?: number;
}

/**
 * ============================================
 * AI RATES MANAGER CLASS
 * ============================================
 */
export class AIRatesManager {
  /**
   * Document detection keywords (static constants)
   */
  private static readonly DOCUMENT_KEYWORDS = {
    resume: [
      'resume',
      'cv',
      'curriculum vitae',
      'curriculum',
      'biodata',
      'bio data',
      'job profile',
    ],
    coverLetter: [
      'cover letter',
      'covering letter',
      'application letter',
      'job application',
      'motivation letter',
    ],
    blog: ['blog post', 'blog', 'article', 'write article', 'post likh', 'article likh'],
    email: ['email', 'mail', 'email draft', 'write email', 'compose email', 'email likh'],
    letter: ['letter', 'formal letter', 'official letter', 'letter likh', 'patra'],
    proposal: ['proposal', 'business proposal', 'project proposal', 'proposal likh'],
    report: ['report', 'report likh', 'report bana', 'analysis report', 'summary report'],
    essay: ['essay', 'essay likh', 'composition', 'paragraph likh'],
  };

  /**
   * Document types configuration
   */
  private static readonly DOCUMENT_TYPES: DocumentType[] = [
    {
      type: 'resume',
      keywords: AIRatesManager.DOCUMENT_KEYWORDS.resume,
      averageWords: 600,
      maxWords: 1000,
      description: 'Professional resume or CV',
    },
    {
      type: 'cover_letter',
      keywords: AIRatesManager.DOCUMENT_KEYWORDS.coverLetter,
      averageWords: 400,
      maxWords: 1000,
      description: 'Job application cover letter',
    },
    {
      type: 'blog',
      keywords: AIRatesManager.DOCUMENT_KEYWORDS.blog,
      averageWords: 800,
      maxWords: 1000,
      description: 'Blog post or article',
    },
    {
      type: 'email',
      keywords: AIRatesManager.DOCUMENT_KEYWORDS.email,
      averageWords: 250,
      maxWords: 1000,
      description: 'Professional email draft',
    },
    {
      type: 'letter',
      keywords: AIRatesManager.DOCUMENT_KEYWORDS.letter,
      averageWords: 350,
      maxWords: 1000,
      description: 'Formal or official letter',
    },
    {
      type: 'proposal',
      keywords: AIRatesManager.DOCUMENT_KEYWORDS.proposal,
      averageWords: 700,
      maxWords: 1000,
      description: 'Business or project proposal',
    },
    {
      type: 'report',
      keywords: AIRatesManager.DOCUMENT_KEYWORDS.report,
      averageWords: 650,
      maxWords: 1000,
      description: 'Analysis or summary report',
    },
    {
      type: 'essay',
      keywords: AIRatesManager.DOCUMENT_KEYWORDS.essay,
      averageWords: 500,
      maxWords: 1000,
      description: 'Essay or composition',
    },
  ];

  /**
   * Plan limits (90% chat + 10% document)
   */
  private static readonly PLAN_LIMITS: Record<string, PlanLimits> = {
    vibe_free: {
      planName: 'vibe_free',
      totalWords: 15000,
      chatWords: 13500, // 90%
      documentWords: 1500, // 10%
      maxDocumentWords: 1000,
      dailyChatWords: 450,
      studioCredits: 5,
      responseDelay: 5,
    },
    vibe_paid: {
      planName: 'vibe_paid',
      totalWords: 100000,
      chatWords: 90000, // 90%
      documentWords: 10000, // 10%
      maxDocumentWords: 1000,
      dailyChatWords: 3000,
      studioCredits: 30,
      responseDelay: 3,
    },
    apex: {
      planName: 'apex',
      totalWords: 350000,
      chatWords: 315000, // 90%
      documentWords: 35000, // 10%
      maxDocumentWords: 1000,
      dailyChatWords: 10500,
      studioCredits: 200,
      responseDelay: 0,
    },
    spark: {
      planName: 'spark',
      totalWords: 175000,
      chatWords: 157500, // 90%
      documentWords: 17500, // 10%
      maxDocumentWords: 1000,
      dailyChatWords: 5250,
      studioCredits: 80,
      responseDelay: 2,
    },
    persona: {
      planName: 'persona',
      totalWords: 500000,
      chatWords: 450000, // 90%
      documentWords: 50000, // 10%
      maxDocumentWords: 1000,
      dailyChatWords: 15000,
      studioCredits: 250,
      responseDelay: 0,
    },
  };

  /**
   * Studio features configuration
   */
  private static readonly STUDIO_FEATURES: Record<string, StudioFeature> = {
    dream_craft: {
      featureName: 'dream_craft',
      displayName: 'Dream Craft',
      credits: 7,
      apiCost: 2.1,
      category: 'image_generation',
    },
    brand_soul: {
      featureName: 'brand_soul',
      displayName: 'Brand Soul',
      credits: 20,
      apiCost: 6.6,
      category: 'logo_design',
    },
    fun_forge: {
      featureName: 'fun_forge',
      displayName: 'Fun Forge',
      credits: 2,
      apiCost: 0,
      category: 'meme_creation',
    },
    glow_up: {
      featureName: 'glow_up',
      displayName: 'Glow Up',
      credits: 2,
      apiCost: 0.4,
      category: 'image_enhancement',
    },
    pure_view: {
      featureName: 'pure_view',
      displayName: 'Pure View',
      credits: 2,
      apiCost: 0.25,
      category: 'background_removal',
    },
    clean_slate: {
      featureName: 'clean_slate',
      displayName: 'Clean Slate',
      credits: 2,
      apiCost: 0.25,
      category: 'object_removal',
    },
  };

  /**
   * ============================================
   * PUBLIC METHODS
   * ============================================
   */

  /**
   * Detect if user message is requesting document generation
   */
  public static isDocumentRequest(message: string): DocumentDetectionResult {
    const lowerMessage = message.toLowerCase();

    for (const docType of this.DOCUMENT_TYPES) {
      const matchedKeywords: string[] = [];

      for (const keyword of docType.keywords) {
        if (lowerMessage.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }

      // If any keyword matches, it's a document request
      if (matchedKeywords.length > 0) {
        return {
          isDocument: true,
          documentType: docType.type,
          detectedKeywords: matchedKeywords,
        };
      }
    }

    return { isDocument: false };
  }

  /**
   * Get plan limits by plan name
   */
  public static getPlanLimits(planName: string): PlanLimits {
    return this.PLAN_LIMITS[planName] || this.PLAN_LIMITS.vibe_free;
  }

  /**
   * Get all plan limits
   */
  public static getAllPlanLimits(): Record<string, PlanLimits> {
    return this.PLAN_LIMITS;
  }

  /**
   * Get studio feature details
   */
  public static getStudioFeature(featureName: string): StudioFeature | null {
    return this.STUDIO_FEATURES[featureName] || null;
  }

  /**
   * Get all studio features
   */
  public static getAllStudioFeatures(): Record<string, StudioFeature> {
    return this.STUDIO_FEATURES;
  }

  /**
   * Calculate carry-forward credits (10% of unused)
   */
  public static calculateCarryForward(unusedCredits: number): number {
    return Math.floor(unusedCredits * 0.1);
  }

  /**
   * Count words in text
   */
  public static countWords(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  /**
   * Check if user has enough document words available
   */
  public static canGenerateDocument(
    planName: string,
    currentDocumentWordsUsed: number,
    estimatedWords: number
  ): DocumentGenerationCheck {
    const limits = this.getPlanLimits(planName);
    const remaining = limits.documentWords - currentDocumentWordsUsed;

    if (estimatedWords > limits.maxDocumentWords) {
      return {
        canGenerate: false,
        reason: `Document exceeds maximum limit of ${limits.maxDocumentWords} words`,
        remaining,
      };
    }

    if (remaining < estimatedWords) {
      return {
        canGenerate: false,
        reason: `Insufficient document words. Need ${estimatedWords}, have ${remaining}`,
        remaining,
      };
    }

    return {
      canGenerate: true,
      remaining: remaining - estimatedWords,
    };
  }

  /**
   * Check if user has enough studio credits
   */
  public static canUseStudioFeature(
    featureName: string,
    currentCreditsRemaining: number
  ): StudioFeatureCheck {
    const feature = this.getStudioFeature(featureName);

    if (!feature) {
      return {
        canUse: false,
        reason: 'Invalid studio feature',
      };
    }

    if (currentCreditsRemaining < feature.credits) {
      return {
        canUse: false,
        reason: `Insufficient credits. Need ${feature.credits}, have ${currentCreditsRemaining}`,
        creditsNeeded: feature.credits,
      };
    }

    return {
      canUse: true,
      creditsNeeded: feature.credits,
    };
  }

  /**
   * Get document type details
   */
  public static getDocumentType(type: string): DocumentType | undefined {
    return this.DOCUMENT_TYPES.find((dt) => dt.type === type);
  }

  /**
   * Get all document types
   */
  public static getAllDocumentTypes(): DocumentType[] {
    return this.DOCUMENT_TYPES;
  }
}

/**
 * Default export for convenience
 */
export default AIRatesManager;
