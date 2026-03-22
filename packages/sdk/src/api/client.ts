export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
}

export class ApiError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

// Read base URL at call time, not at module-load time, so Next.js SSR
// picks up env vars correctly regardless of import order.
function resolveBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return (
      (window as unknown as Record<string, string>).__YB_API_URL__ ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000'
    );
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

function getStoredToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )yb_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function createApiClient(config?: Partial<ApiClientConfig>) {
  // baseUrl and getToken are resolved lazily inside request() so that
  // environment variables are read at fetch-time, not at import-time.
  const getBaseUrl = () => config?.baseUrl ?? resolveBaseUrl();
  const getToken = config?.getToken ?? getStoredToken;

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    requiresAuth = true
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;
      try {
        const json = await res.json();
        if (json.error) message = json.error;
      } catch {
        // keep default message
      }
      throw new ApiError(message, res.status);
    }

    if (res.status === 204) return undefined as unknown as T;

    return res.json() as Promise<T>;
  }

  return {
    get:    <T>(path: string, auth = true) => request<T>('GET',    path, undefined, auth),
    post:   <T>(path: string, body: unknown, auth = true) => request<T>('POST',   path, body, auth),
    patch:  <T>(path: string, body: unknown, auth = true) => request<T>('PATCH',  path, body, auth),
    delete: <T>(path: string, auth = true) => request<T>('DELETE', path, undefined, auth),
  };
}

// Singleton — created once but resolves config lazily inside each request()
export const client = createApiClient();
