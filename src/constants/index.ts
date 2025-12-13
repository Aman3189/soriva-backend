// src/constants/index.ts
/**
 * ==========================================
 * SORIVA CONSTANTS - CENTRAL EXPORT HUB
 * ==========================================
 * Single point of import for all plan-related constants and managers
 * Last Updated: November 6, 2025 - Booster Enums Added
 *
 * USAGE:
 * import { PlanType, plansManager, PLANS_STATIC_CONFIG, BoosterCategory, BoosterStatus } from '@/constants';
 *
 * ARCHITECTURE:
 * ✅ Re-exports everything from plans.ts (data layer)
 * ✅ Re-exports everything from plansManager.ts (logic layer)
 * ✅ Single source of truth for imports
 * ✅ FULLY DYNAMIC - No hardcoded configs!
 *
 * Changes (November 6, 2025):
 * - ADDED: BoosterCategory enum
 * - ADDED: BoosterStatus enum
 *
 * Changes (November 4, 2025):
 * - FIXED: Studio exports aligned with plans.ts
 * - REMOVED: Missing CreditConfig, StudioFeature exports
 * - ADDED: StudioBooster, STUDIO_BOOSTERS, STUDIO_FEATURES
 */

// ==========================================
// BOOSTER ENUMS (NEW - November 6, 2025)
// ==========================================
export enum BoosterCategory {
  COOLDOWN = 'COOLDOWN',
  ADDON = 'ADDON',
}

export enum BoosterStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

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

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}
// ==========================================
// CONVENIENCE EXPORTS
// ==========================================
/**
 * Quick access to commonly used items
 */
import { plansManager } from './plansManager';
import { PLANS_STATIC_CONFIG } from './plans';

// Default export for convenience
// ==========================================
// TEMPLATES LAYER (Templates Configuration)
// ==========================================

export {
  // Enums
  TemplateId,
  TemplateCategory,
  
  // Interface
  type Template,
  
  // Manager
  templatesManager,
  TemplatesManager,
  
  // Static Data
  TEMPLATES_STATIC_CONFIG,
  PLAN_TEMPLATE_ACCESS_STATIC,
  
  // Helper Functions
  getAllTemplates,
  getEnabledTemplates,
  getTemplatesForPlan,
  canAccessTemplate,
  getTemplateById,
  getTemplatesByCategory,
  getLockedTemplates,
  getMinPlanForTemplate,
  getPromptHint,
  getMaxWelcomeTokens,
  isValidTemplateId,
} from './templates.config';
import { templatesManager } from './templates.config';

export default {
  plansManager,
  plans: PLANS_STATIC_CONFIG,
  templatesManager,
};
