"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const VALID_ROLES: UserRole[] = ["admin", "manager", "supervisor", "staff", "stakeholder", "tenant"];

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const portalRole = (pathname.split("/")[1] as UserRole);
  const sidebarRole = VALID_ROLES.includes(portalRole) ? portalRole : user.role;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-page">
      {/* Backdrop overlay for mobile */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        role={sidebarRole}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className={cn("flex flex-1 flex-col transition-all duration-300", "lg:pl-64")}>
        <Header user={user} onMenuToggle={() => setMobileSidebarOpen((v) => !v)} />
        <main className="flex-1 p-4 lg:p-6 animate-in max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
