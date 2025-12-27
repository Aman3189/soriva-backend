// src/modules/document/document.controller.ts

import { Request, Response, NextFunction } from 'express';

// Import service instances
import { fileUploadService } from '../../services/file-upload.service';
import { documentManagerService, DocumentStatus } from './services/document-manager.service';
import { documentRAGService } from './services/document-rag.service';
import documentIntelligenceService from './services/document-intelligence.service';

// 💳 Smart Docs Credit Service (NEW!)
import docsCreditService from './services/docs-credit.service';
import {
  SMART_DOCS_OPERATIONS,
  getSmartDocsConfig,
  canAccessSmartDocsFeature,
  type RegionCode,
} from '../../constants/smart-docs';

// Import utilities
import { ApiError, asyncHandler } from '@shared/utils/error-handler';
import { logger } from '@shared/utils/logger';

/**
 * 🎯 SORIVA - DOCUMENT CONTROLLER (100% PRODUCTION-READY)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Developer: Amandeep, Punjab, India
 * Architecture: Class-based Singleton Pattern
 * Quality: 10/10 Production-ready
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * FEATURES:
 * ✅ Upload & Process Documents (with validation)
 * ✅ List Documents with Filters, Search & Sort
 * ✅ Query Single Document (RAG)
 * ✅ Query Multiple Documents (RAG with limits)
 * ✅ Document Intelligence Operations (28 AI features)
 * ✅ Usage Statistics & Limits
 * ✅ Delete Documents
 * ✅ Update Document Metadata
 * ✅ Get User Stats
 * 
 * 💳 SMART DOCS CREDIT FEATURES (NEW!):
 * ✅ Get Credit Balance
 * ✅ Get Dashboard Summary
 * ✅ Get All Features with Lock Status
 * ✅ Check Operation Availability
 * ✅ Get Usage Statistics
 * ✅ Get Available Packs
 * ✅ Purchase Credit Pack
 * ✅ Get Affordable Operations
 *
 * PRODUCTION ENHANCEMENTS:
 * ✅ Complete error handling with ApiError
 * ✅ Async error wrapper
 * ✅ Comprehensive logging with context
 * ✅ File type validation (PDF only)
 * ✅ File size limits by plan
 * ✅ Pagination limits
 * ✅ Multi-document query limits
 * ✅ Search & sort implementation
 * ✅ Safe URL generation with error handling
 * ✅ Request tracking & monitoring
 * ✅ Document Intelligence with usage tracking
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FILE_SIZE_LIMITS = {
  FREE: 10 * 1024 * 1024, // 10 MB
  STARTER: 10 * 1024 * 1024, // 10 MB
  PLUS: 25 * 1024 * 1024, // 25 MB
  PRO: 50 * 1024 * 1024, // 50 MB
  APEX: 100 * 1024 * 1024, // 100 MB
  ENTERPRISE: 100 * 1024 * 1024, // 100 MB
};

const ALLOWED_FILE_TYPES = ['application/pdf'];
const MAX_PAGINATION_LIMIT = 100;
const MAX_MULTI_QUERY_DOCUMENTS = 10;
const DEFAULT_PAGE_SIZE = 20;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  fieldname?: string;
  encoding?: string;
}

interface QueryDocumentBody {
  question: string;
  documentId?: string;
  documentIds?: string[];
  topK?: number;
}

interface GetDocumentsQuery {
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: 'createdAt' | 'fileName' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

interface PerformOperationBody {
  operationType: string;
  options?: Record<string, unknown>;
}

interface DocumentFilterOptions {
  userId: string;
  limit: number;
  offset: number;
  status?: DocumentStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface DocumentUpdateData {
  fileName?: string;
  status?: DocumentStatus;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTROLLER CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DocumentController {
  private static instance: DocumentController;

  private constructor() {}

  public static getInstance(): DocumentController {
    if (!DocumentController.instance) {
      DocumentController.instance = new DocumentController();
    }
    return DocumentController.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Helper to get userId from request
   */
  private getUserId(req: Request): string | undefined {
    const user = (req as any).user;
    return user?.userId || user?.id;
  }

  /**
   * Helper to get user plan from request
   */
  private getUserPlan(req: Request): string {
    const user = (req as any).user;
    return user?.plan || user?.planType || 'FREE';
  }

  /**
   * Helper to get uploaded file from request
   */
  private getUploadedFile(req: Request): UploadedFile | undefined {
    return (req as any).file;
  }

  /**
   * Helper to get user region (for Smart Docs)
   */
  private getUserRegion(req: Request): RegionCode {
    const user = (req as any).user;
    return user?.country === 'IN' ? 'IN' : 'INTL';
  }

  /**
   * Helper to convert plan type to MinimumPlan (for Smart Docs)
   */
  private planToMinimumPlan(plan: string): 'STARTER' | 'PLUS' | 'PRO' | 'APEX' {
    switch (plan?.toUpperCase()) {
      case 'PLUS': return 'PLUS';
      case 'PRO': return 'PRO';
      case 'APEX':
      case 'SOVEREIGN': return 'APEX';
      default: return 'STARTER';
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOCUMENT CRUD METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 📤 UPLOAD DOCUMENT
   * POST /api/documents/upload
   */
  public uploadDocument = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const userPlan = this.getUserPlan(req);
      const file = this.getUploadedFile(req);

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      if (!file) {
        throw ApiError.badRequest('No file uploaded');
      }

      if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        throw ApiError.badRequest('Only PDF files are allowed');
      }

      const maxSize =
        FILE_SIZE_LIMITS[userPlan as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.FREE;
      if (file.size > maxSize) {
        throw ApiError.badRequest(
          `File size exceeds limit. Maximum allowed: ${Math.round(maxSize / (1024 * 1024))}MB for ${userPlan} plan`
        );
      }

      logger.info('Document upload initiated', {
        userId,
        userPlan,
        fileName: file.originalname,
        fileSize: file.size,
        fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      });

      const uploadedFile = {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname || 'file',
        encoding: file.encoding || '7bit',
      };

      const uploadResult = await fileUploadService.uploadFile(uploadedFile, userId, 'documents');

      logger.success('File uploaded to S3', {
        userId,
        fileKey: uploadResult.fileKey,
        fileUrl: uploadResult.fileUrl,
      });

      const document = await documentManagerService.createDocument({
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        fileUrl: uploadResult.fileUrl,
        fileKey: uploadResult.fileKey,
      });

      this.processDocument(document.id, userId, file.buffer);

      logger.info('Document created successfully', {
        userId,
        documentId: document.id,
        status: document.status,
      });

      res.status(202).json({
        success: true,
        message: 'Document upload initiated. Processing will complete shortly.',
        data: {
          documentId: document.id,
          fileName: document.fileName,
          status: document.status,
          estimatedProcessingTime: '1-2 minutes',
        },
      });
    }
  );

  /**
   * 📋 GET DOCUMENTS
   * GET /api/documents
   */
  public getDocuments = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const query = req.query as GetDocumentsQuery;

      const page = Math.max(1, parseInt(query.page || '1'));
      const requestedLimit = parseInt(query.limit || String(DEFAULT_PAGE_SIZE));
      const limit = Math.min(requestedLimit, MAX_PAGINATION_LIMIT);
      const offset = (page - 1) * limit;

      const search = query.search?.trim();
      const sortBy = query.sortBy || 'createdAt';
      const sortOrder = query.sortOrder || 'desc';

      logger.debug('Fetching user documents', {
        userId,
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        status: query.status,
      });

      const filterOptions: DocumentFilterOptions = {
        userId,
        limit,
        offset,
      };

      if (query.status) {
        filterOptions.status = query.status as DocumentStatus;
      }

      if (search) {
        filterOptions.search = search;
      }

      filterOptions.sortBy = sortBy;
      filterOptions.sortOrder = sortOrder;

      const documents = await documentManagerService.listDocuments(filterOptions);
      const total = await documentManagerService.getUserDocumentCount(userId);

      logger.info('Documents fetched successfully', {
        userId,
        count: documents.length,
        total,
        page,
        hasSearch: !!search,
      });

      res.status(200).json({
        success: true,
        data: {
          documents,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
          },
          filters: {
            search: search || null,
            status: query.status || null,
            sortBy,
            sortOrder,
          },
        },
      });
    }
  );

  /**
   * 📊 GET USER STATS
   * GET /api/documents/stats
   */
  public getUserStats = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching user document stats', { userId });

      const stats = await documentManagerService.getUserStats(userId);

      logger.info('User stats fetched successfully', {
        userId,
        totalDocuments: stats.totalDocuments,
        readyDocuments: stats.readyDocuments,
      });

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  /**
   * 📊 GET INTELLIGENCE USAGE STATS
   * GET /api/documents/intelligence/usage
   */
  public getIntelligenceUsage = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching intelligence usage stats', { userId });

      const stats = await documentIntelligenceService.getUsageStatistics(userId);

      logger.info('Intelligence usage stats fetched', {
        userId,
        documentsUsed: stats.usage.documents.used,
        operationsUsed: stats.usage.operations.used,
      });

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  /**
   * 📄 GET DOCUMENT BY ID
   * GET /api/documents/:id
   */
  public getDocumentById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const documentId = req.params.id;

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching document by ID', { userId, documentId });

      const document = await documentManagerService.getDocumentById(documentId, userId);

      if (!document) {
        throw ApiError.notFound('Document not found');
      }

      let downloadUrl: string | null = null;
      if (document.status === 'READY' && document.fileUrl) {
        try {
          downloadUrl = await fileUploadService.getFileUrl(document.fileUrl);
          logger.debug('Download URL generated', { userId, documentId });
        } catch (error) {
          logger.error('Failed to generate download URL', error, {
            userId,
            documentId,
            fileUrl: document.fileUrl,
          });
          downloadUrl = null;
        }
      }

      logger.info('Document fetched successfully', {
        userId,
        documentId,
        status: document.status,
        hasDownloadUrl: !!downloadUrl,
      });

      res.status(200).json({
        success: true,
        data: {
          ...document,
          downloadUrl,
        },
      });
    }
  );

  /**
   * 🎯 PERFORM INTELLIGENCE OPERATION
   * POST /api/documents/:id/intelligence/operate
   */
  public performIntelligenceOperation = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const documentId = req.params.id;
      const { operationType, options = {} } = req.body as PerformOperationBody;

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      if (!operationType) {
        throw ApiError.badRequest('operationType is required');
      }

      logger.info('Intelligence operation initiated', {
        userId,
        documentId,
        operationType,
        hasOptions: Object.keys(options).length > 0,
      });

      const document = await documentManagerService.getDocumentById(documentId, userId);

      if (!document) {
        throw ApiError.notFound('Document not found');
      }

      if (document.status !== 'READY') {
        throw ApiError.badRequest(
          `Document is ${document.status.toLowerCase()}. Please wait for processing to complete.`
        );
      }

      const result = await documentIntelligenceService.performOperation({
        documentId,
        userId,
        operationType: operationType as any,
        options,
      });

      logger.success('Intelligence operation completed', {
        userId,
        documentId,
        operationType,
        operationId: result.operation.id,
        tokensUsed: result.operation.tokensUsed,
        cost: result.operation.cost,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  /**
   * 📜 GET OPERATION RESULT
   * GET /api/documents/intelligence/operations/:operationId
   */
  public getOperationResult = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const operationId = req.params.operationId;

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching operation result', { userId, operationId });

      const operation = await documentIntelligenceService.getOperationResult(operationId, userId);

      logger.info('Operation result fetched', {
        userId,
        operationId,
        status: operation.status,
      });

      res.status(200).json({
        success: true,
        data: operation,
      });
    }
  );

  /**
   * 📋 GET DOCUMENT OPERATIONS
   * GET /api/documents/:id/intelligence/operations
   */
  public getDocumentOperations = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const documentId = req.params.id;

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching document operations', { userId, documentId });

      const operations = await documentIntelligenceService.getDocumentOperations(
        documentId,
        userId
      );

      logger.info('Document operations fetched', {
        userId,
        documentId,
        count: operations.length,
      });

      res.status(200).json({
        success: true,
        data: {
          documentId,
          operations,
          total: operations.length,
        },
      });
    }
  );

  /**
   * ❓ QUERY DOCUMENT (RAG)
   * POST /api/documents/query
   */
  public queryDocument = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const { question, documentId, documentIds, topK = 5 } = req.body as QueryDocumentBody;

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      if (!question || question.trim().length === 0) {
        throw ApiError.badRequest('Question is required');
      }

      if (question.trim().length < 3) {
        throw ApiError.badRequest('Question must be at least 3 characters long');
      }

      if (!documentId && (!documentIds || documentIds.length === 0)) {
        throw ApiError.badRequest('Either documentId or documentIds must be provided');
      }

      if (documentIds && documentIds.length > MAX_MULTI_QUERY_DOCUMENTS) {
        throw ApiError.badRequest(
          `Maximum ${MAX_MULTI_QUERY_DOCUMENTS} documents can be queried at once`
        );
      }

      logger.info('Document query initiated', {
        userId,
        documentId,
        documentCount: documentIds?.length || 1,
        questionLength: question.trim().length,
        topK,
      });

      // SINGLE DOCUMENT QUERY
      if (documentId) {
        const document = await documentManagerService.getDocumentById(documentId, userId);

        if (!document) {
          throw ApiError.notFound('Document not found');
        }

        if (document.status !== 'READY') {
          throw ApiError.badRequest(
            `Document is ${document.status.toLowerCase()}. Please wait for processing to complete.`
          );
        }

        const result = await documentRAGService.queryDocument(question, {
          documentId,
          userId,
          topK,
        });

        await documentManagerService.incrementQueryCount(documentId);

        logger.success('Document query completed', {
          userId,
          documentId,
          wordsUsed: result.wordsUsed,
        });

        res.status(200).json({
          success: true,
          data: result,
        });
        return;
      }

      // MULTI-DOCUMENT QUERY
      if (documentIds && documentIds.length > 0) {
        const documents = await Promise.all(
          documentIds.map((id) => documentManagerService.getDocumentById(id, userId))
        );

        const missingDocs = documents.filter((doc) => !doc);
        if (missingDocs.length > 0) {
          throw ApiError.notFound('One or more documents not found');
        }

        const notReadyDocs = documents.filter((doc) => doc && doc.status !== 'READY');
        if (notReadyDocs.length > 0) {
          const notReadyNames = notReadyDocs
            .map((doc) => doc?.fileName)
            .filter(Boolean)
            .join(', ');

          throw ApiError.badRequest(
            `The following documents are not ready: ${notReadyNames}. Please wait for processing.`
          );
        }

        const result = await documentRAGService.multiDocumentQuery(question, {
          documentIds,
          userId,
          topK,
        });

        await Promise.all(documentIds.map((id) => documentManagerService.incrementQueryCount(id)));

        logger.success('Multi-document query completed', {
          userId,
          documentCount: documentIds.length,
          wordsUsed: result.wordsUsed,
        });

        res.status(200).json({
          success: true,
          data: result,
        });
      }
    }
  );

  /**
   * 🗑️ DELETE DOCUMENT
   * DELETE /api/documents/:id
   */
  public deleteDocument = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const documentId = req.params.id;

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.info('Document deletion initiated', { userId, documentId });

      const document = await documentManagerService.getDocumentById(documentId, userId);

      if (!document) {
        throw ApiError.notFound('Document not found');
      }

      if (document.status === 'READY') {
        try {
          await documentRAGService.deleteDocument(documentId, userId);
          logger.debug('Document removed from vector DB', { userId, documentId });
        } catch (error) {
          logger.error('Failed to remove from vector DB', error, { userId, documentId });
        }
      }

      await documentManagerService.deleteDocument(documentId, userId);

      logger.success('Document deleted successfully', {
        userId,
        documentId,
        fileName: document.fileName,
      });

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
        data: {
          documentId,
          fileName: document.fileName,
        },
      });
    }
  );

  /**
   * 🔄 UPDATE DOCUMENT
   * PATCH /api/documents/:id
   */
  public updateDocument = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const documentId = req.params.id;
      const { fileName } = req.body;

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      if (!fileName || fileName.trim().length === 0) {
        throw ApiError.badRequest('fileName is required');
      }

      if (fileName.trim().length > 255) {
        throw ApiError.badRequest('fileName must be less than 255 characters');
      }

      logger.info('Document update initiated', { userId, documentId, newFileName: fileName });

      const document = await documentManagerService.getDocumentById(documentId, userId);

      if (!document) {
        throw ApiError.notFound('Document not found');
      }

      const updates: DocumentUpdateData = {
        fileName: fileName.trim(),
      };

      const updatedDocument = await documentManagerService.updateDocument(
        documentId,
        userId,
        updates
      );

      logger.success('Document updated successfully', {
        userId,
        documentId,
        oldFileName: document.fileName,
        newFileName: updatedDocument.fileName,
      });

      res.status(200).json({
        success: true,
        message: 'Document updated successfully',
        data: updatedDocument,
      });
    }
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💳 SMART DOCS CREDIT METHODS (NEW!)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 💳 GET SMART DOCS CREDITS
   * GET /api/documents/smart-docs/credits
   */
  public getSmartDocsCredits = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching Smart Docs credits', { userId });

      const balance = await docsCreditService.getCreditBalance(userId);

      logger.info('Smart Docs credits fetched', {
        userId,
        totalAvailable: balance.totalAvailable,
        percentageUsed: balance.percentageUsed,
      });

      res.status(200).json({
        success: true,
        data: balance,
      });
    }
  );

  /**
   * 📊 GET SMART DOCS SUMMARY (Dashboard)
   * GET /api/documents/smart-docs/summary
   */
  public getSmartDocsSummary = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching Smart Docs summary', { userId });

      const summary = await docsCreditService.getCreditSummary(userId);

      logger.info('Smart Docs summary fetched', {
        userId,
        plan: summary.plan,
        totalAvailable: summary.balance.totalAvailable,
      });

      res.status(200).json({
        success: true,
        data: summary,
      });
    }
  );

  /**
   * 📋 GET SMART DOCS FEATURES
   * GET /api/documents/smart-docs/features
   */
  public getSmartDocsFeatures = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const userPlan = this.planToMinimumPlan(this.getUserPlan(req));
      const region = this.getUserRegion(req);

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching Smart Docs features', { userId, userPlan, region });

      const balance = await docsCreditService.getCreditBalance(userId);
      const affordableOps = await docsCreditService.getAffordableOperations(userId, region);

      const features = SMART_DOCS_OPERATIONS.map(op => {
        const config = getSmartDocsConfig(op, region);
        const hasAccess = canAccessSmartDocsFeature(userPlan, op);
        const canAfford = affordableOps.includes(op);

        let lockReason: string | null = null;
        if (!hasAccess) {
          lockReason = `Upgrade to ${config.minimumPlan} to unlock`;
        } else if (!canAfford) {
          if (balance.dailyRemaining < config.credits) {
            lockReason = 'Daily limit reached';
          } else {
            lockReason = 'Insufficient credits';
          }
        }

        return {
          id: op,
          name: config.displayName,
          description: config.description,
          category: config.category,
          credits: config.credits,
          minimumPlan: config.minimumPlan,
          model: config.model,
          provider: config.provider,
          maxOutputTokens: config.maxOutputTokens,
          tokens: config.tokens,
          isLocked: !hasAccess || !canAfford,
          hasAccess,
          canAfford,
          lockReason,
          runsAvailable: hasAccess 
            ? Math.min(
                Math.floor(balance.totalAvailable / config.credits),
                Math.floor(balance.dailyRemaining / config.credits)
              )
            : 0,
        };
      });

      // Group by minimumPlan instead of tier
      const byPlan = {
        STARTER: features.filter(f => f.minimumPlan === 'STARTER'),
        PLUS: features.filter(f => f.minimumPlan === 'PLUS'),
        PRO: features.filter(f => f.minimumPlan === 'PRO'),
        APEX: features.filter(f => f.minimumPlan === 'APEX'),
      };

      const byCategory = features.reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
      }, {} as Record<string, typeof features>);

      logger.info('Smart Docs features fetched', {
        userId,
        total: features.length,
        unlocked: features.filter(f => f.hasAccess).length,
        affordable: features.filter(f => f.canAfford).length,
      });

      res.status(200).json({
        success: true,
        data: {
          features,
          byPlan,
          byCategory,
          summary: {
            total: features.length,
            unlocked: features.filter(f => f.hasAccess).length,
            affordable: features.filter(f => f.canAfford).length,
            locked: features.filter(f => f.isLocked).length,
          },
          userPlan,
          balance,
        },
      });
    }
  );

  /**
   * ✅ CHECK SMART DOCS OPERATION
   * POST /api/documents/smart-docs/check-operation
   */
  public checkSmartDocsOperation = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const { operation } = req.body;
      const region = this.getUserRegion(req);

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      if (!operation) {
        throw ApiError.badRequest('Operation is required');
      }

      logger.debug('Checking Smart Docs operation', { userId, operation });

      const result = await docsCreditService.canPerformOperation(userId, operation, region);
      const config = getSmartDocsConfig(operation, region);

      logger.info('Smart Docs operation check completed', {
        userId,
        operation,
        canProceed: result.canProceed,
      });

      res.status(200).json({
        success: true,
        data: {
          ...result,
          operation,
          operationName: config.displayName,
          creditCost: config.credits,
          minimumPlan: config.minimumPlan,
        },
      });
    }
  );

  /**
   * 📊 GET SMART DOCS USAGE
   * GET /api/documents/smart-docs/usage
   */
  public getSmartDocsUsage = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const period = (req.query.period as 'day' | 'week' | 'month') || 'month';

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching Smart Docs usage', { userId, period });

      const stats = await docsCreditService.getUsageStats(userId, period);

      logger.info('Smart Docs usage fetched', {
        userId,
        period,
        totalCreditsUsed: stats.totalCreditsUsed,
      });

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  /**
   * 🛒 GET SMART DOCS PACKS
   * GET /api/documents/smart-docs/packs
   */
  public getSmartDocsPacks = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching Smart Docs packs', { userId });

      const packs = await docsCreditService.getAvailableBoosters(userId);

      logger.info('Smart Docs packs fetched', {
        userId,
        available: packs.available,
        packCount: packs.packs.length,
        region: packs.region,
      });

      res.status(200).json({
        success: true,
        data: packs,
      });
    }
  );

  /**
   * 🛒 PURCHASE SMART DOCS PACK
   * POST /api/documents/smart-docs/purchase-pack
   */
  public purchaseSmartDocsPack = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const { packId } = req.body;

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      if (!packId) {
        throw ApiError.badRequest('packId is required');
      }

      logger.info('Smart Docs pack purchase initiated', { userId, packId });

      const result = await docsCreditService.purchaseBooster(userId, packId);

      if (!result.success) {
        throw ApiError.badRequest(result.error || 'Pack purchase failed');
      }

      logger.success('Smart Docs pack purchased', {
        userId,
        packId,
        creditsAdded: result.creditsAdded,
        newTotal: result.newBalance.totalAvailable,
      });

      res.status(200).json({
        success: true,
        message: `Successfully purchased ${result.creditsAdded} credits!`,
        data: result,
      });
    }
  );

  /**
   * 🎯 GET AFFORDABLE SMART DOCS OPERATIONS
   * GET /api/documents/smart-docs/affordable
   */
  public getAffordableSmartDocsOps = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = this.getUserId(req);
      const region = this.getUserRegion(req);

      if (!userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      logger.debug('Fetching affordable Smart Docs operations', { userId });

      const operations = await docsCreditService.getAffordableOperations(userId, region);

      const operationsWithDetails = operations.map(op => {
        const config = getSmartDocsConfig(op, region);
        return {
          id: op,
          name: config.displayName,
          credits: config.credits,
          minimumPlan: config.minimumPlan,
          category: config.category,
        };
      });

      logger.info('Affordable Smart Docs operations fetched', {
        userId,
        count: operations.length,
      });

      res.status(200).json({
        success: true,
        data: {
          operations: operationsWithDetails,
          count: operations.length,
        },
      });
    }
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIVATE METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 🔧 BACKGROUND: Process Document
   */
  private processDocument = async (
    documentId: string,
    userId: string,
    fileBuffer: Buffer
  ): Promise<void> => {
    try {
      logger.info('Starting document processing', { documentId, userId });

      await documentManagerService.updateStatus(documentId, DocumentStatus.PROCESSING);
      await documentRAGService.indexDocument(documentId, fileBuffer, userId);

      logger.success('Document processed successfully', { documentId, userId });
    } catch (error: unknown) {
      logger.error('Document processing failed', error, { documentId, userId });

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error during processing';

      await documentManagerService.updateStatus(documentId, DocumentStatus.FAILED, errorMessage);
    }
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default DocumentController.getInstance();