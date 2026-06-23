"use client";

import type { UplineManagerComment, FeedbackStatus } from "@/types";
import * as api from "../api/upline-manager";

const STORAGE_KEY = "fixflow-upline-manager-comments";
const MIGRATED_KEY = "migrated_upline_manager";

let cache: UplineManagerComment[] | null = null;

function loadFromStorage(): UplineManagerComment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveToStorage(items: UplineManagerComment[]) {
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

async function ensureLoaded(): Promise<UplineManagerComment[]> {
  if (cache) return cache;
  const local = loadFromStorage();
  try {
    const remote = await api.fetchComments();
    if (!isMigrated() && local.length > 0) {
      try {
        await api.migrateComments(local);
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

function buildOrderKey(
  itemType: string,
  itemId: string,
  uplineManagerLinkId: string,
): string {
  return `${itemType}::${itemId}::${uplineManagerLinkId}`;
}

export async function addComment(params: {
  uplineManagerLinkId: string;
  itemType: string;
  itemId: string;
  authorType: "ajose" | "upline_manager";
  authorName: string;
  commentText: string;
  parentCommentId?: string | null;
}): Promise<UplineManagerComment> {
  const comment: UplineManagerComment = {
    id: crypto.randomUUID(),
    uplineManagerLinkId: params.uplineManagerLinkId,
    itemType: params.itemType,
    itemId: params.itemId,
    authorType: params.authorType,
    authorName: params.authorName,
    commentText: params.commentText,
    createdAt: new Date().toISOString(),
    parentCommentId: params.parentCommentId ?? null,
    status: "New",
    orderKey: buildOrderKey(params.itemType, params.itemId, params.uplineManagerLinkId),
  };
  try {
    const created = await api.createComment({
      uplineManagerLinkId: comment.uplineManagerLinkId,
      itemType: comment.itemType,
      itemId: comment.itemId,
      authorType: comment.authorType,
      authorName: comment.authorName,
      commentText: comment.commentText,
      parentCommentId: comment.parentCommentId,
      status: comment.status,
      orderKey: comment.orderKey,
    });
    const items = await ensureLoaded();
    items.push(created);
    cache = items;
    saveToStorage(items);
    return created;
  } catch {
    const items = await ensureLoaded();
    items.push(comment);
    cache = items;
    saveToStorage(items);
    return comment;
  }
}

export async function getCommentsForItem(
  itemType: string,
  itemId: string,
  uplineManagerLinkId: string,
): Promise<UplineManagerComment[]> {
  const orderKey = buildOrderKey(itemType, itemId, uplineManagerLinkId);
  const items = await ensureLoaded();
  return items
    .filter((c) => c.orderKey === orderKey)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getCommentsForLink(uplineManagerLinkId: string): Promise<UplineManagerComment[]> {
  const items = await ensureLoaded();
  return items
    .filter((c) => c.uplineManagerLinkId === uplineManagerLinkId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export interface InboxGroup {
  orderKey: string;
  itemType: string;
  itemId: string;
  comments: UplineManagerComment[];
  viewerName: string;
  lastActivity: string;
  newCount: number;
}

export async function getInboxForAjose(): Promise<InboxGroup[]> {
  const all = await ensureLoaded();
  const groups = new Map<string, UplineManagerComment[]>();
  for (const c of all) {
    const existing = groups.get(c.orderKey) || [];
    existing.push(c);
    groups.set(c.orderKey, existing);
  }
  const result: InboxGroup[] = [];
  for (const [orderKey, comments] of groups) {
    const sorted = comments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const viewerName = sorted.find((c) => c.authorType === "upline_manager")?.authorName || "Unknown";
    result.push({
      orderKey,
      itemType: comments[0].itemType,
      itemId: comments[0].itemId,
      comments: sorted,
      viewerName,
      lastActivity: sorted[0].createdAt,
      newCount: sorted.filter((c) => c.status === "New").length,
    });
  }
  return result.sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );
}

export async function updateCommentStatus(id: string, status: FeedbackStatus) {
  try {
    await api.updateComment(id, { status });
  } catch {}
  const items = await ensureLoaded();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], status };
  cache = items;
  saveToStorage(items);
}

export async function markThreadAsRead(orderKey: string) {
  const items = await ensureLoaded();
  const toUpdate = items.filter((c) => c.orderKey === orderKey && c.status === "New");
  if (toUpdate.length === 0) return;
  try {
    await api.bulkUpdateCommentStatus(toUpdate.map((c) => c.id), "Read");
  } catch {}
  for (let i = 0; i < items.length; i++) {
    if (items[i].orderKey === orderKey && items[i].status === "New") {
      items[i] = { ...items[i], status: "Read" };
    }
  }
  cache = items;
  saveToStorage(items);
}

export async function getNewCommentCount(): Promise<number> {
  const items = await ensureLoaded();
  return items.filter((c) => c.status === "New").length;
}

export async function getCommentsByItemType(itemType: string): Promise<UplineManagerComment[]> {
  const items = await ensureLoaded();
  return items
    .filter((c) => c.itemType === itemType)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
