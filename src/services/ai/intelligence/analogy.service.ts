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

const EXAMPLE_ANALOGIES = {
  technology_indian: [
    'A database is like the register at your local kirana store where they write down who bought what and how much udhar they have.',
    'Caching is like keeping chai masala on your kitchen counter instead of in the storeroom for quick access.',
    'Async programming is like ordering multiple dishes at a dhaba - you order everything at once and they bring items as ready.',
  ],
  technology_universal: [
    'An API is like a waiter at a restaurant who takes your order to the kitchen and brings back your food.',
    'Encryption is like speaking in a secret code that only you and your friend understand.',
  ],
  sports_indian: [
    'Git branches are like trying different batting strategies in cricket - create a branch to try T20 style, merge if it works.',
    'A load balancer is like a cricket captain distributing overs to bowlers based on who\'s fresh.',
  ],
  cooking_indian: [
    'A function is like a recipe for making chai - inputs (water, milk, tea), process (boil, mix), output (chai).',
    'Inheritance is like base curry recipes - you have basic tadka, then make paneer curry, chicken curry by adding specific ingredients.',
  ],
  daily_life_indian: [
    'A queue works like a line at a railway ticket counter - first person in line gets served first (FIFO).',
    'A stack is like a stack of rotis - last roti on top is first one you eat (LIFO).',
  ],
};

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
    context?: AnalogyContext
  ): Promise<GeneratedAnalogy | null> {
    console.log(`[AnalogyService] 🎨 Generating dynamic analogy for: "${topic}"`);

    // Check cache first
    const cacheKey = this.buildCacheKey(topic, context);
    if (this.generationCache.has(cacheKey)) {
      console.log('[AnalogyService] ⚡ Returning cached analogy');
      return this.generationCache.get(cacheKey)!;
    }

    // Build context
    const fullContext = this.buildFullContext(context);

    // Generate analogy via LLM
    const prompt = this.buildAnalogyPrompt(topic, fullContext);
    
    try {
      const generatedText = await this.llmService.generateCompletion(prompt, fullContext);
      
      // Parse the generated analogy
      const analogy = this.parseGeneratedAnalogy(generatedText, topic, fullContext);
      
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
  private buildAnalogyPrompt(topic: string, context: AnalogyContext): string {
    const culturalContext = this.determineCulturalContext(context);
    const exampleCategory = context.preferredCategories?.[0] || 'technology';
    const examples = this.getRelevantExamples(exampleCategory, culturalContext);

    return `
You are an expert at creating relatable analogies to explain complex concepts. Generate a clear, engaging analogy to explain the following topic.

Topic to explain: ${topic}

Context:
- User's age: ${context.userAge || 'not specified'}
- User's background: ${context.userBackground || 'general'}
- Complexity level: ${context.complexity || 'moderate'} (simple = basic explanation, moderate = balanced, detailed = comprehensive)
- Cultural preference: ${culturalContext}
- Preferred categories: ${context.preferredCategories?.join(', ') || 'general'}

Guidelines:
${culturalContext === 'indian' ? `
- Use Indian cultural references (cricket, chai, desi food, Bollywood, family dynamics, daily Indian life)
- Use relatable situations from Indian context (kirana stores, dhabas, railway stations, etc.)
- Can include Hinglish words if natural (udhar, tadka, masala, etc.)
` : `
- Use universal references that work across cultures
- Keep analogies simple and widely relatable
- Avoid region-specific references
`}

- Match the complexity level: ${this.getComplexityGuidance(context.complexity || 'moderate')}
- Make it conversational and easy to understand
- Focus on the core concept, not implementation details
- Use concrete, everyday examples
- Keep it to 2-3 sentences maximum

Example analogies in similar style:
${examples.map(ex => `- ${ex}`).join('\n')}

Generate ONLY the analogy text (no explanations, no meta-commentary, no "Here's an analogy:" prefix).
Start directly with the analogy.
`;
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
  private determineCulturalContext(context: AnalogyContext): 'indian' | 'universal' {
    const pref = context.culturalPreference || 'auto';
    if (pref === 'indian') return 'indian';
    if (pref === 'universal') return 'universal';
    
    // Auto detection based on background
    const background = context.userBackground?.toLowerCase() || '';
    if (background.includes('india') || background.includes('indian') || 
        background.includes('desi') || background.includes('south asia')) {
      return 'indian';
    }
    
    return 'universal';
  }

  /**
   * Get relevant example analogies for prompt
   */
  private getRelevantExamples(category: AnalogyCategory, cultural: 'indian' | 'universal'): string[] {
    const key = `${category}_${cultural}` as keyof typeof EXAMPLE_ANALOGIES;
    const examples = EXAMPLE_ANALOGIES[key];
    
    if (examples && examples.length > 0) {
      // Return 2-3 random examples
      const shuffled = [...examples].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    }
    
    // Fallback to technology examples
    return cultural === 'indian' 
      ? EXAMPLE_ANALOGIES.technology_indian.slice(0, 2)
      : EXAMPLE_ANALOGIES.technology_universal.slice(0, 2);
  }

  /**
   * Parse LLM-generated analogy into structured format
   */
  private parseGeneratedAnalogy(
    generatedText: string,
    topic: string,
    context: AnalogyContext
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
    const culturalContext = this.detectCulturalContext(analogy);
    
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
  private detectCulturalContext(analogy: string): 'indian' | 'universal' {
    const text = analogy.toLowerCase();
    
    const indianKeywords = [
      'cricket', 'chai', 'kirana', 'dhaba', 'bollywood', 'roti', 'daal',
      'masala', 'tadka', 'railway', 'udhar', 'paneer', 'biryani',
      'desi', 'india', 'indian'
    ];

    const hasIndianContext = indianKeywords.some(kw => text.includes(kw));
    return hasIndianContext ? 'indian' : 'universal';
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
  private buildCacheKey(topic: string, context?: AnalogyContext): string {
    const complexity = context?.complexity || 'moderate';
    const cultural = context?.culturalPreference || 'auto';
    const categories = (context?.preferredCategories || []).join(',');
    
    return `${topic.toLowerCase()}-${complexity}-${cultural}-${categories}`;
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
      exampleTemplates: Object.keys(EXAMPLE_ANALOGIES).length,
    };
  }
}

export default AnalogyService;