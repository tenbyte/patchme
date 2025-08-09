import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { COOKIE_NAME } from "@/middleware"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || ""
const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:3000"

const isHttps = PUBLIC_URL.startsWith("https://")

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

  const payload = {
    userId: user.id,
    name: user.name,
    role: user.role,
  }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })

  const url = new URL(PUBLIC_URL)
  const domain = url.hostname !== "localhost" ? url.hostname : undefined
  
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    domain: domain, 
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
