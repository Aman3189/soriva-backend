// src/middleware/rateLimiter.middleware.ts

/**
 * ==========================================
 * RATE LIMITER MIDDLEWARE
 * ==========================================
 * Express middleware for rate limiting
 * Integrates with RateLimiter service
 * Created by: Amandeep, Punjab, India
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../services/rateLimiter.service';
import { PlanType } from '../constants/plans';

// ==========================================
// MIDDLEWARE CLASS
// ==========================================

export class RateLimiterMiddleware {
  /**
   * Main rate limiter middleware
   * Checks tokens + request rate
   */
  static async checkLimits(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract user info - adjust based on your auth structure
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      const planType = user?.planType || PlanType.STARTER;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Estimate tokens from message
      const tokensEstimated = RateLimiterMiddleware.estimateTokens(req.body);

      // Check rate limits
      const result = await rateLimiter.checkRateLimit(
        userId,
        planType,
        'chat',
        { tokensEstimated }
      );

      if (!result.success) {
        // Rate limit exceeded
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: result.blockReason,
          limits: result.checks.map((check) => ({
            type: check.limitType,
            current: check.current,
            limit: check.limit,
            remaining: check.remaining,
            resetAt: check.resetAt,
            retryAfter: check.retryAfter,
          })),
        });
        return;
      }

      // Check for warning threshold (85%)
      const warning = await rateLimiter.checkWarningThreshold(userId, planType);
      if (warning.warning) {
        res.setHeader('X-Rate-Limit-Warning', 'true');
        res.setHeader('X-Rate-Limit-Warning-Type', warning.type);
        res.setHeader('X-Rate-Limit-Warning-Percentage', warning.percentage.toString());
      }

      // Set rate limit headers
      // Set rate limit headers
      const tokenCheck = result.checks.find((c) => c.limitType === 'tokens_monthly');
      if (tokenCheck) {
        res.setHeader('X-Rate-Limit-Tokens-Limit', tokenCheck.limit.toString());
        res.setHeader('X-Rate-Limit-Tokens-Remaining', tokenCheck.remaining.toString());
        res.setHeader('X-Rate-Limit-Tokens-Reset', tokenCheck.resetAt.toISOString());
      }

      // Set request count headers
      const requestCheck = result.checks.find((c) => c.limitType === 'requests_per_hour');
      if (requestCheck) {
        res.setHeader('X-RateLimit-Limit', requestCheck.limit.toString());
        res.setHeader('X-RateLimit-Remaining', requestCheck.remaining.toString());
        res.setHeader('X-RateLimit-Reset', requestCheck.resetAt.toISOString());
      }

      // Attach to request for downstream use
      (req as any).rateLimit = {
        tokensEstimated,
        allowed: true,
        remaining: tokenCheck?.remaining || 0,
        requestsRemaining: requestCheck?.remaining || 0,
      };
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - allow request but log error
      next();
    }
  }

  /**
   * Voice-specific rate limiter
   */
  static async checkVoiceLimits(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      const planType = user?.planType || PlanType.STARTER;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Extract voice parameters
      const voiceSeconds = req.body.audioLength || 0;
      const voiceType = req.body.type || 'stt'; // 'stt' or 'tts'

      // Check voice limits
      const result = await rateLimiter.checkRateLimit(
        userId,
        planType,
        'voice',
        {
          voiceSeconds,
          voiceType: voiceType as 'stt' | 'tts',
        }
      );

      if (!result.success) {
        res.status(429).json({
          success: false,
          error: 'Voice limit exceeded',
          message: result.blockReason,
          limits: result.checks.map((check) => ({
            type: check.limitType,
            current: check.current,
            limit: check.limit,
            remaining: check.remaining,
          })),
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Voice rate limiter error:', error);
      next();
    }
  }
  /**
   * Quick check - for less critical endpoints
   */
  static async quickCheck(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      const planType = user?.planType || PlanType.STARTER;

      if (!userId) {
        next();
        return;
      }

      const tokensEstimated = RateLimiterMiddleware.estimateTokens(req.body);

      const result = await rateLimiter.quickCheck(userId, planType, tokensEstimated);

      if (!result.allowed) {
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: result.reason,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Quick rate limiter error:', error);
      next();
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Estimate tokens from request body
   */
  private static estimateTokens(body: any): number {
    const message = body.message || body.prompt || body.text || '';

    // Rough estimation: 1 token ≈ 0.75 words
    // Average: 1.3 tokens per word
    const words = message.split(/\s+/).length;
    return Math.ceil(words * 1.3);
  }

  /**
   * Update usage after successful request
   */
  static async updateUsage(
    req: Request,
    tokensUsed: number
  ): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      if (!userId) return;

      await rateLimiter.updateUsage(userId, { tokensUsed });
    } catch (error) {
      console.error('Update usage error:', error);
    }
  }

  /**
   * Update voice usage
   */
  static async updateVoiceUsage(
    req: Request,
    voiceSecondsUsed: number
  ): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.userId;
      if (!userId) return;

      await rateLimiter.updateUsage(userId, { voiceSecondsUsed });
    } catch (error) {
      console.error('Update voice usage error:', error);
    }
  }   
}
// ==========================================
// EXPORT MIDDLEWARE FUNCTIONS
// ==========================================

export const checkRateLimits = RateLimiterMiddleware.checkLimits;
export const checkVoiceLimits = RateLimiterMiddleware.checkVoiceLimits;
export const quickCheckLimits = RateLimiterMiddleware.quickCheck;
export const updateUsage = RateLimiterMiddleware.updateUsage;
export const updateVoiceUsage = RateLimiterMiddleware.updateVoiceUsage;
