// src/services/plans/plans.service.ts

import {
  PLANS_STATIC_CONFIG,
  STUDIO_BOOSTERS,
  PlanType,
  Region,
  Currency,
  Plan,
  StudioBooster,
  getPlanPricing,
  getStudioBoosterPricing,
  formatPrice,
  getPaymentGateway,
} from '@constants/plans';

/**
 * ==========================================
 * PLANS SERVICE - REGIONAL PRICING LOGIC
 * ==========================================
 * Handles plan data retrieval with region-based pricing
 * Last Updated: November 12, 2025
 */

export class PlansService {
  /**
   * Get all enabled plans with regional pricing
   */
  static getPlans(region: Region = Region.INDIA) {
   
    
    const enabledPlans = Object.values(PLANS_STATIC_CONFIG).filter(
      (plan) => plan.enabled
    );

    return enabledPlans.map((plan) => {
      const pricing = getPlanPricing(plan.id, region);
      
    
      return {
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        tagline: plan.tagline,
        description: plan.description,
        
        // Regional pricing
        price: pricing.price,
        currency: pricing.currency,
        priceFormatted: formatPrice(pricing.price, pricing.currency),
        
        // Plan metadata
        popular: plan.popular || false,
        hero: plan.hero || false,
        order: plan.order,
        personality: plan.personality,
        
        // Regional limits
        limits: pricing.limits,
        
        // Features
        features: plan.features,
        
        // AI Models
        aiModels: plan.aiModels.map((model) => ({
          provider: model.provider,
          displayName: model.displayName,
        })),
        
        // Documentation (if enabled)
        documentation: plan.documentation
          ? {
              enabled: plan.documentation.enabled,
              tier: plan.documentation.tier,
              displayName: plan.documentation.displayName,
              badge: plan.documentation.badge,
              tagline: plan.documentation.tagline,
            }
          : undefined,
        
        // Payment gateway
        paymentGateway: getPaymentGateway(region),
      };
    });
  }

  /**
   * Get single plan by type with regional pricing
   */
  static getPlan(planType: PlanType, region: Region = Region.INDIA) {
    const plan = PLANS_STATIC_CONFIG[planType];
    
    if (!plan) {
      throw new Error(`Plan not found: ${planType}`);
    }

    if (!plan.enabled) {
      throw new Error(`Plan not available: ${planType}`);
    }

    const pricing = getPlanPricing(planType, region);

    return {
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      tagline: plan.tagline,
      description: plan.description,
      
      // Regional pricing
      price: pricing.price,
      currency: pricing.currency,
      priceFormatted: formatPrice(pricing.price, pricing.currency),
      
      // Complete plan details
      popular: plan.popular || false,
      hero: plan.hero || false,
      personality: plan.personality,
      limits: pricing.limits,
      features: plan.features,
      aiModels: plan.aiModels,
      documentation: plan.documentation,
      cooldownBooster: plan.cooldownBooster,
      addonBooster: plan.addonBooster,
      
      // Payment
      paymentGateway: getPaymentGateway(region),
      paymentGatewayIds: plan.paymentGateway,
    };
  }

  /**
   * Get all studio boosters with regional pricing
   */
  static getStudioBoosters(region: Region = Region.INDIA) {
    return Object.values(STUDIO_BOOSTERS).map((booster) => {
      const pricing = getStudioBoosterPricing(booster.name.toUpperCase(), region);

      return {
        id: booster.id,
        name: booster.name,
        displayName: booster.displayName,
        tagline: booster.tagline,
        
        // Regional pricing
        price: pricing.price,
        currency: pricing.currency,
        priceFormatted: formatPrice(pricing.price, pricing.currency),
        
        // Credits (regional)
        credits: pricing.credits,
        
        // Metadata
        validity: booster.validity,
        maxPerMonth: booster.maxPerMonth,
        popular: booster.popular || false,
        
        // Payment
        paymentGateway: getPaymentGateway(region),
      };
    });
  }

  /**
   * Get single studio booster with regional pricing
   */
  static getStudioBooster(boosterId: string, region: Region = Region.INDIA) {
    const booster = Object.values(STUDIO_BOOSTERS).find(
      (b) => b.id === boosterId
    );

    if (!booster) {
      throw new Error(`Studio booster not found: ${boosterId}`);
    }

    const pricing = getStudioBoosterPricing(booster.name.toUpperCase(), region);

    return {
      id: booster.id,
      name: booster.name,
      displayName: booster.displayName,
      tagline: booster.tagline,
      price: pricing.price,
      currency: pricing.currency,
      priceFormatted: formatPrice(pricing.price, pricing.currency),
      credits: pricing.credits,
      validity: booster.validity,
      maxPerMonth: booster.maxPerMonth,
      popular: booster.popular || false,
      paymentGateway: getPaymentGateway(region),
      paymentGatewayIds: booster.paymentGateway,
    };
  }
  
  /**
   * Get plan comparison data (for pricing page)
   */
  static getPlanComparison(region: Region = Region.INDIA) {
    const plans = this.getPlans(region);

    return plans.map((plan) => ({
      id: plan.id,
      displayName: plan.displayName,
      price: plan.price,
      priceFormatted: plan.priceFormatted,
      currency: plan.currency,
      popular: plan.popular,
      features: {
        monthlyWords: plan.limits.monthlyWords,
        dailyWords: plan.limits.dailyWords,
        memoryDays: plan.limits.memoryDays,
        studioImages: plan.limits.studio.images,
        studioTalkingPhotos: plan.limits.studio.talkingPhotos,
        documentIntelligence: plan.features.documentIntelligence,
        fileUpload: plan.features.fileUpload,
        prioritySupport: plan.features.prioritySupport,
      },
    }));
  }
}
