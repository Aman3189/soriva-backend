// src/modules/billing/billing.controller.ts
/**
 * ==========================================
 * BILLING CONTROLLER - Regional Pricing + Yearly Plans Support
 * ==========================================
 * Updated: December 5, 2025
 * Changes:
 * - ✅ ADDED: BillingCycle support (Monthly/Yearly)
 * - ✅ ADDED: getBillingCycle() helper method
 * - ✅ UPDATED: All methods support billing cycle parameter
 * - ✅ MAINTAINED: Multi-layer region detection system
 * - ✅ MAINTAINED: All existing functionality
 */

import { Request, Response } from 'express';
import { plansManager } from '../../constants';
import { prisma } from '../../config/prisma';
import { Region } from '@prisma/client';
import { BillingCycle } from '../../constants/plans';
import billingService from './billing.service';

// ==========================================
// BILLING CONTROLLER CLASS
// ==========================================

class BillingController {
  /**
   * ==========================================
   * PERMANENT SOLUTION: Multi-layer Region Detection
   * ==========================================
   * Priority Order:
   * 1. Database (Authenticated users) - Most accurate
   * 2. Query/Header (User preference) - User control
   * 3. Default (IN) - Safe fallback
   */
  private async getUserRegion(req: Request): Promise<Region> {
    try {
      // 🔹 PRIORITY 1: Authenticated user - Get from database
      const userId = (req as any).user?.userId;
      
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { region: true, email: true },
        });
        
        if (user?.region) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ [Region] Database: ${user.region} (User: ${user.email})`);
          }
          return user.region;
        }
      }

      // 🔹 PRIORITY 2: Query parameter or header (user preference)
      const queryRegion = req.query.region as string;
      const headerRegion = req.headers['x-region'] as string;
      
      const preferredRegion = queryRegion || headerRegion;
      
      if (preferredRegion) {
        const region = preferredRegion.toUpperCase();
        if (region === 'IN' || region === 'INTL') {
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ [Region] Preference: ${region}`);
          }
          return region as Region;
        }
      }

      // 🔹 PRIORITY 3: Default to IN (India)
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [Region] Default: IN');
      }
      return Region.IN;
      
    } catch (error) {
      console.error('❌ [Region] Error detecting region:', error);
      return Region.IN;
    }
  }

  /**
   * ==========================================
   * NEW: Billing Cycle Detection
   * ==========================================
   * Priority: Query param → Default (MONTHLY)
   * 
   * Examples:
   * - ?cycle=yearly → YEARLY
   * - ?cycle=annual → YEARLY
   * - ?cycle=monthly → MONTHLY
   * - (no param) → MONTHLY
   */
  private getBillingCycle(req: Request): BillingCycle {
    const cycleParam = req.query.cycle as string;
    
    if (cycleParam) {
      const cycle = cycleParam.toUpperCase();
      if (cycle === 'YEARLY' || cycle === 'ANNUAL') {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [BillingCycle] YEARLY');
        }
        return BillingCycle.YEARLY;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [BillingCycle] MONTHLY (default)');
    }
    return BillingCycle.MONTHLY;
  }

  /**
   * Get all available plans with regional pricing (Public/Protected)
   * GET /api/billing/plans
   * GET /api/billing/plans?cycle=yearly
   * 
   * Examples:
   * - GET /api/billing/plans → Monthly, India pricing
   * - GET /api/billing/plans?cycle=yearly → Yearly, India pricing
   * - GET /api/billing/plans?cycle=yearly&region=INTL → Yearly, INTL pricing
   */
  public getAllPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get user region using multi-layer detection
      const userRegion = await this.getUserRegion(req);
      
      // Get billing cycle from query
      const billingCycle = this.getBillingCycle(req);

      // Get plans with regional pricing from service
      const result = await billingService.getAllPlans(userRegion, billingCycle);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Plans retrieved successfully',
        data: {
          plans: result.plans,
          region: result.region,
          billingCycle,
          total: result.plans?.length || 0,
        },
      });
    } catch (error: any) {
      console.error('Error getting plans:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve plans',
      });
    }
  };

  /**
   * Get specific plan details with regional pricing (Public/Protected)
   * GET /api/billing/plans/:planName
   * GET /api/billing/plans/:planName?cycle=yearly
   * 
   * Examples:
   * - GET /api/billing/plans/plus → Monthly, India pricing
   * - GET /api/billing/plans/plus?cycle=yearly → Yearly pricing with savings
   * - GET /api/billing/plans/apex?cycle=yearly&region=INTL → Yearly, INTL pricing
   */
  public getPlanDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planName } = req.params;

      if (!planName) {
        res.status(400).json({
          success: false,
          message: 'Plan name is required',
        });
        return;
      }

      // Get user region using multi-layer detection
      const userRegion = await this.getUserRegion(req);
      
      // Get billing cycle from query
      const billingCycle = this.getBillingCycle(req);

      // Convert plan name to PlanType
      const planType = planName.toUpperCase();

      // Get plan details with regional pricing and billing cycle
      const result = await billingService.getPlanDetails(planType as any, userRegion, billingCycle);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Plan details retrieved successfully',
        data: result.plan,
      });
    } catch (error: any) {
      console.error('Error getting plan details:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve plan details',
      });
    }
  };

  /**
   * Get current user's plan with regional pricing (Protected)
   * GET /api/billing/current
   * GET /api/billing/current?cycle=yearly
   * 
   * Note: This route requires authentication (authenticateToken middleware)
   */
  public getCurrentPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated',
        });
        return;
      }

      // Get user with subscription
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          planStatus: true,
          planStartDate: true,
          planEndDate: true,
          region: true,
          currency: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Get billing cycle from query
      const billingCycle = this.getBillingCycle(req);

      // Get plan details with regional pricing and billing cycle
      const planResult = await billingService.getPlanDetails(
        user.planType as any,
        user.region,
        billingCycle
      );

      if (!planResult.success) {
        res.status(404).json({
          success: false,
          message: 'Plan not found',
        });
        return;
      }

      // Get usage data
      const usage = await prisma.usage.findFirst({
        where: { userId },
      });

      // Calculate days remaining
      let daysRemaining = null;
      if (user.planEndDate) {
        const now = new Date();
        const endDate = new Date(user.planEndDate);
        daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      res.status(200).json({
        success: true,
        message: 'Current plan retrieved successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            region: user.region,
            currency: user.currency,
          },
          plan: {
            ...planResult.plan,
            status: user.planStatus,
            startDate: user.planStartDate,
            endDate: user.planEndDate,
            daysRemaining,
          },
          usage: usage
            ? {
                wordsUsed: usage.wordsUsed,
                remainingWords: usage.remainingWords,
                monthlyLimit: usage.monthlyLimit,
                dailyWordsUsed: usage.dailyWordsUsed,
                dailyLimit: usage.dailyLimit,
              }
            : null,
        },
      });
    } catch (error: any) {
      console.error('Error getting current plan:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve current plan',
      });
    }
  };

  /**
   * Compare plans with regional pricing (Public/Protected)
   * GET /api/billing/plans/compare?plans=plus,pro
   * GET /api/billing/plans/compare?plans=plus,pro&cycle=yearly
   * 
   * Examples:
   * - GET /api/billing/plans/compare?plans=plus,pro → Monthly comparison
   * - GET /api/billing/plans/compare?plans=plus,pro&cycle=yearly → Yearly comparison
   */
  public comparePlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const { plans } = req.query;

      if (!plans || typeof plans !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Plan names are required (comma-separated)',
        });
        return;
      }

      // Get user region using multi-layer detection
      const userRegion = await this.getUserRegion(req);
      
      // Get billing cycle from query
      const billingCycle = this.getBillingCycle(req);

      const planNames = plans.split(',').map((p) => p.trim().toUpperCase());

      // Get all plans and filter by requested names
      const allPlansResult = await billingService.getAllPlans(userRegion, billingCycle);

      if (!allPlansResult.success) {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve plans',
        });
        return;
      }

      const comparisonData = allPlansResult.plans?.filter((plan: any) =>
        planNames.includes(plan.name.toUpperCase())
      );

      if (!comparisonData || comparisonData.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No valid plans found for comparison',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Plan comparison retrieved successfully',
        data: {
          plans: comparisonData,
          region: userRegion,
          billingCycle,
          total: comparisonData.length,
        },
      });
    } catch (error: any) {
      console.error('Error comparing plans:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to compare plans',
      });
    }
  };

  /**
   * Get regional pricing information (Public/Protected)
   * GET /api/billing/pricing
   * GET /api/billing/pricing?cycle=yearly
   * 
   * Examples:
   * - GET /api/billing/pricing → Monthly pricing
   * - GET /api/billing/pricing?cycle=yearly → Yearly pricing with savings
   * - GET /api/billing/pricing?cycle=yearly&region=INTL → Yearly, INTL pricing
   */
  public getPricing = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get user region using multi-layer detection
      const userRegion = await this.getUserRegion(req);
      
      // Get billing cycle from query
      const billingCycle = this.getBillingCycle(req);

      // Get all plans with regional pricing
      const result = await billingService.getAllPlans(userRegion, billingCycle);

      if (!result.success) {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve pricing',
        });
        return;
      }

      const pricing = result.plans?.map((plan: any) => ({
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        price: plan.price,
        priceMonthly: plan.priceMonthly,
        displayPrice: plan.displayPrice,
        currency: plan.currency,
        billingCycle: plan.billingCycle,
        discount: plan.discount,
        yearlySavings: plan.yearlySavings,
        features: plan.features,
        limits: plan.limits,
      }));

      res.status(200).json({
        success: true,
        message: 'Pricing information retrieved successfully',
        data: {
          pricing,
          region: userRegion,
          currency: userRegion === Region.IN ? 'INR' : 'USD',
          billingCycle,
        },
      });
    } catch (error: any) {
      console.error('Error getting pricing:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve pricing',
      });
    }
  };
}

// ==========================================
// EXPORT SINGLETON INSTANCE
// ==========================================

const billingController = new BillingController();
export default billingController;