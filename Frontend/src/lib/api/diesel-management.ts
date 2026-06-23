import { api } from "./client";
import type { DieselLog, Generator, DieselAlert } from "@/types";

export async function fetchDieselLogs(params?: Record<string, string>): Promise<DieselLog[]> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await api.get<{ data: DieselLog[] }>(`/diesel-management${qs}`);
  return res.data || [];
}

export async function fetchDieselLog(id: string): Promise<DieselLog | null> {
  try {
    const res = await api.get<{ data: DieselLog }>(`/diesel-management/${id}`);
    return res.data;
  } catch { return null; }
}

export async function fetchDieselStats(params?: Record<string, string>): Promise<any> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await api.get<{ data: any }>(`/diesel-management/stats${qs}`);
  return res.data;
}

export async function fetchGenerators(): Promise<Generator[]> {
  const res = await api.get<{ data: Generator[] }>("/diesel-management/generators");
  return res.data || [];
}

export async function createGenerator(data: Partial<Generator>): Promise<Generator> {
  const res = await api.post<{ data: Generator }>("/diesel-management/generators", data);
  return res.data;
}

export async function updateGenerator(id: string, data: Partial<Generator>): Promise<Generator> {
  const res = await api.patch<{ data: Generator }>(`/diesel-management/generators/${id}`, data);
  return res.data;
}

export async function fetchAlerts(): Promise<DieselAlert[]> {
  const res = await api.get<{ data: DieselAlert[] }>("/diesel-management/alerts");
  return res.data || [];
}

export async function resolveAlert(id: string): Promise<void> {
  await api.patch(`/diesel-management/alerts/${id}/resolve`);
}

export async function createDieselLog(data: Partial<DieselLog>): Promise<DieselLog> {
  const res = await api.post<{ data: DieselLog }>("/diesel-management", data);
  return res.data;
}

export async function updateDieselLog(id: string, data: Partial<DieselLog>): Promise<DieselLog> {
  const res = await api.patch<{ data: DieselLog }>(`/diesel-management/${id}`, data);
  return res.data;
}

export async function approveDieselLog(id: string, approvedBy: string): Promise<DieselLog> {
  const res = await api.patch<{ data: DieselLog }>(`/diesel-management/${id}/approve`, { approved_by: approvedBy });
  return res.data;
}

export async function rejectDieselLog(id: string, reason: string, approvedBy: string): Promise<DieselLog> {
  const res = await api.patch<{ data: DieselLog }>(`/diesel-management/${id}/reject`, { rejection_reason: reason, approved_by: approvedBy });
  return res.data;
}

export async function deleteDieselLog(id: string): Promise<void> {
  await api.delete(`/diesel-management/${id}`);
}

export async function fetchDieselAudit(logId: string): Promise<any[]> {
  const res = await api.get<{ data: any[] }>(`/diesel-management/${logId}/audit`);
  return res.data || [];
}
