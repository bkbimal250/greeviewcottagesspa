import {
  clearAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setAuthTokens,
} from "@/lib/api";
import type {
  AuthResponse,
  User,
} from "@/types/auth";

const USER_STORAGE_KEY = "admin_user";
const REMEMBER_ME_KEY = "admin_remember_me";
const ACCESS_COOKIE_KEY = "admin_access_token";
const ROLE_COOKIE_KEY = "admin_role";

const ADMIN_ROLES = new Set(["super_admin", "admin"]);

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function setClientCookie(
  key: string,
  value: string,
  maxAge = 60 * 60 * 24 * 7,
): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = [
    `${key}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${maxAge}`,
    "samesite=lax",
  ].join("; ");
}

function deleteClientCookie(key: string): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${key}=; path=/; max-age=0; samesite=lax`;
}

export function canAccessAdminPanel(
  user: Pick<User, "role" | "is_active" | "is_staff"> | null,
): boolean {
  return Boolean(
    user &&
      user.is_active &&
      user.is_staff &&
      ADMIN_ROLES.has(user.role),
  );
}

export function saveAuthSession(
  authResponse: AuthResponse,
  rememberMe = false,
): void {
  if (!isBrowser()) {
    return;
  }

  setAuthTokens(
    authResponse.access,
    authResponse.refresh,
  );

  window.localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(authResponse.user),
  );

  window.localStorage.setItem(
    REMEMBER_ME_KEY,
    String(rememberMe),
  );

  setClientCookie(ACCESS_COOKIE_KEY, "1");
  setClientCookie(ROLE_COOKIE_KEY, authResponse.user.role);
}

export function getStoredUser(): User | null {
  if (!isBrowser()) {
    return null;
  }

  const storedUser =
    window.localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function updateStoredUser(
  user: User,
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(user),
  );
}

export function isRememberMeEnabled(): boolean {
  if (!isBrowser()) {
    return false;
  }

  return (
    window.localStorage.getItem(
      REMEMBER_ME_KEY,
    ) === "true"
  );
}

export function clearAuthSession(): void {
  if (!isBrowser()) {
    return;
  }

  clearAuthTokens();

  window.localStorage.removeItem(
    USER_STORAGE_KEY,
  );

  window.localStorage.removeItem(
    REMEMBER_ME_KEY,
  );

  deleteClientCookie(ACCESS_COOKIE_KEY);
  deleteClientCookie(ROLE_COOKIE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredAccessToken());
}

export function hasRefreshToken(): boolean {
  return Boolean(getStoredRefreshToken());
}

export function getAuthHeader():
  | Record<string, string>
  | Record<string, never> {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function getLoginRedirectUrl(
  fallback = "/admin",
): string {
  if (!isBrowser()) {
    return fallback;
  }

  const searchParams = new URLSearchParams(
    window.location.search,
  );

  const redirect = searchParams.get("redirect");

  if (
    !redirect ||
    !redirect.startsWith("/") ||
    redirect.startsWith("//")
  ) {
    return fallback;
  }

  return redirect;
}

export function redirectToLogin(
  returnUrl?: string,
): void {
  if (!isBrowser()) {
    return;
  }

  const currentUrl =
    returnUrl ||
    `${window.location.pathname}${window.location.search}`;

  const loginUrl = new URL(
    "/login",
    window.location.origin,
  );

  if (
    currentUrl &&
    currentUrl !== "/login" &&
    currentUrl.startsWith("/")
  ) {
    loginUrl.searchParams.set(
      "redirect",
      currentUrl,
    );
  }

  window.location.assign(loginUrl.toString());
}

export function logoutAndRedirect(
  redirectPath = "/login",
): void {
  clearAuthSession();

  if (isBrowser()) {
    window.location.assign(redirectPath);
  }
}

export function createAuthCookieOptions(
  maxAge = 60 * 60 * 24 * 7,
) {
  return {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
