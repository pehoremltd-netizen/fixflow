import { api } from "./client";
import type { Artisan } from "@/types";

export async function fetchArtisans(): Promise<Artisan[]> {
  const res = await api.get<{ data: Artisan[] }>("/artisans");
  return res.data || [];
}

export async function fetchArtisan(id: string): Promise<Artisan | null> {
  try {
    const res = await api.get<{ data: Artisan }>(`/artisans/${id}`);
    return res.data;
  } catch { return null; }
}

export async function createArtisan(data: Partial<Artisan>): Promise<Artisan> {
  const res = await api.post<{ data: Artisan }>("/artisans", data);
  return res.data;
}

export async function updateArtisan(id: string, data: Partial<Artisan>): Promise<Artisan> {
  const res = await api.patch<{ data: Artisan }>(`/artisans/${id}`, data);
  return res.data;
}

export async function deleteArtisan(id: string): Promise<void> {
  await api.delete(`/artisans/${id}`);
}
