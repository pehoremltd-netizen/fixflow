"use client";

import type { UserRole } from "@/types";

/* ─── Types ─── */
export interface ChecklistItem {
  label: string;
  result: "pass" | "fail" | null;
  notes: string;
}

export interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

export type InspectionType = "daily_walkthrough" | "routing_check" | "weekly_audit" | "monthly_audit";

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  daily_walkthrough: "Daily Walk-Through",
  routing_check: "Routing Check",
  weekly_audit: "Weekly Audit",
  monthly_audit: "Monthly Audit",
};

export interface InspectionRecord {
  id: string;
  type: InspectionType;
  typeLabel: string;
  status: "scheduled" | "in_progress" | "completed" | "failed";
  location: string;
  zone: string;
  inspector: string;
  inspectorRole: UserRole;
  dateStarted: string;
  dateCompleted: string;
  remarks: string;
  purpose: string;
  sections: ChecklistSection[];
  score: number;
  issueCount: number;
  totalItems: number;
  passCount: number;
  failCount: number;
}

export interface InspectionTemplate {
  type: InspectionType;
  label: string;
  sections: { title: string; items: { label: string }[] }[];
}

const INS_KEY = "fixflow_inspections";
const DRAFT_KEY = "fixflow_inspection_drafts";

function getItem<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `INS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function genRef(): string {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `INS-${n}`;
}

export function getCurrentUserRole(): UserRole {
  if (typeof window === "undefined") return "staff";
  try {
    const raw = localStorage.getItem("fixflow-token");
    if (raw) {
      const b64 = raw.includes(".") ? raw.split(".")[1] : raw;
      const payload = JSON.parse(atob(b64));
      const valid: UserRole[] = ["admin", "manager", "supervisor", "staff", "stakeholder", "tenant"];
      if (payload.role && valid.includes(payload.role)) return payload.role as UserRole;
    }
  } catch {}
  return "staff";
}

export function getCurrentUserName(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("fixflow-token");
    if (raw) {
      const b64 = raw.includes(".") ? raw.split(".")[1] : raw;
      const payload = JSON.parse(atob(b64));
      return payload.full_name || payload.email || "";
    }
  } catch {}
  return "";
}

/* ─── Templates ─── */
const DAILY_WALKTHROUGH_SECTIONS = [
  {
    title: "External / Compound",
    items: [
      { label: "Main gate and pedestrian entrance condition" },
      { label: "Perimeter fence/wall — no breach or damage" },
      { label: "Car park — clear, markings visible" },
      { label: "External lighting — functional" },
      { label: "Drainage channels — clear, no blockage" },
      { label: "Landscaping / grounds — tidy" },
    ],
  },
  {
    title: "Building Entrance & Lobby",
    items: [
      { label: "Main entrance door — functional, clean" },
      { label: "Reception area — tidy and presentable" },
      { label: "Lobby flooring — clean, no hazard" },
      { label: "Signage — visible and up to date" },
      { label: "Notice boards — current information posted" },
    ],
  },
  {
    title: "Corridors & Stairwells",
    items: [
      { label: "Corridor lighting — all bulbs working" },
      { label: "Fire exit signs — illuminated and visible" },
      { label: "Stairwell — clean, no obstruction" },
      { label: "Handrails — secure and intact" },
      { label: "Emergency exit doors — functional, not obstructed" },
    ],
  },
  {
    title: "Toilets & Conveniences",
    items: [
      { label: "Male toilets — clean and functional" },
      { label: "Female toilets — clean and functional" },
      { label: "Soap dispensers — filled" },
      { label: "Hand dryers / paper towels — available" },
      { label: "Flush mechanisms — working" },
      { label: "No leaks or plumbing issues observed" },
    ],
  },
  {
    title: "Electrical & Mechanical",
    items: [
      { label: "Distribution board access — secured" },
      { label: "No exposed wiring observed" },
      { label: "Air conditioning units — running, filters not visibly blocked" },
      { label: "Generator area — clean, no fuel leak" },
      { label: "Water pump / overhead tank — operational" },
    ],
  },
  {
    title: "Fire Safety",
    items: [
      { label: "Fire extinguishers — present, tagged, accessible" },
      { label: "Fire hose reels — accessible, not obstructed" },
      { label: "Smoke detectors — visible (no tampering)" },
      { label: "Fire assembly point — signage visible" },
    ],
  },
  {
    title: "Waste Management",
    items: [
      { label: "Waste bins — not overflowing" },
      { label: "Waste collection area — clean" },
      { label: "Recyclables separated (if applicable)" },
    ],
  },
  {
    title: "Overall Condition",
    items: [
      { label: "General cleanliness — acceptable" },
      { label: "No unusual odours detected" },
      { label: "No pest activity observed" },
      { label: "No structural concerns observed (cracks, leaks, dampness)" },
    ],
  },
];

const ROUTING_CHECK_SECTIONS = [
  {
    title: "Water Systems",
    items: [
      { label: "Cold water storage tanks — level adequate, no contamination" },
      { label: "Hot water system — operational, no leaks" },
      { label: "Booster pump — running, pressure normal" },
      { label: "Water meter reading (note reading)" },
      { label: "Visible pipe runs — no leaks or corrosion" },
    ],
  },
  {
    title: "Electrical Systems",
    items: [
      { label: "Main LV panel — no tripped breakers" },
      { label: "Sub-distribution boards — secured, labeled" },
      { label: "UPS / inverter — battery indicator normal" },
      { label: "Earthing/bonding — visually intact" },
      { label: "External cable trays — no damage" },
    ],
  },
  {
    title: "Mechanical / HVAC",
    items: [
      { label: "AHU (Air Handling Unit) — running, no unusual noise" },
      { label: "FCU units on floors — all operational" },
      { label: "Exhaust fans — running" },
      { label: "Chiller plant (if applicable) — running, no alarms" },
      { label: "Cooling towers (if applicable) — water level ok" },
    ],
  },
  {
    title: "Generator & Utility",
    items: [
      { label: "Generator fuel level — adequate (>50%)" },
      { label: "Generator last run log — confirm entry exists" },
      { label: "Transfer switch — normal position" },
      { label: "Fuel tank — no leaks" },
      { label: "Engine bay — clean, no oil spill" },
    ],
  },
  {
    title: "Lifts / Elevators",
    items: [
      { label: "Lift 1 — operational, no error code" },
      { label: "Lift 2 — operational, no error code" },
      { label: "Lift machine room — clean, access secured" },
      { label: "Last maintenance sticker — within schedule" },
    ],
  },
  {
    title: "Security Systems",
    items: [
      { label: "CCTV cameras — all online (no blind spots reported)" },
      { label: "Access control panels — normal" },
      { label: "Intercom — functional" },
      { label: "Guard post — manned and log up to date" },
    ],
  },
  {
    title: "Roof & External Services",
    items: [
      { label: "Roof surface — no ponding water" },
      { label: "Roof drain outlets — clear" },
      { label: "Lightning conductor — visually intact" },
      { label: "Antenna/satellite mounts — secure" },
    ],
  },
];

const WEEKLY_COMPLIANCE_SECTION = {
  title: "Compliance & Documentation",
  items: [
    { label: "Statutory certificates displayed (fire cert, occupancy cert)" },
    { label: "Maintenance log books — up to date" },
    { label: "Pest control records — available" },
    { label: "First aid box — stocked and accessible" },
    { label: "Accident/incident register — available" },
  ],
};

const WEEKLY_ASSET_SECTION = {
  title: "Asset Spot Check",
  items: [
    { label: "Asset 1 — verified against asset register (note tag ID)" },
    { label: "Asset 2 — verified against asset register (note tag ID)" },
    { label: "Asset 3 — verified against asset register (note tag ID)" },
  ],
};

const MONTHLY_STRUCTURAL_SECTION = {
  title: "Structural Inspection",
  items: [
    { label: "Roof — no visible damage or leaks" },
    { label: "Basement/car park — no seepage" },
    { label: "External walls — no major cracking" },
    { label: "Internal walls/ceilings — no water staining, no crack propagation" },
    { label: "Floor finishes — no trip hazards" },
  ],
};

const MONTHLY_EQUIPMENT_SECTION = {
  title: "Equipment Service Due",
  items: [
    { label: "Equipment with service due this month (note details)" },
  ],
};

export const INSPECTION_TEMPLATES: InspectionTemplate[] = [
  { type: "daily_walkthrough", label: "Daily Walk-Through", sections: DAILY_WALKTHROUGH_SECTIONS },
  { type: "routing_check", label: "Routing Check", sections: ROUTING_CHECK_SECTIONS },
  {
    type: "weekly_audit", label: "Weekly Audit",
    sections: [...DAILY_WALKTHROUGH_SECTIONS, WEEKLY_COMPLIANCE_SECTION, WEEKLY_ASSET_SECTION],
  },
  {
    type: "monthly_audit", label: "Monthly Audit",
    sections: [...DAILY_WALKTHROUGH_SECTIONS, WEEKLY_COMPLIANCE_SECTION, WEEKLY_ASSET_SECTION, MONTHLY_STRUCTURAL_SECTION, MONTHLY_EQUIPMENT_SECTION],
  },
];

export function getTemplate(type: InspectionType): InspectionTemplate | undefined {
  return INSPECTION_TEMPLATES.find((t) => t.type === type);
}

export function materializeSections(type: InspectionType): ChecklistSection[] {
  const template = getTemplate(type);
  if (!template) return [];
  return template.sections.map((s) => ({
    title: s.title,
    items: s.items.map((item) => ({ label: item.label, result: null, notes: "" })),
  }));
}

/* ─── CRUD ─── */
export function getInspections(): InspectionRecord[] {
  return getItem<InspectionRecord>(INS_KEY);
}

export function getInspectionById(id: string): InspectionRecord | undefined {
  return getInspections().find((i) => i.id === id);
}

export function createInspection(data: {
  type: InspectionType;
  location: string;
  zone: string;
  inspector: string;
  inspectorRole: UserRole;
  purpose?: string;
  remarks?: string;
}): InspectionRecord {
  const inspections = getInspections();
  const sections = materializeSections(data.type);
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const record: InspectionRecord = {
    id: genRef(),
    type: data.type,
    typeLabel: INSPECTION_TYPE_LABELS[data.type],
    status: "scheduled",
    location: data.location,
    zone: data.zone,
    inspector: data.inspector,
    inspectorRole: data.inspectorRole,
    dateStarted: new Date().toISOString(),
    dateCompleted: "",
    remarks: data.remarks || "",
    purpose: data.purpose || "",
    sections,
    score: 0,
    issueCount: 0,
    totalItems,
    passCount: 0,
    failCount: 0,
  };
  inspections.unshift(record);
  setItem(INS_KEY, inspections);
  return record;
}

export function updateInspection(id: string, data: Partial<InspectionRecord>): InspectionRecord | undefined {
  const inspections = getInspections();
  const idx = inspections.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  inspections[idx] = { ...inspections[idx], ...data };
  setItem(INS_KEY, inspections);
  return inspections[idx];
}

export function deleteInspection(id: string): void {
  const inspections = getInspections();
  setItem(INS_KEY, inspections.filter((i) => i.id !== id));
}

export function startInspection(id: string): InspectionRecord | undefined {
  return updateInspection(id, { status: "in_progress", dateStarted: new Date().toISOString() });
}

export function saveDraft(draft: InspectionRecord): void {
  const drafts = getDrafts();
  const idx = drafts.findIndex((d) => d.id === draft.id);
  if (idx >= 0) {
    drafts[idx] = draft;
  } else {
    drafts.unshift(draft);
  }
  setItem(DRAFT_KEY, drafts);
}

export function getDrafts(): InspectionRecord[] {
  return getItem<InspectionRecord>(DRAFT_KEY);
}

export function deleteDraft(id: string): void {
  const drafts = getDrafts();
  setItem(DRAFT_KEY, drafts.filter((d) => d.id !== id));
}

export function completeInspection(id: string): InspectionRecord | undefined {
  const inspections = getInspections();
  const idx = inspections.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  const rec = inspections[idx];
  let passCount = 0;
  let failCount = 0;
  for (const section of rec.sections) {
    for (const item of section.items) {
      if (item.result === "pass") passCount++;
      else if (item.result === "fail") failCount++;
    }
  }
  const total = rec.totalItems;
  const score = total > 0 ? Math.round((passCount / total) * 100) : 0;
  const status = failCount > 0 && score < 60 ? "failed" : "completed";
  inspections[idx] = {
    ...rec,
    status,
    score,
    passCount,
    failCount,
    issueCount: failCount,
    dateCompleted: new Date().toISOString(),
  };
  setItem(INS_KEY, inspections);
  deleteDraft(id);
  return inspections[idx];
}
