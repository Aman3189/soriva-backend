// src/services/image/promptOptimizer.ts

/**
 * ==========================================
 * SORIVA PROMPT OPTIMIZER v12.0 (2-MODEL SYSTEM)
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * 
 * 🎯 PHILOSOPHY: TRANSLATE ONLY, DON'T ENHANCE!
 * 
 * Why? Image models (Schnell, GPT Image) are SMART.
 * They understand context better than we can enhance.
 * Over-optimization CONFUSES them and ruins output.
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
 *    - Schnell (Fal.ai): ₹0.25/image - Default for general images
 *    - GPT LOW (OpenAI): ₹1.18/image - Text, Ads, Festivals, Transforms
 * 
 * ✅ CHANGES:
 *    - Default provider changed to SCHNELL
 *    - Removed legacy exports (optimizeForNanoBanana, optimizeForFluxKontext, optimizeForKlein)
 *    - Added optimizeForGptLow export
 *    - Updated all references to new 2-model system
 * 
 * ==========================================
 * v6.0 (February 2026): [SUPERSEDED]
 * ==========================================
 * - Translation only mode (no artistic enhancements)
 * - Clean, accurate translation with Mistral
 * - Removed camera terms, style suggestions
 * 
 * PROOF: Same prompt on fal.ai directly = PERFECT
 *        Same prompt via Mistral enhancement = RUINED
 * 
 * Last Updated: February 22, 2026
 */

import { PromptOptimizationResult, ImageProvider } from '../../types/image.types';

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
      console.log('[PromptOptimizer] ✅ v12.0 Ready (2-Model System: Schnell + GPT LOW)');
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
   * Optimize prompt for image generation
   * v12.0: Default provider is now SCHNELL
   * 
   * @param originalPrompt - User's original prompt
   * @param targetProvider - Target provider (SCHNELL or GPT_LOW)
   * @returns Optimized prompt result
   */
  public async optimize(
    originalPrompt: string,
    targetProvider: ImageProvider = ImageProvider.SCHNELL
  ): Promise<PromptOptimizationResult> {
    const startTime = Date.now();
    
    // Detect language
    const detectedLanguage = this.detectLanguage(originalPrompt);
    
    let translatedPrompt: string;
    let enhancements: string[] = [];

    // If already English, minimal cleanup only
    if (detectedLanguage === 'english') {
      translatedPrompt = this.cleanupPrompt(originalPrompt);
      enhancements.push('✅ English detected - minimal cleanup only');
      console.log(`[PromptOptimizer] ✅ English prompt, cleanup only`);
    }
    // Non-English: Translate with Mistral
    else if (this.mistralApiKey) {
      try {
        translatedPrompt = await this.translateWithMistral(originalPrompt, detectedLanguage);
        enhancements.push(`🔄 Translated from ${detectedLanguage}`);
        enhancements.push(`⏱️ ${Date.now() - startTime}ms`);
        console.log(`[PromptOptimizer] ✅ Translated: "${originalPrompt.substring(0, 30)}..." → "${translatedPrompt.substring(0, 50)}..."`);
      } catch (error) {
        console.error('[PromptOptimizer] ❌ Translation failed, using fallback:', error);
        translatedPrompt = this.fallbackTranslate(originalPrompt);
        enhancements.push('⚠️ Fallback translation used');
      }
    } else {
      // No API key - use basic fallback
      translatedPrompt = this.fallbackTranslate(originalPrompt);
      enhancements.push('⚠️ No API key - basic translation');
    }

    // Detect content types
    const contentAnalysis = this.analyzeContent(originalPrompt);

    return {
      originalPrompt,
      optimizedPrompt: translatedPrompt,
      detectedLanguage,
      enhancements,
      containsText: contentAnalysis.containsText,
      containsLogo: contentAnalysis.containsLogo,
      isRealistic: contentAnalysis.isRealistic,
      isReligious: contentAnalysis.isReligious,
      isFestival: contentAnalysis.isFestival,
      isAdvertisement: contentAnalysis.isAdvertisement,
      isTransformation: contentAnalysis.isTransformation,
      isDocument: contentAnalysis.isDocument,
      isCard: contentAnalysis.isCard,
      targetProvider,
      providerOptimized: false, // We don't optimize anymore, just translate!
    };
  }

  // ==========================================
  // 🔄 MISTRAL TRANSLATOR (NO ENHANCEMENT!)
  // ==========================================

  private async translateWithMistral(
    userPrompt: string,
    detectedLanguage: string
  ): Promise<string> {
    
    const systemPrompt = `You are a TRANSLATOR for image generation prompts. Your ONLY job is to translate the user's input to clear English.

CRITICAL RULES:
1. TRANSLATE ONLY - Do NOT add any artistic details, styles, or enhancements
2. Keep the EXACT meaning and intent of the original prompt
3. Do NOT add: camera terms, lighting descriptions, art styles, quality words
4. Do NOT add: "8K", "detailed", "professional", "beautiful", "stunning", etc.
5. Do NOT add: "photorealistic", "cinematic", "dramatic", etc.
6. PRESERVE religious/cultural terms accurately (deity names, festivals, etc.)
7. Remove filler words: "banao", "banana hai", "chahiye", "please make", etc.

INPUT LANGUAGE: ${detectedLanguage}

OUTPUT FORMAT:
IF deity/religious → "traditional art style"
IF human/portrait → "photorealistic, real photograph"  
IF cartoon/anime mentioned → keep that style
IF logo/card/poster → "professional design"
ELSE → "photorealistic"`;

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
        max_tokens: 150, // Short - just translation
        temperature: 0.3, // Low temp for accurate translation
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    
    let translated = data.choices?.[0]?.message?.content?.trim();

    if (!translated) {
      throw new Error('Empty response from Mistral');
    }

    // Clean up any unwanted additions
    translated = this.cleanupTranslation(translated);

    return translated;
  }

  // ==========================================
  // CLEANUP METHODS
  // ==========================================

  /**
   * Clean up English prompt (minimal changes)
   */
  private cleanupPrompt(prompt: string): string {
    return prompt
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim()
      // Capitalize first letter
      .replace(/^./, c => c.toUpperCase())
      // Remove common filler phrases
      .replace(/^(please |can you |i want |i need |make me |create |generate )/i, '')
      .replace(/(please|thanks|thank you)\.?$/i, '')
      .trim();
  }

  /**
   * Clean up Mistral's translation output
   */
  private cleanupTranslation(translated: string): string {
    return translated
      // Remove quotes if Mistral added them
      .replace(/^["']|["']$/g, '')
      // Remove "Output:" prefix if present
      .replace(/^output:\s*/i, '')
      // Remove explanation prefixes
      .replace(/^(here'?s?|the translation is|translated:?)\s*/i, '')
      // Remove trailing explanations
      .replace(/\s*\(.*\)\s*$/, '')
      // Clean whitespace
      .replace(/\s+/g, ' ')
      .trim()
      // Capitalize
      .replace(/^./, c => c.toUpperCase());
  }

  // ==========================================
  // FALLBACK TRANSLATION (No API)
  // ==========================================

  private fallbackTranslate(originalPrompt: string): string {
    let prompt = originalPrompt;

    // Basic Hinglish → English word mappings
    const translations: Record<string, string> = {
      // Common words
      'ek': 'a', 'aur': 'and', 'ka': 'of', 'ki': 'of', 'ke': 'of',
      'mein': 'in', 'par': 'on', 'se': 'from', 'ko': 'to',
      'hai': '', 'hain': '', 'tha': '', 'thi': '', 'the': '',
      
      // People
      'ladki': 'girl', 'ladka': 'boy', 'aadmi': 'man', 'aurat': 'woman',
      'baccha': 'child', 'bachchi': 'child', 'log': 'people',
      
      // Nature
      'pahad': 'mountain', 'jungle': 'forest', 'samundar': 'ocean', 'nadi': 'river',
      'aasman': 'sky', 'suraj': 'sun', 'chand': 'moon', 'tara': 'star',
      'phool': 'flower', 'ped': 'tree', 'ghas': 'grass',
      
      // Places
      'ghar': 'house', 'sheher': 'city', 'gaon': 'village', 'mandir': 'temple',
      'beach': 'beach', 'rasta': 'road', 'bazaar': 'market',
      
      // Adjectives
      'sundar': 'beautiful', 'khubsurat': 'beautiful', 'bada': 'big', 'chhota': 'small',
      'lamba': 'tall', 'purana': 'old', 'naya': 'new',
      
      // Actions/Fillers (remove)
      'banao': '', 'bana': '', 'banana': '', 'dikhao': '', 'dikha': '',
      'do': '', 'dena': '', 'karo': '', 'kar': '', 'chahiye': '',
      'please': '', 'mujhe': '', 'mujhko': '', 'hume': '', 'humko': '',
    };

    // Apply translations
    for (const [hindi, english] of Object.entries(translations)) {
      const regex = new RegExp(`\\b${hindi}\\b`, 'gi');
      prompt = prompt.replace(regex, english);
    }

    // Clean up
    return prompt
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, c => c.toUpperCase());
  }

  // ==========================================
  // CONTENT ANALYSIS
  // ==========================================

  /**
   * Analyze prompt content for routing decisions
   * v12.0: Enhanced detection for 2-model routing
   */
  private analyzeContent(text: string): {
    containsText: boolean;
    containsLogo: boolean;
    isRealistic: boolean;
    isReligious: boolean;
    isFestival: boolean;
    isAdvertisement: boolean;
    isTransformation: boolean;
    isDocument: boolean;
    isCard: boolean;
  } {
    const lower = text.toLowerCase();
    
    return {
      containsText: this.detectTextRequirement(text),
      containsLogo: this.detectLogoRequirement(text),
      isRealistic: this.detectRealisticRequirement(text),
      isReligious: this.detectReligiousContent(lower),
      isFestival: this.detectFestivalContent(lower),
      isAdvertisement: this.detectAdvertisementContent(lower),
      isTransformation: this.detectTransformationContent(lower),
      isDocument: this.detectDocumentContent(lower),
      isCard: this.detectCardContent(lower),
    };
  }

  // ==========================================
  // DETECTION METHODS
  // ==========================================

  private detectLanguage(text: string): 'hindi' | 'hinglish' | 'english' | 'other' {
    // Check for Devanagari script
    const hindiPattern = /[\u0900-\u097F]/;
    if (hindiPattern.test(text)) {
      return /[a-zA-Z]/.test(text) ? 'hinglish' : 'hindi';
    }
    
    // Check for Hinglish words in Roman script
    const hinglishWords = [
      'ek', 'aur', 'ka', 'ki', 'ke', 'hai', 'mein', 'par', 'se', 'ko',
      'banao', 'karo', 'chahiye', 'mera', 'meri', 'tum', 'aap', 'yeh', 'woh',
      'ladka', 'ladki', 'sundar', 'bahut', 'achha', 'bura', 'nahi',
      'shri', 'ji', 'bhagwan', 'devi', 'prabhu', 'mandir', 'pooja',
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const hinglishCount = words.filter(w => hinglishWords.includes(w)).length;
    
    if (hinglishCount >= 2 || (words.length > 0 && hinglishCount / words.length > 0.15)) {
      return 'hinglish';
    }
    
    return 'english';
  }

  private detectTextRequirement(text: string): boolean {
    const keywords = [
      'text', 'likhna', 'likho', 'typography', 'quote', 'naam', 'name', 
      'written', 'message', 'card', 'greeting', 'wish', 'slogan', 'tagline',
    ];
    const lower = text.toLowerCase();
    // Check for quoted text (user wants specific text)
    if (/"[^"]+"|'[^']+'/.test(text)) return true;
    return keywords.some(k => lower.includes(k));
  }

  private detectLogoRequirement(text: string): boolean {
    const keywords = ['logo', 'brand', 'emblem', 'icon', 'symbol', 'monogram', 'mascot'];
    return keywords.some(k => text.toLowerCase().includes(k));
  }

  private detectRealisticRequirement(text: string): boolean {
    const keywords = ['realistic', 'photorealistic', 'real', 'photograph', 'photo', 'dslr', 'camera'];
    return keywords.some(k => text.toLowerCase().includes(k));
  }

  private detectReligiousContent(lower: string): boolean {
    const keywords = [
      'god', 'goddess', 'deity', 'temple', 'mandir', 'church', 'mosque',
      'krishna', 'shiva', 'ganesh', 'ganesha', 'durga', 'lakshmi', 'hanuman',
      'ram', 'rama', 'sita', 'vishnu', 'brahma', 'saraswati', 'kali',
      'jesus', 'buddha', 'guru', 'sikh', 'gurdwara',
      'bhagwan', 'devta', 'devi', 'prabhu', 'ishwar',
    ];
    return keywords.some(k => lower.includes(k));
  }

  private detectFestivalContent(lower: string): boolean {
    const keywords = [
      'diwali', 'holi', 'navratri', 'durga puja', 'ganesh chaturthi',
      'raksha bandhan', 'rakhi', 'bhai dooj', 'karwa chauth',
      'eid', 'christmas', 'easter', 'guru purab',
      'basant panchami', 'makar sankranti', 'lohri', 'pongal', 'onam',
      'janmashtami', 'ram navami', 'mahashivratri', 'chhath',
      'festival', 'celebration', 'tyohar', 'parv',
      'new year', 'valentine', 'mother day', 'father day',
    ];
    return keywords.some(k => lower.includes(k));
  }

  private detectAdvertisementContent(lower: string): boolean {
    const keywords = [
      'ad', 'advertisement', 'promotional', 'promo', 'offer',
      'sale', 'discount', 'marketing', 'campaign',
      'banner', 'poster', 'flyer', 'pamphlet', 'brochure',
      'hoarding', 'billboard', 'signage',
    ];
    return keywords.some(k => lower.includes(k));
  }

  private detectTransformationContent(lower: string): boolean {
    const keywords = [
      'gta style', 'gta', 'grand theft auto',
      'anime', 'anime style', 'manga',
      'pixar', 'pixar style', 'disney',
      'cartoon', 'cartoonify', 'caricature',
      'oil painting', 'watercolor', 'sketch',
      'comic', 'comic book', 'marvel style',
      '3d render', 'clay render', 'plastic',
      'transform', 'convert', 'style transfer',
    ];
    return keywords.some(k => lower.includes(k));
  }

  private detectDocumentContent(lower: string): boolean {
    const keywords = [
      'document', 'edit document', 'modify image',
      'change text', 'replace text', 'update text',
      'remove background', 'add element', 'merge images',
      'pdf', 'certificate', 'invoice', 'receipt',
    ];
    return keywords.some(k => lower.includes(k));
  }

  private detectCardContent(lower: string): boolean {
    const keywords = [
      'card', 'birthday card', 'wedding card', 'invitation',
      'visiting card', 'business card', 'greeting card',
      'thank you card', 'congratulations card',
    ];
    return keywords.some(k => lower.includes(k));
  }

  // ==========================================
  // SYNC VERSION
  // ==========================================

  /**
   * Synchronous optimization (fallback only, no API call)
   * v12.0: Default provider is now SCHNELL
   */
  public optimizeSync(
    originalPrompt: string,
    targetProvider: ImageProvider = ImageProvider.SCHNELL
  ): PromptOptimizationResult {
    const detectedLanguage = this.detectLanguage(originalPrompt);
    
    let translatedPrompt: string;
    if (detectedLanguage === 'english') {
      translatedPrompt = this.cleanupPrompt(originalPrompt);
    } else {
      translatedPrompt = this.fallbackTranslate(originalPrompt);
    }
    
    const contentAnalysis = this.analyzeContent(originalPrompt);
    
    return {
      originalPrompt,
      optimizedPrompt: translatedPrompt,
      detectedLanguage,
      enhancements: ['Sync translation (no API)'],
      containsText: contentAnalysis.containsText,
      containsLogo: contentAnalysis.containsLogo,
      isRealistic: contentAnalysis.isRealistic,
      isReligious: contentAnalysis.isReligious,
      isFestival: contentAnalysis.isFestival,
      isAdvertisement: contentAnalysis.isAdvertisement,
      isTransformation: contentAnalysis.isTransformation,
      isDocument: contentAnalysis.isDocument,
      isCard: contentAnalysis.isCard,
      targetProvider,
      providerOptimized: false,
    };
  }
}

// ==========================================
// EXPORTS
// ==========================================

export const promptOptimizer = PromptOptimizer.getInstance();

/**
 * Translate prompt to English (async with Mistral)
 * v12.0: Default provider changed to SCHNELL
 */
export async function optimizePrompt(
  originalPrompt: string,
  targetProvider: ImageProvider = ImageProvider.SCHNELL
): Promise<PromptOptimizationResult> {
  return promptOptimizer.optimize(originalPrompt, targetProvider);
}

/**
 * Translate prompt to English (sync fallback)
 * v12.0: Default provider changed to SCHNELL
 */
export function optimizePromptSync(
  originalPrompt: string,
  targetProvider: ImageProvider = ImageProvider.SCHNELL
): PromptOptimizationResult {
  return promptOptimizer.optimizeSync(originalPrompt, targetProvider);
}

// ==========================================
// v12.0 PROVIDER-SPECIFIC EXPORTS
// ==========================================

/**
 * Optimize prompt for Schnell (Fal.ai)
 * Use for: General images, scenery, nature, animals, simple people
 * Cost: ₹0.25/image
 */
export async function optimizeForSchnell(originalPrompt: string): Promise<PromptOptimizationResult> {
  return promptOptimizer.optimize(originalPrompt, ImageProvider.SCHNELL);
}

/**
 * Optimize prompt for GPT LOW (OpenAI gpt-image-1.5)
 * Use for: Text, logos, festivals, ads, posters, cards, deities, transforms
 * Cost: ₹1.18/image
 */
export async function optimizeForGptLow(originalPrompt: string): Promise<PromptOptimizationResult> {
  return promptOptimizer.optimize(originalPrompt, ImageProvider.GPT_LOW);
}