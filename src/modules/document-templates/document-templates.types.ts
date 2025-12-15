// src/modules/document-templates/document-templates.types.ts

/**
 * ═══════════════════════════════════════════════════════════════
 * SORIVA DOCUMENT TEMPLATES - TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Professional document generation from AI conversations
 * LLM generates data → Template engine renders DOCX/PDF
 * 
 * Created by: Risenex Global
 * ═══════════════════════════════════════════════════════════════
 */

import { PlanType } from '../../constants/plans';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

/**
 * Template Categories
 */
export enum DocumentCategory {
  CAREER = 'career',           // Resume, Cover Letter, LinkedIn
  ACADEMIC = 'academic',       // Notes, Essays, Assignments
  BUSINESS = 'business',       // Proposals, Reports, Emails
  PERSONAL = 'personal',       // Letters, Applications
  LEGAL = 'legal',             // Agreements, Contracts (basic)
  MARKETING = 'marketing',     // Social posts, Ad copy
}

/**
 * Output format
 */
export enum DocumentFormat {
  DOCX = 'docx',
  PDF = 'pdf',
}

/**
 * Template difficulty/complexity
 */
export enum TemplateComplexity {
  SIMPLE = 'simple',       // 3-5 fields, quick generation
  MODERATE = 'moderate',   // 6-10 fields
  COMPLEX = 'complex',     // 10+ fields, multiple sections
}

/**
 * Field types for data collection
 */
export enum FieldType {
  TEXT = 'text',               // Single line text
  TEXTAREA = 'textarea',       // Multi-line text
  EMAIL = 'email',             // Email validation
  PHONE = 'phone',             // Phone validation
  DATE = 'date',               // Date picker
  SELECT = 'select',           // Dropdown options
  MULTI_SELECT = 'multi_select', // Multiple selections
  NUMBER = 'number',           // Numeric input
  URL = 'url',                 // URL validation
  LIST = 'list',               // Array of items (skills, experiences)
}

// ═══════════════════════════════════════════════════════════════
// FIELD DEFINITION
// ═══════════════════════════════════════════════════════════════

/**
 * Single field definition for data collection
 */
export interface TemplateField {
  /** Unique field identifier */
  id: string;
  
  /** Display label */
  label: string;
  
  /** Field type */
  type: FieldType;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Is this field required? */
  required: boolean;
  
  /** Validation regex pattern */
  validation?: string;
  
  /** Error message for validation */
  errorMessage?: string;
  
  /** Default value */
  defaultValue?: string | string[];
  
  /** Options for SELECT/MULTI_SELECT */
  options?: string[];
  
  /** Hint text for user */
  hint?: string;
  
  /** Order in form */
  order: number;
  
  /** Conversational prompt for AI to ask this field */
  aiPrompt: string;
  
  /** Max length for text fields */
  maxLength?: number;
  
  /** For LIST type - max items allowed */
  maxItems?: number;
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE DEFINITION
// ═══════════════════════════════════════════════════════════════

/**
 * Complete template definition
 */
export interface DocumentTemplate {
  /** Unique template ID */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Template description */
  description: string;
  
  /** Icon emoji */
  icon: string;
  
  /** Category */
  category: DocumentCategory;
  
  /** Minimum plan required */
  minPlan: PlanType;
  
  /** Output formats available */
  formats: DocumentFormat[];
  
  /** Complexity level */
  complexity: TemplateComplexity;
  
  /** Fields to collect */
  fields: TemplateField[];
  
  /** DOCX template file path */
  templateFile: string;
  
  /** System prompt for LLM to enhance/generate content */
  systemPrompt: string;
  
  /** Example output preview text */
  previewText?: string;
  
  /** Tags for search */
  tags: string[];
  
  /** Is template enabled */
  enabled: boolean;
  
  /** Display order */
  order: number;
  
  /** Estimated generation time in seconds */
  estimatedTime: number;
  
  /** Version for updates */
  version: string;
}

// ═══════════════════════════════════════════════════════════════
// REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Request to start document generation
 */
export interface StartDocumentRequest {
  templateId: string;
  sessionId?: string;
}

/**
 * Request to submit field data
 */
export interface SubmitFieldDataRequest {
  templateId: string;
  sessionId: string;
  fieldId: string;
  value: string | string[];
}

/**
 * Request to generate final document
 */
export interface GenerateDocumentRequest {
  templateId: string;
  sessionId: string;
  data: Record<string, any>;
  format: DocumentFormat;
  enhance?: boolean;  // Use LLM to enhance content
}

/**
 * Document generation progress
 */
export interface DocumentProgress {
  sessionId: string;
  templateId: string;
  currentFieldIndex: number;
  totalFields: number;
  completedFields: string[];
  pendingFields: string[];
  collectedData: Record<string, any>;
  status: 'collecting' | 'generating' | 'completed' | 'error';
  startedAt: Date;
}

/**
 * Generated document response
 */
export interface GeneratedDocument {
  sessionId: string;
  templateId: string;
  templateName: string;
  fileName: string;
  format: DocumentFormat;
  fileSize: number;
  downloadUrl: string;
  expiresAt: Date;
  generatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSES
// ═══════════════════════════════════════════════════════════════

/**
 * List templates response
 */
export interface ListTemplatesResponse {
  success: boolean;
  templates: DocumentTemplate[];
  total: number;
  accessible: number;
  locked: number;
}

/**
 * Template detail response
 */
export interface TemplateDetailResponse {
  success: boolean;
  template: DocumentTemplate;
  canAccess: boolean;
  upgradeMessage?: string;
}

/**
 * Start document response
 */
export interface StartDocumentResponse {
  success: boolean;
  sessionId: string;
  template: DocumentTemplate;
  firstField: TemplateField;
  message: string;
}

/**
 * Field submission response
 */
export interface FieldSubmissionResponse {
  success: boolean;
  sessionId: string;
  fieldId: string;
  accepted: boolean;
  nextField?: TemplateField;
  progress: DocumentProgress;
  message: string;
}

/**
 * Generation response
 */
export interface GenerationResponse {
  success: boolean;
  document?: GeneratedDocument;
  error?: string;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Active document session (stored in memory/redis)
 */
export interface DocumentSession {
  id: string;
  userId: string;
  templateId: string;
  progress: DocumentProgress;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

/**
 * Template placeholder mapping
 */
export interface PlaceholderMap {
  /** Field ID → Placeholder in DOCX */
  [fieldId: string]: string;
}

/**
 * LLM enhancement request
 */
export interface EnhanceContentRequest {
  templateId: string;
  fieldId: string;
  originalContent: string;
  context?: Record<string, any>;
}

/**
 * LLM enhancement response
 */
export interface EnhanceContentResponse {
  enhanced: string;
  suggestions?: string[];
  tokensUsed: number;
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Field validation result
 */
export interface FieldValidationResult {
  valid: boolean;
  fieldId: string;
  value: any;
  errors: string[];
}

/**
 * Template validation result
 */
export interface TemplateValidationResult {
  valid: boolean;
  templateId: string;
  fieldResults: FieldValidationResult[];
  missingRequired: string[];
  ready: boolean;
}

// ═══════════════════════════════════════════════════════════════
// EXPORT ALL
// ═══════════════════════════════════════════════════════════════

export type {
  TemplateField as ITemplateField,
  DocumentTemplate as IDocumentTemplate,
  DocumentSession as IDocumentSession,
};