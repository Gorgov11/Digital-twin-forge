// ─── Model Library ────────────────────────────────────────────────────────────

export type ModelCategory = 'human' | 'industrial';
export type Complexity = 'LOW' | 'MED' | 'HIGH' | 'ULTRA';
export type GeometryType =
  | 'human-default'
  | 'human-cardiac'
  | 'human-athletic'
  | 'human-child'
  | 'human-surgical'
  | 'turbine'
  | 'cnc-machine'
  | 'robot-arm'
  | 'conveyor'
  | 'hydraulic-press'
  | 'pump'
  | 'offshore-pump';

export interface TwinModel {
  id: string;
  name: string;
  category: ModelCategory;
  complexity: Complexity;
  geometryType: GeometryType;
  description: string;
  tags: string[];
  vertexCount: number;
  polygonCount: number;
  // Human-specific
  organSystems?: string[];
  simulationCompatibility?: string[];
  // Industrial-specific
  industry?: string;
  sensorCount?: number;
  failureModes?: string[];
  maintenanceInterval?: string;
}

// ─── Twin Parameters ──────────────────────────────────────────────────────────

export interface HumanParams {
  // Biometrics
  age: number;
  weight: number; // kg
  height: number; // cm
  biologicalSex: 'male' | 'female';
  // Cardiovascular
  restingHeartRate: number; // bpm
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  vo2Max: number; // ml/kg/min
  ejectionFraction: number; // %
  // Metabolic
  fastingGlucose: number; // mg/dL
  hba1c: number; // %
  totalCholesterol: number; // mg/dL
  ldl: number; // mg/dL
  hdl: number; // mg/dL
  insulinSensitivity: 'high' | 'normal' | 'low' | 'resistant';
  // Lifestyle
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  smokingStatus: 'never' | 'former' | 'current';
  alcoholUnitsPerWeek: number;
  stressIndex: number; // 1–10
  // Medical history
  existingConditions: string[];
  medications: string[];
  // Genetic
  familyHistoryHD: boolean;
  familyHistoryDiabetes: boolean;
  familyHistoryCancer: boolean;
}

export interface IndustrialParams {
  // Asset identity
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  installationDate: string; // ISO date
  // Operating conditions
  rpmMin: number;
  rpmMax: number;
  loadCyclePercent: number; // 0–100
  temperatureMin: number; // °C
  temperatureMax: number; // °C
  environment: 'indoor' | 'outdoor' | 'offshore' | 'cleanroom' | 'arctic';
  // Maintenance
  lastServiceDate: string; // ISO date
  operatingHoursTotal: number;
  openDefects: string[];
  // Sensors
  activeSensorCount: number;
  samplingRateHz: number;
  // Material
  materialGrade: string;
  coatingType: string;
  fatigueLifeHours: number;
  // Operational
  hoursPerDay: number;
  operatorSkillLevel: 'trainee' | 'qualified' | 'expert';
  inspectionFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export type TwinParams = HumanParams | IndustrialParams;

// ─── Twin ─────────────────────────────────────────────────────────────────────

export interface Twin {
  id: string;
  name: string;
  modelId: string;
  category: ModelCategory;
  params: TwinParams;
  healthScore: number; // 0–100
  createdAt: string;
  updatedAt: string;
  simulationCount: number;
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ScenarioCategory =
  | 'cardiovascular'
  | 'metabolic'
  | 'neurological'
  | 'environmental'
  | 'aging'
  | 'mechanical-failure'
  | 'thermal'
  | 'operational-stress'
  | 'maintenance'
  | 'corrosion';

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  category: ScenarioCategory;
  twinCategory: ModelCategory;
  estimatedRisk: RiskLevel;
  durationLabel: string; // e.g. "24-hour simulation"
  tags: string[];
}

// ─── Simulation Report ────────────────────────────────────────────────────────

export interface SimulationPhase {
  timeLabel: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  keyMetrics: { label: string; value: string; delta?: string }[];
}

export interface SimulationFinding {
  severity: RiskLevel;
  title: string;
  detail: string;
}

export interface SimulationRecommendation {
  priority: 'immediate' | 'short-term' | 'long-term';
  action: string;
  rationale: string;
}

export interface SimulationReport {
  id: string;
  twinId: string;
  twinName: string;
  scenarioId: string;
  scenarioName: string;
  overallRisk: RiskLevel;
  executiveSummary: string;
  phases: SimulationPhase[];
  findings: SimulationFinding[];
  recommendations: SimulationRecommendation[];
  generatedAt: string;
  modelUsed: string;
}

export interface Simulation {
  id: string;
  twinId: string;
  twinName: string;
  scenarioId: string;
  scenarioName: string;
  overallRisk: RiskLevel;
  status: 'running' | 'complete' | 'error';
  report?: SimulationReport;
  createdAt: string;
}
