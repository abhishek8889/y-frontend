import { getHostname, getPublicDomain } from "@/lib/hosts";

/** Prefer forwarded host, then Host header. */
export function resolveRequestHostname(
  hostHeader: string | null | undefined,
  forwardedHostHeader?: string | null,
): string {
  const forwarded = (forwardedHostHeader ?? "").split(",")[0]?.trim();
  if (forwarded) return getHostname(forwarded);
  const host = (hostHeader ?? "").trim();
  if (host) return getHostname(host);
  return "localhost";
}

/**
 * When resolve-hostname fails, treat known marketplace / local hosts as public
 * instead of "site not found".
 */
export function isLikelyMarketplaceHostname(hostname: string): boolean {
  const normalized = getHostname(hostname);
  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized.endsWith(".localhost")
  ) {
    return true;
  }

  const platform = getHostname(getPublicDomain());
  if (!platform) return false;
  return normalized === platform || normalized === `www.${platform}`;
}
