// src/modules/document/services/document-intelligence.service.ts

/**
 * ==========================================
 * DOCUMENT INTELLIGENCE SERVICE (Main Orchestrator)
 * ==========================================
 * Created: November 23, 2025
 * Updated: December 23, 2025 - Smart Docs Credit Integration
 * 
 * This is the main service that orchestrates:
 * - Document uploads
 * - Usage tracking
 * - Operation execution
 * - Limits enforcement
 * - Smart Docs credit system
 */

import { prisma } from '@/config/prisma';
import documentUsageService from './document-usage.service';
import documentOperationsService from './document-operations.service';
import { DOCUMENT_STATUS } from '@/constants/documentLimits';
import {
  DocumentUploadRequest,
  DocumentUploadResponse,
  DocumentOperationRequest,
  DocumentOperationResponse,
  DocumentListQuery,
  DocumentListResponse,
  UsageStatsResponse,
  DocumentIntelligenceError,
  ERROR_CODES,
} from '../interfaces/document-intelligence.types';
import { OperationStatus } from '@prisma/client';
import docsCreditService from './docs-credit.service';
import { 
  SMART_DOCS_OPERATIONS,
  getSmartDocsConfig,
  canAccessSmartDocsFeature,
  type SmartDocsOperation,
  type MinimumPlan,
  type RegionCode,
} from '@/constants/smart-docs';

export class DocumentIntelligenceService {
  /**
   * Upload document with usage tracking
   */
  async uploadDocument(request: DocumentUploadRequest): Promise<DocumentUploadResponse> {
    const { file, userId, metadata } = request;

    try {
      // Check if user can upload
      const canUpload = await documentUsageService.canUploadDocument(userId, file.size);
      
      if (!canUpload.canProceed) {
        throw new DocumentIntelligenceError(
          canUpload.errorMessage || 'Upload not allowed',
          canUpload.errorCode || ERROR_CODES.DOCUMENT_LIMIT_REACHED,
          403
        );
      }

      // Determine file type
      let fileType = 'TXT';
      if (file.mimetype.includes('pdf')) {
        fileType = 'PDF';
      } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
        fileType = 'DOCX';
      } else if (file.mimetype.includes('image')) {
        fileType = 'IMAGE';
      }

      // Create document record
      const document = await prisma.document.create({
        data: {
          userId,
          filename: file.filename,
          originalName: file.originalname,
          fileType,
          fileSize: file.size,
          mimeType: file.mimetype,
          storageUrl: file.path,
          storageProvider: 'local',
          status: DOCUMENT_STATUS.PENDING,
          title: metadata?.title,
          description: metadata?.description,
          tags: metadata?.tags || [],
        },
      });

      // Track upload
      await documentUsageService.trackDocumentUpload(userId, file.size);

      // Get updated usage
      const usage = await documentUsageService.getUsageStats(userId);

      return {
        success: true,
        document: {
          id: document.id,
          filename: document.filename,
          originalName: document.originalName,
          fileSize: document.fileSize,
          fileType: document.fileType,
          mimeType: document.mimeType,
          status: document.status,
          pageCount: document.pageCount || undefined,
          wordCount: document.wordCount || undefined,
          uploadedAt: document.uploadedAt,
        },
        usage: {
          documentsUsed: usage.current.documents,
          documentsLimit: usage.limits.documents,
          documentsRemaining: usage.remaining.documents,
          storageUsed: usage.current.storage,
          storageLimit: usage.limits.storage,
        },
      };
    } catch (error) {
      if (error instanceof DocumentIntelligenceError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Upload failed';
      throw new DocumentIntelligenceError(message, ERROR_CODES.OPERATION_FAILED, 500);
    }
  }

  /**
   * Check if operation is a valid Smart Docs operation
   */
  private isSmartDocsOperation(operationType: string): operationType is SmartDocsOperation {
    return SMART_DOCS_OPERATIONS.includes(operationType as SmartDocsOperation);
  }

  /**
   * Perform operation on document
   * Updated: December 23, 2025 - Credit System Integration
   */
  async performOperation(
    request: DocumentOperationRequest
  ): Promise<DocumentOperationResponse> {
    const { documentId, userId, operationType, options } = request;

    try {
      // ==========================================
      // STEP 1: Check Smart Docs Credits
      // ==========================================
      if (this.isSmartDocsOperation(operationType)) {
        const creditCheck = await docsCreditService.canPerformOperation(
          userId, 
          operationType
        );
        
        if (!creditCheck.canProceed) {
          throw new DocumentIntelligenceError(
            creditCheck.error || 'Insufficient credits or feature locked',
            creditCheck.errorCode || ERROR_CODES.OPERATION_NOT_ALLOWED,
            403,
            {
              creditsRequired: creditCheck.creditsRequired,
              creditsAvailable: creditCheck.creditsAvailable,
              upgradeRequired: creditCheck.upgradeRequired,
              suggestedPlan: creditCheck.suggestedPlan,
            }
          );
        }
      }

      // ==========================================
      // STEP 2: Legacy usage check (backward compatibility)
      // ==========================================
      const canOperate = await documentUsageService.canPerformOperation(userId, operationType);
      
      if (!canOperate.canProceed) {
        throw new DocumentIntelligenceError(
          canOperate.errorMessage || 'Operation not allowed',
          canOperate.errorCode || ERROR_CODES.OPERATION_NOT_ALLOWED,
          403
        );
      }

      // ==========================================
      // STEP 3: Deduct credits BEFORE execution
      // ==========================================
      let creditDeduction = null;
      if (this.isSmartDocsOperation(operationType)) {
        creditDeduction = await docsCreditService.deductCredits(
          userId, 
          operationType, 
          documentId
          );
        
        if (!creditDeduction.success) {
          throw new DocumentIntelligenceError(
            creditDeduction.error || 'Failed to deduct credits',
            creditDeduction.errorCode || ERROR_CODES.OPERATION_FAILED,
            400
          );
        }
      }

      // ==========================================
      // STEP 4: Execute operation
      // ==========================================
      const result = await documentOperationsService.executeOperation(request);

      // ==========================================
      // STEP 5: Add credit info to response
      // ==========================================
      if (creditDeduction) {
        return {
          ...result,
          creditInfo: {
            creditsDeducted: creditDeduction.creditsDeducted,
            creditsRemaining: creditDeduction.balanceAfter.totalAvailable,
            dailyRemaining: creditDeduction.balanceAfter.dailyRemaining,
          },
        } as DocumentOperationResponse;
      }

      return result;
    } catch (error) {
      if (error instanceof DocumentIntelligenceError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Operation failed';
      throw new DocumentIntelligenceError(message, ERROR_CODES.OPERATION_FAILED, 500);
    }
  }

  /**
   * Get user's documents with pagination
   */
  async listDocuments(query: DocumentListQuery): Promise<DocumentListResponse> {
    const {
      userId,
      page = 1,
      limit = 20,
      sortBy = 'uploadedAt',
      sortOrder = 'desc',
      status,
      search,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      userId: string;
      status: string;
      OR?: Array<{ filename: { contains: string; mode: 'insensitive' } } | { originalName: { contains: string; mode: 'insensitive' } }>;
    } = {
      userId,
      status: status || DOCUMENT_STATUS.ACTIVE,
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          filename: true,
          originalName: true,
          fileSize: true,
          fileType: true,
          status: true,
          wordCount: true,
          pageCount: true,
          uploadedAt: true,
          _count: {
            select: {
              operations: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      documents: documents.map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        status: doc.status,
        wordCount: doc.wordCount || undefined,
        pageCount: doc.pageCount || undefined,
        uploadedAt: doc.uploadedAt,
        operationCount: doc._count.operations,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get document by ID with operations
   */
  async getDocument(documentId: string, userId: string) {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
      include: {
        operations: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          select: {
            id: true,
            operationType: true,
            operationName: true,
            category: true,
            status: true,
            resultPreview: true,
            processingTime: true,
            totalTokens: true,
            cost: true,
            createdAt: true,
          },
        },
      },
    });

    if (!document) {
      throw new DocumentIntelligenceError(
        'Document not found',
        ERROR_CODES.DOCUMENT_NOT_FOUND,
        404
      );
    }

    return {
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      fileSize: document.fileSize,
      fileType: document.fileType,
      mimeType: document.mimeType,
      status: document.status,
      storageUrl: document.storageUrl,
      pageCount: document.pageCount,
      wordCount: document.wordCount,
      textContent: document.textContent,
      uploadedAt: document.uploadedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      operations: document.operations.map(op => ({
        id: op.id,
        operationType: op.operationType,
        operationName: op.operationName,
        category: op.category,
        status: op.status,
        resultPreview: op.resultPreview,
        processingTime: op.processingTime,
        tokensUsed: op.totalTokens,
        cost: op.cost,
        createdAt: op.createdAt,
      })),
    };
  }

  /**
   * Delete document (soft delete)
   */
  async deleteDocument(documentId: string, userId: string) {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      throw new DocumentIntelligenceError(
        'Document not found',
        ERROR_CODES.DOCUMENT_NOT_FOUND,
        404
      );
    }

    // Soft delete - update status to deleted
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DOCUMENT_STATUS.DELETED,
      },
    });

    // Update storage usage
    await documentUsageService.trackDocumentDeletion(userId, document.fileSize);

    return { success: true, message: 'Document deleted successfully' };
  }

  /**
   * Get usage statistics
   */
  async getUsageStatistics(userId: string): Promise<UsageStatsResponse> {
    const usage = await documentUsageService.getUsageStats(userId);
    const isPaidUser = await documentUsageService.isPaidUser(userId);

    // Get top operations
    const topOperations = await prisma.documentOperation.groupBy({
      by: ['operationType'],
      where: {
        userId,
        status: OperationStatus.SUCCESS,
      },
      _count: {
        operationType: true,
      },
      _sum: {
        cost: true,
      },
      orderBy: {
        _count: {
          operationType: 'desc',
        },
      },
      take: 5,
    });

    // Get recent documents
    const recentDocuments = await prisma.document.findMany({
      where: {
        userId,
        status: DOCUMENT_STATUS.ACTIVE,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        filename: true,
        uploadedAt: true,
        _count: {
          select: {
            operations: true,
          },
        },
      },
    });

    // Get recent operations
    const recentOperations = await prisma.documentOperation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        operationType: true,
        status: true,
        createdAt: true,
        document: {
          select: { filename: true },
        },
      },
    });

    // Calculate percentages safely
    const docsPercentage = usage.limits.documents > 0 
      ? Math.round((usage.current.documents / usage.limits.documents) * 100)
      : 0;
    
    const opsPercentage = usage.limits.operations > 0 && usage.limits.operations !== -1
      ? Math.round((usage.current.operations / usage.limits.operations) * 100)
      : 0;
    
    const storagePercentage = usage.limits.storage > 0
      ? Math.round((usage.current.storage / usage.limits.storage) * 100)
      : 0;

    // Get cost data
    const usageRecord = await prisma.documentUsage.findUnique({
      where: { userId },
    });
    const costThisMonth = usageRecord?.costThisMonth || 0;
    const avgCost = usage.current.operations > 0 
      ? costThisMonth / usage.current.operations 
      : 0;

    return {
      period: 'month',
      isPaidUser,
      usage: {
        documents: {
          used: usage.current.documents,
          usedThisMonth: usage.current.documents,
          limit: usage.limits.documents,
          limitPerMonth: usage.limits.documents,
          percentage: docsPercentage,
        },
        operations: {
          used: usage.current.operations,
          usedThisMonth: usage.current.operations,
          limit: usage.limits.operations,
          limitPerMonth: usage.limits.operations,
          percentage: opsPercentage,
        },
        storage: {
          used: usage.current.storage,
          limit: usage.limits.storage,
          percentage: storagePercentage,
        },
        cost: {
          thisMonth: Math.round(costThisMonth * 100) / 100,
          average: Math.round(avgCost * 100) / 100,
        },
      },
      topOperations: topOperations.map((op) => ({
        type: op.operationType,
        operationType: op.operationType,
        count: op._count.operationType,
        totalCost: op._sum.cost || 0,
      })),
      recentDocuments: recentDocuments.map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        uploadedAt: doc.uploadedAt,
        operationCount: doc._count.operations,
      })),
      recentOperations: recentOperations.map((op) => ({
        id: op.id,
        operationType: op.operationType,
        documentName: op.document?.filename || 'Unknown',
        status: op.status,
        createdAt: op.createdAt,
      })),
    };
  }

  /**
   * Get operation result
   */
  async getOperationResult(operationId: string, userId: string) {
    return documentOperationsService.getOperation(operationId, userId);
  }

  /**
   * Get all operations for document
   */
  async getDocumentOperations(documentId: string, userId: string) {
    return documentOperationsService.getDocumentOperations(documentId, userId);
  }

  /**
   * Archive document
   */
  async archiveDocument(documentId: string, userId: string) {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new DocumentIntelligenceError(
        'Document not found',
        ERROR_CODES.DOCUMENT_NOT_FOUND,
        404
      );
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: DOCUMENT_STATUS.ARCHIVED },
    });

    return { success: true, message: 'Document archived successfully' };
  }

  /**
   * Restore archived document
   */
  async restoreDocument(documentId: string, userId: string) {
    const document = await prisma.document.findFirst({
      where: { 
        id: documentId, 
        userId,
        status: DOCUMENT_STATUS.ARCHIVED,
      },
    });

    if (!document) {
      throw new DocumentIntelligenceError(
        'Archived document not found',
        ERROR_CODES.DOCUMENT_NOT_FOUND,
        404
      );
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: DOCUMENT_STATUS.ACTIVE },
    });

    return { success: true, message: 'Document restored successfully' };
  }

  // ==========================================
  // SMART DOCS CREDIT METHODS
  // ==========================================

  /**
   * Helper: Get user's current plan
   */
  private async getUserPlan(userId: string): Promise<MinimumPlan> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    });
    
    return (user?.planType?.toUpperCase() || 'STARTER') as MinimumPlan;
  }

  /**
   * Get user's Smart Docs credit balance
   */
  async getCreditBalance(userId: string) {
    return docsCreditService.getCreditBalance(userId);
  }

  /**
   * Get credit summary for dashboard
   */
  async getCreditSummary(userId: string) {
    return docsCreditService.getCreditSummary(userId);
  }

  /**
   * Get available features for user's plan
   * Uses new smart-docs.ts config
   */
  async getAvailableFeatures(userId: string, region: RegionCode = 'IN') {
    const userPlan = await this.getUserPlan(userId);
    const balance = await docsCreditService.getCreditBalance(userId);
    
    return SMART_DOCS_OPERATIONS
      .filter(op => {
        const config = getSmartDocsConfig(op, region);
        return canAccessSmartDocsFeature(userPlan, op) && balance.totalAvailable >= config.credits;
      })
      .map(op => {
        const config = getSmartDocsConfig(op, region);
        return {
          id: op,
          name: config.displayName,
          description: config.description,
          creditCost: config.credits,
          tokenCost: config.tokens,
          category: config.category,
          model: config.model,
        };
      });
  }

  /**
   * Get all features with lock status
   * Uses new smart-docs.ts config
   */
  async getAllFeaturesWithStatus(userId: string, region: RegionCode = 'IN') {
    const balance = await docsCreditService.getCreditBalance(userId);
    const userPlan = await this.getUserPlan(userId);
    
    const allFeatures = SMART_DOCS_OPERATIONS.map(op => {
      const config = getSmartDocsConfig(op, region);
      const canAccess = canAccessSmartDocsFeature(userPlan, op);
      const canAfford = balance.totalAvailable >= config.credits;
      
      return {
        id: op,
        name: config.displayName,
        description: config.description,
        creditCost: config.credits,
        tokenCost: config.tokens,
        category: config.category,
        minimumPlan: config.minimumPlan,
        model: config.model,
        isLocked: !canAccess || !canAfford,
        lockReason: !canAccess 
          ? `Upgrade to ${config.minimumPlan} to unlock`
          : (!canAfford ? 'Insufficient credits' : null),
      };
    });

    return {
      features: allFeatures,
      balance,
      userPlan,
    };
  }

  /**
   * Purchase credit booster (standalone pack)
   */
  async purchaseBooster(userId: string, boosterId: string) {
    return docsCreditService.purchaseBooster(userId, boosterId);
  }

  /**
   * Get available boosters for user
   */
  async getAvailableBoosters(userId: string) {
    return docsCreditService.getAvailableBoosters(userId);
  }

  /**
   * Get credit usage statistics
   */
  async getCreditUsageStats(userId: string, period: 'day' | 'week' | 'month' = 'month') {
    return docsCreditService.getUsageStats(userId, period);
  }
}

export default new DocumentIntelligenceService();