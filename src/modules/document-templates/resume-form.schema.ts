/**
 * ============================================================================
 * SORIVA TEMPLATES - RESUME FORM SCHEMA (DYNAMIC)
 * ============================================================================
 * 
 * @fileoverview Lean form schema for Soriva AI - NO hardcoded prompts
 * @version 2.0.0
 * @author Soriva AI (Risenex Dynamics)
 * @copyright 2025 Risenex Dynamics. All rights reserved.
 * 
 * PURPOSE: Pure structural schema - prompts fetched from localization system
 * SYNCED WITH: resume-fields.config.ts
 * SUPPORTS: 10th pass to PhD - all user levels
 * ============================================================================
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface FormStep {
  id: string;
  promptKey: string;          // Localization key - fetched at runtime
  fields: string[];
  optional?: boolean;
  isArray?: boolean;          // Can have multiple entries (education, experience, etc.)
  minItems?: number;
  maxItems?: number;
}

export interface ResumeFormSchema {
  type: string;
  templateId: string;
  promptKeyPrefix: string;    // Base key for all prompts (e.g., "resume.professional")
  steps: FormStep[];
  template: string;
}

// ============================================================================
// RESUME TYPES
// ============================================================================

export enum ResumeType {
  PROFESSIONAL = 'professional',
  FRESHER = 'fresher',
  STUDENT = 'student',
  EXPERIENCED = 'experienced',
  ACADEMIC = 'academic',
  CREATIVE = 'creative'
}

// ============================================================================
// RESUME FORM SCHEMAS
// ============================================================================

export const RESUME_FORMS: Record<string, ResumeFormSchema> = {

  // ─────────────────────────────────────────────────────────────────────────
  // PROFESSIONAL RESUME (Default - Works for most)
  // ─────────────────────────────────────────────────────────────────────────
  [ResumeType.PROFESSIONAL]: {
    type: ResumeType.PROFESSIONAL,
    templateId: "resume-professional",
    promptKeyPrefix: "resume.professional",
    steps: [
      {
        id: "personal",
        promptKey: "resume.professional.step.personal",
        fields: ["personal.fullName", "personal.email", "personal.phone", "personal.location"]
      },
      {
        id: "links",
        promptKey: "resume.professional.step.links",
        fields: ["personal.linkedin", "personal.github", "personal.portfolio"],
        optional: true
      },
      {
        id: "objective",
        promptKey: "resume.professional.step.objective",
        fields: ["personal.objective"],
        optional: true
      },
      {
        id: "education",
        promptKey: "resume.professional.step.education",
        fields: ["education.degree", "education.field", "education.institution", "education.location", "education.startYear", "education.endYear", "education.score", "education.scoreType"],
        isArray: true,
        minItems: 1,
        maxItems: 10
      },
      {
        id: "experience",
        promptKey: "resume.professional.step.experience",
        fields: ["experience.role", "experience.company", "experience.location", "experience.startDate", "experience.endDate", "experience.description", "experience.achievements"],
        isArray: true,
        optional: true,
        maxItems: 20
      },
      {
        id: "skills",
        promptKey: "resume.professional.step.skills",
        fields: ["skills.name", "skills.level", "skills.category"],
        isArray: true,
        optional: true,
        maxItems: 50
      },
      {
        id: "projects",
        promptKey: "resume.professional.step.projects",
        fields: ["projects.name", "projects.description", "projects.technologies", "projects.link"],
        isArray: true,
        optional: true,
        maxItems: 20
      },
      {
        id: "certifications",
        promptKey: "resume.professional.step.certifications",
        fields: ["certifications.name", "certifications.issuer", "certifications.date", "certifications.link"],
        isArray: true,
        optional: true,
        maxItems: 20
      },
      {
        id: "achievements",
        promptKey: "resume.professional.step.achievements",
        fields: ["achievements.title", "achievements.description", "achievements.date"],
        isArray: true,
        optional: true,
        maxItems: 20
      },
      {
        id: "languages",
        promptKey: "resume.professional.step.languages",
        fields: ["languages.name", "languages.proficiency"],
        isArray: true,
        optional: true,
        maxItems: 10
      },
      {
        id: "interests",
        promptKey: "resume.professional.step.interests",
        fields: ["interests.name", "interests.icon"],
        isArray: true,
        optional: true,
        maxItems: 10
      }
    ],
    template: "resume-professional.hbs"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FRESHER RESUME (No/Little Experience)
  // ─────────────────────────────────────────────────────────────────────────
  [ResumeType.FRESHER]: {
    type: ResumeType.FRESHER,
    templateId: "resume-fresher",
    promptKeyPrefix: "resume.fresher",
    steps: [
      {
        id: "personal",
        promptKey: "resume.fresher.step.personal",
        fields: ["personal.fullName", "personal.email", "personal.phone", "personal.location"]
      },
      {
        id: "objective",
        promptKey: "resume.fresher.step.objective",
        fields: ["personal.objective"]
      },
      {
        id: "education",
        promptKey: "resume.fresher.step.education",
        fields: ["education.degree", "education.field", "education.institution", "education.location", "education.endYear", "education.score", "education.scoreType"],
        isArray: true,
        minItems: 1,
        maxItems: 5
      },
      {
        id: "skills",
        promptKey: "resume.fresher.step.skills",
        fields: ["skills.name", "skills.level", "skills.category"],
        isArray: true,
        maxItems: 30
      },
      {
        id: "projects",
        promptKey: "resume.fresher.step.projects",
        fields: ["projects.name", "projects.description", "projects.technologies"],
        isArray: true,
        optional: true,
        maxItems: 10
      },
      {
        id: "internships",
        promptKey: "resume.fresher.step.internships",
        fields: ["experience.role", "experience.company", "experience.startDate", "experience.endDate", "experience.description"],
        isArray: true,
        optional: true,
        maxItems: 5
      },
      {
        id: "certifications",
        promptKey: "resume.fresher.step.certifications",
        fields: ["certifications.name", "certifications.issuer"],
        isArray: true,
        optional: true,
        maxItems: 10
      },
      {
        id: "achievements",
        promptKey: "resume.fresher.step.achievements",
        fields: ["achievements.title", "achievements.description"],
        isArray: true,
        optional: true,
        maxItems: 10
      },
      {
        id: "languages",
        promptKey: "resume.fresher.step.languages",
        fields: ["languages.name", "languages.proficiency"],
        isArray: true,
        optional: true,
        maxItems: 5
      },
      {
        id: "interests",
        promptKey: "resume.fresher.step.interests",
        fields: ["interests.name"],
        isArray: true,
        optional: true,
        maxItems: 10
      }
    ],
    template: "resume-fresher.hbs"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // STUDENT RESUME (10th, 12th, College)
  // ─────────────────────────────────────────────────────────────────────────
  [ResumeType.STUDENT]: {
    type: ResumeType.STUDENT,
    templateId: "resume-student",
    promptKeyPrefix: "resume.student",
    steps: [
      {
        id: "personal",
        promptKey: "resume.student.step.personal",
        fields: ["personal.fullName", "personal.email", "personal.phone", "personal.location"]
      },
      {
        id: "objective",
        promptKey: "resume.student.step.objective",
        fields: ["personal.objective"],
        optional: true
      },
      {
        id: "education",
        promptKey: "resume.student.step.education",
        fields: ["education.degree", "education.field", "education.institution", "education.endYear", "education.score", "education.scoreType"],
        isArray: true,
        minItems: 1,
        maxItems: 3
      },
      {
        id: "skills",
        promptKey: "resume.student.step.skills",
        fields: ["skills.name", "skills.category"],
        isArray: true,
        optional: true,
        maxItems: 20
      },
      {
        id: "projects",
        promptKey: "resume.student.step.projects",
        fields: ["projects.name", "projects.description"],
        isArray: true,
        optional: true,
        maxItems: 5
      },
      {
        id: "achievements",
        promptKey: "resume.student.step.achievements",
        fields: ["achievements.title"],
        isArray: true,
        optional: true,
        maxItems: 10
      },
      {
        id: "extracurricular",
        promptKey: "resume.student.step.extracurricular",
        fields: ["interests.name", "interests.icon"],
        isArray: true,
        optional: true,
        maxItems: 10
      },
      {
        id: "languages",
        promptKey: "resume.student.step.languages",
        fields: ["languages.name", "languages.proficiency"],
        isArray: true,
        optional: true,
        maxItems: 5
      }
    ],
    template: "resume-student.hbs"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EXPERIENCED RESUME (5+ years)
  // ─────────────────────────────────────────────────────────────────────────
  [ResumeType.EXPERIENCED]: {
    type: ResumeType.EXPERIENCED,
    templateId: "resume-experienced",
    promptKeyPrefix: "resume.experienced",
    steps: [
      {
        id: "personal",
        promptKey: "resume.experienced.step.personal",
        fields: ["personal.fullName", "personal.email", "personal.phone", "personal.location"]
      },
      {
        id: "links",
        promptKey: "resume.experienced.step.links",
        fields: ["personal.linkedin", "personal.portfolio"],
        optional: true
      },
      {
        id: "summary",
        promptKey: "resume.experienced.step.summary",
        fields: ["personal.objective"]
      },
      {
        id: "experience",
        promptKey: "resume.experienced.step.experience",
        fields: ["experience.role", "experience.company", "experience.location", "experience.startDate", "experience.endDate", "experience.description", "experience.achievements"],
        isArray: true,
        minItems: 1,
        maxItems: 20
      },
      {
        id: "skills",
        promptKey: "resume.experienced.step.skills",
        fields: ["skills.name", "skills.level", "skills.category"],
        isArray: true,
        maxItems: 50
      },
      {
        id: "education",
        promptKey: "resume.experienced.step.education",
        fields: ["education.degree", "education.field", "education.institution", "education.endYear"],
        isArray: true,
        maxItems: 5
      },
      {
        id: "certifications",
        promptKey: "resume.experienced.step.certifications",
        fields: ["certifications.name", "certifications.issuer", "certifications.date"],
        isArray: true,
        optional: true,
        maxItems: 20
      },
      {
        id: "achievements",
        promptKey: "resume.experienced.step.achievements",
        fields: ["achievements.title", "achievements.description"],
        isArray: true,
        optional: true,
        maxItems: 15
      }
    ],
    template: "resume-experienced.hbs"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ACADEMIC RESUME (PhD, Research, Professor)
  // ─────────────────────────────────────────────────────────────────────────
  [ResumeType.ACADEMIC]: {
    type: ResumeType.ACADEMIC,
    templateId: "resume-academic",
    promptKeyPrefix: "resume.academic",
    steps: [
      {
        id: "personal",
        promptKey: "resume.academic.step.personal",
        fields: ["personal.fullName", "personal.email", "personal.phone", "personal.location"]
      },
      {
        id: "links",
        promptKey: "resume.academic.step.links",
        fields: ["personal.linkedin", "personal.portfolio"],
        optional: true
      },
      {
        id: "summary",
        promptKey: "resume.academic.step.summary",
        fields: ["personal.objective"]
      },
      {
        id: "education",
        promptKey: "resume.academic.step.education",
        fields: ["education.degree", "education.field", "education.institution", "education.location", "education.startYear", "education.endYear", "education.score"],
        isArray: true,
        minItems: 1,
        maxItems: 10
      },
      {
        id: "research",
        promptKey: "resume.academic.step.research",
        fields: ["projects.name", "projects.description", "projects.technologies", "projects.link"],
        isArray: true,
        optional: true,
        maxItems: 20
      },
      {
        id: "publications",
        promptKey: "resume.academic.step.publications",
        fields: ["certifications.name", "certifications.issuer", "certifications.date", "certifications.link"],
        isArray: true,
        optional: true,
        maxItems: 50
      },
      {
        id: "teaching",
        promptKey: "resume.academic.step.teaching",
        fields: ["experience.role", "experience.company", "experience.startDate", "experience.endDate", "experience.description"],
        isArray: true,
        optional: true,
        maxItems: 20
      },
      {
        id: "awards",
        promptKey: "resume.academic.step.awards",
        fields: ["achievements.title", "achievements.description", "achievements.date"],
        isArray: true,
        optional: true,
        maxItems: 20
      },
      {
        id: "skills",
        promptKey: "resume.academic.step.skills",
        fields: ["skills.name", "skills.category"],
        isArray: true,
        optional: true,
        maxItems: 30
      },
      {
        id: "languages",
        promptKey: "resume.academic.step.languages",
        fields: ["languages.name", "languages.proficiency"],
        isArray: true,
        optional: true,
        maxItems: 10
      }
    ],
    template: "resume-academic.hbs"
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CREATIVE RESUME (Designer, Artist, Content Creator)
  // ─────────────────────────────────────────────────────────────────────────
  [ResumeType.CREATIVE]: {
    type: ResumeType.CREATIVE,
    templateId: "resume-creative",
    promptKeyPrefix: "resume.creative",
    steps: [
      {
        id: "personal",
        promptKey: "resume.creative.step.personal",
        fields: ["personal.fullName", "personal.email", "personal.phone", "personal.location", "personal.profilePhoto"]
      },
      {
        id: "links",
        promptKey: "resume.creative.step.links",
        fields: ["personal.linkedin", "personal.portfolio", "personal.github"]
      },
      {
        id: "bio",
        promptKey: "resume.creative.step.bio",
        fields: ["personal.objective"]
      },
      {
        id: "skills",
        promptKey: "resume.creative.step.skills",
        fields: ["skills.name", "skills.level", "skills.category"],
        isArray: true,
        maxItems: 30
      },
      {
        id: "portfolio",
        promptKey: "resume.creative.step.portfolio",
        fields: ["projects.name", "projects.description", "projects.technologies", "projects.link"],
        isArray: true,
        minItems: 1,
        maxItems: 20
      },
      {
        id: "experience",
        promptKey: "resume.creative.step.experience",
        fields: ["experience.role", "experience.company", "experience.startDate", "experience.endDate", "experience.description"],
        isArray: true,
        optional: true,
        maxItems: 15
      },
      {
        id: "education",
        promptKey: "resume.creative.step.education",
        fields: ["education.degree", "education.field", "education.institution", "education.endYear"],
        isArray: true,
        optional: true,
        maxItems: 5
      },
      {
        id: "awards",
        promptKey: "resume.creative.step.awards",
        fields: ["achievements.title", "achievements.description"],
        isArray: true,
        optional: true,
        maxItems: 15
      },
      {
        id: "interests",
        promptKey: "resume.creative.step.interests",
        fields: ["interests.name", "interests.icon"],
        isArray: true,
        optional: true,
        maxItems: 10
      }
    ],
    template: "resume-creative.hbs"
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get form schema by resume type
 */
export function getResumeForm(type: ResumeType | string): ResumeFormSchema | null {
  return RESUME_FORMS[type] || null;
}

/**
 * Get all available resume types
 */
export function getAvailableResumeTypes(): { type: string; templateId: string; promptKeyPrefix: string }[] {
  return Object.values(RESUME_FORMS).map((schema) => ({
    type: schema.type,
    templateId: schema.templateId,
    promptKeyPrefix: schema.promptKeyPrefix
  }));
}

/**
 * Get step by ID within a form
 */
export function getFormStep(type: ResumeType | string, stepId: string): FormStep | null {
  const form = getResumeForm(type);
  if (!form) return null;
  return form.steps.find(step => step.id === stepId) || null;
}

/**
 * Get all fields for a form (flattened)
 */
export function getAllFormFields(type: ResumeType | string): string[] {
  const form = getResumeForm(type);
  if (!form) return [];
  return form.steps.flatMap(step => step.fields);
}

/**
 * Get required steps only (non-optional)
 */
export function getRequiredSteps(type: ResumeType | string): FormStep[] {
  const form = getResumeForm(type);
  if (!form) return [];
  return form.steps.filter(step => !step.optional);
}

/**
 * Get optional steps only
 */
export function getOptionalSteps(type: ResumeType | string): FormStep[] {
  const form = getResumeForm(type);
  if (!form) return [];
  return form.steps.filter(step => step.optional);
}

/**
 * Get array steps (sections that can have multiple entries)
 */
export function getArraySteps(type: ResumeType | string): FormStep[] {
  const form = getResumeForm(type);
  if (!form) return [];
  return form.steps.filter(step => step.isArray);
}

/**
 * Suggest resume type based on user profile
 */
export function suggestResumeType(profile: {
  hasExperience: boolean;
  yearsOfExperience?: number;
  isStudent?: boolean;
  isAcademic?: boolean;
  isCreative?: boolean;
}): ResumeType {
  if (profile.isAcademic) return ResumeType.ACADEMIC;
  if (profile.isCreative) return ResumeType.CREATIVE;
  if (profile.isStudent) return ResumeType.STUDENT;
  if (!profile.hasExperience) return ResumeType.FRESHER;
  if (profile.yearsOfExperience && profile.yearsOfExperience >= 5) return ResumeType.EXPERIENCED;
  return ResumeType.PROFESSIONAL;
}

// ============================================================================
// END OF FILE
// ============================================================================