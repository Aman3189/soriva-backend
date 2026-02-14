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
    /** NEW v2.1: Dynamic render instructions for Approach B */
    renderInstructions?: RenderInstructions;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUBJECT DETECTION PATTERNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUBJECT_PATTERNS: Record<VisualSubject, RegExp> = {
  maths: /\b(pythagoras|theorem|triangle|circle|radius|diameter|area|perimeter|graph|equation|quadratic|linear|parabola|slope|intercept|geometry|angle|polygon|sine|cosine|tangent|trigonometry|function|calculus|derivative|integral|algebra|coordinate|number\s*line|venn\s*diagram|set\s*theory|matrix|matrices|determinant|probability|permutation|combination|factorial|quadrilateral|rectangle|square|parallelogram|rhombus|trapezoid|cube|cuboid|sphere|cylinder|cone|pyramid|fraction|percentage|ratio|proportion)\b/i,
  
  physics: /\b(circuit|resistor|capacitor|ohm|voltage|current|force|newton|gravity|projectile|motion|velocity|acceleration|wave|frequency|amplitude|wavelength|optics|lens|mirror|refraction|reflection|pendulum|oscillation|pulley|inclined\s*plane|friction|momentum|energy|power|work|magnetic|magnet|field|solenoid|ray\s*diagram|thermodynamics|heat|temperature|entropy|electric\s*field|charge|coulomb|spring|hooke)\b/i,
  
  chemistry: /\b(molecule|atom|element|periodic\s*table|electron|proton|neutron|bond|covalent|ionic|reaction|equation|balance|oxidation|reduction|redox|acid|base|ph|orbital|valence|compound|formula|h2o|co2|nacl|chemical|distillation|fractional|chromatography|titration|electrolysis|combustion|fermentation|polymerization|catalyst|solution|solvent|solute|mixture|separation|phase\s*diagram|lab\s*setup|apparatus|beaker|flask|burette)\b/i,
  
  biology: /\b(cell|mitochondria|nucleus|dna|rna|chromosome|gene|protein|enzyme|photosynthesis|respiration|mitosis|meiosis|organ|tissue|plant|animal|bacteria|virus|ecosystem|food\s*chain|evolution|anatomy|body\s*system|heart|lung|brain|digestive|respiratory|circulatory|nervous|skeletal|muscular|neuron|synapse|hormone|endocrine|immune|antibody|antigen|krebs|glycolysis|atp)\b/i,
  
  economics: /\b(supply|demand|equilibrium|price|market|gdp|inflation|unemployment|fiscal|monetary|trade|export|import|economy|growth|recession|interest\s*rate|budget|tax|revenue|cost|profit|loss|elasticity|production\s*possibility|circular\s*flow|market\s*structure|monopoly|oligopoly|phillips\s*curve)\b/i,
  
  geography: /\b(map|continent|country|ocean|river|mountain|climate|weather|latitude|longitude|equator|tropics|desert|forest|rainfall|temperature|water\s*cycle|erosion|volcano|earthquake|plate\s*tectonics|atmosphere|layers\s*of\s*earth|tectonic|rock\s*cycle|igneous|sedimentary|metamorphic|carbon\s*cycle|biome|ecosystem|ocean\s*current)\b/i,

  // NEW: Computer Science - Extended patterns
  'computer-science': /\b(algorithm|flowchart|data\s*structure|array|linked\s*list|stack|queue|tree|binary\s*tree|bst|graph|sorting|bubble\s*sort|merge\s*sort|quick\s*sort|heap|hash|database|erd|entity\s*relationship|sql|network|router|server|ip\s*address|uml|class\s*diagram|state\s*machine|automata|turing|complexity|big\s*o|recursion|iteration|loop|function|variable|oop|object\s*oriented|cpu|processor|computer\s*works|how\s*computer|ram|memory|storage|alu|control\s*unit|artificial\s*intelligence|machine\s*learning|neural\s*network|how\s*ai|ai\s*works|ml\s*works|deep\s*learning|how\s*internet|internet\s*works|dns|http|tcp|ip|client\s*server|dbms|database\s*management|crud|select|insert|programming|coding|compiler|interpreter|operating\s*system|os|process|thread)\b/i,
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

  /**
   * NEW: Generate AI detection prompt (v3.0 - FULLY DYNAMIC)
   * AI automatically decides: Legacy types OR renderInstructions
   * User ko kuch nahi pata - seamless experience!
   */
  getAIDetectionPrompt(): string {
    return `
SORIVA VISUAL ENGINE v3.0 - FULLY DYNAMIC
═══════════════════════════════════════════════════════════════════════════════

You are Soriva AI - an intelligent educational visual generator. 
For educational queries, you MUST generate beautiful, accurate visuals.

STEP 1: DETECT IF VISUAL IS NEEDED
───────────────────────────────────
✅ GENERATE VISUAL when:
- Explaining how something works (kaise kaam karta hai, how does X work)
- Describing structures, processes, cycles, systems
- Mathematical concepts (geometry, graphs, equations)
- Scientific diagrams (physics, chemistry, biology)
- Technical concepts (algorithms, data structures, networks)
- Comparisons, relationships, hierarchies

❌ DON'T GENERATE VISUAL for:
- Simple factual questions (dates, names, definitions)
- Opinions or recommendations
- General conversation, greetings
- Code writing (unless visualizing algorithm)

STEP 2: AUTOMATIC RENDERING DECISION
───────────────────────────────────
You have TWO rendering modes. Choose automatically:

📦 MODE A - STRUCTURED DATA (for standard educational visuals):
Use when the concept fits these predefined types:

MATHS: triangle, circle, graph, parabola, number-line, coordinate-plane, angle, polygon, venn-diagram, quadrilateral, 3d-shapes, matrix, probability-tree, fraction
PHYSICS: circuit, forces, projectile, wave, pendulum, pulley, inclined-plane, magnetic-field, ray-diagram, thermodynamics, electric-field, motion-graph
CHEMISTRY: molecule, periodic-element, reaction, bond, electron-config, orbital, lab-setup, titration-curve, phase-diagram
BIOLOGY: cell, dna, body-system, plant-structure, mitosis, food-chain, human-anatomy, neuron, heart-diagram, ecosystem
ECONOMICS: line-chart, bar-chart, pie-chart, supply-demand, scatter-plot
GEOGRAPHY: water-cycle, layers-earth, tectonic-plates, rock-cycle, carbon-cycle, atmospheric-layers
COMPUTER-SCIENCE: flowchart, data-structure, binary-tree, sorting-visual, graph-structure, network-diagram, erd-diagram, state-machine, cpu-architecture, how-ai-works, database-flow, how-internet-works

⚡ MODE B - RENDER INSTRUCTIONS (for custom/complex visuals):
Use when:
- Query needs a CUSTOM diagram not in predefined types
- Unique visualizations (org charts, custom processes, infographics)
- User asks for specific layout/design
- Combining multiple concepts in one visual
- Any visual that doesn't fit standard educational types

RENDERING DECISION LOGIC:
─────────────────────────
1. Parse the query
2. IF concept matches a predefined type exactly → Use MODE A (structured data)
3. ELSE → Use MODE B (renderInstructions) to create custom visual
4. ALWAYS generate a visual for educational content - NEVER skip!

═══════════════════════════════════════════════════════════════════════════════
MODE A FORMAT (Structured Data):
═══════════════════════════════════════════════════════════════════════════════
\`\`\`soriva-visual
{
  "subject": "maths|physics|chemistry|biology|economics|geography|computer-science",
  "type": "<predefined_type>",
  "title": "<descriptive title>",
  "description": "<one line description>",
  "data": { <type-specific structured data> }
}
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
MODE B FORMAT (Render Instructions - for custom visuals):
═══════════════════════════════════════════════════════════════════════════════

PRIMITIVES AVAILABLE:
- circle: { type: "circle", cx, cy, r, label?, labelPosition?, fill?, stroke?, strokeWidth? }
- rect: { type: "rect", x, y, width, height, rx?, label?, labelPosition?, fill?, stroke? }
- line: { type: "line", x1, y1, x2, y2, dashed?, arrowEnd?, arrowStart?, label?, stroke? }
- arrow: { type: "arrow", from: [x,y], to: [x,y], curved?, bidirectional?, label?, stroke? }
- polygon: { type: "polygon", points: [[x,y], ...], label?, fill?, stroke? }
- ellipse: { type: "ellipse", cx, cy, rx, ry, label?, fill?, stroke? }
- text: { type: "text", x, y, content, fontSize?, fontWeight?, textAnchor?, fill? }
- path: { type: "path", d: "<SVG path>", fill?, stroke? }
- arc: { type: "arc", cx, cy, r, startAngle, endAngle, label?, stroke? }
- image: { type: "image", x, y, content: "<emoji>", size? }
- group: { type: "group", transform?, children: [...primitives] }

COLORS (use these for consistency):
- Primary Blue: #3b82f6
- Success Green: #22c55e  
- Danger Red: #ef4444
- Warning Yellow: #eab308
- Purple: #8b5cf6
- Cyan: #06b6d4
- Orange: #f97316
- Gray: #6b7280
- For fills, use color + "30" for transparency (e.g., "#3b82f630")

\`\`\`soriva-visual
{
  "subject": "<best_matching_subject>",
  "type": "custom-<descriptive-name>",
  "title": "<descriptive title>",
  "description": "<one line description>",
  "renderInstructions": {
    "layout": { "width": 400, "height": 300, "padding": 20 },
    "primitives": [
      // Your primitives here
    ]
  }
}
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
EXAMPLES:
═══════════════════════════════════════════════════════════════════════════════

EXAMPLE 1 - "Explain Pythagoras theorem" → MODE A (predefined type exists)
\`\`\`soriva-visual
{
  "subject": "maths",
  "type": "triangle",
  "title": "Pythagorean Theorem",
  "description": "Right triangle showing a² + b² = c²",
  "data": {
    "type": "right",
    "sides": { "a": 3, "b": 4, "c": 5 },
    "showRightAngle": true
  }
}
\`\`\`

EXAMPLE 2 - "Show pizza ordering process" → MODE B (custom, no predefined type)
\`\`\`soriva-visual
{
  "subject": "computer-science",
  "type": "custom-process-flow",
  "title": "Pizza Ordering Process",
  "description": "Step-by-step pizza ordering flow",
  "renderInstructions": {
    "layout": { "width": 450, "height": 200 },
    "primitives": [
      { "type": "rect", "x": 20, "y": 70, "width": 80, "height": 50, "rx": 8, "label": "Order", "fill": "#3b82f630", "stroke": "#3b82f6" },
      { "type": "rect", "x": 140, "y": 70, "width": 80, "height": 50, "rx": 8, "label": "Prepare", "fill": "#f9731630", "stroke": "#f97316" },
      { "type": "rect", "x": 260, "y": 70, "width": 80, "height": 50, "rx": 8, "label": "Deliver", "fill": "#8b5cf630", "stroke": "#8b5cf6" },
      { "type": "rect", "x": 380, "y": 70, "width": 80, "height": 50, "rx": 8, "label": "Enjoy!", "fill": "#22c55e30", "stroke": "#22c55e" },
      { "type": "arrow", "from": [100, 95], "to": [140, 95], "stroke": "#6b7280" },
      { "type": "arrow", "from": [220, 95], "to": [260, 95], "stroke": "#6b7280" },
      { "type": "arrow", "from": [340, 95], "to": [380, 95], "stroke": "#6b7280" },
      { "type": "text", "x": 230, "y": 170, "content": "🍕 Pizza Ordering Flow", "fontSize": 13, "fontWeight": "bold", "textAnchor": "middle" }
    ]
  }
}
\`\`\`

EXAMPLE 3 - "How does a neural network learn?" → MODE A (predefined type exists)
\`\`\`soriva-visual
{
  "subject": "computer-science",
  "type": "how-ai-works",
  "title": "How Neural Network Learns",
  "description": "AI learning process from data to prediction",
  "data": {
    "showNeuralNetwork": true,
    "showTrainingProcess": true,
    "showPrediction": true
  }
}
\`\`\`

EXAMPLE 4 - "Draw my startup's funding stages" → MODE B (custom business visual)
\`\`\`soriva-visual
{
  "subject": "economics",
  "type": "custom-funding-stages",
  "title": "Startup Funding Journey",
  "description": "From idea to IPO",
  "renderInstructions": {
    "layout": { "width": 500, "height": 180 },
    "primitives": [
      { "type": "circle", "cx": 50, "cy": 90, "r": 30, "label": "Idea", "fill": "#6b728030", "stroke": "#6b7280" },
      { "type": "circle", "cx": 150, "cy": 90, "r": 35, "label": "Seed", "fill": "#22c55e30", "stroke": "#22c55e" },
      { "type": "circle", "cx": 260, "cy": 90, "r": 40, "label": "Series A", "fill": "#3b82f630", "stroke": "#3b82f6" },
      { "type": "circle", "cx": 380, "cy": 90, "r": 45, "label": "Series B", "fill": "#8b5cf630", "stroke": "#8b5cf6" },
      { "type": "circle", "cx": 500, "cy": 90, "r": 50, "label": "IPO 🚀", "fill": "#f9731630", "stroke": "#f97316" },
      { "type": "arrow", "from": [80, 90], "to": [115, 90], "stroke": "#9ca3af" },
      { "type": "arrow", "from": [185, 90], "to": [220, 90], "stroke": "#9ca3af" },
      { "type": "arrow", "from": [300, 90], "to": [335, 90], "stroke": "#9ca3af" },
      { "type": "arrow", "from": [425, 90], "to": [450, 90], "stroke": "#9ca3af" }
    ]
  }
}
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
CRITICAL RULES:
═══════════════════════════════════════════════════════════════════════════════
1. ALWAYS include visual JSON at END of your response
2. NEVER skip visuals for educational content
3. Choose MODE A for standard concepts, MODE B for custom/unique visuals
4. Make visuals BEAUTIFUL - good colors, proper spacing, clear labels
5. Keep renderInstructions layout reasonable (300-500px width typically)
6. Test your coordinates mentally - elements should not overlap
7. Use emojis sparingly in labels for visual appeal

Remember: You are Soriva AI - make learning visual and beautiful! ✨
`;
  }

  /**
   * Get subject-specific visual instructions
   * Used when we already know the subject
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
- "triangle": For triangles, Pythagoras
  data: { type: "right"|"equilateral"|"isosceles"|"scalene", sides: {a, b, c}, angles?: {A, B, C}, labels?: {...}, showRightAngle?: boolean }
  
- "circle": For circle geometry
  data: { radius: number, showRadius?: boolean, showDiameter?: boolean, showArea?: boolean, sectors?: [...] }
  
- "graph": For functions, equations
  data: { type: "linear"|"quadratic"|"sine"|"cosine"|"exponential", equation: string, points?: [...], xRange: [min, max], yRange: [min, max] }
  
- "number-line": For number representation
  data: { min: number, max: number, points: [{value, label?, color?}], intervals?: number }
  
- "coordinate-plane": For coordinate geometry
  data: { xRange: [min, max], yRange: [min, max], points: [{x, y, label?}], lines?: [...] }
  
- "angle": For angles
  data: { degrees: number, showArc?: boolean, type?: "acute"|"right"|"obtuse"|"straight"|"reflex" }

- "quadrilateral": For 4-sided shapes
  data: { type: "square"|"rectangle"|"parallelogram"|"rhombus"|"trapezoid"|"kite", sides: {a, b, c, d}, angles?: {...}, showDiagonals?: boolean }

- "3d-shapes": For 3D geometry
  data: { type: "cube"|"cuboid"|"sphere"|"cylinder"|"cone"|"pyramid"|"prism", dimensions: {...}, showVolume?: boolean, showSurfaceArea?: boolean, viewAngle?: "isometric"|"front" }

- "matrix": For matrices
  data: { rows: number, cols: number, values: [[...]], operation?: "add"|"multiply"|"transpose"|"determinant"|"inverse", secondMatrix?: [[...]], result?: [[...]] }

- "probability-tree": For probability
  data: { levels: [{branches: [{label, probability, outcome?}]}], showProbabilities?: boolean, showOutcomes?: boolean }

- "venn-diagram": For sets
  data: { sets: [{label, elements?, color?}], intersections?: [{sets: [0,1], elements?}], showLabels?: boolean }

- "fraction": For fractions
  data: { numerator: number, denominator: number, visualType: "pie"|"bar"|"rectangle", showDecimal?: boolean, showPercentage?: boolean }

EXAMPLE for Pythagoras:
\`\`\`soriva-visual
{
  "subject": "maths",
  "type": "triangle",
  "title": "Right Triangle (3-4-5)",
  "description": "Pythagorean theorem: a² + b² = c²",
  "data": {
    "type": "right",
    "sides": { "a": 3, "b": 4, "c": 5 },
    "labels": { "a": "a = 3", "b": "b = 4", "c": "c = 5" },
    "showRightAngle": true
  }
}
\`\`\`
`,

      physics: `
PHYSICS VISUAL TYPES:
- "circuit": For electrical circuits
  data: { components: [{type: "resistor"|"battery"|"bulb"|"capacitor"|"ammeter"|"voltmeter"|"switch"|"diode"|"led", value?, label?, position: {x, y}}], connections: [{from, to}], circuitType: "series"|"parallel"|"mixed" }
  
- "forces": For force diagrams (FBD)
  data: { object: {shape: "box"|"circle", mass?}, forces: [{direction: "up"|"down"|"left"|"right", magnitude, label, color?}], showNetForce?: boolean }
  
- "projectile": For projectile motion
  data: { initialVelocity: number, angle: number, showTrajectory?: boolean, showComponents?: boolean, maxHeight?, range?, timeOfFlight? }
  
- "wave": For waves
  data: { type: "transverse"|"longitudinal", amplitude: number, wavelength: number, frequency?, showLabels?: boolean }
  
- "pendulum": For pendulum
  data: { length: number, angle: number, showForces?: boolean, showPeriodFormula?: boolean }

- "magnetic-field": For magnetism
  data: { source: "bar-magnet"|"solenoid"|"wire"|"loop", showFieldLines?: boolean, showDirection?: boolean, poles?: {...}, current?: number }

- "ray-diagram": For optics (lens/mirror)
  data: { opticsType: "lens"|"mirror", lensType?: "convex"|"concave", mirrorType?: "concave"|"convex"|"plane", objectDistance: number, focalLength: number, showPrincipalRays?: boolean, showImage?: boolean, imageProperties?: {...} }

- "thermodynamics": For heat/thermodynamics
  data: { processType: "isothermal"|"adiabatic"|"isobaric"|"isochoric"|"cycle", pvDiagram?: {points: [...], showWork?}, cycle?: "carnot"|"otto"|"diesel", showHeatFlow?: boolean }

- "electric-field": For electric fields
  data: { charges: [{type: "positive"|"negative", magnitude, position: {x, y}}], showFieldLines?: boolean, showEquipotential?: boolean }

- "motion-graph": For kinematics graphs
  data: { graphType: "displacement-time"|"velocity-time"|"acceleration-time", data: [{t, value}], showArea?: boolean, showSlope?: boolean }

EXAMPLE for Forces:
\`\`\`soriva-visual
{
  "subject": "physics",
  "type": "forces",
  "title": "Free Body Diagram",
  "description": "Forces on a box on ground",
  "data": {
    "object": { "shape": "box", "mass": 10 },
    "forces": [
      { "direction": "down", "magnitude": 98, "label": "Weight (mg)", "color": "#ef4444" },
      { "direction": "up", "magnitude": 98, "label": "Normal (N)", "color": "#22c55e" }
    ],
    "showNetForce": true
  }
}
\`\`\`
`,

      chemistry: `
CHEMISTRY VISUAL TYPES:
- "molecule": For molecular structures
  data: { formula: string, name: string, atoms: [{element, position: {x, y}, color?}], bonds: [{from, to, type: "single"|"double"|"triple"}], structure?: "2d"|"3d" }
  
- "periodic-element": For element info
  data: { symbol: string, name: string, atomicNumber: number, atomicMass: number, category: string, electronConfig?: string }
  
- "reaction": For chemical equations
  data: { reactants: [{formula, coefficient?, state?}], products: [{formula, coefficient?, state?}], conditions?: string, reactionType?: "combination"|"decomposition"|"displacement"|"redox"|"combustion", isBalanced?: boolean, showArrow?: "single"|"double"|"equilibrium" }

- "process-diagram": For lab processes
  data: { processType: "distillation"|"fractional-distillation"|"chromatography"|"electrolysis"|"titration"|"filtration"|"crystallization"|"fermentation", steps: [{name, description?, temperature?, equipment?}], apparatus?: [...], showLabels?: boolean, showFlow?: boolean }

- "lab-setup": For experimental setups
  data: { experiment: string, apparatus: [{name, type: "beaker"|"flask"|"burette"|"pipette"|"test-tube"|"bunsen-burner"|"condenser"|"funnel"|"stand"|"thermometer", position: {x, y}, contents?, label?}], connections?: [...], annotations?: [...] }

- "titration-curve": For titration
  data: { acidType: "strong"|"weak", baseType: "strong"|"weak", equivalencePoint: {volume, pH}, bufferRegion?: {start, end}, showIndicatorRange?: {name, pHRange: [min, max]} }

- "phase-diagram": For phases of matter
  data: { substance: string, triplePoint?: {temperature, pressure}, criticalPoint?: {temperature, pressure}, regions?: [{phase, label?}], showCurrentState?: {temperature, pressure} }

EXAMPLE for Process Diagram:
\`\`\`soriva-visual
{
  "subject": "chemistry",
  "type": "process-diagram",
  "title": "Simple Distillation",
  "description": "Separating liquids with different boiling points",
  "data": {
    "processType": "distillation",
    "steps": [
      { "name": "Heating", "description": "Liquid mixture is heated in flask", "equipment": ["round-bottom flask", "bunsen burner"] },
      { "name": "Vaporization", "description": "Lower boiling point liquid vaporizes first" },
      { "name": "Condensation", "description": "Vapor passes through condenser, cools down", "equipment": ["condenser"] },
      { "name": "Collection", "description": "Pure liquid collected in receiving flask", "equipment": ["conical flask"] }
    ],
    "showLabels": true,
    "showFlow": true
  }
}
\`\`\`
`,

      biology: `
BIOLOGY VISUAL TYPES:
- "cell": For cell diagrams
  data: { type: "animal"|"plant"|"bacteria"|"prokaryotic"|"eukaryotic", organelles: [{name, label?, highlight?, function?}], showLabels?: boolean, showFunctions?: boolean }
  
- "dna": For DNA structure
  data: { sequence?: string, showBasePairs?: boolean, showBackbone?: boolean, highlightRegion?: {start, end, label}, showReplication?: boolean, showTranscription?: boolean }

- "process-diagram": For biological processes
  data: { processType: "photosynthesis"|"respiration"|"cellular-respiration"|"krebs-cycle"|"glycolysis"|"protein-synthesis"|"nitrogen-cycle"|"carbon-cycle", stages: [{name, location?, inputs?, outputs?, description?}], showInputOutput?: boolean, showATP?: boolean, showEnergy?: boolean }

- "human-anatomy": For body systems
  data: { system: "skeletal"|"muscular"|"circulatory"|"respiratory"|"digestive"|"nervous"|"endocrine"|"reproductive"|"urinary"|"immune", viewType: "full-body"|"organ"|"cross-section", organs?: [{name, label?, highlight?, function?}], showLabels?: boolean, showBloodFlow?: boolean }

- "heart-diagram": For heart structure
  data: { showChambers?: boolean, showValves?: boolean, showBloodFlow?: boolean, highlightPart?: "left-atrium"|"right-atrium"|"left-ventricle"|"right-ventricle"|"aorta"|"pulmonary", showOxygenated?: boolean, showDeoxygenated?: boolean }

- "neuron": For nerve cells
  data: { type: "sensory"|"motor"|"inter", showParts?: boolean, showSynapse?: boolean, showSignalDirection?: boolean, highlightPart?: "dendrite"|"axon"|"cell-body"|"myelin"|"terminal" }

- "ecosystem": For ecosystems
  data: { type: "forest"|"ocean"|"desert"|"grassland"|"tundra"|"freshwater", organisms: [{name, role: "producer"|"primary-consumer"|"secondary-consumer"|"tertiary-consumer"|"decomposer", position?}], showFoodWeb?: boolean, showEnergyFlow?: boolean }

- "food-chain": For food chains/webs
  data: { levels: [{trophicLevel, organisms: [...], energyPercent?}], showEnergyTransfer?: boolean, showPyramid?: boolean, pyramidType?: "energy"|"biomass"|"numbers" }

EXAMPLE for Photosynthesis:
\`\`\`soriva-visual
{
  "subject": "biology",
  "type": "process-diagram",
  "title": "Photosynthesis Process",
  "description": "How plants convert light energy to chemical energy",
  "data": {
    "processType": "photosynthesis",
    "stages": [
      { "name": "Light Absorption", "location": "Chloroplast (Thylakoid)", "inputs": ["Sunlight"], "description": "Chlorophyll absorbs light energy" },
      { "name": "Water Splitting", "location": "Thylakoid membrane", "inputs": ["H₂O"], "outputs": ["O₂", "H⁺", "electrons"], "description": "Photolysis releases oxygen" },
      { "name": "ATP Formation", "location": "Thylakoid", "outputs": ["ATP", "NADPH"], "description": "Light reactions produce energy carriers" },
      { "name": "Carbon Fixation", "location": "Stroma", "inputs": ["CO₂", "ATP", "NADPH"], "outputs": ["Glucose (C₆H₁₂O₆)"], "description": "Calvin cycle produces sugar" }
    ],
    "showInputOutput": true,
    "showEnergy": true
  }
}
\`\`\`
`,

      economics: `
ECONOMICS VISUAL TYPES:
- "supply-demand": For market equilibrium
  data: { equilibriumPrice: number, equilibriumQuantity: number, supplyShift?: "left"|"right"|"none", demandShift?: "left"|"right"|"none", showEquilibrium?: boolean, showSurplus?: boolean, showShortage?: boolean, showPriceFloor?: number, showPriceCeiling?: number }
  
- "line-chart": For trends/growth
  data: { title?: string, xAxis: {label, values: [...]}, yAxis: {label, min, max}, datasets: [{label, data: [...], color?}] }

- "production-possibility": For PPC/PPF
  data: { goodX: {name, max}, goodY: {name, max}, currentPoint?: {x, y}, showOpportunityCost?: boolean, showEfficiency?: boolean, curveType?: "concave"|"linear"|"convex" }

- "circular-flow": For circular flow model
  data: { sectors: ["households", "firms", "government"?, "financial"?, "foreign"?], flows: [{from, to, label, type: "money"|"goods"|"services"|"factors"}], showInjections?: boolean, showLeakages?: boolean }

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
- "water-cycle": For water cycle
  data: { stages: [{name, description?, position?}], showArrows?: boolean, showSun?: boolean, showClouds?: boolean }
  
- "layers-earth": For Earth's structure
  data: { layers: [{name, thickness, temperature?, composition?, color?}], showLabels?: boolean, showScale?: boolean }

- "tectonic-plates": For plate tectonics
  data: { plates: [{name, type: "continental"|"oceanic", movement?}], boundaries: [{type: "convergent"|"divergent"|"transform", plates: [name1, name2], features?}], showEarthquakeZones?: boolean, showVolcanoes?: boolean }

- "rock-cycle": For rock cycle
  data: { rocks: [{type: "igneous"|"sedimentary"|"metamorphic", examples?}], processes: [{name, from, to}], showArrows?: boolean }

- "atmospheric-layers": For atmosphere
  data: { layers: [{name, altitude: {min, max}, temperature?: {min, max}, features?}], showOzoneLayer?: boolean, showAircraft?: boolean, showSatellites?: boolean }

- "carbon-cycle": For carbon cycle
  data: { reservoirs: [{name, carbonAmount?, position?}], fluxes: [{from, to, process, rate?}], showHumanImpact?: boolean }

EXAMPLE for Water Cycle:
\`\`\`soriva-visual
{
  "subject": "geography",
  "type": "water-cycle",
  "title": "The Water Cycle",
  "description": "Continuous movement of water on Earth",
  "data": {
    "stages": [
      { "name": "Evaporation", "description": "Sun heats water, turning it to vapor" },
      { "name": "Transpiration", "description": "Plants release water vapor" },
      { "name": "Condensation", "description": "Vapor cools and forms clouds" },
      { "name": "Precipitation", "description": "Water falls as rain/snow" },
      { "name": "Collection", "description": "Water collects in oceans, lakes, rivers" },
      { "name": "Infiltration", "description": "Water seeps into groundwater" }
    ],
    "showArrows": true,
    "showSun": true,
    "showClouds": true
  }
}
\`\`\`
`,

      'computer-science': `
COMPUTER SCIENCE VISUAL TYPES:
- "flowchart": For algorithms/logic
  data: { title?: string, nodes: [{id, type: "start"|"end"|"process"|"decision"|"input"|"output"|"connector", label, position?}], edges: [{from, to, label?}] }
  
- "data-structure": For arrays, lists, etc.
  data: { type: "array"|"linked-list"|"stack"|"queue"|"hash-table"|"heap", elements: [{value, index?, pointer?, highlight?}], operations?: [{name, steps?}], showIndices?: boolean, showPointers?: boolean }

- "binary-tree": For trees
  data: { type: "binary"|"bst"|"avl"|"heap"|"complete", nodes: [{value, left?, right?, highlight?, color?}], rootIndex: number, showTraversal?: "inorder"|"preorder"|"postorder"|"levelorder", highlightPath?: [...] }

- "linked-list": For linked list visualization
  data: { nodes: [{value, next?}], showPointers?: boolean }

- "stack-queue": For stack vs queue comparison
  data: { stackElements?: [...], queueElements?: [...], showOperations?: boolean }

- "graph-structure": For graphs
  data: { type: "directed"|"undirected"|"weighted", nodes: [{id, label?, position?, highlight?}], edges: [{from, to, weight?, highlight?}], showWeights?: boolean, algorithm?: "bfs"|"dfs"|"dijkstra"|"kruskal"|"prim" }

- "sorting-visual": For sorting algorithms
  data: { algorithm: "bubble"|"selection"|"insertion"|"merge"|"quick"|"heap", array: [...], currentStep?: number, comparingIndices?: [i, j], swappingIndices?: [i, j], sortedIndices?: [...], pivotIndex?: number }

- "network-diagram": For networking
  data: { devices: [{id, type: "computer"|"server"|"router"|"switch"|"firewall"|"cloud"|"database"|"mobile", label?, ip?, position?}], connections: [{from, to, type?: "wired"|"wireless", bandwidth?}], showIPs?: boolean }

- "erd-diagram": For databases
  data: { entities: [{name, attributes: [{name, type, isPrimary?, isForeign?}], position?}], relationships: [{from, to, type: "one-to-one"|"one-to-many"|"many-to-many", label?}] }

- "state-machine": For FSM/automata
  data: { states: [{id, label, isInitial?, isFinal?, position?}], transitions: [{from, to, trigger, action?}], currentState?: string }

- "cpu-architecture": For how computer/CPU works (BEGINNER FRIENDLY)
  data: { showALU?: boolean, showControlUnit?: boolean, showRegisters?: boolean, showRAM?: boolean, showStorage?: boolean }
  USE FOR: "how computer works", "cpu", "processor", "alu", "computer architecture"

- "how-ai-works": For explaining AI/ML basics (BEGINNER FRIENDLY)
  data: { showNeuralNetwork?: boolean, showTrainingProcess?: boolean, showPrediction?: boolean }
  USE FOR: "how ai works", "machine learning", "neural network", "artificial intelligence", "how ml works"

- "database-flow": For how database works (BEGINNER FRIENDLY)
  data: { showCRUD?: boolean, showSQL?: boolean }
  USE FOR: "how database works", "dbms", "sql", "crud operations"

- "how-internet-works": For how internet works (BEGINNER FRIENDLY)
  data: { showDNS?: boolean, showHTTP?: boolean, showPackets?: boolean }
  USE FOR: "how internet works", "dns", "http", "client server"

EXAMPLE for CPU Architecture (How Computer Works):
\`\`\`soriva-visual
{
  "subject": "computer-science",
  "type": "cpu-architecture",
  "title": "How Computer Works",
  "description": "Basic CPU architecture showing ALU, Control Unit, RAM and Storage",
  "data": {
    "showALU": true,
    "showControlUnit": true,
    "showRegisters": true,
    "showRAM": true,
    "showStorage": true
  }
}
\`\`\`

EXAMPLE for How AI Works:
\`\`\`soriva-visual
{
  "subject": "computer-science",
  "type": "how-ai-works",
  "title": "How AI/Machine Learning Works",
  "description": "Simple explanation of how AI learns from data",
  "data": {
    "showNeuralNetwork": true,
    "showTrainingProcess": true,
    "showPrediction": true
  }
}
\`\`\`

EXAMPLE for Flowchart:
\`\`\`soriva-visual
{
  "subject": "computer-science",
  "type": "flowchart",
  "title": "Check Even or Odd",
  "description": "Flowchart to determine if a number is even or odd",
  "data": {
    "nodes": [
      { "id": "start", "type": "start", "label": "Start" },
      { "id": "input", "type": "input", "label": "Input number N" },
      { "id": "check", "type": "decision", "label": "N % 2 == 0?" },
      { "id": "even", "type": "output", "label": "Print 'Even'" },
      { "id": "odd", "type": "output", "label": "Print 'Odd'" },
      { "id": "end", "type": "end", "label": "End" }
    ],
    "edges": [
      { "from": "start", "to": "input" },
      { "from": "input", "to": "check" },
      { "from": "check", "to": "even", "label": "Yes" },
      { "from": "check", "to": "odd", "label": "No" },
      { "from": "even", "to": "end" },
      { "from": "odd", "to": "end" }
    ]
  }
}
\`\`\`

EXAMPLE for Binary Tree:
\`\`\`soriva-visual
{
  "subject": "computer-science",
  "type": "binary-tree",
  "title": "Binary Search Tree",
  "description": "BST with values inserted in order",
  "data": {
    "type": "bst",
    "nodes": [
      { "value": 50, "left": 1, "right": 2 },
      { "value": 30, "left": 3, "right": 4 },
      { "value": 70, "left": 5, "right": 6 },
      { "value": 20 },
      { "value": 40 },
      { "value": 60 },
      { "value": 80 }
    ],
    "rootIndex": 0,
    "showTraversal": "inorder"
  }
}
\`\`\`
`,
    };

    return baseInstruction + (subjectInstructions[subject] || '');
  }

  /**
   * Parse visual data from AI response (UPDATED v2.2)
   * Now also parses renderInstructions for Approach B
   * v2.2: Strips JavaScript comments from JSON (Mistral sometimes adds these)
   */
  parseVisualFromResponse(response: string): VisualOutput {
    try {
      // Look for the soriva-visual JSON block
      const visualMatch = response.match(/```soriva-visual\s*([\s\S]*?)```/);
      
      if (!visualMatch || !visualMatch[1]) {
        return { hasVisual: false };
      }

      let visualJson = visualMatch[1].trim();
      
      // v2.2 FIX: Remove JavaScript-style comments (Mistral adds these sometimes)
      // Remove single-line comments: // ...
      visualJson = visualJson.replace(/\/\/[^\n]*/g, '');
      // Remove multi-line comments: /* ... */
      visualJson = visualJson.replace(/\/\*[\s\S]*?\*\//g, '');
      // Clean up any resulting empty lines or extra whitespace
      visualJson = visualJson.replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
      visualJson = visualJson.trim();
      
      const visualData = JSON.parse(visualJson);

      // Validate required fields
      if (!visualData.subject || !visualData.type) {
        console.warn('[VisualEngine] Invalid visual data - missing required fields');
        return { hasVisual: false };
      }

      // Build the visual output
      const visual: VisualOutput['visual'] = {
        subject: visualData.subject,
        type: visualData.type,
        title: visualData.title || 'Educational Visual',
        description: visualData.description,
        data: visualData.data || {},
      };

      // NEW v2.1: Check for renderInstructions (Approach B)
      if (visualData.renderInstructions && visualData.renderInstructions.primitives) {
        visual.renderInstructions = visualData.renderInstructions;
      }

      return {
        hasVisual: true,
        visual,
      };
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
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT SINGLETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const visualEngineService = new VisualEngineService();
export default visualEngineService;