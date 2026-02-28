import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const session = await getSession();

  // Protect the dashboard and any API route except auth
  // The dashboard is mounted at the root (`/`) via the `(dashboard)` route group.

  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  const isAuthApiRoute = request.nextUrl.pathname.startsWith("/api/auth/");

  // Define public routes that don't need protection
  const isPublicRoute =
    ["/login", "/register", "/landing"].includes(request.nextUrl.pathname) ||
    request.nextUrl.pathname.endsWith(".md") ||
    request.nextUrl.pathname.includes("_next");

  if (!isPublicRoute && (!isApiRoute || (isApiRoute && !isAuthApiRoute))) {
    if (!session) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/landing", request.url));
    }
  }

  // Redirect auth pages to the index (dashboard) if already logged in
  if (
    ["/login", "/register", "/landing"].includes(request.nextUrl.pathname) &&
    request.nextUrl.pathname !== "/"
  ) {
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
