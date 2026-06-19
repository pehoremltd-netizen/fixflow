"use client";

import { api, getStoredOrgId } from "./client";

export interface Attendance {
  id: string;
  organization_id: string;
  user_id: string;
  site_id: string;
  type: "clock-in" | "clock-out";
  timestamp: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  created_at: string;
}

export async function getAttendance() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: Attendance[] }>(`/attendance?organization_id=${orgId}`);
  return data.data;
}

export async function getStaffAttendance(userId: string) {
  const data = await api.get<{ data: Attendance[] }>(`/attendance/staff/${userId}`);
  return data.data;
}

export async function clockInOut(record: Partial<Attendance>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: Attendance }>("/attendance", { ...record, organization_id: orgId });
  return data.data;
}
