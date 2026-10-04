import { NextResponse, type NextRequest } from "next/server";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/auth/constants";
import { canAccessSurface, getPrimaryRole } from "@/lib/auth/roles";
import { parseAuthUserCookie } from "@/lib/auth/session";
import {
  buildSurfaceUrl,
  defaultPathForSurface,
  getHostSurface,
  getSurfaceForRole,
  isAuthPath,
  isPathAllowed,
} from "@/lib/hosts";

function redirectTo(request: NextRequest, absoluteOrPath: string) {
  if (absoluteOrPath.startsWith("http://") || absoluteOrPath.startsWith("https://")) {
    return NextResponse.redirect(absoluteOrPath);
  }

  const url = request.nextUrl.clone();
  url.pathname = absoluteOrPath;
  url.search = "";
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostHeader = request.headers.get("host") ?? "localhost";
  const surface = getHostSurface(hostHeader);

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // 1) Hostname decides product surface + allowed routes
  if (!isPathAllowed(surface, pathname)) {
    if (surface === "public") {
      if (pathname.startsWith("/admin")) {
        return redirectTo(request, buildSurfaceUrl("superadmin", pathname, hostHeader));
      }
      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/events") ||
        pathname.startsWith("/venues") ||
        pathname.startsWith("/customers")
      ) {
        return redirectTo(request, buildSurfaceUrl("organiser", pathname, hostHeader));
      }
    }

    return redirectTo(request, defaultPathForSurface(surface));
  }

  // Public host: no login required
  if (surface === "public") {
    return NextResponse.next();
  }

  // Auth screens stay reachable on app/admin hosts
  if (isAuthPath(pathname)) {
    return NextResponse.next();
  }

  // 2) app.* / admin.* require a logged-in user with the matching role
  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const user = parseAuthUserCookie(request.cookies.get(AUTH_USER_KEY)?.value);

  if (!token || !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessSurface(surface, user)) {
    const role = getPrimaryRole(user);
    const homeSurface = getSurfaceForRole(role);
    const homePath = defaultPathForSurface(homeSurface);
    return redirectTo(request, buildSurfaceUrl(homeSurface, homePath, hostHeader));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
