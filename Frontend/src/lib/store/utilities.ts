import { generateId } from "@/lib/id-gen";

export type UtilityCategory = "Electricity" | "Diesel" | "Water" | "Gas" | "Waste";
export type UtilityUnit = "kWh" | "Litres" | "m\u00B3" | "kg";

export interface UtilityRecord {
  id: string;
  site: string;
  category: UtilityCategory;
  month: string;
  year: number;
  consumption: number;
  unit: UtilityUnit;
  cost: number;
  supplier: string;
  notes: string;
  createdAt: string;
}

const STORAGE_KEY = "fixflow-utilities";

export const CATEGORIES: UtilityCategory[] = ["Electricity", "Diesel", "Water", "Gas", "Waste"];

export const UNITS: Record<UtilityCategory, UtilityUnit> = {
  Electricity: "kWh",
  Diesel: "Litres",
  Water: "m\u00B3",
  Gas: "kg",
  Waste: "kg",
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function loadRecords(): UtilityRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

function saveRecords(records: UtilityRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getUtilities(): UtilityRecord[] {
  return loadRecords();
}

export function addUtility(data: Omit<UtilityRecord, "id" | "createdAt">): UtilityRecord {
  const records = loadRecords();
  const record: UtilityRecord = {
    ...data,
    id: generateId("utility"),
    createdAt: new Date().toISOString(),
  };
  records.push(record);
  saveRecords(records);
  return record;
}

export function updateUtility(id: string, data: Partial<Omit<UtilityRecord, "id" | "createdAt">>): UtilityRecord | null {
  const records = loadRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;
  records[index] = { ...records[index], ...data };
  saveRecords(records);
  return records[index];
}

export function deleteUtility(id: string): void {
  const records = loadRecords();
  saveRecords(records.filter((r) => r.id !== id));
}

export function getUtilitySummary() {
  const records = loadRecords();
  const latestMonth = [...new Set(records.map((r) => r.month))].pop() || "";
  const latestYear = Math.max(...records.map((r) => r.year));
  const latestRecords = records.filter((r) => r.month === latestMonth && r.year === latestYear);

  const totalMonthlyCost = latestRecords.reduce((sum, r) => sum + r.cost, 0);
  const electricityCost = latestRecords.filter((r) => r.category === "Electricity").reduce((sum, r) => sum + r.cost, 0);
  const dieselCost = latestRecords.filter((r) => r.category === "Diesel").reduce((sum, r) => sum + r.cost, 0);
  const waterCost = latestRecords.filter((r) => r.category === "Water").reduce((sum, r) => sum + r.cost, 0);

  return { totalMonthlyCost, electricityCost, dieselCost, waterCost, latestMonth, latestYear };
}

export function getMonthlyTrend(category: UtilityCategory) {
  const records = loadRecords().filter((r) => r.category === category);
  const grouped: Record<string, { month: string; year: number; consumption: number; cost: number }> = {};
  for (const r of records) {
    const key = `${r.month}-${r.year}`;
    if (!grouped[key]) {
      grouped[key] = { month: r.month, year: r.year, consumption: 0, cost: 0 };
    }
    grouped[key].consumption += r.consumption;
    grouped[key].cost += r.cost;
  }
    return Object.values(grouped).sort((a, b) => {
    const aIdx = MONTHS.indexOf(a.month);
    const bIdx = MONTHS.indexOf(b.month);
    return a.year !== b.year ? a.year - b.year : aIdx - bIdx;
  });
}
