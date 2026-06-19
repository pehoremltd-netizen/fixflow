"use client";

import { api, getStoredOrgId } from "./client";

export interface Contractor {
  id: string;
  organization_id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  specialty: string;
  is_active: boolean;
}

export async function getContractors() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: Contractor[] }>(`/contractors?organization_id=${orgId}`);
  return data.data;
}

export async function createContractor(contractor: Partial<Contractor>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: Contractor }>("/contractors", { ...contractor, organization_id: orgId });
  return data.data;
}

export async function updateContractor(id: string, contractor: Partial<Contractor>) {
  const data = await api.patch<{ data: Contractor }>(`/contractors/${id}`, contractor);
  return data.data;
}

export async function deleteContractor(id: string) {
  await api.delete(`/contractors/${id}`);
}
