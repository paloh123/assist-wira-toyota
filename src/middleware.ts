import { auth } from "@/lib/auth";
import { canWrite } from "@/lib/roles";
import { NextResponse } from "next/server";

const writePages = ["/import", "/plan", "/fix", "/export", "/settings", "/users"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protected routes require session
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    writePages.some((route) => pathname === route || pathname.startsWith(`${route}/`)) &&
    !canWrite(req.auth.user?.role)
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
