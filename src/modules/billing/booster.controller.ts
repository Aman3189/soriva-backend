// src/modules/billing/booster.controller.ts

/**
 * ==========================================
 * SORIVA BOOSTER CONTROLLER v3.0 (UPDATED)
 * ==========================================
 * Created by: Amandeep Singh, Punjab, India
 * Updated: November 21, 2025 - Aligned with Plans.ts v3.0
 * 
 * NEW FEATURES:
 * ✅ Eligibility check endpoints (separate from purchase)
 * ✅ Studio packages info endpoint
 * ✅ Natural language messages
 * ✅ Region detection from headers
 * ✅ Queue status endpoint (addon boosters)
 * 
 * ENDPOINTS:
 * - POST /api/billing/booster/cooldown/purchase    → Purchase cooldown
 * - GET  /api/billing/booster/cooldown/eligibility → Check eligibility
 * - POST /api/billing/booster/addon/purchase       → Purchase addon
 * - GET  /api/billing/booster/addon/availability   → Check availability
 * - POST /api/billing/booster/studio/purchase      → Purchase studio credits
 * - GET  /api/billing/booster/studio/packages      → Get all packages
 * - GET  /api/billing/booster/active               → Get active boosters
 * - GET  /api/billing/booster/available            → Get all available
 * - GET  /api/billing/booster/history              → Get history
 * - GET  /api/billing/booster/queue                → Get addon queue status
 * ==========================================
 */

import { Request, Response } from 'express';
import { Region, Currency, StudioBoosterType } from '@prisma/client';
import BoosterService from './booster.service';
import { detectRegionFromHeaders } from '../../config/utils/region-detector';

// ==========================================
// INTERFACES
// ==========================================

/**
 * Authenticated Request Interface
 */
interface AuthRequest extends Request {
  user?: any;
  userId?: string;
  isAdmin?: boolean;
  role?: string;
}

/**
 * Standard API Response Interface
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  naturalMessage?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Purchase Request Body Interface
 */
interface PurchaseRequestBody {
  paymentMethod: string;
  transactionId?: string;
}

/**
 * Studio Booster Purchase Body
 */
interface StudioBoosterPurchaseBody {
  boosterType: StudioBoosterType;
  paymentMethod?: string;
  transactionId?: string;
}

// ==========================================
// BOOSTER CONTROLLER CLASS
// ==========================================

export class BoosterController {
  // ==========================================
  // COOLDOWN BOOSTER ENDPOINTS
  // ==========================================

  /**
   * GET /api/billing/booster/cooldown/eligibility
   * Check if user is eligible for cooldown booster
   */
  async checkCooldownEligibility(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login to access this resource',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Detect region from request
      const { region } = detectRegionFromHeaders(req);

      const result = await BoosterService.checkCooldownEligibility(userId, region);

      res.status(200).json({
        success: result.eligible,
        message: result.naturalMessage || result.reason,
        data: result.eligible ? result.boosterDetails : null,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to check cooldown eligibility');
    }
  }

  /**
   * POST /api/billing/booster/cooldown/purchase
   * Purchase cooldown booster (2× daily capacity)
   */
  async purchaseCooldownBooster(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login to access this resource',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const { paymentMethod, transactionId } = req.body as PurchaseRequestBody;

      if (!paymentMethod || typeof paymentMethod !== 'string' || paymentMethod.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Payment method is required',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Detect region from request
      const { region, currency } = detectRegionFromHeaders(req);

      const result = await BoosterService.purchaseCooldownBooster({
        userId,
        paymentMethod: paymentMethod.trim(),
        transactionId: transactionId?.trim(),
        region,
        currency,
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.naturalMessage || result.message,
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: result.naturalMessage || result.message,
        data: {
          booster: result.booster,
          wordsUnlocked: result.wordsUnlocked,
          newDailyLimit: result.newDailyLimit,
          expiresAt: result.expiresAt,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to purchase cooldown booster');
    }
  }

  // ==========================================
  // ADDON BOOSTER ENDPOINTS
  // ==========================================

  /**
   * GET /api/billing/booster/addon/availability
   * Check addon booster availability and queue status
   */
  async checkAddonAvailability(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login to access this resource',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Detect region from request
      const { region } = detectRegionFromHeaders(req);

      const result = await BoosterService.checkAddonAvailability(userId, region);

      res.status(200).json({
        success: result.eligible,
        message: result.naturalMessage || result.reason,
        data: result.boosterDetails,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to check addon availability');
    }
  }

  /**
   * POST /api/billing/booster/addon/purchase
   * Purchase addon booster (fresh capacity pool)
   */
  async purchaseAddonBooster(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login to access this resource',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const { paymentMethod, transactionId } = req.body as PurchaseRequestBody;

      if (!paymentMethod || typeof paymentMethod !== 'string' || paymentMethod.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Payment method is required',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Detect region from request
      const { region, currency } = detectRegionFromHeaders(req);

      const result = await BoosterService.purchaseAddonBooster({
        userId,
        paymentMethod: paymentMethod.trim(),
        transactionId: transactionId?.trim(),
        region,
        currency,
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.naturalMessage || result.message,
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: result.naturalMessage || result.message,
        data: {
          booster: result.booster,
          wordsAdded: result.wordsAdded,
          dailyBoost: result.dailyBoost,
          validity: result.validity,
          status: result.status,
          startsAt: result.startsAt,
          expiresAt: result.expiresAt,
          queuePosition: result.queuePosition,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to purchase addon booster');
    }
  }

  // ==========================================
  // STUDIO BOOSTER ENDPOINTS
  // ==========================================

  /**
   * GET /api/billing/booster/studio/packages
   * Get all studio credit packages with region-specific pricing
   */
  async getStudioPackages(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Detect region from request
      const { region } = detectRegionFromHeaders(req);

      const packages = await BoosterService.getStudioPackages(region);

      res.status(200).json({
        success: true,
        data: {
          region,
          packages,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to get studio packages');
    }
  }

  /**
   * POST /api/billing/booster/studio/purchase
   * Purchase Studio Credits Booster
   * ✅ UPDATED: Correct credits (420/1695/2545 IN | 1050/4237/6362 INTL)
   */
  async purchaseStudioBooster(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login to access this resource',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const { boosterType, paymentMethod, transactionId } = req.body as StudioBoosterPurchaseBody;

      // Validate booster type
      if (!boosterType) {
        res.status(400).json({
          success: false,
          message: 'boosterType is required (LITE, PRO, or MAX)',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const validTypes = ['LITE', 'PRO', 'MAX'];
      if (!validTypes.includes(boosterType)) {
        res.status(400).json({
          success: false,
          message: `Invalid boosterType. Must be one of: ${validTypes.join(', ')}`,
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Detect region from request
      const { region, currency } = detectRegionFromHeaders(req);

      // Purchase through service
      const result = await BoosterService.purchaseStudioBooster({
        userId,
        boosterType,
        paymentMethod: paymentMethod || 'simulation',
        transactionId: transactionId?.trim(),
        region,
        currency,
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.naturalMessage || result.message,
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Return success response
      res.status(200).json({
        success: true,
        message: result.naturalMessage || result.message,
        data: {
          boosterType: result.boosterType,
          creditsAdded: result.creditsAdded,
          price: result.price,
          priceDisplay: result.priceDisplay,
          newBalance: result.newBalance,
          transactionId: result.transactionId,
          expiresAt: result.expiresAt,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to purchase studio booster');
    }
  }

  // ==========================================
  // BOOSTER INFORMATION ENDPOINTS
  // ==========================================

  /**
   * GET /api/billing/booster/active
   * Get all active boosters for user
   */
  async getActiveBoosters(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login to access this resource',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const boosters = await BoosterService.getActiveBoosters(userId);

      res.status(200).json({
        success: true,
        data: {
          count: boosters.length,
          boosters,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to get active boosters');
    }
  }

  /**
   * GET /api/billing/booster/available
   * Get all available booster options with eligibility
   */
  async getAvailableBoosters(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login to access this resource',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Detect region from request
      const { region } = detectRegionFromHeaders(req);

      // Check all booster types
      const cooldownEligibility = await BoosterService.checkCooldownEligibility(userId, region);
      const addonAvailability = await BoosterService.checkAddonAvailability(userId, region);
      const studioPackages = await BoosterService.getStudioPackages(region);

      const availableBoosters = {
        region,
        cooldownBooster: {
          available: cooldownEligibility.eligible,
          message: cooldownEligibility.naturalMessage || cooldownEligibility.reason,
          details: cooldownEligibility.boosterDetails || null,
        },
        addonBooster: {
          available: addonAvailability.eligible,
          message: addonAvailability.naturalMessage || addonAvailability.reason,
          details: addonAvailability.boosterDetails || null,
        },
        studioPackages,
      };

      res.status(200).json({
        success: true,
        data: availableBoosters,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to get available boosters');
    }
  }

  /**
   * GET /api/billing/booster/history
   * Get booster purchase history for user
   */
  async getBoosterHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login to access this resource',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const history = await BoosterService.getBoosterHistory(userId, limit);

      res.status(200).json({
        success: true,
        data: {
          count: history.length,
          history,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to get booster history');
    }
  }

  /**
   * GET /api/billing/booster/queue
   * Get addon booster queue status (NEW!)
   */
  async getQueueStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Please login to access this resource',
          error: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Import queue service
      const boosterQueueService = (await import('./booster.queue.service')).default;
      const queueStatus = await boosterQueueService.checkAddonQueue(userId);

      res.status(200).json({
        success: true,
        data: queueStatus,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to get queue status');
    }
  }

  // ==========================================
  // ERROR HANDLER
  // ==========================================

  /**
   * Centralized error handler
   */
  private handleError(
    res: Response,
    error: unknown,
    defaultMessage: string,
    statusCode: number = 500
  ): void {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;

    console.error('[BoosterController Error]:', {
      message: errorMessage,
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString(),
    });

    res.status(statusCode).json({
      success: false,
      message: errorMessage || defaultMessage,
      error: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
}

// ==========================================
// EXPORT SINGLETON INSTANCE
// ==========================================

export default new BoosterController();
