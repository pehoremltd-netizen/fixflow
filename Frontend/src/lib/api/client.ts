const API_BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fixflow-token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("fixflow-token", token);
    document.cookie = `fixflow-auth=${token}; path=/; max-age=86400; SameSite=Lax`;
  } else {
    localStorage.removeItem("fixflow-token");
    document.cookie = "fixflow-auth=; path=/; max-age=0";
  }
}

export function getStoredOrgId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fixflow-org-id") || "0538a722-bba0-4c7f-b470-37d91a8c1c31";
}

export function setStoredOrgId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem("fixflow-org-id", id);
  } else {
    localStorage.removeItem("fixflow-org-id");
  }
}

/* ─── Offline store helpers ─── */
import { stores, computeDashboardStats, getOrganizationId, type StoreName } from "@/lib/store/offline-store";

// Map API path prefixes to offline store collection names
const PATH_TO_STORE: Record<string, StoreName> = {
  "/assets": "assets",
  "/contractors": "contractors",
  "/contracts": "contracts",
  "/fault-reports": "faults",
  "/inspections": "inspections",
  "/inventory": "inventory",
  "/maintenance-requests": "maintenanceRequests",
  "/notifications": "notifications",
  "/pm-schedule": "pmSchedules",
  "/profiles": "profiles",
  "/sites": "sites",
  "/utilities": "utilities",
  "/work-orders": "workOrders",
};

function getStoreForPath(path: string): { store: (typeof stores)[StoreName]; name: StoreName } | null {
  const base = "/" + path.split("/").filter(Boolean)[0];
  const name = PATH_TO_STORE[base];
  if (!name) return null;
  return { store: stores[name], name };
}

function extractIdFromPath(path: string): string | null {
  // /work-orders/WO-001 or similar
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 2 && parts[1] && parts[1].length > 0 && !parts[1].startsWith("?")) {
    return parts[1];
  }
  return null;
}

/* ─── Core request with offline fallback ─── */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal });
    clearTimeout(timeout);

    // Auth error — clear token
    if (res.status === 401) {
      setToken(null);
      throw new Error("Unauthorized");
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  } catch (err) {
    // If offline or network error, fall back to localStorage store
    const storeInfo = getStoreForPath(path);
    if (storeInfo) {
      const method = (options.method || "GET").toUpperCase();
      const { store } = storeInfo;
      const id = extractIdFromPath(path);

      if (method === "GET") {
        if (id) {
          const item = store.getById(id);
          if (item) return { data: item } as T;
          throw new Error("Not found");
        }
        return { data: store.getAll() } as unknown as T;
      }

      if (method === "POST") {
        const body = options.body ? JSON.parse(options.body as string) : {};
        const created = store.create(body);
        return { data: created } as T;
      }

      if (method === "PATCH") {
        if (!id) throw new Error("Missing id for update");
        const body = options.body ? JSON.parse(options.body as string) : {};
        const updated = store.update(id, body);
        if (!updated) throw new Error("Not found");
        return { data: updated } as T;
      }

      if (method === "DELETE") {
        if (!id) throw new Error("Missing id for delete");
        store.delete(id);
        return { data: {} } as T;
      }
    }

    // Handle known paths with special responses
    if (path === "/dashboard/stats") {
      return { data: computeDashboardStats() } as T;
    }

    // Re-throw if we can't handle it
    throw err;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
