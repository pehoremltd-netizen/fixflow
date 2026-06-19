"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2, ClipboardList, CheckCircle2, AlertTriangle, ChevronDown,
  Download, FileSpreadsheet, FileText, Calendar, CalendarDays, CalendarRange,
  Archive, MapPin, Clock, User, Wrench, Zap, Droplets, Shield,
  Thermometer, Eye, Maximize, Search, Beaker,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BRAND } from "@/lib/brand";
import {
  type FacilityActivity, type ActivityFrequency, type ActivityStatus, type FacilitySection,
  getActivities, updateActivityStatus, updateActivityNotes, updateActivityVendor,
  getActivitiesBySection, getActivityCounts, getSections,
} from "@/lib/store/facility-operations";

const FREQUENCY_ICONS: Record<ActivityFrequency, typeof Calendar> = {
  Daily: Calendar,
  Weekly: CalendarDays,
  Monthly: CalendarRange,
  Quarterly: Archive,
};

const FREQUENCY_COLORS: Record<ActivityFrequency, string> = {
  Daily: "bg-info/10 text-info border-info/20",
  Weekly: "bg-primary/10 text-primary border-primary/20",
  Monthly: "bg-success/10 text-success border-success/20",
  Quarterly: "bg-warning/10 text-warning border-warning/20",
};

const STATUS_COLORS: Record<ActivityStatus, string> = {
  Pending: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
  Completed: "bg-success/10 text-success border-success/20",
  Escalated: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getTodayDateStr(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

const VENDOR_OPTIONS = [
  "In-House Team",
  "Hernandez Electrical Services",
  "Watson Plumbing Solutions",
  "Kim HVAC Services",
  "Chen Generator Specialists",
  "Wilson Structural Repairs",
  "Park Elevator Maintenance",
  "Other",
];

const SECTION_ICONS: Record<FacilitySection, typeof Building2> = {
  "Ogba Facility": Building2,
  "Abuja Facility": MapPin,
};

function frequencyLabel(f: ActivityFrequency): string {
  return f === "Daily" ? "Today" : f === "Weekly" ? "This Week" : f === "Monthly" ? "This Month" : "This Quarter";
}

export default function FacilityOperationsPage() {
  const [activities, setActivities] = useState<FacilityActivity[]>([]);
  const [activeSection, setActiveSection] = useState<FacilitySection>("Ogba Facility");
  const [frequencyFilter, setFrequencyFilter] = useState<ActivityFrequency | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [loggingActivity, setLoggingActivity] = useState<string | null>(null);
  const [logNotes, setLogNotes] = useState("");
  const [logVendor, setLogVendor] = useState("");
  const [logName, setLogName] = useState("");

  useEffect(() => {
    setActivities(getActivities());
  }, []);

  const counts = useMemo(() => getActivityCounts(), [activities]);

  const filteredActivities = useMemo(() => {
    let list = activities.filter((a) => a.section === activeSection);
    if (frequencyFilter !== "All") {
      list = list.filter((a) => a.frequency === frequencyFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.tasks.some((t) => t.toLowerCase().includes(q)) ||
          a.vendor.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activities, activeSection, frequencyFilter, searchQuery]);

  const frequencies: ActivityFrequency[] = ["Daily", "Weekly", "Monthly", "Quarterly"];

  function handleStatusChange(id: string, status: ActivityStatus) {
    const updated = updateActivityStatus(id, status, logName || undefined, logNotes || undefined);
    if (updated) {
      setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setLoggingActivity(null);
      setLogNotes("");
      setLogVendor("");
    }
  }

  function handleNotesChange(id: string, notes: string) {
    const updated = updateActivityNotes(id, notes);
    if (updated) setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  function handleVendorChange(id: string, vendor: string) {
    const updated = updateActivityVendor(id, vendor);
    if (updated) setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  function getExportData(freq?: ActivityFrequency): FacilityActivity[] {
    let data = activities;
    if (freq) data = data.filter((a) => a.frequency === freq);
    return data.sort((a, b) => a.section.localeCompare(b.section) || frequencies.indexOf(a.frequency) - frequencies.indexOf(b.frequency));
  }

  // ── Excel Export ──
  async function exportExcel(freq?: ActivityFrequency) {
    const ExcelJS = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    wb.creator = BRAND.appName;
    wb.created = new Date();

    const data = getExportData(freq);
    const sections = [...new Set(data.map((a) => a.section))] as FacilitySection[];
    const label = freq ? `${freq}` : "Master";

    for (const section of sections) {
      const sectionData = data.filter((a) => a.section === section);
      const sheet = wb.addWorksheet(section.substring(0, 31));

      // Column widths
      sheet.getColumn(1).width = 6;
      sheet.getColumn(2).width = 38;
      sheet.getColumn(3).width = 14;
      sheet.getColumn(4).width = 14;
      sheet.getColumn(5).width = 20;
      sheet.getColumn(6).width = 18;
      sheet.getColumn(7).width = 18;
      sheet.getColumn(8).width = 16;
      sheet.getColumn(9).width = 30;

      // Title row
      const titleRow = sheet.addRow([`${section} — ${label} Report`]);
      titleRow.font = { name: "Calibri", size: 14, bold: true, color: { argb: "D4AF37" } };
      sheet.mergeCells(`A1:I1`);
      sheet.addRow([]);

      // Date
      const dateRow = sheet.addRow([`Generated: ${getTodayDateStr()}`]);
      dateRow.font = { name: "Calibri", size: 10, italic: true, color: { argb: "666666" } };
      sheet.mergeCells(`A3:I3`);
      sheet.addRow([]);

      // Header row
      const headers = ["#", "Activity", "Frequency", "Status", "Tasks", "Logged By", "Logged At", "Vendor", "Notes"];
      const headerRow = sheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D4AF37" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = {
          top: { style: "thin" }, bottom: { style: "thin" },
          left: { style: "thin" }, right: { style: "thin" },
        };
      });
      sheet.addRow([]);

      // Data rows
      sectionData.forEach((a, i) => {
        const row = sheet.addRow([
          i + 1,
          a.title,
          a.frequency,
          a.status,
          a.tasks.join("\n"),
          a.loggedBy || "—",
          a.loggedAt ? formatDate(a.loggedAt) : "—",
          a.vendor || "—",
          a.notes || "—",
        ]);
        row.eachCell((cell, colIdx) => {
          cell.border = {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" },
          };
          cell.alignment = { vertical: "top", wrapText: colIdx === 5 || colIdx === 9 };
          if (colIdx === 4) {
            if (a.status === "Completed") cell.font = { color: { argb: "22C55E" } };
            else if (a.status === "Escalated") cell.font = { color: { argb: "EF4444" } };
          }
        });
        row.height = Math.max(20, a.tasks.length * 16);
      });

      // Summary
      sheet.addRow([]);
      const total = sectionData.length;
      const completed = sectionData.filter((a) => a.status === "Completed").length;
      const pending = sectionData.filter((a) => a.status === "Pending").length;
      const escalated = sectionData.filter((a) => a.status === "Escalated").length;
      const summaryRow = sheet.addRow([`Summary — Total: ${total}  |  Completed: ${completed}  |  Pending: ${pending}  |  Escalated: ${escalated}`]);
      summaryRow.font = { name: "Calibri", size: 10, bold: true, color: { argb: "333333" } };
      sheet.mergeCells(`A${sheet.rowCount}:I${sheet.rowCount}`);
    }

    // If no data, add a placeholder sheet
    if (sections.length === 0) {
      const sheet = wb.addWorksheet("Report");
      sheet.addRow(["No data available"]);
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Facility_Ops_${label}_${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── PDF Export ──
  async function exportPDF(freq?: ActivityFrequency) {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const data = getExportData(freq);
    const sections = [...new Set(data.map((a) => a.section))] as FacilitySection[];
    const label = freq ? `${freq}` : "Master";

    const doc = new jsPDF("landscape", "mm", "A4");
    const pageWidth = doc.internal.pageSize.getWidth();

    let currentY = 0;

    for (const section of sections) {
      const sectionData = data.filter((a) => a.section === section);
      if (currentY > 0) doc.addPage();
      currentY = 20;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(212, 175, 55);
      doc.text(`${section} — ${label} Report`, pageWidth / 2, currentY, { align: "center" });
      currentY += 8;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${getTodayDateStr()}  |  ${BRAND.appName}`, pageWidth / 2, currentY, { align: "center" });
      currentY += 12;

      // Table
      const bodyRows = sectionData.map((a, i) => [
        String(i + 1),
        a.title,
        a.frequency,
        a.status,
        a.tasks.join("; "),
        a.loggedBy || "—",
        a.loggedAt ? formatDate(a.loggedAt) : "—",
        a.vendor || "—",
        a.notes || "—",
      ]);

      autoTable(doc, {
        head: [["#", "Activity", "Freq", "Status", "Tasks", "Logged By", "Logged At", "Vendor", "Notes"]],
        body: bodyRows,
        startY: currentY,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: {
          fillColor: [212, 175, 55],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 50 },
          2: { cellWidth: 16, halign: "center" },
          3: { cellWidth: 18, halign: "center" },
          4: { cellWidth: 65 },
          5: { cellWidth: 20 },
          6: { cellWidth: 22 },
          7: { cellWidth: 22 },
          8: { cellWidth: 30 },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 3) {
            if (data.cell.raw === "Completed") data.cell.styles.textColor = [34, 197, 94];
            else if (data.cell.raw === "Escalated") data.cell.styles.textColor = [239, 68, 68];
          }
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      // Summary
      const total = sectionData.length;
      const completed = sectionData.filter((a) => a.status === "Completed").length;
      const pending = sectionData.filter((a) => a.status === "Pending").length;
      const escalated = sectionData.filter((a) => a.status === "Escalated").length;
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text(`Summary — Total: ${total}   |   Completed: ${completed}   |   Pending: ${pending}   |   Escalated: ${escalated}`, 14, currentY);
    }

    doc.save(`Facility_Ops_${label}_${new Date().toISOString().split("T")[0]}.pdf`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facility Operations Console</h1>
          <p className="text-text-tertiary text-sm mt-1">
            Standalone operational dashboard — {getTodayDateStr()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["Daily", "Weekly", "Monthly", "Master"] as const).map((freq) => (
            <Button
              key={freq}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => (freq === "Master" ? exportExcel() : exportExcel(freq))}
              title={`Export ${freq} as Excel`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{freq === "Master" ? "All" : freq}</span>
            </Button>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          {(["Daily", "Weekly", "Monthly", "Master"] as const).map((freq) => (
            <Button
              key={freq}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => (freq === "Master" ? exportPDF() : exportPDF(freq))}
              title={`Export ${freq} as PDF`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{freq === "Master" ? "All" : freq}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.total}</p>
              <p className="text-xs text-text-tertiary">Total Activities</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.completed}</p>
              <p className="text-xs text-text-tertiary">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted-foreground/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.pending}</p>
              <p className="text-xs text-text-tertiary">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.escalated}</p>
              <p className="text-xs text-text-tertiary">Escalated</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as FacilitySection)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList>
            {getSections().map((section) => {
              const Icon = SECTION_ICONS[section] || Building2;
              return (
                <TabsTrigger key={section} value={section} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {section}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="pl-8 h-9 w-48 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Frequency Filter Pills */}
        <div className="flex items-center gap-2 mt-4 mb-4">
          <button
            onClick={() => setFrequencyFilter("All")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              frequencyFilter === "All"
                ? "bg-foreground text-background"
                : "bg-card border border-border text-text-tertiary hover:text-foreground"
            }`}
          >
            All
          </button>
          {frequencies.map((f) => {
            const Icon = FREQUENCY_ICONS[f];
            return (
              <button
                key={f}
                onClick={() => setFrequencyFilter(f)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  frequencyFilter === f
                    ? "bg-foreground text-background"
                    : "bg-card border border-border text-text-tertiary hover:text-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                {f}
              </button>
            );
          })}
        </div>

        {getSections().map((section) => (
          <TabsContent key={section} value={section} className="mt-0 space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
                <ClipboardList className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">No activities found</p>
                <p className="text-xs mt-1">
                  {searchQuery ? "Try a different search term." : "All activities are completed for this filter."}
                </p>
              </div>
            ) : (
              filteredActivities.map((activity, idx) => {
                const FreqIcon = FREQUENCY_ICONS[activity.frequency];
                const isExpanded = expandedActivity === activity.id;
                const isLogging = loggingActivity === activity.id;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    {/* Activity Header */}
                    <div
                      className="flex items-start gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                    >
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        activity.status === "Completed" ? "bg-success/10" :
                        activity.status === "Escalated" ? "bg-destructive/10" : "bg-muted"
                      }`}>
                        {activity.status === "Completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : activity.status === "Escalated" ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{activity.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${FREQUENCY_COLORS[activity.frequency]}`}>
                                <FreqIcon className="h-2.5 w-2.5 mr-1" />
                                {activity.frequency}
                              </Badge>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[activity.status]}`}>
                                {activity.status}
                              </Badge>
                            </div>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`} />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border pt-3 space-y-4">
                        {/* Task List */}
                        <div>
                          <Label className="text-xs font-semibold text-foreground mb-2 block">Tasks</Label>
                          <ul className="space-y-1">
                            {activity.tasks.map((task, ti) => (
                              <li key={ti} className="flex items-start gap-2 text-sm text-text-secondary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Log Section */}
                        <div className="bg-muted/30 rounded-lg p-3 space-y-3 border border-border/50">
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <User className="h-3 w-3" />
                            Activity Log
                          </p>
                          {activity.loggedAt && (
                            <div className="flex items-center gap-4 text-xs text-text-tertiary">
                              <span>Completed by: <span className="text-foreground font-medium">{activity.loggedBy || "—"}</span></span>
                              <span>At: <span className="text-foreground font-medium">{formatDate(activity.loggedAt)}</span></span>
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-text-tertiary">Logged By</Label>
                              <Input
                                placeholder="Your name"
                                className="h-8 text-sm"
                                value={isLogging ? logName : activity.loggedBy || ""}
                                onChange={(e) => setLogName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-text-tertiary">Vendor / Assigned To</Label>
                              <Select
                                value={activity.vendor || ""}
                                onValueChange={(v) => handleVendorChange(activity.id, v)}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {VENDOR_OPTIONS.map((v) => (
                                    <SelectItem key={v} value={v} className="text-sm">{v}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-text-tertiary">Notes / Comments</Label>
                            <Textarea
                              placeholder="Add notes or observations..."
                              className="min-h-[60px] text-sm"
                              value={isLogging ? logNotes : activity.notes}
                              onChange={(e) => {
                                if (isLogging) setLogNotes(e.target.value);
                                else handleNotesChange(activity.id, e.target.value);
                              }}
                              onBlur={() => {
                                // auto-save handled by onChange
                              }}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {activity.status !== "Completed" && (
                            <Button
                              size="sm"
                              className="gap-1.5 bg-success text-success-foreground hover:bg-success/90"
                              onClick={() => {
                                setLoggingActivity(activity.id);
                                setLogNotes(activity.notes);
                                setLogName(activity.loggedBy || "");
                                handleStatusChange(activity.id, "Completed");
                              }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Mark Completed
                            </Button>
                          )}
                          {activity.status !== "Escalated" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setLoggingActivity(activity.id);
                                setLogNotes(activity.notes);
                                setLogName(activity.loggedBy || "");
                                handleStatusChange(activity.id, "Escalated");
                              }}
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Escalate
                            </Button>
                          )}
                          {activity.status !== "Pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              onClick={() => handleStatusChange(activity.id, "Pending")}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Reset to Pending
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
