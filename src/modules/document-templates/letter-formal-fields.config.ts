// ═══════════════════════════════════════════════════════════════════════════════
// SORIVA TEMPLATES - LETTER FORMAL FIELDS CONFIGURATION
// Comprehensive configuration for all formal letter template types
// Templates: Professional, Cover Letter, Recommendation, Resignation, Reference, Personal
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'ai-textarea' 
  | 'email' 
  | 'tel' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'number' 
  | 'url' 
  | 'color';

export type LetterFormalTemplateType = 
  | 'professional'    // General professional/business letters
  | 'cover'           // Job application cover letters
  | 'recommendation'  // Letters of recommendation
  | 'resignation'     // Job resignation letters
  | 'reference'       // Character/professional reference letters
  | 'personal';       // Personal formal letters (condolence, congratulations, etc.)

// Letter Format Types
export type LetterFormatType = 
  | 'full-block'      // All text aligned left
  | 'modified-block'  // Date & closing aligned right
  | 'semi-block'      // Paragraphs indented
  | 'simplified';     // No salutation/closing - direct

// Salutation Types
export type SalutationType = 
  | 'Dear'
  | 'Respected'
  | 'To'
  | 'Dear Sir/Madam'
  | 'To Whom It May Concern'
  | 'Dear Hiring Manager'
  | 'Dear Selection Committee'
  | 'Dear Admissions Committee';

// Closing Types
export type ClosingType = 
  | 'Sincerely'
  | 'Yours sincerely'
  | 'Yours faithfully'
  | 'Best regards'
  | 'Kind regards'
  | 'Warm regards'
  | 'Respectfully'
  | 'With gratitude'
  | 'With appreciation'
  | 'Yours truly'
  | 'With heartfelt wishes'
  | 'With deepest sympathy';

// Professional Letter Types
export type ProfessionalLetterType = 
  | 'business-inquiry'
  | 'business-proposal'
  | 'complaint'
  | 'request'
  | 'acknowledgment'
  | 'apology'
  | 'confirmation'
  | 'invitation'
  | 'announcement'
  | 'appreciation'
  | 'introduction'
  | 'follow-up'
  | 'termination'
  | 'warning'
  | 'general';

// Cover Letter Types
export type CoverLetterType = 
  | 'job-application'
  | 'internship'
  | 'career-change'
  | 'referral'
  | 'networking'
  | 'cold-contact'
  | 'internal-transfer'
  | 'promotion'
  | 'freelance'
  | 'academic';

// Recommendation Letter Types
export type RecommendationLetterType = 
  | 'employment'
  | 'academic'
  | 'graduate-school'
  | 'scholarship'
  | 'character'
  | 'professional'
  | 'volunteer'
  | 'promotion'
  | 'award-nomination';

// Resignation Letter Types
export type ResignationLetterType = 
  | 'standard'
  | 'two-weeks-notice'
  | 'immediate'
  | 'retirement'
  | 'career-change'
  | 'relocation'
  | 'health-reasons'
  | 'family-reasons'
  | 'better-opportunity'
  | 'hostile-environment';

// Reference Letter Types
export type ReferenceLetterType = 
  | 'employment'
  | 'character'
  | 'academic'
  | 'tenant'
  | 'immigration'
  | 'court'
  | 'adoption'
  | 'professional-membership'
  | 'volunteer';

// Personal Formal Letter Types
export type PersonalLetterType = 
  | 'congratulations'
  | 'condolence'
  | 'thank-you'
  | 'apology'
  | 'invitation'
  | 'announcement'
  | 'request'
  | 'complaint'
  | 'appreciation'
  | 'farewell';

// Relationship Types (for recommendation/reference)
export type RelationshipType = 
  | 'supervisor'
  | 'manager'
  | 'colleague'
  | 'professor'
  | 'teacher'
  | 'mentor'
  | 'client'
  | 'business-partner'
  | 'friend'
  | 'neighbor'
  | 'family-friend'
  | 'religious-leader'
  | 'community-leader';

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

// Sender Information
export interface SenderInfo {
  name: string;
  designation?: string;
  company?: string;
  department?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
}

// Recipient Information
export interface RecipientInfo {
  name: string;
  designation?: string;
  company?: string;
  department?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  email?: string;
}

// Professional Letter Details
export interface ProfessionalDetails {
  letterType: ProfessionalLetterType;
  referenceNumber?: string;
  inResponseTo?: string;
  purpose: string;
  keyPoints?: string;
  actionRequired?: string;
  deadline?: string;
  attachments?: string;
}

// Cover Letter Details
export interface CoverLetterDetails {
  coverType: CoverLetterType;
  jobTitle: string;
  jobReference?: string;
  companyName: string;
  whereFound?: string;
  referrerName?: string;
  currentRole?: string;
  yearsExperience?: number;
  keySkills: string;
  achievements?: string;
  whyCompany: string;
  whyYou: string;
  availability?: string;
  salaryExpectation?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
}

// Recommendation Letter Details
export interface RecommendationDetails {
  recommendationType: RecommendationLetterType;
  candidateName: string;
  candidateRole?: string;
  relationship: RelationshipType;
  knowingSince: string;
  duration?: string;
  context: string;
  skills?: string;
  achievements?: string;
  personalQualities?: string;
  specificExamples?: string;
  comparativeAssessment?: string;
  areasOfImprovement?: string;
  recommendationStrength: 'highest' | 'strong' | 'moderate' | 'reserved';
  targetPosition?: string;
  targetInstitution?: string;
}

// Resignation Letter Details
export interface ResignationDetails {
  resignationType: ResignationLetterType;
  currentPosition: string;
  department?: string;
  lastWorkingDate: string;
  noticePeriod?: string;
  joiningDate?: string;
  reasonForLeaving?: string;
  gratitudePoints?: string;
  transitionPlan?: string;
  handoverNotes?: string;
  exitInterviewAvailability?: boolean;
  returnableItems?: string;
  pendingMatters?: string;
  forwardingAddress?: string;
}

// Reference Letter Details
export interface ReferenceDetails {
  referenceType: ReferenceLetterType;
  personName: string;
  personRole?: string;
  relationship: RelationshipType;
  knowingDuration: string;
  context: string;
  characterTraits?: string;
  professionalSkills?: string;
  specificExamples?: string;
  reliability?: string;
  recommendation?: string;
  purposeOfReference?: string;
  contactPermission?: boolean;
}

// Personal Formal Letter Details
export interface PersonalDetails {
  personalType: PersonalLetterType;
  occasion?: string;
  occasionDate?: string;
  relationship?: string;
  sharedMemory?: string;
  sentiments?: string;
  futureWishes?: string;
  offerOfSupport?: string;
}

// Main Letter Data Interface
export interface LetterFormalData {
  templateType: LetterFormalTemplateType;
  letterFormat?: LetterFormatType;
  // Date & Reference
  letterDate: string;
  referenceNumber?: string;
  // Sender
  senderName: string;
  senderDesignation?: string;
  senderCompany?: string;
  senderDepartment?: string;
  senderAddress?: string;
  senderCity?: string;
  senderState?: string;
  senderPincode?: string;
  senderCountry?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderWebsite?: string;
  // Recipient
  recipientName: string;
  recipientDesignation?: string;
  recipientCompany?: string;
  recipientDepartment?: string;
  recipientAddress?: string;
  recipientCity?: string;
  recipientState?: string;
  recipientPincode?: string;
  recipientCountry?: string;
  // Letter Content
  salutation: SalutationType;
  subject?: string;
  letterBody: string;
  closing: ClosingType;
  // Signature
  includeSignature?: boolean;
  signatureImage?: string;
  // Template Specific
  professional?: ProfessionalDetails;
  cover?: CoverLetterDetails;
  recommendation?: RecommendationDetails;
  resignation?: ResignationDetails;
  reference?: ReferenceDetails;
  personal?: PersonalDetails;
  // Styling
  accentColor?: string;
  letterhead?: boolean;
  companyLogo?: string;
}

// Field Configuration Interface
export interface FieldConfig {
  type: FieldType;
  label: string;
  labelHindi: string;
  placeholder?: string;
  required?: boolean;
  category: string;
  templateTypes?: LetterFormalTemplateType[];
  options?: Array<{ value: string; label: string }>;
  aiPrompt?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: FIELD DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const LETTER_FORMAL_FIELDS: Record<string, FieldConfig> = {
  // ─────────────────────────────────────────────────────────────
  // META & FORMAT FIELDS
  // ─────────────────────────────────────────────────────────────
  templateType: {
    type: 'select',
    label: 'Letter Type',
    labelHindi: 'पत्र प्रकार',
    required: true,
    category: 'meta',
    options: [
      { value: 'professional', label: 'Professional Letter / व्यावसायिक पत्र' },
      { value: 'cover', label: 'Cover Letter / कवर लेटर' },
      { value: 'recommendation', label: 'Recommendation Letter / सिफारिश पत्र' },
      { value: 'resignation', label: 'Resignation Letter / त्यागपत्र' },
      { value: 'reference', label: 'Reference Letter / संदर्भ पत्र' },
      { value: 'personal', label: 'Personal Formal Letter / व्यक्तिगत औपचारिक पत्र' }
    ]
  },
  letterFormat: {
    type: 'select',
    label: 'Letter Format',
    labelHindi: 'पत्र प्रारूप',
    category: 'meta',
    options: [
      { value: 'full-block', label: 'Full Block (All Left Aligned)' },
      { value: 'modified-block', label: 'Modified Block (Date & Closing Right)' },
      { value: 'semi-block', label: 'Semi-Block (Indented Paragraphs)' },
      { value: 'simplified', label: 'Simplified (No Salutation/Closing)' }
    ]
  },
  letterDate: {
    type: 'date',
    label: 'Letter Date',
    labelHindi: 'पत्र दिनांक',
    required: true,
    category: 'meta'
  },
  referenceNumber: {
    type: 'text',
    label: 'Reference Number',
    labelHindi: 'संदर्भ संख्या',
    placeholder: 'REF/2025/001',
    category: 'meta',
    templateTypes: ['professional']
  },

  // ─────────────────────────────────────────────────────────────
  // SENDER FIELDS
  // ─────────────────────────────────────────────────────────────
  senderName: {
    type: 'text',
    label: 'Your Full Name',
    labelHindi: 'आपका पूरा नाम',
    placeholder: 'Aman Singh',
    required: true,
    category: 'sender'
  },
  senderDesignation: {
    type: 'text',
    label: 'Your Designation',
    labelHindi: 'आपका पद',
    placeholder: 'Senior Software Engineer',
    category: 'sender'
  },
  senderCompany: {
    type: 'text',
    label: 'Your Company/Organization',
    labelHindi: 'आपकी कंपनी/संस्था',
    placeholder: 'Risenex Global Pvt. Ltd.',
    category: 'sender'
  },
  senderDepartment: {
    type: 'text',
    label: 'Department',
    labelHindi: 'विभाग',
    placeholder: 'Engineering Department',
    category: 'sender'
  },
  senderAddress: {
    type: 'textarea',
    label: 'Your Address',
    labelHindi: 'आपका पता',
    placeholder: '123, Street Name, Area',
    category: 'sender'
  },
  senderCity: {
    type: 'text',
    label: 'City',
    labelHindi: 'शहर',
    placeholder: 'Ferozepur',
    category: 'sender'
  },
  senderState: {
    type: 'text',
    label: 'State',
    labelHindi: 'राज्य',
    placeholder: 'Punjab',
    category: 'sender'
  },
  senderPincode: {
    type: 'text',
    label: 'PIN Code',
    labelHindi: 'पिन कोड',
    placeholder: '152002',
    category: 'sender'
  },
  senderCountry: {
    type: 'text',
    label: 'Country',
    labelHindi: 'देश',
    placeholder: 'India',
    category: 'sender'
  },
  senderEmail: {
    type: 'email',
    label: 'Your Email',
    labelHindi: 'आपका ईमेल',
    placeholder: 'aman@risenex.com',
    category: 'sender'
  },
  senderPhone: {
    type: 'tel',
    label: 'Your Phone',
    labelHindi: 'आपका फ़ोन',
    placeholder: '+91 98765 43210',
    category: 'sender'
  },
  senderWebsite: {
    type: 'url',
    label: 'Website',
    labelHindi: 'वेबसाइट',
    placeholder: 'https://www.risenex.com',
    category: 'sender'
  },

  // ─────────────────────────────────────────────────────────────
  // RECIPIENT FIELDS
  // ─────────────────────────────────────────────────────────────
  recipientName: {
    type: 'text',
    label: 'Recipient Name',
    labelHindi: 'प्राप्तकर्ता का नाम',
    placeholder: 'Mr. Rajesh Kumar',
    required: true,
    category: 'recipient'
  },
  recipientDesignation: {
    type: 'text',
    label: 'Recipient Designation',
    labelHindi: 'प्राप्तकर्ता का पद',
    placeholder: 'HR Manager',
    category: 'recipient'
  },
  recipientCompany: {
    type: 'text',
    label: 'Recipient Company',
    labelHindi: 'प्राप्तकर्ता की कंपनी',
    placeholder: 'Tech Solutions Pvt. Ltd.',
    category: 'recipient'
  },
  recipientDepartment: {
    type: 'text',
    label: 'Department',
    labelHindi: 'विभाग',
    placeholder: 'Human Resources',
    category: 'recipient'
  },
  recipientAddress: {
    type: 'textarea',
    label: 'Recipient Address',
    labelHindi: 'प्राप्तकर्ता का पता',
    placeholder: '456, Corporate Park, Sector 15',
    category: 'recipient'
  },
  recipientCity: {
    type: 'text',
    label: 'City',
    labelHindi: 'शहर',
    placeholder: 'Gurugram',
    category: 'recipient'
  },
  recipientState: {
    type: 'text',
    label: 'State',
    labelHindi: 'राज्य',
    placeholder: 'Haryana',
    category: 'recipient'
  },
  recipientPincode: {
    type: 'text',
    label: 'PIN Code',
    labelHindi: 'पिन कोड',
    placeholder: '122001',
    category: 'recipient'
  },
  recipientCountry: {
    type: 'text',
    label: 'Country',
    labelHindi: 'देश',
    placeholder: 'India',
    category: 'recipient'
  },

  // ─────────────────────────────────────────────────────────────
  // LETTER CONTENT FIELDS
  // ─────────────────────────────────────────────────────────────
  salutation: {
    type: 'select',
    label: 'Salutation',
    labelHindi: 'अभिवादन',
    required: true,
    category: 'content',
    options: [
      { value: 'Dear', label: 'Dear' },
      { value: 'Respected', label: 'Respected' },
      { value: 'To', label: 'To' },
      { value: 'Dear Sir/Madam', label: 'Dear Sir/Madam' },
      { value: 'To Whom It May Concern', label: 'To Whom It May Concern' },
      { value: 'Dear Hiring Manager', label: 'Dear Hiring Manager' },
      { value: 'Dear Selection Committee', label: 'Dear Selection Committee' },
      { value: 'Dear Admissions Committee', label: 'Dear Admissions Committee' }
    ]
  },
  subject: {
    type: 'text',
    label: 'Subject Line',
    labelHindi: 'विषय',
    placeholder: 'Application for Senior Developer Position',
    category: 'content'
  },
  letterBody: {
    type: 'ai-textarea',
    label: 'Letter Body',
    labelHindi: 'पत्र सामग्री',
    placeholder: 'Write the main content of your letter...',
    required: true,
    category: 'content',
    aiPrompt: 'Write a professional formal letter based on the context. Maintain appropriate tone, clear structure, and professional language. Include proper opening, body paragraphs, and conclusion.'
  },
  closing: {
    type: 'select',
    label: 'Closing',
    labelHindi: 'समापन',
    required: true,
    category: 'content',
    options: [
      { value: 'Sincerely', label: 'Sincerely' },
      { value: 'Yours sincerely', label: 'Yours sincerely' },
      { value: 'Yours faithfully', label: 'Yours faithfully' },
      { value: 'Best regards', label: 'Best regards' },
      { value: 'Kind regards', label: 'Kind regards' },
      { value: 'Warm regards', label: 'Warm regards' },
      { value: 'Respectfully', label: 'Respectfully' },
      { value: 'With gratitude', label: 'With gratitude' },
      { value: 'With appreciation', label: 'With appreciation' },
      { value: 'Yours truly', label: 'Yours truly' }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // PROFESSIONAL LETTER FIELDS
  // ─────────────────────────────────────────────────────────────
  professionalLetterType: {
    type: 'select',
    label: 'Professional Letter Type',
    labelHindi: 'व्यावसायिक पत्र प्रकार',
    required: true,
    category: 'professional',
    templateTypes: ['professional'],
    options: [
      { value: 'business-inquiry', label: 'Business Inquiry / व्यापार पूछताछ' },
      { value: 'business-proposal', label: 'Business Proposal / व्यापार प्रस्ताव' },
      { value: 'complaint', label: 'Complaint / शिकायत' },
      { value: 'request', label: 'Request / अनुरोध' },
      { value: 'acknowledgment', label: 'Acknowledgment / स्वीकृति' },
      { value: 'apology', label: 'Apology / क्षमा याचना' },
      { value: 'confirmation', label: 'Confirmation / पुष्टि' },
      { value: 'invitation', label: 'Invitation / निमंत्रण' },
      { value: 'announcement', label: 'Announcement / घोषणा' },
      { value: 'appreciation', label: 'Appreciation / प्रशंसा' },
      { value: 'introduction', label: 'Introduction / परिचय' },
      { value: 'follow-up', label: 'Follow-up / अनुवर्ती' },
      { value: 'termination', label: 'Termination / समाप्ति' },
      { value: 'warning', label: 'Warning / चेतावनी' },
      { value: 'general', label: 'General / सामान्य' }
    ]
  },
  purpose: {
    type: 'textarea',
    label: 'Purpose of Letter',
    labelHindi: 'पत्र का उद्देश्य',
    placeholder: 'Briefly describe the purpose of this letter...',
    required: true,
    category: 'professional',
    templateTypes: ['professional']
  },
  inResponseTo: {
    type: 'text',
    label: 'In Response To',
    labelHindi: 'के जवाब में',
    placeholder: 'Your letter dated 15th December 2025...',
    category: 'professional',
    templateTypes: ['professional']
  },
  keyPoints: {
    type: 'ai-textarea',
    label: 'Key Points',
    labelHindi: 'मुख्य बिंदु',
    placeholder: 'List the key points to be covered...',
    category: 'professional',
    templateTypes: ['professional'],
    aiPrompt: 'Generate clear, concise key points for a professional letter based on the purpose provided.'
  },
  actionRequired: {
    type: 'textarea',
    label: 'Action Required',
    labelHindi: 'आवश्यक कार्रवाई',
    placeholder: 'Please confirm by December 25, 2025...',
    category: 'professional',
    templateTypes: ['professional']
  },
  deadline: {
    type: 'text',
    label: 'Deadline/Timeline',
    labelHindi: 'समय सीमा',
    placeholder: 'Within 7 working days',
    category: 'professional',
    templateTypes: ['professional']
  },
  attachmentsList: {
    type: 'textarea',
    label: 'Attachments',
    labelHindi: 'संलग्नक',
    placeholder: '1. Proposal document\n2. Company profile',
    category: 'professional',
    templateTypes: ['professional']
  },

  // ─────────────────────────────────────────────────────────────
  // COVER LETTER FIELDS
  // ─────────────────────────────────────────────────────────────
  coverLetterType: {
    type: 'select',
    label: 'Cover Letter Type',
    labelHindi: 'कवर लेटर प्रकार',
    required: true,
    category: 'cover',
    templateTypes: ['cover'],
    options: [
      { value: 'job-application', label: 'Job Application / नौकरी आवेदन' },
      { value: 'internship', label: 'Internship / इंटर्नशिप' },
      { value: 'career-change', label: 'Career Change / करियर परिवर्तन' },
      { value: 'referral', label: 'Referral Based / रेफरल आधारित' },
      { value: 'networking', label: 'Networking / नेटवर्किंग' },
      { value: 'cold-contact', label: 'Cold Contact / सीधा संपर्क' },
      { value: 'internal-transfer', label: 'Internal Transfer / आंतरिक स्थानांतरण' },
      { value: 'promotion', label: 'Promotion Application / पदोन्नति आवेदन' },
      { value: 'freelance', label: 'Freelance/Contract / फ्रीलांस' },
      { value: 'academic', label: 'Academic Position / शैक्षणिक पद' }
    ]
  },
  jobTitle: {
    type: 'text',
    label: 'Job Title',
    labelHindi: 'पद का नाम',
    placeholder: 'Senior Full Stack Developer',
    required: true,
    category: 'cover',
    templateTypes: ['cover']
  },
  jobReference: {
    type: 'text',
    label: 'Job Reference/ID',
    labelHindi: 'जॉब संदर्भ/आईडी',
    placeholder: 'JOB-2025-DEV-042',
    category: 'cover',
    templateTypes: ['cover']
  },
  whereFound: {
    type: 'text',
    label: 'Where Did You Find This Job?',
    labelHindi: 'नौकरी कहाँ देखी?',
    placeholder: 'LinkedIn, Company Website, Naukri.com',
    category: 'cover',
    templateTypes: ['cover']
  },
  referrerName: {
    type: 'text',
    label: 'Referrer Name (if any)',
    labelHindi: 'रेफरर का नाम',
    placeholder: 'Mr. Vikram Sharma - Senior Manager',
    category: 'cover',
    templateTypes: ['cover']
  },
  currentRole: {
    type: 'text',
    label: 'Your Current Role',
    labelHindi: 'आपकी वर्तमान भूमिका',
    placeholder: 'Software Engineer at TechCorp',
    category: 'cover',
    templateTypes: ['cover']
  },
  yearsExperience: {
    type: 'number',
    label: 'Years of Experience',
    labelHindi: 'अनुभव के वर्ष',
    placeholder: '5',
    category: 'cover',
    templateTypes: ['cover']
  },
  keySkills: {
    type: 'ai-textarea',
    label: 'Key Skills & Expertise',
    labelHindi: 'मुख्य कौशल और विशेषज्ञता',
    placeholder: 'React, Node.js, TypeScript, AWS, MongoDB...',
    required: true,
    category: 'cover',
    templateTypes: ['cover'],
    aiPrompt: 'List relevant skills and expertise matching the job requirements. Be specific and include both technical and soft skills.'
  },
  achievements: {
    type: 'ai-textarea',
    label: 'Key Achievements',
    labelHindi: 'मुख्य उपलब्धियां',
    placeholder: 'Led a team of 5 developers to deliver...',
    category: 'cover',
    templateTypes: ['cover'],
    aiPrompt: 'Describe 2-3 quantifiable achievements relevant to the position. Use numbers and metrics where possible.'
  },
  whyCompany: {
    type: 'ai-textarea',
    label: 'Why This Company?',
    labelHindi: 'यह कंपनी क्यों?',
    placeholder: 'I am impressed by your innovative approach to...',
    required: true,
    category: 'cover',
    templateTypes: ['cover'],
    aiPrompt: 'Write a compelling paragraph about why you want to work at this specific company. Show research and genuine interest.'
  },
  whyYou: {
    type: 'ai-textarea',
    label: 'Why Should They Hire You?',
    labelHindi: 'आपको क्यों चुनें?',
    placeholder: 'My unique combination of skills...',
    required: true,
    category: 'cover',
    templateTypes: ['cover'],
    aiPrompt: 'Explain your unique value proposition. What makes you the ideal candidate for this role?'
  },
  availability: {
    type: 'text',
    label: 'Availability to Join',
    labelHindi: 'कब से शामिल हो सकते हैं',
    placeholder: 'Immediately / 30 days notice period',
    category: 'cover',
    templateTypes: ['cover']
  },
  salaryExpectation: {
    type: 'text',
    label: 'Salary Expectation',
    labelHindi: 'वेतन अपेक्षा',
    placeholder: '₹15-18 LPA / Negotiable',
    category: 'cover',
    templateTypes: ['cover']
  },
  portfolioUrl: {
    type: 'url',
    label: 'Portfolio URL',
    labelHindi: 'पोर्टफोलियो URL',
    placeholder: 'https://portfolio.example.com',
    category: 'cover',
    templateTypes: ['cover']
  },
  linkedinUrl: {
    type: 'url',
    label: 'LinkedIn Profile',
    labelHindi: 'लिंक्डइन प्रोफाइल',
    placeholder: 'https://linkedin.com/in/yourprofile',
    category: 'cover',
    templateTypes: ['cover']
  },

  // ─────────────────────────────────────────────────────────────
  // RECOMMENDATION LETTER FIELDS
  // ─────────────────────────────────────────────────────────────
  recommendationType: {
    type: 'select',
    label: 'Recommendation Type',
    labelHindi: 'सिफारिश प्रकार',
    required: true,
    category: 'recommendation',
    templateTypes: ['recommendation'],
    options: [
      { value: 'employment', label: 'Employment / रोजगार' },
      { value: 'academic', label: 'Academic / शैक्षणिक' },
      { value: 'graduate-school', label: 'Graduate School / स्नातकोत्तर' },
      { value: 'scholarship', label: 'Scholarship / छात्रवृत्ति' },
      { value: 'character', label: 'Character / चरित्र' },
      { value: 'professional', label: 'Professional Membership / व्यावसायिक सदस्यता' },
      { value: 'volunteer', label: 'Volunteer Position / स्वयंसेवी पद' },
      { value: 'promotion', label: 'Promotion / पदोन्नति' },
      { value: 'award-nomination', label: 'Award Nomination / पुरस्कार नामांकन' }
    ]
  },
  candidateName: {
    type: 'text',
    label: 'Candidate Name',
    labelHindi: 'उम्मीदवार का नाम',
    placeholder: 'Ms. Priya Sharma',
    required: true,
    category: 'recommendation',
    templateTypes: ['recommendation']
  },
  candidateRole: {
    type: 'text',
    label: 'Candidate Current/Previous Role',
    labelHindi: 'उम्मीदवार की भूमिका',
    placeholder: 'Software Engineer',
    category: 'recommendation',
    templateTypes: ['recommendation']
  },
  relationship: {
    type: 'select',
    label: 'Your Relationship with Candidate',
    labelHindi: 'उम्मीदवार से आपका संबंध',
    required: true,
    category: 'recommendation',
    templateTypes: ['recommendation', 'reference'],
    options: [
      { value: 'supervisor', label: 'Direct Supervisor / प्रत्यक्ष पर्यवेक्षक' },
      { value: 'manager', label: 'Manager / प्रबंधक' },
      { value: 'colleague', label: 'Colleague / सहकर्मी' },
      { value: 'professor', label: 'Professor / प्रोफेसर' },
      { value: 'teacher', label: 'Teacher / शिक्षक' },
      { value: 'mentor', label: 'Mentor / गुरु' },
      { value: 'client', label: 'Client / ग्राहक' },
      { value: 'business-partner', label: 'Business Partner / व्यापार भागीदार' },
      { value: 'friend', label: 'Friend / मित्र' },
      { value: 'neighbor', label: 'Neighbor / पड़ोसी' },
      { value: 'family-friend', label: 'Family Friend / पारिवारिक मित्र' },
      { value: 'religious-leader', label: 'Religious Leader / धार्मिक नेता' },
      { value: 'community-leader', label: 'Community Leader / सामुदायिक नेता' }
    ]
  },
  knowingSince: {
    type: 'text',
    label: 'Known Since',
    labelHindi: 'कब से जानते हैं',
    placeholder: 'January 2020 / 5 years',
    required: true,
    category: 'recommendation',
    templateTypes: ['recommendation', 'reference']
  },
  recommendationContext: {
    type: 'ai-textarea',
    label: 'Context of Association',
    labelHindi: 'जुड़ाव का संदर्भ',
    placeholder: 'I worked with [Name] when she joined our team as...',
    required: true,
    category: 'recommendation',
    templateTypes: ['recommendation'],
    aiPrompt: 'Describe the professional context in which you know the candidate. Include specific roles, projects, and duration.'
  },
  candidateSkills: {
    type: 'ai-textarea',
    label: 'Skills & Competencies',
    labelHindi: 'कौशल और योग्यताएं',
    placeholder: 'Technical skills, leadership abilities, problem-solving...',
    category: 'recommendation',
    templateTypes: ['recommendation'],
    aiPrompt: 'List and describe the candidate\'s key skills and competencies with specific examples.'
  },
  candidateAchievements: {
    type: 'ai-textarea',
    label: 'Notable Achievements',
    labelHindi: 'उल्लेखनीय उपलब्धियां',
    placeholder: 'Led the migration project that saved 40% costs...',
    category: 'recommendation',
    templateTypes: ['recommendation'],
    aiPrompt: 'Describe 2-3 significant achievements of the candidate with quantifiable results where possible.'
  },
  personalQualities: {
    type: 'ai-textarea',
    label: 'Personal Qualities',
    labelHindi: 'व्यक्तिगत गुण',
    placeholder: 'Integrity, dedication, teamwork, leadership...',
    category: 'recommendation',
    templateTypes: ['recommendation'],
    aiPrompt: 'Describe the candidate\'s personal qualities and character traits that make them exceptional.'
  },
  specificExamples: {
    type: 'ai-textarea',
    label: 'Specific Examples',
    labelHindi: 'विशिष्ट उदाहरण',
    placeholder: 'During the critical product launch, she demonstrated...',
    category: 'recommendation',
    templateTypes: ['recommendation', 'reference'],
    aiPrompt: 'Provide 1-2 specific examples or stories that illustrate the candidate\'s strengths.'
  },
  comparativeAssessment: {
    type: 'textarea',
    label: 'Comparative Assessment',
    labelHindi: 'तुलनात्मक मूल्यांकन',
    placeholder: 'Among the top 5% of professionals I have worked with...',
    category: 'recommendation',
    templateTypes: ['recommendation']
  },
  areasOfImprovement: {
    type: 'textarea',
    label: 'Areas of Improvement (Optional)',
    labelHindi: 'सुधार के क्षेत्र',
    placeholder: 'Could benefit from more exposure to...',
    category: 'recommendation',
    templateTypes: ['recommendation']
  },
  recommendationStrength: {
    type: 'select',
    label: 'Strength of Recommendation',
    labelHindi: 'सिफारिश की शक्ति',
    required: true,
    category: 'recommendation',
    templateTypes: ['recommendation'],
    options: [
      { value: 'highest', label: 'Highest / Without Reservation / सर्वोच्च' },
      { value: 'strong', label: 'Strong / Enthusiastic / मजबूत' },
      { value: 'moderate', label: 'Moderate / Good / मध्यम' },
      { value: 'reserved', label: 'Reserved / With Some Reservations / आरक्षित' }
    ]
  },
  targetPosition: {
    type: 'text',
    label: 'Position Applied For',
    labelHindi: 'आवेदित पद',
    placeholder: 'Senior Manager - Operations',
    category: 'recommendation',
    templateTypes: ['recommendation']
  },
  targetInstitution: {
    type: 'text',
    label: 'Target Company/Institution',
    labelHindi: 'लक्षित कंपनी/संस्थान',
    placeholder: 'Google India / IIM Ahmedabad',
    category: 'recommendation',
    templateTypes: ['recommendation']
  },

  // ─────────────────────────────────────────────────────────────
  // RESIGNATION LETTER FIELDS
  // ─────────────────────────────────────────────────────────────
  resignationType: {
    type: 'select',
    label: 'Resignation Type',
    labelHindi: 'त्यागपत्र प्रकार',
    required: true,
    category: 'resignation',
    templateTypes: ['resignation'],
    options: [
      { value: 'standard', label: 'Standard Resignation / मानक त्यागपत्र' },
      { value: 'two-weeks-notice', label: 'Two Weeks Notice / दो सप्ताह की सूचना' },
      { value: 'immediate', label: 'Immediate Resignation / तत्काल त्यागपत्र' },
      { value: 'retirement', label: 'Retirement / सेवानिवृत्ति' },
      { value: 'career-change', label: 'Career Change / करियर परिवर्तन' },
      { value: 'relocation', label: 'Relocation / स्थानांतरण' },
      { value: 'health-reasons', label: 'Health Reasons / स्वास्थ्य कारण' },
      { value: 'family-reasons', label: 'Family Reasons / पारिवारिक कारण' },
      { value: 'better-opportunity', label: 'Better Opportunity / बेहतर अवसर' },
      { value: 'hostile-environment', label: 'Work Environment Issues / कार्य वातावरण' }
    ]
  },
  currentPosition: {
    type: 'text',
    label: 'Your Current Position',
    labelHindi: 'आपका वर्तमान पद',
    placeholder: 'Senior Software Engineer',
    required: true,
    category: 'resignation',
    templateTypes: ['resignation']
  },
  currentDepartment: {
    type: 'text',
    label: 'Department',
    labelHindi: 'विभाग',
    placeholder: 'Engineering',
    category: 'resignation',
    templateTypes: ['resignation']
  },
  joiningDate: {
    type: 'date',
    label: 'Date of Joining',
    labelHindi: 'नियुक्ति तिथि',
    category: 'resignation',
    templateTypes: ['resignation']
  },
  lastWorkingDate: {
    type: 'date',
    label: 'Last Working Date',
    labelHindi: 'अंतिम कार्य दिवस',
    required: true,
    category: 'resignation',
    templateTypes: ['resignation']
  },
  noticePeriod: {
    type: 'text',
    label: 'Notice Period',
    labelHindi: 'नोटिस अवधि',
    placeholder: '30 days / 2 months',
    category: 'resignation',
    templateTypes: ['resignation']
  },
  reasonForLeaving: {
    type: 'ai-textarea',
    label: 'Reason for Leaving',
    labelHindi: 'छोड़ने का कारण',
    placeholder: 'I have decided to pursue a new opportunity...',
    category: 'resignation',
    templateTypes: ['resignation'],
    aiPrompt: 'Write a professional, positive reason for leaving. Keep it brief and avoid negativity about the current employer.'
  },
  gratitudePoints: {
    type: 'ai-textarea',
    label: 'Gratitude & Positive Experiences',
    labelHindi: 'आभार और सकारात्मक अनुभव',
    placeholder: 'I am grateful for the opportunities to grow...',
    category: 'resignation',
    templateTypes: ['resignation'],
    aiPrompt: 'Express genuine gratitude for the opportunities, learning, and experiences gained during employment.'
  },
  transitionPlan: {
    type: 'ai-textarea',
    label: 'Transition Plan',
    labelHindi: 'संक्रमण योजना',
    placeholder: 'I am committed to ensuring a smooth handover...',
    category: 'resignation',
    templateTypes: ['resignation'],
    aiPrompt: 'Describe your plan for ensuring smooth handover of responsibilities and knowledge transfer.'
  },
  handoverNotes: {
    type: 'textarea',
    label: 'Handover Notes',
    labelHindi: 'हस्तांतरण नोट्स',
    placeholder: 'Key projects, pending tasks, important contacts...',
    category: 'resignation',
    templateTypes: ['resignation']
  },
  exitInterviewAvailability: {
    type: 'checkbox',
    label: 'Available for Exit Interview',
    labelHindi: 'एग्जिट इंटरव्यू के लिए उपलब्ध',
    category: 'resignation',
    templateTypes: ['resignation']
  },
  returnableItems: {
    type: 'textarea',
    label: 'Company Assets to Return',
    labelHindi: 'वापस करने योग्य कंपनी संपत्ति',
    placeholder: 'Laptop, ID card, access cards...',
    category: 'resignation',
    templateTypes: ['resignation']
  },
  pendingMatters: {
    type: 'textarea',
    label: 'Pending Matters',
    labelHindi: 'लंबित मामले',
    placeholder: 'Expense reimbursements, leave encashment...',
    category: 'resignation',
    templateTypes: ['resignation']
  },
  forwardingAddress: {
    type: 'textarea',
    label: 'Forwarding Address',
    labelHindi: 'अग्रेषण पता',
    placeholder: 'For final settlement and documents...',
    category: 'resignation',
    templateTypes: ['resignation']
  },

  // ─────────────────────────────────────────────────────────────
  // REFERENCE LETTER FIELDS
  // ─────────────────────────────────────────────────────────────
  referenceType: {
    type: 'select',
    label: 'Reference Type',
    labelHindi: 'संदर्भ प्रकार',
    required: true,
    category: 'reference',
    templateTypes: ['reference'],
    options: [
      { value: 'employment', label: 'Employment Reference / रोजगार संदर्भ' },
      { value: 'character', label: 'Character Reference / चरित्र संदर्भ' },
      { value: 'academic', label: 'Academic Reference / शैक्षणिक संदर्भ' },
      { value: 'tenant', label: 'Tenant Reference / किरायेदार संदर्भ' },
      { value: 'immigration', label: 'Immigration Reference / आव्रजन संदर्भ' },
      { value: 'court', label: 'Court/Legal Reference / न्यायालय संदर्भ' },
      { value: 'adoption', label: 'Adoption Reference / गोद लेने का संदर्भ' },
      { value: 'professional-membership', label: 'Professional Membership / व्यावसायिक सदस्यता' },
      { value: 'volunteer', label: 'Volunteer Reference / स्वयंसेवी संदर्भ' }
    ]
  },
  personName: {
    type: 'text',
    label: 'Person\'s Name',
    labelHindi: 'व्यक्ति का नाम',
    placeholder: 'Mr. Arun Patel',
    required: true,
    category: 'reference',
    templateTypes: ['reference']
  },
  personRole: {
    type: 'text',
    label: 'Person\'s Role/Occupation',
    labelHindi: 'व्यक्ति की भूमिका/पेशा',
    placeholder: 'Marketing Executive',
    category: 'reference',
    templateTypes: ['reference']
  },
  knowingDuration: {
    type: 'text',
    label: 'Duration of Knowing',
    labelHindi: 'जानने की अवधि',
    placeholder: '5 years / Since 2019',
    required: true,
    category: 'reference',
    templateTypes: ['reference']
  },
  referenceContext: {
    type: 'ai-textarea',
    label: 'Context of Knowing',
    labelHindi: 'जानने का संदर्भ',
    placeholder: 'I have known [Name] as my neighbor/colleague/student...',
    required: true,
    category: 'reference',
    templateTypes: ['reference'],
    aiPrompt: 'Describe how you know this person - the context, setting, and nature of your relationship.'
  },
  characterTraits: {
    type: 'ai-textarea',
    label: 'Character Traits',
    labelHindi: 'चरित्र विशेषताएं',
    placeholder: 'Honest, reliable, hardworking, trustworthy...',
    category: 'reference',
    templateTypes: ['reference'],
    aiPrompt: 'Describe the person\'s character traits with specific examples of how they demonstrate these qualities.'
  },
  professionalSkills: {
    type: 'textarea',
    label: 'Professional Skills (if applicable)',
    labelHindi: 'व्यावसायिक कौशल',
    placeholder: 'Strong communication, analytical thinking...',
    category: 'reference',
    templateTypes: ['reference']
  },
  reliability: {
    type: 'textarea',
    label: 'Reliability & Trustworthiness',
    labelHindi: 'विश्वसनीयता',
    placeholder: 'In my experience, [Name] has always been...',
    category: 'reference',
    templateTypes: ['reference']
  },
  referenceRecommendation: {
    type: 'ai-textarea',
    label: 'Your Recommendation',
    labelHindi: 'आपकी सिफारिश',
    placeholder: 'I wholeheartedly recommend [Name] for...',
    required: true,
    category: 'reference',
    templateTypes: ['reference'],
    aiPrompt: 'Write a strong recommendation statement based on the reference type and your relationship with the person.'
  },
  purposeOfReference: {
    type: 'text',
    label: 'Purpose of Reference',
    labelHindi: 'संदर्भ का उद्देश्य',
    placeholder: 'Rental application / Job application / Visa',
    category: 'reference',
    templateTypes: ['reference']
  },
  contactPermission: {
    type: 'checkbox',
    label: 'Permission to Contact You',
    labelHindi: 'संपर्क की अनुमति',
    category: 'reference',
    templateTypes: ['reference']
  },

  // ─────────────────────────────────────────────────────────────
  // PERSONAL FORMAL LETTER FIELDS
  // ─────────────────────────────────────────────────────────────
  personalLetterType: {
    type: 'select',
    label: 'Personal Letter Type',
    labelHindi: 'व्यक्तिगत पत्र प्रकार',
    required: true,
    category: 'personal',
    templateTypes: ['personal'],
    options: [
      { value: 'congratulations', label: 'Congratulations / बधाई' },
      { value: 'condolence', label: 'Condolence / शोक संवेदना' },
      { value: 'thank-you', label: 'Thank You / धन्यवाद' },
      { value: 'apology', label: 'Apology / क्षमा याचना' },
      { value: 'invitation', label: 'Invitation / निमंत्रण' },
      { value: 'announcement', label: 'Announcement / घोषणा' },
      { value: 'request', label: 'Request / अनुरोध' },
      { value: 'complaint', label: 'Complaint / शिकायत' },
      { value: 'appreciation', label: 'Appreciation / प्रशंसा' },
      { value: 'farewell', label: 'Farewell / विदाई' }
    ]
  },
  occasion: {
    type: 'text',
    label: 'Occasion/Event',
    labelHindi: 'अवसर/कार्यक्रम',
    placeholder: 'Wedding, Promotion, New Baby, Retirement...',
    category: 'personal',
    templateTypes: ['personal']
  },
  occasionDate: {
    type: 'date',
    label: 'Occasion Date',
    labelHindi: 'अवसर की तिथि',
    category: 'personal',
    templateTypes: ['personal']
  },
  personalRelationship: {
    type: 'text',
    label: 'Your Relationship',
    labelHindi: 'आपका संबंध',
    placeholder: 'Friend, Colleague, Relative, Neighbor...',
    category: 'personal',
    templateTypes: ['personal']
  },
  sharedMemory: {
    type: 'ai-textarea',
    label: 'Shared Memory/Experience',
    labelHindi: 'साझा स्मृति/अनुभव',
    placeholder: 'I fondly remember when we...',
    category: 'personal',
    templateTypes: ['personal'],
    aiPrompt: 'Write a heartfelt memory or shared experience that adds personal touch to the letter.'
  },
  sentiments: {
    type: 'ai-textarea',
    label: 'Your Sentiments',
    labelHindi: 'आपकी भावनाएं',
    placeholder: 'Express your feelings about this occasion...',
    required: true,
    category: 'personal',
    templateTypes: ['personal'],
    aiPrompt: 'Express genuine sentiments appropriate to the occasion - warm for celebrations, compassionate for condolences, etc.'
  },
  futureWishes: {
    type: 'ai-textarea',
    label: 'Future Wishes',
    labelHindi: 'भविष्य की शुभकामनाएं',
    placeholder: 'Wishing you continued success and happiness...',
    category: 'personal',
    templateTypes: ['personal'],
    aiPrompt: 'Write warm wishes for the future appropriate to the occasion and relationship.'
  },
  offerOfSupport: {
    type: 'textarea',
    label: 'Offer of Support',
    labelHindi: 'सहायता का प्रस्ताव',
    placeholder: 'Please do not hesitate to reach out if you need anything...',
    category: 'personal',
    templateTypes: ['personal']
  },

  // ─────────────────────────────────────────────────────────────
  // SIGNATURE & STYLING FIELDS
  // ─────────────────────────────────────────────────────────────
  includeSignature: {
    type: 'checkbox',
    label: 'Include Signature Block',
    labelHindi: 'हस्ताक्षर ब्लॉक शामिल करें',
    category: 'signature'
  },
  signatureImage: {
    type: 'url',
    label: 'Signature Image URL',
    labelHindi: 'हस्ताक्षर छवि URL',
    placeholder: 'https://example.com/signature.png',
    category: 'signature'
  },
  letterhead: {
    type: 'checkbox',
    label: 'Include Letterhead',
    labelHindi: 'लेटरहेड शामिल करें',
    category: 'styling'
  },
  companyLogo: {
    type: 'url',
    label: 'Company Logo URL',
    labelHindi: 'कंपनी लोगो URL',
    placeholder: 'https://company.com/logo.png',
    category: 'styling'
  },
  accentColor: {
    type: 'color',
    label: 'Accent Color',
    labelHindi: 'एक्सेंट रंग',
    category: 'styling'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: TEMPLATE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const LETTER_FORMAL_TEMPLATE_CONFIGS: Record<LetterFormalTemplateType, {
  name: string;
  nameHindi: string;
  description: string;
  icon: string;
  sections: string[];
  recommendedFor: string[];
  defaultClosings: ClosingType[];
  defaultFormat: LetterFormatType;
}> = {
  professional: {
    name: 'Professional Letter',
    nameHindi: 'व्यावसायिक पत्र',
    description: 'General business and professional correspondence',
    icon: '📄',
    sections: ['letterhead', 'date', 'recipient', 'subject', 'salutation', 'body', 'closing', 'signature'],
    recommendedFor: ['Business inquiries', 'Formal requests', 'Complaints', 'Acknowledgments', 'Announcements'],
    defaultClosings: ['Sincerely', 'Best regards', 'Yours faithfully'],
    defaultFormat: 'full-block'
  },
  cover: {
    name: 'Cover Letter',
    nameHindi: 'कवर लेटर',
    description: 'Job application and career-related cover letters',
    icon: '💼',
    sections: ['header', 'date', 'recipient', 'salutation', 'opening', 'body', 'skills', 'closing', 'signature'],
    recommendedFor: ['Job applications', 'Internships', 'Career changes', 'Internal transfers', 'Freelance proposals'],
    defaultClosings: ['Sincerely', 'Best regards', 'Kind regards'],
    defaultFormat: 'modified-block'
  },
  recommendation: {
    name: 'Recommendation Letter',
    nameHindi: 'सिफारिश पत्र',
    description: 'Letters recommending candidates for jobs, academics, or other opportunities',
    icon: '⭐',
    sections: ['letterhead', 'date', 'recipient', 'salutation', 'introduction', 'relationship', 'qualities', 'achievements', 'recommendation', 'closing', 'signature'],
    recommendedFor: ['Employment recommendations', 'Academic applications', 'Scholarships', 'Graduate school', 'Awards'],
    defaultClosings: ['Sincerely', 'Respectfully', 'Yours faithfully'],
    defaultFormat: 'full-block'
  },
  resignation: {
    name: 'Resignation Letter',
    nameHindi: 'त्यागपत्र',
    description: 'Professional resignation and departure letters',
    icon: '👋',
    sections: ['header', 'date', 'recipient', 'salutation', 'announcement', 'gratitude', 'transition', 'closing', 'signature'],
    recommendedFor: ['Standard resignations', 'Retirement', 'Career changes', 'Immediate resignation', 'Two weeks notice'],
    defaultClosings: ['Sincerely', 'Best regards', 'With gratitude'],
    defaultFormat: 'modified-block'
  },
  reference: {
    name: 'Reference Letter',
    nameHindi: 'संदर्भ पत्र',
    description: 'Character and professional reference letters',
    icon: '✅',
    sections: ['letterhead', 'date', 'recipient', 'salutation', 'introduction', 'relationship', 'character', 'recommendation', 'contact', 'closing', 'signature'],
    recommendedFor: ['Employment references', 'Character references', 'Tenant references', 'Immigration', 'Court references'],
    defaultClosings: ['Sincerely', 'Respectfully', 'Yours truly'],
    defaultFormat: 'full-block'
  },
  personal: {
    name: 'Personal Formal Letter',
    nameHindi: 'व्यक्तिगत औपचारिक पत्र',
    description: 'Formal personal letters for various occasions',
    icon: '💌',
    sections: ['header', 'date', 'recipient', 'salutation', 'opening', 'body', 'wishes', 'closing', 'signature'],
    recommendedFor: ['Congratulations', 'Condolences', 'Thank you letters', 'Formal invitations', 'Apologies'],
    defaultClosings: ['Warm regards', 'With appreciation', 'Sincerely', 'With heartfelt wishes'],
    defaultFormat: 'modified-block'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: COMPREHENSIVE SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const LETTER_FORMAL_SAMPLE_DATA: Record<LetterFormalTemplateType, Partial<LetterFormalData>> = {
  // ─────────────────────────────────────────────────────────────
  // PROFESSIONAL LETTER - Business Correspondence
  // ─────────────────────────────────────────────────────────────
  professional: {
    templateType: 'professional',
    letterFormat: 'full-block',
    letterDate: '2025-12-16',
    referenceNumber: 'RG/BUS/2025/047',
    // Sender
    senderName: 'Aman Singh',
    senderDesignation: 'Founder & CEO',
    senderCompany: 'Risenex Global Pvt. Ltd.',
    senderDepartment: 'Executive Office',
    senderAddress: '15, Tech Park, Sector 62',
    senderCity: 'Ferozepur',
    senderState: 'Punjab',
    senderPincode: '152002',
    senderCountry: 'India',
    senderEmail: 'aman@risenex.com',
    senderPhone: '+91 98765 43210',
    senderWebsite: 'https://www.risenex.com',
    // Recipient
    recipientName: 'Mr. Rajesh Kumar',
    recipientDesignation: 'Director of Partnerships',
    recipientCompany: 'Tech Solutions Pvt. Ltd.',
    recipientDepartment: 'Business Development',
    recipientAddress: '456, Corporate Tower, MG Road',
    recipientCity: 'Gurugram',
    recipientState: 'Haryana',
    recipientPincode: '122001',
    recipientCountry: 'India',
    // Content
    salutation: 'Dear',
    subject: 'Proposal for Strategic Technology Partnership - AI Solutions Integration',
    letterBody: `I hope this letter finds you well. I am writing to formally propose a strategic technology partnership between Risenex Global and Tech Solutions Pvt. Ltd. for the integration of our AI-powered solutions into your enterprise offerings.

Following our productive meeting on December 10, 2025, I am excited about the potential synergies between our organizations. Risenex Global has developed Soriva, an advanced AI conversational platform specifically optimized for the Indian market, featuring Hinglish language processing and cultural context awareness.

Partnership Proposal Overview:

We propose a collaboration model that would enable Tech Solutions to integrate Soriva's AI capabilities into your existing enterprise solutions, providing your clients with:

1. Intelligent Customer Support: 24/7 AI-powered support with natural language understanding
2. Document Intelligence: Automated document processing and analysis
3. Voice AI Integration: Regional language voice assistants for enhanced user experience

We believe this partnership would create significant value for both organizations and, most importantly, deliver superior solutions to the Indian enterprise market.

I would welcome the opportunity to discuss this proposal in detail and explore how we can move forward together. Please find attached our detailed partnership proposal document and technical specifications.`,
    closing: 'Best regards',
    includeSignature: true,
    letterhead: true,
    companyLogo: 'https://risenex.com/logo.png',
    accentColor: '#1e3a5f',
    professional: {
      letterType: 'business-proposal',
      referenceNumber: 'RG/BUS/2025/047',
      inResponseTo: 'Our meeting dated December 10, 2025',
      purpose: 'To propose a strategic technology partnership for AI solutions integration',
      keyPoints: `• Integration of Soriva AI platform with Tech Solutions' enterprise offerings
• Joint go-to-market strategy for Indian enterprise clients
• Revenue sharing model with mutual benefits
• Technical support and training programs
• Pilot project starting Q1 2025`,
      actionRequired: 'Please review the attached proposal and share your feedback. I am available for a follow-up meeting at your convenience.',
      deadline: 'We would appreciate your initial response by December 31, 2025',
      attachments: '1. Detailed Partnership Proposal (PDF)\n2. Technical Specifications Document\n3. Soriva Platform Overview\n4. Case Studies & Client Testimonials'
    }
  },

  // ─────────────────────────────────────────────────────────────
  // COVER LETTER - Job Application
  // ─────────────────────────────────────────────────────────────
  cover: {
    templateType: 'cover',
    letterFormat: 'modified-block',
    letterDate: '2025-12-16',
    // Sender
    senderName: 'Priya Sharma',
    senderDesignation: 'Senior Software Engineer',
    senderCompany: 'Currently at WebTech Solutions',
    senderAddress: '234, Green Valley Apartments',
    senderCity: 'Bangalore',
    senderState: 'Karnataka',
    senderPincode: '560001',
    senderEmail: 'priya.sharma@email.com',
    senderPhone: '+91 98765 12345',
    // Recipient
    recipientName: 'Ms. Kavita Nair',
    recipientDesignation: 'Head of Engineering',
    recipientCompany: 'InnovateTech Solutions Pvt. Ltd.',
    recipientDepartment: 'Human Resources',
    recipientAddress: '789, Tech Hub, Whitefield',
    recipientCity: 'Bangalore',
    recipientState: 'Karnataka',
    recipientPincode: '560066',
    // Content
    salutation: 'Dear Hiring Manager',
    subject: 'Application for Lead Full Stack Developer Position - Job Ref: ITL-2025-DEV-089',
    letterBody: `I am writing to express my strong interest in the Lead Full Stack Developer position at InnovateTech Solutions, as advertised on LinkedIn. With over 6 years of experience in full-stack development and a proven track record of leading high-performing engineering teams, I am excited about the opportunity to contribute to your innovative product development initiatives.

In my current role at WebTech Solutions, I have successfully led a team of 8 developers in building and scaling enterprise SaaS applications serving over 500,000 users. My experience spans the complete technology stack including React, Node.js, TypeScript, PostgreSQL, and AWS cloud services – technologies that align perfectly with InnovateTech's technical requirements.

What particularly excites me about InnovateTech Solutions is your commitment to building AI-first products that solve real-world problems for Indian businesses. Your recent launch of the intelligent inventory management system demonstrates the kind of innovative, impactful work I am eager to contribute to.

I am confident that my technical expertise, leadership experience, and passion for building scalable solutions would make me a valuable addition to your team. I would welcome the opportunity to discuss how my background and skills align with your needs.

Thank you for considering my application. I look forward to the possibility of contributing to InnovateTech's continued success.`,
    closing: 'Sincerely',
    includeSignature: true,
    accentColor: '#059669',
    cover: {
      coverType: 'job-application',
      jobTitle: 'Lead Full Stack Developer',
      jobReference: 'ITL-2025-DEV-089',
      companyName: 'InnovateTech Solutions Pvt. Ltd.',
      whereFound: 'LinkedIn Jobs',
      referrerName: '',
      currentRole: 'Senior Software Engineer at WebTech Solutions',
      yearsExperience: 6,
      keySkills: `Technical Skills:
• Frontend: React.js, Next.js, TypeScript, Redux, Tailwind CSS
• Backend: Node.js, Express, NestJS, GraphQL, REST APIs
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes
• Tools: Git, CI/CD, Jira, Agile/Scrum

Leadership Skills:
• Team leadership and mentoring (8+ developers)
• Technical architecture and system design
• Code review and quality assurance
• Stakeholder communication`,
      achievements: `Key Achievements:
• Led development of enterprise SaaS platform scaling from 50K to 500K+ users
• Reduced API response time by 60% through optimization and caching strategies
• Implemented CI/CD pipeline reducing deployment time from 4 hours to 20 minutes
• Mentored 5 junior developers, with 3 receiving promotions within 18 months
• Received "Engineering Excellence Award" for Q3 2024`,
      whyCompany: `InnovateTech's mission to democratize AI for Indian businesses resonates deeply with my professional values. Your recent intelligent inventory system launch showcases the innovative, practical approach to technology that I admire. I am particularly excited about the opportunity to work on AI-first products and contribute to India's growing tech ecosystem.`,
      whyYou: `My unique combination of deep technical expertise and proven leadership experience makes me an ideal fit for this role. I bring hands-on experience with your entire tech stack, a track record of scaling applications, and the ability to mentor and grow engineering teams. I am passionate about building products that make a real difference.`,
      availability: '30 days notice period',
      salaryExpectation: '₹32-38 LPA (Negotiable)',
      portfolioUrl: 'https://priyasharma.dev',
      linkedinUrl: 'https://linkedin.com/in/priyasharma-dev'
    }
  },

  // ─────────────────────────────────────────────────────────────
  // RECOMMENDATION LETTER - Employment
  // ─────────────────────────────────────────────────────────────
  recommendation: {
    templateType: 'recommendation',
    letterFormat: 'full-block',
    letterDate: '2025-12-16',
    // Sender (Recommender)
    senderName: 'Dr. Vikram Mehta',
    senderDesignation: 'Vice President - Engineering',
    senderCompany: 'GlobalTech India Pvt. Ltd.',
    senderDepartment: 'Product Engineering',
    senderAddress: '100, Cyber City, DLF Phase 2',
    senderCity: 'Gurugram',
    senderState: 'Haryana',
    senderPincode: '122002',
    senderEmail: 'vikram.mehta@globaltech.com',
    senderPhone: '+91 98111 22333',
    // Recipient
    recipientName: 'Hiring Manager',
    recipientDesignation: 'Head of Talent Acquisition',
    recipientCompany: 'Amazon Development Centre',
    recipientAddress: 'World Trade Center, Brigade Gateway',
    recipientCity: 'Bangalore',
    recipientState: 'Karnataka',
    recipientPincode: '560055',
    // Content
    salutation: 'To Whom It May Concern',
    subject: 'Letter of Recommendation for Ms. Ananya Reddy - Senior Software Development Engineer Position',
    letterBody: `I am writing this letter with great enthusiasm to recommend Ms. Ananya Reddy for the Senior Software Development Engineer position at Amazon. As her direct supervisor for the past three years at GlobalTech India, I have had the privilege of witnessing her exceptional growth and outstanding contributions to our organization.

Ananya joined GlobalTech as a Software Engineer in January 2022 and was promoted to Senior Software Engineer within 18 months – a testament to her exceptional performance and rapid skill development. During her tenure, she has consistently demonstrated technical excellence, leadership qualities, and a remarkable ability to solve complex problems.

Technical Excellence:
Ananya possesses deep expertise in distributed systems, microservices architecture, and cloud-native development. She led the complete redesign of our payment processing system, resulting in a 99.99% uptime and handling over 1 million transactions daily. Her technical solutions are not only effective but also elegant, maintainable, and well-documented.

Leadership & Collaboration:
Beyond her individual contributions, Ananya has emerged as a natural leader. She has mentored 6 junior engineers, conducted technical training sessions, and actively contributed to our hiring process. Her ability to communicate complex technical concepts to non-technical stakeholders has been invaluable.

Among the hundreds of engineers I have worked with over my 20-year career, Ananya ranks in the top 5%. She possesses the rare combination of technical brilliance, leadership capability, and genuine passion for excellence that I believe would make her an exceptional addition to Amazon's engineering team.

I recommend her without any reservation and am confident she will exceed your expectations.`,
    closing: 'Sincerely',
    includeSignature: true,
    letterhead: true,
    accentColor: '#7c3aed',
    recommendation: {
      recommendationType: 'employment',
      candidateName: 'Ms. Ananya Reddy',
      candidateRole: 'Senior Software Engineer',
      relationship: 'supervisor',
      knowingSince: 'January 2022 (3 years)',
      duration: '3 years',
      context: `I have been Ananya's direct supervisor since she joined GlobalTech India in January 2022. During this time, I have closely observed her work on multiple critical projects, conducted her performance reviews, and witnessed her growth from a talented engineer to an exceptional technical leader.`,
      skills: `• Distributed Systems & Microservices Architecture
• Java, Python, Go programming languages
• AWS Services (EC2, Lambda, DynamoDB, SQS, SNS)
• System Design & Technical Architecture
• Performance Optimization & Scalability
• Agile Methodologies & Technical Leadership`,
      achievements: `1. Payment System Redesign: Led complete overhaul of payment processing system
   - Achieved 99.99% uptime (from 99.5%)
   - Scaled to handle 1M+ daily transactions
   - Reduced processing latency by 70%

2. Cost Optimization Initiative: Implemented auto-scaling and resource optimization
   - Saved ₹2.5 Crores annually in infrastructure costs
   - Received company-wide "Innovation Award"

3. Technical Leadership: Established engineering best practices
   - Created comprehensive documentation framework
   - Reduced onboarding time for new engineers by 50%`,
      personalQualities: `• Exceptional problem-solving abilities with analytical mindset
• Strong communication skills - can explain complex concepts simply
• Natural leadership qualities - team members actively seek her guidance
• High integrity and work ethic
• Genuine passion for continuous learning
• Collaborative spirit with positive attitude`,
      specificExamples: `During a critical production incident affecting our flagship product, Ananya demonstrated remarkable composure and leadership. She quickly assembled a cross-functional team, systematically diagnosed the root cause, and implemented a fix within 4 hours – minimizing customer impact. Her post-mortem analysis and preventive measures have since prevented similar issues.`,
      comparativeAssessment: 'Among the hundreds of engineers I have worked with in my 20-year career, Ananya ranks in the top 5%. Her combination of technical excellence and leadership capability is truly exceptional.',
      areasOfImprovement: 'Ananya could benefit from more exposure to business strategy and product management aspects, which I believe a role at Amazon would provide.',
      recommendationStrength: 'highest',
      targetPosition: 'Senior Software Development Engineer (SDE-2/SDE-3)',
      targetInstitution: 'Amazon Development Centre, Bangalore'
    }
  },

  // ─────────────────────────────────────────────────────────────
  // RESIGNATION LETTER - Standard Resignation
  // ─────────────────────────────────────────────────────────────
  resignation: {
    templateType: 'resignation',
    letterFormat: 'modified-block',
    letterDate: '2025-12-16',
    // Sender
    senderName: 'Rohit Sharma',
    senderDesignation: 'Senior Product Manager',
    senderCompany: 'TechCorp India Pvt. Ltd.',
    senderDepartment: 'Product Management',
    senderAddress: '45, Prestige Towers, MG Road',
    senderCity: 'Bangalore',
    senderState: 'Karnataka',
    senderPincode: '560001',
    senderEmail: 'rohit.sharma@techcorp.com',
    senderPhone: '+91 98765 67890',
    // Recipient
    recipientName: 'Ms. Sunita Krishnan',
    recipientDesignation: 'Vice President - Product',
    recipientCompany: 'TechCorp India Pvt. Ltd.',
    recipientDepartment: 'Executive Office',
    recipientAddress: 'Corporate Headquarters, 5th Floor',
    recipientCity: 'Bangalore',
    recipientState: 'Karnataka',
    recipientPincode: '560001',
    // Content
    salutation: 'Dear',
    subject: 'Resignation from the Position of Senior Product Manager',
    letterBody: `I am writing to formally notify you of my resignation from my position as Senior Product Manager at TechCorp India Pvt. Ltd., effective January 15, 2026. This will provide a 30-day notice period as per my employment agreement.

This decision was not easy, as my four years at TechCorp have been incredibly rewarding both professionally and personally. I have accepted an opportunity that aligns with my long-term career goals and will allow me to explore new challenges in a different domain.

I want to express my deepest gratitude for the opportunities I have been given during my tenure:

• The chance to lead the launch of three successful products that now serve over 2 million users
• The mentorship and guidance from the leadership team that helped shape my career
• The collaborative and innovative work environment that made every day engaging
• The trust placed in me to manage a team of 12 talented professionals

I am fully committed to ensuring a smooth transition during my notice period. I have already begun documenting my ongoing projects, key processes, and important stakeholder relationships. I am happy to:

• Train my replacement on all current projects and responsibilities
• Complete any critical milestones before my departure
• Be available for questions even after my last working day

I will always look back fondly on my time at TechCorp and remain grateful for the growth I experienced here. I hope to stay connected and wish the company continued success.

Thank you for everything.`,
    closing: 'With gratitude',
    includeSignature: true,
    accentColor: '#0891b2',
    resignation: {
      resignationType: 'better-opportunity',
      currentPosition: 'Senior Product Manager',
      department: 'Product Management',
      lastWorkingDate: '2026-01-15',
      noticePeriod: '30 days',
      joiningDate: '2021-12-01',
      reasonForLeaving: 'I have accepted an exciting opportunity that aligns with my long-term career aspirations and will allow me to explore new challenges in a different domain. This decision is purely driven by career growth and is in no way a reflection of my experience at TechCorp.',
      gratitudePoints: `I am deeply grateful for:
• The opportunity to lead three successful product launches
• Exceptional mentorship from leadership, especially from you
• Working with an incredibly talented and supportive team
• The trust to manage a team of 12 professionals
• The innovative and collaborative work culture
• Professional development opportunities and training programs`,
      transitionPlan: `To ensure continuity, I propose the following transition plan:

Week 1 (Dec 16-22):
• Document all ongoing projects and their current status
• List key stakeholder contacts and relationship notes
• Create process documentation for recurring activities

Week 2 (Dec 23-29):
• Begin knowledge transfer sessions with team/replacement
• Complete Q4 product roadmap documentation
• Finalize vendor and partner handover notes

Week 3-4 (Dec 30 - Jan 15):
• Hands-on training with replacement
• Complete any pending critical deliverables
• Final handover and exit formalities`,
      handoverNotes: `Key Items for Handover:
1. Product Roadmap 2026 - Draft completed, needs final review
2. Vendor Contracts - 3 renewals due in Q1 2026
3. Team Performance Reviews - Due end of January
4. Budget Planning - FY26 proposal submitted
5. Key Stakeholder Meetings - Weekly sync with Engineering, Monthly with Sales`,
      exitInterviewAvailability: true,
      returnableItems: `• MacBook Pro (Asset ID: TC-LP-4521)
• Employee ID Card
• Building Access Card
• Parking Pass
• Company Credit Card`,
      pendingMatters: `• Expense reimbursement for November 2025 (₹15,000)
• 8 days of earned leave to be encashed
• Performance bonus for H2 2025 (if applicable)
• Full and final settlement`,
      forwardingAddress: '123, New Address, HSR Layout\nBangalore, Karnataka - 560102\nEmail: rohit.sharma.personal@email.com'
    }
  },

  // ─────────────────────────────────────────────────────────────
  // REFERENCE LETTER - Character Reference
  // ─────────────────────────────────────────────────────────────
  reference: {
    templateType: 'reference',
    letterFormat: 'full-block',
    letterDate: '2025-12-16',
    // Sender (Reference Provider)
    senderName: 'Dr. Anil Kumar Verma',
    senderDesignation: 'Professor & Head of Department',
    senderCompany: 'Indian Institute of Technology, Delhi',
    senderDepartment: 'Computer Science & Engineering',
    senderAddress: 'IIT Delhi, Hauz Khas',
    senderCity: 'New Delhi',
    senderState: 'Delhi',
    senderPincode: '110016',
    senderEmail: 'anil.verma@iitd.ac.in',
    senderPhone: '+91 11 2659 1000',
    // Recipient
    recipientName: 'Immigration Officer',
    recipientDesignation: 'Visa Processing Department',
    recipientCompany: 'Embassy of Canada',
    recipientAddress: '7/8, Shantipath, Chanakyapuri',
    recipientCity: 'New Delhi',
    recipientState: 'Delhi',
    recipientPincode: '110021',
    // Content
    salutation: 'To Whom It May Concern',
    subject: 'Character Reference Letter for Mr. Arjun Patel - Study Permit Application',
    letterBody: `I am writing this letter to provide a character reference for Mr. Arjun Patel in support of his application for a study permit to pursue his Master's degree in Computer Science at the University of Toronto, Canada.

I have known Arjun for the past four years, first as his professor in multiple courses during his undergraduate studies at IIT Delhi, and subsequently as his research supervisor for his final year project. During this time, I have had extensive opportunities to observe his academic capabilities, personal character, and professional conduct.

Academic Excellence:
Arjun graduated with a CGPA of 9.2/10, ranking among the top 5% of his batch. He demonstrated exceptional understanding of complex subjects including Machine Learning, Distributed Systems, and Algorithm Design. His intellectual curiosity and dedication to learning set him apart from his peers.

Character & Integrity:
I can attest to Arjun's impeccable character and integrity. He is honest, responsible, and demonstrates strong moral values in all his interactions. During his time under my supervision, he consistently showed respect for academic ethics and maintained the highest standards of professional conduct.

Personal Qualities:
Arjun is mature, focused, and possesses excellent interpersonal skills. He works well both independently and as part of a team. His ability to communicate complex ideas clearly and his willingness to help fellow students made him a valued member of our academic community.

I am confident that Arjun will be a responsible international student who will comply with all visa regulations and represent India positively abroad. I wholeheartedly support his application and am happy to provide any additional information if required.`,
    closing: 'Respectfully',
    includeSignature: true,
    letterhead: true,
    accentColor: '#dc2626',
    reference: {
      referenceType: 'immigration',
      personName: 'Mr. Arjun Patel',
      personRole: 'B.Tech Graduate - Computer Science',
      relationship: 'professor',
      knowingDuration: '4 years (2021-2025)',
      context: `I have known Arjun since 2021 when he enrolled in my "Introduction to Machine Learning" course. Subsequently, I taught him in two more advanced courses and supervised his final year research project on "Efficient Transformer Architectures for Resource-Constrained Devices." Our academic relationship has given me deep insight into his capabilities and character.`,
      characterTraits: `• Integrity: Always maintains honesty in academic work and personal dealings
• Responsibility: Consistently meets deadlines and fulfills commitments
• Maturity: Handles challenges with composure and sound judgment
• Respectfulness: Treats peers, faculty, and staff with equal respect
• Discipline: Demonstrates strong work ethic and self-motivation`,
      professionalSkills: `• Exceptional analytical and problem-solving abilities
• Strong programming skills (Python, C++, Java)
• Research aptitude with published paper in IEEE conference
• Excellent written and verbal communication
• Effective collaboration and teamwork`,
      reliability: 'In my four years of association with Arjun, he has never given me any reason to doubt his reliability or trustworthiness. He consistently met all deadlines, fulfilled his responsibilities diligently, and maintained the highest ethical standards.',
      recommendation: 'I wholeheartedly recommend Arjun Patel for the Canadian study permit. I am confident he will be a responsible international student who will comply with all visa regulations, complete his studies successfully, and represent India positively. His character, academic excellence, and clear goals make him an ideal candidate.',
      purposeOfReference: 'Study Permit Application for Master\'s in Computer Science at University of Toronto',
      contactPermission: true
    }
  },

  // ─────────────────────────────────────────────────────────────
  // PERSONAL FORMAL LETTER - Condolence
  // ─────────────────────────────────────────────────────────────
  personal: {
    templateType: 'personal',
    letterFormat: 'modified-block',
    letterDate: '2025-12-16',
    // Sender
    senderName: 'Meera Krishnan',
    senderAddress: '78, Lake View Apartments, Anna Nagar',
    senderCity: 'Chennai',
    senderState: 'Tamil Nadu',
    senderPincode: '600040',
    senderEmail: 'meera.krishnan@email.com',
    senderPhone: '+91 98765 43210',
    // Recipient
    recipientName: 'Mrs. Lakshmi Iyer',
    recipientAddress: '234, Besant Nagar',
    recipientCity: 'Chennai',
    recipientState: 'Tamil Nadu',
    recipientPincode: '600090',
    // Content
    salutation: 'Dear',
    subject: '',
    letterBody: `I was deeply saddened to learn of the passing of Mr. Raghunath Iyer. Please accept my heartfelt condolences during this incredibly difficult time.

Uncle Raghu, as we all fondly called him, was a remarkable person who touched the lives of everyone he met. His warmth, wisdom, and infectious laughter made every gathering special. I will always treasure the memories of our conversations during family functions and his encouraging words when I started my career.

I particularly remember how he would always make time for everyone, offering guidance with such patience and genuine care. His stories about his early career days inspired me to persevere through my own challenges. The values he lived by – integrity, kindness, and humility – continue to inspire all who knew him.

Words feel inadequate to express the sorrow of losing such a wonderful soul. While no words can truly ease the pain of this loss, please know that you and your family are in my thoughts and prayers. Uncle Raghu's legacy lives on through the countless lives he touched and the values he instilled in his children and grandchildren.

Please do not hesitate to reach out if there is anything I can do to help during this time. Whether you need assistance with arrangements, someone to talk to, or simply a presence during difficult moments, I am here for you.

May God give you and your family the strength to bear this irreplaceable loss.`,
    closing: 'With deepest sympathy',
    includeSignature: true,
    accentColor: '#475569',
    personal: {
      personalType: 'condolence',
      occasion: 'Passing of Mr. Raghunath Iyer',
      occasionDate: '2025-12-14',
      relationship: 'Family friend (known for 15+ years)',
      sharedMemory: `I fondly remember Uncle Raghu's 70th birthday celebration three years ago. Despite being the guest of honor, he spent most of the evening making sure everyone else was comfortable and happy. When I mentioned my struggles with a career decision, he took me aside and shared his own experiences with such honesty and wisdom. That conversation helped me find my path, and I will forever be grateful.`,
      sentiments: `The news of Uncle Raghu's passing has left a void that cannot be filled. He was not just a family friend but a mentor, a guide, and a constant source of encouragement. His presence made every family gathering complete, and his absence will be deeply felt by everyone whose lives he touched.`,
      futureWishes: `I pray that the beautiful memories you shared with Uncle Raghu bring you comfort in the days ahead. May his soul rest in eternal peace, and may you find strength in the love and support of family and friends.`,
      offerOfSupport: `Please know that I am here for you and your family during this difficult time. Whether you need help with daily tasks, someone to accompany you, or simply a listening ear, please do not hesitate to call me. I will also visit this weekend to pay my respects and see how I can be of assistance.`
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get fields applicable for a specific letter template type
 */
export function getFieldsForTemplateType(templateType: LetterFormalTemplateType): Record<string, FieldConfig> {
  const fields: Record<string, FieldConfig> = {};
  
  for (const [key, config] of Object.entries(LETTER_FORMAL_FIELDS)) {
    // Include if no templateTypes specified (common field) or if current type is included
    if (!config.templateTypes || config.templateTypes.includes(templateType)) {
      fields[key] = config;
    }
  }
  
  return fields;
}

/**
 * Get sample data for a specific template type
 */
export function getSampleData(templateType: LetterFormalTemplateType): Partial<LetterFormalData> {
  return LETTER_FORMAL_SAMPLE_DATA[templateType] || LETTER_FORMAL_SAMPLE_DATA.professional;
}

/**
 * Get template configuration
 */
export function getTemplateConfig(templateType: LetterFormalTemplateType) {
  return LETTER_FORMAL_TEMPLATE_CONFIGS[templateType];
}

/**
 * Get fields grouped by category
 */
export function getFieldsByCategory(templateType: LetterFormalTemplateType): Record<string, Record<string, FieldConfig>> {
  const fields = getFieldsForTemplateType(templateType);
  const grouped: Record<string, Record<string, FieldConfig>> = {};
  
  for (const [key, config] of Object.entries(fields)) {
    if (!grouped[config.category]) {
      grouped[config.category] = {};
    }
    grouped[config.category][key] = config;
  }
  
  return grouped;
}

/**
 * Validate letter formal data
 */
export function validateLetterFormalData(data: Partial<LetterFormalData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const fields = getFieldsForTemplateType(data.templateType || 'professional');
  
  for (const [key, config] of Object.entries(fields)) {
    if (config.required && !data[key as keyof LetterFormalData]) {
      errors.push(`${config.label} is required`);
    }
    
    // Validate field-specific rules
    if (config.validation && data[key as keyof LetterFormalData]) {
      const value = data[key as keyof LetterFormalData] as string;
      
      if (config.validation.minLength && value.length < config.validation.minLength) {
        errors.push(`${config.label} must be at least ${config.validation.minLength} characters`);
      }
      
      if (config.validation.maxLength && value.length > config.validation.maxLength) {
        errors.push(`${config.label} must be less than ${config.validation.maxLength} characters`);
      }
      
      if (config.validation.pattern && !new RegExp(config.validation.pattern).test(value)) {
        errors.push(`${config.label} format is invalid`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Format date for letter display
 */
export function formatLetterDate(dateString: string, format: 'long' | 'short' | 'formal' = 'formal'): string {
  const date = new Date(dateString);
  
  const options: Record<string, Intl.DateTimeFormatOptions> = {
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    formal: { year: 'numeric', month: 'long', day: 'numeric' }
  };
  
  return date.toLocaleDateString('en-IN', options[format]);
}

/**
 * Get appropriate salutation based on template and recipient
 */
export function getRecommendedSalutation(templateType: LetterFormalTemplateType, recipientName?: string): SalutationType {
  const salutationMap: Record<LetterFormalTemplateType, SalutationType> = {
    professional: 'Dear',
    cover: 'Dear Hiring Manager',
    recommendation: 'To Whom It May Concern',
    resignation: 'Dear',
    reference: 'To Whom It May Concern',
    personal: 'Dear'
  };
  
  return salutationMap[templateType];
}

/**
 * Get appropriate closing based on template type
 */
export function getRecommendedClosing(templateType: LetterFormalTemplateType): ClosingType {
  const closingMap: Record<LetterFormalTemplateType, ClosingType> = {
    professional: 'Best regards',
    cover: 'Sincerely',
    recommendation: 'Sincerely',
    resignation: 'With gratitude',
    reference: 'Respectfully',
    personal: 'Warm regards'
  };
  
  return closingMap[templateType];
}

/**
 * Generate full address string
 */
export function formatAddress(
  address?: string,
  city?: string,
  state?: string,
  pincode?: string,
  country?: string
): string {
  const parts = [address, city, state, pincode, country].filter(Boolean);
  return parts.join(', ');
}

/**
 * Get letter type display name
 */
export function getLetterTypeDisplayName(templateType: LetterFormalTemplateType, hindi: boolean = false): string {
  const config = LETTER_FORMAL_TEMPLATE_CONFIGS[templateType];
  return hindi ? config.nameHindi : config.name;
}

/**
 * Check if letterhead should be shown
 */
export function shouldShowLetterhead(data: Partial<LetterFormalData>): boolean {
  return !!(data.letterhead && (data.companyLogo || data.senderCompany));
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  fields: LETTER_FORMAL_FIELDS,
  templates: LETTER_FORMAL_TEMPLATE_CONFIGS,
  sampleData: LETTER_FORMAL_SAMPLE_DATA,
  getFieldsForTemplateType,
  getSampleData,
  getTemplateConfig,
  getFieldsByCategory,
  validateLetterFormalData,
  formatLetterDate,
  getRecommendedSalutation,
  getRecommendedClosing,
  formatAddress,
  getLetterTypeDisplayName,
  shouldShowLetterhead
};