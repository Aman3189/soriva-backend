/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CONFLICT DETECTOR SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Updated: November 16, 2025 (Enhanced neutral correction detection)
 * Purpose: Intelligent detection of user complaints and conflict scenarios
 *
 * Features:
 * - Pattern-based conflict detection
 * - Intent classification (genuine/testing/playful)
 * - Severity assessment
 * - Multiple conflict type detection
 * - Enhanced neutral factual correction detection
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum ConflictType {
  TONE_COMPLAINT = 'tone_complaint', // "mai tera yaar nahi", "stop calling me bro"
  FACTUAL_CORRECTION = 'factual_correction', // "this is wrong", "incorrect answer"
  STYLE_ADJUSTMENT = 'style_adjustment', // "be more casual", "stop being formal"
  IDENTITY_CHALLENGE = 'identity_challenge', // "are you ChatGPT?", "which model"
  HELPFULNESS_COMPLAINT = 'helpfulness_complaint', // "not helpful", "useless"
  NONE = 'none',
}

export enum UserIntent {
  GENUINE = 'genuine', // Actually upset/frustrated
  TESTING = 'testing', // Testing AI boundaries
  PLAYFUL = 'playful', // Light-hearted correction
}

export enum ConflictSeverity {
  LOW = 'low', // Minor correction
  MEDIUM = 'medium', // Clear complaint
  HIGH = 'high', // Strong frustration
}

export interface ConflictAnalysis {
  hasConflict: boolean;
  type: ConflictType;
  severity: ConflictSeverity;
  userIntent: UserIntent;
  confidence: number; // 0-1
  matchedPatterns: string[];
  suggestedAction: 'acknowledge' | 'ask_preference' | 'adjust_immediately' | 'deflect';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DETECTION PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ConflictPattern {
  type: ConflictType;
  patterns: RegExp[];
  keywords: string[];
  severity: ConflictSeverity;
  intent: UserIntent;
}

const CONFLICT_PATTERNS: ConflictPattern[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TONE COMPLAINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    type: ConflictType.TONE_COMPLAINT,
    patterns: [
      /mai.*tera.*yaar.*nahi/i,
      /don't call me (yaar|bro|dude|buddy)/i,
      /stop calling me/i,
      /(kyu|why) (bol raha|calling|saying)/i,
      /don't be so (casual|informal)/i,
      /too (casual|friendly)/i,
    ],
    keywords: ['yaar nahi', 'bro nahi', "don't call", 'stop calling', 'too casual'],
    severity: ConflictSeverity.MEDIUM,
    intent: UserIntent.GENUINE,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STYLE ADJUSTMENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    type: ConflictType.STYLE_ADJUSTMENT,
    patterns: [
      /(stop|don't) be (so )?(formal|serious)/i,
      /be more (casual|chill|relaxed)/i,
      /(itna|too much) formal/i,
      /chill (kar|karo|out)/i,
      /lighten up/i,
    ],
    keywords: ['too formal', 'be casual', 'chill kar', 'lighten up', 'stop being formal'],
    severity: ConflictSeverity.LOW,
    intent: UserIntent.PLAYFUL,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FACTUAL CORRECTIONS (ENHANCED!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    type: ConflictType.FACTUAL_CORRECTION,
    patterns: [
      // Complaint-based corrections
      /(this|that|your answer) is (completely )?(wrong|incorrect)/i,
      /(no|nahi),? (that's|this is) (not|wrong)/i,
      /you('re| are) wrong/i,
      /incorrect (answer|information)/i,
      /this doesn't make sense/i,
      /galat (hai|answer|baat)/i,
      
      // ⭐ NEW: Neutral correction patterns (structural)
      /(.+)\s+(nahi|nahin),?\s+(.+)\s+(hai|mein|me|pe|par)/i,  // "X nahi, Y hai"
      /(.+)\s+(mein|me|in)\s+(nahi|nahin)\s+(hai)?[,\s]+(.+)\s+(mein|me|in)\s+hai/i, // "X mein nahi, Y mein hai"
      /not\s+(.+),?\s+(.+)/i,                                   // "not X, Y"
      /(.+)\s+is\s+in\s+(.+),?\s+not\s+(in\s+)?(.+)/i,         // "X is in Y, not Z"
      /^(nahi|nahin|no),?\s+(.+)/i,                            // Starting with "nahi"
      /actually\s+(.+)\s+(hai|mein|me|in|is)/i,                // "actually X hai"
      /(.+)\s+(hai|is),?\s+(not|nahi|nahin)\s+(.+)/i,          // "X hai, not Y"
    ],
    keywords: [
      'is wrong', 
      'incorrect', 
      "you're wrong", 
      'galat hai', 
      "doesn't make sense",
      'nahi hai',      // ⭐ NEW
      'mein nahi',     // ⭐ NEW
      'not in',        // ⭐ NEW
      'actually',      // ⭐ NEW
    ],
    severity: ConflictSeverity.LOW, // ⭐ Changed to LOW for neutral corrections
    intent: UserIntent.GENUINE,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPFULNESS COMPLAINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    type: ConflictType.HELPFULNESS_COMPLAINT,
    patterns: [
      /you('re| are) not (helpful|useful)/i,
      /(not|koi) help(ful)? (nahi|at all)/i,
      /(useless|waste|bekar)/i,
      /can't help me/i,
      /this (doesn't|won't) help/i,
    ],
    keywords: ['not helpful', 'useless', 'bekar', "can't help", "won't help"],
    severity: ConflictSeverity.HIGH,
    intent: UserIntent.GENUINE,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDENTITY CHALLENGES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    type: ConflictType.IDENTITY_CHALLENGE,
    patterns: [
      /are you (chatgpt|gpt|claude|gemini|llama)/i,
      /which (model|ai|llm)/i,
      /(powered by|using) (chatgpt|claude|gemini)/i,
      /you('re| are) just (an )?(ai|bot|chatbot)/i,
      /reveal (your|the) (model|system|prompt)/i,
    ],
    keywords: ['are you chatgpt', 'which model', 'just an ai', 'powered by', 'reveal'],
    severity: ConflictSeverity.LOW,
    intent: UserIntent.TESTING,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTENSITY INDICATORS (for severity adjustment)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const INTENSITY_MARKERS = {
  high: [
    'completely',
    'totally',
    'absolutely',
    'extremely',
    'very',
    'so much',
    'really',
    '!!!',
    'wtf',
    'seriously',
  ],
  caps: /[A-Z]{3,}/, // ALL CAPS indicates strong emotion
  exclamation: /!{2,}/, // Multiple exclamation marks
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFLICT DETECTOR SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class ConflictDetectorService {
  /**
   * Main analysis method - detects conflicts in user message
   */
  public analyze(userMessage: string): ConflictAnalysis {
    const normalizedMessage = userMessage.toLowerCase().trim();

    // Check all patterns
    const matches = this.findMatches(normalizedMessage, userMessage);

    // No conflict detected
    if (matches.length === 0) {
      return this.createNoConflictResult();
    }

    // Get best match (highest confidence)
    const bestMatch = this.selectBestMatch(matches);

    // Adjust severity based on intensity
    const adjustedSeverity = this.adjustSeverity(
      bestMatch.severity,
      userMessage,
      normalizedMessage
    );

    // Determine suggested action
    const suggestedAction = this.determineSuggestedAction(bestMatch.type, adjustedSeverity);

    return {
      hasConflict: true,
      type: bestMatch.type,
      severity: adjustedSeverity,
      userIntent: bestMatch.intent,
      confidence: bestMatch.confidence,
      matchedPatterns: bestMatch.matchedPatterns,
      suggestedAction,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIVATE METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private findMatches(
    normalizedMessage: string,
    originalMessage: string
  ): Array<{
    type: ConflictType;
    severity: ConflictSeverity;
    intent: UserIntent;
    confidence: number;
    matchedPatterns: string[];
  }> {
    const matches: Array<any> = [];

    for (const pattern of CONFLICT_PATTERNS) {
      let matchCount = 0;
      const matchedPatterns: string[] = [];

      // Check regex patterns
      for (const regex of pattern.patterns) {
        if (regex.test(originalMessage)) {
          matchCount++;
          matchedPatterns.push(regex.source);
        }
      }

      // Check keywords
      for (const keyword of pattern.keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          matchCount += 0.5; // Keywords have less weight than patterns
          matchedPatterns.push(keyword);
        }
      }

      // If matches found, calculate confidence
      if (matchCount > 0) {
        const confidence = Math.min(matchCount / pattern.patterns.length, 1);

        matches.push({
          type: pattern.type,
          severity: pattern.severity,
          intent: pattern.intent,
          confidence,
          matchedPatterns,
        });
      }
    }

    return matches;
  }

  private selectBestMatch(matches: any[]): any {
    // Sort by confidence (highest first)
    return matches.sort((a, b) => b.confidence - a.confidence)[0];
  }

  private adjustSeverity(
    baseSeverity: ConflictSeverity,
    originalMessage: string,
    normalizedMessage: string
  ): ConflictSeverity {
    let adjustmentScore = 0;

    // Check for intensity markers
    for (const marker of INTENSITY_MARKERS.high) {
      if (normalizedMessage.includes(marker)) {
        adjustmentScore += 0.3;
      }
    }

    // Check for ALL CAPS
    if (INTENSITY_MARKERS.caps.test(originalMessage)) {
      adjustmentScore += 0.5;
    }

    // Check for multiple exclamation marks
    if (INTENSITY_MARKERS.exclamation.test(originalMessage)) {
      adjustmentScore += 0.4;
    }

    // Adjust severity based on score
    if (adjustmentScore >= 0.7) {
      // Upgrade severity
      if (baseSeverity === ConflictSeverity.LOW) return ConflictSeverity.MEDIUM;
      if (baseSeverity === ConflictSeverity.MEDIUM) return ConflictSeverity.HIGH;
    }

    return baseSeverity;
  }

  private determineSuggestedAction(
    type: ConflictType,
    severity: ConflictSeverity
  ): 'acknowledge' | 'ask_preference' | 'adjust_immediately' | 'deflect' {
    // Identity challenges → deflect
    if (type === ConflictType.IDENTITY_CHALLENGE) {
      return 'deflect';
    }

    // Tone complaints → ask preference
    if (type === ConflictType.TONE_COMPLAINT) {
      return 'ask_preference';
    }

    // Style adjustments → adjust immediately
    if (type === ConflictType.STYLE_ADJUSTMENT) {
      return 'adjust_immediately';
    }

    // Factual corrections → acknowledge and fix
    if (type === ConflictType.FACTUAL_CORRECTION) {
      return 'acknowledge';
    }

    // High severity helpfulness complaints → ask what they need
    if (type === ConflictType.HELPFULNESS_COMPLAINT && severity === ConflictSeverity.HIGH) {
      return 'ask_preference';
    }

    // Default
    return 'acknowledge';
  }

  private createNoConflictResult(): ConflictAnalysis {
    return {
      hasConflict: false,
      type: ConflictType.NONE,
      severity: ConflictSeverity.LOW,
      userIntent: UserIntent.GENUINE,
      confidence: 0,
      matchedPatterns: [],
      suggestedAction: 'acknowledge',
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS (for testing/debugging)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get all available conflict types
   */
  public getAvailableConflictTypes(): ConflictType[] {
    return Object.values(ConflictType);
  }

  /**
   * Test a message against a specific conflict type
   */
  public testAgainstType(message: string, type: ConflictType): boolean {
    const pattern = CONFLICT_PATTERNS.find((p) => p.type === type);
    if (!pattern) return false;

    return pattern.patterns.some((regex) => regex.test(message));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const conflictDetector = new ConflictDetectorService();