"use client";

export interface OpReportStats {
  pendingTasksOpen: number;
  pendingTasksOverdue: number;
  pmDue: number;
  pmOverdue: number;
  inspectionsCompleted: number;
  inspectionsIssues: number;
  workOrdersOpened: number;
  workOrdersClosed: number;
  faultReportsNew: number;
}

export interface RecurringActivityEntry {
  id: string;
  name: string;
  status: "ok" | "attention" | "overdue" | "pending";
  note: string;
}

export interface OperationalReport {
  id: string;
  periodType: "Weekly" | "Monthly";
  periodStart: string;
  periodEnd: string;
  title: string;
  preparedBy: string;
  status: "Draft" | "Final";
  createdAt: string;
  updatedAt: string;
  stats: OpReportStats;
  recurringActivities: RecurringActivityEntry[];
  urgentItems: string;
  newIssues: string;
  nextPriorities: string;
  invoicesRetrieved: string;
  approvalsPending: string;
}

export const RECURRING_ACTIVITIES_TEMPLATE: { id: string; name: string }[] = [
  { id: "ra-facility-outlook", name: "Facility & Office Outlook" },
  { id: "ra-office-supplies", name: "Office Supplies & Toiletries" },
  { id: "ra-generator-maint", name: "Generator Maintenance" },
  { id: "ra-repairs-maint", name: "Repairs & Maintenance" },
  { id: "ra-finance-payment", name: "Finance / Payment Process" },
  { id: "ra-vendor-engagement", name: "Vendor Engagement" },
  { id: "ra-lg-levies", name: "LG Levies & Fees" },
  { id: "ra-abuja-support", name: "Abuja Facility Support" },
  { id: "ra-fumigation", name: "Fumigation" },
];

const STORAGE_KEY = "fixflow-weekly-reports";

const storageCache = new Map<string, unknown>();

function loadFromStorage<T>(key: string, fallback: T): T {
  if (storageCache.has(key)) return storageCache.get(key) as T;
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) { const data = JSON.parse(stored); storageCache.set(key, data); return data; }
  } catch {}
  return fallback;
}

function isInPeriod(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function safeFormatDate(d: string, fallback: string): string {
  if (!d) return fallback;
  const date = new Date(d);
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatPeriod(periodType: "Weekly" | "Monthly", start: string, end: string): string {
  if (!start || !end) return "Op Report — Period not set";
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Op Report — Period not set";
  if (periodType === "Weekly") {
    return `Op Report — ${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  return `Op Report — ${s.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
}

export function computeLiveStats(periodStart: string, periodEnd: string): OpReportStats {
  const pendingTasks = loadFromStorage<any[]>("fixflow-facility-pending-tasks", []);
  const pmTasks = loadFromStorage<any[]>("fixflow-pm-tasks", []);
  const inspections = loadFromStorage<any[]>("fixflow-inspections", []);
  const workOrders = loadFromStorage<any[]>("fixflow-work-orders", []);
  const faults = loadFromStorage<any[]>("fixflow-fault-reports", []);

  return {
    pendingTasksOpen: pendingTasks.filter((t: any) => t.status !== "completed" && t.status !== "done").length,
    pendingTasksOverdue: pendingTasks.filter((t: any) => t.dueDate && t.dueDate < periodEnd && t.status !== "completed" && t.status !== "done").length,
    pmDue: pmTasks.filter((t: any) => isInPeriod(t.nextDue || "", periodStart, periodEnd)).length,
    pmOverdue: pmTasks.filter((t: any) => t.status === "Overdue").length,
    inspectionsCompleted: inspections.filter((t: any) => isInPeriod(t.completedAt || t.createdAt || "", periodStart, periodEnd) && (t.status === "completed" || t.status === "COMPLETED")).length,
    inspectionsIssues: inspections.filter((t: any) => t.issues && t.issues.length > 0).length,
    workOrdersOpened: workOrders.filter((o: any) => isInPeriod(o.createdAt || "", periodStart, periodEnd)).length,
    workOrdersClosed: workOrders.filter((o: any) => isInPeriod(o.updatedAt || o.createdAt || "", periodStart, periodEnd) && (o.status === "COMPLETED" || o.status === "VERIFIED")).length,
    faultReportsNew: faults.filter((f: any) => isInPeriod(f.reportedAt || "", periodStart, periodEnd)).length,
  };
}

function defaultRecurringActivities(): RecurringActivityEntry[] {
  return RECURRING_ACTIVITIES_TEMPLATE.map((a) => ({
    id: a.id,
    name: a.name,
    status: "ok" as const,
    note: "",
  }));
}

export function deduplicateReports(): void {
  const reports = getReports();
  const seen = new Map<string, OperationalReport>();
  const dups: string[] = [];
  for (const r of reports) {
    const key = `${r.periodType}-${r.periodStart}`;
    if (seen.has(key)) {
      dups.push(r.id);
    } else if (r.periodStart && !isNaN(new Date(r.periodStart).getTime())) {
      seen.set(key, r);
    }
  }
  if (dups.length > 0) {
    saveReports(reports.filter((r) => !dups.includes(r.id)));
  }
}

export function createReport(periodType: "Weekly" | "Monthly", periodStart: string, periodEnd: string, preparedBy: string): OperationalReport {
  const reports = getReports();
  // Check for existing draft for same period + type to prevent duplicates
  const existing = reports.find((r) => r.periodType === periodType && r.periodStart === periodStart && r.status === "Draft");
  if (existing) return existing;
  const num = reports.length + 1;
  const id = `OPR-${new Date().getFullYear()}-${String(num).padStart(3, "0")}`;
  const stats = computeLiveStats(periodStart, periodEnd);
  const report: OperationalReport = {
    id,
    periodType,
    periodStart,
    periodEnd,
    title: formatPeriod(periodType, periodStart, periodEnd),
    preparedBy,
    status: "Draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats,
    recurringActivities: defaultRecurringActivities(),
    urgentItems: "",
    newIssues: "",
    nextPriorities: "",
    invoicesRetrieved: "",
    approvalsPending: "",
  };
  reports.unshift(report);
  saveReports(reports);
  return report;
}

export function getReports(): OperationalReport[] {
  return loadFromStorage<OperationalReport[]>(STORAGE_KEY, []);
}

export function saveReport(report: OperationalReport): void {
  const reports = getReports();
  const idx = reports.findIndex((r) => r.id === report.id);
  report.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    reports[idx] = report;
  } else {
    reports.unshift(report);
  }
  saveReports(reports);
}

export function saveReports(reports: OperationalReport[]): void {
  storageCache.set(STORAGE_KEY, reports);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reports)); } catch {}
}

export function deleteReport(id: string): void {
  saveReports(getReports().filter((r) => r.id !== id));
}

export function finalizeReport(report: OperationalReport): OperationalReport {
  const updated = {
    ...report,
    status: "Final" as const,
    updatedAt: new Date().toISOString(),
    stats: computeLiveStats(report.periodStart, report.periodEnd),
  };
  saveReport(updated);
  return updated;
}
