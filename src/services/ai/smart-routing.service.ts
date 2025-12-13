/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SMART ROUTING SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created: November 30, 2025
 * 
 * Dynamic AI model selection based on:
 * - Query complexity (CASUAL → EXPERT)
 * - Budget pressure (usage tracking)
 * - Plan type (available models)
 * - Context type (high-stakes detection)
 * - Specialization matching (code, business, writing)
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
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL REGISTRY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MODEL_REGISTRY: ModelMeta[] = [
  {
    id: 'gemini-2.5-flash-lite',
    displayName: 'Gemini Flash Lite',
    provider: 'gemini',
    qualityScore: 0.55,
    latencyScore: 1.0,
    specialization: { code: 0.4, business: 0.4, writing: 0.4, reasoning: 0.4 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gemini-2.5-flash-lite'] || 32.56,
  },
  {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini Flash',
    provider: 'gemini',
    qualityScore: 0.6,
    latencyScore: 0.95,
    specialization: { code: 0.5, business: 0.5, writing: 0.5, reasoning: 0.5 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gemini-2.5-flash'] || 32.56,
  },
  {
    id: 'moonshotai/kimi-k2-thinking',
    displayName: 'Kimi K2',
    provider: 'moonshot',
    qualityScore: 0.7,
    latencyScore: 0.8,
    specialization: { code: 0.6, business: 0.65, writing: 0.7, reasoning: 0.75 },
    costPer1M: MODEL_COSTS_INR_PER_1M['moonshotai/kimi-k2-thinking'] || 206.58,
  },
  {
    id: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    provider: 'gemini',
    qualityScore: 0.8,
    latencyScore: 0.6,
    specialization: { code: 0.75, business: 0.75, writing: 0.75, reasoning: 0.8 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gemini-2.5-pro'] || 810.27,
  },
  {
    id: 'gemini-3-pro',
    displayName: 'Gemini 3 Pro',
    provider: 'gemini',
    qualityScore: 0.85,
    latencyScore: 0.55,
    specialization: { code: 0.8, business: 0.8, writing: 0.8, reasoning: 0.85 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gemini-3-pro'] || 982.03,
  },
  {
    id: 'gpt-5.1',
    displayName: 'GPT-5.1',
    provider: 'openai',
    qualityScore: 0.9,
    latencyScore: 0.5,
    specialization: { code: 0.95, business: 0.85, writing: 0.85, reasoning: 0.9 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gpt-5.1'] || 810.27,
  },
  {
    id: 'claude-sonnet-4-5',
    displayName: 'Claude Sonnet 4.5',
    provider: 'claude',
    qualityScore: 0.95,
    latencyScore: 0.5,
    specialization: { code: 0.9, business: 0.95, writing: 1.0, reasoning: 1.0 },
    costPer1M: MODEL_COSTS_INR_PER_1M['claude-sonnet-4-5'] || 1217.87,
  },
];
const APEX_BUDGET_THRESHOLD = 0.9;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN → AVAILABLE MODELS MAPPING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_AVAILABLE_MODELS: Record<PlanType, ModelId[]> = {
  [PlanType.STARTER]: [
    'gemini-2.5-flash-lite',
  ],
  [PlanType.PLUS]: [
    'gemini-2.5-flash',
    'moonshotai/kimi-k2-thinking',
    'gemini-2.5-pro',
  ],
  [PlanType.PRO]: [
    'gemini-2.5-flash',
    'moonshotai/kimi-k2-thinking',
    'gemini-2.5-pro',
    'gpt-5.1',
  ],
  [PlanType.APEX]: [
    'gemini-2.5-flash',
    'moonshotai/kimi-k2-thinking',
    'gemini-3-pro',
    'gpt-5.1',
    'claude-sonnet-4-5',
  ],
  [PlanType.SOVEREIGN]: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gpt-5.1', 'claude-sonnet-4-5', 'moonshotai/kimi-k2-thinking'],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMART ROUTING SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class SmartRoutingService {
  private static instance: SmartRoutingService;

  private constructor() {
    console.log('✅ Smart Routing Service initialized');
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

    // Step 6: Filter models based on budget (unless high-stakes)
    const candidateModels = this.filterByBudget(
      availableModels,
      budgetPressure,
      isHighStakes,
      input.planType === PlanType.APEX
    );

    // Step 7: Score and select best model
    const bestModel = this.selectBestModel(
      candidateModels,
      complexity,
      budgetPressure,
      isHighStakes,
      specialization
    );

    // Step 8: Calculate estimated cost
    const estimatedTokens = this.estimateTokens(complexity);
    const estimatedCost = (bestModel.costPer1M * estimatedTokens) / 1_000_000;

    // Step 9: Determine quality level
    const expectedQuality = this.getQualityLevel(bestModel.qualityScore);

    const routingTime = Date.now() - startTime;

    console.log(`[SmartRouting] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`[SmartRouting] 📊 Query Analysis:`);
    console.log(`[SmartRouting]    Complexity: ${complexity}`);
    console.log(`[SmartRouting]    Budget Pressure: ${(budgetPressure * 100).toFixed(1)}%`);
    console.log(`[SmartRouting]    High Stakes: ${isHighStakes}`);
    console.log(`[SmartRouting]    Specialization: ${specialization || 'general'}`);
    console.log(`[SmartRouting] 🎯 Selected: ${bestModel.displayName}`);
    console.log(`[SmartRouting]    Quality: ${expectedQuality} | Cost: ₹${estimatedCost.toFixed(4)}`);
    console.log(`[SmartRouting]    Routing Time: ${routingTime}ms`);
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
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPLEXITY DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectComplexity(text: string): ComplexityTier {
    const words = text.trim().split(/\s+/);
    const length = words.length;
    const lowerText = text.toLowerCase();

    // Expert indicators (highest priority)
    const expertPatterns = [
      /```[\s\S]*```/,                                    // Code blocks
      /function\s*\(/,                                    // Function definitions
      /class\s+\w+/,                                      // Class definitions
      /import\s+.*from/,                                  // Import statements
      /SELECT\s+.*FROM/i,                                 // SQL queries
      /CREATE\s+TABLE/i,                                  // DDL statements
      /(async|await)\s/,                                  // Async code
      /=>.*{/,                                            // Arrow functions
      /\.(map|filter|reduce)\(/,                          // Array methods
      /(agreement|contract|clause|liability|indemnity)/i, // Legal
      /(term\s*sheet|valuation|equity|ipo|acquisition)/i, // Finance
      /\b(diagnos|symptom|treatment|prescription)\b/i,    // Medical
    ];

    if (expertPatterns.some(pattern => pattern.test(text))) {
      return 'EXPERT';
    }

    // Complex indicators
    const complexPatterns = [
      /\b(explain|analyze|compare|evaluate|design|architect)\b/i,
      /\b(strategy|implementation|optimization|algorithm)\b/i,
      /\b(why|how\s+does|what\s+if|pros\s+and\s+cons)\b/i,
      /\d{4,}/,                                           // Large numbers
      /\b(research|study|paper|thesis)\b/i,
    ];

    const hasComplexPatterns = complexPatterns.some(pattern => pattern.test(text));
    if (hasComplexPatterns || length > 150) {
      return 'COMPLEX';
    }

    // Medium indicators
    const mediumPatterns = [
      /\b(help|create|write|generate|make|build)\b/i,
      /\b(example|tutorial|guide|steps)\b/i,
      /\?.*\?/,                                           // Multiple questions
    ];

    const hasMediumPatterns = mediumPatterns.some(pattern => pattern.test(text));
    if (hasMediumPatterns || length > 50) {
      return 'MEDIUM';
    }

    // Simple indicators
    if (length > 15) {
      return 'SIMPLE';
    }

    // Casual (greetings, short queries)
    const casualPatterns = [
      /^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|kya\s*hal)/i,
      /^(thanks|thank\s*you|ok|okay|got\s*it|cool|nice)/i,
      /^(bye|goodbye|see\s*you|talk\s*later)/i,
    ];

    if (casualPatterns.some(pattern => pattern.test(text)) || length <= 5) {
      return 'CASUAL';
    }

    return 'SIMPLE';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HIGH-STAKES DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectHighStakes(text: string): boolean {
    const highStakesPatterns = [
      // Legal
      /\b(contract|agreement|legal|lawsuit|liability|compliance|regulation)\b/i,
      /\b(terms\s*(and|&)\s*conditions|privacy\s*policy|nda|mou)\b/i,
      
      // Financial
      /\b(investment|tax|audit|financial\s*statement|balance\s*sheet)\b/i,
      /\b(revenue|profit|loss|budget|forecast|valuation)\b/i,
      /₹\s*\d{5,}|\$\s*\d{4,}/,                           // Large money amounts
      
      // Medical/Health
      /\b(diagnos|medical|health|symptom|treatment|prescription|doctor)\b/i,
      /\b(disease|condition|medication|surgery|therapy)\b/i,
      
      // Business Critical
      /\b(pitch\s*deck|investor|funding|acquisition|merger)\b/i,
      /\b(strategy|roadmap|business\s*plan|market\s*analysis)\b/i,
      
      // Security
      /\b(password|security|encryption|vulnerability|breach)\b/i,
      /\b(authentication|authorization|api\s*key|secret)\b/i,
    ];

    return highStakesPatterns.some(pattern => pattern.test(text));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SPECIALIZATION DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectSpecialization(text: string): 'code' | 'business' | 'writing' | 'reasoning' | null {
    const lowerText = text.toLowerCase();

    // Code detection
    const codePatterns = [
      /```/,
      /\b(code|bug|error|debug|function|api|database|query|schema)\b/,
      /\b(typescript|javascript|python|react|node|sql|flutter|dart)\b/,
      /\b(npm|pip|git|docker|aws|deploy)\b/,
      /[{}\[\]();].*[{}\[\]();]/,                         // Multiple brackets
    ];
    if (codePatterns.some(p => p.test(text))) {
      return 'code';
    }

    // Business detection
    const businessPatterns = [
      /\b(pitch|investor|startup|revenue|margin|roi|kpi)\b/,
      /\b(marketing|sales|customer|product|growth|strategy)\b/,
      /\b(pricing|competition|market|business|company)\b/,
      /\b(excel|presentation|report|analysis|dashboard)\b/,
    ];
    if (businessPatterns.some(p => p.test(lowerText))) {
      return 'business';
    }

    // Writing detection
    const writingPatterns = [
      /\b(write|draft|compose|essay|article|blog|story)\b/,
      /\b(email|letter|message|content|copy|script)\b/,
      /\b(creative|poem|fiction|narrative|description)\b/,
      /\b(tone|style|formal|casual|professional)\b/,
    ];
    if (writingPatterns.some(p => p.test(lowerText))) {
      return 'writing';
    }

    // Reasoning detection
    const reasoningPatterns = [
      /\b(why|how|explain|analyze|compare|evaluate)\b/,
      /\b(logic|reason|argument|conclusion|evidence)\b/,
      /\b(pros\s*and\s*cons|trade.?off|decision|choose)\b/,
      /\b(philosophy|ethics|morality|principle)\b/,
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
    
    if (ratio <= 0.5) return 0;           // Chill zone
    if (ratio >= 0.95) return 1;          // Red zone
    
    // Smooth ramp from 0.5 to 0.95 → 0 to 1
    return (ratio - 0.5) / 0.45;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BUDGET-BASED FILTERING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private filterByBudget(
    models: ModelMeta[],
    pressure: number,
    isHighStakes: boolean,
    isApex: boolean
  ): ModelMeta[] {
    // High stakes or Apex users: allow all models
    if (isHighStakes || (isApex && pressure < APEX_BUDGET_THRESHOLD)) {      
    return models;
    }

    // High pressure (>80%): only allow cheap models
    if (pressure > 0.8) {
      const cheapThreshold = 300; // ₹300/1M
      const filtered = models.filter(m => m.costPer1M <= cheapThreshold);
      return filtered.length > 0 ? filtered : [models[0]]; // Fallback to first
    }

    // Medium pressure (>60%): exclude most expensive
    if (pressure > 0.6) {
      const expensiveThreshold = 900; // ₹900/1M
      const filtered = models.filter(m => m.costPer1M < expensiveThreshold);
      return filtered.length > 0 ? filtered : models;
    }

    return models;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODEL SCORING & SELECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private selectBestModel(
    models: ModelMeta[],
    complexity: ComplexityTier,
    pressure: number,
    isHighStakes: boolean,
    specialization: 'code' | 'business' | 'writing' | 'reasoning' | null
  ): ModelMeta {
    if (models.length === 0) {
      return MODEL_REGISTRY[0]; // Fallback to Flash Lite
    }

    if (models.length === 1) {
      return models[0];
    }

    let bestModel = models[0];
    let bestScore = -Infinity;

    for (const model of models) {
      const score = this.scoreModel(model, complexity, pressure, isHighStakes, specialization);
      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    }

    return bestModel;
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
      CASUAL: 0.3,
      SIMPLE: 0.4,
      MEDIUM: 0.6,
      COMPLEX: 0.8,
      EXPERT: 1.0,
    };
    const qualityWeight = qualityWeights[complexity];

    // High-stakes boost
    const highStakesBoost = isHighStakes ? 0.15 : 0;
    const effectiveQuality = Math.min(1, model.qualityScore + highStakesBoost);

    // Cost normalization (cheaper = higher score)
    // Range: ~30 (Flash) to ~1200 (Sonnet)
    const costNorm = Math.max(0, Math.min(1, 1 - (model.costPer1M / 1300)));

    // Budget pressure affects cost weight
    const baseCostWeight = 0.3 + (pressure * 0.4);   // 0.3 → 0.7
    const adjustedQualityWeight = qualityWeight * (0.8 - pressure * 0.3);

    // Latency bonus (faster = better for simple queries)
    const latencyWeight = complexity === 'CASUAL' ? 0.2 : 0.1;

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
      specBonus;

    return score;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private estimateTokens(complexity: ComplexityTier): number {
    const estimates: Record<ComplexityTier, number> = {
      CASUAL: 500,
      SIMPLE: 1500,
      MEDIUM: 3000,
      COMPLEX: 6000,
      EXPERT: 15000,
    };
    return estimates[complexity];
  }

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
    parts.push(`pressure=${(pressure * 100).toFixed(0)}%`);
    
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
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const smartRoutingService = SmartRoutingService.getInstance();