import UsersTable from "@/components/users-table"
import { getUsers, getUserForSession } from "@/lib/store"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  // User aus Session holen
  const cookieStore = cookies()
  const sessionToken = (await cookieStore).get("session")?.value
  let user = null
  if (sessionToken) {
    user = await getUserForSession(sessionToken)
  }
  if (!user || user.role !== "admin") {
    return <main className="min-h-screen flex items-center justify-center text-xl">Nicht autorisiert</main>
  }
  const users = await getUsers()
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <UsersTable users={users} />
      </div>
    </main>
  )
}
