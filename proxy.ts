import { NextResponse, type NextRequest } from "next/server";
import { defaultPathForSurface, getHostSurface, isPathAllowed } from "@/lib/hosts";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const surface = getHostSurface(host);

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (isPathAllowed(surface, pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = defaultPathForSurface(surface);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
