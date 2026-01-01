// src/core/ai/prompts/intent-classifier.ts
// ============================================================================
// SORIVA INTENT CLASSIFIER v1.1 - January 2026
// ============================================================================
// Purpose: Detect user intent (STUDENT vs EVERYDAY) for plan-based behavior
// Method: Lightweight keyword-based (no LLM call, ~0 tokens)
// Usage: Add delta modifier to system prompt based on intent
// 
// v1.1 Updates:
// - Student bias rule (academic intent gets priority)
// - Session lock hint (shouldLock for high confidence)
// - Keyword limit warnings (performance check)
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type IntentType = 'STUDENT' | 'EVERYDAY' | 'NEUTRAL';

export interface IntentResult {
  intent: IntentType;
  confidence: number; // 0-100
  matchedKeywords: string[];
  deltaPrompt: string;
  shouldLock: boolean; // Hint: Lock intent in session if true (confidence >= 70)
  metadata: {
    studentScore: number;
    everydayScore: number;
    processingTimeMs: number;
    biasApplied: boolean; // True if student bias rule was applied
  };
}

export interface ClassifierOptions {
  minConfidence?: number; // Minimum confidence to assign intent (default: 30)
  caseSensitive?: boolean; // Case sensitive matching (default: false)
  returnNeutralOnTie?: boolean; // Return NEUTRAL if scores are equal (default: true)
  studentBiasEnabled?: boolean; // Enable student bias rule (default: true)
}

// ============================================================================
// KEYWORD DEFINITIONS
// ============================================================================

/**
 * STUDENT intent keywords
 * Academic, learning, study-related terms
 */
const STUDENT_KEYWORDS = {
  // High weight (3 points)
  high: [
    'exam', 'exams', 'homework', 'assignment', 'syllabus', 'curriculum',
    'jee', 'neet', 'upsc', 'gate', 'cat', 'gmat', 'gre', 'ielts', 'toefl',
    'board exam', 'entrance', 'competitive', 'olympiad',
    'derivation', 'derivations', 'proof', 'proofs', 'theorem', 'theorems',
    'ncert', 'cbse', 'icse', 'igcse', 'ib board',
    'semester', 'finals', 'midterm', 'viva', 'practical',
  ],

  // Medium weight (2 points)
  medium: [
    'study', 'studies', 'studying', 'learn', 'learning', 'learnt',
    'explain', 'explanation', 'concept', 'concepts', 'understand', 'understanding',
    'chapter', 'chapters', 'lesson', 'lessons', 'topic', 'topics',
    'formula', 'formulas', 'equation', 'equations', 'solve', 'solving', 'solution',
    'class', 'classes', 'grade', 'grades', 'school', 'college', 'university',
    'teacher', 'professor', 'tutor', 'coaching',
    'notes', 'revision', 'revise', 'practice', 'worksheet',
    'textbook', 'reference', 'question paper', 'sample paper',
    'doubt', 'doubts', 'clarify', 'clarification',
  ],

  // Low weight (1 point)
  low: [
    'physics', 'chemistry', 'biology', 'mathematics', 'maths', 'math',
    'history', 'geography', 'economics', 'political science', 'sociology',
    'english', 'hindi', 'sanskrit', 'literature',
    'science', 'commerce', 'arts', 'humanities',
    'computer science', 'programming', 'coding',
    'accounting', 'statistics', 'calculus', 'algebra', 'geometry', 'trigonometry',
    'organic', 'inorganic', 'physical chemistry',
    'mechanics', 'thermodynamics', 'electromagnetism', 'optics',
    'botany', 'zoology', 'ecology', 'genetics',
    'diagram', 'graph', 'table', 'chart',
    'definition', 'example', 'examples',
  ],
};

/**
 * EVERYDAY intent keywords
 * Casual, lifestyle, entertainment, general queries
 */
const EVERYDAY_KEYWORDS = {
  // High weight (3 points)
  high: [
    'recipe', 'recipes', 'cook', 'cooking', 'bake', 'baking',
    'movie', 'movies', 'film', 'films', 'netflix', 'amazon prime', 'hotstar',
    'song', 'songs', 'music', 'playlist', 'spotify',
    'game', 'games', 'gaming', 'pubg', 'valorant', 'minecraft',
    'travel', 'trip', 'vacation', 'holiday', 'tourist', 'booking',
    'joke', 'jokes', 'funny', 'meme', 'memes',
    'gossip', 'celebrity', 'bollywood', 'hollywood',
  ],

  // Medium weight (2 points)
  medium: [
    'weather', 'temperature', 'forecast',
    'news', 'headlines', 'trending',
    'restaurant', 'food', 'eat', 'eating', 'dinner', 'lunch', 'breakfast',
    'shop', 'shopping', 'buy', 'buying', 'purchase', 'amazon', 'flipkart',
    'recommend', 'recommendation', 'suggest', 'suggestion',
    'best', 'top', 'review', 'reviews', 'rating',
    'price', 'cost', 'cheap', 'expensive', 'budget',
    'gym', 'workout', 'fitness', 'exercise', 'yoga',
    'fashion', 'style', 'outfit', 'clothes', 'dress',
    'dating', 'relationship', 'love', 'marriage',
    'party', 'birthday', 'celebration', 'festival',
  ],

  // Low weight (1 point)
  low: [
    'hi', 'hello', 'hey', 'sup', 'wassup',
    'good morning', 'good night', 'good evening',
    'how are you', 'whats up', 'kya haal',
    'thanks', 'thank you', 'dhanyawad', 'shukriya',
    'bye', 'goodbye', 'see you', 'later',
    'ok', 'okay', 'alright', 'fine', 'cool',
    'yes', 'no', 'maybe', 'sure',
    'please', 'help', 'can you', 'could you',
    'what', 'why', 'how', 'when', 'where', 'who',
    'tell me', 'show me', 'give me',
    'random', 'anything', 'something', 'whatever',
    'bored', 'boring', 'timepass', 'fun',
  ],
};

/**
 * STUDENT intent delta prompt
 * Added when STUDENT intent detected
 */
const STUDENT_DELTA = `This is a learning-related question.
Guide the user step-by-step.
Avoid giving the final answer directly.
Encourage thinking and understanding.`;

/**
 * EVERYDAY intent delta prompt
 * Added when EVERYDAY intent detected
 */
const EVERYDAY_DELTA = `This is an everyday, non-academic query.
Answer directly and practically.
Do not over-explain.
Be conversational and helpful.`;

/**
 * NEUTRAL delta prompt
 * When intent is unclear
 */
const NEUTRAL_DELTA = `Respond naturally based on the question.
Be helpful and concise.`;

// ============================================================================
// INTENT CLASSIFIER CLASS
// ============================================================================

class IntentClassifier {
  private defaultOptions: ClassifierOptions = {
    minConfidence: 30,
    caseSensitive: false,
    returnNeutralOnTie: true,
    studentBiasEnabled: true,
  };

  /**
   * Constructor - validates keyword limits
   */
  constructor() {
    this.validateKeywordLimits();
  }

  /**
   * Validate keyword list sizes for performance
   */
  private validateKeywordLimits(): void {
    const MAX_HIGH_KEYWORDS = 80;
    const MAX_MEDIUM_KEYWORDS = 100;
    const MAX_LOW_KEYWORDS = 150;

    // Student keywords check
    if (STUDENT_KEYWORDS.high.length > MAX_HIGH_KEYWORDS) {
      console.warn(
        `[IntentClassifier] ⚠️ STUDENT high keywords too large: ${STUDENT_KEYWORDS.high.length}/${MAX_HIGH_KEYWORDS}`
      );
    }
    if (STUDENT_KEYWORDS.medium.length > MAX_MEDIUM_KEYWORDS) {
      console.warn(
        `[IntentClassifier] ⚠️ STUDENT medium keywords too large: ${STUDENT_KEYWORDS.medium.length}/${MAX_MEDIUM_KEYWORDS}`
      );
    }
    if (STUDENT_KEYWORDS.low.length > MAX_LOW_KEYWORDS) {
      console.warn(
        `[IntentClassifier] ⚠️ STUDENT low keywords too large: ${STUDENT_KEYWORDS.low.length}/${MAX_LOW_KEYWORDS}`
      );
    }

    // Everyday keywords check
    if (EVERYDAY_KEYWORDS.high.length > MAX_HIGH_KEYWORDS) {
      console.warn(
        `[IntentClassifier] ⚠️ EVERYDAY high keywords too large: ${EVERYDAY_KEYWORDS.high.length}/${MAX_HIGH_KEYWORDS}`
      );
    }
    if (EVERYDAY_KEYWORDS.medium.length > MAX_MEDIUM_KEYWORDS) {
      console.warn(
        `[IntentClassifier] ⚠️ EVERYDAY medium keywords too large: ${EVERYDAY_KEYWORDS.medium.length}/${MAX_MEDIUM_KEYWORDS}`
      );
    }
    if (EVERYDAY_KEYWORDS.low.length > MAX_LOW_KEYWORDS) {
      console.warn(
        `[IntentClassifier] ⚠️ EVERYDAY low keywords too large: ${EVERYDAY_KEYWORDS.low.length}/${MAX_LOW_KEYWORDS}`
      );
    }

    console.log('[IntentClassifier] ✅ Initialized with keyword validation');
  }

  /**
   * Classify user message intent
   * @param message - User's message
   * @param options - Classifier options
   * @returns IntentResult with intent type and delta prompt
   *
   * @example
   * const result = classifier.classify('Explain photosynthesis for my exam');
   * // { intent: 'STUDENT', confidence: 85, shouldLock: true, deltaPrompt: '...' }
   */
  public classify(message: string, options?: ClassifierOptions): IntentResult {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    // Normalize message
    const normalizedMessage = opts.caseSensitive
      ? message
      : message.toLowerCase();

    // Calculate scores
    const studentScore = this.calculateScore(normalizedMessage, STUDENT_KEYWORDS);
    const everydayScore = this.calculateScore(normalizedMessage, EVERYDAY_KEYWORDS);

    // Get matched keywords for debugging
    const studentMatches = this.getMatchedKeywords(normalizedMessage, STUDENT_KEYWORDS);
    const everydayMatches = this.getMatchedKeywords(normalizedMessage, EVERYDAY_KEYWORDS);

    // Determine intent
    const { intent, confidence, biasApplied } = this.determineIntent(
      studentScore,
      everydayScore,
      opts
    );

    // Get appropriate delta prompt
    const deltaPrompt = this.getDeltaPrompt(intent);

    // Determine if session should lock this intent
    const shouldLock = confidence >= 70;

    const processingTime = Date.now() - startTime;

    return {
      intent,
      confidence,
      matchedKeywords: intent === 'STUDENT' ? studentMatches : everydayMatches,
      deltaPrompt,
      shouldLock,
      metadata: {
        studentScore,
        everydayScore,
        processingTimeMs: processingTime,
        biasApplied,
      },
    };
  }

  /**
   * Quick classify - returns just intent type
   * @param message - User's message
   * @returns IntentType
   */
  public quickClassify(message: string): IntentType {
    return this.classify(message).intent;
  }

  /**
   * Get delta prompt for intent
   * @param intent - Intent type
   * @returns Delta prompt string
   */
  public getDeltaPrompt(intent: IntentType): string {
    switch (intent) {
      case 'STUDENT':
        return STUDENT_DELTA;
      case 'EVERYDAY':
        return EVERYDAY_DELTA;
      default:
        return NEUTRAL_DELTA;
    }
  }

  /**
   * Check if message is academic/study related
   * @param message - User's message
   * @returns boolean
   */
  public isAcademic(message: string): boolean {
    const result = this.classify(message);
    return result.intent === 'STUDENT' && result.confidence >= 50;
  }

  /**
   * Calculate score for keyword category
   */
  private calculateScore(
    message: string,
    keywords: { high: string[]; medium: string[]; low: string[] }
  ): number {
    let score = 0;

    // High weight keywords (3 points each)
    for (const keyword of keywords.high) {
      if (this.containsKeyword(message, keyword)) {
        score += 3;
      }
    }

    // Medium weight keywords (2 points each)
    for (const keyword of keywords.medium) {
      if (this.containsKeyword(message, keyword)) {
        score += 2;
      }
    }

    // Low weight keywords (1 point each)
    for (const keyword of keywords.low) {
      if (this.containsKeyword(message, keyword)) {
        score += 1;
      }
    }

    return score;
  }

  /**
   * Get matched keywords for debugging
   */
  private getMatchedKeywords(
    message: string,
    keywords: { high: string[]; medium: string[]; low: string[] }
  ): string[] {
    const matches: string[] = [];

    const allKeywords = [...keywords.high, ...keywords.medium, ...keywords.low];

    for (const keyword of allKeywords) {
      if (this.containsKeyword(message, keyword)) {
        matches.push(keyword);
      }
    }

    return matches;
  }

  /**
   * Check if message contains keyword (word boundary aware)
   */
  private containsKeyword(message: string, keyword: string): boolean {
    // For multi-word keywords, check direct inclusion
    if (keyword.includes(' ')) {
      return message.includes(keyword.toLowerCase());
    }

    // For single words, use word boundary regex
    const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'i');
    return regex.test(message);
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Determine final intent from scores
   * Includes student bias rule for academic priority
   */
  private determineIntent(
    studentScore: number,
    everydayScore: number,
    options: ClassifierOptions
  ): { intent: IntentType; confidence: number; biasApplied: boolean } {
    const totalScore = studentScore + everydayScore;
    let biasApplied = false;

    // No keywords matched
    if (totalScore === 0) {
      return { intent: 'NEUTRAL', confidence: 0, biasApplied: false };
    }

    // Calculate confidence as percentage of dominant score
    const maxScore = Math.max(studentScore, everydayScore);
    let confidence = Math.round((maxScore / (totalScore + 5)) * 100);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STUDENT BIAS RULE (Academic intent gets priority)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // If student score is 1.5x everyday AND student score >= 4
    // → Force STUDENT intent (helps borderline academic queries)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (
      options.studentBiasEnabled &&
      studentScore >= everydayScore * 1.5 &&
      studentScore >= 4
    ) {
      biasApplied = true;
      // Boost confidence to at least 60% when bias is applied
      confidence = Math.max(confidence, 60);
      return { intent: 'STUDENT', confidence, biasApplied };
    }

    // Check for tie
    if (studentScore === everydayScore && options.returnNeutralOnTie) {
      return { intent: 'NEUTRAL', confidence: 50, biasApplied: false };
    }

    // Below minimum confidence
    if (confidence < (options.minConfidence || 30)) {
      return { intent: 'NEUTRAL', confidence, biasApplied: false };
    }

    // Determine winner
    if (studentScore > everydayScore) {
      return { intent: 'STUDENT', confidence, biasApplied: false };
    }

    return { intent: 'EVERYDAY', confidence, biasApplied: false };
  }

  /**
   * Add custom keywords (runtime)
   * @param intent - STUDENT or EVERYDAY
   * @param weight - high, medium, or low
   * @param keywords - Array of keywords to add
   */
  public addCustomKeywords(
    intent: 'STUDENT' | 'EVERYDAY',
    weight: 'high' | 'medium' | 'low',
    keywords: string[]
  ): void {
    const targetKeywords =
      intent === 'STUDENT' ? STUDENT_KEYWORDS : EVERYDAY_KEYWORDS;

    targetKeywords[weight].push(...keywords);

    console.log(
      `[IntentClassifier] ➕ Added ${keywords.length} ${weight} keywords to ${intent}`
    );

    // Re-validate after adding
    this.validateKeywordLimits();
  }

  /**
   * Remove keywords (runtime)
   * @param intent - STUDENT or EVERYDAY
   * @param weight - high, medium, or low
   * @param keywords - Array of keywords to remove
   */
  public removeKeywords(
    intent: 'STUDENT' | 'EVERYDAY',
    weight: 'high' | 'medium' | 'low',
    keywords: string[]
  ): void {
    const targetKeywords =
      intent === 'STUDENT' ? STUDENT_KEYWORDS : EVERYDAY_KEYWORDS;

    const lowercaseKeywords = keywords.map((k) => k.toLowerCase());

    targetKeywords[weight] = targetKeywords[weight].filter(
      (k) => !lowercaseKeywords.includes(k.toLowerCase())
    );

    console.log(
      `[IntentClassifier] ➖ Removed ${keywords.length} ${weight} keywords from ${intent}`
    );
  }

  /**
   * Get all keywords (for debugging/admin)
   */
  public getKeywords(): {
    student: typeof STUDENT_KEYWORDS;
    everyday: typeof EVERYDAY_KEYWORDS;
  } {
    return {
      student: STUDENT_KEYWORDS,
      everyday: EVERYDAY_KEYWORDS,
    };
  }

  /**
   * Get statistics
   */
  public getStats(): {
    studentKeywords: { high: number; medium: number; low: number; total: number };
    everydayKeywords: { high: number; medium: number; low: number; total: number };
    limits: { maxHigh: number; maxMedium: number; maxLow: number };
  } {
    return {
      studentKeywords: {
        high: STUDENT_KEYWORDS.high.length,
        medium: STUDENT_KEYWORDS.medium.length,
        low: STUDENT_KEYWORDS.low.length,
        total:
          STUDENT_KEYWORDS.high.length +
          STUDENT_KEYWORDS.medium.length +
          STUDENT_KEYWORDS.low.length,
      },
      everydayKeywords: {
        high: EVERYDAY_KEYWORDS.high.length,
        medium: EVERYDAY_KEYWORDS.medium.length,
        low: EVERYDAY_KEYWORDS.low.length,
        total:
          EVERYDAY_KEYWORDS.high.length +
          EVERYDAY_KEYWORDS.medium.length +
          EVERYDAY_KEYWORDS.low.length,
      },
      limits: {
        maxHigh: 80,
        maxMedium: 100,
        maxLow: 150,
      },
    };
  }

  /**
   * Health check
   */
  public healthCheck(): {
    status: 'healthy' | 'warning' | 'error';
    checks: Record<string, boolean>;
    message: string;
  } {
    const checks = {
      studentKeywordsValid:
        STUDENT_KEYWORDS.high.length > 0 &&
        STUDENT_KEYWORDS.medium.length > 0,
      everydayKeywordsValid:
        EVERYDAY_KEYWORDS.high.length > 0 &&
        EVERYDAY_KEYWORDS.medium.length > 0,
      studentKeywordsWithinLimits:
        STUDENT_KEYWORDS.high.length <= 80 &&
        STUDENT_KEYWORDS.medium.length <= 100,
      everydayKeywordsWithinLimits:
        EVERYDAY_KEYWORDS.high.length <= 80 &&
        EVERYDAY_KEYWORDS.medium.length <= 100,
    };

    const allPassed = Object.values(checks).every((v) => v);
    const somePassed = Object.values(checks).some((v) => v);

    return {
      status: allPassed ? 'healthy' : somePassed ? 'warning' : 'error',
      checks,
      message: allPassed
        ? 'Intent classifier is healthy'
        : 'Some checks failed - review keyword limits',
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE & EXPORTS
// ============================================================================

const intentClassifier = new IntentClassifier();

export default intentClassifier;
export { IntentClassifier };

// Convenience functions
export function classifyIntent(message: string): IntentResult {
  return intentClassifier.classify(message);
}

export function getIntentDelta(message: string): string {
  return intentClassifier.classify(message).deltaPrompt;
}

export function isStudentIntent(message: string): boolean {
  return intentClassifier.quickClassify(message) === 'STUDENT';
}

export function isEverydayIntent(message: string): boolean {
  return intentClassifier.quickClassify(message) === 'EVERYDAY';
}

export function shouldLockIntent(message: string): boolean {
  return intentClassifier.classify(message).shouldLock;
}