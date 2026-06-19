"use client";

import { api, getStoredOrgId } from "./client";

export interface UtilityRecord {
  id: string;
  organization_id: string;
  type: string;
  provider: string;
  monthly_cost: number;
  meter_number: string;
  created_at: string;
}

export async function getUtilities() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: UtilityRecord[] }>(`/utilities?organization_id=${orgId}`);
  return data.data;
}

export async function createUtility(utility: Partial<UtilityRecord>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: UtilityRecord }>("/utilities", { ...utility, organization_id: orgId });
  return data.data;
}

export async function deleteUtility(id: string) {
  await api.delete(`/utilities/${id}`);
}
