/**
 * SORIVA - Essay Form Schema (Lean)
 * Synced with: essay-fields.config.ts
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getArraySteps } from './form-schema.helpers';

export enum EssayType {
  ACADEMIC = 'academic',
  ARGUMENTATIVE = 'argumentative',
  NARRATIVE = 'narrative',
  DESCRIPTIVE = 'descriptive',
  EXPOSITORY = 'expository',
  PERSUASIVE = 'persuasive',
  COMPARE_CONTRAST = 'compare-contrast',
  CAUSE_EFFECT = 'cause-effect',
  PROBLEM_SOLUTION = 'problem-solution',
  REFLECTIVE = 'reflective',
  CRITICAL_ANALYSIS = 'critical-analysis',
  RESEARCH = 'research',
  OPINION = 'opinion'
}

const intro = ['introduction.hook', 'introduction.hookType', 'introduction.background', 'introduction.thesis'];
const body = ['bodyParagraphs.topic', 'bodyParagraphs.topicSentence', 'bodyParagraphs.supportingPoints', 'bodyParagraphs.evidence', 'bodyParagraphs.analysis', 'bodyParagraphs.transition'];
const conclusionBasic = ['conclusion.restatedThesis', 'conclusion.summary', 'conclusion.finalThought'];

export const ESSAY_FORMS: Record<string, BaseFormSchema> = {
  [EssayType.ACADEMIC]: {
    type: 'academic', templateId: 'essay-academic', promptKeyPrefix: 'essay.academic', template: 'essay-academic.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.academic.step.metadata', fields: ['title', 'subtitle', 'essayType', 'academicDiscipline', 'topic', 'keywords'] },
      { id: 'author', promptKey: 'essay.academic.step.author', fields: ['author', 'rollNumber', 'class', 'section'] },
      { id: 'institution', promptKey: 'essay.academic.step.institution', fields: ['institution', 'department', 'instructor'] },
      { id: 'course', promptKey: 'essay.academic.step.course', fields: ['course', 'courseCode', 'semester'], optional: true },
      { id: 'dates', promptKey: 'essay.academic.step.dates', fields: ['date', 'dueDate'] },
      { id: 'abstract', promptKey: 'essay.academic.step.abstract', fields: ['abstract'], optional: true },
      { id: 'introduction', promptKey: 'essay.academic.step.introduction', fields: [...intro, 'introduction.roadmap'] },
      { id: 'body', promptKey: 'essay.academic.step.body', fields: body, isArray: true },
      { id: 'conclusion', promptKey: 'essay.academic.step.conclusion', fields: [...conclusionBasic, 'conclusion.synthesis', 'conclusion.implications'] },
      { id: 'references', promptKey: 'essay.academic.step.references', fields: ['citationStyle', 'citations', 'bibliography'], isArray: true },
      { id: 'formatting', promptKey: 'essay.academic.step.formatting', fields: ['targetWordCount', 'lineSpacing', 'showPageNumbers'], optional: true }
    ]
  },
  [EssayType.ARGUMENTATIVE]: {
    type: 'argumentative', templateId: 'essay-argumentative', promptKeyPrefix: 'essay.argumentative', template: 'essay-argumentative.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.argumentative.step.metadata', fields: ['title', 'topic', 'essayType'] },
      { id: 'author', promptKey: 'essay.argumentative.step.author', fields: ['author', 'rollNumber', 'class'] },
      { id: 'institution', promptKey: 'essay.argumentative.step.institution', fields: ['institution', 'instructor'] },
      { id: 'dates', promptKey: 'essay.argumentative.step.dates', fields: ['date', 'dueDate'] },
      { id: 'introduction', promptKey: 'essay.argumentative.step.introduction', fields: intro },
      { id: 'mainArgument', promptKey: 'essay.argumentative.step.mainArgument', fields: ['argumentative.mainArgument'] },
      { id: 'supportingArguments', promptKey: 'essay.argumentative.step.supportingArguments', fields: ['argumentative.supportingArguments.argument', 'argumentative.supportingArguments.evidence', 'argumentative.supportingArguments.analysis'], isArray: true },
      { id: 'counterArguments', promptKey: 'essay.argumentative.step.counterArguments', fields: ['argumentative.counterArguments.point', 'argumentative.counterArguments.rebuttal'], isArray: true },
      { id: 'appeals', promptKey: 'essay.argumentative.step.appeals', fields: ['argumentative.logicalAppeals', 'argumentative.emotionalAppeals', 'argumentative.credibilityAppeals'], isArray: true, optional: true },
      { id: 'conclusion', promptKey: 'essay.argumentative.step.conclusion', fields: [...conclusionBasic, 'conclusion.callToAction'] },
      { id: 'references', promptKey: 'essay.argumentative.step.references', fields: ['citationStyle', 'citations'], isArray: true }
    ]
  },
  [EssayType.NARRATIVE]: {
    type: 'narrative', templateId: 'essay-narrative', promptKeyPrefix: 'essay.narrative', template: 'essay-narrative.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.narrative.step.metadata', fields: ['title', 'essayType'] },
      { id: 'author', promptKey: 'essay.narrative.step.author', fields: ['author', 'class'] },
      { id: 'dates', promptKey: 'essay.narrative.step.dates', fields: ['date'] },
      { id: 'introduction', promptKey: 'essay.narrative.step.introduction', fields: intro },
      { id: 'setting', promptKey: 'essay.narrative.step.setting', fields: ['narrative.setting.time', 'narrative.setting.place', 'narrative.setting.atmosphere'] },
      { id: 'characters', promptKey: 'essay.narrative.step.characters', fields: ['narrative.characters.name', 'narrative.characters.role', 'narrative.characters.description'], isArray: true },
      { id: 'plot', promptKey: 'essay.narrative.step.plot', fields: ['narrative.plot.exposition', 'narrative.plot.risingAction', 'narrative.plot.climax', 'narrative.plot.fallingAction', 'narrative.plot.resolution'], isArray: true },
      { id: 'theme', promptKey: 'essay.narrative.step.theme', fields: ['narrative.theme', 'narrative.lesson'] },
      { id: 'conclusion', promptKey: 'essay.narrative.step.conclusion', fields: ['conclusion.restatedThesis', 'conclusion.finalThought'] }
    ]
  },
  [EssayType.DESCRIPTIVE]: {
    type: 'descriptive', templateId: 'essay-descriptive', promptKeyPrefix: 'essay.descriptive', template: 'essay-descriptive.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.descriptive.step.metadata', fields: ['title', 'essayType'] },
      { id: 'author', promptKey: 'essay.descriptive.step.author', fields: ['author', 'class'] },
      { id: 'dates', promptKey: 'essay.descriptive.step.dates', fields: ['date'] },
      { id: 'introduction', promptKey: 'essay.descriptive.step.introduction', fields: ['introduction.hook', 'introduction.background', 'introduction.thesis'] },
      { id: 'subject', promptKey: 'essay.descriptive.step.subject', fields: ['descriptive.subject', 'descriptive.dominantImpression'] },
      { id: 'sensoryDetails', promptKey: 'essay.descriptive.step.sensoryDetails', fields: ['descriptive.sensoryDetails.sight', 'descriptive.sensoryDetails.sound', 'descriptive.sensoryDetails.smell', 'descriptive.sensoryDetails.taste', 'descriptive.sensoryDetails.touch'], isArray: true },
      { id: 'figurativeLanguage', promptKey: 'essay.descriptive.step.figurativeLanguage', fields: ['descriptive.figurativeLanguage.type', 'descriptive.figurativeLanguage.example'], isArray: true, optional: true },
      { id: 'body', promptKey: 'essay.descriptive.step.body', fields: ['bodyParagraphs.topic', 'bodyParagraphs.topicSentence', 'bodyParagraphs.supportingPoints'], isArray: true },
      { id: 'conclusion', promptKey: 'essay.descriptive.step.conclusion', fields: ['conclusion.restatedThesis', 'conclusion.finalThought'] }
    ]
  },
  [EssayType.EXPOSITORY]: {
    type: 'expository', templateId: 'essay-expository', promptKeyPrefix: 'essay.expository', template: 'essay-expository.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.expository.step.metadata', fields: ['title', 'topic', 'essayType'] },
      { id: 'author', promptKey: 'essay.expository.step.author', fields: ['author', 'rollNumber', 'class'] },
      { id: 'institution', promptKey: 'essay.expository.step.institution', fields: ['institution', 'instructor'] },
      { id: 'dates', promptKey: 'essay.expository.step.dates', fields: ['date', 'dueDate'] },
      { id: 'introduction', promptKey: 'essay.expository.step.introduction', fields: [...intro, 'introduction.roadmap'] },
      { id: 'body', promptKey: 'essay.expository.step.body', fields: body, isArray: true },
      { id: 'conclusion', promptKey: 'essay.expository.step.conclusion', fields: conclusionBasic },
      { id: 'references', promptKey: 'essay.expository.step.references', fields: ['citationStyle', 'citations'], isArray: true, optional: true }
    ]
  },
  [EssayType.PERSUASIVE]: {
    type: 'persuasive', templateId: 'essay-persuasive', promptKeyPrefix: 'essay.persuasive', template: 'essay-persuasive.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.persuasive.step.metadata', fields: ['title', 'topic', 'essayType'] },
      { id: 'author', promptKey: 'essay.persuasive.step.author', fields: ['author', 'rollNumber', 'class'] },
      { id: 'institution', promptKey: 'essay.persuasive.step.institution', fields: ['institution', 'instructor'] },
      { id: 'dates', promptKey: 'essay.persuasive.step.dates', fields: ['date', 'dueDate'] },
      { id: 'introduction', promptKey: 'essay.persuasive.step.introduction', fields: intro },
      { id: 'mainArgument', promptKey: 'essay.persuasive.step.mainArgument', fields: ['argumentative.mainArgument'] },
      { id: 'appeals', promptKey: 'essay.persuasive.step.appeals', fields: ['argumentative.logicalAppeals', 'argumentative.emotionalAppeals', 'argumentative.credibilityAppeals'], isArray: true },
      { id: 'body', promptKey: 'essay.persuasive.step.body', fields: ['bodyParagraphs.topic', 'bodyParagraphs.topicSentence', 'bodyParagraphs.evidence', 'bodyParagraphs.analysis'], isArray: true },
      { id: 'counterArgument', promptKey: 'essay.persuasive.step.counterArgument', fields: ['argumentative.counterArguments.point', 'argumentative.counterArguments.rebuttal'], isArray: true, optional: true },
      { id: 'conclusion', promptKey: 'essay.persuasive.step.conclusion', fields: [...conclusionBasic, 'conclusion.callToAction'] }
    ]
  },
  [EssayType.COMPARE_CONTRAST]: {
    type: 'compare-contrast', templateId: 'essay-compare-contrast', promptKeyPrefix: 'essay.compareContrast', template: 'essay-compare-contrast.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.compareContrast.step.metadata', fields: ['title', 'topic', 'essayType'] },
      { id: 'author', promptKey: 'essay.compareContrast.step.author', fields: ['author', 'rollNumber', 'class'] },
      { id: 'dates', promptKey: 'essay.compareContrast.step.dates', fields: ['date', 'dueDate'] },
      { id: 'introduction', promptKey: 'essay.compareContrast.step.introduction', fields: ['introduction.hook', 'introduction.background', 'introduction.thesis'] },
      { id: 'subjects', promptKey: 'essay.compareContrast.step.subjects', fields: ['compareContrast.subject1.name', 'compareContrast.subject1.characteristics', 'compareContrast.subject2.name', 'compareContrast.subject2.characteristics'], isArray: true },
      { id: 'comparison', promptKey: 'essay.compareContrast.step.comparison', fields: ['compareContrast.similarities', 'compareContrast.differences', 'compareContrast.organizationMethod'], isArray: true },
      { id: 'body', promptKey: 'essay.compareContrast.step.body', fields: ['bodyParagraphs.topic', 'bodyParagraphs.topicSentence', 'bodyParagraphs.analysis'], isArray: true },
      { id: 'conclusion', promptKey: 'essay.compareContrast.step.conclusion', fields: conclusionBasic }
    ]
  },
  [EssayType.CAUSE_EFFECT]: {
    type: 'cause-effect', templateId: 'essay-cause-effect', promptKeyPrefix: 'essay.causeEffect', template: 'essay-cause-effect.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.causeEffect.step.metadata', fields: ['title', 'topic', 'essayType'] },
      { id: 'author', promptKey: 'essay.causeEffect.step.author', fields: ['author', 'rollNumber', 'class'] },
      { id: 'dates', promptKey: 'essay.causeEffect.step.dates', fields: ['date', 'dueDate'] },
      { id: 'introduction', promptKey: 'essay.causeEffect.step.introduction', fields: ['introduction.hook', 'introduction.background', 'introduction.thesis'] },
      { id: 'causes', promptKey: 'essay.causeEffect.step.causes', fields: ['causeEffect.causes.cause', 'causeEffect.causes.explanation', 'causeEffect.causes.evidence'], isArray: true },
      { id: 'effects', promptKey: 'essay.causeEffect.step.effects', fields: ['causeEffect.effects.effect', 'causeEffect.effects.explanation', 'causeEffect.effects.evidence'], isArray: true },
      { id: 'organization', promptKey: 'essay.causeEffect.step.organization', fields: ['causeEffect.organizationMethod', 'causeEffect.chainReaction'], optional: true },
      { id: 'conclusion', promptKey: 'essay.causeEffect.step.conclusion', fields: [...conclusionBasic, 'conclusion.implications'] }
    ]
  },
  [EssayType.PROBLEM_SOLUTION]: {
    type: 'problem-solution', templateId: 'essay-problem-solution', promptKeyPrefix: 'essay.problemSolution', template: 'essay-problem-solution.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.problemSolution.step.metadata', fields: ['title', 'topic', 'essayType'] },
      { id: 'author', promptKey: 'essay.problemSolution.step.author', fields: ['author', 'rollNumber', 'class'] },
      { id: 'dates', promptKey: 'essay.problemSolution.step.dates', fields: ['date', 'dueDate'] },
      { id: 'introduction', promptKey: 'essay.problemSolution.step.introduction', fields: ['introduction.hook', 'introduction.background', 'introduction.thesis'] },
      { id: 'problem', promptKey: 'essay.problemSolution.step.problem', fields: ['problemSolution.problem.statement', 'problemSolution.problem.background', 'problemSolution.problem.scope', 'problemSolution.problem.impact'], isArray: true },
      { id: 'solutions', promptKey: 'essay.problemSolution.step.solutions', fields: ['problemSolution.solutions.solution', 'problemSolution.solutions.implementation', 'problemSolution.solutions.advantages', 'problemSolution.solutions.disadvantages', 'problemSolution.solutions.feasibility'], isArray: true },
      { id: 'recommendation', promptKey: 'essay.problemSolution.step.recommendation', fields: ['problemSolution.recommendedSolution', 'problemSolution.callToAction'] },
      { id: 'conclusion', promptKey: 'essay.problemSolution.step.conclusion', fields: [...conclusionBasic, 'conclusion.callToAction'] }
    ]
  },
  [EssayType.REFLECTIVE]: {
    type: 'reflective', templateId: 'essay-reflective', promptKeyPrefix: 'essay.reflective', template: 'essay-reflective.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.reflective.step.metadata', fields: ['title', 'essayType'] },
      { id: 'author', promptKey: 'essay.reflective.step.author', fields: ['author', 'class'] },
      { id: 'dates', promptKey: 'essay.reflective.step.dates', fields: ['date'] },
      { id: 'introduction', promptKey: 'essay.reflective.step.introduction', fields: ['introduction.hook', 'introduction.background', 'introduction.thesis'] },
      { id: 'experience', promptKey: 'essay.reflective.step.experience', fields: ['narrative.plot.exposition', 'narrative.plot.climax'] },
      { id: 'reflection', promptKey: 'essay.reflective.step.reflection', fields: ['bodyParagraphs.topic', 'bodyParagraphs.topicSentence', 'bodyParagraphs.analysis'], isArray: true },
      { id: 'lesson', promptKey: 'essay.reflective.step.lesson', fields: ['narrative.lesson'] },
      { id: 'conclusion', promptKey: 'essay.reflective.step.conclusion', fields: ['conclusion.restatedThesis', 'conclusion.finalThought'] }
    ]
  },
  [EssayType.CRITICAL_ANALYSIS]: {
    type: 'critical-analysis', templateId: 'essay-critical-analysis', promptKeyPrefix: 'essay.criticalAnalysis', template: 'essay-critical-analysis.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.criticalAnalysis.step.metadata', fields: ['title', 'subtitle', 'topic', 'essayType', 'academicDiscipline'] },
      { id: 'author', promptKey: 'essay.criticalAnalysis.step.author', fields: ['author', 'rollNumber', 'class'] },
      { id: 'institution', promptKey: 'essay.criticalAnalysis.step.institution', fields: ['institution', 'department', 'instructor'] },
      { id: 'dates', promptKey: 'essay.criticalAnalysis.step.dates', fields: ['date', 'dueDate'] },
      { id: 'abstract', promptKey: 'essay.criticalAnalysis.step.abstract', fields: ['abstract'], optional: true },
      { id: 'introduction', promptKey: 'essay.criticalAnalysis.step.introduction', fields: [...intro, 'introduction.roadmap'] },
      { id: 'body', promptKey: 'essay.criticalAnalysis.step.body', fields: ['bodyParagraphs.topic', 'bodyParagraphs.topicSentence', 'bodyParagraphs.evidence', 'bodyParagraphs.analysis', 'bodyParagraphs.transition'], isArray: true },
      { id: 'conclusion', promptKey: 'essay.criticalAnalysis.step.conclusion', fields: [...conclusionBasic, 'conclusion.synthesis', 'conclusion.implications'] },
      { id: 'references', promptKey: 'essay.criticalAnalysis.step.references', fields: ['citationStyle', 'citations', 'bibliography'], isArray: true }
    ]
  },
  [EssayType.RESEARCH]: {
    type: 'research', templateId: 'essay-research', promptKeyPrefix: 'essay.research', template: 'essay-research.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.research.step.metadata', fields: ['title', 'subtitle', 'topic', 'essayType', 'academicDiscipline', 'keywords'] },
      { id: 'author', promptKey: 'essay.research.step.author', fields: ['author', 'rollNumber'] },
      { id: 'institution', promptKey: 'essay.research.step.institution', fields: ['institution', 'department', 'instructor'] },
      { id: 'course', promptKey: 'essay.research.step.course', fields: ['course', 'courseCode', 'semester'], optional: true },
      { id: 'dates', promptKey: 'essay.research.step.dates', fields: ['date', 'dueDate'] },
      { id: 'abstract', promptKey: 'essay.research.step.abstract', fields: ['abstract'] },
      { id: 'introduction', promptKey: 'essay.research.step.introduction', fields: [...intro, 'introduction.roadmap'] },
      { id: 'body', promptKey: 'essay.research.step.body', fields: body, isArray: true },
      { id: 'conclusion', promptKey: 'essay.research.step.conclusion', fields: [...conclusionBasic, 'conclusion.synthesis', 'conclusion.implications'] },
      { id: 'references', promptKey: 'essay.research.step.references', fields: ['citationStyle', 'citations', 'bibliography'], isArray: true },
      { id: 'appendices', promptKey: 'essay.research.step.appendices', fields: ['appendices.label', 'appendices.title', 'appendices.content'], isArray: true, optional: true }
    ]
  },
  [EssayType.OPINION]: {
    type: 'opinion', templateId: 'essay-opinion', promptKeyPrefix: 'essay.opinion', template: 'essay-opinion.hbs',
    steps: [
      { id: 'metadata', promptKey: 'essay.opinion.step.metadata', fields: ['title', 'topic', 'essayType'] },
      { id: 'author', promptKey: 'essay.opinion.step.author', fields: ['author', 'class'] },
      { id: 'dates', promptKey: 'essay.opinion.step.dates', fields: ['date'] },
      { id: 'introduction', promptKey: 'essay.opinion.step.introduction', fields: ['introduction.hook', 'introduction.background', 'introduction.thesis'] },
      { id: 'body', promptKey: 'essay.opinion.step.body', fields: ['bodyParagraphs.topic', 'bodyParagraphs.topicSentence', 'bodyParagraphs.supportingPoints', 'bodyParagraphs.evidence', 'bodyParagraphs.analysis'], isArray: true },
      { id: 'conclusion', promptKey: 'essay.opinion.step.conclusion', fields: conclusionBasic }
    ]
  }
};

// Wrapper functions
export const getEssayForm = (type: string) => getForm(ESSAY_FORMS, type);
export const getEssayStep = (type: string, stepId: string) => getStep(ESSAY_FORMS, type, stepId);
export const getEssayFields = (type: string) => getFields(ESSAY_FORMS, type);
export const getEssayArraySteps = (type: string) => getArraySteps(ESSAY_FORMS, type);
export const getEssayTypes = () => Object.keys(ESSAY_FORMS);

// Auto-suggest essay type
export const suggestEssayType = (ctx: { isArgumentative?: boolean; isNarrative?: boolean; isDescriptive?: boolean; isResearch?: boolean; isComparison?: boolean; isCauseEffect?: boolean; isProblem?: boolean; isReflective?: boolean; level?: string }): EssayType => {
  if (ctx.isArgumentative) return EssayType.ARGUMENTATIVE;
  if (ctx.isNarrative) return EssayType.NARRATIVE;
  if (ctx.isDescriptive) return EssayType.DESCRIPTIVE;
  if (ctx.isResearch) return EssayType.RESEARCH;
  if (ctx.isComparison) return EssayType.COMPARE_CONTRAST;
  if (ctx.isCauseEffect) return EssayType.CAUSE_EFFECT;
  if (ctx.isProblem) return EssayType.PROBLEM_SOLUTION;
  if (ctx.isReflective) return EssayType.REFLECTIVE;
  if (ctx.level && ['postgraduate', 'doctoral'].includes(ctx.level)) return EssayType.RESEARCH;
  return EssayType.ACADEMIC;
};