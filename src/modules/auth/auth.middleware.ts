/**
 * ==========================================
 * SORIVA AUTH MIDDLEWARE - REFINED VERSION
 * ==========================================
 * Created by: Amandeep Singh, Punjab, India
 * Purpose: JWT authentication and authorization
 * Last Updated: November 11, 2025
 * 
 * FEATURES:
 * ✅ JWT token verification
 * ✅ User authentication
 * ✅ Plan-based access control
 * ✅ Optional authentication
 * ✅ Active plan verification
 * ✅ Proper error handling
 * ✅ TypeScript type safety
 * 
 * CHANGES (November 11, 2025):
 * - ✅ Enhanced error messages
 * - ✅ Added request logging (optional)
 * - ✅ Improved type safety
 * - ✅ Better code documentation
 * - ✅ Consistent error responses
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@shared/utils/jwt.util';
import { isPlanActive } from '@shared/types/prisma-enums';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * User object structure attached to request
 */
export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  subscriptionPlan: string;
  planStatus: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHENTICATION MIDDLEWARE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Class-based Authentication Middleware
 * Handles JWT authentication, authorization, and plan-based access control
 */
export class AuthMiddleware {
  /**
   * Main authentication middleware
   * Verifies JWT token and attaches user info to request
   * 
   * @example
   * router.get('/protected', AuthMiddleware.authenticate, controller.method);
   */
  static authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 1. Extract token from Authorization header
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access token required',
          error: 'No token provided in Authorization header',
        });
        return;
      }

      // 2. Verify JWT token
      const decoded = verifyToken(token);

      if (!decoded) {
        res.status(403).json({
          success: false,
          message: 'Invalid or expired token',
          error: 'Token verification failed',
        });
        return;
      }

      // 3. Validate required fields in decoded token
      if (!decoded.userId || !decoded.email) {
        res.status(403).json({
          success: false,
          message: 'Invalid token payload',
          error: 'Missing required user information',
        });
        return;
      }

      // 4. Attach user info to request object
      (req as any).user = {
        userId: decoded.userId,
        email: decoded.email,
        subscriptionPlan: decoded.planType || 'starter',
        planStatus: 'active',
      };

      // 5. Optional: Log authentication (for debugging)
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ [Auth] User authenticated: ${decoded.email} (${decoded.planType})`);
      }

      // 6. Proceed to next middleware/controller
      next();
    } catch (error: any) {
      console.error('❌ [Auth] Authentication error:', error.message);
      res.status(403).json({
        success: false,
        message: 'Token verification failed',
        error: error.message || 'Authentication error',
      });
    }
  };

  /**
   * Optional authentication middleware
   * Attaches user info if token is valid, but doesn't block request if missing
   * 
   * @example
   * router.get('/public-but-personalized', AuthMiddleware.optionalAuth, controller.method);
   */
  static optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      // If token exists, try to verify it
      if (token) {
        const decoded = verifyToken(token);
        
        if (decoded && decoded.userId && decoded.email) {
          (req as any).user = {
            userId: decoded.userId,
            email: decoded.email,
            subscriptionPlan: decoded.planType || 'starter',
            planStatus: 'active',
          };

          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ [OptionalAuth] User identified: ${decoded.email}`);
          }
        }
      }

      // Always proceed to next middleware (even if no token)
      next();
    } catch (error) {
      // Silently fail - optional auth shouldn't block requests
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ [OptionalAuth] Token invalid, proceeding as guest');
      }
      next();
    }
  };

  /**
   * Plan-based access control middleware
   * Restricts access to specific subscription plans
   * 
   * @param allowedPlans - Array of allowed plan names (e.g., ['plus', 'pro'])
   * @example
   * router.post('/premium-feature', 
   *   AuthMiddleware.authenticate,
   *   AuthMiddleware.requirePlan('plus', 'pro', 'edge'),
   *   controller.method
   * );
   */
  static requirePlan = (...allowedPlans: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;

      // Check if user is authenticated
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'Please login to access this feature',
        });
        return;
      }

      // Normalize plan names for comparison (lowercase)
      const normalizedAllowedPlans = allowedPlans.map(p => p.toLowerCase());
      const userPlan = user.subscriptionPlan?.toLowerCase() || 'starter';

      // Check if user's plan is in allowed list
      if (!normalizedAllowedPlans.includes(userPlan)) {
        res.status(403).json({
          success: false,
          message: `This feature requires ${allowedPlans.join(' or ')} plan`,
          currentPlan: user.subscriptionPlan,
          requiredPlans: allowedPlans,
          upgradeUrl: '/pricing',
        });
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ [PlanCheck] User ${user.email} has required plan: ${userPlan}`);
      }

      next();
    };
  };

  /**
   * Active plan verification middleware
   * Ensures user's subscription plan is currently active
   * 
   * @example
   * router.get('/premium-content',
   *   AuthMiddleware.authenticate,
   *   AuthMiddleware.requireActivePlan,
   *   controller.method
   * );
   */
  static requireActivePlan = (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    // Check if user is authenticated
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Please login to continue',
      });
      return;
    }

    // Check if plan is active (handles both ACTIVE and TRIAL status)
    if (!isPlanActive(user.planStatus as any)) {
      res.status(403).json({
        success: false,
        message: 'Your subscription plan is not active',
        planStatus: user.planStatus,
        action: 'Please renew your subscription to continue',
        renewUrl: '/billing',
      });
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [ActivePlan] User ${user.email} has active plan`);
    }

    next();
  };

  /**
   * Admin/Role-based access control (Future extension)
   * Can be extended for admin routes
   */
  static requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // TODO: Add admin role check when user roles are implemented
    // For now, block all access
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Named exports for flexibility
 */
export const {
  authenticate,
  optionalAuth,
  requirePlan,
  requireActivePlan,
  requireAdmin,
} = AuthMiddleware;

/**
 * Default export for backward compatibility
 * @deprecated Use named exports instead
 */
export const authenticateToken = AuthMiddleware.authenticate;

/**
 * Export entire class for advanced usage
 */
export default AuthMiddleware;