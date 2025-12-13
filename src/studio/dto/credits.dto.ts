// src/studio/dto/credits.dto.ts
// ============================================================================
// SORIVA STUDIO v2.0 - December 2025
// ============================================================================

import { StudioFeatureType } from '@prisma/client';

// ==========================================================================
// CREDITS BALANCE
// ==========================================================================

export interface CreditsBalance {
  monthly: number;
  booster: number;
  carryForward: number;
  total: number;
  used: number;
  remaining: number;
  lastReset: Date;
  nextReset: Date;
  daysUntilReset: number;
}

export interface GetCreditsBalanceResponse {
  success: boolean;
  data: CreditsBalance;
}

// ==========================================================================
// CREDIT OPERATIONS
// ==========================================================================

export interface DeductCreditsRequest {
  userId: string;
  amount: number;
  featureType: StudioFeatureType;
  generationId?: string;
}

export interface DeductCreditsResponse {
  success: boolean;
  data: {
    amount: number;
    type: 'deduct';
    featureType: StudioFeatureType;
    timestamp: Date;
    balance: CreditsBalance;
  };
}

export interface AddCreditsRequest {
  userId: string;
  amount: number;
  source: 'booster' | 'refund' | 'admin' | 'promo';
  boosterType?: 'LITE' | 'PRO' | 'MAX';
}

export interface AddCreditsResponse {
  success: boolean;
  data: {
    amount: number;
    type: 'add';
    source: string;
    timestamp: Date;
    balance: CreditsBalance;
  };
}

// ==========================================================================
// BOOSTERS
// ==========================================================================

export interface BoosterPurchaseRequest {
  userId: string;
  boosterType: 'LITE' | 'PRO' | 'MAX';
  paymentId?: string;
}

export interface BoosterPurchaseResponse {
  success: boolean;
  data: {
    boosterType: 'LITE' | 'PRO' | 'MAX';
    creditsAdded: number;
    price: number;
    expiresAt: Date;
    balance: CreditsBalance;
  };
}

export interface BoosterInfo {
  type: 'LITE' | 'PRO' | 'MAX';
  credits: number;
  price: number;
  validity: number; // days
  pricePerCredit: number;
}

export interface GetBoosterPricingResponse {
  success: boolean;
  data: {
    LITE: BoosterInfo;
    PRO: BoosterInfo;
    MAX: BoosterInfo;
  };
}

// ==========================================================================
// GENERATION
// ==========================================================================

export interface GenerateRequest {
  featureType: StudioFeatureType;
  prompt: string;
  inputImageUrl?: string;
  options?: {
    style?: string;
    aspectRatio?: string;
    negativePrompt?: string;
    voiceStyle?: 'male' | 'female' | 'child';
    text?: string;
    secondImageUrl?: string;
    babyGender?: 'boy' | 'girl' | 'random';
  };
}

export interface GenerateResponse {
  success: boolean;
  data: {
    id: string;
    featureType: StudioFeatureType;
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    outputUrl?: string;
    creditsUsed: number;
    apiCost: number;
    error?: string;
  };
}

// ==========================================================================
// HISTORY
// ==========================================================================

export interface GetHistoryRequest {
  limit?: number;
  offset?: number;
  category?: 'text_to_image' | 'photo_transform' | 'talking_photo' | 'video';
  status?: 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface GenerationHistoryItem {
  id: string;
  featureType: StudioFeatureType;
  prompt: string;
  inputImageUrl?: string;
  outputUrl?: string;
  status: string;
  creditsUsed: number;
  createdAt: Date;
}

export interface GetHistoryResponse {
  success: boolean;
  data: GenerationHistoryItem[];
  count: number;
}

// ==========================================================================
// STUDIO STATUS
// ==========================================================================

export interface StudioStatusResponse {
  success: boolean;
  data: {
    credits: CreditsBalance;
    recentGenerations: GenerationHistoryItem[];
    availableFeatures: string[];
    planType: string;
  };
}

// ==========================================================================
// USAGE STATS
// ==========================================================================

export interface UsageStatsResponse {
  success: boolean;
  data: {
    totalGenerations: number;
    totalCreditsUsed: number;
    totalApiCost: number;
    byCategory: Record<string, number>;
    byProvider: Record<string, number>;
    period: {
      start: Date;
      end: Date;
      days: number;
    };
  };
}