"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Wrench,
  CalendarClock,
  Clock,
  Zap,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { getWorkOrders } from "@/lib/store/workOrders";
import { getPMTasks } from "@/lib/store/pmSchedule";
import { loadBudgets } from "@/lib/budgetCalculator";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

function isThisWeek(iso: string) {
  if (!iso) return false;
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  return d >= start;
}

export default function AdminDashboard() {
  const [openWOCount, setOpenWOCount] = useState(0);
  const [pmDueCount, setPMDueCount] = useState(0);
  const [dieselLevel, setDieselLevel] = useState<number | null>(null);
  const [powerStatus, setPowerStatus] = useState<string>("");
  const [budgetPct, setBudgetPct] = useState(0);
  const [recentFaults, setRecentFaults] = useState<any[]>([]);

  useEffect(() => {
    const wos = getWorkOrders();
    setOpenWOCount(wos.filter((wo: any) => wo.status !== "completed" && wo.status !== "closed").length);

    const pm = getPMTasks();
    setPMDueCount(pm.filter((t: any) => isThisWeek(t.dueDate)).length);

    const utility = loadFromStorage<any>("fixflow-utility-data", null);
    if (utility) {
      setDieselLevel(utility.dieselLevel ?? null);
      setPowerStatus(utility.powerStatus ?? "");
    }

    const budgets = loadBudgets();
    const approved = budgets.filter((b: any) => b.status === "approved");
    if (approved.length > 0) {
      const totalBudgeted = approved.reduce((s: number, b: any) => s + b.grandTotal, 0);
      const totalSpent = approved.reduce((s: number, b: any) => s + (b.totalOpex + b.totalCapex), 0);
      setBudgetPct(totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0);
    }

    const faults = loadFromStorage<any[]>("fixflow-fault-reports", []);
    setRecentFaults(faults.slice(-3).reverse());
  }, []);

  const cards = [
    {
      title: "Open Work Orders",
      value: openWOCount.toString(),
      icon: Wrench,
      color: "var(--color-info)",
      link: "/admin/work-orders",
    },
    {
      title: "PM Due This Week",
      value: pmDueCount.toString(),
      icon: CalendarClock,
      color: "var(--color-primary)",
      link: "/admin/pm-schedule",
    },
    {
      title: "Utility Alert",
      value: dieselLevel !== null ? `${dieselLevel}% diesel` : powerStatus || "No data",
      icon: Zap,
      color: dieselLevel !== null && dieselLevel <= 25 ? "var(--color-destructive)" : "var(--color-warning)",
      link: "/admin/utilities",
    },
    {
      title: "Budget Utilisation",
      value: `${budgetPct}%`,
      icon: DollarSign,
      color: "var(--color-primary)",
      link: "/admin/budget",
    },
    {
      title: "Recent Fault Reports",
      value: "",
      icon: AlertTriangle,
      color: "var(--color-destructive)",
      link: "/admin/fault-reports",
      list: recentFaults.map((f: any) => f.title || f.equipment || f.description || "Fault").slice(0, 3),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-text-tertiary text-sm mt-1">Facility overview at a glance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card, i) => (
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
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-text-tertiary mt-1">{card.title}</p>
              {(card as any).list && (
                <ul className="mt-3 space-y-1">
                  {(card as any).list.map((item: string, idx: number) => (
                    <li key={idx} className="text-xs text-text-muted flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-text-muted" />
                      {item.length > 50 ? item.slice(0, 50) + "..." : item}
                    </li>
                  ))}
                </ul>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
