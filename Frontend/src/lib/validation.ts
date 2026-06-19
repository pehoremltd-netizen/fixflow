export type ValidationRule = {
  validate: (value: unknown) => boolean;
  message: string;
};

export function required(message?: string): ValidationRule {
  return {
    validate: (v) => v !== null && v !== undefined && v !== "",
    message: message || "This field is required",
  };
}

export function positiveNumber(message?: string): ValidationRule {
  return {
    validate: (v) => typeof v === "number" && v > 0,
    message: message || "Value must be a positive number",
  };
}

export function nonNegativeNumber(message?: string): ValidationRule {
  return {
    validate: (v) => typeof v === "number" && v >= 0,
    message: message || "Value must be zero or a positive number",
  };
}

export function range(min: number, max: number, message?: string): ValidationRule {
  return {
    validate: (v) => typeof v === "number" && v >= min && v <= max,
    message: message || `Value must be between ${min} and ${max}`,
  };
}

export function integer(message?: string): ValidationRule {
  return {
    validate: (v) => typeof v === "number" && Number.isInteger(v),
    message: message || "Value must be a whole number",
  };
}

export function oneOf(options: unknown[], message?: string): ValidationRule {
  return {
    validate: (v) => options.includes(v),
    message: message || `Value must be one of: ${options.join(", ")}`,
  };
}

export function validateField(
  value: unknown,
  rules: ValidationRule[],
): string | null {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
}

export function validateAll(
  fields: Record<string, { value: unknown; rules: ValidationRule[] }>,
): Record<string, string | null> {
  const errors: Record<string, string | null> = {};
  for (const [key, config] of Object.entries(fields)) {
    errors[key] = validateField(config.value, config.rules);
  }
  return errors;
}

export function hasErrors(errors: Record<string, string | null>): boolean {
  return Object.values(errors).some((e) => e !== null);
}

export function formatErrorList(errors: Record<string, string | null>): string[] {
  return Object.values(errors).filter((e): e is string => e !== null);
}
