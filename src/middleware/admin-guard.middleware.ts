// src/middleware/admin-guard.middleware.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { adminProtection } from '../config/admin-protection.config';
import EnhancedLogger from '../config/logger.config';

/**
 * ==========================================
 * ADMIN GUARD MIDDLEWARE - SORIVA V2
 * ==========================================
 * Multi-layer protection for admin routes
 * 
 * PROTECTION LAYERS:
 * 1. IP Allowlist verification
 * 2. Admin token validation (optional)
 * 3. Strict rate limiting
 * 4. Comprehensive audit logging
 * 
 * Phase 2 - Step 4: Admin Route Protection
 * Last Updated: November 18, 2025
 */

/**
 * Extended Request interface with admin metadata
 */
export interface AdminRequest extends Request {
  adminMeta?: {
    ip: string;
    userId?: string;
    isAdmin: boolean;
  };
}

/**
 * Get client IP from request (handles proxies, load balancers)
 */
const getClientIP = (req: Request): string => {
  // Check X-Forwarded-For header (proxy/load balancer)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(',')[0].trim();
  }

  // Check X-Real-IP header (nginx proxy)
  const realIP = req.headers['x-real-ip'];
  if (realIP && typeof realIP === 'string') {
    return realIP;
  }

  // Fallback to direct connection IP
  return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Admin-specific rate limiter (stricter than normal routes)
 */
export const adminRateLimiter = rateLimit({
  windowMs: adminProtection.getRateLimitConfig().windowMs,
  max: adminProtection.getRateLimitConfig().maxRequests,
  message: {
    success: false,
    error: 'Too many admin requests. Please try again later.',
    code: 'ADMIN_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator (use IP)
  keyGenerator: (req: Request) => {
    return getClientIP(req);
  },
  // Skip successful requests (only count failed attempts)
  skipSuccessfulRequests: false,
  // Handler for rate limit exceeded
  handler: (req: Request, res: Response) => {
    const ip = getClientIP(req);
    
    EnhancedLogger.warn('Admin rate limit exceeded', {
      ip,
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      error: 'Too many admin requests from this IP. Please try again later.',
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
    });
  },
});

/**
 * IP Allowlist Guard
 * Verifies if request IP is in the admin allowlist
 */
export const ipAllowlistGuard = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const clientIP = getClientIP(req);

    // Check if IP is allowed
    if (!adminProtection.isIPAllowed(clientIP)) {
      EnhancedLogger.error('Unauthorized admin access attempt', undefined, {
        ip: clientIP,
        endpoint: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      res.status(403).json({
        success: false,
        error: 'Access denied. Your IP is not authorized for admin access.',
        code: 'ADMIN_IP_NOT_ALLOWED',
      });
      return;
    }

    // IP allowed - attach metadata to request
    req.adminMeta = {
      ip: clientIP,
      isAdmin: true,
    };

    EnhancedLogger.debug('Admin IP verified', {
      ip: clientIP,
      endpoint: req.originalUrl,
    });

    next();
  } catch (error) {
    EnhancedLogger.error('Error in IP allowlist guard', error as Error, {
      endpoint: req.originalUrl,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error during admin verification.',
      code: 'ADMIN_GUARD_ERROR',
    });
  }
};

/**
 * Admin Token Guard (Optional)
 * Validates admin token from header or query
 */
export const adminTokenGuard = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header or query
    const token =
      (req.headers['x-admin-token'] as string) ||
      (req.query.adminToken as string);

    // Validate token
    if (!adminProtection.validateToken(token)) {
      const clientIP = getClientIP(req);

      EnhancedLogger.warn('Invalid admin token attempt', {
        ip: clientIP,
        endpoint: req.originalUrl,
        method: req.method,
      });

      res.status(401).json({
        success: false,
        error: 'Invalid or missing admin token.',
        code: 'ADMIN_TOKEN_INVALID',
      });
      return;
    }

    EnhancedLogger.debug('Admin token verified', {
      ip: getClientIP(req),
      endpoint: req.originalUrl,
    });

    next();
  } catch (error) {
    EnhancedLogger.error('Error in admin token guard', error as Error, {
      endpoint: req.originalUrl,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error during token verification.',
      code: 'ADMIN_TOKEN_GUARD_ERROR',
    });
  }
};

/**
 * Admin Audit Logger
 * Logs all admin actions for compliance and security
 */
export const adminAuditLogger = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): void => {
  const clientIP = getClientIP(req);
  const startTime = Date.now();

  // Create audit metadata
  const auditMeta = adminProtection.createAuditMeta(
    clientIP,
    `${req.method} ${req.originalUrl}`,
    req.originalUrl,
    req.method,
    req.adminMeta?.userId
  );

  // Log request start
  EnhancedLogger.info('Admin action initiated', {
    ...auditMeta,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Capture response
  const originalSend = res.json;
  res.json = function (data: any) {
    const duration = Date.now() - startTime;

    // Log completion
    EnhancedLogger.info('Admin action completed', {
      ...auditMeta,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      success: res.statusCode < 400,
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Combined Admin Guard (All protections)
 * Usage: router.use('/admin', adminGuard)
 */
export const adminGuard = [
  adminRateLimiter,      // Layer 1: Rate limiting
  ipAllowlistGuard,      // Layer 2: IP verification
  adminTokenGuard,       // Layer 3: Token validation (if enabled)
  adminAuditLogger,      // Layer 4: Audit logging
];

/**
 * Lightweight Admin Guard (IP + Audit only, no token)
 * For routes that don't need token validation
 */
export const adminGuardLight = [
  adminRateLimiter,
  ipAllowlistGuard,
  adminAuditLogger,
];

/**
 * Admin IP Guard Only (no token, no audit)
 * For public admin endpoints that just need IP restriction
 */
export const adminIPGuard = [
  adminRateLimiter,
  ipAllowlistGuard,
];

/**
 * Export individual guards for flexibility
 */
export default {
  full: adminGuard,
  light: adminGuardLight,
  ipOnly: adminIPGuard,
  rateLimit: adminRateLimiter,
  ipCheck: ipAllowlistGuard,
  tokenCheck: adminTokenGuard,
  audit: adminAuditLogger,
};