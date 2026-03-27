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
