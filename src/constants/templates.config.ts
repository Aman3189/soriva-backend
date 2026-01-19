// src/constants/templates.config.ts

/**
 * ==========================================
 * SORIVA TEMPLATES CONFIGURATION
 * ==========================================
 * Pre-configured conversation modes for quick start
 * Plan-based access control
 * Dynamic welcome messages via Personality Engine
 * 
 * ARCHITECTURE: Class-Based (Matching plansManager.ts)
 * 
 * Created by: Amandeep, Punjab, India
 * Last Updated: December 2025
 */

import { PlanType } from './plans';

// ==========================================
// ENUMS
// ==========================================

export enum TemplateId {
  RECIPE_HELPER = 'recipe-helper',
  TRAVEL_PLANNER = 'travel-planner',
  CONCEPT_EXPLAINER = 'concept-explainer',
  ROAST_MODE = 'roast-mode',
  ASTRO_ZODIAC = 'astro-zodiac',
  MATH_SOLVER = 'math-solver',
  MEME_EXPLAINER = 'meme-explainer',
  SHAYARI_MODE = 'shayari-mode',
  INTERVIEW_READY = 'interview-ready',
}

export enum TemplateCategory {
  FUN = 'fun',
  LEARNING = 'learning',
  DAILY_USE = 'daily-use',
}

// ==========================================
// INTERFACES
// ==========================================

export interface Template {
  /** Unique template identifier */
  id: TemplateId;
  
  /** Display name for UI */
  name: string;
  
  /** Emoji icon */
  icon: string;
  
  /** Short description */
  description: string;
  
  /** Template category */
  category: TemplateCategory;
  
  /** Minimum plan required to access */
  minPlan: PlanType;
  
  /** Best LLM for this template (for reference) */
  bestLLM: string;
  
  /** Max tokens for welcome message */
  maxWelcomeTokens: number;
  
  /** Prompt hint for Personality Engine to generate dynamic welcome */
  promptHint: string;
  
  /** Whether template is enabled */
  enabled: boolean;
  
  /** Display order */
  order: number;
}

interface TemplatesCache {
  templates: Map<TemplateId, Template>;
  planAccess: Map<PlanType, TemplateId[]>;
  lastUpdated: Date;
  source: 'STATIC' | 'DATABASE';
}

// ==========================================
// STATIC TEMPLATES DATA
// ==========================================

const TEMPLATES_STATIC_CONFIG: Record<TemplateId, Template> = {
  
  // ──────────────────────────────────────
  // PLUS+ TEMPLATES (4)
  // ──────────────────────────────────────
  
  [TemplateId.RECIPE_HELPER]: {
    id: TemplateId.RECIPE_HELPER,
    name: 'Recipe Helper',
    icon: '🍳',
    description: 'Get cooking recipes and tips',
    category: TemplateCategory.DAILY_USE,
    minPlan: PlanType.STARTER,
    bestLLM: 'any',
    maxWelcomeTokens: 100,
    promptHint: `Generate a warm, friendly welcome for Recipe Helper mode in Hinglish. 
      Ask what they want to cook today. 
      Mention you can help with ingredients, steps, and tips.
      Keep it fun and appetizing! ~100 tokens max.`,
    enabled: true,
    order: 1,
  },

  [TemplateId.TRAVEL_PLANNER]: {
    id: TemplateId.TRAVEL_PLANNER,
    name: 'Travel Planner',
    icon: '✈️',
    description: 'Plan your trips and itineraries',
    category: TemplateCategory.DAILY_USE,
    minPlan: PlanType.PLUS,
    bestLLM: 'any',
    maxWelcomeTokens: 100,
    promptHint: `Generate an exciting welcome for Travel Planner mode in Hinglish.
      Ask where they want to go - domestic or international.
      Mention you can help with itinerary, budget, places, food spots.
      Make them feel the wanderlust! ~100 tokens max.`,
    enabled: true,
    order: 2,
  },

  [TemplateId.CONCEPT_EXPLAINER]: {
    id: TemplateId.CONCEPT_EXPLAINER,
    name: 'Concept Explainer',
    icon: '🧠',
    description: 'Understand any concept simply',
    category: TemplateCategory.LEARNING,
    minPlan: PlanType.STARTER,
    bestLLM: 'kimi-k2',
    maxWelcomeTokens: 100,
    promptHint: `Generate a friendly, teacher-like welcome for Concept Explainer mode in Hinglish.
      Ask what topic or concept they want to understand.
      Mention you'll explain like a friend - simple, clear, with examples.
      Make learning feel easy! ~100 tokens max.`,
    enabled: true,
    order: 3,
  },

  [TemplateId.ROAST_MODE]: {
    id: TemplateId.ROAST_MODE,
    name: 'Roast Mode',
    icon: '🔥',
    description: 'Fun roasts for friends',
    category: TemplateCategory.FUN,
    minPlan: PlanType.PLUS,
    bestLLM: 'gpt', // GPT on PRO+, Kimi on PLUS
    maxWelcomeTokens: 100,
    promptHint: `Generate a spicy, fun welcome for Roast Mode in Hinglish.
      Ask who they want to roast - friend, colleague, or themselves.
      Warn them playfully that mirchi lagegi!
      Keep it fun, pyaar wala roast. ~100 tokens max.`,
    enabled: true,
    order: 4,
  },

  // ──────────────────────────────────────
  // PRO+ TEMPLATES (5 more = 9 total)
  // ──────────────────────────────────────

  [TemplateId.ASTRO_ZODIAC]: {
    id: TemplateId.ASTRO_ZODIAC,
    name: 'Astro/Zodiac',
    icon: '🌟',
    description: 'Fun zodiac insights and predictions',
    category: TemplateCategory.FUN,
    minPlan: PlanType.PRO,
    bestLLM: 'gemini-pro',
    maxWelcomeTokens: 100,
    promptHint: `Generate a mystical, fun welcome for Astro/Zodiac mode in Hinglish.
      Ask their zodiac sign or birth date.
      Mention you can share personality traits, compatibility, daily vibes.
      Make it magical and intriguing! ~100 tokens max.`,
    enabled: true,
    order: 5,
  },

  [TemplateId.MATH_SOLVER]: {
    id: TemplateId.MATH_SOLVER,
    name: 'Math Solver',
    icon: '🔢',
    description: 'Step-by-step math solutions',
    category: TemplateCategory.LEARNING,
    minPlan: PlanType.PRO,
    bestLLM: 'gemini-pro',
    maxWelcomeTokens: 100,
    promptHint: `Generate a confident, helpful welcome for Math Solver mode in Hinglish.
      Ask them to share their math problem.
      Mention you'll solve step-by-step with explanations.
      Make math feel less scary! ~100 tokens max.`,
    enabled: true,
    order: 6,
  },

  [TemplateId.MEME_EXPLAINER]: {
    id: TemplateId.MEME_EXPLAINER,
    name: 'Meme Explainer',
    icon: '😂',
    description: 'Understand memes and trends',
    category: TemplateCategory.FUN,
    minPlan: PlanType.PRO,
    bestLLM: 'gpt',
    maxWelcomeTokens: 100,
    promptHint: `Generate a fun, Gen-Z style welcome for Meme Explainer mode in Hinglish.
      Ask them to share a meme or describe it.
      Mention you know all the trends, references, and inside jokes.
      Keep it playful and relatable! ~100 tokens max.`,
    enabled: true,
    order: 7,
  },

  [TemplateId.SHAYARI_MODE]: {
    id: TemplateId.SHAYARI_MODE,
    name: 'Shayari Mode',
    icon: '✨',
    description: 'Beautiful shayari and poetry',
    category: TemplateCategory.FUN,
    minPlan: PlanType.PRO,
    bestLLM: 'gpt',
    maxWelcomeTokens: 100,
    promptHint: `Generate a poetic, romantic welcome for Shayari Mode in Hinglish/Urdu.
      Ask what mood - ishq, dard, dosti, zindagi, motivation.
      Mention you can write original shayari on any topic.
      Start with a small shayari teaser! ~100 tokens max.`,
    enabled: true,
    order: 8,
  },

  [TemplateId.INTERVIEW_READY]: {
    id: TemplateId.INTERVIEW_READY,
    name: 'Interview Ready',
    icon: '🎯',
    description: 'Ace your job interviews',
    category: TemplateCategory.LEARNING,
    minPlan: PlanType.PRO,
    bestLLM: 'gpt',
    maxWelcomeTokens: 100,
    promptHint: `Generate a confident, motivating welcome for Interview Ready mode in Hinglish.
      Ask what role/company they're preparing for.
      Mention mock interviews, common questions, tips, confidence building.
      Make them feel interview-ready! ~100 tokens max.`,
    enabled: true,
    order: 9,
  },
};

// ==========================================
// PLAN-WISE TEMPLATE ACCESS (STATIC)
// ==========================================
const PLAN_TEMPLATE_ACCESS_STATIC: Record<PlanType, TemplateId[]> = {
  [PlanType.STARTER]: [
    TemplateId.RECIPE_HELPER,
    TemplateId.CONCEPT_EXPLAINER,
  ],
  // ✅ LITE - Same access as STARTER (basic templates only)
  [PlanType.LITE]: [
    TemplateId.RECIPE_HELPER,
    TemplateId.CONCEPT_EXPLAINER,
  ],
  [PlanType.PLUS]: [
    TemplateId.RECIPE_HELPER,
    TemplateId.TRAVEL_PLANNER,
    TemplateId.CONCEPT_EXPLAINER,
    TemplateId.ROAST_MODE,
  ],
  [PlanType.PRO]: [
    TemplateId.RECIPE_HELPER,
    TemplateId.TRAVEL_PLANNER,
    TemplateId.CONCEPT_EXPLAINER,
    TemplateId.ROAST_MODE,
    TemplateId.ASTRO_ZODIAC,
    TemplateId.MATH_SOLVER,
    TemplateId.MEME_EXPLAINER,
    TemplateId.SHAYARI_MODE,
    TemplateId.INTERVIEW_READY,
  ],
  [PlanType.APEX]: [
    TemplateId.RECIPE_HELPER,
    TemplateId.TRAVEL_PLANNER,
    TemplateId.CONCEPT_EXPLAINER,
    TemplateId.ROAST_MODE,
    TemplateId.ASTRO_ZODIAC,
    TemplateId.MATH_SOLVER,
    TemplateId.MEME_EXPLAINER,
    TemplateId.SHAYARI_MODE,
    TemplateId.INTERVIEW_READY,
  ],
  // 👑 SOVEREIGN - All templates
  [PlanType.SOVEREIGN]: Object.values(TemplateId),
};

// ==========================================
// TEMPLATES MANAGER CLASS
// ==========================================

export class TemplatesManager {
  private static instance: TemplatesManager;
  private cache: TemplatesCache;

  private constructor() {
    this.cache = {
      templates: new Map(
        Object.entries(TEMPLATES_STATIC_CONFIG) as [TemplateId, Template][]
      ),
      planAccess: new Map(
        Object.entries(PLAN_TEMPLATE_ACCESS_STATIC) as [PlanType, TemplateId[]][]
      ),
      lastUpdated: new Date(),
      source: 'STATIC',
    };
  }

  // ==========================================
  // SINGLETON PATTERN
  // ==========================================

  /**
   * Get singleton instance
   */
  public static getInstance(): TemplatesManager {
    if (!TemplatesManager.instance) {
      TemplatesManager.instance = new TemplatesManager();
    }
    return TemplatesManager.instance;
  }

  /**
   * Reset instance (useful for testing)
   */
  public static resetInstance(): void {
    TemplatesManager.instance = null as any;
  }

  // ==========================================
  // CORE TEMPLATE RETRIEVAL METHODS
  // ==========================================

  /**
   * Get template by ID
   */
  public getTemplate(templateId: TemplateId): Template | undefined {
    return this.cache.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  public getAllTemplates(): Template[] {
    return Array.from(this.cache.templates.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Get enabled templates only
   */
  public getEnabledTemplates(): Template[] {
    return this.getAllTemplates().filter((t) => t.enabled);
  }

  /**
   * Get templates accessible by a plan
   */
  public getTemplatesForPlan(planType: PlanType): Template[] {
    const accessibleIds = this.cache.planAccess.get(planType) || [];
    return accessibleIds
      .map((id) => this.cache.templates.get(id))
      .filter((t): t is Template => t !== undefined && t.enabled)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get templates by category
   */
  public getTemplatesByCategory(category: TemplateCategory): Template[] {
    return this.getAllTemplates().filter((t) => t.category === category && t.enabled);
  }

  /**
   * Get templates sorted by order
   */
  public getTemplatesSortedByOrder(): Template[] {
    return this.getAllTemplates().sort((a, b) => a.order - b.order);
  }

  // ==========================================
  // ACCESS CONTROL METHODS
  // ==========================================

  /**
   * Check if plan can access a template
   */
  public canAccessTemplate(planType: PlanType, templateId: TemplateId): boolean {
    const accessibleIds = this.cache.planAccess.get(planType) || [];
    const template = this.cache.templates.get(templateId);
    return accessibleIds.includes(templateId) && (template?.enabled ?? false);
  }

  /**
   * Get locked templates for a plan (for showing upgrade prompts)
   */
  public getLockedTemplates(planType: PlanType): Template[] {
    const accessibleIds = this.cache.planAccess.get(planType) || [];
    return this.getAllTemplates().filter(
      (t) => !accessibleIds.includes(t.id) && t.enabled
    );
  }

  /**
   * Get minimum plan required for a template
   */
  public getMinPlanForTemplate(templateId: TemplateId): PlanType | undefined {
    const template = this.cache.templates.get(templateId);
    return template?.minPlan;
  }

  /**
   * Get upgrade message for locked template
   */
  public getUpgradeMessage(templateId: TemplateId): string {
    const template = this.cache.templates.get(templateId);
    if (!template) return 'Template not found';

    const planNames: Record<PlanType, string> = {
      [PlanType.STARTER]: 'Starter',
      [PlanType.LITE]: 'Lite',
      [PlanType.PLUS]: 'Plus',
      [PlanType.PRO]: 'Pro',
      [PlanType.APEX]: 'Apex',
      [PlanType.SOVEREIGN]: 'Sovereign',
    };

    return `Upgrade to ${planNames[template.minPlan]} to unlock ${template.name}!`;
  }

  // ==========================================
  // TEMPLATE DETAILS METHODS
  // ==========================================

  /**
   * Get template prompt hint for Personality Engine
   */
  public getPromptHint(templateId: TemplateId): string | undefined {
    const template = this.cache.templates.get(templateId);
    return template?.promptHint;
  }

  /**
   * Get max welcome tokens for a template
   */
  public getMaxWelcomeTokens(templateId: TemplateId): number {
    const template = this.cache.templates.get(templateId);
    return template?.maxWelcomeTokens ?? 100;
  }

  /**
   * Get best LLM for a template
   */
  public getBestLLM(templateId: TemplateId): string | undefined {
    const template = this.cache.templates.get(templateId);
    return template?.bestLLM;
  }

  /**
   * Check if template is enabled
   */
  public isTemplateEnabled(templateId: TemplateId): boolean {
    const template = this.cache.templates.get(templateId);
    return template?.enabled ?? false;
  }

  // ==========================================
  // STATISTICS METHODS
  // ==========================================

  /**
   * Get template count for a plan
   */
  public getTemplateCountForPlan(planType: PlanType): number {
    return this.getTemplatesForPlan(planType).length;
  }

  /**
   * Get total template count
   */
  public getTotalTemplateCount(): number {
    return this.getEnabledTemplates().length;
  }

  /**
   * Get template summary for a plan
   */
  public getTemplateSummary(planType: PlanType) {
    const accessible = this.getTemplatesForPlan(planType);
    const locked = this.getLockedTemplates(planType);

    return {
      planType,
      accessibleCount: accessible.length,
      lockedCount: locked.length,
      totalCount: this.getTotalTemplateCount(),
      accessible: accessible.map((t) => ({ id: t.id, name: t.name, icon: t.icon })),
      locked: locked.map((t) => ({
        id: t.id,
        name: t.name,
        icon: t.icon,
        minPlan: t.minPlan,
      })),
    };
  }

  // ==========================================
  // VALIDATION METHODS
  // ==========================================

  /**
   * Validate template ID
   */
  public isValidTemplateId(templateId: string): templateId is TemplateId {
    return Object.values(TemplateId).includes(templateId as TemplateId);
  }

  /**
   * Validate template configuration
   */
  public validateTemplate(templateId: TemplateId): { valid: boolean; errors: string[] } {
    const template = this.cache.templates.get(templateId);
    const errors: string[] = [];

    if (!template) {
      return { valid: false, errors: ['Template not found'] };
    }

    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required');
    }

    if (!template.icon || template.icon.trim() === '') {
      errors.push('Template icon is required');
    }

    if (!template.promptHint || template.promptHint.trim() === '') {
      errors.push('Template promptHint is required');
    }

    if (template.maxWelcomeTokens <= 0) {
      errors.push('maxWelcomeTokens must be positive');
    }

    if (template.order < 0) {
      errors.push('Order cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================

  /**
   * Clear and reload cache from static config
   */
  public clearCache(): void {
    this.cache = {
      templates: new Map(
        Object.entries(TEMPLATES_STATIC_CONFIG) as [TemplateId, Template][]
      ),
      planAccess: new Map(
        Object.entries(PLAN_TEMPLATE_ACCESS_STATIC) as [PlanType, TemplateId[]][]
      ),
      lastUpdated: new Date(),
      source: 'STATIC',
    };
  }

  /**
   * Get cache info
   */
  public getCacheInfo() {
    return {
      templatesCount: this.cache.templates.size,
      lastUpdated: this.cache.lastUpdated,
      source: this.cache.source,
    };
  }

  // ==========================================
  // DATABASE INTEGRATION (FUTURE)
  // ==========================================

  /**
   * Load templates from database (future implementation)
   */
  public async loadFromDatabase(): Promise<void> {
    // TODO: Implement when database integration is ready
    throw new Error('Database integration not yet implemented');
  }

  /**
   * Reload templates
   */
  public async reload(): Promise<void> {
    try {
      await this.loadFromDatabase();
      this.cache.source = 'DATABASE';
    } catch (error) {
      this.clearCache();
    }
    this.cache.lastUpdated = new Date();
  }
}

// ==========================================
// SINGLETON EXPORT
// ==========================================

export const templatesManager = TemplatesManager.getInstance();

// ==========================================
// HELPER FUNCTION EXPORTS (Backward Compatibility)
// ==========================================

export function getAllTemplates(): Template[] {
  return templatesManager.getAllTemplates();
}

export function getEnabledTemplates(): Template[] {
  return templatesManager.getEnabledTemplates();
}

export function getTemplatesForPlan(planType: PlanType): Template[] {
  return templatesManager.getTemplatesForPlan(planType);
}

export function canAccessTemplate(planType: PlanType, templateId: TemplateId): boolean {
  return templatesManager.canAccessTemplate(planType, templateId);
}

export function getTemplateById(templateId: TemplateId): Template | undefined {
  return templatesManager.getTemplate(templateId);
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return templatesManager.getTemplatesByCategory(category);
}

export function getLockedTemplates(planType: PlanType): Template[] {
  return templatesManager.getLockedTemplates(planType);
}

export function getMinPlanForTemplate(templateId: TemplateId): PlanType | undefined {
  return templatesManager.getMinPlanForTemplate(templateId);
}

export function getPromptHint(templateId: TemplateId): string | undefined {
  return templatesManager.getPromptHint(templateId);
}

export function getMaxWelcomeTokens(templateId: TemplateId): number {
  return templatesManager.getMaxWelcomeTokens(templateId);
}

export function isValidTemplateId(templateId: string): templateId is TemplateId {
  return templatesManager.isValidTemplateId(templateId);
}

// ==========================================
// STATIC DATA EXPORTS
// ==========================================

export { TEMPLATES_STATIC_CONFIG, PLAN_TEMPLATE_ACCESS_STATIC };