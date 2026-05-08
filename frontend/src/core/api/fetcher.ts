import {
  getToken,
  clearToken,
  isTokenExpired,
} from "@/core/auth/token-handler";

/** HTTP methods that the gateway's CSRFMiddleware checks. */
export type StateChangingMethod = "POST" | "PUT" | "DELETE" | "PATCH";

export const STATE_CHANGING_METHODS: ReadonlySet<StateChangingMethod> = new Set(
  ["POST", "PUT", "DELETE", "PATCH"],
);

/** Mirror of the gateway's ``should_check_csrf`` decision. */
export function isStateChangingMethod(method: string): boolean {
  return (STATE_CHANGING_METHODS as ReadonlySet<string>).has(
    method.toUpperCase(),
  );
}

const CSRF_COOKIE_PREFIX = "csrf_token=";

/**
 * Read the ``csrf_token`` cookie set by the gateway at login.
 *
 * SSR-safe: returns ``null`` when ``document`` is undefined so the same
 * helper can be imported from server components without a guard.
 *
 * Uses `String.split` instead of a regex to side-step ESLint's
 * `prefer-regexp-exec` rule and the cookie value's reliable `; `
 * separator (set by the gateway, not the browser, so format is stable).
 */
export function readCsrfCookie(): string | null {
  if (typeof document === "undefined") return null;
  for (const pair of document.cookie.split("; ")) {
    if (pair.startsWith(CSRF_COOKIE_PREFIX)) {
      return decodeURIComponent(pair.slice(CSRF_COOKIE_PREFIX.length));
    }
  }
  return null;
}

/**
 * Fetch with credentials and automatic CSRF protection.
 *
 * Two centralized contracts every API call needs:
 *
 * 1. ``credentials: "include"`` so the HttpOnly access_token cookie
 *    accompanies cross-origin SSR-routed requests.
 * 2. ``X-CSRF-Token`` header on state-changing methods (POST/PUT/
 *    DELETE/PATCH), echoed from the ``csrf_token`` cookie. The gateway's
 *    CSRFMiddleware enforces Double Submit Cookie comparison and returns
 *    403 if the header is missing — silently breaking every call site
 *    that uses raw ``fetch()`` instead of this wrapper.
 *
 * Auto-redirects to ``/login`` on 401. Caller-supplied headers are
 * preserved; the helper only ADDS the CSRF header when it isn't already
 * present, so explicit overrides win.
 */
export async function fetch(
  input: RequestInfo | string,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === "string" ? input : input.url;

  let headers = init?.headers;

  // 1. Inject Authorization Bearer Token (from localStorage)
  // This supports both IAM redirect and internal login entry modes
  const clientToken = getToken();
  if (clientToken) {
    headers = new Headers(headers);
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${clientToken}`);
    }
  }

  // 2. Inject CSRF Token for state-changing methods (keep existing behavior)
  if (isStateChangingMethod(init?.method ?? "GET")) {
    const csrfToken = readCsrfCookie();
    if (csrfToken) {
      headers = new Headers(headers);
      if (!headers.has("X-CSRF-Token")) {
        headers.set("X-CSRF-Token", csrfToken);
      }
    }
  }

  const res = await globalThis.fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  // 3. Handle 401 - clear token and redirect to login
  if (res.status === 401) {
    if (isTokenExpired()) {
      clearToken();
    }
    window.location.href = `${window.sysConfig?.dify_logout_url}&target_url=${window.location.href}`;
    throw new Error("Unauthorized");
  }

  return res;
}

/**
 * Build headers for CSRF-protected requests.
 *
 * **Prefer :func:`fetchWithAuth`** for new code — it injects the header
 * automatically on state-changing methods. This helper exists for legacy
 * call sites that need to compose headers manually (e.g. inside
 * `next/server` route handlers that build their own ``Headers`` object).
 *
 * Per RFC-001: Double Submit Cookie pattern.
 */
export function getCsrfHeaders(): HeadersInit {
  const token = readCsrfCookie();
  return token ? { "X-CSRF-Token": token } : {};
}
