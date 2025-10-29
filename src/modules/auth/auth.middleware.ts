/**
 * SORIVA AUTH MIDDLEWARE
 * Created by: Amandeep Singh, Punjab, India
 * Purpose: JWT authentication and authorization
 * Last Updated: October 28, 2025 (Minimal Schema Migration Update)
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/utils/jwt.util';

// ✅ ONLY CRITICAL IMPORT: isPlanActive helper
import { isPlanActive } from '@shared/types/prisma-enums';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHENTICATION MIDDLEWARE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Class-based Authentication Middleware
 * JWT payload ko Express Request type mein properly map karta hai
 */
export class AuthMiddleware {
  /**
   * Main authentication middleware
   * JWT token verify karta hai aur user info request mein daalta hai
   */
  static authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 1. Authorization header se token nikalo
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access token required',
        });
        return;
      }

      // 2. JWT verify karo
      const decoded = verifyToken(token);

      if (!decoded) {
        res.status(403).json({
          success: false,
          message: 'Invalid or expired token',
        });
        return;
      }

      // 3. JWT payload ko Express Request.user format mein map karo
      (req as any).user = {
        id: decoded.userId,
        email: decoded.email,
        name: undefined,
        subscriptionPlan: decoded.planType,
        planStatus: 'active',
      };

      // 4. Next middleware/controller call karo
      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        message: 'Token verification failed',
      });
    }
  };

  /**
   * Optional authentication (token na ho to bhi aage badho)
   */
  static optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          (req as any).user = {
            id: decoded.userId,
            email: decoded.email,
            name: undefined,
            subscriptionPlan: decoded.planType,
            planStatus: 'active',
          };
        }
      }

      next();
    } catch {
      next();
    }
  };

  /**
   * Plan-based access control middleware
   */
  static requirePlan = (...allowedPlans: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      if (!allowedPlans.includes(user.subscriptionPlan)) {
        res.status(403).json({
          success: false,
          message: `This feature requires ${allowedPlans.join(' or ')} plan`,
          currentPlan: user.subscriptionPlan,
          requiredPlans: allowedPlans,
        });
        return;
      }

      next();
    };
  };

  /**
   * Check if user's plan is active
   * ✅ UPDATED: Now uses isPlanActive() helper (handles ACTIVE and TRIAL enums)
   */
  static requireActivePlan = (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // ✅ ONLY CHANGE: Use isPlanActive() instead of string comparison
    // This handles both PlanStatus.ACTIVE and PlanStatus.TRIAL
    if (!isPlanActive(user.planStatus as any)) {
      res.status(403).json({
        success: false,
        message: 'Your subscription plan is not active',
        planStatus: user.planStatus,
      });
      return;
    }

    next();
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Backward compatibility
export const authenticateToken = AuthMiddleware.authenticate;
