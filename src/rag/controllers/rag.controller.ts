// src/rag/controllers/rag.controller.ts
// SORIVA Backend - RAG Controller (Ultimate Edition)
// Phase 3: Complete RAG API Endpoints - 10/10 Production Quality
// 100% Dynamic | Class-Based | Modular | Future-Proof | Secured | Request Tracking

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RAGService } from '../../services/rag.service';
import { AuthUser } from '../../core/ai/middlewares/admin.middleware';
import type {
  DocumentUploadOptions,
  DocumentQueryOptions,
  RAGError,
  DocumentValidationError,
  QueryValidationError,
  SecurityValidationError,
} from '../../services/rag.service';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CONFIGURATION (100% Dynamic - ENV Driven)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

interface ControllerConfiguration {
  enableDetailedErrors: boolean;
  enableRequestLogging: boolean;
  enablePerformanceTracking: boolean;
  maxUploadSize: number;
  allowedOrigins: string[];
  rateLimitWindow: number;
  rateLimitMax: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class ControllerConfigService {
  private static instance: ControllerConfigService;
  private config: ControllerConfiguration;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  public static getInstance(): ControllerConfigService {
    if (!ControllerConfigService.instance) {
      ControllerConfigService.instance = new ControllerConfigService();
    }
    return ControllerConfigService.instance;
  }

  private loadConfiguration(): ControllerConfiguration {
    return {
      enableDetailedErrors: process.env.RAG_DETAILED_ERRORS === 'true',
      enableRequestLogging: process.env.RAG_REQUEST_LOGGING !== 'false',
      enablePerformanceTracking: process.env.RAG_PERFORMANCE_TRACKING !== 'false',
      maxUploadSize: parseInt(process.env.RAG_MAX_UPLOAD_SIZE || '52428800', 10),
      allowedOrigins: (process.env.RAG_ALLOWED_ORIGINS || '*').split(','),
      rateLimitWindow: parseInt(process.env.RAG_RATE_LIMIT_WINDOW || '60000', 10),
      rateLimitMax: parseInt(process.env.RAG_RATE_LIMIT_MAX || '100', 10),
      logLevel: (process.env.RAG_LOG_LEVEL as any) || 'info',
    };
  }

  public get(): ControllerConfiguration {
    return this.config;
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * INTERFACES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

interface StandardResponse<T = any> {
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

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  requestId?: string;
}

interface RequestContext {
  requestId: string;
  userId?: string;
  endpoint: string;
  method: string;
  startTime: number;
  ip?: string;
  userAgent?: string;
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * LOGGER (Enhanced with Colors & Request Tracking)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class Logger {
  private static colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  };

  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  private static formatMessage(level: string, message: string, context?: RequestContext): string {
    const timestamp = this.getTimestamp();
    const reqId = context?.requestId ? `[${context.requestId.slice(0, 8)}]` : '';
    const userId = context?.userId ? `[User: ${context.userId.slice(0, 8)}]` : '';

    return `${timestamp} ${level} ${reqId}${userId} ${message}`;
  }

  public static info(message: string, context?: RequestContext): void {
    const config = ControllerConfigService.getInstance().get();
    if (config.logLevel === 'debug' || config.logLevel === 'info') {
      console.log(
        `${this.colors.cyan}${this.formatMessage('INFO', message, context)}${this.colors.reset}`
      );
    }
  }

  public static success(message: string, context?: RequestContext): void {
    const config = ControllerConfigService.getInstance().get();
    if (config.logLevel === 'debug' || config.logLevel === 'info') {
      console.log(
        `${this.colors.green}${this.formatMessage('SUCCESS', message, context)}${this.colors.reset}`
      );
    }
  }

  public static warn(message: string, context?: RequestContext): void {
    const config = ControllerConfigService.getInstance().get();
    if (config.logLevel !== 'error') {
      console.warn(
        `${this.colors.yellow}${this.formatMessage('WARN', message, context)}${this.colors.reset}`
      );
    }
  }

  public static error(message: string, error?: any, context?: RequestContext): void {
    console.error(
      `${this.colors.red}${this.formatMessage('ERROR', message, context)}${this.colors.reset}`
    );
    if (error) {
      console.error(`${this.colors.red}${error.stack || error}${this.colors.reset}`);
    }
  }

  public static debug(message: string, data?: any, context?: RequestContext): void {
    const config = ControllerConfigService.getInstance().get();
    if (config.logLevel === 'debug') {
      console.log(
        `${this.colors.dim}${this.formatMessage('DEBUG', message, context)}${this.colors.reset}`
      );
      if (data) {
        console.log(`${this.colors.dim}${JSON.stringify(data, null, 2)}${this.colors.reset}`);
      }
    }
  }

  public static request(req: Request, context: RequestContext): void {
    const config = ControllerConfigService.getInstance().get();
    if (config.enableRequestLogging) {
      this.info(`${this.colors.magenta}→ ${req.method} ${req.path}${this.colors.reset}`, context);
    }
  }

  public static response(
    statusCode: number,
    processingTime: number,
    context: RequestContext
  ): void {
    const config = ControllerConfigService.getInstance().get();
    if (config.enableRequestLogging) {
      const color = statusCode < 400 ? this.colors.green : this.colors.red;
      this.info(`${color}← ${statusCode} (${processingTime}ms)${this.colors.reset}`, context);
    }
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * PERFORMANCE TRACKER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class PerformanceTracker {
  private static thresholds = {
    fast: 100, // < 100ms
    normal: 500, // 100-500ms
    slow: 1000, // 500-1000ms
    verySlow: 5000, // > 5000ms
  };

  public static track(operation: string, duration: number, context: RequestContext): void {
    const config = ControllerConfigService.getInstance().get();
    if (!config.enablePerformanceTracking) return;

    let status: string;
    if (duration < this.thresholds.fast) {
      status = '⚡ FAST';
    } else if (duration < this.thresholds.normal) {
      status = '✅ NORMAL';
    } else if (duration < this.thresholds.slow) {
      status = '⚠️ SLOW';
    } else {
      status = '🐌 VERY SLOW';
    }

    Logger.debug(`${status} ${operation}: ${duration}ms`, undefined, context);
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RATE LIMITER (In-Memory - Simple Implementation)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class RateLimiter {
  private static requests: Map<string, number[]> = new Map();

  public static check(userId: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Filter out old requests outside the window
    const recentRequests = userRequests.filter((timestamp) => now - timestamp < windowMs);

    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup(windowMs);
    }

    return true;
  }

  private static cleanup(windowMs: number): void {
    const now = Date.now();
    for (const [userId, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter((ts) => now - ts < windowMs);
      if (recentRequests.length === 0) {
        this.requests.delete(userId);
      } else {
        this.requests.set(userId, recentRequests);
      }
    }
  }

  public static reset(userId: string): void {
    this.requests.delete(userId);
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * VALIDATION UTILITIES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class RequestValidator {
  /**
   * Validate document upload request
   */
  public static validateUploadRequest(body: any): void {
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
  }

  /**
   * Validate query request
   */
  public static validateQueryRequest(body: any): void {
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
  }

  /**
   * Validate pagination parameters
   */
  public static validatePagination(query: any): { limit: number; offset: number } {
    const limit = Math.min(parseInt(query.limit || '50', 10), 100);
    const offset = Math.max(parseInt(query.offset || '0', 10), 0);

    if (isNaN(limit) || isNaN(offset)) {
      throw new Error('Invalid pagination parameters');
    }

    return { limit, offset };
  }

  /**
   * Validate UUID
   */
  public static validateUUID(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid ID format');
    }
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RESPONSE FORMATTER
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

class ResponseFormatter {
  /**
   * Success response
   */
  public static success<T>(
    data: T,
    requestId: string,
    metadata?: Record<string, any>
  ): StandardResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        ...metadata,
      },
    };
  }

  /**
   * Error response
   */
  public static error(
    code: string,
    message: string,
    requestId: string,
    details?: any,
    statusCode: number = 500
  ): { response: StandardResponse; statusCode: number } {
    const config = ControllerConfigService.getInstance().get();

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
  }

  /**
   * Format RAG error
   */
  public static formatRAGError(
    error: any,
    requestId: string
  ): { response: StandardResponse; statusCode: number } {
    // Handle known RAG errors
    if (error.name === 'DocumentValidationError') {
      return this.error(error.code, error.message, requestId, error.details, 400);
    }
    if (error.name === 'QueryValidationError') {
      return this.error(error.code, error.message, requestId, error.details, 400);
    }
    if (error.name === 'SecurityValidationError') {
      return this.error(error.code, error.message, requestId, error.details, 403);
    }
    if (error.name === 'RAGError') {
      return this.error(
        error.code,
        error.message,
        requestId,
        error.details,
        error.statusCode || 500
      );
    }

    // Handle generic errors
    if (error.message) {
      return this.error('INTERNAL_ERROR', error.message, requestId, undefined, 500);
    }

    return this.error('UNKNOWN_ERROR', 'An unexpected error occurred', requestId, undefined, 500);
  }
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * REQUEST CONTEXT MIDDLEWARE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export function requestContextMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  req.requestId = uuidv4();
  next();
}

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MAIN RAG CONTROLLER (10/10 Production Quality - Ultimate Edition)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export class RAGController {
  private static instance: RAGController;
  private ragService: RAGService;
  private config: ControllerConfigService;

  private constructor() {
    this.ragService = RAGService.getInstance();
    this.config = ControllerConfigService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RAGController {
    if (!RAGController.instance) {
      RAGController.instance = new RAGController();
    }
    return RAGController.instance;
  }

  /**
   * Create request context
   */
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

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * DOCUMENT UPLOAD ENDPOINT
   * POST /api/rag/upload
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * DOCUMENT UPLOAD ENDPOINT
   * POST /api/rag/upload
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  public uploadDocument = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      // Validate authentication
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

      // Rate limiting
      if (
        !RateLimiter.check(
          req.user.userId,
          this.config.get().rateLimitMax,
          this.config.get().rateLimitWindow
        )
      ) {
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

      // ✅ FIX: Get file from multer (req.file instead of req.body.file)
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

      Logger.debug(
        'File uploaded via multer',
        {
          filename: uploadedFile.filename,
          originalname: uploadedFile.originalname,
          size: uploadedFile.size,
          mimetype: uploadedFile.mimetype,
          path: uploadedFile.path,
        },
        context
      );

      // ✅ FIX: Map multer file to expected format
      const uploadOptions: DocumentUploadOptions = {
        userId: req.user.userId,
        file: {
          filename: uploadedFile.filename,
          originalName: uploadedFile.originalname,
          fileType: uploadedFile.mimetype.split('/')[1] || 'unknown',
          fileSize: uploadedFile.size,
          mimeType: uploadedFile.mimetype,
          storageUrl: uploadedFile.path, // Local file path
          storageProvider: 'local',
          storageKey: uploadedFile.filename,
        },
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined,
        processingOptions: req.body.processingOptions
          ? JSON.parse(req.body.processingOptions)
          : undefined,
      };

      // Upload document
      Logger.info(`📤 Uploading document: ${uploadOptions.file.originalName}`, context);
      const result = await this.ragService.uploadDocument(uploadOptions);

      const processingTime = Date.now() - context.startTime;
      PerformanceTracker.track('Document Upload', processingTime, context);
      Logger.success(`Document uploaded successfully: ${result.documentId}`, context);

      // Send response
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

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * QUERY DOCUMENTS ENDPOINT
   * POST /api/rag/query
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  public queryDocuments = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      // Validate authentication
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

      // Rate limiting
      if (
        !RateLimiter.check(
          req.user.userId,
          this.config.get().rateLimitMax,
          this.config.get().rateLimitWindow
        )
      ) {
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

      // Validate request
      RequestValidator.validateQueryRequest(req.body);
      Logger.debug('Query request validated', { query: req.body.query }, context);

      // Prepare query options
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

      // Query documents
      Logger.info(`🔍 Querying documents: "${req.body.query.substring(0, 50)}..."`, context);
      const result = await this.ragService.queryDocuments(queryOptions);

      const processingTime = Date.now() - context.startTime;
      PerformanceTracker.track('Document Query', processingTime, context);
      Logger.success(`Query completed: ${result.chunks.length} results found`, context);

      // Send response
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

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * GET USER DOCUMENTS ENDPOINT
   * GET /api/rag/documents
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  public getUserDocuments = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      // Validate authentication
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

      // Validate pagination
      const { limit, offset } = RequestValidator.validatePagination(req.query);

      // Parse filters
      const status = req.query.status ? (req.query.status as string).split(',') : undefined;
      const fileType = req.query.fileType ? (req.query.fileType as string).split(',') : undefined;

      // Get documents
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

      // Send response
      const response = ResponseFormatter.success(
        {
          documents,
          pagination: {
            limit,
            offset,
            total: documents.length,
          },
        },
        context.requestId,
        {
          processingTime,
          userId: req.user.userId,
        }
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

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * GET DOCUMENT BY ID ENDPOINT
   * GET /api/rag/documents/:id
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  public getDocumentById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      // Validate authentication
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

      // Validate document ID
      const documentId = req.params.id;
      RequestValidator.validateUUID(documentId);

      // Get document
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

      // Send response
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

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * DELETE DOCUMENT ENDPOINT
   * DELETE /api/rag/documents/:id
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  public deleteDocument = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      // Validate authentication
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

      // Validate document ID
      const documentId = req.params.id;
      RequestValidator.validateUUID(documentId);

      // Delete document
      Logger.info(`🗑️ Deleting document: ${documentId}`, context);
      await this.ragService.deleteDocument(documentId, req.user.userId);

      const processingTime = Date.now() - context.startTime;
      Logger.success(`Document deleted: ${documentId}`, context);

      // Send response
      const response = ResponseFormatter.success(
        {
          documentId,
          deleted: true,
        },
        context.requestId,
        {
          processingTime,
          userId: req.user.userId,
        }
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

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * GET DOCUMENT STATISTICS ENDPOINT
   * GET /api/rag/stats
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  public getDocumentStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      // Validate authentication
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

      // Get statistics
      Logger.info('📊 Fetching document statistics', context);
      const stats = await this.ragService.getDocumentStats(req.user.userId);

      const processingTime = Date.now() - context.startTime;
      Logger.success('Statistics retrieved', context);

      // Send response
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

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * HEALTH CHECK ENDPOINT
   * GET /api/rag/health
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  public getHealthStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      // Get health status
      Logger.info('🏥 Health check', context);
      const health = await this.ragService.getHealthStatus();

      // Determine HTTP status code based on health
      const statusCode =
        health.status === 'healthy' ? 200 : health.status === 'degraded' ? 207 : 503;

      const processingTime = Date.now() - context.startTime;
      Logger.info(`Health status: ${health.status}`, context);

      // Send response
      const response = ResponseFormatter.success(health, context.requestId, {
        processingTime,
      });
      Logger.response(statusCode, processingTime, context);
      res.status(statusCode).json(response);
    } catch (error) {
      Logger.error('Health check error', error, context);
      const errorResponse = ResponseFormatter.formatRAGError(error, context.requestId);
      Logger.response(errorResponse.statusCode, Date.now() - context.startTime, context);
      res.status(errorResponse.statusCode).json(errorResponse.response);
    }
  };

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * GET CONFIGURATION ENDPOINT
   * GET /api/rag/config
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */

  public getConfiguration = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const context = this.createContext(req);
    Logger.request(req, context);

    try {
      // Validate authentication
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

      // Get configuration
      Logger.info('⚙️ Fetching RAG configuration', context);
      const config = this.ragService.getConfiguration();

      const processingTime = Date.now() - context.startTime;
      Logger.success('Configuration retrieved', context);

      // Send response
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

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EXPORT SINGLETON INSTANCE & MIDDLEWARE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

export default RAGController.getInstance();
