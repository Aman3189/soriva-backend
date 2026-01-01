/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SMART ROUTING SERVICE v2.1
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created: November 30, 2025
 * Updated: December 21, 2025 (v2.1 - Enhanced)
 * 
 * Dynamic AI model selection based on:
 * - Query complexity (CASUAL → EXPERT)
 * - Budget pressure (usage tracking)
 * - Plan type (available models)
 * - Context type (high-stakes detection)
 * - Specialization matching (code, business, writing)
 * 
 * v2.1 Enhancements:
 * - Fallback chain for reliability
 * - Confidence scoring
 * - Improved pattern matching
 * - Better SOVEREIGN support
 * 
 * Result: Better quality + Lower cost + Higher margins
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType } from '../../constants';
import { MODEL_COSTS_INR_PER_1M } from '../../constants/plans';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ModelId =
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.5-flash'
  | 'moonshotai/kimi-k2-thinking'
  | 'gemini-2.5-pro'
  | 'gemini-3-pro'
  | 'claude-sonnet-4-5'
  | 'gpt-5.1';

export type ComplexityTier = 'CASUAL' | 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'EXPERT';

export type QualityLevel = 'good' | 'high' | 'max';

export interface ModelMeta {
  id: ModelId;
  displayName: string;
  provider: string;
  qualityScore: number;        // 0–1
  latencyScore: number;        // 0–1 (1 = fastest)
  reliabilityScore: number;    // 0–1 (1 = most reliable) [NEW]
  specialization: {
    code: number;              // 0–1
    business: number;
    writing: number;
    reasoning: number;
  };
  costPer1M: number;           // ₹ from MODEL_COSTS_INR_PER_1M
}

export interface RoutingInput {
  text: string;
  planType: PlanType;
  userId: string;
  monthlyUsedTokens: number;
  monthlyLimitTokens: number;
  dailyUsedTokens: number;
  dailyLimitTokens: number;
  isHighStakesContext?: boolean;
  conversationContext?: string;
}

export interface RoutingDecision {
  modelId: ModelId;
  provider: string;
  displayName: string;
  reason: string;
  complexity: ComplexityTier;
  budgetPressure: number;
  estimatedCost: number;
  expectedQuality: QualityLevel;
  specialization?: string;
  // NEW: v2.1 additions
  fallbackChain: ModelId[];    // Ordered fallback models
  confidence: number;          // 0-1 routing confidence
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL REGISTRY (Enhanced with reliability scores)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MODEL_REGISTRY: ModelMeta[] = [
  {
    id: 'gemini-2.5-flash-lite',
    displayName: 'Gemini Flash Lite',
    provider: 'gemini',
    qualityScore: 0.55,
    latencyScore: 1.0,
    reliabilityScore: 0.95,
    specialization: { code: 0.4, business: 0.4, writing: 0.4, reasoning: 0.4 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gemini-2.5-flash-lite'] || 32.56,
  },
  {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini Flash',
    provider: 'gemini',
    qualityScore: 0.65,
    latencyScore: 0.95,
    reliabilityScore: 0.95,
    specialization: { code: 0.55, business: 0.55, writing: 0.55, reasoning: 0.55 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gemini-2.5-flash'] || 32.56,
  },
  {
    id: 'moonshotai/kimi-k2-thinking',
    displayName: 'Kimi K2',
    provider: 'moonshot',
    qualityScore: 0.72,
    latencyScore: 0.75,
    reliabilityScore: 0.88,
    specialization: { code: 0.65, business: 0.7, writing: 0.75, reasoning: 0.8 },
    costPer1M: MODEL_COSTS_INR_PER_1M['moonshotai/kimi-k2-thinking'] || 206.58,
  },
  {
    id: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    provider: 'gemini',
    qualityScore: 0.82,
    latencyScore: 0.6,
    reliabilityScore: 0.92,
    specialization: { code: 0.8, business: 0.8, writing: 0.78, reasoning: 0.85 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gemini-2.5-pro'] || 810.27,
  },
  {
    id: 'gemini-3-pro',
    displayName: 'Gemini 3 Pro',
    provider: 'gemini',
    qualityScore: 0.88,
    latencyScore: 0.55,
    reliabilityScore: 0.90,
    specialization: { code: 0.85, business: 0.85, writing: 0.85, reasoning: 0.9 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gemini-3-pro'] || 982.03,
  },
  {
    id: 'gpt-5.1',
    displayName: 'GPT-5.1',
    provider: 'openai',
    qualityScore: 0.92,
    latencyScore: 0.5,
    reliabilityScore: 0.95,
    specialization: { code: 0.95, business: 0.88, writing: 0.88, reasoning: 0.92 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gpt-5.1'] || 810.27,
  },
  {
    id: 'claude-sonnet-4-5',
    displayName: 'Claude Sonnet 4.5',
    provider: 'claude',
    qualityScore: 0.96,
    latencyScore: 0.5,
    reliabilityScore: 0.97,
    specialization: { code: 0.92, business: 0.95, writing: 1.0, reasoning: 1.0 },
    costPer1M: MODEL_COSTS_INR_PER_1M['claude-sonnet-4-5'] || 1217.87,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const APEX_BUDGET_THRESHOLD = 0.9;

const COST_THRESHOLDS = {
  CHEAP: 300,      // ₹300/1M
  MEDIUM: 500,     // ₹500/1M  
  EXPENSIVE: 900,  // ₹900/1M
};

const TOKEN_ESTIMATES: Record<ComplexityTier, number> = {
  CASUAL: 500,
  SIMPLE: 1500,
  MEDIUM: 3000,
  COMPLEX: 6000,
  EXPERT: 15000,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN → AVAILABLE MODELS MAPPING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN → AVAILABLE MODELS MAPPING (CORRECTED from plans.ts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// INDIA MODELS
const PLAN_AVAILABLE_MODELS: Record<PlanType, ModelId[]> = {
  // STARTER: Flash-Lite 50% + Kimi 50%
  [PlanType.STARTER]: [
    'gemini-2.5-flash-lite',
    'moonshotai/kimi-k2-thinking',
  ],
  
  // PLUS: Kimi 50% + Flash 50% (NO Pro, NO GPT)
  [PlanType.PLUS]: [
    'moonshotai/kimi-k2-thinking',
    'gemini-2.5-flash',
  ],
  
  // PRO: Flash 60% + Kimi 20% + GPT 20%
  [PlanType.PRO]: [
    'gemini-2.5-flash',
    'moonshotai/kimi-k2-thinking',
    'gpt-5.1',
  ],
  
  // APEX: Flash 41.1% + Kimi 41.1% + Pro 6.9% + GPT 10.9%
  [PlanType.APEX]: [
    'gemini-2.5-flash',
    'moonshotai/kimi-k2-thinking',
    'gemini-2.5-pro',
    'gpt-5.1',
  ],
  
  // SOVEREIGN: All models
  [PlanType.SOVEREIGN]: [
    'gemini-2.5-flash',
    'moonshotai/kimi-k2-thinking',
    'gemini-3-pro',
    'gpt-5.1',
    'claude-sonnet-4-5',
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMART ROUTING SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class SmartRoutingService {
  private static instance: SmartRoutingService;

  private constructor() {
    console.log('✅ Smart Routing Service v2.1 initialized');
  }

  public static getInstance(): SmartRoutingService {
    if (!SmartRoutingService.instance) {
      SmartRoutingService.instance = new SmartRoutingService();
    }
    return SmartRoutingService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN ROUTING METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public route(input: RoutingInput): RoutingDecision {
    const startTime = Date.now();

    // Step 1: Detect complexity
    const complexity = this.detectComplexity(input.text);

    // Step 2: Calculate budget pressure
    const pressureMonthly = this.calculateBudgetPressure(
      input.monthlyUsedTokens,
      input.monthlyLimitTokens
    );
    const pressureDaily = this.calculateBudgetPressure(
      input.dailyUsedTokens,
      input.dailyLimitTokens
    );
    const budgetPressure = Math.max(pressureMonthly, pressureDaily);

    // Step 3: Detect high-stakes context
    const isHighStakes = input.isHighStakesContext || this.detectHighStakes(input.text);

    // Step 4: Detect specialization needed
    const specialization = this.detectSpecialization(input.text);

    // Step 5: Get available models for plan
    const availableModelIds = PLAN_AVAILABLE_MODELS[input.planType] || ['gemini-2.5-flash-lite'];
    const availableModels = MODEL_REGISTRY.filter(m => availableModelIds.includes(m.id));

    // Step 6: Filter models based on budget (unless high-stakes or SOVEREIGN)
    const isSovereign = input.planType === PlanType.SOVEREIGN;
    const candidateModels = this.filterByBudget(
      availableModels,
      budgetPressure,
      isHighStakes,
      input.planType === PlanType.APEX,
      isSovereign
    );

    // Step 7: Score and rank all candidate models
    const rankedModels = this.rankModels(
      candidateModels,
      complexity,
      budgetPressure,
      isHighStakes,
      specialization
    );

    // Step 8: Select best model and build fallback chain
    const bestModel = rankedModels[0];
    const fallbackChain = rankedModels.slice(1, 3).map(m => m.id);

    // Step 9: Calculate estimated cost
    const estimatedTokens = TOKEN_ESTIMATES[complexity];
    const estimatedCost = (bestModel.costPer1M * estimatedTokens) / 1_000_000;

    // Step 10: Determine quality level and confidence
    const expectedQuality = this.getQualityLevel(bestModel.qualityScore);
    const confidence = this.calculateConfidence(
      rankedModels,
      complexity,
      isHighStakes,
      specialization
    );

    const routingTime = Date.now() - startTime;

    // Logging
    console.log(`[SmartRouting] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`[SmartRouting] 📊 Query: ${complexity} | Budget: ${(budgetPressure * 100).toFixed(0)}%`);
    console.log(`[SmartRouting] 🎯 Selected: ${bestModel.displayName} (${expectedQuality})`);
    console.log(`[SmartRouting] 🔄 Fallbacks: ${fallbackChain.length > 0 ? fallbackChain.join(' → ') : 'none'}`);
    console.log(`[SmartRouting] 📈 Confidence: ${(confidence * 100).toFixed(0)}% | Time: ${routingTime}ms`);
    console.log(`[SmartRouting] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    return {
      modelId: bestModel.id,
      provider: bestModel.provider,
      displayName: bestModel.displayName,
      reason: this.buildReason(complexity, budgetPressure, isHighStakes, specialization),
      complexity,
      budgetPressure,
      estimatedCost,
      expectedQuality,
      specialization: specialization || undefined,
      fallbackChain,
      confidence,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPLEXITY DETECTION (Enhanced patterns)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectComplexity(text: string): ComplexityTier {
    const words = text.trim().split(/\s+/);
    const length = words.length;

    // EXPERT: Code, legal, medical, finance
    const expertPatterns = [
      /```[\s\S]{20,}```/,                                // Code blocks with content
      /\b(function|const|let|var)\s+\w+\s*[=(]/,          // Variable/function declarations
      /class\s+\w+\s*(extends|implements|{)/,             // Class definitions
      /import\s+.*from\s*['"`]/,                          // ES6 imports
      /(SELECT|INSERT|UPDATE|DELETE)\s+.*FROM/i,          // SQL queries
      /(CREATE|ALTER|DROP)\s+(TABLE|INDEX|DATABASE)/i,    // DDL statements
      /\b(async|await)\s+/,                               // Async patterns
      /\.(map|filter|reduce|forEach)\s*\(/,               // Array methods
      /\b(interface|type|enum)\s+\w+/,                    // TypeScript
      /\b(indemnity|arbitration|jurisdiction|liability)\b/i, // Legal
      /(term\s*sheet|cap\s*table|valuation|dilution)\b/i, // Finance
      /\b(diagnos|prognosis|prescription|dosage)\b/i,     // Medical
      /\b(algorithm|complexity|optimization|architecture)\b/i, // Technical
    ];

    if (expertPatterns.some(pattern => pattern.test(text))) {
      return 'EXPERT';
    }

    // COMPLEX: Analysis, comparison, strategy
    const complexPatterns = [
      /\b(explain\s+(in\s+detail|thoroughly|completely))\b/i,
      /\b(analyze|compare|evaluate|design|architect|implement)\b/i,
      /\b(strategy|framework|methodology|approach|roadmap)\b/i,
      /\b(why\s+(does|do|is|are|should|would))\b/i,
      /\b(how\s+(does|do|can|should|would)\s+\w+\s+work)\b/i,
      /\b(pros\s*(and|&)\s*cons|trade-?offs?|advantages?\s*(vs|and)\s*disadvantages?)\b/i,
      /\b(step\s*by\s*step|in-?depth|comprehensive)\b/i,
      /\?.*\?/,                                           // Multiple questions
    ];

    if (complexPatterns.some(pattern => pattern.test(text)) || length > 150) {
      return 'COMPLEX';
    }

    // MEDIUM: Help requests, creation tasks
    const mediumPatterns = [
      /\b(help\s+(me\s+)?(with|to|create|write|build))\b/i,
      /\b(create|write|generate|make|build|design)\s+\w/i,
      /\b(example|tutorial|guide|steps|how\s+to)\b/i,
      /\b(can\s+you|could\s+you|would\s+you|please)\b/i,
    ];

    if (mediumPatterns.some(pattern => pattern.test(text)) || length > 50) {
      return 'MEDIUM';
    }

    // CASUAL: Greetings, acknowledgments
    const casualPatterns = [
      /^(hi|hello|hey|yo|sup|hola|namaste|namaskar)\b/i,
      /^(good\s*(morning|afternoon|evening|night))\b/i,
      /^(thanks|thank\s*you|thx|ty|dhanyawad|shukriya)\b/i,
      /^(bye|goodbye|see\s*you|take\s*care|alvida)\b/i,
      /^(ok|okay|alright|got\s*it|cool|nice|great|awesome)\b/i,
      /^(yes|no|yeah|nope|haan|nahi|ji)\b/i,
      /^(kya\s*hal|kaise\s*ho|theek\s*hai)\b/i,
    ];

    if (casualPatterns.some(pattern => pattern.test(text)) || length <= 5) {
      return 'CASUAL';
    }

    // SIMPLE: Short factual queries
    if (length <= 20) {
      return 'SIMPLE';
    }

    return 'MEDIUM';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HIGH-STAKES DETECTION (Enhanced)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectHighStakes(text: string): boolean {
    const highStakesPatterns = [
      // Legal
      /\b(contract|agreement|legal|lawsuit|liability|compliance)\b/i,
      /\b(terms\s*(and|&)\s*conditions|privacy\s*policy|nda|mou|sla)\b/i,
      /\b(court|judge|lawyer|attorney|litigation|arbitration)\b/i,
      
      // Financial
      /\b(investment|tax|audit|financial\s*statement|balance\s*sheet)\b/i,
      /\b(revenue|profit|loss|budget|forecast|valuation|funding)\b/i,
      /₹\s*\d{5,}|\$\s*\d{4,}|€\s*\d{4,}/,               // Large money amounts
      /\b(crore|lakh|million|billion)\s*(rupees?|dollars?|usd|inr)?\b/i,
      
      // Medical/Health
      /\b(diagnos|medical|health|symptom|treatment|prescription)\b/i,
      /\b(disease|condition|medication|surgery|therapy|doctor)\b/i,
      /\b(patient|hospital|clinic|emergency)\b/i,
      
      // Business Critical
      /\b(pitch\s*deck|investor|funding|acquisition|merger|ipo)\b/i,
      /\b(board\s*meeting|stakeholder|shareholder|ceo|cfo)\b/i,
      /\b(confidential|sensitive|proprietary|trade\s*secret)\b/i,
      
      // Security
      /\b(password|security|encryption|vulnerability|breach|hack)\b/i,
      /\b(authentication|authorization|api\s*key|secret|token)\b/i,
      /\b(ssl|tls|oauth|jwt|firewall)\b/i,
    ];

    return highStakesPatterns.some(pattern => pattern.test(text));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SPECIALIZATION DETECTION (Enhanced)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectSpecialization(text: string): 'code' | 'business' | 'writing' | 'reasoning' | null {
    const lowerText = text.toLowerCase();

    // Code detection (highest priority for technical queries)
    const codePatterns = [
      /```/,
      /\b(code|bug|error|debug|function|api|database|query|schema)\b/,
      /\b(typescript|javascript|python|react|node|sql|prisma|flutter|dart)\b/,
      /\b(npm|pip|git|docker|aws|gcp|azure|deploy|server)\b/,
      /\b(frontend|backend|fullstack|devops|ci\s*\/?\s*cd)\b/,
      /[{}\[\]();=].*[{}\[\]();=]/,
    ];
    if (codePatterns.some(p => p.test(text))) {
      return 'code';
    }

    // Business detection
    const businessPatterns = [
      /\b(pitch|investor|startup|revenue|margin|roi|kpi|okr)\b/,
      /\b(marketing|sales|customer|product|growth|strategy)\b/,
      /\b(pricing|competition|market|business|company|enterprise)\b/,
      /\b(excel|spreadsheet|presentation|report|analysis|dashboard)\b/,
      /\b(b2b|b2c|saas|mrr|arr|churn|ltv|cac)\b/,
    ];
    if (businessPatterns.some(p => p.test(lowerText))) {
      return 'business';
    }

    // Writing detection
    const writingPatterns = [
      /\b(write|draft|compose|essay|article|blog|story|poem)\b/,
      /\b(email|letter|message|content|copy|script|caption)\b/,
      /\b(creative|fiction|narrative|description|headline)\b/,
      /\b(tone|style|formal|casual|professional|friendly)\b/,
      /\b(proofread|edit|rewrite|rephrase|paraphrase|summarize)\b/,
    ];
    if (writingPatterns.some(p => p.test(lowerText))) {
      return 'writing';
    }

    // Reasoning detection
    const reasoningPatterns = [
      /\b(why|how|explain|analyze|compare|evaluate|argue)\b/,
      /\b(logic|reason|argument|conclusion|evidence|proof)\b/,
      /\b(pros\s*(and|&)\s*cons|trade-?off|decision|choose|decide)\b/,
      /\b(philosophy|ethics|morality|principle|theory)\b/,
      /\b(think|opinion|perspective|view|consider|believe)\b/,
    ];
    if (reasoningPatterns.some(p => p.test(lowerText))) {
      return 'reasoning';
    }

    return null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BUDGET PRESSURE CALCULATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private calculateBudgetPressure(used: number, limit: number): number {
    if (limit <= 0) return 1;
    
    const ratio = used / limit;
    
    if (ratio <= 0.5) return 0;           // Chill zone (0-50%)
    if (ratio >= 0.95) return 1;          // Red zone (95%+)
    
    // Smooth ramp from 0.5 to 0.95 → 0 to 1
    return (ratio - 0.5) / 0.45;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BUDGET-BASED FILTERING (Enhanced with SOVEREIGN support)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private filterByBudget(
    models: ModelMeta[],
    pressure: number,
    isHighStakes: boolean,
    isApex: boolean,
    isSovereign: boolean
  ): ModelMeta[] {
    // SOVEREIGN: Always allow all models (founder access)
    if (isSovereign) {
      return models;
    }

    // High stakes: Always allow all models
    if (isHighStakes) {
      return models;
    }

    // APEX with low pressure: Allow all
    if (isApex && pressure < APEX_BUDGET_THRESHOLD) {
      return models;
    }

    // Critical pressure (>90%): Only cheapest models
    if (pressure > 0.9) {
      const filtered = models.filter(m => m.costPer1M <= COST_THRESHOLDS.CHEAP);
      return filtered.length > 0 ? filtered : [models[0]];
    }

    // High pressure (>75%): Exclude expensive models
    if (pressure > 0.75) {
      const filtered = models.filter(m => m.costPer1M <= COST_THRESHOLDS.MEDIUM);
      return filtered.length > 0 ? filtered : models;
    }

    // Medium pressure (>60%): Exclude most expensive
    if (pressure > 0.6) {
      const filtered = models.filter(m => m.costPer1M < COST_THRESHOLDS.EXPENSIVE);
      return filtered.length > 0 ? filtered : models;
    }

    return models;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODEL RANKING (NEW: Returns sorted array for fallback chain)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private rankModels(
    models: ModelMeta[],
    complexity: ComplexityTier,
    pressure: number,
    isHighStakes: boolean,
    specialization: 'code' | 'business' | 'writing' | 'reasoning' | null
  ): ModelMeta[] {
    if (models.length === 0) {
      return [MODEL_REGISTRY[0]]; // Fallback to Flash Lite
    }

    if (models.length === 1) {
      return models;
    }

    // Score all models and sort by score (descending)
    const scored = models.map(model => ({
      model,
      score: this.scoreModel(model, complexity, pressure, isHighStakes, specialization),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.map(s => s.model);
  }

  private scoreModel(
    model: ModelMeta,
    complexity: ComplexityTier,
    pressure: number,
    isHighStakes: boolean,
    specialization: 'code' | 'business' | 'writing' | 'reasoning' | null
  ): number {
    // Quality weight based on complexity
    const qualityWeights: Record<ComplexityTier, number> = {
      CASUAL: 0.25,
      SIMPLE: 0.35,
      MEDIUM: 0.55,
      COMPLEX: 0.75,
      EXPERT: 0.95,
    };
    const qualityWeight = qualityWeights[complexity];

    // High-stakes boost
    const highStakesBoost = isHighStakes ? 0.15 : 0;
    const effectiveQuality = Math.min(1, model.qualityScore + highStakesBoost);

    // Cost normalization (cheaper = higher score)
    const maxCost = 1300; // Max cost in registry
    const costNorm = Math.max(0, Math.min(1, 1 - (model.costPer1M / maxCost)));

    // Budget pressure affects cost weight
    const baseCostWeight = 0.25 + (pressure * 0.45);   // 0.25 → 0.7
    const adjustedQualityWeight = qualityWeight * (0.85 - pressure * 0.35);

    // Latency bonus (faster = better for simple queries)
    const latencyWeight = complexity === 'CASUAL' ? 0.2 : 0.08;

    // Reliability bonus
    const reliabilityWeight = 0.1;

    // Specialization bonus
    let specBonus = 0;
    if (specialization && model.specialization[specialization]) {
      specBonus = model.specialization[specialization] * 0.15;
    }

    // Final score
    const score =
      adjustedQualityWeight * effectiveQuality +
      baseCostWeight * costNorm +
      latencyWeight * model.latencyScore +
      reliabilityWeight * model.reliabilityScore +
      specBonus;

    return score;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIDENCE CALCULATION (NEW)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private calculateConfidence(
    rankedModels: ModelMeta[],
    complexity: ComplexityTier,
    isHighStakes: boolean,
    specialization: string | null
  ): number {
    let confidence = 0.7; // Base confidence

    // More models = more options = higher confidence
    if (rankedModels.length >= 3) confidence += 0.1;

    // Clear complexity = higher confidence
    if (complexity === 'CASUAL' || complexity === 'EXPERT') {
      confidence += 0.08;
    }

    // High-stakes with premium model = higher confidence
    if (isHighStakes && rankedModels[0].qualityScore >= 0.85) {
      confidence += 0.1;
    }

    // Specialization match = higher confidence
    if (specialization) {
      const specKey = specialization as 'code' | 'business' | 'writing' | 'reasoning';
      const specScore = rankedModels[0].specialization[specKey];
      if (specScore >= 0.8) {
        confidence += 0.07;
      }
    }

    // Score gap between top 2 = clearer winner = higher confidence
    if (rankedModels.length >= 2) {
      const scoreDiff = rankedModels[0].qualityScore - rankedModels[1].qualityScore;
      if (scoreDiff > 0.15) confidence += 0.05;
    }

    return Math.min(1, confidence);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getQualityLevel(qualityScore: number): QualityLevel {
    if (qualityScore >= 0.9) return 'max';
    if (qualityScore >= 0.7) return 'high';
    return 'good';
  }

  private buildReason(
    complexity: ComplexityTier,
    pressure: number,
    isHighStakes: boolean,
    specialization: string | null
  ): string {
    const parts: string[] = [];
    
    parts.push(`complexity=${complexity}`);
    
    if (pressure > 0.3) {
      parts.push(`budget=${(pressure * 100).toFixed(0)}%`);
    }
    
    if (isHighStakes) parts.push('high-stakes');
    if (specialization) parts.push(`spec=${specialization}`);

    return `SmartRoute: ${parts.join(', ')}`;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public getAvailableModels(planType: PlanType): ModelMeta[] {
    const modelIds = PLAN_AVAILABLE_MODELS[planType] || ['gemini-2.5-flash-lite'];
    return MODEL_REGISTRY.filter(m => modelIds.includes(m.id));
  }

  public getModelById(modelId: ModelId): ModelMeta | undefined {
    return MODEL_REGISTRY.find(m => m.id === modelId);
  }

  public getAllModels(): ModelMeta[] {
    return [...MODEL_REGISTRY];
  }

  public getModelRegistry(): ModelMeta[] {
    return [...MODEL_REGISTRY];
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const smartRoutingService = SmartRoutingService.getInstance();