import { AuthScope } from "@/lib/auth/scopes";
import { getPrimaryScope, type AuthUserLike } from "@/lib/auth/roles";

export type AppSurface = "public" | "organiser" | "superadmin";

/**
 * Env:
 * - `NEXT_PUBLIC_APP_HOST` / `NEXT_PUBLIC_ADMIN_HOST` — subdomain prefixes only (`app`, `admin`)
 * - `NEXT_PUBLIC_DOMAIN` — public base host, optional port (`localhost:3000`, `yourlist.com`)
 *
 * Full surface hosts are `{prefix}.{NEXT_PUBLIC_DOMAIN}` (e.g. `app.localhost:3000`).
 * When domain env is unset, base is derived from the current request host.
 */
const APP_PREFIX = (process.env.NEXT_PUBLIC_APP_HOST ?? "app").split(".")[0] || "app";
const ADMIN_PREFIX = (process.env.NEXT_PUBLIC_ADMIN_HOST ?? "admin").split(".")[0] || "admin";
const CONFIGURED_DOMAIN = (process.env.NEXT_PUBLIC_DOMAIN ?? "").trim();

export function getHostname(hostHeader: string) {
  return hostHeader.toLowerCase().split(":")[0] || "localhost";
}

function splitHostPort(hostHeader: string) {
  const normalized = hostHeader.trim().toLowerCase();
  if (!normalized) return { hostname: "localhost", port: "" };

  const [hostname, ...portParts] = normalized.split(":");
  return {
    hostname: hostname || "localhost",
    port: portParts.join(":"),
  };
}

/** Apex / public domain from any product host (strips app./admin./www.). */
export function getBaseDomain(hostHeader: string) {
  const host = getHostname(hostHeader);

  if (host.startsWith(`${APP_PREFIX}.`)) return host.slice(APP_PREFIX.length + 1);
  if (host.startsWith(`${ADMIN_PREFIX}.`)) return host.slice(ADMIN_PREFIX.length + 1);
  if (host.startsWith("www.")) return host.slice(4);
  return host;
}

/**
 * Public base host (+ optional port) used to build app/admin URLs.
 * Prefers `NEXT_PUBLIC_DOMAIN` over deriving from the current request host.
 */
export function getPublicDomain(currentHostHeader?: string) {
  if (CONFIGURED_DOMAIN) {
    const { hostname, port } = splitHostPort(CONFIGURED_DOMAIN);
    return port ? `${hostname}:${port}` : hostname;
  }

  const fallbackHost =
    currentHostHeader ??
    (typeof window !== "undefined" ? window.location.host : "localhost");
  const base = getBaseDomain(fallbackHost);
  const { port } = splitHostPort(fallbackHost);
  return port ? `${base}:${port}` : base;
}

export function getHostSurface(hostHeader: string): AppSurface {
  const host = getHostname(hostHeader);

  if (host === APP_PREFIX || host.startsWith(`${APP_PREFIX}.`)) return "organiser";
  if (host === ADMIN_PREFIX || host.startsWith(`${ADMIN_PREFIX}.`)) return "superadmin";
  return "public";
}

export const authPaths = [
  "/login",
  "/signup",
  "/reset-password",
  "/account-under-review",
  "/unauthorized",
];

export const surfacePaths = {
  public: [
    "/",
    "/event",
    "/category",
    "/payment",
    "/account",
    "/orders",
    "/wishlist",
    ...authPaths,
  ],
  organiser: [
    "/dashboard",
    "/events",
    "/venues",
    "/customers",
    "/site",
    "/clubsite",
    "/roles",
    "/staff",
    "/finance",
    "/settings",
    "/whitelabels",
    ...authPaths,
  ],
  // Existing platform routes live under /admin on the admin host.
  superadmin: ["/admin", ...authPaths],
} as const;

export function isAuthPath(pathname: string) {
  return authPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isPathAllowed(surface: AppSurface, pathname: string) {
  const allowed = surfacePaths[surface];
  return allowed.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function defaultPathForSurface(surface: AppSurface) {
  if (surface === "organiser") return "/dashboard";
  if (surface === "superadmin") return "/admin";
  return "/";
}

export function getSurfaceHost(surface: AppSurface, currentHostHeader?: string) {
  const publicDomain = getPublicDomain(currentHostHeader);
  const { hostname: base, port } = splitHostPort(publicDomain);

  let host = base;
  if (surface === "organiser") host = `${APP_PREFIX}.${base}`;
  if (surface === "superadmin") host = `${ADMIN_PREFIX}.${base}`;

  return port ? `${host}:${port}` : host;
}

/** Build an absolute URL on the correct product host (`{prefix}.{NEXT_PUBLIC_DOMAIN}`). */
export function buildSurfaceUrl(
  surface: AppSurface,
  pathname: string,
  currentHostHeader?: string,
) {
  const hostWithPort = getSurfaceHost(surface, currentHostHeader);
  const hostname = getHostname(hostWithPort);
  const isLocalHost =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1";

  const protocol =
    typeof window !== "undefined"
      ? window.location.protocol
      : isLocalHost
        ? "http:"
        : "https:";

  return `${protocol}//${hostWithPort}${pathname}`;
}

/** Safe same-origin path for `?next=` — blocks open redirects. */
export function isSafeNextPath(nextPath: string | null | undefined): nextPath is string {
  return Boolean(nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//"));
}

export function getSurfaceForScope(scope: AuthScope | string | null | undefined): AppSurface {
  if (scope === AuthScope.Organisation) return "organiser";
  if (scope === AuthScope.Platform) return "superadmin";
  return "public";
}

export function getSurfaceForUser(user: AuthUserLike | null | undefined): AppSurface {
  return getSurfaceForScope(getPrimaryScope(user));
}
