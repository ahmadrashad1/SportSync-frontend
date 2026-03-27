/**
 * Base URL for the Spring Boot API. Set NEXT_PUBLIC_API_URL in Vercel (no trailing slash).
 * Example: https://your-api.onrender.com
 * Falls back to localhost for local dev when unset.
 */
export function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  if (raw) return raw.replace(/\/$/, '');
  return 'http://localhost:8080';
}

/**
 * Use for all backend calls. Adds ngrok's header so free tunnels don't block programmatic fetch()
 * (browser still shows the interstitial for direct navigation).
 */
export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers ?? undefined);
  if (!headers.has('ngrok-skip-browser-warning')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }
  return fetch(input, { ...init, headers });
}
