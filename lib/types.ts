export type UserRole = "admin" | "user"

export type User = {
  id: string
  username?: string
  name: string
  email: string
  password: string
  role: UserRole
}
