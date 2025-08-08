import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "changeme-supersecret"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  // JWT erzeugen
  const payload = {
    userId: user.id,
    name: user.name,
    role: user.role,
  }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })

  const res = NextResponse.json({ ok: true })
  res.cookies.set("pmsession", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
