/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * LANGUAGE & CULTURE ADAPTER (Token-Optimized)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Language detection + Cultural tone adaptation
 * Version: v1.0 (English-only responses)
 * Created: Day 2 - Dynamic Personality System
 *
 * Core Philosophy:
 * ✅ DETECT: User's language and cultural context
 * ✅ RESPOND: Always in ENGLISH (token-optimized)
 * ✅ ADAPT: Tone based on cultural background
 * ✅ SUPPORT: Hinglish code-mixing (natural Indian style)
 *
 * Why English-only responses?
 * 1. Token efficiency (Unicode = 3-4x more tokens)
 * 2. Model performance (best in English)
 * 3. Universal understanding (English worldwide)
 * 4. Cost optimization (critical for scale)
 *
 * Future (v2.0): Multi-language responses as premium feature
 *
 * Features:
 * - Language detection (understanding user input)
 * - Cultural context awareness (tone adaptation)
 * - Formality level detection
 * - Code-mixing support (Hinglish naturally integrated)
 * - Script detection (for analytics)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface LanguageDetectionResult {
  primaryLanguage: string; // ISO 639-1 code (en, hi, es, etc.)
  confidence: number; // 0-100
  secondaryLanguages: string[]; // Mixed language usage
  script: ScriptType; // Writing system
  isCodeMixed: boolean; // Hinglish, Spanglish, etc.
  dialect?: string; // Regional variant
}

export interface CulturalContext {
  region: string; // Country/Region code
  culturalNorms: {
    formalityPreference: 'very-formal' | 'formal' | 'neutral' | 'casual' | 'very-casual';
    directness: 'direct' | 'indirect'; // Communication style
    emotionalExpression: 'reserved' | 'moderate' | 'expressive';
    honorifics: boolean; // Use titles/respect terms
    personalSpace: 'high-context' | 'low-context'; // Cultural context level
    responseLength: 'concise' | 'moderate' | 'detailed'; // Response preference
  };
  timeZone: string; // For time-aware greetings
  holidayContext?: string; // Current cultural events
}

export interface AdaptationStrategy {
  responseLanguage: 'en'; // Always English (v1.0)
  toneStyle: string; // Cultural tone adaptation
  formalityLevel: 'very-formal' | 'formal' | 'neutral' | 'casual' | 'very-casual';
  allowHinglish: boolean; // Allow Hindi-English code-mixing
  culturalMarkers: string[]; // Culturally appropriate phrases (in English)
  greetingStyle: string; // How to greet (in English)
  communicationStyle: 'direct' | 'indirect';
  responseLength: 'concise' | 'moderate' | 'detailed';
}

export type ScriptType =
  | 'latin' // English, Spanish, French, etc.
  | 'devanagari' // Hindi, Sanskrit, Marathi, Nepali
  | 'arabic' // Arabic, Urdu, Persian
  | 'cyrillic' // Russian, Ukrainian, Bulgarian
  | 'chinese' // Simplified/Traditional Chinese
  | 'japanese' // Hiragana, Katakana, Kanji
  | 'korean' // Hangul
  | 'bengali' // Bengali, Assamese
  | 'tamil' // Tamil
  | 'telugu' // Telugu
  | 'gujarati' // Gujarati
  | 'thai' // Thai
  | 'mixed'; // Multiple scripts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LANGUAGE PATTERNS & DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class LanguageAdapter {
  /**
   * Language detection patterns with Unicode ranges
   */
  private readonly languagePatterns = {
    // Major languages with unique scripts
    hindi: {
      script: 'devanagari' as ScriptType,
      unicodeRange: /[\u0900-\u097F]/,
      commonWords: [
        'है',
        'हैं',
        'का',
        'की',
        'के',
        'में',
        'से',
        'को',
        'और',
        'या',
        'नहीं',
        'हूं',
        'हो',
        'था',
        'थी',
      ],
      greetings: ['नमस्ते', 'प्रणाम', 'नमस्कार'],
    },

    arabic: {
      script: 'arabic' as ScriptType,
      unicodeRange: /[\u0600-\u06FF]/,
      commonWords: ['من', 'في', 'على', 'إلى', 'أن', 'هذا', 'كان', 'قد', 'لا'],
      greetings: ['السلام عليكم', 'مرحبا', 'أهلا'],
    },

    russian: {
      script: 'cyrillic' as ScriptType,
      unicodeRange: /[\u0400-\u04FF]/,
      commonWords: ['это', 'как', 'что', 'так', 'вот', 'быть', 'мочь', 'она', 'они'],
      greetings: ['привет', 'здравствуйте', 'добрый день'],
    },

    chinese: {
      script: 'chinese' as ScriptType,
      unicodeRange: /[\u4E00-\u9FFF]/,
      commonWords: ['的', '是', '在', '了', '和', '有', '我', '你', '他'],
      greetings: ['你好', '您好', '早上好'],
    },

    japanese: {
      script: 'japanese' as ScriptType,
      unicodeRange: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/,
      commonWords: ['の', 'は', 'です', 'ます', 'した', 'する', 'いる', 'ある'],
      greetings: ['こんにちは', 'おはよう', 'こんばんは'],
    },

    korean: {
      script: 'korean' as ScriptType,
      unicodeRange: /[\uAC00-\uD7AF]/,
      commonWords: ['이', '는', '을', '를', '에', '의', '가', '와', '과'],
      greetings: ['안녕하세요', '안녕'],
    },

    bengali: {
      script: 'bengali' as ScriptType,
      unicodeRange: /[\u0980-\u09FF]/,
      commonWords: ['এই', 'যে', 'কি', 'আছে', 'করে', 'হয়', 'থেকে'],
      greetings: ['নমস্কার', 'হ্যালো'],
    },

    tamil: {
      script: 'tamil' as ScriptType,
      unicodeRange: /[\u0B80-\u0BFF]/,
      commonWords: ['இந்த', 'அந்த', 'என்', 'உள்ள', 'செய்', 'இருக்கிறது'],
      greetings: ['வணக்கம்', 'ஹலோ'],
    },

    telugu: {
      script: 'telugu' as ScriptType,
      unicodeRange: /[\u0C00-\u0C7F]/,
      commonWords: ['ఈ', 'ఆ', 'ఉంది', 'ఉన్నారు', 'చేయ', 'కు'],
      greetings: ['నమస్కారం', 'హలో'],
    },

    gujarati: {
      script: 'gujarati' as ScriptType,
      unicodeRange: /[\u0A80-\u0AFF]/,
      commonWords: ['આ', 'છે', 'થી', 'માં', 'એ', 'તે'],
      greetings: ['નમસ્તે', 'હલો'],
    },

    thai: {
      script: 'thai' as ScriptType,
      unicodeRange: /[\u0E00-\u0E7F]/,
      commonWords: ['ที่', 'เป็น', 'ใน', 'ของ', 'ได้', 'มี'],
      greetings: ['สวัสดี'],
    },

    urdu: {
      script: 'arabic' as ScriptType,
      unicodeRange: /[\u0600-\u06FF]/,
      commonWords: ['کا', 'کی', 'کے', 'میں', 'سے', 'ہے', 'ہیں'],
      greetings: ['السلام علیکم', 'آداب'],
    },
  };

  /**
   * Latin-script languages (need text analysis)
   * NOTE: Detection only - all responses will be in English
   */
  private readonly latinLanguages = {
    english: {
      commonWords: [
        'the',
        'is',
        'are',
        'was',
        'were',
        'be',
        'have',
        'has',
        'do',
        'does',
        'and',
        'or',
        'but',
        'in',
        'on',
        'at',
        'to',
        'for',
      ],
      contractions: ["i'm", "you're", "can't", "don't", "won't", "it's", "that's"],
    },

    spanish: {
      commonWords: [
        'el',
        'la',
        'de',
        'que',
        'y',
        'es',
        'en',
        'un',
        'por',
        'no',
        'los',
        'se',
        'con',
        'para',
        'como',
      ],
      accents: /[áéíóúñü]/,
    },

    french: {
      commonWords: [
        'le',
        'la',
        'de',
        'et',
        'est',
        'un',
        'une',
        'dans',
        'pour',
        'que',
        'qui',
        'ce',
        'il',
        'elle',
        'ne',
        'pas',
      ],
      accents: /[àâäæçéèêëïîôùûü]/,
    },

    german: {
      commonWords: [
        'der',
        'die',
        'das',
        'und',
        'ist',
        'in',
        'den',
        'von',
        'zu',
        'mit',
        'ein',
        'eine',
        'nicht',
        'sich',
      ],
      specialChars: /[äöüß]/,
    },

    portuguese: {
      commonWords: [
        'o',
        'a',
        'de',
        'e',
        'é',
        'do',
        'da',
        'em',
        'um',
        'para',
        'com',
        'não',
        'que',
        'os',
        'as',
      ],
      accents: /[áâãàçéêíóôõú]/,
    },

    italian: {
      commonWords: [
        'il',
        'la',
        'di',
        'e',
        'è',
        'un',
        'una',
        'in',
        'per',
        'che',
        'non',
        'con',
        'del',
        'della',
      ],
      accents: /[àèéìòù]/,
    },
  };

  /**
   * Code-mixing patterns (Hinglish, Spanglish, etc.)
   */
  private readonly codeMixingPatterns = {
    hinglish: {
      markers: ['hai', 'hain', 'kar', 'ho', 'aur', 'bhi', 'kya', 'kab', 'kaise', 'kyun'],
      mixing: /[\u0900-\u097F].*[a-zA-Z]|[a-zA-Z].*[\u0900-\u097F]/,
    },
    spanglish: {
      markers: ['pero', 'porque', 'que', 'como', 'si', 'no', 'muy', 'más'],
      mixing: /[a-zA-Z].*(?:pero|porque|que|como|si|muy|más)/i,
    },
    franglais: {
      markers: ['mais', 'très', "c'est", 'pas', 'bien', 'bon'],
      mixing: /[a-zA-Z].*(?:mais|très|c'est|pas|bien|bon)/i,
    },
  };

  /**
   * Cultural context database
   */
  private readonly culturalProfiles = {
    // Asian cultures
    IN: {
      // India
      formalityPreference: 'formal' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'moderate' as const,
      honorifics: true,
      personalSpace: 'high-context' as const,
      responseLength: 'moderate' as const,
    },

    JP: {
      // Japan
      formalityPreference: 'very-formal' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'reserved' as const,
      honorifics: true,
      personalSpace: 'high-context' as const,
      responseLength: 'moderate' as const,
    },

    KR: {
      // South Korea
      formalityPreference: 'formal' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'moderate' as const,
      honorifics: true,
      personalSpace: 'high-context' as const,
      responseLength: 'moderate' as const,
    },

    CN: {
      // China
      formalityPreference: 'formal' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'reserved' as const,
      honorifics: true,
      personalSpace: 'high-context' as const,
      responseLength: 'moderate' as const,
    },

    // Middle East
    SA: {
      // Saudi Arabia
      formalityPreference: 'very-formal' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'moderate' as const,
      honorifics: true,
      personalSpace: 'high-context' as const,
      responseLength: 'moderate' as const,
    },

    AE: {
      // UAE
      formalityPreference: 'formal' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'moderate' as const,
      honorifics: true,
      personalSpace: 'high-context' as const,
      responseLength: 'moderate' as const,
    },

    // European cultures
    US: {
      // United States
      formalityPreference: 'casual' as const,
      directness: 'direct' as const,
      emotionalExpression: 'expressive' as const,
      honorifics: false,
      personalSpace: 'low-context' as const,
      responseLength: 'concise' as const,
    },

    GB: {
      // United Kingdom
      formalityPreference: 'neutral' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'reserved' as const,
      honorifics: false,
      personalSpace: 'low-context' as const,
      responseLength: 'moderate' as const,
    },

    DE: {
      // Germany
      formalityPreference: 'formal' as const,
      directness: 'direct' as const,
      emotionalExpression: 'reserved' as const,
      honorifics: false,
      personalSpace: 'low-context' as const,
      responseLength: 'detailed' as const,
    },

    FR: {
      // France
      formalityPreference: 'formal' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'expressive' as const,
      honorifics: false,
      personalSpace: 'high-context' as const,
      responseLength: 'moderate' as const,
    },

    ES: {
      // Spain
      formalityPreference: 'neutral' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'expressive' as const,
      honorifics: false,
      personalSpace: 'high-context' as const,
      responseLength: 'moderate' as const,
    },

    // Latin America
    MX: {
      // Mexico
      formalityPreference: 'formal' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'expressive' as const,
      honorifics: true,
      personalSpace: 'high-context' as const,
      responseLength: 'moderate' as const,
    },

    BR: {
      // Brazil
      formalityPreference: 'casual' as const,
      directness: 'indirect' as const,
      emotionalExpression: 'expressive' as const,
      honorifics: false,
      personalSpace: 'high-context' as const,
      responseLength: 'moderate' as const,
    },

    // Default for unknown regions
    DEFAULT: {
      formalityPreference: 'neutral' as const,
      directness: 'direct' as const,
      emotionalExpression: 'moderate' as const,
      honorifics: false,
      personalSpace: 'low-context' as const,
      responseLength: 'moderate' as const,
    },
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN DETECTION METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Main detection method - analyzes input text
   */
  detectLanguage(text: string): LanguageDetectionResult {
    const cleanText = text.toLowerCase().trim();

    // Step 1: Detect script type
    const script = this.detectScript(text);

    // Step 2: Check for code-mixing
    const codeMixing = this.detectCodeMixing(text);

    // Step 3: Detect primary language
    let primaryLanguage = 'en'; // Default
    let confidence = 50;
    let secondaryLanguages: string[] = [];

    if (script !== 'latin' && script !== 'mixed') {
      // Non-Latin scripts have clear language markers
      const result = this.detectNonLatinLanguage(text, script);
      primaryLanguage = result.language;
      confidence = result.confidence;
    } else {
      // Latin scripts need text analysis
      const result = this.detectLatinLanguage(cleanText);
      primaryLanguage = result.language;
      confidence = result.confidence;
      secondaryLanguages = result.secondaryLanguages;
    }

    // Step 4: If code-mixed, add secondary language
    if (codeMixing.detected) {
      secondaryLanguages.push(...codeMixing.languages);
    }

    return {
      primaryLanguage,
      confidence,
      secondaryLanguages: [...new Set(secondaryLanguages)], // Remove duplicates
      script,
      isCodeMixed: codeMixing.detected,
      dialect: this.detectDialect(text, primaryLanguage),
    };
  }

  /**
   * Detect script type from Unicode ranges
   */
  private detectScript(text: string): ScriptType {
    const scripts: { [key in ScriptType]?: number } = {
      latin: 0,
      devanagari: 0,
      arabic: 0,
      cyrillic: 0,
      chinese: 0,
      japanese: 0,
      korean: 0,
      bengali: 0,
      tamil: 0,
      telugu: 0,
      gujarati: 0,
      thai: 0,
    };

    // Count characters in each script
    for (const char of text) {
      const code = char.charCodeAt(0);

      if (code >= 0x0900 && code <= 0x097f) scripts.devanagari = (scripts.devanagari || 0) + 1;
      else if (code >= 0x0600 && code <= 0x06ff) scripts.arabic = (scripts.arabic || 0) + 1;
      else if (code >= 0x0400 && code <= 0x04ff) scripts.cyrillic = (scripts.cyrillic || 0) + 1;
      else if (code >= 0x4e00 && code <= 0x9fff) scripts.chinese = (scripts.chinese || 0) + 1;
      else if ((code >= 0x3040 && code <= 0x309f) || (code >= 0x30a0 && code <= 0x30ff))
        scripts.japanese = (scripts.japanese || 0) + 1;
      else if (code >= 0xac00 && code <= 0xd7af) scripts.korean = (scripts.korean || 0) + 1;
      else if (code >= 0x0980 && code <= 0x09ff) scripts.bengali = (scripts.bengali || 0) + 1;
      else if (code >= 0x0b80 && code <= 0x0bff) scripts.tamil = (scripts.tamil || 0) + 1;
      else if (code >= 0x0c00 && code <= 0x0c7f) scripts.telugu = (scripts.telugu || 0) + 1;
      else if (code >= 0x0a80 && code <= 0x0aff) scripts.gujarati = (scripts.gujarati || 0) + 1;
      else if (code >= 0x0e00 && code <= 0x0e7f) scripts.thai = (scripts.thai || 0) + 1;
      else if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
        scripts.latin = (scripts.latin || 0) + 1;
      }
    }

    // Find dominant script
    const sortedScripts = Object.entries(scripts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    if (sortedScripts.length === 0) return 'latin'; // Default
    if (sortedScripts.length > 1 && sortedScripts[0][1] < text.length * 0.7) return 'mixed';

    return sortedScripts[0][0] as ScriptType;
  }

  /**
   * Detect non-Latin script languages
   */
  private detectNonLatinLanguage(
    text: string,
    script: ScriptType
  ): { language: string; confidence: number } {
    const scriptLanguageMap: { [key in ScriptType]?: string[] } = {
      devanagari: ['hi', 'mr', 'ne', 'sa'],
      arabic: ['ar', 'ur', 'fa'],
      cyrillic: ['ru', 'uk', 'bg'],
      chinese: ['zh'],
      japanese: ['ja'],
      korean: ['ko'],
      bengali: ['bn'],
      tamil: ['ta'],
      telugu: ['te'],
      gujarati: ['gu'],
      thai: ['th'],
    };

    const possibleLanguages = scriptLanguageMap[script] || ['en'];

    // For scripts with multiple languages, do word matching
    if (possibleLanguages.length > 1) {
      const lowerText = text.toLowerCase();

      for (const [langKey, langData] of Object.entries(this.languagePatterns)) {
        if (langData.script !== script) continue;

        const matchCount = langData.commonWords.filter((word) => lowerText.includes(word)).length;

        if (matchCount > 0) {
          const confidence = Math.min(95, 60 + matchCount * 5);
          return { language: this.getLanguageCode(langKey), confidence };
        }
      }
    }

    return { language: possibleLanguages[0], confidence: 80 };
  }

  /**
   * Detect Latin-script languages (English, Spanish, French, etc.)
   */
  private detectLatinLanguage(text: string): {
    language: string;
    confidence: number;
    secondaryLanguages: string[];
  } {
    const scores: { [key: string]: number } = {};
    const secondaryLanguages: string[] = [];

    // Check each Latin language
    for (const [langKey, langData] of Object.entries(this.latinLanguages)) {
      let score = 0;

      // Check common words
      const words = text.split(/\s+/);
      const matchCount = words.filter((word) => langData.commonWords.includes(word)).length;

      score += matchCount * 10;

      // Check special characters/accents
      if ('accents' in langData) {
        if ((langData as any).accents.test(text)) {
          score += 20;
        }
      }

      // Check contractions (English)
      if ('contractions' in langData) {
        const contractionCount = (langData as any).contractions.filter((c: string) =>
          text.includes(c)
        ).length;
        score += contractionCount * 15;
      }

      // Check special characters (German)
      if ('specialChars' in langData) {
        if ((langData as any).specialChars.test(text)) {
          score += 25;
        }
      }

      scores[langKey] = score;
    }

    // Sort by score
    const sortedLanguages = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // Primary language
    const primaryLanguage = sortedLanguages[0][0];
    const primaryScore = sortedLanguages[0][1];

    // Calculate confidence
    const confidence = Math.min(95, 40 + primaryScore);

    // Secondary languages (if mixed)
    for (let i = 1; i < sortedLanguages.length; i++) {
      if (sortedLanguages[i][1] > 20) {
        // Significant presence
        secondaryLanguages.push(this.getLanguageCode(sortedLanguages[i][0]));
      }
    }

    return {
      language: this.getLanguageCode(primaryLanguage),
      confidence,
      secondaryLanguages,
    };
  }

  /**
   * Detect code-mixing (Hinglish, Spanglish, etc.)
   */
  private detectCodeMixing(text: string): { detected: boolean; languages: string[] } {
    const languages: string[] = [];

    // Check Hinglish
    if (this.codeMixingPatterns.hinglish.mixing.test(text)) {
      const hinglishMarkerCount = this.codeMixingPatterns.hinglish.markers.filter((marker) =>
        text.toLowerCase().includes(marker)
      ).length;

      if (hinglishMarkerCount > 0) {
        languages.push('hi', 'en');
      }
    }

    // Check Spanglish
    if (this.codeMixingPatterns.spanglish.mixing.test(text)) {
      languages.push('es', 'en');
    }

    // Check Franglais
    if (this.codeMixingPatterns.franglais.mixing.test(text)) {
      languages.push('fr', 'en');
    }

    return {
      detected: languages.length > 0,
      languages,
    };
  }

  /**
   * Detect regional dialect
   */
  private detectDialect(text: string, language: string): string | undefined {
    const lowerText = text.toLowerCase();

    // English dialects
    if (language === 'en') {
      if (lowerText.includes('mate') || lowerText.includes('bloody')) return 'en-GB';
      if (lowerText.includes("y'all") || lowerText.includes('gonna')) return 'en-US';
      if (lowerText.includes('eh') || lowerText.includes('aboot')) return 'en-CA';
    }

    // Spanish dialects
    if (language === 'es') {
      if (lowerText.includes('che') || lowerText.includes('boludo')) return 'es-AR';
      if (lowerText.includes('wey') || lowerText.includes('güey')) return 'es-MX';
    }

    return undefined;
  }

  /**
   * Convert language key to ISO code
   */
  private getLanguageCode(languageKey: string): string {
    const codeMap: { [key: string]: string } = {
      english: 'en',
      hindi: 'hi',
      spanish: 'es',
      french: 'fr',
      german: 'de',
      portuguese: 'pt',
      italian: 'it',
      russian: 'ru',
      arabic: 'ar',
      chinese: 'zh',
      japanese: 'ja',
      korean: 'ko',
      bengali: 'bn',
      tamil: 'ta',
      telugu: 'te',
      gujarati: 'gu',
      thai: 'th',
      urdu: 'ur',
    };

    return codeMap[languageKey] || languageKey;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CULTURAL CONTEXT METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get cultural context based on region
   */
  getCulturalContext(regionCode: string, timeZone?: string): CulturalContext {
    const profile =
      this.culturalProfiles[regionCode as keyof typeof this.culturalProfiles] ||
      this.culturalProfiles.DEFAULT;

    return {
      region: regionCode,
      culturalNorms: profile,
      timeZone: timeZone || 'UTC',
      holidayContext: this.getHolidayContext(regionCode),
    };
  }

  /**
   * Get current holiday context (if any)
   */
  private getHolidayContext(regionCode: string): string | undefined {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Major holidays by region
    const holidays: { [key: string]: { [key: string]: string } } = {
      IN: {
        '1-26': 'Republic Day',
        '8-15': 'Independence Day',
        '10-2': 'Gandhi Jayanti',
      },
      US: {
        '7-4': 'Independence Day',
        '11-11': 'Veterans Day',
      },
      CN: {
        '10-1': 'National Day',
      },
      // Add more as needed
    };

    const regionHolidays = holidays[regionCode];
    if (regionHolidays) {
      const dateKey = `${month}-${day}`;
      return regionHolidays[dateKey];
    }

    return undefined;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ADAPTATION STRATEGY GENERATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate adaptation strategy for AI responses
   * V1.0: English-only responses with cultural tone adaptation
   */
  generateAdaptationStrategy(
    languageResult: LanguageDetectionResult,
    culturalContext: CulturalContext
  ): AdaptationStrategy {
    const { primaryLanguage, isCodeMixed } = languageResult;
    const { culturalNorms } = culturalContext;

    // Build tone style (English with cultural awareness)
    const toneStyle = this.buildEnglishToneStyle(primaryLanguage, culturalNorms, isCodeMixed);

    // Get cultural markers (English phrases with cultural context)
    const culturalMarkers = this.getCulturalMarkers(primaryLanguage, culturalNorms);

    // Get greeting style (English, culturally adapted)
    const greetingStyle = this.getEnglishGreetingStyle(primaryLanguage, culturalNorms);

    // Determine if Hinglish is appropriate
    const allowHinglish = this.shouldAllowHinglish(primaryLanguage, isCodeMixed);

    return {
      responseLanguage: 'en', // Always English (v1.0)
      toneStyle,
      formalityLevel: culturalNorms.formalityPreference,
      allowHinglish,
      culturalMarkers,
      greetingStyle,
      communicationStyle: culturalNorms.directness,
      responseLength: culturalNorms.responseLength,
    };
  }

  /**
   * Build English tone style with cultural awareness
   */
  private buildEnglishToneStyle(
    primaryLanguage: string,
    culturalNorms: CulturalContext['culturalNorms'],
    isCodeMixed: boolean
  ): string {
    const parts: string[] = [];

    // Base instruction: Always respond in English
    parts.push('Respond in natural, conversational English');

    // Cultural tone adaptation
    if (primaryLanguage === 'hi' || primaryLanguage === 'ur') {
      if (isCodeMixed) {
        parts.push(
          'User speaks Hinglish - you can naturally mix simple Hindi words (yaar, acha, theek hai, etc.) but keep base language English'
        );
      } else {
        parts.push(
          'User is from India/South Asia - adapt tone to be warm and relatable, use familiar Indian context'
        );
      }
    } else if (['es', 'pt'].includes(primaryLanguage)) {
      parts.push(
        'User speaks Spanish/Portuguese - be warm and expressive in your English responses'
      );
    } else if (['ja', 'ko', 'zh'].includes(primaryLanguage)) {
      parts.push(
        'User speaks Asian language - be respectful and thoughtful in your English responses'
      );
    } else if (['ar', 'fa'].includes(primaryLanguage)) {
      parts.push('User speaks Arabic/Persian - be formal and respectful in your English responses');
    }

    // Formality level
    switch (culturalNorms.formalityPreference) {
      case 'very-formal':
        parts.push('Maintain high formality and professional tone');
        break;
      case 'formal':
        parts.push('Be polite and professional but approachable');
        break;
      case 'neutral':
        parts.push('Balance friendliness with professionalism');
        break;
      case 'casual':
        parts.push('Be friendly, warm, and conversational');
        break;
      case 'very-casual':
        parts.push('Be relaxed and natural like talking to a close friend');
        break;
    }

    // Communication style
    if (culturalNorms.directness === 'indirect') {
      parts.push('Use diplomatic, considerate language - avoid being too blunt');
    } else {
      parts.push('Be clear and straightforward in communication');
    }

    return parts.join('. ') + '.';
  }

  /**
   * Get cultural markers (English phrases with cultural context)
   */
  private getCulturalMarkers(
    language: string,
    culturalNorms: CulturalContext['culturalNorms']
  ): string[] {
    const markers: string[] = [];

    // Indian context
    if (language === 'hi' || language === 'ur') {
      if (
        culturalNorms.formalityPreference === 'casual' ||
        culturalNorms.formalityPreference === 'very-casual'
      ) {
        markers.push(
          'Use natural expressions: "Arre yaar", "Acha", "Bilkul", "Theek hai"',
          'Can reference Indian context naturally',
          'Be warm like talking to a desi friend'
        );
      } else {
        markers.push(
          'Can use respectful terms: "ji", "aap"',
          'Acknowledge Indian cultural context',
          'Be warm but maintain respect'
        );
      }
    }

    // General emotional expression
    switch (culturalNorms.emotionalExpression) {
      case 'reserved':
        markers.push('Keep emotions measured and balanced');
        break;
      case 'expressive':
        markers.push('Feel free to be warm and emotionally engaging');
        break;
    }

    return markers;
  }

  /**
   * Get English greeting style adapted to culture
   */
  private getEnglishGreetingStyle(
    language: string,
    culturalNorms: CulturalContext['culturalNorms']
  ): string {
    // Indian/Hindi users
    if (language === 'hi' || language === 'ur') {
      switch (culturalNorms.formalityPreference) {
        case 'very-formal':
          return 'Namaste! How may I assist you today?';
        case 'formal':
          return 'Hello! How can I help you?';
        case 'neutral':
          return 'Hey! What can I do for you?';
        case 'casual':
          return 'Hey! Kya help chahiye?';
        case 'very-casual':
          return "Arre yaar! What's up? How can I help?";
        default:
          return 'Hello! How can I help you?';
      }
    }

    // Default English greetings
    switch (culturalNorms.formalityPreference) {
      case 'very-formal':
        return 'Good day. How may I assist you?';
      case 'formal':
        return 'Hello! How can I help you today?';
      case 'neutral':
        return 'Hi there! What can I do for you?';
      case 'casual':
        return "Hey! What's up?";
      case 'very-casual':
        return 'Hey! What can I help you with?';
      default:
        return 'Hello! How can I help you?';
    }
  }

  /**
   * Check if Hinglish code-mixing should be allowed
   */
  private shouldAllowHinglish(primaryLanguage: string, isCodeMixed: boolean): boolean {
    // Allow Hinglish if user is using it or speaks Hindi
    return (primaryLanguage === 'hi' || primaryLanguage === 'ur') && (isCodeMixed || true); // Can use Hinglish with Hindi/Urdu users
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONVENIENCE METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Complete analysis pipeline
   * Returns language detection + cultural context + English response strategy
   */
  analyzeUserInput(
    text: string,
    userRegion: string = 'US',
    userTimeZone?: string
  ): {
    language: LanguageDetectionResult;
    culture: CulturalContext;
    adaptation: AdaptationStrategy;
  } {
    const language = this.detectLanguage(text);
    const culture = this.getCulturalContext(userRegion, userTimeZone);
    const adaptation = this.generateAdaptationStrategy(language, culture);

    return { language, culture, adaptation };
  }

  /**
   * Get simple language code (for logging/analytics)
   */
  getSimpleLanguageCode(text: string): string {
    return this.detectLanguage(text).primaryLanguage;
  }

  /**
   * Check if Hinglish should be used in response
   */
  shouldUseHinglish(text: string): boolean {
    const detection = this.detectLanguage(text);
    return this.shouldAllowHinglish(detection.primaryLanguage, detection.isCodeMixed);
  }

  /**
   * Get formality level from text
   */
  getFormalityLevel(text: string, userRegion: string = 'US'): string {
    const culture = this.getCulturalContext(userRegion);
    return culture.culturalNorms.formalityPreference;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const languageAdapter = new LanguageAdapter();
