/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA SMART ROUTING SERVICE v3.2
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created: November 30, 2025
 * Updated: January 3, 2026 (v3.2 - Region-Aware Routing)
 * 
 * Dynamic AI model selection based on:
 * - Query complexity (CASUAL → EXPERT)
 * - Budget pressure (usage tracking)
 * - Plan type (available models)
 * - Context type (high-stakes detection)
 * - Specialization matching (code, business, writing)
 * - Region (INDIA vs INTERNATIONAL) ← NEW v3.2
 * 
 * v3.2 Enhancements:
 * - Region-aware model routing (INDIA vs INTL different models)
 * - PLAN_AVAILABLE_MODELS_INDIA and PLAN_AVAILABLE_MODELS_INTL
 * - Fallback chains respect region
 * - Deprecated isInternational in favor of region
 * 
 * v3.1 Enhancements:
 * - Kill-switches integration (model filtering, pressure override)
 * - Maintenance mode support
 * - Enhanced observability
 * 
 * Result: Better quality + Lower cost + Higher margins + Runtime control
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
import { PlanType } from '../../constants';
import { MODEL_COSTS_INR_PER_1M } from '../../constants/plans';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// KILL-SWITCHES IMPORTS (NEW v3.1)
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
import { 
  classifyMessage as classifyStarterMessage,
  NudgeType,
} from '../../core/ai/prompts/starter-intent-guard';
import type { GuardResult as StarterIntentResult } from '../../core/ai/prompts/starter-intent-guard';
import { getStarterDelta } from '../../core/ai/prompts/starter-delta';

import { 
  classifyMessage as classifyPlusMessage,
} from '../../core/ai/prompts/plus-intent-classifier';
import type { PlusClassifyResult as PlusIntentResult } from '../../core/ai/prompts/plus-intent-classifier';
import { getPlusDelta } from '../../core/ai/prompts/plus-delta';

import { 
  classifyMessage as classifyProMessage,
} from '../../core/ai/prompts/pro-intent-classifier';
import type { ProClassifyResult as ProIntentResult } from '../../core/ai/prompts/pro-intent-classifier';
import { getProDelta } from '../../core/ai/prompts/pro-delta';

import { 
  classifyMessage as classifyApexMessage,
} from '../../core/ai/prompts/apex-intent-classifier';
import type { ApexClassifyResult as ApexIntentResult } from '../../core/ai/prompts/apex-intent-classifier';
import { getApexDelta } from '../../core/ai/prompts/apex-delta';



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
  isHighStakesContext?: boolean;
  conversationContext?: string;
  // Intent classifier inputs
  sessionMessageCount?: number;
  gptRemainingTokens?: number;
  /** @deprecated Use `region` instead. Will be removed in v4.0 */
  isInternational?: boolean;
  // NEW v3.1: Request tracking
  requestId?: string;
  // NEW v3.2: Region for correct model routing (PRIMARY - use this!)
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
  confidence: number;
  // NEW v3.1: Kill-switch info
  wasKillSwitched?: boolean;
  killSwitchReason?: string;
  // NEW v3.2: Region used for routing
  region?: 'IN' | 'INTL';
  // Intent Classification
  intentClassification?: {
    plan: string;
    intent: string;
    confidence: number;
    deltaPrompt: string;
    nudgeType: NudgeType;
    upgradeNudge?: string;
    allowGPT?: boolean;
  };
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
// PLAN → AVAILABLE MODELS MAPPING (v3.2 - Region Aware)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// From plans.ts - INDIA and INTERNATIONAL have DIFFERENT model access

/**
 * INDIA Model Access
 * STARTER:   flash-lite (100%)
 * PLUS:      kimi (50%) + flash (50%)
 * PRO:       flash (60%) + kimi (20%) + gpt-5.1 (20%)
 * APEX:      flash (41.1%) + kimi (41.1%) + 2.5-pro (6.9%) + gpt-5.1 (10.9%)
 * SOVEREIGN: flash + kimi + 3-pro + gpt-5.1 + claude-sonnet-4-5
 */
const PLAN_AVAILABLE_MODELS_INDIA: Record<PlanType, ModelId[]> = {
  // STARTER: Only Flash-Lite (100%)
  [PlanType.STARTER]: [
    'gemini-2.5-flash-lite',
    'moonshotai/kimi-k2-thinking',
  ],
  
  // PLUS: Kimi 50% + Flash 50%
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

/**
 * INTERNATIONAL Model Access
 * STARTER:   flash-lite (100%)
 * PLUS:      flash (70%) + kimi (30%)
 * PRO:       flash (43.1%) + kimi (30%) + 2.5-pro (9.3%) + gpt-5.1 (17.6%)
 * APEX:      kimi (35.2%) + gpt-5.1 (32.8%) + flash (17.2%) + claude-sonnet-4-5 (7.4%) + 3-pro (7.4%)
 * SOVEREIGN: Same as India
 */
const PLAN_AVAILABLE_MODELS_INTL: Record<PlanType, ModelId[]> = {
  // STARTER: Flash-Lite + Kimi (Dynamic routing based on complexity)
  [PlanType.STARTER]: [
    'gemini-2.5-flash-lite',
    'moonshotai/kimi-k2-thinking',
  ],
  // PLUS: Flash 70% + Kimi 30% (Flash is primary internationally)
  [PlanType.PLUS]: [
    'gemini-2.5-flash',
    'moonshotai/kimi-k2-thinking',
  ],
  
  // PRO: Flash 43.1% + Kimi 30% + Pro 9.3% + GPT 17.6% (Has Pro access!)
  [PlanType.PRO]: [
    'gemini-2.5-flash',
    'moonshotai/kimi-k2-thinking',
    'gemini-2.5-pro',
    'gpt-5.1',
  ],
  
  // APEX: Kimi 35.2% + GPT 32.8% + Flash 17.2% + Sonnet 7.4% + 3-Pro 7.4%
  [PlanType.APEX]: [
    'moonshotai/kimi-k2-thinking',
    'gpt-5.1',
    'gemini-2.5-flash',
    'claude-sonnet-4-5',
    'gemini-3-pro',
  ],
  
  // SOVEREIGN: All models (same as India)
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
    console.log('✅ Smart Routing Service v3.2 initialized (Region-Aware Routing)');
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
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ASYNC ROUTE WITH QUOTA CHECK (New primary method)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async routeWithQuota(input: RoutingInput): Promise<RoutingDecision> {
    // First, get the ideal routing decision
    const decision = this.route(input);
    
    // Now check if selected model has quota
    const region: 'IN' | 'INTL' = input.region ?? 'IN';
    
    const { modelId, wasDowngraded, reason } = await modelUsageService.getBestAvailableModel(
      input.userId,
      input.planType,
      decision.modelId,
      region
    );
    
    // If model was downgraded due to quota, update decision
    if (wasDowngraded) {
      const modelMeta = this.getModelById(modelId as any);
      
      console.log(`[SmartRouting] 🔄 Quota-based downgrade: ${decision.modelId} → ${modelId} (${reason})`);
      
      return {
        ...decision,
        modelId: modelId as any,
        provider: modelMeta?.provider || decision.provider,
        displayName: modelMeta?.displayName || decision.displayName,
        reason: `${decision.reason}, quota-fallback: ${reason}`,
        wasKillSwitched: true,
        killSwitchReason: reason,
      };
    }
    
    return decision;
  }
  public route(input: RoutingInput): RoutingDecision {
    const startTime = Date.now();
    let wasKillSwitched = false;
    let killSwitchReason: string | undefined;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ NEW v3.1: Maintenance Mode Check
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isInMaintenance()) {
      return this.createMaintenanceResponse(input);
    }

    // Step 0: Plan-specific Intent Classification
    const intentClassification = this.classifyIntentByPlan(input);

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
    let budgetPressure = Math.max(pressureMonthly, pressureDaily);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ NEW v3.1: Apply pressure override from kill-switches
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const originalPressure = budgetPressure;
    budgetPressure = getEffectivePressure(budgetPressure);
    if (budgetPressure !== originalPressure) {
      wasKillSwitched = true;
      killSwitchReason = `pressure-override: ${originalPressure.toFixed(2)} → ${budgetPressure.toFixed(2)}`;
    }

    // Step 3: Detect high-stakes context
    // ✅ CHANGE 2: Trust upstream if provided (AIService has broader context)
    const isHighStakes = input.isHighStakesContext ?? this.detectHighStakes(input.text);

    // Step 4: Detect specialization needed
    const specialization = this.detectSpecialization(input.text);

    // Step 5: Get available models for plan (REGION AWARE v3.2)
    // ✅ FIX: Single source of truth for region (input.region only)
    const region: 'IN' | 'INTL' = input.region ?? 'IN';
    const modelMapping = region === 'INTL' ? PLAN_AVAILABLE_MODELS_INTL : PLAN_AVAILABLE_MODELS_INDIA;
    const availableModelIds = modelMapping[input.planType] || ['gemini-2.5-flash-lite'];
    let availableModels = MODEL_REGISTRY.filter(m => availableModelIds.includes(m.id));

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ NEW v3.1: Filter by kill-switch allowed models
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const preKillSwitchCount = availableModels.length;
    availableModels = availableModels.filter(m => isModelAllowed(m.id));
    
    if (availableModels.length < preKillSwitchCount) {
      wasKillSwitched = true;
      const killedCount = preKillSwitchCount - availableModels.length;
      killSwitchReason = killSwitchReason 
        ? `${killSwitchReason}, ${killedCount} models killed`
        : `${killedCount} models killed`;
    }

    // ✅ Safety: Ensure at least one model available
    if (availableModels.length === 0) {
      logWarn('All models killed by kill-switch, falling back to Flash Lite', {
        requestId: input.requestId,
        plan: input.planType,
      });
      availableModels = [MODEL_REGISTRY[0]]; // Flash Lite as ultimate fallback
      wasKillSwitched = true;
      killSwitchReason = 'all-models-killed-fallback';
    }

    // Step 6: Filter models based on budget (unless high-stakes or SOVEREIGN)
    const isSovereign = input.planType === PlanType.SOVEREIGN;
    let candidateModels = this.filterByBudget(
      availableModels,
      budgetPressure,
      isHighStakes,
      input.planType === PlanType.APEX,
      isSovereign
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ CHANGE 4: High-stakes STARTER = Prefer RELIABLE model
    // STARTER has: flash-lite (reliability=0.95) + kimi (reliability=0.88)
    // For high-stakes, RELIABILITY > QUALITY
    // So prefer Flash-Lite (more reliable) over Kimi
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isHighStakes && input.planType === PlanType.STARTER) {
      const flashModel = candidateModels.find(m => m.id === 'gemini-2.5-flash-lite');
      if (flashModel) {
        // Put Flash-Lite first for high-stakes STARTER (more reliable)
        candidateModels = [flashModel, ...candidateModels.filter(m => m.id !== flashModel.id)];
      }
    }

    // Step 6.1: PRO GPT restriction based on intent classifier
    if (input.planType === PlanType.PRO && intentClassification && !intentClassification.allowGPT) {
      candidateModels = candidateModels.filter(m => m.id !== 'gpt-5.1');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ NEW v3.1: Force Flash if kill-switch active (BUT NOT for high-stakes!)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!isHighStakes && shouldForceFlash(input.planType)) {
      const flashModel = candidateModels.find(m => m.id.includes('flash'));
      if (flashModel) {
        candidateModels = [flashModel];
        wasKillSwitched = true;
        killSwitchReason = killSwitchReason 
          ? `${killSwitchReason}, force-flash`
          : 'force-flash';
      }
    }

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
    
    // ✅ Build fallback chain (also filter by kill-switch)
    const fallbackChain = rankedModels
      .slice(1, 4)
      .filter(m => isModelAllowed(m.id))
      .map(m => m.id);

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

    // ✅ CHANGE 1: Structured observability logging (no console.log spam)
    if (input.requestId) {
      logRouting({
        requestId: input.requestId,
        userId: input.userId,
        plan: input.planType,
        intent: intentClassification?.intent || 'unknown',
        modelChosen: bestModel.id,
        modelOriginal: wasKillSwitched ? undefined : bestModel.id,
        wasDowngraded: wasKillSwitched || budgetPressure > 0.7,
        downgradeReason: killSwitchReason,
        pressureLevel: budgetPressure > 0.8 ? 'HIGH' : budgetPressure > 0.5 ? 'MEDIUM' : 'LOW',
        tokensEstimated: estimatedTokens,
      });
    }

    return {
      modelId: bestModel.id,
      provider: bestModel.provider,
      displayName: bestModel.displayName,
      reason: this.buildReason(complexity, budgetPressure, isHighStakes, specialization, wasKillSwitched, killSwitchReason),
      complexity,
      budgetPressure,
      estimatedCost,
      expectedQuality,
      specialization: specialization || undefined,
      fallbackChain,
      confidence,
      wasKillSwitched,
      killSwitchReason,
      region,  // ← NEW v3.2: Include region in decision
      intentClassification,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ NEW v3.1: Maintenance Mode Response
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private createMaintenanceResponse(input: RoutingInput): RoutingDecision {
    return {
      modelId: 'gemini-2.5-flash-lite',
      provider: 'maintenance',
      displayName: 'Maintenance Mode',
      reason: 'System under maintenance',
      complexity: 'CASUAL',
      budgetPressure: 0,
      estimatedCost: 0,
      expectedQuality: 'good',
      fallbackChain: [],
      confidence: 1,
      wasKillSwitched: true,
      killSwitchReason: 'maintenance-mode',
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
      /```[\s\S]{20,}```/,
      /\b(function|const|let|var)\s+\w+\s*[=(]/,
      /class\s+\w+\s*(extends|implements|{)/,
      /import\s+.*from\s*['"`]/,
      /(SELECT|INSERT|UPDATE|DELETE)\s+.*FROM/i,
      /(CREATE|ALTER|DROP)\s+(TABLE|INDEX|DATABASE)/i,
      /\b(async|await)\s+/,
      /\.(map|filter|reduce|forEach)\s*\(/,
      /\b(interface|type|enum)\s+\w+/,
      /\b(indemnity|arbitration|jurisdiction|liability)\b/i,
      /(term\s*sheet|cap\s*table|valuation|dilution)\b/i,
      /\b(diagnos|prognosis|prescription|dosage)\b/i,
      /\b(algorithm|complexity|optimization|architecture)\b/i,
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
      /\?.*\?/,
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
      /₹\s*\d{5,}|\$\s*\d{4,}|€\s*\d{4,}/,
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

    // Code detection
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
  // INTENT CLASSIFICATION BY PLAN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTENT CLASSIFICATION BY PLAN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
private classifyIntentByPlan(input: RoutingInput): RoutingDecision['intentClassification'] | undefined {
  try {
    switch (input.planType) {
     case PlanType.STARTER: {
     const result: StarterIntentResult = classifyStarterMessage(input.text);
        // Map guard intent to delta intent
        const deltaIntent = result.intent === 'LEARNING' ? 'LEARNING' : 'GENERAL';
        const deltaPrompt = getStarterDelta(deltaIntent as any);
        return {
          plan: 'STARTER',
          intent: result.intent,
          confidence: 0.85,
          deltaPrompt,
          nudgeType: result.nudgeType,
        };
      }

      case PlanType.PLUS: {
      const result: PlusIntentResult = classifyPlusMessage(input.text);
        const deltaPrompt = getPlusDelta(result.intent);
        return {
          plan: 'PLUS',
          intent: result.intent,
          confidence: 0.85,
          deltaPrompt,
          nudgeType: result.nudgeType,
        };
      }

      case PlanType.PRO: {
        const result: ProIntentResult = classifyProMessage(input.text, input.gptRemainingTokens);
        const deltaPrompt = getProDelta(result.intent);
        return {
          plan: 'PRO',
          intent: result.intent,
          confidence: 0.85,
          deltaPrompt,
          nudgeType: result.nudgeType,
          allowGPT: result.allowGPT,
        };
      }

      case PlanType.APEX:
      case PlanType.SOVEREIGN: {  
        const result: ApexIntentResult = classifyApexMessage(input.text);
        const deltaPrompt = getApexDelta(result.intent);
        return {
          plan: input.planType,
          intent: result.intent,
          confidence: 0.85,
          deltaPrompt,
          nudgeType: result.nudgeType,
          allowGPT: true,
        };
      }

      default:
        return undefined;
    }
  } catch (error) {
    console.error('[SmartRouting] Intent classification error:', error);
    return undefined;
  }
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
    
    // ✅ CHANGE 3: Include actual kill-switch reason
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
    const modelIds = mapping[planType] || ['gemini-2.5-flash-lite'];
    // ✅ Also filter by kill-switch
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
    return mapping[planType] || ['gemini-2.5-flash-lite'];
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

  // ✅ NEW v3.1: Get kill-switch status
  public getKillSwitchStatus() {
    return killSwitches.getStatus();
  }
  // ✅ NEW: Get model allocations for plan
  public getModelAllocationsForPlan(planType: PlanType, region: 'IN' | 'INTL' = 'IN') {
    return getModelAllocations(planType, region);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SINGLETON EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const smartRoutingService = SmartRoutingService.getInstance();