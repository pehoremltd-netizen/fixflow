"use client";

export type OgbaFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly";

export interface OgbaActivity {
  id: string;
  section: string;
  activity: string;
  tasks: string[];
  frequency: OgbaFrequency;
}

export interface OgbaReportEntry {
  activityId: string;
  reportUpdate: string;
  notes: string;
  timestamp: string;
}

export interface OgbaDailyReport {
  date: string;
  entries: Record<string, OgbaReportEntry>;
}

export interface CoverMemo {
  recipients: string;
  message: string;
  preparedBy: string;
}

const STORAGE_KEY = "fixflow-ogba-reports";
const COVER_MEMO_KEY = "fixflow-ogba-cover-memo";

export const OGBA_ACTIVITIES: OgbaActivity[] = [
  {
    id: "ogba-facility-outlook",
    section: "Konga Facility Ogba",
    activity: "Facility & Office Outlook",
    tasks: [
      "Ensure thorough cleaning and tidiness of the office area, warehouse and the surroundings.",
      "Liaise with Teknokleen janitors and supervisor for efficiency.",
    ],
    frequency: "Daily",
  },
  {
    id: "ogba-office-supplies",
    section: "Konga Facility Ogba",
    activity: "Office Supplies and Toiletries",
    tasks: [
      "Send request to Faith Okoro for warehouse release or new purchase.",
      "Data of office supplies is saved on an excel sheet.",
    ],
    frequency: "Monthly",
  },
  {
    id: "ogba-repairs-maintenance",
    section: "Konga Facility Ogba",
    activity: "Repairs and Maintenance",
    tasks: [
      "Identify fault within the facility and coordinate the necessary vendor to handle repairs/maintenance.",
      "Electrical faults/maintenance are handled by in-house technicians.",
      "Fire extinguisher servicing (next period of servicing August). Check cylinders to confirm dates of renewal.",
      "Vendors details are listed in the attached file.",
    ],
    frequency: "Monthly",
  },
  {
    id: "ogba-finance-payment",
    section: "Konga Facility Ogba",
    activity: "Finance (Payment Process)",
    tasks: [
      "Send approval request to the Head of Admin.",
      "Request a second level approval by COO.",
      "Fill the payment request form and submit to Audit & finance for review and payment disbursal.",
    ],
    frequency: "Weekly",
  },
  {
    id: "ogba-vendor-engagement",
    section: "Konga Facility Ogba",
    activity: "Vendor Engagement",
    tasks: [
      "Update the vendor list with details retrieved from invoices.",
      "Retrieve invoices from 2 - 3 vendors to compare prices and do a minimum of 5% discount through negotiation.",
      "Agreement on 70-80% initial deposit with vendors for commencement of work and 20-30% balance after completion of work.",
    ],
    frequency: "Monthly",
  },
  {
    id: "ogba-local-government-levies",
    section: "Konga Facility Ogba",
    activity: "Local Government Levies & Fees",
    tasks: [
      "Ensure the timely payment of annual local government levies.",
      "Negotiate where applicable and retrieve the necessary certificates.",
    ],
    frequency: "Monthly",
  },
  {
    id: "ogba-abuja-support",
    section: "Konga Facility Ogba",
    activity: "Abuja Facility Support",
    tasks: [
      "Receive all admin request for Abuja and assist with obtaining approvals and payment initiation.",
      "The warehouse manager obtains invoice from vendors in Abuja and shares for approval.",
    ],
    frequency: "Monthly",
  },
  {
    id: "ogba-fumigation",
    section: "Konga Facility Ogba",
    activity: "Fumigation",
    tasks: [
      "Timely fumigation of the facility.",
      "Retrieve at least 2 invoices before proceeding to get approvals.",
    ],
    frequency: "Quarterly",
  },
];

export function getActivitiesByFrequency(frequency: OgbaFrequency): OgbaActivity[] {
  return OGBA_ACTIVITIES.filter((a) => a.frequency === frequency);
}

export function getFrequencies(): OgbaFrequency[] {
  return ["Daily", "Weekly", "Monthly", "Quarterly"];
}

function loadReport(date: string): OgbaDailyReport {
  if (typeof window === "undefined") return { date, entries: {} };
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${date}`);
    if (raw) return JSON.parse(raw) as OgbaDailyReport;
  } catch {}
  return { date, entries: {} };
}

function saveReport(report: OgbaDailyReport): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_KEY}-${report.date}`, JSON.stringify(report));
}

export function saveReportEntry(date: string, activityId: string, entry: OgbaReportEntry): void {
  const report = loadReport(date);
  report.entries[activityId] = entry;
  saveReport(report);
}

export function loadReportEntries(date: string): Record<string, OgbaReportEntry> {
  return loadReport(date).entries;
}

export function loadCoverMemo(): CoverMemo {
  if (typeof window === "undefined") {
    return { recipients: "", message: "", preparedBy: "" };
  }
  try {
    const raw = localStorage.getItem(COVER_MEMO_KEY);
    if (raw) return JSON.parse(raw) as CoverMemo;
  } catch {}
  return { recipients: "Head of Admin | COO | Audit | Finance", message: "", preparedBy: "" };
}

export function saveCoverMemo(memo: CoverMemo): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COVER_MEMO_KEY, JSON.stringify(memo));
}
