/**
 * SORIVA - Proposal Form Schema (LEAN)
 * Category: proposal
 * Pattern: Reusable field arrays + minimal step definitions
 */

// ============================================================================
// ENUM
// ============================================================================

export enum ProposalType {
  BUSINESS = 'business',
  PROJECT = 'project',
  SALES = 'sales',
  RESEARCH = 'research',
  GRANT = 'grant',
  SPONSORSHIP = 'sponsorship',
}

// ============================================================================
// REUSABLE FIELD ARRAYS
// ============================================================================

const F = {
  // Basic Info
  basic: ['templateType', 'proposalNumber', 'proposalTitle', 'proposalDate', 'validUntil', 'version'],
  basicSimple: ['templateType', 'proposalNumber', 'proposalTitle', 'proposalDate', 'validUntil'],

  // Company (Proposer)
  company: ['company.name', 'company.logo', 'company.address', 'company.phone', 'company.email', 'company.website', 'company.tagline'],
  companySimple: ['company.name', 'company.logo', 'company.address', 'company.email'],

  // Prepared By
  preparedBy: ['preparedBy.name', 'preparedBy.designation', 'preparedBy.email', 'preparedBy.phone'],

  // Client
  client: ['client.companyName', 'client.contactPerson', 'client.designation', 'client.address', 'client.email'],
  clientSimple: ['client.companyName', 'client.contactPerson', 'client.email'],

  // Content
  summary: ['executiveSummary'],
  problem: ['problemStatement', 'opportunity'],
  solution: ['proposedSolution', 'methodology', 'approach'],
  solutionSimple: ['proposedSolution', 'approach'],

  // Objectives & Scope
  objectives: ['objectives'],
  scope: ['scopeOfWork', 'outOfScope'],

  // Deliverables & Timeline
  deliverables: ['deliverables'],
  timeline: ['timeline', 'projectDuration', 'startDate', 'endDate'],
  milestones: ['milestones'],

  // Team
  team: ['team'],

  // Pricing
  pricing: ['pricing', 'totalAmount', 'currency', 'paymentTerms'],
  pricingSimple: ['pricing', 'totalAmount', 'currency'],

  // Budget (Grants/Research)
  budget: ['budget', 'totalBudget', 'fundingRequested'],

  // Research Specific
  research: ['hypothesis', 'literatureReview', 'researchMethodology', 'expectedOutcomes', 'references'],

  // Sponsorship Specific
  event: ['eventName', 'eventDate', 'eventVenue', 'expectedAttendees', 'targetAudience'],
  sponsorshipTiers: ['sponsorshipTiers'],

  // Why Us
  whyUs: ['whyUs', 'experience', 'pastProjects'],
  whyUsSimple: ['whyUs'],

  // Terms
  terms: ['termsAndConditions', 'assumptions'],

  // CTA
  cta: ['callToAction', 'nextSteps'],

  // Styling
  styling: ['accentColor', 'showLogo', 'showCoverPage', 'showTableOfContents', 'showPageNumbers'],
  stylingSimple: ['accentColor', 'showLogo', 'showCoverPage'],
};

// ============================================================================
// FORM SCHEMAS
// ============================================================================

export const proposalFormSchemas = {
  // --------------------------------------------------------------------------
  // Business Proposal
  // --------------------------------------------------------------------------
  [ProposalType.BUSINESS]: {
    id: 'business',
    title: 'Business Proposal',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basicSimple },
      { id: 'company', title: 'Your Company', fields: F.company },
      { id: 'prepared', title: 'Prepared By', fields: F.preparedBy },
      { id: 'client', title: 'Client', fields: F.client },
      { id: 'summary', title: 'Executive Summary', fields: F.summary },
      { id: 'problem', title: 'Problem & Opportunity', fields: F.problem },
      { id: 'solution', title: 'Proposed Solution', fields: F.solution },
      { id: 'deliverables', title: 'Deliverables', fields: [...F.deliverables, 'projectDuration'] },
      { id: 'pricing', title: 'Pricing', fields: F.pricing },
      { id: 'whyUs', title: 'Why Choose Us', fields: F.whyUsSimple },
      { id: 'terms', title: 'Terms', fields: F.terms },
      { id: 'cta', title: 'Call to Action', fields: F.cta },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Project Proposal
  // --------------------------------------------------------------------------
  [ProposalType.PROJECT]: {
    id: 'project',
    title: 'Project Proposal',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basic },
      { id: 'company', title: 'Your Company', fields: F.companySimple },
      { id: 'client', title: 'Client', fields: F.client },
      { id: 'summary', title: 'Executive Summary', fields: F.summary },
      { id: 'objectives', title: 'Objectives', fields: F.objectives },
      { id: 'scope', title: 'Scope of Work', fields: F.scope },
      { id: 'methodology', title: 'Methodology', fields: ['methodology'] },
      { id: 'deliverables', title: 'Deliverables', fields: F.deliverables },
      { id: 'milestones', title: 'Milestones', fields: F.milestones },
      { id: 'timeline', title: 'Timeline', fields: F.timeline },
      { id: 'team', title: 'Team', fields: F.team },
      { id: 'pricing', title: 'Pricing & Payment', fields: F.pricing },
      { id: 'terms', title: 'Terms & Assumptions', fields: F.terms },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Sales Proposal
  // --------------------------------------------------------------------------
  [ProposalType.SALES]: {
    id: 'sales',
    title: 'Sales Proposal',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basicSimple },
      { id: 'company', title: 'Your Company', fields: [...F.companySimple, 'company.tagline'] },
      { id: 'client', title: 'Client', fields: F.clientSimple },
      { id: 'summary', title: 'Executive Summary', fields: F.summary },
      { id: 'problem', title: 'Challenge', fields: ['problemStatement'] },
      { id: 'solution', title: 'Our Solution', fields: ['proposedSolution'] },
      { id: 'pricing', title: 'Pricing', fields: F.pricingSimple },
      { id: 'whyUs', title: 'Why Choose Us', fields: F.whyUsSimple },
      { id: 'cta', title: 'Call to Action', fields: F.cta },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Research Proposal
  // --------------------------------------------------------------------------
  [ProposalType.RESEARCH]: {
    id: 'research',
    title: 'Research Proposal',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basicSimple },
      { id: 'institution', title: 'Institution', fields: F.companySimple },
      { id: 'researcher', title: 'Principal Investigator', fields: F.preparedBy },
      { id: 'summary', title: 'Abstract', fields: F.summary },
      { id: 'hypothesis', title: 'Hypothesis', fields: ['hypothesis'] },
      { id: 'literature', title: 'Literature Review', fields: ['literatureReview'] },
      { id: 'methodology', title: 'Research Methodology', fields: ['researchMethodology'] },
      { id: 'timeline', title: 'Timeline', fields: ['timeline', 'projectDuration'] },
      { id: 'budget', title: 'Budget', fields: F.budget },
      { id: 'outcomes', title: 'Expected Outcomes', fields: ['expectedOutcomes'] },
      { id: 'references', title: 'References', fields: ['references'] },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Grant Proposal
  // --------------------------------------------------------------------------
  [ProposalType.GRANT]: {
    id: 'grant',
    title: 'Grant Proposal',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basicSimple },
      { id: 'organization', title: 'Organization', fields: F.company },
      { id: 'funder', title: 'Funding Agency', fields: F.clientSimple },
      { id: 'summary', title: 'Executive Summary', fields: F.summary },
      { id: 'problem', title: 'Problem Statement', fields: ['problemStatement'] },
      { id: 'objectives', title: 'Objectives', fields: F.objectives },
      { id: 'methodology', title: 'Methodology', fields: ['methodology'] },
      { id: 'timeline', title: 'Timeline', fields: ['timeline', 'projectDuration'] },
      { id: 'budget', title: 'Budget', fields: F.budget },
      { id: 'outcomes', title: 'Expected Outcomes', fields: ['expectedOutcomes'] },
      { id: 'sustainability', title: 'Sustainability', fields: ['callToAction'] },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },

  // --------------------------------------------------------------------------
  // Sponsorship Proposal
  // --------------------------------------------------------------------------
  [ProposalType.SPONSORSHIP]: {
    id: 'sponsorship',
    title: 'Sponsorship Proposal',
    steps: [
      { id: 'basic', title: 'Basic Info', fields: F.basicSimple },
      { id: 'organizer', title: 'Organizer', fields: F.companySimple },
      { id: 'sponsor', title: 'Potential Sponsor', fields: F.clientSimple },
      { id: 'event', title: 'Event Details', fields: F.event },
      { id: 'summary', title: 'Overview', fields: F.summary },
      { id: 'tiers', title: 'Sponsorship Tiers', fields: F.sponsorshipTiers },
      { id: 'whyUs', title: 'Why Sponsor', fields: F.whyUsSimple },
      { id: 'cta', title: 'Next Steps', fields: F.cta },
      { id: 'styling', title: 'Styling', fields: F.stylingSimple },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getProposalForm(type: ProposalType) {
  return proposalFormSchemas[type];
}

export function getProposalStep(type: ProposalType, stepId: string) {
  const form = proposalFormSchemas[type];
  return form?.steps.find((s) => s.id === stepId);
}

export function getProposalFields(type: ProposalType): string[] {
  const form = proposalFormSchemas[type];
  if (!form) return [];
  return form.steps.flatMap((step) => step.fields);
}

export function getProposalStepCount(type: ProposalType): number {
  return proposalFormSchemas[type]?.steps.length || 0;
}

export function getProposalTypes(): { value: ProposalType; label: string }[] {
  return [
    { value: ProposalType.BUSINESS, label: 'Business Proposal' },
    { value: ProposalType.PROJECT, label: 'Project Proposal' },
    { value: ProposalType.SALES, label: 'Sales Proposal' },
    { value: ProposalType.RESEARCH, label: 'Research Proposal' },
    { value: ProposalType.GRANT, label: 'Grant Proposal' },
    { value: ProposalType.SPONSORSHIP, label: 'Sponsorship Proposal' },
  ];
}

// ============================================================================
// AUTO-SUGGEST
// ============================================================================

export function suggestProposalType(context: {
  isAcademic?: boolean;
  isFunding?: boolean;
  isEvent?: boolean;
  isSelling?: boolean;
  isProject?: boolean;
  keywords?: string[];
}): ProposalType {
  const { isAcademic, isFunding, isEvent, isSelling, isProject, keywords = [] } = context;
  const kw = keywords.map((k) => k.toLowerCase()).join(' ');

  // Research
  if (isAcademic || kw.includes('research') || kw.includes('study') || kw.includes('hypothesis')) {
    return ProposalType.RESEARCH;
  }

  // Grant
  if (isFunding || kw.includes('grant') || kw.includes('funding') || kw.includes('ngo') || kw.includes('donation')) {
    return ProposalType.GRANT;
  }

  // Sponsorship
  if (isEvent || kw.includes('sponsor') || kw.includes('event') || kw.includes('conference')) {
    return ProposalType.SPONSORSHIP;
  }

  // Sales
  if (isSelling || kw.includes('sales') || kw.includes('offer') || kw.includes('discount') || kw.includes('buy')) {
    return ProposalType.SALES;
  }

  // Project
  if (isProject || kw.includes('project') || kw.includes('implementation') || kw.includes('milestone')) {
    return ProposalType.PROJECT;
  }

  // Default: Business
  return ProposalType.BUSINESS;
}

// ============================================================================
// FIELD ARRAYS EXPORT
// ============================================================================

export const proposalFieldArrays = F;