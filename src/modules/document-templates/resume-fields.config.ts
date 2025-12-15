// ═══════════════════════════════════════════════════════════════════════════
// SORIVA - RESUME FIELDS CONFIGURATION
// Universal dynamic fields for all user types (10th pass to PhD)
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// FIELD TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'url' 
  | 'textarea' 
  | 'date' 
  | 'number' 
  | 'file' 
  | 'select' 
  | 'array';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'native';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

/** Basic contact info - ALWAYS REQUIRED */
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  profilePhoto?: string;        // Base64 or URL - Optional
  linkedin?: string;
  github?: string;
  portfolio?: string;
  objective?: string;           // Career objective/summary
}

/** Education entry - can have multiple */
export interface Education {
  degree: string;               // "B.Tech", "12th", "10th", "PhD", etc.
  field?: string;               // "Computer Science", "Commerce", etc.
  institution: string;          // School/College name
  location?: string;            // City
  startYear?: string;
  endYear: string;              // Or "Present"
  score?: string;               // "8.5 CGPA", "92%", "First Division"
  scoreType?: 'cgpa' | 'percentage' | 'grade' | 'division';
}

/** Work experience entry */
export interface Experience {
  role: string;                 // Job title
  company: string;
  location?: string;
  startDate: string;            // "Jan 2023" or "2023"
  endDate: string;              // "Dec 2023" or "Present"
  description?: string;         // What you did
  achievements?: string[];      // Bullet points
}

/** Skill entry */
export interface Skill {
  name: string;
  level?: number;               // 0-100 for progress bar (optional)
  category?: string;            // "Technical", "Soft Skills", etc.
}

/** Project entry */
export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

/** Certification entry */
export interface Certification {
  name: string;
  issuer: string;               // "AWS", "Google", "Coursera"
  date?: string;
  link?: string;
}

/** Achievement entry */
export interface Achievement {
  title: string;
  description?: string;
  date?: string;
}

/** Language entry */
export interface Language {
  name: string;
  proficiency: ProficiencyLevel;
}

/** Interest/Hobby */
export interface Interest {
  name: string;
  icon?: string;                // Emoji or icon class
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE RESUME DATA STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumeData {
  // Required
  personal: PersonalInfo;
  
  // Optional sections - if empty, section won't render
  education?: Education[];
  experience?: Experience[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  achievements?: Achievement[];
  languages?: Language[];
  interests?: Interest[];
  
  // Meta
  templateId?: string;          // Which template to use
  colorTheme?: string;          // blue, green, purple, etc.
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD VALIDATION RULES
// ─────────────────────────────────────────────────────────────────────────────

export const VALIDATION_RULES = {
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s.'-]+$/,
    message: 'Name should only contain letters and spaces'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    required: true,
    minLength: 10,
    maxLength: 15,
    pattern: /^[+]?[\d\s-]+$/,
    message: 'Please enter a valid phone number'
  },
  location: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  linkedin: {
    required: false,
    pattern: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
    message: 'Please enter a valid LinkedIn URL'
  },
  github: {
    required: false,
    pattern: /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?$/,
    message: 'Please enter a valid GitHub URL'
  },
  objective: {
    required: false,
    maxLength: 500
  },
  profilePhoto: {
    required: false,
    maxSize: 5 * 1024 * 1024,   // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  }
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_CONFIG = {
  personal: {
    title: 'Personal Information',
    required: true,
    order: 1
  },
  objective: {
    title: 'Career Objective',
    required: false,
    order: 2
  },
  education: {
    title: 'Education',
    required: false,
    order: 3,
    minItems: 0,
    maxItems: 10
  },
  experience: {
    title: 'Experience',
    required: false,
    order: 4,
    minItems: 0,
    maxItems: 20
  },
  skills: {
    title: 'Skills',
    required: false,
    order: 5,
    minItems: 0,
    maxItems: 50
  },
  projects: {
    title: 'Projects',
    required: false,
    order: 6,
    minItems: 0,
    maxItems: 20
  },
  certifications: {
    title: 'Certifications',
    required: false,
    order: 7,
    minItems: 0,
    maxItems: 20
  },
  achievements: {
    title: 'Achievements',
    required: false,
    order: 8,
    minItems: 0,
    maxItems: 20
  },
  languages: {
    title: 'Languages',
    required: false,
    order: 9,
    minItems: 0,
    maxItems: 10
  },
  interests: {
    title: 'Interests',
    required: false,
    order: 10,
    minItems: 0,
    maxItems: 10
  }
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate initials from full name
 * "Aman Sharma" → "AS"
 * "Raj Kumar Singh" → "RS"
 * "Madonna" → "MA"
 */
export function getInitials(fullName: string): string {
  if (!fullName || fullName.trim().length === 0) {
    return '??';
  }
  
  const names = fullName.trim().split(/\s+/);
  
  if (names.length >= 2) {
    // First letter of first name + first letter of last name
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  
  // Single name - take first 2 characters
  return fullName.substring(0, 2).toUpperCase();
}

/**
 * Check if a section has data
 */
export function hasData(data: unknown): boolean {
  if (data === null || data === undefined) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === 'string') return data.trim().length > 0;
  if (typeof data === 'object') return Object.keys(data).length > 0;
  return Boolean(data);
}

/**
 * Get proficiency level as number (for progress bars/dots)
 */
export function getProficiencyNumber(level: ProficiencyLevel): number {
  const levels: Record<ProficiencyLevel, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
    native: 5
  };
  return levels[level] || 3;
}

/**
 * Validate resume data
 */
export function validateResumeData(data: Partial<ResumeData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required personal fields
  if (!data.personal) {
    errors.push('Personal information is required');
    return { valid: false, errors };
  }
  
  const { personal } = data;
  
  if (!personal.fullName || personal.fullName.trim().length < 2) {
    errors.push('Full name is required (minimum 2 characters)');
  }
  
  if (!personal.email || !VALIDATION_RULES.email.pattern.test(personal.email)) {
    errors.push('Valid email is required');
  }
  
  if (!personal.phone || personal.phone.length < 10) {
    errors.push('Valid phone number is required');
  }
  
  if (!personal.location || personal.location.trim().length < 2) {
    errors.push('Location is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT/SAMPLE DATA (for testing)
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_RESUME_DATA: ResumeData = {
  personal: {
    fullName: 'Aman Sharma',
    email: 'aman.sharma@email.com',
    phone: '+91 98765 43210',
    location: 'Chandigarh, Punjab',
    linkedin: 'linkedin.com/in/amansharma',
    github: 'github.com/amansharma',
    objective: 'Motivated Computer Science graduate seeking an entry-level software developer position where I can apply my programming skills and contribute to innovative projects.'
  },
  education: [
    {
      degree: 'B.Tech',
      field: 'Computer Science',
      institution: 'Punjab Technical University',
      location: 'Jalandhar',
      startYear: '2020',
      endYear: '2024',
      score: '8.5 CGPA',
      scoreType: 'cgpa'
    },
    {
      degree: 'Senior Secondary (XII)',
      field: 'Science',
      institution: 'DAV Public School',
      location: 'Chandigarh',
      endYear: '2020',
      score: '92%',
      scoreType: 'percentage'
    }
  ],
  experience: [
    {
      role: 'Frontend Developer Intern',
      company: 'TechCorp Solutions',
      location: 'Chandigarh',
      startDate: 'May 2023',
      endDate: 'Jul 2023',
      description: 'Developed responsive UI components using React.js. Improved website performance by 30%.'
    }
  ],
  skills: [
    { name: 'JavaScript', level: 90 },
    { name: 'React.js', level: 85 },
    { name: 'Node.js', level: 80 },
    { name: 'Python', level: 75 },
    { name: 'MongoDB', level: 80 }
  ],
  projects: [
    {
      name: 'E-Commerce Platform',
      description: 'Full-stack e-commerce with user auth, cart, Stripe payments, and admin dashboard.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe']
    },
    {
      name: 'Real-time Task Manager',
      description: 'Collaborative task app with real-time updates and drag-and-drop functionality.',
      technologies: ['React', 'Socket.io', 'PostgreSQL']
    }
  ],
  certifications: [
    { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services' },
    { name: 'JavaScript Algorithms', issuer: 'freeCodeCamp' },
    { name: 'React Developer Certificate', issuer: 'Meta' }
  ],
  achievements: [
    { title: 'Winner - Smart India Hackathon 2023' },
    { title: 'Top 5% in University Coding Competition' },
    { title: 'Published ML research paper in healthcare' }
  ],
  languages: [
    { name: 'English', proficiency: 'advanced' },
    { name: 'Hindi', proficiency: 'native' },
    { name: 'Punjabi', proficiency: 'native' }
  ],
  interests: [
    { name: 'Open Source', icon: '🎯' },
    { name: 'Tech Blogging', icon: '✍️' },
    { name: 'Chess', icon: '♟️' }
  ]
};