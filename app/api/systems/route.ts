import { NextRequest, NextResponse } from "next/server"
import { getSystems, createSystem, updateSystemById, deleteSystemById } from "@/lib/system"
import { PrismaClient } from "@/lib/generated/prisma/client"

const prisma = new PrismaClient()

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
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  try {
    await prisma.system.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    if (e.code === 'P2003') {
      return NextResponse.json({ error: "Das System kann nicht gelöscht werden, da noch abhängige Daten (z.B. Baseline-Werte, Logs) existieren." }, { status: 409 })
    }
    return NextResponse.json({ error: e.message || "Fehler beim Löschen" }, { status: 500 })
  }
}
