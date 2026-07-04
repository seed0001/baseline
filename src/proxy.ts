import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.cookies.has("baseline_staff_session")) return NextResponse.next();
  return NextResponse.redirect(new URL("/staff/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};
