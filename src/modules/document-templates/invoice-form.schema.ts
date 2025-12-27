/**
 * SORIVA - Invoice Form Schema (Lean)
 * Synced with: invoice-fields.config.ts
 */
import { FormStep, BaseFormSchema, getForm, getStep, getFields, getRequiredSteps, getOptionalSteps } from './form-schema.helpers';

export enum InvoiceType {
  STANDARD = 'standard',
  TAX = 'tax',
  PROFORMA = 'proforma',
  COMMERCIAL = 'commercial',
  SERVICE = 'service',
  FREELANCE = 'freelance'
}

export const INVOICE_FORMS: Record<string, BaseFormSchema> = {
  [InvoiceType.STANDARD]: {
    type: 'standard', templateId: 'invoice-standard', promptKeyPrefix: 'invoice.standard', template: 'invoice-standard.hbs',
    steps: [
      { id: 'basics', promptKey: 'invoice.standard.step.basics', fields: ['invoiceNumber', 'invoiceDate', 'dueDate'] },
      { id: 'seller', promptKey: 'invoice.standard.step.seller', fields: ['seller.name', 'seller.address', 'seller.contact', 'seller.gstin', 'seller.pan'] },
      { id: 'buyer', promptKey: 'invoice.standard.step.buyer', fields: ['buyer.name', 'buyer.address', 'buyer.contact', 'buyer.gstin'] },
      { id: 'items', promptKey: 'invoice.standard.step.items', fields: ['lineItems.description', 'lineItems.quantity', 'lineItems.unit', 'lineItems.unitPrice', 'lineItems.discount'] },
      { id: 'payment', promptKey: 'invoice.standard.step.payment', fields: ['bankDetails.accountName', 'bankDetails.accountNumber', 'bankDetails.bankName', 'bankDetails.ifscCode', 'upiId'], optional: true },
      { id: 'notes', promptKey: 'invoice.standard.step.notes', fields: ['notes', 'termsAndConditions'], optional: true }
    ]
  },
  [InvoiceType.TAX]: {
    type: 'tax', templateId: 'invoice-tax', promptKeyPrefix: 'invoice.tax', template: 'invoice-tax.hbs',
    steps: [
      { id: 'basics', promptKey: 'invoice.tax.step.basics', fields: ['invoiceNumber', 'invoiceDate', 'dueDate'] },
      { id: 'seller', promptKey: 'invoice.tax.step.seller', fields: ['seller.name', 'seller.address', 'seller.stateCode', 'seller.gstin', 'seller.pan', 'seller.contact'] },
      { id: 'buyer', promptKey: 'invoice.tax.step.buyer', fields: ['buyer.name', 'buyer.address', 'buyer.stateCode', 'buyer.gstin', 'buyer.contact'] },
      { id: 'supply', promptKey: 'invoice.tax.step.supply', fields: ['supplyType', 'placeOfSupply', 'isInterState', 'reverseCharge'] },
      { id: 'items', promptKey: 'invoice.tax.step.items', fields: ['lineItems.description', 'lineItems.hsnCode', 'lineItems.sacCode', 'lineItems.quantity', 'lineItems.unit', 'lineItems.unitPrice', 'lineItems.gstRate', 'lineItems.discount'] },
      { id: 'payment', promptKey: 'invoice.tax.step.payment', fields: ['bankDetails.accountName', 'bankDetails.accountNumber', 'bankDetails.bankName', 'bankDetails.branch', 'bankDetails.ifscCode'] },
      { id: 'eway', promptKey: 'invoice.tax.step.eway', fields: ['eInvoiceIrn', 'eWayBillNo', 'vehicleNo', 'transporterName'], optional: true },
      { id: 'notes', promptKey: 'invoice.tax.step.notes', fields: ['notes', 'termsAndConditions', 'authorizedSignatory'], optional: true }
    ]
  },
  [InvoiceType.PROFORMA]: {
    type: 'proforma', templateId: 'invoice-proforma', promptKeyPrefix: 'invoice.proforma', template: 'invoice-proforma.hbs',
    steps: [
      { id: 'basics', promptKey: 'invoice.proforma.step.basics', fields: ['invoiceNumber', 'invoiceDate', 'validUntil', 'validDays'] },
      { id: 'seller', promptKey: 'invoice.proforma.step.seller', fields: ['seller.name', 'seller.address', 'seller.contact', 'seller.gstin'] },
      { id: 'buyer', promptKey: 'invoice.proforma.step.buyer', fields: ['buyer.name', 'buyer.address', 'buyer.contact', 'buyer.gstin'] },
      { id: 'reference', promptKey: 'invoice.proforma.step.reference', fields: ['referenceNumber', 'quotationNumber', 'poNumber'], optional: true },
      { id: 'items', promptKey: 'invoice.proforma.step.items', fields: ['lineItems.description', 'lineItems.quantity', 'lineItems.unit', 'lineItems.unitPrice', 'lineItems.discount'] },
      { id: 'delivery', promptKey: 'invoice.proforma.step.delivery', fields: ['deliveryTerms', 'deliveryTimeline', 'warrantyTerms'], optional: true },
      { id: 'payment', promptKey: 'invoice.proforma.step.payment', fields: ['paymentTerms', 'bankDetails.accountName', 'bankDetails.accountNumber', 'bankDetails.bankName', 'bankDetails.ifscCode'] }
    ]
  },
  [InvoiceType.COMMERCIAL]: {
    type: 'commercial', templateId: 'invoice-commercial', promptKeyPrefix: 'invoice.commercial', template: 'invoice-commercial.hbs',
    steps: [
      { id: 'basics', promptKey: 'invoice.commercial.step.basics', fields: ['invoiceNumber', 'invoiceDate', 'exporterRef', 'buyerRef'] },
      { id: 'exporter', promptKey: 'invoice.commercial.step.exporter', fields: ['seller.name', 'seller.address', 'seller.gstin', 'seller.pan', 'seller.iec', 'seller.contact'] },
      { id: 'importer', promptKey: 'invoice.commercial.step.importer', fields: ['buyer.name', 'buyer.address', 'buyer.country', 'buyer.contact'] },
      { id: 'shipping', promptKey: 'invoice.commercial.step.shipping', fields: ['portOfLoading', 'portOfDischarge', 'finalDestination', 'vesselFlightNo', 'countryOfOrigin'] },
      { id: 'terms', promptKey: 'invoice.commercial.step.terms', fields: ['termsOfDelivery', 'paymentTerms', 'lcNumber', 'lcDate'] },
      { id: 'items', promptKey: 'invoice.commercial.step.items', fields: ['lineItems.description', 'lineItems.hsnCode', 'lineItems.quantity', 'lineItems.unit', 'lineItems.unitPrice', 'currency'] },
      { id: 'package', promptKey: 'invoice.commercial.step.package', fields: ['packages', 'grossWeight', 'netWeight', 'marks', 'containerNo'] },
      { id: 'declaration', promptKey: 'invoice.commercial.step.declaration', fields: ['declaration', 'certificateOfOrigin', 'coNumber', 'otherCertificates'], optional: true },
      { id: 'bank', promptKey: 'invoice.commercial.step.bank', fields: ['bankDetails.accountName', 'bankDetails.accountNumber', 'bankDetails.bankName', 'bankDetails.swiftCode', 'bankDetails.ifscCode'] }
    ]
  },
  [InvoiceType.SERVICE]: {
    type: 'service', templateId: 'invoice-service', promptKeyPrefix: 'invoice.service', template: 'invoice-service.hbs',
    steps: [
      { id: 'basics', promptKey: 'invoice.service.step.basics', fields: ['invoiceNumber', 'invoiceDate', 'dueDate', 'servicePeriod.from', 'servicePeriod.to'] },
      { id: 'provider', promptKey: 'invoice.service.step.provider', fields: ['seller.name', 'seller.address', 'seller.gstin', 'seller.pan', 'seller.contact'] },
      { id: 'client', promptKey: 'invoice.service.step.client', fields: ['buyer.name', 'buyer.address', 'buyer.gstin', 'buyer.contact'] },
      { id: 'project', promptKey: 'invoice.service.step.project', fields: ['projectName', 'projectCode', 'poNumber', 'referenceNumber'], optional: true },
      { id: 'services', promptKey: 'invoice.service.step.services', fields: ['lineItems.description', 'lineItems.sacCode', 'lineItems.quantity', 'lineItems.unit', 'lineItems.unitPrice', 'lineItems.gstRate'] },
      { id: 'timesheet', promptKey: 'invoice.service.step.timesheet', fields: ['timeEntries.date', 'timeEntries.description', 'timeEntries.hours', 'timeEntries.rate'], optional: true },
      { id: 'payment', promptKey: 'invoice.service.step.payment', fields: ['bankDetails.accountName', 'bankDetails.accountNumber', 'bankDetails.bankName', 'bankDetails.ifscCode', 'upiId'] },
      { id: 'notes', promptKey: 'invoice.service.step.notes', fields: ['notes', 'termsAndConditions', 'authorizedSignatory'], optional: true }
    ]
  },
  [InvoiceType.FREELANCE]: {
    type: 'freelance', templateId: 'invoice-freelance', promptKeyPrefix: 'invoice.freelance', template: 'invoice-freelance.hbs',
    steps: [
      { id: 'basics', promptKey: 'invoice.freelance.step.basics', fields: ['invoiceNumber', 'invoiceDate', 'dueDate'] },
      { id: 'freelancer', promptKey: 'invoice.freelance.step.freelancer', fields: ['seller.name', 'freelancerTitle', 'seller.address', 'seller.pan', 'seller.contact', 'portfolioUrl'] },
      { id: 'client', promptKey: 'invoice.freelance.step.client', fields: ['buyer.name', 'buyer.address', 'buyer.contact', 'buyer.gstin'] },
      { id: 'project', promptKey: 'invoice.freelance.step.project', fields: ['projectName', 'projectDescription', 'projectTimeline'] },
      { id: 'deliverables', promptKey: 'invoice.freelance.step.deliverables', fields: ['deliverables.name', 'deliverables.description', 'deliverables.status', 'deliverables.amount'] },
      { id: 'work', promptKey: 'invoice.freelance.step.work', fields: ['lineItems.description', 'lineItems.quantity', 'lineItems.unit', 'lineItems.unitPrice'] },
      { id: 'rights', promptKey: 'invoice.freelance.step.rights', fields: ['revisionsIncluded', 'additionalRevisionRate', 'usageRights', 'copyrightTransfer'], optional: true },
      { id: 'payment', promptKey: 'invoice.freelance.step.payment', fields: ['bankDetails.accountName', 'bankDetails.accountNumber', 'bankDetails.bankName', 'bankDetails.ifscCode', 'upiId'] },
      { id: 'notes', promptKey: 'invoice.freelance.step.notes', fields: ['notes'], optional: true }
    ]
  }
};

// Wrapper functions using common helpers
export const getInvoiceForm = (type: string) => getForm(INVOICE_FORMS, type);
export const getInvoiceStep = (type: string, stepId: string) => getStep(INVOICE_FORMS, type, stepId);
export const getInvoiceFields = (type: string) => getFields(INVOICE_FORMS, type);
export const getInvoiceRequiredSteps = (type: string) => getRequiredSteps(INVOICE_FORMS, type);
export const getInvoiceOptionalSteps = (type: string) => getOptionalSteps(INVOICE_FORMS, type);
export const getInvoiceTypes = () => Object.keys(INVOICE_FORMS);