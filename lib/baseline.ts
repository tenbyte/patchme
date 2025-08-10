import { PrismaClient } from "@/lib/generated/prisma/client"
import type { Baseline } from "@/lib/types"

const prisma = new PrismaClient()

export async function getBaselines(): Promise<Baseline[]> {
  const baselines = await prisma.baseline.findMany({ orderBy: { name: "asc" } })
  return baselines.map(baseline => ({
    ...baseline,
    type: baseline.type as "MIN" | "MAX" | "INFO"
  }))
}

export async function createBaseline({ name, variable, type, minVersion }: { name: string; variable: string; type: string; minVersion: string }) {
  return prisma.baseline.create({ data: { name, variable, type, minVersion } })
}

export async function updateBaselineById({ id, name, variable, type, minVersion }: { id: string; name: string; variable: string; type: string; minVersion: string }) {
  return prisma.baseline.update({ where: { id }, data: { name, variable, type, minVersion } })
}

export async function deleteBaselineById(id: string) {
  return prisma.baseline.delete({ where: { id } })
}
