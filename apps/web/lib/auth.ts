import type { User } from '@zakayola/types';
import { STORAGE_KEYS } from '@zakayola/utils';

/**
 * Persist the auth token as a cookie and the user profile in localStorage.
 * The cookie gets SameSite=Lax so it is sent on top-level navigations but
 * not on cross-site sub-resource requests. In production (HTTPS) it also
 * gets the Secure flag so it is never transmitted over plain HTTP.
 */
export function persistSession(token: string, user: User): void {
  const isSecure =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie =
    `yb_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearSession(): void {
  document.cookie = 'yb_token=; path=/; max-age=0; SameSite=Lax';
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
