// src/modules/document-templates/document-templates.service.ts

/**
 * ═══════════════════════════════════════════════════════════════
 * SORIVA DOCUMENT TEMPLATES - SERVICE
 * ═══════════════════════════════════════════════════════════════
 * 
 * Core service for document generation:
 * - Session management for multi-step data collection
 * - LLM integration to enhance content
 * - DOCX generation using docx library
 * - PDF conversion support
 * 
 * Created by: Risenex Global
 * ═══════════════════════════════════════════════════════════════
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

import { PlanType } from '../../constants/plans';
import {
  DocumentTemplate,
  DocumentFormat,
  TemplateField,
  DocumentSession,
  DocumentProgress,
  GeneratedDocument,
  StartDocumentResponse,
  FieldSubmissionResponse,
  GenerationResponse,
  FieldValidationResult,
  TemplateValidationResult,
  ListTemplatesResponse,
  TemplateDetailResponse,
} from './document-templates.types';

import {
  DocumentTemplateId,
  documentTemplatesManager,
  PLAN_DOCUMENT_ACCESS,
} from './document-templates.config';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface UserContext {
  userId: string;
  plan: PlanType;
  isInternational?: boolean;
}

interface LLMEnhanceOptions {
  systemPrompt: string;
  content: string;
  fieldContext?: string;
  maxTokens?: number;
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TEMPLATES SERVICE
// ═══════════════════════════════════════════════════════════════

export class DocumentTemplatesService {
  private static instance: DocumentTemplatesService;
  
  // In-memory session storage (use Redis in production)
  private sessions: Map<string, DocumentSession> = new Map();
  
  // Generated files storage path
  private outputDir: string;
  
  // Session expiry time (30 minutes)
  private readonly SESSION_EXPIRY_MS = 30 * 60 * 1000;
  
  // Cleanup interval (5 minutes)
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.outputDir = path.join(process.cwd(), 'temp', 'documents');
    this.ensureOutputDir();
    this.startCleanupJob();
  }

  public static getInstance(): DocumentTemplatesService {
    if (!DocumentTemplatesService.instance) {
      DocumentTemplatesService.instance = new DocumentTemplatesService();
    }
    return DocumentTemplatesService.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private startCleanupJob(): void {
    // Clean expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, session] of this.sessions) {
      if (now > session.expiresAt.getTime()) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired document sessions`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TEMPLATE LISTING & ACCESS
  // ═══════════════════════════════════════════════════════════════

  /**
   * List all templates for a user's plan
   */
  public listTemplates(user: UserContext): ListTemplatesResponse {
    const allTemplates = documentTemplatesManager.getEnabledTemplates();
    const accessibleTemplates = documentTemplatesManager.getTemplatesForPlan(user.plan);
    const lockedTemplates = documentTemplatesManager.getLockedTemplates(user.plan);

    return {
      success: true,
      templates: accessibleTemplates,
      total: allTemplates.length,
      accessible: accessibleTemplates.length,
      locked: lockedTemplates.length,
    };
  }

  /**
   * Get template details
   */
  public getTemplateDetail(
    templateId: string,
    user: UserContext
  ): TemplateDetailResponse {
    const template = documentTemplatesManager.getTemplate(templateId as DocumentTemplateId);
    
    if (!template) {
      return {
        success: false,
        template: null as any,
        canAccess: false,
        upgradeMessage: 'Template not found',
      };
    }

    const canAccess = documentTemplatesManager.canAccessTemplate(
      user.plan,
      templateId as DocumentTemplateId
    );

    let upgradeMessage: string | undefined;
    if (!canAccess) {
      const planNames: Record<PlanType, string> = {
        [PlanType.STARTER]: 'Starter',
        [PlanType.PLUS]: 'Plus',
        [PlanType.PRO]: 'Pro',
        [PlanType.APEX]: 'Apex',
        [PlanType.SOVEREIGN]: 'Sovereign',
      };
      upgradeMessage = `Upgrade to ${planNames[template.minPlan]} to access ${template.name}`;
    }

    return {
      success: true,
      template,
      canAccess,
      upgradeMessage,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Start a new document generation session
   */
  public startDocument(
    templateId: string,
    user: UserContext
  ): StartDocumentResponse {
    // Check access
    const canAccess = documentTemplatesManager.canAccessTemplate(
      user.plan,
      templateId as DocumentTemplateId
    );

    if (!canAccess) {
      return {
        success: false,
        sessionId: '',
        template: null as any,
        firstField: null as any,
        message: 'You do not have access to this template. Please upgrade your plan.',
      };
    }

    const template = documentTemplatesManager.getTemplate(templateId as DocumentTemplateId);
    if (!template) {
      return {
        success: false,
        sessionId: '',
        template: null as any,
        firstField: null as any,
        message: 'Template not found',
      };
    }

    if (template.fields.length === 0) {
      return {
        success: false,
        sessionId: '',
        template: null as any,
        firstField: null as any,
        message: 'This template is not yet available. Coming soon!',
      };
    }

    // Create session
    const sessionId = uuidv4();
    const sortedFields = [...template.fields].sort((a, b) => a.order - b.order);
    const now = new Date();

    const session: DocumentSession = {
      id: sessionId,
      userId: user.userId,
      templateId,
      progress: {
        sessionId,
        templateId,
        currentFieldIndex: 0,
        totalFields: sortedFields.length,
        completedFields: [],
        pendingFields: sortedFields.map(f => f.id),
        collectedData: {},
        status: 'collecting',
        startedAt: now,
      },
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + this.SESSION_EXPIRY_MS),
    };

    this.sessions.set(sessionId, session);

    const firstField = sortedFields[0];

    return {
      success: true,
      sessionId,
      template,
      firstField,
      message: firstField.aiPrompt || `Please provide your ${firstField.label}`,
    };
  }

  /**
   * Get session by ID
   */
  public getSession(sessionId: string): DocumentSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check expiry
    if (Date.now() > session.expiresAt.getTime()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Submit field data
   */
  public submitField(
    sessionId: string,
    fieldId: string,
    value: string | string[],
    user: UserContext
  ): FieldSubmissionResponse {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return {
        success: false,
        sessionId,
        fieldId,
        accepted: false,
        progress: null as any,
        message: 'Session expired or not found. Please start again.',
      };
    }

    // Verify user owns this session
    if (session.userId !== user.userId) {
      return {
        success: false,
        sessionId,
        fieldId,
        accepted: false,
        progress: null as any,
        message: 'Unauthorized access to session',
      };
    }

    const template = documentTemplatesManager.getTemplate(
      session.templateId as DocumentTemplateId
    );
    
    if (!template) {
      return {
        success: false,
        sessionId,
        fieldId,
        accepted: false,
        progress: null as any,
        message: 'Template not found',
      };
    }

    // Find the field
    const field = template.fields.find(f => f.id === fieldId);
    if (!field) {
      return {
        success: false,
        sessionId,
        fieldId,
        accepted: false,
        progress: session.progress,
        message: 'Invalid field',
      };
    }

    // Validate field
    const validation = this.validateField(field, value);
    if (!validation.valid) {
      return {
        success: false,
        sessionId,
        fieldId,
        accepted: false,
        progress: session.progress,
        message: validation.errors.join(', '),
      };
    }

    // Store value
    session.progress.collectedData[fieldId] = value;
    session.progress.completedFields.push(fieldId);
    session.progress.pendingFields = session.progress.pendingFields.filter(
      id => id !== fieldId
    );
    session.progress.currentFieldIndex++;
    session.updatedAt = new Date();

    // Check if all required fields are done
    const sortedFields = [...template.fields].sort((a, b) => a.order - b.order);
    const nextFieldIndex = session.progress.currentFieldIndex;
    
    let nextField: TemplateField | undefined;
    
    // Find next unanswered field
    for (let i = nextFieldIndex; i < sortedFields.length; i++) {
      const f = sortedFields[i];
      if (!session.progress.completedFields.includes(f.id)) {
        nextField = f;
        break;
      }
    }

    // Update session
    this.sessions.set(sessionId, session);

    if (nextField) {
      return {
        success: true,
        sessionId,
        fieldId,
        accepted: true,
        nextField,
        progress: session.progress,
        message: nextField.aiPrompt || `Please provide your ${nextField.label}`,
      };
    }

    // All fields done - ready to generate
    session.progress.status = 'generating';
    this.sessions.set(sessionId, session);

    return {
      success: true,
      sessionId,
      fieldId,
      accepted: true,
      progress: session.progress,
      message: 'All information collected! Ready to generate your document. Say "generate" or "create document" to proceed.',
    };
  }

  /**
   * Skip optional field
   */
  public skipField(
    sessionId: string,
    fieldId: string,
    user: UserContext
  ): FieldSubmissionResponse {
    const session = this.getSession(sessionId);
    
    if (!session || session.userId !== user.userId) {
      return {
        success: false,
        sessionId,
        fieldId,
        accepted: false,
        progress: null as any,
        message: 'Session not found or unauthorized',
      };
    }

    const template = documentTemplatesManager.getTemplate(
      session.templateId as DocumentTemplateId
    );
    
    if (!template) {
      return {
        success: false,
        sessionId,
        fieldId,
        accepted: false,
        progress: null as any,
        message: 'Template not found',
      };
    }

    const field = template.fields.find(f => f.id === fieldId);
    
    if (!field) {
      return {
        success: false,
        sessionId,
        fieldId,
        accepted: false,
        progress: session.progress,
        message: 'Field not found',
      };
    }

    if (field.required) {
      return {
        success: false,
        sessionId,
        fieldId,
        accepted: false,
        progress: session.progress,
        message: `${field.label} is required and cannot be skipped.`,
      };
    }

    // Mark as skipped (store empty/default)
    session.progress.collectedData[fieldId] = field.defaultValue || '';
    session.progress.completedFields.push(fieldId);
    session.progress.pendingFields = session.progress.pendingFields.filter(
      id => id !== fieldId
    );
    session.progress.currentFieldIndex++;
    session.updatedAt = new Date();

    // Find next field
    const sortedFields = [...template.fields].sort((a, b) => a.order - b.order);
    let nextField: TemplateField | undefined;
    
    for (let i = session.progress.currentFieldIndex; i < sortedFields.length; i++) {
      const f = sortedFields[i];
      if (!session.progress.completedFields.includes(f.id)) {
        nextField = f;
        break;
      }
    }

    this.sessions.set(sessionId, session);

    if (nextField) {
      return {
        success: true,
        sessionId,
        fieldId,
        accepted: true,
        nextField,
        progress: session.progress,
        message: nextField.aiPrompt || `Please provide your ${nextField.label}`,
      };
    }

    session.progress.status = 'generating';
    this.sessions.set(sessionId, session);

    return {
      success: true,
      sessionId,
      fieldId,
      accepted: true,
      progress: session.progress,
      message: 'All information collected! Ready to generate your document.',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════

  private validateField(
    field: TemplateField,
    value: string | string[]
  ): FieldValidationResult {
    const errors: string[] = [];

    // Required check
    if (field.required) {
      if (Array.isArray(value)) {
        if (value.length === 0 || value.every(v => !v.trim())) {
          errors.push(`${field.label} is required`);
        }
      } else if (!value || !value.trim()) {
        errors.push(`${field.label} is required`);
      }
    }

    // Skip further validation if empty and not required
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return { valid: errors.length === 0, fieldId: field.id, value, errors };
    }

    const stringValue = Array.isArray(value) ? value.join(' ') : value;

    // Regex validation
    if (field.validation && stringValue) {
      const regex = new RegExp(field.validation);
      if (!regex.test(stringValue)) {
        errors.push(field.errorMessage || `Invalid ${field.label} format`);
      }
    }

    // Max length
    if (field.maxLength && stringValue.length > field.maxLength) {
      errors.push(`${field.label} must be less than ${field.maxLength} characters`);
    }

    // Max items for list
    if (field.maxItems && Array.isArray(value) && value.length > field.maxItems) {
      errors.push(`Maximum ${field.maxItems} items allowed for ${field.label}`);
    }

    return {
      valid: errors.length === 0,
      fieldId: field.id,
      value,
      errors,
    };
  }

  public validateAllFields(
    templateId: string,
    data: Record<string, any>
  ): TemplateValidationResult {
    const template = documentTemplatesManager.getTemplate(
      templateId as DocumentTemplateId
    );
    
    if (!template) {
      return {
        valid: false,
        templateId,
        fieldResults: [],
        missingRequired: [],
        ready: false,
      };
    }

    const fieldResults: FieldValidationResult[] = [];
    const missingRequired: string[] = [];

    for (const field of template.fields) {
      const value = data[field.id];
      const result = this.validateField(field, value);
      fieldResults.push(result);

      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        missingRequired.push(field.id);
      }
    }

    const allValid = fieldResults.every(r => r.valid);
    const noMissing = missingRequired.length === 0;

    return {
      valid: allValid && noMissing,
      templateId,
      fieldResults,
      missingRequired,
      ready: allValid && noMissing,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // DOCUMENT GENERATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate the final document
   */
  public async generateDocument(
    sessionId: string,
    format: DocumentFormat,
    user: UserContext,
    enhance: boolean = true
  ): Promise<GenerationResponse> {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return {
        success: false,
        message: 'Session expired or not found. Please start again.',
      };
    }

    if (session.userId !== user.userId) {
      return {
        success: false,
        message: 'Unauthorized',
      };
    }

    const template = documentTemplatesManager.getTemplate(
      session.templateId as DocumentTemplateId
    );
    
    if (!template) {
      return {
        success: false,
        message: 'Template not found',
      };
    }

    // Validate all required fields
    const validation = this.validateAllFields(
      session.templateId,
      session.progress.collectedData
    );

    if (!validation.ready) {
      const missingLabels = validation.missingRequired
        .map(id => template.fields.find(f => f.id === id)?.label || id)
        .join(', ');
      
      return {
        success: false,
        message: `Missing required fields: ${missingLabels}`,
      };
    }

    try {
      // Enhance content with LLM if requested
      let documentData = { ...session.progress.collectedData };
      
      if (enhance) {
        documentData = await this.enhanceContent(template, documentData);
      }

      // Generate DOCX
      const docxBuffer = await this.generateDocx(template, documentData);

      // Save file
      const fileName = this.generateFileName(template, format);
      const filePath = path.join(this.outputDir, fileName);
      
      fs.writeFileSync(filePath, docxBuffer);

      // Get file stats
      const stats = fs.statSync(filePath);

      // Create download URL (adjust based on your server setup)
      const downloadUrl = `/api/document-templates/download/${fileName}`;

      // Set expiry (1 hour)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      const document: GeneratedDocument = {
        sessionId,
        templateId: session.templateId,
        templateName: template.name,
        fileName,
        format,
        fileSize: stats.size,
        downloadUrl,
        expiresAt,
        generatedAt: new Date(),
      };

      // Update session status
      session.progress.status = 'completed';
      this.sessions.set(sessionId, session);

      return {
        success: true,
        document,
        message: `Your ${template.name} is ready! Click download to get your document.`,
      };

    } catch (error) {
      console.error('Document generation error:', error);
      
      session.progress.status = 'error';
      this.sessions.set(sessionId, session);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed',
        message: 'Failed to generate document. Please try again.',
      };
    }
  }

  /**
   * Generate DOCX from template
   */
  private async generateDocx(
    template: DocumentTemplate,
    data: Record<string, any>
  ): Promise<Buffer> {
    const templatePath = path.join(process.cwd(), 'src', template.templateFile);
    
    // Check if template file exists
    if (!fs.existsSync(templatePath)) {
      // If template doesn't exist, create document programmatically
      return this.createDocxProgrammatically(template, data);
    }

    // Load template
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
    });

    // Prepare data for template
    const templateData = this.prepareTemplateData(template, data);

    // Render
    doc.render(templateData);

    // Generate buffer
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    return buffer;
  }

  /**
   * Create DOCX programmatically when no template file exists
   */
  private async createDocxProgrammatically(
    template: DocumentTemplate,
    data: Record<string, any>
  ): Promise<Buffer> {
    // Dynamic import to handle ESM/CommonJS
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } = await import('docx');

    const children: any[] = [];

    // Title
    children.push(
      new Paragraph({
        text: data.fullName || data.applicantName || data.proposerName || 'Document',
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      })
    );

    // Process each field
    for (const field of template.fields.sort((a, b) => a.order - b.order)) {
      const value = data[field.id];
      
      if (!value || (Array.isArray(value) && value.length === 0)) {
        continue;
      }

      // Add section header for certain fields
      if (['education', 'skills', 'projects', 'internships', 'certifications', 'achievements'].includes(field.id)) {
        children.push(
          new Paragraph({
            text: field.label.toUpperCase(),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            },
          })
        );
      }

      // Add content
      if (Array.isArray(value)) {
        for (const item of value) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: '• ', bold: true }),
                new TextRun(item),
              ],
              spacing: { after: 100 },
            })
          );
        }
      } else if (field.id === 'objective' || field.id === 'executiveSummary') {
        children.push(
          new Paragraph({
            text: field.label.toUpperCase(),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          })
        );
        children.push(
          new Paragraph({
            text: value,
            spacing: { after: 200 },
          })
        );
      } else if (['email', 'phone', 'location', 'linkedin'].includes(field.id)) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: value, size: 22 }),
              new TextRun({ text: '  |  ', color: '666666' }),
            ],
            spacing: { after: 50 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * Prepare data for template placeholders
   */
  private prepareTemplateData(
    template: DocumentTemplate,
    data: Record<string, any>
  ): Record<string, any> {
    const prepared: Record<string, any> = {};

    for (const field of template.fields) {
      const value = data[field.id];
      
      if (Array.isArray(value)) {
        // For list fields, join with newlines or format as needed
        prepared[field.id] = value.filter(v => v).join('\n');
        prepared[`${field.id}_list`] = value.filter(v => v).map(v => ({ item: v }));
      } else {
        prepared[field.id] = value || '';
      }
    }

    // Add metadata
    prepared.generatedDate = new Date().toLocaleDateString('en-IN');
    prepared.generatedBy = 'Soriva AI';

    return prepared;
  }

  /**
   * Enhance content using LLM
   */
  private async enhanceContent(
    template: DocumentTemplate,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    // TODO: Integrate with your AI service
    // For now, return data as-is
    // In production, call your LLM to enhance each text field
    
    const enhanced = { ...data };

    // Example enhancement for objective field
    if (enhanced.objective && template.systemPrompt) {
      // enhanced.objective = await this.callLLM({
      //   systemPrompt: template.systemPrompt,
      //   content: enhanced.objective,
      //   fieldContext: 'career objective',
      //   maxTokens: 150,
      // });
    }

    return enhanced;
  }

  /**
   * Generate unique filename
   */
  private generateFileName(
    template: DocumentTemplate,
    format: DocumentFormat
  ): string {
    const timestamp = Date.now();
    const slug = template.name.toLowerCase().replace(/\s+/g, '-');
    return `${slug}-${timestamp}.${format}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // FILE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get file path for download
   */
  public getFilePath(fileName: string): string | null {
    const filePath = path.join(this.outputDir, fileName);
    
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    
    return null;
  }

  /**
   * Delete generated file
   */
  public deleteFile(fileName: string): boolean {
    const filePath = path.join(this.outputDir, fileName);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    
    return false;
  }

  /**
   * Cleanup old files (call periodically)
   */
  public cleanupOldFiles(maxAgeMs: number = 60 * 60 * 1000): number {
    let deleted = 0;
    const now = Date.now();

    try {
      const files = fs.readdirSync(this.outputDir);
      
      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      }
    } catch (error) {
      console.error('Error cleaning up files:', error);
    }

    return deleted;
  }

  // ═══════════════════════════════════════════════════════════════
  // PROGRESS & STATUS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get current progress of a session
   */
  public getProgress(sessionId: string): DocumentProgress | null {
    const session = this.getSession(sessionId);
    return session?.progress || null;
  }

  /**
   * Get next question/prompt for conversational flow
   */
  public getNextPrompt(sessionId: string): string | null {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return null;
    }

    const template = documentTemplatesManager.getTemplate(
      session.templateId as DocumentTemplateId
    );
    
    if (!template) {
      return null;
    }

    const sortedFields = [...template.fields].sort((a, b) => a.order - b.order);
    
    for (const field of sortedFields) {
      if (!session.progress.completedFields.includes(field.id)) {
        return field.aiPrompt || `Please provide your ${field.label}`;
      }
    }

    return 'All information collected! Say "generate" to create your document.';
  }

  // ═══════════════════════════════════════════════════════════════
  // DESTROY
  // ═══════════════════════════════════════════════════════════════

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.sessions.clear();
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const documentTemplatesService = DocumentTemplatesService.getInstance();