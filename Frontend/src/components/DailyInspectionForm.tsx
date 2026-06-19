"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  MapPin,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import {
  getTemplates,
  getTemplateById,
  createInspection,
  completeInspection,
  updateInspection,
  getInspections,
  type Inspection,
  type ChecklistItem,
  type InspectionTemplate,
} from "@/lib/inspections";
import { stores } from "@/lib/store/offline-store";
import { Button } from "@/components/ui/button";

function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `di-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const SEED_SITES = [
  { id: "site-lekki", name: "Lekki Site" },
  { id: "site-vi", name: "Victoria Island" },
  { id: "site-ikeja", name: "Ikeja GRA" },
  { id: "site-abuja", name: "Abuja Plaza" },
  { id: "site-ph", name: "PH Hub" },
];

const SEED_STAFF = [
  { id: "staff-1", name: "Admin User" },
  { id: "staff-2", name: "Manager User" },
  { id: "staff-3", name: "Supervisor User" },
  { id: "staff-4", name: "Staff User" },
];

const SEED_SEVERITIES = [
  { value: "low", label: "Low", color: "bg-muted-foreground" },
  { value: "normal", label: "Normal", color: "bg-info" },
  { value: "high", label: "High", color: "bg-warning" },
  { value: "critical", label: "Critical", color: "bg-destructive" },
];

export function DailyInspectionForm() {
  const [templates] = useState(() => getTemplates());
  const [sites] = useState(() => {
    const stored = stores.sites.getAll();
    return stored.length > 0 ? stored : SEED_SITES;
  });
  const [staff] = useState(() => {
    const stored = stores.profiles.getAll().filter((p: any) => ["admin","manager","supervisor","staff"].includes(p.role));
    return stored.length > 0 ? stored : SEED_STAFF;
  });

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  const [step, setStep] = useState<"form" | "review" | "done">("form");
  const [activeSection, setActiveSection] = useState<string>("details");

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(() => {
    const h = new Date().getHours().toString().padStart(2, "0");
    return `${h}:00`;
  });
  const [siteId, setSiteId] = useState("");
  const [siteName, setSiteName] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [inspectorId, setInspectorId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState("");
  const [routedTo, setRoutedTo] = useState("");
  const [signature, setSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastInspection, setLastInspection] = useState<Inspection | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [view, setView] = useState<"new" | "list">("new");
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fixflow-token");
      if (raw) {
        const b64 = raw.includes(".") ? raw.split(".")[1] : raw;
        const payload = JSON.parse(atob(b64));
        setCurrentUser({ id: payload.id || "", name: payload.full_name || "" });
        if (payload.full_name) setInspectorName(payload.full_name);
        if (payload.id) setInspectorId(payload.id);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setInspections(getInspections().filter((i: Inspection) => i.type === "Daily Inspection"));
  }, []);

  const handleTemplateChange = useCallback((tId: string) => {
    setTemplateId(tId);
    const tpl = getTemplateById(tId);
    if (tpl) {
      setChecklist(tpl.items.map((item) => ({
        ...item,
        status: "pending" as const,
        condition: null,
        remarks: "",
      })));
    } else {
      setChecklist([]);
    }
  }, []);

  const handleSiteChange = useCallback((sId: string) => {
    setSiteId(sId);
    const site = sites.find((s: any) => s.id === sId);
    if (site) setSiteName(site.name || site.siteName || "");
  }, [sites]);

  const updateItem = useCallback((itemId: string, data: Partial<ChecklistItem>) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...data } : item))
    );
  }, []);

  const passesCount = checklist.filter((c) => c.status === "pass").length;
  const failsCount = checklist.filter((c) => c.status === "fail").length;
  const naCount = checklist.filter((c) => c.status === "na").length;
  const totalChecked = checklist.length - naCount;
  const score = totalChecked > 0 ? Math.round((passesCount / totalChecked) * 100) : 0;

  const issuesFound = checklist
    .filter((c) => c.status === "fail")
    .map((c) => ({
      id: genId(),
      checklistItemId: c.id,
      description: c.remarks || c.text,
      severity: "high" as const,
      location: siteName,
      workOrderCreated: false,
      workOrderId: "",
    }));

  const handleSaveDraft = useCallback(() => {
    if (!siteId || !inspectorName) return;
    const insp = createInspection({
      type: "Daily Inspection",
      title: `Daily Inspection - ${siteName || "Unnamed Site"}`,
      siteId,
      siteName,
      scheduledDate: date,
      scheduledTime: time,
      inspectorName,
      inspectorId,
      checklist,
      priority: failsCount > 0 ? "high" : "normal",
    });
    updateInspectionNotes(insp.id);
    setLastInspection(insp);
    setInspections(getInspections().filter((i: Inspection) => i.type === "Daily Inspection"));
    setStep("done");
  }, [siteId, siteName, inspectorName, inspectorId, date, time, checklist, failsCount]);

  const handleSubmit = useCallback(async () => {
    if (!siteId || !inspectorName) return;
    setSubmitting(true);
    const insp = createInspection({
      type: "Daily Inspection",
      title: `Daily Inspection - ${siteName || "Unnamed Site"}`,
      siteId,
      siteName,
      scheduledDate: date,
      scheduledTime: time,
      inspectorName,
      inspectorId,
      checklist,
      priority: failsCount > 0 ? "high" : "normal",
    });
    const routeNote = routedTo ? `Routed to: ${routedTo}. ` : "";
    const fullNotes = routeNote + notes;
    completeInspection(insp.id, signature || inspectorName, fullNotes);
    if (routedTo) {
      updateInspection(insp.id, { remarks: fullNotes });
    }
    setLastInspection(insp);
    setInspections(getInspections().filter((i: Inspection) => i.type === "Daily Inspection"));
    setSubmitting(false);
    setStep("done");
  }, [siteId, siteName, inspectorName, inspectorId, date, time, checklist, failsCount, notes, routedTo, signature]);

  function updateInspectionNotes(id: string) {
    try {
      const routeNote = routedTo ? `Routed to: ${routedTo}. ` : "";
      updateInspection(id, { remarks: routeNote + notes });
    } catch {}
  }

  function resetForm() {
    setStep("form");
    setActiveSection("details");
    setSiteId("");
    setSiteName("");
    setTemplateId("");
    setChecklist([]);
    setNotes("");
    setRoutedTo("");
    setSignature("");
    setDate(new Date().toISOString().split("T")[0]);
    const h = new Date().getHours().toString().padStart(2, "0");
    setTime(`${h}:00`);
    setLastInspection(null);
  }

  const filteredInspections = inspections.filter((i) => {
    const matchesSearch =
      !searchQuery ||
      i.siteName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.inspectorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.referenceNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || i.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (step === "done" && lastInspection) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl space-y-6"
      >
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Inspection Submitted</h2>
          <p className="mt-2 text-text-tertiary">
            Reference: <span className="font-mono font-medium text-foreground">{lastInspection.referenceNo}</span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-text-tertiary">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {lastInspection.siteName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(lastInspection.scheduledDate)}
            </span>
          </div>
          {failsCount > 0 && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-3">
              <p className="flex items-center justify-center gap-1 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {failsCount} issue{failsCount > 1 ? "s" : ""} found — {lastInspection.overallCondition}
              </p>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={resetForm} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> New Inspection
            </Button>
            <Button onClick={() => { resetForm(); setView("list"); }}>
              <ClipboardCheck className="mr-2 h-4 w-4" /> View All
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (view === "list") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daily Inspections</h1>
            <p className="text-sm text-text-tertiary">{inspections.length} total records</p>
          </div>
          <Button onClick={() => setView("new")}>
            <Plus className="mr-2 h-4 w-4" /> New Inspection
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {filteredInspections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <ClipboardCheck className="mx-auto mb-3 h-10 w-10 text-text-tertiary" />
            <p className="font-medium text-foreground">No inspections found</p>
            <p className="mt-1 text-sm text-text-tertiary">
              {searchQuery ? "Try a different search" : "Start by creating a new daily inspection"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredInspections.map((insp, i) => (
              <motion.button
                key={insp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setSelectedInspection(selectedInspection?.id === insp.id ? null : insp);
                }}
                className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{insp.siteName}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      insp.status === "completed"
                        ? "bg-success/10 text-success"
                        : insp.status === "failed"
                          ? "bg-destructive/10 text-destructive"
                          : insp.status === "in-progress"
                            ? "bg-info/10 text-info"
                            : "bg-yellow-500/10 text-warning"
                    }`}
                  >
                    {insp.status}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-text-tertiary">
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatDate(insp.scheduledDate)}
                  </p>
                  <p className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {insp.inspectorName}
                  </p>
                  {insp.overallScore > 0 && (
                    <p className="flex items-center gap-1">
                      <ClipboardCheck className="h-3 w-3" /> Score: {insp.overallScore}%
                    </p>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {selectedInspection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedInspection.siteName}</h3>
                <p className="text-sm text-text-tertiary">
                  {selectedInspection.referenceNo} &middot; {formatDate(selectedInspection.scheduledDate)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedInspection(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-text-tertiary">Inspector:</span> {selectedInspection.inspectorName}
              </div>
              <div>
                <span className="text-text-tertiary">Score:</span> {selectedInspection.overallScore}%
              </div>
              <div>
                <span className="text-text-tertiary">Status:</span> {selectedInspection.status}
              </div>
              <div>
                <span className="text-text-tertiary">Condition:</span> {selectedInspection.overallCondition || "N/A"}
              </div>
            </div>
            {selectedInspection.remarks && (
              <div className="mb-4 rounded-lg bg-page p-3 text-sm text-foreground">
                <p className="mb-1 text-xs font-medium text-text-tertiary">Notes</p>
                {selectedInspection.remarks}
              </div>
            )}
            {selectedInspection.issuesFound.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-destructive">Issues Found ({selectedInspection.issuesFound.length})</p>
                {selectedInspection.issuesFound.map((issue) => (
                  <div key={issue.id} className="mb-2 rounded-lg bg-destructive/5 p-3 text-sm">
                    <p className="font-medium text-foreground">{issue.description}</p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      Severity: {issue.severity} | Location: {issue.location}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Inspection</h1>
          <p className="text-sm text-text-tertiary">
            Document issues found during daily walkthroughs and route for follow-up
          </p>
        </div>
        <Button variant="ghost" onClick={() => setView("list")}>
          <ClipboardCheck className="mr-2 h-4 w-4" /> View Past Inspections
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <button
              onClick={() => setActiveSection(activeSection === "details" ? "" : "details")}
              className="flex w-full items-center justify-between"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-primary" /> Details
              </h2>
              {activeSection === "details" ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
            </button>
            {activeSection === "details" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-tertiary">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-page py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-tertiary">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-lg border border-border bg-page py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-tertiary">Site / Location</label>
                  <select
                    value={siteId}
                    onChange={(e) => handleSiteChange(e.target.value)}
                    className="w-full rounded-lg border border-border bg-page px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select site...</option>
                    {sites.map((site: any) => (
                      <option key={site.id} value={site.id}>
                        {site.name || site.siteName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-tertiary">Inspector</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="text"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-lg border border-border bg-page py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <button
              onClick={() => setActiveSection(activeSection === "checklist" ? "" : "checklist")}
              className="flex w-full items-center justify-between"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <ClipboardCheck className="h-4 w-4 text-primary" /> Inspection Checklist
              </h2>
              {activeSection === "checklist" ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
            </button>
            {activeSection === "checklist" && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-tertiary">Template</label>
                  <select
                    value={templateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full rounded-lg border border-border bg-page px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select template...</option>
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                    ))}
                  </select>
                </div>

                {checklist.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-lg bg-page p-2 text-xs font-medium text-text-tertiary">
                      <span className="w-8 text-center">#</span>
                      <span className="flex-1">Item</span>
                      <span className="w-20 text-center">Status</span>
                      <span className="w-20 text-center">Condition</span>
                      <span className="hidden w-40 sm:block">Remarks</span>
                    </div>
                    {checklist.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex flex-wrap items-center gap-2 rounded-lg p-2 text-sm sm:flex-nowrap sm:gap-3 ${
                          item.status === "fail" ? "bg-destructive/5" : item.status === "pass" ? "bg-success/5" : "bg-page"
                        }`}
                      >
                        <span className="w-6 text-center text-xs text-text-tertiary">{idx + 1}</span>
                        <span className="w-full text-xs text-foreground sm:w-auto sm:flex-1 sm:text-sm">
                          {item.text}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateItem(item.id, { status: "pass" })}
                            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                              item.status === "pass" ? "bg-success text-foreground" : "bg-page text-text-tertiary hover:text-success"
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => updateItem(item.id, { status: "fail" })}
                            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                              item.status === "fail" ? "bg-destructive text-foreground" : "bg-page text-text-tertiary hover:text-destructive"
                            }`}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => updateItem(item.id, { status: "na" })}
                            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                              item.status === "na" ? "bg-muted-foreground text-foreground" : "bg-page text-text-tertiary hover:text-muted-foreground"
                            }`}
                          >
                            N/A
                          </button>
                        </div>
                        <select
                          value={item.condition || ""}
                          onChange={(e) => updateItem(item.id, { condition: e.target.value as any || null })}
                          className="w-20 rounded border border-border bg-page px-1 py-1 text-xs text-foreground focus:outline-none"
                        >
                          <option value="">-</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                        </select>
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => updateItem(item.id, { remarks: e.target.value })}
                          placeholder="Notes..."
                          className="w-full rounded border border-border bg-page px-2 py-1 text-xs text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary sm:w-36"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {checklist.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <ClipboardCheck className="mx-auto mb-2 h-8 w-8 text-text-tertiary" />
                    <p className="text-sm text-text-tertiary">Select a template to load checklist items</p>
                  </div>
                )}

                {checklist.length > 0 && (
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {passesCount} Pass
                    </span>
                    <span className="flex items-center gap-1 text-destructive">
                      <XCircle className="h-3.5 w-3.5" /> {failsCount} Fail
                    </span>
                    <span className="flex items-center gap-1 text-text-tertiary">
                      N/A {naCount}
                    </span>
                    {score > 0 && (
                      <span className="text-text-tertiary">Score: {score}%</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {failsCount > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-destructive" /> Issues Found ({failsCount})
              </h2>
              <div className="mt-3 space-y-2">
                {checklist
                  .filter((c) => c.status === "fail")
                  .map((item) => (
                    <div key={item.id} className="rounded-lg bg-destructive/5 p-3 text-sm">
                      <p className="font-medium text-foreground">{item.text}</p>
                      {item.remarks && (
                        <p className="mt-1 text-text-tertiary">{item.remarks}</p>
                      )}
                      <p className="mt-1 text-xs text-text-tertiary">
                        Condition: {item.condition || "N/A"}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5">
            <button
              onClick={() => setActiveSection(activeSection === "notes" ? "" : "notes")}
              className="flex w-full items-center justify-between"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" /> Notes &amp; Remarks
              </h2>
              {activeSection === "notes" ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
            </button>
            {activeSection === "notes" && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-tertiary">
                    General Notes <span className="text-text-tertiary">(explain what happened, observations, follow-up needed)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Describe any observations, issues found, or follow-up actions needed..."
                    className="w-full rounded-lg border border-border bg-page p-3 text-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-tertiary">
                    Route To <span className="text-text-tertiary">(assignee for follow-up)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="text"
                      value={routedTo}
                      onChange={(e) => setRoutedTo(e.target.value)}
                      placeholder="Name of person to follow up"
                      className="w-full rounded-lg border border-border bg-page py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-tertiary">Signature</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Type your full name as signature"
                      className="w-full rounded-lg border border-border bg-page py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-base font-semibold text-foreground">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Date</span>
                <span className="text-foreground">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Site</span>
                <span className="text-foreground">{siteName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Inspector</span>
                <span className="text-foreground">{inspectorName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Items</span>
                <span className="text-foreground">{checklist.length}</span>
              </div>
              {score > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Score</span>
                  <span className="text-foreground">{score}%</span>
                </div>
              )}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between font-medium">
                  <span className={failsCount > 0 ? "text-destructive" : "text-success"}>
                    {failsCount > 0 ? `${failsCount} Issue(s)` : "All Clear"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 text-base font-semibold text-foreground">Actions</h2>
            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={!siteId || !inspectorName || submitting}
                className="w-full"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" /> Submit Inspection
                  </span>
                )}
              </Button>
              <Button
                onClick={handleSaveDraft}
                disabled={!siteId || !inspectorName}
                variant="outline"
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" /> Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
