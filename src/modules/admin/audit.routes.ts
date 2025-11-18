// src/routes/audit.routes.ts
// ============================================
// VALUE AUDIT ANALYTICS ROUTES
// Admin dashboard endpoints
// ============================================
import { Router } from 'express';
import { auditController } from './audit.controller';
import { authMiddleware } from '../auth/middleware/auth.middleware';

// TODO: Add admin auth middleware
// import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VALUE AUDIT ROUTES
 * All routes require authentication (+ admin in production)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * @route   GET /api/audit/summary
 * @desc    Get overall value audit summary
 * @access  Private (Admin)
 * @query   ?planType=STARTER (optional filter)
 */
router.get(
  '/summary',
  authMiddleware,
  // requireAdmin,  // TODO: Add in production
  auditController.getSummary
);

/**
 * @route   GET /api/audit/plans/:planType
 * @desc    Get analytics for specific plan
 * @access  Private (Admin)
 */
router.get(
  '/plans/:planType',
  authMiddleware,
  // requireAdmin,
  auditController.getByPlan
);

/**
 * @route   GET /api/audit/compare
 * @desc    Compare all plans
 * @access  Private (Admin)
 */
router.get(
  '/compare',
  authMiddleware,
  // requireAdmin,
  auditController.comparePlans
);

/**
 * @route   GET /api/audit/insights
 * @desc    Get efficiency insights and recommendations
 * @access  Private (Admin)
 */
router.get(
  '/insights',
  authMiddleware,
  // requireAdmin,
  auditController.getInsights
);

/**
 * @route   POST /api/audit/clear
 * @desc    Clear audit logs (dangerous!)
 * @access  Private (Admin only)
 */
router.post(
  '/clear',
  authMiddleware,
  // requireAdmin,  // MUST add in production!
  auditController.clearLogs
);

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXPORT
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export default router;