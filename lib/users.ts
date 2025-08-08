import { PrismaClient } from "./generated/prisma/client"
import type { User } from "@/lib/types"

const prisma = new PrismaClient()

export async function getUserForSession(token: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session || !session.user) return null
  return session.user as User
}

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany()
  return users as User[]
}

export async function createUser(input: { name: string; email: string; password: string; role: "admin" | "user" }) {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
    },
  })
}

export async function updateUserById(input: { id: string; name: string; email: string; password?: string; role: "admin" | "user" }) {
  const data: any = {
    name: input.name,
    email: input.email,
    role: input.role,
  }
  if (input.password && input.password.trim()) {
    data.password = input.password
  }
  return prisma.user.update({
    where: { id: input.id },
    data,
  })
}

export async function deleteUserById(id: string) {
  return prisma.user.delete({ where: { id } })
}
