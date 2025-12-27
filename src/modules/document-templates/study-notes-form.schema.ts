/**
 * SORIVA - Study Notes Form Schema (Lean)
 * Synced with: study-notes-fields.config.ts
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getArraySteps } from './form-schema.helpers';

export enum StudyNotesType {
  PRIMARY = 'primary', MIDDLE = 'middle', SECONDARY = 'secondary', HIGHER_SECONDARY = 'higher-secondary',
  SCIENCE = 'science', MATHEMATICS = 'mathematics', SOCIAL_SCIENCE = 'social-science', LANGUAGE = 'language',
  REVISION = 'revision', EXAM_PREP = 'exam-prep',
  JEE = 'jee', NEET = 'neet', UPSC = 'upsc'
}

// Reusable field arrays
const F = {
  basic: ['title', 'subtitle', 'subject', 'topic', 'subtopic', 'chapter', 'chapterNumber'],
  basicMin: ['title', 'subject', 'topic', 'chapter'],
  academic: ['educationLevel', 'class', 'board', 'academicYear'],
  exam: ['targetExam', 'examYear', 'weightage', 'syllabusTopic'],
  content: ['introduction', 'summary', 'explanation'],
  keyPts: ['keyPoints.point', 'keyPoints.explanation', 'keyPoints.importance', 'keyPoints.examRelevance'],
  defs: ['definitions.term', 'definitions.meaning', 'definitions.example', 'definitions.hindiMeaning'],
  formulas: ['formulas.name', 'formulas.formula', 'formulas.description', 'formulas.variables', 'formulas.conditions'],
  laws: ['laws.name', 'laws.statement', 'laws.conditions', 'laws.applications'],
  theorems: ['theorems.name', 'theorems.statement', 'theorems.proof', 'theorems.applications'],
  derivations: ['derivations.name', 'derivations.startingPoint', 'derivations.steps', 'derivations.result'],
  diagrams: ['diagrams.title', 'diagrams.description', 'diagrams.labels', 'diagrams.type'],
  solved: ['solvedNumericals.question', 'solvedNumericals.solution', 'solvedNumericals.steps', 'solvedNumericals.answer'],
  practice: ['practiceQuestions.question', 'practiceQuestions.type', 'practiceQuestions.marks', 'practiceQuestions.difficulty'],
  pyq: ['previousYearQuestions.question', 'previousYearQuestions.type', 'previousYearQuestions.year', 'previousYearQuestions.examName'],
  revision: ['quickRevision.point', 'quickRevision.category', 'oneLiners'],
  tips: ['examTips', 'commonMistakes', 'scoringTopics'],
  refs: ['ncertReference', 'textbooks', 'videoLinks'],
  settings: ['templateStyle', 'accentColor', 'difficulty', 'importance']
};

export const STUDY_NOTES_FORMS: Record<string, BaseFormSchema> = {
  [StudyNotesType.PRIMARY]: {
    type: 'primary', templateId: 'study-notes-primary', promptKeyPrefix: 'studyNotes.primary', template: 'study-notes-primary.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.primary.step.basic', fields: F.basicMin },
      { id: 'academic', promptKey: 'studyNotes.primary.step.academic', fields: ['class', 'board'] },
      { id: 'content', promptKey: 'studyNotes.primary.step.content', fields: ['introduction', 'summary'] },
      { id: 'keyPoints', promptKey: 'studyNotes.primary.step.keyPoints', fields: ['keyPoints.point', 'keyPoints.explanation'], isArray: true },
      { id: 'definitions', promptKey: 'studyNotes.primary.step.definitions', fields: ['definitions.term', 'definitions.meaning', 'definitions.hindiMeaning'], isArray: true, optional: true },
      { id: 'bulletPoints', promptKey: 'studyNotes.primary.step.bulletPoints', fields: ['bulletPoints'], isArray: true },
      { id: 'mnemonics', promptKey: 'studyNotes.primary.step.mnemonics', fields: ['mnemonics.topic', 'mnemonics.mnemonic', 'mnemonics.items'], isArray: true, optional: true },
      { id: 'diagrams', promptKey: 'studyNotes.primary.step.diagrams', fields: ['diagrams.title', 'diagrams.description'], isArray: true, optional: true },
      { id: 'practice', promptKey: 'studyNotes.primary.step.practice', fields: ['practiceQuestions.question', 'practiceQuestions.type'], isArray: true, optional: true }
    ]
  },
  [StudyNotesType.MIDDLE]: {
    type: 'middle', templateId: 'study-notes-middle', promptKeyPrefix: 'studyNotes.middle', template: 'study-notes-middle.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.middle.step.basic', fields: F.basic },
      { id: 'academic', promptKey: 'studyNotes.middle.step.academic', fields: F.academic },
      { id: 'content', promptKey: 'studyNotes.middle.step.content', fields: F.content },
      { id: 'keyPoints', promptKey: 'studyNotes.middle.step.keyPoints', fields: ['keyPoints.point', 'keyPoints.explanation', 'keyPoints.importance'], isArray: true },
      { id: 'definitions', promptKey: 'studyNotes.middle.step.definitions', fields: F.defs, isArray: true },
      { id: 'formulas', promptKey: 'studyNotes.middle.step.formulas', fields: ['formulas.name', 'formulas.formula', 'formulas.description'], isArray: true, optional: true },
      { id: 'diagrams', promptKey: 'studyNotes.middle.step.diagrams', fields: F.diagrams, isArray: true, optional: true },
      { id: 'examples', promptKey: 'studyNotes.middle.step.examples', fields: ['examples.question', 'examples.solution', 'examples.answer'], isArray: true, optional: true },
      { id: 'practice', promptKey: 'studyNotes.middle.step.practice', fields: ['practiceQuestions.question', 'practiceQuestions.type', 'practiceQuestions.marks'], isArray: true },
      { id: 'refs', promptKey: 'studyNotes.middle.step.refs', fields: ['ncertReference', 'textbooks'], optional: true }
    ]
  },
  [StudyNotesType.SECONDARY]: {
    type: 'secondary', templateId: 'study-notes-secondary', promptKeyPrefix: 'studyNotes.secondary', template: 'study-notes-secondary.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.secondary.step.basic', fields: [...F.basic, 'unit', 'unitNumber'] },
      { id: 'academic', promptKey: 'studyNotes.secondary.step.academic', fields: [...F.academic, 'weightage'] },
      { id: 'content', promptKey: 'studyNotes.secondary.step.content', fields: F.content },
      { id: 'keyPoints', promptKey: 'studyNotes.secondary.step.keyPoints', fields: F.keyPts, isArray: true },
      { id: 'definitions', promptKey: 'studyNotes.secondary.step.definitions', fields: F.defs, isArray: true },
      { id: 'formulas', promptKey: 'studyNotes.secondary.step.formulas', fields: F.formulas, isArray: true, condition: "subjectCategory === 'science' || subjectCategory === 'mathematics'" },
      { id: 'theorems', promptKey: 'studyNotes.secondary.step.theorems', fields: F.theorems, isArray: true, optional: true },
      { id: 'diagrams', promptKey: 'studyNotes.secondary.step.diagrams', fields: F.diagrams, isArray: true },
      { id: 'solved', promptKey: 'studyNotes.secondary.step.solved', fields: F.solved, isArray: true },
      { id: 'practice', promptKey: 'studyNotes.secondary.step.practice', fields: F.practice, isArray: true },
      { id: 'important', promptKey: 'studyNotes.secondary.step.important', fields: ['importantQuestions.question', 'importantQuestions.type', 'importantQuestions.marks'], isArray: true },
      { id: 'revision', promptKey: 'studyNotes.secondary.step.revision', fields: F.revision, isArray: true },
      { id: 'tips', promptKey: 'studyNotes.secondary.step.tips', fields: [...F.tips, 'questionPattern'], isArray: true },
      { id: 'refs', promptKey: 'studyNotes.secondary.step.refs', fields: F.refs, optional: true }
    ]
  },
  [StudyNotesType.HIGHER_SECONDARY]: {
    type: 'higher-secondary', templateId: 'study-notes-higher-secondary', promptKeyPrefix: 'studyNotes.higherSecondary', template: 'study-notes-higher-secondary.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.higherSecondary.step.basic', fields: [...F.basic, 'specificSubject', 'unit', 'unitNumber'] },
      { id: 'academic', promptKey: 'studyNotes.higherSecondary.step.academic', fields: [...F.academic, 'targetExam', 'weightage'] },
      { id: 'content', promptKey: 'studyNotes.higherSecondary.step.content', fields: F.content },
      { id: 'keyPoints', promptKey: 'studyNotes.higherSecondary.step.keyPoints', fields: F.keyPts, isArray: true },
      { id: 'definitions', promptKey: 'studyNotes.higherSecondary.step.definitions', fields: F.defs, isArray: true },
      { id: 'formulas', promptKey: 'studyNotes.higherSecondary.step.formulas', fields: [...F.formulas, 'formulas.derivation', 'formulas.applications'], isArray: true },
      { id: 'derivations', promptKey: 'studyNotes.higherSecondary.step.derivations', fields: F.derivations, isArray: true, optional: true },
      { id: 'theorems', promptKey: 'studyNotes.higherSecondary.step.theorems', fields: F.theorems, isArray: true, optional: true },
      { id: 'laws', promptKey: 'studyNotes.higherSecondary.step.laws', fields: F.laws, isArray: true, optional: true },
      { id: 'diagrams', promptKey: 'studyNotes.higherSecondary.step.diagrams', fields: F.diagrams, isArray: true },
      { id: 'solved', promptKey: 'studyNotes.higherSecondary.step.solved', fields: [...F.solved, 'solvedNumericals.difficulty'], isArray: true },
      { id: 'shortcuts', promptKey: 'studyNotes.higherSecondary.step.shortcuts', fields: ['shortcuts.topic', 'shortcuts.shortcut', 'shortcuts.example'], isArray: true, optional: true },
      { id: 'practice', promptKey: 'studyNotes.higherSecondary.step.practice', fields: F.practice, isArray: true },
      { id: 'pyq', promptKey: 'studyNotes.higherSecondary.step.pyq', fields: F.pyq, isArray: true },
      { id: 'revision', promptKey: 'studyNotes.higherSecondary.step.revision', fields: F.revision, isArray: true },
      { id: 'tips', promptKey: 'studyNotes.higherSecondary.step.tips', fields: F.tips, isArray: true },
      { id: 'refs', promptKey: 'studyNotes.higherSecondary.step.refs', fields: [...F.refs, 'onlineResources'], isArray: true }
    ]
  },
  [StudyNotesType.SCIENCE]: {
    type: 'science', templateId: 'study-notes-science', promptKeyPrefix: 'studyNotes.science', template: 'study-notes-science.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.science.step.basic', fields: [...F.basic, 'specificSubject'] },
      { id: 'academic', promptKey: 'studyNotes.science.step.academic', fields: [...F.academic, 'targetExam', 'weightage'] },
      { id: 'content', promptKey: 'studyNotes.science.step.content', fields: F.content },
      { id: 'keyPoints', promptKey: 'studyNotes.science.step.keyPoints', fields: F.keyPts, isArray: true },
      { id: 'definitions', promptKey: 'studyNotes.science.step.definitions', fields: F.defs, isArray: true },
      { id: 'laws', promptKey: 'studyNotes.science.step.laws', fields: [...F.laws, 'laws.discoveredBy'], isArray: true },
      { id: 'formulas', promptKey: 'studyNotes.science.step.formulas', fields: [...F.formulas, 'formulas.applications'], isArray: true },
      { id: 'derivations', promptKey: 'studyNotes.science.step.derivations', fields: F.derivations, isArray: true, optional: true },
      { id: 'constants', promptKey: 'studyNotes.science.step.constants', fields: ['constants.name', 'constants.symbol', 'constants.value', 'constants.unit'], isArray: true, optional: true },
      { id: 'experiments', promptKey: 'studyNotes.science.step.experiments', fields: ['experiments.title', 'experiments.aim', 'experiments.apparatus', 'experiments.procedure', 'experiments.result', 'experiments.precautions'], isArray: true, optional: true },
      { id: 'reactions', promptKey: 'studyNotes.science.step.reactions', fields: ['chemicalReactions.name', 'chemicalReactions.equation', 'chemicalReactions.reactionType', 'chemicalReactions.conditions'], isArray: true, optional: true, condition: "specificSubject === 'Chemistry'" },
      { id: 'bioProcesses', promptKey: 'studyNotes.science.step.bioProcesses', fields: ['biologicalProcesses.name', 'biologicalProcesses.steps', 'biologicalProcesses.location', 'biologicalProcesses.significance'], isArray: true, optional: true, condition: "specificSubject === 'Biology'" },
      { id: 'diagrams', promptKey: 'studyNotes.science.step.diagrams', fields: F.diagrams, isArray: true },
      { id: 'solved', promptKey: 'studyNotes.science.step.solved', fields: ['solvedNumericals.question', 'solvedNumericals.given', 'solvedNumericals.toFind', 'solvedNumericals.formula', 'solvedNumericals.solution', 'solvedNumericals.answer'], isArray: true },
      { id: 'practice', promptKey: 'studyNotes.science.step.practice', fields: F.practice, isArray: true },
      { id: 'revision', promptKey: 'studyNotes.science.step.revision', fields: F.revision, isArray: true }
    ]
  },
  [StudyNotesType.MATHEMATICS]: {
    type: 'mathematics', templateId: 'study-notes-mathematics', promptKeyPrefix: 'studyNotes.mathematics', template: 'study-notes-mathematics.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.mathematics.step.basic', fields: F.basic },
      { id: 'academic', promptKey: 'studyNotes.mathematics.step.academic', fields: [...F.academic, 'targetExam', 'weightage'] },
      { id: 'content', promptKey: 'studyNotes.mathematics.step.content', fields: F.content },
      { id: 'keyPoints', promptKey: 'studyNotes.mathematics.step.keyPoints', fields: F.keyPts, isArray: true },
      { id: 'definitions', promptKey: 'studyNotes.mathematics.step.definitions', fields: F.defs, isArray: true },
      { id: 'formulas', promptKey: 'studyNotes.mathematics.step.formulas', fields: F.formulas, isArray: true },
      { id: 'theorems', promptKey: 'studyNotes.mathematics.step.theorems', fields: F.theorems, isArray: true },
      { id: 'proofs', promptKey: 'studyNotes.mathematics.step.proofs', fields: ['proofs.theorem', 'proofs.given', 'proofs.toProve', 'proofs.proof', 'proofs.conclusion'], isArray: true, optional: true },
      { id: 'graphs', promptKey: 'studyNotes.mathematics.step.graphs', fields: ['graphs.title', 'graphs.xAxis', 'graphs.yAxis', 'graphs.equation', 'graphs.keyPoints'], isArray: true, optional: true },
      { id: 'shortcuts', promptKey: 'studyNotes.mathematics.step.shortcuts', fields: ['shortcuts.topic', 'shortcuts.shortcut', 'shortcuts.example'], isArray: true },
      { id: 'solved', promptKey: 'studyNotes.mathematics.step.solved', fields: F.solved, isArray: true },
      { id: 'practice', promptKey: 'studyNotes.mathematics.step.practice', fields: F.practice, isArray: true },
      { id: 'revision', promptKey: 'studyNotes.mathematics.step.revision', fields: F.revision, isArray: true }
    ]
  },
  [StudyNotesType.SOCIAL_SCIENCE]: {
    type: 'social-science', templateId: 'study-notes-social-science', promptKeyPrefix: 'studyNotes.socialScience', template: 'study-notes-social-science.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.socialScience.step.basic', fields: [...F.basic, 'specificSubject'] },
      { id: 'academic', promptKey: 'studyNotes.socialScience.step.academic', fields: [...F.academic, 'targetExam', 'weightage'] },
      { id: 'content', promptKey: 'studyNotes.socialScience.step.content', fields: F.content },
      { id: 'keyPoints', promptKey: 'studyNotes.socialScience.step.keyPoints', fields: F.keyPts, isArray: true },
      { id: 'definitions', promptKey: 'studyNotes.socialScience.step.definitions', fields: ['definitions.term', 'definitions.meaning', 'definitions.hindiMeaning'], isArray: true },
      { id: 'timeline', promptKey: 'studyNotes.socialScience.step.timeline', fields: ['timeline.year', 'timeline.event', 'timeline.description', 'timeline.significance'], isArray: true, optional: true },
      { id: 'figures', promptKey: 'studyNotes.socialScience.step.figures', fields: ['historicalFigures.name', 'historicalFigures.lifespan', 'historicalFigures.contributions', 'historicalFigures.famousFor'], isArray: true, optional: true },
      { id: 'events', promptKey: 'studyNotes.socialScience.step.events', fields: ['events.name', 'events.date', 'events.description', 'events.causes', 'events.effects', 'events.significance'], isArray: true, optional: true },
      { id: 'mapPoints', promptKey: 'studyNotes.socialScience.step.mapPoints', fields: ['mapPoints.name', 'mapPoints.type', 'mapPoints.description', 'mapPoints.significance'], isArray: true, optional: true },
      { id: 'amendments', promptKey: 'studyNotes.socialScience.step.amendments', fields: ['amendments.number', 'amendments.year', 'amendments.description', 'amendments.significance'], isArray: true, optional: true },
      { id: 'policies', promptKey: 'studyNotes.socialScience.step.policies', fields: ['policies.name', 'policies.year', 'policies.objective', 'policies.features', 'policies.impact'], isArray: true, optional: true },
      { id: 'comparison', promptKey: 'studyNotes.socialScience.step.comparison', fields: ['comparisonTables.title', 'comparisonTables.items', 'comparisonTables.aspects'], isArray: true, optional: true },
      { id: 'practice', promptKey: 'studyNotes.socialScience.step.practice', fields: F.practice, isArray: true },
      { id: 'revision', promptKey: 'studyNotes.socialScience.step.revision', fields: F.revision, isArray: true }
    ]
  },
  [StudyNotesType.LANGUAGE]: {
    type: 'language', templateId: 'study-notes-language', promptKeyPrefix: 'studyNotes.language', template: 'study-notes-language.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.language.step.basic', fields: ['title', 'subject', 'specificSubject', 'topic', 'chapter'] },
      { id: 'academic', promptKey: 'studyNotes.language.step.academic', fields: F.academic },
      { id: 'content', promptKey: 'studyNotes.language.step.content', fields: F.content },
      { id: 'grammar', promptKey: 'studyNotes.language.step.grammar', fields: ['grammarRules.rule', 'grammarRules.explanation', 'grammarRules.examples', 'grammarRules.exceptions'], isArray: true, optional: true },
      { id: 'vocabulary', promptKey: 'studyNotes.language.step.vocabulary', fields: ['vocabulary.word', 'vocabulary.meaning', 'vocabulary.hindiMeaning', 'vocabulary.usage', 'vocabulary.synonyms', 'vocabulary.antonyms'], isArray: true, optional: true },
      { id: 'idioms', promptKey: 'studyNotes.language.step.idioms', fields: ['idioms.idiom', 'idioms.meaning', 'idioms.example', 'idioms.hindiMeaning'], isArray: true, optional: true },
      { id: 'literature', promptKey: 'studyNotes.language.step.literature', fields: ['literatureNotes.title', 'literatureNotes.author', 'literatureNotes.type', 'literatureNotes.summary', 'literatureNotes.themes', 'literatureNotes.importantQuotes'], isArray: true, optional: true },
      { id: 'writing', promptKey: 'studyNotes.language.step.writing', fields: ['writingFormats.type', 'writingFormats.format', 'writingFormats.tips', 'writingFormats.example'], isArray: true, optional: true },
      { id: 'practice', promptKey: 'studyNotes.language.step.practice', fields: F.practice, isArray: true },
      { id: 'revision', promptKey: 'studyNotes.language.step.revision', fields: F.revision, isArray: true }
    ]
  },
  [StudyNotesType.REVISION]: {
    type: 'revision', templateId: 'study-notes-revision', promptKeyPrefix: 'studyNotes.revision', template: 'study-notes-revision.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.revision.step.basic', fields: F.basicMin },
      { id: 'academic', promptKey: 'studyNotes.revision.step.academic', fields: ['class', 'board', 'targetExam'] },
      { id: 'summary', promptKey: 'studyNotes.revision.step.summary', fields: ['summary'] },
      { id: 'keyPoints', promptKey: 'studyNotes.revision.step.keyPoints', fields: ['keyPoints.point', 'keyPoints.importance'], isArray: true },
      { id: 'formulas', promptKey: 'studyNotes.revision.step.formulas', fields: ['formulas.name', 'formulas.formula'], isArray: true, optional: true },
      { id: 'oneLiners', promptKey: 'studyNotes.revision.step.oneLiners', fields: ['oneLiners'], isArray: true },
      { id: 'revision', promptKey: 'studyNotes.revision.step.revision', fields: ['quickRevision.point', 'quickRevision.category'], isArray: true },
      { id: 'mnemonics', promptKey: 'studyNotes.revision.step.mnemonics', fields: ['mnemonics.topic', 'mnemonics.mnemonic', 'mnemonics.items'], isArray: true, optional: true },
      { id: 'important', promptKey: 'studyNotes.revision.step.important', fields: ['importantForExam'], isArray: true }
    ]
  },
  [StudyNotesType.EXAM_PREP]: {
    type: 'exam-prep', templateId: 'study-notes-exam-prep', promptKeyPrefix: 'studyNotes.examPrep', template: 'study-notes-exam-prep.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.examPrep.step.basic', fields: F.basicMin },
      { id: 'exam', promptKey: 'studyNotes.examPrep.step.exam', fields: ['targetExam', 'examYear', 'weightage', 'questionPattern'] },
      { id: 'keyPoints', promptKey: 'studyNotes.examPrep.step.keyPoints', fields: F.keyPts, isArray: true },
      { id: 'formulas', promptKey: 'studyNotes.examPrep.step.formulas', fields: ['formulas.name', 'formulas.formula', 'formulas.applications'], isArray: true, optional: true },
      { id: 'important', promptKey: 'studyNotes.examPrep.step.important', fields: ['importantQuestions.question', 'importantQuestions.type', 'importantQuestions.marks'], isArray: true },
      { id: 'pyq', promptKey: 'studyNotes.examPrep.step.pyq', fields: F.pyq, isArray: true },
      { id: 'expected', promptKey: 'studyNotes.examPrep.step.expected', fields: ['expectedQuestions.question', 'expectedQuestions.type', 'expectedQuestions.marks'], isArray: true, optional: true },
      { id: 'revision', promptKey: 'studyNotes.examPrep.step.revision', fields: F.revision, isArray: true },
      { id: 'tips', promptKey: 'studyNotes.examPrep.step.tips', fields: F.tips, isArray: true },
      { id: 'marking', promptKey: 'studyNotes.examPrep.step.marking', fields: ['markingScheme.questionType', 'markingScheme.marks', 'markingScheme.expectedLength', 'markingScheme.tips'], isArray: true, optional: true }
    ]
  },
  [StudyNotesType.JEE]: {
    type: 'jee', templateId: 'study-notes-jee', promptKeyPrefix: 'studyNotes.jee', template: 'study-notes-jee.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.jee.step.basic', fields: [...F.basic, 'specificSubject', 'unit'] },
      { id: 'exam', promptKey: 'studyNotes.jee.step.exam', fields: ['targetExam', 'examYear', 'weightage', 'syllabusTopic'] },
      { id: 'content', promptKey: 'studyNotes.jee.step.content', fields: F.content },
      { id: 'keyPoints', promptKey: 'studyNotes.jee.step.keyPoints', fields: F.keyPts, isArray: true },
      { id: 'definitions', promptKey: 'studyNotes.jee.step.definitions', fields: F.defs, isArray: true },
      { id: 'laws', promptKey: 'studyNotes.jee.step.laws', fields: F.laws, isArray: true, optional: true },
      { id: 'formulas', promptKey: 'studyNotes.jee.step.formulas', fields: [...F.formulas, 'formulas.derivation', 'formulas.applications'], isArray: true },
      { id: 'derivations', promptKey: 'studyNotes.jee.step.derivations', fields: F.derivations, isArray: true, optional: true },
      { id: 'theorems', promptKey: 'studyNotes.jee.step.theorems', fields: F.theorems, isArray: true, optional: true },
      { id: 'constants', promptKey: 'studyNotes.jee.step.constants', fields: ['constants.name', 'constants.symbol', 'constants.value', 'constants.unit'], isArray: true, optional: true },
      { id: 'diagrams', promptKey: 'studyNotes.jee.step.diagrams', fields: F.diagrams, isArray: true },
      { id: 'shortcuts', promptKey: 'studyNotes.jee.step.shortcuts', fields: ['shortcuts.topic', 'shortcuts.shortcut', 'shortcuts.explanation', 'shortcuts.example'], isArray: true },
      { id: 'solved', promptKey: 'studyNotes.jee.step.solved', fields: ['solvedNumericals.question', 'solvedNumericals.given', 'solvedNumericals.toFind', 'solvedNumericals.formula', 'solvedNumericals.solution', 'solvedNumericals.answer', 'solvedNumericals.difficulty'], isArray: true },
      { id: 'pyq', promptKey: 'studyNotes.jee.step.pyq', fields: [...F.pyq, 'previousYearQuestions.explanation'], isArray: true },
      { id: 'revision', promptKey: 'studyNotes.jee.step.revision', fields: F.revision, isArray: true },
      { id: 'tips', promptKey: 'studyNotes.jee.step.tips', fields: F.tips, isArray: true },
      { id: 'refs', promptKey: 'studyNotes.jee.step.refs', fields: F.refs, isArray: true }
    ]
  },
  [StudyNotesType.NEET]: {
    type: 'neet', templateId: 'study-notes-neet', promptKeyPrefix: 'studyNotes.neet', template: 'study-notes-neet.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.neet.step.basic', fields: [...F.basic, 'specificSubject'] },
      { id: 'exam', promptKey: 'studyNotes.neet.step.exam', fields: ['targetExam', 'examYear', 'weightage', 'syllabusTopic'] },
      { id: 'content', promptKey: 'studyNotes.neet.step.content', fields: F.content },
      { id: 'keyPoints', promptKey: 'studyNotes.neet.step.keyPoints', fields: F.keyPts, isArray: true },
      { id: 'definitions', promptKey: 'studyNotes.neet.step.definitions', fields: F.defs, isArray: true },
      { id: 'bioProcesses', promptKey: 'studyNotes.neet.step.bioProcesses', fields: ['biologicalProcesses.name', 'biologicalProcesses.steps', 'biologicalProcesses.location', 'biologicalProcesses.inputs', 'biologicalProcesses.outputs', 'biologicalProcesses.significance'], isArray: true, optional: true },
      { id: 'taxonomy', promptKey: 'studyNotes.neet.step.taxonomy', fields: ['taxonomy.name', 'taxonomy.scientificName', 'taxonomy.kingdom', 'taxonomy.characteristics'], isArray: true, optional: true },
      { id: 'diseases', promptKey: 'studyNotes.neet.step.diseases', fields: ['diseases.name', 'diseases.causativeAgent', 'diseases.symptoms', 'diseases.transmission', 'diseases.prevention', 'diseases.treatment'], isArray: true, optional: true },
      { id: 'scientificNames', promptKey: 'studyNotes.neet.step.scientificNames', fields: ['scientificNames.term', 'scientificNames.meaning'], isArray: true, optional: true },
      { id: 'diagrams', promptKey: 'studyNotes.neet.step.diagrams', fields: F.diagrams, isArray: true },
      { id: 'pyq', promptKey: 'studyNotes.neet.step.pyq', fields: [...F.pyq, 'previousYearQuestions.correctAnswer', 'previousYearQuestions.explanation'], isArray: true },
      { id: 'revision', promptKey: 'studyNotes.neet.step.revision', fields: F.revision, isArray: true },
      { id: 'mnemonics', promptKey: 'studyNotes.neet.step.mnemonics', fields: ['mnemonics.topic', 'mnemonics.mnemonic', 'mnemonics.items'], isArray: true },
      { id: 'tips', promptKey: 'studyNotes.neet.step.tips', fields: F.tips, isArray: true },
      { id: 'refs', promptKey: 'studyNotes.neet.step.refs', fields: ['ncertReference', 'textbooks'], isArray: true }
    ]
  },
  [StudyNotesType.UPSC]: {
    type: 'upsc', templateId: 'study-notes-upsc', promptKeyPrefix: 'studyNotes.upsc', template: 'study-notes-upsc.hbs',
    steps: [
      { id: 'basic', promptKey: 'studyNotes.upsc.step.basic', fields: [...F.basic, 'specificSubject'] },
      { id: 'exam', promptKey: 'studyNotes.upsc.step.exam', fields: ['targetExam', 'examYear', 'syllabusTopic', 'weightage'] },
      { id: 'content', promptKey: 'studyNotes.upsc.step.content', fields: F.content },
      { id: 'keyPoints', promptKey: 'studyNotes.upsc.step.keyPoints', fields: F.keyPts, isArray: true },
      { id: 'definitions', promptKey: 'studyNotes.upsc.step.definitions', fields: ['definitions.term', 'definitions.meaning', 'definitions.hindiMeaning'], isArray: true },
      { id: 'timeline', promptKey: 'studyNotes.upsc.step.timeline', fields: ['timeline.year', 'timeline.event', 'timeline.description', 'timeline.significance'], isArray: true, optional: true },
      { id: 'figures', promptKey: 'studyNotes.upsc.step.figures', fields: ['historicalFigures.name', 'historicalFigures.lifespan', 'historicalFigures.title', 'historicalFigures.contributions', 'historicalFigures.famousFor'], isArray: true, optional: true },
      { id: 'events', promptKey: 'studyNotes.upsc.step.events', fields: ['events.name', 'events.date', 'events.description', 'events.causes', 'events.effects', 'events.significance'], isArray: true, optional: true },
      { id: 'amendments', promptKey: 'studyNotes.upsc.step.amendments', fields: ['amendments.number', 'amendments.year', 'amendments.description', 'amendments.significance'], isArray: true, optional: true },
      { id: 'articles', promptKey: 'studyNotes.upsc.step.articles', fields: ['articles.articleNumber', 'articles.title', 'articles.description', 'articles.part'], isArray: true, optional: true },
      { id: 'policies', promptKey: 'studyNotes.upsc.step.policies', fields: ['policies.name', 'policies.year', 'policies.objective', 'policies.features', 'policies.impact'], isArray: true, optional: true },
      { id: 'mapPoints', promptKey: 'studyNotes.upsc.step.mapPoints', fields: ['mapPoints.name', 'mapPoints.type', 'mapPoints.description', 'mapPoints.significance'], isArray: true, optional: true },
      { id: 'statistics', promptKey: 'studyNotes.upsc.step.statistics', fields: ['statistics.title', 'statistics.data', 'statistics.source', 'statistics.year'], isArray: true, optional: true },
      { id: 'comparison', promptKey: 'studyNotes.upsc.step.comparison', fields: ['comparisonTables.title', 'comparisonTables.items', 'comparisonTables.aspects'], isArray: true, optional: true },
      { id: 'pyq', promptKey: 'studyNotes.upsc.step.pyq', fields: F.pyq, isArray: true },
      { id: 'revision', promptKey: 'studyNotes.upsc.step.revision', fields: F.revision, isArray: true },
      { id: 'tips', promptKey: 'studyNotes.upsc.step.tips', fields: ['examTips', 'commonMistakes'], isArray: true },
      { id: 'refs', promptKey: 'studyNotes.upsc.step.refs', fields: ['textbooks', 'onlineResources', 'additionalReading'], isArray: true }
    ]
  }
};

// Wrapper functions
export const getStudyNotesForm = (type: string) => getForm(STUDY_NOTES_FORMS, type);
export const getStudyNotesStep = (type: string, stepId: string) => getStep(STUDY_NOTES_FORMS, type, stepId);
export const getStudyNotesFields = (type: string) => getFields(STUDY_NOTES_FORMS, type);
export const getStudyNotesArraySteps = (type: string) => getArraySteps(STUDY_NOTES_FORMS, type);
export const getStudyNotesTypes = () => Object.keys(STUDY_NOTES_FORMS);

// Auto-suggest study notes type
export const suggestStudyNotesType = (ctx: { targetExam?: string; subject?: string; educationLevel?: string; purpose?: string }): StudyNotesType => {
  if (ctx.targetExam) {
    const e = ctx.targetExam.toLowerCase();
    if (e.includes('jee')) return StudyNotesType.JEE;
    if (e.includes('neet')) return StudyNotesType.NEET;
    if (e.includes('upsc') || e.includes('ias')) return StudyNotesType.UPSC;
  }
  if (ctx.purpose?.toLowerCase().includes('revision')) return StudyNotesType.REVISION;
  if (ctx.purpose?.toLowerCase().includes('exam')) return StudyNotesType.EXAM_PREP;
  if (ctx.subject) {
    const s = ctx.subject.toLowerCase();
    if (['physics', 'chemistry', 'biology'].some(x => s.includes(x))) return StudyNotesType.SCIENCE;
    if (['maths', 'mathematics'].some(x => s.includes(x))) return StudyNotesType.MATHEMATICS;
    if (['history', 'geography', 'civics', 'economics'].some(x => s.includes(x))) return StudyNotesType.SOCIAL_SCIENCE;
    if (['english', 'hindi', 'sanskrit'].some(x => s.includes(x))) return StudyNotesType.LANGUAGE;
  }
  if (ctx.educationLevel) {
    const l = ctx.educationLevel.toLowerCase();
    if (['primary', 'class 1', 'class 2', 'class 3', 'class 4', 'class 5'].some(x => l.includes(x))) return StudyNotesType.PRIMARY;
    if (['middle', 'class 6', 'class 7', 'class 8'].some(x => l.includes(x))) return StudyNotesType.MIDDLE;
    if (['class 9', 'class 10'].some(x => l.includes(x))) return StudyNotesType.SECONDARY;
    if (['class 11', 'class 12'].some(x => l.includes(x))) return StudyNotesType.HIGHER_SECONDARY;
  }
  return StudyNotesType.SECONDARY;
};