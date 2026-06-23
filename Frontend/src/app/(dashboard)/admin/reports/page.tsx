"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getWorkOrders, type WorkOrder } from "@/lib/store/workOrders";
import { getPMTasks, type PMTask } from "@/lib/store/pmSchedule";
import { getFaultReports as getMockFaultReports, type FaultReport } from "@/lib/store/faultReports";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Wrench,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Target,
  Printer,
  FileText,
  CalendarRange,
  ClipboardList,
  MessageSquare,
  ListTodo,
  Building2,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback;
}

interface AttRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
  hoursWorked: number | null;
}

interface AssetRecord {
  id: string;
  name: string;
  category: string;
  status: string;
  condition: string;
  location: string;
  purchaseDate: string;
  warrantyExpiry: string;
  lastService: string;
}

interface UtilityRecord {
  id: string;
  category: string;
  cost: number;
  month: string;
  year: number;
  site: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthLabel(d: Date): string {
  return MONTHS[d.getMonth()];
}

function getMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-success" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

const COLORS = {
  gold: "var(--color-primary)",
  goldLight: "var(--color-mustard)",
  green: "var(--color-success)",
  blue: "var(--color-info)",
  red: "#E05C5C",
  orange: "var(--color-warning)",
  purple: "#A855F7",
};

const DEPT_COLORS = ["var(--color-info)", "var(--color-success)", "var(--color-primary)", "#A855F7", "var(--color-warning)"];

const CONDITION_COLORS: Record<string, string> = {
  Excellent: "var(--color-success)",
  Good: "var(--color-info)",
  Fair: "var(--color-primary)",
  Poor: "var(--color-warning)",
  Critical: "#E05C5C",
};

export default function ReportsPage() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const [weekStart, setWeekStart] = useState(monday.toISOString().split("T")[0]);
  const [summary, setSummary] = useState("");
  const [pendingIssues, setPendingIssues] = useState("");
  const [loading, setLoading] = useState(true);

  const [totalWO, setTotalWO] = useState(0);
  const [pmRate, setPmRate] = useState(0);
  const [openFaultsCount, setOpenFaultsCount] = useState(0);
  const [assetUptime, setAssetUptime] = useState(0);
  const [staffProd, setStaffProd] = useState(0);
  const [budgetUtil, setBudgetUtil] = useState(0);

  const [complianceData, setComplianceData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; workOrders: number; inspections: number; completed: number; overdue: number }[]>([]);
  const [topPerformers, setTopPerformers] = useState<{ name: string; role: string; completed: number; rating: number }[]>([]);

  const [perfCards, setPerfCards] = useState<{ label: string; value: string; icon: any; color: string }[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; scheduled: number; emergency: number }[]>([]);

  const [assetStatsData, setAssetStatsData] = useState([
    { label: "Total Assets", value: "0", change: "—", icon: Wrench },
    { label: "Assets in Service", value: "0", change: "—", icon: CheckCircle2 },
    { label: "Assets Under Repair", value: "0", change: "—", icon: AlertTriangle },
  ]);
  const [assetLifecycleData, setAssetLifecycleData] = useState<{ age: string; count: number }[]>([]);
  const [assetConditionData, setAssetConditionData] = useState<{ name: string; value: number; color: string }[]>([]);

  type ViewMode = "weekly" | "monthly" | "custom";
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [staffStatCards, setStaffStatCards] = useState([
    { label: "Total Staff", value: "0", icon: Users, color: "text-primary" },
    { label: "On Duty", value: "0", icon: CheckCircle2, color: "text-success" },
    { label: "On Leave", value: "0", icon: Clock, color: "text-primary" },
    { label: "Offline", value: "0", icon: AlertTriangle, color: "text-destructive" },
  ]);
  const [staffPerfData, setStaffPerfData] = useState<{ dept: string; productivity: number }[]>([]);

  useEffect(() => {
    const orders = getWorkOrders();
    const pmTasks = getPMTasks();
    const faults = getMockFaultReports();
    const assets = loadFromStorage<AssetRecord[]>("fixflow-assets", []);
    const utilities = loadFromStorage<UtilityRecord[]>("fixflow-utilities", []);
    const maintSchedules = loadFromStorage<any[]>("fixflow-maintenance-schedules", []);

    const completedWOs = orders.filter((o) => o.status === "COMPLETED" || o.status === "VERIFIED");
    const totalCost = orders.reduce((s, o) => s + (o.actualCost ?? o.estimatedCost ?? 0), 0);
    const completedCost = completedWOs.reduce((s, o) => s + (o.actualCost ?? o.estimatedCost ?? 0), 0);

    setTotalWO(orders.length);
    setPmRate(pmTasks.length > 0 ? Math.round((pmTasks.filter((t) => t.status === "Completed").length / pmTasks.length) * 100) : 0);
    setOpenFaultsCount(faults.filter((f) => f.status !== "RESOLVED").length);
    setAssetUptime(assets.length > 0 ? Math.round(((assets.length - assets.filter((a) => a.condition === "Critical").length) / assets.length) * 100) : 0);
    setStaffProd(92);
    setBudgetUtil(orders.length > 0 ? Math.round(((totalCost > 0 ? completedCost / totalCost : 0)) * 100) : 62);

    const pmCompleted = pmTasks.filter((t) => t.status === "Completed").length;
    const faultsResolved = faults.filter((f) => f.status === "RESOLVED").length;
    const pmInspect = pmTasks.filter((t) => t.task.toLowerCase().includes("inspect")).length;
    const faultsCritical = faults.filter((f) => f.priority === "critical").length;
    const totalRatio = pmTasks.length + faultsResolved + pmInspect + faultsCritical || 1;

    setComplianceData([
      { name: "Preventive", value: Math.round((pmTasks.length / totalRatio) * 100), color: COLORS.gold },
      { name: "Corrective", value: Math.round((faultsResolved / totalRatio) * 100), color: COLORS.red },
      { name: "Inspection", value: Math.round((pmInspect / totalRatio) * 100), color: COLORS.blue },
      { name: "Emergency", value: Math.round((faultsCritical / totalRatio) * 100), color: COLORS.orange },
    ]);

    const now = new Date();
    const last6Months: { month: string; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({ month: getMonthLabel(d), key: getMonthKey(d) });
    }

    const monthly = last6Months.map((m) => {
      const monthOrders = orders.filter((o) => getMonthKey(new Date(o.createdAt)) === m.key);
      const monthPMs = pmTasks.filter((t) => getMonthKey(new Date(t.lastDone || t.nextDue)) === m.key);
      const monthFaults = faults.filter((f) => getMonthKey(new Date(f.reportedAt)) === m.key);
      const overdueOrders = monthOrders.filter((o) => o.dueDate && new Date(o.dueDate) < now && o.status !== "COMPLETED" && o.status !== "VERIFIED");

      return {
        month: m.month,
        workOrders: monthOrders.length,
        inspections: monthPMs.length + monthFaults.length,
        completed: monthOrders.filter((o) => o.status === "COMPLETED" || o.status === "VERIFIED").length,
        overdue: overdueOrders.length + pmTasks.filter((t) => t.status === "Overdue" && getMonthKey(new Date(t.nextDue)) === m.key).length,
      };
    });

    setMonthlyData(monthly);

    const assigneeCount = new Map<string, number>();
    for (const o of completedWOs) {
      const name = o.assignedStaff || "Staff";
      assigneeCount.set(name, (assigneeCount.get(name) || 0) + 1);
    }
    const sorted = [...assigneeCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const roles = ["HVAC Tech", "Electrician", "Fire Safety", "Plumber"];
    const top4 = sorted.length > 0
      ? sorted.map(([name, count], i) => ({
          name,
          role: roles[i] || roles[0],
          completed: count,
          rating: completedWOs.length > 0 ? Math.round((count / completedWOs.length) * 100) : 90 + i,
        }))
      : [
          { name: "Mike Chen", role: "HVAC Tech", completed: completedWOs.length > 0 ? Math.round(completedWOs.length * 0.35) : 0, rating: 0 },
          { name: "Sarah Lee", role: "Electrician", completed: completedWOs.length > 0 ? Math.round(completedWOs.length * 0.25) : 0, rating: 0 },
          { name: "Emma Wilson", role: "Fire Safety", completed: completedWOs.length > 0 ? Math.round(completedWOs.length * 0.2) : 0, rating: 0 },
          { name: "John Doe", role: "Plumber", completed: completedWOs.length > 0 ? Math.round(completedWOs.length * 0.15) : 0, rating: 0 },
        ];

    const maxRating = Math.max(...top4.map((p) => p.completed), 1);
    setTopPerformers(top4.map((p) => ({ ...p, rating: Math.round((p.completed / maxRating) * 100) })));

    const overdueItems = orders.filter((o) => o.dueDate && new Date(o.dueDate) < now && o.status !== "COMPLETED" && o.status !== "VERIFIED").length;
    const avgCost = completedWOs.length > 0 ? Math.round(completedCost / completedWOs.length) : 0;
    setPerfCards([
      { label: "Avg. Resolution Time", value: "—", icon: Clock, color: "text-primary" },
      { label: "First-Time Fix Rate", value: "—", icon: CheckCircle2, color: "text-success" },
      { label: "Overdue Tasks", value: String(overdueItems), icon: AlertTriangle, color: overdueItems > 0 ? "text-destructive" : "text-success" },
      { label: "Cost per Work Order", value: completedWOs.length > 0 ? `$${avgCost.toLocaleString()}` : "—", icon: DollarSign, color: "text-mustard" },
    ]);

    const catMap = new Map<string, { scheduled: number; emergency: number }>();
    for (const o of orders) {
      const cat = o.category || o.location || "General";
      if (!catMap.has(cat)) catMap.set(cat, { scheduled: 0, emergency: 0 });
      const entry = catMap.get(cat)!;
      if (o.priority === "critical") {
        entry.emergency++;
      } else {
        entry.scheduled++;
      }
    }
    setCategoryData(
      catMap.size > 0
        ? [...catMap.entries()].map(([category, v]) => ({ category: category.charAt(0).toUpperCase() + category.slice(1), ...v }))
        : []
    );

    if (assets.length > 0) {
      const total = assets.length;
      const inService = assets.filter((a) => a.status === "Active" || a.status === "Operational").length;
      const underRepair = assets.filter((a) => a.status === "Maintenance" || a.status === "Under Repair" || a.condition === "Critical").length;
      setAssetStatsData([
        { label: "Total Assets", value: total.toLocaleString(), change: `${assets.filter((a) => new Date(a.purchaseDate) > new Date(Date.now() - 30 * 86400000)).length} new this month`, icon: Wrench },
        { label: "Assets in Service", value: inService.toLocaleString(), change: `${total > 0 ? Math.round((inService / total) * 100) : 0}% uptime`, icon: CheckCircle2 },
        { label: "Assets Under Repair", value: underRepair.toLocaleString(), change: `${total > 0 ? Math.round((underRepair / total) * 100) : 0}% of fleet`, icon: AlertTriangle },
      ]);

      const condMap = new Map<string, number>();
      for (const a of assets) {
        const c = a.condition || "Good";
        condMap.set(c, (condMap.get(c) || 0) + 1);
      }
      const conditionNames = ["Excellent", "Good", "Fair", "Poor", "Critical"];
      const condArr = conditionNames
        .filter((n) => condMap.has(n))
        .map((n) => ({ name: n, value: condMap.get(n)!, color: CONDITION_COLORS[n] || COLORS.gold }));
      setAssetConditionData(condArr.length > 0 ? condArr : []);

      const nowYear = now.getFullYear();
      const ageRanges = [
        { label: "0-2 yrs", min: 0, max: 2 },
        { label: "2-5 yrs", min: 2, max: 5 },
        { label: "5-10 yrs", min: 5, max: 10 },
        { label: "10+ yrs", min: 10, max: Infinity },
      ];
      setAssetLifecycleData(
        ageRanges.map((r) => ({
          age: r.label,
          count: assets.filter((a) => {
            const purchaseYear = a.purchaseDate ? new Date(a.purchaseDate).getFullYear() : nowYear;
            const age = nowYear - purchaseYear;
            return age >= r.min && age < r.max;
          }).length,
        }))
      );

      if (condArr.length > 0) {
        setComplianceData((prev) => prev);
      }
    } else {
      setAssetLifecycleData([]);
    }

    const totalStaff = 8;
    const online = Math.round(totalStaff * 0.75);
    const leave = Math.round(totalStaff * 0.17);
    const offline = totalStaff - online - leave;

    setStaffStatCards([
      { label: "Total Staff", value: String(totalStaff), icon: Users, color: "text-primary" },
      { label: "On Duty", value: String(online), icon: CheckCircle2, color: "text-success" },
      { label: "On Leave", value: String(leave), icon: Clock, color: "text-primary" },
      { label: "Offline", value: String(offline), icon: AlertTriangle, color: "text-destructive" },
    ]);

    const depts = ["HVAC", "Electrical", "Plumbing", "Fire Safety", "Structural"];
    setStaffPerfData(
      depts.map((dept) => ({
        dept,
        productivity: Math.round(80 + Math.random() * 18),
      }))
    );

    setLoading(false);
  }, []);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().split("T")[0];
  }, [weekStart]);

  const weekData = useMemo(() => {
    const allWOs = getWorkOrders();
    const allPMs = getPMTasks();
    const allFaults = getMockFaultReports();

    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    end.setHours(23, 59, 59, 999);

    const completedWOs = allWOs.filter((wo) => {
      if (wo.status !== "COMPLETED" && wo.status !== "VERIFIED") return false;
      const ts = new Date(wo.updatedAt);
      return ts >= start && ts <= end;
    });

    const completedPMs = allPMs.filter((pm) => {
      if (pm.status !== "Completed") return false;
      const ts = new Date(pm.lastDone);
      return ts >= start && ts <= end;
    });

    const resolvedFaults = allFaults.filter((f) => {
      if (f.status !== "RESOLVED") return false;
      const ts = new Date(f.resolvedAt ?? f.reportedAt);
      return ts >= start && ts <= end;
    });

    const totalCost = completedWOs.reduce((sum, wo) => sum + (wo.actualCost ?? wo.estimatedCost ?? 0), 0);
    const pendingWOs = allWOs.filter((wo) => wo.status !== "COMPLETED" && wo.status !== "VERIFIED");

    return { completedWOs, completedPMs, resolvedFaults, totalCost, pendingWOs };
  }, [weekStart, weekEnd]);

  const handlePrint = () => {
    window.print();
  };

  const metrics = [
    { label: "Total Work Orders", value: String(totalWO), change: `${pmRate}% PM Compliance`, trend: totalWO > 10 ? "up" : "neutral" as const },
    { label: "PM Compliance Rate", value: `${pmRate}%`, change: `${completedWOsFromMemo()} completed`, trend: pmRate >= 70 ? "up" as const : "down" as const },
    { label: "Open Faults", value: String(openFaultsCount), change: assetUptime > 0 ? `${assetUptime}% Asset Uptime` : "—", trend: openFaultsCount > 5 ? "down" as const : "up" as const },
    { label: "Asset Uptime", value: `${assetUptime}%`, change: `${staffProd}% Staff Prod`, trend: assetUptime >= 90 ? "up" as const : "down" as const },
    { label: "Staff Productivity", value: `${staffProd}%`, change: `${budgetUtil}% Budget Used`, trend: staffProd >= 85 ? "up" as const : "down" as const },
    { label: "Budget Utilization", value: `$${(totalWO > 0 ? (totalWO * 245) : 48200).toLocaleString()}`, change: `${budgetUtil}% utilized`, trend: budgetUtil > 70 ? "neutral" as const : "up" as const },
  ];

  function completedWOsFromMemo() {
    return getWorkOrders().filter((o) => o.status === "COMPLETED" || o.status === "VERIFIED").length;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Calculating report data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#E1B000] bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">Company-wide performance metrics and insights</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-secondary border border-border rounded-lg p-0.5">
          {(["weekly", "monthly", "custom"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                viewMode === mode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "custom" ? "Custom Range" : mode}
            </button>
          ))}
        </div>
        {viewMode === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-8 w-[140px] bg-secondary border-border text-xs"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-8 w-[140px] bg-secondary border-border text-xs"
            />
          </div>
        )}
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border bg-card hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                    {metric.label}
                  </p>
                  <TrendIcon trend={metric.trend} />
                </div>
                <p className="text-lg font-bold text-foreground">{metric.value}</p>
                <Badge
                  variant={
                    metric.trend === "up" ? "success" :
                    metric.trend === "down" ? "warning" : "secondary"
                  }
                  className="text-[10px] px-1.5 py-0 mt-1"
                >
                  {metric.change}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Performance</TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Assets</TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Staff</TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Weekly Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border bg-card lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Maintenance Ratio
                </CardTitle>
                <CardDescription className="text-xs">Preventive vs Corrective</CardDescription>
              </CardHeader>
              <CardContent>
                {complianceData.length > 0 ? (
                  <>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={complianceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                          >
                            {complianceData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2">
                      {complianceData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground">
                            {item.name}: <span className="text-foreground font-medium">{item.value}%</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    No chart data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Monthly Performance Trends
                </CardTitle>
                <CardDescription className="text-xs">Work orders and inspections over time</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                        <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "11px", color: "var(--color-muted-foreground)" }} />
                        <Line
                          type="monotone"
                          dataKey="workOrders"
                          stroke="var(--color-primary)"
                          strokeWidth={2}
                          dot={{ fill: "var(--color-primary)", strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: "var(--color-primary)" }}
                          name="Work Orders"
                        />
                        <Line
                          type="monotone"
                          dataKey="inspections"
                          stroke="var(--color-info)"
                          strokeWidth={2}
                          dot={{ fill: "var(--color-info)", strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: "var(--color-info)" }}
                          name="Inspections"
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="var(--color-success)"
                          strokeWidth={2}
                          dot={{ fill: "var(--color-success)", strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: "var(--color-success)" }}
                          name="Completed"
                        />
                        <Line
                          type="monotone"
                          dataKey="overdue"
                          stroke="var(--color-destructive)"
                          strokeWidth={2}
                          dot={{ fill: "var(--color-destructive)", strokeWidth: 2, r: 3 }}
                          activeDot={{ r: 5, fill: "var(--color-destructive)" }}
                          name="Overdue"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                    No chart data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Top Performing Staff
              </CardTitle>
              <CardDescription className="text-xs">Highest completion rates this quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {topPerformers.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/20 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-success">{p.completed} tasks</span>
                        <span className="text-xs text-primary">{p.rating}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {perfCards.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-border bg-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background/30">
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold text-foreground">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Work Orders by Category
              </CardTitle>
              <CardDescription className="text-xs">Scheduled vs emergency breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="category" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                      <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "var(--color-muted-foreground)" }} />
                      <Bar dataKey="scheduled" fill={COLORS.gold} radius={[4, 4, 0, 0]} name="Scheduled" />
                      <Bar dataKey="emergency" fill={COLORS.goldLight} radius={[4, 4, 0, 0]} name="Emergency" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {assetStatsData.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="p-2 rounded-lg bg-background/30 w-fit mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-xs text-primary mt-1">{item.change}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">Asset Condition Distribution</CardTitle>
                <CardDescription className="text-xs">Current health of all assets</CardDescription>
              </CardHeader>
              <CardContent>
                {assetConditionData.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetConditionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {assetConditionData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {assetConditionData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-muted-foreground">
                            {item.name}: <span className="text-foreground font-medium">{item.value}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    No asset condition data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">Asset Lifecycle Distribution</CardTitle>
                <CardDescription className="text-xs">Age and condition analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {assetLifecycleData.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assetLifecycleData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="age" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                        <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill={COLORS.gold} radius={[4, 4, 0, 0]} name="Assets" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    No chart data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {staffStatCards.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-border bg-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background/30">
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold text-foreground">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Staff Performance by Department</CardTitle>
              <CardDescription className="text-xs">Productivity ratings across teams</CardDescription>
            </CardHeader>
            <CardContent>
              {staffPerfData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={staffPerfData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="dept" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                      <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "var(--color-muted-foreground)" }} />
                      <Bar dataKey="productivity" radius={[4, 4, 0, 0]} name="Productivity %">
                        {staffPerfData.map((entry, index) => (
                          <Cell key={`p-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6 print:space-y-4">
          <div className="print:hidden">
            <p className="text-sm text-secondary-foreground mb-4">
              Build a formatted weekly maintenance report. Data auto-populates from completed work orders, PM tasks, and resolved faults.
            </p>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-primary" />
                    Report Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label className="text-xs text-muted-foreground">Week Starting</Label>
                  <Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className="mt-1 border-border bg-background text-foreground" />
                  <p className="text-xs text-muted-foreground mt-2">Week: {weekStart} — {weekEnd}</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Summary of Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    placeholder="Write a brief summary of this week's maintenance activities…"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-primary" />
                    Pending / Outstanding Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    placeholder="List any pending or outstanding issues that need attention…"
                    value={pendingIssues}
                    onChange={(e) => setPendingIssues(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50"
                  />
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Costs This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground font-mono">${weekData.totalCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across {weekData.completedWOs.length} completed work order{weekData.completedWOs.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{weekData.completedPMs.length} PM task{weekData.completedPMs.length !== 1 ? "s" : ""} completed</span>
                    <span>{weekData.resolvedFaults.length} fault{weekData.resolvedFaults.length !== 1 ? "s" : ""} resolved</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Export to PDF / Print
              </Button>
            </div>
          </div>

          <div id="weekly-report-preview" className="bg-white text-black rounded-lg p-8 print:p-0 print:rounded-none shadow-xl print:shadow-none">
            <div className="text-center mb-6 print:mb-4">
              <h1 className="text-2xl font-bold text-primary print:text-black">Weekly Maintenance Report</h1>
              <p className="text-sm text-muted-foreground print:text-gray-600">{weekStart} — {weekEnd}</p>
            </div>

            <div className="border-t border-b border-gray-300 py-4 mb-6 print:mb-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary || "No summary provided."}</p>
            </div>

            <div className="mb-6 print:mb-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary print:text-black" />
                Completed Work Orders
              </h2>
              {weekData.completedWOs.length === 0 ? (
                <p className="text-sm text-muted-foreground">None completed this week.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 font-medium text-gray-600">ID</th>
                      <th className="text-left py-2 font-medium text-gray-600">Title</th>
                      <th className="text-left py-2 font-medium text-gray-600">Staff</th>
                      <th className="text-right py-2 font-medium text-gray-600">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekData.completedWOs.map((wo) => (
                      <tr key={wo.id} className="border-b border-gray-200">
                        <td className="py-1.5 font-mono text-xs text-muted-foreground">{wo.id}</td>
                        <td className="py-1.5">{wo.title}</td>
                        <td className="py-1.5">{wo.assignedStaff}</td>
                        <td className="py-1.5 text-right font-mono">
                          ${(wo.actualCost ?? wo.estimatedCost ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td colSpan={3} className="py-2 text-right">Total</td>
                      <td className="py-2 text-right font-mono">${weekData.totalCost.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            <div className="mb-6 print:mb-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary print:text-black" />
                Preventive Maintenance Completed
              </h2>
              {weekData.completedPMs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No PM tasks completed this week.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 font-medium text-gray-600">Task</th>
                      <th className="text-left py-2 font-medium text-gray-600">Asset</th>
                      <th className="text-left py-2 font-medium text-gray-600">Staff</th>
                      <th className="text-left py-2 font-medium text-gray-600">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekData.completedPMs.map((pm) => (
                      <tr key={pm.id} className="border-b border-gray-200">
                        <td className="py-1.5">{pm.task}</td>
                        <td className="py-1.5">{pm.asset}</td>
                        <td className="py-1.5">{pm.responsible}</td>
                        <td className="py-1.5">{pm.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mb-6 print:mb-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary print:text-black" />
                Fault Reports Resolved
              </h2>
              {weekData.resolvedFaults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No faults resolved this week.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 font-medium text-gray-600">ID</th>
                      <th className="text-left py-2 font-medium text-gray-600">Description</th>
                      <th className="text-left py-2 font-medium text-gray-600">Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekData.resolvedFaults.map((f) => (
                      <tr key={f.id} className="border-b border-gray-200">
                        <td className="py-1.5 font-mono text-xs text-muted-foreground">{f.id}</td>
                        <td className="py-1.5">{f.description}</td>
                        <td className="py-1.5">{f.resolution ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mb-6 print:mb-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary print:text-black" />
                Pending / Outstanding
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{pendingIssues || "None noted."}</p>

              {weekData.pendingWOs.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-600 mb-1">Open Work Orders ({weekData.pendingWOs.length}):</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {weekData.pendingWOs.map((wo) => (
                      <li key={wo.id}>{wo.id} — {wo.title} ({wo.status.replace("_", " ")})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-300 print:mt-4">
              Report generated by FixFlow CMMS on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
