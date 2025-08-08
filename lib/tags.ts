import { PrismaClient } from "@/lib/generated/prisma/client"

const prisma = new PrismaClient()

export async function getTags() {
  return prisma.tag.findMany({ orderBy: { name: "asc" } })
}

export async function createTag(name: string) {
  return prisma.tag.create({ data: { name } })
}

export async function updateTagById(id: string, name: string) {
  return prisma.tag.update({ where: { id }, data: { name } })
}

export async function deleteTagById(id: string) {
  return prisma.tag.delete({ where: { id } })
}
