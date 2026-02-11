/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA VISUAL EDUCATION ENGINE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created: February 2026
 * Purpose: Generate dynamic educational visuals with AI responses
 * 
 * Features:
 *   - Detects educational queries (Maths, Physics, Chemistry, etc.)
 *   - Generates visual data (graphs, diagrams, structures)
 *   - Zero extra cost (same API call)
 *   - AI-driven visual selection
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type VisualSubject = 'maths' | 'physics' | 'chemistry' | 'biology' | 'economics' | 'geography';

export type MathsVisualType = 
  | 'triangle' 
  | 'circle' 
  | 'graph' 
  | 'parabola' 
  | 'number-line' 
  | 'coordinate-plane'
  | 'angle'
  | 'polygon'
  | 'venn-diagram';

export type PhysicsVisualType = 
  | 'circuit' 
  | 'forces' 
  | 'projectile' 
  | 'wave' 
  | 'optics' 
  | 'pendulum'
  | 'pulley'
  | 'inclined-plane';

export type ChemistryVisualType = 
  | 'molecule' 
  | 'periodic-element' 
  | 'reaction' 
  | 'bond' 
  | 'electron-config'
  | 'orbital';

export type BiologyVisualType = 
  | 'cell' 
  | 'dna' 
  | 'body-system' 
  | 'plant-structure'
  | 'mitosis'
  | 'food-chain';

export type ChartVisualType = 
  | 'line-chart' 
  | 'bar-chart' 
  | 'pie-chart' 
  | 'supply-demand'
  | 'scatter-plot';

export type GeographyVisualType = 
  | 'simple-map' 
  | 'climate-pattern' 
  | 'water-cycle'
  | 'layers-earth';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VISUAL DATA INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Maths Visual Data
export interface TriangleData {
  type: 'right' | 'equilateral' | 'isosceles' | 'scalene';
  sides: { a: number; b: number; c: number };
  angles?: { A: number; B: number; C: number };
  labels?: { a?: string; b?: string; c?: string };
  showRightAngle?: boolean;
}

export interface CircleData {
  radius: number;
  showRadius?: boolean;
  showDiameter?: boolean;
  showArea?: boolean;
  showCircumference?: boolean;
  sectors?: Array<{ angle: number; label: string; color?: string }>;
}

export interface GraphData {
  type: 'linear' | 'quadratic' | 'cubic' | 'exponential' | 'sine' | 'cosine' | 'custom';
  equation: string;
  points?: Array<{ x: number; y: number; label?: string }>;
  xRange: [number, number];
  yRange: [number, number];
  highlights?: Array<{ x: number; label: string }>;
}

export interface NumberLineData {
  min: number;
  max: number;
  points: Array<{ value: number; label?: string; color?: string }>;
  intervals?: number;
}

export interface CoordinatePlaneData {
  xRange: [number, number];
  yRange: [number, number];
  points: Array<{ x: number; y: number; label?: string; color?: string }>;
  lines?: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; color?: string }>;
}

export interface AngleData {
  degrees: number;
  showArc?: boolean;
  showLabel?: boolean;
  type?: 'acute' | 'right' | 'obtuse' | 'straight' | 'reflex';
}

// Physics Visual Data
export interface CircuitData {
  components: Array<{
    type: 'resistor' | 'capacitor' | 'battery' | 'bulb' | 'switch' | 'ammeter' | 'voltmeter';
    value?: string;
    label?: string;
    position: { x: number; y: number };
  }>;
  connections: Array<{ from: number; to: number }>;
  circuitType: 'series' | 'parallel' | 'mixed';
}

export interface ForcesData {
  object: { shape: 'box' | 'circle' | 'custom'; mass?: number };
  forces: Array<{
    direction: 'up' | 'down' | 'left' | 'right' | 'custom';
    magnitude: number;
    label: string;
    angle?: number;
    color?: string;
  }>;
  showNetForce?: boolean;
}

export interface ProjectileData {
  initialVelocity: number;
  angle: number;
  showTrajectory?: boolean;
  showComponents?: boolean;
  maxHeight?: number;
  range?: number;
  timeOfFlight?: number;
}

export interface WaveData {
  type: 'transverse' | 'longitudinal';
  amplitude: number;
  wavelength: number;
  frequency?: number;
  showLabels?: boolean;
}

export interface PendulumData {
  length: number;
  angle: number;
  showForces?: boolean;
  showPeriodFormula?: boolean;
}

// Chemistry Visual Data
export interface MoleculeData {
  formula: string;
  name: string;
  atoms: Array<{
    element: string;
    position: { x: number; y: number };
    color?: string;
  }>;
  bonds: Array<{
    from: number;
    to: number;
    type: 'single' | 'double' | 'triple';
  }>;
  structure?: '2d' | '3d';
}

export interface PeriodicElementData {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number;
  category: string;
  electronConfig?: string;
  highlight?: boolean;
}

export interface ReactionData {
  reactants: Array<{ formula: string; coefficient?: number }>;
  products: Array<{ formula: string; coefficient?: number }>;
  conditions?: string;
  reactionType?: 'combination' | 'decomposition' | 'displacement' | 'redox';
  isBalanced?: boolean;
}

// Biology Visual Data
export interface CellData {
  type: 'animal' | 'plant' | 'bacteria';
  organelles: Array<{
    name: string;
    label?: string;
    highlight?: boolean;
  }>;
  showLabels?: boolean;
}

export interface DNAData {
  sequence?: string;
  showBasePairs?: boolean;
  showBackbone?: boolean;
  highlightRegion?: { start: number; end: number; label: string };
}

// Chart Visual Data (Economics/General)
export interface LineChartData {
  title?: string;
  xAxis: { label: string; values: string[] };
  yAxis: { label: string; min: number; max: number };
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

export interface SupplyDemandData {
  equilibriumPrice: number;
  equilibriumQuantity: number;
  supplyShift?: 'left' | 'right' | 'none';
  demandShift?: 'left' | 'right' | 'none';
  showEquilibrium?: boolean;
  showSurplus?: boolean;
  showShortage?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN VISUAL OUTPUT INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface VisualOutput {
  hasVisual: boolean;
  visual?: {
    subject: VisualSubject;
    type: string;
    title: string;
    description?: string;
    data: 
      | TriangleData 
      | CircleData 
      | GraphData 
      | NumberLineData
      | CoordinatePlaneData
      | AngleData
      | CircuitData 
      | ForcesData 
      | ProjectileData 
      | WaveData
      | PendulumData
      | MoleculeData 
      | PeriodicElementData 
      | ReactionData
      | CellData 
      | DNAData
      | LineChartData 
      | SupplyDemandData
      | Record<string, any>; // Fallback for custom visuals
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUBJECT DETECTION PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUBJECT_PATTERNS: Record<VisualSubject, RegExp> = {
  maths: /\b(pythagoras|theorem|triangle|circle|radius|diameter|area|perimeter|graph|equation|quadratic|linear|parabola|slope|intercept|geometry|angle|polygon|sine|cosine|tangent|trigonometry|function|calculus|derivative|integral|algebra|coordinate|number\s*line|venn\s*diagram|set\s*theory)\b/i,
  
  physics: /\b(circuit|resistor|capacitor|ohm|voltage|current|force|newton|gravity|projectile|motion|velocity|acceleration|wave|frequency|amplitude|wavelength|optics|lens|mirror|refraction|reflection|pendulum|oscillation|pulley|inclined\s*plane|friction|momentum|energy|power|work)\b/i,
  
  chemistry: /\b(molecule|atom|element|periodic\s*table|electron|proton|neutron|bond|covalent|ionic|reaction|equation|balance|oxidation|reduction|redox|acid|base|ph|orbital|valence|compound|formula|h2o|co2|nacl|chemical|distillation|fractional|chromatography|titration|electrolysis|combustion|fermentation|polymerization|catalyst|solution|solvent|solute|mixture|separation)\b/i,
  
  biology: /\b(cell|mitochondria|nucleus|dna|rna|chromosome|gene|protein|enzyme|photosynthesis|respiration|mitosis|meiosis|organ|tissue|plant|animal|bacteria|virus|ecosystem|food\s*chain|evolution|anatomy|body\s*system|heart|lung|brain|digestive)\b/i,
  
  economics: /\b(supply|demand|equilibrium|price|market|gdp|inflation|unemployment|fiscal|monetary|trade|export|import|economy|growth|recession|interest\s*rate|budget|tax|revenue|cost|profit|loss|elasticity)\b/i,
  
  geography: /\b(map|continent|country|ocean|river|mountain|climate|weather|latitude|longitude|equator|tropics|desert|forest|rainfall|temperature|water\s*cycle|erosion|volcano|earthquake|plate\s*tectonics|atmosphere|layers\s*of\s*earth)\b/i,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VISUAL ENGINE SERVICE CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class VisualEngineService {
  
  /**
   * Detect if query is educational and which subject
   */
  detectSubject(query: string): VisualSubject | null {
    const lowerQuery = query.toLowerCase();
    
    for (const [subject, pattern] of Object.entries(SUBJECT_PATTERNS)) {
      if (pattern.test(lowerQuery)) {
        return subject as VisualSubject;
      }
    }
    
    return null;
  }

  /**
   * Check if query needs a visual
   */
  needsVisual(query: string): boolean {
    const subject = this.detectSubject(query);
    if (!subject) return false;

    // Additional check: Is the query asking for explanation/understanding?
    const explanationPatterns = /\b(explain|what\s*is|how\s*does|show|draw|diagram|visualize|understand|describe|illustrate|prove|derive|calculate|find|solve|graph|plot)\b/i;
    
    return explanationPatterns.test(query);
  }

  /**
   * Generate visual instruction prompt for AI
   * This will be appended to the system prompt
   */
  getVisualInstructionPrompt(subject: VisualSubject): string {
    const baseInstruction = `
VISUAL GENERATION INSTRUCTION:
You are responding to an educational query about ${subject.toUpperCase()}.
Along with your text explanation, you MUST generate a visual diagram.

At the END of your response, add a JSON block in this EXACT format:
\`\`\`soriva-visual
{
  "subject": "${subject}",
  "type": "<visual_type>",
  "title": "<short title for the visual>",
  "description": "<one line description>",
  "data": {
    // Visual-specific data (see below)
  }
}
\`\`\`

`;

    const subjectInstructions: Record<VisualSubject, string> = {
      maths: `
MATHS VISUAL TYPES:
- "triangle": For Pythagoras, triangle problems
  data: { type: "right"|"equilateral"|"isosceles", sides: {a, b, c}, angles?: {A, B, C}, labels?: {a?, b?, c?}, showRightAngle?: boolean }
  
- "circle": For circle geometry
  data: { radius: number, showRadius?: boolean, showDiameter?: boolean, showArea?: boolean }
  
- "graph": For functions, equations
  data: { type: "linear"|"quadratic"|"sine"|"cosine", equation: string, points?: [{x, y, label?}], xRange: [min, max], yRange: [min, max] }
  
- "number-line": For number representation
  data: { min: number, max: number, points: [{value, label?, color?}], intervals?: number }
  
- "coordinate-plane": For coordinate geometry
  data: { xRange: [min, max], yRange: [min, max], points: [{x, y, label?}], lines?: [{start: {x, y}, end: {x, y}}] }
  
- "angle": For angle explanation
  data: { degrees: number, showArc?: boolean, type?: "acute"|"right"|"obtuse" }

EXAMPLE for Pythagoras theorem:
\`\`\`soriva-visual
{
  "subject": "maths",
  "type": "triangle",
  "title": "Right Triangle (3-4-5)",
  "description": "Pythagorean theorem: a² + b² = c²",
  "data": {
    "type": "right",
    "sides": { "a": 3, "b": 4, "c": 5 },
    "labels": { "a": "a = 3", "b": "b = 4", "c": "c = 5 (hypotenuse)" },
    "showRightAngle": true
  }
}
\`\`\`
`,

      physics: `
PHYSICS VISUAL TYPES:
- "circuit": For electrical circuits
  data: { components: [{type: "resistor"|"battery"|"bulb", value?, label?, position: {x, y}}], connections: [{from, to}], circuitType: "series"|"parallel" }
  
- "forces": For force diagrams
  data: { object: {shape: "box"|"circle", mass?}, forces: [{direction: "up"|"down"|"left"|"right", magnitude, label, color?}], showNetForce?: boolean }
  
- "projectile": For projectile motion
  data: { initialVelocity: number, angle: number, showTrajectory?: boolean, showComponents?: boolean, maxHeight?, range? }
  
- "wave": For wave diagrams
  data: { type: "transverse"|"longitudinal", amplitude: number, wavelength: number, frequency?, showLabels?: boolean }
  
- "pendulum": For pendulum motion
  data: { length: number, angle: number, showForces?: boolean }

EXAMPLE for Forces:
\`\`\`soriva-visual
{
  "subject": "physics",
  "type": "forces",
  "title": "Free Body Diagram",
  "description": "Forces acting on a box on ground",
  "data": {
    "object": { "shape": "box", "mass": 10 },
    "forces": [
      { "direction": "down", "magnitude": 98, "label": "Weight (mg)", "color": "#ef4444" },
      { "direction": "up", "magnitude": 98, "label": "Normal Force (N)", "color": "#22c55e" }
    ],
    "showNetForce": true
  }
}
\`\`\`
`,

      chemistry: `
CHEMISTRY VISUAL TYPES:
- "molecule": For molecular structures
  data: { formula: string, name: string, atoms: [{element, position: {x, y}, color?}], bonds: [{from, to, type: "single"|"double"|"triple"}] }
  
- "periodic-element": For element info
  data: { symbol: string, name: string, atomicNumber: number, atomicMass: number, category: string, electronConfig?: string }
  
- "reaction": For chemical equations
  data: { reactants: [{formula, coefficient?}], products: [{formula, coefficient?}], conditions?: string, isBalanced?: boolean }

EXAMPLE for Water molecule:
\`\`\`soriva-visual
{
  "subject": "chemistry",
  "type": "molecule",
  "title": "Water Molecule (H₂O)",
  "description": "Two hydrogen atoms bonded to one oxygen",
  "data": {
    "formula": "H2O",
    "name": "Water",
    "atoms": [
      { "element": "O", "position": { "x": 50, "y": 50 }, "color": "#ef4444" },
      { "element": "H", "position": { "x": 20, "y": 80 }, "color": "#3b82f6" },
      { "element": "H", "position": { "x": 80, "y": 80 }, "color": "#3b82f6" }
    ],
    "bonds": [
      { "from": 0, "to": 1, "type": "single" },
      { "from": 0, "to": 2, "type": "single" }
    ]
  }
}
\`\`\`
`,

      biology: `
BIOLOGY VISUAL TYPES:
- "cell": For cell diagrams
  data: { type: "animal"|"plant"|"bacteria", organelles: [{name, label?, highlight?}], showLabels?: boolean }
  
- "dna": For DNA structure
  data: { sequence?: string, showBasePairs?: boolean, showBackbone?: boolean }

EXAMPLE for Animal Cell:
\`\`\`soriva-visual
{
  "subject": "biology",
  "type": "cell",
  "title": "Animal Cell",
  "description": "Basic structure of an animal cell",
  "data": {
    "type": "animal",
    "organelles": [
      { "name": "nucleus", "label": "Nucleus - Control center", "highlight": true },
      { "name": "mitochondria", "label": "Mitochondria - Powerhouse" },
      { "name": "ribosome", "label": "Ribosomes - Protein synthesis" },
      { "name": "cell-membrane", "label": "Cell Membrane" }
    ],
    "showLabels": true
  }
}
\`\`\`
`,

      economics: `
ECONOMICS VISUAL TYPES:
- "supply-demand": For market equilibrium
  data: { equilibriumPrice: number, equilibriumQuantity: number, supplyShift?: "left"|"right"|"none", demandShift?: "left"|"right"|"none", showEquilibrium?: boolean }
  
- "line-chart": For trends/growth
  data: { title?: string, xAxis: {label, values: []}, yAxis: {label, min, max}, datasets: [{label, data: [], color?}] }

EXAMPLE for Supply-Demand:
\`\`\`soriva-visual
{
  "subject": "economics",
  "type": "supply-demand",
  "title": "Market Equilibrium",
  "description": "Supply and demand curves meeting at equilibrium",
  "data": {
    "equilibriumPrice": 50,
    "equilibriumQuantity": 100,
    "supplyShift": "none",
    "demandShift": "none",
    "showEquilibrium": true
  }
}
\`\`\`
`,

      geography: `
GEOGRAPHY VISUAL TYPES:
- "water-cycle": For water cycle explanation
  data: { stages: [{name, description}], showArrows?: boolean }
  
- "layers-earth": For Earth's structure
  data: { layers: [{name, thickness, color}], showLabels?: boolean }

EXAMPLE for Water Cycle:
\`\`\`soriva-visual
{
  "subject": "geography",
  "type": "water-cycle",
  "title": "The Water Cycle",
  "description": "Continuous movement of water on Earth",
  "data": {
    "stages": [
      { "name": "Evaporation", "description": "Water turns to vapor" },
      { "name": "Condensation", "description": "Vapor forms clouds" },
      { "name": "Precipitation", "description": "Rain/snow falls" },
      { "name": "Collection", "description": "Water collects in bodies" }
    ],
    "showArrows": true
  }
}
\`\`\`
`,
    };

    return baseInstruction + (subjectInstructions[subject] || '');
  }

  /**
   * Parse visual data from AI response
   */
  parseVisualFromResponse(response: string): VisualOutput {
    try {
      // Look for the soriva-visual JSON block
      const visualMatch = response.match(/```soriva-visual\s*([\s\S]*?)```/);
      
      if (!visualMatch || !visualMatch[1]) {
        return { hasVisual: false };
      }

      const visualJson = visualMatch[1].trim();
      const visualData = JSON.parse(visualJson);

      // Validate required fields
      if (!visualData.subject || !visualData.type || !visualData.data) {
        console.warn('[VisualEngine] Invalid visual data - missing required fields');
        return { hasVisual: false };
      }

      return {
        hasVisual: true,
        visual: {
          subject: visualData.subject,
          type: visualData.type,
          title: visualData.title || 'Educational Visual',
          description: visualData.description,
          data: visualData.data,
        },
      };
    } catch (error) {
      console.error('[VisualEngine] Failed to parse visual:', error);
      return { hasVisual: false };
    }
  }

  /**
   * Remove visual JSON block from response (for clean text display)
   */
  cleanResponseText(response: string): string {
    return response.replace(/```soriva-visual[\s\S]*?```/g, '').trim();
  }

  /**
   * Main method: Process query and get visual instruction
   */
  processQuery(query: string): {
    needsVisual: boolean;
    subject: VisualSubject | null;
    visualPrompt: string | null;
  } {
    const subject = this.detectSubject(query);
    const needsVisual = this.needsVisual(query);

    if (!needsVisual || !subject) {
      return {
        needsVisual: false,
        subject: null,
        visualPrompt: null,
      };
    }

    return {
      needsVisual: true,
      subject,
      visualPrompt: this.getVisualInstructionPrompt(subject),
    };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const visualEngineService = new VisualEngineService();
export default visualEngineService;