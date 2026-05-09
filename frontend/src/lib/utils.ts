import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts an object to a URL query string.
 * @example
 * buildQueryString({ enable_only: true, page: 1 })
 * // => "enable_only=true&page=1"
 * buildQueryString(undefined)
 * // => ""
 */
export function buildQueryString<T extends Record<string, unknown> = Record<string, unknown>>(
  params?: T,
): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }
  return searchParams.toString();
}

/** Shared class for external links (underline by default). */
export const externalLinkClass =
  "text-primary underline underline-offset-2 hover:no-underline";
/** Link style without underline by default (e.g. for streaming/loading). */
export const externalLinkClassNoUnderline = "text-primary hover:underline";
