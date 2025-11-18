// src/config/rate-limiter.config.ts
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * ==========================================
 * RATE LIMITER CONFIGURATION - SORIVA V2
 * ==========================================
 * Class-based rate limiter configuration
 * Matches existing backend architecture
 * Last Updated: November 18, 2025
 */

/**
 * Rate Limiter Manager - Class-based implementation
 */
class RateLimiterManager {
  /**
   * Custom handler for rate limit exceeded
   */
  private rateLimitHandler(req: Request, res: Response): void {
    console.warn(`⚠️ Rate limit exceeded - IP: ${req.ip}, Path: ${req.path}`);

    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: res.getHeader('Retry-After'),
    });
  }

  /**
   * Key generator - Use user ID if authenticated, otherwise IP
   */
  private keyGenerator(req: Request): string {
    const user = (req as any).user;
    return user?.id || req.ip || 'unknown';
  }

  /**
   * Get strict authentication rate limiter
   * For: /register, /login
   * Limit: 5 requests per 15 minutes
   */
  public getStrictAuthLimiter(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Only 5 attempts per 15 minutes
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: this.rateLimitHandler,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    });
  }

  /**
   * Get OAuth rate limiter
   * For: /google, /github, /callback
   * Limit: 10 requests per 15 minutes
   */
  public getOAuthLimiter(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: 'Too many OAuth attempts. Please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: this.rateLimitHandler,
    });
  }

  /**
   * Get AI chat rate limiter
   * For: /chat routes
   * Limit: 20 requests per minute
   */
  public getAIChatLimiter(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 20,
      message: 'Too many AI requests. Please slow down.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: this.rateLimitHandler,
      keyGenerator: this.keyGenerator,
    });
  }

  /**
   * Get general API rate limiter
   * For: All other API routes
   * Limit: 100 requests per 15 minutes
   */
  public getGeneralApiLimiter(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests. Please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: this.rateLimitHandler,
    });
  }

  /**
   * Get document upload rate limiter
   * For: /documents/upload
   * Limit: 50 requests per hour
   */
  public getDocumentUploadLimiter(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50,
      message: 'Too many document uploads. Please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: this.rateLimitHandler,
      keyGenerator: this.keyGenerator,
    });
  }

  /**
   * Get booster purchase rate limiter
   * For: /billing/booster
   * Limit: 20 requests per hour
   */
  public getBoosterPurchaseLimiter(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 20,
      message: 'Too many booster requests. Please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: this.rateLimitHandler,
      keyGenerator: this.keyGenerator,
    });
  }

  /**
   * Get admin/audit rate limiter
   * For: /audit routes
   * Limit: 100 requests per 15 minutes
   */
  public getAdminLimiter(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many admin requests.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: this.rateLimitHandler,
      keyGenerator: this.keyGenerator,
    });
  }
}

/**
 * Create singleton instance
 */
const rateLimiterManager = new RateLimiterManager();

/**
 * Export rate limiters for use in routes
 */
export const strictAuthLimiter = rateLimiterManager.getStrictAuthLimiter();
export const oauthLimiter = rateLimiterManager.getOAuthLimiter();
export const aiChatLimiter = rateLimiterManager.getAIChatLimiter();
export const generalApiLimiter = rateLimiterManager.getGeneralApiLimiter();
export const documentUploadLimiter = rateLimiterManager.getDocumentUploadLimiter();
export const boosterPurchaseLimiter = rateLimiterManager.getBoosterPurchaseLimiter();
export const adminLimiter = rateLimiterManager.getAdminLimiter();

/**
 * Export manager class for advanced usage
 */
export default RateLimiterManager;