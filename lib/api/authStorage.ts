import Cookies from "js-cookie";
import { clearAuthToken, setAuthToken } from "@/lib/api/token";

export const AUTH_USER_KEY = "authUser";

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
};

export function setAuthSession(token: string, user: AuthUser) {
  setAuthToken(token);
  Cookies.set(AUTH_USER_KEY, JSON.stringify(user), {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
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
  Cookies.remove(AUTH_USER_KEY);
}

export function getPostLoginPath(user: AuthUser) {
  if (user.scope === "admin" || user.roles.includes("superadmin") || user.roles.includes("admin")) {
    return "/admin";
  }

  return "/dashboard";
}
