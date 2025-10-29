/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ORBIT SERVICE
 * "Where every idea finds its gravity"
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PrismaClient } from '@prisma/client';
import { PlanType } from '../constants/plans';
import type {
  OrbitCreateInput,
  OrbitUpdateInput,
  OrbitWithStats,
  OrbitTag,
  AddConversationInput,
  OrbitLimits,
} from '../types/orbit.types';

const prisma = new PrismaClient();

/**
 * Get orbit limits based on plan type
 */
export const getOrbitLimits = (planType: PlanType): OrbitLimits => {
  switch (planType) {
    case PlanType.STARTER:
      return {
        maxOrbits: 1,
        maxTagsPerOrbit: 3,
        maxConversationsPerOrbit: 50,
        canCustomizeColors: false,
        canPinOrbits: false,
      };

    case PlanType.PLUS:
      return {
        maxOrbits: 3,
        maxTagsPerOrbit: 10,
        maxConversationsPerOrbit: 100,
        canCustomizeColors: true,
        canPinOrbits: false,
      };

    case PlanType.PRO:
      return {
        maxOrbits: 10,
        maxTagsPerOrbit: 20,
        maxConversationsPerOrbit: 500,
        canCustomizeColors: true,
        canPinOrbits: true,
      };

    case PlanType.EDGE:
    case PlanType.LIFE:
      return {
        maxOrbits: -1, // Unlimited
        maxTagsPerOrbit: -1, // Unlimited
        maxConversationsPerOrbit: -1, // Unlimited
        canCustomizeColors: true,
        canPinOrbits: true,
      };

    default:
      return getOrbitLimits(PlanType.STARTER);
  }
};

/**
 * Create default orbit for new user
 */
export const createDefaultOrbit = async (userId: string): Promise<OrbitWithStats> => {
  const orbit = await prisma.orbit.create({
    data: {
      userId,
      name: 'My Conversations',
      description: 'Your default orbit',
      icon: '🌌',
      color: '#6366f1',
      isDefault: true,
      sortOrder: 0,
    },
  });

  return {
    ...orbit,
    description: orbit.description ?? undefined,
    icon: orbit.icon ?? '🌌',
    color: orbit.color ?? '#6366f1',
    conversationCount: 0,
    tagCount: 0,
  };
};

/**
 * Get all orbits for a user with stats
 */
export const getUserOrbits = async (userId: string): Promise<OrbitWithStats[]> => {
  const orbits = await prisma.orbit.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          conversations: true,
          tags: true,
        },
      },
      conversations: {
        orderBy: { addedAt: 'desc' },
        take: 1,
        select: { addedAt: true },
      },
    },
    orderBy: [{ isPinned: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return orbits.map((orbit) => ({
    id: orbit.id,
    userId: orbit.userId,
    name: orbit.name,
    description: orbit.description ?? undefined,
    icon: orbit.icon ?? '🌌',
    color: orbit.color ?? '#6366f1',
    isDefault: orbit.isDefault,
    isPinned: orbit.isPinned,
    sortOrder: orbit.sortOrder,
    createdAt: orbit.createdAt,
    updatedAt: orbit.updatedAt,
    conversationCount: orbit._count.conversations,
    tagCount: orbit._count.tags,
    lastActivityAt: orbit.conversations[0]?.addedAt,
  }));
};

/**
 * Get single orbit by ID
 */
export const getOrbitById = async (
  orbitId: string,
  userId: string
): Promise<OrbitWithStats | null> => {
  const orbit = await prisma.orbit.findFirst({
    where: { id: orbitId, userId },
    include: {
      _count: {
        select: {
          conversations: true,
          tags: true,
        },
      },
      conversations: {
        orderBy: { addedAt: 'desc' },
        take: 1,
        select: { addedAt: true },
      },
    },
  });

  if (!orbit) return null;

  return {
    id: orbit.id,
    userId: orbit.userId,
    name: orbit.name,
    description: orbit.description ?? undefined,
    icon: orbit.icon ?? '🌌',
    color: orbit.color ?? '#6366f1',
    isDefault: orbit.isDefault,
    isPinned: orbit.isPinned,
    sortOrder: orbit.sortOrder,
    createdAt: orbit.createdAt,
    updatedAt: orbit.updatedAt,
    conversationCount: orbit._count.conversations,
    tagCount: orbit._count.tags,
    lastActivityAt: orbit.conversations[0]?.addedAt,
  };
};

/**
 * Create new orbit
 */
export const createOrbit = async (
  userId: string,
  planType: PlanType,
  input: OrbitCreateInput
): Promise<OrbitWithStats> => {
  // Check limits
  const limits = getOrbitLimits(planType);

  if (limits.maxOrbits !== -1) {
    const currentCount = await prisma.orbit.count({ where: { userId } });
    if (currentCount >= limits.maxOrbits) {
      throw new Error(`Plan limit reached. Maximum ${limits.maxOrbits} orbits allowed.`);
    }
  }

  // Get next sort order
  const maxSortOrder = await prisma.orbit.findFirst({
    where: { userId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  const orbit = await prisma.orbit.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      icon: input.icon || '🌌',
      color: limits.canCustomizeColors ? input.color || '#6366f1' : '#6366f1',
      sortOrder: (maxSortOrder?.sortOrder || 0) + 1,
    },
  });

  return {
    ...orbit,
    description: orbit.description ?? undefined,
    icon: orbit.icon ?? '🌌',
    color: orbit.color ?? '#6366f1',
    conversationCount: 0,
    tagCount: 0,
  };
};

/**
 * Update orbit
 */
export const updateOrbit = async (
  orbitId: string,
  userId: string,
  planType: PlanType,
  input: OrbitUpdateInput
): Promise<OrbitWithStats> => {
  // Check ownership
  const existing = await prisma.orbit.findFirst({
    where: { id: orbitId, userId },
  });

  if (!existing) {
    throw new Error('Orbit not found');
  }

  if (existing.isDefault && input.name) {
    throw new Error('Cannot rename default orbit');
  }

  const limits = getOrbitLimits(planType);

  // Check pin permission
  if (input.isPinned && !limits.canPinOrbits) {
    throw new Error('Pinning orbits not available in your plan');
  }

  const updated = await prisma.orbit.update({
    where: { id: orbitId },
    data: {
      name: input.name,
      description: input.description,
      icon: input.icon,
      color: limits.canCustomizeColors ? input.color : undefined,
      isPinned: input.isPinned,
    },
    include: {
      _count: {
        select: {
          conversations: true,
          tags: true,
        },
      },
    },
  });

  return {
    ...updated,
    description: updated.description ?? undefined,
    icon: updated.icon ?? '🌌',
    color: updated.color ?? '#6366f1',
    conversationCount: updated._count.conversations,
    tagCount: updated._count.tags,
  };
};

/**
 * Delete orbit
 */
export const deleteOrbit = async (orbitId: string, userId: string): Promise<void> => {
  const orbit = await prisma.orbit.findFirst({
    where: { id: orbitId, userId },
  });

  if (!orbit) {
    throw new Error('Orbit not found');
  }

  if (orbit.isDefault) {
    throw new Error('Cannot delete default orbit');
  }

  await prisma.orbit.delete({
    where: { id: orbitId },
  });
};

/**
 * Add conversation to orbit
 */
export const addConversationToOrbit = async (
  orbitId: string,
  userId: string,
  planType: PlanType,
  input: AddConversationInput
): Promise<void> => {
  // Verify orbit ownership
  const orbit = await prisma.orbit.findFirst({
    where: { id: orbitId, userId },
    include: { _count: { select: { conversations: true } } },
  });

  if (!orbit) {
    throw new Error('Orbit not found');
  }

  // Check limits
  const limits = getOrbitLimits(planType);
  if (
    limits.maxConversationsPerOrbit !== -1 &&
    orbit._count.conversations >= limits.maxConversationsPerOrbit
  ) {
    throw new Error(
      `Orbit full. Maximum ${limits.maxConversationsPerOrbit} conversations allowed.`
    );
  }

  // Add conversation
  await prisma.orbitConversation.create({
    data: {
      orbitId,
      conversationId: input.conversationId,
      isPinned: input.isPinned || false,
    },
  });
};

/**
 * Remove conversation from orbit
 */
export const removeConversationFromOrbit = async (
  orbitId: string,
  conversationId: string,
  userId: string
): Promise<void> => {
  // Verify ownership
  const orbit = await prisma.orbit.findFirst({
    where: { id: orbitId, userId },
  });

  if (!orbit) {
    throw new Error('Orbit not found');
  }

  await prisma.orbitConversation.deleteMany({
    where: {
      orbitId,
      conversationId,
    },
  });
};

/**
 * Get conversations in orbit
 */
export const getOrbitConversations = async (orbitId: string, userId: string): Promise<string[]> => {
  // Verify ownership
  const orbit = await prisma.orbit.findFirst({
    where: { id: orbitId, userId },
  });

  if (!orbit) {
    throw new Error('Orbit not found');
  }

  const conversations = await prisma.orbitConversation.findMany({
    where: { orbitId },
    orderBy: [{ isPinned: 'desc' }, { addedAt: 'desc' }],
    select: { conversationId: true },
  });

  return conversations.map((c) => c.conversationId);
};

/**
 * Create tag in orbit
 */
export const createOrbitTag = async (
  orbitId: string,
  userId: string,
  planType: PlanType,
  name: string,
  color?: string
): Promise<OrbitTag> => {
  // Verify ownership
  const orbit = await prisma.orbit.findFirst({
    where: { id: orbitId, userId },
    include: { _count: { select: { tags: true } } },
  });

  if (!orbit) {
    throw new Error('Orbit not found');
  }

  // Check limits
  const limits = getOrbitLimits(planType);
  if (limits.maxTagsPerOrbit !== -1 && orbit._count.tags >= limits.maxTagsPerOrbit) {
    throw new Error(`Tag limit reached. Maximum ${limits.maxTagsPerOrbit} tags allowed.`);
  }

  const tag = await prisma.orbitTag.create({
    data: {
      orbitId,
      name,
      color: color || '#8b5cf6',
    },
  });

  return tag;
};

/**
 * Get tags for orbit
 */
export const getOrbitTags = async (orbitId: string, userId: string): Promise<OrbitTag[]> => {
  // Verify ownership
  const orbit = await prisma.orbit.findFirst({
    where: { id: orbitId, userId },
  });

  if (!orbit) {
    throw new Error('Orbit not found');
  }

  return await prisma.orbitTag.findMany({
    where: { orbitId },
    orderBy: { createdAt: 'asc' },
  });
};

/**
 * Delete tag from orbit
 */
export const deleteOrbitTag = async (tagId: string, userId: string): Promise<void> => {
  const tag = await prisma.orbitTag.findUnique({
    where: { id: tagId },
    include: { orbit: true },
  });

  if (!tag || tag.orbit.userId !== userId) {
    throw new Error('Tag not found');
  }

  await prisma.orbitTag.delete({
    where: { id: tagId },
  });
};
