export type UserRole = 'ANALYST' | 'MANAGER';

export type BudgetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type BudgetCategory = 'CHEMICAL' | 'BIOLOGICAL';

export type DistributionType = 
  | 'NORMAL_K1'      // Normal (k=1, divisor = 1.0)
  | 'NORMAL_K2'      // Normal (k=2, 95% Sijil Kalibrasi, divisor = 2.0)
  | 'RECTANGULAR'    // Rectangular (Had toleransi pengeluar, divisor = sqrt(3) ≈ 1.73205)
  | 'TRIANGULAR';    // Triangular (Volumetrik glassware, divisor = sqrt(6) ≈ 2.44949)

export interface TypeBComponent {
  id: string;
  source: string;
  value: number; // Semiadmissibility limit / stated uncertainty (a)
  unit: string;
  distribution: DistributionType;
  divisor: number;
  sensitivityCoefficient: number; // ci (default 1.0)
  standardUncertainty: number; // ui = (value / divisor) * ci
  varianceContribution?: number; // %
  equipmentId?: string; // Link to shared equipment library if applicable
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'BALANCE' | 'PIPETTE' | 'FLASK' | 'CRM' | 'THERMOMETER' | 'BURETTE' | 'OTHER';
  code: string; // e.g. "EQ-BAL-01", "CAL-2026-088"
  certificateNo: string;
  calibrationDate: string;
  nextCalibrationDate: string;
  statedUncertainty: number;
  unit: string;
  distribution: DistributionType;
  sensitivityCoefficient: number;
  notes?: string;
}

export interface TypeAData {
  enabled: boolean;
  readings: number[];
  mean: number;
  sd: number; // Sample standard deviation s
  standardUncertainty: number; // uA = s / sqrt(n)
  varianceContribution?: number; // %
}

export interface BiologyData {
  cfuReadings: number[];
  logValues: number[];
  meanLog: number;
  sR: number; // Reproducibility standard deviation (log10 CFU/g)
  uMat: number; // Matrix uncertainty
  uInc: number; // Incubation uncertainty
  uBiol: number; // sqrt(sR^2 + uMat^2 + uInc^2)
  expandedU: number; // 2 * uBiol
  unit: string; // e.g. "log10 CFU/g" or "log10 CFU/mL"
  lodAdvisory: boolean; // True if any 0 CFU was inputted
  zeroReplacedValue?: number; // Suggestion used for LOD
  varianceContribution_sR?: number;
  varianceContribution_uMat?: number;
  varianceContribution_uInc?: number;
}

export interface BudgetResults {
  combinedUncertainty: number; // uc
  coverageFactor: number; // k = 2
  expandedUncertainty: number; // U = uc * 2
  confidenceInterval: string; // "~95%"
  reportedResult: string; // e.g. "0.0522 ± 0.0010 mg/L (k=2, 95% CL)"
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  notes?: string;
}

export interface UncertaintyBudget {
  id: string;
  testName: string;
  testCode: string; // e.g. SOP-CH-042
  category: BudgetCategory;
  matrix: string; // e.g. Potable Water, Foodstuff, Soil
  unit: string; // e.g. mg/L, ug/g, CFU/g
  version: string; // e.g. "1.0", "2.0"
  parentRecordId: string | null;
  status: BudgetStatus;
  preparedBy: string; // Ahmad (Analyst)
  preparedDate: string;
  approvedBy?: string | null; // Dr. Siti (Technical Manager)
  approvedDate?: string | null;
  rejectionReason?: string;
  notes?: string;
  
  // Chemical mode data
  typeA: TypeAData;
  typeBComponents: TypeBComponent[];
  
  // Biological mode data (ISO 19036)
  biologyData?: BiologyData;
  
  // Calculated outcomes
  results: BudgetResults;
  
  // Audit trail
  auditLog: AuditLogEntry[];
  
  createdAt: string;
  updatedAt: string;
}
