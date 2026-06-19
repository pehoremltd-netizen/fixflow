"use client";

import { api, getStoredOrgId } from "./client";

export interface FaultReport {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
  reported_by: string;
  created_at: string;
}

export async function getFaultReports() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: FaultReport[] }>(`/fault-reports?organization_id=${orgId}`);
  return data.data;
}

export async function createFaultReport(report: Partial<FaultReport>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: FaultReport }>("/fault-reports", { ...report, organization_id: orgId });
  return data.data;
}

export async function updateFaultReport(id: string, report: Partial<FaultReport>) {
  const data = await api.patch<{ data: FaultReport }>(`/fault-reports/${id}`, report);
  return data.data;
}

export async function deleteFaultReport(id: string) {
  await api.delete(`/fault-reports/${id}`);
}
