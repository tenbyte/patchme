import { NextRequest, NextResponse } from "next/server"
import { getBaselines, createBaseline, updateBaselineById, deleteBaselineById } from "@/lib/baseline"
import { PrismaClient } from "@/lib/generated/prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const variable = searchParams.get("variable")
  if (variable) {
    const exists = await prisma.baseline.findUnique({ where: { variable } })
    return NextResponse.json({ exists: !!exists })
  }
  const baselines = await getBaselines()
  return NextResponse.json(baselines)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  try {
    // Check if variable already exists
    const exists = await prisma.baseline.findUnique({ where: { variable: data.variable } })
    if (exists) {
      return NextResponse.json({ error: "A baseline with this variable already exists." }, { status: 409 })
    }
    const baseline = await createBaseline(data)
    return NextResponse.json(baseline)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create baseline." }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID fehlt" }, { status: 400 })
  const data = await req.json()
  const baseline = await updateBaselineById({ ...data, id })
  return NextResponse.json(baseline)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID fehlt" }, { status: 400 })
  await deleteBaselineById(id)
  return NextResponse.json({ ok: true })
}
