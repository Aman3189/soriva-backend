/**
 * SORIVA - Assignment Form Schema (Lean)
 * Synced with: assignment-fields.config.ts
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getArraySteps } from './form-schema.helpers';

export enum AssignmentType {
  HOMEWORK = 'homework',
  LAB_REPORT = 'lab-report',
  CASE_STUDY = 'case-study',
  RESEARCH = 'research',
  WORKSHEET = 'worksheet',
  GROUP = 'group'
}

export const ASSIGNMENT_FORMS: Record<string, BaseFormSchema> = {
  [AssignmentType.HOMEWORK]: {
    type: 'homework', templateId: 'assignment-homework', promptKeyPrefix: 'assignment.homework', template: 'assignment-homework.hbs',
    steps: [
      { id: 'metadata', promptKey: 'assignment.homework.step.metadata', fields: ['title', 'subtitle', 'chapter', 'topic'] },
      { id: 'student', promptKey: 'assignment.homework.step.student', fields: ['studentName', 'rollNumber', 'class', 'section', 'semester'] },
      { id: 'course', promptKey: 'assignment.homework.step.course', fields: ['subject', 'subjectCode'] },
      { id: 'institution', promptKey: 'assignment.homework.step.institution', fields: ['institution', 'department'] },
      { id: 'instructor', promptKey: 'assignment.homework.step.instructor', fields: ['instructor', 'submittedTo'], optional: true },
      { id: 'dates', promptKey: 'assignment.homework.step.dates', fields: ['assignedDate', 'dueDate', 'submissionDate'] },
      { id: 'details', promptKey: 'assignment.homework.step.details', fields: ['assignmentNumber', 'totalMarks'] },
      { id: 'instructions', promptKey: 'assignment.homework.step.instructions', fields: ['instructions'], isArray: true, optional: true },
      { id: 'questions', promptKey: 'assignment.homework.step.questions', fields: ['questions.questionNumber', 'questions.questionText', 'questions.questionType', 'questions.marks', 'questions.answer', 'questions.workings'], isArray: true },
      { id: 'settings', promptKey: 'assignment.homework.step.settings', fields: ['accentColor', 'showMarks', 'showAnswers', 'showWorkings'], optional: true }
    ]
  },
  [AssignmentType.LAB_REPORT]: {
    type: 'lab-report', templateId: 'assignment-lab-report', promptKeyPrefix: 'assignment.labReport', template: 'assignment-lab-report.hbs',
    steps: [
      { id: 'metadata', promptKey: 'assignment.labReport.step.metadata', fields: ['title'] },
      { id: 'student', promptKey: 'assignment.labReport.step.student', fields: ['studentName', 'rollNumber', 'class', 'semester'] },
      { id: 'course', promptKey: 'assignment.labReport.step.course', fields: ['subject', 'subjectCode'] },
      { id: 'institution', promptKey: 'assignment.labReport.step.institution', fields: ['institution', 'department'] },
      { id: 'experiment', promptKey: 'assignment.labReport.step.experiment', fields: ['labReport.experimentNumber', 'labReport.experimentTitle', 'labReport.experimentDate'] },
      { id: 'aim', promptKey: 'assignment.labReport.step.aim', fields: ['labReport.aim', 'labReport.objective'] },
      { id: 'hypothesis', promptKey: 'assignment.labReport.step.hypothesis', fields: ['labReport.hypothesis'], optional: true },
      { id: 'apparatus', promptKey: 'assignment.labReport.step.apparatus', fields: ['labReport.apparatus', 'labReport.materials', 'labReport.chemicals'], isArray: true },
      { id: 'theory', promptKey: 'assignment.labReport.step.theory', fields: ['labReport.theory', 'labReport.principle'], optional: true },
      { id: 'procedure', promptKey: 'assignment.labReport.step.procedure', fields: ['labReport.procedure'], isArray: true },
      { id: 'observations', promptKey: 'assignment.labReport.step.observations', fields: ['labReport.observations.step', 'labReport.observations.observation', 'labReport.observations.inference'], isArray: true },
      { id: 'dataTable', promptKey: 'assignment.labReport.step.dataTable', fields: ['labReport.dataTable.title', 'labReport.dataTable.headers', 'labReport.dataTable.rows'], optional: true },
      { id: 'calculations', promptKey: 'assignment.labReport.step.calculations', fields: ['labReport.calculations', 'labReport.formulaUsed'], isArray: true, optional: true },
      { id: 'result', promptKey: 'assignment.labReport.step.result', fields: ['labReport.result', 'labReport.analysis'] },
      { id: 'conclusion', promptKey: 'assignment.labReport.step.conclusion', fields: ['labReport.conclusion'] },
      { id: 'precautions', promptKey: 'assignment.labReport.step.precautions', fields: ['labReport.precautions', 'labReport.sourcesOfError'], isArray: true }
    ]
  },
  [AssignmentType.CASE_STUDY]: {
    type: 'case-study', templateId: 'assignment-case-study', promptKeyPrefix: 'assignment.caseStudy', template: 'assignment-case-study.hbs',
    steps: [
      { id: 'metadata', promptKey: 'assignment.caseStudy.step.metadata', fields: ['title', 'subtitle'] },
      { id: 'student', promptKey: 'assignment.caseStudy.step.student', fields: ['studentName', 'rollNumber', 'class', 'semester'] },
      { id: 'course', promptKey: 'assignment.caseStudy.step.course', fields: ['subject', 'subjectCode'] },
      { id: 'institution', promptKey: 'assignment.caseStudy.step.institution', fields: ['institution', 'department'] },
      { id: 'caseInfo', promptKey: 'assignment.caseStudy.step.caseInfo', fields: ['caseStudy.companyName', 'caseStudy.industry', 'caseStudy.location', 'caseStudy.timePeriod'] },
      { id: 'executiveSummary', promptKey: 'assignment.caseStudy.step.executiveSummary', fields: ['caseStudy.executiveSummary'] },
      { id: 'background', promptKey: 'assignment.caseStudy.step.background', fields: ['caseStudy.background', 'caseStudy.context'] },
      { id: 'problem', promptKey: 'assignment.caseStudy.step.problem', fields: ['caseStudy.problemStatement', 'caseStudy.objectives', 'caseStudy.keyIssues'], isArray: true },
      { id: 'swot', promptKey: 'assignment.caseStudy.step.swot', fields: ['caseStudy.swotAnalysis.strengths', 'caseStudy.swotAnalysis.weaknesses', 'caseStudy.swotAnalysis.opportunities', 'caseStudy.swotAnalysis.threats'], isArray: true },
      { id: 'analysis', promptKey: 'assignment.caseStudy.step.analysis', fields: ['caseStudy.analysis'] },
      { id: 'alternatives', promptKey: 'assignment.caseStudy.step.alternatives', fields: ['caseStudy.alternatives.option', 'caseStudy.alternatives.pros', 'caseStudy.alternatives.cons', 'caseStudy.alternatives.feasibility'], isArray: true },
      { id: 'recommendation', promptKey: 'assignment.caseStudy.step.recommendation', fields: ['caseStudy.recommendation.chosen', 'caseStudy.recommendation.justification', 'caseStudy.recommendation.implementation'] },
      { id: 'conclusion', promptKey: 'assignment.caseStudy.step.conclusion', fields: ['caseStudy.conclusion', 'caseStudy.learnings'], isArray: true },
      { id: 'references', promptKey: 'assignment.caseStudy.step.references', fields: ['references', 'citationStyle'], isArray: true }
    ]
  },
  [AssignmentType.RESEARCH]: {
    type: 'research', templateId: 'assignment-research', promptKeyPrefix: 'assignment.research', template: 'assignment-research.hbs',
    steps: [
      { id: 'metadata', promptKey: 'assignment.research.step.metadata', fields: ['title', 'subtitle'] },
      { id: 'student', promptKey: 'assignment.research.step.student', fields: ['studentName', 'rollNumber', 'class', 'semester'] },
      { id: 'course', promptKey: 'assignment.research.step.course', fields: ['subject', 'subjectCode'] },
      { id: 'institution', promptKey: 'assignment.research.step.institution', fields: ['institution', 'department'] },
      { id: 'researchQuestion', promptKey: 'assignment.research.step.researchQuestion', fields: ['research.researchQuestion'] },
      { id: 'hypothesis', promptKey: 'assignment.research.step.hypothesis', fields: ['research.hypothesis'] },
      { id: 'introduction', promptKey: 'assignment.research.step.introduction', fields: ['introduction'] },
      { id: 'literatureReview', promptKey: 'assignment.research.step.literatureReview', fields: ['research.literatureReview.source', 'research.literatureReview.summary', 'research.literatureReview.relevance'], isArray: true },
      { id: 'methodology', promptKey: 'assignment.research.step.methodology', fields: ['research.methodology'] },
      { id: 'findings', promptKey: 'assignment.research.step.findings', fields: ['research.findings'], isArray: true },
      { id: 'dataAnalysis', promptKey: 'assignment.research.step.dataAnalysis', fields: ['research.dataAnalysis'] },
      { id: 'limitations', promptKey: 'assignment.research.step.limitations', fields: ['research.limitations'], isArray: true },
      { id: 'conclusion', promptKey: 'assignment.research.step.conclusion', fields: ['research.conclusion'] },
      { id: 'futureScope', promptKey: 'assignment.research.step.futureScope', fields: ['research.futureScope'], optional: true },
      { id: 'references', promptKey: 'assignment.research.step.references', fields: ['references', 'citationStyle'], isArray: true }
    ]
  },
  [AssignmentType.WORKSHEET]: {
    type: 'worksheet', templateId: 'assignment-worksheet', promptKeyPrefix: 'assignment.worksheet', template: 'assignment-worksheet.hbs',
    steps: [
      { id: 'metadata', promptKey: 'assignment.worksheet.step.metadata', fields: ['title', 'subtitle', 'chapter'] },
      { id: 'student', promptKey: 'assignment.worksheet.step.student', fields: ['studentName', 'rollNumber', 'class'] },
      { id: 'course', promptKey: 'assignment.worksheet.step.course', fields: ['subject'] },
      { id: 'institution', promptKey: 'assignment.worksheet.step.institution', fields: ['institution'] },
      { id: 'details', promptKey: 'assignment.worksheet.step.details', fields: ['totalMarks', 'duration'] },
      { id: 'instructions', promptKey: 'assignment.worksheet.step.instructions', fields: ['instructions'], isArray: true },
      { id: 'questions', promptKey: 'assignment.worksheet.step.questions', fields: ['questions.questionNumber', 'questions.questionText', 'questions.questionType', 'questions.marks', 'questions.subQuestions'], isArray: true },
      { id: 'settings', promptKey: 'assignment.worksheet.step.settings', fields: ['accentColor', 'showMarks'], optional: true }
    ]
  },
  [AssignmentType.GROUP]: {
    type: 'group', templateId: 'assignment-group', promptKeyPrefix: 'assignment.group', template: 'assignment-group.hbs',
    steps: [
      { id: 'metadata', promptKey: 'assignment.group.step.metadata', fields: ['title', 'subtitle'] },
      { id: 'course', promptKey: 'assignment.group.step.course', fields: ['class', 'semester', 'subject', 'subjectCode'] },
      { id: 'institution', promptKey: 'assignment.group.step.institution', fields: ['institution', 'department'] },
      { id: 'groupInfo', promptKey: 'assignment.group.step.groupInfo', fields: ['groupAssignment.groupName', 'groupAssignment.groupNumber', 'groupAssignment.teamLeader'] },
      { id: 'members', promptKey: 'assignment.group.step.members', fields: ['groupAssignment.members.name', 'groupAssignment.members.rollNumber', 'groupAssignment.members.role', 'groupAssignment.members.contribution', 'groupAssignment.members.contributionPercentage'], isArray: true },
      { id: 'taskDistribution', promptKey: 'assignment.group.step.taskDistribution', fields: ['groupAssignment.taskDistribution.task', 'groupAssignment.taskDistribution.assignedTo', 'groupAssignment.taskDistribution.status'], isArray: true },
      { id: 'meetingLog', promptKey: 'assignment.group.step.meetingLog', fields: ['groupAssignment.meetingLog.date', 'groupAssignment.meetingLog.attendees', 'groupAssignment.meetingLog.discussion'], isArray: true, optional: true },
      { id: 'introduction', promptKey: 'assignment.group.step.introduction', fields: ['introduction'] },
      { id: 'body', promptKey: 'assignment.group.step.body', fields: ['body', 'methodology', 'findings'], isArray: true },
      { id: 'conclusion', promptKey: 'assignment.group.step.conclusion', fields: ['conclusion'] },
      { id: 'references', promptKey: 'assignment.group.step.references', fields: ['references'], isArray: true }
    ]
  }
};

// Wrapper functions
export const getAssignmentForm = (type: string) => getForm(ASSIGNMENT_FORMS, type);
export const getAssignmentStep = (type: string, stepId: string) => getStep(ASSIGNMENT_FORMS, type, stepId);
export const getAssignmentFields = (type: string) => getFields(ASSIGNMENT_FORMS, type);
export const getAssignmentArraySteps = (type: string) => getArraySteps(ASSIGNMENT_FORMS, type);
export const getAssignmentTypes = () => Object.keys(ASSIGNMENT_FORMS);

// Auto-suggest assignment type
export const suggestAssignmentType = (ctx: { isLab?: boolean; isCaseStudy?: boolean; isResearch?: boolean; isGroup?: boolean; isPractice?: boolean; subject?: string }): AssignmentType => {
  if (ctx.isLab) return AssignmentType.LAB_REPORT;
  if (ctx.isCaseStudy) return AssignmentType.CASE_STUDY;
  if (ctx.isResearch) return AssignmentType.RESEARCH;
  if (ctx.isGroup) return AssignmentType.GROUP;
  if (ctx.isPractice) return AssignmentType.WORKSHEET;
  if (ctx.subject && ['physics', 'chemistry', 'biology'].some(s => ctx.subject!.toLowerCase().includes(s))) return AssignmentType.LAB_REPORT;
  if (ctx.subject && ['business', 'mba', 'management'].some(s => ctx.subject!.toLowerCase().includes(s))) return AssignmentType.CASE_STUDY;
  return AssignmentType.HOMEWORK;
};