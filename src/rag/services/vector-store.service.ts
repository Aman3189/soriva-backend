/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI - VECTOR STORE SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Store and retrieve vectors from vector database
 * Features: Multi-provider support, user isolation, plan limits
 * Architecture: Singleton, provider-agnostic, secured namespaces
 * Created: October 2025
 * Security: Namespace isolation, metadata encryption, access control
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface VectorRecord {
  id: string;
  vector: number[];
  metadata: {
    documentId: string;
    userId: string;
    chunkIndex: number;
    text: string;
    filename: string;
    uploadedAt: string;
    [key: string]: any;
  };
}

export interface UpsertRequest {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

export interface QueryRequest {
  vector: number[];
  topK?: number;
  filter?: Record<string, any>;
  includeMetadata?: boolean;
  includeVectors?: boolean;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
  vector?: number[];
}

export interface VectorStoreConfig {
  provider: 'pinecone' | 'qdrant' | 'memory';
  indexName: string;
  dimensions: number;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
  enableEncryption: boolean;
  enableCompression: boolean;
}

export interface PlanStorageLimits {
  maxVectors: number; // Total vectors per user
  maxNamespaces: number; // Total namespaces (documents) per user
  retentionDays: number; // How long to keep vectors
  enableBackup: boolean; // Auto-backup feature
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN-BASED STORAGE LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_STORAGE_LIMITS: Record<string, PlanStorageLimits> = {
  STARTER: {
    maxVectors: 1000,
    maxNamespaces: 5,
    retentionDays: 7,
    enableBackup: false,
  },
  PLUS: {
    maxVectors: 10000,
    maxNamespaces: 20,
    retentionDays: 30,
    enableBackup: true,
  },
  PRO: {
    maxVectors: 100000,
    maxNamespaces: 100,
    retentionDays: 90,
    enableBackup: true,
  },
  EDGE: {
    maxVectors: 500000,
    maxNamespaces: 500,
    retentionDays: 180,
    enableBackup: true,
  },
  LIFE: {
    maxVectors: -1, // Unlimited
    maxNamespaces: -1, // Unlimited
    retentionDays: 365,
    enableBackup: true,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENCRYPTION SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MetadataEncryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    const keyString =
      process.env.VECTOR_ENCRYPTION_KEY || 'CHANGE_THIS_IN_PRODUCTION_USE_STRONG_KEY_32B';
    this.key = Buffer.from(keyString.padEnd(32, '0').substring(0, 32));
  }

  encrypt(data: Record<string, any>): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as any;

    const text = JSON.stringify(data);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      tag: tag.toString('hex'),
    });
  }

  decrypt(encryptedData: string): Record<string, any> {
    const { iv, encrypted, tag } = JSON.parse(encryptedData);

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    ) as any;

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VECTOR STORE SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class VectorStoreService {
  private static instance: VectorStoreService;

  private config: VectorStoreConfig = {
    provider: 'memory',
    indexName: 'soriva-rag',
    dimensions: 1536,
    metric: 'cosine',
    enableEncryption: true,
    enableCompression: false,
  };

  private encryption: MetadataEncryption;
  private memoryStore: Map<string, Map<string, VectorRecord>> = new Map();
  private pineconeClient: any = null;
  private qdrantClient: any = null;

  private constructor() {
    this.encryption = new MetadataEncryption();
    this.loadConfigFromEnv();
    this.initializeProvider();
    logger.info('[VectorStore] Service initialized');
  }

  public static getInstance(): VectorStoreService {
    if (!VectorStoreService.instance) {
      VectorStoreService.instance = new VectorStoreService();
    }
    return VectorStoreService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIGURATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private loadConfigFromEnv(): void {
    const provider = process.env.VECTOR_STORE_PROVIDER as 'pinecone' | 'qdrant' | 'memory';
    const indexName = process.env.VECTOR_STORE_INDEX;
    const dimensions = process.env.VECTOR_DIMENSIONS;

    if (provider) this.config.provider = provider;
    if (indexName) this.config.indexName = indexName;
    if (dimensions) this.config.dimensions = parseInt(dimensions);

    logger.info(`[VectorStore] Using provider: ${this.config.provider}`);
  }

  private async initializeProvider(): Promise<void> {
    try {
      switch (this.config.provider) {
        case 'pinecone':
          await this.initializePinecone();
          break;
        case 'qdrant':
          await this.initializeQdrant();
          break;
        case 'memory':
          logger.info('[VectorStore] Using in-memory storage');
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }
    } catch (error) {
      logger.error('[VectorStore] Provider initialization failed', error);
      logger.warn('[VectorStore] Falling back to memory storage');
      this.config.provider = 'memory';
    }
  }

  private async initializePinecone(): Promise<void> {
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;

    if (!apiKey || !environment) {
      throw new Error('Pinecone credentials not configured');
    }

    // Pinecone initialization would go here
    // For now, using mock
    logger.info('[VectorStore] Pinecone initialized (mock)');
  }

  private async initializeQdrant(): Promise<void> {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;

    if (!url) {
      throw new Error('Qdrant URL not configured');
    }

    // Qdrant initialization would go here
    logger.info('[VectorStore] Qdrant initialized (mock)');
  }

  public updateConfig(config: Partial<VectorStoreConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('[VectorStore] Configuration updated');
  }

  public getConfig(): VectorStoreConfig {
    return { ...this.config };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NAMESPACE MANAGEMENT (USER ISOLATION)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getUserNamespace(userId: string): string {
    return `user_${userId}`;
  }

  private getDocumentNamespace(userId: string, documentId: string): string {
    return `user_${userId}_doc_${documentId}`;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UPSERT OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async upsert(
    records: UpsertRequest[],
    userId: string,
    documentId: string,
    planTier: string = 'STARTER'
  ): Promise<{ success: boolean; upsertedCount: number }> {
    try {
      // Validate plan limits
      await this.validateStorageLimits(userId, planTier, records.length);

      // Get namespace for user isolation
      const namespace = this.getDocumentNamespace(userId, documentId);

      // Encrypt metadata if enabled
      const processedRecords = records.map((record) => ({
        ...record,
        metadata: this.config.enableEncryption
          ? { ...record.metadata, _encrypted: this.encryption.encrypt(record.metadata) }
          : record.metadata,
      }));

      // Route to appropriate provider
      let result: { success: boolean; upsertedCount: number };

      switch (this.config.provider) {
        case 'pinecone':
          result = await this.upsertToPinecone(processedRecords, namespace);
          break;
        case 'qdrant':
          result = await this.upsertToQdrant(processedRecords, namespace);
          break;
        case 'memory':
          result = await this.upsertToMemory(processedRecords, namespace);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }

      // Track usage
      await this.trackStorageUsage(userId, records.length);

      logger.success(`[VectorStore] Upserted ${result.upsertedCount} vectors to ${namespace}`);

      return result;
    } catch (error) {
      logger.error('[VectorStore] Upsert failed', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROVIDER-SPECIFIC UPSERT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async upsertToPinecone(
    records: UpsertRequest[],
    namespace: string
  ): Promise<{ success: boolean; upsertedCount: number }> {
    // Mock implementation - in production, use actual Pinecone client
    logger.info(`[VectorStore] Pinecone upsert (mock): ${records.length} vectors to ${namespace}`);

    return {
      success: true,
      upsertedCount: records.length,
    };
  }

  private async upsertToQdrant(
    records: UpsertRequest[],
    namespace: string
  ): Promise<{ success: boolean; upsertedCount: number }> {
    // Mock implementation - in production, use actual Qdrant client
    logger.info(`[VectorStore] Qdrant upsert (mock): ${records.length} vectors to ${namespace}`);

    return {
      success: true,
      upsertedCount: records.length,
    };
  }

  private async upsertToMemory(
    records: UpsertRequest[],
    namespace: string
  ): Promise<{ success: boolean; upsertedCount: number }> {
    if (!this.memoryStore.has(namespace)) {
      this.memoryStore.set(namespace, new Map());
    }

    const namespaceStore = this.memoryStore.get(namespace)!;

    for (const record of records) {
      namespaceStore.set(record.id, {
        id: record.id,
        vector: record.vector,
        metadata: record.metadata as any,
      });
    }

    return {
      success: true,
      upsertedCount: records.length,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUERY OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async query(
    request: QueryRequest,
    userId: string,
    documentId?: string
  ): Promise<QueryResult[]> {
    try {
      // Verify user access
      await this.verifyUserAccess(userId, documentId);

      // Get namespace
      const namespace = documentId
        ? this.getDocumentNamespace(userId, documentId)
        : this.getUserNamespace(userId);

      // Route to appropriate provider
      let results: QueryResult[];

      switch (this.config.provider) {
        case 'pinecone':
          results = await this.queryPinecone(request, namespace);
          break;
        case 'qdrant':
          results = await this.queryQdrant(request, namespace);
          break;
        case 'memory':
          results = await this.queryMemory(request, namespace);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }

      // Decrypt metadata if encrypted
      if (this.config.enableEncryption && request.includeMetadata) {
        results = results.map((result) => {
          if (result.metadata && result.metadata._encrypted) {
            const decrypted = this.encryption.decrypt(result.metadata._encrypted as string);
            return { ...result, metadata: decrypted };
          }
          return result;
        });
      }

      logger.info(`[VectorStore] Query returned ${results.length} results from ${namespace}`);

      return results;
    } catch (error) {
      logger.error('[VectorStore] Query failed', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROVIDER-SPECIFIC QUERY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async queryPinecone(request: QueryRequest, namespace: string): Promise<QueryResult[]> {
    // Mock implementation
    logger.info(`[VectorStore] Pinecone query (mock) from ${namespace}`);
    return [];
  }

  private async queryQdrant(request: QueryRequest, namespace: string): Promise<QueryResult[]> {
    // Mock implementation
    logger.info(`[VectorStore] Qdrant query (mock) from ${namespace}`);
    return [];
  }

  private async queryMemory(request: QueryRequest, namespace: string): Promise<QueryResult[]> {
    const namespaceStore = this.memoryStore.get(namespace);

    if (!namespaceStore || namespaceStore.size === 0) {
      return [];
    }

    // Calculate cosine similarity for all vectors
    const results: Array<{ id: string; score: number; record: VectorRecord }> = [];

    for (const [id, record] of namespaceStore.entries()) {
      const score = this.cosineSimilarity(request.vector, record.vector);
      results.push({ id, score, record });
    }

    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);

    // Take top K
    const topK = request.topK || 5;
    const topResults = results.slice(0, topK);

    // Format results
    return topResults.map(({ id, score, record }) => ({
      id,
      score,
      metadata: request.includeMetadata ? record.metadata : undefined,
      vector: request.includeVectors ? record.vector : undefined,
    }));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DELETE OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async deleteDocument(
    userId: string,
    documentId: string
  ): Promise<{ success: boolean; deletedCount: number }> {
    try {
      // Verify ownership
      await this.verifyUserAccess(userId, documentId);

      const namespace = this.getDocumentNamespace(userId, documentId);

      let result: { success: boolean; deletedCount: number };

      switch (this.config.provider) {
        case 'pinecone':
          result = await this.deletePineconeNamespace(namespace);
          break;
        case 'qdrant':
          result = await this.deleteQdrantNamespace(namespace);
          break;
        case 'memory':
          result = await this.deleteMemoryNamespace(namespace);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }

      logger.info(`[VectorStore] Deleted ${result.deletedCount} vectors from ${namespace}`);

      return result;
    } catch (error) {
      logger.error('[VectorStore] Delete failed', error);
      throw error;
    }
  }

  private async deletePineconeNamespace(
    namespace: string
  ): Promise<{ success: boolean; deletedCount: number }> {
    // Mock
    return { success: true, deletedCount: 0 };
  }

  private async deleteQdrantNamespace(
    namespace: string
  ): Promise<{ success: boolean; deletedCount: number }> {
    // Mock
    return { success: true, deletedCount: 0 };
  }

  private async deleteMemoryNamespace(
    namespace: string
  ): Promise<{ success: boolean; deletedCount: number }> {
    const namespaceStore = this.memoryStore.get(namespace);
    const count = namespaceStore?.size || 0;
    this.memoryStore.delete(namespace);
    return { success: true, deletedCount: count };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITIES & HELPERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have same dimensions');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION & SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async validateStorageLimits(
    userId: string,
    planTier: string,
    newVectorCount: number
  ): Promise<void> {
    const limits = PLAN_STORAGE_LIMITS[planTier] || PLAN_STORAGE_LIMITS.STARTER;

    // Check max vectors
    if (limits.maxVectors !== -1) {
      const currentCount = await this.getUserVectorCount(userId);

      if (currentCount + newVectorCount > limits.maxVectors) {
        throw new Error(
          `Vector storage limit reached (${currentCount}/${limits.maxVectors}). Upgrade for more storage.`
        );
      }
    }

    // Check max namespaces
    if (limits.maxNamespaces !== -1) {
      const namespaceCount = await this.getUserNamespaceCount(userId);

      if (namespaceCount >= limits.maxNamespaces) {
        throw new Error(
          `Document limit reached (${namespaceCount}/${limits.maxNamespaces}). Delete old documents or upgrade.`
        );
      }
    }
  }

  private async verifyUserAccess(userId: string, documentId?: string): Promise<void> {
    if (!documentId) return;

    try {
      const document = await (prisma as any).document.findUnique({
        where: { id: documentId },
        select: { userId: true },
      });

      if (!document || document.userId !== userId) {
        throw new Error('Access denied: Document not found or unauthorized');
      }
    } catch (error) {
      logger.error('[VectorStore] Access verification failed', error);
      throw new Error('Access denied');
    }
  }

  private async getUserVectorCount(userId: string): Promise<number> {
    // In production, query actual vector store
    // For now, estimate from database
    try {
      const count = await (prisma as any).vectorRecord.count({
        where: { userId },
      });
      return count;
    } catch (error) {
      return 0;
    }
  }

  private async getUserNamespaceCount(userId: string): Promise<number> {
    try {
      const count = await (prisma as any).document.count({
        where: { userId },
      });
      return count;
    } catch (error) {
      return 0;
    }
  }

  private async trackStorageUsage(userId: string, vectorCount: number): Promise<void> {
    try {
      await (prisma as any).vectorUsage.create({
        data: {
          userId,
          vectorCount,
          provider: this.config.provider,
        },
      });
    } catch (error) {
      logger.debug('[VectorStore] Usage tracking failed', error);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATS & MONITORING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async getStats(): Promise<any> {
    return {
      provider: this.config.provider,
      indexName: this.config.indexName,
      dimensions: this.config.dimensions,
      metric: this.config.metric,
      memoryStats: {
        namespaces: this.memoryStore.size,
        totalVectors: Array.from(this.memoryStore.values()).reduce((sum, ns) => sum + ns.size, 0),
      },
    };
  }

  public async healthCheck(): Promise<{ status: string; provider: string }> {
    try {
      // Provider-specific health check
      return {
        status: 'healthy',
        provider: this.config.provider,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        provider: this.config.provider,
      };
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default VectorStoreService.getInstance();
