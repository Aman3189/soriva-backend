/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ALERT SERVICE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Generate usage alerts (75% warning, 100% limit)
 * Author: Amandeep, Punjab, India
 * Philosophy: Clean UX - no counters in main chat
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PlanType, PLANS_STATIC_CONFIG } from '../constants/plans';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface UsageStatus {
  tokensUsed: number;
  tokensLimit: number;
  percentage: number;
  resetTime: number; // hours until reset
}

export interface BoosterOption {
  type: 'cooldown' | 'addon';
  name: string;
  price: number;
  tokensUnlocked?: number;
  tokensAdded?: number;
  validity?: number;
}

export interface AlertResponse {
  type: 'warning' | 'limit_reached' | null;
  message: string;
  percentage: number;
  resetTime: number;
  boosters?: BoosterOption[];
  upgradeOption?: {
    planName: string;
    planPrice: number;
    benefits: string[];
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALERT SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AlertService {
  
  /**
   * Generate usage alert based on current usage
   */
  static generateAlert(
    usageStatus: UsageStatus,
    planType: PlanType
  ): AlertResponse | null {
    
    const { percentage, resetTime } = usageStatus;
    
    // No alert needed (< 75%)
    if (percentage < 75) {
      return null;
    }
    
    // 100% - Limit Reached
    if (percentage >= 100) {
      return {
        type: 'limit_reached',
        message: this.getLimitReachedMessage(resetTime),
        percentage: Math.round(percentage),
        resetTime,
        boosters: this.getBoosters(planType),
        upgradeOption: this.getUpgradeOption(planType),
      };
    }
    
    // 75-99% - Warning
    if (percentage >= 75) {
      return {
        type: 'warning',
        message: this.getWarningMessage(),
        percentage: Math.round(percentage),
        resetTime,
        boosters: this.getBoosters(planType),
      };
    }
    
    return null;
  }
  
  /**
   * Get warning message (75-99%)
   */
  private static getWarningMessage(): string {
    return "You're using Soriva actively today! 🔥 Running low on daily quota.";
  }
  
  /**
   * Get limit reached message (100%)
   */
  private static getLimitReachedMessage(resetTime: number): string {
    if (resetTime <= 1) {
      return "Daily limit reached. Great session! Resets in less than an hour.";
    }
    
    return `Daily limit reached. Great session! Come back in ${resetTime} hours or unlock instantly.`;
  }
  
  /**
   * Get available boosters for plan
   */
  /**
 * Get available boosters for plan
 */
private static getBoosters(planType: PlanType): BoosterOption[] {
  const plan = PLANS_STATIC_CONFIG[planType];
  const boosters: BoosterOption[] = [];
  
  // Safety check - if plan not found, return empty
  if (!plan) {
    return boosters;
  }
  
  // Add cooldown booster (if available)
  if (plan.cooldownBooster) {
    boosters.push({
      type: 'cooldown',
      name: plan.cooldownBooster.name,
      price: plan.cooldownBooster.price,
      tokensUnlocked: plan.cooldownBooster.tokensUnlocked,
    });
  }
  
  // Add addon booster (if available)
  if (plan.addonBooster) {
    boosters.push({
      type: 'addon',
      name: plan.addonBooster.name,
      price: plan.addonBooster.price,
      tokensAdded: plan.addonBooster.tokensAdded,
      validity: plan.addonBooster.validity,
    });
  }
  
  return boosters;
}
  
  /**
   * Get upgrade option (suggest next plan)
   */
  private static getUpgradeOption(
    currentPlan: PlanType
  ): AlertResponse['upgradeOption'] | undefined {
    
    // Don't suggest upgrade for LIFE plan
    if (currentPlan === PlanType.APEX) {
      return undefined;
    }
    
    // Map current plan to next tier
    const upgradeMap: Record<PlanType, PlanType | null> = {
      [PlanType.STARTER]: PlanType.PLUS,
      [PlanType.PLUS]: PlanType.PRO,
      [PlanType.PRO]: PlanType.APEX,
      [PlanType.APEX]: PlanType.APEX,
      [PlanType.SOVEREIGN]: null, // 👑 No upgrade needed
    };
        const nextPlanType = upgradeMap[currentPlan];
    if (!nextPlanType) {
      return undefined;
    }
    
    const nextPlan = PLANS_STATIC_CONFIG[nextPlanType];
    
    return {
      planName: nextPlan.displayName,
      planPrice: nextPlan.price,
      benefits: this.getUpgradeBenefits(currentPlan, nextPlanType),
    };
  }
  
  /**
   * Get upgrade benefits (why upgrade?)
   */
  private static getUpgradeBenefits(
    currentPlan: PlanType,
    nextPlan: PlanType
  ): string[] {
    
    const current = PLANS_STATIC_CONFIG[currentPlan];
    const next = PLANS_STATIC_CONFIG[nextPlan];
    
    const benefits: string[] = [];
    
    // Calculate multiplier
    const tokenMultiplier = Math.round(
      next.limits.monthlyTokens / current.limits.monthlyTokens
    );
    
    if (tokenMultiplier > 1) {
      benefits.push(`${tokenMultiplier}x more capacity`);
    }
    
    // Response quality
    if (next.limits.botResponseLimit > current.limits.botResponseLimit) {
      benefits.push('Longer, detailed responses');
    }
    
    // Speed
    if (next.limits.responseDelay < current.limits.responseDelay) {
      benefits.push('Faster response times');
    }
    
    // Memory
    if (next.limits.memoryDays > current.limits.memoryDays) {
      benefits.push(`${next.limits.memoryDays} days memory`);
    }
    
    // Features
    if (next.features.smartRouting && !current.features.smartRouting) {
      benefits.push('Smart AI routing');
    }
    
    return benefits;
  }
  
  /**
   * Calculate reset time (hours until daily limit resets)
   */
  static calculateResetTime(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const hoursUntilReset = Math.ceil(
      (midnight.getTime() - now.getTime()) / (1000 * 60 * 60)
    );
    
    return hoursUntilReset;
  }
}