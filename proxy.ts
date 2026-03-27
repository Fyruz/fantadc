import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";

export const proxy = auth(
  (
    req: NextRequest & {
      auth: { user?: { role?: string; id?: string } } | null;
    }
  ) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;
    const isAuthenticated = !!session?.user?.id;
    const isAdmin = session?.user?.role === UserRole.ADMIN;

    // Protezione area admin
    if (pathname.startsWith("/admin")) {
      if (!isAuthenticated) {
        return NextResponse.redirect(
          new URL("/login?next=" + encodeURIComponent(pathname), req.url)
        );
      }
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Protezione area utente autenticato
    const userPaths = ["/dashboard", "/squadra", "/vota"];
    if (userPaths.some((p) => pathname.startsWith(p))) {
      if (!isAuthenticated) {
        return NextResponse.redirect(
          new URL("/login?next=" + encodeURIComponent(pathname), req.url)
        );
      }
    }

    // Redirect autenticati via da login/register
    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/squadra/:path*",
    "/vota/:path*",
    "/login",
    "/register",
  ],
};
