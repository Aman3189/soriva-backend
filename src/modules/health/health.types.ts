// ============================================
// SORIVA HEALTH - TYPE DEFINITIONS
// Path: src/modules/health/health.types.ts
// ============================================

import {
  HealthPlan,
  HealthSubscriptionStatus,
  ReportType,
  RiskLevel,
  OrganSystem,
  HealthAlertType,
  HealthAlertPriority,
} from '@prisma/client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUEST TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Upload Report
export interface UploadReportRequest {
  title: string;
  reportType?: ReportType;
  reportDate?: string;
  labName?: string;
  doctorName?: string;
  familyMemberId?: string;
}

// Health Chat
export interface HealthChatRequest {
  message: string;
  sessionId?: string;
  familyMemberId?: string;
  referencedReportIds?: string[];
}

// Compare Reports
export interface CompareReportsRequest {
  report1Id: string;
  report2Id: string;
}

// Generate Summary
export interface GenerateSummaryRequest {
  reportId: string;
  doctorName?: string;
  hospitalName?: string;
  visitDate?: string;
}

// Family Member
export interface AddFamilyMemberRequest {
  name: string;
  relation: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
}

export interface UpdateFamilyMemberRequest extends Partial<AddFamilyMemberRequest> {
  isActive?: boolean;
}

// Emergency Contact
export interface AddEmergencyContactRequest {
  name: string;
  relation: string;
  phone: string;
  isPrimary?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESPONSE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Report Analysis Response
export interface ReportAnalysisResponse {
  reportId: string;
  healthScore: number;
  overallRiskLevel: RiskLevel;
  keyFindings: string[];
  recommendations: string[];
  biomarkers: BiomarkerResult[];
  organBreakdowns: OrganBreakdownResult[];
  disclaimer?: string;
}

export interface BiomarkerResult {
  name: string;
  value: number;
  unit: string;
  status: RiskLevel;
  refRange: string;
  interpretation: string;
  organSystem?: OrganSystem;
}

export interface OrganBreakdownResult {
  organSystem: OrganSystem;
  healthScore: number;
  riskLevel: RiskLevel;
  status: string;
  findings: string[];
  recommendations: string[];
}

// Comparison Response
export interface ComparisonResponse {
  comparisonId: string;
  report1: ReportSummary;
  report2: ReportSummary;
  overallTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  improvementAreas: string[];
  worseningAreas: string[];
  stableAreas: string[];
  insights: string[];
  recommendations: string[];
}

export interface ReportSummary {
  id: string;
  title: string;
  reportDate: Date;
  healthScore: number;
  riskLevel: RiskLevel;
}

// Chat Response
export interface HealthChatResponse {
  messageId: string;
  sessionId: string;
  content: string;
  referencedReports?: ReportSummary[];
  disclaimer?: string; 
}

// Dashboard Stats
export interface DashboardStatsResponse {
  totalReports: number;
  latestHealthScore: number | null;
  overallTrend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';
  riskAreas: string[];
  upcomingReminders: AlertSummary[];
  recentReports: ReportSummary[];
}

export interface AlertSummary {
  id: string;
  type: HealthAlertType;
  priority: HealthAlertPriority;
  title: string;
  message: string;
  createdAt: Date;
}

// Usage Response
export interface UsageResponse {
  plan: HealthPlan;
  usage: {
    reports: { used: number; limit: number; remaining: number };
    chats: { used: number; limit: number; remaining: number };
    comparisons: { used: number; limit: number; remaining: number };
    summaries: { used: number; limit: number; remaining: number };
  };
  familyMembers: {
    count: number;
    limit: number;
  };
  resetDate: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI SERVICE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface OCRResult {
  text: string;
  confidence: number;
  processedAt: Date;
}

export interface AIAnalysisInput {
  ocrText: string;
  reportType: ReportType;
  userContext?: {
    age?: number;
    gender?: string;
    conditions?: string[];
    medications?: string[];
  };
}

export interface AIAnalysisOutput {
  healthScore: number;
  riskLevel: RiskLevel;
  keyFindings: string[];
  recommendations: string[];
  biomarkers: BiomarkerResult[];
  organBreakdowns: OrganBreakdownResult[];
}

export interface AIChatInput {
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
  reportContext?: string;
  userContext?: {
    age?: number;
    gender?: string;
    conditions?: string[];
  };
}

export interface AIChatOutput {
  response: string;
  tokensUsed: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUBSCRIPTION TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SubscriptionInfo {
  plan: HealthPlan;
  status: HealthSubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  price: number;
  currency: string;
  features: string[];
}

export interface UpgradeRequest {
  targetPlan: HealthPlan;
  paymentMethod?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATIC DATA TYPES (Doctors/Hospitals)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  city: string;
  phone?: string;
  rating?: number;
  experience?: number;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  phone?: string;
  emergency?: boolean;
  specialties?: string[];
  rating?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class HealthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'HealthError';
  }
}

export const HEALTH_ERROR_CODES = {
  LIMIT_EXCEEDED: 'HEALTH_LIMIT_EXCEEDED',
  FEATURE_NOT_AVAILABLE: 'HEALTH_FEATURE_NOT_AVAILABLE',
  REPORT_NOT_FOUND: 'HEALTH_REPORT_NOT_FOUND',
  INVALID_FILE: 'HEALTH_INVALID_FILE',
  OCR_FAILED: 'HEALTH_OCR_FAILED',
  ANALYSIS_FAILED: 'HEALTH_ANALYSIS_FAILED',
  SUBSCRIPTION_REQUIRED: 'HEALTH_SUBSCRIPTION_REQUIRED',
  FAMILY_MEMBER_LIMIT: 'HEALTH_FAMILY_MEMBER_LIMIT',
  UPLOAD_FAILED: 'HEALTH_UPLOAD_FAILED',
} as const;