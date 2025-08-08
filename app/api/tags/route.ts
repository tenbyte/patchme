import { NextRequest, NextResponse } from "next/server"
import { getTags, createTag, updateTagById, deleteTagById } from "@/lib/tags"


// GET /api/tags - Alle Tags abrufen
export async function GET() {
  const tags = await getTags()
  return NextResponse.json(tags)
}

// POST /api/tags - Tag anlegen
export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: "Name fehlt" }, { status: 400 })
  const tag = await createTag(name)
  return NextResponse.json(tag)
}

// PUT /api/tags?id=... - Tag umbenennen
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID fehlt" }, { status: 400 })
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: "Name fehlt" }, { status: 400 })
  const tag = await updateTagById(id, name)
  return NextResponse.json(tag)
}

// DELETE /api/tags?id=... - Tag löschen
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID fehlt" }, { status: 400 })
  await deleteTagById(id)
  return NextResponse.json({ ok: true })
}
