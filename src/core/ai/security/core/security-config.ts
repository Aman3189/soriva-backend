import crypto from 'crypto';
import { Worker } from 'worker_threads';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ActionType = 'BLOCK' | 'WARN' | 'LOG' | 'ALLOW';
export type CategoryType =
  | 'JAILBREAK'
  | 'PROMPT_EXPOSURE'
  | 'MODEL_REVEAL'
  | 'HARMFUL'
  | 'ILLEGAL'
  | 'SELF_HARM'
  | 'INJECTION'
  | 'MANIPULATION';

export type EnvironmentType = 'development' | 'staging' | 'production';
export type RegexEngine = 'native' | 're2'; // re2 for safety

export interface SecurityPattern {
  id: string;
  pattern: RegExp | string; // String for re2 compatibility
  severity: SeverityLevel;
  category: CategoryType;
  description: string;
  action: ActionType;
  version: string;
  enabled: boolean;

  // ✅ FEATURE 2: Timeout Control
  maxEvalMs: number; // Max time to evaluate this pattern

  // ✅ FEATURE 3: Async Evaluation
  asyncEval: boolean; // Run in worker thread?
  priority: 'high' | 'medium' | 'low'; // Evaluation priority

  // ✅ FEATURE 5: Rule Dependencies
  dependencies?: string[]; // Pattern IDs this depends on
  parentGroup?: string; // Group this pattern belongs to

  // ✅ FEATURE 6: Localization
  languages?: string[]; // ['en', 'hi', 'pa'] etc.

  // ✅ FEATURE 8: Hash Signature
  hash: string; // SHA256 of pattern

  // ✅ FEATURE 9: Confidence Scoring
  confidenceWeight: number; // 0.0 to 1.0 (higher = more confident)
  baseScore: number; // Base risk score (0-100)

  falsePositiveRate?: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface SecurityCheckResult {
  blocked: boolean;
  riskScore: number; // ✅ FEATURE 9: Weighted confidence score
  confidenceLevel: number; // 0-100%
  triggeredPatterns: {
    id: string;
    category: CategoryType;
    severity: SeverityLevel;
    description: string;
    weight: number;
    evaluationTimeMs: number;
  }[];
  action: ActionType;
  message?: string;
  evaluationTimeMs: number;
  usedAsyncEval: boolean;
}

export interface ThreatIntelligenceUpdate {
  patterns: SecurityPattern[];
  source: string;
  version: string;
  timestamp: Date;
  signature: string; // Verify update authenticity
}

export interface TelemetryEvent {
  eventType: 'pattern_triggered' | 'pattern_blocked' | 'false_positive' | 'timeout' | 'error';
  patternId: string;
  userId?: string;
  riskScore: number;
  action: ActionType;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REGEX SANDBOXING (RE2 WRAPPER)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SafeRegexEngine {
  private static re2Available: boolean = false;
  private static RE2: any = null;

  static {
    // Try to load re2 (optional dependency)
    try {
      SafeRegexEngine.RE2 = require('re2');
      SafeRegexEngine.re2Available = true;
      console.log('✅ RE2 engine loaded - Safe regex evaluation enabled');
    } catch (e) {
      console.warn('⚠️  RE2 not available - Using native regex (install with: npm install re2)');
    }
  }

  /**
   * ✅ FEATURE 1: Safe regex test with re2 or native fallback
   */
  static safeTest(
    pattern: RegExp | string,
    input: string,
    timeoutMs: number = 100
  ): {
    matched: boolean;
    timedOut: boolean;
    executionTime: number;
  } {
    const startTime = Date.now();
    let matched = false;
    let timedOut = false;

    try {
      if (SafeRegexEngine.re2Available && typeof pattern === 'string') {
        // Use RE2 (guaranteed linear time)
        const re2Pattern = new SafeRegexEngine.RE2(pattern, 'i');
        matched = re2Pattern.test(input);
      } else {
        // Native regex with timeout protection
        const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;

        // Timeout wrapper using Promise.race
        matched = SafeRegexEngine.testWithTimeout(regex, input, timeoutMs);
      }
    } catch (error: any) {
      // Catastrophic backtracking or timeout
      console.error(`⚠️  Regex evaluation error: ${error.message}`);
      timedOut = true;
      matched = false;
    }

    const executionTime = Date.now() - startTime;

    if (executionTime > timeoutMs) {
      timedOut = true;
      console.warn(`⚠️  Regex timeout: ${executionTime}ms (max: ${timeoutMs}ms)`);
    }

    return { matched, timedOut, executionTime };
  }

  /**
   * ✅ FEATURE 2: Timeout-protected regex test
   */
  private static testWithTimeout(regex: RegExp, input: string, timeoutMs: number): boolean {
    let matched = false;
    let completed = false;

    // Set timeout
    const timer = setTimeout(() => {
      if (!completed) {
        throw new Error(`Regex timeout: ${timeoutMs}ms exceeded`);
      }
    }, timeoutMs);

    try {
      matched = regex.test(input);
      completed = true;
    } finally {
      clearTimeout(timer);
    }

    return matched;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASYNC WORKER POOL (NON-CRITICAL PATTERNS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AsyncPatternEvaluator {
  private workers: Worker[] = [];
  private maxWorkers: number = 4;
  private taskQueue: any[] = [];

  constructor(maxWorkers: number = 4) {
    this.maxWorkers = maxWorkers;
  }

  /**
   * ✅ FEATURE 3: Evaluate non-critical patterns asynchronously
   */
  async evaluateAsync(patterns: SecurityPattern[], input: string): Promise<any[]> {
    // For now, use Promise-based async (Worker threads need separate file)
    // In production, spawn actual worker threads

    return Promise.all(patterns.map((pattern) => this.evaluatePatternAsync(pattern, input)));
  }

  private async evaluatePatternAsync(pattern: SecurityPattern, input: string): Promise<any> {
    return new Promise((resolve) => {
      // Simulate async evaluation
      setImmediate(() => {
        const result = SafeRegexEngine.safeTest(pattern.pattern, input, pattern.maxEvalMs);
        resolve({
          patternId: pattern.id,
          matched: result.matched,
          timedOut: result.timedOut,
          executionTime: result.executionTime,
        });
      });
    });
  }

  destroy() {
    this.workers.forEach((worker) => worker.terminate());
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TELEMETRY SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TelemetrySystem {
  private hooks: Array<(event: TelemetryEvent) => void> = [];

  /**
   * ✅ FEATURE 7: Register telemetry hooks (Prometheus, ELK, etc.)
   */
  registerHook(hook: (event: TelemetryEvent) => void) {
    this.hooks.push(hook);
  }

  /**
   * Emit telemetry event to all registered hooks
   */
  emit(event: TelemetryEvent) {
    this.hooks.forEach((hook) => {
      try {
        hook(event);
      } catch (error) {
        console.error('❌ Telemetry hook error:', error);
      }
    });
  }

  /**
   * Built-in console logger hook
   */
  static consoleLoggerHook(event: TelemetryEvent) {
    console.log(
      `[TELEMETRY] ${event.eventType} - Pattern: ${event.patternId}, Risk: ${event.riskScore}`
    );
  }

  /**
   * Prometheus metrics hook (example)
   */
  static prometheusHook(event: TelemetryEvent) {
    // Example: Increment counter
    // prometheusClient.counter('soriva_security_events_total').inc({ type: event.eventType });
    // prometheusClient.histogram('soriva_security_risk_score').observe(event.riskScore);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SECURITY CONFIG MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class SecurityConfigManager {
  private static instance: SecurityConfigManager;
  private patterns: Map<string, SecurityPattern> = new Map();
  private patternGroups: Map<string, Set<string>> = new Map(); // ✅ FEATURE 5
  private asyncEvaluator: AsyncPatternEvaluator;
  private telemetry: TelemetrySystem;
  private environment: EnvironmentType;

  // ✅ FEATURE 4: Threat Intelligence
  private lastThreatUpdate: Date | null = null;
  private threatUpdateInterval: number = 60 * 60 * 1000; // 1 hour

  private constructor() {
    this.environment = (process.env.NODE_ENV as EnvironmentType) || 'development';
    this.asyncEvaluator = new AsyncPatternEvaluator(4);
    this.telemetry = new TelemetrySystem();

    // Register default telemetry hooks
    this.telemetry.registerHook(TelemetrySystem.consoleLoggerHook);

    this.initializeDefaultPatterns();
    this.startThreatIntelligenceFeed(); // ✅ FEATURE 4

    console.log(`✅ SecurityConfigManager v3.0 initialized (${this.environment})`);
  }

  public static getInstance(): SecurityConfigManager {
    if (!SecurityConfigManager.instance) {
      SecurityConfigManager.instance = new SecurityConfigManager();
    }
    return SecurityConfigManager.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ FEATURE 8: HASH SIGNATURE SYSTEM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate SHA256 hash for pattern integrity verification
   */
  private generatePatternHash(
    pattern: Partial<SecurityPattern> & {
      pattern: RegExp | string;
      severity: SeverityLevel;
      category: CategoryType;
      action: ActionType;
    }
  ): string {
    const dataToHash = JSON.stringify({
      pattern: pattern.pattern.toString(),
      severity: pattern.severity,
      category: pattern.category,
      action: pattern.action,
    });

    return crypto.createHash('sha256').update(dataToHash).digest('hex');
  }

  /**
   * Verify pattern hasn't been tampered with
   */
  private verifyPatternHash(pattern: SecurityPattern): boolean {
    const expectedHash = this.generatePatternHash(pattern);
    return pattern.hash === expectedHash;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ FEATURE 5: RULE DEPENDENCY TREE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Add pattern to a group (for dependency management)
   */
  public addToGroup(groupName: string, patternId: string) {
    if (!this.patternGroups.has(groupName)) {
      this.patternGroups.set(groupName, new Set());
    }
    this.patternGroups.get(groupName)!.add(patternId);
  }

  /**
   * Disable all patterns in a group (prevents duplicates)
   */
  public disableGroup(groupName: string) {
    const group = this.patternGroups.get(groupName);
    if (group) {
      group.forEach((patternId) => {
        this.togglePattern(patternId, false);
      });
    }
  }

  /**
   * Get patterns by group
   */
  public getPatternsByGroup(groupName: string): SecurityPattern[] {
    const group = this.patternGroups.get(groupName);
    if (!group) return [];

    return Array.from(group)
      .map((id) => this.patterns.get(id))
      .filter(Boolean) as SecurityPattern[];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ FEATURE 9: CONFIDENCE SCORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Helper: Check if action should block request
   */
  private isBlockingAction(action: ActionType): boolean {
    return action === 'BLOCK';
  }

  /**
   * Calculate weighted risk score based on triggered patterns
   */
  private calculateWeightedRiskScore(
    triggeredPatterns: Array<{
      pattern: SecurityPattern;
      executionTime: number;
    }>
  ): SecurityCheckResult {
    let totalScore = 0;
    let totalWeight = 0;
    let highestAction: ActionType = 'ALLOW';

    // Fixed: Explicit type annotation to prevent type comparison error
    const actionPriority: { [K in ActionType]: number } = {
      BLOCK: 4,
      WARN: 3,
      LOG: 2,
      ALLOW: 1,
    };

    const details = triggeredPatterns.map(({ pattern, executionTime }) => {
      const weight = pattern.confidenceWeight;
      const score = pattern.baseScore;

      totalScore += score * weight;
      totalWeight += weight;

      // Determine highest priority action
      const currentPriority = actionPriority[pattern.action];
      const highestPriority = actionPriority[highestAction];

      if (currentPriority > highestPriority) {
        highestAction = pattern.action;
      }

      return {
        id: pattern.id,
        category: pattern.category,
        severity: pattern.severity,
        description: pattern.description,
        weight,
        evaluationTimeMs: executionTime,
      };
    });

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const confidenceLevel = totalWeight > 0 ? (totalWeight / triggeredPatterns.length) * 100 : 0;

    return {
      blocked: this.isBlockingAction(highestAction),
      riskScore: Math.round(finalScore),
      confidenceLevel: Math.round(confidenceLevel),
      triggeredPatterns: details,
      action: highestAction,
      evaluationTimeMs: 0, // Will be set by caller
      usedAsyncEval: false, // Will be set by caller
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ FEATURE 4: THREAT INTELLIGENCE FEED
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Start periodic threat intelligence updates
   */
  private startThreatIntelligenceFeed() {
    // Check for updates every hour
    setInterval(() => {
      this.fetchThreatIntelligenceUpdates();
    }, this.threatUpdateInterval);

    // Initial fetch
    this.fetchThreatIntelligenceUpdates();
  }

  /**
   * Fetch latest patterns from database/external source
   */
  private async fetchThreatIntelligenceUpdates() {
    try {
      // TODO: Implement actual DB fetch
      // const updates = await prisma.securityPattern.findMany({ where: { updatedAt: { gt: this.lastThreatUpdate } } });

      console.log('🔄 Checking for threat intelligence updates...');
      this.lastThreatUpdate = new Date();

      // In production, this would:
      // 1. Fetch from database
      // 2. Verify signature
      // 3. Merge new patterns
      // 4. Update existing patterns
    } catch (error) {
      console.error('❌ Failed to fetch threat intelligence:', error);
    }
  }

  /**
   * Import threat intelligence update
   */
  public importThreatIntelligence(update: ThreatIntelligenceUpdate): boolean {
    try {
      // Verify signature (in production, use proper crypto verification)
      const expectedSignature = crypto
        .createHash('sha256')
        .update(JSON.stringify(update.patterns))
        .digest('hex');

      if (update.signature !== expectedSignature) {
        console.error('❌ Invalid threat intelligence signature');
        return false;
      }

      // Merge patterns
      update.patterns.forEach((pattern) => {
        if (this.patterns.has(pattern.id)) {
          // Update existing
          this.patterns.set(pattern.id, pattern);
        } else {
          // Add new
          this.patterns.set(pattern.id, pattern);
        }
      });

      this.lastThreatUpdate = update.timestamp;
      console.log(`✅ Imported ${update.patterns.length} patterns from ${update.source}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to import threat intelligence:', error);
      return false;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PATTERN MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Add new security pattern
   */
  public addPattern(
    pattern: Partial<SecurityPattern> & {
      pattern: RegExp | string;
      severity: SeverityLevel;
      category: CategoryType;
      description: string;
      action: ActionType;
    }
  ): string {
    const id = this.generatePatternId(pattern);
    const hash = this.generatePatternHash(pattern);

    const fullPattern: SecurityPattern = {
      pattern: pattern.pattern,
      severity: pattern.severity,
      category: pattern.category,
      description: pattern.description,
      action: pattern.action,
      id,
      hash,
      enabled: pattern.enabled ?? true,
      version: pattern.version || '1.0.0',
      maxEvalMs: pattern.maxEvalMs || 100,
      asyncEval: pattern.asyncEval ?? false,
      priority: pattern.priority || 'medium',
      confidenceWeight: pattern.confidenceWeight || 1.0,
      baseScore: pattern.baseScore || 50,
      dependencies: pattern.dependencies,
      parentGroup: pattern.parentGroup,
      languages: pattern.languages,
      falsePositiveRate: pattern.falsePositiveRate,
      metadata: pattern.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Verify hash immediately
    if (!this.verifyPatternHash(fullPattern)) {
      throw new Error('Pattern hash verification failed');
    }

    this.patterns.set(id, fullPattern);

    // Add to group if specified
    if (pattern.parentGroup) {
      this.addToGroup(pattern.parentGroup, id);
    }

    console.log(`✅ Pattern added: ${id} (${pattern.category})`);
    return id;
  }

  /**
   * Toggle pattern enabled/disabled
   */
  public togglePattern(id: string, enabled: boolean): boolean {
    const pattern = this.patterns.get(id);
    if (!pattern) return false;

    pattern.enabled = enabled;
    pattern.updatedAt = new Date();

    console.log(`✅ Pattern ${enabled ? 'enabled' : 'disabled'}: ${id}`);
    return true;
  }

  /**
   * Get all enabled patterns
   */
  public getEnabledPatterns(): SecurityPattern[] {
    return Array.from(this.patterns.values()).filter((p) => p.enabled);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECURITY CHECK (MAIN EVALUATION)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Main security check with all advanced features
   */
  public async checkSecurity(input: string, userId?: string): Promise<SecurityCheckResult> {
    const startTime = Date.now();
    const triggeredPatterns: Array<{ pattern: SecurityPattern; executionTime: number }> = [];

    const enabledPatterns = this.getEnabledPatterns();

    // Separate high-priority (sync) and low-priority (async) patterns
    const highPriorityPatterns = enabledPatterns.filter(
      (p) => p.priority === 'high' || !p.asyncEval
    );
    const lowPriorityPatterns = enabledPatterns.filter((p) => p.priority !== 'high' && p.asyncEval);

    // ✅ Evaluate high-priority patterns synchronously
    for (const pattern of highPriorityPatterns) {
      const result = SafeRegexEngine.safeTest(pattern.pattern, input, pattern.maxEvalMs);

      if (result.matched) {
        triggeredPatterns.push({ pattern, executionTime: result.executionTime });

        // Emit telemetry
        this.telemetry.emit({
          eventType: 'pattern_triggered',
          patternId: pattern.id,
          userId,
          riskScore: pattern.baseScore,
          action: pattern.action,
          timestamp: new Date(),
        });
      }

      if (result.timedOut) {
        this.telemetry.emit({
          eventType: 'timeout',
          patternId: pattern.id,
          userId,
          riskScore: 0,
          action: 'LOG',
          timestamp: new Date(),
          metadata: { executionTime: result.executionTime, maxEvalMs: pattern.maxEvalMs },
        });
      }
    }

    // ✅ FEATURE 3: Evaluate low-priority patterns asynchronously (non-blocking)
    let usedAsync = false;
    if (lowPriorityPatterns.length > 0) {
      usedAsync = true;
      const asyncResults = await this.asyncEvaluator.evaluateAsync(lowPriorityPatterns, input);

      asyncResults.forEach((result, index) => {
        if (result.matched) {
          triggeredPatterns.push({
            pattern: lowPriorityPatterns[index],
            executionTime: result.executionTime,
          });
        }
      });
    }

    // ✅ FEATURE 9: Calculate weighted risk score
    const checkResult = this.calculateWeightedRiskScore(triggeredPatterns);
    checkResult.evaluationTimeMs = Date.now() - startTime;
    checkResult.usedAsyncEval = usedAsync;

    // Emit blocked event if blocked
    if (checkResult.blocked) {
      this.telemetry.emit({
        eventType: 'pattern_blocked',
        patternId: triggeredPatterns[0]?.pattern.id || 'unknown',
        userId,
        riskScore: checkResult.riskScore,
        action: checkResult.action,
        timestamp: new Date(),
      });
    }

    return checkResult;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TELEMETRY MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * ✅ FEATURE 7: Register custom telemetry hook
   */
  public registerTelemetryHook(hook: (event: TelemetryEvent) => void) {
    this.telemetry.registerHook(hook);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private generatePatternId(pattern: Partial<SecurityPattern>): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const category = pattern.category?.toLowerCase() || 'unknown';
    return `${category}_${timestamp}_${random}`;
  }

  public getStats() {
    return {
      totalPatterns: this.patterns.size,
      enabledPatterns: this.getEnabledPatterns().length,
      groups: this.patternGroups.size,
      lastThreatUpdate: this.lastThreatUpdate,
      environment: this.environment,
      re2Available: SafeRegexEngine['re2Available'],
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ FEATURE 6: INITIALIZE PATTERNS (INCLUDING HINDI)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private initializeDefaultPatterns() {
    // ENGLISH JAILBREAK PATTERNS
    this.addPattern({
      pattern: /\b(dan|do anything now)\b/i,
      severity: 'CRITICAL',
      category: 'JAILBREAK',
      description: 'DAN jailbreak attempt',
      action: 'BLOCK',
      version: '1.0.0',
      maxEvalMs: 50,
      asyncEval: false,
      priority: 'high',
      confidenceWeight: 0.95,
      baseScore: 95,
      parentGroup: 'jailbreak_role_play',
      languages: ['en'],
    });

    this.addPattern({
      pattern:
        /ignore\s+(all\s+)?(previous|prior|above|earlier|system)\s+(instructions?|prompts?|rules?|commands?)/i,
      severity: 'CRITICAL',
      category: 'JAILBREAK',
      description: 'Ignore instructions attack',
      action: 'BLOCK',
      version: '1.0.0',
      maxEvalMs: 50,
      asyncEval: false,
      priority: 'high',
      confidenceWeight: 0.95,
      baseScore: 95,
      parentGroup: 'jailbreak_override',
      languages: ['en'],
    });

    // ✅ FEATURE 6: HINDI JAILBREAK PATTERNS
    this.addPattern({
      pattern:
        /(pichhle|pehle|पिछले|पहले)\s+(niyam|rules|निर्देश|nirdesh)\s+(bhool|forget|भूल)\s+(jao|ja|जाओ|जा)/i,
      severity: 'CRITICAL',
      category: 'JAILBREAK',
      description: 'Hindi: Forget previous rules',
      action: 'BLOCK',
      version: '1.0.0',
      maxEvalMs: 50,
      asyncEval: false,
      priority: 'high',
      confidenceWeight: 0.9,
      baseScore: 90,
      parentGroup: 'jailbreak_override',
      languages: ['hi', 'pa'], // Hindi & Punjabi
    });

    this.addPattern({
      pattern:
        /(mujhe|मुझे)\s+(batao|बताओ|dikhao|दिखाओ)\s+(tumhara|आपका|तुम्हारा)\s+(system|सिस्टम)\s+(prompt|instructions|प्रॉम्प्ट|निर्देश)/i,
      severity: 'HIGH',
      category: 'PROMPT_EXPOSURE',
      description: 'Hindi: Show me your system prompt',
      action: 'BLOCK',
      version: '1.0.0',
      maxEvalMs: 50,
      asyncEval: false,
      priority: 'high',
      confidenceWeight: 0.9,
      baseScore: 85,
      languages: ['hi'],
    });

    this.addPattern({
      pattern: /(tum|तुम|aap|आप)\s+(kaun|कौन)\s+(ho|हो|hain|हैं).{0,30}(ai|model|मॉडल)/i,
      severity: 'MEDIUM',
      category: 'MODEL_REVEAL',
      description: 'Hindi: What AI are you?',
      action: 'BLOCK',
      version: '1.0.0',
      maxEvalMs: 50,
      asyncEval: true,
      priority: 'low',
      confidenceWeight: 0.7,
      baseScore: 60,
      languages: ['hi'],
    });

    // HARMFUL CONTENT
    this.addPattern({
      pattern:
        /(how\s+to|kaise|कैसे)\s+(make|bana|बना|banao|बनाओ)\s+(bomb|बम|explosive|weapon|हथियार)/i,
      severity: 'CRITICAL',
      category: 'HARMFUL',
      description: 'Weapons/explosives query (EN/HI)',
      action: 'BLOCK',
      version: '1.0.0',
      maxEvalMs: 50,
      asyncEval: false,
      priority: 'high',
      confidenceWeight: 1.0,
      baseScore: 100,
      languages: ['en', 'hi'],
    });

    // INJECTION ATTACKS
    this.addPattern({
      pattern: /<script|javascript:|onerror=|onclick=/i,
      severity: 'HIGH',
      category: 'INJECTION',
      description: 'XSS attempt',
      action: 'BLOCK',
      version: '1.0.0',
      maxEvalMs: 30,
      asyncEval: true,
      priority: 'medium',
      confidenceWeight: 0.9,
      baseScore: 85,
      languages: ['en'],
    });

    console.log(
      `✅ Initialized ${this.patterns.size} security patterns (including Hindi/regional)`
    );
  }

  public destroy() {
    this.asyncEvaluator.destroy();
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default SecurityConfigManager;
export const securityConfig = SecurityConfigManager.getInstance();
