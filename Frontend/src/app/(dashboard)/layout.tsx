"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getMe } from "@/lib/api/auth";
import { getLinkByToken, updateLastAccessed } from "@/lib/store/uplineManagerLinks";
import type { UserRole } from "@/types";

const VALID_ROLES: UserRole[] = ["admin", "manager", "supervisor", "staff", "upline_manager", "tenant"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; full_name: string; role: UserRole } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1. Try API auth
      try {
        const apiUser = await getMe();
        if (apiUser && !cancelled) {
          const role = VALID_ROLES.includes(apiUser.role as UserRole)
            ? (apiUser.role as UserRole)
            : "admin";
          setUser({ email: apiUser.email, full_name: apiUser.full_name, role });
          setLoading(false);
          return;
        }
      } catch {}

      // 2. Try JWT token decode
      try {
        const raw = localStorage.getItem("fixflow-token");
        if (raw && !cancelled) {
          const b64 = raw.includes(".") ? raw.split(".")[1] : raw;
          const payload = JSON.parse(atob(b64));
          const role = payload.role && VALID_ROLES.includes(payload.role as UserRole)
            ? (payload.role as UserRole)
            : "admin";
          setUser({ email: payload.email || "", full_name: payload.full_name || "", role });
          setLoading(false);
          return;
        }
      } catch {}

      // 3. Try upline-manager session (no-login link)
      try {
        const sessionRaw = sessionStorage.getItem("fixflow-upline-manager-session");
        if (sessionRaw && !cancelled) {
          const session = JSON.parse(sessionRaw);
          const link = await getLinkByToken(session.token);
          if (link && link.status === "active") {
            // Upline manager sessions must NOT access admin pages — redirect away
            if (pathname.startsWith("/admin/") || pathname === "/admin") {
              if (!cancelled) {
                router.replace("/upline-manager");
              }
              setLoading(false);
              return;
            }
            await updateLastAccessed(session.token);
            setUser({
              email: session.viewerEmail || `${session.viewerName.toLowerCase()}@upline-manager`,
              full_name: session.viewerName,
              role: "upline_manager",
            });
            setLoading(false);
            return;
          }
        }
      } catch {}

      // 4. Fallback to portal role from URL
      if (!cancelled) {
        const portalRole = pathname.split("/")[1] as UserRole;
        setUser({ email: "", full_name: "", role: VALID_ROLES.includes(portalRole) ? portalRole : "admin" });
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (loading) return null;
  if (!user) return null;

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
