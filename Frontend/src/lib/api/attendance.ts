import { api } from "./client";
import type { Attendance } from "@/types";

export async function fetchAttendance(orgId?: string): Promise<Attendance[]> {
  const qs = orgId ? `?organization_id=${orgId}` : "";
  const res = await api.get<{ data: Attendance[] }>(`/attendance${qs}`);
  return res.data || [];
}

export async function clockIn(data: Partial<Attendance>): Promise<Attendance> {
  const res = await api.post<{ data: Attendance }>("/attendance", data);
  return res.data;
}
