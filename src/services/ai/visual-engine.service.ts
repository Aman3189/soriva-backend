/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SORIVA VISUAL EDUCATION ENGINE v2.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Created: February 2026
 * Updated: v2.0 - Complete visual types coverage
 * 
 * Features:
 *   - Detects educational queries (Maths, Physics, Chemistry, etc.)
 *   - Generates visual data (graphs, diagrams, structures)
 *   - Zero extra cost (same API call)
 *   - AI-driven visual selection
 *   - NEW: Computer Science subject
 *   - NEW: Process diagrams, anatomy, lab setups
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES & INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { imageSearchService } from '../../services/image-search.service';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMAGE VISUAL TYPE (NEW v3.0)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ImageVisual {
  type: 'image';
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  source: string;
  sourceUrl: string;
  width?: number;
  height?: number;
}

export type VisualSubject = 'maths' | 'physics' | 'chemistry' | 'biology' | 'economics' | 'geography' | 'computer-science';

// MATHS - Complete
export type MathsVisualType = 
  | 'triangle' 
  | 'circle' 
  | 'graph' 
  | 'parabola' 
  | 'number-line' 
  | 'coordinate-plane'
  | 'angle'
  | 'polygon'
  | 'venn-diagram'
  // NEW
  | 'quadrilateral'
  | '3d-shapes'
  | 'matrix'
  | 'probability-tree'
  | 'set-operations'
  | 'fraction'
  | 'bar-model';

// PHYSICS - Complete
export type PhysicsVisualType = 
  | 'circuit' 
  | 'forces' 
  | 'projectile' 
  | 'wave' 
  | 'optics' 
  | 'pendulum'
  | 'pulley'
  | 'inclined-plane'
  // NEW
  | 'magnetic-field'
  | 'ray-diagram'
  | 'thermodynamics'
  | 'electric-field'
  | 'motion-graph'
  | 'spring-mass';

// CHEMISTRY - Complete
export type ChemistryVisualType = 
  | 'molecule' 
  | 'periodic-element' 
  | 'reaction' 
  | 'bond' 
  | 'electron-config'
  | 'orbital'
  // NEW
  | 'process-diagram'
  | 'lab-setup'
  | 'titration-curve'
  | 'phase-diagram'
  | 'electrochemical-cell';

// BIOLOGY - Complete
export type BiologyVisualType = 
  | 'cell' 
  | 'dna' 
  | 'body-system' 
  | 'plant-structure'
  | 'mitosis'
  | 'food-chain'
  // NEW
  | 'process-diagram'
  | 'human-anatomy'
  | 'enzyme-action'
  | 'neuron'
  | 'heart-diagram'
  | 'respiratory-system'
  | 'digestive-system'
  | 'ecosystem';

// ECONOMICS - Complete
export type EconomicsVisualType = 
  | 'line-chart' 
  | 'bar-chart' 
  | 'pie-chart' 
  | 'supply-demand'
  | 'scatter-plot'
  // NEW
  | 'production-possibility'
  | 'circular-flow'
  | 'market-structure'
  | 'phillips-curve';

// GEOGRAPHY - Complete
export type GeographyVisualType = 
  | 'simple-map' 
  | 'climate-pattern' 
  | 'water-cycle'
  | 'layers-earth'
  // NEW
  | 'tectonic-plates'
  | 'biome-map'
  | 'rock-cycle'
  | 'carbon-cycle'
  | 'atmospheric-layers'
  | 'ocean-currents';

// NEW: COMPUTER SCIENCE
export type ComputerScienceVisualType =
  | 'flowchart'
  | 'data-structure'
  | 'algorithm'
  | 'binary-tree'
  | 'linked-list'
  | 'stack-queue'
  | 'sorting-visual'
  | 'graph-structure'
  | 'network-diagram'
  | 'erd-diagram'
  | 'uml-class'
  | 'state-machine'
  // NEW: Beginner-friendly visuals
  | 'cpu-architecture'
  | 'how-ai-works'
  | 'database-flow'
  | 'how-internet-works';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEW v2.1: RENDER INSTRUCTIONS (Approach B - Fully Dynamic Visuals)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Animation configuration for primitives */
export interface AnimationConfig {
  type: 'pulse' | 'fadeIn' | 'draw' | 'bounce' | 'glow';
  duration?: number;
  delay?: number;
  repeat?: boolean;
}

/** Base properties shared by all primitives */
export interface BasePrimitive {
  id?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  animate?: AnimationConfig;
}

/** Circle primitive */
export interface CirclePrimitive extends BasePrimitive {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
  label?: string;
  labelPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

/** Rectangle primitive */
export interface RectPrimitive extends BasePrimitive {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
  label?: string;
  labelPosition?: 'center' | 'top' | 'bottom';
}

/** Line primitive */
export interface LinePrimitive extends BasePrimitive {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  label?: string;
}

/** Polygon primitive */
export interface PolygonPrimitive extends BasePrimitive {
  type: 'polygon';
  points: [number, number][];
  label?: string;
}

/** Ellipse primitive */
export interface EllipsePrimitive extends BasePrimitive {
  type: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  label?: string;
}

/** Path primitive */
export interface PathPrimitive extends BasePrimitive {
  type: 'path';
  d: string;
  label?: string;
}

/** Text primitive */
export interface TextPrimitive extends BasePrimitive {
  type: 'text';
  x: number;
  y: number;
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '600' | '700';
  textAnchor?: 'start' | 'middle' | 'end';
}

/** Group primitive */
export interface GroupPrimitive extends BasePrimitive {
  type: 'group';
  transform?: string;
  children: Primitive[];
}

/** Arc primitive */
export interface ArcPrimitive extends BasePrimitive {
  type: 'arc';
  cx: number;
  cy: number;
  r: number;
  startAngle: number;
  endAngle: number;
  label?: string;
}

/** Arrow primitive */
export interface ArrowPrimitive extends BasePrimitive {
  type: 'arrow';
  from: [number, number];
  to: [number, number];
  curved?: boolean;
  bidirectional?: boolean;
  label?: string;
}

/** Image/Emoji primitive */
export interface ImagePrimitive extends BasePrimitive {
  type: 'image';
  x: number;
  y: number;
  content: string;
  size?: number;
}

/** Union of all primitives */
export type Primitive =
  | CirclePrimitive
  | RectPrimitive
  | LinePrimitive
  | PolygonPrimitive
  | EllipsePrimitive
  | PathPrimitive
  | TextPrimitive
  | GroupPrimitive
  | ArcPrimitive
  | ArrowPrimitive
  | ImagePrimitive;

/** Layout configuration */
export interface LayoutConfig {
  width?: number;
  height?: number;
  padding?: number;
  background?: string;
  viewBox?: string;
}

/** Marker definition */
export interface MarkerDef {
  id: string;
  type: 'arrow' | 'dot' | 'diamond';
  color?: string;
  size?: number;
}

/** Gradient definition */
export interface GradientDef {
  id: string;
  type: 'linear' | 'radial';
  colors: { offset: string; color: string }[];
  angle?: number;
}

/** 
 * RenderInstructions - THE KEY INTERFACE FOR APPROACH B
 * AI generates this to describe ANY visual dynamically
 */
export interface RenderInstructions {
  primitives: Primitive[];
  layout?: LayoutConfig;
  markers?: MarkerDef[];
  gradients?: GradientDef[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VISUAL DATA INTERFACES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ═══════════════════════════════════════════════════════════════
// MATHS VISUAL DATA
// ═══════════════════════════════════════════════════════════════

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

// NEW: Quadrilateral
export interface QuadrilateralData {
  type: 'square' | 'rectangle' | 'parallelogram' | 'rhombus' | 'trapezoid' | 'kite';
  sides: { a: number; b: number; c: number; d: number };
  angles?: { A: number; B: number; C: number; D: number };
  showDiagonals?: boolean;
  labels?: Record<string, string>;
}

// NEW: 3D Shapes
export interface Shape3DData {
  type: 'cube' | 'cuboid' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'prism';
  dimensions: Record<string, number>; // length, width, height, radius, etc.
  showDimensions?: boolean;
  showVolume?: boolean;
  showSurfaceArea?: boolean;
  viewAngle?: 'isometric' | 'front' | 'top' | 'side';
}

// NEW: Matrix
export interface MatrixData {
  rows: number;
  cols: number;
  values: number[][];
  operation?: 'none' | 'add' | 'multiply' | 'transpose' | 'determinant' | 'inverse';
  secondMatrix?: number[][];
  result?: number[][];
  highlightCells?: Array<{ row: number; col: number; color: string }>;
}

// NEW: Probability Tree
export interface ProbabilityTreeData {
  levels: Array<{
    branches: Array<{
      label: string;
      probability: number;
      outcome?: string;
    }>;
  }>;
  showProbabilities?: boolean;
  showOutcomes?: boolean;
}

// NEW: Venn Diagram
export interface VennDiagramData {
  sets: Array<{
    label: string;
    elements?: string[];
    color?: string;
  }>;
  intersections?: Array<{
    sets: number[];
    elements?: string[];
  }>;
  showLabels?: boolean;
}

// NEW: Fraction
export interface FractionData {
  numerator: number;
  denominator: number;
  visualType: 'pie' | 'bar' | 'rectangle';
  showDecimal?: boolean;
  showPercentage?: boolean;
  compareTo?: { numerator: number; denominator: number };
}

// ═══════════════════════════════════════════════════════════════
// PHYSICS VISUAL DATA
// ═══════════════════════════════════════════════════════════════

export interface CircuitData {
  components: Array<{
    type: 'resistor' | 'capacitor' | 'battery' | 'bulb' | 'switch' | 'ammeter' | 'voltmeter' | 'inductor' | 'diode' | 'led';
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

// NEW: Magnetic Field
export interface MagneticFieldData {
  source: 'bar-magnet' | 'solenoid' | 'wire' | 'loop';
  showFieldLines?: boolean;
  showDirection?: boolean;
  poles?: { north: { x: number; y: number }; south: { x: number; y: number } };
  current?: number;
}

// NEW: Ray Diagram
export interface RayDiagramData {
  opticsType: 'lens' | 'mirror';
  lensType?: 'convex' | 'concave';
  mirrorType?: 'concave' | 'convex' | 'plane';
  objectDistance: number;
  focalLength: number;
  objectHeight?: number;
  showPrincipalRays?: boolean;
  showImage?: boolean;
  imageProperties?: {
    distance: number;
    height: number;
    nature: 'real' | 'virtual';
    orientation: 'upright' | 'inverted';
  };
}

// NEW: Thermodynamics
export interface ThermodynamicsData {
  processType: 'isothermal' | 'adiabatic' | 'isobaric' | 'isochoric' | 'cycle';
  pvDiagram?: {
    points: Array<{ p: number; v: number; label?: string }>;
    showWork?: boolean;
  };
  cycle?: 'carnot' | 'otto' | 'diesel' | 'rankine';
  showHeatFlow?: boolean;
}

// NEW: Electric Field
export interface ElectricFieldData {
  charges: Array<{
    type: 'positive' | 'negative';
    magnitude: number;
    position: { x: number; y: number };
  }>;
  showFieldLines?: boolean;
  showEquipotential?: boolean;
  showForceOn?: { x: number; y: number; charge: number };
}

// NEW: Motion Graph
export interface MotionGraphData {
  graphType: 'displacement-time' | 'velocity-time' | 'acceleration-time';
  data: Array<{ t: number; value: number }>;
  showArea?: boolean; // For velocity-time (displacement)
  showSlope?: boolean; // For displacement-time (velocity)
  annotations?: Array<{ t: number; label: string }>;
}

// ═══════════════════════════════════════════════════════════════
// CHEMISTRY VISUAL DATA
// ═══════════════════════════════════════════════════════════════

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
  reactants: Array<{ formula: string; coefficient?: number; state?: 's' | 'l' | 'g' | 'aq' }>;
  products: Array<{ formula: string; coefficient?: number; state?: 's' | 'l' | 'g' | 'aq' }>;
  conditions?: string;
  reactionType?: 'combination' | 'decomposition' | 'displacement' | 'redox' | 'acid-base' | 'combustion';
  isBalanced?: boolean;
  showArrow?: 'single' | 'double' | 'equilibrium';
}

// NEW: Process Diagram (Chemistry)
export interface ChemistryProcessDiagramData {
  processType: 'distillation' | 'fractional-distillation' | 'chromatography' | 'electrolysis' | 'titration' | 'filtration' | 'crystallization' | 'fermentation';
  steps: Array<{
    name: string;
    description?: string;
    temperature?: number;
    equipment?: string[];
  }>;
  apparatus?: Array<{
    name: string;
    position: { x: number; y: number };
    label?: string;
  }>;
  showLabels?: boolean;
  showFlow?: boolean;
}

// NEW: Lab Setup
export interface LabSetupData {
  experiment: string;
  apparatus: Array<{
    name: string;
    type: 'beaker' | 'flask' | 'burette' | 'pipette' | 'test-tube' | 'bunsen-burner' | 'condenser' | 'funnel' | 'stand' | 'thermometer' | 'stirrer';
    position: { x: number; y: number };
    contents?: string;
    label?: string;
  }>;
  connections?: Array<{ from: number; to: number; type: 'tube' | 'wire' }>;
  annotations?: Array<{ text: string; position: { x: number; y: number } }>;
}

// NEW: Titration Curve
export interface TitrationCurveData {
  acidType: 'strong' | 'weak';
  baseType: 'strong' | 'weak';
  equivalencePoint: { volume: number; pH: number };
  bufferRegion?: { start: number; end: number };
  showIndicatorRange?: { name: string; pHRange: [number, number] };
}

// NEW: Phase Diagram
export interface PhaseDiagramData {
  substance: string;
  triplePoint?: { temperature: number; pressure: number };
  criticalPoint?: { temperature: number; pressure: number };
  regions?: Array<{ phase: 'solid' | 'liquid' | 'gas'; label?: string }>;
  showCurrentState?: { temperature: number; pressure: number };
}

// ═══════════════════════════════════════════════════════════════
// BIOLOGY VISUAL DATA
// ═══════════════════════════════════════════════════════════════

export interface CellData {
  type: 'animal' | 'plant' | 'bacteria' | 'prokaryotic' | 'eukaryotic';
  organelles: Array<{
    name: string;
    label?: string;
    highlight?: boolean;
    function?: string;
  }>;
  showLabels?: boolean;
  showFunctions?: boolean;
}

export interface DNAData {
  sequence?: string;
  showBasePairs?: boolean;
  showBackbone?: boolean;
  highlightRegion?: { start: number; end: number; label: string };
  showReplication?: boolean;
  showTranscription?: boolean;
}

// NEW: Biology Process Diagram
export interface BiologyProcessDiagramData {
  processType: 'photosynthesis' | 'respiration' | 'cellular-respiration' | 'krebs-cycle' | 'glycolysis' | 'protein-synthesis' | 'nitrogen-cycle' | 'carbon-cycle';
  stages: Array<{
    name: string;
    location?: string;
    inputs?: string[];
    outputs?: string[];
    description?: string;
  }>;
  showInputOutput?: boolean;
  showATP?: boolean;
  showEnergy?: boolean;
}

// NEW: Human Anatomy
export interface HumanAnatomyData {
  system: 'skeletal' | 'muscular' | 'circulatory' | 'respiratory' | 'digestive' | 'nervous' | 'endocrine' | 'reproductive' | 'urinary' | 'immune';
  viewType: 'full-body' | 'organ' | 'cross-section';
  organs?: Array<{
    name: string;
    label?: string;
    highlight?: boolean;
    function?: string;
  }>;
  showLabels?: boolean;
  showBloodFlow?: boolean;
}

// NEW: Heart Diagram
export interface HeartDiagramData {
  showChambers?: boolean;
  showValves?: boolean;
  showBloodFlow?: boolean;
  highlightPart?: 'left-atrium' | 'right-atrium' | 'left-ventricle' | 'right-ventricle' | 'aorta' | 'pulmonary';
  showOxygenated?: boolean;
  showDeoxygenated?: boolean;
}

// NEW: Neuron
export interface NeuronData {
  type: 'sensory' | 'motor' | 'inter';
  showParts?: boolean;
  showSynapse?: boolean;
  showSignalDirection?: boolean;
  highlightPart?: 'dendrite' | 'axon' | 'cell-body' | 'myelin' | 'terminal';
}

// NEW: Ecosystem
export interface EcosystemData {
  type: 'forest' | 'ocean' | 'desert' | 'grassland' | 'tundra' | 'freshwater';
  organisms: Array<{
    name: string;
    role: 'producer' | 'primary-consumer' | 'secondary-consumer' | 'tertiary-consumer' | 'decomposer';
    position?: { x: number; y: number };
  }>;
  showFoodWeb?: boolean;
  showEnergyFlow?: boolean;
  showBiomass?: boolean;
}

// NEW: Food Chain
export interface FoodChainData {
  levels: Array<{
    trophicLevel: number;
    organisms: string[];
    energyPercent?: number;
  }>;
  showEnergyTransfer?: boolean;
  showPyramid?: boolean;
  pyramidType?: 'energy' | 'biomass' | 'numbers';
}

// ═══════════════════════════════════════════════════════════════
// ECONOMICS VISUAL DATA
// ═══════════════════════════════════════════════════════════════

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
  showPriceFloor?: number;
  showPriceCeiling?: number;
}

// NEW: Production Possibility Curve
export interface ProductionPossibilityData {
  goodX: { name: string; max: number };
  goodY: { name: string; max: number };
  currentPoint?: { x: number; y: number };
  showOpportunityCost?: boolean;
  showEfficiency?: boolean;
  curveType?: 'concave' | 'linear' | 'convex';
}

// NEW: Circular Flow
export interface CircularFlowData {
  sectors: Array<'households' | 'firms' | 'government' | 'financial' | 'foreign'>;
  flows: Array<{
    from: string;
    to: string;
    label: string;
    type: 'money' | 'goods' | 'services' | 'factors';
  }>;
  showInjections?: boolean;
  showLeakages?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// GEOGRAPHY VISUAL DATA
// ═══════════════════════════════════════════════════════════════

export interface WaterCycleData {
  stages: Array<{
    name: string;
    description?: string;
    position?: { x: number; y: number };
  }>;
  showArrows?: boolean;
  showSun?: boolean;
  showClouds?: boolean;
}

export interface LayersEarthData {
  layers: Array<{
    name: string;
    thickness: string;
    temperature?: string;
    composition?: string;
    color?: string;
  }>;
  showLabels?: boolean;
  showScale?: boolean;
}

// NEW: Tectonic Plates
export interface TectonicPlatesData {
  plates: Array<{
    name: string;
    type: 'continental' | 'oceanic';
    movement?: 'convergent' | 'divergent' | 'transform';
  }>;
  boundaries: Array<{
    type: 'convergent' | 'divergent' | 'transform';
    plates: [string, string];
    features?: string[];
  }>;
  showEarthquakeZones?: boolean;
  showVolcanoes?: boolean;
}

// NEW: Rock Cycle
export interface RockCycleData {
  rocks: Array<{
    type: 'ignite' | 'sedimentary' | 'metamorphic';
    examples?: string[];
  }>;
  processes: Array<{
    name: string;
    from: string;
    to: string;
  }>;
  showArrows?: boolean;
}

// NEW: Atmospheric Layers
export interface AtmosphericLayersData {
  layers: Array<{
    name: 'troposphere' | 'stratosphere' | 'mesosphere' | 'thermosphere' | 'exosphere';
    altitude: { min: number; max: number };
    temperature?: { min: number; max: number };
    features?: string[];
  }>;
  showOzoneLayer?: boolean;
  showAircraft?: boolean;
  showSatellites?: boolean;
}

// NEW: Carbon Cycle
export interface CarbonCycleData {
  reservoirs: Array<{
    name: string;
    carbonAmount?: string;
    position?: { x: number; y: number };
  }>;
  fluxes: Array<{
    from: string;
    to: string;
    process: string;
    rate?: string;
  }>;
  showHumanImpact?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPUTER SCIENCE VISUAL DATA (NEW)
// ═══════════════════════════════════════════════════════════════

// NEW: Flowchart
export interface FlowchartData {
  title?: string;
  nodes: Array<{
    id: string;
    type: 'start' | 'end' | 'process' | 'decision' | 'input' | 'output' | 'connector';
    label: string;
    position?: { x: number; y: number };
  }>;
  edges: Array<{
    from: string;
    to: string;
    label?: string; // For decision branches (Yes/No)
  }>;
}

// NEW: Data Structure
export interface DataStructureData {
  type: 'array' | 'linked-list' | 'stack' | 'queue' | 'hash-table' | 'heap';
  elements: Array<{
    value: string | number;
    index?: number;
    pointer?: number;
    highlight?: boolean;
  }>;
  operations?: Array<{
    name: string;
    steps?: string[];
  }>;
  showIndices?: boolean;
  showPointers?: boolean;
}

// NEW: Binary Tree
export interface BinaryTreeData {
  type: 'binary' | 'bst' | 'avl' | 'heap' | 'complete';
  nodes: Array<{
    value: number | string;
    left?: number;
    right?: number;
    highlight?: boolean;
    color?: string;
  }>;
  rootIndex: number;
  showTraversal?: 'inorder' | 'preorder' | 'postorder' | 'levelorder';
  highlightPath?: number[];
}

// NEW: Graph Structure
export interface GraphStructureData {
  type: 'directed' | 'undirected' | 'weighted';
  nodes: Array<{
    id: string;
    label?: string;
    position?: { x: number; y: number };
    highlight?: boolean;
  }>;
  edges: Array<{
    from: string;
    to: string;
    weight?: number;
    highlight?: boolean;
  }>;
  showWeights?: boolean;
  algorithm?: 'bfs' | 'dfs' | 'dijkstra' | 'bellman-ford' | 'kruskal' | 'prim';
}

// NEW: Sorting Visual
export interface SortingVisualData {
  algorithm: 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap';
  array: number[];
  currentStep?: number;
  comparingIndices?: [number, number];
  swappingIndices?: [number, number];
  sortedIndices?: number[];
  pivotIndex?: number;
}

// NEW: Network Diagram
export interface NetworkDiagramData {
  devices: Array<{
    id: string;
    type: 'computer' | 'server' | 'router' | 'switch' | 'firewall' | 'cloud' | 'database' | 'mobile';
    label?: string;
    ip?: string;
    position?: { x: number; y: number };
  }>;
  connections: Array<{
    from: string;
    to: string;
    type?: 'wired' | 'wireless';
    bandwidth?: string;
  }>;
  showIPs?: boolean;
}

// NEW: ERD Diagram
export interface ERDDiagramData {
  entities: Array<{
    name: string;
    attributes: Array<{
      name: string;
      type: string;
      isPrimary?: boolean;
      isForeign?: boolean;
    }>;
    position?: { x: number; y: number };
  }>;
  relationships: Array<{
    from: string;
    to: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    label?: string;
  }>;
}

// NEW: State Machine
export interface StateMachineData {
  states: Array<{
    id: string;
    label: string;
    isInitial?: boolean;
    isFinal?: boolean;
    position?: { x: number; y: number };
  }>;
  transitions: Array<{
    from: string;
    to: string;
    trigger: string;
    action?: string;
  }>;
  currentState?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN VISUAL OUTPUT INTERFACE (UPDATED v2.1)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface VisualOutput {
  hasVisual: boolean;
  visual?: {
    subject: VisualSubject;
    type: string;
    title: string;
    description?: string;
    data: Record<string, any>;
    renderInstructions?: RenderInstructions;
    mermaidCode?: string;
    imageVisual?: ImageVisual;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUBJECT DETECTION PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUBJECT_PATTERNS: Record<VisualSubject, RegExp> = {
  // ✅ Added Hinglish keywords for Indian users
  maths: /\b(pythagoras|theorem|triangle|circle|radius|diameter|area|perimeter|graph|equation|quadratic|linear|parabola|slope|intercept|geometry|angle|polygon|sine|cosine|tangent|trigonometry|function|calculus|derivative|integral|algebra|coordinate|number\s*line|venn\s*diagram|set\s*theory|matrix|matrices|determinant|probability|permutation|combination|factorial|quadrilateral|rectangle|square|parallelogram|rhombus|trapezoid|cube|cuboid|sphere|cylinder|cone|pyramid|fraction|percentage|ratio|proportion|ganit|tribhuj|vritt|kshetrafal|parimap|samikaran|rekha|kon|beejganit|sankhya)\b/i,

  physics: /\b(circuit|resistor|capacitor|ohm|voltage|current|force|newton|gravity|projectile|motion|velocity|acceleration|wave|frequency|amplitude|wavelength|optics|lens|mirror|refraction|reflection|pendulum|oscillation|pulley|inclined\s*plane|friction|momentum|energy|power|work|magnetic|magnet|field|solenoid|ray\s*diagram|thermodynamics|heat|temperature|entropy|electric\s*field|charge|coulomb|spring|hooke|bhautiki|bal|gati|urja|taap|vidyut|prakaash|darpan|lens)\b/i,

  chemistry: /\b(molecule|atom|element|periodic\s*table|electron|proton|neutron|bond|covalent|ionic|reaction|equation|balance|oxidation|reduction|redox|acid|base|ph|orbital|valence|compound|formula|h2o|co2|nacl|chemical|distillation|fractional|chromatography|titration|electrolysis|combustion|fermentation|polymerization|catalyst|solution|solvent|solute|mixture|separation|phase\s*diagram|lab\s*setup|apparatus|beaker|flask|burette|rasayan|parmanu|tatva|anu|abhikriya|aml|kshaar|mishran|yaugik)\b/i,

  biology: /\b(cell|mitochondria|nucleus|dna|rna|chromosome|gene|protein|enzyme|photosynthesis|respiration|mitosis|meiosis|organ|tissue|plant|animal|bacteria|virus|ecosystem|food\s*chain|evolution|anatomy|body\s*system|heart|lung|brain|digestive|respiratory|circulatory|nervous|skeletal|muscular|neuron|synapse|hormone|endocrine|immune|antibody|antigen|krebs|glycolysis|atp|jeev|koshika|paudha|jantu|shwasan|pachan|hriday|mastishk|paryavaran|prakash\s*sanshleshan|jaivik)\b/i,

  economics: /\b(supply|demand|equilibrium|price|market|gdp|inflation|unemployment|fiscal|monetary|trade|export|import|economy|growth|recession|interest\s*rate|budget|tax|revenue|cost|profit|loss|elasticity|production\s*possibility|circular\s*flow|market\s*structure|monopoly|oligopoly|phillips\s*curve|arthshastra|maang|poorti|bazaar|mudra|vyapar|aayaat|niryaat|labh|hani|kar)\b/i,

  geography: /\b(map|continent|country|ocean|river|mountain|climate|weather|latitude|longitude|equator|tropics|desert|forest|rainfall|temperature|water\s*cycle|erosion|volcano|earthquake|plate\s*tectonics|atmosphere|layers\s*of\s*earth|tectonic|rock\s*cycle|igneous|sedimentary|metamorphic|carbon\s*cycle|biome|ecosystem|ocean\s*current|bhugol|mahaadweep|nadi|parvat|samudra|jalvayu|mausam|registaan|jangal|varsha|bhoochal|jwalamukhi|dharti)\b/i,

  // Computer Science - Extended with Hinglish
  'computer-science': /\b(algorithm|flowchart|data\s*structure|array|linked\s*list|stack|queue|tree|binary\s*tree|bst|graph|sorting|bubble\s*sort|merge\s*sort|quick\s*sort|heap|hash|database|erd|entity\s*relationship|sql|network|router|server|ip\s*address|uml|class\s*diagram|state\s*machine|automata|turing|complexity|big\s*o|recursion|iteration|loop|function|variable|oop|object\s*oriented|cpu|processor|computer\s*works|how\s*computer|ram|memory|storage|alu|control\s*unit|artificial\s*intelligence|machine\s*learning|neural\s*network|how\s*ai|ai\s*works|ml\s*works|deep\s*learning|how\s*internet|internet\s*works|dns|http|tcp|ip|client\s*server|dbms|database\s*management|crud|select|insert|programming|coding|compiler|interpreter|operating\s*system|os|process|thread|computer\s*kaise|internet\s*kaise|kaise\s*kaam|kaise\s*karta|samjhao|batao)\b/i,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VISUAL ENGINE SERVICE CLASS (v2.1 - AI-HYBRID DETECTION)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class VisualEngineService {
  
  /**
   * PHASE 1: Quick regex check for obvious educational queries
   * This is just a fast-path, not the final decision
   */
  private quickSubjectCheck(query: string): VisualSubject | null {
    const lowerQuery = query.toLowerCase();
    
    for (const [subject, pattern] of Object.entries(SUBJECT_PATTERNS)) {
      if (pattern.test(lowerQuery)) {
        return subject as VisualSubject;
      }
    }
    
    return null;
  }

  /**
   * PHASE 2: Check if query MIGHT be educational (broad check)
   * Includes Hindi, casual phrasing, and various question styles
   */
  private mightBeEducational(query: string): boolean {
    const educationalIndicators = /\b(explain|what\s*is|how\s*does|how\s*do|show|draw|diagram|visualize|understand|describe|illustrate|prove|derive|calculate|find|solve|graph|plot|structure|process|steps|mechanism|working|function|kya\s*hai|kaise|samjhao|batao|sikho|padho|learn|teach|study|homework|assignment|exam|test|class|school|college|university|chapter|topic|concept|theory|formula|equation|definition|example|problem|question|answer|difference\s*between|compare|types\s*of|parts\s*of|components|anatomy|cycle|system|diagram|chart|figure|illustration|representation|model|simulation)\b/i;
    
    return educationalIndicators.test(query);
  }

  
getAIDetectionPrompt(): string {
    return `VISUAL ENGINE v7.0

FOR EDUCATIONAL TOPICS, output a soriva-visual JSON block at END.

STRICT LAYOUT RULES:
- Canvas: 400x300
- Center content: main element at (200, 150)
- Labels: fontSize 11-13, NEVER cut off, keep 20px from edges
- Arrows: label in middle, not at edges
- Max 8 elements to avoid clutter

BIOLOGY TEMPLATE (processes like photosynthesis, respiration, digestion):
\`\`\`soriva-visual
{
  "subject": "biology",
  "type": "process-diagram",
  "title": "Process Name",
  "description": "Short description",
  "renderInstructions": {
    "viewBox": "0 0 400 300",
    "background": "#f0fdf4",
    "primitives": [
      {"type": "rect", "x": 125, "y": 100, "width": 150, "height": 80, "fill": "#bbf7d0", "stroke": "#16a34a", "strokeWidth": 2, "rx": 10},
      {"type": "text", "x": 200, "y": 145, "content": "Main Process", "fontSize": 13, "fontWeight": "bold", "textAnchor": "middle", "fill": "#166534"},
      {"type": "text", "x": 60, "y": 90, "content": "Input 1", "fontSize": 11, "textAnchor": "middle", "fill": "#374151"},
      {"type": "arrow", "from": [60, 100], "to": [125, 140], "stroke": "#3b82f6", "strokeWidth": 2},
      {"type": "text", "x": 60, "y": 210, "content": "Input 2", "fontSize": 11, "textAnchor": "middle", "fill": "#374151"},
      {"type": "arrow", "from": [60, 200], "to": [125, 160], "stroke": "#0ea5e9", "strokeWidth": 2},
      {"type": "text", "x": 340, "y": 120, "content": "Output 1", "fontSize": 11, "textAnchor": "middle", "fill": "#374151"},
      {"type": "arrow", "from": [275, 130], "to": [310, 120], "stroke": "#22c55e", "strokeWidth": 2},
      {"type": "text", "x": 340, "y": 180, "content": "Output 2", "fontSize": 11, "textAnchor": "middle", "fill": "#374151"},
      {"type": "arrow", "from": [275, 150], "to": [310, 180], "stroke": "#f59e0b", "strokeWidth": 2},
      {"type": "text", "x": 200, "y": 280, "content": "Summary equation or note", "fontSize": 11, "textAnchor": "middle", "fill": "#6b7280"}
    ]
  }
}
\`\`\`

PHYSICS TEMPLATE (forces, circuits, motion):
\`\`\`soriva-visual
{
  "subject": "physics",
  "type": "diagram",
  "title": "Concept Name",
  "renderInstructions": {
    "viewBox": "0 0 400 300",
    "background": "#eff6ff",
    "primitives": [
      {"type": "rect", "x": 150, "y": 110, "width": 100, "height": 60, "fill": "#dbeafe", "stroke": "#2563eb", "strokeWidth": 2, "rx": 4},
      {"type": "text", "x": 200, "y": 145, "content": "Object", "fontSize": 12, "fontWeight": "bold", "textAnchor": "middle", "fill": "#1e40af"},
      {"type": "arrow", "from": [200, 110], "to": [200, 50], "stroke": "#22c55e", "strokeWidth": 3},
      {"type": "text", "x": 200, "y": 40, "content": "Force Up", "fontSize": 11, "textAnchor": "middle", "fill": "#166534"},
      {"type": "arrow", "from": [200, 170], "to": [200, 230], "stroke": "#ef4444", "strokeWidth": 3},
      {"type": "text", "x": 200, "y": 250, "content": "Force Down", "fontSize": 11, "textAnchor": "middle", "fill": "#dc2626"}
    ]
  }
}
\`\`\`

RULES:
1. Use template matching the subject
2. Replace labels with topic-specific terms
3. Keep coordinates as-is for proper layout
4. Max 10-12 primitives
5. All text must be fully visible (not cut off)
6. JSON block at END of response only
`;
  }
  getVisualInstructionPrompt(subject: VisualSubject): string {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 DYNAMIC VISUAL ENGINE v3.0 - AI-Driven Visual Generation
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NO hardcoded types! AI decides the best visual for ANY topic.
    // Uses renderInstructions with primitives for FULL FLEXIBILITY.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const subjectGuidance: Record<VisualSubject, string> = {
      maths: `geometry (triangles, circles, polygons), graphs (linear, quadratic, trigonometric), number lines, coordinate planes, angles, 3D shapes, matrices, Venn diagrams, fractions, calculus curves, probability trees`,
      
      physics: `force diagrams, circuit diagrams, wave patterns, projectile motion, P-V diagrams (thermodynamics), ray diagrams (optics), electric/magnetic field lines, motion graphs, pendulums, springs, fluid dynamics, nuclear diagrams`,
      
      chemistry: `molecular structures, atomic models, orbital diagrams, reaction equations, periodic table elements, lab apparatus, phase diagrams, electrochemical cells, bond diagrams, crystal structures`,
      
      biology: `cell structures, DNA/RNA, body systems (skeletal, circulatory, nervous, digestive, respiratory), food chains, ecosystems, neuron diagrams, heart/organ diagrams, mitosis/meiosis, photosynthesis/respiration cycles`,
      
      economics: `supply-demand curves, line/bar/pie charts, circular flow diagrams, production possibility curves, market equilibrium, Phillips curve, GDP graphs, trade diagrams`,
      
      geography: `water cycle, rock cycle, carbon cycle, atmospheric layers, tectonic plates, ocean currents, climate patterns, biome maps, earth layers`,
      
      'computer-science': `flowcharts, data structures (arrays, linked lists, trees, graphs, stacks, queues), sorting algorithms, network diagrams, CPU architecture, database schemas, UML diagrams, state machines`,
    };

    return `You are a ${subject.toUpperCase()} visual expert. Generate an educational diagram using SVG primitives.

SUBJECT CONTEXT: ${subjectGuidance[subject] || 'educational concepts'}

IMPORTANT RULES:
1. ANALYZE the query and DECIDE the best visual type yourself
2. Use renderInstructions with primitives for MAXIMUM flexibility
3. ALL coordinates must be VALID NUMBERS (no NaN, no undefined)
4. Keep diagram CLEAN and READABLE:
   - NO overlapping text or labels
   - Keep text fontSize between 11-14px
   - Minimum 30px spacing between elements
   - Labels should be OUTSIDE shapes, not inside
5. Use viewBox="0 0 400 300" - CENTER content around (200, 150)
6. Keep 40px margin from edges (content between x:40-360, y:40-260)
7. Maximum 8-10 primitives to avoid clutter
8. Use CONTRASTING colors for different elements
9. Arrows should have clear direction with proper spacing

OUTPUT FORMAT (STRICT):
\`\`\`soriva-visual
{
  "subject": "${subject}",
  "type": "<your-chosen-type>",
  "title": "<descriptive-title>",
  "description": "<brief-explanation>",
  "renderInstructions": {
    "viewBox": "0 0 400 300",
    "background": "#f8fafc",
    "primitives": [
      {"type": "circle", "cx": 200, "cy": 150, "r": 50, "fill": "#3b82f6", "stroke": "#1d4ed8"},
      {"type": "line", "x1": 100, "y1": 100, "x2": 300, "y2": 200, "stroke": "#000", "strokeWidth": 2},
      {"type": "rect", "x": 50, "y": 50, "width": 100, "height": 60, "fill": "#10b981", "rx": 5},
      {"type": "text", "x": 200, "y": 280, "content": "Label", "fontSize": 14, "textAnchor": "middle"},
      {"type": "arrow", "from": [100, 150], "to": [200, 150], "stroke": "#000", "label": "Force"},
      {"type": "path", "d": "M 100 200 Q 200 100 300 200", "stroke": "#8b5cf6", "fill": "none"}
    ]
  }
}
\`\`\`

PRIMITIVE TYPES AVAILABLE:
- circle: {cx, cy, r, fill?, stroke?, label?}
- rect: {x, y, width, height, fill?, stroke?, rx?, label?}
- line: {x1, y1, x2, y2, stroke?, strokeWidth?, dashed?, label?}
- arrow: {from: [x,y], to: [x,y], stroke?, label?, curved?, bidirectional?}
- text: {x, y, content, fontSize?, fontWeight?, textAnchor?, fill?}
- path: {d, stroke?, fill?, strokeWidth?}
- ellipse: {cx, cy, rx, ry, fill?, stroke?}
- polygon: {points: [[x,y], ...], fill?, stroke?}
- arc: {cx, cy, r, startAngle, endAngle, stroke?, fill?}
- group: {transform?, children: [...primitives]}

Generate the MOST APPROPRIATE visual for the concept being explained. Be creative!`;
  }

  /**
   * Parse visual data from AI response (UPDATED v2.3)
   * Now also parses renderInstructions for Approach B
   * v2.2: Strips JavaScript comments from JSON (Mistral sometimes adds these)
   * v2.3: Added subject-specific validation + default values for robustness
   */
  parseVisualFromResponse(response: string): VisualOutput {
  try {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PRIORITY 1: MERMAID DIAGRAM (Simplest, cleanest)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    const mermaidRegex = /```mermaid\s*([\s\S]*?)```/gi;
    const mermaidMatch = mermaidRegex.exec(response);
    
    if (mermaidMatch) {
      const mermaidCode = mermaidMatch[1].trim();
      console.log('[VisualEngine] 📊 Found Mermaid diagram');
      
      return {
        hasVisual: true,
        visual: {
          subject: 'general' as VisualSubject,
          type: 'mermaid',
          title: 'Diagram',
          mermaidCode: mermaidCode,
          data: {},
        },
      };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PRIORITY 2: SORIVA-VISUAL / RENDERINSTRUCTIONS (Legacy)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    let visualJson: string | null = null;
    const codeBlockRegex = /```[\w-]*\s*([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const content = match[1].trim();
      
      // Accept blocks with renderInstructions + primitives
      if (content.startsWith('{') && content.includes('"renderInstructions"') && content.includes('"primitives"')) {
        visualJson = content;
        console.log('[VisualEngine] 📊 Found renderInstructions in code block');
        break;
      }
    }
    
    if (!visualJson) {
      console.log('[VisualEngine] ⚠️ No visual found in response');
      return { hasVisual: false };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CLEAN & PARSE JSON
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    visualJson = visualJson.replace(/\/\/[^\n]*/g, '');
    visualJson = visualJson.replace(/\/\*[\s\S]*?\*\//g, '');
    visualJson = visualJson.replace(/,\s*([}\]])/g, '$1');
    visualJson = visualJson.trim();
    
    let visualData: any;
    
    try {
      visualData = JSON.parse(visualJson);
    } catch (parseError) {
      console.error('[VisualEngine] ❌ JSON parse failed:', parseError);
      return { hasVisual: false };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // BUILD OUTPUT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    const visual: VisualOutput['visual'] = {
      subject: visualData.subject || 'general',
      type: visualData.type || 'diagram',
      title: visualData.title || 'Diagram',
      description: visualData.description,
      data: visualData.data || {},
    };

    if (visualData.renderInstructions?.primitives) {
      visual.renderInstructions = visualData.renderInstructions;
    }

    console.log('[VisualEngine] ✅ Visual parsed:', {
      type: visual.type,
      hasRenderInstructions: !!visual.renderInstructions,
    });
    
    return { hasVisual: true, visual };
    
  } catch (error) {
    console.error('[VisualEngine] Failed to parse visual:', error);
    return { hasVisual: false };
  }
}
  /**
   * Remove visual JSON block from response (for clean text display)
   * v2.3 - COMPLETE FIX: Handles ALL JSON patterns + placeholder text
   */
  cleanResponseText(response: string): string {
    let cleaned = response;
    
    // ═══════════════════════════════════════════════════════════════
    // PHASE 0: NUCLEAR - Remove ANY code block containing visual keys
    // ═══════════════════════════════════════════════════════════════
    // This catches ALL variations regardless of JSON validity
    
    // Nuclear Pattern: Any code block with "primitives" anywhere inside
    cleaned = cleaned.replace(/```[\s\S]*?"primitives"\s*:[\s\S]*?```/gi, '');
    
    // Nuclear Pattern 2: Any code block with renderInstructions
    cleaned = cleaned.replace(/```[\s\S]*?"renderInstructions"\s*:[\s\S]*?```/gi, '');
    
    // Nuclear Pattern 3: Code blocks starting with comma (partial JSON)
    cleaned = cleaned.replace(/```\s*,[\s\S]*?```/g, '');
    
    // ═══════════════════════════════════════════════════════════════
    // PHASE 1: Remove code blocks with visual content
    // ═══════════════════════════════════════════════════════════════
    
    // Pattern 1: ```soriva-visual ... ```
    cleaned = cleaned.replace(/```soriva-visual[\s\S]*?```/g, '');
    
    // Pattern 2: ```json ... ``` with visual keys
    cleaned = cleaned.replace(/```json\s*\n?\{[\s\S]*?```/gi, '');
    
    // Pattern 3: ``` { ... } ``` unmarked code blocks with JSON
    cleaned = cleaned.replace(/```\s*\{[\s\S]*?\}\s*```/g, '');
    
    // ═══════════════════════════════════════════════════════════════
    // PHASE 2: Remove labeled visual sections
    // ═══════════════════════════════════════════════════════════════
    
    // Pattern 4: "Visual Explanation (Title):" + content (code block or JSON)
    cleaned = cleaned.replace(/\*{0,2}Visual\s*Explanation\s*\([^)]*\):?\*{0,2}\s*\n?(?:```[\s\S]*?```|\{[\s\S]*?\})/gi, '');
    
    // Pattern 5: "Visualization:" + content
    cleaned = cleaned.replace(/\*{0,2}Visualization:?\*{0,2}\s*\n?(?:```[\s\S]*?```|\{[\s\S]*?\})/gi, '');
    
    // ═══════════════════════════════════════════════════════════════
    // PHASE 3: Remove standalone JSON with visual keys
    // ═══════════════════════════════════════════════════════════════
    
    // Pattern 6: Direct JSON starting with "subject" or having "renderInstructions"
    cleaned = cleaned.replace(/\{\s*"(?:subject|renderInstructions)"[\s\S]*?"(?:primitives|type|data)"[\s\S]*?\}/gi, '');
    
    // Pattern 7: JSON with primitives array
    cleaned = cleaned.replace(/\{\s*"primitives"\s*:\s*\[[\s\S]*?\]\s*\}/gi, '');
    
    // ═══════════════════════════════════════════════════════════════
    // PHASE 4: Remove placeholder/header text
    // ═══════════════════════════════════════════════════════════════
    
    // Pattern 8: "(Visual below to explain...)" placeholder text
    cleaned = cleaned.replace(/\(Visual\s+(?:below|above)?\s*(?:to\s+)?explain[^)]*\)/gi, '');
    
    // Pattern 9: Leftover "Visual Explanation" headers (with or without title)
    cleaned = cleaned.replace(/\*{0,2}Visual\s*Explanation\s*(?:\([^)]*\))?:?\*{0,2}\s*$/gim, '');
    
    // Pattern 10: Leftover "Visualization:" text
    cleaned = cleaned.replace(/\*{0,2}Visualization:?\*{0,2}\s*$/gim, '');
    
    // ═══════════════════════════════════════════════════════════════
    // PHASE 5: Cleanup
    // ═══════════════════════════════════════════════════════════════
    
    // Pattern 11: Empty markdown formatting
    cleaned = cleaned.replace(/\*\*\s*\*\*/g, '');
    cleaned = cleaned.replace(/^\*\*\s*$/gm, '');
    
    // Clean excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    
    return cleaned;
  }

  /**
   * LEGACY: Detect subject (kept for backward compatibility)
   * Now just calls quickSubjectCheck
   */
  detectSubject(query: string): VisualSubject | null {
    return this.quickSubjectCheck(query);
  }

  /**
   * LEGACY: Check if needs visual (kept for backward compatibility)
   */
  needsVisual(query: string): boolean {
    return this.mightBeEducational(query);
  }

  /**
   * NEW v2.1: Main method - AI-Hybrid approach
   * 
   * Strategy:
   * 1. Quick regex check for obvious educational queries
   * 2. If subject found → use subject-specific prompt
   * 3. If no subject but might be educational → use AI detection prompt
   * 4. Let AI decide if visual is needed
   * 
   * This ensures:
   * - "How does CPU work?" → visual generated
   * - "Computer kaise kaam karta hai?" → visual generated (AI understands Hindi)
   * - "What's the weather?" → no visual (AI knows this isn't educational)
   */
  processQuery(query: string): {
    needsVisual: boolean;
    subject: VisualSubject | null;
    visualPrompt: string | null;
    useAIDetection: boolean;
  } {
    // PHASE 1: Quick check for obvious subject match
    const detectedSubject = this.quickSubjectCheck(query);
    
    if (detectedSubject) {
      // Subject clearly detected - use specific instructions
      return {
        needsVisual: true,
        subject: detectedSubject,
        visualPrompt: this.getVisualInstructionPrompt(detectedSubject),
        useAIDetection: false,
      };
    }

    // PHASE 2: No clear subject, but might be educational
    const mightBeEducational = this.mightBeEducational(query);
    
    if (mightBeEducational) {
      // Let AI decide subject and visual type
      return {
        needsVisual: true,
        subject: null, // AI will determine
        visualPrompt: this.getAIDetectionPrompt(),
        useAIDetection: true,
      };
    }

    // PHASE 3: Doesn't seem educational at all
    // But still include minimal detection prompt - AI might surprise us!
    return {
      needsVisual: false,
      subject: null,
      visualPrompt: null,
      useAIDetection: false,
    };
  }

  /**
   * NEW: Process query with full AI detection (always include detection prompt)
   * Use this when you want AI to always have the option to generate visuals
   */
  processQueryWithAIDetection(query: string): {
    visualPrompt: string;
    detectedSubject: VisualSubject | null;
  } {
    const detectedSubject = this.quickSubjectCheck(query);
    
    // Always return the AI detection prompt
    // If subject detected, also include subject-specific instructions
    let visualPrompt = this.getAIDetectionPrompt();
    
    if (detectedSubject) {
      visualPrompt += '\n\n' + this.getVisualInstructionPrompt(detectedSubject);
    }

    return {
      visualPrompt,
      detectedSubject,
    };
  }

  /**
   * Get subject emoji for UI
   */
  getSubjectEmoji(subject: VisualSubject): string {
    const emojis: Record<VisualSubject, string> = {
      maths: '📐',
      physics: '⚡',
      chemistry: '🧪',
      biology: '🧬',
      economics: '📈',
      geography: '🌍',
      'computer-science': '💻',
    };
    return emojis[subject] || '📚';
  }

  /**
   * Get subject display name
   */
  getSubjectDisplayName(subject: VisualSubject): string {
    const names: Record<VisualSubject, string> = {
      maths: 'Mathematics',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
      economics: 'Economics',
      geography: 'Geography',
      'computer-science': 'Computer Science',
    };
    return names[subject] || subject;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NEW v3.0: IMAGE SEARCH METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Search for educational image from web
   */
  async searchEducationalImage(
    query: string,
    subject?: VisualSubject
  ): Promise<ImageVisual | null> {
    try {
      if (!imageSearchService.isConfigured()) {
        console.log('[VisualEngine] ⚠️ Image search not configured');
        return null;
      }

      const topic = this.extractVisualTopic(query);
      const searchQuery = subject ? `${subject} ${topic}` : topic;

      console.log(`[VisualEngine] 🔍 Searching image: "${searchQuery}"`);

      const result = await imageSearchService.searchImages(searchQuery, {
        count: 1,
        addEducational: true,
      });

      if (result.images.length > 0) {
        const img = result.images[0];
        console.log(`[VisualEngine] ✅ Image found: ${img.source}`);
        
        return {
          type: 'image',
          imageUrl: img.imageUrl,
          thumbnailUrl: img.thumbnailUrl,
          title: img.title,
          source: img.source,
          sourceUrl: img.sourceUrl,
          width: img.width,
          height: img.height,
        };
      }

      return null;
    } catch (error) {
      console.error('[VisualEngine] ❌ Image search error:', error);
      return null;
    }
  }

  /**
   * Process query with Image Search priority
   * Try real images first, fallback to SVG
   */
  async processQueryWithImageSearch(query: string): Promise<{
    needsVisual: boolean;
    subject: VisualSubject | null;
    imageVisual: ImageVisual | null;
    shouldGenerateSVG: boolean;
    visualPrompt: string | null;
  }> {
    const subject = this.quickSubjectCheck(query);
    const isEducational = this.mightBeEducational(query);
    
    if (!subject && !isEducational) {
      return {
        needsVisual: false,
        subject: null,
        imageVisual: null,
        shouldGenerateSVG: false,
        visualPrompt: null,
      };
    }

    // Try image search first
    const imageVisual = await this.searchEducationalImage(query, subject || undefined);
    
    if (imageVisual) {
      return {
        needsVisual: true,
        subject: subject || 'general' as VisualSubject,
        imageVisual,
        shouldGenerateSVG: false,
        visualPrompt: null,
      };
    }

    // Fallback to SVG generation
    const visualPrompt = subject 
      ? this.getVisualInstructionPrompt(subject)
      : this.getAIDetectionPrompt();

    return {
      needsVisual: true,
      subject,
      imageVisual: null,
      shouldGenerateSVG: true,
      visualPrompt,
    };
  }

  /**
   * Extract topic from query for better image search
   */
  extractVisualTopic(query: string): string {
    let topic = query
      .replace(/^(explain|describe|what is|how does|show|draw|visualize|samjhao|batao|kya hai|kaise)\s*/i, '')
      .replace(/\?+$/, '')
      .trim();
    
    return topic.length >= 5 ? topic : query;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const visualEngineService = new VisualEngineService();
export default visualEngineService;