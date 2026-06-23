"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import CommentSection from "@/components/comments/CommentSection";
import {
  Plus, Eye, Trash2, Printer, Save, CheckCircle2,
  AlertTriangle, FileSpreadsheet, ArrowUp, ArrowDown, Minus,
  Calendar, Wrench, Zap, Lightbulb, ListTodo, ClipboardList,
  ClipboardCheck, AlertCircle, Loader2, ExternalLink, ChevronDown, ChevronUp, FileText,
  BarChart3, Clock, Search, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type OperationalReport,
  type OpReportStats,
  type RecurringActivityEntry,
  RECURRING_ACTIVITIES_TEMPLATE,
  computeLiveStats,
  getReports,
  createReport,
  saveReport,
  deleteReport,
  finalizeReport,
  deduplicateReports,
} from "@/lib/store/weeklyReport";

function getMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getMonthRange(d: Date): { start: string; end: string } {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "Period not set";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Period not set";
  return d.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function formatShort(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "NGN", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const STAT_LINKS: Record<string, string> = {
  pendingTasksOpen: "/admin/pending-tasks",
  pendingTasksOverdue: "/admin/pending-tasks",
  pmDue: "/admin/pm-schedule",
  pmOverdue: "/admin/pm-schedule",
  inspectionsCompleted: "/admin/inspections",
  inspectionsIssues: "/admin/inspections",
  workOrdersOpened: "/admin/work-orders",
  workOrdersClosed: "/admin/work-orders",
  faultReportsNew: "/admin/fault-reports",
};

const STAT_CONFIG: { key: keyof OpReportStats; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  { key: "pendingTasksOpen", label: "Pending Tasks", icon: ClipboardList, color: "text-info", desc: "open" },
  { key: "pendingTasksOverdue", label: "Overdue Tasks", icon: AlertTriangle, color: "text-destructive", desc: "overdue" },
  { key: "pmDue", label: "PM Due", icon: Wrench, color: "text-primary", desc: "due this period" },
  { key: "pmOverdue", label: "PM Overdue", icon: AlertCircle, color: "text-destructive", desc: "overdue" },
  { key: "inspectionsCompleted", label: "Inspections Done", icon: ClipboardCheck, color: "text-success", desc: "completed" },
  { key: "inspectionsIssues", label: "Issues Flagged", icon: AlertTriangle, color: "text-warning", desc: "flagged" },
  { key: "workOrdersOpened", label: "WOs Opened", icon: Wrench, color: "text-info", desc: "opened" },
  { key: "workOrdersClosed", label: "WOs Closed", icon: CheckCircle2, color: "text-success", desc: "closed" },
  { key: "faultReportsNew", label: "Faults Reported", icon: Zap, color: "text-destructive", desc: "new" },
];

const STATUS_PILLS: Record<string, { label: string; color: string }> = {
  ok: { label: "OK", color: "bg-success/10 text-success border-success/20" },
  attention: { label: "Needs Attention", color: "bg-warning/10 text-warning border-warning/20" },
  overdue: { label: "Overdue", color: "bg-destructive/10 text-destructive border-destructive/20" },
  pending: { label: "Pending", color: "bg-muted-foreground/10 text-text-tertiary border-border/20" },
};

const STAT_COLOR_MAP: Record<string, string> = {
  "text-info": "bg-info/10",
  "text-destructive": "bg-destructive/10",
  "text-primary": "bg-primary/10",
  "text-success": "bg-success/10",
  "text-warning": "bg-warning/10",
};

export default function OperationalReportPage() {
  const [reports, setReports] = useState<OperationalReport[]>([]);
  const [activeReport, setActiveReport] = useState<OperationalReport | null>(null);
  const [periodType, setPeriodType] = useState<"Weekly" | "Monthly">("Weekly");
  const [createOpen, setCreateOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState(getMonday(new Date()));
  const [periodEnd, setPeriodEnd] = useState(addDays(getMonday(new Date()), 6));
  const [liveStats, setLiveStats] = useState<OpReportStats | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [commentLinkId, setCommentLinkId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Weekly" | "Monthly">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Draft" | "Final">("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("fixflow-upline-manager-session");
      if (raw) {
        const s = JSON.parse(raw);
        setCommentLinkId(s.token);
      }
    } catch {}
  }, []);

  useEffect(() => {
    deduplicateReports();
    setReports(getReports());
  }, []);

  useEffect(() => {
    if (periodType === "Weekly") {
      const monday = getMonday(new Date());
      setPeriodStart(monday);
      setPeriodEnd(addDays(monday, 6));
    } else {
      const range = getMonthRange(new Date());
      setPeriodStart(range.start);
      setPeriodEnd(range.end);
    }
  }, [periodType]);

  useEffect(() => {
    if (createOpen) {
      setLiveStats(computeLiveStats(periodStart, periodEnd));
    }
  }, [createOpen, periodStart, periodEnd]);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    const report = createReport(periodType, periodStart, periodEnd, "Ajose Enijeshiku");
    setReports(getReports());
    setActiveReport(report);
    setCreateOpen(false);
  };

  const handleOpen = (report: OperationalReport) => {
    setActiveReport({ ...report });
  };

  const handleSave = () => {
    if (!activeReport) return;
    const updated = { ...activeReport, stats: computeLiveStats(activeReport.periodStart, activeReport.periodEnd) };
    saveReport(updated);
    setActiveReport(updated);
    setReports(getReports());
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  const handleFinalize = () => {
    if (!activeReport) return;
    const updated = finalizeReport(activeReport);
    setActiveReport(updated);
    setReports(getReports());
    showToast("Report finalized", "success");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this report?")) {
      deleteReport(id);
      setReports(getReports());
      if (activeReport?.id === id) setActiveReport(null);
      showToast("Report deleted", "success");
    }
  };

  const handleBack = () => setActiveReport(null);

  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    if (!activeReport || !reportContentRef.current) return;
    try {
      const [html2canvasModule, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default;
      const canvas = await html2canvas(reportContentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 277;
      const doc = new jsPDF("p", "mm", "a4");
      let remaining = imgHeight;
      let pos = 10;
      doc.addImage(imgData, "PNG", 10, pos, imgWidth, imgHeight);
      remaining -= pageHeight;
      while (remaining > 0) {
        pos = remaining - imgHeight + 10;
        doc.addPage();
        doc.addImage(imgData, "PNG", 10, pos, imgWidth, imgHeight);
        remaining -= pageHeight;
      }
      doc.save(`${activeReport.periodType}_Report_${activeReport.periodStart}.pdf`);
    } catch (err) {
      console.error("html2canvas failed:", err);
      window.print();
    }
  };

  const handleExportExcel = async () => {
    if (!activeReport) return;
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = "FixFlow";
    wb.created = new Date();

    const ws = wb.addWorksheet("Report");
    ws.mergeCells(1, 1, 1, 2);
    const titleCell = ws.getCell("A1");
    titleCell.value = `${activeReport.periodType === "Weekly" ? "WEEKLY" : "MONTHLY"} REPORT`;
    titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A1A" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    ws.mergeCells(2, 1, 2, 2);
    const periodCell = ws.getCell("A2");
    periodCell.value = `${new Date(activeReport.periodStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — ${new Date(activeReport.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    periodCell.font = { italic: true, size: 10, color: { argb: "FF666666" } };
    periodCell.alignment = { horizontal: "center" };

    ws.getColumn(1).width = 35;
    ws.getColumn(2).width = 15;

    let row = 4;
    ws.getCell(`A${row}`).value = "Metric";
    ws.getCell(`B${row}`).value = "Value";
    ws.getCell(`A${row}`).font = { bold: true };
    ws.getCell(`B${row}`).font = { bold: true };
    row++;
    STAT_CONFIG.forEach((cfg) => {
      ws.getCell(`A${row}`).value = cfg.label;
      ws.getCell(`B${row}`).value = activeReport.stats[cfg.key];
      row++;
    });

    row++;
    ws.getCell(`A${row}`).value = "Recurring Activities";
    ws.getCell(`A${row}`).font = { bold: true };
    row++;
    activeReport.recurringActivities.forEach((ra) => {
      ws.getCell(`A${row}`).value = ra.name;
      ws.getCell(`B${row}`).value = `${ra.status.toUpperCase()}${ra.note ? " — " + ra.note : ""}`;
      row++;
    });

    row++;
    ws.getCell(`A${row}`).value = "Narrative";
    ws.getCell(`A${row}`).font = { bold: true };
    row++;
    ws.getCell(`A${row}`).value = "Urgent / Needs Attention";
    ws.getCell(`B${row}`).value = activeReport.urgentItems || "—";
    row++;
    ws.getCell(`A${row}`).value = "New Issues Identified";
    ws.getCell(`B${row}`).value = activeReport.newIssues || "—";
    row++;
    ws.getCell(`A${row}`).value = "Next Period Priorities";
    ws.getCell(`B${row}`).value = activeReport.nextPriorities || "—";
    row++;
    ws.getCell(`A${row}`).value = "Vendor & Finance";
    ws.getCell(`A${row}`).font = { bold: true };
    row++;
    ws.getCell(`A${row}`).value = "Invoices Retrieved";
    ws.getCell(`B${row}`).value = activeReport.invoicesRetrieved || "—";
    row++;
    ws.getCell(`A${row}`).value = "Approvals Pending";
    ws.getCell(`B${row}`).value = activeReport.approvalsPending || "—";
    row += 2;
    ws.getCell(`A${row}`).value = `Prepared by: Ajose Enijeshiku | Position: Facility Manager`;
    row++;
    ws.getCell(`A${row}`).value = `location: konga Ogba Facility`;
    row++;
    ws.getCell(`A${row}`).value = `Date: ${new Date(activeReport.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`;

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeReport.periodType}_Report_${activeReport.periodStart}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateField = useCallback((field: keyof OperationalReport, value: string) => {
    if (!activeReport) return;
    const updated = { ...activeReport, [field]: value };
    setActiveReport(updated);
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      saveReport(updated);
      setReports(getReports());
    }, 600);
  }, [activeReport]);

  const updateActivityStatus = (id: string, status: RecurringActivityEntry["status"]) => {
    if (!activeReport) return;
    const activities = activeReport.recurringActivities.map((a) =>
      a.id === id ? { ...a, status } : a
    );
    const updated = { ...activeReport, recurringActivities: activities };
    setActiveReport(updated);
    saveReport(updated);
    setReports(getReports());
  };

  const updateActivityNote = (id: string, note: string) => {
    if (!activeReport) return;
    const activities = activeReport.recurringActivities.map((a) =>
      a.id === id ? { ...a, note } : a
    );
    const updated = { ...activeReport, recurringActivities: activities };
    setActiveReport(updated);
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      saveReport(updated);
      setReports(getReports());
    }, 600);
  };

  const printTitle = activeReport
    ? `${activeReport.periodType === "Weekly" ? "WEEKLY" : "MONTHLY"} REPORT`
    : "OPERATIONAL REPORT";

  const filtered = reports.filter((r) => {
    if (typeFilter !== "all" && r.periodType !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.periodStart.includes(search)) return false;
    return true;
  });

  const draftCount = reports.filter((r) => r.status === "Draft").length;
  const finalCount = reports.filter((r) => r.status === "Final").length;

  const periodIcons: Record<string, React.ElementType> = {
    Weekly: Calendar,
    Monthly: BarChart3,
  };

  const periodColors: Record<string, string> = {
    Weekly: "var(--color-info)",
    Monthly: "var(--color-primary)",
  };

  // ── DETAIL VIEW ──
  if (activeReport) {
    return (
      <div className="space-y-6">
        <style>{`
          @media print {
            .no-print, .no-print * { display: none !important; }
            body, .report-content { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .report-content * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            .report-content .print-card { break-inside: avoid; page-break-inside: avoid; }
            .report-content .print-card .bg-info\\/10,
            .report-content .print-card .bg-destructive\\/10,
            .report-content .print-card .bg-primary\\/10,
            .report-content .print-card .bg-success\\/10,
            .report-content .print-card .bg-warning\\/10,
            .report-content .print-card .bg-muted-foreground\\/10 { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
            @page { size: A4; margin: 10mm; }
          }
        `}</style>

        <div className="no-print flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-input text-text-tertiary" onClick={handleBack}>
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{printTitle}</h1>
              <p className="text-sm text-secondary-foreground">{activeReport.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "text-xs px-3 py-1",
              activeReport.status === "Final"
                ? "bg-success/10 text-success border-success/20"
                : "bg-muted-foreground/10 text-text-tertiary border-border/20"
            )}>
              {activeReport.status === "Final" ? "✓ Final" : "Draft"}
            </Badge>
            <Button variant="outline" size="sm" className="gap-1.5 border-input text-text-tertiary" onClick={handleSave}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </Button>
            {activeReport.status === "Draft" && (
              <Button size="sm" className="gap-1.5 bg-success text-success-foreground hover:bg-success/90" onClick={handleFinalize}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark Final
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1.5 border-input text-text-tertiary" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" /> Print (A4)
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 border-input text-text-tertiary" onClick={handleExportPDF}>
              <FileText className="h-3.5 w-3.5 text-destructive" /> PDF (A4)
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 border-input text-text-tertiary" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-3.5 w-3.5 text-success" /> Excel
            </Button>
          </div>
        </div>

        <div ref={reportContentRef} className="report-content space-y-8">
          {/* HEADER */}
          <div className="text-center border-b border-border pb-6">
            <h1 className="text-2xl font-bold text-foreground">FixFlow</h1>
            <p className="text-lg text-secondary-foreground mt-1">{printTitle}</p>
            <p className="text-sm text-text-tertiary mt-2">
              {formatDate(activeReport.periodStart)} — {formatDate(activeReport.periodEnd)}
            </p>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-text-tertiary">
              <span>Ref: {activeReport.id}</span>
              <span>Generated: {formatDate(activeReport.createdAt)}</span>
            </div>
          </div>

          {/* SECTION A: LIVE STATS SUMMARY */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" />
              Section A — Live Operations Summary
            </h2>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {STAT_CONFIG.map((cfg) => {
                const val = activeReport.stats[cfg.key];
                const Icon = cfg.icon;
                const link = STAT_LINKS[cfg.key];
                return (
                  <a key={cfg.key} href={link} target="_blank" rel="noopener noreferrer" className="block">
                    <Card className="print-card border-border bg-card hover:bg-card-alt transition-colors cursor-pointer">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", STAT_COLOR_MAP[cfg.color])}>
                          <Icon className={cn("h-4 w-4", cfg.color)} />
                        </div>
                        <div className="min-w-0">
                          <p className={cn("text-lg font-bold", cfg.color)}>{val}</p>
                          <p className="text-[10px] text-text-tertiary truncate">{cfg.label}</p>
                        </div>
                        <ExternalLink className="h-3 w-3 text-text-subtle ml-auto shrink-0 print:hidden" />
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
            {/* Print-only stat table */}
            <div className="hidden print:block">
              <table className="w-full text-xs mt-2">
                <thead>
                  <tr className="border-b border-gray-300 text-left">
                    <th className="py-1 pr-2 font-medium">Metric</th>
                    <th className="py-1 font-medium text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {STAT_CONFIG.map((cfg) => (
                    <tr key={cfg.key} className="border-b border-gray-100">
                      <td className="py-1 pr-2">{cfg.label}</td>
                      <td className="py-1 text-right font-semibold">{activeReport.stats[cfg.key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECURRING ACTIVITIES */}
          <Card className="print-card border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                Recurring Activities Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {activeReport.recurringActivities.map((ra) => {
                  const pill = STATUS_PILLS[ra.status];
                  const isExpanded = expandedActivity === ra.id;
                  return (
                    <div key={ra.id} className="relative border border-border rounded-lg p-2.5 hover:bg-card-alt transition-colors cursor-pointer">
                      <button
                        onClick={() => setExpandedActivity(isExpanded ? null : ra.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-foreground leading-tight">{ra.name}</span>
                          <span className={cn("shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium", pill.color)}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {ra.status.charAt(0).toUpperCase() + ra.status.slice(1)}
                          </span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="no-print mt-2.5 pt-2.5 border-t border-border space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-tertiary">Status:</span>
                            <select
                              value={ra.status}
                              onChange={(e) => updateActivityStatus(ra.id, e.target.value as any)}
                              className="text-xs border border-border rounded px-2 py-1 bg-card text-foreground"
                            >
                              <option value="ok">OK</option>
                              <option value="attention">Needs Attention</option>
                              <option value="overdue">Overdue</option>
                              <option value="pending">Pending</option>
                            </select>
                          </div>
                          <Textarea
                            placeholder="Add a note..."
                            value={ra.note}
                            onChange={(e) => updateActivityNote(ra.id, e.target.value)}
                            className="min-h-[50px] text-xs"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* SECTION C: NARRATIVE */}
          <Card className="print-card border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-primary" />
                Section C — This Period's Narrative
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-text-tertiary">Urgent / Needs Attention This Period</Label>
                <Textarea
                  value={activeReport.urgentItems}
                  onChange={(e) => updateField("urgentItems", e.target.value)}
                  placeholder="Anything needing sign-off, escalation, or not captured by stat cards..."
                  className="min-h-[80px] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-text-tertiary">New Issues Identified</Label>
                <Textarea
                  value={activeReport.newIssues}
                  onChange={(e) => updateField("newIssues", e.target.value)}
                  placeholder="New issues found during this period..."
                  className="min-h-[80px] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-text-tertiary">Next Period Priorities</Label>
                <Textarea
                  value={activeReport.nextPriorities}
                  onChange={(e) => updateField("nextPriorities", e.target.value)}
                  placeholder="Key priorities for the coming period..."
                  className="min-h-[80px] text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* SECTION D: VENDOR / FINANCE NOTES */}
          <Card className="print-card border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                Section D — Vendor & Finance Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-text-tertiary">Invoices Retrieved This Period</Label>
                <Textarea
                  value={activeReport.invoicesRetrieved}
                  onChange={(e) => updateField("invoicesRetrieved", e.target.value)}
                  placeholder="List vendor names with invoices retrieved..."
                  className="min-h-[60px] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-text-tertiary">Approvals Pending (Head of Admin / COO)</Label>
                <Textarea
                  value={activeReport.approvalsPending}
                  onChange={(e) => updateField("approvalsPending", e.target.value)}
                  placeholder="List approvals awaiting sign-off..."
                  className="min-h-[60px] text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* FOOTER */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-text-tertiary">Prepared by: Ajose Enijeshiku | Position: Facility Manager</p>
            <p className="text-sm text-text-tertiary">location: konga Ogba Facility</p>
            <p className="text-sm text-text-tertiary">Date: {formatDate(activeReport.createdAt)}</p>
          </div>

          <CommentSection
            itemType="report"
            itemId={activeReport.id}
            uplineManagerLinkId={commentLinkId}
            isAjose={true}
            currentUserName="Ajose"
          />
        </div>
      </div>
    );
  }

  // ── LIST VIEW (BUDGET DESIGN) ──
  return (
    <div className="weekly-report-list space-y-6">
      <style>{`
        .weekly-report-list {
          --color-background: #F3F4F6;
          --color-foreground: #111827;
          --color-card: #FFFFFF;
          --color-card-foreground: #111827;
          --color-card-alt: #F9FAFB;
          --color-border: #E5E7EB;
          --color-muted: #F3F4F6;
          --color-muted-foreground: #6B7280;
          --color-text-secondary: #4B5563;
          --color-text-muted: #6B7280;
          --color-text-tertiary: #6B7280;
          --color-text-subtle: #D1D5DB;
          --color-success: #16A34A;
          --color-destructive: #DC2626;
          --color-primary: #D4AF37;
          --color-primary-foreground: #000000;
          --color-card-hover: #F3F4F6;
          --color-info: #3B82F6;
          --color-warning: #F59E0B;
          --color-purple: #8B5CF6;
        }
        .weekly-report-list .filter-btn:hover {
          background: var(--color-muted) !important;
          color: var(--color-foreground) !important;
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium"
          style={{
            background: toast.type === "success" ? "rgba(22, 163, 74, 0.1)" : toast.type === "error" ? "rgba(220, 38, 38, 0.1)" : "rgba(59, 130, 246, 0.1)",
            borderColor: toast.type === "success" ? "rgba(22, 163, 74, 0.3)" : toast.type === "error" ? "rgba(220, 38, 38, 0.3)" : "rgba(59, 130, 246, 0.3)",
            color: toast.type === "success" ? "var(--color-success)" : toast.type === "error" ? "var(--color-destructive)" : "var(--color-info)",
          }}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.message}
        </motion.div>
      )}

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operational Reports</h1>
          <p className="text-sm text-text-tertiary">Weekly & monthly operational summaries with live stats</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-card to-card-alt rounded-xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-text-tertiary text-xs">Total Reports</p>
              <p className="text-foreground text-xl font-bold">{reports.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-text-muted">All periods</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-card to-card-alt rounded-xl p-5 border border-border">
          <p className="text-text-tertiary text-xs">Draft</p>
          <p className="text-2xl font-bold text-foreground mt-1">{draftCount}</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock size={12} className="text-warning" />
            <span className="text-text-muted text-xs">Awaiting finalization</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-card to-card-alt rounded-xl p-5 border border-border">
          <p className="text-text-tertiary text-xs">Finalized</p>
          <p className="text-2xl font-bold text-foreground mt-1">{finalCount}</p>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle2 size={12} className="text-success" />
            <span className="text-text-muted text-xs">Completed reports</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-card to-card-alt rounded-xl p-5 border border-border">
          <p className="text-text-tertiary text-xs">Current Period</p>
          <p className="text-lg font-bold text-foreground mt-1">{periodType}</p>
          <p className="text-text-muted text-xs mt-1">{formatShort(periodStart)} — {formatShort(periodEnd)}</p>
        </div>
      </div>

      {/* QUICK CREATE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(["Weekly", "Monthly"] as const).map((type) => {
          const Icon = periodIcons[type];
          const color = periodColors[type];
          const count = reports.filter((r) => r.periodType === type).length;
          return (
            <button key={type} onClick={() => { setPeriodType(type); setCreateOpen(true); }}
              className="relative group bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold text-sm">New {type} Report</h3>
                  <p className="text-text-tertiary text-xs">{count} report{count !== 1 ? "s" : ""} · Current {type.toLowerCase()} period</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={12} /> Create {type.toLowerCase()} report
              </div>
            </button>
          );
        })}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports by title or date..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card-alt border border-border text-foreground text-sm placeholder:text-text-muted outline-none focus:border-primary/50 transition-colors" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "all" | "Weekly" | "Monthly")}
          className="h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50">
          <option value="all">All Types</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "Draft" | "Final")}
          className="h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm outline-none focus:border-primary/50">
          <option value="all">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Final">Final</option>
        </select>
        <button onClick={() => { setReports(getReports()); }}
          className="h-10 px-3 rounded-lg bg-card-alt border border-border text-foreground text-sm hover:bg-muted transition-colors flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* REPORT LIST */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <FileSpreadsheet size={40} className="mx-auto text-text-subtle mb-3" />
          <p className="text-foreground font-medium">No operational reports found</p>
          <p className="text-text-tertiary text-sm mt-1">Create your first report using the buttons above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report, i) => {
            const PeriodIcon = periodIcons[report.periodType];
            const periodColor = periodColors[report.periodType];
            const isFinal = report.status === "Final";

            return (
              <motion.div key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${periodColor}15` }}>
                      <PeriodIcon size={20} style={{ color: periodColor }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-foreground font-semibold text-sm truncate">{report.title}</h3>
                        <Badge className={cn(
                          "text-[10px] shrink-0",
                          isFinal
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-muted-foreground/10 text-text-tertiary border-border/20"
                        )}>
                          {isFinal ? "✓ Final" : "Draft"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-tertiary mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-primary" />
                          {formatShort(report.periodStart)} — {formatShort(report.periodEnd)}
                        </span>
                        <span>|</span>
                        <span>{report.periodType}</span>
                        <span>|</span>
                        <span>Ref: {report.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleOpen(report)}
                      className="h-8 px-3 rounded-lg bg-muted text-foreground text-xs hover:bg-card-hover transition-colors flex items-center gap-1.5">
                      <Eye size={12} /> View
                    </button>
                    <button onClick={() => handleDelete(report.id)}
                      className="h-8 w-8 rounded-lg bg-muted text-text-subtle hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-input sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Create Operational Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground text-xs">Period Type</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriodType("Weekly")}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                    periodType === "Weekly"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-card-alt"
                  )}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setPeriodType("Monthly")}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                    periodType === "Monthly"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-card-alt"
                  )}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground text-xs">Start</Label>
                <Input type="date" value={periodStart} readOnly className="border-border bg-card text-foreground text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground text-xs">End</Label>
                <Input type="date" value={periodEnd} readOnly className="border-border bg-card text-foreground text-sm" />
              </div>
            </div>
            {liveStats && (
              <div className="p-3 rounded-lg bg-background/50 border border-border space-y-1">
                <p className="text-xs text-text-tertiary font-medium">Live Stats Preview</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {STAT_CONFIG.map((cfg) => (
                    <div key={cfg.key} className="flex items-center gap-1">
                      <span className="text-text-tertiary">{cfg.label}:</span>
                      <span className="font-semibold text-foreground">{liveStats[cfg.key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={handleCreate}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <FileSpreadsheet size={14} /> Generate Report
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
