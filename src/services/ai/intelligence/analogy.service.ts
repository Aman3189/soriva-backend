/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ANALOGY SERVICE - DYNAMIC CONTEXTUAL ANALOGIES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: November 4, 2025
 * 
 * Purpose:
 * - Generate relatable analogies dynamically via LLM
 * - Use Indian cultural references when appropriate
 * - Match analogy complexity to user level
 * - Make complex concepts easy to understand
 * 
 * Features:
 * - DYNAMIC generation via LLM (not static templates)
 * - Indian cultural context (cricket, chai, Bollywood, etc.)
 * - Smart category selection based on user interests
 * - Complexity matching (simple/moderate/detailed)
 * - Universal fallbacks for non-Indian users
 * - Example-based prompt engineering
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import {
  AnalogyComplexity,
  AnalogyCategory,
  GeneratedAnalogy,
  AnalogyContext,
  LLMService,
} from './intelligence.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXAMPLE ANALOGIES (for prompt engineering, not direct use)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// No hardcoded examples - LLM generates dynamically based on region & context
// Guidelines-based approach for true personalization

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AnalogyService {
  private llmService: LLMService;
  private generationCache: Map<string, GeneratedAnalogy> = new Map();

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    console.log('[AnalogyService] ✅ Initialized - Dynamic LLM-powered analogies ready');
  }

  /**
   * Generate analogy dynamically via LLM
   */
  async generateAnalogy(
    topic: string,
    context?: AnalogyContext,
    region: 'IN' | 'US' | 'UK' | 'INTL' = 'INTL'
  ): Promise<GeneratedAnalogy | null> {
    console.log(`[AnalogyService] 🎨 Generating dynamic analogy for: "${topic}" (Region: ${region})`);

    // Check cache first
    const cacheKey = this.buildCacheKey(topic, context, region);
    if (this.generationCache.has(cacheKey)) {
      console.log('[AnalogyService] ⚡ Returning cached analogy');
      return this.generationCache.get(cacheKey)!;
    }

    // Build context
    const fullContext = this.buildFullContext(context);

    // Generate analogy via LLM
    const prompt = this.buildAnalogyPrompt(topic, fullContext, region);
    
    try {
      const generatedText = await this.llmService.generateCompletion(prompt, fullContext);
      
      // Parse the generated analogy
      const analogy = this.parseGeneratedAnalogy(generatedText, topic, fullContext, region);
      
      if (analogy) {
        // Cache the result
        this.generationCache.set(cacheKey, analogy);
        console.log(`[AnalogyService] ✅ Generated: ${analogy.category} (${(analogy.confidence * 100).toFixed(0)}%)`);
        return analogy;
      }

      return null;
    } catch (error) {
      console.error('[AnalogyService] ❌ Error generating analogy:', error);
      return null;
    }
  }

  /**
   * Build complete context from partial context
   */
  private buildFullContext(context?: AnalogyContext): AnalogyContext {
    return {
      topic: context?.topic || '',
      userAge: context?.userAge,
      userBackground: context?.userBackground || 'general',
      preferredCategories: context?.preferredCategories || this.inferDefaultCategories(),
      complexity: context?.complexity || 'moderate',
      culturalPreference: context?.culturalPreference || 'auto',
    };
  }

  /**
   * Build prompt for LLM to generate analogy
   */
  /**
   * Build prompt for LLM to generate analogy - GUIDELINES BASED (No hardcoded examples)
   */
  private buildAnalogyPrompt(
    topic: string, 
    context: AnalogyContext,
    region: 'IN' | 'US' | 'UK' | 'INTL'
  ): string {
    return `
You are Soriva, an expert at creating relatable analogies to explain complex concepts in a friendly, conversational way.

TASK: Generate a clear, engaging analogy to explain the following topic.

Topic to explain: ${topic}

User Context:
- Region: ${region}
- Complexity Level: ${context.complexity || 'moderate'}
- User Background: ${context.userBackground || 'general'}
- Preferred Categories: ${context.preferredCategories?.join(', ') || 'any relatable context'}

CRITICAL GUIDELINES:

1. REGION-BASED CULTURAL CONTEXT:
${this.getRegionalGuidelines(region)}

2. COMPLEXITY MATCHING:
${this.getComplexityGuidance(context.complexity || 'moderate')}

3. QUALITY REQUIREMENTS:
   - Make it CONVERSATIONAL - like a knowledgeable friend explaining
   - Focus on the CORE CONCEPT, not implementation details
   - Use concrete, everyday examples from the user's cultural context
   - Keep it to 2-3 sentences maximum
   - Sound natural, not like a textbook

4. GENDER NOTE: You are Soriva (female AI), so use feminine Hindi verb forms if using Hinglish:
   - "main samjhati hoon" NOT "main samjhata hoon"
   - "main batati hoon" NOT "main batata hoon"

Generate ONLY the analogy text.
No meta-commentary, no "Here's an analogy:" prefix, no explanations.
Start directly with the analogy.
`;
  }

  /**
   * Get region-specific guidelines for LLM
   */
  private getRegionalGuidelines(region: 'IN' | 'US' | 'UK' | 'INTL'): string {
    switch (region) {
      case 'IN':
        return `   - Use INDIAN cultural references naturally based on the topic
   - Can reference: local shops, cricket, daily Indian life, festivals, food, family dynamics
   - Can use Hinglish words if it feels natural
   - Think like explaining to a friend in India`;
      
      case 'US':
        return `   - Use AMERICAN cultural references naturally based on the topic
   - Can reference: sports (baseball, football), daily American life, popular culture
   - Use American English and casual tone
   - Think like explaining to a friend in America`;
      
      case 'UK':
        return `   - Use BRITISH cultural references naturally based on the topic
   - Can reference: football, tea culture, daily British life, queuing culture
   - Use British English spelling and phrases
   - Think like explaining to a friend in Britain`;
      
      case 'INTL':
      default:
        return `   - Use UNIVERSALLY relatable references that work globally
   - Avoid region-specific slang, brands, or cultural references
   - Keep analogies simple and internationally understandable
   - Think like explaining to someone from any country`;
    }
  }

  /**
   * Get complexity-specific guidance
   */
  private getComplexityGuidance(complexity: AnalogyComplexity): string {
    switch (complexity) {
      case 'simple':
        return 'Explain like to a beginner. Use very basic, everyday examples. Keep it short and clear.';
      case 'moderate':
        return 'Balanced explanation for someone with some understanding. Can include slightly technical terms.';
      case 'detailed':
        return 'Comprehensive explanation for advanced users. Can include nuanced comparisons and edge cases.';
    }
  }

  /**
   * Determine cultural context
   */
  // REMOVED - No longer needed, region is passed directly
  // Cultural context is now determined by the region parameter

 

  /**
   * Parse LLM-generated analogy into structured format
   */
  private parseGeneratedAnalogy(
    generatedText: string,
    topic: string,
    context: AnalogyContext,
    region: 'IN' | 'US' | 'UK' | 'INTL' = 'INTL'
  ): GeneratedAnalogy | null {
    // Clean up the generated text
    const analogy = generatedText.trim();
    
    if (!analogy || analogy.length < 20) {
      console.warn('[AnalogyService] ⚠️  Generated analogy too short');
      return null;
    }

    // Determine category based on content and context
    const category = this.detectCategory(analogy, context.preferredCategories || []);
    
    // Determine cultural context from content
    const culturalContext = this.detectCulturalContext(analogy, region);
    
    // Calculate confidence based on analogy quality
    const confidence = this.calculateConfidence(analogy, topic, context);

    return {
      analogy,
      category,
      complexity: context.complexity || 'moderate',
      culturalContext,
      confidence,
    };
  }

  /**
   * Detect category from analogy content
   */
  private detectCategory(analogy: string, preferredCategories: AnalogyCategory[]): AnalogyCategory {
    const text = analogy.toLowerCase();
    
    // Category keywords
    const categoryKeywords: Record<AnalogyCategory, string[]> = {
      technology: ['code', 'program', 'software', 'computer', 'app', 'system', 'data'],
      sports: ['cricket', 'football', 'game', 'player', 'team', 'match', 'score'],
      cooking: ['cook', 'recipe', 'food', 'chai', 'dish', 'ingredient', 'kitchen'],
      nature: ['tree', 'plant', 'grow', 'seed', 'root', 'branch', 'leaf'],
      family: ['family', 'parent', 'child', 'sibling', 'home', 'relative'],
      business: ['business', 'company', 'customer', 'sale', 'product', 'startup'],
      education: ['school', 'teach', 'learn', 'study', 'homework', 'exam'],
      daily_life: ['daily', 'everyday', 'routine', 'life', 'common', 'regular'],
      relationships: ['friend', 'relationship', 'trust', 'promise', 'connect'],
      health: ['health', 'doctor', 'medicine', 'care', 'wellness'],
    };

    // Check preferred categories first
    for (const category of preferredCategories) {
      const keywords = categoryKeywords[category];
      if (keywords.some(kw => text.includes(kw))) {
        return category;
      }
    }

    // Check all categories
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        return category as AnalogyCategory;
      }
    }

    // Default to first preferred or daily_life
    return preferredCategories[0] || 'daily_life';
  }

  /**
   * Detect cultural context from content
   */
  private detectCulturalContext(analogy: string, region: 'IN' | 'US' | 'UK' | 'INTL'): 'indian' | 'universal' {
    // Use region as primary indicator
    if (region === 'IN') return 'indian';
    return 'universal';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    analogy: string,
    topic: string,
    context: AnalogyContext
  ): number {
    let confidence = 0.7; // Base confidence

    // Length check (good analogies are 50-300 chars)
    const length = analogy.length;
    if (length >= 50 && length <= 300) {
      confidence += 0.1;
    } else if (length < 50 || length > 500) {
      confidence -= 0.2;
    }

    // Topic relevance (check if topic keywords appear)
    const topicWords = topic.toLowerCase().split(/\s+/);
    const analogyLower = analogy.toLowerCase();
    const topicMatches = topicWords.filter(word => 
      word.length > 3 && analogyLower.includes(word)
    ).length;
    
    confidence += Math.min(topicMatches * 0.05, 0.15);

    // Ensure confidence is between 0 and 1
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Build cache key
   */
  private buildCacheKey(topic: string, context?: AnalogyContext, region?: string): string {
    const complexity = context?.complexity || 'moderate';
    const categories = (context?.preferredCategories || []).join(',');
    const userRegion = region || 'INTL';
    
    return `${topic.toLowerCase()}-${complexity}-${userRegion}-${categories}`;
  }

  /**
   * Infer default categories if not provided
   */
  private inferDefaultCategories(): AnalogyCategory[] {
    return ['technology', 'daily_life', 'cooking'];
  }

  /**
   * Get all available categories
   */
  public getCategories(): AnalogyCategory[] {
    return [
      'technology',
      'sports',
      'cooking',
      'nature',
      'family',
      'business',
      'education',
      'daily_life',
      'relationships',
      'health'
    ];
  }

  /**
   * Clear cache (for testing or memory management)
   */
  public clearCache(): void {
    this.generationCache.clear();
    console.log('[AnalogyService] 🗑️  Cache cleared');
  }

  /**
   * Get service statistics
   */
  public getStats() {
    return {
      cachedAnalogies: this.generationCache.size,
      availableCategories: this.getCategories().length,
    };
  }
}

export default AnalogyService;