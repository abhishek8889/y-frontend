import Cookies from "js-cookie";

export const AUTH_TOKEN_KEY = "authToken";

export function getAuthToken() {
  return Cookies.get(AUTH_TOKEN_KEY) ?? null;
}

export function setAuthToken(token: string) {
  Cookies.set(AUTH_TOKEN_KEY, token, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearAuthToken() {
  Cookies.remove(AUTH_TOKEN_KEY);
}
