// src/constants/abuse-limits.ts

/**
 * ==========================================
 * SORIVA V3 - ABUSE PREVENTION & LIMITS
 * ==========================================
 * Comprehensive anti-abuse controls linked with plans.ts
 * Last Updated: January 19, 2026 - Added LITE plan support
 *
 * CHANGES (January 19, 2026):
 * - ✅ ADDED: LITE plan to all Record<PlanType, ...> objects
 * - ✅ LITE has limited Studio access (Schnell images only)
 * - ✅ LITE has no document intelligence access
 * - ✅ LITE has same API rate limits as STARTER
 * - ✅ LITE has no voice access
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
 * ✅ UPDATED: Added LITE plan (Schnell images only)
 */
export const STUDIO_HARD_LIMITS: Record<PlanType, StudioHardLimits | null> = {
  [PlanType.STARTER]: null, // No studio access

  // ✅ NEW: LITE has limited Studio access (Schnell images only)
  [PlanType.LITE]: {
    imageGeneration: {
      perDay: 5,      // Limited - Schnell only
      perHour: 3,
    },
    talkingPhoto: {
      perDay: 0,      // No talking photo
      perHour: 0,
    },
    logoPreview: {
      perDay: 0,      // No logo features
    },
    logoFinal: {
      perDay: 0,
    },
  },

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

  [PlanType.SOVEREIGN]: null, // 👑 No limits for Sovereign
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
 * ✅ UPDATED: Added LITE plan (no document access)
 */
export const DOCUMENT_HARD_LIMITS: Record<PlanType, DocumentHardLimits | null> = {
  [PlanType.STARTER]: null, // No document intelligence access
  [PlanType.LITE]: null,    // ✅ NEW: No document intelligence for free tier

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

  [PlanType.SOVEREIGN]: null, // 👑 No limits for Sovereign
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
 * ✅ UPDATED: Added LITE plan (same as STARTER but slightly better)
 */
export const API_RATE_LIMITS: Record<PlanType, APIRateLimits> = {
  [PlanType.STARTER]: {
    requestsPerMinute: 5,
    requestsPerHour: 50,
    maxContextTokens: 4000,
    maxOutputTokens: 1000,
    burstLimit10Seconds: 3,
  },

  // ✅ NEW: LITE has slightly better limits than STARTER
  [PlanType.LITE]: {
    requestsPerMinute: 8,
    requestsPerHour: 80,
    maxContextTokens: 8000,
    maxOutputTokens: 1500,
    burstLimit10Seconds: 4,
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

  [PlanType.SOVEREIGN]: {
    requestsPerMinute: 9999,
    requestsPerHour: 99999,
    maxContextTokens: 999999,
    maxOutputTokens: 99999,
    burstLimit10Seconds: 9999,
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
  minutesPerMonth: number;
  /** Maximum single audio length in seconds */
  maxAudioLengthSeconds: number;
  /** Maximum voice requests per hour */
  requestsPerHour: number;
}

/**
 * Voice hard limits per plan
 * Prevents STT/TTS API abuse
 * ✅ UPDATED: Added LITE plan (no voice access)
 */
export const VOICE_HARD_LIMITS: Record<PlanType, VoiceHardLimits | null> = {
  [PlanType.STARTER]: null, // No voice access
  [PlanType.LITE]: null,    // ✅ NEW: No voice access for free tier

  [PlanType.PLUS]: {
    minutesPerMonth: 30,
    maxAudioLengthSeconds: 60,
    requestsPerHour: 30,
  },

  [PlanType.PRO]: {
    minutesPerMonth: 45,
    maxAudioLengthSeconds: 120,
    requestsPerHour: 45,
  },

  [PlanType.APEX]: {
    minutesPerMonth: 60,
    maxAudioLengthSeconds: 180,
    requestsPerHour: 60,
  },

  [PlanType.SOVEREIGN]: null, // 👑 No limits for Sovereign
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
 * Refund eligibility interface
 */
export interface RefundEligibility {
  eligible: boolean;
  refundPercentage: number;
  reason: string;
}

/**
 * Refund policy configuration
 * Compliant with Indian Consumer Protection Act
 */
export const REFUND_POLICY = {
  /** Full refund window (hours) - Service issues only */
  fullRefundWindowHours: 48,

  /** Partial refund window (days) */
  partialRefundWindowDays: 7,

  /** Partial refund percentage (30 days - days used) */
  partialRefundFormula: 'prorated',

  /** Maximum refunds per user per year */
  maxRefundsPerYear: 2,

  /** Refund processing time (business days) */
  processingDays: 5,

  /** Auto-approve refund if service uptime was below this % */
  autoApproveUptimeThreshold: 95,

  /** Reasons that always get auto-approved */
  autoApproveReasons: [
    'SERVICE_DOWNTIME',
    'PAYMENT_ERROR',
    'DUPLICATE_CHARGE',
    'TECHNICAL_FAILURE',
  ] as const,

  /** Reasons that need manual review */
  manualReviewReasons: ['NOT_SATISFIED', 'CHANGED_MIND', 'OTHER'] as const,

  /** Deny refund after this many uses in period */
  denyAfterHeavyUsage: {
    messages: 50,
    studioCredits: 10,
    documents: 5,
  },
} as const;

// ==========================================
// 🔧 TECHNICAL FAILURE COMPENSATION
// ==========================================

/**
 * Technical failure compensation policy
 * For when our systems fail, not user error
 */
export const TECHNICAL_FAILURE_POLICY = {
  /** Credit back on failed image generation */
  failedImageCreditBack: true,

  /** Credit back on failed document parsing */
  failedDocumentCreditBack: true,

  /** Maximum auto-credits per day per user */
  maxAutoCreditBackPerDay: 5,

  /** Alert threshold for failure rate (triggers investigation) */
  failureRateAlertThreshold: 0.05, // 5%

  /** Log all failures for audit */
  logAllFailures: true,
} as const;

// ==========================================
// 🚨 FRAUD DETECTION
// ==========================================

/**
 * Fraud trigger types
 */
export type FraudTrigger =
  | 'DEVICE_MISMATCH'
  | 'IP_ANOMALY'
  | 'RAPID_ACCOUNT_CREATION'
  | 'PAYMENT_PATTERN'
  | 'USAGE_SPIKE'
  | 'REFUND_ABUSE'
  | 'CHARGEBACK';

/**
 * Fraud detection thresholds
 */
export const FRAUD_DETECTION = {
  /** Flag if IP country changes mid-session */
  flagIPCountryChange: true,

  /** Flag if device fingerprint changes but session continues */
  flagDeviceChange: true,

  /** Maximum different devices per account in 24 hours */
  maxDevicesPerDay: 3,

  /** Flag if usage exceeds this multiple of plan limit */
  flagUsageMultiple: 2.0,

  /** Failed payment attempts threshold before fraud flag */
  failedPaymentThreshold: 5,

  /** Chargeback = immediate account suspension */
  suspendOnChargeback: true,

  /** Pattern detection: rapid fire requests */
  rapidFireThreshold: {
    requests: 10,
    windowSeconds: 5,
  },
} as const;

/**
 * Fraud action outcomes
 */
export const FRAUD_ACTIONS = {
  /** Actions for flagged accounts */
  flagged: {
    canPurchase: false,
    canUseStudio: true,
    canUpgrade: false,
    requireVerification: true,
  },

  /** Actions for suspended accounts */
  suspended: {
    canPurchase: false,
    canUseStudio: false,
    canUpgrade: false,
    canLogin: true, // Can login to appeal
    canChat: false,
  },

  /** Actions for banned accounts */
  banned: {
    canPurchase: false,
    canUseStudio: false,
    canUpgrade: false,
    canLogin: false,
    canChat: false,
  },
} as const;

// ==========================================
// 📊 PLAN-SPECIFIC ABUSE LIMITS
// ==========================================

/**
 * Get comprehensive abuse limits for a plan
 * ✅ UPDATED: Added LITE plan
 */
export function getPlanAbuseLimits(planType: PlanType) {
  return {
    studio: STUDIO_HARD_LIMITS[planType],
    document: DOCUMENT_HARD_LIMITS[planType],
    api: API_RATE_LIMITS[planType],
    voice: VOICE_HARD_LIMITS[planType],
  };
}

// ==========================================
// 🔍 VALIDATION FUNCTIONS
// ==========================================

/**
 * Check if account can be created on device
 */
export function canCreateAccountOnDevice(params: {
  existingAccountsOnDevice: number;
  existingStarterAccountsOnDevice: number;
  accountsCreatedOnIPToday: number;
  daysSinceLastAccountOnDevice: number;
  isStarterAccount?: boolean;
}): { allowed: boolean; reason: string } {
  const {
    existingAccountsOnDevice,
    existingStarterAccountsOnDevice,
    accountsCreatedOnIPToday,
    daysSinceLastAccountOnDevice,
  } = params;

  // Check total accounts per device
  if (existingAccountsOnDevice >= DEVICE_FINGERPRINT_LIMITS.maxAccountsPerDevice) {
    return {
      allowed: false,
      reason: 'Maximum accounts reached on this device',
    };
  }

  // Check starter accounts per device
  if (existingStarterAccountsOnDevice >= DEVICE_FINGERPRINT_LIMITS.maxStarterAccountsPerDevice) {
    return {
      allowed: false,
      reason: 'A free account already exists on this device. Please upgrade to a paid plan.',
    };
  }

  // Check IP limit
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

  // Check if feature is available (perDay > 0)
  if (featureLimits.perDay === 0) {
    return {
      allowed: false,
      reason: `${feature} is not available on your plan. Upgrade to access this feature.`,
    };
  }

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
      reason: 'Document Intelligence not available on your plan. Upgrade to PLUS or higher.',
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

/**
 * Check refund eligibility
 */
export function checkRefundEligibility(params: {
  purchaseDate: Date;
  usageStats: {
    messages: number;
    studioCredits: number;
    documents: number;
  };
  refundsThisYear: number;
  reason: string;
  serviceUptimePercent: number;
}): RefundEligibility {
  const { purchaseDate, usageStats, refundsThisYear, reason, serviceUptimePercent } = params;

  const now = new Date();
  const hoursSincePurchase = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60);
  const daysSincePurchase = hoursSincePurchase / 24;

  // Check if auto-approve reason
  if (REFUND_POLICY.autoApproveReasons.includes(reason as any)) {
    return {
      eligible: true,
      refundPercentage: 100,
      reason: 'Auto-approved due to service issue',
    };
  }

  // Check uptime threshold
  if (serviceUptimePercent < REFUND_POLICY.autoApproveUptimeThreshold) {
    return {
      eligible: true,
      refundPercentage: 100,
      reason: 'Auto-approved due to low service uptime',
    };
  }

  // Check max refunds per year
  if (refundsThisYear >= REFUND_POLICY.maxRefundsPerYear) {
    return {
      eligible: false,
      refundPercentage: 0,
      reason: 'Maximum refunds for this year already claimed',
    };
  }

  // Check heavy usage
  if (
    usageStats.messages > REFUND_POLICY.denyAfterHeavyUsage.messages ||
    usageStats.studioCredits > REFUND_POLICY.denyAfterHeavyUsage.studioCredits ||
    usageStats.documents > REFUND_POLICY.denyAfterHeavyUsage.documents
  ) {
    return {
      eligible: false,
      refundPercentage: 0,
      reason: 'Refund not available after significant service usage',
    };
  }

  // Full refund window
  if (hoursSincePurchase <= REFUND_POLICY.fullRefundWindowHours) {
    return {
      eligible: true,
      refundPercentage: 100,
      reason: 'Within full refund window',
    };
  }

  // Partial refund window
  if (daysSincePurchase <= REFUND_POLICY.partialRefundWindowDays) {
    const daysUsed = Math.ceil(daysSincePurchase);
    const refundPercentage = Math.max(0, ((30 - daysUsed) / 30) * 100);
    return {
      eligible: true,
      refundPercentage: Math.round(refundPercentage),
      reason: `Prorated refund (${daysUsed} days used)`,
    };
  }

  // Outside refund window
  return {
    eligible: false,
    refundPercentage: 0,
    reason: 'Outside refund window',
  };
}

/**
 * Handle fraud detection
 */
export function handleFraudDetection(trigger: FraudTrigger): {
  action: 'flag' | 'suspend' | 'ban' | 'monitor';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
} {
  switch (trigger) {
    case 'CHARGEBACK':
      return {
        action: 'suspend',
        severity: 'critical',
        message: 'Account suspended due to payment dispute',
      };

    case 'REFUND_ABUSE':
      return {
        action: 'flag',
        severity: 'high',
        message: 'Account flagged for refund pattern review',
      };

    case 'PAYMENT_PATTERN':
      return {
        action: 'flag',
        severity: 'medium',
        message: 'Unusual payment pattern detected',
      };

    case 'RAPID_ACCOUNT_CREATION':
      return {
        action: 'flag',
        severity: 'medium',
        message: 'Multiple accounts created in short time',
      };

    case 'DEVICE_MISMATCH':
    case 'IP_ANOMALY':
      return {
        action: 'monitor',
        severity: 'low',
        message: 'Session anomaly detected - monitoring',
      };

    case 'USAGE_SPIKE':
      return {
        action: 'monitor',
        severity: 'low',
        message: 'Unusual usage pattern - monitoring',
      };

    default:
      return {
        action: 'monitor',
        severity: 'low',
        message: 'Anomaly detected - monitoring',
      };
  }
}