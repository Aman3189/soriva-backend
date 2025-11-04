/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA TONE MATCHER SERVICE - HYBRID (Statistical + LLM)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Date: November 4, 2025
 * 
 * Purpose:
 * - HYBRID: Statistical Hinglish detection + LLM style suggestions
 * - Detect user's language mix (English/Hindi/Hinglish)
 * - LLM-powered natural tone matching
 * - Dynamic response style generation
 * - Cultural phrase understanding
 * 
 * Features:
 * - Fast statistical language detection
 * - LLM-powered dynamic style suggestions
 * - Natural conversation flow
 * - Graceful fallback to statistical
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import {
  DetectedLanguage,
  LanguageFormality,
  ToneAnalysis,
  HinglishPhrase,
  LLMService,
} from './intelligence.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HINGLISH VOCABULARY DATABASE (for fast statistical detection)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HINGLISH_VOCABULARY = {
  ULTRA_CASUAL: [
    'bhai', 'yaar', 'boss', 'dude', 'bro', 'mere bhai',
    'arre', 'arey', 'oye', 'chal', 'haan', 'nahi',
    'kya baat', 'sahi hai', 'badhiya', 'ekdum',
    'matlab', 'basically', 'actually',
  ],
  CASUAL: [
    'thik hai', 'okay', 'theek', 'accha', 'acha', 'achha',
    'haan ji', 'nahi ji', 'kaise', 'kaisa', 'kya',
    'samajh gaya', 'samajh gayi', 'ho gaya', 'kar diya',
    'bilkul', 'zaroor', 'pakka', 'sure', 'theek hai',
  ],
  SEMI_FORMAL: [
    'aap', 'aapka', 'aapki', 'please', 'thank you',
    'dhanyavaad', 'shukriya', 'maaf kijiye',
    'kripya', 'ji', 'sahab', 'sir', 'madam',
  ],
  CODE_MIXED: [
    'kar do', 'kar dijiye', 'bata do', 'bata dijiye',
    'help karo', 'help kijiye', 'problem hai', 'issue hai',
    'samajh nahi aaya', 'samajh nahi aa raha',
    'kya matlab hai', 'kaise karu', 'kaise karun',
  ],
  EXPRESSIONS: [
    'acha', 'achha', 'hmm', 'arre', 'wah', 'oh',
    'sahi', 'nice', 'great', 'badiya', 'mast',
    'kya baat hai', 'zabardast', 'shandar', 'perfect',
  ],
  QUESTIONS: [
    'kya', 'kab', 'kahan', 'kyun', 'kaise', 'kaun',
    'kitna', 'kitne', 'konsa', 'konse',
  ],
} as const;

const FORMALITY_INDICATORS = {
  FORMAL: [
    'kindly', 'request', 'would you', 'could you',
    'please assist', 'appreciate', 'grateful',
    'sir', 'madam', 'respected',
  ],
  CASUAL: [
    'btw', 'lol', 'omg', 'gonna', 'wanna',
    'yeah', 'yep', 'nope', 'yup', '!', '!!',
  ],
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TONE_CONFIG = {
  HINDI_THRESHOLD: 20,
  ENGLISH_THRESHOLD: 80,
  HINGLISH_MIN_THRESHOLD: 5,
  FORMAL_SCORE_THRESHOLD: 60,
  CASUAL_SCORE_THRESHOLD: 40,
  SHOULD_MATCH_THRESHOLD: 70,
  CACHE_TTL_MINUTES: 15,
  USE_LLM_FOR_SUGGESTIONS: true,
  MIN_TEXT_LENGTH_FOR_LLM: 10,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TONE MATCHER SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ToneMatcherService {
  private llmService: LLMService;
  private toneCache: Map<string, { analysis: ToneAnalysis; timestamp: Date }> = new Map();

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    console.log('[ToneMatcher] ✅ Initialized - Hybrid (Statistical + LLM)');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN ANALYSIS METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🎯 MAIN: Analyze tone with HYBRID approach
   */
  public async analyzeTone(text: string, userId?: string): Promise<ToneAnalysis> {
    console.log('[ToneMatcher] 🎵 Analyzing tone (hybrid)...');

    // STEP 1: Statistical Detection (Fast, Always Works)
    const languageStats = this.detectLanguageMix(text);
    const language = this.classifyLanguage(languageStats);
    const formalityScore = this.calculateFormalityScore(text);
    const formality = this.classifyFormality(formalityScore);
    const hinglishPhrases = this.extractHinglishPhrases(text);
    const confidence = this.calculateConfidence(languageStats, hinglishPhrases);
    const shouldMatchTone = confidence >= TONE_CONFIG.SHOULD_MATCH_THRESHOLD;

    // STEP 2: LLM Enhancement for Style Suggestions (if appropriate)
    let suggestedStyle: ToneAnalysis['suggestedStyle'];

    if (
      TONE_CONFIG.USE_LLM_FOR_SUGGESTIONS &&
      text.length >= TONE_CONFIG.MIN_TEXT_LENGTH_FOR_LLM &&
      shouldMatchTone
    ) {
      try {
        console.log('[ToneMatcher] 🤖 Enhancing with LLM style suggestions...');
        suggestedStyle = await this.generateStyleSuggestionsLLM(
          text,
          language,
          formality,
          hinglishPhrases
        );
      } catch (error) {
        console.warn('[ToneMatcher] ⚠️ LLM failed, using statistical suggestions');
        suggestedStyle = this.generateStyleSuggestionsStatistical(
          language,
          formality,
          hinglishPhrases,
          confidence
        );
      }
    } else {
      suggestedStyle = this.generateStyleSuggestionsStatistical(
        language,
        formality,
        hinglishPhrases,
        confidence
      );
    }

    const analysis: ToneAnalysis = {
      language,
      formality,
      hindiWordsPercent: languageStats.hindiPercent,
      englishWordsPercent: languageStats.englishPercent,
      hinglishPhrases,
      shouldMatchTone,
      suggestedStyle,
    };

    // Cache if user provided
    if (userId) {
      this.toneCache.set(userId, {
        analysis,
        timestamp: new Date(),
      });
    }

    console.log(
      `[ToneMatcher] ✅ Detected: ${language} (${formality}), Match: ${shouldMatchTone}`
    );

    return analysis;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATISTICAL LANGUAGE DETECTION (Fast & Accurate)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Detect language mix percentages (statistical)
   */
  private detectLanguageMix(text: string): {
    hindiPercent: number;
    englishPercent: number;
    totalWords: number;
  } {
    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
    const totalWords = words.length;

    if (totalWords === 0) {
      return { hindiPercent: 0, englishPercent: 0, totalWords: 0 };
    }

    let hindiWordCount = 0;

    const allHinglish = [
      ...HINGLISH_VOCABULARY.ULTRA_CASUAL,
      ...HINGLISH_VOCABULARY.CASUAL,
      ...HINGLISH_VOCABULARY.SEMI_FORMAL,
      ...HINGLISH_VOCABULARY.CODE_MIXED,
      ...HINGLISH_VOCABULARY.EXPRESSIONS,
      ...HINGLISH_VOCABULARY.QUESTIONS,
    ];

    words.forEach((word) => {
      if (allHinglish.some((hw) => word.includes(hw))) {
        hindiWordCount++;
        return;
      }

      if (/[\u0900-\u097F]/.test(word)) {
        hindiWordCount++;
        return;
      }

      const romanHindiPatterns = [
        /^(hai|hain|tha|the|thi|hoga|hogi|kar|kiya|kiye)$/,
        /^(mein|main|hum|tum|aap|yeh|woh)$/,
        /^(kuch|koi|sab|sabhi|ek|do|teen)$/,
      ];

      if (romanHindiPatterns.some((pattern) => pattern.test(word))) {
        hindiWordCount++;
      }
    });

    const hindiPercent = Math.round((hindiWordCount / totalWords) * 100);
    const englishPercent = 100 - hindiPercent;

    return { hindiPercent, englishPercent, totalWords };
  }

  /**
   * Classify language based on percentages
   */
  private classifyLanguage(stats: {
    hindiPercent: number;
    englishPercent: number;
  }): DetectedLanguage {
    const { hindiPercent, englishPercent } = stats;

    if (englishPercent >= TONE_CONFIG.ENGLISH_THRESHOLD) return 'english';
    if (hindiPercent >= TONE_CONFIG.ENGLISH_THRESHOLD) return 'hindi';

    if (
      hindiPercent >= TONE_CONFIG.HINGLISH_MIN_THRESHOLD &&
      englishPercent >= TONE_CONFIG.HINGLISH_MIN_THRESHOLD
    ) {
      return 'hinglish';
    }

    return 'mixed';
  }

  /**
   * Calculate formality score (statistical)
   */
  private calculateFormalityScore(text: string): number {
    const lowerText = text.toLowerCase();
    let score = 50;

    FORMALITY_INDICATORS.FORMAL.forEach((indicator) => {
      if (lowerText.includes(indicator)) score += 8;
    });

    HINGLISH_VOCABULARY.ULTRA_CASUAL.forEach((word) => {
      if (lowerText.includes(word)) score -= 10;
    });

    FORMALITY_INDICATORS.CASUAL.forEach((indicator) => {
      if (lowerText.includes(indicator)) score -= 5;
    });

    HINGLISH_VOCABULARY.SEMI_FORMAL.forEach((word) => {
      if (lowerText.includes(word)) score += 5;
    });

    const words = text.split(/\s+/).length;
    if (words > 30) score += 5;
    if (words < 10) score -= 5;

    if (/^[A-Z]/.test(text)) score += 3;
    if (/[.!?]$/.test(text)) score += 2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Classify formality level
   */
  private classifyFormality(score: number): LanguageFormality {
    if (score >= TONE_CONFIG.FORMAL_SCORE_THRESHOLD) return 'formal';
    if (score <= TONE_CONFIG.CASUAL_SCORE_THRESHOLD) return 'casual';
    return 'semi_formal';
  }

  /**
   * Extract Hinglish phrases (statistical)
   */
  private extractHinglishPhrases(text: string): string[] {
    const lowerText = text.toLowerCase();
    const foundPhrases = new Set<string>();

    const allVocab = [
      ...HINGLISH_VOCABULARY.ULTRA_CASUAL,
      ...HINGLISH_VOCABULARY.CASUAL,
      ...HINGLISH_VOCABULARY.SEMI_FORMAL,
      ...HINGLISH_VOCABULARY.CODE_MIXED,
      ...HINGLISH_VOCABULARY.EXPRESSIONS,
    ];

    allVocab.forEach((phrase) => {
      if (lowerText.includes(phrase)) {
        foundPhrases.add(phrase);
      }
    });

    return Array.from(foundPhrases).slice(0, 10);
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(
    languageStats: { hindiPercent: number; englishPercent: number; totalWords: number },
    hinglishPhrases: string[]
  ): number {
    let confidence = 50;

    if (languageStats.totalWords > 20) confidence += 20;
    else if (languageStats.totalWords > 10) confidence += 10;
    else if (languageStats.totalWords < 5) confidence -= 20;

    if (languageStats.hindiPercent > 70 || languageStats.englishPercent > 70) {
      confidence += 15;
    }

    confidence += Math.min(hinglishPhrases.length * 5, 20);

    return Math.max(0, Math.min(100, confidence));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LLM-POWERED STYLE SUGGESTIONS (Dynamic & Natural)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate style suggestions via LLM (dynamic)
   */
  private async generateStyleSuggestionsLLM(
    userText: string,
    language: DetectedLanguage,
    formality: LanguageFormality,
    hinglishPhrases: string[]
  ): Promise<ToneAnalysis['suggestedStyle']> {
    const prompt = this.buildStyleSuggestionPrompt(
      userText,
      language,
      formality,
      hinglishPhrases
    );

    const response = await this.llmService.generateCompletion(prompt);
    const parsed = this.parseStyleSuggestions(response, language, formality);

    console.log('[ToneMatcher] ✅ LLM generated natural style suggestions');
    return parsed;
  }

  /**
   * Build prompt for LLM style suggestions
   */
  private buildStyleSuggestionPrompt(
    userText: string,
    language: DetectedLanguage,
    formality: LanguageFormality,
    hinglishPhrases: string[]
  ): string {
    return `
You are a tone-matching expert. Analyze this user's message and suggest how an AI should respond to match their natural communication style.

User Message: "${userText}"

Detected:
- Language: ${language}
- Formality: ${formality}
- Hinglish Phrases Used: ${hinglishPhrases.join(', ') || 'none'}

Generate 4 natural example opening phrases that match the user's tone. These will be used as style guides for the AI response.

Guidelines:
${
  language === 'hinglish' || language === 'hindi'
    ? `- Use natural Hinglish (mix of Hindi and English)
- Match the user's level of Hindi usage
- Use common Hinglish phrases like: bilkul, theek hai, haan, samajh gaya, etc.
- Sound like a real person chatting, not a textbook`
    : `- Use pure English
- Avoid any Hindi/Hinglish words`
}

${
  formality === 'casual'
    ? `- Keep it very casual and friendly
- Use informal language
- Can use words like: sure, yeah, cool, no problem`
    : formality === 'formal'
    ? `- Keep it formal and professional
- Use polite language
- Avoid casual slang`
    : `- Keep it semi-formal
- Friendly but respectful
- Balanced tone`
}

Output Format (JSON):
{
  "useHinglish": true|false,
  "formalityLevel": "casual|semi_formal|formal",
  "examplePhrases": [
    "Natural opening phrase 1",
    "Natural opening phrase 2",
    "Natural opening phrase 3",
    "Natural opening phrase 4"
  ]
}

Make the phrases sound NATURAL and CONVERSATIONAL, like a real person would say them.

Output ONLY valid JSON:
`;
  }

  /**
   * Parse LLM style suggestions
   */
  private parseStyleSuggestions(
    response: string,
    fallbackLanguage: DetectedLanguage,
    fallbackFormality: LanguageFormality
  ): ToneAnalysis['suggestedStyle'] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        useHinglish: parsed.useHinglish !== undefined ? parsed.useHinglish : false,
        formalityLevel: parsed.formalityLevel || fallbackFormality,
        examplePhrases: parsed.examplePhrases || [],
      };
    } catch (error) {
      console.error('[ToneMatcher] ❌ Failed to parse LLM suggestions:', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATISTICAL STYLE SUGGESTIONS (Fallback)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate style suggestions statistically (fallback)
   */
  private generateStyleSuggestionsStatistical(
    language: DetectedLanguage,
    formality: LanguageFormality,
    hinglishPhrases: string[],
    confidence: number
  ): ToneAnalysis['suggestedStyle'] {
    const useHinglish =
      (language === 'hinglish' || language === 'hindi') && confidence >= 60;

    const examplePhrases: string[] = [];

    if (useHinglish) {
      if (formality === 'casual') {
        examplePhrases.push(
          'Bilkul, main samjha sakta hoon',
          'Haan, yeh kaam ho sakta hai',
          'Theek hai, chaliye main batata hoon',
          'Arre haan, yeh bahut simple hai'
        );
      } else if (formality === 'semi_formal') {
        examplePhrases.push(
          'Ji bilkul, main aapki madad kar sakta hoon',
          'Haan ji, yeh possible hai',
          'Theek hai, main aapko guide karta hoon',
          'Zaroor, main explain karta hoon'
        );
      } else {
        examplePhrases.push(
          'Certainly, I can help you with that',
          'Yes, this is definitely possible',
          'Let me guide you through this',
          "I'll explain this clearly"
        );
      }
    } else {
      if (formality === 'casual') {
        examplePhrases.push('Sure thing!', 'Yeah, that works', 'Got it, let me help', 'No problem');
      } else if (formality === 'semi_formal') {
        examplePhrases.push(
          'Certainly, I can assist',
          "Yes, that's possible",
          'Let me help you',
          "I'll guide you"
        );
      } else {
        examplePhrases.push(
          'Certainly, I would be happy to assist',
          'Yes, that is absolutely possible',
          'Allow me to guide you',
          'I will provide a comprehensive explanation'
        );
      }
    }

    return {
      useHinglish,
      formalityLevel: formality,
      examplePhrases: examplePhrases.slice(0, 4),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get cached tone analysis
   */
  public getCachedTone(userId: string): ToneAnalysis | null {
    const cached = this.toneCache.get(userId);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp.getTime();
    const ttl = TONE_CONFIG.CACHE_TTL_MINUTES * 60 * 1000;

    if (age > ttl) {
      this.toneCache.delete(userId);
      return null;
    }

    return cached.analysis;
  }

  /**
   * Suggest response tone (with LLM if available)
   */
  public async suggestResponseTone(userMessage: string): Promise<{
    shouldUseHinglish: boolean;
    formalityLevel: LanguageFormality;
    suggestedOpening: string;
  }> {
    const analysis = await this.analyzeTone(userMessage);

    let suggestedOpening = '';

    if (analysis.suggestedStyle.examplePhrases.length > 0) {
      // Use first LLM-generated phrase as opening
      suggestedOpening = analysis.suggestedStyle.examplePhrases[0].split('.')[0] + ' ';
    } else {
      // Fallback to simple opening
      if (analysis.suggestedStyle.useHinglish) {
        suggestedOpening =
          analysis.formality === 'casual'
            ? 'Haan bhai, '
            : analysis.formality === 'semi_formal'
            ? 'Ji bilkul, '
            : 'Certainly, ';
      } else {
        suggestedOpening =
          analysis.formality === 'casual'
            ? 'Sure! '
            : analysis.formality === 'semi_formal'
            ? 'Certainly, '
            : 'I would be happy to assist. ';
      }
    }

    return {
      shouldUseHinglish: analysis.suggestedStyle.useHinglish,
      formalityLevel: analysis.formality,
      suggestedOpening,
    };
  }

  /**
   * Clear cache
   */
  public clearCache(userId?: string): void {
    if (userId) {
      this.toneCache.delete(userId);
      console.log(`[ToneMatcher] 🧹 Cache cleared for user: ${userId}`);
    } else {
      this.toneCache.clear();
      console.log('[ToneMatcher] 🧹 All cache cleared');
    }
  }

  /**
   * Get cache stats
   */
  public getCacheStats(): { size: number; users: string[] } {
    return {
      size: this.toneCache.size,
      users: Array.from(this.toneCache.keys()),
    };
  }
}

export default ToneMatcherService;