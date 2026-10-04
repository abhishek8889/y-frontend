import Cookies from "js-cookie";
import { AUTH_TOKEN_KEY } from "@/lib/auth/constants";
import { authCookieOptions, clearAuthCookieOptions } from "@/lib/api/cookieOptions";

export { AUTH_TOKEN_KEY };

export function getAuthToken() {
  return Cookies.get(AUTH_TOKEN_KEY) ?? null;
}

export function setAuthToken(token: string) {
  Cookies.set(AUTH_TOKEN_KEY, token, authCookieOptions());
}

export function clearAuthToken() {
  for (const options of clearAuthCookieOptions()) {
    Cookies.remove(AUTH_TOKEN_KEY, options);
  }
}
