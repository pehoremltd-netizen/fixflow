"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  FileText,
  CalendarDays,
  Building2,
  ClipboardCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
  User,
  Mail,
  MessageSquare,
  Download,
} from "lucide-react";
import {
  type OgbaActivity,
  type OgbaReportEntry,
  type OgbaFrequency,
  type CoverMemo,
  OGBA_ACTIVITIES,
  getFrequencies,
  saveReportEntry,
  loadReportEntries,
  loadCoverMemo,
  saveCoverMemo,
} from "@/lib/store/ogba-reports";
import {
  exportFrequencyExcel,
  exportFrequencyPDF,
} from "@/lib/ogba-report-export";

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const FREQUENCY_COLORS: Record<string, string> = {
  Daily: "bg-blue-100 text-blue-700 border-blue-200",
  Weekly: "bg-purple-100 text-purple-700 border-purple-200",
  Monthly: "bg-amber-100 text-amber-700 border-amber-200",
  Quarterly: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const FREQUENCY_ICONS: Record<string, React.ElementType> = {
  Daily: Clock,
  Weekly: CalendarDays,
  Monthly: ClipboardCheck,
  Quarterly: AlertCircle,
};

function ActivityCard({
  activity,
  entry,
  onSave,
}: {
  activity: OgbaActivity;
  entry: OgbaReportEntry | undefined;
  onSave: (activityId: string, entry: OgbaReportEntry) => void;
}) {
  const [reportUpdate, setReportUpdate] = useState(entry?.reportUpdate || "");
  const [notes, setNotes] = useState(entry?.notes || "");
  const [saved, setSaved] = useState(false);
  const FreqIcon = FREQUENCY_ICONS[activity.frequency];

  useEffect(() => {
    setReportUpdate(entry?.reportUpdate || "");
    setNotes(entry?.notes || "");
  }, [entry?.reportUpdate, entry?.notes]);

  function handleSave() {
    onSave(activity.id, {
      activityId: activity.id,
      reportUpdate,
      notes,
      timestamp: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const hasUpdate = reportUpdate.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border bg-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B]" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-0.5">
                <Building2 className="h-5 w-5 text-[#B8860B]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">{activity.activity}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium px-2.5 py-0.5 ${FREQUENCY_COLORS[activity.frequency]}`}
                  >
                    <FreqIcon className="h-3 w-3 mr-1 inline" />
                    {activity.frequency}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {activity.tasks.length} task{activity.tasks.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 pl-1">
            <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Tasks</p>
            <ul className="space-y-1">
              {activity.tasks.map((task, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="text-[#B8860B] mt-1 text-xs">&#x2022;</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-border my-3" />

          <div className="space-y-2 mb-3">
            <Label className="text-sm font-medium text-foreground">Report Update</Label>
            <Textarea
              placeholder="Describe what was done, observations, and any actions taken..."
              value={reportUpdate}
              onChange={(e) => setReportUpdate(e.target.value)}
              className="min-h-[80px] text-sm resize-y"
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label className="text-sm font-medium text-foreground">Additional Notes</Label>
            <Textarea
              placeholder="Any additional remarks, follow-ups, or recommendations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px] text-sm resize-y"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {entry?.timestamp && (
                <span>Last updated: {new Date(entry.timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
              )}
            </div>
            <Button
              onClick={handleSave}
              size="sm"
              className={hasUpdate ? "bg-[#B8860B] hover:bg-[#A0760A] text-white" : ""}
              variant={hasUpdate ? "default" : "outline"}
            >
              {saved ? (
                <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Saved</>
              ) : (
                <><Send className="h-4 w-4 mr-1.5" /> Save Entry</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CoverMemoSection({
  coverMemo,
  onSave,
}: {
  coverMemo: CoverMemo;
  onSave: (memo: CoverMemo) => void;
}) {
  const [recipients, setRecipients] = useState(coverMemo.recipients);
  const [message, setMessage] = useState(coverMemo.message);
  const [preparedBy, setPreparedBy] = useState(coverMemo.preparedBy);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRecipients(coverMemo.recipients);
    setMessage(coverMemo.message);
    setPreparedBy(coverMemo.preparedBy);
  }, [coverMemo.recipients, coverMemo.message, coverMemo.preparedBy]);

  function handleSave() {
    onSave({ recipients, message, preparedBy });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#B8860B]" />
          Cover Memo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              <User className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
              Prepared by
            </Label>
            <Input value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} placeholder="Your name / title" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              <Mail className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
              Recipients
            </Label>
            <Input value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="e.g. Head of Admin | COO | Audit | Finance" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Cover Message (optional)</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A brief executive summary or transmittal note for the report..." className="min-h-[80px]" />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} variant="outline" size="sm">
            {saved ? <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Saved</> : <><Send className="h-4 w-4 mr-1.5" /> Save Cover Memo</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FacilityActivitiesPage() {
  const [date, setDate] = useState(todayString());
  const [entries, setEntries] = useState<Record<string, OgbaReportEntry>>({});
  const [coverMemo, setCoverMemo] = useState<CoverMemo>({
    recipients: "",
    message: "",
    preparedBy: "",
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<OgbaFrequency | null>(null);

  useEffect(() => {
    setLoading(true);
    const loadedEntries = loadReportEntries(date);
    setEntries(loadedEntries);
    const loadedMemo = loadCoverMemo();
    setCoverMemo(loadedMemo);
    setLoading(false);
  }, [date]);

  const handleEntrySave = useCallback(
    (activityId: string, entry: OgbaReportEntry) => {
      saveReportEntry(date, activityId, entry);
      setEntries((prev) => ({ ...prev, [activityId]: entry }));
    },
    [date]
  );

  const handleCoverMemoSave = useCallback((memo: CoverMemo) => {
    saveCoverMemo(memo);
    setCoverMemo(memo);
  }, []);

  async function handleExportExcel(frequency: OgbaFrequency) {
    setExporting(frequency);
    try {
      await exportFrequencyExcel(frequency, date, entries, coverMemo);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  }

  async function handleExportPDF(frequency: OgbaFrequency) {
    setExporting(frequency);
    try {
      await exportFrequencyPDF(frequency, date, entries, coverMemo);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  }

  const frequencies = getFrequencies();

  function getActivitiesByFreq(freq: string): OgbaActivity[] {
    return OGBA_ACTIVITIES.filter((a) => a.frequency === freq);
  }

  const totalActivities = OGBA_ACTIVITIES.length;
  const reportedCount = OGBA_ACTIVITIES.filter(
    (a) => entries[a.id]?.reportUpdate?.trim()
  ).length;
  const completionPct =
    totalActivities > 0 ? Math.round((reportedCount / totalActivities) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#B8860B] mx-auto" />
          <p className="text-muted-foreground text-sm">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#B8860B]/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-[#B8860B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Konga Facility Ogba — Activities</h1>
            <p className="text-sm text-muted-foreground">
              Daily · Weekly · Monthly · Quarterly Tasks
            </p>
          </div>
        </div>
      </div>

      {/* COMPLETION BANNER */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B]" />
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#B8860B" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPct / 100)}`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                  {completionPct}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Report Completion</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {reportedCount} of {totalActivities} activities reported
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EXPORT BUTTONS PER FREQUENCY */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Export Reports
          </p>
          <div className="flex flex-wrap gap-2">
            {frequencies.map((freq) => {
              const Icon = FREQUENCY_ICONS[freq];
              const isBusy = exporting === freq;
              return (
                <div key={freq} className="flex items-center gap-1">
                  <Button
                    onClick={() => handleExportExcel(freq)}
                    disabled={exporting !== null}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    {isBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />
                    )}
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    {freq}
                  </Button>
                  <Button
                    onClick={() => handleExportPDF(freq)}
                    disabled={exporting !== null}
                    size="sm"
                    className="gap-1.5 bg-[#B8860B] hover:bg-[#A0760A] text-white"
                  >
                    {isBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* DATE HEADER */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4 text-[#B8860B]" />
        <span>
          Report for: <strong className="text-foreground">{formatDate(date)}</strong>
        </span>
      </div>

      {/* ACTIVITIES BY FREQUENCY */}
      {frequencies.map((frequency) => {
        const acts = getActivitiesByFreq(frequency);
        if (acts.length === 0) return null;
        const FreqIcon = FREQUENCY_ICONS[frequency];
        const reportedInFreq = acts.filter(
          (a) => entries[a.id]?.reportUpdate?.trim()
        ).length;

        return (
          <section key={frequency} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FreqIcon className="h-5 w-5 text-[#B8860B]" />
                <h2 className="text-lg font-semibold text-foreground">{frequency} Activities</h2>
                <Badge
                  variant="outline"
                  className={`text-xs ml-2 ${FREQUENCY_COLORS[frequency]}`}
                >
                  {reportedInFreq}/{acts.length} reported
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {acts.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  entry={entries[activity.id]}
                  onSave={handleEntrySave}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* COVER MEMO SECTION */}
      <CoverMemoSection coverMemo={coverMemo} onSave={handleCoverMemoSave} />

      {/* EMPTY STATE */}
      {OGBA_ACTIVITIES.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No activities configured</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Activities have not been set up yet.
          </p>
        </div>
      )}
    </div>
  );
}
