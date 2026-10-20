import type { AuthUserLike } from "@/lib/auth/roles";
import type { AuthScope } from "@/lib/auth/scopes";
import type { PermissionMap } from "@/lib/auth/permissions";

export type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string | null;
  status: string;
  scope: AuthScope | string;
  roles: string[];
  organisation_id: number | null;
  /** Present on organisation/platform password login; often absent on customer OTP. */
  permissions?: PermissionMap;
} & AuthUserLike;

export function parseAuthUserCookie(raw: string | undefined): AuthUser | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getDisplayName(user: AuthUser | null | undefined) {
  if (!user) return "";
  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return name || user.email || "Account";
}
