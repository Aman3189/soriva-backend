// src/modules/document-templates/document-templates.config.ts

/**
 * ═══════════════════════════════════════════════════════════════
 * SORIVA DOCUMENT TEMPLATES - CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 * 
 * 50 Professional Document Templates
 * - PLUS: 15-18 Student templates
 * - PRO: 15-18 Professional templates  
 * - APEX: 15-18 Executive templates
 * 
 * Created by: Risenex Global
 * ═══════════════════════════════════════════════════════════════
 */

import { PlanType } from '../../constants/plans';
import {
  DocumentTemplate,
  DocumentCategory,
  DocumentFormat,
  TemplateComplexity,
  TemplateField,
  FieldType,
} from './document-templates.types';

// ═══════════════════════════════════════════════════════════════
// TEMPLATE IDs
// ═══════════════════════════════════════════════════════════════

export enum DocumentTemplateId {
  // ─────────────────────────────────────
  // PLUS TEMPLATES (Students) - 15
  // ─────────────────────────────────────
  FRESHER_RESUME = 'fresher-resume',
  COVER_LETTER_FRESHER = 'cover-letter-fresher',
  INTERNSHIP_APPLICATION = 'internship-application',
  COLLEGE_ASSIGNMENT = 'college-assignment',
  PROJECT_REPORT = 'project-report',
  LAB_REPORT = 'lab-report',
  LEAVE_APPLICATION = 'leave-application',
  PERMISSION_LETTER = 'permission-letter',
  RECOMMENDATION_REQUEST = 'recommendation-request',
  STUDY_NOTES = 'study-notes',
  ESSAY_GENERAL = 'essay-general',
  PRESENTATION_OUTLINE = 'presentation-outline',
  EMAIL_TO_PROFESSOR = 'email-to-professor',
  LINKEDIN_STUDENT = 'linkedin-student',
  THANK_YOU_LETTER = 'thank-you-letter',

  // ─────────────────────────────────────
  // PRO TEMPLATES (Professionals) - 17
  // ─────────────────────────────────────
  EXPERIENCED_RESUME = 'experienced-resume',
  COVER_LETTER_PRO = 'cover-letter-pro',
  BUSINESS_PROPOSAL = 'business-proposal',
  PROJECT_PROPOSAL = 'project-proposal',
  MEETING_MINUTES = 'meeting-minutes',
  WEEKLY_REPORT = 'weekly-report',
  MONTHLY_REPORT = 'monthly-report',
  PERFORMANCE_REVIEW = 'performance-review',
  JOB_DESCRIPTION = 'job-description',
  OFFER_LETTER = 'offer-letter',
  RESIGNATION_LETTER = 'resignation-letter',
  PROFESSIONAL_EMAIL = 'professional-email',
  CLIENT_PROPOSAL = 'client-proposal',
  INVOICE_TEMPLATE = 'invoice-template',
  QUOTATION_TEMPLATE = 'quotation-template',
  NDA_BASIC = 'nda-basic',
  SERVICE_AGREEMENT = 'service-agreement',

  // ─────────────────────────────────────
  // APEX TEMPLATES (Executives) - 18
  // ─────────────────────────────────────
  EXECUTIVE_RESUME = 'executive-resume',
  EXECUTIVE_SUMMARY = 'executive-summary',
  BUSINESS_PLAN = 'business-plan',
  PITCH_DECK_OUTLINE = 'pitch-deck-outline',
  INVESTOR_EMAIL = 'investor-email',
  BOARD_REPORT = 'board-report',
  STRATEGIC_PLAN = 'strategic-plan',
  MARKET_ANALYSIS = 'market-analysis',
  COMPETITOR_ANALYSIS = 'competitor-analysis',
  PRESS_RELEASE = 'press-release',
  PARTNERSHIP_PROPOSAL = 'partnership-proposal',
  ANNUAL_REPORT_SUMMARY = 'annual-report-summary',
  VISION_DOCUMENT = 'vision-document',
  POLICY_DOCUMENT = 'policy-document',
  WHITE_PAPER_OUTLINE = 'white-paper-outline',
  CASE_STUDY = 'case-study',
  THOUGHT_LEADERSHIP = 'thought-leadership',
  KEYNOTE_OUTLINE = 'keynote-outline',
}

// ═══════════════════════════════════════════════════════════════
// FRESHER RESUME TEMPLATE (Complete Example)
// ═══════════════════════════════════════════════════════════════

const FRESHER_RESUME_FIELDS: TemplateField[] = [
  {
    id: 'fullName',
    label: 'Full Name',
    type: FieldType.TEXT,
    placeholder: 'Aman Sharma',
    required: true,
    order: 1,
    aiPrompt: 'Apna poora naam batao jaise aap resume mein likhna chahte ho.',
    maxLength: 100,
  },
  {
    id: 'email',
    label: 'Email Address',
    type: FieldType.EMAIL,
    placeholder: 'aman@example.com',
    required: true,
    validation: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
    errorMessage: 'Please enter a valid email address',
    order: 2,
    aiPrompt: 'Apna professional email address batao.',
  },
  {
    id: 'phone',
    label: 'Phone Number',
    type: FieldType.PHONE,
    placeholder: '+91 98765 43210',
    required: true,
    order: 3,
    aiPrompt: 'Apna phone number batao with country code.',
  },
  {
    id: 'location',
    label: 'Location',
    type: FieldType.TEXT,
    placeholder: 'Mumbai, Maharashtra',
    required: true,
    order: 4,
    aiPrompt: 'Apni current location batao - city aur state.',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Profile',
    type: FieldType.URL,
    placeholder: 'https://linkedin.com/in/yourprofile',
    required: false,
    order: 5,
    aiPrompt: 'Agar LinkedIn profile hai toh URL share karo, warna skip kar sakte ho.',
  },
  {
    id: 'objective',
    label: 'Career Objective',
    type: FieldType.TEXTAREA,
    placeholder: 'A motivated fresher seeking...',
    required: true,
    order: 6,
    aiPrompt: 'Apna career objective batao - kya role chahte ho aur kyun? 2-3 lines mein. Main enhance kar dunga.',
    maxLength: 500,
    hint: 'Brief 2-3 line objective. AI will enhance it.',
  },
  {
    id: 'education',
    label: 'Education',
    type: FieldType.LIST,
    required: true,
    order: 7,
    aiPrompt: 'Apni education details batao - degree, college name, year, aur percentage/CGPA. Latest first.',
    maxItems: 3,
    hint: 'Add your degrees, most recent first',
  },
  {
    id: 'skills',
    label: 'Skills',
    type: FieldType.LIST,
    required: true,
    order: 8,
    aiPrompt: 'Apni top skills batao - technical aur soft dono. Comma separated de sakte ho.',
    maxItems: 15,
    hint: 'Technical + Soft skills',
  },
  {
    id: 'projects',
    label: 'Projects',
    type: FieldType.LIST,
    required: false,
    order: 9,
    aiPrompt: 'Koi projects kiye hain? Project name, short description, aur technologies used batao.',
    maxItems: 4,
    hint: 'Academic or personal projects',
  },
  {
    id: 'internships',
    label: 'Internships',
    type: FieldType.LIST,
    required: false,
    order: 10,
    aiPrompt: 'Koi internship ki hai? Company, role, duration, aur kya kiya briefly batao.',
    maxItems: 3,
  },
  {
    id: 'certifications',
    label: 'Certifications',
    type: FieldType.LIST,
    required: false,
    order: 11,
    aiPrompt: 'Koi certifications hain? Certificate name aur issuing organization batao.',
    maxItems: 5,
  },
  {
    id: 'achievements',
    label: 'Achievements',
    type: FieldType.LIST,
    required: false,
    order: 12,
    aiPrompt: 'Koi achievements ya awards? Briefly batao.',
    maxItems: 4,
  },
  {
    id: 'languages',
    label: 'Languages',
    type: FieldType.LIST,
    required: false,
    order: 13,
    aiPrompt: 'Kaun kaun si languages aati hain? Hindi, English, etc.',
    maxItems: 5,
  },
  {
    id: 'hobbies',
    label: 'Hobbies & Interests',
    type: FieldType.LIST,
    required: false,
    order: 14,
    aiPrompt: 'Apne hobbies ya interests batao - optional hai but personality dikhata hai.',
    maxItems: 5,
  },
];

// ═══════════════════════════════════════════════════════════════
// COVER LETTER FRESHER TEMPLATE
// ═══════════════════════════════════════════════════════════════

const COVER_LETTER_FRESHER_FIELDS: TemplateField[] = [
  {
    id: 'applicantName',
    label: 'Your Name',
    type: FieldType.TEXT,
    required: true,
    order: 1,
    aiPrompt: 'Apna naam batao.',
  },
  {
    id: 'applicantEmail',
    label: 'Your Email',
    type: FieldType.EMAIL,
    required: true,
    order: 2,
    aiPrompt: 'Apna email address batao.',
  },
  {
    id: 'applicantPhone',
    label: 'Your Phone',
    type: FieldType.PHONE,
    required: true,
    order: 3,
    aiPrompt: 'Apna phone number batao.',
  },
  {
    id: 'companyName',
    label: 'Company Name',
    type: FieldType.TEXT,
    required: true,
    order: 4,
    aiPrompt: 'Kis company mein apply kar rahe ho?',
  },
  {
    id: 'jobTitle',
    label: 'Job Title',
    type: FieldType.TEXT,
    required: true,
    order: 5,
    aiPrompt: 'Kaun si position ke liye apply kar rahe ho?',
  },
  {
    id: 'hiringManager',
    label: 'Hiring Manager Name',
    type: FieldType.TEXT,
    required: false,
    order: 6,
    aiPrompt: 'Hiring manager ka naam pata hai? Agar nahi toh skip karo.',
    defaultValue: 'Hiring Manager',
  },
  {
    id: 'qualification',
    label: 'Your Qualification',
    type: FieldType.TEXT,
    required: true,
    order: 7,
    aiPrompt: 'Apni highest qualification batao - degree aur college.',
  },
  {
    id: 'relevantSkills',
    label: 'Relevant Skills',
    type: FieldType.LIST,
    required: true,
    order: 8,
    aiPrompt: 'Is job ke liye relevant skills batao.',
    maxItems: 6,
  },
  {
    id: 'whyCompany',
    label: 'Why This Company?',
    type: FieldType.TEXTAREA,
    required: true,
    order: 9,
    aiPrompt: 'Is company mein kyun kaam karna chahte ho? Kya attract karta hai?',
    maxLength: 300,
  },
  {
    id: 'whyYou',
    label: 'Why Should They Hire You?',
    type: FieldType.TEXTAREA,
    required: true,
    order: 10,
    aiPrompt: 'Aapko kyun hire karein? Apni strengths batao briefly.',
    maxLength: 300,
  },
];

// ═══════════════════════════════════════════════════════════════
// BUSINESS PROPOSAL TEMPLATE (PRO)
// ═══════════════════════════════════════════════════════════════

const BUSINESS_PROPOSAL_FIELDS: TemplateField[] = [
  {
    id: 'proposerName',
    label: 'Your Name / Company',
    type: FieldType.TEXT,
    required: true,
    order: 1,
    aiPrompt: 'Apna naam ya company name batao.',
  },
  {
    id: 'proposerEmail',
    label: 'Email',
    type: FieldType.EMAIL,
    required: true,
    order: 2,
    aiPrompt: 'Contact email batao.',
  },
  {
    id: 'clientName',
    label: 'Client Name / Company',
    type: FieldType.TEXT,
    required: true,
    order: 3,
    aiPrompt: 'Kis client ke liye proposal hai?',
  },
  {
    id: 'projectTitle',
    label: 'Project Title',
    type: FieldType.TEXT,
    required: true,
    order: 4,
    aiPrompt: 'Project ka title kya hoga?',
  },
  {
    id: 'executiveSummary',
    label: 'Executive Summary',
    type: FieldType.TEXTAREA,
    required: true,
    order: 5,
    aiPrompt: 'Project ka brief summary batao - kya hai, kyun zaroori hai. 3-4 lines.',
    maxLength: 500,
  },
  {
    id: 'problemStatement',
    label: 'Problem Statement',
    type: FieldType.TEXTAREA,
    required: true,
    order: 6,
    aiPrompt: 'Client ki kya problem solve karoge? Detail mein batao.',
    maxLength: 600,
  },
  {
    id: 'proposedSolution',
    label: 'Proposed Solution',
    type: FieldType.TEXTAREA,
    required: true,
    order: 7,
    aiPrompt: 'Aapka solution kya hai? Kaise problem solve hogi?',
    maxLength: 800,
  },
  {
    id: 'deliverables',
    label: 'Deliverables',
    type: FieldType.LIST,
    required: true,
    order: 8,
    aiPrompt: 'Kya kya deliver karoge? List mein batao.',
    maxItems: 10,
  },
  {
    id: 'timeline',
    label: 'Timeline',
    type: FieldType.TEXT,
    required: true,
    order: 9,
    aiPrompt: 'Project kitne time mein complete hoga? e.g., "4 weeks" ya "2 months"',
  },
  {
    id: 'budget',
    label: 'Budget / Pricing',
    type: FieldType.TEXT,
    required: true,
    order: 10,
    aiPrompt: 'Project ka budget ya pricing kya hai?',
  },
  {
    id: 'whyUs',
    label: 'Why Choose Us?',
    type: FieldType.TEXTAREA,
    required: true,
    order: 11,
    aiPrompt: 'Client aapko kyun choose kare? Apni strengths batao.',
    maxLength: 400,
  },
  {
    id: 'termsConditions',
    label: 'Terms & Conditions',
    type: FieldType.TEXTAREA,
    required: false,
    order: 12,
    aiPrompt: 'Koi specific terms ya conditions? Payment terms, revisions, etc.',
    maxLength: 500,
  },
];

// ═══════════════════════════════════════════════════════════════
// ALL TEMPLATES CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const DOCUMENT_TEMPLATES: Record<DocumentTemplateId, DocumentTemplate> = {
  
  // ─────────────────────────────────────────────────────────────
  // PLUS TEMPLATES (Students)
  // ─────────────────────────────────────────────────────────────

  [DocumentTemplateId.FRESHER_RESUME]: {
    id: DocumentTemplateId.FRESHER_RESUME,
    name: 'Fresher Resume',
    description: 'Professional resume for freshers and students with no experience',
    icon: '📄',
    category: DocumentCategory.CAREER,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.MODERATE,
    fields: FRESHER_RESUME_FIELDS,
    templateFile: 'templates/docx/fresher-resume.docx',
    systemPrompt: `You are a professional resume writer. Enhance the user's content to be:
- Concise and impactful
- Action-oriented with strong verbs
- ATS-friendly with relevant keywords
- Professional yet authentic
Keep the user's information accurate, just improve the language and presentation.
For freshers, emphasize projects, skills, and potential over experience.`,
    previewText: 'A clean, professional resume template perfect for college graduates and freshers entering the job market.',
    tags: ['resume', 'cv', 'fresher', 'student', 'job', 'career'],
    enabled: true,
    order: 1,
    estimatedTime: 30,
    version: '1.0.0',
  },

  [DocumentTemplateId.COVER_LETTER_FRESHER]: {
    id: DocumentTemplateId.COVER_LETTER_FRESHER,
    name: 'Cover Letter (Fresher)',
    description: 'Compelling cover letter for freshers applying for their first job',
    icon: '✉️',
    category: DocumentCategory.CAREER,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.MODERATE,
    fields: COVER_LETTER_FRESHER_FIELDS,
    templateFile: 'templates/docx/cover-letter.docx',
    systemPrompt: `You are an expert cover letter writer. Create a compelling cover letter that:
- Shows enthusiasm and genuine interest
- Highlights relevant skills and potential
- Connects the candidate's background to the job
- Uses professional but warm tone
- Is concise (under 400 words)
For freshers, focus on transferable skills, academic projects, and eagerness to learn.`,
    previewText: 'A persuasive cover letter template that helps freshers stand out in job applications.',
    tags: ['cover letter', 'fresher', 'job application', 'career'],
    enabled: true,
    order: 2,
    estimatedTime: 25,
    version: '1.0.0',
  },

  [DocumentTemplateId.INTERNSHIP_APPLICATION]: {
    id: DocumentTemplateId.INTERNSHIP_APPLICATION,
    name: 'Internship Application',
    description: 'Application letter for internship positions',
    icon: '🎯',
    category: DocumentCategory.CAREER,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [], // TODO: Add fields
    templateFile: 'templates/docx/internship-application.docx',
    systemPrompt: 'Help create a compelling internship application.',
    tags: ['internship', 'application', 'student'],
    enabled: false, // Enable when fields are ready
    order: 3,
    estimatedTime: 20,
    version: '1.0.0',
  },

  [DocumentTemplateId.COLLEGE_ASSIGNMENT]: {
    id: DocumentTemplateId.COLLEGE_ASSIGNMENT,
    name: 'College Assignment',
    description: 'Well-structured college assignment format',
    icon: '📚',
    category: DocumentCategory.ACADEMIC,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/college-assignment.docx',
    systemPrompt: 'Help format a college assignment professionally.',
    tags: ['assignment', 'college', 'academic'],
    enabled: false,
    order: 4,
    estimatedTime: 15,
    version: '1.0.0',
  },

  [DocumentTemplateId.PROJECT_REPORT]: {
    id: DocumentTemplateId.PROJECT_REPORT,
    name: 'Project Report',
    description: 'Academic project report with proper sections',
    icon: '📊',
    category: DocumentCategory.ACADEMIC,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/project-report.docx',
    systemPrompt: 'Help create a comprehensive project report.',
    tags: ['project', 'report', 'academic'],
    enabled: false,
    order: 5,
    estimatedTime: 40,
    version: '1.0.0',
  },

  [DocumentTemplateId.LAB_REPORT]: {
    id: DocumentTemplateId.LAB_REPORT,
    name: 'Lab Report',
    description: 'Scientific lab report format',
    icon: '🔬',
    category: DocumentCategory.ACADEMIC,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/lab-report.docx',
    systemPrompt: 'Help format a scientific lab report.',
    tags: ['lab', 'report', 'science', 'academic'],
    enabled: false,
    order: 6,
    estimatedTime: 25,
    version: '1.0.0',
  },

  [DocumentTemplateId.LEAVE_APPLICATION]: {
    id: DocumentTemplateId.LEAVE_APPLICATION,
    name: 'Leave Application',
    description: 'Formal leave application for college/office',
    icon: '🏖️',
    category: DocumentCategory.PERSONAL,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/leave-application.docx',
    systemPrompt: 'Help write a formal leave application.',
    tags: ['leave', 'application', 'formal'],
    enabled: false,
    order: 7,
    estimatedTime: 10,
    version: '1.0.0',
  },

  [DocumentTemplateId.PERMISSION_LETTER]: {
    id: DocumentTemplateId.PERMISSION_LETTER,
    name: 'Permission Letter',
    description: 'Formal permission request letter',
    icon: '📝',
    category: DocumentCategory.PERSONAL,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/permission-letter.docx',
    systemPrompt: 'Help write a permission request letter.',
    tags: ['permission', 'letter', 'formal'],
    enabled: false,
    order: 8,
    estimatedTime: 10,
    version: '1.0.0',
  },

  [DocumentTemplateId.RECOMMENDATION_REQUEST]: {
    id: DocumentTemplateId.RECOMMENDATION_REQUEST,
    name: 'Recommendation Request',
    description: 'Request letter for recommendation/reference',
    icon: '🌟',
    category: DocumentCategory.CAREER,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/recommendation-request.docx',
    systemPrompt: 'Help write a recommendation request letter.',
    tags: ['recommendation', 'reference', 'letter'],
    enabled: false,
    order: 9,
    estimatedTime: 15,
    version: '1.0.0',
  },

  [DocumentTemplateId.STUDY_NOTES]: {
    id: DocumentTemplateId.STUDY_NOTES,
    name: 'Study Notes',
    description: 'Organized study notes template',
    icon: '📒',
    category: DocumentCategory.ACADEMIC,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/study-notes.docx',
    systemPrompt: 'Help organize study notes effectively.',
    tags: ['notes', 'study', 'academic'],
    enabled: false,
    order: 10,
    estimatedTime: 20,
    version: '1.0.0',
  },

  [DocumentTemplateId.ESSAY_GENERAL]: {
    id: DocumentTemplateId.ESSAY_GENERAL,
    name: 'Essay',
    description: 'Well-structured essay format',
    icon: '✍️',
    category: DocumentCategory.ACADEMIC,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/essay.docx',
    systemPrompt: 'Help write a well-structured essay.',
    tags: ['essay', 'writing', 'academic'],
    enabled: false,
    order: 11,
    estimatedTime: 30,
    version: '1.0.0',
  },

  [DocumentTemplateId.PRESENTATION_OUTLINE]: {
    id: DocumentTemplateId.PRESENTATION_OUTLINE,
    name: 'Presentation Outline',
    description: 'Outline for presentations',
    icon: '📽️',
    category: DocumentCategory.ACADEMIC,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/presentation-outline.docx',
    systemPrompt: 'Help create a presentation outline.',
    tags: ['presentation', 'outline', 'slides'],
    enabled: false,
    order: 12,
    estimatedTime: 15,
    version: '1.0.0',
  },

  [DocumentTemplateId.EMAIL_TO_PROFESSOR]: {
    id: DocumentTemplateId.EMAIL_TO_PROFESSOR,
    name: 'Email to Professor',
    description: 'Professional email to professor/faculty',
    icon: '👨‍🏫',
    category: DocumentCategory.PERSONAL,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/email-professor.docx',
    systemPrompt: 'Help write a professional email to a professor.',
    tags: ['email', 'professor', 'academic'],
    enabled: false,
    order: 13,
    estimatedTime: 10,
    version: '1.0.0',
  },

  [DocumentTemplateId.LINKEDIN_STUDENT]: {
    id: DocumentTemplateId.LINKEDIN_STUDENT,
    name: 'LinkedIn Summary (Student)',
    description: 'Compelling LinkedIn summary for students',
    icon: '💼',
    category: DocumentCategory.CAREER,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/linkedin-student.docx',
    systemPrompt: 'Help write an engaging LinkedIn summary for a student.',
    tags: ['linkedin', 'profile', 'student'],
    enabled: false,
    order: 14,
    estimatedTime: 15,
    version: '1.0.0',
  },

  [DocumentTemplateId.THANK_YOU_LETTER]: {
    id: DocumentTemplateId.THANK_YOU_LETTER,
    name: 'Thank You Letter',
    description: 'Professional thank you letter',
    icon: '🙏',
    category: DocumentCategory.PERSONAL,
    minPlan: PlanType.PLUS,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/thank-you-letter.docx',
    systemPrompt: 'Help write a sincere thank you letter.',
    tags: ['thank you', 'letter', 'gratitude'],
    enabled: false,
    order: 15,
    estimatedTime: 10,
    version: '1.0.0',
  },

  // ─────────────────────────────────────────────────────────────
  // PRO TEMPLATES (Professionals)
  // ─────────────────────────────────────────────────────────────

  [DocumentTemplateId.EXPERIENCED_RESUME]: {
    id: DocumentTemplateId.EXPERIENCED_RESUME,
    name: 'Experienced Resume',
    description: 'Professional resume for experienced professionals',
    icon: '📄',
    category: DocumentCategory.CAREER,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/experienced-resume.docx',
    systemPrompt: 'Help create a professional resume highlighting experience and achievements.',
    tags: ['resume', 'cv', 'experienced', 'professional'],
    enabled: false,
    order: 16,
    estimatedTime: 35,
    version: '1.0.0',
  },

  [DocumentTemplateId.COVER_LETTER_PRO]: {
    id: DocumentTemplateId.COVER_LETTER_PRO,
    name: 'Cover Letter (Professional)',
    description: 'Professional cover letter for experienced candidates',
    icon: '✉️',
    category: DocumentCategory.CAREER,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/cover-letter-pro.docx',
    systemPrompt: 'Help write a compelling cover letter for an experienced professional.',
    tags: ['cover letter', 'professional', 'career'],
    enabled: false,
    order: 17,
    estimatedTime: 25,
    version: '1.0.0',
  },

  [DocumentTemplateId.BUSINESS_PROPOSAL]: {
    id: DocumentTemplateId.BUSINESS_PROPOSAL,
    name: 'Business Proposal',
    description: 'Comprehensive business proposal template',
    icon: '💼',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.COMPLEX,
    fields: BUSINESS_PROPOSAL_FIELDS,
    templateFile: 'templates/docx/business-proposal.docx',
    systemPrompt: `You are a business proposal expert. Create compelling proposals that:
- Clearly articulate the problem and solution
- Show understanding of client needs
- Present professional and confident tone
- Include clear deliverables and timeline
- Justify the pricing with value proposition`,
    previewText: 'A professional business proposal template to win clients and projects.',
    tags: ['proposal', 'business', 'client', 'project'],
    enabled: true,
    order: 18,
    estimatedTime: 40,
    version: '1.0.0',
  },

  [DocumentTemplateId.PROJECT_PROPOSAL]: {
    id: DocumentTemplateId.PROJECT_PROPOSAL,
    name: 'Project Proposal',
    description: 'Internal project proposal template',
    icon: '📋',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/project-proposal.docx',
    systemPrompt: 'Help create an internal project proposal.',
    tags: ['proposal', 'project', 'internal'],
    enabled: false,
    order: 19,
    estimatedTime: 30,
    version: '1.0.0',
  },

  [DocumentTemplateId.MEETING_MINUTES]: {
    id: DocumentTemplateId.MEETING_MINUTES,
    name: 'Meeting Minutes',
    description: 'Professional meeting minutes template',
    icon: '📝',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/meeting-minutes.docx',
    systemPrompt: 'Help document meeting minutes professionally.',
    tags: ['meeting', 'minutes', 'notes'],
    enabled: false,
    order: 20,
    estimatedTime: 15,
    version: '1.0.0',
  },

  [DocumentTemplateId.WEEKLY_REPORT]: {
    id: DocumentTemplateId.WEEKLY_REPORT,
    name: 'Weekly Report',
    description: 'Weekly status report template',
    icon: '📅',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/weekly-report.docx',
    systemPrompt: 'Help create a weekly status report.',
    tags: ['report', 'weekly', 'status'],
    enabled: false,
    order: 21,
    estimatedTime: 15,
    version: '1.0.0',
  },

  [DocumentTemplateId.MONTHLY_REPORT]: {
    id: DocumentTemplateId.MONTHLY_REPORT,
    name: 'Monthly Report',
    description: 'Monthly progress report template',
    icon: '📆',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/monthly-report.docx',
    systemPrompt: 'Help create a comprehensive monthly report.',
    tags: ['report', 'monthly', 'progress'],
    enabled: false,
    order: 22,
    estimatedTime: 25,
    version: '1.0.0',
  },

  [DocumentTemplateId.PERFORMANCE_REVIEW]: {
    id: DocumentTemplateId.PERFORMANCE_REVIEW,
    name: 'Performance Review',
    description: 'Employee performance review template',
    icon: '⭐',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/performance-review.docx',
    systemPrompt: 'Help write a balanced performance review.',
    tags: ['performance', 'review', 'hr'],
    enabled: false,
    order: 23,
    estimatedTime: 25,
    version: '1.0.0',
  },

  [DocumentTemplateId.JOB_DESCRIPTION]: {
    id: DocumentTemplateId.JOB_DESCRIPTION,
    name: 'Job Description',
    description: 'Professional job description template',
    icon: '👔',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/job-description.docx',
    systemPrompt: 'Help create an attractive job description.',
    tags: ['job', 'description', 'hiring'],
    enabled: false,
    order: 24,
    estimatedTime: 20,
    version: '1.0.0',
  },

  [DocumentTemplateId.OFFER_LETTER]: {
    id: DocumentTemplateId.OFFER_LETTER,
    name: 'Offer Letter',
    description: 'Employment offer letter template',
    icon: '🎉',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/offer-letter.docx',
    systemPrompt: 'Help create a professional offer letter.',
    tags: ['offer', 'letter', 'employment'],
    enabled: false,
    order: 25,
    estimatedTime: 20,
    version: '1.0.0',
  },

  [DocumentTemplateId.RESIGNATION_LETTER]: {
    id: DocumentTemplateId.RESIGNATION_LETTER,
    name: 'Resignation Letter',
    description: 'Professional resignation letter',
    icon: '👋',
    category: DocumentCategory.CAREER,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/resignation-letter.docx',
    systemPrompt: 'Help write a professional resignation letter.',
    tags: ['resignation', 'letter', 'career'],
    enabled: false,
    order: 26,
    estimatedTime: 15,
    version: '1.0.0',
  },

  [DocumentTemplateId.PROFESSIONAL_EMAIL]: {
    id: DocumentTemplateId.PROFESSIONAL_EMAIL,
    name: 'Professional Email',
    description: 'Business email templates',
    icon: '📧',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/professional-email.docx',
    systemPrompt: 'Help write professional business emails.',
    tags: ['email', 'business', 'communication'],
    enabled: false,
    order: 27,
    estimatedTime: 10,
    version: '1.0.0',
  },

  [DocumentTemplateId.CLIENT_PROPOSAL]: {
    id: DocumentTemplateId.CLIENT_PROPOSAL,
    name: 'Client Proposal',
    description: 'Service/project proposal for clients',
    icon: '🤝',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/client-proposal.docx',
    systemPrompt: 'Help create a persuasive client proposal.',
    tags: ['proposal', 'client', 'service'],
    enabled: false,
    order: 28,
    estimatedTime: 35,
    version: '1.0.0',
  },

  [DocumentTemplateId.INVOICE_TEMPLATE]: {
    id: DocumentTemplateId.INVOICE_TEMPLATE,
    name: 'Invoice',
    description: 'Professional invoice template',
    icon: '🧾',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/invoice.docx',
    systemPrompt: 'Help create a professional invoice.',
    tags: ['invoice', 'billing', 'payment'],
    enabled: false,
    order: 29,
    estimatedTime: 15,
    version: '1.0.0',
  },

  [DocumentTemplateId.QUOTATION_TEMPLATE]: {
    id: DocumentTemplateId.QUOTATION_TEMPLATE,
    name: 'Quotation',
    description: 'Price quotation template',
    icon: '💰',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.SIMPLE,
    fields: [],
    templateFile: 'templates/docx/quotation.docx',
    systemPrompt: 'Help create a clear quotation.',
    tags: ['quotation', 'pricing', 'quote'],
    enabled: false,
    order: 30,
    estimatedTime: 15,
    version: '1.0.0',
  },

  [DocumentTemplateId.NDA_BASIC]: {
    id: DocumentTemplateId.NDA_BASIC,
    name: 'NDA (Basic)',
    description: 'Basic non-disclosure agreement',
    icon: '🔒',
    category: DocumentCategory.LEGAL,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/nda-basic.docx',
    systemPrompt: 'Help create a basic NDA. Note: This is a template, consult a lawyer for legal advice.',
    tags: ['nda', 'legal', 'confidential'],
    enabled: false,
    order: 31,
    estimatedTime: 20,
    version: '1.0.0',
  },

  [DocumentTemplateId.SERVICE_AGREEMENT]: {
    id: DocumentTemplateId.SERVICE_AGREEMENT,
    name: 'Service Agreement',
    description: 'Basic service agreement template',
    icon: '📜',
    category: DocumentCategory.LEGAL,
    minPlan: PlanType.PRO,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/service-agreement.docx',
    systemPrompt: 'Help create a service agreement. Note: This is a template, consult a lawyer for legal advice.',
    tags: ['agreement', 'service', 'contract'],
    enabled: false,
    order: 32,
    estimatedTime: 30,
    version: '1.0.0',
  },

  // ─────────────────────────────────────────────────────────────
  // APEX TEMPLATES (Executives/Leaders)
  // ─────────────────────────────────────────────────────────────

  [DocumentTemplateId.EXECUTIVE_RESUME]: {
    id: DocumentTemplateId.EXECUTIVE_RESUME,
    name: 'Executive Resume',
    description: 'C-level executive resume template',
    icon: '👔',
    category: DocumentCategory.CAREER,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/executive-resume.docx',
    systemPrompt: 'Help create an executive-level resume showcasing leadership and impact.',
    tags: ['resume', 'executive', 'leadership'],
    enabled: false,
    order: 33,
    estimatedTime: 45,
    version: '1.0.0',
  },

  [DocumentTemplateId.EXECUTIVE_SUMMARY]: {
    id: DocumentTemplateId.EXECUTIVE_SUMMARY,
    name: 'Executive Summary',
    description: 'Concise executive summary template',
    icon: '📊',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/executive-summary.docx',
    systemPrompt: 'Help write a compelling executive summary.',
    tags: ['executive', 'summary', 'business'],
    enabled: false,
    order: 34,
    estimatedTime: 25,
    version: '1.0.0',
  },

  [DocumentTemplateId.BUSINESS_PLAN]: {
    id: DocumentTemplateId.BUSINESS_PLAN,
    name: 'Business Plan',
    description: 'Comprehensive business plan template',
    icon: '🚀',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/business-plan.docx',
    systemPrompt: 'Help create a comprehensive business plan.',
    tags: ['business plan', 'startup', 'strategy'],
    enabled: false,
    order: 35,
    estimatedTime: 60,
    version: '1.0.0',
  },

  [DocumentTemplateId.PITCH_DECK_OUTLINE]: {
    id: DocumentTemplateId.PITCH_DECK_OUTLINE,
    name: 'Pitch Deck Outline',
    description: 'Investor pitch deck structure',
    icon: '📈',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/pitch-deck-outline.docx',
    systemPrompt: 'Help create a compelling pitch deck outline.',
    tags: ['pitch', 'investor', 'startup'],
    enabled: false,
    order: 36,
    estimatedTime: 40,
    version: '1.0.0',
  },

  [DocumentTemplateId.INVESTOR_EMAIL]: {
    id: DocumentTemplateId.INVESTOR_EMAIL,
    name: 'Investor Email',
    description: 'Cold email template for investors',
    icon: '💵',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/investor-email.docx',
    systemPrompt: 'Help write a compelling investor outreach email.',
    tags: ['investor', 'email', 'funding'],
    enabled: false,
    order: 37,
    estimatedTime: 20,
    version: '1.0.0',
  },

  [DocumentTemplateId.BOARD_REPORT]: {
    id: DocumentTemplateId.BOARD_REPORT,
    name: 'Board Report',
    description: 'Board meeting report template',
    icon: '🏛️',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/board-report.docx',
    systemPrompt: 'Help create a comprehensive board report.',
    tags: ['board', 'report', 'corporate'],
    enabled: false,
    order: 38,
    estimatedTime: 45,
    version: '1.0.0',
  },

  [DocumentTemplateId.STRATEGIC_PLAN]: {
    id: DocumentTemplateId.STRATEGIC_PLAN,
    name: 'Strategic Plan',
    description: 'Long-term strategic planning document',
    icon: '🎯',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/strategic-plan.docx',
    systemPrompt: 'Help develop a strategic plan.',
    tags: ['strategy', 'planning', 'vision'],
    enabled: false,
    order: 39,
    estimatedTime: 50,
    version: '1.0.0',
  },

  [DocumentTemplateId.MARKET_ANALYSIS]: {
    id: DocumentTemplateId.MARKET_ANALYSIS,
    name: 'Market Analysis',
    description: 'Market research analysis template',
    icon: '📉',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/market-analysis.docx',
    systemPrompt: 'Help create a market analysis report.',
    tags: ['market', 'analysis', 'research'],
    enabled: false,
    order: 40,
    estimatedTime: 45,
    version: '1.0.0',
  },

  [DocumentTemplateId.COMPETITOR_ANALYSIS]: {
    id: DocumentTemplateId.COMPETITOR_ANALYSIS,
    name: 'Competitor Analysis',
    description: 'Competitive analysis framework',
    icon: '🔍',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/competitor-analysis.docx',
    systemPrompt: 'Help analyze competitors systematically.',
    tags: ['competitor', 'analysis', 'strategy'],
    enabled: false,
    order: 41,
    estimatedTime: 40,
    version: '1.0.0',
  },

  [DocumentTemplateId.PRESS_RELEASE]: {
    id: DocumentTemplateId.PRESS_RELEASE,
    name: 'Press Release',
    description: 'Professional press release template',
    icon: '📰',
    category: DocumentCategory.MARKETING,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/press-release.docx',
    systemPrompt: 'Help write a newsworthy press release.',
    tags: ['press', 'release', 'media'],
    enabled: false,
    order: 42,
    estimatedTime: 25,
    version: '1.0.0',
  },

  [DocumentTemplateId.PARTNERSHIP_PROPOSAL]: {
    id: DocumentTemplateId.PARTNERSHIP_PROPOSAL,
    name: 'Partnership Proposal',
    description: 'Business partnership proposal',
    icon: '🤝',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/partnership-proposal.docx',
    systemPrompt: 'Help create a partnership proposal.',
    tags: ['partnership', 'proposal', 'collaboration'],
    enabled: false,
    order: 43,
    estimatedTime: 40,
    version: '1.0.0',
  },

  [DocumentTemplateId.ANNUAL_REPORT_SUMMARY]: {
    id: DocumentTemplateId.ANNUAL_REPORT_SUMMARY,
    name: 'Annual Report Summary',
    description: 'Annual report executive summary',
    icon: '📅',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX, DocumentFormat.PDF],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/annual-report-summary.docx',
    systemPrompt: 'Help summarize annual performance.',
    tags: ['annual', 'report', 'summary'],
    enabled: false,
    order: 44,
    estimatedTime: 45,
    version: '1.0.0',
  },

  [DocumentTemplateId.VISION_DOCUMENT]: {
    id: DocumentTemplateId.VISION_DOCUMENT,
    name: 'Vision Document',
    description: 'Company/product vision document',
    icon: '👁️',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/vision-document.docx',
    systemPrompt: 'Help articulate a compelling vision.',
    tags: ['vision', 'mission', 'leadership'],
    enabled: false,
    order: 45,
    estimatedTime: 30,
    version: '1.0.0',
  },

  [DocumentTemplateId.POLICY_DOCUMENT]: {
    id: DocumentTemplateId.POLICY_DOCUMENT,
    name: 'Policy Document',
    description: 'Company policy template',
    icon: '📋',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/policy-document.docx',
    systemPrompt: 'Help draft a company policy.',
    tags: ['policy', 'guidelines', 'corporate'],
    enabled: false,
    order: 46,
    estimatedTime: 30,
    version: '1.0.0',
  },

  [DocumentTemplateId.WHITE_PAPER_OUTLINE]: {
    id: DocumentTemplateId.WHITE_PAPER_OUTLINE,
    name: 'White Paper Outline',
    description: 'Technical/business white paper structure',
    icon: '📑',
    category: DocumentCategory.MARKETING,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.COMPLEX,
    fields: [],
    templateFile: 'templates/docx/white-paper-outline.docx',
    systemPrompt: 'Help structure a white paper.',
    tags: ['white paper', 'thought leadership', 'content'],
    enabled: false,
    order: 47,
    estimatedTime: 40,
    version: '1.0.0',
  },

  [DocumentTemplateId.CASE_STUDY]: {
    id: DocumentTemplateId.CASE_STUDY,
    name: 'Case Study',
    description: 'Business case study template',
    icon: '📖',
    category: DocumentCategory.MARKETING,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/case-study.docx',
    systemPrompt: 'Help write a compelling case study.',
    tags: ['case study', 'success story', 'marketing'],
    enabled: false,
    order: 48,
    estimatedTime: 35,
    version: '1.0.0',
  },

  [DocumentTemplateId.THOUGHT_LEADERSHIP]: {
    id: DocumentTemplateId.THOUGHT_LEADERSHIP,
    name: 'Thought Leadership Article',
    description: 'Industry thought leadership piece',
    icon: '💡',
    category: DocumentCategory.MARKETING,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/thought-leadership.docx',
    systemPrompt: 'Help write a thought leadership article.',
    tags: ['thought leadership', 'article', 'expert'],
    enabled: false,
    order: 49,
    estimatedTime: 35,
    version: '1.0.0',
  },

  [DocumentTemplateId.KEYNOTE_OUTLINE]: {
    id: DocumentTemplateId.KEYNOTE_OUTLINE,
    name: 'Keynote Outline',
    description: 'Keynote speech structure',
    icon: '🎤',
    category: DocumentCategory.BUSINESS,
    minPlan: PlanType.APEX,
    formats: [DocumentFormat.DOCX],
    complexity: TemplateComplexity.MODERATE,
    fields: [],
    templateFile: 'templates/docx/keynote-outline.docx',
    systemPrompt: 'Help structure a keynote speech.',
    tags: ['keynote', 'speech', 'presentation'],
    enabled: false,
    order: 50,
    estimatedTime: 30,
    version: '1.0.0',
  },
};

// ═══════════════════════════════════════════════════════════════
// PLAN ACCESS MAPPING
// ═══════════════════════════════════════════════════════════════

export const PLAN_DOCUMENT_ACCESS: Record<PlanType, DocumentTemplateId[]> = {
    [PlanType.STARTER]: [
      DocumentTemplateId.FRESHER_RESUME,
      DocumentTemplateId.INTERNSHIP_APPLICATION,
      DocumentTemplateId.LEAVE_APPLICATION,
      DocumentTemplateId.THANK_YOU_LETTER,
      DocumentTemplateId.ESSAY_GENERAL,
    ],
    // ✅ NEW: LITE plan - Same as STARTER
    [PlanType.LITE]: [
      DocumentTemplateId.FRESHER_RESUME,
      DocumentTemplateId.INTERNSHIP_APPLICATION,
      DocumentTemplateId.LEAVE_APPLICATION,
      DocumentTemplateId.THANK_YOU_LETTER,
      DocumentTemplateId.ESSAY_GENERAL,
    ],
      
  [PlanType.PLUS]: [
    DocumentTemplateId.FRESHER_RESUME,
    DocumentTemplateId.COVER_LETTER_FRESHER,
    DocumentTemplateId.INTERNSHIP_APPLICATION,
    DocumentTemplateId.COLLEGE_ASSIGNMENT,
    DocumentTemplateId.PROJECT_REPORT,
    DocumentTemplateId.LAB_REPORT,
    DocumentTemplateId.LEAVE_APPLICATION,
    DocumentTemplateId.PERMISSION_LETTER,
    DocumentTemplateId.RECOMMENDATION_REQUEST,
    DocumentTemplateId.STUDY_NOTES,
    DocumentTemplateId.ESSAY_GENERAL,
    DocumentTemplateId.PRESENTATION_OUTLINE,
    DocumentTemplateId.EMAIL_TO_PROFESSOR,
    DocumentTemplateId.LINKEDIN_STUDENT,
    DocumentTemplateId.THANK_YOU_LETTER,
  ],
  
  [PlanType.PRO]: [
    // All PLUS templates
    ...Object.values(DocumentTemplateId).filter(id => 
      DOCUMENT_TEMPLATES[id]?.minPlan === PlanType.PLUS
    ),
    // PRO templates
    DocumentTemplateId.EXPERIENCED_RESUME,
    DocumentTemplateId.COVER_LETTER_PRO,
    DocumentTemplateId.BUSINESS_PROPOSAL,
    DocumentTemplateId.PROJECT_PROPOSAL,
    DocumentTemplateId.MEETING_MINUTES,
    DocumentTemplateId.WEEKLY_REPORT,
    DocumentTemplateId.MONTHLY_REPORT,
    DocumentTemplateId.PERFORMANCE_REVIEW,
    DocumentTemplateId.JOB_DESCRIPTION,
    DocumentTemplateId.OFFER_LETTER,
    DocumentTemplateId.RESIGNATION_LETTER,
    DocumentTemplateId.PROFESSIONAL_EMAIL,
    DocumentTemplateId.CLIENT_PROPOSAL,
    DocumentTemplateId.INVOICE_TEMPLATE,
    DocumentTemplateId.QUOTATION_TEMPLATE,
    DocumentTemplateId.NDA_BASIC,
    DocumentTemplateId.SERVICE_AGREEMENT,
  ],
  
  [PlanType.APEX]: Object.values(DocumentTemplateId), // All templates
  
  [PlanType.SOVEREIGN]: Object.values(DocumentTemplateId), // All templates
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TEMPLATES MANAGER CLASS
// ═══════════════════════════════════════════════════════════════

export class DocumentTemplatesManager {
  private static instance: DocumentTemplatesManager;
  private templates: Map<DocumentTemplateId, DocumentTemplate>;

  private constructor() {
    this.templates = new Map(
      Object.entries(DOCUMENT_TEMPLATES) as [DocumentTemplateId, DocumentTemplate][]
    );
  }

  public static getInstance(): DocumentTemplatesManager {
    if (!DocumentTemplatesManager.instance) {
      DocumentTemplatesManager.instance = new DocumentTemplatesManager();
    }
    return DocumentTemplatesManager.instance;
  }

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE RETRIEVAL
  // ─────────────────────────────────────────────────────────────

  public getTemplate(id: DocumentTemplateId): DocumentTemplate | undefined {
    return this.templates.get(id);
  }

  public getAllTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values()).sort((a, b) => a.order - b.order);
  }

  public getEnabledTemplates(): DocumentTemplate[] {
    return this.getAllTemplates().filter(t => t.enabled);
  }

  public getTemplatesForPlan(plan: PlanType): DocumentTemplate[] {
    const accessibleIds = PLAN_DOCUMENT_ACCESS[plan] || [];
    return accessibleIds
      .map(id => this.templates.get(id))
      .filter((t): t is DocumentTemplate => t !== undefined && t.enabled)
      .sort((a, b) => a.order - b.order);
  }

  public getTemplatesByCategory(category: DocumentCategory): DocumentTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category && t.enabled);
  }

  // ─────────────────────────────────────────────────────────────
  // ACCESS CONTROL
  // ─────────────────────────────────────────────────────────────

  public canAccessTemplate(plan: PlanType, templateId: DocumentTemplateId): boolean {
    const accessibleIds = PLAN_DOCUMENT_ACCESS[plan] || [];
    const template = this.templates.get(templateId);
    return accessibleIds.includes(templateId) && (template?.enabled ?? false);
  }

  public getLockedTemplates(plan: PlanType): DocumentTemplate[] {
    const accessibleIds = PLAN_DOCUMENT_ACCESS[plan] || [];
    return this.getAllTemplates().filter(t => !accessibleIds.includes(t.id as DocumentTemplateId) && t.enabled);
  }

  // ─────────────────────────────────────────────────────────────
  // STATISTICS
  // ─────────────────────────────────────────────────────────────

  public getStats() {
    const all = this.getAllTemplates();
    const enabled = this.getEnabledTemplates();
    
    return {
      total: all.length,
      enabled: enabled.length,
      disabled: all.length - enabled.length,
        byPlan: {
        starter: this.getTemplatesForPlan(PlanType.STARTER).length,
        lite: this.getTemplatesForPlan(PlanType.LITE).length,
        plus: this.getTemplatesForPlan(PlanType.PLUS).length,
        pro: this.getTemplatesForPlan(PlanType.PRO).length,
        apex: this.getTemplatesForPlan(PlanType.APEX).length,
        sovereign: this.getTemplatesForPlan(PlanType.SOVEREIGN).length,
      },
        byCategory: {
        career: this.getTemplatesByCategory(DocumentCategory.CAREER).length,
        academic: this.getTemplatesByCategory(DocumentCategory.ACADEMIC).length,
        business: this.getTemplatesByCategory(DocumentCategory.BUSINESS).length,
        personal: this.getTemplatesByCategory(DocumentCategory.PERSONAL).length,
        legal: this.getTemplatesByCategory(DocumentCategory.LEGAL).length,
        marketing: this.getTemplatesByCategory(DocumentCategory.MARKETING).length,
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const documentTemplatesManager = DocumentTemplatesManager.getInstance();