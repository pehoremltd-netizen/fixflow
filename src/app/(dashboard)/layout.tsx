"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSession } from "@/lib/mock-auth";
import type { UserRole } from "@/types";

const VALID_ROLES: UserRole[] = ["admin", "manager", "supervisor", "staff", "stakeholder", "tenant"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string; full_name: string; role: UserRole } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    const portalRole = pathname.split("/")[1] as UserRole;
    const role = VALID_ROLES.includes(portalRole) ? portalRole : "admin";
    if (session) {
      setUser({ email: session.email, full_name: session.name, role });
    } else {
      setUser({ email: "", full_name: "", role });
    }
    setLoading(false);
  }, [pathname]);

  if (loading) return null;
  if (!user) return null;

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
