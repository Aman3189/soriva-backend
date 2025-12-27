/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SORIVA - AGREEMENT/CONTRACT TEMPLATES CONFIGURATION
 * Document Type: Legal Agreements & Contracts
 * Templates: 7 variants (NDA, Service, Rental, Partnership, Employment, Freelance, MOU)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Field Types for Form Fields
 */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'textarea-list'
  | 'number'
  | 'date'
  | 'email'
  | 'url'
  | 'tel'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'color'
  | 'file'
  | 'image'
  | 'complex'
  | 'array'
  | 'object'
  | 'rich-text'
  | 'markdown';

/**
 * Agreement Template Variants
 */
export type AgreementTemplateType =
  | 'nda'           // Non-Disclosure Agreement
  | 'service'       // Service Agreement
  | 'rental'        // Rental/Lease Agreement
  | 'partnership'   // Partnership Agreement
  | 'employment'    // Employment Contract
  | 'freelance'     // Freelance/Contractor Agreement
  | 'mou';          // Memorandum of Understanding

/**
 * Party Types
 */
export type PartyType =
  | 'individual'
  | 'company'
  | 'partnership'
  | 'llp'
  | 'trust'
  | 'government';

/**
 * Agreement Status
 */
export type AgreementStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'expired'
  | 'terminated';

/**
 * NDA Types
 */
export type NDAType =
  | 'unilateral'    // One-way NDA
  | 'bilateral'     // Mutual NDA
  | 'multilateral'; // Multiple parties

/**
 * Payment Terms
 */
export type PaymentTerms =
  | 'advance'
  | 'on-delivery'
  | 'net-15'
  | 'net-30'
  | 'net-45'
  | 'net-60'
  | 'milestone'
  | 'hourly'
  | 'monthly';

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Party/Signatory Information
 */
export interface AgreementParty {
  type: PartyType;
  name: string;
  representedBy?: string;
  designation?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  email?: string;
  phone?: string;
  pan?: string;
  gstin?: string;
  aadhaar?: string;
  companyRegNumber?: string;
  authorizedSignatory?: string;
}

/**
 * Witness Information
 */
export interface Witness {
  name: string;
  address?: string;
  signature?: string;
}

/**
 * Clause Structure
 */
export interface AgreementClause {
  clauseNumber: string | number;
  title: string;
  content: string;
  subClauses?: {
    label: string;
    content: string;
  }[];
}

/**
 * Payment Schedule
 */
export interface PaymentSchedule {
  milestone?: string;
  amount: number;
  dueDate?: string;
  percentage?: number;
  description?: string;
}

/**
 * Service/Deliverable
 */
export interface ServiceDeliverable {
  name: string;
  description?: string;
  deadline?: string;
  amount?: number;
}

/**
 * Property Details (for Rental)
 */
export interface PropertyDetails {
  type: 'residential' | 'commercial' | 'industrial' | 'land';
  address: string;
  area?: string;
  areaUnit?: 'sqft' | 'sqm' | 'acre' | 'hectare';
  furnishing?: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  amenities?: string[];
  inventoryList?: string[];
}

/**
 * Employment Terms
 */
export interface EmploymentTerms {
  position: string;
  department?: string;
  reportingTo?: string;
  startDate: string;
  probationPeriod?: string;
  workLocation?: string;
  workHours?: string;
  salary: number;
  salaryFrequency: 'monthly' | 'annual';
  benefits?: string[];
  leavePolicy?: string;
  noticePeriod?: string;
}

/**
 * Freelance Terms
 */
export interface FreelanceTerms {
  projectName: string;
  projectDescription?: string;
  deliverables: ServiceDeliverable[];
  startDate: string;
  endDate?: string;
  rate: number;
  rateType: 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  paymentTerms: PaymentTerms;
  revisions?: number;
}

/**
 * Main Agreement Data Interface
 */
export interface AgreementData {
  // ─────────────────────────────────────────────────────────────
  // METADATA
  // ─────────────────────────────────────────────────────────────
  templateType: AgreementTemplateType;
  agreementTitle: string;
  agreementNumber?: string;
  status?: AgreementStatus;
  
  // ─────────────────────────────────────────────────────────────
  // DATES
  // ─────────────────────────────────────────────────────────────
  effectiveDate: string;
  executionDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  
  // ─────────────────────────────────────────────────────────────
  // PARTIES
  // ─────────────────────────────────────────────────────────────
  firstParty: AgreementParty;
  secondParty: AgreementParty;
  additionalParties?: AgreementParty[];
  
  // ─────────────────────────────────────────────────────────────
  // LOCATION & JURISDICTION
  // ─────────────────────────────────────────────────────────────
  placeOfExecution?: string;
  jurisdiction?: string;
  governingLaw?: string;
  
  // ─────────────────────────────────────────────────────────────
  // RECITALS/BACKGROUND
  // ─────────────────────────────────────────────────────────────
  recitals?: string[];
  background?: string;
  purpose?: string;
  
  // ─────────────────────────────────────────────────────────────
  // NDA SPECIFIC
  // ─────────────────────────────────────────────────────────────
  nda?: {
    ndaType: NDAType;
    disclosingParty?: string;
    receivingParty?: string;
    confidentialInfo?: string[];
    exclusions?: string[];
    purpose: string;
    confidentialityPeriod?: string;
    returnOfMaterials?: string;
  };
  
  // ─────────────────────────────────────────────────────────────
  // SERVICE AGREEMENT SPECIFIC
  // ─────────────────────────────────────────────────────────────
  service?: {
    serviceDescription: string;
    scopeOfWork: string[];
    deliverables?: ServiceDeliverable[];
    timeline?: string;
    serviceLevel?: string;
    supportTerms?: string;
  };
  
  // ─────────────────────────────────────────────────────────────
  // RENTAL AGREEMENT SPECIFIC
  // ─────────────────────────────────────────────────────────────
  rental?: {
    property: PropertyDetails;
    rentAmount: number;
    rentFrequency: 'monthly' | 'quarterly' | 'yearly';
    securityDeposit: number;
    maintenanceCharges?: number;
    rentDueDate?: string;
    leaseDuration: string;
    renewalTerms?: string;
    lockInPeriod?: string;
    utilities?: string[];
    restrictions?: string[];
  };
  
  // ─────────────────────────────────────────────────────────────
  // PARTNERSHIP AGREEMENT SPECIFIC
  // ─────────────────────────────────────────────────────────────
  partnership?: {
    firmName: string;
    businessNature: string;
    businessAddress?: string;
    capitalContribution: {
      partner: string;
      amount: number;
      percentage: number;
    }[];
    profitSharingRatio: string;
    lossSharingRatio?: string;
    managementRoles?: {
      partner: string;
      role: string;
      responsibilities?: string[];
    }[];
    bankingArrangements?: string;
    accountingYear?: string;
  };
  
  // ─────────────────────────────────────────────────────────────
  // EMPLOYMENT CONTRACT SPECIFIC
  // ─────────────────────────────────────────────────────────────
  employment?: EmploymentTerms;
  
  // ─────────────────────────────────────────────────────────────
  // FREELANCE AGREEMENT SPECIFIC
  // ─────────────────────────────────────────────────────────────
  freelance?: FreelanceTerms;
  
  // ─────────────────────────────────────────────────────────────
  // MOU SPECIFIC
  // ─────────────────────────────────────────────────────────────
  mou?: {
    partiesIntent: string;
    areasOfCooperation: string[];
    responsibilities?: {
      party: string;
      responsibilities: string[];
    }[];
    resources?: string;
    timeline?: string;
    nonBinding?: boolean;
  };
  
  // ─────────────────────────────────────────────────────────────
  // PAYMENT TERMS
  // ─────────────────────────────────────────────────────────────
  payment?: {
    totalAmount?: number;
    currency?: string;
    paymentTerms: PaymentTerms;
    paymentSchedule?: PaymentSchedule[];
    paymentMethod?: string;
    bankDetails?: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      ifscCode: string;
      branch?: string;
    };
    lateFee?: string;
    taxTerms?: string;
  };
  
  // ─────────────────────────────────────────────────────────────
  // TERMS & CONDITIONS
  // ─────────────────────────────────────────────────────────────
  terms?: {
    duration?: string;
    termination?: string;
    terminationNoticePeriod?: string;
    renewal?: string;
    disputeResolution?: string;
    arbitration?: string;
    indemnification?: string;
    liability?: string;
    limitationOfLiability?: string;
    forcesMajeure?: string;
    confidentiality?: string;
    nonCompete?: string;
    nonSolicitation?: string;
    intellectualProperty?: string;
    insurance?: string;
    compliance?: string;
    amendments?: string;
    severability?: string;
    waiver?: string;
    entireAgreement?: string;
    notices?: string;
    assignability?: string;
  };
  
  // ─────────────────────────────────────────────────────────────
  // CUSTOM CLAUSES
  // ─────────────────────────────────────────────────────────────
  clauses?: AgreementClause[];
  additionalTerms?: string[];
  
  // ─────────────────────────────────────────────────────────────
  // SIGNATURES
  // ─────────────────────────────────────────────────────────────
  signatures?: {
    party: string;
    name: string;
    designation?: string;
    date?: string;
    signature?: string;
    stamp?: string;
  }[];
  
  // ─────────────────────────────────────────────────────────────
  // WITNESSES
  // ─────────────────────────────────────────────────────────────
  witnesses?: Witness[];
  
  // ─────────────────────────────────────────────────────────────
  // ANNEXURES/SCHEDULES
  // ─────────────────────────────────────────────────────────────
  annexures?: {
    label: string;
    title: string;
    content?: string;
  }[];
  
  // ─────────────────────────────────────────────────────────────
  // STYLING OPTIONS
  // ─────────────────────────────────────────────────────────────
  accentColor?: string;
  showLogo?: boolean;
  logo?: string;
  showWatermark?: boolean;
  watermark?: string;
  showPageNumbers?: boolean;
  showTableOfContents?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: FIELD DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const AGREEMENT_FIELD_DEFINITIONS: Record<string, {
  type: FieldType;
  label: string;
  labelHindi?: string;
  placeholder?: string;
  required?: boolean;
  category: string;
  templateTypes?: AgreementTemplateType[];
}> = {
  // ─────────────────────────────────────────────────────────────
  // METADATA FIELDS
  // ─────────────────────────────────────────────────────────────
  templateType: {
    type: 'select',
    label: 'Agreement Type',
    labelHindi: 'समझौता प्रकार',
    required: true,
    category: 'metadata'
  },
  agreementTitle: {
    type: 'text',
    label: 'Agreement Title',
    labelHindi: 'समझौता शीर्षक',
    placeholder: 'e.g., Non-Disclosure Agreement',
    required: true,
    category: 'metadata'
  },
  agreementNumber: {
    type: 'text',
    label: 'Agreement Number',
    labelHindi: 'समझौता संख्या',
    placeholder: 'e.g., AGR/2025/001',
    category: 'metadata'
  },

  // ─────────────────────────────────────────────────────────────
  // DATE FIELDS
  // ─────────────────────────────────────────────────────────────
  effectiveDate: {
    type: 'date',
    label: 'Effective Date',
    labelHindi: 'प्रभावी तिथि',
    required: true,
    category: 'dates'
  },
  executionDate: {
    type: 'date',
    label: 'Execution Date',
    labelHindi: 'निष्पादन तिथि',
    category: 'dates'
  },
  expiryDate: {
    type: 'date',
    label: 'Expiry Date',
    labelHindi: 'समाप्ति तिथि',
    category: 'dates'
  },

  // ─────────────────────────────────────────────────────────────
  // PARTY FIELDS
  // ─────────────────────────────────────────────────────────────
  partyType: {
    type: 'select',
    label: 'Party Type',
    labelHindi: 'पार्टी प्रकार',
    category: 'party'
  },
  partyName: {
    type: 'text',
    label: 'Party Name',
    labelHindi: 'पार्टी का नाम',
    placeholder: 'Full legal name',
    required: true,
    category: 'party'
  },
  representedBy: {
    type: 'text',
    label: 'Represented By',
    labelHindi: 'प्रतिनिधित्व',
    placeholder: 'Authorized representative name',
    category: 'party'
  },
  partyDesignation: {
    type: 'text',
    label: 'Designation',
    labelHindi: 'पद',
    placeholder: 'e.g., Director, Partner',
    category: 'party'
  },
  partyAddress: {
    type: 'textarea',
    label: 'Address',
    labelHindi: 'पता',
    placeholder: 'Complete address',
    required: true,
    category: 'party'
  },
  partyEmail: {
    type: 'email',
    label: 'Email',
    labelHindi: 'ईमेल',
    category: 'party'
  },
  partyPhone: {
    type: 'tel',
    label: 'Phone',
    labelHindi: 'फोन',
    category: 'party'
  },
  partyPAN: {
    type: 'text',
    label: 'PAN Number',
    labelHindi: 'पैन नंबर',
    placeholder: 'e.g., ABCDE1234F',
    category: 'party'
  },
  partyGSTIN: {
    type: 'text',
    label: 'GSTIN',
    labelHindi: 'जीएसटीआईएन',
    placeholder: 'e.g., 22AAAAA0000A1Z5',
    category: 'party'
  },

  // ─────────────────────────────────────────────────────────────
  // JURISDICTION FIELDS
  // ─────────────────────────────────────────────────────────────
  placeOfExecution: {
    type: 'text',
    label: 'Place of Execution',
    labelHindi: 'निष्पादन स्थान',
    placeholder: 'City where agreement is signed',
    category: 'jurisdiction'
  },
  jurisdiction: {
    type: 'text',
    label: 'Jurisdiction',
    labelHindi: 'अधिकार क्षेत्र',
    placeholder: 'e.g., Courts of New Delhi',
    category: 'jurisdiction'
  },
  governingLaw: {
    type: 'text',
    label: 'Governing Law',
    labelHindi: 'शासी कानून',
    placeholder: 'e.g., Laws of India',
    category: 'jurisdiction'
  },

  // ─────────────────────────────────────────────────────────────
  // NDA FIELDS
  // ─────────────────────────────────────────────────────────────
  ndaType: {
    type: 'select',
    label: 'NDA Type',
    labelHindi: 'एनडीए प्रकार',
    category: 'nda',
    templateTypes: ['nda']
  },
  confidentialInfo: {
    type: 'textarea-list',
    label: 'Confidential Information',
    labelHindi: 'गोपनीय जानकारी',
    placeholder: 'Types of confidential information',
    category: 'nda',
    templateTypes: ['nda']
  },
  confidentialityPeriod: {
    type: 'text',
    label: 'Confidentiality Period',
    labelHindi: 'गोपनीयता अवधि',
    placeholder: 'e.g., 5 years',
    category: 'nda',
    templateTypes: ['nda']
  },

  // ─────────────────────────────────────────────────────────────
  // SERVICE FIELDS
  // ─────────────────────────────────────────────────────────────
  serviceDescription: {
    type: 'textarea',
    label: 'Service Description',
    labelHindi: 'सेवा विवरण',
    placeholder: 'Describe the services to be provided',
    category: 'service',
    templateTypes: ['service']
  },
  scopeOfWork: {
    type: 'textarea-list',
    label: 'Scope of Work',
    labelHindi: 'कार्य का दायरा',
    placeholder: 'List scope items',
    category: 'service',
    templateTypes: ['service']
  },

  // ─────────────────────────────────────────────────────────────
  // RENTAL FIELDS
  // ─────────────────────────────────────────────────────────────
  propertyType: {
    type: 'select',
    label: 'Property Type',
    labelHindi: 'संपत्ति प्रकार',
    category: 'rental',
    templateTypes: ['rental']
  },
  propertyAddress: {
    type: 'textarea',
    label: 'Property Address',
    labelHindi: 'संपत्ति पता',
    placeholder: 'Complete property address',
    category: 'rental',
    templateTypes: ['rental']
  },
  rentAmount: {
    type: 'number',
    label: 'Monthly Rent',
    labelHindi: 'मासिक किराया',
    placeholder: 'Rent amount',
    category: 'rental',
    templateTypes: ['rental']
  },
  securityDeposit: {
    type: 'number',
    label: 'Security Deposit',
    labelHindi: 'सुरक्षा जमा',
    placeholder: 'Deposit amount',
    category: 'rental',
    templateTypes: ['rental']
  },
  leaseDuration: {
    type: 'text',
    label: 'Lease Duration',
    labelHindi: 'पट्टा अवधि',
    placeholder: 'e.g., 11 months',
    category: 'rental',
    templateTypes: ['rental']
  },

  // ─────────────────────────────────────────────────────────────
  // PARTNERSHIP FIELDS
  // ─────────────────────────────────────────────────────────────
  firmName: {
    type: 'text',
    label: 'Firm Name',
    labelHindi: 'फर्म का नाम',
    placeholder: 'Partnership firm name',
    category: 'partnership',
    templateTypes: ['partnership']
  },
  businessNature: {
    type: 'text',
    label: 'Nature of Business',
    labelHindi: 'व्यवसाय की प्रकृति',
    placeholder: 'Type of business',
    category: 'partnership',
    templateTypes: ['partnership']
  },
  profitSharingRatio: {
    type: 'text',
    label: 'Profit Sharing Ratio',
    labelHindi: 'लाभ साझाकरण अनुपात',
    placeholder: 'e.g., 50:50, 60:40',
    category: 'partnership',
    templateTypes: ['partnership']
  },

  // ─────────────────────────────────────────────────────────────
  // EMPLOYMENT FIELDS
  // ─────────────────────────────────────────────────────────────
  position: {
    type: 'text',
    label: 'Position/Designation',
    labelHindi: 'पद',
    placeholder: 'Job title',
    category: 'employment',
    templateTypes: ['employment']
  },
  department: {
    type: 'text',
    label: 'Department',
    labelHindi: 'विभाग',
    placeholder: 'Department name',
    category: 'employment',
    templateTypes: ['employment']
  },
  salary: {
    type: 'number',
    label: 'Salary',
    labelHindi: 'वेतन',
    placeholder: 'Salary amount',
    category: 'employment',
    templateTypes: ['employment']
  },
  probationPeriod: {
    type: 'text',
    label: 'Probation Period',
    labelHindi: 'परिवीक्षा अवधि',
    placeholder: 'e.g., 3 months',
    category: 'employment',
    templateTypes: ['employment']
  },
  noticePeriod: {
    type: 'text',
    label: 'Notice Period',
    labelHindi: 'नोटिस अवधि',
    placeholder: 'e.g., 30 days',
    category: 'employment',
    templateTypes: ['employment']
  },

  // ─────────────────────────────────────────────────────────────
  // FREELANCE FIELDS
  // ─────────────────────────────────────────────────────────────
  projectName: {
    type: 'text',
    label: 'Project Name',
    labelHindi: 'परियोजना का नाम',
    placeholder: 'Name of the project',
    category: 'freelance',
    templateTypes: ['freelance']
  },
  projectDescription: {
    type: 'textarea',
    label: 'Project Description',
    labelHindi: 'परियोजना विवरण',
    placeholder: 'Describe the project',
    category: 'freelance',
    templateTypes: ['freelance']
  },
  rate: {
    type: 'number',
    label: 'Rate',
    labelHindi: 'दर',
    placeholder: 'Payment rate',
    category: 'freelance',
    templateTypes: ['freelance']
  },
  rateType: {
    type: 'select',
    label: 'Rate Type',
    labelHindi: 'दर प्रकार',
    category: 'freelance',
    templateTypes: ['freelance']
  },

  // ─────────────────────────────────────────────────────────────
  // MOU FIELDS
  // ─────────────────────────────────────────────────────────────
  partiesIntent: {
    type: 'textarea',
    label: 'Intent of Parties',
    labelHindi: 'पार्टियों का इरादा',
    placeholder: 'Purpose of the MOU',
    category: 'mou',
    templateTypes: ['mou']
  },
  areasOfCooperation: {
    type: 'textarea-list',
    label: 'Areas of Cooperation',
    labelHindi: 'सहयोग के क्षेत्र',
    placeholder: 'List cooperation areas',
    category: 'mou',
    templateTypes: ['mou']
  },

  // ─────────────────────────────────────────────────────────────
  // PAYMENT FIELDS
  // ─────────────────────────────────────────────────────────────
  totalAmount: {
    type: 'number',
    label: 'Total Amount',
    labelHindi: 'कुल राशि',
    placeholder: 'Total contract value',
    category: 'payment'
  },
  currency: {
    type: 'select',
    label: 'Currency',
    labelHindi: 'मुद्रा',
    category: 'payment'
  },
  paymentTerms: {
    type: 'select',
    label: 'Payment Terms',
    labelHindi: 'भुगतान शर्तें',
    category: 'payment'
  },

  // ─────────────────────────────────────────────────────────────
  // TERMS FIELDS
  // ─────────────────────────────────────────────────────────────
  duration: {
    type: 'text',
    label: 'Agreement Duration',
    labelHindi: 'समझौता अवधि',
    placeholder: 'e.g., 1 year',
    category: 'terms'
  },
  terminationClause: {
    type: 'textarea',
    label: 'Termination Clause',
    labelHindi: 'समाप्ति खंड',
    placeholder: 'Terms for termination',
    category: 'terms'
  },
  disputeResolution: {
    type: 'textarea',
    label: 'Dispute Resolution',
    labelHindi: 'विवाद समाधान',
    placeholder: 'How disputes will be resolved',
    category: 'terms'
  },

  // ─────────────────────────────────────────────────────────────
  // WITNESS FIELDS
  // ─────────────────────────────────────────────────────────────
  witnessName: {
    type: 'text',
    label: 'Witness Name',
    labelHindi: 'गवाह का नाम',
    placeholder: 'Full name of witness',
    category: 'witness'
  },
  witnessAddress: {
    type: 'textarea',
    label: 'Witness Address',
    labelHindi: 'गवाह का पता',
    placeholder: 'Address of witness',
    category: 'witness'
  },

  // ─────────────────────────────────────────────────────────────
  // STYLING FIELDS
  // ─────────────────────────────────────────────────────────────
  accentColor: {
    type: 'color',
    label: 'Accent Color',
    labelHindi: 'एक्सेंट रंग',
    category: 'styling'
  },
  showLogo: {
    type: 'checkbox',
    label: 'Show Logo',
    labelHindi: 'लोगो दिखाएं',
    category: 'styling'
  },
  showPageNumbers: {
    type: 'checkbox',
    label: 'Show Page Numbers',
    labelHindi: 'पृष्ठ संख्या दिखाएं',
    category: 'styling'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: TEMPLATE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const AGREEMENT_TEMPLATE_CONFIGS: Record<AgreementTemplateType, {
  name: string;
  nameHindi: string;
  description: string;
  icon: string;
  sections: string[];
  recommendedFor: string[];
  legalDisclaimer: string;
}> = {
  nda: {
    name: 'Non-Disclosure Agreement',
    nameHindi: 'गैर-प्रकटीकरण समझौता',
    description: 'Protect confidential information shared between parties',
    icon: '🔒',
    sections: ['header', 'parties', 'recitals', 'definitions', 'obligations', 'exclusions', 'term', 'remedies', 'general', 'signatures'],
    recommendedFor: ['Business discussions', 'Partnerships', 'Employee onboarding', 'Vendor agreements'],
    legalDisclaimer: 'This is a template for reference. Please consult a legal professional before use.'
  },
  service: {
    name: 'Service Agreement',
    nameHindi: 'सेवा समझौता',
    description: 'Contract for providing professional services',
    icon: '🤝',
    sections: ['header', 'parties', 'scope', 'deliverables', 'timeline', 'payment', 'warranties', 'liability', 'termination', 'general', 'signatures'],
    recommendedFor: ['Consultants', 'Agencies', 'Professional services', 'IT services'],
    legalDisclaimer: 'This is a template for reference. Please consult a legal professional before use.'
  },
  rental: {
    name: 'Rental Agreement',
    nameHindi: 'किराया समझौता',
    description: 'Lease agreement for residential or commercial property',
    icon: '🏠',
    sections: ['header', 'parties', 'property', 'term', 'rent', 'deposit', 'maintenance', 'restrictions', 'termination', 'general', 'signatures', 'witnesses'],
    recommendedFor: ['Landlords', 'Tenants', 'Property managers', 'Real estate'],
    legalDisclaimer: 'This agreement should be registered as per local laws. Consult a legal professional.'
  },
  partnership: {
    name: 'Partnership Agreement',
    nameHindi: 'साझेदारी समझौता',
    description: 'Agreement between partners for business partnership',
    icon: '👥',
    sections: ['header', 'parties', 'firm-details', 'capital', 'profit-loss', 'management', 'banking', 'dissolution', 'general', 'signatures', 'witnesses'],
    recommendedFor: ['Business partners', 'Startups', 'Joint ventures', 'Professional firms'],
    legalDisclaimer: 'Partnership should be registered under Partnership Act. Consult a legal professional.'
  },
  employment: {
    name: 'Employment Contract',
    nameHindi: 'रोजगार अनुबंध',
    description: 'Contract between employer and employee',
    icon: '💼',
    sections: ['header', 'parties', 'position', 'compensation', 'benefits', 'duties', 'confidentiality', 'termination', 'general', 'signatures'],
    recommendedFor: ['Companies', 'Startups', 'HR departments', 'Recruitment'],
    legalDisclaimer: 'Must comply with labor laws. Consult HR and legal professionals.'
  },
  freelance: {
    name: 'Freelance Agreement',
    nameHindi: 'फ्रीलांस समझौता',
    description: 'Contract for freelance/independent contractor work',
    icon: '💻',
    sections: ['header', 'parties', 'project', 'deliverables', 'timeline', 'payment', 'ip-rights', 'confidentiality', 'termination', 'general', 'signatures'],
    recommendedFor: ['Freelancers', 'Contractors', 'Clients', 'Project-based work'],
    legalDisclaimer: 'This is a template for reference. Please consult a legal professional before use.'
  },
  mou: {
    name: 'Memorandum of Understanding',
    nameHindi: 'समझौता ज्ञापन',
    description: 'Non-binding agreement outlining intentions between parties',
    icon: '📝',
    sections: ['header', 'parties', 'background', 'intent', 'cooperation', 'responsibilities', 'resources', 'timeline', 'general', 'signatures'],
    recommendedFor: ['Collaborations', 'Government bodies', 'NGOs', 'Academic institutions'],
    legalDisclaimer: 'MOUs are typically non-binding. For binding agreements, use a formal contract.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const AGREEMENT_SAMPLE_DATA: Record<AgreementTemplateType, Partial<AgreementData>> = {
  nda: {
    templateType: 'nda',
    agreementTitle: 'Non-Disclosure Agreement',
    agreementNumber: 'NDA/2025/001',
    effectiveDate: '2025-12-15',
    placeOfExecution: 'New Delhi',
    jurisdiction: 'Courts of New Delhi',
    governingLaw: 'Laws of India',
    firstParty: {
      type: 'company',
      name: 'TechVentures Pvt. Ltd.',
      representedBy: 'Rahul Sharma',
      designation: 'Director',
      address: '123, Tech Park, Sector 62, Noida, UP - 201301',
      email: 'legal@techventures.in',
      pan: 'AABCT1234A',
      gstin: '09AABCT1234A1Z5'
    },
    secondParty: {
      type: 'individual',
      name: 'Priya Patel',
      address: '456, Green Valley Apartments, Gurgaon, Haryana - 122001',
      email: 'priya.patel@email.com',
      pan: 'ABCPP1234F'
    },
    nda: {
      ndaType: 'bilateral',
      purpose: 'To explore potential business collaboration in software development services',
      confidentialInfo: [
        'Technical specifications and designs',
        'Business plans and strategies',
        'Customer lists and data',
        'Financial information',
        'Trade secrets and proprietary information'
      ],
      exclusions: [
        'Information already in public domain',
        'Information independently developed',
        'Information received from third parties without restriction'
      ],
      confidentialityPeriod: '5 years from the date of disclosure'
    },
    terms: {
      duration: '2 years',
      termination: 'Either party may terminate with 30 days written notice',
      disputeResolution: 'Arbitration under Arbitration and Conciliation Act, 1996'
    },
    witnesses: [
      { name: 'Amit Kumar', address: 'Delhi' },
      { name: 'Sneha Reddy', address: 'Delhi' }
    ],
    accentColor: '#1e40af'
  },

  service: {
    templateType: 'service',
    agreementTitle: 'Service Agreement',
    agreementNumber: 'SA/2025/042',
    effectiveDate: '2025-12-15',
    expiryDate: '2026-12-14',
    placeOfExecution: 'Mumbai',
    jurisdiction: 'Courts of Mumbai',
    firstParty: {
      type: 'company',
      name: 'GlobalTech Solutions Pvt. Ltd.',
      representedBy: 'Vikram Malhotra',
      designation: 'CEO',
      address: 'Tech Tower, Bandra Kurla Complex, Mumbai - 400051',
      email: 'contracts@globaltech.in',
      gstin: '27AABCG1234A1Z5'
    },
    secondParty: {
      type: 'company',
      name: 'Digital Marketing Pro',
      representedBy: 'Anita Desai',
      designation: 'Managing Partner',
      address: '789, Business Hub, Andheri East, Mumbai - 400069',
      email: 'anita@digitalmarketingpro.in',
      gstin: '27AABCD5678B1Z3'
    },
    service: {
      serviceDescription: 'Comprehensive digital marketing services including SEO, SEM, Social Media Management, and Content Marketing',
      scopeOfWork: [
        'Search Engine Optimization (SEO) for company website',
        'Google Ads campaign management',
        'Social media management for LinkedIn, Twitter, and Instagram',
        'Monthly content creation (8 blog posts, 20 social posts)',
        'Monthly analytics and reporting'
      ],
      deliverables: [
        { name: 'SEO Audit Report', deadline: '2025-12-30' },
        { name: 'Social Media Strategy', deadline: '2026-01-15' },
        { name: 'Monthly Reports', description: 'Due by 5th of each month' }
      ],
      timeline: '12 months',
      serviceLevel: '99% uptime for managed services'
    },
    payment: {
      totalAmount: 1200000,
      currency: 'INR',
      paymentTerms: 'monthly',
      paymentSchedule: [
        { milestone: 'Monthly retainer', amount: 100000, description: 'Due by 1st of each month' }
      ]
    },
    accentColor: '#059669'
  },

  rental: {
    templateType: 'rental',
    agreementTitle: 'Residential Rental Agreement',
    agreementNumber: 'RENT/2025/089',
    effectiveDate: '2025-12-15',
    placeOfExecution: 'Bangalore',
    jurisdiction: 'Courts of Bangalore',
    firstParty: {
      type: 'individual',
      name: 'Rajesh Kumar',
      address: '123, Owners Villa, Koramangala, Bangalore - 560034',
      email: 'rajesh.kumar@email.com',
      phone: '+91 98765 43210',
      pan: 'ABCPR1234F'
    },
    secondParty: {
      type: 'individual',
      name: 'Sneha Sharma',
      address: '456, Previous Address, HSR Layout, Bangalore - 560102',
      email: 'sneha.sharma@email.com',
      phone: '+91 87654 32109',
      aadhaar: '1234 5678 9012'
    },
    rental: {
      property: {
        type: 'residential',
        address: 'Flat No. 302, Green Valley Apartments, 4th Cross, Indiranagar, Bangalore - 560038',
        area: '1200',
        areaUnit: 'sqft',
        furnishing: 'semi-furnished',
        amenities: ['24x7 Security', 'Power Backup', 'Parking', 'Gym', 'Swimming Pool'],
        inventoryList: ['3 AC units', '1 Refrigerator', '1 Washing Machine', '3 Beds with mattress', '1 Dining table with 6 chairs']
      },
      rentAmount: 35000,
      rentFrequency: 'monthly',
      securityDeposit: 200000,
      maintenanceCharges: 3500,
      rentDueDate: '5th of every month',
      leaseDuration: '11 months',
      lockInPeriod: '6 months',
      renewalTerms: 'Renewable with 10% increment',
      utilities: ['Electricity', 'Water', 'Gas'],
      restrictions: ['No pets allowed', 'No subletting', 'No structural modifications']
    },
    witnesses: [
      { name: 'Amit Singh', address: 'Bangalore' },
      { name: 'Priya Menon', address: 'Bangalore' }
    ],
    accentColor: '#b45309'
  },

  partnership: {
    templateType: 'partnership',
    agreementTitle: 'Partnership Deed',
    agreementNumber: 'PART/2025/015',
    effectiveDate: '2025-12-15',
    placeOfExecution: 'Hyderabad',
    jurisdiction: 'Courts of Hyderabad',
    firstParty: {
      type: 'individual',
      name: 'Venkat Rao',
      address: '123, Banjara Hills, Hyderabad - 500034',
      pan: 'ABCPV1234A'
    },
    secondParty: {
      type: 'individual',
      name: 'Lakshmi Devi',
      address: '456, Jubilee Hills, Hyderabad - 500033',
      pan: 'DEFPL5678B'
    },
    partnership: {
      firmName: 'V&L Technologies',
      businessNature: 'Software Development and IT Consulting',
      businessAddress: '789, HITEC City, Hyderabad - 500081',
      capitalContribution: [
        { partner: 'Venkat Rao', amount: 2500000, percentage: 50 },
        { partner: 'Lakshmi Devi', amount: 2500000, percentage: 50 }
      ],
      profitSharingRatio: '50:50',
      lossSharingRatio: '50:50',
      managementRoles: [
        { partner: 'Venkat Rao', role: 'Managing Partner', responsibilities: ['Business Development', 'Client Relations'] },
        { partner: 'Lakshmi Devi', role: 'Technical Partner', responsibilities: ['Technology', 'Delivery'] }
      ],
      bankingArrangements: 'Joint operation with both partners as signatories',
      accountingYear: 'April to March'
    },
    witnesses: [
      { name: 'Suresh Reddy', address: 'Hyderabad' },
      { name: 'Kavitha Nair', address: 'Hyderabad' }
    ],
    accentColor: '#7c3aed'
  },

  employment: {
    templateType: 'employment',
    agreementTitle: 'Employment Contract',
    agreementNumber: 'EMP/2025/156',
    effectiveDate: '2025-12-15',
    placeOfExecution: 'Pune',
    jurisdiction: 'Courts of Pune',
    firstParty: {
      type: 'company',
      name: 'Innovate Solutions Pvt. Ltd.',
      representedBy: 'Arun Joshi',
      designation: 'HR Director',
      address: 'Innovation Hub, Hinjewadi Phase 2, Pune - 411057',
      email: 'hr@innovatesolutions.in'
    },
    secondParty: {
      type: 'individual',
      name: 'Karthik Rajan',
      address: '789, Wakad, Pune - 411057',
      email: 'karthik.rajan@email.com',
      pan: 'ABCPK9876D'
    },
    employment: {
      position: 'Senior Software Engineer',
      department: 'Engineering',
      reportingTo: 'Engineering Manager',
      startDate: '2026-01-02',
      probationPeriod: '6 months',
      workLocation: 'Pune Office (Hybrid)',
      workHours: '9:00 AM to 6:00 PM, Monday to Friday',
      salary: 1800000,
      salaryFrequency: 'annual',
      benefits: ['Health Insurance', 'Life Insurance', 'Provident Fund', 'Gratuity', 'Annual Bonus'],
      leavePolicy: '24 days annual leave + 12 sick leaves + 10 public holidays',
      noticePeriod: '60 days'
    },
    terms: {
      confidentiality: 'Employee shall maintain confidentiality of all proprietary information',
      nonCompete: 'Employee shall not join competing business for 1 year post employment',
      intellectualProperty: 'All work product belongs to the Company'
    },
    accentColor: '#0891b2'
  },

  freelance: {
    templateType: 'freelance',
    agreementTitle: 'Freelance Service Agreement',
    agreementNumber: 'FRL/2025/078',
    effectiveDate: '2025-12-15',
    placeOfExecution: 'Chennai',
    jurisdiction: 'Courts of Chennai',
    firstParty: {
      type: 'company',
      name: 'Creative Agency Co.',
      representedBy: 'Maya Krishnan',
      designation: 'Creative Director',
      address: 'Design Hub, T. Nagar, Chennai - 600017',
      email: 'projects@creativeagency.in'
    },
    secondParty: {
      type: 'individual',
      name: 'Arjun Menon',
      address: '456, Adyar, Chennai - 600020',
      email: 'arjun.design@email.com',
      pan: 'DEFPA1234B'
    },
    freelance: {
      projectName: 'Brand Identity Redesign - TechStart',
      projectDescription: 'Complete brand identity redesign including logo, color palette, typography, brand guidelines, and marketing collaterals',
      deliverables: [
        { name: 'Logo Design', description: '3 concepts with revisions', deadline: '2026-01-15', amount: 30000 },
        { name: 'Brand Guidelines', description: '20-page brand book', deadline: '2026-02-01', amount: 25000 },
        { name: 'Marketing Collaterals', description: 'Business cards, letterhead, presentation template', deadline: '2026-02-15', amount: 20000 }
      ],
      startDate: '2025-12-20',
      endDate: '2026-02-28',
      rate: 75000,
      rateType: 'fixed',
      paymentTerms: 'milestone',
      revisions: 3
    },
    payment: {
      totalAmount: 75000,
      currency: 'INR',
      paymentTerms: 'milestone',
      paymentSchedule: [
        { milestone: 'Advance', amount: 25000, percentage: 33, description: 'On signing' },
        { milestone: 'Mid-project', amount: 25000, percentage: 33, description: 'After logo approval' },
        { milestone: 'Final', amount: 25000, percentage: 34, description: 'On completion' }
      ]
    },
    accentColor: '#dc2626'
  },

  mou: {
    templateType: 'mou',
    agreementTitle: 'Memorandum of Understanding',
    agreementNumber: 'MOU/2025/003',
    effectiveDate: '2025-12-15',
    placeOfExecution: 'Kolkata',
    firstParty: {
      type: 'company',
      name: 'Eastern University',
      representedBy: 'Dr. Sanjay Mukherjee',
      designation: 'Vice Chancellor',
      address: 'University Campus, Salt Lake, Kolkata - 700091',
      email: 'vc@easternuniversity.edu.in'
    },
    secondParty: {
      type: 'company',
      name: 'TechCorp India Pvt. Ltd.',
      representedBy: 'Anil Agarwal',
      designation: 'CEO',
      address: 'Tech Park, Rajarhat, Kolkata - 700156',
      email: 'ceo@techcorp.in'
    },
    mou: {
      partiesIntent: 'To establish a collaborative framework for industry-academia partnership in the field of technology education and research',
      areasOfCooperation: [
        'Internship programs for final year students',
        'Joint research projects in AI and Machine Learning',
        'Guest lectures by industry professionals',
        'Curriculum development inputs',
        'Campus recruitment drives',
        'Sponsored lab equipment'
      ],
      responsibilities: [
        {
          party: 'Eastern University',
          responsibilities: [
            'Provide access to research facilities',
            'Coordinate student internship program',
            'Share research findings',
            'Facilitate faculty exchange'
          ]
        },
        {
          party: 'TechCorp India',
          responsibilities: [
            'Offer internship positions (minimum 50/year)',
            'Provide industry mentors',
            'Sponsor research equipment',
            'Conduct quarterly guest lectures'
          ]
        }
      ],
      timeline: '3 years with annual review',
      nonBinding: true
    },
    terms: {
      duration: '3 years',
      renewal: 'Renewable by mutual consent'
    },
    accentColor: '#4f46e5'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get fields applicable to a specific template type
 */
export function getFieldsForTemplateType(templateType: AgreementTemplateType): string[] {
  const commonFields = [
    'agreementTitle', 'agreementNumber', 'effectiveDate', 'expiryDate',
    'firstParty', 'secondParty', 'placeOfExecution', 'jurisdiction', 'governingLaw',
    'duration', 'terminationClause', 'disputeResolution',
    'witnessName', 'witnessAddress', 'accentColor', 'showLogo', 'showPageNumbers'
  ];

  const templateSpecificFields: Record<AgreementTemplateType, string[]> = {
    nda: ['ndaType', 'confidentialInfo', 'confidentialityPeriod'],
    service: ['serviceDescription', 'scopeOfWork', 'totalAmount', 'paymentTerms'],
    rental: ['propertyType', 'propertyAddress', 'rentAmount', 'securityDeposit', 'leaseDuration'],
    partnership: ['firmName', 'businessNature', 'profitSharingRatio'],
    employment: ['position', 'department', 'salary', 'probationPeriod', 'noticePeriod'],
    freelance: ['projectName', 'projectDescription', 'rate', 'rateType'],
    mou: ['partiesIntent', 'areasOfCooperation']
  };

  return [...commonFields, ...templateSpecificFields[templateType]];
}

/**
 * Get sample data for preview
 */
export function getSampleData(templateType: AgreementTemplateType): Partial<AgreementData> {
  return AGREEMENT_SAMPLE_DATA[templateType];
}

/**
 * Get template info
 */
export function getTemplateInfo(templateType: AgreementTemplateType) {
  return AGREEMENT_TEMPLATE_CONFIGS[templateType];
}

/**
 * Validate agreement data
 */
export function validateAgreementData(data: Partial<AgreementData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.agreementTitle) errors.push('Agreement title is required');
  if (!data.effectiveDate) errors.push('Effective date is required');
  if (!data.firstParty?.name) errors.push('First party name is required');
  if (!data.firstParty?.address) errors.push('First party address is required');
  if (!data.secondParty?.name) errors.push('Second party name is required');
  if (!data.secondParty?.address) errors.push('Second party address is required');

  // Template-specific validation
  if (data.templateType === 'rental') {
    if (!data.rental?.property?.address) errors.push('Property address is required');
    if (!data.rental?.rentAmount) errors.push('Rent amount is required');
    if (!data.rental?.securityDeposit) errors.push('Security deposit is required');
  }

  if (data.templateType === 'employment') {
    if (!data.employment?.position) errors.push('Position is required');
    if (!data.employment?.salary) errors.push('Salary is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate agreement number
 */
export function generateAgreementNumber(templateType: AgreementTemplateType, sequence: number): string {
  const prefixes: Record<AgreementTemplateType, string> = {
    nda: 'NDA',
    service: 'SA',
    rental: 'RENT',
    partnership: 'PART',
    employment: 'EMP',
    freelance: 'FRL',
    mou: 'MOU'
  };
  
  const year = new Date().getFullYear();
  const paddedSeq = String(sequence).padStart(3, '0');
  
  return `${prefixes[templateType]}/${year}/${paddedSeq}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  fields: AGREEMENT_FIELD_DEFINITIONS,
  templates: AGREEMENT_TEMPLATE_CONFIGS,
  sampleData: AGREEMENT_SAMPLE_DATA,
  getFieldsForTemplateType,
  getSampleData,
  getTemplateInfo,
  validateAgreementData,
  generateAgreementNumber
};