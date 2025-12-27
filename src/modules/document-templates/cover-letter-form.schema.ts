/**
 * SORIVA - Cover Letter Form Schema (Lean)
 * Synced with: cover-letter-fields.config.ts
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getOptionalSteps } from './form-schema.helpers';

export enum CoverLetterType {
  STANDARD = 'standard',
  FRESHER = 'fresher',
  EXPERIENCED = 'experienced',
  EXECUTIVE = 'executive',
  INTERNATIONAL = 'international',
  REFERRAL = 'referral',
  CAREER_CHANGE = 'career-change'
}

export const COVER_LETTER_FORMS: Record<string, BaseFormSchema> = {
  [CoverLetterType.STANDARD]: {
    type: 'standard', templateId: 'cover-letter-standard', promptKeyPrefix: 'coverLetter.standard', template: 'cover-letter-standard.hbs',
    steps: [
      { id: 'personal', promptKey: 'coverLetter.standard.step.personal', fields: ['fullName', 'email', 'phone', 'location', 'linkedIn'] },
      { id: 'recipient', promptKey: 'coverLetter.standard.step.recipient', fields: ['hiringManager', 'hiringManagerTitle', 'companyName', 'companyAddress'] },
      { id: 'job', promptKey: 'coverLetter.standard.step.job', fields: ['jobTitle', 'jobReference', 'jobSource'] },
      { id: 'opening', promptKey: 'coverLetter.standard.step.opening', fields: ['openingParagraph'] },
      { id: 'body', promptKey: 'coverLetter.standard.step.body', fields: ['relevantExperience', 'keyAchievements', 'whyCompany'], isArray: true },
      { id: 'closing', promptKey: 'coverLetter.standard.step.closing', fields: ['closingParagraph', 'callToAction'] },
      { id: 'settings', promptKey: 'coverLetter.standard.step.settings', fields: ['tone', 'accentColor'], optional: true }
    ]
  },
  [CoverLetterType.FRESHER]: {
    type: 'fresher', templateId: 'cover-letter-fresher', promptKeyPrefix: 'coverLetter.fresher', template: 'cover-letter-fresher.hbs',
    steps: [
      { id: 'personal', promptKey: 'coverLetter.fresher.step.personal', fields: ['fullName', 'email', 'phone', 'location'] },
      { id: 'recipient', promptKey: 'coverLetter.fresher.step.recipient', fields: ['hiringManager', 'companyName', 'companyAddress'] },
      { id: 'job', promptKey: 'coverLetter.fresher.step.job', fields: ['jobTitle', 'jobReference'] },
      { id: 'opening', promptKey: 'coverLetter.fresher.step.opening', fields: ['openingParagraph', 'enthusiasm'] },
      { id: 'education', promptKey: 'coverLetter.fresher.step.education', fields: ['degree', 'institution', 'relevantCoursework', 'academicAchievements'], isArray: true },
      { id: 'skills', promptKey: 'coverLetter.fresher.step.skills', fields: ['relevantSkills', 'projects', 'internships'], isArray: true },
      { id: 'closing', promptKey: 'coverLetter.fresher.step.closing', fields: ['closingParagraph', 'availability', 'callToAction'] }
    ]
  },
  [CoverLetterType.EXPERIENCED]: {
    type: 'experienced', templateId: 'cover-letter-experienced', promptKeyPrefix: 'coverLetter.experienced', template: 'cover-letter-experienced.hbs',
    steps: [
      { id: 'personal', promptKey: 'coverLetter.experienced.step.personal', fields: ['fullName', 'email', 'phone', 'location', 'linkedIn'] },
      { id: 'recipient', promptKey: 'coverLetter.experienced.step.recipient', fields: ['hiringManager', 'hiringManagerTitle', 'companyName'] },
      { id: 'job', promptKey: 'coverLetter.experienced.step.job', fields: ['jobTitle', 'jobReference'] },
      { id: 'opening', promptKey: 'coverLetter.experienced.step.opening', fields: ['openingParagraph', 'yearsExperience', 'currentRole'] },
      { id: 'achievements', promptKey: 'coverLetter.experienced.step.achievements', fields: ['keyAchievements', 'metrics', 'impact'], isArray: true },
      { id: 'relevance', promptKey: 'coverLetter.experienced.step.relevance', fields: ['relevantExperience', 'transferableSkills', 'industryKnowledge'] },
      { id: 'closing', promptKey: 'coverLetter.experienced.step.closing', fields: ['closingParagraph', 'noticePeriod', 'expectedSalary', 'callToAction'], optional: true }
    ]
  },
  [CoverLetterType.EXECUTIVE]: {
    type: 'executive', templateId: 'cover-letter-executive', promptKeyPrefix: 'coverLetter.executive', template: 'cover-letter-executive.hbs',
    steps: [
      { id: 'personal', promptKey: 'coverLetter.executive.step.personal', fields: ['fullName', 'email', 'phone', 'linkedIn'] },
      { id: 'recipient', promptKey: 'coverLetter.executive.step.recipient', fields: ['hiringManager', 'hiringManagerTitle', 'companyName'] },
      { id: 'job', promptKey: 'coverLetter.executive.step.job', fields: ['jobTitle', 'jobReference'] },
      { id: 'opening', promptKey: 'coverLetter.executive.step.opening', fields: ['openingParagraph', 'executiveSummary'] },
      { id: 'leadership', promptKey: 'coverLetter.executive.step.leadership', fields: ['leadershipExperience', 'teamSize', 'budgetManaged', 'strategicInitiatives'], isArray: true },
      { id: 'achievements', promptKey: 'coverLetter.executive.step.achievements', fields: ['keyAchievements', 'businessImpact', 'revenueGrowth', 'costSavings'], isArray: true },
      { id: 'vision', promptKey: 'coverLetter.executive.step.vision', fields: ['strategicVision', 'valueProposition'] },
      { id: 'closing', promptKey: 'coverLetter.executive.step.closing', fields: ['closingParagraph', 'callToAction'] }
    ]
  },
  [CoverLetterType.INTERNATIONAL]: {
    type: 'international', templateId: 'cover-letter-international', promptKeyPrefix: 'coverLetter.international', template: 'cover-letter-international.hbs',
    steps: [
      { id: 'personal', promptKey: 'coverLetter.international.step.personal', fields: ['fullName', 'email', 'phone', 'currentLocation', 'nationality', 'linkedIn'] },
      { id: 'recipient', promptKey: 'coverLetter.international.step.recipient', fields: ['hiringManager', 'companyName', 'companyLocation', 'country'] },
      { id: 'job', promptKey: 'coverLetter.international.step.job', fields: ['jobTitle', 'jobReference'] },
      { id: 'opening', promptKey: 'coverLetter.international.step.opening', fields: ['openingParagraph'] },
      { id: 'experience', promptKey: 'coverLetter.international.step.experience', fields: ['relevantExperience', 'internationalExperience', 'crossCulturalSkills'], isArray: true },
      { id: 'relocation', promptKey: 'coverLetter.international.step.relocation', fields: ['visaStatus', 'workAuthorization', 'relocationTimeline', 'languageProficiency'], isArray: true },
      { id: 'closing', promptKey: 'coverLetter.international.step.closing', fields: ['closingParagraph', 'availability', 'callToAction'] }
    ]
  },
  [CoverLetterType.REFERRAL]: {
    type: 'referral', templateId: 'cover-letter-referral', promptKeyPrefix: 'coverLetter.referral', template: 'cover-letter-referral.hbs',
    steps: [
      { id: 'personal', promptKey: 'coverLetter.referral.step.personal', fields: ['fullName', 'email', 'phone', 'linkedIn'] },
      { id: 'recipient', promptKey: 'coverLetter.referral.step.recipient', fields: ['hiringManager', 'companyName'] },
      { id: 'job', promptKey: 'coverLetter.referral.step.job', fields: ['jobTitle', 'jobReference'] },
      { id: 'referral', promptKey: 'coverLetter.referral.step.referral', fields: ['referrerName', 'referrerTitle', 'referrerRelationship', 'referrerDepartment'] },
      { id: 'opening', promptKey: 'coverLetter.referral.step.opening', fields: ['openingParagraph'] },
      { id: 'body', promptKey: 'coverLetter.referral.step.body', fields: ['relevantExperience', 'keyAchievements', 'whyCompany'], isArray: true },
      { id: 'closing', promptKey: 'coverLetter.referral.step.closing', fields: ['closingParagraph', 'callToAction'] }
    ]
  },
  [CoverLetterType.CAREER_CHANGE]: {
    type: 'career-change', templateId: 'cover-letter-career-change', promptKeyPrefix: 'coverLetter.careerChange', template: 'cover-letter-career-change.hbs',
    steps: [
      { id: 'personal', promptKey: 'coverLetter.careerChange.step.personal', fields: ['fullName', 'email', 'phone', 'linkedIn'] },
      { id: 'recipient', promptKey: 'coverLetter.careerChange.step.recipient', fields: ['hiringManager', 'companyName'] },
      { id: 'job', promptKey: 'coverLetter.careerChange.step.job', fields: ['jobTitle', 'jobReference'] },
      { id: 'opening', promptKey: 'coverLetter.careerChange.step.opening', fields: ['openingParagraph', 'careerChangeReason'] },
      { id: 'transferable', promptKey: 'coverLetter.careerChange.step.transferable', fields: ['transferableSkills', 'relevantAchievements', 'previousIndustry', 'targetIndustry'], isArray: true },
      { id: 'preparation', promptKey: 'coverLetter.careerChange.step.preparation', fields: ['relevantCourses', 'certifications', 'selfLearning', 'volunteerWork'], isArray: true, optional: true },
      { id: 'closing', promptKey: 'coverLetter.careerChange.step.closing', fields: ['closingParagraph', 'enthusiasm', 'callToAction'] }
    ]
  }
};

// Wrapper functions
export const getCoverLetterForm = (type: string) => getForm(COVER_LETTER_FORMS, type);
export const getCoverLetterStep = (type: string, stepId: string) => getStep(COVER_LETTER_FORMS, type, stepId);
export const getCoverLetterFields = (type: string) => getFields(COVER_LETTER_FORMS, type);
export const getCoverLetterTypes = () => Object.keys(COVER_LETTER_FORMS);

// Auto-suggest cover letter type
export const suggestCoverLetterType = (ctx: { yearsExp?: number; isReferral?: boolean; isCareerChange?: boolean; isInternational?: boolean; isExecutive?: boolean }): CoverLetterType => {
  if (ctx.isReferral) return CoverLetterType.REFERRAL;
  if (ctx.isCareerChange) return CoverLetterType.CAREER_CHANGE;
  if (ctx.isInternational) return CoverLetterType.INTERNATIONAL;
  if (ctx.isExecutive || (ctx.yearsExp && ctx.yearsExp >= 15)) return CoverLetterType.EXECUTIVE;
  if (ctx.yearsExp && ctx.yearsExp >= 3) return CoverLetterType.EXPERIENCED;
  if (ctx.yearsExp === 0) return CoverLetterType.FRESHER;
  return CoverLetterType.STANDARD;
};