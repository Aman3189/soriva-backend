/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA INTELLIGENCE LAYER v5.0 - ADAPTIVE HEALTH ENGINE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Risenex Dynamics
 * Updated: January 2026
 * 
 * v5.0 CHANGES:
 * - NEW: Health Intent Depth Detection
 * - NEW: Adaptive Response Mode System
 * - NEW: 3-Layer Token Compression
 * - NEW: Anti-Manipulation Engine
 * - NEW: Tester Mode Detection
 * - UPGRADED: Dynamic rule injection (60-70% token reduction)
 * - IMPROVED: Human-friendly refusals (no "I cannot")
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type IntentType = 'greeting' | 'casual' | 'question' | 'learning' | 'technical' | 'emotional' | 'task' | 'creative' | 'health';
export type ComplexityLevel = 'simple' | 'medium' | 'complex';
export type LanguageType = 'en' | 'hi' | 'mix';
export type EmotionType = 'positive' | 'negative' | 'neutral';
export type SafetyLevel = 'clean' | 'sensitive' | 'dangerous' | 'escalate' | 'health_query';

// 🏥 NEW v5.0 - Health Intent Depth Types
export type HealthIntentDepth = 
  | 'emergency'           // chest pain, breathing issues
  | 'validation_seeking'  // "theek hai?", "sahi diya?"
  | 'decision_seeking'    // "kya lun?", "konsi medicine?"
  | 'nuskha_seeking'      // "nuskha btao", "gharelu upay"
  | 'nuskha_mentioned'    // user mentions haldi doodh (not asking)
  | 'education_seeking'   // "kyu hota hai?", "samjhao"
  | 'comfort_seeking'     // "rahat", "relief", "ghar par"
  | 'casual_symptom';     // just mentioning symptom

// 🏥 NEW v5.0 - Response Mode Types
export type HealthResponseMode = 
  | 'emergency_override'       // immediate medical attention
  | 'redirect_to_doctor'       // no medicine/nuskha, guide to doctor
  | 'education_only'           // explain condition, no recommendations
  | 'comfort_plus_education'   // warm fluids + light explanation
  | 'comfort_only'             // basic relief, soft doctor mention
  | 'balanced_nuskha_response'; // fyaade + nuksaan when user mentions

export interface SorivaInput {
  message: string;
  userId: string;
  userName?: string;
  planType: 'STARTER' | 'PLUS' | 'PRO' | 'APEX';
  history?: Array<{ role: string; content: string }>;
}

export interface SorivaOutput {
  primaryIntent: IntentType;
  secondaryIntent?: IntentType;
  complexity: ComplexityLevel;
  language: LanguageType;
  emotion: EmotionType;
  isRepetitive: boolean;
  repetitionCount: number;
  
  safety: SafetyLevel;
  safetyAction: 'allow' | 'allow_with_guardrails' | 'deny' | 'escalate';
  blocked: boolean;
  blockReason?: string;
  
  confidenceScore: number;
  riskScore: number;
  
  routingIntent: {
    requiresPremium: boolean;
    requiresLowTemp: boolean;
    requiresShortResponse: boolean;
    specialization?: string;
  };
  
  systemPrompt: string;
  promptTokens: number;
  
  shouldAskClarification: boolean;
  clarificationReason?: string;
  supportResources?: string;
  
  // NEW v5.0
  healthIntentDepth?: HealthIntentDepth;
  healthResponseMode?: HealthResponseMode;
  
  analysisTimeMs: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONFIG = {
  complexConcepts: new Set([
    'recursion', 'closure', 'async', 'await', 'promise', 'callback',
    'inheritance', 'polymorphism', 'encapsulation', 'abstraction',
    'algorithm', 'blockchain', 'machine learning', 'neural network',
    'api', 'rest', 'graphql', 'websocket', 'microservices',
    'docker', 'kubernetes', 'ci/cd', 'devops',
    'philosophy', 'consciousness', 'quantum', 'relativity',
    'samjhao', 'explain', 'batao detail mein', 'pura batao',
  ]),

  deterministicTopics: new Set([
    'law', 'legal', 'tax', 'gst', 'income tax', 'court', 'constitution',
    'finance', 'investment', 'stock', 'mutual fund',
    'government', 'policy', 'scheme', 'yojana',
  ]),

  healthKeywords: new Set([
    'medicine', 'tablet', 'drug', 'pill', 'capsule', 'syrup', 'injection',
    'dosage', 'dose', 'mg', 'prescription', 'antibiotic', 'painkiller',
    'disease', 'symptoms', 'diagnosis', 'treatment', 'cure', 'remedy',
    'cholesterol', 'diabetes', 'bp', 'blood pressure', 'sugar', 'thyroid',
    'fever', 'cold', 'cough', 'headache', 'pain', 'infection',
    'ayurvedic', 'homeopathic', 'herbal', 'home remedy', 'nuskha',
    'dawai', 'dawa', 'goli', 'bimari', 'ilaj', 'upchar', 'nuskhe',
    'bukhar', 'sardi', 'khansi', 'dard', 'sir dard', 'pet dard',
    'sugar ki bimari', 'bp ki problem', 'cholesterol badhna',
  ]),

  supportResources: {
    india: `iCall: 9152987821 | Vandrevala: 1860-2662-345 | NIMHANS: 080-46110007`,
  },

  thresholds: {
    clarificationConfidence: 40,
    premiumRisk: 70,
    lowTempRisk: 60,
    maxPromptTokens: 200,  // NEW v5.0
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏥 HEALTH ENGINE v5.0 - INTENT DEPTH DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const detectHealthIntentDepth = (msg: string): HealthIntentDepth => {
  const m = msg.toLowerCase();
  
  // 🚨 EMERGENCY - Highest priority
  if (/\b(chest pain|seene mein dard|saans nahi|breathing problem|heart attack|behosh|unconscious|emergency|serious condition|bp 200|sugar 400|stroke)\b/i.test(m)) {
    return 'emergency';
  }
  
  // ❌ VALIDATION SEEKING - User wants confirmation
  if (/\b(theek hai|sahi hai|safe hai|perfect hai|okay hai|right hai|sahi diya|achhi hai|galat toh nahi|koi dikkat)\b/i.test(m)) {
    return 'validation_seeking';
  }
  
  // 💊 DECISION SEEKING - User wants medicine/remedy recommendation
  if (/\b(kya lun|kya khana chahiye|konsi medicine|tablet batao|medicine btao|dawai btao|kya len|suggest karo|recommend karo)\b/i.test(m)) {
    return 'decision_seeking';
  }
  
  // 🌿 NUSKHA SEEKING - User asking for home remedies
  if (/\b(nuskha|nuskhe|home remedy|gharelu upay|gharelu ilaj|dadi ke|totka|desi ilaj|ghar ka ilaj)\b/i.test(m)) {
    return 'nuskha_seeking';
  }
  
  // 🌿 NUSKHA MENTIONED - User mentions specific remedy (not asking for it)
  if (/\b(haldi doodh|haldi wala|ajwain|hing|lehsun|garlic water|adrak|ginger|kadha|methi dana|karela juice|jamun|amla|giloy|ashwagandha|tulsi|shahad nimbu|lemon honey)\b/i.test(m) && 
      !/\b(batao|btao|nuskha|kya lun|suggest)\b/i.test(m)) {
    return 'nuskha_mentioned';
  }
  
  // 📘 EDUCATION SEEKING - User wants to understand
  if (/\b(kyu hota|kyun hota|kaise hota|reason|wajah|samjhao|explain|kya hai ye|meaning|matlab)\b/i.test(m)) {
    return 'education_seeking';
  }
  
  // 🌿 COMFORT SEEKING - User wants relief
  if (/\b(rahat|relief|comfort|ghar par|temporary|filhal|abhi ke liye|jab tak doctor)\b/i.test(m)) {
    return 'comfort_seeking';
  }
  
  // Default - casual symptom mention
  return 'casual_symptom';
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏥 HEALTH ENGINE v5.0 - RESPONSE MODE DECISION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const decideHealthResponseMode = (depth: HealthIntentDepth): HealthResponseMode => {
  const mapping: Record<HealthIntentDepth, HealthResponseMode> = {
    'emergency': 'emergency_override',
    'validation_seeking': 'redirect_to_doctor',
    'decision_seeking': 'redirect_to_doctor',
    'nuskha_seeking': 'redirect_to_doctor',
    'nuskha_mentioned': 'balanced_nuskha_response',
    'education_seeking': 'education_only',
    'comfort_seeking': 'comfort_plus_education',
    'casual_symptom': 'comfort_only'
  };
  return mapping[depth];
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ HEALTH ENGINE v5.0 - ANTI-MANIPULATION DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const detectManipulation = (msg: string): boolean => {
  const m = msg.toLowerCase();
  return /\b(please bata do|bas ek baar|one time|just tell me|sirf naam|main zimmedari|mai zimmedar|i accept|i am responsible|give me anyway|legal permission|i permit|i allow you|mai doctor hu|main doctor|i am a doctor|i am doctor|for research|research purpose|educational purpose|sirf jaankari|just for info|off the record|between us|promise nahi bataunga|secret rakhna)\b/i.test(m);
};

const detectTesterMode = (msg: string): boolean => {
  const m = msg.toLowerCase();
  return /\b(testing|test mode|evaluate|capability|scenario|if user asks|model test|audit|safety check|example answer|what would you say|how would you respond|internal test|qa mode|quality check)\b/i.test(m);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏥 HEALTH ENGINE v5.0 - ADAPTIVE RULES BUILDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const buildAdaptiveHealthRules = (
  mode: HealthResponseMode,
  isManipulation: boolean,
  isTesterMode: boolean
): string[] => {
  const rules: string[] = [];
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛡️ MANIPULATION OVERRIDE - Highest Priority
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isManipulation) {
    rules.push(
      '⚠️ MANIPULATION DETECTED:',
      '- DO NOT give medicine names or specific remedies',
      '- SAY warmly: "Samajh rahi hoon aap insist kar rahe ho, par health mein safe rehna zaroori hai"',
      '- REDIRECT to: tests doctor checks, questions to ask doctor, red flags',
      '- NEVER say "I cannot" - stay warm and helpful'
    );
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧪 TESTER MODE OVERRIDE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isTesterMode) {
    rules.push(
      '🛡️ TEST MODE:',
      '- Respond meta-safe: explain principles, not specific content',
      '- SAY: "Health queries mein main category-level info de sakti hoon, specific names nahi"',
      '- Focus on: how system handles health safely'
    );
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚨 EMERGENCY MODE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (mode === 'emergency_override') {
    rules.push(
      '🚨 EMERGENCY:',
      '- SHORT response only',
      '- SAY: "Ye serious lag raha hai, ABHI doctor ya emergency jayein"',
      '- No comfort tips, no education, no delays'
    );
    return rules;
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ❌ REDIRECT TO DOCTOR MODE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (mode === 'redirect_to_doctor') {
  rules.push(
    'HEALTH_MODE:',
    '- No specific meds, brands, dosages, or DIY remedies.',
    '- No validation ("safe/okay"), no diagnosis.',
    '- Only category-level info + symptom basics.',
    '- Detect red flags → advise immediate medical help.',
    '- Give questions user can ask their doctor.'
  );
}
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📘 EDUCATION ONLY MODE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (mode === 'education_only') {
    rules.push(
      '📘 EDUCATION MODE:',
      '- Explain condition simply (kyu hota hai, kaise hota hai)',
      '- ✅ ALLOW: Category-level info, test names, lifestyle factors',
      '- NO specific recommendations or endorsements',
      '- End with: "Doctor detailed diagnosis karke exact batayenge"'
    );
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌿 COMFORT + EDUCATION MODE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (mode === 'comfort_plus_education') {
    rules.push(
      '🌿 COMFORT + EDUCATION:',
      '- ✅ Comfort care: warm water, rest, steam, light food, hydration',
      '- ✅ Light explanation: why these help',
      '- ✅ Red flags: when to see doctor immediately',
      '- NO specific medicines or nuskhe recipes'
    );
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌿 COMFORT ONLY MODE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (mode === 'comfort_only') {
    rules.push(
      '🌿 COMFORT ONLY:',
      '- Basic relief: rest, hydration, warm fluids',
      '- Avoid medical depth',
      '- Soft doctor mention: "Agar 2-3 din mein theek na ho toh doctor dekhein"'
    );
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌿 BALANCED NUSKHA RESPONSE MODE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (mode === 'balanced_nuskha_response') {
    rules.push(
      '🌿 BALANCED NUSKHA RESPONSE:',
      '- User MENTIONED a nuskha - give BALANCED view',
      '- SAY: "Har cheez ke apne fyaade aur nuksaan hote hain"',
      '- ✅ GIVE benefits AND side effects/cautions:',
      '  Example: "Haldi anti-inflammatory hai, BUT pet mein heat kar sakti hai"',
      '  Example: "Ajwain gas mein help karti hai, BUT zyada se acidity ho sakti hai"',
      '- END: "Agar koi medicine le rahe ho, doctor se zaroor confirm karo"',
      '- ❌ NEVER say "ye lo", "ye best hai", "ye zaroor karo"'
    );
  }
  
  return rules;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗜️ TOKEN COMPRESSION v5.0 - 3 LAYERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Layer 1: Basic compression
const compress = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')           // multiple spaces → 1 space
    .replace(/\n\s+/g, '\n')        // remove leading spaces after newline
    .replace(/\n{3,}/g, '\n\n')     // max 2 newlines
    .trim();
};

// Layer 2: Aggressive compression (when over token limit)
const compressHard = (text: string): string => {
  return text
    .replace(/- /g, '')             // remove dash formatting
    .replace(/\*\*/g, '')           // remove bold markers
    .replace(/✅|❌|🚨|📘|🌿|⚠️|🛡️|💊/g, '')  // remove emojis
    .replace(/ {2,}/g, ' ')         // remove double spaces
    .replace(/\n{2,}/g, '\n')       // single newlines only
    .replace(/TONE:.*$/gm, '')      // remove tone instructions
    .trim();
};

// Token counter (approximate)
const countTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏥 HEALTH ENGINE v5.0 - MAIN BUILDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const buildHealthModeRules = (message: string, safety: SafetyLevel): {
  rules: string;
  intentDepth: HealthIntentDepth | null;
  responseMode: HealthResponseMode | null;
} => {
  // Not a health query
  if (safety !== 'health_query') {
    return { rules: '', intentDepth: null, responseMode: null };
  }
  
  // Detect intent depth
  const intentDepth = detectHealthIntentDepth(message);
  
  // Decide response mode
  const responseMode = decideHealthResponseMode(intentDepth);
  
  // Detect manipulation & tester mode
  const isManipulation = detectManipulation(message);
  const isTesterMode = detectTesterMode(message);
  
  // Build adaptive rules
  const rulesArray = buildAdaptiveHealthRules(responseMode, isManipulation, isTesterMode);
  
  // Add common tone rule
  rulesArray.push('TONE: Direct, mature, no-nonsense - like a knowledgeable friend');
  
  // Join and compress
  let rules = rulesArray.join('\n');
  rules = compress(rules);
  
  // Check token count
  const tokens = countTokens(rules);
  if (tokens > 80) {
    rules = compressHard(rules);
  }
  
  return { rules, intentDepth, responseMode };
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
   * MAIN ENTRY POINT
   */
  process(input: SorivaInput): SorivaOutput {
    const startTime = Date.now();

    // Step 1: Safety Check (includes health detection)
    const safety = this.analyzeSafety(input.message);
    
    if (safety.level === 'dangerous') {
      return this.buildBlockedResponse(safety, startTime);
    }

    // Step 2: Core Analysis
    const language = this.detectLanguage(input.message);
    const { primary: primaryIntent, secondary: secondaryIntent } = this.detectIntent(input.message, safety.level);
    const complexity = this.analyzeComplexity(input.message, primaryIntent);
    const emotion = this.detectEmotion(input.message);
    const repetition = this.checkRepetition(input.message, input.history || []);

    // Step 3: Build System Prompt (with v5.0 health engine)
    const systemPrompt = this.buildPrompt(input, {
      language,
      primaryIntent,
      secondaryIntent,
      complexity,
      emotion,
      safety: safety.level,
    });

    // Step 4: Calculate confidence & risk
    const confidence = this.calculateConfidence(primaryIntent, complexity, language);
    const riskScore = this.calculateRisk(safety.level, primaryIntent, input.message);

    // Step 5: Get health metadata (v5.0)
    const healthResult = buildHealthModeRules(input.message, safety.level);

    return {
      primaryIntent,
      secondaryIntent,
      complexity,
      language,
      emotion,
      isRepetitive: repetition.isRepetitive,
      repetitionCount: repetition.count,
      
      safety: safety.level,
      safetyAction: safety.action,
      blocked: false,
      
      confidenceScore: confidence,
      riskScore,
      
      routingIntent: {
        requiresPremium: riskScore > CONFIG.thresholds.premiumRisk,
        requiresLowTemp: this.needsLowTemperature(primaryIntent, safety.level),
        requiresShortResponse: primaryIntent === 'greeting' || complexity === 'simple',
        specialization: this.getSpecialization(primaryIntent, input.message),
      },
      
      systemPrompt: compress(systemPrompt),
      promptTokens: countTokens(systemPrompt),
      
      shouldAskClarification: confidence < CONFIG.thresholds.clarificationConfidence,
      clarificationReason: confidence < CONFIG.thresholds.clarificationConfidence 
        ? 'Low confidence in intent detection' 
        : undefined,
      supportResources: safety.level === 'escalate' ? CONFIG.supportResources.india : undefined,
      
      // NEW v5.0
      healthIntentDepth: healthResult.intentDepth || undefined,
      healthResponseMode: healthResult.responseMode || undefined,
      
      analysisTimeMs: Date.now() - startTime,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SAFETY ANALYSIS (with health detection)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private analyzeSafety(message: string): { level: SafetyLevel; action: 'allow' | 'allow_with_guardrails' | 'deny' | 'escalate' } {
    const lower = message.toLowerCase();
    
    // 🏥 HEALTH DETECTION - Check first
    const healthKeywords = Array.from(CONFIG.healthKeywords);
    const isHealthRelated = healthKeywords.some(keyword => lower.includes(keyword));
    
    if (isHealthRelated) {
      return { level: 'health_query', action: 'allow_with_guardrails' };
    }

    // Dangerous content
    const dangerousPatterns = /\b(bomb|explosive|hack|attack|kill|murder|suicide method|how to die)\b/i;
    if (dangerousPatterns.test(message)) {
      return { level: 'dangerous', action: 'deny' };
    }

    // Escalation needed (mental health crisis)
    const escalatePatterns = /\b(want to die|end my life|kill myself|no reason to live|better off dead)\b/i;
    if (escalatePatterns.test(message)) {
      return { level: 'escalate', action: 'escalate' };
    }

    // Sensitive topics
    const sensitivePatterns = /\b(depressed|anxiety|lonely|sad|hopeless|stressed|overwhelmed)\b/i;
    if (sensitivePatterns.test(message)) {
      return { level: 'sensitive', action: 'allow_with_guardrails' };
    }

    return { level: 'clean', action: 'allow' };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LANGUAGE DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectLanguage(message: string): LanguageType {
    const hindiPatterns = /\b(kya|kaise|kyun|hai|ho|hain|mein|mujhe|tum|aap|yeh|wo|karo|batao|samjhao|bhai|yaar|theek|accha|nahi|haan|aur|lekin|matlab|wala|waali|karna|hona|jaana|aana|kaisa|kaisi|abhi|bahut|zyada|kam|sab|kuch|koi|kon|kab|kidhar|idhar|udhar)\b/gi;
    const hindiMatches = message.match(hindiPatterns) || [];
    const words = message.split(/\s+/).length;
    const hindiRatio = hindiMatches.length / words;

    if (hindiRatio === 0) return 'en';
    if (hindiRatio > 0.6) return 'hi';
    return 'mix';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTENT DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectIntent(message: string, safety: SafetyLevel): { primary: IntentType; secondary?: IntentType } {
    // Health queries get health intent
    if (safety === 'health_query') {
      return { primary: 'health', secondary: 'question' };
    }

    const patterns: Record<IntentType, RegExp> = {
      greeting: /^(hi|hello|hey|namaste|namaskar|kaise ho|how are you|good morning|good evening|sup|yo)\b/i,
      emotional: /\b(feel|feeling|sad|happy|anxious|stressed|worried|scared|angry|frustrated|depressed|lonely|hurt|upset)\b/i,
      technical: /\b(code|programming|error|bug|function|api|database|server|deploy|git|react|node|python|javascript|typescript|sql)\b/i,
      learning: /\b(explain|samjhao|teach|learn|understand|concept|theory|how does|what is|define|meaning)\b/i,
      task: /\b(write|create|make|generate|draft|compose|build|design|plan|list|summarize|translate)\b/i,
      creative: /\b(story|poem|joke|song|script|creative|imagine|fiction|character|plot)\b/i,
      question: /\?$|\b(what|why|how|when|where|who|which|kya|kyun|kaise|kab|kahan|kaun)\b/i,
      health: /\b(medicine|tablet|dawai|dawa|goli|treatment|cure|ilaj|remedy|symptoms|diagnosis|bimari|bp|blood\s*pressure|sugar|diabetes|cholesterol|fever|bukhar|infection|disease)\b/i,
      casual: /.*/,
    };

    let primary: IntentType = 'casual';
    let secondary: IntentType | undefined;

    for (const [intent, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        if (!primary || primary === 'casual') {
          primary = intent as IntentType;
        } else if (!secondary && intent !== primary) {
          secondary = intent as IntentType;
          break;
        }
      }
    }

    return { primary, secondary };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPLEXITY ANALYSIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private analyzeComplexity(message: string, intent: IntentType): ComplexityLevel {
    const words = message.split(/\s+/).length;
    const hasComplexConcept = Array.from(CONFIG.complexConcepts).some(c => 
      message.toLowerCase().includes(c)
    );

    if (intent === 'greeting') return 'simple';
    if (hasComplexConcept || words > 50) return 'complex';
    if (words > 20 || intent === 'technical' || intent === 'learning') return 'medium';
    return 'simple';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMOTION DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectEmotion(message: string): EmotionType {
    const lower = message.toLowerCase();
    
    const positivePatterns = /\b(happy|excited|great|amazing|wonderful|love|thank|thanks|awesome|fantastic|good|nice|yay|haha|lol|😊|😀|🎉|❤️)\b/i;
    const negativePatterns = /\b(sad|angry|frustrated|upset|worried|anxious|stressed|depressed|hate|terrible|awful|bad|worst|ugh|😢|😞|😠|💔)\b/i;

    if (positivePatterns.test(lower)) return 'positive';
    if (negativePatterns.test(lower)) return 'negative';
    return 'neutral';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REPETITION CHECK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private checkRepetition(message: string, history: Array<{ role: string; content: string }>): { isRepetitive: boolean; count: number } {
    const userMessages = history.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    const currentLower = message.toLowerCase();
    
    const count = userMessages.filter(m => 
      m === currentLower || 
      this.similarity(m, currentLower) > 0.8
    ).length;

    return { isRepetitive: count >= 2, count };
  }

  private similarity(a: string, b: string): number {
    const setA = new Set(a.split(/\s+/));
    const setB = new Set(b.split(/\s+/));
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 PROMPT BUILDER (WITH v5.0 HEALTH ENGINE)
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

    const langRule = language === 'en'
      ? `Use English only.`
      : `Use Hinglish in Roman script (no Devanagari). Feminine tone: karungi/bataungi.`;

    // 🏥 v5.0 DYNAMIC HEALTH RULES
    const healthResult = buildHealthModeRules(input.message, safety);
    const healthModeRules = healthResult.rules;

    const safetyHint = safety === 'escalate'
      ? `CRITICAL: User shows distress. Be calm, caring, short. Encourage professional help.`
      : safety === 'sensitive'
      ? `Sensitive topic—be empathetic and grounded.`
      : '';

    const emotionHint = emotion === 'negative' 
      ? `User seems stressed—respond gently.` 
      : '';

    let systemPrompt = `You are Soriva, a ${tone} female AI assistant by Risenex Dynamics${nameStr}.

${langRule}
${emotionHint}
${safetyHint}
${healthModeRules}

CORE RULES:
- Never say "I am Soriva" unless asked "who are you"
- Never mention ChatGPT, Gemini, Claude, OpenAI
- Never be repetitive
- Max 1-2 emoji
- Roman script only, no Devanagari

QUALITY:
- Give specific, actionable answers
- Use examples when explaining
- Match complexity to question
- Be warm and human, not robotic`;

    // Apply compression
    systemPrompt = compress(systemPrompt);
    
    // Check token limit
    const tokens = countTokens(systemPrompt);
    if (tokens > CONFIG.thresholds.maxPromptTokens) {
      systemPrompt = compressHard(systemPrompt);
    }

    return systemPrompt;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getTrait(intent: IntentType, emotion: EmotionType, safety: SafetyLevel): string {
    if (safety === 'escalate') return 'calm, caring, and supportive';
    if (emotion === 'negative') return 'gentle and understanding';
    
    const traits: Record<IntentType, string> = {
      greeting: 'warm and friendly',
      casual: 'friendly and conversational',
      question: 'helpful and informative',
      learning: 'patient and thorough',
      technical: 'precise and knowledgeable',
      emotional: 'empathetic and supportive',
      task: 'efficient and detail-oriented',
      creative: 'imaginative and expressive',
      health: 'caring and responsible',
    };
    
    return traits[intent] || 'helpful';
  }

  private needsLowTemperature(intent: IntentType, safety: SafetyLevel): boolean {
    return safety === 'health_query' || 
           intent === 'technical' || 
           intent === 'health' ||
           Array.from(CONFIG.deterministicTopics).some(t => intent === t as IntentType);
  }

  private calculateConfidence(intent: IntentType, complexity: ComplexityLevel, language: LanguageType): number {
    let confidence = 70;
    if (intent !== 'casual') confidence += 15;
    if (complexity === 'simple') confidence += 10;
    if (language !== 'mix') confidence += 5;
    return Math.min(confidence, 100);
  }

  private calculateRisk(safety: SafetyLevel, intent: IntentType, message: string): number {
    let risk = 0;
    if (safety === 'dangerous') risk = 100;
    else if (safety === 'escalate') risk = 80;
    else if (safety === 'health_query') risk = 60;
    else if (safety === 'sensitive') risk = 40;
    
    if (intent === 'health') risk = Math.max(risk, 50);
    
    return risk;
  }

  private getSpecialization(intent: IntentType, message: string): string | undefined {
    if (intent === 'technical') return 'coding';
    if (intent === 'health') return 'health';
    if (intent === 'creative') return 'creative';
    return undefined;
  }

  private buildBlockedResponse(safety: { level: SafetyLevel; action: string }, startTime: number): SorivaOutput {
    return {
      primaryIntent: 'casual',
      complexity: 'simple',
      language: 'en',
      emotion: 'neutral',
      isRepetitive: false,
      repetitionCount: 0,
      safety: safety.level,
      safetyAction: 'deny',
      blocked: true,
      blockReason: 'Content violates safety guidelines',
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
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUALITY CHECK (v5.0 - Health Response Validation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const qualityCheckHealthResponse = (
  response: string,
  analysis: { safety: SafetyLevel; primaryIntent: IntentType }
): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];

  if (analysis.safety !== 'health_query' && analysis.primaryIntent !== 'health') {
    return { passed: true, issues: [] };
  }

  // Pattern 1: Specific medicine names (suffix-based)
  const medicineSuffixes = /\b[a-z]*?(atorva|rosuva|simva|prava|fluva|lova|pitava)statin\b|\b[a-z]*?(lisino|ena|ramip|benazepr|captop|fosino)pril\b|\b[a-z]*?(losar|valsar|telmi|olmesar|candesar|irbesar)tan\b|\b[a-z]*?(meto|aten|biso|carve|nado|propran)olol\b|\b[a-z]*?(amlod|nifed|felod|nicardl)ipine\b|\b[a-z]*?metformin\b/i;
  if (medicineSuffixes.test(response)) {
    issues.push('MEDICINE_NAME_DETECTED');
  }

  // Pattern 2: Common medicine names
  const commonMedicines = /\b(aspirin|paracetamol|crocin|dolo|ibuprofen|diclofenac|naproxen|omeprazole|pantoprazole|cetirizine|azithromycin|amoxicillin|ciprofloxacin|combiflam)\b/i;
  if (commonMedicines.test(response)) {
    issues.push('COMMON_MEDICINE_DETECTED');
  }

  // Pattern 3: Brand names
  const brandNames = /\b(lipitor|crestor|zocor|glucophage|glycomet|januvia|jardiance|ozempic|calpol|vicks|benadryl|allegra|zyrtec|nexium|zantac)\b/i;
  if (brandNames.test(response)) {
    issues.push('BRAND_NAME_DETECTED');
  }

  // Pattern 4: Dosage patterns
  if (/\d+\s*(mg|ml|mcg|iu|g)\b/i.test(response)) {
    issues.push('DOSAGE_DETECTED');
  }

  // Pattern 5: Validation phrases
  if (/\b(theek hai|sahi hai|safe hai|perfect hai|sahi diya|good choice)\b/i.test(response)) {
    issues.push('VALIDATION_PHRASE_DETECTED');
  }

  // Pattern 6: Nuskha recipes (when AI suggests)
  if (/\b(piyo|khao|banao|lo|lelo)\b/i.test(response) && 
      /\b(haldi|ajwain|hing|kadha|methi|lehsun|adrak)\b/i.test(response)) {
    issues.push('NUSKHA_RECIPE_SUGGESTED');
  }

  return { passed: issues.length === 0, issues };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const sorivaIntelligence = SorivaIntelligence.getInstance();

export {
  detectHealthIntentDepth,
  decideHealthResponseMode,
  buildAdaptiveHealthRules,
  buildHealthModeRules,
  detectManipulation,
  detectTesterMode,
  compress,
  compressHard,
  countTokens,
};