"use client";

import { api, getStoredOrgId } from "./client";

export interface MaintenanceRequest {
  id: string;
  organization_id: string;
  tenant_id: string;
  site_id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "submitted" | "in-progress" | "completed" | "closed";
  category: string;
  created_at: string;
}

export async function getMaintenanceRequests() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: MaintenanceRequest[] }>(`/maintenance-requests?organization_id=${orgId}`);
  return data.data;
}

export async function getTenantRequests(tenantId: string) {
  const data = await api.get<{ data: MaintenanceRequest[] }>(`/maintenance-requests/tenant/${tenantId}`);
  return data.data;
}

export async function createMaintenanceRequest(req: Partial<MaintenanceRequest>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: MaintenanceRequest }>("/maintenance-requests", { ...req, organization_id: orgId });
  return data.data;
}

export async function updateMaintenanceRequest(id: string, req: Partial<MaintenanceRequest>) {
  const data = await api.patch<{ data: MaintenanceRequest }>(`/maintenance-requests/${id}`, req);
  return data.data;
}
