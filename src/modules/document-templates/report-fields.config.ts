/**
 * ============================================================================
 * SORIVA TEMPLATES - REPORT FIELDS CONFIGURATION
 * ============================================================================
 * 
 * @fileoverview Comprehensive field configuration for all report templates
 * @version 2.0.0
 * @author Soriva AI (Risenex Dynamics)
 * @copyright 2025 Risenex Dynamics. All rights reserved.
 * 
 * SUPPORTED REPORT TYPES:
 * - Business Report (report-business.hbs)
 * - Project Report (report-project.hbs)
 * - Analysis Report (report-analysis.hbs)
 * - Financial Report (report-financial.hbs)
 * - Progress Report (report-progress.hbs)
 * - Incident Report (report-incident.hbs)
 * - Meeting Report (report-meeting.hbs)
 * 
 * FEATURES:
 * - Full TypeScript type safety
 * - Bilingual support (English + Hindi)
 * - A4 print-ready formatting
 * - Comprehensive validation
 * - Dynamic field generation
 * - Sample data for all variants
 * ============================================================================
 */

// ============================================================================
// SECTION 1: ENUMS & CONSTANTS
// ============================================================================

/**
 * Report type identifiers
 */
export enum ReportType {
    BUSINESS = 'business',
    PROJECT = 'project',
    ANALYSIS = 'analysis',
    FINANCIAL = 'financial',
    PROGRESS = 'progress',
    INCIDENT = 'incident',
    MEETING = 'meeting'
}

/**
 * Report status options
 */
export enum ReportStatus {
    DRAFT = 'draft',
    PENDING_REVIEW = 'pending_review',
    UNDER_REVIEW = 'under_review',
    APPROVED = 'approved',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
    CONFIDENTIAL = 'confidential'
}

/**
 * Priority levels for reports
 */
export enum PriorityLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
    URGENT = 'urgent'
}

/**
 * Report frequency options
 */
export enum ReportFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    BIWEEKLY = 'biweekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    SEMI_ANNUAL = 'semi_annual',
    ANNUAL = 'annual',
    AD_HOC = 'ad_hoc',
    ONE_TIME = 'one_time'
}

/**
 * Confidentiality levels
 */
export enum ConfidentialityLevel {
    PUBLIC = 'public',
    INTERNAL = 'internal',
    CONFIDENTIAL = 'confidential',
    RESTRICTED = 'restricted',
    TOP_SECRET = 'top_secret'
}

/**
 * Project status options
 */
export enum ProjectStatus {
    NOT_STARTED = 'not_started',
    PLANNING = 'planning',
    IN_PROGRESS = 'in_progress',
    ON_HOLD = 'on_hold',
    DELAYED = 'delayed',
    AT_RISK = 'at_risk',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

/**
 * Risk severity levels
 */
export enum RiskSeverity {
    NEGLIGIBLE = 'negligible',
    MINOR = 'minor',
    MODERATE = 'moderate',
    MAJOR = 'major',
    SEVERE = 'severe',
    CATASTROPHIC = 'catastrophic'
}

/**
 * Incident types
 */
export enum IncidentType {
    WORKPLACE_INJURY = 'workplace_injury',
    EQUIPMENT_FAILURE = 'equipment_failure',
    SECURITY_BREACH = 'security_breach',
    DATA_BREACH = 'data_breach',
    CUSTOMER_COMPLAINT = 'customer_complaint',
    QUALITY_ISSUE = 'quality_issue',
    ENVIRONMENTAL = 'environmental',
    SAFETY_HAZARD = 'safety_hazard',
    NEAR_MISS = 'near_miss',
    PROPERTY_DAMAGE = 'property_damage',
    THEFT = 'theft',
    HARASSMENT = 'harassment',
    POLICY_VIOLATION = 'policy_violation',
    OTHER = 'other'
}

/**
 * Incident severity levels
 */
export enum IncidentSeverity {
    LEVEL_1 = 'level_1',
    LEVEL_2 = 'level_2',
    LEVEL_3 = 'level_3',
    LEVEL_4 = 'level_4',
    LEVEL_5 = 'level_5'
}

/**
 * Financial report types
 */
export enum FinancialReportType {
    INCOME_STATEMENT = 'income_statement',
    BALANCE_SHEET = 'balance_sheet',
    CASH_FLOW = 'cash_flow',
    BUDGET_VARIANCE = 'budget_variance',
    EXPENSE_REPORT = 'expense_report',
    REVENUE_ANALYSIS = 'revenue_analysis',
    PROFIT_LOSS = 'profit_loss',
    TAX_SUMMARY = 'tax_summary',
    AUDIT_REPORT = 'audit_report',
    FORECAST = 'forecast'
}

/**
 * Currency codes
 */
export enum CurrencyCode {
    INR = 'INR',
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    AED = 'AED',
    SGD = 'SGD',
    AUD = 'AUD',
    CAD = 'CAD',
    JPY = 'JPY'
}

/**
 * Meeting types
 */
export enum MeetingType {
    BOARD_MEETING = 'board_meeting',
    TEAM_MEETING = 'team_meeting',
    CLIENT_MEETING = 'client_meeting',
    PROJECT_KICKOFF = 'project_kickoff',
    REVIEW_MEETING = 'review_meeting',
    STANDUP = 'standup',
    RETROSPECTIVE = 'retrospective',
    BRAINSTORMING = 'brainstorming',
    TRAINING = 'training',
    INTERVIEW = 'interview',
    WEBINAR = 'webinar',
    CONFERENCE = 'conference',
    AGM = 'agm',
    EGM = 'egm',
    OTHER = 'other'
}

/**
 * Analysis types
 */
export enum AnalysisType {
    SWOT = 'swot',
    PESTLE = 'pestle',
    COMPETITOR = 'competitor',
    MARKET = 'market',
    GAP = 'gap',
    ROOT_CAUSE = 'root_cause',
    COST_BENEFIT = 'cost_benefit',
    RISK = 'risk',
    FEASIBILITY = 'feasibility',
    IMPACT = 'impact',
    TREND = 'trend',
    PERFORMANCE = 'performance',
    CUSTOMER = 'customer',
    DATA = 'data'
}

/**
 * Field input types
 */
export enum FieldInputType {
    TEXT = 'text',
    TEXTAREA = 'textarea',
    EMAIL = 'email',
    PHONE = 'phone',
    NUMBER = 'number',
    CURRENCY = 'currency',
    PERCENTAGE = 'percentage',
    DATE = 'date',
    DATETIME = 'datetime',
    TIME = 'time',
    SELECT = 'select',
    MULTI_SELECT = 'multi_select',
    RADIO = 'radio',
    CHECKBOX = 'checkbox',
    FILE = 'file',
    IMAGE = 'image',
    SIGNATURE = 'signature',
    URL = 'url',
    RICH_TEXT = 'rich_text',
    TABLE = 'table',
    REPEATER = 'repeater',
    CALCULATED = 'calculated',
    HIDDEN = 'hidden'
}

// ============================================================================
// SECTION 2: BILINGUAL LABELS
// ============================================================================

/**
 * Bilingual label interface
 */
export interface BilingualLabel {
    en: string;
    hi: string;
}

/**
 * Common labels used across all report types
 */
export const COMMON_LABELS: Record<string, BilingualLabel> = {
    // Document Info
    reportTitle: { en: 'Report Title', hi: 'रिपोर्ट शीर्षक' },
    reportNumber: { en: 'Report Number', hi: 'रिपोर्ट संख्या' },
    reportDate: { en: 'Report Date', hi: 'रिपोर्ट दिनांक' },
    reportType: { en: 'Report Type', hi: 'रिपोर्ट प्रकार' },
    reportStatus: { en: 'Status', hi: 'स्थिति' },
    reportVersion: { en: 'Version', hi: 'संस्करण' },
    referenceNumber: { en: 'Reference Number', hi: 'संदर्भ संख्या' },
    confidentiality: { en: 'Confidentiality', hi: 'गोपनीयता' },
    
    // Organization
    organizationName: { en: 'Organization Name', hi: 'संगठन का नाम' },
    companyName: { en: 'Company Name', hi: 'कंपनी का नाम' },
    department: { en: 'Department', hi: 'विभाग' },
    division: { en: 'Division', hi: 'प्रभाग' },
    branch: { en: 'Branch', hi: 'शाखा' },
    location: { en: 'Location', hi: 'स्थान' },
    address: { en: 'Address', hi: 'पता' },
    
    // People
    preparedBy: { en: 'Prepared By', hi: 'द्वारा तैयार' },
    reviewedBy: { en: 'Reviewed By', hi: 'द्वारा समीक्षित' },
    approvedBy: { en: 'Approved By', hi: 'द्वारा अनुमोदित' },
    submittedTo: { en: 'Submitted To', hi: 'को प्रस्तुत' },
    authorName: { en: 'Author Name', hi: 'लेखक का नाम' },
    authorDesignation: { en: 'Designation', hi: 'पदनाम' },
    authorEmail: { en: 'Email', hi: 'ईमेल' },
    authorPhone: { en: 'Phone', hi: 'फोन' },
    
    // Dates
    startDate: { en: 'Start Date', hi: 'आरंभ तिथि' },
    endDate: { en: 'End Date', hi: 'समाप्ति तिथि' },
    dueDate: { en: 'Due Date', hi: 'नियत तिथि' },
    submissionDate: { en: 'Submission Date', hi: 'प्रस्तुति तिथि' },
    reviewDate: { en: 'Review Date', hi: 'समीक्षा तिथि' },
    approvalDate: { en: 'Approval Date', hi: 'अनुमोदन तिथि' },
    periodFrom: { en: 'Period From', hi: 'अवधि से' },
    periodTo: { en: 'Period To', hi: 'अवधि तक' },
    reportingPeriod: { en: 'Reporting Period', hi: 'रिपोर्टिंग अवधि' },
    
    // Content Sections
    executiveSummary: { en: 'Executive Summary', hi: 'कार्यकारी सारांश' },
    introduction: { en: 'Introduction', hi: 'परिचय' },
    background: { en: 'Background', hi: 'पृष्ठभूमि' },
    objectives: { en: 'Objectives', hi: 'उद्देश्य' },
    scope: { en: 'Scope', hi: 'कार्यक्षेत्र' },
    methodology: { en: 'Methodology', hi: 'कार्यप्रणाली' },
    findings: { en: 'Findings', hi: 'निष्कर्ष' },
    analysis: { en: 'Analysis', hi: 'विश्लेषण' },
    results: { en: 'Results', hi: 'परिणाम' },
    discussion: { en: 'Discussion', hi: 'चर्चा' },
    recommendations: { en: 'Recommendations', hi: 'सिफारिशें' },
    conclusion: { en: 'Conclusion', hi: 'निष्कर्ष' },
    nextSteps: { en: 'Next Steps', hi: 'अगले कदम' },
    actionItems: { en: 'Action Items', hi: 'कार्य आइटम' },
    appendix: { en: 'Appendix', hi: 'परिशिष्ट' },
    attachments: { en: 'Attachments', hi: 'संलग्नक' },
    references: { en: 'References', hi: 'संदर्भ' },
    
    // Table Headers
    serialNumber: { en: 'S.No.', hi: 'क्र.सं.' },
    description: { en: 'Description', hi: 'विवरण' },
    quantity: { en: 'Quantity', hi: 'मात्रा' },
    unit: { en: 'Unit', hi: 'इकाई' },
    rate: { en: 'Rate', hi: 'दर' },
    amount: { en: 'Amount', hi: 'राशि' },
    total: { en: 'Total', hi: 'कुल' },
    grandTotal: { en: 'Grand Total', hi: 'कुल योग' },
    subTotal: { en: 'Sub Total', hi: 'उप योग' },
    
    // Status & Priority
    status: { en: 'Status', hi: 'स्थिति' },
    priority: { en: 'Priority', hi: 'प्राथमिकता' },
    progress: { en: 'Progress', hi: 'प्रगति' },
    completion: { en: 'Completion', hi: 'पूर्णता' },
    
    // Signatures
    signature: { en: 'Signature', hi: 'हस्ताक्षर' },
    date: { en: 'Date', hi: 'दिनांक' },
    name: { en: 'Name', hi: 'नाम' },
    designation: { en: 'Designation', hi: 'पदनाम' },
    stamp: { en: 'Stamp/Seal', hi: 'मुहर' },
    
    // Actions
    remarks: { en: 'Remarks', hi: 'टिप्पणियां' },
    comments: { en: 'Comments', hi: 'टिप्पणियां' },
    notes: { en: 'Notes', hi: 'नोट्स' },
    observations: { en: 'Observations', hi: 'अवलोकन' }
};

/**
 * Report type specific labels
 */
export const REPORT_TYPE_LABELS: Record<ReportType, Record<string, BilingualLabel>> = {
    [ReportType.BUSINESS]: {
        businessOverview: { en: 'Business Overview', hi: 'व्यापार अवलोकन' },
        marketAnalysis: { en: 'Market Analysis', hi: 'बाजार विश्लेषण' },
        competitiveAnalysis: { en: 'Competitive Analysis', hi: 'प्रतिस्पर्धी विश्लेषण' },
        financialHighlights: { en: 'Financial Highlights', hi: 'वित्तीय मुख्य बातें' },
        operationalMetrics: { en: 'Operational Metrics', hi: 'परिचालन मेट्रिक्स' },
        keyPerformanceIndicators: { en: 'Key Performance Indicators', hi: 'प्रमुख प्रदर्शन संकेतक' },
        strategicInitiatives: { en: 'Strategic Initiatives', hi: 'रणनीतिक पहल' },
        riskAssessment: { en: 'Risk Assessment', hi: 'जोखिम आकलन' },
        futureOutlook: { en: 'Future Outlook', hi: 'भविष्य का दृष्टिकोण' },
        quarterlyPerformance: { en: 'Quarterly Performance', hi: 'त्रैमासिक प्रदर्शन' },
        annualReview: { en: 'Annual Review', hi: 'वार्षिक समीक्षा' }
    },
    
    [ReportType.PROJECT]: {
        projectName: { en: 'Project Name', hi: 'परियोजना का नाम' },
        projectCode: { en: 'Project Code', hi: 'परियोजना कोड' },
        projectManager: { en: 'Project Manager', hi: 'परियोजना प्रबंधक' },
        projectSponsor: { en: 'Project Sponsor', hi: 'परियोजना प्रायोजक' },
        projectStatus: { en: 'Project Status', hi: 'परियोजना स्थिति' },
        projectPhase: { en: 'Project Phase', hi: 'परियोजना चरण' },
        projectTimeline: { en: 'Project Timeline', hi: 'परियोजना समयरेखा' },
        milestones: { en: 'Milestones', hi: 'मील के पत्थर' },
        deliverables: { en: 'Deliverables', hi: 'डिलिवरेबल्स' },
        dependencies: { en: 'Dependencies', hi: 'निर्भरताएं' },
        resources: { en: 'Resources', hi: 'संसाधन' },
        budget: { en: 'Budget', hi: 'बजट' },
        actualCost: { en: 'Actual Cost', hi: 'वास्तविक लागत' },
        variance: { en: 'Variance', hi: 'विचलन' },
        risks: { en: 'Risks', hi: 'जोखिम' },
        issues: { en: 'Issues', hi: 'मुद्दे' },
        changeRequests: { en: 'Change Requests', hi: 'परिवर्तन अनुरोध' },
        lessonsLearned: { en: 'Lessons Learned', hi: 'सीखे गए सबक' }
    },
    
    [ReportType.ANALYSIS]: {
        analysisType: { en: 'Analysis Type', hi: 'विश्लेषण प्रकार' },
        dataSource: { en: 'Data Source', hi: 'डेटा स्रोत' },
        sampleSize: { en: 'Sample Size', hi: 'नमूना आकार' },
        timeFrame: { en: 'Time Frame', hi: 'समय सीमा' },
        assumptions: { en: 'Assumptions', hi: 'धारणाएं' },
        limitations: { en: 'Limitations', hi: 'सीमाएं' },
        keyFindings: { en: 'Key Findings', hi: 'प्रमुख निष्कर्ष' },
        dataAnalysis: { en: 'Data Analysis', hi: 'डेटा विश्लेषण' },
        statisticalSummary: { en: 'Statistical Summary', hi: 'सांख्यिकीय सारांश' },
        trends: { en: 'Trends', hi: 'रुझान' },
        patterns: { en: 'Patterns', hi: 'पैटर्न' },
        correlations: { en: 'Correlations', hi: 'सहसंबंध' },
        insights: { en: 'Insights', hi: 'अंतर्दृष्टि' },
        implications: { en: 'Implications', hi: 'निहितार्थ' },
        swotAnalysis: { en: 'SWOT Analysis', hi: 'स्वॉट विश्लेषण' },
        strengths: { en: 'Strengths', hi: 'शक्तियां' },
        weaknesses: { en: 'Weaknesses', hi: 'कमजोरियां' },
        opportunities: { en: 'Opportunities', hi: 'अवसर' },
        threats: { en: 'Threats', hi: 'खतरे' }
    },
    
    [ReportType.FINANCIAL]: {
        financialYear: { en: 'Financial Year', hi: 'वित्तीय वर्ष' },
        quarter: { en: 'Quarter', hi: 'तिमाही' },
        revenue: { en: 'Revenue', hi: 'राजस्व' },
        expenses: { en: 'Expenses', hi: 'व्यय' },
        netIncome: { en: 'Net Income', hi: 'शुद्ध आय' },
        grossProfit: { en: 'Gross Profit', hi: 'सकल लाभ' },
        operatingProfit: { en: 'Operating Profit', hi: 'परिचालन लाभ' },
        netProfit: { en: 'Net Profit', hi: 'शुद्ध लाभ' },
        assets: { en: 'Assets', hi: 'संपत्तियां' },
        liabilities: { en: 'Liabilities', hi: 'देनदारियां' },
        equity: { en: 'Equity', hi: 'इक्विटी' },
        cashFlow: { en: 'Cash Flow', hi: 'नकदी प्रवाह' },
        budgetAllocated: { en: 'Budget Allocated', hi: 'आवंटित बजट' },
        budgetUtilized: { en: 'Budget Utilized', hi: 'उपयोग किया गया बजट' },
        budgetRemaining: { en: 'Budget Remaining', hi: 'शेष बजट' },
        varianceAnalysis: { en: 'Variance Analysis', hi: 'विचलन विश्लेषण' },
        ratioAnalysis: { en: 'Ratio Analysis', hi: 'अनुपात विश्लेषण' },
        profitabilityRatios: { en: 'Profitability Ratios', hi: 'लाभप्रदता अनुपात' },
        liquidityRatios: { en: 'Liquidity Ratios', hi: 'तरलता अनुपात' },
        solvencyRatios: { en: 'Solvency Ratios', hi: 'शोधन क्षमता अनुपात' }
    },
    
    [ReportType.PROGRESS]: {
        overallProgress: { en: 'Overall Progress', hi: 'समग्र प्रगति' },
        tasksCompleted: { en: 'Tasks Completed', hi: 'पूर्ण कार्य' },
        tasksPending: { en: 'Tasks Pending', hi: 'लंबित कार्य' },
        tasksInProgress: { en: 'Tasks In Progress', hi: 'प्रगति में कार्य' },
        blockers: { en: 'Blockers', hi: 'अवरोधक' },
        achievements: { en: 'Achievements', hi: 'उपलब्धियां' },
        challenges: { en: 'Challenges', hi: 'चुनौतियां' },
        plannedVsActual: { en: 'Planned vs Actual', hi: 'नियोजित बनाम वास्तविक' },
        scheduleVariance: { en: 'Schedule Variance', hi: 'अनुसूची विचलन' },
        costVariance: { en: 'Cost Variance', hi: 'लागत विचलन' },
        qualityMetrics: { en: 'Quality Metrics', hi: 'गुणवत्ता मेट्रिक्स' },
        teamPerformance: { en: 'Team Performance', hi: 'टीम प्रदर्शन' },
        upcomingTasks: { en: 'Upcoming Tasks', hi: 'आगामी कार्य' },
        supportNeeded: { en: 'Support Needed', hi: 'आवश्यक सहायता' }
    },
    
    [ReportType.INCIDENT]: {
        incidentNumber: { en: 'Incident Number', hi: 'घटना संख्या' },
        incidentType: { en: 'Incident Type', hi: 'घटना का प्रकार' },
        incidentDate: { en: 'Incident Date', hi: 'घटना की तिथि' },
        incidentTime: { en: 'Incident Time', hi: 'घटना का समय' },
        incidentLocation: { en: 'Incident Location', hi: 'घटना स्थल' },
        severity: { en: 'Severity', hi: 'गंभीरता' },
        reportedBy: { en: 'Reported By', hi: 'द्वारा रिपोर्ट' },
        reportedDate: { en: 'Reported Date', hi: 'रिपोर्ट तिथि' },
        personsInvolved: { en: 'Persons Involved', hi: 'शामिल व्यक्ति' },
        witnesses: { en: 'Witnesses', hi: 'गवाह' },
        injuriesReported: { en: 'Injuries Reported', hi: 'रिपोर्ट की गई चोटें' },
        damageAssessment: { en: 'Damage Assessment', hi: 'क्षति आकलन' },
        incidentDescription: { en: 'Incident Description', hi: 'घटना विवरण' },
        immediateActions: { en: 'Immediate Actions Taken', hi: 'तत्काल कार्रवाई' },
        rootCause: { en: 'Root Cause', hi: 'मूल कारण' },
        contributingFactors: { en: 'Contributing Factors', hi: 'योगदान करने वाले कारक' },
        correctiveActions: { en: 'Corrective Actions', hi: 'सुधारात्मक कार्रवाई' },
        preventiveMeasures: { en: 'Preventive Measures', hi: 'निवारक उपाय' },
        followUpRequired: { en: 'Follow-up Required', hi: 'फॉलो-अप आवश्यक' },
        closureDate: { en: 'Closure Date', hi: 'समापन तिथि' },
        lessonsLearned: { en: 'Lessons Learned', hi: 'सीखे गए सबक' }
    },
    
    [ReportType.MEETING]: {
        meetingTitle: { en: 'Meeting Title', hi: 'बैठक शीर्षक' },
        meetingType: { en: 'Meeting Type', hi: 'बैठक प्रकार' },
        meetingDate: { en: 'Meeting Date', hi: 'बैठक तिथि' },
        meetingTime: { en: 'Meeting Time', hi: 'बैठक समय' },
        meetingVenue: { en: 'Meeting Venue', hi: 'बैठक स्थल' },
        meetingMode: { en: 'Meeting Mode', hi: 'बैठक मोड' },
        chairperson: { en: 'Chairperson', hi: 'अध्यक्ष' },
        secretary: { en: 'Secretary', hi: 'सचिव' },
        attendees: { en: 'Attendees', hi: 'उपस्थित सदस्य' },
        absentees: { en: 'Absentees', hi: 'अनुपस्थित' },
        quorum: { en: 'Quorum', hi: 'कोरम' },
        agenda: { en: 'Agenda', hi: 'एजेंडा' },
        minutesOfMeeting: { en: 'Minutes of Meeting', hi: 'बैठक कार्यवृत्त' },
        discussionPoints: { en: 'Discussion Points', hi: 'चर्चा बिंदु' },
        decisions: { en: 'Decisions', hi: 'निर्णय' },
        actionItems: { en: 'Action Items', hi: 'कार्य आइटम' },
        assignedTo: { en: 'Assigned To', hi: 'को सौंपा गया' },
        deadline: { en: 'Deadline', hi: 'समय सीमा' },
        nextMeeting: { en: 'Next Meeting', hi: 'अगली बैठक' },
        adjournment: { en: 'Adjournment', hi: 'स्थगन' }
    }
};

/**
 * Status labels with colors
 */
export const STATUS_LABELS: Record<ReportStatus, BilingualLabel & { color: string }> = {
    [ReportStatus.DRAFT]: { en: 'Draft', hi: 'प्रारूप', color: '#6B7280' },
    [ReportStatus.PENDING_REVIEW]: { en: 'Pending Review', hi: 'समीक्षा लंबित', color: '#F59E0B' },
    [ReportStatus.UNDER_REVIEW]: { en: 'Under Review', hi: 'समीक्षाधीन', color: '#3B82F6' },
    [ReportStatus.APPROVED]: { en: 'Approved', hi: 'अनुमोदित', color: '#10B981' },
    [ReportStatus.PUBLISHED]: { en: 'Published', hi: 'प्रकाशित', color: '#8B5CF6' },
    [ReportStatus.ARCHIVED]: { en: 'Archived', hi: 'संग्रहीत', color: '#9CA3AF' },
    [ReportStatus.CONFIDENTIAL]: { en: 'Confidential', hi: 'गोपनीय', color: '#EF4444' }
};

/**
 * Priority labels with colors
 */
export const PRIORITY_LABELS: Record<PriorityLevel, BilingualLabel & { color: string }> = {
    [PriorityLevel.LOW]: { en: 'Low', hi: 'कम', color: '#10B981' },
    [PriorityLevel.MEDIUM]: { en: 'Medium', hi: 'मध्यम', color: '#F59E0B' },
    [PriorityLevel.HIGH]: { en: 'High', hi: 'उच्च', color: '#EF4444' },
    [PriorityLevel.CRITICAL]: { en: 'Critical', hi: 'गंभीर', color: '#7C3AED' },
    [PriorityLevel.URGENT]: { en: 'Urgent', hi: 'अत्यावश्यक', color: '#DC2626' }
};

/**
 * Project status labels with colors
 */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, BilingualLabel & { color: string }> = {
    [ProjectStatus.NOT_STARTED]: { en: 'Not Started', hi: 'शुरू नहीं हुआ', color: '#6B7280' },
    [ProjectStatus.PLANNING]: { en: 'Planning', hi: 'नियोजन', color: '#8B5CF6' },
    [ProjectStatus.IN_PROGRESS]: { en: 'In Progress', hi: 'प्रगति में', color: '#3B82F6' },
    [ProjectStatus.ON_HOLD]: { en: 'On Hold', hi: 'रुका हुआ', color: '#F59E0B' },
    [ProjectStatus.DELAYED]: { en: 'Delayed', hi: 'विलंबित', color: '#EF4444' },
    [ProjectStatus.AT_RISK]: { en: 'At Risk', hi: 'जोखिम में', color: '#DC2626' },
    [ProjectStatus.COMPLETED]: { en: 'Completed', hi: 'पूर्ण', color: '#10B981' },
    [ProjectStatus.CANCELLED]: { en: 'Cancelled', hi: 'रद्द', color: '#9CA3AF' }
};

/**
 * Incident severity labels with colors
 */
export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, BilingualLabel & { color: string; description: BilingualLabel }> = {
    [IncidentSeverity.LEVEL_1]: { 
        en: 'Level 1 - Minor', 
        hi: 'स्तर 1 - मामूली', 
        color: '#10B981',
        description: { en: 'No injury or damage', hi: 'कोई चोट या क्षति नहीं' }
    },
    [IncidentSeverity.LEVEL_2]: { 
        en: 'Level 2 - Low', 
        hi: 'स्तर 2 - कम', 
        color: '#3B82F6',
        description: { en: 'First aid only', hi: 'केवल प्राथमिक चिकित्सा' }
    },
    [IncidentSeverity.LEVEL_3]: { 
        en: 'Level 3 - Moderate', 
        hi: 'स्तर 3 - मध्यम', 
        color: '#F59E0B',
        description: { en: 'Medical treatment required', hi: 'चिकित्सा उपचार आवश्यक' }
    },
    [IncidentSeverity.LEVEL_4]: { 
        en: 'Level 4 - High', 
        hi: 'स्तर 4 - उच्च', 
        color: '#EF4444',
        description: { en: 'Serious injury', hi: 'गंभीर चोट' }
    },
    [IncidentSeverity.LEVEL_5]: { 
        en: 'Level 5 - Critical', 
        hi: 'स्तर 5 - गंभीर', 
        color: '#DC2626',
        description: { en: 'Life threatening', hi: 'जीवन के लिए खतरा' }
    }
};

/**
 * Currency symbols
 */
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    [CurrencyCode.INR]: '₹',
    [CurrencyCode.USD]: '$',
    [CurrencyCode.EUR]: '€',
    [CurrencyCode.GBP]: '£',
    [CurrencyCode.AED]: 'د.إ',
    [CurrencyCode.SGD]: 'S$',
    [CurrencyCode.AUD]: 'A$',
    [CurrencyCode.CAD]: 'C$',
    [CurrencyCode.JPY]: '¥'
};

/**
 * Currency labels
 */
export const CURRENCY_LABELS: Record<CurrencyCode, BilingualLabel> = {
    [CurrencyCode.INR]: { en: 'Indian Rupee (₹)', hi: 'भारतीय रुपया (₹)' },
    [CurrencyCode.USD]: { en: 'US Dollar ($)', hi: 'अमेरिकी डॉलर ($)' },
    [CurrencyCode.EUR]: { en: 'Euro (€)', hi: 'यूरो (€)' },
    [CurrencyCode.GBP]: { en: 'British Pound (£)', hi: 'ब्रिटिश पाउंड (£)' },
    [CurrencyCode.AED]: { en: 'UAE Dirham (د.إ)', hi: 'यूएई दिरहम (د.إ)' },
    [CurrencyCode.SGD]: { en: 'Singapore Dollar (S$)', hi: 'सिंगापुर डॉलर (S$)' },
    [CurrencyCode.AUD]: { en: 'Australian Dollar (A$)', hi: 'ऑस्ट्रेलियाई डॉलर (A$)' },
    [CurrencyCode.CAD]: { en: 'Canadian Dollar (C$)', hi: 'कैनेडियन डॉलर (C$)' },
    [CurrencyCode.JPY]: { en: 'Japanese Yen (¥)', hi: 'जापानी येन (¥)' }
};

// ============================================================================
// SECTION 3: TYPE DEFINITIONS & INTERFACES
// ============================================================================

/**
 * Base field configuration interface
 */
export interface FieldConfig {
    id: string;
    name: string;
    label: BilingualLabel;
    type: FieldInputType;
    placeholder?: BilingualLabel;
    helpText?: BilingualLabel;
    defaultValue?: any;
    required: boolean;
    disabled?: boolean;
    hidden?: boolean;
    validation?: FieldValidation;
    options?: SelectOption[];
    conditionalDisplay?: ConditionalRule[];
    groupId?: string;
    order: number;
    width?: 'full' | 'half' | 'third' | 'quarter' | 'two-thirds' | 'three-quarter';
    className?: string;
    prefix?: string;
    suffix?: string;
}

/**
 * Field validation rules
 */
export interface FieldValidation {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    patternMessage?: BilingualLabel;
    email?: boolean;
    phone?: boolean;
    url?: boolean;
    date?: {
        minDate?: string;
        maxDate?: string;
        format?: string;
    };
    custom?: (value: any) => boolean | string;
}

/**
 * Select option interface
 */
export interface SelectOption {
    value: string;
    label: BilingualLabel;
    disabled?: boolean;
    icon?: string;
    color?: string;
}

/**
 * Conditional display rule
 */
export interface ConditionalRule {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty' | 'in' | 'notIn';
    value?: any;
    logicalOperator?: 'AND' | 'OR';
}

/**
 * Field group configuration
 */
export interface FieldGroup {
    id: string;
    name: string;
    label: BilingualLabel;
    description?: BilingualLabel;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    order: number;
    fields: string[];
    icon?: string;
    className?: string;
}

/**
 * Table column configuration
 */
export interface TableColumn {
    id: string;
    header: BilingualLabel;
    type: FieldInputType;
    width?: string;
    align?: 'left' | 'center' | 'right';
    format?: string;
    editable?: boolean;
    sortable?: boolean;
    required?: boolean;
    options?: SelectOption[];
}

/**
 * Table configuration
 */
export interface TableConfig {
    id: string;
    label: BilingualLabel;
    columns: TableColumn[];
    minRows?: number;
    maxRows?: number;
    allowAdd?: boolean;
    allowDelete?: boolean;
    allowReorder?: boolean;
    showRowNumbers?: boolean;
    showTotals?: boolean;
    totalColumns?: string[];
    emptyMessage?: BilingualLabel;
}

/**
 * Repeater field configuration
 */
export interface RepeaterConfig {
    id: string;
    label: BilingualLabel;
    fields: FieldConfig[];
    minItems?: number;
    maxItems?: number;
    allowAdd?: boolean;
    allowDelete?: boolean;
    allowReorder?: boolean;
    itemLabel?: BilingualLabel;
    addButtonLabel?: BilingualLabel;
}

// ============================================================================
// SECTION 4: ORGANIZATION & PERSON INTERFACES
// ============================================================================

/**
 * Address structure
 */
export interface AddressInfo {
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
    country: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
    phone?: string;
    mobile?: string;
    alternatePhone?: string;
    email?: string;
    alternateEmail?: string;
    website?: string;
    fax?: string;
}

/**
 * Organization details
 */
export interface OrganizationInfo {
    name: string;
    nameHindi?: string;
    tradeName?: string;
    logo?: string;
    tagline?: string;
    registrationNumber?: string;
    gstin?: string;
    pan?: string;
    cin?: string;
    tan?: string;
    udyam?: string;
    address: AddressInfo;
    contact: ContactInfo;
    department?: string;
    division?: string;
    branch?: string;
    establishedYear?: number;
    industry?: string;
}

/**
 * Person/Author details
 */
export interface PersonInfo {
    name: string;
    nameHindi?: string;
    designation?: string;
    department?: string;
    employeeId?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    signature?: string;
    photo?: string;
    date?: string;
}

/**
 * Signature block configuration
 */
export interface SignatureBlock {
    id: string;
    label: BilingualLabel;
    person?: PersonInfo;
    showName: boolean;
    showDesignation: boolean;
    showDepartment?: boolean;
    showDate: boolean;
    showStamp: boolean;
    required: boolean;
    width?: 'full' | 'half' | 'third';
}

/**
 * Attachment information
 */
export interface AttachmentInfo {
    id: string;
    name: string;
    type: string;
    size?: string;
    description?: string;
    url?: string;
    uploadedBy?: string;
    uploadedDate?: string;
}

/**
 * Reference information
 */
export interface ReferenceInfo {
    id: string;
    title: string;
    author?: string;
    source?: string;
    date?: string;
    url?: string;
    pageNumbers?: string;
    notes?: string;
}

// ============================================================================
// SECTION 5: BASE REPORT DATA INTERFACE
// ============================================================================

/**
 * Base report data interface - common to all reports
 */
export interface BaseReportData {
    // Metadata
    reportId: string;
    reportNumber: string;
    reportType: ReportType;
    reportTitle: string;
    reportSubtitle?: string;
    version: string;
    status: ReportStatus;
    confidentiality: ConfidentialityLevel;
    
    // Organization
    organization: OrganizationInfo;
    
    // Dates
    reportDate: string;
    periodFrom?: string;
    periodTo?: string;
    submissionDate?: string;
    
    // People
    preparedBy: PersonInfo;
    reviewedBy?: PersonInfo;
    approvedBy?: PersonInfo;
    submittedTo?: PersonInfo;
    
    // Distribution
    distributionList?: string[];
    
    // Content
    executiveSummary?: string;
    introduction?: string;
    background?: string;
    objectives?: string[];
    scope?: string;
    methodology?: string;
    findings?: string;
    analysis?: string;
    conclusion?: string;
    recommendations?: string[];
    nextSteps?: string[];
    
    // Attachments & References
    attachments?: AttachmentInfo[];
    references?: ReferenceInfo[];
    
    // Footer & Formatting
    pageNumbering?: boolean;
    watermark?: string;
    disclaimer?: string;
    footerText?: string;
    
    // Signatures
    signatures?: SignatureBlock[];
}

// ============================================================================
// SECTION 6: BUSINESS REPORT INTERFACES
// ============================================================================

/**
 * KPI data structure
 */
export interface KPIData {
    id: string;
    name: string;
    nameHindi?: string;
    category?: string;
    currentValue: number | string;
    targetValue?: number | string;
    previousValue?: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    changePercent?: number;
    changeValue?: number;
    status?: 'on_track' | 'at_risk' | 'off_track' | 'exceeded';
    icon?: string;
    color?: string;
    sparklineData?: number[];
}

/**
 * Competitor information
 */
export interface CompetitorInfo {
    id: string;
    name: string;
    marketShare?: number;
    revenue?: number;
    strengths?: string[];
    weaknesses?: string[];
    products?: string[];
    pricing?: string;
    threat?: 'low' | 'medium' | 'high';
}

/**
 * Market segment
 */
export interface MarketSegment {
    id: string;
    name: string;
    size: number;
    share: number;
    growth: number;
    description?: string;
}

/**
 * Strategic initiative
 */
export interface StrategicInitiative {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    progress: number;
    owner?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    priority: PriorityLevel;
    kpis?: string[];
}

/**
 * Risk item
 */
export interface RiskItem {
    id: string;
    title: string;
    description: string;
    category: string;
    probability: 'low' | 'medium' | 'high' | 'very_high';
    impact: 'low' | 'medium' | 'high' | 'very_high';
    severity: RiskSeverity;
    riskScore?: number;
    mitigation?: string;
    contingency?: string;
    owner?: string;
    status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'closed';
    dueDate?: string;
    lastReviewDate?: string;
}

/**
 * Business report specific data
 */
export interface BusinessReportData extends BaseReportData {
    reportType: ReportType.BUSINESS;
    
    // Business Overview
    businessOverview: {
        description: string;
        vision?: string;
        mission?: string;
        values?: string[];
        keyHighlights?: string[];
    };
    
    // Performance Metrics
    kpis: KPIData[];
    
    // Financial Summary
    financialSummary?: {
        revenue: number;
        previousRevenue?: number;
        expenses: number;
        profit: number;
        profitMargin?: number;
        growthRate: number;
        currency: CurrencyCode;
    };
    
    // Market Analysis
    marketAnalysis?: {
        marketSize?: number;
        marketGrowth?: number;
        marketShare?: number;
        targetMarket?: string;
        segments?: MarketSegment[];
        competitors?: CompetitorInfo[];
        trends?: string[];
        opportunities?: string[];
        threats?: string[];
    };
    
    // Operational Metrics
    operationalMetrics?: {
        efficiency?: number;
        productivity?: number;
        quality?: number;
        customerSatisfaction?: number;
        employeeSatisfaction?: number;
        customMetrics?: KPIData[];
    };
    
    // Strategic Initiatives
    strategicInitiatives?: StrategicInitiative[];
    
    // Risk Assessment
    risks?: RiskItem[];
    
    // Future Outlook
    futureOutlook?: {
        shortTerm: string;
        shortTermPeriod?: string;
        mediumTerm?: string;
        mediumTermPeriod?: string;
        longTerm?: string;
        longTermPeriod?: string;
        forecasts?: {
            metric: string;
            currentValue: number;
            forecastValue: number;
            period: string;
        }[];
    };
}

// ============================================================================
// SECTION 7: PROJECT REPORT INTERFACES
// ============================================================================

/**
 * Milestone data
 */
export interface MilestoneData {
    id: string;
    name: string;
    description?: string;
    phase?: string;
    plannedDate: string;
    actualDate?: string;
    forecastDate?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'at_risk' | 'cancelled';
    progress?: number;
    deliverables?: string[];
    dependencies?: string[];
    owner?: string;
    notes?: string;
    isCritical?: boolean;
}

/**
 * Deliverable data
 */
export interface DeliverableData {
    id: string;
    name: string;
    description?: string;
    type?: string;
    milestone?: string;
    dueDate: string;
    completedDate?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'rejected';
    progress: number;
    owner?: string;
    reviewedBy?: string;
    acceptanceCriteria?: string[];
    attachments?: string[];
    notes?: string;
}

/**
 * Resource data
 */
export interface ResourceData {
    id: string;
    name: string;
    type: 'human' | 'equipment' | 'material' | 'software' | 'other';
    role?: string;
    allocation: number;
    unit?: string;
    startDate?: string;
    endDate?: string;
    skills?: string[];
    costPerUnit?: number;
    totalCost?: number;
    availability?: number;
    notes?: string;
}

/**
 * Issue data
 */
export interface IssueData {
    id: string;
    title: string;
    description: string;
    category?: string;
    priority: PriorityLevel;
    status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
    assignedTo?: string;
    reportedBy?: string;
    reportedDate: string;
    dueDate?: string;
    resolvedDate?: string;
    resolution?: string;
    impact?: string;
    workaround?: string;
    relatedItems?: string[];
    comments?: { author: string; date: string; text: string }[];
}

/**
 * Change request data
 */
export interface ChangeRequestData {
    id: string;
    title: string;
    description: string;
    reason: string;
    requestedBy: string;
    requestDate: string;
    priority: PriorityLevel;
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented' | 'cancelled';
    impact: {
        schedule?: string;
        scheduleDays?: number;
        budget?: string;
        budgetAmount?: number;
        scope?: string;
        quality?: string;
        resources?: string;
    };
    approvedBy?: string;
    approvalDate?: string;
    implementedDate?: string;
    notes?: string;
}

/**
 * Team performance data
 */
export interface TeamPerformanceData {
    teamSize: number;
    productivity: number;
    velocity?: number;
    burndownRate?: number;
    defectRate?: number;
    satisfaction?: number;
    attendance?: number;
    highlights?: string[];
    concerns?: string[];
    awards?: string[];
}

/**
 * Project budget breakdown
 */
export interface ProjectBudget {
    allocated: number;
    spent: number;
    committed?: number;
    remaining: number;
    forecast: number;
    variance: number;
    variancePercent: number;
    currency: CurrencyCode;
    breakdown?: {
        category: string;
        allocated: number;
        spent: number;
        remaining: number;
    }[];
}

/**
 * Project report specific data
 */
export interface ProjectReportData extends BaseReportData {
    reportType: ReportType.PROJECT;
    
    // Project Info
    projectInfo: {
        name: string;
        code: string;
        description: string;
        type?: string;
        category?: string;
        manager: PersonInfo;
        sponsor?: PersonInfo;
        client?: string;
        status: ProjectStatus;
        phase: string;
        priority: PriorityLevel;
        startDate: string;
        endDate: string;
        actualStartDate?: string;
        actualEndDate?: string;
        forecastEndDate?: string;
    };
    
    // Progress
    progress: {
        overall: number;
        schedule: number;
        scheduleVariance?: number;
        budget: number;
        budgetVariance?: number;
        scope?: number;
        quality?: number;
    };
    
    // Milestones
    milestones: MilestoneData[];
    
    // Deliverables
    deliverables: DeliverableData[];
    
    // Tasks Summary
    tasksSummary?: {
        total: number;
        completed: number;
        inProgress: number;
        pending: number;
        blocked: number;
        overdue: number;
    };
    
    // Resources
    resources?: ResourceData[];
    
    // Budget
    budget: ProjectBudget;
    
    // Risks & Issues
    risks: RiskItem[];
    issues: IssueData[];
    
    // Change Requests
    changeRequests?: ChangeRequestData[];
    
    // Dependencies
    dependencies?: {
        id: string;
        name: string;
        type: 'internal' | 'external';
        status: 'on_track' | 'at_risk' | 'blocked';
        owner?: string;
        dueDate?: string;
        notes?: string;
    }[];
    
    // Team Performance
    teamPerformance?: TeamPerformanceData;
    
    // Quality Metrics
    qualityMetrics?: {
        defectsFound: number;
        defectsFixed: number;
        defectDensity?: number;
        testCoverage?: number;
        codeReviewCoverage?: number;
        customerSatisfaction?: number;
    };
    
    // Lessons Learned
    lessonsLearned?: {
        category: string;
        description: string;
        recommendation: string;
    }[];
    
    // Next Period Plan
    nextPeriodPlan?: {
        objectives: string[];
        keyActivities: string[];
        milestones: string[];
        risks: string[];
    };
}

// ============================================================================
// SECTION 8: ANALYSIS REPORT INTERFACES
// ============================================================================

/**
 * Finding data
 */
export interface FindingData {
    id: string;
    title: string;
    description: string;
    category?: string;
    evidence?: string[];
    dataPoints?: { label: string; value: any }[];
    significance: 'low' | 'medium' | 'high' | 'critical';
    confidence?: number;
    implications?: string[];
    recommendations?: string[];
}

/**
 * Statistics data
 */
export interface StatisticsData {
    mean?: number;
    median?: number;
    mode?: number;
    standardDeviation?: number;
    variance?: number;
    min?: number;
    max?: number;
    range?: number;
    count?: number;
    sum?: number;
    percentiles?: { percentile: number; value: number }[];
    customMetrics?: { name: string; value: number | string; description?: string }[];
}

/**
 * Trend data
 */
export interface TrendData {
    id: string;
    name: string;
    direction: 'up' | 'down' | 'stable' | 'volatile';
    magnitude: number;
    period: string;
    startValue?: number;
    endValue?: number;
    changePercent?: number;
    description?: string;
    dataPoints?: { date: string; value: number }[];
    forecast?: { date: string; value: number }[];
}

/**
 * Correlation data
 */
export interface CorrelationData {
    id: string;
    variable1: string;
    variable2: string;
    coefficient: number;
    pValue?: number;
    significance: 'none' | 'weak' | 'moderate' | 'strong' | 'very_strong';
    direction: 'positive' | 'negative';
    description?: string;
}

/**
 * Competitor analysis
 */
export interface CompetitorAnalysis {
    id: string;
    name: string;
    marketPosition?: string;
    marketShare?: number;
    revenue?: number;
    strengths: string[];
    weaknesses: string[];
    opportunities?: string[];
    threats?: string[];
    strategies?: string[];
    products?: string[];
    pricing?: string;
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    notes?: string;
}

/**
 * Benchmark data
 */
export interface BenchmarkData {
    id: string;
    metric: string;
    category?: string;
    ourValue: number | string;
    industryAverage: number | string;
    bestInClass?: number | string;
    worstInClass?: number | string;
    variance?: number;
    percentile?: number;
    unit?: string;
    status: 'above_average' | 'average' | 'below_average';
    notes?: string;
}

/**
 * SWOT item
 */
export interface SWOTItem {
    id: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    timeframe?: 'short' | 'medium' | 'long';
    actionable?: boolean;
    relatedStrategies?: string[];
}

/**
 * Analysis report specific data
 */
export interface AnalysisReportData extends BaseReportData {
    reportType: ReportType.ANALYSIS;
    
    // Analysis Info
    analysisInfo: {
        type: AnalysisType;
        objective: string;
        scope: string;
        dataSource: string[];
        dataPeriod?: string;
        sampleSize?: string;
        samplingMethod?: string;
        timeFrame: string;
        methodology: string;
        tools?: string[];
        analysts?: PersonInfo[];
    };
    
    // Assumptions & Limitations
    assumptions?: string[];
    limitations?: string[];
    exclusions?: string[];
    
    // Key Findings
    keyFindings: FindingData[];
    
    // Data Analysis
    dataAnalysis?: {
        summary: string;
        statistics?: StatisticsData;
        trends?: TrendData[];
        patterns?: string[];
        correlations?: CorrelationData[];
        anomalies?: string[];
        segments?: {
            name: string;
            size: number;
            characteristics: string[];
        }[];
    };
    
    // SWOT Analysis
    swotAnalysis?: {
        strengths: SWOTItem[];
        weaknesses: SWOTItem[];
        opportunities: SWOTItem[];
        threats: SWOTItem[];
        strategies?: {
            type: 'SO' | 'WO' | 'ST' | 'WT';
            description: string;
        }[];
    };
    
    // Competitive Analysis
    competitiveAnalysis?: {
        overview?: string;
        competitors: CompetitorAnalysis[];
        positioningMatrix?: string;
        benchmarks?: BenchmarkData[];
        competitiveAdvantages?: string[];
        competitiveDisadvantages?: string[];
    };
    
    // Market Analysis
    marketAnalysis?: {
        overview?: string;
        size?: number;
        growth?: number;
        trends?: string[];
        drivers?: string[];
        barriers?: string[];
        segments?: MarketSegment[];
    };
    
    // Insights & Implications
    insights: string[];
    implications?: string[];
    
    // Visualizations
    visualizations?: {
        id: string;
        type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'table' | 'funnel' | 'gauge';
        title: string;
        description?: string;
        data: any;
        config?: any;
    }[];
}

// ============================================================================
// SECTION 9: FINANCIAL REPORT INTERFACES
// ============================================================================

/**
 * Revenue data
 */
export interface RevenueData {
    id: string;
    category: string;
    subcategory?: string;
    amount: number;
    previousAmount?: number;
    budgetAmount?: number;
    variance?: number;
    variancePercent?: number;
    percentOfTotal?: number;
    growth?: number;
    notes?: string;
}

/**
 * Expense data
 */
export interface ExpenseData {
    id: string;
    category: string;
    subcategory?: string;
    amount: number;
    previousAmount?: number;
    budgetAmount?: number;
    variance?: number;
    variancePercent?: number;
    percentOfRevenue?: number;
    percentOfTotal?: number;
    isFixed?: boolean;
    notes?: string;
}

/**
 * Asset/Liability item
 */
export interface AssetLiabilityItem {
    id: string;
    name: string;
    category: string;
    subcategory?: string;
    currentPeriod: number;
    previousPeriod?: number;
    change?: number;
    changePercent?: number;
    notes?: string;
}

/**
 * Cash flow item
 */
export interface CashFlowItem {
    id: string;
    description: string;
    category: 'operating' | 'investing' | 'financing';
    subcategory?: string;
    amount: number;
    previousAmount?: number;
    isInflow: boolean;
    notes?: string;
}

/**
 * Budget item
 */
export interface BudgetItem {
    id: string;
    category: string;
    subcategory?: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercent: number;
    status: 'under' | 'on_track' | 'over';
    notes?: string;
}

/**
 * Financial ratio data
 */
export interface RatioData {
    id: string;
    name: string;
    category: 'profitability' | 'liquidity' | 'solvency' | 'efficiency' | 'valuation';
    formula?: string;
    value: number;
    previousValue?: number;
    unit: string;
    benchmark?: number;
    industryAverage?: number;
    status: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
    trend?: 'improving' | 'stable' | 'declining';
    interpretation?: string;
}

/**
 * Tax item
 */
export interface TaxItem {
    id: string;
    type: string;
    description: string;
    taxableAmount: number;
    rate: number;
    taxAmount: number;
    dueDate?: string;
    status: 'pending' | 'paid' | 'overdue';
    notes?: string;
}

/**
 * Financial report specific data
 */
export interface FinancialReportData extends BaseReportData {
    reportType: ReportType.FINANCIAL;
    
    // Financial Period
    financialPeriod: {
        type: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'ytd' | 'custom';
        year: number;
        quarter?: number;
        month?: number;
        startDate: string;
        endDate: string;
        comparativePeriod?: string;
    };
    
    // Currency
    currency: CurrencyCode;
    exchangeRate?: number;
    
    // Financial Type
    financialReportType: FinancialReportType;
    
    // Income Statement
    incomeStatement?: {
        revenue: RevenueData[];
        totalRevenue: number;
        costOfGoodsSold?: number;
        grossProfit: number;
        grossMargin?: number;
        operatingExpenses: ExpenseData[];
        totalOperatingExpenses: number;
        operatingIncome: number;
        operatingMargin?: number;
        otherIncome?: number;
        otherExpenses?: number;
        interestExpense?: number;
        incomeBeforeTax: number;
        taxExpense: number;
        effectiveTaxRate?: number;
        netIncome: number;
        netMargin?: number;
        eps?: number;
    };
    
    // Balance Sheet
    balanceSheet?: {
        assets: {
            current: AssetLiabilityItem[];
            totalCurrent: number;
            nonCurrent: AssetLiabilityItem[];
            totalNonCurrent: number;
            totalAssets: number;
        };
        liabilities: {
            current: AssetLiabilityItem[];
            totalCurrent: number;
            nonCurrent: AssetLiabilityItem[];
            totalNonCurrent: number;
            totalLiabilities: number;
        };
        equity: {
            items: AssetLiabilityItem[];
            totalEquity: number;
        };
        checkBalance?: boolean;
    };
    
    // Cash Flow
    cashFlow?: {
        operating: CashFlowItem[];
        netOperating: number;
        investing: CashFlowItem[];
        netInvesting: number;
        financing: CashFlowItem[];
        netFinancing: number;
        netCashFlow: number;
        openingBalance: number;
        closingBalance: number;
        freeCashFlow?: number;
    };
    
    // Budget Analysis
    budgetAnalysis?: {
        items: BudgetItem[];
        totalBudget: number;
        totalActual: number;
        totalVariance: number;
        totalVariancePercent: number;
        summary?: string;
    };
    
    // Financial Ratios
    financialRatios?: {
        profitability: RatioData[];
        liquidity: RatioData[];
        solvency: RatioData[];
        efficiency: RatioData[];
        valuation?: RatioData[];
    };
    
    // Comparison
    comparison?: {
        previousPeriod?: {
            revenue: number;
            expenses: number;
            profit: number;
        };
        previousYear?: {
            revenue: number;
            expenses: number;
            profit: number;
        };
        budget?: {
            revenue: number;
            expenses: number;
            profit: number;
        };
    };
    
    // Tax Summary
    taxSummary?: {
        items: TaxItem[];
        totalTaxLiability: number;
        totalTaxPaid: number;
        totalTaxDue: number;
    };
    
    // Audit Information
    auditInfo?: {
        auditorName: string;
        auditorFirm?: string;
        registrationNumber?: string;
        auditType: 'internal' | 'external' | 'statutory';
        auditOpinion?: 'unqualified' | 'qualified' | 'adverse' | 'disclaimer';
        auditDate?: string;
        notes?: string[];
    };
    
    // Certification
    certification?: {
        certifiedBy: PersonInfo;
        date: string;
        statement: string;
    };
}

// ============================================================================
// SECTION 10: PROGRESS REPORT INTERFACES
// ============================================================================

/**
 * Task data
 */
export interface TaskData {
    id: string;
    title: string;
    description?: string;
    category?: string;
    assignee?: string;
    assigneeEmail?: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'on_hold' | 'cancelled';
    priority: PriorityLevel;
    progress: number;
    effort?: number;
    effortUnit?: 'hours' | 'days' | 'story_points';
    startDate?: string;
    dueDate: string;
    completedDate?: string;
    dependencies?: string[];
    blockers?: string[];
    tags?: string[];
    notes?: string;
}

/**
 * Blocker data
 */
export interface BlockerData {
    id: string;
    title: string;
    description: string;
    type?: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    impactDescription?: string;
    blockedTasks?: string[];
    owner?: string;
    status: 'active' | 'resolved' | 'escalated';
    raisedDate: string;
    resolvedDate?: string;
    resolutionPlan?: string;
    resolution?: string;
    escalated: boolean;
    escalatedTo?: string;
    escalatedDate?: string;
}

/**
 * Progress metric
 */
export interface ProgressMetric {
    id: string;
    name: string;
    nameHindi?: string;
    category?: string;
    current: number;
    target: number;
    previous?: number;
    baseline?: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    changePercent?: number;
    status: 'on_track' | 'at_risk' | 'off_track' | 'exceeded';
    notes?: string;
}

/**
 * Resource utilization detail
 */
export interface ResourceUtilizationDetail {
    id: string;
    resource: string;
    type: 'human' | 'equipment' | 'material' | 'financial' | 'other';
    role?: string;
    allocated: number;
    utilized: number;
    available: number;
    utilization: number;
    unit: string;
    cost?: number;
    notes?: string;
}

/**
 * Upcoming task data
 */
export interface UpcomingTaskData {
    id: string;
    title: string;
    description?: string;
    plannedStart: string;
    plannedEnd: string;
    assignee?: string;
    priority: PriorityLevel;
    dependencies?: string[];
    prerequisites?: string[];
    risks?: string[];
    notes?: string;
}

/**
 * Progress report specific data
 */
export interface ProgressReportData extends BaseReportData {
    reportType: ReportType.PROGRESS;
    
    // Reporting Period
    reportingPeriod: {
        frequency: ReportFrequency;
        periodNumber?: number;
        periodLabel?: string;
        startDate: string;
        endDate: string;
        workingDays?: number;
    };
    
    // Project/Work Reference
    reference: {
        type: 'project' | 'department' | 'team' | 'individual' | 'initiative' | 'program';
        name: string;
        code?: string;
        manager?: string;
        sponsor?: string;
    };
    
    // Overall Status
    overallStatus: {
        status: ProjectStatus;
        healthIndicator: 'green' | 'yellow' | 'red' | 'blue';
        progress: number;
        progressChange?: number;
        summary: string;
        highlights?: string[];
        concerns?: string[];
    };
    
    // Task Summary
    taskSummary: {
        total: number;
        completed: number;
        completedThisPeriod?: number;
        inProgress: number;
        pending: number;
        blocked: number;
        overdue: number;
        cancelled?: number;
        completionRate?: number;
    };
    
    // Detailed Tasks
    tasks: TaskData[];
    
    // Achievements
    achievements: string[];
    achievementsDetailed?: {
        description: string;
        impact?: string;
        contributors?: string[];
        date?: string;
    }[];
    
    // Challenges & Issues
    challenges: string[];
    issues?: IssueData[];
    blockers?: BlockerData[];
    
    // Metrics
    metrics?: ProgressMetric[];
    
    // Schedule Analysis
    scheduleAnalysis?: {
        plannedCompletion: string;
        forecastCompletion: string;
        variance: number;
        varianceUnit: 'days' | 'weeks' | 'months';
        slippage?: number;
        criticalPath?: string[];
        criticalPathStatus?: 'on_track' | 'at_risk' | 'delayed';
        bufferConsumed?: number;
        notes?: string;
    };
    
    // Budget Status
    budgetStatus?: {
        allocated: number;
        spent: number;
        committed?: number;
        remaining: number;
        forecast: number;
        variance: number;
        variancePercent: number;
        currency: CurrencyCode;
        burnRate?: number;
        notes?: string;
    };
    
    // Resource Utilization
    resourceUtilization?: {
        summary?: string;
        totalAllocated: number;
        totalUtilized: number;
        totalAvailable: number;
        overallUtilization: number;
        details?: ResourceUtilizationDetail[];
    };
    
    // Upcoming Work
    upcomingTasks: UpcomingTaskData[];
    upcomingMilestones?: {
        name: string;
        date: string;
        status: 'on_track' | 'at_risk' | 'delayed';
    }[];
    
    // Support Required
    supportRequired?: {
        description: string;
        type: 'resource' | 'decision' | 'approval' | 'escalation' | 'other';
        priority: PriorityLevel;
        requestedFrom?: string;
        dueDate?: string;
    }[];
    
    // Team Updates
    teamUpdates?: string[];
    
    // Risks
    risks?: RiskItem[];
    
    // Next Period Focus
    nextPeriodFocus?: {
        objectives: string[];
        priorities: string[];
        keyDeliverables: string[];
        plannedLeave?: string[];
    };
}

// ============================================================================
// SECTION 11: INCIDENT REPORT INTERFACES
// ============================================================================

/**
 * Affected person in incident
 */
export interface AffectedPerson {
    id: string;
    name: string;
    employeeId?: string;
    department?: string;
    designation?: string;
    contactNumber?: string;
    email?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    injuryType?: string;
    injuryDescription?: string;
    injurySeverity?: 'minor' | 'moderate' | 'serious' | 'critical' | 'fatal';
    bodyPartAffected?: string[];
    treatmentProvided?: string;
    hospitalName?: string;
    medicalReportAttached?: boolean;
    workRestrictions?: string;
    daysLost?: number;
}

/**
 * Witness information
 */
export interface WitnessInfo {
    id: string;
    name: string;
    employeeId?: string;
    department?: string;
    designation?: string;
    contactNumber?: string;
    email?: string;
    statement?: string;
    statementDate?: string;
    statementRecordedBy?: string;
    willingness?: 'willing' | 'reluctant' | 'refused';
}

/**
 * Injury detail
 */
export interface InjuryDetail {
    id: string;
    personName: string;
    personId?: string;
    injuryType: string;
    injuryDescription: string;
    bodyPart: string[];
    severity: 'first_aid' | 'minor' | 'moderate' | 'serious' | 'critical' | 'fatal';
    treatmentProvided: string;
    treatedBy?: string;
    medicalFacility?: string;
    hospitalized: boolean;
    hospitalizationDays?: number;
    prognosis?: string;
    expectedRecovery?: string;
    permanentDisability?: boolean;
    disabilityDescription?: string;
    workersCompClaim?: boolean;
    claimNumber?: string;
}

/**
 * Damage detail
 */
export interface DamageDetail {
    id: string;
    type: 'property' | 'equipment' | 'vehicle' | 'infrastructure' | 'environmental' | 'data' | 'other';
    description: string;
    location?: string;
    assetId?: string;
    assetName?: string;
    ownerDepartment?: string;
    estimatedCost: number;
    actualCost?: number;
    currency: CurrencyCode;
    insuranceClaimed?: boolean;
    insuranceClaimNumber?: string;
    repairStatus?: 'pending' | 'in_progress' | 'completed' | 'written_off';
    repairCompletionDate?: string;
    photos?: string[];
    notes?: string;
}

/**
 * Corrective action
 */
export interface CorrectiveAction {
    id: string;
    actionNumber?: string;
    description: string;
    type: 'immediate' | 'short_term' | 'long_term' | 'permanent';
    category?: string;
    assignedTo: string;
    assignedDepartment?: string;
    targetDate: string;
    completedDate?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'verified' | 'overdue' | 'cancelled';
    priority: PriorityLevel;
    estimatedCost?: number;
    actualCost?: number;
    currency?: CurrencyCode;
    verification?: {
        verifiedBy: string;
        verifiedDate: string;
        effective: boolean;
        comments?: string;
    };
    evidence?: string[];
    notes?: string;
}

/**
 * Investigation details
 */
export interface InvestigationDetails {
    investigationId?: string;
    investigator: PersonInfo;
    coInvestigators?: PersonInfo[];
    startDate: string;
    completionDate?: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
    methodology?: string[];
    rootCause: string;
    rootCauseCategory?: string;
    contributingFactors: string[];
    findings: string[];
    evidenceCollected: {
        type: string;
        description: string;
        collectedBy?: string;
        collectedDate?: string;
        location?: string;
    }[];
    interviews?: {
        person: string;
        date: string;
        summary: string;
    }[];
    timeline?: {
        time: string;
        event: string;
    }[];
    diagrams?: string[];
    recommendations: string[];
}

/**
 * Regulatory compliance
 */
export interface RegulatoryCompliance {
    reportingRequired: boolean;
    regulatoryBody?: string;
    regulatoryBodyContact?: string;
    reportingDeadline?: string;
    reportSubmitted: boolean;
    reportSubmittedDate?: string;
    referenceNumber?: string;
    acknowledgmentReceived?: boolean;
    followUpRequired?: boolean;
    followUpDate?: string;
    finesPenalties?: number;
    complianceNotes?: string;
}

/**
 * Incident report specific data
 */
export interface IncidentReportData extends BaseReportData {
    reportType: ReportType.INCIDENT;
    
    // Incident Identification
    incidentInfo: {
        number: string;
        type: IncidentType;
        subType?: string;
        category?: string;
        severity: IncidentSeverity;
        status: 'reported' | 'acknowledged' | 'investigating' | 'resolved' | 'closed' | 'reopened';
        classification?: 'recordable' | 'non_recordable' | 'near_miss' | 'first_aid';
    };
    
    // Date & Time
    incidentDateTime: {
        date: string;
        time: string;
        shift?: 'day' | 'evening' | 'night' | 'general';
        dayOfWeek?: string;
        discoveredDate: string;
        discoveredTime?: string;
        reportedDate: string;
        reportedTime?: string;
        responseTime?: number;
    };
    
    // Location
    location: {
        site: string;
        siteCode?: string;
        building?: string;
        floor?: string;
        area: string;
        specificLocation: string;
        department?: string;
        gpsCoordinates?: string;
        hazardousArea?: boolean;
        restrictedArea?: boolean;
    };
    
    // People Involved
    people: {
        reportedBy: PersonInfo;
        discoveredBy?: PersonInfo;
        supervisorNotified?: PersonInfo;
        affectedPersons: AffectedPerson[];
        witnesses: WitnessInfo[];
        investigator?: PersonInfo;
        responsiblePerson?: PersonInfo;
    };
    
    // Incident Details
    details: {
        title: string;
        description: string;
        circumstances: string;
        sequenceOfEvents?: string;
        activityAtTime?: string;
        equipmentInvolved?: string[];
        materialsInvolved?: string[];
        environmentalConditions?: {
            weather?: string;
            lighting?: string;
            temperature?: string;
            noiseLevel?: string;
            other?: string;
        };
        ppeWorn?: string[];
        ppeRequired?: string[];
        safeguardsInPlace?: string[];
        safeguardsBypassed?: string[];
    };
    
    // Injuries
    injuries: {
        anyInjuries: boolean;
        totalAffected?: number;
        details: InjuryDetail[];
        medicalTreatmentRequired: boolean;
        hospitalizations: number;
        fatalities: number;
        firstAidOnly: number;
    };
    
    // Damages
    damages: {
        anyDamage: boolean;
        details: DamageDetail[];
        totalEstimatedCost: number;
        totalActualCost?: number;
        currency: CurrencyCode;
        insuranceNotified?: boolean;
        insuranceClaimFiled?: boolean;
        photos?: string[];
    };
    
    // Environmental Impact
    environmentalImpact?: {
        anyImpact: boolean;
        type?: string[];
        description?: string;
        areaAffected?: string;
        containmentMeasures?: string[];
        cleanupRequired?: boolean;
        cleanupStatus?: string;
        regulatoryNotification?: boolean;
    };
    
    // Immediate Response
    immediateResponse: {
        actionsTaken: string[];
        emergencyServicesContacted: boolean;
        emergencyServicesDetails?: string;
        areaSecured: boolean;
        evacuationRequired?: boolean;
        evacuationDetails?: string;
        firstAidProvided: boolean;
        firstAidDetails?: string;
        evidencePreserved: boolean;
        notificationsIssued: {
            person: string;
            method: string;
            time: string;
        }[];
        initialContainment?: string[];
    };
    
    // Investigation
    investigation?: InvestigationDetails;
    
    // Corrective Actions
    correctiveActions: CorrectiveAction[];
    
    // Preventive Measures
    preventiveMeasures: {
        description: string;
        type: 'engineering' | 'administrative' | 'ppe' | 'training' | 'procedure' | 'other';
        assignedTo?: string;
        targetDate?: string;
        status?: 'planned' | 'in_progress' | 'completed';
    }[];
    
    // Follow-up
    followUp: {
        required: boolean;
        actions?: string[];
        nextReviewDate?: string;
        responsiblePerson?: PersonInfo;
        frequency?: string;
        notes?: string;
    };
    
    // Closure
    closure?: {
        closedBy: PersonInfo;
        closureDate: string;
        closureNotes?: string;
        effectivenessVerified?: boolean;
        verificationDate?: string;
        verifiedBy?: string;
        lessonsLearned: string[];
        sharedWith?: string[];
        trainingUpdated?: boolean;
        proceduresUpdated?: boolean;
    };
    
    // Regulatory Compliance
    compliance?: RegulatoryCompliance;
    
    // Cost Summary
    costSummary?: {
        medicalCosts: number;
        propertyCosts: number;
        productionLoss: number;
        legalCosts?: number;
        finesPenalties?: number;
        otherCosts?: number;
        totalCosts: number;
        insuranceRecovery?: number;
        netCost?: number;
        currency: CurrencyCode;
    };
}

// ============================================================================
// SECTION 12: MEETING REPORT INTERFACES
// ============================================================================

/**
 * Attendee information
 */
export interface AttendeeInfo {
    id: string;
    name: string;
    designation?: string;
    department?: string;
    organization?: string;
    email?: string;
    phone?: string;
    role: 'chairperson' | 'secretary' | 'member' | 'guest' | 'observer' | 'presenter' | 'invitee';
    attendanceStatus: 'present' | 'absent' | 'partial' | 'proxy';
    arrivalTime?: string;
    departureTime?: string;
    proxy?: string;
    votingRights?: boolean;
    signature?: string;
}

/**
 * Absentee information
 */
export interface AbsenteeInfo {
    id: string;
    name: string;
    designation?: string;
    department?: string;
    organization?: string;
    reason?: string;
    apologyReceived: boolean;
    apologyDate?: string;
    proxy?: string;
    proxyAuthorization?: string;
    leaveApproved?: boolean;
}

/**
 * Agenda item
 */
export interface AgendaItem {
    id: string;
    number: string;
    title: string;
    description?: string;
    presenter?: string;
    presenterDesignation?: string;
    duration?: number;
    durationUnit?: 'minutes' | 'hours';
    type: 'information' | 'discussion' | 'decision' | 'action' | 'approval' | 'review' | 'other';
    priority?: PriorityLevel;
    status: 'pending' | 'discussed' | 'deferred' | 'completed' | 'cancelled';
    deferredTo?: string;
    attachments?: string[];
    notes?: string;
}

/**
 * Matter arising from previous meeting
 */
export interface MatterArising {
    id: string;
    referenceNumber?: string;
    item: string;
    originalMeetingDate?: string;
    assignedTo?: string;
    dueDate?: string;
    status: 'completed' | 'in_progress' | 'pending' | 'carried_forward' | 'dropped';
    update: string;
    completionDate?: string;
    evidence?: string;
    remarks?: string;
}

/**
 * Discussion item
 */
export interface DiscussionItem {
    id: string;
    agendaNumber: string;
    topic: string;
    presenter?: string;
    summary: string;
    keyPoints: string[];
    concerns?: string[];
    suggestions?: string[];
    questionsRaised?: {
        question: string;
        askedBy?: string;
        response?: string;
        respondedBy?: string;
    }[];
    documentsReferenced?: string[];
    duration?: number;
}

/**
 * Decision item
 */
export interface DecisionItem {
    id: string;
    decisionNumber?: string;
    agendaNumber?: string;
    description: string;
    background?: string;
    proposedBy?: string;
    secondedBy?: string;
    discussionSummary?: string;
    votingRequired: boolean;
    votingResult?: {
        method: 'show_of_hands' | 'voice' | 'ballot' | 'roll_call' | 'consensus';
        inFavor: number;
        against: number;
        abstained: number;
        notVoting?: number;
        details?: { name: string; vote: 'for' | 'against' | 'abstain' }[];
    };
    outcome: 'approved' | 'rejected' | 'deferred' | 'amended' | 'withdrawn';
    conditions?: string[];
    effectiveDate?: string;
    implementationOwner?: string;
    reviewDate?: string;
    notes?: string;
}

/**
 * Action item from meeting
 */
export interface MeetingActionItem {
    id: string;
    actionNumber?: string;
    agendaNumber?: string;
    decisionNumber?: string;
    description: string;
    background?: string;
    assignedTo: string;
    assignedDepartment?: string;
    supportingMembers?: string[];
    deadline: string;
    priority: PriorityLevel;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
    completedDate?: string;
    completionEvidence?: string;
    dependencies?: string[];
    resources?: string;
    estimatedEffort?: string;
    actualEffort?: string;
    notes?: string;
    followUpMeeting?: string;
}

/**
 * Presentation information
 */
export interface PresentationInfo {
    id: string;
    title: string;
    presenter: string;
    presenterDesignation?: string;
    duration?: number;
    agendaNumber?: string;
    summary?: string;
    keyTakeaways?: string[];
    questionsAnswered?: number;
    attachmentRef?: string;
    feedback?: string;
}

/**
 * Voting record for formal meetings
 */
export interface VotingRecord {
    id: string;
    resolutionNumber?: string;
    resolution: string;
    type: 'ordinary' | 'special' | 'procedural';
    proposedBy: string;
    secondedBy?: string;
    discussionSummary?: string;
    votingMethod: 'show_of_hands' | 'voice' | 'ballot' | 'secret_ballot' | 'roll_call' | 'electronic';
    inFavor: string[];
    against: string[];
    abstained: string[];
    notPresent?: string[];
    totalVotes: number;
    requiredMajority?: string;
    result: 'passed' | 'rejected' | 'tied' | 'deferred';
    chairpersonCastingVote?: boolean;
    effectiveDate?: string;
    remarks?: string;
}

/**
 * Meeting attachment
 */
export interface MeetingAttachment {
    id: string;
    name: string;
    type: 'agenda' | 'presentation' | 'report' | 'proposal' | 'minutes' | 'document' | 'spreadsheet' | 'other';
    description?: string;
    presenter?: string;
    agendaNumber?: string;
    fileSize?: string;
    url?: string;
    confidential?: boolean;
}

/**
 * Meeting report specific data
 */
export interface MeetingReportData extends BaseReportData {
    reportType: ReportType.MEETING;
    
    // Meeting Info
    meetingInfo: {
        title: string;
        type: MeetingType;
        subType?: string;
        purpose: string;
        series?: string;
        meetingNumber?: number;
        date: string;
        startTime: string;
        endTime: string;
        actualStartTime?: string;
        actualEndTime?: string;
        duration: string;
        venue: string;
        venueAddress?: string;
        room?: string;
        mode: 'in_person' | 'virtual' | 'hybrid';
        platform?: string;
        meetingLink?: string;
        dialInNumber?: string;
        accessCode?: string;
        recording?: string;
        recordingConsent?: boolean;
        language?: string;
    };
    
    // Participants
    participants: {
        chairperson: PersonInfo;
        viceChairperson?: PersonInfo;
        secretary: PersonInfo;
        attendees: AttendeeInfo[];
        absentees: AbsenteeInfo[];
        guests?: PersonInfo[];
        totalInvited: number;
        totalPresent: number;
        totalAbsent: number;
        quorumRequired?: number;
        quorumPresent: boolean;
        quorumNotes?: string;
    };
    
    // Agenda
    agenda: AgendaItem[];
    agendaCirculatedDate?: string;
    agendaCirculatedTo?: string[];
    
    // Previous Meeting
    previousMeeting?: {
        date: string;
        referenceNumber?: string;
        minutesApproved: boolean;
        approvalProposedBy?: string;
        approvalSecondedBy?: string;
        amendments?: string[];
        mattersArising: MatterArising[];
    };
    
    // Opening
    opening?: {
        calledToOrderBy: string;
        calledToOrderTime: string;
        openingRemarks?: string;
        specialAnnouncements?: string[];
        momentOfSilence?: boolean;
        prayerBy?: string;
    };
    
    // Discussions
    discussions: DiscussionItem[];
    
    // Decisions
    decisions: DecisionItem[];
    
    // Action Items
    actionItems: MeetingActionItem[];
    
    // Presentations
    presentations?: PresentationInfo[];
    
    // Voting Records
    votingRecords?: VotingRecord[];
    
    // Special Business
    specialBusiness?: {
        type: string;
        description: string;
        outcome?: string;
        documents?: string[];
    }[];
    
    // Any Other Business
    anyOtherBusiness?: {
        item: string;
        raisedBy?: string;
        discussion?: string;
        outcome?: string;
    }[];
    
    // Announcements
    announcements?: {
        title: string;
        description: string;
        announcedBy?: string;
        effectiveDate?: string;
    }[];
    
    // Next Meeting
    nextMeeting?: {
        confirmed: boolean;
        proposedDate?: string;
        proposedTime?: string;
        venue?: string;
        mode?: 'in_person' | 'virtual' | 'hybrid';
        tentativeAgenda?: string[];
        notes?: string;
    };
    
    // Closing
    closing: {
        closingRemarks?: string;
        thankYouNote?: string;
        adjournmentProposedBy?: string;
        adjournmentSecondedBy?: string;
        adjournmentTime: string;
        nextSteps?: string[];
    };
    
    // Attachments
    meetingAttachments?: MeetingAttachment[];
    
    // Distribution
    minutesDistribution?: {
        distributedTo: string[];
        distributionDate?: string;
        distributionMethod?: string;
        confidentialityLevel?: ConfidentialityLevel;
    };
    
    // Approval
    minutesApproval?: {
        status: 'draft' | 'circulated' | 'approved' | 'amended';
        approvedDate?: string;
        approvedBy?: string;
        amendments?: string[];
    };
}

// ============================================================================
// SECTION 13: COMMON FIELD GROUPS
// ============================================================================

/**
 * Common field groups used across all report types
 */
export const COMMON_FIELD_GROUPS: FieldGroup[] = [
    {
        id: 'report_metadata',
        name: 'Report Metadata',
        label: { en: 'Report Information', hi: 'रिपोर्ट जानकारी' },
        description: { en: 'Basic report identification details', hi: 'बुनियादी रिपोर्ट पहचान विवरण' },
        collapsible: true,
        defaultExpanded: true,
        order: 1,
        fields: ['reportNumber', 'reportTitle', 'reportSubtitle', 'reportDate', 'reportStatus', 'confidentiality', 'version'],
        icon: 'file-text'
    },
    {
        id: 'organization_info',
        name: 'Organization Info',
        label: { en: 'Organization Details', hi: 'संगठन विवरण' },
        description: { en: 'Company/Organization information', hi: 'कंपनी/संगठन की जानकारी' },
        collapsible: true,
        defaultExpanded: true,
        order: 2,
        fields: ['orgName', 'orgNameHindi', 'orgLogo', 'department', 'division', 'branch', 'address', 'gstin', 'pan'],
        icon: 'building'
    },
    {
        id: 'period_info',
        name: 'Period Info',
        label: { en: 'Reporting Period', hi: 'रिपोर्टिंग अवधि' },
        description: { en: 'Time period covered by this report', hi: 'इस रिपोर्ट द्वारा कवर की गई समय अवधि' },
        collapsible: true,
        defaultExpanded: true,
        order: 3,
        fields: ['periodFrom', 'periodTo', 'frequency', 'periodLabel'],
        icon: 'calendar'
    },
    {
        id: 'author_info',
        name: 'Author Info',
        label: { en: 'Prepared By', hi: 'द्वारा तैयार' },
        description: { en: 'Report author details', hi: 'रिपोर्ट लेखक विवरण' },
        collapsible: true,
        defaultExpanded: true,
        order: 4,
        fields: ['preparedByName', 'preparedByDesignation', 'preparedByDepartment', 'preparedByEmail', 'preparedByPhone'],
        icon: 'user'
    },
    {
        id: 'review_approval',
        name: 'Review & Approval',
        label: { en: 'Review & Approval', hi: 'समीक्षा और अनुमोदन' },
        description: { en: 'Reviewer and approver details', hi: 'समीक्षक और अनुमोदक विवरण' },
        collapsible: true,
        defaultExpanded: false,
        order: 5,
        fields: ['reviewedByName', 'reviewedByDesignation', 'reviewDate', 'approvedByName', 'approvedByDesignation', 'approvalDate'],
        icon: 'check-circle'
    },
    {
        id: 'executive_summary',
        name: 'Executive Summary',
        label: { en: 'Executive Summary', hi: 'कार्यकारी सारांश' },
        description: { en: 'Brief overview of the report', hi: 'रिपोर्ट का संक्षिप्त अवलोकन' },
        collapsible: true,
        defaultExpanded: true,
        order: 6,
        fields: ['executiveSummary', 'keyHighlights'],
        icon: 'file-text'
    },
    {
        id: 'introduction_section',
        name: 'Introduction',
        label: { en: 'Introduction', hi: 'परिचय' },
        description: { en: 'Background and objectives', hi: 'पृष्ठभूमि और उद्देश्य' },
        collapsible: true,
        defaultExpanded: true,
        order: 7,
        fields: ['introduction', 'background', 'objectives', 'scope'],
        icon: 'book-open'
    },
    {
        id: 'methodology_section',
        name: 'Methodology',
        label: { en: 'Methodology', hi: 'कार्यप्रणाली' },
        description: { en: 'Approach and methods used', hi: 'उपयोग किए गए दृष्टिकोण और तरीके' },
        collapsible: true,
        defaultExpanded: false,
        order: 8,
        fields: ['methodology', 'dataSource', 'tools', 'limitations'],
        icon: 'settings'
    },
    {
        id: 'findings_section',
        name: 'Findings',
        label: { en: 'Findings & Analysis', hi: 'निष्कर्ष और विश्लेषण' },
        description: { en: 'Key findings and analysis', hi: 'प्रमुख निष्कर्ष और विश्लेषण' },
        collapsible: true,
        defaultExpanded: true,
        order: 9,
        fields: ['findings', 'analysis', 'observations'],
        icon: 'search'
    },
    {
        id: 'conclusions_section',
        name: 'Conclusions',
        label: { en: 'Conclusions & Recommendations', hi: 'निष्कर्ष और सिफारिशें' },
        description: { en: 'Summary conclusions and recommendations', hi: 'सारांश निष्कर्ष और सिफारिशें' },
        collapsible: true,
        defaultExpanded: true,
        order: 10,
        fields: ['conclusion', 'recommendations', 'nextSteps', 'actionItems'],
        icon: 'check-square'
    },
    {
        id: 'attachments_section',
        name: 'Attachments',
        label: { en: 'Attachments & References', hi: 'संलग्नक और संदर्भ' },
        description: { en: 'Supporting documents and references', hi: 'सहायक दस्तावेज और संदर्भ' },
        collapsible: true,
        defaultExpanded: false,
        order: 11,
        fields: ['attachments', 'references', 'appendix'],
        icon: 'paperclip'
    },
    {
        id: 'signatures_section',
        name: 'Signatures',
        label: { en: 'Signatures', hi: 'हस्ताक्षर' },
        description: { en: 'Authorization signatures', hi: 'प्राधिकरण हस्ताक्षर' },
        collapsible: true,
        defaultExpanded: true,
        order: 12,
        fields: ['preparedBySignature', 'reviewedBySignature', 'approvedBySignature'],
        icon: 'edit-3'
    }
];

// ============================================================================
// SECTION 14: COMMON FIELD CONFIGURATIONS
// ============================================================================

/**
 * Common fields used across all report types
 */
export const COMMON_FIELDS: FieldConfig[] = [
    // Report Metadata Fields
    {
        id: 'reportNumber',
        name: 'reportNumber',
        label: { en: 'Report Number', hi: 'रिपोर्ट संख्या' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'e.g., RPT-2025-001', hi: 'जैसे, RPT-2025-001' },
        helpText: { en: 'Unique report identifier', hi: 'अद्वितीय रिपोर्ट पहचानकर्ता' },
        required: true,
        validation: {
            pattern: '^[A-Z]{2,5}-\\d{4}-\\d{3,6}$',
            patternMessage: { en: 'Format: XXX-YYYY-NNN', hi: 'प्रारूप: XXX-YYYY-NNN' }
        },
        groupId: 'report_metadata',
        order: 1,
        width: 'third'
    },
    {
        id: 'reportTitle',
        name: 'reportTitle',
        label: { en: 'Report Title', hi: 'रिपोर्ट शीर्षक' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Enter report title', hi: 'रिपोर्ट शीर्षक दर्ज करें' },
        required: true,
        validation: { minLength: 5, maxLength: 200 },
        groupId: 'report_metadata',
        order: 2,
        width: 'two-thirds'
    },
    {
        id: 'reportSubtitle',
        name: 'reportSubtitle',
        label: { en: 'Subtitle', hi: 'उपशीर्षक' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Optional subtitle', hi: 'वैकल्पिक उपशीर्षक' },
        required: false,
        validation: { maxLength: 150 },
        groupId: 'report_metadata',
        order: 3,
        width: 'full'
    },
    {
        id: 'reportDate',
        name: 'reportDate',
        label: { en: 'Report Date', hi: 'रिपोर्ट दिनांक' },
        type: FieldInputType.DATE,
        required: true,
        groupId: 'report_metadata',
        order: 4,
        width: 'third'
    },
    {
        id: 'reportStatus',
        name: 'reportStatus',
        label: { en: 'Status', hi: 'स्थिति' },
        type: FieldInputType.SELECT,
        required: true,
        defaultValue: ReportStatus.DRAFT,
        options: Object.entries(STATUS_LABELS).map(([value, label]) => ({
            value,
            label: { en: label.en, hi: label.hi },
            color: label.color
        })),
        groupId: 'report_metadata',
        order: 5,
        width: 'third'
    },
    {
        id: 'confidentiality',
        name: 'confidentiality',
        label: { en: 'Confidentiality', hi: 'गोपनीयता' },
        type: FieldInputType.SELECT,
        required: true,
        defaultValue: ConfidentialityLevel.INTERNAL,
        options: [
            { value: ConfidentialityLevel.PUBLIC, label: { en: 'Public', hi: 'सार्वजनिक' }, color: '#10B981' },
            { value: ConfidentialityLevel.INTERNAL, label: { en: 'Internal', hi: 'आंतरिक' }, color: '#3B82F6' },
            { value: ConfidentialityLevel.CONFIDENTIAL, label: { en: 'Confidential', hi: 'गोपनीय' }, color: '#F59E0B' },
            { value: ConfidentialityLevel.RESTRICTED, label: { en: 'Restricted', hi: 'प्रतिबंधित' }, color: '#EF4444' },
            { value: ConfidentialityLevel.TOP_SECRET, label: { en: 'Top Secret', hi: 'अति गोपनीय' }, color: '#7C3AED' }
        ],
        groupId: 'report_metadata',
        order: 6,
        width: 'third'
    },
    {
        id: 'version',
        name: 'version',
        label: { en: 'Version', hi: 'संस्करण' },
        type: FieldInputType.TEXT,
        placeholder: { en: '1.0', hi: '1.0' },
        defaultValue: '1.0',
        required: false,
        validation: {
            pattern: '^\\d+\\.\\d+(\\.\\d+)?$',
            patternMessage: { en: 'Format: X.Y or X.Y.Z', hi: 'प्रारूप: X.Y या X.Y.Z' }
        },
        groupId: 'report_metadata',
        order: 7,
        width: 'quarter'
    },
    
    // Organization Fields
    {
        id: 'orgName',
        name: 'orgName',
        label: { en: 'Organization Name', hi: 'संगठन का नाम' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Company/Organization Name', hi: 'कंपनी/संगठन का नाम' },
        required: true,
        validation: { minLength: 2, maxLength: 150 },
        groupId: 'organization_info',
        order: 1,
        width: 'half'
    },
    {
        id: 'orgNameHindi',
        name: 'orgNameHindi',
        label: { en: 'Organization Name (Hindi)', hi: 'संगठन का नाम (हिंदी)' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Organization name in Hindi', hi: 'हिंदी में संगठन का नाम' },
        required: false,
        groupId: 'organization_info',
        order: 2,
        width: 'half'
    },
    {
        id: 'orgLogo',
        name: 'orgLogo',
        label: { en: 'Logo', hi: 'लोगो' },
        type: FieldInputType.IMAGE,
        helpText: { en: 'Upload organization logo (PNG/JPG, max 2MB)', hi: 'संगठन का लोगो अपलोड करें (PNG/JPG, अधिकतम 2MB)' },
        required: false,
        groupId: 'organization_info',
        order: 3,
        width: 'quarter'
    },
    {
        id: 'department',
        name: 'department',
        label: { en: 'Department', hi: 'विभाग' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Department name', hi: 'विभाग का नाम' },
        required: false,
        groupId: 'organization_info',
        order: 4,
        width: 'third'
    },
    {
        id: 'division',
        name: 'division',
        label: { en: 'Division', hi: 'प्रभाग' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Division name', hi: 'प्रभाग का नाम' },
        required: false,
        groupId: 'organization_info',
        order: 5,
        width: 'third'
    },
    {
        id: 'branch',
        name: 'branch',
        label: { en: 'Branch/Location', hi: 'शाखा/स्थान' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Branch or location', hi: 'शाखा या स्थान' },
        required: false,
        groupId: 'organization_info',
        order: 6,
        width: 'third'
    },
    {
        id: 'address',
        name: 'address',
        label: { en: 'Address', hi: 'पता' },
        type: FieldInputType.TEXTAREA,
        placeholder: { en: 'Complete address', hi: 'पूरा पता' },
        required: false,
        validation: { maxLength: 500 },
        groupId: 'organization_info',
        order: 7,
        width: 'full'
    },
    {
        id: 'gstin',
        name: 'gstin',
        label: { en: 'GSTIN', hi: 'जीएसटीआईएन' },
        type: FieldInputType.TEXT,
        placeholder: { en: '22AAAAA0000A1Z5', hi: '22AAAAA0000A1Z5' },
        required: false,
        validation: {
            pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$',
            patternMessage: { en: 'Invalid GSTIN format', hi: 'अमान्य जीएसटीआईएन प्रारूप' }
        },
        groupId: 'organization_info',
        order: 8,
        width: 'third'
    },
    {
        id: 'pan',
        name: 'pan',
        label: { en: 'PAN', hi: 'पैन' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'AAAAA0000A', hi: 'AAAAA0000A' },
        required: false,
        validation: {
            pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
            patternMessage: { en: 'Invalid PAN format', hi: 'अमान्य पैन प्रारूप' }
        },
        groupId: 'organization_info',
        order: 9,
        width: 'third'
    },
    
    // Period Fields
    {
        id: 'periodFrom',
        name: 'periodFrom',
        label: { en: 'Period From', hi: 'अवधि से' },
        type: FieldInputType.DATE,
        required: false,
        groupId: 'period_info',
        order: 1,
        width: 'third'
    },
    {
        id: 'periodTo',
        name: 'periodTo',
        label: { en: 'Period To', hi: 'अवधि तक' },
        type: FieldInputType.DATE,
        required: false,
        groupId: 'period_info',
        order: 2,
        width: 'third'
    },
    {
        id: 'frequency',
        name: 'frequency',
        label: { en: 'Report Frequency', hi: 'रिपोर्ट आवृत्ति' },
        type: FieldInputType.SELECT,
        required: false,
        options: [
            { value: ReportFrequency.DAILY, label: { en: 'Daily', hi: 'दैनिक' } },
            { value: ReportFrequency.WEEKLY, label: { en: 'Weekly', hi: 'साप्ताहिक' } },
            { value: ReportFrequency.BIWEEKLY, label: { en: 'Bi-weekly', hi: 'पाक्षिक' } },
            { value: ReportFrequency.MONTHLY, label: { en: 'Monthly', hi: 'मासिक' } },
            { value: ReportFrequency.QUARTERLY, label: { en: 'Quarterly', hi: 'त्रैमासिक' } },
            { value: ReportFrequency.SEMI_ANNUAL, label: { en: 'Semi-Annual', hi: 'अर्धवार्षिक' } },
            { value: ReportFrequency.ANNUAL, label: { en: 'Annual', hi: 'वार्षिक' } },
            { value: ReportFrequency.AD_HOC, label: { en: 'Ad Hoc', hi: 'तदर्थ' } },
            { value: ReportFrequency.ONE_TIME, label: { en: 'One Time', hi: 'एक बार' } }
        ],
        groupId: 'period_info',
        order: 3,
        width: 'third'
    },
    
    // Author Fields
    {
        id: 'preparedByName',
        name: 'preparedByName',
        label: { en: 'Prepared By', hi: 'द्वारा तैयार' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Full name', hi: 'पूरा नाम' },
        required: true,
        groupId: 'author_info',
        order: 1,
        width: 'half'
    },
    {
        id: 'preparedByDesignation',
        name: 'preparedByDesignation',
        label: { en: 'Designation', hi: 'पदनाम' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Job title', hi: 'पद' },
        required: false,
        groupId: 'author_info',
        order: 2,
        width: 'half'
    },
    {
        id: 'preparedByDepartment',
        name: 'preparedByDepartment',
        label: { en: 'Department', hi: 'विभाग' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Department', hi: 'विभाग' },
        required: false,
        groupId: 'author_info',
        order: 3,
        width: 'third'
    },
    {
        id: 'preparedByEmail',
        name: 'preparedByEmail',
        label: { en: 'Email', hi: 'ईमेल' },
        type: FieldInputType.EMAIL,
        placeholder: { en: 'email@example.com', hi: 'email@example.com' },
        required: false,
        validation: { email: true },
        groupId: 'author_info',
        order: 4,
        width: 'third'
    },
    {
        id: 'preparedByPhone',
        name: 'preparedByPhone',
        label: { en: 'Phone', hi: 'फोन' },
        type: FieldInputType.PHONE,
        placeholder: { en: '+91 98765 43210', hi: '+91 98765 43210' },
        required: false,
        validation: { phone: true },
        groupId: 'author_info',
        order: 5,
        width: 'third'
    },
    
    // Review & Approval Fields
    {
        id: 'reviewedByName',
        name: 'reviewedByName',
        label: { en: 'Reviewed By', hi: 'द्वारा समीक्षित' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Reviewer name', hi: 'समीक्षक का नाम' },
        required: false,
        groupId: 'review_approval',
        order: 1,
        width: 'third'
    },
    {
        id: 'reviewedByDesignation',
        name: 'reviewedByDesignation',
        label: { en: 'Reviewer Designation', hi: 'समीक्षक पदनाम' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Designation', hi: 'पदनाम' },
        required: false,
        groupId: 'review_approval',
        order: 2,
        width: 'third'
    },
    {
        id: 'reviewDate',
        name: 'reviewDate',
        label: { en: 'Review Date', hi: 'समीक्षा तिथि' },
        type: FieldInputType.DATE,
        required: false,
        groupId: 'review_approval',
        order: 3,
        width: 'third'
    },
    {
        id: 'approvedByName',
        name: 'approvedByName',
        label: { en: 'Approved By', hi: 'द्वारा अनुमोदित' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Approver name', hi: 'अनुमोदक का नाम' },
        required: false,
        groupId: 'review_approval',
        order: 4,
        width: 'third'
    },
    {
        id: 'approvedByDesignation',
        name: 'approvedByDesignation',
        label: { en: 'Approver Designation', hi: 'अनुमोदक पदनाम' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Designation', hi: 'पदनाम' },
        required: false,
        groupId: 'review_approval',
        order: 5,
        width: 'third'
    },
    {
        id: 'approvalDate',
        name: 'approvalDate',
        label: { en: 'Approval Date', hi: 'अनुमोदन तिथि' },
        type: FieldInputType.DATE,
        required: false,
        groupId: 'review_approval',
        order: 6,
        width: 'third'
    },
    
    // Content Fields
    {
        id: 'executiveSummary',
        name: 'executiveSummary',
        label: { en: 'Executive Summary', hi: 'कार्यकारी सारांश' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Provide a brief executive summary...', hi: 'संक्षिप्त कार्यकारी सारांश प्रदान करें...' },
        helpText: { en: 'A concise overview of the entire report (2-3 paragraphs)', hi: 'पूरी रिपोर्ट का संक्षिप्त अवलोकन (2-3 पैराग्राफ)' },
        required: false,
        validation: { maxLength: 5000 },
        groupId: 'executive_summary',
        order: 1,
        width: 'full'
    },
    {
        id: 'keyHighlights',
        name: 'keyHighlights',
        label: { en: 'Key Highlights', hi: 'मुख्य बिंदु' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add key highlight', hi: 'मुख्य बिंदु जोड़ें' },
        required: false,
        groupId: 'executive_summary',
        order: 2,
        width: 'full'
    },
    {
        id: 'introduction',
        name: 'introduction',
        label: { en: 'Introduction', hi: 'परिचय' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Provide introduction...', hi: 'परिचय प्रदान करें...' },
        required: false,
        validation: { maxLength: 10000 },
        groupId: 'introduction_section',
        order: 1,
        width: 'full'
    },
    {
        id: 'background',
        name: 'background',
        label: { en: 'Background', hi: 'पृष्ठभूमि' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Provide background context...', hi: 'पृष्ठभूमि संदर्भ प्रदान करें...' },
        required: false,
        validation: { maxLength: 5000 },
        groupId: 'introduction_section',
        order: 2,
        width: 'full'
    },
    {
        id: 'objectives',
        name: 'objectives',
        label: { en: 'Objectives', hi: 'उद्देश्य' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add objective', hi: 'उद्देश्य जोड़ें' },
        required: false,
        groupId: 'introduction_section',
        order: 3,
        width: 'full'
    },
    {
        id: 'scope',
        name: 'scope',
        label: { en: 'Scope', hi: 'कार्यक्षेत्र' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Define the scope...', hi: 'कार्यक्षेत्र परिभाषित करें...' },
        required: false,
        validation: { maxLength: 3000 },
        groupId: 'introduction_section',
        order: 4,
        width: 'full'
    },
    {
        id: 'methodology',
        name: 'methodology',
        label: { en: 'Methodology', hi: 'कार्यप्रणाली' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Describe methodology used...', hi: 'उपयोग की गई कार्यप्रणाली का वर्णन करें...' },
        required: false,
        validation: { maxLength: 5000 },
        groupId: 'methodology_section',
        order: 1,
        width: 'full'
    },
    {
        id: 'findings',
        name: 'findings',
        label: { en: 'Findings', hi: 'निष्कर्ष' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Document key findings...', hi: 'प्रमुख निष्कर्ष दर्ज करें...' },
        required: false,
        validation: { maxLength: 15000 },
        groupId: 'findings_section',
        order: 1,
        width: 'full'
    },
    {
        id: 'analysis',
        name: 'analysis',
        label: { en: 'Analysis', hi: 'विश्लेषण' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Provide detailed analysis...', hi: 'विस्तृत विश्लेषण प्रदान करें...' },
        required: false,
        validation: { maxLength: 15000 },
        groupId: 'findings_section',
        order: 2,
        width: 'full'
    },
    {
        id: 'conclusion',
        name: 'conclusion',
        label: { en: 'Conclusion', hi: 'निष्कर्ष' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Summarize conclusions...', hi: 'निष्कर्षों का सारांश दें...' },
        required: false,
        validation: { maxLength: 5000 },
        groupId: 'conclusions_section',
        order: 1,
        width: 'full'
    },
    {
        id: 'recommendations',
        name: 'recommendations',
        label: { en: 'Recommendations', hi: 'सिफारिशें' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add recommendation', hi: 'सिफारिश जोड़ें' },
        required: false,
        groupId: 'conclusions_section',
        order: 2,
        width: 'full'
    },
    {
        id: 'nextSteps',
        name: 'nextSteps',
        label: { en: 'Next Steps', hi: 'अगले कदम' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add next step', hi: 'अगला कदम जोड़ें' },
        required: false,
        groupId: 'conclusions_section',
        order: 3,
        width: 'full'
    },
    {
        id: 'actionItems',
        name: 'actionItems',
        label: { en: 'Action Items', hi: 'कार्य आइटम' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add action item', hi: 'कार्य आइटम जोड़ें' },
        required: false,
        groupId: 'conclusions_section',
        order: 4,
        width: 'full'
    },
    
    // Signature Fields
    {
        id: 'preparedBySignature',
        name: 'preparedBySignature',
        label: { en: 'Prepared By Signature', hi: 'तैयारकर्ता के हस्ताक्षर' },
        type: FieldInputType.SIGNATURE,
        required: false,
        groupId: 'signatures_section',
        order: 1,
        width: 'third'
    },
    {
        id: 'reviewedBySignature',
        name: 'reviewedBySignature',
        label: { en: 'Reviewed By Signature', hi: 'समीक्षक के हस्ताक्षर' },
        type: FieldInputType.SIGNATURE,
        required: false,
        groupId: 'signatures_section',
        order: 2,
        width: 'third'
    },
    {
        id: 'approvedBySignature',
        name: 'approvedBySignature',
        label: { en: 'Approved By Signature', hi: 'अनुमोदक के हस्ताक्षर' },
        type: FieldInputType.SIGNATURE,
        required: false,
        groupId: 'signatures_section',
        order: 3,
        width: 'third'
    }
];

// ============================================================================
// SECTION 15: REPORT-SPECIFIC FIELD CONFIGURATIONS
// ============================================================================

/**
 * Business Report specific fields
 */
export const BUSINESS_REPORT_FIELDS: FieldConfig[] = [
    {
        id: 'businessDescription',
        name: 'businessDescription',
        label: { en: 'Business Description', hi: 'व्यापार विवरण' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Describe the business overview...', hi: 'व्यापार का अवलोकन वर्णन करें...' },
        required: true,
        validation: { minLength: 100, maxLength: 10000 },
        groupId: 'business_overview',
        order: 1,
        width: 'full'
    },
    {
        id: 'visionStatement',
        name: 'visionStatement',
        label: { en: 'Vision Statement', hi: 'विजन स्टेटमेंट' },
        type: FieldInputType.TEXTAREA,
        placeholder: { en: 'Company vision...', hi: 'कंपनी की दृष्टि...' },
        required: false,
        validation: { maxLength: 500 },
        groupId: 'business_overview',
        order: 2,
        width: 'half'
    },
    {
        id: 'missionStatement',
        name: 'missionStatement',
        label: { en: 'Mission Statement', hi: 'मिशन स्टेटमेंट' },
        type: FieldInputType.TEXTAREA,
        placeholder: { en: 'Company mission...', hi: 'कंपनी का मिशन...' },
        required: false,
        validation: { maxLength: 500 },
        groupId: 'business_overview',
        order: 3,
        width: 'half'
    },
    {
        id: 'totalRevenue',
        name: 'totalRevenue',
        label: { en: 'Total Revenue', hi: 'कुल राजस्व' },
        type: FieldInputType.CURRENCY,
        placeholder: { en: '0.00', hi: '0.00' },
        required: false,
        groupId: 'financial_highlights',
        order: 1,
        width: 'third',
        prefix: '₹'
    },
    {
        id: 'totalExpenses',
        name: 'totalExpenses',
        label: { en: 'Total Expenses', hi: 'कुल व्यय' },
        type: FieldInputType.CURRENCY,
        placeholder: { en: '0.00', hi: '0.00' },
        required: false,
        groupId: 'financial_highlights',
        order: 2,
        width: 'third',
        prefix: '₹'
    },
    {
        id: 'netProfit',
        name: 'netProfit',
        label: { en: 'Net Profit', hi: 'शुद्ध लाभ' },
        type: FieldInputType.CURRENCY,
        placeholder: { en: '0.00', hi: '0.00' },
        required: false,
        groupId: 'financial_highlights',
        order: 3,
        width: 'third',
        prefix: '₹'
    },
    {
        id: 'growthRate',
        name: 'growthRate',
        label: { en: 'Growth Rate', hi: 'विकास दर' },
        type: FieldInputType.PERCENTAGE,
        placeholder: { en: '0', hi: '0' },
        required: false,
        groupId: 'financial_highlights',
        order: 4,
        width: 'third',
        suffix: '%'
    },
    {
        id: 'marketSize',
        name: 'marketSize',
        label: { en: 'Market Size', hi: 'बाजार का आकार' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'e.g., ₹500 Crore', hi: 'जैसे, ₹500 करोड़' },
        required: false,
        groupId: 'market_analysis',
        order: 1,
        width: 'half'
    },
    {
        id: 'marketShare',
        name: 'marketShare',
        label: { en: 'Market Share', hi: 'बाजार हिस्सेदारी' },
        type: FieldInputType.PERCENTAGE,
        placeholder: { en: '0', hi: '0' },
        required: false,
        groupId: 'market_analysis',
        order: 2,
        width: 'half',
        suffix: '%'
    },
    {
        id: 'shortTermOutlook',
        name: 'shortTermOutlook',
        label: { en: 'Short Term Outlook (0-1 Year)', hi: 'अल्पकालिक दृष्टिकोण (0-1 वर्ष)' },
        type: FieldInputType.TEXTAREA,
        placeholder: { en: 'Short term outlook...', hi: 'अल्पकालिक दृष्टिकोण...' },
        required: false,
        validation: { maxLength: 2000 },
        groupId: 'future_outlook',
        order: 1,
        width: 'full'
    },
    {
        id: 'longTermOutlook',
        name: 'longTermOutlook',
        label: { en: 'Long Term Outlook (3+ Years)', hi: 'दीर्घकालिक दृष्टिकोण (3+ वर्ष)' },
        type: FieldInputType.TEXTAREA,
        placeholder: { en: 'Long term outlook...', hi: 'दीर्घकालिक दृष्टिकोण...' },
        required: false,
        validation: { maxLength: 2000 },
        groupId: 'future_outlook',
        order: 2,
        width: 'full'
    }
];

/**
 * Business Report field groups
 */
export const BUSINESS_REPORT_FIELD_GROUPS: FieldGroup[] = [
    {
        id: 'business_overview',
        name: 'Business Overview',
        label: { en: 'Business Overview', hi: 'व्यापार अवलोकन' },
        collapsible: true,
        defaultExpanded: true,
        order: 13,
        fields: ['businessDescription', 'visionStatement', 'missionStatement']
    },
    {
        id: 'financial_highlights',
        name: 'Financial Highlights',
        label: { en: 'Financial Highlights', hi: 'वित्तीय मुख्य बातें' },
        collapsible: true,
        defaultExpanded: true,
        order: 14,
        fields: ['totalRevenue', 'totalExpenses', 'netProfit', 'growthRate']
    },
    {
        id: 'market_analysis',
        name: 'Market Analysis',
        label: { en: 'Market Analysis', hi: 'बाजार विश्लेषण' },
        collapsible: true,
        defaultExpanded: true,
        order: 15,
        fields: ['marketSize', 'marketShare']
    },
    {
        id: 'future_outlook',
        name: 'Future Outlook',
        label: { en: 'Future Outlook', hi: 'भविष्य का दृष्टिकोण' },
        collapsible: true,
        defaultExpanded: true,
        order: 16,
        fields: ['shortTermOutlook', 'longTermOutlook']
    }
];

/**
 * Project Report specific fields
 */
export const PROJECT_REPORT_FIELDS: FieldConfig[] = [
    {
        id: 'projectName',
        name: 'projectName',
        label: { en: 'Project Name', hi: 'परियोजना का नाम' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Enter project name', hi: 'परियोजना का नाम दर्ज करें' },
        required: true,
        validation: { minLength: 3, maxLength: 150 },
        groupId: 'project_info',
        order: 1,
        width: 'two-thirds'
    },
    {
        id: 'projectCode',
        name: 'projectCode',
        label: { en: 'Project Code', hi: 'परियोजना कोड' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'PRJ-001', hi: 'PRJ-001' },
        required: true,
        validation: { pattern: '^[A-Z]{2,5}-\\d{3,6}$' },
        groupId: 'project_info',
        order: 2,
        width: 'third'
    },
    {
        id: 'projectDescription',
        name: 'projectDescription',
        label: { en: 'Project Description', hi: 'परियोजना विवरण' },
        type: FieldInputType.TEXTAREA,
        placeholder: { en: 'Describe the project...', hi: 'परियोजना का वर्णन करें...' },
        required: true,
        validation: { minLength: 50, maxLength: 2000 },
        groupId: 'project_info',
        order: 3,
        width: 'full'
    },
    {
        id: 'projectStatus',
        name: 'projectStatus',
        label: { en: 'Project Status', hi: 'परियोजना स्थिति' },
        type: FieldInputType.SELECT,
        required: true,
        defaultValue: ProjectStatus.IN_PROGRESS,
        options: Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
            value,
            label: { en: label.en, hi: label.hi },
            color: label.color
        })),
        groupId: 'project_info',
        order: 4,
        width: 'third'
    },
    {
        id: 'projectPhase',
        name: 'projectPhase',
        label: { en: 'Current Phase', hi: 'वर्तमान चरण' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'e.g., Development Phase 2', hi: 'जैसे, विकास चरण 2' },
        required: false,
        groupId: 'project_info',
        order: 5,
        width: 'third'
    },
    {
        id: 'projectManager',
        name: 'projectManager',
        label: { en: 'Project Manager', hi: 'परियोजना प्रबंधक' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Manager name', hi: 'प्रबंधक का नाम' },
        required: true,
        groupId: 'project_info',
        order: 6,
        width: 'third'
    },
    {
        id: 'projectStartDate',
        name: 'projectStartDate',
        label: { en: 'Start Date', hi: 'आरंभ तिथि' },
        type: FieldInputType.DATE,
        required: true,
        groupId: 'project_timeline',
        order: 1,
        width: 'quarter'
    },
    {
        id: 'projectEndDate',
        name: 'projectEndDate',
        label: { en: 'End Date', hi: 'समाप्ति तिथि' },
        type: FieldInputType.DATE,
        required: true,
        groupId: 'project_timeline',
        order: 2,
        width: 'quarter'
    },
    {
        id: 'overallProgress',
        name: 'overallProgress',
        label: { en: 'Overall Progress', hi: 'समग्र प्रगति' },
        type: FieldInputType.PERCENTAGE,
        placeholder: { en: '0', hi: '0' },
        required: true,
        validation: { min: 0, max: 100 },
        groupId: 'progress_metrics',
        order: 1,
        width: 'quarter',
        suffix: '%'
    },
    {
        id: 'budgetAllocated',
        name: 'budgetAllocated',
        label: { en: 'Budget Allocated', hi: 'आवंटित बजट' },
        type: FieldInputType.CURRENCY,
        placeholder: { en: '0.00', hi: '0.00' },
        required: false,
        groupId: 'project_budget',
        order: 1,
        width: 'third',
        prefix: '₹'
    },
    {
        id: 'budgetSpent',
        name: 'budgetSpent',
        label: { en: 'Budget Spent', hi: 'खर्च बजट' },
        type: FieldInputType.CURRENCY,
        placeholder: { en: '0.00', hi: '0.00' },
        required: false,
        groupId: 'project_budget',
        order: 2,
        width: 'third',
        prefix: '₹'
    },
    {
        id: 'budgetVariance',
        name: 'budgetVariance',
        label: { en: 'Variance', hi: 'विचलन' },
        type: FieldInputType.CALCULATED,
        required: false,
        groupId: 'project_budget',
        order: 3,
        width: 'third'
    }
];

/**
 * Project Report field groups
 */
export const PROJECT_REPORT_FIELD_GROUPS: FieldGroup[] = [
    {
        id: 'project_info',
        name: 'Project Information',
        label: { en: 'Project Information', hi: 'परियोजना जानकारी' },
        collapsible: true,
        defaultExpanded: true,
        order: 13,
        fields: ['projectName', 'projectCode', 'projectDescription', 'projectStatus', 'projectPhase', 'projectManager']
    },
    {
        id: 'project_timeline',
        name: 'Project Timeline',
        label: { en: 'Project Timeline', hi: 'परियोजना समयरेखा' },
        collapsible: true,
        defaultExpanded: true,
        order: 14,
        fields: ['projectStartDate', 'projectEndDate']
    },
    {
        id: 'progress_metrics',
        name: 'Progress Metrics',
        label: { en: 'Progress Metrics', hi: 'प्रगति मेट्रिक्स' },
        collapsible: true,
        defaultExpanded: true,
        order: 15,
        fields: ['overallProgress']
    },
    {
        id: 'project_budget',
        name: 'Project Budget',
        label: { en: 'Budget Overview', hi: 'बजट अवलोकन' },
        collapsible: true,
        defaultExpanded: true,
        order: 16,
        fields: ['budgetAllocated', 'budgetSpent', 'budgetVariance']
    }
];

/**
 * Financial Report specific fields
 */
export const FINANCIAL_REPORT_FIELDS: FieldConfig[] = [
    {
        id: 'financialYear',
        name: 'financialYear',
        label: { en: 'Financial Year', hi: 'वित्तीय वर्ष' },
        type: FieldInputType.TEXT,
        placeholder: { en: '2024-25', hi: '2024-25' },
        required: true,
        validation: { pattern: '^\\d{4}(-\\d{2,4})?$' },
        groupId: 'financial_period',
        order: 1,
        width: 'third'
    },
    {
        id: 'reportQuarter',
        name: 'reportQuarter',
        label: { en: 'Quarter', hi: 'तिमाही' },
        type: FieldInputType.SELECT,
        required: false,
        options: [
            { value: 'Q1', label: { en: 'Q1 (Apr-Jun)', hi: 'Q1 (अप्रैल-जून)' } },
            { value: 'Q2', label: { en: 'Q2 (Jul-Sep)', hi: 'Q2 (जुलाई-सितंबर)' } },
            { value: 'Q3', label: { en: 'Q3 (Oct-Dec)', hi: 'Q3 (अक्टूबर-दिसंबर)' } },
            { value: 'Q4', label: { en: 'Q4 (Jan-Mar)', hi: 'Q4 (जनवरी-मार्च)' } },
            { value: 'H1', label: { en: 'H1 (Apr-Sep)', hi: 'H1 (अप्रैल-सितंबर)' } },
            { value: 'H2', label: { en: 'H2 (Oct-Mar)', hi: 'H2 (अक्टूबर-मार्च)' } },
            { value: 'FY', label: { en: 'Full Year', hi: 'पूरा वर्ष' } }
        ],
        groupId: 'financial_period',
        order: 2,
        width: 'third'
    },
    {
        id: 'financialReportType',
        name: 'financialReportType',
        label: { en: 'Report Type', hi: 'रिपोर्ट प्रकार' },
        type: FieldInputType.SELECT,
        required: true,
        options: [
            { value: FinancialReportType.PROFIT_LOSS, label: { en: 'Profit & Loss', hi: 'लाभ और हानि' } },
            { value: FinancialReportType.BALANCE_SHEET, label: { en: 'Balance Sheet', hi: 'तुलन पत्र' } },
            { value: FinancialReportType.CASH_FLOW, label: { en: 'Cash Flow', hi: 'नकदी प्रवाह' } },
            { value: FinancialReportType.BUDGET_VARIANCE, label: { en: 'Budget Variance', hi: 'बजट विचलन' } },
            { value: FinancialReportType.EXPENSE_REPORT, label: { en: 'Expense Report', hi: 'व्यय रिपोर्ट' } }
        ],
        groupId: 'financial_period',
        order: 3,
        width: 'third'
    },
    {
        id: 'currencyCode',
        name: 'currencyCode',
        label: { en: 'Currency', hi: 'मुद्रा' },
        type: FieldInputType.SELECT,
        required: true,
        defaultValue: CurrencyCode.INR,
        options: Object.entries(CURRENCY_LABELS).map(([value, label]) => ({
            value,
            label
        })),
        groupId: 'financial_period',
        order: 4,
        width: 'third'
    },
    {
        id: 'grossProfit',
        name: 'grossProfit',
        label: { en: 'Gross Profit', hi: 'सकल लाभ' },
        type: FieldInputType.CURRENCY,
        placeholder: { en: '0.00', hi: '0.00' },
        required: false,
        groupId: 'profitability',
        order: 1,
        width: 'quarter',
        prefix: '₹'
    },
    {
        id: 'operatingProfit',
        name: 'operatingProfit',
        label: { en: 'Operating Profit', hi: 'परिचालन लाभ' },
        type: FieldInputType.CURRENCY,
        placeholder: { en: '0.00', hi: '0.00' },
        required: false,
        groupId: 'profitability',
        order: 2,
        width: 'quarter',
        prefix: '₹'
    },
    {
        id: 'netProfitAmount',
        name: 'netProfitAmount',
        label: { en: 'Net Profit', hi: 'शुद्ध लाभ' },
        type: FieldInputType.CURRENCY,
        placeholder: { en: '0.00', hi: '0.00' },
        required: false,
        groupId: 'profitability',
        order: 3,
        width: 'quarter',
        prefix: '₹'
    },
    {
        id: 'profitMargin',
        name: 'profitMargin',
        label: { en: 'Profit Margin', hi: 'लाभ मार्जिन' },
        type: FieldInputType.PERCENTAGE,
        placeholder: { en: '0', hi: '0' },
        required: false,
        groupId: 'profitability',
        order: 4,
        width: 'quarter',
        suffix: '%'
    }
];

/**
 * Financial Report field groups
 */
export const FINANCIAL_REPORT_FIELD_GROUPS: FieldGroup[] = [
    {
        id: 'financial_period',
        name: 'Financial Period',
        label: { en: 'Financial Period', hi: 'वित्तीय अवधि' },
        collapsible: true,
        defaultExpanded: true,
        order: 13,
        fields: ['financialYear', 'reportQuarter', 'financialReportType', 'currencyCode']
    },
    {
        id: 'profitability',
        name: 'Profitability',
        label: { en: 'Profitability', hi: 'लाभप्रदता' },
        collapsible: true,
        defaultExpanded: true,
        order: 14,
        fields: ['grossProfit', 'operatingProfit', 'netProfitAmount', 'profitMargin']
    }
];

/**
 * Progress Report specific fields
 */
export const PROGRESS_REPORT_FIELDS: FieldConfig[] = [
    {
        id: 'referenceType',
        name: 'referenceType',
        label: { en: 'Report For', hi: 'रिपोर्ट के लिए' },
        type: FieldInputType.SELECT,
        required: true,
        options: [
            { value: 'project', label: { en: 'Project', hi: 'परियोजना' } },
            { value: 'department', label: { en: 'Department', hi: 'विभाग' } },
            { value: 'team', label: { en: 'Team', hi: 'टीम' } },
            { value: 'individual', label: { en: 'Individual', hi: 'व्यक्तिगत' } }
        ],
        groupId: 'reference_info',
        order: 1,
        width: 'third'
    },
    {
        id: 'referenceName',
        name: 'referenceName',
        label: { en: 'Name', hi: 'नाम' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Project/Team Name', hi: 'परियोजना/टीम का नाम' },
        required: true,
        groupId: 'reference_info',
        order: 2,
        width: 'two-thirds'
    },
    {
        id: 'healthIndicator',
        name: 'healthIndicator',
        label: { en: 'Health Indicator', hi: 'स्वास्थ्य संकेतक' },
        type: FieldInputType.SELECT,
        required: true,
        options: [
            { value: 'green', label: { en: '🟢 On Track', hi: '🟢 ट्रैक पर' }, color: '#10B981' },
            { value: 'yellow', label: { en: '🟡 At Risk', hi: '🟡 जोखिम में' }, color: '#F59E0B' },
            { value: 'red', label: { en: '🔴 Off Track', hi: '🔴 ट्रैक से बाहर' }, color: '#EF4444' }
        ],
        groupId: 'overall_status',
        order: 1,
        width: 'third'
    },
    {
        id: 'progressPercentage',
        name: 'progressPercentage',
        label: { en: 'Progress', hi: 'प्रगति' },
        type: FieldInputType.PERCENTAGE,
        placeholder: { en: '0', hi: '0' },
        required: true,
        validation: { min: 0, max: 100 },
        groupId: 'overall_status',
        order: 2,
        width: 'third',
        suffix: '%'
    },
    {
        id: 'statusSummary',
        name: 'statusSummary',
        label: { en: 'Status Summary', hi: 'स्थिति सारांश' },
        type: FieldInputType.TEXTAREA,
        placeholder: { en: 'Brief status summary...', hi: 'संक्षिप्त स्थिति सारांश...' },
        required: true,
        validation: { minLength: 20, maxLength: 500 },
        groupId: 'overall_status',
        order: 3,
        width: 'full'
    },
    {
        id: 'totalTasks',
        name: 'totalTasks',
        label: { en: 'Total Tasks', hi: 'कुल कार्य' },
        type: FieldInputType.NUMBER,
        placeholder: { en: '0', hi: '0' },
        required: false,
        groupId: 'task_summary',
        order: 1,
        width: 'quarter'
    },
    {
        id: 'completedTasks',
        name: 'completedTasks',
        label: { en: 'Completed', hi: 'पूर्ण' },
        type: FieldInputType.NUMBER,
        placeholder: { en: '0', hi: '0' },
        required: false,
        groupId: 'task_summary',
        order: 2,
        width: 'quarter'
    },
    {
        id: 'inProgressTasks',
        name: 'inProgressTasks',
        label: { en: 'In Progress', hi: 'प्रगति में' },
        type: FieldInputType.NUMBER,
        placeholder: { en: '0', hi: '0' },
        required: false,
        groupId: 'task_summary',
        order: 3,
        width: 'quarter'
    },
    {
        id: 'blockedTasks',
        name: 'blockedTasks',
        label: { en: 'Blocked', hi: 'अवरुद्ध' },
        type: FieldInputType.NUMBER,
        placeholder: { en: '0', hi: '0' },
        required: false,
        groupId: 'task_summary',
        order: 4,
        width: 'quarter'
    },
    {
        id: 'keyAchievements',
        name: 'keyAchievements',
        label: { en: 'Key Achievements', hi: 'प्रमुख उपलब्धियां' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add achievement', hi: 'उपलब्धि जोड़ें' },
        required: false,
        groupId: 'achievements_section',
        order: 1,
        width: 'full'
    },
    {
        id: 'challengesFaced',
        name: 'challengesFaced',
        label: { en: 'Challenges Faced', hi: 'आने वाली चुनौतियां' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add challenge', hi: 'चुनौती जोड़ें' },
        required: false,
        groupId: 'challenges_section',
        order: 1,
        width: 'full'
    },
    {
        id: 'nextPeriodPriorities',
        name: 'nextPeriodPriorities',
        label: { en: 'Next Period Priorities', hi: 'अगली अवधि की प्राथमिकताएं' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add priority', hi: 'प्राथमिकता जोड़ें' },
        required: false,
        groupId: 'upcoming_work',
        order: 1,
        width: 'full'
    }
];

/**
 * Progress Report field groups
 */
export const PROGRESS_REPORT_FIELD_GROUPS: FieldGroup[] = [
    {
        id: 'reference_info',
        name: 'Reference Information',
        label: { en: 'Reference Information', hi: 'संदर्भ जानकारी' },
        collapsible: true,
        defaultExpanded: true,
        order: 13,
        fields: ['referenceType', 'referenceName']
    },
    {
        id: 'overall_status',
        name: 'Overall Status',
        label: { en: 'Overall Status', hi: 'समग्र स्थिति' },
        collapsible: true,
        defaultExpanded: true,
        order: 14,
        fields: ['healthIndicator', 'progressPercentage', 'statusSummary']
    },
    {
        id: 'task_summary',
        name: 'Task Summary',
        label: { en: 'Task Summary', hi: 'कार्य सारांश' },
        collapsible: true,
        defaultExpanded: true,
        order: 15,
        fields: ['totalTasks', 'completedTasks', 'inProgressTasks', 'blockedTasks']
    },
    {
        id: 'achievements_section',
        name: 'Achievements',
        label: { en: 'Key Achievements', hi: 'प्रमुख उपलब्धियां' },
        collapsible: true,
        defaultExpanded: true,
        order: 16,
        fields: ['keyAchievements']
    },
    {
        id: 'challenges_section',
        name: 'Challenges',
        label: { en: 'Challenges', hi: 'चुनौतियां' },
        collapsible: true,
        defaultExpanded: true,
        order: 17,
        fields: ['challengesFaced']
    },
    {
        id: 'upcoming_work',
        name: 'Upcoming Work',
        label: { en: 'Upcoming Work', hi: 'आगामी कार्य' },
        collapsible: true,
        defaultExpanded: true,
        order: 18,
        fields: ['nextPeriodPriorities']
    }
];

/**
 * Incident Report specific fields
 */
export const INCIDENT_REPORT_FIELDS: FieldConfig[] = [
    {
        id: 'incidentNumber',
        name: 'incidentNumber',
        label: { en: 'Incident Number', hi: 'घटना संख्या' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'INC-2025-001', hi: 'INC-2025-001' },
        required: true,
        validation: { pattern: '^INC-\\d{4}-\\d{3,6}$' },
        groupId: 'incident_identification',
        order: 1,
        width: 'third'
    },
    {
        id: 'incidentType',
        name: 'incidentType',
        label: { en: 'Incident Type', hi: 'घटना का प्रकार' },
        type: FieldInputType.SELECT,
        required: true,
        options: [
            { value: IncidentType.WORKPLACE_INJURY, label: { en: 'Workplace Injury', hi: 'कार्यस्थल चोट' } },
            { value: IncidentType.EQUIPMENT_FAILURE, label: { en: 'Equipment Failure', hi: 'उपकरण विफलता' } },
            { value: IncidentType.SECURITY_BREACH, label: { en: 'Security Breach', hi: 'सुरक्षा उल्लंघन' } },
            { value: IncidentType.SAFETY_HAZARD, label: { en: 'Safety Hazard', hi: 'सुरक्षा खतरा' } },
            { value: IncidentType.NEAR_MISS, label: { en: 'Near Miss', hi: 'निकट चूक' } },
            { value: IncidentType.PROPERTY_DAMAGE, label: { en: 'Property Damage', hi: 'संपत्ति क्षति' } },
            { value: IncidentType.OTHER, label: { en: 'Other', hi: 'अन्य' } }
        ],
        groupId: 'incident_identification',
        order: 2,
        width: 'third'
    },
    {
        id: 'incidentSeverity',
        name: 'incidentSeverity',
        label: { en: 'Severity', hi: 'गंभीरता' },
        type: FieldInputType.SELECT,
        required: true,
        options: Object.entries(INCIDENT_SEVERITY_LABELS).map(([value, label]) => ({
            value,
            label: { en: label.en, hi: label.hi },
            color: label.color
        })),
        groupId: 'incident_identification',
        order: 3,
        width: 'third'
    },
    {
        id: 'incidentDate',
        name: 'incidentDate',
        label: { en: 'Incident Date', hi: 'घटना तिथि' },
        type: FieldInputType.DATE,
        required: true,
        groupId: 'incident_datetime',
        order: 1,
        width: 'quarter'
    },
    {
        id: 'incidentTime',
        name: 'incidentTime',
        label: { en: 'Incident Time', hi: 'घटना समय' },
        type: FieldInputType.TIME,
        required: true,
        groupId: 'incident_datetime',
        order: 2,
        width: 'quarter'
    },
    {
        id: 'incidentLocation',
        name: 'incidentLocation',
        label: { en: 'Location', hi: 'स्थान' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Specific location', hi: 'विशिष्ट स्थान' },
        required: true,
        groupId: 'incident_location',
        order: 1,
        width: 'full'
    },
    {
        id: 'incidentDescription',
        name: 'incidentDescription',
        label: { en: 'Incident Description', hi: 'घटना विवरण' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Describe the incident in detail...', hi: 'घटना का विस्तार से वर्णन करें...' },
        required: true,
        validation: { minLength: 50, maxLength: 10000 },
        groupId: 'incident_details',
        order: 1,
        width: 'full'
    },
    {
        id: 'immediateActionsTaken',
        name: 'immediateActionsTaken',
        label: { en: 'Immediate Actions Taken', hi: 'तत्काल की गई कार्रवाई' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add action', hi: 'कार्रवाई जोड़ें' },
        required: true,
        groupId: 'immediate_response',
        order: 1,
        width: 'full'
    },
    {
        id: 'rootCauseAnalysis',
        name: 'rootCauseAnalysis',
        label: { en: 'Root Cause Analysis', hi: 'मूल कारण विश्लेषण' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Identify the root cause...', hi: 'मूल कारण पहचानें...' },
        required: false,
        groupId: 'investigation',
        order: 1,
        width: 'full'
    },
    {
        id: 'correctiveActionsList',
        name: 'correctiveActionsList',
        label: { en: 'Corrective Actions', hi: 'सुधारात्मक कार्रवाई' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add corrective action', hi: 'सुधारात्मक कार्रवाई जोड़ें' },
        required: false,
        groupId: 'corrective_actions',
        order: 1,
        width: 'full'
    },
    {
        id: 'preventiveMeasures',
        name: 'preventiveMeasures',
        label: { en: 'Preventive Measures', hi: 'निवारक उपाय' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add preventive measure', hi: 'निवारक उपाय जोड़ें' },
        required: false,
        groupId: 'corrective_actions',
        order: 2,
        width: 'full'
    }
];

/**
 * Incident Report field groups
 */
export const INCIDENT_REPORT_FIELD_GROUPS: FieldGroup[] = [
    {
        id: 'incident_identification',
        name: 'Incident Identification',
        label: { en: 'Incident Identification', hi: 'घटना पहचान' },
        collapsible: true,
        defaultExpanded: true,
        order: 13,
        fields: ['incidentNumber', 'incidentType', 'incidentSeverity']
    },
    {
        id: 'incident_datetime',
        name: 'Date & Time',
        label: { en: 'Date & Time', hi: 'दिनांक और समय' },
        collapsible: true,
        defaultExpanded: true,
        order: 14,
        fields: ['incidentDate', 'incidentTime']
    },
    {
        id: 'incident_location',
        name: 'Location',
        label: { en: 'Location', hi: 'स्थान' },
        collapsible: true,
        defaultExpanded: true,
        order: 15,
        fields: ['incidentLocation']
    },
    {
        id: 'incident_details',
        name: 'Incident Details',
        label: { en: 'Incident Details', hi: 'घटना विवरण' },
        collapsible: true,
        defaultExpanded: true,
        order: 16,
        fields: ['incidentDescription']
    },
    {
        id: 'immediate_response',
        name: 'Immediate Response',
        label: { en: 'Immediate Response', hi: 'तत्काल प्रतिक्रिया' },
        collapsible: true,
        defaultExpanded: true,
        order: 17,
        fields: ['immediateActionsTaken']
    },
    {
        id: 'investigation',
        name: 'Investigation',
        label: { en: 'Investigation', hi: 'जांच' },
        collapsible: true,
        defaultExpanded: false,
        order: 18,
        fields: ['rootCauseAnalysis']
    },
    {
        id: 'corrective_actions',
        name: 'Corrective Actions',
        label: { en: 'Corrective & Preventive Actions', hi: 'सुधारात्मक और निवारक कार्रवाई' },
        collapsible: true,
        defaultExpanded: true,
        order: 19,
        fields: ['correctiveActionsList', 'preventiveMeasures']
    }
];

/**
 * Meeting Report specific fields
 */
export const MEETING_REPORT_FIELDS: FieldConfig[] = [
    {
        id: 'meetingTitle',
        name: 'meetingTitle',
        label: { en: 'Meeting Title', hi: 'बैठक शीर्षक' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Enter meeting title', hi: 'बैठक का शीर्षक दर्ज करें' },
        required: true,
        validation: { minLength: 5, maxLength: 200 },
        groupId: 'meeting_info',
        order: 1,
        width: 'two-thirds'
    },
    {
        id: 'meetingType',
        name: 'meetingType',
        label: { en: 'Meeting Type', hi: 'बैठक प्रकार' },
        type: FieldInputType.SELECT,
        required: true,
        options: [
            { value: MeetingType.BOARD_MEETING, label: { en: 'Board Meeting', hi: 'बोर्ड बैठक' } },
            { value: MeetingType.TEAM_MEETING, label: { en: 'Team Meeting', hi: 'टीम बैठक' } },
            { value: MeetingType.CLIENT_MEETING, label: { en: 'Client Meeting', hi: 'क्लाइंट बैठक' } },
            { value: MeetingType.PROJECT_KICKOFF, label: { en: 'Project Kickoff', hi: 'परियोजना किकऑफ' } },
            { value: MeetingType.REVIEW_MEETING, label: { en: 'Review Meeting', hi: 'समीक्षा बैठक' } },
            { value: MeetingType.STANDUP, label: { en: 'Daily Standup', hi: 'दैनिक स्टैंडअप' } },
            { value: MeetingType.TRAINING, label: { en: 'Training', hi: 'प्रशिक्षण' } },
            { value: MeetingType.OTHER, label: { en: 'Other', hi: 'अन्य' } }
        ],
        groupId: 'meeting_info',
        order: 2,
        width: 'third'
    },
    {
        id: 'meetingDate',
        name: 'meetingDate',
        label: { en: 'Meeting Date', hi: 'बैठक तिथि' },
        type: FieldInputType.DATE,
        required: true,
        groupId: 'meeting_schedule',
        order: 1,
        width: 'quarter'
    },
    {
        id: 'meetingStartTime',
        name: 'meetingStartTime',
        label: { en: 'Start Time', hi: 'आरंभ समय' },
        type: FieldInputType.TIME,
        required: true,
        groupId: 'meeting_schedule',
        order: 2,
        width: 'quarter'
    },
    {
        id: 'meetingEndTime',
        name: 'meetingEndTime',
        label: { en: 'End Time', hi: 'समाप्ति समय' },
        type: FieldInputType.TIME,
        required: true,
        groupId: 'meeting_schedule',
        order: 3,
        width: 'quarter'
    },
    {
        id: 'meetingMode',
        name: 'meetingMode',
        label: { en: 'Mode', hi: 'मोड' },
        type: FieldInputType.SELECT,
        required: true,
        options: [
            { value: 'in_person', label: { en: 'In Person', hi: 'व्यक्तिगत' } },
            { value: 'virtual', label: { en: 'Virtual', hi: 'वर्चुअल' } },
            { value: 'hybrid', label: { en: 'Hybrid', hi: 'हाइब्रिड' } }
        ],
        groupId: 'meeting_schedule',
        order: 4,
        width: 'quarter'
    },
    {
        id: 'meetingVenue',
        name: 'meetingVenue',
        label: { en: 'Venue/Platform', hi: 'स्थान/प्लेटफॉर्म' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Conference Room / Google Meet', hi: 'कॉन्फ्रेंस रूम / Google Meet' },
        required: true,
        groupId: 'meeting_schedule',
        order: 5,
        width: 'half'
    },
    {
        id: 'chairpersonName',
        name: 'chairpersonName',
        label: { en: 'Chairperson', hi: 'अध्यक्ष' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Chairperson name', hi: 'अध्यक्ष का नाम' },
        required: true,
        groupId: 'participants',
        order: 1,
        width: 'half'
    },
    {
        id: 'secretaryName',
        name: 'secretaryName',
        label: { en: 'Secretary', hi: 'सचिव' },
        type: FieldInputType.TEXT,
        placeholder: { en: 'Secretary name', hi: 'सचिव का नाम' },
        required: false,
        groupId: 'participants',
        order: 2,
        width: 'half'
    },
    {
        id: 'attendeesList',
        name: 'attendeesList',
        label: { en: 'Attendees', hi: 'उपस्थित सदस्य' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add attendee', hi: 'उपस्थित सदस्य जोड़ें' },
        required: true,
        groupId: 'participants',
        order: 3,
        width: 'full'
    },
    {
        id: 'agendaItems',
        name: 'agendaItems',
        label: { en: 'Agenda Items', hi: 'एजेंडा आइटम' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add agenda item', hi: 'एजेंडा आइटम जोड़ें' },
        required: true,
        groupId: 'agenda_section',
        order: 1,
        width: 'full'
    },
    {
        id: 'meetingMinutes',
        name: 'meetingMinutes',
        label: { en: 'Minutes of Meeting', hi: 'बैठक कार्यवृत्त' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Document the meeting proceedings...', hi: 'बैठक की कार्यवाही दर्ज करें...' },
        required: true,
        validation: { minLength: 100, maxLength: 50000 },
        groupId: 'minutes_section',
        order: 1,
        width: 'full'
    },
    {
        id: 'decisionsMade',
        name: 'decisionsMade',
        label: { en: 'Decisions Made', hi: 'लिए गए निर्णय' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add decision', hi: 'निर्णय जोड़ें' },
        required: false,
        groupId: 'decisions_section',
        order: 1,
        width: 'full'
    },
    {
        id: 'meetingActionItems',
        name: 'meetingActionItems',
        label: { en: 'Action Items', hi: 'कार्य आइटम' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add action item', hi: 'कार्य आइटम जोड़ें' },
        required: false,
        groupId: 'action_items_section',
        order: 1,
        width: 'full'
    },
    {
        id: 'nextMeetingDate',
        name: 'nextMeetingDate',
        label: { en: 'Next Meeting Date', hi: 'अगली बैठक तिथि' },
        type: FieldInputType.DATE,
        required: false,
        groupId: 'next_meeting',
        order: 1,
        width: 'third'
    },
    {
        id: 'adjournmentTime',
        name: 'adjournmentTime',
        label: { en: 'Adjournment Time', hi: 'स्थगन समय' },
        type: FieldInputType.TIME,
        required: false,
        groupId: 'closing_section',
        order: 1,
        width: 'third'
    }
];

/**
 * Meeting Report field groups
 */
export const MEETING_REPORT_FIELD_GROUPS: FieldGroup[] = [
    {
        id: 'meeting_info',
        name: 'Meeting Information',
        label: { en: 'Meeting Information', hi: 'बैठक जानकारी' },
        collapsible: true,
        defaultExpanded: true,
        order: 13,
        fields: ['meetingTitle', 'meetingType']
    },
    {
        id: 'meeting_schedule',
        name: 'Schedule',
        label: { en: 'Schedule & Venue', hi: 'अनुसूची और स्थान' },
        collapsible: true,
        defaultExpanded: true,
        order: 14,
        fields: ['meetingDate', 'meetingStartTime', 'meetingEndTime', 'meetingMode', 'meetingVenue']
    },
    {
        id: 'participants',
        name: 'Participants',
        label: { en: 'Participants', hi: 'प्रतिभागी' },
        collapsible: true,
        defaultExpanded: true,
        order: 15,
        fields: ['chairpersonName', 'secretaryName', 'attendeesList']
    },
    {
        id: 'agenda_section',
        name: 'Agenda',
        label: { en: 'Agenda', hi: 'एजेंडा' },
        collapsible: true,
        defaultExpanded: true,
        order: 16,
        fields: ['agendaItems']
    },
    {
        id: 'minutes_section',
        name: 'Minutes',
        label: { en: 'Minutes of Meeting', hi: 'बैठक कार्यवृत्त' },
        collapsible: true,
        defaultExpanded: true,
        order: 17,
        fields: ['meetingMinutes']
    },
    {
        id: 'decisions_section',
        name: 'Decisions',
        label: { en: 'Decisions', hi: 'निर्णय' },
        collapsible: true,
        defaultExpanded: true,
        order: 18,
        fields: ['decisionsMade']
    },
    {
        id: 'action_items_section',
        name: 'Action Items',
        label: { en: 'Action Items', hi: 'कार्य आइटम' },
        collapsible: true,
        defaultExpanded: true,
        order: 19,
        fields: ['meetingActionItems']
    },
    {
        id: 'next_meeting',
        name: 'Next Meeting',
        label: { en: 'Next Meeting', hi: 'अगली बैठक' },
        collapsible: true,
        defaultExpanded: false,
        order: 20,
        fields: ['nextMeetingDate']
    },
    {
        id: 'closing_section',
        name: 'Closing',
        label: { en: 'Closing', hi: 'समापन' },
        collapsible: true,
        defaultExpanded: false,
        order: 21,
        fields: ['adjournmentTime']
    }
];

/**
 * Analysis Report specific fields
 */
export const ANALYSIS_REPORT_FIELDS: FieldConfig[] = [
    {
        id: 'analysisType',
        name: 'analysisType',
        label: { en: 'Analysis Type', hi: 'विश्लेषण प्रकार' },
        type: FieldInputType.SELECT,
        required: true,
        options: [
            { value: AnalysisType.SWOT, label: { en: 'SWOT Analysis', hi: 'स्वॉट विश्लेषण' } },
            { value: AnalysisType.MARKET, label: { en: 'Market Analysis', hi: 'बाजार विश्लेषण' } },
            { value: AnalysisType.COMPETITOR, label: { en: 'Competitor Analysis', hi: 'प्रतिस्पर्धी विश्लेषण' } },
            { value: AnalysisType.GAP, label: { en: 'Gap Analysis', hi: 'अंतर विश्लेषण' } },
            { value: AnalysisType.ROOT_CAUSE, label: { en: 'Root Cause Analysis', hi: 'मूल कारण विश्लेषण' } },
            { value: AnalysisType.COST_BENEFIT, label: { en: 'Cost-Benefit Analysis', hi: 'लागत-लाभ विश्लेषण' } },
            { value: AnalysisType.RISK, label: { en: 'Risk Analysis', hi: 'जोखिम विश्लेषण' } },
            { value: AnalysisType.FEASIBILITY, label: { en: 'Feasibility Study', hi: 'व्यवहार्यता अध्ययन' } },
            { value: AnalysisType.PERFORMANCE, label: { en: 'Performance Analysis', hi: 'प्रदर्शन विश्लेषण' } },
            { value: AnalysisType.DATA, label: { en: 'Data Analysis', hi: 'डेटा विश्लेषण' } }
        ],
        groupId: 'analysis_info',
        order: 1,
        width: 'half'
    },
    {
        id: 'analysisObjective',
        name: 'analysisObjective',
        label: { en: 'Analysis Objective', hi: 'विश्लेषण उद्देश्य' },
        type: FieldInputType.TEXTAREA,
        placeholder: { en: 'What is the objective?', hi: 'उद्देश्य क्या है?' },
        required: true,
        validation: { minLength: 20, maxLength: 1000 },
        groupId: 'analysis_info',
        order: 2,
        width: 'full'
    },
    {
        id: 'dataSources',
        name: 'dataSources',
        label: { en: 'Data Sources', hi: 'डेटा स्रोत' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add data source', hi: 'डेटा स्रोत जोड़ें' },
        required: true,
        groupId: 'analysis_info',
        order: 3,
        width: 'full'
    },
    {
        id: 'strengths',
        name: 'strengths',
        label: { en: 'Strengths', hi: 'शक्तियां' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add strength', hi: 'शक्ति जोड़ें' },
        required: false,
        conditionalDisplay: [{ field: 'analysisType', operator: 'equals', value: AnalysisType.SWOT }],
        groupId: 'swot_section',
        order: 1,
        width: 'half'
    },
    {
        id: 'weaknesses',
        name: 'weaknesses',
        label: { en: 'Weaknesses', hi: 'कमजोरियां' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add weakness', hi: 'कमजोरी जोड़ें' },
        required: false,
        conditionalDisplay: [{ field: 'analysisType', operator: 'equals', value: AnalysisType.SWOT }],
        groupId: 'swot_section',
        order: 2,
        width: 'half'
    },
    {
        id: 'opportunities',
        name: 'opportunities',
        label: { en: 'Opportunities', hi: 'अवसर' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add opportunity', hi: 'अवसर जोड़ें' },
        required: false,
        conditionalDisplay: [{ field: 'analysisType', operator: 'equals', value: AnalysisType.SWOT }],
        groupId: 'swot_section',
        order: 3,
        width: 'half'
    },
    {
        id: 'threats',
        name: 'threats',
        label: { en: 'Threats', hi: 'खतरे' },
        type: FieldInputType.REPEATER,
        placeholder: { en: 'Add threat', hi: 'खतरा जोड़ें' },
        required: false,
        conditionalDisplay: [{ field: 'analysisType', operator: 'equals', value: AnalysisType.SWOT }],
        groupId: 'swot_section',
        order: 4,
        width: 'half'
    },
    {
        id: 'keyInsights',
        name: 'keyInsights',
        label: { en: 'Key Insights', hi: 'प्रमुख अंतर्दृष्टि' },
        type: FieldInputType.RICH_TEXT,
        placeholder: { en: 'Document key insights...', hi: 'प्रमुख अंतर्दृष्टि दर्ज करें...' },
        required: true,
        validation: { minLength: 100, maxLength: 10000 },
        groupId: 'insights_section',
        order: 1,
        width: 'full'
    }
];

/**
 * Analysis Report field groups
 */
export const ANALYSIS_REPORT_FIELD_GROUPS: FieldGroup[] = [
    {
        id: 'analysis_info',
        name: 'Analysis Information',
        label: { en: 'Analysis Information', hi: 'विश्लेषण जानकारी' },
        collapsible: true,
        defaultExpanded: true,
        order: 13,
        fields: ['analysisType', 'analysisObjective', 'dataSources']
    },
    {
        id: 'swot_section',
        name: 'SWOT Analysis',
        label: { en: 'SWOT Analysis', hi: 'स्वॉट विश्लेषण' },
        collapsible: true,
        defaultExpanded: true,
        order: 14,
        fields: ['strengths', 'weaknesses', 'opportunities', 'threats']
    },
    {
        id: 'insights_section',
        name: 'Key Insights',
        label: { en: 'Key Insights', hi: 'प्रमुख अंतर्दृष्टि' },
        collapsible: true,
        defaultExpanded: true,
        order: 15,
        fields: ['keyInsights']
    }
];

// ============================================================================
// SECTION 16: TABLE CONFIGURATIONS
// ============================================================================

/**
 * KPI Table configuration
 */
export const KPI_TABLE_CONFIG: TableConfig = {
    id: 'kpiTable',
    label: { en: 'Key Performance Indicators', hi: 'प्रमुख प्रदर्शन संकेतक' },
    columns: [
        { id: 'name', header: { en: 'KPI Name', hi: 'KPI नाम' }, type: FieldInputType.TEXT, width: '25%', required: true },
        { id: 'currentValue', header: { en: 'Current', hi: 'वर्तमान' }, type: FieldInputType.NUMBER, width: '15%', align: 'right' },
        { id: 'targetValue', header: { en: 'Target', hi: 'लक्ष्य' }, type: FieldInputType.NUMBER, width: '15%', align: 'right' },
        { id: 'previousValue', header: { en: 'Previous', hi: 'पिछला' }, type: FieldInputType.NUMBER, width: '15%', align: 'right' },
        { id: 'unit', header: { en: 'Unit', hi: 'इकाई' }, type: FieldInputType.TEXT, width: '10%' },
        { id: 'status', header: { en: 'Status', hi: 'स्थिति' }, type: FieldInputType.SELECT, width: '20%' }
    ],
    minRows: 1,
    maxRows: 20,
    allowAdd: true,
    allowDelete: true,
    showRowNumbers: true
};

/**
 * Milestone Table configuration
 */
export const MILESTONE_TABLE_CONFIG: TableConfig = {
    id: 'milestoneTable',
    label: { en: 'Project Milestones', hi: 'परियोजना मील के पत्थर' },
    columns: [
        { id: 'name', header: { en: 'Milestone', hi: 'मील का पत्थर' }, type: FieldInputType.TEXT, width: '30%', required: true },
        { id: 'plannedDate', header: { en: 'Planned Date', hi: 'नियोजित तिथि' }, type: FieldInputType.DATE, width: '20%' },
        { id: 'actualDate', header: { en: 'Actual Date', hi: 'वास्तविक तिथि' }, type: FieldInputType.DATE, width: '20%' },
        { id: 'status', header: { en: 'Status', hi: 'स्थिति' }, type: FieldInputType.SELECT, width: '15%' },
        { id: 'owner', header: { en: 'Owner', hi: 'मालिक' }, type: FieldInputType.TEXT, width: '15%' }
    ],
    minRows: 1,
    maxRows: 50,
    allowAdd: true,
    allowDelete: true,
    showRowNumbers: true
};

/**
 * Action Items Table configuration
 */
export const ACTION_ITEMS_TABLE_CONFIG: TableConfig = {
    id: 'actionItemsTable',
    label: { en: 'Action Items', hi: 'कार्य आइटम' },
    columns: [
        { id: 'description', header: { en: 'Action Item', hi: 'कार्य आइटम' }, type: FieldInputType.TEXT, width: '35%', required: true },
        { id: 'assignedTo', header: { en: 'Assigned To', hi: 'को सौंपा गया' }, type: FieldInputType.TEXT, width: '20%' },
        { id: 'deadline', header: { en: 'Deadline', hi: 'समय सीमा' }, type: FieldInputType.DATE, width: '15%' },
        { id: 'priority', header: { en: 'Priority', hi: 'प्राथमिकता' }, type: FieldInputType.SELECT, width: '15%' },
        { id: 'status', header: { en: 'Status', hi: 'स्थिति' }, type: FieldInputType.SELECT, width: '15%' }
    ],
    minRows: 0,
    maxRows: 30,
    allowAdd: true,
    allowDelete: true,
    showRowNumbers: true
};

/**
 * Risk Register Table configuration
 */
export const RISK_TABLE_CONFIG: TableConfig = {
    id: 'riskTable',
    label: { en: 'Risk Register', hi: 'जोखिम रजिस्टर' },
    columns: [
        { id: 'description', header: { en: 'Risk Description', hi: 'जोखिम विवरण' }, type: FieldInputType.TEXT, width: '30%', required: true },
        { id: 'probability', header: { en: 'Probability', hi: 'संभावना' }, type: FieldInputType.SELECT, width: '15%' },
        { id: 'impact', header: { en: 'Impact', hi: 'प्रभाव' }, type: FieldInputType.SELECT, width: '15%' },
        { id: 'mitigation', header: { en: 'Mitigation', hi: 'शमन' }, type: FieldInputType.TEXT, width: '25%' },
        { id: 'owner', header: { en: 'Owner', hi: 'मालिक' }, type: FieldInputType.TEXT, width: '15%' }
    ],
    minRows: 0,
    maxRows: 30,
    allowAdd: true,
    allowDelete: true,
    showRowNumbers: true
};

/**
 * Budget Table configuration
 */
export const BUDGET_TABLE_CONFIG: TableConfig = {
    id: 'budgetTable',
    label: { en: 'Budget Details', hi: 'बजट विवरण' },
    columns: [
        { id: 'category', header: { en: 'Category', hi: 'श्रेणी' }, type: FieldInputType.TEXT, width: '25%', required: true },
        { id: 'budgeted', header: { en: 'Budgeted', hi: 'बजट' }, type: FieldInputType.CURRENCY, width: '20%', align: 'right' },
        { id: 'actual', header: { en: 'Actual', hi: 'वास्तविक' }, type: FieldInputType.CURRENCY, width: '20%', align: 'right' },
        { id: 'variance', header: { en: 'Variance', hi: 'विचलन' }, type: FieldInputType.CURRENCY, width: '20%', align: 'right' },
        { id: 'notes', header: { en: 'Notes', hi: 'नोट्स' }, type: FieldInputType.TEXT, width: '15%' }
    ],
    minRows: 1,
    maxRows: 30,
    allowAdd: true,
    allowDelete: true,
    showRowNumbers: true,
    showTotals: true,
    totalColumns: ['budgeted', 'actual', 'variance']
};

/**
 * Attendees Table configuration
 */
export const ATTENDEES_TABLE_CONFIG: TableConfig = {
    id: 'attendeesTable',
    label: { en: 'Attendees', hi: 'उपस्थित सदस्य' },
    columns: [
        { id: 'name', header: { en: 'Name', hi: 'नाम' }, type: FieldInputType.TEXT, width: '30%', required: true },
        { id: 'designation', header: { en: 'Designation', hi: 'पदनाम' }, type: FieldInputType.TEXT, width: '25%' },
        { id: 'department', header: { en: 'Department', hi: 'विभाग' }, type: FieldInputType.TEXT, width: '20%' },
        { id: 'role', header: { en: 'Role', hi: 'भूमिका' }, type: FieldInputType.SELECT, width: '15%' },
        { id: 'attendance', header: { en: 'Attendance', hi: 'उपस्थिति' }, type: FieldInputType.SELECT, width: '10%' }
    ],
    minRows: 2,
    maxRows: 100,
    allowAdd: true,
    allowDelete: true,
    showRowNumbers: true
};

// ============================================================================
// SECTION 17: SAMPLE DATA
// ============================================================================

/**
 * Sample organization data
 */
export const SAMPLE_ORGANIZATION: OrganizationInfo = {
    name: 'Soriva Technologies Pvt. Ltd.',
    nameHindi: 'सोरिवा टेक्नोलॉजीज प्राइवेट लिमिटेड',
    logo: '/assets/logo.png',
    tagline: 'Innovating Tomorrow',
    registrationNumber: 'U72200PB2024PTC000001',
    gstin: '03AABCS1234A1Z5',
    pan: 'AABCS1234A',
    cin: 'U72200PB2024PTC000001',
    address: {
        line1: '123, Tech Park',
        line2: 'Sector 82',
        city: 'Mohali',
        state: 'Punjab',
        pincode: '160055',
        country: 'India'
    },
    contact: {
        phone: '+91-172-4567890',
        mobile: '+91-98765-43210',
        email: 'info@soriva.in',
        website: 'https://soriva.in'
    },
    department: 'Technology',
    branch: 'Head Office'
};

/**
 * Sample person data
 */
export const SAMPLE_PERSON: PersonInfo = {
    name: 'Aman Kumar',
    designation: 'Chief Technology Officer',
    department: 'Technology',
    employeeId: 'EMP001',
    email: 'aman@soriva.in',
    phone: '+91-98765-43210'
};

/**
 * Sample Business Report data
 */
export const SAMPLE_BUSINESS_REPORT: Partial<BusinessReportData> = {
    reportId: 'RPT-BUS-2025-001',
    reportNumber: 'BUS-2025-001',
    reportType: ReportType.BUSINESS,
    reportTitle: 'Q4 2024 Business Performance Report',
    version: '1.0',
    status: ReportStatus.APPROVED,
    confidentiality: ConfidentialityLevel.CONFIDENTIAL,
    organization: SAMPLE_ORGANIZATION,
    reportDate: '2025-01-15',
    periodFrom: '2024-10-01',
    periodTo: '2024-12-31',
    preparedBy: SAMPLE_PERSON,
    executiveSummary: 'This report presents the business performance analysis for Q4 2024. The company achieved significant growth across all key metrics.',
    businessOverview: {
        description: 'Soriva Technologies is a leading technology company specializing in AI-powered solutions.',
        vision: 'To be the most trusted AI partner for businesses worldwide.',
        mission: 'Democratizing AI for every Indian business.',
        keyHighlights: [
            'Revenue grew by 45% YoY',
            'Launched 3 new products',
            'Expanded to 5 new cities'
        ]
    },
    kpis: [
        { id: '1', name: 'Revenue', currentValue: 50000000, targetValue: 45000000, previousValue: 34500000, unit: '₹', trend: 'up', status: 'exceeded' },
        { id: '2', name: 'Active Users', currentValue: 125000, targetValue: 100000, previousValue: 85000, unit: 'users', trend: 'up', status: 'exceeded' },
        { id: '3', name: 'Customer Satisfaction', currentValue: 4.5, targetValue: 4.0, previousValue: 4.2, unit: '/5', trend: 'up', status: 'on_track' }
    ],
    financialSummary: {
        revenue: 50000000,
        previousRevenue: 34500000,
        expenses: 35000000,
        profit: 15000000,
        profitMargin: 30,
        growthRate: 45,
        currency: CurrencyCode.INR
    }
};

/**
 * Sample Project Report data
 */
export const SAMPLE_PROJECT_REPORT: Partial<ProjectReportData> = {
    reportId: 'RPT-PRJ-2025-001',
    reportNumber: 'PRJ-2025-001',
    reportType: ReportType.PROJECT,
    reportTitle: 'Soriva V2 Development - Monthly Progress Report',
    version: '1.0',
    status: ReportStatus.PUBLISHED,
    confidentiality: ConfidentialityLevel.INTERNAL,
    organization: SAMPLE_ORGANIZATION,
    reportDate: '2025-01-15',
    periodFrom: '2024-12-01',
    periodTo: '2024-12-31',
    preparedBy: SAMPLE_PERSON,
    projectInfo: {
        name: 'Soriva V2 Platform Development',
        code: 'PRJ-001',
        description: 'Complete rebuild of Soriva platform with enhanced AI capabilities.',
        manager: SAMPLE_PERSON,
        status: ProjectStatus.IN_PROGRESS,
        phase: 'Development Phase 2',
        priority: PriorityLevel.HIGH,
        startDate: '2024-06-01',
        endDate: '2025-03-31'
    },
    progress: {
        overall: 65,
        schedule: 70,
        budget: 58,
        quality: 85
    },
    milestones: [
        { id: '1', name: 'Requirements Complete', plannedDate: '2024-07-15', actualDate: '2024-07-12', status: 'completed' },
        { id: '2', name: 'Design Approved', plannedDate: '2024-08-30', actualDate: '2024-09-05', status: 'completed' },
        { id: '3', name: 'Backend Development', plannedDate: '2024-12-31', status: 'in_progress', progress: 80 },
        { id: '4', name: 'Frontend Development', plannedDate: '2025-01-31', status: 'in_progress', progress: 50 }
    ],
    deliverables: [],
    budget: {
        allocated: 10000000,
        spent: 5800000,
        remaining: 4200000,
        forecast: 9500000,
        variance: 500000,
        variancePercent: 5,
        currency: CurrencyCode.INR
    },
    risks: [],
    issues: []
};

/**
 * Sample Meeting Report data
 */
export const SAMPLE_MEETING_REPORT: Partial<MeetingReportData> = {
    reportId: 'RPT-MTG-2025-001',
    reportNumber: 'MTG-2025-001',
    reportType: ReportType.MEETING,
    reportTitle: 'Weekly Team Sync - January Week 2',
    version: '1.0',
    status: ReportStatus.APPROVED,
    confidentiality: ConfidentialityLevel.INTERNAL,
    organization: SAMPLE_ORGANIZATION,
    reportDate: '2025-01-13',
    preparedBy: SAMPLE_PERSON,
    meetingInfo: {
        title: 'Weekly Development Team Sync',
        type: MeetingType.TEAM_MEETING,
        purpose: 'Weekly progress review and planning',
        date: '2025-01-13',
        startTime: '10:00',
        endTime: '11:30',
        duration: '1h 30m',
        venue: 'Google Meet',
        mode: 'virtual'
    },
    participants: {
        chairperson: SAMPLE_PERSON,
        secretary: { name: 'Priya Sharma', designation: 'Project Coordinator' },
        attendees: [],
        absentees: [],
        totalInvited: 8,
        totalPresent: 7,
        totalAbsent: 1,
        quorumPresent: true
    },
    agenda: [
        { id: '1', number: '1', title: 'Sprint Review', type: 'review', status: 'discussed' },
        { id: '2', number: '2', title: 'Blockers Discussion', type: 'discussion', status: 'discussed' },
        { id: '3', number: '3', title: 'Next Sprint Planning', type: 'decision', status: 'discussed' }
    ],
    discussions: [],
    decisions: [],
    actionItems: [],
    closing: {
        adjournmentTime: '11:30'
    }
};

// ============================================================================
// SECTION 18: HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number, currency: CurrencyCode = CurrencyCode.INR): string {
    const symbol = CURRENCY_SYMBOLS[currency];
    const formatter = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `${symbol}${formatter.format(amount)}`;
}

/**
 * Format currency in Indian notation (lakhs, crores)
 */
export function formatIndianCurrency(amount: number, currency: CurrencyCode = CurrencyCode.INR): string {
    const symbol = CURRENCY_SYMBOLS[currency];
    
    if (amount >= 10000000) {
        return `${symbol}${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
        return `${symbol}${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
        return `${symbol}${(amount / 1000).toFixed(2)} K`;
    }
    
    return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format date in Indian format
 */
export function formatDate(dateStr: string, format: 'short' | 'long' | 'full' = 'short'): string {
    const date = new Date(dateStr);
    
    let options: Intl.DateTimeFormatOptions;
    
    switch (format) {
        case 'short':
            options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            break;
        case 'long':
            options = { day: '2-digit', month: 'short', year: 'numeric' };
            break;
        case 'full':
            options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
            break;
        default:
            options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    }
    
    return date.toLocaleDateString('en-IN', options);
}

/**
 * Format date in Hindi
 */
export function formatDateHindi(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with Indian numbering system
 */
export function formatNumberIndian(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Get label by language
 */
export function getLabel(label: BilingualLabel, lang: 'en' | 'hi' = 'en'): string {
    return label[lang] || label.en;
}

/**
 * Generate report number
 */
export function generateReportNumber(type: ReportType, sequence: number): string {
    const prefix = {
        [ReportType.BUSINESS]: 'BUS',
        [ReportType.PROJECT]: 'PRJ',
        [ReportType.ANALYSIS]: 'ANL',
        [ReportType.FINANCIAL]: 'FIN',
        [ReportType.PROGRESS]: 'PRG',
        [ReportType.INCIDENT]: 'INC',
        [ReportType.MEETING]: 'MTG'
    }[type];
    
    const year = new Date().getFullYear();
    const seq = sequence.toString().padStart(3, '0');
    
    return `${prefix}-${year}-${seq}`;
}

/**
 * Calculate variance
 */
export function calculateVariance(actual: number, budget: number): { variance: number; variancePercent: number; status: 'under' | 'on_track' | 'over' } {
    const variance = budget - actual;
    const variancePercent = budget !== 0 ? (variance / budget) * 100 : 0;
    
    let status: 'under' | 'on_track' | 'over';
    if (variancePercent > 5) {
        status = 'under';
    } else if (variancePercent < -5) {
        status = 'over';
    } else {
        status = 'on_track';
    }
    
    return { variance, variancePercent, status };
}

/**
 * Calculate progress status
 */
export function calculateProgressStatus(progress: number, target: number = 100): 'on_track' | 'at_risk' | 'off_track' | 'exceeded' {
    const ratio = progress / target;
    
    if (ratio >= 1) return 'exceeded';
    if (ratio >= 0.9) return 'on_track';
    if (ratio >= 0.7) return 'at_risk';
    return 'off_track';
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        // General statuses
        'on_track': '#10B981',
        'at_risk': '#F59E0B',
        'off_track': '#EF4444',
        'exceeded': '#8B5CF6',
        'completed': '#10B981',
        'in_progress': '#3B82F6',
        'pending': '#6B7280',
        'blocked': '#EF4444',
        'delayed': '#F59E0B',
        
        // Health indicators
        'green': '#10B981',
        'yellow': '#F59E0B',
        'red': '#EF4444',
        'blue': '#3B82F6',
        
        // Priority
        'low': '#10B981',
        'medium': '#F59E0B',
        'high': '#EF4444',
        'critical': '#7C3AED',
        'urgent': '#DC2626'
    };
    
    return colors[status] || '#6B7280';
}

/**
 * Validate field value
 */
export function validateField(field: FieldConfig, value: any): { valid: boolean; message?: string } {
    if (field.required && (value === undefined || value === null || value === '')) {
        return { valid: false, message: `${getLabel(field.label)} is required` };
    }
    
    if (!value && !field.required) {
        return { valid: true };
    }
    
    const validation = field.validation;
    if (!validation) return { valid: true };
    
    // String validations
    if (typeof value === 'string') {
        if (validation.minLength && value.length < validation.minLength) {
            return { valid: false, message: `Minimum ${validation.minLength} characters required` };
        }
        if (validation.maxLength && value.length > validation.maxLength) {
            return { valid: false, message: `Maximum ${validation.maxLength} characters allowed` };
        }
        if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
            return { valid: false, message: validation.patternMessage ? getLabel(validation.patternMessage) : 'Invalid format' };
        }
        if (validation.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return { valid: false, message: 'Invalid email format' };
        }
        if (validation.phone && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value.replace(/\s/g, ''))) {
            return { valid: false, message: 'Invalid phone format' };
        }
        if (validation.url && !/^https?:\/\/.+/.test(value)) {
            return { valid: false, message: 'Invalid URL format' };
        }
    }
    
    // Number validations
    if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
            return { valid: false, message: `Minimum value is ${validation.min}` };
        }
        if (validation.max !== undefined && value > validation.max) {
            return { valid: false, message: `Maximum value is ${validation.max}` };
        }
    }
    
    return { valid: true };
}

/**
 * Get fields for report type
 */
export function getFieldsForReportType(reportType: ReportType): FieldConfig[] {
    const specificFields: Record<ReportType, FieldConfig[]> = {
        [ReportType.BUSINESS]: BUSINESS_REPORT_FIELDS,
        [ReportType.PROJECT]: PROJECT_REPORT_FIELDS,
        [ReportType.ANALYSIS]: ANALYSIS_REPORT_FIELDS,
        [ReportType.FINANCIAL]: FINANCIAL_REPORT_FIELDS,
        [ReportType.PROGRESS]: PROGRESS_REPORT_FIELDS,
        [ReportType.INCIDENT]: INCIDENT_REPORT_FIELDS,
        [ReportType.MEETING]: MEETING_REPORT_FIELDS
    };
    
    return [...COMMON_FIELDS, ...specificFields[reportType]];
}

/**
 * Get field groups for report type
 */
export function getFieldGroupsForReportType(reportType: ReportType): FieldGroup[] {
    const specificGroups: Record<ReportType, FieldGroup[]> = {
        [ReportType.BUSINESS]: BUSINESS_REPORT_FIELD_GROUPS,
        [ReportType.PROJECT]: PROJECT_REPORT_FIELD_GROUPS,
        [ReportType.ANALYSIS]: ANALYSIS_REPORT_FIELD_GROUPS,
        [ReportType.FINANCIAL]: FINANCIAL_REPORT_FIELD_GROUPS,
        [ReportType.PROGRESS]: PROGRESS_REPORT_FIELD_GROUPS,
        [ReportType.INCIDENT]: INCIDENT_REPORT_FIELD_GROUPS,
        [ReportType.MEETING]: MEETING_REPORT_FIELD_GROUPS
    };
    
    return [...COMMON_FIELD_GROUPS, ...specificGroups[reportType]].sort((a, b) => a.order - b.order);
}

/**
 * Export all configurations
 */
export const REPORT_CONFIGURATIONS = {
    types: ReportType,
    statuses: ReportStatus,
    priorities: PriorityLevel,
    frequencies: ReportFrequency,
    confidentiality: ConfidentialityLevel,
    currencies: CurrencyCode,
    
    labels: {
        common: COMMON_LABELS,
        reportType: REPORT_TYPE_LABELS,
        status: STATUS_LABELS,
        priority: PRIORITY_LABELS,
        projectStatus: PROJECT_STATUS_LABELS,
        incidentSeverity: INCIDENT_SEVERITY_LABELS,
        currency: CURRENCY_LABELS
    },
    
    fields: {
        common: COMMON_FIELDS,
        business: BUSINESS_REPORT_FIELDS,
        project: PROJECT_REPORT_FIELDS,
        analysis: ANALYSIS_REPORT_FIELDS,
        financial: FINANCIAL_REPORT_FIELDS,
        progress: PROGRESS_REPORT_FIELDS,
        incident: INCIDENT_REPORT_FIELDS,
        meeting: MEETING_REPORT_FIELDS
    },
    
    fieldGroups: {
        common: COMMON_FIELD_GROUPS,
        business: BUSINESS_REPORT_FIELD_GROUPS,
        project: PROJECT_REPORT_FIELD_GROUPS,
        analysis: ANALYSIS_REPORT_FIELD_GROUPS,
        financial: FINANCIAL_REPORT_FIELD_GROUPS,
        progress: PROGRESS_REPORT_FIELD_GROUPS,
        incident: INCIDENT_REPORT_FIELD_GROUPS,
        meeting: MEETING_REPORT_FIELD_GROUPS
    },
    
    tables: {
        kpi: KPI_TABLE_CONFIG,
        milestone: MILESTONE_TABLE_CONFIG,
        actionItems: ACTION_ITEMS_TABLE_CONFIG,
        risk: RISK_TABLE_CONFIG,
        budget: BUDGET_TABLE_CONFIG,
        attendees: ATTENDEES_TABLE_CONFIG
    },
    
    samples: {
        organization: SAMPLE_ORGANIZATION,
        person: SAMPLE_PERSON,
        businessReport: SAMPLE_BUSINESS_REPORT,
        projectReport: SAMPLE_PROJECT_REPORT,
        meetingReport: SAMPLE_MEETING_REPORT
    },
    
    helpers: {
        formatCurrency,
        formatIndianCurrency,
        formatDate,
        formatDateHindi,
        formatPercentage,
        formatNumberIndian,
        getLabel,
        generateReportNumber,
        calculateVariance,
        calculateProgressStatus,
        getStatusColor,
        validateField,
        getFieldsForReportType,
        getFieldGroupsForReportType
    }
};

// Default export
export default REPORT_CONFIGURATIONS;

// ============================================================================
// END OF REPORT FIELDS CONFIGURATION
// Total Lines: ~3100+
// ============================================================================