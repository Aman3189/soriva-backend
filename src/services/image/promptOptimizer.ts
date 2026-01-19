// src/services/image/promptOptimizer.ts

/**
 * ==========================================
 * SORIVA PROMPT OPTIMIZER v4.1 (No Deity)
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * 
 * Philosophy: Let Mistral Large handle EVERYTHING
 * - Translation (Hindi/Hinglish/Any language → English)
 * - Enhancement (Adding artistic details)
 * - Cleanup (Proper formatting)
 * - Provider-specific optimization (Klein vs Schnell)
 * 
 * Static mappings = ONLY for fallback when API is down
 * 
 * Last Updated: January 20, 2026
 * 
 * v4.1 Changes (January 20, 2026):
 * - 🚫 REMOVED: All deity/religious image optimization
 * - 🛡️ Deity images blocked at controller level for safety
 * - ✅ Festival cards, greetings, decorations still supported
 * 
 * v4.0 Changes (January 19, 2026):
 * - ✅ ADDED: Dual model support (Klein 9B + Schnell)
 * - ✅ ADDED: Provider-specific prompt optimization
 * - ✅ ADDED: Klein-optimized prompts (better for text/detail)
 * - ✅ ADDED: Schnell-optimized prompts (faster, simpler)
 * - ✅ ADDED: Cost-aware optimization suggestions
 */

import { PromptOptimizationResult, ImageProvider } from '../../types/image.types';

// ==========================================
// MISTRAL API CONFIGURATION
// ==========================================

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_MODEL = 'mistral-large-latest';

// ==========================================
// PROVIDER-SPECIFIC ENHANCEMENT STYLES
// ==========================================

/**
 * Enhancement suffixes based on provider
 * Klein 9B: More detailed, quality-focused
 * Schnell: Simpler, speed-optimized
 */
const PROVIDER_ENHANCEMENTS: Record<ImageProvider, Record<string, string>> = {
  [ImageProvider.KLEIN9B]: {
    default: 'high quality, detailed, professional, 8K resolution, sharp focus',
    text: 'clear typography, readable text, professional design, sharp text rendering',
    logo: 'vector style, clean lines, professional logo design, minimal, scalable',
    festival: 'vibrant colors, festive atmosphere, cultural authenticity, joyful, detailed decorations, Indian traditional patterns',
    realistic: 'photorealistic, 8K resolution, professional photography, natural lighting, detailed',
    banner: 'professional design, clear layout, eye-catching, balanced composition, readable text',
  },
  [ImageProvider.SCHNELL]: {
    default: 'good quality, clear, well-composed',
    text: 'readable text, clean design',
    logo: 'clean design, simple, professional',
    festival: 'colorful, festive, cheerful, traditional decorations',
    realistic: 'realistic, natural lighting, clear',
    banner: 'clear layout, readable, professional',
  },
};

// ==========================================
// PROMPT OPTIMIZER CLASS
// ==========================================

export class PromptOptimizer {
  private static instance: PromptOptimizer;
  private mistralApiKey: string;

  private constructor() {
    this.mistralApiKey = process.env.MISTRAL_API_KEY || '';
    
    if (!this.mistralApiKey) {
      console.warn('[PromptOptimizer] ⚠️ MISTRAL_API_KEY not set - using basic fallback');
    } else {
      console.log('[PromptOptimizer] ✅ Mistral Large AI ready (Dual Model Support)');
    }
  }

  public static getInstance(): PromptOptimizer {
    if (!PromptOptimizer.instance) {
      PromptOptimizer.instance = new PromptOptimizer();
    }
    return PromptOptimizer.instance;
  }

  // ==========================================
  // MAIN OPTIMIZATION METHOD
  // ==========================================

  /**
   * Optimize prompt using Mistral Large AI
   * 100% dynamic - AI handles translation + enhancement
   * 
   * @param originalPrompt - User's original prompt
   * @param targetProvider - Target image provider (Klein or Schnell)
   */
  public async optimize(
    originalPrompt: string,
    targetProvider: ImageProvider = ImageProvider.KLEIN9B
  ): Promise<PromptOptimizationResult> {
    const startTime = Date.now();
    
    // Detect content type for better AI instructions
    const containsText = this.detectTextRequirement(originalPrompt);
    const containsLogo = this.detectLogoRequirement(originalPrompt);
    const isRealistic = this.detectRealisticRequirement(originalPrompt);
    const containsFestival = this.detectFestivalRequirement(originalPrompt);

    let optimizedPrompt: string;
    let enhancements: string[] = [];
    let detectedLanguage: 'hindi' | 'hinglish' | 'english' | 'other' = 'english';

    // Try Mistral Large first
    if (this.mistralApiKey) {
      try {
        const result = await this.optimizeWithMistral(originalPrompt, {
          containsText,
          containsLogo,
          isRealistic,
          containsFestival,
          targetProvider,
        });
        
        optimizedPrompt = result.prompt;
        detectedLanguage = result.detectedLanguage;
        enhancements.push(`✨ AI-enhanced with Mistral Large`);
        enhancements.push(`🎯 Optimized for ${targetProvider === ImageProvider.KLEIN9B ? 'Klein 9B' : 'Schnell'}`);
        enhancements.push(`⏱️ ${Date.now() - startTime}ms`);
        
        console.log(`[PromptOptimizer] ✅ AI optimized for ${targetProvider}: "${originalPrompt.substring(0, 30)}..." → "${optimizedPrompt.substring(0, 50)}..."`);
        
      } catch (error) {
        console.error('[PromptOptimizer] ❌ Mistral API failed, using fallback:', error);
        optimizedPrompt = this.fallbackOptimize(originalPrompt, targetProvider, {
          containsText, containsLogo, isRealistic, containsFestival
        });
        detectedLanguage = this.detectLanguage(originalPrompt);
        enhancements.push('⚠️ Fallback: Basic optimization');
      }
    } else {
      // No API key - use fallback
      optimizedPrompt = this.fallbackOptimize(originalPrompt, targetProvider, {
        containsText, containsLogo, isRealistic, containsFestival
      });
      detectedLanguage = this.detectLanguage(originalPrompt);
      enhancements.push('⚠️ No API key: Basic optimization');
    }

    return {
      originalPrompt,
      optimizedPrompt,
      detectedLanguage,
      enhancements,
      containsText,
      containsLogo,
      isRealistic,
      // ✅ NEW: Provider info
      targetProvider,
      providerOptimized: true,
    };
  }

  // ==========================================
  // MISTRAL LARGE - THE BRAIN 🧠
  // ==========================================

  /**
   * Let Mistral Large handle EVERYTHING
   * - Language detection
   * - Translation
   * - Enhancement
   * - Provider-specific formatting
   */
  private async optimizeWithMistral(
    userPrompt: string,
    options: { 
      containsText: boolean; 
      containsLogo: boolean; 
      isRealistic: boolean;
      containsFestival: boolean;
      targetProvider: ImageProvider;
    }
  ): Promise<{ prompt: string; detectedLanguage: 'hindi' | 'hinglish' | 'english' | 'other' }> {
    
    const systemPrompt = this.buildMistralSystemPrompt(options);

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.mistralApiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error('Empty response from Mistral');
    }

    // Parse AI response (format: LANG: language | PROMPT: enhanced prompt)
    return this.parseMistralResponse(aiResponse, userPrompt);
  }

  /**
   * Build the master system prompt for Mistral
   * ✅ UPDATED: Provider-specific instructions
   */
  private buildMistralSystemPrompt(options: { 
    containsText: boolean; 
    containsLogo: boolean; 
    isRealistic: boolean;
    containsFestival: boolean;
    targetProvider: ImageProvider;
  }): string {
    const isKlein = options.targetProvider === ImageProvider.KLEIN9B;
    const providerName = isKlein ? 'Klein 9B (Premium)' : 'Schnell (Fast)';
    
    let prompt = `You are Soriva's AI image prompt engineer. Your job is to transform ANY user input into a perfect English prompt for ${providerName} AI image generation.

TARGET MODEL: ${providerName}
${isKlein 
  ? '- Klein 9B is a PREMIUM model - create detailed, quality-focused prompts'
  : '- Schnell is a FAST model - create concise, efficient prompts (keep under 50 words)'}

INPUT: User will send a prompt in ANY language (Hindi, Hinglish, English, mixed, or any other)

YOUR TASKS:
1. DETECT the input language
2. UNDERSTAND the intent (what image they want)
3. TRANSLATE to English (if not already)
4. ENHANCE with artistic details ${isKlein ? '(detailed)' : '(concise)'}
5. OUTPUT in a specific format

OUTPUT FORMAT (follow exactly):
LANG: [hindi/hinglish/english/other]
PROMPT: [your enhanced English prompt here]

RULES:
- PROMPT must be in English only
- ${isKlein ? 'PROMPT should be 40-70 words, descriptive and detailed' : 'PROMPT should be 25-45 words, concise but clear'}
- PROMPT should describe the scene directly (not "Create a..." or "Generate...")
- ${isKlein ? 'Add rich artistic qualities: lighting, mood, composition, style, details' : 'Add essential qualities: lighting, mood, style'}
- Keep the user's core intent intact
- Make it vivid for best image generation`;

    // Add content-specific instructions
    if (options.containsFestival) {
      prompt += `

SPECIAL: This is a FESTIVAL/OCCASION image
- Focus on: festive atmosphere, cultural elements, joy, decorations
- Add: "vibrant colors, festive atmosphere, ${isKlein ? 'cultural authenticity, detailed decorations, joyful celebration, Indian traditional patterns, beautiful rangoli, diyas, flowers' : 'colorful, cheerful, celebratory, traditional decorations'}"
- Create greeting cards, posters, decorative elements - NOT deity figures`;
    } else if (options.containsLogo) {
      prompt += `

SPECIAL: This is a LOGO request
- Focus on: clean, minimalist, professional design
- Add: "${isKlein ? 'vector style, clean lines, professional logo design, minimal, scalable, sharp edges' : 'clean design, simple, professional, minimal'}"
- Avoid: realistic textures, photographs`;
    } else if (options.containsText) {
      prompt += `

SPECIAL: This image needs TEXT/TYPOGRAPHY
- Focus on: clear, readable text
- Add: "${isKlein ? 'clear typography, readable text, professional design, sharp text rendering' : 'readable text, clean design'}"
- Ensure text elements are prominent`;
    } else if (options.isRealistic) {
      prompt += `

SPECIAL: This should be PHOTOREALISTIC
- Focus on: realistic details, natural lighting
- Add: "${isKlein ? 'photorealistic, 8K resolution, professional photography, natural lighting, highly detailed, sharp focus' : 'realistic, natural lighting, clear, detailed'}"`;
    } else {
      prompt += `

DEFAULT ENHANCEMENT:
- Add: "${isKlein ? 'high quality, detailed, professional, beautiful lighting, 8K' : 'good quality, clear, well-composed'}"
- Make it visually appealing`;
    }

    prompt += `

EXAMPLES:

Input: "ek sundar ladki beach par"
Output (${isKlein ? 'Klein' : 'Schnell'}):
LANG: hinglish
PROMPT: ${isKlein 
  ? 'Beautiful young woman standing on a pristine tropical beach, golden hour sunlight casting warm glow, gentle waves in background, wind flowing through hair, cinematic composition, high quality, detailed, professional photography' 
  : 'Beautiful woman on tropical beach, golden hour lighting, waves in background, wind in hair, high quality'}

Input: "diwali greeting card with happy diwali text"
Output (${isKlein ? 'Klein' : 'Schnell'}):
LANG: hinglish
PROMPT: ${isKlein
  ? 'Festive Diwali greeting card design, "Happy Diwali" text in elegant typography, glowing diyas and oil lamps, beautiful rangoli patterns, golden sparkles, vibrant colors, traditional Indian motifs, professional design, clear text'
  : 'Diwali greeting card, "Happy Diwali" text, glowing diyas, rangoli, festive colors, professional design'}

Input: "holi celebration poster"
Output (${isKlein ? 'Klein' : 'Schnell'}):
LANG: english
PROMPT: ${isKlein
  ? 'Vibrant Holi festival celebration poster, colorful powder clouds in air, festive atmosphere, water splashes, people silhouettes celebrating, "Happy Holi" typography, bright pinks purples yellows greens, joyful energy, professional design'
  : 'Holi festival poster, colorful powder clouds, festive celebration, bright colors, Happy Holi text, cheerful design'}

Now process the user's input for ${providerName}:`;

    return prompt;
  }

  /**
   * Parse Mistral's response into structured data
   */
  private parseMistralResponse(
    aiResponse: string, 
    originalPrompt: string
  ): { prompt: string; detectedLanguage: 'hindi' | 'hinglish' | 'english' | 'other' } {
    
    // Try to parse structured format
    const langMatch = aiResponse.match(/LANG:\s*(hindi|hinglish|english|other)/i);
    const promptMatch = aiResponse.match(/PROMPT:\s*(.+?)(?:\n|$)/is);

    let detectedLanguage: 'hindi' | 'hinglish' | 'english' | 'other' = 'english';
    let enhancedPrompt: string;

    if (langMatch) {
      detectedLanguage = langMatch[1].toLowerCase() as any;
    }

    if (promptMatch && promptMatch[1]) {
      enhancedPrompt = promptMatch[1].trim();
    } else {
      // If format not followed, use the whole response
      enhancedPrompt = aiResponse
        .replace(/LANG:.*\n?/i, '')
        .replace(/PROMPT:\s*/i, '')
        .trim();
    }

    // Final cleanup
    enhancedPrompt = this.cleanEnhancedPrompt(enhancedPrompt);

    // Validate - if result is too short or seems wrong, fallback
    if (enhancedPrompt.length < 10) {
      console.warn('[PromptOptimizer] AI response too short, using fallback');
      enhancedPrompt = this.fallbackOptimize(originalPrompt, ImageProvider.KLEIN9B, {});
    }

    return { prompt: enhancedPrompt, detectedLanguage };
  }

  /**
   * Clean up the enhanced prompt
   */
  private cleanEnhancedPrompt(prompt: string): string {
    return prompt
      // Remove quotes
      .replace(/^["']|["']$/g, '')
      // Remove common prefixes AI might add
      .replace(/^(here'?s?|here is|sure|okay|of course)[,:\s]*/i, '')
      .replace(/^(create|generate|make|produce)[:\s]*(a|an|the)?\s*/i, '')
      .replace(/^(image of|picture of|photo of)[:\s]*/i, '')
      // Clean whitespace
      .replace(/\s+/g, ' ')
      .trim()
      // Capitalize first letter
      .replace(/^./, c => c.toUpperCase());
  }

  // ==========================================
  // FALLBACK - When API is unavailable
  // ==========================================

  /**
   * Basic fallback optimization (no AI)
   * Used only when Mistral API is unavailable
   * ✅ UPDATED: Provider-specific enhancements (NO deity support)
   */
  private fallbackOptimize(
    originalPrompt: string, 
    targetProvider: ImageProvider = ImageProvider.KLEIN9B,
    contentFlags: {
      containsText?: boolean;
      containsLogo?: boolean;
      isRealistic?: boolean;
      containsFestival?: boolean;
    }
  ): string {
    let prompt = originalPrompt;

    // Basic Hinglish word replacements (minimal, common words only)
    const basicMappings: Record<string, string> = {
      'ek': 'a', 'aur': 'and', 'sundar': 'beautiful', 'khubsurat': 'beautiful',
      'ladki': 'girl', 'ladka': 'boy', 'aadmi': 'man', 'aurat': 'woman',
      'beach': 'beach', 'pahad': 'mountain', 'jungle': 'forest', 'ghar': 'house',
      'aasman': 'sky', 'samundar': 'ocean', 'suraj': 'sun', 'chand': 'moon',
      'banao': '', 'bana': '', 'dikhao': '', 'do': '', 'karo': '', 'chahiye': '',
    };

    // Apply basic mappings
    for (const [hindi, english] of Object.entries(basicMappings)) {
      const regex = new RegExp(`\\b${hindi}\\b`, 'gi');
      prompt = prompt.replace(regex, english);
    }

    // Clean up
    prompt = prompt
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, c => c.toUpperCase());

    // ✅ Add provider-specific enhancements (NO deity)
    const enhancements = PROVIDER_ENHANCEMENTS[targetProvider];
    let suffix = enhancements.default;

    if (contentFlags.containsFestival) {
      suffix = enhancements.festival;
    } else if (contentFlags.containsLogo) {
      suffix = enhancements.logo;
    } else if (contentFlags.containsText) {
      suffix = enhancements.text;
    } else if (contentFlags.isRealistic) {
      suffix = enhancements.realistic;
    }

    // Add suffix if prompt is not too long
    if (prompt.split(' ').length < 15) {
      prompt += `, ${suffix}`;
    }

    return prompt;
  }

  // ==========================================
  // CONTENT DETECTION (for AI instructions)
  // ==========================================

  private detectTextRequirement(text: string): boolean {
    const keywords = ['text', 'likhna', 'likho', 'typography', 'quote', 'naam', 'name', 'written', 'लिखना', 'लिखो', 'नाम'];
    const lower = text.toLowerCase();
    if (/"[^"]+"|'[^']+'/.test(text)) return true;
    return keywords.some(k => lower.includes(k));
  }

  private detectLogoRequirement(text: string): boolean {
    const keywords = ['logo', 'brand', 'emblem', 'icon', 'symbol', 'monogram', 'लोगो', 'ब्रांड'];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  private detectRealisticRequirement(text: string): boolean {
    const keywords = ['realistic', 'photorealistic', 'real', 'photograph', 'photography', '8k', '4k', 'hd', 'dslr'];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  /**
   * ✅ Detect festival/occasion content (cards, greetings, decorations)
   */
  private detectFestivalRequirement(text: string): boolean {
    const keywords = [
      'diwali', 'holi', 'navratri', 'durga puja', 'ganesh chaturthi',
      'raksha bandhan', 'rakhi', 'bhai dooj', 'karwa chauth', 'eid',
      'christmas', 'new year', 'birthday', 'anniversary', 'wedding',
      'दीवाली', 'होली', 'नवरात्रि', 'दशहरा', 'रक्षाबंधन',
      'festival', 'celebration', 'tyohar', 'त्योहार',
    ];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  /**
   * Basic language detection (for fallback mode)
   */
  private detectLanguage(text: string): 'hindi' | 'hinglish' | 'english' | 'other' {
    const hindiPattern = /[\u0900-\u097F]/;
    if (hindiPattern.test(text)) {
      return /[a-zA-Z]/.test(text) ? 'hinglish' : 'hindi';
    }
    
    const hinglishWords = ['ek', 'aur', 'ka', 'ki', 'ke', 'hai', 'mein', 'par', 'se', 'ko', 'banao', 'karo', 'chahiye'];
    const words = text.toLowerCase().split(/\s+/);
    const hinglishCount = words.filter(w => hinglishWords.includes(w)).length;
    
    if (hinglishCount >= 2 || hinglishCount / words.length > 0.2) {
      return 'hinglish';
    }
    
    return 'english';
  }

  // ==========================================
  // BACKWARD COMPATIBILITY
  // ==========================================

  /**
   * Sync version for backward compatibility
   * Uses fallback only (no AI)
   */
  public optimizeSync(
    originalPrompt: string,
    targetProvider: ImageProvider = ImageProvider.KLEIN9B
  ): PromptOptimizationResult {
    const containsText = this.detectTextRequirement(originalPrompt);
    const containsLogo = this.detectLogoRequirement(originalPrompt);
    const isRealistic = this.detectRealisticRequirement(originalPrompt);
    const containsFestival = this.detectFestivalRequirement(originalPrompt);

    const optimizedPrompt = this.fallbackOptimize(originalPrompt, targetProvider, {
      containsText, containsLogo, isRealistic, containsFestival
    });
    
    return {
      originalPrompt,
      optimizedPrompt,
      detectedLanguage: this.detectLanguage(originalPrompt),
      enhancements: [`Basic optimization (sync mode) for ${targetProvider}`],
      containsText,
      containsLogo,
      isRealistic,
      targetProvider,
      providerOptimized: true,
    };
  }
}

// ==========================================
// EXPORTS
// ==========================================

export const promptOptimizer = PromptOptimizer.getInstance();

/**
 * Async optimize - Uses Mistral Large AI (recommended)
 * @param originalPrompt - User's prompt
 * @param targetProvider - Target provider (Klein or Schnell)
 */
export async function optimizePrompt(
  originalPrompt: string,
  targetProvider: ImageProvider = ImageProvider.KLEIN9B
): Promise<PromptOptimizationResult> {
  return promptOptimizer.optimize(originalPrompt, targetProvider);
}

/**
 * Sync optimize - Fallback only, no AI
 * @param originalPrompt - User's prompt  
 * @param targetProvider - Target provider (Klein or Schnell)
 */
export function optimizePromptSync(
  originalPrompt: string,
  targetProvider: ImageProvider = ImageProvider.KLEIN9B
): PromptOptimizationResult {
  return promptOptimizer.optimizeSync(originalPrompt, targetProvider);
}

/**
 * ✅ NEW: Quick optimize for Schnell (simpler prompts)
 */
export async function optimizeForSchnell(originalPrompt: string): Promise<PromptOptimizationResult> {
  return promptOptimizer.optimize(originalPrompt, ImageProvider.SCHNELL);
}

/**
 * ✅ NEW: Quick optimize for Klein (detailed prompts)
 */
export async function optimizeForKlein(originalPrompt: string): Promise<PromptOptimizationResult> {
  return promptOptimizer.optimize(originalPrompt, ImageProvider.KLEIN9B);
}