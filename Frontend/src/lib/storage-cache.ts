const caches = new Map<string, { data: unknown; key: string }>();

export function getCached<T>(storageKey: string): T[] {
  const entry = caches.get(storageKey);
  if (entry) return entry.data as T[];
  const raw =
    typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
  const data: T[] = raw ? JSON.parse(raw) : [];
  caches.set(storageKey, { data, key: storageKey });
  return data;
}

export function setCached<T>(storageKey: string, data: T[]): void {
  caches.set(storageKey, { data, key: storageKey });
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {}
}

export function clearCache(storageKey?: string): void {
  if (storageKey) {
    caches.delete(storageKey);
  } else {
    caches.clear();
  }
}
