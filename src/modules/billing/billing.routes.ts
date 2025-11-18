// src/modules/billing/billing.routes.ts
/**
 * ==========================================
 * BILLING ROUTES - Regional Pricing Support
 * ==========================================
 * Updated: November 12, 2025
 * Changes:
 * - ✅ ADDED: optionalAuth middleware on public routes
 * - ✅ FIXED: Region detection for authenticated users
 * - ✅ MAINTAINED: All existing functionality
 */

import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../auth/middleware/auth.middleware';
import billingController from './billing.controller';
import usageController from './usage.controller';
import subscriptionController from './subscription.controller';
import boosterController from './booster.controller';

const router = Router();

// ============================================
// 📋 PLAN ROUTES (Public/Auth)
// ============================================

/**
 * @swagger
 * /api/billing/plans:
 *   get:
 *     summary: Get All Plans
 *     description: Retrieve all available subscription plans with pricing and features
 *     tags: [Billing]
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: PLUS
 *                       name:
 *                         type: string
 *                         example: Soriva Plus
 *                       price:
 *                         type: number
 *                         example: 149
 *                       currency:
 *                         type: string
 *                         example: INR
 *                       billingCycle:
 *                         type: string
 *                         example: monthly
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["5000 messages/month", "Fast AI responses", "Basic support"]
 *                       limits:
 *                         type: object
 *                         properties:
 *                           messages:
 *                             type: integer
 *                             example: 5000
 *                           storage:
 *                             type: integer
 *                             example: 1073741824
 */
router.get('/plans', optionalAuthMiddleware, billingController.getAllPlans);

/**
 * @swagger
 * /api/billing/plans/{planId}:
 *   get:
 *     summary: Get Plan Details
 *     description: Get detailed information about a specific subscription plan
 *     tags: [Billing]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [STARTER, PLUS, PRO, EDGE, LIFE]
 *           example: PLUS
 *         description: Plan identifier
 *     responses:
 *       200:
 *         description: Plan details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: PLUS
 *                     name:
 *                       type: string
 *                       example: Soriva Plus
 *                     description:
 *                       type: string
 *                       example: Perfect for individuals and small teams
 *                     price:
 *                       type: number
 *                       example: 149
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/plans/:planId', optionalAuthMiddleware, billingController.getPlanDetails);

/**
 * @swagger
 * /api/billing/current:
 *   get:
 *     summary: Get Current Plan
 *     description: Get the authenticated user's current subscription plan
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: string
 *                       example: PLUS
 *                     status:
 *                       type: string
 *                       example: active
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     autoRenew:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/current', authMiddleware, billingController.getCurrentPlan);

// ============================================
// 📊 USAGE ROUTES (Protected)
// ============================================

/**
 * @swagger
 * /api/billing/usage:
 *   get:
 *     summary: Get Current Usage
 *     description: Get user's current usage statistics and limits
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: integer
 *                           example: 1234
 *                         limit:
 *                           type: integer
 *                           example: 5000
 *                         remaining:
 *                           type: integer
 *                           example: 3766
 *                     storage:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: integer
 *                           example: 524288000
 *                         limit:
 *                           type: integer
 *                           example: 1073741824
 *                     resetDate:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/usage', authMiddleware, usageController.getCurrentUsage);

/**
 * @swagger
 * /api/billing/usage/check:
 *   post:
 *     summary: Check Usage Availability
 *     description: Check if user has enough quota for a specific action
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [messages, storage, api_calls]
 *                 example: messages
 *               amount:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Usage check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     allowed:
 *                       type: boolean
 *                       example: true
 *                     remaining:
 *                       type: integer
 *                       example: 3765
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/usage/check', authMiddleware, usageController.checkUsage);

/**
 * @swagger
 * /api/billing/usage/deduct:
 *   post:
 *     summary: Deduct Usage
 *     description: Deduct usage quota after an action is performed
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [messages, storage, api_calls]
 *                 example: messages
 *               amount:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Usage deducted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     remaining:
 *                       type: integer
 *                       example: 3764
 *       400:
 *         description: Insufficient quota
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/usage/deduct', authMiddleware, usageController.deductUsage);

/**
 * @swagger
 * /api/billing/usage/reset-daily:
 *   post:
 *     summary: Reset Daily Usage
 *     description: Reset daily usage counters (Admin only)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily usage reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Daily usage reset successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/usage/reset-daily', authMiddleware, usageController.resetDailyUsage);

// ============================================
// 💳 SUBSCRIPTION ROUTES (Protected)
// ============================================

/**
 * @swagger
 * /api/billing/subscription/upgrade:
 *   post:
 *     summary: Upgrade Plan
 *     description: Upgrade user's subscription to a higher tier
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 enum: [PLUS, PRO, EDGE, LIFE]
 *                 example: PRO
 *               paymentMethodId:
 *                 type: string
 *                 example: pm_1234567890
 *     responses:
 *       200:
 *         description: Plan upgraded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Plan upgraded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     newPlan:
 *                       type: string
 *                       example: PRO
 *                     effectiveDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid upgrade request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       402:
 *         description: Payment required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/subscription/upgrade', authMiddleware, subscriptionController.upgradePlan);

/**
 * @swagger
 * /api/billing/subscription/cancel:
 *   post:
 *     summary: Cancel Subscription
 *     description: Cancel user's active subscription
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Too expensive
 *               feedback:
 *                 type: string
 *                 example: Looking for more affordable options
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Subscription cancelled successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     validUntil:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/subscription/cancel', authMiddleware, subscriptionController.cancelSubscription);

/**
 * @swagger
 * /api/billing/subscription/renew:
 *   post:
 *     summary: Renew Subscription
 *     description: Manually renew an expired or cancelled subscription
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription renewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Subscription renewed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     newExpiryDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Cannot renew subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/subscription/renew', authMiddleware, subscriptionController.renewSubscription);

/**
 * @swagger
 * /api/billing/subscription/status:
 *   get:
 *     summary: Get Subscription Status
 *     description: Get detailed status of user's current subscription
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: string
 *                       example: PLUS
 *                     status:
 *                       type: string
 *                       enum: [active, cancelled, expired, trial]
 *                       example: active
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     expiryDate:
 *                       type: string
 *                       format: date-time
 *                     autoRenew:
 *                       type: boolean
 *                       example: true
 *                     daysRemaining:
 *                       type: integer
 *                       example: 25
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/subscription/status', authMiddleware, subscriptionController.getSubscriptionStatus);

/**
 * @swagger
 * /api/billing/subscription/history:
 *   get:
 *     summary: Get Subscription History
 *     description: Get user's complete subscription history
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: sub_123
 *                       plan:
 *                         type: string
 *                         example: PLUS
 *                       status:
 *                         type: string
 *                         example: completed
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       amount:
 *                         type: number
 *                         example: 149
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/subscription/history',
  authMiddleware,
  subscriptionController.getSubscriptionHistory
);

// ============================================
// 🚀 BOOSTER ROUTES (Protected)
// ============================================

/**
 * @swagger
 * /api/billing/booster/cooldown/purchase:
 *   post:
 *     summary: Purchase Cooldown Booster
 *     description: Purchase a cooldown reset booster to instantly reset rate limits
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boosterId
 *             properties:
 *               boosterId:
 *                 type: string
 *                 example: cooldown_instant
 *               paymentMethodId:
 *                 type: string
 *                 example: pm_1234567890
 *     responses:
 *       200:
 *         description: Cooldown booster purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cooldown booster activated
 *                 data:
 *                   type: object
 *                   properties:
 *                     boosterId:
 *                       type: string
 *                       example: cooldown_instant
 *                     activatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid booster purchase
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       402:
 *         description: Payment required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/booster/cooldown/purchase',
  authMiddleware,
  boosterController.purchaseCooldownBooster
);

/**
 * @swagger
 * /api/billing/booster/addon/purchase:
 *   post:
 *     summary: Purchase Addon Booster
 *     description: Purchase additional features or capacity as an addon
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addonType
 *             properties:
 *               addonType:
 *                 type: string
 *                 enum: [messages, storage, api_calls]
 *                 example: messages
 *               quantity:
 *                 type: integer
 *                 example: 1000
 *               paymentMethodId:
 *                 type: string
 *                 example: pm_1234567890
 *     responses:
 *       200:
 *         description: Addon booster purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 1000 messages added to your account
 *                 data:
 *                   type: object
 *                   properties:
 *                     addonType:
 *                       type: string
 *                       example: messages
 *                     quantity:
 *                       type: integer
 *                       example: 1000
 *                     newTotal:
 *                       type: integer
 *                       example: 6000
 *       400:
 *         description: Invalid addon purchase
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/booster/addon/purchase', authMiddleware, boosterController.purchaseAddonBooster);

/**
 * @swagger
 * /api/billing/booster/active:
 *   get:
 *     summary: Get Active Boosters
 *     description: Get list of currently active boosters for the user
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active boosters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: boost_123
 *                       type:
 *                         type: string
 *                         example: cooldown
 *                       activatedAt:
 *                         type: string
 *                         format: date-time
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/booster/active', authMiddleware, boosterController.getActiveBoosters);

/**
 * @swagger
 * /api/billing/booster/available:
 *   get:
 *     summary: Get Available Boosters
 *     description: Get list of all available boosters that can be purchased
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available boosters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: cooldown_instant
 *                       name:
 *                         type: string
 *                         example: Instant Cooldown Reset
 *                       description:
 *                         type: string
 *                         example: Instantly reset all rate limit cooldowns
 *                       price:
 *                         type: number
 *                         example: 49
 *                       type:
 *                         type: string
 *                         example: cooldown
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/booster/available', authMiddleware, boosterController.getAvailableBoosters);

/**
 * @swagger
 * /api/billing/booster/history:
 *   get:
 *     summary: Get Booster Purchase History
 *     description: Get complete history of booster purchases
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booster history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: boost_123
 *                       type:
 *                         type: string
 *                         example: cooldown
 *                       purchasedAt:
 *                         type: string
 *                         format: date-time
 *                       amount:
 *                         type: number
 *                         example: 49
 *                       status:
 *                         type: string
 *                         enum: [active, expired, used]
 *                         example: used
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/booster/history', authMiddleware, boosterController.getBoosterHistory);

// Studio Credits Booster Purchase
router.post(
  '/booster/studio/purchase',
  authMiddleware,
  boosterController.purchaseStudioBooster
);

// Studio Credits Balance
router.get('/usage/studio-credits', authMiddleware, usageController.getStudioCredits);

export default router;