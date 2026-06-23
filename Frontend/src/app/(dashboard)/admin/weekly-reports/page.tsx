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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import CommentSection from "@/components/comments/CommentSection";
import {
  Plus, Eye, Trash2, Printer, Save, CheckCircle2,
  AlertTriangle, FileSpreadsheet, ArrowUp, ArrowDown, Minus,
  Calendar, Wrench, Zap, Lightbulb, ListTodo, ClipboardList,
  ClipboardCheck, AlertCircle, Loader2, ExternalLink, ChevronDown, ChevronUp, FileText,
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
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this report?")) {
      deleteReport(id);
      setReports(getReports());
      if (activeReport?.id === id) setActiveReport(null);
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

    // Stats
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
            .report-content .print-card .bg-info\/10,
            .report-content .print-card .bg-destructive\/10,
            .report-content .print-card .bg-primary\/10,
            .report-content .print-card .bg-success\/10,
            .report-content .print-card .bg-warning\/10,
            .report-content .print-card .bg-muted-foreground\/10 { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
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

  // ── LIST VIEW (ARCHIVE) ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operational Reports</h1>
          <p className="text-secondary-foreground">Weekly & monthly operational summaries with live stats</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-input">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create Operational Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Period Type</Label>
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
                  <Label className="text-foreground">Start</Label>
                  <Input type="date" value={periodStart} readOnly className="border-border bg-card text-foreground" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">End</Label>
                  <Input type="date" value={periodEnd} readOnly className="border-border bg-card text-foreground" />
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
              <Button onClick={handleCreate} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <FileSpreadsheet className="h-4 w-4" /> Generate Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No operational reports yet</p>
              <p className="text-xs mt-1">Create your first report above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-tertiary text-xs uppercase">
                    <th className="text-left py-3 px-4 font-medium">Period</th>
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-card-alt hover:bg-card-alt transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span className="text-foreground text-xs">
                            {formatShort(r.periodStart)} — {formatShort(r.periodEnd)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground text-xs max-w-[200px] truncate">{r.title}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {r.periodType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-text-tertiary text-xs">{formatDate(r.createdAt)}</td>
                      <td className="py-3 px-4">
                        <Badge className={cn(
                          "text-[10px]",
                          r.status === "Final"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-muted-foreground/10 text-text-tertiary border-border/20"
                        )}>
                          {r.status === "Final" ? "✓ Final" : "Draft"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-text-subtle hover:text-foreground" onClick={() => handleOpen(r)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-text-subtle hover:text-destructive" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
