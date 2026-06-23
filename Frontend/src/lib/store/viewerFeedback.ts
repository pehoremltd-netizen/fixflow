"use client";

import type { ViewerFeedback, FeedbackStatus } from "@/types";
import * as api from "../api/upline-manager";

const STORAGE_KEY = "fixflow-viewer-feedback";
const MIGRATED_KEY = "migrated_upline_manager";

let cache: ViewerFeedback[] | null = null;

function loadFromStorage(): ViewerFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveToStorage(items: ViewerFeedback[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function isMigrated(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(MIGRATED_KEY) === "true";
}

function markMigrated() {
  if (typeof window === "undefined") return;
  localStorage.setItem(MIGRATED_KEY, "true");
}

async function ensureLoaded(): Promise<ViewerFeedback[]> {
  if (cache) return cache;
  const local = loadFromStorage();
  try {
    const remote = await api.fetchFeedback();
    if (!isMigrated() && local.length > 0) {
      try {
        await api.migrateFeedback(local);
      } catch {}
      markMigrated();
    }
    cache = remote;
    saveToStorage(remote);
    return remote;
  } catch {
    cache = local;
    return local;
  }
}

export async function createFeedback(
  viewerName: string,
  viewerEmail: string,
  pageContext: string,
  pageLabel: string,
  commentText: string,
  uplineManagerLinkId?: string,
): Promise<ViewerFeedback> {
  const fb: ViewerFeedback = {
    id: crypto.randomUUID(),
    viewerName,
    viewerEmail,
    uplineManagerLinkId,
    pageContext,
    pageLabel,
    commentText,
    createdAt: new Date().toISOString(),
    status: "New",
    ajoseResponse: "",
  };
  try {
    const created = await api.createFeedback({
      viewerName: fb.viewerName,
      viewerEmail: fb.viewerEmail,
      uplineManagerLinkId: fb.uplineManagerLinkId,
      pageContext: fb.pageContext,
      pageLabel: fb.pageLabel,
      commentText: fb.commentText,
      status: fb.status,
    });
    const items = await ensureLoaded();
    items.unshift(created);
    cache = items;
    saveToStorage(items);
    return created;
  } catch {
    const items = await ensureLoaded();
    items.unshift(fb);
    cache = items;
    saveToStorage(items);
    return fb;
  }
}

export async function getFeedback(): Promise<ViewerFeedback[]> {
  return ensureLoaded();
}

export async function getFeedbackById(id: string): Promise<ViewerFeedback | undefined> {
  const items = await ensureLoaded();
  return items.find((f) => f.id === id);
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus) {
  try {
    await api.updateFeedback(id, { status });
  } catch {}
  const items = await ensureLoaded();
  const idx = items.findIndex((f) => f.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], status };
  cache = items;
  saveToStorage(items);
}

export async function updateFeedbackResponse(id: string, response: string) {
  try {
    await api.updateFeedback(id, { ajoseResponse: response });
  } catch {}
  const items = await ensureLoaded();
  const idx = items.findIndex((f) => f.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], ajoseResponse: response };
  cache = items;
  saveToStorage(items);
}

export async function deleteFeedback(id: string) {
  try {
    await api.deleteFeedback(id);
  } catch {}
  const items = await ensureLoaded();
  cache = items.filter((f) => f.id !== id);
  saveToStorage(cache);
}

export async function getNewFeedbackCount(): Promise<number> {
  const items = await ensureLoaded();
  return items.filter((f) => f.status === "New").length;
}
