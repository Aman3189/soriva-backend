// src/core/ai/utils/observability.ts
// ============================================================================
// SORIVA OBSERVABILITY LAYER v1.0 - January 2026
// ============================================================================
//
// 🎯 PURPOSE: Make the system VISIBLE, not blind
//
// "You can't improve what you can't measure"
//
// TRACKS:
// - Every routing decision
// - Model usage & performance
// - Pressure triggers
// - Downgrades & fallbacks
// - Cost per user/plan
// - Errors & failures
//
// OUTPUT:
// - Console logs (dev)
// - Structured JSON (production)
// - Ready for: DataDog, CloudWatch, Grafana, etc.
//
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface RoutingDecision {
  timestamp: Date;
  requestId: string;           // 🆕 End-to-end tracing
  userId: string;
  sessionId?: string;
  plan: string;
  intent: string;
  modelChosen: string;
  modelOriginal?: string;
  wasDowngraded: boolean;
  downgradeReason?: string;
  pressureLevel: string;
  tokensEstimated: number;
  tokensActual?: number;       // 🆕 Filled after response
  responseTimeMs?: number;
}

export interface ModelUsageLog {
  timestamp: Date;
  requestId: string;           // 🆕 End-to-end tracing
  model: string;
  plan: string;
  tokensEstimated?: number;    // 🆕 Before call
  tokensActual: number;        // 🆕 Renamed from tokensUsed (actual from API)
  tokensDelta?: number;        // 🆕 Difference for tuning
  costINR: number;
  latencyMs: number;
  success: boolean;
  errorType?: string;
}

export interface PressureEvent {
  timestamp: Date;
  requestId?: string;          // 🆕 Optional - for request context
  userId: string;
  plan: string;
  previousLevel: string;
  newLevel: string;
  usageRatio: number;
  valvesTriggered: string[];
}

export interface FailureEvent {
  timestamp: Date;
  requestId: string;           // 🆕 End-to-end tracing
  userId: string;
  errorType: string;
  errorMessage: string;
  model?: string;
  fallbackUsed?: string;
  recovered: boolean;
}

export interface DailyMetrics {
  date: string;
  totalRequests: number;
  totalModelCalls: number;     // 🆕 Separate from requests (1 request = multiple models possible)
  byPlan: Record<string, number>;
  byModel: Record<string, { count: number; tokens: number; cost: number; totalLatencyMs: number }>;
  downgrades: number;
  fallbacks: number;
  errors: number;
  avgLatencyMs: number;
  pressureEvents: number;
  tokenEstimateAccuracy?: number;  // 🆕 How accurate are our estimates?
}

// ============================================================================
// IN-MEMORY METRICS STORE (Replace with Redis/DB in production)
// ============================================================================

class MetricsStore {
  private routingLogs: RoutingDecision[] = [];
  private modelUsageLogs: ModelUsageLog[] = [];
  private pressureEvents: PressureEvent[] = [];
  private failureEvents: FailureEvent[] = [];
  private dailyCounters: Map<string, DailyMetrics> = new Map();
  
  // 🆕 Edge-triggered pressure tracking
  private lastPressureLevelByUser: Map<string, string> = new Map();
  
  // 🆕 Token estimate accuracy tracking
  private tokenEstimates: { estimated: number; actual: number }[] = [];
  
  // Limits to prevent memory bloat
  private readonly MAX_LOGS = 10000;
  private readonly MAX_EVENTS = 5000;
  private readonly MAX_ESTIMATES = 1000;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ADD METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  addRoutingLog(log: RoutingDecision): void {
    this.routingLogs.push(log);
    if (this.routingLogs.length > this.MAX_LOGS) {
      this.routingLogs.shift(); // Remove oldest
    }
    this.updateDailyCounters('request', log.plan);
    if (log.wasDowngraded) {
      this.updateDailyCounters('downgrade');
    }
  }

  addModelUsage(log: ModelUsageLog): void {
    this.modelUsageLogs.push(log);
    if (this.modelUsageLogs.length > this.MAX_LOGS) {
      this.modelUsageLogs.shift();
    }
    this.updateModelMetrics(log);
    
    // 🆕 Track token estimate accuracy
    if (log.tokensEstimated && log.tokensActual) {
      this.trackTokenAccuracy(log.tokensEstimated, log.tokensActual);
    }
  }

  /**
   * 🆕 Edge-triggered pressure logging
   * Only logs when level CHANGES for a user
   */
  addPressureEvent(event: PressureEvent): boolean {
    const lastLevel = this.lastPressureLevelByUser.get(event.userId);
    
    // Only log if level changed (edge-triggered)
    if (lastLevel === event.newLevel) {
      return false; // No change, don't log
    }
    
    // Update last known level
    this.lastPressureLevelByUser.set(event.userId, event.newLevel);
    
    // Store event
    this.pressureEvents.push(event);
    if (this.pressureEvents.length > this.MAX_EVENTS) {
      this.pressureEvents.shift();
    }
    this.updateDailyCounters('pressure');
    
    return true; // Logged
  }

  addFailureEvent(event: FailureEvent): void {
    this.failureEvents.push(event);
    if (this.failureEvents.length > this.MAX_EVENTS) {
      this.failureEvents.shift();
    }
    this.updateDailyCounters('error');
    if (event.recovered) {
      this.updateDailyCounters('fallback');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUERY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getRecentRoutingLogs(limit: number = 100): RoutingDecision[] {
    return this.routingLogs.slice(-limit);
  }

  getRecentFailures(limit: number = 50): FailureEvent[] {
    return this.failureEvents.slice(-limit);
  }

  getDailyMetrics(date?: string): DailyMetrics | undefined {
    const key = date || new Date().toISOString().split('T')[0];
    return this.dailyCounters.get(key);
  }

  getTodayMetrics(): DailyMetrics {
    const today = new Date().toISOString().split('T')[0];
    return this.dailyCounters.get(today) || this.createEmptyDailyMetrics(today);
  }
  
  /**
   * 🆕 Get token estimate accuracy
   */
  getTokenEstimateAccuracy(): { avgAccuracy: number; samples: number } {
    if (this.tokenEstimates.length === 0) {
      return { avgAccuracy: 100, samples: 0 };
    }
    
    const accuracies = this.tokenEstimates.map(e => {
      const accuracy = 100 - Math.abs((e.estimated - e.actual) / e.actual * 100);
      return Math.max(0, accuracy); // Can't be negative
    });
    
    const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    return { avgAccuracy: Math.round(avg * 100) / 100, samples: this.tokenEstimates.length };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIVATE HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private updateDailyCounters(type: 'request' | 'downgrade' | 'fallback' | 'error' | 'pressure', plan?: string): void {
    const today = new Date().toISOString().split('T')[0];
    let metrics = this.dailyCounters.get(today);
    
    if (!metrics) {
      metrics = this.createEmptyDailyMetrics(today);
      this.dailyCounters.set(today, metrics);
    }

    switch (type) {
      case 'request':
        metrics.totalRequests++;
        if (plan) {
          metrics.byPlan[plan] = (metrics.byPlan[plan] || 0) + 1;
        }
        break;
      case 'downgrade':
        metrics.downgrades++;
        break;
      case 'fallback':
        metrics.fallbacks++;
        break;
      case 'error':
        metrics.errors++;
        break;
      case 'pressure':
        metrics.pressureEvents++;
        break;
    }
  }

  private updateModelMetrics(log: ModelUsageLog): void {
    const today = new Date().toISOString().split('T')[0];
    let metrics = this.dailyCounters.get(today);
    
    if (!metrics) {
      metrics = this.createEmptyDailyMetrics(today);
      this.dailyCounters.set(today, metrics);
    }

    if (!metrics.byModel[log.model]) {
      metrics.byModel[log.model] = { count: 0, tokens: 0, cost: 0, totalLatencyMs: 0 };
    }

    metrics.byModel[log.model].count++;
    metrics.byModel[log.model].tokens += log.tokensActual;
    metrics.byModel[log.model].cost += log.costINR;
    metrics.byModel[log.model].totalLatencyMs += log.latencyMs;
    
    // 🆕 Track model calls separately from requests
    metrics.totalModelCalls++;

    // 🆕 Fixed: Calculate avg latency based on MODEL CALLS, not requests
    let totalLatency = 0;
    let totalCalls = 0;
    for (const model of Object.values(metrics.byModel)) {
      totalLatency += model.totalLatencyMs;
      totalCalls += model.count;
    }
    metrics.avgLatencyMs = totalCalls > 0 ? Math.round(totalLatency / totalCalls) : 0;
  }
  
  /**
   * 🆕 Track token estimate accuracy
   */
  private trackTokenAccuracy(estimated: number, actual: number): void {
    this.tokenEstimates.push({ estimated, actual });
    if (this.tokenEstimates.length > this.MAX_ESTIMATES) {
      this.tokenEstimates.shift();
    }
  }

  private createEmptyDailyMetrics(date: string): DailyMetrics {
    return {
      date,
      totalRequests: 0,
      totalModelCalls: 0,
      byPlan: {},
      byModel: {},
      downgrades: 0,
      fallbacks: 0,
      errors: 0,
      avgLatencyMs: 0,
      pressureEvents: 0,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLEANUP
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  cleanup(daysToKeep: number = 7): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    // Cleanup old daily metrics
    for (const [date, _] of this.dailyCounters) {
      if (new Date(date) < cutoff) {
        this.dailyCounters.delete(date);
      }
    }
    
    // 🆕 Cleanup old pressure level cache (keep only active users)
    // This prevents memory leak from inactive users
    if (this.lastPressureLevelByUser.size > 10000) {
      this.lastPressureLevelByUser.clear();
    }
  }
}

// Singleton store
const metricsStore = new MetricsStore();

// ============================================================================
// REQUEST ID GENERATOR
// ============================================================================

/**
 * Generate unique request ID for end-to-end tracing
 * Format: req_{timestamp}_{random}
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${random}`;
}

// ============================================================================
// MAIN OBSERVABILITY CLASS
// ============================================================================

class Observability {
  private isDev: boolean;

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ROUTING DECISION LOGGING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  logRoutingDecision(decision: Omit<RoutingDecision, 'timestamp'>): void {
    const log: RoutingDecision = {
      ...decision,
      timestamp: new Date(),
    };

    metricsStore.addRoutingLog(log);

    if (this.isDev) {
      const icon = log.wasDowngraded ? '⬇️' : '✅';
      console.log(
        `${icon} [ROUTING] [${log.requestId}] ${log.plan} | ${log.intent} | ${log.modelChosen}` +
        (log.wasDowngraded ? ` (downgraded from ${log.modelOriginal})` : '') +
        ` | Pressure: ${log.pressureLevel}`
      );
    } else {
      // Production: structured JSON log
      console.log(JSON.stringify({ type: 'ROUTING_DECISION', ...log }));
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODEL USAGE LOGGING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  logModelUsage(usage: Omit<ModelUsageLog, 'timestamp'>): void {
    const log: ModelUsageLog = {
      ...usage,
      timestamp: new Date(),
      // 🆕 Calculate delta if both values present
      tokensDelta: usage.tokensEstimated 
        ? usage.tokensActual - usage.tokensEstimated 
        : undefined,
    };

    metricsStore.addModelUsage(log);

    if (this.isDev) {
      const icon = log.success ? '💰' : '❌';
      const deltaStr = log.tokensDelta 
        ? ` (Δ${log.tokensDelta > 0 ? '+' : ''}${log.tokensDelta})` 
        : '';
      console.log(
        `${icon} [MODEL] [${log.requestId}] ${log.model} | ${log.tokensActual} tokens${deltaStr} | ₹${log.costINR.toFixed(4)} | ${log.latencyMs}ms`
      );
    } else {
      console.log(JSON.stringify({ type: 'MODEL_USAGE', ...log }));
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRESSURE EVENT LOGGING (EDGE-TRIGGERED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Log pressure change - ONLY logs if level actually changed
   * Returns true if logged, false if skipped (no change)
   */
  logPressureChange(event: Omit<PressureEvent, 'timestamp'>): boolean {
    const log: PressureEvent = {
      ...event,
      timestamp: new Date(),
    };

    // 🆕 Edge-triggered: Only log if level changed
    const wasLogged = metricsStore.addPressureEvent(log);
    
    if (!wasLogged) {
      return false; // Level didn't change, skipped
    }

    if (this.isDev) {
      console.log(
        `🔥 [PRESSURE] ${log.plan} | ${log.previousLevel} → ${log.newLevel}` +
        ` | Usage: ${(log.usageRatio * 100).toFixed(1)}%` +
        ` | Valves: ${log.valvesTriggered.join(', ')}`
      );
    } else {
      console.log(JSON.stringify({ type: 'PRESSURE_EVENT', ...log }));
    }
    
    return true;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FAILURE LOGGING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  logFailure(event: Omit<FailureEvent, 'timestamp'>): void {
    const log: FailureEvent = {
      ...event,
      timestamp: new Date(),
    };

    metricsStore.addFailureEvent(log);

    const icon = log.recovered ? '🔄' : '💥';
    const level = log.recovered ? 'WARN' : 'ERROR';

    if (this.isDev) {
      console.log(
        `${icon} [${level}] [${log.requestId}] ${log.errorType}: ${log.errorMessage}` +
        (log.fallbackUsed ? ` | Fallback: ${log.fallbackUsed}` : '')
      );
    } else {
      console.log(JSON.stringify({ type: 'FAILURE_EVENT', level, ...log }));
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GENERIC LOGGING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  log(level: LogLevel, message: string, data?: Record<string, any>): void {
    const icons: Record<LogLevel, string> = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      CRITICAL: '🚨',
    };

    if (this.isDev) {
      console.log(`${icons[level]} [${level}] ${message}`, data || '');
    } else {
      console.log(JSON.stringify({
        type: 'LOG',
        level,
        message,
        data,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // METRICS RETRIEVAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getTodayMetrics(): DailyMetrics {
    return metricsStore.getTodayMetrics();
  }

  getRecentRoutingLogs(limit: number = 100): RoutingDecision[] {
    return metricsStore.getRecentRoutingLogs(limit);
  }

  getRecentFailures(limit: number = 50): FailureEvent[] {
    return metricsStore.getRecentFailures(limit);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HEALTH CHECK
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  getHealthSummary(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: DailyMetrics;
    recentErrors: number;
    errorRate: number;
    tokenEstimateAccuracy: { avgAccuracy: number; samples: number };
  } {
    const metrics = metricsStore.getTodayMetrics();
    const recentFailures = metricsStore.getRecentFailures(100);
    const tokenAccuracy = metricsStore.getTokenEstimateAccuracy();
    
    // Count errors in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrors = recentFailures.filter(f => f.timestamp > oneHourAgo).length;
    
    const errorRate = metrics.totalRequests > 0 
      ? (metrics.errors / metrics.totalRequests) * 100 
      : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (errorRate > 10) status = 'unhealthy';
    else if (errorRate > 5 || recentErrors > 10) status = 'degraded';

    return {
      status,
      metrics,
      recentErrors,
      errorRate: Math.round(errorRate * 100) / 100,
      tokenEstimateAccuracy: tokenAccuracy,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const observability = new Observability();

// Convenience functions
export function logRouting(decision: Omit<RoutingDecision, 'timestamp'>): void {
  observability.logRoutingDecision(decision);
}

export function logModelUsage(usage: Omit<ModelUsageLog, 'timestamp'>): void {
  observability.logModelUsage(usage);
}

export function logPressure(event: Omit<PressureEvent, 'timestamp'>): void {
  observability.logPressureChange(event);
}

export function logFailure(event: Omit<FailureEvent, 'timestamp'>): void {
  observability.logFailure(event);
}

export function logInfo(message: string, data?: Record<string, any>): void {
  observability.log('INFO', message, data);
}

export function logWarn(message: string, data?: Record<string, any>): void {
  observability.log('WARN', message, data);
}

export function logError(message: string, data?: Record<string, any>): void {
  observability.log('ERROR', message, data);
}

export default observability;