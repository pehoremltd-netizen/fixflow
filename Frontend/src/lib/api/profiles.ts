"use client";

import { api, getStoredOrgId } from "./client";

export interface Profile {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export async function getProfiles() {
  const orgId = getStoredOrgId();
  const data = await api.get<{ data: Profile[] }>(`/profiles?organization_id=${orgId}`);
  return data.data;
}

export async function getProfile(id: string) {
  const data = await api.get<{ data: Profile }>(`/profiles/${id}`);
  return data.data;
}

export async function updateProfile(id: string, profile: Partial<Profile>) {
  const data = await api.patch<{ data: Profile }>(`/profiles/${id}`, profile);
  return data.data;
}
