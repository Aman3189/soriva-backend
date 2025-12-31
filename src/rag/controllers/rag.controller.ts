// src/rag/controllers/rag.controller.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SORIVA Backend - RAG Controller (Clean Architecture)
// Pattern: CLASS-BASED (Controller)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RAGService } from '../services/rag.service';
import { AuthUser } from '../../core/ai/middlewares/admin.middleware';
import type { DocumentUploadOptions, DocumentQueryOptions } from '../services/rag.service';

// Config & Utils imports
import { getControllerConfig } from '../config/rag-controller.config';
import { Logger, RequestContext } from '../../shared/utils/logger.util';
import { PerformanceTracker } from '../../shared/utils/performance.util';
import { RateLimiter } from '../../shared/utils/rate-limiter.util';
import { RequestValidator } from '../../shared/utils/request-validator.util';
import { ResponseFormatter } from '../../shared/utils/response-formatter.util';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  requestId?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUEST CONTEXT MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function requestContextMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  req.requestId = uuidv4();
  next();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN RAG CONTROLLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class RAGController {
  private static instance: RAGController;
  private ragService: RAGService;

  private constructor() {
    this.ragService = RAGService.getInstance();
  }

  public static getInstance(): RAGController {
    if (!RAGController.instance) {
      RAGController.instance = new RAGController();
    }
    return RAGController.instance;
  }

  private createContext(req: AuthenticatedRequest): RequestContext {
    return {
      requestId: req.requestId || uuidv4(),
      userId: req.user?.userId,
      endpoint: req.path,
      method: req.method,
      startTime: Date.now(),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOCUMENT UPLOAD - POST /api/rag/upload
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public uploadDocument = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    const config = getControllerConfig();
    Logger.request(req, context);

    try {
      if (!req.user?.userId) {
        Logger.warn('Upload attempt without authentication', context);
        const errorResponse = ResponseFormatter.error(
          'UNAUTHORIZED',
          'Authentication required',
          context.requestId,
          undefined,
          401
        );
        Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      if (!RateLimiter.check(req.user.userId, config.rateLimitMax, config.rateLimitWindow)) {
        Logger.warn('Rate limit exceeded', context);
        const errorResponse = ResponseFormatter.error(
          'RATE_LIMIT_EXCEEDED',
          'Too many requests. Please try again later.',
          context.requestId,
          undefined,
          429
        );
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      const uploadedFile = (req as any).file;

      if (!uploadedFile) {
        Logger.warn('No file uploaded', context);
        const errorResponse = ResponseFormatter.error(
          'VALIDATION_ERROR',
          'No file uploaded',
          context.requestId,
          undefined,
          400
        );
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      Logger.debug('File uploaded via multer', {
        filename: uploadedFile.filename,
        originalname: uploadedFile.originalname,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype,
        path: uploadedFile.path,
      }, context);

      const uploadOptions: DocumentUploadOptions = {
        userId: req.user.userId,
        file: {
          filename: uploadedFile.filename,
          originalName: uploadedFile.originalname,
          fileType: uploadedFile.mimetype.split('/')[1] || 'unknown',
          fileSize: uploadedFile.size,
          mimeType: uploadedFile.mimetype,
          storageUrl: uploadedFile.path,
          storageProvider: 'local',
          storageKey: uploadedFile.filename,
        },
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined,
        processingOptions: req.body.processingOptions
          ? JSON.parse(req.body.processingOptions)
          : undefined,
      };

      Logger.info(`📤 Uploading document: ${uploadOptions.file.originalName}`, context);
      const result = await this.ragService.uploadDocument(uploadOptions);

      const processingTime = Date.now() - context.startTime;
      PerformanceTracker.track('Document Upload', processingTime, context);
      Logger.success(`Document uploaded successfully: ${result.documentId}`, context);

      const response = ResponseFormatter.success(result, context.requestId, {
        processingTime,
        userId: req.user.userId,
      });
      Logger.response(201, processingTime, context);
      res.status(201).json(response);
    } catch (error) {
      Logger.error('Upload error', error, context);
      const errorResponse = ResponseFormatter.formatRAGError(error, context.requestId);
      Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
      res.status(errorResponse.statusCode).json(errorResponse.response);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUERY DOCUMENTS - POST /api/rag/query
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public queryDocuments = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    const config = getControllerConfig();
    Logger.request(req, context);

    try {
      if (!req.user?.userId) {
        Logger.warn('Query attempt without authentication', context);
        const errorResponse = ResponseFormatter.error(
          'UNAUTHORIZED',
          'Authentication required',
          context.requestId,
          undefined,
          401
        );
        Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      if (!RateLimiter.check(req.user.userId, config.rateLimitMax, config.rateLimitWindow)) {
        Logger.warn('Rate limit exceeded', context);
        const errorResponse = ResponseFormatter.error(
          'RATE_LIMIT_EXCEEDED',
          'Too many requests. Please try again later.',
          context.requestId,
          undefined,
          429
        );
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      RequestValidator.validateQueryRequest(req.body);
      Logger.debug('Query request validated', { query: req.body.query }, context);

      const queryOptions: DocumentQueryOptions = {
        query: req.body.query,
        userId: req.user.userId,
        documentIds: req.body.documentIds,
        topK: req.body.topK ? parseInt(req.body.topK, 10) : undefined,
        threshold: req.body.threshold ? parseFloat(req.body.threshold) : undefined,
        filters: req.body.filters,
        includeMetadata: req.body.includeMetadata,
        includeChunks: req.body.includeChunks,
      };

      Logger.info(`🔍 Querying documents: "${req.body.query.substring(0, 50)}..."`, context);
      const result = await this.ragService.queryDocuments(queryOptions);

      const processingTime = Date.now() - context.startTime;
      PerformanceTracker.track('Document Query', processingTime, context);
      Logger.success(`Query completed: ${result.chunks.length} results found`, context);

      const response = ResponseFormatter.success(result, context.requestId, {
        processingTime,
        userId: req.user.userId,
      });
      Logger.response(200, processingTime, context);
      res.status(200).json(response);
    } catch (error) {
      Logger.error('Query error', error, context);
      const errorResponse = ResponseFormatter.formatRAGError(error, context.requestId);
      Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
      res.status(errorResponse.statusCode).json(errorResponse.response);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET USER DOCUMENTS - GET /api/rag/documents
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public getUserDocuments = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      if (!req.user?.userId) {
        const errorResponse = ResponseFormatter.error(
          'UNAUTHORIZED',
          'Authentication required',
          context.requestId,
          undefined,
          401
        );
        Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      const { limit, offset } = RequestValidator.validatePagination(req.query);
      const status = req.query.status ? (req.query.status as string).split(',') : undefined;
      const fileType = req.query.fileType ? (req.query.fileType as string).split(',') : undefined;

      Logger.info('📄 Fetching user documents', context);
      const documents = await this.ragService.getUserDocuments(req.user.userId, {
        status,
        fileType,
        limit,
        offset,
      });

      const processingTime = Date.now() - context.startTime;
      PerformanceTracker.track('Get Documents', processingTime, context);
      Logger.success(`Retrieved ${documents.length} documents`, context);

      const response = ResponseFormatter.success(
        {
          documents,
          pagination: { limit, offset, total: documents.length },
        },
        context.requestId,
        { processingTime, userId: req.user.userId }
      );
      Logger.response(200, processingTime, context);
      res.status(200).json(response);
    } catch (error) {
      Logger.error('Get documents error', error, context);
      const errorResponse = ResponseFormatter.formatRAGError(error, context.requestId);
      Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
      res.status(errorResponse.statusCode).json(errorResponse.response);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET DOCUMENT BY ID - GET /api/rag/documents/:id
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public getDocumentById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      if (!req.user?.userId) {
        const errorResponse = ResponseFormatter.error(
          'UNAUTHORIZED',
          'Authentication required',
          context.requestId,
          undefined,
          401
        );
        Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      const documentId = req.params.id;
      RequestValidator.validateUUID(documentId);

      Logger.info(`📄 Fetching document: ${documentId}`, context);
      const document = await this.ragService.getDocumentById(documentId, req.user.userId);

      if (!document) {
        Logger.warn(`Document not found: ${documentId}`, context);
        const errorResponse = ResponseFormatter.error(
          'NOT_FOUND',
          'Document not found',
          context.requestId,
          undefined,
          404
        );
        Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      const processingTime = Date.now() - context.startTime;
      Logger.success(`Document retrieved: ${documentId}`, context);

      const response = ResponseFormatter.success(document, context.requestId, {
        processingTime,
        userId: req.user.userId,
      });
      Logger.response(200, processingTime, context);
      res.status(200).json(response);
    } catch (error) {
      Logger.error('Get document by ID error', error, context);
      const errorResponse = ResponseFormatter.formatRAGError(error, context.requestId);
      Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
      res.status(errorResponse.statusCode).json(errorResponse.response);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DELETE DOCUMENT - DELETE /api/rag/documents/:id
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public deleteDocument = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      if (!req.user?.userId) {
        const errorResponse = ResponseFormatter.error(
          'UNAUTHORIZED',
          'Authentication required',
          context.requestId,
          undefined,
          401
        );
        Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      const documentId = req.params.id;
      RequestValidator.validateUUID(documentId);

      Logger.info(`🗑️ Deleting document: ${documentId}`, context);
      await this.ragService.deleteDocument(documentId, req.user.userId);

      const processingTime = Date.now() - context.startTime;
      Logger.success(`Document deleted: ${documentId}`, context);

      const response = ResponseFormatter.success(
        { documentId, deleted: true },
        context.requestId,
        { processingTime, userId: req.user.userId }
      );
      Logger.response(200, processingTime, context);
      res.status(200).json(response);
    } catch (error) {
      Logger.error('Delete document error', error, context);
      const errorResponse = ResponseFormatter.formatRAGError(error, context.requestId);
      Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
      res.status(errorResponse.statusCode).json(errorResponse.response);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET STATS - GET /api/rag/stats
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public getDocumentStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      if (!req.user?.userId) {
        const errorResponse = ResponseFormatter.error(
          'UNAUTHORIZED',
          'Authentication required',
          context.requestId,
          undefined,
          401
        );
        Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      Logger.info('📊 Fetching document statistics', context);
      const stats = await this.ragService.getDocumentStats(req.user.userId);

      const processingTime = Date.now() - context.startTime;
      Logger.success('Statistics retrieved', context);

      const response = ResponseFormatter.success(stats, context.requestId, {
        processingTime,
        userId: req.user.userId,
      });
      Logger.response(200, processingTime, context);
      res.status(200).json(response);
    } catch (error) {
      Logger.error('Get stats error', error, context);
      const errorResponse = ResponseFormatter.formatRAGError(error, context.requestId);
      Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
      res.status(errorResponse.statusCode).json(errorResponse.response);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HEALTH CHECK - GET /api/rag/health
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public getHealthStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      Logger.info('🏥 Health check', context);
      const health = await this.ragService.getHealthStatus();

      const statusCode =
        health.status === 'healthy' ? 200 : health.status === 'degraded' ? 207 : 503;

      const processingTime = Date.now() - context.startTime;
      Logger.info(`Health status: ${health.status}`, context);

      const response = ResponseFormatter.success(health, context.requestId, { processingTime });
      Logger.response(statusCode, processingTime, context);
      res.status(statusCode).json(response);
    } catch (error) {
      Logger.error('Health check error', error, context);
      const errorResponse = ResponseFormatter.formatRAGError(error, context.requestId);
      Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
      res.status(errorResponse.statusCode).json(errorResponse.response);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET CONFIG - GET /api/rag/config
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public getConfiguration = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      if (!req.user?.userId) {
        const errorResponse = ResponseFormatter.error(
          'UNAUTHORIZED',
          'Authentication required',
          context.requestId,
          undefined,
          401
        );
        Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
        res.status(errorResponse.statusCode).json(errorResponse.response);
        return;
      }

      Logger.info('⚙️ Fetching RAG configuration', context);
      const config = this.ragService.getConfiguration();

      const processingTime = Date.now() - context.startTime;
      Logger.success('Configuration retrieved', context);

      const response = ResponseFormatter.success(config, context.requestId, {
        processingTime,
        userId: req.user.userId,
      });
      Logger.response(200, processingTime, context);
      res.status(200).json(response);
    } catch (error) {
      Logger.error('Get config error', error, context);
      const errorResponse = ResponseFormatter.formatRAGError(error, context.requestId);
      Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
      res.status(errorResponse.statusCode).json(errorResponse.response);
    }
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default RAGController.getInstance();