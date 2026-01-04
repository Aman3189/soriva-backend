/**
 * ==========================================
 * SORIVA BOOSTER ROUTES v3.0 (COMPLETE)
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Updated: November 21, 2025
 * Purpose: Complete API endpoints for booster system
 * 
 * ROUTES:
 * - Cooldown Booster (eligibility + purchase)
 * - Addon Booster (availability + purchase + queue)
 * - Studio Booster (packages + purchase)
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
// STUDIO BOOSTER ROUTES
// ==========================================

/**
 * @route   GET /api/billing/booster/studio/packages
 * @desc    Get all studio credit packages with region-specific pricing
 * @access  Public (can be viewed without login)
 */
router.get(
  '/studio/packages',
  (req, res) => boosterController.getStudioPackages(req, res)
);

/**
 * @route   POST /api/billing/booster/studio/purchase
 * @desc    Purchase studio credits booster
 * @access  Private
 * @body    { boosterType: "LITE" | "PRO" | "MAX", paymentMethod?: string, transactionId?: string }
 */
router.post(
  '/studio/purchase',
  // authenticate, // Enable in production
  (req, res) => boosterController.purchaseStudioBooster(req, res)
);

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
// EXPORT ROUTER
// ==========================================

export default router;
