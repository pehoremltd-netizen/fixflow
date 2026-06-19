"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Wrench, AlertTriangle, CheckCircle2, Clock,
  MapPin, User, Calendar, ChevronRight, X, Eye, Edit3,
  Filter, Download, ArrowUpDown, ArrowRight, CheckCheck,
  Trash2, DollarSign, ListChecks, Building2, Layers, BarChart3,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  getWorkOrders, createWorkOrder, updateStatus, deleteWorkOrder,
  getNextStatus, WorkOrder, WorkOrderStatus, WorkOrderPriority,
  WorkOrderCategory, CostCode, costCodeLabels, statusFlow,
} from "@/lib/store/workOrders";
import { getStaffList } from "@/lib/store/attendance";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: "Open",        color: "var(--color-info)", bg: "#4A9EFF15" },
  ASSIGNED:    { label: "Assigned",    color: "#A855F7", bg: "#A855F715" },
  IN_PROGRESS: { label: "In Progress", color: "var(--color-primary)", bg: "#D4AF3715" },
  COMPLETED:   { label: "Completed",   color: "var(--color-success)", bg: "#22C55E15" },
  VERIFIED:    { label: "Verified",    color: "var(--color-success)", bg: "#16A34A15" },
};

const PRIORITY_CONFIG: Record<WorkOrderPriority, { label: string; color: string; bg: string }> = {
  low:      { label: "Low",      color: "var(--color-muted-foreground)", bg: "#7A7A7A15" },
  medium:   { label: "Medium",   color: "var(--color-primary)", bg: "#D4AF3715" },
  high:     { label: "High",     color: "var(--color-warning)", bg: "#F9731615" },
  critical: { label: "Critical", color: "var(--color-destructive)", bg: "#EF444415" },
};

const CATEGORY_LABELS: Record<WorkOrderCategory, string> = {
  mechanical: "Mechanical",
  electrical: "Electrical",
  plumbing:   "Plumbing",
  hvac:       "HVAC",
  safety:     "Safety",
  structural: "Structural",
};

const CATEGORY_ORDER: WorkOrderCategory[] = ["electrical", "plumbing", "hvac", "mechanical", "structural", "safety"];
const STATUS_ORDER: WorkOrderStatus[] = ["OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "VERIFIED"];

const CATEGORY_COLORS: Record<WorkOrderCategory, string> = {
  hvac: "var(--color-mustard)",
  safety: "var(--color-destructive)",
  electrical: "var(--color-info)",
  plumbing: "var(--color-info)",
  mechanical: "var(--color-warning)",
  structural: "var(--color-muted-foreground)",
};

const PIE_COLORS = ["var(--color-info)", "var(--color-warning)", "var(--color-primary)", "var(--color-success)", "var(--color-destructive)"];

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(wo: WorkOrder) {
  if (wo.status === "COMPLETED" || wo.status === "VERIFIED") return false;
  return new Date(wo.dueDate) < new Date();
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSite, setFilterSite] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const PAGE_SIZE = 12;

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSite, setFormSite] = useState("");
  const [formCategory, setFormCategory] = useState<WorkOrderCategory>("hvac");
  const [formPriority, setFormPriority] = useState<WorkOrderPriority>("medium");
  const [formAssigned, setFormAssigned] = useState("");
  const [formDueDate, setFormDueDate] = useState("");

  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshData = useCallback(() => {
    setWorkOrders(getWorkOrders());
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);
  useEffect(() => { setPage(0); }, [search, filterStatus, filterCategory, filterSite, filterPriority, filterDateFrom, filterDateTo]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const analytics = useMemo(() => {
    const thisMonthWOs = workOrders.filter((wo) => {
      const d = new Date(wo.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const lastMonthWOs = workOrders.filter((wo) => {
      const d = new Date(wo.createdAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });
    const openCount = workOrders.filter((wo) => wo.status === "OPEN" || wo.status === "ASSIGNED" || wo.status === "IN_PROGRESS").length;
    const completedThisMonth = thisMonthWOs.filter((wo) => wo.status === "COMPLETED" || wo.status === "VERIFIED").length;
    const overdueCount = workOrders.filter(isOverdue).length;
    const trend = thisMonthWOs.length - lastMonthWOs.length;

    const statusData = STATUS_ORDER
      .map((s) => ({
        name: STATUS_CONFIG[s].label,
        value: workOrders.filter((wo) => wo.status === s).length,
        color: PIE_COLORS[STATUS_ORDER.indexOf(s)],
      }))
      .filter((d) => d.value > 0);
    const overdueVal = overdueCount;
    if (overdueVal > 0) {
      statusData.push({ name: "Overdue", value: overdueVal, color: "var(--color-destructive)" });
    }

    const catCounts: Record<string, number> = {};
    workOrders.forEach((wo) => {
      catCounts[wo.category] = (catCounts[wo.category] || 0) + 1;
    });
    const categoryData = CATEGORY_ORDER
      .map((c) => ({ name: CATEGORY_LABELS[c], value: catCounts[c] || 0, key: c }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);

    const sites = [...new Set(workOrders.map((wo) => wo.location).filter(Boolean))].sort();
    const categories = [...new Set(workOrders.map((wo) => wo.category))].sort();

    return { thisMonthWOs, lastMonthWOs, openCount, completedThisMonth, overdueCount, trend, statusData, categoryData, sites, categories };
  }, [workOrders]);

  const filtered = useMemo(() => {
    return workOrders.filter((wo) => {
      if (filterStatus !== "all" && wo.status !== filterStatus) return false;
      if (filterCategory !== "all" && wo.category !== filterCategory) return false;
      if (filterSite !== "all" && wo.location !== filterSite) return false;
      if (filterPriority !== "all" && wo.priority !== filterPriority) return false;
      if (filterDateFrom && wo.dueDate < filterDateFrom) return false;
      if (filterDateTo && wo.dueDate > filterDateTo) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!wo.id.toLowerCase().includes(q) &&
            !wo.title.toLowerCase().includes(q) &&
            !wo.assignedStaff.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [workOrders, search, filterStatus, filterCategory, filterSite, filterPriority, filterDateFrom, filterDateTo]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const staffList = getStaffList();

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formSite.trim() || !formDueDate) {
      showToast("Title, Site, and Due Date are required", "error");
      return;
    }
    createWorkOrder({
      title: formTitle, description: formDescription, location: formSite,
      category: formCategory, priority: formPriority,
      assignedStaff: formAssigned || "Unassigned", dueDate: formDueDate,
      costCode: "labour",
    });
    refreshData();
    setCreateOpen(false);
    setFormTitle(""); setFormDescription(""); setFormSite("");
    setFormCategory("hvac"); setFormPriority("medium");
    setFormAssigned(""); setFormDueDate("");
    showToast("Work order created successfully", "success");
  }

  function handleStatusUpdate(id: string) {
    const wo = workOrders.find((w) => w.id === id);
    if (!wo) return;
    const next = getNextStatus(wo.status);
    if (next) {
      updateStatus(id, next);
      refreshData();
      setSelectedWO(getWorkOrders().find((w) => w.id === id) || null);
      showToast(`Moved to ${next.replace("_", " ")}`, "success");
    }
  }

  function handleDelete(id: string) {
    deleteWorkOrder(id);
    refreshData();
    setDetailOpen(false);
    setSelectedWO(null);
    setDeleteConfirm(null);
    showToast("Work order deleted", "success");
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card-alt border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
          <p className="text-foreground font-medium mb-1">{payload[0].name}</p>
          <p style={{ color: payload[0].color }}>{payload[0].value} work orders</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium ${
            toast.type === "success" ? "bg-success/10 border-success/30 text-success" :
            toast.type === "error" ? "bg-destructive/10 border-destructive/30 text-destructive" :
            "bg-primary/10 border-primary/30 text-primary"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : toast.type === "error" ? <AlertTriangle size={16} /> : <Clock size={16} />}
          {toast.message}
        </motion.div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Work Orders</h1>
          <p className="text-text-tertiary text-sm mt-1">Create, assign, and track maintenance work orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 px-4 rounded-lg bg-card-alt border border-border text-foreground text-sm hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Filter size={14} /> Filters
          </button>
          <button
            className="h-10 px-4 rounded-lg bg-card-alt border border-border text-foreground text-sm hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={14} /> New Work Order
          </button>
        </div>
      </div>

      {/* ═══ ANALYTICS STAT CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total (This Month)", value: analytics.thisMonthWOs.length, color: "var(--color-primary)", trend: analytics.trend },
          { label: "Open / In Progress", value: analytics.openCount, color: "var(--color-info)" },
          { label: "Completed This Month", value: analytics.completedThisMonth, color: "var(--color-success)" },
          { label: "Overdue", value: analytics.overdueCount, color: analytics.overdueCount > 0 ? "var(--color-destructive)" : "var(--color-muted-foreground)", alert: analytics.overdueCount > 0 },
        ].map((card, i) => (
          <motion.div
            key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-text-tertiary">{card.label}</p>
              {"trend" in card && card.trend !== 0 && (
                <span className={`text-[10px] font-medium flex items-center gap-0.5 ${card.trend! > 0 ? "text-success" : "text-destructive"}`}>
                  {card.trend! > 0 ? "↑" : "↓"} {Math.abs(card.trend!)}
                </span>
              )}
            </div>
            <p className={`text-2xl font-bold ${(card as any).alert ? "text-destructive" : ""}`} style={{ color: (card as any).alert ? undefined : card.color }}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ═══ CHARTS ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Work Orders by Status</h3>
          {analytics.statusData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                      dataKey="value" stroke="none"
                    >
                      {analytics.statusData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-foreground">{workOrders.length}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {analytics.statusData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[11px] text-text-tertiary">{entry.name}</span>
                    <span className="text-[11px] font-medium text-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No chart data available
            </div>
          )}
        </motion.div>

        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Work Orders by Category</h3>
          {analytics.categoryData.length > 0 ? (
            <>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categoryData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {analytics.categoryData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={CATEGORY_COLORS[entry.key as WorkOrderCategory]}
                          opacity={hoveredBar === null || hoveredBar === idx ? 1 : 0.4}
                          stroke={hoveredBar === idx ? "var(--color-foreground)" : "transparent"}
                          strokeWidth={hoveredBar === idx ? 1.5 : 0}
                          onMouseEnter={() => setHoveredBar(idx)}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {analytics.categoryData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.key as WorkOrderCategory] }} />
                    <span className="text-[11px] text-text-tertiary">{entry.name}</span>
                    <span className="text-[11px] font-medium text-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No chart data available
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══ FILTER BAR ═══ */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 p-4 bg-card-alt rounded-xl border border-border">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto h-9 px-3 rounded-lg bg-card border border-border text-foreground text-xs outline-none focus:border-primary/50"
              >
                <option value="all">All Statuses</option>
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto h-9 px-3 rounded-lg bg-card border border-border text-foreground text-xs outline-none focus:border-primary/50"
              >
                <option value="all">All Categories</option>
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              <select value={filterSite} onChange={(e) => setFilterSite(e.target.value)}
                className="w-full sm:w-auto h-9 px-3 rounded-lg bg-card border border-border text-foreground text-xs outline-none focus:border-primary/50"
              >
                <option value="all">All Sites</option>
                {analytics.sites.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full sm:w-auto h-9 px-3 rounded-lg bg-card border border-border text-foreground text-xs outline-none focus:border-primary/50"
              >
                <option value="all">All Priorities</option>
                {(["low", "medium", "high", "critical"] as WorkOrderPriority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="flex-1 sm:flex-none h-9 px-3 rounded-lg bg-card border border-border text-foreground text-xs outline-none focus:border-primary/50"
                  title="From date"
                />
                <span className="text-text-muted text-xs shrink-0">to</span>
                <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
                  className="flex-1 sm:flex-none h-9 px-3 rounded-lg bg-card border border-border text-foreground text-xs outline-none focus:border-primary/50"
                  title="To date"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SEARCH + TABLE ═══ */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by WO number, title, or assignee..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-muted outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="text-center py-16">
            <Wrench size={40} className="mx-auto text-text-tertiary mb-3" />
            <p className="text-foreground font-medium">No work orders found</p>
            <p className="text-text-tertiary text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* ── mobile cards ── */}
            <div className="block sm:hidden divide-y divide-border">
              {paged.map((wo) => {
                const overdue = isOverdue(wo);
                const statusCfg = STATUS_CONFIG[wo.status];
                const priorityCfg = PRIORITY_CONFIG[wo.priority];
                return (
                  <div
                    key={wo.id}
                    className={`p-4 cursor-pointer transition-colors ${overdue ? "bg-destructive/[0.03]" : "hover:bg-foreground/[0.02]"}`}
                    onClick={() => { setSelectedWO(wo); setDetailOpen(true); }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-[10px] font-mono text-text-muted">{wo.id}</p>
                        <p className="text-sm font-medium text-foreground truncate">{wo.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {overdue && <AlertTriangle size={12} className="text-destructive" />}
                        <button onClick={(e) => { e.stopPropagation(); setSelectedWO(wo); setDetailOpen(true); }}
                          className="h-7 w-7 rounded flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-foreground/5 transition-colors">
                          <Eye size={12} />
                        </button>
                        {getNextStatus(wo.status) && (
                          <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(wo.id); }}
                            className="h-7 w-7 rounded flex items-center justify-center text-text-tertiary hover:text-success hover:bg-success/10 transition-colors">
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                        style={{ background: statusCfg.bg, color: statusCfg.color, borderColor: `${statusCfg.color}30` }}
                      >
                        {statusCfg.label}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                        style={{ background: priorityCfg.bg, color: priorityCfg.color, borderColor: `${priorityCfg.color}30` }}
                      >
                        {priorityCfg.label}
                      </span>
                      <span className="text-[10px] text-text-tertiary">{CATEGORY_LABELS[wo.category]}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1"><MapPin size={10} />{wo.location.length > 18 ? wo.location.slice(0, 18) + "…" : wo.location}</span>
                      <span className="flex items-center gap-1"><User size={10} />{wo.assignedStaff}</span>
                      <span className={`flex items-center gap-1 ${overdue ? "text-destructive font-medium" : ""}`}>
                        <Calendar size={10} />{formatDate(wo.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── desktop table ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card-alt">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">WO #</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Category</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Site</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Assigned To</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Priority</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Created</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Due Date</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((wo) => {
                    const overdue = isOverdue(wo);
                    const statusCfg = STATUS_CONFIG[wo.status];
                    const priorityCfg = PRIORITY_CONFIG[wo.priority];
                    return (
                      <tr key={wo.id}
                        className={`transition-colors cursor-pointer ${overdue ? "bg-destructive/[0.03]" : "hover:bg-foreground/[0.02]"}`}
                        onClick={() => { setSelectedWO(wo); setDetailOpen(true); }}
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-text-muted">{wo.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-foreground font-medium truncate max-w-[180px]">{wo.title}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-tertiary">{CATEGORY_LABELS[wo.category]}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-tertiary flex items-center gap-1">
                            <MapPin size={10} /> {wo.location.length > 20 ? wo.location.slice(0, 20) + "..." : wo.location}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-tertiary flex items-center gap-1">
                            <User size={10} /> {wo.assignedStaff}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border`}
                            style={{ background: priorityCfg.bg, color: priorityCfg.color, borderColor: `${priorityCfg.color}30` }}
                          >
                            {priorityCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border`}
                              style={{ background: statusCfg.bg, color: statusCfg.color, borderColor: `${statusCfg.color}30` }}
                            >
                              {statusCfg.label}
                            </span>
                            {overdue && (
                              <AlertTriangle size={10} className="text-destructive" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-tertiary">{formatDate(wo.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs ${overdue ? "text-destructive font-medium" : "text-text-tertiary"}`}>
                            {formatDate(wo.dueDate)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedWO(wo); setDetailOpen(true); }}
                              className="h-7 w-7 rounded flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-foreground/5 transition-colors">
                              <Eye size={12} />
                            </button>
                            {getNextStatus(wo.status) && (
                              <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(wo.id); }}
                                className="h-7 w-7 rounded flex items-center justify-center text-text-tertiary hover:text-success hover:bg-success/10 transition-colors">
                                <ArrowRight size={12} />
                              </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(wo.id); }}
                              className="h-7 w-7 rounded flex items-center justify-center text-text-tertiary hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border">
              <p className="text-xs text-text-tertiary">
                <span className="hidden sm:inline">Showing </span>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}
                <span className="hidden sm:inline"> of {filtered.length}</span>
              </p>
              <div className="flex gap-1">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                  className="h-8 px-2 sm:px-3 rounded-lg bg-card-alt border border-border text-xs text-foreground disabled:opacity-30 hover:bg-accent transition-colors">
                  ← Prev
                </button>
                {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 2, pageCount - 5));
                  const idx = start + i;
                  if (idx >= pageCount) return null;
                  return (
                    <button key={idx} onClick={() => setPage(idx)}
                      className={`hidden sm:inline-flex h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                        page === idx ? "bg-primary text-primary-foreground" : "bg-card-alt border border-border text-foreground hover:bg-accent"
                      }`}>
                      {idx + 1}
                    </button>
                  );
                })}
                <button onClick={() => setPage(Math.min(pageCount - 1, page + 1))} disabled={page >= pageCount - 1}
                  className="h-8 px-2 sm:px-3 rounded-lg bg-card-alt border border-border text-xs text-foreground disabled:opacity-30 hover:bg-accent transition-colors">
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ NEW WORK ORDER FORM DRAWER ═══ */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-background/60 overflow-y-auto"
            onClick={() => setCreateOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-card rounded-2xl border border-border p-4 sm:p-6 mt-4 sm:mt-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">New Work Order</h2>
                  <p className="text-sm text-text-tertiary mt-0.5">Create a new maintenance work order</p>
                </div>
                <button onClick={() => setCreateOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-foreground/5 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1.5">WO Title *</label>
                  <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. HVAC Compressor Replacement"
                    className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50 placeholder:text-text-muted"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Category</label>
                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as WorkOrderCategory)}
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    >
                      {CATEGORY_ORDER.map((c) => (
                        <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Site *</label>
                    <input type="text" value={formSite} onChange={(e) => setFormSite(e.target.value)}
                      placeholder="e.g. Building A - Floor 2"
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50 placeholder:text-text-muted"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Priority</label>
                    <select value={formPriority} onChange={(e) => setFormPriority(e.target.value as WorkOrderPriority)}
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    >
                      {(["low", "medium", "high", "critical"] as WorkOrderPriority[]).map((p) => (
                        <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Assigned To</label>
                    <select value={formAssigned} onChange={(e) => setFormAssigned(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    >
                      <option value="">Select staff...</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1.5">Description / Scope of Work</label>
                  <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
                    rows={3} placeholder="Describe the work required..."
                    className="w-full px-3 py-2 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50 placeholder:text-text-muted resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Due Date *</label>
                    <input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="flex items-end">
                    <button type="button"
                      className="h-10 w-full px-3 rounded-lg bg-card-alt border border-border text-text-tertiary text-sm hover:text-foreground transition-colors flex items-center gap-2 justify-center"
                    >
                      <Layers size={14} /> Attach Parts
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={() => setCreateOpen(false)}
                    className="flex-1 h-10 rounded-lg bg-muted text-foreground text-sm hover:bg-accent transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                    Create Work Order
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ DETAIL DRAWER ═══ */}
      <AnimatePresence>
        {detailOpen && selectedWO && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-end bg-background/60"
            onClick={() => { setDetailOpen(false); setDeleteConfirm(null); }}
          >
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-xl h-full bg-card border-l border-border overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <h2 className="text-sm sm:text-lg font-semibold text-foreground truncate">{selectedWO.title}</h2>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0`}
                    style={{ background: `${STATUS_CONFIG[selectedWO.status].bg}`, color: STATUS_CONFIG[selectedWO.status].color, borderColor: `${STATUS_CONFIG[selectedWO.status].color}30` }}
                  >
                    {STATUS_CONFIG[selectedWO.status].label}
                  </span>
                </div>
                <button onClick={() => setDetailOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0">
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">WO Number</p>
                    <p className="text-sm text-foreground font-mono">{selectedWO.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">Category</p>
                    <p className="text-sm text-foreground">{CATEGORY_LABELS[selectedWO.category]}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">Site</p>
                    <p className="text-sm text-foreground flex items-center gap-1"><MapPin size={12} className="text-primary" />{selectedWO.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">Priority</p>
                    <p className="text-sm font-medium" style={{ color: PRIORITY_CONFIG[selectedWO.priority].color }}>{PRIORITY_CONFIG[selectedWO.priority].label}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">Assigned To</p>
                    <p className="text-sm text-foreground flex items-center gap-1"><User size={12} className="text-primary" />{selectedWO.assignedStaff}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">Due Date</p>
                    <p className={`text-sm flex items-center gap-1 ${isOverdue(selectedWO) ? "text-destructive" : "text-foreground"}`}>
                      <Calendar size={12} className="text-primary" />{formatDate(selectedWO.dueDate)}
                    </p>
                  </div>
                </div>

                {selectedWO.description && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium mb-1">Description</p>
                    <p className="text-sm text-text-secondary bg-card-alt rounded-lg p-3 border border-border">{selectedWO.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium mb-2 flex items-center gap-1"><DollarSign size={12} className="text-primary" />Cost</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedWO.estimatedCost != null && (
                      <div className="bg-card-alt rounded-lg p-3 border border-border">
                        <p className="text-[10px] text-text-tertiary">Estimated</p>
                        <p className="text-sm font-bold text-foreground">${selectedWO.estimatedCost.toLocaleString()}</p>
                      </div>
                    )}
                    {selectedWO.actualCost != null && (
                      <div className="bg-card-alt rounded-lg p-3 border border-border">
                        <p className="text-[10px] text-text-tertiary">Actual</p>
                        <p className="text-sm font-bold" style={{ color: selectedWO.actualCost <= (selectedWO.estimatedCost ?? Infinity) ? "var(--color-success)" : "var(--color-warning)" }}>
                          ${selectedWO.actualCost.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div className="bg-card-alt rounded-lg p-3 border border-border">
                      <p className="text-[10px] text-text-tertiary">Code</p>
                      <p className="text-sm font-bold text-primary">{costCodeLabels[selectedWO.costCode]}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium mb-3 flex items-center gap-1"><ListChecks size={12} />Status History</p>
                  <div className="space-y-0">
                    {selectedWO.statusHistory.map((entry, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full border-2 flex-shrink-0 ${
                            idx === selectedWO.statusHistory.length - 1
                              ? "bg-primary border-primary"
                              : "bg-card border-text-muted"
                          }`} />
                          {idx < selectedWO.statusHistory.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border min-h-[24px]" />
                          )}
                        </div>
                        <div className={`${idx === selectedWO.statusHistory.length - 1 ? "pb-0" : "pb-4"}`}>
                          <p className={`text-sm font-medium ${idx === selectedWO.statusHistory.length - 1 ? "text-primary" : "text-foreground"}`}>
                            {entry.status.replace("_", " ")}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {new Date(entry.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} by {entry.changedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-border">
                  <div className="flex flex-wrap items-center gap-2">
                    {getNextStatus(selectedWO.status) && (
                      <button onClick={() => handleStatusUpdate(selectedWO.id)}
                        className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <ArrowRight size={14} /> Move to {getNextStatus(selectedWO.status)!.replace("_", " ")}
                      </button>
                    )}
                    {selectedWO.status === "COMPLETED" && (
                      <button onClick={() => handleStatusUpdate(selectedWO.id)}
                        className="h-9 px-4 rounded-lg bg-success text-success-foreground text-sm font-medium hover:brightness-90 transition-colors flex items-center gap-2">
                        <CheckCheck size={14} /> Verify
                      </button>
                    )}
                  </div>
                  {deleteConfirm === selectedWO.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-destructive">Confirm delete?</span>
                      <button onClick={() => handleDelete(selectedWO.id)} className="h-8 px-3 rounded-lg bg-destructive text-foreground text-xs font-medium hover:brightness-90 transition-colors">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} className="h-8 px-3 rounded-lg bg-muted text-foreground text-xs hover:bg-accent transition-colors">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(selectedWO.id)}
                      className="h-8 px-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1">
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
