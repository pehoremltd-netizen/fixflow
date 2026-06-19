"use client";

import { api, getStoredOrgId } from "./client";

export interface PmSchedule {
  id: string;
  organization_id: string;
  asset_id: string;
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  assigned_to: string;
  next_due: string;
  status: "active" | "overdue" | "completed";
}

export async function getPmSchedules() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: PmSchedule[] }>(`/pm-schedule?organization_id=${orgId}`);
  return data.data;
}

export async function createPmSchedule(schedule: Partial<PmSchedule>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: PmSchedule }>("/pm-schedule", { ...schedule, organization_id: orgId });
  return data.data;
}

export async function updatePmSchedule(id: string, schedule: Partial<PmSchedule>) {
  const data = await api.patch<{ data: PmSchedule }>(`/pm-schedule/${id}`, schedule);
  return data.data;
}

export async function deletePmSchedule(id: string) {
  await api.delete(`/pm-schedule/${id}`);
}
