// src/constants/smartDocsCredits.ts

/**
 * ==========================================
 * SORIVA SMART DOCS - TOKEN SYSTEM
 * ==========================================
 * Created: December 23, 2025
 * Updated: January 31, 2026 - Converted to Token System
 * Author: Risenex Dynamics
 * 
 * TOKEN SYSTEM OVERVIEW:
 * - Plan-based monthly tokens (25K-850K)
 * - 1 Page = ~5K tokens deducted
 * - Feature unlock by plan tier
 * - AI: Mistral Large 3 (all tiers)
 * - Booster: 750K tokens @ ₹99
 * 
 * LAUNCH: January 31, 2026
 * ==========================================
 */

import { PlanType } from '@prisma/client';

// ==========================================
// ENUMS & TYPES
// ==========================================

/**
 * Smart Docs Operation Types
 * 25 Features organized by credit tier
 */
export enum SmartDocsOperation {
  // ===== 2 CREDITS - STARTER+ (7 Features) =====
  SUMMARY_SHORT = 'SUMMARY_SHORT',
  SUMMARY_BULLET = 'SUMMARY_BULLET',
  KEYWORD_EXTRACT = 'KEYWORD_EXTRACT',
  DOCUMENT_CLEANUP = 'DOCUMENT_CLEANUP',
  EXTRACT_DEFINITIONS = 'EXTRACT_DEFINITIONS',
  SUMMARY_LONG = 'SUMMARY_LONG',
  TRANSLATE_BASIC = 'TRANSLATE_BASIC',

  // ===== 5 CREDITS - PLUS+ (6 Features) =====
  FLASHCARDS = 'FLASHCARDS',
  EXPLAIN_SIMPLE = 'EXPLAIN_SIMPLE',
  FILL_IN_BLANKS = 'FILL_IN_BLANKS',
  NOTES_GENERATOR = 'NOTES_GENERATOR',
  TOPIC_BREAKDOWN = 'TOPIC_BREAKDOWN',
  TABLE_TO_CHARTS = 'TABLE_TO_CHARTS',

  // ===== 10 CREDITS - PRO+ (8 Features) =====
  EXPLAIN_AS_TEACHER = 'EXPLAIN_AS_TEACHER',
  NOTES_TO_QUIZ_TURBO = 'NOTES_TO_QUIZ_TURBO',
  TEST_GENERATOR = 'TEST_GENERATOR',
  QUESTION_BANK = 'QUESTION_BANK',
  REPORT_BUILDER = 'REPORT_BUILDER',
  AI_DETECTION_REDACTION = 'AI_DETECTION_REDACTION',
  DIAGRAM_INTERPRETATION = 'DIAGRAM_INTERPRETATION',
  CROSS_PDF_COMPARE = 'CROSS_PDF_COMPARE',

  // ===== 20 CREDITS - APEX ONLY (4 Features) =====
  CONTENT_TO_SCRIPT = 'CONTENT_TO_SCRIPT',
  PRESENTATION_MAKER = 'PRESENTATION_MAKER',
  MULTI_DOC_REASONING = 'MULTI_DOC_REASONING',
  CONTRACT_LAW_SCAN = 'CONTRACT_LAW_SCAN',
}

/**
 * Credit tier levels
 */
export enum CreditTier {
  TIER_2 = 2,
  TIER_5 = 5,
  TIER_10 = 10,
  TIER_20 = 20,
}

/**
 * AI Provider for Smart Docs
 */
export enum SmartDocsAIProvider {
  MISTRAL = 'mistral',
  GEMINI = 'gemini',
  OPENAI = 'openai',
}

/**
 * Minimum plan required for feature access
 */
export type MinimumPlanAccess = 'STARTER' | 'LITE' | 'PLUS' | 'PRO' | 'APEX';

// ==========================================
// PLAN TOKENS ALLOCATION
// ==========================================

/**
 * Monthly Doc AI tokens per plan
 * Token-based system: 1 page ≈ 5K tokens
 * All plans use Mistral Large 3
 */
export const SMART_DOCS_PLAN_TOKENS: Record<PlanType, {
  monthlyTokens: number;
  monthlyTokensTrial?: number;
  monthlyTokensInternational: number;
  monthlyTokensTrialInternational?: number;
  tokensPerPage: number;
  hasAccess: boolean;
}> = {
  [PlanType.STARTER]: {
    monthlyTokens: 100000,           // 100K (paid)
    monthlyTokensTrial: 25000,       // 25K (free trial)
    monthlyTokensInternational: 200000,
    monthlyTokensTrialInternational: 50000,
    tokensPerPage: 5000,
    hasAccess: true,
  },
  [PlanType.LITE]: {
    monthlyTokens: 200000,           // 200K
    monthlyTokensInternational: 400000,
    tokensPerPage: 5000,
    hasAccess: true,
  },
  [PlanType.PLUS]: {
    monthlyTokens: 400000,           // 400K
    monthlyTokensInternational: 800000,
    tokensPerPage: 5000,
    hasAccess: true,
  },
  [PlanType.PRO]: {
    monthlyTokens: 600000,           // 600K
    monthlyTokensInternational: 1200000,
    tokensPerPage: 5000,
    hasAccess: true,
  },
  [PlanType.APEX]: {
    monthlyTokens: 850000,           // 850K
    monthlyTokensInternational: 1700000,
    tokensPerPage: 5000,
    hasAccess: true,
  },
  [PlanType.SOVEREIGN]: {
    monthlyTokens: 999999999,
    monthlyTokensInternational: 999999999,
    tokensPerPage: 5000,
    hasAccess: true,
  },
};

// Legacy alias for backward compatibility
export const SMART_DOCS_PLAN_CREDITS = SMART_DOCS_PLAN_TOKENS;

// ==========================================
// TOKEN BOOSTER
// ==========================================

/**
 * Doc AI Token Booster (same for all plans)
 * 750K tokens @ ₹99 / $2.99
 */
export const SMART_DOCS_TOKEN_BOOSTER = {
  id: 'DOC_AI_BOOSTER',
  name: 'Doc AI Boost',
  description: 'Extra 750K tokens for document AI',
  eligiblePlans: [PlanType.STARTER, PlanType.LITE, PlanType.PLUS, PlanType.PRO, PlanType.APEX, PlanType.SOVEREIGN],
  price: 99,
  priceUSD: 2.99,
  tokensAdded: 750000,
  tokensAddedInternational: 1500000,
  validity: 30,
  maxPerMonth: 5,
  costs: {
    ai: 44,
    gateway: 2.34,
    total: 46.34,
    profit: 52.66,
    margin: 53.2,
  },
  costsInternational: {
    ai: 88,
    gateway: 7.56,
    total: 95.56,
    profit: 154.77,
    margin: 61.8,
  },
};

// Legacy alias for backward compatibility
export const SMART_DOCS_BOOSTERS = {
  DOC_AI_BOOSTER: SMART_DOCS_TOKEN_BOOSTER,
};

// ==========================================
// FEATURE CONFIGURATION
// ==========================================

/**
 * Complete feature configuration
 * Credits, plan access, AI routing, metadata
 */
export interface SmartDocsFeatureConfig {
  id: SmartDocsOperation;
  name: string;
  description: string;
  creditCost: CreditTier;
  minimumPlan: MinimumPlanAccess;
  category: string;
  icon: string;
  featured: boolean;
  aiProvider: SmartDocsAIProvider;
  aiModel: string;
  estimatedCostINR: number;
  processingTime: string;
  tokenCaps: {
    input: number;
    output: number;
  };
}

/**
 * All 25 Smart Docs Features
 */
export const SMART_DOCS_FEATURES: Record<SmartDocsOperation, SmartDocsFeatureConfig> = {
  // ==========================================
  // 2 CREDITS - STARTER+ (7 Features)
  // AI: Gemini 2.0 Flash (₹0 cost)
  // ==========================================
  
  [SmartDocsOperation.SUMMARY_SHORT]: {
    id: SmartDocsOperation.SUMMARY_SHORT,
    name: 'Quick Summary',
    description: '2-3 sentence summary of your document',
    creditCost: CreditTier.TIER_2,
    minimumPlan: 'STARTER',
    category: 'SUMMARY',
    icon: '📄',
    featured: false,
    aiProvider: SmartDocsAIProvider.GEMINI,
    aiModel: 'gemini-2.0-flash-exp',
    estimatedCostINR: 0,
    processingTime: '3-5s',
    tokenCaps: { input: 2000, output: 200 },
  },

  [SmartDocsOperation.SUMMARY_BULLET]: {
    id: SmartDocsOperation.SUMMARY_BULLET,
    name: 'Bullet Points',
    description: '5-7 key bullet points from document',
    creditCost: CreditTier.TIER_2,
    minimumPlan: 'STARTER',
    category: 'SUMMARY',
    icon: '📋',
    featured: false,
    aiProvider: SmartDocsAIProvider.GEMINI,
    aiModel: 'gemini-2.0-flash-exp',
    estimatedCostINR: 0,
    processingTime: '4-6s',
    tokenCaps: { input: 2000, output: 300 },
  },

  [SmartDocsOperation.KEYWORD_EXTRACT]: {
    id: SmartDocsOperation.KEYWORD_EXTRACT,
    name: 'Keywords',
    description: 'Extract important keywords and terms',
    creditCost: CreditTier.TIER_2,
    minimumPlan: 'STARTER',
    category: 'ANALYSIS',
    icon: '🔑',
    featured: false,
    aiProvider: SmartDocsAIProvider.GEMINI,
    aiModel: 'gemini-2.0-flash-exp',
    estimatedCostINR: 0,
    processingTime: '2-4s',
    tokenCaps: { input: 2000, output: 200 },
  },

  [SmartDocsOperation.DOCUMENT_CLEANUP]: {
    id: SmartDocsOperation.DOCUMENT_CLEANUP,
    name: 'Doc Cleanup',
    description: 'Fix formatting, grammar, and structure',
    creditCost: CreditTier.TIER_2,
    minimumPlan: 'STARTER',
    category: 'FORMATTING',
    icon: '🧹',
    featured: false,
    aiProvider: SmartDocsAIProvider.GEMINI,
    aiModel: 'gemini-2.0-flash-exp',
    estimatedCostINR: 0,
    processingTime: '4-6s',
    tokenCaps: { input: 3000, output: 3000 },
  },

  [SmartDocsOperation.EXTRACT_DEFINITIONS]: {
    id: SmartDocsOperation.EXTRACT_DEFINITIONS,
    name: 'Definitions',
    description: 'Extract key terms and their definitions',
    creditCost: CreditTier.TIER_2,
    minimumPlan: 'STARTER',
    category: 'ANALYSIS',
    icon: '📖',
    featured: false,
    aiProvider: SmartDocsAIProvider.GEMINI,
    aiModel: 'gemini-2.0-flash-exp',
    estimatedCostINR: 0,
    processingTime: '4-6s',
    tokenCaps: { input: 2000, output: 300 },
  },

  [SmartDocsOperation.SUMMARY_LONG]: {
    id: SmartDocsOperation.SUMMARY_LONG,
    name: 'Long Summary',
    description: 'Comprehensive paragraph summary',
    creditCost: CreditTier.TIER_2,
    minimumPlan: 'STARTER',
    category: 'SUMMARY',
    icon: '📝',
    featured: false,
    aiProvider: SmartDocsAIProvider.GEMINI,
    aiModel: 'gemini-2.0-flash-exp',
    estimatedCostINR: 0,
    processingTime: '8-12s',
    tokenCaps: { input: 4000, output: 800 },
  },

  [SmartDocsOperation.TRANSLATE_BASIC]: {
    id: SmartDocsOperation.TRANSLATE_BASIC,
    name: 'Translation',
    description: 'Translate document to other languages',
    creditCost: CreditTier.TIER_2,
    minimumPlan: 'STARTER',
    category: 'TRANSLATION',
    icon: '🌐',
    featured: false,
    aiProvider: SmartDocsAIProvider.GEMINI,
    aiModel: 'gemini-2.0-flash-exp',
    estimatedCostINR: 0,
    processingTime: '10-15s',
    tokenCaps: { input: 4000, output: 4000 },
  },

  // ==========================================
  // 5 CREDITS - PLUS+ (6 Features)
  // AI: GPT-4o-mini (~₹0.10/op)
  // ==========================================

  [SmartDocsOperation.FLASHCARDS]: {
    id: SmartDocsOperation.FLASHCARDS,
    name: 'Flashcards',
    description: 'Generate study flashcards from content',
    creditCost: CreditTier.TIER_5,
    minimumPlan: 'PLUS',
    category: 'STUDY',
    icon: '🎴',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.10,
    processingTime: '5-8s',
    tokenCaps: { input: 2000, output: 500 },
  },

  [SmartDocsOperation.EXPLAIN_SIMPLE]: {
    id: SmartDocsOperation.EXPLAIN_SIMPLE,
    name: 'ELI5',
    description: 'Explain Like I\'m 5 - Simplify complex topics',
    creditCost: CreditTier.TIER_5,
    minimumPlan: 'PLUS',
    category: 'EXPLAIN',
    icon: '🧒',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.10,
    processingTime: '5-8s',
    tokenCaps: { input: 2000, output: 400 },
  },

  [SmartDocsOperation.FILL_IN_BLANKS]: {
    id: SmartDocsOperation.FILL_IN_BLANKS,
    name: 'Fill in Blanks',
    description: 'Create fill-in-the-blank exercises',
    creditCost: CreditTier.TIER_5,
    minimumPlan: 'PLUS',
    category: 'TEST',
    icon: '✏️',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.10,
    processingTime: '8-12s',
    tokenCaps: { input: 4000, output: 2000 },
  },

  [SmartDocsOperation.NOTES_GENERATOR]: {
    id: SmartDocsOperation.NOTES_GENERATOR,
    name: 'Notes Maker',
    description: 'Generate structured study notes',
    creditCost: CreditTier.TIER_5,
    minimumPlan: 'PLUS',
    category: 'NOTES',
    icon: '📒',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.10,
    processingTime: '12-18s',
    tokenCaps: { input: 5000, output: 2000 },
  },

  [SmartDocsOperation.TOPIC_BREAKDOWN]: {
    id: SmartDocsOperation.TOPIC_BREAKDOWN,
    name: 'Topic Tree',
    description: 'Break down topic into subtopics',
    creditCost: CreditTier.TIER_5,
    minimumPlan: 'PLUS',
    category: 'ANALYSIS',
    icon: '🌳',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.10,
    processingTime: '6-10s',
    tokenCaps: { input: 3000, output: 800 },
  },

  [SmartDocsOperation.TABLE_TO_CHARTS]: {
    id: SmartDocsOperation.TABLE_TO_CHARTS,
    name: 'Data Viz',
    description: 'Convert tables to chart descriptions',
    creditCost: CreditTier.TIER_5,
    minimumPlan: 'PLUS',
    category: 'DATA',
    icon: '📊',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.10,
    processingTime: '8-12s',
    tokenCaps: { input: 3000, output: 600 },
  },

  // ==========================================
  // 10 CREDITS - PRO+ (8 Features)
  // AI: GPT-4o-mini (~₹0.18/op)
  // ==========================================

  [SmartDocsOperation.EXPLAIN_AS_TEACHER]: {
    id: SmartDocsOperation.EXPLAIN_AS_TEACHER,
    name: 'Explain as Teacher',
    description: 'Teacher-style detailed explanation with examples',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'EXPLAIN',
    icon: '👨‍🏫',
    featured: true,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '15-25s',
    tokenCaps: { input: 6000, output: 2000 },
  },

  [SmartDocsOperation.NOTES_TO_QUIZ_TURBO]: {
    id: SmartDocsOperation.NOTES_TO_QUIZ_TURBO,
    name: 'Quiz Turbo',
    description: 'Generate MCQ quiz from notes with answers',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'TEST',
    icon: '⚡',
    featured: true,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '12-20s',
    tokenCaps: { input: 5000, output: 2000 },
  },

  [SmartDocsOperation.TEST_GENERATOR]: {
    id: SmartDocsOperation.TEST_GENERATOR,
    name: 'Test Maker',
    description: 'Full test paper with marking scheme',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'TEST',
    icon: '📋',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '20-30s',
    tokenCaps: { input: 6000, output: 3000 },
  },

  [SmartDocsOperation.QUESTION_BANK]: {
    id: SmartDocsOperation.QUESTION_BANK,
    name: 'Question Bank',
    description: 'Generate comprehensive question bank',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'TEST',
    icon: '🏦',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '25-35s',
    tokenCaps: { input: 6000, output: 3500 },
  },

  [SmartDocsOperation.REPORT_BUILDER]: {
    id: SmartDocsOperation.REPORT_BUILDER,
    name: 'Report Builder',
    description: 'Generate structured reports',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'NOTES',
    icon: '📊',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '20-30s',
    tokenCaps: { input: 8000, output: 4000 },
  },

  [SmartDocsOperation.AI_DETECTION_REDACTION]: {
    id: SmartDocsOperation.AI_DETECTION_REDACTION,
    name: 'Humanize',
    description: 'Make AI content more human-like',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'FORMATTING',
    icon: '🤖',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '15-25s',
    tokenCaps: { input: 5000, output: 5000 },
  },

  [SmartDocsOperation.DIAGRAM_INTERPRETATION]: {
    id: SmartDocsOperation.DIAGRAM_INTERPRETATION,
    name: 'Diagram Explainer',
    description: 'Explain flowcharts and diagrams',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'EXPLAIN',
    icon: '📐',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '10-18s',
    tokenCaps: { input: 4000, output: 1500 },
  },

  [SmartDocsOperation.CROSS_PDF_COMPARE]: {
    id: SmartDocsOperation.CROSS_PDF_COMPARE,
    name: 'Compare Docs',
    description: 'Compare multiple documents',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'ANALYSIS',
    icon: '⚖️',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '25-40s',
    tokenCaps: { input: 10000, output: 2000 },
  },

  // ==========================================
  // 20 CREDITS - APEX ONLY (4 Features)
  // AI: GPT-4o-mini (~₹0.25/op)
  // ==========================================

  [SmartDocsOperation.CONTENT_TO_SCRIPT]: {
    id: SmartDocsOperation.CONTENT_TO_SCRIPT,
    name: 'YouTube Script',
    description: 'Convert content to video script',
    creditCost: CreditTier.TIER_20,
    minimumPlan: 'APEX',
    category: 'NOTES',
    icon: '🎬',
    featured: true,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.25,
    processingTime: '30-45s',
    tokenCaps: { input: 8000, output: 4000 },
  },

  [SmartDocsOperation.PRESENTATION_MAKER]: {
    id: SmartDocsOperation.PRESENTATION_MAKER,
    name: 'PPT Maker',
    description: 'Generate presentation slides content',
    creditCost: CreditTier.TIER_20,
    minimumPlan: 'APEX',
    category: 'NOTES',
    icon: '📽️',
    featured: true,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.25,
    processingTime: '35-50s',
    tokenCaps: { input: 8000, output: 5000 },
  },

  [SmartDocsOperation.MULTI_DOC_REASONING]: {
    id: SmartDocsOperation.MULTI_DOC_REASONING,
    name: 'Multi-Doc Analysis',
    description: 'Deep reasoning across multiple documents',
    creditCost: CreditTier.TIER_20,
    minimumPlan: 'APEX',
    category: 'ANALYSIS',
    icon: '🧩',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.25,
    processingTime: '40-60s',
    tokenCaps: { input: 15000, output: 3000 },
  },

  [SmartDocsOperation.CONTRACT_LAW_SCAN]: {
    id: SmartDocsOperation.CONTRACT_LAW_SCAN,
    name: 'Legal Scan',
    description: 'Analyze contracts and legal documents',
    creditCost: CreditTier.TIER_20,
    minimumPlan: 'APEX',
    category: 'LEGAL',
    icon: '⚖️',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.25,
    processingTime: '35-50s',
    tokenCaps: { input: 10000, output: 3000 },
  },
};

// ==========================================
// FEATURE CATEGORIES
// ==========================================

export const SMART_DOCS_CATEGORIES = {
  SUMMARY: {
    id: 'SUMMARY',
    name: 'Summary',
    icon: '📄',
    description: 'Document summarization tools',
  },
  STUDY: {
    id: 'STUDY',
    name: 'Study',
    icon: '🎴',
    description: 'Study and learning tools',
  },
  ANALYSIS: {
    id: 'ANALYSIS',
    name: 'Analysis',
    icon: '🔍',
    description: 'Document analysis tools',
  },
  TEST: {
    id: 'TEST',
    name: 'Test',
    icon: '📝',
    description: 'Quiz and test generation',
  },
  NOTES: {
    id: 'NOTES',
    name: 'Notes',
    icon: '📒',
    description: 'Note-taking and documentation',
  },
  EXPLAIN: {
    id: 'EXPLAIN',
    name: 'Explain',
    icon: '💡',
    description: 'Explanation and teaching tools',
  },
  TRANSLATION: {
    id: 'TRANSLATION',
    name: 'Translation',
    icon: '🌐',
    description: 'Language translation',
  },
  FORMATTING: {
    id: 'FORMATTING',
    name: 'Formatting',
    icon: '🧹',
    description: 'Document cleanup and formatting',
  },
  DATA: {
    id: 'DATA',
    name: 'Data',
    icon: '📊',
    description: 'Data visualization tools',
  },
  LEGAL: {
    id: 'LEGAL',
    name: 'Legal',
    icon: '⚖️',
    description: 'Legal document tools',
  },
} as const;

// ==========================================
// PLAN ACCESS MATRIX
// ==========================================

/**
 * Which plans can access which credit tiers
 * LITE has NO Smart Docs access
 */
export const PLAN_ACCESS_MATRIX: Record<PlanType, CreditTier[]> = {
  // ✅ ALL PLANS = ALL FEATURES (Only token limits matter)
  [PlanType.STARTER]: [CreditTier.TIER_2, CreditTier.TIER_5, CreditTier.TIER_10, CreditTier.TIER_20],
  [PlanType.LITE]: [CreditTier.TIER_2, CreditTier.TIER_5, CreditTier.TIER_10, CreditTier.TIER_20],
  [PlanType.PLUS]: [CreditTier.TIER_2, CreditTier.TIER_5, CreditTier.TIER_10, CreditTier.TIER_20],
  [PlanType.PRO]: [CreditTier.TIER_2, CreditTier.TIER_5, CreditTier.TIER_10, CreditTier.TIER_20],
  [PlanType.APEX]: [CreditTier.TIER_2, CreditTier.TIER_5, CreditTier.TIER_10, CreditTier.TIER_20],
  [PlanType.SOVEREIGN]: [CreditTier.TIER_2, CreditTier.TIER_5, CreditTier.TIER_10, CreditTier.TIER_20],
};

/**
 * Features accessible per plan (derived from PLAN_ACCESS_MATRIX)
 * LITE has NO features
 */
// ✅ ALL PLANS = ALL FEATURES (No locking, only token limits)
const ALL_FEATURES = Object.values(SMART_DOCS_FEATURES).map(f => f.id);

export const PLAN_FEATURE_ACCESS: Record<PlanType, SmartDocsOperation[]> = {
  [PlanType.STARTER]: ALL_FEATURES,
  [PlanType.LITE]: ALL_FEATURES,
  [PlanType.PLUS]: ALL_FEATURES,
  [PlanType.PRO]: ALL_FEATURES,
  [PlanType.APEX]: ALL_FEATURES,
  [PlanType.SOVEREIGN]: ALL_FEATURES,
};

// ==========================================
// AI ROUTING CONFIG
// ==========================================

/**
 * AI Model configuration for Smart Docs
 */
export const SMART_DOCS_AI_CONFIG = {
  [SmartDocsAIProvider.MISTRAL]: {
    provider: 'mistral',
    model: 'mistral-large-3-2512',
    costPer1MInput: 2 * 85,    // $2/1M = ₹170/1M input
    costPer1MOutput: 6 * 85,   // $6/1M = ₹510/1M output
    tier: 'primary',
  },
  [SmartDocsAIProvider.GEMINI]: {
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
    costPer1MInput: 0,
    costPer1MOutput: 0,
    tier: 'fallback',
  },
  [SmartDocsAIProvider.OPENAI]: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    costPer1MInput: 0.15 * 85,
    costPer1MOutput: 0.60 * 85,
    tier: 'premium',
  },
} as const;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get feature config by operation
 */
export function getFeatureConfig(operation: SmartDocsOperation): SmartDocsFeatureConfig {
  return SMART_DOCS_FEATURES[operation];
}

/**
 * Get credit cost for an operation
 */
export function getCreditCost(operation: SmartDocsOperation): number {
  return SMART_DOCS_FEATURES[operation].creditCost;
}

/**
 * Check if plan can access an operation
 */
/**
 * Check if plan can access an operation
 * ✅ ALL PLANS CAN ACCESS ALL FEATURES - Only token limits matter
 */
export function canPlanAccessOperation(planType: PlanType, operation: SmartDocsOperation): boolean {
  // All plans can access all features - no locking
  return operation in SMART_DOCS_FEATURES;
}

/**
 * Get minimum plan required for an operation
 */
export function getMinimumPlanForOperation(operation: SmartDocsOperation): MinimumPlanAccess {
  return SMART_DOCS_FEATURES[operation].minimumPlan;
}

/**
 * Get all features for a plan
 */
export function getFeaturesForPlan(planType: PlanType): SmartDocsFeatureConfig[] {
  return PLAN_FEATURE_ACCESS[planType].map(op => SMART_DOCS_FEATURES[op]);
}

/**
 * Get locked features for a plan (features they CAN'T access)
 */
/**
 * Get locked features for a plan
 * ✅ No features are locked - always returns empty array
 */
export function getLockedFeaturesForPlan(planType: PlanType): SmartDocsFeatureConfig[] {
  // No features locked - all plans have access to all features
  return [];
}

/**
 * Get featured operations (starred features)
 */
export function getFeaturedOperations(): SmartDocsFeatureConfig[] {
  return Object.values(SMART_DOCS_FEATURES).filter(f => f.featured);
}

/**
 * Get operations by credit tier
 */
export function getOperationsByTier(tier: CreditTier): SmartDocsFeatureConfig[] {
  return Object.values(SMART_DOCS_FEATURES).filter(f => f.creditCost === tier);
}

/**
 * Get operations by category
 */
export function getOperationsByCategory(categoryId: string): SmartDocsFeatureConfig[] {
  return Object.values(SMART_DOCS_FEATURES).filter(f => f.category === categoryId);
}

/**
 * Calculate total credits needed for multiple operations
 */
export function calculateTotalCredits(operations: SmartDocsOperation[]): number {
  return operations.reduce((total, op) => total + getCreditCost(op), 0);
}

/**
 * Get plan credits info
 */
export function getPlanCredits(planType: PlanType) {
  return SMART_DOCS_PLAN_CREDITS[planType];
}

/**
 * Get applicable booster for a plan
 */
export function getBoosterForPlan(planType: PlanType) {
  if (SMART_DOCS_TOKEN_BOOSTER.eligiblePlans.includes(planType)) {
    return SMART_DOCS_TOKEN_BOOSTER;
  }
  return null;
}

// ==========================================
// TOKEN-BASED HELPER FUNCTIONS
// ==========================================

/**
 * Get plan tokens info
 */
export function getPlanTokens(planType: PlanType, isInternational: boolean = false, isTrial: boolean = false) {
  const config = SMART_DOCS_PLAN_TOKENS[planType];
  
  if (isTrial && config.monthlyTokensTrial) {
    return isInternational 
      ? (config.monthlyTokensTrialInternational ?? config.monthlyTokensTrial)
      : config.monthlyTokensTrial;
  }
  
  return isInternational ? config.monthlyTokensInternational : config.monthlyTokens;
}

/**
 * Check if plan has Doc AI access
 */
export function hasPlanDocAIAccess(planType: PlanType): boolean {
  return SMART_DOCS_PLAN_TOKENS[planType]?.hasAccess ?? false;
}

/**
 * Calculate tokens needed for pages
 * 1 page = ~5K tokens
 */
export function calculateTokensForPages(pageCount: number): number {
  const TOKENS_PER_PAGE = 5000;
  return pageCount * TOKENS_PER_PAGE;
}

/**
 * Calculate pages possible with tokens
 */
export function calculatePagesFromTokens(tokens: number): number {
  const TOKENS_PER_PAGE = 5000;
  return Math.floor(tokens / TOKENS_PER_PAGE);
}

/**
 * Get booster tokens
 */
export function getBoosterTokens(isInternational: boolean = false): number {
  return isInternational 
    ? SMART_DOCS_TOKEN_BOOSTER.tokensAddedInternational 
    : SMART_DOCS_TOKEN_BOOSTER.tokensAdded;
}

/**
 * Get booster price
 */
export function getBoosterPrice(isInternational: boolean = false): number {
  return isInternational 
    ? SMART_DOCS_TOKEN_BOOSTER.priceUSD 
    : SMART_DOCS_TOKEN_BOOSTER.price;
}

/**
 * Validate operation exists
 */
export function isValidOperation(operation: string): operation is SmartDocsOperation {
  return operation in SmartDocsOperation;
}

/**
 * Get AI routing for an operation
 */
export function getAIRouting(operation: SmartDocsOperation) {
  const feature = SMART_DOCS_FEATURES[operation];
  return SMART_DOCS_AI_CONFIG[feature.aiProvider];
}

/**
 * Get upgrade suggestion for locked feature
 */
/**
 * Get upgrade suggestion for locked feature
 * ✅ Always returns null - no features are locked
 */
export function getUpgradeSuggestion(
  currentPlan: PlanType, 
  operation: SmartDocsOperation
): { suggestedPlan: PlanType; reason: string } | null {
  // No features locked, so no upgrade needed for access
  return null;
}

// ==========================================
// ERROR MESSAGES
// ==========================================

export const SMART_DOCS_ERRORS = {
  INSUFFICIENT_TOKENS: (required: number, available: number) =>
    `Insufficient tokens. Required: ${required.toLocaleString()}, Available: ${available.toLocaleString()}`,
  
  // Legacy alias
  INSUFFICIENT_CREDITS: (required: number, available: number) =>
    `Insufficient tokens. Required: ${required.toLocaleString()}, Available: ${available.toLocaleString()}`,
  
  FEATURE_LOCKED: (featureName: string, requiredPlan: string) =>
    `"${featureName}" requires ${requiredPlan} plan or higher. Upgrade to unlock!`,
  
  NO_DOC_AI_ACCESS: () =>
    `Doc AI is not available on your current plan. Upgrade to unlock!`,
  
  BOOSTER_LIMIT_REACHED: (maxPerMonth: number) =>
    `Maximum ${maxPerMonth} boosters per month already purchased.`,
  
  INVALID_OPERATION: (operation: string) =>
    `Invalid operation: ${operation}. Please use a valid Smart Docs feature.`,
} as const;

// ==========================================
// SUMMARY STATS
// ==========================================

export const SMART_DOCS_STATS = {
  totalFeatures: Object.keys(SMART_DOCS_FEATURES).length,
  tier2Features: getOperationsByTier(CreditTier.TIER_2).length,
  tier5Features: getOperationsByTier(CreditTier.TIER_5).length,
  tier10Features: getOperationsByTier(CreditTier.TIER_10).length,
  tier20Features: getOperationsByTier(CreditTier.TIER_20).length,
  featuredCount: getFeaturedOperations().length,
  categories: Object.keys(SMART_DOCS_CATEGORIES).length,
} as const;

/**
 * ==========================================
 * SMART DOCS TOKEN SYSTEM - SUMMARY
 * ==========================================
 * 
 * TOTAL FEATURES: 25
 * AI MODEL: Mistral Large 3
 * 
 * TOKEN USAGE:
 * - 1 Page ≈ 5,000 tokens
 * 
 * PLAN TOKENS (India / International):
 * - STARTER Free: 25K / 50K (taste)
 * - STARTER Paid: 100K / 200K
 * - LITE: 200K / 400K
 * - PLUS: 400K / 800K
 * - PRO: 600K / 1.2M
 * - APEX: 850K / 1.7M
 * 
 * BOOSTER:
 * - All Plans: ₹99 / $2.99 → 750K / 1.5M tokens
 * 
 * FEATURE TIERS:
 * - Tier 2 (STARTER+): 7 features
 * - Tier 5 (LITE+): 6 features
 * - Tier 10 (PRO+): 8 features
 * - Tier 20 (APEX): 4 features
 * 
 * ==========================================
 */