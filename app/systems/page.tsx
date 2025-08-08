import TopBar from "@/components/topbar"
import SystemsTable from "@/components/systems-table"
import { getSystems } from "@/lib/store"

export const dynamic = "force-dynamic"

export default async function SystemsPage() {
  const systems = await getSystems()
  return (
    <main className="min-h-screen bg-background">
      <TopBar userName="Admin" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <SystemsTable systems={systems} />
      </div>
    </main>
  )
}
