// src/shared/types/prisma-enums.ts
/**
 * ==========================================
 * PRISMA ENUMS & TYPE MAPPINGS
 * ==========================================
 * Centralized type definitions for Soriva Backend
 * Last Updated: November 12, 2025 - Added Region & Currency support
 *
 * INCLUDES:
 * - Re-exported Prisma enums (including Region & Currency)
 * - Plan name mappings
 * - Regional pricing helpers
 * - Type-safe helper functions
 * - Validation utilities
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
 * Plan name as used in subscriptionPlan field (lowercase string)
 */
export type PlanName = 'starter' | 'plus' | 'pro' | 'edge' | 'life';

/**
 * Booster type strings used in database
 */
export type BoosterType =
  | 'starter_cooldown'
  | 'plus_cooldown'
  | 'plus_addon'
  | 'pro_cooldown'
  | 'pro_addon'
  | 'edge_cooldown'
  | 'edge_addon'
  | 'life_cooldown'
  | 'life_addon';

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
 */
export const PLAN_TYPE_TO_NAME: Record<PlanType, PlanName> = {
  [PlanType.STARTER]: 'starter',
  [PlanType.PLUS]: 'plus',
  [PlanType.PRO]: 'pro',
  [PlanType.EDGE]: 'edge',
  [PlanType.LIFE]: 'life',
};

/**
 * Map plan name (lowercase string) to PlanType enum
 * Usage: PLAN_NAME_TO_TYPE['starter'] => PlanType.STARTER
 */
export const PLAN_NAME_TO_TYPE: Record<PlanName, PlanType> = {
  starter: PlanType.STARTER,
  plus: PlanType.PLUS,
  pro: PlanType.PRO,
  edge: PlanType.EDGE,
  life: PlanType.LIFE,
};

/**
 * Human-readable plan display names
 */
export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  [PlanType.STARTER]: 'Soriva Starter',
  [PlanType.PLUS]: 'Soriva Plus',
  [PlanType.PRO]: 'Soriva Pro',
  [PlanType.EDGE]: 'Soriva Edge',
  [PlanType.LIFE]: 'Soriva Life',
};

/**
 * Plan prices in INR (India pricing)
 */
export const PLAN_PRICES: Record<PlanType, number> = {
  [PlanType.STARTER]: 0,
  [PlanType.PLUS]: 149,
  [PlanType.PRO]: 399,
  [PlanType.EDGE]: 999,
  [PlanType.LIFE]: 1199,
};

/**
 * ⭐ NEW: Plan prices in USD (International pricing)
 */
export const PLAN_PRICES_USD: Record<PlanType, number> = {
  [PlanType.STARTER]: 0,
  [PlanType.PLUS]: 5.99,
  [PlanType.PRO]: 16.99,
  [PlanType.EDGE]: 39.99,
  [PlanType.LIFE]: 49.99,
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
 */
export const BOOSTER_TYPE_TO_CATEGORY: Record<BoosterType, BoosterCategory> = {
  starter_cooldown: BoosterCategory.COOLDOWN,
  plus_cooldown: BoosterCategory.COOLDOWN,
  plus_addon: BoosterCategory.ADDON,
  pro_cooldown: BoosterCategory.COOLDOWN,
  pro_addon: BoosterCategory.ADDON,
  edge_cooldown: BoosterCategory.COOLDOWN,
  edge_addon: BoosterCategory.ADDON,
  life_cooldown: BoosterCategory.COOLDOWN,
  life_addon: BoosterCategory.ADDON,
};

/**
 * Map plan type to its cooldown booster type
 */
export const PLAN_TO_COOLDOWN_BOOSTER: Record<PlanType, BoosterType> = {
  [PlanType.STARTER]: 'starter_cooldown',
  [PlanType.PLUS]: 'plus_cooldown',
  [PlanType.PRO]: 'pro_cooldown',
  [PlanType.EDGE]: 'edge_cooldown',
  [PlanType.LIFE]: 'life_cooldown',
};

/**
 * Map plan type to its addon booster type (null if no addon available)
 */
export const PLAN_TO_ADDON_BOOSTER: Record<PlanType, BoosterType | null> = {
  [PlanType.STARTER]: null,
  [PlanType.PLUS]: 'plus_addon',
  [PlanType.PRO]: 'pro_addon',
  [PlanType.EDGE]: 'edge_addon',
  [PlanType.LIFE]: 'life_addon',
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
 * @returns Display name (e.g., "Soriva Starter")
 */
export function getPlanDisplayName(planType: PlanType): string {
  return PLAN_DISPLAY_NAMES[planType];
}

/**
 * Get plan price in rupees (India pricing)
 * @param planType - PlanType enum value
 * @returns Price in INR
 */
export function getPlanPrice(planType: PlanType): number {
  return PLAN_PRICES[planType];
}

/**
 * ⭐ NEW: Get plan price for a specific region
 * @param planType - PlanType enum value
 * @param region - Region enum value
 * @returns Price in regional currency
 */
export function getPlanPriceByRegion(planType: PlanType, region: Region): number {
  if (region === ('IN' as any)) {
    return PLAN_PRICES[planType];
  }
  return PLAN_PRICES_USD[planType];
}

/**
 * ⭐ NEW: Get regional pricing details for a plan
 * @param planType - PlanType enum value
 * @param region - Region enum value
 * @returns RegionalPricing object with currency, symbol, and price
 */
export function getRegionalPricing(planType: PlanType, region: Region): RegionalPricing {
  const currency = REGION_TO_CURRENCY[region as any];
  const symbol = CURRENCY_SYMBOLS[currency];
  const price = getPlanPriceByRegion(planType, region);

  return {
    region,
    currency,
    symbol,
    price,
  };
}

/**
 * ⭐ NEW: Determine region from country code
 * @param countryCode - ISO country code (e.g., 'IN', 'US', 'GB')
 * @returns Region enum (IN or INTL)
 */
export function getRegionFromCountry(countryCode: string): Region {
  return (countryCode.toUpperCase() === 'IN' ? 'IN' : 'INTL') as any;
}

/**
 * ⭐ NEW: Get currency for a region
 * @param region - Region enum value
 * @returns Currency enum
 */
export function getCurrencyForRegion(region: Region): Currency {
  return REGION_TO_CURRENCY[region as any] as any;
}

/**
 * ⭐ NEW: Get currency symbol
 * @param currency - Currency enum value
 * @returns Currency symbol (₹ or $)
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency as any];
}

/**
 * ⭐ NEW: Format price with currency symbol
 * @param price - Price value
 * @param currency - Currency enum
 * @returns Formatted price string (e.g., "₹149" or "$5.99")
 */
export function formatPrice(price: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency as any];

  if (currency === ('INR' as any)) {
    return `${symbol}${Math.round(price)}`;
  }

  return `${symbol}${price.toFixed(2)}`;
}

/**
 * ⭐ NEW: Get payment gateway for a region
 * @param region - Region enum value
 * @returns Payment gateway name
 */
export function getPaymentGateway(region: Region): string {
  return REGION_TO_PAYMENT_GATEWAY[region as any];
}

/**
 * ⭐ NEW: Check if region is India
 * @param region - Region enum value
 * @returns true if India
 */
export function isIndiaRegion(region: Region): boolean {
  return region === ('IN' as any);
}

/**
 * ⭐ NEW: Check if region is International
 * @param region - Region enum value
 * @returns true if International
 */
export function isInternationalRegion(region: Region): boolean {
  return region === ('INTL' as any);
}

/**
 * Check if a plan status is active
 * @param status - PlanStatus to check
 * @returns true if user can use the service
 */
export function isPlanActive(status: PlanStatus): boolean {
  return ACTIVE_PLAN_STATUSES.includes(status);
}

/**
 * Check if a plan status is inactive
 * @param status - PlanStatus to check
 * @returns true if user cannot use the service
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
// VALIDATION HELPERS
// ==========================================

/**
 * Validate if a string is a valid plan name
 * @param value - String to validate
 * @returns true if valid plan name
 */
export function isValidPlanName(value: string): value is PlanName {
  return ['starter', 'plus', 'pro', 'edge', 'life'].includes(value);
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

// ==========================================
// EXPORTS SUMMARY
// ==========================================

/**
 * This file exports:
 *
 * ENUMS (from Prisma):
 * - PlanType, PlanStatus, BoosterCategory, SecurityStatus, ActivityTrend
 * - Region, Currency (⭐ NEW)
 *
 * TYPES:
 * - PlanName, BoosterType
 * - CountryCode, RegionalPricing (⭐ NEW)
 *
 * MAPPINGS:
 * - PLAN_TYPE_TO_NAME, PLAN_NAME_TO_TYPE
 * - PLAN_DISPLAY_NAMES, PLAN_PRICES, PLAN_PRICES_USD (⭐ NEW)
 * - CURRENCY_SYMBOLS, REGION_TO_CURRENCY (⭐ NEW)
 * - REGION_DISPLAY_NAMES, REGION_TO_PAYMENT_GATEWAY (⭐ NEW)
 * - BOOSTER_TYPE_TO_CATEGORY
 * - PLAN_TO_COOLDOWN_BOOSTER, PLAN_TO_ADDON_BOOSTER
 *
 * HELPER FUNCTIONS:
 * - planTypeToName, planNameToType
 * - getPlanDisplayName, getPlanPrice
 * - getPlanPriceByRegion, getRegionalPricing (⭐ NEW)
 * - getRegionFromCountry, getCurrencyForRegion (⭐ NEW)
 * - getCurrencySymbol, formatPrice (⭐ NEW)
 * - getPaymentGateway (⭐ NEW)
 * - isIndiaRegion, isInternationalRegion (⭐ NEW)
 * - isPlanActive, isPlanInactive, isOnTrial
 * - getCooldownBoosterType, getAddonBoosterType, hasAddonBooster
 * - getBoosterCategory, isCooldownBooster, isAddonBooster
 * - isTrusted, isFlagged, isBlocked
 * - compareSecurityStatus
 * - isPositiveTrend, isNegativeTrend
 *
 * VALIDATION:
 * - isValidPlanName, isValidBoosterType, isValidCountryCode (⭐ NEW)
 * - safePlanNameToType, safePlanTypeToName
 * - Type guards: isPlanType, isPlanStatus, isBoosterCategory, isSecurityStatus, isActivityTrend
 * - isRegion, isCurrency (⭐ NEW)
 */