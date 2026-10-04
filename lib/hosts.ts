export type AppSurface = "public" | "organiser" | "superadmin" | "local";

const PUBLIC_HOST = process.env.NEXT_PUBLIC_PUBLIC_HOST ?? "yourlist.com";
const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST ?? "app.yourlist.com";
const ADMIN_HOST = process.env.NEXT_PUBLIC_ADMIN_HOST ?? "admin.yourlist.com";

export function getHostSurface(hostname: string): AppSurface {
  const host = hostname.toLowerCase().split(":")[0];

  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
    return "local";
  }

  if (host === APP_HOST || host.startsWith("app.")) return "organiser";
  if (host === ADMIN_HOST || host.startsWith("admin.")) return "superadmin";
  if (host === PUBLIC_HOST || host === `www.${PUBLIC_HOST}`) return "public";

  return "public";
}

export const surfacePaths = {
  public: ["/", "/event", "/login", "/signup", "/reset-password", "/account-under-review"],
  organiser: [
    "/dashboard",
    "/events",
    "/venues",
    "/customers",
    "/login",
    "/signup",
    "/reset-password",
    "/account-under-review",
  ],
  superadmin: ["/admin", "/login", "/reset-password"],
} as const;

export function isPathAllowed(surface: AppSurface, pathname: string) {
  if (surface === "local") return true;

  const allowed = surfacePaths[surface];
  return allowed.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function defaultPathForSurface(surface: AppSurface) {
  if (surface === "organiser") return "/dashboard";
  if (surface === "superadmin") return "/admin";
  return "/";
}
