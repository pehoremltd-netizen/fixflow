export type RequisitionStatus = "Draft" | "Submitted" | "Approved" | "Rejected";

export interface RequisitionItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Requisition {
  id: string;
  refNumber: string;
  date: string;
  supplier: string;
  purpose: string;
  status: RequisitionStatus;
  items: RequisitionItem[];
  createdAt: string;
}

const mockRequisitions: Requisition[] = [];

const STORAGE_KEY = "fixflow-requisitions";

function loadRequisitions(): Requisition[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveRequisitions(reqs: Requisition[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
}

export function getRequisitions(): Requisition[] {
  return loadRequisitions();
}

export function getRequisition(id: string): Requisition | undefined {
  return loadRequisitions().find((r) => r.id === id);
}

export function createRequisition(data: Omit<Requisition, "id" | "refNumber" | "createdAt">): Requisition {
  const reqs = loadRequisitions();
  const year = new Date().getFullYear();
  const existingYear = reqs.filter((r) => r.refNumber.startsWith(`INV-${year}`));
  const seq = existingYear.length + 1;
  const newReq: Requisition = {
    ...data,
    id: `REQ-${String(reqs.length + 1).padStart(3, "0")}`,
    refNumber: `INV-${year}-${String(seq).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
  };
  reqs.push(newReq);
  saveRequisitions(reqs);
  return newReq;
}

export function updateRequisition(id: string, data: Partial<Requisition>): Requisition | null {
  const reqs = loadRequisitions();
  const index = reqs.findIndex((r) => r.id === id);
  if (index === -1) return null;
  reqs[index] = { ...reqs[index], ...data };
  saveRequisitions(reqs);
  return reqs[index];
}

export function deleteRequisition(id: string): void {
  const reqs = loadRequisitions();
  saveRequisitions(reqs.filter((r) => r.id !== id));
}

export function calcItemTotal(item: RequisitionItem): number {
  return item.quantity * item.unitPrice;
}

export function calcGrandTotal(items: RequisitionItem[]): number {
  return items.reduce((sum, item) => sum + calcItemTotal(item), 0);
}
