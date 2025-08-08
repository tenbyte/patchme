import TopBar from "@/components/topbar"
import BaselinesTable from "@/components/baselines-table"
import { getBaselines } from "@/lib/store"

export const dynamic = "force-dynamic"

export default async function BaselinesPage() {
  const baselines = await getBaselines()
  return (
    <main className="min-h-screen bg-background">
      <TopBar userName="Admin" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <BaselinesTable baselines={baselines} />
      </div>
    </main>
  )
}
