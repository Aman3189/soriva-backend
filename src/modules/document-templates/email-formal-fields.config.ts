/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SORIVA - EMAIL FORMAL TEMPLATES CONFIGURATION
 * Document Type: Formal Business Emails (Professional, Corporate, Complaint, etc.)
 * Templates: 6 variants (Professional, Corporate, Complaint, Inquiry, Follow-up, Thank-you)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type FieldType =
  | 'text' | 'textarea' | 'ai-textarea' | 'number' | 'date' | 'email'
  | 'url' | 'tel' | 'select' | 'multiselect' | 'checkbox' | 'radio'
  | 'color' | 'file' | 'image' | 'complex' | 'array' | 'object' | 'rich-text' | 'markdown';

export type EmailFormalTemplateType =
  | 'professional' | 'corporate' | 'complaint' | 'inquiry' | 'follow-up' | 'thank-you';

export type EmailPriority = 'normal' | 'high' | 'urgent' | 'confidential';
export type SalutationType = 'Dear' | 'Respected' | 'Hello' | 'Hi' | 'To';
export type ClosingType =
  | 'Best regards' | 'Kind regards' | 'Sincerely' | 'Warm regards' | 'Respectfully'
  | 'Thanks and regards' | 'With sincere gratitude' | 'With heartfelt thanks'
  | 'Gratefully yours' | 'With appreciation' | 'Thank you once again'
  | 'Looking forward to hearing from you' | 'Thank you for your time and consideration';

export type CorporateEmailType = 'announcement' | 'memo' | 'circular' | 'notice' | 'policy-update' | 'newsletter';
export type ComplaintType = 'product' | 'service' | 'billing' | 'delivery' | 'staff' | 'quality' | 'other';
export type InquiryType = 'product' | 'service' | 'admission' | 'partnership' | 'pricing' | 'general' | 'job';
export type FollowUpType = 'interview' | 'meeting' | 'proposal' | 'application' | 'networking' | 'sales' | 'project';
export type ThankYouType = 'interview' | 'meeting' | 'referral' | 'hospitality' | 'assistance' | 'mentorship' | 'business' | 'collaboration' | 'gift' | 'event';

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SenderInfo {
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  company?: string;
  department?: string;
  address?: string;
}

export interface RecipientInfo {
  name: string;
  email?: string;
  designation?: string;
  company?: string;
  department?: string;
  address?: string;
}

export interface EmailAttachment {
  name: string;
  description?: string;
  type?: string;
}

export interface CorporateDetails {
  companyName: string;
  companyLogo?: string;
  emailType: CorporateEmailType;
  referenceNumber?: string;
  effectiveDate?: string;
  priority?: EmailPriority;
  actionRequired?: string;
  contactPerson?: string;
  disclaimer?: string;
}

export interface ComplaintDetails {
  complaintType: ComplaintType;
  referenceNumber?: string;
  incidentDate: string;
  complaintDescription: string;
  previousAttempts?: string;
  desiredResolution: string;
  deadline?: string;
  attachments?: EmailAttachment[];
}

export interface InquiryDetails {
  inquiryType: InquiryType;
  introContext: string;
  specificQuestions: string;
  purposeOfInquiry?: string;
  preferredResponseMethod?: 'email' | 'phone' | 'meeting' | 'any';
  urgency?: 'normal' | 'soon' | 'urgent';
}

export interface FollowUpDetails {
  followUpType: FollowUpType;
  originalDate: string;
  meetingContext: string;
  keyPointsDiscussed?: string;
  actionItems?: string;
  nextSteps?: string;
}

export interface ThankYouDetails {
  thankYouType: ThankYouType;
  occasionDate?: string;
  specificThanks: string;
  memorableDetails?: string;
  futureConnection?: string;
}

export interface EmailFormalData {
  templateType: EmailFormalTemplateType;
  emailSubject: string;
  emailDate: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  senderDesignation?: string;
  senderCompany?: string;
  senderDepartment?: string;
  senderAddress?: string;
  recipientName: string;
  recipientEmail?: string;
  recipientDesignation?: string;
  recipientCompany?: string;
  recipientDepartment?: string;
  recipientAddress?: string;
  recipients?: string;
  salutation: SalutationType;
  emailBody: string;
  closing: ClosingType;
  corporate?: CorporateDetails;
  complaint?: ComplaintDetails;
  inquiry?: InquiryDetails;
  followUp?: FollowUpDetails;
  thankYou?: ThankYouDetails;
  attachmentsList?: string;
  hasAttachments?: boolean;
  includeSignature?: boolean;
  signatureStyle?: 'minimal' | 'standard' | 'detailed';
  accentColor?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: FIELD DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const EMAIL_FORMAL_FIELD_DEFINITIONS: Record<string, {
  type: FieldType;
  label: string;
  labelHindi?: string;
  placeholder?: string;
  required?: boolean;
  category: string;
  templateTypes?: EmailFormalTemplateType[];
  options?: { value: string; label: string }[];
  aiPrompt?: string;
}> = {
  // METADATA
  templateType: { type: 'select', label: 'Email Type', labelHindi: 'ईमेल प्रकार', required: true, category: 'metadata',
    options: [
      { value: 'professional', label: 'Professional Email / व्यावसायिक ईमेल' },
      { value: 'corporate', label: 'Corporate Communication / कॉर्पोरेट संचार' },
      { value: 'complaint', label: 'Formal Complaint / औपचारिक शिकायत' },
      { value: 'inquiry', label: 'Formal Inquiry / औपचारिक पूछताछ' },
      { value: 'follow-up', label: 'Follow-up Email / फॉलो-अप ईमेल' },
      { value: 'thank-you', label: 'Thank You Email / धन्यवाद ईमेल' }
    ]
  },
  emailSubject: { type: 'text', label: 'Email Subject', labelHindi: 'ईमेल विषय', placeholder: 'Project Status Update - Q4 2024', required: true, category: 'metadata' },
  emailDate: { type: 'date', label: 'Date', labelHindi: 'दिनांक', required: true, category: 'metadata' },

  // SENDER
  senderName: { type: 'text', label: 'Your Name', labelHindi: 'आपका नाम', placeholder: 'Aman Singh', required: true, category: 'sender' },
  senderEmail: { type: 'email', label: 'Your Email', labelHindi: 'आपका ईमेल', placeholder: 'aman@company.com', required: true, category: 'sender' },
  senderPhone: { type: 'tel', label: 'Phone Number', labelHindi: 'फ़ोन नंबर', placeholder: '+91 98765 43210', category: 'sender' },
  senderDesignation: { type: 'text', label: 'Your Designation', labelHindi: 'आपका पद', placeholder: 'Senior Software Engineer', category: 'sender' },
  senderCompany: { type: 'text', label: 'Your Company', labelHindi: 'आपकी कंपनी', placeholder: 'Risenex Global', category: 'sender' },
  senderDepartment: { type: 'text', label: 'Department', labelHindi: 'विभाग', placeholder: 'Engineering / HR / Sales', category: 'sender', templateTypes: ['corporate'] },
  senderAddress: { type: 'textarea', label: 'Your Address', labelHindi: 'आपका पता', placeholder: '123, Street Name, City, State - PIN', category: 'sender', templateTypes: ['complaint'] },

  // RECIPIENT
  recipientName: { type: 'text', label: 'Recipient Name', labelHindi: 'प्राप्तकर्ता का नाम', placeholder: 'Mr. Rajesh Kumar', required: true, category: 'recipient' },
  recipientEmail: { type: 'email', label: 'Recipient Email', labelHindi: 'प्राप्तकर्ता ईमेल', placeholder: 'recipient@company.com', category: 'recipient' },
  recipientDesignation: { type: 'text', label: 'Recipient Designation', labelHindi: 'प्राप्तकर्ता का पद', placeholder: 'Project Manager', category: 'recipient' },
  recipientCompany: { type: 'text', label: 'Recipient Company', labelHindi: 'प्राप्तकर्ता की कंपनी', placeholder: 'Tech Solutions Pvt. Ltd.', category: 'recipient' },
  recipientDepartment: { type: 'text', label: 'Department', labelHindi: 'विभाग', placeholder: 'Customer Service', category: 'recipient', templateTypes: ['complaint'] },
  recipientAddress: { type: 'textarea', label: 'Company Address', labelHindi: 'कंपनी का पता', placeholder: 'Corporate Office Address...', category: 'recipient', templateTypes: ['complaint'] },
  recipients: { type: 'text', label: 'Recipients', labelHindi: 'प्राप्तकर्ता', placeholder: 'All Employees / Department Heads', required: true, category: 'recipient', templateTypes: ['corporate'] },

  // CONTENT
  salutation: { type: 'select', label: 'Salutation', labelHindi: 'अभिवादन', required: true, category: 'content',
    options: [{ value: 'Dear', label: 'Dear' }, { value: 'Respected', label: 'Respected' }, { value: 'Hello', label: 'Hello' }, { value: 'Hi', label: 'Hi' }]
  },
  emailBody: { type: 'ai-textarea', label: 'Email Body', labelHindi: 'ईमेल सामग्री', placeholder: 'Describe the purpose and main content...', required: true, category: 'content',
    aiPrompt: 'Write a professional email body based on the context provided. Maintain formal tone, clear structure, and professional language.'
  },
  closing: { type: 'select', label: 'Closing', labelHindi: 'समापन', required: true, category: 'content',
    options: [{ value: 'Best regards', label: 'Best regards' }, { value: 'Kind regards', label: 'Kind regards' }, { value: 'Sincerely', label: 'Sincerely' }, { value: 'Warm regards', label: 'Warm regards' }, { value: 'Respectfully', label: 'Respectfully' }, { value: 'Thanks and regards', label: 'Thanks and regards' }]
  },

  // CORPORATE
  companyName: { type: 'text', label: 'Company Name', labelHindi: 'कंपनी का नाम', placeholder: 'Risenex Global Pvt. Ltd.', required: true, category: 'corporate', templateTypes: ['corporate'] },
  companyLogo: { type: 'url', label: 'Company Logo URL', labelHindi: 'कंपनी लोगो URL', placeholder: 'https://company.com/logo.png', category: 'corporate', templateTypes: ['corporate'] },
  emailType: { type: 'select', label: 'Communication Type', labelHindi: 'संचार प्रकार', required: true, category: 'corporate', templateTypes: ['corporate'],
    options: [{ value: 'announcement', label: 'Announcement / घोषणा' }, { value: 'memo', label: 'Memo / ज्ञापन' }, { value: 'circular', label: 'Circular / परिपत्र' }, { value: 'notice', label: 'Notice / सूचना' }, { value: 'policy-update', label: 'Policy Update / नीति अपडेट' }, { value: 'newsletter', label: 'Newsletter / समाचार पत्र' }]
  },
  referenceNumber: { type: 'text', label: 'Reference Number', labelHindi: 'संदर्भ संख्या', placeholder: 'HR/2024/MEMO/045', category: 'corporate', templateTypes: ['corporate', 'complaint'] },
  effectiveDate: { type: 'date', label: 'Effective Date', labelHindi: 'प्रभावी तिथि', category: 'corporate', templateTypes: ['corporate'] },
  priority: { type: 'select', label: 'Priority', labelHindi: 'प्राथमिकता', category: 'corporate', templateTypes: ['corporate'],
    options: [{ value: 'normal', label: 'Normal / सामान्य' }, { value: 'high', label: 'High / उच्च' }, { value: 'urgent', label: 'Urgent / अत्यावश्यक' }, { value: 'confidential', label: 'Confidential / गोपनीय' }]
  },
  actionRequired: { type: 'textarea', label: 'Action Required', labelHindi: 'आवश्यक कार्रवाई', placeholder: 'Please acknowledge receipt...', category: 'corporate', templateTypes: ['corporate'] },
  contactPerson: { type: 'text', label: 'Contact Person', labelHindi: 'संपर्क व्यक्ति', placeholder: 'HR Department - hr@company.com', category: 'corporate', templateTypes: ['corporate'] },
  disclaimer: { type: 'textarea', label: 'Disclaimer', labelHindi: 'अस्वीकरण', placeholder: 'This email and any attachments are confidential...', category: 'corporate', templateTypes: ['corporate'] },

  // COMPLAINT
  complaintType: { type: 'select', label: 'Complaint Type', labelHindi: 'शिकायत प्रकार', required: true, category: 'complaint', templateTypes: ['complaint'],
    options: [{ value: 'product', label: 'Product Issue / उत्पाद समस्या' }, { value: 'service', label: 'Service Issue / सेवा समस्या' }, { value: 'billing', label: 'Billing Issue / बिलिंग समस्या' }, { value: 'delivery', label: 'Delivery Issue / डिलीवरी समस्या' }, { value: 'staff', label: 'Staff Behavior / कर्मचारी व्यवहार' }, { value: 'quality', label: 'Quality Issue / गुणवत्ता समस्या' }, { value: 'other', label: 'Other / अन्य' }]
  },
  incidentDate: { type: 'date', label: 'Incident Date', labelHindi: 'घटना तिथि', required: true, category: 'complaint', templateTypes: ['complaint'] },
  complaintDetails: { type: 'ai-textarea', label: 'Complaint Details', labelHindi: 'शिकायत विवरण', placeholder: 'Describe the issue in detail...', required: true, category: 'complaint', templateTypes: ['complaint'],
    aiPrompt: 'Write a formal complaint description. Be specific about the issue, include relevant dates and reference numbers, explain the impact, and maintain a professional yet firm tone.'
  },
  previousAttempts: { type: 'textarea', label: 'Previous Resolution Attempts', labelHindi: 'पूर्व समाधान प्रयास', placeholder: 'I contacted customer support on [date]...', category: 'complaint', templateTypes: ['complaint'] },
  desiredResolution: { type: 'textarea', label: 'Desired Resolution', labelHindi: 'वांछित समाधान', placeholder: 'I request a full refund / replacement...', required: true, category: 'complaint', templateTypes: ['complaint'] },
  deadline: { type: 'text', label: 'Response Deadline', labelHindi: 'प्रतिक्रिया समय सीमा', placeholder: 'Within 7 working days', category: 'complaint', templateTypes: ['complaint'] },
  attachmentsList: { type: 'textarea', label: 'Attachments List', labelHindi: 'संलग्नक सूची', placeholder: '1. Invoice copy\n2. Photos of damaged product', category: 'complaint', templateTypes: ['complaint'] },

  // INQUIRY
  inquiryType: { type: 'select', label: 'Inquiry Type', labelHindi: 'पूछताछ प्रकार', required: true, category: 'inquiry', templateTypes: ['inquiry'],
    options: [{ value: 'product', label: 'Product Inquiry / उत्पाद पूछताछ' }, { value: 'service', label: 'Service Inquiry / सेवा पूछताछ' }, { value: 'admission', label: 'Admission Inquiry / प्रवेश पूछताछ' }, { value: 'partnership', label: 'Partnership Inquiry / साझेदारी पूछताछ' }, { value: 'pricing', label: 'Pricing Inquiry / मूल्य पूछताछ' }, { value: 'general', label: 'General Information / सामान्य जानकारी' }, { value: 'job', label: 'Job/Career Inquiry / नौकरी पूछताछ' }]
  },
  introContext: { type: 'textarea', label: 'Introduction/Context', labelHindi: 'परिचय/संदर्भ', placeholder: 'I am a final year engineering student...', required: true, category: 'inquiry', templateTypes: ['inquiry'] },
  specificQuestions: { type: 'ai-textarea', label: 'Specific Questions', labelHindi: 'विशिष्ट प्रश्न', placeholder: 'List the specific information you are seeking...', required: true, category: 'inquiry', templateTypes: ['inquiry'],
    aiPrompt: 'Generate well-structured, professional inquiry questions based on the context. Questions should be clear, specific, and organized logically.'
  },
  purposeOfInquiry: { type: 'textarea', label: 'Purpose of Inquiry', labelHindi: 'पूछताछ का उद्देश्य', placeholder: 'This information will help me...', category: 'inquiry', templateTypes: ['inquiry'] },
  preferredResponseMethod: { type: 'select', label: 'Preferred Response Method', labelHindi: 'पसंदीदा प्रतिक्रिया माध्यम', category: 'inquiry', templateTypes: ['inquiry'],
    options: [{ value: 'email', label: 'Email / ईमेल' }, { value: 'phone', label: 'Phone Call / फ़ोन कॉल' }, { value: 'meeting', label: 'Meeting / मीटिंग' }, { value: 'any', label: 'Any / कोई भी' }]
  },
  urgency: { type: 'select', label: 'Urgency', labelHindi: 'तात्कालिकता', category: 'inquiry', templateTypes: ['inquiry'],
    options: [{ value: 'normal', label: 'Normal / सामान्य' }, { value: 'soon', label: 'Within a week / एक सप्ताह में' }, { value: 'urgent', label: 'Urgent / अत्यावश्यक' }]
  },

  // FOLLOW-UP
  followUpType: { type: 'select', label: 'Follow-up Type', labelHindi: 'फॉलो-अप प्रकार', required: true, category: 'follow-up', templateTypes: ['follow-up'],
    options: [{ value: 'interview', label: 'Job Interview / नौकरी साक्षात्कार' }, { value: 'meeting', label: 'Business Meeting / व्यापार बैठक' }, { value: 'proposal', label: 'Proposal/Quotation / प्रस्ताव/कोटेशन' }, { value: 'application', label: 'Application Status / आवेदन स्थिति' }, { value: 'networking', label: 'Networking / नेटवर्किंग' }, { value: 'sales', label: 'Sales Follow-up / बिक्री फॉलो-अप' }, { value: 'project', label: 'Project Discussion / प्रोजेक्ट चर्चा' }]
  },
  originalDate: { type: 'date', label: 'Original Meeting/Interview Date', labelHindi: 'मूल बैठक/साक्षात्कार तिथि', required: true, category: 'follow-up', templateTypes: ['follow-up'] },
  meetingContext: { type: 'textarea', label: 'Meeting Context', labelHindi: 'बैठक संदर्भ', placeholder: 'Brief description of what was discussed...', required: true, category: 'follow-up', templateTypes: ['follow-up'] },
  keyPointsDiscussed: { type: 'textarea', label: 'Key Points Discussed', labelHindi: 'चर्चित मुख्य बिंदु', placeholder: '1. Project timeline\n2. Budget considerations', category: 'follow-up', templateTypes: ['follow-up'] },
  actionItems: { type: 'textarea', label: 'Pending Action Items', labelHindi: 'लंबित कार्य', placeholder: 'Items you are following up on...', category: 'follow-up', templateTypes: ['follow-up'] },
  nextSteps: { type: 'textarea', label: 'Proposed Next Steps', labelHindi: 'प्रस्तावित अगले कदम', placeholder: 'I am available for a follow-up call...', category: 'follow-up', templateTypes: ['follow-up'] },

  // THANK YOU
  thankYouType: { type: 'select', label: 'Thank You Occasion', labelHindi: 'धन्यवाद का अवसर', required: true, category: 'thank-you', templateTypes: ['thank-you'],
    options: [{ value: 'interview', label: 'Job Interview / नौकरी साक्षात्कार' }, { value: 'meeting', label: 'Business Meeting / व्यापार बैठक' }, { value: 'referral', label: 'Referral / रेफरल' }, { value: 'hospitality', label: 'Hospitality / आतिथ्य' }, { value: 'assistance', label: 'Help/Assistance / सहायता' }, { value: 'mentorship', label: 'Mentorship/Guidance / मार्गदर्शन' }, { value: 'business', label: 'Business Opportunity / व्यापार अवसर' }, { value: 'collaboration', label: 'Collaboration / सहयोग' }, { value: 'gift', label: 'Gift Received / उपहार' }, { value: 'event', label: 'Event Attendance / कार्यक्रम उपस्थिति' }]
  },
  occasionDate: { type: 'date', label: 'Occasion Date', labelHindi: 'अवसर की तिथि', category: 'thank-you', templateTypes: ['thank-you'] },
  specificThanks: { type: 'textarea', label: 'What You Are Thanking For', labelHindi: 'धन्यवाद का कारण', placeholder: 'Describe specifically what you are grateful for...', required: true, category: 'thank-you', templateTypes: ['thank-you'] },
  memorableDetails: { type: 'textarea', label: 'Memorable Details', labelHindi: 'यादगार विवरण', placeholder: 'Specific moments or aspects that stood out...', category: 'thank-you', templateTypes: ['thank-you'] },
  futureConnection: { type: 'textarea', label: 'Future Connection', labelHindi: 'भविष्य का संबंध', placeholder: 'Express your desire to stay connected...', category: 'thank-you', templateTypes: ['thank-you'] },

  // SIGNATURE
  includeSignature: { type: 'checkbox', label: 'Include Full Signature', labelHindi: 'पूर्ण हस्ताक्षर शामिल करें', category: 'signature' },
  accentColor: { type: 'color', label: 'Accent Color', labelHindi: 'एक्सेंट रंग', category: 'styling' }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: TEMPLATE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const EMAIL_FORMAL_TEMPLATE_CONFIGS: Record<EmailFormalTemplateType, {
  name: string;
  nameHindi: string;
  description: string;
  icon: string;
  sections: string[];
  recommendedFor: string[];
  defaultClosings: ClosingType[];
}> = {
  professional: {
    name: 'Professional Email',
    nameHindi: 'व्यावसायिक ईमेल',
    description: 'General professional and office communication',
    icon: '✉️',
    sections: ['header', 'meta', 'salutation', 'body', 'closing', 'signature'],
    recommendedFor: ['Office communication', 'Client emails', 'Colleague correspondence'],
    defaultClosings: ['Best regards', 'Kind regards', 'Sincerely', 'Warm regards']
  },
  corporate: {
    name: 'Corporate Communication',
    nameHindi: 'कॉर्पोरेट संचार',
    description: 'Official announcements, memos, and circulars',
    icon: '🏢',
    sections: ['header', 'company-info', 'meta', 'body', 'action-required', 'signature', 'disclaimer'],
    recommendedFor: ['Company announcements', 'Policy updates', 'Official memos', 'HR communications'],
    defaultClosings: ['Best regards', 'Sincerely', 'Respectfully']
  },
  complaint: {
    name: 'Formal Complaint',
    nameHindi: 'औपचारिक शिकायत',
    description: 'Professional complaints to companies and services',
    icon: '⚠️',
    sections: ['header', 'sender-info', 'recipient-info', 'complaint-details', 'resolution', 'attachments', 'signature'],
    recommendedFor: ['Customer complaints', 'Service issues', 'Product problems', 'Billing disputes'],
    defaultClosings: ['Sincerely', 'Respectfully', 'Thanks and regards']
  },
  inquiry: {
    name: 'Formal Inquiry',
    nameHindi: 'औपचारिक पूछताछ',
    description: 'Information requests and formal inquiries',
    icon: '❓',
    sections: ['header', 'meta', 'introduction', 'questions', 'closing', 'signature'],
    recommendedFor: ['Admission inquiries', 'Product inquiries', 'Partnership requests', 'Job inquiries'],
    defaultClosings: ['Best regards', 'Kind regards', 'Thank you for your time and consideration']
  },
  'follow-up': {
    name: 'Follow-up Email',
    nameHindi: 'फॉलो-अप ईमेल',
    description: 'Follow-up after meetings, interviews, or discussions',
    icon: '🔄',
    sections: ['header', 'meta', 'context', 'key-points', 'next-steps', 'closing', 'signature'],
    recommendedFor: ['Post-interview follow-up', 'Meeting follow-up', 'Proposal follow-up', 'Sales follow-up'],
    defaultClosings: ['Best regards', 'Looking forward to hearing from you', 'Thank you for your time and consideration']
  },
  'thank-you': {
    name: 'Thank You Email',
    nameHindi: 'धन्यवाद ईमेल',
    description: 'Formal thank you and appreciation emails',
    icon: '🙏',
    sections: ['header', 'meta', 'gratitude', 'details', 'future', 'closing', 'signature'],
    recommendedFor: ['Interview thank you', 'Meeting appreciation', 'Referral thanks', 'General gratitude'],
    defaultClosings: ['With sincere gratitude', 'With heartfelt thanks', 'Gratefully yours', 'With appreciation']
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: SAMPLE DATA (Comprehensive)
// ═══════════════════════════════════════════════════════════════════════════════

export const EMAIL_FORMAL_SAMPLE_DATA: Record<EmailFormalTemplateType, Partial<EmailFormalData>> = {
  // ─────────────────────────────────────────────────────────────
  // PROFESSIONAL EMAIL - General Office Communication
  // ─────────────────────────────────────────────────────────────
  professional: {
    templateType: 'professional',
    emailSubject: 'Project Status Update - Soriva Platform Q4 2024',
    emailDate: '2025-12-16',
    senderName: 'Aman Singh',
    senderEmail: 'aman@risenex.com',
    senderPhone: '+91 98765 43210',
    senderDesignation: 'Founder & CEO',
    senderCompany: 'Risenex Global Pvt. Ltd.',
    recipientName: 'Mr. Rajesh Kumar',
    recipientEmail: 'rajesh.kumar@techsolutions.com',
    recipientDesignation: 'Project Manager',
    recipientCompany: 'Tech Solutions Pvt. Ltd.',
    salutation: 'Dear',
    emailBody: `I hope this email finds you well. I am writing to provide you with a comprehensive update on the current status of the Soriva AI Platform project.

Project Milestones Achieved:
1. Backend Architecture: Complete infrastructure using Node.js, TypeScript, PostgreSQL with Prisma ORM.
2. Authentication System: Multi-provider auth with Google OAuth, email/password, and session management.
3. AI Provider Integration: Claude, GPT-4, and Gemini APIs with intelligent routing based on subscription tiers.
4. Billing Module: Razorpay (INR) and Stripe (USD) integration complete and tested.

Next Steps:
We are focusing on frontend development and expect to begin user acceptance testing by January 15, 2025.

I would appreciate a 30-minute call this week to discuss the timeline. Please let me know your availability.`,
    closing: 'Best regards',
    includeSignature: true,
    accentColor: '#1e3a5f'
  },

  // ─────────────────────────────────────────────────────────────
  // CORPORATE EMAIL - Official Announcements & Memos
  // ─────────────────────────────────────────────────────────────
  corporate: {
    templateType: 'corporate',
    emailSubject: 'Important: Annual Performance Review Schedule & New Appraisal Policy 2025',
    emailDate: '2025-12-16',
    senderName: 'Priya Sharma',
    senderEmail: 'priya.sharma@risenex.com',
    senderPhone: '+91 98765 11111',
    senderDesignation: 'Director - Human Resources',
    senderCompany: 'Risenex Global Pvt. Ltd.',
    senderDepartment: 'Human Resources',
    recipientName: 'All Employees',
    recipients: 'All Employees, Department Heads, Team Leads',
    salutation: 'Dear',
    emailBody: `We are pleased to announce the Annual Performance Review (APR) schedule for FY 2024-25.

Performance Review Timeline:
• Phase 1 - Self Assessment: January 1-10, 2025
• Phase 2 - Peer Review (360°): January 11-20, 2025
• Phase 3 - Manager Evaluation: January 21-31, 2025
• Phase 4 - Calibration & Review Meetings: February 1-15, 2025
• Phase 5 - Final Communication: February 16-28, 2025

New Initiatives:
• Quarterly check-ins in addition to annual reviews
• Skill-based competency mapping for career growth
• Enhanced L&D budget based on performance

The new appraisal portal will be accessible from December 20, 2025.`,
    closing: 'Best regards',
    corporate: {
      companyName: 'Risenex Global Pvt. Ltd.',
      companyLogo: 'https://risenex.com/logo.png',
      emailType: 'announcement',
      referenceNumber: 'HR/2025/APR/001',
      effectiveDate: '2025-01-01',
      priority: 'high',
      actionRequired: 'Complete self-assessment by January 10, 2025. Access HR Portal at hr.risenex.com. Contact HR helpdesk for queries.',
      contactPerson: 'HR Helpdesk - hr.support@risenex.com | Ext: 1001',
      disclaimer: 'This email is confidential and intended solely for the addressee. If received in error, notify sender and delete immediately.'
    },
    includeSignature: true,
    accentColor: '#2c5282'
  },

  // ─────────────────────────────────────────────────────────────
  // COMPLAINT EMAIL - Formal Complaints to Companies
  // ─────────────────────────────────────────────────────────────
  complaint: {
    templateType: 'complaint',
    emailSubject: 'Formal Complaint: Defective Laptop - Order #ORD-2024-78542 - Immediate Resolution Required',
    emailDate: '2025-12-16',
    senderName: 'Vikram Mehta',
    senderEmail: 'vikram.mehta@email.com',
    senderPhone: '+91 98123 45678',
    senderDesignation: 'Software Architect',
    senderCompany: 'TechCorp India',
    senderAddress: '42, Sunrise Apartments\nSector 15, Gurugram\nHaryana - 122001',
    recipientName: 'Customer Service Manager',
    recipientEmail: 'grievance@electromart.com',
    recipientDesignation: 'Head - Customer Grievance Cell',
    recipientCompany: 'ElectroMart India Pvt. Ltd.',
    recipientDepartment: 'Customer Grievance Redressal Cell',
    recipientAddress: 'Corporate Office, 101 Business Tower\nMG Road, Bengaluru - 560001',
    salutation: 'Dear',
    emailBody: `I am writing to register a formal complaint regarding a defective laptop received from your company.

Product: TechPro X15 Laptop | Order: ORD-2024-78542 | Amount: ₹85,999/-

Issues Identified:
1. Display: 15-20 dead pixels in upper right quadrant
2. Keyboard: Non-functional spacebar requiring excessive force
3. Battery: Only 2-hour life vs advertised 10 hours

These defects render the laptop completely unusable for professional work.`,
    closing: 'Sincerely',
    complaint: {
      complaintType: 'product',
      referenceNumber: 'ORD-2024-78542',
      incidentDate: '2025-12-10',
      complaintDescription: 'Defective laptop with dead pixels, non-functional spacebar, and poor battery life.',
      previousAttempts: `Resolution attempts made:
• Dec 11: Phone call - Ticket #CS-892341 generated, no callback received
• Dec 13: Email to support - auto-reply only
• Dec 14: Chat with agent "Rahul" - asked to wait 48 hours, no follow-up
• Dec 15: Store visit - directed back to online support`,
      desiredResolution: `Option A (Preferred): Immediate replacement within 5 working days with free pickup
Option B: Full refund of ₹85,999/- within 7 working days
Additionally: Written acknowledgment within 24 hours + ₹5,000 store credit compensation`,
      deadline: 'Within 7 working days (by December 23, 2025)',
      attachments: [
        { name: 'Invoice_ORD-2024-78542.pdf', description: 'Purchase invoice', type: 'pdf' },
        { name: 'DeadPixels_Photos.zip', description: 'Screen defect photos', type: 'image' },
        { name: 'Keyboard_Issue.mp4', description: 'Spacebar malfunction video', type: 'video' },
        { name: 'Support_Correspondence.pdf', description: 'Previous communications', type: 'pdf' }
      ]
    },
    attachmentsList: '1. Invoice (PDF)\n2. Dead pixel photos (3 images)\n3. Keyboard issue video\n4. Support ticket confirmation\n5. Previous correspondence',
    includeSignature: true,
    accentColor: '#dc2626'
  },

  // ─────────────────────────────────────────────────────────────
  // INQUIRY EMAIL - Formal Information Requests
  // ─────────────────────────────────────────────────────────────
  inquiry: {
    templateType: 'inquiry',
    emailSubject: 'Inquiry: Executive MBA Program - Admission 2025-27 Batch',
    emailDate: '2025-12-16',
    senderName: 'Ananya Reddy',
    senderEmail: 'ananya.reddy@gmail.com',
    senderPhone: '+91 99887 76655',
    senderDesignation: 'Senior Software Engineer',
    senderCompany: 'Infosys Ltd.',
    recipientName: 'Admissions Office',
    recipientEmail: 'admissions@iimb.ac.in',
    recipientDesignation: 'Director of Admissions',
    recipientCompany: 'Indian Institute of Management, Bangalore',
    salutation: 'Respected',
    emailBody: `I am writing to inquire about the Executive MBA (EPGP) program for the 2025-27 batch.

Background: Senior Software Engineer at Infosys with 5 years experience in cloud architecture and team leadership. B.Tech from NIT Warangal (CGPA: 8.7).

I would be grateful for information regarding the aspects outlined below.`,
    closing: 'Thank you for your time and consideration',
    inquiry: {
      inquiryType: 'admission',
      introContext: `Profile:
• Role: Senior Software Engineer, Infosys Ltd., Bangalore
• Experience: 5 years in IT (Cloud Architecture, Microservices, Team Leadership)
• Education: B.Tech CS, NIT Warangal (2019), CGPA: 8.7
• Certifications: AWS Solutions Architect, GCP Professional
• Goal: Transition to technology management and C-suite roles`,
      specificQuestions: `1. Admission Timeline:
   - Application deadline for 2025-27 batch?
   - Key dates for exam, interviews, final admission?

2. Eligibility:
   - Minimum work experience required?
   - GMAT/CAT/GRE score requirements?
   - Specific requirements for IT candidates?

3. Fee & Financial Aid:
   - Total program fee?
   - Scholarships for meritorious candidates?
   - Education loan tie-ups?

4. Program Structure:
   - Class schedule format?
   - International exchange options?
   - Technology Management specialization?

5. Career Outcomes:
   - Average placement package?
   - IT to management transition success rate?`,
      purposeOfInquiry: 'Planning application timeline and preparing documentation for 2025-27 batch.',
      preferredResponseMethod: 'email',
      urgency: 'soon'
    },
    includeSignature: true,
    accentColor: '#7c3aed'
  },

  // ─────────────────────────────────────────────────────────────
  // FOLLOW-UP EMAIL - Post Meeting/Interview Follow-ups
  // ─────────────────────────────────────────────────────────────
  'follow-up': {
    templateType: 'follow-up',
    emailSubject: 'Follow-up: Senior Full Stack Developer Interview - December 12, 2025',
    emailDate: '2025-12-16',
    senderName: 'Rohit Sharma',
    senderEmail: 'rohit.sharma@gmail.com',
    senderPhone: '+91 98765 12345',
    senderDesignation: 'Full Stack Developer',
    senderCompany: 'WebTech Solutions',
    recipientName: 'Ms. Kavita Nair',
    recipientEmail: 'kavita.nair@innovatetech.com',
    recipientDesignation: 'Engineering Manager',
    recipientCompany: 'InnovateTech Solutions Pvt. Ltd.',
    salutation: 'Dear',
    emailBody: `Thank you for interviewing me for the Senior Full Stack Developer position on December 12, 2025.

Our discussion about microservices architecture and scaling for 1M+ concurrent users resonated with my experience. I was impressed by InnovateTech's innovation commitment and collaborative culture.

I remain enthusiastic about joining your team and contributing from day one. Please let me know if you need any additional information.`,
    closing: 'Thank you for your time and consideration',
    followUp: {
      followUpType: 'interview',
      originalDate: '2025-12-12',
      meetingContext: `Position: Senior Full Stack Developer
Interview: Technical + HR Round (3 hours) via Google Meet
Interviewers: Kavita Nair (Eng Manager), Amit Verma (Tech Lead), Sneha Reddy (HR)`,
      keyPointsDiscussed: `Technical:
• Microservices patterns and React optimization
• Node.js performance and MongoDB sharding
• Real-time features with WebSocket/Redis

Project:
• E-commerce rebuild: 1M+ users, 10K orders/min
• Stack: React, Node.js, MongoDB, Redis, K8s

Culture:
• 25 developers across 4 squads
• 2-week Agile sprints
• Mentorship focus`,
      actionItems: `Awaiting:
• Technical interview feedback
• Next steps information
• Final round details (if applicable)
• Hiring timeline`,
      nextSteps: `Available for additional interviews/assessments.

Can provide:
• GitHub portfolio samples
• References from managers
• Project case studies

Availability: Weekdays 6-9 PM, Weekends flexible`
    },
    includeSignature: true,
    accentColor: '#059669'
  },

  // ─────────────────────────────────────────────────────────────
  // THANK YOU EMAIL - Formal Gratitude & Appreciation
  // ─────────────────────────────────────────────────────────────
  'thank-you': {
    templateType: 'thank-you',
    emailSubject: 'Heartfelt Thanks - Head of Digital Marketing Interview',
    emailDate: '2025-12-16',
    senderName: 'Meera Krishnan',
    senderEmail: 'meera.krishnan@gmail.com',
    senderPhone: '+91 87654 32109',
    senderDesignation: 'Marketing Manager',
    senderCompany: 'DigitalEdge Marketing',
    recipientName: 'Mr. Arjun Patel',
    recipientEmail: 'arjun.patel@brandfirst.com',
    recipientDesignation: 'Vice President - Marketing',
    recipientCompany: 'BrandFirst Media Pvt. Ltd.',
    salutation: 'Dear',
    emailBody: `I wanted to express my sincere gratitude for the interview opportunity for the Head of Digital Marketing position yesterday.

Our discussion about BrandFirst's Southeast Asian expansion and AI-driven campaign analytics was truly inspiring. Your vision of data-driven marketing with human creativity at its core aligns perfectly with my professional philosophy.

I believe my 8 years of digital marketing experience would make me a valuable addition to your team. Thank you again for your time and insights.`,
    closing: 'With sincere gratitude',
    thankYou: {
      thankYouType: 'interview',
      occasionDate: '2025-12-15',
      specificThanks: `Grateful for:
• 90+ minutes of your valuable time
• Transparent discussion about challenges and opportunities
• Sharing BrandFirst's 5-year growth vision
• Career guidance on leadership transition
• Warm and welcoming interview experience`,
      memorableDetails: `Memorable moments:
• Your "storytelling with data" marketing analogy
• D2C brand case study achieving 300% growth
• "No-meeting Fridays" work-life balance policy
• Creative spaces and in-house content studio tour
• Senior leader mentorship program`,
      futureConnection: `Would love to stay connected:
• Connect on LinkedIn
• Attend BrandFirst industry events
• Share emerging digital marketing insights
• Be considered for future opportunities

Honored to be part of BrandFirst's journey in any capacity.`
    },
    includeSignature: true,
    accentColor: '#0891b2'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function getFieldsForTemplateType(templateType: EmailFormalTemplateType): string[] {
  const commonFields = [
    'templateType', 'emailSubject', 'emailDate',
    'senderName', 'senderEmail', 'senderPhone', 'senderDesignation', 'senderCompany',
    'recipientName', 'recipientDesignation', 'recipientCompany',
    'salutation', 'emailBody', 'closing', 'includeSignature', 'accentColor'
  ];

  const templateSpecificFields: Record<EmailFormalTemplateType, string[]> = {
    professional: [],
    corporate: ['senderDepartment', 'recipients', 'companyName', 'companyLogo', 'emailType', 'referenceNumber', 'effectiveDate', 'priority', 'actionRequired', 'contactPerson', 'disclaimer'],
    complaint: ['senderAddress', 'recipientDepartment', 'recipientAddress', 'complaintType', 'referenceNumber', 'incidentDate', 'complaintDetails', 'previousAttempts', 'desiredResolution', 'deadline', 'attachmentsList'],
    inquiry: ['inquiryType', 'introContext', 'specificQuestions', 'purposeOfInquiry', 'preferredResponseMethod', 'urgency'],
    'follow-up': ['followUpType', 'originalDate', 'meetingContext', 'keyPointsDiscussed', 'actionItems', 'nextSteps'],
    'thank-you': ['thankYouType', 'occasionDate', 'specificThanks', 'memorableDetails', 'futureConnection']
  };

  return [...commonFields, ...templateSpecificFields[templateType]];
}

export function getSampleData(templateType: EmailFormalTemplateType): Partial<EmailFormalData> {
  return EMAIL_FORMAL_SAMPLE_DATA[templateType];
}

export function getTemplateInfo(templateType: EmailFormalTemplateType) {
  return EMAIL_FORMAL_TEMPLATE_CONFIGS[templateType];
}

export function getDefaultClosings(templateType: EmailFormalTemplateType): ClosingType[] {
  return EMAIL_FORMAL_TEMPLATE_CONFIGS[templateType].defaultClosings;
}

export function validateEmailFormalData(data: Partial<EmailFormalData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.emailSubject) errors.push('Email subject is required');
  if (!data.senderName) errors.push('Sender name is required');
  if (!data.senderEmail) errors.push('Sender email is required');
  if (!data.recipientName) errors.push('Recipient name is required');
  if (!data.emailBody) errors.push('Email body is required');
  if (data.senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.senderEmail)) {
    errors.push('Invalid sender email format');
  }
  return { valid: errors.length === 0, errors };
}

export function formatEmailDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function generatePreviewText(data: Partial<EmailFormalData>, maxLength: number = 150): string {
  if (!data.emailBody) return '';
  const plainText = data.emailBody.replace(/\n/g, ' ').trim();
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  fields: EMAIL_FORMAL_FIELD_DEFINITIONS,
  templates: EMAIL_FORMAL_TEMPLATE_CONFIGS,
  sampleData: EMAIL_FORMAL_SAMPLE_DATA,
  getFieldsForTemplateType,
  getSampleData,
  getTemplateInfo,
  getDefaultClosings,
  validateEmailFormalData,
  formatEmailDate,
  generatePreviewText
};