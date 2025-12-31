// src/rag/utils/request-validator.util.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RAG Request Validator Utility
// Pattern: FUNCTIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const validateUploadRequest = (body: any): void => {
  if (!body.file) {
    throw new Error('File information is required');
  }

  const requiredFields = [
    'filename',
    'originalName',
    'fileType',
    'fileSize',
    'mimeType',
    'storageUrl',
  ];
  
  for (const field of requiredFields) {
    if (!body.file[field]) {
      throw new Error(`File.${field} is required`);
    }
  }

  if (typeof body.file.fileSize !== 'number' || body.file.fileSize <= 0) {
    throw new Error('Invalid file size');
  }
};

export const validateQueryRequest = (body: any): void => {
  if (!body.query || typeof body.query !== 'string' || body.query.trim().length === 0) {
    throw new Error('Query is required and must be a non-empty string');
  }

  if (body.topK !== undefined) {
    const topK = parseInt(body.topK, 10);
    if (isNaN(topK) || topK < 1 || topK > 100) {
      throw new Error('topK must be a number between 1 and 100');
    }
  }

  if (body.threshold !== undefined) {
    const threshold = parseFloat(body.threshold);
    if (isNaN(threshold) || threshold < 0 || threshold > 1) {
      throw new Error('threshold must be a number between 0 and 1');
    }
  }
};

export const validatePagination = (query: any): { limit: number; offset: number } => {
  const limit = Math.min(parseInt(query.limit || '50', 10), 100);
  const offset = Math.max(parseInt(query.offset || '0', 10), 0);

  if (isNaN(limit) || isNaN(offset)) {
    throw new Error('Invalid pagination parameters');
  }

  return { limit, offset };
};

export const validateUUID = (id: string): void => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error('Invalid ID format');
  }
};

// Namespace export for backward compatibility
export const RequestValidator = {
  validateUploadRequest,
  validateQueryRequest,
  validatePagination,
  validateUUID,
} as const;

export default RequestValidator;