"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  LogIn,
  LogOut,
  History,
  AlertTriangle,
  Navigation,
  Building2,
  QrCode,
  ScanLine,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clockInWithQR, clockOut as qrClockOut, getSitesForQR } from "@/lib/store/qr-attendance";

const CURRENT_USER_KEY = "fixflow-current-user";
const ATTENDANCE_EVENTS_KEY = "fixflow-attendance-events";
const SITES_KEY = "fixflow-sites";

interface Attendance {
  id: string;
  user_id: string;
  site_id: string;
  type: "clock-in" | "clock-out";
  timestamp: string;
  verified: boolean;
  latitude: number;
  longitude: number;
}

interface Site {
  id: string;
  organization_id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  attendance_radius: number;
  is_active: boolean;
}

function seedCurrentUser() {
  const user = { id: "staff-1", name: "Mike Chen", email: "mike@fixflow.com", role: "staff" };
  if (typeof window !== "undefined") {
    try { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user)); } catch {}
  }
  return user;
}

function seedSites(): Site[] {
  const sites: Site[] = [
    { id: "site-lekki", organization_id: "demo-org", name: "Lekki Site", address: "Lekki Phase 1, Lagos", latitude: 6.4698, longitude: 3.5852, attendance_radius: 500, is_active: true },
    { id: "site-vi", organization_id: "demo-org", name: "Victoria Island", address: "Adetokunbo Ademola St, VI", latitude: 6.4281, longitude: 3.4219, attendance_radius: 500, is_active: true },
    { id: "site-ikeja", organization_id: "demo-org", name: "Ikeja GRA", address: "Isaac John St, Ikeja GRA", latitude: 6.5944, longitude: 3.3378, attendance_radius: 500, is_active: true },
    { id: "site-abuja", organization_id: "demo-org", name: "Abuja Plaza", address: "Central Business District, Abuja", latitude: 9.0579, longitude: 7.4951, attendance_radius: 500, is_active: true },
  ];
  if (typeof window !== "undefined") {
    try { localStorage.setItem(SITES_KEY, JSON.stringify(sites)); } catch {}
  }
  return sites;
}

function generateId(): string {
  return `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function seedAttendance(userId: string): Attendance[] {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yDay = yesterday.toISOString().split("T")[0];
  const events: Attendance[] = [
    { id: generateId(), user_id: userId, site_id: "site-lekki", type: "clock-in", timestamp: `${yesterday}T08:02:00.000Z`, verified: true, latitude: 6.4698, longitude: 3.5852 },
    { id: generateId(), user_id: userId, site_id: "site-lekki", type: "clock-out", timestamp: `${yesterday}T17:05:00.000Z`, verified: true, latitude: 6.4698, longitude: 3.5852 },
    { id: generateId(), user_id: userId, site_id: "site-vi", type: "clock-in", timestamp: `${today}T07:58:00.000Z`, verified: true, latitude: 6.4281, longitude: 3.4219 },
  ];
  if (typeof window !== "undefined") {
    try { localStorage.setItem(ATTENDANCE_EVENTS_KEY, JSON.stringify(events)); } catch {}
  }
  return events;
}

function getLocalUser(): { id: string; name: string; email: string; role: string } {
  if (typeof window === "undefined") return seedCurrentUser();
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id) return parsed;
    }
  } catch {}
  return seedCurrentUser();
}

function getLocalSites(): Site[] {
  if (typeof window === "undefined") return seedSites();
  try {
    const stored = localStorage.getItem(SITES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return seedSites();
}

function getLocalAttendance(userId: string): Attendance[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ATTENDANCE_EVENTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.filter((r: Attendance) => r.user_id === userId);
    }
  } catch {}
  const seeded = seedAttendance(userId);
  return seeded.filter((r) => r.user_id === userId);
}

function addLocalEvent(data: { user_id: string; site_id: string; type: "clock-in" | "clock-out"; latitude: number; longitude: number; verified: boolean }): Attendance {
  const existing = (() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(ATTENDANCE_EVENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  })();
  const record: Attendance = {
    id: generateId(),
    user_id: data.user_id,
    site_id: data.site_id,
    type: data.type,
    timestamp: new Date().toISOString(),
    verified: data.verified,
    latitude: data.latitude,
    longitude: data.longitude,
  };
  existing.push(record);
  if (typeof window !== "undefined") {
    try { localStorage.setItem(ATTENDANCE_EVENTS_KEY, JSON.stringify(existing)); } catch {}
  }
  return record;
}

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "checking" | "verified" | "denied">("idle");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLocationName, setGpsLocationName] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [historyTab, setHistoryTab] = useState("week");
  const [userId, setUserId] = useState("");
  const [staffName, setStaffName] = useState("Staff");
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [method, setMethod] = useState<"gps" | "qr">("gps");
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [qrStatus, setQrStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [qrRecordId, setQrRecordId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter((r) => r.timestamp.startsWith(todayStr));
  const clockInRecord = todayRecords.find((r) => r.type === "clock-in");
  const clockOutRecord = todayRecords.find((r) => r.type === "clock-out");
  const isClockedIn = !!clockInRecord && !clockOutRecord;
  const isClockedOut = !!clockInRecord && !!clockOutRecord;

  const loadRecords = () => {
    try {
      if (!userId) return;
      const data = getLocalAttendance(userId);
      setRecords(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const u = getLocalUser();
    if (u) {
      setUserId(u.id);
      setStaffName(u.name || u.email.split("@")[0]);
    }
    const s = getLocalSites();
    setSites(s.filter((site) => site.is_active));
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userId) loadRecords();
  }, [userId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const siteParam = params.get("site");
    if (siteParam) {
      setMethod("qr");
      setQrCodeInput(`fixflow://clock?site=${siteParam}`);
    }
  }, []);

  const requestGPS = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("GPS not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleClockIn = async () => {
    if (!userId || !selectedSiteId) return;
    setIsLoading(true);
    setGpsStatus("checking");
    try {
      const coords = await requestGPS();
      setGpsCoords(coords);
      setGpsStatus("verified");
      setGpsLocationName(`Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`);

      addLocalEvent({
        user_id: userId,
        site_id: selectedSiteId,
        type: "clock-in",
        latitude: coords.lat,
        longitude: coords.lng,
        verified: true,
      });
      loadRecords();
    } catch {
      setGpsStatus("denied");
      setShowManualInput(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualClockIn = async () => {
    if (!manualLocation.trim() || !userId || !selectedSiteId) return;
    setIsLoading(true);
    try {
      addLocalEvent({
        user_id: userId,
        site_id: selectedSiteId,
        type: "clock-in",
        latitude: 0,
        longitude: 0,
        verified: false,
      });
      setShowManualInput(false);
      setManualLocation("");
      loadRecords();
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!userId) return;
    setIsLoading(true);
    setGpsStatus("checking");
    try {
      const coords = await requestGPS();
      setGpsCoords(coords);
      setGpsStatus("verified");

      addLocalEvent({
        user_id: userId,
        site_id: selectedSiteId || "",
        type: "clock-out",
        latitude: coords.lat,
        longitude: coords.lng,
        verified: true,
      });
      loadRecords();
    } catch {
      setGpsStatus("denied");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async () => {
    if (!userId || !qrCodeInput.trim()) return;
    setIsLoading(true);
    setQrStatus("scanning");
    try {
      let siteName = "";
      const match = qrCodeInput.match(/[?&]site=([^&]+)/);
      if (match) {
        siteName = decodeURIComponent(match[1]);
      } else if (qrCodeInput.includes("fixflow://clock?")) {
        const parts = qrCodeInput.split("site=");
        if (parts.length > 1) siteName = decodeURIComponent(parts[1].split("&")[0]);
      } else {
        siteName = qrCodeInput.trim();
      }

      const qrSites = getSitesForQR();
      const matchedSite = qrSites.find(
        (s) => s.name.toLowerCase() === siteName.toLowerCase()
      );

      if (!matchedSite) {
        setQrStatus("error");
        setIsLoading(false);
        return;
      }

      let coords: { lat: number; lng: number } | null = null;
      try {
        coords = await requestGPS();
      } catch {
      }

      const record = clockInWithQR(userId, staffName, matchedSite.id, matchedSite.name, coords?.lat ?? null, coords?.lng ?? null);
      setQrRecordId(record.id);
      setQrStatus("success");
      setQrCodeInput("");
      loadRecords();
    } catch {
      setQrStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRClockOut = async () => {
    if (!qrRecordId && !clockInRecord) return;
    setIsLoading(true);
    try {
      const id = qrRecordId || clockInRecord?.id;
      if (!id) return;
      let coords: { lat: number; lng: number } | null = null;
      try {
        coords = await requestGPS();
      } catch {
      }
      qrClockOut(id, coords?.lat ?? null, coords?.lng ?? null);
      setQrRecordId(null);
      setQrStatus("idle");
      loadRecords();
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const clockInTime = clockInRecord
    ? new Date(clockInRecord.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  const clockOutTime = clockOutRecord
    ? new Date(clockOutRecord.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  const calcHours = () => {
    if (!clockInRecord || !clockOutRecord) return null;
    const start = new Date(clockInRecord.timestamp).getTime();
    const end = new Date(clockOutRecord.timestamp).getTime();
    return ((end - start) / (1000 * 60 * 60)).toFixed(1);
  };

  const hoursWorked = calcHours();
  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? null;

  function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const distance = gpsCoords && selectedSite
    ? getDistance(gpsCoords.lat, gpsCoords.lng, selectedSite.latitude, selectedSite.longitude)
    : null;
  const withinZone = distance !== null && distance <= (selectedSite?.attendance_radius ?? 100);

  const weekHistory = records.filter((r) => {
    const d = new Date(r.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  });

  const displayHistory = historyTab === "week" ? weekHistory : records;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
        <p className="text-secondary-foreground">Clock in/out with GPS or QR code</p>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1 w-fit">
        <button
          onClick={() => setMethod("gps")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            method === "gps"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Navigation className="h-4 w-4" />
          GPS Clock-In
        </button>
        <button
          onClick={() => setMethod("qr")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            method === "qr"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <QrCode className="h-4 w-4" />
          QR Code
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border bg-card">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <p className="text-lg text-muted-foreground">{formatDate(currentTime)}</p>
                <p className="text-5xl font-bold mt-2 font-mono text-foreground">
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>

              {method === "gps" && (
                <>
                  {gpsCoords && gpsStatus === "verified" && (
                    <div className="flex items-center justify-center mb-4">
                      <Badge variant="success" className="text-sm px-4 py-1.5 gap-2">
                        <MapPin className="h-4 w-4" />
                        GPS: {gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}
                      </Badge>
                    </div>
                  )}

                  {gpsStatus === "checking" && (
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Getting GPS location...</span>
                      </div>
                    </div>
                  )}

                  {gpsStatus === "denied" && !showManualInput && (
                    <div className="flex items-center justify-center mb-4">
                      <Badge variant="destructive" className="text-sm px-4 py-1.5 gap-2">
                        <XCircle className="h-4 w-4" />
                        GPS access denied
                      </Badge>
                    </div>
                  )}

                  <div className="flex justify-center mb-4">
                    <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                      <SelectTrigger className="w-72 border-input bg-background text-foreground">
                        <SelectValue placeholder="Select site for attendance..." />
                      </SelectTrigger>
                      <SelectContent className="border-input bg-card">
                        {sites.length === 0 ? (
                          <SelectItem value="_none" disabled>No sites available</SelectItem>
                        ) : (
                          sites.map((site) => (
                            <SelectItem key={site.id} value={site.id} className="text-foreground">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-primary" />
                                {site.name}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-center mb-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isClockedIn ? handleClockOut : handleClockIn}
                      disabled={isLoading || isClockedOut || (!isClockedIn && !selectedSiteId)}
                      className={cn(
                        "relative flex flex-col items-center justify-center w-48 h-48 rounded-full border-4 transition-all",
                        isClockedIn
                          ? "border-destructive bg-destructive/10"
                          : isClockedOut
                          ? "border-muted-foreground bg-muted-foreground/10 cursor-not-allowed opacity-60"
                          : selectedSiteId
                          ? "border-success bg-success/10"
                          : "border-[#444] bg-border/10 opacity-40",
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="absolute inset-2 rounded-full bg-card flex flex-col items-center justify-center">
                        {isLoading ? (
                          <Loader2 className="h-8 w-8 text-primary animate-spin mb-1" />
                        ) : isClockedIn ? (
                          <>
                            <LogOut className="h-8 w-8 text-destructive mb-1" />
                            <span className="text-lg font-bold text-destructive">Clock Out</span>
                            <span className="text-xs text-muted-foreground">Since {clockInTime}</span>
                          </>
                        ) : isClockedOut ? (
                          <>
                            <CheckCircle2 className="h-8 w-8 text-muted-foreground mb-1" />
                            <span className="text-lg font-bold text-muted-foreground">Completed</span>
                            <span className="text-xs text-muted-foreground">{hoursWorked}h worked</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="h-8 w-8 text-success mb-1" />
                            <span className="text-lg font-bold text-success">Clock In</span>
                            <span className="text-xs text-muted-foreground">{selectedSiteId ? "Tap to start shift" : "Select site first"}</span>
                          </>
                        )}
                      </div>
                    </motion.button>
                  </div>

                  {showManualInput && !isClockedIn && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 justify-center mb-4"
                    >
                      <Input
                        placeholder="Enter your location manually..."
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        className="max-w-xs border-border bg-background text-foreground placeholder:text-muted-foreground"
                      />
                      <Button onClick={handleManualClockIn} disabled={!manualLocation.trim()}>
                        <Navigation className="h-4 w-4 mr-1" /> Confirm
                      </Button>
                    </motion.div>
                  )}

                  {isClockedOut && (
                    <div className="text-center text-sm text-muted-foreground">
                      <p>Clock In: {clockInTime}</p>
                      <p>Clock Out: {clockOutTime}</p>
                      <p className="text-primary font-medium mt-1">Total: {hoursWorked} hours</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className={cn(
                      "text-center p-3 rounded-lg border",
                      gpsStatus === "verified" ? "border-success/30 bg-success/10" : "border-border bg-background"
                    )}>
                      <MapPin className={cn("h-5 w-5 mx-auto mb-1", gpsStatus === "verified" ? "text-success" : "text-muted-foreground")} />
                      <p className="text-xs font-medium text-foreground">GPS</p>
                      <p className="text-[10px] text-muted-foreground">{gpsStatus === "verified" ? "Verified" : gpsStatus === "denied" ? "Denied" : "Pending"}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg border border-border bg-background">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-xs font-medium text-foreground">Device</p>
                      <p className="text-[10px] text-muted-foreground">Verified</p>
                    </div>
                    <div className="text-center p-3 rounded-lg border border-border bg-background">
                      <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-medium text-foreground">Status</p>
                      <p className="text-[10px] text-muted-foreground">{isClockedIn ? "Active" : isClockedOut ? "Completed" : "N/A"}</p>
                    </div>
                  </div>
                </>
              )}

              {method === "qr" && (
                <>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30">
                      <ScanLine className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                      Enter or paste the QR code value to clock in at a site.
                      <br />
                      <span className="text-xs">Format: <code className="text-primary">fixflow://clock?site=Site+Name</code></span>
                    </p>

                    <div className="flex items-center gap-2 w-full max-w-md">
                      <Smartphone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Input
                        placeholder="Paste QR code value here..."
                        value={qrCodeInput}
                        onChange={(e) => setQrCodeInput(e.target.value)}
                        className="border-border bg-background text-foreground placeholder:text-muted-foreground flex-1"
                      />
                    </div>

                    {qrStatus === "error" && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <XCircle className="h-4 w-4" />
                        Invalid QR code or site not found
                      </div>
                    )}

                    {qrStatus === "success" && (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Clock-in successful via QR
                      </div>
                    )}

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleQRScan}
                        disabled={isLoading || !qrCodeInput.trim()}
                        className={cn(
                          "relative flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 transition-all",
                          qrStatus === "success" || isClockedIn
                            ? "border-muted-foreground bg-muted-foreground/10 cursor-not-allowed opacity-60"
                            : "border-primary bg-primary/10",
                          isLoading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="absolute inset-2 rounded-full bg-card flex flex-col items-center justify-center">
                          {isLoading ? (
                            <Loader2 className="h-7 w-7 text-primary animate-spin mb-1" />
                          ) : qrStatus === "success" || isClockedIn ? (
                            <>
                              <CheckCircle2 className="h-7 w-7 text-muted-foreground mb-1" />
                              <span className="text-xs font-bold text-muted-foreground">Clocked In</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="h-7 w-7 text-primary mb-1" />
                              <span className="text-xs font-bold text-primary">Scan &amp; In</span>
                              <span className="text-[10px] text-muted-foreground">Tap to clock</span>
                            </>
                          )}
                        </div>
                      </motion.button>

                      {isClockedIn && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleQRClockOut}
                          disabled={isLoading}
                          className="relative flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 border-destructive bg-destructive/10 transition-all"
                        >
                          <div className="absolute inset-2 rounded-full bg-card flex flex-col items-center justify-center">
                            <LogOut className="h-7 w-7 text-destructive mb-1" />
                            <span className="text-xs font-bold text-destructive">Clock Out</span>
                            <span className="text-[10px] text-muted-foreground">End shift</span>
                          </div>
                        </motion.button>
                      )}
                    </div>

                    {qrStatus === "success" && (
                      <p className="text-xs text-muted-foreground">
                        QR clock-in recorded. You can now use the GPS method or the QR button above to clock out.
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Attendance History
              </CardTitle>
              <CardDescription className="text-muted-foreground">Your recent records</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="week" value={historyTab} onValueChange={setHistoryTab}>
                <TabsList className="bg-secondary mb-3">
                  <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                </TabsList>
                <TabsContent value={historyTab}>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : displayHistory.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">No records found</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {displayHistory.map((r) => {
                        const isIn = r.type === "clock-in";
                        return (
                          <div
                            key={r.id}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background/50"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={cn(
                                "h-2 w-2 rounded-full flex-shrink-0",
                                isIn ? "bg-success" : "bg-primary"
                              )} />
                              <div className="min-w-0">
                                <p className="text-xs text-foreground">
                                  {new Date(r.timestamp).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <span>{isIn ? "Clock In" : "Clock Out"}: {new Date(r.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              {r.verified ? (
                                <Badge className="bg-success/10 text-success text-[10px] px-1.5 py-0">GPS</Badge>
                              ) : (
                                <Badge className="bg-mustard/10 text-mustard text-[10px] px-1.5 py-0">Manual</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                Geofence Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSite ? (
                <p className="text-center text-sm text-muted-foreground py-4">Select a site above to view geofence info</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Site</span>
                    <span className="font-medium text-foreground">{selectedSite.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Latitude</span>
                    <span className="font-mono text-foreground">{selectedSite.latitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Longitude</span>
                    <span className="font-mono text-foreground">{selectedSite.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Radius</span>
                    <span className="font-medium text-foreground">{selectedSite.attendance_radius ?? 100} meters</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Distance</span>
                    <span className={cn(
                      "font-medium",
                      withinZone ? "text-success" : distance !== null ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {distance !== null
                        ? `${distance.toFixed(1)}m ${withinZone ? "(Within zone)" : "(Outside zone)"}`
                        : "Pending GPS"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
