import { generateId } from "./id-gen";
import type { CalculationType, CalculationRecord, EngineResult, CalcOutput } from "./calculations/types";

const STORAGE_KEY = "fixflow-calculation-logs";

function loadLogs(): CalculationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: CalculationRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function isCompleteRecord(record: unknown): record is CalculationRecord {
  if (!record || typeof record !== "object") return false;
  const r = record as Record<string, unknown>;
  return !!(
    typeof r.id === "string" &&
    typeof r.type === "string" &&
    r.inputs && typeof r.inputs === "object" &&
    r.outputs && typeof r.outputs === "object" &&
    typeof r.timestamp === "string" &&
    typeof r.user === "string" &&
    (r.status === "success" || r.status === "error") &&
    r.mode === "calculated"
  );
}

export function logCalculation(
  type: CalculationType,
  inputs: Record<string, unknown>,
  result: EngineResult<CalcOutput>,
  user = "Admin",
): CalculationRecord | null {
  const record: CalculationRecord = {
    id: generateId("calc"),
    type,
    inputs,
    outputs: result.success && result.data ? (result.data as unknown as Record<string, unknown>) : {},
    timestamp: new Date().toISOString(),
    user,
    status: result.success ? "success" : "error",
    errorCode: result.errorCode,
    errorMessage: result.success ? undefined : result.errors.join("; "),
    mode: "calculated",
  };

  if (!isCompleteRecord(record)) return null;

  const logs = loadLogs();
  logs.push(record);
  saveLogs(logs);
  return record;
}

export function getCalculationLogs(
  options?: {
    type?: CalculationType;
    limit?: number;
    fromDate?: string;
    toDate?: string;
    status?: "success" | "error";
  },
): CalculationRecord[] {
  let logs = loadLogs().filter(isCompleteRecord);

  if (options?.type) logs = logs.filter((l) => l.type === options.type);
  if (options?.status) logs = logs.filter((l) => l.status === options.status);
  if (options?.fromDate) logs = logs.filter((l) => l.timestamp >= options.fromDate!);
  if (options?.toDate) logs = logs.filter((l) => l.timestamp <= options.toDate!);

  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (options?.limit) logs = logs.slice(0, options.limit);

  return logs;
}

export function getCalculationStats() {
  const logs = loadLogs().filter(isCompleteRecord);
  return {
    total: logs.length,
    success: logs.filter((l) => l.status === "success").length,
    error: logs.filter((l) => l.status === "error").length,
    byType: {
      generator: logs.filter((l) => l.type === "generator").length,
      diesel: logs.filter((l) => l.type === "diesel").length,
      water: logs.filter((l) => l.type === "water").length,
      pump: logs.filter((l) => l.type === "pump").length,
      electrical: logs.filter((l) => l.type === "electrical").length,
    },
  };
}

export function clearCalculationLogs(): void {
  saveLogs([]);
}
