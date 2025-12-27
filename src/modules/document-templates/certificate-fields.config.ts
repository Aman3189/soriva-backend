/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SORIVA - CERTIFICATE TEMPLATES CONFIGURATION
 * Document Type: Certificates (Achievement, Appreciation, Completion, etc.)
 * Templates: 8 variants
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
 * Certificate Template Variants
 */
export type CertificateTemplateType =
  | 'achievement'    // Awards, competitions, accomplishments
  | 'appreciation'   // Thank you, recognition, gratitude
  | 'completion'     // Course, training, program completion
  | 'participation'  // Events, workshops, seminars
  | 'merit'          // Academic excellence, top performers
  | 'experience'     // Work/Internship experience
  | 'membership'     // Club, organization, association
  | 'training';      // Professional training, skill development

/**
 * Certificate Border Styles
 */
export type BorderStyle =
  | 'classic'
  | 'modern'
  | 'elegant'
  | 'minimal'
  | 'ornate'
  | 'golden'
  | 'corporate';

/**
 * Certificate Orientation
 */
export type CertificateOrientation = 'landscape' | 'portrait';

/**
 * Signature Position
 */
export type SignaturePosition = 'left' | 'center' | 'right' | 'dual' | 'triple';

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Signatory Information
 */
export interface CertificateSignatory {
  name: string;
  designation: string;
  signature?: string;          // URL or base64
  position?: 'left' | 'center' | 'right';
}

/**
 * Certificate Seal/Stamp
 */
export interface CertificateSeal {
  type: 'stamp' | 'emboss' | 'logo' | 'qr';
  image?: string;              // URL or base64
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

/**
 * Achievement Details
 */
export interface AchievementDetails {
  title: string;
  rank?: string;               // 1st, 2nd, Gold, Silver
  score?: string;
  category?: string;
  competition?: string;
  level?: 'school' | 'district' | 'state' | 'national' | 'international';
}

/**
 * Course/Training Details
 */
export interface CourseDetails {
  courseName: string;
  courseCode?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  credits?: number;
  grade?: string;
  percentage?: number;
  skills?: string[];
  modules?: string[];
}

/**
 * Experience Details
 */
export interface ExperienceDetails {
  position: string;
  department?: string;
  startDate: string;
  endDate: string;
  duration?: string;
  responsibilities?: string[];
  performance?: string;
}

/**
 * Membership Details
 */
export interface MembershipDetails {
  membershipType: string;      // Gold, Silver, Premium, Standard
  memberId?: string;
  validFrom: string;
  validUntil?: string;
  benefits?: string[];
}

/**
 * Event Details
 */
export interface EventDetails {
  eventName: string;
  eventType?: string;          // Workshop, Seminar, Conference, Webinar
  venue?: string;
  date?: string;
  duration?: string;
  organizer?: string;
}

/**
 * Main Certificate Data Interface
 */
export interface CertificateData {
  // ─────────────────────────────────────────────────────────────
  // METADATA
  // ─────────────────────────────────────────────────────────────
  templateType: CertificateTemplateType;
  certificateTitle: string;
  certificateTitleHindi?: string;
  subtitle?: string;
  certificateNumber?: string;
  
  // ─────────────────────────────────────────────────────────────
  // RECIPIENT INFO
  // ─────────────────────────────────────────────────────────────
  recipientName: string;
  recipientNameHindi?: string;
  recipientTitle?: string;     // Mr., Ms., Dr., Shri, Smt.
  recipientDesignation?: string;
  recipientOrganization?: string;
  recipientPhoto?: string;
  
  // ─────────────────────────────────────────────────────────────
  // STUDENT/EMPLOYEE INFO (if applicable)
  // ─────────────────────────────────────────────────────────────
  rollNumber?: string;
  employeeId?: string;
  registrationNumber?: string;
  class?: string;
  section?: string;
  batch?: string;
  department?: string;
  
  // ─────────────────────────────────────────────────────────────
  // ISSUING ORGANIZATION
  // ─────────────────────────────────────────────────────────────
  organizationName: string;
  organizationNameHindi?: string;
  organizationLogo?: string;
  organizationAddress?: string;
  organizationWebsite?: string;
  organizationEmail?: string;
  organizationPhone?: string;
  
  // ─────────────────────────────────────────────────────────────
  // CERTIFICATE CONTENT
  // ─────────────────────────────────────────────────────────────
  presentationText?: string;   // "This is to certify that..." / "प्रमाणित किया जाता है..."
  description: string;
  descriptionHindi?: string;
  achievementText?: string;
  reasonForAward?: string;
  
  // ─────────────────────────────────────────────────────────────
  // DATE INFORMATION
  // ─────────────────────────────────────────────────────────────
  issueDate: string;
  issueDateHindi?: string;
  validFrom?: string;
  validUntil?: string;
  expiryDate?: string;
  
  // ─────────────────────────────────────────────────────────────
  // ACHIEVEMENT SPECIFIC
  // ─────────────────────────────────────────────────────────────
  achievement?: AchievementDetails;
  
  // ─────────────────────────────────────────────────────────────
  // COMPLETION/TRAINING SPECIFIC
  // ─────────────────────────────────────────────────────────────
  course?: CourseDetails;
  
  // ─────────────────────────────────────────────────────────────
  // EXPERIENCE SPECIFIC
  // ─────────────────────────────────────────────────────────────
  experience?: ExperienceDetails;
  
  // ─────────────────────────────────────────────────────────────
  // MEMBERSHIP SPECIFIC
  // ─────────────────────────────────────────────────────────────
  membership?: MembershipDetails;
  
  // ─────────────────────────────────────────────────────────────
  // EVENT/PARTICIPATION SPECIFIC
  // ─────────────────────────────────────────────────────────────
  event?: EventDetails;
  
  // ─────────────────────────────────────────────────────────────
  // SIGNATORIES
  // ─────────────────────────────────────────────────────────────
  signatories?: CertificateSignatory[];
  primarySignatory?: CertificateSignatory;
  secondarySignatory?: CertificateSignatory;
  
  // ─────────────────────────────────────────────────────────────
  // SEAL & VERIFICATION
  // ─────────────────────────────────────────────────────────────
  seal?: CertificateSeal;
  qrCode?: string;
  verificationUrl?: string;
  verificationCode?: string;
  
  // ─────────────────────────────────────────────────────────────
  // STYLING OPTIONS
  // ─────────────────────────────────────────────────────────────
  accentColor?: string;
  secondaryColor?: string;
  borderStyle?: BorderStyle;
  orientation?: CertificateOrientation;
  showLogo?: boolean;
  showSeal?: boolean;
  showQR?: boolean;
  showPhoto?: boolean;
  showBorder?: boolean;
  backgroundImage?: string;
  watermark?: string;
  
  // ─────────────────────────────────────────────────────────────
  // FOOTER
  // ─────────────────────────────────────────────────────────────
  footerText?: string;
  disclaimer?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: FIELD DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const CERTIFICATE_FIELD_DEFINITIONS: Record<string, {
  type: FieldType;
  label: string;
  labelHindi?: string;
  placeholder?: string;
  required?: boolean;
  category: string;
  templateTypes?: CertificateTemplateType[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}> = {
  // ─────────────────────────────────────────────────────────────
  // METADATA FIELDS
  // ─────────────────────────────────────────────────────────────
  templateType: {
    type: 'select',
    label: 'Certificate Type',
    labelHindi: 'प्रमाणपत्र प्रकार',
    required: true,
    category: 'metadata'
  },
  certificateTitle: {
    type: 'text',
    label: 'Certificate Title',
    labelHindi: 'प्रमाणपत्र शीर्षक',
    placeholder: 'e.g., Certificate of Achievement',
    required: true,
    category: 'metadata'
  },
  subtitle: {
    type: 'text',
    label: 'Subtitle',
    labelHindi: 'उपशीर्षक',
    placeholder: 'e.g., Excellence in Academic Performance',
    category: 'metadata'
  },
  certificateNumber: {
    type: 'text',
    label: 'Certificate Number',
    labelHindi: 'प्रमाणपत्र संख्या',
    placeholder: 'e.g., CERT/2025/001',
    category: 'metadata'
  },

  // ─────────────────────────────────────────────────────────────
  // RECIPIENT FIELDS
  // ─────────────────────────────────────────────────────────────
  recipientName: {
    type: 'text',
    label: 'Recipient Name',
    labelHindi: 'प्राप्तकर्ता का नाम',
    placeholder: 'Full name of the recipient',
    required: true,
    category: 'recipient'
  },
  recipientTitle: {
    type: 'select',
    label: 'Title',
    labelHindi: 'उपाधि',
    placeholder: 'Mr./Ms./Dr.',
    category: 'recipient'
  },
  recipientDesignation: {
    type: 'text',
    label: 'Designation',
    labelHindi: 'पद',
    placeholder: 'e.g., Software Engineer',
    category: 'recipient',
    templateTypes: ['experience', 'appreciation']
  },
  recipientOrganization: {
    type: 'text',
    label: 'Organization',
    labelHindi: 'संगठन',
    placeholder: 'Recipient\'s organization',
    category: 'recipient'
  },
  recipientPhoto: {
    type: 'image',
    label: 'Recipient Photo',
    labelHindi: 'प्राप्तकर्ता फोटो',
    category: 'recipient'
  },

  // ─────────────────────────────────────────────────────────────
  // STUDENT/EMPLOYEE FIELDS
  // ─────────────────────────────────────────────────────────────
  rollNumber: {
    type: 'text',
    label: 'Roll Number',
    labelHindi: 'रोल नंबर',
    placeholder: 'e.g., 2024001',
    category: 'identification',
    templateTypes: ['achievement', 'merit', 'completion', 'participation']
  },
  employeeId: {
    type: 'text',
    label: 'Employee ID',
    labelHindi: 'कर्मचारी आईडी',
    placeholder: 'e.g., EMP001',
    category: 'identification',
    templateTypes: ['experience', 'appreciation', 'training']
  },
  class: {
    type: 'text',
    label: 'Class',
    labelHindi: 'कक्षा',
    placeholder: 'e.g., 10th, B.Tech 3rd Year',
    category: 'identification',
    templateTypes: ['achievement', 'merit', 'participation']
  },
  section: {
    type: 'text',
    label: 'Section',
    labelHindi: 'अनुभाग',
    placeholder: 'e.g., A, B, C',
    category: 'identification'
  },
  department: {
    type: 'text',
    label: 'Department',
    labelHindi: 'विभाग',
    placeholder: 'e.g., Computer Science',
    category: 'identification'
  },
  batch: {
    type: 'text',
    label: 'Batch',
    labelHindi: 'बैच',
    placeholder: 'e.g., 2022-2026',
    category: 'identification'
  },

  // ─────────────────────────────────────────────────────────────
  // ORGANIZATION FIELDS
  // ─────────────────────────────────────────────────────────────
  organizationName: {
    type: 'text',
    label: 'Organization Name',
    labelHindi: 'संगठन का नाम',
    placeholder: 'Issuing organization name',
    required: true,
    category: 'organization'
  },
  organizationLogo: {
    type: 'image',
    label: 'Organization Logo',
    labelHindi: 'संगठन लोगो',
    category: 'organization'
  },
  organizationAddress: {
    type: 'textarea',
    label: 'Organization Address',
    labelHindi: 'संगठन पता',
    placeholder: 'Full address',
    category: 'organization'
  },
  organizationWebsite: {
    type: 'url',
    label: 'Website',
    labelHindi: 'वेबसाइट',
    placeholder: 'https://example.com',
    category: 'organization'
  },

  // ─────────────────────────────────────────────────────────────
  // CONTENT FIELDS
  // ─────────────────────────────────────────────────────────────
  presentationText: {
    type: 'textarea',
    label: 'Presentation Text',
    labelHindi: 'प्रस्तुति पाठ',
    placeholder: 'This is to certify that...',
    category: 'content'
  },
  description: {
    type: 'textarea',
    label: 'Description',
    labelHindi: 'विवरण',
    placeholder: 'Certificate description/reason',
    required: true,
    category: 'content'
  },
  achievementText: {
    type: 'textarea',
    label: 'Achievement Description',
    labelHindi: 'उपलब्धि विवरण',
    placeholder: 'Describe the achievement',
    category: 'content',
    templateTypes: ['achievement', 'merit']
  },
  reasonForAward: {
    type: 'textarea',
    label: 'Reason for Award',
    labelHindi: 'पुरस्कार का कारण',
    placeholder: 'Why is this certificate being awarded?',
    category: 'content'
  },

  // ─────────────────────────────────────────────────────────────
  // DATE FIELDS
  // ─────────────────────────────────────────────────────────────
  issueDate: {
    type: 'date',
    label: 'Issue Date',
    labelHindi: 'जारी करने की तिथि',
    required: true,
    category: 'dates'
  },
  validFrom: {
    type: 'date',
    label: 'Valid From',
    labelHindi: 'से मान्य',
    category: 'dates',
    templateTypes: ['membership', 'training']
  },
  validUntil: {
    type: 'date',
    label: 'Valid Until',
    labelHindi: 'तक मान्य',
    category: 'dates',
    templateTypes: ['membership', 'training']
  },
  expiryDate: {
    type: 'date',
    label: 'Expiry Date',
    labelHindi: 'समाप्ति तिथि',
    category: 'dates',
    templateTypes: ['membership', 'training']
  },

  // ─────────────────────────────────────────────────────────────
  // ACHIEVEMENT FIELDS
  // ─────────────────────────────────────────────────────────────
  achievementTitle: {
    type: 'text',
    label: 'Achievement Title',
    labelHindi: 'उपलब्धि शीर्षक',
    placeholder: 'e.g., First Prize in Science Exhibition',
    category: 'achievement',
    templateTypes: ['achievement']
  },
  rank: {
    type: 'text',
    label: 'Rank/Position',
    labelHindi: 'रैंक/स्थान',
    placeholder: 'e.g., 1st, Gold Medal, Topper',
    category: 'achievement',
    templateTypes: ['achievement', 'merit']
  },
  score: {
    type: 'text',
    label: 'Score/Marks',
    labelHindi: 'अंक',
    placeholder: 'e.g., 98%, 950/1000',
    category: 'achievement',
    templateTypes: ['achievement', 'merit', 'completion']
  },
  competitionName: {
    type: 'text',
    label: 'Competition Name',
    labelHindi: 'प्रतियोगिता का नाम',
    placeholder: 'e.g., Inter-School Science Quiz',
    category: 'achievement',
    templateTypes: ['achievement', 'participation']
  },
  level: {
    type: 'select',
    label: 'Level',
    labelHindi: 'स्तर',
    category: 'achievement',
    templateTypes: ['achievement', 'participation']
  },

  // ─────────────────────────────────────────────────────────────
  // COURSE/TRAINING FIELDS
  // ─────────────────────────────────────────────────────────────
  courseName: {
    type: 'text',
    label: 'Course Name',
    labelHindi: 'पाठ्यक्रम का नाम',
    placeholder: 'e.g., Web Development Bootcamp',
    category: 'course',
    templateTypes: ['completion', 'training']
  },
  courseCode: {
    type: 'text',
    label: 'Course Code',
    labelHindi: 'पाठ्यक्रम कोड',
    placeholder: 'e.g., WD101',
    category: 'course',
    templateTypes: ['completion', 'training']
  },
  duration: {
    type: 'text',
    label: 'Duration',
    labelHindi: 'अवधि',
    placeholder: 'e.g., 3 months, 40 hours',
    category: 'course',
    templateTypes: ['completion', 'training', 'experience']
  },
  startDate: {
    type: 'date',
    label: 'Start Date',
    labelHindi: 'प्रारंभ तिथि',
    category: 'course',
    templateTypes: ['completion', 'training', 'experience']
  },
  endDate: {
    type: 'date',
    label: 'End Date',
    labelHindi: 'समाप्ति तिथि',
    category: 'course',
    templateTypes: ['completion', 'training', 'experience']
  },
  grade: {
    type: 'text',
    label: 'Grade',
    labelHindi: 'ग्रेड',
    placeholder: 'e.g., A+, Distinction',
    category: 'course',
    templateTypes: ['completion', 'training']
  },
  skills: {
    type: 'textarea-list',
    label: 'Skills Acquired',
    labelHindi: 'अर्जित कौशल',
    placeholder: 'List skills learned',
    category: 'course',
    templateTypes: ['completion', 'training']
  },

  // ─────────────────────────────────────────────────────────────
  // EXPERIENCE FIELDS
  // ─────────────────────────────────────────────────────────────
  position: {
    type: 'text',
    label: 'Position/Role',
    labelHindi: 'पद/भूमिका',
    placeholder: 'e.g., Software Developer Intern',
    category: 'experience',
    templateTypes: ['experience']
  },
  responsibilities: {
    type: 'textarea-list',
    label: 'Key Responsibilities',
    labelHindi: 'मुख्य जिम्मेदारियां',
    placeholder: 'List responsibilities',
    category: 'experience',
    templateTypes: ['experience']
  },
  performance: {
    type: 'textarea',
    label: 'Performance Summary',
    labelHindi: 'प्रदर्शन सारांश',
    placeholder: 'Overall performance during tenure',
    category: 'experience',
    templateTypes: ['experience']
  },

  // ─────────────────────────────────────────────────────────────
  // MEMBERSHIP FIELDS
  // ─────────────────────────────────────────────────────────────
  membershipType: {
    type: 'text',
    label: 'Membership Type',
    labelHindi: 'सदस्यता प्रकार',
    placeholder: 'e.g., Gold, Premium, Lifetime',
    category: 'membership',
    templateTypes: ['membership']
  },
  memberId: {
    type: 'text',
    label: 'Member ID',
    labelHindi: 'सदस्य आईडी',
    placeholder: 'e.g., MEM2025001',
    category: 'membership',
    templateTypes: ['membership']
  },
  benefits: {
    type: 'textarea-list',
    label: 'Membership Benefits',
    labelHindi: 'सदस्यता लाभ',
    placeholder: 'List benefits',
    category: 'membership',
    templateTypes: ['membership']
  },

  // ─────────────────────────────────────────────────────────────
  // EVENT FIELDS
  // ─────────────────────────────────────────────────────────────
  eventName: {
    type: 'text',
    label: 'Event Name',
    labelHindi: 'कार्यक्रम का नाम',
    placeholder: 'e.g., Annual Tech Summit 2025',
    category: 'event',
    templateTypes: ['participation']
  },
  eventType: {
    type: 'select',
    label: 'Event Type',
    labelHindi: 'कार्यक्रम प्रकार',
    category: 'event',
    templateTypes: ['participation']
  },
  venue: {
    type: 'text',
    label: 'Venue',
    labelHindi: 'स्थान',
    placeholder: 'Event location',
    category: 'event',
    templateTypes: ['participation']
  },
  eventDate: {
    type: 'date',
    label: 'Event Date',
    labelHindi: 'कार्यक्रम तिथि',
    category: 'event',
    templateTypes: ['participation']
  },
  organizer: {
    type: 'text',
    label: 'Organizer',
    labelHindi: 'आयोजक',
    placeholder: 'Event organizer name',
    category: 'event',
    templateTypes: ['participation']
  },

  // ─────────────────────────────────────────────────────────────
  // SIGNATORY FIELDS
  // ─────────────────────────────────────────────────────────────
  signatoryName: {
    type: 'text',
    label: 'Signatory Name',
    labelHindi: 'हस्ताक्षरकर्ता का नाम',
    placeholder: 'Name of person signing',
    category: 'signatory'
  },
  signatoryDesignation: {
    type: 'text',
    label: 'Signatory Designation',
    labelHindi: 'हस्ताक्षरकर्ता का पद',
    placeholder: 'e.g., Principal, Director, CEO',
    category: 'signatory'
  },
  signatorySignature: {
    type: 'image',
    label: 'Signature Image',
    labelHindi: 'हस्ताक्षर छवि',
    category: 'signatory'
  },

  // ─────────────────────────────────────────────────────────────
  // VERIFICATION FIELDS
  // ─────────────────────────────────────────────────────────────
  qrCode: {
    type: 'image',
    label: 'QR Code',
    labelHindi: 'क्यूआर कोड',
    category: 'verification'
  },
  verificationUrl: {
    type: 'url',
    label: 'Verification URL',
    labelHindi: 'सत्यापन URL',
    placeholder: 'https://verify.example.com/cert/123',
    category: 'verification'
  },
  verificationCode: {
    type: 'text',
    label: 'Verification Code',
    labelHindi: 'सत्यापन कोड',
    placeholder: 'e.g., ABC123XYZ',
    category: 'verification'
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
  secondaryColor: {
    type: 'color',
    label: 'Secondary Color',
    labelHindi: 'द्वितीयक रंग',
    category: 'styling'
  },
  borderStyle: {
    type: 'select',
    label: 'Border Style',
    labelHindi: 'बॉर्डर शैली',
    category: 'styling'
  },
  orientation: {
    type: 'radio',
    label: 'Orientation',
    labelHindi: 'अभिविन्यास',
    category: 'styling'
  },
  showLogo: {
    type: 'checkbox',
    label: 'Show Logo',
    labelHindi: 'लोगो दिखाएं',
    category: 'styling'
  },
  showSeal: {
    type: 'checkbox',
    label: 'Show Seal',
    labelHindi: 'मुहर दिखाएं',
    category: 'styling'
  },
  showQR: {
    type: 'checkbox',
    label: 'Show QR Code',
    labelHindi: 'क्यूआर कोड दिखाएं',
    category: 'styling'
  },
  showBorder: {
    type: 'checkbox',
    label: 'Show Border',
    labelHindi: 'बॉर्डर दिखाएं',
    category: 'styling'
  },
  backgroundImage: {
    type: 'image',
    label: 'Background Image',
    labelHindi: 'पृष्ठभूमि छवि',
    category: 'styling'
  },
  watermark: {
    type: 'text',
    label: 'Watermark Text',
    labelHindi: 'वॉटरमार्क',
    category: 'styling'
  },

  // ─────────────────────────────────────────────────────────────
  // FOOTER FIELDS
  // ─────────────────────────────────────────────────────────────
  footerText: {
    type: 'text',
    label: 'Footer Text',
    labelHindi: 'फुटर टेक्स्ट',
    placeholder: 'e.g., This certificate is valid without signature',
    category: 'footer'
  },
  disclaimer: {
    type: 'textarea',
    label: 'Disclaimer',
    labelHindi: 'अस्वीकरण',
    placeholder: 'Any disclaimers or terms',
    category: 'footer'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: TEMPLATE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const CERTIFICATE_TEMPLATE_CONFIGS: Record<CertificateTemplateType, {
  name: string;
  nameHindi: string;
  description: string;
  icon: string;
  sections: string[];
  recommendedFor: string[];
  defaultTitle: string;
  defaultTitleHindi: string;
}> = {
  achievement: {
    name: 'Certificate of Achievement',
    nameHindi: 'उपलब्धि प्रमाणपत्र',
    description: 'For awards, competitions, accomplishments, and recognitions',
    icon: '🏆',
    sections: ['header', 'recipient', 'achievement', 'description', 'signatories', 'seal'],
    recommendedFor: ['Schools', 'Competitions', 'Sports', 'Cultural Events'],
    defaultTitle: 'Certificate of Achievement',
    defaultTitleHindi: 'उपलब्धि प्रमाणपत्र'
  },
  appreciation: {
    name: 'Certificate of Appreciation',
    nameHindi: 'प्रशंसा प्रमाणपत्र',
    description: 'For thanking and recognizing contributions and efforts',
    icon: '🙏',
    sections: ['header', 'recipient', 'description', 'reason', 'signatories', 'seal'],
    recommendedFor: ['Corporate', 'NGO', 'Volunteers', 'Guest Speakers'],
    defaultTitle: 'Certificate of Appreciation',
    defaultTitleHindi: 'प्रशंसा प्रमाणपत्र'
  },
  completion: {
    name: 'Certificate of Completion',
    nameHindi: 'पूर्णता प्रमाणपत्र',
    description: 'For course, program, or training completion',
    icon: '🎓',
    sections: ['header', 'recipient', 'course', 'duration', 'grade', 'signatories', 'seal'],
    recommendedFor: ['Online Courses', 'Training Programs', 'Workshops', 'Bootcamps'],
    defaultTitle: 'Certificate of Completion',
    defaultTitleHindi: 'पूर्णता प्रमाणपत्र'
  },
  participation: {
    name: 'Certificate of Participation',
    nameHindi: 'भागीदारी प्रमाणपत्र',
    description: 'For event, workshop, or seminar participation',
    icon: '🎪',
    sections: ['header', 'recipient', 'event', 'description', 'signatories', 'seal'],
    recommendedFor: ['Workshops', 'Seminars', 'Conferences', 'Webinars', 'Hackathons'],
    defaultTitle: 'Certificate of Participation',
    defaultTitleHindi: 'भागीदारी प्रमाणपत्र'
  },
  merit: {
    name: 'Certificate of Merit',
    nameHindi: 'योग्यता प्रमाणपत्र',
    description: 'For academic excellence and outstanding performance',
    icon: '⭐',
    sections: ['header', 'recipient', 'achievement', 'rank', 'signatories', 'seal'],
    recommendedFor: ['Schools', 'Universities', 'Academic Competitions', 'Scholarships'],
    defaultTitle: 'Certificate of Merit',
    defaultTitleHindi: 'योग्यता प्रमाणपत्र'
  },
  experience: {
    name: 'Experience Certificate',
    nameHindi: 'अनुभव प्रमाणपत्र',
    description: 'For work experience and internship completion',
    icon: '💼',
    sections: ['header', 'recipient', 'position', 'duration', 'responsibilities', 'performance', 'signatories', 'seal'],
    recommendedFor: ['Companies', 'Internships', 'Freelance', 'Contract Work'],
    defaultTitle: 'Experience Certificate',
    defaultTitleHindi: 'अनुभव प्रमाणपत्र'
  },
  membership: {
    name: 'Membership Certificate',
    nameHindi: 'सदस्यता प्रमाणपत्र',
    description: 'For club, organization, or association membership',
    icon: '🎫',
    sections: ['header', 'recipient', 'membership', 'validity', 'benefits', 'signatories', 'seal'],
    recommendedFor: ['Clubs', 'Associations', 'Professional Bodies', 'Gyms'],
    defaultTitle: 'Membership Certificate',
    defaultTitleHindi: 'सदस्यता प्रमाणपत्र'
  },
  training: {
    name: 'Training Certificate',
    nameHindi: 'प्रशिक्षण प्रमाणपत्र',
    description: 'For professional training and skill development programs',
    icon: '📚',
    sections: ['header', 'recipient', 'training', 'skills', 'duration', 'assessment', 'signatories', 'seal'],
    recommendedFor: ['Corporate Training', 'Skill Development', 'Professional Courses', 'Certifications'],
    defaultTitle: 'Training Certificate',
    defaultTitleHindi: 'प्रशिक्षण प्रमाणपत्र'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const CERTIFICATE_SAMPLE_DATA: Record<CertificateTemplateType, Partial<CertificateData>> = {
  achievement: {
    templateType: 'achievement',
    certificateTitle: 'Certificate of Achievement',
    certificateNumber: 'ACH/2025/001',
    recipientName: 'Arjun Sharma',
    recipientTitle: 'Master',
    rollNumber: '2024010',
    class: '10th',
    section: 'A',
    organizationName: 'Delhi Public School, R.K. Puram',
    organizationAddress: 'Sector 12, R.K. Puram, New Delhi - 110022',
    presentationText: 'This is to certify that',
    description: 'has shown exceptional performance and secured First Position in the Annual Science Exhibition 2025.',
    achievement: {
      title: 'Science Exhibition',
      rank: 'First Position',
      category: 'Innovation',
      competition: 'Annual Science Exhibition 2025',
      level: 'school'
    },
    issueDate: '2025-12-15',
    primarySignatory: {
      name: 'Dr. Vandana Sharma',
      designation: 'Principal',
      position: 'right'
    },
    secondarySignatory: {
      name: 'Mr. Rajesh Kumar',
      designation: 'Science HOD',
      position: 'left'
    },
    accentColor: '#1e40af',
    borderStyle: 'golden',
    orientation: 'landscape',
    showLogo: true,
    showSeal: true,
    showBorder: true
  },

  appreciation: {
    templateType: 'appreciation',
    certificateTitle: 'Certificate of Appreciation',
    certificateNumber: 'APP/2025/042',
    recipientName: 'Dr. Priya Patel',
    recipientTitle: 'Dr.',
    recipientDesignation: 'Senior Data Scientist',
    recipientOrganization: 'Google India',
    organizationName: 'Indian Institute of Technology, Delhi',
    organizationAddress: 'Hauz Khas, New Delhi - 110016',
    presentationText: 'This certificate is proudly presented to',
    description: 'in recognition of their valuable contribution as a Guest Speaker at the Annual Tech Summit 2025. Your insights on "AI in Healthcare" inspired hundreds of students and faculty members.',
    reasonForAward: 'Outstanding contribution to knowledge sharing and mentorship',
    issueDate: '2025-12-10',
    primarySignatory: {
      name: 'Prof. Ramesh Gupta',
      designation: 'Director',
      position: 'center'
    },
    accentColor: '#7c3aed',
    borderStyle: 'elegant',
    orientation: 'landscape',
    showLogo: true,
    showSeal: true
  },

  completion: {
    templateType: 'completion',
    certificateTitle: 'Certificate of Completion',
    certificateNumber: 'COMP/2025/1234',
    recipientName: 'Rahul Verma',
    organizationName: 'Coursera',
    organizationWebsite: 'https://www.coursera.org',
    presentationText: 'This is to certify that',
    description: 'has successfully completed the online certification program.',
    course: {
      courseName: 'Full Stack Web Development',
      courseCode: 'FSWD-2025',
      duration: '6 months',
      startDate: '2025-06-01',
      endDate: '2025-11-30',
      credits: 24,
      grade: 'A+',
      percentage: 94,
      skills: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'TypeScript', 'AWS'],
      modules: ['Frontend Development', 'Backend Development', 'Database Design', 'Cloud Deployment']
    },
    issueDate: '2025-12-01',
    verificationUrl: 'https://coursera.org/verify/FSWD2025RV',
    verificationCode: 'FSWD2025RV',
    primarySignatory: {
      name: 'Jeff Maggioncalda',
      designation: 'CEO, Coursera',
      position: 'right'
    },
    accentColor: '#0284c7',
    borderStyle: 'modern',
    showQR: true,
    showLogo: true
  },

  participation: {
    templateType: 'participation',
    certificateTitle: 'Certificate of Participation',
    certificateNumber: 'PART/2025/567',
    recipientName: 'Sneha Reddy',
    rollNumber: '2024CSE089',
    class: 'B.Tech CSE',
    organizationName: 'Indian Institute of Science, Bangalore',
    presentationText: 'This certificate is awarded to',
    description: 'for active participation in the three-day national workshop.',
    event: {
      eventName: 'National Workshop on Machine Learning & AI',
      eventType: 'Workshop',
      venue: 'IISc Main Auditorium, Bangalore',
      date: '2025-12-05',
      duration: '3 days (24 hours)',
      organizer: 'Department of Computer Science, IISc'
    },
    issueDate: '2025-12-08',
    primarySignatory: {
      name: 'Prof. S. Ramakrishnan',
      designation: 'Workshop Coordinator',
      position: 'left'
    },
    secondarySignatory: {
      name: 'Dr. Anita Desai',
      designation: 'HOD, Computer Science',
      position: 'right'
    },
    accentColor: '#059669',
    borderStyle: 'classic',
    orientation: 'landscape'
  },

  merit: {
    templateType: 'merit',
    certificateTitle: 'Certificate of Merit',
    certificateTitleHindi: 'योग्यता प्रमाणपत्र',
    certificateNumber: 'MERIT/2025/001',
    recipientName: 'Aditya Kumar Singh',
    recipientNameHindi: 'आदित्य कुमार सिंह',
    rollNumber: '2024001',
    class: '12th Science',
    section: 'A',
    organizationName: 'Kendriya Vidyalaya No. 1',
    organizationNameHindi: 'केंद्रीय विद्यालय संख्या 1',
    organizationAddress: 'Delhi Cantt, New Delhi - 110010',
    presentationText: 'This is to certify that',
    description: 'has demonstrated outstanding academic excellence and secured the highest marks in the CBSE Board Examination 2025.',
    achievement: {
      title: 'CBSE Board Topper',
      rank: 'School Topper',
      score: '99.2%',
      category: 'Academic Excellence',
      level: 'school'
    },
    issueDate: '2025-07-15',
    primarySignatory: {
      name: 'Shri Rakesh Sharma',
      designation: 'Principal',
      position: 'center'
    },
    accentColor: '#b91c1c',
    secondaryColor: '#fbbf24',
    borderStyle: 'ornate',
    orientation: 'landscape',
    showSeal: true
  },

  experience: {
    templateType: 'experience',
    certificateTitle: 'Experience Certificate',
    certificateNumber: 'EXP/2025/HR/089',
    recipientName: 'Vikram Malhotra',
    recipientTitle: 'Mr.',
    employeeId: 'EMP10234',
    organizationName: 'Infosys Limited',
    organizationAddress: 'Electronics City, Hosur Road, Bangalore - 560100',
    organizationWebsite: 'https://www.infosys.com',
    presentationText: 'This is to certify that',
    description: 'was employed with our organization and has successfully completed their tenure.',
    experience: {
      position: 'Senior Software Engineer',
      department: 'Digital Services - Banking Domain',
      startDate: '2022-01-15',
      endDate: '2025-12-10',
      duration: '3 years 11 months',
      responsibilities: [
        'Led a team of 5 developers for core banking modernization project',
        'Designed and implemented microservices architecture',
        'Conducted code reviews and mentored junior developers',
        'Collaborated with clients for requirement gathering'
      ],
      performance: 'Vikram has been a valuable asset to our organization. His dedication, technical expertise, and leadership skills have contributed significantly to project success. We wish him all the best for his future endeavors.'
    },
    issueDate: '2025-12-12',
    primarySignatory: {
      name: 'Ananya Krishnan',
      designation: 'HR Manager',
      position: 'left'
    },
    secondarySignatory: {
      name: 'Suresh Iyer',
      designation: 'Delivery Manager',
      position: 'right'
    },
    accentColor: '#0f766e',
    borderStyle: 'corporate',
    orientation: 'portrait',
    showLogo: true,
    showSeal: true
  },

  membership: {
    templateType: 'membership',
    certificateTitle: 'Membership Certificate',
    certificateNumber: 'MEM/2025/GOLD/456',
    recipientName: 'Dr. Meera Kapoor',
    recipientTitle: 'Dr.',
    organizationName: 'Indian Medical Association',
    organizationAddress: 'IMA House, Indraprastha Marg, New Delhi - 110002',
    organizationWebsite: 'https://www.ima-india.org',
    presentationText: 'This is to certify that',
    description: 'is a registered member of the Indian Medical Association.',
    membership: {
      membershipType: 'Lifetime Member',
      memberId: 'IMA/DEL/LM/2025/456',
      validFrom: '2025-01-01',
      validUntil: 'Lifetime',
      benefits: [
        'Access to all IMA events and conferences',
        'Subscription to Indian Medical Journal',
        'Professional networking opportunities',
        'Legal support services',
        'Insurance benefits'
      ]
    },
    issueDate: '2025-01-15',
    primarySignatory: {
      name: 'Dr. Sharad Kumar Agarwal',
      designation: 'National President',
      position: 'right'
    },
    secondarySignatory: {
      name: 'Dr. Anita Sharma',
      designation: 'Secretary General',
      position: 'left'
    },
    accentColor: '#1d4ed8',
    borderStyle: 'elegant',
    showLogo: true,
    showSeal: true,
    showQR: true
  },

  training: {
    templateType: 'training',
    certificateTitle: 'Training Certificate',
    certificateNumber: 'TRN/2025/AWS/789',
    recipientName: 'Karthik Rajan',
    employeeId: 'TCS/CHN/45678',
    department: 'Cloud Solutions',
    organizationName: 'Tata Consultancy Services',
    organizationAddress: 'Olympia Tech Park, Chennai - 600032',
    presentationText: 'This is to certify that',
    description: 'has successfully completed the corporate training program.',
    course: {
      courseName: 'AWS Solutions Architect Professional',
      courseCode: 'AWS-SAP-2025',
      duration: '80 hours',
      startDate: '2025-10-01',
      endDate: '2025-11-30',
      grade: 'Distinction',
      percentage: 92,
      skills: [
        'AWS Architecture Design',
        'Cost Optimization',
        'Security Best Practices',
        'Migration Strategies',
        'High Availability Design'
      ]
    },
    issueDate: '2025-12-05',
    verificationCode: 'TCS-AWS-2025-KR789',
    primarySignatory: {
      name: 'Rajesh Gopinathan',
      designation: 'Head - Learning & Development',
      position: 'right'
    },
    accentColor: '#ea580c',
    borderStyle: 'modern',
    showLogo: true,
    showQR: true
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get fields applicable to a specific template type
 */
export function getFieldsForTemplateType(templateType: CertificateTemplateType): string[] {
  const commonFields = [
    'certificateTitle', 'subtitle', 'certificateNumber',
    'recipientName', 'recipientTitle',
    'organizationName', 'organizationLogo', 'organizationAddress',
    'presentationText', 'description',
    'issueDate',
    'signatoryName', 'signatoryDesignation', 'signatorySignature',
    'accentColor', 'borderStyle', 'orientation', 'showLogo', 'showSeal', 'showBorder'
  ];

  const templateSpecificFields: Record<CertificateTemplateType, string[]> = {
    achievement: ['rollNumber', 'class', 'section', 'achievementTitle', 'rank', 'score', 'competitionName', 'level'],
    appreciation: ['recipientDesignation', 'recipientOrganization', 'reasonForAward'],
    completion: ['courseName', 'courseCode', 'duration', 'startDate', 'endDate', 'grade', 'skills', 'verificationUrl', 'verificationCode', 'showQR'],
    participation: ['rollNumber', 'class', 'eventName', 'eventType', 'venue', 'eventDate', 'organizer'],
    merit: ['rollNumber', 'class', 'section', 'achievementTitle', 'rank', 'score'],
    experience: ['employeeId', 'department', 'position', 'startDate', 'endDate', 'duration', 'responsibilities', 'performance'],
    membership: ['memberId', 'membershipType', 'validFrom', 'validUntil', 'benefits', 'showQR'],
    training: ['employeeId', 'department', 'courseName', 'courseCode', 'duration', 'startDate', 'endDate', 'grade', 'skills', 'verificationCode', 'showQR']
  };

  return [...commonFields, ...templateSpecificFields[templateType]];
}

/**
 * Get sample data for preview
 */
export function getSampleData(templateType: CertificateTemplateType): Partial<CertificateData> {
  return CERTIFICATE_SAMPLE_DATA[templateType];
}

/**
 * Get template info
 */
export function getTemplateInfo(templateType: CertificateTemplateType) {
  return CERTIFICATE_TEMPLATE_CONFIGS[templateType];
}

/**
 * Get default title for template type
 */
export function getDefaultTitle(templateType: CertificateTemplateType, language: 'en' | 'hi' = 'en'): string {
  const config = CERTIFICATE_TEMPLATE_CONFIGS[templateType];
  return language === 'hi' ? config.defaultTitleHindi : config.defaultTitle;
}

/**
 * Validate certificate data
 */
export function validateCertificateData(data: Partial<CertificateData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.certificateTitle) errors.push('Certificate title is required');
  if (!data.recipientName) errors.push('Recipient name is required');
  if (!data.organizationName) errors.push('Organization name is required');
  if (!data.description) errors.push('Description is required');
  if (!data.issueDate) errors.push('Issue date is required');

  // Template-specific validation
  if (data.templateType === 'experience') {
    if (!data.experience?.position) errors.push('Position is required for experience certificate');
    if (!data.experience?.startDate) errors.push('Start date is required for experience certificate');
    if (!data.experience?.endDate) errors.push('End date is required for experience certificate');
  }

  if (data.templateType === 'completion' || data.templateType === 'training') {
    if (!data.course?.courseName) errors.push('Course name is required');
  }

  if (data.templateType === 'participation') {
    if (!data.event?.eventName) errors.push('Event name is required for participation certificate');
  }

  if (data.templateType === 'membership') {
    if (!data.membership?.membershipType) errors.push('Membership type is required');
    if (!data.membership?.validFrom) errors.push('Valid from date is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate certificate number
 */
export function generateCertificateNumber(templateType: CertificateTemplateType, sequence: number): string {
  const prefixes: Record<CertificateTemplateType, string> = {
    achievement: 'ACH',
    appreciation: 'APP',
    completion: 'COMP',
    participation: 'PART',
    merit: 'MERIT',
    experience: 'EXP',
    membership: 'MEM',
    training: 'TRN'
  };
  
  const year = new Date().getFullYear();
  const paddedSeq = String(sequence).padStart(4, '0');
  
  return `${prefixes[templateType]}/${year}/${paddedSeq}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  fields: CERTIFICATE_FIELD_DEFINITIONS,
  templates: CERTIFICATE_TEMPLATE_CONFIGS,
  sampleData: CERTIFICATE_SAMPLE_DATA,
  getFieldsForTemplateType,
  getSampleData,
  getTemplateInfo,
  getDefaultTitle,
  validateCertificateData,
  generateCertificateNumber
};