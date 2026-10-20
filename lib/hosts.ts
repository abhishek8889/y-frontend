import { AuthScope } from "@/lib/auth/scopes";
import { getPrimaryScope, type AuthUserLike } from "@/lib/auth/roles";

export type AppSurface = "public" | "organiser" | "superadmin";

/**
 * Env values are subdomain prefixes (e.g. `app`, `admin`), not full hostnames.
 * Full hosts are built as `{prefix}.{baseDomain}` from the current request host.
 */
const APP_PREFIX = (process.env.NEXT_PUBLIC_APP_HOST ?? "app").split(".")[0] || "app";
const ADMIN_PREFIX = (process.env.NEXT_PUBLIC_ADMIN_HOST ?? "admin").split(".")[0] || "admin";

export function getHostname(hostHeader: string) {
  return hostHeader.toLowerCase().split(":")[0] || "localhost";
}

/** Apex / public domain from any product host (strips app./admin./www.). */
export function getBaseDomain(hostHeader: string) {
  const host = getHostname(hostHeader);

  if (host.startsWith(`${APP_PREFIX}.`)) return host.slice(APP_PREFIX.length + 1);
  if (host.startsWith(`${ADMIN_PREFIX}.`)) return host.slice(ADMIN_PREFIX.length + 1);
  if (host.startsWith("www.")) return host.slice(4);
  return host;
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
    "/payment",
    "/account",
    "/orders",
    "/wishlist",
    "/settings",
    ...authPaths,
  ],
  organiser: [
    "/dashboard",
    "/events",
    "/venues",
    "/customers",
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
  const fallbackHost =
    currentHostHeader ??
    (typeof window !== "undefined" ? window.location.host : "localhost");
  const base = getBaseDomain(fallbackHost);

  if (surface === "organiser") return `${APP_PREFIX}.${base}`;
  if (surface === "superadmin") return `${ADMIN_PREFIX}.${base}`;
  return base;
}

/** Build an absolute URL on the correct product host (keeps current port in local/dev). */
export function buildSurfaceUrl(
  surface: AppSurface,
  pathname: string,
  currentHostHeader?: string,
) {
  const fallbackHost =
    currentHostHeader ??
    (typeof window !== "undefined" ? window.location.host : "localhost");
  const targetHost = getSurfaceHost(surface, fallbackHost);
  const port = fallbackHost.includes(":") ? fallbackHost.split(":")[1] : "";
  const isLocalHost =
    targetHost === "localhost" ||
    targetHost.endsWith(".localhost") ||
    targetHost === "127.0.0.1";

  const protocol =
    typeof window !== "undefined"
      ? window.location.protocol
      : isLocalHost
        ? "http:"
        : "https:";

  const hostWithPort = port && isLocalHost ? `${targetHost}:${port}` : targetHost;
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
