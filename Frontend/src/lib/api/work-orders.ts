"use client";

import { api, getStoredOrgId } from "./client";

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "in-progress" | "completed" | "closed" | "cancelled";
  type: "preventive" | "corrective" | "emergency";
  site_id: string;
  asset_id?: string;
  assigned_to?: string;
  created_by: string;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getWorkOrders() {
  const orgId = getStoredOrgId();
  if (!orgId) throw new Error("No organization selected");
  const data = await api.get<{ data: WorkOrder[] }>(`/work-orders?organization_id=${orgId}`);
  return data.data;
}

export async function getWorkOrder(id: string) {
  const data = await api.get<{ data: WorkOrder }>(`/work-orders/${id}`);
  return data.data;
}

export async function createWorkOrder(wo: Partial<WorkOrder>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: WorkOrder }>("/work-orders", { ...wo, organization_id: orgId });
  return data.data;
}

export async function updateWorkOrder(id: string, wo: Partial<WorkOrder>) {
  const data = await api.patch<{ data: WorkOrder }>(`/work-orders/${id}`, wo);
  return data.data;
}

export async function deleteWorkOrder(id: string) {
  await api.delete(`/work-orders/${id}`);
}
