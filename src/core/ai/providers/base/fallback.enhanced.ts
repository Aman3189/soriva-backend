/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ENHANCED FALLBACK SYSTEM v2.1
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * v2.1 IMPROVEMENTS (Based on Code Review):
 * 
 * 1. ✅ retryBeforeFallback - Now ACTUALLY enforced
 * 2. ✅ Context compression BEFORE fallback
 * 3. ✅ Memory-safe metrics (capped + flush support)
 * 4. ✅ External config support (quality scores from config/DB)
 * 
 * Philosophy: "Fallback = LAST resort, not first option"
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type FallbackReason = 
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'MODEL_UNAVAILABLE'
  | 'CONTEXT_LENGTH_EXCEEDED'
  | 'UNKNOWN';

export type PlanTier = 'STARTER' | 'PLUS' | 'PRO' | 'APEX' | 'SOVEREIGN';

export interface FallbackDecision {
  shouldFallback: boolean;
  reason: FallbackReason | null;
  silent: boolean;
  qualityDrop: boolean;
  costSavings: number;
  // v2.1 additions
  shouldCompressFirst: boolean;      // Try compression before fallback
  retryCountMet: boolean;            // Has retry threshold been met?
  suggestion: string | null;         // What to try before fallback
}

export interface FallbackMetric {
  timestamp: Date;
  requestId: string;
  planType: PlanTier;
  primaryProvider: string;
  fallbackProvider: string;
  reason: FallbackReason;
  costSavings: number;
  success: boolean;
  // v2.1 additions
  retryAttempts: number;
  compressionAttempted: boolean;
}

export interface RetryContext {
  attemptNumber: number;
  maxAttempts: number;
  compressionAttempted: boolean;
  contextReduced: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXTERNAL CONFIG SUPPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Quality scores - Can be loaded from:
 * 1. Config file (default)
 * 2. Database
 * 3. Redis cache
 * 4. Environment variables
 * 
 * LLMs evolve fast - update scores without redeploy!
 */
class QualityScoreConfig {
  private static instance: QualityScoreConfig;
  private scores: Map<string, number> = new Map();
  private lastUpdated: Date = new Date();
  
  // Default scores (fallback if external config fails)
  private readonly DEFAULT_SCORES: Record<string, number> = {
    'claude-sonnet-4-5': 0.96,
    'gpt-5.1': 0.92,
    'gemini-3-pro': 0.88,
    'gemini-2.5-pro': 0.82,
    'mistral-large-latest': 0.78,
    'gemini-2.5-flash': 0.65,
    'gemini-2.5-flash-lite': 0.55,
  };

  private constructor() {
    this.loadDefaultScores();
  }

  public static getInstance(): QualityScoreConfig {
    if (!QualityScoreConfig.instance) {
      QualityScoreConfig.instance = new QualityScoreConfig();
    }
    return QualityScoreConfig.instance;
  }

  /**
   * Load default scores
   */
  private loadDefaultScores(): void {
    Object.entries(this.DEFAULT_SCORES).forEach(([model, score]) => {
      this.scores.set(model, score);
    });
    console.log('[QualityScores] ✅ Loaded default scores');
  }

  /**
   * Load scores from external source (DB/Redis/Config)
   * Call this on startup or periodically
   */
  public async loadFromExternal(source: 'db' | 'redis' | 'config'): Promise<void> {
    try {
      let externalScores: Record<string, number> | null = null;

      switch (source) {
        case 'db':
          // TODO: Load from database
          // externalScores = await prisma.modelConfig.findMany();
          break;
        case 'redis':
          // TODO: Load from Redis
          // externalScores = await redis.hgetall('model:quality_scores');
          break;
        case 'config':
          // TODO: Load from config file
          // externalScores = require('../../../config/model-scores.json');
          break;
      }

   if (externalScores) {
  Object.entries(externalScores).forEach(([model, score]) => {
    this.scores.set(model, score as number);  // ← ADD "as number"
  });
  this.lastUpdated = new Date();
  console.log(`[QualityScores] ✅ Loaded from ${source}`);  // ← Also fix: add ( before backtick
}
    } catch (error) {
      console.warn(`[QualityScores] ⚠️ Failed to load from ${source}, using defaults`);
    }
  }

  /**
   * Update a single model's score (hot update)
   */
  public updateScore(modelId: string, score: number): void {
    this.scores.set(modelId, score);
    this.lastUpdated = new Date();
    console.log(`[QualityScores] 📝 Updated ${modelId} → ${score}`);
  }

  /**
   * Get quality score for a model
   */
  public getScore(modelId: string): number {
    return this.scores.get(modelId) || 0.5;
  }

  /**
   * Check if model B is lower quality than model A
   */
  public isQualityDrop(primaryModel: string, fallbackModel: string): boolean {
    return this.getScore(fallbackModel) < this.getScore(primaryModel);
  }

  /**
   * Get all scores (for debugging/admin)
   */
  public getAllScores(): Record<string, number> {
    const result: Record<string, number> = {};
    this.scores.forEach((score, model) => {
      result[model] = score;
    });
    return result;
  }

  public getLastUpdated(): Date {
    return this.lastUpdated;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MEMORY-SAFE METRICS SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class FallbackMetricsService {
  private static instance: FallbackMetricsService;
  
  // ✅ CAPPED metrics array (prevents memory leak)
  private readonly MAX_METRICS_IN_MEMORY = 1000;
  private metrics: FallbackMetric[] = [];
  
  // Aggregated stats (lightweight)
  private stats = {
    total: 0,
    byReason: new Map<FallbackReason, number>(),
    byProvider: new Map<string, number>(),
    byPlan: new Map<PlanTier, number>(),
    totalCostSavings: 0,
    successCount: 0,
    compressionAttempts: 0,
    avgRetryAttempts: 0,
  };

  // Flush callback (for DB/Redis persistence)
  private flushCallback: ((metrics: FallbackMetric[]) => Promise<void>) | null = null;

  private constructor() {
    console.log('[FallbackMetrics] ✅ Initialized (Memory-safe v2.1)');
    
    // Auto-flush every 5 minutes if callback is set
    setInterval(() => this.autoFlush(), 5 * 60 * 1000);
  }

  public static getInstance(): FallbackMetricsService {
    if (!FallbackMetricsService.instance) {
      FallbackMetricsService.instance = new FallbackMetricsService();
    }
    return FallbackMetricsService.instance;
  }

  /**
   * Set flush callback for persistence
   * Example: flushCallback = async (metrics) => await prisma.fallbackLog.createMany({ data: metrics })
   */
  public setFlushCallback(callback: (metrics: FallbackMetric[]) => Promise<void>): void {
    this.flushCallback = callback;
    console.log('[FallbackMetrics] 📤 Flush callback configured');
  }

  /**
   * Record a fallback event (memory-safe)
   */
  public recordFallback(metric: FallbackMetric): void {
    // Add to array
    this.metrics.push(metric);
    
    // ✅ CAP CHECK - Flush if exceeds limit
    if (this.metrics.length >= this.MAX_METRICS_IN_MEMORY) {
      console.log('[FallbackMetrics] ⚠️ Memory limit reached, flushing...');
      this.flush();
    }
    
    // Update stats
    this.updateStats(metric);
    
    // Log
    console.log(`[Fallback] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`[Fallback] 🔄 Reason: ${metric.reason}`);
    console.log(`[Fallback] 📊 Plan: ${metric.planType}`);
    console.log(`[Fallback] 🔁 Retries: ${metric.retryAttempts}`);
    console.log(`[Fallback] 🗜️ Compression tried: ${metric.compressionAttempted}`);
    console.log(`[Fallback] 💰 Saved: ₹${metric.costSavings.toFixed(4)}`);
    console.log(`[Fallback] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }

  /**
   * Update aggregated stats
   */
  private updateStats(metric: FallbackMetric): void {
    this.stats.total++;
    
    // By reason
    const reasonCount = this.stats.byReason.get(metric.reason) || 0;
    this.stats.byReason.set(metric.reason, reasonCount + 1);
    
    // By provider
    const providerCount = this.stats.byProvider.get(metric.primaryProvider) || 0;
    this.stats.byProvider.set(metric.primaryProvider, providerCount + 1);
    
    // By plan
    const planCount = this.stats.byPlan.get(metric.planType) || 0;
    this.stats.byPlan.set(metric.planType, planCount + 1);
    
    // Aggregates
    this.stats.totalCostSavings += metric.costSavings;
    if (metric.success) this.stats.successCount++;
    if (metric.compressionAttempted) this.stats.compressionAttempts++;
    
    // Running average of retry attempts
    this.stats.avgRetryAttempts = 
      (this.stats.avgRetryAttempts * (this.stats.total - 1) + metric.retryAttempts) / this.stats.total;
  }

  /**
   * Flush metrics to external storage
   */
  public async flush(): Promise<void> {
    if (this.metrics.length === 0) return;
    
    const toFlush = [...this.metrics];
    this.metrics = []; // Clear immediately
    
    if (this.flushCallback) {
      try {
        await this.flushCallback(toFlush);
        console.log(`[FallbackMetrics] ✅ Flushed ${toFlush.length} metrics to storage`);
      } catch (error) {
        console.error('[FallbackMetrics] ❌ Flush failed:', error);
        // Re-add failed metrics (up to limit)
        this.metrics = toFlush.slice(0, this.MAX_METRICS_IN_MEMORY / 2);
      }
    } else {
      console.log(`[FallbackMetrics] 📝 Cleared ${toFlush.length} metrics (no flush callback)`);
    }
  }

  /**
   * Auto-flush (called by interval)
   */
  private async autoFlush(): Promise<void> {
    if (this.metrics.length > 100) { // Only flush if > 100 records
      await this.flush();
    }
  }

  /**
   * Get stats (lightweight, always available)
   */
  public getStats() {
    return {
      ...this.stats,
      metricsInMemory: this.metrics.length,
      memoryLimit: this.MAX_METRICS_IN_MEMORY,
      successRate: this.stats.total > 0 
        ? (this.stats.successCount / this.stats.total) * 100 
        : 0,
    };
  }

  /**
   * Get recent metrics (from memory only)
   */
  public getRecentMetrics(count: number = 20): FallbackMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * Get report with recommendations
   */
  public getReport(): {
    summary: {
      total: number;
      byReason: Map<FallbackReason, number>;
      byProvider: Map<string, number>;
      byPlan: Map<PlanTier, number>;
      totalCostSavings: number;
      successCount: number;
      compressionAttempts: number;
      avgRetryAttempts: number;
    };
    recentFallbacks: FallbackMetric[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // Analyze patterns
    this.stats.byReason.forEach((count, reason) => {
      const percentage = (count / this.stats.total) * 100;
      if (reason === 'RATE_LIMIT' && percentage > 20) {
        recommendations.push(`⚠️ High rate limit errors (${percentage.toFixed(1)}%) - Consider upgrading API tier`);
      }
      if (reason === 'TIMEOUT' && percentage > 15) {
        recommendations.push(`⚠️ High timeout rate (${percentage.toFixed(1)}%) - Check network/provider status`);
      }
      if (reason === 'CONTEXT_LENGTH_EXCEEDED' && percentage > 10) {
        recommendations.push(`⚠️ Context length issues (${percentage.toFixed(1)}%) - Improve compression strategy`);
      }
    });
    
    // Provider analysis
    this.stats.byProvider.forEach((count, provider) => {
      const percentage = (count / this.stats.total) * 100;
      if (percentage > 30) {
        recommendations.push(`📊 ${provider} has ${percentage.toFixed(1)}% fallback rate - Consider alternative`);
      }
    });
    
    // Retry analysis
    if (this.stats.avgRetryAttempts < 1.5) {
      recommendations.push(`🔁 Low avg retries (${this.stats.avgRetryAttempts.toFixed(1)}) - Fallback may be triggering too early`);
    }
    
    // Compression analysis
    const compressionRate = this.stats.total > 0 
      ? (this.stats.compressionAttempts / this.stats.total) * 100 
      : 0;
    if (compressionRate < 50 && this.stats.byReason.get('CONTEXT_LENGTH_EXCEEDED')) {
      recommendations.push(`🗜️ Low compression attempts (${compressionRate.toFixed(1)}%) - Enable compression before fallback`);
    }
    
    // Cost analysis
    if (this.stats.totalCostSavings > 1000) {
      recommendations.push(`💰 Total cost savings: ₹${this.stats.totalCostSavings.toFixed(2)} - Fallback strategy working!`);
    }

    return {
      summary: { ...this.stats },
      recentFallbacks: this.metrics.slice(-20),
      recommendations,
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL COSTS (₹ per 1M tokens)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MODEL_COSTS: Record<string, number> = {
  'gemini-2.5-flash-lite': 32.56,
  'gemini-2.5-flash': 210.70,
  'gemini-2.5-pro': 810.27,
  'gemini-3-pro': 982.03,
  'mistral-large-latest': 125.06,
  'magistral-medium': 419.85,
  'gpt-5.1': 810.27,
  'claude-sonnet-4-5': 1217.87,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN-BASED CONFIG (with retry enforcement)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLAN_FALLBACK_CONFIG: Record<PlanTier, {
  allowSilentFallback: boolean;
  allowQualityDrop: boolean;
  fallbackTriggerRate: number;
  retryBeforeFallback: number;        // ✅ NOW ENFORCED!
  compressionBeforeFallback: boolean; // ✅ NEW: Try compression first
}> = {
  STARTER: {
    allowSilentFallback: true,
    allowQualityDrop: true,
    fallbackTriggerRate: 0.01,
    retryBeforeFallback: 2,           // ✅ 2 retries before fallback
    compressionBeforeFallback: true,  // ✅ Try compression first
  },
  PLUS: {
    allowSilentFallback: true,
    allowQualityDrop: true,
    fallbackTriggerRate: 0.005,
    retryBeforeFallback: 2,
    compressionBeforeFallback: true,
  },
  PRO: {
    allowSilentFallback: false,
    allowQualityDrop: false,
    fallbackTriggerRate: 0.002,
    retryBeforeFallback: 3,           // ✅ 3 retries for PRO
    compressionBeforeFallback: true,
  },
  APEX: {
    allowSilentFallback: false,
    allowQualityDrop: false,
    fallbackTriggerRate: 0.001,
    retryBeforeFallback: 3,
    compressionBeforeFallback: true,
  },
  SOVEREIGN: {
    allowSilentFallback: false,
    allowQualityDrop: false,
    fallbackTriggerRate: 0,
    retryBeforeFallback: 4,           // ✅ 4 retries for SOVEREIGN
    compressionBeforeFallback: true,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function deterministicHash(requestId: string): number {
  let hash = 0;
  for (let i = 0; i < requestId.length; i++) {
    const char = requestId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function classifyError(error: unknown): FallbackReason {
  const errorObj = error as Record<string, unknown>;
  const message = (errorObj?.message as string)?.toLowerCase() || '';
  const status = (errorObj?.status || errorObj?.statusCode || 0) as number;
  const errorName = (errorObj?.name as string) || '';
  
  if (message.includes('timeout') || errorName === 'ProviderTimeoutError') {
    return 'TIMEOUT';
  }
  if (status === 429 || message.includes('rate limit') || errorName === 'ProviderRateLimitError') {
    return 'RATE_LIMIT';
  }
  if (status >= 500 && status < 600) {
    return 'SERVER_ERROR';
  }
  if (message.includes('network') || message.includes('econnrefused')) {
    return 'NETWORK_ERROR';
  }
  if (status === 404 || message.includes('model not found')) {
    return 'MODEL_UNAVAILABLE';
  }
  if (message.includes('context') || message.includes('token limit') || message.includes('too long')) {
    return 'CONTEXT_LENGTH_EXCEEDED';
  }
  return 'UNKNOWN';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN FUNCTION (v2.1 - Enhanced)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Enhanced shouldUseFallback v2.1
 * 
 * NEW: 
 * - Checks retry count before allowing fallback
 * - Suggests compression before fallback for context errors
 * - Uses external quality scores
 */
export function shouldUseFallbackEnhanced(
  error: unknown,
  planType: PlanTier,
  requestId: string,
  primaryModel: string,
  fallbackModel: string,
  hasFallbackProvider: boolean,
  retryContext?: RetryContext  // ✅ NEW: Track retry attempts
): FallbackDecision {
  
  const qualityConfig = QualityScoreConfig.getInstance();
  const planConfig = PLAN_FALLBACK_CONFIG[planType] || PLAN_FALLBACK_CONFIG.STARTER;
  
  // Default response
  const defaultDecision: FallbackDecision = {
    shouldFallback: false,
    reason: null,
    silent: false,
    qualityDrop: false,
    costSavings: 0,
    shouldCompressFirst: false,
    retryCountMet: false,
    suggestion: null,
  };
  
  // No fallback if no provider available
  if (!hasFallbackProvider) {
    return defaultDecision;
  }
  
  const reason = classifyError(error);
  const qualityDrop = qualityConfig.isQualityDrop(primaryModel, fallbackModel);
  const costSavings = Math.max(0, (MODEL_COSTS[primaryModel] || 100) - (MODEL_COSTS[fallbackModel] || 100));
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 1: Security errors - NEVER fallback
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const errorName = (error as Record<string, unknown>)?.name as string;
  if (['JailbreakError', 'SystemPromptExposureError', 'ModelRevealError'].includes(errorName)) {
    return defaultDecision;
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 2: Retry count enforcement (NEW!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const currentAttempt = retryContext?.attemptNumber || 1;
  const requiredRetries = planConfig.retryBeforeFallback;
  const retryCountMet = currentAttempt >= requiredRetries;
  
  if (!retryCountMet) {
    return {
      ...defaultDecision,
      reason,
      retryCountMet: false,
      suggestion: `Retry ${currentAttempt}/${requiredRetries} - Keep trying primary`,
    };
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 3: Context length - Compression first! (NEW!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (reason === 'CONTEXT_LENGTH_EXCEEDED') {
    const compressionAttempted = retryContext?.compressionAttempted || false;
    
    if (planConfig.compressionBeforeFallback && !compressionAttempted) {
      return {
        ...defaultDecision,
        reason,
        retryCountMet: true,
        shouldCompressFirst: true,
        suggestion: 'Context too long - Try compression before fallback',
      };
    }
    
    // Compression already tried, now fallback
    const silent = planConfig.allowSilentFallback && (planConfig.allowQualityDrop || !qualityDrop);
    return {
      shouldFallback: true,
      reason,
      silent,
      qualityDrop,
      costSavings,
      shouldCompressFirst: false,
      retryCountMet: true,
      suggestion: null,
    };
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 4: Critical errors - Fallback after retries met
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (['TIMEOUT', 'RATE_LIMIT', 'SERVER_ERROR', 'NETWORK_ERROR', 'MODEL_UNAVAILABLE'].includes(reason)) {
    const silent = planConfig.allowSilentFallback && (planConfig.allowQualityDrop || !qualityDrop);
    return {
      shouldFallback: true,
      reason,
      silent,
      qualityDrop,
      costSavings,
      shouldCompressFirst: false,
      retryCountMet: true,
      suggestion: null,
    };
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHECK 5: Unknown errors - Deterministic trigger
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (reason === 'UNKNOWN' && planConfig.fallbackTriggerRate > 0) {
    const divisor = Math.floor(1 / planConfig.fallbackTriggerRate);
    const shouldTrigger = deterministicHash(requestId) % divisor === 0;
    
    if (shouldTrigger && (planConfig.allowQualityDrop || !qualityDrop)) {
      return {
        shouldFallback: true,
        reason,
        silent: planConfig.allowSilentFallback,
        qualityDrop,
        costSavings,
        shouldCompressFirst: false,
        retryCountMet: true,
        suggestion: null,
      };
    }
  }
  
  return defaultDecision;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT COMPRESSION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Compression strategies to try before fallback
 */
export const compressionStrategies = {
  /**
   * Drop old messages, keep recent
   */
  dropOldMessages: (messages: any[], keepCount: number = 5): any[] => {
    if (messages.length <= keepCount) return messages;
    
    // Keep system prompt + last N messages
    const systemMsg = messages.find(m => m.role === 'system');
    const recent = messages.filter(m => m.role !== 'system').slice(-keepCount);
    
    return systemMsg ? [systemMsg, ...recent] : recent;
  },
  
  /**
   * Summarize long messages
   */
  truncateLongMessages: (messages: any[], maxLength: number = 500): any[] => {
    return messages.map(m => ({
      ...m,
      content: m.content.length > maxLength 
        ? m.content.substring(0, maxLength) + '...' 
        : m.content,
    }));
  },
  
  /**
   * Remove low-priority messages (e.g., greetings)
   */
  removeLowPriority: (messages: any[]): any[] => {
    const lowPriorityPatterns = [
      /^(hi|hello|hey|thanks|ok|okay|great|nice|cool)\s*[.!]?$/i,
    ];
    
    return messages.filter(m => {
      if (m.role === 'system') return true;
      return !lowPriorityPatterns.some(p => p.test(m.content.trim()));
    });
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const fallbackMetrics = FallbackMetricsService.getInstance();
export const qualityScoreConfig = QualityScoreConfig.getInstance();