"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getLinkByToken, updateLastAccessed } from "@/lib/store/uplineManagerLinks";
import FeedbackButton from "@/components/feedback/FeedbackButton";
import {
  LayoutDashboard,
  FileBarChart,
  BarChart3,
  MessageSquare,
  ChevronLeft,
  Menu,
  User,
  Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/upline-manager", icon: LayoutDashboard },
  { label: "Reports", href: "/upline-manager/reports", icon: FileBarChart },
  { label: "Performance Trends", href: "/upline-manager/performance", icon: BarChart3 },
  { label: "Comments", href: "/upline-manager/comments", icon: MessageSquare },
];

const PAGE_LABELS: Record<string, string> = {
  "": "Overview",
  reports: "Reports",
  performance: "Performance Trends",
  comments: "Comments",
};

export default function UplineManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [viewer, setViewer] = useState<{ name: string; linkId: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      (async () => {
        const raw = sessionStorage.getItem("fixflow-upline-manager-session");
        if (raw) {
          const s = JSON.parse(raw);
          const link = await getLinkByToken(s.token);
          if (link && link.status === "active") {
            await updateLastAccessed(s.token);
            setViewer({ name: s.viewerName || "Viewer", linkId: s.token });
            setLoading(false);
            return;
          }
        }
        router.replace("/");
      })();
    } catch {}

    router.replace("/");
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading) return null;
  if (!viewer) return null;

  const pageLabel = PAGE_LABELS[pathname.split("/").pop() || ""] || "Upline Manager";

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link href="/upline-manager" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && <span className="text-sm font-bold text-foreground">Upline Manager</span>}
        </Link>
        <button
          className="h-8 w-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-accent hidden lg:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
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
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 px-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{viewer.name}</p>
              <p className="text-[10px] text-text-tertiary">Upline Manager</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-page">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      <aside
        className={cn(
          "hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:h-screen lg:flex-col lg:border-r lg:border-border lg:bg-sidebar transition-all duration-300",
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        {sidebarContent}
      </aside>

      <div className={cn("flex flex-1 flex-col transition-all duration-300", "lg:pl-64")}>
        <div className="sticky top-0 z-30 bg-primary/10 border-b border-primary/20 px-4 py-1.5 text-center text-xs text-primary font-medium">
          Viewing as {viewer.name} · Upline Manager
        </div>

        <header className="sticky top-[31px] z-30 flex h-14 items-center gap-4 border-b border-border bg-header-bg/95 backdrop-blur supports-[backdrop-filter]:bg-header-bg/60 px-4 lg:px-6">
          <button
            className="h-9 w-9 flex items-center justify-center rounded-lg text-text-tertiary hover:text-foreground hover:bg-accent lg:hidden shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{pageLabel}</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/50">
            <User className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="text-xs text-foreground font-medium">{viewer.name}</span>
            <span className="text-[10px] text-text-tertiary">· Upline Manager</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 animate-in max-w-7xl w-full mx-auto">
          {children}
        </main>

        <FeedbackButton pageLabel={pageLabel} />
      </div>
    </div>
  );
}
