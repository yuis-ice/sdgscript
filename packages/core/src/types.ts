/**
 * SDGScript Core Types
 * SDGs目標と影響度の定義
 */

export enum SDGGoal {
  Goal1 = 'Goal1_NoPoverty',
  Goal2 = 'Goal2_ZeroHunger', 
  Goal3 = 'Goal3_GoodHealth',
  Goal4 = 'Goal4_QualityEducation',
  Goal5 = 'Goal5_GenderEquality',
  Goal6 = 'Goal6_CleanWater',
  Goal7 = 'Goal7_AffordableEnergy',
  Goal8 = 'Goal8_DecentWork',
  Goal9 = 'Goal9_Innovation',
  Goal10 = 'Goal10_ReducedInequalities',
  Goal11 = 'Goal11_SustainableCities',
  Goal12 = 'Goal12_ResponsibleConsumption',
  Goal13 = 'Goal13_ClimateAction',
  Goal14 = 'Goal14_LifeBelowWater',
  Goal15 = 'Goal15_LifeOnLand',
  Goal16 = 'Goal16_Peace',
  Goal17 = 'Goal17_Partnerships'
}

export enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ImpactCategory {
  ENVIRONMENT = 'environment',
  SOCIAL = 'social',
  ECONOMIC = 'economic',
  GOVERNANCE = 'governance'
}

export interface SDGAnnotation {
  goal: SDGGoal;
  carbonBudget?: number; // kWh
  impact?: {
    category: ImpactCategory;
    level: ImpactLevel;
  };
  description?: string;
  tags?: string[];
}

export interface ResourceMetrics {
  energy?: number; // kWh
  emissions?: number; // gCO2
  memory?: number; // MB
  networkCalls?: number;
  ioOperations?: number;
  computeComplexity?: number; // O(n), O(n²), etc.
}

export interface SDGAnalysisResult {
  functionName: string;
  filePath: string;
  line: number;
  sdgAnnotations: SDGAnnotation[];
  estimatedMetrics: ResourceMetrics;
  violations: Violation[];
  score: number; // 0-100
}

export interface Violation {
  type: 'carbon_budget_exceeded' | 'inefficient_algorithm' | 'high_impact_no_annotation' | 'missing_sdg_context';
  severity: 'warning' | 'error';
  message: string;
  suggestion?: string;
}

export interface CompilerOptions {
  enableSDGChecks: boolean;
  carbonBudgetDefault: number;
  strictMode: boolean;
  outputFormat: 'json' | 'html' | 'markdown';
}
