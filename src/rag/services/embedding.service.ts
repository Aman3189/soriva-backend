/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI - EMBEDDING SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Generate vector embeddings for RAG system
 * Features: Batch processing, caching, multiple providers
 * Architecture: Singleton, provider-agnostic, plan-based limits
 * Created: October 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface EmbeddingVector {
  text: string;
  vector: number[];
  dimensions: number;
  model: string;
  provider: string;
  metadata?: Record<string, any>;
}

export interface EmbeddingRequest {
  text: string;
  metadata?: Record<string, any>;
}

export interface BatchEmbeddingRequest {
  texts: string[];
  batchSize?: number;
  metadata?: Record<string, any>;
}

export interface BatchEmbeddingResult {
  embeddings: EmbeddingVector[];
  processingTime: number;
  batchesProcessed: number;
  tokensUsed: number;
  provider: string;
}

export interface EmbeddingConfig {
  provider: 'voyage' | 'openai' | 'local';
  model: string;
  dimensions: number;
  batchSize: number;
  maxTokensPerRequest: number;
  enableCache: boolean;
}

export interface PlanEmbeddingLimits {
  maxEmbeddingsPerDay: number;
  maxBatchSize: number;
  allowedProviders: Array<'voyage' | 'openai' | 'local'>;
  preferredModel: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN-BASED LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_EMBEDDING_LIMITS: Record<string, PlanEmbeddingLimits> = {
  STARTER: {
    maxEmbeddingsPerDay: 1000,
    maxBatchSize: 10,
    allowedProviders: ['local'],
    preferredModel: 'all-MiniLM-L6-v2',
  },
  PLUS: {
    maxEmbeddingsPerDay: 10000,
    maxBatchSize: 50,
    allowedProviders: ['local', 'voyage'],
    preferredModel: 'voyage-2',
  },
  PRO: {
    maxEmbeddingsPerDay: 100000,
    maxBatchSize: 100,
    allowedProviders: ['local', 'voyage', 'openai'],
    preferredModel: 'voyage-2',
  },
  EDGE: {
    maxEmbeddingsPerDay: 500000,
    maxBatchSize: 200,
    allowedProviders: ['local', 'voyage', 'openai'],
    preferredModel: 'text-embedding-3-large',
  },
  LIFE: {
    maxEmbeddingsPerDay: -1, // Unlimited
    maxBatchSize: 500,
    allowedProviders: ['local', 'voyage', 'openai'],
    preferredModel: 'text-embedding-3-large',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EMBEDDING SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class EmbeddingService {
  private static instance: EmbeddingService;

  private config: EmbeddingConfig = {
    provider: 'voyage',
    model: 'voyage-2',
    dimensions: 1024,
    batchSize: 50,
    maxTokensPerRequest: 8000,
    enableCache: true,
  };

  private cache: Map<string, EmbeddingVector> = new Map();
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  private constructor() {
    logger.info('[EmbeddingService] Service initialized');
    this.loadConfigFromEnv();
  }

  public static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIGURATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private loadConfigFromEnv(): void {
    const provider = process.env.EMBEDDING_PROVIDER as 'voyage' | 'openai' | 'local';
    const model = process.env.EMBEDDING_MODEL;

    if (provider) this.config.provider = provider;
    if (model) this.config.model = model;

    // Set dimensions based on model
    this.config.dimensions = this.getModelDimensions(this.config.model);

    logger.info(
      `[EmbeddingService] Using provider: ${this.config.provider}, model: ${this.config.model}`
    );
  }

  private getModelDimensions(model: string): number {
    const dimensionsMap: Record<string, number> = {
      'voyage-2': 1024,
      'voyage-large-2': 1536,
      'text-embedding-3-small': 1536,
      'text-embedding-3-large': 3072,
      'text-embedding-ada-002': 1536,
      'all-MiniLM-L6-v2': 384,
    };

    return dimensionsMap[model] || 1536;
  }

  public updateConfig(config: Partial<EmbeddingConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('[EmbeddingService] Configuration updated');
  }

  public getConfig(): EmbeddingConfig {
    return { ...this.config };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SINGLE EMBEDDING GENERATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async generateEmbedding(
    request: EmbeddingRequest,
    userId?: string,
    planTier: string = 'STARTER'
  ): Promise<EmbeddingVector> {
    try {
      // Validate plan limits
      if (userId) {
        await this.validatePlanLimits(userId, planTier, 1);
      }

      // Check cache first
      if (this.config.enableCache) {
        const cached = this.getFromCache(request.text);
        if (cached) {
          this.cacheHits++;
          logger.debug('[EmbeddingService] Cache hit');
          return cached;
        }
        this.cacheMisses++;
      }

      // Generate embedding
      const embedding = await this.generateEmbeddingInternal(request.text, request.metadata);

      // Cache result
      if (this.config.enableCache) {
        this.addToCache(request.text, embedding);
      }

      // Track usage
      if (userId) {
        await this.trackEmbeddingUsage(userId, 1);
      }

      return embedding;
    } catch (error) {
      logger.error('[EmbeddingService] Embedding generation failed', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BATCH EMBEDDING GENERATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async generateBatchEmbeddings(
    request: BatchEmbeddingRequest,
    userId?: string,
    planTier: string = 'STARTER'
  ): Promise<BatchEmbeddingResult> {
    const startTime = Date.now();

    try {
      const limits = PLAN_EMBEDDING_LIMITS[planTier] || PLAN_EMBEDDING_LIMITS.STARTER;
      const texts = request.texts;

      // Validate plan limits
      if (userId) {
        await this.validatePlanLimits(userId, planTier, texts.length);
      }

      // Determine batch size
      const batchSize = Math.min(request.batchSize || this.config.batchSize, limits.maxBatchSize);

      logger.info(
        `[EmbeddingService] Generating ${texts.length} embeddings in batches of ${batchSize}`
      );

      // Process in batches
      const embeddings: EmbeddingVector[] = [];
      const batches = this.createBatches(texts, batchSize);
      let batchesProcessed = 0;
      let tokensUsed = 0;

      for (const batch of batches) {
        const batchEmbeddings = await this.processBatch(batch, request.metadata);
        embeddings.push(...batchEmbeddings);

        batchesProcessed++;
        tokensUsed += this.estimateTokens(batch);

        // Small delay between batches to avoid rate limits
        if (batchesProcessed < batches.length) {
          await this.delay(100);
        }
      }

      // Track usage
      if (userId) {
        await this.trackEmbeddingUsage(userId, texts.length);
      }

      const processingTime = Date.now() - startTime;

      logger.success(
        `[EmbeddingService] Generated ${embeddings.length} embeddings in ${processingTime}ms`
      );

      return {
        embeddings,
        processingTime,
        batchesProcessed,
        tokensUsed,
        provider: this.config.provider,
      };
    } catch (error) {
      logger.error('[EmbeddingService] Batch embedding generation failed', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROVIDER-SPECIFIC IMPLEMENTATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async generateEmbeddingInternal(
    text: string,
    metadata?: Record<string, any>
  ): Promise<EmbeddingVector> {
    switch (this.config.provider) {
      case 'voyage':
        return this.generateVoyageEmbedding(text, metadata);

      case 'openai':
        return this.generateOpenAIEmbedding(text, metadata);

      case 'local':
        return this.generateLocalEmbedding(text, metadata);

      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async generateVoyageEmbedding(
    text: string,
    metadata?: Record<string, any>
  ): Promise<EmbeddingVector> {
    try {
      const apiKey = process.env.VOYAGE_API_KEY;

      if (!apiKey) {
        throw new Error('VOYAGE_API_KEY not configured');
      }

      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: this.config.model,
        }),
      });

      if (!response.ok) {
        throw new Error(`Voyage API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const vector = data.data[0].embedding;

      return {
        text,
        vector,
        dimensions: vector.length,
        model: this.config.model,
        provider: 'voyage',
        metadata,
      };
    } catch (error) {
      logger.error('[EmbeddingService] Voyage embedding failed', error);
      throw error;
    }
  }

  private async generateOpenAIEmbedding(
    text: string,
    metadata?: Record<string, any>
  ): Promise<EmbeddingVector> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: this.config.model,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const vector = data.data[0].embedding;

      return {
        text,
        vector,
        dimensions: vector.length,
        model: this.config.model,
        provider: 'openai',
        metadata,
      };
    } catch (error) {
      logger.error('[EmbeddingService] OpenAI embedding failed', error);
      throw error;
    }
  }

  private async generateLocalEmbedding(
    text: string,
    metadata?: Record<string, any>
  ): Promise<EmbeddingVector> {
    // Placeholder for local embedding model
    // In production, use transformers.js or similar

    logger.warn('[EmbeddingService] Local embeddings not implemented - using mock');

    // Generate deterministic mock vector for testing
    const dimensions = this.config.dimensions;
    const vector = Array.from({ length: dimensions }, (_, i) => {
      return Math.sin(text.charCodeAt(i % text.length) + i) * 0.5;
    });

    return {
      text,
      vector,
      dimensions,
      model: 'local-mock',
      provider: 'local',
      metadata,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BATCH PROCESSING HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return batches;
  }

  private async processBatch(
    texts: string[],
    metadata?: Record<string, any>
  ): Promise<EmbeddingVector[]> {
    const embeddings: EmbeddingVector[] = [];

    // Process each text in parallel
    const promises = texts.map((text) => this.generateEmbeddingInternal(text, metadata));

    const results = await Promise.all(promises);
    embeddings.push(...results);

    return embeddings;
  }

  private estimateTokens(texts: string[]): number {
    // Rough estimation: ~4 characters per token
    const totalChars = texts.reduce((sum, text) => sum + text.length, 0);
    return Math.ceil(totalChars / 4);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CACHING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getCacheKey(text: string): string {
    // Create hash of text for cache key
    const hash = this.simpleHash(text);
    return `${this.config.provider}:${this.config.model}:${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getFromCache(text: string): EmbeddingVector | null {
    const key = this.getCacheKey(text);
    return this.cache.get(key) || null;
  }

  private addToCache(text: string, embedding: EmbeddingVector): void {
    const key = this.getCacheKey(text);

    // Limit cache size
    if (this.cache.size > 10000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, embedding);
  }

  public clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    logger.info('[EmbeddingService] Cache cleared');
  }

  public getCacheStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.cacheHits + this.cacheMisses;
    const hitRate = total > 0 ? (this.cacheHits / total) * 100 : 0;

    return {
      size: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PLAN VALIDATION & USAGE TRACKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async validatePlanLimits(
    userId: string,
    planTier: string,
    embeddingCount: number
  ): Promise<void> {
    const limits = PLAN_EMBEDDING_LIMITS[planTier] || PLAN_EMBEDDING_LIMITS.STARTER;

    // Check provider allowed
    if (!limits.allowedProviders.includes(this.config.provider)) {
      throw new Error(
        `Provider ${this.config.provider} not allowed for ${planTier} plan. Upgrade to access.`
      );
    }

    // Check daily limit
    if (limits.maxEmbeddingsPerDay !== -1) {
      const todayUsage = await this.getTodayUsage(userId);

      if (todayUsage + embeddingCount > limits.maxEmbeddingsPerDay) {
        throw new Error(
          `Daily embedding limit reached (${todayUsage}/${limits.maxEmbeddingsPerDay}). Upgrade for more.`
        );
      }
    }

    // Check batch size
    if (embeddingCount > limits.maxBatchSize) {
      throw new Error(
        `Batch size (${embeddingCount}) exceeds plan limit (${limits.maxBatchSize}). Upgrade or reduce batch size.`
      );
    }
  }

  private async getTodayUsage(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usage = await (prisma as any).embeddingUsage.aggregate({
        where: {
          userId,
          createdAt: { gte: today },
        },
        _sum: {
          embeddingCount: true,
        },
      });

      return usage._sum.embeddingCount || 0;
    } catch (error) {
      // Table might not exist yet
      logger.debug('[EmbeddingService] Usage tracking not available');
      return 0;
    }
  }

  private async trackEmbeddingUsage(userId: string, count: number): Promise<void> {
    try {
      await (prisma as any).embeddingUsage.create({
        data: {
          userId,
          embeddingCount: count,
          provider: this.config.provider,
          model: this.config.model,
        },
      });
    } catch (error) {
      // Non-critical - just log
      logger.debug('[EmbeddingService] Usage tracking failed', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async healthCheck(): Promise<{ status: string; provider: string; model: string }> {
    try {
      // Try generating a test embedding
      const testText = 'Health check test';
      await this.generateEmbeddingInternal(testText);

      return {
        status: 'healthy',
        provider: this.config.provider,
        model: this.config.model,
      };
    } catch (error) {
      logger.error('[EmbeddingService] Health check failed', error);
      return {
        status: 'unhealthy',
        provider: this.config.provider,
        model: this.config.model,
      };
    }
  }

  public getStats(): any {
    return {
      provider: this.config.provider,
      model: this.config.model,
      dimensions: this.config.dimensions,
      cache: this.getCacheStats(),
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default EmbeddingService.getInstance();
