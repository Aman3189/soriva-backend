// src/constants/index.ts
/**
 * ==========================================
 * SORIVA CONSTANTS - CENTRAL EXPORT HUB
 * ==========================================
 * Single point of import for all plan-related constants and managers
 * Last Updated: November 4, 2025 - Studio Integration Fixed
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
 * Changes (November 4, 2025):
 * - FIXED: Studio exports aligned with plans.ts
 * - REMOVED: Missing CreditConfig, StudioFeature exports
 * - ADDED: StudioBooster, STUDIO_BOOSTERS, STUDIO_FEATURES
 */

// ==========================================
// PLANS DATA LAYER (Pure Data)
// ==========================================
export type { BoosterType } from '@shared/types/prisma-enums';

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
  type StudioBooster,
  
  // Static Configuration
  PLANS_STATIC_CONFIG,
  STUDIO_BOOSTERS,
  STUDIO_FEATURES,
  
  // Constants
  GATEWAY_FEE_PERCENTAGE,
  HINGLISH_TOKEN_SAVINGS,
  COOLDOWN_DURATION_HOURS,
  ADDON_MAX_PER_MONTH,
  TRIAL_MAX_DAYS,
  FALLBACK_TRIGGER_RATE,
  USER_LOCATION,
  
  // Studio Constants
  STUDIO_CREDIT_VALUE,
  STUDIO_CREDITS_PER_RUPEE,
  STUDIO_FREE_PREVIEWS,
  STUDIO_EXTRA_PREVIEW_COST,
  STUDIO_MAX_PREVIEWS,
  STUDIO_BOOSTER_MAX_PER_MONTH,
  
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
  // Note: STUDIO_FEATURES already exported from plans.ts above
  
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