/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA V2 - Cache Middleware (Class-Based Architecture)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Class-based response caching middleware with AI delay support
 * Author: Risenex Global (Aman Singh)
 * Architecture: Singleton Class Pattern
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import CacheService from '../services/cache.service';
import { CacheNamespace, CacheTTL } from '../types/cache.types';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AI ENDPOINT CONFIGURATION
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AI endpoints require artificial delay for natural user experience
 * - Chat completions: 2-3 second delay
 * - Document analysis: 2-3 second delay
 * - Orbit AI: 2-3 second delay
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
const AI_ENDPOINTS = [
  '/api/chat',
  '/api/ai/complete',
  '/api/orbit',
  '/api/documents/analyze'
];

const AI_DELAY_MIN = 2000; // 2 seconds
const AI_DELAY_MAX = 3000; // 3 seconds

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Cache Middleware Options Interface
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export interface CacheMiddlewareOptions {
  namespace?: CacheNamespace;
  ttl?: number;
  skipCache?: boolean;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  aiDelay?: boolean; // Enable AI-style delay for this endpoint
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Cache Statistics Interface
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  totalRequests: number;
  hitRate: number;
  lastReset: Date;
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CLASS: CacheMiddleware
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Singleton class managing response caching with AI delay support
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export class CacheMiddleware {
  private static instance: CacheMiddleware;
  private cacheService: CacheService;
  private stats: CacheStats;

  /**
   * Private constructor for Singleton pattern
   */
  private constructor() {
    this.cacheService = cacheService;
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
      hitRate: 0,
      lastReset: new Date()
    };
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Get singleton instance
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  public static getInstance(): CacheMiddleware {
    if (!CacheMiddleware.instance) {
      CacheMiddleware.instance = new CacheMiddleware();
    }
    return CacheMiddleware.instance;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * MAIN CACHE MIDDLEWARE
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Creates Express middleware with specified caching options
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  public cache(options: CacheMiddlewareOptions = {}) {
    const {
      namespace = 'api',
      ttl = CacheTTL.SHORT,
      skipCache = false,
      keyGenerator = this.defaultKeyGenerator,
      condition = () => true,
      aiDelay = this.isAIEndpoint.bind(this)
    } = options;

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
          return next();
        }

        // Skip if condition not met
        if (!condition(req)) {
          return next();
        }

        // Skip if explicitly disabled
        if (skipCache || req.query.nocache === 'true') {
          return next();
        }

        // Generate cache key
        const cacheKey = keyGenerator(req);
        const fullKey = `${namespace}:${cacheKey}`;

        // Increment total requests
        this.stats.totalRequests++;

        // Try to get from cache
        const cachedResponse = await this.cacheService.get<any>(fullKey);

        if (cachedResponse) {
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          // CACHE HIT - Apply AI delay if needed
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          this.stats.hits++;
          this.updateHitRate();

          // Check if AI delay should be applied
          const shouldDelayResponse = typeof aiDelay === 'function' 
            ? aiDelay(req) 
            : aiDelay && this.isAIEndpoint(req);

          if (shouldDelayResponse) {
            // Apply artificial delay for AI endpoints (natural UX)
            await this.applyAIDelay();
          }

          // Set cache headers
          res.setHeader('X-Cache-Status', 'HIT');
          res.setHeader('X-Cache-Key', fullKey);
          
          // Send cached response
          res.status(cachedResponse.statusCode || 200).json(cachedResponse.data);
          return;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // CACHE MISS - Intercept response
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this.stats.misses++;
        this.updateHitRate();

        // Store original res.json
        const originalJson = res.json.bind(res);

        // Override res.json to cache response
        res.json = (body: any) => {
          // Only cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            this.cacheService.set(
              fullKey,
              {
                data: body,
                statusCode: res.statusCode,
                timestamp: Date.now()
              },
              { ttl }
            ).catch((err: any) => {
              console.error('[CacheMiddleware] Failed to cache response:', err);
              this.stats.errors++;
            });
          }

          // Set cache headers
          res.setHeader('X-Cache-Status', 'MISS');
          res.setHeader('X-Cache-Key', fullKey);

          // Call original json method
          return originalJson(body);
        };

        next();
      } catch (error) {
        console.error('[CacheMiddleware] Error:', error);
        this.stats.errors++;
        next();
      }
    };
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Check if endpoint is AI-related
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private isAIEndpoint(req: Request): boolean {
    return AI_ENDPOINTS.some(endpoint => req.path.startsWith(endpoint));
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Apply AI-style delay (2-3 seconds random)
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private async applyAIDelay(): Promise<void> {
    const delay = Math.floor(
      Math.random() * (AI_DELAY_MAX - AI_DELAY_MIN + 1) + AI_DELAY_MIN
    );
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Default cache key generator
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private defaultKeyGenerator(req: Request): string {
    const userId = (req as any).user?.id || 'anonymous';
    const path = req.path;
    const query = JSON.stringify(req.query);
    return `${userId}:${path}:${query}`;
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Update hit rate statistic
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = (this.stats.hits / this.stats.totalRequests) * 100;
    }
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * UTILITY METHODS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
      hitRate: 0,
      lastReset: new Date()
    };
  }

  /**
   * Invalidate cache by pattern
   */
  public async invalidate(pattern: string): Promise<number> {
    try {
      return await this.cacheService.clear(pattern);
    } catch (error) {
      console.error('[CacheMiddleware] Invalidation error:', error);
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  public async clearAll(): Promise<boolean> {
    try {
      await this.cacheService.clear();
      this.resetStats();
      return true;
    } catch (error) {
      console.error('[CacheMiddleware] Clear error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * HELPER MIDDLEWARE CREATORS
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * User-specific caching
   */
  public cacheByUser(ttl: number = CacheTTL.SHORT) {
    return this.cache({
      namespace: CacheNamespace.USER, 
      ttl,
      keyGenerator: (req) => {
        const userId = (req as any).user?.id || 'anonymous';
        return `${userId}:${req.path}:${JSON.stringify(req.query)}`;
      }
    });
  }

  /**
   * Public data caching (no user-specific)
   */
  public cachePublic(ttl: number = CacheTTL.MEDIUM) {
    return this.cache({
      namespace: CacheNamespace.PUBLIC,

      ttl,
      keyGenerator: (req) => `${req.path}:${JSON.stringify(req.query)}`
    });
  }

  /**
   * AI endpoint caching with delay
   */
  public cacheAIResponse(ttl: number = CacheTTL.SHORT) {
    return this.cache({
      namespace: CacheNamespace.AI,
      ttl,
      aiDelay: true,
      keyGenerator: (req) => {
        const userId = (req as any).user?.id || 'anonymous';
        const conversationId = req.body?.conversationId || 'default';
        return `${userId}:${conversationId}:${req.path}`;
      }
    });
  }

  /**
   * Document-specific caching
   */
  public cacheDocument(ttl: number = CacheTTL.LONG) {
    return this.cache({
      namespace: CacheNamespace.DOCUMENT,
      ttl,
      keyGenerator: (req) => {
        const userId = (req as any).user?.id || 'anonymous';
        const docId = req.params.id || req.query.id || 'unknown';
        return `${userId}:${docId}:${req.path}`;
      }
    });
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SINGLETON EXPORT
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export const cacheMiddleware = CacheMiddleware.getInstance();

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * USAGE EXAMPLES:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * // Basic caching
 * router.get('/profile', cacheMiddleware.cacheByUser(), getProfile);
 * 
 * // Public data caching
 * router.get('/plans', cacheMiddleware.cachePublic(CacheTTL.LONG), getPlans);
 * 
 * // AI endpoint with delay
 * router.post('/chat', cacheMiddleware.cacheAIResponse(), handleChat);
 * 
 * // Custom caching
 * router.get('/data', cacheMiddleware.cache({
 *   namespace: 'custom',
 *   ttl: 300,
 *   condition: (req) => req.query.cache !== 'false'
 * }), getData);
 * 
 * // Get statistics
 * const stats = cacheMiddleware.getStats();
 * 
 * // Invalidate cache
 * await cacheMiddleware.invalidate('user:123:*');
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */