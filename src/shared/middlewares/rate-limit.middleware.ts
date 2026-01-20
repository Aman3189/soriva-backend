// src/middlewares/rate-limit.middleware.ts

import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { PlanType } from '@shared/types/prisma-enums';
import {
  API_RATE_LIMITS,
  checkAPIRateLimit,
  type APIRateLimits,
} from '@/constants/abuse-limits';

/**
 * 🎯 SORIVA - RATE LIMITING MIDDLEWARE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Developer: Amandeep, Punjab, India
 * Architecture: Express rate limiter with plan-based rules
 * Quality: 10/10 Production-ready
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * FEATURES:
 * ✅ Plan-based rate limiting (Starter/Plus/Pro/Apex)
 * ✅ Per-minute limits
 * ✅ Per-hour limits
 * ✅ Burst protection (10-second window)
 * ✅ Token limits (context + output)
 * ✅ Custom error messages with retry-after
 * ✅ Skip conditions for health checks
 * ✅ Redis-ready for production scaling
 *
 * INTEGRATED WITH:
 * - abuse-limits.ts (API_RATE_LIMITS, checkAPIRateLimit)
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetTime: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IN-MEMORY STORE (Replace with Redis in production)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Simple in-memory rate limit store
 * TODO: Replace with Redis for multi-instance deployments
 */
class RateLimitStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  /**
   * Increment counter for a key
   */
  increment(key: string, windowMs: number): { count: number; resetAt: number } {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetAt <= now) {
      // New window
      const entry = { count: 1, resetAt: now + windowMs };
      this.store.set(key, entry);
      return entry;
    }

    // Increment existing
    existing.count++;
    return existing;
  }

  /**
   * Get current count for a key
   */
  get(key: string): number {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetAt <= now) {
      return 0;
    }

    return existing.count;
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }
}

// Create store instances for different windows
const burstStore = new RateLimitStore();    // 10-second window
const minuteStore = new RateLimitStore();   // 1-minute window
const hourStore = new RateLimitStore();     // 1-hour window

// Cleanup every 5 minutes
setInterval(() => {
  burstStore.cleanup();
  minuteStore.cleanup();
  hourStore.cleanup();
}, 5 * 60 * 1000);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get user identifier for rate limiting
 * Prioritizes: userId > IP > 'anonymous'
 */
function getUserIdentifier(req: Request): string {
  const user = (req as any).user;
  if (user?.id) {
    return `user:${user.id}`;
  }
  return `ip:${req.ip || 'anonymous'}`;
}

/**
 * Get user's plan type
 * Defaults to STARTER for unauthenticated requests
 * Handles both string and enum formats from DB/auth
 */
function getUserPlanType(req: Request): PlanType {
  const user = (req as any).user;
  const rawPlanType = user?.planType;
  
  // Normalize planType - handle both string and enum formats
  if (rawPlanType && Object.values(PlanType).includes(rawPlanType)) {
    return rawPlanType as PlanType;
  }
  
  return PlanType.STARTER;
}

/**
 * Get rate limits for a plan
 */
function getPlanLimits(planType: PlanType): APIRateLimits {
  return API_RATE_LIMITS[planType];
}

/**
 * Send rate limit exceeded response
 */
function sendRateLimitResponse(
  res: Response,
  message: string,
  retryAfterSeconds: number
): void {
  res.set('Retry-After', retryAfterSeconds.toString());
  res.status(429).json({
    success: false,
    message,
    statusCode: 429,
    retryAfter: retryAfterSeconds,
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN-BASED RATE LIMITER (Main AI/Chat endpoints)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Plan-based rate limiter middleware
 * Uses limits from abuse-limits.ts based on user's plan
 *
 * Checks:
 * 1. Burst limit (10-second window)
 * 2. Per-minute limit
 * 3. Per-hour limit
 */
export function planBasedRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip health checks
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  const identifier = getUserIdentifier(req);
  const planType = getUserPlanType(req);
  const limits = getPlanLimits(planType);

  // Get current counts
  const burstKey = `${identifier}:burst`;
  const minuteKey = `${identifier}:minute`;
  const hourKey = `${identifier}:hour`;

  const burstCount = burstStore.get(burstKey);
  const minuteCount = minuteStore.get(minuteKey);
  const hourCount = hourStore.get(hourKey);

  // Check using abuse-limits function
  const result = checkAPIRateLimit({
    planType,
    requestsThisMinute: minuteCount,
    requestsThisHour: hourCount,
    requestsLast10Seconds: burstCount,
    requestedContextTokens: 0, // Will be checked in AI middleware
    requestedOutputTokens: 0,  // Will be checked in AI middleware
  });

  if (!result.allowed) {
    return sendRateLimitResponse(res, result.reason, result.retryAfterSeconds || 60);
  }

  // Increment counters
  burstStore.increment(burstKey, 10 * 1000);      // 10 seconds
  minuteStore.increment(minuteKey, 60 * 1000);    // 1 minute
  hourStore.increment(hourKey, 60 * 60 * 1000);  // 1 hour

  // Add rate limit headers
  res.set('X-RateLimit-Limit-Minute', limits.requestsPerMinute.toString());
  res.set('X-RateLimit-Remaining-Minute', Math.max(0, limits.requestsPerMinute - minuteCount - 1).toString());
  res.set('X-RateLimit-Limit-Hour', limits.requestsPerHour.toString());
  res.set('X-RateLimit-Remaining-Hour', Math.max(0, limits.requestsPerHour - hourCount - 1).toString());

  next();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TOKEN LIMIT CHECKER (For AI endpoints)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if requested tokens are within plan limits
 * Use this middleware AFTER planBasedRateLimiter for AI endpoints
 */
export function tokenLimitChecker(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const planType = getUserPlanType(req);
  const limits = getPlanLimits(planType);

  // Extract token counts from request body
  const contextTokens = req.body?.contextTokens || req.body?.messages?.length * 100 || 0;
  const outputTokens = req.body?.maxTokens || req.body?.max_tokens || 1000;

  // Check context token limit
  if (contextTokens > limits.maxContextTokens) {
    return sendRateLimitResponse(
      res,
      `Context too long. Your plan allows max ${limits.maxContextTokens} context tokens. Upgrade for more.`,
      0
    );
  }

  // Check output token limit
  if (outputTokens > limits.maxOutputTokens) {
    return sendRateLimitResponse(
      res,
      `Output too long. Your plan allows max ${limits.maxOutputTokens} output tokens. Upgrade for more.`,
      0
    );
  }

  // Add limits to request for downstream use
  (req as any).tokenLimits = {
    maxContext: limits.maxContextTokens,
    maxOutput: limits.maxOutputTokens,
    requestedContext: contextTokens,
    requestedOutput: outputTokens,
  };

  next();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERAL API RATE LIMITER (Fallback for non-plan routes)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendRateLimitResponse(res, 'Too many requests. Please try again later.', 900);
  },
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health';
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STRICT RATE LIMITER (For sensitive operations)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendRateLimitResponse(res, 'Rate limit exceeded for sensitive operation.', 900);
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHENTICATION RATE LIMITER (Login, Register, OTP)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendRateLimitResponse(
      res,
      'Too many authentication attempts. Please try again after 15 minutes.',
      900
    );
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OTP RATE LIMITER (Stricter for OTP requests)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 OTP requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendRateLimitResponse(
      res,
      'Too many OTP requests. Please try again after 1 hour.',
      3600
    );
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE UPLOAD RATE LIMITER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendRateLimitResponse(res, 'Upload limit reached. Please try again later.', 3600);
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOCUMENT QUERY RATE LIMITER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const documentQueryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 queries per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendRateLimitResponse(res, 'Query limit reached. Please slow down.', 60);
  },
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user?.id || req.ip || 'unknown';
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAYMENT RATE LIMITER (Prevent payment spam)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 payment attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendRateLimitResponse(
      res,
      'Too many payment attempts. Please try again later.',
      3600
    );
  },
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user?.id || req.ip || 'unknown';
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STUDIO RATE LIMITER (GPU-heavy operations)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const studioLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 studio requests per minute (burst protection)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    sendRateLimitResponse(
      res,
      'Studio rate limit reached. Please wait before generating more.',
      60
    );
  },
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user?.id || req.ip || 'unknown';
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default {
  // Plan-based (use for AI/chat endpoints)
  planBasedRateLimiter,
  tokenLimitChecker,

  // General purpose
  apiLimiter,
  strictLimiter,

  // Auth
  authLimiter,
  otpLimiter,

  // Feature-specific
  uploadLimiter,
  documentQueryLimiter,
  paymentLimiter,
  studioLimiter,
};