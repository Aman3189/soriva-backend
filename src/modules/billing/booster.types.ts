// src/modules/billing/booster.types.ts

/**
 * ==========================================
 * SORIVA BOOSTER TYPES & INTERFACES
 * ==========================================
 * Created by: Amandeep, Punjab, India
 * Updated: November 21, 2025 - Aligned with Plans.ts v3.0
 * Purpose: Type-safe booster operations with schema compliance
 * 
 * STRUCTURE:
 * - Prisma imports (enums from schema)
 * - Request/Response interfaces
 * - Eligibility & Purchase types
 * - Queue system types
 * - Helper types
 * ==========================================
 */

import { Region, Currency, BoosterCategory } from '@prisma/client';
import { PlanType } from '../../constants/plans';

// ==========================================
// BOOSTER STATUS (matches schema string field)
// ==========================================

export enum BoosterStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  USED = 'used',
  CANCELLED = 'cancelled',
}

// ==========================================
// COOLDOWN BOOSTER TYPES
// ==========================================

export interface CooldownEligibilityCheck {
  userId: string;
  region?: Region;
}

export interface CooldownEligibilityResult {
  eligible: boolean;
  reason?: string;
  naturalMessage?: string;
  boosterDetails?: {
    price: number;              // In rupees/dollars (not paise)
    priceDisplay: string;       // "₹15" or "$1"
    wordsUnlocked: number;      // For display
    tokensUnlocked: number;     // For internal use
    duration: number;           // Hours (0 for instant)
    maxPerPlanPeriod: number;   // 5 for STARTER, 1 for others
    usedThisPeriod: number;     // How many already used
    remainingThisPeriod: number;
  };
}

export interface CooldownPurchaseRequest {
  userId: string;
  paymentMethod: string;
  transactionId?: string;
  region?: Region;
  currency?: Currency;
}

export interface CooldownPurchaseResult {
  success: boolean;
  message: string;
  naturalMessage?: string;
  booster?: any; // Prisma Booster object
  wordsUnlocked?: number;
  expiresAt?: Date;
  newDailyLimit?: number;
}

// ==========================================
// ADDON BOOSTER TYPES
// ==========================================

export interface AddonAvailabilityCheck {
  userId: string;
  region?: Region;
}

export interface AddonAvailabilityResult {
  eligible: boolean;
  reason?: string;
  naturalMessage?: string;
  boosterDetails?: {
    price: number;
    priceDisplay: string;
    totalTokens: number;
    totalWords: number;
    creditsAdded: number;
    dailyBoost: number;         // Tokens per day
    dailyBoostWords: number;    // Words per day
    validity: number;           // Days
    maxPerMonth: number;        // Max 2
    activeCount: number;        // Currently active
    queuedCount: number;        // In queue
    canPurchase: boolean;       // Can buy now or will queue
  };
}

export interface AddonPurchaseRequest {
  userId: string;
  paymentMethod: string;
  transactionId?: string;
  region?: Region;
  currency?: Currency;
}

export interface AddonPurchaseResult {
  success: boolean;
  message: string;
  naturalMessage?: string;
  booster?: any;
  wordsAdded?: number;
  creditsAdded?: number;
  dailyBoost?: number;
  validity?: number;
  expiresAt?: Date;
  startsAt?: Date;            // If queued, when it starts
  queuePosition?: number;     // If queued
  status: 'active' | 'queued';
}


// ==========================================
// QUEUE SYSTEM TYPES (For Addon Boosters)
// ==========================================

export interface QueuedBooster {
  id: string;
  userId: string;
  boosterCategory: BoosterCategory;
  boosterType: string;
  wordsAdded: number;
  creditsAdded: number;
  dailyBoost: number;
  validity: number;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  queuePosition: number;
  status: 'queued' | 'active' | 'expired';
  createdAt: Date;
}

export interface QueueCheckResult {
  hasActiveAddon: boolean;
  activeAddonId?: string;
  activeAddonEndsAt?: Date;
  queuedBoosters: QueuedBooster[];
  canPurchaseMore: boolean;
  totalThisMonth: number;
  maxPerMonth: number;
}

export interface QueueAddResult {
  success: boolean;
  booster: any;
  status: 'active' | 'queued';
  startsAt: Date;
  endsAt: Date;
  queuePosition?: number;
  message: string;
}

// ==========================================
// BOOSTER STATS & ANALYTICS
// ==========================================

export interface BoosterStats {
  totalBoosters: number;
  totalRevenue: number;            // In base currency
  totalRevenueINR: number;         // Converted to INR
  totalRevenueUSD: number;         // Converted to USD
  activeBoosters: number;
  expiredBoosters: number;
  
  // By category
  cooldownCount: number;
  cooldownRevenue: number;
  cooldownMargin: number;          // Percentage
  
  addonCount: number;
  addonRevenue: number;
  addonMargin: number;

  // By region
  indiaRevenue: number;
  internationalRevenue: number;
  
  // By plan
  boostersByPlan: Array<{
    planName: string;
    count: number;
    revenue: number;
  }>;
  
  // By type
  boostersByType: Array<{
    boosterType: string;
    count: number;
    revenue: number;
  }>;
}

// ==========================================
// PROMO BOOSTER TYPES (Admin)
// ==========================================

export interface PromoBoosterRequest {
  userIds: string[];
  boosterCategory: BoosterCategory;
  wordsAdded?: number;
  creditsAdded?: number;
  validityDays: number;
  reason: string;
  adminId: string;
}

export interface PromoBoosterResult {
  success: boolean;
  message: string;
  naturalMessage?: string;
  boosters?: any[];
  totalUsers: number;
  totalWordsAdded?: number;
  totalCreditsAdded?: number;
}

// ==========================================
// HELPER TYPES
// ==========================================

export interface PriceDisplay {
  amount: number;
  currency: Currency;
  symbol: string;
  formatted: string;          // "₹399" or "$7.49"
}

export interface RegionPricing {
  region: Region;
  currency: Currency;
  price: number;
  priceDisplay: string;
  multiplier?: number;        // For international (1.5x)
}

export interface BoosterCosts {
  ai: number;                 // AI model costs
  gateway: number;            // Payment gateway fee
  infra: number;              // Infrastructure cost
  total: number;              // Total cost
  profit: number;             // Revenue - cost
  margin: number;             // Percentage
}

// ==========================================
// VALIDATION TYPES
// ==========================================

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface BoosterValidation {
  userExists: boolean;
  planActive: boolean;
  sufficientBalance?: boolean;
  withinLimits: boolean;
  validPaymentMethod: boolean;
  validationResult: ValidationResult;
}

// ==========================================
// RESPONSE WRAPPER (Standard API Response)
// ==========================================

export interface BoosterApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  naturalMessage?: string;
  error?: string;
  errorCode?: string;
  timestamp: string;
}

// ==========================================
// EXPORTS
// ==========================================

export {
  Region,
  Currency,
  BoosterCategory,
  PlanType,
};