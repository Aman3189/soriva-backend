// src/studio/dto/preview.dto.ts

export interface RequestPreviewRequest {
  userId: string;
  generationId: string;
  previewNumber: number; // 1, 2, or 3
}

export interface RequestPreviewResponse {
  success: boolean;
  data: {
    previewId: string;
    previewNumber: number;
    previewUrl: string;
    creditsCost: number; // 0 for first, 3 for additional
    message: string;
  };
}

export interface ApprovePreviewRequest {
  userId: string;
  previewId: string;
  generationId: string;
}

export interface ApprovePreviewResponse {
  success: boolean;
  data: {
    generationId: string;
    status: 'PROCESSING';
    message: string;
    estimatedTime: string;
  };
}

export interface RegeneratePreviewRequest {
  userId: string;
  generationId: string;
}

export interface RegeneratePreviewResponse {
  success: boolean;
  data: {
    previewId: string;
    previewNumber: number;
    creditsCost: number;
    message: string;
  };
}