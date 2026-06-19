"use client";

import { api, getStoredOrgId } from "./client";

export interface InventoryItem {
  id: string;
  organization_id: string;
  site_id?: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  unit_price: number;
  supplier?: string;
  location?: string;
}

export async function getInventory() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: InventoryItem[] }>(`/inventory?organization_id=${orgId}`);
  return data.data;
}

export async function createInventoryItem(item: Partial<InventoryItem>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: InventoryItem }>("/inventory", { ...item, organization_id: orgId });
  return data.data;
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>) {
  const data = await api.patch<{ data: InventoryItem }>(`/inventory/${id}`, item);
  return data.data;
}

export async function deleteInventoryItem(id: string) {
  await api.delete(`/inventory/${id}`);
}
