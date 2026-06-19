"use client";

import { api, getStoredOrgId } from "./client";

export interface Asset {
  id: string;
  organization_id: string;
  site_id: string;
  name: string;
  category: string;
  model?: string;
  serial_number?: string;
  manufacturer?: string;
  status: "active" | "maintenance" | "retired";
  created_at: string;
}

export async function getAssets() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: Asset[] }>(`/assets?organization_id=${orgId}`);
  return data.data;
}

export async function createAsset(asset: Partial<Asset>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: Asset }>("/assets", { ...asset, organization_id: orgId });
  return data.data;
}

export async function updateAsset(id: string, asset: Partial<Asset>) {
  const data = await api.patch<{ data: Asset }>(`/assets/${id}`, asset);
  return data.data;
}

export async function deleteAsset(id: string) {
  await api.delete(`/assets/${id}`);
}
