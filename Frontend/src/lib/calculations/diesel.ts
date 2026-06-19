import type { DieselInput, DieselOutput, ValidationResult } from "./types";

const DEFAULT_SFC = 0.25;

function isPositiveNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

function isInRange(v: unknown, min: number, max: number): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}

export function validateDieselInput(input: DieselInput): ValidationResult {
  const errors: string[] = [];
  if (!isPositiveNumber(input.generatorCapacityKva))
    errors.push("Generator capacity must be a positive value in kVA");
  if (!isInRange(input.loadFactorPercent, 0, 100))
    errors.push("Load factor must be between 0 and 100%");
  if (!isInRange(input.hoursPerDay, 0, 24))
    errors.push("Hours per day must be between 0 and 24");
  if (!isInRange(input.daysPerWeek, 0, 7))
    errors.push("Days per week must be between 0 and 7");
  if (input.specificFuelConsumption != null && (input.specificFuelConsumption <= 0 || input.specificFuelConsumption > 1))
    errors.push("Specific fuel consumption must be between 0 and 1 L/kWh");
  if (input.fuelPricePerLitre != null && !isPositiveNumber(input.fuelPricePerLitre))
    errors.push("Fuel price must be a positive value");
  return { valid: errors.length === 0, errors };
}

export function calculateDieselConsumption(input: DieselInput): DieselOutput {
  const sfc = input.specificFuelConsumption || DEFAULT_SFC;
  const loadFactor = input.loadFactorPercent / 100;
  const powerFactor = 0.8;
  const actualKw = input.generatorCapacityKva * powerFactor * loadFactor;
  const hourlyConsumption = actualKw * sfc;

  const dailyConsumptionLitres = hourlyConsumption * input.hoursPerDay;
  const weeklyConsumptionLitres = dailyConsumptionLitres * input.daysPerWeek;
  const monthlyConsumptionLitres = weeklyConsumptionLitres * (52 / 12);
  const annualConsumptionLitres = weeklyConsumptionLitres * 52;

  const fuelPrice = input.fuelPricePerLitre || 1200;
  const monthlyCost = monthlyConsumptionLitres * fuelPrice;
  const annualCost = annualConsumptionLitres * fuelPrice;

  return {
    dailyConsumptionLitres: Math.round(dailyConsumptionLitres * 100) / 100,
    weeklyConsumptionLitres: Math.round(weeklyConsumptionLitres * 100) / 100,
    monthlyConsumptionLitres: Math.round(monthlyConsumptionLitres * 100) / 100,
    annualConsumptionLitres: Math.round(annualConsumptionLitres * 100) / 100,
    monthlyCost: Math.round(monthlyCost * 100) / 100,
    annualCost: Math.round(annualCost * 100) / 100,
    fuelPricePerLitre: fuelPrice,
  };
}
