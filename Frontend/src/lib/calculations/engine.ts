import type {
  GeneratorInput, GeneratorOutput,
  DieselInput, DieselOutput,
  WaterDemandInput, WaterDemandOutput,
  PumpSizingInput, PumpSizingOutput,
  ElectricalLoadInput, ElectricalLoadOutput,
  CalculationType, CalcInput, CalcOutput,
  ValidationResult, EngineResult, ErrorCode,
} from "./types";

import { validateGeneratorInput, calculateGeneratorLoad } from "./generator";
import { validateDieselInput, calculateDieselConsumption } from "./diesel";
import { validateWaterDemandInput, calculateWaterDemand } from "./water";
import { validatePumpSizingInput, calculatePumpSizing } from "./pump";
import { validateElectricalLoadInput, calculateElectricalLoad } from "./electrical";

type ValidatorFn<I> = (input: I) => ValidationResult;
type CalculatorFn<I, O> = (input: I) => O;

interface CalcModule<I, O> {
  type: CalculationType;
  validate: ValidatorFn<I>;
  calculate: CalculatorFn<I, O>;
}

function buildEngineResult<O extends CalcOutput>(
  success: boolean,
  errorCode: ErrorCode | undefined,
  errors: string[],
  data?: O,
): EngineResult<O> {
  return {
    success,
    data,
    errors,
    errorCode,
    timestamp: new Date().toISOString(),
  };
}

const modules: Record<CalculationType, CalcModule<any, any>> = {
  generator: {
    type: "generator",
    validate: validateGeneratorInput,
    calculate: calculateGeneratorLoad,
  },
  diesel: {
    type: "diesel",
    validate: validateDieselInput,
    calculate: calculateDieselConsumption,
  },
  water: {
    type: "water",
    validate: validateWaterDemandInput,
    calculate: calculateWaterDemand,
  },
  pump: {
    type: "pump",
    validate: validatePumpSizingInput,
    calculate: calculatePumpSizing,
  },
  electrical: {
    type: "electrical",
    validate: validateElectricalLoadInput,
    calculate: calculateElectricalLoad,
  },
};

export function buildCalcEngine<T extends CalcOutput>(
  type: CalculationType,
  input: CalcInput,
): EngineResult<T> {
  try {
    const module = modules[type];
    if (!module) {
      return buildEngineResult<T>(false, "SYSTEM_FAILURE", [`Unknown calculation type: ${type}`]);
    }

    const validation = module.validate(input);
    if (!validation.valid) {
      return buildEngineResult<T>(false, "INVALID_INPUT", validation.errors);
    }

    const output = module.calculate(input) as T;

    const outputKeys = Object.keys(output as unknown as Record<string, unknown>);
    if (outputKeys.length === 0) {
      return buildEngineResult<T>(false, "CALCULATION_ERROR", ["Calculation produced empty result"]);
    }

    const allNumericValid = outputKeys.every((k) => {
      const v = (output as unknown as Record<string, unknown>)[k];
      if (typeof v === "number" && (Number.isNaN(v) || !Number.isFinite(v))) return false;
      return true;
    });

    if (!allNumericValid) {
      return buildEngineResult<T>(false, "CALCULATION_ERROR", ["Calculation produced invalid numeric values (NaN or Infinity)"]);
    }

    return buildEngineResult<T>(true, undefined, [], output);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown calculation error";
    return buildEngineResult<T>(false, "CALCULATION_ERROR", [message]);
  }
}

export function getEngineModules(): CalculationType[] {
  return Object.keys(modules) as CalculationType[];
}
