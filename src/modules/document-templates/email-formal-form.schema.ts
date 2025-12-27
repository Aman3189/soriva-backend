/**
 * SORIVA - Email Formal Form Schema (Lean)
 * Synced with: email-formal-fields.config.ts
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getOptionalSteps } from './form-schema.helpers';

export enum EmailFormalType {
  PROFESSIONAL = 'professional',
  CORPORATE = 'corporate',
  COMPLAINT = 'complaint',
  INQUIRY = 'inquiry',
  FOLLOW_UP = 'follow-up',
  THANK_YOU = 'thank-you'
}

// Reusable field arrays
const F = {
  meta: ['templateType', 'emailSubject', 'emailDate'],
  sender: ['senderName', 'senderEmail', 'senderPhone', 'senderDesignation', 'senderCompany'],
  recipient: ['recipientName', 'recipientEmail', 'recipientDesignation', 'recipientCompany'],
  content: ['salutation', 'emailBody', 'closing'],
  signature: ['includeSignature', 'accentColor']
};

export const EMAIL_FORMAL_FORMS: Record<string, BaseFormSchema> = {
  [EmailFormalType.PROFESSIONAL]: {
    type: 'professional', templateId: 'email-formal-professional', promptKeyPrefix: 'emailFormal.professional', template: 'email-formal-professional.hbs',
    steps: [
      { id: 'meta', promptKey: 'emailFormal.professional.step.meta', fields: F.meta },
      { id: 'sender', promptKey: 'emailFormal.professional.step.sender', fields: F.sender },
      { id: 'recipient', promptKey: 'emailFormal.professional.step.recipient', fields: F.recipient },
      { id: 'content', promptKey: 'emailFormal.professional.step.content', fields: F.content },
      { id: 'signature', promptKey: 'emailFormal.professional.step.signature', fields: F.signature, optional: true }
    ]
  },
  [EmailFormalType.CORPORATE]: {
    type: 'corporate', templateId: 'email-formal-corporate', promptKeyPrefix: 'emailFormal.corporate', template: 'email-formal-corporate.hbs',
    steps: [
      { id: 'meta', promptKey: 'emailFormal.corporate.step.meta', fields: F.meta },
      { id: 'sender', promptKey: 'emailFormal.corporate.step.sender', fields: [...F.sender, 'senderDepartment'] },
      { id: 'recipient', promptKey: 'emailFormal.corporate.step.recipient', fields: ['recipientName', 'recipients'] },
      { id: 'corporate', promptKey: 'emailFormal.corporate.step.corporate', fields: ['corporate.companyName', 'corporate.companyLogo', 'corporate.emailType', 'corporate.referenceNumber', 'corporate.effectiveDate', 'corporate.priority'] },
      { id: 'content', promptKey: 'emailFormal.corporate.step.content', fields: F.content },
      { id: 'action', promptKey: 'emailFormal.corporate.step.action', fields: ['corporate.actionRequired', 'corporate.contactPerson'], optional: true },
      { id: 'disclaimer', promptKey: 'emailFormal.corporate.step.disclaimer', fields: ['corporate.disclaimer'], optional: true },
      { id: 'signature', promptKey: 'emailFormal.corporate.step.signature', fields: F.signature, optional: true }
    ]
  },
  [EmailFormalType.COMPLAINT]: {
    type: 'complaint', templateId: 'email-formal-complaint', promptKeyPrefix: 'emailFormal.complaint', template: 'email-formal-complaint.hbs',
    steps: [
      { id: 'meta', promptKey: 'emailFormal.complaint.step.meta', fields: F.meta },
      { id: 'sender', promptKey: 'emailFormal.complaint.step.sender', fields: [...F.sender, 'senderAddress'] },
      { id: 'recipient', promptKey: 'emailFormal.complaint.step.recipient', fields: [...F.recipient, 'recipientDepartment', 'recipientAddress'] },
      { id: 'complaintInfo', promptKey: 'emailFormal.complaint.step.complaintInfo', fields: ['complaint.complaintType', 'complaint.referenceNumber', 'complaint.incidentDate'] },
      { id: 'complaintDetails', promptKey: 'emailFormal.complaint.step.complaintDetails', fields: ['complaint.complaintDescription', 'complaint.previousAttempts'] },
      { id: 'resolution', promptKey: 'emailFormal.complaint.step.resolution', fields: ['complaint.desiredResolution', 'complaint.deadline'] },
      { id: 'attachments', promptKey: 'emailFormal.complaint.step.attachments', fields: ['attachmentsList'], optional: true },
      { id: 'content', promptKey: 'emailFormal.complaint.step.content', fields: ['salutation', 'closing'] },
      { id: 'signature', promptKey: 'emailFormal.complaint.step.signature', fields: F.signature, optional: true }
    ]
  },
  [EmailFormalType.INQUIRY]: {
    type: 'inquiry', templateId: 'email-formal-inquiry', promptKeyPrefix: 'emailFormal.inquiry', template: 'email-formal-inquiry.hbs',
    steps: [
      { id: 'meta', promptKey: 'emailFormal.inquiry.step.meta', fields: F.meta },
      { id: 'sender', promptKey: 'emailFormal.inquiry.step.sender', fields: F.sender },
      { id: 'recipient', promptKey: 'emailFormal.inquiry.step.recipient', fields: F.recipient },
      { id: 'inquiryInfo', promptKey: 'emailFormal.inquiry.step.inquiryInfo', fields: ['inquiry.inquiryType', 'inquiry.introContext'] },
      { id: 'questions', promptKey: 'emailFormal.inquiry.step.questions', fields: ['inquiry.specificQuestions', 'inquiry.purposeOfInquiry'] },
      { id: 'response', promptKey: 'emailFormal.inquiry.step.response', fields: ['inquiry.preferredResponseMethod', 'inquiry.urgency'], optional: true },
      { id: 'content', promptKey: 'emailFormal.inquiry.step.content', fields: F.content },
      { id: 'signature', promptKey: 'emailFormal.inquiry.step.signature', fields: F.signature, optional: true }
    ]
  },
  [EmailFormalType.FOLLOW_UP]: {
    type: 'follow-up', templateId: 'email-formal-follow-up', promptKeyPrefix: 'emailFormal.followUp', template: 'email-formal-follow-up.hbs',
    steps: [
      { id: 'meta', promptKey: 'emailFormal.followUp.step.meta', fields: F.meta },
      { id: 'sender', promptKey: 'emailFormal.followUp.step.sender', fields: F.sender },
      { id: 'recipient', promptKey: 'emailFormal.followUp.step.recipient', fields: F.recipient },
      { id: 'followUpInfo', promptKey: 'emailFormal.followUp.step.followUpInfo', fields: ['followUp.followUpType', 'followUp.originalDate'] },
      { id: 'context', promptKey: 'emailFormal.followUp.step.context', fields: ['followUp.meetingContext', 'followUp.keyPointsDiscussed'] },
      { id: 'nextSteps', promptKey: 'emailFormal.followUp.step.nextSteps', fields: ['followUp.actionItems', 'followUp.nextSteps'], optional: true },
      { id: 'content', promptKey: 'emailFormal.followUp.step.content', fields: F.content },
      { id: 'signature', promptKey: 'emailFormal.followUp.step.signature', fields: F.signature, optional: true }
    ]
  },
  [EmailFormalType.THANK_YOU]: {
    type: 'thank-you', templateId: 'email-formal-thank-you', promptKeyPrefix: 'emailFormal.thankYou', template: 'email-formal-thank-you.hbs',
    steps: [
      { id: 'meta', promptKey: 'emailFormal.thankYou.step.meta', fields: F.meta },
      { id: 'sender', promptKey: 'emailFormal.thankYou.step.sender', fields: F.sender },
      { id: 'recipient', promptKey: 'emailFormal.thankYou.step.recipient', fields: F.recipient },
      { id: 'thankYouInfo', promptKey: 'emailFormal.thankYou.step.thankYouInfo', fields: ['thankYou.thankYouType', 'thankYou.occasionDate'] },
      { id: 'gratitude', promptKey: 'emailFormal.thankYou.step.gratitude', fields: ['thankYou.specificThanks', 'thankYou.memorableDetails'] },
      { id: 'future', promptKey: 'emailFormal.thankYou.step.future', fields: ['thankYou.futureConnection'], optional: true },
      { id: 'content', promptKey: 'emailFormal.thankYou.step.content', fields: F.content },
      { id: 'signature', promptKey: 'emailFormal.thankYou.step.signature', fields: F.signature, optional: true }
    ]
  }
};

// Wrapper functions
export const getEmailFormalForm = (type: string) => getForm(EMAIL_FORMAL_FORMS, type);
export const getEmailFormalStep = (type: string, stepId: string) => getStep(EMAIL_FORMAL_FORMS, type, stepId);
export const getEmailFormalFields = (type: string) => getFields(EMAIL_FORMAL_FORMS, type);
export const getEmailFormalTypes = () => Object.keys(EMAIL_FORMAL_FORMS);

// Auto-suggest email type
export const suggestEmailFormalType = (ctx: { isComplaint?: boolean; isInquiry?: boolean; isFollowUp?: boolean; isThankYou?: boolean; isCorporate?: boolean }): EmailFormalType => {
  if (ctx.isComplaint) return EmailFormalType.COMPLAINT;
  if (ctx.isInquiry) return EmailFormalType.INQUIRY;
  if (ctx.isFollowUp) return EmailFormalType.FOLLOW_UP;
  if (ctx.isThankYou) return EmailFormalType.THANK_YOU;
  if (ctx.isCorporate) return EmailFormalType.CORPORATE;
  return EmailFormalType.PROFESSIONAL;
};