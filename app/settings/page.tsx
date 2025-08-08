import TopBar from "@/components/topbar"
import UsersTable from "@/components/users-table"
import { getUsers } from "@/lib/store"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const users = await getUsers()
  return (
    <main className="min-h-screen bg-background">
      <TopBar userName="Admin" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <UsersTable users={users} />
      </div>
    </main>
  )
}
