"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck, Plus, Eye, Trash2, Search, MapPin, User,
  Calendar, Clock, AlertTriangle, CheckCircle2, X,
  FileText, Filter, ChevronDown, ChevronUp, Building2,
} from "lucide-react";
import type { UserRole } from "@/types";

/* ─── Types ─── */

type InspectionType = "daily" | "routine" | "periodic" | "emergency";

interface ChecklistItem {
  description: string;
  condition: "good" | "fair" | "poor";
  notes: string;
}

interface ActionItem {
  action: string;
  assignedRole: string;
  dueDate: string;
}

interface Inspection {
  id: string;
  type: InspectionType;
  date: string;
  site: string;
  inspector: string;
  time: string;
  checklist: ChecklistItem[];
  findings: string;
  actionItems: ActionItem[];
  observations: string;
  status: "open" | "in_progress" | "closed";
  createdAt: string;
}

/* ─── Constants ─── */

const TYPE_LABELS: Record<InspectionType, string> = {
  daily: "Daily",
  routine: "Routine",
  periodic: "Periodic",
  emergency: "Emergency",
};

const TYPE_OPTIONS: InspectionType[] = ["daily", "routine", "periodic", "emergency"];

const STATUS_OPTIONS: ("open" | "in_progress" | "closed")[] = ["open", "in_progress", "closed"];

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

const STORAGE_KEY = "fixflow-inspections-v2";

const CHECKLIST_TEMPLATES: Record<InspectionType, { description: string }[]> = {
  daily: [
    { description: "General cleanliness and housekeeping" },
    { description: "Safety equipment accessible and functional" },
    { description: "Lighting operational in all areas" },
    { description: "HVAC system functioning normally" },
    { description: "No unusual odors or leaks" },
    { description: "Fire exits clear and unobstructed" },
    { description: "Restrooms clean and stocked" },
    { description: "Security systems armed and operational" },
  ],
  routine: [
    { description: "Equipment operating within specifications" },
    { description: "Lubrication levels adequate" },
    { description: "Belts and chains properly tensioned" },
    { description: "Filters clean or replaced as scheduled" },
    { description: "Electrical connections secure" },
    { description: "Vibration levels within normal range" },
    { description: "Temperature readings within limits" },
    { description: "No abnormal noise from equipment" },
    { description: "Safety guards in place" },
    { description: "Control panels and indicators functioning" },
  ],
  periodic: [
    { description: "Structural integrity check of all assets" },
    { description: "Corrosion and wear assessment" },
    { description: "Calibration verification of instruments" },
    { description: "Pressure tests where applicable" },
    { description: "Insulation resistance testing" },
    { description: "Emergency shutdown systems tested" },
    { description: "Spare parts inventory checked" },
    { description: "Documentation and records reviewed" },
    { description: "Training requirements assessed" },
    { description: "Regulatory compliance verification" },
  ],
  emergency: [
    { description: "Immediate hazard assessment" },
    { description: "Area secured and evacuated if needed" },
    { description: "Emergency services notified" },
    { description: "Isolation of affected systems" },
    { description: "Damage extent evaluated" },
    { description: "Temporary repairs initiated" },
    { description: "Root cause investigation started" },
    { description: "Affected personnel accounted for" },
    { description: "Containment measures in place" },
    { description: "Recovery plan drafted" },
  ],
};

/* ─── Helpers ─── */

function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `INS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function loadInspections(): Inspection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveInspections(data: Inspection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getTypeBadgeColor(type: InspectionType) {
  switch (type) {
    case "daily": return "bg-mustard/10 text-mustard border-mustard/30";
    case "routine": return "bg-info/10 text-info border-info/30";
    case "periodic": return "bg-success/10 text-success border-success/30";
    case "emergency": return "bg-destructive/10 text-destructive border-destructive/30";
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "open": return "bg-warning/10 text-warning border-warning/30";
    case "in_progress": return "bg-info/10 text-info border-info/30";
    case "closed": return "bg-success/10 text-success border-success/30";
    default: return "bg-muted-foreground/10 text-text-muted border-border/30";
  }
}

/* ─── Props ─── */

interface InspectionsPageProps {
  role: UserRole;
}

/* ─── Component ─── */

export function InspectionsPage({ role }: InspectionsPageProps) {
  const canEdit = ["admin", "manager", "supervisor", "staff"].includes(role);
  const canDelete = ["admin", "manager"].includes(role);

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSite, setFilterSite] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Form state
  const [form, setForm] = useState<Inspection>({
    id: "",
    type: "daily",
    date: new Date().toISOString().split("T")[0],
    site: "",
    inspector: "",
    time: "",
    checklist: [],
    findings: "",
    actionItems: [],
    observations: "",
    status: "open",
    createdAt: "",
  });

  useEffect(() => {
    setInspections(loadInspections());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Get unique sites for filter
  const sites = useMemo(() => {
    const s = new Set(inspections.map((i) => i.site).filter(Boolean));
    return Array.from(s).sort();
  }, [inspections]);

  // Filter logic
  const filtered = useMemo(() => {
    return inspections.filter((i) => {
      if (filterType !== "all" && i.type !== filterType) return false;
      if (filterSite !== "all" && i.site !== filterSite) return false;
      if (filterStatus !== "all" && i.status !== filterStatus) return false;
      if (filterDateFrom && i.date < filterDateFrom) return false;
      if (filterDateTo && i.date > filterDateTo) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [inspections, filterType, filterSite, filterStatus, filterDateFrom, filterDateTo]);

  function handleNewInspection() {
    setForm({
      id: "",
      type: "daily",
      date: new Date().toISOString().split("T")[0],
      site: "",
      inspector: "",
      time: "",
      checklist: CHECKLIST_TEMPLATES.daily.map((t) => ({ description: t.description, condition: "good" as const, notes: "" })),
      findings: "",
      actionItems: [],
      observations: "",
      status: "open",
      createdAt: "",
    });
    setFormOpen(true);
  }

  function handleTypeChange(type: InspectionType) {
    setForm((prev) => ({
      ...prev,
      type: type,
      checklist: CHECKLIST_TEMPLATES[type].map((t) => ({ description: t.description, condition: "good" as const, notes: "" })),
    }));
  }

  function handleChecklistChange(index: number, field: "condition" | "notes", value: string) {
    setForm((prev) => {
      const updated = [...prev.checklist];
      updated[index] = { ...updated[index], [field]: field === "condition" ? value as "good" | "fair" | "poor" : value };
      return { ...prev, checklist: updated };
    });
  }

  function handleAddActionItem() {
    setForm((prev) => ({
      ...prev,
      actionItems: [...prev.actionItems, { action: "", assignedRole: "", dueDate: "" }],
    }));
  }

  function handleActionItemChange(index: number, field: "action" | "assignedRole" | "dueDate", value: string) {
    setForm((prev) => {
      const updated = [...prev.actionItems];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, actionItems: updated };
    });
  }

  function handleRemoveActionItem(index: number) {
    setForm((prev) => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newInspection: Inspection = {
      ...form,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newInspection, ...inspections];
    saveInspections(updated);
    setInspections(updated);
    setFormOpen(false);
    setToast("Inspection created ✓");
  }

  function handleDelete(id: string) {
    const updated = inspections.filter((i) => i.id !== id);
    saveInspections(updated);
    setInspections(updated);
    setExpandedId(null);
    setToast("Inspection deleted ✓");
  }

  function handleStatusChange(id: string, status: "open" | "in_progress" | "closed") {
    const updated = inspections.map((i) => (i.id === id ? { ...i, status } : i));
    saveInspections(updated);
    setInspections(updated);
    setToast(`Status updated to ${STATUS_LABELS[status]} ✓`);
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium bg-success/10 border-success/30 text-success"
          >
            <CheckCircle2 size={16} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inspections</h1>
          <p className="text-text-tertiary text-sm mt-1">
            Manage all facility inspections in one place
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleNewInspection}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus size={14} /> New Inspection
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-text-tertiary text-sm">
          <Filter size={14} />
          <span>Filters:</span>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-9 px-3 rounded-lg bg-card-alt border border-border text-foreground text-xs outline-none focus:border-primary/50"
        >
          <option value="all">All Types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select
          value={filterSite}
          onChange={(e) => setFilterSite(e.target.value)}
          className="h-9 px-3 rounded-lg bg-card-alt border border-border text-foreground text-xs outline-none focus:border-primary/50"
        >
          <option value="all">All Sites</option>
          {sites.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 px-3 rounded-lg bg-card-alt border border-border text-foreground text-xs outline-none focus:border-primary/50"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="h-9 px-3 rounded-lg bg-card-alt border border-border text-foreground text-xs outline-none focus:border-primary/50"
          title="From date"
        />
        <span className="text-text-muted text-xs">to</span>
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="h-9 px-3 rounded-lg bg-card-alt border border-border text-foreground text-xs outline-none focus:border-primary/50"
          title="To date"
        />
      </div>

      {/* Inspection List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <ClipboardCheck size={40} className="mx-auto text-text-tertiary mb-3" />
          <p className="text-foreground font-medium">No inspections found</p>
          <p className="text-text-tertiary text-sm mt-1">
            {inspections.length === 0
              ? "Create your first inspection using the button above"
              : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card-alt">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Site</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Inspector</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Findings Summary</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inspection) => (
                  <Fragment key={inspection.id}>
                    <tr
                      className="hover:bg-foreground/[0.02] transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === inspection.id ? null : inspection.id)}
                    >
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{formatDate(inspection.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getTypeBadgeColor(inspection.type)}`}>
                          {TYPE_LABELS[inspection.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{inspection.site}</td>
                      <td className="px-4 py-3 text-text-tertiary">{inspection.inspector}</td>
                      <td className="px-4 py-3 text-text-tertiary max-w-[200px] truncate">
                        {inspection.findings || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadgeColor(inspection.status)}`}>
                          {STATUS_LABELS[inspection.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && inspection.status !== "closed" && (
                            <select
                              value={inspection.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(inspection.id, e.target.value as any);
                              }}
                              className="h-7 text-[10px] px-2 rounded bg-card-alt border border-border text-foreground outline-none"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                              ))}
                            </select>
                          )}
                          {canDelete && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(inspection.id); }}
                              className="h-7 w-7 rounded flex items-center justify-center text-text-tertiary hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === inspection.id ? null : inspection.id); }}
                            className="h-7 w-7 rounded flex items-center justify-center text-text-tertiary hover:text-foreground transition-colors"
                          >
                            {expandedId === inspection.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === inspection.id && (
                      <tr key={`${inspection.id}-details`}>
                        <td colSpan={7} className="px-4 py-4 bg-background/20">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <h4 className="text-xs font-semibold text-text-tertiary uppercase mb-2">Checklist</h4>
                              <div className="space-y-2">
                                {inspection.checklist.map((item, idx) => (
                                  <div key={idx} className="text-xs text-foreground flex items-start gap-2">
                                    <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 ${
                                      item.condition === "good" ? "bg-success/20 text-success" :
                                      item.condition === "fair" ? "bg-warning/20 text-warning" :
                                      "bg-destructive/20 text-destructive"
                                    }`}>
                                      {item.condition === "good" ? "✓" : item.condition === "fair" ? "!" : "✗"}
                                    </span>
                                    <div>
                                      <p>{item.description}</p>
                                      {item.notes && <p className="text-text-muted mt-0.5">{item.notes}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xs font-semibold text-text-tertiary uppercase mb-2">General Findings</h4>
                                <p className="text-xs text-foreground">{inspection.findings || "No findings recorded"}</p>
                              </div>
                              {inspection.actionItems.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-text-tertiary uppercase mb-2">Action Items</h4>
                                  <div className="space-y-1">
                                    {inspection.actionItems.map((item, idx) => (
                                      <p key={idx} className="text-xs text-foreground">
                                        • {item.action}
                                        {item.assignedRole && <span className="text-text-muted"> — {item.assignedRole}</span>}
                                        {item.dueDate && <span className="text-text-muted"> (due {formatDate(item.dueDate)})</span>}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {inspection.observations && (
                                <div>
                                  <h4 className="text-xs font-semibold text-text-tertiary uppercase mb-2">Observations</h4>
                                  <p className="text-xs text-foreground">{inspection.observations}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 text-[10px] text-text-muted">
                            Created: {formatDate(inspection.createdAt)}
                            {inspection.time && <> · Time: {inspection.time}</>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Inspection Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-background/60 overflow-y-auto"
            onClick={() => setFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-card rounded-2xl border border-border p-6 mt-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">New Inspection</h2>
                <button onClick={() => setFormOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-foreground hover:bg-foreground/5 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Type + Date */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Inspection Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => handleTypeChange(e.target.value as InspectionType)}
                      required
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                      required
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                {/* Row 2: Site + Inspector */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Site</label>
                    <input
                      type="text"
                      value={form.site}
                      onChange={(e) => setForm((prev) => ({ ...prev, site: e.target.value }))}
                      required
                      placeholder="e.g. Lekki Phase 1"
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50 placeholder:text-text-muted"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Inspector Name</label>
                    <input
                      type="text"
                      value={form.inspector}
                      onChange={(e) => setForm((prev) => ({ ...prev, inspector: e.target.value }))}
                      required
                      placeholder="Full name"
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50 placeholder:text-text-muted"
                    />
                  </div>
                </div>

                {/* Time */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Time of Inspection</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-tertiary mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as any }))}
                      className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-2">Checklist</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {form.checklist.map((item, idx) => (
                      <div key={idx} className="bg-card-alt border border-border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs text-foreground flex-1">{item.description}</p>
                          <select
                            value={item.condition}
                            onChange={(e) => handleChecklistChange(idx, "condition", e.target.value)}
                            className={`h-7 text-[10px] font-medium px-2 rounded border outline-none ${
                              item.condition === "good" ? "bg-success/10 text-success border-success/30" :
                              item.condition === "fair" ? "bg-warning/10 text-warning border-warning/30" :
                              "bg-destructive/10 text-destructive border-destructive/30"
                            }`}
                          >
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleChecklistChange(idx, "notes", e.target.value)}
                          placeholder="Add notes..."
                          className="w-full mt-2 h-7 px-2 rounded bg-background/20 border border-border text-xs text-foreground outline-none placeholder:text-text-muted"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* General Findings */}
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1.5">General Findings</label>
                  <textarea
                    value={form.findings}
                    onChange={(e) => setForm((prev) => ({ ...prev, findings: e.target.value }))}
                    rows={3}
                    placeholder="Describe overall findings, issues discovered, and observations..."
                    className="w-full rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50 placeholder:text-text-muted p-3 resize-none"
                  />
                </div>

                {/* Observations */}
                <div>
                  <label className="block text-xs font-medium text-text-tertiary mb-1.5">Observations</label>
                  <textarea
                    value={form.observations}
                    onChange={(e) => setForm((prev) => ({ ...prev, observations: e.target.value }))}
                    rows={2}
                    placeholder="What was noticed and recommended follow-up..."
                    className="w-full rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50 placeholder:text-text-muted p-3 resize-none"
                  />
                </div>

                {/* Action Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-text-tertiary">Action Items</label>
                    <button
                      type="button"
                      onClick={handleAddActionItem}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Action
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.actionItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-card-alt border border-border rounded-lg p-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={item.action}
                            onChange={(e) => handleActionItemChange(idx, "action", e.target.value)}
                            placeholder="Action description"
                            className="w-full h-8 px-2 rounded bg-background/20 border border-border text-xs text-foreground outline-none placeholder:text-text-muted"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={item.assignedRole}
                              onChange={(e) => handleActionItemChange(idx, "assignedRole", e.target.value)}
                              placeholder="Assigned role"
                              className="flex-1 h-7 px-2 rounded bg-background/20 border border-border text-xs text-foreground outline-none placeholder:text-text-muted"
                            />
                            <input
                              type="date"
                              value={item.dueDate}
                              onChange={(e) => handleActionItemChange(idx, "dueDate", e.target.value)}
                              className="h-7 px-2 rounded bg-background/20 border border-border text-xs text-foreground outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveActionItem(idx)}
                          className="h-6 w-6 rounded flex items-center justify-center text-text-tertiary hover:text-destructive transition-colors shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="flex-1 h-10 rounded-lg bg-muted text-foreground text-sm hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                  >
                    Submit Inspection
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
