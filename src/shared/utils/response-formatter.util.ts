// src/rag/utils/response-formatter.util.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RAG Response Formatter Utility
// Pattern: FUNCTIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { getControllerConfig } from '../../rag/config/rag-controller.config';

export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    processingTime?: number;
    [key: string]: any;
  };
}

export interface ErrorResponse {
  response: StandardResponse;
  statusCode: number;
}

export const success = <T>(
  data: T,
  requestId: string,
  metadata?: Record<string, any>
): StandardResponse<T> => {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId,
      ...metadata,
    },
  };
};

export const error = (
  code: string,
  message: string,
  requestId: string,
  details?: any,
  statusCode: number = 500
): ErrorResponse => {
  const config = getControllerConfig();

  return {
    response: {
      success: false,
      error: {
        code,
        message,
        ...(config.enableDetailedErrors && details && { details }),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    statusCode,
  };
};

export const formatRAGError = (err: any, requestId: string): ErrorResponse => {
  // Handle known RAG errors
  if (err.name === 'DocumentValidationError') {
    return error(err.code, err.message, requestId, err.details, 400);
  }
  if (err.name === 'QueryValidationError') {
    return error(err.code, err.message, requestId, err.details, 400);
  }
  if (err.name === 'SecurityValidationError') {
    return error(err.code, err.message, requestId, err.details, 403);
  }
  if (err.name === 'RAGError') {
    return error(err.code, err.message, requestId, err.details, err.statusCode || 500);
  }

  // Handle generic errors
  if (err.message) {
    return error('INTERNAL_ERROR', err.message, requestId, undefined, 500);
  }

  return error('UNKNOWN_ERROR', 'An unexpected error occurred', requestId, undefined, 500);
};

// Namespace export for backward compatibility
export const ResponseFormatter = {
  success,
  error,
  formatRAGError,
} as const;

export default ResponseFormatter;