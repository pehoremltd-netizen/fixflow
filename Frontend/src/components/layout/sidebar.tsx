"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
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
  ShoppingCart,
  UserPlus,
  Eye,
  DollarSign,
  Calculator,
  Maximize,
  Fuel,
} from "lucide-react";
import Image from "next/image";
import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";
import { BRAND } from "@/lib/brand";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const roleNavItems: Record<UserRole, { label: string; items: NavItem[] }[]> = {
  admin: [
    {
      label: "",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Sites & Facilities", href: "/admin/sites", icon: Building2 },
        { label: "Pending Tasks", href: "/admin/pending-tasks", icon: ClipboardList },

        { label: "Inspections", href: "/admin/inspections", icon: ClipboardCheck },
        { label: "Facility Activities", href: "/admin/facility-activities", icon: ClipboardList },
        { label: "Work Orders", href: "/admin/work-orders", icon: Wrench },
        { label: "PM Schedule", href: "/admin/pm-schedule", icon: CalendarClock },
        { label: "Fault Reports", href: "/admin/fault-reports", icon: AlertTriangle },
        { label: "Diesel Management", href: "/admin/diesel-management", icon: Fuel },
      ],
    },
    {
      label: "Finance",
      items: [
        { label: "Utilities", href: "/admin/utilities", icon: Zap },
        { label: "Budget", href: "/admin/budget", icon: DollarSign },
        { label: "Inventory", href: "/admin/inventory", icon: ClipboardList },
        { label: "Artisan Record", href: "/admin/artisans", icon: Users },
        { label: "FM Calculator", href: "/admin/fm-calculator", icon: Calculator },
      ],
    },
    {
      label: "Analytics",
      items: [
        { label: "Weekly Reports", href: "/admin/weekly-reports", icon: FileBarChart },
        { label: "Reports", href: "/admin/reports", icon: FileBarChart },
      ],
    },
    {
      label: "System",
      items: [
        { label: "Upline Manager Access", href: "/admin/upline-manager-access", icon: Users },
        { label: "Upline Manager Comments", href: "/admin/feedback", icon: MessageSquare },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ],
  manager: [
    {
      label: "",
      items: [
        { label: "Dashboard", href: "/manager", icon: LayoutDashboard },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Inspections", href: "/manager/inspections", icon: ClipboardCheck },
        { label: "Work Orders", href: "/manager/work-orders", icon: Wrench },
        { label: "PM Schedule", href: "/manager/pm-schedule", icon: CalendarClock },
        { label: "Facilities", href: "/manager/facilities", icon: Building2 },
      ],
    },
    {
      label: "Analytics",
      items: [
        { label: "Reports", href: "/manager/reports", icon: FileBarChart },
      ],
    },
  ],
  supervisor: [
    {
      label: "",
      items: [
        { label: "Dashboard", href: "/supervisor", icon: LayoutDashboard },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Inspections", href: "/supervisor/inspections", icon: ClipboardList },
        { label: "Team", href: "/supervisor/team", icon: Users },
        { label: "Tasks", href: "/supervisor/tasks", icon: ClipboardCheck },
      ],
    },
  ],
  staff: [
    {
      label: "",
      items: [
        { label: "Dashboard", href: "/staff", icon: LayoutDashboard },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Inspections", href: "/staff/inspections", icon: ClipboardCheck },
        { label: "Work Orders", href: "/staff/work-orders", icon: Wrench },
        { label: "History", href: "/staff/history", icon: FileSpreadsheet },
      ],
    },
  ],
  upline_manager: [
    {
      label: "",
      items: [
        { label: "Dashboard", href: "/upline-manager", icon: LayoutDashboard },
      ],
    },
  ],
  tenant: [
    {
      label: "",
      items: [
        { label: "Dashboard", href: "/tenant", icon: LayoutDashboard },
      ],
    },
    {
      label: "Requests & Inspections",
      items: [
        { label: "Inspections", href: "/tenant/inspections", icon: ClipboardCheck },
        { label: "Requests", href: "/tenant/requests", icon: ClipboardCheck },
      ],
    },
    {
      label: "Info",
      items: [
        { label: "Service History", href: "/tenant/history", icon: Clock },
        { label: "Documents", href: "/tenant/documents", icon: FileText },
      ],
    },
  ],
};

interface SidebarProps {
  role: UserRole;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = memo(function Sidebar({ role, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const sections = roleNavItems[role];

  function handleNavClick() {
    if (onMobileClose) onMobileClose();
  }

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/fixflow-logo.png"
            alt={BRAND.appName}
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="text-sm font-bold text-foreground">{BRAND.appName}</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-tertiary hover:text-foreground hover:bg-accent hidden lg:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && section.label && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
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
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-text-tertiary hover:bg-accent hover:text-foreground",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3 hidden lg:block">
        <p className="text-xs text-text-tertiary text-center">
          FixFlow CMMS v1.0
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:h-screen lg:flex-col lg:border-r lg:border-border lg:bg-sidebar transition-all duration-300",
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/fixflow-logo.png"
                alt={BRAND.appName}
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-sm font-bold text-foreground">{BRAND.appName}</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto">
              <Image
                src="/fixflow-logo.png"
                alt={BRAND.appName}
                width={28}
                height={28}
                className="rounded-lg"
              />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-tertiary hover:text-foreground hover:bg-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-4">
          {sections.map((section) => (
            <div key={section.label}>
              {!collapsed && section.label && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
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
                            ? "bg-primary/10 text-primary"
                            : "text-text-tertiary hover:bg-accent hover:text-foreground",
                          collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          {!collapsed && (
            <p className="text-xs text-text-tertiary text-center">
              {BRAND.sidebarVersion}
            </p>
          )}
        </div>
      </aside>
    </>
  );
});
