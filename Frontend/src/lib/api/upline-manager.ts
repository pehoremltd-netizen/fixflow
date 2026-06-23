import { api } from "./client";
import type { UplineManagerLink, UplineManagerComment, ViewerFeedback } from "@/types";

// ─── snake_case ↔ camelCase conversion ───

type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Capitalize<T> ? `_${Lowercase<T>}${CamelToSnake<U>}`
  : `${T}${CamelToSnake<U>}`
  : S;

function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    result[snakeKey] = value;
  }
  return result;
}

function toCamel<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

/* ─── Upline Manager Links ─── */

export async function fetchUplineManagerLinks(): Promise<UplineManagerLink[]> {
  const res = await api.get<{ data: Record<string, unknown>[] }>("/upline-manager/links");
  return (res.data || []).map((item) => toCamel<UplineManagerLink>(item));
}

export async function fetchLinkByToken(token: string): Promise<UplineManagerLink | null> {
  try {
    const res = await api.get<{ data: Record<string, unknown> }>(`/upline-manager/links/token/${token}`);
    return toCamel<UplineManagerLink>(res.data);
  } catch { return null; }
}

export async function createUplineManagerLink(data: Partial<UplineManagerLink>): Promise<UplineManagerLink> {
  const res = await api.post<{ data: Record<string, unknown> }>("/upline-manager/links", toSnake(data as unknown as Record<string, unknown>));
  return toCamel<UplineManagerLink>(res.data);
}

export async function migrateUplineManagerLinks(links: UplineManagerLink[]): Promise<UplineManagerLink[]> {
  const res = await api.post<{ data: Record<string, unknown>[] }>("/upline-manager/links/batch", links.map((l) => toSnake(l as unknown as Record<string, unknown>)));
  return (res.data || []).map((item) => toCamel<UplineManagerLink>(item));
}

export async function updateUplineManagerLink(id: string, data: Partial<UplineManagerLink>): Promise<UplineManagerLink> {
  const res = await api.patch<{ data: Record<string, unknown> }>(`/upline-manager/links/${id}`, toSnake(data as unknown as Record<string, unknown>));
  return toCamel<UplineManagerLink>(res.data);
}

export async function deleteUplineManagerLink(id: string): Promise<void> {
  await api.delete(`/upline-manager/links/${id}`);
}

/* ─── Upline Manager Comments ─── */

export async function fetchComments(linkId?: string): Promise<UplineManagerComment[]> {
  const query = linkId ? `?link_id=${linkId}` : "";
  const res = await api.get<{ data: Record<string, unknown>[] }>(`/upline-manager/comments${query}`);
  return (res.data || []).map((item) => toCamel<UplineManagerComment>(item));
}

export async function fetchCommentsForItem(itemType: string, itemId: string, linkId?: string): Promise<UplineManagerComment[]> {
  const params = new URLSearchParams({ item_type: itemType, item_id: itemId });
  if (linkId) params.set("link_id", linkId);
  const res = await api.get<{ data: Record<string, unknown>[] }>(`/upline-manager/comments/item?${params}`);
  return (res.data || []).map((item) => toCamel<UplineManagerComment>(item));
}

export async function createComment(data: Partial<UplineManagerComment>): Promise<UplineManagerComment> {
  const res = await api.post<{ data: Record<string, unknown> }>("/upline-manager/comments", toSnake(data as unknown as Record<string, unknown>));
  return toCamel<UplineManagerComment>(res.data);
}

export async function migrateComments(comments: UplineManagerComment[]): Promise<UplineManagerComment[]> {
  const res = await api.post<{ data: Record<string, unknown>[] }>("/upline-manager/comments/batch", comments.map((c) => toSnake(c as unknown as Record<string, unknown>)));
  return (res.data || []).map((item) => toCamel<UplineManagerComment>(item));
}

export async function updateComment(id: string, data: Partial<UplineManagerComment>): Promise<UplineManagerComment> {
  const res = await api.patch<{ data: Record<string, unknown> }>(`/upline-manager/comments/${id}`, toSnake(data as unknown as Record<string, unknown>));
  return toCamel<UplineManagerComment>(res.data);
}

export async function bulkUpdateCommentStatus(ids: string[], status: string): Promise<UplineManagerComment[]> {
  const res = await api.patch<{ data: Record<string, unknown>[] }>("/upline-manager/comments/bulk-status", { ids, status });
  return (res.data || []).map((item) => toCamel<UplineManagerComment>(item));
}

export async function deleteComment(id: string): Promise<void> {
  await api.delete(`/upline-manager/comments/${id}`);
}

/* ─── Viewer Feedback ─── */

export async function fetchFeedback(linkId?: string): Promise<ViewerFeedback[]> {
  const query = linkId ? `?link_id=${linkId}` : "";
  const res = await api.get<{ data: Record<string, unknown>[] }>(`/upline-manager/feedback${query}`);
  return (res.data || []).map((item) => toCamel<ViewerFeedback>(item));
}

export async function createFeedback(data: Partial<ViewerFeedback>): Promise<ViewerFeedback> {
  const res = await api.post<{ data: Record<string, unknown> }>("/upline-manager/feedback", toSnake(data as unknown as Record<string, unknown>));
  return toCamel<ViewerFeedback>(res.data);
}

export async function migrateFeedback(items: ViewerFeedback[]): Promise<ViewerFeedback[]> {
  const res = await api.post<{ data: Record<string, unknown>[] }>("/upline-manager/feedback/batch", items.map((f) => toSnake(f as unknown as Record<string, unknown>)));
  return (res.data || []).map((item) => toCamel<ViewerFeedback>(item));
}

export async function updateFeedback(id: string, data: Partial<ViewerFeedback>): Promise<ViewerFeedback> {
  const res = await api.patch<{ data: Record<string, unknown> }>(`/upline-manager/feedback/${id}`, toSnake(data as unknown as Record<string, unknown>));
  return toCamel<ViewerFeedback>(res.data);
}

export async function deleteFeedback(id: string): Promise<void> {
  await api.delete(`/upline-manager/feedback/${id}`);
}
