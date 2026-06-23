"use client";

import { api, getStoredOrgId } from "./client";

export interface Site {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
}

export async function getSites() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: Site[] }>(`/sites?organization_id=${orgId}`);
  return data.data;
}

export async function createSite(site: Partial<Site>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: Site }>("/sites", { ...site, organization_id: orgId });
  return data.data;
}

export async function updateSite(id: string, site: Partial<Site>) {
  const data = await api.patch<{ data: Site }>(`/sites/${id}`, site);
  return data.data;
}

export async function deleteSite(id: string) {
  await api.delete(`/sites/${id}`);
}
