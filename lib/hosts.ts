export type AppSurface = "public" | "organiser" | "superadmin";

const PUBLIC_HOST = process.env.NEXT_PUBLIC_PUBLIC_HOST ?? "localhost";
const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST ?? "app.localhost";
const ADMIN_HOST = process.env.NEXT_PUBLIC_ADMIN_HOST ?? "admin.localhost";

export function getHostname(hostHeader: string) {
  return hostHeader.toLowerCase().split(":")[0] || "localhost";
}

export function getHostSurface(hostHeader: string): AppSurface {
  const host = getHostname(hostHeader);

  if (host === APP_HOST || host.startsWith("app.")) return "organiser";
  if (host === ADMIN_HOST || host.startsWith("admin.")) return "superadmin";
  if (host === PUBLIC_HOST || host === `www.${PUBLIC_HOST}` || host === "127.0.0.1") {
    return "public";
  }

  return "public";
}

export const authPaths = ["/login", "/signup", "/reset-password", "/account-under-review", "/unauthorized"];

export const surfacePaths = {
  public: ["/", "/event", ...authPaths],
  organiser: ["/dashboard", "/events", "/venues", "/customers", ...authPaths],
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

export function getSurfaceHost(surface: AppSurface) {
  if (surface === "organiser") return APP_HOST;
  if (surface === "superadmin") return ADMIN_HOST;
  return PUBLIC_HOST;
}

/** Build an absolute URL on the correct product host (keeps current port in local/dev). */
export function buildSurfaceUrl(
  surface: AppSurface,
  pathname: string,
  currentHostHeader?: string,
) {
  const targetHost = getSurfaceHost(surface);
  const port = currentHostHeader?.includes(":") ? currentHostHeader.split(":")[1] : "";
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

export function getSurfaceForRole(role: "public" | "owner" | "superadmin"): AppSurface {
  if (role === "owner") return "organiser";
  if (role === "superadmin") return "superadmin";
  return "public";
}
