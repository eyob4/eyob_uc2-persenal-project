import { NextResponse } from "next/server";
import { verifyToken, AUTH_COOKIE } from "@/lib/jwt";

// Route groups don't appear in the URL, so (dashboard)/admin -> /admin, etc.
const ROUTE_ROLE_MAP = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/teacher", roles: ["teacher"] },
  { prefix: "/student", roles: ["student"] },
  { prefix: "/parent", roles: ["parent"] },
];
const AUTH_PAGES = ["/login", "/register"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;

  const protectedMatch = ROUTE_ROLE_MAP.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/")
  );

  if (protectedMatch) {
    if (!payload) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (!protectedMatch.roles.includes(payload.role)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (payload && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL(`/${payload.role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|css|js)$).*)",
  ],
};
