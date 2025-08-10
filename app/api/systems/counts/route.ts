import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/lib/generated/prisma/client"
import { getStatusForSystem } from "@/lib/utils-versions"

const prisma = new PrismaClient()

const allowedTypes = ["MIN", "MAX", "INFO"] as const;
type AllowedType = typeof allowedTypes[number];
function mapType(type: string | undefined): AllowedType | undefined {
  if (allowedTypes.includes(type as AllowedType)) return type as AllowedType;
  return undefined;
}

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
        baselines: s.baselines.map(b => ({ ...b, type: mapType(b.type) })) || [],
        baselineValues: s.baselineValues.map(bv => ({
          ...bv,
          baseline: { ...bv.baseline, type: mapType(bv.baseline.type) }
        })) || [],
        lastSeen: s.lastSeen ? s.lastSeen.toISOString() : null,
      },
      baselines.map((b) => ({ variable: b.variable, type: mapType(b.type), minVersion: b.minVersion }))
    )
    if (status === "Ok") ok++
    if (status === "Warning") warnings++
  }
  return NextResponse.json({ total: systems.length, ok, warnings })
}
