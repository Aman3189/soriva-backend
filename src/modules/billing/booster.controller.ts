// src/modules/billing/booster.controller.ts (UPDATED WITH STUDIO CREDITS)

/**
 * ==========================================
 * SORIVA BOOSTER CONTROLLER (ENHANCED!)
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Purpose: HTTP handlers for booster purchase & management
 * Updated: November 3, 2025 (Studio Credits System - Final Update)
 *
 * NEW ADDITION:
 * ✅ Studio Credits Booster - Purchase GPU generation credits
 * ✅ Updated pricing: 1₹ = 5 credits | Base 30% | Preview 10% margin
 * 
 * BOOSTER TYPES:
 * - Cooldown Booster: 2× daily capacity (unlocks once/day)
 * - Addon Booster: Fresh capacity pool (7-day validity)
 * - Studio Booster: GPU generation credits (LITE | PRO | MAX)
 *
 * ENDPOINTS:
 * - POST /api/billing/booster/cooldown/purchase  → Purchase cooldown booster
 * - POST /api/billing/booster/addon/purchase     → Purchase addon booster
 * - POST /api/billing/booster/studio/purchase    → Purchase studio credits
 * - GET  /api/billing/booster/active             → Get active boosters
 * - GET  /api/billing/booster/available          → Get available boosters
 * - GET  /api/billing/booster/history            → Get purchase history
 */

import { Request, Response } from 'express';
import BoosterService from './booster.service';

// ==========================================
// INTERFACES
// ==========================================

/**
 * Authenticated Request Interface
 */
interface AuthRequest extends Request {
  user?: any; // ✅ Allows any user structure
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
 * ✅ UPDATED: Correct booster types (LITE | PRO | MAX)
 */
interface StudioBoosterPurchaseBody {
  boosterType: 'LITE' | 'PRO' | 'MAX';
  paymentMethod?: string;
  transactionId?: string;
}

// ==========================================
// BOOSTER CONTROLLER CLASS
// ==========================================

export class BoosterController {
  // ==========================================
  // PURCHASE ENDPOINTS
  // ==========================================

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

      const result = await BoosterService.purchaseCooldownBooster({
        userId,
        paymentMethod: paymentMethod.trim(),
        transactionId: transactionId?.trim(),
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.booster,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to purchase cooldown booster');
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

      const result = await BoosterService.purchaseAddonBooster({
        userId,
        paymentMethod: paymentMethod.trim(),
        transactionId: transactionId?.trim(),
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.booster,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to purchase addon booster');
    }
  }

  /**
   * POST /api/billing/booster/studio/purchase
   * Purchase Studio Credits Booster
   * ✅ UPDATED: Correct types (LITE | PRO | MAX) with new credit amounts
   * 
   * @access Private (requires authentication)
   * @body boosterType - Type of studio booster (LITE | PRO | MAX)
   * @body paymentMethod - Optional payment method (defaults to 'simulation')
   * @body transactionId - Optional transaction ID
   * @returns Purchase confirmation with credits added
   *
   * @example
   * POST /api/billing/booster/studio/purchase
   * Body: {
   *   "boosterType": "LITE"
   * }
   * Response: {
   *   success: true,
   *   message: "Studio Lite purchased successfully! 300 credits added.",
   *   data: {
   *     boosterType: "LITE",
   *     creditsAdded: 300,
   *     price: 99,
   *     newBalance: 300,
   *     transactionId: "txn_xyz123",
   *     expiresAt: "2025-12-03T..."
   *   }
   * }
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

      // Purchase through service
      const result = await BoosterService.purchaseStudioBooster({
        userId,
        boosterType,
        paymentMethod: paymentMethod || 'simulation',
        transactionId: transactionId?.trim(),
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Return success response
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          boosterType: result.boosterType,
          creditsAdded: result.creditsAdded,
          price: result.price,
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
        data: boosters,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to get active boosters');
    }
  }

  /**
   * GET /api/billing/booster/available
   * Get available booster options with eligibility
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

      const cooldownEligibility = await BoosterService.checkCooldownEligibility(userId);
      const addonAvailability = await BoosterService.checkAddonAvailability(userId);

      const availableBoosters = {
        cooldownBooster: {
          available: cooldownEligibility.eligible,
          reason: cooldownEligibility.reason || null,
          details: cooldownEligibility.boosterDetails || null,
        },
        addonBooster: {
          available: addonAvailability.eligible,
          reason: addonAvailability.reason || null,
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

      const history = await BoosterService.getBoosterHistory(userId);

      res.status(200).json({
        success: true,
        data: history,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Failed to get booster history');
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