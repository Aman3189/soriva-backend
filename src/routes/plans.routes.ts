import { Router, Request, Response } from 'express';
import { PlansService } from '@services/plans/plans.service';
import { Region } from '@constants/plans';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { CacheTTL, CacheNamespace } from '../types/cache.types';

/**
 * ==========================================
 * PLANS ROUTES - REGIONAL PRICING API
 * ==========================================
 * Endpoints for retrieving plans with region-based pricing
 * Last Updated: November 19, 2025 (Added caching)
 */

const router = Router();

/**
 * GET /api/plans
 * Get all enabled plans with regional pricing
 * Uses region from middleware (req.region)
 * CACHED: 1 hour (public data)
 */
router.get('/', 
  cacheMiddleware.cache({
    namespace: CacheNamespace.PUBLIC,
    ttl: CacheTTL.LONG, // 1 hour
    keyGenerator: (req) => {
      const region = (req as any).region || Region.INDIA;
      return `plans:all:${region}`;
    }
  }),
  (req: Request, res: Response) => {
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
  }
);

/**
 * GET /api/plans/comparison
 * Get plan comparison data for pricing page
 * CACHED: 1 hour (public data)
 */
router.get('/comparison',
  cacheMiddleware.cache({
    namespace: CacheNamespace.PUBLIC,
    ttl: CacheTTL.LONG, // 1 hour
    keyGenerator: (req) => {
      const region = (req as any).region || Region.INDIA;
      return `plans:comparison:${region}`;
    }
  }),
  (req: Request, res: Response) => {
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
  }
);

/**
 * GET /api/plans/:planType
 * Get single plan details by type
 * CACHED: 1 hour (public data)
 */
router.get('/:planType',
  cacheMiddleware.cache({
    namespace: CacheNamespace.PUBLIC,
    ttl: CacheTTL.LONG, // 1 hour
    keyGenerator: (req) => {
      const region = (req as any).region || Region.INDIA;
      const planType = req.params.planType?.toUpperCase() || 'UNKNOWN';
      return `plans:single:${planType}:${region}`;
    }
  }),
  (req: Request, res: Response) => {
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
  }
);


export default router;