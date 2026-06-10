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

const sites = ["Lekki Site", "Victoria Island", "Ikeja GRA"];
const categories: UtilityCategory[] = ["Electricity", "Diesel", "Water", "Gas", "Waste"];
const months = ["January", "February", "March", "April", "May", "June"];
const suppliers: Record<UtilityCategory, string[]> = {
  Electricity: ["IKEDC", "Eko Electric", "PHCN"],
  Diesel: ["TotalEnergies", "Mobil", "Conoil"],
  Water: ["Lagos Water Corp", "AWAI"],
  Gas: ["Nigerian Gas Co", "GasLink"],
  Waste: ["WasteCo", "CleanCycle NG"],
};
const units: Record<UtilityCategory, UtilityUnit> = {
  Electricity: "kWh",
  Diesel: "Litres",
  Water: "m\u00B3",
  Gas: "kg",
  Waste: "kg",
};

function generateMockRecords(): UtilityRecord[] {
  const records: UtilityRecord[] = [];
  let id = 1;
  const currentYear = new Date().getFullYear();
  for (const site of sites) {
    for (const month of months) {
      for (const category of categories) {
        const baseConsumption: Record<UtilityCategory, number> = {
          Electricity: 45000,
          Diesel: 3000,
          Water: 800,
          Gas: 1200,
          Waste: 500,
        };
        const baseCost: Record<UtilityCategory, number> = {
          Electricity: 3500000,
          Diesel: 1800000,
          Water: 450000,
          Gas: 960000,
          Waste: 250000,
        };
        const variance = 0.7 + Math.random() * 0.6;
        const supplierList = suppliers[category];
        records.push({
          id: `UTIL-${String(id++).padStart(3, "0")}`,
          site,
          category,
          month,
          year: currentYear,
          consumption: Math.round(baseConsumption[category] * variance),
          unit: units[category],
          cost: Math.round(baseCost[category] * variance),
          supplier: supplierList[Math.floor(Math.random() * supplierList.length)],
          notes: "",
          createdAt: new Date(Date.UTC(currentYear, months.indexOf(month), 1)).toISOString(),
        });
      }
    }
  }
  return records;
}

function loadRecords(): UtilityRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const initial = generateMockRecords();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveRecords(records: UtilityRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getUtilities(): UtilityRecord[] {
  return loadRecords();
}

export function addUtility(data: Omit<UtilityRecord, "id" | "createdAt">): UtilityRecord {
  const records = loadRecords();
  const maxNum = records.reduce((max, r) => {
    const num = parseInt(r.id.replace("UTIL-", ""));
    return num > max ? num : max;
  }, 0);
  const record: UtilityRecord = {
    ...data,
    id: `UTIL-${String(maxNum + 1).padStart(3, "0")}`,
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
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const aIdx = months.indexOf(a.month);
    const bIdx = months.indexOf(b.month);
    return a.year !== b.year ? a.year - b.year : aIdx - bIdx;
  });
}
