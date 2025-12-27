/**
 * SORIVA - Report Form Schema (Lean)
 * Synced with: report-fields.config.ts
 * Types: business, project, analysis, financial, progress, incident, meeting
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getOptionalSteps, getArraySteps } from './form-schema.helpers';

export enum ReportType {
  BUSINESS = 'business',
  PROJECT = 'project',
  ANALYSIS = 'analysis',
  FINANCIAL = 'financial',
  PROGRESS = 'progress',
  INCIDENT = 'incident',
  MEETING = 'meeting'
}

// Reusable field arrays
const F = {
  // Common fields
  meta: ['reportNumber', 'reportTitle', 'reportSubtitle', 'reportDate', 'reportStatus', 'confidentiality', 'version'],
  org: ['orgName', 'orgNameHindi', 'orgLogo', 'department', 'division', 'branch', 'address', 'gstin', 'pan'],
  period: ['periodFrom', 'periodTo', 'frequency', 'periodLabel'],
  author: ['preparedByName', 'preparedByDesignation', 'preparedByDepartment', 'preparedByEmail', 'preparedByPhone'],
  review: ['reviewedByName', 'reviewedByDesignation', 'reviewDate', 'approvedByName', 'approvedByDesignation', 'approvalDate'],
  summary: ['executiveSummary', 'keyHighlights'],
  intro: ['introduction', 'background', 'objectives', 'scope'],
  methodology: ['methodology', 'dataSource', 'tools', 'limitations'],
  findings: ['findings', 'analysis', 'observations'],
  conclusion: ['conclusion', 'recommendations', 'nextSteps', 'actionItems'],
  attachments: ['attachments', 'references', 'appendix'],
  signatures: ['preparedBySignature', 'reviewedBySignature', 'approvedBySignature'],
  
  // Business specific
  bizOverview: ['businessDescription', 'visionStatement', 'missionStatement'],
  bizFinancial: ['totalRevenue', 'totalExpenses', 'netProfit', 'growthRate'],
  bizMarket: ['marketSize', 'marketShare', 'competitors', 'trends'],
  bizOutlook: ['shortTermOutlook', 'longTermOutlook', 'forecasts'],
  bizKpi: ['kpis.name', 'kpis.currentValue', 'kpis.targetValue', 'kpis.previousValue', 'kpis.unit', 'kpis.status'],
  bizRisks: ['risks.title', 'risks.description', 'risks.probability', 'risks.impact', 'risks.mitigation', 'risks.owner'],
  
  // Project specific
  projInfo: ['projectName', 'projectCode', 'projectDescription', 'projectStatus', 'projectPhase', 'projectManager'],
  projTimeline: ['projectStartDate', 'projectEndDate', 'actualStartDate', 'forecastEndDate'],
  projProgress: ['overallProgress', 'scheduleProgress', 'budgetProgress', 'qualityProgress'],
  projBudget: ['budgetAllocated', 'budgetSpent', 'budgetRemaining', 'budgetVariance'],
  projMilestones: ['milestones.name', 'milestones.plannedDate', 'milestones.actualDate', 'milestones.status', 'milestones.owner'],
  projDeliverables: ['deliverables.name', 'deliverables.dueDate', 'deliverables.status', 'deliverables.progress'],
  projRisks: ['risks.title', 'risks.probability', 'risks.impact', 'risks.mitigation', 'risks.status'],
  projIssues: ['issues.title', 'issues.priority', 'issues.status', 'issues.assignedTo', 'issues.dueDate'],
  projResources: ['resources.name', 'resources.type', 'resources.allocation', 'resources.cost'],
  
  // Analysis specific
  analysisInfo: ['analysisType', 'analysisObjective', 'dataSources', 'timeFrame', 'sampleSize'],
  swot: ['strengths', 'weaknesses', 'opportunities', 'threats'],
  analysisFindings: ['keyFindings.title', 'keyFindings.description', 'keyFindings.significance'],
  analysisTrends: ['trends.name', 'trends.direction', 'trends.magnitude', 'trends.description'],
  analysisInsights: ['keyInsights', 'implications', 'dataAnalysis'],
  
  // Financial specific
  finPeriod: ['financialYear', 'reportQuarter', 'financialReportType', 'currencyCode'],
  finIncome: ['revenue', 'costOfGoodsSold', 'grossProfit', 'operatingExpenses', 'operatingIncome', 'netIncome'],
  finBalance: ['assets.current', 'assets.nonCurrent', 'liabilities.current', 'liabilities.nonCurrent', 'equity'],
  finCashFlow: ['cashFlow.operating', 'cashFlow.investing', 'cashFlow.financing', 'netCashFlow'],
  finBudget: ['budgetItems.category', 'budgetItems.budgeted', 'budgetItems.actual', 'budgetItems.variance'],
  finRatios: ['ratios.name', 'ratios.value', 'ratios.benchmark', 'ratios.status'],
  finProfitability: ['grossProfit', 'operatingProfit', 'netProfitAmount', 'profitMargin'],
  
  // Progress specific
  progRef: ['referenceType', 'referenceName', 'referenceCode'],
  progStatus: ['healthIndicator', 'progressPercentage', 'statusSummary'],
  progTasks: ['totalTasks', 'completedTasks', 'inProgressTasks', 'blockedTasks', 'overdueTasks'],
  progTaskList: ['tasks.title', 'tasks.assignee', 'tasks.status', 'tasks.progress', 'tasks.dueDate'],
  progAchievements: ['keyAchievements', 'achievementsDetailed.description', 'achievementsDetailed.impact'],
  progChallenges: ['challengesFaced', 'blockers.title', 'blockers.impact', 'blockers.resolution'],
  progUpcoming: ['nextPeriodPriorities', 'upcomingTasks.title', 'upcomingTasks.plannedStart', 'upcomingTasks.assignee'],
  progMetrics: ['metrics.name', 'metrics.current', 'metrics.target', 'metrics.trend', 'metrics.status'],
  
  // Incident specific
  incidentId: ['incidentNumber', 'incidentType', 'incidentSeverity', 'incidentStatus'],
  incidentDateTime: ['incidentDate', 'incidentTime', 'discoveredDate', 'reportedDate'],
  incidentLocation: ['incidentSite', 'incidentBuilding', 'incidentArea', 'incidentLocation'],
  incidentPeople: ['reportedBy', 'affectedPersons.name', 'affectedPersons.injuryType', 'witnesses.name', 'witnesses.statement'],
  incidentDetails: ['incidentTitle', 'incidentDescription', 'circumstances', 'equipmentInvolved'],
  incidentInjuries: ['injuries.personName', 'injuries.injuryType', 'injuries.severity', 'injuries.treatment'],
  incidentDamages: ['damages.type', 'damages.description', 'damages.estimatedCost'],
  incidentResponse: ['immediateActionsTaken', 'emergencyServicesContacted', 'areaSecured'],
  incidentInvestigation: ['rootCauseAnalysis', 'contributingFactors', 'investigator', 'investigationStatus'],
  incidentCorrectiveActions: ['correctiveActions.description', 'correctiveActions.assignedTo', 'correctiveActions.targetDate', 'correctiveActions.status'],
  incidentPreventive: ['preventiveMeasures.description', 'preventiveMeasures.type', 'preventiveMeasures.status'],
  incidentClosure: ['closureDate', 'closedBy', 'lessonsLearned', 'effectivenessVerified'],
  
  // Meeting specific
  meetingInfo: ['meetingTitle', 'meetingType', 'meetingPurpose'],
  meetingSchedule: ['meetingDate', 'meetingStartTime', 'meetingEndTime', 'meetingMode', 'meetingVenue'],
  meetingParticipants: ['chairpersonName', 'secretaryName', 'attendeesList.name', 'attendeesList.designation', 'attendeesList.attendance'],
  meetingAgenda: ['agendaItems.number', 'agendaItems.title', 'agendaItems.presenter', 'agendaItems.type', 'agendaItems.status'],
  meetingPrevious: ['previousMeetingDate', 'minutesApproved', 'mattersArising.item', 'mattersArising.status', 'mattersArising.update'],
  meetingDiscussions: ['discussions.topic', 'discussions.summary', 'discussions.keyPoints'],
  meetingDecisions: ['decisionsMade.description', 'decisionsMade.outcome', 'decisionsMade.effectiveDate'],
  meetingActions: ['meetingActionItems.description', 'meetingActionItems.assignedTo', 'meetingActionItems.deadline', 'meetingActionItems.priority'],
  meetingNext: ['nextMeetingDate', 'nextMeetingVenue', 'tentativeAgenda'],
  meetingClosing: ['closingRemarks', 'adjournmentTime', 'adjournmentProposedBy']
};

export const REPORT_FORMS: Record<string, BaseFormSchema> = {
  [ReportType.BUSINESS]: {
    type: 'business', templateId: 'report-business', promptKeyPrefix: 'report.business', template: 'report-business.hbs',
    steps: [
      { id: 'meta', promptKey: 'report.business.step.meta', fields: F.meta },
      { id: 'organization', promptKey: 'report.business.step.organization', fields: F.org },
      { id: 'period', promptKey: 'report.business.step.period', fields: F.period },
      { id: 'author', promptKey: 'report.business.step.author', fields: F.author },
      { id: 'review', promptKey: 'report.business.step.review', fields: F.review, optional: true },
      { id: 'summary', promptKey: 'report.business.step.summary', fields: F.summary },
      { id: 'overview', promptKey: 'report.business.step.overview', fields: F.bizOverview },
      { id: 'financials', promptKey: 'report.business.step.financials', fields: F.bizFinancial },
      { id: 'kpis', promptKey: 'report.business.step.kpis', fields: F.bizKpi, isArray: true },
      { id: 'market', promptKey: 'report.business.step.market', fields: F.bizMarket, optional: true },
      { id: 'risks', promptKey: 'report.business.step.risks', fields: F.bizRisks, isArray: true, optional: true },
      { id: 'outlook', promptKey: 'report.business.step.outlook', fields: F.bizOutlook },
      { id: 'conclusion', promptKey: 'report.business.step.conclusion', fields: F.conclusion },
      { id: 'attachments', promptKey: 'report.business.step.attachments', fields: F.attachments, optional: true },
      { id: 'signatures', promptKey: 'report.business.step.signatures', fields: F.signatures, optional: true }
    ]
  },
  [ReportType.PROJECT]: {
    type: 'project', templateId: 'report-project', promptKeyPrefix: 'report.project', template: 'report-project.hbs',
    steps: [
      { id: 'meta', promptKey: 'report.project.step.meta', fields: F.meta },
      { id: 'organization', promptKey: 'report.project.step.organization', fields: F.org },
      { id: 'period', promptKey: 'report.project.step.period', fields: F.period },
      { id: 'author', promptKey: 'report.project.step.author', fields: F.author },
      { id: 'projectInfo', promptKey: 'report.project.step.projectInfo', fields: F.projInfo },
      { id: 'timeline', promptKey: 'report.project.step.timeline', fields: F.projTimeline },
      { id: 'summary', promptKey: 'report.project.step.summary', fields: F.summary },
      { id: 'progress', promptKey: 'report.project.step.progress', fields: F.projProgress },
      { id: 'milestones', promptKey: 'report.project.step.milestones', fields: F.projMilestones, isArray: true },
      { id: 'deliverables', promptKey: 'report.project.step.deliverables', fields: F.projDeliverables, isArray: true },
      { id: 'budget', promptKey: 'report.project.step.budget', fields: F.projBudget },
      { id: 'resources', promptKey: 'report.project.step.resources', fields: F.projResources, isArray: true, optional: true },
      { id: 'risks', promptKey: 'report.project.step.risks', fields: F.projRisks, isArray: true },
      { id: 'issues', promptKey: 'report.project.step.issues', fields: F.projIssues, isArray: true },
      { id: 'conclusion', promptKey: 'report.project.step.conclusion', fields: F.conclusion },
      { id: 'signatures', promptKey: 'report.project.step.signatures', fields: F.signatures, optional: true }
    ]
  },
  [ReportType.ANALYSIS]: {
    type: 'analysis', templateId: 'report-analysis', promptKeyPrefix: 'report.analysis', template: 'report-analysis.hbs',
    steps: [
      { id: 'meta', promptKey: 'report.analysis.step.meta', fields: F.meta },
      { id: 'organization', promptKey: 'report.analysis.step.organization', fields: F.org },
      { id: 'author', promptKey: 'report.analysis.step.author', fields: F.author },
      { id: 'review', promptKey: 'report.analysis.step.review', fields: F.review, optional: true },
      { id: 'summary', promptKey: 'report.analysis.step.summary', fields: F.summary },
      { id: 'analysisInfo', promptKey: 'report.analysis.step.analysisInfo', fields: F.analysisInfo },
      { id: 'intro', promptKey: 'report.analysis.step.intro', fields: F.intro },
      { id: 'methodology', promptKey: 'report.analysis.step.methodology', fields: F.methodology },
      { id: 'swot', promptKey: 'report.analysis.step.swot', fields: F.swot, optional: true, condition: "analysisType === 'swot'" },
      { id: 'findings', promptKey: 'report.analysis.step.findings', fields: F.analysisFindings, isArray: true },
      { id: 'trends', promptKey: 'report.analysis.step.trends', fields: F.analysisTrends, isArray: true, optional: true },
      { id: 'insights', promptKey: 'report.analysis.step.insights', fields: F.analysisInsights },
      { id: 'conclusion', promptKey: 'report.analysis.step.conclusion', fields: F.conclusion },
      { id: 'attachments', promptKey: 'report.analysis.step.attachments', fields: F.attachments, optional: true },
      { id: 'signatures', promptKey: 'report.analysis.step.signatures', fields: F.signatures, optional: true }
    ]
  },
  [ReportType.FINANCIAL]: {
    type: 'financial', templateId: 'report-financial', promptKeyPrefix: 'report.financial', template: 'report-financial.hbs',
    steps: [
      { id: 'meta', promptKey: 'report.financial.step.meta', fields: F.meta },
      { id: 'organization', promptKey: 'report.financial.step.organization', fields: F.org },
      { id: 'finPeriod', promptKey: 'report.financial.step.finPeriod', fields: F.finPeriod },
      { id: 'author', promptKey: 'report.financial.step.author', fields: F.author },
      { id: 'review', promptKey: 'report.financial.step.review', fields: F.review },
      { id: 'summary', promptKey: 'report.financial.step.summary', fields: F.summary },
      { id: 'profitability', promptKey: 'report.financial.step.profitability', fields: F.finProfitability },
      { id: 'income', promptKey: 'report.financial.step.income', fields: F.finIncome, optional: true, condition: "financialReportType === 'income_statement' || financialReportType === 'profit_loss'" },
      { id: 'balance', promptKey: 'report.financial.step.balance', fields: F.finBalance, optional: true, condition: "financialReportType === 'balance_sheet'" },
      { id: 'cashFlow', promptKey: 'report.financial.step.cashFlow', fields: F.finCashFlow, optional: true, condition: "financialReportType === 'cash_flow'" },
      { id: 'budget', promptKey: 'report.financial.step.budget', fields: F.finBudget, isArray: true, optional: true, condition: "financialReportType === 'budget_variance'" },
      { id: 'ratios', promptKey: 'report.financial.step.ratios', fields: F.finRatios, isArray: true, optional: true },
      { id: 'findings', promptKey: 'report.financial.step.findings', fields: F.findings },
      { id: 'conclusion', promptKey: 'report.financial.step.conclusion', fields: F.conclusion },
      { id: 'signatures', promptKey: 'report.financial.step.signatures', fields: F.signatures }
    ]
  },
  [ReportType.PROGRESS]: {
    type: 'progress', templateId: 'report-progress', promptKeyPrefix: 'report.progress', template: 'report-progress.hbs',
    steps: [
      { id: 'meta', promptKey: 'report.progress.step.meta', fields: F.meta },
      { id: 'organization', promptKey: 'report.progress.step.organization', fields: F.org },
      { id: 'period', promptKey: 'report.progress.step.period', fields: F.period },
      { id: 'author', promptKey: 'report.progress.step.author', fields: F.author },
      { id: 'reference', promptKey: 'report.progress.step.reference', fields: F.progRef },
      { id: 'status', promptKey: 'report.progress.step.status', fields: F.progStatus },
      { id: 'summary', promptKey: 'report.progress.step.summary', fields: F.summary },
      { id: 'taskSummary', promptKey: 'report.progress.step.taskSummary', fields: F.progTasks },
      { id: 'tasks', promptKey: 'report.progress.step.tasks', fields: F.progTaskList, isArray: true, optional: true },
      { id: 'metrics', promptKey: 'report.progress.step.metrics', fields: F.progMetrics, isArray: true, optional: true },
      { id: 'achievements', promptKey: 'report.progress.step.achievements', fields: F.progAchievements },
      { id: 'challenges', promptKey: 'report.progress.step.challenges', fields: F.progChallenges },
      { id: 'upcoming', promptKey: 'report.progress.step.upcoming', fields: F.progUpcoming },
      { id: 'conclusion', promptKey: 'report.progress.step.conclusion', fields: F.conclusion },
      { id: 'signatures', promptKey: 'report.progress.step.signatures', fields: F.signatures, optional: true }
    ]
  },
  [ReportType.INCIDENT]: {
    type: 'incident', templateId: 'report-incident', promptKeyPrefix: 'report.incident', template: 'report-incident.hbs',
    steps: [
      { id: 'meta', promptKey: 'report.incident.step.meta', fields: F.meta },
      { id: 'organization', promptKey: 'report.incident.step.organization', fields: F.org },
      { id: 'author', promptKey: 'report.incident.step.author', fields: F.author },
      { id: 'incidentId', promptKey: 'report.incident.step.incidentId', fields: F.incidentId },
      { id: 'dateTime', promptKey: 'report.incident.step.dateTime', fields: F.incidentDateTime },
      { id: 'location', promptKey: 'report.incident.step.location', fields: F.incidentLocation },
      { id: 'details', promptKey: 'report.incident.step.details', fields: F.incidentDetails },
      { id: 'people', promptKey: 'report.incident.step.people', fields: F.incidentPeople, isArray: true },
      { id: 'injuries', promptKey: 'report.incident.step.injuries', fields: F.incidentInjuries, isArray: true, optional: true },
      { id: 'damages', promptKey: 'report.incident.step.damages', fields: F.incidentDamages, isArray: true, optional: true },
      { id: 'response', promptKey: 'report.incident.step.response', fields: F.incidentResponse },
      { id: 'investigation', promptKey: 'report.incident.step.investigation', fields: F.incidentInvestigation, optional: true },
      { id: 'correctiveActions', promptKey: 'report.incident.step.correctiveActions', fields: F.incidentCorrectiveActions, isArray: true },
      { id: 'preventive', promptKey: 'report.incident.step.preventive', fields: F.incidentPreventive, isArray: true },
      { id: 'closure', promptKey: 'report.incident.step.closure', fields: F.incidentClosure, optional: true },
      { id: 'signatures', promptKey: 'report.incident.step.signatures', fields: F.signatures }
    ]
  },
  [ReportType.MEETING]: {
    type: 'meeting', templateId: 'report-meeting', promptKeyPrefix: 'report.meeting', template: 'report-meeting.hbs',
    steps: [
      { id: 'meta', promptKey: 'report.meeting.step.meta', fields: F.meta },
      { id: 'organization', promptKey: 'report.meeting.step.organization', fields: F.org },
      { id: 'author', promptKey: 'report.meeting.step.author', fields: F.author },
      { id: 'meetingInfo', promptKey: 'report.meeting.step.meetingInfo', fields: F.meetingInfo },
      { id: 'schedule', promptKey: 'report.meeting.step.schedule', fields: F.meetingSchedule },
      { id: 'participants', promptKey: 'report.meeting.step.participants', fields: F.meetingParticipants, isArray: true },
      { id: 'agenda', promptKey: 'report.meeting.step.agenda', fields: F.meetingAgenda, isArray: true },
      { id: 'previousMeeting', promptKey: 'report.meeting.step.previousMeeting', fields: F.meetingPrevious, isArray: true, optional: true },
      { id: 'discussions', promptKey: 'report.meeting.step.discussions', fields: F.meetingDiscussions, isArray: true },
      { id: 'decisions', promptKey: 'report.meeting.step.decisions', fields: F.meetingDecisions, isArray: true },
      { id: 'actionItems', promptKey: 'report.meeting.step.actionItems', fields: F.meetingActions, isArray: true },
      { id: 'nextMeeting', promptKey: 'report.meeting.step.nextMeeting', fields: F.meetingNext, optional: true },
      { id: 'closing', promptKey: 'report.meeting.step.closing', fields: F.meetingClosing },
      { id: 'signatures', promptKey: 'report.meeting.step.signatures', fields: F.signatures, optional: true }
    ]
  }
};

// Wrapper functions
export const getReportForm = (type: string) => getForm(REPORT_FORMS, type);
export const getReportStep = (type: string, stepId: string) => getStep(REPORT_FORMS, type, stepId);
export const getReportFields = (type: string) => getFields(REPORT_FORMS, type);
export const getReportRequiredSteps = (type: string) => getRequiredSteps(REPORT_FORMS, type);
export const getReportOptionalSteps = (type: string) => getOptionalSteps(REPORT_FORMS, type);
export const getReportArraySteps = (type: string) => getArraySteps(REPORT_FORMS, type);
export const getReportTypes = () => Object.keys(REPORT_FORMS);

// Auto-suggest report type
export const suggestReportType = (ctx: { 
  isBusiness?: boolean; isProject?: boolean; isAnalysis?: boolean; 
  isFinancial?: boolean; isProgress?: boolean; isIncident?: boolean; isMeeting?: boolean 
}): ReportType => {
  if (ctx.isBusiness) return ReportType.BUSINESS;
  if (ctx.isProject) return ReportType.PROJECT;
  if (ctx.isAnalysis) return ReportType.ANALYSIS;
  if (ctx.isFinancial) return ReportType.FINANCIAL;
  if (ctx.isProgress) return ReportType.PROGRESS;
  if (ctx.isIncident) return ReportType.INCIDENT;
  if (ctx.isMeeting) return ReportType.MEETING;
  return ReportType.BUSINESS;
};