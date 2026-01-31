/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA DOCUMENT MANAGER SERVICE v1.2 (FIXED)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created by: Amandeep, Punjab, India
 * Created: October 2025
 * Updated: January 31, 2026 - FIXED: Use 'documents' table
 *
 * FIX APPLIED:
 * Changed from prisma.userDocument to prisma.document
 * This ensures document-operations.service.ts can find documents
 *
 * FEATURES:
 * ✅ Document CRUD operations
 * ✅ Status tracking (uploading, processing, ready, failed)
 * ✅ Usage tracking (queries, word count)
 * ✅ Access control (user ownership)
 * ✅ Automatic cleanup
 * ✅ Integration with Prisma (shared instance)
 * ✅ Full TypeScript type safety
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { prisma } from '@/config/prisma';
import { Document } from '@prisma/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DocumentManagerConfig {
  maxDocumentsPerUser: number;
  autoDeleteAfterDays: number;
  maxFileSize: number;
}

const DOCUMENT_CONFIG: DocumentManagerConfig = {
  maxDocumentsPerUser: parseInt(process.env.MAX_DOCUMENTS_PER_USER || '50'),
  autoDeleteAfterDays: parseInt(process.env.DOCUMENT_AUTO_DELETE_DAYS || '90'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENUMS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

enum DocumentStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface CreateDocumentData {
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  fileKey: string;
}

interface UpdateDocumentData {
  status?: DocumentStatus;
  processedText?: string;
  pageCount?: number;
  wordCount?: number;
  ragDocumentId?: string;
  chunkCount?: number;
}

interface DocumentListOptions {
  userId: string;
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
}

interface DocumentStats {
  totalDocuments: number;
  readyDocuments: number;
  processingDocuments: number;
  failedDocuments: number;
  totalQueries: number;
  totalWords: number;
}

// Response interface to match what controller expects
interface DocumentResponse {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  status: string;
  processedText?: string | null;
  pageCount?: number | null;
  wordCount?: number | null;
  queryCount: number;
  uploadedAt: Date;
  processedAt?: Date | null;
  lastAccessedAt?: Date | null;
  ragDocumentId?: string | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Convert Document to Response format
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function toDocumentResponse(doc: Document): DocumentResponse {
  return {
    id: doc.id,
    userId: doc.userId,
    fileName: doc.originalName,
    fileSize: doc.fileSize,
    fileType: doc.fileType,
    fileUrl: doc.storageUrl,
    status: doc.status,
    processedText: doc.textContent,
    pageCount: doc.pageCount,
    wordCount: doc.wordCount,
    queryCount: doc.accessCount,
    uploadedAt: doc.uploadedAt,
    processedAt: doc.processedAt,
    lastAccessedAt: doc.lastAccessedAt,
    ragDocumentId: doc.ragDocumentId,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOCUMENT MANAGER SERVICE CLASS (SINGLETON)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DocumentManagerService {
  private static instance: DocumentManagerService;
  private config: DocumentManagerConfig;

  private constructor() {
    this.config = DOCUMENT_CONFIG;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DocumentManagerService {
    if (!DocumentManagerService.instance) {
      DocumentManagerService.instance = new DocumentManagerService();
    }
    return DocumentManagerService.instance;
  }

  /**
   * Create new document record
   * FIXED: Uses prisma.document instead of prisma.userDocument
   */
  public async createDocument(data: CreateDocumentData): Promise<DocumentResponse> {
    try {
      // Check user document limit
      const userDocCount = await this.getUserDocumentCount(data.userId);
      if (userDocCount >= this.config.maxDocumentsPerUser) {
        throw new Error(`Maximum document limit (${this.config.maxDocumentsPerUser}) reached`);
      }

      // Create document in 'documents' table
      const document = await prisma.document.create({
        data: {
          userId: data.userId,
          filename: data.fileName,
          originalName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType.includes('pdf') ? 'PDF' : 'OTHER',
          mimeType: data.fileType,
          storageUrl: data.fileUrl,
          storageKey: data.fileKey,
          storageProvider: 'cloudflare',
          status: DocumentStatus.UPLOADING,
          uploadedAt: new Date(),
        },
      });

      console.log(`✅ Document created in DB: ${document.id}`);
      return toDocumentResponse(document);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Create document error:', error);
      throw new Error(`Failed to create document: ${message}`);
    }
  }

  /**
   * Get document by ID
   * FIXED: Uses prisma.document
   */
  public async getDocumentById(documentId: string, userId: string): Promise<DocumentResponse> {
    try {
      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          userId,
        },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      return toDocumentResponse(document);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Get document error:', error);
      throw new Error(`Failed to get document: ${message}`);
    }
  }

  /**
   * List user documents
   * FIXED: Uses prisma.document
   */
  public async listDocuments(options: DocumentListOptions): Promise<DocumentResponse[]> {
    try {
      const { userId, status, limit = 20, offset = 0 } = options;

      const documents = await prisma.document.findMany({
        where: {
          userId,
          ...(status && { status }),
        },
        orderBy: {
          uploadedAt: 'desc',
        },
        skip: offset,
        take: limit,
      });

      return documents.map(toDocumentResponse);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('List documents error:', error);
      throw new Error(`Failed to list documents: ${message}`);
    }
  }

  /**
   * Update document
   * FIXED: Uses prisma.document
   */
  public async updateDocument(
    documentId: string,
    userId: string,
    data: UpdateDocumentData
  ): Promise<DocumentResponse> {
    try {
      // Verify ownership
      await this.verifyDocumentOwnership(documentId, userId);

      const document = await prisma.document.update({
        where: { id: documentId },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.processedText && { textContent: data.processedText }),
          ...(data.pageCount && { pageCount: data.pageCount }),
          ...(data.wordCount && { wordCount: data.wordCount }),
          ...(data.chunkCount && { totalChunks: data.chunkCount }),
          ...(data.status === DocumentStatus.READY && { processedAt: new Date() }),
          lastAccessedAt: new Date(),
        },
      });

      return toDocumentResponse(document);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Update document error:', error);
      throw new Error(`Failed to update document: ${message}`);
    }
  }

  /**
   * Delete document
   * FIXED: Uses prisma.document
   */
  public async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      // Get document (verifies ownership)
      await this.getDocumentById(documentId, userId);

      // Delete from database
      await prisma.document.delete({
        where: { id: documentId },
      });

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Delete document error:', error);
      throw new Error(`Failed to delete document: ${message}`);
    }
  }

  /**
   * Update document status
   * FIXED: Uses prisma.document
   */
  public async updateStatus(
    documentId: string,
    status: DocumentStatus,
    errorMessage?: string
  ): Promise<void> {
    try {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status,
          ...(errorMessage && { errorMessage }),
          ...(status === DocumentStatus.READY && { processedAt: new Date() }),
        },
      });
      console.log(`✅ Document status updated: ${documentId} -> ${status}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Update status error:', error);
      throw new Error(`Failed to update status: ${message}`);
    }
  }

  /**
   * Increment query count (access count)
   * FIXED: Uses prisma.document
   */
  public async incrementQueryCount(documentId: string): Promise<void> {
    try {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          accessCount: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });
    } catch (error: unknown) {
      console.error('Increment query count error:', error);
      // Non-critical, don't throw
    }
  }

  /**
   * Get user document count
   * FIXED: Uses prisma.document
   */
  public async getUserDocumentCount(userId: string): Promise<number> {
    try {
      return await prisma.document.count({
        where: { userId },
      });
    } catch (error: unknown) {
      console.error('Get document count error:', error);
      return 0;
    }
  }

  /**
   * Get user document stats
   * FIXED: Uses prisma.document
   */
  public async getUserStats(userId: string): Promise<DocumentStats> {
    try {
      const documents = await prisma.document.findMany({
        where: { userId },
      });

      const stats: DocumentStats = {
        totalDocuments: documents.length,
        readyDocuments: documents.filter((d) => d.status === DocumentStatus.READY).length,
        processingDocuments: documents.filter((d) => d.status === DocumentStatus.PROCESSING).length,
        failedDocuments: documents.filter((d) => d.status === DocumentStatus.FAILED).length,
        totalQueries: documents.reduce((sum, d) => sum + (d.accessCount || 0), 0),
        totalWords: documents.reduce((sum, d) => sum + (d.wordCount || 0), 0),
      };

      return stats;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Get user stats error:', error);
      throw new Error(`Failed to get stats: ${message}`);
    }
  }

  /**
   * Verify document ownership
   * FIXED: Uses prisma.document
   */
  private async verifyDocumentOwnership(documentId: string, userId: string): Promise<void> {
    const document = await prisma.document.findFirst({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    if (document.userId !== userId) {
      throw new Error('Access denied: Document does not belong to user');
    }
  }

  /**
   * Clean up old documents (background job)
   * FIXED: Uses prisma.document
   */
  public async cleanupOldDocuments(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.autoDeleteAfterDays);

      // Delete from database
      const result = await prisma.document.deleteMany({
        where: {
          uploadedAt: {
            lt: cutoffDate,
          },
        },
      });

      return result.count;
    } catch (error: unknown) {
      console.error('Cleanup error:', error);
      return 0;
    }
  }

  /**
   * Get configuration
   */
  public getConfig(): DocumentManagerConfig {
    return { ...this.config };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON INSTANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const documentManagerService = DocumentManagerService.getInstance();
export { DocumentStatus };
export type { CreateDocumentData, UpdateDocumentData, DocumentListOptions, DocumentStats };