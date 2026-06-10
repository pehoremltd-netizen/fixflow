export type PMFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "BiAnnual" | "Annual";
export type PMStatus = "Overdue" | "DueSoon" | "Upcoming" | "Completed";

export interface PMTask {
  id: string;
  asset: string;
  task: string;
  frequency: PMFrequency;
  lastDone: string;
  nextDue: string;
  responsible: string;
  location: string;
  status: PMStatus;
}

const STORAGE_KEY = "fixflow-pm-tasks";

export function calculateNextDue(lastDone: string, frequency: PMFrequency): string {
  const date = new Date(lastDone);
  switch (frequency) {
    case "Daily": date.setDate(date.getDate() + 1); break;
    case "Weekly": date.setDate(date.getDate() + 7); break;
    case "Monthly": date.setMonth(date.getMonth() + 1); break;
    case "Quarterly": date.setMonth(date.getMonth() + 3); break;
    case "BiAnnual": date.setMonth(date.getMonth() + 6); break;
    case "Annual": date.setFullYear(date.getFullYear() + 1); break;
  }
  return date.toISOString().split("T")[0];
}

function getStatus(nextDue: string): PMStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextDue);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Overdue";
  if (diffDays <= 7) return "DueSoon";
  return "Upcoming";
}

function recalcStatus(task: PMTask): PMTask {
  return { ...task, status: getStatus(task.nextDue) };
}

const today = new Date().toISOString().split("T")[0];
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString().split("T")[0];

const mockTasks: PMTask[] = [
  { id: "PM-001", asset: "HVAC Unit - Building A", task: "Replace air filters", frequency: "Monthly", lastDone: daysAgo(30), nextDue: today, responsible: "Mike Chen", location: "Building A - Roof", status: "DueSoon" },
  { id: "PM-002", asset: "Generator - Backup Power", task: "Oil change & filter", frequency: "Quarterly", lastDone: daysAgo(95), nextDue: daysFromNow(5), responsible: "Sarah Lee", location: "Building A - Basement", status: "DueSoon" },
  { id: "PM-003", asset: "Fire Alarm Panel", task: "System test", frequency: "Weekly", lastDone: daysAgo(3), nextDue: daysFromNow(4), responsible: "Emma Wilson", location: "Building B - Panel Room", status: "DueSoon" },
  { id: "PM-004", asset: "Chiller - Cooling System", task: "Inspect refrigerant levels", frequency: "Monthly", lastDone: daysAgo(45), nextDue: daysFromNow(15), responsible: "Mike Chen", location: "Building A - Mechanical Room", status: "Upcoming" },
  { id: "PM-005", asset: "Water Pump - Main Supply", task: "Lubricate bearings", frequency: "Monthly", lastDone: daysAgo(20), nextDue: daysFromNow(10), responsible: "John Doe", location: "Building B - Pump Room", status: "Upcoming" },
  { id: "PM-006", asset: "Elevator - Passenger", task: "Safety inspection", frequency: "Monthly", lastDone: daysAgo(10), nextDue: daysFromNow(20), responsible: "Lisa Park", location: "Building A - Elevator 1", status: "Upcoming" },
  { id: "PM-007", asset: "HVAC Unit - Building B", task: "Clean condenser coils", frequency: "Quarterly", lastDone: daysAgo(60), nextDue: daysFromNow(30), responsible: "Anna Kim", location: "Building B - Roof", status: "Upcoming" },
  { id: "PM-008", asset: "Generator - Backup Power", task: "Load bank test", frequency: "BiAnnual", lastDone: daysAgo(120), nextDue: daysFromNow(60), responsible: "Sarah Lee", location: "Building A - Basement", status: "Upcoming" },
  { id: "PM-009", asset: "Fire Suppression System", task: "Inspect nozzles & pipes", frequency: "Annual", lastDone: daysAgo(300), nextDue: daysFromNow(65), responsible: "Tom Green", location: "Building A - Kitchen", status: "Upcoming" },
  { id: "PM-010", asset: "Security Cameras", task: "Clean lenses & check recording", frequency: "Monthly", lastDone: daysAgo(40), nextDue: daysFromNow(20), responsible: "James Brown", location: "Building A & B", status: "Upcoming" },
  { id: "PM-011", asset: "HVAC Unit - Building A", task: "Belt replacement check", frequency: "Quarterly", lastDone: daysAgo(100), nextDue: daysFromNow(10), responsible: "Mike Chen", location: "Building A - Roof", status: "Upcoming" },
  { id: "PM-012", asset: "Electrical Panel - Main", task: "Thermal imaging scan", frequency: "BiAnnual", lastDone: daysAgo(200), nextDue: daysFromNow(160), responsible: "Sarah Lee", location: "Building A - Electrical Room", status: "Upcoming" },
  { id: "PM-013", asset: "Water Heater", task: "Flush & inspect anode rod", frequency: "Annual", lastDone: daysAgo(400), nextDue: daysFromNow(35), responsible: "John Doe", location: "Building B - Boiler Room", status: "Upcoming" },
  { id: "PM-014", asset: "HVAC Unit - Building A", task: "Complete system overhaul", frequency: "Annual", lastDone: daysAgo(350), nextDue: daysFromNow(15), responsible: "Mike Chen", location: "Building A - Roof", status: "Upcoming" },
  { id: "PM-015", asset: "Emergency Lights", task: "Test battery backup", frequency: "Monthly", lastDone: daysAgo(25), nextDue: daysFromNow(5), responsible: "Emma Wilson", location: "All Buildings", status: "DueSoon" },
];

function loadTasks(): PMTask[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored).map((t: PMTask) => recalcStatus(t));
  } catch {}
  const initial = mockTasks.map(t => recalcStatus(t));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveTasks(tasks: PMTask[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function getPMTasks(): PMTask[] {
  return loadTasks();
}

export function addPMTask(data: Omit<PMTask, "id" | "nextDue" | "status">): PMTask {
  const tasks = loadTasks();
  const maxNum = tasks.reduce((max, t) => {
    const num = parseInt(t.id.replace("PM-", ""));
    return num > max ? num : max;
  }, 0);
  const nextDue = calculateNextDue(data.lastDone, data.frequency);
  const newTask: PMTask = {
    ...data,
    id: `PM-${String(maxNum + 1).padStart(3, "0")}`,
    nextDue,
    status: getStatus(nextDue),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function markAsDone(id: string): PMTask | null {
  const tasks = loadTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  const now = new Date().toISOString().split("T")[0];
  tasks[index].lastDone = now;
  tasks[index].nextDue = calculateNextDue(now, tasks[index].frequency);
  tasks[index].status = getStatus(tasks[index].nextDue);
  saveTasks(tasks);
  return tasks[index];
}

export function deletePMTask(id: string): void {
  const tasks = loadTasks();
  saveTasks(tasks.filter(t => t.id !== id));
}
