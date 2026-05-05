import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  UserRole,
} from "./lib/auth-utils";
import { deleteCookie, getCookie } from "./services/auth/tokenHandler";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // const accessToken = request.cookies.get("accessToken")?.value || null;
  const accessToken = (await getCookie("accessToken")) || null;

  let userRole: UserRole | null = null;
  if (accessToken) {
    const verifiedToken: JwtPayload | string = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string,
    );

    if (typeof verifiedToken === "string") {
      await deleteCookie("accessToken");
      await deleteCookie("refreshToken");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    userRole = verifiedToken.role;
  }

  const routerOwner = getRouteOwner(pathname);
  //path = /doctor/appointments => "DOCTOR"
  //path = /my-profile => "COMMON"
  //path = /login => null

  const isAuth = isAuthRoute(pathname);

  // Rule 1 : User is logged in and trying to access auth route. Redirect to default dashboard
  if (accessToken && isAuth) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
    );
  }

  // Rule 2 : User is trying to access open public route
  if (routerOwner === null) {
    return NextResponse.next();
  }

  // Rule 1 & 2 for open public routes and auth routes

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rule 3 : User is trying to access common protected route
  if (routerOwner === "COMMON") {
    return NextResponse.next();
  }

  // Rule 4 : User is trying to access role based protected route
  if (
    routerOwner === "ADMIN" ||
    routerOwner === "DOCTOR" ||
    routerOwner === "PATIENT"
  ) {
    if (userRole !== routerOwner) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }
  }
  console.log(userRole);

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Nicher file gulo bade sokol page er visit korar age ai proxy file a aste hobe and kono user oi page a jawer jonno allow kina check kore jete hobe.
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
