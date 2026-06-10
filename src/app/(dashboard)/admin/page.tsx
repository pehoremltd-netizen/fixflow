"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Users,
  Building2,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Brain,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  AlertCircle,
  Circle,
  BarChart3,
  Zap,
  Thermometer,
} from "lucide-react";
import Link from "next/link";
import { AIIntelligenceBadge } from "@/components/ai/ai-intelligence-badge";
import {
  mockAssetHealthData,
  mockFailurePredictions,
  mockPreventiveSuggestions,
  getRiskBadgeColor,
  getHealthColor,
  getHealthBg,
  getHealthBadgeVariant,
} from "@/lib/ai-intelligence";
import type { PreventiveSuggestion } from "@/lib/ai-intelligence";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";

const statusData = [
  { name: "Open", value: 18, fill: "#4A9EFF" },
  { name: "Assigned", value: 24, fill: "#A855F7" },
  { name: "In Progress", value: 31, fill: "#F97316" },
  { name: "Completed", value: 42, fill: "#22C55E" },
  { name: "Verified", value: 15, fill: "#D4AF37" },
];

const monthlyCostData = [
  { month: "Jan", cost: 2850000 },
  { month: "Feb", cost: 3120000 },
  { month: "Mar", cost: 2680000 },
  { month: "Apr", cost: 3450000 },
  { month: "May", cost: 2980000 },
  { month: "Jun", cost: 3720000 },
];

const stats = [
  { label: "Total Work Orders", value: "1,284", change: "+12%", trend: "up", icon: Wrench, color: "#4A9EFF" },
  { label: "PM Compliance Rate", value: "94%", change: "+5%", trend: "up", icon: CheckCircle2, color: "#D4AF37" },
  { label: "Avg Response Time", value: "1.2 hrs", change: "-8%", trend: "down", icon: Clock, color: "#F97316" },
  { label: "Open Faults", value: "23", change: "+3", trend: "up", icon: AlertTriangle, color: "#E05C5C" },
  { label: "Staff on Duty", value: "48", change: "+4", trend: "up", icon: Users, color: "#22C55E" },
  { label: "Asset Uptime", value: "99.9%", change: "+0.1%", trend: "up", icon: Activity, color: "#A855F7" },
];

const recentWorkOrders = [
  { id: "WO-001", title: "HVAC Maintenance - Building A", priority: "high", status: "in-progress", assigned: "Mike Chen" },
  { id: "WO-002", title: "Electrical Panel Inspection", priority: "critical", status: "pending", assigned: "Sarah Lee" },
  { id: "WO-003", title: "Plumbing Repair - 2nd Floor", priority: "medium", status: "completed", assigned: "John Doe" },
  { id: "WO-004", title: "Fire Safety Check - West Wing", priority: "high", status: "in-progress", assigned: "Emma Wilson" },
  { id: "WO-005", title: "Generator Maintenance", priority: "low", status: "pending", assigned: "Mike Chen" },
];

const upcomingInspections = [
  { type: "Electrical", site: "Building A", date: "Today, 2:00 PM", status: "scheduled" },
  { type: "Plumbing", site: "Building B", date: "Tomorrow, 9:00 AM", status: "scheduled" },
  { type: "Fire Safety", site: "West Wing", date: "Jun 10, 10:00 AM", status: "scheduled" },
  { type: "HVAC", site: "Building A", date: "Jun 12, 1:00 PM", status: "scheduled" },
];

const systemHealth = [
  { label: "Uptime", value: "99.9%", icon: CheckCircle2, color: "text-[#D4AF37]" },
  { label: "Active Users", value: "156", icon: Users, color: "text-[#D4AF37]" },
  { label: "Avg Response", value: "1.2m", icon: Clock, color: "text-[#E1B000]" },
  { label: "Completion Rate", value: "94%", icon: TrendingUp, color: "text-[#D4AF37]" },
];

interface MaintenanceItem {
  id: string;
  assetName: string;
  location: string;
  category: string;
  dueDate: string;
  priority: string;
  notes: string;
}

function getDaysRemaining(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diff = due.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function getHardcodedItems(): MaintenanceItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const raw = [
    { assetName: "Generator B2", location: "Lekki Site", category: "Generator", daysOffset: -2, priority: "Critical" },
    { assetName: "AC Unit Floor 3", location: "Victoria Island", category: "HVAC", daysOffset: 1, priority: "Critical" },
    { assetName: "Water Pump", location: "Ikeja GRA", category: "Water System", daysOffset: 3, priority: "High" },
    { assetName: "Fire Suppression System", location: "Abuja Plaza", category: "Fire Safety", daysOffset: 5, priority: "High" },
    { assetName: "Electrical Panel Inspection", location: "PH Hub", category: "Electrical", daysOffset: 7, priority: "Normal" },
    { assetName: "Lift/Elevator Service", location: "Lekki Site", category: "Lift", daysOffset: 10, priority: "Normal" },
    { assetName: "Plumbing Check", location: "Victoria Island", category: "Plumbing", daysOffset: 2, priority: "High" },
    { assetName: "Transformer Maintenance", location: "Ikeja GRA", category: "Electrical", daysOffset: 4, priority: "High" },
    { assetName: "Borehole Pump Service", location: "Abuja Plaza", category: "Water System", daysOffset: 6, priority: "Normal" },
    { assetName: "CCTV System Check", location: "PH Hub", category: "Electrical", daysOffset: 8, priority: "Low" },
    { assetName: "Roof Inspection", location: "Lekki Site", category: "Structural", daysOffset: 12, priority: "Low" },
    { assetName: "Water Treatment System", location: "Victoria Island", category: "Water System", daysOffset: 14, priority: "Normal" },
  ];
  return raw.map((item, i) => {
    const due = new Date(today);
    due.setDate(due.getDate() + item.daysOffset);
    return {
      id: `hc-${i}`,
      assetName: item.assetName,
      location: item.location,
      category: item.category,
      dueDate: due.toISOString().split("T")[0],
      priority: item.priority,
      notes: "",
    };
  });
}

const STORAGE_KEY = "fixflow-maintenance-schedules";

function sortByUrgency(items: MaintenanceItem[]): MaintenanceItem[] {
  return [...items].sort((a, b) => {
    const da = getDaysRemaining(a.dueDate);
    const db = getDaysRemaining(b.dueDate);
    if (da < 0 && db >= 0) return -1;
    if (db < 0 && da >= 0) return 1;
    return da - db;
  });
}

export default function AdminDashboard() {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    assetName: "",
    location: "",
    category: "",
    dueDate: "",
    priority: "",
    notes: "",
  });

  useEffect(() => {
    const hardcoded = getHardcodedItems();
    let saved: MaintenanceItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}
    setMaintenanceItems(sortByUrgency([...hardcoded, ...saved]));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function updateForm(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newItem: MaintenanceItem = {
      id: `usr-${Date.now()}`,
      assetName: formData.assetName,
      location: formData.location,
      category: formData.category,
      dueDate: formData.dueDate,
      priority: formData.priority,
      notes: formData.notes,
    };
    let saved: MaintenanceItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}
    saved.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    const hardcoded = getHardcodedItems();
    setMaintenanceItems(sortByUrgency([...hardcoded, ...saved]));
    setShowModal(false);
    setFormData({ assetName: "", location: "", category: "", dueDate: "", priority: "", notes: "" });
    setToast("Maintenance scheduled ✓");
  }

  function handleDelete(id: string) {
    setMaintenanceItems((prev) => prev.filter((item) => item.id !== id));
    if (!id.startsWith("hc-")) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        let saved: MaintenanceItem[] = [];
        if (raw) saved = JSON.parse(raw);
        saved = saved.filter((item) => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch {}
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-[#B8B8B8]">
            Welcome back, Alex. Here&apos;s your facility overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIIntelligenceBadge />
          <div className="flex items-center gap-2 text-sm text-[#7A7A7A]">
            <Activity className="h-4 w-4" />
            <span>Last updated: 2 min ago</span>
          </div>
        </div>
      </div>

      {/* Recommended Maintenance Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-[#222222] bg-[#161616]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <Wrench className="h-4 w-4 text-[#D4AF37]" />
                  Recommended Maintenance Tasks
                </CardTitle>
                <CardDescription className="text-[#B8B8B8]">AI-generated preventive suggestions</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] gap-1 border-[#D4AF37]/30 text-[#D4AF37]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
                </span>
                AI Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {mockPreventiveSuggestions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 p-3 rounded-lg border border-[#222222] hover:bg-white/5 transition-colors min-w-[280px] shrink-0"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                    s.priority === "high" ? "bg-[#EF4444]/10" :
                    s.priority === "medium" ? "bg-[#E1B000]/10" :
                    "bg-[#D4AF37]/10"
                  }`}>
                    {s.priority === "high" ? (
                      <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                    ) : (
                      <Wrench className={`h-4 w-4 ${s.priority === "medium" ? "text-[#E1B000]" : "text-[#D4AF37]"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{s.task}</p>
                      <Badge className={`text-[10px] ${getRiskBadgeColor(s.priority)}`}>{s.priority}</Badge>
                    </div>
                    <p className="text-xs text-[#7A7A7A]">{s.assetName}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#7A7A7A]">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{s.suggestedDate}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.downtimeImpact}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
          const trendColor = stat.trend === "up" ? "text-[#22C55E]" : "text-[#E05C5C]";
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-[#222222] bg-[#161616] overflow-hidden" style={{ borderLeftWidth: "3px", borderLeftColor: stat.color }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                      <Icon className="h-4 w-4" style={{ color: stat.color }} />
                    </div>
                    <div className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                      <TrendIcon className="h-3 w-3" />
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-[#B8B8B8] mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* AI Asset Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          {/* Section Header */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Maintenance Intelligence
                </h2>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Real-time asset health monitoring and predictive analysis
                </p>
              </div>
              <Badge variant="outline" className="gap-1.5 text-[11px] font-normal text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                Live
              </Badge>
            </div>
          </div>

          <div className="px-6 pb-5 space-y-5">
            {/* Asset Health Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
                  Asset Health Scores
                </span>
                <Link href="/admin/assets" className="text-[11px] font-medium text-primary hover:underline">
                  View all assets
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mockAssetHealthData.map((asset, i) => {
                  const TrendIcon = asset.trend === "improving" ? TrendingUp : asset.trend === "degrading" ? TrendingDown : Minus;
                  const trendTextColor = asset.trend === "improving" ? "text-green-600 dark:text-green-400" : asset.trend === "degrading" ? "text-red-600 dark:text-red-400" : "text-gray-400";
                  const scoreColor = asset.healthScore >= 80 ? "text-green-600 dark:text-green-400" : asset.healthScore >= 50 ? "text-amber-500 dark:text-amber-400" : "text-red-600 dark:text-red-400";
                  const barColor = asset.healthScore >= 80 ? "bg-green-500" : asset.healthScore >= 50 ? "bg-amber-500" : "bg-red-500";
                  return (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">{asset.assetName}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{asset.category}</p>
                        </div>
                        <Badge variant={getHealthBadgeVariant(asset.status)} className="ml-2 shrink-0 text-[10px] px-2 py-0 font-medium">
                          {asset.status === "healthy" ? "Healthy" : asset.status === "warning" ? "Warning" : "Critical"}
                        </Badge>
                      </div>

                      <div className="flex items-baseline gap-1 mb-2">
                        <span className={`text-[28px] font-normal tabular-nums leading-none ${scoreColor}`}>
                          {asset.healthScore}
                        </span>
                        <span className="text-[13px] text-gray-400 dark:text-gray-500 font-normal">/ 100</span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-3">
                        <TrendIcon className={`h-3.5 w-3.5 ${trendTextColor}`} />
                        <span className={`text-[11px] font-medium capitalize ${trendTextColor}`}>{asset.trend}</span>
                      </div>

                      <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                        <motion.div
                          className={`h-full rounded-full ${barColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${asset.healthScore}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 + i * 0.05 }}
                        />
                      </div>

                      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-normal">{asset.lastUpdated}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Predictive Failure Alerts */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
                  Predictive Failure Alerts
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  {mockFailurePredictions.filter(f => f.severity === "high" || f.severity === "medium").length} active
                </span>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 divide-y divide-gray-100 dark:divide-gray-700">
                {mockFailurePredictions.map((prediction, i) => {
                  const riskColor = prediction.riskScore >= 80 ? "bg-red-500" : prediction.riskScore >= 40 ? "bg-amber-500" : "bg-green-500";
                  const riskPillColor = prediction.riskScore >= 80 ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : prediction.riskScore >= 40 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
                  return (
                    <motion.div
                      key={prediction.assetId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-3"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">{prediction.assetName}</span>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 shrink-0">ETTF: {prediction.estimatedTimeToFailure}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{prediction.insight}</p>
                        </div>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${riskPillColor}`}>
                          {prediction.riskScore}%
                        </span>
                      </div>
                      <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${riskColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.riskScore}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#4A9EFF]" />
                Work Orders by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#7A7A7A", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7A7A7A", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#161616", border: "1px solid #222222", borderRadius: "8px" }}
                    labelStyle={{ color: "#B8B8B8", fontSize: "12px" }}
                    itemStyle={{ color: "#fff", fontSize: "12px" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
        >
          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-[#D4AF37]" />
                Monthly Maintenance Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyCostData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#7A7A7A", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#7A7A7A", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `NGN ${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#161616", border: "1px solid #222222", borderRadius: "8px" }}
                    labelStyle={{ color: "#B8B8B8", fontSize: "12px" }}
                    formatter={(value: number) => [`NGN ${value.toLocaleString()}`, "Cost"]}
                  />
                  <defs>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="cost" fill="url(#costGradient)" stroke="none" />
                  <Line type="monotone" dataKey="cost" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Maintenance Due Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <Card className="border-[#222222] bg-[#161616]">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-white">Maintenance Due</CardTitle>
              <CardDescription className="text-[#B8B8B8]">
                {maintenanceItems.filter(i => getDaysRemaining(i.dueDate) <= 7).length} items due within 7 days
              </CardDescription>
            </div>
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <Button
                onClick={() => setShowModal(true)}
                variant="outline"
                size="sm"
                className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Schedule Maintenance
              </Button>
              <DialogContent className="border-[#222222] bg-[#161616] text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Schedule Maintenance</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assetName" className="text-[#B8B8B8]">
                      Asset Name
                    </Label>
                    <Input
                      id="assetName"
                      value={formData.assetName}
                      onChange={(e) => updateForm("assetName", e.target.value)}
                      required
                      placeholder="e.g. Generator B2"
                      className="border-[#222222] bg-[#1a1a1a] text-white placeholder:text-[#7A7A7A]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-[#B8B8B8]">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateForm("location", e.target.value)}
                      required
                      placeholder="e.g. Lekki Site"
                      className="border-[#222222] bg-[#1a1a1a] text-white placeholder:text-[#7A7A7A]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-[#B8B8B8]">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => updateForm("category", v)}
                      required
                    >
                      <SelectTrigger className="border-[#222222] bg-[#1a1a1a] text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#1a1a1a] text-white">
                        <SelectItem value="Generator">Generator</SelectItem>
                        <SelectItem value="HVAC">HVAC</SelectItem>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Water System">Water System</SelectItem>
                        <SelectItem value="Structural">Structural</SelectItem>
                        <SelectItem value="Lift">Lift</SelectItem>
                        <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-[#B8B8B8]">
                      Due Date
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => updateForm("dueDate", e.target.value)}
                      required
                      min={todayStr}
                      className="border-[#222222] bg-[#1a1a1a] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-[#B8B8B8]">
                      Priority
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v) => updateForm("priority", v)}
                      required
                    >
                      <SelectTrigger className="border-[#222222] bg-[#1a1a1a] text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="border-[#222222] bg-[#1a1a1a] text-white">
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-[#B8B8B8]">
                      Notes
                    </Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => updateForm("notes", e.target.value)}
                      rows={3}
                      placeholder="Additional details..."
                      className="flex w-full rounded-lg border border-[#222222] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder:text-[#7A7A7A] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowModal(false)}
                      className="flex-1 text-[#B8B8B8] hover:text-white hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-medium"
                    >
                      Schedule
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            {maintenanceItems.length === 0 ? (
              <p className="text-sm text-[#7A7A7A] text-center py-8">
                No maintenance items. Click &quot;Schedule Maintenance&quot; to add one.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#222222]">
                      <th className="text-left px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7A7A7A]">Asset</th>
                      <th className="text-left px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7A7A7A]">Date</th>
                      <th className="text-left px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7A7A7A]">Due</th>
                      <th className="text-right px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7A7A7A]">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceItems.map((item, idx) => {
                      const daysRemaining = getDaysRemaining(item.dueDate);
                      const dotColor =
                        item.priority === "Critical" ? "bg-red-500" :
                        item.priority === "High" ? "bg-orange-500" :
                        item.priority === "Normal" ? "bg-[#D4AF37]" : "bg-[#7A7A7A]";
                      const dueIcon = daysRemaining <= 1
                        ? <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                        : <Clock className="h-3.5 w-3.5 text-[#7A7A7A]" />;
                      const dueText =
                        daysRemaining < 0
                          ? `${Math.abs(daysRemaining)}d overdue`
                          : `Due in ${daysRemaining}d`;
                      const dueTextColor =
                        daysRemaining <= 1 ? "text-red-500" :
                        daysRemaining <= 3 ? "text-orange-500" :
                        daysRemaining <= 7 ? "text-yellow-500" : "text-green-500";
                      const priorityPill =
                        item.priority === "Critical"
                          ? "bg-red-500/10 text-red-500"
                          : item.priority === "High"
                            ? "bg-orange-500/10 text-orange-500"
                            : item.priority === "Normal"
                              ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                              : "bg-[#7A7A7A]/10 text-[#7A7A7A]";
                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="border-b border-[#222222] last:border-0 hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Circle className={`h-2 w-2 fill-current ${dotColor} ${dotColor} shrink-0`} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{item.assetName}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[#222222] text-[#7A7A7A] font-normal">{item.category}</Badge>
                                  <span className="text-[11px] text-[#7A7A7A] flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {item.location}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="text-sm text-[#B8B8B8]">
                              {new Date(item.dueDate + "T00:00:00").toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className={`flex items-center gap-1.5 text-sm font-medium ${dueTextColor}`}>
                              {dueIcon}
                              <span>{dueText}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${priorityPill}`}>
                                {item.priority}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded-md text-[#7A7A7A] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Work Orders & Inspections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Work Orders</CardTitle>
                <CardDescription className="text-[#B8B8B8]">Latest maintenance tasks</CardDescription>
              </div>
              <Link href="/admin/work-orders" className="text-sm text-[#D4AF37] hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentWorkOrders.map((wo) => (
                  <div key={wo.id} className="flex items-center justify-between p-3 rounded-lg border border-[#222222] hover:bg-white/5 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#7A7A7A]">{wo.id}</span>
                        {wo.priority === "critical" && <AlertTriangle className="h-3 w-3 text-[#EF4444]" />}
                      </div>
                      <p className="text-sm font-medium text-white truncate">{wo.title}</p>
                      <p className="text-xs text-[#7A7A7A]">{wo.assigned}</p>
                    </div>
                    <Badge variant={wo.status === "completed" ? "success" : wo.status === "in-progress" ? "info" : wo.status === "pending" ? "warning" : "default"}>
                      {wo.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-[#222222] bg-[#161616]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Upcoming Inspections</CardTitle>
                <CardDescription className="text-[#B8B8B8]">Scheduled for this week</CardDescription>
              </div>
              <Link href="/admin/inspections" className="text-sm text-[#D4AF37] hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingInspections.map((inspection) => (
                  <div key={inspection.type + inspection.site} className="flex items-center justify-between p-3 rounded-lg border border-[#222222] hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                        <ClipboardCheck className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{inspection.type}</p>
                        <p className="text-xs text-[#7A7A7A]">{inspection.site}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#7A7A7A]">{inspection.date}</p>
                      <Badge variant="info" className="text-xs">{inspection.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-[#222222] bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-[#B8B8B8]">Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "New User", icon: Users, href: "/admin/users" },
                { label: "Add Site", icon: Building2, href: "/admin/sites" },
                { label: "Create WO", icon: Wrench, href: "/admin/work-orders" },
                { label: "Generate QR", icon: ClipboardCheck, href: "/admin/qr-codes" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href} className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#222222] p-4 hover:bg-white/5 hover:border-[#D4AF37]/30 transition-all group">
                    <Icon className="h-6 w-6 text-[#7A7A7A] group-hover:text-[#D4AF37] transition-colors" />
                    <span className="text-sm font-medium text-white">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-[#222222] bg-[#161616]">
          <CardHeader>
            <CardTitle className="text-white">System Overview</CardTitle>
            <CardDescription className="text-[#B8B8B8]">Platform health and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {systemHealth.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="text-center">
                    <Icon className={`h-6 w-6 ${item.color} mx-auto mb-2`} />
                    <p className="text-lg font-bold text-white">{item.value}</p>
                    <p className="text-xs text-[#7A7A7A]">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
