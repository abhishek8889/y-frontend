export type AppRole = "public" | "owner" | "superadmin";

export type AuthUserLike = {
  scope?: string;
  roles?: string[];
};

export function isOwner(user: AuthUserLike | null | undefined) {
  if (!user) return false;
  const roles = user.roles ?? [];
  return roles.includes("owner") || user.scope === "organisation";
}

export function isSuperadmin(user: AuthUserLike | null | undefined) {
  if (!user) return false;
  const roles = user.roles ?? [];
  return (
    roles.includes("superadmin") ||
    roles.includes("super_admin") ||
    roles.includes("admin") ||
    user.scope === "admin" ||
    user.scope === "superadmin" ||
    user.scope === "platform"
  );
}

export function getPrimaryRole(user: AuthUserLike | null | undefined): AppRole {
  if (isSuperadmin(user)) return "superadmin";
  if (isOwner(user)) return "owner";
  return "public";
}

export function canAccessSurface(
  surface: "public" | "organiser" | "superadmin",
  user: AuthUserLike | null | undefined,
) {
  if (surface === "public") return true;
  if (surface === "organiser") return isOwner(user);
  if (surface === "superadmin") return isSuperadmin(user);
  return false;
}
