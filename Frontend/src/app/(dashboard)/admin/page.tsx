"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Wrench, CalendarClock, Clock, Zap, DollarSign, AlertTriangle, Fuel, Users,
} from "lucide-react";
import { getDashboardStats } from "@/lib/api/dashboard";
import { fetchDieselStats } from "@/lib/api/diesel-management";

const ICONS: Record<string, React.ElementType> = {
  Wrench, CalendarClock, Clock, Zap, DollarSign, AlertTriangle, Fuel, Users,
};

export default function AdminDashboard() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const stats = await getDashboardStats();

        const dieselStats = await fetchDieselStats({ period: "monthly" });

        setCards([
          {
            title: "Open Work Orders",
            value: stats.openWorkOrders.toString(),
            icon: "Wrench",
            color: "var(--color-info)",
            link: "/admin/work-orders",
            subtitle: `${stats.totalWorkOrders} total`,
          },
          {
            title: "Attendance Rate",
            value: `${stats.attendanceRate ?? 0}%`,
            icon: "Users",
            color: "var(--color-success)",
            link: "/admin/settings",
            subtitle: `${stats.activeStaff} active staff`,
          },
          {
            title: "Diesel Used (30d)",
            value: dieselStats ? `${(dieselStats.total_diesel_used || 0).toFixed(0)}L` : "No data",
            icon: "Fuel",
            color: "var(--color-primary)",
            link: "/admin/diesel-management",
            subtitle: dieselStats ? `${dieselStats.total_logs || 0} records` : "",
          },
          {
            title: "Overdue Tasks",
            value: stats.overdueTasks.toString(),
            icon: "AlertTriangle",
            color: stats.overdueTasks > 0 ? "var(--color-destructive)" : "var(--color-success)",
            link: "/admin/work-orders",
            subtitle: stats.overdueTasks > 0 ? "Requires attention" : "All caught up",
          },
          {
            title: "Pending Inspections",
            value: stats.pendingInspections.toString(),
            icon: "CalendarClock",
            color: "var(--color-warning)",
            link: "/admin/inspections",
            subtitle: `${stats.completedWorkOrders} completed WOs`,
          },
          {
            title: "Budget",
            value: "—",
            icon: "DollarSign",
            color: "var(--color-primary)",
            link: "/admin/budget",
            subtitle: `${stats.totalAssets} total assets`,
          },
        ]);
      } catch {
        setCards([
          { title: "Open Work Orders", value: "—", icon: "Wrench", color: "var(--color-info)", link: "/admin/work-orders" },
          { title: "Attendance Rate", value: "—", icon: "Users", color: "var(--color-success)", link: "/admin/settings" },
          { title: "Diesel Used", value: "—", icon: "Fuel", color: "var(--color-primary)", link: "/admin/diesel-management" },
          { title: "Overdue Tasks", value: "—", icon: "AlertTriangle", color: "var(--color-warning)", link: "/admin/work-orders" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-text-tertiary text-sm mt-1">Loading overview...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-border mb-3" />
              <div className="h-7 w-20 bg-border rounded mb-2" />
              <div className="h-4 w-32 bg-border rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-text-tertiary text-sm mt-1">Real-time facility overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = ICONS[card.icon] || Wrench;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={card.link}
                className="block bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${card.color}15` }}>
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-text-tertiary mt-1">{card.title}</p>
                {card.subtitle && (
                  <p className="text-xs text-text-muted mt-1.5">{card.subtitle}</p>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
