import type { CookieAttributes } from "js-cookie";

/**
 * Host-only cookies must be used on *.localhost — browsers reject Domain=.localhost
 * (localhost is treated like a public suffix), which drops the session and loops
 * login → /dashboard → /login?next=/dashboard.
 */
export function authCookieOptions(): CookieAttributes {
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim();
  const useDomain =
    !!domain &&
    domain !== "localhost" &&
    domain !== ".localhost" &&
    !domain.endsWith(".localhost");

  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: 7,
    ...(useDomain ? { domain } : {}),
  };
}

export function clearAuthCookieOptions(): CookieAttributes[] {
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim();
  const options: CookieAttributes[] = [{ path: "/" }];

  if (
    domain &&
    domain !== "localhost" &&
    domain !== ".localhost" &&
    !domain.endsWith(".localhost")
  ) {
    options.push({ path: "/", domain });
  }

  // Also clear any stale cookies previously set with Domain=.localhost
  options.push({ path: "/", domain: ".localhost" });

  return options;
}
