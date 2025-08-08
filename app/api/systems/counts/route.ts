import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma/client"
import { getStatusForSystem } from "@/lib/utils-versions"

const prisma = new PrismaClient()

export async function GET() {
  const systems = await prisma.system.findMany({
    include: {
      baselines: true,
      baselineValues: { include: { baseline: true } },
      tags: true,
    },
  })
  const baselines = await prisma.baseline.findMany()
  let ok = 0
  let warnings = 0
  for (const s of systems) {
    const status = getStatusForSystem(
      {
        ...s,
        baselines: s.baselines || [],
        baselineValues: s.baselineValues || [],
        lastSeen: s.lastSeen ? s.lastSeen.toISOString() : null,
      },
      baselines.map((b) => ({ variable: b.variable, minVersion: b.minVersion }))
    )
    if (status === "Ok") ok++
    if (status === "Warning") warnings++
  }
  return NextResponse.json({ total: systems.length, ok, warnings })
}
