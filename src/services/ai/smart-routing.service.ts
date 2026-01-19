/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SMART ROUTING SERVICE v4.1
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created: November 30, 2025
 * Updated: January 19, 2026 (v4.1 - Added LITE plan support)
 * 
 * v4.1 CHANGES (January 19, 2026):
 * - ✅ ADDED: LITE plan to PLAN_AVAILABLE_MODELS_INDIA
 * - ✅ ADDED: LITE plan to PLAN_AVAILABLE_MODELS_INTL
 * - ✅ ADDED: LITE plan intent classifier (uses STARTER classifier)
 * 
 * v4.0 CHANGES (January 16, 2026):
 * - ✅ SYNCED: Model registry with plans.ts v10.0
 * - ✅ ADDED: claude-haiku-4-5 model
 * - ✅ REMOVED: Unused models (gemini-2.5-flash-lite, magistral-medium, gemini-3-pro, gemini-2.5-pro)
 * - ✅ UPDATED: PLAN_AVAILABLE_MODELS_INDIA per plans.ts routing
 * - ✅ UPDATED: PLAN_AVAILABLE_MODELS_INTL per plans.ts routing
 * - ✅ FIXED: MODEL_COSTS_INR_PER_1M type errors
 * 
 * Dynamic AI model selection based on:
 * - Query complexity (CASUAL → EXPERT)
 * - Budget pressure (usage tracking)
 * - Plan type (available models)
 * - Context type (high-stakes detection)
 * - Specialization matching (code, business, writing)
 * - Region (INDIA vs INTERNATIONAL)
 * 
 * MODELS (plans.ts v10.0):
 * - mistral-large-3: ₹104.6/1M
 * - claude-haiku-4-5: ₹334.8/1M
 * - gemini-2.0-flash: ₹27.2/1M (fallback)
 * - gemini-2.5-flash: ₹40.8/1M (fallback)
 * - gpt-5.1: ₹653.7/1M
 * - claude-sonnet-4-5: ₹1,004/1M
 * 
 * Result: Better quality + Lower cost + Higher margins + Runtime control
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
import { PlanType } from '../../constants';
import { MODEL_COSTS_INR_PER_1M } from '../../constants/plans';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KILL-SWITCHES IMPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import {
  isModelAllowed,
  shouldForceFlash,
  getEffectivePressure,
  isInMaintenance,
  killSwitches,
} from '../../core/ai/utils/kill-switches';
import { logRouting, logWarn } from '../../core/ai/utils/observability';
import { modelUsageService } from '../../services/model-usage.service';
import { getModelAllocations } from '../../constants/model-allocation';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTENT CLASSIFIER IMPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FIXED: Using actual exported functions from delta files

// Starter: classifyMessage returns { intent, nudgeType }
import { 
  classifyMessage as classifyStarterMessage,
  type NudgeType,
} from '../../core/ai/prompts/starter-intent-guard';
import { getStarterDelta, classifyStarterIntent } from '../../core/ai/prompts/starter-delta';

// Plus: classifyMessage returns { intent, nudgeType, nudgeText }
import { 
  classifyMessage as classifyPlusMessage,
} from '../../core/ai/prompts/plus-intent-classifier';
import { getPlusDelta } from '../../core/ai/prompts/plus-delta';

// Pro: Use classifyProIntent from pro-delta (pro-intent-classifier doesn't exist)
import { getProDelta, classifyProIntent } from '../../core/ai/prompts/pro-delta';

// Apex: Use classifyApexIntent from apex-delta (apex-intent-classifier doesn't exist)
import { getApexDelta, classifyApexIntent } from '../../core/ai/prompts/apex-delta';


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES (v4.1 - Added LITE plan support)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Available Model IDs (from plans.ts v10.0)
 * Only models that are actually used in plan routing
 */
export type ModelId =
  | 'gemini-2.0-flash'      // Fallback / STARTER / LITE
  | 'gemini-2.5-flash'      // Fallback (Flash 2.0 Fallback pool)
  | 'mistral-large-3'       // Primary for all plans
  | 'claude-haiku-4-5'      // PRO/APEX India, PLUS/APEX International
  | 'claude-sonnet-4-5'     // APEX International
  | 'gpt-5.1';              // PRO International

export type ComplexityTier = 'CASUAL' | 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'EXPERT';

export type QualityLevel = 'good' | 'high' | 'max';

export interface ModelMeta {
  id: ModelId;
  displayName: string;
  provider: string;
  qualityScore: number;        // 0–1
  latencyScore: number;        // 0–1 (1 = fastest)
  reliabilityScore: number;    // 0–1 (1 = most reliable)
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
  isRepetitive?: boolean;
  isHighStakesContext?: boolean;
  conversationContext?: string;
  // Intent classifier inputs
  sessionMessageCount?: number;
  gptRemainingTokens?: number;
  /** @deprecated Use `region` instead. Will be removed in v5.0 */
  isInternational?: boolean;
  // Request tracking
  requestId?: string;
  // Region for correct model routing (PRIMARY - use this!)
  region?: 'IN' | 'INTL';
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
  fallbackChain: ModelId[];
  temperature?: number;
  confidence: number;
  // Kill-switch info
  wasKillSwitched?: boolean;
  killSwitchReason?: string;
  // Region used for routing
  region?: 'IN' | 'INTL';
  // Intent Classification
  intentClassification?: {
    plan: string;
    intent: string;
    deltaPrompt: string;
    nudgeType: NudgeType | null;
    upgradeNudge?: string;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL REGISTRY (v4.0 - Synced with plans.ts v10.0)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Only models defined in MODEL_COSTS_INR_PER_1M

const MODEL_REGISTRY: ModelMeta[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FALLBACK MODELS (Gemini)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    provider: 'gemini',
    qualityScore: 0.60,
    latencyScore: 1.0,
    reliabilityScore: 0.95,
    specialization: { code: 0.5, business: 0.5, writing: 0.5, reasoning: 0.5 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gemini-2.0-flash'],
  },
  {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    provider: 'gemini',
    qualityScore: 0.65,
    latencyScore: 0.95,
    reliabilityScore: 0.95,
    specialization: { code: 0.55, business: 0.55, writing: 0.55, reasoning: 0.55 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gemini-2.5-flash'],
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIMARY MODELS (Mistral)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'mistral-large-3',
    displayName: 'Mistral Large 3',
    provider: 'mistral',
    qualityScore: 0.78,
    latencyScore: 0.80,
    reliabilityScore: 0.92,
    specialization: { code: 0.75, business: 0.75, writing: 0.80, reasoning: 0.82 },
    costPer1M: MODEL_COSTS_INR_PER_1M['mistral-large-3'],
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLAUDE MODELS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'claude-haiku-4-5',
    displayName: 'Claude Haiku 4.5',
    provider: 'claude',
    qualityScore: 0.82,
    latencyScore: 0.85,
    reliabilityScore: 0.94,
    specialization: { code: 0.80, business: 0.82, writing: 0.85, reasoning: 0.85 },
    costPer1M: MODEL_COSTS_INR_PER_1M['claude-haiku-4-5'],
  },
  {
    id: 'claude-sonnet-4-5',
    displayName: 'Claude Sonnet 4.5',
    provider: 'claude',
    qualityScore: 0.96,
    latencyScore: 0.5,
    reliabilityScore: 0.97,
    specialization: { code: 0.92, business: 0.95, writing: 1.0, reasoning: 1.0 },
    costPer1M: MODEL_COSTS_INR_PER_1M['claude-sonnet-4-5'],
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OPENAI MODELS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'gpt-5.1',
    displayName: 'GPT-5.1',
    provider: 'openai',
    qualityScore: 0.92,
    latencyScore: 0.5,
    reliabilityScore: 0.95,
    specialization: { code: 0.95, business: 0.88, writing: 0.88, reasoning: 0.92 },
    costPer1M: MODEL_COSTS_INR_PER_1M['gpt-5.1'],
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
// PLAN → AVAILABLE MODELS MAPPING (v4.1 - Added LITE plan)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * INDIA Model Access (plans.ts v10.0)
 * 
 * From plans.ts routing configs:
 * - STARTER: gemini-2.0-flash (100%)
 * - LITE: gemini-2.0-flash (70%) + mistral-large-3 (30%) ✅ NEW
 * - PLUS: mistral-large-3 (100%)
 * - PRO: mistral-large-3 (65%) + claude-haiku-4-5 (35%)
 * - APEX: mistral-large-3 (65%) + claude-haiku-4-5 (35%)
 * - SOVEREIGN: All models (founder only)
 * 
 * Fallback: gemini-2.0-flash (500K Flash 2.0 Fallback pool)
 */
const PLAN_AVAILABLE_MODELS_INDIA: Record<PlanType, ModelId[]> = {
  // STARTER: Gemini Flash 100%
  [PlanType.STARTER]: [
    'gemini-2.0-flash',
    'mistral-large-3',  // fallback
  ],

  // ✅ NEW: LITE: Gemini 70% + Mistral 30%
  // Better than STARTER but still budget-focused
  [PlanType.LITE]: [
    'gemini-2.0-flash',
    'mistral-large-3',
  ],
  
  // PLUS: Mistral 100%
  [PlanType.PLUS]: [
    'mistral-large-3',
    'gemini-2.0-flash',  // fallback
    'gemini-2.5-flash',  // Flash 2.0 Fallback pool
  ],
  
  // PRO: Mistral 65% + Haiku 35%
  [PlanType.PRO]: [
    'mistral-large-3',
    'claude-haiku-4-5',
    'gemini-2.0-flash',  // fallback
    'gemini-2.5-flash',  // Flash 2.0 Fallback pool
  ],
  
  // APEX: Mistral 65% + Haiku 35%
  [PlanType.APEX]: [
    'mistral-large-3',
    'claude-haiku-4-5',
    'gemini-2.0-flash',  // fallback
    'gemini-2.5-flash',  // Flash 2.0 Fallback pool
  ],
  
  // SOVEREIGN: All models (founder mode)
  [PlanType.SOVEREIGN]: [
    'mistral-large-3',
    'claude-haiku-4-5',
    'claude-sonnet-4-5',
    'gpt-5.1',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
  ],
};

/**
 * INTERNATIONAL Model Access (plans.ts v10.0)
 * 
 * From plans.ts routingInternational configs:
 * - STARTER: gemini-2.0-flash (100%)
 * - LITE: gemini-2.0-flash (70%) + mistral-large-3 (30%) ✅ NEW
 * - PLUS: mistral-large-3 (65%) + claude-haiku-4-5 (35%)
 * - PRO: mistral-large-3 (70%) + gpt-5.1 (30%)
 * - APEX: mistral-large-3 (45%) + claude-haiku-4-5 (35%) + claude-sonnet-4-5 (20%)
 * - SOVEREIGN: All models (founder only)
 * 
 * Fallback: gemini-2.0-flash (500K Flash 2.0 Fallback pool)
 */
const PLAN_AVAILABLE_MODELS_INTL: Record<PlanType, ModelId[]> = {
  // STARTER: Gemini Flash 100%
  [PlanType.STARTER]: [
    'gemini-2.0-flash',
    'mistral-large-3',  // fallback
  ],

  // ✅ NEW: LITE: Gemini 70% + Mistral 30%
  [PlanType.LITE]: [
    'gemini-2.0-flash',
    'mistral-large-3',
  ],
  
  // PLUS: Mistral 65% + Haiku 35%
  [PlanType.PLUS]: [
    'mistral-large-3',
    'claude-haiku-4-5',
    'gemini-2.0-flash',  // fallback
    'gemini-2.5-flash',  // Flash 2.0 Fallback pool
  ],
  
  // PRO: Mistral 70% + GPT-5.1 30%
  [PlanType.PRO]: [
    'mistral-large-3',
    'gpt-5.1',
    'gemini-2.0-flash',  // fallback
    'gemini-2.5-flash',  // Flash 2.0 Fallback pool
  ],
  
  // APEX: Mistral 45% + Haiku 35% + Sonnet 20%
  [PlanType.APEX]: [
    'mistral-large-3',
    'claude-haiku-4-5',
    'claude-sonnet-4-5',
    'gemini-2.0-flash',  // fallback
    'gemini-2.5-flash',  // Flash 2.0 Fallback pool
  ],
  
  // SOVEREIGN: All models (founder mode)
  [PlanType.SOVEREIGN]: [
    'mistral-large-3',
    'claude-haiku-4-5',
    'claude-sonnet-4-5',
    'gpt-5.1',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
  ],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMART ROUTING SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class SmartRoutingService {
  private static instance: SmartRoutingService;

  private constructor() {
    console.log('✅ Smart Routing Service v4.1 initialized (Added LITE plan support)');
  }

  public static getInstance(): SmartRoutingService {
    if (!SmartRoutingService.instance) {
      SmartRoutingService.instance = new SmartRoutingService();
    }
    return SmartRoutingService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN ROUTING METHOD WITH QUOTA CHECK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async routeWithQuota(input: RoutingInput): Promise<RoutingDecision> {
    const decision = this.route(input);
    const temperatureBoost = input.isRepetitive ? 0.25 : 0;
    const region = input.region ?? 'IN';

    const { modelId, wasDowngraded, reason } = await modelUsageService.getBestAvailableModel(
      input.userId,
      input.planType,
      decision.modelId,
      region
    );

    if (wasDowngraded) {
      const modelMeta = this.getModelById(modelId as ModelId);
      console.log(`[SmartRouting] 🔄 Quota-based downgrade: ${decision.modelId} → ${modelId} (${reason})`);
      return {
        ...decision,
        temperature: 0.7 + temperatureBoost,
        modelId: modelId as ModelId,
        provider: modelMeta?.provider || decision.provider,
        displayName: modelMeta?.displayName || decision.displayName,
        reason: `${decision.reason}, quota-fallback: ${reason}`,
        wasKillSwitched: true,
        killSwitchReason: reason,
      };
    }

    return decision;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN ROUTING METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public route(input: RoutingInput): RoutingDecision {
    const startTime = Date.now();
    let wasKillSwitched = false;
    let killSwitchReason: string | undefined;

    // Maintenance mode check
    if (isInMaintenance()) {
      return this.createMaintenanceResponse(input);
    }

    // Intent classification by plan
    const intentClassification = this.classifyIntentByPlan(input);

    // Complexity detection
    const complexity = this.detectComplexity(input.text);

    // Budget pressure calculation
    const pressureMonthly = this.calculateBudgetPressure(input.monthlyUsedTokens, input.monthlyLimitTokens);
    const pressureDaily = this.calculateBudgetPressure(input.dailyUsedTokens, input.dailyLimitTokens);
    let budgetPressure = Math.max(pressureMonthly, pressureDaily);

    // Kill-switch pressure override
    const effectivePressure = getEffectivePressure(budgetPressure);
    if (effectivePressure !== budgetPressure) {
      budgetPressure = effectivePressure;
      wasKillSwitched = true;
      killSwitchReason = 'budget-multiplier';
    }

    // Force flash check
    if (shouldForceFlash(input.planType)) {
      wasKillSwitched = true;
      killSwitchReason = 'force-flash';
    }

    // Get region from input
    const region = input.region ?? (input.isInternational ? 'INTL' : 'IN');

    // Get available models for plan and region
    let availableModels = this.getAvailableModelMeta(input.planType, region);

    // Filter by kill-switch allowed models
    availableModels = availableModels.filter(m => isModelAllowed(m.id));
    if (availableModels.length === 0) {
      availableModels = [MODEL_REGISTRY[0]]; // fallback to gemini-2.0-flash
      wasKillSwitched = true;
      killSwitchReason = 'no-models-available';
    }

    // Detect specialization
    const specialization = this.detectSpecialization(input.text, input.conversationContext);

    // High stakes detection
    const isHighStakes = input.isHighStakesContext || this.isHighStakes(input.text);
    const isApex = input.planType === PlanType.APEX;
    const isSovereign = input.planType === PlanType.SOVEREIGN;

    // Filter by budget
    const budgetFiltered = this.filterByBudget(
      availableModels,
      budgetPressure,
      isHighStakes,
      isApex,
      isSovereign
    );

    // Rank models
    const ranked = this.rankModels(
      budgetFiltered,
      complexity,
      budgetPressure,
      isHighStakes,
      specialization
    );

    // Select top model
    const selected = ranked[0];
    const estimatedTokens = TOKEN_ESTIMATES[complexity];
    const estimatedCost = (selected.costPer1M / 1_000_000) * estimatedTokens;

    // Build fallback chain
    const fallbackChain = ranked.slice(1, 4).map(m => m.id);

    // Calculate confidence
    const confidence = this.calculateConfidence(ranked, complexity, isHighStakes, specialization);

    // Build reason string
    const reason = this.buildReason(
      complexity,
      budgetPressure,
      isHighStakes,
      specialization,
      wasKillSwitched,
      killSwitchReason
    );

    // Temperature adjustment
    const temperatureBoost = input.isRepetitive ? 0.25 : 0;

    // Log routing decision (using observability.ts format)
    logRouting({
      requestId: input.requestId || `req_${Date.now()}`,
      userId: input.userId,
      plan: input.planType,
      intent: intentClassification?.intent || 'NORMAL',
      modelChosen: selected.id,
      wasDowngraded: wasKillSwitched || false,
      downgradeReason: killSwitchReason,
      pressureLevel: budgetPressure > 0.75 ? 'HIGH' : budgetPressure > 0.5 ? 'MEDIUM' : 'LOW',
      tokensEstimated: estimatedTokens,
    });

    return {
      modelId: selected.id,
      provider: selected.provider,
      displayName: selected.displayName,
      reason,
      complexity,
      budgetPressure,
      estimatedCost,
      expectedQuality: this.getQualityLevel(selected.qualityScore),
      specialization: specialization || undefined,
      fallbackChain,
      temperature: 0.7 + temperatureBoost,
      confidence,
      wasKillSwitched,
      killSwitchReason,
      region,
      intentClassification: intentClassification ? {
        plan: input.planType,
        intent: intentClassification.intent,
        deltaPrompt: intentClassification.deltaPrompt,
        nudgeType: intentClassification.nudgeType,
        upgradeNudge: intentClassification.upgradeNudge,
      } : undefined,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INTENT CLASSIFICATION BY PLAN (v4.1 - Added LITE)
  // FIXED: Using actual function signatures from delta files
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private classifyIntentByPlan(input: RoutingInput): {
    intent: string;
    deltaPrompt: string;
    nudgeType: NudgeType | null;
    upgradeNudge?: string;
  } | null {
    const { planType, text } = input;

    try {
      switch (planType) {
        case PlanType.STARTER: {
          // classifyStarterMessage(text) returns { intent: Intent, nudgeType: NudgeType }
          const result = classifyStarterMessage(text);
          // getStarterDelta(intent) returns string
          const deltaPrompt = getStarterDelta(result.intent as any);
          return {
            intent: result.intent,
            deltaPrompt,
            nudgeType: result.nudgeType,
            upgradeNudge: result.nudgeType ? 'Upgrade to PLUS for more features!' : undefined,
          };
        }

        // ✅ LITE uses STARTER classifier (similar free tier behavior)
        case PlanType.LITE: {
          const result = classifyStarterMessage(text);
          const deltaPrompt = getStarterDelta(result.intent as any);
          return {
            intent: result.intent,
            deltaPrompt,
            nudgeType: result.nudgeType,
            upgradeNudge: result.nudgeType 
              ? 'Upgrade to PLUS for premium models and more features!' 
              : undefined,
          };
        }

        case PlanType.PLUS: {
          // classifyPlusMessage(text) returns { intent, nudgeType, nudgeText }
          const result = classifyPlusMessage(text);
          // getPlusDelta(intent) returns string
          const deltaPrompt = getPlusDelta(result.intent);
          return {
            intent: result.intent,
            deltaPrompt,
            nudgeType: result.nudgeType,
            upgradeNudge: result.nudgeType ? 'Upgrade to PRO for expert assistance!' : undefined,
          };
        }

        case PlanType.PRO: {
          // classifyProIntent(text) returns ProIntent
          const intent = classifyProIntent(text);
          // getProDelta(intent, message?) returns string
          const deltaPrompt = getProDelta(intent, text);
          return {
            intent,
            deltaPrompt,
            nudgeType: null, // PRO doesn't have nudges
            upgradeNudge: undefined,
          };
        }

        case PlanType.APEX:
        case PlanType.SOVEREIGN: {
          // classifyApexIntent(text) returns ApexIntent
          const intent = classifyApexIntent(text);
          // getApexDelta(intent) returns string
          const deltaPrompt = getApexDelta(intent);
          return {
            intent,
            deltaPrompt,
            nudgeType: null, // APEX/SOVEREIGN don't need nudges
          };
        }

        default:
          return null;
      }
    } catch (error) {
      logWarn('Intent classification failed', { error, planType });
      return null;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPLEXITY DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectComplexity(text: string): ComplexityTier {
    const wordCount = text.split(/\s+/).length;
    const hasCode = /```|function|const |let |var |import |class |def |async |await /.test(text);
    const hasAnalysis = /analyze|compare|explain.*detail|research|comprehensive|in-depth/i.test(text);
    const hasTechnical = /algorithm|architecture|database|API|infrastructure|deploy|optimize/i.test(text);
    const isQuestion = /\?$/.test(text.trim());

    // Simple greetings
    if (wordCount <= 5 && !hasCode && !hasAnalysis) {
      return 'CASUAL';
    }

    // Expert level
    if (hasCode && hasTechnical && wordCount > 100) {
      return 'EXPERT';
    }

    // Complex
    if ((hasCode && wordCount > 50) || (hasAnalysis && hasTechnical)) {
      return 'COMPLEX';
    }

    // Medium
    if (hasCode || hasAnalysis || wordCount > 50) {
      return 'MEDIUM';
    }

    // Simple
    if (isQuestion || wordCount <= 20) {
      return 'SIMPLE';
    }

    return 'MEDIUM';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SPECIALIZATION DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectSpecialization(
    text: string,
    context?: string
  ): 'code' | 'business' | 'writing' | 'reasoning' | null {
    const combined = `${text} ${context || ''}`.toLowerCase();

    const codeKeywords = /code|function|debug|error|api|database|sql|python|javascript|typescript|react|node/;
    const businessKeywords = /business|strategy|marketing|sales|revenue|roi|kpi|analytics|growth|market/;
    const writingKeywords = /write|essay|story|blog|article|content|creative|poem|script|novel/;
    const reasoningKeywords = /explain|analyze|compare|logic|reason|proof|math|calculate|derive/;

    if (codeKeywords.test(combined)) return 'code';
    if (businessKeywords.test(combined)) return 'business';
    if (writingKeywords.test(combined)) return 'writing';
    if (reasoningKeywords.test(combined)) return 'reasoning';

    return null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HIGH STAKES DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private isHighStakes(text: string): boolean {
    const highStakesPatterns = [
      /legal|contract|lawsuit|court/i,
      /medical|diagnosis|treatment|symptom/i,
      /financial|investment|trading|portfolio/i,
      /interview|presentation|pitch|proposal/i,
      /deadline|urgent|asap|critical/i,
      /client|customer|stakeholder/i,
    ];

    return highStakesPatterns.some(pattern => pattern.test(text));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAINTENANCE RESPONSE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private createMaintenanceResponse(input: RoutingInput): RoutingDecision {
    return {
      modelId: 'gemini-2.0-flash',
      provider: 'gemini',
      displayName: 'Gemini 2.0 Flash',
      reason: 'SmartRoute: maintenance-mode',
      complexity: 'CASUAL',
      budgetPressure: 0,
      estimatedCost: 0,
      expectedQuality: 'good',
      fallbackChain: [],
      temperature: 0.7,
      confidence: 1,
      wasKillSwitched: true,
      killSwitchReason: 'maintenance',
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BUDGET PRESSURE CALCULATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private calculateBudgetPressure(used: number, limit: number): number {
    if (limit <= 0) return 1;
    
    const ratio = used / limit;
    
    if (ratio <= 0.5) return 0;
    if (ratio >= 0.95) return 1;
    
    return (ratio - 0.5) / 0.45;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BUDGET-BASED FILTERING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private filterByBudget(
    models: ModelMeta[],
    pressure: number,
    isHighStakes: boolean,
    isApex: boolean,
    isSovereign: boolean
  ): ModelMeta[] {
    if (isSovereign) return models;
    if (isHighStakes) return models;
    if (isApex && pressure < APEX_BUDGET_THRESHOLD) return models;

    if (pressure > 0.9) {
      const filtered = models.filter(m => m.costPer1M <= COST_THRESHOLDS.CHEAP);
      return filtered.length > 0 ? filtered : [models[0]];
    }

    if (pressure > 0.75) {
      const filtered = models.filter(m => m.costPer1M <= COST_THRESHOLDS.MEDIUM);
      return filtered.length > 0 ? filtered : models;
    }

    if (pressure > 0.6) {
      const filtered = models.filter(m => m.costPer1M < COST_THRESHOLDS.EXPENSIVE);
      return filtered.length > 0 ? filtered : models;
    }

    return models;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODEL RANKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private rankModels(
    models: ModelMeta[],
    complexity: ComplexityTier,
    pressure: number,
    isHighStakes: boolean,
    specialization: 'code' | 'business' | 'writing' | 'reasoning' | null
  ): ModelMeta[] {
    if (models.length === 0) {
      return [MODEL_REGISTRY[0]];
    }

    if (models.length === 1) {
      return models;
    }

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
    const qualityWeights: Record<ComplexityTier, number> = {
      CASUAL: 0.25,
      SIMPLE: 0.35,
      MEDIUM: 0.55,
      COMPLEX: 0.75,
      EXPERT: 0.95,
    };
    const qualityWeight = qualityWeights[complexity];

    const highStakesBoost = isHighStakes ? 0.15 : 0;
    const effectiveQuality = Math.min(1, model.qualityScore + highStakesBoost);

    const maxCost = 1300;
    const costNorm = Math.max(0, Math.min(1, 1 - (model.costPer1M / maxCost)));

    const baseCostWeight = 0.25 + (pressure * 0.45);
    const adjustedQualityWeight = qualityWeight * (0.85 - pressure * 0.35);

    const latencyWeight = complexity === 'CASUAL' ? 0.2 : 0.08;
    const reliabilityWeight = 0.1;

    let specBonus = 0;
    if (specialization && model.specialization[specialization]) {
      specBonus = model.specialization[specialization] * 0.15;
    }

    const score =
      adjustedQualityWeight * effectiveQuality +
      baseCostWeight * costNorm +
      latencyWeight * model.latencyScore +
      reliabilityWeight * model.reliabilityScore +
      specBonus;

    return score;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIDENCE CALCULATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private calculateConfidence(
    rankedModels: ModelMeta[],
    complexity: ComplexityTier,
    isHighStakes: boolean,
    specialization: string | null
  ): number {
    let confidence = 0.7;

    if (rankedModels.length >= 3) confidence += 0.1;

    if (complexity === 'CASUAL' || complexity === 'EXPERT') {
      confidence += 0.08;
    }

    if (isHighStakes && rankedModels[0].qualityScore >= 0.85) {
      confidence += 0.1;
    }

    if (specialization) {
      const specKey = specialization as 'code' | 'business' | 'writing' | 'reasoning';
      const specScore = rankedModels[0].specialization[specKey];
      if (specScore >= 0.8) {
        confidence += 0.07;
      }
    }

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
    specialization: string | null,
    wasKillSwitched: boolean = false,
    killSwitchReason?: string
  ): string {
    const parts: string[] = [];
    
    parts.push(`complexity=${complexity}`);
    
    if (pressure > 0.3) {
      parts.push(`budget=${(pressure * 100).toFixed(0)}%`);
    }
    
    if (isHighStakes) parts.push('high-stakes');
    if (specialization) parts.push(`spec=${specialization}`);
    
    if (wasKillSwitched && killSwitchReason) {
      parts.push(`ks:${killSwitchReason}`);
    } else if (wasKillSwitched) {
      parts.push('kill-switched');
    }

    return `SmartRoute: ${parts.join(', ')}`;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PUBLIC UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Get available models with full metadata (region-aware)
   * Returns ModelMeta[] with all model details
   */
  public getAvailableModelMeta(planType: PlanType, region: 'IN' | 'INTL' = 'IN'): ModelMeta[] {
    const mapping = region === 'INTL' ? PLAN_AVAILABLE_MODELS_INTL : PLAN_AVAILABLE_MODELS_INDIA;
    const modelIds = mapping[planType] || ['gemini-2.0-flash'];
    // Also filter by kill-switch
    return MODEL_REGISTRY
      .filter(m => modelIds.includes(m.id))
      .filter(m => isModelAllowed(m.id));
  }

  /**
   * Get available model IDs only (region-aware)
   * Returns ModelId[] - lightweight version
   */
  public getAvailableModelIds(planType: PlanType, region: 'IN' | 'INTL' = 'IN'): ModelId[] {
    const mapping = region === 'INTL' ? PLAN_AVAILABLE_MODELS_INTL : PLAN_AVAILABLE_MODELS_INDIA;
    return mapping[planType] || ['gemini-2.0-flash'];
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

  // Get kill-switch status
  public getKillSwitchStatus() {
    return killSwitches.getStatus();
  }

  // Get model allocations for plan
  public getModelAllocationsForPlan(planType: PlanType, region: 'IN' | 'INTL' = 'IN') {
    return getModelAllocations(planType, region);
  }

  /**
   * ✅ NEW: Check if plan is a free plan (STARTER or LITE)
   */
  public isFreePlan(planType: PlanType): boolean {
    return planType === PlanType.STARTER || planType === PlanType.LITE;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const smartRoutingService = SmartRoutingService.getInstance();