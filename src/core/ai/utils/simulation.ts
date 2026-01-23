// src/core/ai/utils/simulation.ts
// ============================================================================
// SORIVA SIMULATION SCRIPT v2.0 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Real stress testing with WORST-CASE scenarios
//
// v2.0 FIXES:
// ✅ Simulation modes: AVERAGE, WORST_CASE, BEST_CASE, ABUSE
// ✅ Deterministic pressure (usage-driven, not random)
// ✅ Intent-aware model routing
// ✅ Revenue simulation (profitability check)
// ✅ Realistic message counts
// ✅ Monotonic pressure (never decreases in session)
//
// MODES:
// - AVERAGE: Monte Carlo random distribution
// - WORST_CASE: Max tokens, expensive models, no savings
// - BEST_CASE: Min tokens, cheap models, all optimizations
// - ABUSE: Free tier abuse scenario
//
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type SimulationMode = 'AVERAGE' | 'WORST_CASE' | 'BEST_CASE' | 'ABUSE';

export interface SimulationConfig {
  mode: SimulationMode;
  users: number;
  messagesPerUser: { min: number; max: number };
  planDistribution: PlanDistribution;
  intentDistribution: IntentDistribution;
  failureRate: number;
  verbose: boolean;
}

export interface PlanDistribution {
  STARTER: number;
  PLUS: number;
  PRO: number;
  APEX: number;
}

export interface IntentDistribution {
  QUICK: number;
  TECHNICAL: number;
  CREATIVE: number;
  LEARNING: number;
  PERSONAL: number;
  RESEARCH: number;
  EXPERT: number;
}

export interface SimulationResult {
  mode: SimulationMode;
  summary: {
    totalRequests: number;
    successRate: number;
    avgLatencyMs: number;
    totalCostINR: number;
    avgCostPerUser: number;
    // 🆕 Revenue breakdown
    subscriptionRevenueINR: number;
    boosterRevenueINR: number;
    totalRevenueINR: number;
    profitINR: number;
    profitMargin: number;
    isProfitable: boolean;
    // 🆕 Conversion stats
    paidUsers: number;
    conversionRate: number;
    boostersPurchased: number;
  };
  byPlan: Record<string, PlanMetrics>;
  byIntent: Record<string, IntentMetrics>;
  pressure: PressureMetrics;
  fallbacks: FallbackMetrics;
  bottlenecks: string[];
  recommendations: string[];
}

export interface PlanMetrics {
  users: number;
  requests: number;
  successRate: number;
  avgLatencyMs: number;
  totalCostINR: number;
  avgCostPerUser: number;
  // 🆕 Revenue breakdown
  subscriptionRevenueINR: number;
  boosterRevenueINR: number;
  revenueINR: number;
  profitINR: number;
  profitMargin: number;
  downgrades: number;
  pressureEvents: number;
  avgPressureLevel: number;
  // 🆕 Conversion stats
  paidUsers: number;
  conversionRate: number;
  boostersPurchased: number;
}

export interface IntentMetrics {
  count: number;
  successRate: number;
  avgLatencyMs: number;
  avgTokens: number;
  avgCostINR: number;
}

export interface PressureMetrics {
  lowCount: number;
  mediumCount: number;
  highCount: number;
  criticalCount: number;
  avgLevel: number;
  usersReachedHigh: number;
  usersReachedCritical: number;
}

export interface FallbackMetrics {
  totalFallbacks: number;
  fallbackRate: number;
  byModel: Record<string, number>;
  ultimateFallbacks: number;
}

// ============================================================================
// CONSTANTS - VERIFIED VALUES
// ============================================================================

// Plan pricing (INR)
const PLAN_PRICING: Record<string, number> = {
  STARTER: 0,
  PLUS: 299,
  PRO: 799,
  APEX: 1299,
};

// 🆕 FIX 2: Conversion rates (not everyone pays successfully)
const PLAN_CONVERSION_RATE: Record<string, number> = {
  STARTER: 0,       // Free, no conversion
  PLUS: 0.85,       // 85% successful payment
  PRO: 0.90,        // 90% successful payment
  APEX: 0.95,       // 95% successful payment (committed users)
};

// 🆕 FIX 4: Booster economics
const BOOSTER_CONFIG = {
  LITE: { price: 49, tokens: 100000 },    // ₹49 for 100K tokens
  PRO: { price: 149, tokens: 350000 },    // ₹149 for 350K tokens
  MAX: { price: 299, tokens: 800000 },    // ₹299 for 800K tokens
};

// Probability of buying booster when hitting pressure
const BOOSTER_PURCHASE_RATE: Record<string, number> = {
  STARTER: 0.02,    // 2% - mostly won't pay
  PLUS: 0.15,       // 15% - some will top up
  PRO: 0.25,        // 25% - more likely
  APEX: 0.35,       // 35% - power users buy boosters
};

// Token limits per plan (VERIFIED)
const PLAN_TOKEN_LIMITS: Record<string, number> = {
  STARTER: 50000,       // 50K for free
  PLUS: 1180000,        // 1.18M
  PRO: 1300000,         // 1.3M
  APEX: 2750000,        // 2.75M
};

// Daily token limits
const DAILY_TOKEN_LIMITS: Record<string, number> = {
  STARTER: 5000,        // 5K/day
  PLUS: 50000,          // 50K/day
  PRO: 75000,           // 75K/day
  APEX: 150000,         // 150K/day
};

// Token estimates by intent (min/max)
const INTENT_TOKEN_RANGES: Record<string, { min: number; max: number; avg: number }> = {
  QUICK: { min: 100, max: 500, avg: 250 },
  TECHNICAL: { min: 500, max: 2500, avg: 1200 },
  CREATIVE: { min: 300, max: 1500, avg: 700 },
  LEARNING: { min: 400, max: 2000, avg: 900 },
  PERSONAL: { min: 200, max: 800, avg: 400 },
  RESEARCH: { min: 800, max: 3500, avg: 1800 },
  EXPERT: { min: 1500, max: 5000, avg: 2800 },
};

// Model latency (ms)
const MODEL_LATENCY: Record<string, { min: number; max: number }> = {
  'gemini-2.5-flash-lite': { min: 200, max: 500 },
  'gemini-2.5-flash': { min: 300, max: 800 },
  'gemini-2.5-pro': { min: 500, max: 1500 },
  'mistral-large-3-2512': { min: 350, max: 1000 },
  'gpt-5.1': { min: 600, max: 2000 },
  'claude-sonnet-4-5': { min: 700, max: 2500 },
};

// Cost per 1K tokens (INR) - INPUT + OUTPUT averaged
const MODEL_COST_PER_1K: Record<string, number> = {
  'gemini-2.5-flash-lite': 0.01,
  'gemini-2.5-flash': 0.21,
  'gemini-2.5-pro': 0.50,
  'mistral-large-3-2512': 0.125,
  'gpt-5.1': 1.20,
  'claude-sonnet-4-5': 1.50,
};

// Intent to Model mapping (deterministic)
const INTENT_MODEL_MAP: Record<string, Record<string, string>> = {
  STARTER: {
    QUICK: 'gemini-2.5-flash-lite',
    TECHNICAL: 'gemini-2.5-flash',
    CREATIVE: 'gemini-2.5-flash',
    LEARNING: 'gemini-2.5-flash',
    PERSONAL: 'gemini-2.5-flash-lite',
    RESEARCH: 'gemini-2.5-flash',
    EXPERT: 'gemini-2.5-flash',
  },
  PLUS: {
    QUICK: 'gemini-2.5-flash',
    TECHNICAL: 'mistral-large-3-2512',
    CREATIVE: 'gemini-2.5-flash',
    LEARNING: 'gemini-2.5-pro',
    PERSONAL: 'gemini-2.5-flash',
    RESEARCH: 'gemini-2.5-pro',
    EXPERT: 'gemini-2.5-pro',
  },
  PRO: {
    QUICK: 'gemini-2.5-flash',
    TECHNICAL: 'gpt-5.1',
    CREATIVE: 'gemini-2.5-pro',
    LEARNING: 'gemini-2.5-pro',
    PERSONAL: 'gemini-2.5-pro',
    RESEARCH: 'gpt-5.1',
    EXPERT: 'gpt-5.1',
  },
  APEX: {
    QUICK: 'gemini-2.5-flash',
    TECHNICAL: 'gpt-5.1',
    CREATIVE: 'claude-sonnet-4-5',
    LEARNING: 'claude-sonnet-4-5',
    PERSONAL: 'claude-sonnet-4-5',
    RESEARCH: 'gpt-5.1',
    EXPERT: 'claude-sonnet-4-5',
  },
};

// Pressure thresholds by plan
const PRESSURE_THRESHOLDS: Record<string, Record<string, number>> = {
  STARTER: { LOW: 0.50, MEDIUM: 0.70, HIGH: 0.85, CRITICAL: 0.95 },
  PLUS: { LOW: 0.60, MEDIUM: 0.75, HIGH: 0.88, CRITICAL: 0.95 },
  PRO: { LOW: 0.65, MEDIUM: 0.80, HIGH: 0.90, CRITICAL: 0.96 },
  APEX: { LOW: 0.75, MEDIUM: 0.85, HIGH: 0.92, CRITICAL: 0.97 },
};

// Downgrade model under pressure
const PRESSURE_DOWNGRADE_MODEL = 'gemini-2.5-flash';

// Fallback chain
const FALLBACK_CHAIN = [
  'claude-sonnet-4-5',
  'gpt-5.1',
  'gemini-2.5-pro',
  'mistral-large-3-2512',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

// ============================================================================
// MODE-SPECIFIC CONFIGURATIONS
// ============================================================================

const MODE_CONFIGS: Record<SimulationMode, Partial<SimulationConfig>> = {
  AVERAGE: {
    messagesPerUser: { min: 20, max: 50 },
    failureRate: 0.03,
  },
  WORST_CASE: {
    messagesPerUser: { min: 80, max: 120 },  // Heavy users
    failureRate: 0,                           // No failures = no savings
    intentDistribution: {
      QUICK: 5,
      TECHNICAL: 25,
      CREATIVE: 10,
      LEARNING: 15,
      PERSONAL: 5,
      RESEARCH: 20,
      EXPERT: 20,  // Heavy on expensive intents
    },
  },
  BEST_CASE: {
    messagesPerUser: { min: 10, max: 20 },   // Light users
    failureRate: 0.02,
    intentDistribution: {
      QUICK: 50,     // Mostly quick queries
      TECHNICAL: 15,
      CREATIVE: 10,
      LEARNING: 10,
      PERSONAL: 10,
      RESEARCH: 3,
      EXPERT: 2,
    },
  },
  ABUSE: {
    messagesPerUser: { min: 150, max: 200 }, // Extreme usage
    failureRate: 0,
    planDistribution: {
      STARTER: 100,  // All free users
      PLUS: 0,
      PRO: 0,
      APEX: 0,
    },
    intentDistribution: {
      QUICK: 10,
      TECHNICAL: 30,
      CREATIVE: 15,
      LEARNING: 15,
      PERSONAL: 5,
      RESEARCH: 15,
      EXPERT: 10,
    },
  },
};

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: SimulationConfig = {
  mode: 'AVERAGE',
  users: 1000,
  messagesPerUser: { min: 20, max: 50 },
  planDistribution: {
    STARTER: 60,
    PLUS: 25,
    PRO: 10,
    APEX: 5,
  },
  intentDistribution: {
    QUICK: 30,
    TECHNICAL: 20,
    CREATIVE: 15,
    LEARNING: 15,
    PERSONAL: 10,
    RESEARCH: 5,
    EXPERT: 5,
  },
  failureRate: 0.03,
  verbose: false,
};

// ============================================================================
// VIRTUAL USER
// ============================================================================

interface VirtualUser {
  id: string;
  plan: string;
  tokensUsed: number;
  tokenLimit: number;
  dailyTokensUsed: number;
  dailyTokenLimit: number;
  currentPressureLevel: string;
  reachedHighPressure: boolean;
  reachedCriticalPressure: boolean;
  // 🆕 Booster tracking
  boostersPurchased: number;
  boosterRevenue: number;
  // 🆕 Conversion tracking
  isPaidUser: boolean;
}

// ============================================================================
// SIMULATION ENGINE v2.0
// ============================================================================

class SimulationEngine {
  private config: SimulationConfig;
  private results: {
    requests: SimulatedRequest[];
    fallbacks: SimulatedFallback[];
    pressureChanges: PressureChange[];
  };
  // 🆕 FIX 1 & 2: Store user data for analysis (single source of truth)
  private userDataMap: Map<string, UserData>;

  constructor(config: Partial<SimulationConfig> = {}) {
    // Merge mode-specific config
    const mode = config.mode || 'AVERAGE';
    const modeConfig = MODE_CONFIGS[mode] || {};
    
    this.config = { 
      ...DEFAULT_CONFIG, 
      ...modeConfig,
      ...config,
      mode,
    };
    
    this.results = {
      requests: [],
      fallbacks: [],
      pressureChanges: [],
    };
    
    this.userDataMap = new Map();
  }

  /**
   * Run full simulation
   */
  async run(): Promise<SimulationResult> {
    console.log('🚀 Starting Soriva Simulation v2.0...');
    console.log(`   Mode: ${this.config.mode}`);
    console.log(`   Users: ${this.config.users}`);
    console.log(`   Messages/User: ${this.config.messagesPerUser.min}-${this.config.messagesPerUser.max}`);
    console.log(`   Failure Rate: ${this.config.failureRate * 100}%`);
    console.log('');

    const startTime = Date.now();

    // Generate users
    const users = this.generateUsers();

    // Simulate requests for each user
    for (const user of users) {
      await this.simulateUser(user);
    }

    const endTime = Date.now();
    console.log(`\n✅ Simulation complete in ${endTime - startTime}ms`);

    // Analyze results
    return this.analyzeResults();
  }

  /**
   * Generate virtual users
   */
  private generateUsers(): VirtualUser[] {
    const users: VirtualUser[] = [];
    const { planDistribution } = this.config;

    const plans = [
      { plan: 'STARTER', count: Math.round(this.config.users * planDistribution.STARTER / 100) },
      { plan: 'PLUS', count: Math.round(this.config.users * planDistribution.PLUS / 100) },
      { plan: 'PRO', count: Math.round(this.config.users * planDistribution.PRO / 100) },
      { plan: 'APEX', count: Math.round(this.config.users * planDistribution.APEX / 100) },
    ];

    let userId = 1;
    for (const { plan, count } of plans) {
      for (let i = 0; i < count; i++) {
        // 🆕 FIX 1: Apply conversion rate ONCE at creation
        const conversionRate = PLAN_CONVERSION_RATE[plan] || 0;
        const isPaidUser = Math.random() < conversionRate;
        
        const user: VirtualUser = {
          id: `user_${userId++}`,
          plan,
          tokensUsed: 0,
          tokenLimit: PLAN_TOKEN_LIMITS[plan],
          dailyTokensUsed: 0,
          dailyTokenLimit: DAILY_TOKEN_LIMITS[plan],
          currentPressureLevel: 'LOW',
          reachedHighPressure: false,
          reachedCriticalPressure: false,
          boostersPurchased: 0,
          boosterRevenue: 0,
          isPaidUser,
        };
        
        users.push(user);
        
        // 🆕 FIX 1 & 2: Store user data for analysis (single source of truth)
        this.userDataMap.set(user.id, {
          plan,
          isPaidUser,
          boosterRevenue: 0,
          boostersPurchased: 0,
        });
      }
    }

    return users;
  }

  /**
   * Simulate all requests for a user
   */
  private async simulateUser(user: VirtualUser): Promise<void> {
    const { min, max } = this.config.messagesPerUser;
    const messageCount = this.randomInt(min, max);

    // 🆕 FIX 3: Simulate multiple days
    // Estimate messages per day based on daily limit
    const avgTokensPerMessage = this.getAverageTokensForPlan(user.plan);
    const messagesPerDay = Math.floor(user.dailyTokenLimit / avgTokensPerMessage);
    let messagesThisDay = 0;

    for (let i = 0; i < messageCount; i++) {
      // Stop if user exhausted their MONTHLY limit
      if (user.tokensUsed >= user.tokenLimit) {
        break;
      }
      
      // 🆕 FIX 3: Simulate day rollover
      if (messagesThisDay >= messagesPerDay) {
        // New day - reset daily tokens
        user.dailyTokensUsed = 0;
        messagesThisDay = 0;
      }
      
      // Estimate tokens for next request
      const estimatedTokens = avgTokensPerMessage;
      if (user.dailyTokensUsed + estimatedTokens > user.dailyTokenLimit) {
        // Daily limit reached - simulate waiting for next day
        user.dailyTokensUsed = 0;
        messagesThisDay = 0;
      }
      
      await this.simulateRequest(user);
      messagesThisDay++;
    }
  }

  /**
   * Get average tokens for a plan (for daily limit estimation)
   */
  private getAverageTokensForPlan(plan: string): number {
    // Rough average based on intent distribution
    const avgByPlan: Record<string, number> = {
      STARTER: 400,   // Mostly QUICK
      PLUS: 800,      // Mixed
      PRO: 1200,      // More complex
      APEX: 1500,     // Heavy usage
    };
    return avgByPlan[plan] || 500;
  }

  /**
   * Simulate a single request
   */
  private async simulateRequest(user: VirtualUser): Promise<void> {
    const intent = this.pickIntent();
    const tokens = this.getTokensForIntent(intent);
    
    // Calculate DETERMINISTIC pressure
    const usageRatio = user.tokensUsed / user.tokenLimit;
    const { level: newPressureLevel, changed } = this.calculatePressure(user, usageRatio);
    
    // Track pressure changes
    if (changed) {
      this.results.pressureChanges.push({
        userId: user.id,
        plan: user.plan,
        previousLevel: user.currentPressureLevel,
        newLevel: newPressureLevel,
        usageRatio,
      });
      user.currentPressureLevel = newPressureLevel;
    }

    // Track high/critical
    if (newPressureLevel === 'HIGH') user.reachedHighPressure = true;
    if (newPressureLevel === 'CRITICAL') user.reachedCriticalPressure = true;

    // 🆕 FIX 4: Simulate booster purchase at HIGH pressure
    if (changed && (newPressureLevel === 'HIGH' || newPressureLevel === 'CRITICAL')) {
      this.simulateBoosterPurchase(user);
    }

    // Intent-aware model selection
    let model = this.getModelForIntent(user.plan, intent);
    let wasDowngraded = false;

    // Apply pressure downgrade
    // 🆕 FIX 3: WORST_CASE delays downgrade to CRITICAL only (not disabled)
    const shouldDowngrade = this.config.mode === 'WORST_CASE'
      ? newPressureLevel === 'CRITICAL'  // WORST_CASE: Only at CRITICAL
      : (newPressureLevel === 'HIGH' || newPressureLevel === 'CRITICAL');  // Normal: HIGH or CRITICAL

    if (shouldDowngrade) {
      model = PRESSURE_DOWNGRADE_MODEL;
      wasDowngraded = true;
    }

    // Simulate failure
    const failed = Math.random() < this.config.failureRate;
    let finalModel = model;
    let fallbackUsed = false;
    let fallbackLevel = 0;

    if (failed) {
      const fallback = this.simulateFallback(model);
      finalModel = fallback.model;
      fallbackUsed = true;
      fallbackLevel = fallback.level;

      this.results.fallbacks.push({
        userId: user.id,
        plan: user.plan,
        originalModel: model,
        fallbackModel: finalModel,
        level: fallbackLevel,
        recovered: fallback.recovered,
      });
    }

    // Calculate cost and latency
    const latency = this.getLatency(finalModel);
    const cost = this.calculateCost(finalModel, tokens);

    // Update user tokens
    user.tokensUsed += tokens;
    user.dailyTokensUsed += tokens;

    // Store request
    this.results.requests.push({
      userId: user.id,
      plan: user.plan,
      intent,
      model: finalModel,
      originalModel: model,
      wasDowngraded,
      tokens,
      latencyMs: latency,
      costINR: cost,
      success: !failed || fallbackUsed,
      fallbackUsed,
      fallbackLevel,
      pressureLevel: newPressureLevel,
      usageRatio,
    });

    if (this.config.verbose) {
      const downgradeStr = wasDowngraded ? ' ⬇️' : '';
      console.log(`  [${user.plan}] ${intent} → ${finalModel}${downgradeStr} | ${tokens} tokens | ₹${cost.toFixed(4)} | ${(usageRatio * 100).toFixed(1)}%`);
    }
  }

  /**
   * Pick intent based on distribution
   */
  private pickIntent(): string {
    const { intentDistribution } = this.config;
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const [intent, percentage] of Object.entries(intentDistribution)) {
      cumulative += percentage;
      if (rand <= cumulative) {
        return intent;
      }
    }

    return 'QUICK';
  }

  /**
   * Get tokens for intent based on mode
   */
  private getTokensForIntent(intent: string): number {
    const range = INTENT_TOKEN_RANGES[intent] || INTENT_TOKEN_RANGES.QUICK;
    
    switch (this.config.mode) {
      case 'WORST_CASE':
        return range.max;  // Always max tokens
      case 'BEST_CASE':
        return range.min;  // Always min tokens
      default:
        return this.randomInt(range.min, range.max);
    }
  }

  /**
   * Get model for intent (DETERMINISTIC)
   */
  private getModelForIntent(plan: string, intent: string): string {
    const planMap = INTENT_MODEL_MAP[plan] || INTENT_MODEL_MAP.STARTER;
    return planMap[intent] || 'gemini-2.5-flash';
  }

  /**
   * Calculate DETERMINISTIC pressure
   * Pressure is MONOTONIC - never decreases within session
   */
  private calculatePressure(
    user: VirtualUser,
    usageRatio: number
  ): { level: string; changed: boolean } {
    const thresholds = PRESSURE_THRESHOLDS[user.plan] || PRESSURE_THRESHOLDS.STARTER;
    
    // Determine new level based on usage
    let newLevel = 'LOW';
    if (usageRatio >= thresholds.CRITICAL) newLevel = 'CRITICAL';
    else if (usageRatio >= thresholds.HIGH) newLevel = 'HIGH';
    else if (usageRatio >= thresholds.MEDIUM) newLevel = 'MEDIUM';

    // Pressure is MONOTONIC - never goes down
    const levelOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const currentIndex = levelOrder.indexOf(user.currentPressureLevel);
    const newIndex = levelOrder.indexOf(newLevel);

    if (newIndex > currentIndex) {
      return { level: newLevel, changed: true };
    }

    return { level: user.currentPressureLevel, changed: false };
  }

  /**
   * Simulate fallback
   */
  private simulateFallback(failedModel: string): { model: string; level: number; recovered: boolean } {
    const startIndex = FALLBACK_CHAIN.indexOf(failedModel);
    const chain = startIndex >= 0 ? FALLBACK_CHAIN.slice(startIndex + 1) : FALLBACK_CHAIN;

    if (chain.length > 0 && Math.random() < 0.95) {
      const level = Math.min(Math.floor(Math.random() * 2) + 1, chain.length);
      return { model: chain[level - 1], level, recovered: true };
    }

    return { model: 'gemini-2.5-flash-lite', level: chain.length + 1, recovered: true };
  }

  /**
   * 🆕 FIX 4: Simulate booster purchase when user hits pressure
   * 🆕 FIX 2: Also update userDataMap (single source of truth)
   */
  private simulateBoosterPurchase(user: VirtualUser): void {
    const purchaseRate = BOOSTER_PURCHASE_RATE[user.plan] || 0;
    
    if (Math.random() < purchaseRate) {
      // User decides to buy a booster
      // Pick booster type based on plan
      let booster: { price: number; tokens: number };
      
      if (user.plan === 'APEX') {
        booster = BOOSTER_CONFIG.MAX;
      } else if (user.plan === 'PRO') {
        booster = BOOSTER_CONFIG.PRO;
      } else {
        booster = BOOSTER_CONFIG.LITE;
      }
      
      // Add tokens and track revenue on user object
      user.tokenLimit += booster.tokens;
      user.boostersPurchased++;
      user.boosterRevenue += booster.price;
      
      // 🆕 FIX 2: Sync with userDataMap (single source of truth for analysis)
      const userData = this.userDataMap.get(user.id);
      if (userData) {
        userData.boosterRevenue += booster.price;
        userData.boostersPurchased++;
      }
    }
  }

  /**
   * Get latency for model
   */
  private getLatency(model: string): number {
    const range = MODEL_LATENCY[model] || MODEL_LATENCY['gemini-2.5-flash'];
    
    if (this.config.mode === 'WORST_CASE') {
      return range.max;
    }
    if (this.config.mode === 'BEST_CASE') {
      return range.min;
    }
    
    return this.randomInt(range.min, range.max);
  }

  /**
   * Calculate cost
   */
  private calculateCost(model: string, tokens: number): number {
    const costPer1K = MODEL_COST_PER_1K[model] || MODEL_COST_PER_1K['gemini-2.5-flash'];
    return (tokens / 1000) * costPer1K;
  }

  /**
   * Random integer
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Analyze results
   */
  private analyzeResults(): SimulationResult {
    const { requests, fallbacks, pressureChanges } = this.results;

    // 🆕 FIX 1 & 2: Use actual user data, not re-randomized
    // We need to pass user data through - store it during simulation
    const userDataMap = this.userDataMap; // Will be set during simulation

    // Unique users from requests
    const uniqueUsers = new Set(requests.map(r => r.userId));
    const userPlans = new Map<string, string>();
    requests.forEach(r => userPlans.set(r.userId, r.plan));

    // Summary
    const totalRequests = requests.length;
    const successCount = requests.filter(r => r.success).length;
    const totalLatency = requests.reduce((sum, r) => sum + r.latencyMs, 0);
    const totalCost = requests.reduce((sum, r) => sum + r.costINR, 0);

    // 🆕 FIX 1 & 2: Calculate revenue from ACTUAL user data (no re-randomization)
    let subscriptionRevenue = 0;
    let totalBoosterRevenue = 0;
    let totalBoostersPurchased = 0;
    let paidUsersCount = 0;
    
    for (const [userId, userData] of userDataMap) {
      // Subscription revenue (only if user converted - determined at creation time)
      if (userData.isPaidUser) {
        subscriptionRevenue += PLAN_PRICING[userData.plan];
        paidUsersCount++;
      }
      
      // Booster revenue (from actual purchases during simulation)
      totalBoosterRevenue += userData.boosterRevenue;
      totalBoostersPurchased += userData.boostersPurchased;
    }

    const totalRevenue = subscriptionRevenue + totalBoosterRevenue;
    const profit = totalRevenue - totalCost;

    // By Plan
    const byPlan: Record<string, PlanMetrics> = {};
    for (const plan of ['STARTER', 'PLUS', 'PRO', 'APEX']) {
      const planRequests = requests.filter(r => r.plan === plan);
      const planUserIds = new Set(planRequests.map(r => r.userId));
      const planUsers = planUserIds.size;
      const planCost = planRequests.reduce((sum, r) => sum + r.costINR, 0);
      
      // 🆕 FIX 1 & 2: Use actual user data for this plan
      let planPaidUsers = 0;
      let planSubRevenue = 0;
      let planBoosterRevenue = 0;
      let planBoosterCount = 0;
      
      for (const userId of planUserIds) {
        const userData = userDataMap.get(userId);
        if (userData) {
          if (userData.isPaidUser) {
            planPaidUsers++;
            planSubRevenue += PLAN_PRICING[plan];
          }
          planBoosterRevenue += userData.boosterRevenue;
          planBoosterCount += userData.boostersPurchased;
        }
      }
      
      const planRevenue = planSubRevenue + planBoosterRevenue;

      // Pressure tracking
      const planPressureLevels = planRequests.map(r => r.pressureLevel);
      const levelValues: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
      const avgPressure = planPressureLevels.length > 0
        ? planPressureLevels.reduce((sum, l) => sum + levelValues[l], 0) / planPressureLevels.length
        : 1;

      byPlan[plan] = {
        users: planUsers,
        requests: planRequests.length,
        successRate: planRequests.length > 0
          ? (planRequests.filter(r => r.success).length / planRequests.length) * 100
          : 100,
        avgLatencyMs: planRequests.length > 0
          ? planRequests.reduce((sum, r) => sum + r.latencyMs, 0) / planRequests.length
          : 0,
        totalCostINR: planCost,
        avgCostPerUser: planUsers > 0 ? planCost / planUsers : 0,
        subscriptionRevenueINR: planSubRevenue,
        boosterRevenueINR: planBoosterRevenue,
        revenueINR: planRevenue,
        profitINR: planRevenue - planCost,
        profitMargin: planRevenue > 0 ? ((planRevenue - planCost) / planRevenue) * 100 : (planCost > 0 ? -100 : 0),
        downgrades: planRequests.filter(r => r.wasDowngraded).length,
        pressureEvents: pressureChanges.filter(p => p.plan === plan).length,
        avgPressureLevel: avgPressure,
        paidUsers: planPaidUsers,
        conversionRate: planUsers > 0 ? (planPaidUsers / planUsers) * 100 : 0,
        boostersPurchased: planBoosterCount,
      };
    }

    // By Intent
    const byIntent: Record<string, IntentMetrics> = {};
    for (const intent of Object.keys(INTENT_TOKEN_RANGES)) {
      const intentRequests = requests.filter(r => r.intent === intent);
      byIntent[intent] = {
        count: intentRequests.length,
        successRate: intentRequests.length > 0
          ? (intentRequests.filter(r => r.success).length / intentRequests.length) * 100
          : 100,
        avgLatencyMs: intentRequests.length > 0
          ? intentRequests.reduce((sum, r) => sum + r.latencyMs, 0) / intentRequests.length
          : 0,
        avgTokens: intentRequests.length > 0
          ? intentRequests.reduce((sum, r) => sum + r.tokens, 0) / intentRequests.length
          : 0,
        avgCostINR: intentRequests.length > 0
          ? intentRequests.reduce((sum, r) => sum + r.costINR, 0) / intentRequests.length
          : 0,
      };
    }

    // Pressure
    const pressureLevels = requests.map(r => r.pressureLevel);
    const levelValues: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    
    // Count users who reached high/critical
    const usersReachedHigh = new Set(
      requests.filter(r => r.pressureLevel === 'HIGH' || r.pressureLevel === 'CRITICAL').map(r => r.userId)
    ).size;
    const usersReachedCritical = new Set(
      requests.filter(r => r.pressureLevel === 'CRITICAL').map(r => r.userId)
    ).size;

    const pressure: PressureMetrics = {
      lowCount: pressureLevels.filter(l => l === 'LOW').length,
      mediumCount: pressureLevels.filter(l => l === 'MEDIUM').length,
      highCount: pressureLevels.filter(l => l === 'HIGH').length,
      criticalCount: pressureLevels.filter(l => l === 'CRITICAL').length,
      avgLevel: pressureLevels.reduce((sum, l) => sum + levelValues[l], 0) / pressureLevels.length,
      usersReachedHigh,
      usersReachedCritical,
    };

    // Fallbacks
    const fallbacksByModel: Record<string, number> = {};
    for (const fb of fallbacks) {
      fallbacksByModel[fb.fallbackModel] = (fallbacksByModel[fb.fallbackModel] || 0) + 1;
    }

    const fallbackMetrics: FallbackMetrics = {
      totalFallbacks: fallbacks.length,
      fallbackRate: totalRequests > 0 ? (fallbacks.length / totalRequests) * 100 : 0,
      byModel: fallbacksByModel,
      ultimateFallbacks: fallbacks.filter(f => f.level > 3).length,
    };

    // Bottlenecks & Recommendations
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];

    // Check profitability
    if (profit < 0) {
      bottlenecks.push(`NEGATIVE PROFIT: ₹${profit.toFixed(2)}`);
      recommendations.push('Increase prices or reduce model costs');
    }

    // Check STARTER cost
    if (byPlan.STARTER && byPlan.STARTER.avgCostPerUser > 2) {
      bottlenecks.push(`STARTER cost too high: ₹${byPlan.STARTER.avgCostPerUser.toFixed(2)}/user`);
      recommendations.push('Force Flash-Lite for all STARTER users');
    }

    // Check pressure
    if (pressure.criticalCount > totalRequests * 0.1) {
      bottlenecks.push(`High CRITICAL pressure: ${(pressure.criticalCount / totalRequests * 100).toFixed(1)}%`);
      recommendations.push('Review token limits or pressure thresholds');
    }

    // Check fallback rate
    if (fallbackMetrics.fallbackRate > 5) {
      bottlenecks.push(`High fallback rate: ${fallbackMetrics.fallbackRate.toFixed(1)}%`);
      recommendations.push('Check primary model availability');
    }

    // Check conversion rates
    const overallConversion = uniqueUsers.size > 0 ? (paidUsersCount / uniqueUsers.size) * 100 : 0;
    if (overallConversion < 30 && this.config.mode !== 'ABUSE') {
      bottlenecks.push(`Low conversion rate: ${overallConversion.toFixed(1)}%`);
      recommendations.push('Improve upgrade flow or value proposition');
    }

    // Check booster revenue
    if (totalBoosterRevenue < subscriptionRevenue * 0.1 && usersReachedHigh > uniqueUsers.size * 0.2) {
      recommendations.push('Booster conversion low despite pressure - improve booster UX');
    }

    // Plan-specific checks
    for (const [plan, metrics] of Object.entries(byPlan)) {
      if (metrics.profitMargin < 20 && plan !== 'STARTER' && metrics.revenueINR > 0) {
        bottlenecks.push(`${plan} margin too low: ${metrics.profitMargin.toFixed(1)}%`);
        recommendations.push(`Review ${plan} model routing or pricing`);
      }
    }

    return {
      mode: this.config.mode,
      summary: {
        totalRequests,
        successRate: (successCount / totalRequests) * 100,
        avgLatencyMs: totalLatency / totalRequests,
        totalCostINR: totalCost,
        avgCostPerUser: totalCost / uniqueUsers.size,
        subscriptionRevenueINR: subscriptionRevenue,
        boosterRevenueINR: totalBoosterRevenue,
        totalRevenueINR: totalRevenue,
        profitINR: profit,
        profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : (totalCost > 0 ? -100 : 0),
        isProfitable: profit > 0,
        paidUsers: paidUsersCount,
        conversionRate: uniqueUsers.size > 0 ? (paidUsersCount / uniqueUsers.size) * 100 : 0,
        boostersPurchased: totalBoostersPurchased,
      },
      byPlan,
      byIntent,
      pressure,
      fallbacks: fallbackMetrics,
      bottlenecks,
      recommendations,
    };
  }
}

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface SimulatedRequest {
  userId: string;
  plan: string;
  intent: string;
  model: string;
  originalModel: string;
  wasDowngraded: boolean;
  tokens: number;
  latencyMs: number;
  costINR: number;
  success: boolean;
  fallbackUsed: boolean;
  fallbackLevel: number;
  pressureLevel: string;
  usageRatio: number;
}

interface SimulatedFallback {
  userId: string;
  plan: string;
  originalModel: string;
  fallbackModel: string;
  level: number;
  recovered: boolean;
}

interface PressureChange {
  userId: string;
  plan: string;
  previousLevel: string;
  newLevel: string;
  usageRatio: number;
}

// 🆕 FIX 1 & 2: User data for analysis (single source of truth)
interface UserData {
  plan: string;
  isPaidUser: boolean;
  boosterRevenue: number;
  boostersPurchased: number;
}

// ============================================================================
// EXPORTS
// ============================================================================

export async function runSimulation(
  config: Partial<SimulationConfig> = {}
): Promise<SimulationResult> {
  const engine = new SimulationEngine(config);
  return engine.run();
}

export function printResults(results: SimulationResult): void {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`         SORIVA SIMULATION RESULTS (${results.mode} MODE)         `);
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Profitability banner
  if (results.summary.isProfitable) {
    console.log('\n✅ PROFITABLE');
  } else {
    console.log('\n❌ NOT PROFITABLE');
  }

  console.log('\n📊 SUMMARY');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`   Total Requests:    ${results.summary.totalRequests.toLocaleString()}`);
  console.log(`   Success Rate:      ${results.summary.successRate.toFixed(2)}%`);
  console.log(`   Avg Latency:       ${results.summary.avgLatencyMs.toFixed(0)}ms`);
  console.log(`   Total Cost:        ₹${results.summary.totalCostINR.toFixed(2)}`);
  console.log(`   Avg Cost/User:     ₹${results.summary.avgCostPerUser.toFixed(2)}`);
  console.log('');
  console.log(`   💰 REVENUE BREAKDOWN:`);
  console.log(`   Subscriptions:     ₹${results.summary.subscriptionRevenueINR.toFixed(2)}`);
  console.log(`   Boosters:          ₹${results.summary.boosterRevenueINR.toFixed(2)} (${results.summary.boostersPurchased} sold)`);
  console.log(`   Total Revenue:     ₹${results.summary.totalRevenueINR.toFixed(2)}`);
  console.log(`   Profit:            ₹${results.summary.profitINR.toFixed(2)}`);
  console.log(`   Profit Margin:     ${results.summary.profitMargin.toFixed(1)}%`);
  console.log('');
  console.log(`   👥 CONVERSION:`);
  console.log(`   Paid Users:        ${results.summary.paidUsers}`);
  console.log(`   Conversion Rate:   ${results.summary.conversionRate.toFixed(1)}%`);

  console.log('\n📈 BY PLAN');
  console.log('───────────────────────────────────────────────────────────────');
  for (const [plan, m] of Object.entries(results.byPlan)) {
    const profitIcon = m.profitINR >= 0 ? '✅' : '❌';
    console.log(`   ${plan}: ${profitIcon}`);
    console.log(`      Users: ${m.users} (${m.paidUsers} paid, ${m.conversionRate.toFixed(0)}% conversion)`);
    console.log(`      Requests: ${m.requests}`);
    console.log(`      Cost: ₹${m.totalCostINR.toFixed(2)} (₹${m.avgCostPerUser.toFixed(2)}/user)`);
    console.log(`      Subscription: ₹${m.subscriptionRevenueINR.toFixed(2)} | Boosters: ₹${m.boosterRevenueINR.toFixed(2)} (${m.boostersPurchased})`);
    console.log(`      Profit: ₹${m.profitINR.toFixed(2)} (${m.profitMargin.toFixed(1)}%)`);
    console.log(`      Downgrades: ${m.downgrades} | Avg Pressure: ${m.avgPressureLevel.toFixed(2)}`);
  }

  console.log('\n🎯 BY INTENT');
  console.log('───────────────────────────────────────────────────────────────');
  for (const [intent, m] of Object.entries(results.byIntent)) {
    if (m.count > 0) {
      console.log(`   ${intent}: ${m.count} requests | ${m.avgTokens.toFixed(0)} avg tokens | ₹${m.avgCostINR.toFixed(4)}/req`);
    }
  }

  console.log('\n🔥 PRESSURE DISTRIBUTION');
  console.log('───────────────────────────────────────────────────────────────');
  const total = results.summary.totalRequests;
  console.log(`   LOW:      ${results.pressure.lowCount} (${(results.pressure.lowCount / total * 100).toFixed(1)}%)`);
  console.log(`   MEDIUM:   ${results.pressure.mediumCount} (${(results.pressure.mediumCount / total * 100).toFixed(1)}%)`);
  console.log(`   HIGH:     ${results.pressure.highCount} (${(results.pressure.highCount / total * 100).toFixed(1)}%)`);
  console.log(`   CRITICAL: ${results.pressure.criticalCount} (${(results.pressure.criticalCount / total * 100).toFixed(1)}%)`);
  console.log(`   Users reached HIGH:     ${results.pressure.usersReachedHigh}`);
  console.log(`   Users reached CRITICAL: ${results.pressure.usersReachedCritical}`);

  console.log('\n🔄 FALLBACKS');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`   Total: ${results.fallbacks.totalFallbacks} (${results.fallbacks.fallbackRate.toFixed(2)}%)`);
  console.log(`   Ultimate: ${results.fallbacks.ultimateFallbacks}`);
  if (Object.keys(results.fallbacks.byModel).length > 0) {
    console.log(`   By Model:`);
    for (const [model, count] of Object.entries(results.fallbacks.byModel)) {
      console.log(`      ${model}: ${count}`);
    }
  }

  if (results.bottlenecks.length > 0) {
    console.log('\n⚠️  BOTTLENECKS');
    console.log('───────────────────────────────────────────────────────────────');
    results.bottlenecks.forEach(b => console.log(`   • ${b}`));
  }

  if (results.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('───────────────────────────────────────────────────────────────');
    results.recommendations.forEach(r => console.log(`   • ${r}`));
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

/**
 * Run all modes for comprehensive analysis
 */
export async function runAllModes(users: number = 500): Promise<void> {
  const modes: SimulationMode[] = ['BEST_CASE', 'AVERAGE', 'WORST_CASE', 'ABUSE'];
  
  console.log('🔬 Running comprehensive simulation across all modes...\n');
  
  for (const mode of modes) {
    const results = await runSimulation({ mode, users });
    printResults(results);
  }
}

// ============================================================================
// CLI RUNNER
// ============================================================================

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const modeArg = args[0]?.toUpperCase() || 'AVERAGE';
    const users = parseInt(args[1]) || 1000;

    // 🆕 FIX: Check for 'ALL' before casting
    if (modeArg === 'ALL') {
      await runAllModes(users);
    } else {
      const mode = modeArg as SimulationMode;
      const results = await runSimulation({ mode, users });
      printResults(results);
    }
  })();
}

export default runSimulation;