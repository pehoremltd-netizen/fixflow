import type { ElectricalLoadInput, ElectricalLoadOutput, ElectricalLoadItemResult, ValidationResult } from "./types";

function isPositiveNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

function isInRange(v: unknown, min: number, max: number): boolean {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}

export function validateElectricalLoadInput(input: ElectricalLoadInput): ValidationResult {
  const errors: string[] = [];
  if (!input.loads || input.loads.length === 0)
    errors.push("At least one electrical load item is required");
  if (!isInRange(input.diversityFactorPercent, 1, 100))
    errors.push("Diversity factor must be between 1 and 100%");
  if (input.futureExpansionPercent == null || input.futureExpansionPercent < 0)
    errors.push("Future expansion percentage must be a non-negative number");

  input.loads.forEach((load, i) => {
    const idx = i + 1;
    if (!load.description?.trim())
      errors.push(`Load item #${idx}: description is required`);
    if (!isPositiveNumber(load.quantity))
      errors.push(`Load "${load.description || `#${idx}`}": quantity must be a positive integer`);
    if (!isPositiveNumber(load.wattagePerUnit))
      errors.push(`Load "${load.description || `#${idx}`}": wattage must be a positive number`);
    if (!isInRange(load.usageHoursPerDay, 0, 24))
      errors.push(`Load "${load.description || `#${idx}`}": usage hours must be between 0 and 24`);
    if (!isInRange(load.daysPerWeek, 0, 7))
      errors.push(`Load "${load.description || `#${idx}`}": days per week must be between 0 and 7`);
  });

  return { valid: errors.length === 0, errors };
}

export function calculateElectricalLoad(input: ElectricalLoadInput): ElectricalLoadOutput {
  const diversityFactor = input.diversityFactorPercent / 100;
  const expansionFactor = 1 + input.futureExpansionPercent / 100;

  const loadResults: ElectricalLoadItemResult[] = input.loads.map((load) => {
    const totalWatts = load.quantity * load.wattagePerUnit;
    const totalKw = totalWatts / 1000;
    const dailyKwh = totalKw * load.usageHoursPerDay;
    const weeklyKwh = dailyKwh * load.daysPerWeek;
    return {
      description: load.description,
      quantity: load.quantity,
      wattagePerUnit: load.wattagePerUnit,
      totalWatts,
      totalKw: Math.round(totalKw * 100) / 100,
      dailyKwh: Math.round(dailyKwh * 100) / 100,
      weeklyKwh: Math.round(weeklyKwh * 100) / 100,
    };
  });

  const totalInstalledLoadW = loadResults.reduce((sum, l) => sum + l.totalWatts, 0);
  const totalInstalledLoadKw = totalInstalledLoadW / 1000;
  const diversifiedLoadKw = totalInstalledLoadKw * diversityFactor;
  const futureLoadKw = diversifiedLoadKw * expansionFactor;
  const dailyEnergyKwh = loadResults.reduce((sum, l) => sum + l.dailyKwh, 0);
  const weeklyEnergyKwh = loadResults.reduce((sum, l) => sum + l.weeklyKwh, 0);
  const monthlyEnergyKwh = weeklyEnergyKwh * (52 / 12);

  return {
    totalInstalledLoadW,
    totalInstalledLoadKw: Math.round(totalInstalledLoadKw * 100) / 100,
    diversifiedLoadKw: Math.round(diversifiedLoadKw * 100) / 100,
    futureLoadKw: Math.round(futureLoadKw * 100) / 100,
    loads: loadResults,
    dailyEnergyKwh: Math.round(dailyEnergyKwh * 100) / 100,
    weeklyEnergyKwh: Math.round(weeklyEnergyKwh * 100) / 100,
    monthlyEnergyKwh: Math.round(monthlyEnergyKwh * 100) / 100,
  };
}
