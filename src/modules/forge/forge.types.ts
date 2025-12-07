// src/modules/forge/forge.types.ts

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔥 SORIVA FORGE - TYPE DEFINITIONS
 * AI-Powered Content Generation & Storage System
 * ═══════════════════════════════════════════════════════════════
 */

import { ForgeType } from '@prisma/client';

// ============================================
// REQUEST TYPES
// ============================================

export interface CreateForgeRequest {
  title: string;
  content: string;
  contentType: ForgeType;
  language?: string;
  sessionId?: string;
  messageId?: string;
  isPublic?: boolean;
}

export interface UpdateForgeRequest {
  title?: string;
  content?: string;
  isPublic?: boolean;
}

export interface ListForgesQuery {
  page?: number;
  limit?: number;
  contentType?: ForgeType;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface ForgeResponse {
  id: string;
  title: string;
  content: string;
  contentType: ForgeType;
  language: string | null;
  version: number;
  isPublic: boolean;
  shareToken: string | null;
  shareUrl: string | null;
  copyCount: number;
  downloadCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForgeListResponse {
  forges: ForgeResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ForgeStatsResponse {
  totalForges: number;
  byType: Record<ForgeType, number>;
  totalCopies: number;
  totalDownloads: number;
  totalViews: number;
}

// ============================================
// CONTENT TYPE MAPPINGS
// ============================================

export const FORGE_TYPE_EXTENSIONS: Record<ForgeType, string> = {
  CODE: 'txt',
  DOCUMENT: 'docx',
  MARKDOWN: 'md',
  HTML: 'html',
  TABLE: 'csv',
  JSON: 'json',
  CSV: 'csv',
  DIAGRAM: 'svg',
};

export const FORGE_TYPE_MIME: Record<ForgeType, string> = {
  CODE: 'text/plain',
  DOCUMENT: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  MARKDOWN: 'text/markdown',
  HTML: 'text/html',
  TABLE: 'text/csv',
  JSON: 'application/json',
  CSV: 'text/csv',
  DIAGRAM: 'image/svg+xml',
};

export const CODE_LANGUAGE_EXTENSIONS: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  java: 'java',
  csharp: 'cs',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rust: 'rs',
  ruby: 'rb',
  php: 'php',
  swift: 'swift',
  kotlin: 'kt',
  sql: 'sql',
  html: 'html',
  css: 'css',
  json: 'json',
  yaml: 'yaml',
  xml: 'xml',
  bash: 'sh',
  shell: 'sh',
};