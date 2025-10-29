// src/modules/billing/billing.routes.ts
import { Router } from 'express';
import { authenticateToken } from '../auth/auth.middleware';

import billingController from './billing.controller';
import usageController from './usage.controller';
import subscriptionController from './subscription.controller';
import boosterController from './booster.controller';

const router = Router();

// ============================================
// 📋 PLAN ROUTES (Public/Auth)
// ============================================

router.get('/plans', billingController.getAllPlans);
router.get('/plans/:planId', billingController.getPlanDetails);
router.get('/current', authenticateToken, billingController.getCurrentPlan);

// ============================================
// 📊 USAGE ROUTES (Protected)
// ============================================

router.get('/usage', authenticateToken, usageController.getCurrentUsage);
router.post('/usage/check', authenticateToken, usageController.checkUsage);
router.post('/usage/deduct', authenticateToken, usageController.deductUsage);
router.post('/usage/reset-daily', authenticateToken, usageController.resetDailyUsage);

// ============================================
// 💳 SUBSCRIPTION ROUTES (Protected)
// ============================================

router.post('/subscription/upgrade', authenticateToken, subscriptionController.upgradePlan);
router.post('/subscription/cancel', authenticateToken, subscriptionController.cancelSubscription);
router.post('/subscription/renew', authenticateToken, subscriptionController.renewSubscription);
router.get('/subscription/status', authenticateToken, subscriptionController.getSubscriptionStatus);
router.get(
  '/subscription/history',
  authenticateToken,
  subscriptionController.getSubscriptionHistory
);

// ============================================
// 🚀 BOOSTER ROUTES (Protected)
// ============================================

router.post(
  '/booster/cooldown/purchase',
  authenticateToken,
  boosterController.purchaseCooldownBooster
);
router.post('/booster/addon/purchase', authenticateToken, boosterController.purchaseAddonBooster);
router.get('/booster/active', authenticateToken, boosterController.getActiveBoosters);
router.get('/booster/available', authenticateToken, boosterController.getAvailableBoosters);
router.get('/booster/history', authenticateToken, boosterController.getBoosterHistory);

export default router;
