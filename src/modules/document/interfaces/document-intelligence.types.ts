// src/modules/document/interfaces/document-intelligence.types.ts

/**
 * ==========================================
 * DOCUMENT INTELLIGENCE - TYPE DEFINITIONS
 * ==========================================
 * Created: November 23, 2025
 * Updated: November 24, 2025 - FIXED VERSION
 * Audited: December 10, 2025 - COMPLETE AUDIT
 * 
 * AUDIT FIXES APPLIED:
 * ✅ Added missing operation options for 5 new features
 * ✅ Added structured output types for all operations
 * ✅ Added PresentationSlide types for world-class PPT maker
 * ✅ Completed DocumentIntelligenceAddon interface
 * ✅ Added helper types for future use
 * ✅ Added Teacher Mode specific types
 * ✅ Added Script Generator specific types
 * ✅ Added Quiz Turbo specific types
 * 
 * ALIGNED WITH:
 * - Prisma schema (OperationType, OperationStatus enums)
 * - documentLimits.ts exports (33 operations)
 * - document-intelligence.service.ts usage
 * - document-operations.service.ts usage
 */

import { OperationType, OperationStatus } from '@prisma/client';

// ==========================================
// RE-EXPORT FROM CONSTANTS (for convenience)
// ==========================================

export type {
  FreeOperationType,
  PaidOperationType,
  AllOperationType,
  DocumentStatusType,
  FeatureCategoryId,
  AIProvider,
  AITier,
} from '@/constants/documentLimits';

// ==========================================
// DOCUMENT UPLOAD TYPES
// ==========================================

export interface DocumentUploadRequest {
  file: Express.Multer.File;
  userId: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    folder?: string;
  };
}

export interface DocumentUploadResponse {
  success: boolean;
  document: {
    id: string;
    filename: string;
    originalName?: string;
    fileSize: number;
    fileType: string;
    mimeType?: string;
    status: string;
    pageCount?: number;
    wordCount?: number;
    uploadedAt: Date;
  };
  usage: {
    documentsUsed: number;
    documentsLimit: number;
    documentsRemaining?: number;
    storageUsed: number;
    storageLimit: number;
  };
}

// ==========================================
// DOCUMENT OPERATION OPTIONS
// ✅ AUDIT FIX: Added options for ALL 33 operations
// ==========================================

export interface OperationOptions {
  // ===== SUMMARY OPTIONS =====
  /** Summary length preference */
  length?: 'short' | 'medium' | 'long';
  /** Summary output style (for bullets/paragraph format) */
  summaryFormat?: 'paragraph' | 'bullets' | 'numbered';
  /** Include key takeaways */
  includeKeyTakeaways?: boolean;
  
  // ===== OUTPUT FORMAT =====
  /** AI output format */
  outputFormat?: 'text' | 'json' | 'markdown' | 'html' | 'structured';
  
  // ===== TRANSLATION OPTIONS =====
  /** Target language for translation */
  targetLanguage?: string;
  /** Source language (auto-detect if not provided) */
  sourceLanguage?: string;
  /** Preserve formatting during translation */
  preserveFormatting?: boolean;
  /** Simplify while translating */
  simplifyWhileTranslating?: boolean;
  
  // ===== TEST GENERATOR OPTIONS =====
  /** Number of questions to generate */
  questionCount?: number;
  /** Type of questions */
  questionType?: 'mcq' | 'short' | 'long' | 'fill_blank' | 'true_false' | 'mixed';
  /** Difficulty level */
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  /** Include answer key with explanations */
  includeAnswerKey?: boolean;
  /** Include marks/points allocation */
  includeMarks?: boolean;
  /** Time limit suggestion */
  suggestTimeLimit?: boolean;
  
  // ===== FLASHCARD OPTIONS =====
  /** Number of flashcards to generate */
  cardCount?: number;
  /** Include hints on cards */
  includeHints?: boolean;
  /** Card style */
  cardStyle?: 'simple' | 'detailed' | 'visual';
  
  // ===== NOTES OPTIONS =====
  /** Level of detail in notes */
  detailLevel?: 'brief' | 'detailed' | 'comprehensive';
  /** Include examples in notes */
  includeExamples?: boolean;
  /** Include diagrams/visual descriptions */
  includeDiagrams?: boolean;
  /** Notes structure */
  notesStructure?: 'outline' | 'cornell' | 'mindmap' | 'traditional';
  
  // ===== PRESENTATION OPTIONS =====
  /** Number of slides to generate */
  slideCount?: number;
  /** Presentation template style */
  templateStyle?: 'professional' | 'academic' | 'creative' | 'minimal' | 'corporate';
  /** Include speaker notes */
  includeSpeakerNotes?: boolean;
  /** Include title slide */
  includeTitleSlide?: boolean;
  /** Include summary/conclusion slide */
  includeSummarySlide?: boolean;
  /** Color theme */
  colorTheme?: 'blue' | 'green' | 'purple' | 'orange' | 'neutral' | 'custom';
  /** Custom brand colors */
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  /** Include charts/infographics */
  includeInfographics?: boolean;
  /** Include icons */
  includeIcons?: boolean;
  
  // ===== Q&A / CHAT OPTIONS =====
  /** Custom question to ask about document */
  customQuestion?: string;
  /** Include citations/references */
  includeCitations?: boolean;
  /** Response style */
  responseStyle?: 'concise' | 'detailed' | 'conversational';
  
  // ===== EXPLAIN SIMPLE (ELI5) OPTIONS ===== ✅ NEW
  /** Target audience age/level */
  targetAudience?: 'child' | 'teenager' | 'adult_beginner' | 'general';
  /** Use analogies */
  useAnalogies?: boolean;
  /** Maximum complexity level (1-10) */
  maxComplexityLevel?: number;
  
  // ===== EXTRACT DEFINITIONS OPTIONS ===== ✅ NEW
  /** Maximum definitions to extract */
  maxDefinitions?: number;
  /** Include examples with definitions */
  includeExamplesWithDefinitions?: boolean;
  /** Sort definitions */
  sortDefinitions?: 'alphabetical' | 'order_of_appearance' | 'importance';
  /** Include related terms */
  includeRelatedTerms?: boolean;
  
  // ===== EXPLAIN AS TEACHER OPTIONS ===== ✅ NEW (Featured)
  /** Teaching style */
  teachingStyle?: 'socratic' | 'lecture' | 'interactive' | 'storytelling';
  /** Include formulas/equations */
  includeFormulas?: boolean;
  /** Include diagram descriptions */
  includeDiagramDescriptions?: boolean;
  /** Include real-world examples */
  includeRealWorldExamples?: boolean;
  /** Include practice problems */
  includePracticeProblems?: boolean;
  /** Include memory aids/mnemonics */
  includeMemoryAids?: boolean;
  /** Subject area for context */
  subjectArea?: 'science' | 'math' | 'history' | 'literature' | 'business' | 'technology' | 'general';
  
  // ===== CONTENT TO SCRIPT OPTIONS ===== ✅ NEW (Featured)
  /** Script type */
  scriptType?: 'youtube' | 'podcast' | 'presentation' | 'explainer' | 'tutorial';
  /** Script duration target (in minutes) */
  targetDuration?: number;
  /** Include timestamps */
  includeTimestamps?: boolean;
  /** Include B-roll suggestions */
  includeBRollSuggestions?: boolean;
  /** Include intro/outro */
  includeIntroOutro?: boolean;
  /** Tone of script */
  scriptTone?: 'professional' | 'casual' | 'educational' | 'entertaining';
  /** Include call-to-action */
  includeCallToAction?: boolean;
  /** Target platform */
  targetPlatform?: 'youtube' | 'spotify' | 'instagram' | 'tiktok' | 'linkedin';
  
  // ===== NOTES TO QUIZ TURBO OPTIONS ===== ✅ NEW (Featured)
  /** Types of questions to include */
  quizTypes?: ('mcq' | 'true_false' | 'fill_blank' | 'short_answer' | 'match' | 'case_study')[];
  /** Total questions across all types */
  totalQuestions?: number;
  /** Include case studies */
  includeCaseStudies?: boolean;
  /** Number of case studies */
  caseStudyCount?: number;
  /** Include matching questions */
  includeMatching?: boolean;
  /** Generate multiple difficulty levels */
  multiDifficulty?: boolean;
  /** Include section-wise breakdown */
  sectionWise?: boolean;
  
  // ===== REPORT BUILDER OPTIONS =====
  /** Report type */
  reportType?: 'summary' | 'analysis' | 'research' | 'executive' | 'technical';
  /** Include table of contents */
  includeTableOfContents?: boolean;
  /** Include executive summary */
  includeExecutiveSummary?: boolean;
  /** Include recommendations */
  includeRecommendations?: boolean;
  
  // ===== DATA/CHART OPTIONS =====
  /** Chart types to generate */
  chartTypes?: ('bar' | 'line' | 'pie' | 'area' | 'scatter')[];
  /** Include data insights */
  includeDataInsights?: boolean;
  /** Include trend analysis */
  includeTrendAnalysis?: boolean;
  
  // ===== LEGAL/CONTRACT OPTIONS =====
  /** Legal jurisdiction context */
  jurisdiction?: string;
  /** Risk level focus */
  riskFocus?: 'high' | 'medium' | 'all';
  /** Include clause analysis */
  includeClauseAnalysis?: boolean;
  
  // ===== AI DETECTION OPTIONS =====
  /** Detection sensitivity */
  detectionSensitivity?: 'low' | 'medium' | 'high';
  /** Include humanization suggestions */
  includeHumanizationSuggestions?: boolean;
  
  // ===== MULTI-DOC OPTIONS =====
  /** Comparison focus areas */
  comparisonFocus?: string[];
  /** Include similarity score */
  includeSimilarityScore?: boolean;
  
  // ===== CUSTOM =====
  /** Custom instructions for AI */
  customInstructions?: string;
  
  // ===== LANGUAGE =====
  /** Output language */
  outputLanguage?: string;
  
  // Index signature for additional properties
  [key: string]: unknown;
}

// ==========================================
// DOCUMENT OPERATION REQUEST/RESPONSE
// ==========================================

export interface DocumentOperationRequest {
  documentId: string;
  userId: string;
  operationType: OperationType;
  options?: OperationOptions;
}

export interface DocumentOperationResponse {
  success: boolean;
  operation: {
    id: string;
    operationType: OperationType;
    operationName: string;
    status: OperationStatus;
    result?: string;
    resultPreview?: string;
    structuredResult?: StructuredOperationResult;
    processingTime?: number;
    tokensUsed: number;
    cost: number;
    aiProvider?: string;
    aiModel?: string;
    fromCache: boolean;
  };
  usage: {
    operationsUsed: number;
    operationsLimit: number;
    tokensUsed: number;
    costThisMonth: number;
  };
}

// ==========================================
// AI ROUTING TYPES
// ==========================================

export interface AIRoutingDecision {
  provider: 'google' | 'openai' | 'anthropic';
  model: string;
  tier: 'gemini' | 'gpt' | 'haiku';
  estimatedCost: number;
  tokenCaps: {
    input: number;
    output: number;
  };
  reason: string;
}

export interface AIOperationResult {
  success: boolean;
  result?: string;
  structuredResult?: StructuredOperationResult;
  error?: string;
  tokens: TokenUsage;
  cost: number;
  processingTime: number;
  fromCache: boolean;
  cacheKey?: string;
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

// ==========================================
// STRUCTURED OUTPUT TYPES
// ✅ AUDIT FIX: Added types for ALL operations
// ==========================================

/**
 * Union type for all structured operation results
 */
export type StructuredOperationResult =
  | SummaryResult
  | BulletSummaryResult
  | KeywordsResult
  | FlashcardsResult
  | TestResult
  | QuizTurboResult
  | NotesResult
  | PresentationResult
  | DefinitionsResult
  | TeacherExplanationResult
  | ScriptResult
  | ReportResult
  | ComparisonResult
  | InsightsResult
  | LegalScanResult
  | AIDetectionResult
  | TranslationResult
  | CleanupResult
  | ChartDataResult
  | TopicBreakdownResult
  | QAResult;

// ----- Summary Results -----
export interface SummaryResult {
  type: 'summary';
  summary: string;
  keyTakeaways?: string[];
  wordCount: number;
}

export interface BulletSummaryResult {
  type: 'bullet_summary';
  bullets: BulletPoint[];
  mainTheme?: string;
}

export interface BulletPoint {
  id: number;
  text: string;
  importance?: 'high' | 'medium' | 'low';
  subPoints?: string[];
}

// ----- Keywords Results -----
export interface KeywordsResult {
  type: 'keywords';
  keywords: KeywordItem[];
  totalFound: number;
  categories?: KeywordCategory[];
}

export interface KeywordItem {
  keyword: string;
  frequency: number;
  importance: 'high' | 'medium' | 'low';
  context?: string;
}

export interface KeywordCategory {
  name: string;
  keywords: string[];
}

// ----- Flashcards Results -----
export interface FlashcardsResult {
  type: 'flashcards';
  cards: FlashcardItem[];
  totalCards: number;
  difficulty?: string;
}

export interface FlashcardItem {
  id: number;
  front: string;
  back: string;
  hint?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// ----- Test/Quiz Results -----
export interface TestResult {
  type: 'test';
  title: string;
  questions: QuestionItem[];
  totalQuestions: number;
  totalMarks: number;
  suggestedTime?: number;
  difficulty: string;
  answerKey?: AnswerKeyItem[];
}

export interface QuestionItem {
  id: number;
  type: 'mcq' | 'short' | 'long' | 'fill_blank' | 'true_false' | 'match';
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  marks?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
}

export interface AnswerKeyItem {
  questionId: number;
  correctAnswer: string;
  explanation: string;
}

// ----- Quiz Turbo Results (Featured) ✅ NEW -----
export interface QuizTurboResult {
  type: 'quiz_turbo';
  title: string;
  sections: QuizSection[];
  totalQuestions: number;
  totalMarks: number;
  suggestedTime: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  caseStudies?: CaseStudyItem[];
  matchingQuestions?: MatchingQuestion[];
}

export interface QuizSection {
  sectionName: string;
  sectionType: 'mcq' | 'true_false' | 'fill_blank' | 'short_answer';
  questions: QuestionItem[];
  marks: number;
}

export interface CaseStudyItem {
  id: number;
  title: string;
  scenario: string;
  questions: QuestionItem[];
  totalMarks: number;
}

export interface MatchingQuestion {
  id: number;
  instruction: string;
  columnA: string[];
  columnB: string[];
  correctMatches: Record<string, string>;
  marks: number;
}

// ----- Notes Results -----
export interface NotesResult {
  type: 'notes';
  title: string;
  sections: NoteSection[];
  keyPoints?: string[];
  examples?: string[];
  totalSections: number;
}

export interface NoteSection {
  id: number;
  heading: string;
  content: string;
  subSections?: NoteSubSection[];
  examples?: string[];
  diagrams?: DiagramDescription[];
}

export interface NoteSubSection {
  heading: string;
  content: string;
}

export interface DiagramDescription {
  title: string;
  description: string;
  suggestedType: 'flowchart' | 'mindmap' | 'diagram' | 'chart';
}

// ----- Presentation Results (World Class PPT) ✅ ENHANCED -----
export interface PresentationResult {
  type: 'presentation';
  title: string;
  subtitle?: string;
  slides: PresentationSlide[];
  totalSlides: number;
  theme: PresentationTheme;
  metadata: PresentationMetadata;
}

export interface PresentationSlide {
  id: number;
  slideType: SlideType;
  title: string;
  subtitle?: string;
  content: SlideContent;
  speakerNotes?: string;
  layout: SlideLayout;
  animations?: SlideAnimation[];
  transition?: SlideTransition;
}

export type SlideType = 
  | 'title'
  | 'section_header'
  | 'content'
  | 'two_column'
  | 'comparison'
  | 'timeline'
  | 'process'
  | 'chart'
  | 'quote'
  | 'image_focus'
  | 'bullet_points'
  | 'numbered_list'
  | 'infographic'
  | 'summary'
  | 'call_to_action'
  | 'thank_you';

export interface SlideContent {
  // Text content
  mainText?: string;
  bulletPoints?: SlideBulletPoint[];
  numberedList?: string[];
  
  // Visual content
  chart?: SlideChart;
  infographic?: SlideInfographic;
  timeline?: TimelineItem[];
  processSteps?: ProcessStep[];
  comparison?: ComparisonColumns;
  
  // Media suggestions
  imageSuggestion?: ImageSuggestion;
  iconSuggestions?: IconSuggestion[];
  
  // Quote
  quote?: {
    text: string;
    author?: string;
    source?: string;
  };
  
  // Statistics/Numbers
  statistics?: StatisticItem[];
}

export interface SlideBulletPoint {
  text: string;
  subPoints?: string[];
  icon?: string;
  emphasis?: boolean;
}

export interface SlideChart {
  chartType: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar';
  title: string;
  data: ChartDataPoint[];
  labels?: string[];
  colors?: string[];
  showLegend?: boolean;
  showValues?: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface SlideInfographic {
  type: 'stats' | 'process' | 'comparison' | 'hierarchy' | 'cycle';
  items: InfographicItem[];
}

export interface InfographicItem {
  icon?: string;
  value?: string | number;
  label: string;
  description?: string;
  color?: string;
}

export interface TimelineItem {
  id: number;
  date?: string;
  title: string;
  description: string;
  icon?: string;
}

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon?: string;
}

export interface ComparisonColumns {
  headers: string[];
  rows: ComparisonRow[];
}

export interface ComparisonRow {
  feature: string;
  values: (string | boolean)[];
}

export interface ImageSuggestion {
  description: string;
  keywords: string[];
  style: 'photo' | 'illustration' | 'icon' | 'abstract';
  placement: 'background' | 'side' | 'center';
}

export interface IconSuggestion {
  name: string;
  purpose: string;
  suggestedIcon: string; // Lucide/Heroicons name
}

export interface StatisticItem {
  value: string | number;
  label: string;
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface SlideLayout {
  type: 'full' | 'split' | 'grid' | 'focus';
  contentAlignment: 'left' | 'center' | 'right';
  hasImage: boolean;
  imagePosition?: 'left' | 'right' | 'background' | 'top' | 'bottom';
}

export interface SlideAnimation {
  element: string;
  type: 'fade' | 'slide' | 'zoom' | 'bounce';
  delay?: number;
  duration?: number;
}

export interface SlideTransition {
  type: 'fade' | 'slide' | 'push' | 'wipe' | 'none';
  duration?: number;
}

export interface PresentationTheme {
  name: string;
  style: 'professional' | 'academic' | 'creative' | 'minimal' | 'corporate';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface PresentationMetadata {
  author?: string;
  createdAt: Date;
  estimatedDuration: number; // in minutes
  targetAudience?: string;
  topic: string;
  keywords: string[];
}

// ----- Definitions Results ✅ NEW -----
export interface DefinitionsResult {
  type: 'definitions';
  definitions: DefinitionItem[];
  totalFound: number;
  categories?: string[];
}

export interface DefinitionItem {
  id: number;
  term: string;
  definition: string;
  example?: string;
  relatedTerms?: string[];
  category?: string;
  importance?: 'high' | 'medium' | 'low';
  pageReference?: number;
}

// ----- Teacher Explanation Results (Featured) ✅ NEW -----
export interface TeacherExplanationResult {
  type: 'teacher_explanation';
  topic: string;
  introduction: string;
  sections: TeacherSection[];
  practiceProblems?: PracticeProblem[];
  memoryAids?: MemoryAid[];
  summary: string;
  furtherReading?: string[];
}

export interface TeacherSection {
  id: number;
  heading: string;
  explanation: string;
  realWorldExample?: string;
  formula?: FormulaItem;
  diagram?: DiagramDescription;
  commonMistakes?: string[];
  tips?: string[];
}

export interface FormulaItem {
  expression: string; // LaTeX or plain text
  explanation: string;
  variables?: FormulaVariable[];
}

export interface FormulaVariable {
  symbol: string;
  meaning: string;
  unit?: string;
}

export interface PracticeProblem {
  id: number;
  question: string;
  hints?: string[];
  solution: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MemoryAid {
  type: 'mnemonic' | 'acronym' | 'rhyme' | 'visualization';
  content: string;
  helps_remember: string;
}

// ----- Script Results (Featured) ✅ NEW -----
export interface ScriptResult {
  type: 'script';
  scriptType: 'youtube' | 'podcast' | 'presentation' | 'explainer' | 'tutorial';
  title: string;
  description?: string;
  totalDuration: number; // in seconds
  sections: ScriptSection[];
  intro?: ScriptIntro;
  outro?: ScriptOutro;
  callToAction?: string;
  metadata: ScriptMetadata;
}

export interface ScriptSection {
  id: number;
  timestamp?: string; // "00:00" format
  duration: number; // in seconds
  heading: string;
  narration: string;
  visualSuggestions?: string[];
  bRollSuggestions?: string[];
  onScreenText?: string[];
  transition?: string;
}

export interface ScriptIntro {
  hook: string;
  introduction: string;
  duration: number;
  visualSuggestions?: string[];
}

export interface ScriptOutro {
  summary: string;
  callToAction: string;
  duration: number;
  visualSuggestions?: string[];
}

export interface ScriptMetadata {
  targetPlatform: string;
  tone: string;
  targetAudience?: string;
  keywords?: string[];
  suggestedThumbnail?: string;
  suggestedTitle?: string;
}

// ----- Report Results -----
export interface ReportResult {
  type: 'report';
  title: string;
  reportType: string;
  tableOfContents?: TableOfContentsItem[];
  executiveSummary?: string;
  sections: ReportSection[];
  recommendations?: string[];
  conclusions?: string[];
  appendices?: Appendix[];
}

export interface TableOfContentsItem {
  id: number;
  title: string;
  page?: number;
  subItems?: TableOfContentsItem[];
}

export interface ReportSection {
  id: number;
  heading: string;
  content: string;
  subSections?: ReportSubSection[];
  charts?: SlideChart[];
  tables?: ReportTable[];
}

export interface ReportSubSection {
  heading: string;
  content: string;
}

export interface ReportTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface Appendix {
  id: number;
  title: string;
  content: string;
}

// ----- Comparison Results -----
export interface ComparisonResult {
  type: 'comparison';
  documents: ComparisonDocument[];
  similarities: string[];
  differences: string[];
  overallSimilarityScore?: number;
  detailedComparison?: ComparisonSection[];
}

export interface ComparisonDocument {
  id: string;
  name: string;
  summary: string;
}

export interface ComparisonSection {
  topic: string;
  documentStances: DocumentStance[];
  verdict?: string;
}

export interface DocumentStance {
  documentId: string;
  stance: string;
}

// ----- Insights Results -----
export interface InsightsResult {
  type: 'insights';
  keyInsights: InsightItem[];
  trends?: TrendItem[];
  recommendations?: string[];
  dataHighlights?: DataHighlight[];
}

export interface InsightItem {
  id: number;
  insight: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  evidence?: string;
}

export interface TrendItem {
  id: number;
  trend: string;
  direction: 'up' | 'down' | 'stable';
  impact: string;
}

export interface DataHighlight {
  metric: string;
  value: string | number;
  context: string;
}

// ----- Legal Scan Results -----
export interface LegalScanResult {
  type: 'legal_scan';
  documentType: string;
  riskLevel: 'low' | 'medium' | 'high';
  clauses: ClauseAnalysis[];
  redFlags?: string[];
  recommendations?: string[];
  summary: string;
}

export interface ClauseAnalysis {
  id: number;
  clauseTitle: string;
  clauseText: string;
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high';
  suggestedChanges?: string;
}

// ----- AI Detection Results -----
export interface AIDetectionResult {
  type: 'ai_detection';
  overallScore: number; // 0-100, higher = more likely AI
  confidence: 'low' | 'medium' | 'high';
  sections: AIDetectionSection[];
  humanizationSuggestions?: string[];
  summary: string;
}

export interface AIDetectionSection {
  text: string;
  score: number;
  indicators: string[];
}

// ----- Translation Results -----
export interface TranslationResult {
  type: 'translation';
  originalLanguage: string;
  targetLanguage: string;
  translatedText: string;
  wordCount: number;
  preservedFormatting: boolean;
}

// ----- Cleanup Results -----
export interface CleanupResult {
  type: 'cleanup';
  originalText: string;
  cleanedText: string;
  changesCount: number;
  changesSummary: string[];
}

// ----- Chart Data Results -----
export interface ChartDataResult {
  type: 'chart_data';
  charts: SlideChart[];
  insights: string[];
  dataTable?: ReportTable;
}

// ----- Topic Breakdown Results -----
export interface TopicBreakdownResult {
  type: 'topic_breakdown';
  mainTopic: string;
  topics: TopicItem[];
  relationships?: TopicRelationship[];
}

export interface TopicItem {
  id: number;
  name: string;
  description: string;
  subTopics?: TopicItem[];
  importance: 'high' | 'medium' | 'low';
}

export interface TopicRelationship {
  from: string;
  to: string;
  relationship: string;
}

// ----- Q&A Results -----
export interface QAResult {
  type: 'qa';
  question: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  citations?: Citation[];
  relatedQuestions?: string[];
}

export interface Citation {
  text: string;
  pageNumber?: number;
  section?: string;
}

// ==========================================
// USAGE & LIMITS TYPES
// ==========================================

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  current: {
    documents: number;
    operations: number;
    storage: number;
    operationsThisHour: number;
    operationsToday: number;
  };
  limits: {
    documents: number;
    operations: number;
    storage: number;
    operationsPerHour: number;
    operationsPerDay: number;
  };
  remaining: {
    documents: number;
    operations: number;
    storage: number;
  };
}

export interface LimitsEnforcementResult {
  canProceed: boolean;
  errorCode?: string;
  errorMessage?: string;
  upgradeRequired?: boolean;
  suggestedPlan?: string;
}

// ==========================================
// DOCUMENT LIST & DETAIL TYPES
// ==========================================

export interface DocumentListQuery {
  userId: string;
  page?: number;
  limit?: number;
  sortBy?: 'uploadedAt' | 'filename' | 'fileSize' | 'lastOperationAt';
  sortOrder?: 'asc' | 'desc';
  status?: string;
  search?: string;
  fileType?: string;
  folder?: string;
}

export interface DocumentListResponse {
  documents: DocumentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface DocumentListItem {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  status: string;
  pageCount?: number;
  wordCount?: number;
  uploadedAt: Date;
  operationCount: number;
  lastOperationAt?: Date;
  folder?: string;
  tags?: string[];
}

export interface DocumentDetail extends DocumentListItem {
  storageUrl: string;
  mimeType: string;
  textContent?: string;
  textPreview?: string;
  metadata?: DocumentMetadata;
  operations: OperationHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentMetadata {
  pageCount: number;
  wordCount: number;
  characterCount: number;
  language?: string;
  hasImages: boolean;
  hasTables: boolean;
  hasFormulas?: boolean;
  readingTime?: number; // in minutes
}

export interface OperationHistoryItem {
  id: string;
  operationType: OperationType;
  operationName: string;
  category: string;
  status: OperationStatus;
  resultPreview?: string;
  tokensUsed: number;
  cost: number;
  processingTime?: number;
  createdAt: Date;
  options?: Partial<OperationOptions>;
}

// ==========================================
// USAGE STATS RESPONSE
// ==========================================

export interface UsageStatsResponse {
  period: 'day' | 'week' | 'month';
  isPaidUser?: boolean;
  addonActive?: boolean;
  usage: {
    documents: {
      used?: number;
      usedThisMonth?: number;
      limit?: number;
      limitPerMonth?: number;
      percentage: number;
    };
    operations: {
      used?: number;
      usedThisMonth?: number;
      limit?: number;
      limitPerMonth?: number;
      usedToday?: number;
      limitPerDay?: number;
      percentage: number;
    };
    storage: {
      used: number;
      limit: number;
      percentage: number;
      formattedUsed?: string;
      formattedLimit?: string;
    };
    cost: {
      thisMonth: number;
      average: number;
      projected?: number;
    };
  };
  topOperations?: Array<{
    type?: OperationType;
    operationType?: OperationType;
    name?: string;
    count: number;
    totalCost: number;
  }>;
  recentDocuments: Array<{
    id: string;
    filename: string;
    uploadedAt: Date;
    operationCount?: number;
  }>;
  recentOperations?: Array<{
    id: string;
    operationType: OperationType;
    documentName: string;
    status: OperationStatus;
    createdAt: Date;
  }>;
}

// ==========================================
// TEXT EXTRACTION TYPES
// ==========================================

export interface TextExtractionResult {
  success: boolean;
  text: string;
  metadata: DocumentMetadata;
  extractionTime: number;
  error?: string;
  sections?: ExtractedSection[];
}

export interface ExtractedSection {
  id: number;
  title?: string;
  content: string;
  pageNumber?: number;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'image_caption';
}

// ==========================================
// BATCH OPERATION TYPES
// ==========================================

export interface BatchOperationRequest {
  documentIds: string[];
  userId: string;
  operationType: OperationType;
  options?: OperationOptions;
}

export interface BatchOperationResponse {
  success: boolean;
  batchId: string;
  totalDocuments: number;
  results: BatchOperationResult[];
  summary: {
    successful: number;
    failed: number;
    totalCost: number;
    totalTokens: number;
    totalTime: number;
  };
}

export interface BatchOperationResult {
  documentId: string;
  documentName: string;
  success: boolean;
  operationId?: string;
  result?: string;
  error?: string;
  cost: number;
  tokens: number;
}

// ==========================================
// ERROR HANDLING
// ==========================================

export class DocumentIntelligenceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DocumentIntelligenceError';
  }
}

export const ERROR_CODES = {
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  FILE_CORRUPTED: 'FILE_CORRUPTED',
  FILE_EMPTY: 'FILE_EMPTY',
  INVALID_REQUEST: 'INVALID_REQUEST',
  
  // Limit errors
  DOCUMENT_LIMIT_REACHED: 'DOCUMENT_LIMIT_REACHED',
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',
  OPERATION_LIMIT_REACHED: 'OPERATION_LIMIT_REACHED',
  STORAGE_LIMIT_REACHED: 'STORAGE_LIMIT_REACHED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  HOURLY_LIMIT_REACHED: 'HOURLY_LIMIT_REACHED',
  
  // Access errors
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  ADDON_REQUIRED: 'ADDON_REQUIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Processing errors
  EXTRACTION_FAILED: 'EXTRACTION_FAILED',
  OPERATION_FAILED: 'OPERATION_FAILED',
  AI_ERROR: 'AI_ERROR',
  TIMEOUT: 'TIMEOUT',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  
  // Not found
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  OPERATION_NOT_FOUND: 'OPERATION_NOT_FOUND',
  
  // Validation errors
  INVALID_OPERATION_TYPE: 'INVALID_OPERATION_TYPE',
  INVALID_OPTIONS: 'INVALID_OPTIONS',
  INVALID_DOCUMENT_ID: 'INVALID_DOCUMENT_ID',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    processingTime?: number;
    cached?: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    suggestion?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==========================================
// ADDON SUBSCRIPTION TYPE
// ✅ AUDIT FIX: Complete interface
// ==========================================

export interface DocumentIntelligenceAddon {
  isActive: boolean;
  activatedAt?: Date;
  expiresAt?: Date;
  autoRenew?: boolean;
  price: {
    INR: number;
    USD: number;
  };
  limits: {
    documentsPerMonth: number;
    documentsPerDay: number;
    operationsPerMonth: number; // ✅ ADDED
    operationsPerDay: number;
    operationsPerHour: number; // ✅ ADDED
    maxFileSize: number;
    maxFileSizeMB: number; // ✅ ADDED
    maxPages: number;
    maxWordCount: number; // ✅ ADDED
    storage: number;
    storageMB: number; // ✅ ADDED
  };
  features: {
    allowedOperations: string[]; // ✅ ADDED - ALL_OPERATIONS for paid
    priorityQueue: boolean; // ✅ ADDED
    smartAIRouting: boolean; // ✅ ADDED
    batchProcessing: boolean; // ✅ ADDED
    advancedCaching: boolean; // ✅ ADDED
  };
}

// ==========================================
// CACHE TYPES
// ==========================================

export interface CacheEntry {
  key: string;
  result: string;
  structuredResult?: StructuredOperationResult;
  tokens: TokenUsage;
  cost: number;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  hitRate: number;
  savedCost: number;
  savedTokens: number;
}

// ==========================================
// WEBHOOK TYPES (Future Use)
// ==========================================

export interface WebhookEvent {
  event: 'operation.completed' | 'operation.failed' | 'document.uploaded' | 'limit.reached';
  timestamp: Date;
  userId: string;
  data: unknown;
}

// ==========================================
// EXPORT ALL TYPES
// ==========================================

export type {
  OperationType,
  OperationStatus,
};

// ==========================================
// AUDIT SUMMARY
// ==========================================
/**
 * AUDIT COMPLETED: December 10, 2025
 * 
 * ✅ FIXES APPLIED:
 * 
 * 1. OPERATION OPTIONS COMPLETED:
 *    - Added EXPLAIN_SIMPLE options (targetAudience, useAnalogies, etc.)
 *    - Added EXTRACT_DEFINITIONS options (maxDefinitions, sortDefinitions, etc.)
 *    - Added EXPLAIN_AS_TEACHER options (teachingStyle, includeFormulas, etc.)
 *    - Added CONTENT_TO_SCRIPT options (scriptType, targetDuration, etc.)
 *    - Added NOTES_TO_QUIZ_TURBO options (quizTypes, includeCaseStudies, etc.)
 *    - Added PRESENTATION options for world-class PPT (templateStyle, brandColors, etc.)
 * 
 * 2. STRUCTURED OUTPUT TYPES ADDED:
 *    - QuizTurboResult with sections, case studies, matching questions
 *    - DefinitionsResult with related terms, categories
 *    - TeacherExplanationResult with formulas, practice problems, memory aids
 *    - ScriptResult with timestamps, B-roll suggestions, metadata
 *    - PresentationResult with COMPLETE slide types, charts, infographics
 * 
 * 3. PRESENTATION TYPES ENHANCED:
 *    - 16 slide types (title, comparison, timeline, process, chart, etc.)
 *    - SlideChart with multiple chart types
 *    - SlideInfographic with visual items
 *    - TimelineItem, ProcessStep, ComparisonColumns
 *    - ImageSuggestion, IconSuggestion
 *    - PresentationTheme with colors, fonts
 *    - PresentationMetadata
 * 
 * 4. DOCUMENT INTELLIGENCE ADDON COMPLETED:
 *    - Added operationsPerMonth, operationsPerHour
 *    - Added maxFileSizeMB, maxWordCount, storageMB
 *    - Added features object with allowedOperations, priorityQueue, etc.
 * 
 * 5. NEW TYPES ADDED:
 *    - BatchOperationRequest/Response for batch processing
 *    - CacheEntry, CacheStats for caching
 *    - WebhookEvent for future webhooks
 *    - ExtractedSection for text extraction
 * 
 * 6. ERROR CODES EXPANDED:
 *    - Added FILE_EMPTY, HOURLY_LIMIT_REACHED, FORBIDDEN
 *    - Added INVALID_OPERATION_TYPE, INVALID_OPTIONS, INVALID_DOCUMENT_ID
 * 
 * TOTAL TYPES: 100+ interfaces and types
 * READY FOR: World-class PPT maker and all 33 operations
 */