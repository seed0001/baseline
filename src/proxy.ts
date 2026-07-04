import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/providers/portal")) {
    if (request.cookies.has("baseline_provider_session")) return NextResponse.next();
    return NextResponse.redirect(new URL("/providers/login", request.url));
  }

  if (request.cookies.has("baseline_staff_session")) return NextResponse.next();
  return NextResponse.redirect(new URL("/staff/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/providers/portal/:path*"],
};
