/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA ORBIT - TYPE DEFINITIONS
 * "Where every idea finds its gravity"
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export interface OrbitCreateInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface OrbitUpdateInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  isPinned?: boolean;
}

export interface OrbitWithStats {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isDefault: boolean;
  isPinned: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;

  // Stats
  conversationCount: number;
  tagCount: number;
  lastActivityAt?: Date;
}

export interface OrbitTag {
  id: string;
  orbitId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface AddConversationInput {
  conversationId: string;
  isPinned?: boolean;
}

export interface OrbitLimits {
  maxOrbits: number;
  maxTagsPerOrbit: number;
  maxConversationsPerOrbit: number;
  canCustomizeColors: boolean;
  canPinOrbits: boolean;
}
