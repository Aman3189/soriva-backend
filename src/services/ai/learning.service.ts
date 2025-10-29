// src/services/learning.service.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SORIVA BACKEND - AUTO-LEARNING SECURITY SYSTEM (SCHEMA ALIGNED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Purpose: Intelligent pattern detection & auto-promotion system
//
// REQUIRED SCHEMA FIELDS (from FILE 1):
//
// LearnedPattern:
//   - id, pattern (unique), patternType, confidence, riskScore
//   - frequency, firstSeenAt, lastSeenAt, createdAt, updatedAt
//
// SecurityLog:
//   - id, attackType, severity, riskScore, ipAddress
//   - blocked, createdAt, updatedAt
//
// SecurityPattern: (ACTUAL FIELDS!)
//   - id, name (required), category (required), pattern (unique)
//   - severity, description, createdAt, updatedAt
//
// NOTE: SecurityLog has NO connection to patterns! Learning service
// analyzes LearnedPattern data only.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { PrismaClient, LearnedPattern, SecurityPattern, SecurityLog, Prisma } from '@prisma/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PatternAnalysis {
  pattern: string;
  frequency: number;
  uniqueIPs: number;
  avgRiskScore: number;
  riskScore: number;
  firstSeen: Date;
  lastSeen: Date;
  attackTypes: string[];
}

interface LearningMetrics {
  totalPatterns: number;
  highRiskPatterns: number;
  promotedPatterns: number;
  avgRiskScore: number;
  lastAnalysis: Date;
  patternsByType: Map<string, number>;
}

interface PromotionCandidate {
  learnedPattern: LearnedPattern;
  analysis: PatternAnalysis;
  shouldPromote: boolean;
  reason: string;
}

interface LearningStats {
  analyzed: number;
  promoted: number;
  skipped: number;
  errors: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEARNING SERVICE (SINGLETON)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class LearningService {
  private static instance: LearningService;
  private prisma: PrismaClient;

  // In-memory cache
  private learnedPatternsCache: Map<string, LearnedPattern> = new Map();
  private analyticsCache: Map<string, PatternAnalysis> = new Map();
  private lastCacheUpdate: Date = new Date(0);
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  // Learning thresholds (configurable)
  private readonly MIN_FREQUENCY_FOR_PROMOTION = 5; // Seen 5+ times
  private readonly MIN_CONFIDENCE_FOR_PROMOTION = 0.75; // 75% confidence
  private readonly MIN_RISK_SCORE_FOR_PROMOTION = 7.0; // Risk score >= 7
  private readonly MIN_UNIQUE_IPS = 2; // From at least 2 different IPs
  private readonly ANALYSIS_WINDOW_DAYS = 30; // Analyze last 30 days

  // Analytics
  private metrics: LearningMetrics = {
    totalPatterns: 0,
    highRiskPatterns: 0,
    promotedPatterns: 0,
    avgRiskScore: 0,
    lastAnalysis: new Date(),
    patternsByType: new Map(),
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SINGLETON PATTERN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private constructor() {
    this.prisma = new PrismaClient();
    this.initializeCache().catch((err) => {
      console.error('[LearningService] Failed to initialize cache:', err);
    });
  }

  public static getInstance(): LearningService {
    if (!LearningService.instance) {
      LearningService.instance = new LearningService();
    }
    return LearningService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async initializeCache(): Promise<void> {
    try {
      await this.reloadCache();
      console.log('[LearningService] Cache initialized successfully');
    } catch (error) {
      console.error('[LearningService] Cache initialization failed:', error);
      throw error;
    }
  }

  private async reloadCache(): Promise<void> {
    try {
      // Load all learned patterns
      const patterns = await this.prisma.learnedPattern.findMany({
        orderBy: { frequency: 'desc' },
      });

      this.learnedPatternsCache.clear();
      patterns.forEach((pattern) => {
        this.learnedPatternsCache.set(pattern.pattern, pattern);
      });

      this.lastCacheUpdate = new Date();
      this.metrics.totalPatterns = patterns.length;
      this.metrics.highRiskPatterns = patterns.filter((p) => p.riskScore >= 7).length;

      console.log(`[LearningService] Cache reloaded: ${patterns.length} patterns`);
    } catch (error) {
      console.error('[LearningService] Cache reload failed:', error);
      throw error;
    }
  }

  private isCacheStale(): boolean {
    const now = Date.now();
    const cacheAge = now - this.lastCacheUpdate.getTime();
    return cacheAge > this.CACHE_TTL_MS;
  }

  private async ensureFreshCache(): Promise<void> {
    if (this.isCacheStale()) {
      await this.reloadCache();
    }
  }

  public async forceReload(): Promise<void> {
    console.log('[LearningService] Force reload requested');
    await this.reloadCache();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ATTACK PATTERN RECORDING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async recordAttack(attackData: {
    pattern: string;
    attackType: string;
    confidence: number;
    riskScore: number;
    ipAddress?: string;
  }): Promise<void> {
    try {
      const { pattern, attackType, confidence, riskScore } = attackData;

      // Check if pattern exists in learned patterns
      const existingPattern = await this.prisma.learnedPattern.findFirst({
        where: { pattern },
      });

      if (existingPattern) {
        // Update existing pattern
        const newConfidence = this.calculateNewConfidence(
          existingPattern.confidence,
          existingPattern.frequency,
          confidence
        );

        const newRiskScore = this.calculateNewRiskScore(
          existingPattern.riskScore,
          existingPattern.frequency,
          riskScore
        );

        await this.prisma.learnedPattern.update({
          where: { id: existingPattern.id },
          data: {
            frequency: existingPattern.frequency + 1,
            confidence: newConfidence,
            riskScore: newRiskScore,
            lastSeenAt: new Date(),
          },
        });
      } else {
        // Create new learned pattern
        await this.prisma.learnedPattern.create({
          data: {
            pattern,
            patternType: attackType,
            confidence,
            riskScore,
            frequency: 1,
            firstSeenAt: new Date(),
            lastSeenAt: new Date(),
          },
        });
      }

      // Invalidate cache
      this.learnedPatternsCache.delete(pattern);

      console.log(`[LearningService] Attack recorded: ${attackType} - ${pattern.substring(0, 50)}`);
    } catch (error) {
      console.error('[LearningService] Failed to record attack:', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PATTERN ANALYSIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async analyzeAttackPatterns(): Promise<PatternAnalysis[]> {
    try {
      await this.ensureFreshCache();

      const analysisWindow = new Date();
      analysisWindow.setDate(analysisWindow.getDate() - this.ANALYSIS_WINDOW_DAYS);

      // Get learned patterns from analysis window
      const patterns = await this.prisma.learnedPattern.findMany({
        where: {
          lastSeenAt: { gte: analysisWindow },
        },
        orderBy: { frequency: 'desc' },
      });

      // Analyze each pattern
      const analyses: PatternAnalysis[] = [];
      for (const pattern of patterns) {
        const analysis = this.analyzePattern(pattern);
        analyses.push(analysis);
        this.analyticsCache.set(pattern.pattern, analysis);
      }

      this.metrics.lastAnalysis = new Date();
      console.log(`[LearningService] Analyzed ${analyses.length} patterns`);

      return analyses;
    } catch (error) {
      console.error('[LearningService] Pattern analysis failed:', error);
      throw error;
    }
  }

  private analyzePattern(learnedPattern: LearnedPattern): PatternAnalysis {
    // Estimate unique IPs based on frequency (heuristic)
    const estimatedUniqueIPs = Math.ceil(learnedPattern.frequency / 2);

    // Extract attack type from patternType
    const attackTypes = [learnedPattern.patternType];

    // Calculate dynamic risk score based on pattern data
    const riskScore = this.calculateDynamicRiskScore({
      frequency: learnedPattern.frequency,
      uniqueIPs: estimatedUniqueIPs,
      avgRisk: learnedPattern.riskScore,
      timeSpan: learnedPattern.lastSeenAt.getTime() - learnedPattern.firstSeenAt.getTime(),
      attackTypes: attackTypes.length,
    });

    return {
      pattern: learnedPattern.pattern,
      frequency: learnedPattern.frequency,
      uniqueIPs: estimatedUniqueIPs,
      avgRiskScore: learnedPattern.riskScore,
      riskScore,
      firstSeen: learnedPattern.firstSeenAt,
      lastSeen: learnedPattern.lastSeenAt,
      attackTypes,
    };
  }

  private calculateDynamicRiskScore(factors: {
    frequency: number;
    uniqueIPs: number;
    avgRisk: number;
    timeSpan: number;
    attackTypes: number;
  }): number {
    let score = factors.avgRisk * 0.5; // Base risk (50%)

    // Frequency factor (30%)
    const frequencyScore = Math.min(factors.frequency / 10, 1) * 3;
    score += frequencyScore;

    // Unique IPs factor (15%)
    const ipScore = Math.min(factors.uniqueIPs / 5, 1) * 1.5;
    score += ipScore;

    // Attack diversity factor (5%)
    const diversityScore = Math.min(factors.attackTypes / 3, 1) * 0.5;
    score += diversityScore;

    return Math.min(Math.round(score * 10) / 10, 10); // Cap at 10
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMMON METHOD EXTRACTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async extractCommonMethods(): Promise<Map<string, string[]>> {
    try {
      const patterns = await this.prisma.learnedPattern.findMany({
        where: { frequency: { gte: 3 } }, // Patterns seen 3+ times
        orderBy: { frequency: 'desc' },
      });

      const methodMap = new Map<string, string[]>();

      patterns.forEach((pattern) => {
        const method = this.extractAttackMethod(pattern.pattern);
        if (method) {
          if (!methodMap.has(method)) {
            methodMap.set(method, []);
          }
          methodMap.get(method)!.push(pattern.pattern);
        }
      });

      console.log(`[LearningService] Extracted ${methodMap.size} common attack methods`);
      return methodMap;
    } catch (error) {
      console.error('[LearningService] Method extraction failed:', error);
      throw error;
    }
  }

  private extractAttackMethod(pattern: string): string | null {
    const lowerPattern = pattern.toLowerCase();

    // Jailbreak methods
    if (lowerPattern.includes('ignore') || lowerPattern.includes('forget')) {
      return 'instruction_override';
    }
    if (lowerPattern.includes('pretend') || lowerPattern.includes('act as')) {
      return 'role_play';
    }
    if (lowerPattern.includes('system') || lowerPattern.includes('admin')) {
      return 'privilege_escalation';
    }
    if (lowerPattern.includes('bypass') || lowerPattern.includes('disable')) {
      return 'bypass_attempt';
    }

    // Injection methods
    if (lowerPattern.includes('sql') || lowerPattern.includes('query')) {
      return 'sql_injection';
    }
    if (lowerPattern.includes('script') || lowerPattern.includes('<')) {
      return 'xss_injection';
    }
    if (lowerPattern.includes('eval') || lowerPattern.includes('exec')) {
      return 'code_injection';
    }

    // Prompt manipulation
    if (lowerPattern.includes('repeat') || lowerPattern.includes('echo')) {
      return 'prompt_leak';
    }
    if (lowerPattern.includes('translate') || lowerPattern.includes('encode')) {
      return 'encoding_bypass';
    }

    return 'unknown_method';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RISK SCORE CALCULATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async calculateRiskScores(): Promise<Map<string, number>> {
    try {
      const analyses = await this.analyzeAttackPatterns();
      const riskScores = new Map<string, number>();

      for (const analysis of analyses) {
        riskScores.set(analysis.pattern, analysis.riskScore);

        // Update learned pattern with new risk score
        const existingPattern = await this.prisma.learnedPattern.findFirst({
          where: { pattern: analysis.pattern },
        });

        if (existingPattern) {
          await this.prisma.learnedPattern.update({
            where: { id: existingPattern.id },
            data: { riskScore: analysis.riskScore },
          });
        }
      }

      // Calculate average risk score
      const avgRisk =
        analyses.length > 0
          ? analyses.reduce((sum, a) => sum + a.riskScore, 0) / analyses.length
          : 0;
      this.metrics.avgRiskScore = Math.round(avgRisk * 10) / 10;

      console.log(`[LearningService] Calculated risk scores for ${riskScores.size} patterns`);
      return riskScores;
    } catch (error) {
      console.error('[LearningService] Risk score calculation failed:', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PATTERN PROMOTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async promotePatterns(): Promise<LearningStats> {
    const stats: LearningStats = {
      analyzed: 0,
      promoted: 0,
      skipped: 0,
      errors: 0,
    };

    try {
      // Get all learned patterns
      const learnedPatterns = await this.prisma.learnedPattern.findMany({
        orderBy: { frequency: 'desc' },
      });

      stats.analyzed = learnedPatterns.length;

      // Analyze each pattern for promotion
      const candidates: PromotionCandidate[] = [];

      for (const pattern of learnedPatterns) {
        const analysis = await this.analyzePatternForPromotion(pattern);
        candidates.push(analysis);
      }

      // Promote qualified patterns
      for (const candidate of candidates) {
        if (candidate.shouldPromote) {
          try {
            await this.promotePattern(candidate.learnedPattern, candidate.analysis);
            stats.promoted++;
            console.log(
              `[LearningService] Promoted: ${candidate.learnedPattern.pattern.substring(0, 50)}`
            );
          } catch (error) {
            console.error('[LearningService] Promotion failed:', error);
            stats.errors++;
          }
        } else {
          stats.skipped++;
        }
      }

      this.metrics.promotedPatterns += stats.promoted;

      console.log(
        `[LearningService] Promotion complete: ${stats.promoted} promoted, ${stats.skipped} skipped, ${stats.errors} errors`
      );
      return stats;
    } catch (error) {
      console.error('[LearningService] Pattern promotion failed:', error);
      throw error;
    }
  }

  private async analyzePatternForPromotion(pattern: LearnedPattern): Promise<PromotionCandidate> {
    // Check if already promoted
    const existingPattern = await this.prisma.securityPattern.findFirst({
      where: { pattern: pattern.pattern },
    });

    if (existingPattern) {
      return {
        learnedPattern: pattern,
        analysis: {} as PatternAnalysis,
        shouldPromote: false,
        reason: 'Already promoted',
      };
    }

    // Analyze the learned pattern itself
    const analysis = this.analyzePattern(pattern);

    // Check promotion criteria
    const checks = {
      frequency: pattern.frequency >= this.MIN_FREQUENCY_FOR_PROMOTION,
      confidence: pattern.confidence >= this.MIN_CONFIDENCE_FOR_PROMOTION,
      riskScore: pattern.riskScore >= this.MIN_RISK_SCORE_FOR_PROMOTION,
      uniqueIPs: analysis.uniqueIPs >= this.MIN_UNIQUE_IPS,
    };

    const shouldPromote = Object.values(checks).every((check) => check);
    const failedChecks = Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([check]) => check);

    return {
      learnedPattern: pattern,
      analysis,
      shouldPromote,
      reason: shouldPromote ? 'All criteria met' : `Failed: ${failedChecks.join(', ')}`,
    };
  }

  private async promotePattern(
    learnedPattern: LearnedPattern,
    analysis: PatternAnalysis
  ): Promise<SecurityPattern> {
    try {
      // Create security pattern with ALL required fields
      const securityPattern = await this.prisma.securityPattern.create({
        data: {
          name: `Auto-Learned: ${learnedPattern.patternType}`,
          category: learnedPattern.patternType,
          pattern: learnedPattern.pattern,
          severity: this.calculateSeverity(analysis.riskScore),
          description: this.generateDescription(learnedPattern, analysis),
        },
      });

      return securityPattern;
    } catch (error) {
      console.error('[LearningService] Pattern promotion failed:', error);
      throw error;
    }
  }

  private calculateSeverity(riskScore: number): string {
    if (riskScore >= 9) return 'CRITICAL';
    if (riskScore >= 7) return 'HIGH';
    if (riskScore >= 5) return 'MEDIUM';
    if (riskScore >= 3) return 'LOW';
    return 'INFO';
  }

  private generateDescription(pattern: LearnedPattern, analysis: PatternAnalysis): string {
    return (
      `Auto-learned attack pattern detected ${pattern.frequency} times from ${analysis.uniqueIPs} unique IPs. ` +
      `Risk score: ${analysis.riskScore}/10. Attack types: ${analysis.attackTypes.join(', ')}. ` +
      `First seen: ${analysis.firstSeen.toISOString()}, Last seen: ${analysis.lastSeen.toISOString()}.`
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUERY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async getLearnedPatterns(options?: {
    minFrequency?: number;
    minRiskScore?: number;
    patternType?: string;
  }): Promise<LearnedPattern[]> {
    try {
      await this.ensureFreshCache();

      const where: Prisma.LearnedPatternWhereInput = {};

      if (options?.minFrequency) {
        where.frequency = { gte: options.minFrequency };
      }

      if (options?.minRiskScore) {
        where.riskScore = { gte: options.minRiskScore };
      }

      if (options?.patternType) {
        where.patternType = options.patternType;
      }

      const patterns = await this.prisma.learnedPattern.findMany({
        where,
        orderBy: [{ frequency: 'desc' }, { riskScore: 'desc' }],
      });

      return patterns;
    } catch (error) {
      console.error('[LearningService] Failed to get learned patterns:', error);
      throw error;
    }
  }

  public async getMetrics(): Promise<LearningMetrics> {
    await this.ensureFreshCache();
    return { ...this.metrics };
  }

  public async getTopPatterns(limit: number = 10): Promise<LearnedPattern[]> {
    try {
      return await this.prisma.learnedPattern.findMany({
        take: limit,
        orderBy: [{ frequency: 'desc' }, { riskScore: 'desc' }],
      });
    } catch (error) {
      console.error('[LearningService] Failed to get top patterns:', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private calculateNewConfidence(
    oldConfidence: number,
    oldFrequency: number,
    newConfidence: number
  ): number {
    // Weighted average (more weight to recent detections)
    const totalWeight = oldFrequency + 1;
    const weightedOld = oldConfidence * (oldFrequency * 0.8); // 80% weight to historical
    const weightedNew = newConfidence * 1; // Full weight to new
    return Math.min((weightedOld + weightedNew) / totalWeight, 1);
  }

  private calculateNewRiskScore(
    oldRiskScore: number,
    oldFrequency: number,
    newRiskScore: number
  ): number {
    // Weighted average with trend adjustment
    const totalWeight = oldFrequency + 1;
    const weightedOld = oldRiskScore * (oldFrequency * 0.7);
    const weightedNew = newRiskScore * 1.3; // 30% bonus to recent threats
    return Math.min((weightedOld + weightedNew) / totalWeight, 10);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLEANUP & MAINTENANCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async cleanupOldPatterns(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.learnedPattern.deleteMany({
        where: {
          lastSeenAt: { lt: cutoffDate },
          frequency: { lt: 3 }, // Only delete infrequent patterns
        },
      });

      await this.reloadCache();
      console.log(`[LearningService] Cleaned up ${result.count} old patterns`);
      return result.count;
    } catch (error) {
      console.error('[LearningService] Cleanup failed:', error);
      throw error;
    }
  }

  public async resetPattern(patternId: string): Promise<void> {
    try {
      const pattern = await this.prisma.learnedPattern.findUnique({
        where: { id: patternId },
      });

      if (pattern) {
        await this.prisma.learnedPattern.delete({
          where: { id: patternId },
        });
        this.learnedPatternsCache.delete(pattern.pattern);
        console.log(`[LearningService] Pattern reset: ${pattern.pattern}`);
      }
    } catch (error) {
      console.error('[LearningService] Pattern reset failed:', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SHUTDOWN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async shutdown(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('[LearningService] Service shut down gracefully');
    } catch (error) {
      console.error('[LearningService] Shutdown error:', error);
      throw error;
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default LearningService.getInstance();
