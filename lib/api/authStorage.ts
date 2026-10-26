import Cookies from "js-cookie";
import { AUTH_CHANGE_EVENT, AUTH_USER_KEY } from "@/lib/auth/constants";
import { getPrimaryScope } from "@/lib/auth/roles";
import {
  isOrganisationPendingApproval,
  type OrganisationApprovalUser,
} from "@/lib/auth/organisationApproval";
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
export { isOrganisationPendingApproval };

function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function setAuthSession(token: string, user: AuthUser) {
  setAuthToken(token);
  Cookies.set(AUTH_USER_KEY, JSON.stringify(user), authCookieOptions());
  notifyAuthChange();
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
  notifyAuthChange();
}

type PostLoginUser = OrganisationApprovalUser;

export function getPostLoginPath(user: PostLoginUser) {
  const scope = getPrimaryScope(user);
  if (scope === AuthScope.Platform) return "/admin";
  if (isOrganisationPendingApproval(user)) return "/account-under-review";
  if (scope === AuthScope.Organisation) return "/dashboard";
  return "/";
}

export function getPostLoginUrl(user: PostLoginUser, currentHostHeader?: string) {
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
  user: PostLoginUser,
  nextPath: string | null | undefined,
  currentHostHeader?: string,
  options?: { stayOnPublic?: boolean },
) {
  const host =
    currentHostHeader ?? (typeof window !== "undefined" ? window.location.host : undefined);

  // Unapproved organisers stay on under-review — never dashboard via ?next=.
  if (isOrganisationPendingApproval(user)) {
    return getPostLoginUrl(user, host);
  }

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
