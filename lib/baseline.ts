import { PrismaClient } from "@/lib/generated/prisma/client"

const prisma = new PrismaClient()

export async function getBaselines() {
  return prisma.baseline.findMany({ orderBy: { name: "asc" } })
}

export async function createBaseline({ name, variable, minVersion }: { name: string; variable: string; minVersion: string }) {
  return prisma.baseline.create({ data: { name, variable, minVersion } })
}

export async function updateBaselineById({ id, name, variable, minVersion }: { id: string; name: string; variable: string; minVersion: string }) {
  return prisma.baseline.update({ where: { id }, data: { name, variable, minVersion } })
}

export async function deleteBaselineById(id: string) {
  return prisma.baseline.delete({ where: { id } })
}
