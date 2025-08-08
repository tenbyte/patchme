import UsersTable from "@/components/users-table"
import { cookies } from "next/headers"
import { getUserForSession, getUsers } from "@/lib/users"
import type { User } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("pmsession")?.value
  let user: User | undefined
  if (sessionToken) {
    user = await getUserForSession(sessionToken) as User | undefined
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
