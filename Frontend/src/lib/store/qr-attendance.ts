export interface SiteQRCode {
  id: string;
  siteId: string;
  siteName: string;
  location: string;
  qrValue: string;
  createdAt: string;
  isActive: boolean;
  scansToday: number;
}

// Flag to track if API is available (toggles to false after first failure)
let apiAvailable = true;

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  siteId: string;
  siteName: string;
  clockIn: string;
  clockOut: string | null;
  date: string;
  method: "QR" | "GPS";
  gpsLat: number;
  gpsLng: number;
  gpsAccuracy: number;
  expectedLat: number;
  expectedLng: number;
  distanceFromSite: number;
  isSuspicious: boolean;
  suspiciousReason: string;
  status: "present" | "late" | "absent";
  notes: string;
}

export const SITE_COORDS: Record<string, { lat: number; lng: number }> = {
  "Lekki Site": { lat: 6.4698, lng: 3.5852 },
  "Victoria Island": { lat: 6.4281, lng: 3.4219 },
  "Ikeja GRA": { lat: 6.5944, lng: 3.3378 },
  "Abuja Plaza": { lat: 9.0579, lng: 7.4951 },
  "PH Hub": { lat: 4.8156, lng: 7.0498 },
};

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const QR_STORAGE_KEY = "fixflow-site-qrcodes";
const ATTENDANCE_STORAGE_KEY = "fixflow-qr-attendance";

const now = new Date();
const daysAgo = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const dayStr = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};
const timeStr = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

function seedSiteQRCodes(): SiteQRCode[] { return []; }
function seedAttendanceRecords(): AttendanceRecord[] { return []; }
function loadQRCodes(): SiteQRCode[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(QR_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveQRCodes(codes: SiteQRCode[]): void {
  localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(codes));
}

function loadAttendanceRecords(): AttendanceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveAttendanceRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
}

function mapDTOToSiteQRCode(dto: { id: string; site_id: string; site_name: string; location: string; qr_value: string; is_active: boolean; scans_today: number; created_at: string }): SiteQRCode {
  return {
    id: dto.id,
    siteId: dto.site_id,
    siteName: dto.site_name,
    location: dto.location || "",
    qrValue: dto.qr_value,
    createdAt: dto.created_at,
    isActive: dto.is_active,
    scansToday: dto.scans_today,
  };
}

export async function getSiteQRCodesAsync(): Promise<SiteQRCode[]> {
  if (!apiAvailable) return loadQRCodes();
  try {
    const { getSiteQRCodesApi } = await import("@/lib/api/qr-codes-api");
    const dtos = await getSiteQRCodesApi();
    if (dtos && dtos.length > 0) {
      const mapped = dtos.map(mapDTOToSiteQRCode);
      saveQRCodes(mapped);
      return mapped;
    }
  } catch {
    apiAvailable = false;
  }
  return loadQRCodes();
}

export function getSiteQRCodes(): SiteQRCode[] {
  return loadQRCodes();
}

export function getSiteQRCode(siteId: string): SiteQRCode | undefined {
  return loadQRCodes().find((q) => q.siteId === siteId);
}

export async function generateSiteQRAsync(siteId: string, siteName: string, location: string): Promise<SiteQRCode> {
  if (apiAvailable) {
    try {
      const { createSiteQRApi } = await import("@/lib/api/qr-codes-api");
      const dto = await createSiteQRApi(siteId, siteName, location);
      const mapped = mapDTOToSiteQRCode(dto);
      const codes = loadQRCodes();
      const idx = codes.findIndex((q) => q.siteId === siteId);
      if (idx >= 0) codes[idx] = mapped;
      else codes.push(mapped);
      saveQRCodes(codes);
      return mapped;
    } catch {
      apiAvailable = false;
    }
  }
  return generateSiteQR(siteId, siteName, location);
}

export function generateSiteQR(siteId: string, siteName: string, location: string): SiteQRCode {
  const codes = loadQRCodes();
  const existing = codes.find((q) => q.siteId === siteId);
  if (existing) {
    existing.qrValue = `fixflow://clock?site=${encodeURIComponent(siteName)}&ts=${Date.now()}`;
    existing.createdAt = new Date().toISOString();
    existing.isActive = true;
    saveQRCodes(codes);
    return existing;
  }
  const newQR: SiteQRCode = {
    id: `QR-${String(codes.length + 1).padStart(3, "0")}`,
    siteId,
    siteName,
    location,
    qrValue: `fixflow://clock?site=${encodeURIComponent(siteName)}`,
    createdAt: new Date().toISOString(),
    isActive: true,
    scansToday: 0,
  };
  codes.push(newQR);
  saveQRCodes(codes);
  return newQR;
}

export async function toggleQRStatusAsync(siteId: string): Promise<SiteQRCode | null> {
  if (apiAvailable) {
    try {
      const codes = loadQRCodes();
      const existing = codes.find((q) => q.siteId === siteId);
      if (!existing) return null;
      const { toggleSiteQRApi } = await import("@/lib/api/qr-codes-api");
      const dto = await toggleSiteQRApi(existing.id);
      const mapped = mapDTOToSiteQRCode(dto);
      const idx = codes.findIndex((q) => q.id === existing.id);
      if (idx >= 0) codes[idx] = mapped;
      saveQRCodes(codes);
      return mapped;
    } catch {
      apiAvailable = false;
    }
  }
  return toggleQRStatus(siteId);
}

export function toggleQRStatus(siteId: string): SiteQRCode | null {
  const codes = loadQRCodes();
  const qr = codes.find((q) => q.siteId === siteId);
  if (!qr) return null;
  qr.isActive = !qr.isActive;
  saveQRCodes(codes);
  return qr;
}

export function getAttendanceRecords(): AttendanceRecord[] {
  return loadAttendanceRecords();
}

export function getTodayAttendance(): AttendanceRecord[] {
  const today = new Date().toISOString().split("T")[0];
  return loadAttendanceRecords().filter((r) => r.date === today);
}

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  return loadAttendanceRecords().filter((r) => r.date === date);
}

export function getAttendanceSummary(date: string): {
  present: number;
  late: number;
  absent: number;
  suspicious: number;
} {
  const records = loadAttendanceRecords().filter((r) => r.date === date);
  return {
    present: records.filter((r) => r.status === "present" && !r.isSuspicious).length,
    late: records.filter((r) => r.status === "late").length,
    absent: records.filter((r) => r.status === "absent").length,
    suspicious: records.filter((r) => r.isSuspicious).length,
  };
}

export function clockInWithQR(
  staffId: string,
  staffName: string,
  siteId: string,
  siteName: string,
  gpsLat: number | null,
  gpsLng: number | null
): AttendanceRecord {
  const records = loadAttendanceRecords();
  const coords = SITE_COORDS[siteName] || { lat: 0, lng: 0 };
  let distance = 0;
  let isSuspicious = false;
  let suspiciousReason = "";

  if (gpsLat !== null && gpsLng !== null) {
    distance = Math.round(calculateDistance(gpsLat, gpsLng, coords.lat, coords.lng));
    if (distance > 500) {
      isSuspicious = true;
      suspiciousReason = `Clocked in ${distance >= 1000 ? (distance / 1000).toFixed(1) + "km" : distance + "m"} from site location`;
    }
  } else {
    suspiciousReason = "GPS unavailable during clock-in";
  }

  const newRecord: AttendanceRecord = {
    id: `ATT-${Date.now()}-${staffId}`,
    staffId,
    staffName,
    siteId,
    siteName,
    clockIn: new Date().toISOString(),
    clockOut: null,
    date: new Date().toISOString().split("T")[0],
    method: "QR",
    gpsLat: gpsLat ?? 0,
    gpsLng: gpsLng ?? 0,
    gpsAccuracy: 0,
    expectedLat: coords.lat,
    expectedLng: coords.lng,
    distanceFromSite: distance,
    isSuspicious,
    suspiciousReason,
    status: "present",
    notes: "",
  };

  records.push(newRecord);
  saveAttendanceRecords(records);
  return newRecord;
}

export function clockOut(recordId: string, gpsLat: number | null, gpsLng: number | null): AttendanceRecord | null {
  const records = loadAttendanceRecords();
  const index = records.findIndex((r) => r.id === recordId);
  if (index === -1) return null;
  records[index].clockOut = new Date().toISOString();
  if (gpsLat !== null && gpsLng !== null) {
    records[index].gpsLat = gpsLat;
    records[index].gpsLng = gpsLng;
  }
  saveAttendanceRecords(records);
  return records[index];
}

export function markSuspicious(recordId: string, reason: string): AttendanceRecord | null {
  const records = loadAttendanceRecords();
  const r = records.find((rec) => rec.id === recordId);
  if (!r) return null;
  r.isSuspicious = true;
  r.suspiciousReason = reason;
  saveAttendanceRecords(records);
  return r;
}

export function clearSuspicious(recordId: string): AttendanceRecord | null {
  const records = loadAttendanceRecords();
  const r = records.find((rec) => rec.id === recordId);
  if (!r) return null;
  r.isSuspicious = false;
  r.suspiciousReason = "";
  saveAttendanceRecords(records);
  return r;
}

export function updateAttendanceNotes(recordId: string, notes: string): AttendanceRecord | null {
  const records = loadAttendanceRecords();
  const r = records.find((rec) => rec.id === recordId);
  if (!r) return null;
  r.notes = notes;
  saveAttendanceRecords(records);
  return r;
}

export function deleteAttendanceRecord(recordId: string): boolean {
  const records = loadAttendanceRecords();
  const idx = records.findIndex((rec) => rec.id === recordId);
  if (idx === -1) return false;
  records.splice(idx, 1);
  saveAttendanceRecords(records);
  return true;
}

export function getSitesForQR(): { id: string; name: string; coords: { lat: number; lng: number } }[] {
  return Object.entries(SITE_COORDS).map(([name, coords]) => ({
    id: `site-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    coords,
  }));
}

export function exportAttendanceCSV(records: AttendanceRecord[]): string {
  const header = "Staff Name,Site,Date,Clock In,Clock Out,Hours,Method,Status,Distance (m),Suspicious,Notes";
  const rows = records.map((r) => {
    const hours = r.clockOut
      ? ((new Date(r.clockOut).getTime() - new Date(r.clockIn).getTime()) / 3600000).toFixed(1)
      : "—";
    return `${r.staffName},${r.siteName},${r.date},${new Date(r.clockIn).toLocaleTimeString()},${r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : "—"},${hours},${r.method},${r.status},${r.distanceFromSite},${r.isSuspicious ? "Yes" : "No"},"${r.notes}"`;
  });
  return header + "\n" + rows.join("\n");
}
