/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA KUNDLI PARSER SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Parses natural language birth details for Kundli generation
 * Supports Hindi, English, and Hinglish inputs
 * 
 * Examples:
 * - "31 Jan 1989, 4pm, Ferozepur"
 * - "मेरा जन्म 15 अगस्त 1995 को दिल्ली में हुआ था"
 * - "born on 25/12/1990 at 3:30 AM in Mumbai"
 * 
 * Created by: Amandeep, Punjab, India
 * Created: February 2026
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ParsedBirthDetails {
  date: string;        // YYYY-MM-DD format
  time: string;        // HH:MM format (24hr)
  place: string;       // Raw place name
  isComplete: boolean; // All fields present?
  missing: string[];   // Which fields are missing
  confidence: number;  // 0-1 confidence score
}

export interface KundliIntent {
  isKundliRequest: boolean;
  type: 'CREATE' | 'MATCH' | 'QUESTION' | 'NONE';
  language: 'hindi' | 'english' | 'hinglish';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS - Month mappings (English + Hindi)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MONTH_MAP: Record<string, number> = {
  // English
  'january': 1, 'jan': 1,
  'february': 2, 'feb': 2,
  'march': 3, 'mar': 3,
  'april': 4, 'apr': 4,
  'may': 5,
  'june': 6, 'jun': 6,
  'july': 7, 'jul': 7,
  'august': 8, 'aug': 8,
  'september': 9, 'sep': 9, 'sept': 9,
  'october': 10, 'oct': 10,
  'november': 11, 'nov': 11,
  'december': 12, 'dec': 12,
  // Hindi
  'जनवरी': 1,
  'फरवरी': 2,
  'मार्च': 3,
  'अप्रैल': 4,
  'मई': 5,
  'जून': 6,
  'जुलाई': 7,
  'अगस्त': 8,
  'सितंबर': 9,
  'अक्टूबर': 10,
  'नवंबर': 11,
  'दिसंबर': 12,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KUNDLI INTENT DETECTION PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const KUNDLI_CREATE_PATTERNS = [
  // DOB/Birth details pattern
  /\b(dob|date\s*of\s*birth|birth\s*date|born\s*on)\b.*\b(place|time|city)\b/i,
  /\b(place|city|location)\b.*\b(dob|birth|born)\b/i,
  // Hindi/Hinglish
  /\b(meri|mera|apni|apna)\s*(kundli|kundali|janam\s*patri|janampatri|patrika)\b/i,
  /\b(kundli|kundali|janampatri|patrika)\s*(banao|banana|chahiye|bana\s*do|generate)\b/i,
  /\b(create|make|generate|bana)\s*(my\s*)?(kundli|kundali|birth\s*chart|janampatri)\b/i,
  // English
  /\b(create|generate|make|show)\s*(my\s*)?(kundli|kundali|birth\s*chart|horoscope|natal\s*chart)\b/i,
  /\b(my|meri)\s*(kundli|birth\s*chart)\b/i,
  // Direct
  /^kundli$/i,
  /^birth\s*chart$/i,
];

const KUNDLI_MATCH_PATTERNS = [
  // Hindi/Hinglish
  /\b(kundli|kundali)\s*(matching|milan|match)\b/i,
  /\b(gun|guna)\s*milan\b/i,
  /\b(shaadi|marriage|vivah)\s*(ke\s*liye\s*)?(kundli|match)\b/i,
  /\b(match\s*making|matchmaking)\b/i,
  // English
  /\b(compatibility|match)\s*(kundli|horoscope|chart)\b/i,
  /\bkundli\s*compatibility\b/i,
];

const KUNDLI_QUESTION_PATTERNS = [
  /\b(kundli|kundali|horoscope|rashi|nakshatra|mahadasha|dasha)\s*(kya|what|how|when|which)\b/i,
  /\b(kya|what|how)\s*(hai|is|are)\s*(kundli|mahadasha|rashi)\b/i,
  /\b(tell|batao|bataiye)\s*(me|mujhe)?\s*(about|bare\s*mein)?\s*(kundli|rashi|nakshatra)\b/i,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KUNDLI PARSER SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class KundliParserService {
  
  /**
   * Detect if message is a Kundli-related request
   */
  detectKundliIntent(message: string): KundliIntent {
    const normalizedMsg = message.toLowerCase().trim();
    
    // Detect language
    const hasHindi = /[\u0900-\u097F]/.test(message);
    const hasEnglish = /[a-zA-Z]/.test(message);
    const language = hasHindi && hasEnglish ? 'hinglish' : hasHindi ? 'hindi' : 'english';
    
    // Check for CREATE intent
    for (const pattern of KUNDLI_CREATE_PATTERNS) {
      if (pattern.test(normalizedMsg)) {
        return { isKundliRequest: true, type: 'CREATE', language };
      }
    }
    
    // Check for MATCH intent
    for (const pattern of KUNDLI_MATCH_PATTERNS) {
      if (pattern.test(normalizedMsg)) {
        return { isKundliRequest: true, type: 'MATCH', language };
      }
    }
    
    // Check for QUESTION intent
    for (const pattern of KUNDLI_QUESTION_PATTERNS) {
      if (pattern.test(normalizedMsg)) {
        return { isKundliRequest: true, type: 'QUESTION', language };
      }
    }
    
    return { isKundliRequest: false, type: 'NONE', language };
  }

  /**
   * Parse natural language birth details from message
   */
  parseBirthDetails(message: string): ParsedBirthDetails {
    const result: ParsedBirthDetails = {
      date: '',
      time: '',
      place: '',
      isComplete: false,
      missing: [],
      confidence: 0,
    };
    
    // Extract date
    const dateResult = this.extractDate(message);
    if (dateResult) {
      result.date = dateResult;
      result.confidence += 0.4;
    } else {
      result.missing.push('date');
    }
    
    // Extract time
    const timeResult = this.extractTime(message);
    if (timeResult) {
      result.time = timeResult;
      result.confidence += 0.3;
    } else {
      result.missing.push('time');
    }
    
    // Extract place
    const placeResult = this.extractPlace(message);
    if (placeResult) {
      result.place = placeResult;
      result.confidence += 0.3;
    } else {
      result.missing.push('place');
    }
    
    result.isComplete = result.missing.length === 0;
    
    return result;
  }

  /**
   * Extract date from natural language
   * Supports: DD/MM/YYYY, DD-MM-YYYY, DD Month YYYY, etc.
   */
  private extractDate(message: string): string | null {
    const normalizedMsg = message.toLowerCase();
    
    // Pattern 1: DD/MM/YYYY or DD-MM-YYYY
    const slashPattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const slashMatch = message.match(slashPattern);
    if (slashMatch) {
      const [, day, month, year] = slashMatch;
      return this.formatDate(parseInt(day), parseInt(month), parseInt(year));
    }
    
    // Pattern 2: DD Month YYYY (English)
    const monthNamePattern = /(\d{1,2})\s*(?:st|nd|rd|th)?\s*(?:of\s+)?([a-zA-Z]+)\s*,?\s*(\d{4})/i;
    const monthNameMatch = message.match(monthNamePattern);
    if (monthNameMatch) {
      const [, day, monthName, year] = monthNameMatch;
      const month = MONTH_MAP[monthName.toLowerCase()];
      if (month) {
        return this.formatDate(parseInt(day), month, parseInt(year));
      }
    }
    
    // Pattern 3: Month DD, YYYY (American style)
    const americanPattern = /([a-zA-Z]+)\s+(\d{1,2})\s*,?\s*(\d{4})/i;
    const americanMatch = message.match(americanPattern);
    if (americanMatch) {
      const [, monthName, day, year] = americanMatch;
      const month = MONTH_MAP[monthName.toLowerCase()];
      if (month) {
        return this.formatDate(parseInt(day), month, parseInt(year));
      }
    }
    
    // Pattern 4: Hindi date (15 अगस्त 1995)
    const hindiPattern = /(\d{1,2})\s*([\u0900-\u097F]+)\s*(\d{4})/;
    const hindiMatch = message.match(hindiPattern);
    if (hindiMatch) {
      const [, day, monthName, year] = hindiMatch;
      const month = MONTH_MAP[monthName];
      if (month) {
        return this.formatDate(parseInt(day), month, parseInt(year));
      }
    }
    
    // Pattern 5: YYYY-MM-DD (ISO format)
    const isoPattern = /(\d{4})-(\d{2})-(\d{2})/;
    const isoMatch = message.match(isoPattern);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return `${year}-${month}-${day}`;
    }
    
    return null;
  }

  /**
   * Extract time from natural language
   * Supports: 4pm, 4:30 PM, 16:30, subah 4 baje, etc.
   */
  private extractTime(message: string): string | null {
    const normalizedMsg = message.toLowerCase();
    
    // Pattern 1: HH:MM AM/PM (allows optional space after colon)
    const ampmPattern = /(\d{1,2}):\s*(\d{2})\s*(am|pm|a\.m\.|p\.m\.)/i;
    const ampmMatch = message.match(ampmPattern);
    if (ampmMatch) {
      let [, hour, minute, period] = ampmMatch;
      let hourNum = parseInt(hour);
      if (period.toLowerCase().startsWith('p') && hourNum !== 12) {
        hourNum += 12;
      } else if (period.toLowerCase().startsWith('a') && hourNum === 12) {
        hourNum = 0;
      }
      return this.formatTime(hourNum, parseInt(minute));
    }
    
    // Pattern 2: H AM/PM (without minutes)
    const simpleAmpmPattern = /(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)/i;
    const simpleAmpmMatch = message.match(simpleAmpmPattern);
    if (simpleAmpmMatch) {
      let [, hour, period] = simpleAmpmMatch;
      let hourNum = parseInt(hour);
      if (period.toLowerCase().startsWith('p') && hourNum !== 12) {
        hourNum += 12;
      } else if (period.toLowerCase().startsWith('a') && hourNum === 12) {
        hourNum = 0;
      }
      return this.formatTime(hourNum, 0);
    }
    
    // Pattern 3: 24-hour format HH:MM (allows optional space after colon)
    const twentyFourPattern = /\b(\d{1,2}):\s*(\d{2})\b/;
    const twentyFourMatch = message.match(twentyFourPattern);
    if (twentyFourMatch) {
      const [, hour, minute] = twentyFourMatch;
      const hourNum = parseInt(hour);
      if (hourNum >= 0 && hourNum <= 23) {
        return this.formatTime(hourNum, parseInt(minute));
      }
    }
    
    // Pattern 4: Hindi time (subah 4 baje, raat 10 baje, dopahar 2 baje)
    const hindiTimePatterns = [
      { pattern: /subah\s*(\d{1,2})\s*(?:baje|bje)?/i, offset: 0 },      // Morning
      { pattern: /savere\s*(\d{1,2})\s*(?:baje|bje)?/i, offset: 0 },     // Morning
      { pattern: /dopahar\s*(\d{1,2})\s*(?:baje|bje)?/i, offset: 12 },   // Afternoon
      { pattern: /sham\s*(\d{1,2})\s*(?:baje|bje)?/i, offset: 12 },      // Evening
      { pattern: /shaam\s*(\d{1,2})\s*(?:baje|bje)?/i, offset: 12 },     // Evening
      { pattern: /raat\s*(\d{1,2})\s*(?:baje|bje)?/i, offset: 12 },      // Night
      { pattern: /(\d{1,2})\s*baje/i, offset: 0 },                        // Generic "baje"
    ];
    
    for (const { pattern, offset } of hindiTimePatterns) {
      const match = normalizedMsg.match(pattern);
      if (match) {
        let hourNum = parseInt(match[1]);
        // Apply offset for afternoon/evening/night
        if (offset > 0 && hourNum <= 12) {
          hourNum = hourNum === 12 ? 12 : hourNum + offset;
        }
        return this.formatTime(hourNum, 0);
      }
    }
    
    // Pattern 5: morning/afternoon/evening/night with hour
    const englishTimePatterns = [
      { pattern: /morning\s*(\d{1,2})(?::(\d{2}))?/i, offset: 0 },
      { pattern: /afternoon\s*(\d{1,2})(?::(\d{2}))?/i, offset: 12 },
      { pattern: /evening\s*(\d{1,2})(?::(\d{2}))?/i, offset: 12 },
      { pattern: /night\s*(\d{1,2})(?::(\d{2}))?/i, offset: 12 },
    ];
    
    for (const { pattern, offset } of englishTimePatterns) {
      const match = normalizedMsg.match(pattern);
      if (match) {
        let hourNum = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        if (offset > 0 && hourNum <= 12) {
          hourNum = hourNum === 12 ? 12 : hourNum + offset;
        }
        return this.formatTime(hourNum, minute);
      }
    }
    
    return null;
  }

  /**
   * Extract place name from message
   * Removes date/time patterns and common words
   */
  private extractPlace(message: string): string | null {
    let cleanedMsg = message;
    
    // Remove date patterns
    cleanedMsg = cleanedMsg.replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/g, '');
    cleanedMsg = cleanedMsg.replace(/\d{4}-\d{2}-\d{2}/g, '');
    cleanedMsg = cleanedMsg.replace(/\d{1,2}\s*(?:st|nd|rd|th)?\s*(?:of\s+)?[a-zA-Z]+\s*,?\s*\d{4}/gi, '');
    cleanedMsg = cleanedMsg.replace(/[a-zA-Z]+\s+\d{1,2}\s*,?\s*\d{4}/gi, '');
    cleanedMsg = cleanedMsg.replace(/\d{1,2}\s*[\u0900-\u097F]+\s*\d{4}/g, '');
    
    // Remove time patterns
    cleanedMsg = cleanedMsg.replace(/\d{1,2}:\d{2}\s*(?:am|pm|a\.m\.|p\.m\.)?/gi, '');
    cleanedMsg = cleanedMsg.replace(/\d{1,2}\s*(?:am|pm|a\.m\.|p\.m\.)/gi, '');
    cleanedMsg = cleanedMsg.replace(/(?:subah|savere|dopahar|sham|shaam|raat)\s*\d{1,2}\s*(?:baje|bje)?/gi, '');
    cleanedMsg = cleanedMsg.replace(/\d{1,2}\s*baje/gi, '');
    cleanedMsg = cleanedMsg.replace(/(?:morning|afternoon|evening|night)\s*\d{1,2}(?::\d{2})?/gi, '');
    
    // Remove common kundli-related words
    const removeWords = [
      'meri', 'mera', 'my', 'apni', 'apna',
      'kundli', 'kundali', 'janampatri', 'patrika', 'birth', 'chart', 'horoscope',
      'banao', 'banana', 'chahiye', 'create', 'generate', 'make', 'show',
      'janm', 'janam', 'born', 'birth', 'date', 'time', 'place',
      'ko', 'ka', 'ki', 'ke', 'mein', 'me', 'in', 'at', 'on',
      'tha', 'thi', 'the', 'hai', 'hain', 'was', 'is', 'were',
      'huya', 'huyi', 'hua', 'hui',
      'please', 'plz', 'pls', 'kripya',
    ];
    
    const wordPattern = new RegExp(`\\b(${removeWords.join('|')})\\b`, 'gi');
    cleanedMsg = cleanedMsg.replace(wordPattern, '');
    
    // Remove punctuation and extra spaces
    cleanedMsg = cleanedMsg.replace(/[,\.;:'"!?()]/g, ' ');
    cleanedMsg = cleanedMsg.replace(/\s+/g, ' ').trim();
    
    // What remains should be the place name
    if (cleanedMsg.length >= 2) {
      // Capitalize first letter of each word
      return cleanedMsg.split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    return null;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(day: number, month: number, year: number): string {
    const d = String(day).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  /**
   * Format time to HH:MM (24hr)
   */
  private formatTime(hour: number, minute: number): string {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    return `${h}:${m}`;
  }

  /**
   * Validate parsed birth details
   */
  validateBirthDetails(details: ParsedBirthDetails): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate date
    if (details.date) {
      const [year, month, day] = details.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (isNaN(date.getTime())) {
        errors.push('Invalid date format');
      } else {
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
          errors.push(`Year must be between 1900 and ${currentYear}`);
        }
        if (month < 1 || month > 12) {
          errors.push('Month must be between 1 and 12');
        }
        if (day < 1 || day > 31) {
          errors.push('Day must be between 1 and 31');
        }
        
        // Check if date is in future
        if (date > new Date()) {
          errors.push('Birth date cannot be in the future');
        }
      }
    }
    
    // Validate time
    if (details.time) {
      const [hour, minute] = details.time.split(':').map(Number);
      if (hour < 0 || hour > 23) {
        errors.push('Hour must be between 0 and 23');
      }
      if (minute < 0 || minute > 59) {
        errors.push('Minute must be between 0 and 59');
      }
    }
    
    // Validate place
    if (details.place) {
      if (details.place.length < 2) {
        warnings.push('Place name seems too short');
      }
      if (/\d/.test(details.place)) {
        warnings.push('Place name contains numbers');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate prompt to ask for missing birth details
   */
  generateMissingDetailsPrompt(
    missing: string[], 
    language: 'hindi' | 'english' | 'hinglish'
  ): string {
    const prompts: Record<string, Record<string, string>> = {
      date: {
        hindi: 'कृपया अपनी जन्म तारीख बताएं (जैसे: 15 अगस्त 1995)',
        english: 'Please share your birth date (e.g., 15 August 1995)',
        hinglish: 'Apni birth date batao (jaise: 15 August 1995)',
      },
      time: {
        hindi: 'कृपया अपना जन्म समय बताएं (जैसे: सुबह 4 बजे या 4:30 PM)',
        english: 'Please share your birth time (e.g., 4:30 AM or 16:30)',
        hinglish: 'Apna birth time batao (jaise: subah 4 baje ya 4:30 PM)',
      },
      place: {
        hindi: 'कृपया अपना जन्म स्थान बताएं (शहर का नाम)',
        english: 'Please share your birth place (city name)',
        hinglish: 'Apna birth place batao (city ka naam)',
      },
    };
    
    const missingPrompts = missing.map(field => prompts[field]?.[language] || prompts[field]?.['english']);
    
    if (language === 'hindi') {
      return `🔮 आपकी कुंडली बनाने के लिए मुझे कुछ जानकारी चाहिए:\n\n${missingPrompts.join('\n')}`;
    } else if (language === 'hinglish') {
      return `🔮 Aapki Kundli banane ke liye mujhe kuch details chahiye:\n\n${missingPrompts.join('\n')}`;
    } else {
      return `🔮 To create your Kundli, I need some information:\n\n${missingPrompts.join('\n')}`;
    }
  }

  /**
   * Check if message contains all birth details in one message
   */
  hasCompleteBirthDetails(message: string): boolean {
    const parsed = this.parseBirthDetails(message);
    return parsed.isComplete;
  }
}

// Export singleton
export const kundliParserService = new KundliParserService();
export default kundliParserService;