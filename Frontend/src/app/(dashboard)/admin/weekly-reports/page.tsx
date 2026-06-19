"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Eye,
  Trash2,
  Printer,
  Download,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  Minus,
  User,
  Calendar,
  Building2,
  Wrench,
  Zap,
  Lightbulb,
  Flag,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getWeeklyReports,
  createWeeklyReport,
  saveWeeklyReport,
  deleteWeeklyReport,
  autoCalculateWorkOrders,
  autoCalculateMaintenance,
  autoCalculateFaults,
  autoCalculateUtilities,
  getWorkOrdersForWeek,
  getPMTasksForWeek,
  getFaultsForWeek,
  type WeeklyReport,
  type StaffAttendanceSummary,
  type ActionItem,
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function formatShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

function getAttendanceColor(pct: number): string {
  if (pct >= 90) return "text-success";
  if (pct >= 70) return "text-primary";
  return "text-destructive";
}

function getPriorityColor(p: string): string {
  switch (p) {
    case "critical": return "text-destructive bg-destructive/10 border-destructive/20";
    case "high": return "text-warning bg-warning/10 border-warning/20";
    case "medium": return "text-primary bg-primary/10 border-primary/20";
    default: return "text-success bg-success/10 border-success/20";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
    case "VERIFIED":
    case "RESOLVED":
    case "Completed":
      return <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Completed</Badge>;
    case "IN_PROGRESS":
    case "ASSIGNED":
    case "ACKNOWLEDGED":
      return <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">In Progress</Badge>;
    case "OPEN":
    case "REPORTED":
      return <Badge className="bg-info/10 text-info border-info/20 text-[10px]">Open</Badge>;
    case "Overdue":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Overdue</Badge>;
    default:
      return <Badge className="bg-muted-foreground text-foreground text-[10px]">{status}</Badge>;
  }
}

export default function WeeklyReportsPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [activeReport, setActiveReport] = useState<WeeklyReport | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [weekEnd, setWeekEnd] = useState(addDays(getMonday(new Date()), 6));
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newAction, setNewAction] = useState<{ description: string; responsible: string; dueDate: string; priority: "low" | "medium" | "high" }>({ description: "", responsible: "", dueDate: "", priority: "medium" });

  useEffect(() => {
    setReports(getWeeklyReports());
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "weekly-report-print-styles";
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        .report-printable, .report-printable * { visibility: visible; }
        .report-printable {
          position: absolute; left: 0; top: 0;
          width: 100%; background: white !important; color: black !important; padding: 40px;
        }
        .no-print { display: none !important; }
        nav, aside, header, [class*="sidebar"], [class*="navbar"], [class*="nav"], [class*="DashboardShell"] > div:first-child, [class*="dashboard-shell"] aside { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById("weekly-report-print-styles")?.remove(); };
  }, []);

  function computeAttendanceLocally(ws: string, we: string): StaffAttendanceSummary[] {
    try {
      const attData = JSON.parse(localStorage.getItem("fixflow-attendance") || "[]");
      const qrData = JSON.parse(localStorage.getItem("fixflow-qr-attendance") || "[]");
      const allRecords = [...attData, ...qrData];

      const start = new Date(ws);
      const end = new Date(we);
      end.setHours(23, 59, 59, 999);
      const workingDays: string[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) workingDays.push(d.toISOString().split("T")[0]);
      }

      const staffMap = new Map<string, { name: string; records: any[] }>();
      for (const r of allRecords) {
        const d = (r.date || "").split("T")[0];
        if (!d || d < ws || d > we) continue;
        const key = r.staffName || r.staffId || `staff-${Math.random()}`;
        if (!staffMap.has(key)) staffMap.set(key, { name: r.staffName || key, records: [] });
        staffMap.get(key)!.records.push(r);
      }

      const result: StaffAttendanceSummary[] = [];
      for (const [, data] of staffMap) {
        let present = 0;
        let late = 0;
        let totalHours = 0;
        const dayStatuses = new Map<string, "present" | "late">();

        for (const r of data.records) {
          const day = (r.date || "").split("T")[0];
          const clockIn = r.clockIn || "";
          const clockOut = r.clockOut || "";

          if (clockIn && clockOut) {
            const diff = (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 3600000;
            if (diff > 0 && diff < 24) totalHours += diff;
          } else if (r.hoursWorked) {
            totalHours += r.hoursWorked;
          }

          if (clockIn) {
            const h = new Date(clockIn).getHours();
            const m = new Date(clockIn).getMinutes();
            if (h > 8 || (h === 8 && m > 0)) { dayStatuses.set(day, "late"); }
            else if (!dayStatuses.has(day)) { dayStatuses.set(day, "present"); }
          } else if (r.status === "present" && !dayStatuses.has(day)) {
            dayStatuses.set(day, "present");
          } else if (r.status === "late" && !dayStatuses.has(day)) {
            dayStatuses.set(day, "late");
          }
        }

        for (const [, status] of dayStatuses) {
          if (status === "present") present++;
          else if (status === "late") late++;
        }

        const accounted = present + late;
        const absent = workingDays.length - accounted;
        const pct = workingDays.length > 0 ? Math.round((accounted / workingDays.length) * 100) : 0;

        result.push({
          staffId: data.records[0].staffId || data.name,
          staffName: data.name,
          role: "Staff",
          present,
          late,
          absent: Math.max(0, absent),
          totalDays: workingDays.length,
          totalHours: Math.round(totalHours * 10) / 10,
          attendancePercent: pct,
        });
      }

      if (result.length === 0 && workingDays.length > 0) {
        result.push({
          staffId: "default", staffName: "No staff data found", role: "Staff",
          present: 0, late: 0, absent: workingDays.length,
          totalDays: workingDays.length, totalHours: 0, attendancePercent: 0,
        });
      }

      return result;
    } catch {
      return [];
    }
  }

  const handleCreate = () => {
    const report = createWeeklyReport(weekStart, weekEnd, "Admin");
    report.attendanceSummary = computeAttendanceLocally(weekStart, weekEnd);
    report.maintenanceSummary = autoCalculateMaintenance(weekStart, weekEnd);
    report.workOrderSummary = autoCalculateWorkOrders(weekStart, weekEnd);
    report.faultSummary = autoCalculateFaults(weekStart, weekEnd);
    report.utilitySummary = autoCalculateUtilities(weekStart, weekEnd);
    saveWeeklyReport(report);
    setReports(getWeeklyReports());
    setActiveReport(report);
    setActionItems(report.actionItems);
    setCreateOpen(false);
  };

  const handleOpen = (report: WeeklyReport) => {
    setActiveReport({ ...report });
    setActionItems(report.actionItems);
  };

  const handleSave = () => {
    if (!activeReport) return;
    const updated: WeeklyReport = {
      ...activeReport,
      actionItems,
      attendanceSummary: computeAttendanceLocally(activeReport.weekStart, activeReport.weekEnd),
      maintenanceSummary: autoCalculateMaintenance(activeReport.weekStart, activeReport.weekEnd),
      workOrderSummary: autoCalculateWorkOrders(activeReport.weekStart, activeReport.weekEnd),
      faultSummary: autoCalculateFaults(activeReport.weekStart, activeReport.weekEnd),
      utilitySummary: autoCalculateUtilities(activeReport.weekStart, activeReport.weekEnd),
    };
    saveWeeklyReport(updated);
    setActiveReport(updated);
    setReports(getWeeklyReports());
  };

  const handleFinalize = () => {
    if (!activeReport) return;
    const updated = { ...activeReport, status: "Final" as const };
    saveWeeklyReport(updated);
    setActiveReport(updated);
    setReports(getWeeklyReports());
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this report?")) {
      deleteWeeklyReport(id);
      setReports(getWeeklyReports());
      if (activeReport?.id === id) setActiveReport(null);
    }
  };

  const handleBack = () => setActiveReport(null);

  const handleAddAction = () => {
    if (!newAction.description.trim()) return;
    const item: ActionItem = {
      id: `AI-${Date.now()}`,
      ...newAction,
    };
    setActionItems([...actionItems, item]);
    setNewAction({ description: "", responsible: "", dueDate: "", priority: "medium" });
  };

  const handleRemoveAction = (id: string) => {
    setActionItems(actionItems.filter((a) => a.id !== id));
  };

  const handlePrint = () => window.print();

  const avgAttendance = activeReport
    ? activeReport.attendanceSummary.length > 0
      ? Math.round(
          activeReport.attendanceSummary.reduce((sum, s) => sum + s.attendancePercent, 0) /
            activeReport.attendanceSummary.length
        )
      : 0
    : 0;

  if (activeReport) {
    const weekOrders = getWorkOrdersForWeek(activeReport.weekStart, activeReport.weekEnd);
    const weekPMs = getPMTasksForWeek(activeReport.weekStart, activeReport.weekEnd);
    const weekFaults = getFaultsForWeek(activeReport.weekStart, activeReport.weekEnd);

    return (
      <div className="space-y-6">
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; color: black !important; }
            .report-content { background: white !important; color: black !important; padding: 20px !important; }
            .print-card { border: 1px solid #ddd !important; background: white !important; }
            .print-card .text-foreground { color: black !important; }
            .print-card .text-text-tertiary { color: var(--color-text-tertiary) !important; }
            .print-card .text-text-tertiary { color: #555 !important; }
            .print-card .text-secondary-foreground { color: #555 !important; }
            .print-card { page-break-inside: avoid; }
            h1, h2, h3 { page-break-after: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            input, textarea, select {
              background-color: white !important;
              color: black !important;
              border: 1px solid #999 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page { margin: 20mm; }
          }
        `}</style>

        <div className="no-print flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-input text-text-tertiary" onClick={handleBack}>
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Weekly Report</h1>
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
              <Save className="h-3.5 w-3.5" /> Save as Draft
            </Button>
            {activeReport.status === "Draft" && (
              <Button size="sm" className="gap-1.5 bg-success text-success-foreground hover:bg-success/90" onClick={handleFinalize}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Final
              </Button>
            )}
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" /> Export Report
            </Button>
          </div>
        </div>

        <div className="report-printable">
          <div className="report-content space-y-8">
          <div className="text-center border-b border-border pb-6 no-print:border-border print:border-gray-300">
            <h1 className="text-2xl font-bold text-foreground print:text-black">FixFlow</h1>
            <p className="text-lg text-secondary-foreground print:text-gray-600 mt-1">Weekly Facility Management Report</p>
            <p className="text-sm text-text-tertiary mt-2">
              {formatDate(activeReport.weekStart)} — {formatDate(activeReport.weekEnd)}
            </p>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-text-tertiary">
              <span>Ref: {activeReport.id}</span>
              <span>Prepared: {formatDate(activeReport.preparedAt)}</span>
              <span>By: {activeReport.preparedBy}</span>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="print-card border-border bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{avgAttendance}%</p>
                  <p className="text-xs text-text-tertiary">Staff Attendance Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card className="print-card border-border bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeReport.workOrderSummary.completed}</p>
                  <p className="text-xs text-text-tertiary">Work Orders Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="print-card border-border bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeReport.maintenanceSummary.completed}</p>
                  <p className="text-xs text-text-tertiary">PM Tasks Done</p>
                </div>
              </CardContent>
            </Card>
            <Card className="print-card border-border bg-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{activeReport.faultSummary.pending}</p>
                  <p className="text-xs text-text-tertiary">Open Faults</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="print-card border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Staff Attendance Summary
              </CardTitle>
              <p className="text-xs text-text-tertiary">Week of {formatShort(activeReport.weekStart)} — {formatShort(activeReport.weekEnd)} — Auto-calculated from attendance records</p>
            </CardHeader>
            <CardContent>
              {activeReport.attendanceSummary.length === 0 ? (
                <p className="text-center text-sm text-text-tertiary py-4">No attendance data for this week</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-text-tertiary text-xs uppercase">
                        <th className="text-left py-2 px-2 font-medium">Staff Name</th>
                        <th className="text-left py-2 px-2 font-medium">Role</th>
                        <th className="text-center py-2 px-2 font-medium">Present</th>
                        <th className="text-center py-2 px-2 font-medium">Late</th>
                        <th className="text-center py-2 px-2 font-medium">Absent</th>
                        <th className="text-center py-2 px-2 font-medium">Total Days</th>
                        <th className="text-center py-2 px-2 font-medium">Hours</th>
                        <th className="text-center py-2 px-2 font-medium">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeReport.attendanceSummary.map((s, i) => (
                        <tr key={s.staffId} className="border-b border-card-alt">
                          <td className="py-2 px-2 text-foreground">{s.staffName}</td>
                          <td className="py-2 px-2 text-text-tertiary">{s.role}</td>
                          <td className="py-2 px-2 text-center text-success">{s.present}</td>
                          <td className="py-2 px-2 text-center text-primary">{s.late}</td>
                          <td className="py-2 px-2 text-center text-destructive">{s.absent}</td>
                          <td className="py-2 px-2 text-center text-text-tertiary">{s.totalDays}</td>
                          <td className="py-2 px-2 text-center text-text-tertiary">{s.totalHours.toFixed(1)}</td>
                          <td className={cn("py-2 px-2 text-center font-medium", getAttendanceColor(s.attendancePercent))}>
                            {s.attendancePercent}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-input">
                        <td className="py-2 px-2 text-foreground font-medium" colSpan={7}>Average Attendance</td>
                        <td className={cn("py-2 px-2 text-center font-bold", getAttendanceColor(avgAttendance))}>
                          {avgAttendance}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              <p className="text-xs text-text-tertiary mt-3">Working hours: 8:00 AM — 5:00 PM | Late threshold: Clock-in after 8:00 AM</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="print-card border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Preventive Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className="text-xl font-bold text-foreground">{activeReport.maintenanceSummary.scheduled}</p>
                    <p className="text-[10px] text-text-tertiary">Scheduled</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className="text-xl font-bold text-success">{activeReport.maintenanceSummary.completed}</p>
                    <p className="text-[10px] text-text-tertiary">Completed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className="text-xl font-bold text-primary">{activeReport.maintenanceSummary.completionRate}%</p>
                    <p className="text-[10px] text-text-tertiary">Completion Rate</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className={cn("text-xl font-bold", activeReport.maintenanceSummary.overdue > 0 ? "text-destructive" : "text-success")}>
                      {activeReport.maintenanceSummary.overdue}
                    </p>
                    <p className="text-[10px] text-text-tertiary">Overdue</p>
                  </div>
                </div>

                {weekPMs.length > 0 && (
                  <div>
                    <p className="text-xs text-text-tertiary mb-2 font-medium uppercase">PM Tasks Completed This Week</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-text-tertiary">
                            <th className="text-left py-1.5 pr-2 font-medium">Asset</th>
                            <th className="text-left py-1.5 pr-2 font-medium">Task</th>
                            <th className="text-left py-1.5 pr-2 font-medium">Done By</th>
                            <th className="text-left py-1.5 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weekPMs.filter((t) => t.status === "Completed").map((t) => (
                            <tr key={t.id} className="border-b border-card-alt">
                              <td className="py-1.5 pr-2 text-foreground">{t.asset}</td>
                              <td className="py-1.5 pr-2 text-text-tertiary">{t.task}</td>
                              <td className="py-1.5 pr-2 text-text-tertiary">{t.responsible}</td>
                              <td className="py-1.5">{getStatusBadge(t.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-text-tertiary">Additional Maintenance Notes</Label>
                  <Textarea
                    value={activeReport.maintenanceNotes}
                    onChange={(e) => setActiveReport({ ...activeReport, maintenanceNotes: e.target.value })}
                    placeholder="Describe any additional maintenance work carried out this week..."
                    className="mt-1 border-border bg-card text-foreground text-xs placeholder:text-text-tertiary min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="print-card border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Work Orders Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className="text-lg font-bold text-foreground">{activeReport.workOrderSummary.opened}</p>
                    <p className="text-[10px] text-text-tertiary">Opened</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className="text-lg font-bold text-success">{activeReport.workOrderSummary.completed}</p>
                    <p className="text-[10px] text-text-tertiary">Completed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className="text-lg font-bold text-primary">{activeReport.workOrderSummary.inProgress}</p>
                    <p className="text-[10px] text-text-tertiary">In Progress</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className={cn("text-lg font-bold", activeReport.workOrderSummary.overdue > 0 ? "text-destructive" : "text-success")}>
                      {activeReport.workOrderSummary.overdue}
                    </p>
                    <p className="text-[10px] text-text-tertiary">Overdue</p>
                  </div>
                </div>

                {weekOrders.length > 0 && (
                  <div>
                    <p className="text-xs text-text-tertiary mb-2 font-medium uppercase">Work Orders This Week</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-text-tertiary">
                            <th className="text-left py-1.5 pr-2 font-medium">WO#</th>
                            <th className="text-left py-1.5 pr-2 font-medium">Title</th>
                            <th className="text-left py-1.5 pr-2 font-medium">Priority</th>
                            <th className="text-left py-1.5 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weekOrders.map((o) => (
                            <tr key={o.id} className="border-b border-card-alt">
                              <td className="py-1.5 pr-2 text-primary font-mono">{o.id}</td>
                              <td className="py-1.5 pr-2 text-foreground">{o.title}</td>
                              <td className="py-1.5 pr-2">
                                <Badge className={cn("text-[10px]", getPriorityColor(o.priority))}>
                                  {o.priority}
                                </Badge>
                              </td>
                              <td className="py-1.5">{getStatusBadge(o.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="print-card border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  Faults & Breakdowns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className="text-xl font-bold text-foreground">{activeReport.faultSummary.reported}</p>
                    <p className="text-[10px] text-text-tertiary">Reported</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className="text-xl font-bold text-success">{activeReport.faultSummary.resolved}</p>
                    <p className="text-[10px] text-text-tertiary">Resolved</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background/50 border border-border text-center">
                    <p className="text-xl font-bold text-warning">{activeReport.faultSummary.pending}</p>
                    <p className="text-[10px] text-text-tertiary">Pending</p>
                  </div>
                </div>

                {weekFaults.length > 0 && (
                  <div>
                    <p className="text-xs text-text-tertiary mb-2 font-medium uppercase">Fault Reports</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-text-tertiary">
                            <th className="text-left py-1.5 pr-2 font-medium">Asset</th>
                            <th className="text-left py-1.5 pr-2 font-medium">Location</th>
                            <th className="text-left py-1.5 pr-2 font-medium">Reported</th>
                            <th className="text-left py-1.5 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weekFaults.map((f) => (
                            <tr key={f.id} className="border-b border-card-alt">
                              <td className="py-1.5 pr-2 text-foreground">{f.assetName}</td>
                              <td className="py-1.5 pr-2 text-text-tertiary">{f.location}</td>
                              <td className="py-1.5 pr-2 text-text-tertiary">{formatShort(f.reportedAt)}</td>
                              <td className="py-1.5">{getStatusBadge(f.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="print-card border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Utilities Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeReport.utilitySummary.length === 0 ? (
                  <p className="text-center text-sm text-text-tertiary py-4">No utility data for this period</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-text-tertiary text-xs uppercase">
                          <th className="text-left py-2 pr-2 font-medium">Category</th>
                          <th className="text-right py-2 pr-2 font-medium">This Week</th>
                          <th className="text-right py-2 pr-2 font-medium">vs Last Week</th>
                          <th className="text-right py-2 font-medium">Variance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeReport.utilitySummary.map((u, i) => (
                          <tr key={i} className="border-b border-card-alt">
                            <td className="py-2 pr-2 text-foreground">{u.category}</td>
                            <td className="py-2 pr-2 text-right text-foreground font-mono">${u.thisWeek.toLocaleString()}</td>
                            <td className="py-2 pr-2 text-right text-foreground font-mono">${u.lastWeek.toLocaleString()}</td>
                            <td className="py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {u.variance > 0 ? (
                                  <ArrowUp className="h-3 w-3 text-destructive" />
                                ) : u.variance < 0 ? (
                                  <ArrowDown className="h-3 w-3 text-success" />
                                ) : (
                                  <Minus className="h-3 w-3 text-text-tertiary" />
                                )}
                                <span className={cn(
                                  "font-mono text-xs",
                                  u.variance > 0 ? "text-destructive" : u.variance < 0 ? "text-success" : "text-text-tertiary"
                                )}>
                                  {u.variance > 0 ? "+" : ""}{u.variance}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="print-card border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-primary" />
                Outstanding Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {actionItems.length === 0 ? (
                <p className="text-sm text-text-tertiary">No action items yet. Add one below.</p>
              ) : (
                <div className="space-y-2">
                  {actionItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-[10px]", getPriorityColor(item.priority))}>
                            {item.priority}
                          </Badge>
                          <span className="text-sm text-foreground font-medium">{item.description}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary">
                          <span>Responsible: {item.responsible}</span>
                          <span>Due: {item.dueDate ? formatDate(item.dueDate) : "—"}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-text-subtle hover:text-destructive"
                        onClick={() => handleRemoveAction(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Description..."
                  value={newAction.description}
                  onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                  className="border-border bg-card text-foreground text-xs placeholder:text-text-tertiary"
                />
                <Input
                  placeholder="Responsible..."
                  value={newAction.responsible}
                  onChange={(e) => setNewAction({ ...newAction, responsible: e.target.value })}
                  className="border-border bg-card text-foreground text-xs placeholder:text-text-tertiary"
                />
                <Input
                  type="date"
                  value={newAction.dueDate}
                  onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                  className="border-border bg-card text-foreground text-xs"
                />
                <div className="flex gap-2">
                  <Select value={newAction.priority} onValueChange={(v: "low" | "medium" | "high") => setNewAction({ ...newAction, priority: v })}>
                    <SelectTrigger className="border-border bg-card text-foreground text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-white">
                      <SelectItem value="low" className="text-black text-xs">Low</SelectItem>
                      <SelectItem value="medium" className="text-black text-xs">Medium</SelectItem>
                      <SelectItem value="high" className="text-black text-xs">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9" onClick={handleAddAction}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="print-card border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Recommendations & Observations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={activeReport.recommendations}
                onChange={(e) => setActiveReport({ ...activeReport, recommendations: e.target.value })}
                placeholder="Enter your recommendations for the coming week..."
                className="border-border bg-card text-foreground text-sm placeholder:text-text-tertiary min-h-[120px]"
              />
            </CardContent>
          </Card>

          <div className="text-center pt-4 border-t border-border no-print:border-border print:border-gray-300">
            <p className="text-sm text-text-tertiary">Prepared by: {activeReport.preparedBy}</p>
            <p className="text-sm text-text-tertiary">Position: Facility Manager</p>
            <p className="text-sm text-text-tertiary">Company: FixFlow</p>
            <p className="text-sm text-text-tertiary">Date: {formatDate(activeReport.preparedAt)}</p>
            <div className="flex justify-center gap-16 mt-4 text-sm text-text-tertiary">
              <div className="text-center">
                <p>____________________</p>
                <p className="mt-1">Prepared By</p>
              </div>
              <div className="text-center">
                <p>____________________</p>
                <p className="mt-1">Approved By</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Weekly Reports</h1>
          <p className="text-secondary-foreground">Auto-generated maintenance and attendance reports</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> + Create New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-input">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create Weekly Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Week Start (Monday)</Label>
                <Input
                  type="date"
                  value={weekStart}
                  onChange={(e) => {
                    setWeekStart(e.target.value);
                    setWeekEnd(addDays(e.target.value, 6));
                  }}
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Week End (Sunday)</Label>
                <Input
                  type="date"
                  value={weekEnd}
                  onChange={(e) => setWeekEnd(e.target.value)}
                  className="border-border bg-card text-foreground"
                />
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border">
                <p className="text-xs text-text-tertiary">Preview</p>
                <p className="text-sm text-foreground mt-1">
                  Weekly FM Report — {formatShort(weekStart)} — {formatShort(weekEnd)}
                </p>
              </div>
              <Button
                onClick={handleCreate}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
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
              <p>No weekly reports yet</p>
              <p className="text-xs mt-1">Create your first report above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-tertiary text-xs uppercase">
                    <th className="text-left py-3 px-4 font-medium">Week</th>
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Prepared By</th>
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
                            {formatShort(r.weekStart)} — {formatShort(r.weekEnd)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground text-xs max-w-[200px] truncate">{r.title}</td>
                      <td className="py-3 px-4 text-text-tertiary text-xs">{r.preparedBy}</td>
                      <td className="py-3 px-4 text-text-tertiary text-xs">{formatDate(r.preparedAt)}</td>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-text-subtle hover:text-foreground"
                            onClick={() => handleOpen(r)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-text-subtle hover:text-destructive"
                            onClick={() => handleDelete(r.id)}
                          >
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
