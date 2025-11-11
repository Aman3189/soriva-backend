import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt.util';
import { PrismaClient, PlanStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    // Check if Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use: Bearer <token>'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer "

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is missing'
      });
    }

    // Verify token
    const payload = JWTUtil.verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        planType: true,
        planStatus: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user's plan is active (EXPIRED or CANCELLED = blocked)
    if (user.planStatus === PlanStatus.EXPIRED || user.planStatus === PlanStatus.CANCELLED) {
      return res.status(403).json({
        success: false,
        message: 'Your subscription is inactive. Please renew your plan.'
      });
    }

    // Attach user info to request
    (req as any).user = {
      userId: user.id,
      email: user.email,
      planType: user.planType
    };

    // Continue to next middleware/controller
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Does not block if token is missing, but validates if present
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;

    // If no token, just continue
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    // Verify token if present
    const payload = JWTUtil.verifyAccessToken(token);

    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          planType: true
        }
      });

      if (user) {
        (req as any).user = {
          userId: user.id,
          email: user.email,
          planType: user.planType
        };
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if error
  }
};

/**
 * Admin Role Middleware
 * Checks if user has admin privileges
 */
export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is admin
    const userRecord = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        email: true
      }
    });

    // Admin email check
    const adminEmails = ['admin@soriva.com', 'aman@soriva.com'];

    if (!userRecord || !adminEmails.includes(userRecord.email)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};