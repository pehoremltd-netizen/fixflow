export interface StaffAttendanceSummary {
  staffId: string;
  staffName: string;
  role: string;
  present: number;
  late: number;
  absent: number;
  totalDays: number;
  totalHours: number;
  attendancePercent: number;
}

export interface WorkOrderSummary {
  opened: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export interface MaintenanceSummary {
  scheduled: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export interface FaultSummary {
  reported: number;
  resolved: number;
  pending: number;
}

export interface ActionItem {
  id: string;
  description: string;
  responsible: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  title: string;
  preparedBy: string;
  preparedAt: string;
  status: "Draft" | "Final";
  attendanceSummary: StaffAttendanceSummary[];
  maintenanceSummary: MaintenanceSummary;
  maintenanceNotes: string;
  workOrderSummary: WorkOrderSummary;
  faultSummary: FaultSummary;
  utilitySummary: { category: string; thisWeek: number; lastWeek: number; variance: number }[];
  notes: string;
  actionItems: ActionItem[];
  recommendations: string;
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: "present" | "late" | "absent";
  hoursWorked: number | null;
}

interface QRRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  status: "present" | "late" | "absent";
}

interface WorkOrder {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  assignedStaff: string;
  location: string;
  priority: string;
  dueDate: string;
}

interface PMTask {
  id: string;
  asset: string;
  task: string;
  status: string;
  lastDone: string;
  nextDue: string;
  responsible: string;
  location: string;
}

interface FaultReport {
  id: string;
  assetName: string;
  location: string;
  status: string;
  reportedAt: string;
  resolvedAt?: string;
  description: string;
  resolution?: string;
  priority: string;
}

interface UtilityRecord {
  id: string;
  category: string;
  cost: number;
  month: string;
  year: number;
  site: string;
}

const STORAGE_KEY = "fixflow-weekly-reports";

function getWeekDays(weekStart: string): string[] {
  const start = new Date(weekStart);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function isInWeek(date: string, weekStart: string, weekEnd: string): boolean {
  return date >= weekStart && date <= weekEnd;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback;
}

export function autoCalculateAttendance(weekStart: string, weekEnd: string): StaffAttendanceSummary[] {
  const attendanceRecords = loadFromStorage<AttendanceRecord[]>("fixflow-attendance", []);
  const qrRecords = loadFromStorage<QRRecord[]>("fixflow-qr-attendance", []);
  const weekDays = getWeekDays(weekStart);
  const totalDays = weekDays.length;

  const staffMap = new Map<string, StaffAttendanceSummary>();

  for (const r of attendanceRecords) {
    if (!isInWeek(r.date, weekStart, weekEnd)) continue;
    if (!staffMap.has(r.staffId)) {
      staffMap.set(r.staffId, {
        staffId: r.staffId,
        staffName: r.staffName,
        role: "Staff",
        present: 0,
        late: 0,
        absent: 0,
        totalDays,
        totalHours: 0,
        attendancePercent: 0,
      });
    }
    const s = staffMap.get(r.staffId)!;
    if (r.status === "present") s.present++;
    else if (r.status === "late") s.late++;
    else s.absent++;
    if (r.hoursWorked) s.totalHours += r.hoursWorked;
  }

  for (const r of qrRecords) {
    if (!isInWeek(r.date, weekStart, weekEnd)) continue;
    if (!staffMap.has(r.staffId)) {
      staffMap.set(r.staffId, {
        staffId: r.staffId,
        staffName: r.staffName,
        role: "Staff",
        present: 0,
        late: 0,
        absent: 0,
        totalDays,
        totalHours: 0,
        attendancePercent: 0,
      });
    }
    const s = staffMap.get(r.staffId)!;
    if (r.status === "present") s.present++;
    else if (r.status === "late") s.late++;
    else {
      const existing = attendanceRecords.find((a) => a.staffId === r.staffId && a.date === r.date);
      if (!existing) s.absent++;
    }
    if (r.clockIn && r.clockOut) {
      const hours = (new Date(r.clockOut).getTime() - new Date(r.clockIn).getTime()) / 3600000;
      if (hours > 0) s.totalHours += hours;
    }
  }

  for (const [, s] of staffMap) {
    const accounted = s.present + s.late;
    s.absent = totalDays - accounted;
    s.attendancePercent = totalDays > 0 ? Math.round(((s.present + s.late) / totalDays) * 100) : 0;
  }

  return Array.from(staffMap.values());
}

export function autoCalculateWorkOrders(weekStart: string, weekEnd: string): WorkOrderSummary {
  const orders = loadFromStorage<WorkOrder[]>("fixflow-work-orders", []);
  const weekOrders = orders.filter((o) => isInWeek(o.createdAt, weekStart, weekEnd));

  return {
    opened: weekOrders.length,
    completed: weekOrders.filter((o) => o.status === "COMPLETED" || o.status === "VERIFIED").length,
    inProgress: weekOrders.filter((o) => o.status === "IN_PROGRESS" || o.status === "ASSIGNED").length,
    overdue: weekOrders.filter((o) => o.dueDate && o.dueDate < weekEnd && o.status !== "COMPLETED" && o.status !== "VERIFIED").length,
  };
}

export function autoCalculateMaintenance(weekStart: string, weekEnd: string): MaintenanceSummary {
  const tasks = loadFromStorage<PMTask[]>("fixflow-pm-tasks", []);
  const weekTasks = tasks.filter((t) => {
    const lastDone = t.lastDone ? t.lastDone.split("T")[0] : "";
    const nextDue = t.nextDue ? t.nextDue.split("T")[0] : "";
    return isInWeek(lastDone, weekStart, weekEnd) || isInWeek(nextDue, weekStart, weekEnd);
  });

  const completed = weekTasks.filter((t) => t.status === "Completed").length;
  const overdue = weekTasks.filter((t) => t.status === "Overdue").length;
  const scheduled = weekTasks.length;

  return {
    scheduled,
    completed,
    overdue,
    completionRate: scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0,
  };
}

export function autoCalculateFaults(weekStart: string, weekEnd: string): FaultSummary {
  const faults = loadFromStorage<FaultReport[]>("fixflow-fault-reports", []);
  const weekFaults = faults.filter((f) => isInWeek(f.reportedAt.split("T")[0], weekStart, weekEnd));

  return {
    reported: weekFaults.length,
    resolved: weekFaults.filter((f) => f.status === "RESOLVED").length,
    pending: weekFaults.filter((f) => f.status !== "RESOLVED").length,
  };
}

export function autoCalculateUtilities(weekStart: string, weekEnd: string) {
  const records = loadFromStorage<UtilityRecord[]>("fixflow-utilities", []);
  const categories = [...new Set(records.map((r) => r.category))];

  return categories.map((category) => {
    const catRecords = records.filter((r) => r.category === category);
    const thisWeek = catRecords
      .filter((r) => isInWeek(`${r.year}-${String(Number(r.month)).padStart(2, "0")}-01`, weekStart, weekEnd))
      .reduce((sum, r) => sum + r.cost, 0);
    const lastWeek = catRecords
      .filter((r) => {
        const d = new Date(r.year, Number(r.month) - 2, 1);
        const prevStart = new Date(weekStart);
        prevStart.setDate(prevStart.getDate() - 7);
        const prevEnd = new Date(weekEnd);
        prevEnd.setDate(prevEnd.getDate() - 7);
        return isInWeek(`${r.year}-${String(Number(r.month)).padStart(2, "0")}-01`, prevStart.toISOString().split("T")[0], prevEnd.toISOString().split("T")[0]);
      })
      .reduce((sum, r) => sum + r.cost, 0);
    const variance = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

    return { category, thisWeek, lastWeek, variance };
  });
}

export function getWeeklyReports(): WeeklyReport[] {
  return loadFromStorage<WeeklyReport[]>(STORAGE_KEY, seedMockReports());
}

function seedMockReports(): WeeklyReport[] {
  const now = new Date();
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return date.toISOString().split("T")[0];
  };
  const monday = getMonday(now);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const sundayStr = sunday.toISOString().split("T")[0];

  const lastMon = new Date(monday);
  lastMon.setDate(lastMon.getDate() - 7);
  const lastSun = new Date(lastMon);
  lastSun.setDate(lastSun.getDate() + 6);

  const reports: WeeklyReport[] = [
    {
      id: "WR-2026-001",
      weekStart: lastMon.toISOString().split("T")[0],
      weekEnd: lastSun.toISOString().split("T")[0],
      title: `Weekly FM Report — ${lastMon.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${lastSun.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      preparedBy: "Admin",
      preparedAt: new Date().toISOString(),
      status: "Final",
      attendanceSummary: [],
      maintenanceSummary: { scheduled: 8, completed: 6, overdue: 1, completionRate: 75 },
      maintenanceNotes: "Weekly HVAC filter replacements completed. Generator service pending.",
      workOrderSummary: { opened: 12, completed: 9, inProgress: 2, overdue: 1 },
      faultSummary: { reported: 5, resolved: 4, pending: 1 },
      utilitySummary: [
        { category: "Electricity", thisWeek: 12500, lastWeek: 11800, variance: 6 },
        { category: "Water", thisWeek: 3200, lastWeek: 3500, variance: -9 },
        { category: "Diesel", thisWeek: 8400, lastWeek: 9200, variance: -9 },
      ],
      notes: "All critical systems operational. No major incidents.",
      actionItems: [
        { id: "AI-1", description: "Complete generator maintenance", responsible: "Mike Chen", dueDate: "2026-06-15", priority: "high" },
        { id: "AI-2", description: "Review water treatment contract", responsible: "Sarah Lee", dueDate: "2026-06-18", priority: "medium" },
      ],
      recommendations: "Schedule HVAC preventive maintenance for next quarter. Review security protocols.",
    },
    {
      id: "WR-2026-002",
      weekStart: monday,
      weekEnd: sundayStr,
      title: `Weekly FM Report — ${new Date(monday).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${new Date(sundayStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      preparedBy: "Admin",
      preparedAt: new Date().toISOString(),
      status: "Draft",
      attendanceSummary: [],
      maintenanceSummary: { scheduled: 10, completed: 4, overdue: 2, completionRate: 40 },
      maintenanceNotes: "",
      workOrderSummary: { opened: 15, completed: 7, inProgress: 5, overdue: 3 },
      faultSummary: { reported: 3, resolved: 1, pending: 2 },
      utilitySummary: [],
      notes: "",
      actionItems: [],
      recommendations: "",
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  return reports;
}

export function createWeeklyReport(
  weekStart: string,
  weekEnd: string,
  preparedBy: string
): WeeklyReport {
  const reports = getWeeklyReports();
  const num = reports.length + 1;
  const id = `WR-2026-${String(num).padStart(3, "0")}`;
  const startDate = new Date(weekStart);
  const endDate = new Date(weekEnd);

  const report: WeeklyReport = {
    id,
    weekStart,
    weekEnd,
    title: `Weekly FM Report — ${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    preparedBy,
    preparedAt: new Date().toISOString(),
    status: "Draft",
    attendanceSummary: autoCalculateAttendance(weekStart, weekEnd),
    maintenanceSummary: autoCalculateMaintenance(weekStart, weekEnd),
    maintenanceNotes: "",
    workOrderSummary: autoCalculateWorkOrders(weekStart, weekEnd),
    faultSummary: autoCalculateFaults(weekStart, weekEnd),
    utilitySummary: autoCalculateUtilities(weekStart, weekEnd),
    notes: "",
    actionItems: [],
    recommendations: "",
  };

  reports.push(report);
  saveWeeklyReports(reports);
  return report;
}

export function saveWeeklyReport(report: WeeklyReport): void {
  const reports = getWeeklyReports();
  const idx = reports.findIndex((r) => r.id === report.id);
  if (idx >= 0) {
    reports[idx] = report;
  } else {
    reports.push(report);
  }
  saveWeeklyReports(reports);
}

export function saveWeeklyReports(reports: WeeklyReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {}
}

export function deleteWeeklyReport(id: string): void {
  const reports = getWeeklyReports();
  saveWeeklyReports(reports.filter((r) => r.id !== id));
}

export function getWorkOrdersForWeek(weekStart: string, weekEnd: string): WorkOrder[] {
  const orders = loadFromStorage<WorkOrder[]>("fixflow-work-orders", []);
  return orders.filter((o) => isInWeek(o.createdAt.split("T")[0], weekStart, weekEnd));
}

export function getPMTasksForWeek(weekStart: string, weekEnd: string): PMTask[] {
  const tasks = loadFromStorage<PMTask[]>("fixflow-pm-tasks", []);
  return tasks.filter((t) => {
    const lastDone = t.lastDone ? t.lastDone.split("T")[0] : "";
    return isInWeek(lastDone, weekStart, weekEnd);
  });
}

export function getFaultsForWeek(weekStart: string, weekEnd: string): FaultReport[] {
  const faults = loadFromStorage<FaultReport[]>("fixflow-fault-reports", []);
  return faults.filter((f) => isInWeek(f.reportedAt.split("T")[0], weekStart, weekEnd));
}

export function getUtilitiesForPeriod(weekStart: string, weekEnd: string): UtilityRecord[] {
  const records = loadFromStorage<UtilityRecord[]>("fixflow-utilities", []);
  return records.filter((r) => {
    const monthStart = `${r.year}-${String(Number(r.month)).padStart(2, "0")}-01`;
    return isInWeek(monthStart, weekStart, weekEnd);
  });
}
