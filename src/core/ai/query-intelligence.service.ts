// ============================================================================
// SORIVA QUERY INTELLIGENCE SERVICE v1.0.0
// ============================================================================
// Location: src/core/ai/query-intelligence.service.ts
// Purpose: Smart query understanding before LLM call
// 
// Features:
// - Ambiguity Detection (HIGH/MEDIUM/LOW/NONE)
// - Complexity Detection (SIMPLE/MODERATE/COMPLEX)
// - Context Awareness (previous messages)
// - Clarification Questions (when needed)
// - Statistical-first (fast), LLM fallback (accurate)
//
// Created by: Amandeep, Punjab, India
// ============================================================================

import { PlanType } from '../../constants/plans';

// ============================================================================
// TYPES
// ============================================================================

export type AmbiguityLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type ComplexityLevel = 'SIMPLE' | 'MODERATE' | 'COMPLEX';
export type QueryCategory = 
  | 'TECHNICAL' 
  | 'GENERAL' 
  | 'PERSONAL' 
  | 'CREATIVE' 
  | 'FACTUAL'
  | 'DECISION'
  | 'FOLLOWUP'
  | 'AMBIGUOUS';

export interface QueryAnalysis {
  // Core analysis
  originalQuery: string;
  normalizedQuery: string;
  
  // Intelligence results
  ambiguity: {
    level: AmbiguityLevel;
    reasons: string[];
    possibleIntents: string[];
  };
  
  complexity: {
    level: ComplexityLevel;
    factors: string[];
  };
  
  category: QueryCategory;
  
  // Context signals
  context: {
    isFollowUp: boolean;
    requiresContext: boolean;
    detectedTopic: string | null;
    relatedKeywords: string[];
  };
  
  // Action recommendations
  action: {
    needsClarification: boolean;
    clarificationQuestion: string | null;
    suggestedApproach: string;
  };
  
  // Metadata
  confidence: number;
  processingTimeMs: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface QueryIntelligenceConfig {
  enableAmbiguityCheck: boolean;
  enableComplexityCheck: boolean;
  enableContextCheck: boolean;
  maxContextMessages: number;
  ambiguityThreshold: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: QueryIntelligenceConfig = {
  enableAmbiguityCheck: true,
  enableComplexityCheck: true,
  enableContextCheck: true,
  maxContextMessages: 5,
  ambiguityThreshold: 0.6,
};

// ============================================================================
// AMBIGUOUS TERMS DATABASE
// ============================================================================

const AMBIGUOUS_TERMS: Record<string, string[]> = {
  // Tech vs General
  'border': ['CSS border (tech)', 'India-Pakistan border (geo)', 'Border movie (entertainment)'],
  'python': ['Python language (tech)', 'Python snake (animal)'],
  'java': ['Java language (tech)', 'Java island (place)', 'Java coffee (food)'],
  'apple': ['Apple company (tech)', 'Apple fruit (food)'],
  'cell': ['Cell phone (tech)', 'Cell biology (science)', 'Prison cell (general)'],
  'bug': ['Software bug (tech)', 'Insect bug (animal)'],
  'cloud': ['Cloud computing (tech)', 'Weather cloud (nature)'],
  'tablet': ['Tablet device (tech)', 'Medicine tablet (health)'],
  'mouse': ['Computer mouse (tech)', 'Animal mouse (animal)'],
  'virus': ['Computer virus (tech)', 'Biological virus (health)'],
  'server': ['Computer server (tech)', 'Restaurant server (job)'],
  'cookie': ['Browser cookie (tech)', 'Food cookie (food)'],
  'spam': ['Email spam (tech)', 'Spam food (food)'],
  'stream': ['Data stream (tech)', 'Water stream (nature)', 'Streaming video (entertainment)'],
  
  // Hindi/Hinglish ambiguous
  'bank': ['Bank (finance)', 'River bank (nature)'],
  'film': ['Movie film (entertainment)', 'Plastic film (material)'],
  'light': ['Light (physics)', 'Light weight (property)', 'Traffic light (object)'],
  'book': ['Book (reading)', 'Book ticket (action)'],
  'train': ['Train (vehicle)', 'Train/practice (action)'],
  'match': ['Match (sports)', 'Match (fire)', 'Match (compare)'],
  'plant': ['Plant (nature)', 'Factory plant (industry)'],
  'bat': ['Cricket bat (sports)', 'Bat animal (animal)'],
  'nail': ['Finger nail (body)', 'Metal nail (tool)'],
  'date': ['Calendar date (time)', 'Romantic date (relationship)', 'Date fruit (food)'],
  'ring': ['Finger ring (jewelry)', 'Phone ring (action)', 'Boxing ring (sports)'],
  'seal': ['Animal seal (animal)', 'Seal/stamp (object)', 'Seal/close (action)'],
  'wave': ['Hand wave (action)', 'Ocean wave (nature)', 'Sound wave (physics)'],
  'trunk': ['Elephant trunk (animal)', 'Car trunk (vehicle)', 'Tree trunk (nature)'],
  'bark': ['Dog bark (animal)', 'Tree bark (nature)'],
  'saw': ['Saw tool (tool)', 'Saw/see past tense (action)'],
  
  // Common short queries
  'uska': ['Reference to previous topic - needs context'],
  'iska': ['Reference to previous topic - needs context'],
  'woh': ['Reference to previous topic - needs context'],
  'ye': ['Reference to current topic - needs context'],
  'kaisa': ['Needs subject - what/who?'],
  'kab': ['Needs subject - what event?'],
  'kahan': ['Needs subject - what place?'],
};

// ============================================================================
// COMPLEXITY INDICATORS
// ============================================================================

const COMPLEXITY_INDICATORS = {
  simple: {
    maxWords: 8,
    patterns: [
      /^(hi|hello|hey|hola|namaste)/i,
      /^(thanks|thank you|shukriya|dhanyavaad)/i,
      /^(ok|okay|theek|acha|haan|nahi|yes|no)/i,
      /^(bye|goodbye|alvida)/i,
      /^what is \w+\??$/i,
      /^kya hai \w+\??$/i,
    ],
  },
  complex: {
    minWords: 25,
    patterns: [
      /compare|vs|versus|difference between/i,
      /analyze|analyse|evaluation|assessment/i,
      /step.?by.?step|detailed|comprehensive/i,
      /multiple|several|various|different ways/i,
      /pros and cons|advantages and disadvantages/i,
      /explain.*how.*and.*why/i,
      /code.*with.*example.*and.*explanation/i,
    ],
    keywords: [
      'architecture', 'implementation', 'optimization', 'strategy',
      'algorithm', 'framework', 'integration', 'deployment',
      'scalability', 'performance', 'security', 'authentication',
    ],
  },
};

// ============================================================================
// FOLLOW-UP INDICATORS
// ============================================================================

const FOLLOWUP_PATTERNS = [
  /^(aur|and|also|bhi)\s/i,
  /^(uska|iska|uski|iski|unka|unki)\s/i,
  /^(woh|ye|that|this|it)\s/i,
  /^(haan|yes|ok|okay|theek|acha)\s*[,.]?\s*(ab|now|toh|so)/i,
  /\b(previous|pehle|earlier|last time|abhi)\b/i,
  /^(continue|jari|aage)\b/i,
  /\b(same|wahi|usi)\b/i,
  /^(why|kyu|kyon)\s*\??\s*$/i,  // Just "why?" is likely follow-up
  /^(how|kaise)\s*\??\s*$/i,     // Just "how?" is likely follow-up
];

// ============================================================================
// CATEGORY KEYWORDS
// ============================================================================

const CATEGORY_KEYWORDS: Record<QueryCategory, RegExp[]> = {
  TECHNICAL: [
    /\b(code|function|api|debug|error|bug|programming|developer)\b/i,
    /\b(javascript|python|react|node|database|sql|html|css)\b/i,
    /\b(server|deploy|git|docker|aws|cloud|backend|frontend)\b/i,
    /```/,
  ],
  CREATIVE: [
    /\b(write|create|design|story|poem|script|content|tagline)\b/i,
    /\b(creative|idea|brainstorm|imagine|fiction|art)\b/i,
    /\b(marketing|slogan|campaign|brand)\b/i,
  ],
  PERSONAL: [
    /\b(feel|feeling|mood|stressed|happy|sad|anxious|worried)\b/i,
    /\b(advice|suggest|recommend|should i|kya karu)\b/i,
    /\b(relationship|career|life|personal|family)\b/i,
  ],
  DECISION: [
    /\b(better|best|choose|select|option|alternative)\b/i,
    /\b(vs|versus|or|ya|compare|comparison)\b/i,
    /\b(should|which one|konsa|kaun sa)\b/i,
  ],
  FACTUAL: [
    /\b(what is|who is|when|where|define|meaning)\b/i,
    /\b(kya hai|kaun hai|kab|kahan|matlab)\b/i,
    /\b(history|fact|information|tell me about)\b/i,
  ],
  GENERAL: [],
  FOLLOWUP: [],
  AMBIGUOUS: [
    /\b(wo|woh|that|this|uska|uski|iska|iski)\b/i,
    /\b(wala|wali|vale|one)\b/i,
    /\b(it|ye|yeh)\b/i,
  ],  // ← ADD THIS
};

// ============================================================================
// QUERY INTELLIGENCE SERVICE CLASS
// ============================================================================

export class QueryIntelligenceService {
  private config: QueryIntelligenceConfig;
  
  constructor(config?: Partial<QueryIntelligenceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[QueryIntelligence] ✅ Initialized v1.0.0');
  }
  
  // ==========================================================================
  // MAIN ANALYSIS METHOD
  // ==========================================================================
  
  /**
   * Analyze query for ambiguity, complexity, and context needs
   * This is the main method called before Delta Engine
   */
  public analyze(
    query: string,
    conversationHistory?: ConversationMessage[],
    plan?: PlanType
  ): QueryAnalysis {
    const startTime = Date.now();
    const normalized = this.normalizeQuery(query);
    
    // 1. Detect ambiguity
    const ambiguity = this.detectAmbiguity(normalized, conversationHistory);
    
    // 2. Detect complexity
    const complexity = this.detectComplexity(normalized);
    
    // 3. Detect category
    const category = this.detectCategory(normalized, conversationHistory);
    
    // 4. Analyze context needs
    const context = this.analyzeContext(normalized, conversationHistory);
    
    // 5. Determine action
    const action = this.determineAction(ambiguity, context, normalized);
    
    // 6. Calculate confidence
    const confidence = this.calculateConfidence(ambiguity, complexity, context);
    
    const processingTimeMs = Date.now() - startTime;
    
    const result: QueryAnalysis = {
      originalQuery: query,
      normalizedQuery: normalized,
      ambiguity,
      complexity,
      category,
      context,
      action,
      confidence,
      processingTimeMs,
    };
    
    console.log(`[QueryIntelligence] 📊 Analysis complete: ${category} | Ambiguity: ${ambiguity.level} | Complexity: ${complexity.level} | ${processingTimeMs}ms`);
    
    return result;
  }
  
  // ==========================================================================
  // QUICK CHECK (Lightweight for simple queries)
  // ==========================================================================
  
  /**
   * Quick check - returns just essential info for simple queries
   */
  public quickCheck(query: string): {
    isSimple: boolean;
    needsClarification: boolean;
    category: QueryCategory;
  } {
    const normalized = this.normalizeQuery(query);
    const complexity = this.detectComplexity(normalized);
    const ambiguity = this.detectAmbiguity(normalized);
    const category = this.detectCategory(normalized);
    
    return {
      isSimple: complexity.level === 'SIMPLE',
      needsClarification: ambiguity.level === 'HIGH',
      category,
    };
  }
  
  // ==========================================================================
  // AMBIGUITY DETECTION
  // ==========================================================================
  
  private detectAmbiguity(
    query: string,
    history?: ConversationMessage[]
  ): QueryAnalysis['ambiguity'] {
    const reasons: string[] = [];
    const possibleIntents: string[] = [];
    let ambiguityScore = 0;
    
    const words = query.toLowerCase().split(/\s+/);
    const queryLower = query.toLowerCase();
    
    // Check 1: Known ambiguous terms
    for (const word of words) {
      if (AMBIGUOUS_TERMS[word]) {
        ambiguityScore += 0.4;
        reasons.push(`"${word}" has multiple meanings`);
        possibleIntents.push(...AMBIGUOUS_TERMS[word]);
      }
    }
    
    // Check 2: Very short query without context
    if (words.length <= 2 && !history?.length) {
      ambiguityScore += 0.3;
      reasons.push('Very short query without context');
    }
    
    // Check 3: Pronouns without clear reference
    const pronouns = ['uska', 'iska', 'uski', 'iski', 'woh', 'ye', 'it', 'this', 'that', 'they'];
    const hasPronouns = pronouns.some(p => queryLower.includes(p));
    const hasContext = history && history.length > 0;
    
    if (hasPronouns && !hasContext) {
      ambiguityScore += 0.5;
      reasons.push('Contains pronouns but no conversation context');
    }
    
    // Check 4: Question without clear subject
    const vagueQuestions = /^(kaisa|kaise|kya|how|what)\s*(hai|hua|hoga|is|was)?\s*\??$/i;
    if (vagueQuestions.test(query)) {
      ambiguityScore += 0.4;
      reasons.push('Vague question without clear subject');
    }
    
    // Check 5: Single word query
    if (words.length === 1 && !['hi', 'hello', 'hey', 'bye', 'thanks'].includes(words[0])) {
      ambiguityScore += 0.3;
      reasons.push('Single word query');
      
      // Check if it's in ambiguous terms
      if (AMBIGUOUS_TERMS[words[0]]) {
        ambiguityScore += 0.2;
      }
    }
    
    // REDUCE ambiguity if context helps
    if (hasContext && hasPronouns) {
      // Context available - can likely resolve pronouns
      ambiguityScore -= 0.3;
    }
    
    // Determine level
    let level: AmbiguityLevel;
    if (ambiguityScore >= 0.7) level = 'HIGH';
    else if (ambiguityScore >= 0.4) level = 'MEDIUM';
    else if (ambiguityScore >= 0.2) level = 'LOW';
    else level = 'NONE';
    
    return {
      level,
      reasons: reasons.slice(0, 3), // Max 3 reasons
      possibleIntents: [...new Set(possibleIntents)].slice(0, 4), // Unique, max 4
    };
  }
  
  // ==========================================================================
  // COMPLEXITY DETECTION
  // ==========================================================================
  
  private detectComplexity(query: string): QueryAnalysis['complexity'] {
    const factors: string[] = [];
    const words = query.split(/\s+/);
    const wordCount = words.length;
    
    // Check for SIMPLE patterns first
    for (const pattern of COMPLEXITY_INDICATORS.simple.patterns) {
      if (pattern.test(query)) {
        return {
          level: 'SIMPLE',
          factors: ['Matches simple query pattern'],
        };
      }
    }
    
    // Word count check
    if (wordCount <= COMPLEXITY_INDICATORS.simple.maxWords) {
      factors.push(`Short query (${wordCount} words)`);
    }
    
    if (wordCount >= COMPLEXITY_INDICATORS.complex.minWords) {
      factors.push(`Long query (${wordCount} words)`);
    }
    
    // Check for COMPLEX patterns
    let complexScore = 0;
    
    for (const pattern of COMPLEXITY_INDICATORS.complex.patterns) {
      if (pattern.test(query)) {
        complexScore += 1;
        factors.push('Complex pattern detected');
      }
    }
    
    // Check for complex keywords
    const queryLower = query.toLowerCase();
    for (const keyword of COMPLEXITY_INDICATORS.complex.keywords) {
      if (queryLower.includes(keyword)) {
        complexScore += 0.5;
        factors.push(`Technical keyword: ${keyword}`);
      }
    }
    
    // Multiple questions in one query
    const questionMarks = (query.match(/\?/g) || []).length;
    if (questionMarks > 1) {
      complexScore += 1;
      factors.push(`Multiple questions (${questionMarks})`);
    }
    
    // Code blocks
    if (query.includes('```')) {
      complexScore += 1;
      factors.push('Contains code block');
    }
    
    // Determine level
    let level: ComplexityLevel;
    if (complexScore >= 2 || wordCount >= COMPLEXITY_INDICATORS.complex.minWords) {
      level = 'COMPLEX';
    } else if (complexScore >= 1 || wordCount > COMPLEXITY_INDICATORS.simple.maxWords) {
      level = 'MODERATE';
    } else {
      level = 'SIMPLE';
    }
    
    return {
      level,
      factors: factors.slice(0, 3),
    };
  }
  
  // ==========================================================================
  // CATEGORY DETECTION
  // ==========================================================================
  
  private detectCategory(
    query: string,
    history?: ConversationMessage[]
  ): QueryCategory {
    // Check for follow-up first
    for (const pattern of FOLLOWUP_PATTERNS) {
      if (pattern.test(query)) {
        return 'FOLLOWUP';
      }
    }
    
    // Check category keywords
    for (const [category, patterns] of Object.entries(CATEGORY_KEYWORDS)) {
      if (category === 'GENERAL' || category === 'FOLLOWUP') continue;
      
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          return category as QueryCategory;
        }
      }
    }
    
    // Use conversation history context if available
    if (history && history.length > 0) {
      const recentTopic = this.detectTopicFromHistory(history);
      if (recentTopic) {
        // If recent topic was technical and current query seems related
        if (recentTopic === 'TECHNICAL') {
          return 'TECHNICAL';
        }
      }
    }
    
    return 'GENERAL';
  }
  
  // ==========================================================================
  // CONTEXT ANALYSIS
  // ==========================================================================
  
  private analyzeContext(
    query: string,
    history?: ConversationMessage[]
  ): QueryAnalysis['context'] {
    const isFollowUp = FOLLOWUP_PATTERNS.some(p => p.test(query));
    
    // Extract keywords from query
    const relatedKeywords = this.extractKeywords(query);
    
    // Detect topic from history
    let detectedTopic: string | null = null;
    if (history && history.length > 0) {
      detectedTopic = this.detectTopicFromHistory(history);
    }
    
    // Determine if context is required
    const requiresContext = isFollowUp || 
      ['uska', 'iska', 'woh', 'ye', 'it', 'this', 'that'].some(p => 
        query.toLowerCase().includes(p)
      );
    
    return {
      isFollowUp,
      requiresContext,
      detectedTopic,
      relatedKeywords,
    };
  }
  
  // ==========================================================================
  // ACTION DETERMINATION
  // ==========================================================================
  
  private determineAction(
    ambiguity: QueryAnalysis['ambiguity'],
    context: QueryAnalysis['context'],
    query: string
  ): QueryAnalysis['action'] {
    // High ambiguity = ask clarification
    if (ambiguity.level === 'HIGH') {
      const clarificationQuestion = this.generateClarificationQuestion(
        query,
        ambiguity.possibleIntents
      );
      
      return {
        needsClarification: true,
        clarificationQuestion,
        suggestedApproach: 'Ask for clarification before responding',
      };
    }
    
    // Context required but no history
    if (context.requiresContext && !context.detectedTopic) {
      return {
        needsClarification: true,
        clarificationQuestion: 'Kiske baare mein baat kar rahe ho? Thoda context do.',
        suggestedApproach: 'Ask for context reference',
      };
    }
    
    // Medium ambiguity - proceed with assumption but mention
    if (ambiguity.level === 'MEDIUM') {
      return {
        needsClarification: false,
        clarificationQuestion: null,
        suggestedApproach: 'Proceed with most likely intent, offer to clarify',
      };
    }
    
    // All clear
    return {
      needsClarification: false,
      clarificationQuestion: null,
      suggestedApproach: 'Proceed normally',
    };
  }
  
  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  
  private normalizeQuery(query: string): string {
    return query
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[।॥]/g, '.'); // Hindi punctuation
  }
  
  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'hai', 'hain', 'tha', 'thi', 'the', 'ho', 'hota', 'hoti',
      'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'par', 'pe',
      'kya', 'kaise', 'kaisa', 'kaisi', 'kab', 'kahan', 'kaun',
      'ye', 'woh', 'yeh', 'wo', 'is', 'us', 'in', 'un',
      'aur', 'ya', 'lekin', 'magar', 'toh', 'bhi',
      'i', 'me', 'my', 'you', 'your', 'we', 'our', 'they', 'their',
      'what', 'how', 'when', 'where', 'who', 'why', 'which',
      'can', 'could', 'would', 'should', 'will', 'do', 'does', 'did',
    ]);
    
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
      .slice(0, 10);
  }
  
  private detectTopicFromHistory(history: ConversationMessage[]): string | null {
    if (!history || history.length === 0) return null;
    
    // Get last few messages
    const recentMessages = history.slice(-3);
    const allText = recentMessages.map(m => m.content).join(' ').toLowerCase();
    
    // Check for category patterns
    for (const [category, patterns] of Object.entries(CATEGORY_KEYWORDS)) {
      if (category === 'GENERAL' || category === 'FOLLOWUP') continue;
      
      for (const pattern of patterns) {
        if (pattern.test(allText)) {
          return category;
        }
      }
    }
    
    return null;
  }
  
  private generateClarificationQuestion(
    query: string,
    possibleIntents: string[]
  ): string {
    const queryLower = query.toLowerCase();
    
    // Specific clarifications for known ambiguous terms
    if (queryLower.includes('border')) {
      return 'Border se matlab - CSS border (coding) ya India-Pakistan border (geo)?';
    }
    
    if (queryLower.includes('python')) {
      return 'Python programming language ki baat kar rahe ho ya snake ki?';
    }
    
    if (queryLower.includes('apple')) {
      return 'Apple company ki baat hai ya fruit ki?';
    }
    
    if (queryLower.includes('java')) {
      return 'Java programming language?';
    }
    
    if (queryLower.includes('cell')) {
      return 'Cell phone, cell biology, ya kuch aur?';
    }
    
    if (queryLower.includes('bug')) {
      return 'Software bug (error) ya insect wala bug?';
    }
    
    // Generic clarification with options
    if (possibleIntents.length >= 2) {
      const options = possibleIntents.slice(0, 2).join(' ya ');
      return `Thoda clear karo - ${options}?`;
    }
    
    // Very generic fallback
    return 'Thoda detail mein batao - kya context hai?';
  }
  
  private calculateConfidence(
    ambiguity: QueryAnalysis['ambiguity'],
    complexity: QueryAnalysis['complexity'],
    context: QueryAnalysis['context']
  ): number {
    let confidence = 100;
    
    // Reduce for ambiguity
    if (ambiguity.level === 'HIGH') confidence -= 35;
    else if (ambiguity.level === 'MEDIUM') confidence -= 20;
    else if (ambiguity.level === 'LOW') confidence -= 10;
    
    // Reduce for missing context
    if (context.requiresContext && !context.detectedTopic) {
      confidence -= 25;
    }
    
    // Slight reduction for complexity
    if (complexity.level === 'COMPLEX') confidence -= 10;
    
    // Boost for follow-up with context
    if (context.isFollowUp && context.detectedTopic) {
      confidence += 10;
    }
    
    return Math.max(20, Math.min(100, confidence));
  }
  
  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================
  
  /**
   * Check if query needs clarification (quick check)
   */
  public needsClarification(query: string): boolean {
    const result = this.quickCheck(query);
    return result.needsClarification;
  }
  
  /**
   * Get clarification question for a query
   */
  public getClarificationQuestion(query: string): string | null {
    const analysis = this.analyze(query);
    return analysis.action.clarificationQuestion;
  }
  
  /**
   * Check if query is a follow-up
   */
  public isFollowUp(query: string): boolean {
    return FOLLOWUP_PATTERNS.some(p => p.test(query));
  }
  
  /**
   * Get config
   */
  public getConfig(): QueryIntelligenceConfig {
    return { ...this.config };
  }
  
  /**
   * Update config
   */
  public updateConfig(config: Partial<QueryIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const queryIntelligence = new QueryIntelligenceService();

export default QueryIntelligenceService;