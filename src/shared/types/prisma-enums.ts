// src/shared/types/prisma-enums.ts
/**
 * ==========================================
 * PRISMA ENUMS & TYPE MAPPINGS
 * ==========================================
 * Centralized type definitions for Soriva Backend
 * Last Updated: January 19, 2026 - Added LITE plan support
 *
 * INCLUDES:
 * - Re-exported Prisma enums (including Region & Currency)
 * - Plan name mappings
 * - Regional pricing helpers
 * - Type-safe helper functions
 * - Validation utilities
 * 
 * CHANGES (January 19, 2026):
 * - ✅ ADDED: LITE plan to all mappings
 * - ✅ ADDED: 'lite' to PlanName type
 * - ✅ ADDED: lite_cooldown booster type
 */

// ==========================================
// RE-EXPORT PRISMA ENUMS
// ==========================================
export {
  PlanType,
  PlanStatus,
  BoosterCategory,
  SecurityStatus,
  ActivityTrend,
  Region,
  Currency,
} from '@prisma/client';

// Import for internal use
import {
  PlanType,
  PlanStatus,
  BoosterCategory,
  SecurityStatus,
  ActivityTrend,
  Region,
  Currency,
} from '@prisma/client';

// ==========================================
// PLAN TYPE DEFINITIONS
// ==========================================

/**
 * Plan name as used in planType field (lowercase string)
 * ✅ UPDATED: Added 'lite'
 */
export type PlanName = 'starter' | 'lite' | 'plus' | 'pro' | 'apex' | 'sovereign';

/**
 * Booster type strings used in database
 * ✅ UPDATED: Added lite_cooldown
 */
export type BoosterType =
  | 'starter_cooldown'
  | 'lite_cooldown'      // ✅ NEW
  | 'plus_cooldown'
  | 'plus_addon'
  | 'pro_cooldown'
  | 'pro_addon'
  | 'apex_cooldown'
  | 'apex_addon';

// ==========================================
// ⭐ NEW: REGIONAL & CURRENCY TYPES
// ==========================================

/**
 * Country code type (ISO 3166-1 alpha-2)
 */
export type CountryCode = string;

/**
 * Regional pricing configuration
 */
export interface RegionalPricing {
  region: Region;
  currency: Currency;
  symbol: string;
  price: number;
}

// ==========================================
// BIDIRECTIONAL MAPPINGS
// ==========================================

/**
 * Map PlanType enum to plan name (lowercase string)
 * Usage: PLAN_TYPE_TO_NAME[PlanType.STARTER] => 'starter'
 * ✅ UPDATED: Added LITE
 */
export const PLAN_TYPE_TO_NAME: Record<PlanType, PlanName> = {
  [PlanType.STARTER]: 'starter',
  [PlanType.LITE]: 'lite',           // ✅ NEW
  [PlanType.PLUS]: 'plus',
  [PlanType.PRO]: 'pro',
  [PlanType.APEX]: 'apex',
  [PlanType.SOVEREIGN]: 'sovereign',
};

/**
 * Map plan name (lowercase string) to PlanType enum
 * Usage: PLAN_NAME_TO_TYPE['starter'] => PlanType.STARTER
 * ✅ UPDATED: Added lite
 */
export const PLAN_NAME_TO_TYPE: Record<PlanName, PlanType> = {
  starter: PlanType.STARTER,
  lite: PlanType.LITE,               // ✅ NEW
  plus: PlanType.PLUS,
  pro: PlanType.PRO,
  apex: PlanType.APEX,
  sovereign: PlanType.SOVEREIGN,
};

/**
 * Human-readable plan display names
 * ✅ UPDATED: Added LITE
 */
export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  [PlanType.STARTER]: 'Soriva Starter',
  [PlanType.LITE]: 'Soriva Lite',    // ✅ NEW
  [PlanType.PLUS]: 'Soriva Plus',
  [PlanType.PRO]: 'Soriva Pro',
  [PlanType.APEX]: 'Soriva Apex',
  [PlanType.SOVEREIGN]: 'Soriva Sovereign',
};

/**
 * Plan prices in INR (India pricing)
 * ✅ UPDATED: Added LITE (Free)
 */
export const PLAN_PRICES: Record<PlanType, number> = {
  [PlanType.STARTER]: 0,
  [PlanType.LITE]: 0,                // ✅ NEW - Free plan
  [PlanType.PLUS]: 399,
  [PlanType.PRO]: 799,
  [PlanType.APEX]: 1199,
  [PlanType.SOVEREIGN]: 0,
};

/**
 * ⭐ NEW: Plan prices in USD (International pricing)
 * ✅ UPDATED: Added LITE (Free)
 */
export const PLAN_PRICES_USD: Record<PlanType, number> = {
  [PlanType.STARTER]: 0,
  [PlanType.LITE]: 0,                // ✅ NEW - Free plan
  [PlanType.PLUS]: 15.99,
  [PlanType.PRO]: 21.99,
  [PlanType.APEX]: 49.99,
  [PlanType.SOVEREIGN]: 0,
};

// ==========================================
// ⭐ NEW: REGIONAL & CURRENCY MAPPINGS
// ==========================================

/**
 * Currency symbols
 */
export const CURRENCY_SYMBOLS: any = {
  INR: '₹',
  USD: '$',
};

/**
 * Region to Currency mapping
 */
export const REGION_TO_CURRENCY: any = {
  IN: 'INR',
  INTL: 'USD',
};

/**
 * Region display names
 */
export const REGION_DISPLAY_NAMES: any = {
  IN: 'India',
  INTL: 'International',
};

/**
 * Payment gateway by region
 */
export const REGION_TO_PAYMENT_GATEWAY: any = {
  IN: 'razorpay',
  INTL: 'stripe',
};

/**
 * Exchange rate constants
 */
export const INR_TO_USD_RATE = 0.012; // ₹1 = $0.012
export const USD_TO_INR_RATE = 83.67; // $1 = ₹83.67

// ==========================================
// BOOSTER TYPE MAPPINGS
// ==========================================

/**
 * Map booster type string to category enum
 * ✅ UPDATED: Added lite_cooldown
 */
export const BOOSTER_TYPE_TO_CATEGORY: Record<BoosterType, BoosterCategory> = {
  starter_cooldown: BoosterCategory.COOLDOWN,
  lite_cooldown: BoosterCategory.COOLDOWN,  // ✅ NEW
  plus_cooldown: BoosterCategory.COOLDOWN,
  plus_addon: BoosterCategory.ADDON,
  pro_cooldown: BoosterCategory.COOLDOWN,
  pro_addon: BoosterCategory.ADDON,
  apex_cooldown: BoosterCategory.COOLDOWN,
  apex_addon: BoosterCategory.ADDON,
};

/**
 * Map plan type to its cooldown booster type
 * ✅ UPDATED: Added LITE
 */
export const PLAN_TO_COOLDOWN_BOOSTER: Record<PlanType, BoosterType> = {
  [PlanType.STARTER]: 'starter_cooldown',
  [PlanType.LITE]: 'lite_cooldown',          // ✅ NEW
  [PlanType.PLUS]: 'plus_cooldown',
  [PlanType.PRO]: 'pro_cooldown',
  [PlanType.APEX]: 'apex_cooldown',
  [PlanType.SOVEREIGN]: 'apex_cooldown',
};

/**
 * Map plan type to its addon booster type (null if no addon available)
 * ✅ UPDATED: Added LITE (no addon for free plans)
 */
export const PLAN_TO_ADDON_BOOSTER: Record<PlanType, BoosterType | null> = {
  [PlanType.STARTER]: null,
  [PlanType.LITE]: null,                     // ✅ NEW - No addon for free plan
  [PlanType.PLUS]: 'plus_addon',
  [PlanType.PRO]: 'pro_addon',
  [PlanType.APEX]: 'apex_addon',
  [PlanType.SOVEREIGN]: null,
};

// ==========================================
// PLAN STATUS HELPERS
// ==========================================

/**
 * Active plan statuses (user can use the service)
 */
export const ACTIVE_PLAN_STATUSES: PlanStatus[] = [PlanStatus.ACTIVE, PlanStatus.TRIAL];

/**
 * Inactive plan statuses (user cannot use the service)
 */
export const INACTIVE_PLAN_STATUSES: PlanStatus[] = [
  PlanStatus.EXPIRED,
  PlanStatus.CANCELLED,
  PlanStatus.PENDING,
];

// ==========================================
// SECURITY STATUS HELPERS
// ==========================================

/**
 * Security status priority (higher number = more severe)
 */
export const SECURITY_STATUS_PRIORITY: Record<SecurityStatus, number> = {
  [SecurityStatus.TRUSTED]: 0,
  [SecurityStatus.FLAGGED]: 1,
  [SecurityStatus.BLOCKED]: 2,
};

// ==========================================
// ACTIVITY TREND HELPERS
// ==========================================

/**
 * Positive activity trends
 */
export const POSITIVE_TRENDS: ActivityTrend[] = [
  ActivityTrend.NEW,
  ActivityTrend.INCREASING,
  ActivityTrend.STABLE,
];

/**
 * Negative activity trends
 */
export const NEGATIVE_TRENDS: ActivityTrend[] = [ActivityTrend.DECLINING, ActivityTrend.IRREGULAR];

// ==========================================
// TYPE-SAFE HELPER FUNCTIONS
// ==========================================

/**
 * Convert PlanType enum to plan name string
 * @param planType - PlanType enum value
 * @returns Lowercase plan name string
 */
export function planTypeToName(planType: PlanType): PlanName {
  return PLAN_TYPE_TO_NAME[planType];
}

/**
 * Convert plan name string to PlanType enum
 * @param planName - Lowercase plan name string
 * @returns PlanType enum value
 */
export function planNameToType(planName: PlanName): PlanType {
  return PLAN_NAME_TO_TYPE[planName];
}

/**
 * Get human-readable display name for a plan
 * @param planType - PlanType enum value
 * @returns Display name string
 */
export function getPlanDisplayName(planType: PlanType): string {
  return PLAN_DISPLAY_NAMES[planType];
}

/**
 * Get plan price in INR
 * @param planType - PlanType enum value
 * @returns Price in INR
 */
export function getPlanPrice(planType: PlanType): number {
  return PLAN_PRICES[planType];
}

/**
 * ⭐ NEW: Get plan price by region
 * @param planType - PlanType enum value
 * @param region - User's region (IN or INTL)
 * @returns Price in regional currency
 */
export function getPlanPriceByRegion(planType: PlanType, region: Region): number {
  if (region === Region.INTL) {
    return PLAN_PRICES_USD[planType];
  }
  return PLAN_PRICES[planType];
}

/**
 * ⭐ NEW: Get full regional pricing info
 * @param planType - PlanType enum value
 * @param region - User's region
 * @returns RegionalPricing object
 */
export function getRegionalPricing(planType: PlanType, region: Region): RegionalPricing {
  const currency = region === Region.INTL ? Currency.USD : Currency.INR;
  const price = getPlanPriceByRegion(planType, region);
  const symbol = CURRENCY_SYMBOLS[currency];
  
  return { region, currency, symbol, price };
}

/**
 * ⭐ NEW: Get region from country code
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Region enum
 */
export function getRegionFromCountry(countryCode: string): Region {
  return countryCode.toUpperCase() === 'IN' ? Region.IN : Region.INTL;
}

/**
 * ⭐ NEW: Get currency for region
 * @param region - Region enum
 * @returns Currency enum
 */
export function getCurrencyForRegion(region: Region): Currency {
  return region === Region.IN ? Currency.INR : Currency.USD;
}

/**
 * ⭐ NEW: Get currency symbol
 * @param currency - Currency enum
 * @returns Currency symbol string
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] || '$';
}

/**
 * ⭐ NEW: Format price with currency symbol
 * @param amount - Price amount
 * @param currency - Currency enum
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(currency === Currency.USD ? 2 : 0)}`;
}

/**
 * ⭐ NEW: Get payment gateway for region
 * @param region - Region enum
 * @returns Payment gateway name
 */
export function getPaymentGateway(region: Region): string {
  return REGION_TO_PAYMENT_GATEWAY[region] || 'stripe';
}

/**
 * ⭐ NEW: Check if region is India
 * @param region - Region enum
 * @returns true if India
 */
export function isIndiaRegion(region: Region): boolean {
  return region === Region.IN;
}

/**
 * ⭐ NEW: Check if region is International
 * @param region - Region enum
 * @returns true if International
 */
export function isInternationalRegion(region: Region): boolean {
  return region === Region.INTL;
}

/**
 * Check if plan status is active
 * @param status - PlanStatus to check
 * @returns true if active
 */
export function isPlanActive(status: PlanStatus): boolean {
  return ACTIVE_PLAN_STATUSES.includes(status);
}

/**
 * Check if plan status is inactive
 * @param status - PlanStatus to check
 * @returns true if inactive
 */
export function isPlanInactive(status: PlanStatus): boolean {
  return INACTIVE_PLAN_STATUSES.includes(status);
}

/**
 * Check if user is on trial
 * @param status - PlanStatus to check
 * @returns true if user is on trial
 */
export function isOnTrial(status: PlanStatus): boolean {
  return status === PlanStatus.TRIAL;
}

/**
 * Get cooldown booster type for a plan
 * @param planType - PlanType enum value
 * @returns Cooldown booster type string
 */
export function getCooldownBoosterType(planType: PlanType): BoosterType {
  return PLAN_TO_COOLDOWN_BOOSTER[planType];
}

/**
 * Get addon booster type for a plan (if available)
 * @param planType - PlanType enum value
 * @returns Addon booster type string or null
 */
export function getAddonBoosterType(planType: PlanType): BoosterType | null {
  return PLAN_TO_ADDON_BOOSTER[planType];
}

/**
 * Check if a plan has addon boosters available
 * @param planType - PlanType enum value
 * @returns true if addon available
 */
export function hasAddonBooster(planType: PlanType): boolean {
  return PLAN_TO_ADDON_BOOSTER[planType] !== null;
}

/**
 * Get booster category from booster type string
 * @param boosterType - Booster type string
 * @returns BoosterCategory enum
 */
export function getBoosterCategory(boosterType: BoosterType): BoosterCategory {
  return BOOSTER_TYPE_TO_CATEGORY[boosterType];
}

/**
 * Check if a booster is a cooldown booster
 * @param boosterType - Booster type string
 * @returns true if cooldown booster
 */
export function isCooldownBooster(boosterType: BoosterType): boolean {
  return getBoosterCategory(boosterType) === BoosterCategory.COOLDOWN;
}

/**
 * Check if a booster is an addon booster
 * @param boosterType - Booster type string
 * @returns true if addon booster
 */
export function isAddonBooster(boosterType: BoosterType): boolean {
  return getBoosterCategory(boosterType) === BoosterCategory.ADDON;
}

/**
 * Check if user's security status is trusted
 * @param status - SecurityStatus to check
 * @returns true if trusted
 */
export function isTrusted(status: SecurityStatus): boolean {
  return status === SecurityStatus.TRUSTED;
}

/**
 * Check if user's security status is flagged
 * @param status - SecurityStatus to check
 * @returns true if flagged
 */
export function isFlagged(status: SecurityStatus): boolean {
  return status === SecurityStatus.FLAGGED;
}

/**
 * Check if user's security status is blocked
 * @param status - SecurityStatus to check
 * @returns true if blocked
 */
export function isBlocked(status: SecurityStatus): boolean {
  return status === SecurityStatus.BLOCKED;
}

/**
 * Compare security status severity
 * @param status1 - First SecurityStatus
 * @param status2 - Second SecurityStatus
 * @returns Positive if status1 > status2, negative if status1 < status2, 0 if equal
 */
export function compareSecurityStatus(status1: SecurityStatus, status2: SecurityStatus): number {
  return SECURITY_STATUS_PRIORITY[status1] - SECURITY_STATUS_PRIORITY[status2];
}

/**
 * Check if activity trend is positive
 * @param trend - ActivityTrend to check
 * @returns true if trend is positive
 */
export function isPositiveTrend(trend: ActivityTrend): boolean {
  return POSITIVE_TRENDS.includes(trend);
}

/**
 * Check if activity trend is negative
 * @param trend - ActivityTrend to check
 * @returns true if trend is negative
 */
export function isNegativeTrend(trend: ActivityTrend): boolean {
  return NEGATIVE_TRENDS.includes(trend);
}

// ==========================================
// 👑 SOVEREIGN HELPERS
// ==========================================

/**
 * Check if user has SOVEREIGN plan (unlimited access)
 * @param planType - PlanType enum value
 * @returns true if SOVEREIGN
 */
export function isSovereign(planType: PlanType): boolean {
  return planType === PlanType.SOVEREIGN;
}

/**
 * Check if plan has unlimited access (SOVEREIGN)
 * @param planType - PlanType enum value
 * @returns true if unlimited
 */
export function hasUnlimitedAccess(planType: PlanType): boolean {
  return planType === PlanType.SOVEREIGN;
}

// ==========================================
// ✅ NEW: LITE PLAN HELPERS
// ==========================================

/**
 * Check if user has LITE plan (free tier with Schnell images)
 * @param planType - PlanType enum value
 * @returns true if LITE
 */
export function isLitePlan(planType: PlanType): boolean {
  return planType === PlanType.LITE;
}

/**
 * Check if plan is a free plan (STARTER or LITE)
 * @param planType - PlanType enum value
 * @returns true if free plan
 */
export function isFreePlan(planType: PlanType): boolean {
  return planType === PlanType.STARTER || planType === PlanType.LITE;
}

/**
 * Check if plan is a paid plan
 * @param planType - PlanType enum value
 * @returns true if paid plan
 */
export function isPaidPlan(planType: PlanType): boolean {
  return !isFreePlan(planType) && planType !== PlanType.SOVEREIGN;
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Validate if a string is a valid plan name
 * @param value - String to validate
 * @returns true if valid plan name
 * ✅ UPDATED: Added 'lite'
 */
export function isValidPlanName(value: string): value is PlanName {
  return ['starter', 'lite', 'plus', 'pro', 'apex', 'sovereign'].includes(value);
}

/**
 * Validate if a string is a valid booster type
 * @param value - String to validate
 * @returns true if valid booster type
 */
export function isValidBoosterType(value: string): value is BoosterType {
  return Object.keys(BOOSTER_TYPE_TO_CATEGORY).includes(value);
}

/**
 * ⭐ NEW: Validate if a string is a valid country code
 * @param value - String to validate
 * @returns true if valid ISO country code format
 */
export function isValidCountryCode(value: string): boolean {
  return /^[A-Z]{2}$/.test(value.toUpperCase());
}

/**
 * Safely convert string to PlanType enum
 * @param value - String to convert
 * @returns PlanType enum or null if invalid
 */
export function safePlanNameToType(value: string): PlanType | null {
  if (isValidPlanName(value)) {
    return PLAN_NAME_TO_TYPE[value];
  }
  return null;
}

/**
 * Safely convert PlanType to plan name
 * @param planType - PlanType enum
 * @returns Plan name string or null if invalid
 */
export function safePlanTypeToName(planType: unknown): PlanName | null {
  if (typeof planType === 'string' && Object.values(PlanType).includes(planType as PlanType)) {
    return PLAN_TYPE_TO_NAME[planType as PlanType];
  }
  return null;
}

// ==========================================
// TYPE GUARDS
// ==========================================

/**
 * Type guard for PlanType enum
 */
export function isPlanType(value: unknown): value is PlanType {
  return typeof value === 'string' && Object.values(PlanType).includes(value as PlanType);
}

/**
 * Type guard for PlanStatus enum
 */
export function isPlanStatus(value: unknown): value is PlanStatus {
  return typeof value === 'string' && Object.values(PlanStatus).includes(value as PlanStatus);
}

/**
 * Type guard for BoosterCategory enum
 */
export function isBoosterCategory(value: unknown): value is BoosterCategory {
  return (
    typeof value === 'string' && Object.values(BoosterCategory).includes(value as BoosterCategory)
  );
}

/**
 * Type guard for SecurityStatus enum
 */
export function isSecurityStatus(value: unknown): value is SecurityStatus {
  return (
    typeof value === 'string' && Object.values(SecurityStatus).includes(value as SecurityStatus)
  );
}

/**
 * Type guard for ActivityTrend enum
 */
export function isActivityTrend(value: unknown): value is ActivityTrend {
  return typeof value === 'string' && Object.values(ActivityTrend).includes(value as ActivityTrend);
}

/**
 * ⭐ NEW: Type guard for Region enum
 */
export function isRegion(value: unknown): value is Region {
  return typeof value === 'string' && Object.values(Region).includes(value as Region);
}

/**
 * ⭐ NEW: Type guard for Currency enum
 */
export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && Object.values(Currency).includes(value as Currency);
}