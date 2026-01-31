// src/modules/document/services/ocr.service.ts

/**
 * ==========================================
 * SORIVA OCR SERVICE - HYBRID APPROACH
 * ==========================================
 * Created: February 1, 2026
 * Developer: Amandeep, Punjab, India
 * 
 * FEATURES:
 * ✅ Google Vision API (Primary - High accuracy)
 * ✅ Tesseract.js (Fallback - Free, unlimited)
 * ✅ Plan-based limits for Google Vision
 * ✅ Usage tracking per user
 * ✅ Supports: Images (JPG, PNG, WEBP) + Scanned PDFs
 * 
 * LIMITS (Google Vision):
 * - STARTER (Free): 5 pages/month
 * - STARTER (Paid): 20 pages/month
 * - PLUS: 50 pages/month
 * - PRO: 75 pages/month
 * - APEX: 100 pages/month
 * 
 * After limit: Tesseract.js fallback (slower but works)
 */

import { ImageAnnotatorClient } from '@google-cloud/vision';
import { createWorker, Worker } from 'tesseract.js';
import { prisma } from '@/config/prisma';
import path from 'path';
import fs from 'fs';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  provider: 'google_vision' | 'tesseract';
  language?: string;
  wordCount: number;
  processingTime: number;
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
  tesseractUsed: number;
  lastResetDate: Date;
}

// ==========================================
// OCR LIMITS BY PLAN
// ==========================================

const OCR_LIMITS: Record<string, number> = {
  STARTER_FREE: 5,
  STARTER: 20,
  PLUS: 50,
  PRO: 75,
  APEX: 100,
  SOVEREIGN: 200,
};

// ==========================================
// OCR SERVICE CLASS
// ==========================================

class OCRService {
  private static instance: OCRService;
  private visionClient: ImageAnnotatorClient | null = null;
  private isVisionAvailable: boolean = false;
  private tesseractWorker: Worker | null = null;

  // Stats
  private stats = {
    googleVisionCalls: 0,
    tesseractCalls: 0,
    totalProcessed: 0,
    errors: 0,
  };

  private constructor() {
    this.initializeGoogleVision();
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
      console.log('[OCR] ✅ Google Vision initialized successfully');
    } catch (error) {
      console.error('[OCR] ❌ Google Vision initialization failed:', error);
      this.isVisionAvailable = false;
    }
  }

  private async initializeTesseract(): Promise<Worker> {
    if (!this.tesseractWorker) {
      this.tesseractWorker = await createWorker('eng+hin');
      console.log('[OCR] ✅ Tesseract worker initialized');
    }
    return this.tesseractWorker;
  }

  // ==========================================
  // MAIN OCR METHOD
  // ==========================================

  public async extractText(request: OCRRequest): Promise<OCRResult> {
    const startTime = Date.now();
    this.stats.totalProcessed++;

    try {
      // Check if user can use Google Vision
      const canUseGoogleVision = await this.canUseGoogleVision(
        request.userId,
        request.planType,
        request.isPaidUser
      );

      if (canUseGoogleVision && this.isVisionAvailable) {
        console.log(`[OCR] 🔍 Using Google Vision for user: ${request.userId}`);
        
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
          console.warn('[OCR] ⚠️ Google Vision failed, falling back to Tesseract:', visionError);
        }
      }

      // Use Tesseract as fallback
      console.log(`[OCR] 🔧 Using Tesseract for user: ${request.userId}`);
      const result = await this.extractWithTesseract(request.imageBuffer);

      await this.incrementTesseractUsage(request.userId);
      this.stats.tesseractCalls++;

      return {
        ...result,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      this.stats.errors++;
      const message = error instanceof Error ? error.message : 'OCR failed';
      console.error('[OCR] ❌ Error:', message);

      return {
        success: false,
        text: '',
        confidence: 0,
        provider: 'tesseract',
        wordCount: 0,
        processingTime: Date.now() - startTime,
        error: message,
      };
    }
  }

  // ==========================================
  // GOOGLE VISION EXTRACTION
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
      confidence: 95, // Google Vision is highly accurate
      provider: 'google_vision',
      language: locale,
      wordCount: this.countWords(fullText),
      processingTime: 0,
    };
  }

  // ==========================================
  // TESSERACT EXTRACTION (FALLBACK)
  // ==========================================

  private async extractWithTesseract(imageBuffer: Buffer): Promise<OCRResult> {
    const worker = await this.initializeTesseract();

    const {
      data: { text, confidence },
    } = await worker.recognize(imageBuffer);

    return {
      success: true,
      text: text.trim(),
      confidence: confidence,
      provider: 'tesseract',
      wordCount: this.countWords(text),
      processingTime: 0,
    };
  }

  // ==========================================
  // USAGE TRACKING
  // ==========================================

  private async canUseGoogleVision(
    userId: string,
    planType: string,
    isPaidUser: boolean
  ): Promise<boolean> {
    const limitKey = planType === 'STARTER' && !isPaidUser ? 'STARTER_FREE' : planType;
    const limit = OCR_LIMITS[limitKey] || OCR_LIMITS.STARTER_FREE;

    const usage = await this.getOCRUsage(userId);

    return usage.googleVisionUsed < limit;
  }

  private async getOCRUsage(userId: string): Promise<OCRUsage> {
    const usage = await prisma.documentUsage.findUnique({
      where: { userId },
    });

    if (!usage) {
      return {
        userId,
        googleVisionUsed: 0,
        tesseractUsed: 0,
        lastResetDate: new Date(),
      };
    }

    // Check if we need to reset (monthly)
    const now = new Date();
    const lastReset = usage.lastResetDate;
    const monthDiff =
      (now.getFullYear() - lastReset.getFullYear()) * 12 +
      (now.getMonth() - lastReset.getMonth());

    if (monthDiff >= 1) {
      // Reset monthly usage
      await prisma.documentUsage.update({
        where: { userId },
        data: {
          ocrGoogleUsed: 0,
          ocrTesseractUsed: 0,
          lastResetDate: now,
        },
      });

      return {
        userId,
        googleVisionUsed: 0,
        tesseractUsed: 0,
        lastResetDate: now,
      };
    }

    return {
      userId,
      googleVisionUsed: usage.ocrGoogleUsed,
      tesseractUsed: usage.ocrTesseractUsed,
      lastResetDate: lastReset,
    };
  }

  private async incrementGoogleVisionUsage(userId: string): Promise<void> {
    const now = new Date();
    const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await prisma.documentUsage.upsert({
      where: { userId },
      create: {
        userId,
        ocrGoogleUsed: 1,
        ocrTesseractUsed: 0,
        cycleEndDate: cycleEnd,
      },
      update: {
        ocrGoogleUsed: { increment: 1 },
      },
    });
  }

  private async incrementTesseractUsage(userId: string): Promise<void> {
    const now = new Date();
    const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await prisma.documentUsage.upsert({
      where: { userId },
      create: {
        userId,
        ocrGoogleUsed: 0,
        ocrTesseractUsed: 1,
        cycleEndDate: cycleEnd,
      },
      update: {
        ocrTesseractUsed: { increment: 1 },
      },
    });
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
    tesseractUsed: number;
    googleVisionRemaining: number;
  }> {
    const usage = await this.getOCRUsage(userId);
    const limitKey = planType === 'STARTER' && !isPaidUser ? 'STARTER_FREE' : planType;
    const limit = OCR_LIMITS[limitKey] || OCR_LIMITS.STARTER_FREE;

    return {
      googleVisionUsed: usage.googleVisionUsed,
      googleVisionLimit: limit,
      tesseractUsed: usage.tesseractUsed,
      googleVisionRemaining: Math.max(0, limit - usage.googleVisionUsed),
    };
  }

  public getStats(): {
    googleVisionCalls: number;
    tesseractCalls: number;
    totalProcessed: number;
    errors: number;
    googleVisionAvailable: boolean;
  } {
    return {
      ...this.stats,
      googleVisionAvailable: this.isVisionAvailable,
    };
  }

  public isGoogleVisionAvailable(): boolean {
    return this.isVisionAvailable;
  }

  // Cleanup method for graceful shutdown
  public async terminate(): Promise<void> {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
      console.log('[OCR] ✅ Tesseract worker terminated');
    }
  }
}

// ==========================================
// EXPORT SINGLETON
// ==========================================

export const ocrService = OCRService.getInstance();
export default ocrService;