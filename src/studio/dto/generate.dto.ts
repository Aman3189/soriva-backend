// src/studio/dto/generate.dto.ts
import { StudioFeatureType, GenerationStatus } from '@prisma/client';

// ============ GENERATE ============
export interface GenerateRequest {
  userId: string;
  prompt: string;
  imageBase64?: string;      // For Banana PRO (photo transform)
  imageMimeType?: string;    // image/jpeg, image/png, image/webp
  style?: string;            // Ideogram: realistic, design, anime, 3d
  aspectRatio?: string;      // 1:1, 16:9, 9:16, 4:3, 3:4
  negativePrompt?: string;   // What to avoid
}

export interface GenerateResponse {
  success: boolean;
  data: {
    generationId: string;
    featureType: StudioFeatureType;
    provider: 'IDEOGRAM' | 'BANANA_PRO';
    creditsDeducted: number;
    creditsRemaining: {
      ideogram: number;
      banana: number;
    };
    status: GenerationStatus;
    estimatedTime: string;
    message: string;
  };
}

// ============ GET STATUS ============
export interface GetGenerationStatusRequest {
  generationId: string;
  userId: string;
}

export interface GetGenerationStatusResponse {
  success: boolean;
  data: {
    generationId: string;
    featureType: StudioFeatureType;
    provider: 'IDEOGRAM' | 'BANANA_PRO';
    status: GenerationStatus;
    prompt: string;
    outputUrl?: string;
    thumbnailUrl?: string;
    processingTimeMs?: number;
    errorMessage?: string;
    createdAt: Date;
    completedAt?: Date;
  };
}

// ============ GET HISTORY ============
export interface GetHistoryRequest {
  userId: string;
  featureType?: StudioFeatureType;
  status?: GenerationStatus;
  page?: number;
  limit?: number;
}

export interface GetHistoryResponse {
  success: boolean;
  data: {
    generations: Array<{
      generationId: string;
      featureType: StudioFeatureType;
      provider: string;
      prompt: string;
      status: GenerationStatus;
      outputUrl?: string;
      thumbnailUrl?: string;
      creditsUsed: number;
      createdAt: Date;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// ============ DOWNLOAD ============
export interface DownloadGenerationRequest {
  generationId: string;
  userId: string;
  quality?: 'original' | 'compressed';
}

export interface DownloadGenerationResponse {
  success: boolean;
  data: {
    downloadUrl: string;
    expiresAt: Date;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
}