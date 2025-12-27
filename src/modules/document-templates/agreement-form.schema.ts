/**
 * SORIVA - Agreement Form Schema (Lean)
 * Synced with: agreement-fields.config.ts
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getArraySteps } from './form-schema.helpers';

export enum AgreementType {
  NDA = 'nda',
  SERVICE = 'service',
  RENTAL = 'rental',
  PARTNERSHIP = 'partnership',
  EMPLOYMENT = 'employment',
  FREELANCE = 'freelance',
  MOU = 'mou'
}

// Reusable field arrays
const F = {
  metadata: ['agreementTitle', 'agreementNumber', 'effectiveDate', 'expiryDate'],
  party: ['type', 'name', 'representedBy', 'designation', 'address', 'city', 'state', 'pincode', 'email', 'phone'],
  partyBasic: ['type', 'name', 'address', 'email', 'phone'],
  partyCompany: ['type', 'name', 'representedBy', 'designation', 'address', 'email', 'gstin', 'pan'],
  partyIndividual: ['type', 'name', 'address', 'email', 'phone', 'pan', 'aadhaar'],
  jurisdiction: ['placeOfExecution', 'jurisdiction', 'governingLaw'],
  terms: ['duration', 'termination', 'terminationNoticePeriod', 'disputeResolution'],
  termsExtended: ['duration', 'termination', 'renewal', 'disputeResolution', 'indemnification', 'liability', 'confidentiality'],
  witness: ['witnesses.name', 'witnesses.address', 'witnesses.signature'],
  signatures: ['signatures.party', 'signatures.name', 'signatures.designation', 'signatures.date', 'signatures.signature'],
  styling: ['accentColor', 'showLogo', 'logo', 'showPageNumbers', 'showWatermark']
};

export const AGREEMENT_FORMS: Record<string, BaseFormSchema> = {
  [AgreementType.NDA]: {
    type: 'nda', templateId: 'agreement-nda', promptKeyPrefix: 'agreement.nda', template: 'agreement-nda.hbs',
    steps: [
      { id: 'metadata', promptKey: 'agreement.nda.step.metadata', fields: [...F.metadata] },
      { id: 'firstParty', promptKey: 'agreement.nda.step.firstParty', fields: ['firstParty.type', 'firstParty.name', 'firstParty.representedBy', 'firstParty.designation', 'firstParty.address', 'firstParty.email', 'firstParty.pan'] },
      { id: 'secondParty', promptKey: 'agreement.nda.step.secondParty', fields: ['secondParty.type', 'secondParty.name', 'secondParty.representedBy', 'secondParty.designation', 'secondParty.address', 'secondParty.email', 'secondParty.pan'] },
      { id: 'jurisdiction', promptKey: 'agreement.nda.step.jurisdiction', fields: [...F.jurisdiction] },
      { id: 'ndaDetails', promptKey: 'agreement.nda.step.ndaDetails', fields: ['nda.ndaType', 'nda.disclosingParty', 'nda.receivingParty', 'nda.purpose'] },
      { id: 'confidentialInfo', promptKey: 'agreement.nda.step.confidentialInfo', fields: ['nda.confidentialInfo'], isArray: true },
      { id: 'exclusions', promptKey: 'agreement.nda.step.exclusions', fields: ['nda.exclusions'], isArray: true, optional: true },
      { id: 'period', promptKey: 'agreement.nda.step.period', fields: ['nda.confidentialityPeriod', 'nda.returnOfMaterials'] },
      { id: 'terms', promptKey: 'agreement.nda.step.terms', fields: [...F.terms] },
      { id: 'witnesses', promptKey: 'agreement.nda.step.witnesses', fields: [...F.witness], isArray: true, optional: true },
      { id: 'signatures', promptKey: 'agreement.nda.step.signatures', fields: [...F.signatures], isArray: true },
      { id: 'styling', promptKey: 'agreement.nda.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [AgreementType.SERVICE]: {
    type: 'service', templateId: 'agreement-service', promptKeyPrefix: 'agreement.service', template: 'agreement-service.hbs',
    steps: [
      { id: 'metadata', promptKey: 'agreement.service.step.metadata', fields: [...F.metadata] },
      { id: 'firstParty', promptKey: 'agreement.service.step.firstParty', fields: ['firstParty.type', 'firstParty.name', 'firstParty.representedBy', 'firstParty.designation', 'firstParty.address', 'firstParty.email', 'firstParty.gstin'] },
      { id: 'secondParty', promptKey: 'agreement.service.step.secondParty', fields: ['secondParty.type', 'secondParty.name', 'secondParty.representedBy', 'secondParty.designation', 'secondParty.address', 'secondParty.email', 'secondParty.gstin'] },
      { id: 'jurisdiction', promptKey: 'agreement.service.step.jurisdiction', fields: [...F.jurisdiction] },
      { id: 'service', promptKey: 'agreement.service.step.service', fields: ['service.serviceDescription', 'service.timeline', 'service.serviceLevel'] },
      { id: 'scope', promptKey: 'agreement.service.step.scope', fields: ['service.scopeOfWork'], isArray: true },
      { id: 'deliverables', promptKey: 'agreement.service.step.deliverables', fields: ['service.deliverables.name', 'service.deliverables.description', 'service.deliverables.deadline', 'service.deliverables.amount'], isArray: true, optional: true },
      { id: 'payment', promptKey: 'agreement.service.step.payment', fields: ['payment.totalAmount', 'payment.currency', 'payment.paymentTerms', 'payment.paymentMethod'] },
      { id: 'paymentSchedule', promptKey: 'agreement.service.step.paymentSchedule', fields: ['payment.paymentSchedule.milestone', 'payment.paymentSchedule.amount', 'payment.paymentSchedule.dueDate'], isArray: true, optional: true },
      { id: 'terms', promptKey: 'agreement.service.step.terms', fields: [...F.termsExtended] },
      { id: 'signatures', promptKey: 'agreement.service.step.signatures', fields: [...F.signatures], isArray: true },
      { id: 'styling', promptKey: 'agreement.service.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [AgreementType.RENTAL]: {
    type: 'rental', templateId: 'agreement-rental', promptKeyPrefix: 'agreement.rental', template: 'agreement-rental.hbs',
    steps: [
      { id: 'metadata', promptKey: 'agreement.rental.step.metadata', fields: [...F.metadata] },
      { id: 'landlord', promptKey: 'agreement.rental.step.landlord', fields: ['firstParty.type', 'firstParty.name', 'firstParty.address', 'firstParty.email', 'firstParty.phone', 'firstParty.pan', 'firstParty.aadhaar'] },
      { id: 'tenant', promptKey: 'agreement.rental.step.tenant', fields: ['secondParty.type', 'secondParty.name', 'secondParty.address', 'secondParty.email', 'secondParty.phone', 'secondParty.pan', 'secondParty.aadhaar'] },
      { id: 'jurisdiction', promptKey: 'agreement.rental.step.jurisdiction', fields: [...F.jurisdiction] },
      { id: 'property', promptKey: 'agreement.rental.step.property', fields: ['rental.property.type', 'rental.property.address', 'rental.property.area', 'rental.property.areaUnit', 'rental.property.furnishing'] },
      { id: 'amenities', promptKey: 'agreement.rental.step.amenities', fields: ['rental.property.amenities', 'rental.property.inventoryList'], isArray: true, optional: true },
      { id: 'rent', promptKey: 'agreement.rental.step.rent', fields: ['rental.rentAmount', 'rental.rentFrequency', 'rental.rentDueDate', 'rental.securityDeposit', 'rental.maintenanceCharges'] },
      { id: 'lease', promptKey: 'agreement.rental.step.lease', fields: ['rental.leaseDuration', 'rental.lockInPeriod', 'rental.renewalTerms'] },
      { id: 'utilities', promptKey: 'agreement.rental.step.utilities', fields: ['rental.utilities'], isArray: true, optional: true },
      { id: 'restrictions', promptKey: 'agreement.rental.step.restrictions', fields: ['rental.restrictions'], isArray: true, optional: true },
      { id: 'terms', promptKey: 'agreement.rental.step.terms', fields: [...F.terms] },
      { id: 'witnesses', promptKey: 'agreement.rental.step.witnesses', fields: [...F.witness], isArray: true },
      { id: 'signatures', promptKey: 'agreement.rental.step.signatures', fields: [...F.signatures], isArray: true },
      { id: 'styling', promptKey: 'agreement.rental.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [AgreementType.PARTNERSHIP]: {
    type: 'partnership', templateId: 'agreement-partnership', promptKeyPrefix: 'agreement.partnership', template: 'agreement-partnership.hbs',
    steps: [
      { id: 'metadata', promptKey: 'agreement.partnership.step.metadata', fields: [...F.metadata] },
      { id: 'partner1', promptKey: 'agreement.partnership.step.partner1', fields: ['firstParty.type', 'firstParty.name', 'firstParty.address', 'firstParty.email', 'firstParty.pan'] },
      { id: 'partner2', promptKey: 'agreement.partnership.step.partner2', fields: ['secondParty.type', 'secondParty.name', 'secondParty.address', 'secondParty.email', 'secondParty.pan'] },
      { id: 'additionalPartners', promptKey: 'agreement.partnership.step.additionalPartners', fields: ['additionalParties.type', 'additionalParties.name', 'additionalParties.address', 'additionalParties.pan'], isArray: true, optional: true },
      { id: 'jurisdiction', promptKey: 'agreement.partnership.step.jurisdiction', fields: [...F.jurisdiction] },
      { id: 'firmDetails', promptKey: 'agreement.partnership.step.firmDetails', fields: ['partnership.firmName', 'partnership.businessNature', 'partnership.businessAddress'] },
      { id: 'capital', promptKey: 'agreement.partnership.step.capital', fields: ['partnership.capitalContribution.partner', 'partnership.capitalContribution.amount', 'partnership.capitalContribution.percentage'], isArray: true },
      { id: 'profitLoss', promptKey: 'agreement.partnership.step.profitLoss', fields: ['partnership.profitSharingRatio', 'partnership.lossSharingRatio'] },
      { id: 'management', promptKey: 'agreement.partnership.step.management', fields: ['partnership.managementRoles.partner', 'partnership.managementRoles.role', 'partnership.managementRoles.responsibilities'], isArray: true, optional: true },
      { id: 'banking', promptKey: 'agreement.partnership.step.banking', fields: ['partnership.bankingArrangements', 'partnership.accountingYear'] },
      { id: 'terms', promptKey: 'agreement.partnership.step.terms', fields: [...F.termsExtended] },
      { id: 'witnesses', promptKey: 'agreement.partnership.step.witnesses', fields: [...F.witness], isArray: true },
      { id: 'signatures', promptKey: 'agreement.partnership.step.signatures', fields: [...F.signatures], isArray: true },
      { id: 'styling', promptKey: 'agreement.partnership.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [AgreementType.EMPLOYMENT]: {
    type: 'employment', templateId: 'contract-employment', promptKeyPrefix: 'agreement.employment', template: 'contract-employment.hbs',
    steps: [
      { id: 'metadata', promptKey: 'agreement.employment.step.metadata', fields: [...F.metadata] },
      { id: 'employer', promptKey: 'agreement.employment.step.employer', fields: ['firstParty.type', 'firstParty.name', 'firstParty.representedBy', 'firstParty.designation', 'firstParty.address', 'firstParty.email'] },
      { id: 'employee', promptKey: 'agreement.employment.step.employee', fields: ['secondParty.type', 'secondParty.name', 'secondParty.address', 'secondParty.email', 'secondParty.phone', 'secondParty.pan'] },
      { id: 'jurisdiction', promptKey: 'agreement.employment.step.jurisdiction', fields: [...F.jurisdiction] },
      { id: 'position', promptKey: 'agreement.employment.step.position', fields: ['employment.position', 'employment.department', 'employment.reportingTo', 'employment.workLocation'] },
      { id: 'dates', promptKey: 'agreement.employment.step.dates', fields: ['employment.startDate', 'employment.probationPeriod'] },
      { id: 'compensation', promptKey: 'agreement.employment.step.compensation', fields: ['employment.salary', 'employment.salaryFrequency'] },
      { id: 'benefits', promptKey: 'agreement.employment.step.benefits', fields: ['employment.benefits', 'employment.leavePolicy'], isArray: true, optional: true },
      { id: 'workTerms', promptKey: 'agreement.employment.step.workTerms', fields: ['employment.workHours', 'employment.noticePeriod'] },
      { id: 'terms', promptKey: 'agreement.employment.step.terms', fields: ['terms.confidentiality', 'terms.nonCompete', 'terms.intellectualProperty'] },
      { id: 'termination', promptKey: 'agreement.employment.step.termination', fields: ['terms.termination', 'terms.terminationNoticePeriod'] },
      { id: 'signatures', promptKey: 'agreement.employment.step.signatures', fields: [...F.signatures], isArray: true },
      { id: 'styling', promptKey: 'agreement.employment.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [AgreementType.FREELANCE]: {
    type: 'freelance', templateId: 'contract-freelance', promptKeyPrefix: 'agreement.freelance', template: 'contract-freelance.hbs',
    steps: [
      { id: 'metadata', promptKey: 'agreement.freelance.step.metadata', fields: [...F.metadata] },
      { id: 'client', promptKey: 'agreement.freelance.step.client', fields: ['firstParty.type', 'firstParty.name', 'firstParty.representedBy', 'firstParty.address', 'firstParty.email'] },
      { id: 'freelancer', promptKey: 'agreement.freelance.step.freelancer', fields: ['secondParty.type', 'secondParty.name', 'secondParty.address', 'secondParty.email', 'secondParty.pan'] },
      { id: 'jurisdiction', promptKey: 'agreement.freelance.step.jurisdiction', fields: [...F.jurisdiction] },
      { id: 'project', promptKey: 'agreement.freelance.step.project', fields: ['freelance.projectName', 'freelance.projectDescription'] },
      { id: 'deliverables', promptKey: 'agreement.freelance.step.deliverables', fields: ['freelance.deliverables.name', 'freelance.deliverables.description', 'freelance.deliverables.deadline', 'freelance.deliverables.amount'], isArray: true },
      { id: 'timeline', promptKey: 'agreement.freelance.step.timeline', fields: ['freelance.startDate', 'freelance.endDate', 'freelance.revisions'] },
      { id: 'payment', promptKey: 'agreement.freelance.step.payment', fields: ['freelance.rate', 'freelance.rateType', 'freelance.paymentTerms'] },
      { id: 'paymentSchedule', promptKey: 'agreement.freelance.step.paymentSchedule', fields: ['payment.paymentSchedule.milestone', 'payment.paymentSchedule.amount', 'payment.paymentSchedule.percentage'], isArray: true, optional: true },
      { id: 'terms', promptKey: 'agreement.freelance.step.terms', fields: ['terms.intellectualProperty', 'terms.confidentiality', 'terms.termination'] },
      { id: 'signatures', promptKey: 'agreement.freelance.step.signatures', fields: [...F.signatures], isArray: true },
      { id: 'styling', promptKey: 'agreement.freelance.step.styling', fields: [...F.styling], optional: true }
    ]
  },
  [AgreementType.MOU]: {
    type: 'mou', templateId: 'agreement-mou', promptKeyPrefix: 'agreement.mou', template: 'agreement-mou.hbs',
    steps: [
      { id: 'metadata', promptKey: 'agreement.mou.step.metadata', fields: [...F.metadata] },
      { id: 'firstParty', promptKey: 'agreement.mou.step.firstParty', fields: ['firstParty.type', 'firstParty.name', 'firstParty.representedBy', 'firstParty.designation', 'firstParty.address', 'firstParty.email'] },
      { id: 'secondParty', promptKey: 'agreement.mou.step.secondParty', fields: ['secondParty.type', 'secondParty.name', 'secondParty.representedBy', 'secondParty.designation', 'secondParty.address', 'secondParty.email'] },
      { id: 'background', promptKey: 'agreement.mou.step.background', fields: ['background', 'purpose'] },
      { id: 'intent', promptKey: 'agreement.mou.step.intent', fields: ['mou.partiesIntent', 'mou.nonBinding'] },
      { id: 'cooperation', promptKey: 'agreement.mou.step.cooperation', fields: ['mou.areasOfCooperation'], isArray: true },
      { id: 'responsibilities', promptKey: 'agreement.mou.step.responsibilities', fields: ['mou.responsibilities.party', 'mou.responsibilities.responsibilities'], isArray: true, optional: true },
      { id: 'resources', promptKey: 'agreement.mou.step.resources', fields: ['mou.resources', 'mou.timeline'], optional: true },
      { id: 'terms', promptKey: 'agreement.mou.step.terms', fields: ['terms.duration', 'terms.renewal', 'terms.termination', 'terms.amendments'] },
      { id: 'signatures', promptKey: 'agreement.mou.step.signatures', fields: [...F.signatures], isArray: true },
      { id: 'styling', promptKey: 'agreement.mou.step.styling', fields: [...F.styling], optional: true }
    ]
  }
};

// Wrapper functions
export const getAgreementForm = (type: string) => getForm(AGREEMENT_FORMS, type);
export const getAgreementStep = (type: string, stepId: string) => getStep(AGREEMENT_FORMS, type, stepId);
export const getAgreementFields = (type: string) => getFields(AGREEMENT_FORMS, type);
export const getAgreementArraySteps = (type: string) => getArraySteps(AGREEMENT_FORMS, type);
export const getAgreementTypes = () => Object.keys(AGREEMENT_FORMS);

// Auto-suggest agreement type
export const suggestAgreementType = (ctx: {
  isNDA?: boolean;
  isService?: boolean;
  isRental?: boolean;
  isPartnership?: boolean;
  isEmployment?: boolean;
  isFreelance?: boolean;
  isMOU?: boolean;
  keywords?: string[];
}): AgreementType => {
  if (ctx.isNDA) return AgreementType.NDA;
  if (ctx.isService) return AgreementType.SERVICE;
  if (ctx.isRental) return AgreementType.RENTAL;
  if (ctx.isPartnership) return AgreementType.PARTNERSHIP;
  if (ctx.isEmployment) return AgreementType.EMPLOYMENT;
  if (ctx.isFreelance) return AgreementType.FREELANCE;
  if (ctx.isMOU) return AgreementType.MOU;
  
  // Keyword-based detection
  if (ctx.keywords) {
    const kw = ctx.keywords.map(k => k.toLowerCase());
    if (kw.some(k => ['nda', 'confidential', 'non-disclosure', 'secret'].includes(k))) return AgreementType.NDA;
    if (kw.some(k => ['service', 'consulting', 'agency', 'provider'].includes(k))) return AgreementType.SERVICE;
    if (kw.some(k => ['rent', 'rental', 'lease', 'tenant', 'landlord', 'property'].includes(k))) return AgreementType.RENTAL;
    if (kw.some(k => ['partner', 'partnership', 'firm', 'joint'].includes(k))) return AgreementType.PARTNERSHIP;
    if (kw.some(k => ['employment', 'employee', 'job', 'hire', 'salary'].includes(k))) return AgreementType.EMPLOYMENT;
    if (kw.some(k => ['freelance', 'contractor', 'project', 'gig'].includes(k))) return AgreementType.FREELANCE;
    if (kw.some(k => ['mou', 'memorandum', 'understanding', 'collaboration'].includes(k))) return AgreementType.MOU;
  }
  
  return AgreementType.NDA; // Default
};