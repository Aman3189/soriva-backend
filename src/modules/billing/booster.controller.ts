// src/modules/billing/booster.controller.ts

/**
 * ==========================================
 * SORIVA BOOSTER CONTROLLER v3.0 (UPDATED)
 * ==========================================
 * Created by: Amandeep, Punjab, India
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
 * - GET  /api/billing/booster/active               → Get active boosters
 * - GET  /api/billing/booster/available            → Get all available
 * - GET  /api/billing/booster/history              → Get history
 * - GET  /api/billing/booster/queue                → Get addon queue status
 * ==========================================
 */

import { Request, Response } from 'express';
import { Region, Currency } from '@prisma/client';
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
  // STARTER PLAN BOOSTER METHODS
  // ==========================================

  /**
   * Check STARTER addon availability
   * GET /api/billing/booster/starter/addon/check
   */
  async checkStarterAddonAvailability(req: AuthRequest, res: Response): Promise<void> {
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

      const region = req.query.region === 'INTL' ? Region.INTL : Region.IN;
      const result = await BoosterService.checkStarterAddonAvailability(userId, region);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to check STARTER addon availability');
    }
  }

  /**
   * Purchase STARTER addon booster
   * POST /api/billing/booster/starter/addon/purchase
   */
  async purchaseStarterAddonBooster(req: AuthRequest, res: Response): Promise<void> {
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

      const { paymentMethod, transactionId } = req.body;

      if (!paymentMethod || !transactionId) {
        res.status(400).json({
          success: false,
          message: 'Payment method and transaction ID are required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const region = req.body.region === 'INTL' ? Region.INTL : Region.IN;
      const currency = region === Region.INTL ? Currency.USD : Currency.INR;

      const result = await BoosterService.purchaseStarterAddonBooster({
        userId,
        region,
        currency,
        paymentMethod,
        transactionId,
      });

      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
        naturalMessage: result.naturalMessage,
        data: result.success ? {
          booster: result.booster,
          tokensAdded: result.tokensAdded,
          expiresAt: result.expiresAt,
          purchaseNumber: result.purchaseNumber,
          remainingPurchases: result.remainingPurchases,
        } : undefined,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to purchase STARTER addon booster');
    }
  }

  /**
   * Get STARTER addon status (for progress bar)
   * GET /api/billing/booster/starter/addon/status
   */
  async getStarterAddonStatus(req: AuthRequest, res: Response): Promise<void> {
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

      // Import usageService dynamically
      const usageService = (await import('./usage.service')).default;
      const status = await usageService.getAddonBoosterStatus(userId);

      res.status(200).json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to get STARTER addon status');
    }
  }

  /**
   * Check STARTER cooldown eligibility
   * GET /api/billing/booster/starter/cooldown/check
   */
  async checkStarterCooldownEligibility(req: AuthRequest, res: Response): Promise<void> {
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

      const region = req.query.region === 'INTL' ? Region.INTL : Region.IN;
      const result = await BoosterService.checkStarterCooldownEligibility(userId, region);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to check STARTER cooldown eligibility');
    }
  }

  /**
   * Purchase STARTER cooldown (India - ₹9)
   * POST /api/billing/booster/starter/cooldown/purchase
   */
  async purchaseStarterCooldown(req: AuthRequest, res: Response): Promise<void> {
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

      const { paymentMethod, transactionId } = req.body;

      if (!paymentMethod || !transactionId) {
        res.status(400).json({
          success: false,
          message: 'Payment method and transaction ID are required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const result = await BoosterService.purchaseStarterCooldown({
        userId,
        paymentMethod,
        transactionId,
      });

      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
        naturalMessage: result.naturalMessage,
        data: result.success ? {
          booster: result.booster,
          tokensUnlocked: result.tokensUnlocked,
          expiresAt: result.expiresAt,
        } : undefined,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to purchase STARTER cooldown');
    }
  }

  /**
   * Activate FREE cooldown (International only)
   * POST /api/billing/booster/starter/cooldown/activate
   */
  async activateFreeStarterCooldown(req: AuthRequest, res: Response): Promise<void> {
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

      const result = await BoosterService.activateFreeStarterCooldown(userId);

      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
        naturalMessage: result.naturalMessage,
        data: result.success ? {
          booster: result.booster,
          tokensUnlocked: result.tokensUnlocked,
          expiresAt: result.expiresAt,
          isFree: true,
        } : undefined,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to activate free STARTER cooldown');
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
