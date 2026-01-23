// src/constants/smart-docs.ts

/**
 * ==========================================
 * SORIVA SMART DOCS - CONFIGURATION
 * ==========================================
 * Credit-based document intelligence system
 * Tokens deduct from MAIN POOL
 * 
 * Last Updated: December 23, 2025
 * ==========================================
 * 
 * KEY DECISIONS:
 * ==========================================
 * 1. 1 Credit = 800 Tokens (fixed ratio)
 * 2. Tokens deduct from MAIN POOL (no separate pool)
 * 3. Models = Same as plan's available models
 * 4. Feature access controlled by minimumPlan
 * 5. Monthly credits limit Smart Docs usage
 * 6. Standalone packs available for extra credits
 * 
 * ==========================================
 * CREDIT SYSTEM:
 * ==========================================
 * Formula: creditCost = Math.ceil(tokens / 800)
 * 
 * Monthly Credits (Free with Plan):
 * - STARTER: 30 credits  (~24K tokens, 8% of 300K pool)
 * - PLUS:    100 credits (~80K tokens, 7% of 1.18M pool)
 * - PRO:     200 credits (~160K tokens, 12% of 1.3M pool)
 * - APEX:    350 credits (~280K tokens, 10% of 2.75M pool)
 * 
 * ==========================================
 * FEATURE DISTRIBUTION:
 * ==========================================
 * - STARTER features: 7  → Flash-Lite
 * - PLUS features:    6  → Mistral Large 3
 * - PRO features:     8  → Mistral Large 3 / GPT-5.1
 * - APEX features:    4  → GPT-5.1 / Gemini Pro / Claude Sonnet
 * - TOTAL:            25 features
 * 
 * ==========================================
 * STANDALONE PACKS (60% margin):
 * ==========================================
 * India:
 * - Pack 1: ₹99  → 225 credits → 180K tokens
 * - Pack 2: ₹149 → 350 credits → 280K tokens
 * 
 * International:
 * - Pack 1: $2.99 → 450 credits → 360K tokens
 * - Pack 2: $4.99 → 850 credits → 680K tokens
 * 
 * ==========================================
 * COST ANALYSIS (per use, for us):
 * ==========================================
 * - STARTER features: ₹0.02-0.04 (Flash-Lite)
 * - PLUS features:    ₹0.25-0.31 (Mistral Large 3)
 * - PRO features:     ₹0.50-4.05 (Mistral/GPT)
 * - APEX features:    ₹8.10-12.15 (GPT/Pro/Sonnet)
 * 
 * Extra costing = ZERO (uses existing token pool)
 * Standalone packs = 60% margin locked
 */

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type RegionCode = 'IN' | 'INTL';

export type SmartDocsOperation = 
  // STARTER features (7)
  | 'SUMMARY_SHORT'
  | 'SUMMARY_BULLET'
  | 'KEYWORD_EXTRACT'
  | 'DOCUMENT_CLEANUP'
  | 'EXTRACT_DEFINITIONS'
  | 'SUMMARY_LONG'
  | 'TRANSLATE_BASIC'
  // PLUS features (6)
  | 'FLASHCARDS'
  | 'EXPLAIN_SIMPLE'
  | 'FILL_IN_BLANKS'
  | 'NOTES_GENERATOR'
  | 'TOPIC_BREAKDOWN'
  | 'TABLE_TO_CHARTS'
  // PRO features (8)
  | 'EXPLAIN_AS_TEACHER'
  | 'NOTES_TO_QUIZ_TURBO'
  | 'TEST_GENERATOR'
  | 'QUESTION_BANK'
  | 'REPORT_BUILDER'
  | 'AI_DETECTION_REDACTION'
  | 'DIAGRAM_INTERPRETATION'
  | 'CROSS_PDF_COMPARE'
  // APEX features (4)
  | 'CONTENT_TO_SCRIPT'
  | 'PRESENTATION_MAKER'
  | 'MULTI_DOC_REASONING'
  | 'CONTRACT_LAW_SCAN';

export type MinimumPlan = 'STARTER' | 'PLUS' | 'PRO' | 'APEX';

/** Array of all Smart Docs operations (for iteration) */
export const SMART_DOCS_OPERATIONS: SmartDocsOperation[] = [
  // STARTER features (7)
  'SUMMARY_SHORT',
  'SUMMARY_BULLET',
  'KEYWORD_EXTRACT',
  'DOCUMENT_CLEANUP',
  'EXTRACT_DEFINITIONS',
  'SUMMARY_LONG',
  'TRANSLATE_BASIC',
  // PLUS features (6)
  'FLASHCARDS',
  'EXPLAIN_SIMPLE',
  'FILL_IN_BLANKS',
  'NOTES_GENERATOR',
  'TOPIC_BREAKDOWN',
  'TABLE_TO_CHARTS',
  // PRO features (8)
  'EXPLAIN_AS_TEACHER',
  'NOTES_TO_QUIZ_TURBO',
  'TEST_GENERATOR',
  'QUESTION_BANK',
  'REPORT_BUILDER',
  'AI_DETECTION_REDACTION',
  'DIAGRAM_INTERPRETATION',
  'CROSS_PDF_COMPARE',
  // APEX features (4)
  'CONTENT_TO_SCRIPT',
  'PRESENTATION_MAKER',
  'MULTI_DOC_REASONING',
  'CONTRACT_LAW_SCAN',
];
export interface SmartDocsFeatureConfig {
  /** Token cost (deducted from main pool) */
  tokens: number;
  /** Credit cost (tokens ÷ 800, rounded up) */
  credits: number;
  /** Minimum plan required */
  minimumPlan: MinimumPlan;
  /** Model to use (region-specific for APEX features) */
  model: string | { IN: string; INTL: string };
  /** Provider name */
  provider: string | { IN: string; INTL: string };
  /** Maximum output tokens allowed */
  maxOutputTokens: number;
  /** Feature category for grouping */
  category: string;
  /** Human-readable feature name */
  displayName: string;
  /** Short description */
  description: string;
}

// ==========================================
// CREDIT SYSTEM CONSTANTS
// ==========================================

/** 1 credit = 800 tokens */
export const TOKENS_PER_CREDIT = 800;

/** Monthly credits allocation per plan (free with subscription) */
export const SMART_DOCS_MONTHLY_CREDITS: Record<MinimumPlan, number> = {
  STARTER: 30,   // ~24K tokens (8% of 300K pool)
  PLUS: 100,     // ~80K tokens (7% of 1.18M pool)
  PRO: 200,      // ~160K tokens (12% of 1.3M pool)
  APEX: 350,     // ~280K tokens (10% of 2.75M pool)
};

/** Convert tokens to credits */
export function tokensToCredits(tokens: number): number {
  return Math.ceil(tokens / TOKENS_PER_CREDIT);
}

/** Convert credits to tokens */
export function creditsToTokensConvert(credits: number): number {
  return credits * TOKENS_PER_CREDIT;
}

// ==========================================
// STANDALONE PACKS (60% Margin Locked)
// ==========================================

export interface SmartDocsPack {
  id: string;
  name: string;
  price: number;
  credits: number;
  tokens: number;
  popular?: boolean;
}

export const SMART_DOCS_PACKS: Record<RegionCode, SmartDocsPack[]> = {
  IN: [
    {
      id: 'smart_docs_pack_1_in',
      name: 'Smart Docs Pack 1',
      price: 99,
      credits: 225,
      tokens: 180000,
    },
    {
      id: 'smart_docs_pack_2_in',
      name: 'Smart Docs Pack 2',
      price: 149,
      credits: 350,
      tokens: 280000,
      popular: true,
    },
  ],
  INTL: [
    {
      id: 'smart_docs_pack_1_intl',
      name: 'Smart Docs Pack 1',
      price: 2.99,
      credits: 450,
      tokens: 360000,
    },
    {
      id: 'smart_docs_pack_2_intl',
      name: 'Smart Docs Pack 2',
      price: 4.99,
      credits: 850,
      tokens: 680000,
      popular: true,
    },
  ],
};

/** Get packs for a region */
export function getSmartDocsPacks(region: RegionCode): SmartDocsPack[] {
  return SMART_DOCS_PACKS[region];
}

// ==========================================
// SMART DOCS CONFIGURATION (25 Features)
// ==========================================

export const SMART_DOCS_CONFIG: Record<SmartDocsOperation, SmartDocsFeatureConfig> = {
  
  // ═══════════════════════════════════════
  // STARTER FEATURES (7)
  // Model: Flash-Lite (₹32.56 per 1M tokens)
  // ═══════════════════════════════════════
  
  SUMMARY_SHORT: {
    tokens: 800,
    credits: 1,
    minimumPlan: 'STARTER',
    model: 'gemini-2.5-flash-lite',
    provider: 'gemini',
    maxOutputTokens: 500,
    category: 'SUMMARY',
    displayName: 'Quick Summary',
    description: '2-3 sentence summary',
  },
  
  SUMMARY_BULLET: {
    tokens: 800,
    credits: 1,
    minimumPlan: 'STARTER',
    model: 'gemini-2.5-flash-lite',
    provider: 'gemini',
    maxOutputTokens: 600,
    category: 'SUMMARY',
    displayName: 'Bullet Points',
    description: '5-7 key bullet points',
  },
  
  KEYWORD_EXTRACT: {
    tokens: 600,
    credits: 1,
    minimumPlan: 'STARTER',
    model: 'gemini-2.5-flash-lite',
    provider: 'gemini',
    maxOutputTokens: 300,
    category: 'ANALYSIS',
    displayName: 'Keywords',
    description: 'Extract important keywords',
  },
  
  DOCUMENT_CLEANUP: {
    tokens: 1000,
    credits: 2,
    minimumPlan: 'STARTER',
    model: 'gemini-2.5-flash-lite',
    provider: 'gemini',
    maxOutputTokens: 800,
    category: 'FORMATTING',
    displayName: 'Doc Cleanup',
    description: 'Fix formatting & grammar',
  },
  
  EXTRACT_DEFINITIONS: {
    tokens: 800,
    credits: 1,
    minimumPlan: 'STARTER',
    model: 'gemini-2.5-flash-lite',
    provider: 'gemini',
    maxOutputTokens: 500,
    category: 'ANALYSIS',
    displayName: 'Definitions',
    description: 'Extract key terms',
  },
  
  SUMMARY_LONG: {
    tokens: 1200,
    credits: 2,
    minimumPlan: 'STARTER',
    model: 'gemini-2.5-flash-lite',
    provider: 'gemini',
    maxOutputTokens: 1000,
    category: 'SUMMARY',
    displayName: 'Long Summary',
    description: 'Comprehensive paragraph',
  },
  
  TRANSLATE_BASIC: {
    tokens: 1000,
    credits: 2,
    minimumPlan: 'STARTER',
    model: 'gemini-2.5-flash-lite',
    provider: 'gemini',
    maxOutputTokens: 800,
    category: 'TRANSLATION',
    displayName: 'Translation',
    description: 'Translate to other languages',
  },

  // ═══════════════════════════════════════
  // PLUS FEATURES (6)
  // Model: Mistral Large 3 (₹125.06 per 1M tokens)
  // ═══════════════════════════════════════
  
  FLASHCARDS: {
    tokens: 2000,
    credits: 3,
    minimumPlan: 'PLUS',
    model: 'mistral-large-3-2512',
    provider: 'mistral',
    maxOutputTokens: 1500,
    category: 'STUDY',
    displayName: 'Flashcards',
    description: 'Generate study flashcards',
  },
  
  EXPLAIN_SIMPLE: {
    tokens: 2500,
    credits: 4,
    minimumPlan: 'PLUS',
    model: 'mistral-large-3-2512',
    provider: 'mistral',
    maxOutputTokens: 2000,
    category: 'EXPLAIN',
    displayName: 'ELI5',
    description: "Explain Like I'm 5",
  },
  
  FILL_IN_BLANKS: {
    tokens: 2000,
    credits: 3,
    minimumPlan: 'PLUS',
    model: 'mistral-large-3-2512',
    provider: 'mistral',
    maxOutputTokens: 1500,
    category: 'TEST',
    displayName: 'Fill in Blanks',
    description: 'Create fill-in exercises',
  },
  
  NOTES_GENERATOR: {
    tokens: 2500,
    credits: 4,
    minimumPlan: 'PLUS',
    model: 'mistral-large-3-2512',
    provider: 'mistral',
    maxOutputTokens: 2000,
    category: 'NOTES',
    displayName: 'Notes Maker',
    description: 'Generate study notes',
  },
  
  TOPIC_BREAKDOWN: {
    tokens: 2000,
    credits: 3,
    minimumPlan: 'PLUS',
    model: 'mistral-large-3-2512',
    provider: 'mistral',
    maxOutputTokens: 1500,
    category: 'ANALYSIS',
    displayName: 'Topic Breakdown',
    description: 'Break down topics',
  },
  
  TABLE_TO_CHARTS: {
    tokens: 1800,
    credits: 3,
    minimumPlan: 'PLUS',
    model: 'mistral-large-3-2512',
    provider: 'mistral',
    maxOutputTokens: 1200,
    category: 'DATA',
    displayName: 'Table to Charts',
    description: 'Convert tables to charts',
  },

  // ═══════════════════════════════════════
  // PRO FEATURES (8)
  // Model: Mistral Large 3 / GPT-5.1
  // ═══════════════════════════════════════
  
  EXPLAIN_AS_TEACHER: {
    tokens: 5000,
    credits: 7,
    minimumPlan: 'PRO',
    model: 'mistral-large-3-2512',
    provider: 'mistral',
    maxOutputTokens: 4000,
    category: 'EXPLAIN',
    displayName: 'Explain Teacher',
    description: 'Teaching-style explanation',
  },
  
  NOTES_TO_QUIZ_TURBO: {
    tokens: 5000,
    credits: 7,
    minimumPlan: 'PRO',
    model: 'gpt-5.1',
    provider: 'openai',
    maxOutputTokens: 4000,
    category: 'TEST',
    displayName: 'Quiz Turbo',
    description: 'Comprehensive test generator',
  },
  
  TEST_GENERATOR: {
    tokens: 4500,
    credits: 6,
    minimumPlan: 'PRO',
    model: 'mistral-large-3-2512',
    provider: 'mistral',
    maxOutputTokens: 3500,
    category: 'TEST',
    displayName: 'Test Generator',
    description: 'Create MCQ tests',
  },
  
  QUESTION_BANK: {
    tokens: 4000,
    credits: 5,
    minimumPlan: 'PRO',
    model: 'mistral-large-3-2512',
    provider: 'mistral',
    maxOutputTokens: 3000,
    category: 'TEST',
    displayName: 'Question Bank',
    description: 'Generate question bank',
  },
  
  REPORT_BUILDER: {
    tokens: 5000,
    credits: 7,
    minimumPlan: 'PRO',
    model: 'gpt-5.1',
    provider: 'openai',
    maxOutputTokens: 4000,
    category: 'REPORT',
    displayName: 'Report Builder',
    description: 'Generate reports',
  },
  
  AI_DETECTION_REDACTION: {
    tokens: 3500,
    credits: 5,
    minimumPlan: 'PRO',
    model: 'gemini-2.5-flash',
    provider: 'gemini',
    maxOutputTokens: 2500,
    category: 'ANALYSIS',
    displayName: 'AI Detection',
    description: 'Detect AI content',
  },
  
  DIAGRAM_INTERPRETATION: {
    tokens: 4000,
    credits: 5,
    minimumPlan: 'PRO',
    model: 'gemini-2.5-flash',
    provider: 'gemini',
    maxOutputTokens: 3000,
    category: 'ANALYSIS',
    displayName: 'Diagram Solver',
    description: 'Interpret diagrams',
  },
  
  CROSS_PDF_COMPARE: {
    tokens: 5000,
    credits: 7,
    minimumPlan: 'PRO',
    model: 'mistral-large-3-2512',
    provider: 'mistral',
    maxOutputTokens: 4000,
    category: 'ANALYSIS',
    displayName: 'PDF Compare',
    description: 'Compare documents',
  },

  // ═══════════════════════════════════════
  // APEX FEATURES (4)
  // Model: GPT-5.1 / Gemini Pro (IN) | Claude Sonnet (INTL)
  // ═══════════════════════════════════════
  
  CONTENT_TO_SCRIPT: {
    tokens: 12000,
    credits: 15,
    minimumPlan: 'APEX',
    model: 'gpt-5.1',
    provider: 'openai',
    maxOutputTokens: 8000,
    category: 'CREATIVE',
    displayName: 'YouTube Script',
    description: 'Convert to video scripts',
  },
  
  PRESENTATION_MAKER: {
    tokens: 15000,
    credits: 19,
    minimumPlan: 'APEX',
    model: 'gpt-5.1',
    provider: 'openai',
    maxOutputTokens: 10000,
    category: 'CREATIVE',
    displayName: 'PPT Maker',
    description: 'Generate presentations',
  },
  
  MULTI_DOC_REASONING: {
    tokens: 10000,
    credits: 13,
    minimumPlan: 'APEX',
    model: { IN: 'gemini-2.5-pro', INTL: 'claude-sonnet-4-5' },
    provider: { IN: 'gemini', INTL: 'claude' },
    maxOutputTokens: 6000,
    category: 'ANALYSIS',
    displayName: 'Multi-Doc Analysis',
    description: 'Advanced multi-doc reasoning',
  },
  
  CONTRACT_LAW_SCAN: {
    tokens: 12000,
    credits: 15,
    minimumPlan: 'APEX',
    model: { IN: 'gemini-2.5-pro', INTL: 'claude-sonnet-4-5' },
    provider: { IN: 'gemini', INTL: 'claude' },
    maxOutputTokens: 8000,
    category: 'LEGAL',
    displayName: 'Contract Scan',
    description: 'Legal document analysis',
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get Smart Docs feature configuration
 */
export function getSmartDocsConfig(
  operationType: string,
  region: RegionCode = 'IN'
): {
  tokens: number;
  credits: number;
  minimumPlan: MinimumPlan;
  model: string;
  provider: string;
  maxOutputTokens: number;
  category: string;
  displayName: string;
  description: string;
} {
  const config = SMART_DOCS_CONFIG[operationType as SmartDocsOperation];
  
  if (!config) {
    return {
      tokens: 1000,
      credits: 2,
      minimumPlan: 'STARTER',
      model: 'gemini-2.5-flash-lite',
      provider: 'gemini',
      maxOutputTokens: 800,
      category: 'UNKNOWN',
      displayName: 'Unknown',
      description: 'Unknown operation',
    };
  }
  
  const model = typeof config.model === 'string' 
    ? config.model 
    : config.model[region];
  
  const provider = typeof config.provider === 'string'
    ? config.provider
    : config.provider[region];
  
  return {
    tokens: config.tokens,
    credits: config.credits,
    minimumPlan: config.minimumPlan,
    model,
    provider,
    maxOutputTokens: config.maxOutputTokens,
    category: config.category,
    displayName: config.displayName,
    description: config.description,
  };
}

/**
 * Get token cost for a Smart Docs operation
 */
export function getSmartDocsTokenCost(operationType: string): number {
  const config = SMART_DOCS_CONFIG[operationType as SmartDocsOperation];
  return config?.tokens || 1000;
}

/**
 * Get credit cost for a Smart Docs operation
 */
export function getSmartDocsCreditCost(operationType: string): number {
  const config = SMART_DOCS_CONFIG[operationType as SmartDocsOperation];
  return config?.credits || 2;
}

/**
 * Check if user's plan can access a feature
 */
export function canAccessSmartDocsFeature(
  userPlan: MinimumPlan,
  operationType: string
): boolean {
  const config = SMART_DOCS_CONFIG[operationType as SmartDocsOperation];
  if (!config) return false;
  
  const planLevel: Record<MinimumPlan, number> = {
    STARTER: 0,
    PLUS: 1,
    PRO: 2,
    APEX: 3,
  };
  
  return planLevel[userPlan] >= planLevel[config.minimumPlan];
}

/**
 * Get all features available for a plan
 */
export function getAvailableSmartDocsFeatures(userPlan: MinimumPlan): SmartDocsOperation[] {
  return (Object.keys(SMART_DOCS_CONFIG) as SmartDocsOperation[]).filter(
    (op) => canAccessSmartDocsFeature(userPlan, op)
  );
}

/**
 * Get features grouped by plan
 */
export function getSmartDocsFeaturesByPlan(): Record<MinimumPlan, SmartDocsOperation[]> {
  const result: Record<MinimumPlan, SmartDocsOperation[]> = {
    STARTER: [],
    PLUS: [],
    PRO: [],
    APEX: [],
  };
  
  for (const [op, config] of Object.entries(SMART_DOCS_CONFIG)) {
    result[config.minimumPlan].push(op as SmartDocsOperation);
  }
  
  return result;
}

/**
 * Get monthly credits for a plan
 */
export function getMonthlyCredits(plan: MinimumPlan): number {
  return SMART_DOCS_MONTHLY_CREDITS[plan];
}

/**
 * Check if user can afford a feature
 */
export function canAffordFeature(
  operationType: string,
  creditsRemaining: number
): boolean {
  const creditCost = getSmartDocsCreditCost(operationType);
  return creditsRemaining >= creditCost;
}

// ==========================================
// FEATURE COUNT SUMMARY
// ==========================================

export const SMART_DOCS_FEATURE_COUNTS = {
  STARTER: 7,
  PLUS: 6,
  PRO: 8,
  APEX: 4,
  TOTAL: 25,
} as const;

/**
 * Get feature count available for a plan
 */
export function getSmartDocsFeatureCount(userPlan: MinimumPlan): number {
  switch (userPlan) {
    case 'STARTER':
      return SMART_DOCS_FEATURE_COUNTS.STARTER; // 7
    case 'PLUS':
      return SMART_DOCS_FEATURE_COUNTS.STARTER + 
             SMART_DOCS_FEATURE_COUNTS.PLUS; // 13
    case 'PRO':
      return SMART_DOCS_FEATURE_COUNTS.STARTER + 
             SMART_DOCS_FEATURE_COUNTS.PLUS + 
             SMART_DOCS_FEATURE_COUNTS.PRO; // 21
    case 'APEX':
      return SMART_DOCS_FEATURE_COUNTS.TOTAL; // 25
    default:
      return 0;
  }
}

// ==========================================
// FILE SIZE LIMITS BY PLAN
// ==========================================

export const SMART_DOCS_FILE_LIMITS: Record<MinimumPlan, number> = {
  STARTER: 10 * 1024 * 1024,  // 10 MB
  PLUS: 25 * 1024 * 1024,     // 25 MB
  PRO: 50 * 1024 * 1024,      // 50 MB
  APEX: 100 * 1024 * 1024,    // 100 MB
};

/**
 * Check if file size is within limit for user's plan
 */
export function isFileSizeAllowed(fileSize: number, userPlan: MinimumPlan): boolean {
  return fileSize <= SMART_DOCS_FILE_LIMITS[userPlan];
}

// ==========================================
// SUPPORTED FILE FORMATS
// ==========================================

export const SMART_DOCS_SUPPORTED_FORMATS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

export const SMART_DOCS_FORMAT_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.txt',
  '.md',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
] as const;

/**
 * Check if file format is supported
 */
export function isFormatSupported(mimeType: string, fileName: string): boolean {
  if (SMART_DOCS_SUPPORTED_FORMATS.includes(mimeType as any)) {
    return true;
  }
  const extension = fileName.toLowerCase().split('.').pop();
  return extension === 'md';
}