/**
 * ==========================================
 * SORIVA BOOSTER ROUTES v3.2 (UPDATED)
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Updated: January 2026
 * Purpose: Complete API endpoints for booster system
 * 
 * CHANGES (January 2026):
 * - ✅ REMOVED: Studio Booster routes (migrated to images system)
 * - ✅ MAINTAINED: Cooldown Booster routes
 * - ✅ MAINTAINED: Addon Booster routes
 * - ✅ MAINTAINED: STARTER Plan Booster routes
 * 
 * ROUTES:
 * - Cooldown Booster (eligibility + purchase)
 * - Addon Booster (availability + purchase + queue)
 * - STARTER Plan Boosters
 * - General (active, available, history)
 * ==========================================
 */

import { Router } from 'express';
import boosterController from './booster.controller';
// import { authenticate } from '../../middlewares/auth.middleware'; // Enable in production

const router = Router();

// ==========================================
// COOLDOWN BOOSTER ROUTES
// ==========================================

/**
 * @route   GET /api/billing/booster/cooldown/eligibility
 * @desc    Check if user is eligible for cooldown booster
 * @access  Private
 */
router.get(
  '/cooldown/eligibility',
  // authenticate, // Enable in production
  (req, res) => boosterController.checkCooldownEligibility(req, res)
);

/**
 * @route   POST /api/billing/booster/cooldown/purchase
 * @desc    Purchase cooldown booster (2× daily capacity)
 * @access  Private
 * @body    { paymentMethod: string, transactionId?: string }
 */
router.post(
  '/cooldown/purchase',
  // authenticate, // Enable in production
  (req, res) => boosterController.purchaseCooldownBooster(req, res)
);

// ==========================================
// ADDON BOOSTER ROUTES
// ==========================================

/**
 * @route   GET /api/billing/booster/addon/availability
 * @desc    Check addon booster availability and queue status
 * @access  Private
 */
router.get(
  '/addon/availability',
  // authenticate, // Enable in production
  (req, res) => boosterController.checkAddonAvailability(req, res)
);

/**
 * @route   POST /api/billing/booster/addon/purchase
 * @desc    Purchase addon booster (fresh capacity pool)
 * @access  Private
 * @body    { paymentMethod: string, transactionId?: string }
 */
router.post(
  '/addon/purchase',
  // authenticate, // Enable in production
  (req, res) => boosterController.purchaseAddonBooster(req, res)
);

// ==========================================
// STUDIO BOOSTER ROUTES - REMOVED (January 2026)
// ==========================================
// Studio credits system has been migrated to the Images system
// See: /api/images/* routes for image generation features

// ==========================================
// GENERAL BOOSTER ROUTES
// ==========================================

/**
 * @route   GET /api/billing/booster/active
 * @desc    Get all active boosters for user
 * @access  Private
 */
router.get(
  '/active',
  // authenticate, // Enable in production
  (req, res) => boosterController.getActiveBoosters(req, res)
);

/**
 * @route   GET /api/billing/booster/available
 * @desc    Get all available booster options with eligibility
 * @access  Private
 */
router.get(
  '/available',
  // authenticate, // Enable in production
  (req, res) => boosterController.getAvailableBoosters(req, res)
);

/**
 * @route   GET /api/billing/booster/history
 * @desc    Get booster purchase history
 * @access  Private
 * @query   ?limit=10 (optional)
 */
router.get(
  '/history',
  // authenticate, // Enable in production
  (req, res) => boosterController.getBoosterHistory(req, res)
);

/**
 * @route   GET /api/billing/booster/queue
 * @desc    Get addon booster queue status
 * @access  Private
 */
router.get(
  '/queue',
  // authenticate, // Enable in production
  (req, res) => boosterController.getQueueStatus(req, res)
);

// ==========================================
// STARTER PLAN BOOSTER ROUTES
// Cooldown: ₹9 India | FREE International (1x/month)
// Addon: ₹19/350K India | $1/650K International (5x/month)
// ==========================================

/**
 * @route   GET /api/billing/booster/starter/addon/check
 * @desc    Check STARTER addon availability (₹19/350K or $1/650K)
 * @access  Private
 */
router.get(
  '/starter/addon/check',
  // authenticate,
  (req, res) => boosterController.checkStarterAddonAvailability(req, res)
);

/**
 * @route   POST /api/billing/booster/starter/addon/purchase
 * @desc    Purchase STARTER addon booster (separate token pool, NO daily cap!)
 * @access  Private
 * @body    { paymentMethod: string, transactionId: string }
 */
router.post(
  '/starter/addon/purchase',
  // authenticate,
  (req, res) => boosterController.purchaseStarterAddonBooster(req, res)
);

/**
 * @route   GET /api/billing/booster/starter/addon/status
 * @desc    Get STARTER addon status (for progress bar)
 * @access  Private
 */
router.get(
  '/starter/addon/status',
  // authenticate,
  (req, res) => boosterController.getStarterAddonStatus(req, res)
);

/**
 * @route   GET /api/billing/booster/starter/cooldown/check
 * @desc    Check STARTER cooldown eligibility (₹9 India | FREE INTL)
 * @access  Private
 */
router.get(
  '/starter/cooldown/check',
  // authenticate,
  (req, res) => boosterController.checkStarterCooldownEligibility(req, res)
);

/**
 * @route   POST /api/billing/booster/starter/cooldown/purchase
 * @desc    Purchase STARTER cooldown (India - ₹9)
 * @access  Private
 * @body    { paymentMethod: string, transactionId: string }
 */
router.post(
  '/starter/cooldown/purchase',
  // authenticate,
  (req, res) => boosterController.purchaseStarterCooldown(req, res)
);

/**
 * @route   POST /api/billing/booster/starter/cooldown/activate
 * @desc    Activate FREE cooldown (International only - no payment!)
 * @access  Private
 */
router.post(
  '/starter/cooldown/activate',
  // authenticate,
  (req, res) => boosterController.activateFreeStarterCooldown(req, res)
);

// ==========================================
// EXPORT ROUTER
// ==========================================

export default router;