import { Router, Request, Response } from 'express';
import { PlansService } from '@services/plans/plans.service';
import { Region } from '@constants/plans';

/**
 * ==========================================
 * PLANS ROUTES - REGIONAL PRICING API
 * ==========================================
 * Endpoints for retrieving plans with region-based pricing
 * Last Updated: November 12, 2025
 */

const router = Router();

/**
 * GET /api/plans
 * Get all enabled plans with regional pricing
 * Uses region from middleware (req.region)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    // Get region from middleware (defaults to INDIA if not set)
    const region = (req as any).region || Region.INDIA;

    const plans = PlansService.getPlans(region);

    res.status(200).json({
      success: true,
      region,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plans',
    });
  }
});

/**
 * GET /api/plans/comparison
 * Get plan comparison data for pricing page
 */
router.get('/comparison', (req: Request, res: Response) => {
  try {
    const region = (req as any).region || Region.INDIA;

    const comparison = PlansService.getPlanComparison(region);

    res.status(200).json({
      success: true,
      region,
      data: comparison,
    });
  } catch (error) {
    console.error('Error fetching plan comparison:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plan comparison',
    });
  }
});

/**
 * GET /api/plans/:planType
 * Get single plan details by type
 */
router.get('/:planType', (req: Request, res: Response) => {
  try {
    const { planType } = req.params;
    const region = (req as any).region || Region.INDIA;

    const plan = PlansService.getPlan(planType.toUpperCase() as any, region);

    res.status(200).json({
      success: true,
      region,
      data: plan,
    });
  } catch (error: any) {
    console.error('Error fetching plan:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Plan not found',
    });
  }
});

/**
 * GET /api/plans/studio/boosters
 * Get all studio boosters with regional pricing
 */
router.get('/studio/boosters', (req: Request, res: Response) => {
  try {
    const region = (req as any).region || Region.INDIA;

    const boosters = PlansService.getStudioBoosters(region);

    res.status(200).json({
      success: true,
      region,
      count: boosters.length,
      data: boosters,
    });
  } catch (error) {
    console.error('Error fetching studio boosters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studio boosters',
    });
  }
});

/**
 * GET /api/plans/studio/boosters/:boosterId
 * Get single studio booster details
 */
router.get('/studio/boosters/:boosterId', (req: Request, res: Response) => {
  try {
    const { boosterId } = req.params;
    const region = (req as any).region || Region.INDIA;

    const booster = PlansService.getStudioBooster(boosterId, region);

    res.status(200).json({
      success: true,
      region,
      data: booster,
    });
  } catch (error: any) {
    console.error('Error fetching studio booster:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Studio booster not found',
    });
  }
});

export default router;