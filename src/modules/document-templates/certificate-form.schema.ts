/**
 * SORIVA - Certificate Form Schema (Lean)
 * Synced with: certificate-fields.config.ts
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getArraySteps } from './form-schema.helpers';

export enum CertificateType {
  ACHIEVEMENT = 'achievement',
  APPRECIATION = 'appreciation',
  COMPLETION = 'completion',
  PARTICIPATION = 'participation',
  MERIT = 'merit',
  EXPERIENCE = 'experience',
  MEMBERSHIP = 'membership',
  TRAINING = 'training'
}

// Reusable field arrays
const F = {
  recipient: ['recipientName', 'recipientTitle'],
  recipientFull: ['recipientName', 'recipientTitle', 'recipientDesignation', 'recipientOrganization'],
  recipientStudent: ['recipientName', 'recipientTitle', 'rollNumber', 'class', 'section'],
  recipientEmployee: ['recipientName', 'recipientTitle', 'employeeId', 'department'],
  org: ['organizationName', 'organizationLogo', 'organizationAddress'],
  orgFull: ['organizationName', 'organizationLogo', 'organizationAddress', 'organizationWebsite'],
  content: ['presentationText', 'description'],
  signatory: ['primarySignatory.name', 'primarySignatory.designation', 'primarySignatory.signature', 'primarySignatory.position'],
  dualSignatory: ['primarySignatory.name', 'primarySignatory.designation', 'secondarySignatory.name', 'secondarySignatory.designation'],
  styling: ['accentColor', 'secondaryColor', 'borderStyle', 'orientation', 'showLogo', 'showSeal', 'showBorder'],
  verification: ['verificationUrl', 'verificationCode', 'qrCode', 'showQR']
};

export const CERTIFICATE_FORMS: Record<string, BaseFormSchema> = {
  [CertificateType.ACHIEVEMENT]: {
    type: 'achievement', templateId: 'certificate-achievement', promptKeyPrefix: 'certificate.achievement', template: 'certificate-achievement.hbs',
    steps: [
      { id: 'metadata', promptKey: 'certificate.achievement.step.metadata', fields: ['certificateTitle', 'subtitle', 'certificateNumber'] },
      { id: 'recipient', promptKey: 'certificate.achievement.step.recipient', fields: [...F.recipientStudent] },
      { id: 'organization', promptKey: 'certificate.achievement.step.organization', fields: [...F.org] },
      { id: 'achievement', promptKey: 'certificate.achievement.step.achievement', fields: ['achievement.title', 'achievement.rank', 'achievement.score', 'achievement.category', 'achievement.competition', 'achievement.level'] },
      { id: 'content', promptKey: 'certificate.achievement.step.content', fields: [...F.content, 'achievementText'] },
      { id: 'date', promptKey: 'certificate.achievement.step.date', fields: ['issueDate'] },
      { id: 'signatories', promptKey: 'certificate.achievement.step.signatories', fields: [...F.dualSignatory] },
      { id: 'styling', promptKey: 'certificate.achievement.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [CertificateType.APPRECIATION]: {
    type: 'appreciation', templateId: 'certificate-appreciation', promptKeyPrefix: 'certificate.appreciation', template: 'certificate-appreciation.hbs',
    steps: [
      { id: 'metadata', promptKey: 'certificate.appreciation.step.metadata', fields: ['certificateTitle', 'subtitle', 'certificateNumber'] },
      { id: 'recipient', promptKey: 'certificate.appreciation.step.recipient', fields: [...F.recipientFull] },
      { id: 'organization', promptKey: 'certificate.appreciation.step.organization', fields: [...F.org] },
      { id: 'content', promptKey: 'certificate.appreciation.step.content', fields: [...F.content, 'reasonForAward'] },
      { id: 'date', promptKey: 'certificate.appreciation.step.date', fields: ['issueDate'] },
      { id: 'signatories', promptKey: 'certificate.appreciation.step.signatories', fields: [...F.signatory] },
      { id: 'styling', promptKey: 'certificate.appreciation.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [CertificateType.COMPLETION]: {
    type: 'completion', templateId: 'certificate-completion', promptKeyPrefix: 'certificate.completion', template: 'certificate-completion.hbs',
    steps: [
      { id: 'metadata', promptKey: 'certificate.completion.step.metadata', fields: ['certificateTitle', 'subtitle', 'certificateNumber'] },
      { id: 'recipient', promptKey: 'certificate.completion.step.recipient', fields: [...F.recipient] },
      { id: 'organization', promptKey: 'certificate.completion.step.organization', fields: [...F.orgFull] },
      { id: 'course', promptKey: 'certificate.completion.step.course', fields: ['course.courseName', 'course.courseCode', 'course.duration', 'course.startDate', 'course.endDate'] },
      { id: 'assessment', promptKey: 'certificate.completion.step.assessment', fields: ['course.grade', 'course.percentage', 'course.credits'], optional: true },
      { id: 'skills', promptKey: 'certificate.completion.step.skills', fields: ['course.skills', 'course.modules'], isArray: true, optional: true },
      { id: 'content', promptKey: 'certificate.completion.step.content', fields: [...F.content] },
      { id: 'date', promptKey: 'certificate.completion.step.date', fields: ['issueDate'] },
      { id: 'verification', promptKey: 'certificate.completion.step.verification', fields: [...F.verification], optional: true },
      { id: 'signatories', promptKey: 'certificate.completion.step.signatories', fields: [...F.signatory] },
      { id: 'styling', promptKey: 'certificate.completion.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [CertificateType.PARTICIPATION]: {
    type: 'participation', templateId: 'certificate-participation', promptKeyPrefix: 'certificate.participation', template: 'certificate-participation.hbs',
    steps: [
      { id: 'metadata', promptKey: 'certificate.participation.step.metadata', fields: ['certificateTitle', 'subtitle', 'certificateNumber'] },
      { id: 'recipient', promptKey: 'certificate.participation.step.recipient', fields: [...F.recipientStudent] },
      { id: 'organization', promptKey: 'certificate.participation.step.organization', fields: [...F.org] },
      { id: 'event', promptKey: 'certificate.participation.step.event', fields: ['event.eventName', 'event.eventType', 'event.venue', 'event.date', 'event.duration', 'event.organizer'] },
      { id: 'content', promptKey: 'certificate.participation.step.content', fields: [...F.content] },
      { id: 'date', promptKey: 'certificate.participation.step.date', fields: ['issueDate'] },
      { id: 'signatories', promptKey: 'certificate.participation.step.signatories', fields: [...F.dualSignatory] },
      { id: 'styling', promptKey: 'certificate.participation.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [CertificateType.MERIT]: {
    type: 'merit', templateId: 'certificate-merit', promptKeyPrefix: 'certificate.merit', template: 'certificate-merit.hbs',
    steps: [
      { id: 'metadata', promptKey: 'certificate.merit.step.metadata', fields: ['certificateTitle', 'certificateTitleHindi', 'subtitle', 'certificateNumber'] },
      { id: 'recipient', promptKey: 'certificate.merit.step.recipient', fields: ['recipientName', 'recipientNameHindi', 'recipientTitle', 'rollNumber', 'class', 'section'] },
      { id: 'organization', promptKey: 'certificate.merit.step.organization', fields: ['organizationName', 'organizationNameHindi', 'organizationLogo', 'organizationAddress'] },
      { id: 'achievement', promptKey: 'certificate.merit.step.achievement', fields: ['achievement.title', 'achievement.rank', 'achievement.score', 'achievement.category', 'achievement.level'] },
      { id: 'content', promptKey: 'certificate.merit.step.content', fields: [...F.content] },
      { id: 'date', promptKey: 'certificate.merit.step.date', fields: ['issueDate', 'issueDateHindi'] },
      { id: 'signatories', promptKey: 'certificate.merit.step.signatories', fields: [...F.signatory] },
      { id: 'styling', promptKey: 'certificate.merit.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [CertificateType.EXPERIENCE]: {
    type: 'experience', templateId: 'certificate-experience', promptKeyPrefix: 'certificate.experience', template: 'certificate-experience.hbs',
    steps: [
      { id: 'metadata', promptKey: 'certificate.experience.step.metadata', fields: ['certificateTitle', 'certificateNumber'] },
      { id: 'recipient', promptKey: 'certificate.experience.step.recipient', fields: [...F.recipientEmployee] },
      { id: 'organization', promptKey: 'certificate.experience.step.organization', fields: [...F.orgFull] },
      { id: 'experience', promptKey: 'certificate.experience.step.experience', fields: ['experience.position', 'experience.department', 'experience.startDate', 'experience.endDate', 'experience.duration'] },
      { id: 'responsibilities', promptKey: 'certificate.experience.step.responsibilities', fields: ['experience.responsibilities'], isArray: true, optional: true },
      { id: 'performance', promptKey: 'certificate.experience.step.performance', fields: ['experience.performance'], optional: true },
      { id: 'content', promptKey: 'certificate.experience.step.content', fields: [...F.content] },
      { id: 'date', promptKey: 'certificate.experience.step.date', fields: ['issueDate'] },
      { id: 'signatories', promptKey: 'certificate.experience.step.signatories', fields: [...F.dualSignatory] },
      { id: 'styling', promptKey: 'certificate.experience.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [CertificateType.MEMBERSHIP]: {
    type: 'membership', templateId: 'certificate-membership', promptKeyPrefix: 'certificate.membership', template: 'certificate-membership.hbs',
    steps: [
      { id: 'metadata', promptKey: 'certificate.membership.step.metadata', fields: ['certificateTitle', 'certificateNumber'] },
      { id: 'recipient', promptKey: 'certificate.membership.step.recipient', fields: [...F.recipientFull] },
      { id: 'organization', promptKey: 'certificate.membership.step.organization', fields: [...F.orgFull] },
      { id: 'membership', promptKey: 'certificate.membership.step.membership', fields: ['membership.membershipType', 'membership.memberId', 'membership.validFrom', 'membership.validUntil'] },
      { id: 'benefits', promptKey: 'certificate.membership.step.benefits', fields: ['membership.benefits'], isArray: true, optional: true },
      { id: 'content', promptKey: 'certificate.membership.step.content', fields: [...F.content] },
      { id: 'date', promptKey: 'certificate.membership.step.date', fields: ['issueDate'] },
      { id: 'verification', promptKey: 'certificate.membership.step.verification', fields: [...F.verification], optional: true },
      { id: 'signatories', promptKey: 'certificate.membership.step.signatories', fields: [...F.dualSignatory] },
      { id: 'styling', promptKey: 'certificate.membership.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [CertificateType.TRAINING]: {
    type: 'training', templateId: 'certificate-training', promptKeyPrefix: 'certificate.training', template: 'certificate-training.hbs',
    steps: [
      { id: 'metadata', promptKey: 'certificate.training.step.metadata', fields: ['certificateTitle', 'subtitle', 'certificateNumber'] },
      { id: 'recipient', promptKey: 'certificate.training.step.recipient', fields: [...F.recipientEmployee] },
      { id: 'organization', promptKey: 'certificate.training.step.organization', fields: [...F.orgFull] },
      { id: 'course', promptKey: 'certificate.training.step.course', fields: ['course.courseName', 'course.courseCode', 'course.duration', 'course.startDate', 'course.endDate'] },
      { id: 'assessment', promptKey: 'certificate.training.step.assessment', fields: ['course.grade', 'course.percentage'], optional: true },
      { id: 'skills', promptKey: 'certificate.training.step.skills', fields: ['course.skills'], isArray: true, optional: true },
      { id: 'content', promptKey: 'certificate.training.step.content', fields: [...F.content] },
      { id: 'date', promptKey: 'certificate.training.step.date', fields: ['issueDate'] },
      { id: 'verification', promptKey: 'certificate.training.step.verification', fields: [...F.verification], optional: true },
      { id: 'signatories', promptKey: 'certificate.training.step.signatories', fields: [...F.signatory] },
      { id: 'styling', promptKey: 'certificate.training.step.styling', fields: [...F.styling], optional: true }
    ]
  }
};

// Wrapper functions
export const getCertificateForm = (type: string) => getForm(CERTIFICATE_FORMS, type);
export const getCertificateStep = (type: string, stepId: string) => getStep(CERTIFICATE_FORMS, type, stepId);
export const getCertificateFields = (type: string) => getFields(CERTIFICATE_FORMS, type);
export const getCertificateArraySteps = (type: string) => getArraySteps(CERTIFICATE_FORMS, type);
export const getCertificateTypes = () => Object.keys(CERTIFICATE_FORMS);

// Auto-suggest certificate type
export const suggestCertificateType = (ctx: {
  isAward?: boolean;
  isThankYou?: boolean;
  isCourse?: boolean;
  isEvent?: boolean;
  isAcademic?: boolean;
  isWork?: boolean;
  isClub?: boolean;
  isTraining?: boolean;
  keywords?: string[];
}): CertificateType => {
  if (ctx.isAward) return CertificateType.ACHIEVEMENT;
  if (ctx.isThankYou) return CertificateType.APPRECIATION;
  if (ctx.isCourse) return CertificateType.COMPLETION;
  if (ctx.isEvent) return CertificateType.PARTICIPATION;
  if (ctx.isAcademic) return CertificateType.MERIT;
  if (ctx.isWork) return CertificateType.EXPERIENCE;
  if (ctx.isClub) return CertificateType.MEMBERSHIP;
  if (ctx.isTraining) return CertificateType.TRAINING;
  
  // Keyword-based detection
  if (ctx.keywords) {
    const kw = ctx.keywords.map(k => k.toLowerCase());
    if (kw.some(k => ['award', 'winner', 'prize', 'competition'].includes(k))) return CertificateType.ACHIEVEMENT;
    if (kw.some(k => ['thank', 'appreciation', 'grateful', 'recognize'].includes(k))) return CertificateType.APPRECIATION;
    if (kw.some(k => ['course', 'completed', 'program', 'bootcamp'].includes(k))) return CertificateType.COMPLETION;
    if (kw.some(k => ['event', 'workshop', 'seminar', 'conference', 'participated'].includes(k))) return CertificateType.PARTICIPATION;
    if (kw.some(k => ['merit', 'topper', 'excellence', 'academic'].includes(k))) return CertificateType.MERIT;
    if (kw.some(k => ['experience', 'employment', 'internship', 'worked'].includes(k))) return CertificateType.EXPERIENCE;
    if (kw.some(k => ['member', 'membership', 'club', 'association'].includes(k))) return CertificateType.MEMBERSHIP;
    if (kw.some(k => ['training', 'skill', 'professional', 'certified'].includes(k))) return CertificateType.TRAINING;
  }
  
  return CertificateType.ACHIEVEMENT; // Default
};