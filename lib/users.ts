import { PrismaClient } from "./generated/prisma/client"
import type { User } from "@/lib/types"
import { jwtVerify } from "jose"

const prisma = new PrismaClient()
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "")

export async function getUserForSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id: payload.userId,
      name: payload.name,
      role: payload.role,
      email: payload.email ?? "",
      password: "",
    } as User
  } catch {
    return null
  }
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
