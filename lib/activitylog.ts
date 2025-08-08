import { PrismaClient } from "@/lib/generated/prisma/client"

const prisma = new PrismaClient()

export async function logSystemActivity({ systemId, action, meta }: { systemId: string; action: string; meta?: any }) {
  await prisma.activityLog.create({
    data: {
      systemId,
      action,
      meta: meta ? JSON.stringify(meta) : null,
    },
  })
}

export async function getActivityLogs(limit = 100) {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { system: { select: { name: true } } },
  })
  return logs.map((log) => ({
    id: log.id,
    systemId: log.systemId,
    systemName: log.system?.name ?? null,
    action: log.action,
    meta: log.meta ? JSON.parse(log.meta) : null,
    createdAt: log.createdAt.toISOString(),
  }))
}
