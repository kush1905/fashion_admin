/**
 * Single source of truth for the admin API base URL.
 *
 * Resolution:
 * - Prefer NEXT_PUBLIC_API_URL (inlined into the browser bundle at build time)
 * - Local development may fall back to localhost:4000
 * - Production / Vercel builds must NEVER fall back to localhost
 *
 * Expected shape: https://<host>/api  (no trailing slash)
 * Call sites pass paths like "/admin/bootstrap" or "/products".
 */

export const LOCAL_DEV_API_URL = "http://localhost:4000/api";

function normalizeApiBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/** True when this client bundle was built for production (includes Vercel). */
export function isProductionClient(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Resolved API base including the `/api` prefix.
 * Example: https://reena-rathore-backend.onrender.com/api
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return normalizeApiBaseUrl(fromEnv);
  }

  if (isProductionClient()) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Configure it in Vercel (Production) and redeploy so the client bundle receives the API base URL.",
    );
  }

  return LOCAL_DEV_API_URL;
}

/** API host origin without `/api` (for media /uploads URLs). */
export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/?$/, "").replace(/\/$/, "");
}

/** Join API base + path without duplicating or dropping `/api`. */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function logApiConfigOnce(): void {
  if (typeof window === "undefined") return;
  const key = "__reena_admin_api_url_logged__";
  if ((window as unknown as Record<string, boolean>)[key]) return;
  (window as unknown as Record<string, boolean>)[key] = true;
  try {
    console.info("[admin-api] NEXT_PUBLIC_API_URL →", getApiBaseUrl());
  } catch (err) {
    console.error("[admin-api] API base URL misconfigured:", err);
  }
}
