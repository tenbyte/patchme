import { NextRequest, NextResponse } from "next/server"
import {
  createUser,
  updateUserById,
  deleteUserById,
} from "@/lib/users"


// POST /api/users - User anlegen
export async function POST(req: NextRequest) {
  const data = await req.json()
  const user = await createUser(data)
  return NextResponse.json(user)
}

// PUT /api/users?id=... - User aktualisieren
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const data = await req.json()
  const user = await updateUserById({ ...data, id })
  return NextResponse.json(user)
}

// DELETE /api/users?id=... - User löschen
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  await deleteUserById(id)
  return NextResponse.json({ ok: true })
}
