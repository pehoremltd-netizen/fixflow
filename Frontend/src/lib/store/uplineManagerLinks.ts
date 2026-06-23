"use client";

import type { UplineManagerLink } from "@/types";
import * as api from "../api/upline-manager";

const STORAGE_KEY = "fixflow-upline-manager-links";
const MIGRATED_KEY = "migrated_upline_manager";

let cache: UplineManagerLink[] | null = null;
let loading = false;
let loadPromise: Promise<UplineManagerLink[]> | null = null;

function loadFromStorage(): UplineManagerLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveToStorage(items: UplineManagerLink[]) {
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

async function ensureLoaded(): Promise<UplineManagerLink[]> {
  if (cache) return cache;
  if (loading && loadPromise) return loadPromise;
  loading = true;
  loadPromise = ensureLoadedInternal();
  const result = await loadPromise;
  loading = false;
  loadPromise = null;
  return result;
}

async function ensureLoadedInternal(): Promise<UplineManagerLink[]> {
  const local = loadFromStorage();
  try {
    const remote = await api.fetchUplineManagerLinks();
    if (!isMigrated() && local.length > 0) {
      try {
        await api.migrateUplineManagerLinks(local);
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

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createUplineManagerLink(viewerName: string): Promise<UplineManagerLink> {
  const link: UplineManagerLink = {
    id: crypto.randomUUID(),
    token: generateToken(),
    viewerName,
    viewerEmail: "",
    createdAt: new Date().toISOString(),
    lastAccessedAt: null,
    status: "active",
  };
  try {
    const created = await api.createUplineManagerLink({
      id: link.id,
      token: link.token,
      viewerName: link.viewerName,
      viewerEmail: link.viewerEmail,
      status: link.status,
    });
    const items = await ensureLoaded();
    items.unshift(created);
    cache = items;
    saveToStorage(items);
    return created;
  } catch {
    const items = await ensureLoaded();
    items.unshift(link);
    cache = items;
    saveToStorage(items);
    return link;
  }
}

export async function getUplineManagerLinks(): Promise<UplineManagerLink[]> {
  return ensureLoaded();
}

export async function getLinkByToken(token: string): Promise<UplineManagerLink | null> {
  const items = await ensureLoaded();
  const cached = items.find((l) => l.token === token);
  if (cached) return cached;
  try {
    return await api.fetchLinkByToken(token);
  } catch {
    return null;
  }
}

export async function revokeUplineManagerLink(id: string) {
  try {
    await api.updateUplineManagerLink(id, { status: "revoked" as const });
  } catch {}
  const items = await ensureLoaded();
  const idx = items.findIndex((l) => l.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], status: "revoked" };
  cache = items;
  saveToStorage(items);
}

export async function updateLastAccessed(token: string) {
  const items = await ensureLoaded();
  const idx = items.findIndex((l) => l.token === token);
  if (idx === -1) return;
  items[idx] = { ...items[idx], lastAccessedAt: new Date().toISOString() };
  cache = items;
  saveToStorage(items);
  try {
    await api.updateUplineManagerLink(items[idx].id, { lastAccessedAt: items[idx].lastAccessedAt });
  } catch {}
}

export function getLinkUrl(token: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/upline-manager-view/${token}`;
}
