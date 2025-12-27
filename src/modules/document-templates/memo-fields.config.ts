/**
 * SORIVA - Memo/Notice Fields Configuration
 * Category: memo
 * Types: office-memo, circular, notice, announcement, internal-communication, policy-update
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MemoTemplateType =
  | 'office-memo'
  | 'circular'
  | 'notice'
  | 'announcement'
  | 'internal-communication'
  | 'policy-update';

export type MemoPriority = 'low' | 'normal' | 'high' | 'urgent';

export type MemoDistribution =
  | 'all-employees'
  | 'department'
  | 'management'
  | 'specific-individuals'
  | 'branch'
  | 'public';

export type MemoCategory =
  | 'administrative'
  | 'hr'
  | 'operations'
  | 'finance'
  | 'it'
  | 'safety'
  | 'general'
  | 'policy'
  | 'event';

// ============================================================================
// INTERFACES
// ============================================================================

export interface MemoSender {
  name: string;
  designation?: string;
  department?: string;
  email?: string;
  phone?: string;
  signature?: string;
}

export interface MemoRecipient {
  type: MemoDistribution;
  names?: string[];
  department?: string;
  branch?: string;
  cc?: string[];
}

export interface MemoAttachment {
  name: string;
  type?: string;
  description?: string;
}

export interface PolicyDetails {
  policyNumber?: string;
  effectiveDate?: string;
  previousPolicy?: string;
  reviewDate?: string;
  complianceDeadline?: string;
}

export interface EventDetails {
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  agenda?: string[];
  rsvpRequired?: boolean;
  rsvpDeadline?: string;
  contactPerson?: string;
}

export interface ActionItem {
  action: string;
  responsible?: string;
  deadline?: string;
  priority?: MemoPriority;
}

export interface MemoData {
  // Template Type
  templateType: MemoTemplateType;

  // Basic Info
  memoNumber?: string;
  referenceNumber?: string;
  date: string;
  subject: string;
  category?: MemoCategory;
  priority?: MemoPriority;

  // Organization
  organizationName?: string;
  organizationLogo?: string;
  department?: string;
  branch?: string;

  // Sender & Recipients
  from: MemoSender;
  to: MemoRecipient;

  // Content
  greeting?: string;
  openingParagraph?: string;
  body: string;
  keyPoints?: string[];
  actionItems?: ActionItem[];
  closingParagraph?: string;
  callToAction?: string;

  // Policy Specific
  policy?: PolicyDetails;

  // Event Specific
  event?: EventDetails;

  // Notice Specific
  noticeType?: string;
  effectiveDate?: string;
  expiryDate?: string;

  // Attachments
  attachments?: MemoAttachment[];

  // Footer
  disclaimer?: string;
  confidentialityNotice?: string;
  contactInfo?: string;

  // Styling
  accentColor?: string;
  showLogo?: boolean;
  showWatermark?: boolean;
  watermark?: string;
  showBorder?: boolean;
}

// ============================================================================
// FIELD DEFINITIONS
// ============================================================================

export const memoFieldDefinitions = {
  // --------------------------------------------------------------------------
  // Basic Information
  // --------------------------------------------------------------------------
  templateType: {
    id: 'templateType',
    label: 'Memo Type',
    labelHindi: 'मेमो प्रकार',
    type: 'select',
    required: true,
    options: [
      { value: 'office-memo', label: 'Office Memo' },
      { value: 'circular', label: 'Circular' },
      { value: 'notice', label: 'Notice' },
      { value: 'announcement', label: 'Announcement' },
      { value: 'internal-communication', label: 'Internal Communication' },
      { value: 'policy-update', label: 'Policy Update' },
    ],
    placeholder: 'Select memo type',
  },

  memoNumber: {
    id: 'memoNumber',
    label: 'Memo Number',
    labelHindi: 'मेमो संख्या',
    type: 'text',
    required: false,
    placeholder: 'e.g., MEMO/HR/2024/001',
    helpText: 'Unique identifier for tracking',
  },

  referenceNumber: {
    id: 'referenceNumber',
    label: 'Reference Number',
    labelHindi: 'संदर्भ संख्या',
    type: 'text',
    required: false,
    placeholder: 'e.g., REF/2024/123',
  },

  date: {
    id: 'date',
    label: 'Date',
    labelHindi: 'तारीख',
    type: 'date',
    required: true,
  },

  subject: {
    id: 'subject',
    label: 'Subject',
    labelHindi: 'विषय',
    type: 'text',
    required: true,
    placeholder: 'Enter the subject of memo',
    maxLength: 200,
  },

  category: {
    id: 'category',
    label: 'Category',
    labelHindi: 'श्रेणी',
    type: 'select',
    required: false,
    options: [
      { value: 'administrative', label: 'Administrative' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'operations', label: 'Operations' },
      { value: 'finance', label: 'Finance' },
      { value: 'it', label: 'IT/Technology' },
      { value: 'safety', label: 'Safety & Security' },
      { value: 'general', label: 'General' },
      { value: 'policy', label: 'Policy' },
      { value: 'event', label: 'Event' },
    ],
  },

  priority: {
    id: 'priority',
    label: 'Priority',
    labelHindi: 'प्राथमिकता',
    type: 'select',
    required: false,
    options: [
      { value: 'low', label: 'Low' },
      { value: 'normal', label: 'Normal' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
    default: 'normal',
  },

  // --------------------------------------------------------------------------
  // Organization
  // --------------------------------------------------------------------------
  organizationName: {
    id: 'organizationName',
    label: 'Organization Name',
    labelHindi: 'संगठन का नाम',
    type: 'text',
    required: false,
    placeholder: 'Enter organization name',
  },

  organizationLogo: {
    id: 'organizationLogo',
    label: 'Organization Logo',
    labelHindi: 'संगठन लोगो',
    type: 'image',
    required: false,
    accept: 'image/*',
  },

  department: {
    id: 'department',
    label: 'Department',
    labelHindi: 'विभाग',
    type: 'text',
    required: false,
    placeholder: 'e.g., Human Resources',
  },

  branch: {
    id: 'branch',
    label: 'Branch/Location',
    labelHindi: 'शाखा/स्थान',
    type: 'text',
    required: false,
    placeholder: 'e.g., Mumbai Head Office',
  },

  // --------------------------------------------------------------------------
  // Sender (From)
  // --------------------------------------------------------------------------
  'from.name': {
    id: 'from.name',
    label: 'Sender Name',
    labelHindi: 'भेजने वाले का नाम',
    type: 'text',
    required: true,
    placeholder: 'Enter sender name',
  },

  'from.designation': {
    id: 'from.designation',
    label: 'Designation',
    labelHindi: 'पदनाम',
    type: 'text',
    required: false,
    placeholder: 'e.g., HR Manager',
  },

  'from.department': {
    id: 'from.department',
    label: 'Department',
    labelHindi: 'विभाग',
    type: 'text',
    required: false,
    placeholder: 'e.g., Human Resources',
  },

  'from.email': {
    id: 'from.email',
    label: 'Email',
    labelHindi: 'ईमेल',
    type: 'email',
    required: false,
    placeholder: 'sender@company.com',
  },

  'from.phone': {
    id: 'from.phone',
    label: 'Phone',
    labelHindi: 'फोन',
    type: 'tel',
    required: false,
    placeholder: '+91 98765 43210',
  },

  'from.signature': {
    id: 'from.signature',
    label: 'Signature',
    labelHindi: 'हस्ताक्षर',
    type: 'image',
    required: false,
    accept: 'image/*',
  },

  // --------------------------------------------------------------------------
  // Recipient (To)
  // --------------------------------------------------------------------------
  'to.type': {
    id: 'to.type',
    label: 'Distribution',
    labelHindi: 'वितरण',
    type: 'select',
    required: true,
    options: [
      { value: 'all-employees', label: 'All Employees' },
      { value: 'department', label: 'Specific Department' },
      { value: 'management', label: 'Management' },
      { value: 'specific-individuals', label: 'Specific Individuals' },
      { value: 'branch', label: 'Branch/Location' },
      { value: 'public', label: 'Public Notice' },
    ],
  },

  'to.names': {
    id: 'to.names',
    label: 'Recipient Names',
    labelHindi: 'प्राप्तकर्ता के नाम',
    type: 'textarea',
    required: false,
    placeholder: 'Enter names (one per line)',
    helpText: 'For specific individuals only',
  },

  'to.department': {
    id: 'to.department',
    label: 'Target Department',
    labelHindi: 'लक्षित विभाग',
    type: 'text',
    required: false,
    placeholder: 'e.g., Engineering Team',
  },

  'to.branch': {
    id: 'to.branch',
    label: 'Target Branch',
    labelHindi: 'लक्षित शाखा',
    type: 'text',
    required: false,
    placeholder: 'e.g., Delhi Branch',
  },

  'to.cc': {
    id: 'to.cc',
    label: 'CC (Carbon Copy)',
    labelHindi: 'प्रतिलिपि',
    type: 'textarea',
    required: false,
    placeholder: 'Enter names for CC (one per line)',
  },

  // --------------------------------------------------------------------------
  // Content
  // --------------------------------------------------------------------------
  greeting: {
    id: 'greeting',
    label: 'Greeting',
    labelHindi: 'अभिवादन',
    type: 'text',
    required: false,
    placeholder: 'e.g., Dear Team,',
  },

  openingParagraph: {
    id: 'openingParagraph',
    label: 'Opening Paragraph',
    labelHindi: 'प्रारंभिक पैराग्राफ',
    type: 'textarea',
    required: false,
    placeholder: 'Introduction or context',
    rows: 3,
  },

  body: {
    id: 'body',
    label: 'Main Content',
    labelHindi: 'मुख्य सामग्री',
    type: 'richtext',
    required: true,
    placeholder: 'Enter the main content of the memo',
    rows: 8,
  },

  keyPoints: {
    id: 'keyPoints',
    label: 'Key Points',
    labelHindi: 'मुख्य बिंदु',
    type: 'array',
    required: false,
    placeholder: 'Add key points',
    itemType: 'text',
  },

  actionItems: {
    id: 'actionItems',
    label: 'Action Items',
    labelHindi: 'कार्य वस्तुएं',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['action', 'responsible', 'deadline', 'priority'],
  },

  closingParagraph: {
    id: 'closingParagraph',
    label: 'Closing Paragraph',
    labelHindi: 'समापन पैराग्राफ',
    type: 'textarea',
    required: false,
    placeholder: 'Closing remarks or summary',
    rows: 2,
  },

  callToAction: {
    id: 'callToAction',
    label: 'Call to Action',
    labelHindi: 'कार्रवाई का आह्वान',
    type: 'text',
    required: false,
    placeholder: 'e.g., Please acknowledge receipt by Friday',
  },

  // --------------------------------------------------------------------------
  // Policy Specific
  // --------------------------------------------------------------------------
  'policy.policyNumber': {
    id: 'policy.policyNumber',
    label: 'Policy Number',
    labelHindi: 'नीति संख्या',
    type: 'text',
    required: false,
    placeholder: 'e.g., POL-HR-2024-001',
  },

  'policy.effectiveDate': {
    id: 'policy.effectiveDate',
    label: 'Effective Date',
    labelHindi: 'प्रभावी तारीख',
    type: 'date',
    required: false,
  },

  'policy.previousPolicy': {
    id: 'policy.previousPolicy',
    label: 'Supersedes Policy',
    labelHindi: 'पूर्व नीति',
    type: 'text',
    required: false,
    placeholder: 'Previous policy reference (if any)',
  },

  'policy.reviewDate': {
    id: 'policy.reviewDate',
    label: 'Review Date',
    labelHindi: 'समीक्षा तारीख',
    type: 'date',
    required: false,
  },

  'policy.complianceDeadline': {
    id: 'policy.complianceDeadline',
    label: 'Compliance Deadline',
    labelHindi: 'अनुपालन की समय सीमा',
    type: 'date',
    required: false,
  },

  // --------------------------------------------------------------------------
  // Event Specific
  // --------------------------------------------------------------------------
  'event.eventName': {
    id: 'event.eventName',
    label: 'Event Name',
    labelHindi: 'कार्यक्रम का नाम',
    type: 'text',
    required: false,
    placeholder: 'e.g., Annual Day Celebration',
  },

  'event.eventDate': {
    id: 'event.eventDate',
    label: 'Event Date',
    labelHindi: 'कार्यक्रम की तारीख',
    type: 'date',
    required: false,
  },

  'event.eventTime': {
    id: 'event.eventTime',
    label: 'Event Time',
    labelHindi: 'कार्यक्रम का समय',
    type: 'time',
    required: false,
  },

  'event.venue': {
    id: 'event.venue',
    label: 'Venue',
    labelHindi: 'स्थान',
    type: 'text',
    required: false,
    placeholder: 'e.g., Conference Hall, 3rd Floor',
  },

  'event.agenda': {
    id: 'event.agenda',
    label: 'Agenda',
    labelHindi: 'एजेंडा',
    type: 'array',
    required: false,
    itemType: 'text',
    placeholder: 'Add agenda items',
  },

  'event.rsvpRequired': {
    id: 'event.rsvpRequired',
    label: 'RSVP Required',
    labelHindi: 'RSVP आवश्यक',
    type: 'checkbox',
    required: false,
  },

  'event.rsvpDeadline': {
    id: 'event.rsvpDeadline',
    label: 'RSVP Deadline',
    labelHindi: 'RSVP की समय सीमा',
    type: 'date',
    required: false,
  },

  'event.contactPerson': {
    id: 'event.contactPerson',
    label: 'Contact Person',
    labelHindi: 'संपर्क व्यक्ति',
    type: 'text',
    required: false,
    placeholder: 'Name and contact details',
  },

  // --------------------------------------------------------------------------
  // Notice Specific
  // --------------------------------------------------------------------------
  noticeType: {
    id: 'noticeType',
    label: 'Notice Type',
    labelHindi: 'सूचना प्रकार',
    type: 'select',
    required: false,
    options: [
      { value: 'general', label: 'General Notice' },
      { value: 'holiday', label: 'Holiday Notice' },
      { value: 'meeting', label: 'Meeting Notice' },
      { value: 'maintenance', label: 'Maintenance Notice' },
      { value: 'safety', label: 'Safety Notice' },
      { value: 'recruitment', label: 'Recruitment Notice' },
      { value: 'tender', label: 'Tender Notice' },
      { value: 'examination', label: 'Examination Notice' },
    ],
  },

  effectiveDate: {
    id: 'effectiveDate',
    label: 'Effective From',
    labelHindi: 'प्रभावी तारीख',
    type: 'date',
    required: false,
  },

  expiryDate: {
    id: 'expiryDate',
    label: 'Valid Until',
    labelHindi: 'वैध तिथि',
    type: 'date',
    required: false,
  },

  // --------------------------------------------------------------------------
  // Attachments
  // --------------------------------------------------------------------------
  attachments: {
    id: 'attachments',
    label: 'Attachments',
    labelHindi: 'संलग्नक',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['name', 'type', 'description'],
  },

  // --------------------------------------------------------------------------
  // Footer
  // --------------------------------------------------------------------------
  disclaimer: {
    id: 'disclaimer',
    label: 'Disclaimer',
    labelHindi: 'अस्वीकरण',
    type: 'textarea',
    required: false,
    placeholder: 'Any disclaimer text',
    rows: 2,
  },

  confidentialityNotice: {
    id: 'confidentialityNotice',
    label: 'Confidentiality Notice',
    labelHindi: 'गोपनीयता सूचना',
    type: 'textarea',
    required: false,
    placeholder: 'Confidentiality notice if applicable',
    rows: 2,
  },

  contactInfo: {
    id: 'contactInfo',
    label: 'Contact Information',
    labelHindi: 'संपर्क जानकारी',
    type: 'textarea',
    required: false,
    placeholder: 'Contact details for queries',
    rows: 2,
  },

  // --------------------------------------------------------------------------
  // Styling
  // --------------------------------------------------------------------------
  accentColor: {
    id: 'accentColor',
    label: 'Accent Color',
    labelHindi: 'एक्सेंट रंग',
    type: 'color',
    required: false,
    default: '#2563eb',
  },

  showLogo: {
    id: 'showLogo',
    label: 'Show Logo',
    labelHindi: 'लोगो दिखाएं',
    type: 'checkbox',
    required: false,
    default: true,
  },

  showWatermark: {
    id: 'showWatermark',
    label: 'Show Watermark',
    labelHindi: 'वॉटरमार्क दिखाएं',
    type: 'checkbox',
    required: false,
    default: false,
  },

  watermark: {
    id: 'watermark',
    label: 'Watermark Text',
    labelHindi: 'वॉटरमार्क टेक्स्ट',
    type: 'text',
    required: false,
    placeholder: 'e.g., CONFIDENTIAL',
  },

  showBorder: {
    id: 'showBorder',
    label: 'Show Border',
    labelHindi: 'बॉर्डर दिखाएं',
    type: 'checkbox',
    required: false,
    default: true,
  },
};

// ============================================================================
// TEMPLATE CONFIGURATIONS
// ============================================================================

export const memoTemplateConfigs: Record<
  MemoTemplateType,
  {
    name: string;
    nameHindi: string;
    description: string;
    icon: string;
    sections: string[];
    recommendedFor: string[];
  }
> = {
  'office-memo': {
    name: 'Office Memo',
    nameHindi: 'कार्यालय मेमो',
    description: 'Standard internal office memorandum for official communication',
    icon: '📝',
    sections: ['basic', 'sender', 'recipient', 'content', 'signature', 'styling'],
    recommendedFor: ['Internal communication', 'Instructions', 'Updates', 'Requests'],
  },

  circular: {
    name: 'Circular',
    nameHindi: 'परिपत्र',
    description: 'Official circular for wide distribution within organization',
    icon: '🔄',
    sections: ['basic', 'organization', 'sender', 'recipient', 'content', 'distribution', 'styling'],
    recommendedFor: ['Company-wide announcements', 'Policy changes', 'General instructions'],
  },

  notice: {
    name: 'Notice',
    nameHindi: 'सूचना',
    description: 'Formal notice for public or internal display',
    icon: '📢',
    sections: ['basic', 'organization', 'noticeDetails', 'content', 'validity', 'signature', 'styling'],
    recommendedFor: ['Public notices', 'Board notices', 'Holiday announcements', 'Meeting notices'],
  },

  announcement: {
    name: 'Announcement',
    nameHindi: 'घोषणा',
    description: 'Special announcements for events, achievements, or news',
    icon: '🎉',
    sections: ['basic', 'organization', 'content', 'eventDetails', 'callToAction', 'styling'],
    recommendedFor: ['Event announcements', 'Achievements', 'New initiatives', 'Celebrations'],
  },

  'internal-communication': {
    name: 'Internal Communication',
    nameHindi: 'आंतरिक संचार',
    description: 'Casual internal communication between teams or departments',
    icon: '💬',
    sections: ['basic', 'sender', 'recipient', 'content', 'actionItems', 'styling'],
    recommendedFor: ['Team updates', 'Project communication', 'Quick announcements'],
  },

  'policy-update': {
    name: 'Policy Update',
    nameHindi: 'नीति अपडेट',
    description: 'Communication about new or updated organizational policies',
    icon: '📋',
    sections: ['basic', 'organization', 'sender', 'policyDetails', 'content', 'compliance', 'signature', 'styling'],
    recommendedFor: ['New policies', 'Policy amendments', 'Compliance updates', 'Guidelines'],
  },
};

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const memoSampleData: Record<MemoTemplateType, MemoData> = {
  'office-memo': {
    templateType: 'office-memo',
    memoNumber: 'MEMO/HR/2024/045',
    date: '2024-12-16',
    subject: 'Updated Work From Home Guidelines',
    category: 'hr',
    priority: 'high',
    organizationName: 'TechSolutions Pvt. Ltd.',
    department: 'Human Resources',
    from: {
      name: 'Priya Sharma',
      designation: 'HR Manager',
      department: 'Human Resources',
      email: 'priya.sharma@techsolutions.com',
      phone: '+91 98765 43210',
    },
    to: {
      type: 'all-employees',
      cc: ['Department Heads', 'Admin Team'],
    },
    greeting: 'Dear Team,',
    openingParagraph:
      'This memo is to inform you about the updated Work From Home (WFH) guidelines effective from January 1, 2025.',
    body: `After careful consideration and feedback from various departments, we have revised our Work From Home policy to better accommodate the needs of our employees while maintaining productivity standards.

The new guidelines aim to provide flexibility while ensuring seamless collaboration across teams. Please review the key changes outlined below and reach out to HR for any clarifications.`,
    keyPoints: [
      'Employees can avail WFH up to 3 days per week',
      'Prior approval from reporting manager required for WFH days',
      'Core hours (10 AM - 4 PM) must be observed for availability',
      'Weekly team meetings must be attended in-person',
      'VPN connection mandatory for remote work',
    ],
    closingParagraph:
      'Please acknowledge receipt of this memo by replying to hr@techsolutions.com. For any queries, feel free to contact the HR department.',
    callToAction: 'Acknowledge by: December 20, 2024',
    contactInfo: 'HR Department: hr@techsolutions.com | Ext: 1234',
    accentColor: '#2563eb',
    showLogo: true,
    showBorder: true,
  },

  circular: {
    templateType: 'circular',
    memoNumber: 'CIR/ADMIN/2024/012',
    referenceNumber: 'REF/HO/2024/156',
    date: '2024-12-15',
    subject: 'Office Timings During Winter Season',
    category: 'administrative',
    priority: 'normal',
    organizationName: 'National Industries Corporation',
    branch: 'All Branches',
    from: {
      name: 'Rajesh Kumar',
      designation: 'General Manager - Administration',
      department: 'Administration',
    },
    to: {
      type: 'all-employees',
    },
    body: `It is hereby notified that the office timings for all branches will be revised during the winter season (December 15, 2024 to February 28, 2025) as follows:

Morning Shift: 9:30 AM to 5:30 PM
General Shift: 10:00 AM to 6:00 PM

This revision is applicable to all employees across all branches. Department heads are requested to ensure proper attendance monitoring during this period.`,
    keyPoints: [
      'New timings effective from December 15, 2024',
      'Applicable to all branches pan-India',
      'Lunch break remains 1:00 PM to 1:30 PM',
      'Saturday working hours: 10:00 AM to 2:00 PM',
    ],
    effectiveDate: '2024-12-15',
    expiryDate: '2025-02-28',
    accentColor: '#059669',
    showLogo: true,
    showBorder: true,
  },

  notice: {
    templateType: 'notice',
    memoNumber: 'NOT/2024/089',
    date: '2024-12-16',
    subject: 'Annual General Meeting Notice',
    category: 'general',
    priority: 'high',
    organizationName: 'Sunrise Housing Society',
    from: {
      name: 'K. Venkatesh',
      designation: 'Secretary',
      department: 'Managing Committee',
    },
    to: {
      type: 'public',
    },
    noticeType: 'meeting',
    body: `Notice is hereby given that the Annual General Meeting (AGM) of Sunrise Housing Society will be held as per the following details:

All members are requested to attend the meeting. Members unable to attend may authorize a proxy by submitting the proxy form to the Secretary at least 48 hours before the meeting.`,
    event: {
      eventName: 'Annual General Meeting 2024',
      eventDate: '2024-12-28',
      eventTime: '10:00 AM',
      venue: 'Community Hall, Sunrise Apartments, Bangalore',
      agenda: [
        'Confirmation of minutes of last AGM',
        'Presentation of Annual Accounts 2023-24',
        'Approval of Budget 2024-25',
        'Election of Managing Committee members',
        'Discussion on maintenance issues',
        'Any other matter with permission of Chair',
      ],
      rsvpRequired: true,
      rsvpDeadline: '2024-12-26',
      contactPerson: 'Secretary Office: +91 80 2345 6789',
    },
    effectiveDate: '2024-12-28',
    accentColor: '#dc2626',
    showLogo: true,
    showBorder: true,
  },

  announcement: {
    templateType: 'announcement',
    memoNumber: 'ANN/2024/025',
    date: '2024-12-16',
    subject: 'Celebrating Our Star Performer of the Year!',
    category: 'event',
    priority: 'normal',
    organizationName: 'GlobalTech Solutions',
    department: 'Human Resources',
    from: {
      name: 'Anita Desai',
      designation: 'Chief People Officer',
    },
    to: {
      type: 'all-employees',
    },
    greeting: 'Dear GlobalTech Family,',
    body: `We are thrilled to announce that **Amit Patel** from the Engineering team has been selected as the "Star Performer of the Year 2024"!

Amit has consistently demonstrated exceptional dedication, innovative thinking, and outstanding performance throughout the year. His contributions to the Project Phoenix have been instrumental in its success.

Please join us in congratulating Amit on this well-deserved recognition!`,
    event: {
      eventName: 'Star Performer Award Ceremony',
      eventDate: '2024-12-20',
      eventTime: '4:00 PM',
      venue: 'Auditorium, 5th Floor',
    },
    callToAction: 'Join us for the celebration! Refreshments will be served.',
    accentColor: '#7c3aed',
    showLogo: true,
    showBorder: true,
  },

  'internal-communication': {
    templateType: 'internal-communication',
    memoNumber: 'IC/ENG/2024/156',
    date: '2024-12-16',
    subject: 'Sprint Planning Meeting - Q1 2025',
    category: 'operations',
    priority: 'normal',
    organizationName: 'InnovateTech Labs',
    department: 'Engineering',
    from: {
      name: 'Vikram Singh',
      designation: 'Engineering Lead',
      department: 'Product Engineering',
      email: 'vikram.singh@innovatetech.com',
    },
    to: {
      type: 'department',
      department: 'Engineering Team',
      cc: ['Product Manager', 'QA Lead'],
    },
    greeting: 'Hi Team,',
    body: `As we approach the end of Q4, it's time to start planning for Q1 2025. I'd like to schedule a sprint planning session to discuss our goals and priorities for the upcoming quarter.

Please come prepared with your backlog items, any blockers from the current sprint, and suggestions for process improvements.`,
    actionItems: [
      { action: 'Review current sprint backlog', responsible: 'All Team Members', deadline: '2024-12-18', priority: 'high' },
      { action: 'Prepare Q1 feature proposals', responsible: 'Tech Leads', deadline: '2024-12-19', priority: 'high' },
      { action: 'Update JIRA tickets status', responsible: 'All Team Members', deadline: '2024-12-17', priority: 'normal' },
    ],
    closingParagraph: 'Looking forward to a productive planning session. Let me know if you have any questions.',
    accentColor: '#0891b2',
    showLogo: false,
    showBorder: false,
  },

  'policy-update': {
    templateType: 'policy-update',
    memoNumber: 'POL/HR/2024/008',
    referenceNumber: 'POL-HR-2024-008',
    date: '2024-12-16',
    subject: 'Updated Leave Policy - Effective January 2025',
    category: 'policy',
    priority: 'high',
    organizationName: 'Enterprise Solutions Ltd.',
    department: 'Human Resources',
    from: {
      name: 'Dr. Meera Krishnan',
      designation: 'Chief Human Resources Officer',
      department: 'Human Resources',
    },
    to: {
      type: 'all-employees',
      cc: ['All Department Heads', 'Legal Team'],
    },
    policy: {
      policyNumber: 'POL-HR-2024-008',
      effectiveDate: '2025-01-01',
      previousPolicy: 'POL-HR-2022-003',
      reviewDate: '2025-12-31',
      complianceDeadline: '2025-01-15',
    },
    body: `This memo announces significant updates to our Leave Policy, effective January 1, 2025. The revised policy supersedes the previous Leave Policy (POL-HR-2022-003) dated March 2022.

Key changes have been made to provide greater flexibility and support employee well-being while maintaining operational efficiency. Please review the complete policy document available on the HR portal.`,
    keyPoints: [
      'Earned Leave increased from 18 to 24 days per year',
      'Sick Leave increased from 10 to 12 days per year',
      'Introduction of 5 days Mental Health Leave',
      'Paternity Leave extended to 15 days',
      'Work From Home during illness now permitted',
      'Leave encashment limit increased to 60 days',
    ],
    closingParagraph:
      'All employees are required to acknowledge this policy update through the HR portal by January 15, 2025. For any clarifications, please contact the HR team.',
    disclaimer:
      'This policy is subject to review and may be amended based on organizational requirements and statutory changes.',
    contactInfo: 'HR Policy Team: hrpolicy@enterprise.com | Ext: 5678',
    accentColor: '#b45309',
    showLogo: true,
    showWatermark: true,
    watermark: 'POLICY UPDATE',
    showBorder: true,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getFieldsForMemoType(type: MemoTemplateType): string[] {
  const commonFields = [
    'templateType',
    'memoNumber',
    'date',
    'subject',
    'priority',
    'organizationName',
    'from.name',
    'from.designation',
    'to.type',
    'body',
    'accentColor',
    'showLogo',
  ];

  const typeSpecificFields: Record<MemoTemplateType, string[]> = {
    'office-memo': [
      ...commonFields,
      'from.department',
      'from.email',
      'to.cc',
      'greeting',
      'openingParagraph',
      'keyPoints',
      'closingParagraph',
      'callToAction',
      'from.signature',
    ],
    circular: [
      ...commonFields,
      'referenceNumber',
      'branch',
      'keyPoints',
      'effectiveDate',
      'expiryDate',
      'from.signature',
    ],
    notice: [
      ...commonFields,
      'noticeType',
      'event.eventDate',
      'event.eventTime',
      'event.venue',
      'event.agenda',
      'effectiveDate',
      'expiryDate',
      'from.signature',
    ],
    announcement: [
      ...commonFields,
      'greeting',
      'event.eventName',
      'event.eventDate',
      'event.eventTime',
      'event.venue',
      'callToAction',
    ],
    'internal-communication': [
      ...commonFields,
      'from.email',
      'to.department',
      'to.cc',
      'greeting',
      'actionItems',
      'closingParagraph',
    ],
    'policy-update': [
      ...commonFields,
      'referenceNumber',
      'policy.policyNumber',
      'policy.effectiveDate',
      'policy.previousPolicy',
      'policy.complianceDeadline',
      'keyPoints',
      'closingParagraph',
      'disclaimer',
      'from.signature',
      'showWatermark',
    ],
  };

  return typeSpecificFields[type] || commonFields;
}

export function getSampleData(type: MemoTemplateType): MemoData {
  return memoSampleData[type];
}

export function getTemplateInfo(type: MemoTemplateType) {
  return memoTemplateConfigs[type];
}

export function generateMemoNumber(type: MemoTemplateType, sequence: number = 1): string {
  const prefixMap: Record<MemoTemplateType, string> = {
    'office-memo': 'MEMO',
    circular: 'CIR',
    notice: 'NOT',
    announcement: 'ANN',
    'internal-communication': 'IC',
    'policy-update': 'POL',
  };

  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(3, '0');
  return `${prefixMap[type]}/${year}/${seq}`;
}

export function validateMemoData(data: Partial<MemoData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.templateType) errors.push('Template type is required');
  if (!data.date) errors.push('Date is required');
  if (!data.subject) errors.push('Subject is required');
  if (!data.body) errors.push('Main content is required');
  if (!data.from?.name) errors.push('Sender name is required');
  if (!data.to?.type) errors.push('Recipient type is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}