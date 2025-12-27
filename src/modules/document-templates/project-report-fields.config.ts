/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SORIVA - PROJECT REPORT FIELDS CONFIGURATION
 * Complete field definitions for Project Report templates
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// FIELD TYPE DEFINITION
// ─────────────────────────────────────────────────────────────────────────────
export type FieldType =
  | 'text'
  | 'textarea'
  | 'textarea-list'
  | 'number'
  | 'date'
  | 'email'
  | 'url'
  | 'tel'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'color'
  | 'file'
  | 'image'
  | 'complex'
  | 'array'
  | 'object'
  | 'rich-text'
  | 'markdown';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE TYPES
// ─────────────────────────────────────────────────────────────────────────────
export type ProjectReportTemplateType =
  | 'academic'      // College/University project reports
  | 'technical'     // Software/Engineering technical reports
  | 'research'      // Research-based project reports
  | 'internship'    // Internship/Training reports
  | 'industrial'    // Industrial visit/Training reports
  | 'capstone';     // Final year/Capstone project reports

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
export type ProjectStatus = 'completed' | 'in-progress' | 'planned';
export type ProjectType = 'individual' | 'group' | 'guided';
export type ReportSection = 
  | 'title-page'
  | 'certificate'
  | 'declaration'
  | 'acknowledgement'
  | 'abstract'
  | 'table-of-contents'
  | 'list-of-figures'
  | 'list-of-tables'
  | 'introduction'
  | 'literature-review'
  | 'methodology'
  | 'system-design'
  | 'implementation'
  | 'testing'
  | 'results'
  | 'discussion'
  | 'conclusion'
  | 'future-scope'
  | 'references'
  | 'appendix';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────
export interface TeamMember {
  name: string;
  rollNumber?: string;
  email?: string;
  role?: string;
  contribution?: string;
}

export interface ProjectGuide {
  name: string;
  designation?: string;
  department?: string;
  email?: string;
  phone?: string;
}

export interface Chapter {
  number: number;
  title: string;
  content: string[];
  figures?: Figure[];
  tables?: Table[];
}

export interface Figure {
  number: string;
  caption: string;
  imageUrl?: string;
  source?: string;
}

export interface Table {
  number: string;
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface Milestone {
  name: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  deliverables?: string[];
}

export interface TechStack {
  category: string;
  technologies: string[];
}

export interface TestCase {
  id: string;
  description: string;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  status: 'pass' | 'fail' | 'pending';
}

export interface Reference {
  type: 'book' | 'journal' | 'website' | 'paper' | 'other';
  authors?: string[];
  title: string;
  year?: string;
  publisher?: string;
  url?: string;
  accessDate?: string;
}

export interface InternshipDetails {
  companyName: string;
  companyAddress?: string;
  companyWebsite?: string;
  industry?: string;
  department?: string;
  supervisorName?: string;
  supervisorDesignation?: string;
  supervisorEmail?: string;
  startDate: string;
  endDate: string;
  duration?: string;
  stipend?: string;
}

export interface IndustrialVisit {
  companyName: string;
  location: string;
  visitDate: string;
  duration?: string;
  guide?: string;
  sections?: string[];
  observations?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DATA INTERFACE
// ─────────────────────────────────────────────────────────────────────────────
export interface ProjectReportData {
  // Template Selection
  templateType: ProjectReportTemplateType;
  
  // Basic Project Info
  projectTitle: string;
  projectSubtitle?: string;
  projectType: ProjectType;
  projectStatus: ProjectStatus;
  projectDomain?: string;
  projectCategory?: string;
  
  // Academic Info
  institution: string;
  institutionLogo?: string;
  institutionAddress?: string;
  university?: string;
  universityLogo?: string;
  department: string;
  course: string;
  courseCode?: string;
  semester?: string;
  academicYear: string;
  batch?: string;
  
  // Student Info (Individual)
  studentName?: string;
  rollNumber?: string;
  enrollmentNumber?: string;
  studentEmail?: string;
  studentPhone?: string;
  
  // Team Info (Group Project)
  teamName?: string;
  teamMembers?: TeamMember[];
  teamLeader?: string;
  
  // Guide/Mentor Info
  guide?: ProjectGuide;
  coGuide?: ProjectGuide;
  externalGuide?: ProjectGuide;
  hodName?: string;
  hodDesignation?: string;
  
  // Dates
  submissionDate: string;
  projectStartDate?: string;
  projectEndDate?: string;
  
  // Front Matter
  certificate?: string;
  declaration?: string;
  acknowledgement?: string;
  abstract: string;
  keywords?: string[];
  
  // Table of Contents
  showTableOfContents?: boolean;
  showListOfFigures?: boolean;
  showListOfTables?: boolean;
  
  // Chapters/Content
  chapters?: Chapter[];
  
  // Standard Sections
  introduction?: string;
  problemStatement?: string;
  objectives?: string[];
  scope?: string;
  limitations?: string[];
  
  // Literature Review
  literatureReview?: string;
  existingSystems?: {
    name: string;
    description: string;
    limitations?: string[];
  }[];
  
  // Methodology
  methodology?: string;
  developmentModel?: string;
  
  // System Design (Technical)
  systemRequirements?: {
    hardware?: string[];
    software?: string[];
    functional?: string[];
    nonFunctional?: string[];
  };
  systemArchitecture?: string;
  dfdDiagrams?: Figure[];
  erDiagrams?: Figure[];
  useCaseDiagrams?: Figure[];
  classDiagrams?: Figure[];
  sequenceDiagrams?: Figure[];
  
  // Implementation
  implementation?: string;
  techStack?: TechStack[];
  modules?: {
    name: string;
    description: string;
    features?: string[];
  }[];
  codeSnippets?: {
    title: string;
    language: string;
    code: string;
    explanation?: string;
  }[];
  screenshots?: Figure[];
  
  // Testing
  testingApproach?: string;
  testCases?: TestCase[];
  testResults?: string;
  
  // Results & Analysis
  results?: string;
  findings?: string[];
  dataAnalysis?: string;
  performanceMetrics?: {
    metric: string;
    value: string;
    benchmark?: string;
  }[];
  
  // Discussion
  discussion?: string;
  challengesFaced?: string[];
  solutionsApplied?: string[];
  
  // Conclusion
  conclusion?: string;
  futureScope?: string[];
  recommendations?: string[];
  
  // Internship Specific
  internship?: InternshipDetails;
  weeklyReports?: {
    week: number;
    startDate: string;
    endDate: string;
    tasks: string[];
    learnings?: string[];
  }[];
  dailyDiary?: {
    date: string;
    activities: string[];
    remarks?: string;
  }[];
  skillsLearned?: string[];
  projectsWorkedOn?: {
    name: string;
    description: string;
    contribution?: string;
  }[];
  
  // Industrial Visit Specific
  industrialVisit?: IndustrialVisit;
  manufacturingProcess?: string;
  departmentsVisited?: {
    name: string;
    activities: string[];
    keyLearnings?: string[];
  }[];
  
  // Project Timeline
  milestones?: Milestone[];
  ganttChart?: string;
  
  // Budget (if applicable)
  budget?: {
    item: string;
    quantity?: number;
    cost: number;
  }[];
  totalBudget?: number;
  
  // References
  references?: Reference[];
  bibliography?: string[];
  citationStyle?: 'APA' | 'MLA' | 'IEEE' | 'Harvard' | 'Chicago';
  
  // Appendix
  appendix?: {
    label: string;
    title: string;
    content?: string;
    imageUrl?: string;
  }[];
  
  // Styling
  accentColor?: string;
  showPageNumbers?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  headerText?: string;
  footerText?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
export interface FieldDefinition {
  name: string;
  label: string;
  labelHi: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  validations?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  helpText?: string;
  showFor?: ProjectReportTemplateType[];
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD DEFINITIONS BY CATEGORY
// ─────────────────────────────────────────────────────────────────────────────
export const projectReportFields: FieldDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT INFORMATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'templateType',
    label: 'Report Type',
    labelHi: 'रिपोर्ट प्रकार',
    type: 'select',
    required: true,
    options: [
      { value: 'academic', label: 'Academic Project Report' },
      { value: 'technical', label: 'Technical Project Report' },
      { value: 'research', label: 'Research Project Report' },
      { value: 'internship', label: 'Internship Report' },
      { value: 'industrial', label: 'Industrial Visit Report' },
      { value: 'capstone', label: 'Capstone/Final Year Project' }
    ]
  },
  {
    name: 'projectTitle',
    label: 'Project Title',
    labelHi: 'प्रोजेक्ट शीर्षक',
    type: 'text',
    required: true,
    placeholder: 'Enter your project title',
    validations: { minLength: 5, maxLength: 200 }
  },
  {
    name: 'projectSubtitle',
    label: 'Project Subtitle',
    labelHi: 'प्रोजेक्ट उपशीर्षक',
    type: 'text',
    required: false,
    placeholder: 'Optional subtitle or tagline'
  },
  {
    name: 'projectType',
    label: 'Project Type',
    labelHi: 'प्रोजेक्ट प्रकार',
    type: 'select',
    required: true,
    options: [
      { value: 'individual', label: 'Individual Project' },
      { value: 'group', label: 'Group Project' },
      { value: 'guided', label: 'Guided Project' }
    ],
    defaultValue: 'individual'
  },
  {
    name: 'projectDomain',
    label: 'Project Domain',
    labelHi: 'प्रोजेक्ट डोमेन',
    type: 'text',
    required: false,
    placeholder: 'e.g., Web Development, Machine Learning, IoT'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INSTITUTION DETAILS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'institution',
    label: 'Institution Name',
    labelHi: 'संस्थान का नाम',
    type: 'text',
    required: true,
    placeholder: 'College/Institute name'
  },
  {
    name: 'institutionLogo',
    label: 'Institution Logo',
    labelHi: 'संस्थान लोगो',
    type: 'image',
    required: false
  },
  {
    name: 'university',
    label: 'University Name',
    labelHi: 'विश्वविद्यालय का नाम',
    type: 'text',
    required: false,
    placeholder: 'Affiliated university name'
  },
  {
    name: 'department',
    label: 'Department',
    labelHi: 'विभाग',
    type: 'text',
    required: true,
    placeholder: 'e.g., Computer Science & Engineering'
  },
  {
    name: 'course',
    label: 'Course/Program',
    labelHi: 'पाठ्यक्रम',
    type: 'text',
    required: true,
    placeholder: 'e.g., B.Tech, M.Tech, BCA, MCA'
  },
  {
    name: 'semester',
    label: 'Semester',
    labelHi: 'सेमेस्टर',
    type: 'text',
    required: false,
    placeholder: 'e.g., 6th Semester'
  },
  {
    name: 'academicYear',
    label: 'Academic Year',
    labelHi: 'शैक्षणिक वर्ष',
    type: 'text',
    required: true,
    placeholder: 'e.g., 2024-25'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STUDENT DETAILS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'studentName',
    label: 'Student Name',
    labelHi: 'छात्र का नाम',
    type: 'text',
    required: true,
    placeholder: 'Full name'
  },
  {
    name: 'rollNumber',
    label: 'Roll Number',
    labelHi: 'रोल नंबर',
    type: 'text',
    required: true,
    placeholder: 'University roll number'
  },
  {
    name: 'enrollmentNumber',
    label: 'Enrollment Number',
    labelHi: 'नामांकन संख्या',
    type: 'text',
    required: false,
    placeholder: 'Enrollment/Registration number'
  },
  {
    name: 'studentEmail',
    label: 'Email',
    labelHi: 'ईमेल',
    type: 'email',
    required: false,
    placeholder: 'student@email.com'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TEAM DETAILS (for group projects)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'teamName',
    label: 'Team Name',
    labelHi: 'टीम का नाम',
    type: 'text',
    required: false,
    placeholder: 'Optional team name'
  },
  {
    name: 'teamMembers',
    label: 'Team Members',
    labelHi: 'टीम सदस्य',
    type: 'array',
    required: false,
    helpText: 'Add all team members with their details'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GUIDE DETAILS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'guide',
    label: 'Project Guide',
    labelHi: 'प्रोजेक्ट गाइड',
    type: 'object',
    required: false,
    helpText: 'Internal guide/mentor details'
  },
  {
    name: 'hodName',
    label: 'HOD Name',
    labelHi: 'विभागाध्यक्ष का नाम',
    type: 'text',
    required: false,
    placeholder: 'Head of Department name'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DATES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'submissionDate',
    label: 'Submission Date',
    labelHi: 'जमा करने की तिथि',
    type: 'date',
    required: true
  },
  {
    name: 'projectStartDate',
    label: 'Project Start Date',
    labelHi: 'प्रोजेक्ट प्रारंभ तिथि',
    type: 'date',
    required: false
  },
  {
    name: 'projectEndDate',
    label: 'Project End Date',
    labelHi: 'प्रोजेक्ट समाप्ति तिथि',
    type: 'date',
    required: false
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FRONT MATTER
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'abstract',
    label: 'Abstract',
    labelHi: 'सारांश',
    type: 'textarea',
    required: true,
    placeholder: 'Brief summary of your project (150-300 words)',
    validations: { minLength: 100, maxLength: 2000 }
  },
  {
    name: 'keywords',
    label: 'Keywords',
    labelHi: 'मुख्य शब्द',
    type: 'textarea-list',
    required: false,
    placeholder: 'Add 4-6 keywords'
  },
  {
    name: 'acknowledgement',
    label: 'Acknowledgement',
    labelHi: 'आभार',
    type: 'textarea',
    required: false,
    placeholder: 'Thank your guides, institution, family...'
  },
  {
    name: 'declaration',
    label: 'Declaration',
    labelHi: 'घोषणा',
    type: 'textarea',
    required: false,
    placeholder: 'Standard declaration text'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INTRODUCTION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'introduction',
    label: 'Introduction',
    labelHi: 'परिचय',
    type: 'textarea',
    required: true,
    placeholder: 'Introduce your project, background, motivation...'
  },
  {
    name: 'problemStatement',
    label: 'Problem Statement',
    labelHi: 'समस्या विवरण',
    type: 'textarea',
    required: false,
    placeholder: 'What problem does your project solve?'
  },
  {
    name: 'objectives',
    label: 'Objectives',
    labelHi: 'उद्देश्य',
    type: 'textarea-list',
    required: false,
    placeholder: 'List your project objectives'
  },
  {
    name: 'scope',
    label: 'Scope',
    labelHi: 'दायरा',
    type: 'textarea',
    required: false,
    placeholder: 'What is covered in this project?'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // METHODOLOGY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'methodology',
    label: 'Methodology',
    labelHi: 'कार्यप्रणाली',
    type: 'textarea',
    required: false,
    placeholder: 'Describe your approach, methods used...'
  },
  {
    name: 'developmentModel',
    label: 'Development Model',
    labelHi: 'विकास मॉडल',
    type: 'select',
    required: false,
    options: [
      { value: 'waterfall', label: 'Waterfall Model' },
      { value: 'agile', label: 'Agile Methodology' },
      { value: 'spiral', label: 'Spiral Model' },
      { value: 'prototype', label: 'Prototype Model' },
      { value: 'incremental', label: 'Incremental Model' },
      { value: 'rad', label: 'RAD Model' },
      { value: 'other', label: 'Other' }
    ],
    showFor: ['technical', 'capstone']
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // IMPLEMENTATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'implementation',
    label: 'Implementation',
    labelHi: 'कार्यान्वयन',
    type: 'textarea',
    required: false,
    placeholder: 'How was the project implemented?'
  },
  {
    name: 'techStack',
    label: 'Technology Stack',
    labelHi: 'प्रौद्योगिकी स्टैक',
    type: 'array',
    required: false,
    showFor: ['technical', 'capstone']
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RESULTS & CONCLUSION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'results',
    label: 'Results',
    labelHi: 'परिणाम',
    type: 'textarea',
    required: false,
    placeholder: 'What were the outcomes?'
  },
  {
    name: 'conclusion',
    label: 'Conclusion',
    labelHi: 'निष्कर्ष',
    type: 'textarea',
    required: true,
    placeholder: 'Summarize your project and findings'
  },
  {
    name: 'futureScope',
    label: 'Future Scope',
    labelHi: 'भविष्य की संभावनाएं',
    type: 'textarea-list',
    required: false,
    placeholder: 'What can be improved or added in future?'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNSHIP SPECIFIC
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'internship',
    label: 'Internship Details',
    labelHi: 'इंटर्नशिप विवरण',
    type: 'object',
    required: false,
    showFor: ['internship']
  },
  {
    name: 'weeklyReports',
    label: 'Weekly Reports',
    labelHi: 'साप्ताहिक रिपोर्ट',
    type: 'array',
    required: false,
    showFor: ['internship']
  },
  {
    name: 'skillsLearned',
    label: 'Skills Learned',
    labelHi: 'सीखे गए कौशल',
    type: 'textarea-list',
    required: false,
    showFor: ['internship']
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INDUSTRIAL VISIT SPECIFIC
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'industrialVisit',
    label: 'Industrial Visit Details',
    labelHi: 'औद्योगिक भ्रमण विवरण',
    type: 'object',
    required: false,
    showFor: ['industrial']
  },
  {
    name: 'departmentsVisited',
    label: 'Departments Visited',
    labelHi: 'देखे गए विभाग',
    type: 'array',
    required: false,
    showFor: ['industrial']
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // REFERENCES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'references',
    label: 'References',
    labelHi: 'संदर्भ',
    type: 'array',
    required: false,
    helpText: 'Add books, papers, websites referenced'
  },
  {
    name: 'citationStyle',
    label: 'Citation Style',
    labelHi: 'उद्धरण शैली',
    type: 'select',
    required: false,
    options: [
      { value: 'APA', label: 'APA Style' },
      { value: 'MLA', label: 'MLA Style' },
      { value: 'IEEE', label: 'IEEE Style' },
      { value: 'Harvard', label: 'Harvard Style' },
      { value: 'Chicago', label: 'Chicago Style' }
    ],
    defaultValue: 'IEEE'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STYLING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'accentColor',
    label: 'Accent Color',
    labelHi: 'एक्सेंट रंग',
    type: 'color',
    required: false,
    defaultValue: '#1e40af'
  },
  {
    name: 'showPageNumbers',
    label: 'Show Page Numbers',
    labelHi: 'पृष्ठ संख्या दिखाएं',
    type: 'checkbox',
    required: false,
    defaultValue: true
  },
  {
    name: 'showTableOfContents',
    label: 'Show Table of Contents',
    labelHi: 'विषय सूची दिखाएं',
    type: 'checkbox',
    required: false,
    defaultValue: true
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA FOR EACH TEMPLATE TYPE
// ─────────────────────────────────────────────────────────────────────────────
export const projectReportSampleData: Record<ProjectReportTemplateType, Partial<ProjectReportData>> = {
  academic: {
    templateType: 'academic',
    projectTitle: 'Online Library Management System',
    projectType: 'group',
    institution: 'Delhi Technological University',
    university: 'Delhi Technological University',
    department: 'Computer Science & Engineering',
    course: 'B.Tech',
    semester: '6th Semester',
    academicYear: '2024-25',
    studentName: 'Rahul Sharma',
    rollNumber: '2K21/CO/301',
    teamMembers: [
      { name: 'Rahul Sharma', rollNumber: '2K21/CO/301', role: 'Team Lead' },
      { name: 'Priya Gupta', rollNumber: '2K21/CO/302', role: 'Frontend Developer' },
      { name: 'Amit Kumar', rollNumber: '2K21/CO/303', role: 'Backend Developer' }
    ],
    guide: {
      name: 'Dr. Suresh Kumar',
      designation: 'Associate Professor',
      department: 'Computer Science & Engineering'
    },
    submissionDate: '2025-05-15',
    abstract: 'This project presents an Online Library Management System designed to automate library operations including book cataloging, member management, issue/return tracking, and fine calculation. The system is developed using modern web technologies and provides a user-friendly interface for both librarians and library members.',
    keywords: ['Library Management', 'Web Application', 'DBMS', 'Automation'],
    objectives: [
      'To automate library book management',
      'To provide online book search and reservation',
      'To track book issue and return',
      'To generate reports and analytics'
    ],
    conclusion: 'The Online Library Management System successfully automates all major library operations, reducing manual effort and improving efficiency.'
  },
  
  technical: {
    templateType: 'technical',
    projectTitle: 'E-Commerce Platform with AI-Powered Recommendations',
    projectType: 'individual',
    institution: 'Indian Institute of Technology, Delhi',
    department: 'Computer Science & Engineering',
    course: 'M.Tech',
    academicYear: '2024-25',
    studentName: 'Vikash Patel',
    rollNumber: 'MTech/CS/2023/045',
    guide: {
      name: 'Prof. Rajesh Gupta',
      designation: 'Professor',
      department: 'CSE'
    },
    submissionDate: '2025-06-01',
    abstract: 'This project implements a scalable e-commerce platform with machine learning-based product recommendation engine. The system uses collaborative filtering and content-based filtering algorithms to provide personalized recommendations.',
    techStack: [
      { category: 'Frontend', technologies: ['React.js', 'TypeScript', 'Tailwind CSS'] },
      { category: 'Backend', technologies: ['Node.js', 'Express.js', 'GraphQL'] },
      { category: 'Database', technologies: ['PostgreSQL', 'Redis'] },
      { category: 'ML/AI', technologies: ['Python', 'TensorFlow', 'Scikit-learn'] }
    ],
    developmentModel: 'agile',
    conclusion: 'The e-commerce platform demonstrates significant improvement in user engagement through AI-powered recommendations.'
  },
  
  research: {
    templateType: 'research',
    projectTitle: 'Impact of Social Media on Academic Performance of College Students',
    projectType: 'guided',
    institution: 'Jawaharlal Nehru University',
    department: 'School of Social Sciences',
    course: 'M.A. Sociology',
    academicYear: '2024-25',
    studentName: 'Sneha Verma',
    rollNumber: 'MA/SOC/2023/112',
    guide: {
      name: 'Dr. Meera Sharma',
      designation: 'Assistant Professor',
      department: 'Sociology'
    },
    submissionDate: '2025-04-20',
    abstract: 'This research investigates the relationship between social media usage patterns and academic performance among college students in Delhi NCR. Using mixed-methods approach, the study analyzes both quantitative data from surveys and qualitative insights from interviews.',
    keywords: ['Social Media', 'Academic Performance', 'College Students', 'Digital Literacy'],
    methodology: 'Mixed-methods research combining quantitative surveys (n=500) with qualitative in-depth interviews (n=30). Statistical analysis using SPSS and thematic analysis for qualitative data.',
    conclusion: 'The study reveals a nuanced relationship between social media use and academic outcomes, with moderated use showing positive effects while excessive use correlates with lower performance.'
  },
  
  internship: {
    templateType: 'internship',
    projectTitle: 'Summer Internship Report - Software Development',
    projectType: 'individual',
    institution: 'Birla Institute of Technology, Mesra',
    department: 'Information Technology',
    course: 'B.Tech',
    semester: '7th Semester',
    academicYear: '2024-25',
    studentName: 'Ankit Mishra',
    rollNumber: 'BIT/IT/2022/089',
    submissionDate: '2025-08-15',
    internship: {
      companyName: 'Infosys Limited',
      companyAddress: 'Electronics City, Bangalore',
      companyWebsite: 'https://www.infosys.com',
      industry: 'Information Technology',
      department: 'Digital Experience',
      supervisorName: 'Mr. Rakesh Jain',
      supervisorDesignation: 'Technical Lead',
      startDate: '2025-05-15',
      endDate: '2025-07-15',
      duration: '8 weeks',
      stipend: '₹25,000/month'
    },
    abstract: 'This report documents my 8-week summer internship at Infosys Limited, Bangalore. During the internship, I worked on developing REST APIs for a client project and gained hands-on experience with enterprise software development practices.',
    skillsLearned: ['Spring Boot', 'Microservices', 'Docker', 'Kubernetes', 'Agile/Scrum'],
    conclusion: 'The internship provided valuable industry exposure and helped bridge the gap between academic learning and practical application.'
  },
  
  industrial: {
    templateType: 'industrial',
    projectTitle: 'Industrial Visit Report - Maruti Suzuki India Limited',
    projectType: 'group',
    institution: 'Punjab Engineering College',
    department: 'Mechanical Engineering',
    course: 'B.Tech',
    semester: '5th Semester',
    academicYear: '2024-25',
    studentName: 'Gurpreet Singh',
    rollNumber: 'PEC/ME/2022/156',
    submissionDate: '2025-03-10',
    industrialVisit: {
      companyName: 'Maruti Suzuki India Limited',
      location: 'Manesar, Haryana',
      visitDate: '2025-02-25',
      duration: '1 Day',
      guide: 'Prof. Harpreet Kaur',
      sections: ['Assembly Line', 'Paint Shop', 'Body Shop', 'Quality Control']
    },
    abstract: 'This report presents observations and learnings from the industrial visit to Maruti Suzuki\'s manufacturing plant at Manesar. The visit provided insights into modern automotive manufacturing processes and quality control systems.',
    departmentsVisited: [
      { name: 'Assembly Line', activities: ['Observed car assembly process', 'Learned about just-in-time manufacturing'], keyLearnings: ['Automation in assembly', 'Quality checkpoints'] },
      { name: 'Paint Shop', activities: ['Witnessed robotic painting', 'Understood coating layers'], keyLearnings: ['Environmental controls', 'Color matching technology'] }
    ],
    conclusion: 'The industrial visit enhanced our understanding of real-world manufacturing processes and quality management systems.'
  },
  
  capstone: {
    templateType: 'capstone',
    projectTitle: 'Smart Healthcare Monitoring System using IoT and Machine Learning',
    projectType: 'group',
    institution: 'National Institute of Technology, Trichy',
    university: 'National Institute of Technology',
    department: 'Electronics & Communication Engineering',
    course: 'B.Tech',
    semester: '8th Semester',
    academicYear: '2024-25',
    teamMembers: [
      { name: 'Karthik Rajan', rollNumber: 'NIT/ECE/2021/045', role: 'Project Lead - Hardware' },
      { name: 'Divya Lakshmi', rollNumber: 'NIT/ECE/2021/046', role: 'ML Engineer' },
      { name: 'Suresh Kumar', rollNumber: 'NIT/ECE/2021/047', role: 'IoT Developer' },
      { name: 'Meena Kumari', rollNumber: 'NIT/ECE/2021/048', role: 'Mobile App Developer' }
    ],
    guide: {
      name: 'Dr. Venkatesh Iyer',
      designation: 'Professor',
      department: 'ECE'
    },
    submissionDate: '2025-05-30',
    abstract: 'This capstone project presents a comprehensive Smart Healthcare Monitoring System that combines IoT sensors, cloud computing, and machine learning to enable real-time patient health monitoring. The system can detect anomalies and alert healthcare providers for timely intervention.',
    techStack: [
      { category: 'Hardware', technologies: ['Arduino', 'ESP32', 'Pulse Sensor', 'Temperature Sensor'] },
      { category: 'Cloud', technologies: ['AWS IoT', 'Lambda', 'DynamoDB'] },
      { category: 'ML', technologies: ['Python', 'TensorFlow Lite', 'Time Series Analysis'] },
      { category: 'Mobile', technologies: ['Flutter', 'Firebase'] }
    ],
    objectives: [
      'Real-time monitoring of vital signs',
      'Early anomaly detection using ML',
      'Alert system for critical conditions',
      'Historical data analysis and visualization'
    ],
    conclusion: 'The Smart Healthcare Monitoring System demonstrates the potential of IoT and ML in revolutionizing patient care with 95% accuracy in anomaly detection.'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
export function getFieldsForTemplateType(templateType: ProjectReportTemplateType): FieldDefinition[] {
  return projectReportFields.filter(field => {
    if (!field.showFor) return true;
    return field.showFor.includes(templateType);
  });
}

export function getSampleData(templateType: ProjectReportTemplateType): Partial<ProjectReportData> {
  return projectReportSampleData[templateType] || projectReportSampleData.academic;
}

export function getTemplateInfo(templateType: ProjectReportTemplateType): { name: string; description: string; icon: string } {
  const info: Record<ProjectReportTemplateType, { name: string; description: string; icon: string }> = {
    academic: {
      name: 'Academic Project Report',
      description: 'Standard format for college/university project submissions',
      icon: '🎓'
    },
    technical: {
      name: 'Technical Project Report',
      description: 'Detailed technical documentation for software/engineering projects',
      icon: '💻'
    },
    research: {
      name: 'Research Project Report',
      description: 'Research-based project with methodology and findings',
      icon: '🔬'
    },
    internship: {
      name: 'Internship Report',
      description: 'Document your internship experience and learnings',
      icon: '🏢'
    },
    industrial: {
      name: 'Industrial Visit Report',
      description: 'Report on industrial/factory visits',
      icon: '🏭'
    },
    capstone: {
      name: 'Capstone Project Report',
      description: 'Final year/graduation project comprehensive report',
      icon: '🎯'
    }
  };
  
  return info[templateType];
}

export function validateProjectReportData(data: Partial<ProjectReportData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields validation
  if (!data.projectTitle) errors.push('Project title is required');
  if (!data.institution) errors.push('Institution name is required');
  if (!data.department) errors.push('Department is required');
  if (!data.course) errors.push('Course/Program is required');
  if (!data.academicYear) errors.push('Academic year is required');
  if (!data.abstract) errors.push('Abstract is required');
  if (!data.conclusion) errors.push('Conclusion is required');
  if (!data.submissionDate) errors.push('Submission date is required');
  
  // Template-specific validation
  if (data.templateType === 'internship' && !data.internship) {
    errors.push('Internship details are required for internship report');
  }
  
  if (data.templateType === 'industrial' && !data.industrialVisit) {
    errors.push('Industrial visit details are required');
  }
  
  if (data.projectType === 'group' && (!data.teamMembers || data.teamMembers.length === 0)) {
    errors.push('Team members are required for group project');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}