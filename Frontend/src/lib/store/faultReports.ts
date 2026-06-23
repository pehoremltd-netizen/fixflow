export type FaultStatus = "REPORTED" | "ACKNOWLEDGED" | "ASSIGNED" | "RESOLVED";
export type FaultPriority = "low" | "medium" | "high" | "critical";

export interface FaultReport {
  id: string;
  assetName: string;
  location: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  priority: FaultPriority;
  status: FaultStatus;
  resolution?: string;
  resolvedAt?: string;
  fieldNotes?: string;
}

const STORAGE_KEY = "fixflow-fault-reports";
let cache: FaultReport[] | undefined;

function loadReports(): FaultReport[] {
  if (cache !== undefined) return cache;
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: FaultReport[] = JSON.parse(stored);
      cache = parsed;
      return parsed;
    }
  } catch {}
  return [];
}

function saveReports(reports: FaultReport[]): void {
  cache = reports;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function getFaultReports(): FaultReport[] {
  return loadReports();
}

export function addFaultReport(data: Omit<FaultReport, "id" | "reportedAt" | "status">): FaultReport {
  const reports = loadReports();
  const maxNum = reports.reduce((max, r) => {
    const num = parseInt(r.id.replace("FR-", ""));
    return num > max ? num : max;
  }, 0);
  const newReport: FaultReport = {
    ...data,
    id: `FR-${String(maxNum + 1).padStart(3, "0")}`,
    reportedAt: new Date().toISOString(),
    status: "REPORTED",
  };
  reports.push(newReport);
  saveReports(reports);
  return newReport;
}

export function updateStatus(id: string, status: FaultStatus, resolution?: string): FaultReport | null {
  const reports = loadReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) return null;
  reports[index].status = status;
  if (status === "RESOLVED") {
    reports[index].resolvedAt = new Date().toISOString();
    if (resolution) reports[index].resolution = resolution;
  }
  saveReports(reports);
  return reports[index];
}

export function updateFaultNotes(id: string, notes: string): void {
  const reports = loadReports();
  const r = reports.find((r) => r.id === id);
  if (r) { r.fieldNotes = notes; saveReports(reports); }
}

export function deleteFaultReport(id: string): void {
  saveReports(loadReports().filter((r) => r.id !== id));
}

export function deleteFaultReports(ids: string[]): void {
  saveReports(loadReports().filter((r) => !ids.includes(r.id)));
}
