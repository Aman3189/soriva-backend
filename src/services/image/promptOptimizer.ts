// src/services/image/promptOptimizer.ts

/**
 * ==========================================
 * SORIVA PROMPT OPTIMIZER v3.0 (100% Dynamic)
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * 
 * Philosophy: Let Mistral Large handle EVERYTHING
 * - Translation (Hindi/Hinglish/Any language → English)
 * - Enhancement (Adding artistic details)
 * - Cleanup (Proper formatting)
 * 
 * Static mappings = ONLY for fallback when API is down
 * 
 * Last Updated: January 17, 2026
 */

import { PromptOptimizationResult } from '../../types/image.types';

// ==========================================
// MISTRAL API CONFIGURATION
// ==========================================

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_MODEL = 'mistral-large-latest';

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
      console.log('[PromptOptimizer] ✅ Mistral Large AI ready');
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
   */
  public async optimize(originalPrompt: string): Promise<PromptOptimizationResult> {
    const startTime = Date.now();
    
    // Detect content type for better AI instructions
    const containsText = this.detectTextRequirement(originalPrompt);
    const containsLogo = this.detectLogoRequirement(originalPrompt);
    const isRealistic = this.detectRealisticRequirement(originalPrompt);

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
        });
        
        optimizedPrompt = result.prompt;
        detectedLanguage = result.detectedLanguage;
        enhancements.push('✨ AI-enhanced with Mistral Large');
        enhancements.push(`⏱️ ${Date.now() - startTime}ms`);
        
        console.log(`[PromptOptimizer] ✅ AI optimized: "${originalPrompt.substring(0, 30)}..." → "${optimizedPrompt.substring(0, 50)}..."`);
        
      } catch (error) {
        console.error('[PromptOptimizer] ❌ Mistral API failed, using fallback:', error);
        optimizedPrompt = this.fallbackOptimize(originalPrompt);
        detectedLanguage = this.detectLanguage(originalPrompt);
        enhancements.push('⚠️ Fallback: Basic optimization');
      }
    } else {
      // No API key - use fallback
      optimizedPrompt = this.fallbackOptimize(originalPrompt);
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
   * - Formatting
   */
  private async optimizeWithMistral(
    userPrompt: string,
    options: { containsText: boolean; containsLogo: boolean; isRealistic: boolean }
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
   */
  private buildMistralSystemPrompt(options: { containsText: boolean; containsLogo: boolean; isRealistic: boolean }): string {
    let prompt = `You are Soriva's AI image prompt engineer. Your job is to transform ANY user input into a perfect English prompt for AI image generation.

INPUT: User will send a prompt in ANY language (Hindi, Hinglish, English, mixed, or any other)

YOUR TASKS:
1. DETECT the input language
2. UNDERSTAND the intent (what image they want)
3. TRANSLATE to English (if not already)
4. ENHANCE with artistic details (lighting, composition, style, mood)
5. OUTPUT in a specific format

OUTPUT FORMAT (follow exactly):
LANG: [hindi/hinglish/english/other]
PROMPT: [your enhanced English prompt here]

RULES:
- PROMPT must be in English only
- PROMPT should be 30-60 words, descriptive but concise
- PROMPT should describe the scene directly (not "Create a..." or "Generate...")
- Add artistic qualities: lighting, mood, composition, style
- Keep the user's core intent intact
- Make it vivid and detailed for best image generation`;

    // Add content-specific instructions
    if (options.containsLogo) {
      prompt += `

SPECIAL: This is a LOGO request
- Focus on: clean, minimalist, professional design
- Add: "vector style, clean lines, professional logo design, minimal"
- Avoid: realistic textures, photographs`;
    } else if (options.containsText) {
      prompt += `

SPECIAL: This image needs TEXT/TYPOGRAPHY
- Focus on: clear, readable text
- Add: "clear typography, readable text, professional design"
- Ensure text elements are prominent`;
    } else if (options.isRealistic) {
      prompt += `

SPECIAL: This should be PHOTOREALISTIC
- Focus on: realistic details, natural lighting
- Add: "photorealistic, 8K resolution, professional photography, natural lighting, detailed"`;
    } else {
      prompt += `

DEFAULT ENHANCEMENT:
- Add: "high quality, detailed, professional, beautiful lighting"
- Make it visually appealing`;
    }

    prompt += `

EXAMPLES:

Input: "ek sundar ladki beach par"
Output:
LANG: hinglish
PROMPT: Beautiful young woman standing on a pristine tropical beach, golden hour sunlight casting warm glow, gentle waves in background, wind flowing through hair, cinematic composition, high quality, detailed

Input: "मुझे एक शेर जंगल में चाहिए"
Output:
LANG: hindi
PROMPT: Majestic lion standing proudly in dense jungle, dappled sunlight filtering through trees, powerful stance, lush green foliage, wildlife photography style, 8K, detailed fur texture

Input: "cute cat sleeping"
Output:
LANG: english
PROMPT: Adorable fluffy cat peacefully sleeping on soft blanket, warm cozy lighting, shallow depth of field, whiskers visible, serene expression, professional pet photography, high quality

Now process the user's input:`;

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
      enhancedPrompt = this.fallbackOptimize(originalPrompt);
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
   */
  private fallbackOptimize(originalPrompt: string): string {
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

    // Add basic quality terms if prompt is very short
    if (prompt.split(' ').length < 5) {
      prompt += ', high quality, detailed';
    }

    return prompt;
  }

  // ==========================================
  // CONTENT DETECTION (for AI instructions)
  // ==========================================

  private detectTextRequirement(text: string): boolean {
    const keywords = ['text', 'likhna', 'likho', 'typography', 'quote', 'naam', 'name', 'written'];
    const lower = text.toLowerCase();
    if (/"[^"]+"|'[^']+'/.test(text)) return true;
    return keywords.some(k => lower.includes(k));
  }

  private detectLogoRequirement(text: string): boolean {
    const keywords = ['logo', 'brand', 'emblem', 'icon', 'symbol', 'monogram'];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  private detectRealisticRequirement(text: string): boolean {
    const keywords = ['realistic', 'photorealistic', 'real', 'photograph', 'photography', '8k', '4k', 'hd', 'dslr'];
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
  public optimizeSync(originalPrompt: string): PromptOptimizationResult {
    const optimizedPrompt = this.fallbackOptimize(originalPrompt);
    
    return {
      originalPrompt,
      optimizedPrompt,
      detectedLanguage: this.detectLanguage(originalPrompt),
      enhancements: ['Basic optimization (sync mode)'],
      containsText: this.detectTextRequirement(originalPrompt),
      containsLogo: this.detectLogoRequirement(originalPrompt),
      isRealistic: this.detectRealisticRequirement(originalPrompt),
    };
  }
}

// ==========================================
// EXPORTS
// ==========================================

export const promptOptimizer = PromptOptimizer.getInstance();

/**
 * Async optimize - Uses Mistral Large AI (recommended)
 */
export async function optimizePrompt(originalPrompt: string): Promise<PromptOptimizationResult> {
  return promptOptimizer.optimize(originalPrompt);
}

/**
 * Sync optimize - Fallback only, no AI
 */
export function optimizePromptSync(originalPrompt: string): PromptOptimizationResult {
  return promptOptimizer.optimizeSync(originalPrompt);
}