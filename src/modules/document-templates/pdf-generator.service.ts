// ═══════════════════════════════════════════════════════════════════════════
// SORIVA - PDF GENERATOR SERVICE
// Converts HTML resume to PDF using Puppeteer
// ═══════════════════════════════════════════════════════════════════════════

import puppeteer, { Browser, PDFOptions } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  landscape?: boolean;
  printBackground?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  scale?: number;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

export interface PDFGenerationResult {
  success: boolean;
  buffer?: Buffer;
  filePath?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PDF_OPTIONS: PDFGenerationOptions = {
  format: 'A4',
  landscape: false,
  printBackground: true,
  margin: {
    top: '0',
    right: '0',
    bottom: '0',
    left: '0'
  },
  scale: 1,
  displayHeaderFooter: false
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF GENERATOR CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class PDFGeneratorService {
  private browser: Browser | null = null;
  private outputDir: string;

  constructor() {
    // Default output directory for generated PDFs
    this.outputDir = path.join(process.cwd(), 'temp', 'pdfs');
    this.ensureOutputDirectory();
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Get or create browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.connected) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--font-render-hinting=none'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Generate PDF from HTML string
   * @param html - HTML content to convert
   * @param options - PDF generation options
   * @returns PDF buffer
   */
  public async generateFromHTML(
    html: string,
    options: PDFGenerationOptions = {}
  ): Promise<PDFGenerationResult> {
    const mergedOptions = { ...DEFAULT_PDF_OPTIONS, ...options };
    
    let page = null;
    
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();

      // Set content with wait for fonts to load
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded']
      });

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');

      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate PDF
      const pdfOptions: PDFOptions = {
        format: mergedOptions.format,
        landscape: mergedOptions.landscape,
        printBackground: mergedOptions.printBackground,
        margin: mergedOptions.margin,
        scale: mergedOptions.scale,
        displayHeaderFooter: mergedOptions.displayHeaderFooter
      };

      if (mergedOptions.headerTemplate) {
        pdfOptions.headerTemplate = mergedOptions.headerTemplate;
      }

      if (mergedOptions.footerTemplate) {
        pdfOptions.footerTemplate = mergedOptions.footerTemplate;
      }

      const pdfBuffer = await page.pdf(pdfOptions);

      return {
        success: true,
        buffer: Buffer.from(pdfBuffer)
      };

    } catch (error) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Generate PDF and save to file
   * @param html - HTML content to convert
   * @param fileName - Output file name (without extension)
   * @param options - PDF generation options
   * @returns File path of generated PDF
   */
  public async generateAndSave(
    html: string,
    fileName: string,
    options: PDFGenerationOptions = {}
  ): Promise<PDFGenerationResult> {
    const result = await this.generateFromHTML(html, options);

    if (!result.success || !result.buffer) {
      return result;
    }

    try {
      // Sanitize filename
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const filePath = path.join(this.outputDir, `${sanitizedName}.pdf`);

      // Write to file
      fs.writeFileSync(filePath, result.buffer);

      return {
        success: true,
        buffer: result.buffer,
        filePath
      };

    } catch (error) {
      console.error('PDF save error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save PDF'
      };
    }
  }

  /**
   * Generate PDF from HTML file
   * @param htmlFilePath - Path to HTML file
   * @param options - PDF generation options
   * @returns PDF buffer
   */
  public async generateFromFile(
    htmlFilePath: string,
    options: PDFGenerationOptions = {}
  ): Promise<PDFGenerationResult> {
    try {
      if (!fs.existsSync(htmlFilePath)) {
        return {
          success: false,
          error: `HTML file not found: ${htmlFilePath}`
        };
      }

      const html = fs.readFileSync(htmlFilePath, 'utf-8');
      return this.generateFromHTML(html, options);

    } catch (error) {
      console.error('PDF generation from file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read HTML file'
      };
    }
  }

  /**
   * Generate PDF from URL
   * @param url - URL to convert to PDF
   * @param options - PDF generation options
   * @returns PDF buffer
   */
  public async generateFromURL(
    url: string,
    options: PDFGenerationOptions = {}
  ): Promise<PDFGenerationResult> {
    const mergedOptions = { ...DEFAULT_PDF_OPTIONS, ...options };
    
    let page = null;
    
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();

      await page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });

      // Wait for fonts
      await page.evaluateHandle('document.fonts.ready');
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdfOptions: PDFOptions = {
        format: mergedOptions.format,
        landscape: mergedOptions.landscape,
        printBackground: mergedOptions.printBackground,
        margin: mergedOptions.margin,
        scale: mergedOptions.scale
      };

      const pdfBuffer = await page.pdf(pdfOptions);

      return {
        success: true,
        buffer: Buffer.from(pdfBuffer)
      };

    } catch (error) {
      console.error('PDF generation from URL error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF from URL'
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Set custom output directory
   * @param dirPath - Directory path for output PDFs
   */
  public setOutputDirectory(dirPath: string): void {
    this.outputDir = dirPath;
    this.ensureOutputDirectory();
  }

  /**
   * Get current output directory
   */
  public getOutputDirectory(): string {
    return this.outputDir;
  }

  /**
   * Clean up old PDF files (older than specified hours)
   * @param hoursOld - Delete files older than this many hours
   */
  public cleanupOldFiles(hoursOld: number = 24): number {
    let deletedCount = 0;
    const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000);

    try {
      const files = fs.readdirSync(this.outputDir);

      for (const file of files) {
        if (!file.endsWith('.pdf')) continue;

        const filePath = path.join(this.outputDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtimeMs < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }

    return deletedCount;
  }

  /**
   * Close browser instance
   */
  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Check if browser is connected
   */
  public isConnected(): boolean {
    return this.browser !== null && this.browser.connected;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const pdfGeneratorService = new PDFGeneratorService();
export default PDFGeneratorService;