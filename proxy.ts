import { NextResponse, type NextRequest } from "next/server";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/auth/constants";
import {
  isOrganisationApproved,
  isOrganisationPendingApproval,
} from "@/lib/auth/organisationApproval";
import { canAccessSurface, getPrimaryScope } from "@/lib/auth/roles";
import { parseAuthUserCookie } from "@/lib/auth/session";
import {
  buildSurfaceUrl,
  defaultPathForSurface,
  getHostSurface,
  getSurfaceForScope,
  isAuthPath,
  isPathAllowed,
  isSafeNextPath,
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

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/backend")
  ) {
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
        pathname.startsWith("/customers") ||
        pathname.startsWith("/site") ||
        pathname.startsWith("/clubsite") ||
        pathname.startsWith("/roles") ||
        pathname.startsWith("/staff") ||
        pathname.startsWith("/finance") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/whitelabels")
      ) {
        return redirectTo(request, buildSurfaceUrl("organiser", pathname, hostHeader));
      }
    }

    return redirectTo(request, defaultPathForSurface(surface));
  }

  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const user = parseAuthUserCookie(request.cookies.get(AUTH_USER_KEY)?.value);
  const isAuthenticated = Boolean(token && user);

  // Public host: always open (guest or any session)
  if (surface === "public") {
    return NextResponse.next();
  }

  const isUnderReviewPath =
    pathname === "/account-under-review" || pathname.startsWith("/account-under-review/");

  // Already signed into this workspace → skip auth screens (except under-review while pending).
  if (isAuthPath(pathname) && isAuthenticated && canAccessSurface(surface, user)) {
    if (isUnderReviewPath) {
      // Approved organisers should not stay on under-review.
      if (isOrganisationApproved(user)) {
        return redirectTo(request, "/dashboard");
      }
      // Pending (or status unknown) — allow the under-review page.
      return NextResponse.next();
    }

    if (isOrganisationPendingApproval(user)) {
      return redirectTo(request, "/account-under-review");
    }

    const nextParam = request.nextUrl.searchParams.get("next");
    const destination = isSafeNextPath(nextParam)
      ? nextParam
      : defaultPathForSurface(surface);
    return redirectTo(request, destination);
  }

  if (isAuthPath(pathname)) {
    return NextResponse.next();
  }

  // 2) app.* / admin.* require matching workspace session
  if (!isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessSurface(surface, user)) {
    // Wrong workspace token — send them to the host that matches their current scope
    const scope = getPrimaryScope(user);
    const homeSurface = getSurfaceForScope(scope);
    const homePath = defaultPathForSurface(homeSurface);
    return redirectTo(request, buildSurfaceUrl(homeSurface, homePath, hostHeader));
  }

  // Live cookie status: keep unapproved organisers off dashboard routes.
  if (surface === "organiser" && isOrganisationPendingApproval(user)) {
    return redirectTo(request, "/account-under-review");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
