// src/modules/admin/audit.routes.ts
// ============================================
// VALUE AUDIT ANALYTICS ROUTES
// Admin dashboard endpoints with FORTRESS protection
// ============================================
import { Router } from 'express';
import { auditController } from './audit.controller';
import { authMiddleware } from '../auth/middleware/auth.middleware';
import { adminGuard, adminGuardLight } from '../../middleware/admin-guard.middleware';

/**
 * ==========================================
 * ADMIN PROTECTION ENABLED - PHASE 2 STEP 4
 * ==========================================
 * Security Layers:
 * 1. authMiddleware - User authentication (JWT)
 * 2. adminGuardLight - IP allowlist + Rate limit + Audit (read routes)
 * 3. adminGuard - Full protection (write/dangerous routes)
 * 
 * Last Updated: November 18, 2025
 */

const router = Router();

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VALUE AUDIT ROUTES - ADMIN PROTECTED
 * All routes require authentication + admin IP allowlist
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * @route   GET /api/admin/audit/summary
 * @desc    Get overall value audit summary
 * @access  Private (Admin only - IP restricted)
 * @query   ?planType=STARTER (optional filter)
 * @protection adminGuardLight (IP + Rate limit + Audit)
 */
router.get(
  '/summary',
  authMiddleware,
  adminGuardLight, // ✅ Admin IP + Audit logging
  auditController.getSummary
);

/**
 * @route   GET /api/admin/audit/plans/:planType
 * @desc    Get analytics for specific plan
 * @access  Private (Admin only - IP restricted)
 * @protection adminGuardLight (IP + Rate limit + Audit)
 */
router.get(
  '/plans/:planType',
  authMiddleware,
  adminGuardLight, // ✅ Admin IP + Audit logging
  auditController.getByPlan
);

/**
 * @route   GET /api/admin/audit/compare
 * @desc    Compare all plans
 * @access  Private (Admin only - IP restricted)
 * @protection adminGuardLight (IP + Rate limit + Audit)
 */
router.get(
  '/compare',
  authMiddleware,
  adminGuardLight, // ✅ Admin IP + Audit logging
  auditController.comparePlans
);

/**
 * @route   GET /api/admin/audit/insights
 * @desc    Get efficiency insights and recommendations
 * @access  Private (Admin only - IP restricted)
 * @protection adminGuardLight (IP + Rate limit + Audit)
 */
router.get(
  '/insights',
  authMiddleware,
  adminGuardLight, // ✅ Admin IP + Audit logging
  auditController.getInsights
);

/**
 * @route   POST /api/admin/audit/clear
 * @desc    Clear audit logs (DANGEROUS OPERATION!)
 * @access  Private (Super Admin only - Full protection)
 * @protection adminGuard (IP + Token + Rate limit + Audit)
 * @warning This route deletes data - requires full admin verification
 */
router.post(
  '/clear',
  authMiddleware,
  adminGuard, // ✅ FULL ADMIN PROTECTION (IP + Token + Audit)
  auditController.clearLogs
);

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PROTECTION SUMMARY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Read Routes (GET):
 * - authMiddleware: Verify user is logged in
 * - adminGuardLight: IP allowlist + rate limiting + audit logging
 * 
 * Dangerous Routes (POST /clear):
 * - authMiddleware: Verify user is logged in
 * - adminGuard: FULL protection (IP + token + strict rate limit + audit)
 * 
 * Rate Limits:
 * - Development: 100 req/hour
 * - Production: 10 req/hour
 * 
 * IP Allowlist:
 * - Configure in .env: ADMIN_ALLOWED_IPS=127.0.0.1,YOUR_OFFICE_IP
 * - Default: localhost only
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXPORT
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export default router;