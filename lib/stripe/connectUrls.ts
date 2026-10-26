/**
 * Query values Stripe Connect onboarding redirects with.
 * Backend should set AccountLink return_url / refresh_url to these paths on the organiser host.
 *
 * Local:
 *   return  → http://app.localhost:3000/dashboard?stripe=return
 *   refresh → http://app.localhost:3000/dashboard?stripe=refresh
 *
 * Production (example):
 *   return  → https://app.yourlist.com/dashboard?stripe=return
 *   refresh → https://app.yourlist.com/dashboard?stripe=refresh
 */
export const STRIPE_CONNECT_RETURN_PARAM = "return";
export const STRIPE_CONNECT_REFRESH_PARAM = "refresh";
export const STRIPE_CONNECT_QUERY_KEY = "stripe";

export const STRIPE_CONNECT_RETURN_PATH = `/dashboard?${STRIPE_CONNECT_QUERY_KEY}=${STRIPE_CONNECT_RETURN_PARAM}`;
export const STRIPE_CONNECT_REFRESH_PATH = `/dashboard?${STRIPE_CONNECT_QUERY_KEY}=${STRIPE_CONNECT_REFRESH_PARAM}`;

export type StripeConnectRedirectKind = "return" | "refresh" | null;

export function getStripeConnectRedirectKind(
  searchParams: URLSearchParams | { get(name: string): string | null },
): StripeConnectRedirectKind {
  const value = searchParams.get(STRIPE_CONNECT_QUERY_KEY);
  if (value === STRIPE_CONNECT_RETURN_PARAM) return "return";
  if (value === STRIPE_CONNECT_REFRESH_PARAM) return "refresh";
  return null;
}

/** Absolute organiser-host URLs for AccountLink create (optional frontend helper). */
export function buildStripeConnectRedirectUrls(origin: string) {
  const base = origin.replace(/\/$/, "");
  return {
    return_url: `${base}${STRIPE_CONNECT_RETURN_PATH}`,
    refresh_url: `${base}${STRIPE_CONNECT_REFRESH_PATH}`,
  };
}
