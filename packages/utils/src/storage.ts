/**
 * Type-safe wrappers around localStorage that gracefully handle
 * SSR environments (Next.js server components) and JSON parse errors.
 */

export function storageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or private browsing — fail silently
  }
}

export function storageRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function storageClear(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.clear();
  } catch {
    // ignore
  }
}

// ── Typed keys for the YoungBuck app ──────────────────────────────────────

export const STORAGE_KEYS = {
  USER: 'yb_user',
  SETTINGS: 'yb_settings',
  WALLET: 'yb_wallet',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
