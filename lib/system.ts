import { PrismaClient } from "@/lib/generated/prisma/client"
import type { System } from "@/lib/types"

const prisma = new PrismaClient()

export async function getSystems(): Promise<System[]> {
  const systems = await prisma.system.findMany({
    include: { tags: true, baselines: true },
    orderBy: { name: "asc" },
  })
  // lastSeen zu string konvertieren
  return systems.map((s) => ({
    ...s,
    lastSeen: s.lastSeen ? s.lastSeen.toISOString() : null,
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

export async function createSystem({ name, hostname, tags, baselines, apiKey }: {
  name: string
  hostname: string
  tags: string[]
  baselines: string[]
  apiKey: string
}) {
  return prisma.system.create({
    data: {
      name,
      hostname,
      apiKey,
      tags: { connect: tags.map(id => ({ id })) },
      baselines: { connect: baselines.map(id => ({ id })) },
    },
    include: { tags: true, baselines: true },
  })
}

export async function updateSystemById({ id, name, hostname, tags, baselines }: {
  id: string
  name: string
  hostname: string
  tags: string[]
  baselines: string[]
}) {
  return prisma.system.update({
    where: { id },
    data: {
      name,
      hostname,
      tags: { set: tags.map(id => ({ id })) },
      baselines: { set: baselines.map(id => ({ id })) },
    },
    include: { tags: true, baselines: true },
  })
}

export async function deleteSystemById(id: string) {
  return prisma.system.delete({ where: { id } })
}
