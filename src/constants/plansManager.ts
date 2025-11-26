// src/constants/plansManager.ts

/**
 * ==========================================
 * SORIVA PLANS MANAGER - CLASS-BASED SYSTEM
 * ==========================================
 * Future-proof, dynamic, database-ready
 * Created by: Amandeep, Punjab, India
 * Last Updated: November 2, 2025 - Studio Feature Implementation
 *
 * LATEST CHANGES (November 2, 2025):
 * - ✅ ADDED Studio credit tracking methods
 * - ✅ ADDED Studio booster purchase logic
 * - ✅ ADDED Credit deduction & validation
 * - ✅ ADDED Preview system logic
 * - ✅ ADDED Feature access validation
 * - ✅ ADDED Universal Studio Boosters support
 * 
 * PREVIOUS CHANGES (November 1, 2025):
 * - ❌ REMOVED Studio features (rebuilt separately)
 * - ❌ REMOVED credits methods (re-added now with new system)
 * - ✅ Updated STARTER plan support
 * - ✅ Progressive cooldown pricing intact
 * - ✅ All validation methods updated
 *
 * ARCHITECTURE: OPTION B (Pure Class-Based)
 * ├── Data Layer: plans.ts (Pure data only)
 * └── Logic Layer: plansManager.ts (THIS FILE - All business logic)
 */

import {
  PlanType,
  Plan,
  CooldownBooster,
  AddonBooster,
  StudioBooster,
  StudioFeature,  // ✅ ADD THIS LINE
  PLANS_STATIC_CONFIG,
  STUDIO_BOOSTERS,
  STUDIO_FEATURES,
  STUDIO_CREDIT_VALUE,
  STUDIO_CREDITS_PER_RUPEE,
  STUDIO_FREE_PREVIEWS,
  STUDIO_EXTRA_PREVIEW_COST,
  STUDIO_MAX_PREVIEWS,
  STUDIO_BOOSTER_MAX_PER_MONTH,
} from '../constants/plans';
// ==========================================
// INTERFACES
// ==========================================

interface PlansCache {
  plans: Map<PlanType, Plan>;
  lastUpdated: Date;
  source: 'STATIC' | 'DATABASE';
}

interface AddonDistribution {
  totalWords: number;
  dailyAllocation: number;
  remainingDays: number;
  perDayDistribution: number;
}

interface ProgressivePriceResult {
  basePrice: number;
  multiplier: number;
  finalPrice: number;
  purchaseNumber: number;
  maxPurchasesPerPeriod: number;
  canPurchase: boolean;
  message?: string;
}

interface CooldownEligibilityResult {
  eligible: boolean;
  reason?: string;
  currentPurchases: number;
  maxPurchases: number;
  nextResetDate?: Date;
}

// ==========================================
// 🎬 NEW: STUDIO INTERFACES
// ==========================================

interface StudioCreditCheck {
  hasEnough: boolean;
  currentCredits: number;
  requiredCredits: number;
  shortfall: number;
}

interface StudioFeatureAccess {
  canAccess: boolean;
  featureId: string;
  featureName: string;
  creditsRequired: number;
  userCredits: number;
  reason?: string;
}

interface StudioBoosterPurchase {
  boosterId: string;
  creditsAdded: number;
  price: number;
  validity: number;
  canPurchase: boolean;
  reason?: string;
}

interface PreviewCostCalculation {
  freePreviewsRemaining: number;
  additionalPreviewsUsed: number;
  creditsCharged: number;
  canPreview: boolean;
  totalPreviewsUsed: number;
  maxPreviewsAllowed: number;
}

// ==========================================
// PLANS MANAGER CLASS
// ==========================================

export class PlansManager {
  private static instance: PlansManager;
  private cache: PlansCache;
  private configService: any = null;

  private constructor() {
    this.cache = {
      plans: new Map(Object.entries(PLANS_STATIC_CONFIG) as [PlanType, Plan][]),
      lastUpdated: new Date(),
      source: 'STATIC',
    };

    this.tryLoadConfigService();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PlansManager {
    if (!PlansManager.instance) {
      PlansManager.instance = new PlansManager();
    }
    return PlansManager.instance;
  }

  /**
   * Reset instance (useful for testing)
   */
  public static resetInstance(): void {
    PlansManager.instance = null as any;
  }

  // ==========================================
  // CORE PLAN RETRIEVAL METHODS
  // ==========================================

  public getPlan(planType: PlanType): Plan | undefined {
    return this.cache.plans.get(planType);
  }

  public getAllPlans(): Plan[] {
    return Array.from(this.cache.plans.values());
  }

  public getEnabledPlans(): Plan[] {
    return this.getAllPlans().filter((plan) => plan.enabled);
  }

  /**
   * Get plans for launch (Phase 1: STARTER, PLUS, PRO)
   */
  public getLaunchPlans(): Plan[] {
    const launchPlanTypes: PlanType[] = [PlanType.STARTER, PlanType.PLUS, PlanType.PRO];
    return this.getAllPlans().filter((plan) => launchPlanTypes.includes(plan.id) && plan.enabled);
  }

  public getHeroPlan(): Plan | undefined {
    return this.getAllPlans().find((plan) => plan.hero);
  }

  public getPlanByName(name: string): Plan | undefined {
    const normalizedName = name.toLowerCase();
    return this.getAllPlans().find((plan) => plan.name.toLowerCase() === normalizedName);
  }

  public getPlansSortedByPrice(ascending: boolean = true): Plan[] {
    const plans = this.getAllPlans();
    return plans.sort((a, b) => (ascending ? a.price - b.price : b.price - a.price));
  }

  public getPlansSortedByOrder(): Plan[] {
    return this.getAllPlans().sort((a, b) => a.order - b.order);
  }

  // ==========================================
  // FEATURE CHECKS
  // ==========================================

  public hasCooldownBooster(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return !!plan?.cooldownBooster;
  }

  public hasAddonBooster(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return !!plan?.addonBooster;
  }

  public hasDocumentation(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return !!plan?.documentation?.enabled;
  }

  /**
   * Check if plan has trial (STARTER no longer has trial)
   */
  public hasTrial(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return !!plan?.trial?.enabled;
  }

  public isPlanEnabled(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return plan?.enabled ?? false;
  }

  public isHeroPlan(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return plan?.hero ?? false;
  }

  public hasFileUpload(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return plan?.features.fileUpload ?? false;
  }

  public hasPrioritySupport(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return plan?.features.prioritySupport ?? false;
  }

  // ==========================================
  // 🎬 NEW: STUDIO FEATURE CHECKS
  // ==========================================

  /**
   * Check if plan has Studio access (bonus credits)
   */
  public hasStudioAccess(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return plan?.features.studio ?? false;
  }

  /**
   * Get monthly studio credits for plan
   */
  public getStudioCredits(planType: PlanType): number {
    const plan = this.getPlan(planType);
    return plan?.limits.studioCredits ?? 0;
  }

  /**
   * Check if user has enough credits
   */
  public checkStudioCredits(currentCredits: number, requiredCredits: number): StudioCreditCheck {
    const hasEnough = currentCredits >= requiredCredits;
    const shortfall = hasEnough ? 0 : requiredCredits - currentCredits;

    return {
      hasEnough,
      currentCredits,
      requiredCredits,
      shortfall,
    };
  }

  /**
   * Check if user can access a specific studio feature
   */
  public canAccessStudioFeature(
    featureId: string,
    currentCredits: number
  ): StudioFeatureAccess {
    const feature = STUDIO_FEATURES[featureId as keyof typeof STUDIO_FEATURES];

    if (!feature) {
      return {
        canAccess: false,
        featureId,
        featureName: 'Unknown Feature',
        creditsRequired: 0,
        userCredits: currentCredits,
        reason: 'Feature not found',
      };
    }

    const creditsRequired = feature.credits;
    const canAccess = currentCredits >= creditsRequired;

    return {
      canAccess,
      featureId,
      featureName: feature.name,
      creditsRequired,
      userCredits: currentCredits,
      reason: canAccess ? undefined : `Need ${creditsRequired - currentCredits} more credits`,
    };
  }

  // ==========================================
  // 🎬 NEW: STUDIO BOOSTER METHODS
  // ==========================================

  /**
   * Get all studio boosters
   */
  public getAllStudioBoosters(): StudioBooster[] {
    return Object.values(STUDIO_BOOSTERS);
  }

  /**
   * Get studio booster by ID
   */
  public getStudioBooster(boosterId: string): StudioBooster | undefined {
    return STUDIO_BOOSTERS[boosterId.toUpperCase() as keyof typeof STUDIO_BOOSTERS];
  }

  /**
   * Get studio booster by name
   */
  public getStudioBoosterByName(name: string): StudioBooster | undefined {
    const normalizedName = name.toLowerCase();
    return Object.values(STUDIO_BOOSTERS).find(
      (booster) => booster.name.toLowerCase() === normalizedName
    );
  }

  /**
   * Check if user can purchase studio booster
   * NOTE: Studio boosters are universal - ANY user can buy ANY booster
   */
  public canPurchaseStudioBooster(
    boosterId: string,
    currentMonthPurchases: number
  ): StudioBoosterPurchase {
    const booster = this.getStudioBooster(boosterId);

    if (!booster) {
      return {
        boosterId,
        creditsAdded: 0,
        price: 0,
        validity: 0,
        canPurchase: false,
        reason: 'Booster not found',
      };
    }

    const maxPerMonth = booster.maxPerMonth || STUDIO_BOOSTER_MAX_PER_MONTH;
    const canPurchase = currentMonthPurchases < maxPerMonth;

    return {
      boosterId: booster.id,
      creditsAdded: booster.creditsAdded,
      price: booster.price,
      validity: booster.validity,
      canPurchase,
      reason: canPurchase
        ? undefined
        : `Maximum ${maxPerMonth} purchases per month reached`,
    };
  }

  /**
   * Get recommended studio booster based on user needs
   */
  public getRecommendedStudioBooster(estimatedVideosNeeded: number): StudioBooster | null {
    const boosters = this.getAllStudioBoosters().sort((a, b) => a.price - b.price);

    // Assume average 25 credits per video (mix of features)
    const estimatedCreditsNeeded = estimatedVideosNeeded * 25;

    for (const booster of boosters) {
      if (booster.creditsAdded >= estimatedCreditsNeeded) {
        return booster;
      }
    }

    // If user needs more than MAX booster, return MAX
    return boosters[boosters.length - 1] || null;
  }

  // ==========================================
  // 🎬 NEW: PREVIEW SYSTEM METHODS
  // ==========================================

  /**
   * Calculate preview costs
   */
  public calculatePreviewCost(
    totalPreviewsUsed: number,
    featureId: string
  ): PreviewCostCalculation {
    const feature: StudioFeature | undefined = STUDIO_FEATURES[featureId as keyof typeof STUDIO_FEATURES];

    if (!feature || !feature.freePreview) {
      return {
        freePreviewsRemaining: 0,
        additionalPreviewsUsed: 0,
        creditsCharged: 0,
        canPreview: false,
        totalPreviewsUsed: 0,
        maxPreviewsAllowed: 0,
      };
    }

    const maxPreviewsAllowed = feature.maxPreviews || STUDIO_MAX_PREVIEWS;
    const freePreviewsRemaining = 0;
    const additionalPreviewsUsed = totalPreviewsUsed; 
    const previewCreditsPerPreview = feature.previewCredits || feature.credits;
    const creditsCharged = additionalPreviewsUsed * previewCreditsPerPreview;
    const canPreview = totalPreviewsUsed < maxPreviewsAllowed;

    return {
      freePreviewsRemaining,
      additionalPreviewsUsed,
      creditsCharged,
      canPreview,
      totalPreviewsUsed,
      maxPreviewsAllowed,
    };
  }

  /**
   * Check if user can generate another preview
   */
  public canGeneratePreview(
    currentPreviewCount: number,
    currentCredits: number,
    featureId: string
  ): { canGenerate: boolean; creditsCost: number; reason?: string } {
    const feature: StudioFeature | undefined = STUDIO_FEATURES[featureId as keyof typeof STUDIO_FEATURES];

    if (!feature) {
      return {
        canGenerate: false,
        creditsCost: 0,
        reason: 'Feature not found',
      };
    }
    const previewCalc = this.calculatePreviewCost(currentPreviewCount, featureId);
    if (!previewCalc.canPreview) {
      return {
        canGenerate: false,
        creditsCost: 0,
        reason: `Maximum ${previewCalc.maxPreviewsAllowed} previews reached`,
      };
    }

    const nextPreviewCost = feature.previewCredits || feature.credits;

    if (currentCredits < nextPreviewCost) {
      return {
        canGenerate: false,
        creditsCost: nextPreviewCost,
        reason: `Need ${nextPreviewCost} credits for preview`,
      };
    }

    return {
      canGenerate: true,
      creditsCost: nextPreviewCost,
    };
  }

  // ==========================================
  // 🎬 NEW: CREDIT CONVERSION METHODS
  // ==========================================

  /**
   * Convert INR to credits
   */
  public convertINRToCredits(rupees: number): number {
    return Math.floor(rupees * STUDIO_CREDITS_PER_RUPEE);
  }

  /**
   * Convert credits to INR
   */
  public convertCreditsToINR(credits: number): number {
    return Math.round((credits * STUDIO_CREDIT_VALUE) * 100) / 100;
  }

  /**
   * Get feature cost in INR
   */
  public getFeatureCostINR(featureId: string): number {
    const feature = STUDIO_FEATURES[featureId as keyof typeof STUDIO_FEATURES];
    if (!feature) return 0;
    return this.convertCreditsToINR(feature.credits);
  }

  // ==========================================
  // 🎬 NEW: STUDIO VALIDATION METHODS
  // ==========================================

  /**
   * Validate studio feature configuration
   */
  public validateStudioFeature(featureId: string): { valid: boolean; errors: string[] } {
    const feature = STUDIO_FEATURES[featureId as keyof typeof STUDIO_FEATURES];
    const errors: string[] = [];

    if (!feature) {
      return { valid: false, errors: ['Feature not found'] };
    }

    if (feature.credits <= 0) {
      errors.push('Credits must be positive');
    }

    if (feature.gpuCost < 0) {
      errors.push('GPU cost cannot be negative');
    }

    if (feature.margin < 0 || feature.margin > 1) {
      errors.push('Margin must be between 0 and 1');
    }

    if (feature.category === 'video') {
      if (!feature.duration || feature.duration <= 0) {
        errors.push('Video duration must be positive');
      }
      if (!feature.resolution) {
        errors.push('Video resolution is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate studio booster configuration
   */
  public validateStudioBooster(boosterId: string): { valid: boolean; errors: string[] } {
    const booster = this.getStudioBooster(boosterId);
    const errors: string[] = [];

    if (!booster) {
      return { valid: false, errors: ['Booster not found'] };
    }

    if (booster.price <= 0) {
      errors.push('Booster price must be positive');
    }

    if (booster.creditsAdded <= 0) {
      errors.push('Credits added must be positive');
    }

    if (booster.validity <= 0) {
      errors.push('Validity must be positive');
    }

    if (booster.maxPerMonth <= 0) {
      errors.push('Max per month must be positive');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ==========================================
  // LIMITS & QUOTAS
  // ==========================================

  public getMonthlyWordLimit(planType: PlanType): number {
    const plan = this.getPlan(planType);
    return plan?.limits.monthlyWords ?? 0;
  }

  public getDailyWordLimit(planType: PlanType): number {
    const plan = this.getPlan(planType);
    return plan?.limits.dailyWords ?? 0;
  }

  /**
   * Get bot response limit (max words per response)
   * STARTER: 65 words, others vary
   */
  public getBotResponseLimit(planType: PlanType): number {
    const plan = this.getPlan(planType);
    return plan?.limits.botResponseLimit ?? 65;
  }

  public getMemoryDays(planType: PlanType): number {
    const plan = this.getPlan(planType);
    return plan?.limits.memoryDays ?? 5;
  }

  public getContextMemory(planType: PlanType): number {
    const plan = this.getPlan(planType);
    return plan?.limits.contextMemory ?? 5;
  }

  public getResponseDelay(planType: PlanType): number {
    const plan = this.getPlan(planType);
    return plan?.limits.responseDelay ?? 5;
  }

  public getDocumentationLimit(planType: PlanType): number {
    const plan = this.getPlan(planType);
    return plan?.documentation?.monthlyWords ?? 0;
  }

  public getAllLimits(planType: PlanType) {
    const plan = this.getPlan(planType);
    return plan?.limits;
  }

  public getPlanPersonality(planType: PlanType): string | undefined {
    const plan = this.getPlan(planType);
    return plan?.personality;
  }

  // ==========================================
  // PROGRESSIVE COOLDOWN PRICING
  // ==========================================

  /**
   * Calculate progressive cooldown price
   * STARTER: ₹5 × 3 times max (5000 words each)
   */
  public calculateProgressiveCooldownPrice(
    planType: PlanType,
    purchaseNumber: number
  ): ProgressivePriceResult | null {
    const plan = this.getPlan(planType);
    const cooldown = plan?.cooldownBooster;

    if (!cooldown) {
      return null;
    }

    const basePrice = cooldown.price;
    const multipliers = cooldown.progressiveMultipliers || [1];
    const maxPurchases = cooldown.maxPerPlanPeriod || 3;

    const multiplier = multipliers[purchaseNumber] || 1;
    const finalPrice = Math.round(basePrice * multiplier);

    const canPurchase = purchaseNumber < maxPurchases;

    return {
      basePrice,
      multiplier,
      finalPrice,
      purchaseNumber,
      maxPurchasesPerPeriod: maxPurchases,
      canPurchase,
      message: canPurchase
        ? `Cooldown ${purchaseNumber + 1}/${maxPurchases}: ₹${finalPrice}`
        : `Maximum cooldowns (${maxPurchases}) reached for today`,
    };
  }

  /**
   * Get cooldown price for user's next purchase
   */
  public getNextCooldownPrice(planType: PlanType, currentPurchases: number): number | null {
    const result = this.calculateProgressiveCooldownPrice(planType, currentPurchases);
    return result?.canPurchase ? result.finalPrice : null;
  }

  /**
   * Check if user can purchase cooldown
   * STARTER: Max 3 per day, resets at midnight
   */
  public checkCooldownEligibility(
    planType: PlanType,
    currentPurchases: number,
    resetDate?: Date
  ): CooldownEligibilityResult {
    const plan = this.getPlan(planType);
    const cooldown = plan?.cooldownBooster;

    if (!cooldown) {
      return {
        eligible: false,
        reason: 'Plan does not have cooldown booster',
        currentPurchases: 0,
        maxPurchases: 0,
      };
    }

    const maxPurchases = cooldown.maxPerPlanPeriod || 3;

    // Check if period has reset (midnight for STARTER)
    const now = new Date();
    if (resetDate && now > resetDate) {
      return {
        eligible: true,
        reason: 'Daily limit reset - can purchase again',
        currentPurchases: 0,
        maxPurchases,
        nextResetDate: resetDate,
      };
    }

    // Check if under limit
    if (currentPurchases < maxPurchases) {
      return {
        eligible: true,
        currentPurchases,
        maxPurchases,
        nextResetDate: resetDate,
      };
    }

    // Limit reached
    return {
      eligible: false,
      reason: `Maximum cooldowns (${maxPurchases}) reached for today`,
      currentPurchases,
      maxPurchases,
      nextResetDate: resetDate,
    };
  }

  /**
   * Get all cooldown pricing tiers
   */
  public getCooldownPricingTiers(planType: PlanType): ProgressivePriceResult[] {
    const plan = this.getPlan(planType);
    const cooldown = plan?.cooldownBooster;

    if (!cooldown) {
      return [];
    }

    const maxPurchases = cooldown.maxPerPlanPeriod || 3;
    const tiers: ProgressivePriceResult[] = [];

    for (let i = 0; i < maxPurchases; i++) {
      const tier = this.calculateProgressiveCooldownPrice(planType, i);
      if (tier) {
        tiers.push(tier);
      }
    }

    return tiers;
  }

  // ==========================================
  // BOOSTER CALCULATIONS
  // ==========================================

  public getCooldownBooster(planType: PlanType): CooldownBooster | undefined {
    const plan = this.getPlan(planType);
    return plan?.cooldownBooster;
  }

  public getAddonBooster(planType: PlanType): AddonBooster | undefined {
    const plan = this.getPlan(planType);
    return plan?.addonBooster;
  }

  /**
   * Get cooldown words unlocked
   * STARTER: 5000 words per cooldown
   */
  public getCooldownWordsUnlocked(planType: PlanType): number {
    const cooldown = this.getCooldownBooster(planType);
    return cooldown?.wordsUnlocked ?? 0;
  }

  public getAddonWordsAdded(planType: PlanType): number {
  const addon = this.getAddonBooster(planType);
  if (!addon || typeof addon.wordsAdded !== 'number') {
    return 0;
  }
  return addon.wordsAdded;
}
/**
   * Calculate addon daily distribution
   */
  public calculateAddonDistribution(
  planType: PlanType,
  purchaseDate: Date,
  cycleEndDate: Date
): AddonDistribution {
  const addon = this.getAddonBooster(planType);
  if (!addon) {
    return {
      totalWords: 0,
      dailyAllocation: 0,
      remainingDays: 0,
      perDayDistribution: 0,
    };
  }

  const now = new Date();
  const validity = addon.validity || 10;
  const addonEndDate = new Date(purchaseDate.getTime() + validity * 24 * 60 * 60 * 1000);

  const effectiveEndDate = addonEndDate < cycleEndDate ? addonEndDate : cycleEndDate;
  const remainingDays = Math.ceil(
    (effectiveEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
  );

  const totalWords = addon.wordsAdded ?? 0;  // ✅ FIX: Add ?? 0 for undefined safety
  const perDayDistribution = remainingDays > 0 ? Math.floor(totalWords / remainingDays) : 0;

  return {
    totalWords,
    dailyAllocation: perDayDistribution,
    remainingDays: Math.max(0, remainingDays),
    perDayDistribution,
  };
}

  // ==========================================
  // AI MODEL METHODS
  // ==========================================

  public getAIModels(planType: PlanType) {
    const plan = this.getPlan(planType);
    return plan?.aiModels ?? [];
  }

  public getPrimaryAIModel(planType: PlanType) {
    const models = this.getAIModels(planType);
    return models.find((m) => !m.fallback) || models[0];
  }

  public getFallbackAIModels(planType: PlanType) {
    const models = this.getAIModels(planType);
    return models.filter((m) => m.fallback);
  }

  public isHybridPlan(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return plan?.isHybrid ?? false;
  }

  // ==========================================
  // VALIDATION METHODS
  // ==========================================

  public isValidPlanType(planType: string): planType is PlanType {
    return Object.values(PlanType).includes(planType as PlanType);
  }

  /**
   * Validate plan configuration
   * Updated to handle STARTER without trial + Studio credits
   */
  public validatePlan(planType: PlanType): { valid: boolean; errors: string[] } {
    const plan = this.getPlan(planType);
    const errors: string[] = [];

    if (!plan) {
      return { valid: false, errors: ['Plan not found'] };
    }

    // Validate basic fields
    if (!plan.name || plan.name.trim() === '') {
      errors.push('Plan name is required');
    }

    if (!plan.displayName || plan.displayName.trim() === '') {
      errors.push('Plan display name is required');
    }

    if (plan.price < 0) {
      errors.push('Plan price cannot be negative');
    }

    // Validate limits
    if (plan.limits.monthlyWords <= 0) {
      errors.push('Monthly words must be positive');
    }

    if (plan.limits.dailyWords <= 0) {
      errors.push('Daily words must be positive');
    }

    if (plan.limits.dailyWords > plan.limits.monthlyWords) {
      errors.push('Daily words cannot exceed monthly words');
    }

    // 🎬 NEW: Validate studio credits
    if ((plan.limits.studioCredits ?? 0) < 0) {

      errors.push('Studio credits cannot be negative');
    }

    // Validate AI models
    if (!plan.aiModels || plan.aiModels.length === 0) {
      errors.push('Plan must have at least one AI model');
    }

    // Validate cooldown booster if present
    if (plan.cooldownBooster) {
      if (plan.cooldownBooster.price < 0) {
        errors.push('Cooldown booster price cannot be negative');
      }
      if (plan.cooldownBooster.wordsUnlocked <= 0) {
        errors.push('Cooldown booster words must be positive');
      }
    }

          // Validate addon booster if present (STARTER doesn't have)
      if (plan.addonBooster) {
        if (plan.addonBooster.price < 0) {
          errors.push('Addon booster price cannot be negative');
        }
        if ((plan.addonBooster.wordsAdded ?? 0) <= 0) {  // ✅ Add ?? 0
          errors.push('Addon booster words must be positive');
        }
      }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ==========================================
  // DATABASE INTEGRATION (FUTURE)
  // ==========================================

  private tryLoadConfigService(): void {
    try {
      const ConfigServiceModule = require('../../services/config.service');
      if (ConfigServiceModule && ConfigServiceModule.ConfigService) {
        this.configService = ConfigServiceModule.ConfigService.getInstance();
      }
    } catch (error) {
      // ConfigService not available, using static config
    }
  }

  public async loadFromDatabase(): Promise<void> {
    if (!this.configService) {
      throw new Error('ConfigService not available - database integration not yet implemented');
    }
  }

  public async reload(): Promise<void> {
    if (this.configService) {
      try {
        await this.loadFromDatabase();
        this.cache.source = 'DATABASE';
      } catch (error) {
        this.reloadFromStatic();
      }
    } else {
      this.reloadFromStatic();
    }
    this.cache.lastUpdated = new Date();
  }

  private reloadFromStatic(): void {
    this.cache.plans = new Map(Object.entries(PLANS_STATIC_CONFIG) as [PlanType, Plan][]);
    this.cache.source = 'STATIC';
  }

  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================

  public clearCache(): void {
    this.reloadFromStatic();
    this.cache.lastUpdated = new Date();
  }

  public getCacheInfo() {
    return {
      plansCount: this.cache.plans.size,
      lastUpdated: this.cache.lastUpdated,
      source: this.cache.source,
    };
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  public getPlanSummary(planType: PlanType) {
    const plan = this.getPlan(planType);
    if (!plan) return null;

    return {
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      tagline: plan.tagline,
      description: plan.description,
      price: plan.price,
      enabled: plan.enabled,
      popular: plan.popular,
      hero: plan.hero,
      order: plan.order,
      personality: plan.personality,
      monthlyWords: plan.limits.monthlyWords,
      dailyWords: plan.limits.dailyWords,
      botResponseLimit: plan.limits.botResponseLimit,
      studioCredits: plan.limits.studioCredits, // 🎬 NEW
      hasBooster: !!(plan.cooldownBooster || plan.addonBooster),
      hasDocs: plan.features.documentIntelligence,
      hasStudio: plan.features.studio, // 🎬 NEW
      hasFileUpload: plan.features.fileUpload,
      hasPrioritySupport: plan.features.prioritySupport,
    };
  }

  public comparePlans(plan1Type: PlanType, plan2Type: PlanType) {
    const plan1 = this.getPlan(plan1Type);
    const plan2 = this.getPlan(plan2Type);

    if (!plan1 || !plan2) return null;

    return {
      pricing: {
        plan1: plan1.price,
        plan2: plan2.price,
        difference: plan2.price - plan1.price,
        percentageIncrease: plan1.price > 0 ? ((plan2.price - plan1.price) / plan1.price) * 100 : 0,
      },
      words: {
        plan1Monthly: plan1.limits.monthlyWords,
        plan2Monthly: plan2.limits.monthlyWords,
        monthlyDifference: plan2.limits.monthlyWords - plan1.limits.monthlyWords,
        plan1Daily: plan1.limits.dailyWords,
        plan2Daily: plan2.limits.dailyWords,
        dailyDifference: plan2.limits.dailyWords - plan1.limits.dailyWords,
      },
      studioCredits: { // 🎬 NEW
        plan1: plan1.limits.studioCredits ?? 0,
        plan2: plan2.limits.studioCredits ?? 0,
        difference: (plan2.limits.studioCredits ?? 0) - (plan1.limits.studioCredits ?? 0),
      },
      features: {
        plan1Features: Object.keys(plan1.features).filter(
          (k) => plan1.features[k as keyof typeof plan1.features]
        ),
        plan2Features: Object.keys(plan2.features).filter(
          (k) => plan2.features[k as keyof typeof plan2.features]
        ),
      },
      aiModels: {
        plan1Primary: this.getPrimaryAIModel(plan1Type)?.displayName,
        plan2Primary: this.getPrimaryAIModel(plan2Type)?.displayName,
      },
    };
  }

  public getUpgradePath(currentPlanType: PlanType): PlanType[] {
    const planOrder = [PlanType.STARTER, PlanType.PLUS, PlanType.PRO, PlanType.EDGE, PlanType.LIFE];

    const currentIndex = planOrder.indexOf(currentPlanType);
    if (currentIndex === -1) return [];

    return planOrder.slice(currentIndex + 1).filter((planType) => this.isPlanEnabled(planType));
  }

  public getDowngradePath(currentPlanType: PlanType): PlanType[] {
    const planOrder = [PlanType.STARTER, PlanType.PLUS, PlanType.PRO, PlanType.EDGE, PlanType.LIFE];

    const currentIndex = planOrder.indexOf(currentPlanType);
    if (currentIndex === -1 || currentIndex === 0) return [];

    return planOrder
      .slice(0, currentIndex)
      .filter((planType) => this.isPlanEnabled(planType))
      .reverse();
  }

  public getRecommendedPlan(monthlyWordsUsed: number): PlanType | null {
    const enabledPlans = this.getEnabledPlans().sort((a, b) => a.price - b.price);

    for (const plan of enabledPlans) {
      if (plan.limits.monthlyWords >= monthlyWordsUsed) {
        return plan.id;
      }
    }

    return enabledPlans[enabledPlans.length - 1]?.id ?? null;
  }
}

// ==========================================
// EXPORTS & BACKWARD COMPATIBILITY
// ==========================================

export const plansManager = PlansManager.getInstance();

export { PlansManager as PlansManagerClass };

export const PLANS = PLANS_STATIC_CONFIG;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getPlanByType(planType: PlanType): Plan | undefined {
  return plansManager.getPlan(planType);
}

export function getAllPlans(): Plan[] {
  return plansManager.getAllPlans();
}

export function getEnabledPlans(): Plan[] {
  return plansManager.getEnabledPlans();
}

export function getLaunchPlans(): Plan[] {
  return plansManager.getLaunchPlans();
}

export function getHeroPlan(): Plan | undefined {
  return plansManager.getHeroPlan();
}

export function calculateAddonDailyDistribution(
  planType: PlanType,
  purchaseDate: Date,
  cycleEndDate: Date
): number {
  return plansManager.calculateAddonDistribution(planType, purchaseDate, cycleEndDate)
    .perDayDistribution;
}

export function getBotResponseLimit(planType: PlanType): number {
  return plansManager.getBotResponseLimit(planType);
}

export function hasDocumentation(planType: PlanType): boolean {
  return plansManager.hasDocumentation(planType);
}

export function getMonthlyWordLimit(planType: PlanType): number {
  return plansManager.getMonthlyWordLimit(planType);
}

export function getDailyWordLimit(planType: PlanType): number {
  return plansManager.getDailyWordLimit(planType);
}

export function hasCooldownBooster(planType: PlanType): boolean {
  return plansManager.hasCooldownBooster(planType);
}

export function hasAddonBooster(planType: PlanType): boolean {
  return plansManager.hasAddonBooster(planType);
}

export function isValidPlanType(planType: string): planType is PlanType {
  return plansManager.isValidPlanType(planType);
}

export function getNextCooldownPrice(planType: PlanType, currentPurchases: number): number | null {
  return plansManager.getNextCooldownPrice(planType, currentPurchases);
}

export function checkCooldownEligibility(
  planType: PlanType,
  currentPurchases: number,
  resetDate?: Date
) {
  return plansManager.checkCooldownEligibility(planType, currentPurchases, resetDate);
}

export function getCooldownPricingTiers(planType: PlanType) {
  return plansManager.getCooldownPricingTiers(planType);
}

export function getPlanPersonality(planType: PlanType): string | undefined {
  return plansManager.getPlanPersonality(planType);
}

// ==========================================
// 🎬 NEW: STUDIO HELPER FUNCTIONS
// ==========================================

export function hasStudioAccess(planType: PlanType): boolean {
  return plansManager.hasStudioAccess(planType);
}

export function getStudioCredits(planType: PlanType): number {
  return plansManager.getStudioCredits(planType);
}

export function checkStudioCredits(currentCredits: number, requiredCredits: number) {
  return plansManager.checkStudioCredits(currentCredits, requiredCredits);
}

export function canAccessStudioFeature(featureId: string, currentCredits: number) {
  return plansManager.canAccessStudioFeature(featureId, currentCredits);
}

export function getAllStudioBoosters() {
  return plansManager.getAllStudioBoosters();
}

export function getStudioBooster(boosterId: string) {
  return plansManager.getStudioBooster(boosterId);
}

export function canPurchaseStudioBooster(boosterId: string, currentMonthPurchases: number) {
  return plansManager.canPurchaseStudioBooster(boosterId, currentMonthPurchases);
}

export function calculatePreviewCost(totalPreviewsUsed: number, featureId: string) {
  return plansManager.calculatePreviewCost(totalPreviewsUsed, featureId);
}

export function canGeneratePreview(
  currentPreviewCount: number,
  currentCredits: number,
  featureId: string
) {
  return plansManager.canGeneratePreview(currentPreviewCount, currentCredits, featureId);
}

export function convertINRToCredits(rupees: number): number {
  return plansManager.convertINRToCredits(rupees);
}

export function convertCreditsToINR(credits: number): number {
  return plansManager.convertCreditsToINR(credits);
}

export function getFeatureCostINR(featureId: string): number {
  return plansManager.getFeatureCostINR(featureId);
}

export * from '../constants/plans';