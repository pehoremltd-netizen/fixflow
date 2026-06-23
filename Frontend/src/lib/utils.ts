import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function generateId() {
  return crypto.randomUUID();
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    active: "bg-success/10 text-success",
    completed: "bg-info/10 text-info",
    approved: "bg-success/10 text-success",
    rejected: "bg-destructive/10 text-destructive",
    "in-progress": "bg-info/10 text-info",
    closed: "bg-muted text-muted-foreground",
    cancelled: "bg-muted text-muted-foreground",
    overdue: "bg-destructive/10 text-destructive",
    scheduled: "bg-accent/10 text-accent-foreground",
  };
  return colors[status.toLowerCase()] || "bg-muted text-muted-foreground";
}

export function getRoleColor(role: string) {
  const colors: Record<string, string> = {
    admin: "bg-primary/10 text-primary",
    manager: "bg-info/10 text-info",
    supervisor: "bg-warning/10 text-warning",
    staff: "bg-success/10 text-success",
    upline_manager: "bg-accent/10 text-accent-foreground",
    tenant: "bg-info/10 text-info",
  };
  return colors[role.toLowerCase()] || "bg-muted text-muted-foreground";
}
