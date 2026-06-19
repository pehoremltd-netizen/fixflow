export interface GeneratorInput {
  ratedPowerKva: number;
  powerFactor: number;
  loadFactorPercent: number;
  hoursPerDay: number;
  daysPerWeek: number;
}

export interface GeneratorOutput {
  ratedPowerKw: number;
  actualLoadKw: number;
  loadFactorDecimal: number;
  dailyEnergyKwh: number;
  weeklyEnergyKwh: number;
  monthlyEnergyKwh: number;
  utilizationPercent: number;
}

export interface DieselInput {
  generatorCapacityKva: number;
  loadFactorPercent: number;
  hoursPerDay: number;
  daysPerWeek: number;
  specificFuelConsumption: number;
  fuelPricePerLitre: number;
}

export interface DieselOutput {
  dailyConsumptionLitres: number;
  weeklyConsumptionLitres: number;
  monthlyConsumptionLitres: number;
  annualConsumptionLitres: number;
  monthlyCost: number;
  annualCost: number;
  fuelPricePerLitre: number;
}

export interface WaterDemandInput {
  numberOfOccupants: number;
  dailyConsumptionPerCapitaLitres: number;
  daysPerWeek: number;
  peakFactor: number;
}

export interface WaterDemandOutput {
  averageDailyDemandLitres: number;
  peakDailyDemandLitres: number;
  weeklyDemandLitres: number;
  monthlyDemandLitres: number;
  annualDemandLitres: number;
  averageDailyDemandM3: number;
  peakDailyDemandM3: number;
}

export interface PumpSizingInput {
  flowRateRequiredM3H: number;
  totalDynamicHeadM: number;
  fluidDensityKgM3: number;
  pumpEfficiencyPercent: number;
  motorSafetyFactorPercent: number;
}

export interface PumpSizingOutput {
  hydraulicPowerKw: number;
  shaftPowerKw: number;
  motorPowerKw: number;
  recommendedMotorPowerKw: number;
  flowRateLS: number;
}

export interface ElectricalLoadInput {
  loads: ElectricalLoadItem[];
  diversityFactorPercent: number;
  futureExpansionPercent: number;
}

export interface ElectricalLoadItem {
  description: string;
  quantity: number;
  wattagePerUnit: number;
  usageHoursPerDay: number;
  daysPerWeek: number;
}

export interface ElectricalLoadOutput {
  totalInstalledLoadW: number;
  totalInstalledLoadKw: number;
  diversifiedLoadKw: number;
  futureLoadKw: number;
  loads: ElectricalLoadItemResult[];
  dailyEnergyKwh: number;
  weeklyEnergyKwh: number;
  monthlyEnergyKwh: number;
}

export interface ElectricalLoadItemResult {
  description: string;
  quantity: number;
  wattagePerUnit: number;
  totalWatts: number;
  totalKw: number;
  dailyKwh: number;
  weeklyKwh: number;
}

export type CalculationType =
  | "generator"
  | "diesel"
  | "water"
  | "pump"
  | "electrical";

export interface CalculationLogEntry {
  id: string;
  type: CalculationType;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  timestamp: string;
  user: string;
  status: "success" | "error";
  errorMessage?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export type CalcInput =
  | GeneratorInput
  | DieselInput
  | WaterDemandInput
  | PumpSizingInput
  | ElectricalLoadInput;

export type CalcOutput =
  | GeneratorOutput
  | DieselOutput
  | WaterDemandOutput
  | PumpSizingOutput
  | ElectricalLoadOutput;

export interface EngineResult<T extends CalcOutput> {
  success: boolean;
  data?: T;
  errors: string[];
  errorCode?: ErrorCode;
  timestamp: string;
}

export type ErrorCode =
  | "INVALID_INPUT"
  | "CALCULATION_ERROR"
  | "INCOMPLETE_DATA"
  | "SYSTEM_FAILURE";

export interface CalculationRecord {
  id: string;
  type: CalculationType;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  timestamp: string;
  user: string;
  status: "success" | "error";
  errorCode?: ErrorCode;
  errorMessage?: string;
  mode: "calculated";
}
