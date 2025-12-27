// src/constants/smartDocsCredits.ts

/**
 * ==========================================
 * SORIVA SMART DOCS - CREDIT SYSTEM
 * ==========================================
 * Created: December 23, 2025
 * Author: Risenex Dynamics
 * 
 * CREDIT SYSTEM OVERVIEW:
 * - Plan-based monthly credits (50/150/300/550)
 * - Feature unlock by plan tier
 * - AI routing: Gemini (2cr) / GPT (5cr+)
 * - Booster packs for extra credits
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
  GEMINI = 'gemini',
  OPENAI = 'openai',
}

/**
 * Minimum plan required for feature access
 */
export type MinimumPlanAccess = 'STARTER' | 'PLUS' | 'PRO' | 'APEX';

// ==========================================
// PLAN CREDITS ALLOCATION
// ==========================================

/**
 * Monthly credits per plan
 * STARTER gets limited access, paid plans get more
 */
export const SMART_DOCS_PLAN_CREDITS: Record<PlanType, {
  monthlyCredits: number;
  dailyLimit: number;
  carryForward: boolean;
  carryForwardPercent: number;
}> = {
  [PlanType.STARTER]: {
    monthlyCredits: 50,
    dailyLimit: 10,
    carryForward: false,
    carryForwardPercent: 0,
  },
  [PlanType.PLUS]: {
    monthlyCredits: 150,
    dailyLimit: 25,
    carryForward: true,
    carryForwardPercent: 25,
  },
  [PlanType.PRO]: {
    monthlyCredits: 300,
    dailyLimit: 50,
    carryForward: true,
    carryForwardPercent: 50,
  },
  [PlanType.APEX]: {
    monthlyCredits: 550,
    dailyLimit: 100,
    carryForward: true,
    carryForwardPercent: 75,
  },
  [PlanType.SOVEREIGN]: {
    monthlyCredits: 999999,
    dailyLimit: 999999,
    carryForward: false,
    carryForwardPercent: 0,
  },
};

// ==========================================
// BOOSTER PACKS
// ==========================================

/**
 * Credit booster packs (plan-specific pricing)
 */
export const SMART_DOCS_BOOSTERS: Record<string, {
  name: string;
  description: string;
  eligiblePlans: PlanType[];
  price: number;
  priceUSD: number;
  creditsAdded: number;
  validity: number; // days
  maxPerMonth: number;
}> = {
  PLUS_BOOSTER: {
    name: 'Plus Credit Pack',
    description: 'Extra 150 Smart Docs credits',
    eligiblePlans: [PlanType.PLUS],
    price: 59,
    priceUSD: 2.99,
    creditsAdded: 150,
    validity: 30,
    maxPerMonth: 2,
  },
  PRO_BOOSTER: {
    name: 'Pro Credit Pack',
    description: 'Extra 300 Smart Docs credits',
    eligiblePlans: [PlanType.PRO],
    price: 99,
    priceUSD: 4.99,
    creditsAdded: 300,
    validity: 30,
    maxPerMonth: 2,
  },
  APEX_BOOSTER: {
    name: 'Apex Credit Pack',
    description: 'Extra 550 Smart Docs credits',
    eligiblePlans: [PlanType.APEX],
    price: 149,
    priceUSD: 6.99,
    creditsAdded: 550,
    validity: 30,
    maxPerMonth: 2,
  },
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
    name: 'Topic Breakdown',
    description: 'Break down topics into subtopics',
    creditCost: CreditTier.TIER_5,
    minimumPlan: 'PLUS',
    category: 'ANALYSIS',
    icon: '🗂️',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.10,
    processingTime: '12-18s',
    tokenCaps: { input: 5000, output: 2000 },
  },

  [SmartDocsOperation.TABLE_TO_CHARTS]: {
    id: SmartDocsOperation.TABLE_TO_CHARTS,
    name: 'Table to Charts',
    description: 'Convert tables to visual chart data',
    creditCost: CreditTier.TIER_5,
    minimumPlan: 'PLUS',
    category: 'DATA',
    icon: '📊',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.10,
    processingTime: '15-20s',
    tokenCaps: { input: 4000, output: 1500 },
  },

  // ==========================================
  // 10 CREDITS - PRO+ (8 Features)
  // AI: GPT-4o-mini (~₹0.18/op)
  // ==========================================

  [SmartDocsOperation.EXPLAIN_AS_TEACHER]: {
    id: SmartDocsOperation.EXPLAIN_AS_TEACHER,
    name: 'Explain Teacher',
    description: 'Teaching-style explanation with examples & diagrams',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'EXPLAIN',
    icon: '👨‍🏫',
    featured: true,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '20-30s',
    tokenCaps: { input: 6000, output: 3500 },
  },

  [SmartDocsOperation.NOTES_TO_QUIZ_TURBO]: {
    id: SmartDocsOperation.NOTES_TO_QUIZ_TURBO,
    name: 'Quiz Turbo',
    description: 'Instant comprehensive test with MCQs, True/False, Case Studies',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'TEST',
    icon: '⚡',
    featured: true,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '20-30s',
    tokenCaps: { input: 5000, output: 3500 },
  },

  [SmartDocsOperation.TEST_GENERATOR]: {
    id: SmartDocsOperation.TEST_GENERATOR,
    name: 'Test Generator',
    description: 'Create MCQ tests with answer keys',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'TEST',
    icon: '📝',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '15-25s',
    tokenCaps: { input: 4000, output: 2500 },
  },

  [SmartDocsOperation.QUESTION_BANK]: {
    id: SmartDocsOperation.QUESTION_BANK,
    name: 'Question Bank',
    description: 'Generate comprehensive question bank',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'TEST',
    icon: '❓',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '20-30s',
    tokenCaps: { input: 5000, output: 3000 },
  },

  [SmartDocsOperation.REPORT_BUILDER]: {
    id: SmartDocsOperation.REPORT_BUILDER,
    name: 'Report Builder',
    description: 'Generate professional reports',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'REPORT',
    icon: '📑',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '28-40s',
    tokenCaps: { input: 8000, output: 4000 },
  },

  [SmartDocsOperation.AI_DETECTION_REDACTION]: {
    id: SmartDocsOperation.AI_DETECTION_REDACTION,
    name: 'AI Detection',
    description: 'Detect AI-generated content with humanization tips',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'ANALYSIS',
    icon: '🤖',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '20-30s',
    tokenCaps: { input: 5000, output: 2000 },
  },

  [SmartDocsOperation.DIAGRAM_INTERPRETATION]: {
    id: SmartDocsOperation.DIAGRAM_INTERPRETATION,
    name: 'Diagram Solver',
    description: 'Interpret and explain diagrams/images',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'ANALYSIS',
    icon: '🖼️',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '18-25s',
    tokenCaps: { input: 4000, output: 1500 },
  },

  [SmartDocsOperation.CROSS_PDF_COMPARE]: {
    id: SmartDocsOperation.CROSS_PDF_COMPARE,
    name: 'PDF Compare',
    description: 'Compare and analyze multiple documents',
    creditCost: CreditTier.TIER_10,
    minimumPlan: 'PRO',
    category: 'ANALYSIS',
    icon: '🔍',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.18,
    processingTime: '25-40s',
    tokenCaps: { input: 8000, output: 2000 },
  },

  // ==========================================
  // 20 CREDITS - APEX ONLY (4 Features)
  // AI: GPT-4o-mini (~₹0.25/op)
  // ==========================================

  [SmartDocsOperation.CONTENT_TO_SCRIPT]: {
    id: SmartDocsOperation.CONTENT_TO_SCRIPT,
    name: 'YouTube Script',
    description: 'Convert content to YouTube/Podcast scripts',
    creditCost: CreditTier.TIER_20,
    minimumPlan: 'APEX',
    category: 'CREATIVE',
    icon: '🎬',
    featured: true,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.25,
    processingTime: '18-25s',
    tokenCaps: { input: 5000, output: 3000 },
  },

  [SmartDocsOperation.PRESENTATION_MAKER]: {
    id: SmartDocsOperation.PRESENTATION_MAKER,
    name: 'PPT Maker',
    description: 'Generate presentation slides with speaker notes',
    creditCost: CreditTier.TIER_20,
    minimumPlan: 'APEX',
    category: 'CREATIVE',
    icon: '📊',
    featured: true,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.25,
    processingTime: '25-35s',
    tokenCaps: { input: 6000, output: 4500 },
  },

  [SmartDocsOperation.MULTI_DOC_REASONING]: {
    id: SmartDocsOperation.MULTI_DOC_REASONING,
    name: 'Multi-Doc Analysis',
    description: 'Advanced reasoning across multiple documents',
    creditCost: CreditTier.TIER_20,
    minimumPlan: 'APEX',
    category: 'ANALYSIS',
    icon: '🧠',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.25,
    processingTime: '40-60s',
    tokenCaps: { input: 10000, output: 3000 },
  },

  [SmartDocsOperation.CONTRACT_LAW_SCAN]: {
    id: SmartDocsOperation.CONTRACT_LAW_SCAN,
    name: 'Contract Scan',
    description: 'Legal document analysis with risk assessment',
    creditCost: CreditTier.TIER_20,
    minimumPlan: 'APEX',
    category: 'LEGAL',
    icon: '⚖️',
    featured: false,
    aiProvider: SmartDocsAIProvider.OPENAI,
    aiModel: 'gpt-4o-mini',
    estimatedCostINR: 0.25,
    processingTime: '30-45s',
    tokenCaps: { input: 8000, output: 3000 },
  },
};

// ==========================================
// FEATURE CATEGORIES
// ==========================================

export const SMART_DOCS_CATEGORIES = {
  SUMMARY: {
    id: 'SUMMARY',
    name: 'Summaries',
    icon: '📄',
    description: 'Document summarization tools',
  },
  ANALYSIS: {
    id: 'ANALYSIS',
    name: 'Analysis',
    icon: '🔍',
    description: 'Document analysis and insights',
  },
  STUDY: {
    id: 'STUDY',
    name: 'Study Tools',
    icon: '📚',
    description: 'Learning and study aids',
  },
  TEST: {
    id: 'TEST',
    name: 'Test Generation',
    icon: '📝',
    description: 'Quiz and test creators',
  },
  NOTES: {
    id: 'NOTES',
    name: 'Notes',
    icon: '📒',
    description: 'Note-taking tools',
  },
  EXPLAIN: {
    id: 'EXPLAIN',
    name: 'Explanations',
    icon: '💡',
    description: 'Simplify and explain content',
  },
  CREATIVE: {
    id: 'CREATIVE',
    name: 'Creative',
    icon: '🎨',
    description: 'Content creation tools',
  },
  REPORT: {
    id: 'REPORT',
    name: 'Reports',
    icon: '📑',
    description: 'Report generation',
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
 */
export const PLAN_ACCESS_MATRIX: Record<PlanType, CreditTier[]> = {
  [PlanType.STARTER]: [CreditTier.TIER_2],
  [PlanType.PLUS]: [CreditTier.TIER_2, CreditTier.TIER_5],
  [PlanType.PRO]: [CreditTier.TIER_2, CreditTier.TIER_5, CreditTier.TIER_10],
  [PlanType.APEX]: [CreditTier.TIER_2, CreditTier.TIER_5, CreditTier.TIER_10, CreditTier.TIER_20],
  [PlanType.SOVEREIGN]: [CreditTier.TIER_2, CreditTier.TIER_5, CreditTier.TIER_10, CreditTier.TIER_20],
};

/**
 * Features accessible per plan (derived from PLAN_ACCESS_MATRIX)
 */
export const PLAN_FEATURE_ACCESS: Record<PlanType, SmartDocsOperation[]> = {
  [PlanType.STARTER]: Object.values(SMART_DOCS_FEATURES)
    .filter(f => f.creditCost === CreditTier.TIER_2)
    .map(f => f.id),
  
  [PlanType.PLUS]: Object.values(SMART_DOCS_FEATURES)
    .filter(f => f.creditCost <= CreditTier.TIER_5)
    .map(f => f.id),
  
  [PlanType.PRO]: Object.values(SMART_DOCS_FEATURES)
    .filter(f => f.creditCost <= CreditTier.TIER_10)
    .map(f => f.id),
  
  [PlanType.APEX]: Object.values(SMART_DOCS_FEATURES)
    .map(f => f.id),
  
  [PlanType.SOVEREIGN]: Object.values(SMART_DOCS_FEATURES)
    .map(f => f.id),
};

// ==========================================
// AI ROUTING CONFIG
// ==========================================

/**
 * AI Model configuration for Smart Docs
 */
export const SMART_DOCS_AI_CONFIG = {
  [SmartDocsAIProvider.GEMINI]: {
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
    costPer1MInput: 0,
    costPer1MOutput: 0,
    tier: 'free',
  },
  [SmartDocsAIProvider.OPENAI]: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    costPer1MInput: 0.15 * 85, // ₹12.75/1M input
    costPer1MOutput: 0.60 * 85, // ₹51/1M output
    tier: 'paid',
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
export function canPlanAccessOperation(planType: PlanType, operation: SmartDocsOperation): boolean {
  const feature = SMART_DOCS_FEATURES[operation];
  const accessibleTiers = PLAN_ACCESS_MATRIX[planType];
  return accessibleTiers.includes(feature.creditCost);
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
export function getLockedFeaturesForPlan(planType: PlanType): SmartDocsFeatureConfig[] {
  const accessibleOps = PLAN_FEATURE_ACCESS[planType];
  return Object.values(SMART_DOCS_FEATURES).filter(f => !accessibleOps.includes(f.id));
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
  return Object.values(SMART_DOCS_BOOSTERS).find(b => 
    b.eligiblePlans.includes(planType)
  );
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
export function getUpgradeSuggestion(
  currentPlan: PlanType, 
  operation: SmartDocsOperation
): { suggestedPlan: PlanType; reason: string } | null {
  if (canPlanAccessOperation(currentPlan, operation)) {
    return null;
  }

  const feature = SMART_DOCS_FEATURES[operation];
  
  const planOrder: PlanType[] = [
    PlanType.STARTER,
    PlanType.PLUS,
    PlanType.PRO,
    PlanType.APEX,
  ];

  for (const plan of planOrder) {
    if (canPlanAccessOperation(plan, operation)) {
      return {
        suggestedPlan: plan,
        reason: `"${feature.name}" requires ${plan} plan or higher`,
      };
    }
  }

  return null;
}

// ==========================================
// ERROR MESSAGES
// ==========================================

export const SMART_DOCS_ERRORS = {
  INSUFFICIENT_CREDITS: (required: number, available: number) =>
    `Insufficient credits. Required: ${required}, Available: ${available}`,
  
  FEATURE_LOCKED: (featureName: string, requiredPlan: string) =>
    `"${featureName}" requires ${requiredPlan} plan or higher. Upgrade to unlock!`,
  
  DAILY_LIMIT_REACHED: (limit: number) =>
    `Daily credit limit reached (${limit} credits/day). Try again tomorrow or upgrade.`,
  
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
 * SMART DOCS CREDIT SYSTEM - SUMMARY
 * ==========================================
 * 
 * TOTAL FEATURES: 25
 * 
 * CREDIT TIERS:
 * - 2 Credits (STARTER+): 7 features - Gemini (FREE)
 * - 5 Credits (PLUS+): 6 features - GPT (~₹0.10)
 * - 10 Credits (PRO+): 8 features - GPT (~₹0.18)
 * - 20 Credits (APEX): 4 features - GPT (~₹0.25)
 * 
 * PLAN CREDITS:
 * - STARTER: 50/month (10/day)
 * - PLUS: 150/month (25/day)
 * - PRO: 300/month (50/day)
 * - APEX: 550/month (100/day)
 * 
 * BOOSTERS:
 * - PLUS: ₹59 → +150 credits
 * - PRO: ₹99 → +300 credits
 * - APEX: ₹149 → +550 credits
 * 
 * FEATURED (⭐):
 * - Explain Teacher (10cr)
 * - Quiz Turbo (10cr)
 * - YouTube Script (20cr)
 * - PPT Maker (20cr)
 * 
 * ==========================================
 */