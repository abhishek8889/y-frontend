import { AuthScope, parseAuthScope } from "@/lib/auth/scopes";

export type AuthUserLike = {
  scope?: string | AuthScope | null;
  roles?: string[];
};

export function getUserScope(user: AuthUserLike | null | undefined): AuthScope | null {
  return parseAuthScope(user?.scope);
}

export function isOrganisationScope(user: AuthUserLike | null | undefined) {
  return getUserScope(user) === AuthScope.Organisation;
}

export function isPlatformScope(user: AuthUserLike | null | undefined) {
  return getUserScope(user) === AuthScope.Platform;
}

export function isCustomerScope(user: AuthUserLike | null | undefined) {
  return getUserScope(user) === AuthScope.Customer;
}

/** @deprecated Prefer isOrganisationScope — kept as alias for organiser owner checks. */
export function isOwner(user: AuthUserLike | null | undefined) {
  return isOrganisationScope(user);
}

/** @deprecated Prefer isPlatformScope. */
export function isSuperadmin(user: AuthUserLike | null | undefined) {
  return isPlatformScope(user);
}

export function getPrimaryScope(user: AuthUserLike | null | undefined): AuthScope {
  return getUserScope(user) ?? AuthScope.Customer;
}

export function canAccessSurface(
  surface: "public" | "organiser" | "superadmin",
  user: AuthUserLike | null | undefined,
) {
  if (surface === "public") return true;
  if (surface === "organiser") return isOrganisationScope(user);
  if (surface === "superadmin") return isPlatformScope(user);
  return false;
}
