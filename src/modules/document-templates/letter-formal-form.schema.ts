/**
 * SORIVA - Letter Formal Form Schema (Lean)
 * Synced with: letter-formal-fields.config.ts
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getOptionalSteps } from './form-schema.helpers';

export enum LetterFormalType {
  PROFESSIONAL = 'professional',
  COVER = 'cover',
  RECOMMENDATION = 'recommendation',
  RESIGNATION = 'resignation',
  REFERENCE = 'reference',
  PERSONAL = 'personal'
}

// Reusable field arrays
const F = {
  meta: ['templateType', 'letterFormat', 'letterDate', 'referenceNumber'],
  sender: ['senderName', 'senderDesignation', 'senderCompany', 'senderDepartment', 'senderAddress', 'senderCity', 'senderState', 'senderPincode', 'senderEmail', 'senderPhone'],
  recipient: ['recipientName', 'recipientDesignation', 'recipientCompany', 'recipientDepartment', 'recipientAddress', 'recipientCity', 'recipientState', 'recipientPincode'],
  content: ['salutation', 'subject', 'letterBody', 'closing'],
  signature: ['includeSignature', 'signatureImage', 'letterhead', 'companyLogo', 'accentColor']
};

export const LETTER_FORMAL_FORMS: Record<string, BaseFormSchema> = {
  [LetterFormalType.PROFESSIONAL]: {
    type: 'professional', templateId: 'letter-formal-professional', promptKeyPrefix: 'letterFormal.professional', template: 'letter-formal-professional.hbs',
    steps: [
      { id: 'meta', promptKey: 'letterFormal.professional.step.meta', fields: F.meta },
      { id: 'sender', promptKey: 'letterFormal.professional.step.sender', fields: F.sender },
      { id: 'recipient', promptKey: 'letterFormal.professional.step.recipient', fields: F.recipient },
      { id: 'letterInfo', promptKey: 'letterFormal.professional.step.letterInfo', fields: ['professional.letterType', 'professional.purpose', 'professional.inResponseTo'] },
      { id: 'content', promptKey: 'letterFormal.professional.step.content', fields: F.content },
      { id: 'details', promptKey: 'letterFormal.professional.step.details', fields: ['professional.keyPoints', 'professional.actionRequired', 'professional.deadline'], optional: true },
      { id: 'attachments', promptKey: 'letterFormal.professional.step.attachments', fields: ['professional.attachments'], optional: true },
      { id: 'signature', promptKey: 'letterFormal.professional.step.signature', fields: F.signature, optional: true }
    ]
  },
  [LetterFormalType.COVER]: {
    type: 'cover', templateId: 'letter-formal-cover', promptKeyPrefix: 'letterFormal.cover', template: 'letter-formal-cover.hbs',
    steps: [
      { id: 'meta', promptKey: 'letterFormal.cover.step.meta', fields: ['templateType', 'letterFormat', 'letterDate'] },
      { id: 'sender', promptKey: 'letterFormal.cover.step.sender', fields: F.sender },
      { id: 'recipient', promptKey: 'letterFormal.cover.step.recipient', fields: F.recipient },
      { id: 'jobInfo', promptKey: 'letterFormal.cover.step.jobInfo', fields: ['cover.coverType', 'cover.jobTitle', 'cover.jobReference', 'cover.companyName', 'cover.whereFound', 'cover.referrerName'] },
      { id: 'profile', promptKey: 'letterFormal.cover.step.profile', fields: ['cover.currentRole', 'cover.yearsExperience', 'cover.keySkills'] },
      { id: 'pitch', promptKey: 'letterFormal.cover.step.pitch', fields: ['cover.achievements', 'cover.whyCompany', 'cover.whyYou'] },
      { id: 'availability', promptKey: 'letterFormal.cover.step.availability', fields: ['cover.availability', 'cover.salaryExpectation', 'cover.portfolioUrl', 'cover.linkedinUrl'], optional: true },
      { id: 'content', promptKey: 'letterFormal.cover.step.content', fields: ['salutation', 'closing'] },
      { id: 'signature', promptKey: 'letterFormal.cover.step.signature', fields: ['includeSignature', 'accentColor'], optional: true }
    ]
  },
  [LetterFormalType.RECOMMENDATION]: {
    type: 'recommendation', templateId: 'letter-formal-recommendation', promptKeyPrefix: 'letterFormal.recommendation', template: 'letter-formal-recommendation.hbs',
    steps: [
      { id: 'meta', promptKey: 'letterFormal.recommendation.step.meta', fields: ['templateType', 'letterFormat', 'letterDate'] },
      { id: 'sender', promptKey: 'letterFormal.recommendation.step.sender', fields: F.sender },
      { id: 'recipient', promptKey: 'letterFormal.recommendation.step.recipient', fields: F.recipient },
      { id: 'candidateInfo', promptKey: 'letterFormal.recommendation.step.candidateInfo', fields: ['recommendation.recommendationType', 'recommendation.candidateName', 'recommendation.candidateRole', 'recommendation.targetPosition', 'recommendation.targetInstitution'] },
      { id: 'relationship', promptKey: 'letterFormal.recommendation.step.relationship', fields: ['recommendation.relationship', 'recommendation.knowingSince', 'recommendation.context'] },
      { id: 'assessment', promptKey: 'letterFormal.recommendation.step.assessment', fields: ['recommendation.skills', 'recommendation.achievements', 'recommendation.personalQualities', 'recommendation.specificExamples'] },
      { id: 'recommendation', promptKey: 'letterFormal.recommendation.step.recommendation', fields: ['recommendation.comparativeAssessment', 'recommendation.areasOfImprovement', 'recommendation.recommendationStrength'] },
      { id: 'content', promptKey: 'letterFormal.recommendation.step.content', fields: ['salutation', 'subject', 'closing'] },
      { id: 'signature', promptKey: 'letterFormal.recommendation.step.signature', fields: F.signature, optional: true }
    ]
  },
  [LetterFormalType.RESIGNATION]: {
    type: 'resignation', templateId: 'letter-formal-resignation', promptKeyPrefix: 'letterFormal.resignation', template: 'letter-formal-resignation.hbs',
    steps: [
      { id: 'meta', promptKey: 'letterFormal.resignation.step.meta', fields: ['templateType', 'letterFormat', 'letterDate'] },
      { id: 'sender', promptKey: 'letterFormal.resignation.step.sender', fields: ['senderName', 'senderEmail', 'senderPhone', 'senderAddress'] },
      { id: 'recipient', promptKey: 'letterFormal.resignation.step.recipient', fields: ['recipientName', 'recipientDesignation', 'recipientCompany', 'recipientDepartment'] },
      { id: 'resignationInfo', promptKey: 'letterFormal.resignation.step.resignationInfo', fields: ['resignation.resignationType', 'resignation.currentPosition', 'resignation.department', 'resignation.joiningDate'] },
      { id: 'dates', promptKey: 'letterFormal.resignation.step.dates', fields: ['resignation.lastWorkingDate', 'resignation.noticePeriod'] },
      { id: 'reason', promptKey: 'letterFormal.resignation.step.reason', fields: ['resignation.reasonForLeaving', 'resignation.gratitudePoints'] },
      { id: 'transition', promptKey: 'letterFormal.resignation.step.transition', fields: ['resignation.transitionPlan', 'resignation.handoverNotes', 'resignation.exitInterviewAvailability'], optional: true },
      { id: 'settlement', promptKey: 'letterFormal.resignation.step.settlement', fields: ['resignation.returnableItems', 'resignation.pendingMatters', 'resignation.forwardingAddress'], optional: true },
      { id: 'content', promptKey: 'letterFormal.resignation.step.content', fields: ['salutation', 'subject', 'closing'] },
      { id: 'signature', promptKey: 'letterFormal.resignation.step.signature', fields: ['includeSignature', 'accentColor'], optional: true }
    ]
  },
  [LetterFormalType.REFERENCE]: {
    type: 'reference', templateId: 'letter-formal-reference', promptKeyPrefix: 'letterFormal.reference', template: 'letter-formal-reference.hbs',
    steps: [
      { id: 'meta', promptKey: 'letterFormal.reference.step.meta', fields: ['templateType', 'letterFormat', 'letterDate'] },
      { id: 'sender', promptKey: 'letterFormal.reference.step.sender', fields: F.sender },
      { id: 'recipient', promptKey: 'letterFormal.reference.step.recipient', fields: F.recipient },
      { id: 'personInfo', promptKey: 'letterFormal.reference.step.personInfo', fields: ['reference.referenceType', 'reference.personName', 'reference.personRole', 'reference.purposeOfReference'] },
      { id: 'relationship', promptKey: 'letterFormal.reference.step.relationship', fields: ['reference.relationship', 'reference.knowingDuration', 'reference.context'] },
      { id: 'assessment', promptKey: 'letterFormal.reference.step.assessment', fields: ['reference.characterTraits', 'reference.professionalSkills', 'reference.specificExamples', 'reference.reliability'] },
      { id: 'recommendation', promptKey: 'letterFormal.reference.step.recommendation', fields: ['reference.recommendation', 'reference.contactPermission'] },
      { id: 'content', promptKey: 'letterFormal.reference.step.content', fields: ['salutation', 'subject', 'closing'] },
      { id: 'signature', promptKey: 'letterFormal.reference.step.signature', fields: F.signature, optional: true }
    ]
  },
  [LetterFormalType.PERSONAL]: {
    type: 'personal', templateId: 'letter-formal-personal', promptKeyPrefix: 'letterFormal.personal', template: 'letter-formal-personal.hbs',
    steps: [
      { id: 'meta', promptKey: 'letterFormal.personal.step.meta', fields: ['templateType', 'letterFormat', 'letterDate'] },
      { id: 'sender', promptKey: 'letterFormal.personal.step.sender', fields: ['senderName', 'senderAddress', 'senderCity', 'senderState', 'senderPincode', 'senderEmail', 'senderPhone'] },
      { id: 'recipient', promptKey: 'letterFormal.personal.step.recipient', fields: ['recipientName', 'recipientAddress', 'recipientCity', 'recipientState', 'recipientPincode'] },
      { id: 'occasionInfo', promptKey: 'letterFormal.personal.step.occasionInfo', fields: ['personal.personalType', 'personal.occasion', 'personal.occasionDate', 'personal.relationship'] },
      { id: 'sentiments', promptKey: 'letterFormal.personal.step.sentiments', fields: ['personal.sharedMemory', 'personal.sentiments'] },
      { id: 'wishes', promptKey: 'letterFormal.personal.step.wishes', fields: ['personal.futureWishes', 'personal.offerOfSupport'], optional: true },
      { id: 'content', promptKey: 'letterFormal.personal.step.content', fields: ['salutation', 'closing'] },
      { id: 'signature', promptKey: 'letterFormal.personal.step.signature', fields: ['includeSignature', 'accentColor'], optional: true }
    ]
  }
};

// Wrapper functions
export const getLetterFormalForm = (type: string) => getForm(LETTER_FORMAL_FORMS, type);
export const getLetterFormalStep = (type: string, stepId: string) => getStep(LETTER_FORMAL_FORMS, type, stepId);
export const getLetterFormalFields = (type: string) => getFields(LETTER_FORMAL_FORMS, type);
export const getLetterFormalTypes = () => Object.keys(LETTER_FORMAL_FORMS);

// Auto-suggest letter type
export const suggestLetterFormalType = (ctx: { isJobApplication?: boolean; isRecommendation?: boolean; isResignation?: boolean; isReference?: boolean; isPersonal?: boolean }): LetterFormalType => {
  if (ctx.isJobApplication) return LetterFormalType.COVER;
  if (ctx.isRecommendation) return LetterFormalType.RECOMMENDATION;
  if (ctx.isResignation) return LetterFormalType.RESIGNATION;
  if (ctx.isReference) return LetterFormalType.REFERENCE;
  if (ctx.isPersonal) return LetterFormalType.PERSONAL;
  return LetterFormalType.PROFESSIONAL;
};