/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA AI - DOCUMENT PROCESSOR SERVICE v1.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Purpose: Extract text from documents and chunk for RAG
 * Features: PDF, DOCX, TXT, CSV support with intelligent chunking
 * Architecture: Singleton, async processing, plan-based limits
 * Created: October 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { PrismaClient } from '@prisma/client';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import * as Papa from 'papaparse';
import { logger } from '@shared/utils/logger';

const prisma = new PrismaClient();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DocumentMetadata {
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  userId: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  encoding?: string;
}

export interface TextChunk {
  id: string;
  text: string;
  index: number;
  metadata: {
    documentId: string;
    filename: string;
    pageNumber?: number;
    chunkIndex: number;
    totalChunks: number;
    wordCount: number;
    characterCount: number;
  };
}

export interface ProcessedDocument {
  documentId: string;
  metadata: DocumentMetadata;
  fullText: string;
  chunks: TextChunk[];
  processingTime: number;
  chunkingStrategy: 'fixed' | 'semantic' | 'paragraph';
}

export interface ChunkingOptions {
  strategy: 'fixed' | 'semantic' | 'paragraph';
  chunkSize: number; // Characters per chunk
  chunkOverlap: number; // Overlap between chunks
  minChunkSize: number; // Minimum chunk size
  respectSentences: boolean; // Don't break mid-sentence
}

export interface PlanLimits {
  maxFileSize: number; // Bytes
  maxDocuments: number; // Total documents per user
  maxChunksPerDoc: number; // Max chunks per document
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLAN-BASED LIMITS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAN_LIMITS: Record<string, PlanLimits> = {
  STARTER: {
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    maxDocuments: 5,
    maxChunksPerDoc: 100,
  },
  PLUS: {
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    maxDocuments: 20,
    maxChunksPerDoc: 500,
  },
  PRO: {
    maxFileSize: 200 * 1024 * 1024, // 200 MB
    maxDocuments: 100,
    maxChunksPerDoc: 2000,
  },
  EDGE: {
    maxFileSize: 1024 * 1024 * 1024, // 1 GB
    maxDocuments: 500,
    maxChunksPerDoc: 5000,
  },
  LIFE: {
    maxFileSize: 5 * 1024 * 1024 * 1024, // 5 GB
    maxDocuments: -1, // Unlimited
    maxChunksPerDoc: 10000,
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOCUMENT PROCESSOR SERVICE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class DocumentProcessorService {
  private static instance: DocumentProcessorService;

  private defaultChunkingOptions: ChunkingOptions = {
    strategy: 'fixed',
    chunkSize: 1000, // 1000 characters per chunk
    chunkOverlap: 200, // 200 character overlap
    minChunkSize: 100, // Minimum 100 characters
    respectSentences: true, // Don't break sentences
  };

  private constructor() {
    logger.info('[DocumentProcessor] Service initialized');
  }

  public static getInstance(): DocumentProcessorService {
    if (!DocumentProcessorService.instance) {
      DocumentProcessorService.instance = new DocumentProcessorService();
    }
    return DocumentProcessorService.instance;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN PROCESSING METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  public async processDocument(
    fileBuffer: Buffer,
    metadata: Partial<DocumentMetadata>,
    userId: string,
    planTier: string = 'STARTER',
    options?: Partial<ChunkingOptions>
  ): Promise<ProcessedDocument> {
    const startTime = Date.now();

    try {
      // Validate plan limits
      await this.validatePlanLimits(fileBuffer, userId, planTier);

      // Extract file type
      const fileType = this.detectFileType(metadata.filename || '');

      logger.info(`[DocumentProcessor] Processing ${fileType} file: ${metadata.filename}`);

      // Extract text based on file type
      let fullText: string;
      const extractedMetadata: Partial<DocumentMetadata> = {};

      switch (fileType) {
        case 'pdf':
          const pdfResult = await this.extractFromPDF(fileBuffer);
          fullText = pdfResult.text;
          extractedMetadata.pageCount = pdfResult.pageCount;
          break;

        case 'docx':
          const docxResult = await this.extractFromDOCX(fileBuffer);
          fullText = docxResult.text;
          break;

        case 'txt':
        case 'md':
          fullText = await this.extractFromText(fileBuffer);
          break;

        case 'csv':
          fullText = await this.extractFromCSV(fileBuffer);
          break;

        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Clean and normalize text
      fullText = this.cleanText(fullText);

      // Calculate word count
      const wordCount = this.countWords(fullText);
      extractedMetadata.wordCount = wordCount;

      // Chunk the text
      const chunkingOpts = { ...this.defaultChunkingOptions, ...options };
      const chunks = await this.chunkText(fullText, metadata.filename || '', chunkingOpts);

      // Validate chunk count against plan limits
      const limits = PLAN_LIMITS[planTier] || PLAN_LIMITS.STARTER;
      if (chunks.length > limits.maxChunksPerDoc) {
        throw new Error(
          `Document exceeds maximum chunks (${chunks.length} > ${limits.maxChunksPerDoc}). Please upgrade your plan.`
        );
      }

      // Create document ID
      const documentId = this.generateDocumentId(userId, metadata.filename || '');

      // Build complete metadata
      const completeMetadata: DocumentMetadata = {
        filename: metadata.filename || 'unknown',
        fileType,
        fileSize: fileBuffer.length,
        uploadedAt: new Date(),
        userId,
        ...extractedMetadata,
      };

      const processingTime = Date.now() - startTime;

      logger.success(
        `[DocumentProcessor] Processed ${metadata.filename}: ${chunks.length} chunks in ${processingTime}ms`
      );

      return {
        documentId,
        metadata: completeMetadata,
        fullText,
        chunks,
        processingTime,
        chunkingStrategy: chunkingOpts.strategy,
      };
    } catch (error) {
      logger.error('[DocumentProcessor] Processing failed', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FILE TYPE DETECTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private detectFileType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || '';

    const typeMap: Record<string, string> = {
      pdf: 'pdf',
      docx: 'docx',
      doc: 'docx',
      txt: 'txt',
      md: 'md',
      markdown: 'md',
      csv: 'csv',
    };

    return typeMap[ext] || 'unknown';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEXT EXTRACTION METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async extractFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;

      const pageCount = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      return { text: fullText, pageCount };
    } catch (error) {
      logger.error('[DocumentProcessor] PDF extraction failed', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  private async extractFromDOCX(buffer: Buffer): Promise<{ text: string }> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value };
    } catch (error) {
      logger.error('[DocumentProcessor] DOCX extraction failed', error);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  private async extractFromText(buffer: Buffer): Promise<string> {
    try {
      return buffer.toString('utf-8');
    } catch (error) {
      logger.error('[DocumentProcessor] Text extraction failed', error);
      throw new Error('Failed to extract text from file');
    }
  }

  private async extractFromCSV(buffer: Buffer): Promise<string> {
    try {
      const csvText = buffer.toString('utf-8');
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      // Convert CSV to readable text format
      let text = '';

      if (parsed.data && parsed.data.length > 0) {
        const headers = Object.keys(parsed.data[0] as Record<string, any>);
        text += `CSV Data with columns: ${headers.join(', ')}\n\n`;

        parsed.data.forEach((row: any, index: number) => {
          text += `Row ${index + 1}:\n`;
          headers.forEach((header) => {
            text += `  ${header}: ${row[header]}\n`;
          });
          text += '\n';
        });
      }

      return text;
    } catch (error) {
      logger.error('[DocumentProcessor] CSV extraction failed', error);
      throw new Error('Failed to extract text from CSV');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEXT CLEANING & NORMALIZATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private cleanText(text: string): string {
    // Remove excessive whitespace
    text = text.replace(/\s+/g, ' ');

    // Remove excessive newlines (keep max 2)
    text = text.replace(/\n{3,}/g, '\n\n');

    // Remove control characters except newlines and tabs
    text = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

    // Trim
    text = text.trim();

    return text;
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEXT CHUNKING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async chunkText(
    text: string,
    filename: string,
    options: ChunkingOptions
  ): Promise<TextChunk[]> {
    const chunks: TextChunk[] = [];
    const documentId = this.generateDocumentId('temp', filename);

    switch (options.strategy) {
      case 'fixed':
        return this.fixedSizeChunking(text, documentId, filename, options);

      case 'paragraph':
        return this.paragraphChunking(text, documentId, filename, options);

      case 'semantic':
        // Fallback to fixed for now (semantic needs ML)
        return this.fixedSizeChunking(text, documentId, filename, options);

      default:
        return this.fixedSizeChunking(text, documentId, filename, options);
    }
  }

  private fixedSizeChunking(
    text: string,
    documentId: string,
    filename: string,
    options: ChunkingOptions
  ): TextChunk[] {
    const chunks: TextChunk[] = [];
    const { chunkSize, chunkOverlap, minChunkSize, respectSentences } = options;

    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + chunkSize, text.length);

      // Respect sentence boundaries
      if (respectSentences && endIndex < text.length) {
        // Look for sentence ending punctuation
        const sentenceEnd = text.substring(startIndex, endIndex).lastIndexOf('. ');
        if (sentenceEnd > minChunkSize) {
          endIndex = startIndex + sentenceEnd + 1;
        }
      }

      const chunkText = text.substring(startIndex, endIndex).trim();

      // Skip if chunk is too small
      if (chunkText.length >= minChunkSize) {
        chunks.push({
          id: `${documentId}-chunk-${chunkIndex}`,
          text: chunkText,
          index: chunkIndex,
          metadata: {
            documentId,
            filename,
            chunkIndex,
            totalChunks: 0, // Will update after
            wordCount: this.countWords(chunkText),
            characterCount: chunkText.length,
          },
        });
        chunkIndex++;
      }

      // Move to next chunk with overlap
      startIndex = endIndex - chunkOverlap;

      // Prevent infinite loop
      if (startIndex >= text.length - minChunkSize) {
        break;
      }
    }

    // Update total chunks count
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }

  private paragraphChunking(
    text: string,
    documentId: string,
    filename: string,
    options: ChunkingOptions
  ): TextChunk[] {
    const chunks: TextChunk[] = [];
    const paragraphs = text.split(/\n\n+/);

    let currentChunk = '';
    let chunkIndex = 0;

    paragraphs.forEach((paragraph, index) => {
      const paragraphTrimmed = paragraph.trim();

      if (!paragraphTrimmed) return;

      // If adding this paragraph exceeds chunk size, save current chunk
      if (
        currentChunk.length + paragraphTrimmed.length > options.chunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push({
          id: `${documentId}-chunk-${chunkIndex}`,
          text: currentChunk.trim(),
          index: chunkIndex,
          metadata: {
            documentId,
            filename,
            chunkIndex,
            totalChunks: 0,
            wordCount: this.countWords(currentChunk),
            characterCount: currentChunk.length,
          },
        });
        chunkIndex++;
        currentChunk = '';
      }

      // Add paragraph to current chunk
      currentChunk += paragraphTrimmed + '\n\n';
    });

    // Add final chunk
    if (currentChunk.trim().length >= options.minChunkSize) {
      chunks.push({
        id: `${documentId}-chunk-${chunkIndex}`,
        text: currentChunk.trim(),
        index: chunkIndex,
        metadata: {
          documentId,
          filename,
          chunkIndex,
          totalChunks: 0,
          wordCount: this.countWords(currentChunk),
          characterCount: currentChunk.length,
        },
      });
    }

    // Update total chunks
    chunks.forEach((chunk) => {
      chunk.metadata.totalChunks = chunks.length;
    });

    return chunks;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDATION & LIMITS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async validatePlanLimits(
    fileBuffer: Buffer,
    userId: string,
    planTier: string
  ): Promise<void> {
    const limits = PLAN_LIMITS[planTier] || PLAN_LIMITS.STARTER;

    // Check file size
    if (fileBuffer.length > limits.maxFileSize) {
      throw new Error(
        `File size (${this.formatBytes(fileBuffer.length)}) exceeds plan limit (${this.formatBytes(limits.maxFileSize)}). Please upgrade your plan.`
      );
    }

    // Check document count
    if (limits.maxDocuments !== -1) {
      const userDocCount = await (prisma as any).document.count({
        where: { userId },
      });

      if (userDocCount >= limits.maxDocuments) {
        throw new Error(
          `Document limit reached (${userDocCount}/${limits.maxDocuments}). Please upgrade your plan or delete old documents.`
        );
      }
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // UTILITIES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private generateDocumentId(userId: string, filename: string): string {
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return `${userId}-${cleanFilename}-${timestamp}`;
  }

  public getChunkingOptions(): ChunkingOptions {
    return { ...this.defaultChunkingOptions };
  }

  public updateChunkingOptions(options: Partial<ChunkingOptions>): void {
    this.defaultChunkingOptions = { ...this.defaultChunkingOptions, ...options };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default DocumentProcessorService.getInstance();
