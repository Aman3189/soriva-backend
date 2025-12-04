// src/constants/abuse-limits.ts

/**
 * ==========================================
 * SORIVA V3 - ABUSE PREVENTION & LIMITS
 * ==========================================
 * Comprehensive anti-abuse controls linked with plans.ts
 * Last Updated: December 4, 2025 - PRODUCTION READY v1.0
 *
 * ==========================================
 * PURPOSE:
 * ==========================================
 * - Prevent multi-account abuse
 * - Protect expensive resources (GPU, API)
 * - Block fraud & chargebacks
 * - Fair usage for genuine users
 * - Legal compliance (Consumer Protection)
 *
 * ==========================================
 * LINKED WITH:
 * ==========================================
 * - plans.ts (PlanType, limits)
 * - billing system (refunds, boosters)
 * - auth system (device fingerprint)
 * - usage tracking (quotas)
 */

import { PlanType } from '@shared/types/prisma-enums';

// ==========================================
// 🔐 ACCOUNT ELIGIBILITY
// ==========================================

/**
 * Account eligibility requirements for premium features
 * Prevents new account abuse and bot signups
 */
export const ACCOUNT_ELIGIBILITY = {
  /** Minimum account age (days) to purchase boosters */
  minAccountAgeDaysForBoosters: 7,

  /** Mobile verification required for boosters */
  requireMobileForBoosters: true,

  /** Email verification required for paid plans */
  requireEmailForPaidPlans: true,

  /** Minimum account age (days) for paid plan subscription */
  minAccountAgeDaysForPaidPlan: 0,

  /** Account must have at least N chat sessions before paid features */
  minChatSessionsForPaidPlan: 1,
} as const;

// ==========================================
// 📱 DEVICE FINGERPRINT CONTROLS
// ==========================================

/**
 * Device fingerprint interface
 * Collected via FingerprintJS or similar
 */
export interface DeviceFingerprint {
  /** Unique visitor ID from FingerprintJS */
  visitorId: string;
  /** IP address (hashed for privacy) */
  ipAddressHash: string;
  /** User agent string */
  userAgent: string;
  /** Screen resolution */
  screenResolution: string;
  /** Timezone */
  timezone: string;
  /** Browser language */
  language: string;
  /** Platform (Windows/Mac/Android/iOS) */
  platform: string;
}

/**
 * Device fingerprint limits
 * Prevents multi-account abuse from same device
 */
export const DEVICE_FINGERPRINT_LIMITS = {
  /** Maximum total accounts per device fingerprint */
  maxAccountsPerDevice: 2,

  /** Maximum Starter (free) accounts per device */
  maxStarterAccountsPerDevice: 1,

  /** Maximum new accounts per IP in 24 hours */
  maxAccountsPerIP24Hours: 3,

  /** Cooldown (days) before new account on same device */
  newAccountCooldownDays: 30,

  /** Flag account if same fingerprint, different email, same day */
  flagSameDayMultipleEmails: true,

  /** Block signup if device already has max accounts */
  blockExcessSignups: true,
} as const;

// ==========================================
// 💳 PAYMENT TO FEATURE ACTIVATION
// ==========================================

/**
 * User trust level for activation delay
 */
export type UserTrustLevel = 'TRUSTED' | 'NEW' | 'SUSPICIOUS';

/**
 * Payment activation delays
 * Smart delay based on user trust level
 * Prevents race-condition & refund exploit attacks
 */
export const PAYMENT_ACTIVATION = {
  /** Delay for trusted users (returning subscribers) */
  trustedUserDelayMinutes: 0,

  /** Delay for new first-time subscribers */
  newUserDelayMinutes: 5,

  /** Delay for flagged/suspicious accounts */
  suspiciousUserDelayMinutes: 15,

  /** High-value features get extra delay for new users */
  highValueFeatureExtraDelayMinutes: 10,

  /** Features considered high-value (extra delay applies) */
  highValueFeatures: [
    'LOGO_FINAL',
    'TALKING_PHOTO_10SEC',
    'DOC_PARSE_LARGE',
    'CLAUDE_SONNET_ACCESS',
  ] as const,

  /** Status during activation period */
  activatingStatus: 'ACTIVATING',

  /** Status after activation complete */
  activeStatus: 'ACTIVE',

  /** Monitor heavy usage in first N minutes (flag if exceeded) */
  heavyUsageMonitorMinutes: 10,

  /** Max heavy API calls in monitor window before flag */
  maxHeavyCallsInMonitorWindow: 3,
} as const;

/**
 * Determine user trust level
 */
export function getUserTrustLevel(user: {
  previousSubscriptions: number;
  accountAgeDays: number;
  flagged: boolean;
  refundHistory: number;
}): UserTrustLevel {
  if (user.flagged || user.refundHistory >= 2) {
    return 'SUSPICIOUS';
  }
  if (user.previousSubscriptions > 0 && user.accountAgeDays > 30) {
    return 'TRUSTED';
  }
  return 'NEW';
}

/**
 * Get activation delay for user
 */
export function getActivationDelayMinutes(
  trustLevel: UserTrustLevel,
  isHighValueFeature: boolean = false
): number {
  let delay = 0;

  switch (trustLevel) {
    case 'TRUSTED':
      delay = PAYMENT_ACTIVATION.trustedUserDelayMinutes;
      break;
    case 'NEW':
      delay = PAYMENT_ACTIVATION.newUserDelayMinutes;
      break;
    case 'SUSPICIOUS':
      delay = PAYMENT_ACTIVATION.suspiciousUserDelayMinutes;
      break;
  }

  if (isHighValueFeature && trustLevel !== 'TRUSTED') {
    delay += PAYMENT_ACTIVATION.highValueFeatureExtraDelayMinutes;
  }

  return delay;
}

// ==========================================
// 🎨 STUDIO HARD LIMITS (Per Plan)
// ==========================================

/**
 * Studio feature limits interface
 */
export interface StudioHardLimits {
  /** Image generation limits */
  imageGeneration: {
    perDay: number;
    perHour: number;
  };
  /** Talking photo limits */
  talkingPhoto: {
    perDay: number;
    perHour: number;
  };
  /** Logo preview limits */
  logoPreview: {
    perDay: number;
  };
  /** Logo final limits */
  logoFinal: {
    perDay: number;
  };
}

/**
 * Studio hard limits per plan
 * These are HARD caps regardless of credits available
 * Prevents credit burn abuse and GPU overload
 */
export const STUDIO_HARD_LIMITS: Record<PlanType, StudioHardLimits | null> = {
  [PlanType.STARTER]: null, // No studio access

  [PlanType.PLUS]: {
    imageGeneration: {
      perDay: 15,
      perHour: 5,
    },
    talkingPhoto: {
      perDay: 2,
      perHour: 1,
    },
    logoPreview: {
      perDay: 3,
    },
    logoFinal: {
      perDay: 1,
    },
  },

  [PlanType.PRO]: {
    imageGeneration: {
      perDay: 25,
      perHour: 8,
    },
    talkingPhoto: {
      perDay: 4,
      perHour: 2,
    },
    logoPreview: {
      perDay: 5,
    },
    logoFinal: {
      perDay: 2,
    },
  },

  [PlanType.APEX]: {
    imageGeneration: {
      perDay: 50,
      perHour: 15,
    },
    talkingPhoto: {
      perDay: 8,
      perHour: 3,
    },
    logoPreview: {
      perDay: 10,
    },
    logoFinal: {
      perDay: 3,
    },
  },
};

// ==========================================
// 📄 DOCUMENT INTELLIGENCE LIMITS (Per Plan)
// ==========================================

/**
 * Document intelligence limits interface
 */
export interface DocumentHardLimits {
  /** Maximum documents per day */
  docsPerDay: number;
  /** Maximum pages per document */
  maxPagesPerDoc: number;
  /** Maximum file size in MB */
  maxFileSizeMB: number;
  /** Maximum concurrent parsing jobs */
  maxConcurrentParsing: number;
}

/**
 * Document intelligence hard limits per plan
 * Prevents CPU/memory abuse from large document processing
 */
export const DOCUMENT_HARD_LIMITS: Record<PlanType, DocumentHardLimits | null> = {
  [PlanType.STARTER]: null, // No document intelligence access

  [PlanType.PLUS]: {
    docsPerDay: 5,
    maxPagesPerDoc: 25,
    maxFileSizeMB: 10,
    maxConcurrentParsing: 1,
  },

  [PlanType.PRO]: {
    docsPerDay: 15,
    maxPagesPerDoc: 50,
    maxFileSizeMB: 25,
    maxConcurrentParsing: 2,
  },

  [PlanType.APEX]: {
    docsPerDay: 30,
    maxPagesPerDoc: 100,
    maxFileSizeMB: 50,
    maxConcurrentParsing: 3,
  },
};

// ==========================================
// 🚀 API RATE LIMITS (Per Plan)
// ==========================================

/**
 * API rate limits interface
 */
export interface APIRateLimits {
  /** Maximum requests per minute */
  requestsPerMinute: number;
  /** Maximum requests per hour */
  requestsPerHour: number;
  /** Maximum input context tokens per request */
  maxContextTokens: number;
  /** Maximum output tokens per request */
  maxOutputTokens: number;
  /** Burst protection: max requests in 10 seconds */
  burstLimit10Seconds: number;
}

/**
 * API rate limits per plan
 * Prevents API abuse and ensures fair usage
 */
export const API_RATE_LIMITS: Record<PlanType, APIRateLimits> = {
  [PlanType.STARTER]: {
    requestsPerMinute: 5,
    requestsPerHour: 50,
    maxContextTokens: 4000,
    maxOutputTokens: 1000,
    burstLimit10Seconds: 3,
  },

  [PlanType.PLUS]: {
    requestsPerMinute: 15,
    requestsPerHour: 200,
    maxContextTokens: 16000,
    maxOutputTokens: 2000,
    burstLimit10Seconds: 8,
  },

  [PlanType.PRO]: {
    requestsPerMinute: 30,
    requestsPerHour: 500,
    maxContextTokens: 32000,
    maxOutputTokens: 4000,
    burstLimit10Seconds: 15,
  },

  [PlanType.APEX]: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    maxContextTokens: 64000,
    maxOutputTokens: 8000,
    burstLimit10Seconds: 25,
  },
};

// ==========================================
// 🎙️ VOICE LIMITS (Per Plan)
// ==========================================

/**
 * Voice feature limits interface
 */
export interface VoiceHardLimits {
  /** Maximum voice minutes per day */
  minutesPerDay: number;
  /** Maximum single audio length in seconds */
  maxAudioLengthSeconds: number;
  /** Maximum voice requests per hour */
  requestsPerHour: number;
}

/**
 * Voice hard limits per plan
 * Prevents STT/TTS API abuse
 */
export const VOICE_HARD_LIMITS: Record<PlanType, VoiceHardLimits | null> = {
  [PlanType.STARTER]: null, // No voice access

  [PlanType.PLUS]: {
    minutesPerDay: 10,
    maxAudioLengthSeconds: 60,
    requestsPerHour: 20,
  },

  [PlanType.PRO]: {
    minutesPerDay: 15,
    maxAudioLengthSeconds: 120,
    requestsPerHour: 30,
  },

  [PlanType.APEX]: {
    minutesPerDay: 20,
    maxAudioLengthSeconds: 180,
    requestsPerHour: 40,
  },
};

// ==========================================
// 💰 BOOSTER PURCHASE CONTROLS
// ==========================================

/**
 * Booster purchase controls
 * Prevents rapid purchase abuse
 */
export const BOOSTER_PURCHASE_CONTROLS = {
  /** Minimum gap between cooldown booster purchases (hours) */
  minGapCooldownHours: 24,

  /** Minimum gap between addon booster purchases (hours) */
  minGapAddonHours: 48,

  /** Minimum gap between studio booster purchases (hours) */
  minGapStudioHours: 24,

  /**
   * Maximum failed payment attempts per day before lockout
   * NOTE: This is 3 (soft lock), while FRAUD_DETECTION.failedPaymentThreshold is 5 (hard fraud)
   * This is INTENTIONAL - progressive escalation:
   *   3 failed → Booster purchases locked for 24h (soft)
   *   5 failed → Fraud flag triggered (hard)
   */
  maxFailedPaymentsPerDay: 3,

  /** Lockout duration after max failed payments (hours) */
  failedPaymentLockoutHours: 24,

  /** Require re-authentication for purchases above this amount (INR) */
  reAuthThresholdINR: 500,

  /** Require re-authentication for purchases above this amount (USD) */
  reAuthThresholdUSD: 10,
} as const;

// ==========================================
// 💸 REFUND POLICY
// ==========================================

/**
 * Refund eligibility check result
 */
export interface RefundEligibility {
  eligible: boolean;
  reason: string;
  refundPercent: number;
}

/**
 * Refund policy configuration
 * Ethical, user-friendly, but abuse-resistant
 */
export const REFUND_POLICY = {
  // ──────────────────────────────────────
  // ELIGIBILITY CRITERIA (ALL must be true)
  // ──────────────────────────────────────

  /** Maximum hours from purchase for refund eligibility */
  maxHoursFromPurchase: 24,

  /** Maximum usage percentage for refund eligibility */
  maxUsagePercent: 5,

  /** Must have zero studio usage */
  requireNoStudioUsage: true,

  /** Must have zero voice usage */
  requireNoVoiceUsage: true,

  /** Must have zero document parse usage */
  requireNoDocUsage: true,

  // ──────────────────────────────────────
  // REFUND LIMITS
  // ──────────────────────────────────────

  /** Maximum refunds per 12 months */
  maxRefundsPerYear: 1,

  /** Maximum lifetime refunds */
  maxLifetimeRefunds: 2,

  /** Refund request must be raised within N hours (same as maxHoursFromPurchase) */
  requestWindowHours: 24,

  /** Refund percentage for eligible requests */
  refundPercent: 100,

  // ──────────────────────────────────────
  // BOOSTER REFUND EXCEPTION
  // ──────────────────────────────────────

  /** Boosters allow one accidental refund exception */
  boosterAccidentalRefund: {
    /** Enable accidental refund for boosters */
    enabled: true,
    /** Maximum time window (minutes) for accidental refund */
    windowMinutes: 30,
    /** Must have zero usage of the booster */
    requireZeroUsage: true,
    /** Only one accidental booster refund per lifetime */
    maxLifetime: 1,
  },

  // ──────────────────────────────────────
  // NEVER REFUND SCENARIOS
  // ──────────────────────────────────────

  /** Categories that never get refunds (except accidental) */
  neverRefundCategories: [
    'BOOSTER_COOLDOWN',
    'BOOSTER_ADDON',
    'BOOSTER_STUDIO',
  ] as const,

  // ──────────────────────────────────────
  // POST-REFUND CONSEQUENCES
  // ──────────────────────────────────────

  /** Immediately revoke features after refund */
  instantFeatureRevoke: true,

  /** Flag account for monitoring after refund */
  flagAccountAfterRefund: true,

  /** Monitoring duration after refund (days) */
  postRefundMonitorDays: 90,
} as const;

/**
 * Technical failure resolution policy
 * Separate from user-requested refunds
 */
export const TECHNICAL_FAILURE_POLICY = {
  /** Allow free re-run of failed feature */
  allowReRun: true,

  /** Allow wallet credit as compensation */
  allowWalletCredit: true,

  /** Cash refund only if zero usage occurred */
  cashRefundOnlyIfZeroUsage: true,

  /** Credit amount multiplier (1.0 = exact cost, 1.5 = 50% extra) */
  creditMultiplier: 1.2,

  /** Maximum wallet credits per month from technical failures */
  maxCreditsPerMonth: 500,
} as const;

/**
 * Check if user is eligible for refund
 */
export function checkRefundEligibility(params: {
  hoursFromPurchase: number;
  usagePercent: number;
  studioUsed: boolean;
  voiceUsed: boolean;
  docUsed: boolean;
  refundsThisYear: number;
  lifetimeRefunds: number;
  isBooster: boolean;
  boosterUsed: boolean;
  minutesSincePurchase: number;
  accidentalBoosterRefundsUsed: number;
}): RefundEligibility {
  const {
    hoursFromPurchase,
    usagePercent,
    studioUsed,
    voiceUsed,
    docUsed,
    refundsThisYear,
    lifetimeRefunds,
    isBooster,
    boosterUsed,
    minutesSincePurchase,
    accidentalBoosterRefundsUsed,
  } = params;

  // Check booster accidental refund exception first
  if (isBooster) {
    const accidentalPolicy = REFUND_POLICY.boosterAccidentalRefund;

    if (
      accidentalPolicy.enabled &&
      minutesSincePurchase <= accidentalPolicy.windowMinutes &&
      !boosterUsed &&
      accidentalBoosterRefundsUsed < accidentalPolicy.maxLifetime
    ) {
      return {
        eligible: true,
        reason: 'Accidental booster purchase - within 30 min window, unused',
        refundPercent: 100,
      };
    }

    return {
      eligible: false,
      reason: 'Boosters are non-refundable (instant delivery)',
      refundPercent: 0,
    };
  }

  // Check lifetime limit
  if (lifetimeRefunds >= REFUND_POLICY.maxLifetimeRefunds) {
    return {
      eligible: false,
      reason: 'Maximum lifetime refunds (2) already used',
      refundPercent: 0,
    };
  }

  // Check yearly limit
  if (refundsThisYear >= REFUND_POLICY.maxRefundsPerYear) {
    return {
      eligible: false,
      reason: 'Maximum refunds this year (1) already used',
      refundPercent: 0,
    };
  }

  // Check time window
  if (hoursFromPurchase > REFUND_POLICY.maxHoursFromPurchase) {
    return {
      eligible: false,
      reason: 'Refund window (24 hours) has expired',
      refundPercent: 0,
    };
  }

  // Check usage percent
  if (usagePercent >= REFUND_POLICY.maxUsagePercent) {
    return {
      eligible: false,
      reason: `Usage (${usagePercent}%) exceeds maximum (5%)`,
      refundPercent: 0,
    };
  }

  // Check premium feature usage
  if (studioUsed) {
    return {
      eligible: false,
      reason: 'Studio features were used (image/logo/video generated)',
      refundPercent: 0,
    };
  }

  if (voiceUsed) {
    return {
      eligible: false,
      reason: 'Voice features were used',
      refundPercent: 0,
    };
  }

  if (docUsed) {
    return {
      eligible: false,
      reason: 'Document Intelligence was used (file parsed)',
      refundPercent: 0,
    };
  }

  // All checks passed
  return {
    eligible: true,
    reason: 'All eligibility criteria met',
    refundPercent: REFUND_POLICY.refundPercent,
  };
}

// ==========================================
// 🚨 FRAUD & ABUSE ACTIONS
// ==========================================

/**
 * Fraud trigger types
 */
export type FraudTrigger =
  | 'MULTI_ACCOUNT_ABUSE'
  | 'FAKE_CARD'
  | 'CHARGEBACK'
  | 'VPN_SUSPICIOUS'
  | 'REPEATED_FAILED_PAYMENTS'
  | 'DEVICE_FINGERPRINT_MISMATCH'
  | 'BOT_BEHAVIOR'
  | 'RATE_LIMIT_EXTREME_ABUSE';

/**
 * Fraud detection thresholds
 */
export const FRAUD_DETECTION = {
  /** Flag if >N accounts from same device */
  multiAccountThreshold: 2,

  /**
   * Flag if >N failed payments in 24h
   * NOTE: BOOSTER_PURCHASE_CONTROLS.maxFailedPaymentsPerDay is 3 (soft lock first)
   * This 5 threshold is for HARD fraud flag - progressive escalation
   */
  failedPaymentThreshold: 5,

  /** Flag if >N chargebacks lifetime */
  chargebackThreshold: 1,

  /** Flag if rate limit exceeded by >N times */
  rateLimitAbuseMultiplier: 5,

  /** Flag if >N different IPs in 1 hour */
  suspiciousIPChanges: 5,

  /** Flag if request pattern matches bot behavior */
  botPatternDetection: true,

  /** Minimum requests to analyze for bot pattern */
  botPatternMinRequests: 20,
} as const;

/**
 * Fraud action consequences
 */
export const FRAUD_ACTIONS = {
  /** Immediately suspend account on fraud detection */
  suspendAccount: true,

  /** Allow refund for fraudulent accounts */
  allowRefund: false,

  /** Allow account reactivation */
  allowReactivation: false,

  /** Permanently block device fingerprint */
  blockDeviceFingerprint: true,

  /** Block IP address (temporary) */
  blockIPTemporary: true,

  /** IP block duration (hours) */
  ipBlockDurationHours: 72,

  /** Log fraud attempt for analysis */
  logFraudAttempt: true,

  /** Notify admin on fraud detection */
  notifyAdmin: true,

  /** Auto-report to payment gateway */
  reportToGateway: true,
} as const;

/**
 * Handle fraud detection
 */
export function handleFraudDetection(trigger: FraudTrigger): {
  actions: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
} {
  const actions: string[] = [];
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';

  // Always log
  if (FRAUD_ACTIONS.logFraudAttempt) {
    actions.push('LOG_FRAUD_ATTEMPT');
  }

  switch (trigger) {
    case 'CHARGEBACK':
    case 'FAKE_CARD':
      severity = 'CRITICAL';
      actions.push('SUSPEND_ACCOUNT');
      actions.push('BLOCK_DEVICE');
      actions.push('BLOCK_IP');
      actions.push('NOTIFY_ADMIN');
      actions.push('REPORT_TO_GATEWAY');
      break;

    case 'MULTI_ACCOUNT_ABUSE':
      severity = 'HIGH';
      actions.push('SUSPEND_ACCOUNT');
      actions.push('BLOCK_DEVICE');
      actions.push('NOTIFY_ADMIN');
      break;

    case 'VPN_SUSPICIOUS':
    case 'DEVICE_FINGERPRINT_MISMATCH':
      severity = 'MEDIUM';
      actions.push('FLAG_ACCOUNT');
      actions.push('REQUIRE_REVERIFICATION');
      break;

    case 'REPEATED_FAILED_PAYMENTS':
      severity = 'MEDIUM';
      actions.push('LOCK_PAYMENTS_24H');
      actions.push('FLAG_ACCOUNT');
      break;

    case 'BOT_BEHAVIOR':
    case 'RATE_LIMIT_EXTREME_ABUSE':
      severity = 'HIGH';
      actions.push('SUSPEND_ACCOUNT');
      actions.push('BLOCK_IP');
      actions.push('NOTIFY_ADMIN');
      break;
  }

  return { actions, severity };
}

// ==========================================
// 🛠️ HELPER FUNCTIONS
// ==========================================

/**
 * Get all abuse limits for a specific plan
 */
export function getPlanAbuseLimits(planType: PlanType) {
  return {
    studio: STUDIO_HARD_LIMITS[planType],
    document: DOCUMENT_HARD_LIMITS[planType],
    api: API_RATE_LIMITS[planType],
    voice: VOICE_HARD_LIMITS[planType],
  };
}

/**
 * Check if user can create new account on device
 */
export function canCreateAccountOnDevice(params: {
  existingAccountsOnDevice: number;
  existingStarterAccountsOnDevice: number;
  accountsCreatedOnIPToday: number;
  daysSinceLastAccountOnDevice: number;
  isStarterAccount: boolean;
}): { allowed: boolean; reason: string } {
  const {
    existingAccountsOnDevice,
    existingStarterAccountsOnDevice,
    accountsCreatedOnIPToday,
    daysSinceLastAccountOnDevice,
    isStarterAccount,
  } = params;

  // Check device account limit
  if (existingAccountsOnDevice >= DEVICE_FINGERPRINT_LIMITS.maxAccountsPerDevice) {
    return {
      allowed: false,
      reason: `Maximum accounts (${DEVICE_FINGERPRINT_LIMITS.maxAccountsPerDevice}) reached on this device`,
    };
  }

  // Check starter account limit
  if (
    isStarterAccount &&
    existingStarterAccountsOnDevice >= DEVICE_FINGERPRINT_LIMITS.maxStarterAccountsPerDevice
  ) {
    return {
      allowed: false,
      reason: 'Only one free account allowed per device',
    };
  }

  // Check IP daily limit
  if (accountsCreatedOnIPToday >= DEVICE_FINGERPRINT_LIMITS.maxAccountsPerIP24Hours) {
    return {
      allowed: false,
      reason: 'Too many accounts created from this network today',
    };
  }

  // Check cooldown period
  if (
    existingAccountsOnDevice > 0 &&
    daysSinceLastAccountOnDevice < DEVICE_FINGERPRINT_LIMITS.newAccountCooldownDays
  ) {
    return {
      allowed: false,
      reason: `Please wait ${DEVICE_FINGERPRINT_LIMITS.newAccountCooldownDays - daysSinceLastAccountOnDevice} days before creating another account`,
    };
  }

  return {
    allowed: true,
    reason: 'Account creation allowed',
  };
}

/**
 * Check if user can purchase booster
 */
export function canPurchaseBooster(params: {
  accountAgeDays: number;
  mobileVerified: boolean;
  emailVerified: boolean;
  hoursSinceLastBoosterPurchase: number;
  boosterType: 'COOLDOWN' | 'ADDON' | 'STUDIO';
  failedPaymentsToday: number;
}): { allowed: boolean; reason: string } {
  const {
    accountAgeDays,
    mobileVerified,
    emailVerified,
    hoursSinceLastBoosterPurchase,
    boosterType,
    failedPaymentsToday,
  } = params;

  // Check account age
  if (accountAgeDays < ACCOUNT_ELIGIBILITY.minAccountAgeDaysForBoosters) {
    return {
      allowed: false,
      reason: `Account must be at least ${ACCOUNT_ELIGIBILITY.minAccountAgeDaysForBoosters} days old to purchase boosters`,
    };
  }

  // Check mobile verification
  if (ACCOUNT_ELIGIBILITY.requireMobileForBoosters && !mobileVerified) {
    return {
      allowed: false,
      reason: 'Mobile verification required to purchase boosters',
    };
  }

  // Check email verification
  if (!emailVerified) {
    return {
      allowed: false,
      reason: 'Email verification required to purchase boosters',
    };
  }

  // Check failed payments
  if (failedPaymentsToday >= BOOSTER_PURCHASE_CONTROLS.maxFailedPaymentsPerDay) {
    return {
      allowed: false,
      reason: 'Too many failed payment attempts today. Please try again tomorrow.',
    };
  }

  // Check minimum gap between purchases
  let minGapHours: number;
  switch (boosterType) {
    case 'COOLDOWN':
      minGapHours = BOOSTER_PURCHASE_CONTROLS.minGapCooldownHours;
      break;
    case 'ADDON':
      minGapHours = BOOSTER_PURCHASE_CONTROLS.minGapAddonHours;
      break;
    case 'STUDIO':
      minGapHours = BOOSTER_PURCHASE_CONTROLS.minGapStudioHours;
      break;
  }

  if (hoursSinceLastBoosterPurchase < minGapHours) {
    return {
      allowed: false,
      reason: `Please wait ${minGapHours - hoursSinceLastBoosterPurchase} hours before purchasing another ${boosterType.toLowerCase()} booster`,
    };
  }

  return {
    allowed: true,
    reason: 'Booster purchase allowed',
  };
}

/**
 * Check if feature usage is within hard limits
 */
export function checkStudioHardLimit(params: {
  planType: PlanType;
  feature: 'imageGeneration' | 'talkingPhoto' | 'logoPreview' | 'logoFinal';
  usageToday: number;
  usageThisHour: number;
}): { allowed: boolean; reason: string; limitType?: 'daily' | 'hourly' } {
  const { planType, feature, usageToday, usageThisHour } = params;

  const limits = STUDIO_HARD_LIMITS[planType];

  if (!limits) {
    return {
      allowed: false,
      reason: 'Studio access not available on your plan',
    };
  }

  const featureLimits = limits[feature];

  // Check daily limit
  if (usageToday >= featureLimits.perDay) {
    return {
      allowed: false,
      reason: `Daily limit (${featureLimits.perDay}) reached for ${feature}`,
      limitType: 'daily',
    };
  }

  // Check hourly limit (only for features that have it: imageGeneration, talkingPhoto)
  if (
    (feature === 'imageGeneration' || feature === 'talkingPhoto') &&
    'perHour' in featureLimits
  ) {
    const hourlyLimit = (featureLimits as { perHour: number }).perHour;
    if (usageThisHour >= hourlyLimit) {
      return {
        allowed: false,
        reason: `Hourly limit (${hourlyLimit}) reached for ${feature}. Please wait.`,
        limitType: 'hourly',
      };
    }
  }

  return {
    allowed: true,
    reason: 'Within limits',
  };
}

/**
 * Check if document processing is within limits
 */
export function checkDocumentLimit(params: {
  planType: PlanType;
  docsProcessedToday: number;
  pageCount: number;
  fileSizeMB: number;
  currentConcurrentJobs: number;
}): { allowed: boolean; reason: string } {
  const { planType, docsProcessedToday, pageCount, fileSizeMB, currentConcurrentJobs } = params;

  const limits = DOCUMENT_HARD_LIMITS[planType];

  if (!limits) {
    return {
      allowed: false,
      reason: 'Document Intelligence not available on your plan',
    };
  }

  if (docsProcessedToday >= limits.docsPerDay) {
    return {
      allowed: false,
      reason: `Daily document limit (${limits.docsPerDay}) reached`,
    };
  }

  if (pageCount > limits.maxPagesPerDoc) {
    return {
      allowed: false,
      reason: `Document exceeds page limit (max ${limits.maxPagesPerDoc} pages)`,
    };
  }

  if (fileSizeMB > limits.maxFileSizeMB) {
    return {
      allowed: false,
      reason: `File size exceeds limit (max ${limits.maxFileSizeMB}MB)`,
    };
  }

  if (currentConcurrentJobs >= limits.maxConcurrentParsing) {
    return {
      allowed: false,
      reason: 'Please wait for current document to finish processing',
    };
  }

  return {
    allowed: true,
    reason: 'Within limits',
  };
}

/**
 * Check API rate limit
 */
export function checkAPIRateLimit(params: {
  planType: PlanType;
  requestsThisMinute: number;
  requestsThisHour: number;
  requestsLast10Seconds: number;
  requestedContextTokens: number;
  requestedOutputTokens: number;
}): { allowed: boolean; reason: string; retryAfterSeconds?: number } {
  const {
    planType,
    requestsThisMinute,
    requestsThisHour,
    requestsLast10Seconds,
    requestedContextTokens,
    requestedOutputTokens,
  } = params;

  const limits = API_RATE_LIMITS[planType];

  // Check burst limit
  if (requestsLast10Seconds >= limits.burstLimit10Seconds) {
    return {
      allowed: false,
      reason: 'Too many requests. Please slow down.',
      retryAfterSeconds: 10,
    };
  }

  // Check per-minute limit
  if (requestsThisMinute >= limits.requestsPerMinute) {
    return {
      allowed: false,
      reason: `Rate limit exceeded (${limits.requestsPerMinute}/min)`,
      retryAfterSeconds: 60,
    };
  }

  // Check per-hour limit
  if (requestsThisHour >= limits.requestsPerHour) {
    return {
      allowed: false,
      reason: `Hourly limit exceeded (${limits.requestsPerHour}/hour)`,
      retryAfterSeconds: 3600,
    };
  }

  // Check context token limit
  if (requestedContextTokens > limits.maxContextTokens) {
    return {
      allowed: false,
      reason: `Context too long (max ${limits.maxContextTokens} tokens on your plan)`,
    };
  }

  // Check output token limit
  if (requestedOutputTokens > limits.maxOutputTokens) {
    return {
      allowed: false,
      reason: `Output too long (max ${limits.maxOutputTokens} tokens on your plan)`,
    };
  }

  return {
    allowed: true,
    reason: 'Within limits',
  };
}

// ==========================================
// 📊 EXPORTS SUMMARY
// ==========================================
// All types, interfaces, constants, and functions are exported
// where they are defined above. No additional exports needed.
//
// EXPORTED TYPES:
// - UserTrustLevel
// - FraudTrigger
// - DeviceFingerprint
// - StudioHardLimits
// - DocumentHardLimits
// - APIRateLimits
// - VoiceHardLimits
// - RefundEligibility
//
// EXPORTED CONSTANTS:
// - ACCOUNT_ELIGIBILITY
// - DEVICE_FINGERPRINT_LIMITS
// - PAYMENT_ACTIVATION
// - STUDIO_HARD_LIMITS
// - DOCUMENT_HARD_LIMITS
// - API_RATE_LIMITS
// - VOICE_HARD_LIMITS
// - BOOSTER_PURCHASE_CONTROLS
// - REFUND_POLICY
// - TECHNICAL_FAILURE_POLICY
// - FRAUD_DETECTION
// - FRAUD_ACTIONS
//
// EXPORTED FUNCTIONS:
// - getUserTrustLevel()
// - getActivationDelayMinutes()
// - checkRefundEligibility()
// - handleFraudDetection()
// - getPlanAbuseLimits()
// - canCreateAccountOnDevice()
// - canPurchaseBooster()
// - checkStudioHardLimit()
// - checkDocumentLimit()
// - checkAPIRateLimit()