import { Router, Request, Response } from 'express';
import { 
  templatesManager, 
  TemplateId, 
  TemplateCategory 
} from './templates.config';
import { PlanType } from './plans';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { CacheTTL, CacheNamespace } from '../types/cache.types';

/**
 * ==========================================
 * TEMPLATES ROUTES - CONVERSATION TEMPLATES API
 * ==========================================
 * Endpoints for retrieving templates with plan-based access
 * Last Updated: December 2025
 */

const router = Router();

/**
 * GET /api/templates
 * Get all enabled templates with lock status based on user's plan
 */
router.get('/',
  cacheMiddleware.cache({
    namespace: CacheNamespace.PUBLIC,
    ttl: CacheTTL.LONG,
    keyGenerator: (req) => {
      const planType = (req as any).userPlan || 'STARTER';
      return `templates:all:${planType}`;
    }
  }),
  (req: Request, res: Response) => {
    try {
      const userPlan = ((req as any).userPlan || 'STARTER') as PlanType;
      
      const allTemplates = templatesManager.getEnabledTemplates();
      const accessibleTemplates = templatesManager.getTemplatesForPlan(userPlan);
      const accessibleIds = accessibleTemplates.map(t => t.id);

      const templatesWithStatus = allTemplates.map(template => ({
        ...template,
        isLocked: !accessibleIds.includes(template.id),
        upgradeMessage: !accessibleIds.includes(template.id) 
          ? templatesManager.getUpgradeMessage(template.id)
          : null,
      }));

      res.status(200).json({
        success: true,
        userPlan,
        count: allTemplates.length,
        accessibleCount: accessibleTemplates.length,
        lockedCount: allTemplates.length - accessibleTemplates.length,
        data: templatesWithStatus,
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates',
      });
    }
  }
);

/**
 * GET /api/templates/plan/:planType
 * Get templates accessible by a specific plan
 */
router.get('/plan/:planType',
  cacheMiddleware.cache({
    namespace: CacheNamespace.PUBLIC,
    ttl: CacheTTL.LONG,
    keyGenerator: (req) => {
      const planType = req.params.planType?.toUpperCase() || 'STARTER';
      return `templates:plan:${planType}`;
    }
  }),
  (req: Request, res: Response) => {
    try {
      const { planType } = req.params;
      const plan = planType.toUpperCase() as PlanType;

      if (!Object.values(PlanType).includes(plan)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid plan type',
        });
      }

      const planTemplates = templatesManager.getTemplatesForPlan(plan);
      const templateSummary = templatesManager.getTemplateSummary(plan);

      res.status(200).json({
        success: true,
        ...templateSummary,
        data: planTemplates,
      });
    } catch (error) {
      console.error('Error fetching templates for plan:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates for plan',
      });
    }
  }
);

/**
 * GET /api/templates/category/:category
 * Get templates by category
 */
router.get('/category/:category',
  cacheMiddleware.cache({
    namespace: CacheNamespace.PUBLIC,
    ttl: CacheTTL.LONG,
    keyGenerator: (req) => {
      const category = req.params.category?.toLowerCase() || 'all';
      return `templates:category:${category}`;
    }
  }),
  (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const cat = category.toLowerCase() as TemplateCategory;

      if (!Object.values(TemplateCategory).includes(cat)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category. Valid categories: fun, learning, daily-use',
        });
      }

      const categoryTemplates = templatesManager.getTemplatesByCategory(cat);

      res.status(200).json({
        success: true,
        category: cat,
        count: categoryTemplates.length,
        data: categoryTemplates,
      });
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch templates by category',
      });
    }
  }
);

/**
 * GET /api/templates/:templateId
 * Get single template details
 */
router.get('/:templateId',
  cacheMiddleware.cache({
    namespace: CacheNamespace.PUBLIC,
    ttl: CacheTTL.LONG,
    keyGenerator: (req) => {
      const templateId = req.params.templateId || 'UNKNOWN';
      return `templates:single:${templateId}`;
    }
  }),
  (req: Request, res: Response) => {
    try {
      const { templateId } = req.params;

      if (!templatesManager.isValidTemplateId(templateId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid template ID',
        });
      }

      const template = templatesManager.getTemplate(templateId as TemplateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found',
        });
      }

      const userPlan = ((req as any).userPlan || 'STARTER') as PlanType;
      const canAccess = templatesManager.canAccessTemplate(userPlan, template.id);

      res.status(200).json({
        success: true,
        data: {
          ...template,
          isLocked: !canAccess,
          upgradeMessage: !canAccess 
            ? templatesManager.getUpgradeMessage(template.id)
            : null,
        },
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch template',
      });
    }
  }
);

/**
 * GET /api/templates/:templateId/access
 * Check if user can access a specific template
 */
router.get('/:templateId/access', (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    if (!templatesManager.isValidTemplateId(templateId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template ID',
      });
    }

    const template = templatesManager.getTemplate(templateId as TemplateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    const userPlan = ((req as any).userPlan || 'STARTER') as PlanType;
    const canAccess = templatesManager.canAccessTemplate(userPlan, template.id);

    res.status(200).json({
      success: true,
      templateId: template.id,
      templateName: template.name,
      userPlan,
      canAccess,
      minPlanRequired: template.minPlan,
      upgradeMessage: !canAccess 
        ? templatesManager.getUpgradeMessage(template.id)
        : null,
    });
  } catch (error) {
    console.error('Error checking template access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check template access',
    });
  }
});

/**
 * GET /api/templates/:templateId/prompt
 * Get prompt hint for a template (for Personality Engine)
 */
router.get('/:templateId/prompt', (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    if (!templatesManager.isValidTemplateId(templateId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template ID',
      });
    }

    const template = templatesManager.getTemplate(templateId as TemplateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    const userPlan = ((req as any).userPlan || 'STARTER') as PlanType;
    const canAccess = templatesManager.canAccessTemplate(userPlan, template.id);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: 'Upgrade required to access this template',
        upgradeMessage: templatesManager.getUpgradeMessage(template.id),
      });
    }

    res.status(200).json({
      success: true,
      templateId: template.id,
      templateName: template.name,
      promptHint: template.promptHint,
      maxWelcomeTokens: template.maxWelcomeTokens,
      bestLLM: template.bestLLM,
    });
  } catch (error) {
    console.error('Error fetching template prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template prompt',
    });
  }
});

export default router;