"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  QrCode,
  Wrench,
  Package,
  FileBarChart,
  Settings,
  ChevronLeft,
  Menu,
  ClipboardList,
  Clock,
  FileText,
  Briefcase,
  UserCheck,
  FileSpreadsheet,
  MessageSquare,
  Home,
  BarChart3,
  CalendarClock,
  AlertTriangle,
  HardHat,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const roleNavItems: Record<UserRole, { label: string; items: NavItem[] }[]> = {
  admin: [
    {
      label: "Main",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Sites & Facilities", href: "/admin/sites", icon: Building2 },
        { label: "Inspections", href: "/admin/inspections", icon: ClipboardCheck },
        { label: "QR Codes", href: "/admin/qr-codes", icon: QrCode },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Work Orders", href: "/admin/work-orders", icon: Wrench },
        { label: "Assets", href: "/admin/assets", icon: Package },
        { label: "PM Schedule", href: "/admin/pm-schedule", icon: CalendarClock },
        { label: "Fault Reports", href: "/admin/fault-reports", icon: AlertTriangle },
        { label: "Inventory", href: "/admin/inventory", icon: ClipboardList },
        { label: "Contracts", href: "/admin/contracts", icon: FileText },
        { label: "Contractors", href: "/admin/contractors", icon: HardHat },
        { label: "Utilities", href: "/admin/utilities", icon: Zap },
      ],
    },
    {
      label: "Portals",
      items: [
        { label: "Stakeholders", href: "/admin/stakeholders", icon: Briefcase },
        { label: "Tenants", href: "/admin/tenants", icon: Home },
      ],
    },
    {
      label: "Analytics",
      items: [
        { label: "Reports", href: "/admin/reports", icon: FileBarChart },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ],
  manager: [
    {
      label: "Main",
      items: [
        { label: "Dashboard", href: "/manager", icon: LayoutDashboard },
        { label: "Facilities", href: "/manager/facilities", icon: Building2 },
        { label: "Reports", href: "/manager/reports", icon: FileBarChart },
      ],
    },
    {
      label: "Performance",
      items: [
        { label: "Analytics", href: "/manager/performance", icon: BarChart3 },
      ],
    },
  ],
  supervisor: [
    {
      label: "Main",
      items: [
        { label: "Dashboard", href: "/supervisor", icon: LayoutDashboard },
        { label: "Team", href: "/supervisor/team", icon: Users },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Tasks", href: "/supervisor/tasks", icon: ClipboardCheck },
        { label: "Inspections", href: "/supervisor/inspections", icon: ClipboardList },
        { label: "Attendance", href: "/supervisor/attendance", icon: Clock },
      ],
    },
  ],
  staff: [
    {
      label: "Main",
      items: [
        { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
      ],
    },
    {
      label: "Work",
      items: [
        { label: "Inspections", href: "/staff/inspections", icon: ClipboardCheck },
        { label: "Attendance", href: "/staff/attendance", icon: Clock },
        { label: "Work Orders", href: "/staff/work-orders", icon: Wrench },
        { label: "History", href: "/staff/history", icon: FileSpreadsheet },
      ],
    },
  ],
  stakeholder: [
    {
      label: "Main",
      items: [
        { label: "Dashboard", href: "/stakeholder", icon: LayoutDashboard },
        { label: "Reports", href: "/stakeholder/reports", icon: FileBarChart },
      ],
    },
    {
      label: "Info",
      items: [
        { label: "KPI", href: "/stakeholder/kpi", icon: BarChart3 },
        { label: "Documents", href: "/stakeholder/documents", icon: FileText },
      ],
    },
  ],
  tenant: [
    {
      label: "Main",
      items: [
        { label: "Dashboard", href: "/tenant", icon: LayoutDashboard },
        { label: "Requests", href: "/tenant/requests", icon: ClipboardCheck },
        { label: "Service History", href: "/tenant/history", icon: Clock },
        { label: "Documents", href: "/tenant/documents", icon: FileText },
      ],
    },
  ],
};

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const sections = roleNavItems[role];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#222222] bg-[#111111] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-[#222222] px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]">
              <Wrench className="h-4 w-4 text-black" />
            </div>
            <span className="text-sm font-bold text-white">FixFlow</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]">
              <Wrench className="h-4 w-4 text-black" />
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#7A7A7A] hover:text-white hover:bg-white/5"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#7A7A7A]">
                {section.label}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                          : "text-[#7A7A7A] hover:bg-white/5 hover:text-white",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-[#D4AF37]")} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#222222] p-3">
        {!collapsed && (
          <p className="text-xs text-[#7A7A7A] text-center">
            FixFlow CMMS v1.0
          </p>
        )}
      </div>
    </aside>
  );
}
