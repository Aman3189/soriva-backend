// ============================================
// SORIVA HEALTH - PLAN LIMITS CONFIGURATION
// Path: src/config/health-plans.config.ts
// ============================================

import { HealthPlan } from '@prisma/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface HealthFeatureFlags {
  uploadReport: boolean;
  aiAnalysis: boolean;
  organBreakdown: boolean;
  riskScores: boolean;
  reportsList: boolean;
  compareReports: boolean;
  healthChat: boolean;
  doctorSummary: boolean;
  smartAlerts: boolean;
  quickStats: boolean;
  findDoctors: boolean;
  emergencySOS: boolean;
  downloadPDF: boolean;
  sharePDF: boolean;
}

export interface HealthPlanLimits {
  price: number;
  priceInPaise: number;
  priceUSD: number;
  priceUSDInCents: number;
  reportsPerMonth: number;
  chatsPerDay: number;
  chatEnabled: boolean;
  comparisonsPerMonth: number;
  comparisonEnabled: boolean;
  summariesPerMonth: number;
  summaryEnabled: boolean;
  maxFamilyMembers: number;
  features: HealthFeatureFlags;
}

export interface HealthUsageState {
  reportsUploaded: number;
  dailyChatsUsed: number;
  comparisonsUsed: number;
  summariesGenerated: number;
}

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  remaining: number;
  limit: number;
  percentUsed: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HEALTH_PLAN_LIMITS: Record<HealthPlan, HealthPlanLimits> = {
  FREE: {
    price: 0,
    priceInPaise: 0,
    priceUSD: 0,
    priceUSDInCents: 0,
    reportsPerMonth: 1,
    chatsPerDay: 0,
    chatEnabled: false,
    comparisonsPerMonth: 0,
    comparisonEnabled: false,
    summariesPerMonth: 0,
    summaryEnabled: false,
    maxFamilyMembers: 1,
    features: {
      uploadReport: true,
      aiAnalysis: true,
      organBreakdown: true,
      riskScores: true,
      reportsList: true,
      compareReports: false,
      healthChat: false,
      doctorSummary: false,
      smartAlerts: false,
      quickStats: true,
      findDoctors: true,
      emergencySOS: true,
      downloadPDF: false,
      sharePDF: false,
    },
  },

  BASIC: {
    price: 99,
    priceInPaise: 9900,
    priceUSD: 4.99,
    priceUSDInCents: 499,
    reportsPerMonth: 5,
    chatsPerDay: 8,
    chatEnabled: true,
    comparisonsPerMonth: 3,
    comparisonEnabled: true,
    summariesPerMonth: 3,
    summaryEnabled: true,
    maxFamilyMembers: 1,
    features: {
      uploadReport: true,
      aiAnalysis: true,
      organBreakdown: true,
      riskScores: true,
      reportsList: true,
      compareReports: true,
      healthChat: true,
      doctorSummary: true,
      smartAlerts: true,
      quickStats: true,
      findDoctors: true,
      emergencySOS: true,
      downloadPDF: true,
      sharePDF: true,
    },
  },

  PRO: {
    price: 199,
    priceInPaise: 19900,
    priceUSD: 9.99,
    priceUSDInCents: 999,
    reportsPerMonth: 15,
    chatsPerDay: 20,
    chatEnabled: true,
    comparisonsPerMonth: 10,
    comparisonEnabled: true,
    summariesPerMonth: 10,
    summaryEnabled: true,
    maxFamilyMembers: 1,
    features: {
      uploadReport: true,
      aiAnalysis: true,
      organBreakdown: true,
      riskScores: true,
      reportsList: true,
      compareReports: true,
      healthChat: true,
      doctorSummary: true,
      smartAlerts: true,
      quickStats: true,
      findDoctors: true,
      emergencySOS: true,
      downloadPDF: true,
      sharePDF: true,
    },
  },

  FAMILY: {
    price: 299,
    priceInPaise: 29900,
    priceUSD: 14.99,
    priceUSDInCents: 1499,
    reportsPerMonth: 30,
    chatsPerDay: 50,
    chatEnabled: true,
    comparisonsPerMonth: 20,
    comparisonEnabled: true,
    summariesPerMonth: 20,
    summaryEnabled: true,
    maxFamilyMembers: 5,
    features: {
      uploadReport: true,
      aiAnalysis: true,
      organBreakdown: true,
      riskScores: true,
      reportsList: true,
      compareReports: true,
      healthChat: true,
      doctorSummary: true,
      smartAlerts: true,
      quickStats: true,
      findDoctors: true,
      emergencySOS: true,
      downloadPDF: true,
      sharePDF: true,
    },
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getPlanLimits(plan: HealthPlan): HealthPlanLimits {
  return HEALTH_PLAN_LIMITS[plan];
}

export function isFeatureAvailable(
  plan: HealthPlan,
  feature: keyof HealthFeatureFlags
): boolean {
  return HEALTH_PLAN_LIMITS[plan].features[feature];
}

export function canUploadReport(
  plan: HealthPlan,
  usage: HealthUsageState
): UsageCheckResult {
  const limits = HEALTH_PLAN_LIMITS[plan];
  const remaining = limits.reportsPerMonth - usage.reportsUploaded;

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `Monthly limit reached (${limits.reportsPerMonth}/${limits.reportsPerMonth})`,
      remaining: 0,
      limit: limits.reportsPerMonth,
      percentUsed: 100,
    };
  }

  return {
    allowed: true,
    remaining,
    limit: limits.reportsPerMonth,
    percentUsed: (usage.reportsUploaded / limits.reportsPerMonth) * 100,
  };
}

export function canSendChat(
  plan: HealthPlan,
  usage: HealthUsageState
): UsageCheckResult {
  const limits = HEALTH_PLAN_LIMITS[plan];

  if (!limits.chatEnabled) {
    return {
      allowed: false,
      reason: 'Health Chat not available on FREE plan',
      remaining: 0,
      limit: 0,
      percentUsed: 100,
    };
  }

  const remaining = limits.chatsPerDay - usage.dailyChatsUsed;

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `Daily limit reached (${limits.chatsPerDay}/${limits.chatsPerDay})`,
      remaining: 0,
      limit: limits.chatsPerDay,
      percentUsed: 100,
    };
  }

  return {
    allowed: true,
    remaining,
    limit: limits.chatsPerDay,
    percentUsed: (usage.dailyChatsUsed / limits.chatsPerDay) * 100,
  };
}

export function canCompareReports(
  plan: HealthPlan,
  usage: HealthUsageState
): UsageCheckResult {
  const limits = HEALTH_PLAN_LIMITS[plan];

  if (!limits.comparisonEnabled) {
    return {
      allowed: false,
      reason: 'Report Comparison not available on FREE plan',
      remaining: 0,
      limit: 0,
      percentUsed: 100,
    };
  }

  const remaining = limits.comparisonsPerMonth - usage.comparisonsUsed;

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `Monthly limit reached (${limits.comparisonsPerMonth}/${limits.comparisonsPerMonth})`,
      remaining: 0,
      limit: limits.comparisonsPerMonth,
      percentUsed: 100,
    };
  }

  return {
    allowed: true,
    remaining,
    limit: limits.comparisonsPerMonth,
    percentUsed: (usage.comparisonsUsed / limits.comparisonsPerMonth) * 100,
  };
}

export function canGenerateSummary(
  plan: HealthPlan,
  usage: HealthUsageState
): UsageCheckResult {
  const limits = HEALTH_PLAN_LIMITS[plan];

  if (!limits.summaryEnabled) {
    return {
      allowed: false,
      reason: 'Doctor Summary not available on FREE plan',
      remaining: 0,
      limit: 0,
      percentUsed: 100,
    };
  }

  const remaining = limits.summariesPerMonth - usage.summariesGenerated;

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `Monthly limit reached (${limits.summariesPerMonth}/${limits.summariesPerMonth})`,
      remaining: 0,
      limit: limits.summariesPerMonth,
      percentUsed: 100,
    };
  }

  return {
    allowed: true,
    remaining,
    limit: limits.summariesPerMonth,
    percentUsed: (usage.summariesGenerated / limits.summariesPerMonth) * 100,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISPLAY INFO (For Frontend)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const HEALTH_PLAN_DISPLAY: Record<HealthPlan, {
  name: string;
  description: string;
  badge: string | null;
  color: string;
}> = {
  FREE: {
    name: 'Free',
    description: 'Basic health tracking',
    badge: null,
    color: '#6B7280',
  },
  BASIC: {
    name: 'Basic',
    description: 'Essential health insights',
    badge: null,
    color: '#3B82F6',
  },
  PRO: {
    name: 'Pro',
    description: 'Advanced analytics',
    badge: 'POPULAR',
    color: '#8B5CF6',
  },
  FAMILY: {
    name: 'Family',
    description: 'For your whole family',
    badge: 'BEST VALUE',
    color: '#10B981',
  },
};