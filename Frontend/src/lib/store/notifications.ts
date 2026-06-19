export interface Notification {
  id: string;
  icon: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "overdue" | "work_order" | "clock_in" | "inventory" | "inspection";
}

const mockNotifications: Notification[] = [];

const STORAGE_KEY = "fixflow-notifications";

function loadNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
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
