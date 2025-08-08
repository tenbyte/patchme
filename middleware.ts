import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "changeme-supersecret" // In Produktion als ENV setzen!

export function middleware(req: NextRequest) {
  const publicPaths = ["/login", "/api/login", "/api/ingest", "/favicon.svg"]
  if (publicPaths.some((p) => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }
  const token = req.cookies.get("pmsession")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  try {
    jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|public|api/login|api/ingest|login).*)"],
}
