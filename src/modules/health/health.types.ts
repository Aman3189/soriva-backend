// ============================================
// SORIVA HEALTH - TYPE DEFINITIONS
// Path: src/modules/health/health.types.ts
// ============================================
// REFOCUSED: Safe types only
// NO: Scores, Risk, Predictions, Medical Claims
// YES: Storage, Organization, Education, Q&A
// ============================================

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type HealthPlan = 'FREE' | 'PERSONAL' | 'FAMILY';
export type HealthRegion = 'IN' | 'INTERNATIONAL';
export type ReportType = 'BLOOD_TEST' | 'XRAY' | 'MRI' | 'CT_SCAN' | 'ULTRASOUND' | 'ECG' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'OTHER';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REPORT INTERFACES (Storage & Organization Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface HealthReport {
  id: string;
  userId: string;
  familyMemberId?: string;      // If uploaded for family member
  
  // Basic Info
  title: string;
  reportType: ReportType;
  reportDate: Date;             // When the test was done
  uploadedAt: Date;
  
  // File Info
  fileName: string;
  fileUrl: string;              // S3/Cloud storage URL
  fileSize: number;
  pageCount: number;
  mimeType: string;
  
  // Extracted Content (OCR)
  extractedText?: string;       // Raw OCR text
  
  // User's Own Notes (NOT AI generated)
  userNotes?: string;
  tags?: string[];
  
  // Organization
  labName?: string;
  doctorName?: string;
  
  // Metadata
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FAMILY MEMBER (Organization Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface FamilyMember {
  id: string;
  userId: string;               // Owner's user ID
  name: string;
  relation: string;             // "Self", "Spouse", "Parent", "Child", etc.
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHAT INTERFACES (Educational Q&A Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ChatMessageRole = 'user' | 'assistant';

export interface HealthChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  
  // Context (which report is being discussed)
  reportId?: string;
  
  // Token tracking
  tokensUsed?: number;
}

export interface HealthChatSession {
  id: string;
  userId: string;
  reportId?: string;            // If chat is about specific report
  messages: HealthChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TERM EXPLANATION (Educational Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TermExplanationRequest {
  term: string;                 // e.g., "HbA1c", "Cholesterol", "Hemoglobin"
  context?: string;             // Optional context from report
  reportId?: string;            // Which report this term is from
}

export interface TermExplanationResponse {
  term: string;
  explanation: string;          // Plain-English explanation
  disclaimer: string;           // Always included
  relatedTerms?: string[];      // Other terms user might want to know
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOCTOR QUESTION GENERATOR (Preparation Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DoctorQuestionsRequest {
  reportId: string;
  userConcerns?: string;        // What user is worried about
}

export interface DoctorQuestionsResponse {
  questions: string[];          // Suggested questions to ask doctor
  disclaimer: string;           // Always included
  note: string;                 // "These are suggestions, your doctor knows best"
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REPORT COMPARISON (Side-by-Side View Only - NO Analysis)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ReportComparisonRequest {
  reportId1: string;
  reportId2: string;
}

export interface ReportComparisonResponse {
  report1: {
    id: string;
    title: string;
    date: Date;
    summary: string;            // Brief factual summary (no interpretation)
  };
  report2: {
    id: string;
    title: string;
    date: Date;
    summary: string;
  };
  disclaimer: string;           // "This is a side-by-side view, not medical analysis"
  suggestion: string;           // "Discuss any changes with your doctor"
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REMINDERS (Non-Medical, User-Set Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface FollowUpReminder {
  id: string;
  userId: string;
  reportId?: string;
  
  // User-defined (NOT AI suggested)
  title: string;                // e.g., "Follow-up with Dr. Sharma"
  notes?: string;
  reminderDate: Date;
  
  // Status
  isCompleted: boolean;
  completedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USAGE TRACKING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface HealthUsage {
  userId: string;
  
  // Monthly counters (reset on 1st)
  pagesUploaded: number;
  tokensUsed: number;
  comparisonsUsed: number;
  
  // Tracking
  periodStart: Date;
  periodEnd: Date;
  lastUpdated: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API REQUEST/RESPONSE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Upload Report
export interface UploadReportRequest {
  title: string;
  reportType: ReportType;
  reportDate: string;           // ISO date string
  familyMemberId?: string;
  labName?: string;
  doctorName?: string;
  userNotes?: string;
  tags?: string[];
}

export interface UploadReportResponse {
  success: boolean;
  report?: HealthReport;
  usage: {
    pagesUsed: number;
    pagesRemaining: number;
    percentUsed: number;
  };
  error?: string;
}

// List Reports
export interface ListReportsRequest {
  familyMemberId?: string;      // Filter by family member
  reportType?: ReportType;      // Filter by type
  startDate?: string;           // Filter by date range
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ListReportsResponse {
  success: boolean;
  reports: HealthReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Chat
export interface HealthChatRequest {
  message: string;
  reportId?: string;            // If asking about specific report
  sessionId?: string;           // Continue existing session
}

export interface HealthChatResponse {
  success: boolean;
  message: string;
  disclaimer: string;           // Always included
  sessionId: string;
  tokensUsed: number;
  usage: {
    tokensUsed: number;
    tokensRemaining: number;
    percentUsed: number;
  };
}

// Timeline
export interface TimelineRequest {
  familyMemberId?: string;
  year?: number;
}

export interface TimelineResponse {
  success: boolean;
  timeline: {
    month: string;              // "January 2025"
    reports: {
      id: string;
      title: string;
      type: ReportType;
      date: Date;
    }[];
  }[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type HealthErrorCode = 
  | 'LIMIT_EXCEEDED'
  | 'FEATURE_NOT_AVAILABLE'
  | 'REPORT_NOT_FOUND'
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'UPLOAD_FAILED'
  | 'OCR_FAILED'
  | 'CHAT_ERROR'
  | 'UNAUTHORIZED';

export interface HealthError {
  code: HealthErrorCode;
  message: string;
  suggestion?: string;          // How to resolve
}