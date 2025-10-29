/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA BOOSTER ROUTES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep Singh, Punjab, India
 * Updated: October 12, 2025
 * Purpose: API endpoints for booster purchases
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Router } from 'express';
import boosterController from './booster.controller';
// import { authenticate } from '../../middlewares/auth.middleware'; // Phase 2

const router = Router();

/**
 * @route   POST /api/billing/booster/cooldown/purchase
 * @desc    Purchase cooldown booster (24hr unlock)
 * @access  Private
 * @body    { paymentMethod: string, transactionId?: string }
 */
router.post(
  '/cooldown/purchase',
  // authenticate, // Phase 2
  (req, res) => boosterController.purchaseCooldownBooster(req, res)
);

/**
 * @route   POST /api/billing/booster/addon/purchase
 * @desc    Purchase addon booster (extra words + credits)
 * @access  Private
 * @body    { paymentMethod: string, transactionId?: string }
 */
router.post(
  '/addon/purchase',
  // authenticate, // Phase 2
  (req, res) => boosterController.purchaseAddonBooster(req, res)
);

/**
 * @route   GET /api/billing/booster/active
 * @desc    Get all active boosters for user
 * @access  Private
 */
router.get(
  '/active',
  // authenticate, // Phase 2
  (req, res) => boosterController.getActiveBoosters(req, res)
);

/**
 * @route   GET /api/billing/booster/available
 * @desc    Get available booster options with eligibility
 * @access  Private
 */
router.get(
  '/available',
  // authenticate, // Phase 2
  (req, res) => boosterController.getAvailableBoosters(req, res)
);

/**
 * @route   GET /api/billing/booster/history
 * @desc    Get booster purchase history
 * @access  Private
 */
router.get(
  '/history',
  // authenticate, // Phase 2
  (req, res) => boosterController.getBoosterHistory(req, res)
);

export default router;
