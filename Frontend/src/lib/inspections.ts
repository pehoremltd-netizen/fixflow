"use client";

const INS_KEY = "fixflow-inspections";
const COMP_KEY = "fixflow-compliance-documents";

export interface ChecklistItem {
  id: string;
  text: string;
  status: "pass" | "fail" | "na" | "pending";
  condition: "good" | "fair" | "poor" | null;
  remarks: string;
  isRequired: boolean;
  observationNote?: string;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  type: string;
  items: ChecklistItem[];
}

export interface Issue {
  id: string;
  checklistItemId: string;
  description: string;
  severity: "critical" | "high" | "normal" | "low";
  location: string;
  workOrderCreated: boolean;
  workOrderId: string;
}

export interface Inspection {
  id: string;
  referenceNo: string;
  type: string;
  title: string;
  siteId: string;
  siteName: string;
  scheduledDate: string;
  scheduledTime: string;
  inspectorId: string;
  inspectorName: string;
  status: "scheduled" | "in-progress" | "completed" | "failed";
  priority: "critical" | "high" | "normal" | "low";
  checklist: ChecklistItem[];
  overallScore: number;
  overallCondition: string;
  issuesFound: Issue[];
  remarks: string;
  signature: string;
  createdAt: string;
  completedAt: string;
  workOrdersCreated: string[];
}

export interface ComplianceDocument {
  id: string;
  name: string;
  category: string;
  siteId: string;
  siteName: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
  daysUntilExpiry: number;
  documentNo: string;
  issuedBy: string;
  notes: string;
}

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
  return crypto.randomUUID();
}

function genRef(): string {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `INS-${n}`;
}

const now = new Date();
const daysAgo = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); return d.toISOString(); };
const daysFromNow = (n: number) => { const d = new Date(now); d.setDate(d.getDate() + n); return d.toISOString(); };

const TEMPLATES: InspectionTemplate[] = [
  {
    id: "tpl-morning", name: "Morning Rounds", type: "Morning Rounds",
    items: [
      "Generator fuel level check", "Generator test run (5 minutes)", "All lighting operational",
      "Water supply pressure normal", "AC units running correctly", "Security cameras active",
      "Main entrance clean and clear", "Toilets clean and functional", "Fire exits clear and accessible",
      "Waste bins emptied", "Elevator operational", "Car park clear and secure",
      "Perimeter fence/wall intact", "Lobby/reception presentable", "Emergency contacts displayed",
    ].map((t, i) => ({ id: `mr-${i}`, text: t, status: "pending" as const, condition: null, remarks: "", isRequired: true })),
  },
  {
    id: "tpl-fire", name: "Fire Safety Inspection", type: "Fire Safety",
    items: [
      "Fire extinguishers in place", "Fire extinguisher pressure gauge green", "Fire extinguisher inspection tag current",
      "Fire alarm panel operational", "Fire alarm test conducted", "Sprinkler heads unobstructed",
      "Fire hose reel accessible", "Emergency lighting working", "Fire exit signs illuminated",
      "Fire exits unlocked and clear", "Assembly point marked and accessible", "Fire safety notice displayed",
      "Smoke detectors tested", "Fire doors operational and self-closing", "Emergency evacuation plan displayed",
    ].map((t, i) => ({ id: `fs-${i}`, text: t, status: "pending" as const, condition: null, remarks: "", isRequired: true })),
  },
  {
    id: "tpl-electrical", name: "Electrical Inspection", type: "Electrical",
    items: [
      "Main distribution board accessible", "No exposed wiring visible", "All circuit breakers labeled",
      "Earth leakage circuit breaker tested", "All sockets functional", "No overloaded extension cords",
      "Electrical room clean and dry", "UPS/inverter operational", "All lights functional",
      "Emergency lighting tested", "Generator automatic transfer switch tested", "Solar inverter operational (if applicable)",
      "CCTV power supply stable", "Access control power stable",
    ].map((t, i) => ({ id: `el-${i}`, text: t, status: "pending" as const, condition: null, remarks: "", isRequired: true })),
  },
  {
    id: "tpl-hvac", name: "HVAC Inspection", type: "HVAC",
    items: [
      "All AC units operational", "AC filters cleaned/replaced", "Condenser units clear of obstruction",
      "Drain pipes clear and flowing", "Thermostat settings correct", "Unusual noise from any unit",
      "Refrigerant levels adequate", "Ducting intact and sealed", "Ventilation fans operational",
      "Air quality acceptable", "Temperature within comfort range",
    ].map((t, i) => ({ id: `hv-${i}`, text: t, status: "pending" as const, condition: null, remarks: "", isRequired: true })),
  },
  {
    id: "tpl-plumbing", name: "Plumbing Inspection", type: "Plumbing",
    items: [
      "Water supply pressure adequate", "No visible pipe leaks", "All taps operational",
      "Toilets flushing correctly", "Urinals operational (if applicable)", "Drainage flowing freely",
      "No foul smell from drains", "Water storage tank level adequate", "Water storage tank clean",
      "Borehole pump operational", "Water treatment system operational", "Hot water system functional",
      "No damp patches on walls/floors",
    ].map((t, i) => ({ id: `pl-${i}`, text: t, status: "pending" as const, condition: null, remarks: "", isRequired: true })),
  },
  {
    id: "tpl-audit", name: "Facility Audit", type: "Facility Audit",
    items: [
      "Building exterior condition", "Roof condition (no leaks/damage)", "Windows and doors operational",
      "Floor condition (no cracks/damage)", "Wall condition (no cracks/damp)", "Ceiling condition",
      "Painting condition", "Car park markings visible", "Landscaping maintained",
      "Perimeter security adequate", "Signage in good condition", "Reception area presentable",
      "Meeting rooms functional", "Server room temperature controlled", "Store room organized",
    ].map((t, i) => ({ id: `fa-${i}`, text: t, status: "pending" as const, condition: null, remarks: "", isRequired: true })),
  },
  {
    id: "tpl-compliance", name: "Compliance Check", type: "Compliance",
    items: [
      "Fire safety certificate current", "Elevator inspection certificate current", "Environmental permit current",
      "Electrical installation certificate current", "Building permit available", "Insurance certificate current",
      "Health and safety policy displayed", "Accident register up to date", "Staff safety training records current",
      "First aid box stocked and accessible", "Safety officer appointed", "Risk assessment current",
    ].map((t, i) => ({ id: `cc-${i}`, text: t, status: "pending" as const, condition: null, remarks: "", isRequired: true })),
  },
];

export function getTemplates(): InspectionTemplate[] {
  return TEMPLATES;
}

export function getTemplateById(id: string): InspectionTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

const SEED_SITES: { id: string; name: string }[] = [];

const SEED_INSPECTORS: { id: string; name: string }[] = [];

const SEED_TYPES: string[] = [];

function createSeedInspections(): Inspection[] { return []; }
const SEED_CATEGORIES: string[] = [];

function createSeedCompliance(): ComplianceDocument[] { return []; }
function ensureSeeded(): void {}

function loadInspections(): Inspection[] {
  ensureSeeded();
  return getItem<Inspection>(INS_KEY);
}

function saveInspections(data: Inspection[]): void {
  setItem(INS_KEY, data);
}

export function getInspections(): Inspection[] {
  return loadInspections().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getInspectionById(id: string): Inspection | undefined {
  return loadInspections().find((i) => i.id === id);
}

export function createInspection(data: Partial<Inspection>): Inspection {
  const inspections = loadInspections();
  const template = data.type ? getTemplates().find((t) => t.type === data.type) : undefined;
  const insp: Inspection = {
    ...data,
    id: genId(),
    referenceNo: genRef(),
    type: data.type || "General",
    title: data.title || `${data.type || "General"} Inspection`,
    siteId: data.siteId || "",
    siteName: data.siteName || "",
    scheduledDate: data.scheduledDate || new Date().toISOString(),
    scheduledTime: data.scheduledTime || "09:00",
    inspectorId: data.inspectorId || "",
    inspectorName: data.inspectorName || "",
    status: "scheduled",
    priority: data.priority || "normal",
    createdAt: new Date().toISOString(),
    completedAt: "",
    overallScore: 0,
    overallCondition: "",
    issuesFound: [],
    remarks: "",
    signature: "",
    workOrdersCreated: [],
    checklist: template ? template.items.map((item) => ({ ...item, status: "pending" as const, condition: null, remarks: "" })) : (data.checklist || []),
  };
  inspections.unshift(insp);
  saveInspections(inspections);
  return insp;
}

export function updateInspection(id: string, data: Partial<Inspection>): Inspection | undefined {
  const inspections = loadInspections();
  const idx = inspections.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  inspections[idx] = { ...inspections[idx], ...data };
  saveInspections(inspections);
  return inspections[idx];
}

export function deleteInspection(id: string): void {
  const inspections = loadInspections();
  saveInspections(inspections.filter((i) => i.id !== id));
}

export function startInspection(id: string): Inspection | undefined {
  return updateInspection(id, { status: "in-progress" });
}

export function updateChecklistItem(
  inspectionId: string,
  itemId: string,
  data: Partial<ChecklistItem>
): Inspection | undefined {
  const inspections = loadInspections();
  const inspIdx = inspections.findIndex((i) => i.id === inspectionId);
  if (inspIdx === -1) return undefined;
  const itemIdx = inspections[inspIdx].checklist.findIndex((c) => c.id === itemId);
  if (itemIdx === -1) return undefined;
  inspections[inspIdx].checklist[itemIdx] = { ...inspections[inspIdx].checklist[itemIdx], ...data };
  saveInspections(inspections);
  return inspections[inspIdx];
}

export function calculateScore(checklist: ChecklistItem[]): number {
  const pass = checklist.filter((c) => c.status === "pass").length;
  const fail = checklist.filter((c) => c.status === "fail").length;
  const na = checklist.filter((c) => c.status === "na").length;
  const total = checklist.length - na;
  if (total === 0) return 0;
  return Math.round((pass / total) * 100);
}

export function completeInspection(
  id: string,
  signature: string,
  remarks: string
): Inspection | undefined {
  const inspections = loadInspections();
  const idx = inspections.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  const score = calculateScore(inspections[idx].checklist);
  const passed = score >= 60;
  const fails = inspections[idx].checklist.filter((c) => c.status === "fail");
  const issues: Issue[] = fails.map((f) => ({
    id: genId(),
    checklistItemId: f.id,
    description: f.text,
    severity: "high" as const,
    location: inspections[idx].siteName,
    workOrderCreated: false,
    workOrderId: "",
  }));
  let woCreated: string[] = [];
  if (fails.length > 0) {
    woCreated = fails.map(() => {
      const woId = `WO-${Math.floor(Math.random() * 9000) + 1000}`;
      const existing = getItem<Record<string, any>>("fixflow-work-orders");
      existing.push({
        id: woId,
        title: `Repair: ${inspections[idx].title}`,
        status: "pending",
        priority: "high",
        createdAt: new Date().toISOString(),
      });
      setItem("fixflow-work-orders", existing);
      return woId;
    });
  }
  inspections[idx] = {
    ...inspections[idx],
    status: passed ? "completed" : "failed",
    overallScore: score,
    overallCondition: score >= 80 ? "Good" : score >= 60 ? "Fair" : "Poor",
    issuesFound: issues,
    remarks,
    signature,
    completedAt: new Date().toISOString(),
    workOrdersCreated: woCreated,
  };
  saveInspections(inspections);
  return inspections[idx];
}

export function createWorkOrderFromIssue(inspectionId: string, issueId: string): string | undefined {
  const inspections = loadInspections();
  const insp = inspections.find((i) => i.id === inspectionId);
  if (!insp) return undefined;
  const issue = insp.issuesFound.find((iss) => iss.id === issueId);
  if (!issue) return undefined;
  if (issue.workOrderCreated) return issue.workOrderId;
  const woId = `WO-${Math.floor(Math.random() * 9000) + 1000}`;
  const existing = getItem<Record<string, any>>("fixflow-work-orders");
  existing.push({
    id: woId,
    title: `Repair: ${issue.description}`,
    status: "pending",
    priority: issue.severity,
    location: issue.location,
    inspectionRef: insp.referenceNo,
    createdAt: new Date().toISOString(),
  });
  setItem("fixflow-work-orders", existing);
  issue.workOrderCreated = true;
  issue.workOrderId = woId;
  insp.workOrdersCreated.push(woId);
  saveInspections(inspections);
  return woId;
}

export function getComplianceDocuments(): ComplianceDocument[] {
  ensureSeeded();
  const docs = getItem<ComplianceDocument>(COMP_KEY);
  return docs.map((d) => {
    const nowDate = new Date();
    const expiry = new Date(d.expiryDate);
    const diff = Math.ceil((expiry.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      ...d,
      daysUntilExpiry: diff,
      status: (diff < 0 ? "expired" : diff <= 30 ? "expiring" : "valid") as ComplianceDocument["status"],
    } as ComplianceDocument;
  }).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

export function addComplianceDocument(data: Partial<ComplianceDocument>): ComplianceDocument {
  const docs = getItem<ComplianceDocument>(COMP_KEY);
  const expiryDate = data.expiryDate || new Date().toISOString();
  const nowDate = new Date();
  const expiry = new Date(expiryDate);
  const diff = Math.ceil((expiry.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
  const doc: ComplianceDocument = {
    id: genId(),
    name: data.name || "",
    category: data.category || "",
    siteId: data.siteId || "",
    siteName: data.siteName || "",
    issueDate: data.issueDate || new Date().toISOString(),
    expiryDate,
    status: diff < 0 ? "expired" : diff <= 30 ? "expiring" : "valid",
    daysUntilExpiry: diff,
    documentNo: data.documentNo || "",
    issuedBy: data.issuedBy || "",
    notes: data.notes || "",
  };
  docs.push(doc);
  setItem(COMP_KEY, docs);
  return doc;
}

export function updateComplianceDocument(id: string, data: Partial<ComplianceDocument>): ComplianceDocument | undefined {
  const docs = getItem<ComplianceDocument>(COMP_KEY);
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  docs[idx] = { ...docs[idx], ...data };
  if (data.expiryDate) {
    const nowDate = new Date();
    const expiry = new Date(data.expiryDate);
    docs[idx].daysUntilExpiry = Math.ceil((expiry.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
    docs[idx].status = docs[idx].daysUntilExpiry < 0 ? "expired" : docs[idx].daysUntilExpiry <= 30 ? "expiring" : "valid";
  }
  setItem(COMP_KEY, docs);
  return docs[idx];
}

export function deleteComplianceDocument(id: string): void {
  const docs = getItem<ComplianceDocument>(COMP_KEY);
  setItem(COMP_KEY, docs.filter((d) => d.id !== id));
}

export function getExpiringDocuments(days: number = 30): ComplianceDocument[] {
  return getComplianceDocuments().filter((d) => d.daysUntilExpiry <= days);
}
