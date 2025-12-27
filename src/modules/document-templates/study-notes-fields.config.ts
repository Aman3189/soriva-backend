// ═══════════════════════════════════════════════════════════════════════════
// SORIVA - STUDY NOTES FIELDS CONFIGURATION - PART 1/3
// Supporting Interfaces + Enums & Types
// Supports: Balwadi → Primary → High School → Competitive Exams → College
// "BUFFET STYLE" - Sab kuch available, student jo chahiye wo le!
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORTING INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Key Point / Important Point
 */
export interface KeyPoint {
  point: string;
  explanation?: string;
  importance?: ImportanceLevel;
  examRelevance?: string;
}

/**
 * Definition with term and meaning
 */
export interface Definition {
  term: string;
  meaning: string;
  example?: string;
  hindiMeaning?: string;
  synonyms?: string[];
  antonyms?: string[];
}

/**
 * Formula (Maths/Physics/Chemistry)
 */
export interface Formula {
  name: string;
  formula: string;
  description?: string;
  variables?: VariableDefinition[];
  derivation?: string;
  conditions?: string;
  applications?: string[];
  examples?: string[];
  relatedFormulas?: string[];
}

/**
 * Variable definition for formulas
 */
export interface VariableDefinition {
  symbol: string;
  name: string;
  unit?: string;
  description?: string;
}

/**
 * Theorem / Law / Principle
 */
export interface Theorem {
  name: string;
  statement: string;
  proof?: string;
  conditions?: string[];
  applications?: string[];
  examples?: string[];
  discoveredBy?: string;
  year?: string;
}

/**
 * Chemical Reaction
 */
export interface ChemicalReaction {
  name?: string;
  reactants: string;
  products: string;
  equation: string;
  balancedEquation?: string;
  reactionType?: ReactionType;
  conditions?: string;
  catalyst?: string;
  observations?: string[];
  applications?: string[];
}

/**
 * Diagram / Figure description
 */
export interface Diagram {
  title: string;
  description: string;
  labels?: string[];
  imageUrl?: string;
  type?: DiagramType;
}

/**
 * Example / Solved Problem
 */
export interface Example {
  title?: string;
  question: string;
  solution: string;
  steps?: string[];
  answer?: string;
  difficulty?: DifficultyLevel;
  marks?: number;
  timeEstimate?: string;
}

/**
 * Timeline Event (History)
 */
export interface TimelineEvent {
  year: string;
  event: string;
  description?: string;
  significance?: string;
  relatedEvents?: string[];
  personalities?: string[];
}

/**
 * Historical Figure / Personality
 */
export interface HistoricalFigure {
  name: string;
  lifespan?: string;
  title?: string;
  contributions?: string[];
  famousFor?: string;
  quotes?: string[];
}

/**
 * Geographical Data
 */
export interface GeographicalData {
  name: string;
  type: GeoDataType;
  location?: string;
  statistics?: Record<string, string>;
  features?: string[];
  importance?: string;
}

/**
 * Biological Process / Cycle
 */
export interface BiologicalProcess {
  name: string;
  type?: string;
  steps: string[];
  location?: string;
  inputs?: string[];
  outputs?: string[];
  diagram?: string;
  significance?: string;
}

/**
 * Taxonomy / Classification
 */
export interface TaxonomyItem {
  name: string;
  scientificName?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  characteristics?: string[];
  examples?: string[];
}

/**
 * Grammar Rule
 */
export interface GrammarRule {
  rule: string;
  explanation: string;
  examples: string[];
  exceptions?: string[];
  commonMistakes?: string[];
}

/**
 * Vocabulary Word
 */
export interface VocabularyWord {
  word: string;
  partOfSpeech?: string;
  meaning: string;
  hindiMeaning?: string;
  pronunciation?: string;
  usage: string;
  synonyms?: string[];
  antonyms?: string[];
}

/**
 * Mnemonic / Memory Aid
 */
export interface Mnemonic {
  topic: string;
  mnemonic: string;
  explanation: string;
  items?: string[];
}

/**
 * Question (Practice/Previous Year)
 */
export interface Question {
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  marks?: number;
  difficulty?: DifficultyLevel;
  year?: string;
  examName?: string;
  topic?: string;
}

/**
 * Assignment / Exercise
 */
export interface Assignment {
  title: string;
  description?: string;
  questions: AssignmentQuestion[];
  totalMarks?: number;
  duration?: string;
  dueDate?: string;
  instructions?: string[];
}

/**
 * Assignment Question
 */
export interface AssignmentQuestion {
  questionNumber: number;
  question: string;
  type: QuestionType;
  options?: string[];
  marks?: number;
  hint?: string;
  answerSpace?: 'small' | 'medium' | 'large';
}

/**
 * Quick Revision Point
 */
export interface RevisionPoint {
  point: string;
  category?: string;
  examTip?: string;
}

/**
 * Comparison Table Row
 */
export interface ComparisonRow {
  aspect: string;
  item1: string;
  item2: string;
  item3?: string;
  item4?: string;
}

/**
 * Reference / Source
 */
export interface Reference {
  title: string;
  author?: string;
  type: ReferenceType;
  url?: string;
  page?: string;
  chapter?: string;
}

/**
 * Content Section for structured notes
 */
export interface ContentSection {
  heading: string;
  content: string;
  subSections?: ContentSection[];
  keyPoints?: string[];
  examples?: string[];
}

/**
 * Table Data
 */
export interface TableData {
  title?: string;
  headers: string[];
  rows: string[][];
  caption?: string;
}

/**
 * Comparison Table
 */
export interface ComparisonTable {
  title: string;
  items: string[];
  aspects: ComparisonRow[];
}

/**
 * Derivation (Step by step)
 */
export interface Derivation {
  name: string;
  startingPoint: string;
  steps: string[];
  result: string;
  conditions?: string;
}

/**
 * Physical/Mathematical Constant
 */
export interface Constant {
  name: string;
  symbol: string;
  value: string;
  unit?: string;
  description?: string;
}

/**
 * Unit Information
 */
export interface UnitInfo {
  quantity: string;
  siUnit: string;
  symbol: string;
  otherUnits?: string[];
  conversions?: string[];
}

/**
 * Lab Experiment
 */
export interface Experiment {
  title: string;
  aim: string;
  apparatus?: string[];
  theory?: string;
  procedure: string[];
  observations?: string;
  calculations?: string;
  result: string;
  precautions?: string[];
  diagram?: string;
}

/**
 * Periodic Table Element
 */
export interface PeriodicElement {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: string;
  group?: number;
  period?: number;
  category?: string;
  electronConfig?: string;
  properties?: string[];
}

/**
 * Property Table (Chemistry)
 */
export interface PropertyTable {
  title: string;
  properties: Record<string, string>;
}

/**
 * Lab Procedure
 */
export interface LabProcedure {
  title: string;
  objective: string;
  materials: string[];
  procedure: string[];
  safetyPrecautions?: string[];
  expectedResults?: string;
}

/**
 * Disease Information (Biology)
 */
export interface DiseaseInfo {
  name: string;
  causativeAgent?: string;
  symptoms: string[];
  transmission?: string;
  prevention?: string[];
  treatment?: string;
}

/**
 * Mathematical Proof
 */
export interface Proof {
  theorem: string;
  given: string;
  toProve: string;
  construction?: string;
  proof: string[];
  conclusion: string;
  diagram?: string;
}

/**
 * Geometry Construction
 */
export interface Construction {
  title: string;
  given: string;
  required: string;
  steps: string[];
  diagram?: string;
}

/**
 * Graph Information
 */
export interface GraphInfo {
  title: string;
  xAxis: string;
  yAxis: string;
  equation?: string;
  description?: string;
  keyPoints?: string[];
}

/**
 * Shortcut / Trick
 */
export interface Shortcut {
  topic: string;
  shortcut: string;
  explanation?: string;
  example?: string;
  timeSaved?: string;
}

/**
 * Historical Event
 */
export interface HistoricalEvent {
  name: string;
  date: string;
  place?: string;
  description: string;
  causes?: string[];
  effects?: string[];
  keyFigures?: string[];
  significance?: string;
}

/**
 * Map Point (Geography)
 */
export interface MapPoint {
  name: string;
  type: string;
  coordinates?: string;
  description?: string;
  significance?: string;
}

/**
 * Statistical Data
 */
export interface StatisticalData {
  title: string;
  data: Record<string, string | number>;
  source?: string;
  year?: string;
}

/**
 * Climate Information
 */
export interface ClimateInfo {
  region: string;
  climateType: string;
  temperature?: string;
  rainfall?: string;
  seasons?: string[];
  characteristics?: string[];
}

/**
 * Constitutional Amendment
 */
export interface Amendment {
  number: string;
  year: string;
  description: string;
  significance?: string;
}

/**
 * Constitutional Article
 */
export interface ConstitutionalArticle {
  articleNumber: string;
  title: string;
  description: string;
  part?: string;
  relatedArticles?: string[];
}

/**
 * Economic Concept
 */
export interface EconomicConcept {
  term: string;
  definition: string;
  formula?: string;
  example?: string;
  graphDescription?: string;
}

/**
 * Policy Information
 */
export interface PolicyInfo {
  name: string;
  year?: string;
  objective: string;
  features?: string[];
  impact?: string;
}

/**
 * Idiom
 */
export interface Idiom {
  idiom: string;
  meaning: string;
  example: string;
  hindiMeaning?: string;
}

/**
 * Phrase
 */
export interface Phrase {
  phrase: string;
  meaning: string;
  usage: string;
}

/**
 * Literature Note
 */
export interface LiteratureNote {
  title: string;
  author?: string;
  type: 'poem' | 'prose' | 'drama' | 'novel' | 'short-story';
  summary?: string;
  themes?: string[];
  characters?: Character[];
  literaryDevices?: string[];
  importantQuotes?: string[];
  analysis?: string;
}

/**
 * Character (Literature)
 */
export interface Character {
  name: string;
  role: string;
  description?: string;
  traits?: string[];
}

/**
 * Writing Format
 */
export interface WritingFormat {
  type: string;
  format: string;
  tips?: string[];
  example?: string;
}

/**
 * Analogy
 */
export interface Analogy {
  concept: string;
  analogy: string;
  explanation?: string;
}

/**
 * Image Information
 */
export interface ImageInfo {
  title: string;
  url?: string;
  description: string;
  labels?: string[];
}

/**
 * Video Reference
 */
export interface VideoReference {
  title: string;
  url: string;
  duration?: string;
  description?: string;
}

/**
 * Exercise Set
 */
export interface Exercise {
  title?: string;
  instructions?: string;
  questions: Question[];
  totalMarks?: number;
}

/**
 * Numerical Problem (Physics/Maths)
 */
export interface NumericalProblem {
  question: string;
  given: string[];
  toFind: string;
  formula?: string;
  solution: string[];
  answer: string;
  unit?: string;
  difficulty?: DifficultyLevel;
}

/**
 * Project Assignment
 */
export interface ProjectAssignment {
  title: string;
  description: string;
  objectives?: string[];
  guidelines?: string[];
  deliverables?: string[];
  deadline?: string;
  marks?: number;
  rubric?: Record<string, number>;
}

/**
 * Worksheet
 */
export interface Worksheet {
  title: string;
  instructions?: string;
  sections: WorksheetSection[];
  totalMarks?: number;
}

/**
 * Worksheet Section
 */
export interface WorksheetSection {
  sectionTitle: string;
  sectionType: QuestionType;
  instructions?: string;
  questions: AssignmentQuestion[];
  marks?: number;
}

/**
 * Marking Information
 */
export interface MarkingInfo {
  questionType: string;
  marks: number;
  expectedLength?: string;
  tips?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS & TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type StudyNotesStyle =
  | 'modern'
  | 'classic'
  | 'colorful'
  | 'minimal'
  | 'exam-focused'
  | 'visual'
  | 'custom';

export type EducationLevel =
  | 'nursery'           // Balwadi/Nursery (Age 3-5)
  | 'primary'           // Class 1-5 (Age 6-10)
  | 'middle'            // Class 6-8 (Age 11-13)
  | 'secondary'         // Class 9-10 (Age 14-15)
  | 'higher-secondary'  // Class 11-12 (Age 16-17)
  | 'undergraduate'     // College
  | 'postgraduate'      // Masters
  | 'competitive'       // Competitive Exams
  | 'professional';     // Professional Certifications

export type SubjectCategory =
  | 'science'
  | 'mathematics'
  | 'social-science'
  | 'languages'
  | 'commerce'
  | 'arts'
  | 'computer-science'
  | 'general-knowledge'
  | 'competitive-specific'
  | 'other';

export type ScienceSubject =
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'environmental-science'
  | 'general-science';

export type MathSubject =
  | 'arithmetic'
  | 'algebra'
  | 'geometry'
  | 'trigonometry'
  | 'calculus'
  | 'statistics'
  | 'probability'
  | 'number-theory'
  | 'discrete-math'
  | 'linear-algebra';

export type SocialScienceSubject =
  | 'history'
  | 'geography'
  | 'civics'
  | 'economics'
  | 'political-science'
  | 'sociology'
  | 'psychology';

export type LanguageSubject =
  | 'english'
  | 'hindi'
  | 'sanskrit'
  | 'regional-language'
  | 'foreign-language';

export type CompetitiveExam =
  | 'jee-main'
  | 'jee-advanced'
  | 'neet'
  | 'upsc-cse'
  | 'upsc-prelims'
  | 'ssc-cgl'
  | 'ssc-chsl'
  | 'banking-ibps'
  | 'banking-sbi'
  | 'cat'
  | 'gate'
  | 'ugc-net'
  | 'clat'
  | 'nda'
  | 'cds'
  | 'state-psc'
  | 'olympiad'
  | 'ntse'
  | 'kvpy'
  | 'other';

export type Board =
  | 'cbse'
  | 'icse'
  | 'state-board'
  | 'ib'
  | 'cambridge'
  | 'other';

export type DifficultyLevel =
  | 'beginner'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'advanced'
  | 'expert';

export type ImportanceLevel =
  | 'critical'      // Must know - 100% exam mein aata hai
  | 'important'     // High weightage
  | 'moderate'      // Sometimes asked
  | 'optional'      // Good to know
  | 'reference';    // For deeper understanding

export type QuestionType =
  | 'mcq'
  | 'true-false'
  | 'fill-blanks'
  | 'match-following'
  | 'short-answer'
  | 'long-answer'
  | 'numerical'
  | 'assertion-reason'
  | 'case-based'
  | 'diagram-based'
  | 'hots';  // Higher Order Thinking Skills

export type DiagramType =
  | 'flowchart'
  | 'circuit'
  | 'biological'
  | 'geographical-map'
  | 'graph'
  | 'chart'
  | 'structure'
  | 'process'
  | 'comparison'
  | 'timeline'
  | 'mindmap'
  | 'other';

export type ReactionType =
  | 'combination'
  | 'decomposition'
  | 'displacement'
  | 'double-displacement'
  | 'redox'
  | 'acid-base'
  | 'precipitation'
  | 'combustion'
  | 'organic'
  | 'other';

export type GeoDataType =
  | 'country'
  | 'state'
  | 'city'
  | 'river'
  | 'mountain'
  | 'ocean'
  | 'continent'
  | 'climate-zone'
  | 'natural-resource'
  | 'landmark'
  | 'other';

export type ReferenceType =
  | 'textbook'
  | 'ncert'
  | 'reference-book'
  | 'website'
  | 'video'
  | 'research-paper'
  | 'notes'
  | 'other';

export type NotesPurpose =
  | 'class-notes'
  | 'revision'
  | 'exam-prep'
  | 'quick-reference'
  | 'detailed-study'
  | 'assignment-help'
  | 'project-research'
  | 'self-study';

export type FieldCategory =
  | 'basic'
  | 'subject'
  | 'content'
  | 'formulas'
  | 'science-specific'
  | 'humanities-specific'
  | 'language-specific'
  | 'learning-aids'
  | 'practice'
  | 'assignments'
  | 'exam-prep'
  | 'organization'
  | 'references'
  | 'settings';

export type FieldLevel =
  | 'nursery'
  | 'primary'
  | 'middle'
  | 'secondary'
  | 'higher-secondary'
  | 'undergraduate'
  | 'postgraduate'      
  | 'competitive'
  | 'all';

// ═══════════════════════════════════════════════════════════════════════════
// END OF PART 1
// Continue to Part 2 for: Main StudyNotesData Interface
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// SORIVA - STUDY NOTES FIELDS CONFIGURATION - PART 2/3
// Main StudyNotesData Interface + Field Definition Interface
// Supports: Balwadi → Primary → High School → Competitive Exams → College
// "BUFFET STYLE" - Sab kuch available, student jo chahiye wo le!
// ═══════════════════════════════════════════════════════════════════════════

// NOTE: Import all types and interfaces from Part 1
// import { KeyPoint, Definition, Formula, ... } from './study-notes-fields.config.part1';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN STUDY NOTES DATA INTERFACE - COMPREHENSIVE BUFFET!
// ─────────────────────────────────────────────────────────────────────────────

export interface StudyNotesData {
  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: BASIC INFORMATION
  // ═══════════════════════════════════════════════════════════════
  title: string;
  subtitle?: string;
  subject: string;
  subjectCategory?: SubjectCategory;
  specificSubject?: string;  // Physics, Chemistry, History, etc.
  topic: string;
  subtopic?: string;
  chapter?: string;
  chapterNumber?: number;
  unit?: string;
  unitNumber?: number;

  // Academic Context
  educationLevel?: EducationLevel;
  class?: string;  // Class 10, Class 12, B.Tech 2nd Year
  board?: Board;
  academicYear?: string;
  semester?: string;
  
  // Competitive Exam Context
  targetExam?: CompetitiveExam;
  examYear?: string;
  syllabusTopic?: string;
  weightage?: string;  // "5-7 marks", "High", etc.

  // Meta Info
  author?: string;
  institution?: string;
  createdDate?: string;
  lastUpdated?: string;
  version?: string;
  language?: 'english' | 'hindi' | 'hinglish' | 'other';

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: CONTENT - CORE NOTES
  // ═══════════════════════════════════════════════════════════════
  introduction?: string;
  summary?: string;
  keyPoints?: KeyPoint[];
  definitions?: Definition[];
  concepts?: string[];
  explanation?: string;
  
  // Detailed Content Sections
  sections?: ContentSection[];
  
  // Bullet Points (Simple)
  bulletPoints?: string[];
  numberedPoints?: string[];
  
  // Tables
  tables?: TableData[];
  comparisonTables?: ComparisonTable[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: FORMULAS & EQUATIONS (Maths/Physics/Chemistry)
  // ═══════════════════════════════════════════════════════════════
  formulas?: Formula[];
  equations?: string[];
  derivations?: Derivation[];
  theorems?: Theorem[];
  laws?: Theorem[];  // Newton's Laws, Boyle's Law, etc.
  principles?: Theorem[];
  
  // Constants
  constants?: Constant[];
  
  // Units & Conversions
  units?: UnitInfo[];
  conversions?: string[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: SCIENCE SPECIFIC (Physics/Chemistry/Biology)
  // ═══════════════════════════════════════════════════════════════
  // Physics
  physicsFormulas?: Formula[];
  circuits?: Diagram[];
  experiments?: Experiment[];
  
  // Chemistry
  chemicalReactions?: ChemicalReaction[];
  periodicTableInfo?: PeriodicElement[];
  organicReactions?: ChemicalReaction[];
  chemicalProperties?: PropertyTable[];
  labProcedures?: LabProcedure[];
  
  // Biology
  biologicalProcesses?: BiologicalProcess[];
  taxonomy?: TaxonomyItem[];
  anatomyDiagrams?: Diagram[];
  diseases?: DiseaseInfo[];
  scientificNames?: Definition[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: MATHEMATICS SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  mathFormulas?: Formula[];
  proofs?: Proof[];
  geometryConstructions?: Construction[];
  graphs?: GraphInfo[];
  solvedNumericals?: Example[];
  shortcuts?: Shortcut[];
  
  // Trigonometry
  trigIdentities?: Formula[];
  trigValues?: TableData;
  
  // Calculus
  differentiation?: Formula[];
  integration?: Formula[];
  limits?: Formula[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: HUMANITIES SPECIFIC (History/Geography/Civics/Economics)
  // ═══════════════════════════════════════════════════════════════
  // History
  timeline?: TimelineEvent[];
  historicalFigures?: HistoricalFigure[];
  events?: HistoricalEvent[];
  causes?: string[];
  effects?: string[];
  significance?: string[];
  
  // Geography
  geographicalData?: GeographicalData[];
  mapPoints?: MapPoint[];
  statistics?: StatisticalData[];
  climateData?: ClimateInfo[];
  
  // Civics/Political Science
  amendments?: Amendment[];
  articles?: ConstitutionalArticle[];
  governmentStructure?: string[];
  
  // Economics
  economicConcepts?: EconomicConcept[];
  economicGraphs?: GraphInfo[];
  policies?: PolicyInfo[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7: LANGUAGE SPECIFIC (English/Hindi/Sanskrit)
  // ═══════════════════════════════════════════════════════════════
  grammarRules?: GrammarRule[];
  vocabulary?: VocabularyWord[];
  idioms?: Idiom[];
  phrases?: Phrase[];
  literatureNotes?: LiteratureNote[];
  
  // Writing
  writingFormats?: WritingFormat[];
  sampleEssays?: string[];
  letterFormats?: string[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8: LEARNING AIDS
  // ═══════════════════════════════════════════════════════════════
  mnemonics?: Mnemonic[];
  memoryTips?: string[];
  diagrams?: Diagram[];
  flowcharts?: Diagram[];
  mindMaps?: Diagram[];
  examples?: Example[];
  realWorldApplications?: string[];
  analogies?: Analogy[];
  
  // Visual Aids
  images?: ImageInfo[];
  videos?: VideoReference[];
  animations?: string[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 9: PRACTICE & EXERCISES
  // ═══════════════════════════════════════════════════════════════
  practiceQuestions?: Question[];
  solvedExamples?: Example[];
  exercises?: Exercise[];
  
  // Numerical Problems
  numericalProblems?: NumericalProblem[];
  wordProblems?: Example[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 10: ASSIGNMENTS
  // ═══════════════════════════════════════════════════════════════
  assignments?: Assignment[];
  homework?: Assignment[];
  projects?: ProjectAssignment[];
  worksheets?: Worksheet[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 11: EXAM PREPARATION
  // ═══════════════════════════════════════════════════════════════
  importantQuestions?: Question[];
  previousYearQuestions?: Question[];
  expectedQuestions?: Question[];
  oneLiners?: string[];
  quickRevision?: RevisionPoint[];
  examTips?: string[];
  commonMistakes?: string[];
  scoringTopics?: string[];
  
  // Marking Scheme
  markingScheme?: MarkingInfo[];
  questionPattern?: string;
  importantForExam?: string[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 12: ORGANIZATION & META
  // ═══════════════════════════════════════════════════════════════
  difficulty?: DifficultyLevel;
  importance?: ImportanceLevel;
  estimatedTime?: string;
  prerequisites?: string[];
  relatedTopics?: string[];
  tags?: string[];
  keywords?: string[];
  
  // Progress Tracking
  completionStatus?: 'not-started' | 'in-progress' | 'completed' | 'revision-needed';
  confidenceLevel?: 'low' | 'medium' | 'high';
  lastRevised?: string;
  revisionCount?: number;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 13: REFERENCES & SOURCES
  // ═══════════════════════════════════════════════════════════════
  references?: Reference[];
  textbooks?: string[];
  onlineResources?: string[];
  videoLinks?: string[];
  additionalReading?: string[];
  ncertReference?: string;
  pageNumbers?: string;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 14: TEMPLATE SETTINGS
  // ═══════════════════════════════════════════════════════════════
  templateStyle?: StudyNotesStyle;
  accentColor?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showPageNumbers?: boolean;
  showTableOfContents?: boolean;
  showKeyPoints?: boolean;
  showFormulas?: boolean;
  showDiagrams?: boolean;
  showExamples?: boolean;
  showPracticeQuestions?: boolean;
  showRevisionSection?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  paperSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  purpose?: NotesPurpose;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD DEFINITION INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldDefinition {
  key: string;
  label: string;
  labelHi: string;
  type: 'text' | 'email' | 'url' | 'date' | 'textarea' | 'array' | 'select' | 'number' | 'boolean' | 'object' | 'rich-text';
  required: boolean;
  category: FieldCategory;
  level: FieldLevel[];
  placeholder?: string;
  placeholderHi?: string;
  validation?: string;
  maxLength?: number;
  options?: string[];
  hint?: string;
  hintHi?: string;
  subjectRelevance?: SubjectCategory[];
}



export const STUDY_NOTES_FIELDS: FieldDefinition[] = [
  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: BASIC INFORMATION
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'title', 
    label: 'Notes Title', 
    labelHi: 'नोट्स का शीर्षक', 
    type: 'text', 
    required: true, 
    category: 'basic', 
    level: ['all'], 
    placeholder: 'Newton\'s Laws of Motion / Mughal Empire / Quadratic Equations',
    placeholderHi: 'न्यूटन के गति के नियम / मुगल साम्राज्य / द्विघात समीकरण',
    maxLength: 200 
  },
  { 
    key: 'subtitle', 
    label: 'Subtitle', 
    labelHi: 'उपशीर्षक', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    placeholder: 'Complete Chapter Notes with Solved Examples',
    placeholderHi: 'हल किए गए उदाहरणों के साथ पूर्ण अध्याय नोट्स'
  },
  { 
    key: 'subject', 
    label: 'Subject', 
    labelHi: 'विषय', 
    type: 'text', 
    required: true, 
    category: 'basic', 
    level: ['all'], 
    placeholder: 'Physics / Mathematics / History / English',
    placeholderHi: 'भौतिकी / गणित / इतिहास / अंग्रेज़ी'
  },
  { 
    key: 'subjectCategory', 
    label: 'Subject Category', 
    labelHi: 'विषय श्रेणी', 
    type: 'select', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    options: ['Science', 'Mathematics', 'Social Science', 'Languages', 'Commerce', 'Arts', 'Computer Science', 'General Knowledge', 'Competitive Specific', 'Other']
  },
  { 
    key: 'specificSubject', 
    label: 'Specific Subject', 
    labelHi: 'विशिष्ट विषय', 
    type: 'select', 
    required: false, 
    category: 'basic', 
    level: ['all'],
    options: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Civics', 'Economics', 'English', 'Hindi', 'Sanskrit', 'Computer Science', 'Accountancy', 'Business Studies', 'Other'],
    hint: 'Select specific subject within category',
    hintHi: 'श्रेणी के भीतर विशिष्ट विषय चुनें'
  },
  { 
    key: 'topic', 
    label: 'Topic', 
    labelHi: 'टॉपिक', 
    type: 'text', 
    required: true, 
    category: 'basic', 
    level: ['all'], 
    placeholder: 'Laws of Motion / Photosynthesis / French Revolution',
    placeholderHi: 'गति के नियम / प्रकाश संश्लेषण / फ्रांसीसी क्रांति'
  },
  { 
    key: 'subtopic', 
    label: 'Subtopic', 
    labelHi: 'उप-टॉपिक', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    placeholder: 'Newton\'s Third Law / Light Reaction / Reign of Terror',
    placeholderHi: 'न्यूटन का तीसरा नियम / प्रकाश अभिक्रिया / आतंक का राज'
  },
  { 
    key: 'chapter', 
    label: 'Chapter Name', 
    labelHi: 'अध्याय का नाम', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    placeholder: 'Chapter 5: Laws of Motion',
    placeholderHi: 'अध्याय 5: गति के नियम'
  },
  { 
    key: 'chapterNumber', 
    label: 'Chapter Number', 
    labelHi: 'अध्याय संख्या', 
    type: 'number', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    placeholder: '5'
  },
  { 
    key: 'unit', 
    label: 'Unit Name', 
    labelHi: 'इकाई का नाम', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    placeholder: 'Unit 2: Kinematics'
  },
  { 
    key: 'unitNumber', 
    label: 'Unit Number', 
    labelHi: 'इकाई संख्या', 
    type: 'number', 
    required: false, 
    category: 'basic', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    placeholder: '2'
  },

  // Academic Context
  { 
    key: 'educationLevel', 
    label: 'Education Level', 
    labelHi: 'शिक्षा स्तर', 
    type: 'select', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    options: ['Nursery/KG (Age 3-5)', 'Primary (Class 1-5)', 'Middle School (Class 6-8)', 'Secondary (Class 9-10)', 'Higher Secondary (Class 11-12)', 'Undergraduate', 'Postgraduate', 'Competitive Exam', 'Professional']
  },
  { 
    key: 'class', 
    label: 'Class/Grade', 
    labelHi: 'कक्षा', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    placeholder: 'Class 10 / Class 12 / B.Tech 2nd Year / MBA',
    placeholderHi: 'कक्षा 10 / कक्षा 12 / बी.टेक द्वितीय वर्ष'
  },
  { 
    key: 'board', 
    label: 'Board/University', 
    labelHi: 'बोर्ड/विश्वविद्यालय', 
    type: 'select', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    options: ['CBSE', 'ICSE/ISC', 'State Board', 'IB', 'Cambridge (IGCSE)', 'University', 'Other']
  },
  { 
    key: 'academicYear', 
    label: 'Academic Year', 
    labelHi: 'शैक्षणिक वर्ष', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    placeholder: '2024-25'
  },
  { 
    key: 'semester', 
    label: 'Semester', 
    labelHi: 'सेमेस्टर', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['undergraduate', 'postgraduate'], 
    placeholder: 'Semester 3 / Odd Semester'
  },

  // Competitive Exam Context
  { 
    key: 'targetExam', 
    label: 'Target Exam', 
    labelHi: 'लक्ष्य परीक्षा', 
    type: 'select', 
    required: false, 
    category: 'basic', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    options: ['JEE Main', 'JEE Advanced', 'NEET', 'UPSC CSE', 'UPSC Prelims', 'SSC CGL', 'SSC CHSL', 'Banking IBPS', 'Banking SBI PO', 'CAT', 'GATE', 'UGC NET', 'CLAT', 'NDA', 'CDS', 'State PSC', 'Olympiad', 'NTSE', 'KVPY', 'Board Exam', 'Other'],
    hint: 'Select if preparing for competitive exam',
    hintHi: 'प्रतियोगी परीक्षा की तैयारी कर रहे हों तो चुनें'
  },
  { 
    key: 'examYear', 
    label: 'Exam Year', 
    labelHi: 'परीक्षा वर्ष', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['competitive'], 
    placeholder: '2025'
  },
  { 
    key: 'syllabusTopic', 
    label: 'Syllabus Topic', 
    labelHi: 'पाठ्यक्रम टॉपिक', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['competitive'], 
    placeholder: 'As per UPSC Prelims Syllabus / JEE Main Syllabus',
    hint: 'Topic as mentioned in exam syllabus',
    hintHi: 'परीक्षा पाठ्यक्रम में उल्लिखित टॉपिक'
  },
  { 
    key: 'weightage', 
    label: 'Exam Weightage', 
    labelHi: 'परीक्षा में महत्व', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['secondary', 'higher-secondary', 'competitive'], 
    placeholder: '5-7 marks / High / 2-3 questions expected',
    placeholderHi: '5-7 अंक / उच्च / 2-3 प्रश्न अपेक्षित',
    hint: 'How important is this topic in exam?',
    hintHi: 'परीक्षा में यह टॉपिक कितना महत्वपूर्ण है?'
  },

  // Meta Info
  { 
    key: 'author', 
    label: 'Author/Teacher', 
    labelHi: 'लेखक/शिक्षक', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    placeholder: 'Your name or teacher\'s name'
  },
  { 
    key: 'institution', 
    label: 'Institution/School', 
    labelHi: 'संस्थान/स्कूल', 
    type: 'text', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    placeholder: 'Delhi Public School / IIT Coaching / Self Study'
  },
  { 
    key: 'language', 
    label: 'Language', 
    labelHi: 'भाषा', 
    type: 'select', 
    required: false, 
    category: 'basic', 
    level: ['all'], 
    options: ['English', 'Hindi', 'Hinglish (Mixed)', 'Other']
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: CONTENT - CORE NOTES
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'introduction', 
    label: 'Introduction', 
    labelHi: 'परिचय', 
    type: 'textarea', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    placeholder: 'Brief introduction to the topic...',
    placeholderHi: 'टॉपिक का संक्षिप्त परिचय...',
    hint: 'Set context for the topic',
    hintHi: 'टॉपिक का संदर्भ स्थापित करें',
    maxLength: 1000
  },
  { 
    key: 'summary', 
    label: 'Summary', 
    labelHi: 'सारांश', 
    type: 'textarea', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    placeholder: 'Quick summary of the entire topic...',
    placeholderHi: 'पूरे टॉपिक का त्वरित सारांश...',
    hint: 'Brief overview for quick revision',
    hintHi: 'त्वरित पुनरावृत्ति के लिए संक्षिप्त विवरण',
    maxLength: 2000
  },
  { 
    key: 'keyPoints', 
    label: 'Key Points', 
    labelHi: 'मुख्य बिंदु', 
    type: 'array', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    hint: 'Most important points to remember',
    hintHi: 'याद रखने के लिए सबसे महत्वपूर्ण बिंदु'
  },
  { 
    key: 'definitions', 
    label: 'Definitions', 
    labelHi: 'परिभाषाएं', 
    type: 'array', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    hint: 'Important terms and their meanings',
    hintHi: 'महत्वपूर्ण शब्द और उनके अर्थ'
  },
  { 
    key: 'concepts', 
    label: 'Key Concepts', 
    labelHi: 'मुख्य अवधारणाएं', 
    type: 'array', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    hint: 'Core concepts explained',
    hintHi: 'मूल अवधारणाओं की व्याख्या'
  },
  { 
    key: 'explanation', 
    label: 'Detailed Explanation', 
    labelHi: 'विस्तृत व्याख्या', 
    type: 'rich-text', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    hint: 'Detailed explanation of the topic',
    hintHi: 'टॉपिक की विस्तृत व्याख्या',
    maxLength: 10000
  },
  { 
    key: 'bulletPoints', 
    label: 'Quick Points', 
    labelHi: 'त्वरित बिंदु', 
    type: 'array', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    hint: 'Simple bullet points for notes',
    hintHi: 'नोट्स के लिए सरल बुलेट पॉइंट्स'
  },
  { 
    key: 'numberedPoints', 
    label: 'Numbered Points', 
    labelHi: 'क्रमांकित बिंदु', 
    type: 'array', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    hint: 'Numbered list of points',
    hintHi: 'बिंदुओं की क्रमांकित सूची'
  },
  { 
    key: 'sections', 
    label: 'Content Sections', 
    labelHi: 'सामग्री अनुभाग', 
    type: 'array', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    hint: 'Organize content into sections with headings',
    hintHi: 'सामग्री को शीर्षकों के साथ अनुभागों में व्यवस्थित करें'
  },
  { 
    key: 'tables', 
    label: 'Data Tables', 
    labelHi: 'डेटा तालिकाएं', 
    type: 'array', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    hint: 'Tables with data',
    hintHi: 'डेटा के साथ तालिकाएं'
  },
  { 
    key: 'comparisonTables', 
    label: 'Comparison Tables', 
    labelHi: 'तुलना तालिकाएं', 
    type: 'array', 
    required: false, 
    category: 'content', 
    level: ['all'], 
    hint: 'Compare different concepts/items',
    hintHi: 'विभिन्न अवधारणाओं/वस्तुओं की तुलना करें'
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: FORMULAS & EQUATIONS
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'formulas', 
    label: 'Formulas', 
    labelHi: 'सूत्र', 
    type: 'array', 
    required: false, 
    category: 'formulas', 
    level: ['all'], 
    hint: 'Mathematical/Scientific formulas with explanations',
    hintHi: 'व्याख्या के साथ गणितीय/वैज्ञानिक सूत्र',
    subjectRelevance: ['science', 'mathematics']
  },
  { 
    key: 'equations', 
    label: 'Important Equations', 
    labelHi: 'महत्वपूर्ण समीकरण', 
    type: 'array', 
    required: false, 
    category: 'formulas', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Key equations to memorize',
    hintHi: 'याद करने के लिए मुख्य समीकरण',
    subjectRelevance: ['science', 'mathematics']
  },
  { 
    key: 'derivations', 
    label: 'Derivations', 
    labelHi: 'व्युत्पत्तियां', 
    type: 'array', 
    required: false, 
    category: 'formulas', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Step-by-step derivations',
    hintHi: 'चरण-दर-चरण व्युत्पत्तियां',
    subjectRelevance: ['science', 'mathematics']
  },
  { 
    key: 'theorems', 
    label: 'Theorems', 
    labelHi: 'प्रमेय', 
    type: 'array', 
    required: false, 
    category: 'formulas', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Mathematical theorems with proofs',
    hintHi: 'प्रमाण के साथ गणितीय प्रमेय',
    subjectRelevance: ['mathematics']
  },
  { 
    key: 'laws', 
    label: 'Laws & Principles', 
    labelHi: 'नियम और सिद्धांत', 
    type: 'array', 
    required: false, 
    category: 'formulas', 
    level: ['all'], 
    hint: 'Scientific laws (Newton\'s Laws, Boyle\'s Law, etc.)',
    hintHi: 'वैज्ञानिक नियम (न्यूटन के नियम, बॉयल का नियम, आदि)',
    subjectRelevance: ['science']
  },
  { 
    key: 'principles', 
    label: 'Principles', 
    labelHi: 'सिद्धांत', 
    type: 'array', 
    required: false, 
    category: 'formulas', 
    level: ['all'], 
    hint: 'Fundamental principles',
    hintHi: 'मूलभूत सिद्धांत',
    subjectRelevance: ['science', 'mathematics']
  },
  { 
    key: 'constants', 
    label: 'Constants', 
    labelHi: 'स्थिरांक', 
    type: 'array', 
    required: false, 
    category: 'formulas', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Important constants (g=9.8, c=3×10⁸, h, etc.)',
    hintHi: 'महत्वपूर्ण स्थिरांक (g=9.8, c=3×10⁸, h, आदि)',
    subjectRelevance: ['science']
  },
  { 
    key: 'units', 
    label: 'Units & Measurements', 
    labelHi: 'इकाइयां और माप', 
    type: 'array', 
    required: false, 
    category: 'formulas', 
    level: ['all'], 
    hint: 'SI units and conversions',
    hintHi: 'SI इकाइयां और रूपांतरण',
    subjectRelevance: ['science', 'mathematics']
  },
  { 
    key: 'conversions', 
    label: 'Unit Conversions', 
    labelHi: 'इकाई रूपांतरण', 
    type: 'array', 
    required: false, 
    category: 'formulas', 
    level: ['all'], 
    hint: '1 km = 1000 m, 1 hour = 3600 s, etc.',
    hintHi: '1 km = 1000 m, 1 घंटा = 3600 s, आदि',
    subjectRelevance: ['science', 'mathematics']
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: SCIENCE SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'experiments', 
    label: 'Experiments', 
    labelHi: 'प्रयोग', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate'], 
    hint: 'Lab experiments with procedure',
    hintHi: 'प्रक्रिया के साथ प्रयोगशाला प्रयोग',
    subjectRelevance: ['science']
  },
  { 
    key: 'labProcedures', 
    label: 'Lab Procedures', 
    labelHi: 'प्रयोगशाला प्रक्रियाएं', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate'], 
    hint: 'Step-by-step lab procedures',
    hintHi: 'चरण-दर-चरण प्रयोगशाला प्रक्रियाएं',
    subjectRelevance: ['science']
  },
  { 
    key: 'chemicalReactions', 
    label: 'Chemical Reactions', 
    labelHi: 'रासायनिक अभिक्रियाएं', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Balanced chemical equations',
    hintHi: 'संतुलित रासायनिक समीकरण',
    subjectRelevance: ['science']
  },
  { 
    key: 'organicReactions', 
    label: 'Organic Reactions', 
    labelHi: 'कार्बनिक अभिक्रियाएं', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Organic chemistry reactions',
    hintHi: 'कार्बनिक रसायन अभिक्रियाएं',
    subjectRelevance: ['science']
  },
  { 
    key: 'periodicTableInfo', 
    label: 'Periodic Table Info', 
    labelHi: 'आवर्त सारणी जानकारी', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'competitive'], 
    hint: 'Element properties from periodic table',
    hintHi: 'आवर्त सारणी से तत्वों के गुण',
    subjectRelevance: ['science']
  },
  { 
    key: 'chemicalProperties', 
    label: 'Chemical Properties', 
    labelHi: 'रासायनिक गुण', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate'], 
    hint: 'Properties of chemical compounds',
    hintHi: 'रासायनिक यौगिकों के गुण',
    subjectRelevance: ['science']
  },
  { 
    key: 'biologicalProcesses', 
    label: 'Biological Processes', 
    labelHi: 'जैविक प्रक्रियाएं', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Life processes (Photosynthesis, Digestion, Respiration, etc.)',
    hintHi: 'जीवन प्रक्रियाएं (प्रकाश संश्लेषण, पाचन, श्वसन, आदि)',
    subjectRelevance: ['science']
  },
  { 
    key: 'taxonomy', 
    label: 'Classification/Taxonomy', 
    labelHi: 'वर्गीकरण', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate'], 
    hint: 'Scientific classification of organisms',
    hintHi: 'जीवों का वैज्ञानिक वर्गीकरण',
    subjectRelevance: ['science']
  },
  { 
    key: 'anatomyDiagrams', 
    label: 'Anatomy Diagrams', 
    labelHi: 'शारीरिक रचना आरेख', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Diagrams of body parts/organs',
    hintHi: 'शरीर के अंगों के आरेख',
    subjectRelevance: ['science']
  },
  { 
    key: 'diseases', 
    label: 'Diseases & Disorders', 
    labelHi: 'रोग और विकार', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Disease names, causes, symptoms, prevention',
    hintHi: 'रोग के नाम, कारण, लक्षण, रोकथाम',
    subjectRelevance: ['science']
  },
  { 
    key: 'scientificNames', 
    label: 'Scientific Names', 
    labelHi: 'वैज्ञानिक नाम', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'competitive'], 
    hint: 'Scientific names of organisms/compounds',
    hintHi: 'जीवों/यौगिकों के वैज्ञानिक नाम',
    subjectRelevance: ['science']
  },
  { 
    key: 'circuits', 
    label: 'Circuit Diagrams', 
    labelHi: 'परिपथ आरेख', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate'], 
    hint: 'Electrical circuit diagrams',
    hintHi: 'विद्युत परिपथ आरेख',
    subjectRelevance: ['science']
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: MATHEMATICS SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'proofs', 
    label: 'Proofs', 
    labelHi: 'प्रमाण', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Mathematical proofs step-by-step',
    hintHi: 'चरण-दर-चरण गणितीय प्रमाण',
    subjectRelevance: ['mathematics']
  },
  { 
    key: 'geometryConstructions', 
    label: 'Geometry Constructions', 
    labelHi: 'ज्यामिति रचनाएं', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary'], 
    hint: 'Step-by-step geometric constructions',
    hintHi: 'चरण-दर-चरण ज्यामितीय रचनाएं',
    subjectRelevance: ['mathematics']
  },
  { 
    key: 'graphs', 
    label: 'Graphs', 
    labelHi: 'ग्राफ', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Mathematical graphs and their properties',
    hintHi: 'गणितीय ग्राफ और उनके गुण',
    subjectRelevance: ['mathematics']
  },
  { 
    key: 'solvedNumericals', 
    label: 'Solved Numericals', 
    labelHi: 'हल किए गए सवाल', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Step-by-step solved numerical problems',
    hintHi: 'चरण-दर-चरण हल किए गए संख्यात्मक सवाल',
    subjectRelevance: ['science', 'mathematics']
  },
  { 
    key: 'shortcuts', 
    label: 'Shortcuts & Tricks', 
    labelHi: 'शॉर्टकट और ट्रिक्स', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['secondary', 'higher-secondary', 'competitive'], 
    hint: 'Quick calculation methods and tricks',
    hintHi: 'त्वरित गणना विधियां और ट्रिक्स',
    subjectRelevance: ['mathematics', 'competitive-specific']
  },
  { 
    key: 'trigIdentities', 
    label: 'Trigonometric Identities', 
    labelHi: 'त्रिकोणमितीय सर्वसमिकाएं', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'sin²θ + cos²θ = 1, tan θ = sin θ/cos θ, etc.',
    hintHi: 'sin²θ + cos²θ = 1, tan θ = sin θ/cos θ, आदि',
    subjectRelevance: ['mathematics']
  },
  { 
    key: 'trigValues', 
    label: 'Trigonometric Values', 
    labelHi: 'त्रिकोणमितीय मान', 
    type: 'object', 
    required: false, 
    category: 'science-specific', 
    level: ['secondary', 'higher-secondary', 'competitive'], 
    hint: 'Values of sin, cos, tan at standard angles',
    hintHi: 'मानक कोणों पर sin, cos, tan के मान',
    subjectRelevance: ['mathematics']
  },
  { 
    key: 'differentiation', 
    label: 'Differentiation Formulas', 
    labelHi: 'अवकलन सूत्र', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'd/dx formulas',
    hintHi: 'd/dx सूत्र',
    subjectRelevance: ['mathematics']
  },
  { 
    key: 'integration', 
    label: 'Integration Formulas', 
    labelHi: 'समाकलन सूत्र', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['higher-secondary', 'undergraduate', 'competitive'], 
    hint: '∫ formulas',
    hintHi: '∫ सूत्र',
    subjectRelevance: ['mathematics']
  },
  { 
    key: 'limits', 
    label: 'Limits', 
    labelHi: 'सीमाएं', 
    type: 'array', 
    required: false, 
    category: 'science-specific', 
    level: ['higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Important limits and formulas',
    hintHi: 'महत्वपूर्ण सीमाएं और सूत्र',
    subjectRelevance: ['mathematics']
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: HUMANITIES SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'timeline', 
    label: 'Timeline/Chronology', 
    labelHi: 'समयरेखा/कालक्रम', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['all'], 
    hint: 'Important dates and events in order',
    hintHi: 'क्रम में महत्वपूर्ण तिथियां और घटनाएं',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'historicalFigures', 
    label: 'Important Personalities', 
    labelHi: 'महत्वपूर्ण व्यक्तित्व', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['all'], 
    hint: 'Key historical figures and their contributions',
    hintHi: 'प्रमुख ऐतिहासिक व्यक्तित्व और उनके योगदान',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'events', 
    label: 'Historical Events', 
    labelHi: 'ऐतिहासिक घटनाएं', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['all'], 
    hint: 'Major historical events with details',
    hintHi: 'विवरण के साथ प्रमुख ऐतिहासिक घटनाएं',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'causes', 
    label: 'Causes', 
    labelHi: 'कारण', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['all'], 
    hint: 'Causes of events/movements/wars',
    hintHi: 'घटनाओं/आंदोलनों/युद्धों के कारण',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'effects', 
    label: 'Effects/Consequences', 
    labelHi: 'प्रभाव/परिणाम', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['all'], 
    hint: 'Effects and consequences of events',
    hintHi: 'घटनाओं के प्रभाव और परिणाम',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'significance', 
    label: 'Significance', 
    labelHi: 'महत्व', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['all'], 
    hint: 'Historical/Political significance',
    hintHi: 'ऐतिहासिक/राजनीतिक महत्व',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'geographicalData', 
    label: 'Geographical Data', 
    labelHi: 'भौगोलिक डेटा', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['all'], 
    hint: 'Maps, locations, statistics',
    hintHi: 'मानचित्र, स्थान, आंकड़े',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'mapPoints', 
    label: 'Map Work Points', 
    labelHi: 'मानचित्र कार्य बिंदु', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'competitive'], 
    hint: 'Important locations to mark on map',
    hintHi: 'मानचित्र पर चिह्नित करने के लिए महत्वपूर्ण स्थान',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'statistics', 
    label: 'Statistical Data', 
    labelHi: 'सांख्यिकीय डेटा', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Population, GDP, area, etc.',
    hintHi: 'जनसंख्या, GDP, क्षेत्रफल, आदि',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'climateData', 
    label: 'Climate Information', 
    labelHi: 'जलवायु जानकारी', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['middle', 'secondary', 'higher-secondary'], 
    hint: 'Climate types, rainfall, temperature data',
    hintHi: 'जलवायु प्रकार, वर्षा, तापमान डेटा',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'amendments', 
    label: 'Constitutional Amendments', 
    labelHi: 'संवैधानिक संशोधन', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Important amendments (42nd, 44th, 73rd, etc.)',
    hintHi: 'महत्वपूर्ण संशोधन (42वां, 44वां, 73वां, आदि)',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'articles', 
    label: 'Constitutional Articles', 
    labelHi: 'संवैधानिक अनुच्छेद', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Important articles (Article 14, 21, 32, 370, etc.)',
    hintHi: 'महत्वपूर्ण अनुच्छेद (अनुच्छेद 14, 21, 32, 370, आदि)',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'governmentStructure', 
    label: 'Government Structure', 
    labelHi: 'सरकार की संरचना', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'competitive'], 
    hint: 'Legislature, Executive, Judiciary structure',
    hintHi: 'विधायिका, कार्यपालिका, न्यायपालिका संरचना',
    subjectRelevance: ['social-science']
  },
  { 
    key: 'economicConcepts', 
    label: 'Economic Concepts', 
    labelHi: 'आर्थिक अवधारणाएं', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'GDP, inflation, demand-supply, etc.',
    hintHi: 'GDP, मुद्रास्फीति, मांग-आपूर्ति, आदि',
    subjectRelevance: ['social-science', 'commerce']
  },
  { 
    key: 'economicGraphs', 
    label: 'Economic Graphs', 
    labelHi: 'आर्थिक ग्राफ', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Demand-supply curves, indifference curves, etc.',
    hintHi: 'मांग-आपूर्ति वक्र, उदासीनता वक्र, आदि',
    subjectRelevance: ['social-science', 'commerce']
  },
  { 
    key: 'policies', 
    label: 'Government Policies', 
    labelHi: 'सरकारी नीतियां', 
    type: 'array', 
    required: false, 
    category: 'humanities-specific', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Economic policies, schemes, programs',
    hintHi: 'आर्थिक नीतियां, योजनाएं, कार्यक्रम',
    subjectRelevance: ['social-science']
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7: LANGUAGE SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'grammarRules', 
    label: 'Grammar Rules', 
    labelHi: 'व्याकरण नियम', 
    type: 'array', 
    required: false, 
    category: 'language-specific', 
    level: ['all'], 
    hint: 'Grammar rules with examples',
    hintHi: 'उदाहरणों के साथ व्याकरण नियम',
    subjectRelevance: ['languages']
  },
  { 
    key: 'vocabulary', 
    label: 'Vocabulary', 
    labelHi: 'शब्दावली', 
    type: 'array', 
    required: false, 
    category: 'language-specific', 
    level: ['all'], 
    hint: 'Important words with meanings',
    hintHi: 'अर्थों के साथ महत्वपूर्ण शब्द',
    subjectRelevance: ['languages']
  },
  { 
    key: 'idioms', 
    label: 'Idioms & Phrases', 
    labelHi: 'मुहावरे और लोकोक्तियां', 
    type: 'array', 
    required: false, 
    category: 'language-specific', 
    level: ['all'], 
    hint: 'Common idioms with meanings and usage',
    hintHi: 'अर्थों और प्रयोग के साथ सामान्य मुहावरे',
    subjectRelevance: ['languages']
  },
  { 
    key: 'phrases', 
    label: 'Useful Phrases', 
    labelHi: 'उपयोगी वाक्यांश', 
    type: 'array', 
    required: false, 
    category: 'language-specific', 
    level: ['all'], 
    hint: 'Common phrases for writing/speaking',
    hintHi: 'लेखन/बोलने के लिए सामान्य वाक्यांश',
    subjectRelevance: ['languages']
  },
  { 
    key: 'literatureNotes', 
    label: 'Literature Notes', 
    labelHi: 'साहित्य नोट्स', 
    type: 'array', 
    required: false, 
    category: 'language-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate'], 
    hint: 'Chapter summaries, character analysis, themes',
    hintHi: 'अध्याय सारांश, चरित्र विश्लेषण, विषय-वस्तु',
    subjectRelevance: ['languages']
  },
  { 
    key: 'writingFormats', 
    label: 'Writing Formats', 
    labelHi: 'लेखन प्रारूप', 
    type: 'array', 
    required: false, 
    category: 'language-specific', 
    level: ['middle', 'secondary', 'higher-secondary'], 
    hint: 'Letter, essay, notice, report, article formats',
    hintHi: 'पत्र, निबंध, सूचना, रिपोर्ट, लेख प्रारूप',
    subjectRelevance: ['languages']
  },
  { 
    key: 'sampleEssays', 
    label: 'Sample Essays', 
    labelHi: 'नमूना निबंध', 
    type: 'array', 
    required: false, 
    category: 'language-specific', 
    level: ['middle', 'secondary', 'higher-secondary', 'competitive'], 
    hint: 'Model essays on various topics',
    hintHi: 'विभिन्न विषयों पर मॉडल निबंध',
    subjectRelevance: ['languages']
  },
  { 
    key: 'letterFormats', 
    label: 'Letter Formats', 
    labelHi: 'पत्र प्रारूप', 
    type: 'array', 
    required: false, 
    category: 'language-specific', 
    level: ['middle', 'secondary', 'higher-secondary'], 
    hint: 'Formal, informal, business letter formats',
    hintHi: 'औपचारिक, अनौपचारिक, व्यावसायिक पत्र प्रारूप',
    subjectRelevance: ['languages']
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8: LEARNING AIDS
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'mnemonics', 
    label: 'Mnemonics', 
    labelHi: 'याद करने के तरीके', 
    type: 'array', 
    required: false, 
    category: 'learning-aids', 
    level: ['all'], 
    hint: 'Memory tricks (VIBGYOR, My Very Educated Mother...)',
    hintHi: 'याद करने की ट्रिक्स (VIBGYOR, My Very Educated Mother...)'
  },
  { 
    key: 'memoryTips', 
    label: 'Memory Tips', 
    labelHi: 'याद करने के टिप्स', 
    type: 'array', 
    required: false, 
    category: 'learning-aids', 
    level: ['all'], 
    hint: 'Tips to remember difficult concepts',
    hintHi: 'कठिन अवधारणाओं को याद करने के टिप्स'
  },
  { 
    key: 'diagrams', 
    label: 'Diagrams & Figures', 
    labelHi: 'आरेख और चित्र', 
    type: 'array', 
    required: false, 
    category: 'learning-aids', 
    level: ['all'], 
    hint: 'Important diagrams to learn and draw',
    hintHi: 'सीखने और बनाने के लिए महत्वपूर्ण आरेख'
  },
  { 
    key: 'flowcharts', 
    label: 'Flowcharts', 
    labelHi: 'फ्लोचार्ट', 
    type: 'array', 
    required: false, 
    category: 'learning-aids', 
    level: ['all'], 
    hint: 'Process flowcharts for better understanding',
    hintHi: 'बेहतर समझ के लिए प्रक्रिया फ्लोचार्ट'
  },
  { 
    key: 'mindMaps', 
    label: 'Mind Maps', 
    labelHi: 'माइंड मैप', 
    type: 'array', 
    required: false, 
    category: 'learning-aids', 
    level: ['all'], 
    hint: 'Mind maps for topic overview',
    hintHi: 'टॉपिक अवलोकन के लिए माइंड मैप'
  },
  { 
    key: 'examples', 
    label: 'Examples', 
    labelHi: 'उदाहरण', 
    type: 'array', 
    required: false, 
    category: 'learning-aids', 
    level: ['all'], 
    hint: 'Real-world examples to understand concepts',
    hintHi: 'अवधारणाओं को समझने के लिए वास्तविक उदाहरण'
  },
  { 
    key: 'realWorldApplications', 
    label: 'Real World Applications', 
    labelHi: 'वास्तविक दुनिया में उपयोग', 
    type: 'array', 
    required: false, 
    category: 'learning-aids', 
    level: ['all'], 
    hint: 'How this topic is used in real life',
    hintHi: 'यह टॉपिक वास्तविक जीवन में कैसे उपयोग होता है'
  },
  { 
    key: 'analogies', 
    label: 'Analogies', 
    labelHi: 'उपमाएं', 
    type: 'array', 
    required: false, 
    category: 'learning-aids', 
    level: ['all'], 
    hint: 'Simple comparisons to understand complex concepts',
    hintHi: 'जटिल अवधारणाओं को समझने के लिए सरल तुलनाएं'
  },
  { 
    key: 'images', 
    label: 'Images', 
    labelHi: 'चित्र', 
    type: 'array', 
    required: false, 
    category: 'learning-aids', 
    level: ['all'], 
    hint: 'Relevant images for visual learning',
    hintHi: 'दृश्य सीखने के लिए प्रासंगिक चित्र'
  },
  { 
    key: 'videos', 
    label: 'Video References', 
    labelHi: 'वीडियो संदर्भ', 
    type: 'array', 
    required: false, 
    category: 'learning-aids', 
    level: ['all'], 
    hint: 'YouTube/online video links for the topic',
    hintHi: 'टॉपिक के लिए YouTube/ऑनलाइन वीडियो लिंक'
  },



  // ═══════════════════════════════════════════════════════════════
  // SECTION 9: PRACTICE & EXERCISES
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'practiceQuestions', 
    label: 'Practice Questions', 
    labelHi: 'अभ्यास प्रश्न', 
    type: 'array', 
    required: false, 
    category: 'practice', 
    level: ['all'], 
    hint: 'Questions for practice after studying',
    hintHi: 'पढ़ाई के बाद अभ्यास के लिए प्रश्न'
  },
  { 
    key: 'solvedExamples', 
    label: 'Solved Examples', 
    labelHi: 'हल किए गए उदाहरण', 
    type: 'array', 
    required: false, 
    category: 'practice', 
    level: ['all'], 
    hint: 'Fully solved examples with step-by-step solutions',
    hintHi: 'चरण-दर-चरण समाधान के साथ पूर्ण हल किए गए उदाहरण'
  },
  { 
    key: 'exercises', 
    label: 'Exercises', 
    labelHi: 'अभ्यास', 
    type: 'array', 
    required: false, 
    category: 'practice', 
    level: ['all'], 
    hint: 'Exercise sets for practice',
    hintHi: 'अभ्यास के लिए प्रश्न सेट'
  },
  { 
    key: 'numericalProblems', 
    label: 'Numerical Problems', 
    labelHi: 'संख्यात्मक समस्याएं', 
    type: 'array', 
    required: false, 
    category: 'practice', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Numerical problems with given, to find, formula, solution',
    hintHi: 'दिया गया, ज्ञात करना, सूत्र, हल के साथ संख्यात्मक समस्याएं',
    subjectRelevance: ['science', 'mathematics']
  },
  { 
    key: 'wordProblems', 
    label: 'Word Problems', 
    labelHi: 'शब्द समस्याएं', 
    type: 'array', 
    required: false, 
    category: 'practice', 
    level: ['primary', 'middle', 'secondary', 'competitive'], 
    hint: 'Story-based mathematical problems',
    hintHi: 'कहानी-आधारित गणितीय समस्याएं',
    subjectRelevance: ['mathematics']
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 10: ASSIGNMENTS
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'assignments', 
    label: 'Assignments', 
    labelHi: 'असाइनमेंट', 
    type: 'array', 
    required: false, 
    category: 'assignments', 
    level: ['all'], 
    hint: 'Assignment questions and tasks',
    hintHi: 'असाइनमेंट प्रश्न और कार्य'
  },
  { 
    key: 'homework', 
    label: 'Homework', 
    labelHi: 'होमवर्क', 
    type: 'array', 
    required: false, 
    category: 'assignments', 
    level: ['nursery', 'primary', 'middle', 'secondary', 'higher-secondary'], 
    hint: 'Daily homework tasks',
    hintHi: 'दैनिक होमवर्क कार्य'
  },
  { 
    key: 'projects', 
    label: 'Project Work', 
    labelHi: 'प्रोजेक्ट कार्य', 
    type: 'array', 
    required: false, 
    category: 'assignments', 
    level: ['all'], 
    hint: 'Project assignments with guidelines and rubric',
    hintHi: 'दिशानिर्देशों और रूब्रिक के साथ प्रोजेक्ट असाइनमेंट'
  },
  { 
    key: 'worksheets', 
    label: 'Worksheets', 
    labelHi: 'वर्कशीट', 
    type: 'array', 
    required: false, 
    category: 'assignments', 
    level: ['nursery', 'primary', 'middle', 'secondary'], 
    hint: 'Practice worksheets with various question types',
    hintHi: 'विभिन्न प्रश्न प्रकारों के साथ अभ्यास वर्कशीट'
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 11: EXAM PREPARATION
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'importantQuestions', 
    label: 'Important Questions', 
    labelHi: 'महत्वपूर्ण प्रश्न', 
    type: 'array', 
    required: false, 
    category: 'exam-prep', 
    level: ['middle', 'secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Most likely to come in exam - must prepare!',
    hintHi: 'परीक्षा में आने की सबसे अधिक संभावना - जरूर तैयार करें!'
  },
  { 
    key: 'previousYearQuestions', 
    label: 'Previous Year Questions (PYQ)', 
    labelHi: 'पिछले वर्ष के प्रश्न (PYQ)', 
    type: 'array', 
    required: false, 
    category: 'exam-prep', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'Questions from past exams with year and marks',
    hintHi: 'वर्ष और अंकों के साथ पिछली परीक्षाओं के प्रश्न'
  },
  { 
    key: 'expectedQuestions', 
    label: 'Expected Questions', 
    labelHi: 'अपेक्षित प्रश्न', 
    type: 'array', 
    required: false, 
    category: 'exam-prep', 
    level: ['secondary', 'higher-secondary', 'competitive'], 
    hint: 'Questions expected in upcoming exam based on pattern',
    hintHi: 'पैटर्न के आधार पर आगामी परीक्षा में अपेक्षित प्रश्न'
  },
  { 
    key: 'oneLiners', 
    label: 'One Liners', 
    labelHi: 'वन लाइनर्स', 
    type: 'array', 
    required: false, 
    category: 'exam-prep', 
    level: ['all'], 
    hint: 'Quick one-line answers for objective questions',
    hintHi: 'वस्तुनिष्ठ प्रश्नों के लिए त्वरित एक-पंक्ति उत्तर'
  },
  { 
    key: 'quickRevision', 
    label: 'Quick Revision Points', 
    labelHi: 'त्वरित पुनरावृत्ति बिंदु', 
    type: 'array', 
    required: false, 
    category: 'exam-prep', 
    level: ['all'], 
    hint: 'Last minute revision points before exam',
    hintHi: 'परीक्षा से पहले अंतिम समय पुनरावृत्ति बिंदु'
  },
  { 
    key: 'examTips', 
    label: 'Exam Tips', 
    labelHi: 'परीक्षा टिप्स', 
    type: 'array', 
    required: false, 
    category: 'exam-prep', 
    level: ['all'], 
    hint: 'Tips and strategies for exam',
    hintHi: 'परीक्षा के लिए टिप्स और रणनीतियां'
  },
  { 
    key: 'commonMistakes', 
    label: 'Common Mistakes', 
    labelHi: 'आम गलतियां', 
    type: 'array', 
    required: false, 
    category: 'exam-prep', 
    level: ['all'], 
    hint: 'Common mistakes students make - avoid these!',
    hintHi: 'छात्रों द्वारा की जाने वाली आम गलतियां - इनसे बचें!'
  },
  { 
    key: 'scoringTopics', 
    label: 'Scoring Topics', 
    labelHi: 'स्कोरिंग टॉपिक्स', 
    type: 'array', 
    required: false, 
    category: 'exam-prep', 
    level: ['secondary', 'higher-secondary', 'competitive'], 
    hint: 'Easy to score topics - prepare these well!',
    hintHi: 'स्कोर करने में आसान टॉपिक्स - इन्हें अच्छे से तैयार करें!'
  },
  { 
    key: 'questionPattern', 
    label: 'Question Pattern', 
    labelHi: 'प्रश्न पैटर्न', 
    type: 'text', 
    required: false, 
    category: 'exam-prep', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    placeholder: '2 MCQs (2 marks) + 1 Short Answer (3 marks) + 1 Long Answer (5 marks)',
    placeholderHi: '2 MCQ (2 अंक) + 1 लघु उत्तर (3 अंक) + 1 दीर्घ उत्तर (5 अंक)',
    hint: 'How questions are asked from this topic in exam',
    hintHi: 'परीक्षा में इस टॉपिक से प्रश्न कैसे पूछे जाते हैं'
  },
  { 
    key: 'markingScheme', 
    label: 'Marking Scheme', 
    labelHi: 'अंकन योजना', 
    type: 'array', 
    required: false, 
    category: 'exam-prep', 
    level: ['secondary', 'higher-secondary', 'undergraduate', 'competitive'], 
    hint: 'How marks are distributed for different question types',
    hintHi: 'विभिन्न प्रश्न प्रकारों के लिए अंक कैसे वितरित होते हैं'
  },
  { 
    key: 'importantForExam', 
    label: 'Important for Exam', 
    labelHi: 'परीक्षा के लिए महत्वपूर्ण', 
    type: 'array', 
    required: false, 
    category: 'exam-prep', 
    level: ['all'], 
    hint: 'Specific points/concepts important for exam',
    hintHi: 'परीक्षा के लिए महत्वपूर्ण विशिष्ट बिंदु/अवधारणाएं'
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 12: ORGANIZATION & META
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'difficulty', 
    label: 'Difficulty Level', 
    labelHi: 'कठिनाई स्तर', 
    type: 'select', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    options: ['Beginner', 'Easy', 'Medium', 'Hard', 'Advanced', 'Expert']
  },
  { 
    key: 'importance', 
    label: 'Importance Level', 
    labelHi: 'महत्व स्तर', 
    type: 'select', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    options: ['Critical (Must Know)', 'Important (High Weightage)', 'Moderate (Sometimes Asked)', 'Optional (Good to Know)', 'Reference Only']
  },
  { 
    key: 'estimatedTime', 
    label: 'Estimated Study Time', 
    labelHi: 'अनुमानित अध्ययन समय', 
    type: 'text', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    placeholder: '2 hours / 30 minutes / 1 week',
    placeholderHi: '2 घंटे / 30 मिनट / 1 सप्ताह',
    hint: 'How long to study this topic?',
    hintHi: 'इस टॉपिक को पढ़ने में कितना समय लगेगा?'
  },
  { 
    key: 'prerequisites', 
    label: 'Prerequisites', 
    labelHi: 'पूर्वापेक्षाएं', 
    type: 'array', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    hint: 'Topics to study before this one',
    hintHi: 'इससे पहले पढ़ने के लिए टॉपिक्स'
  },
  { 
    key: 'relatedTopics', 
    label: 'Related Topics', 
    labelHi: 'संबंधित टॉपिक्स', 
    type: 'array', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    hint: 'Topics related to this one',
    hintHi: 'इससे संबंधित टॉपिक्स'
  },
  { 
    key: 'tags', 
    label: 'Tags', 
    labelHi: 'टैग', 
    type: 'array', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    hint: 'Keywords for easy searching',
    hintHi: 'आसान खोज के लिए कीवर्ड'
  },
  { 
    key: 'keywords', 
    label: 'Keywords', 
    labelHi: 'कीवर्ड', 
    type: 'array', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    hint: 'Important keywords from this topic',
    hintHi: 'इस टॉपिक के महत्वपूर्ण कीवर्ड'
  },
  { 
    key: 'completionStatus', 
    label: 'Completion Status', 
    labelHi: 'पूर्णता स्थिति', 
    type: 'select', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    options: ['Not Started', 'In Progress', 'Completed', 'Needs Revision']
  },
  { 
    key: 'confidenceLevel', 
    label: 'Confidence Level', 
    labelHi: 'आत्मविश्वास स्तर', 
    type: 'select', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    options: ['Low - Need more practice', 'Medium - Somewhat confident', 'High - Fully prepared']
  },
  { 
    key: 'lastRevised', 
    label: 'Last Revised', 
    labelHi: 'अंतिम बार दोहराया', 
    type: 'date', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    hint: 'When did you last revise this topic?',
    hintHi: 'आपने इस टॉपिक को आखिरी बार कब दोहराया?'
  },
  { 
    key: 'revisionCount', 
    label: 'Revision Count', 
    labelHi: 'पुनरावृत्ति गिनती', 
    type: 'number', 
    required: false, 
    category: 'organization', 
    level: ['all'], 
    hint: 'How many times revised?',
    hintHi: 'कितनी बार दोहराया?'
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 13: REFERENCES & SOURCES
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'references', 
    label: 'References', 
    labelHi: 'संदर्भ', 
    type: 'array', 
    required: false, 
    category: 'references', 
    level: ['all'], 
    hint: 'Books, websites, videos used for these notes',
    hintHi: 'इन नोट्स के लिए उपयोग की गई पुस्तकें, वेबसाइट, वीडियो'
  },
  { 
    key: 'ncertReference', 
    label: 'NCERT Reference', 
    labelHi: 'एनसीईआरटी संदर्भ', 
    type: 'text', 
    required: false, 
    category: 'references', 
    level: ['middle', 'secondary', 'higher-secondary'], 
    placeholder: 'Class 10 Science, Chapter 5, Page 78-92',
    placeholderHi: 'कक्षा 10 विज्ञान, अध्याय 5, पृष्ठ 78-92',
    hint: 'NCERT book reference for this topic',
    hintHi: 'इस टॉपिक के लिए एनसीईआरटी पुस्तक संदर्भ'
  },
  { 
    key: 'textbooks', 
    label: 'Textbooks', 
    labelHi: 'पाठ्यपुस्तकें', 
    type: 'array', 
    required: false, 
    category: 'references', 
    level: ['all'], 
    hint: 'Recommended textbooks for this topic',
    hintHi: 'इस टॉपिक के लिए अनुशंसित पाठ्यपुस्तकें'
  },
  { 
    key: 'onlineResources', 
    label: 'Online Resources', 
    labelHi: 'ऑनलाइन संसाधन', 
    type: 'array', 
    required: false, 
    category: 'references', 
    level: ['all'], 
    hint: 'Websites, apps, online courses',
    hintHi: 'वेबसाइट, ऐप्स, ऑनलाइन कोर्स'
  },
  { 
    key: 'videoLinks', 
    label: 'Video Links', 
    labelHi: 'वीडियो लिंक', 
    type: 'array', 
    required: false, 
    category: 'references', 
    level: ['all'], 
    hint: 'YouTube/online video links for this topic',
    hintHi: 'इस टॉपिक के लिए YouTube/ऑनलाइन वीडियो लिंक'
  },
  { 
    key: 'additionalReading', 
    label: 'Additional Reading', 
    labelHi: 'अतिरिक्त पठन', 
    type: 'array', 
    required: false, 
    category: 'references', 
    level: ['higher-secondary', 'undergraduate', 'postgraduate', 'competitive'], 
    hint: 'For deeper understanding beyond syllabus',
    hintHi: 'पाठ्यक्रम से परे गहरी समझ के लिए'
  },
  { 
    key: 'pageNumbers', 
    label: 'Page Numbers', 
    labelHi: 'पृष्ठ संख्या', 
    type: 'text', 
    required: false, 
    category: 'references', 
    level: ['all'], 
    placeholder: 'Pages 45-67',
    hint: 'Page numbers in textbook',
    hintHi: 'पाठ्यपुस्तक में पृष्ठ संख्या'
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 14: TEMPLATE SETTINGS
  // ═══════════════════════════════════════════════════════════════
  { 
    key: 'templateStyle', 
    label: 'Template Style', 
    labelHi: 'टेम्पलेट स्टाइल', 
    type: 'select', 
    required: false, 
    category: 'settings', 
    level: ['all'], 
    options: ['Modern', 'Classic', 'Colorful', 'Minimal', 'Exam-Focused', 'Visual', 'Custom']
  },
  { 
    key: 'accentColor', 
    label: 'Accent Color', 
    labelHi: 'एक्सेंट रंग', 
    type: 'text', 
    required: false, 
    category: 'settings', 
    level: ['all'], 
    placeholder: 'Blue / Green / Red / Purple / #1a365d',
    placeholderHi: 'नीला / हरा / लाल / बैंगनी / #1a365d',
    hint: 'Theme color for notes',
    hintHi: 'नोट्स के लिए थीम रंग'
  },
  { 
    key: 'showHeader', 
    label: 'Show Header?', 
    labelHi: 'हेडर दिखाएं?', 
    type: 'boolean', 
    required: false, 
    category: 'settings', 
    level: ['all']
  },
  { 
    key: 'showFooter', 
    label: 'Show Footer?', 
    labelHi: 'फुटर दिखाएं?', 
    type: 'boolean', 
    required: false, 
    category: 'settings', 
    level: ['all']
  },
  { 
    key: 'showTableOfContents', 
    label: 'Show Table of Contents?', 
    labelHi: 'विषय सूची दिखाएं?', 
    type: 'boolean', 
    required: false, 
    category: 'settings', 
    level: ['all']
  },
  { 
    key: 'showPageNumbers', 
    label: 'Show Page Numbers?', 
    labelHi: 'पृष्ठ संख्या दिखाएं?', 
    type: 'boolean', 
    required: false, 
    category: 'settings', 
    level: ['all']
  },
  { 
    key: 'showKeyPoints', 
    label: 'Show Key Points Section?', 
    labelHi: 'मुख्य बिंदु अनुभाग दिखाएं?', 
    type: 'boolean', 
    required: false, 
    category: 'settings', 
    level: ['all']
  },
  { 
    key: 'showFormulas', 
    label: 'Show Formulas Section?', 
    labelHi: 'सूत्र अनुभाग दिखाएं?', 
    type: 'boolean', 
    required: false, 
    category: 'settings', 
    level: ['all']
  },
  { 
    key: 'showDiagrams', 
    label: 'Show Diagrams?', 
    labelHi: 'आरेख दिखाएं?', 
    type: 'boolean', 
    required: false, 
    category: 'settings', 
    level: ['all']
  },
  { 
    key: 'showExamples', 
    label: 'Show Examples?', 
    labelHi: 'उदाहरण दिखाएं?', 
    type: 'boolean', 
    required: false, 
    category: 'settings', 
    level: ['all']
  },
  { 
    key: 'showPracticeQuestions', 
    label: 'Show Practice Questions?', 
    labelHi: 'अभ्यास प्रश्न दिखाएं?', 
    type: 'boolean', 
    required: false, 
    category: 'settings', 
    level: ['all']
  },
  { 
    key: 'showRevisionSection', 
    label: 'Show Revision Section?', 
    labelHi: 'पुनरावृत्ति अनुभाग दिखाएं?', 
    type: 'boolean', 
    required: false, 
    category: 'settings', 
    level: ['all']
  },
  { 
    key: 'fontSize', 
    label: 'Font Size', 
    labelHi: 'फ़ॉन्ट साइज़', 
    type: 'select', 
    required: false, 
    category: 'settings', 
    level: ['all'], 
    options: ['Small', 'Medium', 'Large']
  },
  { 
    key: 'paperSize', 
    label: 'Paper Size', 
    labelHi: 'पेपर साइज़', 
    type: 'select', 
    required: false, 
    category: 'settings', 
    level: ['all'], 
    options: ['A4', 'Letter', 'Legal']
  },
  { 
    key: 'orientation', 
    label: 'Page Orientation', 
    labelHi: 'पेज ओरिएंटेशन', 
    type: 'select', 
    required: false, 
    category: 'settings', 
    level: ['all'], 
    options: ['Portrait', 'Landscape']
  },
  { 
    key: 'purpose', 
    label: 'Notes Purpose', 
    labelHi: 'नोट्स का उद्देश्य', 
    type: 'select', 
    required: false, 
    category: 'settings', 
    level: ['all'], 
    options: ['Class Notes', 'Revision', 'Exam Preparation', 'Quick Reference', 'Detailed Study', 'Assignment Help', 'Project Research', 'Self Study']
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get fields by category
 */
export function getFieldsByCategory(category: FieldCategory): FieldDefinition[] {
  return STUDY_NOTES_FIELDS.filter(field => field.category === category);
}

/**
 * Get fields by education level
 */
export function getFieldsByLevel(level: FieldLevel): FieldDefinition[] {
  return STUDY_NOTES_FIELDS.filter(field => 
    field.level.includes(level) || field.level.includes('all')
  );
}

/**
 * Get fields by subject relevance
 */
export function getFieldsBySubject(subject: SubjectCategory): FieldDefinition[] {
  return STUDY_NOTES_FIELDS.filter(field => 
    !field.subjectRelevance || field.subjectRelevance.includes(subject)
  );
}

/**
 * Get required fields only
 */
export function getRequiredFields(): FieldDefinition[] {
  return STUDY_NOTES_FIELDS.filter(field => field.required);
}

/**
 * Get optional fields only
 */
export function getOptionalFields(): FieldDefinition[] {
  return STUDY_NOTES_FIELDS.filter(field => !field.required);
}

/**
 * Get fields for specific use case (level + subject combination)
 */
export function getFieldsForUseCase(
  level: FieldLevel, 
  subject?: SubjectCategory
): FieldDefinition[] {
  let fields = getFieldsByLevel(level);
  
  if (subject) {
    fields = fields.filter(field => 
      !field.subjectRelevance || field.subjectRelevance.includes(subject)
    );
  }
  
  // Remove duplicates
  return fields.filter((field, index, self) =>
    index === self.findIndex(f => f.key === field.key)
  );
}

/**
 * Get field count by category
 */
export function getFieldCountByCategory(): Record<FieldCategory, number> {
  const categories: FieldCategory[] = [
    'basic', 'subject', 'content', 'formulas', 'science-specific', 
    'humanities-specific', 'language-specific', 'learning-aids', 
    'practice', 'assignments', 'exam-prep', 'organization', 
    'references', 'settings'
  ];
  
  return categories.reduce((acc, cat) => {
    acc[cat] = getFieldsByCategory(cat).length;
    return acc;
  }, {} as Record<FieldCategory, number>);
}

/**
 * Get fields for specific exam type
 */
export function getFieldsForExam(exam: CompetitiveExam): FieldDefinition[] {
  const competitiveFields = getFieldsByLevel('competitive');
  
  // Add exam-specific filtering if needed
  switch (exam) {
    case 'jee-main':
    case 'jee-advanced':
      return competitiveFields.filter(f => 
        !f.subjectRelevance || 
        f.subjectRelevance.includes('science') || 
        f.subjectRelevance.includes('mathematics')
      );
    case 'neet':
      return competitiveFields.filter(f => 
        !f.subjectRelevance || 
        f.subjectRelevance.includes('science')
      );
    case 'upsc-cse':
    case 'upsc-prelims':
      return competitiveFields.filter(f => 
        !f.subjectRelevance || 
        f.subjectRelevance.includes('social-science') ||
        f.subjectRelevance.includes('general-knowledge')
      );
    default:
      return competitiveFields;
  }
}

/**
 * Validate study notes data
 */
export function validateStudyNotesData(data: Partial<StudyNotesData>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!data.title?.trim()) errors.push('Title is required');
  if (!data.subject?.trim()) errors.push('Subject is required');
  if (!data.topic?.trim()) errors.push('Topic is required');

  // Warnings for recommended fields
  if (!data.keyPoints || data.keyPoints.length === 0) {
    warnings.push('Adding key points will help in revision');
  }
  if (!data.summary) {
    warnings.push('A summary helps in quick revision');
  }
  if (!data.educationLevel) {
    warnings.push('Specifying education level helps customize content');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Check if data has content
 */
export function hasData(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Format date for notes
 */
export function formatDate(date?: string | Date): string {
  if (!date) date = new Date();
  if (typeof date === 'string') date = new Date(date);
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date in Hindi
 */
export function formatDateHi(date?: string | Date): string {
  if (!date) date = new Date();
  if (typeof date === 'string') date = new Date(date);
  
  return date.toLocaleDateString('hi-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT VALUES
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_STUDY_NOTES_DATA: Partial<StudyNotesData> = {
  language: 'english',
  templateStyle: 'modern',
  showHeader: true,
  showFooter: true,
  showPageNumbers: true,
  showTableOfContents: false,
  showKeyPoints: true,
  showFormulas: true,
  showDiagrams: true,
  showExamples: true,
  showPracticeQuestions: true,
  showRevisionSection: true,
  fontSize: 'medium',
  paperSize: 'A4',
  orientation: 'portrait',
  purpose: 'class-notes',
  completionStatus: 'not-started',
  confidenceLevel: 'low',
};

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA - PRIMARY SCHOOL (Class 5 - EVS)
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_PRIMARY_NOTES: StudyNotesData = {
  title: 'The Solar System',
  subtitle: 'Our Cosmic Neighborhood',
  subject: 'Environmental Studies (EVS)',
  subjectCategory: 'science',
  specificSubject: 'General Science',
  topic: 'The Solar System',
  subtopic: 'Planets and their features',
  chapter: 'Chapter 8: The Sky Above Us',
  chapterNumber: 8,
  
  educationLevel: 'primary',
  class: 'Class 5',
  board: 'cbse',
  academicYear: '2024-25',
  language: 'english',
  
  introduction: 'Have you ever looked up at the night sky and wondered about the twinkling stars? Our Earth is part of a big family called the Solar System. Let\'s learn about our cosmic neighborhood!',
  
  summary: 'The Solar System consists of the Sun and everything that orbits around it, including 8 planets, moons, asteroids, and comets. The Sun is a star at the center, and planets revolve around it in fixed paths called orbits.',
  
  keyPoints: [
    { point: 'The Sun is a star, not a planet', importance: 'critical' },
    { point: 'There are 8 planets in our Solar System', importance: 'critical' },
    { point: 'Planets revolve around the Sun in orbits', importance: 'important' },
    { point: 'Earth is the only planet known to have life', importance: 'important' },
    { point: 'Jupiter is the largest planet', importance: 'moderate' },
    { point: 'Mercury is the smallest planet', importance: 'moderate' },
  ],
  
  definitions: [
    { term: 'Planet', meaning: 'A large round object that moves around a star', example: 'Earth, Mars, Jupiter', hindiMeaning: 'ग्रह' },
    { term: 'Star', meaning: 'A ball of hot gas that gives light and heat', example: 'The Sun', hindiMeaning: 'तारा' },
    { term: 'Orbit', meaning: 'The path a planet takes around the Sun', hindiMeaning: 'कक्षा' },
    { term: 'Moon', meaning: 'A natural object that moves around a planet', example: 'Earth has one moon', hindiMeaning: 'चंद्रमा' },
    { term: 'Solar System', meaning: 'The Sun and all objects that orbit around it', hindiMeaning: 'सौर मंडल' },
  ],
  
  mnemonics: [
    { 
      topic: 'Order of Planets', 
      mnemonic: 'My Very Educated Mother Just Showed Us Neptune', 
      explanation: 'First letter of each word = First letter of planet name',
      items: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']
    },
  ],
  
  bulletPoints: [
    'The Sun is at the center of our Solar System',
    'Mercury is closest to the Sun',
    'Neptune is farthest from the Sun',
    'Saturn has beautiful rings made of ice and rock',
    'Mars is called the Red Planet',
    'Venus is the hottest planet',
  ],
  
  practiceQuestions: [
    { question: 'How many planets are in our Solar System?', type: 'short-answer', correctAnswer: '8 planets', marks: 1 },
    { question: 'Which is the largest planet?', type: 'short-answer', correctAnswer: 'Jupiter', marks: 1 },
    { question: 'Why is Earth special?', type: 'short-answer', correctAnswer: 'It is the only planet with life', marks: 2 },
    { question: 'Name all planets in order from the Sun.', type: 'long-answer', marks: 4 },
  ],
  
  assignments: [
    {
      title: 'Solar System Model',
      description: 'Create a model of the Solar System using clay or thermocol balls',
      questions: [],
      instructions: ['Show all 8 planets', 'Label each planet', 'Show the Sun at center', 'Use different colors for each planet'],
    }
  ],
  
  difficulty: 'easy',
  importance: 'important',
  estimatedTime: '45 minutes',
  
  templateStyle: 'colorful',
  showHeader: true,
  showKeyPoints: true,
  showDiagrams: true,
  purpose: 'class-notes',
};

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA - JEE PHYSICS (Class 11-12)
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_JEE_PHYSICS_NOTES: StudyNotesData = {
  title: 'Newton\'s Laws of Motion',
  subtitle: 'Complete JEE Preparation Notes',
  subject: 'Physics',
  subjectCategory: 'science',
  specificSubject: 'Physics',
  topic: 'Laws of Motion',
  subtopic: 'Newton\'s Three Laws',
  chapter: 'Chapter 5: Laws of Motion',
  chapterNumber: 5,
  unit: 'Unit 2: Mechanics',
  unitNumber: 2,
  
  educationLevel: 'higher-secondary',
  class: 'Class 11',
  board: 'cbse',
  targetExam: 'jee-main',
  examYear: '2025',
  weightage: '6-8% of paper (Very Important)',
  language: 'english',
  
  introduction: 'Newton\'s Laws of Motion form the foundation of classical mechanics. These laws describe the relationship between forces acting on a body and its motion. Understanding these laws is crucial for JEE as they connect to almost every topic in mechanics.',
  
  summary: 'Newton gave three laws: (1) Law of Inertia - body continues its state unless external force acts, (2) F = ma - force equals mass times acceleration, (3) Action-Reaction - every action has equal and opposite reaction. These laws are valid in inertial frames and form the basis of solving mechanics problems.',
  
  keyPoints: [
    { point: 'First Law defines inertia and inertial frames', importance: 'critical', examRelevance: 'Conceptual MCQs' },
    { point: 'F = dp/dt is the general form of Second Law', importance: 'critical', examRelevance: 'Numerical problems' },
    { point: 'Third Law: Action and Reaction act on DIFFERENT bodies', importance: 'critical', examRelevance: 'Common mistake in exams' },
    { point: 'Pseudo force = -ma (in non-inertial frame)', importance: 'important', examRelevance: 'JEE Advanced level' },
    { point: 'Free Body Diagram (FBD) is essential for problem solving', importance: 'critical', examRelevance: 'Every numerical' },
  ],
  
  definitions: [
    { term: 'Inertia', meaning: 'Property of a body to resist change in its state of motion', example: 'Passengers jerk forward when bus stops suddenly' },
    { term: 'Force', meaning: 'An interaction that changes or tends to change the state of motion of a body', example: 'Push, pull, friction, gravity' },
    { term: 'Momentum', meaning: 'Product of mass and velocity (p = mv)', example: 'A truck has more momentum than a car at same speed' },
    { term: 'Inertial Frame', meaning: 'A frame of reference where Newton\'s first law is valid', example: 'Earth (approximately), train moving at constant velocity' },
    { term: 'Pseudo Force', meaning: 'Fictitious force added in non-inertial frames to apply Newton\'s laws', example: 'Centrifugal force in rotating frame' },
  ],
  
  laws: [
    {
      name: 'Newton\'s First Law (Law of Inertia)',
      statement: 'A body continues in its state of rest or uniform motion in a straight line unless acted upon by an external force.',
      conditions: ['Valid only in inertial reference frames'],
      applications: ['Explains why we need seatbelts', 'Basis of concept of inertia'],
      examples: ['Ball rolling on frictionless surface continues forever'],
    },
    {
      name: 'Newton\'s Second Law',
      statement: 'The rate of change of momentum of a body is directly proportional to the applied force and takes place in the direction of the force.',
      conditions: ['Mass must be constant for F = ma form', 'Valid in inertial frames'],
      applications: ['All force calculations', 'Rocket propulsion (variable mass)'],
    },
    {
      name: 'Newton\'s Third Law',
      statement: 'To every action, there is an equal and opposite reaction.',
      conditions: ['Action and reaction act on different bodies', 'Both forces are of same type'],
      applications: ['Walking', 'Swimming', 'Rocket propulsion'],
    },
  ],
  
  formulas: [
    { 
      name: 'Newton\'s Second Law', 
      formula: 'F = ma', 
      description: 'Force equals mass times acceleration',
      variables: [
        { symbol: 'F', name: 'Force', unit: 'Newton (N)' },
        { symbol: 'm', name: 'Mass', unit: 'kg' },
        { symbol: 'a', name: 'Acceleration', unit: 'm/s²' },
      ],
      conditions: 'Valid when mass is constant',
    },
    { 
      name: 'General form of Second Law', 
      formula: 'F = dp/dt', 
      description: 'Force is rate of change of momentum',
      variables: [
        { symbol: 'F', name: 'Force', unit: 'N' },
        { symbol: 'p', name: 'Momentum', unit: 'kg·m/s' },
        { symbol: 't', name: 'Time', unit: 's' },
      ],
      conditions: 'Valid even for variable mass systems',
    },
    { 
      name: 'Momentum', 
      formula: 'p = mv', 
      description: 'Linear momentum',
      variables: [
        { symbol: 'p', name: 'Momentum', unit: 'kg·m/s' },
        { symbol: 'm', name: 'Mass', unit: 'kg' },
        { symbol: 'v', name: 'Velocity', unit: 'm/s' },
      ],
    },
    { 
      name: 'Impulse', 
      formula: 'J = FΔt = Δp', 
      description: 'Impulse equals change in momentum',
      applications: ['Catching a ball', 'Car airbags', 'Cricket bat hitting ball'],
    },
    { 
      name: 'Pseudo Force', 
      formula: 'F_pseudo = -ma₀', 
      description: 'Force in non-inertial frame',
      variables: [
        { symbol: 'a₀', name: 'Acceleration of frame', unit: 'm/s²' },
      ],
      conditions: 'Add this when working in accelerating frame',
    },
  ],
  
  solvedNumericals: [
    {
      question: 'A block of mass 5 kg is placed on a frictionless surface. A force of 20 N is applied horizontally. Find the acceleration.',
      solution: 'Using F = ma:\na = F/m = 20/5 = 4 m/s²',
      steps: ['Given: m = 5 kg, F = 20 N', 'Using F = ma', 'a = F/m = 20/5', 'a = 4 m/s²'],
      answer: '4 m/s²',
      difficulty: 'easy',
      marks: 2,
    },
    {
      question: 'Two blocks of masses 2 kg and 3 kg are connected by a string and placed on a frictionless table. A force of 25 N is applied on the 3 kg block. Find: (a) acceleration of system (b) tension in string.',
      solution: 'System acceleration: a = F/(m₁+m₂) = 25/5 = 5 m/s². For 2 kg block: T = m₁a = 2×5 = 10 N',
      steps: [
        'Total mass = 2 + 3 = 5 kg',
        'a = F/total mass = 25/5 = 5 m/s²',
        'For 2 kg block, only tension acts',
        'T = m₁ × a = 2 × 5 = 10 N'
      ],
      answer: '(a) 5 m/s², (b) 10 N',
      difficulty: 'medium',
      marks: 4,
    },
  ],
  
  shortcuts: [
    { topic: 'Connected Bodies', shortcut: 'System approach: a = (Net external force)/(Total mass)', explanation: 'Treat all connected bodies as one system' },
    { topic: 'Pulley Problems', shortcut: 'For Atwood machine: a = (m₁-m₂)g/(m₁+m₂)', explanation: 'Direct formula for two masses over pulley' },
  ],
  
  commonMistakes: [
    'Forgetting that action-reaction pairs act on DIFFERENT bodies',
    'Not drawing complete Free Body Diagram',
    'Confusing mass and weight',
    'Forgetting pseudo force in non-inertial frames',
    'Taking wrong direction for friction force',
  ],
  
  previousYearQuestions: [
    { question: 'A body of mass 2 kg travels according to equation x = t + 3t². Find force acting on it.', type: 'numerical', year: '2023', examName: 'JEE Main', marks: 4 },
    { question: 'Explain why Newton\'s laws are not valid in rotating frame of reference.', type: 'short-answer', year: '2022', examName: 'JEE Main' },
  ],
  
  quickRevision: [
    { point: 'F = ma (constant mass)', category: 'Formula' },
    { point: 'F = dp/dt (variable mass)', category: 'Formula' },
    { point: 'Action-Reaction on DIFFERENT bodies', category: 'Concept' },
    { point: 'Pseudo force = -ma₀ in non-inertial frame', category: 'Formula' },
    { point: 'Always draw FBD before solving', category: 'Tip' },
  ],
  
  examTips: [
    'Always start by drawing a clear Free Body Diagram',
    'Identify the system and frame of reference first',
    'Check if frame is inertial or non-inertial',
    'Use component method for inclined plane problems',
    'Verify answer using dimensional analysis',
  ],
  
  difficulty: 'medium',
  importance: 'critical',
  estimatedTime: '3 hours',
  prerequisites: ['Vectors', 'Kinematics', 'Basic calculus'],
  relatedTopics: ['Friction', 'Circular Motion', 'Work-Energy Theorem', 'Momentum Conservation'],
  
  ncertReference: 'Class 11 Physics, Chapter 5, Page 89-112',
  textbooks: ['HC Verma Vol 1 - Chapter 5', 'DC Pandey Mechanics', 'Irodov Problems'],
  
  templateStyle: 'exam-focused',
  showHeader: true,
  showFormulas: true,
  showPracticeQuestions: true,
  showRevisionSection: true,
  purpose: 'exam-prep',
};

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA - UPSC HISTORY
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_UPSC_HISTORY_NOTES: StudyNotesData = {
  title: 'The Mughal Empire',
  subtitle: 'Complete UPSC Notes - Medieval Indian History',
  subject: 'History',
  subjectCategory: 'social-science',
  specificSubject: 'History',
  topic: 'Mughal Empire',
  subtopic: 'Administration, Culture & Decline',
  
  educationLevel: 'competitive',
  targetExam: 'upsc-cse',
  examYear: '2025',
  syllabusTopic: 'Medieval Indian History',
  weightage: '2-3 questions in Prelims, 1 question in Mains (15-20 marks)',
  language: 'english',
  
  introduction: 'The Mughal Empire (1526-1857) was one of the largest and most powerful empires in Indian history. Founded by Babur, it reached its zenith under Akbar and Shah Jahan before declining after Aurangzeb. Understanding the Mughal period is crucial for UPSC as it connects to administration, art, culture, and socio-economic conditions.',
  
  summary: 'The Mughal Empire was established by Babur in 1526 after the First Battle of Panipat. The empire saw consolidation under Akbar (1556-1605) who introduced administrative reforms like Mansabdari system and promoted religious tolerance (Sulh-i-kul). The empire reached cultural peak under Shah Jahan (Taj Mahal) but overextended under Aurangzeb (1658-1707). Post-Aurangzeb, the empire rapidly declined due to weak successors, Maratha rise, and colonial interventions.',
  
  timeline: [
    { year: '1526', event: 'First Battle of Panipat', description: 'Babur defeats Ibrahim Lodi, establishes Mughal Empire', significance: 'Beginning of Mughal rule in India' },
    { year: '1527', event: 'Battle of Khanwa', description: 'Babur defeats Rana Sanga', significance: 'Consolidated Mughal power against Rajputs' },
    { year: '1556', event: 'Second Battle of Panipat', description: 'Akbar defeats Hemu', significance: 'Akbar secures throne, begins expansion' },
    { year: '1576', event: 'Battle of Haldighati', description: 'Akbar vs Rana Pratap', significance: 'Mughal expansion into Mewar' },
    { year: '1600', event: 'East India Company formed', significance: 'Beginning of British commercial presence' },
    { year: '1658', event: 'Aurangzeb becomes emperor', description: 'After War of Succession', significance: 'Beginning of orthodox policies' },
    { year: '1707', event: 'Death of Aurangzeb', significance: 'Beginning of Mughal decline' },
    { year: '1739', event: 'Nadir Shah\'s invasion', description: 'Sack of Delhi, takes Peacock Throne', significance: 'Exposed Mughal weakness' },
    { year: '1857', event: 'Revolt of 1857', description: 'Bahadur Shah Zafar declared leader', significance: 'End of Mughal Empire' },
  ],
  
  historicalFigures: [
    { name: 'Babur', lifespan: '1483-1530', title: 'Founder of Mughal Empire', contributions: ['Introduced gunpowder warfare', 'Wrote Baburnama'], famousFor: 'Establishing Mughal rule in India' },
    { name: 'Akbar', lifespan: '1542-1605', title: 'Greatest Mughal Emperor', contributions: ['Mansabdari system', 'Din-i-Ilahi', 'Sulh-i-kul policy', 'Revenue reforms'], famousFor: 'Religious tolerance and administrative genius' },
    { name: 'Shah Jahan', lifespan: '1592-1666', title: 'Builder Emperor', contributions: ['Taj Mahal', 'Red Fort', 'Jama Masjid'], famousFor: 'Architectural achievements' },
    { name: 'Aurangzeb', lifespan: '1618-1707', title: 'Last Great Mughal', contributions: ['Maximum territorial extent', 'Reimposed Jizya'], famousFor: 'Orthodox policies and long reign' },
  ],
  
  keyPoints: [
    { point: 'Mansabdari System: Ranking system for military and civil officials', importance: 'critical', examRelevance: 'Frequently asked' },
    { point: 'Jagirdari System: Land revenue assignment to mansabdars', importance: 'critical' },
    { point: 'Sulh-i-kul: Akbar\'s policy of peace with all religions', importance: 'important' },
    { point: 'Din-i-Ilahi: Akbar\'s syncretic religion (1582)', importance: 'moderate' },
    { point: 'Zabt System: Todar Mal\'s land revenue system', importance: 'important' },
    { point: 'Jizya: Tax on non-Muslims, abolished by Akbar, reimposed by Aurangzeb', importance: 'critical' },
  ],
  
  definitions: [
    { term: 'Mansab', meaning: 'A rank in the Mughal military-administrative system', hindiMeaning: 'मनसब' },
    { term: 'Jagir', meaning: 'Land assignment given to mansabdars in lieu of salary', hindiMeaning: 'जागीर' },
    { term: 'Khalisa', meaning: 'Crown lands directly under emperor', hindiMeaning: 'खालिसा' },
    { term: 'Jizya', meaning: 'Tax levied on non-Muslims', hindiMeaning: 'जजिया' },
    { term: 'Farman', meaning: 'Royal decree or order', hindiMeaning: 'फरमान' },
    { term: 'Diwan', meaning: 'Finance minister or revenue department', hindiMeaning: 'दीवान' },
  ],
  
  causes: [
    'Weak successors after Aurangzeb',
    'Depletion of treasury due to Deccan wars',
    'Rise of regional powers (Marathas, Sikhs, Rajputs)',
    'Jagirdari crisis - not enough jagirs for mansabdars',
    'Aurangzeb\'s religious policies alienated Hindus',
    'Foreign invasions (Nadir Shah, Ahmad Shah Abdali)',
    'Rise of British power',
  ],
  
  effects: [
    'Rise of successor states (Awadh, Bengal, Hyderabad)',
    'Maratha Confederacy became dominant power',
    'British expansion accelerated',
    'Political fragmentation of India',
    'Cultural and artistic decline',
  ],
  
  previousYearQuestions: [
    { question: 'Examine the role of Akbar\'s Rajput policy in the consolidation of Mughal Empire.', type: 'long-answer', year: '2022', examName: 'UPSC Mains', marks: 15 },
    { question: 'The Mughal-Maratha conflict was not merely political but had economic dimensions. Discuss.', type: 'long-answer', year: '2021', examName: 'UPSC Mains', marks: 15 },
    { question: 'Mansabdari system was introduced by:', type: 'mcq', options: ['Babur', 'Akbar', 'Shah Jahan', 'Aurangzeb'], correctAnswer: 'Akbar', year: '2020', examName: 'UPSC Prelims' },
  ],
  
  quickRevision: [
    { point: 'Babur: 1526, First Battle of Panipat', category: 'Timeline' },
    { point: 'Akbar: Mansabdari, Sulh-i-kul, Din-i-Ilahi', category: 'Key Points' },
    { point: 'Shah Jahan: Taj Mahal, Red Fort', category: 'Architecture' },
    { point: 'Aurangzeb: Jizya reimposed, Deccan campaigns', category: 'Key Points' },
    { point: '1707: Death of Aurangzeb = Beginning of decline', category: 'Timeline' },
  ],
  
  oneLiners: [
    'Babur founded the Mughal Empire in 1526',
    'Akbar introduced the Mansabdari system',
    'Todar Mal introduced the Zabt system of land revenue',
    'Din-i-Ilahi was founded by Akbar in 1582',
    'Aurangzeb was the last great Mughal emperor',
    'Nadir Shah took the Peacock Throne in 1739',
    'The Mughal Empire formally ended in 1857',
  ],
  
  examTips: [
    'Focus on administrative systems for Prelims',
    'For Mains, analyze cause-effect relationships',
    'Remember cultural contributions (architecture, painting)',
    'Connect Mughal decline with rise of British power',
    'Know important battles and their significance',
  ],
  
  difficulty: 'medium',
  importance: 'critical',
  estimatedTime: '4-5 hours',
  prerequisites: ['Delhi Sultanate', 'Bhakti Movement', 'Medieval Economy'],
  relatedTopics: ['Maratha Empire', 'British Expansion', 'Medieval Art & Architecture'],
  
  textbooks: ['NCERT Class 7 & 12', 'Medieval India by Satish Chandra', 'Advanced Study in History of Medieval India by J.L. Mehta'],
  
  templateStyle: 'exam-focused',
  showHeader: true,
  showKeyPoints: true,
  showRevisionSection: true,
  purpose: 'exam-prep',
};

