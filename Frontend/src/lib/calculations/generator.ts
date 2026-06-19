import type { GeneratorInput, GeneratorOutput, ValidationResult } from "./types";

function isPositiveNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

function isInRange(v: unknown, min: number, max: number): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}

export function validateGeneratorInput(input: GeneratorInput): ValidationResult {
  const errors: string[] = [];
  if (!isPositiveNumber(input.ratedPowerKva))
    errors.push("Generator rated power must be a positive value in kVA");
  if (!isInRange(input.powerFactor, 0.1, 1.0))
    errors.push("Power factor must be between 0.1 and 1.0");
  if (!isInRange(input.loadFactorPercent, 0, 100))
    errors.push("Load factor must be between 0 and 100%");
  if (!isInRange(input.hoursPerDay, 0, 24))
    errors.push("Hours per day must be between 0 and 24");
  if (!isInRange(input.daysPerWeek, 0, 7))
    errors.push("Days per week must be between 0 and 7");
  return { valid: errors.length === 0, errors };
}

export function calculateGeneratorLoad(input: GeneratorInput): GeneratorOutput {
  const ratedPowerKw = input.ratedPowerKva * input.powerFactor;
  const loadFactorDecimal = input.loadFactorPercent / 100;
  const actualLoadKw = ratedPowerKw * loadFactorDecimal;
  const dailyEnergyKwh = actualLoadKw * input.hoursPerDay;
  const weeklyEnergyKwh = dailyEnergyKwh * input.daysPerWeek;
  const monthlyEnergyKwh = weeklyEnergyKwh * (52 / 12);
  const utilizationPercent = loadFactorDecimal * 100;

  return {
    ratedPowerKw: Math.round(ratedPowerKw * 100) / 100,
    actualLoadKw: Math.round(actualLoadKw * 100) / 100,
    loadFactorDecimal: Math.round(loadFactorDecimal * 100) / 100,
    dailyEnergyKwh: Math.round(dailyEnergyKwh * 100) / 100,
    weeklyEnergyKwh: Math.round(weeklyEnergyKwh * 100) / 100,
    monthlyEnergyKwh: Math.round(monthlyEnergyKwh * 100) / 100,
    utilizationPercent: Math.round(utilizationPercent * 100) / 100,
  };
}
