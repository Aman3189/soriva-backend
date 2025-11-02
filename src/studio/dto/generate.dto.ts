// src/studio/dto/generate.dto.ts

import { StudioFeatureType } from '@prisma/client';

export interface GenerateRequest {
  userId: string;
  featureType: StudioFeatureType;
  userPrompt: string;
  parameters?: Record<string, any>;
}

export interface GenerateResponse {
  success: boolean;
  data: {
    generationId: string;
    featureType: StudioFeatureType;
    featureName: string;
    creditsDeducted: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    estimatedTime: string;
    message: string;
  };
}

export interface GetGenerationStatusRequest {
  generationId: string;
  userId: string;
}

export interface GetGenerationStatusResponse {
  success: boolean;
  data: {
    generationId: string;
    featureType: StudioFeatureType;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    outputUrl?: string;
    outputType?: string;
    processingTime?: number;
    errorMessage?: string;
    createdAt: Date;
    completedAt?: Date;
  };
}