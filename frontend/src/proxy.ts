import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, TOKEN_EXPIRY_DAYS } from "@/core/auth/constants";

/**
 * Proxy handles access_token from IAM redirect before any page renders.
 * This ensures the token is available in cookies for SSR getServerSideUser().
 */
export function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get(ACCESS_TOKEN_COOKIE);

  if (!token) {
    return NextResponse.next();
  }

  // Calculate cookie expiry
  const expires = new Date();
  expires.setDate(expires.getDate() + TOKEN_EXPIRY_DAYS);

  // Clone the request URL and remove access_token param
  const url = request.nextUrl.clone();
  url.searchParams.delete(ACCESS_TOKEN_COOKIE);

  // Create response with redirect to clean URL
  const response = NextResponse.redirect(url);

  // Set token cookie (not HttpOnly, JS needs to read it for Authorization header)
  response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    expires,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files
     * - api routes (avoid potential conflicts)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
