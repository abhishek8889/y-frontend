import Cookies from "js-cookie";
import { AUTH_USER_KEY } from "@/lib/auth/constants";
import { getPrimaryRole, type AuthUserLike } from "@/lib/auth/roles";
import type { AuthUser } from "@/lib/auth/session";
import { authCookieOptions, clearAuthCookieOptions } from "@/lib/api/cookieOptions";
import { clearAuthToken, setAuthToken } from "@/lib/api/token";
import { buildSurfaceUrl, getSurfaceForRole } from "@/lib/hosts";

export type { AuthUser };
export { AUTH_USER_KEY };

export function setAuthSession(token: string, user: AuthUser) {
  setAuthToken(token);
  Cookies.set(AUTH_USER_KEY, JSON.stringify(user), authCookieOptions());
}

export function getAuthUser(): AuthUser | null {
  const raw = Cookies.get(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  clearAuthToken();
  for (const options of clearAuthCookieOptions()) {
    Cookies.remove(AUTH_USER_KEY, options);
  }
}

export function getPostLoginPath(user: AuthUserLike) {
  const role = getPrimaryRole(user);
  if (role === "superadmin") return "/admin";
  if (role === "owner") return "/dashboard";
  return "/";
}

export function getPostLoginUrl(user: AuthUserLike, currentHostHeader?: string) {
  const role = getPrimaryRole(user);
  const surface = getSurfaceForRole(role);
  const path = getPostLoginPath(user);
  const host =
    currentHostHeader ?? (typeof window !== "undefined" ? window.location.host : undefined);
  return buildSurfaceUrl(surface, path, host);
}

/** Prefer a safe same-origin `next` path from the login query string when present. */
export function resolvePostLoginUrl(
  user: AuthUserLike,
  nextPath: string | null | undefined,
  currentHostHeader?: string,
) {
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    const host =
      currentHostHeader ?? (typeof window !== "undefined" ? window.location.host : undefined);
    const role = getPrimaryRole(user);
    const surface = getSurfaceForRole(role);
    return buildSurfaceUrl(surface, nextPath, host);
  }

  return getPostLoginUrl(user, currentHostHeader);
}
