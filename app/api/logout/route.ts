import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/middleware"

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.PUBLIC_URL?.startsWith("https://") ?? false,
    sameSite: "lax",
    path: "/",
    domain: process.env.PUBLIC_URL && new URL(process.env.PUBLIC_URL).hostname !== "localhost" ? new URL(process.env.PUBLIC_URL).hostname : undefined,
    maxAge: 0,
  })
  return res
}
