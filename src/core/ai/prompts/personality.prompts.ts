// src/core/ai/prompts/personality.prompts.ts
/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA PERSONALITY PROMPTS — PLAN LIMITS ONLY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Optimized: December 6, 2025
 * Change: Removed personality (handled by personality.engine.ts)
 * Now: Only plan limits + memory days + word targets
 * Tokens: ~100 → ~20 (80% reduction!)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN LIMITS CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PlanLimits {
  memoryDays: number;
  targetWords: string;
  responseStyle: string;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    memoryDays: 5,
    targetWords: '50-100',
    responseStyle: 'concise',
  },
  plus: {
    memoryDays: 15,
    targetWords: '100-200',
    responseStyle: 'balanced',
  },
  pro: {
    memoryDays: 30,
    targetWords: '150-300',
    responseStyle: 'detailed',
  },
  edge: {
    memoryDays: 35,
    targetWords: '200-400',
    responseStyle: 'comprehensive',
  },
  apex: {
    memoryDays: 35,
    targetWords: '200-500',
    responseStyle: 'comprehensive',
  },
  life: {
    memoryDays: 35,
    targetWords: '200-500',
    responseStyle: 'personalized',
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERSONALITY PROMPTS MANAGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PersonalityPromptsManager {
  
  /**
   * Get plan limits (memory, words, style)
   */
  getPlanLimits(planName: string): PlanLimits {
    const plan = planName.toLowerCase();
    return PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
  }

  /**
   * Build MINIMAL plan context (just limits, no personality!)
   * Personality is now handled by personality.engine.ts
   */
  buildSystemPrompt(options: {
    planName: string;
    language?: string;
    userName?: string;
    userCityTier?: 'T1' | 'T2' | 'T3';
    userLevel?: string;
    creatorName?: string;
    customInstructions?: string;
  }): string {
    const limits = this.getPlanLimits(options.planName);
    
    // ✅ ULTRA MINIMAL: Just plan limits (~15-20 tokens)
    let prompt = `LIMITS: ${limits.targetWords} words. Memory: ${limits.memoryDays}d. Style: ${limits.responseStyle}.`;
    
    // Add custom instructions if provided
    if (options.customInstructions) {
      prompt += ` CUSTOM: ${options.customInstructions}`;
    }
    
    return prompt;
  }

  /**
   * Get memory days for a plan
   */
  getMemoryDays(planName: string): number {
    return this.getPlanLimits(planName).memoryDays;
  }

  /**
   * Get target word range
   */
  getTargetWords(planName: string): string {
    return this.getPlanLimits(planName).targetWords;
  }
}

export default new PersonalityPromptsManager();