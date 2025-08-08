export type UserRole = "admin" | "user"

export type User = {
  id: string
  username?: string
  name: string
  email: string
  password: string
  role: UserRole
}

export type System = {
  id: string
  name: string
  hostname: string
  tags: { id: string; name: string }[]
  apiKey: string
  lastSeen?: string | null
  baselines: { id: string; name: string; variable: string; minVersion: string }[]
}

export type Tag = {
  id: string
  name: string
}

export type Baseline = {
  id: string
  name: string
  variable: string
  minVersion: string
}

export type ActivityLog = {
  id: string
  systemId: string
  systemName: string | null
  action: string
  meta: any | null
  createdAt: string
}

