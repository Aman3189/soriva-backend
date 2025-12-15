// ═══════════════════════════════════════════════════════════════════════════
// SORIVA - DOCUMENT TEMPLATES MODULE
// Barrel file for clean imports
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export { 
  TemplateRenderer, 
  templateRenderer 
} from './template-renderer.service';

export { 
  PDFGeneratorService, 
  pdfGeneratorService,
  type PDFGenerationOptions,
  type PDFGenerationResult
} from './pdf-generator.service';

export { 
  colorPaletteService,
  COLOR_PRESETS,
  type ColorPalette,
  type HSL,
  type RGB
} from './color-palette.service';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export {
  // Interfaces
  type PersonalInfo,
  type Education,
  type Experience,
  type Skill,
  type Project,
  type Certification,
  type Achievement,
  type Language,
  type Interest,
  type ResumeData,

  // Constants
  SAMPLE_RESUME_DATA,

  // Helper Functions
  getInitials,
  hasData,
  getProficiencyNumber,
  validateResumeData
} from './resume-fields.config';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export * from './document-templates.types';

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES & CONTROLLER (for app integration)
// ─────────────────────────────────────────────────────────────────────────────

export { default as documentTemplatesRoutes } from './document-templates.routes';