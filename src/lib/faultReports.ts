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
}

const STORAGE_KEY = "fixflow-fault-reports";

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();

const mockReports: FaultReport[] = [
  { id: "FR-001", assetName: "HVAC Unit #3", location: "Building A - Roof", description: "Compressor making loud grinding noise and vibrating excessively", reportedBy: "John Smith", reportedAt: daysAgo(2), priority: "critical", status: "ASSIGNED" },
  { id: "FR-002", assetName: "Elevator #2", location: "Building A - Lobby", description: "Elevator doors not closing properly, getting stuck intermittently", reportedBy: "Jane Doe", reportedAt: daysAgo(1), priority: "high", status: "ACKNOWLEDGED" },
  { id: "FR-003", assetName: "Water Pump", location: "Building B - Basement", description: "Strange knocking sound from pump motor, pressure dropping", reportedBy: "Mike Ross", reportedAt: daysAgo(3), priority: "high", status: "REPORTED" },
  { id: "FR-004", assetName: "Fire Alarm Panel", location: "Building A - Security Office", description: "False alarm triggering randomly, error code E-47 on panel", reportedBy: "Sarah Connor", reportedAt: daysAgo(5), priority: "critical", status: "RESOLVED", resolution: "Replaced faulty smoke detector on floor 3", resolvedAt: daysAgo(1) },
  { id: "FR-005", assetName: "Security Camera #12", location: "Parking Lot A", description: "Camera showing black screen, no video feed", reportedBy: "Tom Hardy", reportedAt: daysAgo(4), priority: "medium", status: "ASSIGNED" },
  { id: "FR-006", assetName: "Chiller Unit", location: "Building A - Mechanical Room", description: "Coolant leak detected under chiller unit, pooling on floor", reportedBy: "Lisa Park", reportedAt: daysAgo(1), priority: "high", status: "REPORTED" },
  { id: "FR-007", assetName: "Lighting System", location: "Parking Lot B", description: "3 light poles not working, area poorly lit at night", reportedBy: "Anna Kim", reportedAt: daysAgo(7), priority: "low", status: "RESOLVED", resolution: "Replaced faulty photocell sensors and bulbs", resolvedAt: daysAgo(2) },
  { id: "FR-008", assetName: "Generator", location: "Building A - Basement", description: "Generator fails to start during weekly test, battery appears dead", reportedBy: "James Brown", reportedAt: daysAgo(1), priority: "high", status: "ACKNOWLEDGED" },
  { id: "FR-009", assetName: "Roof HVAC Unit", location: "Building B - Roof", description: "Water leaking from HVAC unit onto roof surface", reportedBy: "Emma Wilson", reportedAt: daysAgo(6), priority: "medium", status: "REPORTED" },
  { id: "FR-010", assetName: "Access Control System", location: "Main Entrance", description: "Card reader not responding, employees unable to enter", reportedBy: "Tom Green", reportedAt: daysAgo(0), priority: "critical", status: "REPORTED" },
];

function loadReports(): FaultReport[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const initial = mockReports;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
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
