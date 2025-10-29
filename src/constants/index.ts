// src/constants/index.ts
/**
 * ==========================================
 * SORIVA CONSTANTS - CENTRAL EXPORT HUB
 * ==========================================
 * Single point of import for all plan-related constants and managers
 * Last Updated: October 14, 2025 (Evening - FULLY DYNAMIC!)
 *
 * USAGE:
 * import { PlanType, plansManager, PLANS_STATIC_CONFIG } from '@/constants';
 *
 * ARCHITECTURE:
 * ✅ Re-exports everything from plans.ts (data layer)
 * ✅ Re-exports everything from plansManager.ts (logic layer)
 * ✅ Single source of truth for imports
 * ✅ FULLY DYNAMIC - No hardcoded configs!
 *
 * Changes (Session 2):
 * - REMOVED: MEMORY_DAYS export (now dynamic via plan.limits.memoryDays)
 * - REMOVED: RESPONSE_DELAYS export (now dynamic via plan.limits.responseDelay)
 */

// ==========================================
// PLANS DATA LAYER (Pure Data)
// ==========================================
export type { BoosterType } from '../types/prisma-enums';

export {
  // Enums
  PlanType,
  AIProvider,

  // Interfaces
  type Plan,
  type AIModel,
  type TrialConfig,
  type CooldownBooster,
  type AddonBooster,
  type UsageLimits,
  type DocumentIntelligence,
  type CreditConfig,
  type StudioFeature,

  // Static Configuration
  PLANS_STATIC_CONFIG,
  STUDIO_FEATURES_CONFIG,

  // Constants
  GATEWAY_FEE_PERCENTAGE,
  HINGLISH_TOKEN_SAVINGS,
  COOLDOWN_DURATION_HOURS,
  ADDON_MAX_PER_MONTH,
  MINIMUM_CREDITS,
  CREDITS_PER_RUPEE,
  CREDIT_FORMULA_MULTIPLIER,
  TRIAL_MAX_DAYS,
  FALLBACK_TRIGGER_RATE,
  USER_LOCATION,
  // ✅ REMOVED: MEMORY_DAYS (now dynamic - use plan.limits.memoryDays)
  // ✅ REMOVED: RESPONSE_DELAYS (now dynamic - use plan.limits.responseDelay)
} from './plans';

// ==========================================
// PLANS LOGIC LAYER (Business Logic)
// ==========================================

export {
  // Primary exports
  plansManager, // Singleton instance (use this!)
  PlansManagerClass, // Class (for testing/advanced use)

  // Re-export for backward compatibility
  PLANS,
  STUDIO_FEATURES,

  // Helper functions (backward compatibility)
  getPlanByType,
  getAllPlans,
  getEnabledPlans,
  getLaunchPlans,
  getHeroPlan,
  calculateAddonDailyDistribution,
  getBotResponseLimit,
  hasDocumentation,
  getMonthlyWordLimit,
  getDailyWordLimit,
  hasCooldownBooster,
  hasAddonBooster,
  isValidPlanType,
} from './plansManager';

// ==========================================
// CONVENIENCE EXPORTS
// ==========================================

/**
 * Quick access to commonly used items
 */
import { plansManager } from './plansManager';
import { PLANS_STATIC_CONFIG } from './plans';

// Default export for convenience
export default {
  plansManager,
  plans: PLANS_STATIC_CONFIG,
};
