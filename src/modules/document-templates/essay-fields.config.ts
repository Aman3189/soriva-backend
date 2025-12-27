// ═══════════════════════════════════════════════════════════════════════════════
// SORIVA - ESSAY FIELDS CONFIGURATION
// Comprehensive Field Definitions for Essay Document Templates
// Supports: Academic, Argumentative, Narrative, Descriptive, Expository, Persuasive
// "BUFFET STYLE" - All fields available, user picks what they need!
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────────
// SECTION 1: TYPE DEFINITIONS & ENUMS
// ─────────────────────────────────────────────────────────────────────────────────

export type EssayType =
  | 'academic'
  | 'argumentative'
  | 'narrative'
  | 'descriptive'
  | 'expository'
  | 'persuasive'
  | 'compare-contrast'
  | 'cause-effect'
  | 'problem-solution'
  | 'definition'
  | 'process'
  | 'reflective'
  | 'critical-analysis'
  | 'research'
  | 'opinion';

export type EssayStyle =
  | 'academic'
  | 'argumentative'
  | 'narrative'
  | 'descriptive'
  | 'expository'
  | 'persuasive';

export type CitationStyle =
  | 'APA'
  | 'MLA'
  | 'Chicago'
  | 'Harvard'
  | 'IEEE'
  | 'AMA'
  | 'Vancouver'
  | 'Turabian'
  | 'OSCOLA'
  | 'None';

export type EducationLevel =
  | 'high-school'
  | 'undergraduate'
  | 'postgraduate'
  | 'doctoral'
  | 'professional'
  | 'competitive-exam';

export type AcademicDiscipline =
  | 'humanities'
  | 'social-sciences'
  | 'natural-sciences'
  | 'formal-sciences'
  | 'applied-sciences'
  | 'arts'
  | 'business'
  | 'law'
  | 'medicine'
  | 'engineering'
  | 'general';

export type ToneType =
  | 'formal'
  | 'semi-formal'
  | 'informal'
  | 'academic'
  | 'conversational'
  | 'persuasive'
  | 'analytical'
  | 'reflective'
  | 'objective'
  | 'subjective';

export type ArgumentStrength =
  | 'strong'
  | 'moderate'
  | 'weak';

export type EvidenceType =
  | 'statistical'
  | 'anecdotal'
  | 'expert-opinion'
  | 'research-finding'
  | 'historical'
  | 'case-study'
  | 'survey'
  | 'observation'
  | 'quote'
  | 'example';

export type NarrativePerspective =
  | 'first-person'
  | 'second-person'
  | 'third-person-limited'
  | 'third-person-omniscient';

export type FieldCategory =
  | 'metadata'
  | 'author'
  | 'content'
  | 'introduction'
  | 'body'
  | 'conclusion'
  | 'arguments'
  | 'narrative'
  | 'descriptive'
  | 'references'
  | 'formatting'
  | 'settings';

export type FieldLevel =
  | 'high-school'
  | 'undergraduate'
  | 'postgraduate'
  | 'professional'
  | 'all';

// ─────────────────────────────────────────────────────────────────────────────────
// SECTION 2: SUPPORTING INTERFACES
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Body Paragraph Structure
 * Supports all essay types with flexible fields
 */
export interface BodyParagraph {
  paragraphNumber: number;
  topic: string;
  topicSentence: string;
  supportingPoints: string[];
  evidence?: Evidence[];
  analysis: string;
  transition?: string;
  // For argumentative essays
  argument?: string;
  counterPoint?: string;
  rebuttal?: string;
}

/**
 * Evidence/Citation Structure
 */
export interface Evidence {
  type: EvidenceType;
  content: string;
  source?: string;
  author?: string;
  year?: number;
  pageNumber?: string;
  url?: string;
  explanation?: string;
  strength?: ArgumentStrength;
}

/**
 * Citation/Reference Entry
 */
export interface Citation {
  id: string;
  type: 'book' | 'journal' | 'website' | 'newspaper' | 'magazine' | 'video' | 'interview' | 'report' | 'thesis' | 'conference' | 'other';
  authors: string[];
  title: string;
  year: number;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;
  accessDate?: string;
  doi?: string;
  isbn?: string;
  edition?: string;
  city?: string;
}

/**
 * Counter Argument Structure (for Argumentative Essays)
 */
export interface CounterArgument {
  point: string;
  source?: string;
  rebuttal: string;
  rebuttalEvidence?: Evidence[];
}

/**
 * Narrative Element (for Narrative Essays)
 */
export interface NarrativeElement {
  setting?: {
    time: string;
    place: string;
    atmosphere: string;
  };
  characters?: Array<{
    name: string;
    role: 'protagonist' | 'antagonist' | 'supporting' | 'narrator';
    description: string;
  }>;
  plot?: {
    exposition: string;
    risingAction: string[];
    climax: string;
    fallingAction: string[];
    resolution: string;
  };
  conflict?: {
    type: 'internal' | 'external' | 'person-vs-person' | 'person-vs-nature' | 'person-vs-society' | 'person-vs-self';
    description: string;
  };
  theme?: string;
  lesson?: string;
}

/**
 * Descriptive Element (for Descriptive Essays)
 */
export interface DescriptiveElement {
  subject: string;
  sensoryDetails: {
    sight?: string[];
    sound?: string[];
    smell?: string[];
    taste?: string[];
    touch?: string[];
  };
  figurativeLanguage?: Array<{
    type: 'simile' | 'metaphor' | 'personification' | 'hyperbole' | 'alliteration' | 'onomatopoeia' | 'imagery';
    example: string;
  }>;
  mood?: string;
  dominantImpression?: string;
}

/**
 * Compare/Contrast Structure
 */
export interface CompareContrastElement {
  subject1: {
    name: string;
    characteristics: string[];
  };
  subject2: {
    name: string;
    characteristics: string[];
  };
  similarities: string[];
  differences: string[];
  organizationMethod: 'point-by-point' | 'block' | 'mixed';
}

/**
 * Cause/Effect Structure
 */
export interface CauseEffectElement {
  causes: Array<{
    cause: string;
    explanation: string;
    evidence?: string;
  }>;
  effects: Array<{
    effect: string;
    explanation: string;
    evidence?: string;
  }>;
  chainReaction?: boolean;
  organizationMethod: 'causes-then-effects' | 'effects-then-causes' | 'causal-chain';
}

/**
 * Problem/Solution Structure
 */
export interface ProblemSolutionElement {
  problem: {
    statement: string;
    background: string;
    scope: string;
    impact: string[];
    stakeholders: string[];
  };
  solutions: Array<{
    solution: string;
    implementation: string;
    advantages: string[];
    disadvantages: string[];
    feasibility: 'high' | 'medium' | 'low';
  }>;
  recommendedSolution?: string;
  callToAction?: string;
}

/**
 * Introduction Structure
 */
export interface IntroductionSection {
  hook: string;
  hookType?: 'question' | 'quote' | 'statistic' | 'anecdote' | 'definition' | 'bold-statement' | 'scene-setting';
  background: string;
  context?: string;
  significance?: string;
  thesis: string;
  roadmap?: string;
}

/**
 * Conclusion Structure
 */
export interface ConclusionSection {
  restatedThesis: string;
  summary: string[];
  synthesis?: string;
  implications?: string;
  recommendations?: string[];
  finalThought: string;
  callToAction?: string;
  futureDirections?: string;
  memorableEnding?: string;
}

/**
 * Outline Item
 */
export interface OutlineItem {
  level: number;
  label: string;
  content: string;
  subItems?: OutlineItem[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// SECTION 3: MAIN ESSAY DATA INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────

export interface EssayData {
  // ═══════════════════════════════════════════════════════════════
  // SECTION A: METADATA
  // ═══════════════════════════════════════════════════════════════
  title: string;
  subtitle?: string;
  essayType: EssayType;
  academicDiscipline?: AcademicDiscipline;
  topic?: string;
  keywords?: string[];
  
  // Academic Context
  course?: string;
  courseCode?: string;
  assignmentNumber?: string;
  semester?: string;
  academicYear?: string;
  educationLevel?: EducationLevel;
  
  // Dates
  date: string;
  dueDate?: string;
  submissionDate?: string;

  // ═══════════════════════════════════════════════════════════════
  // SECTION B: AUTHOR INFORMATION
  // ═══════════════════════════════════════════════════════════════
  author: string;
  authorId?: string;
  rollNumber?: string;
  class?: string;
  section?: string;
  
  // Institution
  institution?: string;
  department?: string;
  faculty?: string;
  
  // Instructor/Guide
  instructor?: string;
  instructorTitle?: string;
  
  // Co-authors (for group assignments)
  coAuthors?: Array<{
    name: string;
    rollNumber?: string;
    contribution?: string;
  }>;

  // ═══════════════════════════════════════════════════════════════
  // SECTION C: ABSTRACT & SUMMARY (Academic Essays)
  // ═══════════════════════════════════════════════════════════════
  abstract?: string;
  executiveSummary?: string;
  synopsis?: string;

  // ═══════════════════════════════════════════════════════════════
  // SECTION D: INTRODUCTION
  // ═══════════════════════════════════════════════════════════════
  introduction: IntroductionSection;

  // ═══════════════════════════════════════════════════════════════
  // SECTION E: BODY CONTENT
  // ═══════════════════════════════════════════════════════════════
  thesis: string;
  bodyParagraphs: BodyParagraph[];
  
  // Outline (optional, for planning)
  outline?: OutlineItem[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION F: ESSAY TYPE SPECIFIC CONTENT
  // ═══════════════════════════════════════════════════════════════
  
  // For Argumentative Essays
  argumentative?: {
    mainArgument: string;
    supportingArguments: Array<{
      argument: string;
      evidence: Evidence[];
      analysis: string;
    }>;
    counterArguments: CounterArgument[];
    rebuttals: string[];
    logicalAppeals?: string[];  // Logos
    emotionalAppeals?: string[];  // Pathos
    credibilityAppeals?: string[];  // Ethos
  };

  // For Narrative Essays
  narrative?: NarrativeElement;
  
  // For Descriptive Essays
  descriptive?: DescriptiveElement;
  
  // For Compare/Contrast Essays
  compareContrast?: CompareContrastElement;
  
  // For Cause/Effect Essays
  causeEffect?: CauseEffectElement;
  
  // For Problem/Solution Essays
  problemSolution?: ProblemSolutionElement;

  // ═══════════════════════════════════════════════════════════════
  // SECTION G: CONCLUSION
  // ═══════════════════════════════════════════════════════════════
  conclusion: ConclusionSection;

  // ═══════════════════════════════════════════════════════════════
  // SECTION H: REFERENCES & CITATIONS
  // ═══════════════════════════════════════════════════════════════
  citationStyle: CitationStyle;
  citations?: Citation[];
  bibliography?: string[];
  footnotes?: Array<{
    number: number;
    content: string;
  }>;
  endnotes?: Array<{
    number: number;
    content: string;
  }>;
  inTextCitations?: Array<{
    marker: string;
    citationId: string;
  }>;

  // ═══════════════════════════════════════════════════════════════
  // SECTION I: APPENDICES & SUPPLEMENTARY
  // ═══════════════════════════════════════════════════════════════
  appendices?: Array<{
    label: string;
    title: string;
    content: string;
  }>;
  figures?: Array<{
    number: number;
    title: string;
    description: string;
    source?: string;
  }>;
  tables?: Array<{
    number: number;
    title: string;
    headers: string[];
    rows: string[][];
    source?: string;
  }>;

  // ═══════════════════════════════════════════════════════════════
  // SECTION J: FORMATTING & DISPLAY OPTIONS
  // ═══════════════════════════════════════════════════════════════
  templateStyle: EssayStyle;
  tone?: ToneType;
  perspective?: NarrativePerspective;
  
  // Word/Page Count
  wordCount?: number;
  targetWordCount?: number;
  pageCount?: number;
  
  // Display Options
  showTitle?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  showAbstract?: boolean;
  showTableOfContents?: boolean;
  showWordCount?: boolean;
  showPageNumbers?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  showBibliography?: boolean;
  
  // Typography
  fontSize?: 'small' | 'medium' | 'large';
  fontFamily?: 'serif' | 'sans-serif' | 'mono';
  lineSpacing?: 'single' | '1.5' | 'double';
  paragraphIndent?: boolean;
  justifyText?: boolean;
  
  // Page Setup
  paperSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margins?: 'narrow' | 'normal' | 'wide';
  
  // Header/Footer Content
  headerText?: string;
  footerText?: string;
  runningHead?: string;  // For APA style
  
  // Colors (for styled templates)
  accentColor?: string;
  headerColor?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────
// SECTION 4: FIELD DEFINITION INTERFACE
// ─────────────────────────────────────────────────────────────────────────────────

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
  minLength?: number;
  options?: string[];
  hint?: string;
  hintHi?: string;
  essayTypeRelevance?: EssayType[];
}

// ─────────────────────────────────────────────────────────────────────────────────
// SECTION 5: FIELD DEFINITIONS ARRAY
// ─────────────────────────────────────────────────────────────────────────────────

export const ESSAY_FIELDS: FieldDefinition[] = [
  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: METADATA
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'title',
    label: 'Essay Title',
    labelHi: 'निबंध का शीर्षक',
    type: 'text',
    required: true,
    category: 'metadata',
    level: ['all'],
    placeholder: 'The Impact of Social Media on Modern Communication',
    placeholderHi: 'आधुनिक संचार पर सोशल मीडिया का प्रभाव',
    hint: 'Clear, specific title that reflects your thesis',
    hintHi: 'स्पष्ट, विशिष्ट शीर्षक जो आपकी थीसिस को दर्शाता हो',
    maxLength: 200
  },
  {
    key: 'subtitle',
    label: 'Subtitle',
    labelHi: 'उपशीर्षक',
    type: 'text',
    required: false,
    category: 'metadata',
    level: ['undergraduate', 'postgraduate', 'professional'],
    placeholder: 'A Critical Analysis of Digital Communication Patterns',
    placeholderHi: 'डिजिटल संचार पैटर्न का एक आलोचनात्मक विश्लेषण',
    maxLength: 150
  },
  {
    key: 'essayType',
    label: 'Essay Type',
    labelHi: 'निबंध का प्रकार',
    type: 'select',
    required: true,
    category: 'metadata',
    level: ['all'],
    options: [
      'Academic',
      'Argumentative',
      'Narrative',
      'Descriptive',
      'Expository',
      'Persuasive',
      'Compare & Contrast',
      'Cause & Effect',
      'Problem & Solution',
      'Definition',
      'Process',
      'Reflective',
      'Critical Analysis',
      'Research',
      'Opinion'
    ],
    hint: 'Select the type that best matches your essay structure',
    hintHi: 'अपनी निबंध संरचना से मेल खाने वाला प्रकार चुनें'
  },
  {
    key: 'academicDiscipline',
    label: 'Academic Discipline',
    labelHi: 'शैक्षणिक विषय',
    type: 'select',
    required: false,
    category: 'metadata',
    level: ['undergraduate', 'postgraduate', 'professional'],
    options: [
      'Humanities',
      'Social Sciences',
      'Natural Sciences',
      'Formal Sciences',
      'Applied Sciences',
      'Arts',
      'Business',
      'Law',
      'Medicine',
      'Engineering',
      'General'
    ]
  },
  {
    key: 'topic',
    label: 'Topic/Subject',
    labelHi: 'विषय',
    type: 'text',
    required: false,
    category: 'metadata',
    level: ['all'],
    placeholder: 'Social Media and Communication',
    placeholderHi: 'सोशल मीडिया और संचार'
  },
  {
    key: 'keywords',
    label: 'Keywords',
    labelHi: 'कीवर्ड',
    type: 'array',
    required: false,
    category: 'metadata',
    level: ['undergraduate', 'postgraduate', 'professional'],
    placeholder: 'social media, digital communication, technology, society',
    placeholderHi: 'सोशल मीडिया, डिजिटल संचार, प्रौद्योगिकी, समाज',
    hint: 'Comma-separated keywords for indexing',
    hintHi: 'अनुक्रमण के लिए अल्पविराम से अलग किए गए कीवर्ड'
  },
  {
    key: 'course',
    label: 'Course Name',
    labelHi: 'कोर्स का नाम',
    type: 'text',
    required: false,
    category: 'metadata',
    level: ['undergraduate', 'postgraduate'],
    placeholder: 'Introduction to Mass Communication / English Literature',
    placeholderHi: 'जनसंचार का परिचय / अंग्रेजी साहित्य'
  },
  {
    key: 'courseCode',
    label: 'Course Code',
    labelHi: 'कोर्स कोड',
    type: 'text',
    required: false,
    category: 'metadata',
    level: ['undergraduate', 'postgraduate'],
    placeholder: 'COMM 101 / ENG 201'
  },
  {
    key: 'assignmentNumber',
    label: 'Assignment Number',
    labelHi: 'असाइनमेंट नंबर',
    type: 'text',
    required: false,
    category: 'metadata',
    level: ['all'],
    placeholder: 'Assignment 3 / Essay 2'
  },
  {
    key: 'semester',
    label: 'Semester',
    labelHi: 'सेमेस्टर',
    type: 'select',
    required: false,
    category: 'metadata',
    level: ['undergraduate', 'postgraduate'],
    options: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', 'Summer', 'Winter', 'Fall', 'Spring']
  },
  {
    key: 'academicYear',
    label: 'Academic Year',
    labelHi: 'शैक्षणिक वर्ष',
    type: 'text',
    required: false,
    category: 'metadata',
    level: ['all'],
    placeholder: '2024-2025'
  },
  {
    key: 'educationLevel',
    label: 'Education Level',
    labelHi: 'शिक्षा स्तर',
    type: 'select',
    required: false,
    category: 'metadata',
    level: ['all'],
    options: ['High School', 'Undergraduate', 'Postgraduate', 'Doctoral', 'Professional', 'Competitive Exam']
  },
  {
    key: 'date',
    label: 'Date',
    labelHi: 'तारीख',
    type: 'date',
    required: true,
    category: 'metadata',
    level: ['all']
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    labelHi: 'जमा करने की तारीख',
    type: 'date',
    required: false,
    category: 'metadata',
    level: ['all']
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: AUTHOR INFORMATION
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'author',
    label: 'Author Name',
    labelHi: 'लेखक का नाम',
    type: 'text',
    required: true,
    category: 'author',
    level: ['all'],
    placeholder: 'Rahul Sharma / Priya Patel',
    placeholderHi: 'राहुल शर्मा / प्रिया पटेल'
  },
  {
    key: 'rollNumber',
    label: 'Roll Number / Student ID',
    labelHi: 'रोल नंबर / छात्र आईडी',
    type: 'text',
    required: false,
    category: 'author',
    level: ['high-school', 'undergraduate', 'postgraduate'],
    placeholder: '2024/CS/001 / A12345678'
  },
  {
    key: 'class',
    label: 'Class',
    labelHi: 'कक्षा',
    type: 'text',
    required: false,
    category: 'author',
    level: ['high-school'],
    placeholder: 'Class 10 / Class 12 / B.A. 2nd Year'
  },
  {
    key: 'section',
    label: 'Section',
    labelHi: 'सेक्शन',
    type: 'text',
    required: false,
    category: 'author',
    level: ['high-school', 'undergraduate'],
    placeholder: 'A / B / C'
  },
  {
    key: 'institution',
    label: 'Institution / University',
    labelHi: 'संस्थान / विश्वविद्यालय',
    type: 'text',
    required: false,
    category: 'author',
    level: ['all'],
    placeholder: 'Delhi University / IIT Delhi / St. Xavier\'s College',
    placeholderHi: 'दिल्ली विश्वविद्यालय / आईआईटी दिल्ली'
  },
  {
    key: 'department',
    label: 'Department',
    labelHi: 'विभाग',
    type: 'text',
    required: false,
    category: 'author',
    level: ['undergraduate', 'postgraduate', 'professional'],
    placeholder: 'Department of English / Computer Science'
  },
  {
    key: 'instructor',
    label: 'Instructor / Professor',
    labelHi: 'प्रशिक्षक / प्रोफेसर',
    type: 'text',
    required: false,
    category: 'author',
    level: ['all'],
    placeholder: 'Dr. Anil Kumar / Prof. Sunita Verma'
  },
  {
    key: 'instructorTitle',
    label: 'Instructor Title',
    labelHi: 'प्रशिक्षक का पद',
    type: 'select',
    required: false,
    category: 'author',
    level: ['undergraduate', 'postgraduate'],
    options: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Asst. Prof.', 'Assoc. Prof.']
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: ABSTRACT & SUMMARY
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'abstract',
    label: 'Abstract',
    labelHi: 'सारांश',
    type: 'textarea',
    required: false,
    category: 'content',
    level: ['undergraduate', 'postgraduate', 'professional'],
    placeholder: 'A brief summary of your essay (150-300 words)...',
    placeholderHi: 'आपके निबंध का संक्षिप्त सारांश (150-300 शब्द)...',
    hint: 'Include purpose, methodology, key findings, and conclusion',
    hintHi: 'उद्देश्य, पद्धति, मुख्य निष्कर्ष और निष्कर्ष शामिल करें',
    maxLength: 2000,
    essayTypeRelevance: ['academic', 'research', 'critical-analysis']
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: INTRODUCTION
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'hook',
    label: 'Hook / Opening',
    labelHi: 'आकर्षक शुरुआत',
    type: 'textarea',
    required: true,
    category: 'introduction',
    level: ['all'],
    placeholder: 'Did you know that 4.9 billion people use social media worldwide?',
    placeholderHi: 'क्या आप जानते हैं कि दुनिया भर में 4.9 अरब लोग सोशल मीडिया का उपयोग करते हैं?',
    hint: 'Start with a question, quote, statistic, anecdote, or bold statement',
    hintHi: 'प्रश्न, उद्धरण, आंकड़ा, किस्सा या साहसिक कथन से शुरू करें',
    maxLength: 500
  },
  {
    key: 'hookType',
    label: 'Hook Type',
    labelHi: 'हुक का प्रकार',
    type: 'select',
    required: false,
    category: 'introduction',
    level: ['all'],
    options: ['Question', 'Quote', 'Statistic', 'Anecdote', 'Definition', 'Bold Statement', 'Scene Setting', 'Historical Reference']
  },
  {
    key: 'background',
    label: 'Background Information',
    labelHi: 'पृष्ठभूमि जानकारी',
    type: 'textarea',
    required: true,
    category: 'introduction',
    level: ['all'],
    placeholder: 'Social media has revolutionized the way humans communicate...',
    placeholderHi: 'सोशल मीडिया ने मनुष्यों के संवाद करने के तरीके में क्रांति ला दी है...',
    hint: 'Provide context and general information about your topic',
    hintHi: 'अपने विषय के बारे में संदर्भ और सामान्य जानकारी प्रदान करें',
    maxLength: 1000
  },
  {
    key: 'thesis',
    label: 'Thesis Statement',
    labelHi: 'थीसिस कथन',
    type: 'textarea',
    required: true,
    category: 'introduction',
    level: ['all'],
    placeholder: 'While social media has increased connectivity, it has fundamentally altered the quality and depth of human relationships.',
    placeholderHi: 'जबकि सोशल मीडिया ने कनेक्टिविटी बढ़ाई है, इसने मानवीय संबंधों की गुणवत्ता और गहराई को मौलिक रूप से बदल दिया है।',
    hint: 'Your main argument or central claim - the essay\'s backbone',
    hintHi: 'आपका मुख्य तर्क या केंद्रीय दावा - निबंध की रीढ़',
    maxLength: 500
  },
  {
    key: 'roadmap',
    label: 'Essay Roadmap',
    labelHi: 'निबंध रोडमैप',
    type: 'textarea',
    required: false,
    category: 'introduction',
    level: ['undergraduate', 'postgraduate', 'professional'],
    placeholder: 'This essay will first examine..., then analyze..., and finally discuss...',
    placeholderHi: 'यह निबंध पहले... की जांच करेगा, फिर... का विश्लेषण करेगा, और अंत में... पर चर्चा करेगा',
    hint: 'Brief outline of what you\'ll cover (optional for shorter essays)',
    hintHi: 'आप क्या कवर करेंगे इसकी संक्षिप्त रूपरेखा',
    maxLength: 500
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: BODY PARAGRAPHS
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'bodyParagraphs',
    label: 'Body Paragraphs',
    labelHi: 'मुख्य पैराग्राफ',
    type: 'array',
    required: true,
    category: 'body',
    level: ['all'],
    hint: 'Each paragraph should have: topic sentence, evidence, analysis, transition',
    hintHi: 'प्रत्येक पैराग्राफ में होना चाहिए: विषय वाक्य, साक्ष्य, विश्लेषण, संक्रमण'
  },
  {
    key: 'topicSentence',
    label: 'Topic Sentence',
    labelHi: 'विषय वाक्य',
    type: 'textarea',
    required: false,
    category: 'body',
    level: ['all'],
    placeholder: 'One significant impact of social media is the transformation of interpersonal communication.',
    placeholderHi: 'सोशल मीडिया का एक महत्वपूर्ण प्रभाव पारस्परिक संचार का परिवर्तन है।',
    hint: 'The main idea of the paragraph - connects to thesis',
    hintHi: 'पैराग्राफ का मुख्य विचार - थीसिस से जुड़ता है',
    maxLength: 300
  },
  {
    key: 'supportingPoints',
    label: 'Supporting Points',
    labelHi: 'समर्थन बिंदु',
    type: 'array',
    required: false,
    category: 'body',
    level: ['all'],
    hint: 'Facts, examples, and details that support your topic sentence',
    hintHi: 'तथ्य, उदाहरण और विवरण जो आपके विषय वाक्य का समर्थन करते हैं'
  },
  {
    key: 'evidence',
    label: 'Evidence / Examples',
    labelHi: 'साक्ष्य / उदाहरण',
    type: 'array',
    required: false,
    category: 'body',
    level: ['all'],
    hint: 'Statistics, quotes, research findings to support your argument',
    hintHi: 'आपके तर्क का समर्थन करने के लिए आंकड़े, उद्धरण, शोध निष्कर्ष'
  },
  {
    key: 'analysis',
    label: 'Analysis',
    labelHi: 'विश्लेषण',
    type: 'textarea',
    required: false,
    category: 'body',
    level: ['all'],
    placeholder: 'This evidence demonstrates that... This is significant because...',
    placeholderHi: 'यह साक्ष्य दर्शाता है कि... यह महत्वपूर्ण है क्योंकि...',
    hint: 'Your interpretation and explanation of the evidence',
    hintHi: 'साक्ष्य की आपकी व्याख्या और स्पष्टीकरण',
    maxLength: 1000
  },
  {
    key: 'transition',
    label: 'Transition',
    labelHi: 'संक्रमण',
    type: 'text',
    required: false,
    category: 'body',
    level: ['all'],
    placeholder: 'Furthermore... / In addition... / However... / On the other hand...',
    placeholderHi: 'इसके अलावा... / साथ ही... / हालांकि... / दूसरी ओर...',
    hint: 'Words/phrases that connect paragraphs smoothly',
    hintHi: 'शब्द/वाक्यांश जो पैराग्राफ को सुचारू रूप से जोड़ते हैं'
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: ARGUMENTATIVE ESSAY SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'mainArgument',
    label: 'Main Argument',
    labelHi: 'मुख्य तर्क',
    type: 'textarea',
    required: false,
    category: 'arguments',
    level: ['all'],
    placeholder: 'Social media should be regulated to protect mental health.',
    placeholderHi: 'मानसिक स्वास्थ्य की रक्षा के लिए सोशल मीडिया को विनियमित किया जाना चाहिए।',
    hint: 'Your primary claim that you will defend',
    hintHi: 'आपका प्राथमिक दावा जिसका आप बचाव करेंगे',
    essayTypeRelevance: ['argumentative', 'persuasive']
  },
  {
    key: 'counterArgument',
    label: 'Counter Argument',
    labelHi: 'प्रति तर्क',
    type: 'textarea',
    required: false,
    category: 'arguments',
    level: ['all'],
    placeholder: 'Some argue that social media regulation infringes on free speech...',
    placeholderHi: 'कुछ लोग तर्क देते हैं कि सोशल मीडिया विनियमन अभिव्यक्ति की स्वतंत्रता का उल्लंघन करता है...',
    hint: 'Opposing viewpoint to address and refute',
    hintHi: 'विपरीत दृष्टिकोण को संबोधित करने और खंडन करने के लिए',
    essayTypeRelevance: ['argumentative', 'persuasive']
  },
  {
    key: 'rebuttal',
    label: 'Rebuttal',
    labelHi: 'खंडन',
    type: 'textarea',
    required: false,
    category: 'arguments',
    level: ['all'],
    placeholder: 'However, this argument fails to consider that regulations can be designed to...',
    placeholderHi: 'हालांकि, यह तर्क इस बात पर विचार करने में विफल रहता है कि नियमों को इस प्रकार डिज़ाइन किया जा सकता है...',
    hint: 'Your response to the counter argument',
    hintHi: 'प्रति तर्क के लिए आपका जवाब',
    essayTypeRelevance: ['argumentative', 'persuasive']
  },
  {
    key: 'logicalAppeals',
    label: 'Logical Appeals (Logos)',
    labelHi: 'तार्किक अपील (लोगोस)',
    type: 'array',
    required: false,
    category: 'arguments',
    level: ['undergraduate', 'postgraduate'],
    hint: 'Facts, statistics, logical reasoning',
    hintHi: 'तथ्य, आंकड़े, तार्किक तर्क',
    essayTypeRelevance: ['argumentative', 'persuasive']
  },
  {
    key: 'emotionalAppeals',
    label: 'Emotional Appeals (Pathos)',
    labelHi: 'भावनात्मक अपील (पाथोस)',
    type: 'array',
    required: false,
    category: 'arguments',
    level: ['undergraduate', 'postgraduate'],
    hint: 'Appeals to emotions, values, beliefs',
    hintHi: 'भावनाओं, मूल्यों, विश्वासों की अपील',
    essayTypeRelevance: ['argumentative', 'persuasive']
  },
  {
    key: 'credibilityAppeals',
    label: 'Credibility Appeals (Ethos)',
    labelHi: 'विश्वसनीयता अपील (एथोस)',
    type: 'array',
    required: false,
    category: 'arguments',
    level: ['undergraduate', 'postgraduate'],
    hint: 'Expert opinions, authoritative sources',
    hintHi: 'विशेषज्ञ राय, आधिकारिक स्रोत',
    essayTypeRelevance: ['argumentative', 'persuasive']
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: NARRATIVE ESSAY SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'narrativeSetting',
    label: 'Setting',
    labelHi: 'सेटिंग',
    type: 'textarea',
    required: false,
    category: 'narrative',
    level: ['all'],
    placeholder: 'It was a warm summer evening in 2019, in the bustling streets of Mumbai...',
    placeholderHi: '2019 की एक गर्म गर्मी की शाम थी, मुंबई की हलचल भरी सड़कों पर...',
    hint: 'Where and when does your story take place?',
    hintHi: 'आपकी कहानी कहाँ और कब होती है?',
    essayTypeRelevance: ['narrative', 'descriptive']
  },
  {
    key: 'characters',
    label: 'Characters',
    labelHi: 'पात्र',
    type: 'array',
    required: false,
    category: 'narrative',
    level: ['all'],
    hint: 'People involved in your narrative',
    hintHi: 'आपकी कथा में शामिल लोग',
    essayTypeRelevance: ['narrative']
  },
  {
    key: 'plotExposition',
    label: 'Exposition / Beginning',
    labelHi: 'प्रदर्शनी / शुरुआत',
    type: 'textarea',
    required: false,
    category: 'narrative',
    level: ['all'],
    placeholder: 'Introduce your setting, characters, and initial situation...',
    placeholderHi: 'अपनी सेटिंग, पात्रों और प्रारंभिक स्थिति का परिचय दें...',
    essayTypeRelevance: ['narrative']
  },
  {
    key: 'risingAction',
    label: 'Rising Action',
    labelHi: 'बढ़ती क्रिया',
    type: 'array',
    required: false,
    category: 'narrative',
    level: ['all'],
    hint: 'Events that build tension and lead to the climax',
    hintHi: 'ऐसी घटनाएं जो तनाव पैदा करती हैं और चरमोत्कर्ष की ओर ले जाती हैं',
    essayTypeRelevance: ['narrative']
  },
  {
    key: 'climax',
    label: 'Climax',
    labelHi: 'चरमोत्कर्ष',
    type: 'textarea',
    required: false,
    category: 'narrative',
    level: ['all'],
    placeholder: 'The turning point or most intense moment of your story...',
    placeholderHi: 'आपकी कहानी का मोड़ या सबसे तीव्र क्षण...',
    essayTypeRelevance: ['narrative']
  },
  {
    key: 'resolution',
    label: 'Resolution',
    labelHi: 'समाधान',
    type: 'textarea',
    required: false,
    category: 'narrative',
    level: ['all'],
    placeholder: 'How the story concludes and what was learned...',
    placeholderHi: 'कहानी कैसे समाप्त होती है और क्या सीखा गया...',
    essayTypeRelevance: ['narrative']
  },
  {
    key: 'narrativePerspective',
    label: 'Narrative Perspective',
    labelHi: 'कथा परिप्रेक्ष्य',
    type: 'select',
    required: false,
    category: 'narrative',
    level: ['all'],
    options: ['First Person (I/We)', 'Second Person (You)', 'Third Person Limited', 'Third Person Omniscient'],
    essayTypeRelevance: ['narrative']
  },
  {
    key: 'lesson',
    label: 'Lesson / Moral',
    labelHi: 'सबक / नैतिकता',
    type: 'textarea',
    required: false,
    category: 'narrative',
    level: ['all'],
    placeholder: 'What did you learn from this experience?',
    placeholderHi: 'आपने इस अनुभव से क्या सीखा?',
    essayTypeRelevance: ['narrative', 'reflective']
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: DESCRIPTIVE ESSAY SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'descriptiveSubject',
    label: 'Subject to Describe',
    labelHi: 'वर्णन का विषय',
    type: 'text',
    required: false,
    category: 'descriptive',
    level: ['all'],
    placeholder: 'My grandmother\'s kitchen / The Taj Mahal at sunrise',
    placeholderHi: 'मेरी दादी की रसोई / सूर्योदय में ताज महल',
    essayTypeRelevance: ['descriptive']
  },
  {
    key: 'sightDetails',
    label: 'Visual Details (Sight)',
    labelHi: 'दृश्य विवरण (दृष्टि)',
    type: 'array',
    required: false,
    category: 'descriptive',
    level: ['all'],
    hint: 'What do you see? Colors, shapes, movements...',
    hintHi: 'आप क्या देखते हैं? रंग, आकार, गतिविधियां...',
    essayTypeRelevance: ['descriptive', 'narrative']
  },
  {
    key: 'soundDetails',
    label: 'Sound Details',
    labelHi: 'ध्वनि विवरण',
    type: 'array',
    required: false,
    category: 'descriptive',
    level: ['all'],
    hint: 'What do you hear? Loud, soft, rhythmic...',
    hintHi: 'आप क्या सुनते हैं? जोर से, धीरे, लयबद्ध...',
    essayTypeRelevance: ['descriptive', 'narrative']
  },
  {
    key: 'smellDetails',
    label: 'Smell Details',
    labelHi: 'गंध विवरण',
    type: 'array',
    required: false,
    category: 'descriptive',
    level: ['all'],
    hint: 'What do you smell? Fresh, pungent, fragrant...',
    hintHi: 'आपको क्या गंध आती है? ताजा, तीखी, सुगंधित...',
    essayTypeRelevance: ['descriptive', 'narrative']
  },
  {
    key: 'tasteDetails',
    label: 'Taste Details',
    labelHi: 'स्वाद विवरण',
    type: 'array',
    required: false,
    category: 'descriptive',
    level: ['all'],
    hint: 'What do you taste? Sweet, sour, spicy...',
    hintHi: 'आपको क्या स्वाद आता है? मीठा, खट्टा, मसालेदार...',
    essayTypeRelevance: ['descriptive']
  },
  {
    key: 'touchDetails',
    label: 'Touch/Texture Details',
    labelHi: 'स्पर्श/बनावट विवरण',
    type: 'array',
    required: false,
    category: 'descriptive',
    level: ['all'],
    hint: 'What do you feel? Rough, smooth, warm, cold...',
    hintHi: 'आप क्या महसूस करते हैं? खुरदरा, चिकना, गर्म, ठंडा...',
    essayTypeRelevance: ['descriptive', 'narrative']
  },
  {
    key: 'dominantImpression',
    label: 'Dominant Impression',
    labelHi: 'प्रमुख प्रभाव',
    type: 'textarea',
    required: false,
    category: 'descriptive',
    level: ['all'],
    placeholder: 'The overall feeling or mood you want to create',
    placeholderHi: 'समग्र भावना या मनोदशा जो आप बनाना चाहते हैं',
    essayTypeRelevance: ['descriptive']
  },
  {
    key: 'figurativeLanguage',
    label: 'Figurative Language',
    labelHi: 'अलंकारिक भाषा',
    type: 'array',
    required: false,
    category: 'descriptive',
    level: ['all'],
    hint: 'Similes, metaphors, personification used in your description',
    hintHi: 'आपके विवरण में प्रयुक्त उपमा, रूपक, मानवीकरण',
    essayTypeRelevance: ['descriptive', 'narrative']
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: CONCLUSION
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'restatedThesis',
    label: 'Restated Thesis',
    labelHi: 'पुनः कथित थीसिस',
    type: 'textarea',
    required: true,
    category: 'conclusion',
    level: ['all'],
    placeholder: 'In conclusion, social media has profoundly transformed human communication...',
    placeholderHi: 'निष्कर्ष में, सोशल मीडिया ने मानव संचार को गहराई से बदल दिया है...',
    hint: 'Rephrase your thesis - don\'t just copy it',
    hintHi: 'अपनी थीसिस को पुनः व्यक्त करें - बस कॉपी न करें',
    maxLength: 500
  },
  {
    key: 'summaryPoints',
    label: 'Summary of Main Points',
    labelHi: 'मुख्य बिंदुओं का सारांश',
    type: 'array',
    required: false,
    category: 'conclusion',
    level: ['all'],
    hint: 'Brief recap of your key arguments/points',
    hintHi: 'आपके प्रमुख तर्कों/बिंदुओं का संक्षिप्त पुनर्कथन'
  },
  {
    key: 'synthesis',
    label: 'Synthesis',
    labelHi: 'संश्लेषण',
    type: 'textarea',
    required: false,
    category: 'conclusion',
    level: ['undergraduate', 'postgraduate', 'professional'],
    placeholder: 'Connect your arguments to show the bigger picture...',
    placeholderHi: 'बड़ी तस्वीर दिखाने के लिए अपने तर्कों को जोड़ें...',
    hint: 'How do all your points come together?',
    hintHi: 'आपके सभी बिंदु एक साथ कैसे आते हैं?'
  },
  {
    key: 'implications',
    label: 'Implications',
    labelHi: 'निहितार्थ',
    type: 'textarea',
    required: false,
    category: 'conclusion',
    level: ['undergraduate', 'postgraduate', 'professional'],
    placeholder: 'What are the broader implications of your findings?',
    placeholderHi: 'आपके निष्कर्षों के व्यापक निहितार्थ क्या हैं?',
    essayTypeRelevance: ['academic', 'research', 'argumentative']
  },
  {
    key: 'finalThought',
    label: 'Final Thought / Closing',
    labelHi: 'अंतिम विचार / समापन',
    type: 'textarea',
    required: true,
    category: 'conclusion',
    level: ['all'],
    placeholder: 'As we navigate this digital age, it is crucial that we...',
    placeholderHi: 'जैसा कि हम इस डिजिटल युग में नेविगेट करते हैं, यह महत्वपूर्ण है कि हम...',
    hint: 'End with impact - thought-provoking statement, call to action, or future outlook',
    hintHi: 'प्रभाव के साथ समाप्त करें - विचारोत्तेजक कथन, कार्रवाई का आह्वान, या भविष्य का दृष्टिकोण',
    maxLength: 500
  },
  {
    key: 'callToAction',
    label: 'Call to Action',
    labelHi: 'कार्रवाई का आह्वान',
    type: 'textarea',
    required: false,
    category: 'conclusion',
    level: ['all'],
    placeholder: 'We must take steps to ensure that technology serves humanity...',
    placeholderHi: 'हमें यह सुनिश्चित करने के लिए कदम उठाने चाहिए कि प्रौद्योगिकी मानवता की सेवा करे...',
    hint: 'What action do you want readers to take?',
    hintHi: 'आप चाहते हैं कि पाठक क्या कार्रवाई करें?',
    essayTypeRelevance: ['persuasive', 'argumentative', 'problem-solution']
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: REFERENCES & CITATIONS
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'citationStyle',
    label: 'Citation Style',
    labelHi: 'उद्धरण शैली',
    type: 'select',
    required: false,
    category: 'references',
    level: ['all'],
    options: ['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE', 'AMA', 'Vancouver', 'Turabian', 'OSCOLA', 'None']
  },
  {
    key: 'citations',
    label: 'Citations / References',
    labelHi: 'उद्धरण / संदर्भ',
    type: 'array',
    required: false,
    category: 'references',
    level: ['all'],
    hint: 'Sources you cited in your essay',
    hintHi: 'आपने अपने निबंध में जिन स्रोतों का हवाला दिया'
  },
  {
    key: 'bibliography',
    label: 'Bibliography',
    labelHi: 'ग्रंथ सूची',
    type: 'array',
    required: false,
    category: 'references',
    level: ['undergraduate', 'postgraduate', 'professional'],
    hint: 'All sources consulted (even if not directly cited)',
    hintHi: 'परामर्श किए गए सभी स्रोत (भले ही सीधे उद्धृत न हों)'
  },

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY: FORMATTING & SETTINGS
  // ═══════════════════════════════════════════════════════════════
  {
    key: 'templateStyle',
    label: 'Template Style',
    labelHi: 'टेम्पलेट शैली',
    type: 'select',
    required: true,
    category: 'settings',
    level: ['all'],
    options: ['Academic', 'Argumentative', 'Narrative', 'Descriptive', 'Expository', 'Persuasive']
  },
  {
    key: 'tone',
    label: 'Writing Tone',
    labelHi: 'लेखन का लहजा',
    type: 'select',
    required: false,
    category: 'settings',
    level: ['all'],
    options: ['Formal', 'Semi-formal', 'Informal', 'Academic', 'Conversational', 'Persuasive', 'Analytical', 'Reflective', 'Objective', 'Subjective']
  },
  {
    key: 'wordCount',
    label: 'Word Count',
    labelHi: 'शब्द गणना',
    type: 'number',
    required: false,
    category: 'formatting',
    level: ['all'],
    hint: 'Actual word count of your essay',
    hintHi: 'आपके निबंध की वास्तविक शब्द गणना'
  },
  {
    key: 'targetWordCount',
    label: 'Target Word Count',
    labelHi: 'लक्ष्य शब्द गणना',
    type: 'number',
    required: false,
    category: 'formatting',
    level: ['all'],
    placeholder: '1500',
    hint: 'Required word count for the assignment',
    hintHi: 'असाइनमेंट के लिए आवश्यक शब्द गणना'
  },
  {
    key: 'showWordCount',
    label: 'Show Word Count',
    labelHi: 'शब्द गणना दिखाएं',
    type: 'boolean',
    required: false,
    category: 'formatting',
    level: ['all']
  },
  {
    key: 'showPageNumbers',
    label: 'Show Page Numbers',
    labelHi: 'पृष्ठ संख्या दिखाएं',
    type: 'boolean',
    required: false,
    category: 'formatting',
    level: ['all']
  },
  {
    key: 'showTableOfContents',
    label: 'Show Table of Contents',
    labelHi: 'विषय सूची दिखाएं',
    type: 'boolean',
    required: false,
    category: 'formatting',
    level: ['postgraduate', 'professional']
  },
  {
    key: 'lineSpacing',
    label: 'Line Spacing',
    labelHi: 'पंक्ति अंतर',
    type: 'select',
    required: false,
    category: 'formatting',
    level: ['all'],
    options: ['Single', '1.5 Lines', 'Double']
  },
  {
    key: 'fontSize',
    label: 'Font Size',
    labelHi: 'फ़ॉन्ट आकार',
    type: 'select',
    required: false,
    category: 'formatting',
    level: ['all'],
    options: ['Small (10pt)', 'Medium (12pt)', 'Large (14pt)']
  },
  {
    key: 'fontFamily',
    label: 'Font Family',
    labelHi: 'फ़ॉन्ट परिवार',
    type: 'select',
    required: false,
    category: 'formatting',
    level: ['all'],
    options: ['Serif (Times New Roman)', 'Sans-Serif (Arial)', 'Mono (Courier)']
  },
  {
    key: 'paragraphIndent',
    label: 'Indent Paragraphs',
    labelHi: 'पैराग्राफ इंडेंट करें',
    type: 'boolean',
    required: false,
    category: 'formatting',
    level: ['all']
  },
  {
    key: 'paperSize',
    label: 'Paper Size',
    labelHi: 'पेपर आकार',
    type: 'select',
    required: false,
    category: 'formatting',
    level: ['all'],
    options: ['A4', 'Letter', 'Legal']
  },
  {
    key: 'margins',
    label: 'Margins',
    labelHi: 'मार्जिन',
    type: 'select',
    required: false,
    category: 'formatting',
    level: ['all'],
    options: ['Narrow (0.5")', 'Normal (1")', 'Wide (1.25")']
  },
  {
    key: 'headerText',
    label: 'Header Text',
    labelHi: 'हेडर टेक्स्ट',
    type: 'text',
    required: false,
    category: 'formatting',
    level: ['undergraduate', 'postgraduate', 'professional'],
    placeholder: 'Running Head: SOCIAL MEDIA IMPACT'
  },
  {
    key: 'accentColor',
    label: 'Accent Color',
    labelHi: 'एक्सेंट रंग',
    type: 'text',
    required: false,
    category: 'settings',
    level: ['all'],
    placeholder: '#2563eb',
    hint: 'Hex color code for headings and accents',
    hintHi: 'शीर्षकों और एक्सेंट के लिए हेक्स कलर कोड'
  }
];

// ─────────────────────────────────────────────────────────────────────────────────
// SECTION 6: HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────────

/**
 * Get fields by category
 */
export function getFieldsByCategory(category: FieldCategory): FieldDefinition[] {
  return ESSAY_FIELDS.filter(field => field.category === category);
}

/**
 * Get fields by education level
 */
export function getFieldsByLevel(level: FieldLevel): FieldDefinition[] {
  return ESSAY_FIELDS.filter(field => 
    field.level.includes(level) || field.level.includes('all')
  );
}

/**
 * Get fields by essay type
 */
export function getFieldsByEssayType(essayType: EssayType): FieldDefinition[] {
  return ESSAY_FIELDS.filter(field => 
    !field.essayTypeRelevance || field.essayTypeRelevance.includes(essayType)
  );
}

/**
 * Get required fields only
 */
export function getRequiredFields(): FieldDefinition[] {
  return ESSAY_FIELDS.filter(field => field.required);
}

/**
 * Get optional fields only
 */
export function getOptionalFields(): FieldDefinition[] {
  return ESSAY_FIELDS.filter(field => !field.required);
}

/**
 * Validate essay data
 */
export function validateEssayData(data: Partial<EssayData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredFields = getRequiredFields();

  for (const field of requiredFields) {
    const value = data[field.key as keyof EssayData];
    if (value === undefined || value === null || value === '') {
      errors.push(`${field.label} is required`);
    }
  }

  // Additional validations
  if (data.wordCount && data.targetWordCount) {
    const deviation = Math.abs(data.wordCount - data.targetWordCount);
    const percentage = (deviation / data.targetWordCount) * 100;
    if (percentage > 20) {
      errors.push(`Word count deviates more than 20% from target (${data.wordCount}/${data.targetWordCount})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get field categories with counts
 */
export function getFieldCategories(): Array<{ category: FieldCategory; count: number; label: string }> {
  const categories: FieldCategory[] = [
    'metadata', 'author', 'content', 'introduction', 'body', 
    'conclusion', 'arguments', 'narrative', 'descriptive', 
    'references', 'formatting', 'settings'
  ];

  const categoryLabels: Record<FieldCategory, string> = {
    metadata: 'Metadata',
    author: 'Author Information',
    content: 'Content',
    introduction: 'Introduction',
    body: 'Body Paragraphs',
    conclusion: 'Conclusion',
    arguments: 'Argumentative',
    narrative: 'Narrative',
    descriptive: 'Descriptive',
    references: 'References',
    formatting: 'Formatting',
    settings: 'Settings'
  };

  return categories.map(category => ({
    category,
    count: getFieldsByCategory(category).length,
    label: categoryLabels[category]
  }));
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'iso' = 'long'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    case 'iso':
      return d.toISOString().split('T')[0];
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Calculate word count
 */
export function calculateWordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimate reading time
 */
export function estimateReadingTime(wordCount: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

// ─────────────────────────────────────────────────────────────────────────────────
// SECTION 7: SAMPLE DATA
// ─────────────────────────────────────────────────────────────────────────────────

export const SAMPLE_ACADEMIC_ESSAY: Partial<EssayData> = {
  title: 'The Impact of Social Media on Interpersonal Communication',
  subtitle: 'A Critical Analysis',
  essayType: 'academic',
  academicDiscipline: 'social-sciences',
  author: 'Rahul Sharma',
  rollNumber: '2024/SOC/001',
  institution: 'Delhi University',
  department: 'Department of Sociology',
  instructor: 'Dr. Priya Verma',
  course: 'Media and Society',
  courseCode: 'SOC 301',
  date: new Date().toISOString().split('T')[0],
  
  introduction: {
    hook: 'In 2024, the average person spends over 2 hours daily on social media platforms, fundamentally altering how we connect with others.',
    hookType: 'statistic',
    background: 'Social media has transformed from a simple networking tool to a pervasive force shaping human interaction, relationships, and communication patterns.',
    thesis: 'While social media has expanded our ability to connect globally, it has paradoxically diminished the quality and depth of our interpersonal relationships.',
    roadmap: 'This essay will examine the evolution of digital communication, analyze its effects on relationship quality, and propose strategies for balanced technology use.'
  },
  
  thesis: 'While social media has expanded our ability to connect globally, it has paradoxically diminished the quality and depth of our interpersonal relationships.',
  
  bodyParagraphs: [
    {
      paragraphNumber: 1,
      topic: 'The Evolution of Digital Communication',
      topicSentence: 'The transformation of communication through social media represents one of the most significant shifts in human interaction since the invention of the telephone.',
      supportingPoints: [
        'Social media users increased from 970 million in 2010 to 4.9 billion in 2024',
        'Average daily social media usage has grown to 147 minutes globally',
        'Platforms have evolved from text-based to multimedia-rich environments'
      ],
      analysis: 'This rapid evolution demonstrates how deeply social media has embedded itself into daily life, creating new norms and expectations for communication.',
      transition: 'However, this increased connectivity comes with significant implications for relationship quality.'
    },
    {
      paragraphNumber: 2,
      topic: 'Impact on Relationship Quality',
      topicSentence: 'Despite enabling more frequent contact, social media has been linked to decreased relationship satisfaction and increased feelings of loneliness.',
      supportingPoints: [
        'Studies show 73% of heavy social media users report feeling lonely',
        'Face-to-face interaction has decreased by 40% among young adults',
        'Digital communication lacks non-verbal cues essential for emotional connection'
      ],
      analysis: 'The paradox of social media lies in its ability to connect us superficially while creating barriers to meaningful emotional intimacy.',
      transition: 'Understanding these effects is crucial for developing healthier digital habits.'
    }
  ],
  
  conclusion: {
    restatedThesis: 'In conclusion, while social media has revolutionized our ability to maintain connections across distances, it has simultaneously compromised the depth and authenticity of our interpersonal relationships.',
    summary: [
      'Digital communication has fundamentally altered interaction patterns',
      'Increased connectivity has paradoxically led to greater isolation',
      'Balance between digital and face-to-face interaction is essential'
    ],
    implications: 'These findings have significant implications for mental health, social policy, and technology design.',
    finalThought: 'As we navigate this digital age, we must consciously cultivate meaningful connections that transcend the superficiality of likes and shares.',
    callToAction: 'It is imperative that we develop digital literacy programs and design technologies that enhance rather than replace genuine human connection.'
  },
  
  citationStyle: 'APA',
  templateStyle: 'academic',
  tone: 'academic',
  targetWordCount: 2000,
  lineSpacing: '1.5',
  fontSize: 'medium',
  showPageNumbers: true,
  showWordCount: true,
  paragraphIndent: true
};

export const SAMPLE_NARRATIVE_ESSAY: Partial<EssayData> = {
  title: 'The Day That Changed Everything',
  essayType: 'narrative',
  author: 'Priya Patel',
  class: 'Class 12',
  institution: 'Kendriya Vidyalaya, Delhi',
  date: new Date().toISOString().split('T')[0],
  
  introduction: {
    hook: 'I never believed in life-changing moments until one rainy afternoon in July 2023.',
    hookType: 'bold-statement',
    background: 'As a typical teenager, I had my routines, my comfort zone, and my carefully constructed plans for the future.',
    thesis: 'That single afternoon taught me that the most profound growth often comes from the most unexpected challenges.'
  },
  
  narrative: {
    setting: {
      time: 'July 2023, monsoon season',
      place: 'A small village in Uttarakhand',
      atmosphere: 'Heavy rain, flooded roads, isolated from the city'
    },
    characters: [
      {
        name: 'Priya',
        role: 'protagonist',
        description: 'A city girl who believed success came from textbooks and exams'
      },
      {
        name: 'Amma',
        role: 'supporting',
        description: 'An elderly village woman who became my unexpected teacher'
      }
    ],
    plot: {
      exposition: 'I was visiting my ancestral village with my family during summer vacation, annoyed at being away from my books and friends.',
      risingAction: [
        'A sudden flood cut off the village from the main road',
        'We were stranded for three days without electricity or internet',
        'I met Amma, who invited me to help at the community kitchen'
      ],
      climax: 'Watching Amma coordinate relief efforts with grace and wisdom, despite having no formal education, I realized that true intelligence extends far beyond academic achievement.',
      fallingAction: [
        'I spent two days helping at the community kitchen',
        'I learned traditional cooking and heard stories of resilience',
        'The roads reopened but something in me had shifted'
      ],
      resolution: 'I returned home with a new perspective on education, success, and what truly matters in life.'
    },
    theme: 'True wisdom comes from experience and compassion, not just formal education',
    lesson: 'The most valuable lessons often come from the most unexpected teachers'
  },
  
  conclusion: {
    restatedThesis: 'That rainy afternoon in Uttarakhand transformed my understanding of success and education.',
    summary: [],
    finalThought: 'Today, as I prepare for my board exams, I carry Amma\'s wisdom with me - that knowledge without compassion is incomplete, and the most important lessons cannot be found in textbooks.'
  },
  
  templateStyle: 'narrative',
  tone: 'reflective',
  perspective: 'first-person',
  targetWordCount: 1000,
  lineSpacing: '1.5'
};

export const SAMPLE_ARGUMENTATIVE_ESSAY: Partial<EssayData> = {
  title: 'Should Mobile Phones Be Banned in Schools?',
  essayType: 'argumentative',
  author: 'Amit Kumar',
  class: 'Class 10',
  institution: 'Modern Public School, Mumbai',
  instructor: 'Mrs. Sunita Rao',
  date: new Date().toISOString().split('T')[0],
  
  introduction: {
    hook: 'While 97% of Indian students own smartphones, the debate over their place in classrooms continues to divide educators and parents.',
    hookType: 'statistic',
    background: 'Mobile phones have become ubiquitous in modern life, serving as communication devices, learning tools, and entertainment platforms.',
    thesis: 'Mobile phones should not be completely banned in schools; instead, schools should implement structured policies that harness their educational potential while minimizing distractions.'
  },
  
  thesis: 'Mobile phones should not be completely banned in schools; instead, schools should implement structured policies that harness their educational potential while minimizing distractions.',
  
  argumentative: {
    mainArgument: 'Regulated mobile phone use in schools can enhance learning outcomes when properly managed.',
    supportingArguments: [
      {
        argument: 'Mobile phones provide access to vast educational resources',
        evidence: [
          {
            type: 'statistical',
            content: 'Studies show students with smartphone access perform 15% better in research-based assignments',
            source: 'Indian Education Review, 2023'
          }
        ],
        analysis: 'Access to digital resources democratizes education and enables personalized learning.'
      },
      {
        argument: 'Phones prepare students for the digital workplace',
        evidence: [
          {
            type: 'expert-opinion',
            content: 'Digital literacy is essential for 85% of future jobs',
            source: 'World Economic Forum Report'
          }
        ],
        analysis: 'Banning phones in schools creates an artificial environment disconnected from real-world requirements.'
      }
    ],
    counterArguments: [
      {
        point: 'Mobile phones are distracting and reduce academic performance',
        source: 'Critics of phone use in schools',
        rebuttal: 'This argument addresses unregulated use; structured policies with designated times and purposes can mitigate distractions while preserving benefits.'
      }
    ],
    rebuttals: [
      'Structured policies can address distraction concerns while preserving educational benefits'
    ]
  },
  
  conclusion: {
    restatedThesis: 'Rather than implementing blanket bans, schools should develop nuanced policies that leverage mobile technology for education while addressing legitimate concerns about distraction.',
    summary: [
      'Mobile phones offer significant educational benefits when properly regulated',
      'Complete bans disconnect students from essential digital skills',
      'Balanced policies can address concerns while maximizing benefits'
    ],
    finalThought: 'The question is not whether phones belong in schools, but how we can best integrate them to prepare students for a digital future.',
    callToAction: 'Schools, parents, and students should collaborate to create phone policies that serve educational goals.'
  },
  
  templateStyle: 'argumentative',
  tone: 'persuasive',
  targetWordCount: 1200,
  showPageNumbers: true
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default ESSAY_FIELDS;

/**
 * Essay Fields Configuration Summary:
 * 
 * Total Fields: 70+
 * Categories: 12
 * Essay Types Supported: 15
 * Citation Styles: 10
 * Education Levels: 6
 * 
 * Key Features:
 * - Bilingual labels (English + Hindi)
 * - Essay type specific fields
 * - Education level filtering
 * - Comprehensive validation
 * - Sample data for 3 essay types
 * - Helper functions for dynamic forms
 * 
 * Usage: Import this config in document-templates module
 * Path: src/modules/document-templates/essay-fields.config.ts
 */