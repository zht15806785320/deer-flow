/**
 * Token Handler - Manages client-side token for Authorization header
 *
 * Supports two entry modes:
 * 1. From IAM redirect with access_token in URL
 * 2. From internal login page (sets HttpOnly cookie via gateway)
 *
 * Token is stored in a non-HttpOnly cookie that can be read by JS
 * for Authorization header injection.
 */

"use client";

import { ACCESS_TOKEN_COOKIE, TOKEN_EXPIRY_DAYS } from "./constants";

/**
 * Check if there's a token in the URL query params (from IAM redirect)
 * and store it in cookie, then clear the URL param.
 * Returns the token if found, null otherwise.
 */
export function handleUrlToken(): string | null {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);
  const token = url.searchParams.get("access_token");

  if (token) {
    storeToken(token);

    // Remove access_token from URL to avoid token exposure in browser address bar
    url.searchParams.delete("access_token");
    const cleanUrl = url.pathname + (url.search ? url.search : "");
    window.history.replaceState({}, "", cleanUrl);

    return token;
  }

  return null;
}

/**
 * Store token in cookie (non-HttpOnly, JS can read)
 */
export function storeToken(token: string): void {
  if (typeof window === "undefined") return;

  const expires = new Date();
  expires.setDate(expires.getDate() + TOKEN_EXPIRY_DAYS);
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Get token from cookie (JS readable, non-HttpOnly)
 */
export function getToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((c) =>
    c.startsWith(`${ACCESS_TOKEN_COOKIE}=`),
  );
  if (!tokenCookie) return null;

  const value = tokenCookie.split("=")[1];
  return value ? decodeURIComponent(value) : null;
}

/**
 * Clear token from cookie
 */
export function clearToken(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Max-Age=0; path=/`;
}

/**
 * Check if token exists
 */
export function hasToken(): boolean {
  return getToken() !== null;
}

/**
 * Parse JWT payload (without verification - for expiry check only)
 */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    if (!payload) return null;
    // Handle base64url encoding
    const decoded = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(decoded));
  } catch {
    return null;
  }
}

/**
 * Check if token is expired (based on JWT exp claim)
 */
export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;

  const payload = parseJwtPayload(token);
  if (!payload) return false;

  if (typeof payload.exp === "number") {
    return Date.now() >= payload.exp * 1000;
  }

  return false;
}

/**
 * Build Authorization header value
 */
export function getAuthHeader(): string | null {
  const token = getToken();
  return token ? `Bearer ${token}` : null;
}
