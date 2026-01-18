/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA INTELLIGENCE LAYER v3.0 - STABLE CORE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Risenex Dynamics
 * Date: January 2026
 * 
 * PURPOSE:
 * - Message Analysis (Intent, Complexity, Emotion, Safety)
 * - Prompt Building (Dynamic, Token-Efficient)
 * - Confidence & Risk Scoring
 * 
 * NOT RESPONSIBLE FOR:
 * - Model Selection (→ SmartRoutingService)
 * - Fallback Logic (→ SmartRoutingService)
 * - Temperature/MaxTokens (→ SmartRoutingService)
 * 
 * v3.0 CHANGES:
 * - REMOVED: All routing logic (model, fallback, temperature)
 * - ADDED: routingIntent for SmartRoutingService
 * - STABLE: This file should rarely change now
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type IntentType = 'greeting' | 'casual' | 'question' | 'learning' | 'technical' | 'emotional' | 'task' | 'creative';
export type ComplexityLevel = 'simple' | 'medium' | 'complex';
export type LanguageType = 'en' | 'hi' | 'mix';
export type EmotionType = 'positive' | 'negative' | 'neutral';
export type SafetyLevel = 'clean' | 'sensitive' | 'dangerous' | 'escalate';

export interface SorivaInput {
  message: string;
  userId: string;
  userName?: string;
  planType: 'STARTER' | 'PLUS' | 'PRO' | 'APEX';
  history?: Array<{ role: string; content: string }>;
}

export interface SorivaOutput {
  // ═══════════════════════════════════════════════════════════
  // ANALYSIS (Core Purpose)
  // ═══════════════════════════════════════════════════════════
  primaryIntent: IntentType;
  secondaryIntent?: IntentType;
  complexity: ComplexityLevel;
  language: LanguageType;
  emotion: EmotionType;
  isRepetitive: boolean;  // NEW
  repetitionCount: number;
  
  // ═══════════════════════════════════════════════════════════
  // SAFETY
  // ═══════════════════════════════════════════════════════════
  safety: SafetyLevel;
  safetyAction: 'allow' | 'allow_with_guardrails' | 'deny' | 'escalate';
  blocked: boolean;
  blockReason?: string;
  
  // ═══════════════════════════════════════════════════════════
  // SCORING (For SmartRouting to use)
  // ═══════════════════════════════════════════════════════════
  confidenceScore: number;  // 0-100: How confident are we in understanding?
  riskScore: number;        // 0-100: How risky is this query?
  
  // ═══════════════════════════════════════════════════════════
  // ROUTING HINTS (For SmartRoutingService)
  // ═══════════════════════════════════════════════════════════
  routingIntent: {
    requiresPremium: boolean;      // High risk/complexity needs premium model
    requiresLowTemp: boolean;      // Factual/sensitive needs low temperature
    requiresShortResponse: boolean; // Escalation needs brief response
    specialization?: string;       // 'code' | 'creative' | 'emotional' | etc
  };
  
  // ═══════════════════════════════════════════════════════════
  // PROMPT (The Magic)
  // ═══════════════════════════════════════════════════════════
  systemPrompt: string;
  promptTokens: number;
  
  // ═══════════════════════════════════════════════════════════
  // UX HINTS
  // ═══════════════════════════════════════════════════════════
  shouldAskClarification: boolean;
  clarificationReason?: string;
  supportResources?: string;
  
  // ═══════════════════════════════════════════════════════════
  // DEBUG
  // ═══════════════════════════════════════════════════════════
  analysisTimeMs: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION (Analysis only, NO routing config)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONFIG = {
  // Complex concepts that need detailed response
  complexConcepts: new Set([
    'recursion', 'closure', 'async', 'await', 'promise', 'callback',
    'inheritance', 'polymorphism', 'encapsulation', 'abstraction',
    'algorithm', 'blockchain', 'machine learning', 'neural network',
    'api', 'rest', 'graphql', 'websocket', 'microservices',
    'docker', 'kubernetes', 'ci/cd', 'devops',
    'philosophy', 'consciousness', 'quantum', 'relativity',
    'samjhao', 'explain', 'batao detail mein', 'pura batao',
  ]),

  // Topics needing factual accuracy
  deterministicTopics: new Set([
    'law', 'legal', 'tax', 'gst', 'income tax', 'court', 'constitution',
    'medical', 'medicine', 'disease', 'symptoms', 'diagnosis',
    'finance', 'investment', 'stock', 'mutual fund',
    'government', 'policy', 'scheme', 'yojana',
  ]),

  // Support resources (India)
  supportResources: {
    india: `iCall: 9152987821 | Vandrevala: 1860-2662-345 | NIMHANS: 080-46110007`,
  },

  // Thresholds
  thresholds: {
    clarificationConfidence: 40,  // Below this, ask clarification
    premiumRisk: 70,              // Above this, suggest premium model
    lowTempRisk: 60,              // Above this, suggest low temperature
  },
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPANY FACTS (For accurate responses, no hallucination)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COMPANY_FACTS = {
  name: 'Risenex Dynamics',
  type: 'Indian tech startup',
  location: 'Ferozepur, Punjab',
  focus: 'AI solutions & web development',
  product: 'Soriva (AI assistant)',
  website: 'risenex.com',
  founder: 'Amandeep',
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SORIVA INTELLIGENCE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class SorivaIntelligence {
  private static instance: SorivaIntelligence;

  public static getInstance(): SorivaIntelligence {
    if (!SorivaIntelligence.instance) {
      SorivaIntelligence.instance = new SorivaIntelligence();
    }
    return SorivaIntelligence.instance;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * MAIN ENTRY POINT
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  process(input: SorivaInput): SorivaOutput {
    const startTime = Date.now();

    // Step 1: Safety Check
    const safety = this.analyzeSafety(input.message);
    
    if (safety.level === 'dangerous') {
      return this.buildBlockedResponse(safety, startTime);
    }

    // Step 2: Core Analysis
    const language = this.detectLanguage(input.message);
    const { primary: primaryIntent, secondary: secondaryIntent } = this.detectIntent(input.message);
    const complexity = this.detectComplexity(input.message, primaryIntent);
    const emotion = this.detectEmotion(input.message);
    
    // Step 3: Scoring
    const confidenceScore = this.calculateConfidence(input.message, primaryIntent, complexity);
    const riskScore = this.calculateRisk(safety.level, primaryIntent, emotion);

    // Step 4: Build Routing Hints (for SmartRoutingService)
    const routingIntent = this.buildRoutingIntent(
      complexity, 
      riskScore, 
      primaryIntent, 
      safety.level,
      input.message
    );

    // Step 5: Build Prompt
    const systemPrompt = this.buildPrompt(input, {
      language,
      primaryIntent,
      secondaryIntent,
      complexity,
      emotion,
      safety: safety.level,
    });

    // Step 6: UX Hints
    const shouldAskClarification = confidenceScore < CONFIG.thresholds.clarificationConfidence;
    const clarificationReason = shouldAskClarification 
      ? this.getClarificationReason(input.message, primaryIntent)
      : undefined;
    const supportResources = safety.level === 'escalate' 
      ? CONFIG.supportResources.india 
      : undefined;

    return {
      primaryIntent,
      secondaryIntent,
      complexity,
      language,
      emotion,
      safety: safety.level,
      safetyAction: safety.action,
      blocked: false,
      confidenceScore,
      riskScore,
      routingIntent,
      systemPrompt,
      promptTokens: Math.ceil(systemPrompt.length / 4),
      shouldAskClarification,
      clarificationReason,
      supportResources,
      analysisTimeMs: Date.now() - startTime,
      isRepetitive: this.isRepetitiveMessage(input.message, input.history),
      repetitionCount: this.getRepetitionCount(input.message, input.history),  // ADD THIS

    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SAFETY FILTER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private analyzeSafety(message: string): { 
    level: SafetyLevel; 
    action: 'allow' | 'allow_with_guardrails' | 'deny' | 'escalate';
    reason?: string;
  } {
    const lower = message.toLowerCase();

    // ESCALATE: Mental health crisis
    const escalatePatterns = [
      /\b(suicid|kill myself|end my life|want to die|marna chahta|mar jana|marna hai|jeene ka mann nahi)\b/i,
      /\b(self.?harm|cut myself|hurt myself|khud ko hurt)\b/i,
      /\b(no reason to live|koi reason nahi|zindagi bekar)\b/i,
    ];
    
    for (const pattern of escalatePatterns) {
      if (pattern.test(lower)) {
        return { level: 'escalate', action: 'escalate', reason: 'Mental health support needed' };
      }
    }

    // DANGEROUS: Block
    const dangerousPatterns = [
      /\b(bomb|explosive|weapon)\s*(make|build|create|banao)/i,
      /\b(hack|exploit|crack)\s+(bank|account|password|system)/i,
      /\b(nude|porn|xxx|sex\s*video)\b/i,
      /\b(drugs?|cocaine|heroin|meth)\s+(buy|sell|dealer)/i,
      /\b(child|minor|bachcha)\s+(sex|nude|porn)/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(lower)) {
        return { level: 'dangerous', action: 'deny', reason: 'Content policy violation' };
      }
    }

    // SENSITIVE: Allow with guardrails
    const sensitivePatterns = [
      /\b(depress|anxiety|anxious|panic|stressed|tension|pareshan)\b/i,
      /\b(lonely|alone|akela|sad|dukhi|hopeless)\b/i,
      /\b(breakup|divorce|relationship\s*problem)\b/i,
      /\b(job\s*loss|fired|nikaal\s*diya|unemployed)\b/i,
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(lower)) {
        return { level: 'sensitive', action: 'allow_with_guardrails', reason: 'Sensitive topic' };
      }
    }

    return { level: 'clean', action: 'allow' };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LANGUAGE DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectLanguage(message: string): LanguageType {
    const hinglishWords = /\b(kya|kaise|kaisi|karo|karna|hai|hain|ho|hu|tum|aap|mujhe|mera|tera|ye|wo|nahi|haan|accha|theek|bas|bhai|yaar|bro|arre|matlab|wala|waali|batao|btao|seekh|samajh|bol|bolo|de|do|le|lo|ja|jao|aa|aao|dekh|sun|likh|padh|chal)\b/i;
    
    const hasDevanagari = /[\u0900-\u097F]/.test(message);
    const englishRatio = (message.match(/[a-zA-Z]/g) || []).length / Math.max(message.length, 1);

    if (hasDevanagari) return 'hi';
    if (hinglishWords.test(message)) return 'mix';
    if (englishRatio > 0.85) return 'en';
    
    return 'mix';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTENT DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectIntent(message: string): { primary: IntentType; secondary?: IntentType } {
    const lower = message.toLowerCase();
    const wordCount = message.split(/\s+/).length;
    
    const intents: IntentType[] = [];

    const patterns: Record<IntentType, RegExp> = {
      greeting: /^(hi|hello|hey|hii+|hlo|namaste|namaskar|kaise ho|kaisi ho|kya haal|good\s*(morning|evening|night)|bye|thanks|ok|okay|theek|shukriya)[\s\?\!\.]*$/i,
      emotional: /\b(sad|happy|angry|frustrated|stressed|anxious|worried|scared|lonely|depressed|dukhi|pareshan|tension|gussa|dar|akela|excited|khush)\b/i,
      learning: /\b(seekh|learn|sikhao|batao|explain|samjhao|kaise|how\s+to|tutorial|guide|steps|start|begin|basics|padhai|study)\b/i,
      technical: /\b(code|programming|error|bug|api|database|server|function|variable|algorithm|debug|deploy|git|react|node|python|javascript|html|css|sql)\b/i,
      task: /\b(write|create|make|build|generate|draft|compose|design|plan|list|summarize|translate|convert|calculate|likh|bana|likho|banao)\b/i,
      creative: /\b(story|poem|song|creative|imagine|fiction|shayari|joke|funny|kahani|gana)\b/i,
      question: /\?|^(what|why|when|where|who|how|which|kya|kyu|kab|kahan|kaun|kaise|konsa)/i,
      casual: /./,
    };

    for (const [intent, pattern] of Object.entries(patterns) as [IntentType, RegExp][]) {
      if (intent === 'casual') continue;
      if (intent === 'greeting' && wordCount > 3) continue;
      if (pattern.test(lower)) intents.push(intent);
    }

    const priority: IntentType[] = ['greeting', 'emotional', 'task', 'learning', 'technical', 'creative', 'question', 'casual'];
    intents.sort((a, b) => priority.indexOf(a) - priority.indexOf(b));

    if (intents.includes('task') && intents.includes('emotional')) {
      return { primary: 'task', secondary: 'emotional' };
    }
    if (intents.includes('question') && intents.includes('technical')) {
      return { primary: 'technical', secondary: 'question' };
    }

    return { primary: intents[0] || 'casual', secondary: intents[1] };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPLEXITY DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectComplexity(message: string, intent: IntentType): ComplexityLevel {
    const lower = message.toLowerCase();
    const wordCount = message.split(/\s+/).length;

    if (intent === 'greeting') return 'simple';

    for (const concept of CONFIG.complexConcepts) {
      if (lower.includes(concept)) {
        return wordCount <= 5 ? 'medium' : 'complex';
      }
    }

    if (wordCount <= 4) return 'simple';
    if (wordCount <= 15) return 'medium';
    if (intent === 'technical' || intent === 'learning' || intent === 'creative') return 'complex';

    return 'medium';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMOTION DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectEmotion(message: string): EmotionType {
    const positive = /\b(happy|excited|great|awesome|thanks|amazing|love|wonderful|khush|mast|badiya|shukriya)\b|[😊😄🎉🥳❤️👍🙏]/;
    if (positive.test(message)) return 'positive';

    const negative = /\b(sad|angry|frustrated|stressed|worried|anxious|hate|terrible|dukhi|gussa|pareshan|tension)\b|[😢😭😡😤😰😔]/;
    if (negative.test(message)) return 'negative';

    return 'neutral';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIDENCE SCORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private calculateConfidence(message: string, intent: IntentType, complexity: ComplexityLevel): number {
    let score = 70;

    if (intent === 'greeting') score += 25;
    if (intent === 'task') score += 15;
    if (complexity === 'simple') score += 15;
    if (complexity === 'complex') score -= 10;

    const wordCount = message.split(/\s+/).length;
    if (wordCount >= 5 && wordCount <= 20) score += 10;
    if (wordCount > 50) score -= 15;
    if (wordCount <= 2 && intent !== 'greeting') score -= 20;

    if (/\b(something|anything|kuch bhi|wo cheez)\b/i.test(message)) score -= 15;

    return Math.min(100, Math.max(0, score));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RISK SCORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private calculateRisk(safety: SafetyLevel, intent: IntentType, emotion: EmotionType): number {
    let score = 10;

    if (safety === 'escalate') score = 95;
    else if (safety === 'sensitive') score += 40;
    
    if (intent === 'emotional') score += 20;
    if (emotion === 'negative') score += 15;
    if (intent === 'technical') score += 10;

    return Math.min(100, Math.max(0, score));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ROUTING INTENT BUILDER (Hints for SmartRoutingService)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildRoutingIntent(
    complexity: ComplexityLevel,
    riskScore: number,
    intent: IntentType,
    safety: SafetyLevel,
    message: string
  ): SorivaOutput['routingIntent'] {
    const lower = message.toLowerCase();

    // Determine specialization
    let specialization: string | undefined;
    if (intent === 'technical') specialization = 'code';
    else if (intent === 'creative') specialization = 'creative';
    else if (intent === 'emotional' || safety === 'sensitive' || safety === 'escalate') specialization = 'emotional';
    else if (intent === 'learning') specialization = 'education';

    // Check if deterministic topics
    const needsFactual = [...CONFIG.deterministicTopics].some(topic => lower.includes(topic));

    return {
      requiresPremium: riskScore >= CONFIG.thresholds.premiumRisk || complexity === 'complex',
      requiresLowTemp: riskScore >= CONFIG.thresholds.lowTempRisk || needsFactual || safety === 'escalate',
      requiresShortResponse: safety === 'escalate',
      specialization,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLARIFICATION REASON
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getClarificationReason(message: string, intent: IntentType): string {
    const wordCount = message.split(/\s+/).length;
    
    if (wordCount <= 2 && intent !== 'greeting') return 'Message too short';
    if (/\b(something|anything|kuch bhi)\b/i.test(message)) return 'Vague reference';
    return 'Need more context';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROMPT BUILDER (The Magic ✨)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
private buildPrompt(
  input: SorivaInput,
  analysis: {
    language: LanguageType;
    primaryIntent: IntentType;
    secondaryIntent?: IntentType;
    complexity: ComplexityLevel;
    emotion: EmotionType;
    safety: SafetyLevel;
  }
): string {
  const { userName } = input;
  const { language, primaryIntent, complexity, emotion, safety } = analysis;

  const tone = this.getTrait(primaryIntent, emotion, safety);
  const nameStr = userName && userName !== 'User' && userName !== 'Plus User'
    ? `, talking to ${userName}`
    : '';

  const langRule =
    language === 'en'
      ? `Use English only.`
      : `Use Hinglish in Roman script (no Devanagari). Feminine tone: karungi/bataungi.`;

  const safetyHint =
    safety === 'escalate'
      ? `CRITICAL: User shows distress. Be calm, caring, short. Encourage professional help.`
      : safety === 'sensitive'
      ? `Sensitive topic—be empathetic and grounded.`
      : '';

  const emotionHint =
    emotion === 'negative' ? `User seems stressed—respond gently.` : '';

  return `Soriva, a ${tone} female assistant by Risenex Dynamics${nameStr}.
${langRule}
${emotionHint}
${safetyHint}

RULES:
- Shayari/wishes/poetry → match user's language & cultural tone.
- You are not ChatGPT, Gemini, Claude, OpenAI or any model.
- Respond gently if asked about company and never try to market unnecessarily.
- Act smart if someone asks about founder.
- Never be repetitive regardless of the query.
- use emoji while being expressive only.
- No over-explaining unless user asks.

QUALITY:
Clear, specific, example-based output. ${this.getFormattingRules(primaryIntent, complexity)}
`;
}
private getTrait(intent: IntentType, emotion: EmotionType, safety: SafetyLevel): string {
  if (safety === 'escalate' || safety === 'sensitive') return 'caring, supportive';
  if (emotion === 'negative') return 'warm, supportive';
  if (intent === 'emotional') return 'empathetic';
  if (intent === 'technical') return 'precise';
  if (intent === 'learning') return 'patient';
  if (intent === 'creative') return 'expressive';
  if (intent === 'greeting') return 'friendly';
  return 'helpful';
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALSO UPDATE getFormattingRules() for more compact output
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

private getFormattingRules(intent: IntentType, complexity: ComplexityLevel): string {
  if (intent === 'greeting' || complexity === 'simple') return 'Brief, natural.';
  if (intent === 'learning' || intent === 'technical') return 'Steps, **bold** keys, examples.';
  if (intent === 'task') return 'Direct, actionable.';
  return 'Clear, specific answers.';
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOKEN COMPARISON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// OLD PROMPT (~190 tokens):
// ─────────────────────────────────────────────────────────────
// Soriva, helpful female AI by Risenex Dynamics (Indian startup from Ferozepur, Punjab, founded by Amandeep), talking to Aman.
// VOICE:
// - Hinglish in → Hinglish reply (feminine: karungi, bataungi, samjhi)
// - English in → English reply
// 
// RULES:
// - "Kaun ho/who are you" → "Main Soriva hu, Risenex ki AI assistant"
// - Never mention ChatGPT/Gemini/Claude/Google/OpenAI
// - Amandeep details → "LinkedIn/Google pe search karo"
// - Roman script only, max 1-2 emoji
// QUALITY:
// - Specific, actionable answers with examples
// - If unsure, say honestly
// FORMATTING:
// Brief, natural response
// 
// ─────────────────────────────────────────────────────────────
// 
// NEW PROMPT (~120 tokens):
// ─────────────────────────────────────────────────────────────
// Soriva, helpful female AI by Risenex (Ferozepur, Punjab) to Aman.
// LANG: Hinglish→Hinglish (feminine forms), English→English. Roman only.
// STYLE: helpful, max 1-2 emoji.
// IDENTITY: "Kaun ho?"→"Main Soriva hu, Risenex ki AI". Never mention GPT/Gemini/Claude. Founder details→"Search karo".
// OUTPUT: Brief, natural.
// ─────────────────────────────────────────────────────────────
// 
// SAVINGS: ~70 tokens (37% reduction!)
// 
// WHAT WE REMOVED:
// - "Indian startup" (redundant with Ferozepur, Punjab)
// - "founded by Amandeep" (moved to IDENTITY rule)
// - Separate VOICE/RULES/QUALITY/FORMATTING sections (merged)
// - "karungi, bataungi, samjhi" examples (LLM knows feminine Hindi)
// - "If unsure, say honestly" (LLM default behavior)
// - Redundant explanations
// 
// WHAT WE KEPT:
// ✅ Soriva identity
// ✅ Feminine AI
// ✅ Risenex + Location
// ✅ Language mirroring
// ✅ No AI mentions rule
// ✅ Founder privacy rule
// ✅ Emoji limit
// ✅ Dynamic formatting
// ✅ Emotion hints (when needed)
// ✅ Safety hints (when needed)
  // Check for repetitive messages in history
private isRepetitiveMessage(message: string, history?: Array<{ role: string; content: string }>): boolean {
  if (!history || history.length === 0) return false;
  
  const userMessages = history
    .filter(m => m.role === 'user')
    .slice(-3)  // Last 3 messages
    .map(m => m.content.toLowerCase().trim());
  
  const currentMsg = message.toLowerCase().trim();
  const repeatCount = userMessages.filter(m => m === currentMsg).length;
  
  return repeatCount >= 1;  // Same message appeared before
}
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BLOCKED RESPONSE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    private getRepetitionCount(message: string, history?: Array<{ role: string; content: string }>): number {
  if (!history || history.length === 0) return 0;
  const currentMsg = message.toLowerCase().trim();
  return history
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase().trim())
    .filter(m => m === currentMsg).length;
}
  private buildBlockedResponse(
  safety: { level: SafetyLevel; action: string; reason?: string },
  startTime: number
): SorivaOutput {
  return {
    primaryIntent: 'casual',
    complexity: 'simple',
    language: 'en',
    emotion: 'neutral',
    isRepetitive: false,      // ADD THIS
    repetitionCount: 0,       // CHANGE THIS (hardcoded 0)
    safety: safety.level,
    safetyAction: 'deny',
    blocked: true,
    blockReason: safety.reason,
    confidenceScore: 100,
    riskScore: 100,
    routingIntent: {
      requiresPremium: false,
      requiresLowTemp: true,
      requiresShortResponse: true,
    },
    systemPrompt: '',
    promptTokens: 0,
    shouldAskClarification: false,
    analysisTimeMs: Date.now() - startTime,
  };
}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUALITY CHECK (Post-Response)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  checkResponseQuality(response: string, analysis: SorivaOutput): {
    passed: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (/\b(as an ai|i am an ai|chatgpt|gemini|claude|openai|google ai)\b/i.test(response)) {
      issues.push('AI_MENTION');
    }
    if (analysis.language === 'mix' && /[\u0900-\u097F]/.test(response)) {
      issues.push('DEVANAGARI');
    }
    const emojiCount = (response.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/gu) || []).length;
    if (emojiCount > 3) issues.push('EXCESS_EMOJI');
    if (response.trim().length < 10) issues.push('TOO_SHORT');

    return { passed: issues.length === 0, issues };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const sorivaIntelligence = SorivaIntelligence.getInstance();