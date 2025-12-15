// ═══════════════════════════════════════════════════════════════════════════
// SORIVA - TEMPLATE RENDERER SERVICE
// Renders Handlebars templates with dynamic user data
// ═══════════════════════════════════════════════════════════════════════════

import Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { 
  ResumeData, 
  getInitials, 
  hasData, 
  getProficiencyNumber,
  validateResumeData 
} from './resume-fields.config';
import { 
  colorPaletteService, 
  ColorPalette, 
  COLOR_PRESETS 
} from './color-palette.service';

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER HANDLEBARS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if value exists (for conditional rendering)
 * Usage: {{#if (exists experience)}}...{{/if}}
 */
Handlebars.registerHelper('exists', function(value) {
  return hasData(value);
});

/**
 * Get initials from name
 * Usage: {{initials fullName}}
 */
Handlebars.registerHelper('initials', function(name: string) {
  return getInitials(name);
});

/**
 * Get proficiency as number (1-5)
 * Usage: {{proficiencyNum "advanced"}}
 */
Handlebars.registerHelper('proficiencyNum', function(level: string) {
  return getProficiencyNumber(level as any);
});

/**
 * Repeat helper - creates array of n items
 * Usage: {{#times 5}}...{{/times}}
 */
Handlebars.registerHelper('times', function(n: number, options) {
  let result = '';
  for (let i = 0; i < n; i++) {
    result += options.fn({ index: i, isFirst: i === 0, isLast: i === n - 1 });
  }
  return result;
});

/**
 * Range helper - for language dots
 * Usage: {{#range 1 5}}...{{/range}}
 */
Handlebars.registerHelper('range', function(from: number, to: number, options) {
  let result = '';
  for (let i = from; i <= to; i++) {
    result += options.fn({ num: i });
  }
  return result;
});

/**
 * Less than or equal comparison
 * Usage: {{#if (lte index proficiencyNum)}}filled{{/if}}
 */
Handlebars.registerHelper('lte', function(a: number, b: number) {
  return a <= b;
});

/**
 * Greater than comparison
 * Usage: {{#if (gt level 50)}}...{{/if}}
 */
Handlebars.registerHelper('gt', function(a: number, b: number) {
  return a > b;
});

/**
 * Greater than or equal comparison
 * Usage: {{#if (gte level 3)}}filled{{/if}}
 */
Handlebars.registerHelper('gte', function(a: number, b: number) {
  return a >= b;
});

/**
 * Equal comparison
 * Usage: {{#if (eq status "active")}}...{{/if}}
 */
Handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b;
});

/**
 * Not equal comparison
 * Usage: {{#if (neq status "inactive")}}...{{/if}}
 */
Handlebars.registerHelper('neq', function(a: any, b: any) {
  return a !== b;
});

/**
 * OR condition
 * Usage: {{#if (or hasLinkedin hasGithub)}}...{{/if}}
 */
Handlebars.registerHelper('or', function(...args) {
  // Remove the options object (last argument)
  args.pop();
  return args.some(Boolean);
});

/**
 * AND condition
 * Usage: {{#if (and hasEmail hasPhone)}}...{{/if}}
 */
Handlebars.registerHelper('and', function(...args) {
  args.pop();
  return args.every(Boolean);
});

/**
 * Join array with separator
 * Usage: {{join technologies ", "}}
 */
Handlebars.registerHelper('join', function(arr: string[], separator: string) {
  if (!Array.isArray(arr)) return '';
  return arr.join(separator);
});

/**
 * Format date
 * Usage: {{formatDate "2023-05-01" "MMM YYYY"}}
 */
Handlebars.registerHelper('formatDate', function(date: string) {
  if (!date) return '';
  // Simple formatting - can be enhanced
  return date;
});

/**
 * Default value if empty
 * Usage: {{default location "Not specified"}}
 */
Handlebars.registerHelper('default', function(value: any, defaultValue: string) {
  return hasData(value) ? value : defaultValue;
});

/**
 * Check if array has items
 * Usage: {{#if (hasItems skills)}}...{{/if}}
 */
Handlebars.registerHelper('hasItems', function(arr: any[]) {
  return Array.isArray(arr) && arr.length > 0;
});

/**
 * Get array length
 * Usage: {{length skills}}
 */
Handlebars.registerHelper('length', function(arr: any[]) {
  return Array.isArray(arr) ? arr.length : 0;
});

/**
 * Truncate text
 * Usage: {{truncate description 100}}
 */
Handlebars.registerHelper('truncate', function(text: string, length: number) {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
});

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE NAME MAPPING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps template numbers to file names
 */
const TEMPLATE_MAP: Record<string, string> = {
  '1': 'two-column-resume-one',
  '2': 'two-column-resume-two',
  '3': 'two-column-resume-three',
  '4': 'two-column-resume-four',
  '5': 'two-column-resume-five',
  'one': 'two-column-resume-one',
  'two': 'two-column-resume-two',
  'three': 'two-column-resume-three',
  'four': 'two-column-resume-four',
  'five': 'two-column-resume-five',
  'blue': 'two-column-resume-one',
  'green': 'two-column-resume-two',
  'purple': 'two-column-resume-three',
  'teal': 'two-column-resume-four',
  'red': 'two-column-resume-five',
  'custom': 'two-column-resume-custom'
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE RENDERER CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class TemplateRenderer {
  private templateCache: Map<string, Handlebars.TemplateDelegate> = new Map();
  private templatesDir: string;

  constructor() {
    // Path to templates directory
    this.templatesDir = path.join(__dirname, '../../templates/html/layouts');
  }

  /**
   * Load and compile a template
   */
  private loadTemplate(templateName: string): Handlebars.TemplateDelegate {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    // Load template file
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = Handlebars.compile(templateSource);

    // Cache it
    this.templateCache.set(templateName, compiledTemplate);

    return compiledTemplate;
  }

  /**
   * Resolve template name from various inputs
   * @param input - Template identifier (number, name, color)
   * @returns Resolved template file name
   */
  private resolveTemplateName(input: string): string {
    const normalized = input.toLowerCase().trim();
    
    // Check if it's in our mapping
    if (TEMPLATE_MAP[normalized]) {
      return TEMPLATE_MAP[normalized];
    }

    // Check if it's already a valid template name
    const templatePath = path.join(this.templatesDir, `${normalized}.hbs`);
    if (fs.existsSync(templatePath)) {
      return normalized;
    }

    // Default to blue template
    return 'two-column-resume-one';
  }

  /**
   * Render resume with data
   * @param data - Resume data
   * @param templateName - Template identifier (1-5, color name, or full name)
   * @param customColor - Optional custom color (HEX or color name)
   */
  public renderResume(
    data: ResumeData, 
    templateName: string = '1',
    customColor?: string
  ): string {
    // Validate data first
    const validation = validateResumeData(data);
    if (!validation.valid) {
      throw new Error(`Invalid resume data: ${validation.errors.join(', ')}`);
    }

    // Determine if using custom color
    const useCustomTemplate = customColor && colorPaletteService.isValidColor(customColor);
    
    // Resolve template name
    const resolvedTemplate = useCustomTemplate 
      ? 'two-column-resume-custom'
      : this.resolveTemplateName(templateName);

    // Generate color palette if custom
    const colors = useCustomTemplate
      ? colorPaletteService.generatePalette(customColor!)
      : null;

    // Prepare template data with computed fields
    const templateData = this.prepareTemplateData(data, colors);

    // Load and render template
    const template = this.loadTemplate(resolvedTemplate);
    return template(templateData);
  }

  /**
   * Render resume with preset color
   * @param data - Resume data
   * @param preset - Preset name (blue, green, purple, teal, red)
   */
  public renderWithPreset(data: ResumeData, preset: string): string {
    const presetMap: Record<string, string> = {
      'blue': '1',
      'green': '2',
      'purple': '3',
      'teal': '4',
      'red': '5'
    };

    const templateNum = presetMap[preset.toLowerCase()] || '1';
    return this.renderResume(data, templateNum);
  }

  /**
   * Render resume with custom color
   * @param data - Resume data
   * @param color - Custom color (HEX or color name like 'orange', 'magenta')
   */
  public renderWithCustomColor(data: ResumeData, color: string): string {
    return this.renderResume(data, 'custom', color);
  }

  /**
   * Prepare data for template (add computed fields)
   */
  private prepareTemplateData(
    data: ResumeData, 
    colors: ColorPalette | null = null
  ): Record<string, any> {
    const { personal } = data;

    return {
      // Personal info
      ...personal,
      
      // Computed fields
      initials: getInitials(personal.fullName),
      hasPhoto: hasData(personal.profilePhoto),
      hasLinkedin: hasData(personal.linkedin),
      hasGithub: hasData(personal.github),
      hasPortfolio: hasData(personal.portfolio),
      hasObjective: hasData(personal.objective),

      // Sections with existence flags
      education: data.education || [],
      hasEducation: hasData(data.education),

      experience: data.experience || [],
      hasExperience: hasData(data.experience),

      skills: data.skills || [],
      hasSkills: hasData(data.skills),

      projects: data.projects || [],
      hasProjects: hasData(data.projects),

      certifications: data.certifications || [],
      hasCertifications: hasData(data.certifications),

      achievements: data.achievements || [],
      hasAchievements: hasData(data.achievements),

      languages: data.languages || [],
      hasLanguages: hasData(data.languages),

      interests: data.interests || [],
      hasInterests: hasData(data.interests),

      // Separate skills by category if needed
      technicalSkills: (data.skills || []).filter(s => s.level !== undefined),
      softSkills: (data.skills || []).filter(s => s.level === undefined),

      // Template settings
      templateId: data.templateId || 'default',
      colorTheme: data.colorTheme || 'blue',

      // Custom colors (for two-column-resume-custom.hbs)
      colors: colors || COLOR_PRESETS.blue
    };
  }

  /**
   * Get list of available templates
   */
  public getAvailableTemplates(): string[] {
    if (!fs.existsSync(this.templatesDir)) {
      return [];
    }

    return fs.readdirSync(this.templatesDir)
      .filter(file => file.endsWith('.hbs'))
      .map(file => file.replace('.hbs', ''));
  }

  /**
   * Get available preset colors
   */
  public getPresetColors(): string[] {
    return ['blue', 'green', 'purple', 'teal', 'red'];
  }

  /**
   * Get all supported color names for custom colors
   */
  public getSupportedColorNames(): string[] {
    return colorPaletteService.getColorNames();
  }

  /**
   * Validate if a color is supported
   */
  public isValidColor(color: string): boolean {
    return colorPaletteService.isValidColor(color);
  }

  /**
   * Suggest a color based on user input
   */
  public suggestColor(input: string): string | null {
    return colorPaletteService.suggestColor(input);
  }

  /**
   * Clear template cache
   */
  public clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Render from HTML string (for preview templates)
   */
  public renderFromString(
    templateSource: string, 
    data: ResumeData,
    customColor?: string
  ): string {
    const validation = validateResumeData(data);
    if (!validation.valid) {
      throw new Error(`Invalid resume data: ${validation.errors.join(', ')}`);
    }

    const colors = customColor && colorPaletteService.isValidColor(customColor)
      ? colorPaletteService.generatePalette(customColor)
      : null;

    const templateData = this.prepareTemplateData(data, colors);
    const template = Handlebars.compile(templateSource);
    return template(templateData);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const templateRenderer = new TemplateRenderer();