"use client";

import { setToken, setStoredOrgId } from "./client";

export async function login(email: string, password: string) {
  const e = email.trim().toLowerCase();

  // Authenticate against generated users in localStorage
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("fixflow-generated-users") : null;
    if (raw) {
      const users = JSON.parse(raw) as Record<string, { password: string; profile: any }>;
      const match = users[e];
      if (match && match.password === password) {
        const prof = match.profile;
        const h = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const p = btoa(JSON.stringify({ sub: prof.id, role: prof.role, email: prof.email }));
        const t = `${h}.${p}.sig`;
        setToken(t);
        setStoredOrgId(prof.organization_id || "");
        return prof;
      }
    }
  } catch { /* ignore */ }

  throw new Error("Invalid email or password");
}

export async function register(params: { email: string; password?: string; full_name: string; organization_id?: string; organization_name?: string; role?: string }): Promise<{ user: { email: string }; tempPassword: string; message: string }> {
  throw new Error("User registration is handled by the admin panel. Please contact your administrator.");
}

export async function logout() {
  setToken(null);
  setStoredOrgId(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("fixflow-session");
    localStorage.removeItem("fixflow-token");
  }
}

export async function getMe() {
  const token = typeof window !== "undefined" ? localStorage.getItem("fixflow-token") : null;
  if (!token) throw new Error("Not authenticated");
  try {
    const b64 = token.includes(".") ? token.split(".")[1] : token;
    const payload = JSON.parse(atob(b64));
    const profiles = (await import("@/lib/store/offline-store")).stores.profiles.getAll();
    const profile = profiles.find((p: any) => p.id === payload.sub);
    if (profile) {
      setStoredOrgId(profile.organization_id);
      return profile;
    }
  } catch {}
  throw new Error("Not authenticated");
}
