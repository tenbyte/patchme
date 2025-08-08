import { NextRequest, NextResponse } from "next/server"
import { getSystems, createSystem, updateSystemById, deleteSystemById } from "@/lib/system"

export async function GET() {
  const systems = await getSystems()
  return NextResponse.json(systems)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const system = await createSystem(data)
  return NextResponse.json(system)
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID fehlt" }, { status: 400 })
  const data = await req.json()
  const system = await updateSystemById({ ...data, id })
  return NextResponse.json(system)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID fehlt" }, { status: 400 })
  await deleteSystemById(id)
  return NextResponse.json({ ok: true })
}
