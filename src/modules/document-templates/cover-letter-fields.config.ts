// ═══════════════════════════════════════════════════════════════════════════
// SORIVA - COVER LETTER FIELDS CONFIGURATION (COMPREHENSIVE)
// Supports: Local Jobs → MNCs → International → Executive → Visa Applications
// "BUFFET STYLE" - Sab kuch available, user jo chahiye wo le!
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORTING INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface Achievement {
  title: string;
  metric?: string;
  context?: string;
  year?: string;
}

export interface KeyMetric {
  label: string;
  value: string;
  context?: string;
}

export interface Award {
  name: string;
  organization?: string;
  year?: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  year?: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Project {
  name: string;
  role?: string;
  description?: string;
  technologies?: string[];
  impact?: string;
  teamSize?: number;
  duration?: string;
}

export interface Internship {
  company: string;
  role: string;
  duration: string;
  description?: string;
  achievements?: string[];
}

export interface Publication {
  title: string;
  publisher?: string;
  year?: string;
  url?: string;
}

export interface Patent {
  title: string;
  patentNumber?: string;
  year?: string;
  status?: string;
}

export interface LanguageProficiency {
  language: string;
  level: LanguageLevel;
  certification?: string;
}

export interface Reference {
  name: string;
  designation?: string;
  company?: string;
  relationship?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS & TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CoverLetterStyle = 
  | 'modern'
  | 'classic'
  | 'creative'
  | 'minimal'
  | 'professional'
  | 'executive'
  | 'custom';

export type CareerLevel = 
  | 'fresher'
  | 'entry'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'manager'
  | 'director'
  | 'vp'
  | 'cxo';

export type JobType = 
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'freelance'
  | 'internship'
  | 'temporary';

export type WorkMode = 
  | 'onsite'
  | 'remote'
  | 'hybrid';

export type WorkAuthStatus = 
  | 'citizen'
  | 'permanent-resident'
  | 'work-visa'
  | 'student-visa'
  | 'requires-sponsorship'
  | 'other';

export type LanguageLevel = 
  | 'native'
  | 'fluent'
  | 'professional'
  | 'intermediate'
  | 'basic';

export type LetterLength = 
  | 'short'
  | 'standard'
  | 'detailed'
  | 'comprehensive';

export type LetterTone = 
  | 'formal'
  | 'professional'
  | 'friendly'
  | 'enthusiastic'
  | 'executive';

export type FieldCategory = 
  | 'personal'
  | 'recipient'
  | 'job'
  | 'content'
  | 'professional'
  | 'skills'
  | 'achievements'
  | 'leadership'
  | 'international'
  | 'compensation'
  | 'availability'
  | 'references'
  | 'additional'
  | 'settings';

export type FieldLevel = 
  | 'fresher'
  | 'entry'
  | 'mid'
  | 'senior'
  | 'executive'
  | 'international'
  | 'all';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COVER LETTER DATA INTERFACE - COMPREHENSIVE BUFFET!
// ─────────────────────────────────────────────────────────────────────────────

export interface CoverLetterData {
  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: PERSONAL INFORMATION
  // ═══════════════════════════════════════════════════════════════
  fullName: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  nationality?: string;
  
  // Online Presence
  linkedin?: string;
  portfolio?: string;
  website?: string;
  github?: string;
  twitter?: string;
  behance?: string;
  dribbble?: string;
  medium?: string;
  stackoverflow?: string;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: RECIPIENT/COMPANY INFORMATION
  // ═══════════════════════════════════════════════════════════════
  recipientName?: string;
  recipientTitle?: string;
  recipientEmail?: string;
  companyName: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyCountry?: string;
  companyPincode?: string;
  department?: string;
  companyWebsite?: string;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: JOB DETAILS
  // ═══════════════════════════════════════════════════════════════
  jobTitle: string;
  jobReference?: string;
  jobSource?: string;
  referredBy?: string;
  referrerDesignation?: string;
  referrerRelationship?: string;
  jobType?: JobType;
  workMode?: WorkMode;
  expectedJoiningDate?: string;
  noticePeriod?: string;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: LETTER DATE & FORMATTING
  // ═══════════════════════════════════════════════════════════════
  date?: string;
  salutation?: string;
  signOff?: string;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: LETTER CONTENT (Core)
  // ═══════════════════════════════════════════════════════════════
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: PROFESSIONAL BACKGROUND
  // ═══════════════════════════════════════════════════════════════
  yearsOfExperience?: number;
  currentRole?: string;
  currentCompany?: string;
  currentIndustry?: string;
  careerLevel?: CareerLevel;
  
  // Fresher Specific
  isFresher?: boolean;
  collegeName?: string;
  degree?: string;
  graduationYear?: string;
  cgpa?: string;
  relevantCoursework?: string[];
  internships?: Internship[];
  academicProjects?: Project[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7: SKILLS & EXPERTISE
  // ═══════════════════════════════════════════════════════════════
  keySkills?: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  tools?: string[];
  certifications?: Certification[];
  industryExpertise?: string[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8: ACHIEVEMENTS & METRICS (MNC Level)
  // ═══════════════════════════════════════════════════════════════
  achievements?: Achievement[];
  keyMetrics?: KeyMetric[];
  awards?: Award[];
  publications?: Publication[];
  patents?: Patent[];
  speakingEngagements?: string[];

  // ═══════════════════════════════════════════════════════════════
  // SECTION 9: LEADERSHIP & MANAGEMENT (Senior/Executive)
  // ═══════════════════════════════════════════════════════════════
  teamSize?: number;
  directReports?: number;
  budgetManaged?: string;
  revenueGenerated?: string;
  costSavings?: string;
  projectsLed?: Project[];
  departmentsManaged?: string[];
  strategicInitiatives?: string[];
  boardExperience?: string;
  pnlResponsibility?: string;
  transformationLed?: string[];
  mergerAcquisitionExp?: string;
  
  // ═══════════════════════════════════════════════════════════════
  // SECTION 10: INTERNATIONAL & VISA (Foreign Jobs)
  // ═══════════════════════════════════════════════════════════════
  currentVisaStatus?: string;
  visaType?: string;
  workAuthorizationStatus?: WorkAuthStatus;
  requiresSponsorship?: boolean;
  sponsorshipDetails?: string;
  
  willingToRelocate?: boolean;
  relocationTimeline?: string;
  relocationPreferences?: string[];
  currentLocation?: string;
  targetLocation?: string;
  
  countriesWorkedIn?: string[];
  internationalClients?: string[];
  crossCulturalExperience?: string;
  globalTeamExperience?: string;
  timezonesWorkedAcross?: string[];
  
  languages?: LanguageProficiency[];
  englishProficiency?: LanguageLevel;
  ieltsScore?: string;
  toeflScore?: string;
  pteScore?: string;
  otherLanguageTests?: string;
  
  countrySpecificCerts?: string[];
  localMarketKnowledge?: string;
  regulatoryKnowledge?: string[];
  
  // ═══════════════════════════════════════════════════════════════
  // SECTION 11: COMPENSATION & EXPECTATIONS
  // ═══════════════════════════════════════════════════════════════
  currentSalary?: string;
  expectedSalary?: string;
  salaryCurrency?: string;
  salaryNegotiable?: boolean;
  benefitsExpected?: string[];
  equityExpectation?: string;
  relocationPackage?: boolean;
  signingBonus?: boolean;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 12: AVAILABILITY & LOGISTICS
  // ═══════════════════════════════════════════════════════════════
  availableFrom?: string;
  interviewAvailability?: string;
  preferredInterviewMode?: string;
  timezone?: string;
  travelWillingness?: string;
  travelPercentage?: string;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 13: REFERENCES
  // ═══════════════════════════════════════════════════════════════
  references?: Reference[];
  referencesAvailable?: boolean;
  linkedinRecommendations?: number;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 14: ADDITIONAL INFORMATION
  // ═══════════════════════════════════════════════════════════════
  whyThisCompany?: string;
  whyThisRole?: string;
  whyThisCountry?: string;
  uniqueValue?: string;
  careerGoals?: string;
  personalStatement?: string;
  diversityStatement?: string;
  volunteerWork?: string[];
  hobbiesRelevant?: string[];
  additionalInfo?: string;

  // ═══════════════════════════════════════════════════════════════
  // SECTION 15: TEMPLATE SETTINGS
  // ═══════════════════════════════════════════════════════════════
  templateStyle?: CoverLetterStyle;
  accentColor?: string;
  showLetterhead?: boolean;
  showRecipientAddress?: boolean;
  showDate?: boolean;
  showSignature?: boolean;
  showSkillsSection?: boolean;
  showAchievements?: boolean;
  showMetrics?: boolean;
  letterLength?: LetterLength;
  tone?: LetterTone;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD DEFINITION INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldDefinition {
  key: string;
  label: string;
  labelHi: string;
  type: 'text' | 'email' | 'phone' | 'url' | 'date' | 'textarea' | 'array' | 'select' | 'number' | 'boolean' | 'object';
  required: boolean;
  category: FieldCategory;
  level: FieldLevel[];
  placeholder?: string;
  placeholderHi?: string;
  validation?: string;
  maxLength?: number;
  options?: string[];
  hint?: string;
  hintHi?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// PART 2 CONTINUES IN NEXT SECTION - Field Definitions, Utils, Sample Data
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// SORIVA - COVER LETTER FIELDS CONFIGURATION - PART 2
// Field Definitions, Utility Functions, Sample Data
// ══════════════════════════════════════════════════════════════════════════════

// NOTE: Import types from Part 1 or combine both files
// import { FieldDefinition, FieldCategory, FieldLevel, CoverLetterData, ... } from './cover-letter-config-part1';

// ─────────────────────────────────────────────────────────────────────────────
// FIELD DEFINITIONS - COMPREHENSIVE BUFFET!
// User jitna data de, utna render ho!
// ─────────────────────────────────────────────────────────────────────────────

export const COVER_LETTER_FIELDS: FieldDefinition[] = [
  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: PERSONAL INFORMATION
  // ═══════════════════════════════════════════════════════════════
  { key: 'fullName', label: 'Full Name', labelHi: 'पूरा नाम', type: 'text', required: true, category: 'personal', level: ['all'], placeholder: 'Aman Sharma', placeholderHi: 'अमन शर्मा', maxLength: 100 },
  { key: 'email', label: 'Email Address', labelHi: 'ईमेल पता', type: 'email', required: false, category: 'personal', level: ['all'], placeholder: 'aman@example.com', validation: 'email' },
  { key: 'phone', label: 'Phone Number', labelHi: 'फ़ोन नंबर', type: 'phone', required: false, category: 'personal', level: ['all'], placeholder: '+91 98765 43210' },
  { key: 'alternatePhone', label: 'Alternate Phone', labelHi: 'वैकल्पिक फ़ोन', type: 'phone', required: false, category: 'personal', level: ['senior', 'executive', 'international'], placeholder: '+91 98765 43211' },
  { key: 'address', label: 'Address', labelHi: 'पता', type: 'text', required: false, category: 'personal', level: ['all'], placeholder: '123, Tech Colony' },
  { key: 'city', label: 'City', labelHi: 'शहर', type: 'text', required: false, category: 'personal', level: ['all'], placeholder: 'Bangalore' },
  { key: 'state', label: 'State', labelHi: 'राज्य', type: 'text', required: false, category: 'personal', level: ['all'], placeholder: 'Karnataka' },
  { key: 'pincode', label: 'Pincode', labelHi: 'पिनकोड', type: 'text', required: false, category: 'personal', level: ['all'], placeholder: '560001' },
  { key: 'country', label: 'Country', labelHi: 'देश', type: 'text', required: false, category: 'personal', level: ['international'], placeholder: 'India' },
  { key: 'nationality', label: 'Nationality', labelHi: 'राष्ट्रीयता', type: 'text', required: false, category: 'personal', level: ['international'], placeholder: 'Indian' },
  
  // Online Presence
  { key: 'linkedin', label: 'LinkedIn Profile', labelHi: 'लिंक्डइन', type: 'url', required: false, category: 'personal', level: ['all'], placeholder: 'linkedin.com/in/amandev' },
  { key: 'portfolio', label: 'Portfolio Website', labelHi: 'पोर्टफोलियो', type: 'url', required: false, category: 'personal', level: ['all'], placeholder: 'amansharma.dev' },
  { key: 'github', label: 'GitHub Profile', labelHi: 'गिटहब', type: 'url', required: false, category: 'personal', level: ['all'], placeholder: 'github.com/amandev', hint: 'For tech roles', hintHi: 'टेक रोल्स के लिए' },
  { key: 'behance', label: 'Behance Portfolio', labelHi: 'बिहांस', type: 'url', required: false, category: 'personal', level: ['all'], placeholder: 'behance.net/amandesign', hint: 'For designers', hintHi: 'डिजाइनर्स के लिए' },
  { key: 'dribbble', label: 'Dribbble Profile', labelHi: 'ड्रिबल', type: 'url', required: false, category: 'personal', level: ['all'], placeholder: 'dribbble.com/amanui', hint: 'For UI/UX designers', hintHi: 'UI/UX डिजाइनर्स के लिए' },
  { key: 'stackoverflow', label: 'StackOverflow', labelHi: 'स्टैकओवरफ्लो', type: 'url', required: false, category: 'personal', level: ['all'], placeholder: 'stackoverflow.com/users/123456', hint: 'For developers', hintHi: 'डेवलपर्स के लिए' },
  { key: 'medium', label: 'Medium Profile', labelHi: 'मीडियम', type: 'url', required: false, category: 'personal', level: ['all'], placeholder: 'medium.com/@aman', hint: 'For writers/bloggers', hintHi: 'लेखकों के लिए' },
  { key: 'twitter', label: 'Twitter/X Profile', labelHi: 'ट्विटर', type: 'url', required: false, category: 'personal', level: ['senior', 'executive'], placeholder: 'twitter.com/amantech' },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: RECIPIENT/COMPANY INFORMATION
  // ═══════════════════════════════════════════════════════════════
  { key: 'recipientName', label: 'Hiring Manager Name', labelHi: 'हायरिंग मैनेजर का नाम', type: 'text', required: false, category: 'recipient', level: ['all'], placeholder: 'Ms. Priya Patel', hint: 'Leave blank if unknown', hintHi: 'पता नहीं तो खाली छोड़ें' },
  { key: 'recipientTitle', label: 'Recipient Title', labelHi: 'प्राप्तकर्ता का पद', type: 'text', required: false, category: 'recipient', level: ['all'], placeholder: 'HR Manager / Director of Engineering' },
  { key: 'recipientEmail', label: 'Recipient Email', labelHi: 'प्राप्तकर्ता ईमेल', type: 'email', required: false, category: 'recipient', level: ['senior', 'executive'], placeholder: 'priya.patel@company.com' },
  { key: 'companyName', label: 'Company Name', labelHi: 'कंपनी का नाम', type: 'text', required: true, category: 'recipient', level: ['all'], placeholder: 'Microsoft / Google / TCS / Infosys' },
  { key: 'companyAddress', label: 'Company Address', labelHi: 'कंपनी का पता', type: 'text', required: false, category: 'recipient', level: ['all'], placeholder: 'Tower B, Tech Park, Whitefield' },
  { key: 'companyCity', label: 'Company City', labelHi: 'कंपनी का शहर', type: 'text', required: false, category: 'recipient', level: ['all'], placeholder: 'Bangalore' },
  { key: 'companyState', label: 'Company State', labelHi: 'कंपनी का राज्य', type: 'text', required: false, category: 'recipient', level: ['all'], placeholder: 'Karnataka' },
  { key: 'companyCountry', label: 'Company Country', labelHi: 'कंपनी का देश', type: 'text', required: false, category: 'recipient', level: ['international'], placeholder: 'United States / Germany / UK' },
  { key: 'companyPincode', label: 'Company Pincode', labelHi: 'कंपनी पिनकोड', type: 'text', required: false, category: 'recipient', level: ['all'], placeholder: '560066' },
  { key: 'department', label: 'Department', labelHi: 'विभाग', type: 'text', required: false, category: 'recipient', level: ['all'], placeholder: 'Engineering / Marketing / Finance / HR' },
  { key: 'companyWebsite', label: 'Company Website', labelHi: 'कंपनी वेबसाइट', type: 'url', required: false, category: 'recipient', level: ['all'], placeholder: 'www.company.com' },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: JOB DETAILS
  // ═══════════════════════════════════════════════════════════════
  { key: 'jobTitle', label: 'Job Title', labelHi: 'जॉब का पद', type: 'text', required: true, category: 'job', level: ['all'], placeholder: 'Senior Software Engineer / Product Manager' },
  { key: 'jobReference', label: 'Job Reference/ID', labelHi: 'जॉब रेफरेंस/आईडी', type: 'text', required: false, category: 'job', level: ['all'], placeholder: 'JOB-2024-1234 / REQ-567890', hint: 'If mentioned in job posting', hintHi: 'जॉब पोस्टिंग में दिया हो तो' },
  { key: 'jobSource', label: 'How did you find this job?', labelHi: 'जॉब कैसे मिली?', type: 'select', required: false, category: 'job', level: ['all'], options: ['LinkedIn', 'Company Website', 'Naukri.com', 'Indeed', 'Glassdoor', 'AngelList', 'Wellfound', 'Referral', 'Campus Placement', 'Job Fair', 'Recruiter', 'Newspaper', 'Other'] },
  { key: 'referredBy', label: 'Referred By', labelHi: 'किसने रेफर किया', type: 'text', required: false, category: 'job', level: ['all'], placeholder: 'Rahul Kumar', hint: 'Name of person who referred you', hintHi: 'रेफर करने वाले का नाम' },
  { key: 'referrerDesignation', label: 'Referrer Designation', labelHi: 'रेफरर का पद', type: 'text', required: false, category: 'job', level: ['mid', 'senior', 'executive'], placeholder: 'Senior Director at Microsoft' },
  { key: 'referrerRelationship', label: 'Relationship with Referrer', labelHi: 'रेफरर से संबंध', type: 'text', required: false, category: 'job', level: ['mid', 'senior', 'executive'], placeholder: 'Former colleague / College friend / Manager' },
  { key: 'jobType', label: 'Job Type', labelHi: 'जॉब का प्रकार', type: 'select', required: false, category: 'job', level: ['all'], options: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary', 'Consulting'] },
  { key: 'workMode', label: 'Work Mode', labelHi: 'कार्य मोड', type: 'select', required: false, category: 'job', level: ['all'], options: ['On-site', 'Remote', 'Hybrid', 'Flexible'] },
  { key: 'expectedJoiningDate', label: 'Expected Joining Date', labelHi: 'संभावित जॉइनिंग तारीख', type: 'text', required: false, category: 'job', level: ['all'], placeholder: 'January 15, 2025 / Immediately' },
  { key: 'noticePeriod', label: 'Notice Period', labelHi: 'नोटिस पीरियड', type: 'text', required: false, category: 'job', level: ['mid', 'senior', 'executive'], placeholder: '30 days / 60 days / 90 days / Immediate / Negotiable' },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: LETTER CONTENT (Core)
  // ═══════════════════════════════════════════════════════════════
  { key: 'date', label: 'Letter Date', labelHi: 'पत्र की तारीख', type: 'date', required: false, category: 'content', level: ['all'], hint: 'Defaults to today', hintHi: 'डिफ़ॉल्ट आज की तारीख' },
  { key: 'salutation', label: 'Salutation', labelHi: 'अभिवादन', type: 'text', required: false, category: 'content', level: ['all'], placeholder: 'Dear Ms. Patel / Dear Hiring Manager', hint: 'Auto-generated if blank', hintHi: 'खाली छोड़ें तो ऑटो बनेगा' },
  { key: 'openingParagraph', label: 'Opening Paragraph', labelHi: 'शुरुआती पैराग्राफ', type: 'textarea', required: true, category: 'content', level: ['all'], placeholder: 'I am writing to express my strong interest in the [Position] at [Company]...', placeholderHi: 'मैं [कंपनी] में [पद] के लिए अपनी रुचि व्यक्त करने के लिए लिख रहा हूं...', hint: 'Why you are interested in this role?', hintHi: 'आप इस रोल में क्यों रुचि रखते हैं?', maxLength: 800 },
  { key: 'bodyParagraphs', label: 'Body Paragraphs', labelHi: 'मुख्य पैराग्राफ', type: 'array', required: true, category: 'content', level: ['all'], hint: 'Your experience, skills, achievements (2-5 paragraphs based on letter length)', hintHi: 'आपका अनुभव, कौशल, उपलब्धियां (2-5 पैराग्राफ)' },
  { key: 'closingParagraph', label: 'Closing Paragraph', labelHi: 'समापन पैराग्राफ', type: 'textarea', required: true, category: 'content', level: ['all'], placeholder: 'I would welcome the opportunity to discuss how my experience can benefit your team...', placeholderHi: 'मैं चर्चा करने के अवसर का स्वागत करूंगा...', hint: 'Call to action and thank you', hintHi: 'कार्रवाई का अनुरोध और धन्यवाद', maxLength: 600 },
  { key: 'signOff', label: 'Sign Off', labelHi: 'समापन अभिवादन', type: 'select', required: false, category: 'content', level: ['all'], options: ['Sincerely', 'Best regards', 'Kind regards', 'Respectfully', 'Warm regards', 'Thank you', 'Yours faithfully', 'Yours sincerely', 'With appreciation', 'Regards'] },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: PROFESSIONAL BACKGROUND
  // ═══════════════════════════════════════════════════════════════
  { key: 'yearsOfExperience', label: 'Total Years of Experience', labelHi: 'कुल अनुभव के वर्ष', type: 'number', required: false, category: 'professional', level: ['all'], placeholder: '5' },
  { key: 'currentRole', label: 'Current Role/Designation', labelHi: 'वर्तमान पद', type: 'text', required: false, category: 'professional', level: ['all'], placeholder: 'Senior Software Engineer / Product Manager' },
  { key: 'currentCompany', label: 'Current Company', labelHi: 'वर्तमान कंपनी', type: 'text', required: false, category: 'professional', level: ['all'], placeholder: 'ABC Technologies / Infosys / TCS' },
  { key: 'currentIndustry', label: 'Current Industry', labelHi: 'वर्तमान उद्योग', type: 'text', required: false, category: 'professional', level: ['mid', 'senior', 'executive'], placeholder: 'Information Technology / BFSI / Healthcare / E-commerce' },
  { key: 'careerLevel', label: 'Career Level', labelHi: 'करियर स्तर', type: 'select', required: false, category: 'professional', level: ['all'], options: ['Fresher', 'Entry Level (0-2 yrs)', 'Junior (2-4 yrs)', 'Mid Level (4-7 yrs)', 'Senior (7-10 yrs)', 'Lead/Principal (10-15 yrs)', 'Manager', 'Senior Manager', 'Director', 'VP', 'C-Level Executive'] },

  // Fresher Specific Fields
  { key: 'isFresher', label: 'Are you a Fresher?', labelHi: 'क्या आप फ्रेशर हैं?', type: 'boolean', required: false, category: 'professional', level: ['fresher', 'entry'] },
  { key: 'collegeName', label: 'College/University Name', labelHi: 'कॉलेज/विश्वविद्यालय का नाम', type: 'text', required: false, category: 'professional', level: ['fresher', 'entry'], placeholder: 'IIT Delhi / IIM Ahmedabad / Delhi University / BITS Pilani' },
  { key: 'degree', label: 'Degree/Qualification', labelHi: 'डिग्री/योग्यता', type: 'text', required: false, category: 'professional', level: ['fresher', 'entry'], placeholder: 'B.Tech in Computer Science / MBA / M.Sc Physics' },
  { key: 'graduationYear', label: 'Graduation Year', labelHi: 'स्नातक वर्ष', type: 'text', required: false, category: 'professional', level: ['fresher', 'entry'], placeholder: '2024' },
  { key: 'cgpa', label: 'CGPA/Percentage', labelHi: 'सीजीपीए/प्रतिशत', type: 'text', required: false, category: 'professional', level: ['fresher', 'entry'], placeholder: '8.5 CGPA / 85% / First Class with Distinction' },
  { key: 'relevantCoursework', label: 'Relevant Coursework', labelHi: 'प्रासंगिक पाठ्यक्रम', type: 'array', required: false, category: 'professional', level: ['fresher', 'entry'], hint: 'Courses relevant to this job', hintHi: 'इस जॉब से संबंधित कोर्स' },
  { key: 'internships', label: 'Internships', labelHi: 'इंटर्नशिप', type: 'array', required: false, category: 'professional', level: ['fresher', 'entry'], hint: 'Previous internship experiences', hintHi: 'पिछले इंटर्नशिप अनुभव' },
  { key: 'academicProjects', label: 'Academic Projects', labelHi: 'अकादमिक प्रोजेक्ट्स', type: 'array', required: false, category: 'professional', level: ['fresher', 'entry'], hint: 'Major projects from college', hintHi: 'कॉलेज के प्रमुख प्रोजेक्ट्स' },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: SKILLS & EXPERTISE
  // ═══════════════════════════════════════════════════════════════
  { key: 'keySkills', label: 'Key Skills to Highlight', labelHi: 'मुख्य कौशल', type: 'array', required: false, category: 'skills', level: ['all'], hint: 'Top 3-6 most relevant skills for this role', hintHi: 'इस रोल के लिए 3-6 सबसे महत्वपूर्ण कौशल' },
  { key: 'technicalSkills', label: 'Technical Skills', labelHi: 'तकनीकी कौशल', type: 'array', required: false, category: 'skills', level: ['all'], hint: 'Programming, frameworks, databases, tools', hintHi: 'प्रोग्रामिंग, फ्रेमवर्क, डेटाबेस, टूल्स' },
  { key: 'softSkills', label: 'Soft Skills', labelHi: 'सॉफ्ट स्किल्स', type: 'array', required: false, category: 'skills', level: ['all'], hint: 'Leadership, communication, problem-solving', hintHi: 'नेतृत्व, संचार, समस्या समाधान' },
  { key: 'tools', label: 'Tools & Software', labelHi: 'टूल्स और सॉफ्टवेयर', type: 'array', required: false, category: 'skills', level: ['all'], hint: 'Jira, Figma, SAP, Salesforce, etc.', hintHi: 'जीरा, फिगमा, SAP, सेल्सफोर्स आदि' },
  { key: 'certifications', label: 'Certifications', labelHi: 'प्रमाणपत्र', type: 'array', required: false, category: 'skills', level: ['all'], hint: 'AWS, Azure, PMP, CFA, Google, etc.', hintHi: 'AWS, Azure, PMP, CFA, Google आदि' },
  { key: 'industryExpertise', label: 'Industry Expertise', labelHi: 'उद्योग विशेषज्ञता', type: 'array', required: false, category: 'skills', level: ['mid', 'senior', 'executive'], hint: 'Specific industry knowledge', hintHi: 'विशिष्ट उद्योग ज्ञान' },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7: ACHIEVEMENTS & METRICS (MNC Level)
  // ═══════════════════════════════════════════════════════════════
  { key: 'achievements', label: 'Key Achievements', labelHi: 'मुख्य उपलब्धियां', type: 'array', required: false, category: 'achievements', level: ['mid', 'senior', 'executive'], hint: 'Quantifiable achievements with numbers/metrics', hintHi: 'नंबर्स/मेट्रिक्स के साथ मापने योग्य उपलब्धियां' },
  { key: 'keyMetrics', label: 'Key Performance Metrics', labelHi: 'प्रमुख प्रदर्शन मेट्रिक्स', type: 'array', required: false, category: 'achievements', level: ['senior', 'executive'], hint: 'Revenue +40%, Cost -30%, Users +200%', hintHi: 'राजस्व +40%, लागत -30%, यूजर्स +200%' },
  { key: 'awards', label: 'Awards & Recognition', labelHi: 'पुरस्कार और सम्मान', type: 'array', required: false, category: 'achievements', level: ['mid', 'senior', 'executive'], hint: 'Employee of Year, Best Innovation, Patents', hintHi: 'वर्ष के कर्मचारी, सर्वश्रेष्ठ नवाचार, पेटेंट' },
  { key: 'publications', label: 'Publications', labelHi: 'प्रकाशन', type: 'array', required: false, category: 'achievements', level: ['senior', 'executive'], hint: 'Research papers, articles, books', hintHi: 'शोध पत्र, लेख, पुस्तकें' },
  { key: 'patents', label: 'Patents', labelHi: 'पेटेंट', type: 'array', required: false, category: 'achievements', level: ['senior', 'executive'], hint: 'Filed or granted patents', hintHi: 'दायर या प्राप्त पेटेंट' },
  { key: 'speakingEngagements', label: 'Speaking Engagements', labelHi: 'वक्तव्य/प्रस्तुतियां', type: 'array', required: false, category: 'achievements', level: ['senior', 'executive'], hint: 'Conferences, webinars, podcasts', hintHi: 'कॉन्फ्रेंस, वेबिनार, पॉडकास्ट' },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8: LEADERSHIP & MANAGEMENT (Senior/Executive)
  // ═══════════════════════════════════════════════════════════════
  { key: 'teamSize', label: 'Team Size Managed', labelHi: 'टीम का आकार', type: 'number', required: false, category: 'leadership', level: ['senior', 'executive'], placeholder: '25', hint: 'Total team members you manage', hintHi: 'कुल टीम सदस्य जिन्हें आप मैनेज करते हैं' },
  { key: 'directReports', label: 'Direct Reports', labelHi: 'डायरेक्ट रिपोर्ट्स', type: 'number', required: false, category: 'leadership', level: ['senior', 'executive'], placeholder: '8', hint: 'People reporting directly to you', hintHi: 'सीधे आपको रिपोर्ट करने वाले' },
  { key: 'budgetManaged', label: 'Budget Managed', labelHi: 'प्रबंधित बजट', type: 'text', required: false, category: 'leadership', level: ['senior', 'executive'], placeholder: '$5M annually / ₹25 Crore', hint: 'Annual budget responsibility', hintHi: 'वार्षिक बजट जिम्मेदारी' },
  { key: 'revenueGenerated', label: 'Revenue Generated/Influenced', labelHi: 'उत्पन्न/प्रभावित राजस्व', type: 'text', required: false, category: 'leadership', level: ['senior', 'executive'], placeholder: '$20M / ₹100 Crore', hint: 'Revenue you directly impacted', hintHi: 'राजस्व जिसे आपने सीधे प्रभावित किया' },
  { key: 'costSavings', label: 'Cost Savings Delivered', labelHi: 'लागत बचत', type: 'text', required: false, category: 'leadership', level: ['senior', 'executive'], placeholder: '$2M / 30% reduction', hint: 'Cost optimizations achieved', hintHi: 'लागत अनुकूलन उपलब्धियां' },
  { key: 'projectsLed', label: 'Major Projects Led', labelHi: 'प्रमुख प्रोजेक्ट्स', type: 'array', required: false, category: 'leadership', level: ['senior', 'executive'], hint: 'Key projects you led end-to-end', hintHi: 'प्रमुख प्रोजेक्ट्स जो आपने लीड किए' },
  { key: 'departmentsManaged', label: 'Departments Managed', labelHi: 'प्रबंधित विभाग', type: 'array', required: false, category: 'leadership', level: ['executive'], hint: 'Engineering, Product, Design, etc.', hintHi: 'इंजीनियरिंग, प्रोडक्ट, डिजाइन आदि' },
  { key: 'strategicInitiatives', label: 'Strategic Initiatives', labelHi: 'रणनीतिक पहल', type: 'array', required: false, category: 'leadership', level: ['executive'], hint: 'Digital transformation, market expansion', hintHi: 'डिजिटल ट्रांसफॉर्मेशन, बाजार विस्तार' },
  { key: 'boardExperience', label: 'Board Experience', labelHi: 'बोर्ड अनुभव', type: 'textarea', required: false, category: 'leadership', level: ['executive'], hint: 'Board memberships, advisory roles', hintHi: 'बोर्ड सदस्यता, सलाहकार भूमिकाएं' },
  { key: 'pnlResponsibility', label: 'P&L Responsibility', labelHi: 'P&L जिम्मेदारी', type: 'text', required: false, category: 'leadership', level: ['executive'], placeholder: '$100M P&L / Full business unit', hint: 'Profit & Loss accountability', hintHi: 'लाभ और हानि जवाबदेही' },
  { key: 'transformationLed', label: 'Transformations Led', labelHi: 'नेतृत्व किए गए परिवर्तन', type: 'array', required: false, category: 'leadership', level: ['executive'], hint: 'Org restructuring, tech modernization', hintHi: 'संगठन पुनर्गठन, तकनीक आधुनिकीकरण' },
  { key: 'mergerAcquisitionExp', label: 'M&A Experience', labelHi: 'विलय/अधिग्रहण अनुभव', type: 'textarea', required: false, category: 'leadership', level: ['executive'], hint: 'Mergers, acquisitions, integrations', hintHi: 'विलय, अधिग्रहण, एकीकरण' },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 9: INTERNATIONAL & VISA (Foreign Jobs)
  // ═══════════════════════════════════════════════════════════════
  { key: 'workAuthorizationStatus', label: 'Work Authorization', labelHi: 'कार्य प्राधिकरण', type: 'select', required: false, category: 'international', level: ['international'], options: ['Citizen', 'Permanent Resident (PR/Green Card)', 'Work Visa (H1B/L1/etc.)', 'Student Visa (F1/OPT/CPT)', 'Dependent Visa', 'Requires Sponsorship', 'Other'] },
  { key: 'currentVisaStatus', label: 'Current Visa Status', labelHi: 'वर्तमान वीजा स्थिति', type: 'text', required: false, category: 'international', level: ['international'], placeholder: 'H1B valid till 2027 / No visa currently', hint: 'Your current immigration status', hintHi: 'आपकी वर्तमान आव्रजन स्थिति' },
  { key: 'visaType', label: 'Visa Type Needed', labelHi: 'आवश्यक वीजा प्रकार', type: 'text', required: false, category: 'international', level: ['international'], placeholder: 'H1B / L1 / Skilled Worker Visa / Blue Card' },
  { key: 'requiresSponsorship', label: 'Requires Visa Sponsorship?', labelHi: 'वीजा स्पॉन्सरशिप चाहिए?', type: 'boolean', required: false, category: 'international', level: ['international'] },
  { key: 'sponsorshipDetails', label: 'Sponsorship Details', labelHi: 'स्पॉन्सरशिप विवरण', type: 'textarea', required: false, category: 'international', level: ['international'], hint: 'Explain your visa needs and timeline', hintHi: 'अपनी वीजा जरूरतों और समयसीमा की व्याख्या करें', maxLength: 500 },
  { key: 'willingToRelocate', label: 'Willing to Relocate?', labelHi: 'रिलोकेट करने को तैयार?', type: 'boolean', required: false, category: 'international', level: ['international'] },
  { key: 'relocationTimeline', label: 'Relocation Timeline', labelHi: 'रिलोकेशन समयसीमा', type: 'text', required: false, category: 'international', level: ['international'], placeholder: 'Immediately / Within 3 months / After visa approval' },
  { key: 'relocationPreferences', label: 'Relocation Preferences', labelHi: 'रिलोकेशन प्राथमिकताएं', type: 'array', required: false, category: 'international', level: ['international'], hint: 'Preferred cities/regions', hintHi: 'पसंदीदा शहर/क्षेत्र' },
  { key: 'currentLocation', label: 'Current Location', labelHi: 'वर्तमान स्थान', type: 'text', required: false, category: 'international', level: ['international'], placeholder: 'Bangalore, India' },
  { key: 'targetLocation', label: 'Target Location', labelHi: 'लक्ष्य स्थान', type: 'text', required: false, category: 'international', level: ['international'], placeholder: 'San Francisco Bay Area / London / Berlin' },
  { key: 'countriesWorkedIn', label: 'Countries Worked In', labelHi: 'जिन देशों में काम किया', type: 'array', required: false, category: 'international', level: ['international'], hint: 'Countries with work experience', hintHi: 'कार्य अनुभव वाले देश' },
  { key: 'internationalClients', label: 'International Clients Served', labelHi: 'अंतर्राष्ट्रीय क्लाइंट्स', type: 'array', required: false, category: 'international', level: ['international'], hint: 'Global clients you have worked with', hintHi: 'जिन वैश्विक क्लाइंट्स के साथ काम किया' },
  { key: 'crossCulturalExperience', label: 'Cross-Cultural Experience', labelHi: 'क्रॉस-कल्चरल अनुभव', type: 'textarea', required: false, category: 'international', level: ['international'], hint: 'Experience working across cultures', hintHi: 'विभिन्न संस्कृतियों में काम करने का अनुभव' },
  { key: 'globalTeamExperience', label: 'Global Team Experience', labelHi: 'वैश्विक टीम अनुभव', type: 'textarea', required: false, category: 'international', level: ['international'], hint: 'Distributed teams, multiple time zones', hintHi: 'वितरित टीमें, कई समय क्षेत्र' },
  { key: 'timezonesWorkedAcross', label: 'Time Zones Worked Across', labelHi: 'टाइमज़ोन अनुभव', type: 'array', required: false, category: 'international', level: ['international'], hint: 'IST, PST, EST, GMT, CET, etc.', hintHi: 'IST, PST, EST, GMT, CET आदि' },
  
  // Language Proficiency
  { key: 'languages', label: 'Language Proficiency', labelHi: 'भाषा प्रवीणता', type: 'array', required: false, category: 'international', level: ['international'], hint: 'Languages with proficiency level', hintHi: 'प्रवीणता स्तर के साथ भाषाएं' },
  { key: 'englishProficiency', label: 'English Proficiency', labelHi: 'अंग्रेजी प्रवीणता', type: 'select', required: false, category: 'international', level: ['international'], options: ['Native', 'Fluent/Bilingual', 'Professional Working', 'Intermediate', 'Basic'] },
  { key: 'ieltsScore', label: 'IELTS Score', labelHi: 'आईईएलटीएस स्कोर', type: 'text', required: false, category: 'international', level: ['international'], placeholder: 'Overall: 7.5 (L:8, R:7.5, W:7, S:7.5)', hint: 'Include band scores', hintHi: 'बैंड स्कोर शामिल करें' },
  { key: 'toeflScore', label: 'TOEFL Score', labelHi: 'टोफेल स्कोर', type: 'text', required: false, category: 'international', level: ['international'], placeholder: '105/120 (R:28, L:27, S:25, W:25)' },
  { key: 'pteScore', label: 'PTE Score', labelHi: 'पीटीई स्कोर', type: 'text', required: false, category: 'international', level: ['international'], placeholder: 'Overall: 75 (L:80, R:72, S:70, W:78)' },
  { key: 'otherLanguageTests', label: 'Other Language Tests', labelHi: 'अन्य भाषा परीक्षा', type: 'text', required: false, category: 'international', level: ['international'], placeholder: 'Duolingo 130, CELPIP 10, TEF B2', hint: 'Other language certifications', hintHi: 'अन्य भाषा प्रमाणपत्र' },
  
  // Country Specific
  { key: 'countrySpecificCerts', label: 'Country-Specific Certifications', labelHi: 'देश-विशिष्ट प्रमाणपत्र', type: 'array', required: false, category: 'international', level: ['international'], hint: 'UK NARIC, WES evaluation, etc.', hintHi: 'UK NARIC, WES मूल्यांकन आदि' },
  { key: 'localMarketKnowledge', label: 'Local Market Knowledge', labelHi: 'स्थानीय बाजार ज्ञान', type: 'textarea', required: false, category: 'international', level: ['international'], hint: 'Knowledge of target country market', hintHi: 'लक्ष्य देश के बाजार का ज्ञान' },
  { key: 'regulatoryKnowledge', label: 'Regulatory Knowledge', labelHi: 'नियामक ज्ञान', type: 'array', required: false, category: 'international', level: ['international'], hint: 'GDPR, HIPAA, SOX, FDA, etc.', hintHi: 'GDPR, HIPAA, SOX, FDA आदि' },
  { key: 'whyThisCountry', label: 'Why This Country?', labelHi: 'यह देश क्यों?', type: 'textarea', required: false, category: 'international', level: ['international'], hint: 'Why you want to work in this country', hintHi: 'आप इस देश में क्यों काम करना चाहते हैं', maxLength: 600 },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 10: COMPENSATION & EXPECTATIONS
  // ═══════════════════════════════════════════════════════════════
  { key: 'currentSalary', label: 'Current Salary (CTC)', labelHi: 'वर्तमान वेतन (सीटीसी)', type: 'text', required: false, category: 'compensation', level: ['mid', 'senior', 'executive'], placeholder: '₹25 LPA / $120,000 / €80,000' },
  { key: 'expectedSalary', label: 'Expected Salary', labelHi: 'अपेक्षित वेतन', type: 'text', required: false, category: 'compensation', level: ['mid', 'senior', 'executive'], placeholder: '₹35-40 LPA / $150,000-170,000' },
  { key: 'salaryCurrency', label: 'Salary Currency', labelHi: 'वेतन मुद्रा', type: 'select', required: false, category: 'compensation', level: ['international'], options: ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AUD (A$)', 'CAD (C$)', 'SGD (S$)', 'AED (د.إ)', 'Other'] },
  { key: 'salaryNegotiable', label: 'Salary Negotiable?', labelHi: 'वेतन पर बातचीत?', type: 'boolean', required: false, category: 'compensation', level: ['mid', 'senior', 'executive'] },
  { key: 'benefitsExpected', label: 'Benefits Expected', labelHi: 'अपेक्षित लाभ', type: 'array', required: false, category: 'compensation', level: ['senior', 'executive'], hint: 'Health insurance, stock options, etc.', hintHi: 'स्वास्थ्य बीमा, स्टॉक ऑप्शन आदि' },
  { key: 'equityExpectation', label: 'Equity/Stock Expectation', labelHi: 'इक्विटी/स्टॉक अपेक्षा', type: 'text', required: false, category: 'compensation', level: ['senior', 'executive'], placeholder: '0.5% equity / 50,000 RSUs' },
  { key: 'relocationPackage', label: 'Expecting Relocation Package?', labelHi: 'रिलोकेशन पैकेज चाहिए?', type: 'boolean', required: false, category: 'compensation', level: ['senior', 'executive', 'international'] },
  { key: 'signingBonus', label: 'Expecting Signing Bonus?', labelHi: 'साइनिंग बोनस चाहिए?', type: 'boolean', required: false, category: 'compensation', level: ['senior', 'executive'] },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 11: AVAILABILITY & LOGISTICS
  // ═══════════════════════════════════════════════════════════════
  { key: 'availableFrom', label: 'Available From', labelHi: 'कब से उपलब्ध', type: 'text', required: false, category: 'availability', level: ['all'], placeholder: 'Immediately / January 15, 2025 / After 60 days notice' },
  { key: 'interviewAvailability', label: 'Interview Availability', labelHi: 'इंटरव्यू उपलब्धता', type: 'text', required: false, category: 'availability', level: ['all'], placeholder: 'Weekdays 6 PM onwards / Flexible / Weekends' },
  { key: 'preferredInterviewMode', label: 'Preferred Interview Mode', labelHi: 'पसंदीदा इंटरव्यू मोड', type: 'select', required: false, category: 'availability', level: ['all'], options: ['Video Call (Zoom/Teams/Meet)', 'Phone Call', 'In-Person', 'Any mode works'] },
  { key: 'timezone', label: 'Your Timezone', labelHi: 'आपका टाइमज़ोन', type: 'text', required: false, category: 'availability', level: ['international'], placeholder: 'IST (GMT+5:30) / PST (GMT-8) / CET (GMT+1)' },
  { key: 'travelWillingness', label: 'Willingness to Travel', labelHi: 'यात्रा करने की इच्छा', type: 'select', required: false, category: 'availability', level: ['mid', 'senior', 'executive'], options: ['Yes, willing to travel', 'Limited travel only', 'Prefer no travel', 'Up to 25%', 'Up to 50%', 'Up to 75%', 'Extensive travel OK'] },
  { key: 'travelPercentage', label: 'Travel Percentage OK', labelHi: 'यात्रा प्रतिशत', type: 'text', required: false, category: 'availability', level: ['senior', 'executive'], placeholder: '25% / Up to 50%' },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 12: REFERENCES
  // ═══════════════════════════════════════════════════════════════
  { key: 'referencesAvailable', label: 'References Available?', labelHi: 'रेफरेंस उपलब्ध?', type: 'boolean', required: false, category: 'references', level: ['mid', 'senior', 'executive'] },
  { key: 'references', label: 'Professional References', labelHi: 'पेशेवर रेफरेंस', type: 'array', required: false, category: 'references', level: ['senior', 'executive', 'international'], hint: 'Name, designation, company, relationship', hintHi: 'नाम, पद, कंपनी, संबंध' },
  { key: 'linkedinRecommendations', label: 'LinkedIn Recommendations', labelHi: 'लिंक्डइन रेकमेंडेशन', type: 'number', required: false, category: 'references', level: ['mid', 'senior', 'executive'], placeholder: '12', hint: 'Number of recommendations on LinkedIn', hintHi: 'लिंक्डइन पर रेकमेंडेशन की संख्या' },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 13: ADDITIONAL INFORMATION
  // ═══════════════════════════════════════════════════════════════
  { key: 'whyThisCompany', label: 'Why This Company?', labelHi: 'यह कंपनी क्यों?', type: 'textarea', required: false, category: 'additional', level: ['all'], hint: 'What attracts you to this company specifically?', hintHi: 'इस कंपनी में आपको क्या आकर्षित करता है?', maxLength: 600 },
  { key: 'whyThisRole', label: 'Why This Role?', labelHi: 'यह रोल क्यों?', type: 'textarea', required: false, category: 'additional', level: ['all'], hint: 'Why this role is perfect for you?', hintHi: 'यह रोल आपके लिए क्यों सही है?', maxLength: 500 },
  { key: 'uniqueValue', label: 'Your Unique Value Proposition', labelHi: 'आपका अनूठा मूल्य', type: 'textarea', required: false, category: 'additional', level: ['mid', 'senior', 'executive'], hint: 'What unique value do you bring?', hintHi: 'आप क्या अनूठा मूल्य लाते हैं?', maxLength: 500 },
  { key: 'careerGoals', label: 'Career Goals', labelHi: 'करियर लक्ष्य', type: 'textarea', required: false, category: 'additional', level: ['all'], hint: 'Your short-term and long-term goals', hintHi: 'आपके अल्पकालिक और दीर्घकालिक लक्ष्य', maxLength: 400 },
  { key: 'personalStatement', label: 'Personal Statement', labelHi: 'व्यक्तिगत कथन', type: 'textarea', required: false, category: 'additional', level: ['senior', 'executive', 'international'], hint: 'Your professional philosophy/approach', hintHi: 'आपका पेशेवर दर्शन/दृष्टिकोण', maxLength: 500 },
  { key: 'diversityStatement', label: 'Diversity Statement', labelHi: 'विविधता कथन', type: 'textarea', required: false, category: 'additional', level: ['executive', 'international'], hint: 'Your commitment to diversity & inclusion', hintHi: 'विविधता और समावेश के प्रति आपकी प्रतिबद्धता', maxLength: 400 },
  { key: 'volunteerWork', label: 'Volunteer Work', labelHi: 'स्वयंसेवी कार्य', type: 'array', required: false, category: 'additional', level: ['all'], hint: 'Community service, NGO work', hintHi: 'सामुदायिक सेवा, एनजीओ कार्य' },
  { key: 'hobbiesRelevant', label: 'Relevant Hobbies/Interests', labelHi: 'प्रासंगिक शौक', type: 'array', required: false, category: 'additional', level: ['all'], hint: 'Hobbies that showcase relevant skills', hintHi: 'शौक जो प्रासंगिक कौशल दिखाते हैं' },
  { key: 'additionalInfo', label: 'Additional Information', labelHi: 'अतिरिक्त जानकारी', type: 'textarea', required: false, category: 'additional', level: ['all'], hint: 'Anything else you want to mention?', hintHi: 'कुछ और जो आप बताना चाहते हैं?', maxLength: 500 },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 14: TEMPLATE SETTINGS
  // ═══════════════════════════════════════════════════════════════
  { key: 'templateStyle', label: 'Template Style', labelHi: 'टेम्पलेट स्टाइल', type: 'select', required: false, category: 'settings', level: ['all'], options: ['Modern', 'Classic', 'Creative', 'Minimal', 'Professional', 'Executive', 'Custom Color'] },
  { key: 'accentColor', label: 'Accent Color', labelHi: 'एक्सेंट रंग', type: 'text', required: false, category: 'settings', level: ['all'], placeholder: 'Blue / Red / Green / Custom hex #1a365d', hint: 'For custom color template', hintHi: 'कस्टम कलर टेम्पलेट के लिए' },
  { key: 'letterLength', label: 'Letter Length', labelHi: 'पत्र की लंबाई', type: 'select', required: false, category: 'settings', level: ['all'], options: ['Short (1 page)', 'Standard (1-1.5 pages)', 'Detailed (1.5-2 pages)', 'Comprehensive (2+ pages)'] },
  { key: 'tone', label: 'Letter Tone', labelHi: 'पत्र का लहजा', type: 'select', required: false, category: 'settings', level: ['all'], options: ['Formal', 'Professional', 'Friendly Professional', 'Enthusiastic', 'Executive'] },
  { key: 'showLetterhead', label: 'Show Letterhead?', labelHi: 'लेटरहेड दिखाएं?', type: 'boolean', required: false, category: 'settings', level: ['all'] },
  { key: 'showRecipientAddress', label: 'Show Recipient Address?', labelHi: 'प्राप्तकर्ता पता दिखाएं?', type: 'boolean', required: false, category: 'settings', level: ['all'] },
  { key: 'showDate', label: 'Show Date?', labelHi: 'तारीख दिखाएं?', type: 'boolean', required: false, category: 'settings', level: ['all'] },
  { key: 'showSignature', label: 'Show Signature?', labelHi: 'हस्ताक्षर दिखाएं?', type: 'boolean', required: false, category: 'settings', level: ['all'] },
  { key: 'showSkillsSection', label: 'Show Skills Section?', labelHi: 'स्किल्स सेक्शन दिखाएं?', type: 'boolean', required: false, category: 'settings', level: ['all'] },
  { key: 'showAchievements', label: 'Show Achievements?', labelHi: 'उपलब्धियां दिखाएं?', type: 'boolean', required: false, category: 'settings', level: ['mid', 'senior', 'executive'] },
  { key: 'showMetrics', label: 'Show Metrics?', labelHi: 'मेट्रिक्स दिखाएं?', type: 'boolean', required: false, category: 'settings', level: ['senior', 'executive'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// FIELD HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get fields by category
 */
export function getFieldsByCategory(category: FieldCategory): FieldDefinition[] {
  return COVER_LETTER_FIELDS.filter(field => field.category === category);
}

/**
 * Get fields by career level
 */
export function getFieldsByLevel(level: FieldLevel): FieldDefinition[] {
  return COVER_LETTER_FIELDS.filter(field => 
    field.level.includes(level) || field.level.includes('all')
  );
}

/**
 * Get required fields only
 */
export function getRequiredFields(): FieldDefinition[] {
  return COVER_LETTER_FIELDS.filter(field => field.required);
}

/**
 * Get optional fields only
 */
export function getOptionalFields(): FieldDefinition[] {
  return COVER_LETTER_FIELDS.filter(field => !field.required);
}

/**
 * Get fields for specific use case
 */
export function getFieldsForUseCase(useCase: 'fresher' | 'mid' | 'senior' | 'executive' | 'international'): FieldDefinition[] {
  const baseFields = getFieldsByLevel('all');
  const levelFields = getFieldsByLevel(useCase as FieldLevel);
  
  const allFields = [...baseFields, ...levelFields];
  return allFields.filter((field, index, self) =>
    index === self.findIndex(f => f.key === field.key)
  );
}

/**
 * Get field count by category
 */
export function getFieldCountByCategory(): Record<FieldCategory, number> {
  const categories: FieldCategory[] = ['personal', 'recipient', 'job', 'content', 'professional', 'skills', 'achievements', 'leadership', 'international', 'compensation', 'availability', 'references', 'additional', 'settings'];
  
  return categories.reduce((acc, cat) => {
    acc[cat] = getFieldsByCategory(cat).length;
    return acc;
  }, {} as Record<FieldCategory, number>);
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get initials from full name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Check if a value has data
 */
export function hasData(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Format date for cover letter (English)
 */
export function formatDate(date?: string | Date): string {
  if (!date) date = new Date();
  if (typeof date === 'string') date = new Date(date);
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date in Hindi
 */
export function formatDateHi(date?: string | Date): string {
  if (!date) date = new Date();
  if (typeof date === 'string') date = new Date(date);
  
  return date.toLocaleDateString('hi-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate salutation based on recipient info
 */
export function generateSalutation(data: CoverLetterData): string {
  if (data.salutation) return data.salutation;
  
  if (data.recipientName) {
    const name = data.recipientName.trim();
    if (/^(mr\.|mr |ms\.|ms |mrs\.|mrs |dr\.|dr |prof\.|prof )/i.test(name)) {
      return `Dear ${name}`;
    }
    return `Dear ${name}`;
  }
  
  if (data.recipientTitle) {
    return `Dear ${data.recipientTitle}`;
  }
  
  return 'Dear Hiring Manager';
}

/**
 * Get full address string
 */
export function getFullAddress(data: {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}): string {
  return [data.address, data.city, data.state, data.pincode, data.country]
    .filter(Boolean)
    .join(', ');
}

/**
 * Validate cover letter data
 */
export function validateCoverLetterData(data: Partial<CoverLetterData>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!data.fullName?.trim()) errors.push('Full name is required');
  if (!data.companyName?.trim()) errors.push('Company name is required');
  if (!data.jobTitle?.trim()) errors.push('Job title is required');
  if (!data.openingParagraph?.trim()) errors.push('Opening paragraph is required');
  if (!data.bodyParagraphs || data.bodyParagraphs.length === 0) {
    errors.push('At least one body paragraph is required');
  }
  if (!data.closingParagraph?.trim()) errors.push('Closing paragraph is required');

  // Warnings for recommended fields
  if (!data.email) warnings.push('Email is recommended for contact');
  if (!data.phone) warnings.push('Phone number is recommended for contact');
  if (!data.recipientName) warnings.push('Addressing a specific person is more effective');
  if (!data.linkedin) warnings.push('LinkedIn profile adds credibility');

  return { isValid: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT VALUES
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_COVER_LETTER_DATA: Partial<CoverLetterData> = {
  signOff: 'Sincerely',
  showLetterhead: true,
  showRecipientAddress: true,
  showDate: true,
  showSignature: true,
  showSkillsSection: true,
  templateStyle: 'modern',
  letterLength: 'standard',
  tone: 'professional',
};

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA - STANDARD (For Testing/Preview)
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_COVER_LETTER_DATA: CoverLetterData = {
  // Personal
  fullName: 'Aman Sharma',
  email: 'aman.sharma@email.com',
  phone: '+91 98765 43210',
  address: '123, Tech Park Colony',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560001',
  country: 'India',
  nationality: 'Indian',
  linkedin: 'linkedin.com/in/amansharma',
  portfolio: 'amansharma.dev',
  github: 'github.com/amansharma',
  
  // Recipient
  recipientName: 'Ms. Priya Patel',
  recipientTitle: 'HR Manager',
  companyName: 'TechCorp India Pvt. Ltd.',
  companyAddress: 'Tower B, Tech Park',
  companyCity: 'Bangalore',
  companyState: 'Karnataka',
  companyCountry: 'India',
  department: 'Engineering',
  
  // Job
  jobTitle: 'Senior Software Engineer',
  jobReference: 'JOB-2024-SSE-001',
  jobSource: 'LinkedIn',
  jobType: 'full-time',
  workMode: 'hybrid',
  noticePeriod: '60 days',
  
  // Content
  date: new Date().toISOString(),
  signOff: 'Sincerely',
  openingParagraph: 'I am writing to express my strong interest in the Senior Software Engineer position at TechCorp India. With over 5 years of experience in full-stack development and a passion for building scalable applications, I am excited about the opportunity to contribute to your innovative team.',
  bodyParagraphs: [
    'In my current role at ABC Technologies, I have led the development of several high-impact projects, including a microservices architecture that improved system performance by 40%. My expertise in Node.js, React, and cloud technologies (AWS, GCP) has enabled me to deliver robust solutions that meet both technical and business requirements.',
    'What excites me most about TechCorp is your commitment to innovation and your focus on building products that make a real difference. I am particularly impressed by your recent work in AI-powered solutions and would love to bring my experience in building scalable backend systems to support these initiatives.',
    'I am a strong believer in clean code, comprehensive testing, and collaborative development practices. My experience in mentoring junior developers and leading agile teams has prepared me well for a senior role where I can contribute both technically and as a team leader.',
  ],
  closingParagraph: 'I would welcome the opportunity to discuss how my experience and skills can contribute to TechCorp\'s continued success. I am available for an interview at your convenience and look forward to hearing from you. Thank you for considering my application.',
  
  // Professional
  yearsOfExperience: 5,
  currentRole: 'Software Engineer',
  currentCompany: 'ABC Technologies',
  currentIndustry: 'Information Technology',
  careerLevel: 'senior',
  
  // Skills
  keySkills: ['Node.js', 'React', 'TypeScript', 'AWS', 'System Design'],
  technicalSkills: ['JavaScript', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes'],
  softSkills: ['Leadership', 'Communication', 'Problem Solving', 'Mentoring'],
  
  // Achievements
  achievements: [
    { title: 'Performance Improvement', metric: '40% faster response time', context: 'Microservices migration', year: '2024' },
    { title: 'Cost Reduction', metric: '30% cloud cost reduction', context: 'Infrastructure optimization', year: '2023' },
  ],
  
  // Leadership
  teamSize: 8,
  directReports: 4,
  
  // Settings
  templateStyle: 'modern',
  showLetterhead: true,
  showRecipientAddress: true,
  showDate: true,
  showSignature: true,
  showSkillsSection: true,
  letterLength: 'standard',
  tone: 'professional',
};

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA - INTERNATIONAL/VISA (For Testing)
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_INTERNATIONAL_COVER_LETTER: CoverLetterData = {
  ...SAMPLE_COVER_LETTER_DATA,
  
  // Override company info
  companyName: 'Microsoft Corporation',
  companyCity: 'Redmond',
  companyState: 'Washington',
  companyCountry: 'United States',
  jobTitle: 'Senior Software Engineer',
  
  // International specific
  nationality: 'Indian',
  currentVisaStatus: 'No current US visa',
  workAuthorizationStatus: 'requires-sponsorship',
  requiresSponsorship: true,
  sponsorshipDetails: 'I will require H1B visa sponsorship to work in the United States. I am flexible with the start date to accommodate the visa processing timeline and am willing to begin on an L1 if Microsoft has an Indian entity transfer option.',
  
  willingToRelocate: true,
  relocationTimeline: 'Within 3 months of visa approval',
  relocationPreferences: ['Seattle', 'San Francisco Bay Area', 'New York'],
  currentLocation: 'Bangalore, India',
  targetLocation: 'Seattle / Redmond, WA',
  
  countriesWorkedIn: ['India', 'Singapore (6 months client deployment)'],
  globalTeamExperience: 'I have 3+ years of experience working with distributed teams across US, UK, and Singapore, collaborating across time zones using agile methodologies. I regularly conduct standups at 6 AM IST to sync with US teams.',
  timezonesWorkedAcross: ['IST', 'PST', 'EST', 'GMT', 'SGT'],
  
  languages: [
    { language: 'English', level: 'fluent', certification: 'IELTS 7.5' },
    { language: 'Hindi', level: 'native' },
    { language: 'Punjabi', level: 'native' },
  ],
  englishProficiency: 'fluent',
  ieltsScore: 'Overall: 7.5 (L:8, R:7.5, W:7, S:7.5)',
  
  whyThisCountry: 'I am drawn to the United States for its vibrant tech ecosystem and the opportunity to work with cutting-edge technologies at scale. The Seattle area, home to Microsoft, Amazon, and numerous innovative startups, represents the pinnacle of software engineering excellence. I am eager to contribute to and learn from this environment while bringing my experience building scalable systems for emerging markets.',
  
  timezone: 'IST (GMT+5:30) - Flexible for overlap hours with US teams',
  
  expectedSalary: '$180,000 - $220,000',
  salaryCurrency: 'USD ($)',
  relocationPackage: true,
  signingBonus: true,
  
  // Extended body for international application
  bodyParagraphs: [
    'In my current role at ABC Technologies, I have led the development of several high-impact projects, including a microservices architecture that improved system performance by 40%. My expertise in Node.js, React, and cloud technologies (AWS, GCP) has enabled me to deliver robust solutions that meet both technical and business requirements.',
    'Having worked extensively with Microsoft Azure services and .NET technologies in previous projects, I am particularly excited about the opportunity to contribute to Microsoft\'s cloud-first initiatives. My experience building enterprise-grade applications that serve millions of users across diverse markets aligns well with Microsoft\'s global mission.',
    'I have successfully collaborated with distributed teams across the US, UK, and Singapore, developing strong cross-cultural communication skills and an appreciation for diverse perspectives. This experience has taught me to write clear documentation, conduct effective asynchronous communication, and build inclusive team environments.',
    'What excites me most about Microsoft is your commitment to empowering every person and organization on the planet. I share this vision and believe my background in building accessible, scalable solutions for emerging markets can contribute unique insights to Microsoft\'s products.',
    'Regarding work authorization, I will require H1B visa sponsorship. I have maintained a clean immigration record and am prepared to provide all necessary documentation promptly. I am flexible with start dates to accommodate the visa process and am willing to begin remotely from India if that facilitates onboarding.',
  ],
  
  letterLength: 'comprehensive',
};

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA - FRESHER (For Testing)
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_FRESHER_COVER_LETTER: CoverLetterData = {
  fullName: 'Priya Verma',
  email: 'priya.verma@email.com',
  phone: '+91 87654 32109',
  city: 'New Delhi',
  state: 'Delhi',
  linkedin: 'linkedin.com/in/priyaverma',
  github: 'github.com/priyaverma',
  
  recipientName: 'Mr. Rajesh Kumar',
  recipientTitle: 'Campus Recruitment Manager',
  companyName: 'Infosys Limited',
  companyCity: 'Bangalore',
  department: 'Technology',
  
  jobTitle: 'Systems Engineer Trainee',
  jobSource: 'Campus Placement',
  jobType: 'full-time',
  workMode: 'onsite',
  
  date: new Date().toISOString(),
  signOff: 'Sincerely',
  
  openingParagraph: 'I am writing to express my enthusiastic interest in the Systems Engineer Trainee position at Infosys, as advertised through the campus placement drive at Delhi Technological University. As a final year B.Tech student in Computer Science with a strong foundation in programming and a passion for technology, I am eager to begin my professional journey with a global leader like Infosys.',
  
  bodyParagraphs: [
    'Throughout my academic career, I have maintained a CGPA of 8.7 while actively participating in coding competitions and technical projects. My final year project on "AI-Powered Crop Disease Detection" was selected for presentation at the DTU Tech Fest and received the Best Innovation Award in the Agriculture Technology category.',
    'During my 3-month summer internship at a local startup, I gained hands-on experience in full-stack web development using React and Node.js. I contributed to building a customer portal that reduced support ticket response time by 25%. This experience taught me the importance of writing clean, maintainable code and working effectively in agile teams.',
    'I am particularly drawn to Infosys because of your commitment to continuous learning through platforms like Infosys Springboard and your focus on emerging technologies. I am excited about the opportunity to undergo training at the Mysore campus and develop expertise in enterprise technologies while contributing to projects for global clients.',
  ],
  
  closingParagraph: 'I am confident that my strong technical foundation, eagerness to learn, and collaborative spirit make me a suitable candidate for this role. I would welcome the opportunity to discuss how I can contribute to Infosys\'s success. Thank you for considering my application.',
  
  // Professional (Fresher)
  isFresher: true,
  yearsOfExperience: 0,
  careerLevel: 'fresher',
  collegeName: 'Delhi Technological University (DTU)',
  degree: 'B.Tech in Computer Science and Engineering',
  graduationYear: '2025',
  cgpa: '8.7/10',
  relevantCoursework: ['Data Structures & Algorithms', 'Database Management Systems', 'Operating Systems', 'Computer Networks', 'Machine Learning', 'Web Technologies'],
  
  internships: [
    { company: 'TechStart Solutions', role: 'Full Stack Developer Intern', duration: '3 months (May-July 2024)', description: 'Built customer portal using React and Node.js', achievements: ['Reduced support ticket response time by 25%'] },
  ],
  
  academicProjects: [
    { name: 'AI-Powered Crop Disease Detection', role: 'Team Lead', description: 'Mobile app using TensorFlow for identifying crop diseases from photos', technologies: ['Python', 'TensorFlow', 'React Native', 'Flask'], impact: 'Best Innovation Award at DTU Tech Fest', teamSize: 4, duration: '6 months' },
    { name: 'E-Commerce Platform', role: 'Backend Developer', description: 'Full-featured online shopping platform', technologies: ['Node.js', 'Express', 'MongoDB', 'React'], teamSize: 3, duration: '3 months' },
  ],
  
  // Skills
  keySkills: ['Java', 'Python', 'JavaScript', 'SQL', 'Problem Solving'],
  technicalSkills: ['Java', 'Python', 'JavaScript', 'React', 'Node.js', 'MySQL', 'MongoDB', 'Git'],
  softSkills: ['Quick Learner', 'Team Player', 'Communication', 'Adaptability'],
  certifications: [
    { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', year: '2024' },
    { name: 'Python for Data Science', issuer: 'Coursera (IBM)', year: '2023' },
  ],
  
  // Availability
  availableFrom: 'July 2025 (after graduation)',
  interviewAvailability: 'Flexible - available for campus interviews',
  
  // Settings
  templateStyle: 'modern',
  showLetterhead: true,
  showRecipientAddress: true,
  showDate: true,
  showSignature: true,
  showSkillsSection: true,
  letterLength: 'standard',
  tone: 'enthusiastic',
};

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE DATA - EXECUTIVE (For Testing)
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_EXECUTIVE_COVER_LETTER: CoverLetterData = {
  fullName: 'Vikram Mehta',
  email: 'vikram.mehta@email.com',
  phone: '+91 98765 12345',
  alternatePhone: '+91 98765 12346',
  city: 'Mumbai',
  state: 'Maharashtra',
  linkedin: 'linkedin.com/in/vikrammehta',
  twitter: 'twitter.com/vikrammehta',
  
  recipientName: 'Mr. Sundar Rajan',
  recipientTitle: 'Chairman of the Board',
  companyName: 'Reliance Industries Limited',
  companyCity: 'Mumbai',
  department: 'Digital Services',
  
  jobTitle: 'Chief Technology Officer (CTO)',
  jobSource: 'Executive Search Firm',
  referredBy: 'Korn Ferry Executive Search',
  jobType: 'full-time',
  workMode: 'hybrid',
  noticePeriod: '90 days (negotiable)',
  
  date: new Date().toISOString(),
  signOff: 'Respectfully',
  
  openingParagraph: 'I am writing to express my strong interest in the Chief Technology Officer position at Reliance Industries. With over 20 years of technology leadership experience, including 8 years in C-suite roles at Fortune 500 companies, I am excited about the opportunity to drive Reliance\'s digital transformation agenda and strengthen its position as a global technology leader.',
  
  bodyParagraphs: [
    'As the current CTO of TechMahindra, I have led a team of 5,000+ engineers across 15 countries, managing a technology budget of $800M and delivering digital transformation initiatives that generated $2.5B in new revenue streams. Under my leadership, we achieved a 40% improvement in engineering productivity through AI-powered development tools and established strategic partnerships with Google Cloud, Microsoft Azure, and AWS.',
    'My track record includes successfully leading three major M&A technology integrations, including the $1.2B acquisition of a European digital services company where I served as the integration lead. I bring deep expertise in emerging technologies including AI/ML, blockchain, IoT, and quantum computing, having established dedicated innovation labs that have filed 45+ patents.',
    'What excites me about Reliance is your ambitious vision for Jio Platforms and the convergence of telecom, retail, and digital services. I believe my experience in building scalable technology platforms serving 500M+ users, combined with my understanding of the Indian market dynamics, positions me well to accelerate Reliance\'s digital ecosystem strategy.',
    'I am particularly interested in driving the next phase of Jio\'s evolution, leveraging 5G infrastructure for enterprise solutions, and building world-class AI capabilities. My relationships with global technology leaders and deep bench of talent would enable rapid capability building.',
  ],
  
  closingParagraph: 'I would welcome the opportunity to discuss how my experience in scaling technology organizations, driving digital transformation, and building innovative products can contribute to Reliance\'s continued success. I am available to meet at your convenience and can be flexible with notice period for the right opportunity. Thank you for considering my candidacy.',
  
  // Professional
  yearsOfExperience: 22,
  currentRole: 'Chief Technology Officer',
  currentCompany: 'Tech Mahindra Limited',
  currentIndustry: 'Information Technology Services',
  careerLevel: 'cxo',
  
  // Skills
  keySkills: ['Digital Transformation', 'AI/ML Strategy', 'Cloud Architecture', 'M&A Integration', 'Board Presentations'],
  technicalSkills: ['Enterprise Architecture', 'Cloud Platforms (AWS/Azure/GCP)', 'AI/ML', 'Blockchain', '5G/IoT'],
  softSkills: ['Strategic Vision', 'Executive Leadership', 'Board Communication', 'Change Management', 'Stakeholder Management'],
  industryExpertise: ['Telecommunications', 'Digital Services', 'Enterprise IT', 'Financial Services', 'Retail Tech'],
  certifications: [
    { name: 'Board Director Certification', issuer: 'Indian Institute of Corporate Affairs', year: '2022' },
    { name: 'Stanford Executive Program', issuer: 'Stanford GSB', year: '2020' },
  ],
  
  // Achievements
  achievements: [
    { title: 'Revenue Growth', metric: '$2.5B new revenue', context: 'Digital transformation initiatives', year: '2024' },
    { title: 'Productivity Improvement', metric: '40% engineering productivity gain', context: 'AI-powered development tools', year: '2023' },
    { title: 'M&A Integration', metric: '3 successful integrations', context: 'Including $1.2B European acquisition', year: '2022' },
  ],
  
  awards: [
    { name: 'CTO of the Year', organization: 'NASSCOM', year: '2023', description: 'For digital transformation leadership' },
    { name: 'Top 50 Tech Leaders in India', organization: 'Business Today', year: '2022' },
  ],
  
  patents: [
    { title: 'AI-based Predictive Maintenance System', patentNumber: 'IN202341045678', year: '2023', status: 'Granted' },
    { title: 'Distributed Ledger for Supply Chain', patentNumber: 'IN202241034567', year: '2022', status: 'Granted' },
  ],
  
  speakingEngagements: ['World Economic Forum - Davos 2024', 'NASSCOM Technology Leadership Summit 2023', 'AWS re:Invent 2023'],
  
  // Leadership
  teamSize: 5000,
  directReports: 12,
  budgetManaged: '$800M annually',
  revenueGenerated: '$2.5B (digital services)',
  pnlResponsibility: 'Full P&L for Digital Services Division ($1.8B)',
  departmentsManaged: ['Engineering', 'Product', 'Data Science', 'Cloud Infrastructure', 'Security', 'Innovation Labs'],
  strategicInitiatives: ['AI-First Transformation', 'Cloud Migration Program', 'Global Delivery Optimization', '5G Enterprise Solutions'],
  boardExperience: 'Board member at 2 startups (AdTech, FinTech); Advisory board at IIT Bombay Computer Science department',
  transformationLed: ['Cloud-first architecture migration', 'Agile transformation across 15 delivery centers', 'AI/ML center of excellence'],
  mergerAcquisitionExp: 'Led technology due diligence and integration for 5 acquisitions totaling $2.8B; served as integration lead for largest acquisition ($1.2B)',
  
  // Compensation
  currentSalary: '₹12 Cr CTC + ₹8 Cr performance bonus',
  expectedSalary: '₹18-22 Cr CTC + Performance + ESOP',
  salaryNegotiable: true,
  benefitsExpected: ['ESOP/Equity', 'Performance Bonus', 'Club Membership', 'Company Car', 'Global Health Insurance'],
  equityExpectation: 'Meaningful equity stake (0.1-0.2%)',
  signingBonus: true,
  
  // Availability
  availableFrom: 'After 90-day notice (negotiable to 60 days)',
  interviewAvailability: 'Flexible - evenings and weekends work',
  travelWillingness: 'Up to 50%',
  travelPercentage: '40-50%',
  
  // References
  referencesAvailable: true,
  references: [
    { name: 'Mr. Anand Mahindra', designation: 'Chairman', company: 'Mahindra Group', relationship: 'Current board member' },
    { name: 'Ms. Debjani Ghosh', designation: 'President', company: 'NASSCOM', relationship: 'Industry peer' },
  ],
  linkedinRecommendations: 45,
  
  // Additional
  whyThisCompany: 'Reliance\'s ambitious vision for Jio Platforms and the convergence of telecom, retail, and digital services presents a unique opportunity to build technology at unprecedented scale in India. The company\'s willingness to invest boldly in technology and talent aligns with my leadership philosophy.',
  uniqueValue: 'I bring a unique combination of global Fortune 500 experience, deep India market understanding, and a proven track record of building and scaling technology organizations. My relationships with global tech leaders and access to top-tier talent can accelerate Reliance\'s technology ambitions.',
  
  // Settings
  templateStyle: 'executive',
  showLetterhead: true,
  showRecipientAddress: true,
  showDate: true,
  showSignature: true,
  showSkillsSection: true,
  showAchievements: true,
  showMetrics: true,
  letterLength: 'comprehensive',
  tone: 'executive',
};