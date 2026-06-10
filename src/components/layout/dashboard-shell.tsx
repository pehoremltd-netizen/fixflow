"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import type { UserRole } from "@/types";

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
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <Header user={user} />
        <main className="flex-1 p-4 lg:p-6 animate-in max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
