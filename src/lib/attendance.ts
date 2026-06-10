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

const staffList = [
  { id: "s1", name: "Mike Chen" },
  { id: "s2", name: "Sarah Lee" },
  { id: "s3", name: "John Doe" },
  { id: "s4", name: "Emma Wilson" },
  { id: "s5", name: "Tom Green" },
  { id: "s6", name: "Lisa Park" },
  { id: "s7", name: "James Brown" },
  { id: "s8", name: "Anna Kim" },
];

const locations = [
  { lat: 40.7128, lng: -74.006, name: "Building A" },
  { lat: 40.7142, lng: -74.008, name: "Building B" },
  { lat: 40.7155, lng: -74.01, name: "Building C" },
  { lat: 40.711, lng: -74.004, name: "Warehouse" },
];

function randomTime(hourBase: number, minuteVariation: number): string {
  const h = hourBase;
  const m = Math.floor(Math.random() * minuteVariation);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${ampm}`;
}

function randomLocation() {
  return locations[Math.floor(Math.random() * locations.length)];
}

function generateAttendanceData(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let idCounter = 1;

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(Date.now() - dayOffset * 86400000);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    const dateStr = date.toISOString().split("T")[0];

    for (const staff of staffList) {
      const isAbsent = Math.random() < 0.1;
      if (isAbsent) {
        records.push({
          id: `att-${idCounter++}`,
          staffId: staff.id,
          staffName: staff.name,
          date: dateStr,
          clockIn: null,
          clockOut: null,
          clockInLocation: null,
          clockOutLocation: null,
          status: "absent",
          hoursWorked: null,
        });
        continue;
      }

      const isLate = Math.random() < 0.2;
      const clockInHour = isLate ? 8 + Math.floor(Math.random() * 2) + 1 : 7 + Math.floor(Math.random() * 2);
      const clockInMin = Math.floor(Math.random() * 60);
      const clockInStr = `${clockInHour > 12 ? clockInHour - 12 : clockInHour === 0 ? 12 : clockInHour}:${String(clockInMin).padStart(2, "0")} ${clockInHour >= 12 ? "PM" : "AM"}`;

      const workedMinutes = 8 * 60 + Math.floor(Math.random() * 60);
      const clockOutTotalMin = clockInHour * 60 + clockInMin + workedMinutes;
      const outH = Math.floor(clockOutTotalMin / 60);
      const outM = clockOutTotalMin % 60;
      const clockOutStr = `${outH > 12 ? outH - 12 : outH === 0 ? 12 : outH}:${String(outM).padStart(2, "0")} ${outH >= 12 ? "PM" : "AM"}`;

      const locIn = randomLocation();
      const locOut = randomLocation();

      records.push({
        id: `att-${idCounter++}`,
        staffId: staff.id,
        staffName: staff.name,
        date: dateStr,
        clockIn: clockInStr,
        clockOut: clockOutStr,
        clockInLocation: locIn,
        clockOutLocation: locOut,
        status: isLate ? "late" : "present",
        hoursWorked: Math.round((workedMinutes / 60) * 10) / 10,
      });
    }
  }

  return records.sort((a, b) => b.date.localeCompare(a.date) || a.staffName.localeCompare(b.staffName));
}

const STORAGE_KEY = "fixflow-attendance";

function loadAttendance(): AttendanceRecord[] {
  if (typeof window === "undefined") return generateAttendanceData();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const initial = generateAttendanceData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
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
