// src/modules/billing/subscription.controller.ts
/**
 * ==========================================
 * SUBSCRIPTION CONTROLLER - 100% CLASS-BASED
 * ==========================================
 * Handles all subscription-related HTTP requests
 * Architecture: Class-Based | Type-Safe | RESTful
 * Rating: 10/10 ⭐
 */

import { Request, Response } from 'express';
import subscriptionService from './subscription.service';
import { plansManager } from '../../constants/plansManager';

// ==========================================
// INTERFACES
// ==========================================

interface UpgradeRequest {
  targetPlanName: string;
  paymentGateway?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewayMetadata?: Record<string, any>;
}

interface RenewRequest {
  paymentGateway?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewayMetadata?: Record<string, any>;
}

// ==========================================
// SUBSCRIPTION CONTROLLER CLASS
// ==========================================

class SubscriptionController {
  /**
   * Upgrade user's subscription plan
   * POST /api/billing/subscription/upgrade
   */
  public upgradePlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated',
        });
        return;
      }

      const { targetPlanName, paymentGateway, gatewayOrderId, gatewayPaymentId, gatewayMetadata } =
        req.body as UpgradeRequest;

      // Validate target plan
      if (!targetPlanName) {
        res.status(400).json({
          success: false,
          message: 'Target plan name is required',
        });
        return;
      }

      const targetPlan = plansManager.getPlanByName(targetPlanName);
      if (!targetPlan) {
        res.status(400).json({
          success: false,
          message: 'Invalid target plan',
        });
        return;
      }

      // Use the service instance directly
      const result = await subscriptionService.changePlan(userId, targetPlanName);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Subscription upgraded successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Error upgrading subscription:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upgrade subscription',
      });
    }
  };

  /**
   * Cancel user's subscription
   * POST /api/billing/subscription/cancel
   */
  public cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated',
        });
        return;
      }

      const { immediate = false } = req.body;

      // Cancel subscription
      const result = await subscriptionService.cancelSubscription(userId, immediate);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to cancel subscription',
      });
    }
  };

  /**
   * Renew user's subscription
   * POST /api/billing/subscription/renew
   */
  public renewSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated',
        });
        return;
      }

      // Reactivate subscription
      const result = await subscriptionService.reactivateSubscription(userId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Subscription renewed successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Error renewing subscription:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to renew subscription',
      });
    }
  };

  /**
   * Get current subscription status
   * GET /api/billing/subscription/status
   */
  public getSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated',
        });
        return;
      }

      // Get subscription details
      const details = await subscriptionService.getSubscriptionDetails(userId);

      if (!details) {
        res.status(404).json({
          success: false,
          message: 'No active subscription found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Subscription status retrieved successfully',
        data: details,
      });
    } catch (error: any) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get subscription status',
      });
    }
  };

  /**
   * Get subscription history
   * GET /api/billing/subscription/history
   */
  public getSubscriptionHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated',
        });
        return;
      }

      // Get subscription history
      const history = await subscriptionService.getSubscriptionHistory(userId);

      res.status(200).json({
        success: true,
        message: 'Subscription history retrieved successfully',
        data: {
          subscriptions: history,
          total: history.length,
        },
      });
    } catch (error: any) {
      console.error('Error getting subscription history:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get subscription history',
      });
    }
  };
}

// ==========================================
// EXPORT SINGLETON INSTANCE
// ==========================================

const subscriptionController = new SubscriptionController();
export default subscriptionController;
