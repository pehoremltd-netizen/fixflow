"use client";

import { generateId } from "@/lib/id-gen";

const STORE_PREFIX = "fixflow-offline-";

function getItem<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_PREFIX + key, JSON.stringify(data));
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORE_PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
}

class CollectionStore<T extends { id: string }> {
  private key: string;

  constructor(collection: string) {
    this.key = collection;
  }

  getAll(): T[] {
    return getItem<T>(this.key);
  }

  getById(id: string): T | undefined {
    return this.getAll().find((item) => item.id === id);
  }

  create(item: Omit<T, "id"> & { id?: string }): T {
    const items = this.getAll();
    const newItem = { ...item, id: item.id || generateId(this.key) } as T;
    items.push(newItem);
    setItem(this.key, items);
    return newItem;
  }

  update(id: string, updates: Partial<T>): T | null {
    const items = this.getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates };
    setItem(this.key, items);
    return items[idx];
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    setItem(this.key, items);
    return true;
  }

  query(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  seed(data: T[]): void {
    setItem(this.key, data);
  }
}

export const stores = {
  assets: new CollectionStore<any>("assets"),
  contractors: new CollectionStore<any>("contractors"),
  contracts: new CollectionStore<any>("contracts"),
  faults: new CollectionStore<any>("faults"),
  inspections: new CollectionStore<any>("inspections"),
  inventory: new CollectionStore<any>("inventory"),
  maintenanceRequests: new CollectionStore<any>("maintenanceRequests"),
  notifications: new CollectionStore<any>("notifications"),
  pmSchedules: new CollectionStore<any>("pmSchedules"),
  profiles: new CollectionStore<any>("profiles"),
  sites: new CollectionStore<any>("sites"),
  utilities: new CollectionStore<any>("utilities"),
  workOrders: new CollectionStore<any>("workOrders"),
} as const;

export type StoreName = keyof typeof stores;

/* ─── Backward-compatible stubs ─── */
export function isInitialized(): boolean {
  return false;
}

export function initSeedData(): void {
  /* no-op: seed data removed in production upgrade */
}

export function getOrganizationId(): string {
  /* production: return empty — user-set org ID in future */
  return "";
}

export function computeDashboardStats(): any {
  const wos = stores.workOrders.getAll();
  const assets = stores.assets.getAll();
  const profiles = stores.profiles.getAll();
  const inspections = stores.inspections.getAll();
  return {
    totalWorkOrders: wos.length,
    openWorkOrders: wos.filter((w: any) => w.status === "pending" || w.status === "approved" || w.status === "in-progress").length,
    completedWorkOrders: wos.filter((w: any) => w.status === "completed").length,
    pendingInspections: inspections.filter((i: any) => i.status === "draft" || i.status === "submitted").length,
    totalAssets: assets.length,
    activeStaff: profiles.filter((p: any) => p.is_active).length,
    overdueTasks: wos.filter((w: any) => w.status !== "completed" && w.status !== "cancelled" && w.due_date && new Date(w.due_date) < new Date()).length,
  };
}
