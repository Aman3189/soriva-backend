// src/modules/document/services/workspace/workspace-template.service.ts
// ═══════════════════════════════════════════════════════════════════════════
// SORIVA WORKSPACE TEMPLATE SERVICE
// HBS Template Rendering & PDF/DOCX Conversion
// ═══════════════════════════════════════════════════════════════════════════

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { WorkspaceTool } from '@prisma/client';

// ============================================
// 📁 TEMPLATE PATHS
// ============================================
const TEMPLATES_DIR = path.join(process.cwd(), 'src/templates/html/layouts');

export class WorkspaceTemplateService {
  private templateCache: Map<string, Handlebars.TemplateDelegate> = new Map();

  constructor() {
    this.registerHelpers();
  }

  // ============================================
  // 🔧 REGISTER HANDLEBARS HELPERS
  // ============================================
  private registerHelpers(): void {
    // Greater than or equal
    Handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
    
    // Less than or equal
    Handlebars.registerHelper('lte', (a: number, b: number) => a <= b);
    
    // Equal
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    
    // Not equal
    Handlebars.registerHelper('neq', (a: any, b: any) => a !== b);

    // Proficiency number for language dots
    Handlebars.registerHelper('proficiencyNum', (proficiency: number | string) => {
      if (typeof proficiency === 'number') return proficiency;
      const map: Record<string, number> = {
        'native': 5, 'fluent': 4, 'proficient': 3, 'intermediate': 2, 'basic': 1
      };
      return map[String(proficiency).toLowerCase()] || 3;
    });

    // Format date
    Handlebars.registerHelper('formatDate', (date: string) => {
      if (!date) return '';
      try {
        return new Date(date).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return date;
      }
    });

    // Format currency
    Handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'INR') => {
      if (typeof amount !== 'number') return amount;
      const symbol = currency === 'USD' ? '$' : '₹';
      return `${symbol}${amount.toLocaleString('en-IN')}`;
    });

    // Array length
    Handlebars.registerHelper('length', (arr: any[]) => arr?.length || 0);

    // Math operations
    Handlebars.registerHelper('add', (a: number, b: number) => a + b);
    Handlebars.registerHelper('subtract', (a: number, b: number) => a - b);
    Handlebars.registerHelper('multiply', (a: number, b: number) => a * b);
    Handlebars.registerHelper('divide', (a: number, b: number) => b !== 0 ? a / b : 0);

    // Default value
    Handlebars.registerHelper('default', (value: any, defaultValue: any) => value || defaultValue);

    // Join array
    Handlebars.registerHelper('join', (arr: any[], separator: string = ', ') => {
      if (!Array.isArray(arr)) return '';
      return arr.join(separator);
    });

    // Uppercase
    Handlebars.registerHelper('uppercase', (str: string) => str?.toUpperCase() || '');

    // Lowercase
    Handlebars.registerHelper('lowercase', (str: string) => str?.toLowerCase() || '');

    // Capitalize
    Handlebars.registerHelper('capitalize', (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });
  }

  // ============================================
  // 📄 LOAD TEMPLATE
  // ============================================
  private loadTemplate(templateName: string): Handlebars.TemplateDelegate {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    // Build file path
    const filePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Read and compile template
    const templateSource = fs.readFileSync(filePath, 'utf-8');
    const template = Handlebars.compile(templateSource);

    // Cache it
    this.templateCache.set(templateName, template);

    return template;
  }

  // ============================================
  // 🎨 RENDER TEMPLATE
  // ============================================
  async renderTemplate(
    tool: WorkspaceTool,
    templateName: string,
    data: Record<string, any>
  ): Promise<string> {
    try {
      const template = this.loadTemplate(templateName);
      const html = template(data);
      return html;
    } catch (error) {
      console.error(`Template render error for ${templateName}:`, error);
      throw new Error(`Failed to render template: ${templateName}`);
    }
  }

  // ============================================
  // 📥 CONVERT TO FORMAT (PDF/DOCX/PNG)
  // ============================================
  async convertToFormat(html: string, format: 'pdf' | 'docx' | 'png'): Promise<Buffer> {
    switch (format) {
      case 'pdf':
        return this.convertToPDF(html);
      case 'png':
        return this.convertToPNG(html);
      case 'docx':
        return this.convertToDocx(html);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  // ============================================
  // 📄 CONVERT TO PDF
  // ============================================
  private async convertToPDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  // ============================================
  // 🖼️ CONVERT TO PNG
  // ============================================
  private async convertToPNG(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Set viewport for A4 size
      await page.setViewport({ width: 794, height: 1123 });
      
      const screenshotBuffer = await page.screenshot({
        type: 'png',
        fullPage: true
      });

      return Buffer.from(screenshotBuffer);
    } finally {
      await browser.close();
    }
  }

  // ============================================
  // 📝 CONVERT TO DOCX (Basic)
  // ============================================
  private async convertToDocx(html: string): Promise<Buffer> {
    // For DOCX, we'll use html-to-docx package
    // Install: npm install html-to-docx
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const htmlToDocx = require('html-to-docx');
      const docxBuffer = await htmlToDocx(html, null, {
        table: { row: { cantSplit: true } },
        footer: false,
        header: false
      });
      return Buffer.from(docxBuffer);
    } catch (error) {
      console.error('DOCX conversion error:', error);
      throw new Error('DOCX conversion failed. Make sure html-to-docx is installed.');
    }
  }

  // ============================================
  // 📋 GET AVAILABLE TEMPLATES FOR TOOL
  // ============================================
  getTemplatesForTool(tool: WorkspaceTool): string[] {
    const templateMap: Record<string, string[]> = {
      RESUME: [
        'two-column-resume-one',
        'two-column-resume-two',
        'two-column-resume-three',
        'two-column-resume-four',
        'two-column-resume-five',
        'two-column-resume-custom'
      ],
      INVOICE: [
        'invoice-commercial',
        'invoice-service',
        'invoice-gst'
      ],
      PORTFOLIO: [
        'portfolio-developer',
        'portfolio-creative'
      ],
      CRM: ['crm-lead-card'],
      CONTENT: ['content-plan-calendar']
    };

    return templateMap[tool] || ['default'];
  }

  // ============================================
  // ✅ CHECK IF TEMPLATE EXISTS
  // ============================================
  templateExists(templateName: string): boolean {
    const filePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
    return fs.existsSync(filePath);
  }

  // ============================================
  // 🗑️ CLEAR TEMPLATE CACHE
  // ============================================
  clearCache(): void {
    this.templateCache.clear();
  }
}

export const workspaceTemplateService = new WorkspaceTemplateService();