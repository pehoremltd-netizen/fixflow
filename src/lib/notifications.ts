export interface Notification {
  id: string;
  icon: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "overdue" | "work_order" | "clock_in" | "inventory" | "inspection";
}

const mockNotifications: Notification[] = [
  { id: "n1", icon: "AlertTriangle", title: "Overdue Maintenance", message: "HVAC Unit #3 maintenance overdue by 5 days", timestamp: new Date(Date.now() - 30 * 60000).toISOString(), read: false, type: "overdue" },
  { id: "n2", icon: "Wrench", title: "Work Order Updated", message: "WO-0042 status changed to In Progress", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false, type: "work_order" },
  { id: "n3", icon: "UserCheck", title: "Staff Clock-In", message: "Mike Chen clocked in at Building A", timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), read: false, type: "clock_in" },
  { id: "n4", icon: "Package", title: "Low Inventory Alert", message: "Air filters below minimum threshold (3 remaining)", timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), read: false, type: "inventory" },
  { id: "n5", icon: "ClipboardCheck", title: "Inspection Due", message: "Fire safety inspection for West Wing due tomorrow", timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), read: false, type: "inspection" },
  { id: "n6", icon: "AlertTriangle", title: "Overdue Maintenance", message: "Generator #1 service overdue by 2 days", timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), read: false, type: "overdue" },
  { id: "n7", icon: "Wrench", title: "Work Order Created", message: "WO-0043 - Emergency elevator repair assigned to Sarah Lee", timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), read: false, type: "work_order" },
  { id: "n8", icon: "UserCheck", title: "Staff Clock-Out", message: "Emma Wilson clocked out from Building B", timestamp: new Date(Date.now() - 26 * 3600000).toISOString(), read: true, type: "clock_in" },
  { id: "n9", icon: "Package", title: "Inventory Restocked", message: "Cleaning supplies restocked - 50 units added", timestamp: new Date(Date.now() - 30 * 3600000).toISOString(), read: true, type: "inventory" },
  { id: "n10", icon: "ClipboardCheck", title: "Inspection Completed", message: "Electrical panel inspection completed by John Doe", timestamp: new Date(Date.now() - 36 * 3600000).toISOString(), read: true, type: "inspection" },
  { id: "n11", icon: "AlertTriangle", title: "Overdue Maintenance", message: "Chiller #2 annual maintenance overdue by 1 week", timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), read: true, type: "overdue" },
  { id: "n12", icon: "Wrench", title: "Work Order Completed", message: "WO-0040 - Plumbing repair marked as completed", timestamp: new Date(Date.now() - 52 * 3600000).toISOString(), read: true, type: "work_order" },
  { id: "n13", icon: "UserCheck", title: "Staff Late Clock-In", message: "Sarah Lee clocked in late (8:15 AM)", timestamp: new Date(Date.now() - 72 * 3600000).toISOString(), read: true, type: "clock_in" },
  { id: "n14", icon: "Package", title: "Low Inventory Alert", message: "Safety gloves below minimum threshold (2 remaining)", timestamp: new Date(Date.now() - 80 * 3600000).toISOString(), read: false, type: "inventory" },
  { id: "n15", icon: "ClipboardCheck", title: "Inspection Due", message: "HVAC filter inspection due for Building A, B, C", timestamp: new Date(Date.now() - 96 * 3600000).toISOString(), read: true, type: "inspection" },
  { id: "n16", icon: "AlertTriangle", title: "Critical Overdue", message: "Fire extinguisher certification expired at Site 3", timestamp: new Date(Date.now() - 100 * 3600000).toISOString(), read: false, type: "overdue" },
  { id: "n17", icon: "Wrench", title: "Work Order Assigned", message: "WO-0044 - Roof inspection assigned to Mike Chen", timestamp: new Date(Date.now() - 110 * 3600000).toISOString(), read: true, type: "work_order" },
  { id: "n18", icon: "UserCheck", title: "Staff Clock-In", message: "John Doe clocked in at Warehouse", timestamp: new Date(Date.now() - 120 * 3600000).toISOString(), read: true, type: "clock_in" },
  { id: "n19", icon: "Package", title: "Inventory Alert", message: "LED bulbs low stock - 8 remaining, reorder soon", timestamp: new Date(Date.now() - 130 * 3600000).toISOString(), read: true, type: "inventory" },
  { id: "n20", icon: "ClipboardCheck", title: "Inspection Scheduled", message: "Monthly safety inspection scheduled for next week", timestamp: new Date(Date.now() - 140 * 3600000).toISOString(), read: false, type: "inspection" },
];

const STORAGE_KEY = "fixflow-notifications";

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return mockNotifications;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const initial = mockNotifications;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function getNotifications(): Notification[] {
  return loadNotifications();
}

export function markAsRead(id: string): Notification[] {
  const notifications = loadNotifications();
  const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
  return updated;
}

export function markAllAsRead(): Notification[] {
  const notifications = loadNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
  return updated;
}

export function getUnreadCount(): number {
  return loadNotifications().filter((n) => !n.read).length;
}

export function getTimeAgo(timestamp: string): string {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
