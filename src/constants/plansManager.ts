// src/constants/plansManager.ts

/**
 * ==========================================
 * SORIVA PLANS MANAGER - CLASS-BASED SYSTEM
 * ==========================================
 * Future-proof, dynamic, database-ready
 * Created by: Amandeep, Punjab, India
 * Last Updated: February 22, 2026 - v12.0 (2-Model System)
 *
 * ==========================================
 * v12.0 CHANGELOG (February 22, 2026):
 * ==========================================
 * 🚀 MAJOR: SIMPLIFIED TO 2-MODEL SYSTEM
 *
 * ✅ REMOVED MODELS:
 *    - Klein 9B ❌ (replaced by GPT LOW)
 *    - Nano Banana ❌
 *    - Flux Kontext ❌
 *
 * ✅ FINAL 2-MODEL SYSTEM:
 *    - Schnell (Fal.ai): ₹0.25/image - General images (scenery, nature, animals)
 *    - GPT LOW (OpenAI gpt-image-1.5): ₹1.18/image - Text, Ads, Festivals, Transforms
 *
 * ✅ UPDATED METHODS:
 *    - getKlein9bImages() → getGptLowImages()
 *    - getNanoBananaImages() → REMOVED
 *    - getFluxKontextImages() → REMOVED
 *    - IMAGE_COSTS.klein9b → IMAGE_COSTS.gptLow
 *
 * ==========================================
 * v10.3 CHANGELOG (January 19, 2026): [SUPERSEDED]
 * ==========================================
 * - Dual model system with Klein 9B + Schnell
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
  DocAIBooster,
  IMAGE_COSTS,
  PLANS_STATIC_CONFIG,
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
// 🖼️ IMAGE INTERFACES (v12.0 - Schnell + GPT LOW)
// ==========================================

interface ImageAvailabilityCheck {
  hasEnough: boolean;
  imageType: 'schnell' | 'gptLow';
  currentImages: number;
  requiredImages: number;
  shortfall: number;
}

/**
 * v12.0: Simplified to 2-model system
 */
interface ImageLimitsResult {
  schnellImages: number;
  gptLowImages: number;
  totalImages: number;
  talkingPhotos: number;
  logoPreview: number;
  logoPurchase: number;
  hasAccess: boolean;
}

// ==========================================
// 📄 DOC AI INTERFACES
// ==========================================

interface DocAILimitsResult {
  tokens: number;
  tokensTrial: number;
  hasAccess: boolean;
  tier: string;
  maxFileSizeMB: number;
  maxWorkspaces: number;
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

  /**
   * Try to load config service for dynamic config
   */
  private tryLoadConfigService(): void {
    try {
      // Dynamic import to avoid circular dependencies
      // this.configService = require('../services/ai/config.service').configService;
    } catch {
      // Config service not available, using static config
    }
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
   * Get plans for launch (Phase 1: STARTER, LITE, PLUS, PRO)
   */
  public getLaunchPlans(): Plan[] {
    const launchPlanTypes: PlanType[] = [PlanType.STARTER, PlanType.LITE, PlanType.PLUS, PlanType.PRO];
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
   * Check if plan has Doc AI access
   */
  public hasDocAIAccess(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return !!plan?.documentation?.enabled && (plan?.documentation?.docAITokens ?? 0) > 0;
  }

  /**
   * Check if plan has Doc AI Booster
   */
  public hasDocAIBooster(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    return !!plan?.docAIBooster;
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
  // 🖼️ IMAGE ACCESS CHECKS (v12.0 - 2 Model System)
  // ==========================================

  /**
   * Check if plan has image generation access
   */
  public hasImageAccess(planType: PlanType): boolean {
    const plan = this.getPlan(planType);
    if (!plan?.limits.images) return false;
    return plan.limits.images.totalImages > 0;
  }

  /**
   * Get image limits for plan (v12.0 - Schnell + GPT LOW)
   */
  public getImageLimits(planType: PlanType, isInternational: boolean = false): ImageLimitsResult {
    const plan = this.getPlan(planType);
    
    if (!plan) {
      return {
        schnellImages: 0,
        gptLowImages: 0,
        totalImages: 0,
        talkingPhotos: 0,
        logoPreview: 0,
        logoPurchase: 0,
        hasAccess: false,
      };
    }

    const limits = isInternational && plan.limitsInternational 
      ? plan.limitsInternational 
      : plan.limits;

    const images = limits.images || { 
      schnellImages: 0,
      gptLowImages: 0,
      totalImages: 0,
      talkingPhotos: 0,
      logoPreview: 0,
      logoPurchase: 0,
    };

    return {
      schnellImages: images.schnellImages || 0,
      gptLowImages: images.gptLowImages || 0,
      totalImages: images.totalImages,
      talkingPhotos: images.talkingPhotos || 0,
      logoPreview: images.logoPreview || 0,
      logoPurchase: images.logoPurchase || 0,
      hasAccess: images.totalImages > 0,
    };
  }

  /**
   * Get GPT LOW images for plan (text/ads/festivals/transforms)
   * v12.0: Replaces getKlein9bImages()
   */
  public getGptLowImages(planType: PlanType, isInternational: boolean = false): number {
    return this.getImageLimits(planType, isInternational).gptLowImages;
  }

  /**
   * Get Schnell images for plan (general images - nature/animals/scenery)
   */
  public getSchnellImages(planType: PlanType, isInternational: boolean = false): number {
    return this.getImageLimits(planType, isInternational).schnellImages;
  }

  /**
   * @deprecated Klein 9B removed in v12.0 - use getGptLowImages() instead
   */
  public getKlein9bImages(planType: PlanType, isInternational: boolean = false): number {
    console.warn('getKlein9bImages() is deprecated. Use getGptLowImages() instead.');
    return this.getGptLowImages(planType, isInternational);
  }

  /**
   * @deprecated Nano Banana removed in v12.0 - returns 0
   */
  public getNanoBananaImages(planType: PlanType, isInternational: boolean = false): number {
    console.warn('getNanoBananaImages() is deprecated. Model removed in v12.0.');
    return 0;
  }

  /**
   * @deprecated Flux Kontext removed in v12.0 - returns 0
   */
  public getFluxKontextImages(planType: PlanType, isInternational: boolean = false): number {
    console.warn('getFluxKontextImages() is deprecated. Model removed in v12.0.');
    return 0;
  }

  /**
   * @deprecated Fast model removed in v10.2 - returns 0
   */
  public getFastImages(planType: PlanType, isInternational: boolean = false): number {
    return 0;
  }

  /**
   * Get total images for plan
   */
  public getTotalImages(planType: PlanType, isInternational: boolean = false): number {
    return this.getImageLimits(planType, isInternational).totalImages;
  }

  /**
   * Get talking photos limit for plan
   */
  public getTalkingPhotos(planType: PlanType, isInternational: boolean = false): number {
    return this.getImageLimits(planType, isInternational).talkingPhotos;
  }

  /**
   * Get logo preview limit for plan
   */
  public getLogoPreview(planType: PlanType, isInternational: boolean = false): number {
    return this.getImageLimits(planType, isInternational).logoPreview;
  }

  /**
   * Get logo purchase limit for plan
   */
  public getLogoPurchase(planType: PlanType, isInternational: boolean = false): number {
    return this.getImageLimits(planType, isInternational).logoPurchase;
  }

  /**
   * Check if user has enough images (v12.0)
   */
  public checkImageAvailability(
    imageType: 'schnell' | 'gptLow',
    currentImages: number,
    requiredImages: number = 1
  ): ImageAvailabilityCheck {
    const hasEnough = currentImages >= requiredImages;
    const shortfall = hasEnough ? 0 : requiredImages - currentImages;

    return {
      hasEnough,
      imageType,
      currentImages,
      requiredImages,
      shortfall,
    };
  }

  /**
   * Get image cost in INR (v12.0)
   */
  public getImageCost(imageType: 'schnell' | 'gptLow' = 'gptLow'): number {
    if (imageType === 'schnell') {
      return IMAGE_COSTS.schnell.costPerImage;
    }
    return IMAGE_COSTS.gptLow.costPerImagePortrait; // ₹1.18
  }

  /**
   * Calculate total image cost for plan (v12.0)
   */
  public calculateImageCost(planType: PlanType, isInternational: boolean = false): number {
    const limits = this.getImageLimits(planType, isInternational);
    const gptLowCost = limits.gptLowImages * IMAGE_COSTS.gptLow.costPerImagePortrait;
    const schnellCost = limits.schnellImages * IMAGE_COSTS.schnell.costPerImage;
    return Math.round((gptLowCost + schnellCost) * 100) / 100;
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
   * Get Doc AI Booster
   */
  public getDocAIBooster(planType: PlanType): DocAIBooster | undefined {
    const plan = this.getPlan(planType);
    return plan?.docAIBooster;
  }

  // ==========================================
  // 📄 DOC AI TOKEN METHODS
  // ==========================================

  /**
   * Get Doc AI tokens for plan
   */
  public getDocAITokens(planType: PlanType, isInternational: boolean = false, isTrial: boolean = false): number {
    const plan = this.getPlan(planType);
    const doc = plan?.documentation;
    
    if (!doc?.enabled) return 0;

    if (isTrial) {
      return isInternational 
        ? (doc.docAITokensTrialInternational ?? doc.docAITokensTrial ?? 0)
        : (doc.docAITokensTrial ?? 0);
    }

    return isInternational 
      ? (doc.docAITokensInternational ?? doc.docAITokens ?? 0)
      : (doc.docAITokens ?? 0);
  }

  /**
   * Get Doc AI limits for plan
   */
  public getDocAILimits(planType: PlanType, isInternational: boolean = false, isTrial: boolean = false): DocAILimitsResult {
    const plan = this.getPlan(planType);
    const doc = plan?.documentation;

    if (!doc?.enabled) {
      return {
        tokens: 0,
        tokensTrial: 0,
        hasAccess: false,
        tier: 'none',
        maxFileSizeMB: 0,
        maxWorkspaces: 0,
      };
    }

    const tokens = this.getDocAITokens(planType, isInternational, isTrial);

    return {
      tokens,
      tokensTrial: this.getDocAITokens(planType, isInternational, true),
      hasAccess: tokens > 0,
      tier: doc.tier || 'none',
      maxFileSizeMB: doc.maxFileSizeMB ?? 0,
      maxWorkspaces: doc.maxWorkspaces ?? 0,
    };
  }

  /**
   * Get Doc AI Booster tokens
   */
  public getDocAIBoosterTokens(planType: PlanType, isInternational: boolean = false): number {
    const booster = this.getDocAIBooster(planType);
    if (!booster) return 0;
    
    return isInternational 
      ? (booster.tokensInternational ?? booster.tokens ?? 0)
      : (booster.tokens ?? 0);
  }

  /**
   * Get Doc AI Booster price
   */
  public getDocAIBoosterPrice(planType: PlanType, isInternational: boolean = false): number {
    const booster = this.getDocAIBooster(planType);
    if (!booster) return 0;
    
    return isInternational 
      ? (booster.priceUSD ?? booster.price ?? 0)
      : (booster.price ?? 0);
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
    if (!addon || typeof addon.totalTokens !== 'number') {
      return 0;
    }
    // Convert tokens to words (approx 1.5 tokens per word)
    return Math.floor(addon.totalTokens / 1.5);
  }

  /**
   * Get addon tokens directly
   */
  public getAddonTokens(planType: PlanType, isInternational: boolean = false): number {
    const addon = this.getAddonBooster(planType);
    if (!addon) return 0;
    
    if (isInternational && addon.totalTokensInternational) {
      return addon.totalTokensInternational;
    }
    return addon.totalTokens || 0;
  }

  /**
   * Get addon booster images (v12.0 - GPT LOW)
   */
  public getAddonImages(planType: PlanType, isInternational: boolean = false): { schnell: number; gptLow: number } {
    const addon = this.getAddonBooster(planType);
    if (!addon) {
      return { schnell: 0, gptLow: 0 };
    }

    if (isInternational) {
      return {
        schnell: addon.schnellImagesInternational || addon.schnellImages || 0,
        gptLow: addon.gptLowImagesInternational || addon.gptLowImages || 0,
      };
    }

    return {
      schnell: addon.schnellImages || 0,
      gptLow: addon.gptLowImages || 0,
    };
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

    const totalTokens = addon.totalTokens ?? 0;
    const totalWords = Math.floor(totalTokens / 1.5); // Convert tokens to words
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
   * Validate plan configuration (v12.0 - updated for 2-model system)
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

    if (plan.price < 0) {
      errors.push('Plan price cannot be negative');
    }

    // Validate limits
    if (!plan.limits) {
      errors.push('Plan limits are required');
    } else {
      if (plan.limits.monthlyWords < 0) {
        errors.push('Monthly words cannot be negative');
      }
      if (plan.limits.dailyWords < 0) {
        errors.push('Daily words cannot be negative');
      }
    }

    // Validate images (v12.0)
    if (plan.limits?.images) {
      if (plan.limits.images.schnellImages < 0) {
        errors.push('Schnell images cannot be negative');
      }
      if (plan.limits.images.gptLowImages < 0) {
        errors.push('GPT LOW images cannot be negative');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ==========================================
  // PRICING METHODS
  // ==========================================

  public getPrice(planType: PlanType, isInternational: boolean = false): number {
    const plan = this.getPlan(planType);
    if (!plan) return 0;

    if (isInternational && plan.priceUSD !== undefined) {
      return plan.priceUSD;
    }
    return plan.price;
  }

  public getCurrency(isInternational: boolean = false): string {
    return isInternational ? 'USD' : 'INR';
  }

  public getCurrencySymbol(isInternational: boolean = false): string {
    return isInternational ? '$' : '₹';
  }

  public getFormattedPrice(planType: PlanType, isInternational: boolean = false): string {
    const price = this.getPrice(planType, isInternational);
    const symbol = this.getCurrencySymbol(isInternational);
    return `${symbol}${price}`;
  }

  // ==========================================
  // COMPARISON METHODS (v12.0 - Updated for 2-model)
  // ==========================================

  public comparePlans(plan1Type: PlanType, plan2Type: PlanType) {
    const plan1 = this.getPlan(plan1Type);
    const plan2 = this.getPlan(plan2Type);

    if (!plan1 || !plan2) {
      return null;
    }

    const images1 = this.getImageLimits(plan1Type);
    const images2 = this.getImageLimits(plan2Type);

    return {
      pricing: {
        plan1Price: plan1.price,
        plan2Price: plan2.price,
        difference: plan2.price - plan1.price,
        percentIncrease:
          plan1.price > 0 ? Math.round(((plan2.price - plan1.price) / plan1.price) * 100) : 0,
      },
      words: {
        plan1Monthly: plan1.limits.monthlyWords,
        plan2Monthly: plan2.limits.monthlyWords,
        monthlyDifference: plan2.limits.monthlyWords - plan1.limits.monthlyWords,
        plan1Daily: plan1.limits.dailyWords,
        plan2Daily: plan2.limits.dailyWords,
        dailyDifference: plan2.limits.dailyWords - plan1.limits.dailyWords,
      },
      // 🖼️ Images comparison (v12.0 - Schnell + GPT LOW)
      images: {
        plan1GptLow: images1.gptLowImages,
        plan2GptLow: images2.gptLowImages,
        gptLowDifference: images2.gptLowImages - images1.gptLowImages,
        plan1Schnell: images1.schnellImages,
        plan2Schnell: images2.schnellImages,
        schnellDifference: images2.schnellImages - images1.schnellImages,
        plan1Total: images1.totalImages,
        plan2Total: images2.totalImages,
        totalDifference: images2.totalImages - images1.totalImages,
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
    const planOrder = [PlanType.STARTER, PlanType.LITE, PlanType.PLUS, PlanType.PRO, PlanType.APEX, PlanType.SOVEREIGN];

    const currentIndex = planOrder.indexOf(currentPlanType);
    if (currentIndex === -1) return [];

    return planOrder.slice(currentIndex + 1).filter((planType) => this.isPlanEnabled(planType));
  }

  public getDowngradePath(currentPlanType: PlanType): PlanType[] {
    const planOrder = [PlanType.STARTER, PlanType.LITE, PlanType.PLUS, PlanType.PRO, PlanType.APEX, PlanType.SOVEREIGN];

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
// 🖼️ IMAGE HELPER FUNCTIONS (v12.0 - Schnell + GPT LOW)
// ==========================================

export function hasImageAccess(planType: PlanType): boolean {
  return plansManager.hasImageAccess(planType);
}

export function getImageLimits(planType: PlanType, isInternational: boolean = false) {
  return plansManager.getImageLimits(planType, isInternational);
}

/**
 * Get GPT LOW images (text/ads/festivals/transforms)
 */
export function getGptLowImages(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.getGptLowImages(planType, isInternational);
}

/**
 * Get Schnell images (general images - nature/animals/scenery)
 */
export function getSchnellImages(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.getSchnellImages(planType, isInternational);
}

/**
 * @deprecated Klein 9B removed in v12.0 - use getGptLowImages() instead
 */
export function getKlein9bImages(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.getKlein9bImages(planType, isInternational);
}

/**
 * @deprecated Fast model removed in v10.2 - returns 0
 */
export function getFastImages(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.getFastImages(planType, isInternational);
}

export function getTotalImages(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.getTotalImages(planType, isInternational);
}

export function checkImageAvailability(
  imageType: 'schnell' | 'gptLow',
  currentImages: number,
  requiredImages: number = 1
) {
  return plansManager.checkImageAvailability(imageType, currentImages, requiredImages);
}

export function getImageCost(imageType: 'schnell' | 'gptLow' = 'gptLow'): number {
  return plansManager.getImageCost(imageType);
}

export function calculateImageCost(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.calculateImageCost(planType, isInternational);
}

export function getAddonImages(planType: PlanType, isInternational: boolean = false) {
  return plansManager.getAddonImages(planType, isInternational);
}

export function getTalkingPhotos(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.getImageLimits(planType, isInternational).talkingPhotos;
}

export function getLogoPreview(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.getImageLimits(planType, isInternational).logoPreview;
}

export function getLogoPurchase(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.getImageLimits(planType, isInternational).logoPurchase;
}

// ==========================================
// 📄 DOC AI HELPER FUNCTIONS
// ==========================================

export function hasDocAIAccess(planType: PlanType): boolean {
  return plansManager.hasDocAIAccess(planType);
}

export function hasDocAIBooster(planType: PlanType): boolean {
  return plansManager.hasDocAIBooster(planType);
}

export function getDocAITokens(planType: PlanType, isInternational: boolean = false, isTrial: boolean = false): number {
  return plansManager.getDocAITokens(planType, isInternational, isTrial);
}

export function getDocAILimits(planType: PlanType, isInternational: boolean = false, isTrial: boolean = false) {
  return plansManager.getDocAILimits(planType, isInternational, isTrial);
}

export function getDocAIBooster(planType: PlanType) {
  return plansManager.getDocAIBooster(planType);
}

export function getDocAIBoosterTokens(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.getDocAIBoosterTokens(planType, isInternational);
}

export function getDocAIBoosterPrice(planType: PlanType, isInternational: boolean = false): number {
  return plansManager.getDocAIBoosterPrice(planType, isInternational);
}

// ==========================================
// RE-EXPORT PLANS TYPES
// ==========================================

export * from '../constants/plans';