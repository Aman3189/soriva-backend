/**
 * SORIVA - Project Report Form Schema (Lean)
 * Synced with: project-report-fields.config.ts
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getOptionalSteps, getArraySteps } from './form-schema.helpers';

export enum ProjectReportType {
  ACADEMIC = 'academic',
  TECHNICAL = 'technical',
  RESEARCH = 'research',
  INTERNSHIP = 'internship',
  INDUSTRIAL = 'industrial',
  CAPSTONE = 'capstone'
}

// Reusable field arrays
const F = {
  meta: ['templateType', 'projectTitle', 'projectSubtitle', 'projectType', 'projectStatus', 'projectDomain'],
  institution: ['institution', 'institutionLogo', 'university', 'department', 'course', 'courseCode', 'semester', 'academicYear', 'batch'],
  student: ['studentName', 'rollNumber', 'enrollmentNumber', 'studentEmail', 'studentPhone'],
  team: ['teamName', 'teamMembers.name', 'teamMembers.rollNumber', 'teamMembers.role', 'teamMembers.contribution', 'teamLeader'],
  guide: ['guide.name', 'guide.designation', 'guide.department', 'guide.email', 'hodName', 'hodDesignation'],
  dates: ['submissionDate', 'projectStartDate', 'projectEndDate'],
  frontMatter: ['certificate', 'declaration', 'acknowledgement', 'abstract', 'keywords'],
  toc: ['showTableOfContents', 'showListOfFigures', 'showListOfTables'],
  intro: ['introduction', 'problemStatement', 'objectives', 'scope', 'limitations'],
  methodology: ['methodology', 'developmentModel', 'literatureReview'],
  implementation: ['implementation', 'techStack.category', 'techStack.technologies', 'modules.name', 'modules.description', 'screenshots'],
  testing: ['testingApproach', 'testCases.id', 'testCases.description', 'testCases.status', 'testResults'],
  results: ['results', 'findings', 'dataAnalysis', 'performanceMetrics.metric', 'performanceMetrics.value'],
  conclusion: ['conclusion', 'futureScope', 'recommendations', 'challengesFaced', 'solutionsApplied'],
  references: ['references.type', 'references.title', 'references.authors', 'references.year', 'references.url', 'citationStyle'],
  styling: ['accentColor', 'showPageNumbers', 'showHeader', 'showFooter']
};

export const PROJECT_REPORT_FORMS: Record<string, BaseFormSchema> = {
  [ProjectReportType.ACADEMIC]: {
    type: 'academic', templateId: 'project-report-academic', promptKeyPrefix: 'projectReport.academic', template: 'project-report-academic.hbs',
    steps: [
      { id: 'meta', promptKey: 'projectReport.academic.step.meta', fields: F.meta },
      { id: 'institution', promptKey: 'projectReport.academic.step.institution', fields: F.institution },
      { id: 'student', promptKey: 'projectReport.academic.step.student', fields: F.student },
      { id: 'team', promptKey: 'projectReport.academic.step.team', fields: F.team, isArray: true, optional: true, condition: "projectType === 'group'" },
      { id: 'guide', promptKey: 'projectReport.academic.step.guide', fields: F.guide },
      { id: 'dates', promptKey: 'projectReport.academic.step.dates', fields: F.dates },
      { id: 'frontMatter', promptKey: 'projectReport.academic.step.frontMatter', fields: F.frontMatter },
      { id: 'toc', promptKey: 'projectReport.academic.step.toc', fields: F.toc, optional: true },
      { id: 'introduction', promptKey: 'projectReport.academic.step.introduction', fields: F.intro },
      { id: 'methodology', promptKey: 'projectReport.academic.step.methodology', fields: ['methodology', 'literatureReview'] },
      { id: 'implementation', promptKey: 'projectReport.academic.step.implementation', fields: ['implementation', 'screenshots'], optional: true },
      { id: 'results', promptKey: 'projectReport.academic.step.results', fields: ['results', 'findings'] },
      { id: 'conclusion', promptKey: 'projectReport.academic.step.conclusion', fields: F.conclusion },
      { id: 'references', promptKey: 'projectReport.academic.step.references', fields: F.references, isArray: true },
      { id: 'styling', promptKey: 'projectReport.academic.step.styling', fields: F.styling, optional: true }
    ]
  },
  [ProjectReportType.TECHNICAL]: {
    type: 'technical', templateId: 'project-report-technical', promptKeyPrefix: 'projectReport.technical', template: 'project-report-technical.hbs',
    steps: [
      { id: 'meta', promptKey: 'projectReport.technical.step.meta', fields: F.meta },
      { id: 'institution', promptKey: 'projectReport.technical.step.institution', fields: F.institution },
      { id: 'student', promptKey: 'projectReport.technical.step.student', fields: F.student },
      { id: 'team', promptKey: 'projectReport.technical.step.team', fields: F.team, isArray: true, optional: true, condition: "projectType === 'group'" },
      { id: 'guide', promptKey: 'projectReport.technical.step.guide', fields: F.guide },
      { id: 'dates', promptKey: 'projectReport.technical.step.dates', fields: F.dates },
      { id: 'frontMatter', promptKey: 'projectReport.technical.step.frontMatter', fields: F.frontMatter },
      { id: 'introduction', promptKey: 'projectReport.technical.step.introduction', fields: F.intro },
      { id: 'methodology', promptKey: 'projectReport.technical.step.methodology', fields: [...F.methodology, 'developmentModel'] },
      { id: 'systemDesign', promptKey: 'projectReport.technical.step.systemDesign', fields: ['systemRequirements.hardware', 'systemRequirements.software', 'systemRequirements.functional', 'systemArchitecture', 'dfdDiagrams', 'erDiagrams', 'useCaseDiagrams'] },
      { id: 'techStack', promptKey: 'projectReport.technical.step.techStack', fields: ['techStack.category', 'techStack.technologies'], isArray: true },
      { id: 'implementation', promptKey: 'projectReport.technical.step.implementation', fields: F.implementation },
      { id: 'testing', promptKey: 'projectReport.technical.step.testing', fields: F.testing, isArray: true },
      { id: 'results', promptKey: 'projectReport.technical.step.results', fields: F.results },
      { id: 'conclusion', promptKey: 'projectReport.technical.step.conclusion', fields: F.conclusion },
      { id: 'references', promptKey: 'projectReport.technical.step.references', fields: F.references, isArray: true },
      { id: 'styling', promptKey: 'projectReport.technical.step.styling', fields: F.styling, optional: true }
    ]
  },
  [ProjectReportType.RESEARCH]: {
    type: 'research', templateId: 'project-report-research', promptKeyPrefix: 'projectReport.research', template: 'project-report-research.hbs',
    steps: [
      { id: 'meta', promptKey: 'projectReport.research.step.meta', fields: F.meta },
      { id: 'institution', promptKey: 'projectReport.research.step.institution', fields: F.institution },
      { id: 'student', promptKey: 'projectReport.research.step.student', fields: F.student },
      { id: 'guide', promptKey: 'projectReport.research.step.guide', fields: [...F.guide, 'coGuide.name', 'coGuide.designation'] },
      { id: 'dates', promptKey: 'projectReport.research.step.dates', fields: F.dates },
      { id: 'frontMatter', promptKey: 'projectReport.research.step.frontMatter', fields: F.frontMatter },
      { id: 'introduction', promptKey: 'projectReport.research.step.introduction', fields: [...F.intro, 'researchQuestions', 'hypothesis'] },
      { id: 'literatureReview', promptKey: 'projectReport.research.step.literatureReview', fields: ['literatureReview', 'existingSystems.name', 'existingSystems.description', 'existingSystems.limitations'], isArray: true },
      { id: 'methodology', promptKey: 'projectReport.research.step.methodology', fields: ['methodology', 'researchDesign', 'dataCollection', 'sampleSize', 'analysisMethod'] },
      { id: 'dataAnalysis', promptKey: 'projectReport.research.step.dataAnalysis', fields: ['dataAnalysis', 'findings', 'statisticalResults'] },
      { id: 'discussion', promptKey: 'projectReport.research.step.discussion', fields: ['discussion', 'interpretation', 'limitations'] },
      { id: 'conclusion', promptKey: 'projectReport.research.step.conclusion', fields: F.conclusion },
      { id: 'references', promptKey: 'projectReport.research.step.references', fields: F.references, isArray: true },
      { id: 'appendix', promptKey: 'projectReport.research.step.appendix', fields: ['appendix.label', 'appendix.title', 'appendix.content'], isArray: true, optional: true }
    ]
  },
  [ProjectReportType.INTERNSHIP]: {
    type: 'internship', templateId: 'project-report-internship', promptKeyPrefix: 'projectReport.internship', template: 'project-report-internship.hbs',
    steps: [
      { id: 'meta', promptKey: 'projectReport.internship.step.meta', fields: ['templateType', 'projectTitle'] },
      { id: 'institution', promptKey: 'projectReport.internship.step.institution', fields: F.institution },
      { id: 'student', promptKey: 'projectReport.internship.step.student', fields: F.student },
      { id: 'guide', promptKey: 'projectReport.internship.step.guide', fields: F.guide },
      { id: 'dates', promptKey: 'projectReport.internship.step.dates', fields: F.dates },
      { id: 'companyInfo', promptKey: 'projectReport.internship.step.companyInfo', fields: ['internship.companyName', 'internship.companyAddress', 'internship.companyWebsite', 'internship.industry', 'internship.department'] },
      { id: 'supervisorInfo', promptKey: 'projectReport.internship.step.supervisorInfo', fields: ['internship.supervisorName', 'internship.supervisorDesignation', 'internship.supervisorEmail'] },
      { id: 'internshipDates', promptKey: 'projectReport.internship.step.internshipDates', fields: ['internship.startDate', 'internship.endDate', 'internship.duration', 'internship.stipend'] },
      { id: 'frontMatter', promptKey: 'projectReport.internship.step.frontMatter', fields: ['certificate', 'acknowledgement', 'abstract'] },
      { id: 'introduction', promptKey: 'projectReport.internship.step.introduction', fields: ['introduction', 'companyOverview', 'objectives'] },
      { id: 'weeklyReports', promptKey: 'projectReport.internship.step.weeklyReports', fields: ['weeklyReports.week', 'weeklyReports.startDate', 'weeklyReports.endDate', 'weeklyReports.tasks', 'weeklyReports.learnings'], isArray: true },
      { id: 'projectsWorked', promptKey: 'projectReport.internship.step.projectsWorked', fields: ['projectsWorkedOn.name', 'projectsWorkedOn.description', 'projectsWorkedOn.contribution'], isArray: true, optional: true },
      { id: 'skillsLearned', promptKey: 'projectReport.internship.step.skillsLearned', fields: ['skillsLearned', 'toolsUsed'], isArray: true },
      { id: 'conclusion', promptKey: 'projectReport.internship.step.conclusion', fields: ['conclusion', 'keyTakeaways', 'futureScope'] },
      { id: 'styling', promptKey: 'projectReport.internship.step.styling', fields: F.styling, optional: true }
    ]
  },
  [ProjectReportType.INDUSTRIAL]: {
    type: 'industrial', templateId: 'project-report-industrial', promptKeyPrefix: 'projectReport.industrial', template: 'project-report-industrial.hbs',
    steps: [
      { id: 'meta', promptKey: 'projectReport.industrial.step.meta', fields: ['templateType', 'projectTitle'] },
      { id: 'institution', promptKey: 'projectReport.industrial.step.institution', fields: F.institution },
      { id: 'student', promptKey: 'projectReport.industrial.step.student', fields: F.student },
      { id: 'team', promptKey: 'projectReport.industrial.step.team', fields: F.team, isArray: true, optional: true },
      { id: 'guide', promptKey: 'projectReport.industrial.step.guide', fields: F.guide },
      { id: 'visitInfo', promptKey: 'projectReport.industrial.step.visitInfo', fields: ['industrialVisit.companyName', 'industrialVisit.location', 'industrialVisit.visitDate', 'industrialVisit.duration', 'industrialVisit.guide'] },
      { id: 'frontMatter', promptKey: 'projectReport.industrial.step.frontMatter', fields: ['certificate', 'acknowledgement', 'abstract'] },
      { id: 'introduction', promptKey: 'projectReport.industrial.step.introduction', fields: ['introduction', 'companyBackground', 'objectives'] },
      { id: 'departmentsVisited', promptKey: 'projectReport.industrial.step.departmentsVisited', fields: ['departmentsVisited.name', 'departmentsVisited.activities', 'departmentsVisited.keyLearnings'], isArray: true },
      { id: 'manufacturingProcess', promptKey: 'projectReport.industrial.step.manufacturingProcess', fields: ['manufacturingProcess', 'observations'], optional: true },
      { id: 'conclusion', promptKey: 'projectReport.industrial.step.conclusion', fields: ['conclusion', 'keyLearnings', 'suggestions'] },
      { id: 'styling', promptKey: 'projectReport.industrial.step.styling', fields: F.styling, optional: true }
    ]
  },
  [ProjectReportType.CAPSTONE]: {
    type: 'capstone', templateId: 'project-report-capstone', promptKeyPrefix: 'projectReport.capstone', template: 'project-report-capstone.hbs',
    steps: [
      { id: 'meta', promptKey: 'projectReport.capstone.step.meta', fields: F.meta },
      { id: 'institution', promptKey: 'projectReport.capstone.step.institution', fields: F.institution },
      { id: 'team', promptKey: 'projectReport.capstone.step.team', fields: F.team, isArray: true },
      { id: 'guide', promptKey: 'projectReport.capstone.step.guide', fields: [...F.guide, 'externalGuide.name', 'externalGuide.designation', 'externalGuide.company'] },
      { id: 'dates', promptKey: 'projectReport.capstone.step.dates', fields: F.dates },
      { id: 'frontMatter', promptKey: 'projectReport.capstone.step.frontMatter', fields: F.frontMatter },
      { id: 'toc', promptKey: 'projectReport.capstone.step.toc', fields: F.toc },
      { id: 'introduction', promptKey: 'projectReport.capstone.step.introduction', fields: F.intro },
      { id: 'literatureReview', promptKey: 'projectReport.capstone.step.literatureReview', fields: ['literatureReview', 'existingSystems.name', 'existingSystems.description'], isArray: true },
      { id: 'methodology', promptKey: 'projectReport.capstone.step.methodology', fields: [...F.methodology, 'developmentModel'] },
      { id: 'systemDesign', promptKey: 'projectReport.capstone.step.systemDesign', fields: ['systemRequirements.hardware', 'systemRequirements.software', 'systemRequirements.functional', 'systemRequirements.nonFunctional', 'systemArchitecture'] },
      { id: 'techStack', promptKey: 'projectReport.capstone.step.techStack', fields: ['techStack.category', 'techStack.technologies'], isArray: true },
      { id: 'implementation', promptKey: 'projectReport.capstone.step.implementation', fields: F.implementation },
      { id: 'testing', promptKey: 'projectReport.capstone.step.testing', fields: F.testing, isArray: true },
      { id: 'results', promptKey: 'projectReport.capstone.step.results', fields: F.results },
      { id: 'conclusion', promptKey: 'projectReport.capstone.step.conclusion', fields: F.conclusion },
      { id: 'timeline', promptKey: 'projectReport.capstone.step.timeline', fields: ['milestones.name', 'milestones.startDate', 'milestones.endDate', 'milestones.status', 'ganttChart'], isArray: true, optional: true },
      { id: 'budget', promptKey: 'projectReport.capstone.step.budget', fields: ['budget.item', 'budget.quantity', 'budget.cost', 'totalBudget'], isArray: true, optional: true },
      { id: 'references', promptKey: 'projectReport.capstone.step.references', fields: F.references, isArray: true },
      { id: 'appendix', promptKey: 'projectReport.capstone.step.appendix', fields: ['appendix.label', 'appendix.title', 'appendix.content'], isArray: true, optional: true },
      { id: 'styling', promptKey: 'projectReport.capstone.step.styling', fields: F.styling, optional: true }
    ]
  }
};

// Wrapper functions
export const getProjectReportForm = (type: string) => getForm(PROJECT_REPORT_FORMS, type);
export const getProjectReportStep = (type: string, stepId: string) => getStep(PROJECT_REPORT_FORMS, type, stepId);
export const getProjectReportFields = (type: string) => getFields(PROJECT_REPORT_FORMS, type);
export const getProjectReportArraySteps = (type: string) => getArraySteps(PROJECT_REPORT_FORMS, type);
export const getProjectReportTypes = () => Object.keys(PROJECT_REPORT_FORMS);

// Auto-suggest project report type
export const suggestProjectReportType = (ctx: { isInternship?: boolean; isIndustrial?: boolean; isResearch?: boolean; isTechnical?: boolean; isFinalYear?: boolean }): ProjectReportType => {
  if (ctx.isInternship) return ProjectReportType.INTERNSHIP;
  if (ctx.isIndustrial) return ProjectReportType.INDUSTRIAL;
  if (ctx.isResearch) return ProjectReportType.RESEARCH;
  if (ctx.isFinalYear) return ProjectReportType.CAPSTONE;
  if (ctx.isTechnical) return ProjectReportType.TECHNICAL;
  return ProjectReportType.ACADEMIC;
};