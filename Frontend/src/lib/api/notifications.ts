"use client";

import { api } from "./client";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  icon: string;
  read: boolean;
  created_at: string;
}

export async function getNotifications(userId: string) {
  const data = await api.get<{ data: Notification[] }>(`/notifications?user_id=${userId}`);
  return data.data;
}

export async function markAsRead(id: string) {
  const data = await api.patch<{ data: Notification }>(`/notifications/${id}/read`);
  return data.data;
}

export async function markAllAsRead(userId: string) {
  await api.post("/notifications/read-all", { user_id: userId });
}
