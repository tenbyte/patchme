import { PrismaClient } from "@/lib/generated/prisma/client"
import type { System } from "@/lib/types"

const prisma = new PrismaClient()

export async function getSystems(): Promise<System[]> {
  const systems = await prisma.system.findMany({
    include: {
      tags: true,
      baselines: true,
      baselineValues: {
        include: { baseline: true }
      }
    },
    orderBy: { name: "asc" },
  })
  return systems.map((s) => ({
    ...s,
    lastSeen: s.lastSeen ? s.lastSeen.toISOString() : null,
    baselineValues: s.baselineValues.map((bv) => ({
      id: bv.id,
      baselineId: bv.baselineId,
      value: bv.value,
      baseline: {
        id: bv.baseline.id,
        name: bv.baseline.name,
        variable: bv.baseline.variable,
        minVersion: bv.baseline.minVersion,
      }
    }))
  }))
}

export async function getSystemStatusCounts(): Promise<{ total: number; ok: number; warnings: number }> {
  const systems = await getSystems()
  let ok = 0
  let warnings = 0
  for (const s of systems) {
    const status = s.baselines.length > 0 ? "Ok" : "Warning"
    if (status === "Ok") ok++
    if (status === "Warning") warnings++
  }
  return { total: systems.length, ok, warnings }
}

export async function getActivity() {
  const systems = await prisma.system.findMany({
    select: { id: true, name: true, lastSeen: true },
    orderBy: { lastSeen: "desc" },
  })
  return systems.map((s) => ({
    id: s.id,
    name: s.name,
    lastSeen: s.lastSeen ? s.lastSeen.toISOString() : null,
  }))
}

export async function createSystem({ name, hostname, tags, baselines, apiKey, baselineVersions }: {
  name: string
  hostname: string
  tags: string[]
  baselines: string[]
  apiKey: string
  baselineVersions: { baselineId: string, value: string }[]
}) {
  return prisma.system.create({
    data: {
      name,
      hostname,
      apiKey,
      tags: { connect: tags.map(id => ({ id })) },
      baselines: { connect: baselines.map(id => ({ id })) },
      baselineValues: {
        create: baselineVersions.map((bv) => ({
          baseline: { connect: { id: bv.baselineId } },
          value: bv.value,
        }))
      }
    },
    include: { tags: true, baselines: true, baselineValues: { include: { baseline: true } } },
  })
}

export async function updateSystemById({ id, name, hostname, tags, baselines, baselineVersions, rotateKey }: {
  id: string
  name?: string
  hostname?: string
  tags?: string[]
  baselines?: string[]
  baselineVersions?: { baselineId: string, value: string }[]
  rotateKey?: boolean
}) {
  const updateData: any = {}
  if (typeof name !== "undefined") updateData.name = name
  if (typeof hostname !== "undefined") updateData.hostname = hostname
  if (tags) updateData.tags = { set: tags.map(id => ({ id })) }
  if (baselines) updateData.baselines = { set: baselines.map(id => ({ id })) }
  if (rotateKey) {
    updateData.apiKey = "pm_" + Math.random().toString(36).slice(2, 10).toUpperCase()
  }
  // BaselineValues wie gehabt
  if (typeof baselineVersions !== "undefined") {
    await prisma.systemBaselineValue.deleteMany({ where: { systemId: id } })
    updateData.baselineValues = {
      create: baselineVersions.map((bv) => ({
        baseline: { connect: { id: bv.baselineId } },
        value: bv.value,
      }))
    }
  }
  const updated = await prisma.system.update({
    where: { id },
    data: updateData,
    include: { tags: true, baselines: true, baselineValues: { include: { baseline: true } } },
  })
  return updated
}

export async function deleteSystemById(id: string) {
  return prisma.system.delete({ where: { id } })
}
