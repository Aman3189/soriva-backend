// src/services/security/content-moderator.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ CONTENT MODERATOR SERVICE v3.0 (ENHANCED - DYNAMIC)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Purpose: Complete content moderation with dynamic configuration
// Features: Model blocking, PII detection, toxicity, XSS/SQL, harmful content
// Architecture: Singleton, Config-driven, Database-powered, Fully Dynamic
// Version: 3.0 (Integration with SecurityConfigManager)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { PrismaClient, BlockedModelName } from '@prisma/client';
import learningServiceInstance from '@/services/learning.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Comprehensive moderation result
 */
export interface ModerationResult {
  isClean: boolean;
  isToxic: boolean;
  hasPII: boolean;
  hasBlockedContent: boolean;
  hasMaliciousCode: boolean;
  hasHarmfulContent: boolean;

  contentScore: number; // 0-100 (higher = safer)
  toxicityScore: number; // 0-100 (higher = more toxic)
  riskLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  sanitizedContent: string;
  originalContent: string;

  flags: ModerationFlag[];
  detectedIssues: ContentIssue[];
  blockedModelNames: string[];
  piiDetections: PIIDetection[];
  removedEntities: RemovedEntity[];

  metadata: {
    processingTime: number;
    timestamp: Date;
    contentLength: number;
    modificationsCount: number;
    cacheHit: boolean;
    configVersion: string;
  };

  recommendations?: string[];
}

/**
 * Moderation flag
 */
export interface ModerationFlag {
  category: ModerationCategory;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  matched: string;
  position?: { start: number; end: number };
  confidence?: number;
}

/**
 * Content issue detected
 */
export interface ContentIssue {
  type:
    | 'MODEL_NAME'
    | 'TOXIC_CONTENT'
    | 'PII'
    | 'PROFANITY'
    | 'SPAM'
    | 'MALICIOUS_CODE'
    | 'HARMFUL_CONTENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedText: string;
  action: 'REMOVED' | 'REPLACED' | 'REDACTED' | 'FLAGGED' | 'BLOCKED';
  replacement?: string;
  category?: string;
}

/**
 * PII detection
 */
export interface PIIDetection {
  type:
    | 'EMAIL'
    | 'PHONE'
    | 'SSN'
    | 'CREDIT_CARD'
    | 'ADDRESS'
    | 'NAME'
    | 'IP_ADDRESS'
    | 'AADHAAR'
    | 'PASSPORT'
    | 'DRIVING_LICENSE';
  value: string;
  redactedValue: string;
  confidence: number;
  position: { start: number; end: number };
  sensitivityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Removed entity
 */
export interface RemovedEntity {
  type: 'MODEL_NAME' | 'PROVIDER_NAME' | 'PII' | 'SENSITIVE_INFO' | 'MALICIOUS_CODE' | 'PROFANITY';
  original: string;
  replacement: string;
  count: number;
  category?: string;
}

/**
 * Moderation category
 */
export type ModerationCategory =
  | 'HARMFUL_CONTENT'
  | 'HATE_SPEECH'
  | 'VIOLENCE'
  | 'EXPLICIT_CONTENT'
  | 'PII_EXPOSURE'
  | 'MODEL_REVEAL'
  | 'PROVIDER_REVEAL'
  | 'MALICIOUS_CODE'
  | 'SPAM'
  | 'MISINFORMATION'
  | 'PROFANITY'
  | 'HARASSMENT'
  | 'SELF_HARM'
  | 'ILLEGAL_ACTIVITY';

/**
 * Blocked model configuration
 */
interface BlockedModelConfig {
  id: string;
  modelName: string;
  aliases: string[];
  provider: string | null;
  blockType: 'REMOVE' | 'REPLACE' | 'REDACT';
  replacement: string | null;
  isActive: boolean;
  priority: number;
}

/**
 * Content pattern for detection
 */
interface ContentPattern {
  pattern: RegExp;
  category: ModerationCategory;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  replacement?: string;
  enabled?: boolean;
  description?: string;
}

/**
 * Cache entry
 */
interface CacheEntry {
  result: ModerationResult;
  timestamp: number;
}

/**
 * Moderation context
 */
export interface ModerationContext {
  userId?: string;
  conversationId?: string;
  isUserInput?: boolean;
  checkModelNames?: boolean;
  checkToxicity?: boolean;
  checkPII?: boolean;
  checkMalicious?: boolean;
  checkHarmful?: boolean;
  checkProfanity?: boolean;
  redactPII?: boolean;
  strictMode?: boolean;
  customPatterns?: ContentPattern[];
  skipCache?: boolean;
}

/**
 * Moderation statistics
 */
interface ModerationStats {
  totalModerated: number;
  modelNamesBlocked: number;
  piiDetected: number;
  toxicContentBlocked: number;
  maliciousCodeBlocked: number;
  harmfulContentBlocked: number;
  profanityFiltered: number;
  cacheHits: number;
  cacheMisses: number;
  averageProcessingTime: number;
  lastModeration: Date | null;
}

/**
 * Configuration snapshot
 */
interface ConfigSnapshot {
  version: string;
  timestamp: Date;
  thresholds: {
    minSafeScore: number;
    toxicityThreshold: number;
    piiConfidenceThreshold: number;
  };
  enabledFeatures: {
    modelBlocking: boolean;
    piiDetection: boolean;
    toxicityCheck: boolean;
    maliciousCodeCheck: boolean;
    harmfulContentCheck: boolean;
    profanityFilter: boolean;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTENT MODERATOR SERVICE (SINGLETON)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ContentModeratorService {
  private static instance: ContentModeratorService;
  private prisma: PrismaClient;
  private learningService = learningServiceInstance;

  // Caching
  private blockedModelsCache: Map<string, BlockedModelConfig>;
  private moderationCache: Map<string, CacheEntry>;
  private cacheLoadedAt: Date | null;
  private configSnapshot: ConfigSnapshot | null;

  // Configuration (dynamic)
  private CACHE_DURATION: number;
  private MODERATION_CACHE_TTL: number;
  private CACHE_MAX_SIZE: number;
  private MIN_SAFE_SCORE: number;
  private TOXICITY_THRESHOLD: number;
  private PII_CONFIDENCE_THRESHOLD: number;

  // Statistics
  private stats: ModerationStats = {
    totalModerated: 0,
    modelNamesBlocked: 0,
    piiDetected: 0,
    toxicContentBlocked: 0,
    maliciousCodeBlocked: 0,
    harmfulContentBlocked: 0,
    profanityFiltered: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageProcessingTime: 0,
    lastModeration: null,
  };

  // Pattern categories (can be toggled)
  private patternCategories = new Map<string, boolean>([
    ['hate_speech', true],
    ['violence', true],
    ['profanity', true],
    ['spam', true],
    ['self_harm', true],
    ['illegal', true],
  ]);

  /**
   * Private constructor (Singleton)
   */
  private constructor() {
    this.prisma = new PrismaClient();
    this.blockedModelsCache = new Map();
    this.moderationCache = new Map();
    this.cacheLoadedAt = null;
    this.configSnapshot = null;

    // Initialize with default values
    this.CACHE_DURATION = 5 * 60 * 1000;
    this.MODERATION_CACHE_TTL = 5 * 60 * 1000;
    this.CACHE_MAX_SIZE = 1000;
    this.MIN_SAFE_SCORE = 50;
    this.TOXICITY_THRESHOLD = 70;
    this.PII_CONFIDENCE_THRESHOLD = 0.7;

    this.loadConfiguration();

    console.log('[ContentModerator] ✅ Service initialized (v3.0 - Dynamic)');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ContentModeratorService {
    if (!ContentModeratorService.instance) {
      ContentModeratorService.instance = new ContentModeratorService();
    }
    return ContentModeratorService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIGURATION MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Load configuration from environment variables and defaults
   */
  private loadConfiguration(): void {
    try {
      // Load from environment variables or use defaults
      this.MIN_SAFE_SCORE = parseInt(process.env.CONTENT_MIN_SAFE_SCORE || '50');
      this.TOXICITY_THRESHOLD = parseInt(process.env.CONTENT_TOXICITY_THRESHOLD || '70');
      this.PII_CONFIDENCE_THRESHOLD = parseFloat(process.env.CONTENT_PII_CONFIDENCE || '0.7');

      // Cache settings from environment
      this.CACHE_DURATION = parseInt(process.env.CONTENT_CACHE_DURATION || '300000'); // 5 min
      this.MODERATION_CACHE_TTL = parseInt(process.env.CONTENT_CACHE_TTL || '300000');
      this.CACHE_MAX_SIZE = parseInt(process.env.CONTENT_CACHE_MAX_SIZE || '1000');

      // Create config snapshot
      this.configSnapshot = {
        version: '3.0.0',
        timestamp: new Date(),
        thresholds: {
          minSafeScore: this.MIN_SAFE_SCORE,
          toxicityThreshold: this.TOXICITY_THRESHOLD,
          piiConfidenceThreshold: this.PII_CONFIDENCE_THRESHOLD,
        },
        enabledFeatures: {
          modelBlocking: process.env.CONTENT_MODEL_BLOCKING !== 'false',
          piiDetection: process.env.CONTENT_PII_DETECTION !== 'false',
          toxicityCheck: process.env.CONTENT_TOXICITY_CHECK !== 'false',
          maliciousCodeCheck: process.env.CONTENT_MALICIOUS_CHECK !== 'false',
          harmfulContentCheck: process.env.CONTENT_HARMFUL_CHECK !== 'false',
          profanityFilter: process.env.CONTENT_PROFANITY_FILTER !== 'false',
        },
      };

      console.log('[ContentModerator] 📋 Configuration loaded from environment');
    } catch (error) {
      console.error('[ContentModerator] ⚠️ Error loading configuration, using defaults:', error);
    }
  }

  /**
   * Reload configuration (dynamic updates)
   */
  public reloadConfiguration(): void {
    console.log('[ContentModerator] 🔄 Reloading configuration...');
    this.loadConfiguration();
    this.clearCache(); // Clear cache when config changes
  }

  /**
   * Get current configuration snapshot
   */
  public getConfiguration(): ConfigSnapshot | null {
    return this.configSnapshot;
  }

  /**
   * Update specific threshold dynamically
   */
  public updateThreshold(
    threshold: 'minSafeScore' | 'toxicity' | 'piiConfidence',
    value: number
  ): void {
    switch (threshold) {
      case 'minSafeScore':
        this.MIN_SAFE_SCORE = Math.max(0, Math.min(100, value));
        break;
      case 'toxicity':
        this.TOXICITY_THRESHOLD = Math.max(0, Math.min(100, value));
        break;
      case 'piiConfidence':
        this.PII_CONFIDENCE_THRESHOLD = Math.max(0, Math.min(1, value));
        break;
    }

    if (this.configSnapshot) {
      this.configSnapshot.thresholds = {
        minSafeScore: this.MIN_SAFE_SCORE,
        toxicityThreshold: this.TOXICITY_THRESHOLD,
        piiConfidenceThreshold: this.PII_CONFIDENCE_THRESHOLD,
      };
    }

    console.log(`[ContentModerator] 🔧 Updated ${threshold} to ${value}`);
  }

  /**
   * Toggle pattern category
   */
  public togglePatternCategory(category: string, enabled: boolean): void {
    this.patternCategories.set(category, enabled);
    console.log(
      `[ContentModerator] 🎚️ Pattern category "${category}" ${enabled ? 'enabled' : 'disabled'}`
    );
  }

  /**
   * Check if pattern category is enabled
   */
  private isCategoryEnabled(category: string): boolean {
    return this.patternCategories.get(category) ?? true;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Check if cache needs refresh
   */
  private isCacheExpired(): boolean {
    if (!this.cacheLoadedAt) return true;
    const elapsed = Date.now() - this.cacheLoadedAt.getTime();
    return elapsed > this.CACHE_DURATION;
  }

  /**
   * Load blocked models from database
   */
  private async loadBlockedModels(): Promise<void> {
    try {
      console.log('[ContentModerator] 📥 Loading blocked models from database...');

      const models = await this.prisma.blockedModelName.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      });

      this.blockedModelsCache.clear();

      for (const model of models) {
        const config: BlockedModelConfig = {
          id: model.id,
          modelName: model.modelName,
          aliases: model.aliases,
          provider: model.provider,
          blockType: model.blockType as 'REMOVE' | 'REPLACE' | 'REDACT',
          replacement: model.replacement,
          isActive: model.isActive,
          priority: model.priority,
        };

        // Add main model name
        this.blockedModelsCache.set(model.modelName.toLowerCase(), config);

        // Add all aliases
        for (const alias of model.aliases) {
          this.blockedModelsCache.set(alias.toLowerCase(), config);
        }
      }

      this.cacheLoadedAt = new Date();
      console.log(
        `[ContentModerator] ✅ Loaded ${models.length} blocked models (${this.blockedModelsCache.size} entries with aliases)`
      );
    } catch (error) {
      console.error('[ContentModerator] ❌ Error loading blocked models:', error);
      throw error;
    }
  }

  /**
   * Ensure cache is loaded
   */
  private async ensureCacheLoaded(): Promise<void> {
    if (this.isCacheExpired()) {
      await this.loadBlockedModels();
    }
  }

  /**
   * Force reload cache
   */
  public async reloadCache(): Promise<void> {
    console.log('[ContentModerator] 🔄 Force reloading cache...');
    await this.loadBlockedModels();
  }

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.moderationCache.clear();
    this.stats.cacheHits = 0;
    this.stats.cacheMisses = 0;
    console.log('[ContentModerator] 🧹 All caches cleared');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN MODERATION (COMPREHENSIVE)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Main moderation method - comprehensive content validation
   */
  public async moderateContent(
    content: string,
    context?: ModerationContext
  ): Promise<ModerationResult> {
    const startTime = Date.now();

    // Validate input
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content: must be a non-empty string');
    }

    // Default options with config-driven defaults
    const opts = {
      userId: context?.userId,
      conversationId: context?.conversationId,
      isUserInput: context?.isUserInput ?? false,
      checkModelNames:
        context?.checkModelNames ?? this.configSnapshot?.enabledFeatures.modelBlocking ?? true,
      checkToxicity:
        context?.checkToxicity ?? this.configSnapshot?.enabledFeatures.toxicityCheck ?? true,
      checkPII: context?.checkPII ?? this.configSnapshot?.enabledFeatures.piiDetection ?? true,
      checkMalicious:
        context?.checkMalicious ?? this.configSnapshot?.enabledFeatures.maliciousCodeCheck ?? true,
      checkHarmful:
        context?.checkHarmful ?? this.configSnapshot?.enabledFeatures.harmfulContentCheck ?? true,
      checkProfanity:
        context?.checkProfanity ?? this.configSnapshot?.enabledFeatures.profanityFilter ?? true,
      redactPII: context?.redactPII ?? true,
      strictMode: context?.strictMode ?? false,
      customPatterns: context?.customPatterns ?? [],
      skipCache: context?.skipCache ?? false,
    };

    // Check moderation cache first (unless skipped)
    if (!opts.skipCache) {
      const cacheKey = this.generateCacheKey(content, opts);
      const cached = this.getFromModerationCache(cacheKey);
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
      this.stats.cacheMisses++;
    }

    try {
      await this.ensureCacheLoaded();

      let sanitizedContent = content;
      const flags: ModerationFlag[] = [];
      const detectedIssues: ContentIssue[] = [];
      const blockedModelNames: string[] = [];
      const piiDetections: PIIDetection[] = [];
      const removedEntities: RemovedEntity[] = [];
      const recommendations: string[] = [];
      let modificationsCount = 0;
      let toxicityScore = 0;
      let hasHarmfulContent = false;

      // Step 1: Check harmful content (hate speech, violence, self-harm)
      if (opts.checkHarmful) {
        const harmfulResult = this.detectHarmfulContent(sanitizedContent, opts.customPatterns);
        flags.push(...harmfulResult.flags);

        if (harmfulResult.flags.length > 0) {
          hasHarmfulContent = true;
          detectedIssues.push({
            type: 'HARMFUL_CONTENT',
            severity: harmfulResult.maxSeverity,
            description: `Detected ${harmfulResult.categories.join(', ')}`,
            detectedText: harmfulResult.samples.join(', ').substring(0, 100),
            action: 'FLAGGED',
          });

          recommendations.push('Content contains potentially harmful material');
          this.stats.harmfulContentBlocked++;
        }
      }

      // Step 2: Remove model/provider names (critical for AI responses)
      if (opts.checkModelNames && !opts.isUserInput) {
        const modelResult = await this.removeModelNames(sanitizedContent);
        sanitizedContent = modelResult.sanitizedText;
        detectedIssues.push(...modelResult.issues);
        blockedModelNames.push(...modelResult.blockedNames);
        removedEntities.push(...modelResult.removedEntities);
        modificationsCount += modelResult.modificationsCount;

        if (modelResult.blockedNames.length > 0) {
          this.stats.modelNamesBlocked++;
          recommendations.push(`Removed ${modelResult.blockedNames.length} model name(s)`);
        }
      }

      // Step 3: Detect and redact PII
      if (opts.checkPII) {
        const piiResult = await this.detectPII(sanitizedContent);

        // Filter by confidence threshold
        const highConfidencePII = piiResult.detections.filter(
          (d) => d.confidence >= this.PII_CONFIDENCE_THRESHOLD
        );

        piiDetections.push(...highConfidencePII);

        if (opts.redactPII && highConfidencePII.length > 0) {
          const redactionResult = this.redactPII(sanitizedContent, highConfidencePII);
          sanitizedContent = redactionResult.sanitizedText;
          detectedIssues.push(...redactionResult.issues);
          removedEntities.push(...redactionResult.removedEntities);
          modificationsCount += highConfidencePII.length;
          this.stats.piiDetected++;
          recommendations.push(`Redacted ${highConfidencePII.length} PII item(s)`);
        }
      }

      // Step 4: Remove malicious patterns (XSS, SQL injection)
      if (opts.checkMalicious) {
        const maliciousResult = this.removeMaliciousPatterns(sanitizedContent);
        sanitizedContent = maliciousResult.sanitizedText;

        if (maliciousResult.removedCount > 0) {
          detectedIssues.push({
            type: 'MALICIOUS_CODE',
            severity: 'CRITICAL',
            description: `Removed ${maliciousResult.removedCount} malicious pattern(s)`,
            detectedText: maliciousResult.patterns.join(', '),
            action: 'REMOVED',
          });

          removedEntities.push({
            type: 'MALICIOUS_CODE',
            original: 'Malicious code patterns',
            replacement: '[REMOVED]',
            count: maliciousResult.removedCount,
          });

          modificationsCount += maliciousResult.removedCount;
          this.stats.maliciousCodeBlocked++;
          recommendations.push('Removed malicious code patterns');
        }
      }

      // Step 5: Filter profanity
      if (opts.checkProfanity && this.isCategoryEnabled('profanity')) {
        const profanityResult = this.filterProfanity(sanitizedContent);

        if (profanityResult.wasFiltered) {
          sanitizedContent = profanityResult.sanitizedText;
          detectedIssues.push({
            type: 'PROFANITY',
            severity: 'MEDIUM',
            description: `Filtered ${profanityResult.count} profane word(s)`,
            detectedText: '[PROFANITY]',
            action: 'REPLACED',
          });

          removedEntities.push({
            type: 'PROFANITY',
            original: 'Profane language',
            replacement: '[FILTERED]',
            count: profanityResult.count,
          });

          modificationsCount += profanityResult.count;
          this.stats.profanityFiltered++;
        }
      }

      // Step 6: Calculate toxicity score
      if (opts.checkToxicity) {
        toxicityScore = await this.calculateToxicityScore(sanitizedContent, opts.strictMode);

        if (toxicityScore > this.TOXICITY_THRESHOLD) {
          this.stats.toxicContentBlocked++;
          recommendations.push('Content toxicity exceeds threshold');
        }
      }

      // Step 7: Calculate content safety score
      const contentScore = this.calculateContentScore(
        flags,
        toxicityScore,
        piiDetections.length,
        modificationsCount
      );

      // Step 8: Determine risk level
      const riskLevel = this.calculateRiskLevel(contentScore, toxicityScore, flags);

      // Update statistics
      this.stats.totalModerated++;
      this.stats.lastModeration = new Date();

      // Update average processing time
      const processingTime = Date.now() - startTime;
      this.stats.averageProcessingTime =
        (this.stats.averageProcessingTime * (this.stats.totalModerated - 1) + processingTime) /
        this.stats.totalModerated;

      const result: ModerationResult = {
        isClean:
          detectedIssues.length === 0 &&
          contentScore >= this.MIN_SAFE_SCORE &&
          toxicityScore < this.TOXICITY_THRESHOLD &&
          !hasHarmfulContent,
        isToxic: toxicityScore > this.TOXICITY_THRESHOLD,
        hasPII: piiDetections.length > 0,
        hasBlockedContent: blockedModelNames.length > 0,
        hasMaliciousCode: removedEntities.some((e) => e.type === 'MALICIOUS_CODE'),
        hasHarmfulContent,

        contentScore,
        toxicityScore,
        riskLevel,

        sanitizedContent,
        originalContent: content,

        flags,
        detectedIssues,
        blockedModelNames,
        piiDetections,
        removedEntities,

        metadata: {
          processingTime,
          timestamp: new Date(),
          contentLength: content.length,
          modificationsCount,
          cacheHit: false,
          configVersion: this.configSnapshot?.version ?? 'unknown',
        },

        recommendations: recommendations.length > 0 ? recommendations : undefined,
      };

      // Cache the result (unless skipped)
      if (!opts.skipCache) {
        const cacheKey = this.generateCacheKey(content, opts);
        this.addToModerationCache(cacheKey, result);
      }

      // Log if significant issues found
      if (
        !result.isClean ||
        result.isToxic ||
        result.hasMaliciousCode ||
        result.riskLevel === 'HIGH' ||
        result.riskLevel === 'CRITICAL'
      ) {
        await this.logModerationEvent(result, opts.userId);
      }

      return result;
    } catch (error) {
      console.error('[ContentModerator] ❌ Error during moderation:', error);

      // Return safe fallback
      return this.createErrorResult(content, startTime, error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODEL NAME BLOCKING (DATABASE-DRIVEN)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Remove model names from content (database-driven)
   */
  private async removeModelNames(content: string): Promise<{
    sanitizedText: string;
    issues: ContentIssue[];
    blockedNames: string[];
    removedEntities: RemovedEntity[];
    modificationsCount: number;
  }> {
    let sanitizedText = content;
    const issues: ContentIssue[] = [];
    const blockedNames: string[] = [];
    const removedEntities: RemovedEntity[] = [];
    let modificationsCount = 0;

    try {
      // Get unique models (deduplicate by ID)
      const blockedModels = Array.from(this.blockedModelsCache.values());
      const processedModels = new Map<string, BlockedModelConfig>();

      for (const model of blockedModels) {
        if (!processedModels.has(model.id)) {
          processedModels.set(model.id, model);
        }
      }

      // Process each model
      for (const model of processedModels.values()) {
        // Check main model name
        const mainPattern = new RegExp(`\\b${this.escapeRegex(model.modelName)}\\b`, 'gi');
        const mainMatches = sanitizedText.match(mainPattern);

        if (mainMatches) {
          sanitizedText = this.blockModelName(sanitizedText, model);

          if (!blockedNames.includes(model.modelName)) {
            blockedNames.push(model.modelName);
          }

          modificationsCount += mainMatches.length;

          issues.push({
            type: 'MODEL_NAME',
            severity: 'HIGH',
            description: `Detected model name: ${model.modelName}`,
            detectedText: model.modelName,
            action:
              model.blockType === 'REMOVE'
                ? 'REMOVED'
                : model.blockType === 'REPLACE'
                  ? 'REPLACED'
                  : 'REDACTED',
            replacement: model.replacement || undefined,
            category: model.provider || undefined,
          });

          removedEntities.push({
            type: 'MODEL_NAME',
            original: model.modelName,
            replacement: model.replacement || '[REDACTED]',
            count: mainMatches.length,
            category: model.provider || undefined,
          });

          await this.updateDetectionCount(model.id);
        }

        // Check aliases
        for (const alias of model.aliases) {
          const aliasPattern = new RegExp(`\\b${this.escapeRegex(alias)}\\b`, 'gi');
          const aliasMatches = sanitizedText.match(aliasPattern);

          if (aliasMatches) {
            sanitizedText = this.blockModelName(sanitizedText, model, alias);

            if (!blockedNames.includes(model.modelName)) {
              blockedNames.push(model.modelName);
            }

            modificationsCount += aliasMatches.length;

            issues.push({
              type: 'MODEL_NAME',
              severity: 'HIGH',
              description: `Detected model alias: ${alias} (${model.modelName})`,
              detectedText: alias,
              action:
                model.blockType === 'REMOVE'
                  ? 'REMOVED'
                  : model.blockType === 'REPLACE'
                    ? 'REPLACED'
                    : 'REDACTED',
              replacement: model.replacement || undefined,
              category: model.provider || undefined,
            });
          }
        }
      }

      return { sanitizedText, issues, blockedNames, removedEntities, modificationsCount };
    } catch (error) {
      console.error('[ContentModerator] ❌ Error removing model names:', error);
      return { sanitizedText, issues, blockedNames, removedEntities, modificationsCount };
    }
  }

  /**
   * Block a specific model name
   */
  private blockModelName(text: string, model: BlockedModelConfig, matchedText?: string): string {
    const target = matchedText || model.modelName;
    const pattern = new RegExp(`\\b${this.escapeRegex(target)}\\b`, 'gi');

    switch (model.blockType) {
      case 'REMOVE':
        return text
          .replace(pattern, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
      case 'REPLACE':
        return text.replace(pattern, model.replacement || 'Soriva');
      case 'REDACT':
        return text.replace(pattern, '[REDACTED]');
      default:
        return text;
    }
  }

  /**
   * Update detection count in database
   */
  private async updateDetectionCount(modelId: string): Promise<void> {
    try {
      await this.prisma.blockedModelName.update({
        where: { id: modelId },
        data: {
          detectionCount: { increment: 1 },
          lastDetected: new Date(),
        },
      });
    } catch (error) {
      console.error('[ContentModerator] ⚠️ Error updating detection count:', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PII DETECTION & REDACTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Detect PII (Enhanced with sensitivity levels)
   */
  private async detectPII(content: string): Promise<{ detections: PIIDetection[] }> {
    const detections: PIIDetection[] = [];

    // Email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let match;
    while ((match = emailRegex.exec(content)) !== null) {
      detections.push({
        type: 'EMAIL',
        value: match[0],
        redactedValue: this.redactEmail(match[0]),
        confidence: 0.95,
        position: { start: match.index, end: match.index + match[0].length },
        sensitivityLevel: 'HIGH',
      });
    }

    // Phone (multiple formats)
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    while ((match = phoneRegex.exec(content)) !== null) {
      detections.push({
        type: 'PHONE',
        value: match[0],
        redactedValue: '[PHONE-REDACTED]',
        confidence: 0.85,
        position: { start: match.index, end: match.index + match[0].length },
        sensitivityLevel: 'HIGH',
      });
    }

    // Credit card
    const ccRegex = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
    while ((match = ccRegex.exec(content)) !== null) {
      // Basic Luhn algorithm check
      const digits = match[0].replace(/[-\s]/g, '');
      if (this.isValidCreditCard(digits)) {
        detections.push({
          type: 'CREDIT_CARD',
          value: match[0],
          redactedValue: '[CC-REDACTED]',
          confidence: 0.95,
          position: { start: match.index, end: match.index + match[0].length },
          sensitivityLevel: 'CRITICAL',
        });
      }
    }

    // SSN / Aadhaar
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
    while ((match = ssnRegex.exec(content)) !== null) {
      detections.push({
        type: 'SSN',
        value: match[0],
        redactedValue: '[SSN-REDACTED]',
        confidence: 0.9,
        position: { start: match.index, end: match.index + match[0].length },
        sensitivityLevel: 'CRITICAL',
      });
    }

    const aadhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
    while ((match = aadhaarRegex.exec(content)) !== null) {
      detections.push({
        type: 'AADHAAR',
        value: match[0],
        redactedValue: '[AADHAAR-REDACTED]',
        confidence: 0.85,
        position: { start: match.index, end: match.index + match[0].length },
        sensitivityLevel: 'CRITICAL',
      });
    }

    // IP Address
    const ipRegex =
      /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    while ((match = ipRegex.exec(content)) !== null) {
      detections.push({
        type: 'IP_ADDRESS',
        value: match[0],
        redactedValue: '[IP-REDACTED]',
        confidence: 0.8,
        position: { start: match.index, end: match.index + match[0].length },
        sensitivityLevel: 'MEDIUM',
      });
    }

    return { detections };
  }

  /**
   * Validate credit card using Luhn algorithm
   */
  private isValidCreditCard(cardNumber: string): boolean {
    if (!/^\d{13,19}$/.test(cardNumber)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Redact PII from content
   */
  private redactPII(
    content: string,
    detections: PIIDetection[]
  ): {
    sanitizedText: string;
    issues: ContentIssue[];
    removedEntities: RemovedEntity[];
  } {
    let sanitizedText = content;
    const issues: ContentIssue[] = [];
    const removedEntities: RemovedEntity[] = [];

    // Sort detections by position (descending) to avoid index shifting
    const sortedDetections = [...detections].sort((a, b) => b.position.start - a.position.start);

    for (const detection of sortedDetections) {
      sanitizedText =
        sanitizedText.slice(0, detection.position.start) +
        detection.redactedValue +
        sanitizedText.slice(detection.position.end);

      issues.push({
        type: 'PII',
        severity:
          detection.sensitivityLevel === 'CRITICAL'
            ? 'CRITICAL'
            : detection.sensitivityLevel === 'HIGH'
              ? 'HIGH'
              : 'MEDIUM',
        description: `Detected ${detection.type}`,
        detectedText: detection.value,
        action: 'REDACTED',
        replacement: detection.redactedValue,
      });

      removedEntities.push({
        type: 'PII',
        original: `${detection.type}: ${detection.value.substring(0, 10)}...`,
        replacement: detection.redactedValue,
        count: 1,
      });
    }

    return { sanitizedText, issues, removedEntities };
  }

  /**
   * Redact email (smart masking)
   */
  private redactEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
      return `${local}***@${domain}`;
    }
    return `${local.substring(0, 2)}***@${domain}`;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MALICIOUS CODE DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Remove malicious patterns (XSS, SQL injection, etc.)
   */
  private removeMaliciousPatterns(content: string): {
    sanitizedText: string;
    removedCount: number;
    patterns: string[];
  } {
    let sanitizedText = content;
    let removedCount = 0;
    const patterns: string[] = [];

    // Remove <script> tags
    const scriptMatches = sanitizedText.match(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
    );
    if (scriptMatches) {
      sanitizedText = sanitizedText.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        '[SCRIPT_REMOVED]'
      );
      removedCount += scriptMatches.length;
      patterns.push('script_tags');
    }

    // Remove javascript: protocol
    const jsProtocolMatches = sanitizedText.match(/javascript:/gi);
    if (jsProtocolMatches) {
      sanitizedText = sanitizedText.replace(/javascript:/gi, 'blocked:');
      removedCount += jsProtocolMatches.length;
      patterns.push('javascript_protocol');
    }

    // Remove event handlers
    const eventHandlerMatches = sanitizedText.match(/on\w+\s*=\s*["'][^"']*["']/gi);
    if (eventHandlerMatches) {
      sanitizedText = sanitizedText.replace(
        /on\w+\s*=\s*["'][^"']*["']/gi,
        '[EVENT_HANDLER_REMOVED]'
      );
      removedCount += eventHandlerMatches.length;
      patterns.push('event_handlers');
    }

    // Remove SQL injection patterns
    const sqlMatches = sanitizedText.match(/(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi);
    if (sqlMatches) {
      sanitizedText = sanitizedText.replace(
        /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
        '[SQL_PATTERN_REMOVED]'
      );
      removedCount += sqlMatches.length;
      patterns.push('sql_injection');
    }

    // Remove eval and dangerous functions
    const dangerousFunctions = /\b(eval|exec|system|shell_exec|passthru)\s*\(/gi;
    const dangerousMatches = sanitizedText.match(dangerousFunctions);
    if (dangerousMatches) {
      sanitizedText = sanitizedText.replace(dangerousFunctions, '[DANGEROUS_FUNCTION_REMOVED](');
      removedCount += dangerousMatches.length;
      patterns.push('dangerous_functions');
    }

    return { sanitizedText, removedCount, patterns };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HARMFUL CONTENT DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Detect harmful content (hate speech, violence, etc.)
   */
  private detectHarmfulContent(
    content: string,
    customPatterns: ContentPattern[] = []
  ): {
    flags: ModerationFlag[];
    maxSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    categories: string[];
    samples: string[];
  } {
    const flags: ModerationFlag[] = [];
    const categories = new Set<string>();
    const samples: string[] = [];

    const patterns = [...this.getHarmfulContentPatterns(), ...customPatterns];

    for (const { pattern, category, severity, enabled } of patterns) {
      // Skip if pattern is disabled
      if (enabled === false) continue;

      // Check if category is enabled
      const categoryKey = category.toLowerCase().replace(/_/g, '_');
      if (!this.isCategoryEnabled(categoryKey)) continue;

      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          flags.push({
            category,
            severity,
            reason: `Detected ${category.toLowerCase().replace('_', ' ')}`,
            matched: match.substring(0, 50),
            confidence: 0.85,
          });

          categories.add(category.toLowerCase().replace('_', ' '));
          if (samples.length < 3) {
            samples.push(match.substring(0, 30));
          }
        }
      }
    }

    // Determine max severity
    const severityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    const maxSeverity = flags.reduce(
      (max, flag) => {
        return severityOrder[flag.severity] > severityOrder[max] ? flag.severity : max;
      },
      'LOW' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    );

    return {
      flags,
      maxSeverity,
      categories: Array.from(categories),
      samples,
    };
  }

  /**
   * Get harmful content patterns (configurable)
   */
  private getHarmfulContentPatterns(): ContentPattern[] {
    return [
      // Hate speech
      {
        pattern:
          /\b(hate|kill|murder|die|death to)\b.*\b(race|religion|gender|community|ethnic|minority)\b/i,
        category: 'HATE_SPEECH',
        severity: 'CRITICAL',
        enabled: this.isCategoryEnabled('hate_speech'),
        description: 'Hate speech targeting protected groups',
      },
      // Violence
      {
        pattern: /\b(bomb|weapon|explosive|terrorist|attack|harm|assault|murder|kill)\b/i,
        category: 'VIOLENCE',
        severity: 'HIGH',
        enabled: this.isCategoryEnabled('violence'),
        description: 'Violent content or threats',
      },
      // Self-harm
      {
        pattern: /\b(suicide|self[- ]harm|cut myself|end my life|want to die)\b/i,
        category: 'SELF_HARM',
        severity: 'CRITICAL',
        enabled: this.isCategoryEnabled('self_harm'),
        description: 'Self-harm or suicide-related content',
      },
      // Spam
      {
        pattern:
          /\b(click here|buy now|limited offer|act now|free money|guaranteed)\b.*(http|www)/i,
        category: 'SPAM',
        severity: 'LOW',
        enabled: this.isCategoryEnabled('spam'),
        description: 'Spam or phishing attempts',
      },
      // Illegal activity
      {
        pattern: /\b(illegal|drugs|cocaine|heroin|methamphetamine|counterfeit|stolen)\b/i,
        category: 'ILLEGAL_ACTIVITY',
        severity: 'HIGH',
        enabled: this.isCategoryEnabled('illegal'),
        description: 'Illegal activity references',
      },
    ];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROFANITY FILTERING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Filter profanity from content
   */
  private filterProfanity(content: string): {
    sanitizedText: string;
    wasFiltered: boolean;
    count: number;
  } {
    let sanitizedText = content;
    let count = 0;

    const profanityPatterns = [
      /\b(fuck|fucking|fucked|fucker|fck|f\*ck)\b/gi,
      /\b(shit|shitting|shitty|sh\*t)\b/gi,
      /\b(damn|damned|dammit)\b/gi,
      /\b(ass|asshole|arse)\b/gi,
      /\b(bitch|bitching)\b/gi,
      /\b(bastard|bastards)\b/gi,
      /\b(crap|crappy)\b/gi,
    ];

    for (const pattern of profanityPatterns) {
      const matches = sanitizedText.match(pattern);
      if (matches) {
        sanitizedText = sanitizedText.replace(pattern, '[FILTERED]');
        count += matches.length;
      }
    }

    return {
      sanitizedText,
      wasFiltered: count > 0,
      count,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOXICITY & SCORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Calculate toxicity score (0-100)
   */
  private async calculateToxicityScore(
    content: string,
    strictMode: boolean = false
  ): Promise<number> {
    try {
      let score = 0;
      const contentLower = content.toLowerCase();

      // Profanity (weight: 10-15 per occurrence)
      const profanityPatterns = [
        { pattern: /\b(fuck|shit|damn|hell|ass|bitch|bastard|crap)\b/gi, weight: 10 },
        { pattern: /\b(motherfucker|cocksucker|asshole)\b/gi, weight: 15 },
      ];

      for (const { pattern, weight } of profanityPatterns) {
        const matches = contentLower.match(pattern);
        if (matches) score += matches.length * weight;
      }

      // Insults (weight: 12 per occurrence)
      const insultPatterns = [/\b(idiot|stupid|dumb|moron|retard|loser)\b/gi];

      for (const pattern of insultPatterns) {
        const matches = contentLower.match(pattern);
        if (matches) score += matches.length * 12;
      }

      // Hate speech (weight: 20 per occurrence)
      const hatePatterns = [/\b(hate|despise|kill|die|death)\b/gi];

      for (const pattern of hatePatterns) {
        const matches = contentLower.match(pattern);
        if (matches) score += matches.length * 20;
      }

      // Aggressive tone indicators
      const capsWords = content.match(/\b[A-Z]{3,}\b/g);
      if (capsWords && capsWords.length > 3) score += Math.min(capsWords.length * 3, 20);

      // Excessive punctuation
      const excessivePunct = content.match(/[!?]{3,}/g);
      if (excessivePunct) score += excessivePunct.length * 5;

      // Repeated characters (e.g., "soooo")
      const repeatedChars = content.match(/(.)\1{3,}/g);
      if (repeatedChars && repeatedChars.length > 2) score += 5;

      // Apply strict mode multiplier
      if (strictMode) {
        score = Math.min(score * 1.5, 100);
      }

      return Math.min(Math.round(score), 100);
    } catch (error) {
      console.error('[ContentModerator] ❌ Error calculating toxicity:', error);
      return 0;
    }
  }

  /**
   * Calculate content safety score (0-100)
   */
  private calculateContentScore(
    flags: ModerationFlag[],
    toxicityScore: number,
    piiCount: number,
    modificationsCount: number
  ): number {
    let score = 100;

    // Deduct for flags based on severity
    const severityPenalty = { LOW: 5, MEDIUM: 15, HIGH: 30, CRITICAL: 50 };
    for (const flag of flags) {
      score -= severityPenalty[flag.severity];
    }

    // Deduct for toxicity (scaled)
    score -= toxicityScore * 0.3;

    // Deduct for PII presence
    score -= piiCount * 5;

    // Deduct for modifications (indicates problematic content)
    score -= Math.min(modificationsCount * 2, 20);

    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate risk level
   */
  private calculateRiskLevel(
    contentScore: number,
    toxicityScore: number,
    flags: ModerationFlag[]
  ): 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Check for critical flags
    const hasCriticalFlag = flags.some((f) => f.severity === 'CRITICAL');
    if (hasCriticalFlag) return 'CRITICAL';

    // Check for high flags
    const hasHighFlag = flags.some((f) => f.severity === 'HIGH');
    if (hasHighFlag || toxicityScore > 80) return 'HIGH';

    // Score-based risk
    if (contentScore < 30) return 'HIGH';
    if (contentScore < 50) return 'MEDIUM';
    if (contentScore < 70) return 'LOW';

    return 'SAFE';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONVENIENCE METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Sanitize response (main method for AI outputs)
   */
  public async sanitizeResponse(
    response: string,
    userId?: string,
    options?: Partial<ModerationContext>
  ): Promise<{ sanitized: string; isModified: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    const moderation = await this.moderateContent(response, {
      userId,
      isUserInput: false,
      checkModelNames: true,
      checkPII: true,
      checkMalicious: true,
      checkHarmful: true,
      checkToxicity: true,
      checkProfanity: false, // Usually don't filter AI responses for profanity
      ...options,
    });

    if (!moderation.isClean) {
      if (moderation.contentScore < this.MIN_SAFE_SCORE) {
        warnings.push(
          `Content safety score (${moderation.contentScore}) below threshold (${this.MIN_SAFE_SCORE})`
        );
      }
      if (moderation.flags.some((f) => f.severity === 'CRITICAL')) {
        warnings.push('Critical content flags detected');
      }
      if (moderation.riskLevel === 'HIGH' || moderation.riskLevel === 'CRITICAL') {
        warnings.push(`Risk level: ${moderation.riskLevel}`);
      }
    }

    if (moderation.removedEntities.length > 0) {
      const summary = moderation.removedEntities.map((e) => `${e.count} ${e.type}`).join(', ');
      warnings.push(`Removed: ${summary}`);
    }

    return {
      sanitized: moderation.sanitizedContent,
      isModified: moderation.metadata.modificationsCount > 0 || !moderation.isClean,
      warnings,
    };
  }

  /**
   * Quick validation for short messages
   */
  public isContentSafe(content: string): boolean {
    if (!content || content.length === 0) return false;
    if (content.length > 50000) return false;

    const quickPatterns = [
      /<script/i,
      /javascript:/i,
      /onclick=/i,
      /onerror=/i,
      /\bOR\b.*=.*\d/i,
      /\bAND\b.*=.*\d/i,
    ];

    return !quickPatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Batch moderate multiple contents
   */
  public async moderateMultiple(
    contents: string[],
    context?: ModerationContext
  ): Promise<ModerationResult[]> {
    return Promise.all(contents.map((content) => this.moderateContent(content, context)));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ERROR HANDLING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Create error result
   */
  private createErrorResult(content: string, startTime: number, error: any): ModerationResult {
    return {
      isClean: false,
      isToxic: false,
      hasPII: false,
      hasBlockedContent: false,
      hasMaliciousCode: false,
      hasHarmfulContent: false,
      contentScore: 0,
      toxicityScore: 0,
      riskLevel: 'CRITICAL',
      sanitizedContent: 'Content moderation error - blocked for safety',
      originalContent: content,
      flags: [
        {
          category: 'HARMFUL_CONTENT',
          severity: 'CRITICAL',
          reason: `Moderation system error: ${error?.message || 'Unknown error'}`,
          matched: '',
        },
      ],
      detectedIssues: [
        {
          type: 'HARMFUL_CONTENT',
          severity: 'CRITICAL',
          description: 'Moderation system encountered an error',
          detectedText: '',
          action: 'BLOCKED',
        },
      ],
      blockedModelNames: [],
      piiDetections: [],
      removedEntities: [],
      metadata: {
        processingTime: Date.now() - startTime,
        timestamp: new Date(),
        contentLength: content.length,
        modificationsCount: 0,
        cacheHit: false,
        configVersion: this.configSnapshot?.version ?? 'unknown',
      },
      recommendations: ['Content blocked due to moderation system error'],
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOGGING & ANALYTICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Log moderation event to database
   */
  private async logModerationEvent(result: ModerationResult, userId?: string): Promise<void> {
    try {
      const threatType = result.isToxic
        ? 'TOXIC_CONTENT'
        : result.hasBlockedContent
          ? 'MODEL_REVEAL'
          : result.hasPII
            ? 'PII_EXPOSURE'
            : result.hasMaliciousCode
              ? 'MALICIOUS_CODE'
              : result.hasHarmfulContent
                ? 'HARMFUL_CONTENT'
                : 'CONTENT_MODERATION';

      await this.prisma.securityLog.create({
        data: {
          userId: userId || null,
          ipAddress: 'unknown',
          threatType,
          severity:
            result.riskLevel === 'CRITICAL'
              ? 'HIGH'
              : result.riskLevel === 'HIGH'
                ? 'HIGH'
                : result.riskLevel === 'MEDIUM'
                  ? 'MEDIUM'
                  : 'LOW',
          riskScore: Math.round(result.toxicityScore),
          matchedPatterns: result.blockedModelNames,
          detectionMethod: ['CONTENT_MODERATION'],
          userInput: result.originalContent.substring(0, 1000),
          sanitizedInput: result.sanitizedContent.substring(0, 1000),
          wasBlocked: result.riskLevel === 'CRITICAL',
          flags: {
            isClean: result.isClean,
            isToxic: result.isToxic,
            hasPII: result.hasPII,
            hasBlockedContent: result.hasBlockedContent,
            hasMaliciousCode: result.hasMaliciousCode,
            hasHarmfulContent: result.hasHarmfulContent,
            modificationsCount: result.metadata.modificationsCount,
            riskLevel: result.riskLevel,
            contentScore: result.contentScore,
          },
        },
      });
    } catch (error) {
      console.error('[ContentModerator] ⚠️ Error logging moderation event:', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHE UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Generate cache key
   */
  private generateCacheKey(content: string, context: ModerationContext | any): string {
    const contentHash = this.simpleHash(content);
    const contextStr = JSON.stringify({
      isUserInput: context.isUserInput,
      checkModelNames: context.checkModelNames,
      checkToxicity: context.checkToxicity,
      checkPII: context.checkPII,
      checkMalicious: context.checkMalicious,
      checkHarmful: context.checkHarmful,
      checkProfanity: context.checkProfanity,
      redactPII: context.redactPII,
      strictMode: context.strictMode,
    });
    return `${contentHash}-${this.simpleHash(contextStr)}`;
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get from moderation cache
   */
  private getFromModerationCache(key: string): ModerationResult | null {
    const entry = this.moderationCache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.MODERATION_CACHE_TTL) {
      this.moderationCache.delete(key);
      return null;
    }

    // Mark as cache hit
    const result = { ...entry.result };
    result.metadata = { ...result.metadata, cacheHit: true };

    return result;
  }

  /**
   * Add to moderation cache
   */
  private addToModerationCache(key: string, result: ModerationResult): void {
    // Evict old entries if cache is full
    if (this.moderationCache.size >= this.CACHE_MAX_SIZE) {
      const entriesToRemove = Math.floor(this.CACHE_MAX_SIZE * 0.1); // Remove 10%
      const keys = Array.from(this.moderationCache.keys()).slice(0, entriesToRemove);
      keys.forEach((k) => this.moderationCache.delete(k));
    }

    this.moderationCache.set(key, { result, timestamp: Date.now() });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get service statistics
   */
  public getStats(): ModerationStats {
    return { ...this.stats };
  }

  /**
   * Get detailed analytics
   */
  public getAnalytics() {
    return {
      stats: this.getStats(),
      cacheInfo: this.getCacheInfo(),
      configuration: this.configSnapshot,
      performance: {
        averageProcessingTime: this.stats.averageProcessingTime,
        cacheHitRate:
          this.stats.totalModerated > 0
            ? ((this.stats.cacheHits / this.stats.totalModerated) * 100).toFixed(2) + '%'
            : '0%',
      },
    };
  }

  /**
   * Get cache info
   */
  public getCacheInfo() {
    return {
      blockedModels: {
        size: this.blockedModelsCache.size,
        loadedAt: this.cacheLoadedAt,
        isExpired: this.isCacheExpired(),
        expiresAt: this.cacheLoadedAt
          ? new Date(this.cacheLoadedAt.getTime() + this.CACHE_DURATION)
          : null,
      },
      moderation: {
        size: this.moderationCache.size,
        maxSize: this.CACHE_MAX_SIZE,
        ttl: this.MODERATION_CACHE_TTL,
      },
    };
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    const hitRate =
      this.stats.totalModerated > 0 ? this.stats.cacheHits / this.stats.totalModerated : 0;

    return {
      size: this.moderationCache.size,
      maxSize: this.CACHE_MAX_SIZE,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalModerated: 0,
      modelNamesBlocked: 0,
      piiDetected: 0,
      toxicContentBlocked: 0,
      maliciousCodeBlocked: 0,
      harmfulContentBlocked: 0,
      profanityFiltered: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageProcessingTime: 0,
      lastModeration: null,
    };
    console.log('[ContentModerator] 📊 Statistics reset');
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    console.log('[ContentModerator] 🧹 Cleaning up...');
    this.clearCache();
    await this.prisma.$disconnect();
    console.log('[ContentModerator] ✅ Cleanup complete');
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    message?: string;
  }> {
    const checks = {
      databaseConnected: false,
      cacheLoaded: false,
      configLoaded: false,
    };

    try {
      // Check database
      await this.prisma.$queryRaw`SELECT 1`;
      checks.databaseConnected = true;

      // Check cache
      checks.cacheLoaded = this.blockedModelsCache.size > 0;

      // Check config
      checks.configLoaded = this.configSnapshot !== null;

      const allHealthy = Object.values(checks).every((v) => v);
      const someHealthy = Object.values(checks).some((v) => v);

      return {
        status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
        checks,
        message: allHealthy ? 'All systems operational' : 'Some systems degraded',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        checks,
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const contentModeratorInstance = ContentModeratorService.getInstance();

export default contentModeratorInstance;
export { ContentModeratorService };
export const contentModerator = contentModeratorInstance;
