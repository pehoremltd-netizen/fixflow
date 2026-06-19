"use client";

const STORAGE_KEY = "fixflow-budget";

export interface BudgetLineItem {
  id: string;
  categoryId: string;
  description: string;
  budgeted: number;
  actual: number;
  lastYearActual: number;
  variance: number;
  variancePercent: number;
  isRecurring: boolean;
  recurringFrequency: "monthly" | "quarterly" | "annual" | "one-off";
  notes: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const CATEGORIES: BudgetCategory[] = [
  { id: "cat-labour", name: "Labour & Staffing", icon: "Users", color: "var(--color-primary)" },
  { id: "cat-materials", name: "Materials & Spares", icon: "Package", color: "var(--color-success)" },
  { id: "cat-contractors", name: "Contractors & Vendors", icon: "HardHat", color: "var(--color-info)" },
  { id: "cat-equipment", name: "Equipment & Assets", icon: "Wrench", color: "var(--color-warning)" },
  { id: "cat-utilities", name: "Utilities & Energy", icon: "Zap", color: "var(--color-destructive)" },
  { id: "cat-safety", name: "Safety & Compliance", icon: "AlertTriangle", color: "var(--color-accent-foreground)" },
  { id: "cat-emergency", name: "Emergency Repairs", icon: "AlertCircle", color: "var(--color-primary)" },
  { id: "cat-admin", name: "Administrative", icon: "FileText", color: "var(--color-info)" },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calcVariance(budgeted: number, actual: number): { variance: number; variancePercent: number } {
  const variance = round2(budgeted - actual);
  const variancePercent = budgeted > 0 ? round2((variance / budgeted) * 100) : 0;
  return { variance, variancePercent };
}

function createSeed(): BudgetLineItem[] { return []; }

function loadBudget(): BudgetLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveBudget(data: BudgetLineItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getBudget(): BudgetLineItem[] {
  return loadBudget();
}

export function getBudgetCategories(): BudgetCategory[] {
  return CATEGORIES;
}

export function getBudgetByCategory(): { category: BudgetCategory; items: BudgetLineItem[] }[] {
  const items = loadBudget();
  return CATEGORIES.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.categoryId === cat.id),
  }));
}

export function getBudgetTotals(): { budgeted: number; actual: number; variance: number; variancePercent: number } {
  const items = loadBudget();
  const budgeted = items.reduce((s, i) => s + i.budgeted, 0);
  const actual = items.reduce((s, i) => s + i.actual, 0);
  const { variance, variancePercent } = calcVariance(budgeted, actual);
  return { budgeted, actual, variance, variancePercent };
}

export function addBudgetItem(data: Partial<BudgetLineItem>): BudgetLineItem {
  const list = loadBudget();
  const item: BudgetLineItem = {
    id: genId(),
    categoryId: data.categoryId || "cat-other",
    description: data.description || "",
    budgeted: data.budgeted || 0,
    actual: data.actual || 0,
    lastYearActual: data.lastYearActual || 0,
    variance: 0,
    variancePercent: 0,
    isRecurring: data.isRecurring || false,
    recurringFrequency: data.recurringFrequency || "one-off",
    notes: data.notes || "",
    updatedAt: new Date().toISOString(),
  };
  const { variance, variancePercent } = calcVariance(item.budgeted, item.actual);
  item.variance = variance;
  item.variancePercent = variancePercent;
  list.push(item);
  saveBudget(list);
  return item;
}

export function updateBudgetItem(id: string, data: Partial<BudgetLineItem>): BudgetLineItem | undefined {
  const list = loadBudget();
  const idx = list.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  const updated = { ...list[idx], ...data };
  const { variance, variancePercent } = calcVariance(updated.budgeted, updated.actual);
  updated.variance = variance;
  updated.variancePercent = variancePercent;
  updated.updatedAt = new Date().toISOString();
  list[idx] = updated;
  saveBudget(list);
  return list[idx];
}

export function deleteBudgetItem(id: string): void {
  const list = loadBudget();
  saveBudget(list.filter((i) => i.id !== id));
}
