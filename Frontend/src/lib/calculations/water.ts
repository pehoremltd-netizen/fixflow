import type { WaterDemandInput, WaterDemandOutput, ValidationResult } from "./types";

const DEFAULT_CONSUMPTION_PER_CAPITA = 150;
const DEFAULT_PEAK_FACTOR = 1.5;

function isPositiveNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

function isInRange(v: unknown, min: number, max: number): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}

export function validateWaterDemandInput(input: WaterDemandInput): ValidationResult {
  const errors: string[] = [];
  if (!isPositiveNumber(input.numberOfOccupants) || !Number.isInteger(input.numberOfOccupants))
    errors.push("Number of occupants must be a positive integer");
  if (input.dailyConsumptionPerCapitaLitres != null && !isPositiveNumber(input.dailyConsumptionPerCapitaLitres))
    errors.push("Daily consumption per capita must be a positive number");
  if (!isInRange(input.daysPerWeek, 1, 7))
    errors.push("Days per week must be between 1 and 7");
  if (input.peakFactor != null && input.peakFactor < 1)
    errors.push("Peak factor must be at least 1");
  return { valid: errors.length === 0, errors };
}

export function calculateWaterDemand(input: WaterDemandInput): WaterDemandOutput {
  const perCapita = input.dailyConsumptionPerCapitaLitres || DEFAULT_CONSUMPTION_PER_CAPITA;
  const peakFactor = input.peakFactor || DEFAULT_PEAK_FACTOR;

  const averageDailyDemandLitres = input.numberOfOccupants * perCapita;
  const peakDailyDemandLitres = averageDailyDemandLitres * peakFactor;
  const weeklyDemandLitres = averageDailyDemandLitres * input.daysPerWeek;
  const monthlyDemandLitres = weeklyDemandLitres * (52 / 12);
  const annualDemandLitres = weeklyDemandLitres * 52;

  return {
    averageDailyDemandLitres: Math.round(averageDailyDemandLitres * 100) / 100,
    peakDailyDemandLitres: Math.round(peakDailyDemandLitres * 100) / 100,
    weeklyDemandLitres: Math.round(weeklyDemandLitres * 100) / 100,
    monthlyDemandLitres: Math.round(monthlyDemandLitres * 100) / 100,
    annualDemandLitres: Math.round(annualDemandLitres * 100) / 100,
    averageDailyDemandM3: Math.round((averageDailyDemandLitres / 1000) * 100) / 100,
    peakDailyDemandM3: Math.round((peakDailyDemandLitres / 1000) * 100) / 100,
  };
}
