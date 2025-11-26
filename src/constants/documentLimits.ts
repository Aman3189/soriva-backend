// src/constants/documentLimits.ts

/**
 * ==========================================
 * DOCUMENT INTELLIGENCE - LIMITS & CONFIGURATION
 * ==========================================
 * Created: November 23, 2025
 * Updated: November 25, 2025 - ADDED 5 NEW OPERATIONS (2 FREE + 3 PAID)
 * 
 * NEW OPERATIONS ADDED:
 * FREE:
 * - EXPLAIN_SIMPLE: ELI5 mode - explain complex topics simply
 * - EXTRACT_DEFINITIONS: Find and extract key definitions
 * 
 * PAID (Featured Actions):
 * - EXPLAIN_AS_TEACHER: Full teaching mode with examples, diagrams, formulas
 * - CONTENT_TO_SCRIPT: Convert content to YouTube/Podcast scripts
 * - NOTES_TO_QUIZ_TURBO: All-in-one instant test generator
 * 
 * TOTAL NOW: 7 FREE + 26 PAID = 33 operations
 * 
 * AI ROUTING (Cost Optimized):
 * - 85% Gemini 2.0 Flash (FREE) - Simple operations
 * - 10% GPT-4o-mini (₹51/1M output) - Medium operations  
 * - 5% Gemini 1.5 Pro (₹425/1M output) - Complex operations
 */

// ==========================================
// FREE vs PAID OPERATIONS
// Matches Prisma OperationType enum exactly
// ==========================================

/**
 * FREE Operations (7) - Near Zero Cost
 * - KEYWORD_EXTRACT: Local NLP, ₹0.00
 * - DOCUMENT_CLEANUP: Regex local, ₹0.00
 * - SUMMARY_SHORT: Single Gemini call, ₹0.01-0.02
 * - SUMMARY_BULLET: Single Gemini call, ₹0.01-0.02
 * - FLASHCARDS: Limited to 5 cards, ₹0.02-0.03
 * - EXPLAIN_SIMPLE: ELI5 explanation, ₹0.01-0.02
 * - EXTRACT_DEFINITIONS: Key definitions, ₹0.01-0.02
 * 
 * Total per FREE user: ₹0.05-0.10 per document
 * 15 docs/month = ₹0.75-1.50 max cost
 */
export const FREE_OPERATIONS = [
  'SUMMARY_SHORT',
  'SUMMARY_BULLET',
  'KEYWORD_EXTRACT',
  'DOCUMENT_CLEANUP',
  'FLASHCARDS',
  'EXPLAIN_SIMPLE', // ✅ NEW: ELI5 Mode
  'EXTRACT_DEFINITIONS', // ✅ NEW: Find Key Definitions
] as const;

export const PAID_OPERATIONS = [
  'SUMMARY_LONG',
  'TRANSLATE_BASIC',
  'TEST_GENERATOR',
  'NOTES_GENERATOR',
  'TOPIC_BREAKDOWN',
  'CROSS_PDF_COMPARE',
  'TABLE_TO_CHARTS',
  'SUMMARIES_ADVANCED',
  'INSIGHTS_EXTRACTION',
  'DOCUMENT_CLEANUP_ADVANCED',
  'KEYWORD_INDEX_EXTRACTOR',
  'WORKFLOW_CONVERSION',
  'PRESENTATION_MAKER',
  'QUESTION_BANK',
  'FILL_IN_BLANKS',
  'DOCUMENT_CHAT_MEMORY',
  'TRANSLATE_SIMPLIFY_ADVANCED',
  'DIAGRAM_INTERPRETATION',
  'TREND_ANALYSIS',
  'CONTRACT_LAW_SCAN',
  'MULTI_DOC_REASONING',
  'VOICE_MODE',
  'REPORT_BUILDER',
  'AI_DETECTION_REDACTION',
  'EXPLAIN_AS_TEACHER', // ✅ NEW: Full teaching mode with examples
  'CONTENT_TO_SCRIPT', // ✅ NEW: YouTube/Podcast script generator
  'NOTES_TO_QUIZ_TURBO', // ✅ NEW: All-in-one test generator
] as const;

// All operations combined
export const ALL_OPERATIONS = [...FREE_OPERATIONS, ...PAID_OPERATIONS] as const;

// ==========================================
// DOCUMENT STATUS
// ==========================================

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
  FAILED: 'failed',
} as const;

// ==========================================
// FEATURE CATEGORIES (17 Categories - UPDATED)
// 14 Regular + 3 Featured Actions
// ==========================================

export const FEATURE_CATEGORIES = {
  PDF_SUMMARY: {
    id: 'PDF_SUMMARY',
    name: 'PDF → Summary/Notes',
    description: 'Convert PDFs to summaries and notes',
    icon: '📄',
    operations: ['SUMMARY_SHORT', 'SUMMARY_BULLET', 'SUMMARY_LONG', 'SUMMARIES_ADVANCED'],
  },
  TEST_GENERATOR: {
    id: 'TEST_GENERATOR',
    name: 'Test Paper Generator',
    description: 'Create tests and question papers',
    icon: '📝',
    operations: ['TEST_GENERATOR', 'QUESTION_BANK', 'FILL_IN_BLANKS'],
  },
  PPT_MAKER: {
    id: 'PPT_MAKER',
    name: 'PPT Maker',
    description: 'Generate presentations from documents',
    icon: '📊',
    operations: ['PRESENTATION_MAKER'],
  },
  NOTES_MAKER: {
    id: 'NOTES_MAKER',
    name: 'Notes Maker',
    description: 'Generate structured study notes',
    icon: '📒',
    operations: ['NOTES_GENERATOR', 'TOPIC_BREAKDOWN'],
  },
  IMAGE_SOLVER: {
    id: 'IMAGE_SOLVER',
    name: 'Image Doubt Solver',
    description: 'Solve doubts from images',
    icon: '🖼️',
    operations: ['DIAGRAM_INTERPRETATION'],
  },
  DATA_INSIGHTS: {
    id: 'DATA_INSIGHTS',
    name: 'Excel/CSV → Insights',
    description: 'Extract insights from data files',
    icon: '📈',
    operations: ['TABLE_TO_CHARTS', 'TREND_ANALYSIS', 'INSIGHTS_EXTRACTION'],
  },
  ASSIGNMENT: {
    id: 'ASSIGNMENT',
    name: 'Assignment & Project Maker',
    description: 'Create assignments and projects',
    icon: '📚',
    operations: ['REPORT_BUILDER', 'WORKFLOW_CONVERSION'],
  },
  RESEARCH: {
    id: 'RESEARCH',
    name: 'Research Helper',
    description: 'Research assistance tools',
    icon: '🔬',
    operations: ['CROSS_PDF_COMPARE', 'MULTI_DOC_REASONING'],
  },
  DOCUMENT_QA: {
    id: 'DOCUMENT_QA',
    name: 'Document Q&A',
    description: 'Ask questions about documents',
    icon: '❓',
    operations: ['DOCUMENT_CHAT_MEMORY', 'KEYWORD_EXTRACT'],
  },
  BOOK_OVERVIEW: {
    id: 'BOOK_OVERVIEW',
    name: 'Chapter & Book Overview',
    description: 'Get overviews of chapters and books',
    icon: '📖',
    operations: ['KEYWORD_INDEX_EXTRACTOR'],
  },
  FORMAT_CONVERT: {
    id: 'FORMAT_CONVERT',
    name: 'Format Converter',
    description: 'Convert document formats',
    icon: '🔄',
    operations: ['DOCUMENT_CLEANUP', 'DOCUMENT_CLEANUP_ADVANCED', 'TRANSLATE_BASIC', 'TRANSLATE_SIMPLIFY_ADVANCED'],
  },
  SPECIAL: {
    id: 'SPECIAL',
    name: 'Special Features',
    description: 'Advanced special features',
    icon: '⭐',
    operations: ['CONTRACT_LAW_SCAN', 'AI_DETECTION_REDACTION', 'VOICE_MODE', 'FLASHCARDS'],
  },
  // ✅ NEW CATEGORIES
  SIMPLIFY: {
    id: 'SIMPLIFY',
    name: 'Simplify & Explain',
    description: 'Make complex content easy to understand',
    icon: '🧒',
    operations: ['EXPLAIN_SIMPLE'],
  },
  DEFINITIONS: {
    id: 'DEFINITIONS',
    name: 'Key Definitions',
    description: 'Extract important definitions',
    icon: '📖',
    operations: ['EXTRACT_DEFINITIONS'],
  },
  // ✅ FEATURED ACTIONS (3 Special Shortcuts)
  TEACHER_MODE: {
    id: 'TEACHER_MODE',
    name: 'Explain Like a Teacher',
    description: 'Get detailed teaching-style explanations with examples, diagrams, and formulas',
    icon: '👨‍🏫',
    operations: ['EXPLAIN_AS_TEACHER'],
    featured: true,
  },
  SCRIPT_MAKER: {
    id: 'SCRIPT_MAKER',
    name: 'Content → Script',
    description: 'Convert to YouTube, Podcast, or Presentation scripts',
    icon: '🎬',
    operations: ['CONTENT_TO_SCRIPT'],
    featured: true,
  },
  QUIZ_TURBO: {
    id: 'QUIZ_TURBO',
    name: 'Notes → Quiz Turbo',
    description: 'Instant test generation with MCQs, True/False, Case Studies',
    icon: '❓',
    operations: ['NOTES_TO_QUIZ_TURBO'],
    featured: true,
  },
} as const;

// ==========================================
// TOKEN CAPS (Cost Control - Step 4)
// ==========================================

export const TOKEN_CAPS = {
  // FREE operations - minimal tokens
  SUMMARY_SHORT: { input: 2000, output: 200 },
  SUMMARY_BULLET: { input: 2000, output: 300 },
  KEYWORD_EXTRACT: { input: 2000, output: 200 },
  DOCUMENT_CLEANUP: { input: 3000, output: 3000 },
  FLASHCARDS: { input: 2000, output: 500 }, // 5 cards only for FREE
  EXPLAIN_SIMPLE: { input: 2000, output: 400 }, // ✅ NEW
  EXTRACT_DEFINITIONS: { input: 2000, output: 300 }, // ✅ NEW

  // PAID operations - higher limits
  SUMMARY_LONG: { input: 4000, output: 800 },
  TRANSLATE_BASIC: { input: 4000, output: 4000 },
  TEST_GENERATOR: { input: 4000, output: 2000 },
  NOTES_GENERATOR: { input: 5000, output: 2000 },
  TOPIC_BREAKDOWN: { input: 5000, output: 2000 },
  CROSS_PDF_COMPARE: { input: 8000, output: 2000 },
  TABLE_TO_CHARTS: { input: 4000, output: 1500 },
  SUMMARIES_ADVANCED: { input: 6000, output: 1500 },
  INSIGHTS_EXTRACTION: { input: 5000, output: 1500 },
  DOCUMENT_CLEANUP_ADVANCED: { input: 5000, output: 5000 },
  KEYWORD_INDEX_EXTRACTOR: { input: 6000, output: 1500 },
  WORKFLOW_CONVERSION: { input: 5000, output: 2000 },
  PRESENTATION_MAKER: { input: 6000, output: 4500 },
  QUESTION_BANK: { input: 5000, output: 3000 },
  FILL_IN_BLANKS: { input: 4000, output: 2000 },
  DOCUMENT_CHAT_MEMORY: { input: 6000, output: 1500 },
  TRANSLATE_SIMPLIFY_ADVANCED: { input: 5000, output: 5000 },
  DIAGRAM_INTERPRETATION: { input: 4000, output: 1500 },
  TREND_ANALYSIS: { input: 6000, output: 2000 },
  CONTRACT_LAW_SCAN: { input: 8000, output: 3000 },
  MULTI_DOC_REASONING: { input: 10000, output: 3000 },
  VOICE_MODE: { input: 4000, output: 1500 },
  REPORT_BUILDER: { input: 8000, output: 4000 },
  AI_DETECTION_REDACTION: { input: 5000, output: 2000 },
  // ✅ NEW FEATURED OPERATIONS
  EXPLAIN_AS_TEACHER: { input: 6000, output: 3500 }, // Detailed teaching mode
  CONTENT_TO_SCRIPT: { input: 5000, output: 3000 }, // Script generation
  NOTES_TO_QUIZ_TURBO: { input: 5000, output: 3500 }, // Comprehensive quiz
} as const;

// ==========================================
// DOCUMENT LIMITS (FREE vs PAID)
// ==========================================

export const DOCUMENT_LIMITS = {
  FREE: {
    // Monthly limits
    documentsPerMonth: 15,
    operationsPerDocument: 3,
    totalOperationsPerMonth: 45, // 15 docs × 3 ops
    
    // Daily limits
    documentsPerDay: 2,
    operationsPerDay: 10,
    
    // File constraints
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFileSizeMB: 5,
    maxPages: 100,
    maxWordCount: 25000,
    
    // Storage
    totalStorageLimit: 50 * 1024 * 1024, // 50MB total
    totalStorageLimitMB: 50,
    
    // Features
    allowedOperations: FREE_OPERATIONS,
    
    // AI routing (FREE = Gemini Flash only)
    aiProvider: 'google' as const,
    aiModel: 'gemini-2.0-flash-exp',
    maxTokensPerOperation: 2500,
    
    // Rate limiting
    operationsPerHour: 10,
    
    // Processing
    maxProcessingTime: 30000, // 30 seconds
    priorityQueue: false,
    
    // Cost
    avgCostPerOperation: 0.02, // ₹0.02
  },
  
  PAID: {
    // Monthly limits (₹149 addon)
    documentsPerMonth: 100,
    operationsPerDocument: -1, // unlimited
    totalOperationsPerMonth: -1, // unlimited
    
    // Daily limits
    documentsPerDay: 10,
    operationsPerDay: 50,
    
    // File constraints
    maxFileSize: 25 * 1024 * 1024, // 25MB
    maxFileSizeMB: 25,
    maxPages: 300,
    maxWordCount: 100000,
    
    // Storage
    totalStorageLimit: 500 * 1024 * 1024, // 500MB total
    totalStorageLimitMB: 500,
    
    // Features
    allowedOperations: ALL_OPERATIONS,
    
    // AI routing (Smart routing - 3 tiers)
    aiProvider: 'smart' as const,
    aiModel: 'gemini-2.0-flash-exp', // Primary (85%)
    fallbackModel: 'gpt-4o-mini', // Secondary (10%)
    premiumModel: 'gemini-1.5-pro', // Complex (5%)
    maxTokensPerOperation: 10000,
    
    // Rate limiting
    operationsPerHour: 30,
    
    // Processing
    maxProcessingTime: 120000, // 2 minutes
    priorityQueue: true,
    
    // Cost
    avgCostPerOperation: 0.25, // ₹0.25 avg
  },
} as const;

// ==========================================
// AI MODEL ROUTING RULES
// ==========================================

export const AI_ROUTING_RULES = {
  GEMINI: {
    operations: [
      // FREE operations (always use Flash)
      'SUMMARY_SHORT',
      'SUMMARY_BULLET',
      'KEYWORD_EXTRACT',
      'DOCUMENT_CLEANUP',
      'FLASHCARDS',
      'EXPLAIN_SIMPLE', // ✅ NEW
      'EXTRACT_DEFINITIONS', // ✅ NEW
    ],
    provider: 'google' as const,
    model: 'gemini-2.0-flash-exp',
    inputCostPer1M: 0, // FREE tier
    outputCostPer1M: 0, // FREE tier
    tier: 'gemini' as const,
  },
  
  GPT: {
    operations: [
      'SUMMARY_LONG',
      'SUMMARIES_ADVANCED',
      'NOTES_GENERATOR',
      'TOPIC_BREAKDOWN',
      'TEST_GENERATOR',
      'QUESTION_BANK',
      'FILL_IN_BLANKS',
      'PRESENTATION_MAKER',
      'REPORT_BUILDER',
      'WORKFLOW_CONVERSION',
      'TRANSLATE_BASIC',
      'TRANSLATE_SIMPLIFY_ADVANCED',
      'DOCUMENT_CLEANUP_ADVANCED',
      'TABLE_TO_CHARTS',
      'KEYWORD_INDEX_EXTRACTOR',
      'VOICE_MODE',
      'EXPLAIN_AS_TEACHER', // ✅ NEW: Teaching mode
      'CONTENT_TO_SCRIPT', // ✅ NEW: Script generator
      'NOTES_TO_QUIZ_TURBO', // ✅ NEW: Quiz turbo
    ],
    provider: 'openai' as const,
    model: 'gpt-4o-mini',
    inputCostPer1M: 0.15 * 85,
    outputCostPer1M: 0.60 * 85,
    tier: 'gpt' as const,
  },
  
  HAIKU: {
    operations: [
      'CONTRACT_LAW_SCAN',
      'MULTI_DOC_REASONING',
      'INSIGHTS_EXTRACTION',
      'TREND_ANALYSIS',
      'AI_DETECTION_REDACTION',
      'CROSS_PDF_COMPARE',
      'DIAGRAM_INTERPRETATION',
      'DOCUMENT_CHAT_MEMORY',
    ],
    provider: 'anthropic' as const,
    model: 'claude-haiku-4-5-20251001',
    inputCostPer1M: 0.80 * 85,
    outputCostPer1M: 4 * 85,
    tier: 'haiku' as const,
  },
} as const;

// ==========================================
// FILE TYPE SUPPORT
// ==========================================

export const SUPPORTED_FILE_TYPES = {
  'application/pdf': {
    extension: '.pdf',
    maxSize: DOCUMENT_LIMITS.PAID.maxFileSize,
    supported: true,
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extension: '.docx',
    maxSize: DOCUMENT_LIMITS.PAID.maxFileSize,
    supported: true,
  },
  'text/plain': {
    extension: '.txt',
    maxSize: DOCUMENT_LIMITS.PAID.maxFileSize,
    supported: true,
  },
  'text/markdown': {
    extension: '.md',
    maxSize: DOCUMENT_LIMITS.PAID.maxFileSize,
    supported: true,
  },
  'image/png': {
    extension: '.png',
    maxSize: 10 * 1024 * 1024,
    supported: true,
  },
  'image/jpeg': {
    extension: '.jpg',
    maxSize: 10 * 1024 * 1024,
    supported: true,
  },
} as const;

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg'] as const;

// ==========================================
// OPERATION METADATA
// ==========================================

export const OPERATION_METADATA: Record<string, {
  name: string;
  description: string;
  category: 'free' | 'paid';
  categoryId: string;
  estimatedTokens: number;
  estimatedCost: number;
  processingTime: string;
  aiTier: 'gemini' | 'gpt' | 'haiku';
}> = {
  // ===== FREE Operations (Gemini Flash) =====
  SUMMARY_SHORT: {
    name: 'Quick Summary',
    description: '2-3 sentence summary',
    category: 'free',
    categoryId: 'PDF_SUMMARY',
    estimatedTokens: 400,
    estimatedCost: 0,
    processingTime: '3-5s',
    aiTier: 'gemini',
  },
  SUMMARY_BULLET: {
    name: 'Bullet Summary',
    description: '5-7 key bullet points',
    category: 'free',
    categoryId: 'PDF_SUMMARY',
    estimatedTokens: 500,
    estimatedCost: 0,
    processingTime: '4-6s',
    aiTier: 'gemini',
  },
  KEYWORD_EXTRACT: {
    name: 'Keyword Extraction',
    description: 'Extract important keywords',
    category: 'free',
    categoryId: 'DOCUMENT_QA',
    estimatedTokens: 300,
    estimatedCost: 0,
    processingTime: '2-4s',
    aiTier: 'gemini',
  },
  DOCUMENT_CLEANUP: {
    name: 'Document Cleanup',
    description: 'Fix formatting and errors',
    category: 'free',
    categoryId: 'FORMAT_CONVERT',
    estimatedTokens: 500,
    estimatedCost: 0,
    processingTime: '4-6s',
    aiTier: 'gemini',
  },
  FLASHCARDS: {
    name: 'Flashcards',
    description: 'Generate 5 study flashcards',
    category: 'free',
    categoryId: 'SPECIAL',
    estimatedTokens: 600,
    estimatedCost: 0,
    processingTime: '5-8s',
    aiTier: 'gemini',
  },
  // ✅ NEW FREE OPERATIONS
  EXPLAIN_SIMPLE: {
    name: 'Explain Like I\'m 5',
    description: 'Simplify complex topics for easy understanding',
    category: 'free',
    categoryId: 'SIMPLIFY',
    estimatedTokens: 600,
    estimatedCost: 0,
    processingTime: '5-8s',
    aiTier: 'gemini',
  },
  EXTRACT_DEFINITIONS: {
    name: 'Key Definitions',
    description: 'Extract and list important definitions',
    category: 'free',
    categoryId: 'DEFINITIONS',
    estimatedTokens: 500,
    estimatedCost: 0,
    processingTime: '4-6s',
    aiTier: 'gemini',
  },
  
  // ===== PAID Operations - Gemini Flash Tier =====
  SUMMARY_LONG: {
    name: 'Detailed Summary',
    description: 'Comprehensive paragraph summary',
    category: 'paid',
    categoryId: 'PDF_SUMMARY',
    estimatedTokens: 1000,
    estimatedCost: 0,
    processingTime: '8-12s',
    aiTier: 'gemini',
  },
  TRANSLATE_BASIC: {
    name: 'Translation',
    description: 'Translate to other languages',
    category: 'paid',
    categoryId: 'FORMAT_CONVERT',
    estimatedTokens: 2000,
    estimatedCost: 0,
    processingTime: '10-15s',
    aiTier: 'gemini',
  },
  NOTES_GENERATOR: {
    name: 'Notes Generator',
    description: 'Structured study notes',
    category: 'paid',
    categoryId: 'NOTES_MAKER',
    estimatedTokens: 2000,
    estimatedCost: 0,
    processingTime: '12-18s',
    aiTier: 'gemini',
  },
  TOPIC_BREAKDOWN: {
    name: 'Topic Breakdown',
    description: 'Break down topics and subtopics',
    category: 'paid',
    categoryId: 'NOTES_MAKER',
    estimatedTokens: 2000,
    estimatedCost: 0,
    processingTime: '12-18s',
    aiTier: 'gemini',
  },
  FILL_IN_BLANKS: {
    name: 'Fill in Blanks',
    description: 'Create fill-in-blank exercises',
    category: 'paid',
    categoryId: 'TEST_GENERATOR',
    estimatedTokens: 2000,
    estimatedCost: 0,
    processingTime: '12-18s',
    aiTier: 'gemini',
  },
  DOCUMENT_CLEANUP_ADVANCED: {
    name: 'Advanced Cleanup',
    description: 'Professional document cleanup',
    category: 'paid',
    categoryId: 'FORMAT_CONVERT',
    estimatedTokens: 3000,
    estimatedCost: 0,
    processingTime: '15-20s',
    aiTier: 'gemini',
  },
  SUMMARIES_ADVANCED: {
    name: 'Executive Summary',
    description: 'Professional executive summary',
    category: 'paid',
    categoryId: 'PDF_SUMMARY',
    estimatedTokens: 2500,
    estimatedCost: 0,
    processingTime: '15-22s',
    aiTier: 'gemini',
  },
  VOICE_MODE: {
    name: 'Voice Mode',
    description: 'Voice-based document interaction',
    category: 'paid',
    categoryId: 'SPECIAL',
    estimatedTokens: 2500,
    estimatedCost: 0,
    processingTime: '20-30s',
    aiTier: 'gemini',
  },
  
  // ===== PAID Operations - GPT-4o-mini Tier =====
  TEST_GENERATOR: {
    name: 'Test Generator',
    description: 'Create MCQ tests',
    category: 'paid',
    categoryId: 'TEST_GENERATOR',
    estimatedTokens: 2500,
    estimatedCost: 0.13,
    processingTime: '15-25s',
    aiTier: 'gpt',
  },
  QUESTION_BANK: {
    name: 'Question Bank',
    description: 'Generate question bank',
    category: 'paid',
    categoryId: 'TEST_GENERATOR',
    estimatedTokens: 3000,
    estimatedCost: 0.15,
    processingTime: '20-30s',
    aiTier: 'gpt',
  },
  PRESENTATION_MAKER: {
    name: 'Presentation Maker',
    description: 'Generate presentation slides',
    category: 'paid',
    categoryId: 'PPT_MAKER',
    estimatedTokens: 4500,
    estimatedCost: 0.23,
    processingTime: '25-35s',
    aiTier: 'gpt',
  },
  REPORT_BUILDER: {
    name: 'Report Builder',
    description: 'Generate professional reports',
    category: 'paid',
    categoryId: 'ASSIGNMENT',
    estimatedTokens: 4000,
    estimatedCost: 0.20,
    processingTime: '28-40s',
    aiTier: 'gpt',
  },
  WORKFLOW_CONVERSION: {
    name: 'Workflow Converter',
    description: 'Convert to workflow format',
    category: 'paid',
    categoryId: 'ASSIGNMENT',
    estimatedTokens: 2500,
    estimatedCost: 0.13,
    processingTime: '18-25s',
    aiTier: 'gpt',
  },
  KEYWORD_INDEX_EXTRACTOR: {
    name: 'Keyword Index',
    description: 'Comprehensive keyword index',
    category: 'paid',
    categoryId: 'BOOK_OVERVIEW',
    estimatedTokens: 2500,
    estimatedCost: 0.13,
    processingTime: '15-22s',
    aiTier: 'gpt',
  },
  TRANSLATE_SIMPLIFY_ADVANCED: {
    name: 'Translate & Simplify',
    description: 'Translate and simplify complex text',
    category: 'paid',
    categoryId: 'FORMAT_CONVERT',
    estimatedTokens: 3500,
    estimatedCost: 0.18,
    processingTime: '20-28s',
    aiTier: 'gpt',
  },
  TABLE_TO_CHARTS: {
    name: 'Table to Charts',
    description: 'Convert tables to JSON config + insights',
    category: 'paid',
    categoryId: 'DATA_INSIGHTS',
    estimatedTokens: 2000,
    estimatedCost: 0.10,
    processingTime: '15-20s',
    aiTier: 'gpt',
  },
  
  // ===== PAID Operations - Gemini 1.5 Pro Tier (Complex) =====
  CONTRACT_LAW_SCAN: {
    name: 'Legal Scanner',
    description: 'Legal document analysis',
    category: 'paid',
    categoryId: 'SPECIAL',
    estimatedTokens: 5000,
    estimatedCost: 2.13,
    processingTime: '30-45s',
    aiTier: 'haiku',
  },
  MULTI_DOC_REASONING: {
    name: 'Multi-Doc Analysis',
    description: 'Reason across multiple documents',
    category: 'paid',
    categoryId: 'RESEARCH',
    estimatedTokens: 6000,
    estimatedCost: 2.55,
    processingTime: '40-60s',
    aiTier: 'haiku',
  },
  INSIGHTS_EXTRACTION: {
    name: 'Insights Extraction',
    description: 'Extract key insights and trends',
    category: 'paid',
    categoryId: 'DATA_INSIGHTS',
    estimatedTokens: 3000,
    estimatedCost: 1.28,
    processingTime: '20-30s',
    aiTier: 'haiku',
  },
  TREND_ANALYSIS: {
    name: 'Trend Analysis',
    description: 'Analyze trends in document',
    category: 'paid',
    categoryId: 'DATA_INSIGHTS',
    estimatedTokens: 3500,
    estimatedCost: 1.49,
    processingTime: '22-32s',
    aiTier: 'haiku',
  },
  AI_DETECTION_REDACTION: {
    name: 'AI Detection',
    description: 'Detect AI-generated content',
    category: 'paid',
    categoryId: 'SPECIAL',
    estimatedTokens: 3000,
    estimatedCost: 1.28,
    processingTime: '20-30s',
    aiTier: 'haiku',
  },
  CROSS_PDF_COMPARE: {
    name: 'PDF Comparison',
    description: 'Compare multiple documents',
    category: 'paid',
    categoryId: 'RESEARCH',
    estimatedTokens: 4000,
    estimatedCost: 1.70,
    processingTime: '25-40s',
    aiTier: 'haiku',
  },
  DIAGRAM_INTERPRETATION: {
    name: 'Diagram Interpreter',
    description: 'Interpret and explain diagrams',
    category: 'paid',
    categoryId: 'IMAGE_SOLVER',
    estimatedTokens: 2500,
    estimatedCost: 1.06,
    processingTime: '18-25s',
    aiTier: 'haiku',
  },
  DOCUMENT_CHAT_MEMORY: {
    name: 'Document Chat',
    description: 'Chat with document context',
    category: 'paid',
    categoryId: 'DOCUMENT_QA',
    estimatedTokens: 3000,
    estimatedCost: 1.28,
    processingTime: '15-25s',
    aiTier: 'haiku',
  },
  
  // ===== NEW FEATURED OPERATIONS (GPT-4o-mini) =====
  EXPLAIN_AS_TEACHER: {
    name: 'Explain Like a Teacher',
    description: 'Detailed teaching-style explanation with examples, diagrams, and formulas',
    category: 'paid',
    categoryId: 'TEACHER_MODE',
    estimatedTokens: 3500,
    estimatedCost: 0.18, // ~3500 output * ₹51/1M
    processingTime: '20-30s',
    aiTier: 'gpt',
  },
  CONTENT_TO_SCRIPT: {
    name: 'Content to Script',
    description: 'Convert content to YouTube, Podcast, or Presentation script',
    category: 'paid',
    categoryId: 'SCRIPT_MAKER',
    estimatedTokens: 3000,
    estimatedCost: 0.15, // ~3000 output * ₹51/1M
    processingTime: '18-25s',
    aiTier: 'gpt',
  },
  NOTES_TO_QUIZ_TURBO: {
    name: 'Notes to Quiz Turbo',
    description: 'Instant comprehensive test generation with multiple question types',
    category: 'paid',
    categoryId: 'QUIZ_TURBO',
    estimatedTokens: 3500,
    estimatedCost: 0.18, // ~3500 output * ₹51/1M
    processingTime: '20-30s',
    aiTier: 'gpt',
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function isOperationFree(operation: string): boolean {
  return FREE_OPERATIONS.includes(operation as typeof FREE_OPERATIONS[number]);
}

export function isOperationAllowed(operation: string, isPaidUser: boolean): boolean {
  if (isPaidUser) return true;
  return FREE_OPERATIONS.includes(operation as typeof FREE_OPERATIONS[number]);
}

export function getOperationCategory(operation: string): 'free' | 'paid' {
  return FREE_OPERATIONS.includes(operation as typeof FREE_OPERATIONS[number]) ? 'free' : 'paid';
}

export function getOperationCategoryId(operation: string): string {
  return OPERATION_METADATA[operation]?.categoryId || 'SPECIAL';
}

export function isFileSizeAllowed(fileSize: number, isPaidUser: boolean): boolean {
  const limit = isPaidUser
    ? DOCUMENT_LIMITS.PAID.maxFileSize
    : DOCUMENT_LIMITS.FREE.maxFileSize;
  return fileSize <= limit;
}

export function isFileTypeSupported(mimeType: string): boolean {
  return mimeType in SUPPORTED_FILE_TYPES;
}

export function getMaxDocuments(isPaidUser: boolean): number {
  return isPaidUser
    ? DOCUMENT_LIMITS.PAID.documentsPerMonth
    : DOCUMENT_LIMITS.FREE.documentsPerMonth;
}

export function getMaxOperations(isPaidUser: boolean): number {
  return isPaidUser
    ? DOCUMENT_LIMITS.PAID.totalOperationsPerMonth
    : DOCUMENT_LIMITS.FREE.totalOperationsPerMonth;
}

export function getTokenCaps(operation: string): { input: number; output: number } {
  return TOKEN_CAPS[operation as keyof typeof TOKEN_CAPS] || { input: 2000, output: 1000 };
}

export function getAIRouting(operation: string, isPaidUser: boolean): {
  provider: 'google' | 'openai' | 'anthropic';
  model: string;
  tier: 'gemini' | 'gpt' | 'haiku';
} {
  if (!isPaidUser) {
    return {
      provider: 'google',
      model: AI_ROUTING_RULES.GEMINI.model,
      tier: 'gemini',
    };
  }

  if (AI_ROUTING_RULES.HAIKU.operations.includes(operation as typeof AI_ROUTING_RULES.HAIKU.operations[number])) {
    return {
      provider: 'anthropic',
      model: AI_ROUTING_RULES.HAIKU.model,
      tier: 'haiku',
    };
  }

  if (AI_ROUTING_RULES.GPT.operations.includes(operation as typeof AI_ROUTING_RULES.GPT.operations[number])) {
    return {
      provider: 'openai',
      model: AI_ROUTING_RULES.GPT.model,
      tier: 'gpt',
    };
  }

  return {
    provider: 'google',
    model: AI_ROUTING_RULES.GEMINI.model,
    tier: 'gemini',
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function estimateOperationCost(operation: string, inputTokens: number, outputTokens: number): number {
  const routing = getAIRouting(operation, true);
  
  let inputCostPer1M = 0;
  let outputCostPer1M = 0;
  
  switch (routing.tier) {
    case 'gemini':
      inputCostPer1M = 0;
      outputCostPer1M = 0;
      break;
    case 'gpt':
      inputCostPer1M = AI_ROUTING_RULES.GPT.inputCostPer1M;
      outputCostPer1M = AI_ROUTING_RULES.GPT.outputCostPer1M;
      break;
    case 'haiku':
      inputCostPer1M = AI_ROUTING_RULES.HAIKU.inputCostPer1M;
      outputCostPer1M = AI_ROUTING_RULES.HAIKU.outputCostPer1M;
      break;
  }
  
  const inputCost = (inputTokens / 1_000_000) * inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * outputCostPer1M;
  
  return Math.round((inputCost + outputCost) * 100) / 100;
}

export function getOperationAITier(operation: string): 'gemini' | 'gpt' | 'haiku' {
  return OPERATION_METADATA[operation]?.aiTier || 'gemini';
}

// ==========================================
// ERROR MESSAGES
// ==========================================

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: (maxSize: number) =>
    `File size exceeds limit of ${formatFileSize(maxSize)}`,
  UNSUPPORTED_FILE_TYPE: 'File type not supported. Allowed: PDF, DOCX, TXT, MD, PNG, JPG',
  DOCUMENT_LIMIT_REACHED: (limit: number) =>
    `Document upload limit reached (${limit}/month). Upgrade to continue.`,
  OPERATION_LIMIT_REACHED: (limit: number) =>
    `Operation limit reached (${limit}/month). Upgrade for unlimited operations.`,
  OPERATION_NOT_ALLOWED: 'This feature requires Document Intelligence addon (₹149/month)',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
  STORAGE_LIMIT_REACHED: (limit: number) =>
    `Storage limit reached (${formatFileSize(limit)}). Delete old documents or upgrade.`,
  DAILY_LIMIT_REACHED: (limit: number) =>
    `Daily limit reached (${limit}/day). Try again tomorrow or upgrade.`,
} as const;

// ==========================================
// EXPORT TYPES
// ==========================================

export type FreeOperationType = typeof FREE_OPERATIONS[number];
export type PaidOperationType = typeof PAID_OPERATIONS[number];
export type AllOperationType = typeof ALL_OPERATIONS[number];
export type DocumentStatusType = typeof DOCUMENT_STATUS[keyof typeof DOCUMENT_STATUS];
export type FeatureCategoryId = keyof typeof FEATURE_CATEGORIES;
export type AIProvider = 'google' | 'openai' | 'anthropic';
export type AITier = 'gemini' | 'gpt' | 'haiku';