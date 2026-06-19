"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, Plus, Search, MapPin, User, Calendar, Clock,
  AlertTriangle, CheckCircle2, XCircle, FileText, Trash2,
  AlertCircle, Activity, Tag, Filter, ChevronRight, Wrench,
} from "lucide-react";
import {
  getObservations, getObservationById, addObservation,
  updateObservation, deleteObservation, createWorkOrderFromObservation,
  type FieldObservation,
} from "@/lib/observations";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "var(--color-destructive)", high: "var(--color-warning)", normal: "var(--color-info)", low: "var(--color-text-muted)",
};
const STATUS_COLORS: Record<string, string> = {
  open: "var(--color-info)", acknowledged: "var(--color-warning)",
  "work-order-created": "var(--color-success)", resolved: "var(--color-text-muted)",
};
const STATUS_BG: Record<string, string> = {
  open: "var(--color-info)", acknowledged: "var(--color-warning)",
  "work-order-created": "var(--color-success)", resolved: "var(--color-text-muted)",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ObservationsPage() {
  const [observations, setObservations] = useState<FieldObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [detailObs, setDetailObs] = useState<FieldObservation | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formAssetName, setFormAssetName] = useState("");
  const [formAssetCategory, setFormAssetCategory] = useState("Plumbing");
  const [formLocation, setFormLocation] = useState("");
  const [formSiteName, setFormSiteName] = useState("");
  const [formObservedBy, setFormObservedBy] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDetailedNote, setFormDetailedNote] = useState("");
  const [formSeverity, setFormSeverity] = useState<FieldObservation["severity"]>("normal");
  const [formTags, setFormTags] = useState("");

  const loadData = () => {
    setObservations(getObservations());
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  const filtered = observations.filter((o) => {
    if (sevFilter !== "all" && o.severity !== sevFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.referenceNo.toLowerCase().includes(search.toLowerCase()) && !o.assetName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCount = observations.length;
  const openCount = observations.filter((o) => o.status === "open").length;
  const woCreatedCount = observations.filter((o) => o.status === "work-order-created").length;
  const resolvedCount = observations.filter((o) => o.status === "resolved").length;

  const resetForm = () => {
    setFormTitle(""); setFormAssetName(""); setFormAssetCategory("Plumbing");
    setFormLocation(""); setFormSiteName(""); setFormObservedBy("");
    setFormDescription(""); setFormDetailedNote(""); setFormSeverity("normal"); setFormTags("");
  };

  const handleAdd = () => {
    if (!formTitle.trim() || !formAssetName.trim()) {
      setToast({ message: "Title and Asset Name are required", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    addObservation({
      title: formTitle, assetName: formAssetName, assetCategory: formAssetCategory,
      location: formLocation, siteName: formSiteName, observedBy: formObservedBy,
      description: formDescription, detailedNote: formDetailedNote, severity: formSeverity,
      tags: formTags ? formTags.split(",").map((t) => t.trim()) : [],
    });
    setObservations(getObservations());
    setAddOpen(false);
    resetForm();
    setToast({ message: "Observation created", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateWO = (id: string) => {
    const woId = createWorkOrderFromObservation(id);
    if (woId) {
      setObservations(getObservations());
      if (detailObs?.id === id) {
        const updated = getObservationById(id);
        if (updated) setDetailObs(updated);
      }
      setToast({ message: `Work Order ${woId} created from this observation`, type: "success" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDelete = (id: string) => {
    deleteObservation(id);
    setObservations(getObservations());
    setDeleteConfirm(null);
    if (detailObs?.id === id) { setDetailOpen(false); setDetailObs(null); }
  };

  const handleStatusChange = (id: string, status: FieldObservation["status"]) => {
    updateObservation(id, { status });
    setObservations(getObservations());
    if (detailObs?.id === id) {
      const updated = getObservationById(id);
      if (updated) setDetailObs(updated);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium ${
            toast.type === "success" ? "bg-success/10 border-success/30 text-success" : "bg-[var(--color-destructive)]/10 border-[var(--color-destructive)]/30 text-destructive"
          }`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.message}
        </motion.div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Field Observation Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">Record and track issues discovered during inspections and site visits</p>
        </div>
        <button onClick={() => { resetForm(); setAddOpen(true); }} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus size={16} /> New Observation
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: totalCount, color: "var(--color-text-muted)" },
          { label: "Open", value: openCount, color: "var(--color-info)" },
          { label: "Work Order Created", value: woCreatedCount, color: "var(--color-success)" },
          { label: "Resolved", value: resolvedCount, color: "var(--color-text-muted)" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
            <p className="text-muted-foreground text-xs">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search observations..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-subtle outline-none focus:border-primary/50 transition-colors" />
        </div>
        <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value)} className="h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50">
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="work-order-created">Work Order Created</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* OBSERVATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((obs) => (
          <motion.div key={obs.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-5 border border-border hover:border-input transition-colors cursor-pointer"
            style={{ borderLeft: `4px solid ${SEVERITY_COLORS[obs.severity]}` }}
            onClick={() => { setDetailObs(obs); setDetailOpen(true); }}>
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">{obs.referenceNo}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${STATUS_BG[obs.status]}20`, color: STATUS_BG[obs.status] }}>
                {obs.status === "work-order-created" ? "WO Created" : obs.status.charAt(0).toUpperCase() + obs.status.slice(1)}
              </span>
            </div>

            <h3 className="text-foreground font-semibold text-sm mb-3 line-clamp-1">{obs.title}</h3>

            <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
              <p className="font-medium text-foreground">{obs.assetName}</p>
              <p>{obs.assetCategory} — {obs.location}</p>
              <div className="flex items-center gap-2"><User size={12} /> {obs.observedBy} · {formatDate(obs.observedAt)}</div>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{obs.description}</p>

            {obs.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {obs.tags.map((t, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text-muted">{t}</span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${SEVERITY_COLORS[obs.severity]}20`, color: SEVERITY_COLORS[obs.severity] }}>
                {obs.severity}
              </span>
              <div className="flex gap-2">
                {!obs.workOrderCreated && obs.status !== "resolved" && (
                  <button onClick={(e) => { e.stopPropagation(); handleCreateWO(obs.id); }} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
                    <Wrench size={12} /> Create WO
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); setDetailObs(obs); setDetailOpen(true); }} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-border text-text-secondary hover:text-foreground hover:bg-accent transition-colors">
                  <Eye size={12} /> View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Eye size={48} className="mx-auto text-text-tertiary mb-4" />
          <p className="text-muted-foreground">No observations found</p>
        </div>
      )}

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {detailOpen && detailObs && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 sm:pt-12 bg-background/60 overflow-y-auto" onClick={() => setDetailOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl bg-card rounded-2xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">{detailObs.referenceNo}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${STATUS_BG[detailObs.status]}20`, color: STATUS_BG[detailObs.status] }}>
                      {detailObs.status === "work-order-created" ? "WO Created" : detailObs.status.charAt(0).toUpperCase() + detailObs.status.slice(1)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${SEVERITY_COLORS[detailObs.severity]}20`, color: SEVERITY_COLORS[detailObs.severity] }}>
                      {detailObs.severity}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{detailObs.title}</h2>
                </div>
                <button onClick={() => setDetailOpen(false)} className="h-8 w-8 rounded-lg bg-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><XCircle size={16} /></button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 bg-card-alt rounded-xl p-4">
                  <div>
                    <span className="text-text-muted text-xs">Asset</span>
                    <p className="text-foreground text-sm font-medium">{detailObs.assetName}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Category</span>
                    <p className="text-foreground text-sm">{detailObs.assetCategory}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Location</span>
                    <p className="text-foreground text-sm flex items-center gap-1"><MapPin size={12} className="text-primary" /> {detailObs.location}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Site</span>
                    <p className="text-foreground text-sm">{detailObs.siteName}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Observed By</span>
                    <p className="text-foreground text-sm flex items-center gap-1"><User size={12} className="text-primary" /> {detailObs.observedBy}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-xs">Date/Time</span>
                    <p className="text-foreground text-sm flex items-center gap-1"><Calendar size={12} className="text-primary" /> {formatDateTime(detailObs.observedAt)}</p>
                  </div>
                </div>

                <div>
                  <span className="text-secondary-foreground text-sm block mb-2">Detailed Note</span>
                  <div className="bg-card-alt rounded-xl p-4 border border-border">
                    <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">{detailObs.detailedNote || detailObs.description}</p>
                  </div>
                </div>

                {detailObs.tags.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs block mb-2">Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {detailObs.tags.map((t, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-border text-muted-foreground flex items-center gap-1"><Tag size={10} /> {t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div>
                  <span className="text-muted-foreground text-xs block mb-2">Status</span>
                  <div className="flex items-center gap-2 bg-card-alt rounded-xl p-3 border border-border">
                    {(["open", "acknowledged", "work-order-created", "resolved"] as const).map((step, idx) => {
                      const order = ["open", "acknowledged", "work-order-created", "resolved"];
                      const currentIdx = order.indexOf(detailObs.status);
                      const stepIdx = order.indexOf(step);
                      const isActive = stepIdx <= currentIdx;
                      return (
                        <div key={step} className="flex items-center gap-2 flex-1">
                          <button onClick={() => handleStatusChange(detailObs.id, step)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isActive ? "bg-primary/10 text-primary" : "text-text-muted bg-border hover:text-foreground"
                            }`}>
                            {step === "work-order-created" ? "WO Created" : step.charAt(0).toUpperCase() + step.slice(1)}
                          </button>
                          {idx < 3 && <div className="flex-1 h-px bg-border" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Work Order Link */}
                {detailObs.workOrderCreated && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-success/10 border border-success/30 text-success text-sm">
                    <CheckCircle2 size={16} />
                    <span>Work Order <span className="font-mono font-bold">{detailObs.workOrderId}</span> created from this observation</span>
                  </div>
                )}

                {/* Resolution */}
                {detailObs.resolution && (
                  <div>
                    <span className="text-muted-foreground text-xs block mb-2">Resolution</span>
                    <div className="bg-card-alt rounded-xl p-3 border border-border">
                      <p className="text-success text-sm">{detailObs.resolution}</p>
                      <p className="text-text-muted text-xs mt-1">Resolved by {detailObs.resolvedBy} on {formatDate(detailObs.resolvedAt)}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {!detailObs.workOrderCreated && detailObs.status !== "resolved" && (
                    <button onClick={() => handleCreateWO(detailObs.id)}
                      className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                      <Wrench size={16} /> Create Work Order
                    </button>
                  )}
                  <button onClick={() => { setDeleteConfirm(detailObs.id); }}
                    className="flex-1 h-10 rounded-lg bg-[var(--color-destructive)]/10 text-destructive text-sm hover:bg-[var(--color-destructive)]/20 transition-colors flex items-center justify-center gap-2">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD OBSERVATION MODAL */}
      <AnimatePresence>
        {addOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 sm:pt-12 bg-background/60 overflow-y-auto" onClick={() => setAddOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl bg-card rounded-2xl border border-border p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-foreground mb-1">New Observation</h2>
              <p className="text-muted-foreground text-sm mb-5">Record a field observation or note</p>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div>
                  <label className="text-secondary-foreground text-sm block mb-1.5">Title *</label>
                  <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Brief summary of what you observed" className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-subtle outline-none focus:border-primary/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-secondary-foreground text-sm block mb-1.5">Asset Name *</label>
                    <input value={formAssetName} onChange={(e) => setFormAssetName(e.target.value)} placeholder="e.g. Angle Valve - Toilet 3" className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-subtle outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-secondary-foreground text-sm block mb-1.5">Asset Category</label>
                    <select value={formAssetCategory} onChange={(e) => setFormAssetCategory(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50">
                      {["Plumbing", "Electrical", "HVAC", "Generator", "Structural", "Fire Safety", "Security", "Lift", "Water System", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-secondary-foreground text-sm block mb-1.5">Location</label>
                    <input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="e.g. Men's Restroom Floor 2" className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-subtle outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-secondary-foreground text-sm block mb-1.5">Site</label>
                    <input value={formSiteName} onChange={(e) => setFormSiteName(e.target.value)} placeholder="e.g. Building A - Headquarters" className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-subtle outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="text-secondary-foreground text-sm block mb-1.5">Observed By</label>
                  <input value={formObservedBy} onChange={(e) => setFormObservedBy(e.target.value)} placeholder="Your name" className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-subtle outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-secondary-foreground text-sm block mb-1.5">Description</label>
                  <input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Brief description" className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-subtle outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-secondary-foreground text-sm block mb-1.5">Detailed Observation Note</label>
                  <textarea value={formDetailedNote} onChange={(e) => setFormDetailedNote(e.target.value)}
                    placeholder={`Describe exactly what you observed. Include:\n- Exact location of the issue\n- What is leaking/broken/faulty\n- Estimated severity\n- Any immediate risk\n- Materials or parts that may be needed\n\nExample: Plumbing leak at angle valve behind toilet unit 3, men's restroom floor 2. Magic waste dripping at approximately 2 drops per second. Valve appears corroded. May require full valve replacement.`}
                    rows={6}
                    className="w-full px-3 py-2 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-subtle outline-none focus:border-primary/50 resize-none min-h-[200px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-secondary-foreground text-sm block mb-1.5">Severity</label>
                    <select value={formSeverity} onChange={(e) => setFormSeverity(e.target.value as FieldObservation["severity"])} className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50">
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-secondary-foreground text-sm block mb-1.5">Tags (comma separated)</label>
                    <input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="plumbing, leak, urgent" className="w-full h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-subtle outline-none focus:border-primary/50" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setAddOpen(false)} className="flex-1 h-10 rounded-lg bg-border text-foreground text-sm hover:bg-accent transition-colors">Cancel</button>
                <button onClick={handleAdd} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">Create Observation</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 text-center" onClick={(e) => e.stopPropagation()}>
              <AlertTriangle size={32} className="mx-auto text-destructive mb-3" />
              <h3 className="text-foreground font-semibold mb-1">Confirm Delete</h3>
              <p className="text-muted-foreground text-sm mb-5">Are you sure you want to delete this observation? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 rounded-lg bg-border text-foreground text-sm hover:bg-accent transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 rounded-lg bg-[var(--color-destructive)] text-foreground text-sm hover:bg-destructive/90 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
