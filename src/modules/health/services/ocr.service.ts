// ============================================
// SORIVA HEALTH - OCR SERVICE
// Path: src/modules/health/services/ocr.service.ts
// ============================================

import Tesseract from 'tesseract.js';
import { OCR_CONFIG } from '../health.constants';
import { OCRResult, HealthError, HEALTH_ERROR_CODES } from '../health.types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OCR SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  /**
   * Initialize Tesseract worker
   */
  private async getWorker(): Promise<Tesseract.Worker> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker(OCR_CONFIG.LANGUAGE, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
    }
    return this.worker;
  }

  /**
   * Extract text from image buffer
   */
  async extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<OCRResult> {
    try {
      const worker = await this.getWorker();

      // Convert buffer to base64 for Tesseract
      const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;

      const { data } = await worker.recognize(base64);

      // Check confidence
      if (data.confidence < OCR_CONFIG.MIN_CONFIDENCE) {
        console.warn(`Low OCR confidence: ${data.confidence}%`);
      }

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        processedAt: new Date(),
      };
    } catch (error) {
      console.error('OCR Error:', error);
      throw new HealthError(
        'Failed to extract text from image',
        HEALTH_ERROR_CODES.OCR_FAILED,
        500
      );
    }
  }

  /**
   * Extract text from file path
   */
  async extractTextFromPath(filePath: string): Promise<OCRResult> {
    try {
      const worker = await this.getWorker();

      const { data } = await worker.recognize(filePath);

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        processedAt: new Date(),
      };
    } catch (error) {
      console.error('OCR Error:', error);
      throw new HealthError(
        'Failed to extract text from file',
        HEALTH_ERROR_CODES.OCR_FAILED,
        500
      );
    }
  }

  /**
   * Extract text from URL (Cloudinary etc.)
   */
  async extractTextFromURL(url: string): Promise<OCRResult> {
    try {
      const worker = await this.getWorker();

      const { data } = await worker.recognize(url);

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        processedAt: new Date(),
      };
    } catch (error) {
      console.error('OCR Error:', error);
      throw new HealthError(
        'Failed to extract text from URL',
        HEALTH_ERROR_CODES.OCR_FAILED,
        500
      );
    }
  }

  /**
   * Clean and normalize extracted text
   */
  normalizeText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters but keep medical units
      .replace(/[^\w\s\.\,\-\:\;\/\%\(\)]/g, '')
      // Normalize common OCR mistakes
      .replace(/\bl\b/g, '1') // l -> 1
      .replace(/\bO\b/g, '0') // O -> 0
      .trim();
  }

  /**
   * Extract structured data from text (basic parsing)
   */
  extractBiomarkers(text: string): Array<{ name: string; value: string; unit: string }> {
    const biomarkers: Array<{ name: string; value: string; unit: string }> = [];

    // Common patterns in lab reports
    const patterns = [
      // Pattern: "Hemoglobin 14.5 g/dL"
      /(\w+(?:\s+\w+)?)\s*[:\-]?\s*(\d+\.?\d*)\s*(g\/dL|mg\/dL|%|U\/L|mmol\/L|µg\/dL|ng\/mL|pg\/mL|cells\/µL|million\/µL|lakhs\/µL)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        biomarkers.push({
          name: match[1].trim(),
          value: match[2],
          unit: match[3],
        });
      }
    }

    return biomarkers;
  }

  /**
   * Terminate worker (cleanup)
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

// Export singleton instance
export const ocrService = new OCRService();