import type { PumpSizingInput, PumpSizingOutput, ValidationResult } from "./types";

const WATER_DENSITY = 1000;
const GRAVITY = 9.81;
const STANDARD_MOTORS = [0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315, 355, 400];

function isPositiveNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

function isInRange(v: unknown, min: number, max: number): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}

export function validatePumpSizingInput(input: PumpSizingInput): ValidationResult {
  const errors: string[] = [];
  if (!isPositiveNumber(input.flowRateRequiredM3H))
    errors.push("Flow rate must be a positive value in m\u00B3/h");
  if (!isPositiveNumber(input.totalDynamicHeadM))
    errors.push("Total dynamic head must be a positive value in metres");
  if (input.fluidDensityKgM3 != null && !isPositiveNumber(input.fluidDensityKgM3))
    errors.push("Fluid density must be a positive value in kg/m\u00B3");
  if (!isInRange(input.pumpEfficiencyPercent, 1, 100))
    errors.push("Pump efficiency must be between 1 and 100%");
  if (input.motorSafetyFactorPercent == null || input.motorSafetyFactorPercent < 0)
    errors.push("Motor safety factor must be a non-negative percentage");
  return { valid: errors.length === 0, errors };
}

export function calculatePumpSizing(input: PumpSizingInput): PumpSizingOutput {
  const density = input.fluidDensityKgM3 || WATER_DENSITY;
  const flowRateM3S = input.flowRateRequiredM3H / 3600;
  const efficiencyDecimal = input.pumpEfficiencyPercent / 100;
  const safetyFactorDecimal = input.motorSafetyFactorPercent / 100;

  const hydraulicPowerKw = (density * GRAVITY * flowRateM3S * input.totalDynamicHeadM) / 1000;
  const shaftPowerKw = hydraulicPowerKw / efficiencyDecimal;
  const motorPowerKw = shaftPowerKw * (1 + safetyFactorDecimal);

  const recommendedMotorPowerKw = STANDARD_MOTORS.find((m) => m >= motorPowerKw) || Math.ceil(motorPowerKw);

  return {
    hydraulicPowerKw: Math.round(hydraulicPowerKw * 1000) / 1000,
    shaftPowerKw: Math.round(shaftPowerKw * 1000) / 1000,
    motorPowerKw: Math.round(motorPowerKw * 1000) / 1000,
    recommendedMotorPowerKw,
    flowRateLS: Math.round((input.flowRateRequiredM3H / 3.6) * 100) / 100,
  };
}
