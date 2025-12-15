/**
 * Color Palette Service
 * Generates complete color palettes from a single base color
 * Used for custom resume template colors
 * 
 * @module document-templates
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface ColorPalette {
  sidebarDark: string;
  sidebarMid: string;
  sidebarLight: string;
  accentPrimary: string;
  accentSecondary: string;
  accentLight: string;
  cardBgStart: string;
  cardBgEnd: string;
}

export interface HSL {
  h: number;  // Hue: 0-360
  s: number;  // Saturation: 0-100
  l: number;  // Lightness: 0-100
}

export interface RGB {
  r: number;  // Red: 0-255
  g: number;  // Green: 0-255
  b: number;  // Blue: 0-255
}

// ============================================================================
// PRESET COLOR PALETTES
// ============================================================================

export const COLOR_PRESETS: Record<string, ColorPalette> = {
  blue: {
    sidebarDark: '#1a365d',
    sidebarMid: '#234876',
    sidebarLight: '#2d4a6f',
    accentPrimary: '#667eea',
    accentSecondary: '#764ba2',
    accentLight: '#64b5f6',
    cardBgStart: '#f8f9ff',
    cardBgEnd: '#f0f4ff'
  },
  green: {
    sidebarDark: '#14532d',
    sidebarMid: '#166534',
    sidebarLight: '#15803d',
    accentPrimary: '#22c55e',
    accentSecondary: '#16a34a',
    accentLight: '#4ade80',
    cardBgStart: '#f0fdf4',
    cardBgEnd: '#dcfce7'
  },
  purple: {
    sidebarDark: '#3b0764',
    sidebarMid: '#581c87',
    sidebarLight: '#6b21a8',
    accentPrimary: '#a855f7',
    accentSecondary: '#9333ea',
    accentLight: '#c084fc',
    cardBgStart: '#faf5ff',
    cardBgEnd: '#f3e8ff'
  },
  teal: {
    sidebarDark: '#134e4a',
    sidebarMid: '#115e59',
    sidebarLight: '#0f766e',
    accentPrimary: '#14b8a6',
    accentSecondary: '#0d9488',
    accentLight: '#5eead4',
    cardBgStart: '#f0fdfa',
    cardBgEnd: '#ccfbf1'
  },
  red: {
    sidebarDark: '#7f1d1d',
    sidebarMid: '#991b1b',
    sidebarLight: '#b91c1c',
    accentPrimary: '#ef4444',
    accentSecondary: '#dc2626',
    accentLight: '#fca5a5',
    cardBgStart: '#fef2f2',
    cardBgEnd: '#fee2e2'
  }
};

// ============================================================================
// COMMON COLOR NAMES TO HEX MAPPING
// ============================================================================

const COLOR_NAMES: Record<string, string> = {
  // Primary colors
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
  orange: '#f97316',
  purple: '#a855f7',
  pink: '#ec4899',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  
  // Neutral colors
  black: '#1f2937',
  white: '#f9fafb',
  gray: '#6b7280',
  grey: '#6b7280',
  
  // Extended colors
  indigo: '#6366f1',
  violet: '#8b5cf6',
  magenta: '#d946ef',
  rose: '#f43f5e',
  emerald: '#10b981',
  lime: '#84cc16',
  amber: '#f59e0b',
  sky: '#0ea5e9',
  slate: '#64748b',
  zinc: '#71717a',
  stone: '#78716c',
  
  // Special colors
  gold: '#ca8a04',
  silver: '#9ca3af',
  bronze: '#b45309',
  navy: '#1e3a5f',
  maroon: '#881337',
  olive: '#4d7c0f',
  coral: '#f97316',
  salmon: '#fb7185',
  turquoise: '#2dd4bf',
  lavender: '#a78bfa',
  mint: '#34d399',
  peach: '#fbbf24',
  burgundy: '#9f1239',
  chocolate: '#92400e',
  crimson: '#dc2626',
  forest: '#166534',
  royal: '#4338ca',
  midnight: '#1e1b4b'
};

// ============================================================================
// COLOR PALETTE SERVICE CLASS
// ============================================================================

class ColorPaletteService {
  
  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Generate a complete color palette from a base color
   * @param baseColor - HEX code (#ff0000) or color name (red, magenta, etc.)
   * @returns Complete ColorPalette object
   */
  generatePalette(baseColor: string): ColorPalette {
    // Normalize the input color
    const hex = this.normalizeColor(baseColor);
    
    if (!hex) {
      // Return blue preset as fallback
      console.warn(`Invalid color: ${baseColor}, using blue preset`);
      return COLOR_PRESETS.blue;
    }

    // Convert to HSL for manipulation
    const hsl = this.hexToHsl(hex);

    // Generate palette based on the base color
    return {
      sidebarDark: this.hslToHex({ h: hsl.h, s: Math.min(hsl.s + 10, 100), l: 20 }),
      sidebarMid: this.hslToHex({ h: hsl.h, s: Math.min(hsl.s + 5, 100), l: 28 }),
      sidebarLight: this.hslToHex({ h: hsl.h, s: hsl.s, l: 35 }),
      accentPrimary: this.hslToHex({ h: hsl.h, s: Math.min(hsl.s + 15, 100), l: 55 }),
      accentSecondary: this.hslToHex({ h: hsl.h, s: Math.min(hsl.s + 10, 100), l: 45 }),
      accentLight: this.hslToHex({ h: hsl.h, s: Math.min(hsl.s + 5, 100), l: 70 }),
      cardBgStart: this.hslToHex({ h: hsl.h, s: Math.max(hsl.s - 30, 10), l: 97 }),
      cardBgEnd: this.hslToHex({ h: hsl.h, s: Math.max(hsl.s - 20, 15), l: 94 })
    };
  }

  /**
   * Get a preset color palette by name
   * @param presetName - Name of the preset (blue, green, purple, teal, red)
   * @returns ColorPalette or null if not found
   */
  getPreset(presetName: string): ColorPalette | null {
    const normalized = presetName.toLowerCase().trim();
    return COLOR_PRESETS[normalized] || null;
  }

  /**
   * Get all available preset names
   * @returns Array of preset names
   */
  getPresetNames(): string[] {
    return Object.keys(COLOR_PRESETS);
  }

  /**
   * Check if a color string is valid
   * @param color - Color string to validate
   * @returns boolean
   */
  isValidColor(color: string): boolean {
    return this.normalizeColor(color) !== null;
  }

  /**
   * Normalize any color input to HEX format
   * @param color - HEX code or color name
   * @returns HEX code or null if invalid
   */
  normalizeColor(color: string): string | null {
    if (!color || typeof color !== 'string') {
      return null;
    }

    const trimmed = color.trim().toLowerCase();

    // Check if it's a color name
    if (COLOR_NAMES[trimmed]) {
      return COLOR_NAMES[trimmed];
    }

    // Check if it's a valid HEX code
    const hexMatch = trimmed.match(/^#?([a-f0-9]{6}|[a-f0-9]{3})$/i);
    if (hexMatch) {
      let hex = hexMatch[1];
      // Convert 3-digit to 6-digit
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      return `#${hex}`;
    }

    return null;
  }

  /**
   * Get suggested color name from user input
   * Useful for fuzzy matching
   * @param input - User's color input
   * @returns Closest matching color name or null
   */
  suggestColor(input: string): string | null {
    const normalized = input.toLowerCase().trim();
    
    // Exact match
    if (COLOR_NAMES[normalized]) {
      return normalized;
    }

    // Partial match
    for (const colorName of Object.keys(COLOR_NAMES)) {
      if (colorName.includes(normalized) || normalized.includes(colorName)) {
        return colorName;
      }
    }

    return null;
  }

  /**
   * Get all available color names
   * @returns Array of color names
   */
  getColorNames(): string[] {
    return Object.keys(COLOR_NAMES);
  }

  // ==========================================================================
  // COLOR CONVERSION METHODS
  // ==========================================================================

  /**
   * Convert HEX to HSL
   * @param hex - HEX color code
   * @returns HSL object
   */
  hexToHsl(hex: string): HSL {
    const rgb = this.hexToRgb(hex);
    return this.rgbToHsl(rgb);
  }

  /**
   * Convert HSL to HEX
   * @param hsl - HSL object
   * @returns HEX color code
   */
  hslToHex(hsl: HSL): string {
    const rgb = this.hslToRgb(hsl);
    return this.rgbToHex(rgb);
  }

  /**
   * Convert HEX to RGB
   * @param hex - HEX color code
   * @returns RGB object
   */
  hexToRgb(hex: string): RGB {
    const clean = hex.replace('#', '');
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16)
    };
  }

  /**
   * Convert RGB to HEX
   * @param rgb - RGB object
   * @returns HEX color code
   */
  rgbToHex(rgb: RGB): string {
    const toHex = (n: number): string => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Convert RGB to HSL
   * @param rgb - RGB object
   * @returns HSL object
   */
  rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / diff + 2) / 6;
          break;
        case b:
          h = ((r - g) / diff + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convert HSL to RGB
   * @param hsl - HSL object
   * @returns RGB object
   */
  hslToRgb(hsl: HSL): RGB {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Darken a color by percentage
   * @param hex - HEX color code
   * @param percent - Percentage to darken (0-100)
   * @returns Darkened HEX color
   */
  darken(hex: string, percent: number): string {
    const hsl = this.hexToHsl(hex);
    hsl.l = Math.max(0, hsl.l - percent);
    return this.hslToHex(hsl);
  }

  /**
   * Lighten a color by percentage
   * @param hex - HEX color code
   * @param percent - Percentage to lighten (0-100)
   * @returns Lightened HEX color
   */
  lighten(hex: string, percent: number): string {
    const hsl = this.hexToHsl(hex);
    hsl.l = Math.min(100, hsl.l + percent);
    return this.hslToHex(hsl);
  }

  /**
   * Adjust saturation of a color
   * @param hex - HEX color code
   * @param percent - Percentage to adjust (-100 to 100)
   * @returns Adjusted HEX color
   */
  saturate(hex: string, percent: number): string {
    const hsl = this.hexToHsl(hex);
    hsl.s = Math.max(0, Math.min(100, hsl.s + percent));
    return this.hslToHex(hsl);
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const colorPaletteService = new ColorPaletteService();
export default ColorPaletteService;