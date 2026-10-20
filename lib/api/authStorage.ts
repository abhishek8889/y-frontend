import Cookies from "js-cookie";
import { AUTH_USER_KEY } from "@/lib/auth/constants";
import { getPrimaryScope, type AuthUserLike } from "@/lib/auth/roles";
import { AuthScope } from "@/lib/auth/scopes";
import type { AuthUser } from "@/lib/auth/session";
import { authCookieOptions, clearAuthCookieOptions } from "@/lib/api/cookieOptions";
import { clearAuthToken, setAuthToken } from "@/lib/api/token";
import {
  buildSurfaceUrl,
  getSurfaceForScope,
  isSafeNextPath,
} from "@/lib/hosts";

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
  const scope = getPrimaryScope(user);
  if (scope === AuthScope.Platform) return "/admin";
  if (scope === AuthScope.Organisation) return "/dashboard";
  return "/";
}

export function getPostLoginUrl(user: AuthUserLike, currentHostHeader?: string) {
  const scope = getPrimaryScope(user);
  const surface = getSurfaceForScope(scope);
  const path = getPostLoginPath(user);
  const host =
    currentHostHeader ?? (typeof window !== "undefined" ? window.location.host : undefined);
  return buildSurfaceUrl(surface, path, host);
}

/**
 * Prefer a safe `next` path when present.
 * Public-host logins stay on the public site (workspace links handle cross-host navigation).
 */
export function resolvePostLoginUrl(
  user: AuthUserLike,
  nextPath: string | null | undefined,
  currentHostHeader?: string,
  options?: { stayOnPublic?: boolean },
) {
  const host =
    currentHostHeader ?? (typeof window !== "undefined" ? window.location.host : undefined);

  if (options?.stayOnPublic) {
    return isSafeNextPath(nextPath) ? nextPath : "/";
  }

  if (isSafeNextPath(nextPath)) {
    const scope = getPrimaryScope(user);
    const surface = getSurfaceForScope(scope);
    return buildSurfaceUrl(surface, nextPath, host);
  }

  return getPostLoginUrl(user, host);
}
