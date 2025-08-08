import { NextRequest, NextResponse } from "next/server"
import { getTags, createTag, updateTagById, deleteTagById } from "@/lib/tags"
import { PrismaClient } from "@/lib/generated/prisma/client"
const prisma = new PrismaClient()

// GET /api/tags - Alle Tags abrufen
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get("name")
  if (name) {
    const exists = await prisma.tag.findUnique({ where: { name } })
    return NextResponse.json({ exists: !!exists })
  }
  const tags = await getTags()
  return NextResponse.json(tags)
}

// POST /api/tags - Tag anlegen
export async function POST(req: NextRequest) {
  const data = await req.json()
  try {
    // Check if tag name already exists
    const exists = await prisma.tag.findUnique({ where: { name: data.name } })
    if (exists) {
      return NextResponse.json({ error: "A tag with this name already exists." }, { status: 409 })
    }
    const tag = await prisma.tag.create({ data })
    return NextResponse.json(tag)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create tag." }, { status: 500 })
  }
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
