"use client";

import { api, getStoredOrgId } from "./client";

export interface DashboardStats {
  totalWorkOrders: number;
  openWorkOrders: number;
  completedWorkOrders: number;
  pendingInspections: number;
  totalAssets: number;
  activeStaff: number;
  overdueTasks: number;
}

export async function getDashboardStats() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: DashboardStats }>(`/dashboard/stats?organization_id=${orgId}`);
  return data.data;
}
