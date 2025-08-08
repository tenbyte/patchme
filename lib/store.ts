import { compareVersions } from "./utils-versions"

// helpers
function generateApiKey() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let s = ""
  for (let i = 0; i < 7; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `pm_${s}`
}

function generateSessionToken(userId: string) {
  // Include userId in the token so we can recover sessions across reloads (demo only)
  return `uid:${userId}:${crypto.randomUUID()}`
}

// Core types
export type SystemVarValue = string | string[]

export type System = {
  id: string
  name: string
  hostname: string
  tags: string[]
  apiKey: string
  lastSeen?: string
  variables: Record<string, SystemVarValue>
  allowedVariables: string[] // global variables accepted by ingest for this system
}

export type Baseline = {
  id: string
  name: string
  variable: string
  minVersion: string
}

export type GlobalVar = { id: string; name: string; description?: string }
export type Tag = { id: string; name: string }

export type ActivityEntry = { name: string; value?: string; values?: string[] }
export type ActivityLog = {
  id: string
  systemId?: string
  systemName?: string
  timestamp: string
  entries: ActivityEntry[]
}

export type Counts = {
  total: number
  ok: number
  warnings: number
}

export type User = {
  id: string
  name: string
  email: string
  password: string // NOTE: plain text for demo only
  role: "admin" | "user"
}

type StoreShape = {
  systems: System[]
  baselines: Baseline[]
  activity: ActivityLog[]
  tags: Tag[]
  globals: GlobalVar[]
  users: User[]
  sessions: Record<string, string> // token -> userId
}

const g = globalThis as unknown as { __PATCHME_STORE__?: StoreShape }

// seed
if (!g.__PATCHME_STORE__) {
  const now = new Date()
  g.__PATCHME_STORE__ = {
    systems: [
      {
        id: crypto.randomUUID(),
        name: "Nextcloud",
        hostname: "https://cloud.acme.com",
        tags: ["prod", "eu-central"],
        apiKey: generateApiKey(),
        lastSeen: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        variables: {
          PHP_Version: "8.2.20",
          MariaDB_Version: "10.6.18",
          NC_Version: "28.0.6",
        },
        allowedVariables: ["PHP_Version", "MariaDB_Version", "NC_Version"],
      },
      {
        id: crypto.randomUUID(),
        name: "Plesk",
        hostname: "https://panel.acme.com",
        tags: ["prod"],
        apiKey: generateApiKey(),
        variables: { Plesk: "18.0.70" },
        allowedVariables: ["Plesk"],
      },
      {
        id: crypto.randomUUID(),
        name: "Linux",
        hostname: "https://srv01.acme.com",
        tags: ["staging"],
        apiKey: generateApiKey(),
        variables: { Kernel: "6.8.12" },
        allowedVariables: ["Kernel"],
      },
    ],
    baselines: [
      { id: crypto.randomUUID(), name: "PHP", variable: "PHP_Version", minVersion: "8.3" },
      { id: crypto.randomUUID(), name: "MariaDB", variable: "MariaDB_Version", minVersion: "10.11" },
      { id: crypto.randomUUID(), name: "Nextcloud", variable: "NC_Version", minVersion: "29.0" },
    ],
    activity: [],
    tags: [
      { id: crypto.randomUUID(), name: "prod" },
      { id: crypto.randomUUID(), name: "eu-central" },
      { id: crypto.randomUUID(), name: "staging" },
    ],
    globals: [
      { id: crypto.randomUUID(), name: "PHP_Version" },
      { id: crypto.randomUUID(), name: "MariaDB_Version" },
      { id: crypto.randomUUID(), name: "NC_Version" },
      { id: crypto.randomUUID(), name: "Plesk" },
      { id: crypto.randomUUID(), name: "Kernel" },
    ],
    users: [
      {
        id: crypto.randomUUID(),
        name: "Admin",
        email: "admin@example.com",
        password: "admin", // demo only
        role: "admin",
      },
    ],
    sessions: {},
  }
}

function store() {
  return g.__PATCHME_STORE__!
}

// Users
export async function getUsers() {
  return store().users.sort((a, b) => a.name.localeCompare(b.name))
}
export async function addUser(input: { name: string; email: string; password: string; role: "admin" | "user" }) {
  const exists = store().users.find((u) => u.email.toLowerCase() === input.email.toLowerCase())
  if (exists) throw new Error("Email already exists")
  const u: User = { id: crypto.randomUUID(), ...input }
  store().users.push(u)
  return u
}
export async function updateUserById(input: { id: string; name: string; email: string; password?: string; role: "admin" | "user" }) {
  const u = store().users.find((x) => x.id === input.id)
  if (!u) throw new Error("User not found")
  const conflict = store().users.find((x) => x.email.toLowerCase() === input.email.toLowerCase() && x.id !== input.id)
  if (conflict) throw new Error("Email already exists")
  u.name = input.name
  u.email = input.email
  u.role = input.role
  if (typeof input.password === "string" && input.password.length > 0) {
    u.password = input.password
  }
}
export async function deleteUserById(id: string) {
  store().users = store().users.filter((x) => x.id !== id)
}
export async function findUserByEmail(email: string) {
  return store().users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}
export async function getUserById(id: string) {
  return store().users.find((u) => u.id === id)
}

// Sessions (unused in demo but kept)
export async function createSession(userId: string) {
  const token = generateSessionToken(userId)
  store().sessions[token] = userId
  return token
}
export async function deleteSession(token: string) {
  delete store().sessions[token]
}
export async function getUserForSession(token: string) {
  const fromMap = store().sessions[token]
  if (fromMap) return getUserById(fromMap)
  if (token.startsWith("uid:")) {
    const parts = token.split(":")
    const userId = parts[1]
    if (userId) {
      return getUserById(userId)
    }
  }
  return undefined
}

// Queries
export async function getSystems() { return store().systems }
export async function getBaselines() { return store().baselines }
export async function getActivity() { return store().activity.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)) }
export async function getTags() { return store().tags.sort((a, b) => a.name.localeCompare(b.name)) }
export async function getTagNames() { return (await getTags()).map((t) => t.name) }
export async function getGlobalVars() { return store().globals.sort((a, b) => a.name.localeCompare(b.name)) }

// Status
export function getStatusForSystem(s: System): "Ok" | "Warning" {
  const baselines = store().baselines
  for (const b of baselines) {
    const val = s.variables[b.variable]
    if (val === undefined) continue
    const v = Array.isArray(val) ? v[0] : val
    if (compareVersions(String(v), b.minVersion) < 0) {
      return "Warning"
    }
  }
  return "Ok"
}
export async function getSystemStatusCounts() {
  const systems = store().systems
  let ok = 0
  let warnings = 0
  for (const s of systems) {
    const st = getStatusForSystem(s)
    if (st === "Ok") ok++
    else warnings++
  }
  return { total: systems.length, ok, warnings }
}

// Systems
export async function addSystem(input: {
  name: string
  hostname: string
  tags: string[]
  selectedGlobalVars: string[]
}) {
  const sys: System = {
    id: crypto.randomUUID(),
    name: input.name,
    hostname: input.hostname,
    tags: input.tags,
    apiKey: generateApiKey(),
    variables: {},
    allowedVariables: Array.from(new Set(input.selectedGlobalVars)),
  }
  for (const key of sys.allowedVariables) {
    if (!store().globals.find((g) => g.name === key)) {
      store().globals.push({ id: crypto.randomUUID(), name: key })
    }
  }
  for (const t of sys.tags) {
    if (!store().tags.find((x) => x.name === t)) {
      store().tags.push({ id: crypto.randomUUID(), name: t })
    }
  }
  store().systems.push(sys)
  return sys
}
export async function updateSystemById(input: {
  id: string
  name: string
  hostname: string
  tags: string[]
  allowedVariables: string[]
}) {
  const s = store().systems.find((x) => x.id === input.id)
  if (!s) throw new Error("System not found")
  s.name = input.name
  s.hostname = input.hostname
  s.tags = input.tags
  s.allowedVariables = Array.from(new Set(input.allowedVariables))
  for (const key of s.allowedVariables) {
    if (!store().globals.find((g) => g.name === key)) {
      store().globals.push({ id: crypto.randomUUID(), name: key })
    }
  }
}
export async function deleteSystemById(id: string) {
  const s = store()
  s.systems = s.systems.filter((x) => x.id !== id)
}
export async function rotateKey(id: string) {
  const sys = store().systems.find((x) => x.id === id)
  if (!sys) throw new Error("System not found")
  sys.apiKey = generateApiKey()
  return sys.apiKey
}

// Baselines
export async function addBaseline(input: { name: string; variable: string; minVersion: string }) {
  const b: Baseline = { id: crypto.randomUUID(), ...input }
  store().baselines.push(b)
  if (!store().globals.find((g) => g.name === input.variable)) {
    store().globals.push({ id: crypto.randomUUID(), name: input.variable })
  }
  return b
}
export async function updateBaselineById(input: { id: string; name: string; variable: string; minVersion: string }) {
  const b = store().baselines.find((x) => x.id === input.id)
  if (!b) throw new Error("Baseline not found")
  b.name = input.name
  b.variable = input.variable
  b.minVersion = input.minVersion
  if (!store().globals.find((g) => g.name === input.variable)) {
    store().globals.push({ id: crypto.randomUUID(), name: input.variable })
  }
}
export async function deleteBaselineById(id: string) {
  store().baselines = store().baselines.filter((x) => x.id !== id)
}

// Tags
export async function addTag(name: string) {
  if (!store().tags.find((t) => t.name === name)) {
    store().tags.push({ id: crypto.randomUUID(), name })
  }
}
export async function updateTagById(id: string, name: string) {
  const t = store().tags.find((x) => x.id === id)
  if (!t) throw new Error("Tag not found")
  t.name = name
}
export async function deleteTagById(id: string) {
  store().tags = store().tags.filter((x) => x.id !== id)
}

// Ingest
export async function ingestEntries(
  apiKey: string,
  entries: { name: string; value?: string; values?: string[] }[]
): Promise<{ ok: boolean; updated?: number; status?: number; error?: string }> {
  const sys = store().systems.find((s) => s.apiKey === apiKey)
  if (!sys) {
    store().activity.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      entries,
      systemName: "Unknown (invalid key)",
    })
    return { ok: false, status: 403, error: "Invalid API key" }
  }
  const allowed = new Set(sys.allowedVariables)
  let updated = 0
  for (const e of entries) {
    if (!e || typeof e.name !== "string") continue
    if (!allowed.has(e.name)) continue
    if (e.value !== undefined) {
      sys.variables[e.name] = e.value
      updated++
    } else if (Array.isArray(e.values)) {
      sys.variables[e.name] = e.values
      updated++
    }
  }
  sys.lastSeen = new Date().toISOString()
  store().activity.push({
    id: crypto.randomUUID(),
    timestamp: sys.lastSeen,
    systemId: sys.id,
    systemName: sys.name,
    entries,
  })
  return { ok: true, updated }
}

// Mock generator
export async function mockActivity() {
  const s = store().systems[0]
  if (!s) return
  const candidates = s.allowedVariables.length ? s.allowedVariables : Object.keys(s.variables)
  if (candidates.length === 0) return
  const pick = candidates[Math.floor(Math.random() * candidates.length)]
  const current = s.variables[pick]
  let next = "1.0.0"
  if (typeof current === "string") {
    const parts = current.split(".").map((x) => parseInt(x || "0", 10))
    parts[parts.length - 1] = (parts[parts.length - 1] || 0) + 1
    next = parts.join(".")
  } else if (Array.isArray(current) && current.length > 0) {
    next = String(current[0])
  }
  await ingestEntries(s.apiKey, [{ name: pick, value: next }])
}
