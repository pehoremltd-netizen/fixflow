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

const mockReports: FaultReport[] = [];

function loadReports(): FaultReport[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveReports(reports: FaultReport[]): void {
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

export function updateStatus(id: string, newStatus: FaultStatus, notes?: string): FaultReport | null {
  const reports = loadReports();
  const index = reports.findIndex(r => r.id === id);
  if (index === -1) return null;
  reports[index].status = newStatus;
  if (newStatus === "RESOLVED" && notes) {
    reports[index].resolution = notes;
    reports[index].resolvedAt = new Date().toISOString();
  }
  saveReports(reports);
  return reports[index];
}
