/**
 * SORIVA ADMIN MIDDLEWARE (FIXED)
 * Created by: Amandeep, Punjab, India
 * Purpose: JWT authentication and admin role verification
 * Fixed: All TypeScript errors resolved
 */

import { Request, Response, NextFunction } from 'express';

// Simple console logger (will use proper logger later)
const logger = {
  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  },
  info: (message: string, context?: any) => {
    console.log(`[INFO] ${message}`, context || '');
  },
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${message}`, context || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
  iat?: number;
  exp?: number;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Warn if using default secret in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  logger.error('⚠️  CRITICAL: JWT_SECRET not set in production! Using default secret is insecure!');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR CLASSES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AuthenticationError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string = 'AUTH_ERROR', statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AuthorizationError extends Error {
  public code: string;
  public statusCode: number;

  constructor(
    message: string = 'Insufficient permissions',
    code: string = 'FORBIDDEN',
    statusCode: number = 403
  ) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JWT UTILITIES (Simple implementation without jsonwebtoken)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Simple JWT implementation using crypto
 * NOTE: For production, use 'jsonwebtoken' package
 */
import crypto from 'crypto';

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
}

/**
 * Generate JWT token for user
 */
export const generateToken = (payload: TokenPayload): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 24 * 60 * 60; // 24 hours

  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  // Encode header and payload
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

  // Create signature
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): AuthUser => {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new AuthenticationError('Invalid token format', 'INVALID_TOKEN');
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new AuthenticationError('Invalid signature', 'INVALID_SIGNATURE');
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString()) as AuthUser;

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new AuthenticationError('Token expired', 'TOKEN_EXPIRED');
    }

    return payload;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('Token verification failed', 'VERIFICATION_FAILED');
  }
};

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and just "<token>"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHENTICATION MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Verify JWT token and attach user to request
 * Used for any authenticated route
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from header
    const token = extractToken(req);

    if (!token) {
      throw new AuthenticationError('No token provided', 'NO_TOKEN');
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user to request
    req.user = decoded;

    logger.debug('[Auth] User authenticated', {
      userId: decoded.userId,
      role: decoded.role,
    });

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      logger.warn('[Auth] Authentication failed', {
        error: error.message,
        code: error.code,
      });

      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }

    logger.error('[Auth] Authentication error', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN AUTHORIZATION MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Verify user has admin role
 * Must be used AFTER authenticate middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('Not authenticated', 'NOT_AUTHENTICATED');
    }

    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
      throw new AuthorizationError('Admin access required', 'NOT_ADMIN');
    }

    logger.debug('[Auth] Admin access granted', {
      userId: req.user.userId,
      role: req.user.role,
    });

    next();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn('[Auth] Authorization failed', {
        userId: req.user?.userId,
        error: error.message,
      });

      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }

    if (error instanceof AuthenticationError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }

    logger.error('[Auth] Authorization error', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Authorization check failed',
      },
    });
  }
};

/**
 * Verify user has super admin role
 * Must be used AFTER authenticate middleware
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('Not authenticated', 'NOT_AUTHENTICATED');
    }

    // Check if user is super admin
    if (req.user.role !== UserRole.SUPER_ADMIN) {
      throw new AuthorizationError('Super admin access required', 'NOT_SUPER_ADMIN');
    }

    logger.debug('[Auth] Super admin access granted', {
      userId: req.user.userId,
    });

    next();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logger.warn('[Auth] Super admin check failed', {
        userId: req.user?.userId,
        role: req.user?.role,
      });

      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }

    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Super admin access required',
      },
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMBINED MIDDLEWARE (Convenience)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Combined authentication + admin authorization
 * Use this on admin routes for convenience
 */
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First authenticate
    await authenticate(req, res, (error?: any) => {
      if (error) {
        return;
      }
      // Then check admin
      requireAdmin(req, res, next);
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Combined authentication + super admin authorization
 * Use this on super admin routes
 */
export const authenticateSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First authenticate
    await authenticate(req, res, (error?: any) => {
      if (error) {
        return;
      }
      // Then check super admin
      requireSuperAdmin(req, res, next);
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Alternative: Use as array of middlewares
 * Usage: router.get('/admin', ...adminChain, handler)
 */
export const adminChain = [authenticate, requireAdmin];
export const superAdminChain = [authenticate, requireSuperAdmin];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPTIONAL AUTHENTICATION (For public routes with user context)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Optional authentication - doesn't fail if no token
 * Attaches user if token present, otherwise continues
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;

      logger.debug('[Auth] Optional auth - user identified', {
        userId: decoded.userId,
      });
    }

    next();
  } catch (error) {
    // Don't fail - just continue without user
    logger.debug('[Auth] Optional auth - token invalid, continuing without user');
    next();
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Export logger for external use
export { logger };

export default {
  authenticate,
  requireAdmin,
  requireSuperAdmin,
  authenticateAdmin,
  authenticateSuperAdmin,
  adminChain,
  superAdminChain,
  optionalAuth,
  generateToken,
  verifyToken,
  logger,
};
