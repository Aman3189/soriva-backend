/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ORBIT CONTROLLER
 * "Where every idea finds its gravity"
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Request, Response, NextFunction } from 'express';
import type { AuthUser } from '../../core/ai/middlewares/admin.middleware';
import * as orbitService from './services/orbit.service';
import { PlanType } from '../../constants/plans';

interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Get user's plan type
 */
const getPlanType = (user: AuthUser): PlanType => {
  const planType = (user as any).planType;
  if (Object.values(PlanType).includes(planType)) {
    return planType;
  }
  return PlanType.STARTER;
};

/**
 * GET /api/orbit/limits
 * Get orbit limits for user's plan
 */
export const getLimits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const planType = getPlanType(req.user);
    const limits = orbitService.getOrbitLimits(planType);

    res.json({
      success: true,
      data: { limits, planType },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/orbit
 * Get all orbits for user
 */
export const getAllOrbits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const orbits = await orbitService.getUserOrbits(req.user.userId);

    res.json({
      success: true,
      data: { orbits, count: orbits.length },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/orbit/:id
 * Get single orbit by ID
 */
export const getOrbitById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const orbit = await orbitService.getOrbitById(id, req.user.userId);

    if (!orbit) {
      res.status(404).json({ success: false, message: 'Orbit not found' });
      return;
    }

    res.json({
      success: true,
      data: { orbit },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/orbit
 * Create new orbit
 */
export const createOrbit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const planType = getPlanType(req.user);
    const orbit = await orbitService.createOrbit(req.user.userId, planType, req.body);

    res.status(201).json({
      success: true,
      data: { orbit },
      message: 'Orbit created successfully',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/orbit/:id
 * Update orbit
 */
export const updateOrbit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const planType = getPlanType(req.user);
    const orbit = await orbitService.updateOrbit(id, req.user.userId, planType, req.body);

    res.json({
      success: true,
      data: { orbit },
      message: 'Orbit updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/orbit/:id
 * Delete orbit
 */
export const deleteOrbit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    await orbitService.deleteOrbit(id, req.user.userId);

    res.json({
      success: true,
      message: 'Orbit deleted successfully',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/orbit/:id/conversations
 * Add conversation to orbit
 */
export const addConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const planType = getPlanType(req.user);

    await orbitService.addConversationToOrbit(id, req.user.userId, planType, req.body);

    res.json({
      success: true,
      message: 'Conversation added to orbit',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/orbit/:id/conversations/:conversationId
 * Remove conversation from orbit
 */
export const removeConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id, conversationId } = req.params;
    await orbitService.removeConversationFromOrbit(id, conversationId, req.user.userId);

    res.json({
      success: true,
      message: 'Conversation removed from orbit',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/orbit/:id/conversations
 * Get conversations in orbit
 */
export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const conversationIds = await orbitService.getOrbitConversations(id, req.user.userId);

    res.json({
      success: true,
      data: { conversationIds, count: conversationIds.length },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/orbit/:id/tags
 * Create tag in orbit
 */
export const createTag = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { name, color } = req.body;
    const planType = getPlanType(req.user);

    const tag = await orbitService.createOrbitTag(id, req.user.userId, planType, name, color);

    res.status(201).json({
      success: true,
      data: { tag },
      message: 'Tag created successfully',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/orbit/:id/tags
 * Get tags for orbit
 */
export const getTags = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const tags = await orbitService.getOrbitTags(id, req.user.userId);

    res.json({
      success: true,
      data: { tags, count: tags.length },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/orbit/tags/:tagId
 * Delete tag
 */
export const deleteTag = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { tagId } = req.params;
    await orbitService.deleteOrbitTag(tagId, req.user.userId);

    res.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
