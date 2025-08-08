import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma/client"
import { logSystemActivity } from "@/lib/activitylog"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, versions } = body
    if (!key || !Array.isArray(versions)) {
      return NextResponse.json({ error: "Missing key or versions array." }, { status: 400 })
    }
    const system = await prisma.system.findFirst({ where: { apiKey: key }, include: { baselines: true } })
    if (!system) {
      return NextResponse.json({ error: "Invalid API key." }, { status: 401 })
    }
    for (const entry of versions) {
      const baseline = await prisma.baseline.findUnique({ where: { variable: entry.variable } })
      if (!baseline) continue
      await prisma.systemBaselineValue.upsert({
        where: { systemId_baselineId: { systemId: system.id, baselineId: baseline.id } },
        update: { value: entry.version },
        create: {
          systemId: system.id,
          baselineId: baseline.id,
          value: entry.version,
        },
      })
    }
    // lastSeen aktualisieren
    await prisma.system.update({ where: { id: system.id }, data: { lastSeen: new Date() } })
    // ActivityLog-Eintrag erzeugen
    await logSystemActivity({ systemId: system.id, action: "ingest", meta: { versions } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to ingest data." }, { status: 500 })
  }
}
