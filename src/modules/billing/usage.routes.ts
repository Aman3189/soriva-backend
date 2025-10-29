/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA USAGE ROUTES (SECURE VERSION)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep Singh, Punjab, India
 * Updated: October 12, 2025
 * Purpose: API endpoints for usage tracking with FULL CONFIDENTIALITY
 *
 * SECURITY:
 * - Public endpoints: NO exact numbers
 * - Admin endpoints: Full access (with auth)
 * - Deprecated endpoints: Redirects to secure versions
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Router } from 'express';
import usageController from './usage.controller';

// import { authenticate } from '../../middlewares/auth.middleware'; // Phase 2
// import { isAdmin } from '../../middlewares/admin.middleware'; // Phase 2

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUBLIC SECURE ENDPOINTS (NO EXACT NUMBERS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @route GET /api/billing/usage/status
 * @desc Get user's current status (SECURE - visual indicators only)
 * @access Private
 * @returns {
 *   status: 'green' | 'yellow' | 'orange' | 'red' | 'empty',
 *   statusMessage: string,
 *   icon: string,
 *   color: string,
 *   canChat: boolean,
 *   plan: string,
 *   memoryDays: number,
 *   responseDelay: number,
 *   boosters: {...}
 * }
 * @new Primary endpoint for usage status
 */
router.get(
  '/status',
  // authenticate, // Phase 2
  (req, res) => usageController.getUserStatus(req, res)
);

/**
 * @route POST /api/billing/usage/check
 * @desc Check if user can use specified words
 * @access Private
 * @body { wordsToUse: number }
 * @returns { canUse: boolean, reason?: string }
 * @secure Returns only boolean, no exact numbers
 */
router.post(
  '/check',
  // authenticate, // Phase 2
  (req, res) => usageController.checkUsage(req, res)
);

/**
 * @route POST /api/billing/usage/deduct
 * @desc Deduct words from user's usage
 * @access Private
 * @body { wordsUsed: number }
 * @returns { success: boolean, message: string }
 * @secure Does not return usage details
 */
router.post(
  '/deduct',
  // authenticate, // Phase 2
  (req, res) => usageController.deductUsage(req, res)
);

/**
 * @route GET /api/billing/usage/studio-credits
 * @desc Get studio credits info
 * @access Private
 * @returns { hasCredits: boolean, remainingCredits: number, ... }
 */
router.get(
  '/studio-credits',
  // authenticate, // Phase 2
  (req, res) => usageController.getStudioCredits(req, res)
);

/**
 * @route GET /api/billing/usage/booster-context
 * @desc Get booster awareness context for AI
 * @access Private
 * @returns { cooldownToday: number, activeAddons: number, hasActiveBoosters: boolean }
 */
router.get(
  '/booster-context',
  // authenticate, // Phase 2
  (req, res) => usageController.getBoosterContext(req, res)
);

/**
 * @route POST /api/billing/usage/reset-daily
 * @desc Manually reset daily usage (for testing/user)
 * @access Private
 */
router.post(
  '/reset-daily',
  // authenticate, // Phase 2
  (req, res) => usageController.resetDailyUsage(req, res)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEPRECATED ENDPOINTS (Keep for backward compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @route GET /api/billing/usage/current
 * @desc Get current usage stats
 * @access Private
 * @deprecated Use /api/billing/usage/status instead
 * @warning Now returns secure status instead of exact numbers
 */
router.get(
  '/current',
  // authenticate, // Phase 2
  (req, res) => usageController.getCurrentUsage(req, res)
);

/**
 * @route GET /api/billing/usage/limits
 * @desc Get usage limits for user's plan
 * @access Private
 * @deprecated Use /api/billing/usage/status instead
 * @warning Now returns secure status instead of exact limits
 */
router.get(
  '/limits',
  // authenticate, // Phase 2
  (req, res) => usageController.getUsageLimits(req, res)
);

/**
 * @route GET /api/billing/usage/history
 * @desc Get usage history
 * @access Private
 * @query days?: number (default 30, max 90)
 * @deprecated Feature not implemented yet
 * @returns 501 Not Implemented
 */
router.get(
  '/history',
  // authenticate, // Phase 2
  (req, res) => usageController.getUsageHistory(req, res)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN-ONLY ENDPOINTS (EXACT NUMBERS - PROTECTED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @route GET /api/billing/usage/internal
 * @desc Get exact usage data for monitoring (ADMIN ONLY!)
 * @access Admin
 * @query userId: string (required)
 * @returns Full internal stats with exact numbers
 * @protected Requires admin authentication
 */
router.get(
  '/internal',
  // authenticate, // Phase 2
  // isAdmin, // Phase 2
  (req, res) => usageController.getInternalUsage(req, res)
);

/**
 * @route GET /api/billing/usage/admin/stats
 * @desc Get global usage statistics (ADMIN ONLY!)
 * @access Admin
 * @returns {
 *   totalUsers: number,
 *   totalWordsUsed: number,
 *   avgWordsPerUser: number,
 *   usersOverLimit: number
 * }
 * @protected Requires admin authentication
 */
router.get(
  '/admin/stats',
  // authenticate, // Phase 2
  // isAdmin, // Phase 2
  (req, res) => usageController.getGlobalStats(req, res)
);

/**
 * @route POST /api/billing/usage/admin/reset-all-daily
 * @desc Reset daily usage for ALL users (ADMIN ONLY!)
 * @access Admin
 * @purpose Cron job trigger or manual reset
 * @protected Requires admin authentication
 */
router.post(
  '/admin/reset-all-daily',
  // authenticate, // Phase 2
  // isAdmin, // Phase 2
  (req, res) => usageController.resetAllDailyUsage(req, res)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT ROUTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default router;
