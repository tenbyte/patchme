import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("pmsession")?.value
  const isLogin = req.nextUrl.pathname === "/login"

  let validToken = false
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET)
      validToken = true
    } catch {
      validToken = false
    }
  }

  if (isLogin && validToken) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (!validToken && !isLogin && !req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }


  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/ingest|api/login|login|favicon.svg|.*\\.js$|.*\\.css$|_next/).*)",
  ],
}
