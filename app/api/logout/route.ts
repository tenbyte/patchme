import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma/client"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get("pmsession")?.value
  if (sessionToken) {
    await prisma.session.deleteMany({ where: { token: sessionToken } })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set("pmsession", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}
