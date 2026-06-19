export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  clockInLocation: { lat: number; lng: number; name: string } | null;
  clockOutLocation: { lat: number; lng: number; name: string } | null;
  status: "present" | "late" | "absent";
  hoursWorked: number | null;
}

export const staffList: { id: string; name: string }[] = [];

const locations: { lat: number; lng: number; name: string }[] = [];

function randomLocation() { return locations[0] || { lat: 0, lng: 0, name: "" }; }

function generateAttendanceData(): AttendanceRecord[] { return []; }
const STORAGE_KEY = "fixflow-attendance";

function loadAttendance(): AttendanceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveAttendance(records: AttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getAttendance(): AttendanceRecord[] {
  return loadAttendance();
}

export function getAttendanceByDate(date: string): AttendanceRecord[] {
  return loadAttendance().filter((r) => r.date === date);
}

export function getTodayAttendance(): AttendanceRecord[] {
  const today = new Date().toISOString().split("T")[0];
  return getAttendanceByDate(today);
}

export function clockIn(staffId: string, staffName: string, location: { lat: number; lng: number; name: string }): AttendanceRecord {
  const records = loadAttendance();
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayH = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const timeStr = `${displayH}:${String(minutes).padStart(2, "0")} ${ampm}`;
  const isLate = hours > 8 || (hours === 8 && minutes > 0);

  const newRecord: AttendanceRecord = {
    id: `att-${Date.now()}`,
    staffId,
    staffName,
    date: today,
    clockIn: timeStr,
    clockOut: null,
    clockInLocation: location,
    clockOutLocation: null,
    status: isLate ? "late" : "present",
    hoursWorked: null,
  };

  const existing = records.findIndex((r) => r.staffId === staffId && r.date === today);
  if (existing >= 0) {
    records[existing] = { ...records[existing], ...newRecord };
  } else {
    records.unshift(newRecord);
  }
  saveAttendance(records);
  return newRecord;
}

export function clockOut(staffId: string, location: { lat: number; lng: number; name: string }): AttendanceRecord | null {
  const records = loadAttendance();
  const today = new Date().toISOString().split("T")[0];
  const idx = records.findIndex((r) => r.staffId === staffId && r.date === today);
  if (idx === -1) return null;

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayH = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const timeStr = `${displayH}:${String(minutes).padStart(2, "0")} ${ampm}`;

  records[idx].clockOut = timeStr;
  records[idx].clockOutLocation = location;

  if (records[idx].clockIn) {
    const [inH, inM] = records[idx].clockIn.match(/(\d+):(\d+)/)?.slice(1).map(Number) || [0, 0];
    const inAmPm = records[idx].clockIn.includes("PM") ? 12 : 0;
    const totalInMin = (inH % 12) * 60 + inM + (records[idx].clockIn.includes("PM") ? 12 * 60 : 0);
    const totalOutMin = (hours % 12) * 60 + minutes + (hours >= 12 ? 12 * 60 : 0);
    const worked = (totalOutMin - totalInMin) / 60;
    records[idx].hoursWorked = Math.round(worked * 10) / 10;
  }

  saveAttendance(records);
  return records[idx];
}

export function getAttendanceSummary() {
  const records = loadAttendance();
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;
  return { total, present, late, absent };
}

export function getStaffList() {
  return staffList;
}
