"use client";

export type ActivityFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly";
export type ActivityStatus = "Pending" | "Completed" | "Escalated";
export type FacilitySection = "Ogba Facility" | "Abuja Facility";

export interface FacilityActivity {
  id: string;
  section: FacilitySection;
  title: string;
  tasks: string[];
  frequency: ActivityFrequency;
  status: ActivityStatus;
  loggedAt: string | null;
  loggedBy: string | null;
  notes: string;
  vendor: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "fixflow-facility-operations";

const DEFAULT_ACTIVITIES: Omit<FacilityActivity, "id" | "createdAt" | "updatedAt">[] = [
  // ── Ogba Facility ──
  {
    section: "Ogba Facility",
    title: "Generator Maintenance & Fuel Management",
    tasks: [
      "Check generator oil level and coolant",
      "Inspect fuel level and log consumption",
      "Run generator under load for 30 min (weekly)",
      "Check battery voltage and charger status",
      "Log run hours and fuel consumption",
    ],
    frequency: "Daily",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "HVAC System Monitoring",
    tasks: [
      "Check all AC unit temperatures and setpoints",
      "Inspect condenser units for debris",
      "Verify drain lines are clear",
      "Log any abnormal noise or vibration",
      "Record energy consumption readings",
    ],
    frequency: "Daily",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "Water Supply & Plumbing Inspection",
    tasks: [
      "Check overhead tank water level",
      "Inspect borehole pump operation",
      "Verify water treatment system status",
      "Check for visible pipe leaks",
      "Log water consumption reading",
    ],
    frequency: "Daily",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "Fire Safety Systems Check",
    tasks: [
      "Verify fire alarm panel is operational",
      "Check fire extinguisher pressure gauges",
      "Inspect emergency exit lights",
      "Test smoke detectors (zone sample)",
      "Log any faults or alarms",
    ],
    frequency: "Weekly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "Electrical Distribution Inspection",
    tasks: [
      "Inspect main distribution panel for heating",
      "Check earth leakage breaker operation",
      "Verify UPS status and battery health",
      "Inspect lighting contactors",
      "Log voltage readings across phases",
    ],
    frequency: "Weekly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "Elevator & Lift Maintenance",
    tasks: [
      "Inspect elevator cabin condition",
      "Verify emergency phone operation",
      "Check door sensors and closing mechanism",
      "Log any fault codes from controller",
      "Test emergency stop and alarm",
    ],
    frequency: "Weekly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "Security Systems Check",
    tasks: [
      "Test CCTV camera feeds — all zones",
      "Verify access control system operation",
      "Check intercom functionality",
      "Inspect perimeter lighting",
      "Log any security incidents",
    ],
    frequency: "Weekly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "Structural & Building Fabric Inspection",
    tasks: [
      "Inspect roof for leaks or damage",
      "Check walls and ceilings for cracks",
      "Verify window seals and drainage",
      "Inspect floor conditions",
      "Log any structural concerns",
    ],
    frequency: "Monthly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "Pest Control & Sanitation",
    tasks: [
      "Inspect all areas for pest activity",
      "Check bait stations and traps",
      "Verify waste disposal areas are clean",
      "Inspect kitchen and dining areas",
      "Log pest control treatment applied",
    ],
    frequency: "Monthly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "Generator Deep Service",
    tasks: [
      "Change engine oil and filters",
      "Replace fuel filters",
      "Check coolant concentration",
      "Inspect alternator brushes",
      "Test automatic transfer switch",
      "Load bank test at 75% capacity",
    ],
    frequency: "Quarterly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "HVAC Preventive Maintenance",
    tasks: [
      "Clean condenser coils",
      "Replace air filters — all units",
      "Check refrigerant levels",
      "Inspect fan belts and tension",
      "Lubricate motor bearings",
      "Test thermostat calibration",
    ],
    frequency: "Quarterly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Ogba Facility",
    title: "Fire Suppression System Service",
    tasks: [
      "Inspect sprinkler heads and pipes",
      "Test fire pump operation",
      "Verify fire hydrant pressure",
      "Check foam concentrate level (if applicable)",
      "Log system test results",
      "Renew fire safety certificate if due",
    ],
    frequency: "Quarterly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  // ── Abuja Facility (future) ──
  {
    section: "Abuja Facility",
    title: "Generator Operations",
    tasks: [
      "Check generator oil and coolant levels",
      "Log fuel consumption and run hours",
      "Run weekly load test",
      "Inspect battery bank",
    ],
    frequency: "Daily",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Abuja Facility",
    title: "HVAC Monitoring",
    tasks: [
      "Verify AC unit operation",
      "Check temperature setpoints",
      "Inspect outdoor condensers",
      "Log energy readings",
    ],
    frequency: "Daily",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Abuja Facility",
    title: "Water & Plumbing Checks",
    tasks: [
      "Check water tank levels",
      "Inspect pump operation",
      "Verify no pipe leaks",
      "Log water consumption",
    ],
    frequency: "Daily",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Abuja Facility",
    title: "Fire Safety Inspection",
    tasks: [
      "Test fire alarm panel",
      "Check extinguishers",
      "Verify emergency lighting",
      "Test smoke detectors",
    ],
    frequency: "Weekly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Abuja Facility",
    title: "Security Systems Check",
    tasks: [
      "Test CCTV cameras",
      "Verify access control",
      "Check perimeter lighting",
      "Log security events",
    ],
    frequency: "Weekly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Abuja Facility",
    title: "Building Fabric Inspection",
    tasks: [
      "Inspect roof condition",
      "Check walls and ceilings",
      "Verify window seals",
      "Log structural observations",
    ],
    frequency: "Monthly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
  {
    section: "Abuja Facility",
    title: "Generator & HVAC Quarterly Service",
    tasks: [
      "Change oil and filters",
      "Clean AC condenser coils",
      "Replace air filters",
      "Test all safety systems",
      "Log service completed",
    ],
    frequency: "Quarterly",
    status: "Pending",
    loggedAt: null,
    loggedBy: null,
    notes: "",
    vendor: "",
  },
];

function generateId(): string {
  return `fo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadActivities(): FacilityActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const initial = DEFAULT_ACTIVITIES.map((a) => ({
    ...a,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveActivities(activities: FacilityActivity[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

export function getActivities(): FacilityActivity[] {
  return loadActivities();
}

export function updateActivityStatus(id: string, status: ActivityStatus, loggedBy?: string, notes?: string): FacilityActivity | null {
  const activities = loadActivities();
  const idx = activities.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  activities[idx] = {
    ...activities[idx],
    status,
    loggedAt: status === "Completed" ? new Date().toISOString() : activities[idx].loggedAt,
    loggedBy: loggedBy || activities[idx].loggedBy,
    notes: notes !== undefined ? notes : activities[idx].notes,
    updatedAt: new Date().toISOString(),
  };
  saveActivities(activities);
  return activities[idx];
}

export function updateActivityNotes(id: string, notes: string): FacilityActivity | null {
  const activities = loadActivities();
  const idx = activities.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  activities[idx] = { ...activities[idx], notes, updatedAt: new Date().toISOString() };
  saveActivities(activities);
  return activities[idx];
}

export function updateActivityVendor(id: string, vendor: string): FacilityActivity | null {
  const activities = loadActivities();
  const idx = activities.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  activities[idx] = { ...activities[idx], vendor, updatedAt: new Date().toISOString() };
  saveActivities(activities);
  return activities[idx];
}

export function getActivitiesBySection(section: FacilitySection): FacilityActivity[] {
  return loadActivities().filter((a) => a.section === section);
}

export function getActivitiesByFrequency(frequency: ActivityFrequency): FacilityActivity[] {
  return loadActivities().filter((a) => a.frequency === frequency);
}

export function getSections(): FacilitySection[] {
  const activities = loadActivities();
  return [...new Set(activities.map((a) => a.section))] as FacilitySection[];
}

export function getActivityCounts(): { total: number; pending: number; completed: number; escalated: number } {
  const activities = loadActivities();
  return {
    total: activities.length,
    pending: activities.filter((a) => a.status === "Pending").length,
    completed: activities.filter((a) => a.status === "Completed").length,
    escalated: activities.filter((a) => a.status === "Escalated").length,
  };
}
