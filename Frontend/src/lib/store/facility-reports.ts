"use client";

export type ReportFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly";
export type PendingTaskStatus = "Pending" | "In Progress" | "Completed";

export interface ReportActivity {
  id: string;
  section: string;
  activity: string;
  tasks: string;
  frequency: ReportFrequency;
}

export interface ReportEntry {
  activityId: string;
  reportUpdate: string;
  notes: string;
  timestamp: string;
}

export interface DailyReport {
  date: string;
  entries: Record<string, ReportEntry>;
}

export interface PendingTask {
  id: string;
  number: number;
  task: string;
  status: PendingTaskStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoverMemo {
  recipients: string[];
  message: string;
  preparedBy: string;
}

export interface ActivityFieldStore {
  [activityId: string]: {
    reportUpdate: string;
    notes: string;
  };
}

const STORAGE_KEY = "fixflow-facility-reports";
const PENDING_TASKS_KEY = "fixflow-facility-pending-tasks";
const COVER_MEMO_KEY = "fixflow-cover-memo";
const DOC_REF_COUNTER_KEY = "fixflow-doc-ref-counter";
const ACTIVITY_FIELDS_KEY = "fixflow-activity-fields";

const REPORT_ACTIVITIES: ReportActivity[] = [
  // Ogba Facility - Daily
  { id: "ogba-power-daily", section: "Ogba Facility", activity: "Power Supply & Distribution", tasks: "Monitor mains supply, check GenSet status, verify UPS operation, log changeover events", frequency: "Daily" },
  { id: "ogba-hvac-daily", section: "Ogba Facility", activity: "HVAC Systems", tasks: "Monitor AHU/FCU operation, check temperature and humidity logs, inspect condenser units, verify thermostat settings", frequency: "Daily" },
  { id: "ogba-water-daily", section: "Ogba Facility", activity: "Water Supply & Treatment", tasks: "Check overhead tank levels, inspect borehole pump, verify water treatment system, log consumption readings", frequency: "Daily" },
  { id: "ogba-fire-daily", section: "Ogba Facility", activity: "Fire Safety Systems", tasks: "Test fire alarm panel, inspect extinguisher pressure, verify emergency lighting, check smoke detectors", frequency: "Daily" },
  { id: "ogba-security-daily", section: "Ogba Facility", activity: "Security Systems", tasks: "Monitor CCTV feed, verify access control logs, inspect perimeter lighting, log security incidents", frequency: "Daily" },
  { id: "ogba-lifts-daily", section: "Ogba Facility", activity: "Lifts & Elevators", tasks: "Verify cabin operation, test emergency phone, check door sensors, log fault codes", frequency: "Daily" },
  // Ogba Facility - Weekly
  { id: "ogba-genset-weekly", section: "Ogba Facility", activity: "Generator Set", tasks: "Run load test, check fuel level, inspect battery voltage, verify auto-changeover", frequency: "Weekly" },
  // Ogba Facility - Monthly
  { id: "ogba-panels-monthly", section: "Ogba Facility", activity: "Electrical Panels", tasks: "Inspect for heating, tighten connections, thermal scan, verify earth leakage", frequency: "Monthly" },
  { id: "ogba-plumbing-monthly", section: "Ogba Facility", activity: "Plumbing Systems", tasks: "Check pipes and valves, inspect toilets and drainage, verify water pressure, log repairs", frequency: "Monthly" },
  { id: "ogba-fabric-monthly", section: "Ogba Facility", activity: "Building Fabric", tasks: "Inspect walls, ceilings, floors, windows, and doors for damage", frequency: "Monthly" },
  // Ogba Facility - Quarterly
  { id: "ogba-pest-quarterly", section: "Ogba Facility", activity: "Pest Control", tasks: "Inspect bait stations, check for pest activity, verify waste area hygiene, log treatment", frequency: "Quarterly" },
  { id: "ogba-hvac-deep-quarterly", section: "Ogba Facility", activity: "HVAC Deep Maintenance", tasks: "Clean condenser coils, replace filters, check refrigerant, lubricate bearings", frequency: "Quarterly" },
  // Abuja Facility - Daily
  { id: "abuja-power-daily", section: "Abuja Facility", activity: "Power Supply & Distribution", tasks: "Monitor mains, GenSet, UPS, log changeovers", frequency: "Daily" },
  { id: "abuja-hvac-daily", section: "Abuja Facility", activity: "HVAC Systems", tasks: "Monitor AHU/FCU, check temps, inspect condensers", frequency: "Daily" },
  // Abuja Facility - Weekly
  { id: "abuja-genset-weekly", section: "Abuja Facility", activity: "Generator Set", tasks: "Run load test, check fuel/battery, verify changeover", frequency: "Weekly" },
  { id: "abuja-water-weekly", section: "Abuja Facility", activity: "Water Supply", tasks: "Check tank levels, inspect pump, log consumption", frequency: "Weekly" },
  // Abuja Facility - Monthly
  { id: "abuja-fire-monthly", section: "Abuja Facility", activity: "Fire Safety", tasks: "Test alarm panel, check extinguishers, verify emergency lights", frequency: "Monthly" },
  { id: "abuja-security-monthly", section: "Abuja Facility", activity: "Security Systems", tasks: "Monitor CCTV, verify access control, inspect perimeter", frequency: "Monthly" },
  // Abuja Facility - Quarterly
  { id: "abuja-fabric-quarterly", section: "Abuja Facility", activity: "Building Fabric", tasks: "Inspect roof, walls, ceilings, windows", frequency: "Quarterly" },
  { id: "abuja-pest-quarterly", section: "Abuja Facility", activity: "Pest Control", tasks: "Inspect bait stations, check for activity, log treatment", frequency: "Quarterly" },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function getNextTaskNumber(tasks: PendingTask[]): number {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map((t) => t.number)) + 1;
}

function getReportActivities(section?: string): ReportActivity[] {
  if (!section) return [...REPORT_ACTIVITIES];
  return REPORT_ACTIVITIES.filter((a) => a.section === section);
}

function getReportSections(): string[] {
  return [...new Set(REPORT_ACTIVITIES.map((a) => a.section))];
}

function loadReport(date: string): DailyReport {
  if (typeof window === "undefined") return { date, entries: {} };
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${date}`);
    if (raw) return JSON.parse(raw) as DailyReport;
  } catch {
    // ignore parse errors
  }
  return { date, entries: {} };
}

function saveReportEntry(date: string, activityId: string, entry: ReportEntry): void {
  if (typeof window === "undefined") return;
  const report = loadReport(date);
  report.entries[activityId] = entry;
  localStorage.setItem(`${STORAGE_KEY}-${date}`, JSON.stringify(report));
}

function getEntriesByFrequency(date: string, frequency: ReportFrequency): ReportEntry[] {
  const report = loadReport(date);
  const activities = getReportActivities();
  const matchingIds = new Set(
    activities.filter((a) => a.frequency === frequency).map((a) => a.id)
  );
  return Object.values(report.entries).filter((e) => matchingIds.has(e.activityId));
}

function loadPendingTasks(): PendingTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PENDING_TASKS_KEY);
    if (raw) return JSON.parse(raw) as PendingTask[];
  } catch {
    // ignore parse errors
  }
  return [];
}

function savePendingTasks(tasks: PendingTask[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_TASKS_KEY, JSON.stringify(tasks));
}

function addPendingTask(task: string): PendingTask {
  const tasks = loadPendingTasks();
  const now = new Date().toISOString();
  const newTask: PendingTask = {
    id: generateId(),
    number: getNextTaskNumber(tasks),
    task,
    status: "Pending",
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(newTask);
  savePendingTasks(tasks);
  return newTask;
}

function updatePendingTask(id: string, updates: Partial<PendingTask>): PendingTask | null {
  const tasks = loadPendingTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
  savePendingTasks(tasks);
  return tasks[index];
}

function deletePendingTask(id: string): void {
  const tasks = loadPendingTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  savePendingTasks(filtered);
}

/* ── Cover Memo ── */
function getCurrentUserName(): string {
  if (typeof window === "undefined") return "Admin User";
  try {
    const token = localStorage.getItem("fixflow-token");
    if (!token) return "Admin User";
    const b64 = token.split(".")[1];
    const payload = JSON.parse(atob(b64));
    const raw = localStorage.getItem("fixflow-generated-users");
    if (raw) {
      const users = JSON.parse(raw);
      const user = users[payload.email];
      if (user?.profile?.full_name) return user.profile.full_name;
    }
    return payload.email || "Admin User";
  } catch {
    return "Admin User";
  }
}

function loadCoverMemo(): CoverMemo {
  if (typeof window === "undefined") return { recipients: [], message: "", preparedBy: getCurrentUserName() };
  try {
    const raw = localStorage.getItem(COVER_MEMO_KEY);
    if (raw) return JSON.parse(raw) as CoverMemo;
  } catch {}
  return { recipients: [], message: "", preparedBy: getCurrentUserName() };
}

function saveCoverMemo(memo: CoverMemo): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COVER_MEMO_KEY, JSON.stringify(memo));
}

/* ── Document Reference ── */
function getDocumentRef(): string {
  if (typeof window === "undefined") return "FF-2026-001";
  try {
    const raw = localStorage.getItem(DOC_REF_COUNTER_KEY);
    const counter = raw ? parseInt(raw, 10) : 0;
    const year = new Date().getFullYear();
    return `FF-${year}-${String(counter).padStart(3, "0")}`;
  } catch {
    return "FF-2026-001";
  }
}

function incrementDocumentCounter(): string {
  if (typeof window === "undefined") return "FF-2026-001";
  try {
    const raw = localStorage.getItem(DOC_REF_COUNTER_KEY);
    let counter = raw ? parseInt(raw, 10) : 0;
    counter++;
    localStorage.setItem(DOC_REF_COUNTER_KEY, String(counter));
    const year = new Date().getFullYear();
    return `FF-${year}-${String(counter).padStart(3, "0")}`;
  } catch {
    return "FF-2026-001";
  }
}

/* ── Activity Field Persistence ── */
function loadActivityFields(): ActivityFieldStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACTIVITY_FIELDS_KEY);
    if (raw) return JSON.parse(raw) as ActivityFieldStore;
  } catch {}
  return {};
}

function saveActivityField(activityId: string, field: "reportUpdate" | "notes", value: string): void {
  if (typeof window === "undefined") return;
  const fields = loadActivityFields();
  if (!fields[activityId]) fields[activityId] = { reportUpdate: "", notes: "" };
  fields[activityId][field] = value;
  localStorage.setItem(ACTIVITY_FIELDS_KEY, JSON.stringify(fields));
}

function loadActivityField(activityId: string, field: "reportUpdate" | "notes"): string {
  const fields = loadActivityFields();
  return fields[activityId]?.[field] ?? "";
}

export {
  generateId,
  getNextTaskNumber,
  getReportActivities,
  getReportSections,
  loadReport,
  saveReportEntry,
  getEntriesByFrequency,
  loadPendingTasks,
  savePendingTasks,
  addPendingTask,
  updatePendingTask,
  deletePendingTask,
  loadCoverMemo,
  saveCoverMemo,
  getDocumentRef,
  incrementDocumentCounter,
  loadActivityField,
  saveActivityField,
  getCurrentUserName,
  REPORT_ACTIVITIES,
  STORAGE_KEY,
  PENDING_TASKS_KEY,
};
