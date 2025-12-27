/**
 * SORIVA - Proposal Fields Configuration
 * Category: proposal
 * Types: business, project, sales, research, grant, sponsorship
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ProposalTemplateType =
  | 'business'
  | 'project'
  | 'sales'
  | 'research'
  | 'grant'
  | 'sponsorship';

export type ProposalStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';

export type ProposalPriority = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ProposalCompany {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  tagline?: string;
  registrationNumber?: string;
  gstin?: string;
}

export interface ProposalContact {
  name: string;
  designation?: string;
  email?: string;
  phone?: string;
}

export interface ProposalClient {
  companyName: string;
  contactPerson?: string;
  designation?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface ProposalObjective {
  title: string;
  description?: string;
}

export interface ProposalDeliverable {
  name: string;
  description?: string;
  timeline?: string;
}

export interface ProposalMilestone {
  name: string;
  description?: string;
  duration?: string;
  deliverables?: string[];
}

export interface ProposalPricing {
  item: string;
  description?: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  amount: number;
}

export interface ProposalTimeline {
  phase: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  activities?: string[];
}

export interface ProposalTeamMember {
  name: string;
  role: string;
  experience?: string;
  photo?: string;
}

export interface ProposalBudgetItem {
  category: string;
  description?: string;
  amount: number;
  justification?: string;
}

export interface SponsorshipTier {
  name: string;
  amount: number;
  benefits: string[];
}

export interface ProposalData {
  // Template Type
  templateType: ProposalTemplateType;

  // Basic Info
  proposalNumber?: string;
  proposalTitle: string;
  proposalDate: string;
  validUntil?: string;
  status?: ProposalStatus;
  version?: string;

  // Company Info (Proposer)
  company: ProposalCompany;
  preparedBy?: ProposalContact;

  // Client/Recipient Info
  client: ProposalClient;

  // Executive Summary
  executiveSummary?: string;

  // Problem/Opportunity
  problemStatement?: string;
  opportunity?: string;

  // Solution/Approach
  proposedSolution?: string;
  methodology?: string;
  approach?: string[];

  // Objectives
  objectives?: ProposalObjective[];

  // Scope
  scopeOfWork?: string[];
  outOfScope?: string[];

  // Deliverables
  deliverables?: ProposalDeliverable[];

  // Timeline & Milestones
  timeline?: ProposalTimeline[];
  milestones?: ProposalMilestone[];
  projectDuration?: string;
  startDate?: string;
  endDate?: string;

  // Team
  team?: ProposalTeamMember[];

  // Pricing/Budget
  pricing?: ProposalPricing[];
  totalAmount?: number;
  currency?: string;
  paymentTerms?: string;
  paymentSchedule?: string;

  // Budget (for grants/research)
  budget?: ProposalBudgetItem[];
  totalBudget?: number;
  fundingRequested?: number;

  // Sponsorship Specific
  eventName?: string;
  eventDate?: string;
  eventVenue?: string;
  expectedAttendees?: number;
  targetAudience?: string;
  sponsorshipTiers?: SponsorshipTier[];

  // Research Specific
  researchTitle?: string;
  hypothesis?: string;
  literatureReview?: string;
  researchMethodology?: string;
  expectedOutcomes?: string[];
  references?: string[];

  // Why Us
  whyUs?: string[];
  experience?: string;
  pastProjects?: string[];
  clientTestimonials?: string[];

  // Terms & Conditions
  termsAndConditions?: string[];
  assumptions?: string[];
  risks?: string[];

  // Call to Action
  callToAction?: string;
  nextSteps?: string[];

  // Appendix
  appendix?: string[];

  // Styling
  accentColor?: string;
  showLogo?: boolean;
  showCoverPage?: boolean;
  showTableOfContents?: boolean;
  showPageNumbers?: boolean;
}

// ============================================================================
// FIELD DEFINITIONS
// ============================================================================

export const proposalFieldDefinitions = {
  // --------------------------------------------------------------------------
  // Basic Information
  // --------------------------------------------------------------------------
  templateType: {
    id: 'templateType',
    label: 'Proposal Type',
    labelHindi: 'प्रस्ताव प्रकार',
    type: 'select',
    required: true,
    options: [
      { value: 'business', label: 'Business Proposal' },
      { value: 'project', label: 'Project Proposal' },
      { value: 'sales', label: 'Sales Proposal' },
      { value: 'research', label: 'Research Proposal' },
      { value: 'grant', label: 'Grant Proposal' },
      { value: 'sponsorship', label: 'Sponsorship Proposal' },
    ],
  },

  proposalNumber: {
    id: 'proposalNumber',
    label: 'Proposal Number',
    labelHindi: 'प्रस्ताव संख्या',
    type: 'text',
    required: false,
    placeholder: 'e.g., PROP-2024-001',
  },

  proposalTitle: {
    id: 'proposalTitle',
    label: 'Proposal Title',
    labelHindi: 'प्रस्ताव शीर्षक',
    type: 'text',
    required: true,
    placeholder: 'Enter proposal title',
    maxLength: 200,
  },

  proposalDate: {
    id: 'proposalDate',
    label: 'Date',
    labelHindi: 'तारीख',
    type: 'date',
    required: true,
  },

  validUntil: {
    id: 'validUntil',
    label: 'Valid Until',
    labelHindi: 'वैध तिथि',
    type: 'date',
    required: false,
  },

  version: {
    id: 'version',
    label: 'Version',
    labelHindi: 'संस्करण',
    type: 'text',
    required: false,
    placeholder: 'e.g., 1.0',
  },

  // --------------------------------------------------------------------------
  // Company Information
  // --------------------------------------------------------------------------
  'company.name': {
    id: 'company.name',
    label: 'Company Name',
    labelHindi: 'कंपनी का नाम',
    type: 'text',
    required: true,
    placeholder: 'Your company name',
  },

  'company.logo': {
    id: 'company.logo',
    label: 'Company Logo',
    labelHindi: 'कंपनी लोगो',
    type: 'image',
    required: false,
  },

  'company.address': {
    id: 'company.address',
    label: 'Address',
    labelHindi: 'पता',
    type: 'textarea',
    required: false,
    rows: 2,
  },

  'company.phone': {
    id: 'company.phone',
    label: 'Phone',
    labelHindi: 'फोन',
    type: 'tel',
    required: false,
  },

  'company.email': {
    id: 'company.email',
    label: 'Email',
    labelHindi: 'ईमेल',
    type: 'email',
    required: false,
  },

  'company.website': {
    id: 'company.website',
    label: 'Website',
    labelHindi: 'वेबसाइट',
    type: 'url',
    required: false,
  },

  'company.tagline': {
    id: 'company.tagline',
    label: 'Tagline',
    labelHindi: 'टैगलाइन',
    type: 'text',
    required: false,
    placeholder: 'Company tagline or motto',
  },

  // --------------------------------------------------------------------------
  // Prepared By
  // --------------------------------------------------------------------------
  'preparedBy.name': {
    id: 'preparedBy.name',
    label: 'Prepared By',
    labelHindi: 'तैयारकर्ता',
    type: 'text',
    required: false,
  },

  'preparedBy.designation': {
    id: 'preparedBy.designation',
    label: 'Designation',
    labelHindi: 'पदनाम',
    type: 'text',
    required: false,
  },

  'preparedBy.email': {
    id: 'preparedBy.email',
    label: 'Email',
    labelHindi: 'ईमेल',
    type: 'email',
    required: false,
  },

  'preparedBy.phone': {
    id: 'preparedBy.phone',
    label: 'Phone',
    labelHindi: 'फोन',
    type: 'tel',
    required: false,
  },

  // --------------------------------------------------------------------------
  // Client Information
  // --------------------------------------------------------------------------
  'client.companyName': {
    id: 'client.companyName',
    label: 'Client Company',
    labelHindi: 'क्लाइंट कंपनी',
    type: 'text',
    required: true,
    placeholder: 'Client company name',
  },

  'client.contactPerson': {
    id: 'client.contactPerson',
    label: 'Contact Person',
    labelHindi: 'संपर्क व्यक्ति',
    type: 'text',
    required: false,
  },

  'client.designation': {
    id: 'client.designation',
    label: 'Designation',
    labelHindi: 'पदनाम',
    type: 'text',
    required: false,
  },

  'client.address': {
    id: 'client.address',
    label: 'Address',
    labelHindi: 'पता',
    type: 'textarea',
    required: false,
    rows: 2,
  },

  'client.email': {
    id: 'client.email',
    label: 'Email',
    labelHindi: 'ईमेल',
    type: 'email',
    required: false,
  },

  // --------------------------------------------------------------------------
  // Content Sections
  // --------------------------------------------------------------------------
  executiveSummary: {
    id: 'executiveSummary',
    label: 'Executive Summary',
    labelHindi: 'कार्यकारी सारांश',
    type: 'richtext',
    required: false,
    placeholder: 'Brief overview of the proposal',
    rows: 5,
  },

  problemStatement: {
    id: 'problemStatement',
    label: 'Problem Statement',
    labelHindi: 'समस्या विवरण',
    type: 'richtext',
    required: false,
    placeholder: 'Describe the problem or challenge',
    rows: 4,
  },

  opportunity: {
    id: 'opportunity',
    label: 'Opportunity',
    labelHindi: 'अवसर',
    type: 'richtext',
    required: false,
    rows: 4,
  },

  proposedSolution: {
    id: 'proposedSolution',
    label: 'Proposed Solution',
    labelHindi: 'प्रस्तावित समाधान',
    type: 'richtext',
    required: true,
    placeholder: 'Describe your proposed solution',
    rows: 6,
  },

  methodology: {
    id: 'methodology',
    label: 'Methodology',
    labelHindi: 'कार्यप्रणाली',
    type: 'richtext',
    required: false,
    rows: 5,
  },

  approach: {
    id: 'approach',
    label: 'Approach',
    labelHindi: 'दृष्टिकोण',
    type: 'array',
    required: false,
    itemType: 'text',
  },

  // --------------------------------------------------------------------------
  // Objectives
  // --------------------------------------------------------------------------
  objectives: {
    id: 'objectives',
    label: 'Objectives',
    labelHindi: 'उद्देश्य',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['title', 'description'],
  },

  // --------------------------------------------------------------------------
  // Scope
  // --------------------------------------------------------------------------
  scopeOfWork: {
    id: 'scopeOfWork',
    label: 'Scope of Work',
    labelHindi: 'कार्य का दायरा',
    type: 'array',
    required: false,
    itemType: 'text',
  },

  outOfScope: {
    id: 'outOfScope',
    label: 'Out of Scope',
    labelHindi: 'दायरे से बाहर',
    type: 'array',
    required: false,
    itemType: 'text',
  },

  // --------------------------------------------------------------------------
  // Deliverables
  // --------------------------------------------------------------------------
  deliverables: {
    id: 'deliverables',
    label: 'Deliverables',
    labelHindi: 'डिलीवरेबल्स',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['name', 'description', 'timeline'],
  },

  // --------------------------------------------------------------------------
  // Timeline
  // --------------------------------------------------------------------------
  timeline: {
    id: 'timeline',
    label: 'Timeline',
    labelHindi: 'समयरेखा',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['phase', 'duration', 'activities'],
  },

  milestones: {
    id: 'milestones',
    label: 'Milestones',
    labelHindi: 'मील के पत्थर',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['name', 'duration', 'deliverables'],
  },

  projectDuration: {
    id: 'projectDuration',
    label: 'Project Duration',
    labelHindi: 'परियोजना अवधि',
    type: 'text',
    required: false,
    placeholder: 'e.g., 3 months',
  },

  startDate: {
    id: 'startDate',
    label: 'Start Date',
    labelHindi: 'प्रारंभ तिथि',
    type: 'date',
    required: false,
  },

  endDate: {
    id: 'endDate',
    label: 'End Date',
    labelHindi: 'समाप्ति तिथि',
    type: 'date',
    required: false,
  },

  // --------------------------------------------------------------------------
  // Team
  // --------------------------------------------------------------------------
  team: {
    id: 'team',
    label: 'Team Members',
    labelHindi: 'टीम के सदस्य',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['name', 'role', 'experience'],
  },

  // --------------------------------------------------------------------------
  // Pricing
  // --------------------------------------------------------------------------
  pricing: {
    id: 'pricing',
    label: 'Pricing',
    labelHindi: 'मूल्य निर्धारण',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['item', 'description', 'quantity', 'rate', 'amount'],
  },

  totalAmount: {
    id: 'totalAmount',
    label: 'Total Amount',
    labelHindi: 'कुल राशि',
    type: 'number',
    required: false,
  },

  currency: {
    id: 'currency',
    label: 'Currency',
    labelHindi: 'मुद्रा',
    type: 'select',
    required: false,
    options: [
      { value: 'INR', label: '₹ INR' },
      { value: 'USD', label: '$ USD' },
      { value: 'EUR', label: '€ EUR' },
      { value: 'GBP', label: '£ GBP' },
    ],
    default: 'INR',
  },

  paymentTerms: {
    id: 'paymentTerms',
    label: 'Payment Terms',
    labelHindi: 'भुगतान शर्तें',
    type: 'textarea',
    required: false,
    rows: 3,
  },

  // --------------------------------------------------------------------------
  // Budget (Grants/Research)
  // --------------------------------------------------------------------------
  budget: {
    id: 'budget',
    label: 'Budget',
    labelHindi: 'बजट',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['category', 'description', 'amount', 'justification'],
  },

  totalBudget: {
    id: 'totalBudget',
    label: 'Total Budget',
    labelHindi: 'कुल बजट',
    type: 'number',
    required: false,
  },

  fundingRequested: {
    id: 'fundingRequested',
    label: 'Funding Requested',
    labelHindi: 'अनुरोधित धनराशि',
    type: 'number',
    required: false,
  },

  // --------------------------------------------------------------------------
  // Sponsorship Specific
  // --------------------------------------------------------------------------
  eventName: {
    id: 'eventName',
    label: 'Event Name',
    labelHindi: 'कार्यक्रम का नाम',
    type: 'text',
    required: false,
  },

  eventDate: {
    id: 'eventDate',
    label: 'Event Date',
    labelHindi: 'कार्यक्रम की तारीख',
    type: 'date',
    required: false,
  },

  eventVenue: {
    id: 'eventVenue',
    label: 'Event Venue',
    labelHindi: 'कार्यक्रम स्थल',
    type: 'text',
    required: false,
  },

  expectedAttendees: {
    id: 'expectedAttendees',
    label: 'Expected Attendees',
    labelHindi: 'अपेक्षित उपस्थिति',
    type: 'number',
    required: false,
  },

  targetAudience: {
    id: 'targetAudience',
    label: 'Target Audience',
    labelHindi: 'लक्षित दर्शक',
    type: 'textarea',
    required: false,
    rows: 2,
  },

  sponsorshipTiers: {
    id: 'sponsorshipTiers',
    label: 'Sponsorship Tiers',
    labelHindi: 'प्रायोजन स्तर',
    type: 'array',
    required: false,
    itemType: 'object',
    fields: ['name', 'amount', 'benefits'],
  },

  // --------------------------------------------------------------------------
  // Research Specific
  // --------------------------------------------------------------------------
  hypothesis: {
    id: 'hypothesis',
    label: 'Hypothesis',
    labelHindi: 'परिकल्पना',
    type: 'textarea',
    required: false,
    rows: 3,
  },

  literatureReview: {
    id: 'literatureReview',
    label: 'Literature Review',
    labelHindi: 'साहित्य समीक्षा',
    type: 'richtext',
    required: false,
    rows: 5,
  },

  researchMethodology: {
    id: 'researchMethodology',
    label: 'Research Methodology',
    labelHindi: 'शोध कार्यप्रणाली',
    type: 'richtext',
    required: false,
    rows: 5,
  },

  expectedOutcomes: {
    id: 'expectedOutcomes',
    label: 'Expected Outcomes',
    labelHindi: 'अपेक्षित परिणाम',
    type: 'array',
    required: false,
    itemType: 'text',
  },

  references: {
    id: 'references',
    label: 'References',
    labelHindi: 'संदर्भ',
    type: 'array',
    required: false,
    itemType: 'text',
  },

  // --------------------------------------------------------------------------
  // Why Us
  // --------------------------------------------------------------------------
  whyUs: {
    id: 'whyUs',
    label: 'Why Choose Us',
    labelHindi: 'हमें क्यों चुनें',
    type: 'array',
    required: false,
    itemType: 'text',
  },

  experience: {
    id: 'experience',
    label: 'Our Experience',
    labelHindi: 'हमारा अनुभव',
    type: 'richtext',
    required: false,
    rows: 4,
  },

  pastProjects: {
    id: 'pastProjects',
    label: 'Past Projects',
    labelHindi: 'पिछली परियोजनाएं',
    type: 'array',
    required: false,
    itemType: 'text',
  },

  // --------------------------------------------------------------------------
  // Terms
  // --------------------------------------------------------------------------
  termsAndConditions: {
    id: 'termsAndConditions',
    label: 'Terms & Conditions',
    labelHindi: 'नियम और शर्तें',
    type: 'array',
    required: false,
    itemType: 'text',
  },

  assumptions: {
    id: 'assumptions',
    label: 'Assumptions',
    labelHindi: 'अनुमान',
    type: 'array',
    required: false,
    itemType: 'text',
  },

  // --------------------------------------------------------------------------
  // Call to Action
  // --------------------------------------------------------------------------
  callToAction: {
    id: 'callToAction',
    label: 'Call to Action',
    labelHindi: 'कार्रवाई का आह्वान',
    type: 'textarea',
    required: false,
    rows: 2,
  },

  nextSteps: {
    id: 'nextSteps',
    label: 'Next Steps',
    labelHindi: 'अगले कदम',
    type: 'array',
    required: false,
    itemType: 'text',
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

  showCoverPage: {
    id: 'showCoverPage',
    label: 'Show Cover Page',
    labelHindi: 'कवर पेज दिखाएं',
    type: 'checkbox',
    required: false,
    default: true,
  },

  showTableOfContents: {
    id: 'showTableOfContents',
    label: 'Show Table of Contents',
    labelHindi: 'विषय सूची दिखाएं',
    type: 'checkbox',
    required: false,
    default: false,
  },

  showPageNumbers: {
    id: 'showPageNumbers',
    label: 'Show Page Numbers',
    labelHindi: 'पेज नंबर दिखाएं',
    type: 'checkbox',
    required: false,
    default: true,
  },
};

// ============================================================================
// TEMPLATE CONFIGURATIONS
// ============================================================================

export const proposalTemplateConfigs: Record<
  ProposalTemplateType,
  {
    name: string;
    nameHindi: string;
    description: string;
    icon: string;
    sections: string[];
    recommendedFor: string[];
  }
> = {
  business: {
    name: 'Business Proposal',
    nameHindi: 'व्यापार प्रस्ताव',
    description: 'Professional business proposal for partnerships and collaborations',
    icon: '💼',
    sections: ['cover', 'summary', 'problem', 'solution', 'approach', 'deliverables', 'timeline', 'pricing', 'whyUs', 'terms', 'cta'],
    recommendedFor: ['B2B proposals', 'Partnership proposals', 'Collaboration requests'],
  },

  project: {
    name: 'Project Proposal',
    nameHindi: 'परियोजना प्रस्ताव',
    description: 'Detailed project proposal with scope, timeline, and milestones',
    icon: '📊',
    sections: ['cover', 'summary', 'objectives', 'scope', 'methodology', 'deliverables', 'timeline', 'team', 'budget', 'terms'],
    recommendedFor: ['IT projects', 'Construction projects', 'Consulting projects'],
  },

  sales: {
    name: 'Sales Proposal',
    nameHindi: 'बिक्री प्रस्ताव',
    description: 'Persuasive sales proposal to win clients',
    icon: '🎯',
    sections: ['cover', 'summary', 'problem', 'solution', 'benefits', 'pricing', 'testimonials', 'whyUs', 'cta'],
    recommendedFor: ['Product sales', 'Service sales', 'Client pitches'],
  },

  research: {
    name: 'Research Proposal',
    nameHindi: 'शोध प्रस्ताव',
    description: 'Academic or professional research proposal',
    icon: '🔬',
    sections: ['cover', 'abstract', 'introduction', 'literature', 'methodology', 'timeline', 'budget', 'outcomes', 'references'],
    recommendedFor: ['Academic research', 'Scientific studies', 'Market research'],
  },

  grant: {
    name: 'Grant Proposal',
    nameHindi: 'अनुदान प्रस्ताव',
    description: 'Funding request proposal for grants and donations',
    icon: '💰',
    sections: ['cover', 'summary', 'organization', 'problem', 'solution', 'objectives', 'methodology', 'budget', 'outcomes', 'sustainability'],
    recommendedFor: ['NGO funding', 'Research grants', 'Government schemes'],
  },

  sponsorship: {
    name: 'Sponsorship Proposal',
    nameHindi: 'प्रायोजन प्रस्ताव',
    description: 'Event or cause sponsorship proposal',
    icon: '🤝',
    sections: ['cover', 'event', 'audience', 'sponsorshipTiers', 'benefits', 'pastEvents', 'contact'],
    recommendedFor: ['Event sponsorship', 'Sports sponsorship', 'Cause marketing'],
  },
};

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const proposalSampleData: Record<ProposalTemplateType, Partial<ProposalData>> = {
  business: {
    templateType: 'business',
    proposalNumber: 'PROP-2024-001',
    proposalTitle: 'Digital Transformation Partnership Proposal',
    proposalDate: '2024-12-16',
    validUntil: '2025-01-15',
    company: {
      name: 'TechVentures Solutions Pvt. Ltd.',
      address: '123 Tech Park, Whitefield, Bangalore - 560066',
      phone: '+91 80 4567 8900',
      email: 'business@techventures.in',
      website: 'www.techventures.in',
      tagline: 'Transforming Businesses Through Technology',
    },
    preparedBy: {
      name: 'Rahul Sharma',
      designation: 'Business Development Manager',
      email: 'rahul.sharma@techventures.in',
      phone: '+91 98765 43210',
    },
    client: {
      companyName: 'GlobalRetail India Ltd.',
      contactPerson: 'Priya Mehta',
      designation: 'CTO',
      address: 'Tower B, Cyber City, Gurgaon - 122002',
      email: 'priya.mehta@globalretail.in',
    },
    executiveSummary: 'TechVentures Solutions proposes a comprehensive digital transformation initiative for GlobalRetail India to modernize operations, enhance customer experience, and drive revenue growth through technology-enabled solutions.',
    problemStatement: 'GlobalRetail faces challenges with legacy systems, fragmented customer data, and inefficient supply chain processes leading to reduced competitiveness in the rapidly evolving retail landscape.',
    proposedSolution: 'We propose an integrated digital platform combining cloud infrastructure, AI-powered analytics, and omnichannel retail solutions to transform GlobalRetail into a digitally-enabled enterprise.',
    approach: [
      'Assessment & Discovery Phase',
      'Solution Design & Architecture',
      'Phased Implementation',
      'Training & Change Management',
      'Go-Live & Support',
    ],
    deliverables: [
      { name: 'Cloud Migration', description: 'Complete infrastructure migration to AWS', timeline: 'Month 1-2' },
      { name: 'E-commerce Platform', description: 'New omnichannel retail platform', timeline: 'Month 2-4' },
      { name: 'Analytics Dashboard', description: 'Real-time business intelligence', timeline: 'Month 4-5' },
      { name: 'Mobile App', description: 'Customer-facing mobile application', timeline: 'Month 5-6' },
    ],
    projectDuration: '6 months',
    totalAmount: 4500000,
    currency: 'INR',
    whyUs: [
      '10+ years of enterprise digital transformation experience',
      '50+ successful retail technology implementations',
      'AWS Advanced Consulting Partner',
      'Dedicated support team available 24/7',
    ],
    accentColor: '#2563eb',
    showLogo: true,
    showCoverPage: true,
  },

  project: {
    templateType: 'project',
    proposalNumber: 'PRJ-2024-045',
    proposalTitle: 'ERP Implementation Project Proposal',
    proposalDate: '2024-12-16',
    validUntil: '2025-01-31',
    company: {
      name: 'SystemsPlus Consulting',
      address: 'Tech Hub, Andheri East, Mumbai - 400069',
      email: 'projects@systemsplus.in',
    },
    client: {
      companyName: 'ManufacturePro Industries',
      contactPerson: 'Arun Patel',
      designation: 'Managing Director',
    },
    executiveSummary: 'This proposal outlines the implementation of SAP Business One ERP system to streamline ManufacturePro\'s operations across manufacturing, inventory, and finance.',
    objectives: [
      { title: 'Automate Business Processes', description: 'Reduce manual work by 60%' },
      { title: 'Real-time Visibility', description: 'Dashboard for all departments' },
      { title: 'Inventory Optimization', description: 'Reduce holding costs by 25%' },
    ],
    scopeOfWork: [
      'Business process analysis and mapping',
      'SAP Business One installation and configuration',
      'Data migration from legacy systems',
      'Custom report development',
      'User training and documentation',
      '3 months post-implementation support',
    ],
    outOfScope: [
      'Hardware procurement',
      'Network infrastructure changes',
      'Third-party integrations not specified',
    ],
    milestones: [
      { name: 'Discovery & Planning', duration: '2 weeks', deliverables: ['Requirements document', 'Project plan'] },
      { name: 'System Setup', duration: '3 weeks', deliverables: ['Configured SAP system', 'Test environment'] },
      { name: 'Data Migration', duration: '2 weeks', deliverables: ['Migrated master data', 'Historical data'] },
      { name: 'UAT & Training', duration: '2 weeks', deliverables: ['Trained users', 'User manuals'] },
      { name: 'Go-Live', duration: '1 week', deliverables: ['Production system', 'Support handover'] },
    ],
    team: [
      { name: 'Vikram Singh', role: 'Project Manager', experience: '12 years' },
      { name: 'Neha Gupta', role: 'SAP Consultant', experience: '8 years' },
      { name: 'Amit Joshi', role: 'Technical Lead', experience: '10 years' },
    ],
    totalAmount: 1800000,
    currency: 'INR',
    paymentTerms: '30% advance, 40% on UAT completion, 30% on Go-Live',
    accentColor: '#059669',
    showLogo: true,
  },

  sales: {
    templateType: 'sales',
    proposalNumber: 'SALES-2024-089',
    proposalTitle: 'Enterprise Security Solution Proposal',
    proposalDate: '2024-12-16',
    validUntil: '2024-12-31',
    company: {
      name: 'SecureShield Technologies',
      tagline: 'Your Security, Our Priority',
    },
    client: {
      companyName: 'FinanceFirst Bank',
      contactPerson: 'Rajesh Kumar',
      designation: 'CISO',
    },
    problemStatement: 'With increasing cyber threats targeting financial institutions, FinanceFirst needs a robust, compliant security infrastructure to protect customer data and maintain regulatory compliance.',
    proposedSolution: 'Our comprehensive Enterprise Security Suite provides end-to-end protection including threat detection, incident response, and compliance management tailored for banking sector.',
    pricing: [
      { item: 'Security Assessment', description: 'Complete infrastructure audit', quantity: 1, rate: 150000, amount: 150000 },
      { item: 'Firewall Solution', description: 'Next-gen firewall deployment', quantity: 2, rate: 450000, amount: 900000 },
      { item: 'SIEM Platform', description: '1-year license', quantity: 1, rate: 600000, amount: 600000 },
      { item: 'SOC Services', description: '24/7 monitoring (annual)', quantity: 1, rate: 1200000, amount: 1200000 },
    ],
    totalAmount: 2850000,
    currency: 'INR',
    whyUs: [
      'RBI compliant security solutions',
      'Serving 20+ banks in India',
      'ISO 27001 certified processes',
      '99.9% threat detection rate',
    ],
    callToAction: 'Schedule a free security assessment worth ₹1,50,000. Limited time offer valid till December 31, 2024.',
    accentColor: '#dc2626',
    showLogo: true,
  },

  research: {
    templateType: 'research',
    proposalNumber: 'RES-2024-012',
    proposalTitle: 'Impact of AI on Rural Healthcare Delivery in India',
    proposalDate: '2024-12-16',
    company: {
      name: 'Indian Institute of Health Research',
      address: 'IIHR Campus, New Delhi - 110029',
    },
    preparedBy: {
      name: 'Dr. Ananya Krishnan',
      designation: 'Principal Investigator',
      email: 'ananya.k@iihr.edu.in',
    },
    executiveSummary: 'This research proposal seeks to investigate the effectiveness of AI-powered diagnostic tools in improving healthcare outcomes in rural India, with a focus on early disease detection and treatment adherence.',
    hypothesis: 'AI-assisted diagnostic tools can improve early disease detection rates by 40% in rural primary health centers compared to traditional methods.',
    researchMethodology: 'Mixed-methods approach combining quantitative analysis of diagnostic accuracy with qualitative assessment of healthcare worker adoption and patient satisfaction across 50 PHCs in 5 states.',
    expectedOutcomes: [
      'Evidence-based framework for AI adoption in rural healthcare',
      'Cost-benefit analysis of AI diagnostic tools',
      'Policy recommendations for government health programs',
      'Training curriculum for healthcare workers',
    ],
    timeline: [
      { phase: 'Literature Review', duration: '2 months', activities: ['Systematic review', 'Gap analysis'] },
      { phase: 'Tool Development', duration: '3 months', activities: ['AI model training', 'Pilot testing'] },
      { phase: 'Field Study', duration: '6 months', activities: ['Data collection', 'Intervention'] },
      { phase: 'Analysis & Reporting', duration: '3 months', activities: ['Statistical analysis', 'Report writing'] },
    ],
    totalBudget: 2500000,
    fundingRequested: 2500000,
    references: [
      'WHO Global Strategy on Digital Health 2020-2025',
      'NITI Aayog AI for Healthcare Report 2023',
      'Lancet Digital Health Studies 2022-2024',
    ],
    accentColor: '#7c3aed',
    showLogo: true,
  },

  grant: {
    templateType: 'grant',
    proposalNumber: 'GRANT-2024-007',
    proposalTitle: 'Rural Women Empowerment Through Digital Literacy',
    proposalDate: '2024-12-16',
    company: {
      name: 'Shakti Foundation',
      address: 'NGO Complex, Sector 15, Chandigarh - 160015',
      email: 'grants@shaktifoundation.org',
    },
    client: {
      companyName: 'CSR Foundation of India',
      contactPerson: 'Ms. Kavita Reddy',
      designation: 'Program Director',
    },
    executiveSummary: 'Shakti Foundation seeks funding of ₹45 lakhs to implement a 2-year digital literacy program for 5,000 rural women across Punjab and Haryana, enabling economic independence through digital skills.',
    problemStatement: 'Rural women in North India face significant barriers to economic participation due to lack of digital skills, limiting their access to government schemes, banking, and livelihood opportunities.',
    objectives: [
      { title: 'Digital Literacy', description: 'Train 5,000 women in basic digital skills' },
      { title: 'Financial Inclusion', description: 'Enable 3,000 women to access digital banking' },
      { title: 'Livelihood Support', description: 'Connect 1,000 women to online marketplaces' },
    ],
    methodology: 'Community-based training model with local women leaders as trainers, mobile training labs, and partnership with SHGs for sustainable implementation.',
    budget: [
      { category: 'Training Infrastructure', description: 'Mobile labs, tablets, internet', amount: 1200000, justification: '10 mobile labs @ ₹1.2L each' },
      { category: 'Human Resources', description: 'Trainers, coordinators', amount: 1800000, justification: '20 trainers for 24 months' },
      { category: 'Operations', description: 'Travel, venue, materials', amount: 800000, justification: 'Field operations across 100 villages' },
      { category: 'M&E', description: 'Monitoring and evaluation', amount: 400000, justification: 'Third-party impact assessment' },
      { category: 'Administration', description: 'Overheads (10%)', amount: 300000, justification: 'Standard NGO overhead' },
    ],
    totalBudget: 4500000,
    fundingRequested: 4500000,
    accentColor: '#ea580c',
    showLogo: true,
  },

  sponsorship: {
    templateType: 'sponsorship',
    proposalNumber: 'SPON-2024-015',
    proposalTitle: 'TechSummit India 2025 - Sponsorship Proposal',
    proposalDate: '2024-12-16',
    company: {
      name: 'TechEvents India',
      email: 'sponsorship@techevents.in',
      website: 'www.techsummitindia.com',
    },
    client: {
      companyName: 'Potential Sponsor',
    },
    eventName: 'TechSummit India 2025',
    eventDate: '2025-03-15',
    eventVenue: 'Pragati Maidan, New Delhi',
    expectedAttendees: 5000,
    targetAudience: 'CTOs, CIOs, Tech Leaders, Startup Founders, Developers, and IT Decision Makers from across India and South Asia.',
    sponsorshipTiers: [
      {
        name: 'Platinum Sponsor',
        amount: 2500000,
        benefits: [
          'Title sponsor recognition',
          'Keynote speaking slot (30 mins)',
          'Premium booth (100 sqm)',
          'Logo on all materials',
          '50 delegate passes',
          'Exclusive networking dinner',
        ],
      },
      {
        name: 'Gold Sponsor',
        amount: 1500000,
        benefits: [
          'Panel discussion slot',
          'Standard booth (50 sqm)',
          'Logo on select materials',
          '25 delegate passes',
          'VIP networking access',
        ],
      },
      {
        name: 'Silver Sponsor',
        amount: 750000,
        benefits: [
          'Workshop hosting opportunity',
          'Kiosk space (20 sqm)',
          'Logo on event website',
          '10 delegate passes',
        ],
      },
    ],
    whyUs: [
      '8th edition with proven track record',
      'Media coverage worth ₹2 Cr+',
      'Direct access to 5000+ tech decision makers',
      'Post-event lead sharing',
    ],
    accentColor: '#0891b2',
    showLogo: true,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getFieldsForProposalType(type: ProposalTemplateType): string[] {
  const commonFields = [
    'templateType', 'proposalNumber', 'proposalTitle', 'proposalDate', 'validUntil',
    'company.name', 'company.logo', 'company.address', 'company.email',
    'client.companyName', 'client.contactPerson',
    'executiveSummary', 'accentColor', 'showLogo',
  ];

  const typeSpecificFields: Record<ProposalTemplateType, string[]> = {
    business: [...commonFields, 'problemStatement', 'proposedSolution', 'approach', 'deliverables', 'projectDuration', 'pricing', 'totalAmount', 'whyUs', 'termsAndConditions', 'callToAction'],
    project: [...commonFields, 'objectives', 'scopeOfWork', 'outOfScope', 'methodology', 'deliverables', 'milestones', 'team', 'pricing', 'totalAmount', 'paymentTerms', 'assumptions'],
    sales: [...commonFields, 'problemStatement', 'proposedSolution', 'pricing', 'totalAmount', 'whyUs', 'callToAction'],
    research: [...commonFields, 'hypothesis', 'literatureReview', 'researchMethodology', 'timeline', 'budget', 'totalBudget', 'expectedOutcomes', 'references'],
    grant: [...commonFields, 'problemStatement', 'objectives', 'methodology', 'budget', 'totalBudget', 'fundingRequested', 'expectedOutcomes'],
    sponsorship: [...commonFields, 'eventName', 'eventDate', 'eventVenue', 'expectedAttendees', 'targetAudience', 'sponsorshipTiers', 'whyUs'],
  };

  return typeSpecificFields[type] || commonFields;
}

export function getSampleData(type: ProposalTemplateType): Partial<ProposalData> {
  return proposalSampleData[type];
}

export function getTemplateInfo(type: ProposalTemplateType) {
  return proposalTemplateConfigs[type];
}

export function generateProposalNumber(type: ProposalTemplateType, sequence: number = 1): string {
  const prefixMap: Record<ProposalTemplateType, string> = {
    business: 'PROP',
    project: 'PRJ',
    sales: 'SALES',
    research: 'RES',
    grant: 'GRANT',
    sponsorship: 'SPON',
  };

  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(3, '0');
  return `${prefixMap[type]}-${year}-${seq}`;
}

export function validateProposalData(data: Partial<ProposalData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.templateType) errors.push('Proposal type is required');
  if (!data.proposalTitle) errors.push('Proposal title is required');
  if (!data.proposalDate) errors.push('Date is required');
  if (!data.company?.name) errors.push('Company name is required');
  if (!data.client?.companyName) errors.push('Client company name is required');

  return { valid: errors.length === 0, errors };
}