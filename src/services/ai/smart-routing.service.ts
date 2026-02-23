/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SMART ROUTING SERVICE v5.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created: November 30, 2025
 * Updated: February 15, 2026 (v5.0 - V10.3 Model Routing)
 * 
 * v5.0 CHANGES (February 15, 2026):
 * - ❌ REMOVED: claude-haiku-4-5, claude-sonnet-4-5, gpt-5.1
 * - ✅ ADDED: devstral-medium-latest for coding tasks
 * - ✅ SIMPLIFIED: Only Mistral + Gemini + Devstral
 * - ✅ SYNCED: With plans.ts V10.3
 *
 * v4.4 CHANGES (February 6, 2026):
 * - ✅ REMOVED: deepseek-chat from MODEL_REGISTRY (Chinese provider removed)
 * - ✅ REPLACED: deepseek-chat → mistral-large-latest in SOVEREIGN plan routing
 * - ✅ UPDATED: ModelId type to remove deepseek-chat
 *
 * Dynamic AI model selection based on:
 * - Query complexity (CASUAL → EXPERT)
 * - Budget pressure (usage tracking)
 * - Plan type (available models)
 * - Context type (high-stakes detection)
 * - Specialization matching (code, business, writing)
 * - Region (INDIA vs INTERNATIONAL)
 * 
 * MODELS (plans.ts V10.3):
 * - mistral-large-latest: ₹510/1M (Primary for all plans)
 * - gemini-2.0-flash: FREE (Fallback/Simple queries)
 * - devstral-medium-latest: ₹51/1M (Coding tasks - PLUS and above)
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
// ✅ UNIFIED DELTA ENGINE (v4.2 - Single Source of Truth)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { 
  classifyIntent, 
  buildDelta, 
  getMaxTokens,
  type PlanType as DeltaPlanType,
} from '../../core/ai/soriva-delta-engine';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NUDGE TYPE (For backward compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type NudgeType = 'SOFT' | 'MEDIUM' | 'STRONG' | null;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES (v4.1 - Added LITE plan support)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Available Model IDs (from plans.ts V10.3)
 * V10.3: Only Mistral + Gemini + Devstral
 * ❌ REMOVED: claude-haiku-4-5, claude-sonnet-4-5, gpt-5.1
 */
export type ModelId =
  | 'gemini-2.0-flash'      // Simple/Fallback
  | 'mistral-large-latest'  // Primary for ALL plans
  | 'devstral-medium-latest';      // Coding tasks (PLUS and above)

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
  // gemini-2.5-flash removed - only gemini-2.0-flash as fallback
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DEEPSEEK REMOVED (February 2026)
  // Reason: Chinese provider removed for data sovereignty
  // Replaced by: mistral-large-latest (European, Apache 2.0)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIMARY MODELS (Mistral — used by ALL plans including SOVEREIGN)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'mistral-large-latest',
    displayName: 'Mistral Large 3',
    provider: 'mistral',
    qualityScore: 0.78,
    latencyScore: 0.80,
    reliabilityScore: 0.92,
    specialization: { code: 0.75, business: 0.75, writing: 0.80, reasoning: 0.82 },
    costPer1M: MODEL_COSTS_INR_PER_1M['mistral-large-latest'],
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DEVSTRAL (Coding Model) - V10.3 NEW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚠️ CRITICAL: Devstral has NO general knowledge!
  // It can ONLY handle coding tasks. Setting non-code specializations to 0
  // ensures it's never selected for general queries.
  {
    id: 'devstral-medium-latest',
    displayName: 'Devstral (Coding)',
    provider: 'mistral',
    qualityScore: 0.85,  // Lower base quality for non-code tasks
    latencyScore: 0.82,
    reliabilityScore: 0.90,
    specialization: { code: 0.98, business: 0, writing: 0, reasoning: 0 },  // CODING ONLY
    costPer1M: 51, // ₹51/1M - Devstral pricing
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // V10.3: REMOVED MODELS
  // ❌ claude-haiku-4-5
  // ❌ claude-sonnet-4-5  
  // ❌ gpt-5.1
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const COMPLEXITY_THRESHOLDS = {
  CASUAL_MAX_WORDS: 5,
  SIMPLE_MAX_WORDS: 20,
  MEDIUM_MAX_WORDS: 80,
  EXPERT_MIN_WORDS: 100,
};

const COST_THRESHOLDS = {
  CHEAP: 50,     // ₹/1M tokens
  MEDIUM: 200,
  EXPENSIVE: 500,
};

const APEX_BUDGET_THRESHOLD = 0.85;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN MODEL ACCESS (V10.3 - February 2026)
// Synced with plans.ts V10.3
// ❌ REMOVED: claude-haiku-4-5, claude-sonnet-4-5, gpt-5.1
// ✅ ADDED: devstral-medium-latest for coding
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// INDIA Region (V10.3)
// STARTER/LITE: Mistral 50% + Gemini 50%
// PLUS/PRO/APEX: Mistral 50% + Gemini 35% + Devstral 15%
const PLAN_AVAILABLE_MODELS_INDIA: Record<PlanType, ModelId[]> = {
  [PlanType.STARTER]: ['mistral-large-latest', 'gemini-2.0-flash'],
  [PlanType.LITE]: ['mistral-large-latest', 'gemini-2.0-flash'],
  [PlanType.PLUS]: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
  [PlanType.PRO]: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
  [PlanType.APEX]: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
  [PlanType.SOVEREIGN]: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
};

// INTERNATIONAL Region (V10.3)
// STARTER: Mistral 50% + Gemini 50%
// LITE: Mistral 55% + Gemini 35% + Devstral 10%
// PLUS/PRO/APEX: Mistral 50% + Gemini 35% + Devstral 15%
const PLAN_AVAILABLE_MODELS_INTL: Record<PlanType, ModelId[]> = {
  [PlanType.STARTER]: ['mistral-large-latest', 'gemini-2.0-flash'],
  [PlanType.LITE]: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
  [PlanType.PLUS]: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
  [PlanType.PRO]: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
  [PlanType.APEX]: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
  [PlanType.SOVEREIGN]: ['mistral-large-latest', 'gemini-2.0-flash', 'devstral-medium-latest'],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMART ROUTING SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SmartRoutingService {
  private static instance: SmartRoutingService;

  private constructor() {}

  public static getInstance(): SmartRoutingService {
    if (!SmartRoutingService.instance) {
      SmartRoutingService.instance = new SmartRoutingService();
    }
    return SmartRoutingService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN ROUTING METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async route(input: RoutingInput): Promise<RoutingDecision> {
    const { 
      text, 
      planType, 
      userId,
      monthlyUsedTokens,
      monthlyLimitTokens,
      dailyUsedTokens,
      dailyLimitTokens,
      isHighStakesContext = false,
      isInternational,
      region: inputRegion,
    } = input;

    // Determine region (prefer explicit region, fallback to isInternational)
    const region: 'IN' | 'INTL' = inputRegion || (isInternational ? 'INTL' : 'IN');

    // Check maintenance mode
    if (isInMaintenance()) {
      return this.createMaintenanceResponse(region);
    }

    // 1. Detect complexity
    const complexity = this.detectComplexity(text);

    // 2. Calculate budget pressure
    const monthlyPressure = this.calculateBudgetPressure(monthlyUsedTokens, monthlyLimitTokens);
    const dailyPressure = this.calculateBudgetPressure(dailyUsedTokens, dailyLimitTokens);
    const budgetPressure = Math.max(monthlyPressure, dailyPressure);

    // Apply kill-switch pressure override
    const effectivePressure = getEffectivePressure(budgetPressure);

    // 3. Get intent classification using unified delta engine
    const intentClassification = this.classifyIntentByPlan(input);

    // 4. Detect specialization
    const specialization = this.detectSpecialization(text);

    // 5. Get available models for plan + region
    const planModels = this.getAvailableModelMeta(planType, region);

    // 6. Filter by budget
    const isApex = planType === PlanType.APEX;
    const isSovereign = planType === PlanType.SOVEREIGN;
    const budgetFiltered = this.filterByBudget(
      planModels, 
      effectivePressure, 
      isHighStakesContext, 
      isApex,
      isSovereign
    );

    // ⚠️ CRITICAL: Devstral is CODING-ONLY model (no general knowledge)
    // Remove Devstral from candidate list if query is NOT coding
    const modelsForRanking = specialization === 'code' 
      ? budgetFiltered 
      : budgetFiltered.filter(m => m.id !== 'devstral-medium-latest');

    // 7. Rank models
    const rankedModels = this.rankModels(
      modelsForRanking, 
      complexity, 
      effectivePressure, 
      isHighStakesContext, 
      specialization
    );

    // 8. Select best model (with kill-switch check)
    let selected = rankedModels[0];
    let wasKillSwitched = false;
    let killSwitchReason: string | undefined;

    // Check if selected model is allowed by kill-switch
    if (!isModelAllowed(selected.id)) {
      wasKillSwitched = true;
      killSwitchReason = 'model-disabled';
      // Find first allowed model
      const allowedModel = rankedModels.find(m => isModelAllowed(m.id));
      selected = allowedModel || MODEL_REGISTRY[0];
    }

    // Check force-flash kill-switch
    if (shouldForceFlash(planType)) {
      wasKillSwitched = true;
      killSwitchReason = 'force-flash';
      selected = MODEL_REGISTRY.find(m => m.id === 'gemini-2.0-flash') || MODEL_REGISTRY[0];
    }

    // 9. Build fallback chain
    const fallbackChain = this.buildFallbackChain(selected.id, planType, region);

    // 10. Calculate confidence
    const confidence = this.calculateConfidence(rankedModels, complexity, isHighStakesContext, specialization);

    // 11. Estimate cost
    const estimatedTokens = intentClassification 
      ? getMaxTokens(planType as DeltaPlanType, intentClassification.intent)
      : 1000;
    const estimatedCost = (estimatedTokens / 1_000_000) * selected.costPer1M;

    // 12. Temperature boost for creative tasks
    const temperatureBoost = specialization === 'writing' ? 0.1 : 0;

    // Build reason string
    const reason = this.buildReason(
      complexity, 
      effectivePressure, 
      isHighStakesContext, 
      specialization,
      wasKillSwitched,
      killSwitchReason
    );

    // Log routing decision
    logRouting({
      userId,
      requestId: input.requestId || `req_${Date.now().toString(36)}`,
      plan: planType,
      intent: intentClassification?.intent || 'GENERAL',
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
  // ✅ INTENT CLASSIFICATION BY PLAN (v4.2 - Unified Delta Engine)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private classifyIntentByPlan(input: RoutingInput): {
    intent: string;
    deltaPrompt: string;
    nudgeType: NudgeType | null;
    upgradeNudge?: string;
  } | null {
    const { planType, text } = input;

    try {
      // Convert PlanType enum to string for delta engine
      const planString = planType as unknown as DeltaPlanType;
      
      // Use unified classifyIntent from delta engine
      const intent = classifyIntent(planString, text);
      
      // Use unified buildDelta from delta engine
      const deltaPrompt = buildDelta(planString, intent);

      // Determine nudge based on plan
      let nudgeType: NudgeType = null;
      let upgradeNudge: string | undefined;

      switch (planType) {
        case PlanType.STARTER:
          nudgeType = this.determineStarterNudge(text);
          upgradeNudge = nudgeType ? 'Upgrade to PLUS for more features!' : undefined;
          break;
        case PlanType.LITE:
          nudgeType = this.determineStarterNudge(text);
          upgradeNudge = nudgeType ? 'Upgrade to PLUS for premium models and more features!' : undefined;
          break;
        case PlanType.PLUS:
          nudgeType = this.determinePlusNudge(text);
          upgradeNudge = nudgeType ? 'Upgrade to PRO for expert assistance!' : undefined;
          break;
        // PRO, APEX, SOVEREIGN don't need nudges
        default:
          nudgeType = null;
          upgradeNudge = undefined;
      }

      return {
        intent,
        deltaPrompt,
        nudgeType,
        upgradeNudge,
      };
    } catch (error) {
      logWarn('Intent classification failed', { error, planType });
      return null;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NUDGE DETERMINATION (Simplified)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private determineStarterNudge(text: string): NudgeType {
    const m = text.toLowerCase();
    // Check for complex requests that would benefit from upgrade
    if (/code|api|debug|deploy|architecture/.test(m)) return 'MEDIUM';
    if (/business|strategy|analysis|report/.test(m)) return 'SOFT';
    if (/write.*article|blog|content|creative/.test(m)) return 'SOFT';
    return null;
  }

  private determinePlusNudge(text: string): NudgeType {
    const m = text.toLowerCase();
    // Check for expert-level requests
    if (/expert|advanced|deep.*analysis|enterprise/.test(m)) return 'MEDIUM';
    if (/production|scalable|architecture/.test(m)) return 'SOFT';
    return null;
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
    if (wordCount <= COMPLEXITY_THRESHOLDS.CASUAL_MAX_WORDS && !hasCode && !hasAnalysis) {
      return 'CASUAL';
    }

    // Expert level
    if (hasCode && hasTechnical && wordCount > COMPLEXITY_THRESHOLDS.EXPERT_MIN_WORDS) {
      return 'EXPERT';
    }

    // Complex
    if ((hasCode || hasAnalysis || hasTechnical) && wordCount > COMPLEXITY_THRESHOLDS.MEDIUM_MAX_WORDS) {
      return 'COMPLEX';
    }

    // Medium
    if ((hasCode || hasAnalysis) && wordCount > COMPLEXITY_THRESHOLDS.SIMPLE_MAX_WORDS) {
      return 'MEDIUM';
    }

    // Simple
    if (wordCount <= COMPLEXITY_THRESHOLDS.SIMPLE_MAX_WORDS || isQuestion) {
      return 'SIMPLE';
    }

    return 'MEDIUM';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SPECIALIZATION DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectSpecialization(text: string): 'code' | 'business' | 'writing' | 'reasoning' | null {
    const lower = text.toLowerCase();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔥 STRICT CODE DETECTION (v5.1 - Fixed Feb 23, 2026)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DEVSTRAL is ONLY for coding - must be VERY strict
    // "middle class family" was matching "class " - FIXED!
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Strong code indicators (high confidence)
    const strongCodePatterns = /```[\s\S]*```|function\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|import\s+\{|import\s+\w+\s+from|class\s+\w+\s*\{|def\s+\w+\s*\(|async\s+function|await\s+\w+|=>\s*\{|npm\s+install|pip\s+install|git\s+clone/i;
    if (strongCodePatterns.test(text)) {
      return 'code';
    }
    
    // Programming language explicit mentions with context
    const langWithContext = /\b(write|create|build|make|fix|debug|code|program|script|develop)\s+(a\s+)?(in\s+)?(python|javascript|typescript|java|c\+\+|cpp|rust|golang|go|ruby|php|swift|kotlin)\b/i;
    if (langWithContext.test(text)) {
      return 'code';
    }
    
    // Explicit coding requests
    const explicitCodeRequest = /\b(write|create|build|fix|debug|refactor|optimize)\s+(a\s+)?(code|program|script|function|api|app|application|module|component|class|method)\b/i;
    if (explicitCodeRequest.test(text)) {
      return 'code';
    }
    
    // Technical debugging/error patterns
    const debugPatterns = /\b(error|bug|exception|traceback|stack\s*trace|syntax\s*error|runtime\s*error|compile\s*error|undefined\s+is\s+not|cannot\s+read\s+property|null\s+pointer)\b/i;
    if (debugPatterns.test(text)) {
      return 'code';
    }
    
    // Code file extensions
    const fileExtensions = /\.(js|ts|py|java|cpp|c|rb|php|go|rs|swift|kt|jsx|tsx|vue|sql|sh|bash)\b/i;
    if (fileExtensions.test(text)) {
      return 'code';
    }

    // Business patterns
    if (/business|strategy|marketing|revenue|growth|startup|investor|pitch|market/i.test(lower)) {
      return 'business';
    }

    // Writing patterns
    if (/write|article|blog|content|story|creative|essay|copy|draft/i.test(lower)) {
      return 'writing';
    }

    // Reasoning patterns
    if (/analyze|compare|evaluate|reason|logic|argument|debate|philosophical/i.test(lower)) {
      return 'reasoning';
    }

    return null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FALLBACK CHAIN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildFallbackChain(primaryModel: ModelId, planType: PlanType, region: 'IN' | 'INTL'): ModelId[] {
    const mapping = region === 'INTL' ? PLAN_AVAILABLE_MODELS_INTL : PLAN_AVAILABLE_MODELS_INDIA;
    const available = mapping[planType] || ['gemini-2.0-flash'];
    
    // Filter out primary and build chain
    const chain = available.filter(m => m !== primaryModel);
    
    // Always add gemini-2.0-flash as ultimate fallback
    if (!chain.includes('gemini-2.0-flash')) {
      chain.push('gemini-2.0-flash');
    }

    return chain;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAINTENANCE RESPONSE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private createMaintenanceResponse(region: 'IN' | 'INTL'): RoutingDecision {
    const fallbackModel = MODEL_REGISTRY[0]; // gemini-2.0-flash
    return {
      modelId: fallbackModel.id,
      provider: fallbackModel.provider,
      displayName: fallbackModel.displayName,
      reason: 'SmartRoute: maintenance-mode',
      complexity: 'CASUAL',
      budgetPressure: 0,
      estimatedCost: 0,
      expectedQuality: 'good',
      fallbackChain: ['gemini-2.0-flash'],
      temperature: 0.7,
      confidence: 1.0,
      wasKillSwitched: true,
      killSwitchReason: 'maintenance',
      region,
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUNDING WITH GOOGLE SEARCH (V2 - February 2026)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if query needs grounding (real-time web search)
   * Only triggers for Gemini model when real-time data is needed
   * 
   * FREE: 45,000 searches/month (1,500/day)
   */
  public needsGrounding(query: string): boolean {
    const groundingKeywords = [
      // News & Current Events
      'news', 'khabar', 'latest', 'today', 'aaj', 'abhi', 'current', 'recent', 'breaking',
      'headlines', 'updates',
      // Weather
      'weather', 'mausam', 'temperature', 'barish', 'rain', 'forecast', 'humidity',
      // Sports
      'score', 'match', 'ipl', 'cricket', 'football', 'winner', 'result', 'live score',
      'world cup', 'tournament',
      // Finance
      'price', 'rate', 'stock', 'share', 'nifty', 'sensex', 'dollar', 'rupee', 'gold',
      'petrol', 'diesel', 'bitcoin', 'crypto', 'market',
      // Trending
      'trending', 'viral', 'popular', 'top 10',
      // Local
      'near me', 'nearby', 'location', 'directions',
      // Time-sensitive
      'election', 'live', 'update', 'happening', 'right now',
      // Events
      'release date', 'launch', 'announcement', 'schedule',
    ];

    const lowerQuery = query.toLowerCase();
    return groundingKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Should route to Gemini with grounding?
   * Returns true if query needs real-time data AND model is Gemini
   */
  public shouldUseGrounding(query: string, modelId: ModelId): boolean {
    // Only Gemini supports grounding
    if (!modelId.includes('gemini')) {
      return false;
    }
    return this.needsGrounding(query);
  }

  /**
   * Get routing decision with grounding flag
   */
  public async routeWithGrounding(input: RoutingInput): Promise<RoutingDecision & { enableGrounding: boolean }> {
    const decision = await this.route(input);
    const enableGrounding = this.shouldUseGrounding(input.text, decision.modelId);
    
    return {
      ...decision,
      enableGrounding,
      reason: enableGrounding 
        ? `${decision.reason} [Grounding: Real-time data requested]`
        : decision.reason,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const smartRoutingService = SmartRoutingService.getInstance();