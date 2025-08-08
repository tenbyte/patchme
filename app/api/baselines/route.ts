import { NextRequest, NextResponse } from "next/server"
import { getBaselines, createBaseline, updateBaselineById, deleteBaselineById } from "@/lib/baseline"

export async function GET() {
  const baselines = await getBaselines()
  return NextResponse.json(baselines)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const baseline = await createBaseline(data)
  return NextResponse.json(baseline)
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
