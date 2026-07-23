import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE =
  "admin_access_token";
const ROLE_COOKIE = "admin_role";
const ADMIN_ROLES = new Set([
  "super_admin",
  "admin",
]);

const AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
];

const PROTECTED_ROUTE_PREFIXES = [
  "/admin",
  "/dashboard",
  "/availability",
  "/bookings",
  "/cottages",
  "/enquiries",
  "/guests",
  "/notifications",
  "/payments",
  "/profile",
  "/property",
  "/reports",
  "/settings",
  "/users",
];

const UNSUPPORTED_ROUTE_PREFIXES = [
  "/enquiries",
  "/reports",
  "/property/facilities",
  "/property/gallery",
  "/property/nearby-places",
  "/property/policies",
];

function isAuthRoute(
  pathname: string,
): boolean {
  return AUTH_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );
}

function isProtectedRoute(
  pathname: string,
): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );
}

function isUnsupportedRoute(
  pathname: string,
): boolean {
  return UNSUPPORTED_ROUTE_PREFIXES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`),
  );
}

function isSafeRedirectPath(
  value: string | null,
): value is string {
  return Boolean(
    value &&
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.startsWith("/login"),
  );
}

export function proxy(
  request: NextRequest,
) {
  const { pathname, search } =
    request.nextUrl;

  const accessToken =
    request.cookies.get(
      ACCESS_TOKEN_COOKIE,
    )?.value;
  const role =
    request.cookies.get(ROLE_COOKIE)?.value;

  const hasSession =
    Boolean(accessToken) &&
    Boolean(role) &&
    ADMIN_ROLES.has(role || "");

  if (hasSession && isUnsupportedRoute(pathname)) {
    const dashboardUrl =
      request.nextUrl.clone();

    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";

    return NextResponse.redirect(dashboardUrl);
  }

  if (
    isProtectedRoute(pathname) &&
    !hasSession
  ) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname = "/login";

    const returnUrl = `${pathname}${search}`;

    loginUrl.searchParams.set(
      "redirect",
      returnUrl,
    );

    return NextResponse.redirect(loginUrl);
  }

  if (
    isAuthRoute(pathname) &&
    hasSession
  ) {
    const redirectParam =
      request.nextUrl.searchParams.get(
        "redirect",
      );

    const dashboardUrl =
      request.nextUrl.clone();

    dashboardUrl.pathname =
      isSafeRedirectPath(redirectParam)
        ? redirectParam
        : "/dashboard";

    dashboardUrl.search = "";

    return NextResponse.redirect(
      dashboardUrl,
    );
  }

  const response = NextResponse.next();

  response.headers.set(
    "X-Content-Type-Options",
    "nosniff",
  );

  response.headers.set(
    "X-Frame-Options",
    "SAMEORIGIN",
  );

  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );

  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/availability/:path*",
    "/bookings/:path*",
    "/cottages/:path*",
    "/enquiries/:path*",
    "/guests/:path*",
    "/notifications/:path*",
    "/payments/:path*",
    "/profile/:path*",
    "/property/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/users/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
  ],
};
