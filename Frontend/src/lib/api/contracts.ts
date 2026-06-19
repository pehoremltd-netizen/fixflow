"use client";

import { api, getStoredOrgId } from "./client";

export interface Contract {
  id: string;
  organization_id: string;
  vendor_name: string;
  service_type: string;
  start_date: string;
  end_date: string;
  value: number;
  status: "active" | "expired" | "terminated";
  sla?: string;
}

export async function getContracts() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: Contract[] }>(`/contracts?organization_id=${orgId}`);
  return data.data;
}

export async function createContract(contract: Partial<Contract>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: Contract }>("/contracts", { ...contract, organization_id: orgId });
  return data.data;
}

export async function updateContract(id: string, contract: Partial<Contract>) {
  const data = await api.patch<{ data: Contract }>(`/contracts/${id}`, contract);
  return data.data;
}

export async function deleteContract(id: string) {
  await api.delete(`/contracts/${id}`);
}
