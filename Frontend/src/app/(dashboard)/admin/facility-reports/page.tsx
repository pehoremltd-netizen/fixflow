"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, FileText, ChevronDown, ChevronRight, Loader2, Save } from "lucide-react";
import {
  type ReportActivity,
  type ReportEntry,
  type ReportFrequency,
  type CoverMemo,
  getReportActivities,
  getReportSections,
  loadReport,
  saveReportEntry,
  loadCoverMemo,
  saveCoverMemo,
  getDocumentRef,
  incrementDocumentCounter,
  loadActivityField,
  saveActivityField,
  getCurrentUserName,
} from "@/lib/store/facility-reports";
import { exportFacilityReportExcel, exportFacilityReportPDF } from "@/lib/facility-report-export";

const FREQUENCY_STYLES: Record<string, string> = {
  Daily: "bg-amber-100 text-amber-800 border-amber-300",
  Weekly: "bg-blue-100 text-blue-800 border-blue-300",
  Monthly: "bg-purple-100 text-purple-800 border-purple-300",
  Quarterly: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const EXPORT_FREQUENCIES: { label: string; value: ReportFrequency | "All" }[] = [
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
  { label: "Monthly", value: "Monthly" },
  { label: "Master", value: "All" },
];

const RECIPIENT_OPTIONS = ["Admin", "Audit", "Finance", "COO"];

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function FacilityReportsPage() {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [report, setReport] = useState(() => loadReport(getToday()));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set(getReportSections()));
  const [exporting, setExporting] = useState<Record<string, boolean>>({});

  /* Cover Memo State */
  const [memoExpanded, setMemoExpanded] = useState(false);
  const [coverMemo, setCoverMemo] = useState<CoverMemo>(() => {
    const memo = loadCoverMemo();
    if (!memo.preparedBy) memo.preparedBy = getCurrentUserName();
    return memo;
  });
  const [docRef, setDocRef] = useState(getDocumentRef);
  const [memoSaved, setMemoSaved] = useState(false);

  useEffect(() => {
    const loaded = loadReport(selectedDate);
    setReport(loaded);
  }, [selectedDate]);

  useEffect(() => {
    if (memoSaved) {
      const t = setTimeout(() => setMemoSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [memoSaved]);

  const sections = getReportSections();

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const handleSave = useCallback(
    (activityId: string, field: "reportUpdate" | "notes", value: string) => {
      setReport((prev) => {
        const existing = prev.entries[activityId];
        const reportUpdate = field === "reportUpdate" ? value : existing?.reportUpdate ?? "";
        const notes = field === "notes" ? value : existing?.notes ?? "";

        let timestamp = existing?.timestamp ?? "";
        if (field === "reportUpdate") {
          if (value && !existing?.timestamp) {
            timestamp = new Date().toISOString();
          } else if (!value) {
            timestamp = "";
          } else {
            timestamp = existing?.timestamp ?? "";
          }
        }

        const entry: ReportEntry = { activityId, reportUpdate, notes, timestamp };
        saveReportEntry(selectedDate, activityId, entry);
        return { ...prev, entries: { ...prev.entries, [activityId]: entry } };
      });
    },
    [selectedDate]
  );

  /* ── Cover Memo Handlers ── */
  const toggleRecipient = useCallback((recipient: string) => {
    setCoverMemo((prev) => {
      const recipients = prev.recipients.includes(recipient)
        ? prev.recipients.filter((r) => r !== recipient)
        : [...prev.recipients, recipient];
      return { ...prev, recipients };
    });
  }, []);

  const handleMemoMessageChange = useCallback((value: string) => {
    setCoverMemo((prev) => ({ ...prev, message: value }));
  }, []);

  const handleSaveMemo = useCallback(() => {
    saveCoverMemo(coverMemo);
    setMemoSaved(true);
  }, [coverMemo]);

  const handleExport = useCallback(
    async (type: "excel" | "pdf", frequency: ReportFrequency | "All") => {
      const key = `${type}-${frequency}`;
      setExporting((prev) => ({ ...prev, [key]: true }));
      try {
        if (type === "excel") {
          await exportFacilityReportExcel(selectedDate, frequency);
        } else {
          const ref = incrementDocumentCounter();
          setDocRef(ref);
          await exportFacilityReportPDF(selectedDate, frequency, coverMemo, ref);
        }
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setExporting((prev) => ({ ...prev, [key]: false }));
      }
    },
    [selectedDate, coverMemo]
  );

  const isAnyExporting = Object.values(exporting).some(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facility Daily Report</h1>
          <p className="text-text-tertiary text-sm mt-1">
            Daily report of facility activities and status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="report-date" className="text-sm text-text-tertiary whitespace-nowrap">
            Report Date:
          </label>
          <Input
            id="report-date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="w-44 h-9 text-sm"
          />
        </div>
      </div>

      {/* ── Cover Memo Section ── */}
      <Card className="border-border overflow-hidden">
        <CardHeader
          className="p-4 cursor-pointer select-none hover:bg-accent/50 transition-colors flex flex-row items-center justify-between border-b border-border"
          onClick={() => setMemoExpanded((prev) => !prev)}
        >
          <CardTitle className="text-base font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-5 rounded-sm"
              style={{ backgroundColor: "#B8860B" }}
            />
            Export Cover Memo
          </CardTitle>
          <div className="flex items-center gap-2">
            {memoSaved && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Save className="h-3 w-3" />
                Saved
              </span>
            )}
            {memoExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {memoExpanded && (
          <CardContent className="p-5 space-y-5">
            {/* Recipients */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Submitted To</Label>
              <div className="flex flex-wrap gap-4">
                {RECIPIENT_OPTIONS.map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={coverMemo.recipients.includes(r)}
                      onChange={() => toggleRecipient(r)}
                      className="h-4 w-4 rounded border-border text-[#B8860B] focus:ring-[#B8860B]"
                    />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            {/* Cover Message */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Cover Message</Label>
              <Textarea
                value={coverMemo.message}
                onChange={(e) => handleMemoMessageChange(e.target.value)}
                placeholder="Write your message to the recipient here.&#10;This will appear as the opening paragraph on the exported report..."
                className="min-h-[144px] text-sm w-full resize-y"
                rows={6}
              />
            </div>

            {/* Document Reference */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-foreground">Document Ref:</Label>
                <Input
                  value={docRef}
                  readOnly
                  className="h-9 text-sm font-mono bg-muted mt-1"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-semibold text-foreground">Prepared by:</Label>
                <Input
                  value={coverMemo.preparedBy}
                  readOnly
                  className="h-9 text-sm bg-muted mt-1"
                />
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveMemo}
              className="gap-1.5"
              size="sm"
            >
              <Save className="h-4 w-4" />
              Save Cover Memo
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Export Bar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-foreground">Export Report</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-text-tertiary mr-1 font-medium">Excel</span>
              {EXPORT_FREQUENCIES.map(({ label, value }) => {
                const key = `excel-${value}`;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    disabled={isAnyExporting}
                    className="gap-1.5 text-xs h-8"
                    onClick={() => handleExport("excel", value)}
                  >
                    {exporting[key] ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                    {label}
                  </Button>
                );
              })}
              <span className="w-px h-6 bg-border mx-2" />
              <span className="text-xs text-text-tertiary mr-1 font-medium">PDF</span>
              {EXPORT_FREQUENCIES.map(({ label, value }) => {
                const key = `pdf-${value}`;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    disabled={isAnyExporting}
                    className="gap-1.5 text-xs h-8"
                    onClick={() => handleExport("pdf", value)}
                  >
                    {exporting[key] ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-red-600" />
                    )}
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {sections.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <p className="text-sm text-text-tertiary">No activities defined.</p>
          </CardContent>
        </Card>
      ) : (
        sections.map((section) => {
          const activities = getReportActivities(section);
          const isExpanded = expandedSections.has(section);

          return (
            <Card key={section} className="border-border overflow-hidden">
              <CardHeader
                className="p-4 cursor-pointer select-none hover:bg-accent/50 transition-colors flex flex-row items-center justify-between border-b border-border"
                onClick={() => toggleSection(section)}
              >
                <CardTitle className="text-base font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <span
                    className="inline-block w-1.5 h-5 rounded-sm"
                    style={{ backgroundColor: "#B8860B" }}
                  />
                  {section}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-tertiary bg-muted px-2 py-0.5 rounded-full">
                    {activities.length} activities
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-0">
                  <ScrollArea className="w-full">
                    <div className="min-w-[1000px]">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr
                            className="text-left text-xs font-semibold uppercase tracking-wider text-white sticky top-0 z-10"
                            style={{ backgroundColor: "#B8860B" }}
                          >
                            <th className="p-3 w-12 text-center">S/No</th>
                            <th className="p-3 min-w-[180px]">Activities</th>
                            <th className="p-3 min-w-[220px]">Tasks</th>
                            <th className="p-3 w-24 text-center">Frequency</th>
                            <th className="p-3 min-w-[180px]">Report Update</th>
                            <th className="p-3 min-w-[160px]">Notes</th>
                            <th className="p-3 w-28 text-center">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activities.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="p-8 text-center text-sm text-text-tertiary"
                              >
                                No activities defined.
                              </td>
                            </tr>
                          ) : (
                            activities.map((activity, idx) => {
                              const entry = report.entries[activity.id];
                              return (
                                <ActivityRow
                                  key={activity.id}
                                  activity={activity}
                                  index={idx}
                                  entry={entry}
                                  onSave={handleSave}
                                />
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}

function ActivityRow({
  activity,
  index,
  entry,
  onSave,
}: {
  activity: ReportActivity;
  index: number;
  entry: ReportEntry | undefined;
  onSave: (activityId: string, field: "reportUpdate" | "notes", value: string) => void;
}) {
  const savedUpdate = loadActivityField(activity.id, "reportUpdate") || entry?.reportUpdate || "";
  const savedNotes = loadActivityField(activity.id, "notes") || entry?.notes || "";
  const [updateValue, setUpdateValue] = useState(savedUpdate);
  const [notesValue, setNotesValue] = useState(savedNotes);
  const [savedField, setSavedField] = useState<"reportUpdate" | "notes" | null>(null);

  useEffect(() => {
    if (entry) {
      setUpdateValue(entry.reportUpdate ?? "");
      setNotesValue(entry.notes ?? "");
    }
  }, [entry?.reportUpdate, entry?.notes]);

  useEffect(() => {
    if (!savedField) return;
    const t = setTimeout(() => setSavedField(null), 1500);
    return () => clearTimeout(t);
  }, [savedField]);

  const handleFieldChange = useCallback(
    (field: "reportUpdate" | "notes", value: string) => {
      if (field === "reportUpdate") setUpdateValue(value);
      else setNotesValue(value);
      saveActivityField(activity.id, field, value);
      onSave(activity.id, field, value);
      setSavedField(field);
    },
    [activity.id, onSave]
  );

  const freqStyle = FREQUENCY_STYLES[activity.frequency] ?? "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="p-3 text-sm text-center text-text-tertiary font-mono">{index + 1}</td>
      <td className="p-3 text-sm font-medium text-foreground">{activity.activity}</td>
      <td className="p-3 text-sm text-text-tertiary max-w-[260px] leading-relaxed">
        {activity.tasks}
      </td>
      <td className="p-3 text-center">
        <span
          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${freqStyle}`}
        >
          {activity.frequency}
        </span>
      </td>
      <td className="p-3">
        <div className="relative">
          <Input
            value={updateValue}
            onChange={(e) => handleFieldChange("reportUpdate", e.target.value)}
            placeholder="Enter report update..."
            className="h-8 text-sm w-full pr-14"
          />
          {savedField === "reportUpdate" && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-medium transition-opacity">
              Saved
            </span>
          )}
        </div>
      </td>
      <td className="p-3">
        <div className="relative">
          <Textarea
            value={notesValue}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            placeholder="Optional notes..."
            className="min-h-[32px] h-8 text-sm py-1 w-full resize-none pr-14"
            rows={1}
          />
          {savedField === "notes" && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-medium transition-opacity">
              Saved
            </span>
          )}
        </div>
      </td>
      <td className="p-3 text-sm text-text-tertiary text-center whitespace-nowrap font-mono">
        {entry?.timestamp ? formatTime(entry.timestamp) : "—"}
      </td>
    </tr>
  );
}
