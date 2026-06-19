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

const mockTasks: PMTask[] = [];

function loadTasks(): PMTask[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored).map((t: PMTask) => recalcStatus(t));
  } catch {}
  return [];
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
