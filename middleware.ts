import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const publicPaths = ["/login", "/api/login"]
  if (publicPaths.some((p) => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }
  const sessionToken = req.cookies.get("pmsession")?.value
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|public|api/login|login).*)"],
}
