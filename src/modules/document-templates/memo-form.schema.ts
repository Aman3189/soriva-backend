/**
 * SORIVA - Memo/Notice Form Schema (LEAN)
 * Category: memo
 * Pattern: Reusable field arrays + minimal step definitions
 */

// ============================================================================
// ENUM
// ============================================================================

export enum MemoType {
  OFFICE_MEMO = 'office-memo',
  CIRCULAR = 'circular',
  NOTICE = 'notice',
  ANNOUNCEMENT = 'announcement',
  INTERNAL = 'internal-communication',
  POLICY = 'policy-update',
}

// ============================================================================
// REUSABLE FIELD ARRAYS
// ============================================================================

const F = {
  // Basic Info
  basic: ['templateType', 'memoNumber', 'date', 'subject', 'category', 'priority'],
  basicSimple: ['templateType', 'memoNumber', 'date', 'subject', 'priority'],

  // Organization
  org: ['organizationName', 'organizationLogo', 'department', 'branch'],
  orgSimple: ['organizationName', 'organizationLogo', 'department'],

  // Sender
  sender: ['from.name', 'from.designation', 'from.department', 'from.email', 'from.phone'],
  senderSimple: ['from.name', 'from.designation', 'from.department'],
  senderWithSig: ['from.name', 'from.designation', 'from.department', 'from.email', 'from.signature'],

  // Recipient
  recipient: ['to.type', 'to.names', 'to.department', 'to.branch', 'to.cc'],
  recipientSimple: ['to.type', 'to.department', 'to.cc'],

  // Content
  content: ['greeting', 'openingParagraph', 'body', 'keyPoints', 'closingParagraph'],
  contentSimple: ['greeting', 'body', 'closingParagraph'],
  contentMinimal: ['body', 'keyPoints'],

  // Policy
  policy: ['policy.policyNumber', 'policy.effectiveDate', 'policy.previousPolicy', 'policy.reviewDate', 'policy.complianceDeadline'],

  // Event
  event: ['event.eventName', 'event.eventDate', 'event.eventTime', 'event.venue', 'event.agenda'],
  eventRsvp: ['event.rsvpRequired', 'event.rsvpDeadline', 'event.contactPerson'],

  // Notice
  notice: ['noticeType', 'effectiveDate', 'expiryDate'],

  // Action Items
  actions: ['actionItems', 'callToAction'],

  // Attachments
  attachments: ['attachments'],

  // Footer
  footer: ['disclaimer', 'confidentialityNotice', 'contactInfo'],

  // Styling
  styling: ['accentColor', 'showLogo', 'showBorder', 'showWatermark', 'watermark'],
  stylingSimple: ['accentColor', 'showLogo', 'showBorder'],
};

// ============================================================================
// FORM SCHEMAS
// ============================================================================

export const memoFormSchemas = {
  // --------------------------------------------------------------------------
  // Office Memo - Standard internal memo
  // --------------------------------------------------------------------------
  [MemoType.OFFICE_MEMO]: {
    id: 'office-memo',
    title: 'Office Memo',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basic },
      { id: 'org', title: 'Organization', fields: F.orgSimple },
      { id: 'sender', title: 'From', fields: F.senderWithSig },
      { id: 'recipient', title: 'To', fields: F.recipientSimple },
      { id: 'content', title: 'Content', fields: F.content },
      { id: 'actions', title: 'Actions', fields: F.actions },
      { id: 'footer', title: 'Footer', fields: ['contactInfo'] },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Circular - Company-wide distribution
  // --------------------------------------------------------------------------
  [MemoType.CIRCULAR]: {
    id: 'circular',
    title: 'Circular',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: [...F.basicSimple, 'referenceNumber'] },
      { id: 'org', title: 'Organization', fields: F.org },
      { id: 'sender', title: 'From', fields: F.senderWithSig },
      { id: 'recipient', title: 'Distribution', fields: ['to.type', 'to.branch'] },
      { id: 'content', title: 'Content', fields: ['body', 'keyPoints'] },
      { id: 'validity', title: 'Validity', fields: ['effectiveDate', 'expiryDate'] },
      { id: 'footer', title: 'Footer', fields: ['contactInfo'] },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Notice - Public or board notice
  // --------------------------------------------------------------------------
  [MemoType.NOTICE]: {
    id: 'notice',
    title: 'Notice',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basicSimple },
      { id: 'org', title: 'Organization', fields: F.orgSimple },
      { id: 'noticeType', title: 'Notice Type', fields: F.notice },
      { id: 'sender', title: 'Issued By', fields: F.senderSimple },
      { id: 'content', title: 'Content', fields: ['body', 'keyPoints'] },
      { id: 'event', title: 'Event Details', fields: F.event },
      { id: 'rsvp', title: 'RSVP', fields: F.eventRsvp },
      { id: 'signature', title: 'Signature', fields: ['from.signature'] },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Announcement - Events, achievements, celebrations
  // --------------------------------------------------------------------------
  [MemoType.ANNOUNCEMENT]: {
    id: 'announcement',
    title: 'Announcement',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: ['templateType', 'memoNumber', 'date', 'subject'] },
      { id: 'org', title: 'Organization', fields: F.orgSimple },
      { id: 'sender', title: 'From', fields: F.senderSimple },
      { id: 'recipient', title: 'To', fields: ['to.type'] },
      { id: 'content', title: 'Content', fields: ['greeting', 'body'] },
      { id: 'event', title: 'Event', fields: ['event.eventName', 'event.eventDate', 'event.eventTime', 'event.venue'] },
      { id: 'cta', title: 'Call to Action', fields: ['callToAction'] },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Internal Communication - Casual team updates
  // --------------------------------------------------------------------------
  [MemoType.INTERNAL]: {
    id: 'internal-communication',
    title: 'Internal Communication',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: ['templateType', 'memoNumber', 'date', 'subject', 'priority'] },
      { id: 'sender', title: 'From', fields: ['from.name', 'from.designation', 'from.department', 'from.email'] },
      { id: 'recipient', title: 'To', fields: ['to.type', 'to.department', 'to.cc'] },
      { id: 'content', title: 'Content', fields: ['greeting', 'body'] },
      { id: 'actions', title: 'Action Items', fields: ['actionItems'] },
      { id: 'closing', title: 'Closing', fields: ['closingParagraph'] },
      { id: 'styling', title: 'Styling', fields: ['accentColor', 'showBorder'] },
    ],
  },

  // --------------------------------------------------------------------------
  // Policy Update - New or revised policies
  // --------------------------------------------------------------------------
  [MemoType.POLICY]: {
    id: 'policy-update',
    title: 'Policy Update',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: [...F.basicSimple, 'referenceNumber'] },
      { id: 'org', title: 'Organization', fields: F.orgSimple },
      { id: 'sender', title: 'From', fields: F.senderWithSig },
      { id: 'recipient', title: 'To', fields: F.recipientSimple },
      { id: 'policy', title: 'Policy Details', fields: F.policy },
      { id: 'content', title: 'Content', fields: ['body', 'keyPoints'] },
      { id: 'closing', title: 'Closing', fields: ['closingParagraph', 'callToAction'] },
      { id: 'footer', title: 'Footer', fields: ['disclaimer', 'contactInfo'] },
      { id: 'styling', title: 'Styling', fields: F.styling },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getMemoForm(type: MemoType) {
  return memoFormSchemas[type];
}

export function getMemoStep(type: MemoType, stepId: string) {
  const form = memoFormSchemas[type];
  return form?.steps.find((s) => s.id === stepId);
}

export function getMemoFields(type: MemoType): string[] {
  const form = memoFormSchemas[type];
  if (!form) return [];
  return form.steps.flatMap((step) => step.fields);
}

export function getMemoStepCount(type: MemoType): number {
  return memoFormSchemas[type]?.steps.length || 0;
}

export function getMemoTypes(): { value: MemoType; label: string }[] {
  return [
    { value: MemoType.OFFICE_MEMO, label: 'Office Memo' },
    { value: MemoType.CIRCULAR, label: 'Circular' },
    { value: MemoType.NOTICE, label: 'Notice' },
    { value: MemoType.ANNOUNCEMENT, label: 'Announcement' },
    { value: MemoType.INTERNAL, label: 'Internal Communication' },
    { value: MemoType.POLICY, label: 'Policy Update' },
  ];
}

// ============================================================================
// AUTO-SUGGEST
// ============================================================================

export function suggestMemoType(context: {
  isCompanyWide?: boolean;
  isPolicy?: boolean;
  isEvent?: boolean;
  isPublic?: boolean;
  isTeamUpdate?: boolean;
  keywords?: string[];
}): MemoType {
  const { isCompanyWide, isPolicy, isEvent, isPublic, isTeamUpdate, keywords = [] } = context;
  const kw = keywords.map((k) => k.toLowerCase()).join(' ');

  // Policy update
  if (isPolicy || kw.includes('policy') || kw.includes('guideline') || kw.includes('compliance')) {
    return MemoType.POLICY;
  }

  // Public notice
  if (isPublic || kw.includes('notice') || kw.includes('tender') || kw.includes('recruitment') || kw.includes('meeting notice')) {
    return MemoType.NOTICE;
  }

  // Announcement
  if (isEvent || kw.includes('celebration') || kw.includes('achievement') || kw.includes('announce') || kw.includes('congratulat')) {
    return MemoType.ANNOUNCEMENT;
  }

  // Circular
  if (isCompanyWide || kw.includes('circular') || kw.includes('all employees') || kw.includes('all branches')) {
    return MemoType.CIRCULAR;
  }

  // Internal communication
  if (isTeamUpdate || kw.includes('team') || kw.includes('sprint') || kw.includes('update') || kw.includes('sync')) {
    return MemoType.INTERNAL;
  }

  // Default: Office Memo
  return MemoType.OFFICE_MEMO;
}

// ============================================================================
// FIELD ARRAYS EXPORT (for external use)
// ============================================================================

export const memoFieldArrays = F;