import type { AuthUserLike } from "@/lib/auth/roles";

export type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string | null;
  status: string;
  scope: string;
  roles: string[];
  organisation_id: number | null;
} & AuthUserLike;

export function parseAuthUserCookie(raw: string | undefined): AuthUser | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
