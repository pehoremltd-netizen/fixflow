"use client";

import { api, getStoredOrgId } from "./client";

export interface Inspection {
  id: string;
  organization_id: string;
  site_id: string;
  staff_id: string;
  title: string;
  type: string;
  status: "draft" | "submitted" | "reviewed" | "approved";
  checklist?: InspectionChecklistItem[];
  photos?: string[];
  signature?: string;
  recommendations?: string;
  submitted_at?: string;
  created_at: string;
}

export interface InspectionChecklistItem {
  id: string;
  label: string;
  condition: "good" | "fair" | "poor" | "critical" | "na";
  notes?: string;
}

export async function getInspections() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: Inspection[] }>(`/inspections?organization_id=${orgId}`);
  return data.data;
}

export async function getInspection(id: string) {
  const data = await api.get<{ data: Inspection }>(`/inspections/${id}`);
  return data.data;
}

export async function createInspection(inspection: Partial<Inspection>) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: Inspection }>("/inspections", { ...inspection, organization_id: orgId });
  return data.data;
}

export async function updateInspection(id: string, inspection: Partial<Inspection>) {
  const data = await api.patch<{ data: Inspection }>(`/inspections/${id}`, inspection);
  return data.data;
}

export async function deleteInspection(id: string) {
  await api.delete(`/inspections/${id}`);
}

export interface InspectionTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  items: number;
  created_at: string;
}

export async function getInspectionTemplates() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: InspectionTemplate[] }>(`/inspections/templates/list?organization_id=${orgId}`);
  return data.data;
}

export async function createInspectionTemplate(body: {
  name: string;
  description?: string;
  checklist: string[];
}) {
  const orgId = getStoredOrgId();
  const data = await api.post<{ data: InspectionTemplate }>("/inspections/templates", { ...body, organization_id: orgId });
  return data.data;
}

export interface InspectionTemplateItem {
  id: string;
  template_id: string;
  label: string;
  order_index: number;
}

export interface InspectionTemplateDetail extends InspectionTemplate {
  checklist: InspectionTemplateItem[];
}

export async function getInspectionTemplate(id: string) {
  const data = await api.get<{ data: InspectionTemplateDetail }>(`/inspections/templates/${id}`);
  return data.data;
}

export async function updateInspectionTemplate(id: string, body: {
  name?: string;
  description?: string;
  checklist?: string[];
}) {
  const data = await api.patch<{ data: InspectionTemplateDetail }>(`/inspections/templates/${id}`, body);
  return data.data;
}

export async function deleteInspectionTemplate(id: string) {
  await api.delete(`/inspections/templates/${id}`);
}
