"use client";

const STORAGE_KEY = "fixflow-observations";

export interface FieldObservation {
  id: string;
  referenceNo: string;
  title: string;
  assetName: string;
  assetCategory: string;
  location: string;
  siteName: string;
  observedBy: string;
  observedAt: string;
  description: string;
  detailedNote: string;
  severity: "critical" | "high" | "normal" | "low";
  status: "open" | "acknowledged" | "work-order-created" | "resolved";
  workOrderId: string;
  workOrderCreated: boolean;
  inspectionId: string;
  faultReportId: string;
  tags: string[];
  resolution: string;
  resolvedAt: string;
  resolvedBy: string;
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
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createSeed(): FieldObservation[] { return []; }

function loadObservations(): FieldObservation[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveObservations(data: FieldObservation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getObservations(): FieldObservation[] {
  return loadObservations().sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
}

export function getObservationById(id: string): FieldObservation | undefined {
  return loadObservations().find((o) => o.id === id);
}

export function addObservation(data: Partial<FieldObservation>): FieldObservation {
  const list = loadObservations();
  const maxNum = list.reduce((max, o) => {
    const num = parseInt(o.referenceNo.replace("OBS-", ""));
    return num > max ? num : max;
  }, 0);
  const obs: FieldObservation = {
    id: genId(),
    referenceNo: `OBS-${String(maxNum + 1).padStart(3, "0")}`,
    title: data.title || "Untitled Observation",
    assetName: data.assetName || "",
    assetCategory: data.assetCategory || "Other",
    location: data.location || "",
    siteName: data.siteName || "",
    observedBy: data.observedBy || "Unknown",
    observedAt: new Date().toISOString(),
    description: data.description || "",
    detailedNote: data.detailedNote || "",
    severity: data.severity || "normal",
    status: "open",
    workOrderId: "",
    workOrderCreated: false,
    inspectionId: data.inspectionId || "",
    faultReportId: data.faultReportId || "",
    tags: data.tags || [],
    resolution: "",
    resolvedAt: "",
    resolvedBy: "",
  };
  list.push(obs);
  saveObservations(list);
  return obs;
}

export function updateObservation(id: string, data: Partial<FieldObservation>): FieldObservation | undefined {
  const list = loadObservations();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...data };
  saveObservations(list);
  return list[idx];
}

export function deleteObservation(id: string): void {
  const list = loadObservations();
  saveObservations(list.filter((o) => o.id !== id));
}

export function createWorkOrderFromObservation(id: string): string | undefined {
  const list = loadObservations();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  const obs = list[idx];
  if (obs.workOrderCreated) return obs.workOrderId;

  const existingOrders = getItem<Record<string, any>>("fixflow-work-orders");
  const maxNum = existingOrders.reduce((max: number, wo: any) => {
    const num = parseInt((wo.id || "").replace("WO-", ""));
    return num > max ? num : max;
  }, 0);
  const woId = `WO-${String(maxNum + 1).padStart(3, "0")}`;

  const categoryMap: Record<string, string> = {
    Plumbing: "plumbing", Electrical: "electrical", HVAC: "hvac",
    Generator: "mechanical", Structural: "structural", "Fire Safety": "safety",
    Security: "electrical", Lift: "mechanical", "Water System": "plumbing",
  };

  existingOrders.push({
    id: woId,
    title: `Repair: ${obs.title}`,
    description: `Observation: ${obs.referenceNo}\n\n${obs.detailedNote}\n\nAsset: ${obs.assetName}\nLocation: ${obs.location}\nSeverity: ${obs.severity}`,
    status: "OPEN",
    priority: obs.severity === "critical" ? "critical" : obs.severity === "high" ? "high" : obs.severity === "normal" ? "medium" : "low",
    location: obs.location,
    category: categoryMap[obs.assetCategory] || "mechanical",
    createdAt: new Date().toISOString(),
  });
  setItem("fixflow-work-orders", existingOrders);

  list[idx] = {
    ...obs,
    workOrderCreated: true,
    workOrderId: woId,
    status: "work-order-created",
  };
  saveObservations(list);
  return woId;
}
