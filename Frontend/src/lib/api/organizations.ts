"use client";

import { api } from "./client";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
}

export async function getOrganizations() {
  const data = await api.get<{ data: Organization[] }>("/organizations");
  return data.data;
}

export async function getOrganization(id: string) {
  const data = await api.get<{ data: Organization }>(`/organizations/${id}`);
  return data.data;
}
