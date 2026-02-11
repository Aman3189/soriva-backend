// src/modules/document/services/ocr.service.ts

/**
 * ==========================================
 * SORIVA OCR SERVICE - HYBRID v3.0
 * ==========================================
 * Created: February 1, 2026
 * Updated: February 11, 2026 - Hybrid: Google Vision + Mistral OCR
 * Developer: Amandeep, Punjab, India
 *
 * HYBRID APPROACH:
 * ✅ Google Vision API - For IMAGES (JPG, PNG, WEBP) - ₹0.125/img
 * ✅ Mistral OCR 3 - For PDFs (direct support) - ₹0.166/page
 * ❌ Tesseract.js - REMOVED (not needed)
 * ❌ PDF to Image conversion - REMOVED (Mistral handles PDFs directly)
 *
 * ROUTING LOGIC:
 * - Images → Google Vision (cheaper for images)
 * - PDFs → Mistral OCR (direct PDF support, tables, 95% accuracy)
 * - Fallback → Mistral OCR (if Google Vision fails)
 *
 * LIMITS:
 * - STARTER (Free): 5 images + 10 PDF pages/month
 * - STARTER (Paid): 20 images + 30 PDF pages/month
 * - PLUS: 50 images + 100 PDF pages/month
 * - PRO: 75 images + 150 PDF pages/month
 * - APEX: 100 images + 200 PDF pages/month
 */

import { ImageAnnotatorClient } from '@google-cloud/vision';
import axios from 'axios';
import { prisma } from '@/config/prisma';
import { logger } from '@shared/utils/logger';
import path from 'path';
import fs from 'fs';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  provider: 'google_vision' | 'mistral_ocr';
  language?: string;
  wordCount: number;
  processingTime: number;
  pagesProcessed?: number;
  markdown?: string; // Mistral returns markdown
  tables?: string[]; // Extracted tables (HTML format)
  error?: string;
}

export interface OCRRequest {
  imageBuffer: Buffer;
  userId: string;
  documentId?: string;
  mimeType: string;
  isPaidUser: boolean;
  planType: string;
}

interface OCRUsage {
  userId: string;
  googleVisionUsed: number;
  mistralOcrUsed: number;
  lastResetDate: Date;
}

// Mistral OCR API Response Types
interface MistralOCRPage {
  index: number;
  markdown: string;
  images: Array<{
    id: string;
    top_left_x: number;
    top_left_y: number;
    bottom_right_x: number;
    bottom_right_y: number;
  }>;
  dimensions: {
    dpi: number;
    height: number;
    width: number;
  };
  tables?: string[];
}

interface MistralOCRResponse {
  pages: MistralOCRPage[];
  model: string;
  usage_info: {
    pages_processed: number;
    doc_size_bytes: number | null;
  };
}

// ==========================================
// OCR LIMITS BY PLAN (HYBRID)
// ==========================================

// Google Vision limits (for IMAGES only)
const GOOGLE_VISION_LIMITS: Record<string, number> = {
  STARTER_FREE: 5,
  STARTER: 20,
  PLUS: 50,
  PRO: 75,
  APEX: 100,
  SOVEREIGN: 200,
};

// Mistral OCR limits (for PDFs - pages)
const MISTRAL_OCR_LIMITS: Record<string, number> = {
  STARTER_FREE: 10,
  STARTER: 30,
  PLUS: 100,
  PRO: 150,
  APEX: 200,
  SOVEREIGN: 500,
};

// ==========================================
// OCR SERVICE CLASS
// ==========================================

class OCRService {
  private static instance: OCRService;

  // Google Vision (for images)
  private visionClient: ImageAnnotatorClient | null = null;
  private isVisionAvailable: boolean = false;

  // Mistral OCR (for PDFs)
  private mistralApiKey: string | null = null;
  private isMistralAvailable: boolean = false;
  private readonly MISTRAL_OCR_URL = 'https://api.mistral.ai/v1/ocr';

  // Stats
  private stats = {
    googleVisionCalls: 0,
    mistralOcrCalls: 0,
    totalProcessed: 0,
    pdfPagesProcessed: 0,
    errors: 0,
  };

  private constructor() {
    this.initializeGoogleVision();
    this.initializeMistralOCR();
  }

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  private initializeGoogleVision(): void {
    try {
      const credentialsPath = process.env.GOOGLE_VISION_CREDENTIALS;

      if (!credentialsPath) {
        console.warn('[OCR] ⚠️ GOOGLE_VISION_CREDENTIALS not set - Google Vision disabled');
        return;
      }

      const fullPath = path.resolve(process.cwd(), credentialsPath);

      if (!fs.existsSync(fullPath)) {
        console.warn(`[OCR] ⚠️ Credentials file not found: ${fullPath}`);
        return;
      }

      this.visionClient = new ImageAnnotatorClient({
        keyFilename: fullPath,
      });

      this.isVisionAvailable = true;
      console.log('[OCR] ✅ Google Vision initialized (for images)');
    } catch (error) {
      console.error('[OCR] ❌ Google Vision initialization failed:', error);
      this.isVisionAvailable = false;
    }
  }

  private initializeMistralOCR(): void {
    try {
      this.mistralApiKey = process.env.MISTRAL_API_KEY || null;

      if (!this.mistralApiKey) {
        console.warn('[OCR] ⚠️ MISTRAL_API_KEY not set - Mistral OCR disabled');
        return;
      }

      this.isMistralAvailable = true;
      console.log('[OCR] ✅ Mistral OCR initialized (for PDFs)');
    } catch (error) {
      console.error('[OCR] ❌ Mistral OCR initialization failed:', error);
      this.isMistralAvailable = false;
    }
  }

  // ==========================================
  // MAIN OCR METHOD
  // ==========================================

  public async extractText(request: OCRRequest): Promise<OCRResult> {
    const startTime = Date.now();
    this.stats.totalProcessed++;

    try {
      const isPDF = request.mimeType === 'application/pdf';

      // HYBRID ROUTING:
      // PDFs → Mistral OCR (direct support, tables, 95% accuracy)
      // Images → Google Vision (cheaper for images)
      if (isPDF) {
        return await this.extractTextFromPDF(request, startTime);
      }

      // For images, use Google Vision (with Mistral fallback)
      return await this.extractTextFromImage(request, startTime);
    } catch (error) {
      this.stats.errors++;
      const message = error instanceof Error ? error.message : 'OCR failed';
      console.error('[OCR] ❌ Error:', message);

      return {
        success: false,
        text: '',
        confidence: 0,
        provider: 'mistral_ocr',
        wordCount: 0,
        processingTime: Date.now() - startTime,
        error: message,
      };
    }
  }

  // ==========================================
  // PDF OCR - MISTRAL OCR 3 (DIRECT)
  // ==========================================

  /**
   * Extract text from PDF using Mistral OCR 3
   * - Direct PDF support (no conversion needed!)
   * - Returns markdown with table support
   * - 95% accuracy
   */
  private async extractTextFromPDF(request: OCRRequest, startTime: number): Promise<OCRResult> {
    console.log(`[OCR] 📄 Processing PDF with Mistral OCR for user: ${request.userId}`);

    // Check quota for Mistral OCR
    const canUseMistral = await this.canUseMistralOCR(
      request.userId,
      request.planType,
      request.isPaidUser
    );

    if (!canUseMistral) {
      return {
        success: false,
        text: '',
        confidence: 0,
        provider: 'mistral_ocr',
        wordCount: 0,
        processingTime: Date.now() - startTime,
        error: 'Monthly PDF OCR limit reached. Please upgrade your plan.',
      };
    }

    if (!this.isMistralAvailable) {
      return {
        success: false,
        text: '',
        confidence: 0,
        provider: 'mistral_ocr',
        wordCount: 0,
        processingTime: Date.now() - startTime,
        error: 'Mistral OCR service not available',
      };
    }

    try {
      // Convert buffer to base64
      const base64PDF = request.imageBuffer.toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64PDF}`;

      // Call Mistral OCR API
      const response = await axios.post<MistralOCRResponse>(
        this.MISTRAL_OCR_URL,
        {
          model: 'mistral-ocr-latest',
          document: {
            type: 'document_url',
            document_url: dataUrl,
          },
          table_format: 'html', // Get tables in HTML format
        },
        {
          headers: {
            Authorization: `Bearer ${this.mistralApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minutes for large PDFs
        }
      );

      const result = response.data;
      const pagesProcessed = result.usage_info?.pages_processed || result.pages.length;

      // Combine all pages
      const allText: string[] = [];
      const allTables: string[] = [];

      for (const page of result.pages) {
        allText.push(`--- Page ${page.index} ---\n${page.markdown}`);
        if (page.tables && page.tables.length > 0) {
          allTables.push(...page.tables);
        }
      }

      const fullText = allText.join('\n\n');
      const fullMarkdown = result.pages.map((p) => p.markdown).join('\n\n');

      // Update usage
      await this.incrementMistralOCRUsage(request.userId, pagesProcessed);
      this.stats.mistralOcrCalls++;
      this.stats.pdfPagesProcessed += pagesProcessed;

      console.log(`[OCR] ✅ Mistral OCR processed ${pagesProcessed} pages`);

      return {
        success: true,
        text: fullText,
        confidence: 95, // Mistral OCR 3 is highly accurate
        provider: 'mistral_ocr',
        wordCount: this.countWords(fullText),
        processingTime: Date.now() - startTime,
        pagesProcessed,
        markdown: fullMarkdown,
        tables: allTables.length > 0 ? allTables : undefined,
      };
    } catch (error: any) {
      console.error('[OCR] ❌ Mistral OCR failed:', error.response?.data || error.message);
      this.stats.errors++;

      return {
        success: false,
        text: '',
        confidence: 0,
        provider: 'mistral_ocr',
        wordCount: 0,
        processingTime: Date.now() - startTime,
        error: error.response?.data?.error?.message || error.message || 'Mistral OCR failed',
      };
    }
  }

  // ==========================================
  // IMAGE OCR - GOOGLE VISION (Primary)
  // ==========================================

  private async extractTextFromImage(request: OCRRequest, startTime: number): Promise<OCRResult> {
    // Check if user can use Google Vision
    const canUseGoogleVision = await this.canUseGoogleVision(
      request.userId,
      request.planType,
      request.isPaidUser
    );

    if (canUseGoogleVision && this.isVisionAvailable) {
      console.log(`[OCR] 🔍 Using Google Vision for image: ${request.userId}`);

      try {
        const result = await this.extractWithGoogleVision(request.imageBuffer);

        if (result.success) {
          await this.incrementGoogleVisionUsage(request.userId);
          this.stats.googleVisionCalls++;

          return {
            ...result,
            processingTime: Date.now() - startTime,
          };
        }
      } catch (visionError) {
        console.warn('[OCR] ⚠️ Google Vision failed, falling back to Mistral OCR:', visionError);
      }
    }

    // Fallback to Mistral OCR for images
    console.log(`[OCR] 🔄 Using Mistral OCR fallback for image: ${request.userId}`);
    return await this.extractImageWithMistral(request, startTime);
  }

  // ==========================================
  // GOOGLE VISION EXTRACTION (For Images)
  // ==========================================

  private async extractWithGoogleVision(imageBuffer: Buffer): Promise<OCRResult> {
    if (!this.visionClient) {
      throw new Error('Google Vision client not initialized');
    }

    const [result] = await this.visionClient.textDetection({
      image: {
        content: imageBuffer,
      },
    });

    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return {
        success: true,
        text: '',
        confidence: 100,
        provider: 'google_vision',
        wordCount: 0,
        processingTime: 0,
      };
    }

    // First annotation contains the full text
    const fullText = detections[0].description || '';
    const locale = detections[0].locale || undefined;

    return {
      success: true,
      text: fullText.trim(),
      confidence: 95,
      provider: 'google_vision',
      language: locale,
      wordCount: this.countWords(fullText),
      processingTime: 0,
    };
  }

  // ==========================================
  // MISTRAL OCR FOR IMAGES (Fallback)
  // ==========================================

  private async extractImageWithMistral(request: OCRRequest, startTime: number): Promise<OCRResult> {
    if (!this.isMistralAvailable) {
      return {
        success: false,
        text: '',
        confidence: 0,
        provider: 'mistral_ocr',
        wordCount: 0,
        processingTime: Date.now() - startTime,
        error: 'Mistral OCR service not available',
      };
    }

    try {
      // Convert buffer to base64
      const base64Image = request.imageBuffer.toString('base64');
      const mimeType = request.mimeType || 'image/png';
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      // Call Mistral OCR API for image
      const response = await axios.post<MistralOCRResponse>(
        this.MISTRAL_OCR_URL,
        {
          model: 'mistral-ocr-latest',
          document: {
            type: 'image_url',
            image_url: dataUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.mistralApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const result = response.data;
      const text = result.pages[0]?.markdown || '';

      await this.incrementMistralOCRUsage(request.userId, 1);
      this.stats.mistralOcrCalls++;

      console.log(`[OCR] ✅ Mistral OCR processed image`);

      return {
        success: true,
        text: text,
        confidence: 95,
        provider: 'mistral_ocr',
        wordCount: this.countWords(text),
        processingTime: Date.now() - startTime,
        markdown: text,
      };
    } catch (error: any) {
      console.error('[OCR] ❌ Mistral OCR image failed:', error.response?.data || error.message);
      this.stats.errors++;

      return {
        success: false,
        text: '',
        confidence: 0,
        provider: 'mistral_ocr',
        wordCount: 0,
        processingTime: Date.now() - startTime,
        error: error.response?.data?.error?.message || error.message || 'Mistral OCR failed',
      };
    }
  }

  // ==========================================
  // USAGE TRACKING - GOOGLE VISION (Images)
  // ==========================================

  private async canUseGoogleVision(
    userId: string,
    planType: string,
    isPaidUser: boolean
  ): Promise<boolean> {
    if (userId === 'system') return true;

    const limitKey = planType === 'STARTER' && !isPaidUser ? 'STARTER_FREE' : planType;
    const limit = GOOGLE_VISION_LIMITS[limitKey] || GOOGLE_VISION_LIMITS.STARTER_FREE;

    const usage = await this.getOCRUsage(userId);

    return usage.googleVisionUsed < limit;
  }

  private async incrementGoogleVisionUsage(userId: string): Promise<void> {
    if (userId === 'system') return;
    const now = new Date();
    const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await prisma.documentUsage.upsert({
      where: { userId },
      create: {
        userId,
        ocrGoogleUsed: 1,
        ocrMistralUsed: 0,
        cycleEndDate: cycleEnd,
      },
      update: {
        ocrGoogleUsed: { increment: 1 },
      },
    });
  }

  // ==========================================
  // USAGE TRACKING - MISTRAL OCR (PDFs)
  // ==========================================

  private async canUseMistralOCR(
    userId: string,
    planType: string,
    isPaidUser: boolean
  ): Promise<boolean> {
    if (userId === 'system') return true;

    const limitKey = planType === 'STARTER' && !isPaidUser ? 'STARTER_FREE' : planType;
    const limit = MISTRAL_OCR_LIMITS[limitKey] || MISTRAL_OCR_LIMITS.STARTER_FREE;

    const usage = await this.getOCRUsage(userId);

    return usage.mistralOcrUsed < limit;
  }

  private async incrementMistralOCRUsage(userId: string, pagesProcessed: number = 1): Promise<void> {
    if (userId === 'system') return;
    const now = new Date();
    const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await prisma.documentUsage.upsert({
      where: { userId },
      create: {
        userId,
        ocrGoogleUsed: 0,
        ocrMistralUsed: pagesProcessed,
        cycleEndDate: cycleEnd,
      },
      update: {
        ocrMistralUsed: { increment: pagesProcessed },
      },
    });
  }

  // ==========================================
  // SHARED USAGE METHODS
  // ==========================================

  private async getOCRUsage(userId: string): Promise<OCRUsage> {
    const usage = await prisma.documentUsage.findUnique({
      where: { userId },
    });

    if (!usage) {
      return {
        userId,
        googleVisionUsed: 0,
        mistralOcrUsed: 0,
        lastResetDate: new Date(),
      };
    }

    // Check if we need to reset (monthly)
    const now = new Date();
    const lastReset = usage.lastResetDate;
    const monthDiff =
      (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());

    if (monthDiff >= 1) {
      // Reset monthly usage
      await prisma.documentUsage.update({
        where: { userId },
        data: {
          ocrGoogleUsed: 0,
          ocrMistralUsed: 0,
          lastResetDate: now,
        },
      });

      return {
        userId,
        googleVisionUsed: 0,
        mistralOcrUsed: 0,
        lastResetDate: now,
      };
    }

    return {
      userId,
      googleVisionUsed: usage.ocrGoogleUsed,
      mistralOcrUsed: usage.ocrMistralUsed || 0,
      lastResetDate: lastReset,
    };
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  public async getUsageForUser(
    userId: string,
    planType: string,
    isPaidUser: boolean
  ): Promise<{
    googleVisionUsed: number;
    googleVisionLimit: number;
    mistralOcrUsed: number;
    mistralOcrLimit: number;
    googleVisionRemaining: number;
    mistralOcrRemaining: number;
  }> {
    const usage = await this.getOCRUsage(userId);
    const limitKey = planType === 'STARTER' && !isPaidUser ? 'STARTER_FREE' : planType;
    const gvLimit = GOOGLE_VISION_LIMITS[limitKey] || GOOGLE_VISION_LIMITS.STARTER_FREE;
    const mistralLimit = MISTRAL_OCR_LIMITS[limitKey] || MISTRAL_OCR_LIMITS.STARTER_FREE;

    return {
      googleVisionUsed: usage.googleVisionUsed,
      googleVisionLimit: gvLimit,
      mistralOcrUsed: usage.mistralOcrUsed,
      mistralOcrLimit: mistralLimit,
      googleVisionRemaining: Math.max(0, gvLimit - usage.googleVisionUsed),
      mistralOcrRemaining: Math.max(0, mistralLimit - usage.mistralOcrUsed),
    };
  }

  public getStats(): {
    googleVisionCalls: number;
    mistralOcrCalls: number;
    totalProcessed: number;
    pdfPagesProcessed: number;
    errors: number;
    googleVisionAvailable: boolean;
    mistralOcrAvailable: boolean;
  } {
    return {
      ...this.stats,
      googleVisionAvailable: this.isVisionAvailable,
      mistralOcrAvailable: this.isMistralAvailable,
    };
  }

  public isGoogleVisionAvailable(): boolean {
    return this.isVisionAvailable;
  }

  public isMistralOCRAvailable(): boolean {
    return this.isMistralAvailable;
  }

  // Cleanup method for graceful shutdown
  public async terminate(): Promise<void> {
    console.log('[OCR] ✅ OCR Service terminated (no workers to clean up)');
  }
}

// ==========================================
// EXPORT SINGLETON
// ==========================================

export const ocrService = OCRService.getInstance();
export default ocrService;