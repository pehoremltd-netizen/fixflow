"use client";

import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import {
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  AlertTriangle,
  Calendar,
  User,
  Building2,
  ShieldAlert,
  FileSpreadsheet,
  Flag,
  Eye,
  Plus,
  Download,
  RefreshCw,
  QrCode,
  Copy,
  Printer,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAttendanceRecords,
  getSitesForQR,
  getSiteQRCodes,
  getSiteQRCodesAsync,
  generateSiteQR,
  generateSiteQRAsync,
  toggleQRStatus,
  toggleQRStatusAsync,
  markSuspicious,
  clearSuspicious,
  updateAttendanceNotes,
  deleteAttendanceRecord,
  exportAttendanceCSV,
} from "@/lib/store/qr-attendance";
import type { AttendanceRecord, SiteQRCode } from "@/lib/store/qr-attendance";

type MergedRecord = {
  id: string;
  staffName: string;
  staffRole: string;
  siteName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  hours: string;
  method: "QR" | "GPS";
  gpsLat: number;
  gpsLng: number;
  distance: number;
  isSuspicious: boolean;
  suspiciousReason: string;
  status: "present" | "late" | "absent";
  notes: string;
};

function safeTime(dateStr: string, fmt: Intl.DateTimeFormatOptions) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("en-US", fmt);
  } catch {
    return "—";
  }
}

function safeDate(dateStr: string, fmt: Intl.DateTimeFormatOptions) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", fmt);
  } catch {
    return "—";
  }
}

function safeHours(clockIn: string, clockOut: string | null): string {
  if (!clockOut) return "—";
  try {
    const start = new Date(clockIn).getTime();
    const end = new Date(clockOut).getTime();
    if (isNaN(start) || isNaN(end)) return "—";
    return ((end - start) / 3600000).toFixed(1);
  } catch {
    return "—";
  }
}

function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      setHasError(true);
      setError(e.message || "Unknown error");
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);
  if (hasError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-secondary-foreground text-sm mb-4">An error occurred while loading this section.</p>
          <Button onClick={() => { setHasError(false); setError(null); window.location.reload(); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90">
            Reload Page
          </Button>
          {error && <p className="mt-4 text-text-tertiary text-xs font-mono">{error}</p>}
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export default function AdminAttendancePage() {
  const [mounted, setMounted] = useState(false);
  const [qrRecords, setQrRecords] = useState<AttendanceRecord[]>([]);
  const [qrCodes, setQrCodes] = useState<SiteQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MergedRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQrSite, setSelectedQrSite] = useState("");

  const [qrSites, setQrSites] = useState<ReturnType<typeof getSitesForQR>>([]);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        setDateFilter(today);

        const records = getAttendanceRecords();
        const sites = getSitesForQR();
        setQrRecords(records);
        setQrSites(sites);

        // Try API first, fallback to localStorage
        const codes = await getSiteQRCodesAsync();
        setQrCodes(codes);
      } catch (err) {
        setPageError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allRecords = useMemo<MergedRecord[]>(() => {
    return qrRecords.map((r) => ({
      id: r.id,
      staffName: r.staffName || "Unknown",
      staffRole: "Staff",
      siteName: r.siteName || "",
      date: r.date || "",
      clockIn: r.clockIn || "",
      clockOut: r.clockOut,
      hours: safeHours(r.clockIn, r.clockOut),
      method: r.method || "QR",
      gpsLat: r.gpsLat ?? 0,
      gpsLng: r.gpsLng ?? 0,
      distance: r.distanceFromSite ?? 0,
      isSuspicious: r.isSuspicious ?? false,
      suspiciousReason: r.suspiciousReason || "",
      status: r.status || "present",
      notes: r.notes || "",
    }));
  }, [qrRecords]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => {
      if (dateFilter && r.date !== dateFilter) return false;
      if (siteFilter !== "all" && r.siteName !== siteFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (methodFilter !== "all" && r.method !== methodFilter) return false;
      if (showSuspiciousOnly && !r.isSuspicious) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.staffName.toLowerCase().includes(q) && !r.siteName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allRecords, dateFilter, siteFilter, statusFilter, methodFilter, showSuspiciousOnly, searchQuery]);

  const presentCount = filteredRecords.filter((r) => r.status === "present" && !r.isSuspicious).length;
  const lateCount = filteredRecords.filter((r) => r.status === "late").length;
  const absentCount = filteredRecords.filter((r) => r.status === "absent").length;
  const suspiciousCount = filteredRecords.filter((r) => r.isSuspicious).length;

  const uniqueSites = useMemo(() => [...new Set(allRecords.map((r) => r.siteName).filter(Boolean))], [allRecords]);

  const refreshData = useCallback(() => {
    setQrRecords(getAttendanceRecords());
    setQrCodes(getSiteQRCodes());
  }, []);

  function handleViewRecord(r: MergedRecord) {
    setSelectedRecord(r);
    setEditNotes(r.notes);
    setDetailOpen(true);
  }

  function handleMarkSuspicious() {
    if (!selectedRecord) return;
    const reason = prompt("Enter reason for suspicious flag:");
    if (reason) {
      markSuspicious(selectedRecord.id, reason);
      refreshData();
      setSelectedRecord({ ...selectedRecord, isSuspicious: true, suspiciousReason: reason });
    }
  }

  function handleClearSuspicious() {
    if (!selectedRecord) return;
    clearSuspicious(selectedRecord.id);
    refreshData();
    setSelectedRecord({ ...selectedRecord, isSuspicious: false, suspiciousReason: "" });
  }

  function handleSaveNotes() {
    if (!selectedRecord) return;
    updateAttendanceNotes(selectedRecord.id, editNotes);
    refreshData();
    setSelectedRecord({ ...selectedRecord, notes: editNotes });
  }

  function handleDeleteRecord() {
    if (!selectedRecord) return;
    if (!confirm("Are you sure you want to delete this attendance record? This action cannot be undone.")) return;
    deleteAttendanceRecord(selectedRecord.id);
    refreshData();
    setDetailOpen(false);
    setSelectedRecord(null);
  }

  function handleExportCSV() {
    const csv = exportAttendanceCSV(qrRecords.filter((r) => r.date === dateFilter));
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${dateFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleQrGenerate() {
    if (!selectedQrSite) return;
    const site = qrSites.find((s) => s.id === selectedQrSite);
    if (!site) return;
    await generateSiteQRAsync(site.id, site.name, site.coords.lat.toFixed(4) + ", " + site.coords.lng.toFixed(4));
    setQrCodes(getSiteQRCodes());
    setQrDialogOpen(false);
  }

  async function handleQrToggle(siteId: string) {
    await toggleQRStatusAsync(siteId);
    setQrCodes(getSiteQRCodes());
  }

  async function handleQrRegenerate(siteId: string) {
    const qr = qrCodes.find((q) => q.siteId === siteId);
    if (!qr) return;
    await generateSiteQRAsync(siteId, qr.siteName, qr.location);
    setQrCodes(getSiteQRCodes());
  }

  function handleQrCopy(value: string) {
    navigator.clipboard.writeText(value).catch(() => {});
  }

  async function downloadQRJPEG(value: string, filename: string) {
    const { default: QRCodeLib } = await import("qrcode");
    const url = await QRCodeLib.toDataURL(value, {
      width: 300,
      margin: 2,
      color: { dark: "var(--color-primary)", light: "var(--color-foreground)" },
    }).catch(() => null);
    if (!url) return;
    const link = document.createElement("a");
    link.download = `${filename.replace(/[^a-zA-Z0-9_-]/g, "-")}-qrcode.jpg`;
    link.href = url;
    link.click();
  }

  async function printQR(value: string, siteName: string) {
    const { default: QRCodeLib } = await import("qrcode");
    const url = await QRCodeLib.toDataURL(value, { width: 300, margin: 2 }).catch(() => null);
    if (!url) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head><title>QR Code - ${siteName}</title>
      <style>
        body { display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif; }
        .qr-container { text-align:center; }
        h2 { margin-bottom:20px; color:#333; }
        img { width:300px; height:300px; }
      </style>
      </head>
      <body>
      <div class="qr-container">
        <h2>${siteName}</h2>
        <img src="${url}" alt="QR Code for ${siteName}" />
        <p style="margin-top:16px;color:#666;font-size:14px;">Scan to clock in</p>
      </div>
      <script>
        window.onload = function() { setTimeout(function() { window.print(); }, 500); };
      <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  function renderDateSummaryCards() {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{presentCount}</p>
              <p className="text-xs text-text-tertiary">Present Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{lateCount}</p>
              <p className="text-xs text-text-tertiary">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{absentCount}</p>
              <p className="text-xs text-text-tertiary">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{suspiciousCount}</p>
              <p className="text-xs text-text-tertiary">Suspicious</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderFilters() {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Attendance Records
            </CardTitle>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-text-tertiary" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-36 border-input bg-background text-foreground text-xs h-8"
              />
            </div>
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-32 border-input bg-background text-foreground text-xs h-8">
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent className="border-input bg-card">
                <SelectItem value="all" className="text-foreground text-xs">All Sites</SelectItem>
                {uniqueSites.map((s) => (
                  <SelectItem key={s} value={s} className="text-foreground text-xs">{s || "N/A"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28 border-input bg-background text-foreground text-xs h-8">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="border-input bg-card">
                <SelectItem value="all" className="text-foreground text-xs">All Status</SelectItem>
                <SelectItem value="present" className="text-foreground text-xs">Present</SelectItem>
                <SelectItem value="late" className="text-foreground text-xs">Late</SelectItem>
                <SelectItem value="absent" className="text-foreground text-xs">Absent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-28 border-input bg-background text-foreground text-xs h-8">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent className="border-input bg-card">
                <SelectItem value="all" className="text-foreground text-xs">All Methods</SelectItem>
                <SelectItem value="QR" className="text-foreground text-xs">QR Scan</SelectItem>
                <SelectItem value="GPS" className="text-foreground text-xs">GPS</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-44">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-subtle" />
              <Input
                placeholder="Search name or site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 border-input bg-background text-foreground placeholder:text-text-subtle text-xs h-8"
              />
            </div>
            <Button
              variant={showSuspiciousOnly ? "default" : "outline"}
              size="sm"
              className={`h-8 text-xs gap-1.5 ${showSuspiciousOnly ? "bg-warning text-foreground" : "border-input text-text-tertiary"}`}
              onClick={() => setShowSuspiciousOnly(!showSuspiciousOnly)}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {showSuspiciousOnly ? "All Records" : "Suspicious Only"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-input text-text-tertiary"
              onClick={handleExportCSV}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  function renderTable() {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No attendance records for this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-tertiary text-xs uppercase">
                    <th className="text-left py-3 px-2 font-medium">Staff Name</th>
                    <th className="text-left py-3 px-2 font-medium">Site</th>
                    <th className="text-left py-3 px-2 font-medium">Date</th>
                    <th className="text-left py-3 px-2 font-medium">Clock In</th>
                    <th className="text-left py-3 px-2 font-medium">Clock Out</th>
                    <th className="text-left py-3 px-2 font-medium">Hours</th>
                    <th className="text-left py-3 px-2 font-medium">Method</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-card-alt hover:bg-card-alt transition-colors cursor-pointer"
                      onClick={() => handleViewRecord(r)}
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-text-subtle" />
                          <span className="text-foreground font-medium">{r.staffName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {r.siteName ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-text-subtle" />
                            <span className="text-text-tertiary">{r.siteName}</span>
                          </div>
                        ) : (
                          <span className="text-text-subtle">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-text-tertiary">{safeDate(r.date, { month: "short", day: "numeric" })}</td>
                      <td className="py-3 px-2 text-text-tertiary font-mono">
                        {safeTime(r.clockIn, { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-2 text-text-tertiary font-mono">
                        {r.clockOut ? safeTime(r.clockOut, { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 px-2 text-text-tertiary">{r.hours !== "—" ? `${r.hours}h` : "—"}</td>
                      <td className="py-3 px-2">
                        <Badge className={`text-[10px] px-2 py-0.5 ${
                          r.method === "QR"
                            ? "bg-info/10 text-blue-400 border border-blue-500/20"
                            : "bg-success/10 text-success border border-success/20"
                        }`}>
                          {r.method === "QR" ? "QR Scan" : "GPS"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        {r.isSuspicious ? (
                          <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[10px] px-2 py-0.5 gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Suspicious
                          </Badge>
                        ) : r.status === "present" ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            <span className="text-success text-[11px]">Present</span>
                          </div>
                        ) : r.status === "absent" ? (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5 text-destructive" />
                            <span className="text-destructive text-[11px]">Absent</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span className="text-primary text-[11px]">Late</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-text-subtle hover:text-foreground"
                          onClick={(e) => { e.stopPropagation(); handleViewRecord(r); }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function renderDetailDialog() {
    if (!selectedRecord) return null;
    return (
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-input max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Attendance Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/50 border border-border">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Staff</p>
                <p className="text-sm text-foreground font-medium mt-0.5">{selectedRecord.staffName}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Site</p>
                <p className="text-sm text-foreground font-medium mt-0.5">{selectedRecord.siteName || "N/A"}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Date</p>
                <p className="text-sm text-foreground font-medium mt-0.5">
                  {safeDate(selectedRecord.date, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Method</p>
                <Badge className={cn(
                  "mt-1 text-[10px]",
                  selectedRecord.method === "QR"
                    ? "bg-info/10 text-blue-400 border-blue-500/20"
                    : "bg-success/10 text-success border-success/20"
                )}>
                  {selectedRecord.method === "QR" ? "QR Scan" : selectedRecord.method}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/50 border border-border">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Clock In</p>
                <p className="text-sm text-foreground font-mono mt-0.5">
                  {safeTime(selectedRecord.clockIn, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Clock Out</p>
                <p className="text-sm text-foreground font-mono mt-0.5">
                  {selectedRecord.clockOut
                    ? safeTime(selectedRecord.clockOut, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                    : "—"}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">GPS Location</p>
              {selectedRecord.gpsLat !== 0 || selectedRecord.gpsLng !== 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-primary mb-1">
                      <MapPin className="h-3 w-3" />
                      <span>Site Location</span>
                    </div>
                    <p className="font-mono text-[11px] text-text-tertiary">
                      {selectedRecord.gpsLat.toFixed(4)}, {selectedRecord.gpsLng.toFixed(4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs text-primary mb-1 justify-end">
                      <span>Staff Location</span>
                      <MapPin className="h-3 w-3" />
                    </div>
                    <p className="font-mono text-[11px] text-text-tertiary">
                      {selectedRecord.gpsLat.toFixed(4)}, {selectedRecord.gpsLng.toFixed(4)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-subtle">No GPS data captured</p>
              )}
              {selectedRecord.distance > 0 && (
                <div className={cn(
                  "mt-2 pt-2 border-t border-border flex items-center gap-1.5 text-xs",
                  selectedRecord.distance > 500 ? "text-destructive" : "text-success"
                )}>
                  <MapPin className="h-3 w-3" />
                  {selectedRecord.distance >= 1000
                    ? `${(selectedRecord.distance / 1000).toFixed(1)}km from site`
                    : `${selectedRecord.distance}m from site`
                  }
                  {selectedRecord.distance > 500 ? " — outside geofence" : " — within geofence"}
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">Suspicious Flag</p>
              <div className="flex items-center justify-between">
                {selectedRecord.isSuspicious ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-destructive/10 text-destructive border border-destructive/20 gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Flagged
                    </Badge>
                    <span className="text-xs text-text-tertiary">{selectedRecord.suspiciousReason}</span>
                  </div>
                ) : (
                  <span className="text-xs text-success">No issues detected</span>
                )}
                <Button
                  size="sm"
                  className={cn(
                    "h-7 text-xs gap-1",
                    selectedRecord.isSuspicious
                      ? "bg-success/10 text-success hover:bg-success/20"
                      : "bg-warning/10 text-warning hover:bg-warning/20"
                  )}
                  onClick={selectedRecord.isSuspicious ? handleClearSuspicious : handleMarkSuspicious}
                >
                  <Flag className="h-3 w-3" />
                  {selectedRecord.isSuspicious ? "Clear Flag" : "Flag Suspicious"}
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-border">
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">Admin Notes</p>
              <div className="flex gap-2">
                <Input
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add admin notes..."
                  className="flex-1 border-input bg-background text-foreground text-xs placeholder:text-text-subtle"
                />
                <Button
                  size="sm"
                  className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSaveNotes}
                >
                  Save
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-destructive/30 text-red-400 hover:bg-destructive/10 hover:text-red-300 text-xs h-8"
                onClick={handleDeleteRecord}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  function renderQRCodes() {
    if (!mounted) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-tertiary" />
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Site QR Codes</h2>
            <p className="text-secondary-foreground">Generate QR codes to print and paste at each premises</p>
          </div>
          <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" /> + Add New Site QR
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-input">
              <DialogHeader>
                <DialogTitle className="text-foreground">Generate QR Code for Site</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Select Site</Label>
                  <Select value={selectedQrSite} onValueChange={setSelectedQrSite}>
                    <SelectTrigger className="border-input bg-background text-foreground">
                      <SelectValue placeholder="Select a site..." />
                    </SelectTrigger>
                    <SelectContent className="border-input bg-card">
                      {qrSites.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {s.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedQrSite && (
                  <div className="flex justify-center p-6 bg-input-bg rounded-lg border border-input">
                    <QRCodeDisplay
                      value={`fixflow://clock?site=${encodeURIComponent(qrSites.find((s) => s.id === selectedQrSite)?.name || "")}`}
                      size={180}
                    />
                  </div>
                )}
                <Button
                  onClick={handleQrGenerate}
                  disabled={!selectedQrSite}
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <QrCode className="h-4 w-4" /> Generate QR Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{qrCodes.length}</p>
              <p className="text-xs text-text-tertiary">Total Sites</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{qrCodes.filter((q) => q.isActive).length}</p>
              <p className="text-xs text-text-tertiary">Active QR Codes</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{qrCodes.reduce((sum, q) => sum + (q.isActive ? q.scansToday : 0), 0)}</p>
              <p className="text-xs text-text-tertiary">Scans Today</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">0</p>
              <p className="text-xs text-text-tertiary">Suspicious Flags</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {qrCodes.map((qr) => (
            <div key={qr.id}>
              <Card className="border-primary/20 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                        <QrCode className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{qr.siteName}</h3>
                        <p className="text-sm text-muted-foreground">{qr.location}</p>
                      </div>
                    </div>
                    <Badge
                      className={qr.isActive
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                      }
                    >
                      {qr.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex justify-center p-4 bg-input-bg rounded-lg mb-4 border border-input">
                    <QRCodeDisplay value={qr.qrValue} size={120} />
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Scans today: {qr.scansToday}</span>
                    <span className="text-xs text-text-subtle">
                      Created {safeDate(qr.createdAt, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => printQR(qr.qrValue, qr.siteName)}
                    >
                      <Printer className="h-3.5 w-3.5" /> Print QR Code
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-input text-text-tertiary hover:text-foreground"
                      onClick={() => downloadQRJPEG(qr.qrValue, qr.siteName)}
                    >
                      <Download className="h-3.5 w-3.5" /> Download JPEG
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-input text-text-tertiary hover:text-foreground"
                      onClick={() => handleQrRegenerate(qr.siteId)}
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-input text-text-tertiary hover:text-foreground"
                      onClick={() => handleQrCopy(qr.qrValue)}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 ${qr.isActive ? "border-destructive/30 text-destructive" : "border-success/30 text-success"}`}
                      onClick={() => handleQrToggle(qr.siteId)}
                    >
                      {qr.isActive ? <ToggleLeft className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
                      {qr.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to Load</h2>
          <p className="text-secondary-foreground text-sm mb-4">{pageError}</p>
          <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundaryWrapper>
      <Tabs defaultValue="attendance" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Attendance Monitor</h1>
            <p className="text-secondary-foreground">Real-time staff attendance across all sites</p>
          </div>
          <TabsList className="bg-border border border-input">
            <TabsTrigger value="attendance" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Attendance</TabsTrigger>
            <TabsTrigger value="qr-codes" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">QR Codes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="attendance" className="space-y-6">
          {renderDateSummaryCards()}
          {renderFilters()}
          {renderTable()}
          {renderDetailDialog()}
        </TabsContent>

        <TabsContent value="qr-codes" className="space-y-6">
          {renderQRCodes()}
        </TabsContent>
      </Tabs>
    </ErrorBoundaryWrapper>
  );
}
