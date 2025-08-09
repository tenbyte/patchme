import { NextRequest, NextResponse } from "next/server"
import {
  createUser,
  updateUserById,
  deleteUserById,
} from "@/lib/users"
import { PrismaClient } from "@/lib/generated/prisma/client"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "")

// POST /api/users
export async function POST(req: NextRequest) {
  const data = await req.json()
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10)
  }
  const user = await createUser(data)
  return NextResponse.json(user)
}

// PUT /api/users?id=...
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const data = await req.json()
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10)
  }
  const user = await updateUserById({ ...data, id })
  return NextResponse.json(user)
}

// DELETE /api/users?id=...
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  // User to delete
  const userToDelete = await prisma.user.findUnique({ where: { id } })
  if (!userToDelete) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Count admins
  const adminCount = await prisma.user.count({ where: { role: "admin" } })
  if (userToDelete.role === "admin" && adminCount <= 1) {
    return NextResponse.json({ error: "There must be at least one admin account." }, { status: 400 })
  }

  // Prevent self-delete
  const cookieStore = cookies()
  const sessionToken = (await cookieStore).get("pmsession")?.value
  let currentUserId = null
  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET)
      currentUserId = payload.userId
    } catch {}
  }
  if (currentUserId === id) {
    return NextResponse.json({ error: "Admins cannot delete their own account." }, { status: 400 })
  }

  await deleteUserById(id)
  return NextResponse.json({ ok: true })
}
