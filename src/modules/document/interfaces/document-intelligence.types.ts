// src/modules/document/interfaces/document-intelligence.types.ts

/**
 * ==========================================
 * DOCUMENT INTELLIGENCE - TYPE DEFINITIONS
 * ==========================================
 * Created: November 23, 2025
 * Updated: November 24, 2025 - FIXED VERSION
 * 
 * ALIGNED WITH:
 * - Prisma schema (OperationType, OperationStatus enums)
 * - documentLimits.ts exports
 * - document-intelligence.service.ts usage
 * - document-operations.service.ts usage
 */

import { OperationType, OperationStatus } from '@prisma/client';

// ==========================================
// RE-EXPORT FROM CONSTANTS (for convenience)
// ==========================================

export type {
  FreeOperationType,
  PaidOperationType,
  AllOperationType,
  DocumentStatusType,
  FeatureCategoryId,
  AIProvider,
  AITier,
} from '@/constants/documentLimits';

// ==========================================
// DOCUMENT UPLOAD TYPES
// ==========================================

export interface DocumentUploadRequest {
  file: Express.Multer.File;
  userId: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export interface DocumentUploadResponse {
  success: boolean;
  document: {
    id: string;
    filename: string;
    originalName?: string;
    fileSize: number;
    fileType: string;
    mimeType?: string;
    status: string;
    pageCount?: number;
    wordCount?: number;
    uploadedAt: Date;
  };
  usage: {
    documentsUsed: number;
    documentsLimit: number;
    documentsRemaining?: number;
    storageUsed: number;
    storageLimit: number;
  };
}

// ==========================================
// DOCUMENT OPERATION TYPES
// ==========================================

export interface OperationOptions {
  // Summary options
  length?: 'short' | 'medium' | 'long';
  format?: 'paragraph' | 'bullets' | 'numbered';
  
  // Translation options
  targetLanguage?: string;
  sourceLanguage?: string;
  
  // Test Generator options
  questionCount?: number;
  questionType?: 'mcq' | 'short' | 'long' | 'mixed';
  difficulty?: 'easy' | 'medium' | 'hard';
  includeAnswerKey?: boolean;
  
  // Flashcard options
  cardCount?: number;
  
  // Notes options
  detailLevel?: 'brief' | 'detailed' | 'comprehensive';
  includeExamples?: boolean;
  
  // Presentation options
  slideCount?: number;
  
  // Q&A options
  customQuestion?: string;
  
  // Output format
  outputFormat?: 'text' | 'json' | 'markdown' | 'html';
  
  // Custom instructions
  customInstructions?: string;
  
  // Index signature for additional properties
  [key: string]: unknown;
}

export interface DocumentOperationRequest {
  documentId: string;
  userId: string;
  operationType: OperationType;
  options?: OperationOptions;
}

export interface DocumentOperationResponse {
  success: boolean;
  operation: {
    id: string;
    operationType: OperationType;
    operationName: string;
    status: OperationStatus;
    result?: string;
    resultPreview?: string;
    processingTime?: number;
    tokensUsed: number;
    cost: number;
    aiProvider?: string;
    aiModel?: string;
    fromCache: boolean;
  };
  usage: {
    operationsUsed: number;
    operationsLimit: number;
    tokensUsed: number;
    costThisMonth: number;
  };
}

// ==========================================
// AI ROUTING TYPES
// ==========================================

export interface AIRoutingDecision {
  provider: 'google' | 'openai' | 'anthropic';
  model: string;
  tier: 'gemini' | 'gpt' | 'haiku';
  estimatedCost: number;
  tokenCaps: {
    input: number;
    output: number;
  };
  reason: string;
}

export interface AIOperationResult {
  success: boolean;
  result?: string;
  error?: string;
  tokens: TokenUsage;
  cost: number;
  processingTime: number;
  fromCache: boolean;
  cacheKey?: string;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

// ==========================================
// USAGE & LIMITS TYPES
// ==========================================

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  current: {
    documents: number;
    operations: number;
    storage: number;
    operationsThisHour: number;
  };
  limits: {
    documents: number;
    operations: number;
    storage: number;
    operationsPerHour: number;
  };
  remaining: {
    documents: number;
    operations: number;
    storage: number;
  };
}

export interface LimitsEnforcementResult {
  canProceed: boolean;
  errorCode?: string;
  errorMessage?: string;
  upgradeRequired?: boolean;
}

// ==========================================
// DOCUMENT LIST & DETAIL TYPES
// ==========================================

export interface DocumentListQuery {
  userId: string;
  page?: number;
  limit?: number;
  sortBy?: 'uploadedAt' | 'filename' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
  status?: string;
  search?: string;
}

export interface DocumentListResponse {
  documents: DocumentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface DocumentListItem {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  status: string;
  pageCount?: number;
  wordCount?: number;
  uploadedAt: Date;
  operationCount: number;
  lastOperationAt?: Date;
}

export interface DocumentDetail extends DocumentListItem {
  storageUrl: string;
  mimeType: string;
  textContent?: string;
  metadata?: DocumentMetadata;
  operations: OperationHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentMetadata {
  pageCount: number;
  wordCount: number;
  characterCount: number;
  language?: string;
  hasImages: boolean;
  hasTables: boolean;
}

export interface OperationHistoryItem {
  id: string;
  operationType: OperationType;
  operationName: string;
  category: string;
  status: OperationStatus;
  resultPreview?: string;
  tokensUsed: number;
  cost: number;
  processingTime?: number;
  createdAt: Date;
}

// ==========================================
// USAGE STATS RESPONSE
// ==========================================

export interface UsageStatsResponse {
  period: 'day' | 'month';
  isPaidUser?: boolean;
  usage: {
    documents: {
      used?: number;
      usedThisMonth?: number;
      limit?: number;
      limitPerMonth?: number;
      percentage: number;
    };
    operations: {
      used?: number;
      usedThisMonth?: number;
      limit?: number;
      limitPerMonth?: number;
      usedToday?: number;
      limitPerDay?: number;
      percentage: number;
    };
    storage: {
      used: number;
      limit: number;
      percentage: number;
      formattedUsed?: string;
      formattedLimit?: string;
    };
    cost: {
      thisMonth: number;
      average: number;
    };
  };
  topOperations?: Array<{
    type?: OperationType;
    operationType?: OperationType;
    name?: string;
    count: number;
    totalCost: number;
  }>;
  recentDocuments: Array<{
    id: string;
    filename: string;
    uploadedAt: Date;
    operationCount?: number;
  }>;
  recentOperations?: Array<{
    id: string;
    operationType: OperationType;
    documentName: string;
    status: OperationStatus;
    createdAt: Date;
  }>;
}

// ==========================================
// STRUCTURED OUTPUT TYPES
// ==========================================

export interface QuestionItem {
  id: number;
  type: 'mcq' | 'short' | 'long' | 'fill_blank';
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  marks?: number;
}

export interface FlashcardItem {
  id: number;
  front: string;
  back: string;
  hint?: string;
}

export interface KeywordItem {
  keyword: string;
  frequency: number;
  importance: 'high' | 'medium' | 'low';
}

export interface BulletPoint {
  id: number;
  text: string;
  subPoints?: string[];
}

// ==========================================
// TEXT EXTRACTION TYPES
// ==========================================

export interface TextExtractionResult {
  success: boolean;
  text: string;
  metadata: DocumentMetadata;
  extractionTime: number;
  error?: string;
}

// ==========================================
// ERROR HANDLING
// ==========================================

export class DocumentIntelligenceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'DocumentIntelligenceError';
  }
}

export const ERROR_CODES = {
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  FILE_CORRUPTED: 'FILE_CORRUPTED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  
  // Limit errors
  DOCUMENT_LIMIT_REACHED: 'DOCUMENT_LIMIT_REACHED',
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',
  OPERATION_LIMIT_REACHED: 'OPERATION_LIMIT_REACHED',
  STORAGE_LIMIT_REACHED: 'STORAGE_LIMIT_REACHED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Access errors
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  ADDON_REQUIRED: 'ADDON_REQUIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Processing errors
  EXTRACTION_FAILED: 'EXTRACTION_FAILED',
  OPERATION_FAILED: 'OPERATION_FAILED',
  AI_ERROR: 'AI_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Not found
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  OPERATION_NOT_FOUND: 'OPERATION_NOT_FOUND',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==========================================
// ADDON SUBSCRIPTION TYPE
// ==========================================

export interface DocumentIntelligenceAddon {
  isActive: boolean;
  activatedAt?: Date;
  expiresAt?: Date;
  price: {
    INR: number;
    USD: number;
  };
  limits: {
    documentsPerMonth: number;
    documentsPerDay: number;
    operationsPerDay: number;
    maxFileSize: number;
    maxPages: number;
    storage: number;
  };
}