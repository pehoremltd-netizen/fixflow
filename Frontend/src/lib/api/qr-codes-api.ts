function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fixflow-token");
}

function getOrgId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fixflow-org-id");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) throw new Error("Unauthorized");
  if (res.status === 204) return {} as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export interface SiteQRCodeDTO {
  id: string;
  organization_id: string;
  site_id: string;
  site_name: string;
  location: string;
  qr_value: string;
  is_active: boolean;
  scans_today: number;
  created_at: string;
  updated_at: string;
}

export async function getSiteQRCodesApi(): Promise<SiteQRCodeDTO[]> {
  const orgId = getOrgId();
  if (!orgId) return [];
  const res = await apiFetch<{ data: SiteQRCodeDTO[] }>(`/api/qr-codes?organization_id=${orgId}`);
  return res.data;
}

export async function getSiteQRCodeApi(id: string): Promise<SiteQRCodeDTO> {
  const res = await apiFetch<{ data: SiteQRCodeDTO }>(`/api/qr-codes/${id}`);
  return res.data;
}

export async function createSiteQRApi(siteId: string, siteName: string, location: string): Promise<SiteQRCodeDTO> {
  const orgId = getOrgId();
  if (!orgId) throw new Error("No organization ID found");
  const res = await apiFetch<{ data: SiteQRCodeDTO }>("/api/qr-codes", {
    method: "POST",
    body: JSON.stringify({ organization_id: orgId, site_id: siteId, site_name: siteName, location }),
  });
  return res.data;
}

export async function toggleSiteQRApi(id: string): Promise<SiteQRCodeDTO> {
  const res = await apiFetch<{ data: SiteQRCodeDTO }>(`/api/qr-codes/${id}/toggle`, { method: "PATCH" });
  return res.data;
}

export async function regenerateSiteQRApi(id: string): Promise<SiteQRCodeDTO> {
  const res = await apiFetch<{ data: SiteQRCodeDTO }>(`/api/qr-codes/${id}/regenerate`, { method: "PATCH" });
  return res.data;
}

export async function deleteSiteQRApi(id: string): Promise<void> {
  await apiFetch(`/api/qr-codes/${id}`, { method: "DELETE" });
}

export async function recordQRScanApi(id: string): Promise<SiteQRCodeDTO> {
  const res = await apiFetch<{ data: SiteQRCodeDTO }>(`/api/qr-codes/${id}/scan`, { method: "POST" });
  return res.data;
}

export async function downloadQR(value: string, filename?: string): Promise<void> {
  const token = getToken();
  const res = await fetch("/api/qr-codes/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ value, filename }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to generate QR code" }));
    throw new Error(err.error || "Failed to generate QR code");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(filename || "qrcode").replace(/[^a-zA-Z0-9_-]/g, "-")}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
